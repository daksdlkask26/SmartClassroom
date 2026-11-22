# Firmware ESP32

Thư mục này dành cho mã chạy trên ESP32 DevKitC (PlatformIO, Arduino framework). **Chưa có mã nguồn**: chức năng ID 1, 2, 3, 10 theo [thuyết minh](../Docs/thuyet_minh.tex).

## Quy ước bắt buộc

Firmware phải theo [`contract/README.md`](../contract/README.md), nhất là mục 7:

- Topic, trường JSON và hằng số lấy từ [`contract/system.json`](../contract/system.json).
- `client.setBufferSize(512)` trước khi `connect()` (bản tin dài nhất khoảng 255 byte, bộ đệm mặc định chỉ 256).
- Khai báo LWT trên `status` (QoS 1, retained) và publish `status` online (retained) sau mỗi lần kết nối.
- Client ID riêng, ví dụ `sc-01-esp32`.
- HiveMQ Cloud bắt buộc TLS cổng 8883 (`WiFiClientSecure`).
- Gửi `bootId` (chuỗi ngẫu nhiên tạo mỗi lần khởi động, ví dụ từ `esp_random()`) trong mọi `telemetry`.

## Bí mật

Thông tin WiFi và MQTT đặt trong `secrets.h` (đã nằm trong `.gitignore`). Commit bản `secrets.example.h` làm mẫu.

## Gợi ý cấu trúc

```
firmware/
├── platformio.ini
├── include/secrets.example.h
└── src/main.cpp
```
