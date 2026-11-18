// Tài khoản & phiên — trang tạm (DK-14 / MB-14, phần đăng nhập thuộc ID 8). Hiện người dùng của phiên hiện tại
// và chọn giao diện "Theo hệ điều hành / Sáng · Body / Tối · Lid" (DECISIONS D10, thuộc ID 9).
import { esc, icon, setText } from '../components/dom.js';
import { onThemeChange, setThemePref, themePref, THEME_PREFS } from '../core/theme.js';
import { pageHead, wipPanel } from './_shared.js';

let offs = [];

function themePanel(t) {
  const opt = (p) => `
    <label class="ri-themeopt">
      <input class="ri-themeopt__input" type="radio" name="theme" value="${p}">
      <span class="ri-themeopt__sample ri-themeopt__sample--${p}" aria-hidden="true">
        ${p === 'system'
          ? '<span class="ri-themeopt__half--body"><i></i></span><span class="ri-themeopt__half--lid"><i></i></span>'
          : `<span class="ri-themeopt__half--${p}"><i></i></span>`}
      </span>
      <span class="ri-themeopt__text">
        <span class="ri-themeopt__name">${esc(t(`account.theme.${p}`))}</span>
        <span class="ri-themeopt__hint">${esc(t(`account.theme.${p}Hint`))}</span>
      </span>
      ${icon('check', 'ri-themeopt__check')}
    </label>`;
  return `
    <section class="ri-panel" aria-labelledby="theme-title">
      <div class="ri-panel__head"><h2 class="ri-panel__title" id="theme-title">${esc(t('account.theme.title'))}</h2></div>
      <fieldset class="ri-themeopts">
        <legend class="ri-sr-only">${esc(t('account.theme.legend'))}</legend>
        ${THEME_PREFS.map(opt).join('')}
      </fieldset>
      <p class="ri-account__note"><span data-theme-now></span> · ${esc(t('account.theme.note'))}</p>
    </section>`;
}

export default {
  mount(el, { t, store }) {
    el.innerHTML = pageHead({ title: t('page.account.title'), subtitle: t('page.account.subtitle') }) + `
      <div class="ri-stack">
        <section class="ri-panel" aria-labelledby="acc-title">
          <div class="ri-panel__head"><h2 class="ri-panel__title" id="acc-title">${esc(t('account.signedInAs'))}</h2></div>
          <p class="ri-account">${icon('user')}<span class="ri-account__name" data-user>—</span></p>
          <p class="ri-account__note" data-note hidden>${esc(t('account.authOff'))}</p>
        </section>
        ${themePanel(t)}
        ${wipPanel(t, t('wip.account'))}
      </div>`;
    const userEl = el.querySelector('[data-user]');
    const noteEl = el.querySelector('[data-note]');
    offs.push(store.subscribe((s) => s.session, (session) => {
      setText(userEl, session?.user?.username ?? '—');
      noteEl.hidden = !session || session.authEnabled;
    }));

    const nowEl = el.querySelector('[data-theme-now]');
    const sync = (pref) => {
      for (const input of el.querySelectorAll('input[name="theme"]')) input.checked = input.value === pref;
      const theme = t(`account.theme.${document.documentElement.dataset.theme === 'lid' ? 'lid' : 'body'}`);
      setText(nowEl, t(pref === 'system' ? 'account.theme.nowSystem' : 'account.theme.now', { theme }));
    };
    el.querySelector('.ri-themeopts').addEventListener('change', (e) => {
      if (e.target.name === 'theme') setThemePref(e.target.value);
    });
    sync(themePref());
    offs.push(onThemeChange(sync));
  },
  unmount() {
    for (const off of offs) off?.();
    offs = [];
  },
};
