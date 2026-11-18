// Định dạng số và giờ theo tiếng Việt (HANDOFF §3.2): 64,5 · 27,5 · 850; giờ theo Asia/Ho_Chi_Minh (UTC+7).

export const TIME_ZONE = 'Asia/Ho_Chi_Minh';
export const NO_VALUE = '—';

const numberFormats = new Map();
function numberFormat(decimals) {
  if (!numberFormats.has(decimals)) {
    numberFormats.set(decimals, new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: false, // 1040 ppm, không phải 1.040
    }));
  }
  return numberFormats.get(decimals);
}

/** Số đo → chuỗi; null / không phải số → "—" (không bao giờ hiện số giả). */
export function formatNumber(value, decimals = 0) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return NO_VALUE;
  return numberFormat(decimals).format(value);
}

/**
 * Tách số để vẽ số ma trận chấm: chữ số dùng Doto, dấu phẩy dùng JetBrains Mono.
 * 64.5 → { int: "64", sep: ",", frac: "5" } · null → { int: "—", sep: "", frac: "" }
 */
export function splitNumber(value, decimals = 0) {
  const s = formatNumber(value, decimals);
  if (s === NO_VALUE) return { int: NO_VALUE, sep: '', frac: '' };
  const i = s.indexOf(',');
  return i < 0 ? { int: s, sep: '', frac: '' } : { int: s.slice(0, i), sep: ',', frac: s.slice(i + 1) };
}

const timeFormats = new Map();
function timeFormat(seconds) {
  if (!timeFormats.has(seconds)) {
    timeFormats.set(seconds, new Intl.DateTimeFormat('vi-VN', {
      timeZone: TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
      ...(seconds ? { second: '2-digit' } : {}),
      hourCycle: 'h23',
    }));
  }
  return timeFormats.get(seconds);
}

/** Date | ISO | ms → "14:30" (hoặc "14:30:12"). Không hợp lệ → "—". */
export function formatTime(input, { seconds = false } = {}) {
  if (input == null) return NO_VALUE;
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return NO_VALUE;
  // vi-VN có thể trả "14:30:12" hoặc "14 giờ 30"; ghép lại từ từng phần cho chắc.
  const parts = Object.fromEntries(timeFormat(seconds).formatToParts(d).map((p) => [p.type, p.value]));
  return seconds ? `${parts.hour}:${parts.minute}:${parts.second}` : `${parts.hour}:${parts.minute}`;
}
