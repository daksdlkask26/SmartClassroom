// Kiểm tra bản tin MQTT theo contract/README.md mục 2.
// Nguyên tắc: JSON hỏng / sai phiên bản → bỏ cả bản tin; một trường sai → chỉ trường đó thành null + cảnh báo.
import { METRICS, computeLevels } from './levels.js';

export const MAX_PAYLOAD_BYTES = 2048;
const SENSOR_STATES = { dht22: ['ok', 'error'], mq135: ['warming', 'ok', 'error'] };
const SENSOR_OF = { temperature: 'dht22', humidity: 'dht22', co2: 'mq135' };
const LED_MODES = ['auto', 'test'];
const BOOT_ID = /^[A-Za-z0-9_-]{1,64}$/;

function parseJson(raw) {
  const text = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw);
  if (Buffer.byteLength(text) > MAX_PAYLOAD_BYTES) return { error: `quá ${MAX_PAYLOAD_BYTES} byte` };
  let obj;
  try {
    obj = JSON.parse(text);
  } catch {
    return { error: 'không phải JSON hợp lệ' };
  }
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return { error: 'không phải đối tượng JSON' };
  if (obj.v !== 1) return { error: `phiên bản v=${JSON.stringify(obj.v)} không hỗ trợ (cần v=1)` };
  return { obj };
}

function round(value, decimals) {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

function nonNegInt(obj, key, warnings) {
  const v = obj[key];
  if (Number.isInteger(v) && v >= 0) return v;
  warnings.push(`${key}=${JSON.stringify(v)} không hợp lệ (cần số nguyên ≥ 0)`);
  return null;
}

function pickLevels(obj, values, contract, warnings) {
  const server = computeLevels(contract, values);
  if (obj.levels === undefined) return { levels: server, source: 'server' };
  if (obj.levels === null || typeof obj.levels !== 'object' || Array.isArray(obj.levels)) {
    warnings.push('levels không phải đối tượng → backend tự tính');
    return { levels: server, source: 'server' };
  }
  const order = contract.led.levelOrder;
  const device = {};
  for (const m of METRICS) {
    const dl = obj.levels[m];
    if (values[m] === null) device[m] = null; // không có giá trị thì không có mức, bất kể firmware gửi gì
    else if (order.includes(dl)) device[m] = dl;
    else {
      warnings.push(`levels.${m}=${JSON.stringify(dl)} không hợp lệ → backend tự tính`);
      return { levels: server, source: 'server' };
    }
  }
  return { levels: device, source: 'device' };
}

/**
 * @param {Buffer|string} raw  nội dung bản tin telemetry
 * @param {object} contract     contract/system.json
 * @param {Date} [now]
 * @returns {{ ok: true, reading: object, warnings: string[] } | { ok: false, error: string }}
 */
export function parseTelemetry(raw, contract, now = new Date()) {
  const { obj, error } = parseJson(raw);
  if (error) return { ok: false, error };
  const warnings = [];

  // Trạng thái cảm biến
  const sensors = {};
  for (const [name, allowed] of Object.entries(SENSOR_STATES)) {
    const s = obj.sensors?.[name];
    if (allowed.includes(s)) sensors[name] = s;
    else {
      sensors[name] = null;
      warnings.push(`sensors.${name}=${JSON.stringify(s)} không hợp lệ (${allowed.join('/')})`);
    }
  }

  // Giá trị đo
  const values = {};
  for (const m of METRICS) {
    const spec = contract.metrics[m];
    const v = obj[m];
    if (!(m in obj)) {
      warnings.push(`thiếu trường ${m}`);
      values[m] = null;
    } else if (v === null) {
      values[m] = null;
    } else if (typeof v !== 'number' || !Number.isFinite(v)) {
      warnings.push(`${m}=${JSON.stringify(v)} không phải số`);
      values[m] = null;
    } else if (v < spec.valid[0] || v > spec.valid[1]) {
      warnings.push(`${m}=${v} ngoài khoảng hợp lệ [${spec.valid.join(', ')}]`);
      values[m] = null;
    } else {
      values[m] = round(v, spec.decimals);
    }
    // Cảm biến báo không ổn thì không tin giá trị (contract mục 2.1)
    const sensorState = sensors[SENSOR_OF[m]];
    if (sensorState && sensorState !== 'ok' && values[m] !== null) {
      warnings.push(`${m} có giá trị nhưng sensors.${SENSOR_OF[m]}="${sensorState}" → bỏ giá trị`);
      values[m] = null;
    }
  }

  // Mức: dùng mức firmware tính (có khoảng trễ) nếu cả bộ hợp lệ; sai một chỗ thì backend tự tính cả bộ,
  // để không có cảnh nửa theo hộp, nửa theo backend.
  const { levels, source } = pickLevels(obj, values, contract, warnings);

  const seq = nonNegInt(obj, 'seq', warnings);
  nonNegInt(obj, 'uptimeS', warnings); // chỉ kiểm tra; không đưa vào Reading (contract mục 5)

  // bootId (contract 0.2.0): mã lần khởi động, cùng seq tạo mã bản ghi không trùng. Tùy chọn: thiếu thì bỏ qua.
  let bootId;
  if ('bootId' in obj) {
    if (typeof obj.bootId === 'string' && BOOT_ID.test(obj.bootId)) bootId = obj.bootId;
    else warnings.push(`bootId=${JSON.stringify(obj.bootId)} không hợp lệ (1–64 ký tự chữ, số, _ hoặc -), bỏ qua`);
  }

  return {
    ok: true,
    warnings,
    reading: {
      receivedAt: now.toISOString(),
      seq,
      ...(bootId ? { bootId } : {}),
      ...values,
      sensors,
      levels,
      levelsSource: source,
    },
  };
}

/**
 * @param {Buffer|string} raw  nội dung bản tin status (kể cả LWT)
 * @returns {{ ok: true, status: object, warnings: string[] } | { ok: false, error: string }}
 */
export function parseStatus(raw) {
  const { obj, error } = parseJson(raw);
  if (error) return { ok: false, error };
  if (typeof obj.online !== 'boolean') return { ok: false, error: 'thiếu trường online (boolean)' };

  const warnings = [];
  const status = { online: obj.online };
  const optional = {
    fw: (v) => typeof v === 'string' && v.length <= 32,
    intervalS: (v) => Number.isInteger(v) && v > 0 && v <= 3600,
    ssid: (v) => typeof v === 'string' && v.length <= 64,
    rssi: (v) => Number.isInteger(v) && v >= -120 && v <= 0,
    ledMode: (v) => LED_MODES.includes(v),
  };
  for (const [key, ok] of Object.entries(optional)) {
    if (!(key in obj)) continue;
    if (ok(obj[key])) status[key] = obj[key];
    else warnings.push(`${key}=${JSON.stringify(obj[key])} không hợp lệ, bỏ qua`);
  }
  return { ok: true, status, warnings };
}
