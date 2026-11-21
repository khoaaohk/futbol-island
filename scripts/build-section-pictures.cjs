#!/usr/bin/env node
// Renders the text-free section pictures (lib/site/sectionImage.tsx SECTION_FILES) once into public/learn/sections/*.webp.
// Nov 20 2026 night (owner: "change these to light colors to match with the marketing side. also if these could animate that would
// be nice"): the drawing is ONE SVG implementation (SectionSvg), shown inline and animated on the Library; this script screenshots
// that same SVG in headless Chrome (embedded Inter, lib/site/fonts/inter/) at its exact size, then cwebp. Run after changing the
// drawing or its data:  node scripts/build-section-pictures.cjs [name-prefix ...]
// Needs cwebp (brew install webp) and Playwright's Chromium (or Chrome). Deterministic: same data, same files.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{execFileSync}=require('node:child_process');
const {root,L,render,React}=require('../tests/lib/tsLoad.cjs');process.chdir(root);
(async()=>{
 const {chromium}=require('playwright'),{SECTION_FILES,SectionSvg}=L('lib/site/sectionImage.tsx');
 const font=w=>fs.readFileSync(path.join(root,`lib/site/fonts/inter/Inter-${w}.ttf`)).toString('base64');
 const css=`@font-face{font-family:Inter;font-weight:600;src:url(data:font/ttf;base64,${font('SemiBold')})}@font-face{font-family:Inter;font-weight:800;src:url(data:font/ttf;base64,${font('ExtraBold')})}html,body{margin:0}svg{display:block}`;
 const outDir=path.join(root,'public/learn/sections'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'section-pics-'));fs.mkdirSync(outDir,{recursive:true});
 const only=process.argv.slice(2);
 const browser=await chromium.launch({args:['--mute-audio']}).catch(()=>chromium.launch({channel:'chrome',args:['--mute-audio']}));
 try{
  const page=await browser.newPage({deviceScaleFactor:1});
  for(const [file,draw,size] of SECTION_FILES){
   if(only.length&&!only.some(o=>file.startsWith(o)))continue;
   const svg=render(React.createElement(SectionSvg,{draw,size,label:file})).replace('<svg ',`<svg width="${size.width}" height="${size.height}" `);
   await page.setViewportSize(size);await page.setContent(`<!doctype html><style>${css}</style>${svg}`);await page.evaluate(()=>document.fonts.ready);
   const png=path.join(tmp,file.replace(/\.webp$/,'.png'));await page.locator('svg').screenshot({path:png});
   execFileSync('cwebp',['-quiet','-q','82','-m','6','-sharp_yuv',png,'-o',path.join(outDir,file)]);
   console.log(file,size.width+'x'+size.height,fs.statSync(path.join(outDir,file)).size,'bytes');
  }
 }finally{await browser.close();fs.rmSync(tmp,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exit(1);});
