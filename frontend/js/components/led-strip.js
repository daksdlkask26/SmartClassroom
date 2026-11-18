// Thanh LED 8 bóng chia 4 cặp (HANDOFF §2, §3.5). Chỉ hiển thị: phần đọc được là dòng tóm tắt bằng chữ.
// paintLeds() tô mọi phần tử [data-n] trong root, nên dùng chung cho thanh trên thẻ và 8 ô trong Device Twin.

const GROUPS = [['system', [1, 2]], ['temperature', [3, 4]], ['humidity', [5, 6]], ['co2', [7, 8]]];

export function ledStrip() {
  const pairs = GROUPS.map(([g, ns]) =>
    `<span class="ri-led__pair" data-pair="${g}">${ns.map((n) => `<i class="ri-led__cell" data-n="${n}"></i>`).join('')}</span>`).join('');
  return `<span class="ri-led" data-led aria-hidden="true">${pairs}</span>`;
}

/** result = ledColors(...) (core/led.js) hoặc null = không rõ. */
export function paintLeds(root, result) {
  for (const cell of root.querySelectorAll('[data-n]')) {
    const c = result?.colors[Number(cell.dataset.n) - 1] ?? null;
    cell.classList.toggle('is-unknown', c === null);
    cell.classList.toggle('is-blink', c === 'blink');
    cell.classList.toggle('is-off', c === 'off');
    if (c && c !== 'blink' && c !== 'off') cell.style.setProperty('--led', c);
    else cell.style.removeProperty('--led');
  }
  for (const pair of root.querySelectorAll('[data-pair]')) {
    pair.classList.toggle('is-blink', Boolean(result?.blink?.[pair.dataset.pair]));
  }
}
