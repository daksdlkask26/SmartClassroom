const { randomUUID } = require('node:crypto');

function createTestMessages(deviceId, bootId = randomUUID()) {
  const common = { deviceId, bootId, seq: 1, status: 'ok' };
  const dht22 = JSON.stringify({ ...common, temperatureC: 27.5, humidityPct: 65 });
  return {
    bootId,
    messages: [
      { topic: 'dht22', payload: dht22 },
      { topic: 'dht22', payload: dht22 },
      { topic: 'mq135', payload: JSON.stringify({ ...common, co2EstimatedPpm: 850 }) },
      { topic: 'dht22', payload: '{invalid json' },
      { topic: 'dht22', payload: JSON.stringify({ ...common, seq: 2, temperatureC: 27.5, humidityPct: 150 }) },
      { topic: 'mq135', payload: JSON.stringify({ ...common, seq: 2, status: 'warming_up', co2EstimatedPpm: null }) }
    ]
  };
}

module.exports = { createTestMessages };
