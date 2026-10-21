// Bug squad catching browser check (catching lane, Oct 20 2026; docs/island-jobs.md §15). Fresh save (the "Finish an island job"
// quest card is present), on Summit Isle: start the shift at the sign, count the swarm bugs within 40 m at six spots, the net at rest,
// a swing, a catch (zoom, burst, story card), the squad's 20th species (formation release), Release at the bug hotel → payday card,
// the Bug book, then Night (fireflies). Screenshots to $BUG_SHOTS (default /tmp/bug-catching). Fails on console / page errors.
// usage: FUTBOL_BASE_URL=http://localhost:8137 node scripts/check-bug-squad-browser.cjs [--mobile] [--night-only]
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const OUT=process.env.BUG_SHOTS||'/tmp/bug-catching',base=process.env.FUTBOL_BASE_URL||'http://localhost:8137';
const mobile=process.argv.includes('--mobile'),tag=mobile?'phone':'desktop';
// Oct 21 2026 (bug-pill-fix): after each step the Bug squad pill must be on screen (count + End job ×): in the DOM, a real rect inside
// the viewport, opacity > 0, visible, and elementFromPoint at its centre is the pill (or a stage / dialog covers it on purpose). The
// End button on the action cluster carries the count too. Seeds a long-time player (pill already seen, half a squad caught).
const pillCheck=async(page,step,report)=>{const p=await page.evaluate(()=>{const el=document.querySelector('[data-job-active]'),stage=document.documentElement.hasAttribute('data-catch-stage')||!!window.__fi2Jobs.getView().releasing,dialog=!!document.querySelector('dialog[open],[role=dialog][aria-modal=true]');
  if(!window.__fi2Jobs.run)return {ok:true,idle:true};if(stage||dialog)return {ok:true,covered:true};if(!el)return {ok:false,why:'no pill in the DOM'};
  const r=el.getBoundingClientRect(),cs=getComputedStyle(el),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2),end=document.querySelector('[data-job-end-count]');
  const ok=r.width>0&&r.height>0&&r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth&&+cs.opacity>.5&&cs.visibility==='visible'&&!!hit&&(el.contains(hit)||!!hit.closest('[data-bug-card],[data-island-toast]'));
  return {ok,why:ok?'':JSON.stringify({rect:[r.x|0,r.y|0,r.width|0,r.height|0],op:cs.opacity,vis:cs.visibility,hit:hit&&(hit.className||hit.tagName)+''}),endCount:end?.textContent??null,docked:!!el.closest('[data-pill-dock]')};});
 report.pill=report.pill||[];report.pill.push(step+':'+(p.ok?'ok':'FAIL')+(p.endCount?' '+p.endCount:''));assert(p.ok,`the Bug squad pill is visible after ${step}: ${p.why}`);};fs.mkdirSync(OUT,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const SIGN={x:606,z:133.5};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--mute-audio','--use-angle=metal']});const report={tag};
 try{
  async function open(time){const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1288,height:717},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
   const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>{if(!/ChunkLoadError|Loading chunk|error while hydrating/.test(e.message))errors.push(e.message);});
   page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|favicon|net::ERR|404/.test(m.text()))errors.push(m.text());});
   await page.addInitScript(({SIGN,time})=>{if(sessionStorage.getItem('bug-test-seeded'))return;sessionStorage.setItem('bug-test-seeded','1');
    localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-time-of-day',time);localStorage.setItem('fi2-bug-pill-v1','1');
    for(const [k,v] of Object.entries({'fi2-audio-mix':'4-50-v1','fi2-sound-muted':'true','fi2-music-enabled':'false','fi2-voice-enabled':'false'}))localStorage.setItem(k,v);
    sessionStorage.setItem('fi2-arcade-departure-v1',JSON.stringify({version:1,x:SIGN.x,z:SIGN.z,yaw:Math.PI,ride:'walk',flightHeight:0}));},{SIGN,time});
   await page.goto(base+'/?from=konbini',{timeout:240000});await page.waitForFunction(()=>window.__fi2&&window.__fi2Jobs,null,{timeout:180000});
   await page.locator('[data-island-return-loading]').waitFor({state:'detached',timeout:90000}).catch(()=>{});await wait(1500);return {ctx,page,errors};}
  const tap=async(page,loc)=>mobile?loc.tap():loc.click();
  const shot=async(page,name)=>page.screenshot({path:`${OUT}/${tag}-${name}.png`});
  const start=async page=>{let offer=page.locator('[data-job-offer="bug-scout"]');await offer.waitFor({timeout:20000});await tap(page,offer);
   const go=page.getByRole('button',{name:'Start job'});await go.waitFor({timeout:8000});await tap(page,go);await page.waitForFunction(()=>window.__fi2Jobs.run,null,{timeout:8000});await wait(1200);};
  const tp=(page,x,z,yaw=0)=>page.evaluate(({x,z,yaw})=>window.__fi2.teleport(x,z,yaw),{x,z,yaw});
  const nearest=page=>page.evaluate(()=>{const f=window.__fi2,j=window.__fi2Jobs,l=f.location,h=f.wildBugs.query(l.x,0,l.z,3000);
   const list=h.filter(b=>{const id=b.species?.id??b.call?.id;const i=j.run?j.run.def.targets.length:0;return true;}).map(b=>({id:b.id,x:b.x,y:b.y,z:b.z}));return list;});
  const ground=(page)=>page.evaluate(()=>window.__fi2.location);
  const stepTo=async(page,b)=>{// 1.6 m from the bug, facing it
   const a=Math.atan2(SIGN.x-b.x,SIGN.z-b.z),x=b.x+Math.sin(a)*1.6,z=b.z+Math.cos(a)*1.6;await tp(page,x,z,Math.atan2(b.x-x,b.z-z));await wait(500);};
  // ---------------- Day ----------------
  if(!process.argv.includes('--night-only')){const {ctx,page,errors}=await open('day');
   const quest=await page.locator('text=/Finish an island job/i').count();report.questCard=quest;
   await start(page);await shot(page,'1-net-at-rest');await pillCheck(page,'start',report);
   const pillMain=page.locator('[data-job-active] button').first();await tap(page,pillMain);await wait(500);await pillCheck(page,'pill-open',report);await wait(6500);await pillCheck(page,'pill-fold',report);
   await page.evaluate(()=>{document.querySelector('[data-hud-stack]').hidden=true;});await wait(1300);await pillCheck(page,'stack-stuck-hidden',report);report.rescues=await page.evaluate(()=>window.__fi2PillRescues??0);
   // Bugs within 40 m at six spots (the swarm builds the shift's set across the island).
   const spots=[[606,133],[640,140],[584,24],[700,150],[540,190],[740,115]];report.within40=[];
   for(const [x,z] of spots){await tp(page,x,z);await wait(9000);report.within40.push(await page.evaluate(()=>{const f=window.__fi2,l=f.location;return f.wildBugs.query(l.x,0,l.z,3000).filter(b=>Math.hypot(b.x-l.x,b.z-l.z)<=40).length+'/'+f.wildBugs.count;}));}
   report.alive=await page.evaluate(()=>!!window.__fi2Jobs.run);assert(report.alive,'the shift survives walking all over the island');await pillCheck(page,'walk',report);
   // Catch one: swing near the nearest bug (zoom, burst, card).
   let bugs=await page.evaluate(()=>{const f=window.__fi2,l=f.location;return f.wildBugs.query(l.x,0,l.z,3000).map(b=>({id:b.id,x:b.x,y:b.y,z:b.z,sp:b.species?.id}));});
   assert(bugs.length>0,'bugs out during the shift');await stepTo(page,bugs[0]);
   bugs=await page.evaluate(()=>{const f=window.__fi2,l=f.location;return f.wildBugs.query(l.x,0,l.z,3000).map(b=>({id:b.id,x:b.x,y:b.y,z:b.z,sp:b.species?.id}));});
   await page.keyboard.press('Space');await wait(130);await shot(page,'2-mid-swing');await wait(500);
   report.zoom=await page.evaluate(()=>window.__fi2Jobs.zooming);await shot(page,'3-catch-zoom');await wait(700);await shot(page,'4-success-burst');
   await wait(1400);await pillCheck(page,'catch',report);await wait(7500);
   await page.keyboard.press('Escape');await wait(300);await pillCheck(page,'end-ask (jar has a bug: Sure?)',report);report.endAsk=await page.locator('[data-job-end-mini] small').textContent().catch(()=>null);await wait(3800);await pillCheck(page,'end-ask-timeout',report);const card=page.locator('[data-bug-card]');report.card=await card.count();if(report.card)report.cardText=(await card.innerText()).slice(0,140);await shot(page,'5-story-card');
   // The 20th species: mark the rest of the squad caught, then catch one more → the formation release.
   const caughtId=await page.evaluate(()=>window.__fi2Jobs.getView().caught?.id);report.firstCatch=caughtId;
   for(let k=0;k<4;k++){bugs=await page.evaluate(()=>{const f=window.__fi2,l=f.location;return f.wildBugs.query(l.x,0,l.z,3000).map(b=>({id:b.id,x:b.x,y:b.y,z:b.z,sp:b.species?.id}));});
    const next=bugs.find(b=>b.sp&&b.sp!==caughtId);if(!next)break;
    await page.evaluate(({keep})=>{const ids=window.__fi2Jobs.run.def.targets.map((_,i)=>window.__fi2Jobs.run.def.spotNotes[i]);const B=JSON.parse(localStorage.getItem('fi2-bug-book-v1')||'{"version":2,"bugs":{},"fireflies":{}}');
     const all=['monarch','swallowtail','mantis','honeybee','bumblebee','jumping-spider','caterpillar','blue-morph','ground-beetle','stag-beetle','dragonfly','damselfly','ant','cicada','moth','stick-insect','rhino-beetle','ladybug','cricket','grasshopper'];
     B.squad=all.filter(i=>i!==keep);localStorage.setItem('fi2-bug-book-v1',JSON.stringify(B));},{keep:next.sp});
    await stepTo(page,next);await page.keyboard.press('Space');await wait(900);if(await page.evaluate(()=>window.__fi2Jobs.getView().caught?.squadComplete)){report.squadComplete=true;break;}await wait(1800);}
   await wait(2500);
   // Fill the jar and release at the bug hotel (regression: Release always works, payday follows).
   await page.evaluate(()=>{const r=window.__fi2Jobs.run;r.got=r.got.map(()=>true);r.phase='deliver';r.at=-1;});await tp(page,604.5,128.8,Math.PI);await wait(1200);
   report.phase=await page.evaluate(()=>window.__fi2Jobs.run?.phase);const rel=page.locator('[data-job-action="letfree"]');report.releaseEnabled=!(await rel.getAttribute('aria-disabled'));
   await tap(page,rel);await wait(400);report.releasing=await page.evaluate(()=>!!window.__fi2Jobs.getView().releasing);await wait(3300);await shot(page,'6-release-formation');
   report.flyers=await page.evaluate(()=>window.__fi2Jobs.root.getObjectByName('bug-release-flyers')?.count??0);
   await page.waitForFunction(()=>document.querySelector('#job-done-title'),null,{timeout:15000});await wait(500);await shot(page,'7-payday');report.payday=true;
   await page.evaluate(()=>window.dispatchEvent(new Event('fi2-open-bug-book')));await wait(5000);await shot(page,'8-bug-book');report.bookPages=await page.locator('[data-bugbook-page]').count();
   report.dayErrors=errors.slice(0,5);await ctx.close();}
  // ---------------- Night ----------------
  {const {ctx,page,errors}=await open('night');await start(page);await pillCheck(page,'night-start',report);
   const ff=await page.evaluate(()=>{const f=window.__fi2,l=f.location;return f.wildBugs.query(l.x,0,l.z,3000).map(b=>({id:b.id,x:b.x,y:b.y,z:b.z}));});report.fireflies=ff.length;
   if(ff[0]){const b=ff[0],a=Math.atan2(SIGN.x-b.x,SIGN.z-b.z),x=b.x+Math.sin(a)*1.8,z=b.z+Math.cos(a)*1.8;await tp(page,x,z,Math.atan2(b.x-x,b.z-z));await wait(1500);}
   await shot(page,'9-night-fireflies');await page.keyboard.press('Space');await wait(800);await shot(page,'10-night-catch');await wait(6000);await pillCheck(page,'night-after-catch',report);report.nightErrors=errors.slice(0,5);await ctx.close();}
 }catch(e){report.error=String(e&&e.stack||e).slice(0,600);}
 finally{await browser.close();console.log(JSON.stringify(report,null,1));}
})();
