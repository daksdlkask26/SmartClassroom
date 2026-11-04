# Thiết kế hiện hành — Smart Classroom

Cập nhật 04/11/2026: trắng–đen phẳng, không gradient trang trí. Desktop dùng masthead và bốn liên kết điều hướng ngang đánh số, gạch chân mục hiện hành. Nội dung căn giữa; Manrope + Be Vietnam Pro được giữ. UI workspace 1440 × 1080, auth 1440 × 1024. Gauge độ ẩm và slider LED được giữ. Màu thật chỉ dành cho LED/bộ chọn màu và trạng thái cần chú ý.

Xem [đặc tả và cơ sở chọn bố cục](../huong_dan_wireframe_v3.md), [chỉ mục](../wireframe_v3_manifest.md). Inventory có giới hạn độ sâu; component master/tokens tham chiếu cũ được giữ vì liên kết đang dùng, không đại diện cho style override của UI hiện hành. Page 2 không chỉnh sửa.

# VLcCNTT Design System

Extraction scope: Entire document
Current page when extracted: Page 1
Pages discovered: Page 1, Page 2

## Overview
VLcCNTT exposes 0 component set(s), 25 standalone component(s), and 0 set variant node(s), plus 36 variables across 1 collection(s) and 0 local styles.

**Key Characteristics To Confirm:**
- Primary brand colors: see the Colors section. Confirm semantic roles from screenshots before assigning brand meaning.
- Type system: see Typography. Numeric/display roles must be inferred from text style names and actual UI usage.
- Theme model: inspect color collection modes and page usage; do not assume light/dark behavior unless variables or screens show it.
- Component reuse: components below list exact property keys where Figma exposes them.

## Extraction Coverage
- Pages scanned: 2
- Local components returned: 25/25
- Screens summarized: 19/19
- Instances inspected: 10/100
- Component anatomy depth: 2; screen evidence depth: 2
- Screen evidence: included; component usage: included
- Partial extraction: 0 component(s), 0 screen(s), and 90 instance(s) omitted by limits.

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
- **scCurrentBackground** (`{scCurrentBackground}`): Mode 1: #ffffff
- **scCurrentSurface** (`{scCurrentSurface}`): Mode 1: #ffffff
- **scCurrentText** (`{scCurrentText}`): Mode 1: #111111
- **scCurrentMuted** (`{scCurrentMuted}`): Mode 1: #666666
- **scCurrentBorder** (`{scCurrentBorder}`): Mode 1: #dddddd
- **scCurrentPrimary** (`{scCurrentPrimary}`): Mode 1: #111111
- **scCurrentDark** (`{scCurrentDark}`): Mode 1: #111111
- **scCurrentMint** (`{scCurrentMint}`): Mode 1: #f2f2f2
- **scCurrentOrange** (`{scCurrentOrange}`): Mode 1: #111111
- **scCurrentPurple** (`{scCurrentPurple}`): Mode 1: #111111

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
- Screen widths: 390px (×6), 1440px (×3), 2600px (×2), 5440px (×2), 1504px (×1), 1630px (×1), 1880px (×1), 3440px (×1), 3620px (×1), 4320px (×1)
- Auto-layout gaps: 0px (×44), 8px (×14), 12px (×13), 6px (×12), 16px (×10), 10px (×7), 4px (×4), 24px (×4), 1px (×3), 14px (×3), 20px (×3), 60px (×2), 18px (×1), 22px (×1)
- Padding values: 0px (×256), 12px (×68), 16px (×56), 18px (×20), 20px (×14), 40px (×14), 14px (×12), 24px (×12), 6px (×8), 44px (×8), 48px (×8), 4px (×4), 32px (×4)
- Corner radii: 0px (×269), 8px (×206), 14px (×18), 12px (×10), 2px (×7), 6px (×5), 16px (×5), 20px (×5), 3px (×3), 10px (×3), 15px (×3), 4px (×2), 24px (×2)
- Font sizes: 14px (×74), 16px (×32), 24px (×23), 22px (×18), 28px (×14), 18px (×11), 32px (×10), 12px (×8), 20px (×7), 36px (×6), 34px (×4), 26px (×2), 10px (×1), 13px (×1), 15px (×1), 25px (×1)
- Solid fills: #ffffff (×189), #666666 (×116), #1f1f1f (×93), #111111 (×85), #d0d0d0 (×69), #f7f7f7 (×53), #f8fafc (×13), #ececec (×12), #0f172a (×11), #1e293b (×10), #f2f2f2 (×8), #777777 (×3), #dddddd (×3), #fff1f2 (×3), #f1f5f9 (×2), #3b82f6 (×1)

## Elevation & Depth
_No local effect styles found. Treat elevation as flat unless component anatomy shows shadows._

## Shapes
### Radius Tokens
- `{radius}`: Mode 1: 8
- `{scv2ControlRadius}`: Mode 1: 12
- `{scv2CardRadius}`: Mode 1: 16
- `{scCurrentCardRadius}`: Mode 1: 8
- `{scCurrentControlRadius}`: Mode 1: 6
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
- `scCurrentBackground` (COLOR) = Mode 1: #ffffff
- `scCurrentSurface` (COLOR) = Mode 1: #ffffff
- `scCurrentText` (COLOR) = Mode 1: #111111
- `scCurrentMuted` (COLOR) = Mode 1: #666666
- `scCurrentBorder` (COLOR) = Mode 1: #dddddd
- `scCurrentPrimary` (COLOR) = Mode 1: #111111
- `scCurrentDark` (COLOR) = Mode 1: #111111
- `scCurrentMint` (COLOR) = Mode 1: #f2f2f2
- `scCurrentOrange` (COLOR) = Mode 1: #111111
- `scCurrentPurple` (COLOR) = Mode 1: #111111
- `scCurrentCardRadius` (FLOAT) = Mode 1: 8
- `scCurrentControlRadius` (FLOAT) = Mode 1: 6

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
- Usage:
  - Find it with figma.findComponent("SC/Button/Primary").
  - Instantiate with figma.instantiate("6:164", { parentId, props, overrides }).
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
- Usage:
  - Find it with figma.findComponent("SC/Button/Secondary").
  - Instantiate with figma.instantiate("6:165", { parentId, props, overrides }).
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
- Usage:
  - Find it with figma.findComponent("SC/Button/Disabled").
  - Instantiate with figma.instantiate("6:166", { parentId, props, overrides }).
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
- Usage:
  - Find it with figma.findComponent("SC/Field/Text").
  - Instantiate with figma.instantiate("6:168", { parentId, props, overrides }).
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
- Usage:
  - Find it with figma.findComponent("SC/Field/Password").
  - Instantiate with figma.instantiate("6:169", { parentId, props, overrides }).
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
- Usage:
  - Find it with figma.findComponent("SC/Field/Select").
  - Instantiate with figma.instantiate("6:170", { parentId, props, overrides }).
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
- Usage:
  - Find it with figma.findComponent("SC/Navigation/Overview").
  - Instantiate with figma.instantiate("6:181", { parentId, props, overrides }).
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
- Usage:
  - Find it with figma.findComponent("SC/Navigation/LED").
  - Instantiate with figma.instantiate("6:182", { parentId, props, overrides }).
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
- Usage:
  - Find it with figma.findComponent("SC/Navigation/History").
  - Instantiate with figma.instantiate("6:183", { parentId, props, overrides }).
- Instantiate:
```js
await figma.instantiate("6:183", {
  parentId: screen.id,
});
```

### SC/V2/Button/Primary
- Type: COMPONENT (Page 1/00-Foundations/Current/Foundations/SC/V2/Button/Primary)
- Figma node ID: `20:3587`
- Figma component key: `942748544d09c667bb4c2e852b73427b53fc5fa9`
- Source page: Page 1
- Layout: layoutMode=HORIZONTAL, itemSpacing=0, padding={"left":12,"right":12,"top":12,"bottom":12}, primaryAxisSizingMode=FIXED, counterAxisSizingMode=FIXED, primaryAxisAlignItems=CENTER, counterAxisAlignItems=CENTER, clipsContent=false
- Shape: cornerRadius=12, topLeftRadius=12, topRightRadius=12, bottomRightRadius=12, bottomLeftRadius=12
- Text layers:
  - `SC/V2/Button/Primary/Label`: "Xem chi tiết  →" constraints={"horizontal":"MIN","vertical":"MIN"}
- Usage:
  - Find it with figma.findComponent("SC/V2/Button/Primary").
  - Instantiate with figma.instantiate("20:3587", { parentId, props, overrides }).
- Observed instances: 3
- Used on pages: Page 1
- Used in screens: Page 1 / 10-Web
- Instantiate:
```js
await figma.instantiate("20:3587", {
  parentId: screen.id,
});
```

### SC/V2/Button/Secondary
- Type: COMPONENT (Page 1/00-Foundations/Current/Foundations/SC/V2/Button/Secondary)
- Figma node ID: `20:3588`
- Figma component key: `569b029884a5028991bacf307227c8b77205c231`
- Source page: Page 1
- Layout: layoutMode=HORIZONTAL, itemSpacing=0, padding={"left":12,"right":12,"top":12,"bottom":12}, primaryAxisSizingMode=FIXED, counterAxisSizingMode=FIXED, primaryAxisAlignItems=CENTER, counterAxisAlignItems=CENTER, clipsContent=false
- Shape: cornerRadius=12, topLeftRadius=12, topRightRadius=12, bottomRightRadius=12, bottomLeftRadius=12
- Text layers:
  - `SC/V2/Button/Secondary/Label`: "Thao tác phụ" constraints={"horizontal":"MIN","vertical":"MIN"}
- Usage:
  - Find it with figma.findComponent("SC/V2/Button/Secondary").
  - Instantiate with figma.instantiate("20:3588", { parentId, props, overrides }).
- Instantiate:
```js
await figma.instantiate("20:3588", {
  parentId: screen.id,
});
```

### SC/V2/Button/Soft
- Type: COMPONENT (Page 1/00-Foundations/Current/Foundations/SC/V2/Button/Soft)
- Figma node ID: `20:3589`
- Figma component key: `7d3bf80bc51dbcc7d766832e52676cb81294dfc3`
- Source page: Page 1
- Layout: layoutMode=HORIZONTAL, itemSpacing=0, padding={"left":12,"right":12,"top":12,"bottom":12}, primaryAxisSizingMode=FIXED, counterAxisSizingMode=FIXED, primaryAxisAlignItems=CENTER, counterAxisAlignItems=CENTER, clipsContent=false
- Shape: cornerRadius=12, topLeftRadius=12, topRightRadius=12, bottomRightRadius=12, bottomLeftRadius=12
- Text layers:
  - `SC/V2/Button/Soft/Label`: "Bộ lọc" constraints={"horizontal":"MIN","vertical":"MIN"}
- Usage:
  - Find it with figma.findComponent("SC/V2/Button/Soft").
  - Instantiate with figma.instantiate("20:3589", { parentId, props, overrides }).
- Instantiate:
```js
await figma.instantiate("20:3589", {
  parentId: screen.id,
});
```

### SC/V2/Button/Disabled
- Type: COMPONENT (Page 1/00-Foundations/Current/Foundations/SC/V2/Button/Disabled)
- Figma node ID: `20:3590`
- Figma component key: `2e15b3046ba7110d04d623fb5f58407e38f6451a`
- Source page: Page 1
- Layout: layoutMode=HORIZONTAL, itemSpacing=0, padding={"left":12,"right":12,"top":12,"bottom":12}, primaryAxisSizingMode=FIXED, counterAxisSizingMode=FIXED, primaryAxisAlignItems=CENTER, counterAxisAlignItems=CENTER, clipsContent=false
- Shape: cornerRadius=12, topLeftRadius=12, topRightRadius=12, bottomRightRadius=12, bottomLeftRadius=12
- Text layers:
  - `SC/V2/Button/Disabled/Label`: "Chưa có thay đổi" constraints={"horizontal":"MIN","vertical":"MIN"}
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
- Type: COMPONENT (Page 1/00-Foundations/Current/Foundations/SC/V2/Field/Text)
- Figma node ID: `20:3591`
- Figma component key: `2de562d48842b237cd1d459a6b99496c12012771`
- Source page: Page 1
- Layout: layoutMode=VERTICAL, itemSpacing=8, padding={"left":0,"right":0,"top":0,"bottom":0}, primaryAxisSizingMode=AUTO, counterAxisSizingMode=FIXED, primaryAxisAlignItems=MIN, counterAxisAlignItems=MIN, clipsContent=false
- Text layers:
  - `SC/V2/Field/Text/Label`: "Tài khoản" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Field/Text/u2FieldText/Box/Value`: "Nhập tên tài khoản" constraints={"horizontal":"MIN","vertical":"MIN"}
- Usage:
  - Find it with figma.findComponent("SC/V2/Field/Text").
  - Instantiate with figma.instantiate("20:3591", { parentId, props, overrides }).
- Observed instances: 4
- Used on pages: Page 1
- Used in screens: Page 1 / 10-Web
- Instantiate:
```js
await figma.instantiate("20:3591", {
  parentId: screen.id,
});
```

### SC/V2/Field/Password
- Type: COMPONENT (Page 1/00-Foundations/Current/Foundations/SC/V2/Field/Password)
- Figma node ID: `20:3592`
- Figma component key: `f3e58b8705bc4a03989d02e2abd3617b23b9f126`
- Source page: Page 1
- Layout: layoutMode=VERTICAL, itemSpacing=8, padding={"left":0,"right":0,"top":0,"bottom":0}, primaryAxisSizingMode=AUTO, counterAxisSizingMode=FIXED, primaryAxisAlignItems=MIN, counterAxisAlignItems=MIN, clipsContent=false
- Text layers:
  - `SC/V2/Field/Password/Label`: "Mật khẩu" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Field/Password/u2FieldPassword/Box/Value`: "••••••••" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Field/Password/u2FieldPassword/Box/u2FieldPassword/Trailing`: "Hiện" constraints={"horizontal":"MIN","vertical":"MIN"}
- Usage:
  - Find it with figma.findComponent("SC/V2/Field/Password").
  - Instantiate with figma.instantiate("20:3592", { parentId, props, overrides }).
- Observed instances: 3
- Used on pages: Page 1
- Used in screens: Page 1 / 10-Web
- Instantiate:
```js
await figma.instantiate("20:3592", {
  parentId: screen.id,
});
```

### SC/V2/Field/Select
- Type: COMPONENT (Page 1/00-Foundations/Current/Foundations/SC/V2/Field/Select)
- Figma node ID: `20:3593`
- Figma component key: `7dc8f6c4fb347f8bb1d8fdab4d40af3435b28568`
- Source page: Page 1
- Layout: layoutMode=VERTICAL, itemSpacing=8, padding={"left":0,"right":0,"top":0,"bottom":0}, primaryAxisSizingMode=AUTO, counterAxisSizingMode=FIXED, primaryAxisAlignItems=MIN, counterAxisAlignItems=MIN, clipsContent=false
- Text layers:
  - `SC/V2/Field/Select/Label`: "Chỉ số" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Field/Select/u2FieldSelect/Box/Value`: "Độ ẩm" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Field/Select/u2FieldSelect/Box/u2FieldSelect/Trailing`: "⌄" constraints={"horizontal":"MIN","vertical":"MIN"}
- Usage:
  - Find it with figma.findComponent("SC/V2/Field/Select").
  - Instantiate with figma.instantiate("20:3593", { parentId, props, overrides }).
- Instantiate:
```js
await figma.instantiate("20:3593", {
  parentId: screen.id,
});
```

### SC/V2/Navigation/Overview
- Type: COMPONENT (Page 1/00-Foundations/Current/Foundations/SC/V2/Navigation/Overview)
- Figma node ID: `20:3594`
- Figma component key: `8de4507a5f2299556a1e43b9270f21f219c09005`
- Source page: Page 1
- Layout: layoutMode=NONE, clipsContent=false
- Text layers:
  - `SC/V2/Navigation/Overview/u2NavOverview/Label0`: "Giám sát" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Navigation/Overview/u2NavOverview/Label1`: "Đèn LED" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Navigation/Overview/u2NavOverview/Label2`: "Lịch sử" constraints={"horizontal":"MIN","vertical":"MIN"}
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
- Type: COMPONENT (Page 1/00-Foundations/Current/Foundations/SC/V2/Navigation/LED)
- Figma node ID: `20:3595`
- Figma component key: `fbd74d20ae492f036e24a42da2520c7eb2a445d1`
- Source page: Page 1
- Layout: layoutMode=NONE, clipsContent=false
- Text layers:
  - `SC/V2/Navigation/LED/u2NavLED/Label0`: "Giám sát" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Navigation/LED/u2NavLED/Label1`: "Đèn LED" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Navigation/LED/u2NavLED/Label2`: "Lịch sử" constraints={"horizontal":"MIN","vertical":"MIN"}
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
- Type: COMPONENT (Page 1/00-Foundations/Current/Foundations/SC/V2/Navigation/History)
- Figma node ID: `20:3596`
- Figma component key: `55e719f9942a8298669d064902fdcaecab4c93a1`
- Source page: Page 1
- Layout: layoutMode=NONE, clipsContent=false
- Text layers:
  - `SC/V2/Navigation/History/u2NavHistory/Label0`: "Giám sát" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Navigation/History/u2NavHistory/Label1`: "Đèn LED" constraints={"horizontal":"MIN","vertical":"MIN"}
  - `SC/V2/Navigation/History/u2NavHistory/Label2`: "Lịch sử" constraints={"horizontal":"MIN","vertical":"MIN"}
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
- Component anatomy was not included. Re-run with `includeAnatomy:true` for subtree-level inspection.
- 90 instance(s) were omitted by extraction limits; usage counts may be partial.

## Notes
- Generated from local Figma styles, variables and components plus bounded screen/instance evidence.
- Component property names are the exact API keys to pass to instance.setProperties.
- Observed frequency patterns are evidence, not automatically approved semantic tokens.
## Output Limit
- 1 complete section(s) were omitted to preserve valid Markdown. Re-run with a larger `maxOutputChars`, request fewer components/screens, or inspect `get_design_system_kit` for the full structured source.

