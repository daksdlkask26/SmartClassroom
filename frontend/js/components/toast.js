// Toast Sent / Failed (HANDOFF §2, §3.11). Failed dùng role="alert", còn lại role="status".
// Cùng một `id` thì thay thế toast cũ thay vì xếp chồng (ví dụ lỗi WebSocket lặp lại khi thử lại).
import { esc, icon } from './dom.js';

let host = null;
let closeLabel = 'Đóng';

export function initToasts(el, { t }) {
  host = el;
  closeLabel = t('toast.close');
}

/**
 * @param {object} opts
 * @param {'sent'|'failed'|'info'} [opts.kind]
 * @param {string} opts.title
 * @param {string} [opts.body]
 * @param {string} [opts.id]          khóa để thay thế / gỡ sau
 * @param {number} [opts.timeoutMs]   0 = giữ đến khi đóng
 */
export function showToast({ kind = 'info', title, body = '', id, timeoutMs = 6000 }) {
  if (!host) return null;
  if (id) dismissToast(id);

  const el = document.createElement('div');
  el.className = `ri-toast ri-toast--${kind}`;
  el.setAttribute('role', kind === 'failed' ? 'alert' : 'status');
  if (id) el.dataset.toast = id;
  const iconName = kind === 'failed' ? 'triangle-alert' : kind === 'sent' ? 'send' : 'clock';
  el.innerHTML = `
    ${icon(iconName)}
    <p class="ri-toast__title">${esc(title)}</p>
    ${body ? `<p class="ri-toast__body">${esc(body)}</p>` : ''}
    <button class="ri-toast__close" type="button" aria-label="${esc(closeLabel)}">${icon('x', 'ri-icon--sm')}</button>`;
  el.querySelector('.ri-toast__close').addEventListener('click', () => el.remove());
  host.append(el);
  if (timeoutMs > 0) setTimeout(() => el.remove(), timeoutMs);
  return el;
}

export function dismissToast(id) {
  host?.querySelector(`[data-toast="${CSS.escape(id)}"]`)?.remove();
}
