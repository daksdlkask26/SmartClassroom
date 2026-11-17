const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:net');
const { randomUUID } = require('node:crypto');
const { setTimeout: delay } = require('node:timers/promises');
const mqtt = require('mqtt');
const { Timestamp } = require('firebase-admin/firestore');
const { readFirebaseConfig } = require('../../config/env.cjs');
const { createFirestore } = require('../../config/firebase.cjs');
const { createReadingStore } = require('../../src/save-reading.cjs');
const { parseReading, readingId } = require('../../src/normalize-reading.cjs');
const { attachMqttIngest } = require('../../src/mqtt-ingest.cjs');
const { createTestMessages } = require('../../scripts/test-messages.cjs');

function emulatorConfig() {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, 'Chạy bằng npm run test:integration.');
  return readFirebaseConfig({
    FIREBASE_PROJECT_ID: 'demo-smartclassroom',
    FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST
  });
}
async function waitFor(predicate, description) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await delay(25);
  }
  throw new Error('Timed out: ' + description);
}
async function removeOwnRecords(db, deviceId) {
  const snapshot = await db.collection('devices').doc(deviceId).collection('readings').get();
  if (snapshot.empty) return;
  const batch = db.batch();
  for (const doc of snapshot.docs) batch.delete(doc.ref);
  await batch.commit();
}

test('Real Firestore: atomic duplicate prevention, timestamps, restart and UTC+7 boundaries',
  { timeout: 30000 }, async t => {
    const config = emulatorConfig();
    const deviceId = 'test-' + randomUUID();
    let firebase = createFirestore(config);
    t.after(async () => {
      await removeOwnRecords(firebase.db, deviceId);
      await firebase.close();
    });
    const store = createReadingStore(firebase.db);
    const reading = parseReading('dht22', JSON.stringify({
      deviceId, bootId: 'boot-one', seq: 1, status: 'ok', temperatureC: 27.5, humidityPct: 88
    }), deviceId);
    const beforeMidnight = new Date('2026-11-17T23:59:59+07:00');
    const atMidnight = new Date('2026-11-18T00:00:00+07:00');
    const outcomes = await Promise.all([
      store.saveReading(reading, { receivedAt: beforeMidnight }),
      store.saveReading(reading, { receivedAt: beforeMidnight })
    ]);
    assert.equal(outcomes.filter(outcome => outcome.duplicate).length, 1);
    const history = firebase.db.collection('devices').doc(deviceId).collection('readings');
    const initial = await history.doc(readingId(reading)).get();
    assert.equal(initial.data().humidityPct, 88);
    assert.equal(initial.data().receivedAt.toMillis(), beforeMidnight.getTime());
    assert.ok(initial.data().storedAt instanceof Timestamp);

    await store.saveReading(reading, { receivedAt: atMidnight });
    const repeated = await history.doc(readingId(reading)).get();
    assert.ok(repeated.data().storedAt.isEqual(initial.data().storedAt));
    assert.ok(repeated.data().receivedAt.isEqual(initial.data().receivedAt));
    await store.saveReading({ ...reading, seq: 2 }, { receivedAt: atMidnight });

    const page = await history
      .where('receivedAt', '>=', Timestamp.fromDate(new Date('2026-11-17T00:00:00+07:00')))
      .where('receivedAt', '<', Timestamp.fromDate(atMidnight))
      .orderBy('receivedAt').get();
    assert.equal(page.size, 1);
    const empty = await history
      .where('receivedAt', '<', Timestamp.fromDate(new Date('2026-11-16T00:00:00+07:00'))).get();
    assert.equal(empty.size, 0);

    await firebase.close();
    firebase = createFirestore(config);
    const reopened = await firebase.db.collection('devices').doc(deviceId).collection('readings').get();
    assert.equal(reopened.size, 2);
  });

test('Real MQTT broker to Firestore: six messages, retained state and reconnect',
  { timeout: 40000 }, async t => {
    const { Aedes } = await import('aedes');
    const firebase = createFirestore(emulatorConfig());
    const deviceId = 'test-' + randomUUID();
    const broker = await Aedes.createBroker();
    const server = createServer(broker.handle);
    let subscriber, publisher, ingest;
    t.after(async () => {
      await Promise.all([
        subscriber?.endAsync(true), publisher?.endAsync(true)
      ]);
      await ingest?.drain();
      await new Promise(resolve => broker.close(resolve));
      if (server.listening) await new Promise(resolve => server.close(resolve));
      await removeOwnRecords(firebase.db, deviceId);
      await firebase.close();
    });
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const url = 'mqtt://127.0.0.1:' + server.address().port;
    const logs = [];
    const logger = { log: (...args) => logs.push(args), error: (...args) => logs.push(args) };
    subscriber = mqtt.connect(url, {
      connectTimeout: 2000, reconnectPeriod: 200, resubscribe: false
    });
    ingest = attachMqttIngest(subscriber, {
      deviceId, store: createReadingStore(firebase.db), logger
    });
    await waitFor(() => logs.some(log => log[0] === '[subscribed]'), 'subscribe');
    publisher = await mqtt.connectAsync(url, { reconnectPeriod: 0, connectTimeout: 2000 });
    const batch = createTestMessages(deviceId);
    for (const { topic, payload } of batch.messages) {
      await publisher.publishAsync(topic, payload, { qos: 1, retain: false });
    }
    await waitFor(() => logs.filter(log => log[0] === '[saved]').length === 3
      && logs.filter(log => log[0] === '[duplicate]').length === 1, 'persist sample messages');
    assert.equal(logs.filter(log => log[0] === '[invalid-reading]').length, 2);
    const history = firebase.db.collection('devices').doc(deviceId).collection('readings');
    const snapshot = await history.get();
    assert.equal(snapshot.size, 3);
    const records = snapshot.docs.map(doc => doc.data());
    const warming = records.find(data => data.status === 'warming_up');
    assert.equal(warming.co2EstimatedPpm, null);
    assert.ok(records.filter(data => data.sensor === 'mq135').every(data => data.humidityPct === null));
    assert.ok(records.every(data => data.receivedAt instanceof Timestamp && data.storedAt instanceof Timestamp));

    // Force a transport interruption; the application must resubscribe.
    subscriber.stream.destroy();
    await waitFor(() => logs.filter(log => log[0] === '[subscribed]').length === 2, 'MQTT reconnect');
    const fresh = { deviceId, bootId: batch.bootId, seq: 3, status: 'ok', co2EstimatedPpm: 900 };
    await publisher.publishAsync('mq135', JSON.stringify(fresh), { qos: 1, retain: false });
    await waitFor(() => logs.filter(log => log[0] === '[saved]').length === 4, 'save after reconnect');
    assert.equal((await history.get()).size, 4);
    await subscriber.unsubscribeAsync('mq135');
    const retained = { ...fresh, seq: 4 };
    await publisher.publishAsync('mq135', JSON.stringify(retained), { qos: 1, retain: true });
    await subscriber.subscribeAsync('mq135', { qos: 1 });
    await waitFor(() => logs.filter(log => log[0] === '[saved]').length === 5, 'receive retained measurement');
    const retainedReading = parseReading('mq135', JSON.stringify(retained), deviceId);
    assert.equal((await history.doc(readingId(retainedReading)).get()).data().retained, true);
    assert.equal(ingest.failedWrites, 0);
  });
