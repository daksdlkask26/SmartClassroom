const { readDeviceId, readFirebaseConfig } = require('../config/env.cjs');
const { createFirestore } = require('../config/firebase.cjs');

async function main() {
  const deviceId = readDeviceId();
  const config = readFirebaseConfig();
  const firebase = createFirestore(config);
  console.log('[target]', config.emulatorHost ? 'emulator' : 'cloud', config.projectId);
  try {
    const snapshot = await firebase.db.collection('devices').doc(deviceId)
      .collection('readings').orderBy('receivedAt', 'desc').limit(20).get();
    const time = new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'short', timeStyle: 'medium', timeZone: 'Asia/Ho_Chi_Minh'
    });
    const rows = snapshot.docs.map(document => {
      const data = document.data();
      return {
        id: document.id.slice(0, 12), sensor: data.sensor, bootId: data.bootId, seq: data.seq,
        status: data.status, temperatureC: data.temperatureC, humidityPct: data.humidityPct,
        co2EstimatedPpm: data.co2EstimatedPpm,
        receivedAt: time.format(data.receivedAt.toDate()),
        retained: data.retained
      };
    });
    if (!rows.length) console.log('Chưa có dữ liệu cho thiết bị này.');
    else console.table(rows);
    console.log('[count]', snapshot.size, 'bản mới nhất; thời gian UTC+7.');
  } finally {
    await firebase.close();
  }
}

if (require.main === module) main().catch(error => {
  console.error('[read-failed]', error.message);
  process.exitCode = 1;
});

module.exports = { main };
