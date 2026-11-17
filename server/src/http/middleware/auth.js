// Chặn truy cập khi chưa đăng nhập — ID 8 thay phần thân, GIỮ nguyên chữ ký hàm.
// Hiện AUTH_ENABLED=false nên cho qua tất cả.

/** Middleware Express cho các API cần đăng nhập. */
export function requireAuth({ config }) {
  return (_req, _res, next) => {
    if (!config.authEnabled) return next();
    // ID 8: kiểm tra phiên (cookie) → next() hoặc next(new ApiError(401, 'UNAUTHORIZED', …))
    next();
  };
}

/** Kiểm tra khi trình duyệt mở WebSocket (ws/server.js → authorize). */
export function authorizeUpgrade({ config }) {
  return (_req) => {
    if (!config.authEnabled) return true;
    // ID 8: đọc cookie phiên từ _req.headers.cookie, trả false nếu chưa đăng nhập
    return true;
  };
}
