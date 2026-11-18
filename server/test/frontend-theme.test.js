// Chủ đề giao diện (frontend/js/core/theme.js): Theo hệ điều hành / Sáng · Body / Tối · Lid (DECISIONS D10).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readThemePref, resolveTheme, THEME_KEY } from '../../frontend/js/core/theme.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const fakeStorage = (value) => ({ getItem: (k) => (k === THEME_KEY ? value : null) });

test('chủ đề: theo hệ điều hành khi chưa chọn, lựa chọn tay thắng hệ điều hành', () => {
  assert.equal(resolveTheme('system', false), 'body');
  assert.equal(resolveTheme('system', true), 'lid');
  assert.equal(resolveTheme('body', true), 'body');
  assert.equal(resolveTheme('lid', false), 'lid');
  assert.equal(resolveTheme('lạ', true), 'lid');
});

test('chủ đề: đọc lựa chọn đã lưu; giá trị lạ hoặc bộ nhớ lỗi → theo hệ điều hành', () => {
  assert.equal(readThemePref(fakeStorage('lid')), 'lid');
  assert.equal(readThemePref(fakeStorage('body')), 'body');
  assert.equal(readThemePref(fakeStorage(null)), 'system');
  assert.equal(readThemePref(fakeStorage('dark')), 'system');
  assert.equal(readThemePref({ getItem() { throw new Error('chế độ riêng tư'); } }), 'system');
  assert.equal(readThemePref(null), 'system');
});

test('chủ đề: script đầu <head> của index.html dùng cùng khóa và cùng luật với theme.js', () => {
  const html = fs.readFileSync(path.join(ROOT, 'frontend/index.html'), 'utf8');
  assert.ok(html.includes(`localStorage.getItem('${THEME_KEY}')`), 'cùng khóa localStorage');
  assert.ok(/p === 'body' \|\| p === 'lid' \? p : \(dark \? 'lid' : 'body'\)/.test(html), 'cùng luật chọn chủ đề');
  assert.ok(!/<html[^>]*data-theme=/.test(html), 'không cố định data-theme trên <html>');
});
