// In 20 bản tin gần nhất đã lưu trên Firestore (giờ UTC+7).
//   npm run readings              dữ liệu theo MODE trong server/.env (mặc định sim → readings_sim)
//   MODE=live npm run readings    dữ liệu thật (Windows PowerShell: $env:MODE='live'; npm run readings)
import { loadConfig } from '../../src/config.js';
import { createFirestore } from '../../src/services/firestore/client.js';
import { collectionNames } from '../../src/services/firestore/reading-store.js';

let config;
try {
  config = loadConfig({ env: process.env });
} catch (error) {
  console.error('[read-failed]', error.message); // cấu hình sai: báo gọn, không in stack
  process.exit(1);
}
if (!config.firebase) {
  console.error('[read-failed] Thiếu FIREBASE_PROJECT_ID. Điền server/.env theo server/.env.example.');
  process.exit(1);
}

const firebase = createFirestore(config.firebase);
const { raw } = collectionNames(config.mode);
console.log('[target]', config.firebase.emulatorHost ? 'emulator' : 'cloud', config.firebase.projectId, `devices/${config.deviceId}/${raw}`);
try {
  const snapshot = await firebase.db.collection('devices').doc(config.deviceId).collection(raw)
    .orderBy('receivedAt', 'desc').limit(20).get();
  const time = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'Asia/Ho_Chi_Minh' });
  const rows = snapshot.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id.slice(0, 12), seq: x.seq, bootId: x.bootId,
      temperature: x.temperature, humidity: x.humidity, co2: x.co2,
      receivedAt: time.format(x.receivedAt.toDate()),
    };
  });
  if (rows.length) console.table(rows);
  else console.log('Chưa có dữ liệu cho thiết bị này.');
  console.log('[count]', snapshot.size, 'bản mới nhất; thời gian UTC+7.');
} catch (error) {
  console.error('[read-failed]', error.message);
  process.exitCode = 1;
} finally {
  await firebase.close();
}
