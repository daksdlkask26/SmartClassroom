// Thiết bị & WiFi (DK-13 / MB-13).
// Bảng "Tình trạng thiết bị" lấy trực tiếp từ store (giả lập hoặc ESP32 thật): kết nối, bản tin cuối, chu kỳ gửi,
// B·DHT22, C·MQ-135, D·LED (mô hình LED mới, plan.md L1), WiFi đang dùng.
// Khối "Đổi WiFi · nút BOOT (E)" là hướng dẫn tĩnh: web không điều khiển được nút BOOT hay portal WiFiManager.
import { formatTime, NO_VALUE } from '../core/format.js';
import { sensorRow, ledRow, portalName } from '../core/device-view.js';
import { STATUS_VIEW } from '../components/statusbar.js';
import { cells, esc, icon, setText } from '../components/dom.js';
import { pageHead } from './_shared.js';

let offs = [];

const ROWS = [
  ['conn', 'device.row.conn'],
  ['interval', 'device.row.interval'],
  ['dht22', 'device.row.dht22'],
  ['mq135', 'device.row.mq135'],
  ['led', 'device.row.led'],
  ['wifi', 'device.row.wifi'],
];

function statusTable(t, s) {
  const rows = ROWS.map(([key, label]) => `
    <div class="ri-dtable__row" data-row="${key}">
      <dt class="ri-dtable__label">${esc(t(label))}</dt>
      <dd class="ri-dtable__value">
        <p class="ri-dtable__main" data-main>${NO_VALUE}</p>
        <p class="ri-dtable__sub" data-sub></p>
      </dd>
    </div>`).join('');
  return `
    <section class="ri-panel ri-device__status" aria-labelledby="dev-status">
      <div class="ri-panel__head">
        <h2 class="ri-panel__title" id="dev-status">${esc(t('device.status'))}</h2>
        <span class="ri-panel__meta">${esc((s.config?.deviceId ?? 'sc-01').toUpperCase())}</span>
      </div>
      <dl class="ri-dtable">${rows}</dl>
    </section>`;
}

/** Hình minh họa nút BOOT: lỗ E trên nắp + đầu bút nhấn vào (DK-13). */
function bootIllustration(t) {
  return `
    <svg class="ri-boot__illus" viewBox="0 0 200 200" role="img" aria-label="${esc(t('wifi.illus'))}" focusable="false">
      <circle class="ri-boot__lid" cx="100" cy="100" r="96"/>
      <circle class="ri-boot__ring" cx="100" cy="100" r="24"/>
      <circle class="ri-boot__hole" cx="100" cy="100" r="15"/>
      <line class="ri-boot__pen" x1="100" y1="100" x2="152" y2="28"/>
      <text class="ri-boot__label" x="100" y="152" text-anchor="middle">${esc(t('wifi.bootLabel'))}</text>
    </svg>`;
}

function bootPanel(t, s) {
  const secs = [1, 2, 3, 4, 5].map((n) => `<li>${esc(t('wifi.sec', { n }))}</li>`).join('');
  const ap = portalName(s.config?.deviceId);
  const steps = [1, 2, 3, 4].map((n) => {
    const current = n === 2; // bước cần thao tác trên hộp, tô đậm như DK-13
    return `
      <li class="ri-steps__item${current ? ' is-current' : ''}"${current ? ' aria-current="step"' : ''}>
        <span class="ri-steps__num" aria-hidden="true">${n}</span>
        <span class="ri-steps__text">${esc(t(`wifi.step${n}`, { ap }))}</span>
      </li>`;
  }).join('');
  return `
    <section class="ri-panel ri-device__boot" aria-labelledby="dev-boot">
      <div class="ri-panel__head">
        <h2 class="ri-panel__title" id="dev-boot">${esc(t('wifi.title'))}</h2>
        <span class="ri-panel__meta">${esc(t('wifi.meta'))}</span>
      </div>
      <div class="ri-boot">
        ${bootIllustration(t)}
        <p class="ri-boot__title">
          <span class="is-long">${esc(t('wifi.boot'))}</span><span class="is-short">${esc(t('wifi.bootShort'))}</span>
        </p>
        <p class="ri-boot__where">${esc(t('wifi.where'))}</p>
        <ol class="ri-boot__secs" aria-hidden="true">${secs}</ol>
        <p class="ri-boot__hold">${esc(t('wifi.hold'))}</p>
      </div>
      <ol class="ri-steps" aria-label="${esc(t('wifi.steps'))}">${steps}</ol>
    </section>`;
}

function template(t, s) {
  return pageHead({
    title: t('page.device.title'),
    subtitle: t('page.device.subtitle'),
    subtitleShort: t('page.device.subtitleMobile'),
  }) + `
    <div class="ri-device">
      ${statusTable(t, s)}
      ${bootPanel(t, s)}
    </div>`;
}

function setRow(root, key, { main, sub = '', tone = '' }, { html = false } = {}) {
  const row = root.querySelector(`[data-row="${key}"]`);
  if (!row) return;
  const mainEl = row.querySelector('[data-main]');
  if (html) {
    if (mainEl.dataset.html !== main) { mainEl.dataset.html = main; mainEl.innerHTML = main; }
  } else {
    setText(mainEl, main);
  }
  setText(row.querySelector('[data-sub]'), sub);
  row.dataset.tone = tone;
}

function render(root, s, t) {
  // Kết nối: cùng 8 ô + nhãn với thanh trạng thái (HANDOFF §3.4)
  const view = STATUS_VIEW[s.status] ?? STATUS_VIEW.connecting;
  const connHtml = `<span class="ri-conn ri-conn--${view.cls}">${cells(view.cellsOn, view.sweep ? 'ri-cells--sweep' : '')}`
    + `<span class="ri-conn__label">${esc(t(view.label))}</span></span>`;
  setRow(root, 'conn', {
    main: connHtml,
    sub: s.latest?.receivedAt
      ? t('device.conn.last', { time: formatTime(s.latest.receivedAt, { seconds: true }) })
      : t('device.conn.never'),
    tone: view.cls,
  }, { html: true });

  const intervalS = s.device?.intervalS ?? s.config?.timing?.intervalS ?? 30;
  const staleS = s.config?.timing?.staleAfterS ?? 90;
  setRow(root, 'interval', { main: t('device.interval.value', { n: intervalS }), sub: t('device.interval.note', { n: staleS }) });

  for (const sensor of ['dht22', 'mq135']) {
    const r = sensorRow(sensor, { status: s.status, latest: s.latest, t });
    const prefix = r.tone === 'alert' ? icon('triangle-alert', 'ri-icon--sm') : '';
    setRow(root, sensor, { ...r, main: prefix + esc(r.main) }, { html: true });
  }

  setRow(root, 'led', ledRow({ led: s.led, device: s.device, config: s.config, t }));
  setRow(root, 'wifi', { main: s.device?.ssid || NO_VALUE });
}

export default {
  mount(el, { store, t }) {
    let deviceId = store.get().config?.deviceId;
    el.innerHTML = template(t, store.get());
    const renderAll = () => render(el, store.get(), t);

    offs = [
      // Mã thiết bị (tên WiFi cấu hình SmartClassroom-SC01) nằm trong khung tĩnh → dựng lại khi config đến sau
      store.subscribe((s) => s.config, (c) => {
        if (c?.deviceId === deviceId) return renderAll();
        deviceId = c?.deviceId;
        el.innerHTML = template(t, store.get());
        renderAll();
      }, { immediate: false }),
      store.subscribe((s) => s.status, renderAll),
      store.subscribe((s) => s.latest, renderAll, { immediate: false }),
      store.subscribe((s) => s.device, renderAll, { immediate: false }),
      store.subscribe((s) => s.led, renderAll, { immediate: false }),
    ];
  },
  unmount() {
    offs.forEach((off) => off());
    offs = [];
  },
};
