// Giám sát (DK-04 / MB-04).
// 6 vùng: Device Twin · hero độ ẩm (gauge L, số, nhãn mức, dải đèn hiệu) · thẻ nhiệt độ và CO₂ (gauge S)
// · thẻ Đèn LED (thanh 8 bóng + tóm tắt mức) · 24 giờ qua (3 sparkline từ /api/history).
// Không bao giờ hiện số giả: thiếu dữ liệu → "—", gauge trống, đèn xám "không rõ".
import { STATUS, isLive } from '../core/connection.js';
import { formatNumber, formatTime, splitNumber, NO_VALUE } from '../core/format.js';
import { serverNow, onTick } from '../core/clock.js';
import { getJSON } from '../core/api.js';
import { ledColors, ledSummary } from '../core/led.js';
import { sparkGeometry, dayRange } from '../core/spark.js';
import { esc, icon, setText } from '../components/dom.js';
import { gaugeSvg, setGauge } from '../components/gauge.js';
import { ledStrip, paintLeds } from '../components/led-strip.js';
import { twinSvg, twinLegend } from '../components/twin.js';
import { sparkSvg } from '../components/spark.js';
import { pageHead } from './_shared.js';

const METRICS = {
  humidity:    { titleKey: 'metric.humidity',    nameKey: 'metric.humidity.name',    sensor: 'dht22', sensorKey: 'metric.sensor.dht22' },
  temperature: { titleKey: 'metric.temperature', nameKey: 'metric.temperature.name', sensor: 'dht22', sensorKey: 'metric.sensor.dht22' },
  co2:         { titleKey: 'metric.co2',         nameKey: 'metric.co2.name',         sensor: 'mq135', sensorKey: 'metric.sensor.mq135' },
};
const FALLBACK_UNITS = { humidity: ['%', 1], temperature: ['°C', 1], co2: ['ppm', 0] };
const LEVEL_KEYS = { normal: 'metric.level.normal', watch: 'metric.level.watch', alert: 'metric.level.alert' };
// Thang gauge (HANDOFF §3.1) khi config (đến qua "hello") chưa về; trùng contract/system.json
const FALLBACK_SCALE = { humidity: [0, 100], temperature: [10, 40], co2: [400, 2000] };
const DAY_METRICS = ['humidity', 'temperature', 'co2'];
const DAY_REFRESH_MS = 5 * 60 * 1000;

let offs = [];

/** Ngưỡng cảnh báo độ ẩm 30 / 85 % (chốt, trùng ngưỡng Telegram) lấy từ contract, không viết cứng. */
function humidityLimits(s) {
  return [s.config?.telegram?.humidityLow ?? 30, s.config?.telegram?.humidityHigh ?? 85];
}

function gaugeFor(metric, size, s) {
  const [min, max] = s.config?.metrics?.[metric]?.scale ?? FALLBACK_SCALE[metric];
  if (metric !== 'humidity') {
    return gaugeSvg({ metric, size, min, max, labels: [min, (min + max) / 2, max] });
  }
  const [low, high] = humidityLimits(s);
  return gaugeSvg({ metric, size, min, max, labels: [min, low, high, max], bands: [[min, low], [high, max]], marks: [low, high] });
}

function annunciator(t) {
  return `
    <ol class="ri-annunciator" data-annunciator hidden aria-label="${esc(t('humidity.band.label'))}">
      <li data-band="low"></li><li data-band="mid"></li><li data-band="high"></li>
    </ol>`;
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

function metricCard(t, metric, s) {
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
      ${gaugeFor(metric, 's', s)}
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
        ${twinSvg(t)}
        ${twinLegend(t)}
      </section>

      <section class="ri-panel ri-panel--hero ri-monitor__humidity" data-metric="humidity" aria-labelledby="mon-humidity">
        <i class="ri-screw ri-screw--tl" aria-hidden="true"></i><i class="ri-screw ri-screw--tr" aria-hidden="true"></i>
        <i class="ri-screw ri-screw--bl" aria-hidden="true"></i><i class="ri-screw ri-screw--br" aria-hidden="true"></i>
        <div class="ri-panel__head">
          <h2 class="ri-panel__title" id="mon-humidity">${esc(t('metric.humidity'))}</h2>
          <span class="ri-panel__meta">${esc(t('metric.sensor.dht22'))}</span>
        </div>
        <div class="ri-hero">
          ${gaugeFor('humidity', 'l', s)}
          <div class="ri-hero__read">
            ${readout('humidity', 'hero')}
            <p class="ri-sensor" data-sensor hidden></p>
            ${staleTag()}
          </div>
          <div class="ri-hero__level">
            ${levelChip()}
            <p class="ri-hero__note" data-note></p>
          </div>
          ${annunciator(t)}
        </div>
      </section>

      ${metricCard(t, 'temperature', s)}
      ${metricCard(t, 'co2', s)}

      <section class="ri-panel ri-monitor__led" aria-labelledby="mon-led">
        <div class="ri-panel__head">
          <h2 class="ri-panel__title" id="mon-led">${esc(t('monitor.led'))}</h2>
        </div>
        <div class="ri-ledcard">
          ${ledStrip()}
          <div class="ri-ledcard__text">
            <p class="ri-panel__title" data-led-mode>—</p>
            <p class="ri-ledcard__summary" data-led-summary></p>
            <p class="ri-ledcard__sent" data-led-sent></p>
            <p class="ri-ledcard__blink" data-led-blink hidden></p>
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
          ${DAY_METRICS.map((metric) => `
            <a class="ri-spark" data-metric="${metric}" href="/lich-su?chi-so=${{ humidity: 'do-am', temperature: 'nhiet-do', co2: 'co2' }[metric]}">
              <span class="ri-spark__head">
                <span class="ri-panel__title">${esc(t(METRICS[metric].titleKey))}</span>
                <span class="ri-panel__meta" data-spark-range>${NO_VALUE}</span>
              </span>
              <span class="ri-spark__plot" data-spark-plot><span class="ri-spark__empty">${NO_VALUE}</span></span>
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

  // Gauge: trống khi không có số; mờ khi số không còn trực tiếp. Mức nằm trong aria-valuetext (§3.12)
  const gaugeEl = box.querySelector('.ri-gauge');
  if (gaugeEl) {
    const levelWord = showLevel ? ` — ${t(LEVEL_KEYS[level]).toLowerCase()}` : '';
    setGauge(gaugeEl, {
      value,
      stale: !live,
      valueText: value === null ? t('metric.noData') : `${text} ${unit}${levelWord}`,
    });
  }

  // Câu dưới số
  const noteEl = box.querySelector('[data-note]');
  if (noteEl && metric === 'humidity') {
    const [low, high] = humidityLimits(s);
    const v = formatNumber(value, decimals);
    const note = value === null ? t('humidity.normal')
      : value > high ? t('humidity.high', { v }) : value < low ? t('humidity.low', { v }) : t('humidity.normal');
    setText(noteEl, note);

    // Dải đèn hiệu 3 mức: chỉ hiện khi số trực tiếp nằm ngoài 30–85 % (HANDOFF §3.11)
    const ann = box.querySelector('[data-annunciator]');
    const band = value === null ? null : value < low ? 'low' : value > high ? 'high' : 'mid';
    ann.hidden = !(live && band && band !== 'mid');
    for (const li of ann.children) {
      setText(li, t(`humidity.band.${li.dataset.band}`, { low, high }));
      const lit = li.dataset.band === band;
      li.classList.toggle('is-lit', lit);
      if (lit) li.setAttribute('aria-current', 'true');
      else li.removeAttribute('aria-current');
    }
  }
}

/** Thanh LED trên thẻ + 8 ô trong Device Twin: mô phỏng từ bản tin mới nhất và bảng màu đã gửi (HANDOFF §3.5). */
function renderLed(root, s, t) {
  const live = isLive(s.status);
  const result = ledColors({ latest: s.latest, led: s.led, config: s.config, live });
  paintLeds(root, result);

  const mode = s.led?.mode ?? s.device?.ledMode ?? null;
  setText(root.querySelector('[data-led-mode]'),
    mode === 'auto' ? t('monitor.led.auto') : mode === 'test' ? t('monitor.led.test') : NO_VALUE);
  setText(root.querySelector('[data-led-summary]'),
    !result ? t('monitor.led.unknown') : mode === 'test' ? '' : ledSummary(s.latest?.levels, t));
  setText(root.querySelector('[data-led-sent]'),
    s.led?.sentAt ? t('monitor.led.sent', { time: formatTime(s.led.sentAt) }) : t('monitor.led.notSent'));

  // DHT22 lỗi làm cả nhiệt độ và độ ẩm "error": chỉ xét nhiệt độ để không lặp câu
  const msgs = [];
  if (result?.blink.temperature === 'error') msgs.push(t('led.blink.sensorError'));
  if (result?.blink.co2 === 'warming') msgs.push(t('led.blink.warming'));
  const blinkEl = root.querySelector('[data-led-blink]');
  blinkEl.hidden = !msgs.length;
  setText(blinkEl, msgs.join(' · '));
}

/** Vẽ 3 sparkline + khoảng giá trị; results = Promise.allSettled của 3 lần gọi /api/history. */
function renderDay(root, s, t, results) {
  if (!results) return;
  const [, high] = humidityLimits(s);
  results.forEach((r, i) => {
    const metric = DAY_METRICS[i];
    const card = root.querySelector(`.ri-spark[data-metric="${metric}"]`);
    if (!card) return;
    const plot = card.querySelector('[data-spark-plot]');
    const rangeEl = card.querySelector('[data-spark-range]');
    if (r.status !== 'fulfilled') {
      plot.innerHTML = `<span class="ri-spark__empty">${esc(t('monitor.day.error'))}</span>`;
      setText(rangeEl, NO_VALUE);
      return;
    }
    const points = r.value?.points ?? [];
    const cfg = s.config?.metrics?.[metric];
    const [unit, decimals] = cfg ? [cfg.unit, cfg.decimals] : FALLBACK_UNITS[metric];
    const isHum = metric === 'humidity';
    const geo = sparkGeometry(points, { include: isHum ? [high] : [] });
    const mid = points[Math.floor((points.length - 1) / 2)];
    plot.innerHTML = geo
      ? sparkSvg(geo, { threshold: isHum ? high : null })
        + `<span class="ri-spark__axis" aria-hidden="true"><span>${esc(formatTime(points[0].t))}</span>`
        + `<span>${esc(formatTime(mid.t))}</span><span>${esc(formatTime(points.at(-1).t))}</span></span>`
      : `<span class="ri-spark__empty">${NO_VALUE}</span>`;

    const range = dayRange(points);
    const fmt = (v) => formatNumber(v, decimals);
    const rangeText = range ? t('monitor.day.rangeValue', { min: fmt(range.min), max: fmt(range.max), unit }) : NO_VALUE;
    setText(rangeEl, rangeText);
    card.setAttribute('aria-label', t('monitor.day.aria', { name: t(METRICS[metric].nameKey), range: rangeText }));
    if (metric === 'temperature') {
      setText(root.querySelector('[data-metric="temperature"] [data-note]'),
        range ? t('monitor.card.day', { min: fmt(range.min), max: fmt(range.max), unit }) : '');
    }
  });
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
    let dayResults = null;
    const ctrl = new AbortController();
    el.innerHTML = template(t, store.get());

    const renderAll = () => {
      const s = store.get();
      for (const metric of Object.keys(METRICS)) renderMetric(el, metric, s, t);
      renderLed(el, s, t);
      el.querySelector('.ri-twin')?.classList.toggle('is-offline', s.status === STATUS.DEVICE_OFFLINE);
    };

    // Thang gauge và ngưỡng nằm sẵn trong SVG → đổi chế độ sim/live hoặc config đến sau thì dựng lại cả trang
    const rebuild = () => {
      el.innerHTML = template(t, store.get());
      renderAll();
      renderDayRange(el, t);
      renderDay(el, store.get(), t, dayResults);
    };

    const refreshDay = async () => {
      const results = await Promise.allSettled(DAY_METRICS.map((m) =>
        getJSON(`/api/history?metric=${m}&bucket=hour`, { signal: ctrl.signal })));
      if (ctrl.signal.aborted) return;
      dayResults = results;
      renderDay(el, store.get(), t, dayResults);
    };

    offs = [
      store.subscribe((s) => s.mode, (m) => {
        if (m === mode) return;
        mode = m;
        rebuild();
      }, { immediate: false }),
      store.subscribe((s) => s.config, rebuild, { immediate: false }),
      store.subscribe((s) => s.latest, renderAll),
      store.subscribe((s) => s.status, renderAll, { immediate: false }),
      store.subscribe((s) => s.led, renderAll, { immediate: false }),
      store.subscribe((s) => s.device, renderAll, { immediate: false }),
      onTick(() => renderDayRange(el, t)),
    ];
    renderDayRange(el, t);

    refreshDay();
    const dayTimer = setInterval(refreshDay, DAY_REFRESH_MS);
    offs.push(() => { ctrl.abort(); clearInterval(dayTimer); });
  },
  unmount() {
    offs.forEach((off) => off());
    offs = [];
  },
};
