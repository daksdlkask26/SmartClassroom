// Kết nối broker MQTT (aedes cục bộ khi giả lập, HiveMQ Cloud khi chạy thật).
// Nhận telemetry + status → kiểm tra → cập nhật state. Gửi led/cmd (G8).
import { randomBytes } from 'node:crypto';
import mqtt from 'mqtt';
import { parseStatus, parseTelemetry } from '../core/validate.js';

/**
 * @param {object} deps
 * @param {object} deps.config   loadConfig()
 * @param {object} deps.state    createState()
 * @param {object} deps.log
 * @param {Function} [deps.connect]  thay mqtt.connect khi kiểm thử
 */
export function createMqttClient({ config, state, log, connect = mqtt.connect }) {
  const { telemetry, status, ledCmd } = config.topics;
  let connected = false;
  let warnedDown = false;

  const client = connect(config.mqtt.url, {
    clientId: `sc-backend-${randomBytes(4).toString('hex')}`,
    username: config.mqtt.username,
    password: config.mqtt.password,
    clean: true,
    keepalive: 30,
    reconnectPeriod: 5000,
    connectTimeout: 10_000,
  });

  client.on('connect', () => {
    connected = true;
    warnedDown = false;
    log.info(`Đã kết nối broker ${config.mqtt.url}`);
    client.subscribe({ [telemetry]: { qos: 1 }, [status]: { qos: 1 } }, (err) => {
      if (err) log.error('Không subscribe được:', err.message);
      else log.info(`Đang nghe ${telemetry}, ${status}`);
    });
  });

  let ending = false; // backend tự ngắt khi dừng: không báo "mất kết nối"
  const down = (why) => {
    connected = false;
    if (!warnedDown && !ending) {
      log.warn(`Mất kết nối broker (${why}), tự thử lại mỗi 5 giây…`);
      warnedDown = true;
    }
  };
  client.on('close', () => down('đóng kết nối'));
  client.on('offline', () => down('ngoại tuyến'));
  client.on('error', (err) => {
    // Lỗi xác thực thì thử lại vô ích; các lỗi khác (ECONNREFUSED…) để mqtt.js tự nối lại.
    if (err.code === 4 || err.code === 5 || /not authorized|bad user/i.test(err.message)) {
      log.error('Broker từ chối đăng nhập. Kiểm tra MQTT_USER / MQTT_PASS trong server/.env');
    } else if (!warnedDown) {
      log.warn('Lỗi MQTT:', err.message);
    }
  });

  client.on('message', (topic, payload) => {
    if (topic === telemetry) {
      const r = parseTelemetry(payload, config.contract);
      if (!r.ok) return log.warn(`Bỏ bản tin telemetry: ${r.error}`);
      for (const w of r.warnings) log.warn(`telemetry seq=${r.reading.seq}: ${w}`);
      log.debug('telemetry', JSON.stringify(r.reading));
      state.applyReading(r.reading);
    } else if (topic === status) {
      const r = parseStatus(payload);
      if (!r.ok) return log.warn(`Bỏ bản tin status: ${r.error}`);
      for (const w of r.warnings) log.warn(`status: ${w}`);
      log.info(r.status.online ? 'Thiết bị báo trực tuyến' : 'Thiết bị ngoại tuyến (LWT)');
      state.applyStatus(r.status);
    }
  });

  return {
    status: () => (connected ? 'connected' : 'disconnected'),

    /** Gửi lệnh LED (dùng ở G8). Lỗi nếu chưa kết nối broker. */
    publishLedCmd(cmd) {
      if (!connected) return Promise.reject(Object.assign(new Error('Chưa kết nối broker'), { code: 'MQTT_DOWN' }));
      return client.publishAsync(ledCmd, JSON.stringify(cmd), { qos: 1, retain: false });
    },

    end() {
      ending = true;
      return client.endAsync();
    },
  };
}
