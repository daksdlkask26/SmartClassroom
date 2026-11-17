#!/usr/bin/env node
// Broker MQTT chạy trên máy (aedes) cho chế độ giả lập. Không cần tài khoản, không cần internet.
//
//   npm run broker                 chỉ máy này kết nối được (127.0.0.1:1883)
//   npm run broker -- --lan        cho thiết bị cùng mạng WiFi kết nối (ESP32 thật thử trên laptop)
//   npm run broker -- --port 1884 --verbose
//
// Lưu ý (aedes 1.2.0, đã kiểm chứng 17/11/2026): bản tin RETAINED QoS 0 bị mất với các client đang nghe
// nếu ngay sau nó có một bản tin thường khác (bản tin thường tới trước, aedes coi bản retained là trùng).
// Bản retained vẫn được lưu và tới client subscribe sau. HiveMQ không có lỗi này.
// → ESP32 thật nối vào broker này (--lan) nên chờ ~300 ms sau khi publish status rồi mới gửi telemetry.
import net from 'node:net';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { Aedes } from 'aedes';

export async function startBroker({ port = 1883, host = '127.0.0.1', verbose = false, log = console.log } = {}) {
  const broker = await Aedes.createBroker({ drainTimeout: 30_000 });
  const server = net.createServer(broker.handle);

  broker.on('client', (c) => log(`+ ${c.id} kết nối`));
  broker.on('clientDisconnect', (c) => log(`- ${c.id} ngắt kết nối`));
  broker.on('clientError', (c, err) => log(`! ${c.id}: ${err.message}`));
  if (verbose) {
    broker.on('subscribe', (subs, c) => log(`  ${c?.id} nghe ${subs.map((s) => s.topic).join(', ')}`));
    broker.on('publish', (p, c) => {
      if (c && !p.topic.startsWith('$SYS')) log(`  ${c.id} → ${p.topic}${p.retain ? ' (retained)' : ''}: ${p.payload.toString().slice(0, 160)}`);
    });
  }

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });

  return {
    port: server.address().port,
    async close() {
      await new Promise((r) => broker.close(r));
      await new Promise((r) => server.close(r));
    },
  };
}

function lanAddresses() {
  return Object.values(os.networkInterfaces()).flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal).map((i) => i.address);
}

async function main() {
  const { values } = parseArgs({
    options: {
      port: { type: 'string', default: process.env.BROKER_PORT ?? '1883' },
      lan: { type: 'boolean', default: false },
      verbose: { type: 'boolean', short: 'v', default: false },
    },
  });
  const host = values.lan ? '0.0.0.0' : '127.0.0.1';
  try {
    const b = await startBroker({ port: Number(values.port), host, verbose: values.verbose });
    console.log(`Broker MQTT giả lập: mqtt://localhost:${b.port}${values.lan ? ' (mở cho mạng LAN)' : ' (chỉ máy này)'}`);
    if (values.lan) for (const ip of lanAddresses()) console.log(`  ESP32 cùng WiFi dùng: mqtt://${ip}:${b.port}`);
    console.log('Ctrl+C để dừng.');
    const stop = async () => { await b.close(); process.exit(0); };
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
  } catch (err) {
    if (err.code === 'EADDRINUSE') console.error(`Cổng ${values.port} đang bị dùng (có thể broker đã chạy rồi). Dùng --port để đổi.`);
    else console.error('Không chạy được broker:', err.message);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
