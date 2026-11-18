// Toàn hệ thống: broker aedes → startServer (MQTT + HTTP + WebSocket + plugin) → trình duyệt giả (ws).
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import mqtt from 'mqtt';
import WebSocket from 'ws';
import { loadConfig, readContract } from '../src/config.js';
import { startServer } from '../src/server.js';
import { startBroker } from '../scripts/dev-broker.js';

const quiet = { error() {}, warn() {}, info() {}, debug() {}, child() { return quiet; } };
const pluginsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-e2e-plugins-'));
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-e2e-data-')); // không ghi vào server/data/ thật
fs.writeFileSync(path.join(pluginsDir, 'spy.js'), `
export function register({ bus }) {
  globalThis.__spy = [];
  bus.on('reading', (r) => globalThis.__spy.push(r.seq), 'spy');
}`);

let broker; let app; let base; let wsUrl; let config;
const sockets = [];
const clients = [];

before(async () => {
  broker = await startBroker({ port: 0, log: () => {} });
  config = loadConfig({
    env: { PORT: '0', MQTT_URL: `mqtt://127.0.0.1:${broker.port}`, HISTORY_SEED_HOURS: '2', DATA_DIR: dataDir },
    contract: readContract(),
  });
  app = await startServer({ config, log: quiet, host: '127.0.0.1', pluginsDir });
  base = `http://127.0.0.1:${app.port}`;
  wsUrl = `ws://127.0.0.1:${app.port}/ws`;
  for (let i = 0; i < 60 && app.mqtt.status() !== 'connected'; i++) await new Promise((r) => setTimeout(r, 50));
  await new Promise((r) => setTimeout(r, 100));
});

after(async () => {
  for (const s of sockets) s.terminate();
  for (const c of clients) await c.endAsync(true).catch(() => {});
  await app.close();
  await broker.close();
  fs.rmSync(pluginsDir, { recursive: true, force: true });
  fs.rmSync(dataDir, { recursive: true, force: true });
});

/** Mở WebSocket và gom tin nhắn; trả về { ws, next(type, predicate) } */
async function browser(headers = {}) {
  const ws = new WebSocket(wsUrl, { headers });
  sockets.push(ws);
  const queue = [];
  const waiters = [];
  ws.on('message', (raw) => {
    const m = JSON.parse(raw.toString());
    const i = waiters.findIndex((w) => w.type === m.type && w.pred(m.data));
    if (i >= 0) waiters.splice(i, 1)[0].resolve(m); else queue.push(m);
  });
  await new Promise((resolve, reject) => { ws.once('open', resolve); ws.once('error', reject); });
  return {
    ws,
    next(type, pred = () => true, ms = 3000) {
      const i = queue.findIndex((m) => m.type === type && pred(m.data));
      if (i >= 0) return Promise.resolve(queue.splice(i, 1)[0]);
      return new Promise((resolve, reject) => {
        const w = { type, pred, resolve };
        waiters.push(w);
        setTimeout(() => { const k = waiters.indexOf(w); if (k >= 0) { waiters.splice(k, 1); reject(new Error(`Hết giờ chờ tin ${type}`)); } }, ms);
      });
    },
  };
}

async function esp32(id) {
  const c = await mqtt.connectAsync(`mqtt://127.0.0.1:${broker.port}`, {
    clientId: id, will: { topic: config.topics.status, payload: Buffer.from('{"v":1,"online":false}'), qos: 1, retain: true },
  });
  clients.push(c);
  return c;
}

const telemetry = (seq, humidity = 64.5) => JSON.stringify({ v: 1, seq, uptimeS: seq, temperature: 27.5, humidity, co2: 850, sensors: { dht22: 'ok', mq135: 'ok' } });

test('mở WebSocket nhận ngay tin hello đủ trường theo contract', async () => {
  const b = await browser();
  const hello = await b.next('hello');
  assert.ok(hello.at);
  assert.deepEqual(Object.keys(hello.data).sort(), ['config', 'device', 'latest', 'led', 'mode', 'serverTime']);
  assert.equal(hello.data.mode, 'sim');
  assert.equal(hello.data.config.contractVersion, readContract().contractVersion);
});

test('ESP32 gửi telemetry → mọi trình duyệt nhận tin reading; plugin cũng nhận', async () => {
  const [b1, b2] = [await browser(), await browser()];
  const esp = await esp32('e2e-esp-1');
  const p1 = b1.next('reading', (r) => r.seq === 501);
  const p2 = b2.next('reading', (r) => r.seq === 501);
  await esp.publishAsync(config.topics.telemetry, telemetry(501, 88));
  const [m1] = await Promise.all([p1, p2]);
  assert.equal(m1.data.humidity, 88);
  assert.equal(m1.data.levels.humidity, 'alert');
  assert.ok(globalThis.__spy.includes(501));
});

test('trình duyệt mở sau nhận bản tin mới nhất trong hello', async () => {
  const b = await browser();
  const hello = await b.next('hello');
  assert.equal(hello.data.latest.seq, 501);
  assert.equal(hello.data.device.online, true);
});

test('ESP32 rớt mạng → trình duyệt nhận tin device online=false (lwt)', async () => {
  const b = await browser();
  const esp = await esp32('e2e-esp-2');
  await esp.publishAsync(config.topics.telemetry, telemetry(502));
  await b.next('reading', (r) => r.seq === 502);
  const offline = b.next('device', (d) => d.online === false);
  esp.stream.destroy();
  const m = await offline;
  assert.equal(m.data.reason, 'lwt');
});

test('chặn WebSocket mở từ trang web khác (origin lạ)', async () => {
  const ws = new WebSocket(wsUrl, { headers: { Origin: 'https://trang-la.example' } });
  const code = await new Promise((resolve) => ws.once('unexpected-response', (_req, res) => resolve(res.statusCode)));
  assert.equal(code, 403);
  const ok = await browser({ Origin: base });
  assert.equal(ok.ws.readyState, WebSocket.OPEN);
});

test('REST: /api/config, /api/state, /api/session, /api/health', async () => {
  const cfg = await (await fetch(`${base}/api/config`)).json();
  assert.equal(cfg.timing.staleAfterS, 90);
  const st = await (await fetch(`${base}/api/state`)).json();
  assert.equal(st.latest.seq, 502);
  assert.equal(st.mode, 'sim');
  const ss = await (await fetch(`${base}/api/session`)).json();
  assert.deepEqual(ss, { authEnabled: false, user: { username: 'giangvien01' } });
  const h = await (await fetch(`${base}/api/health`)).json();
  assert.equal(h.mqtt, 'connected');
  assert.equal((await fetch(`${base}/api/state`)).headers.get('cache-control'), 'no-store');
});

test('REST: /api/history có dữ liệu gieo sẵn và bản tin vừa nhận; tham số sai → 400', async () => {
  const r = await fetch(`${base}/api/history?metric=humidity&bucket=hour&from=${new Date(Date.now() - 3 * 3600e3).toISOString()}`);
  assert.equal(r.status, 200);
  const body = await r.json();
  assert.equal(body.metric, 'humidity');
  assert.ok(body.points.length >= 3);
  assert.ok(body.points.some((p) => p.n > 0));

  const bad = await fetch(`${base}/api/history?metric=pm25`);
  assert.equal(bad.status, 400);
  assert.equal((await bad.json()).error.code, 'BAD_REQUEST');
});
