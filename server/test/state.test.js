import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBus } from '../src/core/bus.js';
import { createState } from '../src/core/state.js';

function setup() {
  const errors = [];
  const log = { error: (...a) => errors.push(a.join(' ')), warn() {}, info() {}, debug() {} };
  const bus = createBus(log);
  const events = [];
  bus.on('reading', (r) => events.push(['reading', r]));
  bus.on('device', (d) => events.push(['device', d]));
  const state = createState({ bus, now: () => new Date('2026-11-17T07:00:00Z') });
  return { bus, state, events, errors };
}
const reading = (seq) => ({ receivedAt: `2026-11-17T07:00:${String(seq).padStart(2, '0')}.000Z`, seq, temperature: 27.5, humidity: 64.5, co2: 850,
  sensors: { dht22: 'ok', mq135: 'ok' }, levels: { temperature: 'normal', humidity: 'normal', co2: 'normal' }, levelsSource: 'device' });

test('ban đầu chưa có dữ liệu, thiết bị chưa rõ trạng thái', () => {
  const { state } = setup();
  assert.equal(state.latest(), null);
  assert.equal(state.device().online, false);
  assert.equal(state.device().reason, 'unknown');
});

test('bản tin đầu tiên: phát reading và đưa thiết bị lên trực tuyến (một lần)', () => {
  const { state, events } = setup();
  state.applyReading(reading(1));
  state.applyReading(reading(2));
  assert.deepEqual(events.map((e) => e[0]), ['device', 'reading', 'reading']);
  assert.equal(state.device().online, true);
  assert.equal(state.device().reason, 'telemetry');
  assert.equal(state.device().lastSeenAt, reading(2).receivedAt);
  assert.equal(state.latest().seq, 2);
});

test('LWT → ngoại tuyến; bản tin mới → trực tuyến lại', () => {
  const { state, events } = setup();
  state.applyStatus({ online: true, fw: '0.1.0', ssid: 'Phong_A12' });
  state.applyStatus({ online: false });
  assert.equal(state.device().online, false);
  assert.equal(state.device().reason, 'lwt');
  assert.equal(state.device().ssid, 'Phong_A12', 'giữ thông tin cũ khi LWT');
  state.applyReading(reading(3));
  assert.equal(state.device().online, true);
  assert.equal(events.filter((e) => e[0] === 'device').length, 3);
});

test('status lặp lại y hệt không phát sự kiện device', () => {
  const { state, events } = setup();
  state.applyStatus({ online: true, fw: '0.1.0' });
  state.applyStatus({ online: true, fw: '0.1.0' });
  assert.equal(events.filter((e) => e[0] === 'device').length, 1);
});

test('markTimeout chỉ tác dụng khi đang trực tuyến', () => {
  const { state } = setup();
  state.markTimeout();
  assert.equal(state.device().reason, 'unknown');
  state.applyReading(reading(1));
  state.markTimeout();
  assert.equal(state.device().online, false);
  assert.equal(state.device().reason, 'timeout');
});

test('plugin không sửa được trạng thái qua dữ liệu nhận được', () => {
  const { bus, state } = setup();
  bus.on('reading', (r) => { r.humidity = 0; });
  state.applyReading(reading(1));
  assert.equal(state.latest().humidity, 64.5);
  const d = state.device();
  d.online = false;
  assert.equal(state.device().online, true);
});

test('listener lỗi (đồng bộ và async) không chặn listener khác, được ghi log', async () => {
  const { bus, state, events, errors } = setup();
  bus.on('reading', () => { throw new Error('plugin hỏng'); }, 'plugin-a');
  bus.on('reading', async () => { throw new Error('plugin async hỏng'); }, 'plugin-b');
  state.applyReading(reading(1));
  await new Promise((r) => setImmediate(r));
  assert.equal(events.filter((e) => e[0] === 'reading').length, 1);
  assert.equal(errors.length, 2);
  assert.match(errors[0], /plugin-a/);
  assert.match(errors[1], /plugin-b/);
});
