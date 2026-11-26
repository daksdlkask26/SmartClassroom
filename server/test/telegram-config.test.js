import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeConfig, loadConfig, publicTelegram, readContract } from '../src/config.js';

const contract = readContract();
const TOKEN = '123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw0';
const load = (env) => loadConfig({ env, contract });

test('không có TELEGRAM_BOT_TOKEN: telegram = null (plugin tự tắt), trang web nhận username null', () => {
  const cfg = load({});
  assert.equal(cfg.telegram, null);
  assert.deepEqual(publicTelegram(cfg), { username: null });
  assert.equal(describeConfig(cfg).telegram, null);
});

test('cấu hình đủ: bỏ @ ở tên bot, tách và bỏ trùng chat ID, giữ dạng chuỗi', () => {
  const cfg = load({ TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_BOT_USERNAME: '@SmartClassroom16Bot', TELEGRAM_ALLOWED_CHAT_IDS: ' 111, 222 ,111,-1001234567890 ,' });
  assert.equal(cfg.telegram.username, 'SmartClassroom16Bot');
  assert.deepEqual(cfg.telegram.allowedChatIds, ['111', '222', '-1001234567890']);
  assert.ok(Object.isFrozen(cfg.telegram));
  assert.deepEqual(publicTelegram(cfg), { username: 'SmartClassroom16Bot' });
});

test('token không bao giờ lộ ra describeConfig (log) hay publicTelegram (trình duyệt)', () => {
  const cfg = load({ TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_BOT_USERNAME: 'SmartClassroom16Bot' });
  for (const out of [describeConfig(cfg), publicTelegram(cfg)]) {
    const text = JSON.stringify(out);
    assert.ok(!text.includes(TOKEN));
    assert.ok(!text.includes(TOKEN.split(':')[1]));
  }
  assert.deepEqual(describeConfig(cfg).telegram, { username: 'SmartClassroom16Bot', token: '***', allowedChatIds: 'tất cả' });
});

test('PLUGINS_DISABLED=telegram: trang web coi như bot chưa bật', () => {
  const cfg = load({ TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_BOT_USERNAME: 'SmartClassroom16Bot', PLUGINS_DISABLED: 'telegram' });
  assert.deepEqual(publicTelegram(cfg), { username: null });
});

test('báo lỗi rõ: token sai dạng, thiếu hoặc sai tên bot, chat ID không phải số; thông báo không chứa token', () => {
  assert.throws(() => load({ TELEGRAM_BOT_TOKEN: 'your-telegram-token' }), /TELEGRAM_BOT_TOKEN/);
  // đặt nhầm tên biến: báo rõ, không lặng lẽ tắt bot; thông báo không chứa token
  assert.throws(() => load({ TELEGRAM_TOKEN: TOKEN }), (e) => /đổi tên thành TELEGRAM_BOT_TOKEN/.test(e.message) && !e.message.includes(TOKEN));
  assert.throws(() => load({ TELEGRAM_BOT_TOKEN: TOKEN }), /TELEGRAM_BOT_USERNAME/);
  for (const bad of ['SmartClassroom', 'ab', 'tên_bot', 'x'.repeat(40) + 'bot']) {
    assert.throws(() => load({ TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_BOT_USERNAME: bad }), /TELEGRAM_BOT_USERNAME/, bad);
  }
  assert.throws(
    () => load({ TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_BOT_USERNAME: 'SmartClassroom16Bot', TELEGRAM_ALLOWED_CHAT_IDS: '111,@thanh' }),
    (e) => /TELEGRAM_ALLOWED_CHAT_IDS/.test(e.message) && !e.message.includes(TOKEN),
  );
});
