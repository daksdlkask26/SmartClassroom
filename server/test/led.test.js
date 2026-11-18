// G8 · Lệnh đèn LED: kiểm tra thân yêu cầu, mã lỗi REST và đường đi đầy đủ web → broker → ESP32 (contract mục 2.3, 6).
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mqtt from 'mqtt';
import WebSocket from 'ws';
import { loadConfig, readContract } from '../src/config.js';
import { createApp } from '../src/http/app.js';
import { createBus } from '../src/core/bus.js';
import { createState } from '../src/core/state.js';
import { normalizeHex, parsePaletteBody, parseTestBody } from '../src/core/led-cmd.js';
import { startServer } from '../src/server.js';
import { startBroker } from '../scripts/dev-broker.js';

const EXAMPLES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../contract/examples');
const example = (name) => JSON.parse(fs.readFileSync(path.join(EXAMPLES, name), 'utf8'));
const quiet = { error() {}, warn() {}, info() {}, debug() {}, child() { return quiet; } };
const DEFAULT = readContract().led.defaultPalette;

const post = (base, p, body) => fetch(base + p, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

describe('kiểm tra thân yêu cầu', () => {
  test('màu chỉ nhận #RRGGBB, trả về chữ hoa', () => {
    assert.equal(normalizeHex('#ff7a00'), '#FF7A00');
    for (const bad of ['ff7a00', '#f70', '#FF7A0', '#GG0000', 'red', null, 16711680]) assert.equal(normalizeHex(bad), null, String(bad));
  });

  test('bảng màu hợp lệ → lệnh giống contract/examples/led-cmd.palette.json', () => {
    const ex = example('led-cmd.palette.json');
    const r = parsePaletteBody({ palette: ex.palette });
    assert.equal(r.ok, true);
    assert.deepEqual(r.cmd, ex);
    assert.deepEqual(r.patch, { mode: 'auto', palette: ex.palette, test: null });
  });

  test('bảng màu thiếu thông số, thiếu mức hoặc sai màu → 422 INVALID_PALETTE', () => {
    const cases = [
      undefined, {}, { palette: [] }, { palette: 'x' },
      { palette: { temperature: DEFAULT.temperature, humidity: DEFAULT.humidity } },
      { palette: { ...DEFAULT, co2: ['#22E05A', '#FFD400'] } },
      { palette: { ...DEFAULT, humidity: ['#22E05A', 'vàng', '#FF2A2A'] } },
    ];
    for (const body of cases) {
      const r = parsePaletteBody(body);
      assert.equal(r.ok, false, JSON.stringify(body));
      assert.equal(r.status, 422);
      assert.equal(r.code, 'INVALID_PALETTE');
    }
  });

  test('Kiểm tra đèn và Về tự động giống contract/examples', () => {
    const t = parseTestBody({ mode: 'test', on: true, color: '#00c9b7' });
    assert.deepEqual(t.cmd, example('led-cmd.test.json'));
    assert.deepEqual(t.patch, { mode: 'test', test: { on: true, color: '#00C9B7' } });
    const a = parseTestBody({ mode: 'auto' });
    assert.deepEqual(a.cmd, example('led-cmd.auto.json'));
    assert.deepEqual(a.patch, { mode: 'auto', test: null }); // giữ bảng màu đã gửi
  });

  test('Kiểm tra đèn sai → 400 / 422 INVALID_COLOR', () => {
    assert.equal(parseTestBody({}).code, 'BAD_REQUEST');
    assert.equal(parseTestBody({ mode: 'blink' }).code, 'BAD_REQUEST');
    assert.equal(parseTestBody({ mode: 'test', on: 'yes', color: '#FFFFFF' }).code, 'BAD_REQUEST');
    const r = parseTestBody({ mode: 'test', on: true, color: '#12345' });
    assert.equal(r.status, 422);
    assert.equal(r.code, 'INVALID_COLOR');
  });
});

describe('REST /api/led/* (broker giả)', () => {
  let server; let base; let state; let sent; let failPublish;

  before(async () => {
    const config = loadConfig({ env: { PORT: '0' }, contract: readContract() });
    state = createState({ bus: createBus(quiet) });
    sent = [];
    const publishLedCmd = async (cmd) => {
      if (failPublish) throw Object.assign(new Error('down'), { code: 'MQTT_DOWN' });
      sent.push(cmd);
    };
    server = http.createServer(createApp({ config, log: quiet, state, publishLedCmd }));
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    base = `http://127.0.0.1:${server.address().port}`;
  });
  after(() => new Promise((r) => server.close(r)));

  test('thiết bị chưa từng trực tuyến / ngoại tuyến → 409 DEVICE_OFFLINE, không gửi gì', async () => {
    const res = await post(base, '/api/led/palette', { palette: DEFAULT });
    assert.equal(res.status, 409);
    assert.equal((await res.json()).error.code, 'DEVICE_OFFLINE');
    assert.equal(sent.length, 0);
  });

  test('thân sai được báo trước cả khi thiết bị ngoại tuyến', async () => {
    const res = await post(base, '/api/led/test', { mode: 'test', on: true, color: 'cam' });
    assert.equal(res.status, 422);
    assert.equal((await res.json()).error.code, 'INVALID_COLOR');
  });

  test('broker không nhận → 503 MQTT_DOWN, trạng thái LED không đổi', async () => {
    state.applyStatus({ online: true });
    failPublish = true;
    const res = await post(base, '/api/led/test', { mode: 'test', on: true, color: '#00C9B7' });
    failPublish = false;
    assert.equal(res.status, 503);
    assert.equal((await res.json()).error.code, 'MQTT_DOWN');
    assert.equal(state.led().sentAt, null);
  });

  test('gửi được → 202 { sentAt }, state.led ghi lệnh đã gửi', async () => {
    const res = await post(base, '/api/led/palette', { palette: { ...DEFAULT, humidity: ['#22e05a', '#ff7a00', '#ff2a2a'] } });
    assert.equal(res.status, 202);
    const { sentAt } = await res.json();
    assert.ok(!Number.isNaN(Date.parse(sentAt)));
    assert.deepEqual(sent.at(-1).palette.humidity, ['#22E05A', '#FF7A00', '#FF2A2A']);
    assert.equal(state.led().mode, 'auto');
    assert.equal(state.led().sentAt, sentAt);
  });
});

describe('toàn hệ thống: trang web → backend → broker → ESP32', () => {
  let broker; let app; let base; let esp; let ws; let config;
  // Thư mục plugin rỗng: không nạp plugin thật của đồng đội (Telegram, Firestore) khi kiểm thử
  const pluginsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-led-plugins-'));
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-led-data-')); // không ghi vào server/data/ thật
  const wsMsgs = [];

  before(async () => {
    broker = await startBroker({ port: 0, log: () => {} });
    config = loadConfig({ env: { PORT: '0', MQTT_URL: `mqtt://127.0.0.1:${broker.port}`, DATA_DIR: dataDir }, contract: readContract() });
    app = await startServer({ config, log: quiet, host: '127.0.0.1', pluginsDir });
    base = `http://127.0.0.1:${app.port}`;
    for (let i = 0; i < 60 && app.mqtt.status() !== 'connected'; i++) await new Promise((r) => setTimeout(r, 50));

    esp = await mqtt.connectAsync(`mqtt://127.0.0.1:${broker.port}`, { clientId: 'sc-01-led-test' });
    await esp.subscribeAsync(config.topics.ledCmd, { qos: 1 });
    await esp.publishAsync(config.topics.status, JSON.stringify({ v: 1, online: true, ledMode: 'auto' }), { qos: 1 });
    for (let i = 0; i < 60 && !app.state.device().online; i++) await new Promise((r) => setTimeout(r, 25));

    ws = new WebSocket(`ws://127.0.0.1:${app.port}/ws`);
    ws.on('message', (raw) => wsMsgs.push(JSON.parse(raw.toString())));
    await new Promise((r, j) => { ws.once('open', r); ws.once('error', j); });
  });

  after(async () => {
    ws?.terminate();
    await esp?.endAsync(true).catch(() => {});
    await app?.close();
    await broker?.close();
    fs.rmSync(pluginsDir, { recursive: true, force: true });
    fs.rmSync(dataDir, { recursive: true, force: true });
  });

  const nextCmd = () => new Promise((resolve) => esp.once('message', (t, p, packet) => resolve({ t, cmd: JSON.parse(p), retain: packet.retain })));
  const waitWs = async (pred) => {
    for (let i = 0; i < 80; i++) {
      const m = wsMsgs.find(pred);
      if (m) return m;
      await new Promise((r) => setTimeout(r, 25));
    }
    throw new Error('Hết giờ chờ tin WebSocket');
  };

  test('Áp dụng bảng màu: ESP32 nhận đúng 9 màu, không retained; trình duyệt nhận tin led', async () => {
    const got = nextCmd();
    const palette = { ...DEFAULT, humidity: ['#22E05A', '#FF7A00', '#FF2A2A'] };
    const res = await post(base, '/api/led/palette', { palette });
    assert.equal(res.status, 202);
    const { sentAt } = await res.json();
    const m = await got;
    assert.equal(m.t, config.topics.ledCmd);
    assert.deepEqual(m.cmd, { v: 1, mode: 'auto', palette });
    assert.equal(m.retain, false);
    const led = await waitWs((x) => x.type === 'led' && x.data.sentAt === sentAt);
    assert.deepEqual(led.data, { mode: 'auto', palette, test: null, sentAt });
  });

  test('Kiểm tra đèn rồi Về tự động: bảng màu đã gửi vẫn giữ', async () => {
    let got = nextCmd();
    assert.equal((await post(base, '/api/led/test', { mode: 'test', on: true, color: '#00C9B7' })).status, 202);
    assert.deepEqual((await got).cmd, { v: 1, mode: 'test', on: true, color: '#00C9B7' });
    assert.equal(app.state.led().mode, 'test');

    got = nextCmd();
    assert.equal((await post(base, '/api/led/test', { mode: 'auto' })).status, 202);
    assert.deepEqual((await got).cmd, { v: 1, mode: 'auto' });
    const led = app.state.led();
    assert.equal(led.mode, 'auto');
    assert.equal(led.test, null);
    assert.deepEqual(led.palette.humidity, ['#22E05A', '#FF7A00', '#FF2A2A']);
  });

  test('ESP32 rớt mạng (status online=false) → 409, broker không nhận lệnh nào', async () => {
    await esp.publishAsync(config.topics.status, JSON.stringify({ v: 1, online: false }), { qos: 1 });
    for (let i = 0; i < 60 && app.state.device().online; i++) await new Promise((r) => setTimeout(r, 25));
    let received = false;
    esp.once('message', () => { received = true; });
    const res = await post(base, '/api/led/palette', { palette: DEFAULT });
    assert.equal(res.status, 409);
    await new Promise((r) => setTimeout(r, 150));
    assert.equal(received, false);
  });
});
