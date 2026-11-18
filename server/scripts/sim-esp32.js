#!/usr/bin/env node
// Giả lập ESP32 của hộp đo: gửi telemetry + status (kèm LWT), nhận led/cmd và vẽ 8 bóng trong terminal.
//
//   npm run sim                                   kịch bản bình thường, 30 giây/bản tin
//   npm run sim -- --interval 3                   gửi nhanh để phát triển
//   npm run sim -- --scenario humid-high
//   npm run sim -- --no-levels                    không gửi `levels` (thử backend tự tính mức)
//   npm run sim -- --count 5                      gửi 5 bản tin rồi thoát
//
// Trong lúc chạy, bấm phím để đổi kịch bản (xem danh sách in ra khi khởi động), q để thoát.
// An toàn: chỉ kết nối broker trên máy này. Muốn trỏ tới broker khác phải thêm --allow-remote,
// vì dữ liệu giả gửi lên HiveMQ thật sẽ bị ghi vào Firestore của nhóm.
import { parseArgs } from 'node:util';
import mqtt from 'mqtt';
import { readContract } from '../src/config.js';
import { computeLevels } from '../src/core/levels.js';
import { BAD_PAYLOADS, SCENARIOS, createSimDevice } from './sim/device.js';

const contract = readContract();
const { values: args } = parseArgs({
  options: {
    url: { type: 'string', default: 'mqtt://localhost:1883' },
    user: { type: 'string' },
    pass: { type: 'string' },
    device: { type: 'string', default: contract.deviceId },
    interval: { type: 'string', default: String(contract.timing.intervalS) },
    scenario: { type: 'string', default: 'normal' },
    count: { type: 'string' },
    'no-levels': { type: 'boolean', default: false },
    'allow-remote': { type: 'boolean', default: false },
  },
});

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);
const host = new URL(args.url).hostname;
if (!LOCAL_HOSTS.has(host) && !args['allow-remote']) {
  console.error(`Từ chối kết nối ${args.url}: giả lập chỉ chạy với broker trên máy này.`);
  console.error('Nếu thật sự muốn gửi dữ liệu giả lên broker khác, thêm --allow-remote.');
  process.exit(2);
}

const intervalMs = Math.max(0.5, Number(args.interval)) * 1000;
const maxCount = args.count ? Number(args.count) : Infinity;
const topic = Object.fromEntries(
  Object.entries(contract.topics).map(([k, t]) => [k, t.replace('{deviceId}', args.device)]),
);
const sim = createSimDevice({ contract, withLevels: !args['no-levels'] });
sim.setScenario(SCENARIOS[args.scenario] && !['pause', 'offline', 'bad', 'burst'].includes(args.scenario) ? args.scenario : 'normal');

// ---------- Hiển thị ----------
const tty = process.stdout.isTTY;
const swatch = (hex) => {
  if (!hex) return tty ? '\x1b[2m░░\x1b[0m' : '░░';
  if (!tty) return '██';
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `\x1b[48;2;${r};${g};${b}m  \x1b[0m`;
};
const time = () => new Date().toLocaleTimeString('vi-VN', { hour12: false });
const say = (msg) => console.log(`${time()}  ${msg}`);

let led = { mode: 'auto', palette: structuredClone(contract.led.defaultPalette), test: null };
let lastLevels = { temperature: null, humidity: null, co2: null };

function drawLeds() {
  const sys = [contract.led.systemColors.run, client?.connected ? contract.led.systemColors.net : null];
  let cells;
  if (led.mode === 'test') {
    cells = Array(6).fill(led.test?.on ? led.test.color : null);
  } else {
    const order = contract.led.levelOrder;
    cells = ['temperature', 'humidity', 'co2'].flatMap((m) => {
      const lv = lastLevels[m];
      const c = lv ? led.palette[m][order.indexOf(lv)] : null; // null = nháy trắng (lỗi / làm nóng / chưa có số)
      return [c, c];
    });
  }
  const all = [...sys, ...cells].map(swatch);
  return `${all[0]}${all[1]}  ${all[2]}${all[3]}  ${all[4]}${all[5]}  ${all[6]}${all[7]}  (${led.mode === 'test' ? 'KIỂM TRA ĐÈN' : 'tự động'})`;
}

function printHelp() {
  console.log('\nPhím đổi kịch bản:');
  for (const [name, s] of Object.entries(SCENARIOS)) console.log(`  ${s.key}  ${name.padEnd(11)} ${s.label}`);
  console.log('  ?  in lại danh sách này');
  console.log('  q  thoát (như rút điện: broker gửi LWT ngoại tuyến)\n');
}

// ---------- MQTT ----------
let client = null;
let timer = null;
let paused = false;
let sent = 0;

function publishTelemetry() {
  if (!client?.connected || paused) return;
  const msg = sim.next();
  lastLevels = msg.levels ?? computeLevels(contract, msg); // --no-levels: vẫn tự tính để vẽ đèn
  client.publish(topic.telemetry, JSON.stringify(msg), { qos: 0 });
  sent++;
  const f = (v, u) => (v === null ? '—' : `${v}${u}`);
  say(`#${msg.seq} ${f(msg.temperature, '°C')} ${f(msg.humidity, '%')} ${f(msg.co2, 'ppm')}  ${drawLeds()}`);
  if (sent >= maxCount) quit(false);
}

function connect() {
  client = mqtt.connect(args.url, {
    clientId: `${args.device}-sim`,
    username: args.user,
    password: args.pass,
    clean: true,
    keepalive: 15,
    reconnectPeriod: 3000,
    will: { topic: topic.status, payload: Buffer.from(JSON.stringify({ v: 1, online: false })), qos: 1, retain: true },
  });

  // status retained: gửi khi vừa kết nối và khi chế độ LED đổi (contract/README.md mục 2.2)
  const publishStatus = () => {
    const status = {
      v: 1, online: true, fw: 'sim-0.1.0', intervalS: Math.round(intervalMs / 1000),
      ssid: 'Phong_A12', rssi: -55 - Math.floor(Math.random() * 15), ledMode: led.mode,
    };
    client.publish(topic.status, JSON.stringify(status), { qos: 0, retain: true });
  };

  client.on('connect', () => {
    say(`Đã kết nối ${args.url} với tên ${args.device}-sim`);
    publishStatus();
    client.subscribe(topic.ledCmd, { qos: 1 });
    clearInterval(timer);
    // Chờ một chút rồi mới gửi telemetry: broker aedes làm mất bản tin retained nếu ngay sau đó
    // có bản tin thường (xem dev-broker.js). HiveMQ không bị, nhưng chờ cũng vô hại.
    setTimeout(() => {
      publishTelemetry();
      timer = setInterval(publishTelemetry, intervalMs);
    }, 300);
  });

  client.on('message', (t, payload) => {
    if (t !== topic.ledCmd) return;
    let cmd;
    try { cmd = JSON.parse(payload.toString()); } catch { return say('Nhận led/cmd hỏng, bỏ qua'); }
    const prevMode = led.mode;
    if (cmd.mode === 'test') {
      led = { ...led, mode: 'test', test: { on: !!cmd.on, color: cmd.color } };
    } else if (cmd.mode === 'auto') {
      led = { ...led, mode: 'auto', test: null, ...(cmd.palette ? { palette: cmd.palette } : {}) };
    } else return say(`Nhận led/cmd không rõ chế độ: ${payload}`);
    say(`Nhận lệnh LED (${cmd.mode}${cmd.palette ? ', bảng 9 màu, lưu vào flash' : ''})  ${drawLeds()}`);
    if (led.mode !== prevMode) publishStatus();
  });

  client.on('reconnect', () => say('Đang kết nối lại broker…'));
  client.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') say(`Chưa có broker tại ${args.url}. Chạy "npm run broker" ở cửa sổ khác.`);
    else say(`Lỗi MQTT: ${err.message}`);
  });
}

// ---------- Kịch bản ----------
async function runScenario(name) {
  if (name === 'pause') {
    paused = true;
    return say('TẠM NGỪNG gửi (vẫn giữ kết nối). Bấm n để gửi lại.');
  }
  if (name === 'offline') {
    if (!client?.connected) return say('Đang ngoại tuyến rồi. Bấm n để kết nối lại.');
    clearInterval(timer);
    client.end(true); // đóng ngay, không gửi DISCONNECT → broker phát LWT
    client = null;
    return say('RỚT MẠNG: đã ngắt đột ngột, broker sẽ gửi LWT {"online":false}. Bấm n để kết nối lại.');
  }
  if (name === 'bad') {
    for (const b of BAD_PAYLOADS) {
      client?.publish(topic.telemetry, b.payload, { qos: 0 });
      say(`Gửi bản tin lỗi: ${b.note}`);
    }
    return;
  }
  if (name === 'burst') {
    say('Gửi dồn 20 bản tin…');
    for (let i = 0; i < 20; i++) {
      publishTelemetry();
      await new Promise((r) => setTimeout(r, 100));
    }
    return;
  }
  paused = false;
  sim.setScenario(name);
  say(`Kịch bản: ${SCENARIOS[name].label}`);
  if (!client) connect();
  else publishTelemetry();
}

function quit(asCrash = true) {
  clearInterval(timer);
  if (client) client.end(asCrash); // q: như rút điện → LWT; --count: thoát êm
  setTimeout(() => process.exit(0), 300);
}

// ---------- Khởi động ----------
console.log(`Giả lập ESP32 "${args.device}" · mỗi ${intervalMs / 1000} giây · ${args['no-levels'] ? 'không gửi levels' : 'có gửi levels (có khoảng trễ)'}`);
if (process.stdin.isTTY) {
  printHelp();
  process.stdin.setRawMode(true);
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (key) => {
    if (key === 'q' || key === '\u0003') return quit(true);
    const entry = Object.entries(SCENARIOS).find(([, s]) => s.key === key);
    if (entry) runScenario(entry[0]);
    else if (key === '?') printHelp();
  });
}
process.on('SIGINT', () => quit(true));
process.on('SIGTERM', () => quit(true));

connect();
if (['pause', 'offline', 'bad', 'burst'].includes(args.scenario)) {
  setTimeout(() => runScenario(args.scenario), 1000);
} else if (!SCENARIOS[args.scenario]) {
  console.error(`Không có kịch bản "${args.scenario}", dùng "normal".`);
}
