# Kế hoạch thiết kế giao diện — Smart Classroom (Nhóm 16)

**Phương án "Room Instrument"** — do Claude lập, độc lập với bộ V3 của Codex.
Ngày lập: 06/11/2026 · Phạm vi: website **desktop + mobile**, kèm trang cấu hình WiFi của ESP32 · Trạng thái: **chỉ là kế hoạch, chưa vẽ gì**.

> Công cụ dự kiến khi thực thi: skill `ui-ux-pro-max` (kiểm tra design system, UX, accessibility, chọn kiểu biểu đồ) + MCP `reqwise-figma` (dựng file Figma). Khả năng ghi của MCP chưa được kiểm chứng, nên bước đầu tiên của lộ trình là một lượt thử (mục 12.3).

---

## 0. Tóm tắt một trang

- **Bài toán thật:** một hộp IoT 160 × 100 × 60 mm đặt trong phòng học, đo độ ẩm / nhiệt độ (DHT22), CO₂ ước lượng (MQ-135), điều khiển đèn LED RGB WS2812 (8 bóng), cảnh báo qua Telegram. Website tự xây (HTML/CSS/JS + Chart.js, backend Node.js) phục vụ giảng viên, sinh viên và **người không chuyên**.
- **Ý tưởng chủ đạo:** *website là mặt đồng hồ của chính chiếc hộp.* Giao diện được thiết kế như một dụng cụ đo: bản vẽ kỹ thuật của hộp nằm ngay trung tâm, cửa sổ LED 8 bóng trên hộp trở thành họa tiết xuyên suốt, số liệu hiển thị bằng chữ số dạng ma trận chấm và mặt đồng hồ (gauge) có vạch chia.
- **Màu:** trắng – đen – xám thân hộp (đúng màu nắp đen / thân xám nhạt trong ảnh 3D). Màu thật chỉ xuất hiện ở nơi nó mang thông tin: màu đèn LED đang chọn.
- **Điểm khác biệt chính so với V3 (theo mô tả trong `huong_dan_wireframe_v3.md`):** (1) gauge cho cả 3 chỉ số, đúng thuyết minh; (2) không thêm chức năng ngoài 10 ID; (3) có "bản sao số" của hộp làm trung tâm giao diện; (4) phong cách thị giác khác hẳn (không card bo tròn, không masthead ngang).
- **Quy mô:** ≈ 55 khung hình (desktop ≈ 17, mobile ≈ 19, portal WiFi 4, trạng thái ≈ 15) chia thành 3 mức ưu tiên, 4 cổng duyệt.

---

## 1. Căn cứ: yêu cầu thực sự rút từ các PDF

**Đã đọc:** thuyết minh nhóm 16 (`16_24127261_24127542_24127581_PROPOSAL.pdf`, các trang mô tả chức năng, hộp 3D, sơ đồ luồng, linh kiện, kế hoạch), `TCTA_QUY ĐỊNH ĐỒ ÁN CUỐI KỲ.pdf`, `TCTA_YÊU CẦU THUYẾT MINH DỰ ÁN.pdf`.
**Chưa đọc:** `Phu_luc_A_MQ135.pdf` (chi tiết hiệu chuẩn) và các trang wireframe V3 trong mục 2.2 của thuyết minh (cố ý bỏ qua để không bị ảnh hưởng).

### 1.1 Mười chức năng mà giao diện phải phục vụ

| ID | Chức năng | Giao diện phải thể hiện được |
|---|---|---|
| 1 | DHT22 → ESP32 → MQTT → Backend → WebSocket → Frontend | **Độ ẩm và nhiệt độ, dạng text và gauge**, thời gian thực |
| 2 | MQ-135 → … → Frontend | **CO₂ ước lượng (ppm), dạng text và gauge**; luôn ghi "ước lượng / tham khảo" |
| 3 | Frontend → Backend → MQTT → ESP32 → LED WS2812 | **Chọn màu và bật/tắt đèn** |
| 4 | Backend ghi giá trị + thời gian vào Firestore | Không có màn riêng; chỉ cần thông tin "dữ liệu được lưu tự động" và mốc thời gian |
| 5 | Backend truy vấn Firestore → Chart.js | **Chọn khoảng thời gian, biểu đồ nhiệt độ / độ ẩm / CO₂ theo giờ hoặc theo ngày** |
| 6 | Telegram: `/start` ghi nhận người nhận; cảnh báo khi độ ẩm **> 85% hoặc < 30%**; có khoảng nghỉ giữa hai lần báo | Hướng dẫn liên kết, quy tắc cảnh báo, trạng thái |
| 7 | Lệnh `/doam`, `/trangthai` | Danh sách lệnh và ví dụ câu trả lời |
| 8 | Đăng ký / đăng nhập, mật khẩu băm, SQLite, phiên đăng nhập | **Chỉ người đã đăng nhập mới xem số liệu và điều khiển LED** |
| 9 | Tự xây Node.js + Express, HTML/CSS/JS, không NodeRED | Toàn bộ website; giao diện phải làm được bằng HTML/CSS/JS thuần + Chart.js |
| 10 | WiFiManager: ESP32 phát WiFi riêng, trang cấu hình, giữ nút BOOT ~5 giây để xóa cấu hình | Trang cấu hình WiFi trên điện thoại; hướng dẫn đổi WiFi trên website |

### 1.2 Ràng buộc từ quy định

1. **Mọi thành phần trong bản vẽ phải gắn với một ID chức năng, và phải ghi chú rõ từng vùng thuộc ID nào** (yêu cầu mục 2.2 của thuyết minh). → Mỗi khung hình có lớp chú thích ID; không có thành phần "trang trí chức năng".
2. **Cuối kỳ chỉ được điều chỉnh tối đa một chức năng.** → Không đưa thêm chức năng ngoài 10 ID (không email, không AI/dự đoán, không nhiều phòng, không điều khiển từng bóng LED, không xuất báo cáo…).
3. **Gauge được tính điểm riêng** (ID 5: text 0,5 / gauge 1,0 / chart 1,5) và thuyết minh nêu rõ ID 1, 2 hiển thị "text và gauge". → Cả 3 chỉ số đều có gauge **và** số.
4. **Ảnh phải rõ ràng, đọc được khi in** (yêu cầu định dạng báo cáo). → Có bộ "bảng báo cáo" xuất riêng, chữ tối thiểu theo khổ A4, an toàn khi in đen trắng.
5. **Sản phẩm thật, đóng hộp gần tương đồng thiết kế** → giao diện bám sát hình khối và nhãn vị trí của hộp (A: ESP32, B: DHT22, C: MQ-135, D: LED, E: nút BOOT).
6. **Người không chuyên tự cài đặt qua giao diện** (mục 1.4): 3 bước — kết nối WiFi (ID 10), tạo tài khoản (ID 8), kết nối Telegram (ID 6, 7).

### 1.3 Chi tiết từ thuyết minh dùng làm chất liệu thiết kế

- Hộp: nắp đen dày 2,4 mm, thân xám nhạt; chữ trên nắp **"SMART CLASSROOM / ROOM ENVIRONMENT MONITOR"**; cửa sổ LED hình chữ nhật ở **mặt trước**; khe gió trái (DHT22) và phải (MQ-135); cổng USB mặt sau; lỗ bấm BOOT trên nắp; 4 vít M3.
- Thanh LED có **8 bóng** → họa tiết "8 ô" xuyên suốt giao diện.
- MQ-135 cần **làm nóng khoảng 2 ngày và hiệu chuẩn R₀** → có trạng thái "đang làm nóng / chưa hiệu chuẩn" cho gauge CO₂.
- Dữ liệu chảy qua WebSocket → cần thể hiện **tình trạng kết nối và độ mới của dữ liệu**.
- Demo chạy trên laptop của nhóm; thực tế sẽ chạy trên VPS → cần đọc rõ khi chiếu màn hình.
- Trang cấu hình WiFi: điện thoại đang nối vào WiFi riêng của ESP32, **không có internet** → trang này không được tải font, ảnh, script từ bên ngoài.

### 1.4 Điểm lệch cần tránh (so với mô tả V3)

| Điểm | V3 (theo mô tả) | Yêu cầu trong PDF | Xử lý trong kế hoạch này |
|---|---|---|---|
| Gauge | Chỉ độ ẩm; nhiệt độ/CO₂ là số lớn + xu hướng | ID 1, 2: text **và** gauge | Gauge cho cả 3 |
| Độ sáng LED | Slider độ sáng, ghi là "đề xuất mở rộng ID 3" | ID 3: chọn màu, bật/tắt | Không có slider; chọn màu đã bao hàm sắc độ |
| Trang phụ | Có trang bản ghi, hội thoại Telegram mô phỏng… | Mọi thành phần phải thuộc ID 1–10 | Chỉ giữ thứ gắn được với một ID (mục 6) |

---

## 2. Người dùng và kịch bản

| Vai trò | Bối cảnh | Việc cần làm nhất |
|---|---|---|
| **Giảng viên / người quản lý phòng** | Điện thoại cầm một tay, hoặc laptop trên bục | Nhìn nhanh phòng có ổn không; bật đèn báo hiệu; nhận cảnh báo |
| **Sinh viên / người trực phòng** | Điện thoại | Xem số liệu, hỏi nhanh bot Telegram |
| **Người cài đặt lần đầu (không chuyên)** | Vừa cắm điện thiết bị | Nối WiFi → tạo tài khoản → liên kết Telegram mà không cần đọc tài liệu |
| **Giám khảo / nhà đầu tư (demo)** | Màn chiếu, 5–10 phút | Hiểu sản phẩm trong 5 giây đầu; thấy luồng dữ liệu thật |

Năm kịch bản chính (job stories):
1. *Khi bước vào phòng*, tôi muốn thấy ngay độ ẩm, nhiệt độ, CO₂ và thiết bị còn hoạt động không.
2. *Khi cần báo hiệu*, tôi muốn chọn màu đèn và bật/tắt trong dưới 3 thao tác.
3. *Khi nghi phòng ẩm*, tôi muốn xem độ ẩm 24 giờ / 7 ngày qua so với ngưỡng 30% – 85%.
4. *Khi vừa mua thiết bị*, tôi muốn được dẫn từng bước đến lúc nhận được tin Telegram đầu tiên.
5. *Khi đổi sang WiFi mới*, tôi muốn biết phải giữ nút nào, bao lâu, và thiết bị đang ở trạng thái gì.

---

## 3. Ý tưởng chủ đạo: "Room Instrument"

> Một căn phòng cũng cần một dụng cụ đo. Giao diện không *mô tả* chiếc hộp — nó *là* mặt đồng hồ của chiếc hộp.

### 3.1 Sáu yếu tố nhận diện (signature)

1. **Bản sao số của hộp (Device Twin).** Bản vẽ nét (line-art) hình chiếu của hộp 160 × 100 × 60 mm nằm giữa dashboard. Cửa sổ LED trên bản vẽ **sáng đúng màu đang gửi**; các điểm B (DHT22), C (MQ-135), D (LED), E (BOOT) có đường dẫn nối tới thẻ số liệu tương ứng. Chạm/di chuột vào điểm nào, thẻ đó được làm nổi và hiện nhãn **ID**. Đây vừa là điểm "wow", vừa là bản đồ chú thích ID cho báo cáo mục 2.2.
2. **Họa tiết 8 ô LED.** Một hàng 8 ô nhỏ lặp lại ở: thanh trạng thái kết nối, mô phỏng đèn khi chọn màu, thanh tiến trình các bước cài đặt, chỉ báo trang ở mobile, loading. Một motif — nhiều vai trò — tạo sự nhất quán giữa phần cứng và phần mềm.
3. **Chữ số ma trận chấm cỡ lớn** cho giá trị chính (độ ẩm, nhiệt độ, CO₂), cập nhật bằng hiệu ứng "lật số" ngắn khi nhận bản tin mới. Đi cùng chữ mono nhỏ viết hoa cho nhãn.
4. **Mặt đồng hồ có vạch chia (gauge dạng dụng cụ).** Vòng 240° **chia thành 61 đoạn hướng tâm** (đoạn đã đạt đen, còn lại xám; vạch lớn mỗi 10 đoạn), kim và trục — đã dựng thử thành công trong Figma (mục 12.3). Vùng nằm ngoài khoảng cho phép (độ ẩm < 30% hoặc > 85%) được đánh dấu bằng ~~gạch chéo 45°~~ **cung đặc mảnh màu báo động** *(đổi 07/11/2026 — chủ dự án không muốn họa tiết gạch chéo đỏ)*.
5. **Ngôn ngữ trạng thái bằng họa tiết, màu chỉ để nhấn.** Gạch chéo = ngoài ngưỡng / chưa hoàn tất; chấm lưới = vùng biểu đồ; vùng trống + dấu "—" = không có dữ liệu; nền đen đảo màu = đang cần chú ý. *(Cập nhật 06/11/2026)* Thêm một lớp màu nhấn nhỏ chồng lên họa tiết: đỏ cam = báo động/lỗi, xanh lá = trực tuyến/đã gửi lệnh, vàng đất = dữ liệu cũ/chú ý, và ba màu phân biệt chỉ số cho đường dữ liệu. Họa tiết + chữ vẫn mang đủ nghĩa nên giao diện đọc được khi in đen trắng và với người khó phân biệt màu.
6. **Lớp chú thích kỹ thuật.** Đường kích thước, tọa độ vạch, nhãn kiểu bản vẽ (`B · DHT22`, `§ ID 01`). Trong sản phẩm chỉ giữ ở mức tối thiểu (đường dẫn của Device Twin); trong Figma có **lớp chú thích đầy đủ** để xuất cho báo cáo.

### 3.2 Các hướng đã cân nhắc và loại

| Hướng | Lý do loại |
|---|---|
| "Glass / gradient / neumorphism" | Không hợp tông trắng-đen; khó in; dễ giống mẫu dashboard đại trà |
| "Brutalist thô" (chữ đậm, lệch, không quy tắc) | Gây ấn tượng nhưng khó dùng với người không chuyên; rủi ro khả dụng |
| "Tối giản kiểu SaaS" | An toàn nhưng không tạo khác biệt; gần với V3 |

---

## 4. Nguồn cảm hứng (nguyên tắc, không sao chép hình)

*Lưu ý: liệt kê dựa trên kiến thức có sẵn, chưa tra cứu lại trực tuyến; khi thực thi sẽ dùng mục tìm kiếm của skill `ui-ux-pro-max` để bổ sung và đối chiếu.*

| Nguồn | Học được gì |
|---|---|
| Nothing OS / Glyph (chữ số ma trận chấm) | Chữ số chấm làm điểm nhấn thương hiệu khi chỉ có đen và trắng |
| Teenage Engineering (OP-1, EP-133) | Nhãn nhỏ viết hoa, chữ và số như khắc trên thiết bị, một màu nhấn tiết chế |
| Braun / Dieter Rams (đồng hồ, máy tính ET 66) | Ít nhưng đúng; vạch chia và nhãn rõ ràng; cái gì cũng có chức năng |
| Phong cách tipo Thụy Sĩ (Müller-Brockmann) | Lưới nghiêm ngặt, chữ lớn bất đối xứng, khoảng trắng chủ động |
| Bản vẽ kỹ thuật / blueprint | Đường kích thước, chú thích A–E, hình chiếu — khớp với ảnh 3D trong thuyết minh |
| Edward Tufte (sparkline, small multiples, data-ink) | Biểu đồ nhỏ nhiều lớp, bỏ trang trí thừa, nhãn trực tiếp |
| Màn hình e-ink dạng dashboard (kiểu TRMNL, Kindle) | Giao diện đơn sắc vẫn giàu thông tin nếu dùng họa tiết và cỡ chữ |
| Ứng dụng đo chất lượng không khí (Awair, Airthings) và nhiệt kế thông minh | Số lớn ở trung tâm, tín hiệu "ổn / không ổn" đọc trong một giây |
| WCAG 2.2, Apple HIG, Material (vùng ngón cái, vùng chạm) | Chuẩn khả dụng và accessibility cho mobile |
| Carbon / NSW Design System (hướng dẫn trực quan hóa dữ liệu) | Cách chia trục, nhãn, bảng số thay thế biểu đồ |

---

## 5. Hệ thống thiết kế (Foundations)

### 5.1 Màu — token

Hai chủ đề: **"Body"** (sáng, theo màu thân hộp — mặc định) và **"Lid"** (tối, theo màu nắp). Theo hệ điều hành, có công tắc thủ công. *Trong Figma, do giới hạn 1 mode mỗi collection, hai chủ đề là hai bộ biến `body/…` và `lid/…` (mục 12.3).*

| Token | Body (sáng) | Lid (tối) | Dùng cho |
|---|---|---|---|
| `--paper` | `#F4F4F1` | `#0E0E10` | Nền trang |
| `--surface` | `#FFFFFF` | `#17171A` | Mặt panel |
| `--ink` | `#0B0B0C` | `#F4F4F1` | Chữ chính, đường dữ liệu, nút chính |
| `--ink-2` | `#55555A` | `#A5A5AB` | Chữ phụ (kiểm tra ≥ 4,5 : 1) |
| `--line` | `#D6D6D1` | `#2C2C31` | Đường kẻ mảnh 1 px |
| `--line-strong` | `#8A8A90` | `#6A6A70` | Viền ô nhập, vạch chia |
| `--invert-bg` / `--invert-ink` | `--ink` / `--paper` | ngược lại | Vùng đảo màu: hero, cảnh báo |
| `--led` | động | động | **Màu đèn LED thật** |
| `--accent-alert` / `-text` / `-tint` | `#FF4B1F` / `#C2300F` / `#FFEFEA` | `#FF6A45` / `#FF6A45` / `#2A1712` | Báo động: độ ẩm ngoài 30–85 %, lỗi, mất kết nối, ngoại tuyến |
| `--accent-ok` / `-text` | `#26944F` / `#1F7A42` | `#4CC777` | Trực tuyến, đã gửi lệnh, bước đã xong, "bình thường" |
| `--accent-warn` / `-text` / `-tint` | `#A87700` / `#8A5F00` / `#FFF6DF` | `#F2B830` / — / `#2A2210` | Dữ liệu cũ, đang kết nối, chú ý |
| `--data-humidity` · `--data-temperature` · `--data-co2` | `#2A5FE8` · `#B0307A` · `#087A82` | `#6B95FF` · `#E066AD` · `#2FC3CC` | Chỉ đường/cột/đoạn gauge — phân biệt chỉ số, không mang nghĩa mức độ |

*(Cập nhật 06/11/2026 — đảo quyết định #1, xem mục 14.)* `~~--signal~~` cũ được thay bằng bộ `--accent-*` trên. Màu chỉ để nhấn (chấm, viền, vạch, đường mảnh), luôn đi kèm chữ/họa tiết; nền, khung, chữ, chữ số lớn giữ đen–trắng–xám. Có bản mono tương đương (`.ri-mono`, `@media print`) cho in. Số đo tương phản ở `design/DECISIONS.md` mục 6.

Quy tắc: không dùng đỏ/xanh để phân loại "tốt / xấu" cho **nhiệt độ** và **CO₂** — thuyết minh chỉ định ngưỡng cho độ ẩm; CO₂ chỉ là ước lượng tham khảo.

### 5.2 Chữ

| Vai trò | Ứng viên | Ghi chú |
|---|---|---|
| Tiêu đề / UI | **Space Grotesk** | Cá tính hình học; **phải kiểm tra đủ dấu tiếng Việt** |
| Nhãn / số nhỏ / chú thích | **JetBrains Mono** (dự phòng IBM Plex Mono) | Chữ số đều nhau, đọc tốt khi nhỏ; có tiếng Việt |
| Số hero | **Ma trận chấm** — ứng viên font "Doto" (OFL) hoặc tự dựng bằng lưới SVG 5 × 7 | Chỉ cần chữ số, `%`, `°C`, `ppm`, `.`; phải có nhãn chữ thường cho trình đọc màn hình |
| Dự phòng hệ thống | `system-ui` | Bắt buộc cho trang cấu hình WiFi |

- Font tự lưu trong dự án (OFL), chạy offline; **bước kiểm tra bắt buộc**: dựng thử chuỗi "Độ ẩm · Nhiệt độ · Chất lượng không khí · Ước lượng · Đăng nhập · Khoảng nghỉ" ở mọi cỡ.
- Thang chữ (tỉ lệ 1,25): nhãn 11/12 · thân 15/16 · phụ đề 20 · tiêu đề 25 · số trung bình 40 · số hero 96 → 160 (desktop), 72 → 96 (mobile).
- **Tiếng Việt cần khoảng cao dòng rộng hơn:** thân ≥ 1,5; tiêu đề viết hoa có dấu ≥ 1,25 (dấu chồng dễ bị cắt).

### 5.3 Lưới, khoảng cách, hình khối

- Đơn vị cơ sở 4 px, nhịp 8 px. Desktop: 12 cột, nội dung tối đa 1280, lề 24 / 32. Tablet: 8 cột. Mobile: 4 cột, lề 16.
- **Góc vuông** (bo 0 – 2 px) như linh kiện; riêng panel hero có **4 chấm vít** ở góc, gợi lại 4 vít M3 trên nắp hộp (chỉ dùng ở một chỗ để không thành sáo rỗng).
- Viền 1 px mảnh làm lớp nền; viền 2 px = đang chọn / chính. **Không đổ bóng mờ.** Chiều sâu bằng đảo màu và bóng cứng lệch 3 px (nút nhấn như phím vật lý, lún 2 px khi bấm).
- Họa tiết: gạch chéo 45° (2 px / 6 px), lưới chấm 12 px, vạch chia mảnh.

### 5.4 Biểu tượng

Bộ nét 1,5 px, khoảng 18 biểu tượng tự vẽ hoặc dựa trên bộ mã nguồn mở có giấy phép phù hợp: giọt nước, nhiệt kế, CO₂/khí, bóng đèn, nguồn, đồng hồ, WiFi, gửi tin (không dùng logo Telegram), người dùng, đăng xuất, cảnh báo, làm mới, lịch, mũi tên, nút BOOT, hộp thiết bị, khóa, mắt.

### 5.5 Chuyển động

| Hiệu ứng | Thời lượng | Dùng ở |
|---|---|---|
| "Lật số" khi giá trị đổi | 240 ms, ease-out | Số hero và số trong thẻ |
| Kim gauge có đà (spring nhẹ) | 400 ms | Gauge |
| Quét 8 ô LED (trễ 40 ms mỗi ô) | 320 ms | Khi bấm Áp dụng; khi vừa kết nối |
| Nhịp tim kết nối (một chấm nhấp nháy) | mỗi bản tin | Thanh trạng thái |
| Chuyển trang: lớp phủ mở theo đường kẻ | 200 ms | Điều hướng |
| Nút lún | 80 ms | Mọi nút chính |

`prefers-reduced-motion`: bỏ toàn bộ chuyển động, thay bằng đổi tức thì hoặc mờ dần. Mọi hiệu ứng làm bằng CSS/JS thuần, không thêm thư viện nặng.

### 5.6 Quy tắc trực quan hóa dữ liệu

- Một biểu đồ = một chỉ số = một đơn vị; trục ghi rõ `%`, `°C`, `ppm`; thời gian UTC+7.
- Phân biệt nhiều đường bằng **kiểu nét** (liền / đứt / chấm) và nhãn trực tiếp, không chỉ bằng màu.
- Biểu đồ độ ẩm vẽ **hai đường ngưỡng 30% và 85%** cùng vùng ngoài ngưỡng nền rất nhạt *(07/11/2026: thay gạch chéo)* (liên kết trực tiếp với ID 6).
- Không nối qua chỗ thiếu dữ liệu (`spanGaps: false`); ngày chưa kết thúc dùng cột có viền đứt / gạch chéo và ghi chú.
- Cột ngày bắt đầu từ 0. Thang "nhìn gần" phải ghi rõ để không gây hiểu nhầm.
- Mỗi biểu đồ có **bảng số thay thế** (chuyển đổi bằng nút) và điều khiển bằng bàn phím.
- Phải dựng được bằng Chart.js (tùy biến plugin vùng ngưỡng; nếu cần heatmap thì dùng canvas riêng — chỉ làm nếu còn thời gian, không bắt buộc vì không thuộc ID nào).

---

## 6. Kiến trúc thông tin và bản đồ màn hình

### 6.1 Điều hướng

- **Desktop:** thanh dọc bên trái ("rail") 5 mục đánh số `01 Giám sát · 02 Đèn LED · 03 Lịch sử · 04 Telegram · 05 Thiết bị`; cuối rail là tài khoản. Phía trên là **thanh trạng thái** có 8 ô LED nhỏ (kết nối), giờ cập nhật cuối. Rail thu gọn thành biểu tượng ở < 1280 px.
- **Mobile:** thanh tab dưới 5 mục (Giám sát · Đèn LED · Lịch sử · Telegram · Thêm); "Thêm" chứa Thiết bị và Tài khoản. Thanh trạng thái dính phía trên.
- **Chưa đăng nhập:** chỉ có Đăng nhập / Đăng ký (ID 8). Mọi đường dẫn khác chuyển về đăng nhập.

### 6.2 Danh mục màn hình

Mã: **DK** = desktop, **MB** = mobile, **PT** = portal WiFi của ESP32, **ST** = trạng thái. Ưu tiên: **P0** làm đầu tiên (hero + luồng chính), **P1** làm tiếp, **P2** hoàn thiện.

| Mã | Màn | ID | Ưu tiên | Ghi chú |
|---|---|---|---|---|
| DK-01 / MB-01 | Đăng nhập | 8 | P0 | |
| DK-02 / MB-02 | Đăng ký (có xác nhận mật khẩu) | 8 | P0 | |
| DK-03 / MB-03 | Phiên hết hạn / đăng xuất | 8 | P1 | Hộp thoại + trang |
| DK-04 / MB-04 | **Giám sát** (dashboard) | 1, 2, 3, 9 | **P0** | Màn quan trọng nhất |
| DK-05 / MB-05 | Chi tiết chỉ số (ngăn trượt: độ ẩm / nhiệt độ / CO₂) | 1, 2, 5 | P1 | Không phải trang riêng |
| DK-06 / MB-06 | **Đèn LED** | 3 | **P0** | |
| DK-07 / MB-07 | Bộ chọn màu tùy chỉnh | 3 | P0 | Popover / bottom sheet |
| DK-08 / MB-08 | **Lịch sử — theo giờ** | 4, 5 | P1 | |
| DK-09 / MB-09 | **Lịch sử — theo ngày** | 4, 5 | P1 | |
| DK-10 / MB-10 | Bộ lọc khoảng ngày tùy chọn | 5 | P1 | |
| DK-11 / MB-11 | Bảng số liệu (thay thế biểu đồ) | 5 | P2 | |
| DK-12 / MB-12 | **Telegram** (liên kết, lệnh, quy tắc cảnh báo) | 6, 7 | P1 | |
| DK-13 / MB-13 | **Thiết bị & WiFi** | 1, 2, 3, 10 | P1 | |
| DK-14 / MB-14 | Tài khoản & phiên | 8 | P2 | |
| DK-15 / MB-15 | **Cài đặt lần đầu** (3 bước) | 8, 10, 6, 7 | P1 | Lớp phủ khi tài khoản mới |
| DK-16 / MB-16 | Trạng thái cảnh báo độ ẩm (biến thể của 04) | 1, 6 | P1 | |
| DK-17 / MB-17 | Chế độ tối "Lid" của dashboard | — | P2 | Cùng nội dung, chủ đề khác |
| MB-18, MB-19 | Chi tiết một ngày; heatmap *(tùy chọn)* | 5 | P2 | Bỏ nếu thiếu thời gian |
| PT-01 | Chọn mạng WiFi | 10 | P0 | 390 px, tự đóng gói |
| PT-02 | Nhập mật khẩu / đang kết nối | 10 | P0 | |
| PT-03 | Đã lưu — thiết bị khởi động lại | 10 | P0 | "Đã lưu" ≠ "đã online" |
| PT-04 | Kết nối thất bại | 10 | P1 | |
| ST-xx | Trạng thái (mục 9) | — | P1 – P2 | ≈ 15 khung |

Không có trang nào ngoài danh mục này. Nếu cần thêm, phải nêu ID được phục vụ trước.

---

## 7. Đặc tả các màn hình chính

### 7.1 DK-04 — Giám sát (desktop, 1440 px)

Mục tiêu: "5 giây đầu" — thấy chiếc hộp, ba chỉ số, màu đèn và tình trạng kết nối.

```
┌──────┬────────────────────────────────────────────────────────────────────┐
│ RAIL │ ▮▮▮▮▮▮▮▮ TRỰC TUYẾN · cập nhật 3 giây trước · 14:30 UTC+7 [Tài khoản]│ ID 9
│ 01 ● │───────────────────────────────┬────────────────────────────────────┤
│ 02   │ DEVICE TWIN        (7 cột)    │ ĐỘ ẨM                       ID 1   │
│ 03   │  ┌───────────────────────┐    │  [gauge cung 240°, gạch chéo     │
│ 04   │  │B●─╲  ▮▮▮▮▮▮▮▮ (D)  ╱─●C│    │   ngoài 30–85]                    │
│ 05   │  └──────● E ──────────────┘    │  64,5 %  (ma trận chấm, cỡ lớn)   │
│      │  chú thích B C D E            │  BÌNH THƯỜNG · ngưỡng 30–85 %     │
│      │                               ├────────────────┬───────────────────┤
│      │  LED nhanh: ● màu · Bật/Tắt   │ NHIỆT ĐỘ  ID 1 │ CO₂ ƯỚC LƯỢNG ID 2 │
│ user │      (sang trang 02)   ID 3   │ [gauge] 27,5 °C│ [gauge] 850 ppm    │
│      │                               │                │ tham khảo          │
│      │───────────────────────────────┴────────────────┴───────────────────┤
│      │ 24 GIỜ QUA — 3 sparkline (bấm để mở Lịch sử)                  ID 5  │
└──────┴────────────────────────────────────────────────────────────────────┘
```

- **Device Twin** (cột trái): bản vẽ nét hộp từ trên xuống nghiêng nhẹ; cửa sổ LED mang màu `--led` thực, tắt thì hiện 8 ô rỗng; điểm B/C nối tới thẻ độ ẩm–nhiệt độ / CO₂; điểm E ghi "Giữ BOOT 5 giây → đổi WiFi" (dẫn tới trang Thiết bị). Di chuột → làm nổi thẻ liên quan.
- **Hero độ ẩm** là panel đảo màu (nền đen, như nắp hộp) vì đây là chỉ số có ngưỡng cảnh báo.
- **Thẻ nhiệt độ / CO₂:** mỗi thẻ có gauge nhỏ + số + một dòng trạng thái. CO₂ luôn có nhãn "ước lượng · tham khảo".
- **Dải 24 giờ:** ba sparkline xếp hàng, bấm vào để mở DK-08 đúng chỉ số đó.
- **Thanh trạng thái:** 8 ô sáng dần theo độ khỏe kết nối; nhịp chấm mỗi bản tin; "cập nhật X giây trước" chuyển sang cảnh báo "dữ liệu cũ" khi quá **90 giây** không có bản tin (ESP32 gửi mỗi ~30 giây — đã chốt).
- Hành vi: dữ liệu vào qua WebSocket, số lật, kim chạy; ngoài ngưỡng 30–85% thì hero chuyển sang kiểu cảnh báo (mục 9) kèm dòng nêu giá trị và ngưỡng. Giao diện **không** hiển thị việc cảnh báo Telegram đã gửi hay chưa (backend không cung cấp thông tin này).

### 7.2 MB-04 — Giám sát (mobile, 390 px)

```
┌──────────────────────────┐
│ ▮▮▮▮▮▮▮▮ TRỰC TUYẾN      │ dính trên cùng
│ cập nhật 3 giây trước    │
│ ┌──────────────────────┐ │
│ │ ĐỘ ẨM           ID 1 │ │ hero đảo màu
│ │ [gauge]   64,5 %     │ │
│ │ BÌNH THƯỜNG 30–85 %  │ │
│ └──────────────────────┘ │
│ ┌─────────┐ ┌──────────┐ │
│ │NHIỆT ĐỘ │ │CO₂ ƯỚC   │ │ hai thẻ nhỏ, có gauge mini
│ │27,5 °C  │ │850 ppm   │ │
│ └─────────┘ └──────────┘ │
│ ▮▮▮▮▮▮▮▮  Đèn · [BẬT ◉] │ ID 3 — lối tắt
│ 24 giờ qua  ～～～～      │ ID 5
│ [Giám sát][LED][Sử][TG][⋯]│ tab dưới
└──────────────────────────┘
```

- Một tay: mọi điều khiển nằm trong nửa dưới màn hình; vùng chạm ≥ 44 px.
- Chạm thẻ → ngăn trượt chi tiết (DK-05/MB-05); vuốt ngang trong ngăn để chuyển giữa ba chỉ số, chỉ báo trang là hàng 3 ô.
- Hero thu nhỏ khi cuộn (giữ số, ẩn gauge) để không chiếm màn hình.

### 7.3 DK-06 / MB-06 — Đèn LED (ID 3)

Luồng: **chọn màu có tên → xem trước → Áp dụng**; Bật/Tắt gửi ngay.

- Cửa sổ LED lớn ở đầu trang: **8 ô** thể hiện màu đang chọn (bản nháp) và, ở hàng nhỏ bên dưới, màu **đã gửi** — người dùng luôn thấy sự khác nhau giữa "đang chọn" và "đã gửi".
- Lưới màu có tên (khoảng 10 màu, kèm tên và mã HEX, không chỉ dựa vào màu) + nút "Tùy chỉnh" mở bộ chọn: thanh sắc độ, ô sắc – sáng, ô HEX.
- Nút **Áp dụng** (chính, kiểu phím lún) và **Hủy** (khôi phục màu đã gửi). Công tắc Bật/Tắt tách riêng, gửi tức thì.
- **Không có slider độ sáng**, không điều khiển từng bóng: ngoài phạm vi ID 3.
- Trạng thái: nháp · đang gửi · **đã gửi lệnh** · gửi lỗi (giữ nguyên bản nháp, có nút thử lại). **Đã chốt:** firmware không gửi lại trạng thái LED, nên giao diện chỉ ghi "Đã gửi lệnh", không bao giờ ghi "đã xác nhận" hay "đèn đã sáng". Thiết bị offline → khóa điều khiển và nói rõ lý do.
- Mobile: lưới màu cuộn ngang theo từng chip, bộ chọn tùy chỉnh là **bottom sheet**; nút Áp dụng dính sát đáy, trên thanh tab.

### 7.4 DK-08 / DK-09 / MB-08 / MB-09 — Lịch sử (ID 4, 5)

- Điều khiển: **[Theo giờ | Theo ngày]** · khoảng **[24 giờ | 7 ngày | Tùy chọn…]** · (mobile: gom vào một hàng chip cuộn ngang).
- Desktop: ba biểu đồ **xếp chồng, cùng trục thời gian** (small multiples) — độ ẩm có vùng ngưỡng; thanh tóm tắt (nhỏ nhất / trung bình / lớn nhất) bên phải mỗi biểu đồ.
- Mobile: tab ba chỉ số, **một biểu đồ mỗi lần**; chạm giữ để kéo thước đọc giá trị, nhãn giá trị hiện **phía trên ngón tay**.
- Chọn ngày tùy chọn: hai ô ngày, ngày đầu không sau ngày cuối, phải bấm Áp dụng.
- Dòng ghi chú nhỏ: *"Dữ liệu được lưu tự động mỗi khi thiết bị gửi bản tin"* (ID 4) — không có nút lưu.
- Trạng thái: đang tải (quét 8 ô), rỗng ("Chưa có dữ liệu trong khoảng này"), lỗi (có nút thử lại), thiếu một số mốc (dấu "—", không nối đường).

### 7.5 DK-12 / MB-12 — Telegram (ID 6, 7)

Ba khối, đọc từ trên xuống:
1. **Liên kết (3 bước):** mở bot (tên bot hiện là chỗ giữ chỗ) → gửi `/start` → nhận tin xác nhận. **Đã chốt:** chỉ là hướng dẫn 3 bước, không có nhãn "Đã liên kết / Chưa liên kết".
2. **Quy tắc cảnh báo (ID 6):** thanh thang 0–100% với vùng dưới 30% và trên 85% nền rất nhạt + gạch đáy 2 px màu báo động *(07/11/2026: thay gạch chéo)*; ghi "sau mỗi lần cảnh báo, hệ thống nghỉ **30 phút** rồi mới báo lại" (khoảng nghỉ đã chốt).
3. **Hỏi nhanh bot (ID 7):** hai lệnh `/doam` và `/trangthai` kèm ví dụ câu trả lời, ghi rõ "minh họa". Không dựng lại giao diện Telegram thật.

### 7.6 DK-13 / MB-13 — Thiết bị & WiFi (ID 10, 1–3)

- Bản vẽ hộp có điểm E phóng lớn: **"Giữ nút BOOT khoảng 5 giây để xóa cấu hình WiFi"**; các bước đổi WiFi đánh số, mô tả đèn/nút bằng hình, không bằng thuật ngữ.
- Trạng thái thiết bị: online / offline, thời điểm nhận bản tin cuối, MQ-135 đang làm nóng (nếu có), WiFi đang dùng (nếu backend biết).
- Câu "đã nhận cấu hình WiFi" không đồng nghĩa "thiết bị đã online".

### 7.7 DK-15 / MB-15 — Cài đặt lần đầu (mục 1.4 của thuyết minh)

Chuỗi 3 bước với thanh tiến trình **8 ô** (mỗi bước chiếm một số ô): ① Kết nối WiFi cho thiết bị (ID 10) → ② Tạo tài khoản / đăng nhập (ID 8) → ③ Liên kết Telegram (ID 6, 7). Mỗi bước: một câu chỉ dẫn, một hình minh họa, một nút; có thể bỏ qua bước ③ và quay lại sau.

### 7.8 DK-01/02 · MB-01/02 — Đăng nhập / Đăng ký (ID 8)

- Bố cục chia đôi (desktop): trái là Device Twin lớn kèm câu "Phòng học của bạn, một cái nhìn"; phải là biểu mẫu. Mobile: biểu mẫu, Device Twin thu nhỏ phía trên.
- Đăng ký: **tên đăng nhập** (đã chốt, không dùng email), mật khẩu, **xác nhận mật khẩu**, quy tắc mật khẩu hiển thị trước khi gõ.
- Lỗi đăng nhập dùng câu trung tính ("Thông tin đăng nhập chưa đúng"), không tiết lộ tên đăng nhập có tồn tại hay không.
- Phiên hết hạn: hộp thoại giải thích, **dữ liệu bảo vệ không còn hiển thị phía sau** (làm mờ bằng khối đặc, không để lộ số).

### 7.9 PT-01 → PT-04 — Trang cấu hình WiFi của ESP32 (ID 10)

Ràng buộc kỹ thuật dẫn dắt thiết kế:
- Điện thoại đang nối vào WiFi của ESP32, **không có internet** → không font web, không ảnh ngoài, không CDN; chỉ `system-ui`, biểu tượng SVG nhúng, CSS rất nhỏ (dung lượng bộ nhớ flash hạn chế).
- Dùng thư viện WiFiManager (thuyết minh chọn "dùng dịch vụ có sẵn"), nên chỉ thay đổi được ở mức CSS đưa vào phần `<head>` và các lớp HTML mà thư viện sinh ra — cần kiểm tra khi triển khai; thiết kế vì thế đơn giản có chủ đích.
- Nội dung: logo chữ "SMART CLASSROOM", hàng 8 ô LED làm họa tiết, danh sách mạng kèm vạch cường độ sóng, ô mật khẩu có nút hiện/ẩn, nút lớn **Kết nối**, màn hình "Đã lưu — thiết bị đang khởi động lại, hãy nối điện thoại về WiFi nhà", màn hình lỗi với hướng dẫn thử lại.

---

## 8. Thư viện thành phần

| Nhóm | Thành phần | Biến thể / trạng thái chính |
|---|---|---|
| Nền tảng | Rail, thanh trạng thái, tab dưới, tiêu đề trang, panel (thường / đảo màu / hero có vít) | Thu gọn, có huy hiệu |
| **Dụng cụ** | **Gauge** (độ ẩm, nhiệt độ, CO₂), **số ma trận chấm**, thanh 8 ô LED, Device Twin, sparkline | Bình thường · ngoài ngưỡng · đang làm nóng · mất dữ liệu · dữ liệu cũ |
| Biểu đồ | Đường (có vùng ngưỡng), cột theo ngày, thước đọc giá trị, chú giải, bảng số | Đầy đủ · thiếu mốc · ngày chưa kết thúc · rỗng · lỗi · đang tải |
| Điều khiển | Nút chính / phụ / chữ, công tắc Bật-Tắt, chip màu, bộ chọn màu, ô nhập, ô ngày, nhóm nút phân đoạn, thanh bước | Mặc định · hover · focus · nhấn · khóa · lỗi |
| Phản hồi | Banner, toast, hộp thoại, bottom sheet, ngăn trượt, trạng thái rỗng | Thông tin · cảnh báo · lỗi · thành công |
| Chú thích | Huy hiệu ID `⟨ID 1⟩`, đường dẫn, nhãn vị trí A–E | Chỉ có trong lớp chú thích (Figma) và Device Twin |

Mọi thành phần có biến thể **sáng / tối** và **desktop / mobile**; thuộc tính được đặt tên theo token để chuyển thẳng sang CSS.

---

## 9. Ma trận trạng thái

| Tình huống | Hiển thị | Hành vi |
|---|---|---|
| Đang tải lần đầu | Khung xương + hàng 8 ô quét; thanh trạng thái "ĐANG KẾT NỐI" màu chú ý | Không để số giả |
| WebSocket đứt | Thanh trạng thái đảo màu "MẤT KẾT NỐI" (ô + chữ màu báo động), số giữ giá trị cuối kèm nhãn "dữ liệu cũ" (màu chú ý) | Tự thử lại, có nút thử lại |
| Dữ liệu cũ (quá ngưỡng) | Gauge nhạt, nhãn biểu tượng đồng hồ + "CŨ · hh:mm" màu chú ý, thanh trạng thái gạch đáy màu chú ý *(cập nhật 07/11/2026)* | Quá 90 giây không có bản tin (chu kỳ gửi ~30 giây) |
| Thiết bị offline | Device Twin chuyển nét đứt; LED khóa; thanh trạng thái màu báo động | Giải thích + liên kết hướng dẫn |
| Trực tuyến / bình thường | 8 ô + chữ "TRỰC TUYẾN" xanh lá; chấm xanh lá cạnh "BÌNH THƯỜNG" | Màu nhỏ — mắt vẫn rơi vào số hero |
| Lỗi cảm biến DHT22 | Gauge/số thay bằng "—", ghi "không đọc được" | Không vẽ số 0 |
| MQ-135 đang làm nóng / chưa hiệu chuẩn | Gauge CO₂ hiện "đang làm nóng", không hiện giá trị | Ghi rõ chỉ mang tính tham khảo |
| **Độ ẩm ngoài 30–85%** | Hero đảo màu + **dải đèn hiệu 3 mức** "THẤP < 30 % · 30–85 % · CAO > 85 %" (ô đúng mức được thắp đặc) + chip "> 85 %"/"< 30 %" + banner lỗi nêu giá trị và ngưỡng | *(Cập nhật 07/11/2026)* Bỏ viền đỏ 3 px và ô gạch chéo; bản in đọc nhờ ô đặc / rỗng + chữ |
| **Lỗi ô nhập, banner lỗi/chú ý, toast thất bại** | Viền 1 px thường, **cạnh đáy 2 px** màu trạng thái, biểu tượng ⚠, câu lỗi ngay dưới ô | *(Chốt 07/11/2026, DECISIONS mục 7)* Không gạch chéo — không còn gạch chéo đỏ ở đâu; gạch chéo mực chỉ ở cột "hôm nay" và dòng thời gian khoảng nghỉ |
| LED: nháp / đang gửi / đã gửi / lỗi | Mục 7.3; "ĐÃ GỬI LỆNH" xanh lá nhỏ, "GỬI LỖI" màu báo động | Lỗi giữ bản nháp |
| Hướng dẫn Telegram | Không có trạng thái liên kết; tab Telegram luôn hiện 3 bước hướng dẫn, và bước ③ của "Cài đặt lần đầu" có thể bỏ qua | Không chặn các chức năng khác |
| Phiên hết hạn | Hộp thoại + khối che dữ liệu | Quay lại sau đăng nhập |
| Đăng nhập sai / đăng ký lỗi | Lỗi cạnh trường + banner tóm tắt | Không xóa dữ liệu đã nhập (trừ mật khẩu) |
| Lịch sử rỗng / lỗi / thiếu mốc | Mục 7.4 | Có hành động khôi phục |
| WiFi portal: sai mật khẩu / không thấy mạng | PT-04 | Hướng dẫn thử lại / quét lại |

---

## 10. Responsive, accessibility, nội dung

### 10.1 Điểm ngắt và thích nghi

| Khung | Rộng | Điều chỉnh |
|---|---|---|
| Mobile nhỏ | 320 – 389 | Một cột; gauge mini; chữ hero 72 |
| **Mobile chuẩn** | **390** | Khung thiết kế chính |
| Mobile lớn / tablet đứng | 428 – 767 | Hai thẻ nhỏ cạnh nhau, biểu đồ rộng hơn |
| Tablet | 768 – 1023 | Rail thu gọn, dashboard hai cột |
| **Desktop** | **1280 – 1440** | Khung thiết kế chính (rail đầy đủ) |
| Màn rộng / máy chiếu | ≥ 1920 | Nội dung giữ tối đa 1280 (không kéo giãn); chữ số hero tăng cỡ |

Khung thiết kế: 1440 × (cao theo nội dung) cho desktop, 390 × (cao theo nội dung) cho mobile và portal; kiểm tra thêm 320 và 768.

### 10.2 Accessibility

- Tương phản chữ ≥ 4,5 : 1, thành phần giao diện ≥ 3 : 1 — **đo lại bằng công cụ** cho cả hai chủ đề.
- Không phụ thuộc màu: mọi trạng thái có họa tiết + chữ + biểu tượng.
- Vùng chạm ≥ 44 × 44 px; khoảng cách giữa các vùng chạm ≥ 8 px.
- Gauge dùng vai trò `meter` kèm giá trị và đơn vị; số ma trận chấm có nhãn chữ cho trình đọc màn hình; biểu đồ có bảng số thay thế.
- Focus rõ (viền 2 px + khoảng cách), thứ tự Tab đúng; điều khiển biểu đồ bằng phím trái/phải, Home/End.
- Màu LED luôn đi kèm **tên màu và mã HEX**.
- Tôn trọng `prefers-reduced-motion` và `prefers-color-scheme`.

### 10.3 Nội dung và giọng văn

- Tiếng Việt, ngắn, trực tiếp, không thuật ngữ khi hướng dẫn người không chuyên (nói "WiFi nhà bạn", không nói "SSID").
- Chuỗi giao diện đặt trong tệp riêng để sau này đổi/ thêm ngôn ngữ, không viết cứng.
- Mẫu câu bắt buộc: *"CO₂ ước lượng từ cảm biến MQ-135, chỉ mang tính tham khảo."* · *"Đã gửi lệnh đến thiết bị."* (không viết "đèn đã sáng" khi chưa có xác nhận) · *"Đã lưu cấu hình WiFi. Thiết bị đang khởi động lại."* · *"Độ ẩm 88% — cao hơn ngưỡng 85%."*

---

## 11. Phối hợp với báo cáo và mã nguồn

- **Bảng báo cáo (ảnh dùng cho mục 2.2):** mỗi luồng một bảng — *Đăng nhập · Giám sát · Đèn LED · Lịch sử · Telegram · Thiết bị & WiFi (kể cả portal)*. Trên mỗi bảng: khung desktop + mobile cạnh nhau, huy hiệu số trên từng vùng, bảng chú giải "vùng → ID chức năng". Chữ tối thiểu tương đương 8 pt khi in A4; kiểm tra bản in đen trắng.
- **Giao cho lập trình (ID 9):** tệp token CSS (màu, chữ, khoảng cách, chuyển động), bộ SVG (Device Twin, biểu tượng, hàng 8 ô), đặc tả hành vi gauge/biểu đồ, danh sách chuỗi nội dung. Không dùng framework nặng — HTML/CSS/JS thuần + Chart.js.
- **Dữ liệu minh họa:** dùng một bộ dữ liệu cố định cho mọi khung hình (ví dụ độ ẩm 64,5%; nhiệt độ 27,5 °C; CO₂ 850 ppm; thời điểm 14:30 UTC+7). Đây là dữ liệu minh họa, ghi rõ trong ghi chú.

---

## 12. Quy trình thực thi với `ui-ux-pro-max` và `reqwise-figma`

### 12.1 Vai trò từng công cụ

| Công cụ | Dùng để |
|---|---|
| Skill `ui-ux-pro-max` | Đối chiếu design system đề xuất (màu, cặp chữ, kiểu biểu đồ); rà soát checklist UX / accessibility / responsive; gợi ý cho gauge và biểu đồ chuỗi thời gian |
| MCP `reqwise-figma` | Tạo trang, khung, biến (variables), thành phần, chữ, hình vector; đọc lại để kiểm tra |
| Chính kế hoạch này | Nguồn yêu cầu — **không** dùng `huong_dan_wireframe_v3.md` làm đầu vào |

### 12.2 Cấu trúc tệp Figma (tệp / trang riêng, **không ghi đè** Page 1 của bộ V3)

```
00 Bìa & Khái niệm        — mục 0, 3, bảng ID ↔ màn hình
01 Nền tảng               — màu (variables, 2 chủ đề), chữ, lưới, biểu tượng, họa tiết, chuyển động
02 Thành phần             — mục 8, mỗi thành phần đủ biến thể
03 Desktop                — DK-01 … DK-17
04 Mobile                 — MB-01 … MB-19
05 Portal WiFi            — PT-01 … PT-04
06 Trạng thái & luồng     — ST-xx, sơ đồ luồng người dùng
07 Bảng báo cáo           — lớp chú thích ID, xuất PNG/SVG
08 Bàn giao               — token, quy ước đặt tên, ghi chú hành vi
```

Quy ước: đặt tên khung `DK-04 Giám sát`, lớp `ID1/humidity/gauge`; dùng auto layout và biến cho mọi giá trị; không dùng giá trị màu/khoảng cách cứng.

### 12.3 Kết quả lượt thử (spike) — đã chạy ngày 06/11/2026

Chạy trên file Figma `VLcCNTT`, **trang "Claude"** (trống từ trước; hai trang "Codex" và "Gemini" không bị đụng tới). Khung thử tên `SPIKE · Room Instrument`.

| # | Hạng mục | Kết quả | Cách làm / điều chỉnh |
|---|---|---|---|
| 1 | Kết nối, đọc tài liệu | **Đạt** | Plugin kết nối ổn định |
| 2 | Khung auto layout | **Đạt** | `layoutAudit` không báo lỗi |
| 3 | Biến màu **hai chủ đề (Body/Lid)** | **Không đạt như kế hoạch** | File chỉ cho **1 mode mỗi collection** ("Limited to 1 modes only"). Chuyển sang **hai bộ biến riêng** `body/…` và `lid/…` trong collection `Room Instrument`; dựng khung chế độ tối bằng bộ `lid/…`. Xuất CSS (`exportTokens`) chạy được |
| 4 | Chữ tiếng Việt (Space Grotesk, JetBrains Mono) | **Đạt** | Dấu hiển thị đúng ở chữ thường, chữ hoa, cỡ 13 – 32; font có sẵn, không bị thay thế |
| 5 | Chữ số ma trận chấm (Doto) | **Đạt một phần** | Chữ số rõ, nhưng ký hiệu `%` bị đọc giống chữ "X" và dấu phẩy khó nhìn. **Chỉ dùng Doto cho chữ số; đơn vị (%, °C, ppm) đặt bằng JetBrains Mono cỡ nhỏ bên cạnh** |
| 6 | Họa tiết gạch chéo 45° | **Đạt** (cách thủ công) | Khung cắt (`clipsContent`) chứa ~36 thanh mảnh, xoay bằng `modify` (tham số xoay khi `create` bị bỏ qua). Làm một lần thành thành phần rồi dùng lại |
| 7 | Gauge | **Đạt bằng cách đổi thiết kế** | Công cụ **không tạo được vector/SVG và bỏ qua `arcData`** nên không vẽ được cung tròn liền. Thay bằng **gauge vòng chia đoạn**: 61 thanh hướng tâm trên cung 240° (đoạn đã đạt = đen, còn lại = xám), kim, trục, nhãn. Trông giống đồng hồ dụng cụ hơn bản cung liền và khớp với phong cách chấm / đoạn |
| 8 | Thành phần có biến thể | **Đạt** | `createVariants` chạy; ghi đè màu theo từng biến thể hoạt động; thuộc tính `children` bị bỏ qua nên nhãn chữ phải thêm sau; `instantiate` chạy |
| 9 | Nét đứt (dash) | **Không đạt** | `dashPattern` / `strokeDashes` bị bỏ qua (cả khi tạo và khi sửa). Nét đứt của Device Twin offline, đường dẫn, cột ngày chưa kết thúc phải dựng bằng **dãy thanh ngắn** (như họa tiết gạch chéo) |
| 10 | Chụp ảnh kiểm tra | **Không ổn định** | Chụp cả khung lớn hoặc bộ biến thể từng bị quá thời gian (90 giây). Chụp từng khung nhỏ thì được → chia nhỏ, chụp theo khung, lưu ý khi QA |

**Hệ quả đã áp dụng cho kế hoạch:**
- Gauge là **vòng chia đoạn** (cập nhật ở mục 3.1 và 8). Có hàm dựng gauge theo giá trị để tạo nhanh các trạng thái 64,5% · 27,5 °C · 850 ppm · 88% (ngoài ngưỡng).
- Hai chủ đề bằng **hai bộ biến** thay vì hai mode; mã CSS xuất ra sẽ có tiền tố `--body-` / `--lid-` và cần đổi thành `[data-theme]` khi bàn giao.
- Nét đứt và họa tiết thành **thành phần dựng sẵn** (`Pattern/Hatch`, `Line/Dashed`) để dùng lại, không vẽ rời ở từng màn hình.
- Số hero: Doto cho chữ số, mono nhỏ cho đơn vị.
- Khung hình lớn dễ làm chậm / treo ảnh chụp: mỗi bảng báo cáo dựng thành khung riêng, dùng instance thay vì sao chép nhiều lần các nhóm ~60 thanh.
- **Chưa kiểm tra:** Figma có cho tham số hóa gauge (đổi giá trị bằng thuộc tính thành phần) hay không — dự kiến dựng bằng hàm tạo từng trạng thái thay vì một thành phần có thuộc tính.
- Lượt thử để lại trong Figma: khung `SPIKE`, collection biến `Room Instrument` (8 biến), một bộ thành phần `Button` thử. Có thể xóa khung `SPIKE` trước khi vẽ thật; giữ lại biến.

### 12.4 Lộ trình và cổng duyệt

Mốc ngày bám theo lịch của thuyết minh (Bảng 2): phần giao diện cần có trước khi lập trình các chức năng tương ứng.

| Giai đoạn | Nội dung | Thời điểm gợi ý | Cổng duyệt |
|---|---|---|---|
| **G0 — Khái niệm** | Câu hỏi mở đã chốt ngày 06/11 (mục 14); lượt thử Figma đã chạy (mục 12.3); còn lại bảng cảm hứng, kiểm tra font tiếng Việt | 06 – 07/11 | **Duyệt khái niệm + màu/chữ** |
| **G1 — Lõi** | Nền tảng, thành phần "dụng cụ", **DK/MB-04, 06, 07, 01, 02**, **PT-01 → 03** | 07 – 10/11 | **Duyệt khung hình đầu** (trước khi so sánh với V3) |
| **G2 — Chức năng còn lại** | Telegram, Thiết bị & WiFi, Cài đặt lần đầu, Lịch sử, bộ lọc, phiên hết hạn, tài khoản | 10 – 14/11 | Duyệt đủ màn |
| **G3 — Hoàn thiện** | Trạng thái, chế độ tối, bảng báo cáo có chú thích ID, đo tương phản, kiểm tra in, bàn giao token | 14 – 18/11 | Nghiệm thu |

*Tùy chọn sau G3:* dựng một bản HTML ngắn để thử chuyển động (lật số, kim gauge, quét 8 ô) — Figma không thể hiện tốt các hiệu ứng này.

---

## 13. Tiêu chí nghiệm thu

**A. Bao phủ chức năng**
- [ ] Mỗi ID 1–10 có ít nhất một khung desktop **và** một khung mobile (hoặc portal) thể hiện đúng mô tả trong thuyết minh.
- [ ] Mỗi thành phần trong khung hình truy được về một ID; không có thành phần "mồ côi".
- [ ] Cả 3 chỉ số có **gauge và số**; CO₂ luôn có nhãn "ước lượng / tham khảo".
- [ ] LED chỉ có chọn màu và bật/tắt; không có slider độ sáng hay điều khiển từng bóng.
- [ ] Cảnh báo độ ẩm đúng ngưỡng < 30% và > 85%; khoảng nghỉ giữa hai lần báo ghi đúng 30 phút.
- [ ] Có đủ luồng 3 bước cho người không chuyên.

**B. Chất lượng thị giác**
- [ ] "Kiểm tra 5 giây": người xem chưa biết sản phẩm vẫn nói đúng được hộp đo gì, giá trị nào đang xem, đèn màu gì, có kết nối không.
- [ ] "Kiểm tra nheo mắt": phân cấp thị giác vẫn rõ khi làm mờ.
- [ ] Nhận ra ngay là một bộ thiết kế riêng (Device Twin, 8 ô LED, số ma trận chấm, gạch chéo) và khác bố cục / phong cách của V3.

**C. Khả dụng và kỹ thuật**
- [ ] Tương phản đạt ngưỡng ở cả hai chủ đề; vùng chạm ≥ 44 px.
- [ ] Đọc được ở 320, 390, 768, 1280, 1440, 1920.
- [ ] Mọi trạng thái trong mục 9 có khung hình.
- [ ] Chuỗi tiếng Việt đủ dấu, không bị cắt dòng; kiểm tra bằng bộ chuỗi thử.
- [ ] Portal WiFi chỉ dùng tài nguyên đóng gói sẵn.
- [ ] Làm được bằng HTML/CSS/JS thuần + Chart.js.

**D. Báo cáo**
- [ ] Bảng báo cáo có huy hiệu ID, đọc được khi in A4 đen trắng.

---

## 14. Quyết định đã chốt và rủi ro

### Quyết định đã chốt (06/11/2026)

| # | Vấn đề | Quyết định | Hệ quả thiết kế |
|---|---|---|---|
| 1 | Màu báo động | ~~Thuần trắng–đen~~ → **Đã đảo ngày 06/11/2026: thêm màu nhấn có chủ đích** | Lý do: chủ dự án thấy phong cách thuần đen–trắng hơi cổ điển và người dùng chưa nhận ra ngay thông tin cần chú ý. Thêm `--accent-alert / ok / warn` + 3 màu dữ liệu (mục 5.1); cảnh báo = màu báo động **chồng lên** đảo màu + gạch chéo + chữ (không thay thế). Nhiệt độ/CO₂ vẫn không mang nghĩa tốt/xấu. Đã so sánh 3 phương án A/B/C, áp dụng C (DECISIONS mục 6) |
| 2 | Mục đích bộ thiết kế | **So sánh với V3** | Không đụng tới báo cáo đã nộp; không bắt buộc giữ khớp từng chi tiết của V3 |
| 3 | Trường đăng ký | **Tên đăng nhập** | Biểu mẫu: tên đăng nhập + mật khẩu + xác nhận mật khẩu |
| 4 | Xác nhận trạng thái LED | **Không** (firmware không gửi lại) | Chỉ ghi "Đã gửi lệnh"; không có trạng thái "đã xác nhận"; không đồng bộ màu từ thiết bị |
| 5 | Trạng thái liên kết Telegram | **Không** có | Trang Telegram chỉ là hướng dẫn 3 bước + quy tắc; không nhãn "Đã liên kết" |
| 6 | Chu kỳ gửi bản tin | **~30 giây** | "Dữ liệu cũ" khi quá 90 giây không có bản tin |
| 7 | Khoảng nghỉ cảnh báo | **30 phút** | Ghi trong trang Telegram; đây là giá trị do bạn chọn khi lập kế hoạch, cần đảm bảo backend dùng đúng |
| 8 | Ngôn ngữ | **Chỉ tiếng Việt** | Chuỗi vẫn tách riêng để sau này mở rộng |

### Vẫn còn mở

- **Tên bot Telegram:** chưa có, dùng chỗ giữ chỗ `@<tên_bot>` trong khung hình; điền khi nhóm tạo bot.
- **Thang hiển thị nhiệt độ / CO₂** (10 – 40 °C; 400 – 2000 ppm): giả định trong Phụ lục B, cần đối chiếu với dữ liệu thật sau khi hiệu chuẩn MQ-135 (phụ lục A MQ135 chưa được đọc).
- **Cảnh báo Telegram đã gửi hay chưa** không hiển thị trên website (backend không cung cấp); nếu nhóm muốn thể hiện thì cần thêm việc ở backend.

### Rủi ro

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| `reqwise-figma` không tạo được vector/SVG, nét đứt, cung tròn, hai mode biến (đã xác nhận ở lượt thử) | Trung bình | Đã có cách thay thế (gauge vòng chia đoạn, dãy thanh ngắn, hai bộ biến); ảnh chụp lớn hay quá thời gian nên chia khung nhỏ |
| Quá nhiều khung hình so với thời gian | Trung bình | Chia P0/P1/P2; chỉ P0 phải xong ở G1 |
| Phong cách "ấn tượng" làm giảm khả dụng với người không chuyên | Trung bình | Kiểm tra 5 giây; hướng dẫn 3 bước; thử với một người ngoài nhóm |
| Font không đủ dấu tiếng Việt | Thấp | Kiểm tra ở G0; dự phòng Be Vietnam Pro / IBM Plex Mono |
| Giao diện đẹp nhưng không dựng được bằng Chart.js / HTML thuần | Trung bình | Mọi đặc tả phải kèm cách dựng; ưu tiên SVG/Canvas + CSS |
| WiFiManager không cho tùy biến sâu | Trung bình | Thiết kế portal đơn giản có chủ đích (mục 7.9) |

---

## Phụ lục A — Đối chiếu ID ↔ thành phần giao diện

| ID | Desktop | Mobile | Thành phần chính |
|---|---|---|---|
| 1 | DK-04, 05, 13, 16 | MB-04, 05, 13, 16 | Gauge + số độ ẩm / nhiệt độ, điểm B trên Device Twin |
| 2 | DK-04, 05, 13 | MB-04, 05, 13 | Gauge + số CO₂ ước lượng, điểm C, trạng thái làm nóng |
| 3 | DK-04, 06, 07 | MB-04, 06, 07 | Cửa sổ LED 8 ô, lưới màu, bộ chọn, Bật/Tắt, Áp dụng / Hủy, điểm D |
| 4 | DK-08, 09 | MB-08, 09 | Ghi chú "lưu tự động", mốc thời gian dữ liệu |
| 5 | DK-04 (sparkline), 05, 08 – 11 | MB-04, 05, 08 – 11 | Chọn giờ/ngày, khoảng thời gian, biểu đồ, bảng số |
| 6 | DK-12, 16 | MB-12, 16 | Quy tắc ngưỡng 30–85%, trạng thái cảnh báo, khoảng nghỉ |
| 7 | DK-12 | MB-12 | `/doam`, `/trangthai` và ví dụ trả lời |
| 8 | DK-01 – 03, 14, 15 | MB-01 – 03, 14, 15 | Đăng ký, đăng nhập, phiên, đăng xuất, chặn dữ liệu khi hết phiên |
| 9 | Mọi màn | Mọi màn | Thanh trạng thái, rail / tab, nhịp WebSocket, khung dùng chung |
| 10 | DK-13, 15 | MB-13, 15, PT-01 – 04 | Portal WiFi, hướng dẫn BOOT 5 giây, điểm E |

## Phụ lục B — Bộ dữ liệu minh họa dùng chung

| Chỉ số | Giá trị | Ghi chú |
|---|---|---|
| Độ ẩm | 64,5 % | Trong ngưỡng 30 – 85% |
| Nhiệt độ | 27,5 °C | Thang hiển thị 10 – 40 °C (cần xác nhận với phạm vi DHT22 sử dụng) |
| CO₂ ước lượng | 850 ppm | Thang hiển thị 400 – 2000 ppm; **không phân loại tốt / xấu** |
| Thời điểm | 14:30, UTC+7 | Dùng nhất quán |
| Trạng thái cảnh báo mẫu | Độ ẩm 88% | Chỉ dùng cho khung "ngoài ngưỡng" |
| Màu LED mẫu | Một màu có tên + HEX | Chọn ở G1 |
