// Kiểm tra kết nối Firestore: ghi một bản tin thử, đọc lại, gửi lại để chắc chắn không tạo bản trùng.
//   npm run check:firestore    (cần FIREBASE_PROJECT_ID và khóa/Emulator trong server/.env)
// Dữ liệu thử ghi vào collection giả lập (readings_sim), không lẫn vào dữ liệu thật.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { loadConfig } from '../../src/config.js';
import { createFirestore } from '../../src/services/firestore/client.js';
import { createReadingStore } from '../../src/services/firestore/reading-store.js';

let config;
try {
  config = loadConfig({ env: { ...process.env, MODE: 'sim' } });
} catch (error) {
  console.error('[check-failed]', error.message); // cấu hình sai: báo gọn, không in stack
  process.exit(1);
}
if (!config.firebase) {
  console.error('[check-failed] Thiếu FIREBASE_PROJECT_ID. Điền server/.env theo server/.env.example.');
  process.exit(1);
}

const firebase = createFirestore(config.firebase);
console.log('[target]', config.firebase.emulatorHost ? 'emulator' : 'cloud', config.firebase.projectId);
try {
  const store = createReadingStore(firebase.db, { deviceId: config.deviceId, mode: 'sim' });
  const reading = {
    receivedAt: new Date().toISOString(), seq: 1, bootId: `smoke-${randomUUID().slice(0, 8)}`,
    temperature: 27.5, humidity: 65, co2: 850,
    sensors: { dht22: 'ok', mq135: 'ok' }, levels: { temperature: 'normal', humidity: 'normal', co2: 'normal' }, levelsSource: 'server',
  };
  const first = await store.saveReading(reading);
  const again = await store.saveReading(reading);
  const saved = await firebase.db.doc(`devices/${config.deviceId}/${store.names.raw}/${first.id}`).get();
  assert.equal(first.duplicate, false);
  assert.equal(again.duplicate, true);
  assert.equal(saved.exists, true);
  assert.equal(saved.data().humidity, 65);
  assert.equal(typeof saved.data().receivedAt.toMillis(), 'number');
  assert.equal(typeof saved.data().storedAt.toMillis(), 'number');
  console.log('PASS: ghi, đọc lại, có timestamp, gửi lại không tạo bản ghi mới.');
  console.log('[document]', saved.ref.path);
} catch (error) {
  console.error('[check-failed]', error.message);
  process.exitCode = 1;
} finally {
  await firebase.close();
}
