// Vòng long polling: getUpdates → xử lý từng update → lưu offset. Chạy nền, không bao giờ ném lỗi ra ngoài.
//
// Xử lý lỗi:
//   mạng / 5xx / timeout → chờ tăng dần 1, 2, 4… tối đa 60 giây rồi thử lại; chỉ báo warn lần đầu của mỗi đợt lỗi
//   429                   → chờ đúng retry_after
//   409                   → máy khác đang chạy bot cùng token (hoặc bot đang đặt webhook): báo rõ, chờ 60 giây
//   401                   → token sai: báo lỗi rồi DỪNG polling (thử lại vô ích); backend vẫn chạy
import { sleep as defaultSleep } from './client.js';

export const CONFLICT_WAIT_MS = 60_000;
export const MAX_BACKOFF_MS = 60_000;

/**
 * @param {object} opts
 * @param {object} opts.client     createTelegramClient()
 * @param {object} opts.store      createTelegramStore()
 * @param {(update) => Promise<void>} opts.onUpdate
 * @param {object} opts.log
 * @param {AbortSignal} opts.signal  huỷ khi backend dừng
 * @param {Function} [opts.wait]
 * @param {number} [opts.pollTimeoutS]
 * @returns {Promise<'stopped'|'unauthorized'>} xong khi signal bị huỷ hoặc token sai
 */
export async function runPolling({ client, store, onUpdate, log, signal, wait = defaultSleep, pollTimeoutS = 25 }) {
  let backoff = 1000;
  let lastKind = null; // loại lỗi của lần trước: chỉ báo khi loại lỗi đổi, không báo lặp mỗi lần thử

  while (!signal.aborted) {
    let updates;
    try {
      updates = await client.getUpdates({ offset: store.offset, timeout: pollTimeoutS, signal });
    } catch (err) {
      if (signal.aborted || err.kind === 'aborted') break;
      if (err.kind === 'unauthorized') {
        log.error('Telegram từ chối token (401). Kiểm tra TELEGRAM_BOT_TOKEN trong server/.env. Bot ngừng nhận lệnh; backend vẫn chạy');
        return 'unauthorized';
      }
      const fresh = err.kind !== lastKind;
      lastKind = err.kind;
      let ms;
      if (err.kind === 'conflict') {
        if (fresh) {
          log.error('Telegram báo xung đột (409): máy khác đang chạy bot cùng token, hoặc bot đang đặt webhook. '
            + 'Chỉ MỘT máy bật bot; máy khác đặt PLUGINS_DISABLED=telegram. Tự thử lại mỗi 60 giây');
        }
        ms = CONFLICT_WAIT_MS;
      } else if (err.kind === 'rate') {
        ms = (err.retryAfter ?? 5) * 1000;
        log.warn(`Telegram yêu cầu chờ ${ms / 1000} giây (429)`);
      } else {
        if (fresh) log.warn(`Không nhận được tin Telegram, tự thử lại: ${err.message}`);
        else log.debug(`Vẫn chưa nhận được tin Telegram: ${err.message}`);
        ms = backoff;
        backoff = Math.min(backoff * 2, MAX_BACKOFF_MS);
      }
      try {
        await wait(ms, signal);
      } catch {
        break; // bị huỷ trong lúc chờ
      }
      continue;
    }

    if (lastKind) log.info('Đã nhận tin Telegram trở lại');
    lastKind = null;
    backoff = 1000;

    for (const update of updates) {
      try {
        await onUpdate(update);
      } catch (err) {
        log.error(`Lỗi khi xử lý tin Telegram #${update.update_id}: ${err.message}`);
      }
      store.setOffset(update.update_id + 1); // kể cả khi lỗi: không kẹt mãi ở một tin hỏng
    }
    if (updates.length) store.save();
  }
  return 'stopped';
}
