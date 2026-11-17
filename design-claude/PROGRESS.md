# PROGRESS — Room Instrument (Claude)

File Figma `VLcCNTT`, trang **"Claude"** (gói Starter chỉ cho 3 trang → không tạo được trang `Claude · …`; các khu vực xếp theo **hàng có nhãn** `ROW 00 … ROW 08`, xem DECISIONS T1). Không đụng trang "Codex", "Gemini", collection "Reqwise Tokens".

Vị trí các hàng trên trang "Claude" (toạ độ y, sau khi dời ở bước cuối để không chồng hàng thành phần): 00 Bìa = 0 · 01 Nền tảng = 2000 · 02 Thành phần = 4400 · 03 Desktop = 11200 · 04 Mobile = 15200 · 05 Portal = 19200 · 06 Trạng thái = 22200 · 07 Bảng báo cáo = 27200 · 08 Bàn giao = 32200. Trong mỗi hàng, khung xếp theo thứ tự mã (DK-01 → DK-17 cách 1600 px; MB-01 → MB-17 cách 470 px). Đã kiểm: không còn khung nào chồng nhau trên trang.

---

## G1 — Nền tảng + lõi (P0) · xong

### Đã làm
- Dọn khung `SPIKE · Room Instrument` và bộ `Button` thử.
- **Biến** (collection `Room Instrument`, 1 mode): 22 màu `body/color/*` + `lid/color/*` (paper, surface, ink, ink-2, line, line-strong, track, invert-bg, invert-ink, invert-ink-2, invert-track), 10 màu `led/*`, `space/1…16` (4–64 px), `radius/0…2`, `stroke/hair|strong`, `type/*` (11 → 112 + `type/h1` 40, `type/h1-mobile` 28), `motion/*` (240/400/320/40/80/200 ms), `data/stale-after-s` 90, `data/interval-s` 30, `alert/humidity-low` 30, `alert/humidity-high` 85, `alert/cooldown-min` 30. Gắn biến (`applyVariable`) cho fill/stroke/khoảng cách/bán kính/cỡ chữ của mọi node dựng bằng hàm trợ giúp.
- **Thành phần (hàng 02):**
  | Nhóm | Component (node id) |
  |---|---|
  | Họa tiết | `Pattern/Hatch/Ink` 92:6972 · `Pattern/Hatch/Paper` 92:7149 · `Line/Dashed/H-1px` 92:7237 · `H-2px` 92:7334 · `V-1px` 92:7431 · `V-2px` 92:7528 |
  | Gauge – vòng 61 đoạn | `Gauge/Ring/Humidity-L` 92:7625 · `Humidity-M` 92:7725 · `M` 92:7821 · `S` 92:7883 · `XS` 92:7945 |
  | Gauge – lắp sẵn (21) | `Gauge/Humidity/L|M` (64,5 · 88 · — · Paper/Ink/Lid-invert), `Gauge/Temperature/S|XS|M` (27,5 · —), `Gauge/CO2/S|XS|M` (850 · Làm nóng), bản Lid |
  | Device Twin | `DeviceTwin/Desktop · Body` 92:9953 · `· Offline` 92:10609 · `· Lid` 92:11667 · `DeviceTwin/Compact · Body` 92:11652 |
  | Biểu tượng | 31 `Icon/*` (Lucide, ISC) — giọt nước, nhiệt kế, gió, bóng đèn, nguồn, đồng hồ, WiFi, gửi, người dùng, đăng xuất, cảnh báo, làm mới, lịch, mũi tên, BOOT, hộp, khóa, mắt… |
  | LED | `LED/Strip-8/L` 92:12463 · `/M` 92:12482 · `/S` 92:12501 (State = On/Off) |
  | Điều khiển | `Button` 92:12533 (Primary/Secondary/Ghost × Default/Hover/Focus/Pressed/Disabled = 15) · `Toggle/Power` 93:12579 (On/Off × Default/Focus/Disabled) · `Chip/Color` 93:12602 · `Field` 93:12622 (Text/Password × Default/Focus/Error/Disabled) · `Segmented/Granularity` 93:12877 · `Segmented/Range` 93:12889 · `Stepper/Setup` 93:12911 (Step 1–3) |
  | Phản hồi | `Banner` 93:12955 (Info/Success/Warning/Error) · `Toast` 93:13169 (Sent/Failed) |
  | Điều hướng | `Nav/Rail` 93:13538 (Active 01–05) · `Nav/TabBar` 93:13889 (5 mục) · `Nav/StatusBar/Desktop` 93:14105 · `Nav/StatusBar/Mobile` 93:14487 (Online/Connecting/Stale/DeviceOffline/Disconnected) |
  | Khác | `Annot/ID` 92:12459 · `Panel/Screw` 93:15691 · `Auth/Hero · Desktop` 93:18327 · 12 `Spark/*-24h/L|S · Body|Lid` |
- **Màn hình P0 (13 khung):**
  | Mã | Node | Mã | Node |
  |---|---|---|---|
  | DK-01 Đăng nhập | 93:18993 | MB-01 Đăng nhập | 93:20420 |
  | DK-02 Đăng ký | 93:19692 | MB-02 Đăng ký | 93:20479 |
  | DK-04 Giám sát | 93:15694 | MB-04 Giám sát | 93:16991 |
  | DK-06 Đèn LED | 93:17471 | MB-06 Đèn LED | 93:17988 |
  | DK-07 Bộ chọn màu (popover) | 93:17712 | MB-07 Bộ chọn màu (bottom sheet) | 93:18138 |
  | PT-01 Chọn WiFi | 93:20568 | PT-02 Mật khẩu · đang kết nối | 93:20669 |
  | PT-03 Đã lưu · khởi động lại | 93:20725 | | |

### Kiểm tra
- `layout_audit` trên cả 13 khung: **0 lỗi chặn** sau khi sửa. Những mục audit còn báo và được giữ có chủ đích: (a) thanh nét đứt / gạch chéo là instance lớn nằm trong khung cắt (`Line/Dashed`, `Pattern/Hatch`) — cách dựng đã chốt; (b) chip màu trong vùng cuộn ngang của MB-06 (chỉ báo "còn nữa").
- Ảnh chụp đã xem: DK-04, MB-04, DK-06, popover DK-07, sheet MB-07, DK-02, MB-01, PT-01, PT-03 và các thành phần (gauge, twin, nút, điều khiển, thanh trạng thái).

### Lỗi / giới hạn gặp ở G1 và cách xử lý
| Gặp | Xử lý |
|---|---|
| `createPage` bị chặn (Starter 3 trang) | Hàng có nhãn trên trang "Claude" |
| `clipsContent` trên COMPONENT bị bỏ qua | Họa tiết = component chứa khung con cắt; khi dùng, đặt instance trong khung cắt do màn hình tạo (`hatchIn`, `dashIn`) |
| Không đổi được kích thước node con trong instance | Như trên |
| `lineHeight` bị bỏ qua (cả create và modify) | Dùng chiều cao dòng tự động của font (Space Grotesk ≈ 1,28; JetBrains Mono ≈ 1,32; Inter ≈ 1,21); CSS bàn giao đặt 1,5 cho thân, 1,25 cho tiêu đề |
| `layoutWrap` bị bỏ qua | Lưới màu chia thành các hàng 4 chip |
| `layoutPositioning: ABSOLUTE` bị bỏ qua | Panel hero đặt 4 vít bằng hàng trên/dưới `SPACE_BETWEEN`; lớp chú thích ID đặt ở bảng báo cáo (khung không auto-layout) |
| `layoutSizingHorizontal` bị bỏ qua; instance nút không giãn bằng `layoutAlign` | Dùng `layoutGrow` / `layoutAlign`; nút cần giãn thì đặt `primaryAxisSizingMode FIXED` + chiều rộng |
| Bóng `spread` không hiển thị; 16 bóng làm plugin treo khi kết xuất | Focus = viền trong 3 px (ghi CSS outline 2 px + offset 2 px trong HANDOFF) |
| Ảnh chụp bộ biến thể / khung có lớp phủ + bản sao lớn bị quá 90 giây | Chụp từng instance / từng khung con |
| `loadIcon` cần `{library:"lucide"}` | Đã dùng |

---

## G2 — Các màn P1 · xong

### Thành phần bổ sung
- Biểu đồ (hàng 02): `Chart/Line/Humidity-24h/Desktop` 93:20776 (0–100 %, ngưỡng 30/85 nét đứt + vùng gạch chéo, điểm vượt ngưỡng = ô đặc lớn, chú thích "87,4 % · 05:00"), `Chart/Line/Temperature-24h/Desktop` 93:21408 (thang nhìn gần 20–35 °C), `Chart/Line/CO2-24h/Desktop` 93:21485 (400–1200 ppm), `Chart/Bar/Humidity|Temperature|CO2-7d/Desktop` 93:21564 · 93:22099 · 93:22535 (cột từ 0, vạch lớn nhất, hôm nay gạch chéo + viền đứt), `Chart/Line/Humidity-24h/Mobile · Ruler` 93:22975 (thước đọc + nhãn phía trên ngón tay), `…Temperature/CO2-24h/Mobile` 93:23300 · 93:23369, `Chart/Bar/Humidity-7d/Mobile` 93:23436, `Chart/Line/Humidity-24h/Desktop · Gaps` 93:23898 (thiếu mốc 02:00–04:00, không nối đường, dấu "—").

### Khung (21)
| Mã | Node | Mã | Node |
|---|---|---|---|
| DK-03 Phiên hết hạn (hộp thoại, dữ liệu che bằng khối đặc) | 93:36198 | MB-03 Phiên hết hạn (trang) | 93:36315 |
| DK-05 Chi tiết chỉ số (ngăn trượt phải) | 93:33475 | MB-05 Chi tiết chỉ số (bottom sheet) | 93:35233 |
| DK-08 Lịch sử · theo giờ | 93:24525 | MB-08 Lịch sử · theo giờ | 93:27074 |
| DK-09 Lịch sử · theo ngày | 93:25487 | MB-09 Lịch sử · theo ngày | 93:27505 |
| DK-10 Bộ lọc khoảng ngày (popover) | 93:28073 | MB-10 Bộ lọc khoảng ngày (sheet) | 93:29178 |
| DK-12 Telegram | 93:29756 | MB-12 Telegram | 93:30207 |
| DK-13 Thiết bị & WiFi | 93:30620 | MB-13 Thiết bị & WiFi | 93:30822 |
| DK-15 Cài đặt lần đầu (bước ①) | 93:36351 | MB-15a/b/c Cài đặt lần đầu ①②③ | 93:36507 · 93:36579 · 93:36615 |
| DK-16 Cảnh báo độ ẩm 88 % | 93:31128 | MB-16 Cảnh báo độ ẩm 88 % | 93:32701 |
| PT-04 Kết nối thất bại | 93:30987 | | |

### Kiểm tra
- `layout_audit` + hàm `fitTexts` (chữ tràn ⇒ rộng = phần còn lại của khung cha) trên cả 21 khung: **0 lỗi chặn** ngoài các mục có chủ đích (họa tiết trong khung cắt, chip trong vùng cuộn ngang).
- Ảnh chụp đã xem: DK-08, MB-08, popover DK-10, panel quy tắc + liên kết của DK-12, MB-12, DK-13, MB-16, ngăn chi tiết DK-05, hộp thoại DK-15, biểu đồ đường + cột.
- **Chưa chụp được** (quá 90 giây, kể cả scale 0,5): toàn khung DK-12, MB-15a. Đã kiểm bằng `layout_audit` và chụp từng phần con (DK-12: panel liên kết + quy tắc; DK-15: hộp thoại cùng nội dung bước ①).

### Lỗi / giới hạn gặp ở G2
| Gặp | Xử lý |
|---|---|
| Hatch lát 480 px bị lệch sọc ở mối nối | Bước lát 475,2 px = 42 × 8√2 (chu kỳ sọc) |
| `searchNodes` không phân biệt hoa/thường → `setText` theo từ khóa ghi đè nhầm chip "NGƯỠNG" ở DK-16/MB-16 | Đã đặt lại; từ đó chỉ sửa chữ theo tên lớp |
| Ô ngày trong lịch rộng hơn khung 2 px (viền trong 2 px chiếm chỗ) | Chia lại theo chiều rộng thực |

---

## G3 — Hoàn thiện (P2 + kiểm tra) · xong (trừ MB-18/19)

### Khung màn P2 (6)
| Mã | Node | Mã | Node |
|---|---|---|---|
| DK-11 Bảng số liệu | 94:36660 | MB-11 Bảng số liệu | 94:37205 |
| DK-14 Tài khoản & phiên | 94:37409 | MB-14 Tài khoản & phiên (menu Thêm) | 94:37545 |
| DK-17 Giám sát · chủ đề Lid | 94:37666 | MB-17 Giám sát · chủ đề Lid | 94:39592 |

### Khung trạng thái (14, hàng 06) — đủ ma trận mục 9
| Mã | Node | Trạng thái |
|---|---|---|
| ST-01 | 94:40345 | Đang tải lần đầu: khung xương + 8 ô quét, không số giả |
| ST-02 | 94:40450 | WebSocket đứt: "MẤT KẾT NỐI", số giữ giá trị cuối + nhãn dữ liệu cũ, Thử lại |
| ST-03 | 94:41160 | Dữ liệu cũ > 90 giây: gauge nhạt, số gạch chéo, ghi thời điểm |
| ST-04 | 95:43325 | Thiết bị ngoại tuyến (desktop): Device Twin nét đứt, LED khóa + lý do |
| ST-05 | 95:42206 | Lỗi DHT22: "—", "không đọc được", không vẽ 0 |
| ST-06 | 95:42544 | MQ-135 đang làm nóng: không hiện giá trị |
| ST-07 | 95:42887 | Độ ẩm 24 % < 30 % (ca 88 % > 85 % = DK-16 / MB-16) |
| ST-08 | 95:46033 | LED: nháp / đang gửi / đã gửi lệnh / lỗi (giữ nháp) |
| ST-09 | 95:46111 | LED khi thiết bị ngoại tuyến (mobile) |
| ST-12a · ST-12b | 95:46407 · 95:46623 | Đăng nhập sai (trung tính) · Đăng ký lỗi (lỗi cạnh trường + banner) |
| ST-13 | 95:46945 | Lịch sử: đang tải / rỗng / lỗi / thiếu mốc |
| ST-14 | 95:47625 | Portal: không thấy mạng (sai mật khẩu = PT-04) |
| ST-15 | 95:47669 | Bộ lọc ngày không hợp lệ |
| (tham chiếu) | — | Phiên hết hạn = DK-03/MB-03 · Hướng dẫn Telegram không có trạng thái = DK-12/MB-12/MB-15c |

### Khung hỗ trợ
- `00 Bìa · Room Instrument` 95:47886 (khái niệm, 6 yếu tố nhận diện, bảng ID ↔ màn hình, dữ liệu minh họa).
- Nền tảng: `01-A Màu` 95:48783 · `01-B Chữ` 95:48925 · `01-C Khoảng cách · họa tiết · chuyển động · biểu tượng` 95:48970.
- Bảng báo cáo (hàng 07, bản dựng lại sau lượt rà soát): `07-1 Đăng nhập` 99:68298 · `07-2 Giám sát` 99:74790 · `07-3 Đèn LED` 99:79220 · `07-4 Lịch sử` 99:77761 · `07-5 Telegram` 99:79687 · `07-6 Thiết bị & WiFi` 100:83206 → PNG ở `design-claude/exports/` (scale 1; 2874–4436 px rộng).
- `08 Bàn giao · token & quy ước` 95:58612.
- Gauge bổ sung: `Gauge/Humidity/M/—`, `Gauge/Humidity/M/24`, `Gauge/Temperature/XS/—`.
- Tệp: `tokens.css`, `HANDOFF.md`, `DECISIONS.md` (mục 3–5 mới).

### Kiểm tra cuối
- `layout_audit` trên **59 khung** (40 màn + 14 ST + bìa + 3 nền tảng + bàn giao): **0 lỗi chặn thật**. Các mục audit còn lại đều có chủ đích: họa tiết trong khung cắt, chip trong vùng cuộn ngang, bản sao nền bị cắt theo khung 844 px của sheet/popover (MB-05/07/10), cảnh báo "overlay nằm dưới" (sheet cố ý nằm trên lớp phủ).
- Sửa ở lượt rà cuối: 9 nhãn "CO₂" trên mobile thành "CO₂ ước lượng"; 6 liên kết chữ mobile bọc vùng chạm 44 px; cột bảng DK-11 thêm khoảng cách 16 px; sheet MB-05/07/10 đặt lại sát đáy; chấm "hiện tại" của sparkline; bảng 2 và 4 dựng lại + xuất lại sau sửa.
- Dữ liệu minh họa nhất quán: độ ẩm 64,5 %, nhiệt độ 27,5 °C, CO₂ 850 ppm, 14:30 UTC+7 trên mọi màn thường; 88 % chỉ ở DK-16/MB-16 (+ 24 % ở ST-07); chuỗi 24 giờ kết thúc ở 64,5 / 27,5 / 850.
- Ảnh chụp đã xem ở G3: DK-11, MB-14, MB-17, hàng 1 của DK-17, ST-03, hàng 1 của ST-04, ST-08, bìa, 01-C, cả 6 bảng báo cáo.

### Giới hạn ảnh hưởng G3
- Plugin chậm dần khi tài liệu nặng (batch > 30 s, ảnh > 90 s) → đưa khung nhìn về node nhỏ trước khi thao tác (DECISIONS T11).
- Không dựng MB-18/19 (tùy chọn) và khung 320/768/1920 (DECISIONS D13, D14).

---

## Lượt rà soát chồng chữ / giảm chữ (sau G3) · xong

**Đã sửa**
- Device Twin (Body, Lid, Offline): kích thước "160 mm" chuyển xuống dưới hình chiếu đứng → không chen nhãn "USB · mặt sau"; chú giải B–E rút gọn.
- Gauge độ ẩm (10 component): nhãn "30"/"85" lùi vào trong, "85" nâng 6 px → không chạm vạch ngưỡng và kim 88 %. Chữ tâm "KHÔNG ĐỌC ĐƯỢC" (L/M: 2 dòng giữa nhãn 0 và 100), "ĐANG LÀM NÓNG" / "KHÔNG ĐỌC ĐƯỢC" (S: phía trên trục) → không đè nhãn thang.
- Thanh trạng thái (10 biến thể): thông điệp ngắn lại ("Cập nhật 3 giây trước", "Không có bản tin mới từ 14:28 (2 phút)"…).
- DK-04 + DK-16, DK-17, ST-04, nền DK-05: bỏ câu thừa (cảnh báo Telegram trong hero, "Thang hiển thị…", "Bật / Tắt gửi ngay"); khối Đèn LED chuyển sang cột phải thành panel riêng; thẻ ôm nội dung; panel Device Twin cao bằng cột phải (hết khoảng trống lớn trong thẻ).
- MB-04/16/17, nền MB-05: bỏ "Cập nhật 14:30" lặp với thanh trạng thái. DK-16/MB-16: banner rút còn 1 câu, chip "CAO HƠN 85 %", hero chỉ ghi "Ngưỡng 30–85 %".
- DK-06 + nền DK-07: bỏ panel "VỀ TRẠNG THÁI" (gộp vào "TRÊN HỘP"), bỏ câu giải thích Áp dụng/Hủy, ghi chú công tắc 1 dòng.
- MB-12: bỏ nhãn 0 % / 100 % (trước chồng "85 %100 %"); DK-12: chú thích quy tắc 1 câu.
- DK-13 / MB-13: 6 bước đổi WiFi → 4 bước; các dòng phụ tình trạng thiết bị rút gọn.
- DK-14 / MB-14: câu phiên và mật khẩu rút gọn. MB-15c: bỏ ô `/start` lặp. ST-02/03: bỏ dòng giờ lặp; ST-06: mô tả CO₂ 1 dòng.
- DK-01/MB-01 (gợi ý tên đăng nhập), DK-02/MB-02 (gợi ý mật khẩu lặp với hộp quy tắc): ẩn dòng gợi ý. `layout_audit` vẫn liệt kê 4 node ẩn này (vô hình, không chiếm chỗ).

- Đợt 2 (sau khi chụp kiểm): ST-07 dời nhãn "30" khỏi kim 24 %, chip "THẤP HƠN 30 %", bỏ câu lặp; ST-09 banner + ghi chú rút gọn (trước lặp ý với thanh trạng thái và nút hướng dẫn); ST-12a đổi lỗi dưới ô mật khẩu thành "Nhập lại mật khẩu." (trước trùng banner); ST-13 bỏ ghi chú kỹ thuật "truy vấn Firestore"; ST-15 bỏ banner trùng lỗi cạnh ô; MB-15c bỏ "có thể bỏ qua" lặp ở tiêu đề và ghi chú (nút "Bỏ qua, làm sau" đã nói); DK-02/MB-02 ẩn gợi ý thừa dưới "Xác nhận mật khẩu"; DK-05, ST-04 sửa hàng thẻ (thẻ tràn); ST-08 dời xuống dưới ST-04 (ST-04 cao thêm nên chồng lên).
- **6 bảng báo cáo dựng lại và xuất lại PNG** (`exports/07-1 … 07-6`, 18:38–18:53). Quy tắc đặt huy hiệu mới: mặc định tâm ở góc trên-trái ngoài vùng; với vùng nằm sát phụ đề / tiêu đề / màn kế bên dùng chế độ riêng theo vùng (lề trái, góc trên-phải, giữa mép trên, dưới mép dưới-phải). Đã chụp cả 6 bảng: **không huy hiệu nào che chữ, không hai huy hiệu chồng nhau**. Bảng 6 tăng khe giữa các màn lên 112 px để huy hiệu lề trái không lấn màn bên cạnh. PT-02 gộp "mạng đã chọn" + "mật khẩu" thành một vùng.

**Kiểm tra sau lượt sửa**
- `layout_audit` trên 30 khung đã sửa: 0 lỗi chặn (còn lại chỉ là mục có chủ đích + dòng gợi ý đã ẩn).
- Ảnh chụp đã xem: DK-04 (hàng 1), DK-06, DK-13, DK-14, MB-12 (quy tắc), hero DK-16 / MB-16, DK-02, ST-05, ST-06, ST-07, ST-09, ST-12a, ST-12b, ST-13, ST-14, ST-15, MB-13, MB-15c, gauge `humMnone`, `co2Swarm`, 6 bảng báo cáo.
- Kiểm chồng lấn giữa các khung trên trang "Claude": không còn.
- Chưa chạy lại `layout_audit` cho các khung không bị sửa trong lượt này (đã đạt ở lần kiểm trước).

## Lượt thêm màu có chủ đích (06/11/2026) · xong

Đảo quyết định #1 theo yêu cầu chủ dự án. Chi tiết bảng màu, số đo, so sánh A/B/C: `DECISIONS.md` mục 6.

### Đã làm
- **Biến:** 31 biến mới trong `Room Instrument` — `accent/*` (11, nền sáng), `accent-dark/*` (11, nền tối), `mono/*` (9, bản in).
- **Component (instance kế thừa):** `Nav/StatusBar/Desktop` + `/Mobile` (5 trạng thái: ok / warn / alert, gạch chéo màu), `Banner` (4), `Toast` (2), `Field` 4 biến thể Error, `Stepper/Setup` (bước xong = ok), 24 component `Gauge/*` (đoạn đạt theo màu dữ liệu, dải + vạch ngưỡng độ ẩm = alert), 11 `Chart/*` (đường/cột màu dữ liệu, ngưỡng + vùng ngoài ngưỡng + điểm vượt = alert), 12 `Spark/*`. Mới: `Pattern/Hatch/Alert`, `/AlertDark`, `/Warn`.
- **Khung có node rời đã sửa:** chip trạng thái hero (chấm ok/warn/alert) ở DK-04, MB-04, DK-05, MB-05, DK-16, MB-16, ST-02…07; hero cảnh báo (viền 3 px + dải màu) DK-16, MB-16, ST-07; banner cảnh báo DK-16/MB-16 chuyển sang biến thể **Lỗi**; DK-13/MB-13 (dòng kết nối); DK-15, MB-15a (ô chờ = warn), MB-15b (khối đã xong = ok); PT-01…04 + ST-14 (bước xong, vạch sóng, "Đã lưu", "Thất bại", "Không thấy WiFi"); DK-12/MB-12 (thang ngưỡng); DK-08/DK-10 (ô ghi chú ngoài ngưỡng); DK-11/MB-11 (cờ ▲ ngoài ngưỡng); ST-02/03/04 (nhãn "CŨ" = warn, khóa LED = alert); ST-08 (chip ĐÃ GỬI LỆNH / GỬI LỖI); ST-13 (biểu tượng lỗi); DK-14/MB-14 (nút **Đăng xuất** = màu nguy hiểm).
- **Chủ đề Lid:** DK-17 (101:94901) và MB-17 (101:94419) dựng lại từ DK-04/MB-04 có màu, hoán đổi sang `accent-dark/*` rồi gắn lại biến `lid/*` + `accent*` (542 + 387 node).
- **So sánh:** hàng `09 So sánh màu` (y ≈ 33 338): 9 khung `09-A/B/C DK-04 · DK-16 · MB-04`. Đã chụp: A/B/C MB-04, A DK-16, C DK-16, C DK-04 (hàng 1 DK-17 tương ứng). Áp dụng **C**.
- **Bảng báo cáo:** 6 bảng màu dựng lại (`07-1` 101:106500 · `07-2` 101:107430 · `07-3` 101:109286 · `07-4` 101:109753 · `07-5` 101:111212 · `07-6` 101:112131) + 6 bảng `· mono (in)` (y = 29 700; 101:112781 · 101:113711 · 101:115567 · 101:116034 · 101:117493 · 101:118412). PNG: `exports/07-*_mau.png` và `07-*_mono.png` (12 tệp, đã xem từng ảnh). Bảng 1 (đăng nhập ở trạng thái thường) không có màu nhấn nên hai bản giống nhau.
- **Tài liệu:** `tokens.css` (`--accent-*`, `--data-*`, mặt tối, `@media print` / `.ri-mono`, `.ri-hatch--alert|warn`), `HANDOFF.md` §3.10, `DECISIONS.md` §6, `KE_HOACH_THIET_KE_CLAUDE.md` (3.1 #5, 5.1, 9, 14 #1).

### Tự nghiệm thu (yêu cầu thêm màu)
- [x] Một điểm nhìn đầu tiên mỗi màn — *tự đánh giá* trên ảnh chụp: DK-16/MB-16 mắt rơi vào hero viền đỏ + banner đỏ ngay; DK-04/MB-04 bình thường rơi vào số hero đen. **Chưa thử với người ngoài nhóm, chưa đo thời gian thật.**
- [x] Màu báo động chỉ ở cảnh báo / lỗi / ngoại tuyến (và nút nguy hiểm Đăng xuất dùng `alert-text`); nhiệt độ và CO₂ chỉ có màu phân biệt chỉ số. *Lưu ý:* dải ngoài ngưỡng đỏ trên gauge độ ẩm hiện cả lúc bình thường (đánh dấu ngưỡng, theo yêu cầu P0).
- [x] Bản mono: 6 bảng `_mono` xuất và xem lại — trạng thái vẫn đọc được nhờ gạch chéo, viền, chữ. **Chưa in thử bản giấy.**
- [x] Tương phản: chữ có màu 4,86–5,65:1 (nền sáng), 6,02–10,94:1 (nền tối); chấm/viền 3,04–5,92:1 — DECISIONS §6.2.
- [x] `layout_audit` trên 44 khung đã sửa (30 màn + 14 ST): 0 lỗi chặn sau khi rút chữ 3 chip mobile (MB-16, ST-02, ST-07) bị chấm màu đẩy tràn. Mục còn lại có chủ đích: họa tiết trong khung cắt, chip cuộn ngang, nền bị cắt dưới sheet, dòng gợi ý đã ẩn.
- [x] Không còn hex cứng cho màu mới: kiểm bằng cách tạm đổi giá trị 15 biến accent và đọc lại fill trên 14 khung — mọi node đổi theo (đã sửa 3 chấm chip). **Chỉ kiểm fill, chưa kiểm stroke** theo cách này. Ngoại lệ có chủ đích: khung `09-A/B` và 6 bảng mono.
- [x] Dữ liệu minh họa không đổi: 64,5 % · 27,5 °C · 850 ppm · 14:30; 88 % chỉ DK-16/MB-16; 24 % ở ST-07.

## Lượt thiết kế lại trạng thái lỗi / cảnh báo (07/11/2026) · xong

### Đã làm
- **So sánh:** hàng `10 — SO SÁNH CẢNH BÁO` (`ROW 10` 107:119062, y = 38 400; cột ở y = 38 620): bản hiện tại + 10 hướng (node ở DECISIONS §7.3). Cột "Bản hiện tại" đã tách instance nên giữ nguyên hình cũ.
- **Chốt:** hướng 1 · Gạch đáy + dải đèn hiệu 3 mức (từ hướng 9) cho hero độ ẩm.
- **Thành phần:** `Field` Text/Password · Error (93:12616, 93:12620) — bỏ dải gạch chéo + viền 2 px, thêm `box-frame` › `box-line` + `edge-bottom` 2 px, ⚠ trong ô, bỏ ⚠ ở dòng lỗi. `Banner` Error (93:12954, ✕ → ⚠, bỏ nền nhạt) và Warning (93:12953, gạch đáy `accent/warn`). `Toast` Failed (93:13168).
- **Khung:** hero DK-16 (93:31179), MB-16 (93:32707), ST-07 (95:42906) — bỏ viền đỏ 3 px, dải "NGOÀI NGƯỠNG" + ô gạch chéo thay bằng `ID1-6/annunciator` 3 ô (DK chữ 12 px, mobile 11 px; ST-07 thắp ô "THẤP < 30 %"). PT-04 khối lỗi (93:31013) — bỏ dải gạch chéo, thêm ⚠ + gạch đáy 2 px; tiêu đề 16 px. Mọi màn dùng instance của các thành phần trên tự cập nhật (đã kiểm: banner DK-16/MB-16, ST-08, ST-12a, ST-12b, ST-15).
- **Tài liệu:** HANDOFF §2 (bảng thành phần), §3.10, §3.11 mới; `tokens.css` (`.ri-field--error`, `.ri-banner--*`, `.ri-toast--failed`, `.ri-annunciator`); DECISIONS §7; KE_HOACH mục 9.

### Tự nghiệm thu
- [x] `layout_audit` trên mọi màn DK/MB/PT/ST (46 khung): 0 lỗi mới. Mục còn báo là có chủ đích từ trước (họa tiết trong khung cắt, chip cuộn ngang, lớp phủ dưới sheet, dòng gợi ý đã ẩn ở biến thể Default).
- [x] Ảnh chụp đã xem: ST-12b, hero DK-16, MB-16, ST-07, khối lỗi PT-04, thẻ "GỬI LỖI" + toast ở ST-08.
- [x] Chữ ghi đè trong instance giữ nguyên (ST-12a, ST-12b, ST-15).
- [x] Màu mới gắn biến (`body/color/line-strong`, `accent/alert`, `accent/warn`, `accent/alert-text`, `accent-dark/*`).
- [x] Rà soát lần 2 (thiết bị ngoại tuyến): thanh trạng thái desktop + mobile (Dữ liệu cũ / Ngoại tuyến / Mất kết nối) chuyển sang gạch đáy; 9 nhãn "CŨ" ở ST-02/03/04 chuyển sang biểu tượng đồng hồ; sửa chú thích bìa + 01-C. `layout_audit` ST-02, ST-03, ST-04, ST-09 và 2 bộ thanh trạng thái: 0 lỗi. Ảnh đã xem: thanh Ngoại tuyến desktop + mobile, cột chỉ số ST-04. Chi tiết DECISIONS §7.7.
- [x] Bỏ hẳn gạch chéo đỏ (DECISIONS §7.8): cung đặc trên 2 vòng gauge độ ẩm (10 gauge gắn màu, 36/36 đoạn mỗi gauge), nền nhạt ở 3 biểu đồ độ ẩm (đã đưa xuống dưới đường dữ liệu), nền nhạt + gạch đáy ở thang Telegram (DK-12, MB-12, bảng 07-5, 07-5m), biểu tượng ⚠ ở 3 cờ DK-11. Quét lại toàn bộ màn, thành phần, bảng: 0 instance `Pattern/Hatch/Alert` ngoài hàng so sánh 09/10. `layout_audit` DK-11, DK-12, MB-12: 0 lỗi. Ảnh đã xem: gauge M 88 %, hero DK-16, thang DK-12, biểu đồ đường độ ẩm desktop, bảng 07-2.
- [x] Chạy lại `toMono` trên 6 bảng mono (ghi đè cũ đã mất trên 07-2m); quét fill: 0 node còn màu nhấn.
- [ ] **PNG:** đã xuất lại `07-2_…_mau`, `07-4_…_mau`. `07-5_…_mau/_mono` **không xuất được** (timeout) → đã vá trực tiếp trên PNG cũ: tô lại 4 vùng thang ngưỡng (nền `#FFEFEA` / trắng + gạch đáy 2 px `#FF4B1F` / mực) đúng tọa độ lấy từ Figma; phần còn lại của bảng không đổi. Còn cũ: `07-2_…_mono`, `07-4_…_mono` (cung gauge / vùng biểu đồ vẫn là gạch chéo xám).
- [x] Thuyết minh (`SmartClassroom/Docs/thuyet_minh.tex`, theo yêu cầu trực tiếp của chủ dự án 07/11/2026): mục 2.2 thay bộ V3 bằng ảnh màn hình gốc **không huy hiệu số** (chủ dự án yêu cầu "ảnh bình thường cho đẹp và đơn giản"): 16 khung xuất 2× qua Figma REST/MCP chính thức (`images/wireframes-room-instrument/clean/`, ghép `mb01-02`, `pt01-03`), không còn bảng vùng từng trang (chủ dự án bỏ) — ID ghi ở tiêu đề trang và chú thích hình, giữ một bảng tổng hợp theo ID cuối mục; mục 2.1 dùng `exterior-annotated.png`, `interior-annotated.png` (nhãn A–E + ID); mục 3.1 thêm ảnh 5 linh kiện + 3 vật liệu (`images/components/report/`). Biên dịch lại `16_24127261_24127542_24127581_PROPOSAL.pdf` (30 trang).
- [ ] Chưa thử với người dùng thật, chưa in giấy. Hàng 09 (so sánh màu) không cập nhật lại, nhưng banner và thanh trạng thái trong đó là instance nên đã đổi theo.

## Lượt Đèn LED theo thông số (12–13/11/2026) · xong

### Đã làm
- **Màn mới (ROW 03 / 04):** DK-06 Tự động (143:42029) · DK-06b Kiểm tra đèn (144:43377) · MB-06 Tự động (144:42903) · MB-06b Kiểm tra đèn (144:43634); DK-07 / MB-07 dựng lại trên nền mới. Bản cũ một màu chuyển xuống ROW 11 (lưu trữ).
- **Component:** `LED/Strip-8/L|M|S` màu mặc định mới + khe giữa các cặp; `DeviceTwin/*` màu mới, bản Desktop có nhãn 4 nhóm.
- **Lan ra:** 13 panel + 9 thẻ mobile Đèn LED ở Giám sát (gồm 09-A/B/C, ST-04, bảng 07-2/07-2m), 6 dòng `row/D · LED`, ST-08, ST-09, bảng 07-3 + 07-3m, bìa 00. Chạy lại ánh xạ mono trên 6 bảng mono.
- **Tài liệu:** HANDOFF §3.5 viết lại, §3.10 quy tắc 4, chuỗi `led.*`, dữ liệu minh họa; DECISIONS mục 8.

### Tự nghiệm thu
- [x] `layout_audit`: 0 lỗi mới ở các khung đã sửa (lỗi còn lại là nét đứt bị cắt có chủ đích và thanh cuộn ngang MB-06b).
- [x] Xem lại bằng ảnh dựng từ SVG: DK-06, MB-06, DK-06b, MB-06b, DK-07, ST-08, ST-09, thẻ DK-16 / MB-16, DeviceTwin Body, bảng 07-3 + 07-3m.
- [x] PNG `exports/` — xuất lại cả 12 bảng ngày 13/11/2026 (SVG → Edge, xem DECISIONS 8.5).

### Rà soát toàn file (13/11/2026)
- Sửa 4 chú giải LED cũ ở 07-2/07-2m, giờ ngoại tuyến ST-04/ST-09, biểu tượng chủ đề Lid (DK-17, MB-17, Device Twin Lid/Offline), ghi chú bìa / 01-A / 01-C / 08 / tiêu đề ROW, mô tả 10 component, `tokens.css` bảng 9 màu. Chi tiết: DECISIONS 8.5.
- [ ] Ngưỡng và kiểu nháy là số tạm / đề xuất — chờ nhóm chốt.


### Năm nâng cấp (13/11/2026)
- [x] Nhãn mức nhiệt độ / CO₂ (18 thẻ) + ST-16 mẫu Cần chú ý.
- [x] ST-17 cảnh báo hai mức trùng màu.
- [x] Thẻ Đèn LED nháy trắng trên ST-05, ST-06.
- [x] Thanh LED mobile rộng hết thẻ (`LED/Strip-8/M · Mobile`), đơn vị ppm, chú giải 4 nhóm đèn dưới hình thiết bị.
- [x] Hàng 12: RS-320, RS-768, RS-1280, RS-1920 (mục C "chưa có khung" ở tự nghiệm thu đã có).
- [x] Hình 9 thuyết minh + PDF, `exports/07-2_*`. Chi tiết: DECISIONS 8.6.
## Tự nghiệm thu (mục 13 của kế hoạch)

**A. Bao phủ chức năng**
- [x] Mỗi ID 1–10 có ít nhất một khung desktop và một khung mobile/portal — xem bảng ID ↔ màn hình trên `00 Bìa`.
- [x] Mỗi vùng truy được về một ID: lớp vùng đặt tên `ID<n>/…`; 6 bảng báo cáo có huy hiệu + chú giải vùng → ID. (Node lá trong vùng kế thừa ID của vùng.)
- [x] Cả 3 chỉ số có gauge **và** số; CO₂ luôn có "ước lượng / tham khảo" (đã sửa 9 nhãn mobile thiếu ở lượt cuối).
- [x] LED chỉ có chọn màu + bật/tắt; không slider độ sáng, không điều khiển từng bóng; chỉ "Đã gửi lệnh".
- [x] Ngưỡng < 30 % và > 85 %; khoảng nghỉ 30 phút (DK-12, MB-12, DK-05, DK-16 …).
- [x] Luồng 3 bước cho người không chuyên: DK-15, MB-15a/b/c (bước ③ bỏ qua được).

**B. Chất lượng thị giác**
- [x] "Kiểm tra 5 giây" — *tự đánh giá* trên DK-04/MB-04: thấy hộp đo gì (Device Twin + nhãn), giá trị đang xem (số Doto lớn), đèn màu gì (cửa sổ 8 ô + tên/HEX), có kết nối không (thanh trạng thái). **Chưa thử với người ngoài nhóm.**
- [x] "Kiểm tra nheo mắt" — *tự đánh giá*: hero đảo màu nổi nhất, sau đó 2 thẻ, rồi dải 24 giờ.
- [x] Nhận diện riêng (Device Twin, 8 ô LED, số ma trận chấm, gạch chéo), không card bo tròn, không masthead ngang.

**C. Khả dụng và kỹ thuật**
- [x] Tương phản đạt ở cả hai chủ đề (đo bằng công thức, DECISIONS mục 2); vùng chạm ≥ 44 px (nút 48, chip 56, tab 68, công tắc 44, ô nhập 48, liên kết mobile 44).
- [x] Đọc được ở 320, 768, 1280, 1920 — khung RS-xx ở hàng 12 (13/11/2026), quy tắc HANDOFF §4.
- [x] Mọi trạng thái trong mục 9 có khung (ST-01 … ST-15 + DK/MB-03, DK/MB-16, PT-04).
- [x] Chuỗi tiếng Việt đủ dấu, không bị cắt (layout_audit + `fitTexts`); chuỗi thử "Độ ẩm · Nhiệt độ · Chất lượng không khí · Ước lượng · Đăng nhập · Khoảng nghỉ" có ở 01-B cho mọi cỡ.
- [x] Portal chỉ dùng tài nguyên đóng gói sẵn (thiết kế: system-ui, SVG nhúng; Inter chỉ để minh họa trong Figma).
- [x] Làm được bằng HTML/CSS/JS thuần + Chart.js (HANDOFF §3 có cách dựng gauge SVG, plugin vùng ngưỡng, pattern gạch chéo).

**D. Báo cáo**
- [x] Bảng báo cáo có huy hiệu ID; chữ chú giải ≥ 8 pt khi in vừa A4 ngang (công thức D12); bảng thuần đen–trắng–xám nên in đen trắng không mất thông tin. *Chưa in thử bản giấy.*

**Tổng số khung:** G1 = 13 màn P0 (+ thư viện ~120 component/biến thể) · G2 = 21 màn · G3 = 6 màn P2 + 14 ST + 1 bìa + 3 nền tảng + 6 bảng báo cáo + 1 bàn giao. Tổng màn sản phẩm: **40** (DK 17 · MB 19 · PT 4).
