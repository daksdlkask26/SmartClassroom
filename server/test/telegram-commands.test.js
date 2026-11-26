import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readContract } from '../src/config.js';
import { handleUpdate, isAllowed, MAX_QUERY_AGE_S, parseCommand } from '../src/services/telegram/commands.js';
import { createTelegramStore } from '../src/services/telegram/store.js';

const contract = readContract();
const BOT = 'SmartClassroom16Bot';
const NOW = new Date('2026-11-26T07:30:20.000Z');
const log = { warn() {}, info() {}, debug() {}, error() {} };
const latest = {
  receivedAt: '2026-11-26T07:30:00.000Z', seq: 1, temperature: 27.5, humidity: 64.5, co2: 850,
  sensors: { dht22: 'ok', mq135: 'ok' }, levels: {}, levelsSource: 'server',
};
const state = { latest: () => latest, device: () => ({ online: true, reason: 'telemetry' }) };

function setup(allowedChatIds = []) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-tg-cmd-'));
  const store = createTelegramStore({ dir, mode: 'sim', deviceId: 'sc-01', log });
  const run = (text, { chat = { id: 111, type: 'private' }, date = NOW.getTime() / 1000, extra = {} } = {}) => handleUpdate(
    { update_id: 1, message: { message_id: 1, date, chat, ...(text === undefined ? {} : { text }), ...extra } },
    { store, state, contract, botUsername: BOT, allowedChatIds, now: NOW },
  );
  return { store, run, cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}

test('parseCommand: /doam, /doam@TenBot (không phân biệt hoa thường), bot khác, chữ thường', () => {
  assert.deepEqual(parseCommand('/doam', BOT), { name: 'doam', forOtherBot: false });
  assert.deepEqual(parseCommand('/DoAm@smartclassroom16bot', BOT), { name: 'doam', forOtherBot: false });
  assert.deepEqual(parseCommand('/trangthai ngay', BOT), { name: 'trangthai', forOtherBot: false });
  assert.deepEqual(parseCommand('/doam@OtherBot', BOT), { name: 'doam', forOtherBot: true });
  assert.equal(parseCommand('doam', BOT), null);
  assert.equal(parseCommand(undefined, BOT), null);
  assert.equal(parseCommand('/doamxyz', BOT).name, 'doamxyz');
});

test('allowlist trống = ai cũng được; có danh sách thì chỉ người trong danh sách', () => {
  assert.equal(isAllowed([], 999), true);
  assert.equal(isAllowed(['111'], 111), true);
  assert.equal(isAllowed(['111'], '222'), false);
});

test('/start lần đầu đăng ký; gọi lại không tạo bản trùng; /stop huỷ; /stop khi chưa đăng ký', () => {
  const { store, run, cleanup } = setup();
  const first = run('/start');
  assert.equal(first.changed, true);
  assert.equal(first.chatId, '111');
  assert.match(first.text, /^Đã đăng ký nhận cảnh báo độ ẩm phòng học\./);
  assert.match(first.text, /dưới 30 % hoặc trên 85 %, nghỉ 30 phút/);

  const again = run('/start@SmartClassroom16Bot');
  assert.equal(again.changed, false);
  assert.match(again.text, /^Bạn đã đăng ký rồi/);
  assert.equal(store.subscribers().length, 1);

  assert.equal(run('/stop').changed, true);
  assert.equal(store.subscribers().length, 0);
  const none = run('/stop');
  assert.equal(none.changed, false);
  assert.match(none.text, /chưa đăng ký/);
  cleanup();
});

test('/start sau khi khởi động lại (đọc lại file) vẫn nhận ra người đã đăng ký', async () => {
  const { store, run, cleanup } = setup();
  run('/start');
  await store.save();
  const reloaded = createTelegramStore({ dir: path.dirname(store.file), mode: 'sim', deviceId: 'sc-01', log });
  reloaded.load();
  const r = handleUpdate(
    { update_id: 2, message: { message_id: 2, date: NOW.getTime() / 1000, chat: { id: 111, type: 'private' }, text: '/start' } },
    { store: reloaded, state, contract, botUsername: BOT, allowedChatIds: [], now: NOW },
  );
  assert.equal(r.changed, false);
  assert.match(r.text, /đã đăng ký rồi/);
  cleanup();
});

test('/doam, /trangthai trả số liệu mới nhất', () => {
  const { run, cleanup } = setup();
  assert.equal(run('/doam').text, 'Độ ẩm hiện tại: 64,5 % (14:30). Trong ngưỡng 30–85 %.');
  assert.match(run('/trangthai').text, /^Thiết bị trực tuyến · cập nhật 14:30\. Độ ẩm 64,5 %/);
  cleanup();
});

test('người ngoài allowlist: từ chối chung chung kèm chat ID của chính họ; không được đăng ký, không xem số liệu', () => {
  const { store, run, cleanup } = setup(['222']);
  for (const cmd of ['/start', '/doam', '/trangthai']) {
    const r = run(cmd);
    assert.equal(r.action, 'denied');
    assert.match(r.text, /Mã chat của bạn: 111/);
    assert.ok(!r.text.includes('64,5'));
  }
  assert.equal(store.subscribers().length, 0);
  cleanup();
});

test('lệnh lạ, chữ thường, tin không phải chữ (ảnh, nhãn dán): trả hướng dẫn các lệnh', () => {
  const { run, cleanup } = setup();
  for (const r of [run('/abc'), run('chào bot'), run(undefined, { extra: { sticker: { file_id: 'x' } } })]) {
    assert.equal(r.action, 'help');
    for (const c of ['/doam', '/trangthai', '/start', '/stop']) assert.ok(r.text.includes(c));
  }
  cleanup();
});

test('chat nhóm: chỉ nhắc mở chat riêng khi có lệnh của bot này; tin thường hoặc lệnh bot khác thì im lặng', () => {
  const { store, run, cleanup } = setup();
  const group = { id: -100123, type: 'supergroup' };
  assert.equal(run('/start', { chat: group }).action, 'group');
  assert.equal(store.subscribers().length, 0);
  assert.equal(run('xin chào', { chat: group }), null);
  assert.equal(run('/doam@OtherBot', { chat: group }), null);
  assert.equal(run('/doam@OtherBot'), null); // chat riêng nhưng gọi bot khác
  cleanup();
});

test('lệnh hỏi số liệu gửi lúc backend đang tắt (cũ hơn 2 phút) bị bỏ qua; /start, /stop cũ vẫn xử lý', () => {
  const { store, run, cleanup } = setup();
  const old = NOW.getTime() / 1000 - MAX_QUERY_AGE_S - 1;
  assert.equal(run('/doam', { date: old }), null);
  assert.equal(run('/trangthai', { date: old }), null);
  assert.equal(run('/start', { date: old }).changed, true);
  assert.equal(store.subscribers().length, 1);
  cleanup();
});

test('bỏ qua update không phải tin nhắn mới (tin đã sửa, nút bấm)', () => {
  const { store } = setup();
  const ctx = { store, state, contract, botUsername: BOT, allowedChatIds: [], now: NOW };
  assert.equal(handleUpdate({ update_id: 1, edited_message: { chat: { id: 1, type: 'private' }, text: '/doam' } }, ctx), null);
  assert.equal(handleUpdate({ update_id: 1 }, ctx), null);
});
