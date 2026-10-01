// Konbini sounds, eating and indoor kick (Oct 1 2026), in a MUTED browser with cue spies. Never plays sound: Chrome runs with
// --mute-audio and the island's sound, music and voice settings are off; the spies wrap the Konbini cue table
// (window.__konbiniSfx) so a call is recorded even though the muted setting keeps it silent, with the DOM event it ran in.
//  island: walk to the Island Square Konbini, tap Enter → the island sound is NOT disposed under the click (it used to be closed
//          in the same tick, cutting the click), then the door slide → /konbini;
//  inside: the arrival chime cue on the first frame; an island-speed kick off a shelf (frame strip, path, hits, the store stays
//          intact, then asleep); Preview / Preview's Done / Buy / Eat now each click inside their tap; eating = 4 bites with
//          Chomp!/Yum!/Ooh!/Chomp! pops and the "ahh" (frame strip), then the Yum! result; the stamp card slide-out (portrait,
//          landscape, desktop) and its Done; the header Done clicks and walks you out.
// usage: node scripts/check-konbini-sfx-browser.cjs [--mobile|--desktop|--both] [--reduced]   (shots → $KONBINI_SFX_SHOTS)
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const OUT=process.env.KONBINI_SFX_SHOTS||'/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/2d1cd48c-d9e3-4562-bda8-098283fe1c41/scratchpad/konbini-sfx';
const base=process.env.FUTBOL_BASE_URL||'http://localhost:8092';
const which=process.argv.includes('--mobile')?['phone']:process.argv.includes('--desktop')?['desktop']:['phone','desktop'];
const reducedRun=process.argv.includes('--reduced');
const D={x:70.45,front:-53};
for(const d of ['','kick','eat','stamps'])fs.mkdirSync(`${OUT}/${d}`,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));

/** Composite frames into one horizontal strip PNG (drawn in a blank page: no image libraries). */
async function strip(browser,files,out,label){
 const page=await browser.newPage();const imgs=files.map(f=>'data:image/png;base64,'+fs.readFileSync(f).toString('base64'));
 const data=await page.evaluate(async({imgs,label})=>{const els=await Promise.all(imgs.map(src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=src;})));
  const h=360,ws=els.map(i=>Math.round(i.width*h/i.height)),c=document.createElement('canvas');c.width=ws.reduce((a,b)=>a+b+6,0);c.height=h+28;const g=c.getContext('2d');g.fillStyle='#14302a';g.fillRect(0,0,c.width,c.height);
  let x=0;els.forEach((i,k)=>{g.drawImage(i,x,28,ws[k],h);g.fillStyle='#fff1d3';g.font='bold 15px sans-serif';g.fillText(`${label} ${k}`,x+6,19);x+=ws[k]+6;});return c.toDataURL('image/png');},{imgs,label});
 fs.writeFileSync(out,Buffer.from(data.split(',')[1],'base64'));await page.close();
}

(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--mute-audio']});const summary=[];
 try{for(const tag of which){const mobile=tag==='phone';
  const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?3:1,reducedMotion:reducedRun?'reduce':'no-preference'});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>{if(!/ChunkLoadError|Loading chunk|missing: http|error while hydrating/.test(e.message))errors.push(e.message);});
  await page.addInitScript(({D})=>{
   // Muted, always: the island's sound, music and voice settings off before any script runs.
   for(const [k,v] of Object.entries({'fi2-audio-mix':'4-50-v1','fi2-sound-muted':'true','fi2-music-enabled':'false','fi2-voice-enabled':'false'}))localStorage.setItem(k,v);
   // Spy on the Konbini cue table the moment the sound module publishes it: record the cue, when, and the DOM event it ran in.
   window.__sfxLog=[];let table;Object.defineProperty(window,'__konbiniSfx',{configurable:true,get:()=>table,set(t){table=t;for(const k of Object.keys(t)){const f=t[k];if(typeof f!=='function')continue;t[k]=(...a)=>{const ev=window.event;window.__sfxLog.push({cue:k,t:performance.now(),ev:ev?.type??null,trusted:!!ev?.isTrusted});return f(...a);};}}});
   // Bite words as they appear (order), for the eat check.
   window.__words=[];new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n instanceof HTMLElement&&n.dataset.konbiniBiteWord)window.__words.push({w:n.dataset.konbiniBiteWord,t:performance.now(),anim:getComputedStyle(n).animationName});}).observe(document,{subtree:true,childList:true});
   if(sessionStorage.getItem('sfx-seeded'))return;sessionStorage.setItem('sfx-seeded','1');
   localStorage.setItem('fi2-welcome-v1','completed');
   const runs={};for(let i=0;i<5;i++)runs['sfx-test-grant-'+i]={game:'island',paid:20,reason:'test grant',at:1};
   localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,runs,spends:{},packs:[],best:{},attempts:{},visits:{}}));
   sessionStorage.setItem('fi2-arcade-departure-v1',JSON.stringify({version:1,x:D.x+2.2,z:D.front+3.3,yaw:Math.PI,ride:'walk',flightHeight:0}));
  },{D});
  const tap=async loc=>mobile?loc.tap():loc.click();
  const cues=()=>page.evaluate(()=>window.__sfxLog);
  const lastCue=async(name,since)=>(await cues()).filter(c=>c.cue===name&&c.t>=since);
  const now=()=>page.evaluate(()=>performance.now());
  const out={viewport:tag};
  // ---- 1. Island: Enter ----
  await page.goto(base+'/?from=konbini');await page.waitForFunction(()=>window.__fi2,null,{timeout:120000});await page.locator('[data-island-return-loading]').waitFor({state:'detached',timeout:60000});
  let shown=false;await page.keyboard.down('ArrowUp');for(let i=0;i<40&&!shown;i++){await wait(120);shown=await page.locator('[data-konbini-enter]').evaluate(b=>!b.hidden);}await page.keyboard.up('ArrowUp');
  assert(shown,'Enter prompt at the Konbini doors');await page.screenshot({path:`${OUT}/${tag}-1-island-enter.png`});
  const enter=page.locator('[data-konbini-enter]');
  // The Enter click runs under <main onClickCapture> (the island click); the island sound must outlive the click (≥ 95 ms).
  const viaCapture=await enter.evaluate(b=>!!b.closest('main.town-app')&&b.matches('button:not(:disabled)'));
  await tap(enter);const disposedSoon=await page.evaluate(()=>new Promise(r=>setTimeout(()=>r(window.__fi2?.sound?.disposed??null),90)));
  out.enter={underClickCapture:viaCapture,soundDisposedAt90ms:disposedSoon};assert(viaCapture,'Enter is an island sound button');assert.equal(disposedSoon,false,'the island sound is still alive 90 ms after Enter (the 95 ms click; reduced motion disposes at 120 ms) (the click plays out)');
  await page.waitForURL('**/konbini?door=main',{timeout:15000});
  // ---- 2. Inside: arrival chime ----
  await page.waitForFunction(()=>window.__konbini&&window.__konbini.state.draws>0,null,{timeout:60000});await wait(900);
  const arrive=await lastCue('arrive',0);out.arrival={arriveCues:arrive.length};assert.equal(arrive.length,1,'one arrival chime cue on the first frame');
  await page.screenshot({path:`${OUT}/${tag}-2-arrived.png`});
  // ---- 3. Kick: island speed, bounces off shelves and walls, the store intact, then asleep ----
  await page.waitForFunction(()=>window.__konbini.state.sleeping,null,{timeout:15000});
  const spot=await page.evaluate(()=>{const k=window.__konbini,s=k.debugShotSpots();return s.find(p=>p.fi>=0)??s[0];});
  await page.evaluate(s=>window.__konbini.debugPlace(s.x,s.z,s.yaw),spot);await page.waitForFunction(()=>window.__konbini.state.sleeping,null,{timeout:15000});
  const before=await page.evaluate(()=>window.__konbini.state.render);
  const shoot=page.locator('[data-konbini-action=shoot]');await shoot.waitFor();const k0=await now();await tap(shoot);
  // Every frame for 1.2 s, in the page: the peak ball speed (the screenshots below are too sparse to catch it).
  const peak=page.evaluate(()=>new Promise(r=>{let m=0;const t0=performance.now(),f=()=>{const a=window.__konbini.state.action;m=Math.max(m,Math.hypot(a.vx,a.vz));if(performance.now()-t0<1200)requestAnimationFrame(f);else r(m);};f();}));
  const frames=[],path=[];let strike=null;
  for(let i=0;i<14;i++){await wait(i<8?70:180);const st=await page.evaluate(()=>window.__konbini.state);path.push({x:+st.ball.x.toFixed(2),y:+st.ball.y.toFixed(2),z:+st.ball.z.toFixed(2),mode:st.action.mode,speed:+Math.hypot(st.action.vx,st.action.vz).toFixed(1),hits:st.action.hits,wobble:st.wobble});
   if(!strike&&st.action.mode==='shot')strike=path.at(-1);const f=`${OUT}/kick/${tag}-${String(i).padStart(2,'0')}.png`;await page.screenshot({path:f});frames.push(f);}
  await page.waitForFunction(()=>window.__konbini.state.action.mode==='feet',null,{timeout:15000});await page.waitForFunction(()=>window.__konbini.state.sleeping,null,{timeout:15000});
  const after=await page.evaluate(()=>window.__konbini.state);const kickCues=(await cues()).filter(c=>c.t>=k0).map(c=>c.cue);
  await strip(browser,frames.slice(0,10),`${OUT}/kick/${tag}-strip.png`,'kick');
  out.kick={maxSpeed:+(await peak).toFixed(1),hits:after.action.hits,wobbles:after.wobbles,cues:[...new Set(kickCues)],drawCallsBefore:before.calls,drawCallsAfter:after.render.calls,sleptAfter:after.sleeping,path:path.slice(0,8)};
  assert(out.kick.maxSpeed>=20,'island-speed kick indoors ('+out.kick.maxSpeed+' m/s)');assert(after.action.hits>=2,'bounces off the store ('+after.action.hits+' hits)');
  assert(kickCues.includes('kick')&&(kickCues.includes('thunk')||kickCues.includes('bounce')),'kick + impact cues');assert(path.every(p=>Math.abs(p.x)<7.8&&p.z>-6&&p.z<5.7&&p.y<3.3),'the ball stays in the store');
  assert.equal(after.render.calls,before.calls,'no extra draw calls (store intact, nothing knocked off)');assert(after.sleeping,'asleep again after the ball comes back');
  // ---- 4. Preview (click), its Done (click), Buy, Eat now (click) → eating ----
  await page.evaluate(()=>window.__konbini.walkTo('rice'));await page.waitForFunction(()=>window.__konbini.state.zoom?.arrived&&!window.__konbini.state.zooming,null,{timeout:20000});
  await tap(page.locator('[data-konbini-slot][data-kind=food]').first());const prev=page.locator('[data-konbini-preview]').first();await prev.waitFor();
  let t=await now();await tap(prev);let c=await lastCue('click',t);out.preview={click:c.length,ev:c[0]?.ev,trusted:c[0]?.trusted};assert(c.length===1&&c[0].ev==='click'&&c[0].trusted,'Preview clicks inside the tap');
  await page.locator('[data-konbini-reveal][data-preview][data-built=true]').waitFor({timeout:15000});await page.screenshot({path:`${OUT}/${tag}-3-preview.png`});
  t=await now();await tap(page.locator('[data-konbini-preview-back]'));c=await lastCue('click',t);out.previewDone={click:c.length,ev:c[0]?.ev};assert(c.length===1&&c[0].ev==='click','Preview Done clicks');
  await page.locator('[data-konbini-reveal]').waitFor({state:'detached'});
  await tap(page.locator('[data-konbini-buy]').first());
  await page.locator('[data-konbini-reveal]:not([data-preview])[data-built=true]').waitFor({timeout:20000});await page.screenshot({path:`${OUT}/${tag}-4-reveal.png`});
  t=await now();await page.evaluate(()=>{window.__words.length=0;});await tap(page.locator('[data-konbini-eat]'));c=await lastCue('click',t);assert(c.length===1&&c[0].ev==='click','Eat now clicks');
  const eatFrames=[];for(let i=0;i<16;i++){await wait(190);const f=`${OUT}/eat/${tag}${reducedRun?'-reduced':''}-${String(i).padStart(2,'0')}.png`;if(await page.locator('[data-konbini-reveal]').count()){await page.screenshot({path:f});eatFrames.push(f);}}
  await page.locator('[data-konbini-toast]').waitFor({timeout:8000});const toast=await page.locator('[data-konbini-toast]').textContent();
  const eatCues=(await cues()).filter(x=>x.t>=t).map(x=>x.cue).filter(x=>x!=='click');const words=await page.evaluate(()=>window.__words);
  await strip(browser,eatFrames.filter((_,i)=>i%2===0).slice(0,8),`${OUT}/eat/${tag}${reducedRun?'-reduced':''}-strip.png`,'eat');
  out.eat={words:words.map(w=>w.w),wordAnim:[...new Set(words.map(w=>w.anim))],cues:eatCues,toast};
  assert.deepEqual(words.map(w=>w.w),['Chomp!','Yum!','Ooh!','Chomp!'],'bite words in order');
  const bites=eatCues.filter(x=>x==='bite'||x==='sip').length,ahh=eatCues.indexOf('ahh');assert.equal(bites,4,'four bites');assert(ahh>eatCues.lastIndexOf('bite')&&ahh>=0,'ahh after the last bite');
  assert(/^Yum!/.test(toast),'then the usual Yum! result');assert(reducedRun?out.eat.wordAnim.every(a=>a==='none'):out.eat.wordAnim.some(a=>/biteWordPop/.test(a)),'word animation: '+out.eat.wordAnim);
  // ---- 5. Stamp card slide-out (from the cashier) ----
  await page.waitForFunction(()=>!window.__konbini.state.zoom&&!window.__konbini.state.zooming,null,{timeout:10000});
  await page.evaluate(()=>window.__konbini.walkTo('counter'));await page.locator('[data-npc-action^="My stamp card"]').waitFor({timeout:20000});await wait(500);
  t=await now();await tap(page.locator('[data-npc-action^="My stamp card"]'));c=await lastCue('click',t);assert(c.length>=1,'stamp card action clicks');
  const card=page.locator('dialog[data-konbini-stamp-card]');await card.waitFor({timeout:8000});await wait(700);
  const box=await card.locator('section').boundingBox();out.stamps={panel:box&&{x:Math.round(box.x),w:Math.round(box.width)},stamps:await card.locator('[data-konbini-stamp]').count(),shops:await card.locator('[data-konbini-stamp-shop]').count(),steps:await card.locator('[data-konbini-stamp-steps] li').count()};
  assert.equal(out.stamps.stamps,8);assert.equal(out.stamps.shops,2);assert.equal(out.stamps.steps,4);
  if(mobile)assert(box&&box.width>=389,'phone: full-width sheet like the NPC chat');else assert(box&&box.x+box.width>=1279&&box.width<=601,'desktop: right-side drawer like the NPC chat');
  await page.screenshot({path:`${OUT}/stamps/${tag}${mobile?'-portrait':''}.png`});
  await card.locator('section').evaluate(s=>s.scrollTo(0,s.scrollHeight));await wait(150);await page.screenshot({path:`${OUT}/stamps/${tag}${mobile?'-portrait':''}-scrolled.png`});
  if(mobile){await page.setViewportSize({width:844,height:390});await wait(500);const lb=await card.locator('section').boundingBox();out.stamps.landscape=lb&&{x:Math.round(lb.x),w:Math.round(lb.width)};await page.screenshot({path:`${OUT}/stamps/phone-landscape.png`});await page.setViewportSize({width:390,height:844});await wait(400);}
  t=await now();await tap(card.locator('button[data-navigation]'));c=await lastCue('click',t);assert(c.length===1&&c[0].ev==='click','stamp card Done clicks');await card.waitFor({state:'detached',timeout:3000}).catch(()=>{});
  await page.waitForFunction(()=>!document.querySelector('dialog[data-konbini-stamp-card]'),null,{timeout:5000}).catch(()=>{});
  // ---- 6. Header Done: click, then you walk out ----
  await page.evaluate(()=>{const k=window.__konbini;if(k.state.zoom)k.zoomOut();});await page.waitForFunction(()=>!window.__konbini.state.zoom&&!window.__konbini.state.zooming,null,{timeout:10000});await wait(300);
  const done=page.locator('header [data-konbini-done]');await done.waitFor();t=await now();await tap(done);c=await lastCue('click',t);out.done={click:c.length,ev:c[0]?.ev,trusted:c[0]?.trusted};
  assert(c.length===1&&c[0].ev==='click'&&c[0].trusted,'header Done clicks inside the tap');
  await page.waitForURL(u=>!/\/konbini/.test(String(u)),{timeout:20000});out.leftStore=true;
  out.errors=errors;assert.deepEqual(errors,[],'no page errors');summary.push(out);await ctx.close();}
  fs.writeFileSync(`${OUT}/summary${reducedRun?'-reduced':''}.json`,JSON.stringify(summary,null,1));console.log('KONBINI_SFX_PASS',JSON.stringify(summary.map(s=>({v:s.viewport,enter:s.enter,arrival:s.arrival,kick:{max:s.kick.maxSpeed,hits:s.kick.hits,wobbles:s.kick.wobbles,cues:s.kick.cues},preview:s.preview,done:s.done,eat:{words:s.eat.words,anim:s.eat.wordAnim,toast:s.eat.toast.slice(0,40)},stamps:s.stamps}))));
 }catch(e){console.error('KONBINI_SFX_FAIL',e.message);fs.writeFileSync(`${OUT}/summary-partial.json`,JSON.stringify(summary,null,1));process.exitCode=1;}finally{await browser.close();}
})();
