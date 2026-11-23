#!/usr/bin/env node
// Chạy cả bộ giả lập trong MỘT cửa sổ: broker cục bộ + backend (tự khởi động lại khi sửa code) + giả lập ESP32.
//
//   npm run dev                       giả lập gửi mỗi 5 giây, gieo sẵn 24 giờ lịch sử
//   npm run dev -- --interval 30      đúng chu kỳ thật
//   npm run dev -- --scenario humid-high
//
// Truyền tham số kịch bản sau "--" cho giả lập (xem scripts/sim-esp32.js).
// Phím đổi kịch bản vẫn dùng được; q hoặc Ctrl+C tắt cả ba.
//
// Luôn dùng broker trên máy này và MODE=sim, kể cả khi server/.env đang trỏ tới HiveMQ thật,
// để dữ liệu giả không bao giờ lên broker của nhóm.
import { spawn, spawnSync } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BROKER_PORT = Number(process.env.BROKER_PORT ?? 1883);
const HTTP_PORT = Number(process.env.PORT ?? 3000);
const simArgs = process.argv.slice(2);
if (!simArgs.includes('--interval')) simArgs.push('--interval', '5');

const color = process.stdout.isTTY ? (c, s) => `\x1b[${c}m${s}\x1b[0m` : (_c, s) => s;
const children = [];
let stopping = false;

function run(name, c, args, env = {}) {
  const child = spawn(process.execPath, args, {
    cwd: ROOT,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  const tag = color(c, `[${name}]`);
  for (const stream of [child.stdout, child.stderr]) {
    readline.createInterface({ input: stream }).on('line', (line) => console.log(`${tag} ${line}`));
  }
  child.on('exit', (code) => {
    if (!stopping) {
      console.log(`${tag} đã dừng (mã ${code}). Tắt cả bộ.`);
      stopAll(1);
    }
  });
  children.push(child);
  return child;
}

/** Dừng đúng tiến trình con này và các tiến trình nó tạo (node --watch tạo thêm một tầng). */
function killTree(child) {
  if (child.exitCode !== null || child.killed) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
  } else {
    child.kill('SIGTERM');
  }
}

function stopAll(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const c of children.reverse()) killTree(c);
  setTimeout(() => process.exit(code), 200);
}

async function waitFor(check, what, ms = 10_000) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    if (stopping) throw new Error('đang dừng');
    if (await check()) return;
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`Hết giờ chờ ${what}`);
}

const portOpen = (port) => new Promise((resolve) => {
  const s = net.connect(port, '127.0.0.1');
  s.once('connect', () => { s.destroy(); resolve(true); });
  s.once('error', () => resolve(false));
});

async function main() {
  process.on('SIGINT', () => stopAll(0));
  process.on('SIGTERM', () => stopAll(0));

  if (await portOpen(BROKER_PORT)) {
    console.error(`Cổng ${BROKER_PORT} đã có chương trình khác (có thể là "npm run broker" đang chạy, hoặc Mosquitto).`);
    console.error('Tắt chương trình đó, hoặc chạy với BROKER_PORT khác.');
    process.exit(1);
  }
  if (await portOpen(HTTP_PORT)) {
    console.error(`Cổng ${HTTP_PORT} đang bị dùng. Tắt chương trình đó, hoặc chạy với PORT khác.`);
    process.exit(1);
  }

  run('broker', 90, ['scripts/dev-broker.js', '--port', String(BROKER_PORT)]);
  await waitFor(() => portOpen(BROKER_PORT), 'broker');

  run('server', 36, ['--watch', 'src/index.js'], {
    PORT: String(HTTP_PORT),
    MODE: 'sim',
    MQTT_URL: `mqtt://localhost:${BROKER_PORT}`,
    MQTT_USER: '',
    MQTT_PASS: '',
    HISTORY_PROVIDER: process.env.HISTORY_PROVIDER ?? 'memory',
    HISTORY_SEED_HOURS: process.env.HISTORY_SEED_HOURS ?? '24',
    LOG_READINGS: 'false',
  });
  await waitFor(async () => {
    try { return (await fetch(`http://localhost:${HTTP_PORT}/api/health`)).ok; } catch { return false; }
  }, 'backend');

  console.log(color('1', `\n  Giao diện: http://localhost:${HTTP_PORT}\n`));

  // Giả lập chạy trực tiếp trong cửa sổ này để nhận phím
  const sim = spawn(process.execPath, ['scripts/sim-esp32.js', ...simArgs, '--url', `mqtt://localhost:${BROKER_PORT}`], {
    cwd: ROOT, stdio: 'inherit',
  });
  children.push(sim);
  sim.on('exit', (code) => stopAll(code ?? 0));
}

main().catch((err) => {
  if (!stopping) console.error('npm run dev lỗi:', err.message);
  stopAll(1);
});
