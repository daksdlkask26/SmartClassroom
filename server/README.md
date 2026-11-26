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

Yêu cầu **Node.js 22.9 trở lên**. Mọi lệnh chạy trong thư mục `server/`.

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

`npm run sim` mặc định dùng broker cục bộ. Dùng `--from-env` để đọc cấu hình MQTT trong `server/.env` và `--allow-remote` để cho phép broker từ xa.

---

## 2. Cấu hình (`server/.env`)

```bash
npm run env:init    # tạo .env từ mẫu khi chưa có file
npm run env:update  # thêm biến còn thiếu sau khi .env.example thay đổi
```

Khi cập nhật, các giá trị đã cấu hình, kể cả giá trị trống, và các biến riêng vẫn được giữ nguyên. Dòng chú thích trong mẫu chỉ dùng để tham khảo.

Mọi biến đều có mặc định, xem chú thích trong [`.env.example`](.env.example). **Không commit `.env`.**

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `PORT` | `3000` | Cổng HTTP và WebSocket |
| `MQTT_URL`, `MQTT_USER`, `MQTT_PASS` | `mqtt://localhost:1883`, tài khoản trống | Broker từ xa dùng `mqtts://` với tài khoản MQTT. Đặt tài khoản ở hai biến riêng. Dùng giá trị thật khi kết nối. |
| `DEVICE_ID` | `sc-01` | Mã thiết bị trong topic MQTT, khớp ESP32 hoặc `--device` của bộ giả lập |
| `MODE` | `sim` | `sim` (dữ liệu giả, hiện nhãn GIẢ LẬP) · `live` (thiết bị thật) |
| `HISTORY_PROVIDER` | `memory` | Nguồn lịch sử: `memory` · `firestore` (cần `FIREBASE_PROJECT_ID`) |
| `FIREBASE_PROJECT_ID` | trống | Bật plugin ghi Firestore (ID 4) và provider lịch sử Firestore (ID 5). Trống = plugin tự tắt |
| `GOOGLE_APPLICATION_CREDENTIALS` | `./firebase/serviceAccountKey.json` | Khóa service account, đường dẫn tương đối tính từ `server/`. **Không commit** |
| `FIRESTORE_EMULATOR_HOST` | trống | `127.0.0.1:8085` khi thử với Emulator (kèm `FIREBASE_PROJECT_ID=demo-smartclassroom`) |
| `TELEGRAM_BOT_TOKEN` | trống | Token bot do @BotFather cấp: bật plugin Telegram (ID 6, 7). Trống = plugin tự tắt. **Không commit** |
| `TELEGRAM_BOT_USERNAME` | trống | Tên bot, không có `@` (bắt buộc khi có token). Công khai: trang Telegram của website hiện tên này và nút mở bot |
| `TELEGRAM_ALLOWED_CHAT_IDS` | trống | Chat ID được dùng bot, cách nhau bằng dấu phẩy. Trống = ai tìm thấy bot cũng dùng được |
| `HISTORY_SEED_HOURS` | `0` | Chỉ với `sim` + `memory`: gieo sẵn N giờ dữ liệu giả |
| `AUTH_ENABLED` | `false` | Đăng nhập (ID 8). `false` = không chặn |
| `PLUGINS_DISABLED` | trống | Tắt plugin theo tên file, ví dụ `firestore,telegram` |
| `DATA_DIR` | `data` | Thư mục dữ liệu lúc chạy, tính từ `server/` (đã ignore). Gồm `led-<MODE>-<DEVICE_ID>.json` (bảng màu LED gửi gần nhất, để khởi động lại backend vẫn hiện đúng bảng ESP32 đang dùng) và `telegram-<MODE>-<DEVICE_ID>.json` (người nhận cảnh báo, giờ cảnh báo gần nhất; có chat ID nên **không commit**) |
| `LOG_LEVEL` | `info` | `error` · `warn` · `info` · `debug` |

### HiveMQ Cloud

Trước khi tạo broker Cloud, có thể chạy dự án với broker cục bộ bằng `npm run dev`.

1. Trong HiveMQ Console, mở **Connect → Get Broker or Edge → Deploy a new Broker → HiveMQ Cloud**, chọn **Starter** và bắt đầu trial 15 ngày. Khi broker báo **Running**, chọn broker, mở **Configure → Overview** và sao chép toàn bộ hostname. [HiveMQ Console](https://app.hivemq.com) · [Hướng dẫn tạo broker](https://docs.hivemq.com/hivemq-platform/connect/deploy-a-broker.html)
2. Trong **Access Management → Authentication → Credentials**, chọn **Add Credentials**. Tạo username và password MQTT rồi gán role có quyền trên các topic bên dưới. [Hướng dẫn tạo tài khoản MQTT](https://docs.hivemq.com/hivemq-platform/connect/create-access-credentials.html)
3. Điền `server/.env` với hostname và tài khoản lấy ở hai bước trên. `MQTT_URL` dùng `mqtts://` và cổng `8883`. Hostname dưới đây minh họa định dạng Starter. [Ví dụ hostname từ HiveMQ](https://www.hivemq.com/blog/step-by-step-guide-using-hivemq-cloud-starter-iot/)

```dotenv
MODE=live
MQTT_URL=mqtts://your-cluster.a01.euc1.aws.hivemq.cloud:8883
MQTT_USER=your-mqtt-username
MQTT_PASS="your-mqtt-password"
```

HiveMQ cũng có MQTT qua WebSocket ở cổng `8884` cho Web Client trong **Troubleshooting → Test your connection**. Trình duyệt của Smart Classroom nhận dữ liệu qua `/ws` của backend. [Hướng dẫn kiểm tra kết nối HiveMQ](https://docs.hivemq.com/hivemq-cloud/quick-start-guide.html)

- **Backend:** chạy `npm start` và xem `GET /api/health` để kiểm tra `mqtt: "connected"`. Tài khoản cần quyền subscribe `smartclassroom/<DEVICE_ID>/telemetry` và `status`, cùng quyền publish `smartclassroom/<DEVICE_ID>/led/cmd`. Khi nhiều máy cùng nối broker thật, chỉ một máy bật plugin ghi Firestore.
- **ESP32:** sao chép mẫu thành `firmware/include/secrets.h` rồi điền hostname, cổng `8883` và tài khoản thiết bị. Tài khoản cần quyền publish `telemetry`, `status` và subscribe `led/cmd` theo cùng `DEVICE_ID`. Firmware dùng `WiFiClientSecure` với CA của broker khi ghép kết nối. [Mẫu cấu hình ESP32](../firmware/include/secrets.example.h)
- **Giả lập trên Cloud:** dành một mã thiết bị thử, ví dụ `sc-test`, và chạy `npm run sim -- --from-env --allow-remote --device sc-test --count 3`. Để xem các bản tin này trên web, chạy backend với `MODE=sim` và `DEVICE_ID=sc-test`.

### Bot Telegram (ID 6, 7)

1. Trong Telegram, nhắn [@BotFather](https://t.me/BotFather) lệnh `/newbot`, đặt tên hiển thị và tên bot (phải kết thúc bằng `bot`). BotFather trả về token. Nên tạo **hai bot**: một cho giả lập, một cho thiết bị thật. [Hướng dẫn tạo bot](https://core.telegram.org/bots/features#creating-a-new-bot)
2. Điền `server/.env`:

   ```dotenv
   TELEGRAM_BOT_TOKEN=123456789:AA...      # token từ BotFather, không commit
   TELEGRAM_BOT_USERNAME=SmartClassroom16Bot
   TELEGRAM_ALLOWED_CHAT_IDS=              # để trống lúc đầu
   ```

3. Chạy backend, mở chat riêng với bot, gửi `/start`. Muốn giới hạn người dùng: điền chat ID của từng người vào `TELEGRAM_ALLOWED_CHAT_IDS` rồi chạy lại backend. Người chưa được phép gửi `/start` sẽ nhận lại chat ID của chính họ; log backend cũng in chat ID của người mới đăng ký.

- Lệnh: `/start` đăng ký nhận cảnh báo · `/stop` huỷ · `/doam` độ ẩm mới nhất · `/trangthai` thiết bị và môi trường. Bot chỉ trả lời trong chat riêng.
- Cảnh báo khi độ ẩm < 30 % hoặc > 85 %, nghỉ 30 phút **cho từng người** giữa hai lần (số lấy từ `contract/system.json` → `telegram`). Quy tắc đầy đủ: [`contract/README.md`](../contract/README.md) mục 8.3.
- Khi `MODE=sim`, mọi tin bot gửi có nhãn `[GIẢ LẬP]`.
- Bot nhận lệnh bằng long polling, nên **chỉ một máy** được chạy mỗi bot. Máy thứ hai chạy cùng token sẽ thấy lỗi 409 trong log; đặt `PLUGINS_DISABLED=telegram` trên máy đó.
- Telegram lỗi, mất mạng hay token sai chỉ ghi log; backend vẫn chạy và tự nối lại khi có mạng.

---

## 3. Kiểm thử

```bash
npm test
```

Chạy bằng `node:test`, không cần mạng, tài khoản hay Java. Gồm:

| File | Nội dung |
|---|---|
| `validate`, `levels`, `state`, `device-watch` | Kiểm tra bản tin, ranh giới 3 mức, trạng thái thiết bị (89 / 91 / 299 / 301 giây, LWT) |
| `config`, `plugins`, `history`, `http` | Cấu hình (kể cả quy tắc siết MQTT, Firebase), nạp plugin, gom lịch sử theo giờ/ngày, REST |
| `firestore-config`, `firestore-reading-store`, `firestore-plugin`, `firestore-history` | Ghi và đọc Firestore bằng Firestore giả trong bộ nhớ (`test/helpers/memory-firestore.js`): mã chống trùng, giao dịch cộng dồn theo giờ, thử lại, cache, plugin tự tắt khi chưa cấu hình |
| `mqtt.integration`, `e2e` | Broker + backend thật trên cổng ngẫu nhiên: publish → WebSocket nhận |
| `sim-device`, `sim-mqtt` | Kịch bản giả lập, đọc cấu hình MQTT và gửi bản tin vào broker thử có xác thực |
| `frontend-core`, `frontend-connection`, `frontend-instrument` | Phần thuần của giao diện: định dạng số, router, 5 trạng thái kết nối, gauge, màu LED, sparkline |
| `frontend-device` | Trang Thiết bị & WiFi, Telegram: hàng cảm biến, hàng LED, câu trả lời mẫu của bot |
| `led`, `frontend-led` | Lệnh đèn LED: kiểm tra bảng màu / Kiểm tra đèn, mã lỗi 409 · 422 · 503, web → broker → ESP32; bản nháp, khoảng ngưỡng, trùng màu |
| `led-store` | Lưu bảng màu gửi gần nhất ra `DATA_DIR`, đọc lại khi khởi động lại backend; file hỏng thì bỏ qua |
| `frontend-theme` | Chủ đề Theo hệ điều hành / Sáng · Body / Tối · Lid; script đầu `<head>` khớp `theme.js` |
| `telegram-config`, `telegram-client`, `telegram-store` | Cấu hình bot (token không lộ ra log hay trình duyệt), gọi API Telegram (thử lại, 429, 409, 401, 403, timeout, huỷ), lưu người nhận ra file |
| `telegram-commands`, `telegram-messages` | Lệnh `/start` `/stop` `/doam` `/trangthai`, allowlist, chat nhóm, lệnh cũ; nội dung tin (dữ liệu cũ, ngoại tuyến, cảm biến lỗi) và **khớp nguyên văn câu mẫu trên website** |
| `telegram-alert`, `telegram-plugin` | Ngưỡng 29,9 / 30 / 85 / 85,1, cooldown, khởi động lại, một người gửi lỗi; plugin khởi động nền, polling, dừng sạch. Dùng Telegram giả (`test/helpers/fake-telegram.js`), không gửi tin thật |

### Kiểm thử tích hợp với Firestore Emulator

```bash
npm run test:integration   # tự mở Emulator, chạy test/integration/*.test.js, tự tắt
npm run emulators          # chỉ mở Emulator để thử thủ công: UI http://127.0.0.1:4000, Firestore 127.0.0.1:8085
```

Cần **Java 21+** (xem mục 7). Lần đầu `npx` tải Firebase CLI (vài trăm MB, có nằm ngoài `node_modules` của dự án). Không dùng khóa cloud và không ghi lên cloud. Kiểm thật: giao dịch cộng dồn khi 20 bản tin ghi cùng lúc, chống trùng, provider lịch sử, plugin qua bus.

### Kiểm tra giao diện bằng Chrome (`tools/verify-web.cjs`)

Cần Chrome trên máy (đặt `CHROME_PATH` nếu không ở chỗ mặc định). Chạy từ thư mục gốc repo:

```bash
node tools/verify-web.cjs                              # tự chạy broker + giả lập + backend riêng ở cổng 1884 / 3100
node tools/verify-web.cjs --only layout,contrast --widths 390,1440 --shots ../shots
node tools/verify-web.cjs --url http://localhost:3000  # dùng backend đang chạy (bỏ phần thanh trạng thái)
```

Kiểm 7 trang ở 320 · 390 · 768 · 1280 · 1440 · 1920 px, cả hai chủ đề: không cuộn ngang, không tràn panel, tương phản chữ ≥ 4,5:1, chọn chủ đề, Tab + vòng focus, Enter / Space / Esc trên trang Đèn LED, `prefers-reduced-motion`, vùng bấm ≥ 44 px ở 390 px, thanh trạng thái Trực tuyến → Ngoại tuyến (LWT) → Mất kết nối, và không có lỗi JS. Có lỗi thì thoát mã 1.

---

## 4. Cấu trúc

```
server/
  firebase/  firestore.rules (chặn truy cập trực tiếp từ trình duyệt) · firebase.json (cổng Emulator) · chỗ đặt serviceAccountKey.json (ignore)
  scripts/   dev.js (chạy cả bộ) · dev-broker.js · sim-esp32.js · sim/device.js (kịch bản)
    emulator/  run.js (Emulator) · smoke-firestore.js (kiểm tra kết nối) · list-readings.js (xem 20 bản tin gần nhất)
  src/
    index.js               khởi động
    config.js              đọc .env + contract/system.json (module khác không đọc process.env)
    core/                  bus.js · state.js · validate.js · levels.js · device-watch.js · led-cmd.js · led-store.js
    mqtt/client.js         nhận telemetry/status, gửi led/cmd
    ws/server.js           /ws: hello (toàn bộ trạng thái) → reading · device · led
    http/                  app.js · routes/{health,session,state,history,led}.js · middleware/auth.js
    providers/history/     index.js (chọn theo HISTORY_PROVIDER) · memory.js · firestore.js
    plugins/               index.js (tự nạp) · firestore.js · telegram.js · _example.js (mẫu, không được nạp)
    services/firestore/    config.js · client.js (kết nối dùng chung) · reading-store.js (ghi, đọc): KHÔNG nằm trong plugins/ vì loader chỉ nạp file .js trực tiếp ở đó
    services/telegram/     client.js (Bot API) · poller.js (long polling) · commands.js · messages.js · alerts.js (luật cảnh báo) · store.js (người nhận)
  test/                    *.test.js chạy bằng npm test · integration/ cần Emulator · helpers/
frontend/                  HTML/CSS/JS thuần, không bước build; server phục vụ tĩnh
  js/pages/<trang>.js      mỗi trang xuất { mount(el, ctx), unmount() }; khai báo trong js/routes.js
  js/core/                 store, ws, router, i18n, format + phần tính toán thuần (có kiểm thử)
  js/components/           thanh trạng thái, rail, gauge, thanh LED, Device Twin, sparkline…
  css/tokens.css           token màu, chữ, khoảng cách (chép từ design/tokens.css, xem DECISIONS.md)
  strings/vi.json          mọi chuỗi giao diện
```

---

## 5. Cắm phần của mình vào (không sửa file của khung)

Code của khung (`src/core`, `src/http`, `src/mqtt`, `src/ws`, `frontend/` trừ trang Lịch sử) do Uy giữ. Muốn đổi thì nhắn hoặc mở issue trước. Phần dưới đây chỉ cần **thêm file**.

### 5.1 Plugin backend

Mọi file `src/plugins/*.js` (trừ `index.js` và file bắt đầu bằng `_`) được nạp tự động. Chép [`_example.js`](src/plugins/_example.js) rồi sửa:

> Loader chỉ nạp file `.js` nằm **trực tiếp** trong `plugins/`, không nạp thư mục con. Giữ plugin mỏng (nghe bus, gọi hàm) và đặt phần chính ở `src/services/<tên>/`, như `plugins/firestore.js` với `services/firestore/`.

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

Phần ghi Firestore (ID 4) và đọc lịch sử (ID 5) đã có khung chạy được; lược đồ nằm ở [`contract/README.md`](../contract/README.md) mục 8.1.

1. **Thử với Emulator:** `npm run emulators` ở một cửa sổ; cửa sổ khác điền `server/.env`: `FIREBASE_PROJECT_ID=demo-smartclassroom`, `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085`, rồi `npm run dev`. Bấm `h` để tạo độ ẩm cao và xem document trong UI Emulator, `devices/sc-01/readings_sim`.
2. **Thử với Firebase thật:** tải khóa service account về `server/firebase/serviceAccountKey.json`, điền `FIREBASE_PROJECT_ID` thật, rồi `npm run check:firestore` (ghi một bản thử, đọc lại, gửi lại để kiểm tra không trùng) và `npm run readings` (xem 20 bản gần nhất).
3. **Cách dữ liệu được ghi:** `plugins/firestore.js` nghe `bus.on('reading')`, mỗi bản tin ghi **một giao dịch** gồm document bản tin (`readings`, mã chống trùng từ `bootId` + `seq`) và cộng dồn vào document giờ (`hourly`: n, tổng, nhỏ nhất, lớn nhất). Dữ liệu giả lập (`MODE=sim`) ghi vào `readings_sim` / `hourly_sim`.
4. **Cách lịch sử được đọc:** `providers/history/firestore.js` đọc các document **giờ** (24 giờ = 24 document cho cả ba chỉ số) rồi gom theo giờ hoặc ngày (00:00 UTC+7), kèm cache 60 giây. Nhờ vậy trang Giám sát tự làm mới mỗi 5 phút cũng không chạm hạn mức đọc mỗi ngày của gói miễn phí. Bật bằng `HISTORY_PROVIDER=firestore`.
5. **Còn lại cho ID 5:** trang Lịch sử bằng Chart.js (`frontend/js/pages/history.js` đang là trang tạm; `frontend/vendor/chart.umd.min.js` tự đóng gói, không CDN; màu `--data-*`, vùng ngoài ngưỡng `--accent-alert-tint`, HANDOFF §3.3).
6. **Firmware MQ-135 (ID 2):** gửi `co2` và `sensors.mq135` (`ok` · `warming` · `error`), kèm `bootId`, theo `contract/README.md` mục 2.1.

### Thành (ID 1, 6, 7, 10)

1. **Telegram:** bot đã chạy được (`src/plugins/telegram.js` + `src/services/telegram/`), cài đặt ở mục 2 "Bot Telegram".
2. **Thử với bot giả lập** (`npm run dev`): gửi `/start`, `/doam`, `/trangthai`. Bấm `h` (88 %) → nhận **đúng một** cảnh báo, để chạy thêm vài phút không bị báo trùng. Bấm `n` rồi `l` (24 %) trong 30 phút → **không** có cảnh báo mới (đang nghỉ). `e` (DHT22 lỗi), `p` (dữ liệu cũ sau 90 giây), `o` (rớt mạng) để xem câu trả lời tương ứng. Tắt rồi bật lại backend: vẫn còn đăng ký, không bị gửi lại cảnh báo ngay.
3. **Firmware DHT22 (ID 1):** gửi `telemetry` mỗi `intervalS` (30) giây; `status` retained + LWT `{ "v": 1, "online": false }` (`contract/README.md` mục 2.2). Muốn thử firmware với backend trên máy: `npm run broker` + `npm start`, cho ESP32 trỏ `MQTT_URL` về IP máy tính, cổng 1883.

### Uy (ID 3, 8)

- **LED (ID 3):** trang `frontend/js/pages/led.js`, route `POST /api/led/palette` và `POST /api/led/test` gửi `led/cmd` (`contract/README.md` mục 2.3, 6). Bảng màu gửi gần nhất lưu ở `data/led-<MODE>-<DEVICE_ID>.json` (`src/core/led-store.js`). Chế độ Kiểm tra đèn không được lưu, vì firmware cũng không lưu chế độ này vào flash.
- **Đăng nhập (ID 8):** thay thân hàm trong `src/http/middleware/auth.js`, giữ nguyên chữ ký `requireAuth` / `authorizeUpgrade`.

---

## 6. Sự cố thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| "Cổng 1883 đã có chương trình khác" | Một lần chạy trước chưa tắt, hoặc đang chạy Mosquitto/HiveMQ local. Đóng nó, hoặc đổi cổng: PowerShell `$env:BROKER_PORT=1884; npm run dev` · bash `BROKER_PORT=1884 npm run dev` |
| Số liệu toàn "—", thanh trạng thái "ĐANG KẾT NỐI…" mãi | Backend đã chạy nhưng chưa có bản tin nào: kiểm tra giả lập (hoặc ESP32) đã kết nối đúng broker |
| Thanh trạng thái "MẤT KẾT NỐI" | Backend đã tắt; trang tự thử lại theo 5 → 10 → 20 → 30 giây |
| `HISTORY_PROVIDER=firestore cần FIREBASE_PROJECT_ID …` | Chưa điền khối Firebase trong `server/.env`; tạm dùng `memory` |
| Log "plugin firestore: Tắt: chưa đặt FIREBASE_PROJECT_ID" | Bình thường khi chưa cấu hình Firestore, backend vẫn chạy |
| Hai máy cùng ghi Firestore, mỗi bản tin xuất hiện hai lần | Chỉ một máy được bật plugin; máy khác đặt `PLUGINS_DISABLED=firestore` |
| `Không tìm thấy file khóa …serviceAccountKey.json` | Tải khóa về `server/firebase/` hoặc sửa `GOOGLE_APPLICATION_CREDENTIALS` |
| `Project demo-* cần FIRESTORE_EMULATOR_HOST` | Project `demo-*` chỉ dùng với Emulator; đặt thêm `FIRESTORE_EMULATOR_HOST=127.0.0.1:8085` |
| Dải "24 GIỜ QUA" toàn "—" khi chạy `npm start` | `memory` không gieo sẵn khi `HISTORY_SEED_HOURS=0`; đợi dữ liệu hoặc đặt `24` |
| Log "plugin telegram: Tắt: chưa đặt TELEGRAM_BOT_TOKEN" | Bình thường khi chưa cấu hình bot; trang Telegram trên web khoá nút "Mở Telegram" |
| `Telegram báo xung đột (409)` | Máy khác đang chạy cùng bot, hoặc bot đang đặt webhook. Chỉ một máy bật bot (`PLUGINS_DISABLED=telegram` ở máy khác) |
| `Telegram từ chối token (401)` | Token sai hoặc đã bị thu hồi: lấy token mới từ @BotFather (`/token`) |
| Bot không trả lời ai | Xem log có 401 / 409 không; kiểm tra `TELEGRAM_ALLOWED_CHAT_IDS` có chat ID của bạn chưa |
| PowerShell chặn `npm.ps1` | Dùng `npm.cmd` thay `npm` |

---

## 7. Cài đặt Java 21 và HiveMQ cục bộ

Chỉ cần khi chạy **Firestore Emulator** (Java 21+) hoặc muốn thử bằng **HiveMQ cài trên máy** thay cho broker giả lập `npm run broker`. Chạy giả lập thông thường **không cần**.

### Java 21

- **Windows:** tải [Temurin JDK 21 (MSI)](https://adoptium.net/temurin/releases/?version=21&os=windows&arch=x64&package=jdk), bật **PATH** và **JAVA_HOME** khi cài (`JAVA_HOME` trỏ tới thư mục JDK, không gồm `\bin`), rồi mở PowerShell mới. [Hướng dẫn](https://adoptium.net/installation/windows/).
- **Linux (Ubuntu):** `sudo apt install openjdk-21-jdk` (hoặc bản mới hơn).
- Kiểm tra: `java -version` phải hiện 21 trở lên.

### HiveMQ cục bộ (tùy chọn, Windows)

1. Tải bản [Install locally](https://docs.hivemq.com/hivemq/latest/user-guide/getting-started.html#_install_hivemq_locally_on_a_server_or_computer_of_your_choice), giải nén. Mở **PowerShell quyền Administrator** tại thư mục có `bin/` và `conf/`.
2. Điền license key vào thẻ `<license-key>` trong `conf/license.xml` (bỏ dấu chú thích quanh thẻ nếu có). Cần Internet để xác thực. [Hướng dẫn license](https://docs.hivemq.com/hivemq/latest/user-guide/install-hivemq.html).
3. Khởi động với cổng JMX `9010`:
   ```powershell
   $env:Path = "$env:JAVA_HOME\bin;$env:Path"
   java -version                    # phải hiện 21.x
   $env:HIVEMQ_JMX_PORT = '9010'
   .\bin\run.bat
   ```
   Nếu báo cổng `9010` bị chiếm, đặt `9011` rồi chạy lại. Chờ `Started HiveMQ in ...ms`, giữ cửa sổ mở. Chỉ chạy **một** phiên HiveMQ; dừng bằng `Ctrl+C` và chờ kết thúc trước khi chạy lại.
4. Mở [Control Center](http://localhost:8080/v2/) trên máy chạy HiveMQ, kiểm tra license ở mục **Licenses**.
5. Backend cùng máy dùng `MQTT_URL=mqtt://localhost:1883`. Nếu HiveMQ yêu cầu xác thực, điền `MQTT_USER`, `MQTT_PASS` vào `server/.env`.
