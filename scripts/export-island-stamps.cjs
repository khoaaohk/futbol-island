// Writes the eight Island stamp book stamps (lib/town/stampArt.ts) as standalone SVG files plus a contact sheet (index.html).
// usage: node scripts/export-island-stamps.cjs <out-dir>
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),out=path.resolve(process.argv[2]||path.join(base,'.stamps-out'));
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
fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><meta charset="utf-8"><title>Island stamps</title><body style="margin:0;background:#f6efdf;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;padding:24px">${STAMPS.map(s=>`<figure style="margin:0;transform:rotate(${(STAMPS.indexOf(s)%3-1)*3}deg)">${stampSvg(s.id,'x'+s.id)}<figcaption style="font:600 14px Arial;color:#333;text-align:center">${s.name}</figcaption></figure>`).join('')}</body>`);
console.log(`wrote ${STAMPS.length} stamps to ${out}`);
