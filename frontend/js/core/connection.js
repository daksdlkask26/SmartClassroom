// Trạng thái kết nối của thanh trạng thái (HANDOFF §3.4, plan.md 8.3). Hàm thuần — kiểm thử bằng Node.
//
// | Điều kiện                                               | Trạng thái     |
// | Lần mở WebSocket đầu tiên đang chạy                     | connecting     |
// | WebSocket đã mở, chưa có bản tin nào                    | connecting     |
// | Bản tin cuối ≤ staleAfterS (90 s)                       | online         |
// | Bản tin cuối > staleAfterS, WebSocket vẫn mở            | stale          |
// | Máy chủ báo thiết bị mất (LWT hoặc quá offlineAfterS)   | deviceOffline  |
// | WebSocket đứt (kể cả lần đầu không mở được)             | disconnected   |

export const STATUS = Object.freeze({
  CONNECTING: 'connecting',
  ONLINE: 'online',
  STALE: 'stale',
  DEVICE_OFFLINE: 'deviceOffline',
  DISCONNECTED: 'disconnected',
});

export const DEFAULT_STALE_AFTER_S = 90;

/** Lý do "ngoại tuyến" mà máy chủ thật sự xác nhận. 'unknown' = máy chủ vừa khởi động, chưa biết gì. */
const OFFLINE_REASONS = new Set(['lwt', 'timeout', 'status']);

/**
 * @param {object} input
 * @param {'connecting'|'open'|'closed'} input.ws
 * @param {{ receivedAt: string }|null} input.latest
 * @param {{ online: boolean, reason: string }|null} input.device
 * @param {number} input.now            giờ máy chủ (ms)
 * @param {number} [input.staleAfterS]
 * @returns {{ status: string, ageS: number|null }}  ageS = số giây từ bản tin cuối (null khi chưa có)
 */
export function deriveStatus({ ws, latest, device, now, staleAfterS = DEFAULT_STALE_AFTER_S }) {
  const ageS = ageSeconds(latest, now);

  if (ws === 'closed') return { status: STATUS.DISCONNECTED, ageS };
  if (ws !== 'open') return { status: STATUS.CONNECTING, ageS };

  if (device && device.online === false && OFFLINE_REASONS.has(device.reason)) {
    return { status: STATUS.DEVICE_OFFLINE, ageS };
  }
  if (ageS === null) return { status: STATUS.CONNECTING, ageS };
  if (ageS > staleAfterS) return { status: STATUS.STALE, ageS };
  return { status: STATUS.ONLINE, ageS };
}

/** Số giây nguyên đã trôi qua từ bản tin cuối; giờ máy lệch nhẹ về tương lai thì tính 0. */
export function ageSeconds(latest, now) {
  const t = latest ? Date.parse(latest.receivedAt) : NaN;
  if (!Number.isFinite(t)) return null;
  return Math.max(0, Math.floor((now - t) / 1000));
}

/** Số liệu trên giao diện chỉ "đáng tin" khi trực tuyến: nhãn mức ẩn ở mọi trạng thái khác (HANDOFF §3.12). */
export function isLive(status) {
  return status === STATUS.ONLINE;
}
