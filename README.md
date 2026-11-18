# Smart Classroom - Nhóm 16

Đồ án Phòng học thông minh dùng ESP32, DHT22, MQ135, MQTT và Cloud Firestore. Backend hiện nhận, kiểm tra và lưu dữ liệu cảm biến; giao diện web/mobile là prototype mô phỏng.

## Cấu trúc

| Thư mục | Nội dung |
| --- | --- |
| `backend/` | Backend Node.js, cấu hình Firebase, dữ liệu mẫu và kiểm thử |
| `Docs/prototype/` | Giao diện thử nghiệm, mở trực tiếp bằng trình duyệt |
| `Docs/` | Hướng dẫn chi tiết, nguồn LaTeX, PDF, ảnh và thiết kế UI |
| `scripts/` | Script biên dịch báo cáo |
| `tools/` | Công cụ kiểm tra báo cáo, prototype và xuất ảnh wireframe |

`package.json` và `package-lock.json` nằm cùng trong `backend/` vì đây là phần dùng npm. Commit cả hai file; dùng `npm ci` để cài đúng phiên bản trong lockfile.

## Web giám sát (`server/`, `frontend/`, `contract/`)

Website (Node.js + Express, HTML/CSS/JS thuần) chạy được ở chế độ giả lập, không cần phần cứng hay Firebase:

```powershell
cd server
npm ci
npm run dev   # broker cục bộ + giả lập ESP32 + backend → http://localhost:3000
```

- Hợp đồng dữ liệu (topic MQTT, trường JSON, REST, WebSocket): [`contract/README.md`](contract/README.md)
- Cấu hình, kiểm thử, cách cắm module Firestore / Telegram: [`server/README.md`](server/README.md)
- Kiểm giao diện tự động bằng Chrome: `node tools/verify-web.cjs`

## Java 21 và HiveMQ trên Windows

**1. Cài Java 21:** tải [Temurin JDK 21 cho Windows x64](https://adoptium.net/temurin/releases/?version=21&os=windows&arch=x64&package=jdk), chọn **MSI**, bật **PATH** và **JAVA_HOME** khi cài. `JAVA_HOME` trỏ tới thư mục JDK 21, không gồm `\bin`. Sau đó mở PowerShell mới. [Hướng dẫn cài](https://adoptium.net/installation/windows/).

**2. Chuẩn bị HiveMQ:** tải bản [Install locally](https://docs.hivemq.com/hivemq/latest/user-guide/getting-started.html#_install_hivemq_locally_on_a_server_or_computer_of_your_choice), giải nén ở ổ đĩa bất kỳ. Mở **PowerShell với quyền Administrator tại thư mục chứa `bin/` và `conf/`**.

Điền license key vào thẻ `<license-key>` trong `conf/license.xml`, bỏ dấu chú thích quanh thẻ nếu có. HiveMQ tự nạp thay đổi; cần Internet để xác thực. [Hướng dẫn license](https://docs.hivemq.com/hivemq/latest/user-guide/install-hivemq.html).

**3. Khởi động với cổng JMX `9010`:**

```powershell
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
java -version # Phải hiển thị 21.x.
$env:HIVEMQ_JMX_PORT = '9010'
.\bin\run.bat
```

**Chỉ khi báo cổng `9010` bị chiếm**, đổi sang `9011` rồi chạy lại:

```powershell
$env:HIVEMQ_JMX_PORT = '9011'
.\bin\run.bat
```

Chờ `Started HiveMQ in ...ms` và giữ cửa sổ mở. Chỉ chạy một phiên HiveMQ; dừng bằng `Ctrl+C` và chờ kết thúc trước khi chạy lại. Nếu lỗi persistence, kiểm tra phiên cũ, giữ nguyên thư mục `data`.

**4. Mở [Control Center](http://localhost:8080/v2/)** trên máy chạy HiveMQ, kể cả khi `run.bat` không hiện link. Đăng nhập bằng tài khoản quản trị của bạn. Kiểm tra license trong **Licenses**. [Tài liệu Control Center](https://docs.hivemq.com/hivemq-control-center/latest/index.html).

Backend chạy cùng máy dùng `MQTT_URL=mqtt://localhost:1883`. Mở terminal khác để chạy backend theo phần dưới.

## Chạy backend

Yêu cầu **Node.js >=22.9 và npm**, Firebase project đã tạo Firestore database `(default)`, cùng broker MQTT đang chạy. Các bước dưới dùng HiveMQ local đã khởi động ở phần trên. Mở PowerShell khác tại **thư mục gốc dự án**, rồi chuyển vào `backend/` theo bước 1. Nếu bị chặn `npm.ps1`, dùng `npm.cmd` thay `npm`.

**1. Cài thư viện và tạo cấu hình cá nhân:**

```powershell
cd backend
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

`.env.example` là mẫu; khi mẫu thay đổi, tự cập nhật `.env` cá nhân.

**2. Cấu hình:** tải khóa Firebase Admin vào `backend/config/serviceAccountKey.json`, rồi điền `backend/.env` theo mẫu:

```dotenv
FIREBASE_PROJECT_ID=project-id-cua-nhom
GOOGLE_APPLICATION_CREDENTIALS=./config/serviceAccountKey.json
DEVICE_ID=esp32-01
MQTT_URL=mqtt://localhost:1883
MQTT_USERNAME=
MQTT_PASSWORD=
```

Để trống hai biến xác thực MQTT khi dùng HiveMQ local với `hivemq-allow-all-extension` đang bật. Nếu broker yêu cầu xác thực, chỉ điền thông tin được cấp vào `.env` cục bộ. Với HiveMQ Cloud, dùng `MQTT_URL=mqtts://hostname-cluster:8883`. Xem [cấu trúc dữ liệu và kiểm thử ID 4](backend/README.md).

**3. Kiểm tra Firestore và khởi động backend:**

```powershell
npm run check:firestore
npm start
```

`check:firestore` ghi một bản ghi thử vào database đã cấu hình. Giữ terminal chạy backend mở, đợi log `[subscribed] dht22, mq135`.

**4. Thử dữ liệu trong terminal thứ hai, mở tại root:**

```powershell
cd backend
npm run publish:test
# Đợi backend in đủ log xử lý, rồi xem dữ liệu đã lưu:
npm run readings
```

Bộ phát gửi 6 bản tin; theo `bootId` vừa in, kỳ vọng 3 bản ghi mới, 1 bản trùng và 2 bản bị từ chối. `readings` hiển thị 20 bản ghi gần nhất theo giờ Việt Nam. Dừng backend bằng `Ctrl+C`.

## Các lệnh hỗ trợ

Chạy trong `backend/`:

| Lệnh | Tác dụng |
| --- | --- |
| `npm test` | Kiểm thử cục bộ, không cần Firebase/MQTT |
| `npm run test:integration` | Tự chạy Firestore Emulator và broker MQTT cục bộ để kiểm thử tích hợp |
| `npm run emulators` | Mở Firestore Emulator để thử thủ công; UI tại `http://127.0.0.1:4000` |
| `node ../tools/verify-ui-prototype.cjs` | Kiểm tra prototype bằng Chrome headless trên Windows |

## Kiểm thử với Emulator

Cần Java 21+. Mỗi terminal mới dưới đây mở từ root. Lần đầu cần mạng để tải Emulator.

**Tự động** — dừng Emulator thủ công bằng `Ctrl+C` và chờ tắt trước khi chạy:

```powershell
cd backend
npm run test:integration
# Thành công: pass 2, fail 0; Emulator tự dừng.
```

**Thủ công — terminal 1:**

```powershell
cd backend
npm run emulators
# UI: http://127.0.0.1:4000
# Firestore: 127.0.0.1:8085
# Dừng: Ctrl+C, chờ Emulator tắt hoàn toàn.
```

**Terminal 2 — env cục bộ, thử ghi/đọc rồi chạy backend:**

```powershell
cd backend
$env:FIREBASE_PROJECT_ID = 'demo-smartclassroom'
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8085'
$env:DEVICE_ID = 'esp32-01'
npm run check:firestore
npm run readings
# Thử MQTT: broker trong .env phải đang chạy.
npm start
```

**Terminal 3 — gửi dữ liệu thử qua MQTT:**

```powershell
cd backend
$env:DEVICE_ID = 'esp32-01'
npm run publish:test
# Xem UI: Firestore > devices > esp32-01 > readings.
```

**Quay về Firebase cloud — chạy trong terminal 2 và 3:**

```powershell
# Dừng backend ở terminal 2 bằng Ctrl+C trước.
Remove-Item Env:FIRESTORE_EMULATOR_HOST, Env:FIREBASE_PROJECT_ID, Env:DEVICE_ID -ErrorAction SilentlyContinue
```

## Xem giao diện

Mở [Docs/prototype/index.html](Docs/prototype/index.html) bằng Chrome/Edge, không cần cài npm hay chạy server. Prototype dùng dữ liệu giả, chưa kết nối backend/ESP32. Xem [các luồng có thể thử](Docs/prototype/README.md) và [thư viện wireframe](Docs/wireframes-v3/index.html).

## Biên dịch báo cáo

Cài **XeLaTeX** (MiKTeX hoặc TeX Live) và **Times New Roman**. Từ `backend/`, quay về root rồi chạy:

```powershell
cd ..
.\scripts\build-proposal.ps1
node tools/verify-proposal.cjs
```

Kết quả: [PDF proposal](Docs/16_24127261_24127542_24127581_PROPOSAL.pdf). Nguồn báo cáo: [Docs/thuyet_minh.tex](Docs/thuyet_minh.tex).

Tài liệu UI: [Đặc tả](Docs/huong_dan_wireframe_v3.md) · [Chỉ mục ảnh/Figma](Docs/wireframe_v3_manifest.md) · [Công cụ wireframe](tools/wireframes/README.md).
