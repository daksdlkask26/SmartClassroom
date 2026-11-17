const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { createReadingStore } = require('../src/save-reading.cjs');
const { createMessageHandler, attachMqttIngest } = require('../src/mqtt-ingest.cjs');
const { createMemoryFirestore } = require('./helpers/memory-firestore.cjs');
const { createTestMessages } = require('../scripts/test-messages.cjs');

function setup() {
  const fake = createMemoryFirestore();
  const logs = [];
  const logger = { log: (...args) => logs.push(args), error: (...args) => logs.push(args) };
  const dependencies = {
    deviceId: 'esp32-01', store: createReadingStore(fake.db, { sleep: fake.sleep }), logger
  };
  return { ...fake, logs, dependencies, handler: createMessageHandler(dependencies) };
}

test('Six sample messages produce three records, one duplicate and two rejections', async () => {
  const { handler, documents, logs } = setup();
  const batch = createTestMessages('esp32-01', 'boot-test');
  const outcomes = [];
  for (const { topic, payload } of batch.messages) {
    outcomes.push((await handler(topic, Buffer.from(payload), { retain: false })).status);
  }
  assert.deepEqual(outcomes, ['saved', 'duplicate', 'saved', 'invalid', 'invalid', 'saved']);
  assert.equal(documents.size, 3);
  assert.equal(logs.filter(log => log[0] === '[invalid-reading]').length, 2);
});
test('A storage failure is logged, and subsequent messages still succeed', async () => {
  const { handler, documents, state, logs } = setup();
  const { messages } = createTestMessages('esp32-01');
  state.failures.push(7);
  assert.equal((await handler('dht22', messages[0].payload)).status, 'failed');
  assert.equal((await handler('dht22', messages[0].payload)).status, 'saved');
  assert.equal(documents.size, 1);
  assert.equal(logs.filter(log => log[0] === '[save-failed]').length, 1);
});
test('Unknown topics do not reach storage', async () => {
  const { handler, state } = setup();
  assert.equal((await handler('led/cmd', '{not json')).status, 'ignored');
  assert.equal(state.attempts, 0);
});
test('Record the arrival time before awaiting storage, with retained provenance', async () => {
  const { dependencies, documents } = setup();
  const handler = createMessageHandler({ ...dependencies, clock: () => new Date(12345) });
  const { messages } = createTestMessages('esp32-01');
  await handler('dht22', messages[0].payload, { retain: true });
  const saved = [...documents.values()][0];
  assert.equal(saved.receivedAt.toMillis(), 12345);
  assert.equal(saved.retained, true);
});
test('Subscribe after every connection and handle a broker refusal', async () => {
  const { dependencies, logs } = setup();
  const client = new EventEmitter();
  let subscriptions = 0;
  client.subscribe = (topics, options, callback) => {
    subscriptions++;
    callback(null, topics.map(topic => ({ topic, qos: subscriptions === 1 ? options.qos : 128 })));
  };
  const ingest = attachMqttIngest(client, dependencies);
  client.emit('connect');
  client.emit('connect');
  client.emit('error', new Error('simulated transport error'));
  assert.equal(subscriptions, 2);
  assert.ok(logs.some(log => log[0] === '[subscribed]'));
  assert.ok(logs.some(log => log[0] === '[subscribe-failed]'));
  assert.ok(logs.some(log => log[0] === '[mqtt-error]'));
  await ingest.drain();
});
test('Shutdown waits for pending storage and stops accepting new messages', async () => {
  const { dependencies } = setup();
  let release, writes = 0;
  const blockedWrite = new Promise(resolve => { release = resolve; });
  dependencies.store = {
    async saveReading() {
      writes++;
      await blockedWrite;
      return { id: 'saved-document', duplicate: false };
    }
  };
  const client = new EventEmitter();
  client.subscribe = () => {};
  const ingest = attachMqttIngest(client, dependencies);
  const { messages } = createTestMessages('esp32-01');
  client.emit('message', 'dht22', messages[0].payload, {});
  const draining = ingest.drain();
  client.emit('message', 'dht22', messages[0].payload, {});
  assert.equal(writes, 1);
  release();
  await draining;
  assert.equal(ingest.failedWrites, 0);
});
