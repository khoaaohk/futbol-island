// Drinking (Oct 1 2026, user: "for the drinks, also add the [eating] part and add text"), in a MUTED browser with cue spies (see
// check-konbini-sfx-browser.cjs). Never plays sound: --mute-audio and the island's sound, music and voice settings off.
//  island drink machine: buy a hot cocoa → tray → reveal → Drink now: saved at once, then 4 sips (Sip!/Warm!/Cosy!/Ahh!) with the
//                        sip cue each, the "ahh", then the machine's "Glug glug!" result (frame strip);
//  Konbini: buy a sports drink from the fridge → Drink now: Sip!/Glug!/Power up!/Ahh!, sips, ahh, then the Yum! result (frame strip).
// usage: node scripts/check-konbini-drink-browser.cjs [--mobile|--desktop] [--reduced]   (shots → $KONBINI_SFX_SHOTS/drink)
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const OUT=(process.env.KONBINI_SFX_SHOTS||'/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/2d1cd48c-d9e3-4562-bda8-098283fe1c41/scratchpad/konbini-sfx')+'/drink';
const base=process.env.FUTBOL_BASE_URL||'http://localhost:8092';
const which=process.argv.includes('--mobile')?['phone']:process.argv.includes('--desktop')?['desktop']:['phone','desktop'];
const reducedRun=process.argv.includes('--reduced');
fs.mkdirSync(OUT,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function strip(browser,files,out,label){
 const page=await browser.newPage();const imgs=files.map(f=>'data:image/png;base64,'+fs.readFileSync(f).toString('base64'));
 const data=await page.evaluate(async({imgs,label})=>{const els=await Promise.all(imgs.map(src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=src;})));
  const h=360,ws=els.map(i=>Math.round(i.width*h/i.height)),c=document.createElement('canvas');c.width=ws.reduce((a,b)=>a+b+6,0);c.height=h+28;const g=c.getContext('2d');g.fillStyle='#14302a';g.fillRect(0,0,c.width,c.height);
  let x=0;els.forEach((i,k)=>{g.drawImage(i,x,28,ws[k],h);g.fillStyle='#fff1d3';g.font='bold 15px sans-serif';g.fillText(`${label} ${k}`,x+6,19);x+=ws[k]+6;});return c.toDataURL('image/png');},{imgs,label});
 fs.writeFileSync(out,Buffer.from(data.split(',')[1],'base64'));await page.close();
}
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--mute-audio']});const summary=[];
 try{for(const tag of which){const mobile=tag==='phone',name=tag+(reducedRun?'-reduced':'');
  const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?3:1,reducedMotion:reducedRun?'reduce':'no-preference'});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>{if(!/ChunkLoadError|Loading chunk|missing: http|error while hydrating/.test(e.message))errors.push(e.message);});
  await page.addInitScript(()=>{
   for(const [k,v] of Object.entries({'fi2-audio-mix':'4-50-v1','fi2-sound-muted':'true','fi2-music-enabled':'false','fi2-voice-enabled':'false','fi2-welcome-v1':'completed'}))localStorage.setItem(k,v);
   window.__sfxLog=[];let table;Object.defineProperty(window,'__konbiniSfx',{configurable:true,get:()=>table,set(t){table=t;for(const k of Object.keys(t)){const f=t[k];if(typeof f!=='function')continue;t[k]=(...a)=>{const ev=window.event;window.__sfxLog.push({cue:k,t:performance.now(),ev:ev?.type??null});return f(...a);};}}});
   window.__words=[];new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n instanceof HTMLElement&&n.dataset.konbiniBiteWord)window.__words.push(n.dataset.konbiniBiteWord);}).observe(document,{subtree:true,childList:true});
   if(sessionStorage.getItem('drink-seeded'))return;sessionStorage.setItem('drink-seeded','1');
   const runs={};for(let i=0;i<5;i++)runs['drink-test-grant-'+i]={game:'island',paid:20,reason:'test grant',at:1};
   localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,runs,spends:{},packs:[],best:{},attempts:{},visits:{}}));
  });
  const tap=async loc=>mobile?loc.tap():loc.click();
  /** Drink now → frames until the reveal is done drinking; returns {words,cues,frames}. */
  const drinkNow=async(prefix,stillOpen)=>{const t=await page.evaluate(()=>{window.__words.length=0;return performance.now();});await tap(page.locator('[data-konbini-eat]'));const frames=[];
   for(let i=0;i<16;i++){await wait(190);if(!(await page.locator('[data-konbini-reveal]').count()))break;const f=`${OUT}/${prefix}-${String(i).padStart(2,'0')}.png`;await page.screenshot({path:f});frames.push(f);
    if(stillOpen&&i>4&&!(await page.locator('[data-konbini-eating]').count()))break;}
   const cues=(await page.evaluate(()=>window.__sfxLog)).filter(c=>c.t>=t).map(c=>c.cue).filter(c=>c!=='click');return {words:await page.evaluate(()=>window.__words.slice()),cues,frames};};
  const out={viewport:name};
  // ---- Island drink machine: hot cocoa ----
  await page.goto(base+'/');await page.waitForFunction(()=>window.__fi2?.vending?.entries?.length,null,{timeout:120000});await wait(1500);
  await page.evaluate(()=>{const g=document.querySelector('[data-vending-go]');g.dataset.vending='drinksplaza';g.click();});
  await page.waitForSelector('[data-drink-machine]',{timeout:20000});await wait(900);
  const cocoa=page.locator('[data-vending-item^="drink-cocoa"]').first();await tap(cocoa);await wait(250);await tap(cocoa);
  await page.locator('[data-vending-tray=full]').waitFor({timeout:15000});await tap(page.locator('[data-vending-tray=full]'));
  await page.locator('[data-konbini-reveal][data-built=true]').waitFor({timeout:20000});await page.screenshot({path:`${OUT}/${name}-machine-reveal.png`});
  const m=await drinkNow(`${name}-machine`,true);await wait(1200);
  const status=await page.locator('[data-konbini-reveal] [role=status]').allTextContents();await page.screenshot({path:`${OUT}/${name}-machine-result.png`});
  await strip(browser,m.frames.filter((_,i)=>i%2===0).slice(0,8),`${OUT}/${name}-machine-strip.png`,'cocoa');
  out.machine={words:m.words,cues:m.cues,status:status.join(' ').slice(0,60)};
  assert.deepEqual(m.words,['Sip!','Warm!','Cosy!','Ahh!'],'hot cocoa: warm words');assert.equal(m.cues.filter(c=>c==='sip').length,4,'a sip sound each sip');
  assert(m.cues.indexOf('ahh')>m.cues.lastIndexOf('sip'),'ahh after the last sip');assert(/Glug glug/.test(out.machine.status),'then the machine’s result');
  // ---- Konbini: sports drink from the fridge ----
  await page.goto(base+'/konbini?door=main');await page.waitForFunction(()=>window.__konbini&&window.__konbini.state.draws>0,null,{timeout:60000});await wait(800);
  await page.evaluate(()=>window.__konbini.walkTo('drinks'));await page.waitForFunction(()=>window.__konbini.state.zoom?.arrived&&!window.__konbini.state.zooming,null,{timeout:20000});
  const slot=page.locator('[data-konbini-slot="drink-sports"]').first();await slot.waitFor({timeout:8000});await tap(slot);await tap(page.locator('[data-konbini-buy="drink-sports"]'));
  await page.locator('[data-konbini-reveal]:not([data-preview])[data-built=true]').waitFor({timeout:20000});
  const k=await drinkNow(`${name}-konbini`,false);await page.locator('[data-konbini-toast]').waitFor({timeout:8000});const toast=await page.locator('[data-konbini-toast]').textContent();
  await strip(browser,k.frames.filter((_,i)=>i%2===0).slice(0,8),`${OUT}/${name}-konbini-strip.png`,'sports drink');
  out.konbini={words:k.words,cues:k.cues,toast:toast.slice(0,50)};
  assert.deepEqual(k.words,['Sip!','Glug!','Power up!','Ahh!'],'sports drink words');assert.equal(k.cues.filter(c=>c==='sip').length,4);assert(k.cues.includes('ahh'));assert(/^Yum!/.test(toast),'then the usual result');
  out.errors=errors;assert.deepEqual(errors,[],'no page errors');summary.push(out);await ctx.close();}
  fs.writeFileSync(`${OUT}/summary${reducedRun?'-reduced':''}.json`,JSON.stringify(summary,null,1));console.log('KONBINI_DRINK_PASS',JSON.stringify(summary));
 }catch(e){console.error('KONBINI_DRINK_FAIL',e.message);process.exitCode=1;}finally{await browser.close();}
})();
