// Nội dung bảng "Tình trạng thiết bị" (DK-13 / MB-13) và câu trả lời mẫu của bot (DK-12).
// Hàm thuần, không đụng DOM: kiểm thử bằng node --test. Mỗi hàm trả { main, sub } hoặc chuỗi đã định dạng.
import { STATUS, isLive } from './connection.js';
import { formatNumber, formatTime, NO_VALUE } from './format.js';

/** Hàng B (DHT22) / C (MQ-135). Không trực tiếp → "Không rõ" thay vì nói lại trạng thái cũ như thể còn đúng. */
export function sensorRow(sensor, { status, latest, t }) {
  if (!isLive(status) || !latest) return { main: t('device.unknown'), sub: t('device.unknownNote'), tone: 'unknown' };
  const state = latest.sensors?.[sensor];
  if (state === 'error') return { main: t('device.sensor.error'), sub: t(`device.${sensor}.note`), tone: 'alert' };
  if (sensor === 'mq135' && state === 'warming') return { main: t('device.mq135.warming'), sub: t('device.mq135.warmingNote'), tone: 'warn' };
  if (state === 'ok') return { main: t(`device.${sensor}.ok`), sub: t(`device.${sensor}.note`), tone: 'ok' };
  return { main: NO_VALUE, sub: t(`device.${sensor}.note`), tone: 'unknown' };
}

const samePalette = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Hàng D (LED) theo mô hình LED mới (plan.md L1): "Tự động · bảng màu …" + "Gửi lúc hh:mm". */
export function ledRow({ led, device, config, t }) {
  const mode = led?.mode ?? device?.ledMode ?? null;
  const sub = led?.sentAt ? t('device.led.sent', { time: formatTime(led.sentAt) }) : t('device.led.notSent');
  if (mode === 'test') {
    const hex = led?.test?.color?.toUpperCase();
    const named = config?.led?.namedColors?.find((c) => c.hex.toUpperCase() === hex);
    const color = named ? `${named.name} ${hex}` : (hex ?? NO_VALUE);
    return { main: t('device.led.test', { color, power: t(led?.test?.on ? 'device.led.on' : 'device.led.off') }), sub };
  }
  if (mode === 'auto') {
    const custom = led?.palette && config?.led?.defaultPalette && !samePalette(led.palette, config.led.defaultPalette);
    return { main: t('device.led.auto', { palette: t(custom ? 'device.led.paletteCustom' : 'device.led.paletteDefault') }), sub };
  }
  return { main: NO_VALUE, sub };
}

/** Tên WiFi phát ra khi vào chế độ cấu hình (WiFiManager): "SmartClassroom-SC01" từ deviceId "sc-01". */
export function portalName(deviceId = 'sc-01') {
  return `SmartClassroom-${deviceId.replace(/[^a-z0-9]/gi, '').toUpperCase()}`;
}

/** Vị trí (0–100 %) trên thang độ ẩm của trang Telegram; null khi không có số. */
export function scalePercent(value, [min, max] = [0, 100]) {
  if (value == null || !Number.isFinite(value)) return null;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

/** Câu trả lời mẫu cho /doam và /trangthai, dựng từ số liệu thật đang có (ghi rõ "MINH HỌA" ở giao diện). */
export function botReplies({ latest, device, status, config, t }) {
  const low = config?.telegram?.humidityLow ?? 30;
  const high = config?.telegram?.humidityHigh ?? 85;
  const h = latest?.humidity ?? null;
  if (!latest || h === null) {
    return { doam: t('tg.reply.none'), trangthai: t('tg.reply.none') };
  }
  const time = formatTime(latest.receivedAt);
  const v = formatNumber(h, 1);
  const note = h > high ? t('tg.reply.high', { high }) : h < low ? t('tg.reply.low', { low }) : t('tg.reply.within', { low, high });
  const online = device?.online !== false && status !== STATUS.DEVICE_OFFLINE;
  return {
    doam: t('tg.reply.doam', { v, time, note }),
    trangthai: t('tg.reply.trangthai', {
      state: t(online ? 'tg.state.online' : 'tg.state.offline'),
      time,
      h: v,
      temp: formatNumber(latest.temperature, 1),
      co2: formatNumber(latest.co2, 0),
    }),
  };
}
