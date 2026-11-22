// Lịch sử trong bộ nhớ — chỉ cho chế độ giả lập (mất khi tắt backend).
// Bản thật (Firestore) là của Tuấn, phải trả cùng dạng: contract/examples/api.history.json.
export const RETENTION_MS = 8 * 24 * 3600 * 1000; // đủ cho "7 ngày qua" theo ngày
const MAX_POINTS = 30_000;
const HOUR_MS = 3600 * 1000;
const VN_OFFSET_MS = 7 * HOUR_MS; // ngày bắt đầu lúc 00:00 giờ Việt Nam (UTC+7, không đổi giờ mùa hè)

/** Mốc đầu khoảng chứa t: giờ tròn, hoặc 00:00 UTC+7. */
export function bucketStart(t, bucket) {
  if (bucket === 'hour') return Math.floor(t / HOUR_MS) * HOUR_MS;
  const day = 24 * HOUR_MS;
  return Math.floor((t + VN_OFFSET_MS) / day) * day - VN_OFFSET_MS;
}

export function bucketSize(bucket) {
  return bucket === 'hour' ? HOUR_MS : 24 * HOUR_MS;
}

export function create({ config, bus, now = () => Date.now() }) {
  /** @type {{ t: number, temperature: number|null, humidity: number|null, co2: number|null }[]} theo thứ tự thời gian */
  const points = [];

  function prune() {
    const cutoff = now() - RETENTION_MS;
    let drop = 0;
    while (drop < points.length && points[drop].t < cutoff) drop++;
    if (points.length - drop > MAX_POINTS) drop = points.length - MAX_POINTS;
    if (drop) points.splice(0, drop);
  }

  function add(r) {
    const t = Date.parse(r.receivedAt);
    const p = { t, temperature: r.temperature, humidity: r.humidity, co2: r.co2 };
    // Thường đến theo thứ tự; dữ liệu gieo sẵn có thể chen giữa → chèn đúng chỗ
    let i = points.length;
    while (i > 0 && points[i - 1].t > t) i--;
    points.splice(i, 0, p);
  }

  const off = bus?.on('reading', (r) => { add(r); prune(); }, 'history:memory');

  return {
    /** Gieo dữ liệu giả lập quá khứ (HISTORY_SEED_HOURS, chỉ chế độ sim). */
    seed(readings) {
      for (const r of readings) add(r);
      prune();
    },

    size: () => points.length,

    async query({ metric, from, to, bucket }) {
      const { unit, decimals } = config.contract.metrics[metric];
      const f = 10 ** decimals;
      const round = (v) => Math.round(v * f) / f;
      const size = bucketSize(bucket);
      const start = bucketStart(from.getTime(), bucket);
      const end = to.getTime();

      const out = [];
      let i = points.findIndex((p) => p.t >= start);
      if (i === -1) i = points.length;
      for (let b = start; b < end; b += size) {
        let n = 0; let sum = 0; let min = Infinity; let max = -Infinity;
        for (; i < points.length && points[i].t < b + size; i++) {
          const v = points[i][metric];
          if (v === null || points[i].t >= end) continue;
          n++; sum += v; min = Math.min(min, v); max = Math.max(max, v);
        }
        out.push(n
          ? { t: new Date(b).toISOString(), avg: round(sum / n), min, max, n }
          : { t: new Date(b).toISOString(), avg: null, min: null, max: null, n: 0 });
      }
      return { metric, unit, bucket, from: new Date(start).toISOString(), to: to.toISOString(), points: out };
    },

    async close() {
      off?.();
    },
  };
}
