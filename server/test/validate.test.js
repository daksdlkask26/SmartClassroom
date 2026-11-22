import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT, readContract } from '../src/config.js';
import { MAX_PAYLOAD_BYTES, parseStatus, parseTelemetry } from '../src/core/validate.js';

const contract = readContract();
const example = (name) => fs.readFileSync(path.join(REPO_ROOT, 'contract', 'examples', name), 'utf8');
const NOW = new Date('2026-11-17T07:30:12.000Z');
const good = (over = {}) => ({
  v: 1, seq: 1, uptimeS: 10, temperature: 27.5, humidity: 64.5, co2: 850,
  sensors: { dht22: 'ok', mq135: 'ok' }, ...over,
});
const parse = (obj) => parseTelemetry(JSON.stringify(obj), contract, NOW);

test('mọi bản tin telemetry mẫu trong contract/examples đều hợp lệ, không cảnh báo', () => {
  for (const f of ['telemetry.normal.json', 'telemetry.humid-high.json', 'telemetry.dht-error.json', 'telemetry.mq-warming.json']) {
    const r = parseTelemetry(example(f), contract, NOW);
    assert.equal(r.ok, true, f);
    assert.deepEqual(r.warnings, [], f);
    assert.equal(r.reading.levelsSource, 'device', f);
  }
});

test('Reading có đúng các trường của contract mục 5 (ws.reading.json)', () => {
  const r = parseTelemetry(example('telemetry.normal.json'), contract, NOW);
  const expected = JSON.parse(example('ws.reading.json')).data;
  assert.deepEqual(r.reading, expected);
});

test('JSON hỏng, sai phiên bản, không phải đối tượng → bỏ cả bản tin', () => {
  for (const raw of ['{"v":1,', JSON.stringify({ ...good(), v: 2 }), '[1,2]', 'null', '"chuỗi"', JSON.stringify({ temperature: 1 })]) {
    const r = parseTelemetry(raw, contract, NOW);
    assert.equal(r.ok, false, raw);
    assert.ok(r.error);
  }
});

test('bản tin quá lớn bị bỏ', () => {
  const r = parseTelemetry(JSON.stringify({ ...good(), pad: 'x'.repeat(MAX_PAYLOAD_BYTES) }), contract, NOW);
  assert.equal(r.ok, false);
});

test('nhận Buffer như từ mqtt.js', () => {
  assert.equal(parseTelemetry(Buffer.from(JSON.stringify(good())), contract, NOW).ok, true);
});

test('một trường sai chỉ trường đó thành null, có cảnh báo', () => {
  const r = parse(good({ humidity: 'abc', co2: 99999 }));
  assert.equal(r.ok, true);
  assert.equal(r.reading.humidity, null);
  assert.equal(r.reading.co2, null);
  assert.equal(r.reading.temperature, 27.5);
  assert.equal(r.warnings.length, 2);
});

test('thiếu trường giá trị → null + cảnh báo; không bao giờ thành 0', () => {
  const obj = good();
  delete obj.co2;
  const r = parse(obj);
  assert.equal(r.reading.co2, null);
  assert.match(r.warnings.join(), /thiếu trường co2/);
});

test('làm tròn theo số chữ số thập phân của contract', () => {
  const r = parse(good({ temperature: 27.456, humidity: 64.04, co2: 850.6 }));
  assert.equal(r.reading.temperature, 27.5);
  assert.equal(r.reading.humidity, 64);
  assert.equal(r.reading.co2, 851);
});

test('cảm biến báo lỗi nhưng vẫn gửi số → bỏ số', () => {
  const r = parse(good({ sensors: { dht22: 'error', mq135: 'warming' } }));
  assert.equal(r.reading.temperature, null);
  assert.equal(r.reading.humidity, null);
  assert.equal(r.reading.co2, null);
  assert.equal(r.warnings.length, 3);
});

test('trạng thái cảm biến không hợp lệ → null + cảnh báo, giá trị vẫn giữ', () => {
  const r = parse(good({ sensors: { dht22: 'tốt' } }));
  assert.equal(r.reading.sensors.dht22, null);
  assert.equal(r.reading.sensors.mq135, null);
  assert.equal(r.reading.temperature, 27.5);
});

test('không gửi levels → backend tự tính', () => {
  const r = parse(good({ humidity: 88 }));
  assert.equal(r.reading.levelsSource, 'server');
  assert.deepEqual(r.reading.levels, { temperature: 'normal', humidity: 'alert', co2: 'normal' });
});

test('levels của thiết bị được ưu tiên (khoảng trễ), kể cả khi khác backend', () => {
  // 30,4 °C: backend tính "watch", firmware đang giữ "normal" nhờ khoảng trễ → web phải theo hộp
  const r = parse(good({ temperature: 30.4, levels: { temperature: 'normal', humidity: 'normal', co2: 'normal' } }));
  assert.equal(r.reading.levelsSource, 'device');
  assert.equal(r.reading.levels.temperature, 'normal');
});

test('levels sai một chỗ → backend tính lại cả bộ', () => {
  const r = parse(good({ humidity: 88, levels: { temperature: 'normal', humidity: 'hot', co2: 'normal' } }));
  assert.equal(r.reading.levelsSource, 'server');
  assert.equal(r.reading.levels.humidity, 'alert');
  assert.match(r.warnings.join(), /levels\.humidity/);
});

test('giá trị null thì mức null dù firmware gửi mức', () => {
  const r = parse(good({ co2: null, sensors: { dht22: 'ok', mq135: 'warming' }, levels: { temperature: 'normal', humidity: 'normal', co2: 'normal' } }));
  assert.equal(r.reading.levels.co2, null);
  assert.equal(r.reading.levelsSource, 'device');
});

test('seq sai → null + cảnh báo; trường lạ bị bỏ qua không cảnh báo', () => {
  const r = parse(good({ seq: -1, debugHeap: 12345 }));
  assert.equal(r.reading.seq, null);
  assert.equal(r.warnings.length, 1);
  assert.equal('debugHeap' in r.reading, false);
});

test('status mẫu và LWT hợp lệ', () => {
  const on = parseStatus(example('status.online.json'));
  assert.equal(on.ok, true);
  assert.deepEqual(on.status, { online: true, fw: '0.1.0', intervalS: 30, ssid: 'Phong_A12', rssi: -61, ledMode: 'auto' });
  const lwt = parseStatus(example('status.lwt-offline.json'));
  assert.deepEqual(lwt.status, { online: false });
});

test('status: thiếu online thì bỏ; trường phụ sai thì bỏ trường đó', () => {
  assert.equal(parseStatus('{"v":1}').ok, false);
  const r = parseStatus(JSON.stringify({ v: 1, online: true, rssi: 20, ledMode: 'disco', ssid: 'A' }));
  assert.deepEqual(r.status, { online: true, ssid: 'A' });
  assert.equal(r.warnings.length, 2);
});

test('bootId: hợp lệ thì giữ trong Reading; sai định dạng thì bỏ kèm cảnh báo; thiếu thì không có trường', () => {
  const ok = parse(good({ bootId: 'a1b2c3d4' }));
  assert.equal(ok.reading.bootId, 'a1b2c3d4');
  assert.deepEqual(ok.warnings, []);

  for (const bad of ['', 'có dấu', 'x'.repeat(65), 123, null]) {
    const r = parse(good({ bootId: bad }));
    assert.equal(r.ok, true);
    assert.equal('bootId' in r.reading, false, JSON.stringify(bad));
    assert.ok(r.warnings.some((w) => w.startsWith('bootId=')), JSON.stringify(bad));
  }

  const missing = parse(good());
  assert.equal('bootId' in missing.reading, false);
  assert.deepEqual(missing.warnings, []);
});
