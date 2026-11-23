# Smart Classroom - Nhóm 16

Đồ án môn Vật lý cho CNTT: thiết bị IoT đặt trong phòng, đo độ ẩm, nhiệt độ, chất lượng không khí và báo về website, Telegram. Phần cứng gồm ESP32, DHT22, MQ-135 và thanh LED WS2812; dữ liệu đi qua MQTT (HiveMQ), được lưu trên Firestore.

**Hiện trạng:** website chạy trọn bộ ở chế độ giả lập (không cần phần cứng, broker hay Firebase). Firmware ESP32 đã có mô-đun ước lượng CO₂ và kiểm thử giả lập.

## Bắt đầu nhanh

Cần **Node.js 22.9 trở lên**.

```bash
cd server
npm ci
npm run dev        # broker cục bộ + ESP32 giả + backend → http://localhost:3000
```

Cấu hình tùy chọn (Telegram, Firebase, broker thật) nằm trong `server/.env`, tạo từ mẫu:

```bash
cp .env.example .env              # Linux (bash), trong thư mục server/
```
```powershell
Copy-Item .env.example .env       # Windows (PowerShell), trong thư mục server\
```

PowerShell chặn `npm.ps1` thì dùng `npm.cmd` thay `npm`. Hướng dẫn đầy đủ (biến cấu hình, kịch bản giả lập, Firestore, Emulator, HiveMQ cục bộ, sự cố thường gặp): [`server/README.md`](server/README.md).

## Bản đồ thư mục

| Thư mục | Nội dung | Đọc khi |
| --- | --- | --- |
| [`server/`](server/README.md) | **Backend duy nhất**: MQTT → WebSocket, REST, plugin Firestore và Telegram, giả lập ESP32, kiểm thử | Làm backend, plugin, chạy thử |
| [`frontend/`](frontend/) | Giao diện web (HTML/CSS/JS thuần, không bước build), `server/` phục vụ tĩnh | Làm giao diện |
| [`contract/`](contract/README.md) | **Hợp đồng dữ liệu**: topic MQTT, JSON, REST, WebSocket, ngưỡng, lược đồ Firestore | Viết firmware hoặc đổi định dạng dữ liệu |
| [`firmware/`](firmware/README.md) | Mã ESP32 (PlatformIO) và bộ kiểm thử MQ-135 | Làm firmware |
| [`design/`](design/) | Thiết kế Figma "Room Instrument": kế hoạch, quyết định, bàn giao, token CSS | Hỏi "vì sao giao diện thế này" |
| [`Docs/`](Docs/) | Thuyết minh (LaTeX và PDF), wireframe, prototype cũ, tài liệu của giảng viên | Viết báo cáo |
| [`tools/`](tools/) | Kiểm tra giao diện bằng Chrome, kiểm tra báo cáo, xuất wireframe, biên dịch báo cáo | Kiểm thử và build |

## Kiểm thử

```bash
cd server
npm test                    # nhanh, không cần mạng, Java hay tài khoản
npm run test:integration    # với Firestore Emulator thật, cần Java 21+
node ../tools/verify-web.cjs   # kiểm tra giao diện bằng Chrome (từ thư mục gốc: node tools/verify-web.cjs)
```

## Biên dịch báo cáo

Cần **XeLaTeX** và phông **Times New Roman** (không có thì dùng Liberation Serif hoặc TeX Gyre Termes).

```powershell
.\tools\build-proposal.ps1      # Windows (PowerShell), từ thư mục gốc
node tools/verify-proposal.cjs
```
```bash
cd Docs && latexmk -xelatex -jobname=16_24127261_24127542_24127581_PROPOSAL thuyet_minh.tex   # Linux
```

Kết quả: [PDF thuyết minh](Docs/16_24127261_24127542_24127581_PROPOSAL.pdf), nguồn [`Docs/thuyet_minh.tex`](Docs/thuyet_minh.tex). Tài liệu giao diện: [đặc tả](Docs/huong_dan_wireframe_v3.md), [chỉ mục wireframe](Docs/wireframe_v3_manifest.md), [prototype](Docs/prototype/README.md).

## Quy ước chung

- **Đổi định dạng dữ liệu** (tên topic, trường JSON, ngưỡng): mở PR sửa `contract/` và cần cả ba thành viên đồng ý.
- **Bí mật không bao giờ commit**: `.env`, khóa Firebase (`serviceAccountKey.json`), `secrets.h`, token Telegram. Chỉ commit file `*.example`.
- **Nhiều máy cùng nối HiveMQ thật**: chỉ **một** máy bật plugin Firestore và Telegram, máy khác đặt `PLUGINS_DISABLED=firestore,telegram`, nếu không mỗi bản tin bị ghi và báo nhiều lần.
- **Xuống dòng** thống nhất LF (`.gitattributes`), cả trên Windows.
- Chỉ commit PDF thuyết minh khi chốt bản nộp, tránh làm nặng lịch sử Git.
