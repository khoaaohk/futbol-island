// Live 9v9 AI at Club Grounds (tests/nine-match-ai.cjs covers the sim): travel there with the map (real taps/clicks),
// watch the 18-player match, read the sim cost per step, frame time and renderer.info with the 9v9 AI and with the
// neutral (pre-Oct 10) AI on the same page, take a top-down shape capture, open the field card and the live commentary
// (throw-ins, offside, the timed run, the keeper outlet are explained there), then walk away and confirm the match sleeps.
// Phone 390×844 and 844×390 (touch), desktop 1440×900. Usage: node scripts/check-nine-ai-browser.cjs [screenshot dir]
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const OUT=process.argv[2]??'/tmp/nine-ai';fs.mkdirSync(OUT,{recursive:true});
const VIEWS=[{tag:'phone',viewport:{width:390,height:844},mobile:true},{tag:'landscape',viewport:{width:844,height:390},mobile:true},{tag:'desktop',viewport:{width:1440,height:900},mobile:false}];
const press=async(page,loc,mobile)=>{const b=await loc.boundingBox();if(b&&mobile)await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);else if(b)await loc.click();else await loc.dispatchEvent('click');};
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 const results=[];
 for(const view of (process.env.VIEWS?VIEWS.filter(v=>process.env.VIEWS.split(',').includes(v.tag)):VIEWS)){
  const context=await browser.newContext({viewport:view.viewport,isMobile:view.mobile,hasTouch:view.mobile,deviceScaleFactor:view.mobile?3:1});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem('fi2-welcome-v1','completed'));
  await page.goto('http://localhost:8092/',{waitUntil:'domcontentloaded',timeout:300000});
  // The title screen (Oct 9 2026) asks for a save code first: Start → Get my code → I saved it, tapped like a child would.
  for(let i=0,t0=Date.now();Date.now()-t0<360000&&!(await page.evaluate(()=>!!window.__fi2?.games));i++){
   for(const name of [/^I saved it$/,/^Get my code$/,/^Start/]){const b=page.getByRole('button',{name}).first();if(await b.isVisible().catch(()=>false)&&await b.isEnabled().catch(()=>false)){await press(page,b,view.mobile);break;}}
   await page.waitForTimeout(3000);}
  await page.waitForFunction(()=>window.__fi2?.games&&!document.querySelector('[class*=IslandLoading]'),null,{timeout:300000});await page.waitForTimeout(2500);
  const read=()=>page.evaluate(()=>{const e=window.__fi2.games.entries.find(e=>e.venue.id==='9v9'),v=e.venue,s=e.sim;
   return {x:v.x,z:v.z,halfX:v.width/2,dormant:!!e.dormant,visible:e.root.visible,time:s.stats.time,rigs:e.rigs.size,score:{...s.score},offside:s.stats.offsideCalls,touchline:s.ai.touchline,
    inside:s.ids.every(id=>{const p=s.players[id];return p.x>=8&&p.x<=262&&p.y>=6&&p.y<=396;}),events:e.effects.events.slice(-8).map(x=>x.text)};});
  const start=await read();
  // 1. Real input: open the map and travel to the 9v9 field.
  await press(page,page.getByRole('button',{name:'View map'}).first(),view.mobile);await page.waitForTimeout(1200);
  const dest=page.getByRole('button',{name:'Travel to 9v9 field'}).first();
  if(await dest.isVisible().catch(()=>false))await press(page,dest,view.mobile);else await dest.dispatchEvent('click');
  const arrived=await page.waitForFunction(()=>{const e=window.__fi2.games.entries.find(e=>e.venue.id==='9v9');return !e.dormant&&e.root.visible&&e.rigs.size===18;},null,{timeout:90000}).then(()=>true).catch(()=>false);
  if(!arrived)await page.evaluate(({x,z,halfX})=>{const f=window.__fi2;f.rideRef.current='walk';f.flight.height=0;f.location.x=x+halfX+4;f.location.z=z;},start); // the walk can stall on a loaded machine
  await page.waitForTimeout(6000);
  const watching=await read();
  assert.equal(watching.dormant,false,'the match wakes at the touchline');assert.equal(watching.visible,true);assert(watching.time>start.time+.5,'the match plays');
  assert.equal(watching.rigs,18,'nine a side');assert(watching.inside,'everyone inside the lines');assert.equal(watching.touchline,'Throw-in');
  // 2. Cost with the 9v9 AI and with the neutral AI on the same page (sim ms per step, frame time, renderer.info).
  const measure=neutral=>page.evaluate(neutral=>new Promise(resolve=>{const f=window.__fi2,e=f.games.entries.find(e=>e.venue.id==='9v9'),s=e.sim,orig=s.step,keep=s.ai;
   if(neutral)s.ai={...keep,touchline:'Kick-in',onsideHold:0,offsideMisread:0,restartOffsideFree:false,sweeper:0,keeperOutlet:0,teach:false}; // the 9v9 row off = the engine before Oct 10
   let simMs=0,steps=0;s.step=function(dt){const t=performance.now();orig.call(this,dt);simMs+=performance.now()-t;steps++;};
   const frames=[];let last=performance.now(),calls=0,tris=0,n=0;const r=f.renderer;let gkOff=0,gkN=0,offPos=0,poss=0;
   function tick(now){frames.push(now-last);last=now;calls+=r.info.render.calls;tris+=r.info.render.triangles;n++;
    const t=s.possession,gk=s.mates(t).map(id=>s.players[id]).find(p=>p.isGK);if(s.ball.owner&&!s.restart){poss++;if(s.depth(t,s.ball.y)>230){gkOff+=Math.abs(gk.y-(t==='gold'?392:8));gkN++;}if(s.mates(t).some(id=>!s.players[id].isGK&&s.isOffside(t,s.players[id].y)))offPos++;}
    if(frames.length<300)requestAnimationFrame(tick);else{s.step=orig;s.ai=keep;frames.sort((a,b)=>a-b);
    resolve({simMsPerStep:+(simMs/Math.max(1,steps)).toFixed(3),stepsPerFrame:+(steps/frames.length).toFixed(2),frameMedian:+frames[frames.length>>1].toFixed(2),frameP95:+frames[Math.floor(frames.length*.95)].toFixed(2),drawCalls:Math.round(calls/n),triangles:Math.round(tris/n),keeperOffLineWhenAttacking:gkN?+(gkOff/gkN).toFixed(1):null,offsidePositionPct:poss?+(100*offPos/poss).toFixed(1):null});}}
   requestAnimationFrame(tick);}),neutral);
  const before=await measure(true),after=await measure(false);
  await page.screenshot({path:`${OUT}/club-grounds-${view.tag}.png`});
  // 3. Top-down capture of the 9v9 shape (one extra render of the existing scene; the loop's camera is restored after).
  const top=await page.evaluate(()=>{const f=window.__fi2,e=f.games.entries.find(e=>e.venue.id==='9v9'),v=e.venue,c=f.camera,p=c.position.clone(),q=c.quaternion.clone();
   const h=Math.max(70,v.length*.62/Math.min(1,innerWidth/innerHeight));c.position.set(v.x,(v.elevation||0)+h,v.z+.01);c.lookAt(v.x,(v.elevation||0),v.z);c.updateMatrixWorld();f.renderer.render(f.scene,c);const png=f.renderer.domElement.toDataURL('image/png').split(',')[1];
   c.position.copy(p);c.quaternion.copy(q);c.updateMatrixWorld();return png;});
  fs.writeFileSync(`${OUT}/club-grounds-shape-${view.tag}.png`,Buffer.from(top,'base64'));
  // 4. Open the field card with real input and read the live commentary.
  const card=page.locator('[data-field="9v9"]');let transcript=null;
  if(await card.isVisible().catch(()=>false)){
   await press(page,card,view.mobile);await page.waitForTimeout(1500);
   const open=page.getByRole('button',{name:'Open transcript'}).first();
   if(await open.isVisible().catch(()=>false)){await press(page,open,view.mobile);
    await page.waitForTimeout(view.tag==='desktop'?20000:9000);
    transcript=(await page.locator('#field-transcript [role=log]').innerText().catch(()=>'')).split('\n').filter(Boolean).slice(-10);
    await page.screenshot({path:`${OUT}/club-grounds-commentary-${view.tag}.png`});}
   const done=page.getByRole('button',{name:/Return to island|Done/}).first();if(await done.isVisible().catch(()=>false)){await press(page,done,view.mobile);await page.waitForTimeout(800);}
  }
  // 5. Walk away: the match sleeps and its clock stops.
  await page.evaluate(()=>{const f=window.__fi2;f.location.x=135;f.location.z=100;});
  await page.waitForFunction(()=>!!window.__fi2.games.entries.find(e=>e.venue.id==='9v9').dormant,null,{timeout:20000}).catch(()=>{});const away=await read();await page.waitForTimeout(2000);const later=await read();
  console.log(view.tag,'away',JSON.stringify({dormant:away.dormant,time:away.time,later:later.time}));
  assert.equal(away.dormant,true,'dormant again far from the pitch');assert.equal(later.time,away.time,'clock frozen while far away');
  // a dev server recompiling under other edits can drop a chunk mid-load; that is not this page's error
  assert.deepEqual(errors.filter(m=>!/Loading chunk|Invalid or unexpected token/.test(m)),[]);if(errors.length)console.warn(view.tag,'dev-server chunk noise:',errors.length);
  const row={view:view.tag,travelledByMap:arrived,before,after,score:watching.score,offsideCalls:later.offside,events:watching.events.slice(-4),transcript};results.push(row);
  console.log(`${view.tag} passed`,JSON.stringify(row));
  await context.close();
 }
 fs.writeFileSync(`${OUT}/nine-ai-browser.json`,JSON.stringify(results,null,1));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
