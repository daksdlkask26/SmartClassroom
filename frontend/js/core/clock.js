// Đồng hồ theo giờ máy chủ (plan.md 8.3): "Cập nhật N giây trước" và giờ trên thanh trạng thái
// không phụ thuộc giờ máy người dùng bị lệch. Độ lệch lấy từ serverTime trong tin `hello`
// và trường `at` của mỗi tin WebSocket.

let offsetMs = 0;
const listeners = new Set();
let timer = null;

/** Gọi khi nhận giờ máy chủ (ISO). Bỏ qua giá trị hỏng. */
export function syncServerTime(iso, localNow = Date.now()) {
  const server = Date.parse(iso);
  if (Number.isFinite(server)) offsetMs = server - localNow;
}

/** Giờ hiện tại theo máy chủ (ms). */
export function serverNow() {
  return Date.now() + offsetMs;
}

/** Gọi fn(serverNowMs) mỗi giây, canh đúng đầu giây. Trả về hàm hủy. */
export function onTick(fn) {
  listeners.add(fn);
  if (!timer) schedule();
  return () => {
    listeners.delete(fn);
    if (!listeners.size && timer) { clearTimeout(timer); timer = null; }
  };
}

function schedule() {
  const now = serverNow();
  timer = setTimeout(() => {
    const t = serverNow();
    for (const fn of [...listeners]) fn(t);
    if (listeners.size) schedule(); else timer = null;
  }, 1000 - (now % 1000) + 5);
}
