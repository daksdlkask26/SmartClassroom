const test = require('node:test');
const assert = require('node:assert/strict');
const { createReadingStore } = require('../src/save-reading.cjs');
const { parseReading } = require('../src/normalize-reading.cjs');
const { createMemoryFirestore } = require('./helpers/memory-firestore.cjs');

function setup() {
  const fake = createMemoryFirestore();
  const store = createReadingStore(fake.db, { sleep: fake.sleep });
  const reading = parseReading('dht22', JSON.stringify({
    deviceId: 'esp32-01', bootId: 'boot-01', seq: 1,
    status: 'ok', temperatureC: 27.5, humidityPct: 65
  }), 'esp32-01');
  return { ...fake, store, reading };
}

test('Create history with timestamps and preserve original metadata on duplicate', async () => {
  const { store, reading, documents } = setup();
  const first = await store.saveReading(reading, { receivedAt: new Date(1000), retained: true });
  const duplicate = await store.saveReading(reading, { receivedAt: new Date(9000), retained: false });
  assert.equal(first.duplicate, false);
  assert.equal(duplicate.duplicate, true);
  assert.equal(first.id, duplicate.id);
  assert.equal(documents.size, 1);
  const data = [...documents.values()][0];
  assert.equal(data.receivedAt.toMillis(), 1000);
  assert.equal(data.retained, true);
  assert.ok(data.storedAt);
});
test('New seq and new boot are separate history records even with equal values', async () => {
  const { store, reading, documents } = setup();
  await store.saveReading(reading);
  await store.saveReading({ ...reading, seq: 2 });
  await store.saveReading({ ...reading, bootId: 'boot-02' });
  assert.equal(documents.size, 3);
});
test('Retry temporary errors, keeping the same measurement reference', async () => {
  const { store, reading, documents, state } = setup();
  state.failures.push(14, 4);
  assert.equal((await store.saveReading(reading)).duplicate, false);
  assert.equal(state.attempts, 3);
  assert.deepEqual(state.delays, [500, 1000]);
  assert.equal(documents.size, 1);
});
test('Permission denied is surfaced without retry or a false success', async () => {
  const { store, reading, documents, state } = setup();
  state.failures.push(7);
  await assert.rejects(() => store.saveReading(reading), { code: 7 });
  assert.equal(state.attempts, 1);
  assert.equal(documents.size, 0);
});
test('Stop after the third temporary failure and propagate the error', async () => {
  const { store, reading, documents, state } = setup();
  state.failures.push(14, 14, 14);
  await assert.rejects(() => store.saveReading(reading), { code: 14 });
  assert.equal(state.attempts, 3);
  assert.equal(documents.size, 0);
});
test('An ambiguous timeout after commit is safely recognized on retry', async () => {
  const { store, reading, documents, state } = setup();
  state.timeoutAfterCommit = true;
  assert.equal((await store.saveReading(reading)).duplicate, true);
  assert.equal(documents.size, 1);
});
test('Concurrent deliveries of the same measurement leave one document', async () => {
  const { store, reading, documents } = setup();
  const outcomes = await Promise.all([store.saveReading(reading), store.saveReading(reading)]);
  assert.equal(documents.size, 1);
  assert.equal(outcomes.filter(outcome => outcome.duplicate).length, 1);
});
