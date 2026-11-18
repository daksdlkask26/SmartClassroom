// Gauge 61 đoạn trên cung 240° (HANDOFF §3.1). Cỡ L (hero độ ẩm) / S (thẻ nhiệt độ, CO₂).
// Màu đoạn sáng theo thông số (--data-*), ô chưa đạt --track. Chỉ độ ẩm có cung ngoài ngưỡng + vạch 30/85.
import { esc } from './dom.js';
import { SEGMENTS, polar, arcPath, valueToAngle, litCount } from '../core/gauge-math.js';

const C = 120;      // tâm (viewBox 240 × 190: điểm thấp nhất của cung ngoài ≈ y 175)
const R = 105;      // bán kính ngoài của đoạn
const LEN = 13;     // độ dài đoạn thường
const MAJOR = 20;   // độ dài vạch lớn (mỗi 10 đoạn)
const f = (n) => n.toFixed(2);

/**
 * @param {{ metric: string, size: 'l'|'s', min: number, max: number,
 *           labels: number[], bands?: [number, number][], marks?: number[] }} o
 */
export function gaugeSvg({ metric, size, min, max, labels, bands = [], marks = [] }) {
  let segs = '';
  for (let i = 0; i <= SEGMENTS; i++) {
    const deg = -120 + 4 * i;
    const L = i % 10 ? LEN : MAJOR;
    const [x1, y1] = polar(C, C, R - L, deg);
    const [x2, y2] = polar(C, C, R, deg);
    segs += `<line class="ri-gauge__seg${i % 10 ? '' : ' ri-gauge__seg--major'}" data-i="${i}" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
  }

  const out = bands.map(([a, b]) =>
    `<path class="ri-gauge__out" d="${arcPath(C, C, R + 6, valueToAngle(a, min, max), valueToAngle(b, min, max))}"/>`).join('');

  const markLines = marks.map((v) => {
    const d = valueToAngle(v, min, max);
    const [x1, y1] = polar(C, C, R - MAJOR - 2, d);
    const [x2, y2] = polar(C, C, R + 10, d);
    return `<line class="ri-gauge__mark" x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
  }).join('');

  const text = labels.map((v) => {
    const [x, y] = polar(C, C, R - MAJOR - 18, valueToAngle(v, min, max));
    return `<text class="ri-gauge__label" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle">${esc(v)}</text>`;
  }).join('');

  return `
    <svg class="ri-gauge ri-gauge--${size} ri-gauge--${esc(metric)} is-empty" viewBox="0 0 240 190" focusable="false"
         role="meter" aria-valuemin="${min}" aria-valuemax="${max}" data-min="${min}" data-max="${max}">
      ${out}${segs}${markLines}${text}
      <g class="ri-gauge__needle"><line x1="${C}" y1="${C + 12}" x2="${C}" y2="${C - (R - MAJOR - 5)}"/></g>
      <circle class="ri-gauge__hub" cx="${C}" cy="${C}" r="6"/>
      <circle class="ri-gauge__hub-core" cx="${C}" cy="${C}" r="2.5"/>
    </svg>`;
}

/** value = null → không kim, không đoạn sáng (không bao giờ vẽ số giả). stale → mờ 0,4. */
export function setGauge(svg, { value, valueText, stale = false }) {
  const min = Number(svg.dataset.min);
  const max = Number(svg.dataset.max);
  const empty = value == null;
  svg.classList.toggle('is-empty', empty);
  svg.classList.toggle('is-stale', !empty && stale);
  const k = empty ? -1 : litCount(value, min, max);
  if (svg.dataset.k !== String(k)) {
    svg.dataset.k = String(k);
    for (const s of svg.querySelectorAll('.ri-gauge__seg')) {
      s.classList.toggle('ri-gauge__seg--on', Number(s.dataset.i) <= k);
    }
  }
  if (!empty) svg.querySelector('.ri-gauge__needle').style.transform = `rotate(${valueToAngle(value, min, max)}deg)`;
  if (empty) svg.removeAttribute('aria-valuenow');
  else svg.setAttribute('aria-valuenow', String(value));
  svg.setAttribute('aria-valuetext', valueText);
}
