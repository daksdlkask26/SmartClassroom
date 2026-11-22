// Dừng backend: ngắt MQTT trước khi đóng plugin, và báo "không sạch" khi có plugin lỗi lúc đóng
// (ví dụ plugin firestore còn bản tin không lưu được) để index.js thoát với mã 1.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadConfig, readContract } from '../src/config.js';
import { startServer } from '../src/server.js';
import { startBroker } from '../scripts/dev-broker.js';

const quiet = { error() {}, warn() {}, info() {}, debug() {}, child() { return quiet; } };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-shutdown-'));
after(() => fs.rmSync(tmp, { recursive: true, force: true }));

async function run(pluginSource) {
  const pluginsDir = fs.mkdtempSync(path.join(tmp, 'plugins-'));
  fs.writeFileSync(path.join(pluginsDir, 'probe.js'), pluginSource);
  const broker = await startBroker({ port: 0, log: () => {} });
  const config = loadConfig({
    env: { PORT: '0', MQTT_URL: `mqtt://127.0.0.1:${broker.port}`, DATA_DIR: fs.mkdtempSync(path.join(tmp, 'data-')) },
    contract: readContract(),
  });
  const app = await startServer({ config, log: quiet, host: '127.0.0.1', pluginsDir });
  for (let i = 0; i < 60 && app.mqtt.status() !== 'connected'; i++) await new Promise((r) => setTimeout(r, 50));
  assert.equal(app.mqtt.status(), 'connected');
  globalThis.__probeApp = app;
  try {
    return await app.close();
  } finally {
    await broker.close();
  }
}

test('dừng: MQTT đã ngắt khi plugin đóng (không còn bản tin mới lọt vào giữa); plugin đóng êm → clean', async () => {
  const result = await run(`
export function register() {
  return { close: async () => { globalThis.__mqttAtClose = globalThis.__probeApp.mqtt.status(); } };
}`);
  assert.equal(globalThis.__mqttAtClose, 'disconnected');
  assert.deepEqual(result, { clean: true });
});

test('dừng: plugin báo lỗi khi đóng → clean = false, các bước dừng khác vẫn chạy hết', async () => {
  const result = await run(`
export function register() {
  return { close: async () => { throw new Error('2 bản tin không lưu được'); } };
}`);
  assert.deepEqual(result, { clean: false });
});
