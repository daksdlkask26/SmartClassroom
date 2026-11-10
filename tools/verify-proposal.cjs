// Read-only checks for the proposal source and Poppler exports of its PDF.
// Usage: node tools/verify-proposal.cjs [pdf2xml.xml] [bbox.html] [pdf-text.txt]
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'Docs/thuyet_minh.tex'), 'utf8');
const clean = source.replace(/(?<!\\)%.*$/gm, '');
const results = [];
function check(name, ok, detail) { results.push({name, ok:Boolean(ok), ...(detail ? {detail} : {})}); }
function number(s) { return Number(s.replace(/\./g, '').replace(',', '.')); }
const labels = [...clean.matchAll(/\\label\{([^}]+)\}/g)].map(m => m[1]);
const refs = [...clean.matchAll(/\\(?:ref|pageref)\{([^}]+)\}/g)].map(m => m[1]);
check('Unique labels', new Set(labels).size === labels.length);
check('Resolved source references', refs.every(r => labels.includes(r)), refs.filter(r => !labels.includes(r)));
const stack = [];
let balanced = true;
for (const m of clean.matchAll(/\\(begin|end)\{([^}]+)\}/g)) {
  if (m[1] === 'begin') stack.push(m[2]); else if (stack.pop() !== m[2]) balanced = false;
}
check('Balanced LaTeX environments', balanced && !stack.length);
const images = [...clean.matchAll(/\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/g)].map(m => m[1]).filter(p => !/[#\\]/.test(p));
check('Referenced image files exist', images.every(p => fs.existsSync(path.join(root, 'Docs', p))));
check('No replacement characters', !source.includes('\uFFFD'));
check('Main sections follow required order', /\\section\{Giới thiệu\}[\s\S]*\\section\{Thiết kế\}[\s\S]*\\section\{Triển khai\}[\s\S]*\\section\{Tổng kết\}/.test(clean));
const functions = clean.split('\\label{sec:chucnang}')[1].split('\\label{sec:congnghe}')[0];
const ids = [...functions.matchAll(/^([0-9]+) &/gm)].map(m => Number(m[1]));
check('Function IDs 1–10 appear once', ids.join(',') === '1,2,3,4,5,6,7,8,9,10');
const owners=new Map();
for (const [name, expected] of [['Nguyễn Quốc Thành',39.5],['Ngô Quốc Tuấn',39],['Nguyễn Gia Quốc Uy',41]]) {
  const block = clean.split('\\textbf{Phân công: '+name+'}')[1].split('\\end{tabularx}')[0];
  const hours = [...block.matchAll(/& ([0-9]+(?:,[0-9]+)?) \\\\/g)].map(m => number(m[1]));
  const total = hours.reduce((a,b) => a+b, 0);
  check('Hours: '+name, Math.abs(total-expected) < 0.001, {total, expected});
  for(const m of block.matchAll(/^(\d+) &/gm)) {
    const id=Number(m[1]);
    if(!owners.has(id))owners.set(id,new Set());
    owners.get(id).add(name);
  }
}
check('Each function has exactly one owner',owners.size===10 && [...owners.values()].every(set=>set.size===1));
const scores=[...clean.matchAll(/^\d & (?:Nguyễn Gia Quốc Uy|Nguyễn Quốc Thành|Ngô Quốc Tuấn) & ([\d,]+) & ([\d,]+) & ([\d,]+)/gm)];
check('Score totals',scores.length===3 && scores.every(m=>Math.abs(number(m[1])+number(m[2])-number(m[3]))<0.001));
const costs = [...clean.matchAll(/\\giathamkhao\{\d+\}\{\d+\}\{([\d.]+)\}/g)].map(m => number(m[1]));
check('Budget subtotals and total', costs.length === 8 && costs.slice(0,5).reduce((a,b)=>a+b,0) === 295178 && costs.slice(5).reduce((a,b)=>a+b,0) === 88500 && costs.reduce((a,b)=>a+b,0) === 383678);
const wireframes = images.filter(p=>p.includes('wireframes-room-instrument/clean/'));
check('Four original wireframe images', wireframes.length === 4 && wireframes.every(p => {
  const rel='Docs/'+p;
  try { return execFileSync('git',['hash-object',rel],{cwd:root,encoding:'utf8',windowsHide:true}).trim() === execFileSync('git',['rev-parse','HEAD:'+rel],{cwd:root,encoding:'utf8',windowsHide:true}).trim(); } catch { return false; }
}));
const logPath = path.join(root,'Docs/.build/proposal/16_24127261_24127542_24127581_PROPOSAL.log');
if (fs.existsSync(logPath)) {
  const log=fs.readFileSync(logPath,'utf8');
  check('No unresolved PDF references', !/undefined|Label\(s\) may have changed|Rerun to get/.test(log));
  check('No overflowing boxes', !/Overfull \\[hv]box/.test(log), log.match(/Overfull[^\r\n]*/g)||[]);
  check('Header height accommodates size 13', !/headheight is too small/.test(log));
}
if(process.argv[2]) {
  const xml=fs.readFileSync(process.argv[2],'utf8');
  const pages=[...xml.matchAll(/<page\b([^>]*)>([\s\S]*?)<\/page>/g)];
  check('PDF contains pages',pages.length>0,{count:pages.length});
  let bodyFonts=[], illegalFonts=[], badBounds=[];
  const fonts=new Map();
  for(const page of pages) {
    const pageNum=Number(page[1].match(/number="(\d+)"/)[1]);
    const pageHeight=Number(page[1].match(/height="(\d+)"/)[1]);
    const pageWidth=Number(page[1].match(/width="(\d+)"/)[1]);
    for(const f of page[2].matchAll(/<fontspec\b[^>]*id="(\d+)"[^>]*size="([\d.]+)"[^>]*family="([^"]+)"/g)) {
      fonts.set(f[1],{size:Number(f[2]),family:f[3]});
      if(!/TimesNewRoman|CM(?:R|MI|SY|EX)/.test(f[3])) illegalFonts.push(f[3]);
    }
    for(const t of page[2].matchAll(/<text\b[^>]*font="(\d+)"[^>]*>([\s\S]*?)<\/text>/g)) {
      const font=fonts.get(t[1]);
      const value=t[2].replace(/<[^>]+>/g,'').trim();
      // Lowered digits in CO2, SnO2 and NH3 are scientific notation.
      const subscript=font?.size===9 && /^[23]$/.test(value);
      if(pageNum>1 && font?.family.includes('TimesNewRoman') && !subscript) bodyFonts.push({page:pageNum,size:font.size,text:value.slice(0,60)});
    }
    for(const t of page[2].matchAll(/<text\b[^>]*top="(-?[\d.]+)"[^>]*left="(-?[\d.]+)"[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"/g)) {
      const [y,x,w,h]=t.slice(1).map(Number);
      if(x<0 || y<0 || x+w>pageWidth+2 || y+h>pageHeight+2) badBounds.push({page:pageNum,x,y,w,h});
    }
  }
  check('Body, tables and captions use size 13',bodyFonts.length>0 && bodyFonts.every(f=>f.size===13),bodyFonts.filter(f=>f.size!==13));
  check('Only Times New Roman text and math fonts',illegalFonts.length===0,[...new Set(illegalFonts)]);
  check('Text stays within page bounds',badBounds.length===0,badBounds);
  const sourceLinks=[...clean.matchAll(/\\giathamkhao\{(\d+)\}\{(\d+)\}/g)].map(m=>'https://shopee.vn/product/'+m[1]+'/'+m[2]);
  check('All eight price-source links embedded in PDF',sourceLinks.length===8 && sourceLinks.every(url=>xml.includes('href="'+url+'"')));
  const jointPage=pages.find(page=>page[2].includes('Các buổi làm chung dự kiến'));
  check('Joint-session heading stays with its list',Boolean(jointPage) && jointPage[2].includes('20/11:'));
}
if(process.argv[3]) {
  const bbox=fs.readFileSync(process.argv[3],'utf8');
  const lines=[...bbox.matchAll(/<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)"[^>]*>([\s\S]*?)<\/line>/g)];
  const i=lines.findIndex(m=>m[4].includes('>Không</word>'));
  const sample=lines.slice(i,i+5);
  check('Body baseline spacing is 13 × 1.15 TeX pt',i>=0 && sample.length===5 && sample.slice(1).every((m,j)=>Math.abs(Number(m[2])-Number(sample[j][2])-14.894)<0.02));
  check('Body paragraph is justified',sample.length===5 && sample.every(m=>Math.abs(Number(m[1])-85.039)<0.1 && Math.abs(Number(m[3])-510.26)<0.2));
}
if(process.argv[4]) {
  const text=fs.readFileSync(process.argv[4],'utf8');
  check('No unresolved placeholders in PDF', !/\?\?|CHÈN HÌNH|Logo HCMUS/.test(text));
  check('LED commitment and manual timeout included', text.includes('60 giây') && text.includes('cam kết thực hiện'));
}
console.log(JSON.stringify({passed:results.filter(r=>r.ok).length,total:results.length,results},null,2));
if(results.some(r=>!r.ok))process.exitCode=1;
