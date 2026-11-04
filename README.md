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
| `scripts/` | Lệnh biên dịch tài liệu |
| `tools/` | Công cụ xuất ảnh, đối chiếu ảnh và kiểm thử bản thử UI |

Ảnh hộp và thông tin nguồn đã được giữ trong `Docs/images/enclosure/`.
`Archive/`, `Designs/`, `Models/` không cần để biên dịch tài liệu và được loại khỏi Git.

## Biên dịch

Cần XeLaTeX (MiKTeX hoặc TeX Live). Chạy trong PowerShell:

```powershell
.\scripts\build-proposal.ps1
```

Kết quả: `Docs/16_24127261_24127542_24127581_PROPOSAL.pdf`.
File trung gian ở `Docs/.build/proposal/`, được Git bỏ qua.
Phụ lục `Docs/Phu_luc_A_MQ135.pdf` được giữ nguyên.

Mục 2.1 dùng ảnh cơ khí cuối: bên ngoài, bên trong, bốn mặt đứng, tách nắp, bộ vít và đai ốc.
Nguồn model xem [ghi nguồn ảnh](Docs/images/enclosure/ATTRIBUTION.md).

## Thiết kế hiện hành

[Thư viện 35 màn hình](Docs/wireframes-v3/index.html) · [Prototype web/mobile](Docs/prototype/index.html) · [Đặc tả UI](Docs/huong_dan_wireframe_v3.md) · [Chỉ mục ảnh và Figma](Docs/wireframe_v3_manifest.md).

Bộ UI trắng–đen phẳng dùng điều hướng ngang trên desktop, Manrope + Be Vietnam Pro, gauge độ ẩm, slider LED và bộ chọn màu trực quan. Font chạy offline. Bản thử dùng dữ liệu/lệnh mô phỏng; độ sáng cần tích hợp backend/ESP32 khi triển khai thật.

Page 1 của Figma VLcCNTT có 14 màn web, 19 màn mobile và 2 WiFi. Chart phân biệt giờ/ngày, mốc 00:00, ngày chưa kết thúc và dữ liệu thiếu; có trang bản ghi, thiết bị, Telegram và tài khoản. Bộ ảnh hiện hành gồm 47 cặp SVG/PNG, đã đồng bộ hình dùng trong báo cáo.
