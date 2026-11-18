// Nav/TabBar (mobile): Giám sát · Đèn LED · Lịch sử · Telegram · Thêm.
// "Thêm" là nút mở danh sách Thiết bị & WiFi, Tài khoản (HANDOFF §2); đóng bằng Esc, bấm ra ngoài hoặc khi chuyển trang.
import { esc, icon } from './dom.js';

export function createTabbar(el, moreEl, { tabRoutes, moreRoutes, t }) {
  el.innerHTML = `
    <ul class="ri-tabbar__list">
      ${tabRoutes.map((r) => `
        <li>
          <a class="ri-tabbar__item" href="${r.path}" data-route="${r.id}">
            ${icon(r.icon)}<span>${esc(t(r.navKey))}</span>
          </a>
        </li>`).join('')}
      <li>
        <button class="ri-tabbar__item" type="button" data-more aria-expanded="false" aria-controls="${moreEl.id}">
          ${icon('ellipsis')}<span>${esc(t('nav.more'))}</span>
        </button>
      </li>
    </ul>`;

  moreEl.innerHTML = `
    <p class="ri-more__title ri-label">${esc(t('nav.more.label'))}</p>
    ${moreRoutes.map((r) => `
      <a class="ri-more__link" href="${r.path}" data-route="${r.id}">
        <span class="ri-more__num" aria-hidden="true">${r.num ?? ''}</span>
        ${icon(r.icon)}
        <span>${esc(t(r.titleKey))}</span>
      </a>`).join('')}`;
  moreEl.hidden = true;

  const links = [...el.querySelectorAll('a[data-route]'), ...moreEl.querySelectorAll('a[data-route]')];
  const moreBtn = el.querySelector('[data-more]');
  const moreIds = new Set(moreRoutes.map((r) => r.id));

  function setOpen(open, { focusButton = false } = {}) {
    moreEl.hidden = !open;
    moreBtn.setAttribute('aria-expanded', String(open));
    if (open) moreEl.querySelector('a')?.focus();
    else if (focusButton) moreBtn.focus();
  }

  moreBtn.addEventListener('click', () => setOpen(moreEl.hidden));
  moreEl.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !moreEl.hidden) setOpen(false, { focusButton: true });
  });
  document.addEventListener('pointerdown', (e) => {
    if (!moreEl.hidden && !moreEl.contains(e.target) && !moreBtn.contains(e.target)) setOpen(false);
  });

  return {
    setActive(routeId) {
      for (const a of links) {
        if (a.dataset.route === routeId) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      }
      // Đang ở một trang trong "Thêm" → tô mục Thêm (MB-13)
      moreBtn.classList.toggle('is-current', moreIds.has(routeId));
      setOpen(false);
    },
  };
}
