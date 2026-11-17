// Nạp plugin tự động: mọi file server/src/plugins/*.js (trừ index.js và file bắt đầu bằng "_").
// Thành viên khác chỉ cần THÊM file, không sửa file của khung (plan.md mục 3.2, 12).
//
// Một plugin:
//   export async function register({ bus, state, config, log }) {
//     const off = bus.on('reading', (r) => { ... }, 'ten-plugin');
//     return { close: async () => off() };   // không bắt buộc
//   }
//
// - bus.on('reading' | 'device' | 'led:sent', fn, tên)  — dữ liệu nhận được là bản sao, sửa không ảnh hưởng ai
// - state: chỉ đọc — latest(), device(), led(), snapshot()
// - Tắt plugin: PLUGINS_DISABLED=telegram,firestore (tên file không có .js)
// - Plugin lỗi khi nạp chỉ bị bỏ qua và ghi log, backend vẫn chạy.
// - QUAN TRỌNG: khi config.mode === 'sim' dữ liệu là GIẢ. Plugin ghi ra dịch vụ thật phải tách riêng,
//   ví dụ Firestore ghi vào collection "readings_sim" hoặc dùng Firebase Emulator; Telegram chỉ gửi
//   cho người thử, không gửi cả nhóm. Khi chạy với HiveMQ thật, chỉ MỘT máy bật plugin ghi dữ liệu
//   (contract/README.md mục 8).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const PLUGINS_DIR = path.dirname(fileURLToPath(import.meta.url));

export async function loadPlugins({ bus, state, config, log, dir = PLUGINS_DIR }) {
  const files = fs.readdirSync(dir)
    .filter((f) => f.endsWith('.js') && f !== 'index.js' && !f.startsWith('_'))
    .sort();
  const readOnlyState = {
    latest: state.latest, device: state.device, led: state.led, snapshot: state.snapshot,
  };
  const loaded = [];

  for (const file of files) {
    const name = path.basename(file, '.js');
    if (config.pluginsDisabled.includes(name)) {
      log.info(`Bỏ qua plugin "${name}" (PLUGINS_DISABLED)`);
      continue;
    }
    try {
      const mod = await import(pathToFileURL(path.join(dir, file)).href);
      if (typeof mod.register !== 'function') throw new Error('không xuất hàm register()');
      const handle = await mod.register({ bus, state: readOnlyState, config, log: log.child(`plugin:${name}`) });
      loaded.push({ name, close: handle?.close });
      log.info(`Đã nạp plugin "${name}"`);
    } catch (err) {
      log.error(`Không nạp được plugin "${name}": ${err.message}`);
    }
  }

  return {
    names: loaded.map((p) => p.name),
    async closeAll() {
      for (const p of loaded) {
        try { await p.close?.(); } catch (err) { log.warn(`Plugin "${p.name}" lỗi khi đóng: ${err.message}`); }
      }
    },
  };
}
