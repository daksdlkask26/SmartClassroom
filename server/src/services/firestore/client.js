// Kết nối Firestore dùng chung cho plugin ghi (plugins/firestore.js) và provider lịch sử (providers/history/firestore.js).
// Mỗi cấu hình chỉ mở MỘT kết nối; đóng khi cả hai bên đã trả lại.
import { randomUUID } from 'node:crypto';
import { cert, deleteApp, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/** Tạo kết nối mới. Dùng trực tiếp trong công cụ dòng lệnh và kiểm thử. */
export function createFirestore(config) {
  const options = { projectId: config.projectId };
  // Dùng đường dẫn đã resolve, không để ADC tự tìm theo thư mục chạy lệnh.
  if (!config.emulatorHost) options.credential = cert(config.credentialsPath);
  const app = initializeApp(options, `smartclassroom-${randomUUID()}`);
  const db = getFirestore(app);
  if (config.emulatorHost) db.settings({ host: config.emulatorHost, ssl: false });

  return {
    db,
    async close() {
      try {
        await db.terminate();
      } finally {
        await deleteApp(app);
      }
    },
  };
}

/**
 * Kết nối dùng chung theo khóa cấu hình; đếm số bên đang giữ, đóng khi bên cuối cùng trả lại.
 * @returns {{ db, release: () => Promise<void> }}
 */
const shared = new Map();
export function acquireFirestore(config, { create = createFirestore } = {}) {
  const key = `${config.projectId}|${config.emulatorHost ?? config.credentialsPath}`;
  let entry = shared.get(key);
  if (!entry) {
    entry = { conn: create(config), holders: 0 };
    shared.set(key, entry);
  }
  entry.holders += 1;
  let released = false;
  return {
    db: entry.conn.db,
    async release() {
      if (released) return;
      released = true;
      entry.holders -= 1;
      if (entry.holders === 0) {
        shared.delete(key);
        await entry.conn.close();
      }
    },
  };
}
