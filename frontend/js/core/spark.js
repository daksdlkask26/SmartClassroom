// Sparkline 24 giờ (HANDOFF §2): mốc thiếu dữ liệu thì ngắt đường, không nối (thuyết minh, Hình dk08).
// Hàm thuần, không đụng DOM: kiểm thử bằng node --test.

/**
 * @param {{ avg: number|null }[]} points  điểm theo giờ từ /api/history (contract/examples/api.history.json)
 * @param {{ width?: number, height?: number, pad?: number, include?: number[] }} opts
 *        include: giá trị luôn nằm trong khung (ví dụ ngưỡng độ ẩm 85 %)
 * @returns {{ segments: string[][], y: (v: number) => number, last: [number, number] } | null}
 */
export function sparkGeometry(points, { width = 240, height = 64, pad = 6, include = [] } = {}) {
  const vals = points.map((p) => p.avg).filter((v) => v != null);
  if (!vals.length) return null;
  let lo = Math.min(...vals, ...include);
  let hi = Math.max(...vals, ...include);
  if (hi === lo) { hi += 1; lo -= 1; }
  const x = (i) => (points.length === 1 ? width / 2 : (i * width) / (points.length - 1));
  const y = (v) => pad + ((hi - v) * (height - 2 * pad)) / (hi - lo);

  const segments = [];
  let cur = [];
  points.forEach((p, i) => {
    if (p.avg == null) {
      if (cur.length) segments.push(cur);
      cur = [];
    } else {
      cur.push(`${x(i).toFixed(1)},${y(p.avg).toFixed(1)}`);
    }
  });
  if (cur.length) segments.push(cur);

  const lastI = points.findLastIndex((p) => p.avg != null);
  return { segments, y, last: [x(lastI), y(points[lastI].avg)] };
}

/** Khoảng thấp nhất – cao nhất trong 24 giờ, bỏ qua mốc thiếu. */
export function dayRange(points) {
  const mins = points.map((p) => p.min).filter((v) => v != null);
  const maxs = points.map((p) => p.max).filter((v) => v != null);
  return mins.length && maxs.length ? { min: Math.min(...mins), max: Math.max(...maxs) } : null;
}
