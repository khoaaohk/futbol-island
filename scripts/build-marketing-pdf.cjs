#!/usr/bin/env node
// Builds public/marketing/futbol-island-overview.pdf (Nov 4 2026, owner: the investor overview behind the unlisted /marketing page)
// from the print page /marketing/overview (app/(site)/marketing/overview/page.tsx). Nov 4 redesign: a 16:9 landscape deck, 1280 x 720 CSS px
// per page (13.33 x 7.5 in, the standard slide size); each slide draws its own running footer and page number.
//
//   node scripts/build-marketing-pdf.cjs                 starts its own `next dev` on port 8451 (NEXT_DIST_DIR=.next-mk), prints,
//                                                       then stops that server by port and removes .next-mk
//   node scripts/build-marketing-pdf.cjs --url http://localhost:3000   prints from a server that is already running (left alone)
//
// Size: every still is re-encoded in the page as a JPEG at about 2x its printed size before printing (Chrome embeds JPEG data as is,
// while a WebP is stored as deflated pixels), which keeps the PDF under 15 MB with every picture large and sharp (rendered at device scale 2). Commit the PDF after a content change.
const {spawn,execSync}=require('node:child_process');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.join(__dirname,'..');
const OUT=path.join(root,'public/marketing/futbol-island-overview.pdf');
const PORT=8451,DIST='.next-mk';
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const argUrl=(()=>{const i=process.argv.indexOf('--url');return i>0?process.argv[i+1]:null;})();
const base=argUrl||`http://localhost:${PORT}`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const killPort=()=>{try{execSync(`lsof -ti :${PORT} | xargs kill`,{stdio:'ignore'});}catch{}};

async function waitFor(url,ms=180000){
 const end=Date.now()+ms;
 while(Date.now()<end){try{const r=await fetch(url);if(r.ok)return;}catch{}await sleep(1000);}
 throw new Error('server did not answer: '+url);
}

(async()=>{
 let server=null;
 if(!argUrl){
  if((()=>{try{execSync(`lsof -ti :${PORT}`,{stdio:'pipe'});return true;}catch{return false;}})())throw new Error(`port ${PORT} is busy`);
  server=spawn(path.join(root,'node_modules/.bin/next'),['dev','-p',String(PORT)],{cwd:root,env:{...process.env,NEXT_DIST_DIR:DIST,NEXT_TELEMETRY_DISABLED:'1'},stdio:'ignore'});
 }
 let browser=null;
 try{
  await waitFor(base+'/marketing/overview');
  browser=await chromium.launch({executablePath:CHROME,args:['--mute-audio']});
  const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:2});
  await page.goto(base+'/marketing/overview',{waitUntil:'networkidle',timeout:120000});
  await page.emulateMedia({media:'print'});
  // print the deck alone: the reading layout's header, main padding and footer would add blank pages
  await page.evaluate(()=>{const d=document.querySelector('[data-marketing-doc]');d.style.margin='0';document.body.replaceChildren(d);});
  await page.evaluate(async()=>{
   await document.fonts.ready;
   const imgs=[...document.querySelectorAll('[data-marketing-doc] img')];
   await Promise.all(imgs.map(i=>i.complete?null:new Promise(r=>{i.onload=i.onerror=r;})));
   for(const img of imgs){
    if(!img.naturalWidth)continue;
    const box=img.getBoundingClientRect(),scale=Math.min(1,(2*Math.max(box.width,box.height*img.naturalWidth/img.naturalHeight))/img.naturalWidth);
    const c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*scale);c.height=Math.round(img.naturalHeight*scale);
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    const url=c.toDataURL('image/jpeg',.82);img.removeAttribute('srcset');img.src=url;
    await img.decode().catch(()=>{});
   }
  });
  const feat=await page.evaluate(()=>({total:+document.querySelector('[data-marketing-doc]').dataset.featuresTotal,shown:new Set([...document.querySelectorAll('[data-feature]')].map(e=>e.dataset.feature)).size}));
  if(feat.shown!==feat.total)throw new Error(`only ${feat.shown} of ${feat.total} features are in the deck`);
  const over=await page.evaluate(()=>[...document.querySelectorAll('[data-marketing-doc] section *')].filter(e=>{const s=e.closest('section').getBoundingClientRect(),b=e.getBoundingClientRect();return b.width&&!e.children.length&&(e.textContent||'').trim()&&(b.bottom>s.bottom-40||b.right>s.right+1)&&!e.closest('footer');}).map(e=>(e.textContent||'').slice(0,40)));
  if(over.length)console.warn('WARNING: text past the slide edge or into the footer: '+over.slice(0,8).join(' | '));
  const missing=await page.evaluate(()=>[...document.querySelectorAll('[data-marketing-doc] img')].filter(i=>!i.naturalWidth).map(i=>i.alt));
  if(missing.length)throw new Error('images failed to load: '+missing.join(', '));
  fs.mkdirSync(path.dirname(OUT),{recursive:true});
  await page.pdf({path:OUT,width:'1280px',height:'720px',printBackground:true,preferCSSPageSize:true,margin:{top:'0',bottom:'0',left:'0',right:'0'}});
  const buf=fs.readFileSync(OUT),pages=(buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)||[]).length;
  console.log(`wrote ${path.relative(root,OUT)}: ${(buf.length/1e6).toFixed(2)} MB, ${pages} pages, ${feat.shown}/${feat.total} features`);
  if(buf.length>15e6)console.warn('WARNING: over 15 MB');
 }finally{
  if(browser)await browser.close();
  if(server){server.kill('SIGTERM');killPort();await sleep(500);fs.rmSync(path.join(root,DIST),{recursive:true,force:true});}
 }
})().catch(e=>{console.error(e.message||e);process.exitCode=1;});
