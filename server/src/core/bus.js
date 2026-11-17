// Kênh sự kiện dùng chung cho backend và plugin (plan.md mục 3.2).
// Sự kiện: 'reading' (bản tin hợp lệ) · 'device' (trạng thái thiết bị đổi) · 'led:sent' (đã gửi lệnh LED, G8).
// Lỗi trong một listener (kể cả async) được ghi log, không làm sập backend hay chặn listener khác.
import { EventEmitter } from 'node:events';

export function createBus(log) {
  const ee = new EventEmitter();
  ee.setMaxListeners(50);

  return {
    /** Đăng ký listener. Trả về hàm hủy đăng ký. */
    on(event, fn, owner = 'unknown') {
      const wrapped = (payload) => {
        try {
          const r = fn(payload);
          if (r && typeof r.then === 'function') {
            r.catch((err) => log.error(`Listener "${owner}" lỗi khi xử lý "${event}":`, err));
          }
        } catch (err) {
          log.error(`Listener "${owner}" lỗi khi xử lý "${event}":`, err);
        }
      };
      ee.on(event, wrapped);
      return () => ee.off(event, wrapped);
    },
    emit(event, payload) {
      ee.emit(event, payload);
    },
    listenerCount(event) {
      return ee.listenerCount(event);
    },
  };
}
