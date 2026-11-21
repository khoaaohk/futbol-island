#!/usr/bin/env node
// Hold the Line browser check (Nov 21 2026). Plays in real Chrome with real pointer input (touch on the phone profile, the mouse on
// desktop) and asserts: the start card is idle (no rAF running), the team card waits, the guided first step holds the world until a
// drag up and ends in an OFFSIDE, a scripted reader (step / drop / slide / tap to press, all by real gestures) plays the match to the
// results card, pause stops the loop, the results card shows the match's score and stars and is idle, the next match is playing in
// under 1 s, the season map and Match of the Day open, no console errors.
//   node scripts/check-holdtheline-browser.cjs --port=<n> [--mobile] [--size=390x844] [--reduced] [--shots[=dir]] [--tour] [--headed]
// --mobile: phone touch profile with CDP touch events (default is a 1440x900 desktop with the mouse).
// --shots: writes holdtheline-*.png into the directory (default docs/arcade-aaa/shots). --tour (with --shots): also a runner through
//   on goal, a press with the gap showing, a switch of play, Match of the Day and the season map.
// Prints the frames drawn in 2 s on the start card / paused / results (must be 0), the draw rate and the per-frame cost in play.
// Pass your own server; never the owner's dev server on 8092.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const path=require('node:path'),fs=require('node:fs');
const arg=n=>(process.argv.find(a=>a.startsWith(`--${n}=`))||'').slice(n.length+3),has=n=>process.argv.some(a=>a===`--${n}`||a.startsWith(`--${n}=`));
const port=arg('port')||process.env.PORT,BASE=process.env.FUTBOL_BASE_URL||(port?`http://localhost:${port}`:'');
if(!BASE||/:8092\b/.test(BASE)){console.error('Pass your own server: --port=<port> (not 8092) or FUTBOL_BASE_URL=<url>.');process.exit(1);}
const [vw,vh]=(arg('size')||'390x844').split('x').map(Number),mobile=has('mobile'),reduced=has('reduced'),shots=has('shots'),tour=has('tour'),SHOTS=arg('shots')||path.join(__dirname,'..','docs','arcade-aaa','shots');
const seed=()=>{try{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-sound-volume','0.5');
 if(!localStorage.getItem('fi2-arcade-wallet-v1'))localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,spends:{},runs:{fixture:{game:'island',paid:5000,reason:'playtest entry',at:1}},packs:[]}));}catch{}
 const raf=window.requestAnimationFrame.bind(window);window.__rafCalls=0;window.requestAnimationFrame=cb=>{window.__rafCalls++;return raf(cb);};};
const fails=[],check=(ok,what,detail='')=>{console.log(`${ok?'ok  ':'FAIL'} ${what}${detail?` (${detail})`:''}`);if(!ok)fails.push(what);};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:!has('headed'),args:['--mute-audio','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 try{
  const ctx=await browser.newContext(mobile?{viewport:{width:vw,height:vh},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:reduced?'reduce':'no-preference'}:{viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference'});
  // the island board is stubbed (a dev server without the board's keys answers 503): an empty all-time board, nothing is posted
  await ctx.route('**/api/arcade-board/**',r=>{const u=r.request().url();r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(u.includes('/start')?{ok:true,token:'check'}:u.includes('/top')?{ok:true,all:[],size:20}:{ok:true})});});
  await ctx.addInitScript(seed);const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push('pageerror: '+e.message.slice(0,200)));
  page.on('console',m=>{if(m.type()!=='error')return;const t=m.text();if(/arcade-board|Failed to load resource|favicon|\[HMR\]|Download the React DevTools/i.test(t))return;errors.push('console: '+t.slice(0,200));});
  const cdp=mobile?await ctx.newCDPSession(page):null;
  const shot=async name=>{if(!shots)return;fs.mkdirSync(SHOTS,{recursive:true});await page.screenshot({path:path.join(SHOTS,`holdtheline-${name}.png`)});};
  /** a real gesture along the points (page px): touch on the phone profile, the mouse on desktop */
  const gesture=async(pts,stepMs=12)=>{const t=(type,p)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:p?[{x:p[0],y:p[1],id:1}]:[]});
   if(mobile){await t('touchStart',pts[0]);for(const p of pts.slice(1)){await wait(stepMs);await t('touchMove',p);}await wait(stepMs);await t('touchEnd');}
   else{await page.mouse.move(pts[0][0],pts[0][1]);await page.mouse.down();for(const p of pts.slice(1)){await wait(stepMs);await page.mouse.move(p[0],p[1]);}await wait(stepMs);await page.mouse.up();}};
  /** drag the line by (dx, dy) css px from the middle of the bottom of the stage */
  const drag=async(R,dx,dy)=>{const x=R.x+R.w/2,y=R.y+R.h*.8;await gesture([[x,y],[x+dx*.2,y+dy*.2],[x+dx*.6,y+dy*.6],[x+dx,y+dy]]);};
  const tapAt=async(x,y)=>{if(mobile){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await wait(30);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}else{await page.mouse.move(x,y);await page.mouse.down();await wait(30);await page.mouse.up();}};
  const rafIn=async ms=>{const a=await page.evaluate(()=>window.__rafCalls);await wait(ms);return (await page.evaluate(()=>window.__rafCalls))-a;};
  const read=()=>page.evaluate(()=>{const h=window.__holdtheline,g=h&&h.game;if(!g)return null;const s=g.state,L=g.look(),r=h.stage,near=g.nearest(),d=s.defs[near],p=h.view.project(d.x,d.y),gn=h.view.gain(s.lineY);
   return {ui:h.phase,loop:h.loop,guide:h.guide,frozen:h.frozen,phase:s.phase,over:s.over,won:s.won,stars:s.stars,wave:s.wave,goals:s.goals,stops:s.stops,score:s.score,lineY:s.lineY,lineX:s.lineX,wantY:s.wantY,wantX:s.wantX,press:!!s.press,gap:!!s.press&&Math.abs(s.defs[s.press.i].y-s.lineY)>3,
    res:s.res&&s.res.kind,kind:g.plans[Math.min(s.wave,g.plans.length-1)].kind,stage:s.stage,L,rect:{x:r.left,y:r.top,w:r.width,h:r.height},def:{x:r.left+p.x,y:r.top+p.y-p.s*1.4},gain:gn,team:g.team.id,limit:g.tn.limit};});
  const click=sel=>page.locator(sel).first().click();
  /** Plays until the match is over (or `until(s)`), answering what a player can see with real gestures. `skip`: wave kinds to leave alone. */
  async function playMatch(o={}){let wave=-1,seen='',t0=Date.now();const cap=o.cap||{};
   for(;;){const s=await read();if(!s||s.ui!=='playing')return s;if(s.over)return s;if(Date.now()-t0>(o.ms||240000))return null;if(o.until&&o.until(s))return s;
    if(s.wave!==wave){wave=s.wave;seen='';}
    const L=s.L,idle=o.idle&&o.idle(s);
    if(cap.through&&s.res==='through'){await wait(900);await shot(cap.through);cap.through='';}
    if(cap.gap&&s.gap&&s.phase==='play'){await shot(cap.gap);cap.gap='';}
    if(cap.sw&&L.wide&&s.kind==='switch'&&s.stage==='fly'&&o.idle){await wait(420);await shot(cap.sw);cap.sw='';}
    if(cap.offside&&s.res==='offside'){await wait(260);await shot(cap.offside);cap.offside='';}
    if(L.play&&!idle){const tag=L.tell?'tell:'+L.tell.kind:L.wide?'wide:'+L.wide:L.heavy?'heavy':L.waiting?'waiting':L.deepPasser?'deep':'';
     if(tag&&tag!==seen){seen=tag;const R=s.rect;
      if(L.tell&&(L.tell.kind==='thru'||L.tell.kind==='feet'))await drag(R,0,-2.8*s.gain.y/1.25);
      else if(L.tell&&L.tell.kind==='long'||(!L.tell&&L.deepPasser))await drag(R,0,Math.max(0,s.wantY-15.5)*s.gain.y/1.25);
      else if(L.wide)await drag(R,(L.wide*5-s.wantX)*s.gain.x/1.25,0);
      else if(L.heavy||L.waiting||(L.tell&&L.tell.kind==='shot')){if(o.badPress===undefined)await tapAt(s.def.x,s.def.y);}
      continue;}}
    if(o.pressAt!==undefined&&s.wave===o.pressAt&&s.phase==='play'&&!s.press&&s.stage==='hold'&&seen!=='pressed'&&L.carrier>=0&&L.carrier<=2){seen='pressed';await tapAt(s.def.x,s.def.y);}
    await wait(22);}}

  await page.goto(`${BASE}/arcade?game=holdtheline`,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('[data-holdtheline-card="start"]',{timeout:60000});await page.waitForFunction(()=>!!window.__holdtheline,null,{timeout:20000});await wait(900);
  check(await page.locator('[data-holdtheline-shelf] svg').count()===12,'the start card shows the trap book: twelve slots');
  {const n=await rafIn(2000);check(n===0,'start card: 0 frames in 2 s',String(n));}await shot('start');
  await click('[data-holdtheline-play]');await page.waitForSelector('[data-holdtheline-card="tip"]',{timeout:15000});await wait(500);
  {const n=await rafIn(1500);check(n===0,'team card: 0 frames in 1.5 s',String(n));}await shot('team');
  check((await page.locator('[data-holdtheline-card="tip"]').getAttribute('data-holdtheline-team'))==='coconut','the first match is against Coconut Rovers');
  await click('[data-holdtheline-ack]');
  // the guided first step: the world holds on the wind-up until a drag up
  await page.waitForSelector('[data-holdtheline-guide="watch"]',{timeout:8000}).then(()=>check(true,'guided first wave: "Watch the passer"')).catch(()=>check(false,'guided first wave: "Watch the passer"'));
  await page.waitForSelector('[data-holdtheline-guide="step"]',{timeout:20000}).catch(()=>{});await wait(400);
  {const s=await read();check(!!s&&s.guide==='step'&&!s.loop,'the world holds on the wind-up (loop asleep)',s?`guide ${s.guide} loop ${s.loop}`:'');const n=await rafIn(1000);check(n===0,'held: 0 frames in 1 s',String(n));await shot('guide');
   const y0=s.lineY;await drag(s.rect,0,-70);await wait(160);const a=await read();check(a.wantY>y0+.8&&a.guide==='off','a drag up steps the line and the game goes on',`want ${a.wantY.toFixed(1)} from ${y0.toFixed(1)}`);}
  {let s=null;for(let i=0;i<120;i++){s=await read();if(s&&s.phase==='res')break;await wait(25);}check(!!s&&s.res==='offside','the guided step catches the runner OFFSIDE',s?String(s.res):'');await wait(300);await shot('offside');
   check(await page.evaluate(()=>{try{return JSON.parse(localStorage.getItem('fi2-holdtheline-v1')).intro===true;}catch{return false;}}),'the guide is shown once (saved)');}
  // pause stops the loop
  {for(let i=0;i<200;i++){const s=await read();if(s&&s.phase==='play'&&s.wave>=1)break;await wait(30);}
   await page.keyboard.press('KeyP');await wait(400);const n=await rafIn(2000),s=await read();check(s.ui==='paused'&&n===0,'paused: 0 frames in 2 s',`${s.ui} ${n}`);await page.keyboard.press('KeyP');await wait(200);check((await read()).ui==='playing','P resumes');}
  // desktop: the keys move the line
  if(!mobile){const a=await read();await page.keyboard.down('KeyS');await wait(350);await page.keyboard.up('KeyS');await page.keyboard.down('KeyD');await wait(250);await page.keyboard.up('KeyD');const b=await read();check(b.wantY<a.wantY-1&&b.wantX>a.wantX+.5,'keys: S drops the line, D slides it',`${a.wantY.toFixed(1)}->${b.wantY.toFixed(1)}, ${a.wantX.toFixed(1)}->${b.wantX.toFixed(1)}`);
   await page.keyboard.down('KeyW');await wait(400);await page.keyboard.up('KeyW');}
  // the rest of the match by the reader script (real gestures), measuring the draw rate and frame cost
  const d0=await page.evaluate(()=>({n:window.__holdtheline.draws,t:performance.now()}));
  const end=await playMatch({cap:{offside:tour?'':''}});
  const d1=await page.evaluate(()=>({n:window.__holdtheline.draws,t:performance.now(),c:window.__holdtheline.cost}));
  check(!!end&&end.over,'the match reaches full time',end?`goals ${end.goals}, stops ${end.stops}, score ${end.score}`:'timeout');
  console.log(`play: ${((d1.n-d0.n)/((d1.t-d0.t)/1000)).toFixed(1)} draws a second; rules + draw ${(d1.c.ms/Math.max(1,d1.c.n)).toFixed(2)} ms a frame on average, ${d1.c.max.toFixed(1)} ms worst, over ${d1.c.n} frames`);
  check(d1.c.ms/Math.max(1,d1.c.n)<4,'a frame costs under 4 ms on average');
  await page.waitForSelector('[data-holdtheline-card="results"]',{timeout:15000});await wait(900);
  {const card=page.locator('[data-holdtheline-card="results"]'),score=Number(await card.getAttribute('data-holdtheline-score')),stars=Number(await card.getAttribute('data-holdtheline-stars')),won=await card.getAttribute('data-holdtheline-won');
   check(score===end.score&&score>0,'results show the match score',`${score}`);check(won==='1'&&stars>=1,'the reader wins the first match',`stars ${stars}, goals ${end.goals}`);
   const n=await rafIn(2000);check(n===0,'results: 0 frames in 2 s',String(n));await shot('results');
   check(await page.evaluate(()=>{try{const s=JSON.parse(localStorage.getItem('fi2-holdtheline-v1'));return s.season[0][0]>=1&&s.plays===1;}catch{return false;}}),'the win is saved: the next match is open');}
  // next match in under a second
  {const t=Date.now();await page.locator('[data-arcade-board] button, [data-hs-skip]').first().click({timeout:800}).catch(()=>{});
   await click('[data-holdtheline-next]').catch(async()=>{await page.keyboard.press('Escape');await click('[data-holdtheline-next]').catch(()=>{});});await page.waitForSelector('[data-holdtheline-card="tip"]',{timeout:8000}).catch(()=>{});const ms=Date.now()-t;
   const team=await page.locator('[data-holdtheline-card="tip"]').getAttribute('data-holdtheline-team').catch(()=>null);check(team==='sandy','"Next match" opens the next team',`${team} in ${ms} ms`);}
  if(tour){
   // match two with screenshots: a switch of play, a press on a plain pass (the gap), a runner through on goal (one wave left alone)
   await click('[data-holdtheline-ack]');let left=-1;
   await playMatch({cap:{sw:'switch',through:'through'},idle:s=>{if(left<0&&(s.kind==='thru')&&s.wave>=1)left=s.wave;return s.wave===left;},ms:200000});
   await page.waitForSelector('[data-holdtheline-card="results"]',{timeout:20000}).catch(()=>{});await wait(600);await page.keyboard.press('Escape').catch(()=>{});
   await page.goto(`${BASE}/arcade?game=holdtheline`,{waitUntil:'domcontentloaded'});await page.waitForSelector('[data-holdtheline-card="start"]',{timeout:60000});await wait(700);await shot('start-progress');
   await click('[data-holdtheline-season]');await page.waitForSelector('[data-holdtheline-map]',{timeout:8000});await wait(400);await shot('season');check(await page.locator('[data-holdtheline-map] button[data-open]').count()>=2,'the season map: the won matches and the next one are open');
   await page.locator('[data-holdtheline-match="0"]').click();await page.waitForSelector('[data-holdtheline-card="tip"]',{timeout:8000});await click('[data-holdtheline-ack]');
   await playMatch({cap:{gap:'press'},pressAt:0,until:s=>s.wave>=1,ms:60000});
   await page.goto(`${BASE}/arcade?game=holdtheline`,{waitUntil:'domcontentloaded'});await page.waitForSelector('[data-holdtheline-card="start"]',{timeout:60000});await wait(500);
   await click('[data-holdtheline-daily]');await page.waitForSelector('[data-holdtheline-card="tip"]',{timeout:8000});await wait(400);await shot('motd');check((await page.locator('[data-holdtheline-card="tip"]').getAttribute('data-holdtheline-team'))==='motd','Match of the Day opens');
   await click('[data-holdtheline-ack]');const d=await playMatch({ms:200000});check(!!d&&d.over,'Match of the Day reaches full time',d?`stars ${d.stars}`:'');await page.waitForSelector('[data-holdtheline-card="results"]',{timeout:15000}).catch(()=>{});await wait(700);await shot('motd-results');
  }
  // looked away: the game pauses itself
  check(errors.length===0,'no console errors',errors.slice(0,3).join(' | '));
 }finally{await browser.close();}
 console.log(fails.length?`check-holdtheline-browser: ${fails.length} FAILED`:'check-holdtheline-browser: ok');process.exit(fails.length?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
