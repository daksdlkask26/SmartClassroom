// Điểm khởi động backend: đọc cấu hình rồi gọi startServer() (src/server.js).
import { describeConfig, loadConfig, loadEnvFile } from './config.js';
import { createLogger } from './log.js';
import { startServer } from './server.js';

const SHUTDOWN_TIMEOUT_MS = 15_000;

async function main() {
  const envLoaded = loadEnvFile();
  const config = loadConfig();
  const log = createLogger(config.logLevel);

  log.info(envLoaded ? 'Đã nạp server/.env' : 'Không có server/.env, dùng giá trị mặc định');
  log.info('Cấu hình', JSON.stringify(describeConfig(config)));

  const app = await startServer({ config, log });
  log.info(`Đang chạy tại http://localhost:${app.port} (chế độ ${config.mode})`);

  let closing = false;
  const shutdown = async (signal) => {
    if (closing) return;
    closing = true;
    log.info(`Nhận ${signal}, đang dừng (chờ các lần ghi dữ liệu đang dở)…`);
    // Đủ cho một lần ghi Firestore thử lại 3 lần (chờ 0,5 + 1 giây cộng thời gian gọi mạng); quá hạn thì báo rồi thoát.
    setTimeout(() => {
      log.error(`Quá ${SHUTDOWN_TIMEOUT_MS / 1000} giây vẫn chưa dừng xong, một số bản tin có thể chưa được lưu`);
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();
    let code = 0;
    try {
      const { clean } = await app.close();
      if (!clean) code = 1;
    } catch (err) {
      log.error('Lỗi khi dừng:', err.message);
      code = 1;
    }
    process.exit(code);
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
