// Ghi và đọc dữ liệu cảm biến trên Firestore: contract/README.md mục 8.1.
//
// Mỗi bản tin (Reading đã kiểm tra) ghi hai thứ trong CÙNG MỘT giao dịch:
//   1. một document bản tin       devices/{deviceId}/readings/{readingId}
//   2. cộng dồn vào document giờ  devices/{deviceId}/hourly/{yyyyMMddHH UTC}   (n, tổng, nhỏ nhất, lớn nhất)
// Document giờ để vẽ biểu đồ chỉ tốn vài chục lượt đọc thay vì hàng nghìn (hạn mức đọc mỗi ngày của Firestore).
// Dùng create() nên bản tin gửi lại chỉ tạo một document và không bị cộng dồn hai lần.
import { createHash } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export const METRICS = ['temperature', 'humidity', 'co2'];
const HOUR_MS = 3600 * 1000;
/** Mã gRPC đáng thử lại: UNAVAILABLE 14, DEADLINE_EXCEEDED 4, ABORTED 10, INTERNAL 13, RESOURCE_EXHAUSTED 8. */
const RETRYABLE_CODES = new Set([4, 8, 10, 13, 14]);
const ALREADY_EXISTS = 6;

/** Tên collection theo chế độ: dữ liệu giả lập tách riêng để không lẫn vào dữ liệu thật. */
export function collectionNames(mode) {
  return mode === 'live'
    ? { raw: 'readings', hourly: 'hourly' }
    : { raw: 'readings_sim', hourly: 'hourly_sim' };
}

/** Có bootId: [deviceId, bootId, seq] (chống trùng). Thiếu: [deviceId, receivedAt, seq] (không đè dữ liệu nào). */
export function readingId(deviceId, reading) {
  const key = reading.bootId
    ? [deviceId, reading.bootId, reading.seq]
    : [deviceId, reading.receivedAt, reading.seq];
  return createHash('sha256').update(JSON.stringify(key)).digest('hex');
}

/** Mốc đầu giờ (UTC) chứa thời điểm t (ms). */
export const hourStartMs = (t) => Math.floor(t / HOUR_MS) * HOUR_MS;

/** Mã document giờ: yyyyMMddHH theo UTC, ví dụ "2026112215". */
export function hourId(t) {
  return new Date(hourStartMs(t)).toISOString().slice(0, 13).replace(/[-T]/g, '');
}

/** Cộng một bản tin vào tổng hợp giờ. Số đo null (cảm biến lỗi hoặc đang làm nóng) thì bỏ qua, không tính vào n. */
export function mergeHourly(prev, reading) {
  const next = {};
  for (const m of METRICS) {
    const cur = prev?.[m] ?? { n: 0, sum: 0, min: null, max: null };
    const v = reading[m];
    next[m] = typeof v === 'number' && Number.isFinite(v)
      ? {
        n: cur.n + 1,
        sum: cur.sum + v,
        min: cur.min === null ? v : Math.min(cur.min, v),
        max: cur.max === null ? v : Math.max(cur.max, v),
      }
      : { ...cur };
  }
  return next;
}

/**
 * @param {object} db  Firestore
 * @param {object} opts
 * @param {string} opts.deviceId
 * @param {'live'|'sim'} opts.mode
 * @param {Function} [opts.sleep]   thay delay khi kiểm thử
 */
export function createReadingStore(db, { deviceId, mode, sleep = delay }) {
  const names = collectionNames(mode);
  const device = db.collection('devices').doc(deviceId);
  const rawCol = device.collection(names.raw);
  const hourlyCol = device.collection(names.hourly);

  return {
    names,

    /** @returns {Promise<{ id: string, duplicate: boolean }>} */
    async saveReading(reading) {
      const t = Date.parse(reading.receivedAt);
      const rawRef = rawCol.doc(readingId(deviceId, reading));
      const hourRef = hourlyCol.doc(hourId(t));
      const raw = {
        receivedAt: Timestamp.fromDate(new Date(t)),
        storedAt: FieldValue.serverTimestamp(),
        seq: reading.seq ?? null,
        bootId: reading.bootId ?? null,
        temperature: reading.temperature,
        humidity: reading.humidity,
        co2: reading.co2,
        sensors: reading.sensors,
        levels: reading.levels,
        levelsSource: reading.levelsSource,
      };

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await db.runTransaction(async (tx) => {
            const prev = await tx.get(hourRef);
            tx.create(rawRef, raw); // đã có thì cả giao dịch hỏng với ALREADY_EXISTS: không cộng dồn lần hai
            tx.set(hourRef, {
              hourStart: Timestamp.fromMillis(hourStartMs(t)),
              updatedAt: FieldValue.serverTimestamp(),
              ...mergeHourly(prev.exists ? prev.data() : null, reading),
            });
          });
          return { id: rawRef.id, duplicate: false };
        } catch (error) {
          if (error.code === ALREADY_EXISTS) return { id: rawRef.id, duplicate: true };
          if (!RETRYABLE_CODES.has(error.code) || attempt === 2) throw error;
          await sleep(500 * (2 ** attempt));
        }
      }
    },

    /** Đọc các document giờ có mốc đầu giờ trong [fromMs, toMs), theo thứ tự thời gian. */
    async readHourly(fromMs, toMs) {
      const snap = await hourlyCol
        .where('hourStart', '>=', Timestamp.fromMillis(hourStartMs(fromMs)))
        .where('hourStart', '<', Timestamp.fromMillis(toMs))
        .orderBy('hourStart')
        .get();
      return snap.docs.map((d) => {
        const x = d.data();
        return { t: x.hourStart.toMillis(), temperature: x.temperature, humidity: x.humidity, co2: x.co2 };
      });
    },
  };
}
