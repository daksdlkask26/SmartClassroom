// Kiểm tra thân yêu cầu POST /api/led/* và dựng lệnh led/cmd (contract/README.md mục 2.3, 6).
// Hàm thuần: trả { ok: true, cmd, patch } hoặc { ok: false, status, code, message }.
//   cmd   = JSON gửi lên topic led/cmd
//   patch = phần LedState cập nhật sau khi publish xong (state.applyLedSent)

const HEX = /^#[0-9a-f]{6}$/i;
const METRICS = ['temperature', 'humidity', 'co2'];

const fail = (status, code, message) => ({ ok: false, status, code, message });

/** '#ff7a00' → '#FF7A00'; sai định dạng → null. Chỉ nhận đúng 7 ký tự #RRGGBB như contract. */
export function normalizeHex(value) {
  return typeof value === 'string' && HEX.test(value) ? value.toUpperCase() : null;
}

/** POST /api/led/palette { palette: { temperature:[n,w,a], humidity:[…], co2:[…] } } */
export function parsePaletteBody(body, { levelCount = 3 } = {}) {
  const palette = body?.palette;
  if (!palette || typeof palette !== 'object' || Array.isArray(palette)) {
    return fail(422, 'INVALID_PALETTE', 'Thiếu "palette" (3 thông số × 3 mức màu)');
  }
  const out = {};
  for (const m of METRICS) {
    const colors = palette[m];
    if (!Array.isArray(colors) || colors.length !== levelCount) {
      return fail(422, 'INVALID_PALETTE', `"palette.${m}" phải có đúng ${levelCount} màu`);
    }
    out[m] = [];
    for (const [i, c] of colors.entries()) {
      const hex = normalizeHex(c);
      if (!hex) return fail(422, 'INVALID_PALETTE', `"palette.${m}[${i}]" không phải màu #RRGGBB`);
      out[m].push(hex);
    }
  }
  return {
    ok: true,
    cmd: { v: 1, mode: 'auto', palette: out },
    patch: { mode: 'auto', palette: out, test: null },
  };
}

/** POST /api/led/test { mode:"test", on, color } hoặc { mode:"auto" } (Về tự động với bảng màu đã lưu). */
export function parseTestBody(body) {
  if (body?.mode === 'auto') {
    return { ok: true, cmd: { v: 1, mode: 'auto' }, patch: { mode: 'auto', test: null } };
  }
  if (body?.mode !== 'test') return fail(400, 'BAD_REQUEST', '"mode" phải là "test" hoặc "auto"');
  if (typeof body.on !== 'boolean') return fail(400, 'BAD_REQUEST', '"on" phải là true hoặc false');
  const color = normalizeHex(body.color);
  if (!color) return fail(422, 'INVALID_COLOR', '"color" không phải màu #RRGGBB');
  return {
    ok: true,
    cmd: { v: 1, mode: 'test', on: body.on, color },
    patch: { mode: 'test', test: { on: body.on, color } },
  };
}
