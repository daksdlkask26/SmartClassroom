// Lưu người nhận cảnh báo và trạng thái bot ra file, để khởi động lại không mất đăng ký và không gửi lại cảnh báo ngay.
//
// File: server/data/telegram-<mode>-<deviceId>.json (thư mục data/ đã ignore; chứa chat ID nên KHÔNG commit).
// Tách theo MODE để người thử bot giả lập không lẫn với người nhận cảnh báo thật.
//
// {
//   "v": 1, "deviceId": "sc-01", "mode": "sim",
//   "nextUpdateOffset": 0,                     // update_id kế tiếp cần lấy, để không xử lý lại tin cũ
//   "subscribers": { "<chatId>": { "subscribedAt": "<ISO>", "lastAlertAt": "<ISO>" | null } }
// }
import fs from 'node:fs';
import path from 'node:path';

const FILE_VERSION = 1;
const CHAT_ID = /^-?\d{1,20}$/;
const isIso = (v) => typeof v === 'string' && !Number.isNaN(Date.parse(v));

/**
 * @param {object} opts
 * @param {string} opts.dir       config.dataDir
 * @param {string} opts.mode      config.mode
 * @param {string} opts.deviceId  config.deviceId
 * @param {object} opts.log
 */
export function createTelegramStore({ dir, mode, deviceId, log }) {
  const file = path.join(dir, `telegram-${mode}-${deviceId}.json`);
  let offset = 0;
  let subs = new Map(); // chatId (chuỗi) → { subscribedAt, lastAlertAt }
  let queue = Promise.resolve();
  let pending = false;

  /** File hỏng: giữ lại bản .bak để xem, rồi bắt đầu file mới (không làm sập backend). */
  function quarantine(why) {
    log.warn(`Bỏ qua ${file}: ${why}. Đổi tên thành .bak và bắt đầu danh sách mới`);
    try {
      fs.renameSync(file, `${file}.bak`);
    } catch (err) {
      log.warn(`Không đổi tên được ${file}: ${err.message}`);
    }
  }

  function parse(data) {
    if (data?.v !== FILE_VERSION || data.deviceId !== deviceId) return 'sai phiên bản hoặc không phải của thiết bị này';
    if (!Number.isSafeInteger(data.nextUpdateOffset) || data.nextUpdateOffset < 0) return 'nextUpdateOffset không hợp lệ';
    if (!data.subscribers || typeof data.subscribers !== 'object' || Array.isArray(data.subscribers)) return 'thiếu subscribers';
    const next = new Map();
    for (const [id, s] of Object.entries(data.subscribers)) {
      if (!CHAT_ID.test(id) || !isIso(s?.subscribedAt) || (s.lastAlertAt !== null && !isIso(s.lastAlertAt))) {
        return `người nhận ${id} không hợp lệ`;
      }
      next.set(id, { subscribedAt: s.subscribedAt, lastAlertAt: s.lastAlertAt });
    }
    offset = data.nextUpdateOffset;
    subs = next;
    return null;
  }

  return {
    file,

    /** Đọc file lúc khởi động. Không có file → danh sách trống. */
    load() {
      let raw;
      try {
        raw = fs.readFileSync(file, 'utf8');
      } catch (err) {
        if (err.code !== 'ENOENT') log.warn(`Không đọc được ${file}: ${err.message}`);
        return;
      }
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        quarantine('không phải JSON hợp lệ');
        return;
      }
      const error = parse(data);
      if (error) quarantine(error);
    },

    get offset() { return offset; },
    /** Chỉ tăng, không lùi (tránh xử lý lại tin cũ). */
    setOffset(n) { if (Number.isSafeInteger(n) && n > offset) offset = n; },

    has: (chatId) => subs.has(String(chatId)),
    /** @returns {boolean} true nếu là người mới */
    subscribe(chatId, at) {
      const id = String(chatId);
      if (subs.has(id)) return false;
      subs.set(id, { subscribedAt: at, lastAlertAt: null });
      return true;
    },
    /** @returns {boolean} true nếu có trong danh sách và đã xoá */
    unsubscribe: (chatId) => subs.delete(String(chatId)),
    markAlerted(chatId, at) {
      const s = subs.get(String(chatId));
      if (s) s.lastAlertAt = at;
    },
    /** Bản sao danh sách người nhận. */
    subscribers: () => [...subs].map(([chatId, s]) => ({ chatId, ...s })),

    /**
     * Ghi file: lần lượt, qua file tạm rồi đổi tên (không bao giờ để lại file ghi dở).
     * Gọi nhiều lần liền nhau chỉ ghi một lần với nội dung mới nhất.
     */
    save() {
      if (pending) return queue;
      pending = true;
      queue = queue.then(async () => {
        pending = false;
        const body = `${JSON.stringify({
          v: FILE_VERSION, deviceId, mode, nextUpdateOffset: offset, subscribers: Object.fromEntries(subs),
        }, null, 2)}\n`;
        const tmp = `${file}.tmp`;
        try {
          await fs.promises.mkdir(dir, { recursive: true });
          await fs.promises.writeFile(tmp, body, 'utf8');
          await fs.promises.rename(tmp, file);
        } catch (err) {
          log.warn(`Không lưu được ${file}: ${err.message}`);
        }
      });
      return queue;
    },

    /** Chờ các lần ghi còn dở (gọi khi tắt backend). */
    flush: () => queue,
  };
}
