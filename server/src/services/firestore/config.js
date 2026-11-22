// Cấu hình Firebase cho phần ghi và đọc Firestore (chức năng ID 4, 5).
// Chỉ nhận cấu hình qua tham số env: không đọc process.env trực tiếp (xem server/src/config.js).
// Tên biến theo chuẩn của Google SDK (GOOGLE_APPLICATION_CREDENTIALS, FIRESTORE_EMULATOR_HOST) nên giữ nguyên.
import fs from 'node:fs';
import path from 'node:path';

/**
 * @param {NodeJS.ProcessEnv} env
 * @param {object} [opts]
 * @param {string} opts.baseDir  gốc để tính đường dẫn khóa tương đối (config.js truyền vào server/)
 * @returns {{ projectId: string, emulatorHost: string|null, credentialsPath?: string } | null}
 *   null khi chưa cấu hình (không có FIREBASE_PROJECT_ID): plugin tự tắt thay vì báo lỗi.
 */
export function readFirebaseConfig(env, { baseDir }) {
  const projectId = env.FIREBASE_PROJECT_ID?.trim();
  if (!projectId) return null;

  if (!/^[a-z][a-z0-9-]{4,61}[a-z0-9]$/.test(projectId)
    || projectId.startsWith('your-') || projectId.startsWith('thay-')) {
    throw new Error('Thay FIREBASE_PROJECT_ID bằng Project ID thật hoặc demo-smartclassroom.');
  }

  const emulatorHost = env.FIRESTORE_EMULATOR_HOST?.trim() || null;
  if (emulatorHost) {
    // Giữ lưu lượng Emulator trong máy; không nhận URL có giao thức.
    const port = Number(emulatorHost.slice(emulatorHost.lastIndexOf(':') + 1));
    if (!/^(127\.0\.0\.1|localhost|\[::1\]):[1-9]\d{0,4}$/.test(emulatorHost) || port > 65535) {
      throw new Error('FIRESTORE_EMULATOR_HOST phải có dạng 127.0.0.1:8085, không có http://.');
    }
    return { projectId, emulatorHost };
  }

  if (projectId.startsWith('demo-')) {
    throw new Error('Project demo-* cần FIRESTORE_EMULATOR_HOST; không dùng để ghi cloud.');
  }
  const rawPath = env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (!rawPath) throw new Error('Thiếu GOOGLE_APPLICATION_CREDENTIALS (đường dẫn khóa service account).');
  // Đường dẫn tương đối luôn tính từ server/, bất kể chạy lệnh từ thư mục nào.
  const credentialsPath = path.resolve(baseDir, rawPath);
  if (!fs.existsSync(credentialsPath)) {
    throw new Error(`Không tìm thấy file khóa ${credentialsPath}. Xem hướng dẫn Firebase trong server/README.md.`);
  }
  return { projectId, emulatorHost: null, credentialsPath };
}
