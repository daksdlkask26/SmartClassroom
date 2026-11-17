// Tính mức bình thường / cần chú ý / cảnh báo theo contract/system.json → levels.
// Đây cũng là bản tham chiếu cho firmware ID 3 (cùng ngưỡng, cùng khoảng trễ).
export const METRICS = ['temperature', 'humidity', 'co2'];

function inBand(band, v, pad = 0) {
  const { min, max, minInclusive = true, maxInclusive = true } = band;
  const lo = min === undefined ? -Infinity : min - pad;
  const hi = max === undefined ? Infinity : max + pad;
  const okMin = minInclusive ? v >= lo : v > lo;
  const okMax = maxInclusive ? v <= hi : v < hi;
  return okMin && okMax;
}

/**
 * Mức của một giá trị, không tính khoảng trễ (backend, web, Telegram dùng).
 * @returns {'normal'|'watch'|'alert'|null} null khi giá trị null hoặc không phải số
 */
export function levelFor(contract, metric, value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const spec = contract.levels[metric];
  if (!spec) throw new Error(`Không có ngưỡng cho "${metric}" trong contract`);
  const band = spec.bands.find((b) => inBand(b, value));
  if (!band) throw new Error(`Ngưỡng "${metric}" không phủ giá trị ${value} — kiểm tra contract/system.json`);
  return band.level;
}

/**
 * Mức có khoảng trễ (firmware dùng, giả lập dùng để mô phỏng firmware).
 * Đang ở mức `prev` thì giữ nguyên chừng nào giá trị còn nằm trong vùng của `prev` nới rộng thêm `hysteresis`.
 * Ví dụ nhiệt độ đang "normal" [20, 30], trễ 0,5: lên 30,5 vẫn normal, > 30,5 mới thành watch;
 * đang "watch" (30, 34]: xuống 29,5 mới về normal.
 */
export function levelWithHysteresis(contract, metric, value, prev) {
  const raw = levelFor(contract, metric, value);
  if (raw === null || !prev || raw === prev) return raw;
  const pad = contract.hysteresis?.[metric] ?? 0;
  const stay = contract.levels[metric].bands.some((b) => b.level === prev && inBand(b, value, pad));
  return stay ? prev : raw;
}

/** Mức cho cả ba thông số của một bản tin. */
export function computeLevels(contract, values) {
  return Object.fromEntries(METRICS.map((m) => [m, levelFor(contract, m, values[m])]));
}
