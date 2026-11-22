// Mô phỏng phần dữ liệu của ESP32: sinh bản tin telemetry theo kịch bản (plan.md mục 7.2).
// Không đụng mạng — sim-esp32.js lo phần MQTT. Tách riêng để kiểm thử được.
import { METRICS, levelWithHysteresis } from '../../src/core/levels.js';

// Giá trị minh họa của thiết kế (HANDOFF §6)
const BASE = { temperature: 27.5, humidity: 64.5, co2: 850 };
const NOISE = { temperature: 0.15, humidity: 0.4, co2: 12 };

/** Kịch bản gửi dữ liệu. `pause`, `offline`, `bad`, `burst` là hành vi kết nối, xử lý ở sim-esp32.js. */
export const SCENARIOS = {
  normal: { key: 'n', label: 'Bình thường (64,5 % · 27,5 °C · 850 ppm)' },
  'humid-high': { key: 'h', label: 'Độ ẩm cao 88 % (DK-16, ST-07)', target: { humidity: 88 } },
  'humid-low': { key: 'l', label: 'Độ ẩm thấp 24 % (DK-16)', target: { humidity: 24 } },
  'temp-watch': { key: 't', label: 'Nhiệt độ 32 °C · cần chú ý (ST-16)', target: { temperature: 32 } },
  'dht-error': { key: 'e', label: 'DHT22 lỗi (ST-05)', sensors: { dht22: 'error' } },
  'mq-warming': { key: 'w', label: 'MQ-135 đang làm nóng (ST-06)', sensors: { mq135: 'warming' } },
  pause: { key: 'p', label: 'Ngừng gửi, giữ kết nối → dữ liệu cũ sau 90 giây (ST-03)' },
  offline: { key: 'o', label: 'Rớt mạng đột ngột → LWT ngoại tuyến (ST-04)' },
  bad: { key: 'b', label: 'Gửi bản tin lỗi để thử kiểm tra dữ liệu' },
  burst: { key: 'u', label: 'Gửi dồn 20 bản tin' },
};

/** Bản tin lỗi có chủ đích — backend phải bỏ hoặc làm sạch, không được sập. */
export const BAD_PAYLOADS = [
  { note: 'JSON hỏng', payload: '{"v":1,"humidity":' },
  { note: 'sai phiên bản', payload: JSON.stringify({ v: 2, temperature: 27, humidity: 60, co2: 800 }) },
  { note: 'không phải đối tượng', payload: '[1,2,3]' },
  { note: 'độ ẩm là chữ', payload: JSON.stringify({ v: 1, seq: 0, uptimeS: 0, temperature: 27, humidity: 'abc', co2: 800, sensors: { dht22: 'ok', mq135: 'ok' } }) },
  { note: 'độ ẩm 150 % (ngoài khoảng)', payload: JSON.stringify({ v: 1, seq: 0, uptimeS: 0, temperature: 27, humidity: 150, co2: 800, sensors: { dht22: 'ok', mq135: 'ok' } }) },
  { note: 'mức không hợp lệ', payload: JSON.stringify({ v: 1, seq: 0, uptimeS: 0, temperature: 27, humidity: 60, co2: 800, sensors: { dht22: 'ok', mq135: 'ok' }, levels: { temperature: 'hot', humidity: 'normal', co2: 'normal' } }) },
];

function gaussian(rng) {
  // Box–Muller
  const u = 1 - rng();
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * @param {object} opts
 * @param {object} opts.contract     contract/system.json
 * @param {boolean} [opts.withLevels=true]  gửi kèm `levels` như firmware ID 3
 * @param {() => number} [opts.rng]
 * @param {() => number} [opts.now]   ms
 */
export function createSimDevice({ contract, withLevels = true, rng = Math.random, now = Date.now }) {
  const startedAt = now();
  const bootId = Math.floor(rng() * 0xffffffff).toString(16).padStart(8, '0'); // mỗi lần chạy một mã, như firmware sau mỗi lần khởi động
  const values = { ...BASE };
  const prevLevels = { temperature: null, humidity: null, co2: null };
  let seq = 0;
  let scenario = 'normal';

  const round = (m, v) => {
    const f = 10 ** contract.metrics[m].decimals;
    return Math.round(v * f) / f;
  };

  return {
    get scenario() { return scenario; },

    setScenario(name) {
      if (!SCENARIOS[name]) throw new Error(`Không có kịch bản "${name}". Có: ${Object.keys(SCENARIOS).join(', ')}`);
      scenario = name;
    },

    /** Sinh bản tin telemetry tiếp theo theo kịch bản hiện tại. */
    next() {
      const sc = SCENARIOS[scenario] ?? SCENARIOS.normal;
      const target = { ...BASE, ...sc.target };
      const sensors = { dht22: 'ok', mq135: 'ok', ...sc.sensors };

      // Trôi dần về mục tiêu + nhiễu nhỏ (không nhảy cóc); kẹp trong khoảng hợp lệ
      for (const m of METRICS) {
        const [lo, hi] = contract.metrics[m].valid;
        values[m] += (target[m] - values[m]) * 0.5 + gaussian(rng) * NOISE[m];
        values[m] = Math.min(hi, Math.max(lo, values[m]));
      }

      const out = {};
      for (const m of METRICS) {
        const sensor = m === 'co2' ? sensors.mq135 : sensors.dht22;
        out[m] = sensor === 'ok' ? round(m, values[m]) : null;
      }

      const msg = {
        v: 1,
        seq: seq++,
        bootId,
        uptimeS: Math.floor((now() - startedAt) / 1000),
        ...out,
        sensors,
      };

      if (withLevels) {
        msg.levels = {};
        for (const m of METRICS) {
          const lv = levelWithHysteresis(contract, m, out[m], prevLevels[m]);
          msg.levels[m] = lv;
          prevLevels[m] = lv;
        }
      }
      return msg;
    },
  };
}
