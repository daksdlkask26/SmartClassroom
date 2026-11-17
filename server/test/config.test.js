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
