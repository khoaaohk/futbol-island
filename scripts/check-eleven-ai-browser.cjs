// Live 11v11 AI at Eleven Park (tests/eleven-ai.cjs covers the sim): walk to the touchline, watch the 22-player match,
// read the sim cost per step, frame time and renderer.info, open the field card and the live commentary (throw-ins,
// corners, goal kicks and offside are explained there), then walk away and confirm the match sleeps.
// Phone 390×844 and 844×390 (touch), desktop 1440×900. Usage: node scripts/check-eleven-ai-browser.cjs [screenshot dir]
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const OUT=process.argv[2]??'/tmp/eleven-ai';fs.mkdirSync(OUT,{recursive:true});
const press=async(page,loc,mobile)=>{const b=await loc.boundingBox();if(b&&mobile)await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);else if(b)await loc.click({timeout:5000}).catch(()=>{});else await loc.dispatchEvent('click').catch(()=>{});};
const VIEWS=[{tag:'phone',viewport:{width:390,height:844},mobile:true},{tag:'landscape',viewport:{width:844,height:390},mobile:true},{tag:'desktop',viewport:{width:1440,height:900},mobile:false}];
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 const results=[];
 for(const view of (process.env.VIEWS?VIEWS.filter(v=>process.env.VIEWS.split(',').includes(v.tag)):VIEWS)){
  const context=await browser.newContext({viewport:view.viewport,isMobile:view.mobile,hasTouch:view.mobile,deviceScaleFactor:view.mobile?3:1});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('fi2-welcome-v1','completed'));
  await page.goto('http://localhost:8092/',{waitUntil:'domcontentloaded',timeout:600000});
  // The title screen asks for a save code first: Start → Get my code → I saved it, tapped like a child would.
  for(let t0=Date.now();Date.now()-t0<600000&&!(await page.evaluate(()=>!!window.__fi2?.games));){
   for(const name of [/^I saved it$/,/^Get my code$/,/^Start/]){const b=page.getByRole('button',{name}).first();if(await b.isVisible().catch(()=>false)){await press(page,b,view.mobile);break;}}
   await page.waitForTimeout(3000);}
  await page.waitForFunction(()=>window.__fi2?.games&&!document.querySelector('[class*=IslandLoading]'),null,{timeout:600000});await page.waitForTimeout(2500);
  const read=()=>page.evaluate(()=>{const e=window.__fi2.games.entries.find(e=>e.venue.id==='11v11'),v=e.venue,s=e.sim;
   return {x:v.x,z:v.z,halfX:v.width/2,dormant:!!e.dormant,visible:e.root.visible,time:s.stats.time,rigs:e.rigs.size,score:{...s.score},offside:s.stats.offsideCalls,touchline:s.ai.touchline,
    inside:s.ids.every(id=>{const p=s.players[id];return p.x>=8&&p.x<=262&&p.y>=6&&p.y<=396;}),events:e.effects.events.slice(-8).map(x=>x.text)};});
  const start=await read();
  // 1. Real input: open the map and travel to Eleven Park (fallback: stand on the east touchline), then watch.
  await press(page,page.getByRole('button',{name:'View map'}).first(),view.mobile).catch(()=>{});await page.waitForTimeout(1200);
  const dest=page.getByRole('button',{name:/Travel to 11v11/}).first();
  if(await dest.isVisible().catch(()=>false))await press(page,dest,view.mobile);else await dest.dispatchEvent('click',{},{timeout:5000}).catch(()=>{});
  const arrived=await page.waitForFunction(()=>{const e=window.__fi2.games.entries.find(e=>e.venue.id==='11v11');return !e.dormant&&e.root.visible&&e.rigs.size===22;},null,{timeout:90000}).then(()=>true).catch(()=>false);
  if(!arrived){await page.keyboard.press('Escape').catch(()=>{});await page.evaluate(({x,z,halfX})=>{const f=window.__fi2;f.rideRef.current='walk';f.flight.height=0;f.location.x=x+halfX+4;f.location.z=z;},start);}
  await page.waitForTimeout(6000);
  const watching=await read();
  assert.equal(watching.dormant,false,'the match wakes when the player is at the touchline');assert.equal(watching.visible,true);assert(watching.time>start.time+.5,'the match plays');
  assert.equal(watching.rigs,22,'eleven a side');assert(watching.inside,'everyone inside the lines');assert.equal(watching.touchline,'Throw-in');
  // 2. Cost: sim ms per step (wrapped), frame time and renderer.info over 4 s of real frames.
  const perf=await page.evaluate(()=>new Promise(resolve=>{const f=window.__fi2,e=f.games.entries.find(e=>e.venue.id==='11v11'),s=e.sim,orig=s.step;let simMs=0,steps=0;
   s.step=function(dt){const t=performance.now();orig.call(this,dt);simMs+=performance.now()-t;steps++;};
   const frames=[];let last=performance.now(),calls=0,tris=0,n=0;const r=f.renderer;
   function tick(now){frames.push(now-last);last=now;calls+=r.info.render.calls;tris+=r.info.render.triangles;n++;if(frames.length<240)requestAnimationFrame(tick);else{s.step=orig;frames.sort((a,b)=>a-b);
    resolve({simMsPerStep:+(simMs/Math.max(1,steps)).toFixed(3),stepsPerFrame:+(steps/frames.length).toFixed(2),frameMedian:+frames[frames.length>>1].toFixed(2),frameP95:+frames[Math.floor(frames.length*.95)].toFixed(2),drawCalls:Math.round(calls/n),triangles:Math.round(tris/n)});}}
   requestAnimationFrame(tick);}));
  await page.screenshot({path:`${OUT}/eleven-park-${view.tag}.png`});
  // 3. Open the field card with real input and read the live commentary.
  const card=page.locator('[data-field="11v11"]');let transcript=null;
  if(await card.isVisible().catch(()=>false)){
   const box=await card.boundingBox();if(view.mobile)await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);else await card.click();
   await page.waitForTimeout(1500);
   const open=page.getByRole('button',{name:'Open transcript'}).first();
   if(await open.isVisible().catch(()=>false)){const b=await open.boundingBox();if(view.mobile)await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);else await open.click();
    await page.waitForTimeout(view.tag==='desktop'?20000:9000);
    transcript=(await page.locator('#field-transcript [role=log]').innerText().catch(()=>'')).split('\n').filter(Boolean).slice(-10);
    await page.screenshot({path:`${OUT}/eleven-park-commentary-${view.tag}.png`});}
   const done=page.getByRole('button',{name:/Return to island|Done/}).first();if(await done.isVisible().catch(()=>false)){await done.click();await page.waitForTimeout(800);}
  }
  // 4. Walk away: the match sleeps and its clock stops.
  await page.evaluate(()=>{const f=window.__fi2;f.location.x=95;f.location.z=-35;});
  await page.waitForTimeout(2500);const away=await read();await page.waitForTimeout(2000);const later=await read();
  assert.equal(away.dormant,true,'dormant again far from the pitch');assert.equal(later.time,away.time,'clock frozen while far away');
  assert.deepEqual(errors,[]);
  const row={view:view.tag,...perf,score:watching.score,offsideCalls:later.offside,events:watching.events.slice(-4),transcript};results.push(row);
  console.log(`${view.tag} passed`,JSON.stringify(row));
  await context.close();
 }
 fs.writeFileSync(`${OUT}/eleven-ai-browser.json`,JSON.stringify(results,null,1));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
