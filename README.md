# Smart Classroom — Nhóm 16

Nguồn LaTeX và tài liệu đồ án Phòng học thông minh.

| Thư mục | Nội dung |
|---|---|
| `Docs/` | Nguồn LaTeX, PDF thuyết minh và phụ lục |
| `Docs/images/branding/` | Logo trên bìa |
| `Docs/images/components/` | Ảnh linh kiện và vật tư |
| `Docs/images/diagrams/` | Sơ đồ truyền nhận dữ liệu, PNG và SVG nguồn |
| `Docs/images/enclosure/` | Ảnh hộp, các mặt đứng và nguồn model |
| `Docs/images/wireframes/` | Bản copy hình UI được dùng trực tiếp trong báo cáo |
| `Docs/wireframes-v3/` | Bộ thiết kế hiện hành, ảnh màn hình và báo cáo, bố cục responsive |
| `Docs/prototype/` | Bản thử tương tác web/mobile, mở `index.html` bằng trình duyệt |
| `Docs/reference/` | Quy định và yêu cầu đồ án |
| `scripts/` | Biên dịch proposal bằng XeLaTeX |
| `tools/` | Công cụ xuất ảnh, đối chiếu ảnh và kiểm thử bản thử UI |

Ảnh hộp và thông tin nguồn đã được giữ trong `Docs/images/enclosure/`.
`Archive/`, `Designs/`, `Models/` không cần để biên dịch tài liệu và được loại khỏi Git.

## Biên dịch

Cần XeLaTeX (MiKTeX hoặc TeX Live). Chạy trong PowerShell:

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

Mục 2.1 dùng tám ảnh cơ khí cập nhật ngày 04/11/2026: bên ngoài, bên trong, bốn mặt đứng, tách nắp, bộ vít và đai ốc.
DHT22 nằm ngang ở đáy khoang trái, mặt lưới hướng lên nắp; MQ135 nằm trên gá đáy trong khoang phải có vách ngăn riêng. Hai cảm biến không treo lên thành.
Nguồn model xem [ghi nguồn ảnh](Docs/images/enclosure/ATTRIBUTION.md).

[Bản Fusion cuối cùng](Designs/SmartClassroom.f3d) được giữ trong `Designs/`.
Thông số bố trí và kiểm tra hình học nằm trong [metadata thiết kế](Docs/images/enclosure/design-metadata.json).

## Thiết kế hiện hành

[Prototype web/mobile](Docs/prototype/index.html) · [Đặc tả UI](Docs/huong_dan_wireframe_v3.md) · [Chỉ mục ảnh và Figma](Docs/wireframe_v3_manifest.md).

Bộ UI trắng–đen phẳng dùng điều hướng ngang trên desktop, Manrope + Be Vietnam Pro, gauge độ ẩm, slider LED và bộ chọn màu trực quan. Font chạy offline. Bản thử dùng dữ liệu/lệnh mô phỏng; độ sáng cần tích hợp backend/ESP32 khi triển khai thật.
