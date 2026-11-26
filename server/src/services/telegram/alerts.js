// Luật cảnh báo độ ẩm (ID 6): ai cần nhận cảnh báo cho bản tin này.
//
// - Ngưỡng và thời gian nghỉ lấy từ contract/system.json → telegram (không ghi cứng 30 / 85 / 30 phút).
// - Cooldown tính RIÊNG cho từng người nhận, từ lần gửi THÀNH CÔNG gần nhất. Trong thời gian nghỉ không gửi gì cho
//   người đó, kể cả khi độ ẩm đã về bình thường rồi vượt lại, hay chuyển từ thấp sang cao ("nghỉ 30 phút giữa hai lần").
import { isAllowed } from './commands.js';
import { humidityAlert } from './messages.js';

/** Đã qua thời gian nghỉ chưa. lastAlertAt null = chưa từng nhận. */
export function cooldownOver(lastAlertAt, nowMs, cooldownMin) {
  if (!lastAlertAt) return true;
  const last = Date.parse(lastAlertAt);
  return !Number.isFinite(last) || nowMs - last >= cooldownMin * 60_000;
}

/**
 * @param {object} reading           Reading trên bus
 * @param {object[]} subscribers     store.subscribers()
 * @param {object} opts
 * @param {object} opts.limits       contract.telegram
 * @param {string[]} opts.allowedChatIds
 * @param {Date} opts.now
 * @returns {{ kind: 'low'|'high', recipients: string[] } | null}
 */
export function planAlert(reading, subscribers, { limits, allowedChatIds, now }) {
  const kind = humidityAlert(reading?.humidity, limits);
  if (!kind) return null;
  const recipients = subscribers
    .filter((s) => isAllowed(allowedChatIds, s.chatId)) // bị gỡ khỏi allowlist thì thôi nhận
    .filter((s) => cooldownOver(s.lastAlertAt, now.getTime(), limits.cooldownMin))
    .map((s) => s.chatId);
  return { kind, recipients };
}
