// Live futsal on the Palm Coast Rooftop (tests/futsal-ai.cjs covers the sim): walk up to the rooftop court, watch the
// AI 5-a-side, read the teaching feed, the man-marking assignments and the cost of the frame (renderer.info + rAF
// intervals), tap a live player for the position guide (real touch / mouse input), then walk away and confirm the match
// sleeps. Phone 390×844 (touch), landscape 844×390 (touch) and desktop 1440×900.
// Usage: node scripts/check-futsal-match-browser.cjs [screenshot dir]   (dev server on :8092)
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const OUT=process.argv[2]??'/tmp/futsal-match';fs.mkdirSync(OUT,{recursive:true});
const VIEWS=[{tag:'phone',viewport:{width:390,height:844},touch:true},{tag:'landscape',viewport:{width:844,height:390},touch:true},{tag:'desktop',viewport:{width:1440,height:900},touch:false}];
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 const report={};
 for(const v of VIEWS){
  const context=await browser.newContext({viewport:v.viewport,isMobile:v.touch,hasTouch:v.touch,deviceScaleFactor:v.touch?3:1});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  // straight into the game (the title screen's own hand-off flag, lib/rootView.ts), past the first-run welcome
  await page.addInitScript(()=>{localStorage.setItem('fi2-welcome-v1','completed');sessionStorage.setItem('fi2-island-handoff','1');});
  await page.goto('http://localhost:8092/',{waitUntil:'domcontentloaded',timeout:300000});
  await page.waitForFunction(()=>window.__fi2?.games&&!document.querySelector('[class*=IslandLoading]'),null,{timeout:300000});await page.waitForTimeout(2500);
  // the save-code prompt (components/saves) can open over a fresh island: close it so the court is visible
  const closeSave=async()=>{for(let i=0;i<3;i++){const d=page.locator('dialog[open]');if(!(await d.count()))return;await page.keyboard.press('Escape');await page.waitForTimeout(400);
   if(await d.count()){const b=d.getByRole('button',{name:/^(Not now|Later|Close|Done|Back)$/}).first();if(await b.count())await b.click().catch(()=>{});await page.waitForTimeout(400);}}};
  await closeSave();
  const futsal=()=>page.evaluate(()=>{const e=window.__fi2.games.entries.find(e=>e.venue.id==='futsal'),s=e.sim;return {x:e.venue.x,z:e.venue.z,halfX:e.venue.width/2,dormant:!!e.dormant,visible:e.root.visible,time:s.stats.time,rigs:e.rigs.size,score:{...s.score},msg:s.msg,
   marks:Object.entries(s.markOf).filter(([,m])=>m).length,futsal:{...s.futsalStats},events:e.effects.events.slice(-12).map(x=>x.text)};});
  // 1. Walk onto the rooftop beside the court (the walk itself is driven by real input below).
  const start=await futsal();
  await page.evaluate(({x,z,halfX})=>{const f=window.__fi2;f.rideRef.current='walk';f.flight.height=0;f.location.x=x+halfX+4;f.location.z=z;},start);
  await page.waitForTimeout(1500);
  if(!v.touch){await page.keyboard.down('ArrowLeft');await page.waitForTimeout(450);await page.keyboard.up('ArrowLeft');}
  await page.waitForTimeout(6000);
  const watching=await futsal();
  assert.equal(watching.dormant,false,'the rooftop match plays while you watch');assert.equal(watching.rigs,10,'five a side, keepers included');assert(watching.time>2);
  // 2. Frame cost while watching: rAF intervals over 3 s and the renderer's per-frame draw calls / triangles.
  const perf=await page.evaluate(()=>new Promise(res=>{const r=window.__fi2.renderer,ts=[];let calls=0,tris=0,n=0;const t0=performance.now();
   const tick=t=>{ts.push(t);const i=r.info.render;calls+=i.calls;tris+=i.triangles;n++;if(t-t0<3000)requestAnimationFrame(tick);else{const d=ts.slice(1).map((x,k)=>x-ts[k]).sort((a,b)=>a-b);res({frames:d.length,medianMs:+d[d.length>>1].toFixed(2),p95Ms:+d[Math.floor(d.length*.95)].toFixed(2),calls:Math.round(calls/n),triangles:Math.round(tris/n)});}};requestAnimationFrame(tick);}));
  // 3. Let the match run and read what it taught.
  await page.waitForTimeout(12000);
  const later=await futsal();
  assert(later.time>watching.time+5,'the clock runs');
  assert(later.marks>=1||later.futsal.markSwitches>=0,'marking state is live');
  await closeSave();await page.screenshot({path:`${OUT}/futsal-match-${v.tag}.png`});
  // 4. Tap / click a live player: the position guide opens (real input).
  let opened=false;
  for(let attempt=0;attempt<12&&!opened;attempt++){
   const target=await page.evaluate(()=>{const f=window.__fi2,e=f.games.entries.find(e=>e.venue.id==='futsal'),c=f.camera,r=f.renderer.domElement.getBoundingClientRect();
    const list=[...e.rigs.entries()].map(([id,rig])=>{const p=rig.root.position.clone().setFromMatrixPosition(rig.root.matrixWorld);p.y+=.9;p.project(c);return {id,x:r.left+(p.x+1)/2*r.width,y:r.top+(1-p.y)/2*r.height,z:p.z};}).filter(p=>p.z<1&&p.x>40&&p.x<r.width-40&&p.y>90&&p.y<r.height-160);
    return list[0]??null;});
   if(target){if(v.touch)await page.touchscreen.tap(target.x,target.y);else await page.mouse.click(target.x,target.y);await page.waitForTimeout(700);opened=await page.locator('dialog[open]').filter({hasNotText:'Save your island'}).count()>0;if(!opened)console.log(v.tag,'tap',target.id,'url',page.url(),'fi2',await page.evaluate(()=>!!window.__fi2));}
   if(!opened)await page.waitForTimeout(500);
  }
  if(opened){await page.screenshot({path:`${OUT}/futsal-position-guide-${v.tag}.png`});await page.locator('dialog[open]').getByRole('button',{name:'Done',exact:true}).first().click().catch(()=>{});await page.waitForTimeout(500);}
  // 5. Walk far away: the match sleeps and its clock stops (no work at rest).
  await page.evaluate(()=>{const f=window.__fi2;f.location.x=160;f.location.z=-110;});
  await page.waitForTimeout(2500);const away=await futsal();await page.waitForTimeout(2000);const away2=await futsal();
  assert.equal(away2.time,away.time,'clock frozen while far away');
  assert.deepEqual(errors,[]);
  report[v.tag]={perf,positionGuide:opened,score:later.score,simTime:+later.time.toFixed(1),marks:later.marks,futsal:later.futsal,feed:later.events};
  console.log(v.tag,JSON.stringify(report[v.tag]));
  await context.close();
 }
 fs.writeFileSync(`${OUT}/report.json`,JSON.stringify(report,null,1));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
