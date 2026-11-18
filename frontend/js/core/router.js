// Router phía trình duyệt bằng History API, đường dẫn tiếng Việt (plan.md 8.3):
// /giam-sat · /den-led · /lich-su?chi-so=do-am · /telegram · /thiet-bi · /tai-khoan · /dang-nhap
// Máy chủ trả index.html cho mọi đường dẫn trang (server/src/http/app.js), nên tải lại trang vẫn đúng.

/** Bỏ dấu "/" thừa ở cuối: "/giam-sat/" → "/giam-sat". */
export function normalizePath(pathname) {
  const p = pathname.replace(/\/+$/, '');
  return p === '' ? '/' : p;
}

/**
 * @returns {{ redirect: string } | { route: object } | { notFound: true }}
 */
export function matchRoute({ routes, redirects = {}, pathname }) {
  const p = normalizePath(pathname);
  if (redirects[p]) return { redirect: redirects[p] };
  const route = routes.find((r) => r.path === p);
  return route ? { route } : { notFound: true };
}

/** Bấm chuột có nên để trình duyệt tự xử lý (tab mới, tải về, trang ngoài…)? */
function isPlainClick(e) {
  return !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

/**
 * @param {object} opts
 * @param {object[]} opts.routes
 * @param {Record<string,string>} [opts.redirects]
 * @param {object} opts.notFound
 * @param {(route: object, url: URL, info: { initial: boolean, pop: boolean }) => Promise<void>|void} opts.onRoute
 */
export function createRouter({ routes, redirects = {}, notFound, onRoute }) {
  let started = false;

  function resolve(info) {
    const url = new URL(window.location.href);
    const m = matchRoute({ routes, redirects, pathname: url.pathname });
    if (m.redirect) {
      history.replaceState(history.state, '', m.redirect + url.search + url.hash);
      return resolve(info);
    }
    return onRoute(m.route ?? notFound, url, info);
  }

  function navigate(to, { replace = false } = {}) {
    const url = new URL(to, window.location.href);
    const same = url.pathname === window.location.pathname && url.search === window.location.search;
    if (same && !replace) {
      window.scrollTo({ top: 0 });
      return;
    }
    history[replace ? 'replaceState' : 'pushState']({}, '', url.pathname + url.search + url.hash);
    resolve({ initial: false, pop: false });
  }

  function onClick(e) {
    if (!isPlainClick(e)) return;
    const a = e.target.closest?.('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download') || a.dataset.external !== undefined) return;
    const url = new URL(a.href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname.startsWith('/api/')) return;
    e.preventDefault();
    navigate(url.pathname + url.search + url.hash);
  }

  return {
    navigate,
    start() {
      if (started) return;
      started = true;
      document.addEventListener('click', onClick);
      window.addEventListener('popstate', () => resolve({ initial: false, pop: true }));
      resolve({ initial: true, pop: false });
    },
  };
}
