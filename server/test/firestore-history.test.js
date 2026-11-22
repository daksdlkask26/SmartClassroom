import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig, readContract } from '../src/config.js';
import { aggregateHours, create } from '../src/providers/history/firestore.js';
import { createReadingStore } from '../src/services/firestore/reading-store.js';
import { createMemoryFirestore } from './helpers/memory-firestore.js';

const contract = readContract();
const h = (iso, humidity) => ({ t: Date.parse(iso), humidity });
const stat = (n, sum, min, max) => ({ n, sum, min, max });

test('aggregateHours theo giờ: trung bình = tổng / n, giờ thiếu dữ liệu là null', () => {
  const { points } = aggregateHours({
    hours: [h('2026-11-17T07:00:00Z', stat(2, 121.05, 60, 61.05)), h('2026-11-17T09:00:00Z', stat(1, 88, 88, 88))],
    metric: 'humidity', bucket: 'hour', decimals: 1,
    from: new Date('2026-11-17T07:00:00Z'), to: new Date('2026-11-17T10:00:00Z'),
  });
  assert.deepEqual(points, [
    { t: '2026-11-17T07:00:00.000Z', avg: 60.5, min: 60, max: 61.05, n: 2 },
    { t: '2026-11-17T08:00:00.000Z', avg: null, min: null, max: null, n: 0 },
    { t: '2026-11-17T09:00:00.000Z', avg: 88, min: 88, max: 88, n: 1 },
  ]);
});

test('aggregateHours theo ngày: gom các giờ vào ngày 00:00 giờ Việt Nam (17:00 UTC hôm trước)', () => {
  const { start, points } = aggregateHours({
    hours: [
      h('2026-11-17T16:00:00Z', stat(1, 50, 50, 50)),   // 23:00 VN ngày 17
      h('2026-11-17T17:00:00Z', stat(2, 140, 60, 80)),  // 00:00 VN ngày 18
      h('2026-11-18T05:00:00Z', stat(2, 100, 40, 60)),  // 12:00 VN ngày 18
    ],
    metric: 'humidity', bucket: 'day', decimals: 1,
    from: new Date('2026-11-17T02:00:00Z'), to: new Date('2026-11-18T20:00:00Z'),
  });
  assert.equal(new Date(start).toISOString(), '2026-11-16T17:00:00.000Z');
  assert.equal(points.length, 3); // ngày 17, 18 và ngày 19 đang dở (đến 03:00 VN)
  const day17 = points.find((p) => p.t === '2026-11-16T17:00:00.000Z');
  const day18 = points.find((p) => p.t === '2026-11-17T17:00:00.000Z');
  assert.deepEqual(day17, { t: '2026-11-16T17:00:00.000Z', avg: 50, min: 50, max: 50, n: 1 });
  assert.deepEqual(day18, { t: '2026-11-17T17:00:00.000Z', avg: 60, min: 40, max: 80, n: 4 });
});

test('aggregateHours: bỏ qua cảm biến chưa có số đo (n = 0)', () => {
  const r = aggregateHours({
    hours: [{ t: Date.parse('2026-11-22T07:00:00Z'), humidity: { n: 0, sum: 0, min: null, max: null } }],
    metric: 'humidity', bucket: 'hour', decimals: 1,
    from: new Date('2026-11-22T07:00:00Z'), to: new Date('2026-11-22T08:00:00Z'),
  });
  assert.deepEqual(r.points, [{ t: '2026-11-22T07:00:00.000Z', avg: null, min: null, max: null, n: 0 }]);
});

test('provider: thiếu FIREBASE_PROJECT_ID thì báo lỗi rõ ràng', () => {
  assert.throws(() => create({ config: loadConfig({ env: {}, contract }) }), /FIREBASE_PROJECT_ID/);
});

test('provider: đọc đúng dạng api.history, và cache 60 giây không đọc Firestore lần hai', async () => {
  const fake = createMemoryFirestore();
  const config = loadConfig({ env: { FIREBASE_PROJECT_ID: 'demo-smartclassroom', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8085' }, contract });
  const store = createReadingStore(fake.db, { deviceId: 'sc-01', mode: 'sim', sleep: fake.sleep });
  const base = Date.parse('2026-11-22T08:00:00Z');
  for (let i = 0; i < 4; i++) {
    await store.saveReading({
      receivedAt: new Date(base + i * 60_000).toISOString(), seq: i, bootId: 'b1', temperature: 27, humidity: 60 + i, co2: 800,
      sensors: { dht22: 'ok', mq135: 'ok' }, levels: {}, levelsSource: 'server',
    });
  }
  let t = base + 3600_000;
  let released = 0;
  const provider = create({ config, now: () => t, acquire: () => ({ db: fake.db, release: async () => { released++; } }) });

  const q = { metric: 'humidity', bucket: 'hour', from: new Date(base), to: new Date(base + 3600_000) };
  const first = await provider.query(q);
  assert.equal(first.unit, '%');
  assert.equal(first.bucket, 'hour');
  assert.deepEqual(first.points, [{ t: '2026-11-22T08:00:00.000Z', avg: 61.5, min: 60, max: 63, n: 4 }]);

  const before = fake.state.attempts;
  fake.documents.clear(); // nếu lần hai vẫn đọc Firestore thì kết quả sẽ rỗng
  const second = await provider.query(q);
  assert.deepEqual(second, first);
  assert.equal(fake.state.attempts, before);

  t += 61_000; // hết hạn cache: đọc lại, giờ không còn dữ liệu
  const third = await provider.query(q);
  assert.equal(third.points[0].n, 0);

  await provider.close();
  assert.equal(released, 1);
});
