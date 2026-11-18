// Ghép các phần của backend (plan.md mục 6.1). Tách khỏi index.js để kiểm thử được toàn hệ thống.
// Thứ tự: bus/state → lịch sử → MQTT → HTTP + WebSocket → theo dõi thiết bị → plugin.
import http from 'node:http';
import { createBus } from './core/bus.js';
import { createDeviceWatch } from './core/device-watch.js';
import { createState } from './core/state.js';
import { createApp } from './http/app.js';
import { authorizeUpgrade } from './http/middleware/auth.js';
import { createMqttClient } from './mqtt/client.js';
import { loadPlugins } from './plugins/index.js';
import { loadHistoryProvider } from './providers/history/index.js';
import { createWsServer } from './ws/server.js';

/**
 * @param {object} opts
 * @param {object} opts.config   loadConfig()
 * @param {object} opts.log      createLogger()
 * @param {string} [opts.host]   mặc định mọi địa chỉ
 * @param {string} [opts.pluginsDir]  thay thư mục plugin khi kiểm thử
 */
export async function startServer({ config, log, host, pluginsDir }) {
  const bus = createBus(log.child('bus'));
  const state = createState({ bus });

  logActivity({ bus, config, log });

  const history = await loadHistoryProvider({ config, bus, log });
  if (config.historySeedHours > 0) await seedHistory({ history, config, log });

  const mqttClient = createMqttClient({ config, state, log: log.child('mqtt') });

  const app = createApp({ config, log: log.child('http'), getMqttStatus: mqttClient.status, state, history,
    publishLedCmd: mqttClient.publishLedCmd,
  });
  const server = http.createServer(app);
  const ws = createWsServer({ server, state, bus, config, log: log.child('ws'), authorize: authorizeUpgrade({ config }) });

  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(config.port, host, resolve);
    });
  } catch (err) {
    await mqttClient.end().catch(() => {});
    await ws.close();
    throw err;
  }

  const watch = createDeviceWatch({ state, config });
  watch.start();

  const plugins = await loadPlugins({ bus, state, config, log, dir: pluginsDir });

  return {
    port: server.address().port,
    bus,
    state,
    history,
    mqtt: mqttClient,
    plugins: plugins.names,
    async close() {
      watch.stop();
      await plugins.closeAll();
      await ws.close();
      await mqttClient.end().catch(() => {});
      await history.close();
      server.closeAllConnections?.();
      await new Promise((r) => server.close(() => r()));
    },
  };
}

function logActivity({ bus, config, log }) {
  // Nhật ký gọn mỗi bản tin: mức info khi LOG_READINGS (mặc định bật khi giả lập), còn lại debug
  const readingLog = log.child('reading');
  bus.on('reading', (r) => {
    const fmt = (v, u) => (v === null ? '—' : `${v}${u}`);
    const line = `#${r.seq ?? '?'} ${fmt(r.temperature, '°C')} ${fmt(r.humidity, '%')} ${fmt(r.co2, 'ppm')}`
      + ` · mức ${r.levels.temperature ?? '—'}/${r.levels.humidity ?? '—'}/${r.levels.co2 ?? '—'} (${r.levelsSource})`;
    (config.logReadings ? readingLog.info : readingLog.debug)(line);
  }, 'core:log');
  bus.on('device', (d) => log.child('device').info(`${d.online ? 'TRỰC TUYẾN' : 'NGOẠI TUYẾN'} (${d.reason})`), 'core:log');
}

async function seedHistory({ history, config, log }) {
  if (config.mode !== 'sim') {
    log.warn('Bỏ qua HISTORY_SEED_HOURS: chỉ gieo dữ liệu giả khi MODE=sim');
    return;
  }
  if (typeof history.seed !== 'function') {
    log.warn(`Provider "${history.name}" không hỗ trợ gieo dữ liệu giả, bỏ qua HISTORY_SEED_HOURS`);
    return;
  }
  const { generateHistory } = await import('../scripts/sim/history-seed.js');
  const readings = generateHistory({ contract: config.contract, hours: config.historySeedHours });
  history.seed(readings);
  log.info(`Đã gieo ${readings.length} bản tin giả cho ${config.historySeedHours} giờ qua (chỉ trong bộ nhớ)`);
}
