// Chapter pictures for the /books pages (Nov 17 2026, owner: "the web book should look like the one in the game"): a still of
// every chapter's 3D paper pop-up spread, made with the game's own reader on the dev-only /book-lab page (app/book-lab).
// For each book in lib/site/books.ts BOOK_IDS, each page: the spread settles, the page action is done `steps` times (the
// finished pose), the picture is screenshotted (1280×800, reduced motion so the action lands at once) and encoded with
// cwebp to public/books/spreads/<book>/<chapter>.webp at 960×600. components/site/books/BookParts.tsx shows them.
// Needs a dev server (`next dev`; /book-lab answers 404 in production), system Chrome and cwebp (brew install webp).
// usage: FUTBOL_BASE_URL=http://localhost:8097 [WORKERS=2] node scripts/capture-book-spreads.cjs [bookId ...]
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {root,L}=require('../tests/lib/tsLoad.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const BASE=process.env.FUTBOL_BASE_URL||'http://localhost:8097',CWEBP=process.env.CWEBP||'/opt/homebrew/bin/cwebp';
const OUT=path.join(root,'public/books/spreads'),W=960,H=600,Q=Number(process.env.QUALITY||72);
const {BOOK_IDS}=L('lib/site/books.ts'),{BOOKS}=L('lib/books/library.ts');
const only=process.argv.slice(2),ids=only.length?only:BOOK_IDS;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
/** Settled: no page turn running and no new frame drawn for 900 ms. */
async function settle(page,id){
 await page.waitForSelector(`[data-book-scene="${id}"][data-transition="idle"]`,{timeout:120000});
 let last=-1,same=0;for(let t=0;t<200&&same<6;t++){const n=await page.$eval('[data-book-scene]',e=>Number(e.dataset.renderCount));if(n>0&&n===last)same++;else same=0;last=n;await wait(150);}
 if(same<6)console.warn(`  ${id}: still drawing after 30 s; captured anyway`);
}
async function captureBook(ctx,id){
 const pages=BOOKS[id].pages,dir=path.join(OUT,id);fs.mkdirSync(dir,{recursive:true});
 const page=await ctx.newPage();let n=0;
 try{
  // A fresh load per page (?page=i): a page turn starts Coach Bella's narration, which moves the scene and does the action itself.
  for(const [i,p] of pages.entries()){
   await page.goto(`${BASE}/book-lab?book=${id}&page=${i}&shot`,{waitUntil:'domcontentloaded',timeout:180000});
   await settle(page,p.id);
   for(let k=0;k<(p.steps??1);k++){await page.$eval('[data-book-action]',b=>b.click());await wait(150);}
   const label=await page.$eval('[data-book-action]',b=>b.textContent||'');if(!/^Try the page again/.test(label))throw new Error(`${p.id}: the page action did not finish (${label})`);
   await settle(page,p.id);
   const png=path.join(dir,`${p.id}.png`);await page.locator('[data-book-scene]').screenshot({path:png});
   execFileSync(CWEBP,['-quiet','-q',String(Q),'-m','6','-resize',String(W),String(H),png,'-o',path.join(dir,`${p.id}.webp`)]);fs.unlinkSync(png);n++;
  }
  console.log(`${id}: ${n} spreads`);
 }finally{await page.close();}
 return n;
}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const failed=[],queue=[...ids];let count=0;
 try{
  const ctx=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1,reducedMotion:'reduce'});
  const worker=async()=>{for(let id;(id=queue.shift());){try{const n=await captureBook(ctx,id);count+=n;}catch(e){failed.push(id);console.error(`${id}: FAILED ${e.message.split('\n')[0]}`);}}};
  await Promise.all(Array.from({length:Number(process.env.WORKERS||2)},worker));
 }finally{await browser.close();}
 console.log(`capture-book-spreads: ${count} pictures in public/books/spreads${failed.length?`; failed: ${failed.join(', ')}`:''}`);
 if(failed.length)process.exit(1);
})();
