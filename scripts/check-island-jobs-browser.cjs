// Island jobs browser check (Jobs upgrade, Oct 25 2026; docs/JOBS_UPGRADE_OCT25.md). Fresh save on a phone (or desktop): walk up to
// the Rake the leaves sign, open the offer, Start job, read the coach line + progress meter, rake and bag a pile (the hold pose),
// then Set out the cones: three quick cones (the rhythm streak line), all eight (the finish cheer, the payday card with the par line).
// Also checks the Stop job confirm. Screenshots to $JOB_SHOTS (default /tmp/island-jobs). Fails on console / page errors.
// usage: FUTBOL_BASE_URL=http://localhost:8161 node scripts/check-island-jobs-browser.cjs [--mobile]
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const OUT=process.env.JOB_SHOTS||'/tmp/island-jobs',base=process.env.FUTBOL_BASE_URL||'http://localhost:8161';
const mobile=process.argv.includes('--mobile'),tag=mobile?'phone':'desktop';fs.mkdirSync(OUT,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--mute-audio','--use-angle=metal']});const report={tag};
 try{
  const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1288,height:717},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>{if(!/ChunkLoadError|Loading chunk|error while hydrating/.test(e.message))errors.push(e.message);});
  // The minimap's dev-only style warning on a teleport (IslandOverview transition vs transitionDuration) is not a jobs error.
  page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|favicon|net::ERR|404|a style property during rerender/.test(m.text()))errors.push(m.text());});
  const SIGN={x:20.5,z:-47.5};
  await page.addInitScript(({SIGN})=>{if(sessionStorage.getItem('job-test-seeded'))return;sessionStorage.setItem('job-test-seeded','1');
   localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-time-of-day','day');
   for(const [k,v] of Object.entries({'fi2-audio-mix':'4-50-v1','fi2-sound-muted':'true','fi2-music-enabled':'false','fi2-voice-enabled':'false'}))localStorage.setItem(k,v);
   sessionStorage.setItem('fi2-arcade-departure-v1',JSON.stringify({version:1,x:SIGN.x,z:SIGN.z,yaw:Math.PI,ride:'walk',flightHeight:0}));},{SIGN});
  await page.goto(base+'/?from=konbini',{timeout:240000});await page.waitForFunction(()=>window.__fi2&&window.__fi2Jobs,null,{timeout:180000});
  await page.locator('[data-island-return-loading]').waitFor({state:'detached',timeout:90000}).catch(()=>{});await wait(1500);
  const tap=loc=>mobile?loc.tap():loc.click(),shot=name=>page.screenshot({path:`${OUT}/${tag}-${name}.png`});
  const tp=(x,z,yaw=0)=>page.evaluate(({x,z,yaw})=>window.__fi2.teleport(x,z,yaw),{x,z,yaw});
  const view=()=>page.evaluate(()=>{const v=window.__fi2Jobs.getView();return {active:v.active&&{id:v.active.id,value:v.active.value,total:v.active.total,hint:v.active.hint,phase:v.active.phase},done:v.done,ended:v.ended};});
  const startAt=async(id,x,z)=>{await tp(x,z);const offer=page.locator(`[data-job-offer="${id}"]`);await offer.waitFor({timeout:20000});await tap(offer);
   const go=page.getByRole('button',{name:'Start job'});await go.waitFor({timeout:8000});await tap(go);await page.waitForFunction(()=>window.__fi2Jobs.run,null,{timeout:8000});await wait(900);};
  // 1. Rake the leaves: offer → start → the coach line and the meter.
  await startAt('leaf-rake',SIGN.x,SIGN.z);let v=await view();report.rakeStart=v.active;
  assert.match(v.active.hint,/^Next: the nearest leaf pile \(follow the arrow\)\. 12 leaf piles to go\./,'the coach line');
  assert(await page.locator('[data-job-meter]').count()>=1,'a progress meter');
  // 2. A pile: Rake (held), then Bag it.
  const pile=await page.evaluate(()=>window.__fi2Jobs.run.def.targets[0]);await tp(pile.x,pile.z+1.2,Math.PI);await wait(700);
  report.rakeButtons=await page.$$eval('[data-job-action]',b=>b.map(x=>`${x.dataset.jobAction}:${x.getAttribute('aria-disabled')?0:1}`));
  await page.evaluate(()=>window.__fi2Jobs.act('rake'));await wait(550);await shot('rake-hold');await wait(900);await page.evaluate(()=>window.__fi2Jobs.act('rake:up'));
  await page.evaluate(()=>window.__fi2Jobs.act('bag'));await wait(600);v=await view();report.afterBag=v.active;assert.equal(v.active.value,1,'one pile bagged');
  // 3. Stop job asks once when the shift has progress.
  const stop=page.locator('[data-job-active] button[aria-label="Stop job"], [data-job-active] button:has-text("Stop job")').first();await stop.waitFor({timeout:8000});await tap(stop);await wait(250);
  assert(await page.evaluate(()=>!!window.__fi2Jobs.run),'one tap with progress: still running (asks first)');
  const again=page.locator('[data-job-active] [data-job-end]').first();await tap(again);await wait(400);assert(await page.evaluate(()=>!window.__fi2Jobs.run),'second tap stops it');
  // 4. Set out the cones: three quick cones (the streak), then the rest (the cheer and the payday card).
  await startAt('cone-setup',185.5,-87.5);const cones=await page.evaluate(()=>window.__fi2Jobs.run.def.targets);let streak='';
  for(let i=0;i<cones.length;i++){const c=cones[i];await tp(c.x,c.z+.6,Math.PI);await wait(350);await page.evaluate(()=>window.__fi2Jobs.act('place'));await wait(420);
   if(i===2){v=await view();streak=v.active?.hint??'';await shot('cone-streak');}}
  report.streak=streak;assert.match(streak,/Quick feet! 3 in a row/,'the streak line after three quick cones');
  await wait(450);report.posing=await page.evaluate(()=>window.__fi2?.jobPose??null);await shot('cone-cheer');
  // A fresh save's first finished job also completes the "Finish an island job" quest: its card pick comes first.
  const pickCard=page.getByRole('button',{name:'Open this card'});
  for(let t=0;t<24;t++){if(await page.locator('[data-job-done]').isVisible().catch(()=>false))break;
   if(await pickCard.isVisible().catch(()=>false)){report.questCard=true;await tap(pickCard);await wait(2500);
    for(const name of ['Done','Keep playing']){const b=page.getByRole('button',{name,exact:true}).first();await b.waitFor({timeout:6000}).catch(()=>{});if(await b.isVisible().catch(()=>false)){await tap(b);await wait(900);}}}
   await wait(500);}
  const card=page.locator('[data-job-done="cone-setup"]');await card.waitFor({timeout:12000}).catch(async e=>{await shot('no-payday');report.buttons=await page.$$eval('button',b=>b.filter(x=>x.offsetParent).map(x=>x.getAttribute('aria-label')||x.textContent.trim()).slice(0,30));console.log(JSON.stringify(report));throw e;});report.par=await page.locator('[data-job-done] [data-job-par]').textContent().catch(()=>null);
  assert.match(report.par??'',/par/i,'the payday card shows the par line');await shot('payday');
  report.errors=errors.map(e=>e.split('\n')[0].slice(0,300));assert.deepEqual(report.errors,[],'no console errors: '+report.errors.join(' | '));console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
