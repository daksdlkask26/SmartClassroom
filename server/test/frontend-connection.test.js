// Kiểm thử phía giao diện chạy bằng Node: 5 trạng thái thanh trạng thái (HANDOFF §3.4, plan.md 8.3 + 11.1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STATUS, ageSeconds, deriveStatus, isLive } from '../../frontend/js/core/connection.js';

const NOW = Date.parse('2026-11-06T07:30:00.000Z'); // 14:30 UTC+7
const at = (secondsAgo) => ({ receivedAt: new Date(NOW - secondsAgo * 1000).toISOString() });
const ONLINE_DEVICE = { online: true, reason: 'status' };

const status = (input) => deriveStatus({ now: NOW, staleAfterS: 90, ...input }).status;

test('lần mở WebSocket đầu tiên → ĐANG KẾT NỐI, kể cả khi đã có số cũ', () => {
  assert.equal(status({ ws: 'connecting', latest: null, device: null }), STATUS.CONNECTING);
  assert.equal(status({ ws: 'connecting', latest: at(5), device: ONLINE_DEVICE }), STATUS.CONNECTING);
});

test('WebSocket mở nhưng chưa có bản tin nào → ĐANG KẾT NỐI', () => {
  // máy chủ vừa khởi động: device.reason = "unknown", chưa phải ngoại tuyến
  assert.equal(status({ ws: 'open', latest: null, device: { online: false, reason: 'unknown' } }), STATUS.CONNECTING);
  assert.equal(status({ ws: 'open', latest: null, device: null }), STATUS.CONNECTING);
});

test('bản tin cuối ≤ 90 giây → TRỰC TUYẾN; 91 giây → DỮ LIỆU CŨ', () => {
  assert.equal(status({ ws: 'open', latest: at(0), device: ONLINE_DEVICE }), STATUS.ONLINE);
  assert.equal(status({ ws: 'open', latest: at(89), device: ONLINE_DEVICE }), STATUS.ONLINE);
  assert.equal(status({ ws: 'open', latest: at(90), device: ONLINE_DEVICE }), STATUS.ONLINE);
  assert.equal(status({ ws: 'open', latest: at(90.9), device: ONLINE_DEVICE }), STATUS.ONLINE);
  assert.equal(status({ ws: 'open', latest: at(91), device: ONLINE_DEVICE }), STATUS.STALE);
  assert.equal(status({ ws: 'open', latest: at(299), device: ONLINE_DEVICE }), STATUS.STALE);
});

test('ngưỡng dữ liệu cũ lấy từ contract (timing.staleAfterS)', () => {
  const s = (age) => deriveStatus({ ws: 'open', latest: at(age), device: ONLINE_DEVICE, now: NOW, staleAfterS: 30 }).status;
  assert.equal(s(30), STATUS.ONLINE);
  assert.equal(s(31), STATUS.STALE);
  // không truyền → mặc định 90 giây (tokens.css --data-stale-after-s)
  assert.equal(deriveStatus({ ws: 'open', latest: at(91), device: ONLINE_DEVICE, now: NOW }).status, STATUS.STALE);
});

test('LWT hoặc quá offlineAfterS → THIẾT BỊ NGOẠI TUYẾN, ưu tiên hơn DỮ LIỆU CŨ', () => {
  assert.equal(status({ ws: 'open', latest: at(5), device: { online: false, reason: 'lwt' } }), STATUS.DEVICE_OFFLINE);
  assert.equal(status({ ws: 'open', latest: at(301), device: { online: false, reason: 'timeout' } }), STATUS.DEVICE_OFFLINE);
  assert.equal(status({ ws: 'open', latest: null, device: { online: false, reason: 'lwt' } }), STATUS.DEVICE_OFFLINE);
});

test('thiết bị quay lại (online=true) → về TRỰC TUYẾN', () => {
  assert.equal(status({ ws: 'open', latest: at(2), device: { online: true, reason: 'telemetry' } }), STATUS.ONLINE);
});

test('WebSocket đứt → MẤT KẾT NỐI, kể cả khi thiết bị đang ngoại tuyến', () => {
  assert.equal(status({ ws: 'closed', latest: at(5), device: ONLINE_DEVICE }), STATUS.DISCONNECTED);
  assert.equal(status({ ws: 'closed', latest: null, device: null }), STATUS.DISCONNECTED);
  assert.equal(status({ ws: 'closed', latest: at(5), device: { online: false, reason: 'lwt' } }), STATUS.DISCONNECTED);
});

test('ageSeconds: làm tròn xuống, giờ lệch về tương lai tính 0, thiếu / hỏng → null', () => {
  assert.equal(ageSeconds(at(12.7), NOW), 12);
  assert.equal(ageSeconds(at(-3), NOW), 0);
  assert.equal(ageSeconds(null, NOW), null);
  assert.equal(ageSeconds({ receivedAt: 'không phải ngày' }, NOW), null);
});

test('chỉ TRỰC TUYẾN mới coi số là đáng tin (hiện nhãn mức)', () => {
  assert.equal(isLive(STATUS.ONLINE), true);
  for (const s of [STATUS.CONNECTING, STATUS.STALE, STATUS.DEVICE_OFFLINE, STATUS.DISCONNECTED]) {
    assert.equal(isLive(s), false, s);
  }
});
