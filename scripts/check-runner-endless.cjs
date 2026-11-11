// Breakaway Run endless-play check (Nov 10 2026). Upright phone profile since Nov 11 2026 (390x664 touch: the game plays upright;
// --landscape = the sideways phone, 844x390; --desktop = 1280x800). The scripted bot of
// tests/runner-endless-bot.cjs plays in the page (lane, jump, shoot through the game's own action hook) across goal lines and asserts:
//  - the run is never forced over while hearts remain (phase stays 'playing', no outro, no full time);
//  - no input-dead interval over 1 s: the sim clock never stands still for a second, and a REAL touch on the Jump button right at every
//    seam (the frame the round changes) is answered inside a second;
//  - no frame hitch at a seam over HITCH_MS (the longest frame from 1 s before to 3 s after each round change);
//  - nothing grows round over round: the scene graph (node count, distinct geometries) never grows and renderer.info textures are identical at
//    every seam, renderer.info geometries never pass what the scene holds (it counts geometries as they are first DRAWN, so it rises to a
//    plateau while pooled rigs get their first use: measured 46 -> 70 by round 5, then flat), and the draw-call peak stays under DRAW_PEAK.
//   node scripts/check-runner-endless.cjs --port=<n>             fast: 8 s into each round the runner is moved to 235 m before the
//                                                                goal line, so the final hill, the strike beat and the seam play in real time
//   node scripts/check-runner-endless.cjs --port=<n> --full      real time, whole rounds (Warm-up: about 70 s a round)
//   --mode=<warmup|classic|night|storm|cup|legend|daily> (default warmup) · --rounds=<n> seams to cross (default 3) · --desktop
//   --observe logs instead of asserting · --shot=<file.png> saves a frame from the last round (the margin strip with the round tag)
// Hearts: the bot is topped up to two hearts so a stray tackle cannot end the check early; the over test is about the seam, not the bot.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');
const {botStep}=require('../tests/runner-endless-bot.cjs');
const arg=n=>(process.argv.find(a=>a.startsWith('--'+n+'='))||'').slice(n.length+3);
const portArg=arg('port')||process.env.PORT,BASE=process.env.FUTBOL_BASE_URL||(portArg?`http://localhost:${portArg}`:'');
if(!BASE){console.error('Pass your own server: --port=<port>, PORT=<port> or FUTBOL_BASE_URL=<url>. There is no default port.');process.exit(1);}
const MODE=arg('mode')||'warmup',ROUNDS=Number(arg('rounds'))||3,FULL=process.argv.includes('--full'),OBSERVE=process.argv.includes('--observe'),DESKTOP=process.argv.includes('--desktop'),LANDSCAPE=process.argv.includes('--landscape'),SHOT=arg('shot');
/** Longest frame allowed around a seam (ms). The game draws at 30 fps (33 ms); a dev build on a busy laptop jitters to ~60 ms. */
const HITCH_MS=120,DEAD_MS=1000,DRAW_PEAK=90;
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome',args:['--mute-audio']});try{
 const page=await browser.newPage({viewport:DESKTOP?{width:1280,height:800}:LANDSCAPE?{width:844,height:390}:{width:390,height:664},isMobile:!DESKTOP,hasTouch:!DESKTOP}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(mode=>{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-sound-muted','true');localStorage.setItem('fi2-music-enabled','false');localStorage.setItem('fi2-voice-enabled','false');localStorage.setItem('fi2-audio-mix','4-50-v1');
  if(!localStorage.getItem('fi2-arcade-wallet-v1'))localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,spends:{},runs:{'baseline-grant':{game:'island',paid:5000,reason:'baseline',at:Date.now()}},best:{},attempts:{},visits:{},packs:[]}));
  // Every route open and the wanted one remembered, the first-run coach done (it slows time for its lessons).
  localStorage.setItem('fi2-runner-routes-v1',JSON.stringify({v:1,mode,stars:{warmup:3,classic:3,night:3,storm:3,cup:3,legend:3,daily:3},played:9,best:{}}));},MODE);
 await page.goto(new URL('/arcade?game=runner',BASE).href,{waitUntil:'domcontentloaded',timeout:180000});
 await page.getByRole('button',{name:/^play/i}).first().click({timeout:120000});
 await page.waitForFunction(()=>window.__arcade3d?.phaseRef.current==='playing',null,{timeout:120000});
 const got=await page.evaluate(()=>window.__arcade3d.runtime.state.runner.mode);if(got!==MODE)console.log(`note: the menu opened on '${got}', not '${MODE}'`);
 // The in-page bot and recorder: one requestAnimationFrame loop.
 await page.evaluate(({src,full})=>{
  const step=new Function('return '+src)(),rt=window.__arcade3d.runtime,api={runnerJump:()=>rt.action(1),runnerShoot:()=>rt.action(0),RUNNER_STRIKE_X:-.3};
  let a=7;const r=()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};
  const st={r,lapse:0,lapseT:0,react:0,nerve:1,readT:0,tackleSeen:false,brave:true};
  const rec=window.__runnerEndless={frames:[],seams:[],rounds:[],forced:[],maxSimGap:0,topUps:0,round:1,roundStart:performance.now(),moved:false,calls:0,done:false};
  let last=performance.now(),simT=-1,simAt=last;
  const sample=s=>{const i=rt.stage.renderer.info;return{round:s.round,geometries:i.memory.geometries,textures:i.memory.textures,programs:i.programs?.length??0,calls:rec.calls,objects:s.objects.length,...(()=>{let n=0;const g=new Set();rt.stage.scene.traverse(o=>{n++;if(o.geometry)g.add(o.geometry.uuid);});return{nodes:n,sceneGeometries:g.size};})(),sky:s.sky,score:s.score,distance:Math.round(s.distance),level:s.level};};
  const loop=()=>{if(rec.done)return;const now=performance.now(),dt=Math.min(.1,(now-last)/1000),s=rt.state.runner,phase=window.__arcade3d.phaseRef.current;rec.frames.push([now,now-last]);if(rec.frames.length>4000)rec.frames.splice(0,1000);last=now;
   if(phase==='playing'){
    if(s.lives<2){s.lives=2;rec.topUps++;}
    if(s.time!==simT){simT=s.time;simAt=now;}else rec.maxSimGap=Math.max(rec.maxSimGap,now-simAt);
    if(s.outro>0||s.finished)rec.forced.push({at:now,why:'outro/finished',lives:s.lives});
    rec.calls=Math.max(rec.calls,rt.stage.renderer.info.render.calls);
    if(s.round!==rec.round){rec.seams.push({at:now,from:rec.round,to:s.round,score:s.score,bonus:s.roundBonus,lives:s.lives,jumps:s.jumps+s.doubleJumps,queued:s.queuedMove});rec.rounds.push(sample(s));rec.round=s.round;rec.roundStart=now;rec.moved=false;rec.calls=0;}
    // Fast mode: after 8 s of the round, move the runner to 235 m before the goal line (or the open-round mark).
    if(!full&&!rec.moved&&now-rec.roundStart>8000){rec.moved=true;const end=s.lap?s.finish:s.roundMark;if(end-s.distance>260){s.distance=end-235;s.objects.length=0;s.spawn=1;}}
    for(const m of rec.seams)if(m.hitch===undefined&&now>m.at+3000){let max=0;for(const [at,d] of rec.frames)if(at>m.at-1000&&at<m.at+3000)max=Math.max(max,d);m.hitch=Math.round(max);}
    step(api,s,st,dt);}
   else if(phase==='over')rec.forced.push({at:now,why:'phase over',lives:s.lives});
   requestAnimationFrame(loop);};requestAnimationFrame(loop);},{src:botStep.toString(),full:FULL});
 // Node side: wait for each seam, and answer it with a real touch on Jump.
 const taps=[];const t0=Date.now(),limit=(FULL?150:45)*1000*ROUNDS+60000;let seen=0,shot=false;
 const jump=page.locator('[data-runner-jump]');
 while(seen<ROUNDS&&Date.now()-t0<limit){
  const n=await page.evaluate(()=>window.__runnerEndless.seams.length);
  if(n>seen){seen=n;const before=await page.evaluate(()=>{const s=window.__arcade3d.runtime.state.runner;return{n:s.jumps+s.doubleJumps,q:s.queuedMove,at:performance.now(),seam:window.__runnerEndless.seams.at(-1).at};});
   if(DESKTOP)await page.keyboard.press('ArrowUp');else await jump.tap({timeout:3000}).catch(e=>taps.push({error:String(e).slice(0,120)}));
   const ms=await page.evaluate(async b=>{const s=window.__arcade3d.runtime.state.runner;for(let i=0;i<120;i++){if(s.jumps+s.doubleJumps>b.n||(s.queuedMove==='jump'&&b.q!=='jump')||s.jumping)return performance.now()-b.seam;await new Promise(r=>setTimeout(r,25));}return 9999;},before);
   taps.push({seam:seen,answeredMsAfterSeam:Math.round(ms)});
   if(SHOT&&seen===ROUNDS&&!shot){shot=true;await page.waitForTimeout(2500);await page.screenshot({path:SHOT});}}
  await page.waitForTimeout(60);}
 await page.waitForTimeout(3500);
 const rec=await page.evaluate(()=>{const r=window.__runnerEndless,s=window.__arcade3d.runtime.state.runner,i=window.__arcade3d.runtime.stage.renderer.info;r.done=true;
  const hitch=r.seams.map(m=>m.hitch??-1),all=r.frames.map(f=>f[1]).sort((a,b)=>a-b);
  return{seams:r.seams.map(({from,to,score,bonus,lives})=>({from,to,score,bonus,lives})),hitch,medianFrame:Math.round(all[all.length>>1]),p99Frame:Math.round(all[Math.floor(all.length*.99)]),rounds:r.rounds,forced:r.forced.slice(0,3),maxSimGap:Math.round(r.maxSimGap),topUps:r.topUps,
   end:{phase:window.__arcade3d.phaseRef.current,round:s.round,lives:s.lives,score:s.score,distance:Math.round(s.distance),sky:s.sky,geometries:i.memory.geometries,textures:i.memory.textures},tag:document.querySelector('[data-runner-round]')?.textContent||''};});
 const out={mode:MODE,fast:!FULL,profile:DESKTOP?'desktop 1280x800':LANDSCAPE?'phone landscape 844x390':'phone upright 390x664',seconds:Math.round((Date.now()-t0)/1000),...rec,taps,errors};
 console.log(JSON.stringify(out,null,1));
 if(OBSERVE)return;
 assert.deepEqual(errors,[],'no page errors');
 assert(rec.seams.length>=ROUNDS,`${ROUNDS} rounds cleared (got ${rec.seams.length})`);
 assert.deepEqual(rec.forced,[],'never forced over while hearts remain');assert.equal(rec.end.phase,'playing');
 assert(rec.maxSimGap<DEAD_MS,`the sim clock never stood still for a second (${rec.maxSimGap} ms)`);
 for(const t of taps){assert(!t.error,'the Jump button takes a touch: '+t.error);assert(t.answeredMsAfterSeam<DEAD_MS,`a touch at seam ${t.seam} was answered ${t.answeredMsAfterSeam} ms after the round changed`);}
 for(let i=0;i<rec.hitch.length;i++)assert(rec.hitch[i]<=HITCH_MS,`seam ${i+1}: longest frame ${rec.hitch[i]} ms (limit ${HITCH_MS})`);
 for(let i=1;i<rec.seams.length;i++)assert(rec.seams[i].score>rec.seams[i-1].score,'the score carries on');
 // Leak check: the samples are taken at each seam. A seam builds and adds nothing: the scene graph never grows. One geometry and one
 // texture of slack: a trail geometry is swapped in play (736 or 737 at any moment) and one canvas texture has its first upload late;
 // a leak of one per seam would be two over by the third seam and fail.
 const r=rec.rounds,peak=Math.max(...r.map(x=>x.calls));for(let i=0;i<r.length;i++){assert(r[i].nodes<=r[0].nodes,`scene nodes never grow (seam ${i+1}: ${r[i].nodes} vs ${r[0].nodes})`);assert(r[i].sceneGeometries<=r[0].sceneGeometries+1,`scene geometries never grow (seam ${i+1}: ${r[i].sceneGeometries} vs ${r[0].sceneGeometries})`);
  assert(r[i].textures<=r[0].textures+1,`textures steady (seam ${i+1}: ${r[i].textures} vs ${r[0].textures})`);assert(r[i].geometries<=r[i].sceneGeometries+8,`drawn geometries inside what the scene holds (seam ${i+1}: ${r[i].geometries} of ${r[i].sceneGeometries})`);}
 assert(rec.end.textures<=r[0].textures+1&&rec.end.geometries<=r[0].sceneGeometries+8,'nothing built after the last seam');
 // Draw calls follow what is on the road (a jump-slide gauntlet shows all six defender rigs, the storm sky adds the rain: 59-64 in a first
 // round, 73-77 at the busiest), so the guard is a ceiling on the peak, with the scene-graph check above as the leak guard.
 assert(peak<=DRAW_PEAK,`draw-call peak ${peak} (limit ${DRAW_PEAK})`);
 assert.equal(rec.tag,`Round ${rec.end.round}`,'the margin strip shows the round');
 console.log('RUNNER_ENDLESS_BROWSER_PASS');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
