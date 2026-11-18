// Đường dẫn không có trong bảng route.
import { esc, icon } from '../components/dom.js';
import { pageHead } from './_shared.js';

export default {
  mount(el, { t }) {
    el.innerHTML = pageHead({ title: t('page.notFound.title'), subtitle: t('page.notFound.subtitle') })
      + `<a class="ri-btn" href="/giam-sat">${esc(t('page.notFound.back'))} ${icon('arrow-right', 'ri-icon--sm')}</a>`;
  },
  unmount() {},
};
