// Telegram giả cho kiểm thử plugin: thay createTelegramClient, không gửi tin thật lên mạng.
// - push(update) để "người dùng" gửi tin; getUpdates chờ đến khi có tin hoặc bị huỷ (giống long polling).
// - fail(method, err | (args) => err) để giả lỗi; sent ghi lại mọi tin bot gửi.
import { TelegramError } from '../../src/services/telegram/client.js';

export const err = (kind, extra = {}) => new TelegramError(`giả lập lỗi ${kind}`, { kind, ...extra });

export function createFakeTelegram({ username = 'SmartClassroomTestBot' } = {}) {
  const updates = [];
  const sent = [];
  const calls = [];
  // method → { rules: hàm (args) → Error|null, áp dụng mãi (hoặc một lần nếu fn.once), queue: Error dùng một lần theo thứ tự }
  const failures = new Map();
  let nextId = 1;
  let wake = null;

  const takeFailure = (method, args) => {
    const f = failures.get(method);
    if (!f) return null;
    for (const [i, rule] of f.rules.entries()) {
      const e = rule(args);
      if (e) {
        if (rule.once) f.rules.splice(i, 1);
        return e;
      }
    }
    return f.queue.shift() ?? null;
  };

  async function guarded(method, args, run) {
    calls.push({ method, args });
    if (args.signal?.aborted) throw err('aborted');
    const e = takeFailure(method, args);
    if (e) throw e;
    return run();
  }

  const client = {
    redact: (s) => s,
    getMe: (o = {}) => guarded('getMe', o, () => ({ id: 1, is_bot: true, username })),
    getWebhookInfo: (o = {}) => guarded('getWebhookInfo', o, () => ({ url: '' })),
    setMyCommands: (commands, o = {}) => guarded('setMyCommands', { commands, ...o }, () => true),
    sendMessage: (chatId, text, o = {}) => guarded('sendMessage', { chatId, text, ...o }, () => {
      sent.push({ chatId: String(chatId), text });
      return { message_id: sent.length };
    }),
    getUpdates: (o = {}) => guarded('getUpdates', o, () => new Promise((resolve, reject) => {
      const tryResolve = () => {
        const ready = updates.filter((u) => u.update_id >= (o.offset ?? 0));
        if (ready.length) { resolve(ready); return true; }
        return false;
      };
      if (tryResolve()) return;
      const onAbort = () => reject(err('aborted'));
      o.signal?.addEventListener('abort', onAbort, { once: true });
      wake = () => { if (tryResolve()) o.signal?.removeEventListener('abort', onAbort); };
    })),
  };

  return {
    client,
    createClient: () => client,
    sent,
    calls,
    /** Người dùng gửi tin. date mặc định là bây giờ (giây). */
    push(message) {
      const chat = message.chat ?? { id: message.chatId ?? 1001, type: 'private' };
      updates.push({
        update_id: nextId++,
        message: { message_id: nextId, date: Math.floor(Date.now() / 1000), chat, text: message.text, ...message.extra },
      });
      wake?.();
    },
    /** fail(method, Error) → lỗi một lần (xếp hàng); fail(method, (args) => Error|null) → luật lọc theo tham số. */
    fail(method, error) {
      if (!failures.has(method)) failures.set(method, { rules: [], queue: [] });
      const f = failures.get(method);
      if (typeof error === 'function') f.rules.push(error);
      else f.queue.push(error);
    },
    clearFailures: () => failures.clear(),
    count: (method) => calls.filter((c) => c.method === method).length,
  };
}

/** Chờ đến khi điều kiện đúng (tối đa ~2 giây). */
export async function until(cond, what = 'điều kiện') {
  for (let i = 0; i < 200; i++) {
    if (await cond()) return;
    await new Promise((r) => setTimeout(r, 10));
  }
  throw new Error(`Quá thời gian chờ: ${what}`);
}
