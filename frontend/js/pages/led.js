// Đèn LED (ID 3) — DK-06 / MB-06 (Tự động), DK-06b / MB-06b (Kiểm tra đèn), ST-08, ST-09, ST-17. HANDOFF §3.5.
//
// Tự động: thanh xem trước 8 bóng (chỉ hiển thị, mô phỏng từ bản tin mới nhất + bản nháp) · thẻ "Trên hộp"
// (bảng đã gửi) · 3 thẻ thông số (thanh ngưỡng chỉ đọc + 3 hàng mức, bấm hàng → bộ chọn 10 màu + HEX)
// · quy ước cố định · Áp dụng bảng màu / Hủy thay đổi / Khôi phục mặc định.
// Kiểm tra đèn: một màu cho cả thanh + Bật/Tắt gửi ngay; banner + "Về tự động".
//
// Chỉ ghi "Đã gửi …" — không bao giờ "đèn đã đổi" (firmware không gửi xác nhận). Thiết bị ngoại tuyến → khóa gửi.
import { STATUS, isLive } from '../core/connection.js';
import { formatNumber, formatTime, NO_VALUE } from '../core/format.js';
import { postJSON } from '../core/api.js';
import { ledColors } from '../core/led.js';
import {
  METRICS, parseHex, colorName, colorLabel, clonePalette, samePalette, sentPalette, paletteDiff, diffSummary,
  duplicateLevels, bandText, scaleSegments, valuePercent, previewLeds, testLeds,
} from '../core/led-editor.js';
import { esc, icon, setText } from '../components/dom.js';
import { ledStrip, paintLeds } from '../components/led-strip.js';
import { showToast } from '../components/toast.js';
import { pageHead } from './_shared.js';

const DECIMALS = { temperature: 1, humidity: 1, co2: 0 };
const FALLBACK_LEVELS = ['normal', 'watch', 'alert'];
/** Màu Kiểm tra đèn mặc định = token --led-test (tokens.css, Xanh ngọc); không viết cứng mã màu ở đây. */
function defaultTestColor(config) {
  let css = null;
  try { css = parseHex(getComputedStyle(document.documentElement).getPropertyValue('--led-test')); } catch { /* không có DOM */ }
  return css ?? parseHex(config?.led?.namedColors?.[0]?.hex) ?? '#FFFFFF';
}
const NBSP = ' ';

// Bản nháp được giữ khi rời trang rồi quay lại trong cùng phiên (không lưu xuống máy).
const memo = { tab: null, palette: null, base: null, testColor: null };
let offs = [];

const levelsOf = (config) => config?.led?.levelOrder ?? FALLBACK_LEVELS;
const pairOf = (config, m) => (config?.led?.pairs?.[m] ?? []).join('–');
const unitOf = (config, m) => config?.metrics?.[m]?.unit ?? '';
const valueText = (config, m, v) => {
  const n = formatNumber(v, config?.metrics?.[m]?.decimals ?? DECIMALS[m]);
  return n === NO_VALUE ? n : `${n}${NBSP}${unitOf(config, m)}`;
};

/** Gửi được khi WebSocket mở và máy chủ báo thiết bị trực tuyến (máy chủ cũng chặn: 409 DEVICE_OFFLINE). */
function lockReason(s) {
  if (s.conn?.ws === 'closed') return 'disconnected';
  if (s.device?.online === false && s.status === STATUS.DEVICE_OFFLINE) return 'offline';
  if (s.conn?.ws !== 'open' || s.device?.online !== true) return s.device?.online === false ? 'offline' : 'connecting';
  return null;
}

// ---------------------------------------------------------------- khung HTML

function modeSwitch(t, tab) {
  const btn = (id) => `<button class="ri-ledmode__btn" type="button" data-tab="${id}" aria-pressed="${tab === id}">${esc(t(`led.mode.${id}`))}</button>`;
  return `<div class="ri-ledmode" role="group" aria-label="${esc(t('led.mode.label'))}">${btn('auto')}${btn('test')}</div>`;
}

function chevron() {
  return `<span class="ri-chev" aria-hidden="true">${icon('chevron-down', 'ri-icon--sm')}</span>`;
}

function previewPanel(t) {
  const group = (id, ns) => {
    const cells = ns.map((n) => `<i class="ri-ledpv__cell" data-n="${n}"></i>`).join('');
    const name = id === 'co2'
      ? `<span class="is-long">${esc(t('led.pair.co2'))}</span><span class="is-short">${esc(t('led.pair.co2Short'))}</span>`
      : esc(t(`led.pair.${id}`));
    const inner = `<span class="ri-ledpv__cells ri-led__pair" data-pair="${id}">${cells}</span>
      <span class="ri-ledpv__name">${name}</span><span class="ri-ledpv__cap" data-cap="${id}"></span>`;
    return id === 'system'
      ? `<div class="ri-ledpv__group" data-group="system">${inner}</div>`
      : `<button class="ri-ledpv__group" type="button" data-group="${id}" data-goto="${id}"
           aria-label="${esc(t('led.pair.goto', { metric: t(`metric.${id}.name`) }))}">${inner}</button>`;
  };
  return `
    <section class="ri-panel ri-ledp__preview" aria-labelledby="led-pv">
      <div class="ri-panel__head">
        <h2 class="ri-panel__title" id="led-pv">${esc(t('led.preview.title'))}</h2>
        <span class="ri-panel__meta"><span class="is-long">${esc(t('led.preview.hint'))}</span><span class="is-short">${esc(t('led.preview.hintShort'))}</span></span>
      </div>
      <div class="ri-ledpv" data-preview>
        ${group('system', [1, 2])}${group('temperature', [3, 4])}${group('humidity', [5, 6])}${group('co2', [7, 8])}
      </div>
      <p class="ri-ledpv__unknown" data-pv-unknown hidden>${esc(t('led.preview.unknown'))}</p>
      <ul class="ri-ledpv__legend">
        <li><i class="ri-legend-cell"></i>${esc(t('led.legend.steady'))}</li>
        <li><span class="ri-led__pair is-blink"><i class="ri-legend-cell ri-legend-cell--blink"></i></span>${esc(t('led.legend.blink'))}</li>
      </ul>
      <p class="ri-ledpv__sent">
        <span class="ri-ledpv__sentlbl">${esc(t('led.sentRow'))}</span>
        <span class="ri-ledxs" data-sent-strip>${ledStrip()}</span>
        <span class="ri-ledpv__senttext" data-sent-text></span>
      </p>
    </section>`;
}

function boxPanel(t) {
  return `
    <section class="ri-panel ri-ledp__box" aria-labelledby="led-box">
      <div class="ri-panel__head">
        <h2 class="ri-panel__title" id="led-box">${esc(t('led.box.title'))}</h2>
        <span class="ri-panel__meta" data-box-sent></span>
      </div>
      <p class="ri-ledbox__face">${esc(t('led.box.face'))}</p>
      <div class="ri-ledbox" role="img" aria-label="${esc(t('led.box.aria'))}">
        <span class="ri-ledxs" data-box-strip>${ledStrip()}</span><span class="ri-ledbox__d" aria-hidden="true">D</span>
      </div>
      <p class="ri-ledbox__note" data-box-note></p>
    </section>`;
}

function hexForm(t, key) {
  return `
    <form class="ri-hex" data-hexform="${key}" hidden novalidate>
      <label class="ri-hex__label" for="led-hex-${key}">${esc(t('led.hex.label'))}</label>
      <div class="ri-hex__row">
        <input class="ri-hex__pick" type="color" data-hexpick aria-label="${esc(t('led.hex.pick'))}">
        <input class="ri-field ri-hex__input" id="led-hex-${key}" type="text" data-hex maxlength="7" size="7"
          spellcheck="false" autocomplete="off" autocapitalize="characters" placeholder="#FF7A00"
          aria-describedby="led-hexerr-${key}">
        <button class="ri-btn" type="submit">${esc(t('led.hex.apply'))}</button>
      </div>
      <p class="ri-field__msg" id="led-hexerr-${key}" data-hexerr hidden>${esc(t('led.hex.invalid'))}</p>
    </form>`;
}

function swatchGrid(config, attr) {
  return (config?.led?.namedColors ?? []).map((c) => `
    <button class="ri-picker__sw" type="button" ${attr}="${esc(c.hex.toUpperCase())}" aria-pressed="false"
      aria-label="${esc(c.name)}" title="${esc(c.name)}" style="--sw:${esc(c.hex)}"></button>`).join('');
}

function metricCard(t, config, m) {
  const metricName = t(`metric.${m}.name`);
  const rows = levelsOf(config).map((lv) => {
    const key = `${m}-${lv}`;
    return `
      <li class="ri-ledrow" data-row="${lv}">
        <button class="ri-ledrow__btn" type="button" data-level="${m}:${lv}" aria-expanded="false" aria-controls="led-pk-${key}">
          <span class="ri-ledrow__sw" data-sw></span>
          <span class="ri-ledrow__text">
            <span class="ri-ledrow__label">${esc(t(`metric.level.${lv}`))}</span>
            <span class="ri-ledrow__band">${esc(bandText(m, lv, config, t))}</span>
            <span class="ri-ledrow__color" data-row-color></span>
          </span>
          ${chevron()}
        </button>
        <div class="ri-picker" id="led-pk-${key}" data-picker hidden role="group"
          aria-label="${esc(t('led.picker.aria', { metric: metricName, level: t(`led.level.${lv}`) }))}">
          <p class="ri-picker__title" aria-hidden="true">${esc(t('led.picker.title'))}</p>
          <div class="ri-picker__grid">${swatchGrid(config, 'data-pick')}</div>
          <button class="ri-btn ri-picker__custom" type="button" data-custom="${key}" aria-expanded="false" aria-controls="led-hexf-${key}">${esc(t('led.picker.custom'))}</button>
          <div id="led-hexf-${key}">${hexForm(t, key)}</div>
        </div>
      </li>`;
  }).join('');

  return `
    <section class="ri-panel ri-ledm" data-card="${m}" aria-labelledby="led-h-${m}">
      <div class="ri-ledm__head">
        <h2 class="ri-panel__title" id="led-h-${m}" tabindex="-1">${esc(t('led.card.title', { metric: t(`metric.${m}`), pair: pairOf(config, m) }))}</h2>
        <button class="ri-ledm__toggle" type="button" data-toggle="${m}" aria-expanded="false" aria-controls="led-b-${m}"
          aria-label="${esc(t('led.card.toggle', { metric: metricName }))}">${chevron()}</button>
      </div>
      <p class="ri-ledm__peek" data-peek>
        <span class="ri-ledm__mini" data-mini><i></i><i></i></span>
        <span class="ri-ledm__peektext" data-peek-text></span>
        <span class="ri-ledm__chips" data-chips aria-hidden="true"><i></i><i></i><i></i></span>
      </p>
      <div class="ri-ledm__body" id="led-b-${m}">
        <p class="ri-ledm__now">
          <span class="ri-ledm__mini ri-ledm__mini--lg" data-mini><i></i><i></i></span>
          <span class="ri-ledm__value" data-now-value>${NO_VALUE}</span>
          <span class="ri-ledm__level" data-now-level></span>
        </p>
        <div class="ri-ledscale" data-scale role="img" aria-label="${esc(t('led.card.scale', { metric: metricName }))}"></div>
        <ul class="ri-ledrows">${rows}</ul>
        <p class="ri-banner ri-banner--warning ri-ledm__dup" data-dup hidden>${icon('triangle-alert', 'ri-icon--sm')}<span data-dup-text></span></p>
      </div>
    </section>`;
}

function rulesPanel(t, config) {
  const net = config?.led?.systemColors?.net ?? ''; // bóng 2 · Xanh dương (contract led.systemColors)
  const item = (cells, title, desc) => `
    <li class="ri-rule"><span class="ri-rule__cells" aria-hidden="true">${cells}</span>
      <span><span class="ri-rule__title">${esc(title)}</span><span class="ri-rule__desc">${esc(desc)}</span></span></li>`;
  const cell = (cls = '', color = '') => `<i class="ri-legend-cell ${cls}"${color ? ` style="--led:${color}"` : ''}></i>`;
  const blink = (inner) => `<span class="ri-led__pair is-blink">${inner}</span>`;
  return `
    <section class="ri-panel ri-ledp__rules" data-rules aria-labelledby="led-rules">
      <div class="ri-ledm__head">
        <h2 class="ri-panel__title" id="led-rules"><span class="is-long">${esc(t('led.rules.title'))}</span><span class="is-short">${esc(t('led.rules.titleShort'))}</span></h2>
        <button class="ri-ledm__toggle" type="button" data-toggle-rules aria-expanded="false" aria-controls="led-rules-b"
          aria-label="${esc(t('led.rules.toggle'))}">${chevron()}</button>
      </div>
      <p class="ri-ledm__peek ri-rules__peek">${esc(t('led.rules.summary'))}</p>
      <div class="ri-ledm__body" id="led-rules-b">
        <p class="ri-rules__group">${esc(t('led.rules.system'))}</p>
        <ul class="ri-rules__list ri-rules__list--2">
          ${item(blink(cell('ri-legend-cell--blink')), t('led.rules.b1'), t('led.rules.b1d'))}
          ${item(cell('', net) + blink(cell('', net)), t('led.rules.b2'), t('led.rules.b2d'))}
        </ul>
        <p class="ri-rules__group">${esc(t('led.rules.blink'))}</p>
        <ul class="ri-rules__list ri-rules__list--3">
          ${item(blink(cell('ri-legend-cell--blink') + cell('ri-legend-cell--blink')), t('led.rules.nodata'), t('led.rules.nodatad'))}
          ${item(blink(cell('ri-legend-cell--blink')) + cell('ri-legend-cell--dim'), t('led.rules.warm'), t('led.rules.warmd'))}
          ${item(blink(cell('ri-legend-cell--blink') + cell('ri-legend-cell--blink')), t('led.rules.err'), t('led.rules.errd'))}
        </ul>
      </div>
    </section>`;
}

function actionBar(t, kind) {
  if (kind === 'test') {
    return `
      <div class="ri-ledbar" data-bar>
        <button class="ri-btn ri-btn--primary ri-ledbar__apply" type="button" data-act="test-apply"></button>
        <button class="ri-btn ri-ledbar__cancel" type="button" data-act="test-cancel"><span class="is-long">${esc(t('led.cancel'))}</span><span class="is-short">${esc(t('led.cancelShort'))}</span></button>
        <p class="ri-ledbar__status" data-status role="status" aria-live="polite"></p>
      </div>`;
  }
  return `
    <div class="ri-ledbar" data-bar>
      <button class="ri-btn ri-btn--primary ri-ledbar__apply" type="button" data-act="apply">${esc(t('led.apply'))}</button>
      <button class="ri-btn ri-ledbar__cancel" type="button" data-act="cancel"><span class="is-long">${esc(t('led.cancel'))}</span><span class="is-short">${esc(t('led.cancelShort'))}</span></button>
      <button class="ri-link ri-ledbar__reset" type="button" data-act="reset">${esc(t('led.reset'))}</button>
      <p class="ri-ledbar__status" data-status role="status" aria-live="polite"></p>
    </div>`;
}

function autoTemplate(t, config) {
  return `
    <div class="ri-ledp">
      ${previewPanel(t)}
      ${boxPanel(t)}
      <div class="ri-ledp__cards">${METRICS.map((m) => metricCard(t, config, m)).join('')}</div>
      <p class="ri-ledp__reset-m"><button class="ri-link" type="button" data-act="reset">${esc(t('led.reset'))}</button></p>
      ${rulesPanel(t, config)}
      ${actionBar(t, 'auto')}
    </div>`;
}

function testTemplate(t, config) {
  const cells = Array.from({ length: config?.led?.count ?? 8 }, (_, i) => `<i class="ri-ledt__cell" data-n="${i + 1}"></i>`).join('');
  const cards = (config?.led?.namedColors ?? []).map((c) => `
    <button class="ri-tcolor" type="button" data-tpick="${esc(c.hex.toUpperCase())}" aria-pressed="false">
      <span class="ri-tcolor__sw" style="--sw:${esc(c.hex)}"></span>
      <span class="ri-tcolor__text"><span class="ri-tcolor__name">${esc(c.name)}</span><span class="ri-tcolor__hex">${esc(c.hex.toUpperCase())}</span></span>
      <span class="ri-tcolor__check" aria-hidden="true">${icon('check', 'ri-icon--sm')}</span>
    </button>`).join('');
  return `
    <div class="ri-ledt">
      <section class="ri-panel ri-ledt__preview" aria-labelledby="led-tpv">
        <div class="ri-panel__head">
          <h2 class="ri-panel__title" id="led-tpv">${esc(t('led.test.preview'))}</h2>
          <span class="ri-panel__meta">${esc(t('led.test.meta'))}</span>
        </div>
        <div class="ri-ledt__strip" data-test-strip aria-hidden="true">${cells}</div>
        <p class="ri-ledt__draft"><span class="ri-ledt__badge">${esc(t('led.test.draft'))}</span><span class="ri-ledt__draftval" data-test-draft></span></p>
        <p class="ri-ledt__sent">
          <span class="ri-ledpv__sentlbl">${esc(t('led.test.sent'))}</span>
          <span class="ri-ledxs" data-test-sent-strip>${ledStrip()}</span>
          <span class="ri-ledpv__senttext" data-test-sent></span>
        </p>
      </section>
      <section class="ri-panel ri-ledt__palette" aria-labelledby="led-tpal">
        <div class="ri-panel__head">
          <h2 class="ri-panel__title" id="led-tpal">${esc(t('led.test.palette'))}</h2>
          <span class="ri-panel__meta"><span class="is-long">${esc(t('led.test.paletteMeta'))}</span><span class="is-short">${esc(t('led.test.paletteMetaShort'))}</span></span>
        </div>
        <div class="ri-tcolors" role="group" aria-labelledby="led-tpal">${cards}</div>
        <button class="ri-btn ri-picker__custom" type="button" data-custom="test" aria-expanded="false" aria-controls="led-hexf-test">${esc(t('led.picker.custom'))}</button>
        <div id="led-hexf-test">${hexForm(t, 'test')}</div>
      </section>
      <section class="ri-panel ri-ledt__power" aria-labelledby="led-tpow">
        <div class="ri-ledt__powtext">
          <h2 class="ri-panel__title" id="led-tpow">${esc(t('led.test.power'))}</h2>
          <p class="ri-ledt__powlast" data-power-text></p>
        </div>
        <button class="ri-switch" type="button" role="switch" aria-checked="false" aria-labelledby="led-tpow" data-act="power">
          <span class="ri-switch__label" data-power-label></span><span class="ri-switch__knob" aria-hidden="true"></span>
        </button>
      </section>
      ${actionBar(t, 'test')}
    </div>`;
}

function template(t, s, tab) {
  const head = pageHead({
    title: t('page.led.title'),
    subtitle: tab === 'test' ? t('led.subtitleTest') : t('led.subtitle'),
    subtitleShort: tab === 'test' ? t('led.subtitleTestShort') : t('led.subtitleShort'),
  });
  if (!s.config?.led) return head;
  return `${head}${modeSwitch(t, tab)}<div class="ri-ledbanners" data-banners></div>`
    + (tab === 'test' ? testTemplate(t, s.config) : autoTemplate(t, s.config));
}

// ---------------------------------------------------------------- vẽ theo trạng thái

function bannersHtml(t, s, lock) {
  const out = [];
  if (lock === 'offline' || lock === 'disconnected') {
    out.push(`
      <div class="ri-banner ri-banner--error ri-ledbanner" role="status">
        ${icon('triangle-alert', 'ri-icon--sm')}
        <p><strong>${esc(t(lock === 'offline' ? 'led.offline.title' : 'led.lock.disconnected'))}</strong>
        <span>${esc(t('led.offline.body'))}</span></p>
        <a class="ri-link" href="/thiet-bi">${esc(t('led.offline.link'))} ${icon('arrow-right', 'ri-icon--sm')}</a>
      </div>`);
  }
  if ((s.led?.mode ?? s.device?.ledMode) === 'test') {
    out.push(`
      <div class="ri-banner ri-banner--warning ri-ledbanner">
        ${icon('lightbulb', 'ri-icon--sm')}
        <p><strong>${esc(t('led.testBanner.title'))}</strong> <span>${esc(t('led.testBanner.body'))}</span></p>
        <button class="ri-btn" type="button" data-act="auto"${lock ? ' disabled' : ''}>${esc(t('led.backToAuto'))}</button>
      </div>`);
  }
  return out.join('');
}

function setPressed(el, on) {
  const v = String(Boolean(on));
  if (el.getAttribute('aria-pressed') !== v) el.setAttribute('aria-pressed', v);
}

function capFor(t, config, m, { result, latest, editing }) {
  if (!result) return t('led.cap.unknown');
  if (editing?.metric === m) return t('led.cap.editing', { level: t(`metric.level.${editing.level}`) });
  if (result.blink[m] === 'error') return t('led.cap.error');
  if (result.blink[m] === 'warming') return t('led.cap.warming');
  const lv = latest?.levels?.[m];
  return lv ? t('led.cap.value', { value: valueText(config, m, latest[m]), level: t(`metric.level.${lv}`) }) : t('led.cap.unknown');
}

function renderAuto(root, s, t, ui) {
  const { config } = s;
  const live = isLive(s.status);
  const order = levelsOf(config);

  // Thanh xem trước: bản nháp + số đo mới nhất
  const preview = previewLeds({ latest: s.latest, palette: ui.palette, config, live, editing: ui.editing });
  const pv = root.querySelector('[data-preview]');
  paintLeds(pv, preview);
  setText(pv.querySelector('[data-cap="system"]'), preview ? t('led.cap.system') : t('led.cap.unknown'));
  for (const m of METRICS) {
    setText(pv.querySelector(`[data-cap="${m}"]`), capFor(t, config, m, { result: preview, latest: s.latest, editing: ui.editing }));
    pv.querySelector(`[data-group="${m}"]`).classList.toggle('is-editing', ui.editing?.metric === m);
  }
  root.querySelector('[data-pv-unknown]').hidden = Boolean(preview);

  // Trên hộp + dòng ĐÃ GỬI (mobile): bảng đã gửi, cùng cách tính với thẻ LED ở Giám sát
  const onBox = ledColors({ latest: s.latest, led: s.led?.mode ? s.led : { mode: 'auto', palette: ui.base }, config, live });
  paintLeds(root.querySelector('[data-box-strip]'), onBox);
  paintLeds(root.querySelector('[data-sent-strip]'), onBox);
  const sentAt = s.led?.palette ? s.led.sentAt : null;
  setText(root.querySelector('[data-box-sent]'), sentAt ? t('led.box.sent', { time: formatTime(sentAt) }) : t('led.box.notSent'));
  setText(root.querySelector('[data-box-note]'), s.led?.palette ? t('led.box.note') : t('led.box.noteDefault'));
  const isDefault = samePalette(ui.base, config.led.defaultPalette);
  setText(root.querySelector('[data-sent-text]'), sentAt
    ? t('led.sentRow.value', { palette: t(isDefault ? 'led.sentRow.default' : 'led.sentRow.custom'), time: formatTime(sentAt) })
    : t('led.sentRow.never'));

  // 3 thẻ thông số
  for (const m of METRICS) {
    const card = root.querySelector(`[data-card="${m}"]`);
    const colors = ui.palette[m];
    const lv = live ? s.latest?.levels?.[m] : null;
    const nowColor = lv ? colors[order.indexOf(lv)] : null;
    const expanded = ui.expanded.has(m);
    card.classList.toggle('is-collapsed', !expanded);
    card.querySelector('[data-toggle]').setAttribute('aria-expanded', String(expanded));

    for (const mini of card.querySelectorAll('[data-mini] > i')) {
      mini.style.setProperty('--led', nowColor ?? 'transparent');
      mini.classList.toggle('is-unknown', !nowColor);
    }
    const v = live ? valueText(config, m, s.latest?.[m]) : NO_VALUE;
    setText(card.querySelector('[data-now-value]'), v);
    setText(card.querySelector('[data-now-level]'), lv ? t('led.card.now', { level: t(`led.level.${lv}`) }) : '');
    setText(card.querySelector('[data-peek-text]'), lv ? `${v} · ${t(`led.level.${lv}`)}` : v);
    card.querySelectorAll('[data-chips] > i').forEach((chip, i) => chip.style.setProperty('--led', colors[i]));

    // Thanh ngưỡng chỉ đọc, tô theo bản nháp
    const { segments, ticks } = scaleSegments(m, ui.palette, config);
    const x = live ? valuePercent(s.latest?.[m], m, config) : null;
    const scaleHtml = `<div class="ri-ledscale__bar">${segments.map((g) =>
      `<i style="left:${g.from}%;width:${g.to - g.from}%;--led:${g.color}"></i>`).join('')}`
      + (x === null ? '' : `<b class="ri-ledscale__now" style="left:${x}%"></b>`) + '</div>'
      + `<div class="ri-ledscale__ticks">${ticks.map((k) => `<span style="left:${k.x}%">${esc(formatNumber(k.value, 0))}</span>`).join('')}</div>`;
    const scale = card.querySelector('[data-scale]');
    if (scale.dataset.html !== scaleHtml) { scale.dataset.html = scaleHtml; scale.innerHTML = scaleHtml; }

    // 3 hàng mức + bộ chọn màu
    order.forEach((level, i) => {
      const row = card.querySelector(`[data-row="${level}"]`);
      const hex = colors[i];
      const changed = hex !== ui.base[m][i];
      const open = ui.editing?.metric === m && ui.editing.level === level;
      row.querySelector('[data-sw]').style.setProperty('--led', hex);
      setText(row.querySelector('[data-row-color]'), changed ? t('led.row.unsent', { color: colorLabel(hex, config) }) : colorLabel(hex, config));
      row.classList.toggle('is-open', open);
      row.classList.toggle('is-changed', changed);
      row.querySelector('[data-level]').setAttribute('aria-expanded', String(open));
      const picker = row.querySelector('[data-picker]');
      picker.hidden = !open;
      if (open) {
        for (const sw of picker.querySelectorAll('[data-pick]')) setPressed(sw, sw.dataset.pick === hex);
        syncHexForm(picker, `${m}-${level}`, ui, hex);
      }
    });

    // Hai mức trùng màu (ST-17): cảnh báo, không khóa Áp dụng
    const dups = duplicateLevels(colors, config);
    const dup = card.querySelector('[data-dup]');
    dup.hidden = !dups.length;
    if (dups.length) {
      setText(dup.querySelector('[data-dup-text]'), t('led.duplicate', {
        metric: t(`metric.${m}.name`), a: t(`led.level.${dups[0][0]}`), b: t(`led.level.${dups[0][1]}`),
      }));
    }
  }

  // Quy ước cố định (mobile thu gọn)
  const rules = root.querySelector('[data-rules]');
  rules.classList.toggle('is-collapsed', !ui.rulesOpen);
  rules.querySelector('[data-toggle-rules]').setAttribute('aria-expanded', String(ui.rulesOpen));

  // Nút + dòng trạng thái
  const diff = paletteDiff(ui.palette, ui.base, config);
  const lock = lockReason(s);
  const sending = Boolean(ui.sending);
  const apply = root.querySelector('[data-act="apply"]');
  apply.disabled = Boolean(lock) || sending || !diff.length;
  apply.setAttribute('aria-busy', String(ui.sending === 'palette'));
  setText(apply, ui.sending === 'palette' ? t('led.sending') : t('led.apply'));
  root.querySelector('[data-act="cancel"]').disabled = sending || !diff.length;
  const atDefault = samePalette(ui.palette, config.led.defaultPalette);
  for (const b of root.querySelectorAll('[data-act="reset"]')) b.disabled = sending || atDefault;

  let status = '';
  if (ui.sending === 'palette') status = t('led.sending');
  else if (diff.length) status = diffSummary(diff, { t, config }) + (lock ? ` · ${t(`led.lock.${lock}`)}` : '');
  else if (ui.lastSent?.kind === 'palette') status = t('led.draft.sent', { time: formatTime(ui.lastSent.at) });
  else status = lock ? t(`led.lock.${lock}`) : t('led.draft.none');
  setText(root.querySelector('[data-status]'), status);
  root.querySelector('[data-bar]').classList.toggle('has-draft', diff.length > 0);
}

function renderTest(root, s, t, ui) {
  const { config } = s;
  const draft = ui.testColor;
  const inTest = s.led?.mode === 'test' && s.led.test;
  const sentColor = inTest ? s.led.test.color : null;
  const on = Boolean(inTest && s.led.test.on);

  paintLeds(root.querySelector('[data-test-strip]'), testLeds({ color: draft, on: true }, config));
  setText(root.querySelector('[data-test-draft]'), `${colorName(draft, config) ? `${colorName(draft, config)} · ` : ''}${draft}`);
  paintLeds(root.querySelector('[data-test-sent-strip]'), inTest ? testLeds({ color: sentColor, on }, config) : null);
  setText(root.querySelector('[data-test-sent]'), inTest
    ? t('led.test.sentValue', { color: colorLabel(sentColor, config), time: formatTime(s.led.sentAt) })
    : t('led.test.notSent'));

  for (const card of root.querySelectorAll('[data-tpick]')) setPressed(card, card.dataset.tpick === draft);
  syncHexForm(root.querySelector('.ri-ledt__palette'), 'test', ui, draft);

  const lock = lockReason(s);
  const sending = Boolean(ui.sending);
  const sw = root.querySelector('[data-act="power"]');
  sw.setAttribute('aria-checked', String(on));
  sw.disabled = Boolean(lock) || sending;
  setText(sw.querySelector('[data-power-label]'), t(on ? 'led.test.on' : 'led.test.off'));
  setText(root.querySelector('[data-power-text]'), inTest
    ? t('led.test.powerLast', { power: t(on ? 'led.test.on' : 'led.test.off') })
    : t('led.test.powerNone'));

  const same = inTest && on && sentColor === draft;
  const apply = root.querySelector('[data-act="test-apply"]');
  apply.disabled = Boolean(lock) || sending || same;
  apply.setAttribute('aria-busy', String(ui.sending === 'test'));
  setText(apply, ui.sending === 'test' ? t('led.sending') : t('led.test.apply', { color: colorLabel(draft, config) }));
  root.querySelector('[data-act="test-cancel"]').disabled = sending || draft === (sentColor ?? defaultTestColor(config));
  setText(root.querySelector('[data-status]'), ui.sending ? t('led.sending') : lock ? t(`led.lock.${lock}`) : '');
}

/** Ô nhập HEX: mở/đóng, giá trị theo màu hiện tại (trừ lúc đang gõ), báo lỗi. */
function syncHexForm(scope, key, ui, hex) {
  const custom = scope.querySelector(`[data-custom="${key}"]`);
  const form = scope.querySelector(`[data-hexform="${key}"]`);
  if (!custom || !form) return;
  const open = ui.customOpen === key;
  custom.setAttribute('aria-expanded', String(open));
  form.hidden = !open;
  const input = form.querySelector('[data-hex]');
  const err = ui.hexError === key;
  form.querySelector('[data-hexerr]').hidden = !err;
  input.classList.toggle('ri-field--error', err);
  input.setAttribute('aria-invalid', String(err));
  if (document.activeElement !== input && !err) input.value = hex;
  form.querySelector('[data-hexpick]').value = hex.toLowerCase();
}

// ---------------------------------------------------------------- trang

export default {
  mount(el, { store, t }) {
    const s0 = store.get();
    const ui = {
      tab: memo.tab ?? ((s0.led?.mode ?? s0.device?.ledMode) === 'test' ? 'test' : 'auto'),
      base: null,
      palette: null,
      editing: null,
      customOpen: null,
      hexError: null,
      expanded: new Set(),
      rulesOpen: false,
      sending: null,
      lastSent: null,
      testColor: memo.testColor ?? parseHex(s0.led?.test?.color) ?? defaultTestColor(s0.config),
    };
    let bannerKey = null;

    /** Bảng đã gửi đổi (lệnh từ tab khác, hoặc vừa gửi xong): bản nháp chưa sửa thì đi theo. */
    const syncBase = () => {
      const s = store.get();
      if (!s.config?.led) return;
      const base = sentPalette(s.led, s.config);
      if (!ui.base) {
        ui.base = base;
        ui.palette = memo.palette && memo.base && samePalette(memo.base, base) ? clonePalette(memo.palette) : clonePalette(base);
        return;
      }
      if (samePalette(ui.base, base)) return;
      if (samePalette(ui.palette, ui.base)) ui.palette = clonePalette(base);
      ui.base = base;
    };

    const render = () => {
      const s = store.get();
      if (!s.config?.led || !el.querySelector('[data-tab]')) return;
      const lock = lockReason(s);
      const key = `${lock}|${s.led?.mode ?? s.device?.ledMode}`;
      if (key !== bannerKey) {
        bannerKey = key;
        el.querySelector('[data-banners]').innerHTML = bannersHtml(t, s, lock);
      } else {
        const back = el.querySelector('[data-banners] [data-act="auto"]');
        if (back) back.disabled = Boolean(lock) || Boolean(ui.sending);
      }
      if (ui.tab === 'test') renderTest(el, s, t, ui);
      else renderAuto(el, s, t, ui);
      Object.assign(memo, { tab: ui.tab, palette: ui.palette, base: ui.base, testColor: ui.testColor });
    };

    const rebuild = () => {
      syncBase();
      bannerKey = null;
      el.innerHTML = template(t, store.get(), ui.tab);
      render();
    };

    /** Gửi lệnh; chỉ ghi "đã gửi", lỗi thì giữ bản nháp (ST-08). */
    const send = async (kind, path, body, patch) => {
      ui.sending = kind;
      render();
      try {
        const { sentAt } = await postJSON(path, body);
        // Giống state.applyLedSent ở máy chủ; tin WebSocket "led" đến sau sẽ ghi đè bằng đúng giá trị này
        store.set((s) => ({ led: { ...(s.led ?? {}), ...patch, sentAt } }));
        ui.lastSent = { kind, at: sentAt };
        showToast({
          kind: 'sent', id: 'led',
          title: t(kind === 'palette' ? 'led.toast.palette' : kind === 'auto' ? 'led.toast.auto' : 'led.toast.test'),
          body: t('led.toast.body', { time: formatTime(sentAt) }),
        });
      } catch (err) {
        const code = err?.code ?? 'NETWORK';
        const known = ['DEVICE_OFFLINE', 'MQTT_DOWN', 'NETWORK'].includes(code);
        showToast({
          kind: 'failed', id: 'led', timeoutMs: 0, title: t('led.toast.failed'),
          body: known ? t(`led.err.${code}`) : t('led.err.other', { code }),
        });
      } finally {
        ui.sending = null;
        syncBase();
        render();
      }
    };

    const applyColor = (key, hex) => {
      ui.hexError = null;
      if (key === 'test') { ui.testColor = hex; return; }
      const [m, level] = key.split('-');
      const i = levelsOf(store.get().config).indexOf(level);
      ui.palette = { ...ui.palette, [m]: ui.palette[m].map((c, k) => (k === i ? hex : c)) };
    };

    const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const onClick = (e) => {
      const target = e.target.closest('button, a');
      if (!target || !el.contains(target) || target.disabled) return;
      const s = store.get();
      const d = target.dataset;

      if (d.tab) {
        if (d.tab === ui.tab) return;
        ui.tab = d.tab;
        ui.editing = null;
        ui.customOpen = null;
        rebuild();
        el.querySelector(`[data-tab="${d.tab}"]`)?.focus();
        return;
      }
      if (d.goto) {
        ui.expanded.add(d.goto);
        render();
        const card = el.querySelector(`[data-card="${d.goto}"]`);
        card.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
        card.querySelector('h2').focus({ preventScroll: true });
        return;
      }
      if (d.toggle) {
        if (ui.expanded.has(d.toggle)) ui.expanded.delete(d.toggle); else ui.expanded.add(d.toggle);
        return render();
      }
      if ('toggleRules' in d) { ui.rulesOpen = !ui.rulesOpen; return render(); }
      if (d.level) {
        const [metric, level] = d.level.split(':');
        const open = ui.editing?.metric === metric && ui.editing.level === level;
        ui.editing = open ? null : { metric, level };
        ui.customOpen = null;
        ui.hexError = null;
        return render();
      }
      if (d.pick && ui.editing) {
        applyColor(`${ui.editing.metric}-${ui.editing.level}`, d.pick);
        return render();
      }
      if (d.tpick) { applyColor('test', d.tpick); return render(); }
      if (d.custom) {
        ui.customOpen = ui.customOpen === d.custom ? null : d.custom;
        ui.hexError = null;
        render();
        if (ui.customOpen) el.querySelector(`[data-hexform="${d.custom}"] [data-hex]`)?.focus();
        return;
      }

      switch (d.act) {
        case 'apply':
          return send('palette', '/api/led/palette', { palette: ui.palette },
            { mode: 'auto', palette: clonePalette(ui.palette), test: null });
        case 'cancel':
          ui.palette = clonePalette(ui.base);
          ui.editing = null;
          return render();
        case 'reset':
          ui.palette = clonePalette(s.config.led.defaultPalette);
          return render();
        case 'auto':
          return send('auto', '/api/led/test', { mode: 'auto' }, { mode: 'auto', test: null });
        case 'test-apply':
          return send('test', '/api/led/test', { mode: 'test', on: true, color: ui.testColor },
            { mode: 'test', test: { on: true, color: ui.testColor } });
        case 'test-cancel':
          ui.testColor = (s.led?.mode === 'test' && s.led.test?.color) || defaultTestColor(s.config);
          return render();
        case 'power': {
          const on = s.led?.mode === 'test' && s.led.test?.on;
          const color = on ? s.led.test.color : ui.testColor;
          return send('test', '/api/led/test', { mode: 'test', on: !on, color }, { mode: 'test', test: { on: !on, color } });
        }
        default:
      }
    };

    const onSubmit = (e) => {
      const form = e.target.closest('[data-hexform]');
      if (!form) return;
      e.preventDefault();
      const key = form.dataset.hexform;
      const hex = parseHex(form.querySelector('[data-hex]').value);
      if (!hex) {
        ui.hexError = key;
        render();
        form.querySelector('[data-hex]').focus();
        return;
      }
      applyColor(key, hex);
      form.querySelector('[data-hex]').value = hex;
      render();
    };

    const onChange = (e) => {
      const pick = e.target.closest('[data-hexpick]');
      if (!pick) return;
      const form = pick.closest('[data-hexform]');
      const hex = parseHex(pick.value);
      if (!hex) return;
      form.querySelector('[data-hex]').value = hex;
      applyColor(form.dataset.hexform, hex);
      render();
    };

    const onKey = (e) => {
      if (e.key !== 'Escape' || !ui.editing) return;
      const btn = el.querySelector(`[data-level="${ui.editing.metric}:${ui.editing.level}"]`);
      ui.editing = null;
      ui.customOpen = null;
      render();
      btn?.focus();
    };

    el.addEventListener('click', onClick);
    el.addEventListener('submit', onSubmit);
    el.addEventListener('change', onChange);
    el.addEventListener('keydown', onKey);

    rebuild();

    offs = [
      store.subscribe((s) => s.config, rebuild, { immediate: false }),
      store.subscribe((s) => s.led, () => { syncBase(); render(); }, { immediate: false }),
      store.subscribe((s) => s.latest, render, { immediate: false }),
      store.subscribe((s) => s.status, render, { immediate: false }),
      store.subscribe((s) => s.device, render, { immediate: false }),
      store.subscribe((s) => s.conn, render, { immediate: false }),
      () => {
        el.removeEventListener('click', onClick);
        el.removeEventListener('submit', onSubmit);
        el.removeEventListener('change', onChange);
        el.removeEventListener('keydown', onKey);
      },
    ];
  },
  unmount() {
    offs.forEach((off) => off());
    offs = [];
  },
};
