// Xử lý một update Telegram (tin nhắn người dùng gửi bot) → câu trả lời. Không tự gửi: plugin gửi.
// Chỉ đọc số liệu qua state (latest/device) và sửa danh sách người nhận qua store.
import {
  deniedReply, doamReply, privateOnlyReply, startAgainReply, startReply, stopNotSubscribedReply, stopReply,
  trangthaiReply, unknownReply,
} from './messages.js';

/** Lệnh hỏi số liệu cũ hơn mức này (ví dụ gửi lúc backend đang tắt) thì bỏ qua, không trả số liệu đã lệch thời điểm. */
export const MAX_QUERY_AGE_S = 120;

/**
 * "/doam", "/doam@TenBot", "/doam thêm chữ" → { name: 'doam', forOtherBot: false }. Không phải lệnh → null.
 * @param {string} text
 * @param {string} botUsername
 */
export function parseCommand(text, botUsername) {
  const m = /^\/([A-Za-z0-9_]{1,32})(?:@([A-Za-z0-9_]{1,32}))?(?:\s|$)/.exec(text ?? '');
  if (!m) return null;
  return {
    name: m[1].toLowerCase(),
    forOtherBot: Boolean(m[2]) && m[2].toLowerCase() !== String(botUsername).toLowerCase(),
  };
}

/** TELEGRAM_ALLOWED_CHAT_IDS trống = ai cũng dùng được. */
export const isAllowed = (allowedChatIds, chatId) => allowedChatIds.length === 0 || allowedChatIds.includes(String(chatId));

/**
 * @param {object} update  một phần tử của getUpdates
 * @param {object} ctx
 * @param {object} ctx.store        services/telegram/store.js
 * @param {object} ctx.state        state chỉ đọc: latest(), device()
 * @param {object} ctx.contract
 * @param {string} ctx.botUsername
 * @param {string[]} ctx.allowedChatIds
 * @param {Date} ctx.now
 * @returns {{ chatId: string, text: string, changed: boolean, action: string } | null}
 *   changed = danh sách người nhận đổi (cần lưu file); action để ghi log
 */
export function handleUpdate(update, { store, state, contract, botUsername, allowedChatIds, now }) {
  const msg = update?.message;
  if (!msg?.chat) return null; // chỉ xử lý tin nhắn mới; bỏ qua tin sửa, nút bấm…
  const chatId = String(msg.chat.id);
  const cmd = parseCommand(msg.text, botUsername);
  const reply = (text, action, changed = false) => ({ chatId, text, changed, action });

  if (msg.chat.type !== 'private') {
    // Nhóm: chỉ nhắc một câu khi có người gọi lệnh của bot này; tin thường thì im lặng.
    return cmd && !cmd.forOtherBot ? reply(privateOnlyReply(), 'group') : null;
  }
  if (cmd?.forOtherBot) return null;
  if (!isAllowed(allowedChatIds, chatId)) return reply(deniedReply(chatId), 'denied');

  const ageS = now.getTime() / 1000 - (msg.date ?? 0);
  const view = () => ({ latest: state.latest(), device: state.device(), contract, now });

  switch (cmd?.name) {
    case 'start':
      return store.subscribe(chatId, now.toISOString())
        ? reply(startReply(contract), 'subscribe', true)
        : reply(startAgainReply(contract), 'subscribe-again');
    case 'stop':
      return store.unsubscribe(chatId)
        ? reply(stopReply(), 'unsubscribe', true)
        : reply(stopNotSubscribedReply(), 'unsubscribe-none');
    case 'doam':
      return ageS > MAX_QUERY_AGE_S ? null : reply(doamReply(view()), 'doam');
    case 'trangthai':
      return ageS > MAX_QUERY_AGE_S ? null : reply(trangthaiReply(view()), 'trangthai');
    default:
      return reply(unknownReply(), 'help'); // lệnh lạ, chữ thường, ảnh, nhãn dán…
  }
}
