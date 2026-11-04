const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'../..');
const output=path.join(root,'tmp/ui-upgrade/qa');fs.mkdirSync(output,{recursive:true});
const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
const profile=fs.mkdtempSync(path.join(output,'chrome-'));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let socket,browser;
const results=[];
async function main(){
 browser=spawn(chrome,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-extensions','--disable-sync','--disable-background-networking','--disable-component-update','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
 const portFile=path.join(profile,'DevToolsActivePort');for(let i=0;i<100&&!fs.existsSync(portFile);i++)await wait(100);
 if(!fs.existsSync(portFile))throw Error('Chrome did not start');
 const port=fs.readFileSync(portFile,'utf8').split('\n')[0];
 const targets=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();
 socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
 let seq=0;const pending=new Map();socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}});
 const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 const ev=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const click=sel=>ev(`document.querySelector(${JSON.stringify(sel)}).click()`);
 const val=(sel,value,event='change')=>ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});e.value=${JSON.stringify(value)};e.dispatchEvent(new Event(${JSON.stringify(event)},{bubbles:true}));})()`);
 const until=async expression=>{for(let i=0;i<100;i++){if(await ev(expression))return;await wait(50);}throw Error('Timed out: '+expression);};
 const check=async(label,expression)=>{if(!await ev(expression))throw Error('Failed: '+label);results.push(label);};
 const viewport=async(w,h)=>call('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:false});
 const shot=async name=>{await ev('document.fonts.ready.then(()=>true)');const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(output,name+'.png'),Buffer.from(r.data,'base64'));};
 await call('Page.enable');await call('Runtime.enable');await viewport(1440,1100);
 const url=pathToFileURL(path.join(root,'SmartClassroom/Docs/prototype/index.html')).href;
 await call('Page.navigate',{url});await until("!!document.querySelector('[data-route=led]')");
 await ev('document.fonts.ready.then(()=>true)');
 await check('Vietnamese display and body fonts load offline',"document.fonts.check('700 24px Manrope')&&document.fonts.check('400 16px \"Be Vietnam Pro\"')&&getComputedStyle(document.querySelector('h1')).fontFamily.includes('Manrope')");
 await check('Humidity gauge exposes numeric meter semantics',"(()=>{const e=document.querySelector('[role=meter]');return e?.getAttribute('aria-valuemin')==='0'&&e.getAttribute('aria-valuemax')==='100'&&e.getAttribute('aria-valuenow')==='65'&&document.querySelectorAll('[role=meter]').length===1})()");
 await shot('overview-desktop-1440');
 await check('Desktop overview fits viewport',"document.documentElement.scrollWidth<=innerWidth");
 await click('[data-route=led]');
 await click('[data-color=\"#3B82F6\"]');await val('#brightness','40','input');
 await check('Brightness-only edit changes draft without sending',"document.querySelector('#brightness-value').textContent==='40%'&&document.querySelector('#applied-brightness').textContent.includes('70%')&&!document.querySelector('#apply').disabled&&!document.querySelector('.feedback')");
 await click('#apply');
 await check('Sending locks brightness and hue controls',"document.querySelector('#brightness').disabled&&document.querySelector('#hue').disabled&&document.querySelector('#sv-picker').getAttribute('aria-disabled')==='true'");
 await until("!!document.querySelector('.feedback.success')");
 await check('Brightness-only command commits sent level',"document.querySelector('#applied-brightness').textContent.includes('40%')&&document.querySelector('#apply').disabled");
 await val('#brightness','70','input');await click('#test-fail');await click('#apply');await until("!!document.querySelector('.feedback.error')");
 await check('Failed brightness command retains draft and sent level',"document.querySelector('#brightness').value==='70'&&document.querySelector('#applied-brightness').textContent.includes('40%')&&!document.querySelector('#apply').disabled");
 await click('#apply');await until("!!document.querySelector('.feedback.success')");
 await click('[data-color=\"#EAB308\"]');
 await check('Named swatches expose selected state',"document.querySelectorAll('[data-color]').length===5&&document.querySelector('[data-color=\"#EAB308\"]').getAttribute('aria-pressed')==='true'");
 await click('[data-color="#EF4444"]');
 await check('Selecting a color leaves last sent color unchanged',"document.querySelector('.draft-card').textContent.includes('Đỏ')&&document.querySelector('.last-color').textContent.includes('Xanh dương')");
 await check('Apply names the selected color',"document.querySelector('#apply').textContent.includes('Đỏ')");
 await click('#apply');
 await check('Pending command blocks duplicate sends and palette',"document.querySelector('#apply').disabled&&[...document.querySelectorAll('[data-color]')].every(e=>e.disabled)");
 await until("!!document.querySelector('.feedback.success')");
 await check('Success distinguishes sent command from hardware acknowledgement',"document.querySelector('.feedback').textContent.includes('Chưa xác nhận')&&document.querySelector('.last-color').textContent.includes('Đỏ')&&document.querySelector('#apply').disabled");
 await click('[data-color="#3B82F6"]');await click('#test-fail');await click('#apply');await until("!!document.querySelector('.feedback.error')");
 await check('Failure preserves draft and previous sent color',"document.querySelector('.draft-card').textContent.includes('Xanh dương')&&document.querySelector('.last-color').textContent.includes('Đỏ')&&!document.querySelector('#apply').disabled");
 await click('#apply');await until("!!document.querySelector('.feedback.success')");
 await click('#power');await until("document.querySelector('#power').getAttribute('aria-checked')==='false'");
 await check('Off state locks palette',"[...document.querySelectorAll('[data-color]')].every(e=>e.disabled)&&document.querySelector('#apply').disabled");
 await check('Off state locks all slider controls',"document.querySelector('#brightness').disabled&&document.querySelector('#hue').disabled&&document.querySelector('#sv-picker').getAttribute('aria-disabled')==='true'");
 await click('#power');await until("document.querySelector('#power').getAttribute('aria-checked')==='true'");
 await ev("document.querySelector('.advanced').open=true");await val('#hex','#GGGGGG','input');await click('#hex-preview');
 await check('Invalid HEX gives inline error and disables apply',"document.querySelector('#hex').getAttribute('aria-invalid')==='true'&&document.querySelector('#hex-error').textContent.length>10&&document.querySelector('#apply').disabled");
 await val('#hex','#123abc','input');await click('#hex-preview');
 await check('Valid custom HEX normalizes and previews',"document.querySelector('#hex').value==='#123ABC'&&!document.querySelector('#apply').disabled&&document.querySelector('.draft-card .swatch').style.getPropertyValue('--color')==='#123ABC'");
 await val('#hue','120','input');
 await check('Hue slider updates custom color without committing',"document.querySelector('#hue').getAttribute('aria-valuetext')==='120 độ'&&document.querySelector('#hex').value!=='#123ABC'&&document.querySelector('.last-color').textContent.includes('Xanh dương')");
 const beforeSV=await ev("document.querySelector('#hex').value");
 await ev("document.querySelector('#sv-picker').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',shiftKey:true,bubbles:true}))");
 await check('Visual color picker supports keyboard changes',`document.querySelector('#hex').value!==${JSON.stringify(beforeSV)}&&document.querySelector('#sv-handle').style.left.length>0`);
 await click('#hex-cancel');
 await check('Cancel restores both applied color and brightness',"document.querySelector('#brightness').value==='70'&&document.querySelector('#hex').value==='#3B82F6'&&document.querySelector('#apply').disabled");
 await ev("document.querySelector('.advanced').open=true");
 await click('#test-online');
 await check('Offline state blocks LED commands',"document.querySelector('#power').disabled&&document.querySelector('#apply').disabled");
 await check('Offline state locks sliders and visual picker',"document.querySelector('#brightness').disabled&&document.querySelector('#hue').disabled&&document.querySelector('#sv-picker').getAttribute('aria-disabled')==='true'");
 await click('#test-online');
 await shot('led-desktop-1440');
 for(const [w,h]of [[1024,900],[768,1024],[390,844],[360,800],[320,740]]){
  await viewport(w,h);await check(`LED fits ${w}px viewport`,"document.documentElement.scrollWidth<=innerWidth");
  await check(`LED primary action has readable bounds at ${w}px`,"(()=>{const r=document.querySelector('#apply').getBoundingClientRect();return r.width>=200&&r.left>=0&&r.right<=innerWidth})()");
  if([1024,390,320].includes(w))await shot('led-'+w);
 }
 await viewport(390,844);await click('[data-route=history]');await val('#range','7d');await until("!!document.querySelector('.history-layout')");
 await check('History presets auto-apply with day mode',"document.querySelector('[data-mode=day]').getAttribute('aria-pressed')==='true'&&document.querySelector('.history-layout').textContent.includes('28/10')");
 await val('#metric','temperature');await until("!!document.querySelector('.history-layout')");
 await check('Metric switch updates chart units',"document.querySelector('#chart-readout').textContent.includes('°C')");
 await val('#range','custom');await val('#from','2026-11-04');await val('#to','2026-11-01');await click('#apply-dates');
 await check('Invalid custom range is rejected',"document.querySelector('#date-error').textContent.includes('không được sau')");
 await val('#from','2026-11-01');await val('#to','2026-11-03');
 await check('Unapplied custom dates preserve old chart label',"document.querySelector('.filter-caption').textContent.includes('Chưa áp dụng')&&document.querySelector('.history-layout').textContent.includes('28/10')");
 await click('#apply-dates');await until("!!document.querySelector('.history-layout')");
 await check('Custom range explicitly applies to chart label',"document.querySelector('.history-layout').textContent.includes('2026-11-01 → 2026-11-03')");
 await val('#metric','humidity');await until("!!document.querySelector('.history-layout')");await click('[data-cell="3,6"]');
 await check('Heatmap selected cell has numeric readout',"document.querySelector('#heat-readout').textContent.includes('64,5%')");
 await click('[data-cell="5,6"]');await check('Heatmap missing data stays missing',"document.querySelector('#heat-readout').textContent.includes('Chưa có dữ liệu')");
 await ev("document.querySelector('[data-point=\"0\"]').dispatchEvent(new Event('focus'))");
 await check('Chart points support keyboard focus readout with applied dates',"document.querySelector('#chart-readout').textContent.includes('01/11')&&document.querySelector('#chart-readout').textContent.includes('66')");
 await check('Mobile history fits viewport',"document.documentElement.scrollWidth<=innerWidth");await shot('history-mobile-390');
 await click('[data-history-state=empty]');await check('History empty state has recovery action',"!!document.querySelector('#reset-range')");await click('#reset-range');await until("!!document.querySelector('.history-layout')");
 await click('[data-history-state=error]');await check('History error state has retry',"!!document.querySelector('#retry-history')");await click('#retry-history');await until("!!document.querySelector('.history-layout')");
 await click('#account');await check('Account opens accessible modal',"!!document.querySelector('[role=dialog][aria-modal=true]')&&document.activeElement.id==='account-close'");
 await ev("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))");await check('Escape closes account menu',"!document.querySelector('[role=dialog]')");
 await click('#account');await click('#logout');await check('Logout removes protected UI',"!!document.querySelector('#auth-form')&&!document.querySelector('#apply')");
 await ev("location.hash='led'");await wait(150);await check('Back navigation cannot reopen protected content',"!!document.querySelector('#auth-form')&&!document.querySelector('#apply')");
 await click('#auth-switch');await val('#username','new_user','input');await val('#password','abcdefgh','input');await val('#confirm','wrong','input');await click('#auth-submit');
 await check('Registration validates password confirmation',"document.querySelector('#auth-error').textContent.includes('chưa trùng')");
 await val('#confirm','abcdefgh','input');await click('#auth-submit');await until("!!document.querySelector('#demo-login')");
 await check('Registration returns to login with account prefilled',"document.querySelector('#username').value==='new_user'&&document.querySelector('.feedback').textContent.includes('Đăng ký thành công')");
 await val('#password','abcdefgh','input');await click('#auth-submit');await until("!!document.querySelector('#account')");
 await click('#test-expire');await check('Session expiry requires login',"!!document.querySelector('#auth-form')&&document.querySelector('.feedback').textContent.includes('Phiên đã hết')");
 await click('#demo-login');await until("!!document.querySelector('#account')");
 await viewport(390,844);await shot('overview-mobile-390');
 for(const [w,h]of [[320,740],[390,844],[768,1024],[1024,900],[1440,1100]]){
  await viewport(w,h);await check(`Overview fits ${w}px viewport`,"document.documentElement.scrollWidth<=innerWidth");
  if(w===768||w===1024)await check(`Tablet account menu reachable at ${w}px`,"getComputedStyle(document.querySelector('#account')).display!=='none'&&getComputedStyle(document.querySelector('.desktop-nav')).display!=='none'");
 }
 await viewport(320,740);await click('[data-route=history]');await check('History fits 320px viewport',"document.documentElement.scrollWidth<=innerWidth");
 await viewport(1440,1100);await click('#account');await click('#account-close');
 await check('Desktop account dialog returns focus to its opener',"document.activeElement.id==='account'");
 await check('Desktop uses four visible horizontal navigation links',"[...document.querySelectorAll('.desktop-nav button')].length===4&&getComputedStyle(document.querySelector('.desktop-nav')).display==='grid'&&!document.querySelector('.sidebar')");
 await check('Selected desktop destination has text and an underline',"document.querySelector('.desktop-nav [aria-current=page]')?.textContent.includes('Lịch sử')&&getComputedStyle(document.querySelector('.desktop-nav [aria-current=page]')).borderBottomColor==='rgb(17, 17, 17)'");
 await check('Main interface uses flat neutral surfaces',"getComputedStyle(document.querySelector('.masthead')).backgroundImage==='none'&&getComputedStyle(document.querySelector('.masthead')).backgroundColor==='rgb(255, 255, 255)'");
 await click('[data-route=led]');await shot('led-desktop-final');
// Validate chart meaning and every expanded route at supported widths.
 const go=async route=>{await ev('location.hash='+JSON.stringify(route));await wait(100);await ev('document.fonts.ready.then(()=>true)');};
 await viewport(1440,1100);await go('overview');
 await check('Midnight uses real time position between 22:30 and 02:30', "(()=>{const c=document.querySelector('.pro-chart.chart-wide'),d=c.querySelector('.day-boundary'),p=c.querySelectorAll('.point'),x=+d.getAttribute('x1'),a=+p[0].getAttribute('cx'),b=+p[6].getAttribute('cx');return Math.abs((x-a)/(b-a)-9.5/24)<.00001&&x>+p[2].getAttribute('cx')&&x<+p[3].getAttribute('cx')})()");
 await check('Date bands identify both full dates separately from clock labels', "[...document.querySelector('.chart-wide').querySelectorAll('.chart-day-label')].map(e=>e.textContent).join('|')==='02/11/2026|03/11/2026'");
 await check('Overview chart has seven numeric point labels and a semantic data table', "document.querySelectorAll('.pro-chart-wrap .chart-wide .point-value').length===7&&document.querySelectorAll('.chart-data tbody tr').length===7&&!!document.querySelector('.chart-data caption')");
 for(const [route,unit,domain]of [['temperature','°C','26–28°C'],['co2','ppm','600–900 ppm']]){
  await go(route);
  await check(route+' chart uses its own units and declared cropped scale', `document.querySelector('.pro-chart').getAttribute('aria-label').length>10&&document.querySelector('#chart-readout').textContent.includes(${JSON.stringify(unit)})&&document.querySelector('.chart-footnote').textContent.includes(${JSON.stringify(domain)})`);
  await check(route+' first value label is clear of y-axis tick labels', "(()=>{const c=document.querySelector('.chart-wide'),p=c.querySelector('.point-value').getBoundingClientRect(),ticks=[...c.querySelectorAll('text[text-anchor=end]')].filter(t=>+t.getAttribute('x')<54);return ticks.every(t=>p.left>t.getBoundingClientRect().right)})()");
 }
 await check('CO2 is presented as an estimate without invented health bands', "document.querySelector('.measurement-note').textContent.includes('không phân loại mức an toàn')&&!document.querySelector('[role=meter]')");
 await go('daydetail');
 await check('Future time slots remain missing with no extrapolated line', "(()=>{const c=document.querySelector('.chart-wide'),rows=[...document.querySelectorAll('.chart-data tbody tr')];return c.querySelectorAll('.point').length===4&&[...c.querySelectorAll('line')].filter(e=>e.getAttribute('stroke')==='#111').length===3&&rows.length===6&&rows.slice(-2).every(r=>r.textContent.includes('Chưa tới mốc'))})()");
 await viewport(390,844);
 await check('Selected day displays all six evenly spaced four-hour landmarks', "[...document.querySelector('.chart-compact').querySelectorAll('text[y=\"223\"]')].map(t=>t.textContent).join('|')==='00:00|04:00|08:00|12:00|16:00|20:00'");
 await ev("document.querySelector('.chart-compact [data-point=\"0\"]').focus()");
 await ev("document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}))");
 await check('Arrow keys move chart selection and announce the matching value', "document.activeElement.dataset.point==='1'&&document.querySelector('#chart-readout').textContent.includes('04:00')&&document.querySelector('#chart-readout').textContent.includes('64')");
 await go('history');await val('#range','7d');await until("!!document.querySelector('.history-layout')");
 for(const [metric,lastTick]of [['humidity','100'],['temperature','30'],['co2','1000']]){
  await val('#metric',metric);await until("!!document.querySelector('.history-layout')");await go('daily');
  await check(metric+' daily bars have a zero baseline and an honest maximum', `(()=>{const c=document.querySelector('.chart-compact'),ticks=[...c.querySelectorAll('text[y="39"]')].map(t=>t.textContent);return ticks[0]==='0'&&ticks.at(-1)===${JSON.stringify(lastTick)}&&c.querySelectorAll('[data-point]').length===7&&c.querySelector('[data-point="6"]').getAttribute('aria-label').includes('chưa trọn ngày')})()`);
  if(metric!=='co2'){await go('history');}
 }
 await go('history');await val('#metric','humidity');await until("!!document.querySelector('.history-layout')");await go('daily');
 await check('Heatmap identifies seven dates, six clock columns, scale and missing cells', "document.querySelectorAll('.heat-cell').length===42&&document.querySelectorAll('.heatmap .heat-date').length===7&&document.querySelector('.heat-scale').textContent.includes('70%')&&document.querySelectorAll('.heat-cell').length-[...document.querySelectorAll('.heat-cell')].filter(e=>e.textContent==='').length===2");
 await check('Heatmap scroll is isolated from its legend and numeric readout', "document.querySelector('.heatmap-scroll').contains(document.querySelector('.heatmap'))&&!document.querySelector('.heatmap-scroll').contains(document.querySelector('.heat-scale'))&&!document.querySelector('.heatmap-scroll').contains(document.querySelector('#heat-readout'))");
 await go('records');await check('All records expose time and three sensor units', "document.querySelectorAll('.records-table tbody tr').length===7&&['UTC+7','%','°C','ppm'].every(t=>document.querySelector('.records-table').textContent.includes(t))");
 await go('device');await click('#device-refresh');await check('Device help requires a physical BOOT action and distinguishes saved WiFi from online', "document.querySelector('#device-result').textContent.includes('14:30')&&document.querySelector('#main').textContent.includes('BOOT khoảng 5 giây')&&document.querySelector('#main').textContent.includes('chưa đồng nghĩa đã online')");
 await go('telegram');await check('Telegram guide uses strict project thresholds and three required commands', "['< 30%','> 85%','/start','/doam','/trangthai'].every(t=>document.querySelector('#main').textContent.includes(t))");
 await go('telegram-demo');
 for(const cmd of ['/start','/doam','/trangthai'])await click('[data-command="'+cmd+'"]');
 await click('#telegram-alert-demo');
 await check('Telegram demo separates current 65% reading from 88% alert example', "document.querySelector('.chat-log').textContent.includes('65%')&&document.querySelector('.chat-log').textContent.includes('Ví dụ cảnh báo: Độ ẩm 88%')&&document.querySelector('.measurement-note').textContent.includes('vẫn là 65%')");
 for(const route of ['temperature','co2','records','daily','daydetail','filters','device','telegram','telegram-demo','profile']){
  for(const w of [320,390,768,1440]){await viewport(w,900);await go(route);await check(route+' fits '+w+'px', "document.documentElement.scrollWidth<=innerWidth&&!!document.querySelector('#main h1')");}
  if(['co2','records','daily','device','telegram','telegram-demo'].includes(route)){await viewport(390,844);await shot(route+'-mobile-390');}
 }
 await go('profile');await click('#logout');
 for(const route of ['temperature','records','device','telegram','profile']){await go(route);await check('Session guard protects '+route, "!!document.querySelector('#auth-form')&&!document.querySelector('.chat-log')&&!document.querySelector('.records-table')");}
 await call('Page.navigate',{url:url+'?route=expired'});await until("!!document.querySelector('#auth-form')");
 await check('Expired session preview opens login with an explicit recovery message', "document.querySelector('.feedback').textContent.includes('Phiên đã hết')");
 await click('#demo-login');await until("!!document.querySelector('#account')");

 fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify({status:'passed',checks:results.length,results},null,2)+'\n');
 console.log(JSON.stringify({status:'passed',checks:results.length,output}));
 await call('Browser.close');socket.close();
}
main().catch(async err=>{console.error(err.stack);fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify({status:'failed',error:err.message,passed:results},null,2));if(socket?.readyState===WebSocket.OPEN)socket.close();if(browser)browser.kill();process.exitCode=1;});
