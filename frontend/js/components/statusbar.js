// Nav/StatusBar — 5 trạng thái (HANDOFF §3.4). Trạng thái tính ở main.js (deriveStatus) và đặt vào store.status;
// thành phần này chỉ vẽ: 8 ô sức khỏe, nhãn, câu chi tiết đếm theo giây, giờ UTC+7, nút Thử lại, tài khoản.
//
// Trình đọc màn hình: chỉ vùng role="status" (nhãn + một câu cố định theo trạng thái) được đọc khi đổi trạng thái;
// câu "Cập nhật N giây trước" đổi mỗi giây nên aria-hidden, tránh đọc liên tục.
import { STATUS, ageSeconds } from '../core/connection.js';
import { serverNow, onTick } from '../core/clock.js';
import { formatTime } from '../core/format.js';
import { cells, esc, icon, setText } from './dom.js';

const VIEW = {
  [STATUS.ONLINE]:         { cls: 'online',       cellsOn: 8, sweep: false, invert: false, label: 'status.online' },
  [STATUS.CONNECTING]:     { cls: 'connecting',   cellsOn: 0, sweep: true,  invert: false, label: 'status.connecting' },
  [STATUS.STALE]:          { cls: 'stale',        cellsOn: 3, sweep: false, invert: false, label: 'status.stale' },
  [STATUS.DEVICE_OFFLINE]: { cls: 'offline',      cellsOn: 0, sweep: false, invert: true,  label: 'status.deviceOffline' },
  [STATUS.DISCONNECTED]:   { cls: 'disconnected', cellsOn: 0, sweep: false, invert: true,  label: 'status.disconnected' },
};
const ALL_CLASSES = Object.values(VIEW).map((v) => `ri-statusbar--${v.cls}`);

export function createStatusbar(el, { store, t, onRetry }) {
  el.innerHTML = `
    <div class="ri-statusbar__state" role="status" aria-live="polite" aria-atomic="true">
      <span data-cells></span>
      <span class="ri-statusbar__label" data-label></span>
      <span class="ri-sr-only" data-sr></span>
      <span class="ri-statusbar__pulse" data-pulse aria-hidden="true"></span>
    </div>
    <p class="ri-statusbar__detail" data-detail aria-hidden="true"></p>
    <div class="ri-statusbar__end">
      <button class="ri-statusbar__retry" type="button" data-retry hidden>
        ${icon('refresh-cw', 'ri-icon--sm')}<span>${esc(t('status.retry'))}</span>
      </button>
      <span class="ri-statusbar__chip" data-sim hidden title="${esc(t('app.sim.title'))}">${esc(t('app.sim'))}</span>
      <span class="ri-statusbar__clock" aria-hidden="true"><span data-clock>—</span> <span class="ri-statusbar__tz">${esc(t('status.timezone'))}</span></span>
      <a class="ri-statusbar__account" href="/tai-khoan" data-route="account">
        ${icon('user')}<span data-user>—</span>
      </a>
    </div>`;

  const $ = (sel) => el.querySelector(sel);
  const cellsEl = $('[data-cells]');
  const labelEl = $('[data-label]');
  const srEl = $('[data-sr]');
  const pulseEl = $('[data-pulse]');
  const detailEl = $('[data-detail]');
  const retryEl = $('[data-retry]');
  const simEl = $('[data-sim]');
  const clockEl = $('[data-clock]');
  const userEl = $('[data-user]');
  const accountEl = $('[data-route="account"]');

  retryEl.addEventListener('click', () => onRetry?.());

  let shownStatus = null;

  function detailText(s, now) {
    const age = ageSeconds(s.latest, now);
    switch (s.status) {
      case STATUS.ONLINE:
        return { detail: t('status.online.detail', { n: age ?? 0 }), sr: t('status.online.sr') };
      case STATUS.CONNECTING: {
        const d = t(s.conn.ws === 'open' ? 'status.connecting.detail' : 'status.connecting.server');
        return { detail: d, sr: d };
      }
      case STATUS.STALE: {
        const d = t('status.stale.detail', {
          m: Math.max(1, Math.floor((age ?? 0) / 60)),
          time: formatTime(s.latest?.receivedAt),
        });
        return { detail: d, sr: d };
      }
      case STATUS.DEVICE_OFFLINE: {
        const last = s.latest?.receivedAt ?? s.device?.lastSeenAt;
        const d = last ? t('status.deviceOffline.detail', { time: formatTime(last) }) : t('status.deviceOffline.never');
        return { detail: d, sr: d };
      }
      case STATUS.DISCONNECTED: {
        const { retryAt } = s.conn;
        const d = retryAt
          ? t('status.disconnected.detail', { s: Math.max(0, Math.ceil((retryAt - Date.now()) / 1000)) })
          : t('status.disconnected.retrying');
        return { detail: d, sr: t('status.disconnected.sr') };
      }
      default:
        return { detail: '', sr: '' };
    }
  }

  function render() {
    const s = store.get();
    const status = s.status ?? STATUS.CONNECTING;
    const view = VIEW[status];
    const now = serverNow();

    if (status !== shownStatus) {
      shownStatus = status;
      el.classList.remove(...ALL_CLASSES);
      el.classList.add(`ri-statusbar--${view.cls}`);
      el.classList.toggle('ri-invert', view.invert);
      el.dataset.status = status;
      cellsEl.innerHTML = cells(view.cellsOn, view.sweep ? 'ri-cells--sweep' : '');
      setText(labelEl, t(view.label));
      pulseEl.hidden = status !== STATUS.ONLINE;
      retryEl.hidden = status !== STATUS.DISCONNECTED;
    }

    const { detail, sr } = detailText({ ...s, status }, now);
    setText(detailEl, detail);
    setText(srEl, sr ? ` · ${sr}` : '');
    detailEl.title = detail;
    setText(clockEl, formatTime(now));
  }

  function pulse() {
    if (pulseEl.hidden) return;
    pulseEl.classList.remove('is-beat');
    void pulseEl.offsetWidth; // chạy lại hiệu ứng cho bản tin mới
    pulseEl.classList.add('is-beat');
  }

  store.subscribe((s) => s.status, render);
  store.subscribe((s) => s.conn, render, { immediate: false });
  store.subscribe((s) => s.latest, render, { immediate: false });
  store.subscribe((s) => s.device, render, { immediate: false });
  store.subscribe((s) => s.beat, pulse, { immediate: false });
  store.subscribe((s) => s.mode, (mode) => { simEl.hidden = mode !== 'sim'; });
  store.subscribe((s) => s.session, (session) => { setText(userEl, session?.user?.username ?? '—'); });
  onTick(render);

  return {
    setActive(routeId) {
      if (routeId === 'account') accountEl.setAttribute('aria-current', 'page');
      else accountEl.removeAttribute('aria-current');
    },
  };
}
