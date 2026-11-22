import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { loadConfig, readContract } from '../src/config.js';
import { readFirebaseConfig } from '../src/services/firestore/config.js';
import { acquireFirestore, createFirestore } from '../src/services/firestore/client.js';
import { removeTestTemp } from './helpers/remove-temp.js';

const contract = readContract();
const base = { baseDir: tmpdir() };

test('chưa đặt FIREBASE_PROJECT_ID thì trả null (plugin tự tắt, không lỗi)', () => {
  assert.equal(readFirebaseConfig({}, base), null);
  assert.equal(loadConfig({ env: {}, contract }).firebase, null);
});

test('Emulator chạy không cần file khóa', () => {
  assert.deepEqual(
    readFirebaseConfig({ FIREBASE_PROJECT_ID: 'demo-smartclassroom', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8085' }, base),
    { projectId: 'demo-smartclassroom', emulatorHost: '127.0.0.1:8085' },
  );
});

test('project demo-* không được lặng lẽ ghi lên cloud', () => {
  assert.throws(() => readFirebaseConfig({ FIREBASE_PROJECT_ID: 'demo-smartclassroom' }, base), /EMULATOR/);
});

for (const host of ['http://127.0.0.1:8085', 'example.com:8085', '127.0.0.1:99999']) {
  test(`từ chối địa chỉ Emulator sai: ${host}`, () => {
    assert.throws(() => readFirebaseConfig({ FIREBASE_PROJECT_ID: 'demo-smartclassroom', FIRESTORE_EMULATOR_HOST: host }, base));
  });
}

test('cloud: báo sớm khi thiếu hoặc sai cấu hình', () => {
  assert.throws(() => readFirebaseConfig({ FIREBASE_PROJECT_ID: 'your-firebase-project-id' }, base), /Project ID/);
  assert.throws(() => readFirebaseConfig({ FIREBASE_PROJECT_ID: 'smartclassroom-123' }, base), /GOOGLE_APPLICATION_CREDENTIALS/);
  assert.throws(
    () => readFirebaseConfig({ FIREBASE_PROJECT_ID: 'smartclassroom-123', GOOGLE_APPLICATION_CREDENTIALS: './missing-test-key.json' }, base),
    /Không tìm thấy/,
  );
});

test('đường dẫn khóa tương đối tính từ baseDir (kể cả khi đường dẫn có dấu cách), không theo thư mục chạy lệnh', (t) => {
  const checkout = mkdtempSync(join(tmpdir(), 'smartclassroom path-'));
  t.after(() => removeTestTemp(checkout));
  const serverDir = join(checkout, 'Team project', 'server');
  mkdirSync(join(serverDir, 'firebase'), { recursive: true });
  const credentialsPath = join(serverDir, 'firebase', 'serviceAccountKey.json');
  writeFileSync(credentialsPath, '{}');
  const cfg = readFirebaseConfig({
    FIREBASE_PROJECT_ID: 'smartclassroom-123', GOOGLE_APPLICATION_CREDENTIALS: './firebase/serviceAccountKey.json',
  }, { baseDir: serverDir });
  assert.equal(cfg.credentialsPath, credentialsPath);
  assert.notEqual(cfg.credentialsPath, resolve('./firebase/serviceAccountKey.json'));
});

test('đường dẫn khóa tuyệt đối vẫn dùng được', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'smartclassroom-key-'));
  t.after(() => removeTestTemp(dir));
  const credentialsPath = join(dir, 'key.json');
  writeFileSync(credentialsPath, '{}');
  assert.equal(readFirebaseConfig({
    FIREBASE_PROJECT_ID: 'smartclassroom-123', GOOGLE_APPLICATION_CREDENTIALS: credentialsPath,
  }, base).credentialsPath, credentialsPath);
});

// ---------- Kết nối Firestore ----------

test('createFirestore dùng đường dẫn khóa đã resolve, độc lập với ADC và thư mục chạy lệnh', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'smartclassroom cert-'));
  t.after(() => removeTestTemp(dir));
  const { privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' },
  });
  const credentialsPath = join(dir, 'key.json');
  writeFileSync(credentialsPath, JSON.stringify({
    project_id: 'smartclassroom-test', client_email: 'test@smartclassroom-test.iam.gserviceaccount.com', private_key: privateKey,
  }), { mode: 0o600 });
  const old = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  process.env.GOOGLE_APPLICATION_CREDENTIALS = join(dir, 'missing-adc-file.json');
  t.after(() => {
    if (old === undefined) delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    else process.env.GOOGLE_APPLICATION_CREDENTIALS = old;
  });
  const firebase = createFirestore({ projectId: 'smartclassroom-test', emulatorHost: null, credentialsPath });
  try {
    assert.equal(firebase.db.projectId, 'smartclassroom-test'); // đọc cấu hình và đóng không gọi ra cloud
  } finally {
    await firebase.close();
  }
});

test('acquireFirestore: hai bên dùng chung một kết nối, chỉ đóng khi cả hai đã trả lại', async () => {
  let created = 0; let closed = 0;
  const create = () => { created++; return { db: { id: created }, close: async () => { closed++; } }; };
  const cfg = { projectId: 'demo-x-test', emulatorHost: '127.0.0.1:8085' };
  const a = acquireFirestore(cfg, { create });
  const b = acquireFirestore(cfg, { create });
  assert.equal(created, 1);
  assert.equal(a.db, b.db);
  await a.release();
  await a.release(); // trả lần hai không đếm thêm
  assert.equal(closed, 0);
  await b.release();
  assert.equal(closed, 1);
  const c = acquireFirestore(cfg, { create }); // sau khi đóng hết thì mở lại được
  assert.equal(created, 2);
  await c.release();
});
