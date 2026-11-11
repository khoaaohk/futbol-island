// Futbol Tennis endless-play check (Nov 10 2026). Phone profile (390x844 upright, touch). A scripted bot plays in the page (it walks to
// the bounce, kicks into the open side through the game's own action hook, aims the Target Drill) and REAL touches on the Kick button
// serve and answer every seam. It wins match after match and asserts:
//  - the run is never forced over while balls remain (the arcade stays 'playing', the sim never reaches 'over');
//  - the seam (match won -> the next opponent serving) hands control back inside LOCK_MS of the winning point when the player presses
//    (a real touch on Kick), and unpressed it is no longer than an ordinary point (the pause between points itself is unchanged: 1.55 s);
//  - the venue swap costs under SWAP_MS and no frame around a seam is longer than HITCH_MS (from 0.5 s before to 1.5 s after);
//  - nothing grows match over match: the scene graph (nodes, distinct geometries) and renderer.info textures are identical at every
//    seam. renderer.info geometries and shader programs count things as they are first DRAWN, so they rise by one or two while each
//    stop's own props (the stand, the pier, the lanterns) get their first showing (measured 39 -> 44 and 23 -> 25 over five stops);
//    they never pass what the scene holds, and from the second lap of the nine stops (--matches=11 or more) they must not move at all.
//   node scripts/check-tennis-endless.cjs --port=<n>            fast: every match starts two points from won (the drill two balls
//                                                               from passed), so the last points, the starburst and the seam play in real time
//   node scripts/check-tennis-endless.cjs --port=<n> --full     real time, whole matches (about a minute a match for the bot)
//   --court=<1..9> start court (default 1) · --tour=<1|2> a tour instead · --matches=<n> seams to cross (default 5) · --desktop
//   --observe logs instead of asserting · --shot=<file.png> saves a frame from the last match (the score panel with the match readout)
// Balls: the bot is topped up to three so a lost match cannot end the check early; the over test is about the seam, not the bot.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert=require('node:assert/strict');
const arg=n=>(process.argv.find(a=>a.startsWith('--'+n+'='))||'').slice(n.length+3);
const portArg=arg('port')||process.env.PORT,BASE=process.env.FUTBOL_BASE_URL||(portArg?`http://localhost:${portArg}`:'');
if(!BASE){console.error('Pass your own server: --port=<port>, PORT=<port> or FUTBOL_BASE_URL=<url>. There is no default port.');process.exit(1);}
const COURT=Math.max(1,Math.min(9,Number(arg('court'))||1)),TOUR=Number(arg('tour'))||0,MATCHES=Number(arg('matches'))||5,FULL=process.argv.includes('--full'),OBSERVE=process.argv.includes('--observe'),DESKTOP=process.argv.includes('--desktop'),SHOT=arg('shot');
/** The game draws at 30 fps (33 ms); a dev build on a busy laptop jitters to about 60 ms. */
const LOCK_MS=1000,HITCH_MS=120,SWAP_MS=50,POINT_MS=1900;
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome',args:['--mute-audio']});try{
 const page=await browser.newPage({viewport:DESKTOP?{width:1280,height:800}:{width:390,height:844},isMobile:!DESKTOP,hasTouch:!DESKTOP}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(court=>{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-sound-muted','true');localStorage.setItem('fi2-music-enabled','false');localStorage.setItem('fi2-voice-enabled','false');localStorage.setItem('fi2-tennis-r3-hint-v1','1');
  if(!localStorage.getItem('fi2-arcade-wallet-v1'))localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,spends:{},runs:{'baseline-grant':{game:'island',paid:5000,reason:'baseline',at:Date.now()}},best:{},attempts:{},visits:{},packs:[]}));
  localStorage.setItem('fi2-arcade-record-tennis-v1',JSON.stringify({best:1,unlocked:9}));},COURT);
 await page.goto(new URL('/arcade?game=tennis',BASE).href,{waitUntil:'domcontentloaded',timeout:180000});
 await page.locator('[data-tennis-card="ready"]').waitFor({timeout:120000});
 if(TOUR)await page.locator(`[data-tennis-tour="${TOUR}"]`).click();else await page.locator(`[data-court="${COURT}"]`).click();
 await page.getByRole('button',{name:/^play/i}).first().click({timeout:120000});
 await page.waitForFunction(()=>window.__arcade3d?.phaseRef.current==='playing',null,{timeout:120000});
 const got=await page.evaluate(()=>{const s=window.__arcade3d.runtime.state.tennis;return {level:s.level,tour:s.tour};});assert.equal(got.tour,TOUR);if(!TOUR)assert.equal(got.level,COURT,'the picked court is the starting court');
 // The in-page bot and recorder: one requestAnimationFrame loop.
 await page.evaluate(full=>{
  const rt=window.__arcade3d.runtime,s=rt.state.tennis;
  const rec=window.__tennisEndless={seams:[],forced:[],frames:[],topUps:0,ended:0,endAt:0,endWon:false,match:s.match,matchStart:performance.now(),pointSince:0,pointMax:0,kicks:0,over:false,primed:0};
  const counts=()=>{const info=rt.stage.renderer.info,scene=rt.stage.scene,geos=new Set();let nodes=0;scene?.traverse?.(o=>{nodes++;if(o.geometry)geos.add(o.geometry.uuid);});
   return {geometries:info.memory.geometries,textures:info.memory.textures,programs:info.programs?.length??0,nodes,sceneGeometries:geos.size,calls:info.render.calls};};
  let last=performance.now(),seen=-1;
  const loop=()=>{const now=performance.now(),gap=now-last;last=now;rec.frames.push([now,gap]);if(rec.frames.length>600)rec.frames.shift();
   const phase=window.__arcade3d?.phaseRef.current;if(phase&&phase!=='playing')rec.forced.push({phase,match:s.match,lives:s.tourLives});
   if(s.phase==='over'){rec.over=true;rec.forced.push({phase:'sim over',match:s.match,lives:s.tourLives});}
   // Balls topped up: the check is about the seam, not the bot.
   if(s.tourLives<(s.tour===2?2:3)&&s.phase!=='over'&&!s.seam){s.tourLives=s.tour===2?2:3;rec.topUps++;}
   // Fast mode: a new match starts two points from won (the drill two balls from passed).
   if(!full&&rec.primed!==s.match&&s.phase==='serve'){rec.primed=s.match;const drill=s.drillLeft>0;
    if(s.tour){const need=5-s.tourWins%5;if(need>2)s.tourWins+=need-2;}
    else if(drill){s.drillLeft=2;s.drillHits=13;s.score.you=13;}
    else{const to=[5,7,7,7,7,7,7,7,4][s.level-1];s.score.you=Math.max(s.score.you,to-2);if(s.level===9)s.sets.you=1;}}
   // A decided match, then the seam (the match number moves on at the next serve).
   if(s.matchEvents!==rec.ended){rec.ended=s.matchEvents;rec.endAt=now;rec.endWon=s.matchWinner==='you';}
   if(s.match!==rec.match){const seam={match:s.match,level:s.level,stop:s.venueStop,at:now,lockMs:Math.round(now-rec.endAt),swapMs:0,matchMs:Math.round(now-rec.matchStart),score:s.tourScore,lives:s.tourLives};rec.match=s.match;rec.matchStart=now;rec.seams.push(seam);
    setTimeout(()=>{let hitch=0;for(const [t,g] of rec.frames)if(t>=seam.at-500&&t<=seam.at+1500)hitch=Math.max(hitch,g);seam.hitchMs=Math.round(hitch);seam.swapMs=+rt.tennisSeam().last.toFixed(2);/* read once the game has run its own frame: a pressed seam changes the match before the swap */seam.swaps=rt.tennisSeam().count;Object.assign(seam,counts());seam.settled=true;},1600);}
   // The longest ordinary pause between points (input is ignored there, as it always was).
   if(s.phase==='point'&&!s.seam){if(!rec.pointSince)rec.pointSince=now;}else if(rec.pointSince){rec.pointMax=Math.max(rec.pointMax,now-rec.pointSince);rec.pointSince=0;}
   // The bot: stand behind the bounce, kick into the open side; on the drill, the shot and side of the gold target.
   if(s.phase==='rally'&&s.ball.last==='rival'){const b=s.ball,out=s.incomingOut&&!b.bounces;
    if(!out){s.you.direct=false;s.you.targetX=Math.max(-4.55,Math.min(4.55,b.bounces?b.x:s.landX));s.you.targetY=Math.max(.95,Math.min(7.45,(b.bounces?b.y:s.landY)+(b.bounces?.3:.85)));
     const d=Math.hypot(s.you.x-b.x,s.you.y-b.y);
     if(b.crossed&&b.y>.2&&b.z<1.1&&d<.95&&(b.bounces>=1||d<.6)&&s.kickCount!==seen){seen=s.kickCount;rec.kicks++;
      if(s.drillLeft>0){const shot=s.targetY>-3.5?2:s.targetY<-6?1:0;s.shotAim=Math.max(-1,Math.min(1,s.targetX/(3.7*(shot===2?.7:1))));rt.action(shot);}
      else{s.shotAim=(s.rival.x>.7?-1:s.rival.x<-.7?1:s.kickCount%2?1:-1)*.8;rt.action(0);}}}}
   if(!rec.done)requestAnimationFrame(loop);};
  requestAnimationFrame(loop);},FULL);
 // Real touches (or Space on desktop): serve, and answer every seam at once.
 const kick=page.locator('[data-tennis-action="kick"]'),press=async()=>{if(DESKTOP)await page.keyboard.press('Space');else await kick.tap({timeout:2000}).catch(()=>{});};
 const t0=Date.now(),limit=(FULL?MATCHES*240:MATCHES*100)*1000+60000;let seamPresses=0,state,timedOut=false;
 for(;;){state=await page.evaluate(()=>{const s=window.__arcade3d.runtime.state.tennis,r=window.__tennisEndless;return {phase:s.phase,server:s.server,seam:s.seam,phaseTime:s.phaseTime,seams:r.seams.length,settled:r.seams.filter(x=>x.settled).length,over:r.over};});
  if(state.settled>=MATCHES||state.over)break;if(Date.now()-t0>limit){timedOut=true;break;}
  if(state.phase==='serve'&&state.server==='you')await press();else if(state.phase==='point'&&state.seam){seamPresses++;await press();}
  await page.waitForTimeout(90);}
 if(SHOT)await page.screenshot({path:SHOT});
 const rec=await page.evaluate(()=>{const r=window.__tennisEndless;r.done=true;const s=window.__arcade3d.runtime.state.tennis;return {seams:r.seams,forced:r.forced.slice(0,3),topUps:r.topUps,pointMax:Math.round(r.pointMax),kicks:r.kicks,over:r.over,final:{match:s.match,won:s.matchesWon,level:s.level,lives:s.tourLives,score:s.tourScore,phase:s.phase},swap:window.__arcade3d.runtime.tennisSeam(),arcade:window.__arcade3d.phaseRef.current,panel:document.querySelector('[data-tennis-match]')?.textContent||''};});
 // An unpressed seam: let the next one run out by itself and time it.
 let idle=null;if(!state.over){idle=await page.evaluate(()=>new Promise(res=>{const s=window.__arcade3d.runtime.state.tennis,start=performance.now();let endAt=0,events=s.matchEvents,match=s.match;const rt=window.__arcade3d.runtime;
   const tick=()=>{const now=performance.now();if(now-start>90000){res(null);return;}
    if(s.phase==='serve'&&s.server==='you'&&!endAt){s.score.you=Math.max(s.score.you,[5,7,7,7,7,7,7,7,4][s.level-1]-1);if(s.level===9)s.sets.you=1;rt.action(0);}
    if(s.phase==='rally'&&s.ball.last==='rival'&&!endAt){const b=s.ball;s.you.direct=false;s.you.targetX=Math.max(-4.55,Math.min(4.55,b.bounces?b.x:s.landX));s.you.targetY=Math.max(.95,Math.min(7.45,(b.bounces?b.y:s.landY)+(b.bounces?.3:.85)));if(b.crossed&&b.y>.2&&b.z<1.1&&Math.hypot(s.you.x-b.x,s.you.y-b.y)<.95&&b.bounces>=1){s.shotAim=(s.rival.x>.7?-1:s.rival.x<-.7?1:1)*.8;rt.action(0);}}
    if(s.matchEvents!==events&&!endAt){if(s.matchWinner==='you')endAt=now;else events=s.matchEvents;}
    if(endAt&&s.match!==match){res(Math.round(now-endAt));return;}requestAnimationFrame(tick);};requestAnimationFrame(tick);}));}
 const lockMax=Math.max(0,...rec.seams.map(s=>s.lockMs)),hitchMax=Math.max(0,...rec.seams.map(s=>s.hitchMs||0)),swapMax=Math.max(0,...rec.seams.map(s=>s.swapMs));
 console.log(`TENNIS_ENDLESS ${DESKTOP?'desktop':'phone'} ${FULL?'full':'fast'} ${TOUR?'tour '+TOUR:'court '+COURT}: ${rec.seams.length} seams, final match ${rec.final.match} (won ${rec.final.won}), score ${rec.final.score}, balls ${rec.final.lives}, bot kicks ${rec.kicks}, top-ups ${rec.topUps}, seam presses ${seamPresses}`);
 console.log(` seam lock (pressed) max ${lockMax} ms · unpressed seam ${idle??'n/a'} ms · ordinary point pause max ${rec.pointMax} ms · venue swap max ${swapMax} ms · longest frame near a seam ${hitchMax} ms · panel "${rec.panel}"`);
 for(const s of rec.seams)console.log(`  -> match ${s.match} court ${s.level} stop ${s.stop}: lock ${s.lockMs} ms, swap ${s.swapMs} ms, hitch ${s.hitchMs} ms, geometries ${s.geometries} (scene ${s.sceneGeometries}), textures ${s.textures}, programs ${s.programs}, nodes ${s.nodes}, draws ${s.calls}, match took ${Math.round(s.matchMs/1000)} s`);
 if(errors.length)console.log(' page errors:',errors.slice(0,3));
 if(!OBSERVE){
  assert.equal(errors.length,0,'no page errors: '+errors[0]);assert.equal(rec.over,false,'the sim never reached over while balls remained');assert.deepEqual(rec.forced,[],'never forced out of play');assert.equal(rec.arcade,'playing');
  assert(!timedOut,`the bot ran out of time after ${rec.seams.length} of ${MATCHES} matches (not a forced over: the hard courts take it longer; use fewer --matches)`);assert(rec.seams.length>=Math.max(3,MATCHES),`at least three matches won in a row (${rec.seams.length} seams)`);assert.equal(rec.final.won,rec.final.match-1,'every match was won in a row');
  for(const [i,s] of rec.seams.entries()){assert(s.lockMs<LOCK_MS,`seam ${i+1}: control back ${s.lockMs} ms after the winning point (limit ${LOCK_MS})`);assert(s.swapMs<SWAP_MS,`seam ${i+1}: venue swap ${s.swapMs} ms (limit ${SWAP_MS})`);assert.equal(s.swaps,i+1,`seam ${i+1}: one venue swap a seam`);assert(s.hitchMs<HITCH_MS,`seam ${i+1}: longest frame ${s.hitchMs} ms (limit ${HITCH_MS})`);
   assert(s.geometries<=s.sceneGeometries+2,`seam ${i+1}: renderer geometries ${s.geometries} within the scene's ${s.sceneGeometries}`);
   if(i){const a=rec.seams[0];assert.equal(s.textures,a.textures,`seam ${i+1}: textures steady`);assert.equal(s.nodes,a.nodes,`seam ${i+1}: scene nodes steady`);assert.equal(s.sceneGeometries,a.sceneGeometries,`seam ${i+1}: scene geometries steady`);assert(s.programs<=a.programs+8,`seam ${i+1}: shader programs bounded (${a.programs} -> ${s.programs})`);}
   if(i>8){const p=rec.seams[8];assert.equal(s.geometries,p.geometries,`seam ${i+1}: second lap, renderer geometries steady`);assert.equal(s.programs,p.programs,`seam ${i+1}: second lap, shader programs steady`);}}
  if(!TOUR){const stops=rec.seams.map(s=>s.level);for(let i=0;i<stops.length;i++)assert.equal(stops[i],(COURT+i)%9+1,'the nine-stop order');}
  assert(rec.pointMax<POINT_MS,`the ordinary pause between points is unchanged (${rec.pointMax} ms)`);if(idle!==null)assert(idle<POINT_MS,`an unpressed seam is one ordinary point long (${idle} ms)`);
  assert(/^Match \d+/.test(rec.panel),'the score panel names the match');
  console.log('TENNIS_ENDLESS_PASS');}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
