import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createTelegramStore } from '../src/services/telegram/store.js';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-tg-store-'));
after(() => fs.rmSync(root, { recursive: true, force: true }));
const warnings = [];
const log = { warn: (m) => warnings.push(m), info() {}, debug() {}, error() {} };
const fresh = (opts = {}) => {
  const dir = fs.mkdtempSync(path.join(root, 'd-'));
  return { dir, store: createTelegramStore({ dir, mode: 'sim', deviceId: 'sc-01', log, ...opts }) };
};

test('chưa có file: danh sách trống, offset 0; tên file theo MODE và DEVICE_ID', () => {
  const { dir, store } = fresh();
  store.load();
  assert.equal(store.file, path.join(dir, 'telegram-sim-sc-01.json'));
  assert.deepEqual(store.subscribers(), []);
  assert.equal(store.offset, 0);
});

test('đăng ký, huỷ, ghi nhận cảnh báo; /start lặp không tạo bản trùng', () => {
  const { store } = fresh();
  assert.equal(store.subscribe(111, '2026-11-26T07:00:00.000Z'), true);
  assert.equal(store.subscribe('111', '2026-11-26T08:00:00.000Z'), false);
  assert.equal(store.subscribers().length, 1);
  assert.equal(store.subscribers()[0].subscribedAt, '2026-11-26T07:00:00.000Z');
  store.markAlerted('111', '2026-11-26T07:30:00.000Z');
  assert.equal(store.subscribers()[0].lastAlertAt, '2026-11-26T07:30:00.000Z');
  assert.equal(store.unsubscribe(111), true);
  assert.equal(store.unsubscribe(111), false);
});

test('offset chỉ tăng, không lùi', () => {
  const { store } = fresh();
  store.setOffset(10);
  store.setOffset(5);
  assert.equal(store.offset, 10);
});

test('lưu rồi đọc lại (khởi động lại): giữ người nhận, giờ cảnh báo, offset; không còn file tạm', async () => {
  const { dir, store } = fresh();
  store.subscribe('111', '2026-11-26T07:00:00.000Z');
  store.subscribe('222', '2026-11-26T07:01:00.000Z');
  store.markAlerted('222', '2026-11-26T07:30:00.000Z');
  store.setOffset(77);
  await store.save();

  const again = createTelegramStore({ dir, mode: 'sim', deviceId: 'sc-01', log });
  again.load();
  assert.equal(again.offset, 77);
  assert.deepEqual(again.subscribers(), [
    { chatId: '111', subscribedAt: '2026-11-26T07:00:00.000Z', lastAlertAt: null },
    { chatId: '222', subscribedAt: '2026-11-26T07:01:00.000Z', lastAlertAt: '2026-11-26T07:30:00.000Z' },
  ]);
  assert.deepEqual(fs.readdirSync(dir), ['telegram-sim-sc-01.json']);
});

test('nhiều lần save liền nhau chỉ ghi một lần, với nội dung mới nhất', async () => {
  const { store } = fresh();
  const spy = fs.promises.writeFile;
  let writes = 0;
  fs.promises.writeFile = async (...a) => { writes++; return spy(...a); };
  try {
    store.subscribe('1', '2026-11-26T07:00:00.000Z');
    const a = store.save();
    store.subscribe('2', '2026-11-26T07:00:00.000Z');
    const b = store.save();
    store.subscribe('3', '2026-11-26T07:00:00.000Z');
    store.save();
    await Promise.all([a, b, store.flush()]);
  } finally {
    fs.promises.writeFile = spy;
  }
  assert.equal(writes, 1);
  assert.equal(Object.keys(JSON.parse(fs.readFileSync(store.file, 'utf8')).subscribers).length, 3);
});

test('sim và live dùng file riêng', async () => {
  const { dir, store } = fresh();
  store.subscribe('111', '2026-11-26T07:00:00.000Z');
  await store.save();
  const live = createTelegramStore({ dir, mode: 'live', deviceId: 'sc-01', log });
  live.load();
  assert.deepEqual(live.subscribers(), []);
  assert.notEqual(live.file, store.file);
});

test('file hỏng / sai thiết bị / người nhận sai dạng: đổi thành .bak, bắt đầu danh sách trống, không ném lỗi', () => {
  const bad = [
    '{ hỏng',
    JSON.stringify({ v: 1, deviceId: 'sc-02', nextUpdateOffset: 0, subscribers: {} }),
    JSON.stringify({ v: 1, deviceId: 'sc-01', nextUpdateOffset: 0, subscribers: { '@thanh': { subscribedAt: '2026-11-26T07:00:00.000Z', lastAlertAt: null } } }),
    JSON.stringify({ v: 2, deviceId: 'sc-01', nextUpdateOffset: 0, subscribers: {} }),
  ];
  for (const body of bad) {
    const { dir, store } = fresh();
    fs.writeFileSync(store.file, body);
    warnings.length = 0;
    store.load();
    assert.deepEqual(store.subscribers(), []);
    assert.ok(fs.existsSync(path.join(dir, 'telegram-sim-sc-01.json.bak')));
    assert.ok(warnings.some((w) => /\.bak/.test(w)));
  }
});
