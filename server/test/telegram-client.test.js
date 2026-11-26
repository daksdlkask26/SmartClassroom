// Client Telegram: dùng fetch giả và một server HTTP giả trên máy (không gọi api.telegram.org).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createTelegramClient, TelegramError } from '../src/services/telegram/client.js';

const TOKEN = '123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw0';

/** fetch giả trả lần lượt các phản hồi trong `script`; mỗi phần tử: { status, body } | Error. */
function scriptedFetch(script) {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    const next = script.shift();
    if (next instanceof Error) throw next;
    return { ok: next.status === 200, status: next.status, json: async () => next.body };
  };
  return { fetch, calls };
}
const ok = (result) => ({ status: 200, body: { ok: true, result } });
const fail = (status, description, parameters) => ({ status, body: { ok: false, error_code: status, description, parameters } });
const netErr = () => Object.assign(new TypeError('fetch failed'), { cause: { code: 'ECONNRESET' } });

function client(script, extra = {}) {
  const f = scriptedFetch(script);
  const waits = [];
  const c = createTelegramClient({ token: TOKEN, fetch: f.fetch, wait: async (ms) => { waits.push(ms); }, ...extra });
  return { c, calls: f.calls, waits };
}

test('gọi đúng phương thức, POST JSON, trả result', async () => {
  const { c, calls } = client([ok({ id: 1, username: 'SmartClassroom16Bot' }), ok(true)]);
  assert.equal((await c.getMe()).username, 'SmartClassroom16Bot');
  await c.sendMessage('111', 'xin chào');
  assert.match(calls[0].url, /\/bot123456789:[^/]+\/getMe$/);
  assert.deepEqual(calls[1].body, { chat_id: '111', text: 'xin chào', link_preview_options: { is_disabled: true } });
  assert.equal(calls[1].body.parse_mode, undefined); // văn bản thuần
});

test('phân loại lỗi: 401, 403, 409, 400, 429 (kèm retryAfter), 5xx', async () => {
  const cases = [
    [fail(401, 'Unauthorized'), 'unauthorized'],
    [fail(403, 'Forbidden: bot was blocked by the user'), 'forbidden'],
    [fail(409, 'Conflict: terminated by other getUpdates request'), 'conflict'],
    [fail(400, 'Bad Request: chat not found'), 'bad-request'],
    [fail(429, 'Too Many Requests', { retry_after: 7 }), 'rate'],
    [fail(502, 'Bad Gateway'), 'server'],
  ];
  for (const [resp, kind] of cases) {
    const { c } = client([resp]);
    const e = await c.getMe().catch((x) => x);
    assert.ok(e instanceof TelegramError);
    assert.equal(e.kind, kind);
    if (kind === 'rate') assert.equal(e.retryAfter, 7);
  }
});

test('sendMessage thử lại lỗi mạng và 5xx (chờ 1 rồi 2 giây), rồi thành công', async () => {
  const { c, calls, waits } = client([netErr(), fail(500, 'Internal'), ok({ message_id: 1 })]);
  await c.sendMessage('111', 'a');
  assert.equal(calls.length, 3);
  assert.deepEqual(waits, [1000, 2000]);
});

test('sendMessage: 429 chờ đúng retry_after; quá lâu thì thôi để lần sau thử', async () => {
  const a = client([fail(429, 'Too Many Requests', { retry_after: 3 }), ok({})]);
  await a.c.sendMessage('111', 'a');
  assert.deepEqual(a.waits, [3000]);

  const b = client([fail(429, 'Too Many Requests', { retry_after: 120 })]);
  await assert.rejects(b.c.sendMessage('111', 'a'), (e) => e.kind === 'rate');
  assert.deepEqual(b.waits, []);
});

test('sendMessage: không thử lại 403 / 400; dừng sau 3 lần lỗi tạm thời', async () => {
  const a = client([fail(403, 'Forbidden: bot was blocked by the user')]);
  await assert.rejects(a.c.sendMessage('111', 'a'), (e) => e.kind === 'forbidden');
  assert.equal(a.calls.length, 1);

  const b = client([netErr(), netErr(), netErr(), ok({})]);
  await assert.rejects(b.c.sendMessage('111', 'a'), (e) => e.kind === 'network');
  assert.equal(b.calls.length, 3);
});

test('token không bao giờ lọt vào thông báo lỗi, kể cả khi Telegram hay lỗi mạng nhắc lại URL', async () => {
  const leaky = [
    Object.assign(new TypeError(`fetch failed https://api.telegram.org/bot${TOKEN}/getMe`), { cause: { message: `connect to /bot${TOKEN}` } }),
    fail(400, `Bad Request: bad token ${TOKEN}`),
  ];
  for (const resp of leaky) {
    const { c } = client([resp]);
    const e = await c.getMe().catch((x) => x);
    assert.ok(!e.message.includes(TOKEN), e.message);
    assert.ok(!String(e.description ?? '').includes(TOKEN));
  }
});

test('getUpdates gửi offset, timeout long polling, chỉ lấy tin nhắn', async () => {
  const { c, calls } = client([ok([])]);
  await c.getUpdates({ offset: 42, timeout: 25 });
  assert.deepEqual(calls[0].body, { offset: 42, timeout: 25, allowed_updates: ['message'] });
});

test('server HTTP thật trên máy: timeout báo "timeout"; huỷ bằng signal báo "aborted" ngay', async () => {
  const server = http.createServer(() => {}); // không bao giờ trả lời
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  try {
    const slow = createTelegramClient({ token: TOKEN, baseUrl, timeoutMs: 100 });
    await assert.rejects(slow.getMe(), (e) => e.kind === 'timeout' && !e.message.includes(TOKEN));

    const c = createTelegramClient({ token: TOKEN, baseUrl, timeoutMs: 10_000 });
    const ctrl = new AbortController();
    const started = Date.now();
    const p = c.getUpdates({ offset: 0, timeout: 25, signal: ctrl.signal });
    setTimeout(() => ctrl.abort(), 50);
    await assert.rejects(p, (e) => e.kind === 'aborted');
    assert.ok(Date.now() - started < 2000);
  } finally {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
});

test('server HTTP thật: đọc đúng JSON Telegram trả về', async () => {
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (d) => { body += d; });
    req.on('end', () => {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ ok: true, result: { echo: JSON.parse(body), path: req.url.replace(TOKEN, 'TOKEN') } }));
    });
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  try {
    const c = createTelegramClient({ token: TOKEN, baseUrl: `http://127.0.0.1:${server.address().port}` });
    const r = await c.sendMessage('111', 'Độ ẩm 64,5 %');
    assert.equal(r.path, '/botTOKEN/sendMessage');
    assert.equal(r.echo.text, 'Độ ẩm 64,5 %');
  } finally {
    await new Promise((r) => server.close(r));
  }
});
