const mqtt = require('mqtt');
const { readDeviceId, readMqttConfig } = require('../config/env.cjs');
const { createTestMessages } = require('./test-messages.cjs');

async function main() {
  const deviceId = readDeviceId();
  const config = readMqttConfig();
  const batch = createTestMessages(deviceId);
  // A one-shot test must fail promptly if the broker is unavailable.
  const client = await mqtt.connectAsync(config.url, { ...config.options, reconnectPeriod: 0 });
  client.on('error', error => console.error('[mqtt-error]', error.message));
  try {
    for (const { topic, payload } of batch.messages) {
      await client.publishAsync(topic, payload, { qos: 1, retain: false });
    }
    console.log('[published] 6 bản tin; bootId:', batch.bootId);
    console.log('Kỳ vọng backend: 3 saved, 1 duplicate, 2 invalid-reading.');
    console.log('Xác nhận [saved] ở backend và kiểm tra Firestore; PUBACK chỉ xác nhận broker đã nhận.');
  } finally {
    await client.endAsync();
  }
}

if (require.main === module) main().catch(error => {
  console.error('[publish-failed]', error.message);
  process.exitCode = 1;
});

module.exports = { main };
