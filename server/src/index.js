// Điểm khởi động backend.
// Thứ tự (theo plan.md mục 6.1): cấu hình → bus/state (G2) → MQTT (G2) → HTTP + WS (G1, G3) → plugin (G3).
import http from 'node:http';
import { describeConfig, loadConfig, loadEnvFile } from './config.js';
import { createLogger } from './log.js';
import { createApp } from './http/app.js';

async function main() {
  const envLoaded = loadEnvFile();
  const config = loadConfig();
  const log = createLogger(config.logLevel);

  log.info(envLoaded ? 'Đã nạp server/.env' : 'Không có server/.env, dùng giá trị mặc định');
  log.info('Cấu hình', JSON.stringify(describeConfig(config)));

  const app = createApp({ config, log: log.child('http') });
  const server = http.createServer(app);

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(config.port, resolve);
  });
  log.info(`Đang chạy tại http://localhost:${server.address().port} (chế độ ${config.mode})`);

  let closing = false;
  const shutdown = (signal) => {
    if (closing) return;
    closing = true;
    log.info(`Nhận ${signal}, đang dừng…`);
    server.close(() => process.exit(0));
    server.closeAllConnections?.();
    setTimeout(() => process.exit(1), 3000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Cổng ${err.port} đang bị dùng. Đổi PORT trong server/.env hoặc tắt chương trình đang chiếm cổng.`);
  } else {
    console.error('Không khởi động được backend:', err.message);
  }
  process.exit(1);
});
