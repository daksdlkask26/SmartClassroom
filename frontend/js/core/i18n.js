// Chuỗi giao diện: frontend/strings/vi.json (khóa theo HANDOFF §5). Không viết cứng chuỗi trong component.

let dict = {};

export async function loadStrings(url = '/strings/vi.json') {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Không tải được chuỗi giao diện (HTTP ${res.status})`);
  dict = await res.json();
}

/** Dùng trong kiểm thử, hoặc khi đã có sẵn bảng chuỗi. */
export function setStrings(strings) {
  dict = { ...strings };
}

/**
 * t('status.online.detail', { n: 3 }) → "Cập nhật 3 giây trước".
 * Thiếu khóa: trả lại chính khóa (dễ thấy khi soát giao diện), không ném lỗi.
 */
export function t(key, params) {
  const s = dict[key];
  if (typeof s !== 'string') {
    if (typeof console !== 'undefined') console.warn(`[i18n] thiếu chuỗi "${key}"`);
    return key;
  }
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (m, name) => (name in params ? String(params[name]) : m));
}
