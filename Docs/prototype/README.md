# Bản thử Smart Classroom

Mở `index.html` bằng Chrome hoặc Edge, không cần cài thư viện hay chạy máy chủ. Font Manrope và Be Vietnam Pro đã đóng gói để dùng offline. Giao diện mở sẵn tài khoản mẫu; nút **DU / Tài khoản** cho phép đăng xuất và thử đăng ký/đăng nhập.

Desktop dùng điều hướng ngang đánh số, không có sidebar. Giao diện trắng–đen phẳng; màu được giữ cho LED và trạng thái có ý nghĩa. [Lý do chọn bố cục](../huong_dan_wireframe_v3.md#11-cơ-sở-lựa-chọn-bố-cục).

## Có thể thử

- Giám sát: gauge độ ẩm 0–100%, số nhiệt độ/CO₂ và xu hướng; chạm hoặc focus điểm biểu đồ để đọc giá trị.
- LED: chọn màu có tên → kéo độ sáng 1–100% → xem trước → Áp dụng. Kéo slider không tự gửi. Có thể chỉ đổi độ sáng mà giữ màu.
- Màu tùy chỉnh: mở vùng nâng cao, kéo thanh sắc màu và chọn trong ô sắc độ; HEX là tùy chọn. Trong ô chọn, dùng phím trái/phải hoặc lên/xuống; Shift tăng bước. Hủy khôi phục màu và độ sáng đã gửi.
- Bật/tắt gửi ngay. Khi tắt, offline hoặc đang gửi, các điều khiển màu/slider bị khóa. Lỗi gửi giữ bản nháp; gửi thành công chưa xác nhận phần cứng đã thực hiện.
- Lịch sử: chọn chỉ số, 24 giờ / 7 ngày tự tải; ngày tùy chọn cần áp dụng. Chọn ô heatmap để đọc số; dấu `—` là thiếu dữ liệu.
- Đăng ký kiểm tra tài khoản, mật khẩu và xác nhận; thành công quay về đăng nhập. Đăng xuất/hết phiên chặn quay lại nội dung bảo vệ.
- **Thử tình huống** ở cuối trang: mất kết nối, gửi lỗi, lịch sử rỗng/lỗi, hết phiên.

Tài khoản giả: `demo_user` / `smartclassroom16`. Tài khoản mới chỉ tồn tại trong bộ nhớ tab, mất khi tải lại trang.

## Phạm vi

Đây là prototype mô phỏng, chưa nối backend/MQTT/ESP32. Slider độ sáng là đề xuất mở rộng ID 3 cần xử lý lệnh trong hệ thống thật. Dữ liệu cố định 28/10–03/11/2026; khoảng ngoài dữ liệu mẫu trả về rỗng. WiFi chỉ mô phỏng nhận cấu hình.

Figma **VLcCNTT / Page 1** giữ 17 màn chính và hai bố cục LED bổ sung. M07 dùng màn riêng cho màu tùy chỉnh; HTML đặt cùng chức năng trong vùng mở rộng. Xem [đặc tả](../huong_dan_wireframe_v3.md) và [chỉ mục ảnh](../wireframe_v3_manifest.md).

## Kiểm tra

Từ thư mục gốc workspace:

```powershell
node SmartClassroom/tools/verify-ui-prototype.cjs
```

62 kiểm tra dùng Chrome headless, gồm font offline, gauge, chỉnh độ sáng độc lập, pending/lỗi/hủy, màu tùy chỉnh, auth, lịch sử và các chiều rộng 320–1440 px. Ảnh QA và kết quả được tạo trong `tmp/ui-upgrade/qa/`; kết quả bàn giao ở `../wireframes-v3/prototype_verification.json`.
