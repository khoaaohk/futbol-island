#!/usr/bin/env node
// Renders the text-free section pictures (lib/site/sectionImage.tsx SECTION_FILES) once into public/learn/sections/*.webp
// (Nov 20 2026). Same element trees and renderer as the diagram route (next/og ImageResponse), with the embedded Inter
// (lib/site/imageFonts.ts), then cwebp. Run after changing the drawing or its data:  node scripts/build-section-pictures.cjs
// Needs cwebp (brew install webp). Deterministic: same data, same files.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),ts=require('typescript'),{execFileSync}=require('node:child_process');
const root=path.join(__dirname,'..');process.chdir(root);
const cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const mod={exports:{}};cache.set(file,mod);
 const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const req=id=>{
  if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
  const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
  for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
  throw new Error('Cannot resolve '+id+' from '+file);};
 new Function('exports','module','require',out)(mod.exports,mod,req);
 return mod.exports;
}
const L=rel=>load(path.join(root,rel));
(async()=>{
 const {ImageResponse}=require('next/og'),{SECTION_FILES}=L('lib/site/sectionImage.tsx'),{imageFonts}=L('lib/site/imageFonts.ts');
 const outDir=path.join(root,'public/learn/sections'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'section-pics-'));fs.mkdirSync(outDir,{recursive:true});
 const only=process.argv.slice(2);
 for(const [file,draw,size] of SECTION_FILES){
  if(only.length&&!only.some(o=>file.startsWith(o)))continue;
  const png=path.join(tmp,file.replace(/\.webp$/,'.png'));
  fs.writeFileSync(png,Buffer.from(await new ImageResponse(draw(size),{...size,fonts:imageFonts()}).arrayBuffer()));
  execFileSync('cwebp',['-quiet','-q','82','-m','6','-sharp_yuv',png,'-o',path.join(outDir,file)]);
  console.log(file,size.width+'x'+size.height,fs.statSync(path.join(outDir,file)).size,'bytes');
 }
 fs.rmSync(tmp,{recursive:true,force:true});
})().catch(e=>{console.error(e);process.exit(1);});
