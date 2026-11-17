const test = require('node:test');
const assert = require('node:assert/strict');
const { parseReading, readingId, MAX_PAYLOAD_BYTES } = require('../src/normalize-reading.cjs');

const deviceId = 'esp32-01';
const base = {
  deviceId, bootId: 'boot-01', seq: 1, status: 'ok',
  temperatureC: 27.5, humidityPct: 65
};
const parse = (patch = {}, topic = 'dht22') =>
  parseReading(topic, Buffer.from(JSON.stringify({ ...base, ...patch })), deviceId);

test('DHT22 retains its own values and does not fabricate CO2', () => {
  assert.deepEqual(parse(), { ...base, sensor: 'dht22', co2EstimatedPpm: null });
});
test('MQ135 does not copy DHT22 values even if the sender includes them', () => {
  const value = parse({ co2EstimatedPpm: 850 }, 'mq135');
  assert.equal(value.co2EstimatedPpm, 850);
  assert.equal(value.temperatureC, null);
  assert.equal(value.humidityPct, null);
});
for (const humidity of [0, 30, 85, 88, 100]) {
  test('Valid humidity is preserved, including alarm values: ' + humidity, () => {
    assert.equal(parse({ humidityPct: humidity }).humidityPct, humidity);
  });
}
for (const humidity of [-1, 100.01, '65', null]) {
  test('Reject invalid humidity: ' + JSON.stringify(humidity), () => {
    assert.throws(() => parse({ humidityPct: humidity }));
  });
}
for (const payload of ['{bad', 'null', '[]', '"text"', '65']) {
  test('Reject malformed or non-object JSON: ' + payload, () => {
    assert.throws(() => parseReading('dht22', payload, deviceId));
  });
}
test('Reject oversized sensor payloads', () => {
  assert.throws(() => parseReading('dht22', ' '.repeat(MAX_PAYLOAD_BYTES + 1), deviceId));
});
test('Unknown topics are ignored without parsing their payload', () => {
  assert.equal(parseReading('led/cmd', '{bad', deviceId), null);
});
test('Reject an unexpected device or a path-like boot ID', () => {
  assert.throws(() => parse({ deviceId: 'esp32-02' }));
  assert.throws(() => parse({ bootId: '../boot' }));
});
for (const seq of [-1, 0.5, '1', Number.MAX_SAFE_INTEGER + 1, null]) {
  test('Reject unsafe or invalid sequence: ' + seq, () => {
    assert.throws(() => parse({ seq }));
  });
}
test('Temperature and measurement fields are required', () => {
  assert.throws(() => parse({ temperatureC: undefined }));
  assert.throws(() => parse({ temperatureC: '27.5' }));
  assert.throws(() => parse({}, 'mq135'));
});
test('Warming MQ135 preserves null and never reports zero ppm', () => {
  assert.equal(parse({ status: 'warming_up', co2EstimatedPpm: null }, 'mq135').co2EstimatedPpm, null);
  assert.throws(() => parse({ status: 'warming_up', co2EstimatedPpm: 0 }, 'mq135'));
});
test('Error DHT22 requires null for both measurements', () => {
  const reading = parse({ status: 'error', temperatureC: null, humidityPct: null });
  assert.equal(reading.status, 'error');
  assert.equal(reading.humidityPct, null);
  assert.throws(() => parse({ status: 'error' }));
});
test('Invalid status and negative CO2 are rejected', () => {
  assert.throws(() => parse({ status: 'warming_up' }));
  assert.throws(() => parse({ status: 'unknown' }));
  assert.throws(() => parse({ co2EstimatedPpm: -1 }, 'mq135'));
});
test('A measurement ID is stable but distinct for new samples, sensors and boots', () => {
  const reading = parse();
  assert.equal(readingId(reading), readingId({ ...reading }));
  for (const patch of [{ seq: 2 }, { bootId: 'boot-02' }, { sensor: 'mq135' }]) {
    assert.notEqual(readingId(reading), readingId({ ...reading, ...patch }));
  }
});
