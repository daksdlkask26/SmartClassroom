// Nav/Rail (desktop, tablet): 8 ô + tên sản phẩm · 5 mục đánh số · tài khoản ở chân rail.
import { esc, icon } from './dom.js';

export function createRail(el, { routes, t }) {
  el.innerHTML = `
    <a class="ri-rail__brand" href="/giam-sat" aria-label="${esc(t('app.name'))} · ${esc(t('nav.monitor'))}">
      <span class="ri-rail__mark" aria-hidden="true">${'<span></span>'.repeat(8)}</span>
      <span class="ri-rail__name">${esc(t('app.brand'))}</span>
      <span class="ri-rail__tagline">${esc(t('app.tagline'))}</span>
    </a>
    <ol class="ri-rail__list">
      ${routes.map((r) => `
        <li>
          <a class="ri-rail__item" href="${r.path}" data-route="${r.id}" title="${esc(t(r.navKey))}">
            <span class="ri-rail__num" aria-hidden="true">${r.num}</span>
            ${icon(r.icon)}
            <span class="ri-rail__text">${esc(t(r.navKey))}</span>
          </a>
        </li>`).join('')}
    </ol>
    <div class="ri-rail__foot">
      <a class="ri-rail__account" href="/tai-khoan" data-route="account" title="${esc(t('nav.account'))}">
        ${icon('user')}
        <span class="ri-rail__who">
          <span class="ri-rail__user" data-user>—</span>
          <span class="ri-rail__sub">${esc(t('nav.account'))}</span>
        </span>
      </a>
      <a class="ri-rail__logout" href="/dang-nhap" title="${esc(t('nav.logout'))}">
        ${icon('log-out')}
        <span class="ri-rail__logout-text">${esc(t('nav.logout'))}</span>
      </a>
    </div>`;

  const links = [...el.querySelectorAll('[data-route]')];
  const userEl = el.querySelector('[data-user]');

  return {
    setActive(routeId) {
      for (const a of links) {
        if (a.dataset.route === routeId) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      }
    },
    setUser(username) {
      userEl.textContent = username || '—';
    },
  };
}
