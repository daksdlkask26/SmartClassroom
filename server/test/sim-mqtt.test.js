import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { once } from 'node:events';
import net from 'node:net';
import { promisify } from 'node:util';
import { Aedes } from 'aedes';

const exec = promisify(execFile);
const remoteEnv = {
  MQTT_URL: 'mqtts://broker.example.invalid:8883',
  MQTT_USER: 'sim-test-user',
  MQTT_PASS: 'sim-test-pass#1',
  DEVICE_ID: 'sc-test',
};

function runSim(args, env) {
  return exec(process.execPath, ['scripts/sim-esp32.js', ...args], {
    cwd: new URL('../', import.meta.url),
    env: { ...process.env, ...env },
    timeout: 7000,
    windowsHide: true,
  });
}

test('sim --from-env đòi hỏi cho phép broker từ xa và kiểm tra TLS như backend', async () => {
  await assert.rejects(runSim(['--from-env'], remoteEnv), { code: 2, stderr: /--allow-remote/ });
  await assert.rejects(runSim(['--from-env', '--allow-remote'], {
    ...remoteEnv, MQTT_URL: 'mqtt://broker.example.invalid:1883',
  }), { code: 2, stderr: /mqtts:\/\// });
});

test('sim --from-env từ chối trộn cấu hình MQTT với tham số kết nối trực tiếp', async () => {
  await assert.rejects(runSim(['--from-env', '--url', 'mqtt://127.0.0.1:1883'], remoteEnv), {
    code: 2, stderr: /--from-env.*--url/,
  });
});

test('sim --from-env kết nối MQTT bằng tài khoản cấu hình và publish vào topic thử', async (t) => {
  const broker = await Aedes.createBroker();
  const server = net.createServer(broker.handle);
  t.after(async () => {
    await new Promise((resolve) => broker.close(resolve));
    await new Promise((resolve) => server.close(resolve));
  });
  broker.authenticate = (_client, username, password, done) => {
    done(null, username === remoteEnv.MQTT_USER && password?.toString() === remoteEnv.MQTT_PASS);
  };
  const topics = [];
  broker.on('publish', (packet, client) => { if (client) topics.push(packet.topic); });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  const { stdout } = await runSim(['--from-env', '--device', 'sc-test', '--count', '1'], {
    ...remoteEnv,
    MQTT_URL: `mqtt://127.0.0.1:${server.address().port}`,
    DEVICE_ID: 'sc-01',
  });
  assert.ok(topics.includes('smartclassroom/sc-test/telemetry'));
  assert.ok(!stdout.includes(remoteEnv.MQTT_PASS));
});
