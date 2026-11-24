// Shared by the tests/seo-*.cjs files added on the seo-extras branch (Nov 15 2026): transpile the REAL page and lib modules with
// TypeScript and run them in Node (no build), the same method as tests/seo-tools.cjs. CSS modules become class-name proxies.
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.join(__dirname,'..','..');
const cache=new Map();
const cssProxy=new Proxy({},{get:(_,k)=>typeof k==='string'?k:undefined});
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const req=id=>{
  if(id==='next/navigation')return {notFound:()=>{throw new Error('NEXT_NOT_FOUND');},usePathname:()=>'/',useSearchParams:()=>new URLSearchParams()};
  if(/\.css$/.test(id))return {__esModule:true,default:cssProxy};
  if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
  const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
  for(const f of [base,base+'.ts',base+'.tsx',base+'.json',path.join(base,'index.ts')])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
  throw new Error('Cannot resolve '+id+' from '+file);};
 new Function('exports','module','require',out)(mod.exports,mod,req);
 return mod.exports;
}
const L=rel=>load(path.join(root,rel));
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const {renderToStaticMarkup}=require('react-dom/server'),React=require('react');
const render=el=>renderToStaticMarkup(el);
/** Every <script type="application/ld+json"> in a rendered page, parsed. */
const ldOf=html=>[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
const typesOf=ld=>ld.flatMap(x=>[].concat(x['@type']));
module.exports={root,load,L,read,render,React,ldOf,typesOf};
