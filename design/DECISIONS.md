# DECISIONS — Room Instrument (Claude)

Nhật ký quyết định khi dựng bộ thiết kế trong Figma. Nguồn yêu cầu: `KE_HOACH_THIET_KE_CLAUDE.md` (mục 14 = đã chốt, không bàn lại).

## 1. Đối chiếu với skill `ui-ux-pro-max` (lượt 1, trước khi chốt design system)

Lệnh đã chạy: `--design-system "IoT environment monitoring dashboard monochrome instrument" --density 7`, `--domain chart` (real-time gauge, time series threshold), `--domain style` (swiss minimal monochrome), `--domain typography` (technical monospace grotesk), `--domain ux` (touch target, color-only, error placement, password visibility, sticky nav).

| Gợi ý của skill | Quyết định | Lý do |
|---|---|---|
| Phong cách **Glassmorphism**, nền xanh đen `#0F172A`, nhấn xanh lá `#22C55E` | **Bác bỏ** | Kế hoạch đã loại glass/gradient (mục 3.2); đã chốt thuần trắng–đen–xám (mục 14 #1). Không in đen trắng được. |
| "Status colors green/amber/red" | **Bác bỏ** | Đã chốt không màu báo động. Trạng thái = đảo màu + gạch chéo + chữ. |
| Phông **Fira Code + Fira Sans** | **Bác bỏ** | Giữ Space Grotesk + JetBrains Mono + Doto (đã kiểm tra đủ dấu tiếng Việt ở lượt thử). Fira không mang lại gì thêm. |
| Phong cách **Minimalism & Swiss** (`--border-radius: 0`, `--shadow: none`, một màu nhấn) | **Chấp nhận** | Trùng với kế hoạch: góc 0–2 px, không bóng mờ, màu nhấn duy nhất là màu LED. |
| Gauge: "đặt số và ngưỡng cạnh gauge, gắn nhãn vùng ngưỡng; đỏ/vàng/xanh là không đủ" | **Chấp nhận** | Mỗi gauge có số + đơn vị + dòng ngưỡng bằng chữ; vùng ngoài ngưỡng là dải gạch chéo. |
| Gauge: gradient đỏ → vàng → xanh | **Bác bỏ** | Trái quyết định đơn sắc; nhiệt độ và CO₂ không được tô tốt/xấu. |
| Chuỗi thời gian: Line Chart, phân biệt bằng kiểu nét liền/đứt/chấm + nhãn trực tiếp, có bảng số thay thế, Chart.js | **Chấp nhận** | Khớp mục 5.6. |
| Streaming area chart cho dữ liệu ≥ 1 Hz | **Bác bỏ** | ESP32 gửi ~30 giây/lần (≪ 1 Hz) → skill tự nêu "update < 1/min → periodic line chart"; dùng sparkline + biểu đồ đường định kỳ. |
| Dữ liệu trực tiếp phải ghi thời điểm cập nhật và trạng thái cũ | **Chấp nhận** | Thanh trạng thái ghi "cập nhật X giây trước", "dữ liệu cũ" khi > 90 giây. |
| Vùng chạm 44 pt (iOS) / 48 dp (Android), web tối thiểu 24 px; khoảng cách ≥ 8 px | **Chấp nhận, siết hơn** | Dùng 44 px cho mọi vùng chạm mobile (yêu cầu của kế hoạch), khoảng cách ≥ 8 px. |
| Lỗi biểu mẫu đặt ngay dưới trường, nối bằng `aria-describedby`; có nút hiện/ẩn mật khẩu; cho dán mật khẩu | **Chấp nhận** | Ô mật khẩu có nút "Hiện"; lỗi cạnh trường + banner tóm tắt. |
| Thanh điều hướng cố định không được che nội dung | **Chấp nhận** | Mobile: nội dung có đệm dưới bằng chiều cao tab bar + nút Áp dụng dính. |
| Font JetBrains Mono "chỉ dùng 12/14/16, weight 400" | **Chấp nhận một phần** | Dùng mono 11–14 cho nhãn, weight Regular/Medium; không dùng mono cho đoạn văn dài. |

## 2. Đo tương phản (WCAG 2.x, tính bằng công thức độ chói tương đối)

| Cặp | Tỉ lệ | Kết luận |
|---|---|---|
| Body: ink `#0B0B0C` / paper `#F4F4F1` | 17,85 | Đạt AAA |
| Body: ink-2 `#55555A` / paper | 6,73 | Đạt AA chữ thường |
| Body: ink-2 / surface `#FFFFFF` | 7,41 | Đạt AAA |
| Body: line-strong `#8A8A90` / surface | 3,43 | Đạt 3:1 cho viền ô nhập / vạch chia |
| Lid: ink `#F4F4F1` / paper `#0E0E10` | 17,50 | Đạt AAA |
| Lid: ink-2 `#A5A5AB` / surface `#17171A` | 7,30 | Đạt AAA |
| Lid: line-strong `#6A6A70` / surface | 3,33 | Đạt 3:1 |
| Đảo màu: ink-2 đảo `#A5A5AB` / nền đảo `#0B0B0C` | 8,03 | Đạt AAA |
| Track gauge `#C9C9C4` / surface | 1,66 | **Cố ý thấp** — đoạn chưa đạt là nền, không mang thông tin; thông tin nằm ở đoạn đen (19,7:1), kim và con số |

## 3. Quyết định do giới hạn công cụ / gói Figma

| # | Vấn đề | Cách xử lý |
|---|---|---|
| T1 | Gói Starter chỉ cho 3 trang → `createPage("Claude · …")` trả về fallback | Toàn bộ bộ thiết kế nằm trên trang **"Claude"**, chia thành các **hàng có nhãn** `00 Bìa`, `01 Nền tảng`, `02 Thành phần`, `03 Desktop`, `04 Mobile`, `05 Portal WiFi`, `06 Trạng thái`, `07 Bảng báo cáo`, `08 Bàn giao` (đúng cấu trúc mục 12.2, chuyển từ trang sang hàng). |
| T2 | Không tạo được cung tròn / vector | Gauge = vòng 61 đoạn hướng tâm trên cung 240° (đã chốt ở lượt thử). |
| T3 | Không có nét đứt | Dãy thanh ngắn (`Line/Dashed`). |
| T4 | Không có hình bình hành / nghiêng (chỉ có xoay) → không vẽ được hình hộp "nhìn từ trên nghiêng nhẹ" | Device Twin vẽ theo **hình chiếu vuông góc kiểu bản vẽ kỹ thuật**: hình chiếu bằng (nắp, 160 × 100) đặt trên hình chiếu đứng (mặt trước, 160 × 60), thẳng hàng như bản vẽ cơ khí. Đúng tinh thần "bản sao số", lại khớp ảnh hình chiếu trong thuyết minh. |
| T5 | 1 mode mỗi collection | Hai bộ biến `body/…` (sáng) và `lid/…` (tối); biến dùng chung không theo chủ đề đặt ở `space/…`, `radius/…`, `type/…`. |
| T6 | Biến chỉ gắn được bằng `applyVariable` từng node | Hàm trợ giúp tự gắn biến cho fill/stroke/khoảng cách/bán kính/cỡ chữ khi tạo (gom thành batch `apply_variable`); instance kế thừa từ component chính, ghi đè trong instance cũng gắn biến. |
| T7 | `lineHeight` bị bỏ qua (create + modify) | Chiều cao dòng tự động của font (Space Grotesk ≈ 1,28 ≥ 1,25 cho tiêu đề). CSS bàn giao đặt 1,5 cho thân. |
| T8 | `layoutWrap`, `layoutPositioning: ABSOLUTE`, `layoutSizingHorizontal` bị bỏ qua | Lưới màu chia hàng 4 chip; vít hero đặt bằng hàng `SPACE_BETWEEN`; huy hiệu ID chỉ đặt trên bảng báo cáo (khung thường); co giãn bằng `layoutGrow`/`layoutAlign` hoặc chiều rộng cố định. |
| T9 | Bóng `spread` không hiển thị; 16 bóng cứng làm plugin treo khi kết xuất | Focus trong Figma = viền trong 3 px (Primary: nền ink-2 + viền ink). CSS: `outline 2px` + `outline-offset 2px`. |
| T10 | Không đổi kích thước node con trong instance; COMPONENT bỏ qua `clipsContent` | `Pattern/Hatch` và `Line/Dashed` luôn đặt trong khung cắt do màn hình tạo (`hatchIn`, `dashIn`). Bước lát hatch 475,2 px = 42 × 8√2 để sọc không lệch ở mối nối. |
| T11 | Ảnh chụp khung lớn quá 90 giây; plugin chậm dần khi tài liệu nặng | **Đưa khung nhìn Figma về một node nhỏ (`zoomToFit` huy hiệu ID) trước khi chụp/xuất** — thời gian dựng một khung giảm từ > 30 s xuống ~2 s và chụp lại được khung lớn (kể cả bảng 4212 px). |
| T12 | `searchNodes` không phân biệt hoa/thường | Chỉ sửa chữ theo tên lớp, không theo nội dung (đã gây ghi đè nhầm chip ở DK-16, đã sửa). |
| T13 | Chủ đề Lid cho rail / thanh trạng thái / tab / nút chưa có component riêng | DK-17, MB-17 tạo bằng **hoán đổi màu theo bảng body→lid** (`setSelectionColors`, qua màu tạm để tránh va chạm khi hoán vị ink/paper, ink-2/invert-ink-2, track/invert-track) rồi **gắn lại biến `lid/*` theo mã màu** (543 + 387 node). Device Twin dùng component `DeviceTwin/Desktop · Lid` riêng để nắp vẫn đen. Gauge, sparkline, Device Twin có biến thể Lid thật. |

## 4. Quyết định thiết kế khi dựng (G1 → G3)

| # | Quyết định | Lý do / truy về |
|---|---|---|
| D1 | Màu LED mẫu: **đã gửi = Xanh ngọc #00C9B7**, **bản nháp = Cam #FF7A00**; bảng 10 màu có tên (Trắng, Trắng ấm, Đỏ, Cam, Vàng, Xanh lá, Xanh ngọc, Xanh dương, Tím, Hồng) | Phụ lục B để ngỏ "chọn ở G1"; hai màu khác hẳn nhau giúp thấy rõ "đang chọn ≠ đã gửi" (mục 7.3) |
| D2 | Hero desktop: gauge bên trái, số Doto 104 px bên phải; mobile: gauge + cột trạng thái, số 72 px bên dưới | Bề rộng cột 552 px không đủ cho Doto 112 cạnh gauge 240 px |
| D3 | Biểu đồ độ ẩm luôn trục **0–100 %**; nhiệt độ 20–35 °C và CO₂ 400–1200 ppm ghi **"thang nhìn gần"** | Mục 5.6: thang nhìn gần phải ghi rõ |
| D4 | Điểm vượt ngưỡng trên biểu đồ = ô vuông đặc lớn + chú thích giá trị | Không dựa vào màu |
| D5 | Dữ liệu 24 giờ có 3 mốc > 85 % (04:00–06:00) và 7 ngày có 2 ngày vượt 85 % | Minh họa trực quan liên hệ ngưỡng ↔ ID 6; giá trị hiện tại vẫn 64,5 % |
| D6 | Thêm khung **ST-07 độ ẩm 24 %** (< 30 %) ngoài ca 88 % | Mục 9 yêu cầu "ngoài 30–85 %" — cần thể hiện cả ngưỡng dưới; ghi rõ là dữ liệu minh họa |
| D7 | DK-03 = hộp thoại trên nền dữ liệu đã che; MB-03 = trang riêng | Mục 6.2 "hộp thoại + trang"; trên điện thoại dùng trang toàn màn thay hộp thoại |
| D8 | Cài đặt lần đầu: DK-15 thể hiện bước ① (cần nhiều hướng dẫn nhất); mobile tách MB-15a/b/c cho cả 3 bước; bước ② hiển thị trạng thái "đã tạo tài khoản" vì lớp phủ chỉ mở sau khi tài khoản mới được tạo | Mục 7.7 |
| D9 | DK-14 (Tài khoản) không phải mục rail → bỏ tô mục 01, tô khối tài khoản cuối rail | Tránh báo sai vị trí |
| D10 | Lựa chọn giao diện "Theo hệ điều hành / Sáng · Body / Tối · Lid" đặt ở Tài khoản & phiên | Mục 5.1 "theo hệ điều hành, có công tắc thủ công"; thuộc ID 9 |
| D11 | Portal: Inter đứng thay `system-ui` trong Figma, đầu trang đảo màu đơn giản, không biểu tượng tải ngoài | Mục 7.9 |
| D12 | Bảng báo cáo: cỡ chữ chú giải = max(26 px, ⌈W/297 × 2,9⌉) → luôn ≥ 8 pt khi in bảng vừa khổ A4 ngang; huy hiệu = 2 × cỡ chữ, tâm đặt ở góc trên-trái vùng | Mục 11, nghiệm thu D |
| D12b | Huy hiệu không được che chữ: mỗi vùng có thể chọn vị trí huy hiệu (`left` lề trái, `tr` góc trên-phải ngoài, `ti` giữa mép trên trong panel — nơi giữa tiêu đề và thông số luôn trống, `bo` dưới mép dưới-phải, `right` bên phải hàng nút); bảng có nhiều màn hẹp tăng khe giữa màn bằng cỡ huy hiệu | Lượt rà soát: góc mặc định che phụ đề trang / tiêu đề panel / chip mobile |
| D15 | Giảm chữ: mỗi ý chỉ nói một lần trên một màn (cảnh báo độ ẩm: dải gạch chéo + chip trong hero, câu đầy đủ chỉ ở banner; thời điểm cập nhật chỉ ở thanh trạng thái; "Đã gửi lệnh" chỉ ở panel thiết bị); bỏ ghi chú kỹ thuật lọt vào UI; danh sách bước tối đa 4 | Phản hồi "hơi nhiều thông tin" |
| D16 | DK-04: khối Đèn LED thành panel riêng ở cột phải; thẻ nhiệt độ / CO₂ ôm nội dung; panel Device Twin kéo bằng cột phải | Sau khi bớt chữ, thẻ bị kéo dài với khoảng trống lớn |
| D13 | Không dựng MB-18 (chi tiết một ngày) và MB-19 (heatmap) | Tùy chọn P2 trong kế hoạch, không thuộc ID nào bắt buộc |
| D14 | Không dựng khung riêng cho 320 / 768 / 1920 px | Ưu tiên đủ màn + trạng thái; quy tắc thích nghi ghi trong HANDOFF §4 → mục nghiệm thu C2 **chưa đạt** |

## 5. Đối chiếu với skill `ui-ux-pro-max` (lượt 2, rà soát cuối)

Đã đọc *Pre-Delivery Checklist* (`references/pro-rules.md`) và tra thêm `focus visible outline keyboard`, `reduced motion animation`, `chart data table alternative` (domain ux).

| Mục checklist | Kết quả | Ghi chú |
|---|---|---|
| Không dùng emoji làm biểu tượng; một bộ biểu tượng thống nhất | Đạt | 31 biểu tượng Lucide, nét 1,5 px |
| Token ngữ nghĩa dùng nhất quán, không màu cứng theo màn | Đạt (có ghi chú) | Mọi node dựng qua hàm đều gắn biến; DK-17/MB-17 gắn lại theo mã màu (T13) |
| Trạng thái nhấn không làm xê dịch bố cục | Đạt | Nút lún bằng bóng (3 px → 1 px), không đổi kích thước |
| Vùng chạm ≥ 44 px, cách nhau ≥ 8 px | Đạt sau khi sửa | Phát hiện 6 liên kết chữ trên mobile ("Đổi màu →", "Mở Lịch sử →") < 44 px → bọc vùng chạm 44 px |
| Trạng thái khóa rõ ràng | Đạt | Nút Disabled nền track; LED khóa kèm lý do (ST-09, ST-04) |
| Tương phản chữ ≥ 4,5 : 1 ở cả hai chủ đề | Đạt | Đo ở mục 2 |
| Lớp phủ (scrim) giữ chữ phía trước đọc được | Đạt | Scrim 45–55 % ink, nội dung nổi là panel đặc + viền 2 px |
| Nội dung không bị thanh cố định che | Đạt | Nút Áp dụng (MB-06) đặt trên tab bar, không chồng |
| Không phụ thuộc màu | Đạt | Gạch chéo + chữ + biểu tượng ở mọi trạng thái; LED kèm tên + HEX |
| Biểu mẫu: nhãn, gợi ý, lỗi cạnh trường; cho trình quản lý mật khẩu/dán | Đạt | ST-12a/b, Field |
| Reduced motion | Đạt (bàn giao) | Token motion = 0 ms trong `tokens.css` |
| Thao tác kéo/vuốt có thay thế bằng nút/phím | Đạt | Tab 3 chỉ số + phím ←/→; thước đọc có bảng số thay thế |
| Biểu đồ có bảng thay thế | Đạt | DK-11 / MB-11 |
| Kiểm tra 375 px, xoay ngang, tablet | **Chưa** | Chỉ có khung 390 và 1440 (D14) |
| Kiểm tra cỡ chữ hệ thống lớn nhất | **Chưa** | Ngoài khả năng Figma; ghi lại để kiểm khi code |
| Gợi ý "thanh cuộn ngang cho bảng" trên mobile | **Bác bỏ** | MB-11 rút còn 4 cột vừa 358 px, không cần cuộn ngang |

## 6. Thêm màu có chủ đích (06/11/2026) — đảo quyết định #1

Yêu cầu của chủ dự án: phong cách thuần đen–trắng hơi cổ điển, và người dùng chưa nhận ra ngay thông tin cần chú ý. Quyết định #1 ("thuần trắng–đen, không màu báo động") được **đảo lại**; mọi quyết định khác giữ nguyên (LED chỉ chọn màu + bật/tắt — **đã thay ở mục 8**, Telegram không trạng thái liên kết, CO₂ luôn "ước lượng · tham khảo", chỉ ID 1–10, chỉ tiếng Việt).

### 6.1 Bảng màu nhấn (collection `Room Instrument`, 31 biến mới)

| Biến (nền sáng) | Hex | Biến (nền tối) | Hex | Nghĩa duy nhất |
|---|---|---|---|---|
| `accent/alert` | #FF4B1F | `accent-dark/alert` | #FF6A45 | Ngoài ngưỡng độ ẩm, lỗi, mất kết nối, thiết bị ngoại tuyến |
| `accent/alert-text` | #C2300F | `accent-dark/alert-text` | #FF6A45 | Chữ báo động (và nút nguy hiểm "Đăng xuất") |
| `accent/alert-tint` | #FFEFEA | `accent-dark/alert-tint` | #2A1712 | Nền banner lỗi |
| `accent/ok` | #26944F *(đề xuất #2FA55B)* | `accent-dark/ok` | #4CC777 | Trực tuyến, đã gửi lệnh, bước đã xong, "bình thường" |
| `accent/ok-text` | #1F7A42 | `accent-dark/ok-text` | #4CC777 | Chữ trạng thái tốt |
| `accent/warn` | #A87700 *(đề xuất #D99A00)* | `accent-dark/warn` | #F2B830 | Dữ liệu cũ, đang kết nối, chú ý |
| `accent/warn-text` | #8A5F00 | `accent-dark/warn-text` | #F2B830 | Chữ chú ý |
| `accent/warn-tint` | #FFF6DF | `accent-dark/warn-tint` | #2A2210 | Nền banner chú ý |
| `accent/data-humidity` | #2A5FE8 *(đề xuất #2F6BFF)* | `accent-dark/data-humidity` | #6B95FF | Đường/cột/đoạn gauge độ ẩm |
| `accent/data-temperature` | #B0307A | `accent-dark/data-temperature` | #E066AD | Đường/cột/đoạn gauge nhiệt độ |
| `accent/data-co2` | #087A82 *(đề xuất #0B8A93)* | `accent-dark/data-co2` | #2FC3CC | Đường/cột/đoạn gauge CO₂ |
| `mono/*` (9 biến) | đen #0B0B0C / xám #55555A / trắng | — | — | Tương đương cho bản in (bảng báo cáo `_mono`) |

`accent-dark/*` dùng cho mọi mặt tối: hero đảo màu trong chủ đề Body, thanh trạng thái ngoại tuyến/mất kết nối, đầu trang portal, toast — và toàn bộ chủ đề Lid. Trong chủ đề Lid, hero đảo màu là panel **sáng** nên dùng lại `accent/*`.

**Điều chỉnh so với đề xuất (lý do):**
- `ok` #2FA55B → **#26944F**: #2FA55B chỉ 2,86:1 trên `paper` (< 3:1 cho chấm/viền).
- `warn` #D99A00 → **#A87700**: #D99A00 chỉ 2,22–2,45:1; #A87700 đạt 3,59–3,96:1.
- `data-humidity` #2F6BFF → **#2A5FE8**: nhãn giá trị chữ `paper` đặt trên cột độ ẩm 7 ngày cần ≥ 4,5:1 (#2F6BFF 4,08 → #2A5FE8 4,89).
- `data-co2` #0B8A93 → **#087A82**: cùng lý do (3,76 → 4,63).
- `alert-tint` #FFEFEA (≈ 7 % độ đậm): chữ `alert-text` trên đó 5,05:1, chữ `ink` 17,6:1.

### 6.2 Đo tương phản (WCAG 2.x)

| Cặp | Tỉ lệ | Yêu cầu | Kết quả |
|---|---|---|---|
| `alert-text` #C2300F / surface · paper | 5,64 · 5,12 | chữ 4,5 | Đạt |
| `alert-text` / `alert-tint` #FFEFEA | 5,05 | chữ 4,5 | Đạt |
| `ok-text` #1F7A42 / surface · paper | 5,36 · 4,86 | chữ 4,5 | Đạt |
| `warn-text` #8A5F00 / surface · paper · `warn-tint` | 5,65 · 5,13 · 5,25 | chữ 4,5 | Đạt |
| `alert` #FF4B1F / surface · paper | 3,34 · 3,04 | chấm/viền 3 | Đạt (sát ngưỡng trên paper) |
| `ok` #26944F / surface · paper | 3,87 · 3,51 | 3 | Đạt |
| `warn` #A87700 / surface · paper | 3,96 · 3,59 | 3 | Đạt |
| `data-humidity` #2A5FE8 / surface · paper | 5,38 · 4,89 | 3 (đường) · 4,5 (nhãn trên cột) | Đạt |
| `data-temperature` #B0307A / surface · paper | 5,92 · 5,37 | 3 · 4,5 | Đạt |
| `data-co2` #087A82 / surface · paper | 5,10 · 4,63 | 3 · 4,5 | Đạt |
| `accent-dark/alert` #FF6A45 / invert-bg #0B0B0C · lid surface · tint tối | 6,93 · 6,30 · 6,02 | chữ 4,5 | Đạt |
| `accent-dark/ok` #4CC777 / #0B0B0C · lid surface | 9,13 · 8,30 | chữ 4,5 | Đạt |
| `accent-dark/warn` #F2B830 / #0B0B0C · lid surface · tint tối | 10,94 · 9,94 · 8,75 | chữ 4,5 | Đạt |
| `accent-dark/data-*` #6B95FF · #E066AD · #2FC3CC / lid surface | 6,28 · 5,68 · 8,35 | 3 | Đạt |
| Lid · hero sáng: `alert` · `ok` · `data-humidity` / #F4F4F1 | 3,04 · 3,51 · 4,89 | 3 | Đạt |
| `alert` / `track` #C9C9C4 | 2,01 | — | Không cần: dải ngưỡng nằm **ngoài** vòng gauge, cạnh nền, không cạnh đoạn track |

### 6.3 Phân biệt màu (ΔE CIELAB, mô phỏng mù màu Machado 2009)

| Cặp | Mắt thường | Protan | Deutan | Ghi chú |
|---|---|---|---|---|
| alert ↔ data-temperature | 76 | 75 | 74 | Rất khác — màu dữ liệu không bị nhầm với báo động |
| data-humidity ↔ data-temperature | — | 49 | 72 | Khác rõ |
| data-co2 ↔ data-humidity | — | 63 | 63 | Khác rõ |
| ok ↔ data-co2 | — | 44 | 41 | Khác rõ; không đứng cạnh nhau |
| alert ↔ warn | — | **7** | **11** | Gần nhau với người mù màu đỏ–lục → chấp nhận vì luôn đi kèm chữ khác nhau ("DỮ LIỆU CŨ" ≠ "MẤT KẾT NỐI"), warn trên nền sáng + gạch chéo, alert-dark trên nền đảo màu đen |

Độ ẩm xanh dương #2A5FE8 gần màu LED "Xanh dương" #2F6BFF — chấp nhận: LED luôn nằm trong cửa sổ 8 ô kèm tên + HEX, không cùng chỗ với đường dữ liệu.

### 6.4 Đối chiếu `ui-ux-pro-max` (lượt 3)

Đã tra: `semantic status color alert success warning` (color), `accent color hierarchy attention` (ux), `categorical palette colorblind` (chart).

| Gợi ý | Quyết định | Lý do |
|---|---|---|
| Bảng "Smart Home/IoT Dashboard": nền #0F172A, nhấn xanh lá #22C55E, destructive #EF4444 | **Bác bỏ** nền/nhấn; **chấp nhận** cấu trúc "một nhấn trạng thái + một destructive" | Nền giữ đen–trắng–xám; một màu báo động duy nhất |
| Không truyền thông tin chỉ bằng màu; đỏ đi kèm biểu tượng/chữ | **Chấp nhận** | Mọi chỗ có màu vẫn giữ chữ + gạch chéo/biểu tượng; bản mono kiểm chứng |
| Chữ ≥ 4,5:1 | **Chấp nhận** | Tách biến `*-text` riêng cho chữ |
| Biểu đồ: màu chỉ củng cố, cần nhãn trực tiếp / hình dạng | **Chấp nhận** | Mỗi biểu đồ một chỉ số có tiêu đề; điểm vượt ngưỡng = ô vuông lớn + chú thích |
| Gradient xanh → đỏ cho thang giá trị | **Bác bỏ** | Nhiệt độ/CO₂ không được mang nghĩa tốt/xấu |

### 6.5 So sánh phương án (hàng `09 So sánh màu`, y ≈ 33 338)

| | A "Đèn báo" | B "Đèn báo + trạng thái" | C "Phổ cảm biến" |
|---|---|---|---|
| Màu có | báo động (viền hero, banner, ngưỡng, vùng ngoài ngưỡng) | A + ô/chấm trạng thái kết nối, banner/toast/field, bước xong | B + màu dữ liệu cho gauge, sparkline, biểu đồ |
| DK-16 | Đỏ là màu duy nhất → điểm nhìn đầu tiên rõ nhất | Thêm 8 ô xanh lá nhỏ trên thanh trạng thái — không cạnh tranh | Gauge độ ẩm xanh dương, hai gauge hồng/xanh ngọc; viền đỏ 3 px + banner đỏ vẫn nổi trước |
| DK-04 / MB-04 (bình thường) | Gần như đơn sắc như cũ — chưa giải quyết "hơi cổ điển" | Có điểm nhấn trạng thái nhỏ | Ba chỉ số phân biệt bằng màu từ xa; mắt vẫn rơi vào số hero trước |
| Nhận xét | An toàn nhất, màn bình thường vẫn khô | Cân bằng | Sinh động nhất; dải ngoài ngưỡng đỏ trên gauge độ ẩm hiện cả lúc bình thường — chấp nhận vì nó đánh dấu ngưỡng, mảnh và gạch chéo |

**Áp dụng C** (đã gồm A và B). Không rút về B vì màu dữ liệu khác xa màu báo động (ΔE ≥ 74 kể cả mô phỏng mù màu) và chỉ phủ nét mảnh (đoạn gauge, đường 1,5–2 px); chữ số lớn giữ đen/trắng.

### 6.6 Kỹ thuật

- Gạch chéo có màu: component mới `Pattern/Hatch/Alert`, `/AlertDark`, `/Warn` (nhân bản `Pattern/Hatch/Ink`, sọc gắn biến). Vùng ngoài ngưỡng trên biểu đồ: `Pattern/Hatch/Alert` ở độ mờ 20 %.
- `setSelectionColors` so khớp màu **có dung sai**: hoán đổi qua màu tạm quá gần nhau (#010101, #010102…) làm lẫn màu (DK-17/MB-17 lần đầu ra sai). Sửa: màu tạm cách xa nhau (#101080, #108010…). Lệnh này cũng **không đi hết** vào instance lồng trong khung desktop lớn → bản so sánh A/B phải gọi trên từng instance gauge/spark/chart.
- Kiểm "không còn hex cứng": tạm đổi từng biến accent sang #123456 rồi đọc lại fill của 14 khung — mọi node mang màu accent đều đổi theo (sau khi sửa 3 chấm chip ban đầu tạo bằng hex). Chỉ kiểm **fill**; stroke gắn bằng cùng hàm nhưng không kiểm theo cách này.
- Các khung so sánh `09-A/B` và 6 bảng `· mono (in)` cố ý dùng màu cứng (đã tách khỏi biến) vì là bản minh họa/in.

---

## 7. Thiết kế lại trạng thái lỗi / cảnh báo (07/11/2026)

**Lý do:** chủ dự án thấy ô nhập lỗi (viền cam đỏ 2 px bao quanh + dải gạch chéo ở mép trái, "như một tem") và các khối cảnh báo nặng, thô; gạch chéo ở vị trí đó không đẹp.

### 7.1 Rà soát trước khi sửa
Gạch chéo **trang trí** (bỏ): `Field` Error ×2, `Banner` Error / Warning, PT-04, ô gạch chéo cạnh chữ "NGOÀI NGƯỠNG" ở hero DK-16 / MB-16 / ST-07 (kéo theo ST-12a, ST-12b, ST-15). `Toast` Failed chỉ có viền dày. Gạch chéo **mang nghĩa dữ liệu** (giữ): vùng ngoài ngưỡng trên gauge / biểu đồ / thang Telegram, cột "hôm nay", vùng thiếu dữ liệu (ST-13), nhãn "CŨ", thanh trạng thái (ST-02, ST-04 — chưa xét lại).

### 7.2 Nghiên cứu
WCAG 1.4.1 (không chỉ dựa vào màu) và 1.4.11 (dấu hiệu trạng thái ≥ 3:1); GOV.UK (viền lỗi 2 px bằng viền thường, chữ lỗi cạnh trường); IBM Carbon (viền 2 px + biểu tượng trong ô + câu lỗi thay dòng gợi ý); NN/g (gần trường, dễ thấy, nhiều dấu hiệu); ISA-101 (bình thường xám, màu chỉ cho bất thường, kèm hình + chữ); đồng hồ đo báo "OL" / đèn báo khi vượt thang. Nguyên tắc rút ra: một cử chỉ, đổi hình dạng/độ dày chứ không chỉ đổi màu, câu lỗi sát ô, không trang trí.

### 7.3 Mười hướng đã dựng (hàng `10 — SO SÁNH CẢNH BÁO`, y = 38 400)
| # | Hướng | Node |
|---|---|---|
| 0 | Bản hiện tại (đã tách instance để giữ làm đối chiếu) | 109:119841 |
| 1 | **Gạch đáy** — viền 1 px, cạnh đáy 2 px màu báo động, ⚠ trong ô | 108:119073 |
| 2 | Nền nhạt | 109:119283 |
| 3 | Vạch trái đặc 4 px | 109:119431 |
| 4 | Nhãn góc "LỖI" | 109:119656 |
| 5 | Đèn báo 8 px trước nhãn | 110:121563 |
| 6 | Dấu góc đo | 110:121724 |
| 7 | Tấm nhãn mực | 110:122093 |
| 8 | Viền mực đậm 2 px, lỗi trên ô | 111:122285 |
| 9 | Ô đèn hiệu + **dải đèn hiệu 3 mức** ở hero | 111:122438 |
| 10 | Viền kép | 111:122598 |

Mỗi hướng: ô tên đăng nhập, ô mật khẩu, Banner lỗi, Toast thất bại, đầu hero 88 %, mẫu Lid tối, bản mono. Mọi màu gắn biến; `layout_audit` 0 lỗi chặn.

### 7.4 Chốt
**Hướng 1 · Gạch đáy** cho ô nhập, Banner (Lỗi, Chú ý), Toast thất bại, khối lỗi portal; **dải đèn hiệu 3 mức của hướng 9** cho hero độ ẩm khi ngoài ngưỡng (hero bỏ viền đỏ 3 px). Chủ dự án chọn ngày 07/11/2026.

### 7.5 Đo tương phản
| Cặp | Tỉ lệ |
|---|---|
| Gạch đáy `#FF4B1F` / nền trắng · nền giấy | 3,34 · 3,04 |
| Viền thường `#8A8A90` / trắng | 3,43 |
| Câu lỗi + ⚠ `#C2300F` / trắng | 5,64 |
| Ô đèn thắp: chữ `#0B0B0C` / `#FF6A45` | 6,93 |
| Ô đèn tắt: chữ `#A5A5AB` / `#0B0B0C` | ≈ 8,0 |
| Viền ô đèn tắt `#3A3A40` / `#0B0B0C` | 1,74 — chỉ là khung, nghĩa nằm ở chữ và ô đặc |
| Gạch đáy PT-04 `#FF6A45` / `#0B0B0C` | 6,93 |

### 7.6 Kỹ thuật
- Không có viền từng cạnh khác màu (một stroke chỉ có một màu; bóng đổ không gắn biến) → dựng bằng khung: `box-line` (nền `--line-strong`, đệm trên/trái/phải 1 px) bọc ô nền trắng, thêm thanh `edge-bottom` 2 px gắn `accent/alert`. CSS chỉ cần `border-bottom: 2px solid`.
- `Field` Error: ô cũ được chuyển vào khung mới (giữ id) → instance giữ nguyên chữ ghi đè (đã kiểm ST-12a, ST-12b, ST-15). Biểu tượng dưới ô bỏ (đã có ⚠ trong ô).
- `Banner` Error: biểu tượng ✕ → ⚠ (✕ dễ hiểu là nút đóng); nền nhạt bỏ.
- PT-04: tiêu đề 18 → 16 px để vừa một dòng cạnh biểu tượng.
- Bảng báo cáo hàng 07 không chứa các thành phần này → PNG không đổi.

### 7.7 Rà soát lần 2 — trạng thái thiết bị (07/11/2026)
Chủ dự án thấy chỗ "thiết bị ngoại tuyến" vẫn kiểu cũ. Rà toàn trang (tìm lớp tên `hatch` ngoài gauge/biểu đồ, khối nền màu báo động/chú ý, khung có viền dày tính vào bố cục):
- `Nav/StatusBar/Desktop` Stale / DeviceOffline / Disconnected (93:14102–14104): bỏ dải gạch chéo 12 px + viền bao → gạch đáy 2 px (`accent/warn`, `accent-dark/alert`); lề trái nội dung 32 px như Online.
- `Nav/StatusBar/Mobile` Stale / DeviceOffline / Disconnected (93:14484–14486): bỏ ô gạch chéo 6×16 cạnh câu + viền → gạch đáy 2 px; giữ cao 57 px.
- 9 nhãn "CŨ · hh:mm" / "GIÁ TRỊ CUỐI · 13:52" ở ST-02, ST-03, ST-04 (hero + 2 thẻ): ô gạch chéo 12×24 → biểu tượng đồng hồ màu `warn-text`.
- Chú thích bìa (95:47923) và bảng 01-C (95:49106) sửa lại nghĩa của gạch chéo.
- **Giữ:** cờ gạch chéo ở hàng ngoài ngưỡng bảng số DK-11 (nghĩa dữ liệu), nét đứt Device Twin ngoại tuyến (nghĩa trạng thái, không phải họa tiết), ô biểu tượng đỏ đặc ở ST-13 (không phải kiểu tem).
- Lưu ý: chữ "⚠" gõ trong lớp chữ Figma hiển thị thành emoji màu → dùng component `Icon/triangle-alert`, không gõ ký tự.

### 7.8 Bỏ hẳn gạch chéo màu đỏ (07/11/2026)
Chủ dự án: "không thích họa tiết gạch chéo nhiều đường màu đỏ". Thay ở mọi chỗ còn lại, kể cả chỗ mang nghĩa dữ liệu:
| Chỗ | Trước | Sau |
|---|---|---|
| `Gauge/Ring/Humidity-L` 92:7625, `-M` 92:7725 | 36 / 32 vạch chéo trong dải 9 px ngoài vòng | 36 đoạn thẳng nối thành **cung đặc** bán kính `rOut + 6`, dày 3 px (L) / 2,5 px (M); 10 gauge độ ẩm gắn `accent-dark/alert` (bản Paper trên nền tối) hoặc `accent/alert` (Ink, Lid-invert) |
| `Chart/Line/Humidity-24h` Desktop, Mobile · Ruler, Desktop · Gaps | vùng 0–30 / 85–100 gạch chéo đỏ mờ 20 % | nền `accent/alert-tint`, đặt **dưới** lưới và đường dữ liệu; đường ngưỡng nét đứt giữ |
| Thang ngưỡng DK-12, MB-12 (+ bản sao bảng 07-5, 07-5m) | gạch chéo đỏ | nền `alert-tint` + gạch đáy 2 px `accent/alert` (mono: `mono/*`) |
| Cờ hàng ngoài ngưỡng DK-11 (3 hàng) | ô gạch chéo 10×28 | `Icon/triangle-alert` màu `alert-text` + chữ giữ nguyên |
Giữ gạch chéo **màu mực**: cột "hôm nay chưa kết thúc" (Chart/Bar/Humidity-7d) và dòng thời gian khoảng nghỉ (Telegram) — không đỏ.
- Bảng mono hàng 07: phát hiện các màu ghi đè `setSelectionColors` trên 07-2m đã mất (bảng hiện màu); đã chạy lại `toMono` trên cả 6 bảng mono, quét lại fill: 0 node còn màu nhấn. Chưa rõ thao tác nào làm mất ghi đè.
- `bulkRot` cũ đọc sai kết quả `batch` → cung được xoay và gắn biến bằng lệnh riêng.

## 8. Đèn LED theo từng thông số (12–13/11/2026) — thay quyết định "một màu cho cả thanh"

Thuyết minh (PROPOSAL mục 1.1, 1.2, 4) đổi mô hình LED: bóng 1–2 báo hệ thống, cặp 3–4 / 5–6 / 7–8 báo nhiệt độ / độ ẩm / CO₂ theo 3 mức, người dùng chọn màu cho từng mức (3 × 3 = 9 màu), có chế độ Tự động và Kiểm tra đèn. Wireframe cũ (chọn một màu cho cả 8 bóng + Bật/Tắt) không còn đúng. Quy tắc chi tiết: HANDOFF §3.5.

### 8.1 Quyết định của chủ dự án (12/11/2026)
| # | Câu hỏi | Chốt |
|---|---|---|
| 1 | Bố cục trang Đèn LED | Ghép B + C: thanh 8 bóng chia 4 nhóm ở đầu trang (xem trước) + 3 thẻ thông số (thanh ngưỡng chỉ đọc + 3 hàng mức màu); một nút Áp dụng gửi cả 9 màu |
| 2 | Bóng 1–2 | Màu cố định, không cho đổi: 1 Trắng nháy chậm (đang chạy), 2 Xanh dương (sáng = WiFi + MQTT, nháy = đang kết nối lại) |
| 3 | Chế độ kiểm tra | Một màu cho cả thanh + Bật/Tắt, dùng lại giao diện cũ (DK-06b / MB-06b) |
| 4 | Ngưỡng | Nhóm chưa chốt → Claude điền số tạm (HANDOFF §3.5); độ ẩm 30 / 85 % trùng Telegram là số đã chốt |

### 8.2 Rà soát lần 2 (13/11/2026)
Chủ dự án: "hơi nhiều thông tin trên các ảnh giao diện, chỉ giữ instruct thật sự hữu ích".
- Bỏ khỏi màn: chú thích kỹ thuật (WS2812, khoảng trễ, "thiết bị không gửi lại trạng thái"), chữ "số tạm" trên từng thẻ, nhãn "hiện tại" trên thanh ngưỡng, HEX của màu có tên, số bóng lặp lại, dòng giải thích chế độ.
- Bản nháp chỉ báo 2 chỗ (hàng đang sửa "Cam · chưa gửi" + dòng cạnh nút Áp dụng); "đã gửi" ở thẻ Trên hộp (desktop) / một dòng ĐÃ GỬI (mobile).
- Ghi chú cho nhóm (số tạm, kiểu nháy đề xuất, cách thanh xem trước hoạt động) chuyển ra ngoài khung: chữ ghi chú phía trên DK-06 ở ROW 03.
- Thanh xem trước **chỉ hiển thị**; bấm một cặp = tới thẻ chỉnh màu. Lý do: một chỗ chỉnh duy nhất; mỗi cặp có 3 màu nên bấm vào bóng không biết đang đổi mức nào.
- Mobile: chevron ở hàng tiêu đề mọi thẻ (˅ thu gọn, ^ mở); hàng mức đang mở bộ chọn màu cũng ^.

### 8.3 Lan ra toàn file (13/11/2026)
| Chỗ | Thay đổi |
|---|---|
| `LED/Strip-8/L|M|S` | On: 1 Trắng · 2 Xanh dương · 3–8 Xanh lá; thêm khe `pair-gap` giữa các cặp (L 10 · M 6 · S 4 px) cho cả On/Off; bộ component dàn lại, dời M/S và `Panel/Screw` sang phải |
| `DeviceTwin/*` | Cửa sổ LED theo màu mặc định mới; Desktop · Body / Offline / Lid thêm nhãn 4 nhóm (biểu tượng nguồn · nhiệt kế · giọt nước · gió, cỡ 24) dưới cửa sổ — đúng cam kết "nhãn bốn nhóm trên mặt hộp" (mục 4 thuyết minh). Compact không thêm (quá nhỏ) |
| Thẻ Đèn LED ở Giám sát (DK/MB-04, 05, 16, 17, 09-A/B/C, ST-04, bảng 07-2 + 07-2m) | Bỏ công tắc Bật/Tắt (chỉ có ở chế độ Kiểm tra); chữ "Tự động" + trạng thái 3 thông số; DK/MB-16 (88 %): cặp 5–6 Đỏ; ST-04: thanh xám "không rõ" + "đèn trên hộp vẫn tự đổi màu theo bảng màu đã lưu"; nút "Bảng màu →" |
| `row/D · LED` (DK-13, MB-13, bảng 07-6 + 07-6m) | "Tự động · bảng màu mặc định · Gửi lúc 14:12" |
| ST-08 | Trạng thái gửi **bảng màu** (nháp 1 màu đổi → đang gửi 9 màu → đã gửi → lỗi); bỏ nút Thử lại trùng với toast |
| ST-09 | Khóa gửi bảng màu khi ngoại tuyến; thanh xám "không rõ"; thẻ "Bảng màu đã lưu" 3 thông số; bỏ lưới màu và công tắc |
| DK-07 / MB-07 | Nền là DK-06 / MB-06 Tự động mới; hộp màu tùy chỉnh ghi rõ "Độ ẩm · Cần chú ý"; desktop đặt cạnh thẻ Độ ẩm |
| ROW 03 / 04 | DK-06 Tự động (8000, 11200) + DK-06b Kiểm tra (8000, 12909); MB-06 (2350, 15200) + MB-06b (2350, 16917) |
| ROW 11 | Thành **lưu trữ**: DK-06 / MB-06 bản cũ một màu (giữ màu Xanh ngọc bằng ghi đè) để đối chiếu Hình 9, 10 |
| Bảng 07-3 + 07-3m | Thay màn mới, 10 vùng đánh số + chú thích mới, cao 1367 → 2090 |
| Bảng mono 07-1m…07-6m | Chạy lại ánh xạ mono (accent → mực / xám, LED giữ màu): 07-2m 520 node, 07-4m 510, 07-3m / 07-5m / 07-6m 35 mỗi bảng — ghi đè mono lại bị mất như lần trước (mục 7.8) |
| Bìa 00 | "Bảng màu theo thông số + chế độ kiểm tra · LED WS2812" |

### 8.4 Chưa làm / để ngỏ
- Không thêm hộp xác nhận cho "Khôi phục mặc định" (chỉ đổ vào bản nháp, Hủy được) và cho chuyển chế độ (banner + "Về tự động" đủ rõ).
- ~~PNG trong `exports/`~~ — đã xuất lại cả 12 bảng ngày 13/11/2026 (SVG → Edge, đúng kích thước 1×; xem 8.5).
- ~~Hình 9, 10 trong thuyết minh~~ — đã cập nhật 13/11/2026 (ảnh `SmartClassroom/Docs/images/wireframes-room-instrument/clean/dk04.png`, `dk06.png` dựng lại từ Figma; chú thích + đoạn "Phương hướng phát triển giao diện LED" mục 4 viết lại; PDF biên dịch lại, 21 trang).

### 8.5 Rà soát toàn file (13/11/2026)
Chủ dự án: "rà soát toàn diện lại bản figma Claude". Đã chạy `layout_audit` trên 58 màn (0 chữ bị cắt / tràn thật; cảnh báo còn lại là lớp phủ modal và hàng gợi ý ẩn của `Field` — đúng ý), quét toàn bộ 6 658 lớp chữ, dựng lại hình MB-04, ST-04, DK-17, MB-17, 01-A, bảng 07-2/07-3m.

| Chỗ | Lỗi | Sửa |
|---|---|---|
| Bảng 07-2 + 07-2m (2 chú giải ×2) | "LED nhanh: màu đang gửi + Bật/Tắt" — mô hình cũ | "Đèn LED: Tự động · mở Bảng màu" / "Đèn LED: Tự động + 3 thông số" |
| ST-04 thẻ LED | "Mất kết nối từ 14:12" trong khi thanh trạng thái + giá trị cuối là 13:52 | "13:52" |
| ST-09 | "Bảng màu gửi lần cuối … 14:12" sau thời điểm ngoại tuyến 13:52 | "13:40" |
| DK-17 (Lid) rail, chân rail, nút tài khoản | Biểu tượng nét #0B0B0C trên nền #17171A (không thấy); mục đang chọn mất biểu tượng | Mục thường #F4F4F1, mục đang chọn #0B0B0C |
| MB-17 (Lid) thanh tab | Biểu tượng đang chọn #0B0B0C trên nền tối; mục thường #55555A (≈ 2,4:1) | #F4F4F1 / #A5A5AB |
| `DeviceTwin/Desktop · Lid`, `· Offline` + bản dùng ở DK-17, ST-04 | Nhãn 4 nhóm vẫn #0B0B0C (màu đặt ở 8.3 không giữ được) | Lid #F4F4F1, Offline #8A8A90 |
| Bìa 00 | "thuần trắng–đen–xám, màu thật duy nhất = màu LED", "vùng ngoài 30–85 % gạch chéo", "gạch chéo = ngoài ngưỡng … đảo màu = cần chú ý", dữ liệu minh họa LED một màu | Viết lại theo mục 6, 7.4, 7.8, 8 |
| 01-A | "Không có màu báo động"; thiếu bảng màu nhấn | Thêm 2 hàng `accent/*` và `accent-dark/*` (11 ô mỗi hàng, gắn biến) |
| 01-C | "Gạch chéo = ngoài ngưỡng", "Đảo màu = cần chú ý" | Gạch chéo mực chỉ cho cột hôm nay / khoảng nghỉ; đảo màu = khối chính |
| 08 Bàn giao | Không có dòng `accent/*`; dòng `led/*` còn `--led` = màu đã gửi | Thêm dòng accent; dòng LED theo bảng 9 màu |
| Tiêu đề ROW 01 / 04 / 10 / 11 | Thiếu accent; "MB-01 … MB-19" (không có MB-18/19); ROW 10 "chờ chọn" (đã chốt 07/11); ROW 11 "đối chiếu Hình 9, 10" (Hình 9, 10 đã dùng màn mới) | Sửa chữ |
| Mô tả component | Toggle/Power, DeviceTwin Body/Offline/Lid, Banner ("gạch chéo, không màu báo động"), Toast, LED/Strip-8 (trống) | Viết lại theo mô hình hiện hành |
| `tokens.css` | Chỉ có `--led` / `--led-draft` (một màu) | Thêm `--led-sys-*`, 9 biến `--led-<thông số>-normal|watch|alert`, `--led-test(-draft)`; HANDOFF §3 bảng màu cập nhật |
| `exports/*.png` | 07-2, 07-3, 07-6 và các bản mono cũ hơn Figma | Xuất lại 12 tệp (bản cũ lưu ở scratchpad); quét SVG: 6 bảng mono 0 màu nhấn |

Không đổi: Hình 9–12 thuyết minh (DK-04, DK-06, DK-08, PT-01–03 không bị sửa).

### 8.6 Năm nâng cấp sau rà soát (13/11/2026)
Chủ dự án: "triển khai cả 5 đề xuất nâng cấp".

| # | Nâng cấp | Đã làm |
|---|---|---|
| 1 | Nhãn mức cho nhiệt độ và CO₂ (web nói cùng mức với cặp đèn trên hộp) | Nhãn BÌNH THƯỜNG / CẦN CHÚ Ý / CẢNH BÁO (chép từ nhãn khối độ ẩm, gắn biến `body|lid/color/ink` + `accent|accent-dark|mono/ok|warn|alert`) trên 18 thẻ: DK/MB-04, 05, 16, 17, ST-05 (CO₂), ST-06 (nhiệt độ), ST-07 + bảng 07-2 / 07-2m. Không gắn ở ST-01…04 (giá trị không đáng tin). Màn mẫu **ST-16** (9450, 22200): 32 °C → CẦN CHÚ Ý, cặp 3–4 Vàng; gauge XS tách instance để xoay kim 70° → 34° và thêm đoạn 36–44 |
| 2 | Cảnh báo hai mức trùng màu | **ST-17** (9920, 22200), từ MB-06: Độ ẩm · Cần chú ý = Đỏ trùng Cảnh báo; khối ⚠ + câu `accent/warn-text` + gạch đáy 2 px `accent/warn`; thanh ngưỡng và thanh xem trước tô theo nháp; Áp dụng vẫn bấm được |
| 3 | Đèn trên ST-05 / ST-06 | Thêm thẻ Đèn LED: ST-05 cặp 3–4, 5–6 Trắng nháy nhanh; ST-06 cặp 7–8 Trắng nháy luân phiên; dấu 4 góc mở quanh **cả cặp** (lớp `blink-marks` trong hàng bố cục tự do) |
| 4a | Thanh LED trên thẻ mobile kéo hết chiều ngang | Proxy không đặt được `layoutGrow` / `layoutSizingHorizontal` cho hình chữ nhật → tạo component **`LED/Strip-8/M · Mobile`** (154:47805, bóng 32 × 28, rộng 328) và thay ở MB-04, 05, 16, 17, ST-05, 06, 16, bảng 07-2 / 07-2m (giữ màu từng bóng; MB-17 nền #0E0E10 viền #F4F4F1). `LED/Strip-8/M` gốc trả về co theo nội dung |
| 4b | Đơn vị ppm ở sparkline CO₂ mobile | "436–1040 ppm" ở 9 chỗ (MB-04/05/16/17, bảng 07-2/07-2m, 09-A/B/C MB) |
| 4c | Chỗ trống dưới hình thiết bị | Khối `twin-groups` "Nhãn trên mặt hộp, dưới cửa sổ LED:" + 4 nhóm (biểu tượng · 1–2 hệ thống · 3–4 nhiệt độ · 5–6 độ ẩm · 7–8 CO₂) ở DK-04, 05, 16, 17, ST-04, bảng 07-2 / 07-2m — đúng chỗ trống, thẻ không cao thêm |
| 5 | Khung thích nghi | Hàng **12 — THÍCH NGHI** (y 42 500): RS-320 (0, 42720), RS-768 (440), RS-1280 (1300), RS-1920 (2700). Chỉnh quy tắc HANDOFF §4 cho 1280: cột số liệu chỉ còn ~392 px nên dùng khối gọn như mobile và đưa dải 24 giờ vào cột (biểu đồ nhỏ là hình vẽ cố định 320 px, không co được) |

Kèm theo: DK-05 nới khung 1365 → 1372 (bản nền DK-04 cao thêm 39 px); bảng 07-2 / 07-2m dời huy hiệu 2, 6 (+39) và 10, 11 (+35), sửa 5 chú giải; bìa thêm ST-16, ST-17, RS-xx; bảng 08 thêm quy ước RS-xx; HANDOFF §2, §3.1, §3.5, §3.12 (mới), §4, §5. Thuyết minh: Hình 9 (`dk04.png`) dựng lại vì DK-04 có nhãn mức + khối nhóm đèn, chú thích viết lại, PDF biên dịch lại (21 trang, Hình 9 vẫn ở trang 9). `exports/07-2_*` xuất lại; quét SVG bản mono: 0 màu nhấn.
Không làm: nhãn mức cho phương án so sánh màu 09-A/B/C (lưu trữ).

