# Firestore — chức năng 4

Đối chiếu [proposal](../Docs/thuyet_minh.tex): backend nhận số liệu DHT22 và MQ135, lưu giá trị kèm thời gian vào Firestore. API lịch sử và biểu đồ thuộc chức năng 5.

## Thư mục

```text
backend/
├── config/       # Cấu hình môi trường, kết nối Firebase, rules và indexes
├── src/          # Nhận MQTT, kiểm tra và lưu số đo
├── scripts/      # Chạy Emulator, kiểm tra kết nối, gửi và đọc dữ liệu thử
├── test/         # Unit test, integration test và helpers
├── examples/     # Payload JSON mẫu
├── .env.example # Mẫu cấu hình dùng chung
└── package.json
```

`config/` chứa `env.cjs`, `firebase.cjs`, `firebase.json`, `firestore.rules`, `firestore.indexes.json` và khóa riêng `serviceAccountKey.json` (Git bỏ qua). `.env` cá nhân đặt tại `backend/.env`.

| Phần việc | Triển khai | Kiểm chứng |
| --- | --- | --- |
| Cấu trúc dữ liệu và kết nối (2 giờ) | `config/env.cjs`, `config/firebase.cjs`, `config/firestore.indexes.json` | Cấu hình, đường dẫn khóa tương đối, kết nối và đọc lại |
| Ghi mỗi bản tin (3 giờ) | `src/normalize-reading.cjs`, `src/save-reading.cjs`, `src/mqtt-ingest.cjs` | Hai topic, giá trị, timestamp, bản trùng, bản lỗi và reconnect |
| Kiểm thử (2 giờ) | `test/*.test.cjs`, `test/integration/*.test.cjs`, `scripts/smoke-firestore.cjs` | Unit, MQTT tới Firestore Emulator và phép thử trên cloud |

## Cấu trúc Firestore

Database `(default)`, đường dẫn document:

```text
devices/{deviceId}/readings/{readingId}
```

`readingId` là SHA-256 của `[deviceId, sensor, bootId, seq]`. Dùng `create()` để cùng một số đo chỉ tạo một document; lần đo mới vẫn được lưu dù giá trị không đổi. Document cha `devices/{deviceId}` chưa có metadata riêng.

| Trường | Kiểu và ý nghĩa |
| --- | --- |
| `deviceId`, `bootId` | Chuỗi định danh thiết bị và lần khởi động |
| `sensor` | `dht22` hoặc `mq135` |
| `seq` | Số nguyên không âm; tăng cho mỗi lần đo của một cảm biến trong cùng `bootId` |
| `status` | `ok`, `error`; MQ135 có thêm `warming_up` |
| `temperatureC`, `humidityPct`, `co2EstimatedPpm` | Số hoặc `null`; trường không thuộc cảm biến đó luôn là `null` |
| `receivedAt` | Firestore Timestamp tại thời điểm backend nhận bản tin |
| `storedAt` | [Firestore server timestamp](https://firebase.google.com/docs/firestore/manage-data/add-data#server_timestamp) khi ghi thành công |
| `retained` | Boolean, bản tin có được broker gửi lại từ retained message hay không |

Firebase Admin SDK dùng `GOOGLE_APPLICATION_CREDENTIALS=./config/serviceAccountKey.json`, đường dẫn tương đối tính từ `backend/`. `config/firestore.rules` chặn truy cập trực tiếp từ client; quyền của Admin SDK được kiểm soát bằng IAM.

## Bản tin ESP32 cần gửi

Backend đăng ký topic `dht22` và `mq135` với QoS 1. Xem mẫu [DHT22](examples/dht22.json), [MQ135](examples/mq135.json), [MQ135 đang làm nóng](examples/mq135-warming-up.json).

Mỗi payload cần `deviceId` khớp `DEVICE_ID`, `bootId`, `seq`, `status` và trường số đo của cảm biến. `bootId` đổi sau mỗi lần ESP32 khởi động; gửi lại cùng số đo thì giữ nguyên `bootId` và `seq`. Khi `error` hoặc `warming_up`, các số đo của cảm biến phải là `null`. JSON sai, độ ẩm ngoài 0–100%, CO₂ âm hoặc bản tin quá 4096 byte bị từ chối.

## Chạy kiểm thử

Từ `backend/`:

```powershell
npm test
npm run test:integration
```

Các lệnh npm tự chọn `config/firebase.json`. Nếu gọi Firebase CLI trực tiếp, thêm `--config config/firebase.json` khi đứng tại `backend/`.

Kiểm thử tích hợp dùng Firestore Emulator ở `127.0.0.1:8085` và broker MQTT tạm trên cổng trống. Cần Java 21; không dùng khóa Firebase hay ghi lên cloud. Bao gồm ghi/đọc, chống trùng đồng thời, timestamp, mở lại kết nối, ranh giới ngày UTC+7, bản tin sai, reconnect và retained message.

Để xác nhận Firestore thật, cấu hình `.env` và `config/serviceAccountKey.json` theo [README gốc](../README.md#chạy-backend), rồi chạy:

```powershell
npm run check:firestore
```

Lệnh ghi một document thử vào database đã cấu hình, đọc lại và kiểm tra chống trùng. Với backend đang chạy, `npm run publish:test` gửi 6 bản tin; kỳ vọng `3 saved`, `1 duplicate`, `2 invalid-reading`. Dùng `npm run readings` hoặc Firebase Console để kiểm tra lịch sử.

## Giới hạn cần biết khi tích hợp

Backend hiện phục vụ một `DEVICE_ID`. Cần thống nhất payload trên với firmware và kiểm thử bằng ESP32 thật. Chưa có firmware trong repository để xác nhận bước này.

Lỗi ghi tạm thời được thử tối đa 3 lần; nếu vẫn thất bại, backend báo `[save-failed]`. Chưa có hàng đợi lưu xuống ổ đĩa để gửi bù sau mất mạng kéo dài. API truy vấn lịch sử, Chart.js, WebSocket và Telegram nằm ngoài phần việc ID 4.
