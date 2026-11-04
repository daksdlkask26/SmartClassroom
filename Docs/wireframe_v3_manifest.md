# Chỉ mục wireframe V3 — VLcCNTT

Ngày 03/11/2026. Đã nâng cấp trực tiếp bằng **Reqwise Figma MCP** trong **VLcCNTT → Page 1 (`0:1`)**. **Page 2 giữ nguyên**, đối chiếu cây 817 node trước/sau khớp hoàn toàn.

Giữ đủ **17 màn hình: 6 web, 9 mobile, 2 WiFi**, 6 bảng trạng thái/33 đoạn minh họa, 1 sơ đồ luồng và 8 board báo cáo. V3 bổ sung hệ màu dữ liệu, cải thiện bảng số liệu và tinh gọn phần lặp. Tải [bộ ZIP V3](wireframe_VLcCNTT_v3_2026-11-03.zip); xem [đặc tả V3](huong_dan_wireframe_v3.md).

## 1. Nguồn Figma và hệ màu

MCP không trả fileKey/URL của file trong phiên này. Mở **VLcCNTT → Page 1** và tìm bằng tên hoặc node ID. Các frame UI, form và điều khiển gốc giữ ID. Nguồn gồm chữ và hình native chỉnh sửa được.

| Nhóm canvas | Node ID | Nội dung |
| --- | --- | --- |
| 00-Foundations | `6:154` | Thành phần dùng chung, bảng màu V3 và ví dụ biểu đồ |
| 10-Web | `6:444` | 6 màn web |
| 20-App | `6:772` | 9 màn app |
| 30-WiFi | `6:1227` | 2 trang portal |
| 40-States-Flows | `7:1306` | 6 bảng trạng thái và flow map `7:1316` |
| 50-Report | `8:1880` | 8 board báo cáo |

| Vai trò | Màu | Tương phản trên trắng |
| --- | --- | --- |
| Độ ẩm | `#2563EB` | 5,17:1 |
| Nhiệt độ | `#C2410C` | 5,18:1 |
| CO₂ ước lượng | `#7C3AED` | 5,70:1 |
| Cột dữ liệu ngữ cảnh | `#64748B` | 4,76:1 |
| Viền trường nhập liệu | `#8793A2` | 3,12:1 |
| Chữ phụ | `#5B6472` | 5,98:1 |

Nền và CTA chính giữ trung tính. Trên nền đen dùng các sắc xanh/cam/tím sáng tương ứng. Trạng thái kết nối, dữ liệu cũ, lỗi và thông tin có màu ngữ nghĩa riêng, luôn kèm chữ. Màu LED vẫn đúng HEX/RGB được chọn.

Giữ nguyên 25 component master và các giá trị token cũ; thêm 12 biến màu độc lập có tiền tố `scv3`. Các trường nhập liệu trên Page 1 được chỉnh style tại instance/native node. Inventory chỉ đọc: [design.md](wireframes-v3/design.md). Kết quả tính tương phản: [color_audit.json](wireframes-v3/color_audit.json).

## 2. Mười bảy màn hình

UI web 1440 × 1024; app/portal 390 × 844 px. Ảnh có wrapper tên màn hình và chú thích chức năng ngoài UI. PNG màn hình ở 2×: web 3536 × 2352, mobile 1396 × 1992 px.

| Màn hình | Nội dung V3 | Node UI | Node wrapper | PNG 2× | SVG |
| --- | --- | --- | --- | --- | --- |
| W01-Login | Đăng nhập web; bỏ nhãn nền tảng và footer lặp | `6:453` | `6:448` | [PNG](wireframes-v3/screens/wireframe-web-login.png) | [SVG](wireframes-v3/screens/wireframe-web-login.svg) |
| W02-Register | Đăng ký web; biểu mẫu và hướng dẫn gọn hơn | `6:462` | `6:449` | [PNG](wireframes-v3/screens/wireframe-web-register.png) | [SVG](wireframes-v3/screens/wireframe-web-register.svg) |
| W03-Dashboard | Chỉ số có màu, sparkline, vùng và cột tuần | `6:471` | `6:450` | [PNG](wireframes-v3/screens/wireframe-web-dashboard.png) | [SVG](wireframes-v3/screens/wireframe-web-dashboard.svg) |
| W04-Analytics | Bộ lọc rõ viền, vùng, phân bố và heatmap có thang số | `21:4414` | `21:4663` | [PNG](wireframes-v3/screens/wireframe-web-analytics.png) | [SVG](wireframes-v3/screens/wireframe-web-analytics.svg) |
| W05-LEDControl | Xem trước và áp dụng LED; bỏ khối so sánh lặp | `21:4681` | `21:4784` | [PNG](wireframes-v3/screens/wireframe-web-led.png) | [SVG](wireframes-v3/screens/wireframe-web-led.svg) |
| W06-HumidityDetail | Độ ẩm, phân bố và bảng 3 bản ghi mới nhất | `21:4797` | `21:5015` | [PNG](wireframes-v3/screens/wireframe-web-humidity-detail.png) | [SVG](wireframes-v3/screens/wireframe-web-humidity-detail.svg) |
| M01-Login | Đăng nhập app | `6:783` | `6:776` | [PNG](wireframes-v3/screens/wireframe-app-login.png) | [SVG](wireframes-v3/screens/wireframe-app-login.svg) |
| M02-Register | Đăng ký app | `6:792` | `6:777` | [PNG](wireframes-v3/screens/wireframe-app-register.png) | [SVG](wireframes-v3/screens/wireframe-app-register.svg) |
| M03-Overview | Giám sát; một gauge chính, hai sparkline có đơn vị | `6:801` | `6:778` | [PNG](wireframes-v3/screens/wireframe-app-overview.png) | [SVG](wireframes-v3/screens/wireframe-app-overview.svg) |
| M04-LED | Đèn LED và chọn màu | `6:812` | `6:779` | [PNG](wireframes-v3/screens/wireframe-app-led.png) | [SVG](wireframes-v3/screens/wireframe-app-led.svg) |
| M05-History | Lịch sử theo giờ, nhãn điểm cuối | `6:821` | `6:780` | [PNG](wireframes-v3/screens/wireframe-app-history.png) | [SVG](wireframes-v3/screens/wireframe-app-history.svg) |
| M06-HumidityDetail | Chi tiết độ ẩm và thống kê | `23:5595` | `23:5745` | [PNG](wireframes-v3/screens/wireframe-app-humidity-detail.png) | [SVG](wireframes-v3/screens/wireframe-app-humidity-detail.svg) |
| M07-ColorPicker | Bảng màu, HEX/RGB, nút áp dụng | `23:5758` | `23:5809` | [PNG](wireframes-v3/screens/wireframe-app-color-picker.png) | [SVG](wireframes-v3/screens/wireframe-app-color-picker.svg) |
| M08-DailyAnalytics | Cột ngày, heatmap xanh, ký hiệu thiếu dữ liệu | `23:5827` | `23:5942` | [PNG](wireframes-v3/screens/wireframe-app-daily-analytics.png) | [SVG](wireframes-v3/screens/wireframe-app-daily-analytics.svg) |
| M09-ConnectionState | Dữ liệu cũ màu hổ phách; giữ số lần nhận cuối | `23:5955` | `23:6067` | [PNG](wireframes-v3/screens/wireframe-app-connection-state.png) | [SVG](wireframes-v3/screens/wireframe-app-connection-state.svg) |
| P01-WiFiPortal | Cấu hình WiFi; thông báo hướng dẫn màu xanh | `6:1235` | `6:1231` | [PNG](wireframes-v3/screens/wireframe-wifi-portal.png) | [SVG](wireframes-v3/screens/wireframe-wifi-portal.svg) |
| P02-WiFiReceived | Nhận cấu hình, khởi động lại và kiểm tra kết nối | `23:6131` | `23:6163` | [PNG](wireframes-v3/screens/wireframe-wifi-received.png) | [SVG](wireframes-v3/screens/wireframe-wifi-received.svg) |

## 3. Tám board báo cáo

| Board | Kích thước logic | Node ID | PNG 3× | SVG |
| --- | --- | --- | --- | --- |
| R01-WebAuth | 1000 × 1180 | `8:1884` | [PNG](wireframes-v3/reports/report-wireframe-web-auth.png) | [SVG](wireframes-v3/reports/report-wireframe-web-auth.svg) |
| R02-WebMonitorLED | 1000 × 1280 | `8:1885` | [PNG](wireframes-v3/reports/report-wireframe-web-monitor-led.png) | [SVG](wireframes-v3/reports/report-wireframe-web-monitor-led.svg) |
| R03-WebAnalytics | 1000 × 1520 | `8:1886` | [PNG](wireframes-v3/reports/report-wireframe-web-analytics.png) | [SVG](wireframes-v3/reports/report-wireframe-web-analytics.svg) |
| R04-AppAuth | 900 × 1180 | `8:1887` | [PNG](wireframes-v3/reports/report-wireframe-app-auth.png) | [SVG](wireframes-v3/reports/report-wireframe-app-auth.svg) |
| R05-AppOverview | 650 × 1000 | `8:1888` | [PNG](wireframes-v3/reports/report-wireframe-app-overview.png) | [SVG](wireframes-v3/reports/report-wireframe-app-overview.svg) |
| R06-AppLED | 650 × 1000 | `8:1889` | [PNG](wireframes-v3/reports/report-wireframe-app-led.png) | [SVG](wireframes-v3/reports/report-wireframe-app-led.svg) |
| R07-AppDailyAnalytics | 650 × 1000 | `8:1890` | [PNG](wireframes-v3/reports/report-wireframe-app-daily-analytics.png) | [SVG](wireframes-v3/reports/report-wireframe-app-daily-analytics.svg) |
| R08-WiFi | 650 × 1000 | `8:1891` | [PNG](wireframes-v3/reports/report-wireframe-wifi.png) | [SVG](wireframes-v3/reports/report-wireframe-wifi.svg) |

Đã đồng bộ màu và nội dung với UI V3. Kiểm tra 300 node chữ ở chiều rộng in 15 cm: nhỏ nhất khoảng **9,16 pt**, không có node dưới 9 pt. SVG xuất từ Figma dùng chữ outline; muốn sửa chữ, sửa tại nguồn Figma rồi xuất lại.

## 4. Trạng thái và luồng

Các bảng và luồng dưới đây vẫn thuộc bộ V3 trên Page 1; tra trực tiếp bằng node ID, không phụ thuộc tài liệu V1/V2.

| Board | Node ID | Phạm vi |
| --- | --- | --- |
| ST01-Auth | `7:1310` | Nhập liệu, đang gửi và lỗi tài khoản |
| ST02-Telemetry | `7:1311` | Đang tải, dữ liệu mới/cũ và mất kết nối |
| ST03-LED | `7:1312` | Màu nháp, áp dụng, đang gửi, lỗi và khóa điều khiển |
| ST04-History | `7:1313` | Bộ lọc, giờ/ngày, đang tải, rỗng và lỗi |
| ST05-WiFi | `7:1314` | Quét/chọn mạng, lỗi và cấu hình sau khởi động lại |
| ST06-Session | `7:1315` | Đăng xuất và hết phiên |
| 40-Flowmap | `7:1316` | W01–W06, M01–M09, P01–P02 và luồng Telegram ngoài web/app |

Quy tắc thao tác và phiên được tổng hợp trong [đặc tả V3, mục 4](huong_dan_wireframe_v3.md#4-phạm-vi-màn-hình-và-hành-vi). Các tuyến mới trên canvas chưa được xác nhận là liên kết tương tác Present.

## 5. Những phần đã tinh gọn

| Phần lược bỏ | Thông tin vẫn được giữ |
| --- | --- |
| 4 card kết nối trong sidebar | Header hiển thị trạng thái và thời gian cập nhật |
| 10 gauge nhỏ cho nhiệt độ/CO₂, gồm cả bản báo cáo | Số, đơn vị và xu hướng; màn dữ liệu cũ giữ số lần nhận cuối |
| Khối so sánh trước/sau ở W05 | Màu nháp tại preview; màu đã gửi tại panel điều khiển |
| Tiêu đề cảnh báo lặp ở M09 | Nhãn trạng thái, thời gian và hướng dẫn xử lý |
| Nhãn Web desktop và footer giới thiệu trong W01–W02 | Tên sản phẩm và chức năng tài khoản; metadata nền tảng nằm ngoài UI |
| Ghi chú offline luôn hiện tại W05 | Trạng thái offline và quy tắc khóa lệnh tại ST03/M09 |
| Chú giải heatmap cũ | Thang số 60–70% và ký hiệu — cho dữ liệu thiếu |

Tổng 23 node gốc của các phần trên cùng con được lược bỏ; 314 node được xóa và 183 node hữu ích được thêm, giảm ròng 131 node. Không xóa màn hình chức năng, biểu mẫu, bảng trạng thái hoặc luồng cần thiết. Xem [cleanup_log.json](wireframes-v3/cleanup_log.json).

## 6. Kiểm tra và giới hạn bàn giao

- **Bảo toàn:** Page 2 gồm 817 node, cây dữ liệu trước/sau khớp; 25 cây component master giữ nguyên. Xem [page2_guard.json](wireframes-v3/page2_guard.json).
- **Bố cục:** 6 nhóm, 4399 node con; 0 lỗi chặn về overflow, clipping hoặc cắt chữ. Các gợi ý cho header/nav sát mép, nền chọn, radius theo vai trò và bảng hàng đã được xem trên ảnh. Xem [layout_audit.json](wireframes-v3/layout_audit.json).
- **Màu:** các màu đường dữ liệu chính đạt từ 5,17:1 trên trắng; heatmap giảm độ sáng đều từ thấp đến cao. Màu được hỗ trợ bằng tên, đơn vị, số, thang đo và ký hiệu thiếu dữ liệu. Đây là kiểm tra palette và các view đã rà soát, không phải chứng nhận mọi trạng thái tương tác.
- **Dữ liệu:** minh họa tại 03/11/2026 14:30; không suy diễn tăng/giảm thành tốt/xấu, không tạo ngưỡng sức khỏe cho CO₂ ước lượng.
- **Ảnh:** 25 PNG + 25 SVG, đúng tỉ lệ và không có PNG cũ hơn SVG nguồn. Xem [export_verification.json](wireframes-v3/export_verification.json).
- **Luồng:** giữ định tuyến và state map đã có; không nối thêm tuyến tương tác Present trong đợt chỉnh màu này.
- **Bộ hiện hành:** chỉ giữ V3. Ngày 04/11/2026 đã loại bỏ bộ ảnh, ZIP, manifest và kế hoạch V1/V2; các quy tắc còn áp dụng và node trạng thái được tổng hợp vào tài liệu V3. ZIP V3 đồng bộ với tài liệu hiện tại; các PNG/SVG V3 giữ nguyên. Không sửa backend hoặc nội dung thuyết minh.

