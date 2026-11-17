const { existsSync } = require('node:fs');
const { resolve } = require('node:path');

const DEVICE_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
// Resolve private configuration paths from backend/, regardless of the caller.
const BACKEND_DIR = resolve(__dirname, '..');

function required(env, key) {
  const value = env[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Thiếu ' + key + '. Kiểm tra backend/.env.');
  }
  return value.trim();
}

function readDeviceId(env = process.env) {
  const deviceId = required(env, 'DEVICE_ID');
  if (!DEVICE_ID_PATTERN.test(deviceId)) throw new Error('DEVICE_ID không hợp lệ.');
  return deviceId;
}

function positiveInteger(env, key, fallback) {
  if (!env[key]) return fallback;
  const number = Number(env[key]);
  if (!Number.isSafeInteger(number) || number <= 0) {
    throw new Error(key + ' phải là số nguyên dương.');
  }
  return number;
}

function readFirebaseConfig(env = process.env, { backendDir = BACKEND_DIR } = {}) {
  const projectId = required(env, 'FIREBASE_PROJECT_ID');
  if (!/^[a-z][a-z0-9-]{4,61}[a-z0-9]$/.test(projectId)
    || projectId.startsWith('your-') || projectId.startsWith('thay-')) {
    throw new Error('Thay FIREBASE_PROJECT_ID bằng Project ID thật hoặc demo-smartclassroom.');
  }
  const emulatorHost = env.FIRESTORE_EMULATOR_HOST?.trim() || null;
  if (emulatorHost) {
    // Keep emulator traffic local; do not silently accept a URL with a protocol.
    if (!/^(127\.0\.0\.1|localhost|\[::1\]):[1-9]\d{0,4}$/.test(emulatorHost)
      || Number(emulatorHost.slice(emulatorHost.lastIndexOf(':') + 1)) > 65535) {
      throw new Error('FIRESTORE_EMULATOR_HOST phải có dạng 127.0.0.1:8085, không có http://.');
    }
    return { projectId, emulatorHost };
  }
  if (projectId.startsWith('demo-')) {
    throw new Error('Project demo-* cần FIRESTORE_EMULATOR_HOST; không dùng để ghi cloud.');
  }
  // A relative key path always starts at backend/, regardless of process.cwd().
  const credentialsPath = resolve(backendDir, required(env, 'GOOGLE_APPLICATION_CREDENTIALS'));
  if (!existsSync(credentialsPath)) {
    throw new Error('Không tìm thấy file GOOGLE_APPLICATION_CREDENTIALS. Xem hướng dẫn Firebase.');
  }
  return { projectId, emulatorHost: null, credentialsPath };
}

function readMqttConfig(env = process.env) {
  let url;
  try {
    url = new URL(required(env, 'MQTT_URL'));
  } catch {
    throw new Error('MQTT_URL không hợp lệ. Dùng mqtts://hostname:8883.');
  }
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'mqtts:' && !(url.protocol === 'mqtt:' && loopback)) {
    throw new Error('Dùng mqtts:// cho HiveMQ Cloud; mqtt:// chỉ dành cho broker localhost.');
  }
  if (url.username || url.password || url.search || url.hash
    || (url.pathname && url.pathname !== '/')) {
    throw new Error('MQTT_URL chỉ chứa giao thức, host và port; đặt tài khoản ở MQTT_USERNAME/PASSWORD.');
  }
  if (url.hostname.startsWith('your-') || url.hostname.startsWith('thay-')) {
    throw new Error('Thay MQTT_URL bằng hostname của cluster HiveMQ.');
  }
  const username = loopback ? (env.MQTT_USERNAME || undefined) : required(env, 'MQTT_USERNAME');
  if (!loopback) required(env, 'MQTT_PASSWORD');
  // Whitespace can be part of a quoted password in .env; preserve it.
  const password = env.MQTT_PASSWORD || undefined;
  if (!loopback && (username === 'your-mqtt-username' || password === 'your-mqtt-password')) {
    throw new Error('Thay MQTT_USERNAME và MQTT_PASSWORD bằng tài khoản MQTT thật.');
  }
  return {
    url: url.href,
    options: {
      username, password,
      connectTimeout: positiveInteger(env, 'MQTT_CONNECT_TIMEOUT_MS', 10000),
      reconnectPeriod: positiveInteger(env, 'MQTT_RECONNECT_PERIOD_MS', 2000)
    }
  };
}

module.exports = { BACKEND_DIR, readDeviceId, readFirebaseConfig, readMqttConfig };
