#!/usr/bin/env node
// Release smoke check: CAN A KID FISH? (Nov 13 2026). On Nov 5 and Nov 12 nobody could fish (0 Fish taps, casts and fishing
// minutes over 38-57 sessions) and 1,000+ node tests did not notice, because none of them plays the real game in a browser.
// This one does, on a production build, as a brand-new player, on a phone (390x844, touch) and a desktop (1440x900):
//   /play → Start → Play → Skip the welcome → on foot → at each spot: the Fish button shows (visible, enabled, not covered)
//   → tap it (fishing starts) → cast (the float is in the scene) → wait for the bite → hook and spin the reel until a fish
//   lands (catch card + Fishbook) → Stop. Then the analytics counted fi:start, fi:cast and fi:land (window.__fi2.counts, a
//   test-only probe; nothing is sent anywhere, see scripts/smoke/kid-steps.mjs preparePage).
// docs/release-checklist.md: `npm run release:check` runs the unit tests, a build and this.
//
//   npm run build:quiet && npm run smoke:fishing           start `next start` on SMOKE_PORT (8984) from NEXT_DIST_DIR (.next)
//   SMOKE_URL=http://localhost:8984 npm run smoke:fishing  use a server that is already running
//   SMOKE_SPOTS=south-pier,north-point  SMOKE_ONLY=phone   other spots / one viewport
// On failure: prints the step that failed, saves a screenshot (SMOKE_SHOTS, default a temp folder) and exits 1.
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import {VIEWPORTS,launch,loadGameModule,startServer,createRun,preparePage,newIsland,onFoot,gotoSpot,waitHud,tapHud,pointer,counts,answerPopups,screenshot,StepError} from './smoke/kid-steps.mjs';

const SPOT_IDS=(process.env.SMOKE_SPOTS||'south-pier,park-pond').split(',').map(s=>s.trim()).filter(Boolean);
const ONLY=process.env.SMOKE_ONLY?.split(',');
const SHOTS=process.env.SMOKE_SHOTS||fs.mkdtempSync(path.join(os.tmpdir(),'smoke-fishing-'));
const {FISH_SPOTS}=loadGameModule('lib/town/fishing/fishSpots.ts');
const spots=SPOT_IDS.map(id=>FISH_SPOTS.find(s=>s.id===id)||(()=>{throw Error(`Unknown fishing spot ${id}`);})());

const phase=page=>page.evaluate(()=>document.querySelector('[data-fishing-hud]')?.dataset.phase??null);
const waitPhase=(page,phases,timeout)=>page.waitForFunction(p=>p.includes(document.querySelector('[data-fishing-hud]')?.dataset.phase),[].concat(phases),{timeout,polling:'raf'})
 .catch(async()=>{throw Error(`expected phase ${[].concat(phases).join('/')}, found ${await phase(page)}`);});

/** Wait for a bite, hook it and spin the reel until the fish lands. A fish that gets away is a normal part of fishing:
 *  the next one comes on its own, so try again (3 fish at most). */
async function landAFish(page,run,touch){
 const finger=await pointer(page,touch);
 for(let attempt=1;attempt<=3;attempt++){
  await run.step(`bite (fish ${attempt})`,()=>waitPhase(page,'bite',45000));
  const r=await page.evaluate(()=>{const b=document.querySelector('[data-fish-reel]').getBoundingClientRect();return {cx:b.x+b.width/2,cy:b.y+b.height/2,w:b.width};});
  await finger.down(r.cx,r.cy);
  const hooked=await waitPhase(page,'reeling',1500).then(()=>true,()=>false);
  if(!hooked){await finger.up();console.log(`      the bite was missed (${await phase(page)}), waiting for the next fish`);continue;}
  // Spin: circles round the reel's centre (~one turn per 0.7 s), easing off while the fish runs or the line is in the red.
  const landed=await run.step(`reel in (fish ${attempt})`,async()=>{
   let ang=0,last=Date.now();
   for(const until=Date.now()+40000;Date.now()<until;){
    const st=await page.evaluate(()=>{const r=document.querySelector('[data-fish-reel]');return {phase:document.querySelector('[data-fishing-hud]')?.dataset.phase,hold:!!r?.dataset.strain||!!r?.dataset.run};});
    if(st.phase!=='reeling'){await finger.up();return st.phase==='caught';}
    const now=Date.now();if(!st.hold){ang+=(now-last)/1000*(Math.PI*2/.7);await finger.move(r.cx+Math.cos(ang)*r.w*.38,r.cy+Math.sin(ang)*r.w*.38);}
    last=now;await page.waitForTimeout(16);
   }
   await finger.up();throw Error('still reeling after 40 s');
  });
  if(landed)return;
  console.log(`      the fish got away (${await phase(page)}), waiting for the next one`);
 }
 throw Error('no fish landed in 3 tries');
}

async function playViewport(browser,name,base){
 const touch=VIEWPORTS[name].hasTouch,run=createRun({label:name});
 const ctx=await browser.newContext(VIEWPORTS[name]);const {page,errors}=await preparePage(ctx);
 try{
  await run.step('open /play as a new player and skip the welcome',()=>newIsland(page,base,touch));
  await run.step('get on foot',()=>onFoot(page,touch));
  for(const s of spots){
   await run.step(`go to ${s.id}`,async()=>{await gotoSpot(page,{x:s.x,z:s.z,yaw:Math.atan2(s.buoy.x-s.x,s.buoy.z-s.z)+Math.PI});await page.waitForTimeout(500);});
   await run.step(`Fish button shows at ${s.id}`,async()=>{await waitHud(page,'[data-fish-enter]',10000);
    const at=await page.evaluate(()=>document.querySelector('[data-fish-enter]').dataset.spot);if(at!==s.id)throw Error(`the Fish button is for ${at}, not ${s.id}`);});
   await run.step('tap Fish: fishing starts',async()=>{await tapHud(page,'[data-fish-enter]',touch);await waitPhase(page,'ready',10000);});
   await run.step('cast: the float lands',async()=>{await page.waitForTimeout(400);await tapHud(page,'[data-fish-reel]',touch);await waitPhase(page,['casting','floating','approach','nibble','bite'],3000);
    const live=await page.evaluate(()=>window.__fi2.scene.getObjectByName('fishing-live')?.visible===true);if(!live)throw Error('the float / line (fishing-live) is not in the scene');});
   await landAFish(page,run,touch);
   // Nov 14 2026: a Rare / Legendary catch shows its trophy card after the close-up (the quick card waits): keep fishing like a player.
   await run.step('close the trophy card if one shows',async()=>{if(await page.locator('[data-fish-trophy]').count()){await tapHud(page,'[data-trophy-close]',touch);await page.waitForFunction(()=>!document.querySelector('[data-fish-trophy]'),null,{timeout:3000});}});
   await run.step('the catch shows and goes in the Fishbook',async()=>{await waitHud(page,'[data-fish-catch]',5000).catch(()=>page.waitForSelector('[data-fish-catch]',{state:'visible',timeout:3000}));
    const book=await page.evaluate(()=>{try{return JSON.parse(localStorage.getItem('fi2-fishbook-v1')||'null');}catch{return null;}});
    if(!book||!JSON.stringify(book).length||JSON.stringify(book)==='{}')throw Error('the Fishbook save is empty after a catch');});
   await run.step('stop fishing',async()=>{
    if(await page.locator('[data-fish-tutorial-done]').isVisible().catch(()=>false))await tapHud(page,'[data-fish-tutorial-done]',touch);
    // A first catch can finish a task ("Catch a fish"), and its card offer opens over the HUD: answer it like a player.
    await answerPopups(page,300);
    await tapHud(page,'[data-fish-stop]',touch);
    await page.waitForFunction(()=>!document.querySelector('[data-fishing-hud]'),null,{timeout:10000});
    await answerPopups(page);
   });
  }
  await run.step('analytics counted fi:start, fi:cast and fi:land',async()=>{const c=await counts(page),n=spots.length;
   const short=['fi:start','fi:cast','fi:land'].filter(id=>!((c[id]||0)>=n));
   if(short.length)throw Error(`expected at least ${n} of each, got `+JSON.stringify(Object.fromEntries(Object.entries(c).filter(([k])=>k.startsWith('fi:')))));});
  if(errors.length)console.log(`  note ${name}: page errors: ${errors.slice(0,3).join(' | ').slice(0,300)}`);
  console.log(`PASS ${name} in ${run.elapsed()}s`);
 }catch(e){
  const file=await screenshot(page,SHOTS,`FAIL-${name}`);
  if(e instanceof StepError)e.shot=file;else throw Object.assign(new StepError(name,e),{shot:file});
  throw e;
 }finally{await ctx.close().catch(()=>{});}
}

const t0=Date.now();let server=null,browser=null,code=0;
const cleanup=()=>{try{server?.stop();}catch{}};
process.on('SIGINT',()=>{cleanup();process.exit(130);});process.on('SIGTERM',()=>{cleanup();process.exit(143);});
try{
 const base=process.env.SMOKE_URL||(server=await startServer({port:Number(process.env.SMOKE_PORT||8984),distDir:process.env.NEXT_DIST_DIR||'.next'})).url;
 console.log(`smoke:fishing on ${base}, spots ${SPOT_IDS.join(' + ')}`);
 browser=await launch();
 for(const name of Object.keys(VIEWPORTS).filter(n=>!ONLY||ONLY.includes(n)))await playViewport(browser,name,base);
 console.log(`smoke:fishing PASS (${Math.round((Date.now()-t0)/1000)}s)`);
}catch(e){
 code=1;
 console.error(`\nsmoke:fishing FAIL at step "${e.step??'setup'}"\n  ${e.message}${e.shot?`\n  screenshot: ${e.shot}`:''}`);
}finally{await browser?.close().catch(()=>{});cleanup();}
process.exit(code);
