# Chỉ mục thiết kế hiện hành — VLcCNTT

**Page 1 (`0:1`)**, cập nhật trực tiếp ngày 04/11/2026 bằng Reqwise Figma MCP. **35 màn: 14 web, 19 mobile, 2 WiFi**; 9 board báo cáo. 18 màn mới là W07–W14 và M10–M19. Page 2 giữ làm tham chiếu.

[Thư viện xem ảnh](wireframes-v3/index.html) · [Prototype](prototype/index.html) · [Đặc tả và đối chiếu ID 1–10](huong_dan_wireframe_v3.md)

## Vị trí trên Page 1

| Nhóm | Node | Vị trí / nội dung |
| --- | --- | --- |
| 00-Foundations | `6:154` | Thành phần và token tham chiếu |
| 10-Web | `6:444` | y=1320; 14 màn, 3 cột |
| 20-App | `6:772` | y=9300; 19 màn, 5 cột |
| 30-WiFi | `6:1227` | y=15500; 2 trang portal |
| 40-States-Flows | `7:1306` | y=16970; 6 bảng/33 trạng thái và luồng mở rộng 35 màn |
| 50-Report | `8:1880` | y=23170; 9 board |
| 60-Responsive-Interaction | `43:798` | Bên phải nhóm web; LED 320/1024 px |

MCP không cung cấp fileKey/URL của file. Mở **VLcCNTT → Page 1**, tìm nhóm/tên màn hoặc node dưới đây. Màn đã có giữ nguyên root UI; màn mới có node native thật.

## 35 màn hình

Kích thước dưới đây là **wrapper gồm UI và chú thích**, không phải viewport. UI web rộng 1440 px; mobile/portal rộng 390 px. Các màn cao thể hiện toàn bộ nội dung cuộn. PNG xuất 2×.

| Mã | Nội dung | Node UI | Node wrapper | Wrapper logic | Ảnh |
| --- | --- | --- | --- | --- | --- |
| M01 | Đăng nhập mobile | `6:783` | `6:776` | 698×996 | [PNG 2×](wireframes-v3/screens/wireframe-app-login.png) · [SVG](wireframes-v3/screens/wireframe-app-login.svg) |
| M02 | Đăng ký mobile | `6:792` | `6:777` | 698×996 | [PNG 2×](wireframes-v3/screens/wireframe-app-register.png) · [SVG](wireframes-v3/screens/wireframe-app-register.svg) |
| M03 | Giám sát phòng học | `6:801` | `6:778` | 698×1232 | [PNG 2×](wireframes-v3/screens/wireframe-app-overview.png) · [SVG](wireframes-v3/screens/wireframe-app-overview.svg) |
| M04 | Điều khiển LED | `6:812` | `6:779` | 698×996 | [PNG 2×](wireframes-v3/screens/wireframe-app-led.png) · [SVG](wireframes-v3/screens/wireframe-app-led.svg) |
| M05 | Lịch sử cảm biến | `6:821` | `6:780` | 698×1232 | [PNG 2×](wireframes-v3/screens/wireframe-app-history.png) · [SVG](wireframes-v3/screens/wireframe-app-history.svg) |
| M06 | Chi tiết độ ẩm | `23:5595` | `23:5745` | 698×1232 | [PNG 2×](wireframes-v3/screens/wireframe-app-humidity-detail.png) · [SVG](wireframes-v3/screens/wireframe-app-humidity-detail.svg) |
| M07 | Màu tùy chỉnh | `23:5758` | `23:5809` | 698×996 | [PNG 2×](wireframes-v3/screens/wireframe-app-color-picker.png) · [SVG](wireframes-v3/screens/wireframe-app-color-picker.svg) |
| M08 | Phân tích theo ngày | `23:5827` | `23:5942` | 698×1392 | [PNG 2×](wireframes-v3/screens/wireframe-app-daily-analytics.png) · [SVG](wireframes-v3/screens/wireframe-app-daily-analytics.svg) |
| M09 | Dữ liệu cũ và kết nối | `23:5955` | `23:6067` | 698×996 | [PNG 2×](wireframes-v3/screens/wireframe-app-connection-state.png) · [SVG](wireframes-v3/screens/wireframe-app-connection-state.svg) |
| M10 | Chi tiết nhiệt độ | `62:5234` | `62:5233` | 698×1232 | [PNG 2×](wireframes-v3/screens/wireframe-app-temperature-detail.png) · [SVG](wireframes-v3/screens/wireframe-app-temperature-detail.svg) |
| M11 | CO₂ ước lượng | `62:5332` | `62:5331` | 698×1232 | [PNG 2×](wireframes-v3/screens/wireframe-app-co2-detail.png) · [SVG](wireframes-v3/screens/wireframe-app-co2-detail.svg) |
| M12 | Bản ghi cảm biến | `62:5428` | `62:5427` | 698×1232 | [PNG 2×](wireframes-v3/screens/wireframe-app-records.png) · [SVG](wireframes-v3/screens/wireframe-app-records.svg) |
| M13 | Bộ lọc thời gian | `62:5497` | `62:5496` | 698×996 | [PNG 2×](wireframes-v3/screens/wireframe-app-date-filter.png) · [SVG](wireframes-v3/screens/wireframe-app-date-filter.svg) |
| M14 | Chi tiết ngày 03/11 | `62:5538` | `62:5537` | 698×1232 | [PNG 2×](wireframes-v3/screens/wireframe-app-day-detail.png) · [SVG](wireframes-v3/screens/wireframe-app-day-detail.svg) |
| M15 | Thiết bị & kết nối | `62:5609` | `62:5608` | 698×1232 | [PNG 2×](wireframes-v3/screens/wireframe-app-device.png) · [SVG](wireframes-v3/screens/wireframe-app-device.svg) |
| M16 | Kết nối Telegram | `62:5659` | `62:5658` | 698×1292 | [PNG 2×](wireframes-v3/screens/wireframe-app-telegram.png) · [SVG](wireframes-v3/screens/wireframe-app-telegram.svg) |
| M17 | Hội thoại Telegram minh họa | `62:5700` | `62:5699` | 698×1232 | [PNG 2×](wireframes-v3/screens/wireframe-app-telegram-demo.png) · [SVG](wireframes-v3/screens/wireframe-app-telegram-demo.svg) |
| M18 | Tài khoản & phiên | `62:5741` | `62:5740` | 698×996 | [PNG 2×](wireframes-v3/screens/wireframe-app-account.png) · [SVG](wireframes-v3/screens/wireframe-app-account.svg) |
| M19 | Phiên hết hạn | `62:5776` | `62:5775` | 698×996 | [PNG 2×](wireframes-v3/screens/wireframe-app-session-expired.png) · [SVG](wireframes-v3/screens/wireframe-app-session-expired.svg) |
| P01 | Portal cấu hình WiFi | `6:1235` | `6:1231` | 698×996 | [PNG 2×](wireframes-v3/screens/wireframe-wifi-portal.png) · [SVG](wireframes-v3/screens/wireframe-wifi-portal.svg) |
| P02 | Đã nhận cấu hình WiFi | `23:6131` | `23:6163` | 698×996 | [PNG 2×](wireframes-v3/screens/wireframe-wifi-received.png) · [SVG](wireframes-v3/screens/wireframe-wifi-received.svg) |
| W01 | Đăng nhập web | `6:453` | `6:448` | 1768×1176 | [PNG 2×](wireframes-v3/screens/wireframe-web-login.png) · [SVG](wireframes-v3/screens/wireframe-web-login.svg) |
| W02 | Đăng ký web | `6:462` | `6:449` | 1768×1176 | [PNG 2×](wireframes-v3/screens/wireframe-web-register.png) · [SVG](wireframes-v3/screens/wireframe-web-register.svg) |
| W03 | Tổng quan phòng học | `6:471` | `6:450` | 1768×1432 | [PNG 2×](wireframes-v3/screens/wireframe-web-dashboard.png) · [SVG](wireframes-v3/screens/wireframe-web-dashboard.svg) |
| W04 | Lịch sử & phân tích | `21:4414` | `21:4663` | 1768×1472 | [PNG 2×](wireframes-v3/screens/wireframe-web-analytics.png) · [SVG](wireframes-v3/screens/wireframe-web-analytics.svg) |
| W05 | Điều khiển LED | `21:4681` | `21:4784` | 1768×1232 | [PNG 2×](wireframes-v3/screens/wireframe-web-led.png) · [SVG](wireframes-v3/screens/wireframe-web-led.svg) |
| W06 | Chi tiết độ ẩm | `21:4797` | `21:5015` | 1768×1352 | [PNG 2×](wireframes-v3/screens/wireframe-web-humidity-detail.png) · [SVG](wireframes-v3/screens/wireframe-web-humidity-detail.svg) |
| W07 | Chi tiết nhiệt độ | `62:4456` | `62:4455` | 1768×1352 | [PNG 2×](wireframes-v3/screens/wireframe-web-temperature-detail.png) · [SVG](wireframes-v3/screens/wireframe-web-temperature-detail.svg) |
| W08 | CO₂ ước lượng | `62:4588` | `62:4587` | 1768×1352 | [PNG 2×](wireframes-v3/screens/wireframe-web-co2-detail.png) · [SVG](wireframes-v3/screens/wireframe-web-co2-detail.svg) |
| W09 | Phân tích theo ngày | `62:4718` | `62:4717` | 1768×1312 | [PNG 2×](wireframes-v3/screens/wireframe-web-daily-analytics.png) · [SVG](wireframes-v3/screens/wireframe-web-daily-analytics.svg) |
| W10 | Bản ghi cảm biến | `62:4868` | `62:4867` | 1768×1272 | [PNG 2×](wireframes-v3/screens/wireframe-web-records.png) · [SVG](wireframes-v3/screens/wireframe-web-records.svg) |
| W11 | Thiết bị & kết nối | `62:4957` | `62:4956` | 1768×1272 | [PNG 2×](wireframes-v3/screens/wireframe-web-device.png) · [SVG](wireframes-v3/screens/wireframe-web-device.svg) |
| W12 | Kết nối Telegram | `62:5032` | `62:5031` | 1768×1272 | [PNG 2×](wireframes-v3/screens/wireframe-web-telegram.png) · [SVG](wireframes-v3/screens/wireframe-web-telegram.svg) |
| W13 | Tài khoản & phiên | `62:5099` | `62:5098` | 1768×1176 | [PNG 2×](wireframes-v3/screens/wireframe-web-account.png) · [SVG](wireframes-v3/screens/wireframe-web-account.svg) |
| W14 | Chi tiết ngày 03/11 | `62:5149` | `62:5148` | 1768×1312 | [PNG 2×](wireframes-v3/screens/wireframe-web-day-detail.png) · [SVG](wireframes-v3/screens/wireframe-web-day-detail.svg) |

M17 là hội thoại Telegram bên ngoài được minh họa để thể hiện ID 6–7; không phải màn của client Telegram do đồ án triển khai.

## 9 board báo cáo

| Mã | Nội dung | Node UI | Node board | Kích thước logic | Ảnh |
| --- | --- | --- | --- | --- | --- |
| R01 | Tài khoản web | — | `8:1884` | 1000×1180 | [PNG 3×](wireframes-v3/reports/report-wireframe-web-auth.png) · [SVG](wireframes-v3/reports/report-wireframe-web-auth.svg) |
| R02 | Giám sát và LED | — | `8:1885` | 1000×1456 | [PNG 3×](wireframes-v3/reports/report-wireframe-web-monitor-led.png) · [SVG](wireframes-v3/reports/report-wireframe-web-monitor-led.svg) |
| R03 | Lịch sử và phân tích | — | `8:1886` | 1000×1640 | [PNG 3×](wireframes-v3/reports/report-wireframe-web-analytics.png) · [SVG](wireframes-v3/reports/report-wireframe-web-analytics.svg) |
| R04 | Tài khoản mobile | — | `8:1887` | 1000×1180 | [PNG 3×](wireframes-v3/reports/report-wireframe-app-auth.png) · [SVG](wireframes-v3/reports/report-wireframe-app-auth.svg) |
| R05 | Giám sát mobile | — | `8:1888` | 650×1240 | [PNG 3×](wireframes-v3/reports/report-wireframe-app-overview.png) · [SVG](wireframes-v3/reports/report-wireframe-app-overview.svg) |
| R06 | LED trên mobile | — | `8:1889` | 650×1000 | [PNG 3×](wireframes-v3/reports/report-wireframe-app-led.png) · [SVG](wireframes-v3/reports/report-wireframe-app-led.svg) |
| R07 | Phân tích ngày trên mobile | — | `8:1890` | 1000×1400 | [PNG 3×](wireframes-v3/reports/report-wireframe-app-daily-analytics.png) · [SVG](wireframes-v3/reports/report-wireframe-app-daily-analytics.svg) |
| R08 | Cấu hình WiFi | — | `8:1891` | 650×1000 | [PNG 3×](wireframes-v3/reports/report-wireframe-wifi.png) · [SVG](wireframes-v3/reports/report-wireframe-wifi.svg) |
| R09 | Thiết bị và Telegram | — | `62:6241` | 1000×1320 | [PNG 3×](wireframes-v3/reports/report-wireframe-connection-telegram.png) · [SVG](wireframes-v3/reports/report-wireframe-connection-telegram.svg) |

R03 được dựng lại cho trục giờ/ngày, cột gốc 0 và heatmap có thang số. R05/R07 cập nhật theo mobile mới. R09 bổ sung thiết bị, WiFi và Telegram. Bản copy PNG dùng trong PDF nằm ở `images/wireframes/`.

## Trạng thái và luồng

| Bảng | Node | Phạm vi |
| --- | --- | --- |
| ST01-Auth | `7:1310` | Nhập liệu, gửi và lỗi tài khoản |
| ST02-Telemetry | `7:1311` | Tải, dữ liệu mới/cũ, mất kết nối |
| ST03-LED | `7:1312` | Bản nháp, gửi, lỗi và khóa điều khiển |
| ST04-History | `7:1313` | Bộ lọc, giờ/ngày, tải/rỗng/lỗi |
| ST05-WiFi | `7:1314` | Chọn mạng, lỗi và khởi động lại |
| ST06-Session | `7:1315` | Đăng xuất và hết phiên |
| 40-Flowmap | `7:1316` | Đã bổ sung nhánh cảm biến, bản ghi/ngày, kết nối/Telegram và phiên của 35 màn |

Bốn mục desktop và ba tab mobile được giữ gọn; các trang mới đi từ liên kết trong nội dung/tài khoản. Prototype thử được các luồng; native Present chưa được xác minh.

## Nguồn ảnh và kiểm tra

- [assets.json](wireframes-v3/assets.json): nguồn node native và metadata. Không có node giả từ bộ dựng SVG tạm.
- [export_verification.json](wireframes-v3/export_verification.json): 47 cặp = 35 màn + 9 report + 2 responsive + 1 UI mobile; kích thước/hash và ảnh copy báo cáo đều khớp.
- [layout_audit.json](wireframes-v3/layout_audit.json): sáu nhóm được kiểm tra, không có lỗi bounds/clipping/truncation. Style hints được đọc và đối chiếu trực quan.
- [prototype_verification.json](wireframes-v3/prototype_verification.json): 128 kiểm tra, gồm chart/đơn vị/mốc 00:00/phần thiếu, bàn phím, LED, phiên, Telegram minh họa và responsive.
- SVG dùng chữ outline. Sửa chữ ở Figma rồi xuất lại. Nguồn dựng nhóm nâng cấp nằm tại `tools/wireframes/`.
- Cập nhật trực tiếp bộ V3; không tạo bộ phiên bản song song. Dữ liệu/lệnh trong HTML là mô phỏng; slider độ sáng cần tích hợp backend/ESP32.
