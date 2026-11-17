const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, mkdirSync, writeFileSync } = require('node:fs');
const { removeTestTemp } = require('./helpers/remove-temp.cjs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { readDeviceId, readFirebaseConfig, readMqttConfig } = require('../config/env.cjs');

test('Read device ID and reject IDs containing path separators', () => {
  assert.equal(readDeviceId({ DEVICE_ID: 'esp32-01' }), 'esp32-01');
  assert.throws(() => readDeviceId({}));
  assert.throws(() => readDeviceId({ DEVICE_ID: 'devices/01' }));
});
test('Emulator works without a service account file', () => {
  assert.deepEqual(readFirebaseConfig({
    FIREBASE_PROJECT_ID: 'demo-smartclassroom', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8085'
  }), { projectId: 'demo-smartclassroom', emulatorHost: '127.0.0.1:8085' });
});
test('A demo project cannot silently fall back to cloud', () => {
  assert.throws(() => readFirebaseConfig({ FIREBASE_PROJECT_ID: 'demo-smartclassroom' }), /EMULATOR/);
});
for (const host of ['http://127.0.0.1:8085', 'example.com:8085', '127.0.0.1:99999']) {
  test('Reject invalid emulator host: ' + host, () => {
    assert.throws(() => readFirebaseConfig({
      FIREBASE_PROJECT_ID: 'demo-smartclassroom', FIRESTORE_EMULATOR_HOST: host
    }));
  });
}
test('Cloud setup reports missing configuration or missing credentials early', () => {
  assert.throws(() => readFirebaseConfig({}), /FIREBASE_PROJECT_ID/);
  assert.throws(() => readFirebaseConfig({ FIREBASE_PROJECT_ID: 'your-firebase-project-id' }), /Project ID/);
  assert.throws(() => readFirebaseConfig({ FIREBASE_PROJECT_ID: 'smartclassroom-123' }), /CREDENTIALS/);
  assert.throws(() => readFirebaseConfig({
    FIREBASE_PROJECT_ID: 'smartclassroom-123', GOOGLE_APPLICATION_CREDENTIALS: './missing-test-key.json'
  }), /Không tìm thấy/);
});
test('MQTT over TLS preserves the actual password and timeout settings', () => {
  const config = readMqttConfig({
    MQTT_URL: 'mqtts://cluster.example.test:8883', MQTT_USERNAME: 'student',
    MQTT_PASSWORD: ' quoted password ', MQTT_CONNECT_TIMEOUT_MS: '3000'
  });
  assert.equal(config.options.password, ' quoted password ');
  assert.equal(config.options.connectTimeout, 3000);
});
test('Plain MQTT is permitted for loopback tests without credentials', () => {
  const config = readMqttConfig({ MQTT_URL: 'mqtt://127.0.0.1:1883' });
  assert.equal(config.options.username, undefined);
});
test('Reject unencrypted remote MQTT and credentials embedded in the URL', () => {
  assert.throws(() => readMqttConfig({ MQTT_URL: 'mqtt://remote.example.test:1883' }), /mqtts/);
  assert.throws(() => readMqttConfig({ MQTT_URL: 'mqtts://user:secret@broker.example.test:8883' }), /MQTT_USERNAME/);
});
test('Reject placeholder broker, credentials, invalid URL and invalid timeouts', () => {
  assert.throws(() => readMqttConfig({ MQTT_URL: 'mqtts://your-cluster-hostname:8883' }));
  assert.throws(() => readMqttConfig({ MQTT_URL: 'invalid-url' }));
  assert.throws(() => readMqttConfig({ MQTT_URL: 'mqtts://cluster.example.test:8883' }), /MQTT_USERNAME/);
  assert.throws(() => readMqttConfig({
    MQTT_URL: 'mqtt://localhost:1883', MQTT_CONNECT_TIMEOUT_MS: '0'
  }), /nguyên dương/);
});
test('Resolve relative credentials from the checkout backend, including spaces in the path', t => {
  const checkout = mkdtempSync(join(tmpdir(), 'smartclassroom path-'));
  t.after(() => removeTestTemp(checkout));
  const backendDir = join(checkout, 'Team project', 'backend');
  mkdirSync(join(backendDir, 'config'), { recursive: true });
  const credentialsPath = join(backendDir, 'config', 'serviceAccountKey.json');
  writeFileSync(credentialsPath, '{}');
  const config = readFirebaseConfig({
    FIREBASE_PROJECT_ID: 'smartclassroom-123',
    GOOGLE_APPLICATION_CREDENTIALS: './config/serviceAccountKey.json'
  }, { backendDir });
  assert.equal(config.credentialsPath, credentialsPath);
  assert.notEqual(config.credentialsPath, resolve('./config/serviceAccountKey.json'));
});
test('Explicit absolute credential paths remain supported', t => {
  const dir = mkdtempSync(join(tmpdir(), 'smartclassroom-key-'));
  t.after(() => removeTestTemp(dir));
  const credentialsPath = join(dir, 'key.json');
  writeFileSync(credentialsPath, '{}');
  assert.equal(readFirebaseConfig({
    FIREBASE_PROJECT_ID: 'smartclassroom-123', GOOGLE_APPLICATION_CREDENTIALS: credentialsPath
  }).credentialsPath, credentialsPath);
});
