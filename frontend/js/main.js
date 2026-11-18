// Khởi động giao diện: chuỗi → store → khung (rail, thanh trạng thái, tab bar) → WebSocket → router.
import { loadStrings, t } from './core/i18n.js';
import { createStore, initialState } from './core/store.js';
import { deriveStatus, STATUS } from './core/connection.js';
import { onTick, serverNow, syncServerTime } from './core/clock.js';
import { connectWs, wsUrl } from './core/ws.js';
import { getJSON } from './core/api.js';
import { createRouter } from './core/router.js';
import { routes, redirects, notFound, railRoutes, tabRoutes, moreRoutes } from './routes.js';
import { createRail } from './components/rail.js';
import { createTabbar } from './components/tabbar.js';
import { createStatusbar } from './components/statusbar.js';
import { initToasts, showToast } from './components/toast.js';
import { initTheme } from './core/theme.js';

const $ = (id) => document.getElementById(id);

async function boot() {
  initTheme();
  try {
    await loadStrings();
  } catch (err) {
    $('page').innerHTML = '<p class="ri-page__subtitle">Không tải được giao diện. Hãy tải lại trang.</p>';
    throw err;
  }

  const store = createStore({ ...initialState, status: STATUS.CONNECTING });

  // ---------- Khung ----------
  initToasts($('toasts'), { t });
  const rail = createRail($('rail'), { routes: railRoutes, t });
  const tabbar = createTabbar($('tabbar'), $('more'), { tabRoutes, moreRoutes, t });
  let socket = null;
  const statusbar = createStatusbar($('statusbar'), { store, t, onRetry: () => socket?.reconnectNow() });
  $('rail').setAttribute('aria-label', t('app.nav'));
  $('tabbar').setAttribute('aria-label', t('app.nav'));
  document.querySelector('.ri-skip').textContent = t('app.skip');

  // ---------- Trạng thái kết nối: tính lại khi dữ liệu đổi và mỗi giây (dữ liệu "cũ đi" theo thời gian) ----------
  function recompute() {
    const s = store.get();
    const { status } = deriveStatus({
      ws: s.conn.ws,
      latest: s.latest,
      device: s.device,
      now: serverNow(),
      staleAfterS: s.config?.timing?.staleAfterS,
    });
    if (status !== s.status) store.set({ status });
  }
  store.subscribe((s) => s.conn, recompute, { immediate: false });
  store.subscribe((s) => s.latest, recompute, { immediate: false });
  store.subscribe((s) => s.device, recompute, { immediate: false });
  store.subscribe((s) => s.config, recompute, { immediate: false });
  onTick(recompute);

  // ---------- WebSocket ----------
  socket = connectWs({
    url: wsUrl(),
    onConn: (conn) => store.set({ conn }),
    onMessage(msg) {
      if (msg.at) syncServerTime(msg.at);
      const d = msg.data;
      switch (msg.type) {
        case 'hello':
          syncServerTime(d.serverTime);
          store.set({ config: d.config, mode: d.mode, latest: d.latest, device: d.device, led: d.led });
          break;
        case 'reading':
          store.set((s) => ({ latest: d, beat: s.beat + 1 }));
          break;
        case 'device':
          store.set({ device: d });
          break;
        case 'led':
          store.set({ led: d });
          break;
        default:
          break; // loại tin mới của hợp đồng sau này: bỏ qua
      }
    },
  });

  // ---------- Phiên (ID 8 làm thật; hiện luôn trả giangvien01) ----------
  store.subscribe((s) => s.session, (session) => rail.setUser(session?.user?.username));
  getJSON('/api/session')
    .then((session) => store.set({ session }))
    .catch((err) => showToast({
      kind: 'failed',
      id: 'session',
      title: t('toast.apiFailed.title'),
      body: t('toast.apiFailed.body', { code: err.code ?? 'NETWORK' }),
    }));

  // ---------- Router ----------
  const pageEl = $('page');
  let current = null;
  let token = 0;

  const router = createRouter({
    routes,
    redirects,
    notFound,
    async onRoute(route, url, { initial, pop }) {
      const my = ++token;
      rail.setActive(route.id);
      tabbar.setActive(route.id);
      statusbar.setActive(route.id);
      document.title = `${t(route.titleKey)} · ${t('app.name')}`;

      let mod;
      try {
        mod = await route.load();
      } catch (err) {
        if (my !== token) return;
        showToast({ kind: 'failed', id: 'route', title: t('toast.apiFailed.title'), body: err.message });
        return;
      }
      if (my !== token) return; // người dùng đã bấm sang trang khác trong lúc tải

      current?.unmount?.();
      pageEl.classList.remove('is-entering');
      pageEl.replaceChildren();
      current = mod.default;
      current.mount(pageEl, { store, t, url, route, navigate: (to, o) => router.navigate(to, o) });

      if (!initial) {
        void pageEl.offsetWidth;
        pageEl.classList.add('is-entering');
        if (!pop) window.scrollTo({ top: 0 });
        // Trình đọc màn hình đọc tiêu đề trang mới; bàn phím bắt đầu từ nội dung trang
        pageEl.querySelector('h1')?.focus({ preventScroll: true });
      }
    },
  });
  router.start();
}

boot();
