# Chỉ mục wireframe V3 — VLcCNTT

Thiết kế gốc ngày 03/11/2026, cập nhật UX ngày 04/11/2026 bằng **Reqwise Figma MCP** trong **VLcCNTT → Page 1 (`0:1`)**. **Page 2 giữ làm tham chiếu**, không sửa trong đợt nâng cấp.

Giữ đủ **17 màn hình: 6 web, 9 mobile, 2 WiFi**, 6 bảng trạng thái/33 đoạn minh họa, 1 sơ đồ luồng và 8 board báo cáo. Thiết kế lại toàn diện ngày **04/11/2026**: trắng–đen, bỏ sidebar và dùng điều hướng ngang có số thứ tự, Manrope + Be Vietnam Pro, gauge độ ẩm, slider độ sáng và bộ chọn màu trực quan; đồng bộ hai bố cục responsive và [bản thử tương tác](prototype/index.html). Xem [đặc tả V3](huong_dan_wireframe_v3.md).

## 1. Nguồn Figma và hệ màu

MCP không trả fileKey/URL của file trong phiên này. Mở **VLcCNTT → Page 1** và tìm bằng tên hoặc node ID. Các frame UI gốc giữ ID; vùng điều khiển LED được dựng lại bằng node native. Nguồn gồm chữ và hình native chỉnh sửa được.

| Nhóm canvas | Node ID | Nội dung |
| --- | --- | --- |
| 00-Foundations | `6:154` | Thành phần dùng chung, bảng màu V3 và ví dụ biểu đồ |
| 10-Web | `6:444` | 6 màn web |
| 20-App | `6:772` | 9 màn app |
| 30-WiFi | `6:1227` | 2 trang portal |
| 40-States-Flows | `7:1306` | 6 bảng trạng thái và flow map `7:1316` |
| 50-Report | `8:1880` | 8 board báo cáo |
| 60-Responsive-Interaction | `43:798` | LED 320 px và 1024 px |

| Vai trò | Màu | Tương phản trên trắng |
| --- | --- | --- |
| Chữ / CTA / dữ liệu | #111111 | 18,88:1 |
| Chữ phụ | #666666 | 5,74:1 |
| Viền input | #888888 | 3,54:1 |

Nền trắng, bề mặt phụ #F7F7F7 / #F2F2F2; không có gradient trang trí. Màu LED giữ đúng HEX được chọn. Manrope + Be Vietnam Pro tiếp tục dùng; font chạy offline. Header ngang gồm tên sản phẩm/tài khoản và bốn liên kết đánh số, gạch chân mục hiện hành.

[Cơ sở chọn bố cục](huong_dan_wireframe_v3.md#11-cơ-sở-lựa-chọn-bố-cục) · [Inventory Figma](wireframes-v3/design.md) · [Tương phản](wireframes-v3/color_audit.json).

## 2. Mười bảy màn hình

UI web auth 1440 × 1024, workspace 1440 × 1080; app/portal 390 × 844 px. Ảnh có wrapper tên màn hình và chú thích chức năng ngoài UI. PNG màn hình ở 2×: web auth 3536 × 2352, workspace 3536 × 2464, mobile 1396 × 1992 px.

| Màn hình | Nội dung V3 | Node UI | Node wrapper | PNG 2× | SVG |
| --- | --- | --- | --- | --- | --- |
| W01-Login | Đăng nhập web; bỏ nhãn nền tảng và footer lặp | `6:453` | `6:448` | [PNG](wireframes-v3/screens/wireframe-web-login.png) | [SVG](wireframes-v3/screens/wireframe-web-login.svg) |
| W02-Register | Đăng ký web; biểu mẫu và hướng dẫn gọn hơn | `6:462` | `6:449` | [PNG](wireframes-v3/screens/wireframe-web-register.png) | [SVG](wireframes-v3/screens/wireframe-web-register.svg) |
| W03-Dashboard | Gauge độ ẩm, số nhiệt độ/CO₂, xu hướng và cột tuần | `6:471` | `6:450` | [PNG](wireframes-v3/screens/wireframe-web-dashboard.png) | [SVG](wireframes-v3/screens/wireframe-web-dashboard.svg) |
| W04-Analytics | Bộ lọc, biểu đồ một chỉ số, thống kê và heatmap có thang số | `21:4414` | `21:4663` | [PNG](wireframes-v3/screens/wireframe-web-analytics.png) | [SVG](wireframes-v3/screens/wireframe-web-analytics.svg) |
| W05-LEDControl | Màu có tên, slider độ sáng 1–100%, xem trước rồi Áp dụng | `21:4681` | `21:4784` | [PNG](wireframes-v3/screens/wireframe-web-led.png) | [SVG](wireframes-v3/screens/wireframe-web-led.svg) |
| W06-HumidityDetail | Gauge độ ẩm, xu hướng và bảng 3 bản ghi mới nhất | `21:4797` | `21:5015` | [PNG](wireframes-v3/screens/wireframe-web-humidity-detail.png) | [SVG](wireframes-v3/screens/wireframe-web-humidity-detail.svg) |
| M01-Login | Đăng nhập app | `6:783` | `6:776` | [PNG](wireframes-v3/screens/wireframe-app-login.png) | [SVG](wireframes-v3/screens/wireframe-app-login.svg) |
| M02-Register | Đăng ký app | `6:792` | `6:777` | [PNG](wireframes-v3/screens/wireframe-app-register.png) | [SVG](wireframes-v3/screens/wireframe-app-register.svg) |
| M03-Overview | Gauge độ ẩm, số nhiệt độ/CO₂ và xu hướng độ ẩm | `6:801` | `6:778` | [PNG](wireframes-v3/screens/wireframe-app-overview.png) | [SVG](wireframes-v3/screens/wireframe-app-overview.svg) |
| M04-LED | Chọn màu và độ sáng, tách bản nháp/yêu cầu đã gửi | `6:812` | `6:779` | [PNG](wireframes-v3/screens/wireframe-app-led.png) | [SVG](wireframes-v3/screens/wireframe-app-led.svg) |
| M05-History | Lịch sử theo giờ, nhãn điểm cuối | `6:821` | `6:780` | [PNG](wireframes-v3/screens/wireframe-app-history.png) | [SVG](wireframes-v3/screens/wireframe-app-history.svg) |
| M06-HumidityDetail | Chi tiết độ ẩm và thống kê | `23:5595` | `23:5745` | [PNG](wireframes-v3/screens/wireframe-app-humidity-detail.png) | [SVG](wireframes-v3/screens/wireframe-app-humidity-detail.svg) |
| M07-ColorPicker | Ô sắc độ + thanh sắc màu, HEX tùy chọn, preview và áp dụng | `23:5758` | `23:5809` | [PNG](wireframes-v3/screens/wireframe-app-color-picker.png) | [SVG](wireframes-v3/screens/wireframe-app-color-picker.svg) |
| M08-DailyAnalytics | Cột ngày, heatmap xám, ký hiệu thiếu dữ liệu | `23:5827` | `23:5942` | [PNG](wireframes-v3/screens/wireframe-app-daily-analytics.png) | [SVG](wireframes-v3/screens/wireframe-app-daily-analytics.svg) |
| M09-ConnectionState | Dữ liệu cũ màu hổ phách; giữ số lần nhận cuối | `23:5955` | `23:6067` | [PNG](wireframes-v3/screens/wireframe-app-connection-state.png) | [SVG](wireframes-v3/screens/wireframe-app-connection-state.svg) |
| P01-WiFiPortal | Cấu hình WiFi; hướng dẫn sau khi lưu cấu hình | `6:1235` | `6:1231` | [PNG](wireframes-v3/screens/wireframe-wifi-portal.png) | [SVG](wireframes-v3/screens/wireframe-wifi-portal.svg) |
| P02-WiFiReceived | Nhận cấu hình, khởi động lại và kiểm tra kết nối | `23:6131` | `23:6163` | [PNG](wireframes-v3/screens/wireframe-wifi-received.png) | [SVG](wireframes-v3/screens/wireframe-wifi-received.svg) |

## 3. Tám board báo cáo

| Board | Kích thước logic | Node ID | PNG 3× | SVG |
| --- | --- | --- | --- | --- |
| R01-WebAuth | 1000 × 1180 | `8:1884` | [PNG](wireframes-v3/reports/report-wireframe-web-auth.png) | [SVG](wireframes-v3/reports/report-wireframe-web-auth.svg) |
| R02-WebMonitorLED | 1000 × 1456 | `8:1885` | [PNG](wireframes-v3/reports/report-wireframe-web-monitor-led.png) | [SVG](wireframes-v3/reports/report-wireframe-web-monitor-led.svg) |
| R03-WebAnalytics | 1000 × 1520 | `8:1886` | [PNG](wireframes-v3/reports/report-wireframe-web-analytics.png) | [SVG](wireframes-v3/reports/report-wireframe-web-analytics.svg) |
| R04-AppAuth | 1000 × 1180 | `8:1887` | [PNG](wireframes-v3/reports/report-wireframe-app-auth.png) | [SVG](wireframes-v3/reports/report-wireframe-app-auth.svg) |
| R05-AppOverview | 650 × 1000 | `8:1888` | [PNG](wireframes-v3/reports/report-wireframe-app-overview.png) | [SVG](wireframes-v3/reports/report-wireframe-app-overview.svg) |
| R06-AppLED | 650 × 1000 | `8:1889` | [PNG](wireframes-v3/reports/report-wireframe-app-led.png) | [SVG](wireframes-v3/reports/report-wireframe-app-led.svg) |
| R07-AppDailyAnalytics | 650 × 1000 | `8:1890` | [PNG](wireframes-v3/reports/report-wireframe-app-daily-analytics.png) | [SVG](wireframes-v3/reports/report-wireframe-app-daily-analytics.svg) |
| R08-WiFi | 650 × 1000 | `8:1891` | [PNG](wireframes-v3/reports/report-wireframe-wifi.png) | [SVG](wireframes-v3/reports/report-wireframe-wifi.svg) |

Đã đồng bộ toàn bộ UI. R01/R02/R03/R08 dùng chữ lớn dành cho báo cáo; R05–R07 minh họa mobile kèm chú thích. SVG dùng chữ outline; muốn sửa chữ, sửa nguồn Figma rồi xuất lại.

## 4. Trạng thái và luồng

Các bảng và luồng dưới đây vẫn thuộc bộ V3 trên Page 1; tra trực tiếp bằng node ID, không phụ thuộc tài liệu V1/V2.

| Board | Node ID | Phạm vi |
| --- | --- | --- |
| ST01-Auth | `7:1310` | Nhập liệu, đang gửi và lỗi tài khoản |
| ST02-Telemetry | `7:1311` | Đang tải, dữ liệu mới/cũ và mất kết nối |
| ST03-LED | `7:1312` | Màu/độ sáng nháp, áp dụng, đang gửi, lỗi và khóa điều khiển |
| ST04-History | `7:1313` | Bộ lọc, giờ/ngày, đang tải, rỗng và lỗi |
| ST05-WiFi | `7:1314` | Quét/chọn mạng, lỗi và cấu hình sau khởi động lại |
| ST06-Session | `7:1315` | Đăng xuất và hết phiên |
| 40-Flowmap | `7:1316` | W01–W06, M01–M09, P01–P02 và luồng Telegram ngoài web/app |

Quy tắc thao tác và phiên được tổng hợp trong [đặc tả V3, mục 4](huong_dan_wireframe_v3.md#4-phạm-vi-màn-hình-và-hành-vi). Các tuyến mới trên canvas chưa được xác nhận là liên kết tương tác Present.

## 5. Những phần đã tinh gọn

| Phần lược bỏ | Thông tin vẫn được giữ |
| --- | --- |
| Sidebar desktop và các thẻ kết nối lặp | Masthead ngang hiển thị bốn mục, tài khoản và thời gian cập nhật |
| 10 gauge nhỏ cho nhiệt độ/CO₂, gồm cả bản báo cáo | Số, đơn vị và xu hướng; màn dữ liệu cũ giữ số lần nhận cuối |
| Khối so sánh trước/sau ở W05 | Màu nháp tại preview; màu đã gửi tại panel điều khiển |
| Tiêu đề cảnh báo lặp ở M09 | Nhãn trạng thái, thời gian và hướng dẫn xử lý |
| Nhãn Web desktop và footer giới thiệu trong W01–W02 | Tên sản phẩm và chức năng tài khoản; metadata nền tảng nằm ngoài UI |
| Ghi chú offline luôn hiện tại W05 | Trạng thái offline và quy tắc khóa lệnh tại ST03/M09 |
| Chú giải heatmap cũ | Thang số 60–70% và ký hiệu — cho dữ liệu thiếu |

Không xóa màn hình chức năng, biểu mẫu, bảng trạng thái hoặc luồng cần thiết. Nhật ký thao tác cũ đã được loại khỏi bộ bàn giao; đặc tả V3 mô tả thiết kế hiện hành.

## 6. Kiểm tra và giới hạn bàn giao

- **Nguồn:** giao diện hiện hành nằm trên Page 1; Page 2 và các component dùng chung được giữ để tham chiếu và chỉnh sửa tiếp.
- **Bố cục:** xem [layout_audit.json](wireframes-v3/layout_audit.json), đã kiểm tra lại sau nâng cấp cả nhóm responsive.
- **Màu:** đường dữ liệu #111111 đạt 18,88:1 trên trắng; heatmap giảm độ sáng đều từ thấp đến cao. Màu được hỗ trợ bằng tên, đơn vị, số, thang đo và ký hiệu thiếu dữ liệu. Đây là kiểm tra palette và các view đã rà soát, không phải chứng nhận mọi trạng thái tương tác.
- **Dữ liệu:** minh họa tại 03/11/2026 14:30; không suy diễn tăng/giảm thành tốt/xấu, không tạo ngưỡng sức khỏe cho CO₂ ước lượng.
- **Ảnh:** 25 cặp PNG/SVG chính, 2 cặp responsive và 1 cặp UI mobile dùng trong PDF. Đối chiếu kích thước/hash ở [export_verification.json](wireframes-v3/export_verification.json).
- **Luồng:** [bản thử HTML](prototype/index.html) kiểm tra được đăng ký/đăng nhập, LED, lịch sử, tài khoản và trạng thái lỗi. Native Present chưa được xác minh.
- **Bộ hiện hành:** cập nhật trực tiếp V3, không tạo bản V1/V2/V4 song song. ZIP cũ không còn trong thư mục và không phải nguồn bàn giao. Báo cáo đã thay hình tương ứng; backend không thuộc đợt này. Slider độ sáng là phần thiết kế/mô phỏng mở rộng của ID 3, cần bổ sung xử lý lệnh khi triển khai.


## 7. Bố cục bổ sung và bản thử

| Bố cục | Node | PNG | SVG |
| --- | --- | --- | --- |
| LED 320 × 844 | `43:801` | [PNG](wireframes-v3/responsive/led-320.png) | [SVG](wireframes-v3/responsive/led-320.svg) |
| LED 1024 × 1024 | `43:891` | [PNG](wireframes-v3/responsive/led-1024.png) | [SVG](wireframes-v3/responsive/led-1024.svg) |

[Bản thử tương tác](prototype/index.html) · [Hướng dẫn mở](prototype/README.md) · [Kết quả kiểm thử](wireframes-v3/prototype_verification.json).
