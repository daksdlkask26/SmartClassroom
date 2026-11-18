// Kiểm thử phía giao diện chạy bằng Node: định dạng số / giờ, chuỗi, store, bảng route.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatNumber, formatTime, splitNumber, NO_VALUE } from '../../frontend/js/core/format.js';
import { setStrings, t } from '../../frontend/js/core/i18n.js';
import { createStore } from '../../frontend/js/core/store.js';
import { matchRoute, normalizePath } from '../../frontend/js/core/router.js';
import { routes, redirects, railRoutes, tabRoutes, moreRoutes } from '../../frontend/js/routes.js';

const FRONTEND = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend');
const strings = JSON.parse(fs.readFileSync(path.join(FRONTEND, 'strings/vi.json'), 'utf8'));

// ---------- format.js ----------
test('số theo vi-VN: phẩy thập phân, không nhóm hàng nghìn (HANDOFF §3.2)', () => {
  assert.equal(formatNumber(64.5, 1), '64,5');
  assert.equal(formatNumber(27.46, 1), '27,5');
  assert.equal(formatNumber(30, 1), '30,0');
  assert.equal(formatNumber(850, 0), '850');
  assert.equal(formatNumber(1040, 0), '1040');
  assert.match(formatNumber(-3.2, 1), /^[-−]3,2$/); // nhiệt độ âm (valid từ -40 °C)
});

test('không bao giờ hiện số giả: thiếu / null / NaN → "—"', () => {
  for (const v of [null, undefined, NaN, Infinity, '64.5']) assert.equal(formatNumber(v, 1), NO_VALUE);
  assert.equal(NO_VALUE, '—');
  assert.deepEqual(splitNumber(null, 1), { int: '—', sep: '', frac: '' });
});

test('splitNumber tách chữ số (Doto) và dấu phẩy (JetBrains Mono)', () => {
  assert.deepEqual(splitNumber(64.5, 1), { int: '64', sep: ',', frac: '5' });
  assert.deepEqual(splitNumber(850, 0), { int: '850', sep: '', frac: '' });
});

test('giờ hiển thị theo Asia/Ho_Chi_Minh (UTC+7), dạng 24 giờ', () => {
  assert.equal(formatTime('2026-11-06T07:30:00.000Z'), '14:30');
  assert.equal(formatTime('2026-11-06T07:30:12.000Z', { seconds: true }), '14:30:12');
  assert.equal(formatTime('2026-11-05T17:05:00.000Z'), '00:05');
  assert.equal(formatTime(Date.parse('2026-11-06T16:59:00.000Z')), '23:59');
  assert.equal(formatTime(null), '—');
  assert.equal(formatTime('hỏng'), '—');
});

// ---------- i18n.js + vi.json ----------
test('t() thay tham số; thiếu khóa trả lại chính khóa', () => {
  setStrings({ 'a.b': 'Cập nhật {n} giây trước', 'x': 'giữ {lạ}' });
  assert.equal(t('a.b', { n: 3 }), 'Cập nhật 3 giây trước');
  assert.equal(t('x', {}), 'giữ {lạ}');
  const warn = console.warn;
  console.warn = () => {};
  try {
    assert.equal(t('không.có'), 'không.có');
  } finally {
    console.warn = warn;
  }
});

test('mọi khóa t("…") trong frontend/js đều có trong vi.json', () => {
  const missing = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.js')) {
        const src = fs.readFileSync(p, 'utf8');
        for (const m of src.matchAll(/\bt\(\s*'([a-zA-Z0-9_.]+)'/g)) {
          if (!(m[1] in strings)) missing.push(`${path.relative(FRONTEND, p)}: ${m[1]}`);
        }
        // khóa đặt trong bảng (titleKey / navKey / label …)
        for (const m of src.matchAll(/(?:Key|label):\s*'([a-z][a-zA-Z0-9_.]+\.[a-zA-Z0-9_.]+)'/g)) {
          if (!(m[1] in strings)) missing.push(`${path.relative(FRONTEND, p)}: ${m[1]}`);
        }
      }
    }
  };
  walk(path.join(FRONTEND, 'js'));
  assert.deepEqual(missing, []);
});

test('chuỗi thanh trạng thái khớp HANDOFF §5', () => {
  setStrings(strings);
  assert.equal(`${t('status.online')} · ${t('status.online.detail', { n: 3 })}`, 'TRỰC TUYẾN · Cập nhật 3 giây trước');
  assert.equal(`${t('status.connecting')} · ${t('status.connecting.detail')}`, 'ĐANG KẾT NỐI… · Đang chờ bản tin đầu tiên từ thiết bị');
  assert.equal(`${t('status.stale')} · ${t('status.stale.detail', { m: 2, time: '14:28' })}`,
    'DỮ LIỆU CŨ · Chưa có bản tin mới trong 2 phút · giá trị cuối lúc 14:28');
  assert.equal(`${t('status.deviceOffline')} · ${t('status.deviceOffline.detail', { time: '13:52' })}`,
    'THIẾT BỊ NGOẠI TUYẾN · Không nhận bản tin từ 13:52 · kiểm tra nguồn và WiFi của thiết bị');
  assert.equal(`${t('status.disconnected')} · ${t('status.disconnected.detail', { s: 5 })}`,
    'MẤT KẾT NỐI · Mất kết nối tới máy chủ · tự thử lại sau 5 giây · số liệu là giá trị cuối');
  assert.equal(t('led.subtitle'), 'Mỗi cặp bóng báo một thông số theo 3 mức màu. Chọn màu cho từng mức rồi bấm Áp dụng bảng màu.');
});

test('giao diện không nói "đã xác nhận" hay "đèn đã đổi" (HANDOFF §3.5, plan.md 11.3)', () => {
  const all = Object.values(strings).join('\n').toLowerCase();
  assert.ok(!all.includes('đã xác nhận'));
  assert.ok(!all.includes('đèn đã đổi'));
});

// ---------- store.js ----------
test('store chỉ gọi subscriber khi phần được chọn thay đổi', () => {
  const store = createStore({ a: 1, b: { x: 1 } });
  const seen = [];
  store.subscribe((s) => s.a, (a) => seen.push(a));
  store.set({ b: { x: 2 } });   // a không đổi → không gọi
  store.set({ a: 2 });
  store.set((s) => ({ a: s.a + 1 }));
  assert.deepEqual(seen, [1, 2, 3]);
  assert.deepEqual(store.get(), { a: 3, b: { x: 2 } });
});

test('hủy đăng ký store', () => {
  const store = createStore({ a: 1 });
  let n = 0;
  const off = store.subscribe((s) => s.a, () => { n += 1; }, { immediate: false });
  store.set({ a: 2 });
  off();
  store.set({ a: 3 });
  assert.equal(n, 1);
});

// ---------- router.js + routes.js ----------
test('đường dẫn tiếng Việt và chuyển hướng "/" → /giam-sat', () => {
  assert.equal(normalizePath('/giam-sat/'), '/giam-sat');
  assert.equal(normalizePath('/'), '/');
  assert.deepEqual(matchRoute({ routes, redirects, pathname: '/' }), { redirect: '/giam-sat' });
  assert.equal(matchRoute({ routes, redirects, pathname: '/lich-su/' }).route.id, 'history');
  assert.equal(matchRoute({ routes, redirects, pathname: '/thiet-bi' }).route.id, 'device');
  assert.deepEqual(matchRoute({ routes, redirects, pathname: '/khong-co' }), { notFound: true });
});

test('rail 5 mục đánh số 01–05; tab bar 4 mục + "Thêm" chứa Thiết bị & Tài khoản', () => {
  assert.deepEqual(railRoutes.map((r) => `${r.num} ${r.path}`),
    ['01 /giam-sat', '02 /den-led', '03 /lich-su', '04 /telegram', '05 /thiet-bi']);
  assert.deepEqual(tabRoutes.map((r) => r.id), ['monitor', 'led', 'history', 'telegram']);
  assert.deepEqual(moreRoutes.map((r) => r.id), ['device', 'account']);
});

test('mỗi trang có file module trong frontend/js/pages', () => {
  for (const r of routes) {
    const m = r.load.toString().match(/import\('\.\/(pages\/[a-z-]+\.js)'\)/);
    assert.ok(m, r.id);
    assert.ok(fs.existsSync(path.join(FRONTEND, 'js', m[1])), m[1]);
  }
});
