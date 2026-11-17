const { createHash } = require('node:crypto');

const SENSOR_TOPICS = Object.freeze(['dht22', 'mq135']);
const MAX_PAYLOAD_BYTES = 4096;

function parseReading(topic, payload, expectedDeviceId) {
  if (!SENSOR_TOPICS.includes(topic)) return null;
  const text = Buffer.isBuffer(payload) ? payload.toString('utf8') : String(payload);
  if (Buffer.byteLength(text, 'utf8') > MAX_PAYLOAD_BYTES) {
    throw new Error('Bản tin vượt quá ' + MAX_PAYLOAD_BYTES + ' byte.');
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Bản tin không phải JSON hợp lệ.');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Bản tin phải là object JSON.');
  }
  const validId = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(value);
  if (!validId(data.deviceId) || data.deviceId !== expectedDeviceId || !validId(data.bootId)) {
    throw new Error('deviceId hoặc bootId không hợp lệ.');
  }
  if (!Number.isSafeInteger(data.seq) || data.seq < 0) {
    throw new Error('seq phải là số nguyên không âm trong giới hạn an toàn.');
  }
  const statuses = topic === 'dht22' ? ['ok', 'error'] : ['ok', 'warming_up', 'error'];
  if (!statuses.includes(data.status)) throw new Error('status không hợp lệ cho cảm biến.');

  const reading = {
    deviceId: data.deviceId,
    sensor: topic,
    bootId: data.bootId,
    seq: data.seq,
    status: data.status,
    temperatureC: null,
    humidityPct: null,
    co2EstimatedPpm: null
  };
  const fields = topic === 'dht22' ? ['temperatureC', 'humidityPct'] : ['co2EstimatedPpm'];
  for (const field of fields) {
    const value = data[field];
    if (data.status !== 'ok') {
      if (value !== null) throw new Error(field + ' phải là null khi không có số đo.');
      continue;
    }
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error(field + ' phải là số hữu hạn.');
    }
    if (field === 'humidityPct' && (value < 0 || value > 100)) {
      throw new Error('Độ ẩm phải nằm trong 0..100%.');
    }
    if (field === 'co2EstimatedPpm' && value < 0) throw new Error('CO2 ước lượng không được âm.');
    reading[field] = value;
  }
  return reading;
}

function readingId(reading) {
  return createHash('sha256').update(JSON.stringify([
    reading.deviceId, reading.sensor, reading.bootId, reading.seq
  ])).digest('hex');
}

module.exports = { SENSOR_TOPICS, MAX_PAYLOAD_BYTES, parseReading, readingId };
