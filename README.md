# Smart Classroom — Nhóm 16

Nguồn LaTeX và tài liệu đồ án Phòng học thông minh.

| Thư mục | Nội dung |
|---|---|
| `Docs/` | Nguồn LaTeX, PDF thuyết minh và phụ lục |
| `Docs/images/branding/` | Logo trên bìa |
| `Docs/images/components/` | Ảnh linh kiện và vật tư |
| `Docs/images/diagrams/` | Sơ đồ truyền nhận dữ liệu, PNG và SVG nguồn |
| `Docs/images/enclosure/` | Ảnh hộp, các mặt đứng và nguồn model |
| `Docs/images/wireframes-room-instrument/clean/` | Bốn hình wireframe đang dùng trong báo cáo |
| `Docs/images/wireframes/` | Hình UI của phiên bản thiết kế trước |
| `Docs/wireframes-v3/` | Bộ thiết kế hiện hành, ảnh màn hình và báo cáo, bố cục responsive |
| `Docs/prototype/` | Bản thử tương tác web/mobile, mở `index.html` bằng trình duyệt |
| `Docs/reference/` | Quy định và yêu cầu đồ án |
| `scripts/` | Biên dịch proposal bằng XeLaTeX |
| `tools/` | Công cụ xuất ảnh, đối chiếu ảnh và kiểm thử bản thử UI |

Ảnh hộp và thông tin nguồn đã được giữ trong `Docs/images/enclosure/`.
`Archive/`, `Designs/`, `Models/` không cần để biên dịch tài liệu và được loại khỏi Git.

## Biên dịch

Cần XeLaTeX (MiKTeX hoặc TeX Live) và Times New Roman. Trên Windows, nguồn LaTeX nạp trực tiếp bốn file font trong `C:/Windows/Fonts/`; trên hệ điều hành khác cần cài Times New Roman, không tự thay bằng font khác. Chạy trong PowerShell:

```powershell
.\scripts\build-proposal.ps1
```

Kết quả: `Docs/16_24127261_24127542_24127581_PROPOSAL.pdf`.
`Docs/thuyet_minh.pdf` là bản xem trước cục bộ do trình soạn thảo sinh ra và được Git bỏ qua.
File trung gian ở `Docs/.build/proposal/`, được Git bỏ qua.
Phụ lục `Docs/Phu_luc_A_MQ135.pdf` được giữ nguyên.

Script build chạy XeLaTeX ba lượt để khung bìa TikZ, mục lục và tham chiếu được cập nhật đầy đủ.
Nếu biên dịch trực tiếp bằng XeLaTeX, cần chạy lại với cùng tên đầu ra đến khi hết thông báo yêu cầu chạy lại; một lượt đầu có thể tạo khung bìa lệch và mục lục trống.
Trong trình soạn thảo, có thể chọn quy trình `latexmk` với XeLaTeX để tự chạy đủ các lượt.

## Kiểm tra proposal

Sau khi build, chạy kiểm tra cấu trúc nguồn, ảnh, tham chiếu, ID chức năng, phân công, tổng giờ, điểm và ngân sách:

```powershell
node tools/verify-proposal.cjs
```

Để kiểm tra thêm font/cỡ chữ, tọa độ chữ, giãn dòng và các liên kết nguồn giá trong PDF, xuất dữ liệu bằng Poppler rồi truyền vào công cụ kiểm tra:

```powershell
New-Item -ItemType Directory -Force tmp/pdfs | Out-Null
pdftohtml -xml -zoom 1 -hidden -i Docs/16_24127261_24127542_24127581_PROPOSAL.pdf tmp/pdfs/submission-audit
pdftotext -f 3 -l 3 -bbox-layout -enc UTF-8 Docs/16_24127261_24127542_24127581_PROPOSAL.pdf tmp/pdfs/font-spacing-check.html
pdftotext -layout -enc UTF-8 Docs/16_24127261_24127542_24127581_PROPOSAL.pdf tmp/pdfs/proposal-review.txt
node tools/verify-proposal.cjs tmp/pdfs/submission-audit.xml tmp/pdfs/font-spacing-check.html tmp/pdfs/proposal-review.txt
```

Vẫn cần xem bản render PDF để kiểm tra bố cục. Chữ văn bản, bảng và chú thích dùng cỡ 13; bìa có cỡ riêng, chỉ số khoa học như số 2 trong CO₂ và ký hiệu toán được thu nhỏ theo quy ước. Các chữ nằm bên trong ảnh wireframe là một phần của ảnh gốc, không được công cụ kiểm tra font của PDF đánh giá.

Mục 2.1 dùng tám ảnh cơ khí cập nhật ngày 04/11/2026: bên ngoài, bên trong, bốn mặt đứng, tách nắp, bộ vít và đai ốc.
DHT22 nằm ngang ở đáy khoang trái, mặt lưới hướng lên nắp; MQ135 nằm trên gá đáy trong khoang phải có vách ngăn riêng. Hai cảm biến không treo lên thành.
Nguồn model xem [ghi nguồn ảnh](Docs/images/enclosure/ATTRIBUTION.md).

[Bản Fusion cuối cùng](Designs/SmartClassroom.f3d) được giữ trong `Designs/`.
Thông số bố trí và kiểm tra hình học nằm trong [metadata thiết kế](Docs/images/enclosure/design-metadata.json).

## Thiết kế hiện hành

Proposal hiện dùng bộ hình Room Instrument trong `Docs/images/wireframes-room-instrument/clean/`. Các tài liệu UI và prototype dưới đây thuộc bộ thiết kế trước; phần LED trong proposal đã có mô tả mới, còn ảnh wireframe được giữ nguyên theo quyết định của nhóm.

[Thư viện 35 màn hình](Docs/wireframes-v3/index.html) · [Prototype web/mobile](Docs/prototype/index.html) · [Đặc tả UI](Docs/huong_dan_wireframe_v3.md) · [Chỉ mục ảnh và Figma](Docs/wireframe_v3_manifest.md).

Bộ UI trắng–đen phẳng dùng điều hướng ngang trên desktop, Manrope + Be Vietnam Pro, gauge độ ẩm, slider LED và bộ chọn màu trực quan. Font chạy offline. Bản thử dùng dữ liệu/lệnh mô phỏng; độ sáng cần tích hợp backend/ESP32 khi triển khai thật.

Page 1 của Figma VLcCNTT có 14 màn web, 19 màn mobile và 2 WiFi. Chart phân biệt giờ/ngày, mốc 00:00, ngày chưa kết thúc và dữ liệu thiếu; có trang bản ghi, thiết bị, Telegram và tài khoản. Bộ ảnh hiện hành gồm 47 cặp SVG/PNG, đã đồng bộ hình dùng trong báo cáo.
