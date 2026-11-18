// Bản sao thiết bị — Device Twin (HANDOFF §2, khung Figma DeviceTwin/Desktop · Body và · Offline).
// Hình chiếu bằng (nắp) 160 × 100 mm + hình chiếu đứng (mặt trước) 160 × 60 mm, tỉ lệ 2,4 px/mm,
// tọa độ đo trên ảnh báo cáo Docs/images/wireframes-room-instrument/clean/dk04.png.
// 8 ô LED mang data-n="1…8" nên paintLeds() (led-strip.js) tô màu giống thanh LED trên thẻ.
// Ngoại tuyến: lớp .is-offline trên <svg> → viền hộp nét đứt 6 4.
import { esc, icon } from './dom.js';

const X = 70;          // mép trái hộp
const Y = 70;          // mép trên nắp
const W = 384;         // 160 mm
const TOP_H = 240;     // 100 mm
const FRONT_Y = Y + 274;
const FRONT_H = 144;   // 60 mm
const GROUP_ICONS = ['power', 'thermometer', 'droplet', 'wind'];

/** Ô nhãn chữ cái (A–E). dark = ô đen chữ trắng (trên mặt trước sáng). */
function key(x, y, letter, dark = false) {
  return `<g class="ri-twin__key${dark ? ' ri-twin__key--dark' : ''}">
      <rect x="${x}" y="${y}" width="19" height="20"/>
      <text x="${x + 9.5}" y="${y + 10.5}" text-anchor="middle" dominant-baseline="middle">${letter}</text>
    </g>`;
}

/** Lưới thông gió của cảm biến: n vạch ngang. */
function grille(x, y, w, n) {
  let s = '';
  for (let i = 0; i < n; i++) s += `<line x1="${x}" x2="${x + w}" y1="${y + i * 7}" y2="${y + i * 7}"/>`;
  return `<g class="ri-twin__grille">${s}</g>`;
}

/** Đường kích thước có vạch chặn hai đầu. */
function dimV(x, y1, y2, label) {
  return `<g class="ri-twin__dim">
      <line x1="${x}" x2="${x}" y1="${y1}" y2="${y2}"/>
      <line x1="${x - 5}" x2="${x + 5}" y1="${y1}" y2="${y1}"/><line x1="${x - 5}" x2="${x + 5}" y1="${y2}" y2="${y2}"/>
      <text x="${x - 12}" y="${(y1 + y2) / 2}" text-anchor="end" dominant-baseline="middle">${label}</text>
    </g>`;
}

function dimH(y, x1, x2, label) {
  return `<g class="ri-twin__dim">
      <line x1="${x1}" x2="${x2}" y1="${y}" y2="${y}"/>
      <line x1="${x1}" x2="${x1}" y1="${y - 5}" y2="${y + 5}"/><line x1="${x2}" x2="${x2}" y1="${y - 5}" y2="${y + 5}"/>
      <text x="${(x1 + x2) / 2}" y="${y + 16}" text-anchor="middle" dominant-baseline="middle">${label}</text>
    </g>`;
}

export function twinSvg(t) {
  const screws = [[X + 14, Y + 13], [X + W - 14, Y + 13], [X + 14, Y + TOP_H - 15], [X + W - 14, Y + TOP_H - 15]]
    .map(([cx, cy]) => `<g class="ri-twin__screw"><circle cx="${cx}" cy="${cy}" r="6"/><circle cx="${cx}" cy="${cy}" r="1.5"/></g>`).join('');

  // Cửa sổ LED ở giữa mặt trước: 8 ô 15 × 35, bước 19,3 (đo trên dk04)
  const winX = X + 82, winY = FRONT_Y + 46, winW = 166, winH = 53;
  let leds = '';
  for (let n = 1; n <= 8; n++) {
    leds += `<rect class="ri-twin__led" data-n="${n}" x="${(winX + 8 + (n - 1) * 19.3).toFixed(1)}" y="${winY + 9}" width="15" height="35"/>`;
  }
  // 4 biểu tượng nhóm căn giữa dưới mỗi cặp bóng
  const icons = GROUP_ICONS.map((name, g) => {
    const cx = winX + 8 + g * 2 * 19.3 + (19.3 + 15) / 2;
    return `<use href="/icons/sprite.svg#i-${name}" x="${(cx - 11).toFixed(1)}" y="${FRONT_Y + 107}" width="22" height="22"/>`;
  }).join('');

  return `
    <svg class="ri-twin" viewBox="0 0 484 530" role="img" aria-label="${esc(t('monitor.twin.aria'))}" focusable="false">
      <text class="ri-twin__caption" x="${X}" y="${Y - 47}" dominant-baseline="middle">${esc(t('monitor.twin.top'))}</text>

      <rect class="ri-twin__usb" x="${X + 186}" y="${Y - 6}" width="30" height="6"/>
      <text class="ri-twin__note" x="${X + 222}" y="${Y - 11}" dominant-baseline="middle">${esc(t('monitor.twin.usb'))}</text>

      <rect class="ri-twin__body ri-twin__lid" x="${X}" y="${Y}" width="${W}" height="${TOP_H}"/>
      ${screws}
      ${grille(X + 38, Y + 32, 53, 7)}
      ${grille(X + 298, Y + 119, 57, 8)}
      <circle class="ri-twin__boot" cx="${X + 235}" cy="${Y + 61}" r="5"/>
      <text class="ri-twin__brand" x="${X + 34}" y="${Y + 187}">${esc(t('app.brand'))}</text>
      <text class="ri-twin__tagline" x="${X + 34}" y="${Y + 205}">${esc(t('app.tagline'))}</text>
      ${key(X + 56, Y + 15, 'B')}
      ${key(X + 182, Y + 110, 'A')}
      ${key(X + 317, Y + 101, 'C')}
      ${key(X + 243, Y + 52, 'E')}

      <line class="ri-twin__link" x1="${X}" x2="${X}" y1="${Y + TOP_H + 2}" y2="${FRONT_Y - 2}"/>
      <line class="ri-twin__link" x1="${X + W}" x2="${X + W}" y1="${Y + TOP_H + 2}" y2="${FRONT_Y - 2}"/>
      <text class="ri-twin__caption" x="${X + 12}" y="${FRONT_Y - 18}" dominant-baseline="middle">${esc(t('monitor.twin.front'))}</text>

      <rect class="ri-twin__body ri-twin__front" x="${X}" y="${FRONT_Y}" width="${W}" height="${FRONT_H}"/>
      <rect class="ri-twin__rim" x="${X}" y="${FRONT_Y}" width="${W}" height="5"/>
      <rect class="ri-twin__window" x="${winX}" y="${winY}" width="${winW}" height="${winH}"/>
      ${leds}
      ${key(winX + winW + 8, winY + 18, 'D', true)}
      <g class="ri-twin__icons">${icons}</g>

      ${dimV(X - 28, Y, Y + TOP_H, '100')}
      ${dimV(X - 28, FRONT_Y, FRONT_Y + FRONT_H, '60')}
      ${dimH(FRONT_Y + FRONT_H + 16, X, X + W, '160 mm')}
    </svg>`;
}

/** Chú giải B/C/D/E và nhãn 4 nhóm in dưới cửa sổ LED (dk04). */
export function twinLegend(t) {
  const rows = [['B', 'DHT22', 'monitor.twin.b'], ['C', 'MQ-135', 'monitor.twin.c'],
    ['D', 'LED', 'monitor.twin.d'], ['E', 'BOOT', 'monitor.twin.e']]
    .map(([k, part, desc]) => `<div class="ri-twin__row"><dt><span class="ri-key">${k}</span>${esc(part)}</dt><dd>${esc(t(desc))}</dd></div>`)
    .join('');
  const groups = GROUP_ICONS.map((name, g) =>
    `<li>${icon(name, "ri-icon--sm")}<b>${2 * g + 1}–${2 * g + 2}</b><span>${esc(t(`monitor.twin.g${g + 1}`))}</span></li>`).join('');
  return `
    <dl class="ri-twin__legend">${rows}</dl>
    <p class="ri-twin__groups-title">${esc(t('monitor.twin.groups'))}</p>
    <ul class="ri-twin__groups">${groups}</ul>`;
}
