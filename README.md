# Smart Classroom — Nhóm 16

Nguồn LaTeX và tài liệu đồ án Phòng học thông minh.

| Thư mục | Nội dung |
|---|---|
| `Docs/` | Nguồn LaTeX, PDF thuyết minh và phụ lục |
| `Docs/images/branding/` | Logo trên bìa |
| `Docs/images/components/` | Ảnh linh kiện và vật tư |
| `Docs/images/diagrams/` | Sơ đồ truyền nhận dữ liệu, PNG và SVG nguồn |
| `Docs/images/enclosure/` | Ảnh hộp, các mặt đứng và nguồn model |
| `Docs/reference/` | Quy định và yêu cầu đồ án |

Ảnh hộp và thông tin nguồn đã được giữ trong `Docs/images/enclosure/`.
`Archive/`, `Designs/`, `Models/` không cần để biên dịch tài liệu và được loại khỏi Git.

## Biên dịch

Cần XeLaTeX (MiKTeX hoặc TeX Live). Chạy trong PowerShell:

```powershell
Push-Location Docs
latexmk -xelatex -jobname=16_24127261_24127542_24127581_PROPOSAL thuyet_minh.tex
Pop-Location
```

Kết quả: `Docs/16_24127261_24127542_24127581_PROPOSAL.pdf`.
Các file trung gian LaTeX được Git bỏ qua.
Phụ lục `Docs/Phu_luc_A_MQ135.pdf` được giữ nguyên.

Mục 2.1 dùng tám ảnh cơ khí cập nhật ngày 04/11/2026: bên ngoài, bên trong, bốn mặt đứng, tách nắp, bộ vít và đai ốc.
DHT22 nằm ngang ở đáy khoang trái, mặt lưới hướng lên nắp; MQ135 nằm trên gá đáy trong khoang phải có vách ngăn riêng. Hai cảm biến không treo lên thành.
Nguồn model xem [ghi nguồn ảnh](Docs/images/enclosure/ATTRIBUTION.md).

[Bản Fusion cuối cùng](Designs/SmartClassroom.f3d) được giữ trong `Designs/`.
Thông số bố trí và kiểm tra hình học nằm trong [metadata thiết kế](Docs/images/enclosure/design-metadata.json).
