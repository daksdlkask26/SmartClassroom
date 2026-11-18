// Kiểm thử phần thuần của trang Đèn LED (G8): frontend/js/core/led-editor.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseHex, colorName, colorLabel, samePalette, sentPalette, paletteDiff, diffSummary, duplicateLevels,
  bandText, scaleSegments, valuePercent, previewLeds, testLeds,
} from '../../frontend/js/core/led-editor.js';
import { setStrings, t } from '../../frontend/js/core/i18n.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'contract/system.json'), 'utf8'));
setStrings(JSON.parse(fs.readFileSync(path.join(ROOT, 'frontend/strings/vi.json'), 'utf8')));
const DEFAULT = config.led.defaultPalette;

const reading = (over = {}) => ({
  receivedAt: '2026-11-17T07:30:12.000Z', temperature: 27.5, humidity: 64.5, co2: 850,
  sensors: { dht22: 'ok', mq135: 'ok' }, levels: { temperature: 'normal', humidity: 'normal', co2: 'normal' }, ...over,
});

test('LED: ô nhập HEX nhận 6 hoặc 3 chữ số, có hay không có #', () => {
  assert.equal(parseHex('ff7a00'), '#FF7A00');
  assert.equal(parseHex(' #FF7A00 '), '#FF7A00');
  assert.equal(parseHex('#f70'), '#FF7700');
  for (const bad of ['', '#12345', '#GGGGGG', 'cam', null]) assert.equal(parseHex(bad), null, String(bad));
});

test('LED: tên màu theo 10 màu có tên của contract, màu khác hiện HEX', () => {
  assert.equal(colorName('#ff7a00', config), 'Cam');
  assert.equal(colorLabel('#00C9B7', config), 'Xanh ngọc');
  assert.equal(colorLabel('#123abc', config), '#123ABC');
});

test('LED: chưa gửi bảng màu từ web → so với bảng mặc định', () => {
  assert.deepEqual(sentPalette(null, config), DEFAULT);
  const custom = { ...DEFAULT, co2: ['#00C9B7', '#FF7A00', '#8A3FFF'] };
  assert.deepEqual(sentPalette({ mode: 'auto', palette: custom }, config), custom);
  assert.equal(samePalette({ ...DEFAULT, humidity: ['#22e05a', '#ffd400', '#ff2a2a'] }, DEFAULT), true);
});

test('LED: dòng cạnh nút Áp dụng như DK-06 ("1 thay đổi chưa gửi · Độ ẩm · Cần chú ý: Vàng → Cam")', () => {
  const draft = { ...DEFAULT, humidity: ['#22E05A', '#FF7A00', '#FF2A2A'] };
  const diff = paletteDiff(draft, DEFAULT, config);
  assert.deepEqual(diff, [{ metric: 'humidity', level: 'watch', from: '#FFD400', to: '#FF7A00' }]);
  assert.equal(diffSummary(diff, { t, config }), '1 thay đổi chưa gửi · Độ ẩm · Cần chú ý: Vàng → Cam');
  const three = { temperature: ['#FFFFFF', '#FFD400', '#FF2A2A'], humidity: draft.humidity, co2: ['#22E05A', '#FFD400', '#123456'] };
  assert.equal(diffSummary(paletteDiff(three, DEFAULT, config), { t, config }), '3 thay đổi chưa gửi');
  assert.equal(diffSummary([], { t, config }), '');
});

test('LED: hai mức cùng màu (ST-17) được phát hiện, kể cả khác hoa/thường', () => {
  assert.deepEqual(duplicateLevels(DEFAULT.humidity, config), []);
  assert.deepEqual(duplicateLevels(['#22E05A', '#ff2a2a', '#FF2A2A'], config), [['watch', 'alert']]);
});

test('LED: chữ khoảng ngưỡng lấy từ contract, đúng như DK-06', () => {
  const b = (m, lv) => bandText(m, lv, config, t);
  assert.equal(b('temperature', 'normal'), '20 – 30 °C');
  assert.equal(b('temperature', 'watch'), '16 – < 20 · > 30 – 34 °C');
  assert.equal(b('temperature', 'alert'), '< 16 · > 34 °C');
  assert.equal(b('humidity', 'watch'), '30 – < 40 · > 70 – 85 %');
  assert.equal(b('humidity', 'alert'), '< 30 · > 85 % · như Telegram');
  assert.equal(b('co2', 'normal'), '< 1000 ppm');
  assert.equal(b('co2', 'watch'), '1000 – < 1500 ppm');
  assert.equal(b('co2', 'alert'), '≥ 1500 ppm');
});

test('LED: thanh ngưỡng theo thang gauge, tô màu bản nháp, có vạch ở mỗi ranh giới', () => {
  const draft = { ...DEFAULT, humidity: ['#22E05A', '#FF7A00', '#FF2A2A'] };
  const { segments, ticks } = scaleSegments('humidity', draft, config);
  assert.deepEqual(segments.map((s) => [s.level, s.color, s.from, s.to]), [
    ['alert', '#FF2A2A', 0, 30], ['watch', '#FF7A00', 30, 40], ['normal', '#22E05A', 40, 70],
    ['watch', '#FF7A00', 70, 85], ['alert', '#FF2A2A', 85, 100],
  ]);
  assert.deepEqual(ticks.map((k) => k.value), [30, 40, 70, 85]);
  assert.deepEqual(scaleSegments('co2', DEFAULT, config).ticks.map((k) => k.value), [1000, 1500]);
  assert.equal(valuePercent(64.5, 'humidity', config), 64.5);
  assert.equal(valuePercent(25, 'temperature', config), 50);
  assert.equal(valuePercent(null, 'co2', config), null);
});

test('LED: xem trước dùng bản nháp; cặp đang sửa hiện màu của mức đang sửa', () => {
  const draft = { ...DEFAULT, humidity: ['#22E05A', '#FF7A00', '#FF2A2A'] };
  const plain = previewLeds({ latest: reading(), palette: draft, config, live: true });
  assert.deepEqual(plain.colors.slice(4, 6), ['#22E05A', '#22E05A']); // độ ẩm đang bình thường
  const editing = previewLeds({ latest: reading(), palette: draft, config, live: true, editing: { metric: 'humidity', level: 'watch' } });
  assert.deepEqual(editing.colors.slice(4, 6), ['#FF7A00', '#FF7A00']);
  assert.deepEqual(editing.colors.slice(0, 4), plain.colors.slice(0, 4));
  // Không trực tiếp (dữ liệu cũ / ngoại tuyến) → "không rõ", kể cả khi đang sửa
  assert.equal(previewLeds({ latest: reading(), palette: draft, config, live: false, editing: { metric: 'humidity', level: 'watch' } }), null);
});

test('LED: Kiểm tra đèn — cả thanh một màu, Tắt → bóng tắt', () => {
  assert.deepEqual(testLeds({ color: '#FF7A00', on: true }, config).colors, Array(8).fill('#FF7A00'));
  assert.deepEqual(testLeds({ color: '#FF7A00', on: false }, config).colors, Array(8).fill('off'));
});
