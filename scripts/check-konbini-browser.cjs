// Walk-in Konbini browser check (Sep 29 2026). For each store door (Island Square, Coral Cay):
//  island: walk up to the sliding doors, Enter (door slide) → /konbini;
//  inside: island unloaded, idle scene asleep, music respects the muted settings (scripts never play sound), dribble the ball down an aisle (frame strip),
//          a kick key only nudges, zoom into every section type (in-world shelf zoom, ← →), open a magazine from the zoomed
//          table, buy three musubi from the zoomed rice case (receipt, layered reveal frame strip, save one, eat one), hit the
//          daily limit, buy a ball on the gear shelf, talk to the cashier in the NPC slide-out;
//  exit: back outside the same doors facing out, island rendering, music gone; eat the saved snack from the backpack and replay
//        a reveal from the Konbini Collection. Coins drop by exactly one charge per purchase.
// usage: node scripts/check-konbini-browser.cjs [--mobile] [--door=main|cay] [--flight]
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const OUT=process.env.KONBINI_SHOTS||'/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/2d1cd48c-d9e3-4562-bda8-098283fe1c41/scratchpad/konbini';
const base=process.env.FUTBOL_BASE_URL||'http://localhost:8092';
const mobile=process.argv.includes('--mobile'),tag=mobile?'phone':'desktop',flight=process.argv.includes('--flight');
const doors=(process.argv.find(a=>a.startsWith('--door='))?.slice(7)??'main,cay').split(',');
const DOORS={main:{x:70.45,front:-53,bx:71,bz:-58},cay:{x:523.45,front:-178,bx:524,bz:-182.5}};
for(const d of ['','food','reveal','zoom','dribble','highlight'])fs.mkdirSync(`${OUT}/${d}`,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));let lastPage=null;
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--mute-audio','--autoplay-policy=no-user-gesture-required']});const summary=[];
 try{for(const door of doors){
  const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?3:1});
  const page=await ctx.newPage(),errors=[];lastPage=page;page.on('pageerror',e=>{if(!/ChunkLoadError|Loading chunk|missing: http|error while hydrating/.test(e.message))errors.push(e.message);});// dev-server HMR noise from other agents' live edits is not a page error
  const D=DOORS[door];
  await page.addInitScript(({D,flight})=>{
   if(sessionStorage.getItem('konbini-test-seeded'))return;sessionStorage.setItem('konbini-test-seeded','1');
   localStorage.setItem('fi2-welcome-v1','completed');
   // Never sound on the user's speakers (bug audit hygiene): audio stays muted and the browser runs with --mute-audio.
   for(const [k,v] of Object.entries({'fi2-audio-mix':'4-50-v1','fi2-sound-muted':'true','fi2-music-enabled':'false','fi2-voice-enabled':'false'}))localStorage.setItem(k,v);
   const runs={};for(let i=0;i<5;i++)runs['konbini-test-grant-'+i]={game:'island',paid:20,reason:'test grant',at:1};
   localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,runs,spends:{},packs:[],best:{},attempts:{},visits:{}}));
   // On foot 3.3 m out on the line the Up key walks (the island camera looks along −16,−33); or flying above the store.
   sessionStorage.setItem('fi2-arcade-departure-v1',JSON.stringify(flight?{version:1,x:D.bx+6,z:D.bz+12,yaw:Math.PI,ride:'jetpack',flightHeight:14}:{version:1,x:D.x+2.2,z:D.front+3.3,yaw:Math.PI,ride:'walk',flightHeight:0}));
  },{D,flight});
  const tap=async loc=>mobile?loc.tap():loc.click();
  const balance=()=>page.evaluate(()=>{const w=JSON.parse(localStorage.getItem('fi2-arcade-wallet-v1'));return Object.values(w.runs).reduce((n,r)=>n+r.paid,0)-Object.values(w.spends??{}).reduce((n,s)=>n+s.cost,0);});
  // ---- Island: walk (or fly) to the doors ----
  await page.goto(base+'/?from=konbini');await page.waitForFunction(()=>window.__fi2,null,{timeout:120000});await page.locator('[data-island-return-loading]').waitFor({state:'detached',timeout:60000});
  const promptSel=door==='main'?'[data-konbini-enter]':'[data-caykonbini-enter]';let shown=false;
  if(flight){await page.waitForTimeout(1200);
   if(!mobile){const pt=await page.evaluate(({bx,bz})=>{const f=window.__fi2,v=new (f.camera.position.constructor)(bx,2.5,bz);v.project(f.camera);const r=f.renderer.domElement.getBoundingClientRect();return {x:r.left+(v.x+1)/2*r.width,y:r.top+(1-v.y)/2*r.height};},D);await page.mouse.move(pt.x,pt.y);await page.mouse.move(pt.x+2,pt.y+1);}
   for(let i=0;i<30&&!shown;i++){await wait(150);shown=await page.locator(promptSel).evaluate(b=>!b.hidden);}
   const glow=await page.evaluate(()=>window.__fi2.scene.getObjectsByProperty('name','building-outline-glow').filter(o=>o.visible).length);
   await page.screenshot({path:`${OUT}/highlight/${door}-${tag}-flying.png`});assert(shown,`${door}: Enter shows while flying near`);assert(glow>=1,'the shared building highlight is on');
   await tap(page.locator(promptSel));await page.waitForURL(`**/konbini?door=${door}`,{timeout:15000});await page.waitForFunction(()=>window.__konbini,null,{timeout:60000});
   summary.push({door,viewport:tag,flight:true,glow});await ctx.close();continue;}
  await page.keyboard.down('ArrowUp');for(let i=0;i<40&&!shown;i++){await wait(120);shown=await page.locator(promptSel).evaluate(b=>!b.hidden);}await page.keyboard.up('ArrowUp');
  const at=await page.evaluate(()=>({x:window.__fi2.location.x,z:window.__fi2.location.z}));
  assert(shown,`${door}: Enter prompt shows at the doors (at ${at.x.toFixed(1)},${at.z.toFixed(1)})`);
  await page.screenshot({path:`${OUT}/${door}-${tag}-1-doors.png`});await page.screenshot({path:`${OUT}/highlight/${door}-${tag}-walking.png`});
  await tap(page.locator(promptSel));await page.waitForTimeout(150);await page.screenshot({path:`${OUT}/${door}-${tag}-2-door-slide.png`});
  await page.waitForURL(`**/konbini?door=${door}`,{timeout:15000});
  // ---- Inside ----
  await page.addScriptTag({content:'window.__raf=0;const r=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=f=>{window.__raf++;return r(f);};'});
  await page.waitForFunction(()=>window.__konbini,null,{timeout:60000});await page.waitForTimeout(1600);
  const inside=await page.evaluate(()=>({island:typeof window.__fi2,state:window.__konbini.state}));
  assert.equal(inside.island,'undefined','the island is unloaded while inside (document boundary)');assert.equal(inside.state.shop,door);
  await page.waitForFunction(()=>window.__konbini.state.sleeping,null,{timeout:8000});const raf0=await page.evaluate(()=>window.__raf);await page.waitForTimeout(2000);const idleRaf=await page.evaluate(()=>window.__raf)-raf0;
  assert.equal(idleRaf,0,'idle Konbini schedules no frames (asleep)');
  await page.mouse.click(5,400);const music=await page.evaluate(()=>window.__konbiniMusic.debug);assert(music.muted&&!music.playing&&music.starts===0,'store music respects the muted setting: '+JSON.stringify(music));
  await page.screenshot({path:`${OUT}/${door}-${tag}-3-inside.png`});
  // Dribble up the aisle with the ball at your feet (frame strip); a kick key only nudges.
  await page.keyboard.down('ArrowUp');for(let k=0;k<4;k++){await page.waitForTimeout(260);await page.screenshot({path:`${OUT}/dribble/${door}-${tag}-${k}.png`});}await page.keyboard.up('ArrowUp');
  const dr=await page.evaluate(()=>window.__konbini.state);assert(Math.hypot(dr.ball.x-dr.x,dr.ball.z-dr.z)<.9,'the ball stays at the player’s feet');assert(dr.ball.visible);
  await page.keyboard.press('Space');await page.locator('[data-konbini-toast]').waitFor();assert(/gently/.test(await page.locator('[data-konbini-toast]').textContent()),'kicks are disabled indoors (nudge)');
  const start=await balance();
  // In-world zoom: every section type, stepping with the arrows.
  await page.evaluate(()=>window.__konbini.walkTo('drinks'));await page.waitForFunction(()=>window.__konbini.state.zoom?.arrived&&!window.__konbini.state.zooming,null,{timeout:20000});
  const seen=new Set();for(let i=0;i<40;i++){const z=await page.evaluate(()=>window.__konbini.state.zoom);if(!seen.has(z.poi)){seen.add(z.poi);await page.screenshot({path:`${OUT}/zoom/${door}-${tag}-${z.poi}.png`});
    const sizes=await page.locator('[data-konbini-slot]').evaluateAll(bs=>bs.map(b=>b.getBoundingClientRect().width));assert(sizes.every(s=>s>=44),'tap targets ≥ 44 px');}
   const next=page.locator('[data-konbini-next]');if(await next.isDisabled())break;await tap(next);await page.waitForFunction(()=>window.__konbini.state.zoom?.arrived&&!window.__konbini.state.zooming,null,{timeout:8000});}
  for(const p of ['drinks','rice','snacks','gear','hot','counter','magazines'])assert(seen.has(p),`zoomed into ${p}`);
  await tap(page.locator('[data-konbini-back]'));await page.waitForFunction(()=>!window.__konbini.state.zoom,null,{timeout:8000});
  // Magazine from the zoomed table: it lifts toward the camera and its lesson opens.
  await page.evaluate(()=>window.__konbini.walkTo('magazines'));await page.waitForFunction(()=>window.__konbini.state.zoom?.arrived&&!window.__konbini.state.zooming,null,{timeout:20000});
  await tap(page.locator('[data-konbini-slot][data-kind=magazine]').first());await page.waitForTimeout(200);await page.screenshot({path:`${OUT}/zoom/${door}-${tag}-magazine-lift.png`});
  await page.locator('[data-konbini-lesson]').waitFor({timeout:8000});await tap(page.locator('[data-konbini-answer]').first());await page.screenshot({path:`${OUT}/${door}-${tag}-6-magazine.png`});
  await tap(page.locator('[data-konbini-panel] button[data-navigation]').first());
  // Buy three musubi from the zoomed rice case.
  const zoomTo=async poi=>{await page.evaluate(()=>{const k=window.__konbini;if(k.state.zoom)k.zoomOut();});await page.waitForFunction(()=>!window.__konbini.state.zoom,null,{timeout:8000});await page.evaluate(p=>window.__konbini.walkTo(p),poi);await page.waitForFunction(()=>window.__konbini.state.zoom?.arrived&&!window.__konbini.state.zooming,null,{timeout:20000});};
  const findSlot=async(prefix,skip)=>{for(let i=0;i<8;i++){const ids=await page.locator(`[data-konbini-slot^="${prefix}"]`).evaluateAll(bs=>bs.map(b=>b.dataset.konbiniSlot));const id=ids.find(x=>!skip.includes(x));if(id)return id;const n=page.locator('[data-konbini-next]');if(await n.isDisabled())break;await tap(n);await page.waitForFunction(()=>window.__konbini.state.zoom?.arrived&&!window.__konbini.state.zooming,null,{timeout:8000});}return null;};
  await zoomTo('rice');let spent=0;const bought=[];
  for(let i=0;i<3;i++){const id=await findSlot('musubi-',bought);assert(id,'a musubi on the zoomed rice case');bought.push(id);
   await tap(page.locator(`[data-konbini-slot="${id}"]`).first());await page.locator(`[data-konbini-tag="${id}"]`).waitFor();if(i===0)await page.screenshot({path:`${OUT}/zoom/${door}-${tag}-tag.png`});
   const price=+(await page.locator(`[data-konbini-buy="${id}"]`).textContent()).match(/(\d+) coins/)[1];
   if(process.env.DEBUG)console.log('buy',i,id,price,await page.locator(`[data-konbini-buy="${id}"]`).evaluate(b=>({disabled:b.disabled,text:b.textContent,r:b.getBoundingClientRect().toJSON()})));
   if(i===0)await page.locator(`[data-konbini-buy="${id}"]`).evaluate(b=>{b.click();b.click();});else await tap(page.locator(`[data-konbini-buy="${id}"]`));
   await page.locator('[data-konbini-receipt],[data-konbini-reveal]').first().waitFor({timeout:8000});if(i===0)await page.screenshot({path:`${OUT}/${door}-${tag}-8-receipt.png`});
   // Code review finding 1: a second tap ~200 ms later, during the receipt (a fresh purchase id), and a held Enter are both ignored.
   if(i===0){await page.waitForTimeout(200);const b=page.locator(`[data-konbini-buy="${id}"]`);if(await b.count()){assert(await b.isDisabled(),'Buy stays disabled through the receipt');await b.evaluate(el=>{el.removeAttribute('disabled');el.click();});}
    await page.evaluate(()=>{for(let k=0;k<3;k++)window.dispatchEvent(new KeyboardEvent('keydown',{code:'Enter',key:'Enter',repeat:k>0,bubbles:true}));});}
   await page.locator(`[data-konbini-reveal="${id}"]`).waitFor({timeout:8000});spent+=price;
   if(i===0)for(const [k,ms] of [[0,120],[1,280],[2,380],[3,380],[4,500]]){await page.waitForTimeout(ms);await page.screenshot({path:`${OUT}/reveal/${door}-${tag}-${id}-frame${k}.png`});}
   await page.locator('[data-konbini-reveal][data-built=true]').waitFor({timeout:8000});
   if(i===0){await tap(page.locator('[data-konbini-save]'));await page.locator('[data-konbini-reveal] [role=status]').waitFor();await page.screenshot({path:`${OUT}/reveal/${door}-${tag}-saved.png`});await tap(page.locator('[data-konbini-done]'));
    assert(await page.evaluate(()=>!!window.__konbini.state.zoom),'back on the zoomed shelf after the reveal');}
   else if(i===1){await tap(page.locator('[data-konbini-eat]'));await page.waitForTimeout(1300);await page.screenshot({path:`${OUT}/food/${door}-${tag}-eating.png`});
    assert(await page.evaluate(()=>window.__konbini.state.eating),'bite animation plays');await page.waitForFunction(()=>!window.__konbini.state.eating,null,{timeout:8000});await zoomTo('rice');}
   else await tap(page.locator('[data-konbini-done]'));
  }
  assert.equal(await balance(),start-spent,`coins charged exactly once per purchase (${spent})`);
  // Daily limit: Buy is disabled, kindly.
  await tap(page.locator('[data-konbini-slot][data-kind=food]').first());assert(/Fuelled up/.test(await page.locator('[data-konbini-buy]').textContent()),'fuelled up for today');
  await page.screenshot({path:`${OUT}/food/${door}-${tag}-fuelled-up.png`});
  // A ball on the gear shelf goes through the vending ledger (owned once).
  await zoomTo('gear');const ball=page.locator('[data-konbini-slot^="ball:"]').first(),ballId=await ball.getAttribute('data-konbini-slot');
  await tap(ball);const before=await balance();await tap(page.locator(`[data-konbini-buy-gear="${ballId}"]`));await page.locator('[data-konbini-message]').waitFor({timeout:8000});
  await tap(page.locator(`[data-konbini-slot="${ballId}"]`).first());assert.equal(await page.locator(`[data-konbini-buy-gear="${ballId}"]`).textContent(),'Owned');const ballCost=before-await balance();assert.equal(ballCost,20,'a regular ball at its catalog price');
  // Cashier: the island's NPC slide-out.
  await page.evaluate(()=>{const k=window.__konbini;if(k.state.zoom)k.zoomOut();});await page.waitForFunction(()=>!window.__konbini.state.zoom,null,{timeout:8000});
  await page.evaluate(()=>window.__konbini.walkTo('counter'));const dlg=page.locator('dialog[open][aria-labelledby=npc-conversation-title]');await dlg.waitFor({timeout:20000});await page.waitForTimeout(500);
  await tap(dlg.locator('[role=group] button').first());await page.waitForTimeout(900);await page.screenshot({path:`${OUT}/${door}-${tag}-7-cashier-slideout.png`});
  await tap(dlg.getByRole('button',{name:'Done'}).first());await page.waitForTimeout(500);
  // ---- Exit through the doors ----
  await page.evaluate(()=>{const k=window.__konbini;if(k.state.zoom)k.zoomOut();});await page.waitForFunction(()=>!window.__konbini.state.zoom,null,{timeout:8000});
  await tap(page.getByRole('button',{name:'Done'}));await page.waitForURL(/\/\?from=konbini/,{timeout:20000});
  await page.waitForFunction(()=>window.__fi2,null,{timeout:120000});await page.locator('[data-island-return-loading]').waitFor({state:'detached',timeout:60000});await page.waitForTimeout(600);
  const back=await page.evaluate(()=>{const f=window.__fi2,a=f.renderer.info.render.frame;return new Promise(r=>setTimeout(()=>r({x:f.location.x,z:f.location.z,yaw:f.player.root.rotation.y,ride:f.rideRef.current,framesAdvanced:f.renderer.info.render.frame-a,konbiniMusic:typeof window.__konbiniMusic}),800));});
  assert(Math.abs(back.x-D.x)<1.2&&back.z>D.front+1&&back.z<D.front+4,`${door}: back outside the same doors (${back.x.toFixed(2)},${back.z.toFixed(2)})`);
  assert(Math.abs(Math.atan2(Math.sin(back.yaw),Math.cos(back.yaw)))<.6,'facing out');assert.equal(back.ride,'walk');assert(back.framesAdvanced>0,'the island renders again');assert.equal(back.konbiniMusic,'undefined','no store music outside');
  await page.screenshot({path:`${OUT}/${door}-${tag}-9-back-outside.png`});
  // ---- Backpack: eat the saved snack outside, then replay a reveal from the Konbini Collection ----
  const pt=await page.evaluate(()=>{const f=window.__fi2,v=f.player.root.position.clone();v.y+=1;v.project(f.camera);const r=f.renderer.domElement.getBoundingClientRect();return {x:r.left+(v.x+1)/2*r.width,y:r.top+(1-v.y)/2*r.height};});
  if(mobile)await page.touchscreen.tap(pt.x,pt.y);else await page.mouse.click(pt.x,pt.y);
  await page.getByRole('button',{name:'Backpack',exact:true}).first().click({timeout:15000});
  await tap(page.locator('[data-backpack-filter=snack]'));const snack=page.locator('[data-backpack-item^="snack:"]').first();await snack.waitFor({timeout:10000});
  await tap(snack);await page.waitForFunction(()=>/Yum/.test(document.querySelector('[data-backpack] [role=status]')?.textContent??''));
  await page.screenshot({path:`${OUT}/food/${door}-${tag}-eat-from-backpack.png`});
  await tap(page.locator('[data-backpack-filter=konbini]'));await page.locator('[data-konbini-collection]').waitFor();await page.screenshot({path:`${OUT}/reveal/${door}-${tag}-collection.png`});
  const progress=await page.locator('[data-konbini-progress]').textContent();assert(/3\/\d+/.test(progress),'three items collected: '+progress);
  await tap(page.locator('[data-konbini-collected]').first());await page.locator('[data-konbini-reveal][data-built=true]').waitFor({timeout:8000});await page.screenshot({path:`${OUT}/reveal/${door}-${tag}-replay.png`});
  assert.deepEqual(errors,[],errors.join('\n'));
  summary.push({door,viewport:tag,insideRender:inside.state.render,idleRafInside:idleRaf,music:{track:music.track,contextState:music.contextState},sections:[...seen],spent,ballCost,back});
  await ctx.close();
 }
 console.log('KONBINI_BROWSER_PASS',JSON.stringify(summary));
 }catch(e){console.error(e);await lastPage?.screenshot({path:`${OUT}/failure-${tag}.png`}).catch(()=>{});process.exitCode=1;}finally{await browser.close();}
})();
