// Kiểm thử tích hợp với Firestore Emulator thật. Chạy: npm run test:integration (cần Java 21+).
// Không có Emulator thì các bài này tự bỏ qua, nên `npm test` thường vẫn chạy được.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig, readContract } from '../../src/config.js';
import { createBus } from '../../src/core/bus.js';
import { register } from '../../src/plugins/firestore.js';
import { create as createHistory } from '../../src/providers/history/firestore.js';
import { createFirestore } from '../../src/services/firestore/client.js';
import { createReadingStore } from '../../src/services/firestore/reading-store.js';

const host = process.env.FIRESTORE_EMULATOR_HOST;
const skip = host ? false : 'cần Emulator: chạy npm run test:integration';
const contract = readContract();
const quiet = { error() {}, warn() {}, info() {}, debug() {}, child() { return quiet; } };
const rd = (seq, iso, humidity, over = {}) => ({
  receivedAt: iso, seq, bootId: 'boot01', temperature: 27, humidity, co2: 800,
  sensors: { dht22: 'ok', mq135: 'ok' }, levels: { temperature: 'normal', humidity: 'normal', co2: 'normal' }, levelsSource: 'device', ...over,
});

async function withDb(fn) {
  const firebase = createFirestore({ projectId: 'demo-smartclassroom', emulatorHost: host });
  try {
    await fn(firebase.db);
  } finally {
    await firebase.close();
  }
}

test('ghi và đọc lại với Emulator thật: giờ trùng cộng dồn, bản gửi lại không bị đếm hai lần', { skip }, async () => {
  await withDb(async (db) => {
    const store = createReadingStore(db, { deviceId: 'itest-a', mode: 'live' });
    const first = await store.saveReading(rd(1, '2026-11-22T08:10:00.000Z', 60));
    const again = await store.saveReading(rd(1, '2026-11-22T08:10:00.000Z', 60));
    await store.saveReading(rd(2, '2026-11-22T08:40:00.000Z', 70));
    await store.saveReading(rd(3, '2026-11-22T09:05:00.000Z', 90, { co2: null }));

    assert.equal(first.duplicate, false);
    assert.equal(again.duplicate, true);
    const raw = await db.collection('devices/itest-a/readings').get();
    assert.equal(raw.size, 3);
    const saved = (await db.doc(`devices/itest-a/readings/${first.id}`).get()).data();
    assert.equal(saved.bootId, 'boot01');
    assert.equal(typeof saved.storedAt.toMillis(), 'number');

    const hours = await store.readHourly(Date.parse('2026-11-22T08:00:00Z'), Date.parse('2026-11-22T10:00:00Z'));
    assert.equal(hours.length, 2);
    assert.deepEqual(hours[0].humidity, { n: 2, sum: 130, min: 60, max: 70 });
    assert.deepEqual(hours[1].humidity, { n: 1, sum: 90, min: 90, max: 90 });
    assert.equal(hours[1].co2.n, 0); // số đo null không tính
  });
});

test('chống trùng khi nhiều bản tin giống hệt gửi đồng thời: chỉ một bản được lưu và cộng dồn một lần', { skip }, async () => {
  await withDb(async (db) => {
    const store = createReadingStore(db, { deviceId: 'itest-b', mode: 'live' });
    const results = await Promise.all(Array.from({ length: 5 }, () => store.saveReading(rd(7, '2026-11-22T08:10:00.000Z', 60))));
    assert.equal(results.filter((r) => !r.duplicate).length, 1);
    assert.equal((await db.collection('devices/itest-b/readings').get()).size, 1);
    const [h] = await store.readHourly(Date.parse('2026-11-22T08:00:00Z'), Date.parse('2026-11-22T09:00:00Z'));
    assert.equal(h.humidity.n, 1);
  });
});

test('plugin + provider đầu cuối: bus → Firestore → truy vấn lịch sử', { skip }, async () => {
  const config = loadConfig({
    env: { FIREBASE_PROJECT_ID: 'demo-smartclassroom', FIRESTORE_EMULATOR_HOST: host, MODE: 'live', DEVICE_ID: 'itest-c' },
    contract,
  });
  const bus = createBus(quiet);
  const plugin = await register({ bus, config, log: quiet });
  bus.emit('reading', rd(1, '2026-11-22T07:10:00.000Z', 60));
  bus.emit('reading', rd(2, '2026-11-22T07:40:00.000Z', 62));
  bus.emit('reading', rd(3, '2026-11-22T09:10:00.000Z', 88));
  await plugin.close(); // chờ ghi xong

  const history = createHistory({ config, log: quiet });
  try {
    const r = await history.query({
      metric: 'humidity', bucket: 'hour',
      from: new Date('2026-11-22T07:00:00Z'), to: new Date('2026-11-22T10:00:00Z'),
    });
    assert.deepEqual(r.points.map((p) => [p.t.slice(11, 13), p.avg, p.min, p.max, p.n]), [['07', 61, 60, 62, 2], ['08', null, null, null, 0], ['09', 88, 88, 88, 1]]);
    const day = await history.query({
      metric: 'humidity', bucket: 'day',
      from: new Date('2026-11-22T03:00:00Z'), to: new Date('2026-11-22T12:00:00Z'),
    });
    assert.equal(day.points.length, 1);
    assert.equal(day.points[0].n, 3);
    assert.equal(day.points[0].min, 60);
    assert.equal(day.points[0].max, 88);
  } finally {
    await history.close();
  }
});

test('dữ liệu giả lập (sim) tách khỏi dữ liệu thật', { skip }, async () => {
  await withDb(async (db) => {
    const sim = createReadingStore(db, { deviceId: 'itest-d', mode: 'sim' });
    const live = createReadingStore(db, { deviceId: 'itest-d', mode: 'live' });
    await sim.saveReading(rd(1, '2026-11-22T08:10:00.000Z', 60));
    assert.equal((await db.collection('devices/itest-d/readings_sim').get()).size, 1);
    assert.equal((await db.collection('devices/itest-d/readings').get()).size, 0);
    assert.deepEqual(await live.readHourly(Date.parse('2026-11-22T08:00:00Z'), Date.parse('2026-11-22T09:00:00Z')), []);
  });
});
