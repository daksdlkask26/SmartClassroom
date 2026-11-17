import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig, readContract } from '../src/config.js';
import { createBus } from '../src/core/bus.js';
import { parseHistoryQuery } from '../src/http/routes/history.js';
import { RETENTION_MS, bucketStart, create } from '../src/providers/history/memory.js';
import { generateHistory } from '../scripts/sim/history-seed.js';

const contract = readContract();
const config = loadConfig({ env: {}, contract });
const quiet = { error() {}, warn() {}, info() {}, debug() {} };
const reading = (iso, humidity, temperature = 27, co2 = 800) => ({ receivedAt: iso, seq: 0, temperature, humidity, co2,
  sensors: { dht22: 'ok', mq135: 'ok' }, levels: {}, levelsSource: 'server' });

test('ngày bắt đầu lúc 00:00 giờ Việt Nam (17:00 UTC hôm trước)', () => {
  const t = Date.parse('2026-11-17T02:00:00Z'); // 09:00 VN ngày 17
  assert.equal(new Date(bucketStart(t, 'day')).toISOString(), '2026-11-16T17:00:00.000Z');
  const late = Date.parse('2026-11-17T18:30:00Z'); // 01:30 VN ngày 18
  assert.equal(new Date(bucketStart(late, 'day')).toISOString(), '2026-11-17T17:00:00.000Z');
  assert.equal(new Date(bucketStart(Date.parse('2026-11-17T07:59:59Z'), 'hour')).toISOString(), '2026-11-17T07:00:00.000Z');
});

test('gom theo giờ: trung bình/nhỏ nhất/lớn nhất, giờ thiếu dữ liệu là null', async () => {
  const bus = createBus(quiet);
  const now = Date.parse('2026-11-17T10:00:00Z');
  const h = create({ config, bus, now: () => now });
  for (const [iso, v] of [['2026-11-17T07:00:00Z', 60], ['2026-11-17T07:30:00Z', 61.05], ['2026-11-17T09:10:00Z', 88]]) bus.emit('reading', reading(iso, v));
  bus.emit('reading', reading('2026-11-17T09:20:00Z', null));

  const r = await h.query({ metric: 'humidity', bucket: 'hour', from: new Date('2026-11-17T07:00:00Z'), to: new Date('2026-11-17T10:00:00Z') });
  assert.equal(r.unit, '%');
  assert.deepEqual(r.points, [
    { t: '2026-11-17T07:00:00.000Z', avg: 60.5, min: 60, max: 61.05, n: 2 },
    { t: '2026-11-17T08:00:00.000Z', avg: null, min: null, max: null, n: 0 },
    { t: '2026-11-17T09:00:00.000Z', avg: 88, min: 88, max: 88, n: 1 },
  ]);
});

test('dạng trả về khớp contract/examples/api.history.json', async () => {
  const h = create({ config, bus: createBus(quiet) });
  const r = await h.query({ metric: 'co2', bucket: 'day', from: new Date(Date.now() - 2 * 864e5), to: new Date() });
  assert.deepEqual(Object.keys(r).sort(), ['bucket', 'from', 'metric', 'points', 'to', 'unit']);
  for (const p of r.points) assert.deepEqual(Object.keys(p).sort(), ['avg', 'max', 'min', 'n', 't']);
});

test('dữ liệu cũ hơn thời gian lưu bị xóa', () => {
  const bus = createBus(quiet);
  const now = Date.parse('2026-11-17T10:00:00Z');
  const h = create({ config, bus, now: () => now });
  h.seed([reading(new Date(now - RETENTION_MS - 1000).toISOString(), 50), reading(new Date(now - 1000).toISOString(), 60)]);
  assert.equal(h.size(), 1);
});

test('kiểm tra tham số /api/history', () => {
  const now = new Date('2026-11-17T10:00:00Z');
  const q = parseHistoryQuery({ metric: 'humidity' }, now);
  assert.equal(q.bucket, 'hour');
  assert.equal(q.to.getTime() - q.from.getTime(), 864e5);
  assert.equal(parseHistoryQuery({ metric: 'co2', bucket: 'day' }, now).to - parseHistoryQuery({ metric: 'co2', bucket: 'day' }, now).from, 7 * 864e5);
  const bad = [{}, { metric: 'pm25' }, { metric: 'co2', bucket: 'week' }, { metric: 'co2', from: 'hôm qua' },
    { metric: 'co2', from: '2026-11-17T10:00:00Z', to: '2026-11-17T09:00:00Z' },
    { metric: 'co2', from: '2026-11-01T00:00:00Z', to: '2026-11-17T00:00:00Z' }];
  for (const b of bad) assert.throws(() => parseHistoryQuery(b, now), (e) => e.status === 400, JSON.stringify(b));
});

test('lịch sử gieo sẵn: đủ 24 giờ trừ 1 giờ trống, độ ẩm vượt 85 % lúc 04:00–06:00', () => {
  const now = Date.parse('2026-11-17T07:30:00Z');
  const rs = generateHistory({ contract, hours: 24, now });
  assert.equal(rs.length, 24 * 120 - 120);
  const vnHour = (r) => (new Date(r.receivedAt).getUTCHours() + 7) % 24;
  assert.ok(rs.filter((r) => vnHour(r) === 5).some((r) => r.humidity > 85));
  assert.ok(rs.filter((r) => vnHour(r) === 10).every((r) => r.humidity < 85));
  assert.ok(rs.every((r, i) => i === 0 || r.receivedAt > rs[i - 1].receivedAt));
});

test('lịch sử gieo sẵn khi gom theo giờ có đúng một mốc trống', async () => {
  const now = Date.parse('2026-11-17T07:30:00Z');
  const h = create({ config, bus: createBus(quiet), now: () => now });
  h.seed(generateHistory({ contract, hours: 24, now }));
  const r = await h.query({ metric: 'humidity', bucket: 'hour', from: new Date(now - 864e5), to: new Date(now) });
  assert.equal(r.points.filter((p) => p.avg === null).length, 1);
});
