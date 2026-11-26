// Nội dung tin bot gửi (ID 6, 7). Hàm thuần: nhận số liệu, trả chuỗi văn bản thuần (không Markdown).
//
// Câu trả lời /doam, /trangthai lúc bình thường và lúc chưa có số liệu TRÙNG NGUYÊN VĂN với câu mẫu trên trang
// Telegram của website (frontend/strings/vi.json: tg.reply.*, dựng bởi frontend/js/core/device-view.js → botReplies).
// Đổi câu ở đây thì đổi cả bên đó; test/telegram-messages.test.js kiểm tra hai bên khớp nhau.
//
// Số theo kiểu Việt Nam (64,5), giờ theo Asia/Ho_Chi_Minh dù máy chủ chạy múi giờ nào.

export const TIME_ZONE = 'Asia/Ho_Chi_Minh';
export const NO_VALUE = '—';
export const SIM_PREFIX = '[GIẢ LẬP] ';

const numberFormats = new Map();
/** 64.5 → "64,5"; null / không phải số → "—". Giống frontend/js/core/format.js. */
export function formatNumber(value, decimals = 0) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return NO_VALUE;
  if (!numberFormats.has(decimals)) {
    numberFormats.set(decimals, new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: false,
    }));
  }
  return numberFormats.get(decimals).format(value);
}

const partsFormat = new Intl.DateTimeFormat('vi-VN', {
  timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
function vnParts(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return Object.fromEntries(partsFormat.formatToParts(d).map((p) => [p.type, p.value]));
}

/** "14:30" theo giờ Việt Nam. */
export function formatTime(input) {
  const p = vnParts(input);
  return p ? `${p.hour}:${p.minute}` : NO_VALUE;
}

/** "14:30" nếu cùng ngày với now (giờ Việt Nam), ngược lại "14:30 ngày 25/11/2026". */
export function formatWhen(input, now) {
  const p = vnParts(input);
  if (!p) return NO_VALUE;
  const n = vnParts(now);
  const sameDay = n && n.day === p.day && n.month === p.month && n.year === p.year;
  return sameDay ? `${p.hour}:${p.minute}` : `${p.hour}:${p.minute} ngày ${p.day}/${p.month}/${p.year}`;
}

/** Tin gửi đi khi MODE khác live luôn có nhãn [GIẢ LẬP], để không ai nhầm số giả là số thật. */
export const withMode = (text, mode) => (mode === 'live' ? text : SIM_PREFIX + text);

/** 'low' | 'high' | null. Đúng bằng ngưỡng thì không cảnh báo (contract mục 4: 30 và 85 là "cần chú ý"). */
export function humidityAlert(h, { humidityLow, humidityHigh }) {
  if (typeof h !== 'number' || !Number.isFinite(h)) return null;
  if (h < humidityLow) return 'low';
  if (h > humidityHigh) return 'high';
  return null;
}

/**
 * Số liệu còn mới không: giống thanh trạng thái trên web (contract mục 5).
 * @returns {null | 'offline' | 'stale'}
 */
export function staleness({ latest, device, contract, now }) {
  if (device && device.online === false) return 'offline';
  const at = Date.parse(latest?.receivedAt);
  const limitS = contract.timing?.staleAfterS ?? 90;
  if (Number.isFinite(at) && now.getTime() - at > limitS * 1000) return 'stale';
  return null;
}

function staleLine(kind, latest, now) {
  const when = formatWhen(latest.receivedAt, now);
  return kind === 'offline'
    ? `Dữ liệu cũ: thiết bị đang ngoại tuyến, số đo lần cuối lúc ${when}.`
    : `Dữ liệu cũ: chưa có bản tin mới từ ${when}.`;
}

function humidityNote(h, tg) {
  const kind = humidityAlert(h, tg);
  if (kind === 'high') return `Cao hơn ngưỡng ${tg.humidityHigh} %.`;
  if (kind === 'low') return `Thấp hơn ngưỡng ${tg.humidityLow} %.`;
  return `Trong ngưỡng ${tg.humidityLow}–${tg.humidityHigh} %.`;
}

export const NO_DATA = 'Chưa có số liệu từ thiết bị.';

/** Trả lời /doam. */
export function doamReply({ latest, device, contract, now }) {
  if (!latest) return NO_DATA;
  if (latest.sensors?.dht22 === 'error') {
    return `Cảm biến độ ẩm (DHT22) đang báo lỗi nên chưa đo được (${formatWhen(latest.receivedAt, now)}).`;
  }
  const h = latest.humidity;
  if (typeof h !== 'number') return NO_DATA;
  const tg = contract.telegram;
  const v = formatNumber(h, contract.metrics?.humidity?.decimals ?? 1);
  const stale = staleness({ latest, device, contract, now });
  if (!stale) return `Độ ẩm hiện tại: ${v} % (${formatTime(latest.receivedAt)}). ${humidityNote(h, tg)}`;
  return `Độ ẩm đo lần cuối: ${v} % (${formatWhen(latest.receivedAt, now)}). ${humidityNote(h, tg)}\n${staleLine(stale, latest, now)}`;
}

/** Trả lời /trangthai. */
export function trangthaiReply({ latest, device, contract, now }) {
  const online = device?.online === true;
  if (!latest) {
    const st = device?.reason === 'unknown' || !device ? 'chưa kết nối' : online ? 'trực tuyến' : 'ngoại tuyến';
    return `${NO_DATA}\nThiết bị: ${st}.`;
  }
  const dec = (m, d) => contract.metrics?.[m]?.decimals ?? d;
  const dhtError = latest.sensors?.dht22 === 'error';
  const mq = latest.sensors?.mq135;
  const h = dhtError ? 'Độ ẩm: lỗi cảm biến' : `Độ ẩm ${formatNumber(latest.humidity, dec('humidity', 1))} %`;
  const temp = dhtError ? 'Nhiệt độ: lỗi cảm biến' : `Nhiệt độ ${formatNumber(latest.temperature, dec('temperature', 1))} °C`;
  const co2 = mq === 'warming' ? 'CO₂: cảm biến đang làm nóng'
    : mq === 'error' ? 'CO₂: lỗi cảm biến'
      : `CO₂ ~${formatNumber(latest.co2, dec('co2', 0))} ppm (ước lượng)`;
  const head = `Thiết bị ${online ? 'trực tuyến' : 'ngoại tuyến'} · cập nhật ${formatTime(latest.receivedAt)}.`;
  const text = `${head} ${h} · ${temp} · ${co2}.`;
  const stale = staleness({ latest, device, contract, now });
  return stale ? `${text}\n${staleLine(stale, latest, now)}` : text;
}

/** Tin cảnh báo độ ẩm. */
export function alertMessage({ kind, reading, contract }) {
  const tg = contract.telegram;
  const v = formatNumber(reading.humidity, contract.metrics?.humidity?.decimals ?? 1);
  const time = formatTime(reading.receivedAt);
  const line = kind === 'high'
    ? `⚠ CẢNH BÁO: ĐỘ ẨM CAO\nĐộ ẩm phòng học ${v} % lúc ${time}, cao hơn ngưỡng ${tg.humidityHigh} %.`
    : `⚠ CẢNH BÁO: ĐỘ ẨM THẤP\nĐộ ẩm phòng học ${v} % lúc ${time}, thấp hơn ngưỡng ${tg.humidityLow} %.`;
  return `${line}\nBot nghỉ ${tg.cooldownMin} phút rồi mới nhắc lại. Gửi /doam để xem số mới nhất.`;
}

export const COMMANDS = [
  { command: 'doam', description: 'Độ ẩm mới nhất' },
  { command: 'trangthai', description: 'Tình trạng thiết bị và môi trường' },
  { command: 'start', description: 'Đăng ký nhận cảnh báo độ ẩm' },
  { command: 'stop', description: 'Huỷ đăng ký nhận cảnh báo' },
];

export const helpText = () => `Các lệnh:\n${COMMANDS.map((c) => `/${c.command} — ${c.description.toLowerCase()}`).join('\n')}`;

const rule = (tg) => `Bot báo khi độ ẩm dưới ${tg.humidityLow} % hoặc trên ${tg.humidityHigh} %, nghỉ ${tg.cooldownMin} phút giữa hai lần.`;

/** "Đã đăng ký…" trùng câu mẫu trên website (tg.step3.reply). */
export const startReply = (contract) => `Đã đăng ký nhận cảnh báo độ ẩm phòng học.\n${rule(contract.telegram)}\n\n${helpText()}`;
export const startAgainReply = (contract) => `Bạn đã đăng ký rồi.\n${rule(contract.telegram)}\nGửi /stop nếu muốn ngừng nhận.`;
export const stopReply = () => 'Đã huỷ đăng ký. Bạn sẽ không nhận cảnh báo nữa. Gửi /start để đăng ký lại.';
export const stopNotSubscribedReply = () => 'Bạn chưa đăng ký nhận cảnh báo. Gửi /start để đăng ký.';
export const unknownReply = () => `Bot chưa hiểu tin này.\n${helpText()}`;
export const deniedReply = (chatId) => 'Bot này chỉ phục vụ người được nhóm cho phép.\n'
  + `Mã chat của bạn: ${chatId}. Gửi mã này cho người quản lý hệ thống nếu cần được thêm.`;
export const privateOnlyReply = () => 'Bot chỉ nhận lệnh trong tin nhắn riêng. Hãy mở chat riêng với bot.';
