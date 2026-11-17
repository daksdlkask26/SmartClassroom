// Tích hợp thật: broker aedes trên cổng ngẫu nhiên + client MQTT của backend + một "ESP32" bằng mqtt.js.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import mqtt from 'mqtt';
import { loadConfig, readContract } from '../src/config.js';
import { createBus } from '../src/core/bus.js';
import { createState } from '../src/core/state.js';
import { createMqttClient } from '../src/mqtt/client.js';
import { startBroker } from '../scripts/dev-broker.js';

const warnings = [];
const log = { error: (...a) => warnings.push(a.join(' ')), warn: (...a) => warnings.push(a.join(' ')), info() {}, debug() {}, child() { return log; } };

let broker;
let backend;
let state;
let bus;
let config;
const devices = [];

function waitFor(event, predicate = () => true, ms = 3000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => { off(); reject(new Error(`Hết giờ chờ "${event}"`)); }, ms);
    const off = bus.on(event, (p) => { if (predicate(p)) { clearTimeout(t); off(); resolve(p); } });
  });
}

async function fakeEsp32(opts = {}) {
  const c = await mqtt.connectAsync(`mqtt://127.0.0.1:${broker.port}`, {
    clientId: `esp-test-${devices.length}`,
    will: { topic: config.topics.status, payload: Buffer.from('{"v":1,"online":false}'), qos: 1, retain: true },
    ...opts,
  });
  devices.push(c);
  return c;
}

before(async () => {
  broker = await startBroker({ port: 0, log: () => {} });
  config = loadConfig({ env: { MQTT_URL: `mqtt://127.0.0.1:${broker.port}` }, contract: readContract() });
  bus = createBus(log);
  state = createState({ bus });
  backend = createMqttClient({ config, state, log });
  for (let i = 0; i < 50 && backend.status() !== 'connected'; i++) await new Promise((r) => setTimeout(r, 50));
  await new Promise((r) => setTimeout(r, 100)); // đợi subscribe xong
});

after(async () => {
  for (const d of devices) await d.endAsync(true).catch(() => {});
  await backend.end();
  await broker.close();
});

test('backend kết nối được broker', () => {
  assert.equal(backend.status(), 'connected');
});

test('telemetry hợp lệ → phát sự kiện reading, thiết bị trực tuyến', async () => {
  const esp = await fakeEsp32();
  const got = waitFor('reading', (r) => r.seq === 101);
  await esp.publishAsync(config.topics.telemetry, JSON.stringify({ v: 1, seq: 101, uptimeS: 5, temperature: 27.5, humidity: 88, co2: 850, sensors: { dht22: 'ok', mq135: 'ok' } }));
  const r = await got;
  assert.equal(r.humidity, 88);
  assert.equal(r.levels.humidity, 'alert');
  assert.equal(state.device().online, true);
});

test('bản tin hỏng bị bỏ, có cảnh báo, backend vẫn chạy', async () => {
  const esp = await fakeEsp32();
  const before = warnings.length;
  let got = false;
  const off = bus.on('reading', (r) => { if (r.seq === 999) got = true; });
  await esp.publishAsync(config.topics.telemetry, '{"v":1,');
  await new Promise((r) => setTimeout(r, 200));
  off();
  assert.equal(got, false);
  assert.ok(warnings.length > before);
  assert.equal(backend.status(), 'connected');
});

test('ESP32 rớt mạng đột ngột → broker gửi LWT → thiết bị ngoại tuyến', async () => {
  const esp = await fakeEsp32();
  await esp.publishAsync(config.topics.status, JSON.stringify({ v: 1, online: true, fw: 't' }), { retain: true });
  await waitFor('device', (d) => d.online && d.fw === 't');
  const off = waitFor('device', (d) => !d.online);
  esp.stream.destroy(); // như rút điện: không gửi DISCONNECT
  const d = await off;
  assert.equal(d.reason, 'lwt');
});

test('trình tự như giả lập: status retained → chờ → telemetry, backend nhận đủ cả hai', async () => {
  const esp = await fakeEsp32();
  const gotStatus = waitFor('device', (d) => d.fw === 'seq-test' && d.online);
  const gotReading = waitFor('reading', (r) => r.seq === 202);
  await esp.publishAsync(config.topics.status, JSON.stringify({ v: 1, online: true, fw: 'seq-test', ssid: 'Phong_A12' }), { qos: 0, retain: true });
  await new Promise((r) => setTimeout(r, 300));
  await esp.publishAsync(config.topics.telemetry, JSON.stringify({ v: 1, seq: 202, uptimeS: 1, temperature: 27, humidity: 60, co2: 800, sensors: { dht22: 'ok', mq135: 'ok' } }));
  const d = await gotStatus;
  await gotReading;
  assert.equal(d.ssid, 'Phong_A12');
});

test('publishLedCmd gửi đúng topic led/cmd, không retained', async () => {
  const esp = await fakeEsp32();
  await esp.subscribeAsync(config.topics.ledCmd, { qos: 1 });
  const got = new Promise((resolve) => esp.on('message', (t, p, packet) => resolve({ t, p: JSON.parse(p), retain: packet.retain })));
  await backend.publishLedCmd({ v: 1, mode: 'test', on: true, color: '#00C9B7' });
  const m = await got;
  assert.equal(m.t, config.topics.ledCmd);
  assert.deepEqual(m.p, { v: 1, mode: 'test', on: true, color: '#00C9B7' });
  assert.equal(m.retain, false);
});
