# Wireframe V3 — Màu sắc và tinh gọn giao diện

Ngày thiết kế 03/11/2026; tổng hợp tài liệu ngày 04/11/2026. Đã thực hiện bằng **Reqwise Figma MCP** trong **VLcCNTT → Page 1 (`0:1`)**. Đây là **đặc tả hiện hành**, gồm hệ màu, bố cục và các quy tắc thao tác tiếp tục áp dụng từ V1/V2; không cần giữ tài liệu cũ để tra cứu. Danh sách frame/ảnh và node trạng thái: [manifest V3](wireframe_v3_manifest.md).

## 1. Định hướng đã áp dụng

Giữ phong cách trắng–xám–đen của UI, dùng màu để nhận diện chỉ số, nhấn dữ liệu đang chọn và phân biệt trạng thái. Card giữ nền trắng hoặc đen; CTA chính vẫn đen/chữ trắng. Không tô toàn bộ dashboard bằng nhiều màu.

| Vai trò | Màu chính | Trên nền đen |
| --- | --- | --- |
| Độ ẩm | #2563EB | #93C5FD |
| Nhiệt độ | #C2410C | #FDBA74 |
| CO₂ ước lượng | #7C3AED | #C4B5FD |
| Kết nối/khôi phục | #166534 trên #F0FDF4 | Có chữ xác nhận kết nối |
| Dữ liệu cũ | #92400E trên #FFFBEB | Có thời gian lần nhận cuối |
| Lỗi | #991B1B trên #FEF2F2 | Có nội dung và thao tác xử lý |
| Thông tin/đang xử lý | #1D4ED8 trên #EFF6FF | Có nhãn trạng thái cụ thể |

Nền màn hình #F6F8FB; chữ chính #1F1F1F; chữ phụ #5B6472. Viền trường nhập #8793A2. Hệ màu dữ liệu tách biệt khỏi màu RGB thật của LED. Thêm 12 biến `scv3`; không thay giá trị token cũ hoặc 25 component master.

## 2. Quy tắc trực quan hóa

- Màu chỉ số nhất quán trên web, mobile và bản báo cáo; tên, số và đơn vị vẫn đọc được khi không phân biệt hue.
- Đường/vùng dùng đường màu rõ, vùng nền nhạt; điểm mới nhất có nhãn 65% trên biểu đồ độ ẩm đầy đủ.
- Cột ngày dùng nền ngữ cảnh đậm vừa phải và màu xanh cho ngày cuối đang chọn; trục bắt đầu từ 0. Nhãn mobile rút gọn ngày vì khoảng tháng đã hiện ở tiêu đề.
- Heatmap dùng dải xanh sáng → đậm, ánh xạ liên tục 60–70%, có thang số. Ô tương lai/thiếu dữ liệu mang ký hiệu —, không dùng màu thấp để giả dữ liệu.
- Giảm gauge lặp: giữ gauge độ ẩm làm điểm nhấn, thay gauge nhỏ nhiệt độ/CO₂ bằng số, đơn vị và sparkline tại view có dữ liệu lịch sử. M09 không thêm sparkline giả khi dữ liệu cũ.
- Tăng cỡ nhãn trục và giá trị trên biểu đồ mobile để đọc tốt hơn; không chồng ba đơn vị °C, %, ppm trên cùng một trục.
- Bảng W06 căn phải số, có đơn vị ở header, phân biệt hàng nhẹ và nhấn bản ghi mới nhất; ba hàng theo thứ tự 14:30, 10:30, 06:30.
- Tăng/giảm biểu thị xu hướng, không tự mang nghĩa tốt/xấu. CO₂ luôn ghi ước lượng/tham khảo; không thêm ngưỡng sức khỏe.

## 3. Tinh gọn nội dung

Đã bỏ card trạng thái kết nối lặp trong bốn sidebar; mười gauge nhỏ, khối so sánh màu trùng ở LED, tiêu đề cảnh báo trùng ở M09, nhãn nền tảng và footer chung trong auth, cùng ghi chú offline không phù hợp khi trang LED đang online. Chú giải heatmap cũ được thay bằng thang số.

Vẫn giữ số đo, đơn vị, lần cập nhật, màu nháp/màu đã gửi, hướng dẫn xử lý lỗi và các điểm điều hướng. Không xóa chức năng hoặc màn hình cần thiết. Danh sách node và số lượng trong [cleanup_log.json](wireframes-v3/cleanup_log.json).

## 4. Phạm vi màn hình và hành vi

Giữ **6 màn web W01–W06, 9 màn app M01–M09, 2 trang WiFi P01–P02**, 6 bảng trạng thái/33 đoạn minh họa, flow map và 8 board báo cáo. Frame UI và các form/điều khiển gốc giữ ID.

- ID 1: độ ẩm/nhiệt độ; ID 2: CO₂ ước lượng; ID 3: LED; ID 4: lưu dữ liệu phía hệ thống; ID 5: xem lịch sử; ID 8: tài khoản/phiên; ID 9: website; ID 10: WiFi. Telegram 6–7 vẫn ở luồng ngoài.
- LED bật/tắt gửi ngay; chọn màu là bản nháp, Áp dụng màu mới gửi. Vàng #EAB308 tương ứng RGB 234/179/8; màu đã gửi gần nhất #3B82F6. Không đánh đồng gửi yêu cầu với xác nhận phần cứng.
- Mất kết nối: giữ số lần nhận cuối, đánh dấu dữ liệu cũ, khóa gửi lệnh LED; lịch sử đã lưu còn xem được khi hệ thống truy cập được.
- P02 chỉ xác nhận đã nhận cấu hình, sau đó cần kiểm tra thiết bị trở lại online.
- Định tuyến/state map đã có được giữ; đợt chỉnh màu không thêm liên kết Present mới.

### 4.1. Quy ước chung

- Demo một phòng, một ESP32; web/app dùng chung tài khoản và dữ liệu. Chưa có chọn nhiều phòng, phân quyền hoặc ghép thiết bị với từng tài khoản.
- Web 1440 × 1024; app/portal 390 × 844 px. Font Inter; nội dung 16 px, chú thích 14 px. Card bo góc 16 px, padding thường 16–24 px; nút/input bo góc 12 px, cao 48 px, CTA mobile 52 px; vùng chạm tối thiểu 44 px. Hệ màu hiện hành theo mục 1.
- Web có Tổng quan / Lịch sử / Đèn LED / Cảm biến; app có ba tab Giám sát / Đèn LED / Lịch sử. Chuyển tab giữ bộ lọc và màu nháp trong phiên. Màn hình tài khoản chưa có tab; portal nằm ngoài app và không yêu cầu đăng nhập.
- Nội dung tiếng Việt; thời gian `dd/mm/yyyy HH:mm`, UTC+7. Chú thích ID chức năng đặt ngoài UI; ID 4 là lưu dữ liệu tự động phía hệ thống, không phải nút lưu cảm biến. Telegram 6–7 là luồng ngoài, không thêm trang chatbot trong app.

### 4.2. Tài khoản và phiên — ID 8

- Đăng nhập dùng tài khoản/mật khẩu; đăng ký thêm xác nhận mật khẩu. Trường bắt buộc, mật khẩu tối thiểu 8 ký tự theo quy ước thiết kế, xác nhận trùng; lỗi hiển thị dưới trường. Tài khoản trùng báo **Tên tài khoản đã tồn tại**.
- Sai đăng nhập báo **Tài khoản hoặc mật khẩu không đúng** ở đầu form. Trong lúc gửi, nút có nhãn đang xử lý và khóa gửi lặp.
- Đăng ký thành công trở về W01/M01, điền sẵn tài khoản và thông báo yêu cầu đăng nhập; không tự đăng nhập. Đăng nhập thành công hoặc có phiên hợp lệ mở W03/M03.
- Đăng xuất hoặc hết phiên trở về W01/M01, xóa phiên và ngăn quay lại nội dung cần đăng nhập. Hết phiên có thông báo yêu cầu đăng nhập lại. Không bổ sung OTP, đăng nhập xã hội, quên mật khẩu hoặc trang hồ sơ trong bộ wireframe này.

### 4.3. Cảm biến và độ mới dữ liệu — ID 1–2

- Hiển thị số, đơn vị và thời điểm cập nhật; chưa nhận dữ liệu dùng `—`, không dùng số 0. Dữ liệu cũ giữ giá trị lần nhận cuối kèm nhãn; lỗi một cảm biến chỉ đánh dấu card tương ứng.
- Phân biệt mất kết nối hệ thống, thiết bị chưa gửi bản tin mới và lịch sử rỗng. Mốc quá 30 giây chưa nhận bản tin chỉ là ví dụ trạng thái cũ, cần đồng bộ với chu kỳ gửi khi triển khai.
- CO₂ luôn có nhãn **ước lượng/tham khảo**: MQ-135 không đo trực tiếp CO₂. Thang minh họa không phải ngưỡng sức khỏe hoặc giới hạn đo đã hiệu chuẩn.

### 4.4. Điều khiển LED — ID 3

- Bật/tắt gửi ngay; bật lại dùng màu đã áp dụng gần nhất. Khi tắt, giữ màu đó và khóa chọn/áp dụng màu với hướng dẫn **Bật đèn để chọn màu**.
- Bảng màu gồm Đỏ `#EF4444`, Lục `#22C55E`, Lam `#3B82F6`, Vàng `#EAB308`, Trắng `#FFFFFF`; có ô HEX `#RRGGBB`. Màu chọn có tên và viền. HEX sai báo dưới trường và khóa áp dụng.
- Chọn màu chỉ đổi bản nháp/xem trước. **Áp dụng màu** chỉ bật khi màu hợp lệ khác màu đã gửi gần nhất. Đang gửi thì hiện trạng thái và tạm khóa công tắc/thao tác màu.
- Hệ thống chấp nhận lệnh thì báo **Đã gửi lệnh**, chưa coi là xác nhận phần cứng. Gửi lỗi thì trả công tắc về yêu cầu thành công trước đó, giữ màu nháp để thử lại. Thiết bị chưa sẵn sàng thì khóa điều khiển và hướng dẫn chờ kết nối.

### 4.5. Lịch sử — ID 5, dữ liệu từ ID 4

- Mặc định Độ ẩm / 24 giờ qua / Theo giờ. Mỗi biểu đồ chỉ vẽ một chỉ số, có đơn vị; lựa chọn gồm Độ ẩm, Nhiệt độ và CO₂ ước lượng.
- Khoảng thời gian gồm 24 giờ qua / 7 ngày qua / Tùy chọn. Hai preset tự tải, mặc định lần lượt Theo giờ / Theo ngày; vẫn cho đổi chế độ. Theo ngày dùng trung bình ngày.
- Tùy chọn có Từ ngày, Đến ngày và **Xem lịch sử**; ngày bắt đầu không sau ngày kết thúc. Sửa ngày đánh dấu **Chưa áp dụng**; biểu đồ còn lại ghi đúng khoảng đã áp dụng cho đến khi gửi bộ lọc mới.
- Đổi chỉ số/chế độ với bộ lọc hợp lệ sẽ tải lại. Trong lúc tải thay vùng chart bằng trạng thái tải, không gắn dữ liệu cũ với nhãn bộ lọc mới. Rỗng có hướng dẫn đổi khoảng; lỗi truy vấn có **Thử lại**; lỗi ngày ở dưới bộ lọc.

### 4.6. WiFi — ID 10

- Cắm điện → điện thoại kết nối WiFi ESP32 → P01 trong trình duyệt → chọn mạng, nhập mật khẩu → **Lưu và kết nối** → P02 xác nhận nhận cấu hình → ESP32 khởi động lại → điện thoại về mạng thường dùng → mở web/app và kiểm tra dữ liệu trên W03/M03.
- Có **Quét lại**, hiện/ẩn mật khẩu và trạng thái quét/rỗng/lỗi. Trong khi kết nối khóa gửi lặp; thất bại giữ mạng đã chọn để sửa và thử lại. SSID thiết bị và địa chỉ portal phải theo firmware.
- Portal có thể mất kết nối khi ESP32 khởi động lại; việc portal đóng không chứng minh thiết bị đã online. Hướng dẫn đổi mạng dùng thao tác vật lý giữ BOOT khoảng 5 giây theo đặc tả; không thêm xóa cấu hình từ xa, Bluetooth hoặc QR.

### 4.7. Trạng thái và điều hướng

Sáu bảng ST01–ST06 tiếp tục mô tả tài khoản, telemetry, LED, lịch sử, WiFi và phiên. Tra node ID trực tiếp trong [manifest V3](wireframe_v3_manifest.md#4-trạng-thái-và-luồng). Đăng ký đi W01 → W02 → W01 hoặc M01 → M02 → M01; đăng nhập vào W03/M03; đăng xuất/hết phiên quay về màn đăng nhập. Sơ đồ luồng bao quát W01–W06, M01–M09 và P01–P02; các tuyến được mô tả trên canvas, chưa xác nhận đã nối tương tác Present.

## 5. Dữ liệu và kiểm tra

Dữ liệu minh họa tại 03/11/2026 14:30, UTC+7. Bảy mẫu độ ẩm: 61, 62, 64, 66, 65, 64, 65%; trung bình 63,9%, min 61%, max 66%, thay đổi +4 điểm phần trăm. Trung bình ngày 28/10–03/11: 64, 63, 65, 67, 66, 64, 64,5%; trung bình các ngày 64,8%. Ngày 03/11 chưa kết thúc.

- Bảy mốc cách nhau 4 giờ: 02/11 14:30, 18:30, 22:30; 03/11 02:30, 06:30, 10:30, 14:30. Nhiệt độ: 26,8; 27,0; 27,1; 27,4; 27,7; 27,6; 27,5°C. CO₂ ước lượng: 720, 750, 810, 840, 870, 860, 850 ppm. Web/app dùng cùng bộ số minh họa.
- Phân bố độ ẩm: 60–62% có 2 mẫu; 63–64% có 2 mẫu; 65–66% có 3 mẫu. Heatmap ngày 03/11 để trống ô 16h/20h. Các giá trị là dữ liệu minh họa, không phải kết quả đo thực tế.

- Sáu nhóm Page 1: 4399 node con, 0 lỗi tràn khung/cắt chữ/clipping.
- Màu dữ liệu chính trên trắng: xanh 5,17:1, cam 5,18:1, tím 5,70:1; viền input 3,12:1. Dải heatmap có độ sáng giảm đều. Xem [color_audit.json](wireframes-v3/color_audit.json).
- Các view đại diện về auth, giám sát, LED, bảng, phân tích, dữ liệu cũ, WiFi và báo cáo đã được kiểm tra qua ảnh xuất.
- Board báo cáo: 300 node chữ, cỡ nhỏ nhất khoảng 9,16 pt khi in rộng 15 cm.
- Page 2: đối chiếu 817 node khớp trước/sau; 25 component master giữ nguyên.
- Bàn giao 17 cặp PNG/SVG màn hình, 8 cặp PNG/SVG báo cáo; nguồn Figma native vẫn chỉnh sửa được. Bộ ảnh, ZIP, manifest và kế hoạch V1/V2 đã được loại bỏ ngày 04/11/2026; các quy tắc còn áp dụng được tổng hợp tại mục 4.

## 6. Quan hệ với thuyết minh

[Thuyết minh hiện tại](thuyet_minh.tex) vẫn mô tả website và ba khung hình chờ; bước đồng bộ/chèn ảnh chưa hoàn thành. Khi làm báo cáo, dùng tám board V3 trong manifest, cập nhật mô tả web/app/portal, bảng ID chức năng ở mục 2.2 và phân công ở mục 3.2 theo phạm vi thực tế. Không thêm ID hoặc tính điểm chỉ vì có app. Sau khi chèn hình cần biên dịch và xem PDF ở kích thước in; đợt dọn tệp này không thay nội dung thuyết minh.

