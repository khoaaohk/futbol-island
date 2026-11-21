#!/usr/bin/env node
// Keepy-Uppy Beat browser check (Nov 21 2026). Plays in real Chrome (always --mute-audio) with real input (CDP touch events on the
// phone profile, real key events on desktop), timed against the game's own song clock (the AudioContext clock when sound is on), and
// asserts: the cards are idle (no rAF running, the AudioContext suspended), the first run asks for the kicking foot and runs the
// tap-timing check, a whole track is played to the results card, a skipped ball costs a ball, pause stops the loop and the audio
// clock, the music is being scheduled, the save is written, no console errors.
//   node scripts/check-keepyuppy-browser.cjs --port=<n> [--mobile] [--size=390x844] [--muted] [--reduced] [--tour] [--track=<1-6>] [--shots[=dir]] [--seq] [--headed]
// --muted: sound off in the game's settings: there is no AudioContext at all and the whole track runs on the performance clock.
// --tour: a save with every track open: the Track of the Day, a track with trick lessons (--track, default 4), the Trick Book.
// --shots: writes keepyuppy-*.png into the directory (default docs/arcade-aaa/shots). --seq: 20 frames of the bean, 50 ms apart.
// Prints the frames drawn on the cards (must be 0), the draw rate in play and the cost of a frame in ms.
// Pass your own server; never the owner's dev server on 8092.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const path=require('node:path'),fs=require('node:fs');
const arg=n=>(process.argv.find(a=>a.startsWith(`--${n}=`))||'').slice(n.length+3),has=n=>process.argv.some(a=>a===`--${n}`||a.startsWith(`--${n}=`));
const port=arg('port')||process.env.PORT,BASE=process.env.FUTBOL_BASE_URL||(port?`http://localhost:${port}`:'');
if(!BASE||/:8092\b/.test(BASE)){console.error('Pass your own server: --port=<port> (not 8092) or FUTBOL_BASE_URL=<url>.');process.exit(1);}
const [vw,vh]=(arg('size')||'390x844').split('x').map(Number),mobile=has('mobile'),reduced=has('reduced'),muted=has('muted'),tour=has('tour'),shots=has('shots'),seq=has('seq'),SHOTS=arg('shots')||path.join(__dirname,'..','docs','arcade-aaa','shots'),TRACK=Math.max(1,Math.min(6,Number(arg('track'))||(tour?4:1)))-1;
const TOUR_SAVE={v:1,strong:'L',offset:0,calibrated:true,best:9000,medal:1,plays:6,tip:3,tracks:{park:{stars:3,best:6900,acc:96,weak:88,plays:3},school:{stars:3,best:11000,acc:93,weak:81,plays:2},beach:{stars:3,best:9000,acc:90,weak:70,plays:1},cage:{stars:2,best:9000,acc:80,weak:64,plays:1},roof:{stars:1,best:4000,acc:55,weak:40,plays:1}},tricks:{stall:6,seal:2},seen:['seal','stall'],feats:['first'],daily:{day:'',stars:0,score:0,acc:0,runs:0,counted:false}};
const seed=o=>{try{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-sound-volume','0.5');if(o.muted)localStorage.setItem('fi2-sound-muted','true');
 if(o.save&&!localStorage.getItem('fi2-keepyuppy-v1'))localStorage.setItem('fi2-keepyuppy-v1',JSON.stringify(o.save));
 if(!localStorage.getItem('fi2-arcade-wallet-v1'))localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,spends:{},runs:{fixture:{game:'island',paid:5000,reason:'playtest entry',at:1}},packs:[]}));}catch{}
 const raf=window.requestAnimationFrame.bind(window);window.__rafCalls=0;window.requestAnimationFrame=cb=>{window.__rafCalls++;return raf(cb);};};
const fails=[],check=(ok,what,detail='')=>{console.log(`${ok?'ok  ':'FAIL'} ${what}${detail?` (${detail})`:''}`);if(!ok)fails.push(what);};
const wait=ms=>new Promise(r=>setTimeout(r,ms)),now=()=>performance.now();
/** wait until node time `at` (ms): a timer for the long part, a spin for the last 3 ms */
const until=async at=>{const d=at-now();if(d>4)await wait(d-3);while(now()<at);};
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:!has('headed'),args:['--mute-audio','--autoplay-policy=no-user-gesture-required','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 try{
  const ctx=await browser.newContext(mobile?{viewport:{width:vw,height:vh},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:reduced?'reduce':'no-preference'}:{viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference'});
  // the island board is stubbed (a dev server without the board's keys answers 503): an empty all-time board, nothing is posted
  await ctx.route('**/api/arcade-board/**',r=>{const u=r.request().url();r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(u.includes('/start')?{ok:true,token:'check'}:u.includes('/top')?{ok:true,all:[],size:20}:{ok:true})});});
  await ctx.addInitScript(seed,{muted,save:tour?TOUR_SAVE:null});const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push('pageerror: '+e.message.slice(0,200)));
  page.on('console',m=>{if(m.type()!=='error')return;const t=m.text();if(/arcade-board|Failed to load resource|favicon|\[HMR\]|Download the React DevTools/i.test(t))return;errors.push('console: '+t.slice(0,200));});
  const cdp=await ctx.newCDPSession(page);
  const shot=async(name,clip)=>{if(!shots)return;fs.mkdirSync(SHOTS,{recursive:true});await page.screenshot({path:path.join(SHOTS,`keepyuppy-${name}.png`),...(clip?{clip}:{})});};
  const click=sel=>page.locator(sel).first().click();
  const rafIn=async ms=>{const a=await page.evaluate(()=>window.__rafCalls);await wait(ms);return (await page.evaluate(()=>window.__rafCalls))-a;};
  const read=()=>page.evaluate(()=>{const h=window.__keepyuppy,g=h&&h.game;if(!h)return null;const a=h.audio,base={ui:h.phase,loop:h.loop,draws:h.draws,cost:h.cost,audio:a?{state:a.state,scheduled:a.scheduled,song:a.songTime()!==null}:{state:'none',scheduled:0,song:false},offset:h.offset,latency:h.latency};if(!g)return base;
   const s=g.state,L=h.view.layout,r=h.stage;return {...base,time:h.time,mode:g.mode,over:s.over,out:s.out,lives:s.lives,score:s.score,combo:s.combo,bestCombo:s.bestCombo,counts:s.counts,stars:g.stars(),acc:Math.round(g.accuracy()*100),end:g.chart.end,total:g.chart.notes.length,dropped:g.chart.notes.filter(n=>n.grade==='drop').map(n=>n.i),bpm:g.chart.bpm,
    notes:g.chart.notes.filter(n=>n.st===0).slice(0,5).map(n=>({i:n.i,t:n.t,tEnd:n.tEnd,lane:n.lane,kind:n.kind,dir:n.dir,trick:n.trick})),pad:{x:r.left,y:r.top+L.padTop+L.padH*.45,w:L.laneW,groundY:r.top+L.groundY,S:L.S,cx:r.left+L.W/2},ball:{...h.view.ball}};});
  const KEY=['KeyD','KeyF','KeyJ','KeyK'];let touchId=0;
  const touch=(type,x,y,id)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id}]});
  /** One note played with real input at node time `at` (ms). */
  async function playNote(n,at,pad){
   const x=pad.x+(n.lane+.5)*pad.w,y=pad.y,id=++touchId;await until(at);
   if(mobile){await touch('touchStart',x,y,id);
    if(n.kind==='swipe'){const dx=n.dir==='side'?(n.lane===0?34:-34):n.dir==='up'?0:26,dy=n.dir==='side'?0:n.dir==='up'?-40:-26;await wait(24);await touch('touchMove',x+dx/2,y+dy/2,id);await wait(24);await touch('touchMove',x+dx,y+dy,id);await wait(24);}
    else if(n.kind==='hold')await until(at+(n.tEnd-n.t)*1000+50);else await wait(34);
    await touch('touchEnd');}
   else{if(n.kind==='swipe'){await page.keyboard.down('Space');await page.keyboard.down(KEY[n.lane]);await wait(40);await page.keyboard.up(KEY[n.lane]);await page.keyboard.up('Space');}
    else{await page.keyboard.down(KEY[n.lane]);if(n.kind==='hold')await until(at+(n.tEnd-n.t)*1000+50);else await wait(34);await page.keyboard.up(KEY[n.lane]);}}
  }
  /** Plays the stage that is on until it is over. `skip` = note indexes to leave (a dropped ball); `each(state,i)` runs between notes. LEAD = input dispatch time. */
  async function playStage(o={}){
   const LEAD=mobile?7:9;let last=-1,played=0,guard=0;
   for(;;){const t0=now(),s=await read(),t1=now();if(!s||s.time===undefined||s.over||s.ui!=='playing'||!s.loop)return {played,s};
    const n=s.notes.find(x=>x.i>last);if(!n){await wait(120);if(++guard>80)return {played,s};continue;}
    const at=(t0+t1)/2+(n.t-s.time)*1000-LEAD+(o.late||0);
    if(at-now()>380){await wait(Math.min(at-now()-250,400));continue;}// sync again close to the ball: the clock read is then ~1 frame old
    last=n.i;if(o.skip&&o.skip.includes(n.i)){await until(at+260);if(o.afterSkip)await o.afterSkip();continue;}
    await playNote(n,at,s.pad);played++;if(o.each)await o.each(s,n.i);}
  }
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('fi2-keepyuppy-v1')||'null'));

  await page.goto(`${BASE}/arcade?game=keepyuppy`,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('[data-keepyuppy-card="start"]',{timeout:90000});await wait(900);
  check(await rafIn(2000)===0,'start card is idle: 0 frames in 2 s');
  check(await page.locator('[data-keepyuppy-shelf] [data-state]').count()===6,'the Trick Book shelf shows 6 slots');
  check(await page.locator('[data-keepyuppy-tracks] button').count()===6,'six tracks are listed');
  await shot(tour?'start-progress':mobile?'start':'desktop-start');

  if(tour){
   check(await page.locator('[data-keepyuppy-tracks] button[data-open]').count()===6,'the tour save has every track open');
   await click('[data-keepyuppy-shelf]');await page.waitForSelector('[data-keepyuppy-book]');await wait(300);await shot('trick-book');check(await page.locator('[data-keepyuppy-book] li').count()===6,'the Trick Book has a card for each of the 6 tricks');await page.keyboard.press('Escape');await wait(300);
   // Track of the Day: the card names the twist; the first seconds are played
   await click('[data-keepyuppy-daily]');await page.waitForSelector('[data-keepyuppy-card="tip"],[data-keepyuppy-card="lesson"]',{timeout:20000});await wait(300);
   // each new trick gets its 10-second lesson first (today's track or the picked one, whichever meets the trick first)
   let lessons=0;const takeLessons=async()=>{let guard=0;while(await page.locator('[data-keepyuppy-card="lesson"]').count()&&guard++<6){if(!lessons){check(await rafIn(1000)===0,'lesson card is idle: 0 frames in 1 s');await shot('lesson-card');}
    const first=!lessons,t0=Date.now();await click('[data-keepyuppy-go]');const r=await playStage({each:async(s,i)=>{if(first&&i===2)await shot('lesson');}});lessons++;
    check(Date.now()-t0<14000,`lesson ${lessons} is about ten seconds`,`${((Date.now()-t0)/1000).toFixed(1)} s, ${r.played} touches`);await page.waitForSelector('[data-keepyuppy-card]',{timeout:8000});await wait(250);}};
   await takeLessons();
   check(await page.locator('[data-keepyuppy-twist]').count()===1,'the Track of the Day card names today\'s twist',await page.locator('[data-keepyuppy-twist]').getAttribute('data-keepyuppy-twist').catch(()=>''));await shot('daily-card');
   await click('[data-keepyuppy-go]');let k=0;await playStage({each:async(s,i)=>{if(i===9)await shot('daily-play');k=i;}});
   await page.waitForSelector('[data-keepyuppy-card="results"]',{timeout:20000});await wait(900);await shot('daily-results');
   {const sv=await state();check(sv.daily.counted&&sv.daily.stars>=1,'today\'s Track of the Day is saved on the device',JSON.stringify(sv.daily));check(/tomorrow/i.test(await page.locator('[data-keepyuppy-near]').innerText()),'the card says a new track comes tomorrow');}
   await click('[data-keepyuppy-menu]');await page.waitForSelector('[data-keepyuppy-card="start"]');await wait(300);
   // a track with tricks
   await click(`[data-keepyuppy-track="${TRACK}"]`);await click('[data-keepyuppy-play]');await page.waitForSelector('[data-keepyuppy-card="lesson"],[data-keepyuppy-card="tip"]',{timeout:20000});await wait(300);
   await takeLessons();
   check(lessons>=2,'new tricks start with their lessons (today\'s track and the picked track together)',`${lessons}`);
   await page.waitForSelector('[data-keepyuppy-card="tip"]');await click('[data-keepyuppy-go]');
   let trickShot=false;await playStage({each:async(s,i)=>{if(!trickShot&&s.notes[1]&&s.notes[1].kind!=='tap'){trickShot=true;await shot('trick');}}});
   await page.waitForSelector('[data-keepyuppy-card="results"]',{timeout:20000});await wait(900);await shot('results-tricks');
   {const res=page.locator('[data-keepyuppy-card="results"]'),stars=Number(await res.getAttribute('data-keepyuppy-stars')),acc=Number(await res.getAttribute('data-keepyuppy-acc')),sv=await state();
    check(stars===3&&acc>=88,`the script three-stars track ${TRACK+1} with real input`,`${stars} stars, ${acc}%`);check(Object.keys(sv.tricks).length>=3,'landed tricks are in the Trick Book',JSON.stringify(sv.tricks));check(sv.seen.length>=3,'lessons are taken once',sv.seen.join(','));}
  }else{
   // first run: the kicking foot, then the one-time tap-timing check
   await click('[data-keepyuppy-play]');await page.waitForSelector('[data-keepyuppy-card="foot"]',{timeout:20000});await wait(300);await shot('foot');
   await click('[data-keepyuppy-foot="R"]');await page.waitForSelector('[data-keepyuppy-card="calib"]',{timeout:20000});await wait(300);check(await rafIn(1500)===0,'stage card is idle: 0 frames in 1.5 s');await shot('calib-card');
   {const a=(await read()).audio;check(muted?a.state==='none':a.state!=='none','sound '+(muted?'off: no AudioContext at all':'on: the AudioContext exists after the first tap'),a.state);}
   await click('[data-keepyuppy-go]');const cal=await playStage({late:30,each:async(s,i)=>{if(i===3)await shot('calib');}});check(cal.played===8,'the timing check is 8 taps',`${cal.played}`);
   await page.waitForSelector('[data-keepyuppy-card="tip"]',{timeout:8000});await wait(300);
   {const sv=await state();check(sv&&sv.strong==='R'&&sv.calibrated&&Math.abs(sv.offset-30)<=28,'the taps (sent 30 ms late) set the offset near +30 ms',`${sv&&sv.offset} ms`);}
   check(await rafIn(1500)===0,'track card is idle: 0 frames in 1.5 s');await shot('track-card');
   if(!muted){const a=(await read()).audio;check(a.state==='suspended','the AudioContext is suspended on the cards',a.state);}
   // the track: a whole run with real input; one ball is left on purpose; a pause in the middle
   await click('[data-keepyuppy-go]');await wait(1200);
   {const a=await read();check(a.ui==='playing'&&a.loop,'the loop runs in play');const d0=a.draws,c0=a.audio.scheduled;await wait(2000);const b=await read(),f=b.draws-d0;check(f>=(reduced?40:90)&&f<=126,`draw rate in play: ${(f/2).toFixed(0)} a second`);
    if(muted)check(b.audio.state==='none'&&!b.audio.song,'sound off: the run is on the performance clock');else{check(b.audio.state==='running'&&b.audio.song,'the song clock is the AudioContext clock',b.audio.state);check(b.audio.scheduled>c0,'music events are being scheduled ahead on the audio clock',`${b.audio.scheduled-c0} voices in 2 s`);}}
   let paused=false,sawCombo=false,dropLives=-1,frames=0;
   const each=async(s,i)=>{
    if(i===2)await shot(mobile?'play':'desktop');
    if(!sawCombo&&s.combo>=9){sawCombo=true;await wait(160);await shot('combo');}
    if(!paused&&i===16){paused=true;await page.keyboard.press('KeyP');await wait(350);const p=await read();check(p.ui==='paused','P pauses');check(await rafIn(1500)===0,'paused: 0 frames in 1.5 s');if(!muted)check((await read()).audio.state==='suspended','paused: the AudioContext is suspended');
     const t=p.time;await wait(300);check(Math.abs((await read()).time-t)<.005,'paused: the song clock stands still');await shot('paused');await page.keyboard.press('KeyP');await wait(250);const q=await read();check(q.ui==='playing'&&q.loop,'P resumes');check(q.time<t-.5,'the song steps back two beats on resume',`${(t-q.time).toFixed(2)} s`);}
    if(seq&&i===1&&shots){const c={x:Math.max(0,s.pad.cx-150),y:Math.max(0,s.pad.groundY-s.pad.S*2.9),width:300,height:s.pad.S*2.9+30};for(let k=0;k<20;k++){await shot(`seq-${String(k).padStart(2,'0')}`,c);frames++;await wait(30);}}};
   const run=await playStage({skip:[5],afterSkip:async()=>{await wait(120);const s=await read();dropLives=s.lives;await shot('drop');},each});
   await page.waitForSelector('[data-keepyuppy-card="results"]',{timeout:20000});await wait(1000);
   {const st=await read(),res=page.locator('[data-keepyuppy-card="results"]'),shown=Number(await res.getAttribute('data-keepyuppy-score')),stars=Number(await res.getAttribute('data-keepyuppy-stars')),acc=Number(await res.getAttribute('data-keepyuppy-acc'));
    console.log(`     run: ${run.played} touches, ${JSON.stringify(st.counts)}, dropped notes [${st.dropped}], best combo ${st.bestCombo}, ${st.score} pts, ${acc}%, ${stars} stars; frame cost avg ${(st.cost.ms/st.cost.n).toFixed(2)} ms, worst ${st.cost.max.toFixed(1)} ms over ${st.cost.n} frames`);
    check(st.over&&!st.out,'the track is played to the end');check(dropLives===4,'a ball left alone costs one ball (5 on track 1)',`${dropLives}`);check(st.counts.drop===1&&st.dropped[0]===5&&st.counts.sweet+st.counts.good>=st.total-3,'real input lands on the beat: nearly every touch Sweet or Good',JSON.stringify(st.counts));
    check(shown===st.score&&stars>=2&&acc>=85,'the results card shows the score and the stars',`${shown} pts, ${stars} stars, ${acc}%`);check(st.cost.ms/st.cost.n<2.5,'a frame costs well under 2.5 ms',`${(st.cost.ms/st.cost.n).toFixed(2)} ms`);
    check(await page.locator('[data-keepyuppy-weak]').count()===1,'the results card has the weak-foot line',await page.locator('[data-keepyuppy-weak]').innerText().catch(()=>''));
    check((await page.locator('[data-keepyuppy-coach]').innerText()).length>10,'the results card coaches');check((await page.locator('[data-keepyuppy-fact]').innerText()).length>20,'the results card teaches one juggling idea');
    check(await rafIn(3000)===0,'results card is idle: 0 frames in 3 s');if(!muted)check((await read()).audio.state==='suspended','results: the AudioContext is suspended');await shot(mobile?'results':'desktop-results');
    const sv=await state();check(sv.tracks.park&&sv.tracks.park.stars===stars&&sv.tracks.park.best===st.score&&sv.plays===1&&sv.tracks.park.weak>=0,'the device save holds stars, best and the weak-foot best',JSON.stringify(sv.tracks.park));check(sv.feats.includes('first'),'the first feat is kept for the weekly card');
    if(seq)check(frames===20,'20 frames of the juggling were written');}
   {const t=Date.now();await click('[data-keepyuppy-again]');await page.waitForSelector('[data-keepyuppy-card="tip"]',{timeout:5000});check(Date.now()-t<1000,'Play again is on the track card in under 1 s',`${Date.now()-t} ms`);}
   // the tab is hidden mid-run: the game pauses itself
   await click('[data-keepyuppy-go]');await wait(1500);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});await wait(300);
   check((await read()).ui==='paused','a hidden tab pauses the run');check(await rafIn(1000)===0,'hidden: 0 frames in 1 s');await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});});
   // back on the start card: track 2 is open now
   await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('[data-keepyuppy-card="start"]',{timeout:60000});await wait(600);check(await page.locator('[data-keepyuppy-tracks] button[data-open]').count()>=2,'stars opened the next track');await shot('start-after');
  }
  check(errors.length===0,'no console errors',errors.slice(0,3).join(' | '));
 }finally{await browser.close();}
 console.log(fails.length?`\n${fails.length} FAILED: ${fails.join('; ')}`:'\nkeepyuppy browser check passed');process.exit(fails.length?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
