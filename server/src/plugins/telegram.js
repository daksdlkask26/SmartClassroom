// Plugin bot Telegram (chức năng ID 6, 7): cảnh báo độ ẩm và trả lời /start, /stop, /doam, /trangthai.
//
// - Cấu hình: TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME, TELEGRAM_ALLOWED_CHAT_IDS trong server/.env.
//   Chưa có token thì plugin tự tắt, backend vẫn chạy.
// - Nhận lệnh bằng long polling (getUpdates) vì backend chạy trên laptop, không có domain HTTPS cho webhook.
// - register() trả về NGAY: kiểm tra token, đăng ký lệnh và polling chạy nền, nên Telegram chậm hay mất mạng
//   không làm backend khởi động chậm. Lỗi Telegram chỉ ghi log, không bao giờ làm sập backend.
// - Chỉ MỘT máy chạy bot với mỗi token (contract/README.md mục 8); máy khác đặt PLUGINS_DISABLED=telegram.
import { planAlert } from '../services/telegram/alerts.js';
import { createTelegramClient, sleep as defaultSleep } from '../services/telegram/client.js';
import { handleUpdate } from '../services/telegram/commands.js';
import { alertMessage, COMMANDS, withMode } from '../services/telegram/messages.js';
import { runPolling } from '../services/telegram/poller.js';
import { createTelegramStore } from '../services/telegram/store.js';

const STARTUP_MAX_BACKOFF_MS = 60_000;

/** Chat bị chặn / không còn tồn tại: xoá khỏi danh sách, không thử gửi mãi. */
const isGone = (err) => err.kind === 'forbidden'
  || (err.kind === 'bad-request' && /chat not found|user is deactivated/i.test(err.description ?? ''));

/**
 * `createClient`, `now`, `wait` chỉ để kiểm thử (Telegram giả, đồng hồ giả).
 */
export async function register({
  bus, state, config, log, createClient = createTelegramClient, now = () => new Date(), wait = defaultSleep,
}) {
  if (!config.telegram) {
    log.info('Tắt: chưa đặt TELEGRAM_BOT_TOKEN trong server/.env');
    return undefined;
  }

  const { username, allowedChatIds } = config.telegram;
  const contract = config.contract;
  const limits = contract.telegram;
  const client = createClient({ token: config.telegram.token, wait });
  const store = createTelegramStore({ dir: config.dataDir, mode: config.mode, deviceId: config.deviceId, log });
  store.load();

  log.info(`Bot @${username}: ${store.subscribers().length} người nhận cảnh báo (${store.file})`);
  if (!allowedChatIds.length) log.warn('TELEGRAM_ALLOWED_CHAT_IDS trống: ai tìm thấy bot cũng đăng ký và xem được số liệu');
  if (config.mode !== 'live') log.info(`MODE=${config.mode}: mọi tin bot gửi đều có nhãn [GIẢ LẬP]. Nên dùng bot riêng cho giả lập`);

  const ctrl = new AbortController();
  const { signal } = ctrl;
  let disabled = false; // token sai (401): ngừng gửi để không báo lỗi lặp lại mỗi bản tin

  const send = (chatId, text) => client.sendMessage(chatId, withMode(text, config.mode), { signal });

  // ---------- Lệnh ----------
  async function onUpdate(update) {
    const r = handleUpdate(update, { store, state, contract, botUsername: username, allowedChatIds, now: now() });
    if (!r) return;
    if (r.changed) {
      log.info(r.action === 'subscribe' ? `Người nhận mới: chat ${r.chatId}` : `Đã huỷ đăng ký: chat ${r.chatId}`);
      await store.save();
    } else if (r.action === 'denied') {
      log.info(`Từ chối chat ${r.chatId}: không có trong TELEGRAM_ALLOWED_CHAT_IDS`);
    }
    try {
      await send(r.chatId, r.text);
    } catch (err) {
      if (err.kind === 'aborted') return;
      if (isGone(err) && store.unsubscribe(r.chatId)) await store.save();
      log.warn(`Không trả lời được chat ${r.chatId}: ${err.message}`);
    }
  }

  // ---------- Khởi động nền: kiểm tra token, đăng ký lệnh, rồi polling ----------
  async function startup() {
    let backoff = 1000;
    let warned = false;
    let me;
    while (!signal.aborted) {
      try {
        me = await client.getMe({ signal });
        break;
      } catch (err) {
        if (err.kind === 'aborted' || signal.aborted) return;
        if (err.kind === 'unauthorized') {
          disabled = true;
          log.error('Telegram từ chối token (401). Kiểm tra TELEGRAM_BOT_TOKEN trong server/.env. Bot tắt; backend vẫn chạy');
          return;
        }
        if (!warned) log.warn(`Chưa kết nối được Telegram, tự thử lại: ${err.message}`);
        warned = true;
        try { await wait(backoff, signal); } catch { return; }
        backoff = Math.min(backoff * 2, STARTUP_MAX_BACKOFF_MS);
      }
    }
    if (!me) return;
    if (String(me.username).toLowerCase() !== username.toLowerCase()) {
      log.warn(`Token là của @${me.username} nhưng TELEGRAM_BOT_USERNAME=${username}: trang web sẽ chỉ sai bot`);
    }
    try {
      const hook = await client.getWebhookInfo({ signal });
      if (hook?.url) {
        log.error('Bot đang đặt webhook nên không nhận lệnh bằng polling được (409). '
          + 'Xoá webhook: mở https://api.telegram.org/bot<TOKEN>/deleteWebhook trong trình duyệt');
      }
    } catch (err) {
      if (err.kind !== 'aborted') log.debug(`Không đọc được webhook: ${err.message}`);
    }
    try {
      await client.setMyCommands(COMMANDS, { signal });
    } catch (err) {
      if (err.kind !== 'aborted') log.warn(`Không đăng ký được danh sách lệnh: ${err.message}`);
    }
    if (signal.aborted) return;
    log.info(`Bot @${me.username} đang nhận lệnh`);
    const result = await runPolling({ client, store, onUpdate, log, signal, wait });
    if (result === 'unauthorized') disabled = true;
  }
  const running = startup().catch((err) => log.error(`Bot dừng vì lỗi không lường trước: ${err.message}`));

  // ---------- Cảnh báo ----------
  let failing = false;
  async function checkAlert(reading) {
    if (disabled) return;
    const at = now();
    const plan = planAlert(reading, store.subscribers(), { limits, allowedChatIds, now: at });
    if (!plan || !plan.recipients.length) return;

    const text = alertMessage({ kind: plan.kind, reading, contract });
    let changed = false;
    let sent = 0;
    for (const chatId of plan.recipients) {
      try {
        await send(chatId, text);
        store.markAlerted(chatId, at.toISOString()); // chỉ tính cooldown khi đã gửi được
        changed = true;
        sent++;
      } catch (err) {
        if (err.kind === 'aborted') break;
        if (err.kind === 'unauthorized') {
          disabled = true;
          log.error('Telegram từ chối token (401): ngừng gửi cảnh báo');
          break;
        }
        if (isGone(err)) {
          store.unsubscribe(chatId);
          changed = true;
          log.warn(`Chat ${chatId} đã chặn bot hoặc không còn tồn tại: xoá khỏi danh sách nhận`);
        } else if (!failing) {
          failing = true;
          log.warn(`Chưa gửi được cảnh báo tới chat ${chatId}, sẽ thử lại ở bản tin sau: ${err.message}`);
        } else {
          log.debug(`Vẫn chưa gửi được cảnh báo tới chat ${chatId}: ${err.message}`);
        }
      }
    }
    if (sent) {
      failing = false;
      log.info(`Đã gửi cảnh báo độ ẩm ${plan.kind === 'high' ? 'cao' : 'thấp'} (${reading.humidity} %) tới ${sent} người`);
    }
    if (changed) await store.save();
  }

  // Xử lý lần lượt từng bản tin: không gửi chồng khi bản tin đến dồn, không đọc/ghi cooldown chen nhau.
  let chain = Promise.resolve();
  const off = bus.on('reading', (reading) => {
    chain = chain.then(() => checkAlert(reading)).catch((err) => log.error(`Lỗi khi xét cảnh báo: ${err.message}`));
  }, 'telegram');

  return {
    /** Chờ các bản tin đã nhận được xét cảnh báo xong (kiểm thử dùng). */
    idle: () => chain,

    async close() {
      off();
      ctrl.abort(); // huỷ long polling và các lần chờ thử lại
      await running;
      await chain;
      await store.save();
      await store.flush();
    },
  };
}
