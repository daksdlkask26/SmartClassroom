// Lưu bảng màu gửi gần nhất ra file (plan.md mục 6.4) để backend khởi động lại vẫn biết ESP32 đang dùng bảng nào.
// ESP32 tự lưu bảng màu vào flash, nên sau khi backend khởi động lại thì web phải hiện đúng bảng đó,
// không quay về "chưa gửi từ web".
//
// Chỉ lưu bảng màu (palette) và giờ gửi. Không lưu chế độ Kiểm tra đèn: firmware không lưu chế độ này vào flash,
// nên khi backend khởi động lại, giao diện lấy chế độ thật từ status retained (device.ledMode).
//
// File: server/data/led-<mode>-<deviceId>.json (thư mục data/ đã ignore). Tách theo MODE để bảng màu thử ở
// chế độ giả lập không lẫn sang thiết bị thật.
import fs from 'node:fs';
import path from 'node:path';
import { parsePaletteBody } from './led-cmd.js';

const FILE_VERSION = 1;

/**
 * @param {object} opts
 * @param {string} opts.dir       config.dataDir
 * @param {string} opts.mode      config.mode
 * @param {string} opts.deviceId  config.deviceId
 * @param {number} [opts.levelCount]
 * @param {object} opts.log
 */
export function createLedStore({ dir, mode, deviceId, levelCount = 3, log }) {
  const file = path.join(dir, `led-${mode}-${deviceId}.json`);
  let queue = Promise.resolve();

  return {
    file,

    /** Đọc file lúc khởi động → { palette, sentAt } hoặc null (chưa có file, file hỏng, khác thiết bị). */
    load() {
      let raw;
      try {
        raw = fs.readFileSync(file, 'utf8');
      } catch (err) {
        if (err.code !== 'ENOENT') log.warn(`Không đọc được ${file}: ${err.message}`);
        return null;
      }
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        log.warn(`Bỏ qua ${file}: không phải JSON hợp lệ`);
        return null;
      }
      if (data?.v !== FILE_VERSION || data.deviceId !== deviceId) {
        log.warn(`Bỏ qua ${file}: sai phiên bản hoặc không phải của thiết bị ${deviceId}`);
        return null;
      }
      const r = parsePaletteBody({ palette: data.palette }, { levelCount });
      if (!r.ok || typeof data.sentAt !== 'string' || Number.isNaN(Date.parse(data.sentAt))) {
        log.warn(`Bỏ qua ${file}: bảng màu hoặc giờ gửi không hợp lệ`);
        return null;
      }
      return { palette: r.cmd.palette, sentAt: data.sentAt };
    },

    /** Ghi lại sau mỗi lần gửi. Ghi lần lượt, qua file tạm rồi đổi tên để không bao giờ để lại file ghi dở. */
    save({ palette, sentAt }) {
      const body = `${JSON.stringify({ v: FILE_VERSION, deviceId, mode, palette, sentAt }, null, 2)}\n`;
      queue = queue.then(async () => {
        const tmp = `${file}.tmp`;
        try {
          await fs.promises.mkdir(dir, { recursive: true });
          await fs.promises.writeFile(tmp, body, 'utf8');
          await fs.promises.rename(tmp, file);
          log.debug(`Đã lưu bảng màu vào ${file}`);
        } catch (err) {
          log.warn(`Không lưu được bảng màu vào ${file}: ${err.message}`);
        }
      });
      return queue;
    },

    /** Chờ các lần ghi còn dở (gọi khi tắt backend). */
    flush: () => queue,
  };
}
