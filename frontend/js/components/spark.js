// Sparkline 24 giờ (HANDOFF §2): polyline theo giờ, ngắt ở mốc thiếu; độ ẩm có đường ngưỡng nét đứt.
// preserveAspectRatio="none" để kéo theo bề rộng thẻ; nét và chấm cuối giữ nguyên nhờ vector-effect.

export function sparkSvg(geo, { threshold = null } = {}) {
  if (!geo) return '';
  const lines = geo.segments.map((pts) => `<polyline points="${pts.join(' ')}"/>`).join('');
  const ty = threshold == null ? null : geo.y(threshold).toFixed(1);
  const th = ty == null ? '' : `<line class="ri-spark__th" x1="0" x2="240" y1="${ty}" y2="${ty}"/>`;
  const [lx, ly] = geo.last.map((n) => n.toFixed(1));
  // Chấm cuối = đoạn dài 0 đầu tròn: không bị kéo thành elip như <circle> khi viewBox co giãn
  return `<svg class="ri-spark__svg" viewBox="0 0 240 64" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      ${th}<g class="ri-spark__line">${lines}</g>
      <line class="ri-spark__dot" x1="${lx}" y1="${ly}" x2="${lx}" y2="${ly}"/>
    </svg>`;
}
