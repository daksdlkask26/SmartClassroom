import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeConfig, loadConfig, readContract } from '../src/config.js';

const contract = readContract();

test('mặc định khi không có biến môi trường', () => {
  const cfg = loadConfig({ env: {}, contract });
  assert.equal(cfg.port, 3000);
  assert.equal(cfg.mode, 'sim');
  assert.equal(cfg.deviceId, 'sc-01');
  assert.equal(cfg.authEnabled, false);
  assert.equal(cfg.historyProvider, 'memory');
  assert.deepEqual(cfg.pluginsDisabled, []);
  assert.equal(cfg.topics.telemetry, 'smartclassroom/sc-01/telemetry');
  assert.equal(cfg.topics.ledCmd, 'smartclassroom/sc-01/led/cmd');
});

test('đọc biến môi trường, bỏ khoảng trắng, tách danh sách plugin', () => {
  const cfg = loadConfig({
    env: { PORT: '4000', MODE: 'LIVE', DEVICE_ID: 'sc-02', AUTH_ENABLED: 'true', PLUGINS_DISABLED: ' telegram , firestore ,' },
    contract,
  });
  assert.equal(cfg.port, 4000);
  assert.equal(cfg.mode, 'live');
  assert.equal(cfg.topics.status, 'smartclassroom/sc-02/status');
  assert.equal(cfg.authEnabled, true);
  assert.deepEqual(cfg.pluginsDisabled, ['telegram', 'firestore']);
});

test('biến rỗng dùng giá trị mặc định', () => {
  const cfg = loadConfig({ env: { PORT: '', MQTT_USER: '  ' }, contract });
  assert.equal(cfg.port, 3000);
  assert.equal(cfg.mqtt.username, undefined);
});

test('báo lỗi rõ khi giá trị sai', () => {
  assert.throws(() => loadConfig({ env: { MODE: 'demo' }, contract }), /MODE="demo"/);
  assert.throws(() => loadConfig({ env: { PORT: 'abc' }, contract }), /PORT/);
  assert.throws(() => loadConfig({ env: { AUTH_ENABLED: 'maybe' }, contract }), /AUTH_ENABLED/);
});

test('DEVICE_ID: chỉ chữ, số, _ và -; chặn ký tự làm hỏng topic MQTT hoặc đường dẫn Firestore', () => {
  assert.equal(loadConfig({ env: { DEVICE_ID: 'esp32_01-A' }, contract }).deviceId, 'esp32_01-A');
  for (const bad of ['sc/01', '../sc', 'sc 01', 'sc+', 'sc#', 'phòng-1', 'x'.repeat(65)]) {
    assert.throws(() => loadConfig({ env: { DEVICE_ID: bad }, contract }), /DEVICE_ID/, bad);
  }
});

test('describeConfig không làm lộ mật khẩu MQTT', () => {
  const cfg = loadConfig({ env: { MQTT_USER: 'u', MQTT_PASS: 'bi-mat-123' }, contract });
  const text = JSON.stringify(describeConfig(cfg));
  assert.ok(!text.includes('bi-mat-123'));
  assert.ok(text.includes('***'));
});

test('cấu hình không sửa được sau khi tạo', () => {
  const cfg = loadConfig({ env: {}, contract });
  assert.ok(Object.isFrozen(cfg));
  assert.ok(Object.isFrozen(cfg.mqtt));
});

test('firebase: không đặt FIREBASE_PROJECT_ID thì null (plugin tự tắt)', () => {
  assert.equal(loadConfig({ env: {}, contract }).firebase, null);
});

test('firebase: Emulator hợp lệ; sai định dạng, project mẫu, demo-* không Emulator, thiếu khóa đều báo lỗi', () => {
  const base = { FIREBASE_PROJECT_ID: 'demo-smartclassroom' };
  const ok = loadConfig({ env: { ...base, FIRESTORE_EMULATOR_HOST: '127.0.0.1:8085' }, contract });
  assert.deepEqual(ok.firebase, { projectId: 'demo-smartclassroom', emulatorHost: '127.0.0.1:8085' });
  assert.throws(() => loadConfig({ env: { ...base, FIRESTORE_EMULATOR_HOST: 'http://127.0.0.1:8085' }, contract }), /FIRESTORE_EMULATOR_HOST/);
  assert.throws(() => loadConfig({ env: { ...base, FIRESTORE_EMULATOR_HOST: '10.0.0.5:8085' }, contract }), /FIRESTORE_EMULATOR_HOST/);
  assert.throws(() => loadConfig({ env: { FIREBASE_PROJECT_ID: 'your-firebase-project-id' }, contract }), /Project ID/);
  assert.throws(() => loadConfig({ env: base, contract }), /demo-\*/);
  assert.throws(() => loadConfig({ env: { FIREBASE_PROJECT_ID: 'sc-thật-1', GOOGLE_APPLICATION_CREDENTIALS: 'x' }, contract }), /Project ID/);
  assert.throws(() => loadConfig({ env: { FIREBASE_PROJECT_ID: 'smart-class-1' }, contract }), /GOOGLE_APPLICATION_CREDENTIALS/);
  assert.throws(() => loadConfig({ env: { FIREBASE_PROJECT_ID: 'smart-class-1', GOOGLE_APPLICATION_CREDENTIALS: './không-có.json' }, contract }), /Không tìm thấy/);
});

test('describeConfig không lộ khóa Firebase', () => {
  const cfg = loadConfig({ env: { FIREBASE_PROJECT_ID: 'demo-smartclassroom', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8085' }, contract });
  assert.deepEqual(describeConfig(cfg).firebase, { projectId: 'demo-smartclassroom', emulator: '127.0.0.1:8085' });
});

test('mqtt: localhost thoải mái; broker từ xa bắt buộc mqtts, tài khoản, không giá trị mẫu, không nhét mật khẩu vào URL', () => {
  assert.equal(loadConfig({ env: { MQTT_URL: 'mqtt://localhost:1883' }, contract }).mqtt.url, 'mqtt://localhost:1883');
  assert.equal(loadConfig({ env: { MQTT_URL: 'mqtt://127.0.0.1:1884' }, contract }).mqtt.url, 'mqtt://127.0.0.1:1884');
  const remote = { MQTT_URL: 'mqtts://abc123.s1.eu.hivemq.cloud:8883', MQTT_USER: 'u', MQTT_PASS: 'p' };
  assert.equal(loadConfig({ env: remote, contract }).mqtt.username, 'u');
  assert.throws(() => loadConfig({ env: { ...remote, MQTT_URL: 'mqtt://abc123.s1.eu.hivemq.cloud:1883' }, contract }), /mqtts/);
  assert.throws(() => loadConfig({ env: { ...remote, MQTT_PASS: '' }, contract }), /MQTT_USER và MQTT_PASS/);
  assert.throws(() => loadConfig({ env: { ...remote, MQTT_USER: 'your-mqtt-username' }, contract }), /giá trị mẫu/);
  assert.throws(() => loadConfig({ env: { ...remote, MQTT_URL: 'mqtts://u:p@abc123.s1.eu.hivemq.cloud:8883' }, contract }), /chỉ gồm giao thức/);
  assert.throws(() => loadConfig({ env: { MQTT_URL: 'khong-phai-url' }, contract }), /MQTT_URL/);
  assert.throws(() => loadConfig({ env: { MQTT_URL: 'http://localhost:1883' }, contract }), /mqtt:\/\//);
});
