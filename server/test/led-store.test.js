// Lưu bảng màu gửi gần nhất ra server/data/ (plan.md mục 6.4): backend khởi động lại vẫn biết ESP32 đang dùng bảng nào.
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import mqtt from 'mqtt';
import WebSocket from 'ws';
import { loadConfig, readContract } from '../src/config.js';
import { createLedStore } from '../src/core/led-store.js';
import { startServer } from '../src/server.js';
import { startBroker } from '../scripts/dev-broker.js';

const contract = readContract();
const DEFAULT = contract.led.defaultPalette;
const CUSTOM = { ...DEFAULT, humidity: ['#22E05A', '#FF7A00', '#FF2A2A'] };
const quiet = { error() {}, warn() {}, info() {}, debug() {}, child() { return quiet; } };

function spyLog() {
  const warns = [];
  const log = { ...quiet, warn: (m) => warns.push(m) };
  return { log, warns };
}

describe('led-store: đọc và ghi file', () => {
  let dir;
  before(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-ledstore-')); });
  after(() => fs.rmSync(dir, { recursive: true, force: true }));

  const store = (log = quiet, over = {}) => createLedStore({ dir, mode: 'sim', deviceId: 'sc-01', log, ...over });

  test('chưa có file → null, không báo lỗi', () => {
    const { log, warns } = spyLog();
    assert.equal(store(log).load(), null);
    assert.deepEqual(warns, []);
  });

  test('ghi rồi đọc lại đúng bảng màu và giờ gửi; tên file theo MODE và mã thiết bị', async () => {
    const s = store();
    assert.equal(path.basename(s.file), 'led-sim-sc-01.json');
    await s.save({ palette: CUSTOM, sentAt: '2026-11-19T08:00:00.000Z' });
    assert.deepEqual(store().load(), { palette: CUSTOM, sentAt: '2026-11-19T08:00:00.000Z' });
    assert.equal(fs.existsSync(`${s.file}.tmp`), false);
  });

  test('ghi liên tiếp → giữ lần cuối', async () => {
    const s = store();
    s.save({ palette: DEFAULT, sentAt: '2026-11-19T08:01:00.000Z' });
    await s.save({ palette: CUSTOM, sentAt: '2026-11-19T08:02:00.000Z' });
    assert.equal(store().load().sentAt, '2026-11-19T08:02:00.000Z');
  });

  test('MODE khác (live) không đọc bảng màu của giả lập', () => {
    assert.equal(store(quiet, { mode: 'live' }).load(), null);
  });

  test('file hỏng, sai thiết bị hoặc sai màu → bỏ qua và báo warn', () => {
    const s = store();
    const cases = [
      '{ không phải json',
      JSON.stringify({ v: 1, deviceId: 'sc-99', palette: CUSTOM, sentAt: '2026-11-19T08:00:00.000Z' }),
      JSON.stringify({ v: 1, deviceId: 'sc-01', palette: { ...CUSTOM, co2: ['cam', '#FFD400', '#FF2A2A'] }, sentAt: '2026-11-19T08:00:00.000Z' }),
      JSON.stringify({ v: 1, deviceId: 'sc-01', palette: CUSTOM, sentAt: 'hôm qua' }),
    ];
    for (const body of cases) {
      fs.writeFileSync(s.file, body);
      const { log, warns } = spyLog();
      assert.equal(store(log).load(), null, body);
      assert.equal(warns.length, 1, body);
    }
  });
});

describe('khởi động lại backend vẫn giữ bảng màu đã gửi', () => {
  let broker; let esp; let config; let dataDir; let pluginsDir;
  const apps = [];

  before(async () => {
    dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-ledstore-data-'));
    pluginsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-ledstore-plugins-'));
    broker = await startBroker({ port: 0, log: () => {} });
    config = loadConfig({ env: { PORT: '0', MQTT_URL: `mqtt://127.0.0.1:${broker.port}`, DATA_DIR: dataDir }, contract });
    // ESP32 giả: status retained online, ở chế độ Tự động
    esp = await mqtt.connectAsync(`mqtt://127.0.0.1:${broker.port}`, { clientId: 'sc-01-ledstore-test' });
    await esp.publishAsync(config.topics.status, JSON.stringify({ v: 1, online: true, ledMode: 'auto' }), { qos: 1, retain: true });
  });

  after(async () => {
    for (const a of apps) await a.close().catch(() => {});
    await esp?.endAsync(true).catch(() => {});
    await broker?.close();
    fs.rmSync(dataDir, { recursive: true, force: true });
    fs.rmSync(pluginsDir, { recursive: true, force: true });
  });

  async function boot() {
    const app = await startServer({ config, log: quiet, host: '127.0.0.1', pluginsDir });
    apps.push(app);
    for (let i = 0; i < 80 && !app.state.device().online; i++) await new Promise((r) => setTimeout(r, 25));
    return { app, base: `http://127.0.0.1:${app.port}` };
  }
  const post = (base, p, body) => fetch(base + p, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });

  test('Áp dụng → tắt backend → bật lại: state và tin hello có lại bảng màu, giờ gửi; chế độ để thiết bị báo', async () => {
    const first = await boot();
    assert.equal(first.app.state.led().palette, null, 'lần đầu chưa có file');

    const res = await post(first.base, '/api/led/palette', { palette: CUSTOM });
    assert.equal(res.status, 202);
    const { sentAt } = await res.json();
    // Kiểm tra đèn không đổi bảng màu nên không ghi đè file
    assert.equal((await post(first.base, '/api/led/test', { mode: 'test', on: true, color: '#00C9B7' })).status, 202);
    await first.app.close();
    apps.length = 0;

    const saved = JSON.parse(fs.readFileSync(path.join(dataDir, 'led-sim-sc-01.json'), 'utf8'));
    assert.deepEqual(saved, { v: 1, deviceId: 'sc-01', mode: 'sim', palette: CUSTOM, sentAt });

    const second = await boot();
    assert.deepEqual(second.app.state.led(), { mode: null, palette: CUSTOM, test: null, sentAt });

    const ws = new WebSocket(`ws://127.0.0.1:${second.app.port}/ws`);
    const hello = await new Promise((resolve, reject) => {
      ws.on('message', (raw) => { const m = JSON.parse(raw.toString()); if (m.type === 'hello') resolve(m); });
      ws.once('error', reject);
    });
    ws.terminate();
    assert.deepEqual(hello.data.led.palette, CUSTOM);
    assert.equal(hello.data.led.sentAt, sentAt);
    assert.equal(hello.data.device.ledMode, 'auto');
  });
});
