# HANDOFF — Room Instrument → mã nguồn (ID 9)

Bộ thiết kế: Figma file `VLcCNTT`, trang **"Claude"** (các hàng `ROW 00 … 09`). Token: `design/tokens.css`. Ảnh báo cáo: `design/exports/*_mau.png` (màu) và `*_mono.png` (in).
Mục tiêu dựng: **Node.js + Express phục vụ HTML/CSS/JS thuần + Chart.js**. Không dùng framework UI, không thư viện hiệu ứng.

---

## 1. Quy ước đặt tên

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Khung màn | `<mã> <tên>` — DK desktop 1440, MB mobile 390, PT portal 390, ST trạng thái | `DK-04 Giám sát`, `MB-15b Cài đặt lần đầu · ② Tài khoản`, `ST-03 Dữ liệu cũ (> 90 giây)` |
| Lớp vùng chức năng | `ID<n>[-<m>]/<đối tượng>/<phần>` | `ID1/humidity/gauge`, `ID3/led-quick`, `ID6/threshold-scale`, `ID8/password-rules` |
| Component | `<Nhóm>/<Tên>/<Biến thể>` | `Gauge/Humidity/L/64,5 · Paper`, `Nav/StatusBar/Desktop`, `LED/Strip-8/M` |
| Thuộc tính biến thể | `Kind=…, State=…`, `Value=On/Off`, `Active=01…05` | `Kind=Primary, State=Pressed` |
| Biến Figma → CSS | `body/color/ink` → `--ink` (`:root`), `lid/color/ink` → `--ink` (`[data-theme="lid"]`), `space/4` → `--space-4`, `accent/alert` → `--accent-alert`, `accent-dark/alert` → `--accent-alert` trong mặt tối, `accent/data-humidity` → `--data-humidity`, `mono/*` → `.ri-mono` | xem `tokens.css` |
| Lớp CSS đề xuất | BEM ngắn tiền tố `ri-` | `.ri-gauge`, `.ri-gauge__seg--on`, `.ri-panel--hero`, `.ri-led__cell` |

---

## 2. Thành phần (component trong Figma → phần tử web)

| Figma | Web | Ghi chú |
|---|---|---|
| `Nav/Rail` (Active 01–05) | `<nav class="ri-rail">` 232 px; `aria-current="page"` | < 1280 px: chỉ biểu tượng + số |
| `Nav/StatusBar/Desktop`, `/Mobile` (Online, Connecting, Stale, DeviceOffline, Disconnected) | `<div role="status" aria-live="polite">` dính trên cùng | logic ở §3.4 |
| `Nav/TabBar` (5 mục) | `<nav class="ri-tabbar">` cố định đáy, mỗi mục ≥ 74 × 64 px | "Thêm" → Thiết bị & WiFi, Tài khoản |
| Panel thường / đảo màu / hero (`Panel/Screw`) | `.ri-panel`, `.ri-panel--invert`, `.ri-panel--hero` (4 chấm vít bằng `::before/::after` + 2 span) | vít chỉ dùng ở hero độ ẩm |
| `Gauge/Ring/*` + `Gauge/<chỉ số>/<cỡ>/<giá trị> · <tông>` | `<svg class="ri-gauge" role="meter">` | §3.1 |
| Số ma trận chấm | `<span class="ri-readout" aria-label="Độ ẩm 64,5 phần trăm">` | §3.2 |
| `LED/Strip-8/L|M|S` (On/Off), `LED/Strip-8/M · Mobile` | 8 `<span class="ri-led__cell">` chia 4 cặp (khe `pair-gap` giữa 2–3, 4–5, 6–7); mỗi ô tô màu riêng; trên thẻ mobile thanh kéo hết chiều ngang (`flex: 1` cho ô, bản Figma 328 px) | mặc định On: 1 Trắng · 2 Xanh dương · 3–8 Xanh lá (§3.5) |
| `DeviceTwin/Desktop · Body|Lid|Offline`, `/Compact` | SVG nội tuyến (vẽ lại từ Figma: hình chiếu bằng 160×100 + đứng 160×60, tỉ lệ 2,4 px/mm) | các ô `led/1…8` tô màu từng bóng; bản Desktop có nhãn 4 nhóm in dưới cửa sổ LED (biểu tượng nguồn · nhiệt kế · giọt nước · gió); offline: `stroke-dasharray: 6 4` |
| `Spark/*-24h/L|S` | `<svg>` polyline 25 điểm | bấm → `/lich-su?chi-so=…` |
| `Chart/Line/*`, `Chart/Bar/*` | Chart.js | §3.3 |
| `Button` (Primary/Secondary/Ghost × 5 trạng thái) | `<button class="ri-btn ri-btn--primary">` cao 48 | bóng `--shadow-key`; `:active` → `--shadow-key-pressed` + `translate(2px,2px)`; `:focus-visible` → `outline: var(--focus-ring); outline-offset: 2px` |
| `Toggle/Power` | `<button role="switch" aria-checked>` chữ BẬT/TẮT luôn hiện | gửi lệnh ngay; chỉ có ở chế độ Kiểm tra đèn |
| `Chip/Color` | `<button role="radio" aria-checked>` swatch + tên + HEX | lưới `role="radiogroup"` |
| `Field` (Text/Password × Default/Focus/Error/Disabled) | `<label>` + `<input>` + `<p id=…-help>`; `aria-describedby` | mật khẩu có nút Hiện/Ẩn, cho dán, `autocomplete` đúng |
| `Segmented/Granularity`, `/Range` | `role="radiogroup"`, phím ←/→ | |
| `Stepper/Setup` (Step 1–3) | 8 ô: bước ① ô 1–3, ② ô 4–6, ③ ô 7–8 | xong = đặc, hiện tại = viền 2,5 px, chưa = viền mảnh |
| `Banner` (Info/Success/Warning/Error), `Toast` (Sent/Failed) | `role="status"` (toast), `role="alert"` (lỗi) | Warning/Error/Failed: viền 1 px `--line-strong` + **gạch đáy 2 px** màu trạng thái, nền trắng, biểu tượng ⚠ (§3.11). Không gạch chéo |
| `Annot/ID` | — | chỉ dùng trong bảng báo cáo, **không** đưa vào sản phẩm |

---

## 3. Hành vi

### 3.1 Gauge (ID 1, 2) — vòng 61 đoạn trên cung 240°

- Góc φ tính theo chiều kim đồng hồ từ 12 giờ: đoạn `i = 0…60` ở `φᵢ = −120° + 4°·i`. Đoạn `i % 10 == 0` là vạch lớn (dài hơn ~50 %).
- Giá trị → số đoạn sáng: `k = round((v − min)/(max − min) · 60)`; đoạn `i ≤ k` dùng `--ink` (hoặc `--invert-ink` trong hero), còn lại `--track`.
- Thang: độ ẩm 0–100 %, nhiệt độ 10–40 °C, CO₂ 400–2000 ppm (cần đối chiếu sau khi hiệu chuẩn MQ-135).
- Chỉ **độ ẩm** có **cung đặc mảnh** ngoài vòng ở 0–30 % và 85–100 % (bán kính `r_out + 6`, dày 3 px cỡ L / 2,5 px cỡ M, màu `--accent-alert`) + hai vạch ngưỡng đậm 30 / 85. Không gạch chéo (đổi 07/11/2026). SVG: `<path d="M…A…" stroke="var(--accent-alert)" stroke-width="3" fill="none">`. Nhiệt độ và CO₂ không tô tốt/xấu trên gauge; mức của cả ba thông số hiện bằng nhãn trên thẻ (§3.12).
- Kim từ trục tới `r_out − r_major − 5`, đuôi ngắn qua trục; trục là chấm tròn có lõi màu nền.
- Trạng thái: không đọc được → không kim, không đoạn sáng, chữ "KHÔNG ĐỌC ĐƯỢC"; MQ-135 làm nóng → "ĐANG LÀM NÓNG"; dữ liệu cũ → `opacity: .4` + nhãn biểu tượng đồng hồ + "CŨ · hh:mm" (màu `--accent-warn-text`; không gạch chéo từ 07/11/2026).
- Chuyển động: kim xoay `transform: rotate()` với `transition: var(--motion-needle) var(--ease-spring)`; đoạn sáng đổi tức thì.
- A11y: `role="meter" aria-valuemin aria-valuemax aria-valuenow aria-valuetext="64,5 % — trong ngưỡng 30–85 %"`.

```js
// SVG: tạo 61 đoạn một lần, cập nhật lớp khi có bản tin
function buildGauge(svg, {r = 105, len = 13, major = 20}) {
  const cx = 120, cy = 120;
  for (let i = 0; i <= 60; i++) {
    const phi = (-120 + 4 * i) * Math.PI / 180, L = i % 10 ? len : major;
    const x1 = cx + (r - L) * Math.sin(phi), y1 = cy - (r - L) * Math.cos(phi);
    const x2 = cx + r * Math.sin(phi),       y2 = cy - r * Math.cos(phi);
    svg.insertAdjacentHTML('beforeend', `<line class="ri-gauge__seg" data-i="${i}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`);
  }
}
function setGauge(svg, v, min, max) {
  const k = Math.round((v - min) / (max - min) * 60);
  svg.querySelectorAll('.ri-gauge__seg').forEach(s => s.classList.toggle('ri-gauge__seg--on', +s.dataset.i <= k));
  svg.querySelector('.ri-gauge__needle').style.transform = `rotate(${-120 + 240 * (v - min) / (max - min)}deg)`;
}
```

### 3.2 Số ma trận chấm

- Chữ số bằng **Doto Black**, dấu phẩy thập phân và đơn vị (`%`, `°C`, `ppm`) bằng **JetBrains Mono** (Doto đọc `%` giống chữ X, phẩy khó nhìn).
- Định dạng `vi-VN`: `64,5`, `27,5`, `850` — một chữ số thập phân cho độ ẩm/nhiệt độ, số nguyên cho CO₂.
- Lật số khi giá trị đổi: `@keyframes ri-flip` 240 ms ease-out trên từng chữ số đổi; tắt khi `prefers-reduced-motion`.
- Không bao giờ hiển thị số giả: chưa có bản tin → "—".

### 3.3 Biểu đồ (ID 4, 5) — Chart.js

- Một biểu đồ = một chỉ số = một đơn vị; trục thời gian UTC+7, nhãn 3 giờ/lần (desktop), 6 giờ/lần (mobile).
- Độ ẩm: trục **0–100 %**; hai đường ngưỡng 30/85 nét đứt + vùng ngoài ngưỡng **nền đặc rất nhạt** `--accent-alert-tint` (plugin `beforeDatasetsDraw` vẽ `ctx.fillRect` dưới lưới và đường dữ liệu; không gạch chéo từ 07/11/2026). Điểm ngoài ngưỡng: `pointStyle: 'rect'`, `pointRadius` lớn hơn, nhãn "87,4 % · 05:00".
- Nhiệt độ 20–35 °C, CO₂ 400–1200 ppm: **ghi rõ "thang nhìn gần"** trên tiêu đề biểu đồ.
- `spanGaps: false`; mốc thiếu hiển thị "—" (ST-13).
- Theo ngày: `type: 'bar'`, `beginAtZero: true`, cột = trung bình ngày, vạch ngang = lớn nhất; **hôm nay chưa kết thúc**: `backgroundColor` = pattern gạch chéo, `borderDash: [6,4]`, nhãn giá trị trong ô nền trắng.
- Màu: `--ink` cho đường/cột, `--line` cho lưới, `--ink-2` cho nhãn trục. Không phân biệt chuỗi bằng màu (mỗi biểu đồ chỉ một chuỗi).
- Mobile: thước đọc (`interaction: {mode: 'index', intersect: false}`), tooltip đặt **phía trên** điểm chạm; phím ←/→ chuyển mốc, Home/End về đầu/cuối.
- Luôn có nút "Xem bảng số" (DK-11 / MB-11) — bảng `<table>` thật, có `<caption>`, ô ngoài ngưỡng có chữ "> 85 % · NGOÀI NGƯỠNG" / dấu ▲.

### 3.4 Thanh trạng thái (ID 9)

| Điều kiện | Trạng thái | 8 ô |
|---|---|---|
| Đang mở WebSocket, chưa có bản tin | `Connecting` "ĐANG KẾT NỐI…" | xen kẽ, quét |
| Bản tin cuối ≤ 90 s | `Online` "TRỰC TUYẾN · Cập nhật N giây trước" + chấm nháy mỗi bản tin | 8 đặc |
| Bản tin cuối > 90 s, WebSocket vẫn mở | `Stale` "DỮ LIỆU CŨ" + giờ bản tin cuối; gạch đáy 2 px `--accent-warn`; gauge nhạt, số có nhãn đồng hồ "CŨ · hh:mm" | 3 đặc |
| Máy chủ báo thiết bị mất (nếu backend có) / quá lâu | `DeviceOffline` đảo màu + gạch đáy 2 px `--accent-alert`; Device Twin nét đứt; LED khóa + lý do | rỗng |
| WebSocket đứt | `Disconnected` đảo màu "MẤT KẾT NỐI" + gạch đáy 2 px `--accent-alert`, tự thử lại (5 s, lũy tiến), nút Thử lại; số giữ giá trị cuối + "dữ liệu cũ" | rỗng |

Thanh trạng thái **không** còn dải gạch chéo ở mép trái (desktop) / ô gạch chéo cạnh câu (mobile) — thay bằng gạch đáy 2 px (`.ri-statusbar--stale|offline|disconnected { border-bottom: 2px solid … }`). Chiều cao giữ 56 px (desktop) / 57 px (mobile).

### 3.5 LED (ID 3) — cập nhật 13/11/2026 theo thuyết minh mục 1.1, 1.2, 4

Màn: DK-06 / MB-06 (Tự động), DK-06b / MB-06b (Kiểm tra đèn), DK-07 / MB-07 (màu tùy chỉnh), ST-08, ST-09. Bản cũ một màu: ROW 11 (lưu trữ).

- **Bố trí 8 bóng:** bóng 1–2 hệ thống (màu cố định, không đổi được) · cặp 3–4 nhiệt độ · 5–6 độ ẩm · 7–8 CO₂ ước lượng. Mỗi cặp có 3 mức Bình thường / Cần chú ý / Cảnh báo → 3 × 3 = 9 màu.
- **Bảng màu mặc định:** Bình thường Xanh lá `#22E05A` · Cần chú ý Vàng `#FFD400` · Cảnh báo Đỏ `#FF2A2A`, cho cả 3 thông số.
- **Bóng hệ thống:** bóng 1 Trắng nháy chậm = chương trình đang chạy; bóng 2 Xanh dương sáng = đã kết nối WiFi + MQTT, nháy = đang kết nối lại.
- **Kiểu nháy trắng (đề xuất, chốt khi viết firmware):** nháy chậm cùng lúc = chưa có dữ liệu; nháy luân phiên = MQ-135 đang làm nóng (chỉ 7–8); nháy nhanh = lỗi cảm biến (DHT22 lỗi → cả 3–4 và 5–6). Trong Figma "nháy" vẽ bằng dấu góc mở quanh bóng.
- **Ngưỡng (số tạm, trừ độ ẩm 30 / 85 % đã chốt = ngưỡng Telegram):** nhiệt độ bình thường 20–30 °C, chú ý 16–< 20 · > 30–34, cảnh báo < 16 · > 34; độ ẩm bình thường 40–70 %, chú ý 30–< 40 · > 70–85, cảnh báo < 30 · > 85; CO₂ bình thường < 1000 ppm, chú ý 1000–< 1500, cảnh báo ≥ 1500. Khoảng trễ khi chuyển mức ±0,5 °C / ±2 % / ±50 ppm (firmware, không hiện trên giao diện).
- **Chế độ Tự động (mặc định):** ESP32 tự đổi màu từng cặp theo số đo và bảng màu đã lưu, kể cả khi mất Internet. Website chỉ sửa bảng màu.
  - Thanh xem trước 4 nhóm **chỉ hiển thị** (mô phỏng từ số liệu mới nhất + bảng màu nháp); bấm một cặp = cuộn / mở thẻ thông số đó, **không** chỉnh màu trên thanh.
  - Chỉnh màu ở 3 thẻ thông số: mỗi thẻ có thanh ngưỡng chỉ đọc + 3 hàng mức; bấm hàng → bộ chọn 10 màu có tên + Tùy chỉnh HEX. Mobile: thẻ thu gọn ˅ / mở ^ (chevron ở hàng tiêu đề).
  - **Áp dụng bảng màu** gửi cả 9 màu `{mode:"auto", palette:{temperature:[…3], humidity:[…3], co2:[…3]}}`; **Hủy thay đổi** về bảng đã gửi; **Khôi phục mặc định** chỉ đổ vào bản nháp (vẫn phải Áp dụng).
- **Chế độ Kiểm tra đèn:** một màu cho cả thanh + Bật/Tắt thủ công (giao diện cũ); banner "các cặp LED tạm không báo nhiệt độ, độ ẩm, CO₂" + nút **Về tự động**. Bật/Tắt chỉ có ở chế độ này (Giám sát không còn công tắc).
- **Trạng thái gửi (ST-08):** Nháp → Đang gửi (nút khóa) → **"Đã gửi bảng màu đến thiết bị."** — không bao giờ "đèn đã đổi"/"đã xác nhận" (firmware không gửi lại). Lỗi: toast Failed + giữ bản nháp + Thử lại.
- **Thiết bị ngoại tuyến (ST-09, ST-04):** khóa gửi bảng màu; thanh xem trước xám "không rõ"; nói rõ đèn trên hộp vẫn tự chạy theo bảng màu đã lưu + đường dẫn Thiết bị & WiFi.
- **Hai mức trùng màu (ST-17):** nếu trong một thông số có hai mức cùng màu, hiện ngay dưới thẻ: biểu tượng ⚠ + câu `led.duplicate` màu `--accent-warn-text`, gạch đáy 2 px `--accent-warn` (kiểu Banner Chú ý, không nền nhạt). **Không khóa** Áp dụng — người dùng có thể cố ý (ví dụ không cần phân biệt mức Cần chú ý). Thanh ngưỡng và thanh xem trước tô theo bản nháp nên cũng thấy hai vùng cùng màu.
- **Đèn khi không có số đo, trên Giám sát (ST-05, ST-06):** thẻ Đèn LED vẽ cặp đang nháy màu Trắng, có dấu 4 góc mở quanh cả cặp + một câu giải thích (`led.blink.sensorError`, `led.blink.warming`). Kiểu nháy là đề xuất, chốt khi viết firmware.
- Không có slider độ sáng.

### 3.6 Telegram (ID 6, 7)

- Trang chỉ là hướng dẫn 3 bước + quy tắc; **không** có nhãn "Đã liên kết/Chưa liên kết", **không** hiển thị cảnh báo đã gửi hay chưa.
- Quy tắc: cảnh báo khi độ ẩm `< 30 %` hoặc `> 85 %`; nghỉ **30 phút** giữa hai lần báo (backend phải dùng đúng giá trị này).
- Tên bot: chỗ giữ chỗ `@<tên_bot>`; ví dụ trả lời `/doam`, `/trangthai` ghi "MINH HỌA".

### 3.7 Portal WiFi (ID 10) — PT-01…04, ST-14

- Chạy trên ESP32 (WiFiManager), điện thoại không có internet: chỉ `system-ui`, SVG nhúng, CSS rất nhỏ chèn vào `<head>` qua tham số tùy biến của WiFiManager. Không font web, không ảnh, không CDN.
- Inter trong Figma chỉ là hình minh họa cho `system-ui`.
- "Đã lưu cấu hình WiFi. Thiết bị đang khởi động lại." ≠ đã trực tuyến; luôn kèm các bước kiểm tra trên website.

### 3.8 Phiên (ID 8)

- Hết phiên: thay toàn bộ vùng số liệu bằng khối đặc (`--line`), không để lộ số phía sau; hộp thoại `role="alertdialog"` bẫy focus, đăng nhập lại quay về đúng trang.
- Lỗi đăng nhập trung tính: "Thông tin đăng nhập chưa đúng." — không tiết lộ tên đăng nhập có tồn tại.
- Lỗi biểu mẫu: lỗi cạnh trường + banner tóm tắt; giữ dữ liệu đã nhập trừ mật khẩu.

### 3.9 Chuyển động

| Hiệu ứng | Token | Ghi chú |
|---|---|---|
| Lật số | `--motion-flip` 240 ms | ease-out |
| Kim gauge | `--motion-needle` 400 ms | `--ease-spring` |
| Quét 8 ô | `--motion-led-sweep` 320 ms, `--motion-led-step` 40 ms/ô | khi Áp dụng, khi vừa kết nối, khi đang tải |
| Nhịp kết nối | mỗi bản tin | chấm `opacity` 1 → .3 |
| Chuyển trang | `--motion-route` 200 ms | lớp phủ mở theo đường kẻ |
| Nút lún | `--motion-press` 80 ms | `translate(2px,2px)` + bóng 1 px |

`prefers-reduced-motion: reduce` → mọi token = 0 ms (đã có trong `tokens.css`).

### 3.10 Màu nhấn (thêm 06/11/2026)

**Quy tắc**
1. Màu chỉ để nhấn: chấm, viền, vạch, đường dữ liệu, đoạn gauge. Nền, khung, chữ thường, đường kẻ, **chữ số Doto lớn**, huy hiệu ID, Device Twin (trừ cửa sổ LED), nhãn "CO₂ ước lượng · tham khảo" giữ đen–trắng–xám.
2. Mỗi màu một nghĩa (bảng dưới). `--accent-alert` không bao giờ dùng để trang trí.
3. Màu luôn đi kèm chữ hoặc họa tiết; bỏ màu đi (lớp `.ri-mono` / `@media print`) giao diện vẫn đọc đúng.
4. Trên giao diện web, nhiệt độ và CO₂ **không** có màu mức độ; `--data-temperature` / `--data-co2` chỉ để phân biệt chỉ số. Ngoại lệ duy nhất: màu mức của từng cặp LED (§3.5) — đó là màu **dữ liệu của thiết bị** do người dùng chọn, chỉ xuất hiện trong cửa sổ LED, ô màu và hàng mức của trang Đèn LED, luôn kèm tên mức.
5. Mỗi màn một điểm nhìn đầu tiên: có cảnh báo → màu báo động ở đó; bình thường → số hero.
6. Chữ có màu dùng biến `*-text` (≥ 4,5:1); bản không hậu tố chỉ cho chấm/viền/vạch (≥ 3:1). Mặt tối (hero đảo màu, thanh trạng thái đảo màu, chủ đề Lid) dùng giá trị sáng hơn — `tokens.css` tự đổi qua `.ri-invert`, `.ri-panel--hero`, `[data-theme="lid"]`.

**Màu nào dùng ở đâu**

| Token | Chỗ dùng | Kèm theo (không bỏ) |
|---|---|---|
| `--accent-alert` | Ô đang thắp của dải đèn hiệu 3 mức trên hero độ ẩm khi < 30 % / > 85 % (§3.11); vạch ngưỡng 30/85 và cung ngoài ngưỡng trên gauge độ ẩm (luôn hiện); đường ngưỡng nét đứt trên biểu đồ độ ẩm; gạch đáy 2 px của vùng ngoài ngưỡng trên thang Telegram; điểm vượt ngưỡng; ô sức khỏe + nhãn thanh trạng thái "MẤT KẾT NỐI", "THIẾT BỊ NGOẠI TUYẾN"; gạch đáy 2 px của ô nhập Error, banner Lỗi, toast Lỗi, khối lỗi portal; biểu tượng ⚠ ở cờ ngoài ngưỡng bảng số | Chữ nêu giá trị và ngưỡng, biểu tượng ⚠, ô đặc / rỗng |
| `--accent-alert-text` | Chữ: tiêu đề banner lỗi, lỗi dưới ô nhập, nhãn ngưỡng, chip "> 85 %"/"< 30 %", chip "GỬI LỖI", nền nút nguy hiểm "Đăng xuất" | — |
| `--accent-alert-tint` | Vùng ngoài ngưỡng trên biểu đồ độ ẩm và thang Telegram; ô ghi chú "mốc ngoài ngưỡng" ở Lịch sử (banner Lỗi **không** còn nền nhạt từ 07/11/2026) | Đường ngưỡng nét đứt / gạch đáy + nhãn 30 % · 85 % |
| `--accent-ok` / `-text` | 8 ô + nhãn "TRỰC TUYẾN", chấm nhịp; chấm cạnh "BÌNH THƯỜNG"; ✓ toast "Đã gửi lệnh"; chip "ĐÃ GỬI LỆNH"; banner Thành công; ô/chữ bước đã xong (cài đặt lần đầu, portal); vạch sóng WiFi; khối "Đã lưu cấu hình" | Chữ trạng thái; **không** viết "đã xác nhận" |
| `--accent-warn` / `-text` / `-tint` | Thanh trạng thái "DỮ LIỆU CŨ" (gạch đáy 2 px + ô sức khỏe), "ĐANG KẾT NỐI…"; nhãn đồng hồ "CŨ · hh:mm"; gạch đáy banner Chú ý; ô chờ bản tin ở cài đặt lần đầu; portal "Không thấy WiFi" | Biểu tượng đồng hồ + giờ bản tin cuối |
| `--data-humidity` | Đoạn đã đạt gauge độ ẩm, đường/cột độ ẩm, sparkline độ ẩm, vạch "hiện tại" trên thang Telegram | Tiêu đề biểu đồ |
| `--data-temperature` | Đoạn gauge nhiệt độ, đường/cột/sparkline nhiệt độ | — |
| `--data-co2` | Đoạn gauge CO₂, đường/cột/sparkline CO₂ | Nhãn "ước lượng · tham khảo" |
| `--led-<tên>` (10 màu) · `--led-sys-run/net` (bóng 1–2) · `--led-<thông số>-normal/watch/alert` (9 màu bảng Tự động) · `--led-test`, `--led-test-draft` (Kiểm tra đèn) | Thanh 8 bóng, cửa sổ LED trên Device Twin, chip màu (không đổi theo chủ đề / bản in) | Tên + HEX |

**Chart.js**
```js
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const humidity = { borderColor: css('--data-humidity'), pointBackgroundColor: ctx => (ctx.raw > 85 || ctx.raw < 30) ? css('--accent-alert') : css('--surface'),
  pointStyle: ctx => (ctx.raw > 85 || ctx.raw < 30) ? 'rect' : 'circle', spanGaps: false };
// Plugin vùng ngưỡng (beforeDatasetsDraw): ctx.fillStyle = css('--accent-alert-tint'); fillRect cho 0–30 và 85–100; đường 30/85 setLineDash([4,4]) màu --accent-alert
```
Khi in hoặc xuất báo cáo: thêm lớp `.ri-mono` lên `<html>` (hoặc dựa `@media print`) → mọi `--accent-*`, `--data-*` về `--ink` / `--ink-2`; gạch chéo, nét đứt, chữ giữ nguyên nghĩa. Chart.js cần gọi `chart.update()` sau khi đổi lớp để đọc lại biến.

**Bản in trong Figma:** hàng 07 có 6 bảng màu và 6 bảng `· mono (in)` (y = 29 700). PNG ở `exports/*_mau.png` (xem trên màn hình) và `exports/*_mono.png` (in đen trắng).

### 3.11 Trạng thái lỗi và đèn hiệu ngưỡng (chốt 07/11/2026)

Chủ dự án chọn **hướng 1 · Gạch đáy** cho ô nhập / banner / toast và **dải đèn hiệu 3 mức** (lấy từ hướng 9) cho hero độ ẩm. So sánh 10 hướng: hàng `10 — SO SÁNH CẢNH BÁO` (y = 38 400), DECISIONS mục 7.

**Không còn gạch chéo màu đỏ ở bất kỳ đâu** (chốt 07/11/2026). Vùng ngoài ngưỡng: gauge = cung đặc mảnh; biểu đồ = nền rất nhạt + đường ngưỡng nét đứt; thang Telegram = nền rất nhạt + gạch đáy 2 px; bảng số DK-11 = biểu tượng ⚠ + chữ "> 85 % · NGOÀI NGƯỠNG". Lỗi / trạng thái (ô nhập, banner, toast, portal, thanh trạng thái, nhãn "CŨ") = **gạch đáy hoặc biểu tượng + chữ**. Gạch chéo **màu mực** chỉ còn ở cột "hôm nay chưa kết thúc" và dòng thời gian khoảng nghỉ 30 phút (Telegram).

**Ô nhập lỗi** — viền 1 px giữ màu thường, chỉ cạnh đáy đổi màu, biểu tượng trong ô, câu lỗi ngay dưới:
```html
<label for="u">Tên đăng nhập</label>
<div class="ri-field ri-field--error">
  <input id="u" aria-invalid="true" aria-describedby="u-err" value="giangvien01">
  <svg class="ri-field__icon" aria-hidden="true">…triangle-alert…</svg>
</div>
<p id="u-err" class="ri-field__msg">Thông tin đăng nhập chưa đúng.</p>
```
```css
.ri-field{display:flex;align-items:center;gap:10px;height:48px;padding:0 14px;border:1px solid var(--line-strong);background:var(--surface)}
.ri-field--error{border-bottom:2px solid var(--accent-alert)}        /* 1 px trên/trái/phải, 2 px đáy */
.ri-field__icon{color:var(--accent-alert-text);width:24px;height:24px;flex:none}
.ri-field__msg{color:var(--accent-alert-text);font-size:12px;margin-top:4px}
.ri-field--error:focus-within{outline:3px solid var(--ink);outline-offset:-3px} /* focus vẫn thắng */
```
- Banner Lỗi / Chú ý, Toast Thất bại: cùng cấu trúc — `border:1px solid var(--line-strong); border-bottom:2px solid var(--accent-alert | --accent-warn)`, nền `--surface`, ⚠ màu `*-text`, tiêu đề màu `*-text`, thân chữ `--ink`. Biểu tượng banner lỗi là ⚠ (không dùng ✕ — dễ hiểu nhầm là nút đóng).
- Khối lỗi portal (PT-04): nền mực, ⚠ + tiêu đề `--accent-alert` (bản sáng), gạch đáy 2 px.
- Nhiều lỗi cùng lúc: mỗi ô chỉ thêm một vạch đáy + một dòng chữ; banner tóm tắt ở đầu biểu mẫu (§3.8).

**Dải đèn hiệu 3 mức (hero độ ẩm khi ngoài ngưỡng)** — thay viền đỏ 3 px + ô gạch chéo cũ; hero không còn viền màu:
```html
<ol class="ri-annunciator" aria-label="Mức độ ẩm">
  <li>THẤP &lt; 30 %</li><li>30–85 %</li>
  <li class="is-lit" aria-current="true">CAO &gt; 85 %</li>
</ol>
```
```css
.ri-annunciator{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;font:500 12px/1 var(--font-mono)}
.ri-annunciator li{height:32px;display:grid;place-items:center;border:1px solid var(--invert-track);color:var(--invert-ink-2)}
.ri-annunciator .is-lit{border-color:transparent;background:var(--accent-alert);color:var(--invert-bg)} /* hero là mặt tối → giá trị sáng */
```
- Ô thắp = nền đặc, ô tắt = chỉ viền → phân biệt bằng hình (đặc / rỗng) + chữ, không chỉ bằng màu; bản in: ô thắp đen chữ trắng.
- Chỉ hiện khi ngoài ngưỡng (DK-16, MB-16, ST-07). Ở trạng thái bình thường hero giữ như cũ (chưa chốt có hiện dải với ô giữa thắp hay không).
- Mobile: chữ 11 px.

---

### 3.12 Nhãn mức trên thẻ thông số (13/11/2026)

- Cả ba thông số có nhãn mức giống nhãn của khối độ ẩm: chấm màu + chữ in hoa, viền 1 px màu chữ — **BÌNH THƯỜNG** (`--accent-ok`), **CẦN CHÚ Ý** (`--accent-warn`), **CẢNH BÁO** (`--accent-alert`). Mức tính theo cùng ngưỡng với cặp đèn trên hộp (§3.5) nên web và hộp luôn nói cùng một mức. Thẻ nhiệt độ / CO₂ đặt nhãn giữa số và dòng chú thích.
- Không hiện nhãn khi giá trị không đáng tin: đang tải (ST-01), mất kết nối / dữ liệu cũ (ST-02, ST-03), ngoại tuyến (ST-04), cảm biến lỗi (ST-05, thẻ bị lỗi), MQ-135 làm nóng (ST-06, thẻ CO₂).
- Màn mẫu **ST-16**: nhiệt độ 32 °C → CẦN CHÚ Ý, cặp 3–4 trên thẻ Đèn LED sáng Vàng. Ngưỡng là số tạm (§3.5).
- A11y: nhãn nằm trong `aria-valuetext` của gauge, ví dụ "32 độ C — cần chú ý".

## 4. Responsive

| Rộng | Thay đổi |
|---|---|
| 320–389 (**RS-320**) | một cột: hai thẻ nhỏ xếp dọc, khối độ ẩm xếp gauge trên / nhãn dưới, ba sparkline xếp dọc; số hero 72; thanh LED dùng cỡ M 232 px |
| 390 (thiết kế) | MB-xx |
| 428–767 | hai thẻ nhỏ cạnh nhau, biểu đồ rộng hơn |
| 768–1023 (**RS-768**) | rail thu gọn 92 px (chỉ số + biểu tượng, ẩn chữ và logo); một cột nội dung: khối độ ẩm → **hai thẻ cạnh nhau** → Đèn LED → hình thiết bị → dải 24 giờ dạng gọn |
| 1024–1279 | như 1280 |
| 1280–1439 (**RS-1280**) | rail đầy đủ; cột hình thiết bị giữ 568 px (bản vẽ cố định); cột số liệu còn ~392 px nên dùng **khối gọn** như mobile (khối độ ẩm xếp dọc, hai thẻ, Đèn LED, dải 24 giờ) — dải 24 giờ chuyển vào cột này |
| 1440 (thiết kế) | DK-xx |
| ≥ 1920 (**RS-1920**) | nội dung tối đa `--content-max` 1280 canh giữa; cột số liệu giãn (688 px); số hero 130 (×1,25) |

Khung minh họa: hàng **12 — THÍCH NGHI** (y ≈ 42 500), màn Giám sát. CSS: `grid-template-columns: 568px minmax(0, 1fr)` từ 1280, chuyển cột phải sang khối gọn bằng container query `(max-width: 480px)`.

---

## 5. Chuỗi nội dung (đặt trong `strings.vi.json`, không viết cứng)

| Khóa | Chuỗi |
|---|---|
| `status.online` | TRỰC TUYẾN · Cập nhật {n} giây trước |
| `status.connecting` | ĐANG KẾT NỐI… · Đang chờ bản tin đầu tiên từ thiết bị |
| `status.stale` | DỮ LIỆU CŨ · Chưa có bản tin mới trong {m} phút · giá trị cuối lúc {hh:mm} |
| `status.deviceOffline` | THIẾT BỊ NGOẠI TUYẾN · Không nhận bản tin từ {hh:mm} · kiểm tra nguồn và WiFi của thiết bị |
| `status.disconnected` | MẤT KẾT NỐI · Mất kết nối tới máy chủ · tự thử lại sau {s} giây · số liệu là giá trị cuối |
| `metric.humidity` / `.temperature` / `.co2` | ĐỘ ẨM / NHIỆT ĐỘ / CO₂ ƯỚC LƯỢNG |
| `metric.co2.note` | CO₂ ước lượng từ cảm biến MQ-135, chỉ mang tính tham khảo. |
| `metric.co2.warming` | ĐANG LÀM NÓNG · cần khoảng 2 ngày sau khi lắp · chưa có giá trị tham khảo |
| `metric.sensorError` | KHÔNG ĐỌC ĐƯỢC |
| `humidity.normal` | BÌNH THƯỜNG · Trong ngưỡng 30–85 % |
| `humidity.high` | Độ ẩm {v} % — cao hơn ngưỡng 85 %. |
| `humidity.low` | Độ ẩm {v} % — thấp hơn ngưỡng 30 %. |
| `led.subtitle` | Mỗi cặp bóng báo một thông số theo 3 mức màu. Chọn màu cho từng mức rồi bấm Áp dụng bảng màu. |
| `led.mode` | Tự động · Kiểm tra đèn |
| `led.preview.hint` | Bấm vào một cặp để tới thẻ chỉnh màu (mobile: Chạm cặp để mở thẻ) |
| `led.level` | Bình thường · Cần chú ý · Cảnh báo |
| `led.row.draft` | {tên màu} · chưa gửi |
| `led.draftSummary` | {n} thay đổi chưa gửi · {thông số} · {mức}: {cũ} → {mới} |
| `led.apply` / `.cancel` / `.reset` | Áp dụng bảng màu / Hủy thay đổi / Khôi phục mặc định |
| `led.sending` | Đang gửi bảng màu (9 màu) |
| `led.sent` | Đã gửi bảng màu đến thiết bị. |
| `led.failed` | Chưa gửi được bảng màu. · Thử lại |
| `led.test.banner` | Đang ở chế độ kiểm tra đèn · Các cặp LED tạm không báo nhiệt độ, độ ẩm, CO₂. · Về tự động |
| `led.duplicate` | {mức A} và {mức B} cùng màu {màu}. Nhìn đèn sẽ không phân biệt được hai mức. Chọn màu khác, hoặc vẫn Áp dụng nếu bạn cố ý. |
| `led.blink.sensorError` | DHT22 lỗi → cặp 3–4, 5–6 nháy nhanh trắng |
| `led.blink.warming` | MQ-135 đang làm nóng → cặp 7–8 nháy luân phiên trắng |
| `metric.level` | BÌNH THƯỜNG · CẦN CHÚ Ý · CẢNH BÁO |
| `led.locked` | Chưa gửi được bảng màu · Đèn trên hộp vẫn tự đổi màu theo bảng màu đã lưu. |
| `led.twin` | Bảng màu đang chạy, mô phỏng theo số liệu mới nhất. |
| `history.autosave` | Dữ liệu được lưu tự động mỗi khi thiết bị gửi bản tin — không cần bấm lưu. |
| `history.empty` / `.error` | Chưa có dữ liệu trong khoảng này / Chưa tải được lịch sử · Thử lại |
| `history.range.invalid` | Ngày bắt đầu không được sau ngày kết thúc. |
| `tg.step1..3` | Mở bot @<tên_bot> · Gửi /start · Nhận tin xác nhận |
| `tg.rule` | Bot gửi cảnh báo khi độ ẩm dưới 30 % hoặc trên 85 %. |
| `tg.cooldown` | Sau mỗi lần cảnh báo, hệ thống nghỉ 30 phút rồi mới báo lại. |
| `tg.noStatus` | Trang này không theo dõi việc bạn đã liên kết hay chưa. Nếu chưa nhận tin xác nhận, hãy gửi lại /start. |
| `wifi.boot` | Giữ nút BOOT khoảng 5 giây để xóa cấu hình WiFi. |
| `wifi.saved` | Đã lưu cấu hình WiFi. Thiết bị đang khởi động lại. |
| `wifi.savedNotOnline` | Đã lưu chưa có nghĩa là thiết bị đã vào mạng. |
| `wifi.failed` | Chưa kết nối được tới {ssid}. |
| `auth.error` | Thông tin đăng nhập chưa đúng. |
| `auth.expired` | Phiên đăng nhập đã hết hạn · Để bảo vệ dữ liệu phòng học, số liệu đã được ẩn. |
| `auth.usernameTaken` | Tên đăng nhập này đã có người dùng. Thử tên khác. |
| `auth.confirmMismatch` | Mật khẩu xác nhận chưa khớp. |
| `setup.title` | Cài đặt lần đầu · 3 bước · ① Kết nối WiFi cho thiết bị · ② Tài khoản · ③ Liên kết Telegram (có thể bỏ qua) |

---

## 6. Dữ liệu minh họa (dùng chung mọi khung)

Độ ẩm **64,5 %** · nhiệt độ **27,5 °C** · CO₂ **850 ppm** (ước lượng) · **14:30 UTC+7, 06/11/2026** · ca cảnh báo **88 %** (và 24 % cho ngưỡng dưới) · LED chế độ Tự động: bảng màu mặc định đã gửi lúc 14:12, bản nháp đổi **Độ ẩm · Cần chú ý: Vàng → Cam #FF7A00**; ca cảnh báo 88 % → cặp 5–6 Đỏ · chế độ Kiểm tra đèn: đã gửi **Xanh ngọc #00C9B7**, nháp **Cam #FF7A00** · chuỗi 24 giờ: 14:00 05/11 → 14:00 06/11 (độ ẩm 60,2 – 87,4 %, 3 mốc > 85 % lúc 04:00–06:00).

---

## 7. Giới hạn của file Figma (không ảnh hưởng mã)

- Hai chủ đề là hai bộ biến (`body/…`, `lid/…`) vì gói chỉ cho 1 mode; DK-17 / MB-17 được tạo bằng hoán đổi màu theo bảng rồi gắn lại biến `lid/*` theo mã màu.
- Gauge, gạch chéo, nét đứt, polyline được dựng bằng thanh chữ nhật xoay (công cụ không tạo được vector/cung) — khi code dùng SVG `<line>`, `stroke-dasharray`, `repeating-linear-gradient`.
- Line-height trong Figma là tự động của font (công cụ bỏ qua `lineHeight`) — CSS dùng `--lh-body` 1,5 và `--lh-heading` 1,25.
- Vòng focus có khe không vẽ được trong Figma — CSS: `outline: 2px solid var(--ink); outline-offset: 2px`.
