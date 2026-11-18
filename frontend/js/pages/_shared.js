// Phần dùng chung của các trang: tiêu đề trang, khối "đang xây dựng" cho trang tạm.
import { cells, esc } from '../components/dom.js';

/**
 * Tiêu đề trang (h1 nhận focus sau khi chuyển trang). subtitleShort: bản ngắn cho mobile (MB-xx).
 */
export function pageHead({ title, subtitle = '', subtitleShort = '' }) {
  const sub = subtitleShort && subtitleShort !== subtitle
    ? `<span class="is-long">${esc(subtitle)}</span><span class="is-short">${esc(subtitleShort)}</span>`
    : esc(subtitle);
  return `
    <header class="ri-page__head">
      <h1 class="ri-page__title" tabindex="-1">${esc(title)}</h1>
      ${subtitle ? `<p class="ri-page__subtitle">${sub}</p>` : ''}
    </header>`;
}

/** Trang tạm: cho biết trang sẽ có gì, dùng họa tiết 8 ô đang quét (ST-01). */
export function wipPanel(t, text) {
  return `
    <section class="ri-panel ri-wip" aria-label="${esc(t('wip.title'))}">
      ${cells(0, 'ri-cells--sweep')}
      <p class="ri-panel__title">${esc(t('wip.title'))}</p>
      <p class="ri-wip__text">${esc(text)}</p>
    </section>`;
}

/** Trang tạm chỉ có tiêu đề + mô tả + khối đang xây dựng. */
export function simplePage({ titleKey, subtitleKey, subtitleShortKey, wipKey }) {
  return {
    mount(el, { t }) {
      el.innerHTML = pageHead({
        title: t(titleKey),
        subtitle: subtitleKey ? t(subtitleKey) : '',
        subtitleShort: subtitleShortKey ? t(subtitleShortKey) : '',
      }) + (wipKey ? wipPanel(t, t(wipKey)) : '');
    },
    unmount() {},
  };
}
