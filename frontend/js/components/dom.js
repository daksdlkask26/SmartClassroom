// Tiện ích dựng HTML nhỏ. Mọi giá trị từ dữ liệu (bản tin, tên người dùng, chuỗi) đều qua esc().

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
}

/** Biểu tượng Lucide từ sprite; luôn aria-hidden (chữ đi kèm mới là nhãn). */
export function icon(name, cls = '') {
  return `<svg class="ri-icon${cls ? ` ${cls}` : ''}" aria-hidden="true" focusable="false"><use href="/icons/sprite.svg#i-${esc(name)}"></use></svg>`;
}

/** 8 ô của họa tiết LED. on: số ô đặc tính từ trái (hoặc mảng chỉ số). */
export function cells(on = 0, cls = '') {
  let s = '';
  for (let i = 0; i < 8; i++) {
    const lit = Array.isArray(on) ? on.includes(i) : i < on;
    s += `<i style="--i:${i}"${lit ? ' class="is-on"' : ''}></i>`;
  }
  return `<span class="ri-cells${cls ? ` ${cls}` : ''}" aria-hidden="true">${s}</span>`;
}

/** Ghi textContent chỉ khi đổi, tránh làm trình đọc màn hình đọc lại. */
export function setText(el, text) {
  if (el && el.textContent !== text) el.textContent = text;
}
