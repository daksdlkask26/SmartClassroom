// Plugin MẪU — không được nạp (tên bắt đầu bằng "_"). Chép thành firestore.js / telegram.js rồi sửa.
// Xem hướng dẫn ở đầu server/src/plugins/index.js và plan.md mục 12.

export async function register({ bus, state, config, log }) {
  log.info(`Plugin mẫu chạy, thiết bị ${config.deviceId}, trạng thái hiện tại: ${state.device().online ? 'trực tuyến' : 'chưa rõ'}`);

  const offReading = bus.on('reading', async (r) => {
    // r = { receivedAt, seq, temperature, humidity, co2, sensors, levels, levelsSource }
    // Ví dụ Firestore (Tuấn): await db.collection('readings').add(r)
    // Ví dụ Telegram (Thành): if (r.humidity !== null && r.humidity > config.contract.telegram.humidityHigh) …
    log.debug(`nhận bản tin #${r.seq}: độ ẩm ${r.humidity ?? '—'} %`);
  }, 'example');

  const offDevice = bus.on('device', (d) => {
    log.debug(`thiết bị ${d.online ? 'trực tuyến' : 'ngoại tuyến'} (${d.reason})`);
  }, 'example');

  return {
    async close() {
      offReading();
      offDevice();
    },
  };
}
