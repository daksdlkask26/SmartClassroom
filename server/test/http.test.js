import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { loadConfig, readContract } from '../src/config.js';
import { createApp } from '../src/http/app.js';

const silent = { error() {}, warn() {}, info() {}, debug() {}, child() { return silent; } };
let server;
let base;

before(async () => {
  const config = loadConfig({ env: { PORT: '0' }, contract: readContract() });
  server = http.createServer(createApp({ config, log: silent }));
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((r) => server.close(r)));

test('GET /api/health trả trạng thái', async () => {
  const res = await fetch(`${base}/api/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.mode, 'sim');
  assert.equal(body.mqtt, 'disconnected');
  assert.equal(body.contractVersion, readContract().contractVersion);
  assert.equal(typeof body.uptimeS, 'number');
  assert.equal(res.headers.get('x-powered-by'), null);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
});

test('API không tồn tại trả 404 dạng lỗi chuẩn, không trả index.html', async () => {
  const res = await fetch(`${base}/api/khong-co`, { headers: { Accept: 'text/html' } });
  assert.equal(res.status, 404);
  const body = await res.json();
  assert.equal(body.error.code, 'NOT_FOUND');
});

test('JSON hỏng trả 400 BAD_REQUEST', async () => {
  const res = await fetch(`${base}/api/health`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{hỏng',
  });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.code, 'BAD_REQUEST');
});

test('trang gốc và đường dẫn trang đều trả index.html', async () => {
  for (const p of ['/', '/giam-sat', '/lich-su?chi-so=do-am']) {
    const res = await fetch(base + p, { headers: { Accept: 'text/html' } });
    assert.equal(res.status, 200, p);
    assert.match(res.headers.get('content-type'), /text\/html/, p);
    assert.match(await res.text(), /<html lang="vi"[\s>]/, p);
  }
});

test('tệp tĩnh được phục vụ, tệp thiếu trả 404 chứ không trả index.html', async () => {
  const js = await fetch(`${base}/js/main.js`);
  assert.equal(js.status, 200);
  assert.match(js.headers.get('content-type'), /javascript/);

  const missing = await fetch(`${base}/css/khong-co.css`, { headers: { Accept: 'text/html' } });
  assert.equal(missing.status, 404);
});
