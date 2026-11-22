import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig, readContract } from '../src/config.js';
import { createBus } from '../src/core/bus.js';
import { register } from '../src/plugins/firestore.js';
import { createMemoryFirestore } from './helpers/memory-firestore.js';

const contract = readContract();
const logs = [];
const log = { error: (...a) => logs.push(['error', ...a]), warn: (...a) => logs.push(['warn', ...a]), info: (...a) => logs.push(['info', ...a]), debug() {}, child() { return log; } };
const reading = (seq, over = {}) => ({
  receivedAt: '2026-11-22T08:15:00.000Z', seq, bootId: 'boot01', temperature: 27.5, humidity: 65, co2: 850,
  sensors: { dht22: 'ok', mq135: 'ok' }, levels: {}, levelsSource: 'server', ...over,
});
const withFirebase = (extra = {}) => loadConfig({ env: { FIREBASE_PROJECT_ID: 'demo-smartclassroom', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8085', ...extra }, contract });

test('chưa cấu hình Firebase: plugin tự tắt, không nghe sự kiện, không lỗi', async () => {
  logs.length = 0;
  const bus = createBus(log);
  const handle = await register({ bus, config: loadConfig({ env: {}, contract }), log, acquire: () => { throw new Error('không được gọi'); } });
  assert.equal(handle, undefined);
  assert.ok(logs.some((l) => l[0] === 'info' && /FIREBASE_PROJECT_ID/.test(l[1])));
  bus.emit('reading', reading(1)); // không ai nghe, không ném lỗi
});

test('có cấu hình: mỗi reading được ghi (collection _sim khi giả lập); close chờ ghi xong rồi trả kết nối', async () => {
  const fake = createMemoryFirestore();
  let released = 0;
  const bus = createBus(log);
  const handle = await register({
    bus, config: withFirebase(), log,
    acquire: () => ({ db: fake.db, release: async () => { released++; } }),
  });
  bus.emit('reading', reading(1));
  bus.emit('reading', reading(2));
  await handle.close();
  assert.equal(released, 1);
  const raw = [...fake.documents.keys()].filter((p) => p.startsWith('devices/sc-01/readings_sim/'));
  assert.equal(raw.length, 2);

  bus.emit('reading', reading(3)); // đã đóng: không ghi nữa
  await new Promise((r) => setImmediate(r));
  assert.equal([...fake.documents.keys()].filter((p) => p.startsWith('devices/sc-01/readings_sim/')).length, 2);
});

test('MODE=live ghi vào readings', async () => {
  const fake = createMemoryFirestore();
  const bus = createBus(log);
  const handle = await register({ bus, config: withFirebase({ MODE: 'live' }), log, acquire: () => ({ db: fake.db, release: async () => {} }) });
  bus.emit('reading', reading(1));
  await handle.close();
  assert.ok([...fake.documents.keys()].some((p) => p.startsWith('devices/sc-01/readings/')));
});

test('ghi lỗi chỉ được ghi log, không làm sập backend; bản tin sau vẫn được thử', async () => {
  logs.length = 0;
  const fake = createMemoryFirestore();
  fake.state.failures = [7]; // PERMISSION_DENIED: không thử lại
  const bus = createBus(log);
  const handle = await register({ bus, config: withFirebase(), log, acquire: () => ({ db: fake.db, release: async () => {} }) });
  bus.emit('reading', reading(1));
  await new Promise((r) => setTimeout(r, 20));
  bus.emit('reading', reading(2));
  // close vẫn chờ ghi xong và trả kết nối, nhưng báo lỗi để backend thoát với mã 1
  await assert.rejects(handle.close(), /1 bản tin không lưu được/);
  assert.equal(handle.failedWrites, 1);
  assert.ok(logs.some((l) => l[0] === 'error' && /#1/.test(l[1])));
  assert.equal([...fake.documents.keys()].filter((p) => p.includes('/readings_sim/')).length, 1);
});
