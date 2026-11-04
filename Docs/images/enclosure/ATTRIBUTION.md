# Nguồn ảnh thiết kế hộp

Các ảnh `exterior.png`, `interior.png`, `exploded.png`, `lid-fasteners.png` và bốn góc nhìn
`front.png`, `rear.png`, `left.png`, `right.png` được xuất
từ tài liệu Autodesk Fusion **SmartClassroom**, bản cơ khí cập nhật ngày 04/11/2026.
Ảnh thể hiện hộp, gá lắp, bố trí linh kiện và bộ vít/đai ốc; không có model dây hoặc mạch điện minh họa.

DHT22 nằm ngang ở đáy khoang trái; MQ135 đặt trên gá đáy trong khoang phải có cụm vách ngăn chữ U.
Hai cảm biến không treo lên thành. Các vách quanh cảm biến cùng màu trắng.

- ESP32: [Loyalmanuka — ESP32-DEVKITC-32D](https://sketchfab.com/3d-models/esp32-devkitc-32d-3d-model-step-269445-9e64cc503f5e4923a0a381b7d73fdaac), CC BY 4.0.
- DHT22: [YouniqueĪdeaStudio — DHT22 Temperature Sensor Module](https://sketchfab.com/3d-models/dht22-temperature-sensor-module-c46a658784034c679e4907bbddad0093), CC BY 4.0.
- MQ-135: [Stichting Consortium Beroepsonderwijs — Gas sensor MQ-135](https://sketchfab.com/3d-models/luchtkwaliteit-sensor-mq-135-gas-sensor-mq-135-394803dd013545a8b15ac4ba0f38e1be), CC BY 4.0.
- WS2812: STEP từ ZIP `ws2812-144-led-m-1.snapshot.1.zip` do nhóm cung cấp.

Các model Sketchfab được chuyển đơn vị, xoay và bố trí trong hộp; liên kết vật liệu
được khôi phục theo nguồn, ảnh texture không chỉnh sửa. Thanh LED lấy tám ô từ dải nguồn
và bổ sung đầu nối/lỗ theo ảnh tham khảo. Ren xoắn của vít/đai ốc không dựng.

Giấy phép: [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).
Metadata nguồn được giữ trong `model-sources.json`.

Bốn mặt đứng dùng phép chiếu vuông góc; thông tin xuất ảnh nằm trong `side-views.json`.
Thông số bố trí và kết quả kiểm tra hình học nằm trong `design-metadata.json`.
