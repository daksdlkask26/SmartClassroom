const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const {pathToFileURL}=require('node:url');
const workspace=path.resolve(__dirname,'../..');
const root=path.join(workspace,'SmartClassroom','Docs','wireframes-v3');
const temp=path.join(workspace,'tmp','figma-smartclassroom','render-input');
const profile=path.join(workspace,'tmp','figma-smartclassroom','chrome-render-profile');
fs.mkdirSync(temp,{recursive:true});
const chrome='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
let files=['screens','reports','responsive'].flatMap(dir=>fs.existsSync(path.join(root,dir))?fs.readdirSync(path.join(root,dir)).filter(n=>n.endsWith('.svg')).map(n=>path.join(dir,n)):[]);
const reportPhone=path.join('..','images','wireframes','ui-app-led.svg');
if(fs.existsSync(path.join(root,reportPhone)))files.push(reportPhone);
const filter=process.argv[2];
if(filter)files=files.filter(f=>f.includes(filter));
for(const relative of files){
  const input=path.join(root,relative),svg=fs.readFileSync(input,'utf8');
  const width=Number(svg.match(/<svg[^>]*\bwidth="([\d.]+)"/)[1]),height=Number(svg.match(/<svg[^>]*\bheight="([\d.]+)"/)[1]);
  const scale=relative.startsWith('reports')||relative===reportPhone?3:2;
  const html=path.join(temp,path.basename(relative,'.svg')+'.html');
  const output=input.replace(/\.svg$/,'.png');
  if(fs.existsSync(output)&&fs.statSync(output).mtimeMs>=fs.statSync(input).mtimeMs){
    const cached=fs.readFileSync(output);
    if(cached.readUInt32BE(16)===width*scale&&cached.readUInt32BE(20)===height*scale){
      console.log(JSON.stringify({file:path.relative(workspace,output),width:width*scale,height:height*scale,scale,bytes:cached.length,cached:true}));
      continue;
    }
  }
  fs.writeFileSync(html,'<!doctype html><meta charset="utf-8"><style>html,body{margin:0;padding:0;width:'+width+'px;height:'+height+'px;overflow:hidden;background:white}svg{display:block;width:'+width+'px;height:'+height+'px}</style>'+svg,'utf8');
  const args=['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-extensions','--disable-sync','--disable-background-networking','--disable-component-update','--hide-scrollbars','--run-all-compositor-stages-before-draw','--user-data-dir='+profile,'--window-size='+Math.ceil(width)+','+Math.ceil(height),'--force-device-scale-factor='+scale,'--screenshot='+output,pathToFileURL(html).href];
  const r=spawnSync(chrome,args,{timeout:60000,windowsHide:true,encoding:'utf8',maxBuffer:1024*1024});
  if(r.error||r.status!==0||!fs.existsSync(output)){console.error('FAILED '+relative+' '+(r.error?.message||r.stderr||r.stdout).slice(0,1500));process.exit(1);}
  const png=fs.readFileSync(output),pw=png.readUInt32BE(16),ph=png.readUInt32BE(20);
  console.log(JSON.stringify({file:path.relative(workspace,output),width:pw,height:ph,scale,bytes:png.length,sourceWidth:width,sourceHeight:height}));
}
