#!/usr/bin/env node
// Kiểm tra giao diện web tự động (plan.md mục 11.2) bằng Chrome headless qua DevTools Protocol.
// Không thêm phụ thuộc: dùng Chrome có sẵn trên máy + WebSocket của Node (Node 22) hoặc gói `ws` của server/.
//
//   node tools/verify-web.cjs                       tự chạy broker + giả lập + backend riêng (cổng 1884 / 3100)
//   node tools/verify-web.cjs --url http://localhost:3000   dùng backend đang chạy (bỏ qua phần thanh trạng thái)
//   node tools/verify-web.cjs --only layout,contrast        chỉ chạy một số nhóm
//   node tools/verify-web.cjs --shots D:/tmp/shots          lưu ảnh chụp từng trang / khổ / chủ đề
//   node tools/verify-web.cjs --only layout --widths 320,1440  chỉ một số khổ màn hình
//
// Nhóm kiểm tra:
//   layout    320 · 390 · 768 · 1280 · 1440 · 1920, hai chủ đề: không cuộn ngang, không phần tử tràn màn hình / panel
//   contrast  hai chủ đề: chữ ≥ 4,5:1 (chữ lớn ≥ 3:1) so với nền thật phía sau (HANDOFF §5 mục 6)
//   theme     Theo hệ điều hành / Sáng · Body / Tối · Lid: đặt đúng data-theme, nhớ qua lần tải lại
//   keys      Tab qua mọi trang: focus nhìn thấy, nằm trong màn hình · trang Đèn LED: Enter / Space / Esc
//   motion    prefers-reduced-motion: không còn hiệu ứng nào chạy
//   touch     390 px: vùng bấm ≥ 44 × 44 (tính cả vùng nới bằng ::before)
//   status    thanh trạng thái: Trực tuyến → Thiết bị ngoại tuyến (LWT) → Mất kết nối máy chủ
//   console   không có lỗi JS / console.error ở bất kỳ bước nào (luôn bật)
//
// Thoát với mã 1 khi có lỗi. Chrome: đặt CHROME_PATH nếu không nằm ở chỗ mặc định.
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { createRequire } = require('node:module');
const { parseArgs } = require('node:util');

const REPO = path.resolve(__dirname, '..');
const SERVER = path.join(REPO, 'server');
const GROUPS = ['layout', 'contrast', 'theme', 'keys', 'motion', 'touch', 'status'];
const PAGES = ['/giam-sat', '/den-led', '/lich-su', '/telegram', '/thiet-bi', '/tai-khoan', '/dang-nhap'];
const ALL_WIDTHS = [320, 390, 768, 1280, 1440, 1920];
const THEMES = ['body', 'lid'];

const { values: args } = parseArgs({
  options: {
    url: { type: 'string' },
    only: { type: 'string' },
    shots: { type: 'string' },
    port: { type: 'string', default: '3100' },
    'broker-port': { type: 'string', default: '1884' },
    widths: { type: 'string' },
    help: { type: 'boolean', short: 'h' },
  },
});
if (args.help) {
  console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 23).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(0);
}
const only = new Set(args.only ? args.only.split(',').map((s) => s.trim()) : GROUPS);
for (const g of only) if (!GROUPS.includes(g)) { console.error(`Nhóm không có: ${g}. Chọn trong: ${GROUPS.join(', ')}`); process.exit(2); }
const WIDTHS = args.widths ? args.widths.split(',').map(Number) : ALL_WIDTHS;
if (args.url && only.has('status')) only.delete('status'); // không điều khiển được thiết bị của backend người khác

const WS = globalThis.WebSocket ?? createRequire(path.join(SERVER, 'package.json'))('ws');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function findChrome() {
  const list = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    path.join(os.homedir(), 'AppData/Local/Google/Chrome/Application/chrome.exe'),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ].filter(Boolean);
  const found = list.find((p) => fs.existsSync(p));
  if (!found) throw new Error('Không tìm thấy Chrome. Đặt biến CHROME_PATH tới chrome.exe');
  return found;
}

// ---------------------------------------------------------------- kết quả
const fails = [];
let passCount = 0;
const pass = () => { passCount++; };
const fail = (group, where, detail) => { fails.push(`[${group}] ${where}: ${detail}`); };
const section = (name) => console.log(`\n▸ ${name}`);

// ---------------------------------------------------------------- bộ chạy riêng
const procs = [];
let tmpData = null;
function startNode(args2, env) {
  const p = spawn(process.execPath, args2, { cwd: SERVER, env: { ...process.env, ...env }, stdio: 'ignore', windowsHide: true });
  procs.push(p);
  return p;
}
const stop = (p) => new Promise((r) => { if (!p || p.exitCode !== null || p.signalCode) return r(); p.once('exit', r); p.kill(); });

async function startStack() {
  const bp = args['broker-port']; const port = args.port;
  tmpData = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-verify-web-'));
  const env = {
    PORT: port, MQTT_URL: `mqtt://localhost:${bp}`, MODE: 'sim', DATA_DIR: tmpData, LOG_READINGS: 'false',
    PLUGINS_DISABLED: 'firestore,telegram', HISTORY_SEED_HOURS: '24', AUTH_ENABLED: 'false',
  };
  const broker = startNode(['scripts/dev-broker.js', '--port', bp], env);
  await wait(800);
  const sim = startNode(['scripts/sim-esp32.js', '--url', `mqtt://localhost:${bp}`, '--interval', '3'], env);
  const server = startNode(['src/index.js'], env);
  const base = `http://localhost:${port}`;
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`${base}/api/health`)).ok) break; } catch { /* chưa lên */ }
    await wait(100);
  }
  if (server.exitCode !== null) throw new Error(`Backend không chạy được ở cổng ${port} (cổng đã có chương trình khác?)`);
  await wait(1500); // chờ bản tin giả lập đầu tiên
  return { base, broker, sim, server };
}

// ---------------------------------------------------------------- Chrome
async function openChrome() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-verify-chrome-'));
  const browser = spawn(findChrome(), ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-extensions', '--disable-sync', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'],
  { stdio: 'ignore', windowsHide: true });
  const pf = path.join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 150 && !fs.existsSync(pf); i++) await wait(100);
  if (!fs.existsSync(pf)) throw new Error('Chrome không khởi động được');
  const port = fs.readFileSync(pf, 'utf8').split('\n')[0];
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const sock = new WS(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((res, rej) => { sock.addEventListener('open', res, { once: true }); sock.addEventListener('error', rej, { once: true }); });
  let id = 0; const pend = new Map(); const errors = [];
  sock.addEventListener('message', (e) => {
    const m = JSON.parse(typeof e.data === 'string' ? e.data : e.data.toString());
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); return; }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description).join(' '));
  });
  const call = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); sock.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expr) => {
    const r = await call('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails.text);
    return r.result?.result?.value;
  };
  await call('Page.enable'); await call('Runtime.enable');
  return {
    call, ev, errors,
    async close() { try { sock.close(); } catch { /* */ } browser.kill(); await wait(300); fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3 }); },
  };
}

// ---------------------------------------------------------------- hàm chạy trong trang
// Phần tử tràn khỏi màn hình hoặc panel (bỏ qua vùng tự cuộn ngang).
const OVERFLOW_JS = `(() => {
  const vw = document.documentElement.clientWidth; const bad = [];
  const scrolls = (el) => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll') return true; } return false; };
  const name = (el) => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\\s+/)[0] : '');
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1 || el.closest('[hidden], .ri-sr-only') || getComputedStyle(el).visibility === 'hidden') continue;
    if (scrolls(el)) continue;
    if (r.right > vw + 1 || r.left < -1) { bad.push('ra ngoài màn hình ' + name(el)); continue; }
    const panel = el.parentElement?.closest('.ri-panel');
    if (panel && r.right > panel.getBoundingClientRect().right + 1) bad.push('tràn panel ' + (panel.getAttribute('aria-labelledby') || name(panel)) + ' › ' + name(el)
      + ' "' + el.textContent.replace(/\\s+/g, ' ').trim().slice(0, 16) + '" +' + Math.round(r.right - panel.getBoundingClientRect().right) + 'px');
    if (bad.length >= 5) break;
  }
  return { scrollW: document.documentElement.scrollWidth, vw, bad };
})()`;

// Tương phản chữ: màu chữ so với nền thật (ghép các lớp nền trong suốt từ phần tử lên tới gốc).
const CONTRAST_JS = `(() => {
  const parse = (s) => { const m = s.match(/rgba?\\(([^)]+)\\)/); if (!m) return null;
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const over = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 });
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const bgOf = (el) => { const layers = []; let uncertain = false;
    for (let p = el; p; p = p.parentElement) { const cs = getComputedStyle(p);
      if (cs.backgroundImage !== 'none' && p !== document.documentElement) uncertain = true;
      const c = parse(cs.backgroundColor); if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; } }
    let base = { r: 255, g: 255, b: 255, a: 1 }; for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
    return { bg: base, uncertain }; };
  const bad = []; let checked = 0;
  for (const el of document.querySelectorAll('body *')) {
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!own) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || el.closest('[hidden], .ri-sr-only, [aria-hidden="true"] .ri-sr-only')) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || el.closest(':disabled, [aria-disabled="true"]')) continue; // WCAG miễn cho nút bị khóa
    let op = 1; for (let p = el; p; p = p.parentElement) op *= Number(getComputedStyle(p).opacity); if (op < 0.1) continue;
    const isSvg = el instanceof SVGElement;
    const fg = parse(isSvg ? cs.fill : cs.color); if (!fg || fg.a === 0) continue;
    let { bg, uncertain } = bgOf(isSvg ? el.ownerSVGElement ?? el : el);
    if (isSvg) { // chữ SVG nằm trên hình SVG (nắp Device Twin, ô nhãn): lấy màu tô của hình ngay dưới tâm chữ
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const under = document.elementsFromPoint(cx, cy).find((x) => x !== el && x instanceof SVGGeometryElement);
      const f = under && parse(getComputedStyle(under).fill);
      if (f && f.a > 0) bg = f.a < 1 ? over(f, bg) : f;
    }
    if (uncertain) continue; // nền họa tiết / ảnh: không đo tự động được
    const size = parseFloat(cs.fontSize); const weight = Number(cs.fontWeight) || 400;
    const need = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
    const got = ratio(fg.a < 1 ? over(fg, bg) : fg, bg); checked++;
    if (got + 0.005 < need) {
      const txt = el.textContent.replace(/\\s+/g, ' ').trim().slice(0, 28);
      bad.push(el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\\s+/)[0] : '') + ' "' + txt + '" ' + got.toFixed(2) + ':1 (cần ' + need + ')');
    }
  }
  return { checked, bad: [...new Set(bad)] };
})()`;

// Vùng bấm thật = khung phần tử, nới thêm theo ::before / ::after đặt position:absolute.
const TOUCH_JS = `(() => {
  const out = [];
  const els = [...document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, [role="switch"], [tabindex="0"], label:has(input)')]
    .filter((e) => e.getClientRects().length && !e.closest('[hidden]') && !e.classList.contains('ri-skip') && getComputedStyle(e).visibility !== 'hidden');
  for (const e of els) {
    if (e.matches('input') && e.closest('label') && els.includes(e.closest('label'))) continue; // nhãn bọc ô nhập đã tính
    if (e.matches('input[type=radio], input[type=checkbox]') && getComputedStyle(e).opacity === '0') continue;
    const r = e.getBoundingClientRect(); let w = r.width, h = r.height;
    for (const pe of ['::before', '::after']) { const cs = getComputedStyle(e, pe);
      if (cs.content === 'none' || cs.position !== 'absolute') continue;
      const n = (v) => (v.endsWith('px') ? parseFloat(v) : 0);
      w = Math.max(w, r.width - n(cs.left) - n(cs.right)); h = Math.max(h, r.height - n(cs.top) - n(cs.bottom)); }
    if (w < 43.5 || h < 43.5) out.push(e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0] + ' "' + (e.getAttribute('aria-label') || e.textContent).replace(/\\s+/g, ' ').trim().slice(0, 24) + '" ' + Math.round(w) + '×' + Math.round(h));
  }
  return [...new Set(out)];
})()`;

const FOCUS_JS = `(() => { const e = document.activeElement; if (!e || e === document.body) return null;
  const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
  const ringOn = (x) => { const c = getComputedStyle(x); return (c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0) || (c.boxShadow && c.boxShadow !== 'none'); };
  // radio ẩn: vòng focus vẽ trên nhãn bọc ngoài (:has(:focus-visible))
  const ring = ringOn(e) || (e.matches('input') && e.closest('label') && ringOn(e.closest('label')));
  const box = e.matches('input') && e.closest('label') ? e.closest('label').getBoundingClientRect() : r;
  const label = (e.getAttribute('aria-label') || e.textContent || e.value || '').replace(/\\s+/g, ' ').trim().slice(0, 30);
  return { key: e.tagName + '|' + label + '|' + Math.round(box.left) + ',' + Math.round(box.top + scrollY), d: e.tagName.toLowerCase() + ' "' + label + '"',
    ring, visible: box.bottom > 0 && box.top < innerHeight && box.width > 0 }; })()`;

// ---------------------------------------------------------------- các nhóm
async function main() {
  const stack = args.url ? null : await startStack();
  const base = (args.url ?? stack.base).replace(/\/$/, '');
  const shotsDir = args.shots ? path.resolve(args.shots) : null;
  if (shotsDir) fs.mkdirSync(shotsDir, { recursive: true });
  console.log(`Kiểm tra ${base} · nhóm: ${[...only].join(', ')}${shotsDir ? ` · ảnh: ${shotsDir}` : ''}`);

  const c = await openChrome();
  const { call, ev } = c;
  const viewport = (w, h = w < 768 ? 844 : 1000) => call('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 });
  const media = (features) => call('Emulation.setEmulatedMedia', { features });
  // Đặt lựa chọn chủ đề rồi tải trang (script đầu <head> đọc localStorage như người dùng thật)
  const setPref = (pref) => ev(`(() => { try { ${pref ? `localStorage.setItem('sc.theme', '${pref}')` : "localStorage.removeItem('sc.theme')"} } catch (e) {} return true; })()`);
  const go = async (p, ms = 1500) => {
    await call('Page.navigate', { url: base + p });
    for (let i = 0; i < 40; i++) { if (await ev(`document.readyState === 'complete' && !!document.querySelector('#page .ri-page__head')`).catch(() => false)) break; await wait(100); }
    await ev('document.fonts.ready.then(() => true)'); await wait(ms);
  };
  const shot = async (name) => {
    if (!shotsDir) return;
    const h = await ev('document.documentElement.scrollHeight');
    const w = await ev('document.documentElement.clientWidth');
    const r = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: Math.min(h, 4000), scale: 1 } });
    fs.writeFileSync(path.join(shotsDir, `${name}.png`), Buffer.from(r.result.data, 'base64'));
  };
  const key = async (k, code, vk, mods = 0) => {
    const text = k === 'Enter' ? '\r' : k === ' ' ? ' ' : undefined;
    await call('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code, windowsVirtualKeyCode: vk, modifiers: mods, ...(text ? { text } : {}) });
    await call('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: vk, modifiers: mods });
  };
  const views = (p) => (p === '/den-led' ? ['auto', 'test'] : [null]);
  const openView = async (v) => { if (v) { await ev(`document.querySelector('[data-tab="${v}"]')?.click()`); await wait(250); } };

  await call('Page.navigate', { url: base + '/giam-sat' }); await wait(500);

  // ---------- theme ----------
  if (only.has('theme')) {
    section('Chủ đề: Theo hệ điều hành · Sáng · Body · Tối · Lid');
    await viewport(1440);
    for (const [pref, osDark, want] of [[null, false, 'body'], [null, true, 'lid'], ['body', true, 'body'], ['lid', false, 'lid']]) {
      await media([{ name: 'prefers-color-scheme', value: osDark ? 'dark' : 'light' }]);
      await setPref(pref); await go('/giam-sat', 300);
      const got = await ev('document.documentElement.dataset.theme');
      const label = `lựa chọn ${pref ?? 'hệ điều hành'}, máy ${osDark ? 'tối' : 'sáng'}`;
      if (got === want) pass(); else fail('theme', label, `data-theme="${got}", cần "${want}"`);
      console.log(`  ${got === want ? '✓' : '✗'} ${label} → ${got}`);
    }
    // Đổi ở trang Tài khoản → áp ngay, nhớ sau khi tải lại, "Theo hệ điều hành" xóa lựa chọn
    await media([{ name: 'prefers-color-scheme', value: 'light' }]); await setPref(null);
    await go('/tai-khoan', 300);
    const steps = [];
    await ev(`document.querySelector('input[name="theme"][value="lid"]').click()`); await wait(100);
    steps.push(['bấm Tối · Lid', await ev('document.documentElement.dataset.theme'), 'lid']);
    await go('/tai-khoan', 300);
    steps.push(['tải lại trang', await ev('document.documentElement.dataset.theme + (document.querySelector(\'input[value="lid"]\').checked ? "" : " (ô Lid chưa chọn)")'), 'lid']);
    await ev(`document.querySelector('input[name="theme"][value="system"]').click()`); await wait(100);
    steps.push(['bấm Theo hệ điều hành (máy sáng)', await ev(`document.documentElement.dataset.theme + (localStorage.getItem('sc.theme') ? ' (còn lưu)' : '')`), 'body']);
    for (const [label, got, want] of steps) {
      if (got === want) pass(); else fail('theme', label, `${got}, cần ${want}`);
      console.log(`  ${got === want ? '✓' : '✗'} Tài khoản: ${label} → ${got}`);
    }
  }

  // ---------- layout + contrast ----------
  if (only.has('layout') || only.has('contrast')) {
    section(`Bố cục${only.has('contrast') ? ' + tương phản' : ''}: ${WIDTHS.join(' · ')} px × ${THEMES.join(' / ')}`);
    await media([]);
    for (const theme of THEMES) {
      await setPref(theme);
      for (const w of WIDTHS) {
        if (!only.has('layout') && ![390, 1440].includes(w)) continue;
        await viewport(w);
        const lines = [];
        for (const p of PAGES) {
          await go(p, 900);
          for (const v of views(p)) {
            await openView(v);
            const where = `${theme} ${w}px ${p}${v ? `:${v}` : ''}`;
            if (only.has('layout')) {
              const o = await ev(OVERFLOW_JS);
              const probs = [...(o.scrollW > o.vw ? [`cuộn ngang ${o.scrollW}/${o.vw}`] : []), ...o.bad];
              if (probs.length) { fail('layout', where, probs.join(' · ')); lines.push(`✗ ${p}${v ? `:${v}` : ''} ${probs.join(' · ')}`); } else pass();
            }
            if (only.has('contrast') && [390, 1440].includes(w)) {
              const r = await ev(CONTRAST_JS);
              if (r.bad.length) { fail('contrast', where, r.bad.join(' | ')); lines.push(`✗ tương phản ${p}${v ? `:${v}` : ''}: ${r.bad.slice(0, 4).join(' | ')}`); } else pass();
            }
            await shot(`${theme}-${w}-${p.slice(1)}${v ? `-${v}` : ''}`);
          }
        }
        console.log(`  ${lines.length ? '✗' : '✓'} ${theme} ${w}px${lines.length ? '\n     ' + lines.join('\n     ') : ''}`);
      }
    }
    await setPref(null);
  }

  // ---------- keys ----------
  if (only.has('keys')) {
    section('Bàn phím: Tab qua từng trang (1440 · 390), trang Đèn LED: Enter / Space / Esc');
    await media([]); await setPref(null);
    for (const w of [1440, 390]) {
      await viewport(w);
      for (const p of PAGES) {
        await go(p, 700);
        const total = await ev(`[...document.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')]
          .filter((e) => e.getClientRects().length && !e.closest('[hidden]') && getComputedStyle(e).visibility !== 'hidden').length`);
        const seen = new Set(); const probs = new Set(); let steps = 0;
        for (; steps < total + 20; steps++) {
          await key('Tab', 'Tab', 9); await wait(20);
          const f = await ev(FOCUS_JS);
          if (!f) continue;
          if (seen.has(f.key) && seen.size >= total) break;
          seen.add(f.key);
          if (!f.ring) probs.add(`${f.d} không có vòng focus`);
          if (!f.visible) probs.add(`${f.d} nằm ngoài màn hình khi focus`);
        }
        const where = `${w}px ${p}`;
        if (probs.size) { fail('keys', where, [...probs].join(' · ')); console.log(`  ✗ ${where} (${seen.size} chỗ): ${[...probs].slice(0, 4).join(' · ')}`); } else { pass(); console.log(`  ✓ ${where}: Tab qua ${seen.size} chỗ, focus đều nhìn thấy`); }
      }
      // Đèn LED: Enter mở hàng mức → Tab vào ô màu → Space chọn → Esc đóng, focus về hàng
      await go('/den-led', 900);
      await ev(`(() => { const c = document.querySelector('[data-card="humidity"]'); if (c?.classList.contains('is-collapsed')) c.querySelector('[data-toggle]').click();
        document.querySelector('[data-level="humidity:watch"]').focus(); })()`);
      await key('Enter', 'Enter', 13); await wait(150);
      const opened = await ev(`document.querySelector('[data-level="humidity:watch"]').getAttribute('aria-expanded') === 'true'`);
      await key('Tab', 'Tab', 9); await key('Tab', 'Tab', 9); await wait(60);
      await key(' ', 'Space', 32); await wait(150);
      const draft = await ev(`document.querySelector('#page [data-bar] [data-status]')?.textContent.trim() ?? ''`);
      await key('Escape', 'Escape', 27); await wait(150);
      const closed = await ev(`({ shut: document.querySelector('[data-level="humidity:watch"]').getAttribute('aria-expanded') === 'false', back: document.activeElement?.dataset.level === 'humidity:watch' })`);
      const ok = opened && /1 thay đổi chưa gửi/.test(draft) && closed.shut && closed.back;
      const where = `${w}px /den-led Enter/Space/Esc`;
      if (ok) pass(); else fail('keys', where, `mở ${opened} · nháp "${draft}" · đóng ${closed.shut} · focus về hàng ${closed.back}`);
      console.log(`  ${ok ? '✓' : '✗'} ${where}: "${draft}"`);
    }
  }

  // ---------- motion ----------
  if (only.has('motion')) {
    section('Giảm chuyển động (prefers-reduced-motion: reduce)');
    await viewport(1440); await setPref(null);
    await media([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    for (const p of PAGES) {
      await call('Page.navigate', { url: base + p }); await wait(250);
      await ev(`document.querySelector('[data-level="humidity:watch"]')?.click()`); await wait(60);
      const running = await ev(`document.getAnimations().filter((a) => { const d = a.effect?.getTiming().duration; return typeof d === 'number' && d > 0 && a.playState === 'running'; })
        .map((a) => (a.animationName || a.transitionProperty || 'anim') + ' ' + (a.effect?.target?.className?.toString?.().split(' ')[0] ?? ''))`);
      if (running.length) { fail('motion', p, running.slice(0, 4).join(' · ')); console.log(`  ✗ ${p}: ${running.slice(0, 4).join(' · ')}`); } else { pass(); console.log(`  ✓ ${p}: không có hiệu ứng`); }
    }
    await media([]);
  }

  // ---------- touch ----------
  if (only.has('touch')) {
    section('Vùng bấm ≥ 44 px ở 390 px');
    await viewport(390); await setPref(null);
    for (const p of PAGES) {
      await go(p, 700);
      for (const v of views(p)) {
        await openView(v);
        if (p === '/den-led' && v === 'auto') {
          await ev(`(() => { const c = document.querySelector('[data-card="humidity"]'); if (c?.classList.contains('is-collapsed')) c.querySelector('[data-toggle]').click();
            document.querySelector('[data-level="humidity:watch"]')?.click(); })()`); await wait(200);
        }
        const small = await ev(TOUCH_JS);
        const where = `${p}${v ? `:${v}` : ''}`;
        if (small.length) { fail('touch', where, small.join(' | ')); console.log(`  ✗ ${where}: ${small.slice(0, 5).join(' | ')}`); } else { pass(); console.log(`  ✓ ${where}`); }
      }
    }
  }

  // ---------- status ----------
  if (only.has('status') && stack) {
    section('Thanh trạng thái: Trực tuyến → Thiết bị ngoại tuyến (LWT) → Mất kết nối máy chủ');
    await viewport(1440); await setPref(null);
    await go('/giam-sat', 1500);
    const cls = () => ev(`[...document.getElementById('statusbar').classList].find((c) => c.startsWith('ri-statusbar--'))`);
    const until = async (want, ms) => { for (let i = 0; i < ms / 100; i++) { if (await cls() === want) return true; await wait(100); } return false; };
    const step = async (label, want, ms) => {
      const ok = await until(`ri-statusbar--${want}`, ms);
      const got = await cls();
      if (ok) pass(); else fail('status', label, `${got}, cần ri-statusbar--${want}`);
      console.log(`  ${ok ? '✓' : '✗'} ${label} → ${got}`);
    };
    await step('giả lập đang gửi', 'online', 5000);
    stack.sim.kill(); // như rút điện: broker phát LWT {"online":false}
    await step('tắt hẳn giả lập (LWT)', 'offline', 8000);
    await stop(stack.server);
    await step('tắt backend', 'disconnected', 8000);
  }

  // ---------- console ----------
  section('Lỗi trình duyệt');
  // Mất kết nối WebSocket khi cố ý tắt backend ở nhóm status là bình thường
  const errs = c.errors.filter((e) => !(only.has('status') && /WebSocket|ERR_CONNECTION_REFUSED|Failed to fetch/i.test(e)));
  if (errs.length) { fail('console', 'trình duyệt', [...new Set(errs)].slice(0, 5).join(' | ')); console.log(`  ✗ ${[...new Set(errs)].slice(0, 5).join('\n    ')}`); } else { pass(); console.log('  ✓ không có lỗi'); }

  await c.close();
}

main()
  .catch((err) => { fails.push(`[lỗi chạy] ${err.stack ?? err.message}`); })
  .finally(async () => {
    for (const p of procs) await stop(p);
    if (tmpData) fs.rmSync(tmpData, { recursive: true, force: true });
    console.log(`\n${fails.length ? '✗' : '✓'} ${passCount} đạt · ${fails.length} lỗi`);
    if (fails.length) console.log(fails.map((f) => `  - ${f}`).join('\n'));
    process.exit(fails.length ? 1 : 0);
  });
