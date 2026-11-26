// Gọi Telegram Bot API bằng fetch có sẵn của Node 22 (không thêm thư viện).
// https://core.telegram.org/bots/api
//
// - Mỗi lần gọi có timeout (AbortController) và có thể huỷ từ ngoài (signal) khi backend dừng.
// - Lỗi được phân loại (TelegramError.kind) để nơi gọi quyết định thử lại, chờ hay bỏ.
// - URL gọi API chứa token: mọi thông báo lỗi đều đi qua redact() trước khi ra ngoài.
import { setTimeout as delay } from 'node:timers/promises';

export const API_BASE = 'https://api.telegram.org';

/**
 * kind:
 *   network · timeout · server (5xx)  → lỗi tạm thời, thử lại được
 *   rate (429, có retryAfter giây)     → chờ đúng retryAfter rồi thử lại
 *   conflict (409)                     → máy khác đang getUpdates cùng token, hoặc bot đang đặt webhook
 *   unauthorized (401)                 → token sai: thử lại vô ích
 *   forbidden (403)                    → người dùng đã chặn bot / bot bị đuổi khỏi chat
 *   bad-request (400 và còn lại)       → yêu cầu sai, ví dụ "chat not found"
 *   aborted                            → backend đang dừng
 */
export class TelegramError extends Error {
  constructor(message, { kind, status = null, retryAfter = null, description = null } = {}) {
    super(message);
    this.name = 'TelegramError';
    this.kind = kind;
    this.status = status;
    this.retryAfter = retryAfter;
    this.description = description;
  }

  get temporary() {
    return ['network', 'timeout', 'server', 'rate'].includes(this.kind);
  }
}

function kindOf(status) {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 409) return 'conflict';
  if (status === 429) return 'rate';
  if (status >= 500) return 'server';
  return 'bad-request';
}

/** Chờ ms, dừng sớm (ném lỗi aborted) khi signal bị huỷ. */
export async function sleep(ms, signal) {
  try {
    await delay(ms, undefined, { signal });
  } catch {
    throw new TelegramError('Đã huỷ', { kind: 'aborted' });
  }
}

/**
 * @param {object} opts
 * @param {string} opts.token
 * @param {string} [opts.baseUrl]       server giả khi kiểm thử
 * @param {Function} [opts.fetch]
 * @param {number} [opts.timeoutMs]     timeout mỗi lần gọi (getUpdates cộng thêm thời gian long polling)
 * @param {Function} [opts.wait]        thay sleep khi kiểm thử
 * @param {number} [opts.maxRetryAfterS] 429 bắt chờ lâu hơn mức này thì thôi, để lần sau thử
 */
export function createTelegramClient({
  token, baseUrl = API_BASE, fetch = globalThis.fetch, timeoutMs = 10_000, wait = sleep, maxRetryAfterS = 30,
}) {
  const redact = (text) => String(text).split(token).join('***');

  async function call(method, params = {}, { signal, timeout = timeoutMs } = {}) {
    if (signal?.aborted) throw new TelegramError('Đã huỷ', { kind: 'aborted' });
    const ctrl = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, timeout);
    const onAbort = () => ctrl.abort();
    signal?.addEventListener('abort', onAbort, { once: true });

    let res;
    let body = null;
    try {
      res = await fetch(`${baseUrl}/bot${token}/${method}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(params),
        signal: ctrl.signal,
      });
      body = await res.json().catch(() => null);
    } catch (err) {
      if (signal?.aborted) throw new TelegramError('Đã huỷ', { kind: 'aborted' });
      if (timedOut) throw new TelegramError(`Telegram ${method}: quá ${timeout / 1000} giây không phản hồi`, { kind: 'timeout' });
      const why = err.cause?.code ?? err.cause?.message ?? err.message;
      throw new TelegramError(redact(`Không gọi được Telegram ${method}: ${why}`), { kind: 'network' });
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }

    if (res.ok && body?.ok) return body.result;
    const status = body?.error_code ?? res.status;
    const description = body?.description ? redact(body.description) : null;
    throw new TelegramError(redact(`Telegram ${method} lỗi ${status}${description ? `: ${description}` : ''}`), {
      kind: kindOf(status), status, description, retryAfter: body?.parameters?.retry_after ?? null,
    });
  }

  /** Thử lại lỗi tạm thời: chờ 1 giây, 2 giây; 429 chờ đúng retry_after (nếu không quá lâu). */
  async function callWithRetry(method, params, { signal, attempts = 3 } = {}) {
    for (let i = 1; ; i++) {
      try {
        return await call(method, params, { signal });
      } catch (err) {
        if (!(err instanceof TelegramError) || !err.temporary || i >= attempts) throw err;
        if (err.kind === 'rate' && err.retryAfter > maxRetryAfterS) throw err;
        await wait(err.kind === 'rate' ? (err.retryAfter ?? 1) * 1000 : 1000 * 2 ** (i - 1), signal);
      }
    }
  }

  return {
    redact,

    getMe: ({ signal } = {}) => call('getMe', {}, { signal }),

    getWebhookInfo: ({ signal } = {}) => call('getWebhookInfo', {}, { signal }),

    /** Long polling: Telegram giữ kết nối tối đa `timeout` giây nếu chưa có tin. Không tự thử lại (vòng polling lo). */
    getUpdates: ({ offset, timeout = 25, signal } = {}) => call(
      'getUpdates',
      { offset, timeout, allowed_updates: ['message'] },
      { signal, timeout: (timeout + 10) * 1000 },
    ),

    /** Văn bản thuần (không parse_mode) để không bao giờ hỏng vì ký tự đặc biệt của Markdown. */
    sendMessage: (chatId, text, { signal } = {}) => callWithRetry(
      'sendMessage',
      { chat_id: chatId, text, link_preview_options: { is_disabled: true } },
      { signal },
    ),

    setMyCommands: (commands, { signal } = {}) => callWithRetry('setMyCommands', { commands }, { signal }),
  };
}
