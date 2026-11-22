import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectionNames, createReadingStore, hourId, mergeHourly, readingId } from '../src/services/firestore/reading-store.js';
import { createMemoryFirestore } from './helpers/memory-firestore.js';

const reading = (over = {}) => ({
  receivedAt: '2026-11-22T08:15:00.000Z', seq: 1, bootId: 'boot01',
  temperature: 27.5, humidity: 65, co2: 850,
  sensors: { dht22: 'ok', mq135: 'ok' }, levels: { temperature: 'normal', humidity: 'normal', co2: 'normal' }, levelsSource: 'device',
  ...over,
});
const setup = (mode = 'live') => {
  const fake = createMemoryFirestore();
  const store = createReadingStore(fake.db, { deviceId: 'sc-01', mode, sleep: fake.sleep });
  return { ...fake, store };
};

test('collectionNames: live ghi readings/hourly, còn lại tách riêng _sim', () => {
  assert.deepEqual(collectionNames('live'), { raw: 'readings', hourly: 'hourly' });
  assert.deepEqual(collectionNames('sim'), { raw: 'readings_sim', hourly: 'hourly_sim' });
});

test('readingId: cùng bootId + seq thì trùng; khác bootId hoặc seq thì khác; thiếu bootId thì theo giờ nhận', () => {
  const a = readingId('sc-01', reading());
  assert.equal(a, readingId('sc-01', reading({ receivedAt: '2030-01-01T00:00:00Z' })));
  assert.notEqual(a, readingId('sc-01', reading({ bootId: 'boot02' })));
  assert.notEqual(a, readingId('sc-01', reading({ seq: 2 })));
  const noBoot = reading({ bootId: undefined });
  assert.notEqual(readingId('sc-01', noBoot), readingId('sc-01', { ...noBoot, receivedAt: '2026-11-22T08:15:30.000Z' }));
});

test('hourId: mốc đầu giờ UTC dạng yyyyMMddHH', () => {
  assert.equal(hourId(Date.parse('2026-11-22T08:59:59.999Z')), '2026112208');
  assert.equal(hourId(Date.parse('2026-11-22T09:00:00Z')), '2026112209');
});

test('mergeHourly: cộng dồn n, tổng, nhỏ nhất, lớn nhất; số đo null không tính', () => {
  let h = mergeHourly(null, reading({ humidity: 60 }));
  h = mergeHourly(h, reading({ humidity: 70, co2: null }));
  assert.deepEqual(h.humidity, { n: 2, sum: 130, min: 60, max: 70 });
  assert.deepEqual(h.co2, { n: 1, sum: 850, min: 850, max: 850 });
  assert.deepEqual(mergeHourly(null, reading({ temperature: null })).temperature, { n: 0, sum: 0, min: null, max: null });
});

test('saveReading: tạo bản tin + cộng dồn giờ; gửi lại cùng bản tin không tạo thêm và không cộng hai lần', async () => {
  const { store, documents } = setup();
  const first = await store.saveReading(reading());
  const again = await store.saveReading(reading());
  assert.equal(first.duplicate, false);
  assert.equal(again.duplicate, true);
  assert.equal(first.id, again.id);

  const raw = [...documents.keys()].filter((p) => p.includes('/readings/'));
  assert.equal(raw.length, 1);
  const hour = documents.get('devices/sc-01/hourly/2026112208');
  assert.equal(hour.humidity.n, 1);
  assert.equal(hour.humidity.sum, 65);
  assert.ok(hour.hourStart.toMillis() === Date.parse('2026-11-22T08:00:00Z'));
  assert.equal(documents.get(raw[0]).bootId, 'boot01');
});

test('saveReading: bản tin mới (seq khác) cộng dồn vào cùng giờ; sang giờ khác thì tạo document giờ mới', async () => {
  const { store, documents } = setup();
  await store.saveReading(reading({ seq: 1, humidity: 60 }));
  await store.saveReading(reading({ seq: 2, humidity: 70, receivedAt: '2026-11-22T08:45:00.000Z' }));
  await store.saveReading(reading({ seq: 3, humidity: 80, receivedAt: '2026-11-22T09:05:00.000Z' }));
  assert.deepEqual(documents.get('devices/sc-01/hourly/2026112208').humidity, { n: 2, sum: 130, min: 60, max: 70 });
  assert.deepEqual(documents.get('devices/sc-01/hourly/2026112209').humidity, { n: 1, sum: 80, min: 80, max: 80 });
});

test('saveReading: chế độ sim ghi vào readings_sim và hourly_sim', async () => {
  const { store, documents } = setup('sim');
  await store.saveReading(reading());
  assert.ok([...documents.keys()].every((p) => p.includes('/readings_sim/') || p.includes('/hourly_sim/')));
});

test('saveReading: lỗi tạm thời thì thử lại với thời gian chờ tăng dần; lỗi không thử lại thì báo ngay', async () => {
  const a = setup();
  a.state.failures = [14, 14];
  const ok = await a.store.saveReading(reading());
  assert.equal(ok.duplicate, false);
  assert.deepEqual(a.state.delays, [500, 1000]);
  assert.equal(a.state.attempts, 3);

  const b = setup();
  b.state.failures = [7]; // PERMISSION_DENIED
  await assert.rejects(() => b.store.saveReading(reading()), { code: 7 });
  assert.equal(b.state.attempts, 1);

  const c = setup();
  c.state.failures = [14, 14, 14];
  await assert.rejects(() => c.store.saveReading(reading()), { code: 14 });
  assert.equal(c.state.attempts, 3);
});

test('saveReading: mất phản hồi sau khi đã ghi thì lần thử lại là bản trùng và không cộng dồn hai lần', async () => {
  const { store, state, documents } = setup();
  state.timeoutAfterCommit = true;
  const r = await store.saveReading(reading());
  assert.equal(r.duplicate, true);
  assert.equal(documents.get('devices/sc-01/hourly/2026112208').humidity.n, 1);
});

test('readHourly: đọc các giờ trong khoảng theo thứ tự thời gian', async () => {
  const { store } = setup();
  await store.saveReading(reading({ seq: 1, receivedAt: '2026-11-22T10:10:00Z' }));
  await store.saveReading(reading({ seq: 2, receivedAt: '2026-11-22T08:10:00Z' }));
  await store.saveReading(reading({ seq: 3, receivedAt: '2026-11-22T12:10:00Z' }));
  const rows = await store.readHourly(Date.parse('2026-11-22T08:30:00Z'), Date.parse('2026-11-22T12:00:00Z'));
  assert.deepEqual(rows.map((r) => new Date(r.t).toISOString()), ['2026-11-22T08:00:00.000Z', '2026-11-22T10:00:00.000Z']);
  assert.equal(rows[0].humidity.n, 1);
});
