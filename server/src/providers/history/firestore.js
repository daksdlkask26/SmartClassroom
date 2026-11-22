// Lịch sử từ Firestore (chức năng ID 5): đọc các document tổng hợp theo giờ do plugins/firestore.js ghi.
// Chỉ đọc vài chục document mỗi truy vấn (24 giờ = 24 document cho cả ba chỉ số), kèm cache ngắn,
// nên trang Giám sát tự làm mới mỗi 5 phút cũng không chạm hạn mức đọc của Firestore.
// Trả đúng dạng contract/examples/api.history.json, giống providers/history/memory.js.
import { acquireFirestore } from '../../services/firestore/client.js';
import { collectionNames, createReadingStore } from '../../services/firestore/reading-store.js';
import { bucketSize, bucketStart } from './memory.js';

const CACHE_MS = 60_000;

/**
 * Gom các document giờ thành điểm theo giờ hoặc ngày (00:00 UTC+7). Hàm thuần, kiểm thử được.
 * @param {{ t: number, [metric]: {n,sum,min,max} }[]} hours  theo thứ tự thời gian
 */
export function aggregateHours({ hours, metric, bucket, from, to, decimals }) {
  const f = 10 ** decimals;
  const round = (v) => Math.round(v * f) / f;
  const size = bucketSize(bucket);
  const start = bucketStart(from.getTime(), bucket);
  const end = to.getTime();

  const out = [];
  let i = hours.findIndex((h) => h.t >= start);
  if (i === -1) i = hours.length;
  for (let b = start; b < end; b += size) {
    let n = 0; let sum = 0; let min = Infinity; let max = -Infinity;
    for (; i < hours.length && hours[i].t < b + size; i++) {
      const m = hours[i][metric];
      if (!m || !m.n || hours[i].t >= end) continue;
      n += m.n; sum += m.sum; min = Math.min(min, m.min); max = Math.max(max, m.max);
    }
    out.push(n
      ? { t: new Date(b).toISOString(), avg: round(sum / n), min, max, n }
      : { t: new Date(b).toISOString(), avg: null, min: null, max: null, n: 0 });
  }
  return { start, points: out };
}

/** `acquire`, `now` chỉ để kiểm thử. */
export function create({ config, log, now = () => Date.now(), acquire = acquireFirestore }) {
  if (!config.firebase) {
    throw new Error('HISTORY_PROVIDER=firestore cần FIREBASE_PROJECT_ID trong server/.env (xem server/README.md)');
  }
  const conn = acquire(config.firebase);
  const store = createReadingStore(conn.db, { deviceId: config.deviceId, mode: config.mode });
  const cache = new Map(); // khóa truy vấn → { at, value }
  log?.info(`Đọc lịch sử từ devices/${config.deviceId}/${collectionNames(config.mode).hourly}`);

  return {
    async query({ metric, from, to, bucket }) {
      const key = `${metric}|${bucket}|${from.toISOString()}|${to.toISOString()}`;
      const hit = cache.get(key);
      if (hit && now() - hit.at < CACHE_MS) return hit.value;

      const { unit, decimals } = config.contract.metrics[metric];
      const hours = await store.readHourly(bucketStart(from.getTime(), bucket), to.getTime());
      const { start, points } = aggregateHours({ hours, metric, bucket, from, to, decimals });
      const value = { metric, unit, bucket, from: new Date(start).toISOString(), to: to.toISOString(), points };

      cache.set(key, { at: now(), value });
      if (cache.size > 200) cache.delete(cache.keys().next().value); // giữ bộ nhớ đệm nhỏ
      return value;
    },

    async close() {
      cache.clear();
      await conn.release();
    },
  };
}
