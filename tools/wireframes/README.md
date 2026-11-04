# Nguồn dựng phần nâng cấp trên Figma

Các hàm dùng proxy **Reqwise Figma MCP**, không phải Figma Plugin API chính thức. Nguồn hiện hành: VLcCNTT / Page 1 (`0:1`).

- `native-core.js`: chữ, card, masthead, chart, legend và khung mobile.
- `native-pages-a.js`, `native-pages-b.js`: các trang chi tiết và board báo cáo.
- `native-wrap.js`: wrapper chú thích và bố trí các nhóm.
- `report-mobile.js`: board R07 phóng lớn cho báo cáo; dùng hàm này thay bản ghép điện thoại của R07.
- `screen-plans.json`: 25 màn đã thay đổi/tạo mới, có node wrapper/UI thật để cập nhật đúng chỗ.

Đọc tài liệu API Reqwise, kiểm tra đúng file/Page 1 trước khi chạy qua `figma_write`. Nạp các hàm, gọi `kWrap(plan)` rồi hàm `plan.draw` với `ui` và `args`; chia theo nhóm nhỏ. Hàm dựng xóa các con trong UI mục tiêu và dựng lại, giữ root ID. Không chạy như CLI Node; `figma` là proxy do MCP cung cấp.

R03: `kReportCharts('8:1886')`; R05: `kReportPhone` với `kOverviewPhone`; R07: `kReportMobileAnalytics('8:1890')`; R09: `kReportConnections('62:6241')`. Sau sửa cần layout audit và xuất SVG từ node Figma thật.

Từ thư mục workspace, công cụ hoàn thiện bộ ảnh:

```powershell
node SmartClassroom/tools/render-wireframes.cjs
node SmartClassroom/tools/verify-wireframes.cjs
node SmartClassroom/tools/build-wireframe-index.cjs
```

Registry nguồn ở `Docs/wireframes-v3/assets.json`. Cần copy PNG báo cáo tương ứng vào `Docs/images/wireframes/` trước khi chạy verifier/biên dịch PDF. Không dùng ID của bộ dựng SVG tạm làm node nguồn.
