import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readContract } from '../src/config.js';
import { parseTelemetry } from '../src/core/validate.js';
import { BAD_PAYLOADS, SCENARIOS, createSimDevice } from '../scripts/sim/device.js';

const contract = readContract();
// Bộ sinh số giả cố định để kết quả lặp lại được
const seeded = (seed = 42) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

test('bản tin giả lập luôn hợp lệ theo contract, không cảnh báo', () => {
  const sim = createSimDevice({ contract, rng: seeded() });
  for (const name of ['normal', 'humid-high', 'humid-low', 'temp-watch', 'dht-error', 'mq-warming']) {
    sim.setScenario(name);
    for (let i = 0; i < 10; i++) {
      const r = parseTelemetry(JSON.stringify(sim.next()), contract);
      assert.equal(r.ok, true, name);
      assert.deepEqual(r.warnings, [], name);
    }
  }
});

test('seq tăng dần', () => {
  const sim = createSimDevice({ contract, rng: seeded() });
  assert.deepEqual([sim.next().seq, sim.next().seq, sim.next().seq], [0, 1, 2]);
});

test('kịch bản đạt đúng mức cần thấy trên giao diện sau vài bản tin', () => {
  const cases = [['humid-high', 'humidity', 'alert'], ['humid-low', 'humidity', 'alert'], ['temp-watch', 'temperature', 'watch'], ['normal', 'humidity', 'normal']];
  for (const [scenario, metric, level] of cases) {
    const sim = createSimDevice({ contract, rng: seeded(7) });
    sim.setScenario(scenario);
    let msg;
    for (let i = 0; i < 12; i++) msg = sim.next();
    assert.equal(msg.levels[metric], level, `${scenario} → ${metric}`);
  }
});

test('DHT22 lỗi và MQ-135 làm nóng gửi null kèm trạng thái cảm biến', () => {
  const sim = createSimDevice({ contract, rng: seeded() });
  sim.setScenario('dht-error');
  let m = sim.next();
  assert.equal(m.temperature, null);
  assert.equal(m.humidity, null);
  assert.equal(m.sensors.dht22, 'error');
  assert.equal(m.levels.humidity, null);
  sim.setScenario('mq-warming');
  m = sim.next();
  assert.equal(m.co2, null);
  assert.equal(m.sensors.mq135, 'warming');
});

test('--no-levels không gửi levels', () => {
  const sim = createSimDevice({ contract, withLevels: false, rng: seeded() });
  assert.equal('levels' in sim.next(), false);
});

test('mọi bản tin lỗi có chủ đích đều bị backend bỏ hoặc làm sạch', () => {
  for (const b of BAD_PAYLOADS) {
    const r = parseTelemetry(b.payload, contract);
    assert.ok(!r.ok || r.warnings.length > 0, b.note);
  }
});

test('phím tắt kịch bản không trùng nhau', () => {
  const keys = Object.values(SCENARIOS).map((s) => s.key);
  assert.equal(new Set(keys).size, keys.length);
  assert.ok(!keys.includes('q') && !keys.includes('?'));
});
