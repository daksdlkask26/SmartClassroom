const { SENSOR_TOPICS, parseReading } = require('./normalize-reading.cjs');

function createMessageHandler({ deviceId, store, logger = console, clock = () => new Date() }) {
  return async function handleMessage(topic, payload, packet = {}) {
    const receivedAt = clock();
    let reading;
    try {
      reading = parseReading(topic, payload, deviceId);
      if (!reading) return { status: 'ignored' };
    } catch (error) {
      // Do not log the payload: malformed input may contain unrelated private data.
      logger.error('[invalid-reading]', topic, error.message);
      return { status: 'invalid' };
    }
    try {
      const result = await store.saveReading(reading, {
        receivedAt, retained: Boolean(packet.retain)
      });
      const status = result.duplicate ? 'duplicate' : 'saved';
      logger.log('[' + status + ']', reading.sensor, reading.bootId, reading.seq, result.id);
      return { status, id: result.id };
    } catch (error) {
      logger.error('[save-failed]', reading.sensor, reading.bootId, reading.seq, error.message);
      return { status: 'failed' };
    }
  };
}

function attachMqttIngest(client, dependencies) {
  const logger = dependencies.logger || console;
  const handleMessage = createMessageHandler(dependencies);
  const pending = new Set();
  let failed = 0;
  const onConnect = () => {
    client.subscribe(SENSOR_TOPICS, { qos: 1 }, (error, grants) => {
      if (error || !grants || grants.some(grant => grant.qos === 128)) {
        logger.error('[subscribe-failed]', error?.message || 'Broker từ chối topic.');
        return;
      }
      logger.log('[subscribed]', SENSOR_TOPICS.join(', '));
    });
  };
  const onMessage = (topic, payload, packet) => {
    const task = handleMessage(topic, payload, packet).then(result => {
      if (result.status === 'failed') failed++;
      return result;
    });
    pending.add(task);
    task.finally(() => pending.delete(task));
  };
  const onError = error => logger.error('[mqtt-error]', error.message);
  const onReconnect = () => logger.log('[mqtt-reconnecting]');
  const onOffline = () => logger.log('[mqtt-offline]');
  client.on('connect', onConnect);
  client.on('message', onMessage);
  client.on('error', onError);
  client.on('reconnect', onReconnect);
  client.on('offline', onOffline);

  return {
    get failedWrites() { return failed; },
    async drain() {
      client.removeListener('message', onMessage);
      client.removeListener('connect', onConnect);
      await Promise.all([...pending]);
    }
  };
}

module.exports = { createMessageHandler, attachMqttIngest };
