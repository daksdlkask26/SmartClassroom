# PROMPT cho Claude Code CLI — dựng toàn bộ bộ thiết kế "Room Instrument"

> Dán nguyên phần trong khung dưới đây vào CLI (mở CLI tại thư mục `D:\HCMUS\NAM 3\VLCNTT\PROJECT - VLcCNTT`, đã bật MCP `reqwise-figma` và plugin Figma đang mở file `VLcCNTT`).

```
Bạn là nhà thiết kế sản phẩm kiêm lập trình viên giao diện. Hãy dựng TOÀN BỘ bộ thiết kế giao diện "Room Instrument" cho đồ án Smart Classroom (nhóm 16) trong Figma, tự chạy liên tục từ đầu đến cuối, không dừng hỏi trừ khi gặp chướng ngại thật sự.

## 1. Nguồn sự thật
- Đọc TOÀN BỘ file `D:\HCMUS\NAM 3\VLCNTT\PROJECT - VLcCNTT\design\KE_HOACH_THIET_KE_CLAUDE.md` trước khi làm bất cứ thứ gì. Đó là kế hoạch đã được duyệt: ý tưởng chủ đạo, design system, danh mục màn hình, đặc tả từng màn, trạng thái, nghiệm thu, và mục 12.3 (kết quả lượt thử công cụ Figma). Mục 14 liệt kê các quyết định đã chốt — KHÔNG hỏi lại.
- Khi cần đối chiếu yêu cầu gốc, đọc các PDF trong `SmartClassroom\Docs\` : `16_24127261_24127542_24127581_PROPOSAL.pdf` (chức năng ID 1–10, sơ đồ luồng, hộp 3D), `reference\TCTA_QUY ĐỊNH ĐỒ ÁN CUỐI KỲ.pdf`, `reference\TCTA_YÊU CẦU THUYẾT MINH DỰ ÁN.pdf`. Tên file có dấu tiếng Việt có thể đọc lỗi: nếu vậy, copy sang tên đơn giản trong thư mục scratchpad rồi đọc.
- TUYỆT ĐỐI KHÔNG dùng `huong_dan_wireframe_v3.md`, thư mục `wireframes-v3`, prototype, hay trang "Codex"/"Gemini" trong Figma làm đầu vào hoặc tham chiếu hình thức. Đây là phương án độc lập để so sánh.

## 2. Công cụ
- Skill `ui-ux-pro-max`: gọi trước khi chốt design system (đối chiếu màu, cặp chữ, kiểu biểu đồ, checklist UX/accessibility) và lần nữa khi rà soát cuối. Ghi lại những điểm skill gợi ý mà bạn chấp nhận hoặc bác bỏ (kèm lý do) vào `design/DECISIONS.md`.
- MCP `reqwise-figma` (figma_status, figma_docs, figma_rules, figma_read, figma_write). Bắt đầu bằng figma_status, rồi figma_docs các mục rules, api, recipes. Không phải API Figma chính thức: dùng đúng các hàm trong figma_docs.

## 3. Phạm vi ghi (rất quan trọng)
- Trong Figma file `VLcCNTT`: chỉ làm việc ở trang "Claude" và các trang MỚI có tiền tố "Claude · " (tạo bằng createPage; nếu bị giới hạn gói thì quay về dùng trang "Claude" với các khung xếp theo hàng có nhãn). KHÔNG sửa, xóa hay di chuyển gì ở trang "Codex", "Gemini", và KHÔNG đụng collection biến "Reqwise Tokens".
- Biến: dùng collection "Room Instrument" đã tạo (hiện có 8 biến body/… và lid/…). Có thể xóa khung `SPIKE · Room Instrument` và bộ `Button` thử trên trang "Claude" khi bắt đầu dựng thật.
- Trên đĩa: KHÔNG sửa bất cứ thứ gì trong thư mục `SmartClassroom\` (đó là repo của nhóm). Mọi tệp đầu ra ghi vào thư mục mới `design\` ở gốc dự án: `PROGRESS.md`, `DECISIONS.md`, `tokens.css`, `HANDOFF.md`, `exports\` (PNG các bảng báo cáo).

## 4. Quyết định đã chốt (không hỏi lại)
- Thuần trắng–đen–xám; KHÔNG có màu báo động. Màu thật duy nhất là màu LED người dùng chọn. Cảnh báo = nền đảo màu + gạch chéo + chữ.
- Bộ này chỉ để so sánh với V3. Chỉ tiếng Việt. Đăng ký bằng tên đăng nhập (không email).
- LED chỉ có: chọn màu (lưới màu có tên + tùy chỉnh + HEX) và bật/tắt. KHÔNG slider độ sáng, KHÔNG điều khiển từng bóng. Chỉ ghi "Đã gửi lệnh", không bao giờ "đã xác nhận / đèn đã sáng".
- Telegram: chỉ hướng dẫn 3 bước + quy tắc; KHÔNG nhãn "Đã liên kết/Chưa liên kết"; KHÔNG hiển thị cảnh báo đã gửi hay chưa. Ngưỡng độ ẩm < 30% hoặc > 85%; khoảng nghỉ giữa hai lần cảnh báo = 30 phút. Tên bot là chỗ giữ chỗ `@<tên_bot>`.
- ESP32 gửi bản tin ~30 giây; "dữ liệu cũ" khi quá 90 giây.
- Cả 3 chỉ số (độ ẩm, nhiệt độ, CO₂ ước lượng) đều có GAUGE và SỐ. CO₂ luôn ghi "ước lượng · tham khảo", không phân loại tốt/xấu; nhiệt độ cũng không tô tốt/xấu. Chỉ độ ẩm có vùng ngưỡng 30–85%.
- KHÔNG thêm chức năng ngoài ID 1–10 (không email, AI/dự đoán, nhiều phòng, xuất file, cài đặt ngưỡng...). Mọi thành phần phải truy được về một ID.

## 5. Giới hạn công cụ đã kiểm chứng (thiết kế quanh chúng)
- `create` bỏ qua `rotation` → tạo xong phải `modify(rotation)` (dùng figma.batch với op "modify"). Xoay quanh góc trên-trái; công thức vị trí đã dùng ở lượt thử: thanh dài theo hướng cục bộ +y, vector hướng sau xoay = (sinθ, cosθ) với θ độ ngược chiều kim đồng hồ.
- KHÔNG tạo được VECTOR/SVG, bỏ qua arcData, bỏ qua nét đứt (dashPattern/strokeDashes), mỗi collection biến chỉ 1 mode.
  → Gauge = vòng chia đoạn 61 thanh hướng tâm trên cung 240° (đoạn đạt = đen, còn lại = xám, vạch lớn mỗi 10 đoạn) + kim + trục. Vùng ngoài ngưỡng 30–85% = gạch chéo.
  → Họa tiết gạch chéo 45° = khung cắt (clipsContent) chứa các thanh mảnh xoay −45°. Nét đứt = dãy thanh ngắn. Làm thành COMPONENT (`Pattern/Hatch`, `Line/Dashed`, `Gauge/…`) rồi dùng instance.
  → Hai chủ đề = hai bộ biến `body/…` và `lid/…` (không dùng mode).
  → Đường nét (line-art) của Device Twin = RECTANGLE mảnh / LINE / FRAME có viền; không có vector.
- Doto (chữ số ma trận chấm) CHỈ cho chữ số; đơn vị (%, °C, ppm) và dấu thập phân đặt bằng JetBrains Mono nhỏ bên cạnh vì `%` và dấu phẩy trong Doto khó đọc.
- Font đã xác nhận có sẵn và hiển thị đủ dấu tiếng Việt: Space Grotesk (Regular/Medium/Bold), JetBrains Mono, Doto, Be Vietnam Pro, IBM Plex Mono. Tiêu đề có dấu: line-height ≥ 1,25.
- `children` trong createVariants bị bỏ qua → thêm nhãn chữ vào từng biến thể sau bằng create. Ghi đè màu theo biến thể hoạt động.
- Chụp ảnh (screenshot) khung lớn hoặc bộ biến thể từng bị quá thời gian 90 giây: chỉ chụp từng khung nhỏ/riêng lẻ, scale 1–2; nếu timeout thì thử lại một lần trên node nhỏ hơn. Dùng layout_audit làm kiểm tra chính, ảnh chụp chỉ để xác nhận thị giác lần cuối.
- Dựng nhiều đối tượng giống nhau bằng figma.batch (resultDetail "ids"). Dùng `state` để giữ id và các hàm trợ giúp (buildGauge, buildHatch, buildDashedLine, buildLedStrip, buildDeviceTwin, buildDotNumber...). Khung hình lớn thì mỗi bảng/màn dựng thành khung riêng, ưu tiên instance.

## 6. Việc cần làm, theo thứ tự (làm hết, không dừng giữa chừng)
G1 — Nền tảng + lõi (ưu tiên P0 trong mục 6.2 của kế hoạch):
 1. Dọn khung SPIKE; hoàn chỉnh biến `body/…` + `lid/…` (màu, khoảng cách, bán kính 0–2, cỡ chữ). Tạo text styles nếu được. Gọi skill ui-ux-pro-max để đối chiếu rồi ghi DECISIONS.md.
 2. Thư viện thành phần (mục 8 của kế hoạch): rail, thanh trạng thái 8 ô LED, tab dưới, panel (thường/đảo màu/hero có 4 chấm vít), nút, công tắc, chip màu, ô nhập, nhóm phân đoạn, thanh bước, banner/toast, huy hiệu ID, Gauge (3 chỉ số, các trạng thái), số ma trận chấm, hàng 8 ô LED, Device Twin, sparkline, biểu đồ đường/cột mẫu. Mỗi cái có biến thể sáng/tối và desktop/mobile khi cần.
 3. Các màn P0 ở cả desktop 1440 và mobile 390: Đăng nhập, Đăng ký, Giám sát (dashboard), Đèn LED + bộ chọn màu; và 4 màn portal WiFi 390: PT-01, PT-02, PT-03 (PT-04 ở G2). Portal chỉ dùng system-ui và hình đơn giản.
G2 — Các màn P1: Phiên hết hạn, Chi tiết chỉ số (ngăn trượt), Lịch sử theo giờ + theo ngày + bộ lọc khoảng ngày, Telegram, Thiết bị & WiFi, Cài đặt lần đầu (3 bước), trạng thái cảnh báo độ ẩm, PT-04.
G3 — Hoàn thiện (P2 + kiểm tra): Bảng số liệu, Tài khoản & phiên, chế độ tối "Lid" của dashboard, tất cả khung trạng thái trong mục 9 của kế hoạch, MB-18/19 nếu còn thời gian.
Cuối cùng:
 4. Lớp chú thích ID và 6 "bảng báo cáo" (Đăng nhập · Giám sát · Đèn LED · Lịch sử · Telegram · Thiết bị & WiFi/portal): mỗi bảng đặt desktop + mobile cạnh nhau, huy hiệu số trên từng vùng và bảng chú giải vùng → ID; chữ đọc được khi in A4 đen trắng. Xuất PNG vào `design\exports\`.
 5. Xuất `tokens.css` (dùng exportTokens rồi sửa tiền tố `--body-`/`--lid-` thành `:root` và `[data-theme="lid"]`), viết `HANDOFF.md` (quy ước đặt tên, danh sách thành phần, hành vi gauge/biểu đồ/chuyển động, danh sách chuỗi nội dung, cách dựng bằng HTML/CSS/JS thuần + Chart.js).
 6. Tự nghiệm thu theo mục 13 của kế hoạch: tick từng mục, ghi kết quả vào PROGRESS.md; chạy layout_audit trên mọi khung; sửa mọi lỗi tràn/cắt chữ; kiểm tra dữ liệu minh họa nhất quán (độ ẩm 64,5%, nhiệt độ 27,5 °C, CO₂ 850 ppm, 14:30 UTC+7; ca cảnh báo 88%).

## 7. Quy ước
- Khung: desktop 1440 × cao theo nội dung; mobile/portal 390 × cao theo nội dung. Tên khung theo mã trong kế hoạch: `DK-04 Giám sát`, `MB-04 Giám sát`, `PT-01 Chọn WiFi`, `ST-xx ...`. Tên lớp: `ID1/humidity/gauge`.
- Dùng auto layout và biến cho mọi màu/khoảng cách; không giá trị cứng. Mọi TEXT có màu và cỡ chữ rõ ràng. Tương phản ≥ 4,5:1, vùng chạm mobile ≥ 44 px, không dựa vào màu để truyền thông tin.
- Văn bản UI bằng tiếng Việt đủ dấu, theo giọng văn mục 10.3 của kế hoạch.
- Sau mỗi giai đoạn, ghi vào `design\PROGRESS.md`: đã xong gì (kèm node id các khung), còn gì, lỗi/giới hạn gặp phải, cách xử lý.

## 8. Khi gặp chướng ngại
Nếu một thứ không làm được bằng công cụ, chọn cách thay thế gần nhất giữ đúng ý đồ thiết kế và ghi vào DECISIONS.md; chỉ dừng hỏi nếu việc đó làm sai một chức năng ID hoặc phải sửa thứ nằm ngoài phạm vi ghi ở mục 3.

## 9. Khi xong
Báo cáo ngắn gọn: số khung đã dựng theo từng giai đoạn, mục nghiệm thu nào đạt/chưa đạt, các giới hạn công cụ ảnh hưởng thiết kế, đường dẫn tới `design\` và tên các trang Figma đã tạo. Không tuyên bố hoàn thành những gì chưa được kiểm tra bằng layout_audit hoặc ảnh chụp.
```
