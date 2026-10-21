// Bug squad catch stage browser check (Oct 21 2026; docs/island-jobs.md §15 "Catch stage"). On Summit Isle: start the shift, then
// for each species asked (Day: ant, monarch butterfly, stag beetle, dragonfly; Night: a firefly) step up to it and Swing: the push-in
// on the character, the sealed stage, the swing, the hit, the bug in the hoop, the bag closed, the raise, the hold, the card, back to
// the island. Frames are captured in slow motion (the probe's stageRate) to $BUG_SHOTS (default /tmp/bug-catch-anim). Checks: the
// HUD is hidden during the stage (only the card and Tap to skip), the rig comes back, the catch counts; the compact pill + one toast
// after a miss. Fails on console / page errors.
// usage: FUTBOL_BASE_URL=http://localhost:8141 node scripts/check-bug-catch-stage-browser.cjs [--mobile] [--night|--sunset]
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const OUT=process.env.BUG_SHOTS||'/tmp/bug-catch-anim',base=process.env.FUTBOL_BASE_URL||'http://localhost:8141';
const mobile=process.argv.includes('--mobile'),night=process.argv.includes('--night'),sunset=process.argv.includes('--sunset'),tag=(mobile?'phone':'desktop')+(night?'-night':sunset?'-sunset':'-day');fs.mkdirSync(OUT,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const SIGN={x:606,z:133.5},RATE=.2;
const WANT=night?['firefly']:(process.env.BUG_SPECIES||'ant,monarch,stag-beetle,dragonfly').split(',');
// Stage-time marks (s; negative = the push-in): the frame sequence.
const MARKS=[['0-push-in',-.3],['1-stage-settle',.12],['2-wind-up',.5],['3-hit',.86],['4-bug-in-hoop',1.2],['5-bag-closed',1.58],['6-raised',2],['7-hold',2.5],['8-card',3.3]];
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--mute-audio','--use-angle=metal']});const report={tag,catches:[]};
 try{
  const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>{if(!/ChunkLoadError|Loading chunk|error while hydrating/.test(e.message))errors.push(e.message);});
  page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|favicon|net::ERR|404/.test(m.text()))errors.push(m.text());});
  await page.addInitScript(({SIGN,time})=>{if(sessionStorage.getItem('bug-test-seeded'))return;sessionStorage.setItem('bug-test-seeded','1');
   localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-time-of-day',time);
   for(const [k,v] of Object.entries({'fi2-audio-mix':'4-50-v1','fi2-sound-muted':'true','fi2-music-enabled':'false','fi2-voice-enabled':'false'}))localStorage.setItem(k,v);
   sessionStorage.setItem('fi2-arcade-departure-v1',JSON.stringify({version:1,x:SIGN.x,z:SIGN.z,yaw:Math.PI,ride:'walk',flightHeight:0}));},{SIGN,time:night?'night':sunset?'sunset':'day'});
  await page.goto(base+'/?from=konbini',{timeout:240000});await page.waitForFunction(()=>window.__fi2&&window.__fi2Jobs,null,{timeout:180000});
  await page.locator('[data-island-return-loading]').waitFor({state:'detached',timeout:90000}).catch(()=>{});await wait(1500);
  const tap=async loc=>mobile?loc.tap():loc.click();
  const shot=name=>page.screenshot({path:`${OUT}/${tag}-${name}.png`});
  const offer=page.locator('[data-job-offer="bug-scout"]');await offer.waitFor({timeout:20000});await tap(offer);
  const go=page.getByRole('button',{name:'Start job'});await go.waitFor({timeout:8000});await tap(go);await page.waitForFunction(()=>window.__fi2Jobs.run,null,{timeout:8000});await wait(1500);
  await shot('pill-first-tip');
  const tp=(x,z,yaw=0)=>page.evaluate(({x,z,yaw})=>window.__fi2.teleport(x,z,yaw),{x,z,yaw});
  const list=()=>page.evaluate(()=>{const f=window.__fi2,l=f.location;return f.wildBugs.query(l.x,0,l.z,3000).map(b=>({id:b.id,x:b.x,y:b.y,z:b.z,sp:b.species?.id??b.call?.id,kind:b.kind}));});
  // A miss first (nothing near): the compact pill and one short toast.
  await tp(606,128,Math.PI);await wait(800);
  for(const want of WANT){
   let bugs=await list(),b=bugs.find(q=>want==='firefly'?q.kind==='firefly':q.sp===want);
   for(let seed=1;!b&&seed<40;seed++){await page.evaluate(s=>window.__fi2.wildBugs.reseed(s),seed*7919);await wait(1400);bugs=await list();b=bugs.find(q=>q.sp===want);}
   if(!b){report.catches.push({want,skipped:'not out'});continue;}
   const a=Math.atan2(SIGN.x-b.x,SIGN.z-b.z),x=b.x+Math.sin(a)*1.8,z=b.z+Math.cos(a)*1.8;await tp(x,z,Math.atan2(b.x-x,b.z-z));await wait(700);
   await page.evaluate(r=>{window.__fi2Jobs.stageRate=r;},RATE);await shot(`${want}-before`);
   await page.keyboard.press('Space');const t0=Date.now();let stage=false,hudHidden=false;const got=[];
   for(const [name,mark] of MARKS){// wait for the stage clock to pass the mark (slow motion), then capture
    for(let k=0;k<200;k++){const st=await page.evaluate(()=>window.__fi2Jobs.stageTime);if(st===null||st>=mark)break;await wait(25);}
    const st=await page.evaluate(()=>({t:window.__fi2Jobs.stageTime,staging:window.__fi2Jobs.staging,hud:document.documentElement.hasAttribute('data-catch-stage'),
     pill:(()=>{const el=document.querySelector('[data-job-active]');return el?getComputedStyle(el).visibility:'none';})(),card:!!document.querySelector('[data-bug-card]'),skip:!!document.querySelector('[data-job-skip]')}));
    if(st.staging)stage=true;if(st.hud&&st.pill!=='visible')hudHidden=true;got.push(`${name}@${st.t===null?'end':st.t.toFixed(2)}${st.card?'+card':''}`);await shot(`${want}-${name}`);}
   await page.evaluate(()=>{window.__fi2Jobs.stageRate=1;});await page.waitForFunction(()=>window.__fi2Jobs.stageTime===null,null,{timeout:15000});await wait(900);await shot(`${want}-9-back-to-island`);
   const after=await page.evaluate(()=>({hud:document.documentElement.hasAttribute('data-catch-stage'),pill:(()=>{const el=document.querySelector('[data-job-active]');return el?getComputedStyle(el).visibility:'none';})(),caught:window.__fi2Jobs.getView().caught?.id,ms:0}));
   report.catches.push({want,stage,hudHidden,hudBack:!after.hud&&after.pill==='visible',caught:after.caught,frames:got.join(' '),ms:Date.now()-t0});
   await wait(7500);// the card slides away
  }
  // The compact pill after the catches, and a miss → one toast.
  await tp(606,128,Math.PI);await wait(600);await page.evaluate(()=>{const f=window.__fi2;for(const b of f.wildBugs.query(f.location.x,0,f.location.z,12))f.wildBugs.startle(b.id,{x:f.location.x,z:f.location.z});});
  await shot('pill-compact');await page.keyboard.press('Space');await wait(1700);await shot('miss-one-toast');
  report.pill=await page.evaluate(()=>document.querySelector('[data-job-active]')?.getAttribute('data-job-panel'));
  report.surfaces=await page.evaluate(()=>['[data-bug-card]','[data-island-toast]','[data-job-paid]'].filter(s=>document.querySelector(s)).length);
  report.errors=errors.slice(0,5);await ctx.close();
 }finally{await browser.close();}
 console.log(JSON.stringify(report,null,1));
 for(const c of report.catches)if(!c.skipped){assert(c.stage,c.want+': the catch stage played');assert(c.hudHidden,c.want+': HUD hidden during the stage');assert(c.hudBack,c.want+': HUD back after');}
 assert.equal(report.pill,'chip','the pill is compact');assert(report.surfaces<=1,'one message surface at a time');assert.equal(report.errors.length,0,'no page errors');
})().catch(e=>{console.error(e);process.exit(1);});
