// Chủ đề giao diện (DECISIONS D10, KE_HOACH §5.1): "Theo hệ điều hành" (mặc định) · "Sáng · Body" · "Tối · Lid".
// Lựa chọn lưu trên trình duyệt này (localStorage), không gửi lên máy chủ. Không đọc được bộ nhớ thì theo hệ điều hành.
//
// Luôn đặt data-theme="body" hoặc "lid" trên <html>, kể cả khi theo hệ điều hành, để tokens.css dùng đúng bộ
// màu nhấn của mặt tối ([data-theme="lid"]). Bản sao rút gọn của resolveTheme nằm trong <head> của index.html
// để trang không chớp sáng trước khi JS chạy: sửa ở đây thì sửa cả ở đó.

export const THEME_KEY = 'sc.theme';
export const THEME_PREFS = ['system', 'body', 'lid'];
const DARK_QUERY = '(prefers-color-scheme: dark)';

/** 'system' | 'body' | 'lid' + hệ điều hành đang tối? → 'body' | 'lid' */
export function resolveTheme(pref, systemDark) {
  if (pref === 'body' || pref === 'lid') return pref;
  return systemDark ? 'lid' : 'body';
}

export function readThemePref(storage = safeStorage()) {
  try {
    const v = storage?.getItem(THEME_KEY);
    return THEME_PREFS.includes(v) ? v : 'system';
  } catch {
    return 'system';
  }
}

function safeStorage() {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}

const systemDark = () => Boolean(globalThis.matchMedia?.(DARK_QUERY).matches);

/** Áp chủ đề lên <html>. Trả về chủ đề thật đang dùng. */
export function applyTheme(pref = readThemePref(), root = document.documentElement) {
  const theme = resolveTheme(pref, systemDark());
  if (root.dataset.theme !== theme) root.dataset.theme = theme;
  return theme;
}

/** Người dùng chọn ở trang Tài khoản. */
export function setThemePref(pref) {
  const p = THEME_PREFS.includes(pref) ? pref : 'system';
  try {
    if (p === 'system') safeStorage()?.removeItem(THEME_KEY);
    else safeStorage()?.setItem(THEME_KEY, p);
  } catch { /* chế độ riêng tư: vẫn đổi được trong phiên này */ }
  current = p;
  applyTheme(p);
  for (const fn of listeners) fn(p);
  return p;
}

let current = null;
const listeners = new Set();

/** Lựa chọn hiện tại (kể cả khi bộ nhớ không ghi được). */
export function themePref() {
  return current ?? readThemePref();
}

/** Nghe đổi lựa chọn. Trả về hàm hủy. */
export function onThemeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Gọi một lần khi khởi động: áp chủ đề, theo dõi hệ điều hành đổi sáng/tối, và tab khác đổi lựa chọn. */
export function initTheme() {
  current = readThemePref();
  applyTheme(current);
  globalThis.matchMedia?.(DARK_QUERY).addEventListener?.('change', () => {
    if (themePref() === 'system') applyTheme('system');
    for (const fn of listeners) fn(themePref());
  });
  globalThis.addEventListener?.('storage', (e) => {
    if (e.key !== THEME_KEY) return;
    current = readThemePref();
    applyTheme(current);
    for (const fn of listeners) fn(current);
  });
}
