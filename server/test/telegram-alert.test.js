// Cảnh báo độ ẩm (ID 6): luật cooldown thuần và hành vi của plugin với Telegram giả.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadConfig, readContract } from '../src/config.js';
import { createBus } from '../src/core/bus.js';
import { createState } from '../src/core/state.js';
import { register } from '../src/plugins/telegram.js';
import { cooldownOver, planAlert } from '../src/services/telegram/alerts.js';
import { sleep } from '../src/services/telegram/client.js';
import { createFakeTelegram, err } from './helpers/fake-telegram.js';

const contract = readContract();
const TOKEN = '123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw0';
const MIN = 60_000;
const COOLDOWN = contract.telegram.cooldownMin * MIN;
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-tg-alert-'));
after(() => fs.rmSync(root, { recursive: true, force: true }));

const logs = [];
const log = {
  error: (m) => logs.push(['error', m]), warn: (m) => logs.push(['warn', m]),
  info: (m) => logs.push(['info', m]), debug: () => {}, child() { return log; },
};
const limits = contract.telegram;
const T0 = new Date('2026-11-26T07:00:00.000Z');
const at = (ms) => new Date(T0.getTime() + ms);
const reading = (humidity, when = T0) => ({
  receivedAt: when.toISOString(), seq: 1, temperature: 27, humidity, co2: 800,
  sensors: { dht22: 'ok', mq135: 'ok' }, levels: {}, levelsSource: 'server',
});

// ---------- Luật thuần ----------
test('cooldownOver: chưa từng nhận thì gửi; trong thời gian nghỉ thì không; đủ thời gian nghỉ thì được', () => {
  assert.equal(cooldownOver(null, T0.getTime(), 30), true);
  assert.equal(cooldownOver(T0.toISOString(), at(COOLDOWN - 1).getTime(), 30), false);
  assert.equal(cooldownOver(T0.toISOString(), at(COOLDOWN).getTime(), 30), true);
});

test('planAlert: biên ngưỡng, null, cooldown riêng từng người, người bị gỡ khỏi allowlist không nhận', () => {
  const subs = [
    { chatId: '1', lastAlertAt: null },
    { chatId: '2', lastAlertAt: at(-10 * MIN).toISOString() }, // vừa nhận 10 phút trước
    { chatId: '3', lastAlertAt: at(-COOLDOWN).toISOString() },
  ];
  const opts = { limits, allowedChatIds: [], now: T0 };
  for (const h of [30, 64.5, 85, null]) assert.equal(planAlert(reading(h), subs, opts), null, String(h));
  assert.deepEqual(planAlert(reading(29.9), subs, opts), { kind: 'low', recipients: ['1', '3'] });
  assert.deepEqual(planAlert(reading(85.1), subs, opts), { kind: 'high', recipients: ['1', '3'] });
  assert.deepEqual(planAlert(reading(90), subs, { ...opts, allowedChatIds: ['3'] }).recipients, ['3']);
});

// ---------- Plugin ----------
let n = 0;
function seed(dir, subscribers) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'telegram-sim-sc-01.json'), JSON.stringify({
    v: 1, deviceId: 'sc-01', mode: 'sim', nextUpdateOffset: 0,
    subscribers: Object.fromEntries(subscribers.map((id) => [id, { subscribedAt: T0.toISOString(), lastAlertAt: null }])),
  }));
}

async function start({ subscribers = ['111'], env = {}, fake = createFakeTelegram(), dir, clock = { now: T0 } } = {}) {
  dir ??= path.join(root, `run-${++n}`);
  if (subscribers) seed(dir, subscribers);
  const config = loadConfig({
    env: { TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_BOT_USERNAME: 'SmartClassroomTestBot', DATA_DIR: dir, ...env }, contract,
  });
  const bus = createBus(log);
  const state = createState({ bus });
  const handle = await register({
    bus, state, config, log, createClient: fake.createClient, now: () => clock.now, wait: (ms, s) => sleep(1, s),
  });
  const send = async (h, when = clock.now) => { state.applyReading(reading(h, when)); await handle.idle(); };
  const file = () => JSON.parse(fs.readFileSync(path.join(dir, 'telegram-sim-sc-01.json'), 'utf8'));
  return { fake, handle, send, clock, dir, file };
}
const alerts = (fake) => fake.sent.filter((m) => /CẢNH BÁO/.test(m.text));

test('lần đầu vượt ngưỡng gửi ngay; trong 30 phút không gửi lại; sau 30 phút vẫn vượt thì nhắc lại', async () => {
  const { fake, handle, send, clock } = await start();
  await send(88);
  assert.equal(alerts(fake).length, 1);
  assert.match(alerts(fake)[0].text, /^\[GIẢ LẬP\] ⚠ CẢNH BÁO: ĐỘ ẨM CAO/);

  for (const m of [1, 10, 29]) { clock.now = at(m * MIN); await send(90); }
  assert.equal(alerts(fake).length, 1);

  clock.now = at(COOLDOWN);
  await send(89);
  assert.equal(alerts(fake).length, 2);
  await handle.close();
});

test('về bình thường rồi vượt lại, hoặc đổi từ cao sang thấp, trong thời gian nghỉ: không gửi (Q2)', async () => {
  const { fake, handle, send, clock } = await start();
  await send(88);
  clock.now = at(5 * MIN); await send(60);
  clock.now = at(10 * MIN); await send(88);
  clock.now = at(15 * MIN); await send(20);
  assert.equal(alerts(fake).length, 1);
  clock.now = at(COOLDOWN + MIN); await send(20);
  assert.equal(alerts(fake).length, 2);
  assert.match(alerts(fake)[1].text, /ĐỘ ẨM THẤP/);
  await handle.close();
});

test('đúng bằng ngưỡng 30 và 85, hoặc độ ẩm null: không gửi', async () => {
  const { fake, handle, send } = await start();
  for (const h of [30, 85, null]) await send(h);
  assert.equal(alerts(fake).length, 0);
  await handle.close();
});

test('khởi động lại trong thời gian nghỉ không gửi lại ngay (cooldown lưu ra file)', async () => {
  const dir = path.join(root, 'restart');
  const a = await start({ dir });
  await a.send(88);
  await a.handle.close();
  assert.equal(alerts(a.fake).length, 1);
  assert.equal(a.file().subscribers['111'].lastAlertAt, T0.toISOString());

  const b = await start({ dir, subscribers: null, clock: { now: at(5 * MIN) } });
  await b.send(88);
  assert.equal(alerts(b.fake).length, 0);
  b.clock.now = at(COOLDOWN);
  await b.send(88);
  assert.equal(alerts(b.fake).length, 1);
  await b.handle.close();
});

test('một người gửi lỗi tạm thời: người khác không bị gửi lặp; người lỗi được thử lại ở bản tin sau', async () => {
  const fake = createFakeTelegram();
  const { handle, send, clock } = await start({ subscribers: ['111', '222'], fake });
  fake.fail('sendMessage', Object.assign((args) => (args.chatId === '222' ? err('network') : null), { once: true }));
  await send(88);
  assert.deepEqual(alerts(fake).map((m) => m.chatId), ['111']);

  clock.now = at(30_000);
  await send(88);
  assert.deepEqual(alerts(fake).map((m) => m.chatId), ['111', '222']); // 111 không nhận lần hai
  await handle.close();
});

test('người dùng chặn bot (403) hoặc chat không còn (400 chat not found): xoá khỏi danh sách, không thử mãi', async () => {
  const fake = createFakeTelegram();
  const { handle, send, file, clock } = await start({ subscribers: ['111', '222', '333'], fake });
  fake.fail('sendMessage', (a) => (a.chatId === '222' ? err('forbidden') : null));
  fake.fail('sendMessage', (a) => (a.chatId === '333' ? err('bad-request', { description: 'Bad Request: chat not found' }) : null));
  await send(88);
  assert.deepEqual(Object.keys(file().subscribers), ['111']);
  const tries = fake.count('sendMessage');
  clock.now = at(COOLDOWN);
  await send(88);
  assert.equal(fake.count('sendMessage'), tries + 1); // chỉ còn 111
  await handle.close();
});

test('token bị thu hồi (401) khi gửi: ngừng gửi, không báo lỗi lặp lại mỗi bản tin', async () => {
  const fake = createFakeTelegram();
  fake.fail('sendMessage', () => err('unauthorized'));
  const { handle, send, clock } = await start({ fake });
  logs.length = 0;
  await send(88);
  clock.now = at(COOLDOWN); await send(88);
  clock.now = at(2 * COOLDOWN); await send(88);
  assert.equal(fake.count('sendMessage'), 1);
  assert.equal(logs.filter((l) => l[0] === 'error' && /401/.test(l[1])).length, 1);
  await handle.close();
});

test('MODE=live: không có nhãn [GIẢ LẬP]; file riêng telegram-live-*', async () => {
  const dir = path.join(root, 'live');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'telegram-live-sc-01.json'), JSON.stringify({
    v: 1, deviceId: 'sc-01', mode: 'live', nextUpdateOffset: 0,
    subscribers: { 111: { subscribedAt: T0.toISOString(), lastAlertAt: null } },
  }));
  const { fake, handle, send } = await start({ dir, subscribers: null, env: { MODE: 'live' } });
  await send(88);
  assert.match(alerts(fake)[0].text, /^⚠ CẢNH BÁO/);
  await handle.close();
});
