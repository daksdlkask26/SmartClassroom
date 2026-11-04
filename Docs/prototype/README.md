# Bản thử Smart Classroom

Mở `index.html` bằng Chrome hoặc Edge, không cần cài thư viện hay chạy máy chủ. Font Manrope và Be Vietnam Pro đã đóng gói để dùng offline. Giao diện mở sẵn tài khoản mẫu; nút **DU / Tài khoản** cho phép đăng xuất và thử đăng ký/đăng nhập.

Desktop dùng điều hướng ngang đánh số. Giao diện trắng–đen phẳng; màu được giữ cho LED và trạng thái có ý nghĩa. [Đặc tả và cơ sở chart](../huong_dan_wireframe_v3.md).

## Có thể thử

- Giám sát: gauge độ ẩm 0–100%, số nhiệt độ/CO₂ và xu hướng; chạm hoặc focus điểm biểu đồ để đọc giá trị.
- LED: chọn màu có tên → kéo độ sáng 1–100% → xem trước → Áp dụng. Kéo slider không tự gửi. Có thể chỉ đổi độ sáng mà giữ màu.
- Màu tùy chỉnh: mở vùng nâng cao, kéo thanh sắc màu và chọn trong ô sắc độ; HEX là tùy chọn. Trong ô chọn, dùng phím trái/phải hoặc lên/xuống; Shift tăng bước. Hủy khôi phục màu và độ sáng đã gửi.
- Bật/tắt gửi ngay. Khi tắt, offline hoặc đang gửi, các điều khiển màu/slider bị khóa. Lỗi gửi giữ bản nháp; gửi thành công chưa xác nhận phần cứng đã thực hiện.
- Lịch sử: chọn chỉ số, 24 giờ / 7 ngày tự tải; ngày tùy chọn cần áp dụng. Chọn ô heatmap để đọc số; dấu `—` là thiếu dữ liệu.
- Chart: nhãn đơn vị, giờ và ngày riêng; vạch 00:00 sang ngày mới; cột ngày gốc 0 và ngày chưa kết thúc có ký hiệu riêng. Dùng trái/phải, Home/End để chuyển điểm; mở bảng số để đối chiếu.
- Trang mở rộng: chi tiết nhiệt độ/CO₂, bản ghi, bộ lọc thời gian, phân tích ngày, chi tiết ngày, thiết bị, Telegram và tài khoản.
- Telegram: thử `/start`, `/doam`, `/trangthai` và ví dụ cảnh báo độ ẩm 88%. Hội thoại chỉ mô phỏng; không gửi tin thật. Quy tắc đồ án là dưới 30% hoặc trên 85%.
- Đăng ký kiểm tra tài khoản, mật khẩu và xác nhận; thành công quay về đăng nhập. Đăng xuất/hết phiên chặn quay lại nội dung bảo vệ.
- **Thử tình huống** ở cuối trang: mất kết nối, gửi lỗi, lịch sử rỗng/lỗi, hết phiên.

Tài khoản giả: `demo_user` / `smartclassroom16`. Tài khoản mới chỉ tồn tại trong bộ nhớ tab, mất khi tải lại trang.

## Phạm vi

Đây là prototype mô phỏng, chưa nối backend/MQTT/ESP32. Slider độ sáng là đề xuất mở rộng ID 3 cần xử lý lệnh trong hệ thống thật. Dữ liệu cố định 28/10–03/11/2026; khoảng ngoài dữ liệu mẫu trả về rỗng. WiFi chỉ mô phỏng nhận cấu hình.

Figma **VLcCNTT / Page 1** có 35 màn: 14 web, 19 mobile, 2 WiFi; kèm hai bố cục LED bổ sung. M07 dùng màn riêng cho màu tùy chỉnh; HTML đặt cùng chức năng trong vùng mở rộng. M17 minh họa kênh Telegram bên ngoài. Xem [thư viện ảnh](../wireframes-v3/index.html), [đặc tả](../huong_dan_wireframe_v3.md) và [chỉ mục Figma](../wireframe_v3_manifest.md).

Mở trực tiếp trang bằng `index.html?route=temperature` (hoặc `co2`, `records`, `daily`, `daydetail`, `filters`, `device`, `telegram`, `telegram-demo`, `profile`). `?route=expired` minh họa hết phiên; `?offline=1` minh họa mất kết nối.

## Kiểm tra

Từ thư mục gốc workspace:

```powershell
node SmartClassroom/tools/verify-ui-prototype.cjs
```

128 kiểm tra dùng Chrome headless, gồm font offline, LED, auth, lịch sử, mốc 00:00 đúng timestamp, đơn vị, cột gốc 0, dữ liệu thiếu, bàn phím, Telegram minh họa và các trang mới ở 320–1440 px. Ảnh QA và kết quả được tạo trong `tmp/ui-upgrade/qa/`; kết quả bàn giao ở `../wireframes-v3/prototype_verification.json`.
