// Đọc cấu hình từ server/.env (nếu có), biến môi trường và contract/system.json.
// Mọi module khác chỉ lấy cấu hình qua loadConfig(), không đọc process.env trực tiếp.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFirebaseConfig } from './services/firestore/config.js';

const here = path.dirname(fileURLToPath(import.meta.url));
export const SERVER_ROOT = path.resolve(here, '..');
export const REPO_ROOT = path.resolve(SERVER_ROOT, '..');
export const CONTRACT_PATH = path.join(REPO_ROOT, 'contract', 'system.json');
export const WEB_ROOT = path.join(REPO_ROOT, 'frontend'); // giao diện (HTML/CSS/JS thuần)

const MODES = ['sim', 'live'];
const DEVICE_ID = /^[A-Za-z0-9_-]{1,64}$/;
const LOG_LEVELS = ['error', 'warn', 'info', 'debug'];

/** Nạp server/.env vào process.env. Không có file thì bỏ qua; biến đã đặt sẵn không bị ghi đè. */
export function loadEnvFile(file = path.join(SERVER_ROOT, '.env')) {
  if (!fs.existsSync(file)) return false;
  process.loadEnvFile(file);
  return true;
}

export function readContract(file = CONTRACT_PATH) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    throw new Error(`Không đọc được hợp đồng dữ liệu ${file}: ${err.message}`);
  }
}

function str(env, key, fallback) {
  const v = env[key];
  return v === undefined || v.trim() === '' ? fallback : v.trim();
}

function oneOf(env, key, allowed, fallback) {
  const v = str(env, key, fallback).toLowerCase();
  if (!allowed.includes(v)) throw new Error(`${key}="${v}" không hợp lệ. Chọn một trong: ${allowed.join(', ')}`);
  return v;
}

function bool(env, key, fallback) {
  const v = str(env, key, String(fallback)).toLowerCase();
  if (['true', '1', 'yes'].includes(v)) return true;
  if (['false', '0', 'no'].includes(v)) return false;
  throw new Error(`${key}="${v}" không hợp lệ. Dùng true hoặc false`);
}

function intInRange(env, key, fallback, min, max) {
  const n = Number(str(env, key, String(fallback)));
  if (!Number.isInteger(n) || n < min || n > max) throw new Error(`${key} phải là số nguyên ${min}–${max}`);
  return n;
}

const LOOPBACK = ['localhost', '127.0.0.1', '[::1]', '::1'];

/**
 * Kiểm tra cấu hình MQTT. Broker trên máy này thì thoải mái; broker từ xa (HiveMQ Cloud) bắt buộc TLS và tài khoản,
 * để không lỡ gửi mật khẩu rõ qua internet hay chạy với giá trị mẫu chưa thay.
 */
function mqttConfig(env) {
  const url = str(env, 'MQTT_URL', 'mqtt://localhost:1883');
  const username = str(env, 'MQTT_USER', undefined);
  const password = str(env, 'MQTT_PASS', undefined);
  let u;
  try {
    u = new URL(url);
  } catch {
    throw new Error('MQTT_URL không hợp lệ. Dùng mqtts://<cluster>:8883 hoặc mqtt://localhost:1883');
  }
  if (!['mqtt:', 'mqtts:'].includes(u.protocol)) throw new Error('MQTT_URL phải bắt đầu bằng mqtt:// hoặc mqtts://');
  if (u.username || u.password || u.search || u.hash || (u.pathname && u.pathname !== '/')) {
    throw new Error('MQTT_URL chỉ gồm giao thức, host và cổng; đặt tài khoản ở MQTT_USER / MQTT_PASS');
  }
  if (!LOOPBACK.includes(u.hostname)) {
    if (u.protocol !== 'mqtts:') throw new Error('Broker từ xa phải dùng mqtts:// (TLS, cổng 8883); mqtt:// chỉ dành cho localhost');
    if (!username || !password) throw new Error('Broker từ xa cần MQTT_USER và MQTT_PASS');
    if (/^(your|thay)-/i.test(u.hostname) || /^(your|thay)-/i.test(username) || /^(your|thay)-/i.test(password)) {
      throw new Error('MQTT_URL / MQTT_USER / MQTT_PASS vẫn là giá trị mẫu, hãy thay bằng thông tin thật');
    }
  }
  return Object.freeze({ url, username, password });
}

function port(env, key, fallback) {
  const n = Number(str(env, key, String(fallback)));
  if (!Number.isInteger(n) || n < 0 || n > 65535) throw new Error(`${key} phải là số cổng 0–65535`);
  return n;
}

/**
 * Tạo cấu hình đã kiểm tra.
 * @param {object} [opts]
 * @param {NodeJS.ProcessEnv} [opts.env]  mặc định process.env
 * @param {object} [opts.contract]        mặc định đọc contract/system.json
 */
export function loadConfig({ env = process.env, contract = readContract() } = {}) {
  const deviceId = str(env, 'DEVICE_ID', contract.deviceId);
  // deviceId nằm trong topic MQTT và đường dẫn Firestore devices/{deviceId}: chặn "/", "+", "#", dấu cách…
  if (!DEVICE_ID.test(deviceId)) {
    throw new Error(`DEVICE_ID="${deviceId}" không hợp lệ (1–64 ký tự chữ, số, _ hoặc -)`);
  }
  const topics = Object.fromEntries(
    Object.entries(contract.topics).map(([k, t]) => [k, t.replace('{deviceId}', deviceId)]),
  );

  return Object.freeze({
    port: port(env, 'PORT', 3000),
    mode: oneOf(env, 'MODE', MODES, 'sim'),
    logLevel: oneOf(env, 'LOG_LEVEL', LOG_LEVELS, 'info'),
    deviceId,
    topics: Object.freeze(topics),
    mqtt: mqttConfig(env),
    // null = chưa cấu hình Firestore: plugin firestore tự tắt, giả lập vẫn chạy bình thường
    firebase: readFirebaseConfig(env, { baseDir: SERVER_ROOT }),
    historyProvider: str(env, 'HISTORY_PROVIDER', 'memory'),
    historySeedHours: intInRange(env, 'HISTORY_SEED_HOURS', 0, 0, 24 * 7),
    authEnabled: bool(env, 'AUTH_ENABLED', false),
    // In mỗi bản tin ra log ở mức info (mặc định bật khi giả lập; npm run dev tắt vì giả lập đã in)
    logReadings: bool(env, 'LOG_READINGS', str(env, 'MODE', 'sim').toLowerCase() === 'sim'),
    pluginsDisabled: str(env, 'PLUGINS_DISABLED', '')
      .split(',').map((s) => s.trim()).filter(Boolean),
    // Dữ liệu lúc chạy: bảng màu LED gửi gần nhất (core/led-store.js). Thư mục đã ignore.
    dataDir: path.resolve(SERVER_ROOT, str(env, 'DATA_DIR', 'data')),
    webRoot: WEB_ROOT,
    contract,
  });
}

/** Bản cấu hình an toàn để in log: ẩn mật khẩu. */
export function describeConfig(cfg) {
  return {
    port: cfg.port,
    mode: cfg.mode,
    deviceId: cfg.deviceId,
    mqtt: { url: cfg.mqtt.url, username: cfg.mqtt.username ?? null, password: cfg.mqtt.password ? '***' : null },
    firebase: cfg.firebase ? { projectId: cfg.firebase.projectId, emulator: cfg.firebase.emulatorHost } : null,
    historyProvider: cfg.historyProvider,
    historySeedHours: cfg.historySeedHours,
    authEnabled: cfg.authEnabled,
    pluginsDisabled: cfg.pluginsDisabled,
    dataDir: cfg.dataDir,
    contractVersion: cfg.contract.contractVersion,
  };
}
