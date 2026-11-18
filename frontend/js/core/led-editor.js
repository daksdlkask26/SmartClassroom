// Phần thuần của trang Đèn LED (DK-06 / MB-06, HANDOFF §3.5): bản nháp bảng 9 màu, so với bảng đã gửi,
// chữ khoảng ngưỡng, thanh ngưỡng, xem trước 8 bóng. Không đụng DOM: kiểm thử bằng node --test.
import { formatNumber } from './format.js';
import { ledColors, PAIRS } from './led.js';

export const METRICS = PAIRS; // temperature · humidity · co2 = cặp 3–4 · 5–6 · 7–8
export const LEVELS = ['normal', 'watch', 'alert'];
const UNITS = { temperature: '°C', humidity: '%', co2: 'ppm' };

const levelOrder = (config) => config?.led?.levelOrder ?? LEVELS;

/** Ô nhập HEX của người dùng: "ff7a00", "#FF7A00", "#f70" → "#FF7A00"; sai → null. */
export function parseHex(input) {
  const s = String(input ?? '').trim().replace(/^#/, '');
  if (/^[0-9a-f]{6}$/i.test(s)) return `#${s.toUpperCase()}`;
  if (/^[0-9a-f]{3}$/i.test(s)) return `#${[...s].map((c) => c + c).join('').toUpperCase()}`;
  return null;
}

/** Tên màu có tên (10 màu của contract) hoặc null. */
export function colorName(hex, config) {
  const h = String(hex ?? '').toUpperCase();
  return config?.led?.namedColors?.find((c) => c.hex.toUpperCase() === h)?.name ?? null;
}

/** "Cam" cho màu có tên, "#123456" cho màu tùy chỉnh. */
export function colorLabel(hex, config) {
  return colorName(hex, config) ?? String(hex ?? '').toUpperCase();
}

export function clonePalette(p) {
  return Object.fromEntries(METRICS.map((m) => [m, [...(p?.[m] ?? [])].map((c) => String(c).toUpperCase())]));
}

export function samePalette(a, b) {
  return METRICS.every((m) => (a?.[m]?.length ?? 0) === (b?.[m]?.length ?? 0)
    && (a?.[m] ?? []).every((c, i) => String(c).toUpperCase() === String(b[m][i]).toUpperCase()));
}

/** Bảng màu đã gửi gần nhất từ web; chưa gửi lần nào → bảng mặc định (firmware dùng bảng này khi flash trống). */
export function sentPalette(led, config) {
  return clonePalette(led?.palette ?? config?.led?.defaultPalette);
}

/** Các ô khác nhau giữa bản nháp và bảng đã gửi: [{ metric, level, from, to }]. */
export function paletteDiff(draft, base, config) {
  const order = levelOrder(config);
  const out = [];
  for (const m of METRICS) {
    order.forEach((level, i) => {
      const from = base?.[m]?.[i];
      const to = draft?.[m]?.[i];
      if (String(from).toUpperCase() !== String(to).toUpperCase()) out.push({ metric: m, level, from, to });
    });
  }
  return out;
}

/** Dòng cạnh nút Áp dụng: "1 thay đổi chưa gửi · Độ ẩm · Cần chú ý: Vàng → Cam" · "3 thay đổi chưa gửi". */
export function diffSummary(diff, { t, config }) {
  if (!diff.length) return '';
  const head = t('led.draft.count', { n: diff.length });
  if (diff.length > 1) return head;
  const d = diff[0];
  return t('led.draft.one', {
    head,
    metric: t(`metric.${d.metric}.name`),
    level: t(`led.level.${d.level}`),
    from: colorLabel(d.from, config),
    to: colorLabel(d.to, config),
  });
}

/** Hai mức cùng màu trong một thông số (ST-17): [['watch', 'alert']] … Không khóa Áp dụng. */
export function duplicateLevels(colors, config) {
  const order = levelOrder(config);
  const out = [];
  for (let i = 0; i < order.length; i++) {
    for (let j = i + 1; j < order.length; j++) {
      if (colors?.[i] && String(colors[i]).toUpperCase() === String(colors[j]).toUpperCase()) out.push([order[i], order[j]]);
    }
  }
  return out;
}

const num = (v) => formatNumber(v, Number.isInteger(v) ? 0 : 1);

/** Một khoảng của contract → "20 – 30" · "16 – < 20" · "> 30 – 34" · "< 16" · "≥ 1500". */
function bandRange(b) {
  const hasMin = typeof b.min === 'number';
  const hasMax = typeof b.max === 'number';
  const lo = hasMin ? (b.minInclusive === false ? `> ${num(b.min)}` : num(b.min)) : '';
  const hi = hasMax ? (b.maxInclusive === false ? `< ${num(b.max)}` : num(b.max)) : '';
  if (hasMin && hasMax) return `${lo} – ${hi}`;
  if (hasMax) return b.maxInclusive === false ? `< ${num(b.max)}` : `≤ ${num(b.max)}`;
  if (hasMin) return b.minInclusive === false ? `> ${num(b.min)}` : `≥ ${num(b.min)}`;
  return '';
}

/** Chữ khoảng ngưỡng của một mức, lấy từ contract/system.json → levels (không viết cứng số). */
export function bandText(metric, level, config, t) {
  const bands = (config?.levels?.[metric]?.bands ?? []).filter((b) => b.level === level);
  if (!bands.length) return '';
  const unit = config?.metrics?.[metric]?.unit ?? UNITS[metric];
  let s = `${bands.map(bandRange).join(' · ')} ${unit}`;
  // Độ ẩm cảnh báo trùng ngưỡng Telegram (< 30 · > 85 %) — ghi rõ để người dùng biết hai nơi nói cùng một mức
  const tg = config?.telegram;
  if (metric === 'humidity' && level === 'alert' && tg
      && bands.some((b) => b.max === tg.humidityLow) && bands.some((b) => b.min === tg.humidityHigh)) {
    s += ` · ${t('led.band.telegram')}`;
  }
  return s;
}

/** Vị trí (0–100 %) của một giá trị trên thang gauge của thông số; null khi không có số. */
export function valuePercent(value, metric, config) {
  const [min, max] = config?.metrics?.[metric]?.scale ?? [0, 100];
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

/**
 * Thanh ngưỡng chỉ đọc của một thẻ: các đoạn theo thang gauge, tô bằng màu của bản nháp.
 * → { segments: [{ level, color, from, to }], ticks: [{ value, x }] } (from/to/x theo %)
 */
export function scaleSegments(metric, palette, config) {
  const [min, max] = config?.metrics?.[metric]?.scale ?? [0, 100];
  const order = levelOrder(config);
  const pct = (v) => Math.min(100, Math.max(0, ((v - min) / (max - min)) * 100));
  const segments = [];
  const ticks = [];
  for (const b of config?.levels?.[metric]?.bands ?? []) {
    const from = typeof b.min === 'number' ? pct(b.min) : 0;
    const to = typeof b.max === 'number' ? pct(b.max) : 100;
    if (to <= from) continue;
    segments.push({ level: b.level, color: palette?.[metric]?.[order.indexOf(b.level)] ?? null, from, to });
    if (typeof b.max === 'number' && b.max > min && b.max < max) ticks.push({ value: b.max, x: pct(b.max) });
  }
  return { segments, ticks };
}

/**
 * Xem trước 8 bóng ở chế độ Tự động: mô phỏng từ bản tin mới nhất + bản nháp.
 * editing = { metric, level }: cặp của thông số đang sửa hiện màu của mức đang sửa (DK-06 "XEM TRƯỚC · CẦN CHÚ Ý").
 * Không trực tiếp → null (xám "không rõ", ST-09).
 */
export function previewLeds({ latest, palette, config, live, editing = null }) {
  const r = ledColors({ latest, led: { mode: 'auto', palette }, config, live });
  if (!r || !editing) return r;
  const n = config?.led?.pairs?.[editing.metric];
  const c = palette?.[editing.metric]?.[levelOrder(config).indexOf(editing.level)];
  if (!n || !c) return r;
  const colors = [...r.colors];
  for (const k of n) colors[k - 1] = c;
  const blink = { ...r.blink };
  delete blink[editing.metric];
  return { colors, blink };
}

/** Xem trước chế độ Kiểm tra đèn: cả thanh một màu, Tắt → bóng tắt. */
export function testLeds({ color, on }, config) {
  const count = config?.led?.count ?? 8;
  return { colors: Array(count).fill(on && color ? color : 'off'), blink: {} };
}
