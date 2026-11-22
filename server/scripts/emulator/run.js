// Chạy Firestore Emulator: `npm run emulators` (mở để thử tay) hoặc `npm run test:integration` (chạy kiểm thử tích hợp).
// Cần Java 21+. Firebase CLI được tải theo yêu cầu bằng npx (không nằm trong phụ thuộc, vì nặng hơn 200 MB).
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SERVER = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FIREBASE_TOOLS = 'firebase-tools@15.36.0';
const mode = process.argv[2];

if (!['start', 'test'].includes(mode)) {
  console.error('Dùng npm run emulators hoặc npm run test:integration.');
  process.exit(1);
}

const env = { ...process.env };
// Chế độ gỡ lỗi của Firebase CLI có thể in biến môi trường; Emulator không cần khóa cloud hay tài khoản MQTT.
for (const key of Object.keys(env)) {
  if (key === 'DEBUG' || key === 'GOOGLE_APPLICATION_CREDENTIALS' || key === 'FIREBASE_TOKEN' || key === 'FIREBASE_CONFIG'
    || key === 'FIRESTORE_EMULATOR_HOST' || key === 'FIREBASE_EMULATOR_HUB' || key.startsWith('MQTT_')) delete env[key];
}

// Đường dẫn tương đối tính từ server/ (cwd) nên không dính dấu cách trong đường dẫn tuyệt đối trên Windows.
const parts = [
  'npx', '--yes', FIREBASE_TOOLS,
  mode === 'test' ? 'emulators:exec' : 'emulators:start',
  '--config', 'firebase/firebase.json', '--only', 'firestore', '--project', 'demo-smartclassroom',
];
if (mode === 'test') parts.push('"node --test test/integration/*.test.js"');

const child = spawn(parts.join(' '), { cwd: SERVER, env, stdio: 'inherit', shell: true, windowsHide: true });
child.on('error', (error) => {
  console.error('[emulator-start-failed]', error.message);
  process.exitCode = 1;
});
child.on('exit', (code) => { process.exitCode = code ?? 1; });
