# Server — khung website Smart Classroom (ID 9)

Backend Node.js nhận bản tin MQTT từ hộp đo, đẩy lên trình duyệt qua WebSocket, cung cấp REST `/api` và phục vụ giao diện trong `frontend/`. Chạy trọn bộ trên một máy bằng **chế độ giả lập**: không cần board, HiveMQ, Firestore hay Telegram.

```
sim-esp32 ──MQTT──► dev-broker (:1883) ◄──MQTT── backend (:3000) ──WebSocket /ws──► trình duyệt (frontend/)
                                                    ├─ bus ─► plugins/*.js   (Firestore, Telegram: cắm thêm)
                                                    ├─ HistoryProvider       (memory | firestore)
                                                    └─ REST /api/*
```

Hợp đồng dữ liệu (topic, JSON, WebSocket, REST, hằng số) nằm ở [`contract/README.md`](../contract/README.md) và [`contract/system.json`](../contract/system.json). Đổi hợp đồng cần PR và cả nhóm đồng ý.

---

## 1. Chạy nhanh

Yêu cầu: **Node.js ≥ 20.12** (khuyến nghị 22 LTS). Mọi lệnh chạy trong thư mục `server/`.

```bash
cd server
npm ci          # lần đầu: cài đúng phiên bản trong package-lock.json
npm run dev     # broker + backend + ESP32 giả, gửi mỗi 5 giây, gieo sẵn 24 giờ lịch sử
```

Mở **http://localhost:3000**. Tắt bằng `q` hoặc `Ctrl+C`.

`npm run dev` **luôn** dùng broker trên máy này và `MODE=sim`, kể cả khi `server/.env` đang trỏ tới HiveMQ thật, để dữ liệu giả không lên broker của nhóm. Thanh trạng thái hiện nhãn **GIẢ LẬP** khi chạy kiểu này.

### Kịch bản giả lập

Bấm phím trong cửa sổ đang chạy `npm run dev`:

| Phím | Kịch bản | Trang Giám sát hiển thị |
|---|---|---|
| `n` | Bình thường (64,5 % · 27,5 °C · 850 ppm) | 3 nhãn BÌNH THƯỜNG, đèn 3–8 xanh lá |
| `h` / `l` | Độ ẩm cao 88 % / thấp 24 % (tăng giảm dần, đợi ~30 giây) | Dải đèn hiệu CAO / THẤP, CẢNH BÁO, cặp 5–6 đỏ |
| `t` | Nhiệt độ 32 °C | CẦN CHÚ Ý, cặp 3–4 vàng |
| `e` | DHT22 lỗi | Gauge độ ẩm, nhiệt độ trống · "KHÔNG ĐỌC ĐƯỢC" · cặp 3–6 nháy trắng |
| `w` | MQ-135 đang làm nóng | Gauge CO₂ trống · cặp 7–8 nháy trắng |
| `p` | Ngừng gửi, giữ kết nối | Sau 90 giây: DỮ LIỆU CŨ, số mờ, đèn xám |
| `o` | Rớt mạng đột ngột (LWT) | THIẾT BỊ NGOẠI TUYẾN, hình hộp nét đứt |
| `b` | Gửi bản tin sai | Backend bỏ, ghi lý do trong log |
| `u` | Gửi dồn 20 bản tin | |

Tham số thêm:

```bash
npm run dev -- --scenario humid-high   # bắt đầu luôn ở một kịch bản
npm run dev -- --interval 30           # đúng chu kỳ thật của ESP32
npm run dev -- --no-levels             # không gửi `levels`, thử backend tự tính mức
```

### Chạy tách từng phần

```bash
npm run broker                                  # broker MQTT cục bộ (aedes) :1883
npm start                                       # backend, đọc server/.env
npm run sim -- --interval 3 --scenario normal   # ESP32 giả
```

Giả lập từ chối kết nối broker không phải `localhost`, trừ khi thêm `--allow-remote`.

---

## 2. Cấu hình (`server/.env`)

```bash
copy .env.example .env    # Windows; macOS/Linux: cp .env.example .env
```

Mọi biến đều có mặc định, xem chú thích trong [`.env.example`](.env.example). **Không commit `.env`.**

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `PORT` | `3000` | Cổng HTTP và WebSocket |
| `MQTT_URL`, `MQTT_USER`, `MQTT_PASS` | `mqtt://localhost:1883` | Broker. HiveMQ Cloud: `mqtts://<cluster>.s1.eu.hivemq.cloud:8883` |
| `DEVICE_ID` | `sc-01` | Phải khớp `contract/system.json` và firmware |
| `MODE` | `sim` | `sim` (dữ liệu giả, hiện nhãn GIẢ LẬP) · `live` (thiết bị thật) |
| `HISTORY_PROVIDER` | `memory` | Nguồn lịch sử: `memory` · `firestore` (khi Tuấn thêm) |
| `HISTORY_SEED_HOURS` | `0` | Chỉ với `sim` + `memory`: gieo sẵn N giờ dữ liệu giả |
| `AUTH_ENABLED` | `false` | Đăng nhập (ID 8). `false` = không chặn |
| `PLUGINS_DISABLED` | trống | Tắt plugin theo tên file, ví dụ `firestore,telegram` |
| `LOG_LEVEL` | `info` | `error` · `warn` · `info` · `debug` |

Chuyển sang thiết bị thật: đặt `MODE=live`, `MQTT_URL=mqtts://…:8883`, `MQTT_USER`, `MQTT_PASS`, rồi chạy `npm start` (không dùng `npm run dev`). Khi nhiều máy cùng nối HiveMQ thật, **chỉ một máy** bật plugin ghi dữ liệu (`contract/README.md` mục 8).

---

## 3. Kiểm thử

```bash
npm test
```

Chạy bằng `node:test`, không cần mạng hay tài khoản. Gồm:

| File | Nội dung |
|---|---|
| `validate`, `levels`, `state`, `device-watch` | Kiểm tra bản tin, ranh giới 3 mức, trạng thái thiết bị (89 / 91 / 299 / 301 giây, LWT) |
| `config`, `plugins`, `history`, `http` | Cấu hình, nạp plugin, gom lịch sử theo giờ/ngày, REST |
| `mqtt.integration`, `e2e` | Broker + backend thật trên cổng ngẫu nhiên: publish → WebSocket nhận |
| `sim-device` | Kịch bản giả lập |
| `frontend-core`, `frontend-connection`, `frontend-instrument` | Phần thuần của giao diện: định dạng số, router, 5 trạng thái kết nối, gauge, màu LED, sparkline |
| `frontend-device` | Trang Thiết bị & WiFi, Telegram: hàng cảm biến, hàng LED, câu trả lời mẫu của bot |
| `led`, `frontend-led` | Lệnh đèn LED: kiểm tra bảng màu / Kiểm tra đèn, mã lỗi 409 · 422 · 503, web → broker → ESP32; bản nháp, khoảng ngưỡng, trùng màu |

---

## 4. Cấu trúc

```
server/
  scripts/   dev.js (chạy cả bộ) · dev-broker.js · sim-esp32.js · sim/device.js (kịch bản)
  src/
    index.js               khởi động
    config.js              đọc .env + contract/system.json (module khác không đọc process.env)
    core/                  bus.js · state.js · validate.js · levels.js · device-watch.js
    mqtt/client.js         nhận telemetry/status, gửi led/cmd
    ws/server.js           /ws: hello (toàn bộ trạng thái) → reading · device · led
    http/                  app.js · routes/{health,session,state,history}.js · middleware/auth.js
    providers/history/     index.js (chọn theo HISTORY_PROVIDER) · memory.js
    plugins/               index.js (tự nạp) · _example.js (mẫu, không được nạp)
  test/
frontend/                  HTML/CSS/JS thuần, không bước build; server phục vụ tĩnh
  js/pages/<trang>.js      mỗi trang xuất { mount(el, ctx), unmount() }; khai báo trong js/routes.js
  js/core/                 store, ws, router, i18n, format + phần tính toán thuần (có kiểm thử)
  js/components/           thanh trạng thái, rail, gauge, thanh LED, Device Twin, sparkline…
  css/tokens.css           token màu, chữ, khoảng cách (chép từ design-claude/tokens.css)
  strings/vi.json          mọi chuỗi giao diện
```

---

## 5. Cắm phần của mình vào (không sửa file của khung)

Code của khung (`src/core`, `src/http`, `src/mqtt`, `src/ws`, `frontend/` trừ trang Lịch sử) do Uy giữ. Muốn đổi thì nhắn hoặc mở issue trước. Phần dưới đây chỉ cần **thêm file**.

### 5.1 Plugin backend

Mọi file `src/plugins/*.js` (trừ `index.js` và file bắt đầu bằng `_`) được nạp tự động. Chép [`_example.js`](src/plugins/_example.js) rồi sửa:

```js
export async function register({ bus, state, config, log }) {
  const off = bus.on('reading', async (r) => {
    // r = { receivedAt, seq, temperature, humidity, co2, sensors, levels, levelsSource }
  }, 'ten-plugin');
  return { close: async () => off() };
}
```

- Sự kiện: `reading` (bản tin hợp lệ) · `device` (thiết bị đổi trạng thái) · `led:sent` (đã gửi lệnh LED). Dữ liệu là bản sao, sửa không ảnh hưởng ai.
- `state` chỉ đọc: `latest()`, `device()`, `led()`, `snapshot()`. Hằng số: `config.contract` (= `system.json`).
- Plugin lỗi khi nạp, hoặc ném lỗi khi xử lý sự kiện, chỉ bị ghi log, backend vẫn chạy.
- **Khi `config.mode === 'sim'` dữ liệu là GIẢ.** Plugin ghi ra dịch vụ thật phải tách riêng (collection riêng, Emulator, chỉ gửi cho người thử).

### 5.2 Provider lịch sử

File `src/providers/history/<tên>.js` xuất `create({ config, bus, log })` trả về `{ query, close? }`. `query({ metric, from, to, bucket })` trả đúng dạng [`contract/examples/api.history.json`](../contract/examples/api.history.json): mỗi giờ (hoặc ngày, bắt đầu 00:00 UTC+7) một điểm `{ t, avg, min, max, n }`, mốc không có dữ liệu thì `avg/min/max = null`, `n = 0`. Chọn bằng `HISTORY_PROVIDER=<tên>`. Bản tham khảo: [`memory.js`](src/providers/history/memory.js).

### 5.3 Trang giao diện

Thêm `frontend/js/pages/<tên>.js` xuất `{ mount(el, { store, t, url, navigate }), unmount() }` và một dòng trong `frontend/js/routes.js`. Màu, khoảng cách lấy từ `css/tokens.css`, chuỗi đặt trong `strings/vi.json`. Thiếu dữ liệu thì hiện "—", không bao giờ hiện số giả.

### Tuấn (ID 4, 5)

1. **Firestore:** tạo `src/plugins/firestore.js`, nghe `bus.on('reading')` và ghi `{ receivedAt, temperature, humidity, co2, sensors }`. Khi `mode === 'sim'` ghi vào collection riêng (ví dụ `readings_sim`) hoặc Firebase Emulator. Khóa service account đặt **ngoài repo**, đường dẫn trong `.env` (`GOOGLE_APPLICATION_CREDENTIALS`).
   - Lưu ý: `backend/` hiện tại nghe topic `dht22` / `mq135` với tên trường riêng (`temperatureC`, `humidityPct`, `co2EstimatedPpm`). Hợp đồng dùng một topic `smartclassroom/sc-01/telemetry` gửi cả ba số. Plugin nhận bản tin đã kiểm tra qua `bus`, nên không cần tự nghe MQTT; phần chuẩn hóa và ghi Firestore trong `backend/src` dùng lại được.
2. **Lịch sử:** tạo `src/providers/history/firestore.js` theo mục 5.2, rồi đặt `HISTORY_PROVIDER=firestore`. Dải "24 GIỜ QUA" trên Giám sát tự dùng provider này.
3. **Trang Lịch sử:** `frontend/js/pages/history.js` (đang là trang tạm) và `frontend/vendor/chart.umd.min.js` (tự đóng gói, không CDN). Màu dùng `--data-*`, vùng ngoài ngưỡng `--accent-alert-tint` (HANDOFF §3.3).
4. **Firmware MQ-135 (ID 2):** gửi `co2` và `sensors.mq135` (`ok` · `warming` · `error`) theo `contract/README.md` mục 2.1.
5. **Thử không cần board:** `npm run dev`, kiểm tra Firestore (collection giả lập) có dữ liệu.

### Thành (ID 1, 6, 7, 10)

1. **Telegram:** tạo `src/plugins/telegram.js`, nghe `bus.on('reading')`, cảnh báo khi `humidity < config.contract.telegram.humidityLow` (30) hoặc `> humidityHigh` (85), nghỉ `cooldownMin` (30) phút giữa hai lần. Lệnh `/doam`, `/trangthai` đọc `state.latest()` và `state.device()`. Token bot đặt trong `.env`.
2. **Thử cảnh báo:** `npm run dev`, bấm `h` (88 %) hoặc `l` (24 %). Khi giả lập, chỉ gửi cho người đang thử.
3. **Firmware DHT22 (ID 1):** gửi `telemetry` mỗi `intervalS` (30) giây; `status` retained + LWT `{ "v": 1, "online": false }` (`contract/README.md` mục 2.2). Muốn thử firmware với backend trên máy: `npm run broker` + `npm start`, cho ESP32 trỏ `MQTT_URL` về IP máy tính, cổng 1883.

### Uy (ID 3, 8)

- **LED (ID 3):** trang `frontend/js/pages/led.js`, route `POST /api/led/palette` và `POST /api/led/test` gửi `led/cmd` (`contract/README.md` mục 2.3, 6).
- **Đăng nhập (ID 8):** thay thân hàm trong `src/http/middleware/auth.js`, giữ nguyên chữ ký `requireAuth` / `authorizeUpgrade`.

---

## 6. Sự cố thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| "Cổng 1883 đã có chương trình khác" | Một lần chạy trước chưa tắt, hoặc đang chạy Mosquitto/HiveMQ local. Đóng nó, hoặc đổi cổng: PowerShell `$env:BROKER_PORT=1884; npm run dev` · bash `BROKER_PORT=1884 npm run dev` |
| Số liệu toàn "—", thanh trạng thái "ĐANG KẾT NỐI…" mãi | Backend đã chạy nhưng chưa có bản tin nào: kiểm tra giả lập (hoặc ESP32) đã kết nối đúng broker |
| Thanh trạng thái "MẤT KẾT NỐI" | Backend đã tắt; trang tự thử lại theo 5 → 10 → 20 → 30 giây |
| `HISTORY_PROVIDER=firestore nhưng chưa có file …` | Chưa có `src/providers/history/firestore.js`; tạm dùng `memory` |
| Dải "24 GIỜ QUA" toàn "—" khi chạy `npm start` | `memory` không gieo sẵn khi `HISTORY_SEED_HOURS=0`; đợi dữ liệu hoặc đặt `24` |
| PowerShell chặn `npm.ps1` | Dùng `npm.cmd` thay `npm` |
