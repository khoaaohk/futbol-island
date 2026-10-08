// Bake the static chapter ink filters once, instead of rasterizing turbulence while phones scroll.
// Run against the dev app before changing the live SVG artwork: node scripts/bake-path-art.mjs
// WebP quality (Oct 7 2026): 0.85 by default (was 0.96: 2.2x the bytes for no visible gain). 0.80 was tried and rejected: the
// orange plates' square dot grid went blotchy (dots faded in 4x4 patches), visible at 1:1. Contact sheets and PSNR are in
// docs/performance-guide.md. PATH_ART_QUALITY=0.9 (or per file, PATH_ART_QUALITY_<format>_<variant>_<index>=0.9,
// e.g. PATH_ART_QUALITY_futsal_mobile_0) raises it where a plate shows banding. Names are sha256(bytes)[:12]: new bytes always get
// a new name (the files are cached immutable for a year) and lib/paths/pathArt.json is rewritten to point at them.
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const QUALITY=Number(process.env.PATH_ART_QUALITY||0.85),qualityFor=(format,variant,i)=>Number(process.env[`PATH_ART_QUALITY_${format}_${variant}_${i}`]||QUALITY);
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const manifest={};mkdirSync('public/stories/paths/chapters',{recursive:true});
try{for(const [variant,width] of [['mobile',390],['desktop',1440]]){
 const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:2});
 await page.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-path-art-source','true');});
 await page.goto(process.env.FUTBOL_BASE_URL||'http://localhost:8092');await page.getByRole('button',{name:'Paths',exact:true}).click({timeout:90000});
 const tabs=page.getByRole('group',{name:'Choose a format'});await tabs.waitFor();
 for(const format of ['futsal','7v7','9v9','11v11']){
  // Wait for the switch to commit (aria-pressed; it waits for art decode and a fade) and the chapters to stop moving: a fixed
  // 250 ms sometimes captured the previous format's layout, so a manifest entry's top/height and its desktop/mobile images disagreed.
  const tab=tabs.getByRole('button').filter({hasText:new RegExp(format,'i')});await tab.click();await page.waitForFunction(el=>el.getAttribute('aria-pressed')==='true',await tab.elementHandle(),{timeout:30000});
  await page.waitForFunction(()=>{const now=JSON.stringify([...document.querySelectorAll('[class*="levelMap"]>svg:has(defs)')].map(n=>[n.style.top,n.getBoundingClientRect().height]));const w=window;if(w.__bakeLast===now&&++w.__bakeSame>=5)return true;if(w.__bakeLast!==now){w.__bakeLast=now;w.__bakeSame=0;}return false;},null,{polling:200,timeout:30000});
  const qualities=Array.from({length:8},(_,i)=>qualityFor(format,variant,i));
  const art=await page.locator('[class*="levelMap"]>svg:has(defs)').evaluateAll(async(nodes,qualities)=>Promise.all(nodes.map(async(node,index)=>{
   const bounds=node.getBoundingClientRect(),clone=node.cloneNode(true);const originals=[node,...node.querySelectorAll('*')],copies=[clone,...clone.querySelectorAll('*')];
   originals.forEach((el,i)=>{const css=getComputedStyle(el);for(const property of ['fill','stroke','stroke-width','stroke-dasharray','stroke-linecap','mix-blend-mode'])copies[i].style.setProperty(property,css.getPropertyValue(property));});
   clone.removeAttribute('class');clone.style.cssText='';clone.setAttribute('xmlns','http://www.w3.org/2000/svg');clone.setAttribute('width',String(bounds.width));clone.setAttribute('height',String(bounds.height));
   const blob=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml'}),url=URL.createObjectURL(blob),img=new Image();img.src=url;await img.decode();const canvas=document.createElement('canvas');canvas.width=Math.round(bounds.width*2);canvas.height=Math.round(bounds.height*2);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);
   return{top:parseFloat(node.style.top),height:bounds.height,width:bounds.width,data:canvas.toDataURL('image/webp',qualities[index]).split(',')[1]};
  })),qualities);
  manifest[format]??=[];for(const [i,item] of art.entries()){if(manifest[format][i]&&(manifest[format][i].top!==item.top||manifest[format][i].height!==item.height))throw new Error(`${format} chapter ${i}: ${variant} layout ${item.top}/${item.height} differs from ${manifest[format][i].top}/${manifest[format][i].height}`);const bytes=Buffer.from(item.data,'base64'),file=`ink-${createHash('sha256').update(bytes).digest('hex').slice(0,12)}.webp`;writeFileSync(`public/stories/paths/chapters/${file}`,bytes);manifest[format][i]??={top:item.top,height:item.height};manifest[format][i][variant]=`/stories/paths/chapters/${file}`;}console.log(format,variant,art.length);
 }
 await page.close();
}}finally{await browser.close();}
writeFileSync('lib/paths/pathArt.json',JSON.stringify(manifest,null,2)+'\n');
