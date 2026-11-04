# Thiết kế hiện hành — Smart Classroom

Bộ V3 được cập nhật trực tiếp trong **VLcCNTT → Page 1 (`0:1`)**, ngày 04/11/2026. Hiện có **35 màn hình: 14 web, 19 mobile, 2 WiFi**, 9 board báo cáo và 2 bố cục LED bổ sung. Page 2 được giữ làm tham chiếu.

[Thư viện ảnh](wireframes-v3/index.html) · [Prototype](prototype/index.html) · [Chỉ mục và node Figma](wireframe_v3_manifest.md)

## Hình thức và điều hướng

Trắng–đen phẳng; Manrope Bold cho tiêu đề/số liệu, Be Vietnam Pro cho nội dung. Nền #FFFFFF, chữ/CTA/đường dữ liệu #111111, chữ phụ #666666, viền #DDDDDD, viền input #888888. Card bo 8 px, nút 6 px; vùng thao tác từ 44 px. Font và giấy phép OFL dùng offline.

Desktop có masthead hai hàng: thương hiệu/tài khoản và bốn mục đánh số Tổng quan / Lịch sử / Đèn LED / Cảm biến. Mục hiện hành có gạch chân đen. Mobile giữ ba tab Giám sát / Đèn LED / Lịch sử; trang chi tiết có nút quay lại. Các trang bổ sung đi từ liên kết trong nội dung hoặc tài khoản.

Màu thật dành cho LED/bộ chọn màu và trạng thái cần chú ý. Gradient trong ô sắc độ và thanh sắc màu biểu diễn màu để chọn. Các bề mặt không có gradient trang trí.

## Biểu đồ đã nâng cấp

- Một chỉ số, một đơn vị trên mỗi chart. Trục tung ghi %, °C hoặc ppm; thời gian theo UTC+7.
- Giờ nằm trên một hàng; ngày đầy đủ nằm trên hàng riêng. Vạch đứt **00:00** đặt theo timestamp thật, giữa mẫu 22:30 và 02:30.
- Đường không tô diện tích. Thang nhìn gần ghi rõ: độ ẩm 55–70%, nhiệt độ 26–28°C, CO₂ 600–900 ppm. Các thang này phục vụ đọc biến động, không phải phân loại tốt/xấu.
- Điểm có nhãn số trên desktop; mobile ưu tiên điểm đang chọn và bảng đọc giá trị. HTML hỗ trợ chạm, rê chuột, focus, phím trái/phải, Home/End và bảng dữ liệu bằng chữ.
- Cột ngày bắt đầu từ **0**. Desktop dùng cột đứng; mobile dùng thanh ngang với nhãn từng ngày. Ngày 03/11 chưa kết thúc có họa tiết/viền riêng và ghi chú.
- Heatmap gồm **7 hàng ngày × 6 cột giờ**, thang xám 60–70%, chú giải số và giá trị ô đang chọn. Trên màn hẹp, chỉ phần ma trận cuộn ngang.
- Dấu **—** và vùng xám biểu thị mốc chưa có dữ liệu. Không nối đường hoặc coi mốc 16h, 20h ngày 03/11 là số 0.

Cách chia trục, giữ gốc 0 cho cột, không nội suy phần thiếu và cung cấp nhãn/bảng số dựa trên [Carbon: Axes and labels](https://www.carbondesignsystem.com/building-blocks/data-visualization/axes-and-labels) và [NSW: Charts and graphs](https://designsystem.nsw.gov.au/methods/charts-and-graphs.html). Hình thức trắng–đen và lựa chọn bố cục là quyết định thiết kế của dự án.

Gauge bán tròn 0–100% dành cho độ ẩm, có số và hai đầu thang; HTML dùng `role=meter`. Nhiệt độ/CO₂ dùng số lớn và xu hướng. CO₂ luôn ghi **ước lượng / tham khảo**, không tự đặt ngưỡng sức khỏe.

## Các trang mới và phạm vi chức năng

| Nhóm | Web | Mobile | Nội dung |
| --- | --- | --- | --- |
| Chi tiết chỉ số | W07, W08 | M10, M11 | Nhiệt độ, CO₂, thời điểm nhận và thống kê |
| Theo ngày | W09, W14 | M08, M14 | Cột gốc 0, heatmap và chi tiết ngày chưa kết thúc |
| Bản ghi / bộ lọc | W10; bộ lọc tại W04 | M12, M13 | Ba cảm biến cùng thời điểm; ngày tùy chọn |
| Thiết bị | W11 | M15 | Bản tin gần nhất, WiFi và hướng dẫn BOOT |
| Telegram | W12 | M16, M17 | Hướng dẫn, lệnh và hội thoại bên ngoài minh họa |
| Tài khoản / phiên | W13 | M18, M19 | Phiên hiện tại, đăng xuất và hết phiên |

M08 được nâng cấp từ màn cũ; 18 màn mới là W07–W14 và M10–M19.

| ID đồ án | Màn / luồng thể hiện |
| --- | --- |
| 1 — Độ ẩm, nhiệt độ | W03, W06, W07; M03, M06, M10 |
| 2 — CO₂ ước lượng | W03, W08; M03, M11 |
| 3 — Điều khiển LED | W05; M04, M07; hai bố cục responsive |
| 4 — Lưu dữ liệu | W10, M12 giải thích lưu tự động kèm thời gian; không có nút lưu từng cảm biến |
| 5 — Truy vấn lịch sử | W04, W09, W10, W14; M05, M08, M12, M13, M14 |
| 6 — Cảnh báo Telegram | W12, M16, M17; /start ghi nhận người nhận; độ ẩm <30% hoặc >85% |
| 7 — Hỏi nhanh Telegram | /doam và /trangthai trong W12, M16, M17 |
| 8 — Tài khoản, phiên | W01, W02, W13; M01, M02, M18, M19; ST01, ST06 |
| 9 — Website/hệ thống | Các màn web/mobile dùng chung dữ liệu và tài khoản |
| 10 — Cấu hình WiFi | P01, P02; W11, M15 hướng dẫn BOOT vật lý khoảng 5 giây |

M17 mô phỏng kênh Telegram bên ngoài, không phải client Telegram thật. Khoảng nghỉ giữa cảnh báo được mô tả mà không tự đặt thời lượng. Các chức năng cloud/MQTT/SQLite/Firestore thuộc phần triển khai hệ thống; giao diện mô phỏng chưa thực hiện các dịch vụ đó.

## LED và trạng thái

Chọn màu có tên → kéo độ sáng 1–100% → xem trước → Áp dụng. Kéo slider không gửi lệnh. Bật/tắt gửi ngay. Màu tùy chỉnh có ô sắc độ, thanh sắc màu và HEX tùy chọn; hủy khôi phục màu/độ sáng đã gửi.

Giữ rõ bản nháp và yêu cầu đã gửi. Gửi lỗi giữ bản nháp; trạng thái thành công chưa xác nhận phần cứng đã thực hiện. Tắt/offline/pending khóa điều khiển. Slider độ sáng là đề xuất mở rộng ID 3, cần xử lý backend/ESP32 khi triển khai.

Đăng ký có xác nhận mật khẩu; đăng xuất/hết phiên chặn dữ liệu bảo vệ. Lịch sử có tải/rỗng/lỗi và thao tác phục hồi. Ngày tùy chọn phải áp dụng, ngày đầu không sau ngày cuối. Đã nhận cấu hình WiFi chưa đồng nghĩa thiết bị online.

## Dữ liệu và kích thước

Dữ liệu minh họa cố định tại **03/11/2026 14:30, UTC+7**.

| Chuỗi 24 giờ, cách nhau 4 giờ | Giá trị |
| --- | --- |
| Độ ẩm (%) | 61; 62; 64; 66; 65; 64; 65 |
| Nhiệt độ (°C) | 26,8; 27; 27,1; 27,4; 27,7; 27,6; 27,5 |
| CO₂ ước lượng (ppm) | 720; 750; 810; 840; 870; 860; 850 |
| Độ ẩm trung bình ngày 28/10–03/11 (%) | 64; 63; 65; 67; 66; 64; 64,5 |

Chi tiết 03/11 dùng bốn khung đã có: 63; 64; 65; 64,5%; trung bình **4 khung là 64,1%**. Đây là mức tổng hợp khác với trung bình ngày 64,5%; các bộ số chỉ minh họa cách đọc, chưa phải phép tổng hợp từ cơ sở dữ liệu thật.

Web rộng 1440 px, cao 1024–1320 px tùy nội dung. Mobile/portal rộng 390 px, cao 844–1240 px; đây là toàn bộ nội dung cuộn, không phải chiều cao thiết bị. LED bổ sung tại 320×844 và 1024×1024. HTML được kiểm tra từ 320 đến 1440 px.

## Kiểm tra và nguồn chỉnh sửa

- [Layout Figma](wireframes-v3/layout_audit.json): sáu nhóm gồm web, mobile, WiFi, trạng thái/luồng, báo cáo và responsive; không có lỗi bounds/clipping/truncation. Style hints về mép chart và chữ trắng trên nhãn đen được đối chiếu trực quan.
- [Prototype](wireframes-v3/prototype_verification.json): **128 kiểm tra**; dữ liệu chart, mốc 00:00, đơn vị, phần thiếu, bàn phím, auth, LED, Telegram minh họa và responsive.
- [Ảnh xuất](wireframes-v3/export_verification.json): **47 cặp PNG/SVG** = 35 màn + 9 board báo cáo + 2 responsive + 1 UI mobile; đối chiếu kích thước, hash và bản copy báo cáo.
- [Báo cáo](wireframes-v3/report_verification.json): PDF 26 trang; các hình wireframe, chú thích và bảng ID đã được render để kiểm tra. R07 dùng thành phần mobile phóng lớn để đọc rõ khi in.
- [Registry](wireframes-v3/assets.json) ghi node Figma thật. SVG xuất từ Figma dùng chữ outline; sửa chữ ở Figma rồi xuất lại.
- Nguồn dựng nhóm nâng cấp ở `tools/wireframes/`; không tạo bộ V1/V2/V4 song song. Page 2 và component tham chiếu được giữ.
- Prototype chưa nối backend/MQTT/ESP32. Native Present chưa được xác minh; dùng HTML để thử thao tác.
