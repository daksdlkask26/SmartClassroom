const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { readDeviceId, readFirebaseConfig } = require('../config/env.cjs');
const { createFirestore } = require('../config/firebase.cjs');
const { createReadingStore } = require('../src/save-reading.cjs');
const { parseReading } = require('../src/normalize-reading.cjs');

async function main() {
  const deviceId = readDeviceId();
  const config = readFirebaseConfig();
  const firebase = createFirestore(config);
  console.log('[target]', config.emulatorHost ? 'emulator' : 'cloud', config.projectId);
  try {
    const store = createReadingStore(firebase.db);
    const reading = parseReading('dht22', JSON.stringify({
      deviceId, bootId: randomUUID(), seq: 1, status: 'ok',
      temperatureC: 27.5, humidityPct: 65
    }), deviceId);
    const first = await store.saveReading(reading);
    const duplicate = await store.saveReading(reading);
    const saved = await firebase.db.doc('devices/' + deviceId + '/readings/' + first.id).get();
    assert.equal(first.duplicate, false);
    assert.equal(duplicate.duplicate, true);
    assert.equal(saved.exists, true);
    assert.equal(saved.data().humidityPct, 65);
    assert.equal(typeof saved.data().receivedAt.toMillis(), 'number');
    assert.equal(typeof saved.data().storedAt.toMillis(), 'number');
    console.log('PASS: ghi, đọc lại, có timestamp, gửi lại không tạo bản ghi mới.');
    console.log('[document]', saved.ref.path);
  } finally {
    await firebase.close();
  }
}

if (require.main === module) main().catch(error => {
  console.error('[check-failed]', error.message);
  process.exitCode = 1;
});

module.exports = { main };
