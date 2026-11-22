import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadConfig, readContract } from '../src/config.js';
import { createBus } from '../src/core/bus.js';
import { createState } from '../src/core/state.js';
import { loadPlugins } from '../src/plugins/index.js';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-plugins-'));
after(() => fs.rmSync(dir, { recursive: true, force: true }));

fs.writeFileSync(path.join(dir, 'good.js'), `
export async function register({ bus, state, log }) {
  globalThis.__goodSeen = [];
  globalThis.__goodState = Object.keys(state).sort();
  const off = bus.on('reading', (r) => globalThis.__goodSeen.push(r.seq), 'good');
  return { close: async () => { globalThis.__goodClosed = true; off(); } };
}`);
fs.writeFileSync(path.join(dir, 'broken.js'), 'export async function register() { throw new Error("hỏng khi nạp"); }');
fs.writeFileSync(path.join(dir, 'noregister.js'), 'export const x = 1;');
fs.writeFileSync(path.join(dir, 'disabledone.js'), 'export function register() { globalThis.__disabledRan = true; }');
fs.writeFileSync(path.join(dir, '_draft.js'), 'export function register() { globalThis.__draftRan = true; }');
fs.writeFileSync(path.join(dir, 'notes.txt'), 'không phải plugin');

test('nạp plugin hợp lệ, bỏ qua plugin lỗi / bị tắt / bắt đầu bằng "_", backend không sập', async () => {
  const errors = [];
  const log = { error: (m) => errors.push(m), warn() {}, info() {}, debug() {}, child() { return log; } };
  const bus = createBus(log);
  const state = createState({ bus });
  const config = loadConfig({ env: { PLUGINS_DISABLED: 'disabledone' }, contract: readContract() });

  const plugins = await loadPlugins({ bus, state, config, log, dir });
  assert.deepEqual(plugins.names, ['good']);
  assert.equal(errors.length, 2);
  assert.ok(errors.some((e) => e.includes('broken') && e.includes('hỏng khi nạp')));
  assert.ok(errors.some((e) => e.includes('noregister')));
  assert.equal(globalThis.__disabledRan, undefined);
  assert.equal(globalThis.__draftRan, undefined);

  // Plugin chỉ thấy các hàm đọc, không có applyReading / applyStatus
  assert.deepEqual(globalThis.__goodState, ['device', 'latest', 'led', 'snapshot']);

  state.applyReading({ receivedAt: new Date().toISOString(), seq: 7, temperature: 1, humidity: 50, co2: 500,
    sensors: { dht22: 'ok', mq135: 'ok' }, levels: {}, levelsSource: 'server' });
  assert.deepEqual(globalThis.__goodSeen, [7]);

  assert.deepEqual(await plugins.closeAll(), []); // không plugin nào lỗi khi đóng
  assert.equal(globalThis.__goodClosed, true);
});

test('thư mục plugin thật: _example.js không bị nạp, plugin firestore được nạp nhưng tự tắt khi chưa cấu hình', async () => {
  const log = { error() {}, warn() {}, info() {}, debug() {}, child() { return log; } };
  const bus = createBus(log);
  const plugins = await loadPlugins({ bus, state: createState({ bus }), config: loadConfig({ env: {}, contract: readContract() }), log });
  assert.deepEqual(plugins.names, ['firestore']);
  await plugins.closeAll();
});
