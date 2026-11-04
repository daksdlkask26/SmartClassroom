const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname,'../Docs');
const assets = [{"key":"W01-Login","id":"6:448","uiId":"6:453","name":"screens/wireframe-web-login","scale":2},{"key":"W02-Register","id":"6:449","uiId":"6:462","name":"screens/wireframe-web-register","scale":2},{"key":"W03-Dashboard","id":"6:450","uiId":"6:471","name":"screens/wireframe-web-dashboard","scale":2},{"key":"W04-Analytics","id":"21:4663","uiId":"21:4414","name":"screens/wireframe-web-analytics","scale":2},{"key":"W05-LEDControl","id":"21:4784","uiId":"21:4681","name":"screens/wireframe-web-led","scale":2},{"key":"W06-HumidityDetail","id":"21:5015","uiId":"21:4797","name":"screens/wireframe-web-humidity-detail","scale":2},{"key":"M01-Login","id":"6:776","uiId":"6:783","name":"screens/wireframe-app-login","scale":2},{"key":"M02-Register","id":"6:777","uiId":"6:792","name":"screens/wireframe-app-register","scale":2},{"key":"M03-Overview","id":"6:778","uiId":"6:801","name":"screens/wireframe-app-overview","scale":2},{"key":"M04-LED","id":"6:779","uiId":"6:812","name":"screens/wireframe-app-led","scale":2},{"key":"M05-History","id":"6:780","uiId":"6:821","name":"screens/wireframe-app-history","scale":2},{"key":"M06-HumidityDetail","id":"23:5745","uiId":"23:5595","name":"screens/wireframe-app-humidity-detail","scale":2},{"key":"M07-ColorPicker","id":"23:5809","uiId":"23:5758","name":"screens/wireframe-app-color-picker","scale":2},{"key":"M08-DailyAnalytics","id":"23:5942","uiId":"23:5827","name":"screens/wireframe-app-daily-analytics","scale":2},{"key":"M09-ConnectionState","id":"23:6067","uiId":"23:5955","name":"screens/wireframe-app-connection-state","scale":2},{"key":"P01-WiFiPortal","id":"6:1231","uiId":"6:1235","name":"screens/wireframe-wifi-portal","scale":2},{"key":"P02-WiFiReceived","id":"23:6163","uiId":"23:6131","name":"screens/wireframe-wifi-received","scale":2},{"key":"R01-WebAuth","id":"8:1884","name":"reports/report-wireframe-web-auth","scale":3},{"key":"R02-WebMonitorLED","id":"8:1885","name":"reports/report-wireframe-web-monitor-led","scale":3},{"key":"R03-WebAnalytics","id":"8:1886","name":"reports/report-wireframe-web-analytics","scale":3},{"key":"R04-AppAuth","id":"8:1887","name":"reports/report-wireframe-app-auth","scale":3},{"key":"R05-AppOverview","id":"8:1888","name":"reports/report-wireframe-app-overview","scale":3},{"key":"R06-AppLED","id":"8:1889","name":"reports/report-wireframe-app-led","scale":3},{"key":"R07-AppDailyAnalytics","id":"8:1890","name":"reports/report-wireframe-app-daily-analytics","scale":3},{"key":"R08-WiFi","id":"8:1891","name":"reports/report-wireframe-wifi","scale":3}];
const records = assets.map(a => {
  const relative = 'wireframes-v3/' + a.name;
  const svgPath = path.join(root, relative + '.svg');
  const pngPath = path.join(root, relative + '.png');
  const svg = fs.readFileSync(svgPath, 'utf8'), png = fs.readFileSync(pngPath);
  if (png.subarray(0,8).toString('hex') !== '89504e470d0a1a0a') throw new Error('Invalid PNG ' + a.key);
  const sw = Number(svg.match(/<svg[^>]*\bwidth="([\d.]+)"/)[1]);
  const sh = Number(svg.match(/<svg[^>]*\bheight="([\d.]+)"/)[1]);
  const pw = png.readUInt32BE(16), ph = png.readUInt32BE(20);
  if (pw !== sw*a.scale || ph !== sh*a.scale) throw new Error('Wrong scale ' + a.key);
  if (fs.statSync(pngPath).mtimeMs < fs.statSync(svgPath).mtimeMs) throw new Error('Stale PNG ' + a.key);
  return {key:a.key, sourceNodeId:a.id, uiNodeId:a.uiId??null, svg:relative+'.svg', png:relative+'.png', scale:a.scale, svgWidth:sw, svgHeight:sh, pngWidth:pw, pngHeight:ph, svgBytes:Buffer.byteLength(svg), pngBytes:png.length, svgSha256:crypto.createHash('sha256').update(svg).digest('hex'), pngSha256:crypto.createHash('sha256').update(png).digest('hex')};
});
for (const folder of ['screens','reports']) {
  const list=fs.readdirSync(path.join(root,'wireframes-v3',folder)), expected=folder==='screens'?17:8;
  for (const ext of ['.png','.svg']) if(list.filter(f=>f.endsWith(ext)).length!==expected) throw new Error('Wrong count '+folder+ext);
}
const result={version:3,date:'2026-11-03',file:'VLcCNTT',modifiedPage:'Page 1',status:'passed',screenCount:17,reportCount:8,pngCount:25,svgCount:25,pngDimensionsMatchSvgScale:true,noStalePng:true,records};
fs.writeFileSync(path.join(root,'wireframes-v3','export_verification.json'),JSON.stringify(result,null,2)+'\n','utf8');
console.log(JSON.stringify({status:result.status,screenCount:17,reportCount:8,pngCount:25,svgCount:25,allDimensionsMatch:true,noStalePng:true}));

