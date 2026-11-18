// Hình học gauge 61 đoạn trên cung 240° (HANDOFF §3.1). Góc φ tính theo chiều kim đồng hồ từ 12 giờ.
// Hàm thuần, không đụng DOM: kiểm thử bằng node --test.

export const SEGMENTS = 60;

const ratio = (v, min, max) => Math.min(1, Math.max(0, (v - min) / (max - min)));

/** Giá trị → góc kim (độ). Kẹp trong thang để kim không quay quá đầu cung. */
export const valueToAngle = (v, min, max) => -120 + 240 * ratio(v, min, max);

/** Giá trị → chỉ số đoạn sáng cuối cùng k (đoạn i ≤ k sáng). */
export const litCount = (v, min, max) => Math.round(ratio(v, min, max) * SEGMENTS);

export function polar(cx, cy, r, deg) {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
}

/** Cung tròn theo chiều kim đồng hồ từ fromDeg tới toDeg. */
export function arcPath(cx, cy, r, fromDeg, toDeg) {
  const [x1, y1] = polar(cx, cy, r, fromDeg);
  const [x2, y2] = polar(cx, cy, r, toDeg);
  const large = toDeg - fromDeg > 180 ? 1 : 0;
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}
