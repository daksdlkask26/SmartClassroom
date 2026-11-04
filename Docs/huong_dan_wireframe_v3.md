# Wireframe V3 — Thiết kế hiện hành

Thiết kế lại toàn diện ngày 04/11/2026 trên **VLcCNTT → Page 1 (`0:1`)** bằng Reqwise Figma MCP. Cập nhật trực tiếp bộ V3, không tạo thêm bộ phiên bản song song. Xem [chỉ mục màn hình và node Figma](wireframe_v3_manifest.md), [bản thử tương tác](prototype/index.html).

## 1. Hệ thống hình thức và điều hướng desktop

Phong cách trắng–đen phẳng. Bỏ sidebar dọc; dùng hàng tên sản phẩm và tài khoản, bên dưới là bốn mục điều hướng ngang có số thứ tự. Mục đang xem có chữ đậm và gạch chân đen. Nội dung căn giữa, cùng chiều rộng với header. Không dùng gradient trang trí hoặc màu xanh làm thương hiệu.

| Vai trò | Quy ước |
| --- | --- |
| Tiêu đề / số liệu | Manrope Bold; web 34 px, mobile 25 px |
| Nội dung / nhãn / nút | Be Vietnam Pro; thường 14–16 px |
| Nền chính / bề mặt | #FFFFFF / #FFFFFF |
| Nền phụ | #F7F7F7 / #F2F2F2 |
| Chữ / CTA / đường dữ liệu | #111111 |
| Chữ phụ | #666666 |
| Viền / viền input | #DDDDDD / #888888 |
| Card / nút | Bo góc 8 px / 6 px; không thêm bóng trang trí |
| Vùng thao tác | Tối thiểu 44 px; CTA 48–52 px |

Gauge và biểu đồ dùng đen/xám. Màu thật chỉ được giữ ở LED, bộ chọn màu và một số trạng thái lỗi/cảnh báo. Gradient trong ô sắc độ và thanh sắc màu biểu diễn màu để chọn, không dùng làm nền trang trí. Slider độ sáng gồm hai đoạn màu phẳng.

Font và giấy phép OFL được đóng gói để chạy offline. Token scCurrent* cập nhật theo bảng trên; master tham chiếu và Page 2 được giữ. Font học thuật của báo cáo LaTeX không thay đổi.

### 1.1. Cơ sở lựa chọn bố cục

| Phương án | Đánh giá với sản phẩm này |
| --- | --- |
| Sidebar dọc | Bốn mục chính chưa cần một cột điều hướng chiếm toàn chiều cao. Đổi màu sidebar vẫn giữ cấu trúc cũ. |
| Thanh biểu tượng hẹp | Tiết kiệm chiều ngang nhưng cần giải mã icon hoặc tooltip. |
| Điều hướng ngang có nhãn — đã chọn | Bốn mục luôn hiện; chữ, số thứ tự và gạch chân tạo phân cấp rõ; giải phóng cột trái cho không gian nội dung. |

[Nghiên cứu của Nielsen Norman Group](https://www.nngroup.com/articles/hamburger-menus/) khuyến nghị giữ các liên kết chính hiển thị khi có ít mục. Nghiên cứu này hỗ trợ việc để bốn mục nhìn thấy trực tiếp; lựa chọn hình thức trắng–đen và đánh số là quyết định thiết kế của dự án, không phải kết luận thẩm mỹ từ nghiên cứu.

Desktop/tablet: Tổng quan / Lịch sử / Đèn LED / Cảm biến. Tài khoản ở góc phải header. Mobile giữ ba tab đáy; không đưa toàn bộ masthead desktop xuống điện thoại. Đánh đổi: header hai hàng cần chiều cao; nội dung cuộn dọc trên laptop thấp.
## 2. Gauge và biểu đồ

- **Độ ẩm:** gauge bán tròn 0–100%, số phần trăm ở giữa, hai đầu thang rõ ràng. Gauge hiển thị dữ liệu, không phải nút điều khiển; bản HTML có `role=meter` và giá trị cho công nghệ hỗ trợ.
- **Nhiệt độ và CO₂:** số lớn, đơn vị và sparkline khi có chuỗi thời gian. Không thêm gauge có ngưỡng hoặc góc quay tùy ý cho các đại lượng này.
- **Xu hướng:** một chỉ số trên một trục, đường và điểm dữ liệu rõ, có nhãn thời gian. Chạm, rê chuột hoặc focus điểm trong HTML để đọc giá trị.
- **Cột ngày:** thể hiện trung bình ngày, gốc 0, ngày cuối được nhấn bằng màu. Ngày 03/11 chưa kết thúc.
- **Heatmap:** xám sáng đến đậm theo giá trị 60–70%; native và HTML cùng bộ số minh họa. Ô thiếu dữ liệu có dấu `—`. Có thang số và giá trị ô đang chọn, không dùng màu để thay thế thông tin số.
- Tăng/giảm là xu hướng, không tự mang nghĩa tốt/xấu. CO₂ luôn ghi **ước lượng/tham khảo**; không thêm phân loại sức khỏe.

## 3. Điều khiển LED

1. Chọn một màu có tên và dấu ✓: Đỏ `#EF4444`, Xanh lá `#22C55E`, Xanh dương `#3B82F6`, Vàng `#EAB308`, Trắng `#FFFFFF`.
2. Kéo **Độ sáng 1–100%**. Giá trị phần trăm cập nhật ngay trong bản nháp, không gửi lệnh khi kéo.
3. Kiểm tra preview rồi nhấn **Áp dụng màu …** để gửi cả màu và độ sáng.

Yêu cầu đã gửi gần nhất được hiển thị riêng với bản nháp. Nút Áp dụng chỉ bật khi có thay đổi màu hoặc độ sáng, đầu vào hợp lệ và thiết bị sẵn sàng. Gửi lỗi giữ cả hai giá trị để thử lại; thành công cập nhật yêu cầu đã gửi, chưa coi là xác nhận đèn thực tế.

**Màu tùy chỉnh:** ô chọn độ đậm/sáng của màu và thanh sắc màu; HEX là lựa chọn thêm, không bắt buộc biết RGB. Chọn trực quan cập nhật preview và HEX. HEX sai báo tại trường và khóa gửi. Hủy khôi phục cả màu lẫn độ sáng đã gửi. Trong HTML, phím trái/phải chỉnh độ đậm, lên/xuống chỉnh độ sáng của màu; giữ Shift để tăng bước. Độ sáng của màu trong ô chọn và mức điều khiển độ sáng LED là hai giá trị riêng.

Bật/tắt gửi ngay. Khi tắt, offline hoặc đang gửi, khóa palette, slider, bộ chọn màu và thao tác gửi lặp. Màu/độ sáng chưa gửi được giữ trong phiên.

Slider độ sáng là phần thiết kế và mô phỏng mở rộng của ID 3. Cần bổ sung trường lệnh, xử lý backend và ESP32 khi triển khai sản phẩm thật.

## 4. Màn hình và hành vi

Giữ 17 màn chính: **6 web, 9 mobile, 2 WiFi**; 6 bảng trạng thái với 33 đoạn minh họa, một flow map và 8 board báo cáo. Root ID được giữ để truy vết. Thông tin ID chức năng nằm ngoài UI.

- Web: Tổng quan / Lịch sử / LED / Cảm biến. Mobile: ba tab Giám sát / LED / Lịch sử. Nút **DU** mở tài khoản; đăng xuất nằm trong menu. Desktop và tablet dùng cùng điều hướng ngang; tài khoản luôn truy cập được.
- Auth: đăng nhập bằng tài khoản/mật khẩu; đăng ký thêm xác nhận, tối thiểu 8 ký tự. Có lỗi trùng tài khoản, sai mật khẩu, xác nhận không trùng. Đăng ký thành công về đăng nhập và điền sẵn tài khoản.
- Phiên: đăng xuất/hết phiên về đăng nhập, chặn quay lại nội dung bảo vệ. Menu tài khoản giữ focus khi mở, Escape đóng và trả focus về nút mở.
- Dữ liệu mới/cũ có nhãn và thời gian. Chưa có dữ liệu dùng `—`; dữ liệu cũ giữ giá trị lần nhận cuối. Offline khóa điều khiển, vẫn có lối vào lịch sử.
- Lịch sử mặc định Độ ẩm / 24 giờ / Theo giờ. Preset 24 giờ và 7 ngày tự tải; ngày tùy chọn cần nhấn **Xem lịch sử**. Ngày đầu không sau ngày cuối. Chỉnh ngày chưa áp dụng giữ nguyên biểu đồ và nhãn khoảng cũ. Có tải/rỗng/lỗi và thao tác khôi phục.
- WiFi: kết nối WiFi ESP32 → chọn mạng → lưu → thiết bị khởi động lại → trở về WiFi thường dùng → kiểm tra bản tin trên web/app. Portal đóng hoặc nhận cấu hình chưa xác nhận thiết bị online. Đổi mạng bằng thao tác BOOT theo firmware.
- ID 1: độ ẩm/nhiệt độ; 2: CO₂ ước lượng; 3: LED; 4: lưu tự động; 5: lịch sử; 8: tài khoản; 9: hệ thống; 10: WiFi. Telegram 6–7 là luồng ngoài.

## 5. Dữ liệu và responsive

Dữ liệu minh họa tại 03/11/2026 14:30, UTC+7. Bảy mẫu cách nhau bốn giờ trong 24 giờ:

| Chỉ số | Giá trị |
| --- | --- |
| Độ ẩm (%) | 61, 62, 64, 66, 65, 64, 65 |
| Nhiệt độ (°C) | 26,8; 27; 27,1; 27,4; 27,7; 27,6; 27,5 |
| CO₂ ước lượng (ppm) | 720, 750, 810, 840, 870, 860, 850 |
| Trung bình ngày 28/10–03/11 (%) | 64; 63; 65; 67; 66; 64; 64,5 |

Độ ẩm: trung bình mẫu 63,9%, min 61%, max 66%, thay đổi +4 điểm phần trăm. Ô 03/11 lúc 16h và 20h chưa có dữ liệu.

Web auth 1440 × 1024, workspace desktop 1440 × 1080; app/portal 390 × 844. Nhóm `60-Responsive-Interaction` bổ sung LED 320 × 844 và 1024 × 1024. HTML thích ứng và cuộn dọc tại 320, 360, 390, 768, 1024, 1440 px. M07 là màn riêng trên Figma, vùng mở rộng trên HTML.

## 6. Kiểm tra và bàn giao

- [layout_audit.json](wireframes-v3/layout_audit.json): kiểm tra bảy nhóm canvas, không có lỗi cắt chữ hoặc tràn khung sau chỉnh sửa.
- [prototype_verification.json](wireframes-v3/prototype_verification.json): 62 kiểm tra tương tác, font offline, gauge, slider, lỗi gửi, lịch sử, phiên và responsive.
- [color_audit.json](wireframes-v3/color_audit.json): tỷ lệ tương phản của bảng màu hiện hành. Đây là kiểm tra các cặp màu khai báo, không phải chứng nhận mọi trạng thái.
- [export_verification.json](wireframes-v3/export_verification.json): 25 cặp SVG/PNG chính, 2 cặp responsive, 1 cặp UI mobile cho PDF; kích thước, hash và bản copy báo cáo.
- Ảnh báo cáo được copy vào `images/wireframes/`, nguồn [thuyet_minh.tex](thuyet_minh.tex) và PDF được cập nhật đồng bộ. SVG dùng chữ outline; chỉnh chữ tại nguồn Figma rồi xuất lại.
- Bản HTML mô phỏng dữ liệu và lệnh, chưa nối backend/MQTT/ESP32. Luồng tương tác native Present của Figma chưa được xác minh; dùng HTML để thử luồng.

Các bộ cũ, ZIP và file kiểm tra tạm không thuộc bộ bàn giao. Nguồn thiết kế, font kèm giấy phép, công cụ tái xuất và báo cáo hiện hành được giữ.
