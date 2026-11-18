// Kiểm thử phần thuần của trang Thiết bị & WiFi và Telegram (G7): frontend/js/core/device-view.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sensorRow, ledRow, portalName, scalePercent, botReplies } from '../../frontend/js/core/device-view.js';
import { STATUS } from '../../frontend/js/core/connection.js';
import { setStrings, t } from '../../frontend/js/core/i18n.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'contract/system.json'), 'utf8'));
setStrings(JSON.parse(fs.readFileSync(path.join(ROOT, 'frontend/strings/vi.json'), 'utf8')));

const latest = (over = {}) => ({
  receivedAt: '2026-11-17T07:30:12.000Z', temperature: 27.5, humidity: 64.5, co2: 850,
  sensors: { dht22: 'ok', mq135: 'ok' }, ...over,
});

test('Thiết bị: hàng cảm biến theo trạng thái DHT22 / MQ-135 (DK-13)', () => {
  const on = { status: STATUS.ONLINE, t };
  assert.equal(sensorRow('dht22', { ...on, latest: latest() }).main, 'Đang đọc bình thường');
  assert.equal(sensorRow('mq135', { ...on, latest: latest() }).main, 'Đã làm nóng');
  assert.equal(sensorRow('mq135', { ...on, latest: latest({ sensors: { dht22: 'ok', mq135: 'warming' } }) }).main, 'Đang làm nóng');
  const err = sensorRow('dht22', { ...on, latest: latest({ sensors: { dht22: 'error', mq135: 'ok' } }) });
  assert.equal(err.main, 'Không đọc được');
  assert.equal(err.tone, 'alert');
});

test('Thiết bị: số không còn trực tiếp → "Không rõ", không nói lại trạng thái cũ như thể còn đúng', () => {
  for (const status of [STATUS.STALE, STATUS.DEVICE_OFFLINE, STATUS.DISCONNECTED, STATUS.CONNECTING]) {
    assert.equal(sensorRow('dht22', { status, latest: latest(), t }).main, 'Không rõ');
  }
  assert.equal(sensorRow('dht22', { status: STATUS.ONLINE, latest: null, t }).main, 'Không rõ');
});

test('Thiết bị: hàng LED theo mô hình mới — tự động + bảng màu, không có công tắc (plan.md L1)', () => {
  const sentAt = '2026-11-17T05:12:00.000Z'; // 12:12 UTC+7
  const def = ledRow({ led: { mode: 'auto', palette: config.led.defaultPalette, sentAt }, config, t });
  assert.equal(def.main, 'Tự động · bảng màu mặc định');
  assert.equal(def.sub, 'Gửi lúc 12:12');
  const custom = { ...config.led.defaultPalette, co2: ['#00C9B7', '#FF7A00', '#8A3FFF'] };
  assert.equal(ledRow({ led: { mode: 'auto', palette: custom }, config, t }).main, 'Tự động · bảng màu tùy chỉnh');
  assert.match(ledRow({ led: { mode: 'auto' }, config, t }).sub, /^Chưa gửi lệnh/);
  // Chưa có lệnh từ web: lấy chế độ thiết bị tự báo
  assert.equal(ledRow({ led: null, device: { ledMode: 'auto' }, config, t }).main, 'Tự động · bảng màu mặc định');
  assert.equal(ledRow({ led: null, device: null, config, t }).main, '—');
});

test('Thiết bị: chế độ Kiểm tra đèn ghi tên màu + BẬT/TẮT', () => {
  const r = ledRow({ led: { mode: 'test', test: { on: true, color: '#00c9b7' } }, config, t });
  assert.equal(r.main, 'Kiểm tra đèn · Xanh ngọc #00C9B7 · BẬT');
  assert.equal(ledRow({ led: { mode: 'test', test: { on: false, color: '#123456' } }, config, t }).main, 'Kiểm tra đèn · #123456 · TẮT');
});

test('Thiết bị: tên WiFi cấu hình SmartClassroom-SC01 từ mã thiết bị', () => {
  assert.equal(portalName('sc-01'), 'SmartClassroom-SC01');
  assert.equal(portalName(), 'SmartClassroom-SC01');
});

test('Telegram: vị trí trên thang độ ẩm, kẹp 0–100 và không có số thì null', () => {
  assert.equal(scalePercent(64.5), 64.5);
  assert.equal(scalePercent(-3), 0);
  assert.equal(scalePercent(120), 100);
  assert.equal(scalePercent(null), null);
  assert.equal(scalePercent(NaN), null);
});

test('Telegram: câu trả lời mẫu /doam, /trangthai dựng từ số liệu mới nhất', () => {
  const r = botReplies({ latest: latest(), device: { online: true }, status: STATUS.ONLINE, config, t });
  assert.equal(r.doam, 'Độ ẩm hiện tại: 64,5 % (14:30). Trong ngưỡng 30–85 %.');
  assert.equal(r.trangthai, 'Thiết bị trực tuyến · cập nhật 14:30. Độ ẩm 64,5 % · Nhiệt độ 27,5 °C · CO₂ ~850 ppm (ước lượng).');
  assert.match(botReplies({ latest: latest({ humidity: 88 }), config, t }).doam, /Cao hơn ngưỡng 85 %\.$/);
  assert.match(botReplies({ latest: latest({ humidity: 24 }), config, t }).doam, /Thấp hơn ngưỡng 30 %\.$/);
  assert.match(botReplies({ latest: latest(), device: { online: false }, status: STATUS.DEVICE_OFFLINE, config, t }).trangthai, /^Thiết bị ngoại tuyến/);
});

test('Telegram: chưa có số → không bịa câu trả lời', () => {
  const r = botReplies({ latest: null, config, t });
  assert.equal(r.doam, 'Chưa có số liệu từ thiết bị.');
  assert.equal(botReplies({ latest: latest({ humidity: null }), config, t }).doam, 'Chưa có số liệu từ thiết bị.');
});
