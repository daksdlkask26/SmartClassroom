// Plugin Telegram: khởi động nền, nhận lệnh bằng long polling, lỗi Telegram, dừng sạch. Telegram giả, không gửi tin thật.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadConfig, readContract } from '../src/config.js';
import { createBus } from '../src/core/bus.js';
import { createState } from '../src/core/state.js';
import { register } from '../src/plugins/telegram.js';
import { createTelegramClient, sleep } from '../src/services/telegram/client.js';
import { createFakeTelegram, err, until } from './helpers/fake-telegram.js';

const contract = readContract();
const TOKEN = '123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw0';
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-tg-plugin-'));
after(() => fs.rmSync(root, { recursive: true, force: true }));

const logs = [];
const log = {
  error: (...a) => logs.push(['error', a.join(' ')]), warn: (...a) => logs.push(['warn', a.join(' ')]),
  info: (...a) => logs.push(['info', a.join(' ')]), debug: (...a) => logs.push(['debug', a.join(' ')]), child() { return log; },
};
const fastWait = (ms, signal) => sleep(1, signal);
let n = 0;

async function start({ fake = createFakeTelegram(), env = {}, dir = path.join(root, `run-${++n}`), createClient } = {}) {
  const config = loadConfig({
    env: { TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_BOT_USERNAME: 'SmartClassroomTestBot', DATA_DIR: dir, ...env }, contract,
  });
  const bus = createBus(log);
  const state = createState({ bus });
  const handle = await register({ bus, state, config, log, createClient: createClient ?? fake.createClient, wait: fastWait });
  const file = () => JSON.parse(fs.readFileSync(path.join(dir, `telegram-${config.mode}-sc-01.json`), 'utf8'));
  return { fake, handle, bus, state, dir, file };
}
const polling = (fake) => until(() => fake.count('getUpdates') > 0, 'bắt đầu polling');

test('không có token: plugin tự tắt, không gọi Telegram', async () => {
  logs.length = 0;
  const bus = createBus(log);
  const handle = await register({
    bus, state: createState({ bus }), config: loadConfig({ env: {}, contract }), log,
    createClient: () => { throw new Error('không được gọi'); },
  });
  assert.equal(handle, undefined);
  assert.ok(logs.some((l) => l[0] === 'info' && /TELEGRAM_BOT_TOKEN/.test(l[1])));
});

test('register trả về ngay dù Telegram treo; close huỷ được ngay', async () => {
  const fake = createFakeTelegram();
  fake.client.getMe = ({ signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(err('aborted'))));
  const t0 = Date.now();
  const { handle } = await start({ fake });
  assert.ok(Date.now() - t0 < 200, 'register chờ mạng');
  const t1 = Date.now();
  await handle.close();
  assert.ok(Date.now() - t1 < 500, 'close không huỷ được');
});

test('khởi động: mất mạng thì tự thử lại (báo warn một lần), rồi đăng ký 4 lệnh và bắt đầu nhận tin', async () => {
  const fake = createFakeTelegram();
  for (let i = 0; i < 3; i++) fake.fail('getMe', err('network'));
  logs.length = 0;
  const { handle } = await start({ fake });
  await polling(fake);
  assert.equal(fake.count('getMe'), 4);
  assert.equal(logs.filter((l) => /Chưa kết nối được Telegram/.test(l[1])).length, 1);
  const cmds = fake.calls.find((c) => c.method === 'setMyCommands').args.commands.map((c) => c.command);
  assert.deepEqual(cmds, ['doam', 'trangthai', 'start', 'stop']);
  await handle.close();
});

test('token sai (401): báo lỗi một lần, không polling, không gửi cảnh báo; backend vẫn chạy', async () => {
  const fake = createFakeTelegram();
  fake.fail('getMe', err('unauthorized'));
  logs.length = 0;
  const { handle, state } = await start({ fake });
  await until(() => logs.some((l) => l[0] === 'error' && /401/.test(l[1])), 'báo 401');
  state.applyReading({ receivedAt: new Date().toISOString(), seq: 1, temperature: 27, humidity: 90, co2: 800, sensors: { dht22: 'ok', mq135: 'ok' }, levels: {}, levelsSource: 'server' });
  await handle.idle();
  assert.equal(fake.count('getUpdates'), 0);
  assert.equal(fake.count('sendMessage'), 0);
  await handle.close();
});

test('tên bot trong .env khác bot thật của token: cảnh báo trong log', async () => {
  logs.length = 0;
  const { fake, handle } = await start({ fake: createFakeTelegram({ username: 'OtherNameBot' }) });
  await polling(fake);
  assert.ok(logs.some((l) => l[0] === 'warn' && /@OtherNameBot/.test(l[1])));
  await handle.close();
});

test('nhận lệnh: /start lưu người nhận ra file, trả lời có nhãn [GIẢ LẬP]; /doam trả số mới nhất; offset được lưu', async () => {
  const { fake, handle, state, file } = await start();
  await polling(fake);
  fake.push({ text: '/start', chatId: 111 });
  await until(() => fake.sent.length === 1, 'trả lời /start');
  assert.match(fake.sent[0].text, /^\[GIẢ LẬP\] Đã đăng ký nhận cảnh báo độ ẩm phòng học\./);
  await until(() => file().subscribers['111'], 'lưu người nhận');

  state.applyReading({ receivedAt: new Date().toISOString(), seq: 1, temperature: 27.5, humidity: 64.5, co2: 850, sensors: { dht22: 'ok', mq135: 'ok' }, levels: {}, levelsSource: 'server' });
  fake.push({ text: '/doam', chatId: 111 });
  await until(() => fake.sent.length === 2, 'trả lời /doam');
  assert.match(fake.sent[1].text, /^\[GIẢ LẬP\] Độ ẩm hiện tại: 64,5 %/);
  await handle.close();
  assert.equal(file().nextUpdateOffset, 3);
});

test('khởi động lại: tiếp tục từ offset đã lưu, không xử lý lại tin cũ; người nhận vẫn còn', async () => {
  const dir = path.join(root, 'offset');
  const a = await start({ dir });
  await polling(a.fake);
  a.fake.push({ text: '/start', chatId: 111 });
  await until(() => a.fake.sent.length === 1, 'trả lời');
  await a.handle.close();

  const b = await start({ dir });
  await polling(b.fake);
  assert.equal(b.fake.calls.find((c) => c.method === 'getUpdates').args.offset, 2);
  assert.ok(b.file().subscribers['111']);
  await b.handle.close();
});

test('polling: 409 báo rõ "chỉ một máy" đúng một lần dù lặp lại; lỗi mạng báo warn một lần rồi tự hồi phục', async () => {
  const fake = createFakeTelegram();
  for (let i = 0; i < 3; i++) fake.fail('getUpdates', err('conflict'));
  for (let i = 0; i < 3; i++) fake.fail('getUpdates', err('network'));
  logs.length = 0;
  const { handle } = await start({ fake });
  fake.push({ text: '/start', chatId: 5 });
  await until(() => fake.sent.length === 1, 'hồi phục và trả lời');
  assert.equal(logs.filter((l) => l[0] === 'error' && /409/.test(l[1]) && /PLUGINS_DISABLED=telegram/.test(l[1])).length, 1);
  assert.equal(logs.filter((l) => l[0] === 'warn' && /Không nhận được tin Telegram/.test(l[1])).length, 1);
  assert.ok(logs.some((l) => /nhận tin Telegram trở lại/.test(l[1])));
  await handle.close();
});

test('polling: 401 giữa chừng thì dừng polling, không thử lại liên tục', async () => {
  const fake = createFakeTelegram();
  fake.fail('getUpdates', err('unauthorized'));
  const { handle } = await start({ fake });
  await polling(fake);
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(fake.count('getUpdates'), 1);
  await handle.close();
});

test('trả lời thất bại vì người dùng đã chặn bot: xoá người nhận, polling vẫn chạy tiếp', async () => {
  const fake = createFakeTelegram();
  const { handle, file } = await start({ fake });
  await polling(fake);
  fake.push({ text: '/start', chatId: 111 });
  await until(() => fake.sent.length === 1, 'đăng ký');
  fake.fail('sendMessage', err('forbidden'));
  fake.push({ text: '/doam', chatId: 111 });
  await until(() => fake.count('sendMessage') === 2, 'thử trả lời');
  await until(() => !file().subscribers['111'], 'xoá người nhận');
  fake.push({ text: '/start', chatId: 222 });
  await until(() => fake.sent.some((m) => m.chatId === '222'), 'vẫn nhận lệnh');
  await handle.close();
});

test('dừng: huỷ long polling đang chờ ngay, ghi file xong rồi mới trả về', async () => {
  const { fake, handle, file, dir } = await start();
  await polling(fake);
  fake.push({ text: '/start', chatId: 111 });
  await until(() => fake.sent.length === 1, 'trả lời');
  const t0 = Date.now();
  await handle.close();
  assert.ok(Date.now() - t0 < 500);
  assert.ok(file().subscribers['111']);
  assert.ok(!fs.readdirSync(dir).some((f) => f.endsWith('.tmp')));
});

test('token không bao giờ xuất hiện trong log, kể cả khi lỗi mạng nhắc lại URL chứa token', async () => {
  const leakyFetch = async (url) => { throw Object.assign(new TypeError(`fetch failed ${url}`), { cause: { message: `ECONNREFUSED ${url}` } }); };
  logs.length = 0;
  const { handle } = await start({
    createClient: ({ token, wait }) => createTelegramClient({ token, wait, fetch: leakyFetch }),
  });
  await until(() => logs.some((l) => /Chưa kết nối được Telegram/.test(l[1])), 'báo lỗi mạng');
  await handle.close();
  const all = logs.map((l) => l[1]).join('\n');
  assert.ok(all.includes('***'));
  assert.ok(!all.includes(TOKEN));
  assert.ok(!all.includes(TOKEN.split(':')[1]));
});
