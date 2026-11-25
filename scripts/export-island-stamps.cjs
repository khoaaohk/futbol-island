// Writes the eight Island stamp book stamps (lib/town/stampArt.ts) as standalone SVG files plus a contact sheet (index.html).
// usage: node scripts/export-island-stamps.cjs <out-dir> [--png]   (--png: also renders sheet.png with headless Chrome, --mute-audio)
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),args=process.argv.slice(2),out=path.resolve(args.find(a=>!a.startsWith('--'))||path.join(base,'.stamps-out'));
const cache=new Map();
function load(file){
 for(const ext of ['','.ts','.tsx'])if(fs.existsSync(file+ext)&&fs.statSync(file+ext).isFile()){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 new Function('exports','module','require',code)(mod.exports,mod,id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id)):id.startsWith('@/')?load(path.join(base,id.slice(2))):require(id));
 cache.set(file,mod.exports);return mod.exports;}
const {stampSvg}=load(path.join(base,'lib/town/stampArt.ts')),{STAMPS}=load(path.join(base,'lib/town/islandStamps.ts'));
fs.mkdirSync(out,{recursive:true});
for(const s of STAMPS)fs.writeFileSync(path.join(out,`stamp-${s.id}.svg`),stampSvg(s.id));
const sizes=STAMPS.map(s=>`${s.id} ${(stampSvg(s.id).length/1024).toFixed(1)} KB`);
fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><meta charset="utf-8"><title>Island stamps</title><body style="margin:0;background:#f6efdf;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;padding:24px;width:1252px">${STAMPS.map(s=>`<figure style="margin:0;transform:rotate(${(STAMPS.indexOf(s)%3-1)*3}deg)"><div style="mix-blend-mode:multiply;opacity:.93">${stampSvg(s.id,'x'+s.id,'24.11.26')}</div><figcaption style="font:600 14px Arial;color:#333;text-align:center">${s.name}</figcaption></figure>`).join('')}</body>`);
console.log(`wrote ${STAMPS.length} stamps to ${out}: ${sizes.join(', ')}`);
if(args.includes('--png'))(async()=>{const {chromium}=require('playwright');const b=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio']});
 try{const p=await b.newPage({viewport:{width:1300,height:700},deviceScaleFactor:1.5});await p.goto('file://'+path.join(out,'index.html'));await p.waitForTimeout(600);
  await p.screenshot({path:path.join(out,'sheet.png'),fullPage:true});console.log('wrote sheet.png');}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
