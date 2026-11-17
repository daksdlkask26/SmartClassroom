import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readContract } from '../src/config.js';
import { METRICS, computeLevels, levelFor, levelWithHysteresis } from '../src/core/levels.js';

const contract = readContract();

// Bảng ranh giới trong contract/README.md mục 4 — firmware, backend, web phải ra cùng kết quả.
const BOUNDARIES = {
  temperature: [[15.9, 'alert'], [16, 'watch'], [19.9, 'watch'], [20, 'normal'], [30, 'normal'], [30.1, 'watch'], [34, 'watch'], [34.1, 'alert']],
  humidity: [[29.9, 'alert'], [30, 'watch'], [39.9, 'watch'], [40, 'normal'], [70, 'normal'], [70.1, 'watch'], [85, 'watch'], [85.1, 'alert']],
  co2: [[999, 'normal'], [1000, 'watch'], [1499, 'watch'], [1500, 'alert']],
};

for (const [metric, rows] of Object.entries(BOUNDARIES)) {
  test(`ranh giới ${metric} đúng bảng README`, () => {
    for (const [v, want] of rows) assert.equal(levelFor(contract, metric, v), want, `${metric}=${v}`);
  });
}

test('ngưỡng phủ kín trục số, không chồng lấn (mỗi giá trị khớp đúng 1 khoảng)', () => {
  for (const m of METRICS) {
    const edges = contract.levels[m].bands.flatMap((b) => [b.min, b.max]).filter((x) => x !== undefined);
    const pts = new Set([-1e6, 1e6]);
    for (const e of edges) for (const d of [-0.01, 0, 0.01]) pts.add(e + d);
    for (const v of pts) {
      const hits = contract.levels[m].bands.filter((b) => {
        const okMin = b.min === undefined || (b.minInclusive === false ? v > b.min : v >= b.min);
        const okMax = b.max === undefined || (b.maxInclusive === false ? v < b.max : v <= b.max);
        return okMin && okMax;
      });
      assert.equal(hits.length, 1, `${m}=${v} khớp ${hits.length} khoảng`);
    }
  }
});

test('mức cảnh báo độ ẩm trùng quy tắc Telegram (< 30 hoặc > 85)', () => {
  const { humidityLow, humidityHigh } = contract.telegram;
  assert.equal(levelFor(contract, 'humidity', humidityLow - 0.1), 'alert');
  assert.notEqual(levelFor(contract, 'humidity', humidityLow), 'alert');
  assert.notEqual(levelFor(contract, 'humidity', humidityHigh), 'alert');
  assert.equal(levelFor(contract, 'humidity', humidityHigh + 0.1), 'alert');
});

test('giá trị null hoặc không phải số thì không có mức', () => {
  for (const v of [null, undefined, NaN, Infinity, '27']) assert.equal(levelFor(contract, 'temperature', v), null);
});

test('computeLevels tính cả ba thông số', () => {
  assert.deepEqual(computeLevels(contract, { temperature: 32, humidity: 88, co2: null }),
    { temperature: 'watch', humidity: 'alert', co2: null });
});

test('khoảng trễ: đang bình thường, nhiệt độ phải > 30,5 mới thành cần chú ý', () => {
  assert.equal(levelWithHysteresis(contract, 'temperature', 30.5, 'normal'), 'normal');
  assert.equal(levelWithHysteresis(contract, 'temperature', 30.6, 'normal'), 'watch');
});

test('khoảng trễ: đang cần chú ý, nhiệt độ phải xuống ≤ 29,5 mới về bình thường', () => {
  assert.equal(levelWithHysteresis(contract, 'temperature', 29.6, 'watch'), 'watch');
  assert.equal(levelWithHysteresis(contract, 'temperature', 29.5, 'watch'), 'normal');
});

test('khoảng trễ độ ẩm ±2 và CO2 ±50', () => {
  assert.equal(levelWithHysteresis(contract, 'humidity', 86.5, 'watch'), 'watch');
  assert.equal(levelWithHysteresis(contract, 'humidity', 87.1, 'watch'), 'alert');
  assert.equal(levelWithHysteresis(contract, 'co2', 1040, 'normal'), 'normal');
  assert.equal(levelWithHysteresis(contract, 'co2', 1050, 'normal'), 'watch');
});

test('khoảng trễ không giữ mức khi nhảy xa (bình thường → cảnh báo)', () => {
  assert.equal(levelWithHysteresis(contract, 'humidity', 90, 'normal'), 'alert');
});

test('chưa có mức trước đó thì giống levelFor', () => {
  assert.equal(levelWithHysteresis(contract, 'temperature', 30.3, null), 'watch');
  assert.equal(levelWithHysteresis(contract, 'temperature', null, 'normal'), null);
});
