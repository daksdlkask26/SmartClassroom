// WebSocket /ws: đẩy dữ liệu thời gian thực cho trình duyệt (contract/README.md mục 5).
// Chỉ một chiều server → client. Lệnh từ trình duyệt đi qua REST.
import { WebSocketServer } from 'ws';
import { publicTelegram } from '../config.js';

const HEARTBEAT_MS = 30_000;

/** Chặn trang web lạ mở WebSocket tới máy chủ này (cross-site WebSocket hijacking). */
export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // công cụ dòng lệnh, kiểm thử — không phải trình duyệt
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

/**
 * @param {object} deps
 * @param {import('node:http').Server} deps.server
 * @param {object} deps.state
 * @param {object} deps.bus
 * @param {object} deps.config
 * @param {object} deps.log
 * @param {(req) => boolean} [deps.authorize]  ID 8 thay bằng kiểm tra phiên đăng nhập
 */
export function createWsServer({ server, state, bus, config, log, authorize = () => true }) {
  const wss = new WebSocketServer({
    server,
    path: '/ws',
    maxPayload: 4 * 1024,
    verifyClient: ({ req }, done) => {
      if (!sameOrigin(req)) {
        log.warn(`Từ chối WebSocket từ origin lạ: ${req.headers.origin}`);
        return done(false, 403, 'Forbidden');
      }
      if (!authorize(req)) return done(false, 401, 'Unauthorized');
      done(true);
    },
  });

  const envelope = (type, data) => JSON.stringify({ type, at: new Date().toISOString(), data });

  function broadcast(type, data) {
    const msg = envelope(type, data);
    for (const ws of wss.clients) if (ws.readyState === ws.OPEN) ws.send(msg);
  }

  wss.on('connection', (ws, req) => {
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });
    ws.on('message', () => {}); // bỏ qua: client không gửi lệnh qua WebSocket
    ws.on('error', (err) => log.debug('Lỗi kết nối WebSocket:', err.message));
    ws.send(envelope('hello', {
      serverTime: new Date().toISOString(),
      mode: config.mode,
      config: config.contract,
      ...state.snapshot(),
      telegram: publicTelegram(config), // chỉ tên bot, không bao giờ có token
    }));
    log.debug(`Trình duyệt kết nối (${req.socket.remoteAddress}), đang có ${wss.clients.size}`);
  });

  const offs = [
    bus.on('reading', (r) => broadcast('reading', r), 'ws'),
    bus.on('device', (d) => broadcast('device', d), 'ws'),
    bus.on('led:sent', (l) => broadcast('led', l), 'ws'),
  ];

  // Ping định kỳ, đóng kết nối không trả lời (tab đã đóng, mạng rớt)
  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.isAlive) { ws.terminate(); continue; }
      ws.isAlive = false;
      ws.ping();
    }
  }, HEARTBEAT_MS).unref();

  return {
    clientCount: () => wss.clients.size,
    close() {
      clearInterval(heartbeat);
      offs.forEach((off) => off());
      for (const ws of wss.clients) ws.terminate();
      return new Promise((r) => wss.close(() => r()));
    },
  };
}
