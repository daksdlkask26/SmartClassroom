// Tài khoản & phiên — trang tạm (DK-14 / MB-14 thuộc ID 8). Hiện người dùng của phiên hiện tại.
import { esc, icon, setText } from '../components/dom.js';
import { pageHead, wipPanel } from './_shared.js';

let off = null;

export default {
  mount(el, { t, store }) {
    el.innerHTML = pageHead({ title: t('page.account.title'), subtitle: t('page.account.subtitle') }) + `
      <div class="ri-stack">
        <section class="ri-panel" aria-labelledby="acc-title">
          <div class="ri-panel__head"><h2 class="ri-panel__title" id="acc-title">${esc(t('account.signedInAs'))}</h2></div>
          <p class="ri-account">${icon('user')}<span class="ri-account__name" data-user>—</span></p>
          <p class="ri-account__note" data-note hidden>${esc(t('account.authOff'))}</p>
        </section>
        ${wipPanel(t, t('wip.account'))}
      </div>`;
    const userEl = el.querySelector('[data-user]');
    const noteEl = el.querySelector('[data-note]');
    off = store.subscribe((s) => s.session, (session) => {
      setText(userEl, session?.user?.username ?? '—');
      noteEl.hidden = !session || session.authEnabled;
    });
  },
  unmount() {
    off?.();
    off = null;
  },
};
