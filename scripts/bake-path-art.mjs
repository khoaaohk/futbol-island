// Bake the static chapter ink filters once, instead of rasterizing turbulence while phones scroll.
// Run against the dev app before changing the live SVG artwork: node scripts/bake-path-art.mjs
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require('/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const manifest={};mkdirSync('public/stories/paths/chapters',{recursive:true});
try{for(const [variant,width] of [['mobile',390],['desktop',1440]]){
 const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:2});
 await page.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-path-art-source','true');});
 await page.goto(process.env.FUTBOL_BASE_URL||'http://localhost:8092');await page.getByRole('button',{name:'Paths',exact:true}).click({timeout:90000});
 const tabs=page.getByRole('group',{name:'Choose a format'});await tabs.waitFor();
 for(const format of ['futsal','7v7','9v9','11v11']){
  await tabs.getByRole('button').filter({hasText:new RegExp(format,'i')}).click();await page.waitForTimeout(250);
  const art=await page.locator('[class*="levelMap"]>svg:has(defs)').evaluateAll(async nodes=>Promise.all(nodes.map(async node=>{
   const bounds=node.getBoundingClientRect(),clone=node.cloneNode(true);const originals=[node,...node.querySelectorAll('*')],copies=[clone,...clone.querySelectorAll('*')];
   originals.forEach((el,i)=>{const css=getComputedStyle(el);for(const property of ['fill','stroke','stroke-width','stroke-dasharray','stroke-linecap','mix-blend-mode'])copies[i].style.setProperty(property,css.getPropertyValue(property));});
   clone.removeAttribute('class');clone.style.cssText='';clone.setAttribute('xmlns','http://www.w3.org/2000/svg');clone.setAttribute('width',String(bounds.width));clone.setAttribute('height',String(bounds.height));
   const blob=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml'}),url=URL.createObjectURL(blob),img=new Image();img.src=url;await img.decode();const canvas=document.createElement('canvas');canvas.width=Math.round(bounds.width*2);canvas.height=Math.round(bounds.height*2);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);
   return{top:parseFloat(node.style.top),height:bounds.height,width:bounds.width,data:canvas.toDataURL('image/webp',.96).split(',')[1]};
  })));
  manifest[format]??=[];for(const [i,item] of art.entries()){const bytes=Buffer.from(item.data,'base64'),file=`ink-${createHash('sha256').update(bytes).digest('hex').slice(0,12)}.webp`;writeFileSync(`public/stories/paths/chapters/${file}`,bytes);manifest[format][i]??={top:item.top,height:item.height};manifest[format][i][variant]=`/stories/paths/chapters/${file}`;}console.log(format,variant,art.length);
 }
 await page.close();
}}finally{await browser.close();}
writeFileSync('lib/paths/pathArt.json',JSON.stringify(manifest,null,2)+'\n');
