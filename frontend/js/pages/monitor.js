// Giám sát (DK-04 / MB-04).
// G4: bố cục đủ 6 vùng theo thiết kế, số đo trực tiếp (chữ số Doto), nhãn mức, trạng thái cảm biến và "dữ liệu cũ".
// G5: thay các ô [data-slot] bằng gauge, thanh LED 8 bóng, Device Twin, sparkline 24 giờ.
import { STATUS, isLive } from '../core/connection.js';
import { formatNumber, formatTime, splitNumber, NO_VALUE } from '../core/format.js';
import { serverNow, onTick } from '../core/clock.js';
import { cells, esc, icon, setText } from '../components/dom.js';
import { pageHead } from './_shared.js';

const METRICS = {
  humidity:    { titleKey: 'metric.humidity',    nameKey: 'metric.humidity.name',    sensor: 'dht22', sensorKey: 'metric.sensor.dht22' },
  temperature: { titleKey: 'metric.temperature', nameKey: 'metric.temperature.name', sensor: 'dht22', sensorKey: 'metric.sensor.dht22' },
  co2:         { titleKey: 'metric.co2',         nameKey: 'metric.co2.name',         sensor: 'mq135', sensorKey: 'metric.sensor.mq135' },
};
const FALLBACK_UNITS = { humidity: ['%', 1], temperature: ['°C', 1], co2: ['ppm', 0] };
const LEVEL_KEYS = { normal: 'metric.level.normal', watch: 'metric.level.watch', alert: 'metric.level.alert' };

let offs = [];

function slot(t, kind, { invert = false } = {}) {
  return `
    <div class="ri-slot ri-slot--${kind}${invert ? ' ri-slot--invert' : ''}" data-slot="${kind}">
      ${cells(0, 'ri-cells--sweep')}
      <span class="ri-slot__text">${esc(t('wip.instrument'))}</span>
    </div>`;
}

function readout(metric, size) {
  return `
    <p class="ri-readout ri-readout--${size}" data-readout="${metric}">
      <span class="ri-readout__value" data-value>${NO_VALUE}</span><span class="ri-readout__unit" data-unit></span>
    </p>`;
}

function staleTag() {
  return `<p class="ri-stale" data-stale hidden>${icon('clock', 'ri-icon--sm')}<span data-stale-text></span></p>`;
}

function levelChip() {
  return '<span class="ri-level" data-level hidden></span>';
}

function metricCard(t, metric) {
  const m = METRICS[metric];
  const note = metric === 'co2'
    ? `<p class="ri-card__note ri-card__note--strong" title="${esc(t('metric.co2.note'))}">${esc(t('metric.co2.short'))}</p>`
    : '<p class="ri-card__note" data-note></p>';
  return `
    <section class="ri-panel ri-card ri-monitor__${metric}" data-metric="${metric}" aria-labelledby="mon-${metric}">
      <div class="ri-panel__head">
        <h2 class="ri-panel__title" id="mon-${metric}">${esc(t(m.titleKey))}</h2>
        <span class="ri-panel__meta">${esc(t(m.sensorKey))}</span>
      </div>
      ${slot(t, 'gauge-s')}
      ${readout(metric, 'card')}
      <p class="ri-sensor" data-sensor hidden></p>
      ${staleTag()}
      ${levelChip()}
      ${note}
    </section>`;
}

function template(t, s) {
  const sim = s.mode === 'sim';
  const subtitle = t('page.monitor.subtitle') + (sim ? ` · ${t('page.monitor.subtitleSim')}` : '');
  const subtitleShort = t('page.monitor.subtitleShort') + (sim ? ` · ${t('page.monitor.subtitleSimShort')}` : '');
  const deviceId = (s.config?.deviceId ?? 'sc-01').toUpperCase();

  return pageHead({ title: t('page.monitor.title'), subtitle, subtitleShort }) + `
    <div class="ri-monitor">
      <section class="ri-panel ri-monitor__twin" aria-labelledby="mon-twin">
        <div class="ri-panel__head">
          <h2 class="ri-panel__title" id="mon-twin">${esc(t('monitor.twin'))}</h2>
          <span class="ri-panel__meta">${esc(t('monitor.twin.meta', { id: deviceId }))}</span>
        </div>
        ${slot(t, 'twin')}
      </section>

      <section class="ri-panel ri-panel--hero ri-monitor__humidity" data-metric="humidity" aria-labelledby="mon-humidity">
        <i class="ri-screw ri-screw--tl" aria-hidden="true"></i><i class="ri-screw ri-screw--tr" aria-hidden="true"></i>
        <i class="ri-screw ri-screw--bl" aria-hidden="true"></i><i class="ri-screw ri-screw--br" aria-hidden="true"></i>
        <div class="ri-panel__head">
          <h2 class="ri-panel__title" id="mon-humidity">${esc(t('metric.humidity'))}</h2>
          <span class="ri-panel__meta">${esc(t('metric.sensor.dht22'))}</span>
        </div>
        <div class="ri-hero">
          ${slot(t, 'gauge-l', { invert: true })}
          <div class="ri-hero__read">
            ${readout('humidity', 'hero')}
            <p class="ri-sensor" data-sensor hidden></p>
            ${staleTag()}
          </div>
          <div class="ri-hero__level">
            ${levelChip()}
            <p class="ri-hero__note" data-note></p>
          </div>
        </div>
      </section>

      ${metricCard(t, 'temperature')}
      ${metricCard(t, 'co2')}

      <section class="ri-panel ri-monitor__led" aria-labelledby="mon-led">
        <div class="ri-panel__head">
          <h2 class="ri-panel__title" id="mon-led">${esc(t('monitor.led'))}</h2>
        </div>
        <div class="ri-ledcard">
          ${slot(t, 'strip')}
          <div class="ri-ledcard__text">
            <p class="ri-panel__title" data-led-mode>—</p>
            <p class="ri-ledcard__sent" data-led-sent></p>
          </div>
          <a class="ri-btn ri-ledcard__btn" href="/den-led">${esc(t('monitor.led.palette'))}</a>
        </div>
      </section>

      <section class="ri-panel ri-monitor__day" aria-labelledby="mon-day">
        <div class="ri-panel__head ri-day__head">
          <p class="ri-day__title">
            <span class="ri-panel__title" id="mon-day">${esc(t('monitor.day'))}</span>
            <span class="ri-day__range" data-day-range></span>
          </p>
          <a class="ri-link" href="/lich-su">${esc(t('monitor.day.open'))}</a>
        </div>
        <div class="ri-day">
          ${['humidity', 'temperature', 'co2'].map((metric) => `
            <a class="ri-spark" href="/lich-su?chi-so=${{ humidity: 'do-am', temperature: 'nhiet-do', co2: 'co2' }[metric]}">
              <span class="ri-spark__head">
                <span class="ri-panel__title">${esc(t(METRICS[metric].titleKey))}</span>
                <span class="ri-panel__meta">${NO_VALUE}</span>
              </span>
              ${slot(t, 'spark')}
            </a>`).join('')}
        </div>
      </section>
    </div>`;
}

/** Cập nhật một khối thông số (hero độ ẩm hoặc thẻ nhiệt độ / CO₂). */
function renderMetric(root, metric, s, t) {
  const box = root.querySelector(`[data-metric="${metric}"]`);
  if (!box) return;
  const cfg = s.config?.metrics?.[metric];
  const [unit, decimals] = cfg ? [cfg.unit, cfg.decimals] : FALLBACK_UNITS[metric];
  const latest = s.latest;
  const sensorState = latest?.sensors?.[METRICS[metric].sensor];
  const value = latest?.[metric] ?? null;
  const live = isLive(s.status);
  const text = formatNumber(value, decimals);

  // Số đo: "—" khi chưa có / không đọc được; giữ giá trị cuối (mờ) khi cũ / mất kết nối / ngoại tuyến
  // Chữ số Doto; dấu phẩy JetBrains Mono nhỏ hơn để khoảng cách giống DK-04 (G5 thêm hiệu ứng lật số)
  const valueEl = box.querySelector('[data-value]');
  if (valueEl.dataset.text !== text) {
    valueEl.dataset.text = text;
    const { int, sep, frac } = splitNumber(value, decimals);
    valueEl.innerHTML = `${esc(int)}${sep ? `<span class="ri-readout__sep">${esc(sep)}</span>${esc(frac)}` : ''}`;
  }
  setText(box.querySelector('[data-unit]'), value === null ? '' : unit);
  const readEl = box.querySelector('[data-readout]');
  readEl.classList.toggle('is-stale', value !== null && !live);
  readEl.setAttribute('aria-label', value === null
    ? `${t(METRICS[metric].nameKey)}: ${t('metric.noData')}`
    : `${t(METRICS[metric].nameKey)} ${text} ${t(`metric.${metric}.unitSpoken`)}`);

  // Cảm biến lỗi / đang làm nóng
  const sensorEl = box.querySelector('[data-sensor]');
  const sensorText = sensorState === 'error' ? t('metric.sensorError')
    : sensorState === 'warming' ? t('metric.co2.warming') : '';
  sensorEl.hidden = !sensorText;
  setText(sensorEl, sensorText);

  // "CŨ · hh:mm" khi số không còn là số trực tiếp
  const staleEl = box.querySelector('[data-stale]');
  const showStale = value !== null && !live && s.status !== STATUS.CONNECTING;
  staleEl.hidden = !showStale;
  if (showStale) setText(staleEl.querySelector('[data-stale-text]'), t('metric.stale', { time: formatTime(latest.receivedAt) }));

  // Nhãn mức chỉ khi số đáng tin (HANDOFF §3.12)
  const level = latest?.levels?.[metric];
  const levelEl = box.querySelector('[data-level]');
  const showLevel = live && value !== null && LEVEL_KEYS[level];
  levelEl.hidden = !showLevel;
  if (showLevel) {
    levelEl.className = `ri-level ri-level--${level}`;
    setText(levelEl, t(LEVEL_KEYS[level]));
  }

  // Câu dưới số
  const noteEl = box.querySelector('[data-note]');
  if (noteEl && metric === 'humidity') {
    // Ngưỡng cảnh báo độ ẩm 30 / 85 % (chốt, trùng ngưỡng Telegram) lấy từ contract, không viết cứng
    const low = s.config?.telegram?.humidityLow ?? 30;
    const high = s.config?.telegram?.humidityHigh ?? 85;
    const v = formatNumber(value, decimals);
    const note = value === null ? t('humidity.normal')
      : value > high ? t('humidity.high', { v }) : value < low ? t('humidity.low', { v }) : t('humidity.normal');
    setText(noteEl, note);
  }
}

function renderLed(root, s, t) {
  const mode = s.led?.mode ?? s.device?.ledMode ?? null;
  setText(root.querySelector('[data-led-mode]'),
    mode === 'auto' ? t('monitor.led.auto') : mode === 'test' ? t('monitor.led.test') : NO_VALUE);
  setText(root.querySelector('[data-led-sent]'),
    s.led?.sentAt ? t('monitor.led.sent', { time: formatTime(s.led.sentAt) }) : t('monitor.led.notSent'));
}

function renderDayRange(root, t) {
  const hour = new Date(serverNow());
  hour.setMinutes(0, 0, 0);
  const hh = formatTime(hour);
  setText(root.querySelector('[data-day-range]'), t('monitor.day.range', { from: hh, to: hh }));
}

export default {
  mount(el, { store, t }) {
    let mode = store.get().mode;
    el.innerHTML = template(t, store.get());

    const renderAll = () => {
      const s = store.get();
      for (const metric of Object.keys(METRICS)) renderMetric(el, metric, s, t);
      renderLed(el, s, t);
    };

    offs = [
      // Chế độ sim/live chỉ đổi tiêu đề phụ: vẽ lại toàn trang (hiếm khi xảy ra)
      store.subscribe((s) => s.mode, (m) => {
        if (m === mode) return;
        mode = m;
        el.innerHTML = template(t, store.get());
        renderAll();
        renderDayRange(el, t);
      }, { immediate: false }),
      store.subscribe((s) => s.latest, renderAll),
      store.subscribe((s) => s.status, renderAll, { immediate: false }),
      store.subscribe((s) => s.config, renderAll, { immediate: false }),
      store.subscribe((s) => s.led, renderAll, { immediate: false }),
      store.subscribe((s) => s.device, renderAll, { immediate: false }),
      onTick(() => renderDayRange(el, t)),
    ];
    renderDayRange(el, t);
  },
  unmount() {
    offs.forEach((off) => off());
    offs = [];
  },
};
