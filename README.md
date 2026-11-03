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
| `scripts/` | Lệnh biên dịch tài liệu |

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
