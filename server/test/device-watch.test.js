import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig, readContract } from '../src/config.js';
import { createBus } from '../src/core/bus.js';
import { createDeviceWatch } from '../src/core/device-watch.js';
import { createState } from '../src/core/state.js';

const config = loadConfig({ env: {}, contract: readContract() });
const T0 = Date.parse('2026-11-17T07:00:00.000Z');
const quiet = { error() {}, warn() {}, info() {}, debug() {} };

function setup() {
  let clock = T0;
  const bus = createBus(quiet);
  const state = createState({ bus, now: () => new Date(clock) });
  const watch = createDeviceWatch({ state, config, now: () => clock });
  const reading = { receivedAt: new Date(T0).toISOString(), seq: 1, temperature: 27, humidity: 60, co2: 800,
    sensors: { dht22: 'ok', mq135: 'ok' }, levels: { temperature: 'normal', humidity: 'normal', co2: 'normal' }, levelsSource: 'device' };
  return { state, watch, reading, tick: (s) => { clock += s * 1000; } };
}

test('ngưỡng ngoại tuyến lấy từ contract (300 giây)', () => {
  assert.equal(config.contract.timing.offlineAfterS, 300);
});

test('299 giây chưa ngoại tuyến, 301 giây thì ngoại tuyến (timeout)', () => {
  const { state, watch, reading, tick } = setup();
  state.applyReading(reading);
  tick(299);
  assert.equal(watch.check(), false);
  assert.equal(state.device().online, true);
  tick(2);
  assert.equal(watch.check(), true);
  assert.equal(state.device().online, false);
  assert.equal(state.device().reason, 'timeout');
});

test('90 giây chỉ là "dữ liệu cũ" phía giao diện, backend chưa coi là ngoại tuyến', () => {
  const { state, watch, reading, tick } = setup();
  state.applyReading(reading);
  tick(91);
  watch.check();
  assert.equal(state.device().online, true);
});

test('chưa từng có bản tin thì không làm gì', () => {
  const { state, watch, tick } = setup();
  tick(10_000);
  assert.equal(watch.check(), false);
  assert.equal(state.device().reason, 'unknown');
});

test('status online cũng tính là "đã thấy thiết bị"', () => {
  const { state, watch, tick } = setup();
  state.applyStatus({ online: true });
  tick(301);
  assert.equal(watch.check(), true);
});
