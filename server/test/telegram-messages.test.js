import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readContract } from '../src/config.js';
import {
  alertMessage, doamReply, formatNumber, formatTime, formatWhen, humidityAlert, NO_DATA, startReply, staleness,
  trangthaiReply, withMode,
} from '../src/services/telegram/messages.js';
import { botReplies } from '../../frontend/js/core/device-view.js';
import * as webFormat from '../../frontend/js/core/format.js';
import { setStrings, t } from '../../frontend/js/core/i18n.js';

const contract = readContract();
const FRONTEND = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend');
const strings = JSON.parse(fs.readFileSync(path.join(FRONTEND, 'strings/vi.json'), 'utf8'));

const NOW = new Date('2026-11-26T07:30:20.000Z'); // 14:30:20 giờ Việt Nam
const reading = (over = {}) => ({
  receivedAt: '2026-11-26T07:30:00.000Z', seq: 1, temperature: 27.5, humidity: 64.5, co2: 850,
  sensors: { dht22: 'ok', mq135: 'ok' }, levels: {}, levelsSource: 'server', ...over,
});
const online = { online: true, reason: 'telemetry', lastSeenAt: '2026-11-26T07:30:00.000Z' };
const view = (latest, device = online, now = NOW) => ({ latest, device, contract, now });

test('ngưỡng cảnh báo lấy từ contract: biên 29,9 / 30 / 85 / 85,1; null và không phải số thì không báo', () => {
  const tg = contract.telegram;
  assert.equal(humidityAlert(29.9, tg), 'low');
  assert.equal(humidityAlert(30, tg), null);
  assert.equal(humidityAlert(64.5, tg), null);
  assert.equal(humidityAlert(85, tg), null);
  assert.equal(humidityAlert(85.1, tg), 'high');
  for (const v of [null, undefined, NaN, '90']) assert.equal(humidityAlert(v, tg), null);
  assert.equal(humidityAlert(50, { humidityLow: 55, humidityHigh: 85 }), 'low'); // đổi contract thì đổi theo
});

test('số và giờ kiểu Việt Nam, khớp frontend/js/core/format.js', () => {
  for (const [v, d] of [[64.5, 1], [27.46, 1], [30, 1], [850, 0], [1040, 0], [-3.2, 1], [null, 1]]) {
    assert.equal(formatNumber(v, d), webFormat.formatNumber(v, d));
  }
  for (const at of ['2026-11-26T07:30:00.000Z', '2026-11-25T17:05:00.000Z']) assert.equal(formatTime(at), webFormat.formatTime(at));
  assert.equal(formatTime('2026-11-26T07:30:00.000Z'), '14:30');
  assert.equal(formatWhen('2026-11-26T07:30:00.000Z', NOW), '14:30');
  assert.equal(formatWhen('2026-11-25T07:30:00.000Z', NOW), '14:30 ngày 25/11/2026');
  assert.equal(formatWhen('2026-11-25T17:05:00.000Z', NOW), '00:05'); // 00:05 ngày 26 giờ VN = cùng ngày
});

test('/doam và /trangthai lúc bình thường TRÙNG NGUYÊN VĂN câu mẫu trên trang Telegram của website', () => {
  setStrings(strings);
  for (const h of [64.5, 88.2, 24]) {
    const latest = reading({ humidity: h });
    const web = botReplies({ latest, device: online, status: 'live', config: contract, t });
    assert.equal(doamReply(view(latest)), web.doam);
    assert.equal(trangthaiReply(view(latest)), web.trangthai);
  }
  const web = botReplies({ latest: null, device: online, status: 'connecting', config: contract, t });
  assert.equal(doamReply(view(null)), web.doam);
  assert.equal(NO_DATA, t('tg.reply.none'));
  assert.equal(startReply(contract).split('\n')[0], t('tg.step3.reply'));
});

test('/doam: nội dung theo từng trường hợp', () => {
  assert.equal(doamReply(view(reading())), 'Độ ẩm hiện tại: 64,5 % (14:30). Trong ngưỡng 30–85 %.');
  assert.equal(doamReply(view(reading({ humidity: 88 }))), 'Độ ẩm hiện tại: 88,0 % (14:30). Cao hơn ngưỡng 85 %.');
  assert.equal(doamReply(view(reading({ humidity: 29.9 }))), 'Độ ẩm hiện tại: 29,9 % (14:30). Thấp hơn ngưỡng 30 %.');
  assert.equal(doamReply(view(null)), 'Chưa có số liệu từ thiết bị.');
  assert.match(doamReply(view(reading({ humidity: null, temperature: null, sensors: { dht22: 'error', mq135: 'ok' } }))), /DHT22\) đang báo lỗi/);
  assert.equal(doamReply(view(reading({ humidity: null }))), 'Chưa có số liệu từ thiết bị.');
});

test('dữ liệu cũ (quá staleAfterS) và thiết bị ngoại tuyến: vẫn trả giá trị cuối, ghi rõ "Dữ liệu cũ"', () => {
  const late = new Date(NOW.getTime() + (contract.timing.staleAfterS + 5) * 1000);
  assert.equal(staleness({ latest: reading(), device: online, contract, now: NOW }), null);
  assert.equal(staleness({ latest: reading(), device: online, contract, now: late }), 'stale');
  assert.equal(staleness({ latest: reading(), device: { online: false }, contract, now: NOW }), 'offline');

  const stale = doamReply(view(reading(), online, late));
  assert.match(stale, /^Độ ẩm đo lần cuối: 64,5 % \(14:30\)/);
  assert.match(stale, /Dữ liệu cũ: chưa có bản tin mới từ 14:30\./);

  const off = trangthaiReply(view(reading(), { online: false, reason: 'lwt' }, new Date('2026-11-27T01:00:00.000Z')));
  assert.match(off, /^Thiết bị ngoại tuyến · cập nhật 14:30\./);
  assert.match(off, /Dữ liệu cũ: thiết bị đang ngoại tuyến, số đo lần cuối lúc 14:30 ngày 26\/11\/2026\./);
});

test('/trangthai: DHT22 lỗi vẫn hiện CO₂; MQ-135 làm nóng; chưa có bản tin', () => {
  const dht = trangthaiReply(view(reading({ temperature: null, humidity: null, sensors: { dht22: 'error', mq135: 'ok' } })));
  assert.equal(dht, 'Thiết bị trực tuyến · cập nhật 14:30. Độ ẩm: lỗi cảm biến · Nhiệt độ: lỗi cảm biến · CO₂ ~850 ppm (ước lượng).');
  const warm = trangthaiReply(view(reading({ co2: null, sensors: { dht22: 'ok', mq135: 'warming' } })));
  assert.match(warm, /CO₂: cảm biến đang làm nóng\.$/);
  assert.equal(trangthaiReply(view(null, { online: false, reason: 'unknown' })), 'Chưa có số liệu từ thiết bị.\nThiết bị: chưa kết nối.');
  assert.equal(trangthaiReply(view(null, { online: false, reason: 'lwt' })), 'Chưa có số liệu từ thiết bị.\nThiết bị: ngoại tuyến.');
});

test('tin cảnh báo: số, giờ, ngưỡng và thời gian nghỉ lấy từ contract', () => {
  const high = alertMessage({ kind: 'high', reading: reading({ humidity: 88 }), contract });
  assert.match(high, /ĐỘ ẨM CAO/);
  assert.match(high, /88,0 % lúc 14:30, cao hơn ngưỡng 85 %/);
  assert.match(high, /nghỉ 30 phút/);
  const low = alertMessage({ kind: 'low', reading: reading({ humidity: 24 }), contract });
  assert.match(low, /ĐỘ ẨM THẤP/);
  assert.match(low, /24,0 % lúc 14:30, thấp hơn ngưỡng 30 %/);
});

test('MODE khác live: nhãn [GIẢ LẬP] ở đầu mọi tin', () => {
  assert.equal(withMode('abc', 'live'), 'abc');
  assert.equal(withMode('abc', 'sim'), '[GIẢ LẬP] abc');
});
