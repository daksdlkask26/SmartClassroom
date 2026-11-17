# Hợp đồng dữ liệu — Smart Classroom · Nhóm 16

**Phiên bản 0.1.1 · bản đề xuất · 17/11/2026** — chờ Thành và Tuấn xác nhận.

Tài liệu này quy định dữ liệu đi giữa **ESP32 ↔ MQTT ↔ Backend ↔ Trình duyệt**. Đây là chỗ duy nhất cả ba người cùng phụ thuộc, nên:

- Firmware (ID 1, 2, 3, 10), backend, plugin Firestore (ID 4, 5), plugin Telegram (ID 6, 7) và giao diện (ID 9) đều theo đúng tên topic, tên trường và hằng số ở đây.
- Muốn đổi thì mở PR sửa thư mục `contract/`, cần **cả ba người** đồng ý (mục 9).
- Hằng số (ngưỡng, thang đo, chu kỳ, bảng màu) chỉ nằm trong [`system.json`](system.json). Backend đọc file này, giao diện nhận qua `GET /api/config`. Firmware chép tay các số và phải sửa theo mỗi khi file này đổi.

| Tệp | Nội dung |
|---|---|
| [`system.json`](system.json) | Hằng số dùng chung |
| [`examples/`](examples/) | Mẫu từng loại bản tin, dùng để đối chiếu và làm dữ liệu kiểm thử |

Căn cứ: thuyết minh (mục 1.1–1.3, 2.3, 3.2) và bản bàn giao giao diện `design-claude/HANDOFF.md` (§3.4, §3.5, §3.12, §6).

---

## 1. Quy ước chung

| Quy ước | Giá trị |
|---|---|
| Mã thiết bị | `sc-01` (giao diện hiển thị `SC-01`) |
| Tiền tố topic | `smartclassroom/{deviceId}/` |
| Định dạng | JSON UTF-8, một đối tượng mỗi bản tin |
| Phiên bản bản tin | Trường `"v": 1` ở mọi bản tin MQTT. Thay đổi làm hỏng tương thích thì tăng `v`. |
| Số | Số JSON, dấu chấm thập phân (`27.5`). Định dạng tiếng Việt (`27,5`) chỉ ở giao diện. |
| Giá trị không đọc được | `null`. **Không bao giờ gửi 0 thay cho lỗi.** |
| Màu | `#RRGGBB`, chữ hoa |
| Thời gian | Backend gắn `receivedAt` (ISO 8601, UTC) làm mốc chuẩn. Giao diện hiển thị theo giờ Việt Nam (UTC+7). |

---

## 2. Topic MQTT

| Topic | Chiều | QoS · retained | Khi nào |
|---|---|---|---|
| `smartclassroom/sc-01/telemetry` | ESP32 → Backend | QoS 0 · không | Mỗi `timing.intervalS` (30 giây) |
| `smartclassroom/sc-01/status` | ESP32 → Backend | QoS 0 · **retained** | Ngay sau khi kết nối MQTT, và khi WiFi hoặc chế độ LED đổi |
| `smartclassroom/sc-01/status` (LWT) | Broker → Backend | QoS 1 · **retained** | Broker tự gửi khi ESP32 rớt mạng đột ngột |
| `smartclassroom/sc-01/led/cmd` | Backend → ESP32 | QoS 1 · **không** | Khi người dùng bấm Áp dụng bảng màu, hoặc dùng chế độ Kiểm tra đèn |

Ghi chú:

- `PubSubClient` trên ESP32 chỉ **publish** được QoS 0, nhưng **subscribe** được QoS 1 và đặt được LWT QoS 1. Vì vậy `status` do ESP32 gửi là QoS 0 retained, còn LWT là QoS 1 retained.
- `led/cmd` **không** retained. Nếu retained, thiết bị khởi động lại có thể nhận lại lệnh kiểm tra cũ và kẹt ở chế độ kiểm tra. ESP32 tự lưu bảng màu vào flash (thuyết minh, ID 3).

### 2.1 `telemetry`: ESP32 → Backend

Mẫu: [`telemetry.normal.json`](examples/telemetry.normal.json), [`telemetry.humid-high.json`](examples/telemetry.humid-high.json), [`telemetry.dht-error.json`](examples/telemetry.dht-error.json), [`telemetry.mq-warming.json`](examples/telemetry.mq-warming.json)

```json
{
  "v": 1, "seq": 1234, "uptimeS": 86400,
  "temperature": 27.5, "humidity": 64.5, "co2": 850,
  "sensors": { "dht22": "ok", "mq135": "ok" },
  "levels": { "temperature": "normal", "humidity": "normal", "co2": "normal" }
}
```

| Trường | Kiểu | Bắt buộc | Ý nghĩa | Ai gửi |
|---|---|---|---|---|
| `v` | số nguyên | có | Luôn là `1` | |
| `seq` | số nguyên ≥ 0 | có | Đếm tăng mỗi bản tin, về 0 khi khởi động lại | Thành (ID 1) |
| `uptimeS` | số nguyên ≥ 0 | có | Số giây từ lúc khởi động | Thành (ID 1) |
| `temperature` | số \| `null` | có | °C, một chữ số thập phân | Thành (ID 1, DHT22) |
| `humidity` | số \| `null` | có | %, một chữ số thập phân | Thành (ID 1, DHT22) |
| `co2` | số nguyên \| `null` | có | ppm **ước lượng** từ MQ-135 | Tuấn (ID 2) |
| `sensors.dht22` | `"ok"` \| `"error"` | có | Đọc DHT22 thất bại thì `"error"`, và `temperature`, `humidity` là `null` | Thành (ID 1) |
| `sensors.mq135` | `"warming"` \| `"ok"` \| `"error"` | có | Đang làm nóng hoặc chưa hiệu chuẩn thì `"warming"`, và `co2` là `null` | Tuấn (ID 2) |
| `levels.<thông số>` | `"normal"` \| `"watch"` \| `"alert"` \| `null` | **không** | Mức do firmware tính **có khoảng trễ**, đúng mức đèn đang hiển thị. `null` khi giá trị là `null`. | Uy (ID 3) |
| `ts` | số nguyên (Unix giây) | **không** | Chỉ gửi khi firmware có đồng bộ NTP | |

Backend xử lý như sau:

- JSON hỏng, thiếu `v` hoặc `v` khác `1`: **bỏ cả bản tin**, ghi log.
- Một trường sai kiểu hoặc ngoài khoảng `metrics.<…>.valid`: **chỉ trường đó** thành `null`, ghi log cảnh báo. Các trường khác vẫn dùng.
- Trường lạ: bỏ qua, không báo lỗi. Firmware có thể thêm trường để gỡ lỗi.
- Có `levels` thì giao diện hiện đúng mức đó (`levelsSource: "device"`). Thiếu thì backend tự tính theo mục 4 (`levelsSource: "server"`, không có khoảng trễ).

### 2.2 `status`: ESP32 → Backend (retained) và LWT

Mẫu: [`status.online.json`](examples/status.online.json), [`status.lwt-offline.json`](examples/status.lwt-offline.json)

```json
{ "v": 1, "online": true, "fw": "0.1.0", "intervalS": 30, "ssid": "Phong_A12", "rssi": -61, "ledMode": "auto" }
```
LWT, khai báo lúc `connect()`:
```json
{ "v": 1, "online": false }
```

| Trường | Kiểu | Bắt buộc | Ý nghĩa |
|---|---|---|---|
| `online` | boolean | có | `true` khi ESP32 tự gửi. `false` chỉ có trong LWT. |
| `fw` | chuỗi | không | Phiên bản firmware |
| `intervalS` | số nguyên | không | Chu kỳ gửi telemetry thực tế |
| `ssid` | chuỗi | không | Tên WiFi đang dùng (trang Thiết bị hiển thị) |
| `rssi` | số nguyên (dBm) | không | Cường độ sóng |
| `ledMode` | `"auto"` \| `"test"` | không | Chế độ đèn hiện tại |

Thiết bị bị coi là **ngoại tuyến** khi nhận LWT, hoặc khi quá `timing.offlineAfterS` (300 giây) không có telemetry. Có telemetry mới thì coi là trực tuyến trở lại.

### 2.3 `led/cmd`: Backend → ESP32

Mẫu: [`led-cmd.palette.json`](examples/led-cmd.palette.json), [`led-cmd.test.json`](examples/led-cmd.test.json), [`led-cmd.auto.json`](examples/led-cmd.auto.json)

| Lệnh | JSON | ESP32 làm gì |
|---|---|---|
| Áp dụng bảng màu | `{ "v":1, "mode":"auto", "palette": { "temperature":[n,w,a], "humidity":[n,w,a], "co2":[n,w,a] } }` | Lưu 9 màu vào flash, chuyển về chế độ tự động |
| Kiểm tra đèn | `{ "v":1, "mode":"test", "on":true, "color":"#00C9B7" }` | Cả thanh một màu (`on:false` thì tắt). Các cặp tạm không báo thông số. |
| Về tự động | `{ "v":1, "mode":"auto" }` | Quay lại tự động với bảng màu **đã lưu** |

- Thứ tự trong mảng là `levelOrder`: `[bình thường, cần chú ý, cảnh báo]`.
- Bóng 1–2 (hệ thống) có màu cố định, **không** nằm trong lệnh.
- Không có độ sáng. Không điều khiển từng bóng (thuyết minh, ID 3).
- **Không có xác nhận ngược.** Giao diện chỉ được ghi "Đã gửi …", không bao giờ ghi "đèn đã đổi" (HANDOFF §3.5).

---

## 3. Hằng số: `system.json`

| Khóa | Giá trị | Trạng thái |
|---|---|---|
| `timing.intervalS` | 30 giây | Đã chốt (HANDOFF) |
| `timing.staleAfterS` | 90 giây: giao diện báo "DỮ LIỆU CŨ" | Đã chốt (thuyết minh, HANDOFF) |
| `timing.offlineAfterS` | 300 giây: coi là thiết bị ngoại tuyến | **Đề xuất** |
| `metrics.*.scale` | Thang gauge: độ ẩm 0–100, nhiệt độ 10–40, CO₂ 400–2000 | CO₂ cần xem lại sau hiệu chuẩn |
| `metrics.*.valid` | Khoảng hợp lệ, ngoài khoảng thì coi là lỗi đọc | Đề xuất |
| `levels` | Ngưỡng 3 mức (mục 4) | Chỉ độ ẩm đã chốt |
| `hysteresis` | ±0,5 °C · ±2 % · ±50 ppm, chỉ firmware dùng | Đề xuất (HANDOFF §3.5) |
| `telegram` | Cảnh báo khi độ ẩm < 30 hoặc > 85, nghỉ 30 phút | Đã chốt (thuyết minh) |
| `led.defaultPalette` | Xanh lá `#22E05A` · Vàng `#FFD400` · Đỏ `#FF2A2A` | Đã chốt (HANDOFF) |
| `led.namedColors` | 10 màu có tên | Đã chốt (tokens.css) |

---

## 4. Ngưỡng ba mức

Mỗi thông số là một dãy `bands` phủ kín trục số, không chồng lấn, không bỏ sót (thuyết minh mục 1.1). `min`/`max` mặc định là **bao gồm**. `minInclusive:false` hoặc `maxInclusive:false` là không bao gồm. Thiếu `min` nghĩa là âm vô cùng, thiếu `max` là dương vô cùng.

| Thông số | Cảnh báo | Cần chú ý | Bình thường | Cần chú ý | Cảnh báo |
|---|---|---|---|---|---|
| Nhiệt độ (°C) · *số tạm* | < 16 | 16 – < 20 | 20 – 30 | > 30 – 34 | > 34 |
| Độ ẩm (%) · **đã chốt 30/85** | < 30 | 30 – < 40 | 40 – 70 | > 70 – 85 | > 85 |
| CO₂ ước lượng (ppm) · *số tạm* | | | < 1000 | 1000 – < 1500 | ≥ 1500 |

Giá trị ranh giới dùng để kiểm thử (backend, firmware và giao diện phải ra cùng kết quả khi không tính khoảng trễ):

| Thông số | Giá trị → mức |
|---|---|
| Nhiệt độ | 15,9 → cảnh báo · 16 → chú ý · 19,9 → chú ý · 20 → bình thường · 30 → bình thường · 30,1 → chú ý · 34 → chú ý · 34,1 → cảnh báo |
| Độ ẩm | 29,9 → cảnh báo · 30 → chú ý · 39,9 → chú ý · 40 → bình thường · 70 → bình thường · 70,1 → chú ý · 85 → chú ý · 85,1 → cảnh báo |
| CO₂ | 999 → bình thường · 1000 → chú ý · 1499 → chú ý · 1500 → cảnh báo |

Ngưỡng độ ẩm của mức cảnh báo trùng quy tắc Telegram (< 30 % hoặc > 85 %). Web, đèn trên hộp và Telegram vì vậy luôn nói cùng một điều.

**Khoảng trễ (chỉ firmware):** khi đang ở một mức, chỉ chuyển sang mức khác khi giá trị vượt ranh giới thêm ít nhất `hysteresis`. Ví dụ đang "bình thường", nhiệt độ phải lên **> 30,5** mới thành "cần chú ý", và phải xuống **≤ 29,5** mới về "bình thường". Backend và web không dùng khoảng trễ, nên firmware cần gửi `levels` để hai bên khớp nhau.

---

## 5. WebSocket `/ws`: Backend → Trình duyệt

Phong bì chung: `{ "type": "...", "at": "<ISO>", "data": { ... } }`. Trình duyệt **không** gửi lệnh qua WebSocket. Lệnh đi qua REST (mục 6).

| `type` | Khi nào | `data` | Mẫu |
|---|---|---|---|
| `hello` | Ngay khi kết nối | `serverTime`, `mode` (`"sim"`/`"live"`), `config` (= `system.json`), `latest` (Reading hoặc `null`), `device`, `led` | [`ws.hello.json`](examples/ws.hello.json) (trường `config` viết tắt) |
| `reading` | Mỗi bản tin hợp lệ | Reading = telemetry đã kiểm tra, cộng `receivedAt`, `levelsSource`; bỏ `v`, `uptimeS` | [`ws.reading.json`](examples/ws.reading.json) |
| `device` | Trạng thái thiết bị đổi | `online`, `reason` (`"status"`: thiết bị tự báo · `"telemetry"`: suy ra từ bản tin vừa nhận · `"lwt"`: broker báo rớt mạng · `"timeout"`: quá `offlineAfterS` không có bản tin · `"unknown"`: chưa có thông tin), `lastSeenAt`, `fw`, `ssid`, `rssi`, `intervalS`, `ledMode` | trong `ws.hello.json` |
| `led` | Sau khi publish `led/cmd` thành công | `mode`, `palette`, `test` (`{on,color}` hoặc `null`), `sentAt` | trong `ws.hello.json` |

Giao diện tự suy ra trạng thái thanh trên cùng (HANDOFF §3.4): **ĐANG KẾT NỐI** (chưa có bản tin) · **TRỰC TUYẾN** (bản tin cuối ≤ 90 giây) · **DỮ LIỆU CŨ** (> 90 giây) · **THIẾT BỊ NGOẠI TUYẾN** (`device.online = false`) · **MẤT KẾT NỐI** (WebSocket đứt).

---

## 6. REST `/api`

| Phương thức · đường dẫn | Chủ | Thân / tham số | Trả về |
|---|---|---|---|
| `GET /api/health` | Uy | | `{ ok, mqtt: "connected"/"disconnected", mode, uptimeS }` |
| `GET /api/config` | Uy | | Nội dung `system.json` |
| `GET /api/state` | Uy | | Như `data` của `hello` |
| `GET /api/history` | **Tuấn (ID 5)**; khung chỉ có bản giả lập trong bộ nhớ | `metric` = `humidity`/`temperature`/`co2`, `from`, `to` (ISO), `bucket` = `hour`/`day` | [`api.history.json`](examples/api.history.json): mốc không có dữ liệu thì `avg/min/max = null`, `n = 0` |
| `POST /api/led/palette` | Uy (ID 3) | `{ "palette": { … } }` | `202 { sentAt }` |
| `POST /api/led/test` | Uy (ID 3) | `{ "mode":"test", "on":true, "color":"#…" }` hoặc `{ "mode":"auto" }` | `202 { sentAt }` |
| `GET /api/session` | Uy (ID 8, hiện là stub) | | `{ authEnabled: false, user: { username } }` |

Lỗi dùng chung một dạng ([`api.error.json`](examples/api.error.json)): `{ "error": { "code": "…", "message": "…" } }`

| Mã HTTP | `code` | Khi nào |
|---|---|---|
| 400 | `BAD_REQUEST` | Thiếu tham số, sai định dạng ngày |
| 409 | `DEVICE_OFFLINE` | Gửi lệnh LED khi thiết bị ngoại tuyến (giao diện khóa nút, HANDOFF ST-09) |
| 422 | `INVALID_PALETTE` / `INVALID_COLOR` | Thiếu màu, sai `#RRGGBB` |
| 503 | `MQTT_DOWN` | Backend chưa kết nối được broker |

`202 Accepted` nghĩa là **đã gửi lệnh**, không phải thiết bị đã làm theo.

---

## 7. Ghi chú cho firmware (ESP32 · PubSubClient · ArduinoJson)

- **Kích thước gói:** `PubSubClient` mặc định chỉ có 256 byte cho cả topic và nội dung. Đã đo: `telemetry` trường hợp dài nhất khoảng **255 byte** (sát giới hạn), `led/cmd` bảng màu khoảng 193 byte. **Bắt buộc** gọi `client.setBufferSize(512)` trước `connect()`, nếu không bản tin sẽ bị âm thầm bỏ.
- **LWT:** `client.connect(clientId, user, pass, "smartclassroom/sc-01/status", 1, true, "{\"v\":1,\"online\":false}")`. Ngay sau khi kết nối, publish `status` online với `retained = true`.
- **Client ID** phải khác nhau giữa các thiết bị và backend, ví dụ ESP32 `sc-01-esp32`, backend `sc-backend-<ngẫu nhiên>`. Trùng ID thì broker ngắt kết nối cũ, hai bên đá nhau liên tục.
- **Subscribe** `smartclassroom/sc-01/led/cmd` với QoS 1 **sau mỗi lần kết nối lại**.
- **HiveMQ Cloud** bắt buộc TLS cổng 8883 (`WiFiClientSecure`). Khi thử nhanh có thể dùng `setInsecure()`, nhưng ghi chú lại để thay bằng chứng chỉ CA.
- Thông tin WiFi và MQTT đặt trong `secrets.h` (đã có trong `.gitignore`), commit bản `secrets.example.h`.

## 8. Ghi chú cho backend và plugin

- Khi chạy với HiveMQ thật, **chỉ một máy** được bật plugin ghi Firestore. Nếu cả ba laptop cùng chạy backend, mỗi bản tin sẽ bị ghi ba lần. Máy khác đặt `PLUGINS_DISABLED=firestore`.
- Tương tự, chỉ một máy bật plugin Telegram, để tránh gửi cảnh báo trùng.
- Chế độ giả lập dùng broker cục bộ, không ảnh hưởng HiveMQ thật.

---

## 9. Quy trình thay đổi

1. Mở PR chỉ sửa `contract/` (và code liên quan nếu cần), ghi rõ lý do.
2. Cần cả ba người duyệt: Uy, Thành, Tuấn.
3. Cập nhật `contractVersion` trong `system.json` và bảng lịch sử bên dưới.
4. Thay đổi làm hỏng tương thích (đổi tên trường, đổi kiểu, bỏ trường bắt buộc) thì tăng `v` của bản tin, và backend phải đọc được cả bản cũ trong lúc chuyển đổi.
5. Đổi số trong `levels`, `hysteresis`, `timing` thì báo người viết firmware để sửa số tương ứng.

## 10. Câu hỏi cần chốt

| # | Câu hỏi | Đề xuất | Hỏi ai |
|---|---|---|---|
| C1 | Tên topic và các trường ở mục 2 | Như trên | Thành, Tuấn |
| C2 | Firmware gửi `seq`, `uptimeS`, `sensors` được không? | Được, chi phí nhỏ | Thành, Tuấn |
| C3 | `offlineAfterS` = 300 giây? | Có | Cả nhóm |
| C4 | Có đồng bộ NTP trên ESP32 không? | Không bắt buộc; backend gắn giờ | Thành |
| C5 | `metrics.*.valid` (khoảng hợp lệ) | Như `system.json` | Thành, Tuấn |

## 11. Lịch sử

| Phiên bản | Ngày | Thay đổi |
|---|---|---|
| 0.1.0 | 17/11/2026 | Bản đề xuất đầu tiên (Uy) |
| 0.1.1 | 17/11/2026 | Thêm giá trị `reason: "telemetry"` cho tin `device` (chỉ thêm, không ảnh hưởng firmware) |
