// Plugin ghi dữ liệu cảm biến lên Firestore (chức năng ID 4).
// Nghe sự kiện `reading` của bus, nên không tự nối MQTT: dùng chung phần kiểm tra bản tin của backend.
// Cấu hình: FIREBASE_PROJECT_ID + GOOGLE_APPLICATION_CREDENTIALS (hoặc FIRESTORE_EMULATOR_HOST) trong server/.env.
// Chưa cấu hình thì plugin tự tắt (backend vẫn chạy). Khi nhiều máy cùng nối HiveMQ thật,
// chỉ MỘT máy bật plugin này, máy khác đặt PLUGINS_DISABLED=firestore (contract/README.md mục 8).
import { acquireFirestore } from '../services/firestore/client.js';
import { createReadingStore } from '../services/firestore/reading-store.js';

/** `acquire` chỉ để kiểm thử truyền Firestore giả vào. */
export async function register({ bus, config, log, acquire = acquireFirestore }) {
  if (!config.firebase) {
    log.info('Tắt: chưa đặt FIREBASE_PROJECT_ID trong server/.env');
    return undefined;
  }

  const conn = acquire(config.firebase);
  const store = createReadingStore(conn.db, { deviceId: config.deviceId, mode: config.mode });
  const target = config.firebase.emulatorHost ? `Emulator ${config.firebase.emulatorHost}` : `cloud ${config.firebase.projectId}`;
  log.info(`Ghi vào devices/${config.deviceId}/${store.names.raw} (${target})`);
  if (config.mode !== 'live' && !config.firebase.emulatorHost) {
    log.warn(`MODE=${config.mode}: dữ liệu giả được ghi lên cloud, tách riêng ở "${store.names.raw}"`);
  }

  // Ghi lần lượt từng bản tin: giữ đúng thứ tự và tránh hai giao dịch cùng tranh một document giờ.
  let chain = Promise.resolve();
  let failed = 0;
  const off = bus.on('reading', (reading) => {
    chain = chain
      .then(() => store.saveReading(reading))
      .then((r) => log.debug(r.duplicate ? `Bản trùng #${reading.seq}, bỏ qua` : `Đã lưu #${reading.seq}`))
      .catch((err) => {
        failed += 1;
        log.error(`Không lưu được bản tin #${reading.seq}: ${err.message}`);
      });
  }, 'firestore');

  return {
    /** Số bản tin đã thử hết số lần mà vẫn không lưu được (kiểm thử và lúc tắt dùng). */
    get failedWrites() { return failed; },

    async close() {
      off();
      try {
        await chain; // chờ các lần ghi đang dở
      } finally {
        await conn.release();
      }
      // Báo cho index.js thoát với mã lỗi, để người chạy (hoặc script) biết có dữ liệu bị mất.
      if (failed) throw new Error(`${failed} bản tin không lưu được lên Firestore trong lần chạy này`);
    },
  };
}
