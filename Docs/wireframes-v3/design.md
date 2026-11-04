# VLcCNTT Design System

> Bản V3 · 03/11/2026 · Chỉ nâng cấp **Page 1**. Inventory do MCP đọc toàn document; Page 2 chỉ được đọc để kiểm tra bảo toàn, không sửa. Danh sách 17 màn hình hiện hành: [manifest V3](../wireframe_v3_manifest.md).

> Tài liệu áp dụng: [đặc tả V3](../huong_dan_wireframe_v3.md), đã tổng hợp các quy tắc còn dùng từ những bản trước. Tên component có `V2` và tên `huong_dan_wireframe.md` trong mô tả trích xuất bên dưới là metadata gốc của các component vẫn được tái sử dụng; tệp hướng dẫn cũ đã được loại bỏ, dùng đặc tả V3 để tra hành vi hiện hành.

Extraction scope: Entire document
Current page when extracted: Page 1
Pages discovered: Page 1, Page 2

## Overview
VLcCNTT exposes 0 component set(s), 25 standalone component(s), and 0 set variant node(s), plus 24 variables across 1 collection(s) and 0 local styles.

**Key Characteristics To Confirm:**
- Primary brand colors: see the Colors section. Confirm semantic roles from screenshots before assigning brand meaning.
- Type system: see Typography. Numeric/display roles must be inferred from text style names and actual UI usage.
- Theme model: inspect color collection modes and page usage; do not assume light/dark behavior unless variables or screens show it.
- Component reuse: components below list exact property keys where Figma exposes them.

## Extraction Coverage
- Pages scanned: 2
- Local components returned: 25/25
- Screens summarized: 18/18
- Instances inspected: 111/111
- Component anatomy depth: 3; screen evidence depth: 4
- Screen evidence: included; component usage: included

> Evidence labels: IDs, keys, properties, values, counts, and geometry are direct Figma facts. Pattern summaries are observations from the scanned nodes. Product meaning, UX intent, and breakpoint semantics remain unknown unless explicitly named or described in Figma.

## Colors
### Variable Colors
#### Other
- **primary** (`{primary}`): Mode 1: #1f1f1f
- **background** (`{background}`): Mode 1: #f5f5f5
- **surface** (`{surface}`): Mode 1: #ffffff
- **text** (`{text}`): Mode 1: #1f1f1f
- **muted** (`{muted}`): Mode 1: #666666
- **border** (`{border}`): Mode 1: #d0d0d0
- **soft** (`{soft}`): Mode 1: #ececec
- **ledBlue** (`{ledBlue}`): Mode 1: #3b82f6
- **scv3Humidity** (`{scv3Humidity}`): Mode 1: #2563eb
- **scv3Temperature** (`{scv3Temperature}`): Mode 1: #c2410c
- **scv3CO2** (`{scv3CO2}`): Mode 1: #7c3aed
- **scv3Success** (`{scv3Success}`): Mode 1: #166534
- **scv3SuccessBg** (`{scv3SuccessBg}`): Mode 1: #f0fdf4
- **scv3Warning** (`{scv3Warning}`): Mode 1: #92400e
- **scv3WarningBg** (`{scv3WarningBg}`): Mode 1: #fffbeb
- **scv3Danger** (`{scv3Danger}`): Mode 1: #991b1b
- **scv3DangerBg** (`{scv3DangerBg}`): Mode 1: #fef2f2
- **scv3Info** (`{scv3Info}`): Mode 1: #1d4ed8
- **scv3InfoBg** (`{scv3InfoBg}`): Mode 1: #eff6ff
- **scv3FieldBorder** (`{scv3FieldBorder}`): Mode 1: #8793a2

## Typography
_No local text styles found._

## Layout
### Spacing & Size Tokens
- `{space}`: Mode 1: 8
### Component Layout Patterns
- `SC/Button/Primary`: layoutMode=HORIZONTAL, itemSpacing=0, padding={"left":12,"right":12,"top":12,"bottom":12}, primaryAxisSizingMode=FIXED, counterAxisSizingMode=FIXED, primaryAxisAlignItems=CENTER, counterAxisAlignItems=CENTER, clipsContent=false
- `SC/Button/Secondary`: layoutMode=HORIZONTAL, itemSpacing=0, padding={"left":12,"right":12,"top":12,"bottom":12}, primaryAxisSizingMode=FIXED, counterAxisSizingMode=FIXED, primaryAxisAlignItems=CENTER, counterAxisAlignItems=CENTER, clipsContent=false
- `SC/Button/Disabled`: layoutMode=HORIZONTAL, itemSpacing=0, padding={"left":12,"right":12,"top":12,"bottom":12}, primaryAxisSizingMode=FIXED, counterAxisSizingMode=FIXED, primaryAxisAlignItems=CENTER, counterAxisAlignItems=CENTER, clipsContent=false
- `SC/Field/Text`: layoutMode=VERTICAL, itemSpacing=8, padding={"left":0,"right":0,"top":0,"bottom":0}, primaryAxisSizingMode=AUTO, counterAxisSizingMode=FIXED, primaryAxisAlignItems=MIN, counterAxisAlignItems=MIN, clipsContent=false
- `SC/Field/Password`: layoutMode=VERTICAL, itemSpacing=8, padding={"left":0,"right":0,"top":0,"bottom":0}, primaryAxisSizingMode=AUTO, counterAxisSizingMode=FIXED, primaryAxisAlignItems=MIN, counterAxisAlignItems=MIN, clipsContent=false
- `SC/Field/Select`: layoutMode=VERTICAL, itemSpacing=8, padding={"left":0,"right":0,"top":0,"bottom":0}, primaryAxisSizingMode=AUTO, counterAxisSizingMode=FIXED, primaryAxisAlignItems=MIN, counterAxisAlignItems=MIN, clipsContent=false
- `SC/Gauge/Humidity/Desktop`: layoutMode=NONE, clipsContent=false
- `SC/Gauge/Temperature/Desktop`: layoutMode=NONE, clipsContent=false
- `SC/Gauge/CO2/Desktop`: layoutMode=NONE, clipsContent=false
- `SC/Gauge/Humidity/Mobile`: layoutMode=NONE, clipsContent=false
- `SC/Gauge/Temperature/Mobile`: layoutMode=NONE, clipsContent=false
- `SC/Gauge/CO2/Mobile`: layoutMode=NONE, clipsContent=false
- `SC/Navigation/Overview`: layoutMode=NONE, clipsContent=false
- `SC/Navigation/LED`: layoutMode=NONE, clipsContent=false
- `SC/Navigation/History`: layoutMode=NONE, clipsContent=false
- `SC/V2/Button/Primary`: layoutMode=HORIZONTAL, itemSpacing=0, padding={"left":12,"right":12,"top":12,"bottom":12}, primaryAxisSizingMode=FIXED, counterAxisSizingMode=FIXED, primaryAxisAlignItems=CENTER, counterAxisAlignItems=CENTER, clipsContent=false
- `SC/V2/Button/Secondary`: layoutMode=HORIZONTAL, itemSpacing=0, padding={"left":12,"right":12,"top":12,"bottom":12}, primaryAxisSizingMode=FIXED, counterAxisSizingMode=FIXED, primaryAxisAlignItems=CENTER, counterAxisAlignItems=CENTER, clipsContent=false
- `SC/V2/Button/Soft`: layoutMode=HORIZONTAL, itemSpacing=0, padding={"left":12,"right":12,"top":12,"bottom":12}, primaryAxisSizingMode=FIXED, counterAxisSizingMode=FIXED, primaryAxisAlignItems=CENTER, counterAxisAlignItems=CENTER, clipsContent=false
- `SC/V2/Button/Disabled`: layoutMode=HORIZONTAL, itemSpacing=0, padding={"left":12,"right":12,"top":12,"bottom":12}, primaryAxisSizingMode=FIXED, counterAxisSizingMode=FIXED, primaryAxisAlignItems=CENTER, counterAxisAlignItems=CENTER, clipsContent=false
- `SC/V2/Field/Text`: layoutMode=VERTICAL, itemSpacing=8, padding={"left":0,"right":0,"top":0,"bottom":0}, primaryAxisSizingMode=AUTO, counterAxisSizingMode=FIXED, primaryAxisAlignItems=MIN, counterAxisAlignItems=MIN, clipsContent=false
- `SC/V2/Field/Password`: layoutMode=VERTICAL, itemSpacing=8, padding={"left":0,"right":0,"top":0,"bottom":0}, primaryAxisSizingMode=AUTO, counterAxisSizingMode=FIXED, primaryAxisAlignItems=MIN, counterAxisAlignItems=MIN, clipsContent=false
- `SC/V2/Field/Select`: layoutMode=VERTICAL, itemSpacing=8, padding={"left":0,"right":0,"top":0,"bottom":0}, primaryAxisSizingMode=AUTO, counterAxisSizingMode=FIXED, primaryAxisAlignItems=MIN, counterAxisAlignItems=MIN, clipsContent=false
- `SC/V2/Navigation/Overview`: layoutMode=NONE, clipsContent=false
- `SC/V2/Navigation/LED`: layoutMode=NONE, clipsContent=false
- `SC/V2/Navigation/History`: layoutMode=NONE, clipsContent=false

## Observed Layout & Visual Patterns
These are frequency observations, not automatically approved design tokens:
- Screen widths: 390px (×6), 1440px (×3), 2600px (×2), 5440px (×2), 1630px (×1), 1880px (×1), 3440px (×1), 3620px (×1), 4320px (×1)
- Auto-layout gaps: 0px (×184), 8px (×131), 6px (×27), 3px (×19), 16px (×19), 2px (×15), 12px (×15), 10px (×11), 20px (×9), 4px (×8), 5px (×7), 14px (×7), 1px (×4), 24px (×4), 18px (×2), 60px (×2)
- Padding values: 0px (×976), 12px (×433), 14px (×100), 8px (×76), 16px (×76), 6px (×40), 18px (×32), 20px (×24), 24px (×22), 10px (×21), 40px (×14), 32px (×12), 2px (×10), 44px (×8), 48px (×8), 4px (×6)
- Corner radii: 0px (×830), 8px (×261), 16px (×163), 12px (×134), 1px (×81), 6px (×73), 4px (×67), 2px (×60), 14px (×28), 3px (×23), 20px (×23), 5px (×13), 10px (×11), 24px (×8), 15px (×4), 28px (×3)
- Font sizes: 14px (×607), 16px (×261), 22px (×94), 24px (×67), 18px (×59), 20px (×59), 11px (×54), 28px (×33), 12px (×29), 10px (×19), 32px (×15), 13px (×12), 36px (×9), 9px (×7), 48px (×7), 15px (×5)
- Solid fills: #1f1f1f (×769), #ffffff (×478), #5b6472 (×474), #dbeafe (×130), #d0d0d0 (×105), #ececec (×103), #666666 (×78), #64748b (×59), #0f172a (×53), #2563eb (×53), #f6f8fb (×46), #f8fafc (×27), #93c5fd (×26), #eff6ff (×24), #991b1b (×20), #60a5fa (×19)

## Elevation & Depth
_No local effect styles found. Treat elevation as flat unless component anatomy shows shadows._

## Shapes
### Radius Tokens
- `{radius}`: Mode 1: 8
- `{scv2ControlRadius}`: Mode 1: 12
- `{scv2CardRadius}`: Mode 1: 16
### Observed Component Radii
- `SC/Button/Primary`: cornerRadius=8, topLeftRadius=8, topRightRadius=8, bottomRightRadius=8, bottomLeftRadius=8
- `SC/Button/Secondary`: cornerRadius=8, topLeftRadius=8, topRightRadius=8, bottomRightRadius=8, bottomLeftRadius=8
- `SC/Button/Disabled`: cornerRadius=8, topLeftRadius=8, topRightRadius=8, bottomRightRadius=8, bottomLeftRadius=8
- `SC/V2/Button/Primary`: cornerRadius=12, topLeftRadius=12, topRightRadius=12, bottomRightRadius=12, bottomLeftRadius=12
- `SC/V2/Button/Secondary`: cornerRadius=12, topLeftRadius=12, topRightRadius=12, bottomRightRadius=12, bottomLeftRadius=12
- `SC/V2/Button/Soft`: cornerRadius=12, topLeftRadius=12, topRightRadius=12, bottomRightRadius=12, bottomLeftRadius=12
- `SC/V2/Button/Disabled`: cornerRadius=12, topLeftRadius=12, topRightRadius=12, bottomRightRadius=12, bottomLeftRadius=12

## Agent Rules
- Reuse listed components before drawing equivalent new UI.
- Use component properties and variants when available; use layer overrides only as a fallback.
- Use variables/styles by name instead of hardcoded values when a matching token exists.
- Treat node IDs as bindings to this exact Figma file. After duplicating/migrating a file, resolve by component key/name and refresh IDs before writing.
- Treat frequency observations as candidates, not semantic tokens, unless a matching Figma variable/style or explicit description confirms them.
- After creating or modifying UI, run `layout_audit` on the changed frame.
- Treat this file as source-grounded. Fill narrative gaps only after reading screenshots, selected nodes, or additional Figma pages.

## Variables
### Reqwise Tokens (Mode 1)
- `primary` (COLOR) = Mode 1: #1f1f1f
- `background` (COLOR) = Mode 1: #f5f5f5
- `surface` (COLOR) = Mode 1: #ffffff
- `text` (COLOR) = Mode 1: #1f1f1f
- `muted` (COLOR) = Mode 1: #666666
- `border` (COLOR) = Mode 1: #d0d0d0
- `soft` (COLOR) = Mode 1: #ececec
- `ledBlue` (COLOR) = Mode 1: #3b82f6
- `radius` (FLOAT) = Mode 1: 8
- `space` (FLOAT) = Mode 1: 8
- `scv2ControlRadius` (FLOAT) = Mode 1: 12
- `scv2CardRadius` (FLOAT) = Mode 1: 16
- `scv3Humidity` (COLOR) = Mode 1: #2563eb
- `scv3Temperature` (COLOR) = Mode 1: #c2410c
- `scv3CO2` (COLOR) = Mode 1: #7c3aed
- `scv3Success` (COLOR) = Mode 1: #166534
- `scv3SuccessBg` (COLOR) = Mode 1: #f0fdf4
- `scv3Warning` (COLOR) = Mode 1: #92400e
- `scv3WarningBg` (COLOR) = Mode 1: #fffbeb
- `scv3Danger` (COLOR) = Mode 1: #991b1b
- `scv3DangerBg` (COLOR) = Mode 1: #fef2f2
- `scv3Info` (COLOR) = Mode 1: #1d4ed8
- `scv3InfoBg` (COLOR) = Mode 1: #eff6ff
- `scv3FieldBorder` (COLOR) = Mode 1: #8793a2

## Styles
_No local styles found._

## Components
### SC/Button/Primary
- Type: COMPONENT (Page 1/00-Foundations/SC/Button/Primary)
- Figma node ID: `6:164`
- Figma component key: `6e81c860a39862fa4f74a2d12992dddc76249d4e`
- Source page: Page 1
- Description: Smart Classroom / VLcCNTT. SC/Button/Primary. Dùng chung cho wireframe web và app. Inter, nền sáng, thang xám. Override các lớp Label/Value khi có; giữ nguyên ngữ nghĩa chức năng theo huong_dan_wireframe.md.
- Layout: layoutMode=HORIZONTAL, itemSpacing=0, padding={"left":12,"right":12,"top":12,"bottom":12}, primaryAxisSizingMode=FIXED, counterAxisSizingMode=FIXED, primaryAxisAlignItems=CENTER, counterAxisAlignItems=CENTER, clipsContent=false
- Shape: cornerRadius=8, topLeftRadius=8, topRightRadius=8, bottomRightRadius=8, bottomLeftRadius=8
- Text layers:
  - `SC/Button/Primary/Label`: "Nút chính" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/Button/Primary` (COMPONENT; 320x48; layout=HORIZONTAL; fill=#1f1f1f; refs={})
  -   `SC/Button/Primary/Label` (TEXT; 75x19; fill=#ffffff; text="Nút chính"; refs={})
- Usage:
  - Find it with figma.findComponent("SC/Button/Primary").
  - Instantiate with figma.instantiate("6:164", { parentId, props, overrides }).
- Observed instances: 12
- Used on pages: Page 1
- Used in screens: Page 1 / 10-Web, Page 1 / 20-App, Page 1 / 30-WiFi, Page 1 / 40-States-Flows
- Instantiate:
```js
await figma.instantiate("6:164", {
  parentId: screen.id,
});
```

### SC/Button/Secondary
- Type: COMPONENT (Page 1/00-Foundations/SC/Button/Secondary)
- Figma node ID: `6:165`
- Figma component key: `1f2ffaa33e1cfb1d90191af974bdba60e03b8e23`
- Source page: Page 1
- Description: Smart Classroom / VLcCNTT. SC/Button/Secondary. Dùng chung cho wireframe web và app. Inter, nền sáng, thang xám. Override các lớp Label/Value khi có; giữ nguyên ngữ nghĩa chức năng theo huong_dan_wireframe.md.
- Layout: layoutMode=HORIZONTAL, itemSpacing=0, padding={"left":12,"right":12,"top":12,"bottom":12}, primaryAxisSizingMode=FIXED, counterAxisSizingMode=FIXED, primaryAxisAlignItems=CENTER, counterAxisAlignItems=CENTER, clipsContent=false
- Shape: cornerRadius=8, topLeftRadius=8, topRightRadius=8, bottomRightRadius=8, bottomLeftRadius=8
- Text layers:
  - `SC/Button/Secondary/Label`: "Nút phụ" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/Button/Secondary` (COMPONENT; 320x48; layout=HORIZONTAL; fill=#ffffff; refs={})
  -   `SC/Button/Secondary/Label` (TEXT; 62x19; fill=#1f1f1f; text="Nút phụ"; refs={})
- Usage:
  - Find it with figma.findComponent("SC/Button/Secondary").
  - Instantiate with figma.instantiate("6:165", { parentId, props, overrides }).
- Observed instances: 9
- Used on pages: Page 1
- Used in screens: Page 1 / 10-Web, Page 1 / 30-WiFi, Page 1 / 40-States-Flows
- Instantiate:
```js
await figma.instantiate("6:165", {
  parentId: screen.id,
});
```

### SC/Button/Disabled
- Type: COMPONENT (Page 1/00-Foundations/SC/Button/Disabled)
- Figma node ID: `6:166`
- Figma component key: `97e6aacd4cd73dda43f612f601ca8042fbedf615`
- Source page: Page 1
- Description: Smart Classroom / VLcCNTT. SC/Button/Disabled. Dùng chung cho wireframe web và app. Inter, nền sáng, thang xám. Override các lớp Label/Value khi có; giữ nguyên ngữ nghĩa chức năng theo huong_dan_wireframe.md.
- Layout: layoutMode=HORIZONTAL, itemSpacing=0, padding={"left":12,"right":12,"top":12,"bottom":12}, primaryAxisSizingMode=FIXED, counterAxisSizingMode=FIXED, primaryAxisAlignItems=CENTER, counterAxisAlignItems=CENTER, clipsContent=false
- Shape: cornerRadius=8, topLeftRadius=8, topRightRadius=8, bottomRightRadius=8, bottomLeftRadius=8
- Text layers:
  - `SC/Button/Disabled/Label`: "Chưa có thay đổi" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/Button/Disabled` (COMPONENT; 320x48; layout=HORIZONTAL; fill=#ececec; refs={})
  -   `SC/Button/Disabled/Label` (TEXT; 131x19; fill=#666666; text="Chưa có thay đổi"; refs={})
- Usage:
  - Find it with figma.findComponent("SC/Button/Disabled").
  - Instantiate with figma.instantiate("6:166", { parentId, props, overrides }).
- Observed instances: 10
- Used on pages: Page 1
- Used in screens: Page 1 / 10-Web, Page 1 / 20-App, Page 1 / 40-States-Flows
- Instantiate:
```js
await figma.instantiate("6:166", {
  parentId: screen.id,
});
```

### SC/Field/Text
- Type: COMPONENT (Page 1/00-Foundations/SC/Field/Text)
- Figma node ID: `6:168`
- Figma component key: `33830450643f8c4b73cdc482d6162bb9609a9d6f`
- Source page: Page 1
- Description: Smart Classroom / VLcCNTT. SC/Field/Text. Dùng chung cho wireframe web và app. Inter, nền sáng, thang xám. Override các lớp Label/Value khi có; giữ nguyên ngữ nghĩa chức năng theo huong_dan_wireframe.md.
- Layout: layoutMode=VERTICAL, itemSpacing=8, padding={"left":0,"right":0,"top":0,"bottom":0}, primaryAxisSizingMode=AUTO, counterAxisSizingMode=FIXED, primaryAxisAlignItems=MIN, counterAxisAlignItems=MIN, clipsContent=false
- Text layers:
  - `SC/Field/Text/Label`: "Tài khoản" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/Field/Text/fieldText/Box/Value`: "Nhập tên tài khoản" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/Field/Text` (COMPONENT; 342x77; layout=VERTICAL; refs={})
  -   `SC/Field/Text/Label` (TEXT; 342x21; fill=#1f1f1f; text="Tài khoản"; refs={})
  -   `SC/Field/Text/fieldText/Box` (FRAME; 342x48; layout=HORIZONTAL; fill=#ffffff; refs={})
  -     `SC/Field/Text/fieldText/Box/Value` (TEXT; 312x24; fill=#666666; text="Nhập tên tài khoản"; refs={})
- Usage:
  - Find it with figma.findComponent("SC/Field/Text").
  - Instantiate with figma.instantiate("6:168", { parentId, props, overrides }).
- Observed instances: 17
- Used on pages: Page 1
- Used in screens: Page 1 / 10-Web, Page 1 / 20-App, Page 1 / 40-States-Flows
- Instantiate:
```js
await figma.instantiate("6:168", {
  parentId: screen.id,
});
```

### SC/Field/Password
- Type: COMPONENT (Page 1/00-Foundations/SC/Field/Password)
- Figma node ID: `6:169`
- Figma component key: `a6ae4912f219f6960afcdd55637817817ac0a10f`
- Source page: Page 1
- Description: Smart Classroom / VLcCNTT. SC/Field/Password. Dùng chung cho wireframe web và app. Inter, nền sáng, thang xám. Override các lớp Label/Value khi có; giữ nguyên ngữ nghĩa chức năng theo huong_dan_wireframe.md.
- Layout: layoutMode=VERTICAL, itemSpacing=8, padding={"left":0,"right":0,"top":0,"bottom":0}, primaryAxisSizingMode=AUTO, counterAxisSizingMode=FIXED, primaryAxisAlignItems=MIN, counterAxisAlignItems=MIN, clipsContent=false
- Text layers:
  - `SC/Field/Password/Label`: "Mật khẩu" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/Field/Password/fieldPassword/Box/Value`: "••••••••" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/Field/Password/fieldPassword/Box/fieldPassword/Trailing`: "Hiện" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/Field/Password` (COMPONENT; 342x77; layout=VERTICAL; refs={})
  -   `SC/Field/Password/Label` (TEXT; 342x21; fill=#1f1f1f; text="Mật khẩu"; refs={})
  -   `SC/Field/Password/fieldPassword/Box` (FRAME; 342x48; layout=HORIZONTAL; fill=#ffffff; refs={})
  -     `SC/Field/Password/fieldPassword/Box/Value` (TEXT; 266x24; fill=#1f1f1f; text="••••••••"; refs={})
  -     `SC/Field/Password/fieldPassword/Box/fieldPassword/Trailing` (TEXT; 38x20; fill=#666666; text="Hiện"; refs={})
- Usage:
  - Find it with figma.findComponent("SC/Field/Password").
  - Instantiate with figma.instantiate("6:169", { parentId, props, overrides }).
- Observed instances: 12
- Used on pages: Page 1
- Used in screens: Page 1 / 10-Web, Page 1 / 20-App, Page 1 / 30-WiFi, Page 1 / 40-States-Flows
- Instantiate:
```js
await figma.instantiate("6:169", {
  parentId: screen.id,
});
```

### SC/Field/Select
- Type: COMPONENT (Page 1/00-Foundations/SC/Field/Select)
- Figma node ID: `6:170`
- Figma component key: `93e43a06658477123df5abb4d7e3067b5e46b2e1`
- Source page: Page 1
- Description: Smart Classroom / VLcCNTT. SC/Field/Select. Dùng chung cho wireframe web và app. Inter, nền sáng, thang xám. Override các lớp Label/Value khi có; giữ nguyên ngữ nghĩa chức năng theo huong_dan_wireframe.md.
- Layout: layoutMode=VERTICAL, itemSpacing=8, padding={"left":0,"right":0,"top":0,"bottom":0}, primaryAxisSizingMode=AUTO, counterAxisSizingMode=FIXED, primaryAxisAlignItems=MIN, counterAxisAlignItems=MIN, clipsContent=false
- Text layers:
  - `SC/Field/Select/Label`: "Chỉ số" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/Field/Select/fieldSelect/Box/Value`: "Độ ẩm" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/Field/Select/fieldSelect/Box/fieldSelect/Trailing`: "⌄" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/Field/Select` (COMPONENT; 342x77; layout=VERTICAL; refs={})
  -   `SC/Field/Select/Label` (TEXT; 342x21; fill=#1f1f1f; text="Chỉ số"; refs={})
  -   `SC/Field/Select/fieldSelect/Box` (FRAME; 342x48; layout=HORIZONTAL; fill=#ffffff; refs={})
  -     `SC/Field/Select/fieldSelect/Box/Value` (TEXT; 284x24; fill=#1f1f1f; text="Độ ẩm"; refs={})
  -     `SC/Field/Select/fieldSelect/Box/fieldSelect/Trailing` (TEXT; 20x20; fill=#666666; text="⌄"; refs={})
- Usage:
  - Find it with figma.findComponent("SC/Field/Select").
  - Instantiate with figma.instantiate("6:170", { parentId, props, overrides }).
- Observed instances: 7
- Used on pages: Page 1
- Used in screens: Page 1 / 10-Web, Page 1 / 20-App, Page 1 / 30-WiFi, Page 1 / 40-States-Flows
- Instantiate:
```js
await figma.instantiate("6:170", {
  parentId: screen.id,
});
```

### SC/Gauge/Humidity/Desktop
- Type: COMPONENT (Page 1/00-Foundations/SC/Gauge/Humidity/Desktop)
- Figma node ID: `6:171`
- Figma component key: `a4ba47b824b35c5775beaab54608e8cfd000f50a`
- Source page: Page 1
- Description: Smart Classroom / VLcCNTT. SC/Gauge/Humidity/Desktop. Dùng chung cho wireframe web và app. Inter, nền sáng, thang xám. Override các lớp Label/Value khi có; giữ nguyên ngữ nghĩa chức năng theo huong_dan_wireframe.md.
- Layout: layoutMode=NONE, clipsContent=false
- Text layers:
  - `SC/Gauge/Humidity/Desktop/Scale`: "0–100%" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/Gauge/Humidity/Desktop` (COMPONENT; 136x136; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Track` (ELLIPSE; 136x136; fill=#ececec; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Center` (ELLIPSE; 112x112; fill=#ffffff; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick0` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick1` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick2` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick3` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick4` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick5` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick6` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick7` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick8` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick9` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick10` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick11` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick12` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick13` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick14` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick15` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick16` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick17` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick18` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick19` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick20` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick21` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick22` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Humidity/Desktop/gaugeHumidity/Tick23` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Humidity/Desktop/Scale` (TEXT; 112x21; fill=#666666; text="0–100%"; refs={})
- Usage:
  - Find it with figma.findComponent("SC/Gauge/Humidity/Desktop").
  - Instantiate with figma.instantiate("6:171", { parentId, props, overrides }).
- Instantiate:
```js
await figma.instantiate("6:171", {
  parentId: screen.id,
});
```

### SC/Gauge/Temperature/Desktop
- Type: COMPONENT (Page 1/00-Foundations/SC/Gauge/Temperature/Desktop)
- Figma node ID: `6:172`
- Figma component key: `d1fd3eb189b57b7e7ce79ff8f820e65267ad435c`
- Source page: Page 1
- Description: Smart Classroom / VLcCNTT. SC/Gauge/Temperature/Desktop. Dùng chung cho wireframe web và app. Inter, nền sáng, thang xám. Override các lớp Label/Value khi có; giữ nguyên ngữ nghĩa chức năng theo huong_dan_wireframe.md.
- Layout: layoutMode=NONE, clipsContent=false
- Text layers:
  - `SC/Gauge/Temperature/Desktop/Scale`: "0–50°C" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/Gauge/Temperature/Desktop` (COMPONENT; 136x136; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Track` (ELLIPSE; 136x136; fill=#ececec; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Center` (ELLIPSE; 112x112; fill=#ffffff; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick0` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick1` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick2` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick3` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick4` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick5` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick6` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick7` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick8` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick9` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick10` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick11` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick12` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick13` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick14` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick15` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick16` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick17` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick18` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick19` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick20` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick21` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick22` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Desktop/gaugeTemperature/Tick23` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Desktop/Scale` (TEXT; 112x21; fill=#666666; text="0–50°C"; refs={})
- Usage:
  - Find it with figma.findComponent("SC/Gauge/Temperature/Desktop").
  - Instantiate with figma.instantiate("6:172", { parentId, props, overrides }).
- Instantiate:
```js
await figma.instantiate("6:172", {
  parentId: screen.id,
});
```

### SC/Gauge/CO2/Desktop
- Type: COMPONENT (Page 1/00-Foundations/SC/Gauge/CO2/Desktop)
- Figma node ID: `6:173`
- Figma component key: `d92ba82b5dbb9d6ff49842114fd6fdc330692348`
- Source page: Page 1
- Description: Smart Classroom / VLcCNTT. SC/Gauge/CO2/Desktop. Dùng chung cho wireframe web và app. Inter, nền sáng, thang xám. Override các lớp Label/Value khi có; giữ nguyên ngữ nghĩa chức năng theo huong_dan_wireframe.md.
- Layout: layoutMode=NONE, clipsContent=false
- Text layers:
  - `SC/Gauge/CO2/Desktop/Scale`: "0–2000" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/Gauge/CO2/Desktop` (COMPONENT; 136x136; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Track` (ELLIPSE; 136x136; fill=#ececec; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Center` (ELLIPSE; 112x112; fill=#ffffff; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick0` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick1` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick2` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick3` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick4` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick5` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick6` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick7` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick8` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick9` (ELLIPSE; 7x7; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick10` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick11` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick12` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick13` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick14` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick15` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick16` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick17` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick18` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick19` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick20` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick21` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick22` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Desktop/gaugeCO2/Tick23` (ELLIPSE; 7x7; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Desktop/Scale` (TEXT; 112x21; fill=#666666; text="0–2000"; refs={})
- Usage:
  - Find it with figma.findComponent("SC/Gauge/CO2/Desktop").
  - Instantiate with figma.instantiate("6:173", { parentId, props, overrides }).
- Instantiate:
```js
await figma.instantiate("6:173", {
  parentId: screen.id,
});
```

### SC/Gauge/Humidity/Mobile
- Type: COMPONENT (Page 1/00-Foundations/SC/Gauge/Humidity/Mobile)
- Figma node ID: `6:177`
- Figma component key: `559a4114309d9dceb103180f0b3bcc8a59325cef`
- Source page: Page 1
- Description: Smart Classroom / VLcCNTT. SC/Gauge/Humidity/Mobile. Dùng chung cho wireframe web và app. Inter, nền sáng, thang xám. Override các lớp Label/Value khi có; giữ nguyên ngữ nghĩa chức năng theo huong_dan_wireframe.md.
- Layout: layoutMode=NONE, clipsContent=false
- Text layers:
  - `SC/Gauge/Humidity/Mobile/Scale`: "0–100%" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/Gauge/Humidity/Mobile` (COMPONENT; 104x104; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Track` (ELLIPSE; 104x104; fill=#ececec; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Center` (ELLIPSE; 84x84; fill=#ffffff; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick0` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick1` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick2` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick3` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick4` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick5` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick6` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick7` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick8` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick9` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick10` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick11` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick12` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick13` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick14` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick15` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick16` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick17` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick18` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick19` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick20` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick21` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick22` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Humidity/Mobile/gaugeHumiditySmall/Tick23` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Humidity/Mobile/Scale` (TEXT; 80x21; fill=#666666; text="0–100%"; refs={})
- Usage:
  - Find it with figma.findComponent("SC/Gauge/Humidity/Mobile").
  - Instantiate with figma.instantiate("6:177", { parentId, props, overrides }).
- Instantiate:
```js
await figma.instantiate("6:177", {
  parentId: screen.id,
});
```

### SC/Gauge/Temperature/Mobile
- Type: COMPONENT (Page 1/00-Foundations/SC/Gauge/Temperature/Mobile)
- Figma node ID: `6:178`
- Figma component key: `e120f265f6bd9ea96c9463d0992d0143521d3739`
- Source page: Page 1
- Description: Smart Classroom / VLcCNTT. SC/Gauge/Temperature/Mobile. Dùng chung cho wireframe web và app. Inter, nền sáng, thang xám. Override các lớp Label/Value khi có; giữ nguyên ngữ nghĩa chức năng theo huong_dan_wireframe.md.
- Layout: layoutMode=NONE, clipsContent=false
- Text layers:
  - `SC/Gauge/Temperature/Mobile/Scale`: "0–50°C" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/Gauge/Temperature/Mobile` (COMPONENT; 104x104; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Track` (ELLIPSE; 104x104; fill=#ececec; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Center` (ELLIPSE; 84x84; fill=#ffffff; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick0` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick1` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick2` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick3` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick4` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick5` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick6` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick7` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick8` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick9` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick10` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick11` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick12` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick13` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick14` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick15` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick16` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick17` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick18` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick19` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick20` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick21` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick22` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Mobile/gaugeTemperatureSmall/Tick23` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/Temperature/Mobile/Scale` (TEXT; 80x21; fill=#666666; text="0–50°C"; refs={})
- Usage:
  - Find it with figma.findComponent("SC/Gauge/Temperature/Mobile").
  - Instantiate with figma.instantiate("6:178", { parentId, props, overrides }).
- Instantiate:
```js
await figma.instantiate("6:178", {
  parentId: screen.id,
});
```

### SC/Gauge/CO2/Mobile
- Type: COMPONENT (Page 1/00-Foundations/SC/Gauge/CO2/Mobile)
- Figma node ID: `6:179`
- Figma component key: `ceaae67862dfba9299de126961ddc1c47c782ba3`
- Source page: Page 1
- Description: Smart Classroom / VLcCNTT. SC/Gauge/CO2/Mobile. Dùng chung cho wireframe web và app. Inter, nền sáng, thang xám. Override các lớp Label/Value khi có; giữ nguyên ngữ nghĩa chức năng theo huong_dan_wireframe.md.
- Layout: layoutMode=NONE, clipsContent=false
- Text layers:
  - `SC/Gauge/CO2/Mobile/Scale`: "0–2000" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/Gauge/CO2/Mobile` (COMPONENT; 104x104; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Track` (ELLIPSE; 104x104; fill=#ececec; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Center` (ELLIPSE; 84x84; fill=#ffffff; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick0` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick1` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick2` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick3` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick4` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick5` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick6` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick7` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick8` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick9` (ELLIPSE; 5x5; fill=#1f1f1f; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick10` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick11` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick12` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick13` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick14` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick15` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick16` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick17` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick18` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick19` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick20` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick21` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick22` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Mobile/gaugeCO2Small/Tick23` (ELLIPSE; 5x5; fill=#d0d0d0; refs={})
  -   `SC/Gauge/CO2/Mobile/Scale` (TEXT; 80x21; fill=#666666; text="0–2000"; refs={})
- Usage:
  - Find it with figma.findComponent("SC/Gauge/CO2/Mobile").
  - Instantiate with figma.instantiate("6:179", { parentId, props, overrides }).
- Instantiate:
```js
await figma.instantiate("6:179", {
  parentId: screen.id,
});
```

### SC/Navigation/Overview
- Type: COMPONENT (Page 1/00-Foundations/SC/Navigation/Overview)
- Figma node ID: `6:181`
- Figma component key: `a9f4ac54b9aabd75b47b839e00ede8c9d86dd2d8`
- Source page: Page 1
- Description: Smart Classroom / VLcCNTT. SC/Navigation/Overview. Dùng chung cho wireframe web và app. Inter, nền sáng, thang xám. Override các lớp Label/Value khi có; giữ nguyên ngữ nghĩa chức năng theo huong_dan_wireframe.md.
- Layout: layoutMode=NONE, clipsContent=false
- Text layers:
  - `SC/Navigation/Overview/tabsOverview/Tab0`: "Giám sát" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/Navigation/Overview/tabsOverview/Tab1`: "Đèn LED" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/Navigation/Overview/tabsOverview/Tab2`: "Lịch sử" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/Navigation/Overview` (COMPONENT; 390x80; fill=#ffffff; refs={})
  -   `SC/Navigation/Overview/tabsOverview/Top` (RECTANGLE; 390x1; fill=#d0d0d0; refs={})
  -   `SC/Navigation/Overview/tabsOverview/Indicator` (RECTANGLE; 60x3; fill=#1f1f1f; refs={})
  -   `SC/Navigation/Overview/tabsOverview/Icon0` (FRAME; 24x24; refs={})
  -     `SC/Navigation/Overview/tabsOverview/Icon0/tabsOverview/Icon0/A` (RECTANGLE; 4x10; fill=#1f1f1f; refs={})
  -     `SC/Navigation/Overview/tabsOverview/Icon0/tabsOverview/Icon0/B` (RECTANGLE; 4x17; fill=#1f1f1f; refs={})
  -     `SC/Navigation/Overview/tabsOverview/Icon0/tabsOverview/Icon0/C` (RECTANGLE; 4x13; fill=#1f1f1f; refs={})
  -   `SC/Navigation/Overview/tabsOverview/Tab0` (TEXT; 114x21; fill=#1f1f1f; text="Giám sát"; refs={})
  -   `SC/Navigation/Overview/tabsOverview/Icon1` (FRAME; 24x24; refs={})
  -     `SC/Navigation/Overview/tabsOverview/Icon1/tabsOverview/Icon1/Bulb` (ELLIPSE; 14x14; fill=#ffffff; refs={})
  -     `SC/Navigation/Overview/tabsOverview/Icon1/tabsOverview/Icon1/Stem` (RECTANGLE; 6x5; fill=#666666; refs={})
  -     `SC/Navigation/Overview/tabsOverview/Icon1/tabsOverview/Icon1/Base` (RECTANGLE; 8x2; fill=#666666; refs={})
  -   `SC/Navigation/Overview/tabsOverview/Tab1` (TEXT; 114x21; fill=#666666; text="Đèn LED"; refs={})
  -   `SC/Navigation/Overview/tabsOverview/Icon2` (FRAME; 24x24; refs={})
  -     `SC/Navigation/Overview/tabsOverview/Icon2/tabsOverview/Icon2/A` (LINE; 8.49x0.01; refs={})
  -     `SC/Navigation/Overview/tabsOverview/Icon2/tabsOverview/Icon2/B` (LINE; 6.71x0.01; refs={})
  -     `SC/Navigation/Overview/tabsOverview/Icon2/tabsOverview/Icon2/C` (LINE; 12.81x0.01; refs={})
  -     `SC/Navigation/Overview/tabsOverview/Icon2/tabsOverview/Icon2/Axis` (LINE; 22x0.01; refs={})
  -   `SC/Navigation/Overview/tabsOverview/Tab2` (TEXT; 114x21; fill=#666666; text="Lịch sử"; refs={})
  -   `SC/Navigation/Overview/tabsOverview/HomeIndicator` (RECTANGLE; 134x4; fill=#1f1f1f; refs={})
- Usage:
  - Find it with figma.findComponent("SC/Navigation/Overview").
  - Instantiate with figma.instantiate("6:181", { parentId, props, overrides }).
- Observed instances: 1
- Used on pages: Page 1
- Used in screens: Page 1 / 20-App
- Instantiate:
```js
await figma.instantiate("6:181", {
  parentId: screen.id,
});
```

### SC/Navigation/LED
- Type: COMPONENT (Page 1/00-Foundations/SC/Navigation/LED)
- Figma node ID: `6:182`
- Figma component key: `b3187138fd2922640bef432a9f35ca6eb73cd2a8`
- Source page: Page 1
- Description: Smart Classroom / VLcCNTT. SC/Navigation/LED. Dùng chung cho wireframe web và app. Inter, nền sáng, thang xám. Override các lớp Label/Value khi có; giữ nguyên ngữ nghĩa chức năng theo huong_dan_wireframe.md.
- Layout: layoutMode=NONE, clipsContent=false
- Text layers:
  - `SC/Navigation/LED/tabsLED/Tab0`: "Giám sát" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/Navigation/LED/tabsLED/Tab1`: "Đèn LED" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/Navigation/LED/tabsLED/Tab2`: "Lịch sử" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/Navigation/LED` (COMPONENT; 390x80; fill=#ffffff; refs={})
  -   `SC/Navigation/LED/tabsLED/Top` (RECTANGLE; 390x1; fill=#d0d0d0; refs={})
  -   `SC/Navigation/LED/tabsLED/Icon0` (FRAME; 24x24; refs={})
  -     `SC/Navigation/LED/tabsLED/Icon0/tabsLED/Icon0/A` (RECTANGLE; 4x10; fill=#666666; refs={})
  -     `SC/Navigation/LED/tabsLED/Icon0/tabsLED/Icon0/B` (RECTANGLE; 4x17; fill=#666666; refs={})
  -     `SC/Navigation/LED/tabsLED/Icon0/tabsLED/Icon0/C` (RECTANGLE; 4x13; fill=#666666; refs={})
  -   `SC/Navigation/LED/tabsLED/Tab0` (TEXT; 114x21; fill=#666666; text="Giám sát"; refs={})
  -   `SC/Navigation/LED/tabsLED/Indicator` (RECTANGLE; 60x3; fill=#1f1f1f; refs={})
  -   `SC/Navigation/LED/tabsLED/Icon1` (FRAME; 24x24; refs={})
  -     `SC/Navigation/LED/tabsLED/Icon1/tabsLED/Icon1/Bulb` (ELLIPSE; 14x14; fill=#ffffff; refs={})
  -     `SC/Navigation/LED/tabsLED/Icon1/tabsLED/Icon1/Stem` (RECTANGLE; 6x5; fill=#1f1f1f; refs={})
  -     `SC/Navigation/LED/tabsLED/Icon1/tabsLED/Icon1/Base` (RECTANGLE; 8x2; fill=#1f1f1f; refs={})
  -   `SC/Navigation/LED/tabsLED/Tab1` (TEXT; 114x21; fill=#1f1f1f; text="Đèn LED"; refs={})
  -   `SC/Navigation/LED/tabsLED/Icon2` (FRAME; 24x24; refs={})
  -     `SC/Navigation/LED/tabsLED/Icon2/tabsLED/Icon2/A` (LINE; 8.49x0.01; refs={})
  -     `SC/Navigation/LED/tabsLED/Icon2/tabsLED/Icon2/B` (LINE; 6.71x0.01; refs={})
  -     `SC/Navigation/LED/tabsLED/Icon2/tabsLED/Icon2/C` (LINE; 12.81x0.01; refs={})
  -     `SC/Navigation/LED/tabsLED/Icon2/tabsLED/Icon2/Axis` (LINE; 22x0.01; refs={})
  -   `SC/Navigation/LED/tabsLED/Tab2` (TEXT; 114x21; fill=#666666; text="Lịch sử"; refs={})
  -   `SC/Navigation/LED/tabsLED/HomeIndicator` (RECTANGLE; 134x4; fill=#1f1f1f; refs={})
- Usage:
  - Find it with figma.findComponent("SC/Navigation/LED").
  - Instantiate with figma.instantiate("6:182", { parentId, props, overrides }).
- Observed instances: 1
- Used on pages: Page 1
- Used in screens: Page 1 / 20-App
- Instantiate:
```js
await figma.instantiate("6:182", {
  parentId: screen.id,
});
```

### SC/Navigation/History
- Type: COMPONENT (Page 1/00-Foundations/SC/Navigation/History)
- Figma node ID: `6:183`
- Figma component key: `48c0af05539720f094129ce26c09a607cabe1c69`
- Source page: Page 1
- Description: Smart Classroom / VLcCNTT. SC/Navigation/History. Dùng chung cho wireframe web và app. Inter, nền sáng, thang xám. Override các lớp Label/Value khi có; giữ nguyên ngữ nghĩa chức năng theo huong_dan_wireframe.md.
- Layout: layoutMode=NONE, clipsContent=false
- Text layers:
  - `SC/Navigation/History/tabsHistory/Tab0`: "Giám sát" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/Navigation/History/tabsHistory/Tab1`: "Đèn LED" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/Navigation/History/tabsHistory/Tab2`: "Lịch sử" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/Navigation/History` (COMPONENT; 390x80; fill=#ffffff; refs={})
  -   `SC/Navigation/History/tabsHistory/Top` (RECTANGLE; 390x1; fill=#d0d0d0; refs={})
  -   `SC/Navigation/History/tabsHistory/Icon0` (FRAME; 24x24; refs={})
  -     `SC/Navigation/History/tabsHistory/Icon0/tabsHistory/Icon0/A` (RECTANGLE; 4x10; fill=#666666; refs={})
  -     `SC/Navigation/History/tabsHistory/Icon0/tabsHistory/Icon0/B` (RECTANGLE; 4x17; fill=#666666; refs={})
  -     `SC/Navigation/History/tabsHistory/Icon0/tabsHistory/Icon0/C` (RECTANGLE; 4x13; fill=#666666; refs={})
  -   `SC/Navigation/History/tabsHistory/Tab0` (TEXT; 114x21; fill=#666666; text="Giám sát"; refs={})
  -   `SC/Navigation/History/tabsHistory/Icon1` (FRAME; 24x24; refs={})
  -     `SC/Navigation/History/tabsHistory/Icon1/tabsHistory/Icon1/Bulb` (ELLIPSE; 14x14; fill=#ffffff; refs={})
  -     `SC/Navigation/History/tabsHistory/Icon1/tabsHistory/Icon1/Stem` (RECTANGLE; 6x5; fill=#666666; refs={})
  -     `SC/Navigation/History/tabsHistory/Icon1/tabsHistory/Icon1/Base` (RECTANGLE; 8x2; fill=#666666; refs={})
  -   `SC/Navigation/History/tabsHistory/Tab1` (TEXT; 114x21; fill=#666666; text="Đèn LED"; refs={})
  -   `SC/Navigation/History/tabsHistory/Indicator` (RECTANGLE; 60x3; fill=#1f1f1f; refs={})
  -   `SC/Navigation/History/tabsHistory/Icon2` (FRAME; 24x24; refs={})
  -     `SC/Navigation/History/tabsHistory/Icon2/tabsHistory/Icon2/A` (LINE; 8.49x0.01; refs={})
  -     `SC/Navigation/History/tabsHistory/Icon2/tabsHistory/Icon2/B` (LINE; 6.71x0.01; refs={})
  -     `SC/Navigation/History/tabsHistory/Icon2/tabsHistory/Icon2/C` (LINE; 12.81x0.01; refs={})
  -     `SC/Navigation/History/tabsHistory/Icon2/tabsHistory/Icon2/Axis` (LINE; 22x0.01; refs={})
  -   `SC/Navigation/History/tabsHistory/Tab2` (TEXT; 114x21; fill=#1f1f1f; text="Lịch sử"; refs={})
  -   `SC/Navigation/History/tabsHistory/HomeIndicator` (RECTANGLE; 134x4; fill=#1f1f1f; refs={})
- Usage:
  - Find it with figma.findComponent("SC/Navigation/History").
  - Instantiate with figma.instantiate("6:183", { parentId, props, overrides }).
- Observed instances: 1
- Used on pages: Page 1
- Used in screens: Page 1 / 20-App
- Instantiate:
```js
await figma.instantiate("6:183", {
  parentId: screen.id,
});
```

### SC/V2/Button/Primary
- Type: COMPONENT (Page 1/00-Foundations/V2/Foundations/SC/V2/Button/Primary)
- Figma node ID: `20:3587`
- Figma component key: `942748544d09c667bb4c2e852b73427b53fc5fa9`
- Source page: Page 1
- Layout: layoutMode=HORIZONTAL, itemSpacing=0, padding={"left":12,"right":12,"top":12,"bottom":12}, primaryAxisSizingMode=FIXED, counterAxisSizingMode=FIXED, primaryAxisAlignItems=CENTER, counterAxisAlignItems=CENTER, clipsContent=false
- Shape: cornerRadius=12, topLeftRadius=12, topRightRadius=12, bottomRightRadius=12, bottomLeftRadius=12
- Text layers:
  - `SC/V2/Button/Primary/Label`: "Xem chi tiết  →" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/V2/Button/Primary` (COMPONENT; 320x48; layout=HORIZONTAL; fill=#1f1f1f; refs={})
  -   `SC/V2/Button/Primary/Label` (TEXT; 115x19; fill=#ffffff; text="Xem chi tiết  →"; refs={})
- Usage:
  - Find it with figma.findComponent("SC/V2/Button/Primary").
  - Instantiate with figma.instantiate("20:3587", { parentId, props, overrides }).
- Observed instances: 11
- Used on pages: Page 1
- Used in screens: Page 1 / 10-Web, Page 1 / 20-App, Page 1 / 30-WiFi, Page 1 / 50-Report
- Instantiate:
```js
await figma.instantiate("20:3587", {
  parentId: screen.id,
});
```

### SC/V2/Button/Secondary
- Type: COMPONENT (Page 1/00-Foundations/V2/Foundations/SC/V2/Button/Secondary)
- Figma node ID: `20:3588`
- Figma component key: `569b029884a5028991bacf307227c8b77205c231`
- Source page: Page 1
- Layout: layoutMode=HORIZONTAL, itemSpacing=0, padding={"left":12,"right":12,"top":12,"bottom":12}, primaryAxisSizingMode=FIXED, counterAxisSizingMode=FIXED, primaryAxisAlignItems=CENTER, counterAxisAlignItems=CENTER, clipsContent=false
- Shape: cornerRadius=12, topLeftRadius=12, topRightRadius=12, bottomRightRadius=12, bottomLeftRadius=12
- Text layers:
  - `SC/V2/Button/Secondary/Label`: "Thao tác phụ" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/V2/Button/Secondary` (COMPONENT; 320x48; layout=HORIZONTAL; fill=#ffffff; refs={})
  -   `SC/V2/Button/Secondary/Label` (TEXT; 102x19; fill=#1f1f1f; text="Thao tác phụ"; refs={})
- Usage:
  - Find it with figma.findComponent("SC/V2/Button/Secondary").
  - Instantiate with figma.instantiate("20:3588", { parentId, props, overrides }).
- Observed instances: 14
- Used on pages: Page 1
- Used in screens: Page 1 / 10-Web, Page 1 / 20-App, Page 1 / 30-WiFi, Page 1 / 50-Report
- Instantiate:
```js
await figma.instantiate("20:3588", {
  parentId: screen.id,
});
```

### SC/V2/Button/Soft
- Type: COMPONENT (Page 1/00-Foundations/V2/Foundations/SC/V2/Button/Soft)
- Figma node ID: `20:3589`
- Figma component key: `7d3bf80bc51dbcc7d766832e52676cb81294dfc3`
- Source page: Page 1
- Layout: layoutMode=HORIZONTAL, itemSpacing=0, padding={"left":12,"right":12,"top":12,"bottom":12}, primaryAxisSizingMode=FIXED, counterAxisSizingMode=FIXED, primaryAxisAlignItems=CENTER, counterAxisAlignItems=CENTER, clipsContent=false
- Shape: cornerRadius=12, topLeftRadius=12, topRightRadius=12, bottomRightRadius=12, bottomLeftRadius=12
- Text layers:
  - `SC/V2/Button/Soft/Label`: "Bộ lọc" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/V2/Button/Soft` (COMPONENT; 320x48; layout=HORIZONTAL; fill=#ececec; refs={})
  -   `SC/V2/Button/Soft/Label` (TEXT; 48x19; fill=#666666; text="Bộ lọc"; refs={})
- Usage:
  - Find it with figma.findComponent("SC/V2/Button/Soft").
  - Instantiate with figma.instantiate("20:3589", { parentId, props, overrides }).
- Observed instances: 6
- Used on pages: Page 1
- Used in screens: Page 1 / 20-App, Page 1 / 50-Report
- Instantiate:
```js
await figma.instantiate("20:3589", {
  parentId: screen.id,
});
```

### SC/V2/Button/Disabled
- Type: COMPONENT (Page 1/00-Foundations/V2/Foundations/SC/V2/Button/Disabled)
- Figma node ID: `20:3590`
- Figma component key: `2e15b3046ba7110d04d623fb5f58407e38f6451a`
- Source page: Page 1
- Layout: layoutMode=HORIZONTAL, itemSpacing=0, padding={"left":12,"right":12,"top":12,"bottom":12}, primaryAxisSizingMode=FIXED, counterAxisSizingMode=FIXED, primaryAxisAlignItems=CENTER, counterAxisAlignItems=CENTER, clipsContent=false
- Shape: cornerRadius=12, topLeftRadius=12, topRightRadius=12, bottomRightRadius=12, bottomLeftRadius=12
- Text layers:
  - `SC/V2/Button/Disabled/Label`: "Chưa có thay đổi" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/V2/Button/Disabled` (COMPONENT; 320x48; layout=HORIZONTAL; fill=#ececec; refs={})
  -   `SC/V2/Button/Disabled/Label` (TEXT; 131x19; fill=#666666; text="Chưa có thay đổi"; refs={})
- Usage:
  - Find it with figma.findComponent("SC/V2/Button/Disabled").
  - Instantiate with figma.instantiate("20:3590", { parentId, props, overrides }).
- Instantiate:
```js
await figma.instantiate("20:3590", {
  parentId: screen.id,
});
```

### SC/V2/Field/Text
- Type: COMPONENT (Page 1/00-Foundations/V2/Foundations/SC/V2/Field/Text)
- Figma node ID: `20:3591`
- Figma component key: `2de562d48842b237cd1d459a6b99496c12012771`
- Source page: Page 1
- Layout: layoutMode=VERTICAL, itemSpacing=8, padding={"left":0,"right":0,"top":0,"bottom":0}, primaryAxisSizingMode=AUTO, counterAxisSizingMode=FIXED, primaryAxisAlignItems=MIN, counterAxisAlignItems=MIN, clipsContent=false
- Text layers:
  - `SC/V2/Field/Text/Label`: "Tài khoản" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Field/Text/u2FieldText/Box/Value`: "Nhập tên tài khoản" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/V2/Field/Text` (COMPONENT; 342x77; layout=VERTICAL; refs={})
  -   `SC/V2/Field/Text/Label` (TEXT; 342x21; fill=#1f1f1f; text="Tài khoản"; refs={})
  -   `SC/V2/Field/Text/u2FieldText/Box` (FRAME; 342x48; layout=HORIZONTAL; fill=#ffffff; refs={})
  -     `SC/V2/Field/Text/u2FieldText/Box/Value` (TEXT; 312x24; fill=#666666; text="Nhập tên tài khoản"; refs={})
- Usage:
  - Find it with figma.findComponent("SC/V2/Field/Text").
  - Instantiate with figma.instantiate("20:3591", { parentId, props, overrides }).
- Observed instances: 2
- Used on pages: Page 1
- Used in screens: Page 1 / 10-Web, Page 1 / 20-App
- Instantiate:
```js
await figma.instantiate("20:3591", {
  parentId: screen.id,
});
```

### SC/V2/Field/Password
- Type: COMPONENT (Page 1/00-Foundations/V2/Foundations/SC/V2/Field/Password)
- Figma node ID: `20:3592`
- Figma component key: `f3e58b8705bc4a03989d02e2abd3617b23b9f126`
- Source page: Page 1
- Layout: layoutMode=VERTICAL, itemSpacing=8, padding={"left":0,"right":0,"top":0,"bottom":0}, primaryAxisSizingMode=AUTO, counterAxisSizingMode=FIXED, primaryAxisAlignItems=MIN, counterAxisAlignItems=MIN, clipsContent=false
- Text layers:
  - `SC/V2/Field/Password/Label`: "Mật khẩu" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Field/Password/u2FieldPassword/Box/Value`: "••••••••" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Field/Password/u2FieldPassword/Box/u2FieldPassword/Trailing`: "Hiện" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/V2/Field/Password` (COMPONENT; 342x77; layout=VERTICAL; refs={})
  -   `SC/V2/Field/Password/Label` (TEXT; 342x21; fill=#1f1f1f; text="Mật khẩu"; refs={})
  -   `SC/V2/Field/Password/u2FieldPassword/Box` (FRAME; 342x48; layout=HORIZONTAL; fill=#ffffff; refs={})
  -     `SC/V2/Field/Password/u2FieldPassword/Box/Value` (TEXT; 266x24; fill=#1f1f1f; text="••••••••"; refs={})
  -     `SC/V2/Field/Password/u2FieldPassword/Box/u2FieldPassword/Trailing` (TEXT; 38x20; fill=#666666; text="Hiện"; refs={})
- Usage:
  - Find it with figma.findComponent("SC/V2/Field/Password").
  - Instantiate with figma.instantiate("20:3592", { parentId, props, overrides }).
- Observed instances: 2
- Used on pages: Page 1
- Used in screens: Page 1 / 30-WiFi, Page 1 / 50-Report
- Instantiate:
```js
await figma.instantiate("20:3592", {
  parentId: screen.id,
});
```

### SC/V2/Field/Select
- Type: COMPONENT (Page 1/00-Foundations/V2/Foundations/SC/V2/Field/Select)
- Figma node ID: `20:3593`
- Figma component key: `7dc8f6c4fb347f8bb1d8fdab4d40af3435b28568`
- Source page: Page 1
- Layout: layoutMode=VERTICAL, itemSpacing=8, padding={"left":0,"right":0,"top":0,"bottom":0}, primaryAxisSizingMode=AUTO, counterAxisSizingMode=FIXED, primaryAxisAlignItems=MIN, counterAxisAlignItems=MIN, clipsContent=false
- Text layers:
  - `SC/V2/Field/Select/Label`: "Chỉ số" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Field/Select/u2FieldSelect/Box/Value`: "Độ ẩm" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Field/Select/u2FieldSelect/Box/u2FieldSelect/Trailing`: "⌄" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/V2/Field/Select` (COMPONENT; 342x77; layout=VERTICAL; refs={})
  -   `SC/V2/Field/Select/Label` (TEXT; 342x21; fill=#1f1f1f; text="Chỉ số"; refs={})
  -   `SC/V2/Field/Select/u2FieldSelect/Box` (FRAME; 342x48; layout=HORIZONTAL; fill=#ffffff; refs={})
  -     `SC/V2/Field/Select/u2FieldSelect/Box/Value` (TEXT; 284x24; fill=#1f1f1f; text="Độ ẩm"; refs={})
  -     `SC/V2/Field/Select/u2FieldSelect/Box/u2FieldSelect/Trailing` (TEXT; 20x20; fill=#666666; text="⌄"; refs={})
- Usage:
  - Find it with figma.findComponent("SC/V2/Field/Select").
  - Instantiate with figma.instantiate("20:3593", { parentId, props, overrides }).
- Observed instances: 6
- Used on pages: Page 1
- Used in screens: Page 1 / 10-Web, Page 1 / 20-App, Page 1 / 30-WiFi, Page 1 / 50-Report
- Instantiate:
```js
await figma.instantiate("20:3593", {
  parentId: screen.id,
});
```

### SC/V2/Navigation/Overview
- Type: COMPONENT (Page 1/00-Foundations/V2/Foundations/SC/V2/Navigation/Overview)
- Figma node ID: `20:3594`
- Figma component key: `8de4507a5f2299556a1e43b9270f21f219c09005`
- Source page: Page 1
- Layout: layoutMode=NONE, clipsContent=false
- Text layers:
  - `SC/V2/Navigation/Overview/u2NavOverview/Label0`: "Giám sát" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Navigation/Overview/u2NavOverview/Label1`: "Đèn LED" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Navigation/Overview/u2NavOverview/Label2`: "Lịch sử" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/V2/Navigation/Overview` (COMPONENT; 390x80; fill=#ffffff; refs={})
  -   `SC/V2/Navigation/Overview/u2NavOverview/Top` (RECTANGLE; 390x1; fill=#d0d0d0; refs={})
  -   `SC/V2/Navigation/Overview/u2NavOverview/Selected` (RECTANGLE; 106x56; fill=#1f1f1f; refs={})
  -   `SC/V2/Navigation/Overview/u2NavOverview/Icon0` (FRAME; 24x24; refs={})
  -     `SC/V2/Navigation/Overview/u2NavOverview/Icon0/u2NavOverview/Icon0/A` (RECTANGLE; 8x8; fill=#ffffff; refs={})
  -     `SC/V2/Navigation/Overview/u2NavOverview/Icon0/u2NavOverview/Icon0/B` (RECTANGLE; 8x8; fill=#ffffff; refs={})
  -     `SC/V2/Navigation/Overview/u2NavOverview/Icon0/u2NavOverview/Icon0/C` (RECTANGLE; 8x8; fill=#ffffff; refs={})
  -     `SC/V2/Navigation/Overview/u2NavOverview/Icon0/u2NavOverview/Icon0/D` (RECTANGLE; 8x8; fill=#ffffff; refs={})
  -   `SC/V2/Navigation/Overview/u2NavOverview/Label0` (TEXT; 114x21; fill=#ffffff; text="Giám sát"; refs={})
  -   `SC/V2/Navigation/Overview/u2NavOverview/Icon1` (FRAME; 24x24; refs={})
  -     `SC/V2/Navigation/Overview/u2NavOverview/Icon1/u2NavOverview/Icon1/Bulb` (ELLIPSE; 14x14; fill=#ffffff; refs={})
  -     `SC/V2/Navigation/Overview/u2NavOverview/Icon1/u2NavOverview/Icon1/Stem` (RECTANGLE; 6x5; fill=#666666; refs={})
  -     `SC/V2/Navigation/Overview/u2NavOverview/Icon1/u2NavOverview/Icon1/Base` (RECTANGLE; 8x2; fill=#666666; refs={})
  -   `SC/V2/Navigation/Overview/u2NavOverview/Label1` (TEXT; 114x21; fill=#666666; text="Đèn LED"; refs={})
  -   `SC/V2/Navigation/Overview/u2NavOverview/Icon2` (FRAME; 24x24; refs={})
  -     `SC/V2/Navigation/Overview/u2NavOverview/Icon2/u2NavOverview/Icon2/A` (LINE; 8.49x0.01; refs={})
  -     `SC/V2/Navigation/Overview/u2NavOverview/Icon2/u2NavOverview/Icon2/B` (LINE; 6.71x0.01; refs={})
  -     `SC/V2/Navigation/Overview/u2NavOverview/Icon2/u2NavOverview/Icon2/C` (LINE; 12.81x0.01; refs={})
  -     `SC/V2/Navigation/Overview/u2NavOverview/Icon2/u2NavOverview/Icon2/Axis` (LINE; 22x0.01; refs={})
  -   `SC/V2/Navigation/Overview/u2NavOverview/Label2` (TEXT; 114x21; fill=#666666; text="Lịch sử"; refs={})
  -   `SC/V2/Navigation/Overview/u2NavOverview/Home` (RECTANGLE; 134x4; fill=#1f1f1f; refs={})
- Usage:
  - Find it with figma.findComponent("SC/V2/Navigation/Overview").
  - Instantiate with figma.instantiate("20:3594", { parentId, props, overrides }).
- Instantiate:
```js
await figma.instantiate("20:3594", {
  parentId: screen.id,
});
```

### SC/V2/Navigation/LED
- Type: COMPONENT (Page 1/00-Foundations/V2/Foundations/SC/V2/Navigation/LED)
- Figma node ID: `20:3595`
- Figma component key: `fbd74d20ae492f036e24a42da2520c7eb2a445d1`
- Source page: Page 1
- Layout: layoutMode=NONE, clipsContent=false
- Text layers:
  - `SC/V2/Navigation/LED/u2NavLED/Label0`: "Giám sát" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Navigation/LED/u2NavLED/Label1`: "Đèn LED" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Navigation/LED/u2NavLED/Label2`: "Lịch sử" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/V2/Navigation/LED` (COMPONENT; 390x80; fill=#ffffff; refs={})
  -   `SC/V2/Navigation/LED/u2NavLED/Top` (RECTANGLE; 390x1; fill=#d0d0d0; refs={})
  -   `SC/V2/Navigation/LED/u2NavLED/Icon0` (FRAME; 24x24; refs={})
  -     `SC/V2/Navigation/LED/u2NavLED/Icon0/u2NavLED/Icon0/A` (RECTANGLE; 8x8; fill=#666666; refs={})
  -     `SC/V2/Navigation/LED/u2NavLED/Icon0/u2NavLED/Icon0/B` (RECTANGLE; 8x8; fill=#666666; refs={})
  -     `SC/V2/Navigation/LED/u2NavLED/Icon0/u2NavLED/Icon0/C` (RECTANGLE; 8x8; fill=#666666; refs={})
  -     `SC/V2/Navigation/LED/u2NavLED/Icon0/u2NavLED/Icon0/D` (RECTANGLE; 8x8; fill=#666666; refs={})
  -   `SC/V2/Navigation/LED/u2NavLED/Label0` (TEXT; 114x21; fill=#666666; text="Giám sát"; refs={})
  -   `SC/V2/Navigation/LED/u2NavLED/Selected` (RECTANGLE; 106x56; fill=#1f1f1f; refs={})
  -   `SC/V2/Navigation/LED/u2NavLED/Icon1` (FRAME; 24x24; refs={})
  -     `SC/V2/Navigation/LED/u2NavLED/Icon1/u2NavLED/Icon1/Bulb` (ELLIPSE; 14x14; fill=#ffffff; refs={})
  -     `SC/V2/Navigation/LED/u2NavLED/Icon1/u2NavLED/Icon1/Stem` (RECTANGLE; 6x5; fill=#ffffff; refs={})
  -     `SC/V2/Navigation/LED/u2NavLED/Icon1/u2NavLED/Icon1/Base` (RECTANGLE; 8x2; fill=#ffffff; refs={})
  -   `SC/V2/Navigation/LED/u2NavLED/Label1` (TEXT; 114x21; fill=#ffffff; text="Đèn LED"; refs={})
  -   `SC/V2/Navigation/LED/u2NavLED/Icon2` (FRAME; 24x24; refs={})
  -     `SC/V2/Navigation/LED/u2NavLED/Icon2/u2NavLED/Icon2/A` (LINE; 8.49x0.01; refs={})
  -     `SC/V2/Navigation/LED/u2NavLED/Icon2/u2NavLED/Icon2/B` (LINE; 6.71x0.01; refs={})
  -     `SC/V2/Navigation/LED/u2NavLED/Icon2/u2NavLED/Icon2/C` (LINE; 12.81x0.01; refs={})
  -     `SC/V2/Navigation/LED/u2NavLED/Icon2/u2NavLED/Icon2/Axis` (LINE; 22x0.01; refs={})
  -   `SC/V2/Navigation/LED/u2NavLED/Label2` (TEXT; 114x21; fill=#666666; text="Lịch sử"; refs={})
  -   `SC/V2/Navigation/LED/u2NavLED/Home` (RECTANGLE; 134x4; fill=#1f1f1f; refs={})
- Usage:
  - Find it with figma.findComponent("SC/V2/Navigation/LED").
  - Instantiate with figma.instantiate("20:3595", { parentId, props, overrides }).
- Instantiate:
```js
await figma.instantiate("20:3595", {
  parentId: screen.id,
});
```

### SC/V2/Navigation/History
- Type: COMPONENT (Page 1/00-Foundations/V2/Foundations/SC/V2/Navigation/History)
- Figma node ID: `20:3596`
- Figma component key: `55e719f9942a8298669d064902fdcaecab4c93a1`
- Source page: Page 1
- Layout: layoutMode=NONE, clipsContent=false
- Text layers:
  - `SC/V2/Navigation/History/u2NavHistory/Label0`: "Giám sát" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Navigation/History/u2NavHistory/Label1`: "Đèn LED" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Navigation/History/u2NavHistory/Label2`: "Lịch sử" constraints={"horizontal":"MIN","vertical":"MIN"}
- Anatomy:
  - `SC/V2/Navigation/History` (COMPONENT; 390x80; fill=#ffffff; refs={})
  -   `SC/V2/Navigation/History/u2NavHistory/Top` (RECTANGLE; 390x1; fill=#d0d0d0; refs={})
  -   `SC/V2/Navigation/History/u2NavHistory/Icon0` (FRAME; 24x24; refs={})
  -     `SC/V2/Navigation/History/u2NavHistory/Icon0/u2NavHistory/Icon0/A` (RECTANGLE; 8x8; fill=#666666; refs={})
  -     `SC/V2/Navigation/History/u2NavHistory/Icon0/u2NavHistory/Icon0/B` (RECTANGLE; 8x8; fill=#666666; refs={})
  -     `SC/V2/Navigation/History/u2NavHistory/Icon0/u2NavHistory/Icon0/C` (RECTANGLE; 8x8; fill=#666666; refs={})
  -     `SC/V2/Navigation/History/u2NavHistory/Icon0/u2NavHistory/Icon0/D` (RECTANGLE; 8x8; fill=#666666; refs={})
  -   `SC/V2/Navigation/History/u2NavHistory/Label0` (TEXT; 114x21; fill=#666666; text="Giám sát"; refs={})
  -   `SC/V2/Navigation/History/u2NavHistory/Icon1` (FRAME; 24x24; refs={})
  -     `SC/V2/Navigation/History/u2NavHistory/Icon1/u2NavHistory/Icon1/Bulb` (ELLIPSE; 14x14; fill=#ffffff; refs={})
  -     `SC/V2/Navigation/History/u2NavHistory/Icon1/u2NavHistory/Icon1/Stem` (RECTANGLE; 6x5; fill=#666666; refs={})
  -     `SC/V2/Navigation/History/u2NavHistory/Icon1/u2NavHistory/Icon1/Base` (RECTANGLE; 8x2; fill=#666666; refs={})
  -   `SC/V2/Navigation/History/u2NavHistory/Label1` (TEXT; 114x21; fill=#666666; text="Đèn LED"; refs={})
  -   `SC/V2/Navigation/History/u2NavHistory/Selected` (RECTANGLE; 106x56; fill=#1f1f1f; refs={})
  -   `SC/V2/Navigation/History/u2NavHistory/Icon2` (FRAME; 24x24; refs={})
  -     `SC/V2/Navigation/History/u2NavHistory/Icon2/u2NavHistory/Icon2/A` (LINE; 8.49x0.01; refs={})
  -     `SC/V2/Navigation/History/u2NavHistory/Icon2/u2NavHistory/Icon2/B` (LINE; 6.71x0.01; refs={})
  -     `SC/V2/Navigation/History/u2NavHistory/Icon2/u2NavHistory/Icon2/C` (LINE; 12.81x0.01; refs={})
  -     `SC/V2/Navigation/History/u2NavHistory/Icon2/u2NavHistory/Icon2/Axis` (LINE; 22x0.01; refs={})
  -   `SC/V2/Navigation/History/u2NavHistory/Label2` (TEXT; 114x21; fill=#ffffff; text="Lịch sử"; refs={})
  -   `SC/V2/Navigation/History/u2NavHistory/Home` (RECTANGLE; 134x4; fill=#1f1f1f; refs={})
- Usage:
  - Find it with figma.findComponent("SC/V2/Navigation/History").
  - Instantiate with figma.instantiate("20:3596", { parentId, props, overrides }).
- Instantiate:
```js
await figma.instantiate("20:3596", {
  parentId: screen.id,
});
```

## External & Library Components
_No remote-library component instances were identified in the inspected instance range._

## Screen Evidence
### Page 1 / 00-Foundations
- Figma node ID: `6:154`
- Direct evidence: FRAME, 5440×1160, layout=NONE, 48 direct child(ren), 0 component instance(s).
- Top-level composition: F/Eyebrow (TEXT) → F/Title (TEXT) → F/Subtitle (TEXT) → F/Count1 (FRAME) → F/Count2 (FRAME) → F/Count3 (FRAME) → F/Controls (TEXT) → F/Gauges (TEXT) → F/Navigation (TEXT) → SC/Button/Primary (COMPONENT) → SC/Button/Secondary (COMPONENT) → SC/Button/Disabled (COMPONENT) → F/ButtonNote (TEXT) → SC/Field/Text (COMPONENT) → SC/Field/Password (COMPONENT) → SC/Field/Select (COMPONENT) → SC/Gauge/Humidity/Desktop (COMPONENT) → SC/Gauge/Temperature/Desktop (COMPONENT) → SC/Gauge/CO2/Desktop (COMPONENT) → F/GaugeH (TEXT)

### Page 1 / 10-Web
- Figma node ID: `6:444`
- Direct evidence: FRAME, 5440×2750, layout=NONE, 9 direct child(ren), 23 component instance(s).
- Components observed: SC/Field/Text, SC/Field/Password, SC/Button/Primary, SC/Button/Secondary, SC/V2/Button/Secondary, SC/V2/Button/Primary, SC/V2/Field/Select, SC/Field/Select, SC/V2/Field/Text, SC/Button/Disabled
- Top-level composition: WEB/Index (TEXT) → WEB/Title (TEXT) → WEB/Subtitle (TEXT) → WEB/W01 (FRAME) → WEB/W02 (FRAME) → WEB/W03 (FRAME) → WEB/W04 (FRAME) → WEB/W05 (FRAME) → WEB/W06 (FRAME)

### Page 1 / 20-App
- Figma node ID: `6:772`
- Direct evidence: FRAME, 3620×2350, layout=NONE, 12 direct child(ren), 31 component instance(s).
- Components observed: SC/Field/Text, SC/Field/Password, SC/Button/Primary, SC/V2/Button/Soft, SC/V2/Button/Secondary, SC/Navigation/Overview, SC/V2/Button/Primary, SC/Navigation/LED, SC/V2/Field/Select, SC/Field/Select, SC/Navigation/History, SC/V2/Field/Text, SC/Button/Disabled
- Top-level composition: APP/Index (TEXT) → APP/Title (TEXT) → APP/Subtitle (TEXT) → APP/M01 (FRAME) → APP/M02 (FRAME) → APP/M03 (FRAME) → APP/M04 (FRAME) → APP/M05 (FRAME) → APP/M06 (FRAME) → APP/M07 (FRAME) → APP/M08 (FRAME) → APP/M09 (FRAME)

### Page 1 / 30-WiFi
- Figma node ID: `6:1227`
- Direct evidence: FRAME, 1630×1270, layout=NONE, 5 direct child(ren), 8 component instance(s).
- Components observed: SC/V2/Field/Select, SC/V2/Button/Secondary, SC/V2/Field/Password, SC/V2/Button/Primary, SC/Field/Select, SC/Button/Secondary, SC/Field/Password, SC/Button/Primary
- Top-level composition: WIFI/Index (TEXT) → WIFI/Title (TEXT) → WIFI/Subtitle (TEXT) → WIFI/P01 (FRAME) → WIFI/P02 (FRAME)

### Page 1 / 40-States-Flows
- Figma node ID: `7:1306`
- Direct evidence: FRAME, 3440×5560, layout=NONE, 10 direct child(ren), 40 component instance(s).
- Components observed: SC/Field/Text, SC/Field/Password, SC/Button/Primary, SC/Button/Secondary, SC/Button/Disabled, SC/Field/Select
- Top-level composition: STATES/Index (TEXT) → STATES/Title (TEXT) → STATES/Subtitle (TEXT) → ST01-Auth (FRAME) → ST02-Telemetry (FRAME) → ST03-LED (FRAME) → ST04-History (FRAME) → ST05-WiFi (FRAME) → ST06-Session (FRAME) → 40-Flowmap (FRAME)

### Page 1 / 50-Report
- Figma node ID: `8:1880`
- Direct evidence: FRAME, 4320×2880, layout=NONE, 11 direct child(ren), 9 component instance(s).
- Components observed: SC/V2/Button/Soft, SC/V2/Button/Secondary, SC/V2/Button/Primary, SC/V2/Field/Select, SC/V2/Field/Password
- Top-level composition: REPORT/Index (TEXT) → REPORT/Title (TEXT) → REPORT/Subtitle (TEXT) → R01-WebAuth (FRAME) → R02-WebMonitorLED (FRAME) → R03-WebAnalytics (FRAME) → R04-AppAuth (FRAME) → R05-AppOverview (FRAME) → R06-AppLED (FRAME) → R07-AppDailyAnalytics (FRAME) → R08-WiFi (FRAME)

### Page 2 / 00-CANVAS-HEADER
- Figma node ID: `12:2546`
- Direct evidence: FRAME, 1880×280, layout=HORIZONTAL, 2 direct child(ren), 0 component instance(s).
- Top-level composition: TitleGroup (FRAME) → SpecsGroup (FRAME)

### Page 2 / W01-Login
- Figma node ID: `13:2626`
- Direct evidence: FRAME, 1440×1024, layout=NONE, 2 direct child(ren), 0 component instance(s).
- Top-level composition: TopNav (FRAME) → MainContent (FRAME)

### Page 2 / W02-Register
- Figma node ID: `13:2687`
- Direct evidence: FRAME, 1440×1024, layout=NONE, 2 direct child(ren), 0 component instance(s).
- Top-level composition: TopNav (FRAME) → MainContent (FRAME)

### Page 2 / W03-Dashboard
- Figma node ID: `13:2908`
- Direct evidence: FRAME, 1440×1060, layout=NONE, 2 direct child(ren), 0 component instance(s).
- Top-level composition: TopNav (FRAME) → DashboardContent (FRAME)

### Page 2 / M01-Login
- Figma node ID: `13:3104`
- Direct evidence: FRAME, 390×844, layout=NONE, 3 direct child(ren), 0 component instance(s).
- Top-level composition: StatusBar/iOS (FRAME) → Content (FRAME) → HomeIndicatorArea (FRAME)

### Page 2 / M02-Register
- Figma node ID: `13:3137`
- Direct evidence: FRAME, 390×844, layout=NONE, 3 direct child(ren), 0 component instance(s).
- Top-level composition: StatusBar/iOS (FRAME) → Content (FRAME) → HomeIndicatorArea (FRAME)

### Page 2 / M03-Overview
- Figma node ID: `13:3172`
- Direct evidence: FRAME, 390×844, layout=NONE, 4 direct child(ren), 0 component instance(s).
- Top-level composition: StatusBar/iOS (FRAME) → TopBar (FRAME) → Content (FRAME) → BottomTabBar (FRAME)

### Page 2 / M04-LED
- Figma node ID: `13:3252`
- Direct evidence: FRAME, 390×844, layout=NONE, 4 direct child(ren), 0 component instance(s).
- Top-level composition: StatusBar/iOS (FRAME) → TopBar (FRAME) → Content (FRAME) → BottomTabBar (FRAME)

### Page 2 / M05-History
- Figma node ID: `13:3308`
- Direct evidence: FRAME, 390×844, layout=NONE, 4 direct child(ren), 0 component instance(s).
- Top-level composition: StatusBar/iOS (FRAME) → TopBar (FRAME) → Content (FRAME) → BottomTabBar (FRAME)

### Page 2 / P01-WiFiPortal
- Figma node ID: `13:3384`
- Direct evidence: FRAME, 390×844, layout=NONE, 5 direct child(ren), 0 component instance(s).
- Top-level composition: StatusBar/iOS (FRAME) → BrowserBar (FRAME) → Content (FRAME) → HomeBar (FRAME) → Indicator (FRAME)

### Page 2 / 40-Flowmap
- Figma node ID: `13:3423`
- Direct evidence: FRAME, 2600×380, layout=VERTICAL, 2 direct child(ren), 0 component instance(s).
- Top-level composition: Header (FRAME) → FlowCardsRow (FRAME)

### Page 2 / 50-UIStates
- Figma node ID: `13:3478`
- Direct evidence: FRAME, 2600×480, layout=VERTICAL, 2 direct child(ren), 0 component instance(s).
- Top-level composition: Header (FRAME) → StatesRow (FRAME)

## Do's and Don'ts
### Do
- Do use the extracted component names and property keys exactly as written.
- Do bind or reference color variables instead of hardcoding equivalent hex values.
- Do run `layout_audit` after non-trivial edits and fix overflow/clipping structurally.

### Don't
- Don't create look-alike components when an equivalent component is listed above.
- Don't infer brand semantics from token names alone; confirm with actual screens or screenshots.
- Don't use hidden/truncated text layers as stable selectors unless component properties expose the same control.
- Don't treat this document as exhaustive when Known Gaps lists missing pages, screenshots or anatomy.

## Responsive Evidence
- Some component children expose Figma constraints. Preserve those resize rules when recreating components.
- Frame widths are observations, not breakpoints. Only document a responsive transformation when matching screens or explicit constraints support it.

## Iteration Guide
1. Start from the Figma IDs/keys in this document, then confirm the chosen binding with `get_component` before a large write.
2. Use exact component property keys from this file in `figma.instantiate(..., { props })`; use a variant ID when the desired set variant is explicit.
3. Use layer overrides only when a desired change has no component property.
4. For code implementation, map Figma variables/styles to design tokens first, then compose components.
5. After generating or editing UI, run `layout_audit`; after major visual changes, take a screenshot for human review.

## Known Gaps
- No local text styles were found, so typography roles may need manual extraction from selected frames.
- No component property definitions were found; component customization may rely on layer overrides.

## Notes
- Generated from local Figma styles, variables and components plus bounded screen/instance evidence.
- Component property names are the exact API keys to pass to instance.setProperties.
- Observed frequency patterns are evidence, not automatically approved semantic tokens.

