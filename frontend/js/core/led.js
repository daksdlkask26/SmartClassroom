// Màu 8 bóng LED trên trang Giám sát (HANDOFF §3.5), mô phỏng từ bản tin mới nhất + bảng màu đã gửi.
// Hàm thuần, không đụng DOM: kiểm thử bằng node --test.
//
// Bóng 1–2 hệ thống (màu cố định) · 3–4 nhiệt độ · 5–6 độ ẩm · 7–8 CO₂ (contract/system.json → led.pairs).
// Kết quả: { colors: [8 phần tử], blink: { metric: 'error'|'warming' } } hoặc null = "không rõ" (vẽ xám).
// Mỗi phần tử colors: '#RRGGBB', 'blink' (nháy trắng) hoặc null (không rõ màu).

export const PAIRS = ['temperature', 'humidity', 'co2'];
const SENSOR_OF = { temperature: 'dht22', humidity: 'dht22', co2: 'mq135' };

export function ledColors({ latest, led, config, live }) {
  if (!config?.led || !latest || !live) return null;
  const { systemColors, levelOrder, defaultPalette, count = 8 } = config.led;

  // Chế độ Kiểm tra đèn: một màu cho cả thanh, Bật/Tắt thủ công (contract/examples/led-cmd.test.json)
  if (led?.mode === 'test') {
    const c = led.test?.on ? (led.test.color ?? null) : null;
    return { colors: Array(count).fill(c), blink: {} };
  }

  const palette = led?.palette ?? defaultPalette;
  const colors = [systemColors.run, systemColors.net];
  const blink = {};
  for (const m of PAIRS) {
    const sensor = latest.sensors?.[SENSOR_OF[m]];
    if (sensor === 'error' || sensor === 'warming') {
      colors.push('blink', 'blink');
      blink[m] = sensor;
      continue;
    }
    const i = levelOrder.indexOf(latest.levels?.[m]);
    const c = i >= 0 ? (palette?.[m]?.[i] ?? null) : null;
    colors.push(c, c);
  }
  return { colors, blink };
}

/** "Nhiệt độ, độ ẩm, CO₂ bình thường" · "Nhiệt độ cần chú ý · độ ẩm, CO₂ bình thường". Mức nặng nói trước. */
export function ledSummary(levels, t) {
  const parts = [];
  for (const lv of ['alert', 'watch', 'normal']) {
    const names = PAIRS.filter((m) => levels?.[m] === lv).map((m) => t(`monitor.led.pair.${m}`));
    if (names.length) parts.push(t(`monitor.led.summary.${lv}`, { list: names.join(', ') }));
  }
  const s = parts.join(' · ');
  return s ? s[0].toUpperCase() + s.slice(1) : '';
}
