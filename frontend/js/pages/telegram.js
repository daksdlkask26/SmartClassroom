// Telegram (DK-12 / MB-12, HANDOFF §3.6). Trang hướng dẫn: 3 bước liên kết, quy tắc cảnh báo, lệnh hỏi nhanh.
// KHÔNG có trạng thái "đã liên kết" và không cho biết cảnh báo đã gửi hay chưa: backend không theo dõi việc này.
// Phần động duy nhất: vạch "hiện tại" trên thang độ ẩm và câu trả lời mẫu, dựng từ số liệu mới nhất (ghi "MINH HỌA").
// Ngưỡng 30 / 85 % và thời gian nghỉ 30 phút lấy từ contract/system.json → telegram.
import { formatNumber, NO_VALUE } from '../core/format.js';
import { botReplies, scalePercent } from '../core/device-view.js';
import { isLive } from '../core/connection.js';
import { esc, setText } from '../components/dom.js';
import { pageHead } from './_shared.js';

let offs = [];

const pct = (n) => `${Number(n.toFixed(2))}%`;

function limits(s) {
  const tg = s.config?.telegram ?? {};
  return { low: tg.humidityLow ?? 30, high: tg.humidityHigh ?? 85, m: tg.cooldownMin ?? 30 };
}

/** Chuỗi có bản dài (desktop) và bản ngắn (MB-12). */
function longShort(long, short) {
  return `<span class="is-long">${esc(long)}</span><span class="is-short">${esc(short)}</span>`;
}

function steps(t) {
  const bot = t('tg.bot');
  return `
    <section class="ri-panel ri-tg__link" aria-labelledby="tg-link">
      <div class="ri-panel__head">
        <h2 class="ri-panel__title" id="tg-link">${esc(t('tg.link'))}</h2>
        <span class="ri-panel__meta">${esc(t('tg.link.meta'))}</span>
      </div>
      <ol class="ri-tg__steps">
        <li class="ri-tgstep">
          <h3 class="ri-tgstep__title"><span class="ri-tgstep__num" aria-hidden="true">1</span>${esc(t('tg.step1.title'))}</h3>
          <p class="ri-tgstep__text">${esc(t('tg.step1.text', { bot }))}</p>
          <code class="ri-tgstep__code">${esc(bot)}</code>
          <a class="ri-btn ri-tgstep__btn" href="https://t.me/" target="_blank" rel="noopener noreferrer">${esc(t('tg.open'))}</a>
        </li>
        <li class="ri-tgstep">
          <h3 class="ri-tgstep__title"><span class="ri-tgstep__num" aria-hidden="true">2</span>${esc(t('tg.step2.title'))}</h3>
          <p class="ri-tgstep__text">${esc(t('tg.step2.text'))}</p>
          <code class="ri-tgstep__code">/start</code>
        </li>
        <li class="ri-tgstep">
          <h3 class="ri-tgstep__title"><span class="ri-tgstep__num" aria-hidden="true">3</span>${esc(t('tg.step3.title'))}</h3>
          <p class="ri-tgstep__text">${esc(t('tg.step3.text'))}</p>
          <p class="ri-tgstep__reply">${esc(t('tg.step3.reply'))}</p>
        </li>
      </ol>
      <p class="ri-tg__note">${longShort(t('tg.noStatus'), t('tg.noStatusShort'))}</p>
    </section>`;
}

function rules(t, s) {
  const { low, high, m } = limits(s);
  const nums = [[0, '0 %', ''], [low, `${low} %`, ' is-alert'], [high, `${high} %`, ' is-alert'], [100, '100 %', ' is-end']]
    .map(([v, label, cls]) => `<span class="ri-tgscale__num${cls}" style="--x:${pct(v)}">${esc(label)}</span>`).join('');
  return `
    <section class="ri-panel ri-tg__rules" aria-labelledby="tg-rules">
      <div class="ri-panel__head">
        <h2 class="ri-panel__title" id="tg-rules">${esc(t('tg.rules'))}</h2>
        <span class="ri-panel__meta">${longShort(t('tg.rules.meta'), t('tg.rules.metaShort'))}</span>
      </div>
      <p class="ri-tg__rule">${longShort(t('tg.rule', { low, high }), t('tg.ruleShort', { low, high }))}</p>

      <div class="ri-tgscale" role="img" data-scale aria-label="${esc(t('tg.scale.aria', { low, high, v: NO_VALUE }))}">
        <div class="ri-tgscale__tags" aria-hidden="true">
          <span class="ri-tgscale__tag is-alert">${longShort(t('tg.scale.low'), t('tg.scale.lowShort', { low }))}</span>
          <span class="ri-tgscale__tag ri-tgscale__tag--mid" style="--x:${pct(low)}">${esc(t('tg.scale.mid'))}</span>
          <span class="ri-tgscale__tag ri-tgscale__tag--end is-alert">${longShort(t('tg.scale.high'), t('tg.scale.highShort', { high }))}</span>
        </div>
        <div class="ri-tgscale__bar" aria-hidden="true">
          <span class="ri-tgscale__zone ri-zone--out ri-zone--edge" style="left:0;width:${pct(low)}"></span>
          <span class="ri-tgscale__zone ri-zone--out ri-zone--edge" style="left:${pct(high)};width:${pct(100 - high)}"></span>
          <i class="ri-tgscale__tick" style="--x:0%"></i>
          <i class="ri-tgscale__tick is-alert" style="--x:${pct(low)}"></i>
          <i class="ri-tgscale__tick is-alert" style="--x:${pct(high)}"></i>
          <i class="ri-tgscale__tick" style="--x:100%"></i>
          <i class="ri-tgscale__now" data-now hidden></i>
        </div>
        <div class="ri-tgscale__nums" aria-hidden="true">${nums}</div>
        <p class="ri-tgscale__nowlabel" data-now-label aria-hidden="true" hidden></p>
      </div>

      <p class="ri-tg__cooldown">${longShort(t('tg.cooldown', { m }), t('tg.cooldownShort', { m }))}</p>
      <div class="ri-cool" aria-hidden="true">
        <div class="ri-cool__labels">
          <span style="--x:18%">${esc(t('tg.cooldown.alert'))}</span>
          <span style="--x:72%">${esc(t('tg.cooldown.again'))}</span>
        </div>
        <div class="ri-cool__line">
          <span class="ri-cool__gap ri-hatch"></span>
          <i style="--x:18%"></i><i style="--x:72%"></i>
        </div>
        <p class="ri-cool__cap">${longShort(t('tg.cooldown.gap', { m }), t('tg.cooldown.gapShort', { m }))}</p>
      </div>
      <p class="ri-tg__foot">${esc(t('tg.noOther'))}</p>
    </section>`;
}

function commands(t) {
  const cmd = (name, key) => `
    <div class="ri-cmd">
      <p class="ri-cmd__head"><code class="ri-cmd__name">/${name}</code><span>${esc(t(`tg.cmd.${key}`))}</span></p>
      <div class="ri-cmd__reply">
        <p class="ri-cmd__label">${esc(t('tg.example'))}</p>
        <p class="ri-cmd__text" data-reply="${key}">${esc(t('tg.reply.none'))}</p>
      </div>
    </div>`;
  return `
    <section class="ri-panel ri-tg__ask" aria-labelledby="tg-ask">
      <div class="ri-panel__head">
        <h2 class="ri-panel__title" id="tg-ask">${esc(t('tg.ask'))}</h2>
        <span class="ri-panel__meta">${esc(t('tg.ask.meta'))}</span>
      </div>
      ${cmd('doam', 'doam')}
      ${cmd('trangthai', 'trangthai')}
    </section>`;
}

function template(t, s) {
  return pageHead({
    title: t('page.telegram.title'),
    subtitle: t('page.telegram.subtitle'),
    subtitleShort: t('page.telegram.subtitleShort'),
  }) + `
    <div class="ri-tg">
      ${steps(t)}
      ${rules(t, s)}
      ${commands(t)}
    </div>`;
}

function render(root, s, t) {
  const { low, high } = limits(s);
  // Vạch "hiện tại" chỉ khi số còn trực tiếp; cũ / ngoại tuyến thì ẩn, không chỉ vào giá trị đã qua
  const value = isLive(s.status) ? (s.latest?.humidity ?? null) : null;
  const x = scalePercent(value);
  const nowEl = root.querySelector('[data-now]');
  const labelEl = root.querySelector('[data-now-label]');
  nowEl.hidden = x === null;
  labelEl.hidden = x === null;
  const v = formatNumber(value, 1);
  if (x !== null) {
    nowEl.style.setProperty('--x', pct(x));
    labelEl.style.setProperty('--x', pct(x));
    setText(labelEl, t('tg.scale.now', { v }));
  }
  root.querySelector('[data-scale]').setAttribute('aria-label', t('tg.scale.aria', { low, high, v }));

  const replies = botReplies({ latest: s.latest, device: s.device, status: s.status, config: s.config, t });
  setText(root.querySelector('[data-reply="doam"]'), replies.doam);
  setText(root.querySelector('[data-reply="trangthai"]'), replies.trangthai);
}

export default {
  mount(el, { store, t }) {
    el.innerHTML = template(t, store.get());
    const renderAll = () => render(el, store.get(), t);
    offs = [
      // Ngưỡng nằm trong khung tĩnh → dựng lại khi config (đến qua "hello") về sau
      store.subscribe((s) => s.config, () => { el.innerHTML = template(t, store.get()); renderAll(); }, { immediate: false }),
      store.subscribe((s) => s.latest, renderAll),
      store.subscribe((s) => s.status, renderAll, { immediate: false }),
      store.subscribe((s) => s.device, renderAll, { immediate: false }),
    ];
  },
  unmount() {
    offs.forEach((off) => off());
    offs = [];
  },
};
