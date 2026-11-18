// Kiểm thử phần tính toán của các dụng cụ trên trang Giám sát (G5): gauge, màu LED, sparkline.
// Chỉ hàm thuần trong frontend/js/core/, không cần trình duyệt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { valueToAngle, litCount, arcPath, polar } from '../../frontend/js/core/gauge-math.js';
import { ledColors, ledSummary } from '../../frontend/js/core/led.js';
import { sparkGeometry, dayRange } from '../../frontend/js/core/spark.js';
import { setStrings, t } from '../../frontend/js/core/i18n.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'contract/system.json'), 'utf8'));
setStrings(JSON.parse(fs.readFileSync(path.join(ROOT, 'frontend/strings/vi.json'), 'utf8')));

// ---------- gauge ----------
test('gauge: góc kim theo HANDOFF §3.1 (−120° … +120°), kẹp ngoài thang', () => {
  assert.equal(valueToAngle(0, 0, 100), -120);
  assert.equal(valueToAngle(50, 0, 100), 0);
  assert.equal(valueToAngle(100, 0, 100), 120);
  assert.equal(valueToAngle(150, 0, 100), 120);
  assert.equal(valueToAngle(-5, 10, 40), -120);
});

test('gauge: số đoạn sáng k = round(tỉ lệ × 60)', () => {
  assert.equal(litCount(64.5, 0, 100), 39);    // 38,7
  assert.equal(litCount(27.5, 10, 40), 35);    // 35,0
  assert.equal(litCount(850, 400, 2000), 17);  // 16,875
  assert.equal(litCount(0, 0, 100), 0);
  assert.equal(litCount(100, 0, 100), 60);
});

test('gauge: cung ngoài ngưỡng độ ẩm 0–30 và 85–100 là cung nhỏ, bắt đầu đúng đầu cung', () => {
  const low = arcPath(120, 120, 111, valueToAngle(0, 0, 100), valueToAngle(30, 0, 100));
  const high = arcPath(120, 120, 111, valueToAngle(85, 0, 100), valueToAngle(100, 0, 100));
  assert.match(low, / 0 0 1 /);
  assert.match(high, / 0 0 1 /);
  const [x, y] = polar(120, 120, 111, -120);
  assert.ok(low.startsWith(`M${x.toFixed(2)} ${y.toFixed(2)}`));
});

// ---------- LED ----------
const OK = { dht22: 'ok', mq135: 'ok' };
const NORMAL = { temperature: 'normal', humidity: 'normal', co2: 'normal' };
const reading = (over = {}) => ({ sensors: OK, levels: NORMAL, ...over });

test('LED: bảng màu mặc định, cả ba bình thường → trắng, xanh dương, 6 xanh lá', () => {
  const r = ledColors({ latest: reading(), led: null, config, live: true });
  assert.deepEqual(r.colors, ['#FFFFFF', '#2F6BFF', '#22E05A', '#22E05A', '#22E05A', '#22E05A', '#22E05A', '#22E05A']);
  assert.deepEqual(r.blink, {});
});

test('LED: mỗi cặp theo mức của thông số mình (nhiệt độ 3–4, độ ẩm 5–6, CO₂ 7–8)', () => {
  const r = ledColors({
    latest: reading({ levels: { temperature: 'watch', humidity: 'alert', co2: 'normal' } }),
    led: null, config, live: true,
  });
  assert.deepEqual(r.colors.slice(2), ['#FFD400', '#FFD400', '#FF2A2A', '#FF2A2A', '#22E05A', '#22E05A']);
});

test('LED: dùng bảng màu đã gửi thay cho mặc định', () => {
  const palette = { ...config.led.defaultPalette, humidity: ['#00C9B7', '#FF7A00', '#8A3FFF'] };
  const r = ledColors({ latest: reading(), led: { mode: 'auto', palette }, config, live: true });
  assert.equal(r.colors[4], '#00C9B7');
  assert.equal(r.colors[2], '#22E05A');
});

test('LED: DHT22 lỗi → 3–6 nháy trắng; MQ-135 làm nóng → 7–8 nháy', () => {
  const e = ledColors({ latest: reading({ sensors: { dht22: 'error', mq135: 'ok' }, levels: { co2: 'normal' } }), led: null, config, live: true });
  assert.deepEqual(e.colors.slice(2, 6), ['blink', 'blink', 'blink', 'blink']);
  assert.deepEqual(e.blink, { temperature: 'error', humidity: 'error' });
  const w = ledColors({ latest: reading({ sensors: { dht22: 'ok', mq135: 'warming' } }), led: null, config, live: true });
  assert.deepEqual(w.colors.slice(6), ['blink', 'blink']);
  assert.deepEqual(w.blink, { co2: 'warming' });
});

test('LED: không trực tiếp / chưa có bản tin / chưa có config → null (xám "không rõ")', () => {
  assert.equal(ledColors({ latest: reading(), led: null, config, live: false }), null);
  assert.equal(ledColors({ latest: null, led: null, config, live: true }), null);
  assert.equal(ledColors({ latest: reading(), led: null, config: null, live: true }), null);
});

test('LED: thiếu mức của một thông số → cặp đó không rõ màu, không đoán', () => {
  const r = ledColors({ latest: reading({ levels: { temperature: 'normal', humidity: null, co2: 'normal' } }), led: null, config, live: true });
  assert.deepEqual(r.colors.slice(4, 6), [null, null]);
});

test('LED: chế độ Kiểm tra đèn → một màu cho cả thanh, Tắt → bóng tắt (không phải "không rõ")', () => {
  const on = ledColors({ latest: reading(), led: { mode: 'test', test: { on: true, color: '#00C9B7' } }, config, live: true });
  assert.deepEqual(on.colors, Array(8).fill('#00C9B7'));
  const off = ledColors({ latest: reading(), led: { mode: 'test', test: { on: false, color: '#00C9B7' } }, config, live: true });
  assert.deepEqual(off.colors, Array(8).fill('off'));
});

test('LED: câu tóm tắt mức, mức nặng nói trước', () => {
  assert.equal(ledSummary(NORMAL, t), 'Nhiệt độ, độ ẩm, CO₂ bình thường');
  assert.equal(ledSummary({ temperature: 'watch', humidity: 'normal', co2: 'normal' }, t),
    'Nhiệt độ cần chú ý · độ ẩm, CO₂ bình thường');
  assert.equal(ledSummary({ temperature: 'normal', humidity: 'alert', co2: 'watch' }, t),
    'Độ ẩm cảnh báo · CO₂ cần chú ý · nhiệt độ bình thường');
  assert.equal(ledSummary(null, t), '');
});

// ---------- sparkline ----------
const pts = (...avgs) => avgs.map((avg, i) => ({ t: `2026-11-17T${String(i).padStart(2, '0')}:00:00.000Z`, avg, min: avg, max: avg, n: avg == null ? 0 : 1 }));

test('sparkline: mốc thiếu dữ liệu ngắt đường, không nối', () => {
  const g = sparkGeometry(pts(60, 62, null, 64, 63));
  assert.equal(g.segments.length, 2);
  assert.equal(g.segments[0].length, 2);
  assert.equal(g.segments[1].length, 2);
  assert.equal(g.last[0], 240);
});

test('sparkline: không có điểm nào → null (không vẽ đường giả)', () => {
  assert.equal(sparkGeometry(pts(null, null)), null);
  assert.equal(sparkGeometry([]), null);
});

test('sparkline: ngưỡng 85 % luôn nằm trong khung; giá trị cao vẽ ở trên', () => {
  const g = sparkGeometry(pts(60, 62, 64), { include: [85], height: 64, pad: 6 });
  assert.ok(g.y(85) >= 6 && g.y(85) <= 58);
  assert.ok(g.y(85) < g.y(60));
  const flat = sparkGeometry(pts(50, 50, 50));
  assert.ok(Number.isFinite(flat.y(50)));
});

test('sparkline: khoảng 24 giờ lấy min/max, bỏ mốc thiếu', () => {
  const p = [
    { avg: 61, min: 60.2, max: 61.7 },
    { avg: null, min: null, max: null },
    { avg: 86, min: 84.9, max: 87.4 },
  ];
  assert.deepEqual(dayRange(p), { min: 60.2, max: 87.4 });
  assert.equal(dayRange([{ avg: null, min: null, max: null }]), null);
});
