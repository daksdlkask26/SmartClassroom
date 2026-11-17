// G1: chỉ kiểm tra kết nối tới backend. G4 thay bằng khởi động thật (config, chuỗi, WebSocket, router).
const out = document.querySelector('#health');

try {
  const res = await fetch('/api/health', { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const h = await res.json();
  out.textContent = `hoạt động · chế độ ${h.mode === 'sim' ? 'giả lập' : 'thật'} · MQTT ${h.mqtt === 'connected' ? 'đã kết nối' : 'chưa kết nối'} · hợp đồng v${h.contractVersion}`;
} catch (err) {
  out.textContent = `không kết nối được (${err.message})`;
}
