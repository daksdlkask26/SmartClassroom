(function buildIndex(){const fs=require('node:fs'),path=require('node:path'),docs=path.resolve(__dirname,'../Docs'),root=path.join(docs,'wireframes-v3'),file=path.join(root,'assets.json'),registry=JSON.parse(fs.readFileSync(file,'utf8'));const functions={W01:[8,9],W02:[8,9],W05:[3,8,9],M01:[8,9],M02:[8,9],M04:[3,9],M07:[3,9],M09:[1,2,3,9],P01:[10],P02:[10],R01:[8,9],R02:[1,2,3,8,9],R03:[4,5,9],R04:[8,9],R05:[1,2,9],R06:[3,9],R07:[4,5,9],R08:[10]};for(const a of registry.assets)if(!a.functions?.length&&functions[a.key])a.functions=functions[a.key];fs.writeFileSync(file,JSON.stringify(registry,null,2)+'\n');const records=registry.assets.filter(a=>['screens','reports'].includes(a.category)),screens=records.filter(a=>a.category==='screens'),reports=records.filter(a=>a.category==='reports');const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const imageLink=(a,ext)=>a.relative.replace(/^wireframes-v3\//,'')+'.'+ext;const cards=records.map(a=>`<article class="tile" data-kind="${a.platform}" data-search="${esc(a.key+' '+a.title+' '+(a.functions??[]).join(' '))}"><a class="preview" href="${imageLink(a,'png')}" target="_blank" rel="noopener"><img src="${imageLink(a,'png')}" alt="${esc(a.key+' / '+a.title)}" loading="lazy" width="600"></a><div class="tile-copy"><p class="index">${a.key} · ${a.platform==='report'?'BOARD BÁO CÁO':a.platform==='wifi'?'WIFI':a.platform==='web'?'WEB DESKTOP':'MOBILE'}</p><h2>${esc(a.title)}</h2><p class="functions">ID ${(a.functions??[]).join(', ')}</p><div class="tile-links"><a href="${imageLink(a,'png')}" target="_blank" rel="noopener">PNG ${a.scale}× ↗</a><a href="${imageLink(a,'svg')}" target="_blank" rel="noopener">SVG ↗</a>${a.route?`<a href="../prototype/index.html?route=${a.route}${a.key==='M09'?'&amp;offline=1':''}" target="_blank" rel="noopener">Thử luồng →</a>`:''}</div></div></article>`).join('\n');const html=`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Smart Classroom · Bộ thiết kế hiện hành</title><style>
@font-face{font-family:Manrope;src:url('../prototype/fonts/Manrope-Variable.ttf');font-weight:200 800}@font-face{font-family:Be;src:url('../prototype/fonts/BeVietnamPro-Regular.ttf');font-weight:400}@font-face{font-family:Be;src:url('../prototype/fonts/BeVietnamPro-SemiBold.ttf');font-weight:600}*{box-sizing:border-box}body{margin:0;background:#fff;color:#111;font:14px/1.6 Be,sans-serif}a{color:inherit;text-underline-offset:5px}button,input{font:inherit;color:inherit}button,a,input{outline-offset:4px}:focus-visible{outline:3px solid #111}.container{max-width:1480px;padding:0 40px;margin:auto}header{padding:38px 0;border-bottom:1px solid #ddd}.brand{display:flex;justify-content:space-between;align-items:center;gap:24px}.brand strong{font:750 20px Manrope}.brand span{color:#666;font-size:12px}.intro{padding:60px 0 40px}.eyebrow,.index{font-size:11px;letter-spacing:.08em;color:#666}h1{font:750 clamp(32px,4vw,54px)/1.15 Manrope;letter-spacing:-.04em;max-width:900px;margin:16px 0 22px}.intro>p:not(.eyebrow){max-width:820px;color:#555}.intro-links{display:flex;gap:24px;flex-wrap:wrap;margin-top:24px}.toolbar{display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;padding:24px 0;border-top:1px solid #ddd;border-bottom:1px solid #ddd}.filters{display:flex;flex-wrap:wrap;gap:8px}button{min-height:44px;background:#fff;border:1px solid #bbb;border-radius:4px;padding:8px 16px;cursor:pointer}button[aria-pressed=true]{background:#111;color:white;border-color:#111}label{display:flex;align-items:center;gap:12px}input{min-height:44px;padding:8px 12px;border:1px solid #888;border-radius:4px;width:260px;max-width:100%}.results{padding:18px 0;color:#666;font-size:12px}.gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;padding-bottom:60px}.tile{border:1px solid #ddd;border-radius:8px;overflow:hidden;min-width:0}.tile[hidden]{display:none}.preview{display:flex;justify-content:center;align-items:center;height:310px;background:#f7f7f7;padding:18px;border-bottom:1px solid #ddd}.preview img{max-width:100%;max-height:100%;object-fit:contain;width:auto;height:auto}.tile-copy{padding:20px}.index{margin:0 0 10px}h2{font:750 22px/1.3 Manrope;letter-spacing:-.025em;margin:0;min-height:58px}.functions{font-size:12px;color:#666;margin:14px 0 20px}.tile-links{display:flex;gap:18px;flex-wrap:wrap;font-size:12px}.empty{padding:40px 0}footer{border-top:1px solid #ddd;padding:28px 0;color:#666;font-size:12px}@media(max-width:1050px){.gallery{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:640px){.container{padding:0 20px}.brand{align-items:flex-start;flex-direction:column;gap:6px}.intro{padding:40px 0 28px}.gallery{grid-template-columns:1fr}.toolbar,label{width:100%}label{flex-wrap:wrap}input{width:100%}.preview{height:330px}h2{min-height:0}}
</style><body><header><div class="container brand"><strong>Smart Classroom / Design</strong><span>VLcCNTT · Page 1 · 04/11/2026</span></div></header><main class="container"><section class="intro"><p class="eyebrow">35 MÀN HÌNH · 9 BOARD BÁO CÁO</p><h1>Rõ từng chỉ số.<br>Liền mạch từng thao tác.</h1><p>Bộ thiết kế trắng–đen hiện hành. Mở ảnh để xem đầy đủ, hoặc thử các luồng trên prototype web/mobile. Dữ liệu và lệnh trong prototype là minh họa.</p><div class="intro-links"><a href="../prototype/index.html">Mở prototype →</a><a href="../wireframe_v3_manifest.md">Chỉ mục Figma →</a><a href="../huong_dan_wireframe_v3.md">Đặc tả & cơ sở chart →</a></div></section><div class="toolbar"><div class="filters" role="group" aria-label="Lọc nhóm màn hình"><button data-filter="all" aria-pressed="true">Tất cả 44</button><button data-filter="web" aria-pressed="false">Web 14</button><button data-filter="mobile" aria-pressed="false">Mobile 19</button><button data-filter="wifi" aria-pressed="false">WiFi 2</button><button data-filter="report" aria-pressed="false">Báo cáo 9</button></div><label>Tìm trang<input id="search" type="search" placeholder="Tên trang, mã màn hoặc ID chức năng"></label></div><p class="results" id="count" role="status">44 mục</p><div class="gallery">${cards}</div><p class="empty" hidden>Chưa có trang khớp bộ lọc.</p></main><footer><div class="container">Ảnh xuất từ node native của Figma Page 1. SVG dùng chữ outline; chỉnh sửa chữ ở nguồn Figma. M17 minh họa hội thoại Telegram bên ngoài. Bản thử chưa nối backend/MQTT/ESP32.</div></footer><script>const tiles=[...document.querySelectorAll('.tile')],buttons=[...document.querySelectorAll('[data-filter]')],normalize=s=>s.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/đ/g,'d').toLowerCase();let kind='all';function update(){const q=normalize(document.querySelector('#search').value);let n=0;for(const tile of tiles){tile.hidden=!(kind==='all'||tile.dataset.kind===kind)||!normalize(tile.dataset.search).includes(q);if(!tile.hidden)n++;}document.querySelector('#count').textContent=n+' mục';document.querySelector('.empty').hidden=n>0;}for(const b of buttons)b.addEventListener('click',()=>{kind=b.dataset.filter;for(const x of buttons)x.setAttribute('aria-pressed',String(x===b));update();});document.querySelector('#search').addEventListener('input',update);</script></body></html>`;fs.writeFileSync(path.join(root,'index.html'),html);
const verification=JSON.parse(fs.readFileSync(path.join(root,'export_verification.json'),'utf8'));const row=a=>{const r=verification.records.find(r=>r.key===a.key);return`| ${a.key} | ${a.title} | ${a.uiId?'`'+a.uiId+'`':'—'} | \`${a.id}\` | ${r.svgWidth}×${r.svgHeight} | [PNG ${a.scale}×](${a.relative}.png) · [SVG](${a.relative}.svg) |`;};const manifest=`# Chỉ mục thiết kế hiện hành — VLcCNTT

**Page 1 (\`0:1\`)**, cập nhật trực tiếp ngày 04/11/2026 bằng Reqwise Figma MCP. **35 màn: 14 web, 19 mobile, 2 WiFi**; 9 board báo cáo. 18 màn mới là W07–W14 và M10–M19. Page 2 giữ làm tham chiếu.

[Thư viện xem ảnh](wireframes-v3/index.html) · [Prototype](prototype/index.html) · [Đặc tả và đối chiếu ID 1–10](huong_dan_wireframe_v3.md)

## Vị trí trên Page 1

| Nhóm | Node | Vị trí / nội dung |
| --- | --- | --- |
| 00-Foundations | \`6:154\` | Thành phần và token tham chiếu |
| 10-Web | \`6:444\` | y=1320; 14 màn, 3 cột |
| 20-App | \`6:772\` | y=9300; 19 màn, 5 cột |
| 30-WiFi | \`6:1227\` | y=15500; 2 trang portal |
| 40-States-Flows | \`7:1306\` | y=16970; 6 bảng/33 trạng thái và luồng mở rộng 35 màn |
| 50-Report | \`8:1880\` | y=23170; 9 board |
| 60-Responsive-Interaction | \`43:798\` | Bên phải nhóm web; LED 320/1024 px |

MCP không cung cấp fileKey/URL của file. Mở **VLcCNTT → Page 1**, tìm nhóm/tên màn hoặc node dưới đây. Màn đã có giữ nguyên root UI; màn mới có node native thật.

## 35 màn hình

Kích thước dưới đây là **wrapper gồm UI và chú thích**, không phải viewport. UI web rộng 1440 px; mobile/portal rộng 390 px. Các màn cao thể hiện toàn bộ nội dung cuộn. PNG xuất 2×.

| Mã | Nội dung | Node UI | Node wrapper | Wrapper logic | Ảnh |
| --- | --- | --- | --- | --- | --- |
${screens.map(row).join('\n')}

M17 là hội thoại Telegram bên ngoài được minh họa để thể hiện ID 6–7; không phải màn của client Telegram do đồ án triển khai.

## 9 board báo cáo

| Mã | Nội dung | Node UI | Node board | Kích thước logic | Ảnh |
| --- | --- | --- | --- | --- | --- |
${reports.map(row).join('\n')}

R03 được dựng lại cho trục giờ/ngày, cột gốc 0 và heatmap có thang số. R05/R07 cập nhật theo mobile mới. R09 bổ sung thiết bị, WiFi và Telegram. Bản copy PNG dùng trong PDF nằm ở \`images/wireframes/\`.

## Trạng thái và luồng

| Bảng | Node | Phạm vi |
| --- | --- | --- |
| ST01-Auth | \`7:1310\` | Nhập liệu, gửi và lỗi tài khoản |
| ST02-Telemetry | \`7:1311\` | Tải, dữ liệu mới/cũ, mất kết nối |
| ST03-LED | \`7:1312\` | Bản nháp, gửi, lỗi và khóa điều khiển |
| ST04-History | \`7:1313\` | Bộ lọc, giờ/ngày, tải/rỗng/lỗi |
| ST05-WiFi | \`7:1314\` | Chọn mạng, lỗi và khởi động lại |
| ST06-Session | \`7:1315\` | Đăng xuất và hết phiên |
| 40-Flowmap | \`7:1316\` | Đã bổ sung nhánh cảm biến, bản ghi/ngày, kết nối/Telegram và phiên của 35 màn |

Bốn mục desktop và ba tab mobile được giữ gọn; các trang mới đi từ liên kết trong nội dung/tài khoản. Prototype thử được các luồng; native Present chưa được xác minh.

## Nguồn ảnh và kiểm tra

- [assets.json](wireframes-v3/assets.json): nguồn node native và metadata. Không có node giả từ bộ dựng SVG tạm.
- [export_verification.json](wireframes-v3/export_verification.json): 47 cặp = 35 màn + 9 report + 2 responsive + 1 UI mobile; kích thước/hash và ảnh copy báo cáo đều khớp.
- [layout_audit.json](wireframes-v3/layout_audit.json): sáu nhóm được kiểm tra, không có lỗi bounds/clipping/truncation. Style hints được đọc và đối chiếu trực quan.
- [prototype_verification.json](wireframes-v3/prototype_verification.json): 128 kiểm tra, gồm chart/đơn vị/mốc 00:00/phần thiếu, bàn phím, LED, phiên, Telegram minh họa và responsive.
- SVG dùng chữ outline. Sửa chữ ở Figma rồi xuất lại. Nguồn dựng nhóm nâng cấp nằm tại \`tools/wireframes/\`.
- Cập nhật trực tiếp bộ V3; không tạo bộ phiên bản song song. Dữ liệu/lệnh trong HTML là mô phỏng; slider độ sáng cần tích hợp backend/ESP32.
`;fs.writeFileSync(path.join(docs,'wireframe_v3_manifest.md'),manifest);console.log(JSON.stringify({screens:screens.length,reports:reports.length,galleryCards:records.length}));})();
