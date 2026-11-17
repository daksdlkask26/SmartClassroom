// Ứng dụng Express: API dưới /api, phục vụ thư mục web/, các đường dẫn trang trả về index.html.
import path from 'node:path';
import express from 'express';
import { ApiError, sendError } from './errors.js';
import { healthRoutes } from './routes/health.js';

/**
 * @param {object} deps
 * @param {object} deps.config                     từ loadConfig()
 * @param {object} deps.log                        từ createLogger()
 * @param {() => string} [deps.getMqttStatus]      'connected' | 'disconnected'
 */
export function createApp({ config, log, getMqttStatus = () => 'disconnected' }) {
  const app = express();
  app.disable('x-powered-by');

  app.use((_req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'same-origin');
    next();
  });

  // ---------- API ----------
  const api = express.Router();
  api.use(express.json({ limit: '8kb' }));
  api.use(healthRoutes({ config, getMqttStatus }));
  // G3: config, state, history, session · G8: led
  api.use((req, res) => sendError(res, 404, 'NOT_FOUND', `Không có API ${req.method} ${req.originalUrl}`));
  app.use('/api', api);

  // ---------- Giao diện ----------
  app.use(express.static(config.webRoot, { index: 'index.html', extensions: ['html'] }));

  // Đường dẫn trang (/giam-sat, /lich-su?chi-so=…) do router phía trình duyệt xử lý.
  // Chỉ trả index.html cho GET muốn nhận HTML và không giống tên tệp (không có dấu chấm).
  app.get('/{*splat}', (req, res, next) => {
    if (path.extname(req.path) || !req.accepts('html')) return next();
    res.sendFile(path.join(config.webRoot, 'index.html'));
  });

  app.use((req, res) => res.status(404).type('text/plain; charset=utf-8').send('Không tìm thấy'));

  // ---------- Lỗi ----------
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, _next) => {
    if (err instanceof ApiError) return sendError(res, err.status, err.code, err.message);
    if (err.type === 'entity.parse.failed') return sendError(res, 400, 'BAD_REQUEST', 'Thân yêu cầu không phải JSON hợp lệ');
    if (err.type === 'entity.too.large') return sendError(res, 413, 'PAYLOAD_TOO_LARGE', 'Thân yêu cầu quá lớn');
    log.error(`${req.method} ${req.originalUrl}`, err);
    sendError(res, 500, 'INTERNAL', 'Lỗi máy chủ');
  });

  return app;
}
