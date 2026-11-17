// Sinh lịch sử giả cho N giờ trước (chỉ chế độ giả lập), để dải "24 GIỜ QUA" và trang Lịch sử có dữ liệu ngay.
// Theo dữ liệu minh họa của thiết kế (HANDOFF §6): độ ẩm vượt 85 % lúc 04:00–06:00, có một giờ thiếu dữ liệu.
import { parseTelemetry } from '../../src/core/validate.js';
import { createSimDevice } from './device.js';

const VN_OFFSET_H = 7;

/**
 * @returns {object[]} các Reading (như validate.parseTelemetry) có receivedAt trong quá khứ, cũ → mới
 */
export function generateHistory({ contract, hours = 24, intervalS = contract.timing.intervalS, now = Date.now(), rng }) {
  const start = now - hours * 3600 * 1000;
  let t = start;
  const sim = createSimDevice({ contract, rng, now: () => t });
  // Một giờ TRÒN không có dữ liệu, cách đây ~20 giờ → biểu đồ phải hiện "—" và không nối đường qua đó
  const gapStart = Math.floor((now - 20 * 3600 * 1000) / 3_600_000) * 3_600_000;
  const out = [];

  for (; t < now; t += intervalS * 1000) {
    if (t >= gapStart && t < gapStart + 3600 * 1000) continue;
    const vnHour = (new Date(t).getUTCHours() + VN_OFFSET_H) % 24;
    sim.setScenario(vnHour >= 4 && vnHour < 6 ? 'humid-high' : vnHour >= 13 && vnHour < 15 ? 'temp-watch' : 'normal');
    const r = parseTelemetry(JSON.stringify(sim.next()), contract, new Date(t));
    if (r.ok) out.push(r.reading);
  }
  return out;
}
