// Kiểm thử với Firestore Emulator thật: giao dịch, chống trùng, cộng dồn giờ, đọc lịch sử, plugin qua bus.
// Chạy bằng `npm run test:integration` (tự mở và tắt Emulator, cần Java 21+). Không ghi lên cloud.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { loadConfig, readContract } from '../../src/config.js';
import { createBus } from '../../src/core/bus.js';
import { register } from '../../src/plugins/firestore.js';
import { create as createHistory } from '../../src/providers/history/firestore.js';
import { createFirestore } from '../../src/services/firestore/client.js';
import { createReadingStore } from '../../src/services/firestore/reading-store.js';

const host = process.env.FIRESTORE_EMULATOR_HOST;
const quiet = { error() {}, warn() {}, info() {}, debug() {}, child() { return quiet; } };
let firebase;
let config;
const deviceId = `test-${randomUUID().slice(0, 8)}`;

before(() => {
  assert.ok(host, 'Chạy bằng npm run test:integration để có FIRESTORE_EMULATOR_HOST');
  config = loadConfig({
    env: { FIREBASE_PROJECT_ID: 'demo-smartclassroom', FIRESTORE_EMULATOR_HOST: host, DEVICE_ID: deviceId },
    contract: readContract(),
  });
  firebase = createFirestore(config.firebase);
});
after(async () => { await firebase?.close(); });

const reading = (seq, over = {}) => ({
  receivedAt: '2026-11-22T08:15:00.000Z', seq, bootId: 'boot01', temperature: 27, humidity: 60, co2: 800,
  sensors: { dht22: 'ok', mq135: 'ok' }, levels: { temperature: 'normal', humidity: 'normal', co2: 'normal' }, levelsSource: 'server',
  ...over,
});

test('ghi bản tin rồi đọc lại; gửi lại cùng bản tin báo trùng và không cộng dồn hai lần', async () => {
  const store = createReadingStore(firebase.db, { deviceId, mode: 'sim' });
  const first = await store.saveReading(reading(1));
  const again = await store.saveReading(reading(1));
  assert.equal(first.duplicate, false);
  assert.equal(again.duplicate, true);

  const doc = await firebase.db.doc(`devices/${deviceId}/readings_sim/${first.id}`).get();
  assert.equal(doc.data().humidity, 60);
  assert.equal(doc.data().receivedAt.toMillis(), Date.parse('2026-11-22T08:15:00Z'));
  assert.ok(doc.data().storedAt.toMillis() > 0);
  const hour = await firebase.db.doc(`devices/${deviceId}/hourly_sim/2026112208`).get();
  assert.equal(hour.data().humidity.n, 1);
});

test('20 bản tin ghi cùng lúc trong một giờ vẫn cộng dồn đúng (giao dịch chống ghi đè)', async () => {
  const store = createReadingStore(firebase.db, { deviceId: `${deviceId}-par`, mode: 'sim' });
  await Promise.all(Array.from({ length: 20 }, (_, i) =>
    store.saveReading(reading(100 + i, { humidity: 50 + i, receivedAt: `2026-11-22T10:${String(i).padStart(2, '0')}:00.000Z` }))));
  const hour = await firebase.db.doc(`devices/${deviceId}-par/hourly_sim/2026112210`).get();
  const h = hour.data().humidity;
  assert.equal(h.n, 20);
  assert.equal(h.sum, Array.from({ length: 20 }, (_, i) => 50 + i).reduce((a, b) => a + b, 0));
  assert.equal(h.min, 50);
  assert.equal(h.max, 69);
});

test('provider lịch sử đọc đúng trung bình, nhỏ nhất, lớn nhất theo giờ', async () => {
  const provider = createHistory({ config, log: quiet });
  try {
    const r = await provider.query({
      metric: 'humidity', bucket: 'hour',
      from: new Date('2026-11-22T08:00:00Z'), to: new Date('2026-11-22T09:00:00Z'),
    });
    assert.deepEqual(r.points, [{ t: '2026-11-22T08:00:00.000Z', avg: 60, min: 60, max: 60, n: 1 }]);
    assert.equal(r.unit, '%');
  } finally {
    await provider.close();
  }
});

test('plugin: reading trên bus được lưu; close chờ ghi xong', async () => {
  const bus = createBus(quiet);
  const handle = await register({ bus, config, log: quiet });
  bus.emit('reading', reading(7, { receivedAt: '2026-11-22T11:00:00.000Z', humidity: 71 }));
  await handle.close();
  const snap = await firebase.db.collection(`devices/${deviceId}/readings_sim`).where('seq', '==', 7).get();
  assert.equal(snap.size, 1);
  assert.equal(snap.docs[0].data().humidity, 71);
});
