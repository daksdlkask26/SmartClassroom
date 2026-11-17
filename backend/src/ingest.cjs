const mqtt = require('mqtt');
const { readDeviceId, readFirebaseConfig, readMqttConfig } = require('../config/env.cjs');
const { createFirestore } = require('../config/firebase.cjs');
const { createReadingStore } = require('./save-reading.cjs');
const { attachMqttIngest } = require('./mqtt-ingest.cjs');

function main() {
  const deviceId = readDeviceId();
  const firebaseConfig = readFirebaseConfig();
  const mqttConfig = readMqttConfig();
  const firebase = createFirestore(firebaseConfig);
  const client = mqtt.connect(mqttConfig.url, { ...mqttConfig.options, resubscribe: false });
  const ingest = attachMqttIngest(client, {
    deviceId, store: createReadingStore(firebase.db)
  });
  console.log('[firestore]', firebaseConfig.emulatorHost ? 'emulator' : 'cloud', firebaseConfig.projectId);
  console.log('[device]', deviceId);

  let stopping = false;
  const shutdown = async () => {
    if (stopping) return;
    stopping = true;
    console.log('[shutdown] Đang chờ các lần ghi đang xử lý...');
    const deadline = setTimeout(() => {
      console.error('[shutdown-timeout] Một số lần ghi có thể chưa hoàn tất.');
      process.exit(1);
    }, 15000);
    try {
      await client.endAsync(false);
      await ingest.drain();
      if (ingest.failedWrites) process.exitCode = 1;
    } catch (error) {
      console.error('[shutdown-failed]', error.message);
      process.exitCode = 1;
    } finally {
      try {
        await firebase.close();
      } catch (error) {
        console.error('[firestore-close-failed]', error.message);
        process.exitCode = 1;
      }
      clearTimeout(deadline);
    }
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('[startup-failed]', error.message);
    process.exitCode = 1;
  }
}

module.exports = { main };
