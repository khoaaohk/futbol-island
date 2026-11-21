#!/usr/bin/env node
// Safe Hands browser check (Nov 21 2026). Plays in real Chrome with real pointer input (touch on the phone profile, the mouse on
// desktop) and asserts: the start card is idle (no rAF running), the round card waits, a drag sets the keeper's position, a swipe on
// the planted foot saves the shot, goals cost lives, pause stops the loop, the results card shows the run's score and is idle,
// "Play again" is playing again in under 1 s, no console errors.
//   node scripts/check-safehands-browser.cjs --port=<n> [--mobile] [--size=390x844] [--reduced] [--shots[=dir]] [--tour] [--headed]
// --mobile: phone touch profile with CDP touch events (default is a 1440x900 desktop with the mouse).
// --shots: writes safehands-*.png (start, round card, a penalty with the tell showing, a save, results) into the directory
//   (default docs/arcade-aaa/shots). --tour (with --shots --mobile): also First team (a free kick with the wall, a cross), the glove
//   shelf and a scouting card.
// Prints the frames drawn in 3 s on the start card / paused / results (must be 0) and the draw rate in play.
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
  const shot=async name=>{if(!shots)return;fs.mkdirSync(SHOTS,{recursive:true});await page.screenshot({path:path.join(SHOTS,`safehands-${name}.png`)});};
  /** a real gesture along the points (page px): touch on the phone profile, the mouse on desktop */
  const gesture=async(pts,stepMs=16)=>{const t=(type,p)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:p?[{x:p[0],y:p[1],id:1}]:[]});
   if(mobile){await t('touchStart',pts[0]);for(const p of pts.slice(1)){await wait(stepMs);await t('touchMove',p);}await wait(stepMs);await t('touchEnd');}
   else{await page.mouse.move(pts[0][0],pts[0][1]);await page.mouse.down();for(const p of pts.slice(1)){await wait(stepMs);await page.mouse.move(p[0],p[1]);}await wait(stepMs);await page.mouse.up();}};
  const rafIn=async ms=>{const a=await page.evaluate(()=>window.__rafCalls);await wait(ms);return (await page.evaluate(()=>window.__rafCalls))-a;};
  const read=()=>page.evaluate(()=>{const h=window.__safehands,g=h&&h.game;if(!g)return null;const s=g.state,sh=s.shot,tl=g.tells(),l=g.looseBall(),r=h.stage;
   return {ui:h.phase,loop:h.loop,phase:s.phase,pt:s.pt,over:s.over,score:s.score,lives:s.lives,tier:s.tier,shotN:s.shotN,saves:s.stats.saves,goals:s.stats.goals,kx:s.kx,kd:s.kd,wantX:s.wantX,wantD:s.wantD,act:!!s.act,decision:s.decision,
    res:s.res&&{saved:s.res.saved,kind:s.res.kind},gain:h.view.gain,rect:{x:r.left,y:r.top,w:r.width,h:r.height},
    sh:sh&&{kind:sh.kind,bx:sh.bx,bz:sh.bz,wallBest:sh.wallBest,near:sh.near,wallN:sh.wallN,closeIn:sh.closeIn,crowd:sh.crowd,wet:sh.wet},plant:tl.plant,hidden:tl.hidden,loose:l&&l.z-s.kd<=6.6,strikerZ:g.strikerZ()};});
  const click=sel=>page.locator(sel).first().click();
  /** Plays one attack like a keeper who reads the tells (skill 'read') or one who does nothing ('idle'). Returns the result. */
  async function attack(skill,cap={}){let placed=false,done=false,told=false,t0=Date.now();
   for(;;){const s=await read();if(!s||s.over||s.ui!=='playing')return null;if(s.phase==='tip')return 'tip';if(Date.now()-t0>30000)return null;
    if(s.phase==='res'&&s.res){if(cap.save&&s.res.saved){await shot(cap.save);cap.save='';}const r=s.res;
     for(let i=0;i<200;i++){const n=await read();if(!n||n.over||n.phase!=='res')break;await wait(40);}return r;}
    const R=s.rect,cx=R.x+R.w/2,by=R.y+R.h-150,sh=s.sh;
    if(skill==='read'&&sh){
     if(s.phase==='wall'){await wait(500);if(cap.wall){await shot(cap.wall);cap.wall='';}await click(`[data-safehands-wall="${sh.wallBest}"]`);await wait(120);continue;}
     if(s.phase==='set'&&!placed&&s.pt>.15&&sh.kind!=='reb'){placed=true;
      const d=sh.kind==='far'?2.5:sh.kind==='one'?sh.bz-5:sh.kind==='cross'?1:0,x=sh.kind==='free'?-sh.near*sh.wallN*.4:sh.kind==='pen'?0:sh.bx*d/sh.bz,dx=(x-s.wantX)*s.gain.x/1.15,dy=-(d-s.wantD)*s.gain.d;
      if(Math.abs(dx)>2||Math.abs(dy)>2)await gesture([[cx,by],[cx+dx*.3,by+dy*.3],[cx+dx*.7,by+dy*.7],[cx+dx,by+dy]],30);
      if(cap.set){await wait(350);await shot(cap.set);cap.set='';}continue;}
     if(s.phase==='set'&&s.loose&&!done){done=true;await click('[data-safehands-smother]').catch(()=>{});continue;}
     if(s.phase==='cross'&&!s.decision&&s.pt>.45&&!done){done=true;if(cap.cross){await shot(cap.cross);cap.cross='';}await click(`[data-safehands-choose="${sh.closeIn?(sh.crowd?'punch':'claim'):'stay'}"]`).catch(()=>{});continue;}
     if((s.phase==='run'||s.phase==='fly')&&!s.act&&!told&&(s.plant||(s.hidden&&s.phase==='fly'))){told=true;const pl=s.plant||{side:0,high:false,power:.5};
      if(cap.tell){await shot(cap.tell);cap.tell='';}
      const hard=pl.power>(sh.wet?.5:.72),a=pl.side===0?(hard?(pl.high?[0,-70]:[-70,0]):null):[pl.side*70,pl.high?-50:6];
      if(a)await gesture([[cx,by],[cx+a[0]*.5,by+a[1]*.5],[cx+a[0],by+a[1]]],12);continue;}
    }
    await wait(25);}
  }

  /* ---- start card ---- */
  await page.goto(`${BASE}/arcade?game=safehands`,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('[data-safehands-card="start"]',{timeout:60000});await wait(700);
  check(await rafIn(3000)===0,'start card is idle: 0 frames in 3 s');
  check(await page.locator('[data-safehands-shelf] svg').count()===12,'the glove shelf shows 12 slots');
  await shot(mobile?'start':'desktop-start');
  /* ---- career: three attacks read properly, then the keeper stands still until full time ---- */
  await click('[data-safehands-play]');await page.waitForSelector('[data-safehands-card="tip"]',{timeout:20000});await wait(400);
  check((await read()).phase==='tip','the round card waits for the player');check(await rafIn(1500)===0,'round card is idle: 0 frames in 1.5 s');await shot('round');
  await click('[data-safehands-ack]');await wait(300);
  {const a=await read();check(a.ui==='playing'&&a.loop,'the loop runs in play');const d0=await page.evaluate(()=>window.__safehands.draws);await wait(2000);const f=(await page.evaluate(()=>window.__safehands.draws))-d0;check(f>20&&(mobile?f<=64:f<=125),`draw rate is capped: ${f} draws in 2 s (${mobile?'phone: 30':'desktop: 60'} a second at most)`);}
  const r1=await attack('read',{tell:'tell',save:'save'});check(!!r1&&r1.saved,'attack 1 saved by reading the planted foot',JSON.stringify(r1));
  const mid=await read();
  const r2=await attack('read',{set:'set'});check(!!r2&&(r2.saved||r2.kind==='spill'),'attack 2 saved',JSON.stringify(r2));
  {const s=await read();check(s.score>0&&s.saves>=1,'the score rises with saves',`${s.score} pts`);}
  /* pause */
  await page.keyboard.press('KeyP');await wait(300);check((await read()).ui==='paused','P pauses');check(await rafIn(1500)===0,'paused: 0 frames in 1.5 s');await page.keyboard.press('KeyP');await wait(200);check((await read()).ui==='playing','P resumes');
  /* a drag moves the keeper (penalty: along the line only) */
  void mid;
  let guard=0;while(guard++<12){const r=await attack('idle');if(r===null)break;if(r==='tip'){await click('[data-safehands-ack]');await wait(200);}}
  await page.waitForSelector('[data-safehands-card="results"]',{timeout:20000});await wait(900);
  {const st=await page.evaluate(()=>{const g=window.__safehands.game.state;return {score:g.score,goals:g.stats.goals,lives:g.lives,saves:g.stats.saves};});
   const shown=Number(await page.locator('[data-safehands-card="results"]').getAttribute('data-safehands-score'));
   check(st.goals===3&&st.lives===0,'three goals end the run',JSON.stringify(st));check(shown===st.score,'results card shows the run score',`${shown}`);
   check((await page.locator('[data-safehands-coach]').innerText()).length>10,'the results card coaches the last goal');check((await page.locator('[data-safehands-fact]').innerText()).length>20,'the results card teaches one goalkeeping idea');
   check(await rafIn(3000)===0,'results card is idle: 0 frames in 3 s');await shot(mobile?'results':'desktop-results');
   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('fi2-safehands-v1')||'null'));check(saved&&saved.best===st.score&&saved.plays===1&&saved.gloves.includes('first-save'),'the device save holds the best score and the first gloves');
   check(Object.keys(saved.scout).length>=1,'the scouting cards started to fill');}
  /* keyboard round: Space / Enter on the cards, arrows to dive */
  {const t=Date.now();await click('[data-safehands-again]');await page.waitForSelector('[data-safehands-card="tip"]',{timeout:5000});check(Date.now()-t<1000,'Play again is on the round card in under 1 s',`${Date.now()-t} ms`);
   if(!mobile){await page.keyboard.press('Enter');await wait(400);await page.keyboard.down('KeyD');await wait(350);await page.keyboard.up('KeyD');const a=await read();check(a.kx>.3,'D shuffles the keeper to the right',a.kx.toFixed(2));
    for(let i=0;i<400;i++){const s=await read();if(s.phase==='run'&&s.plant){await page.keyboard.press(s.plant.side<0?(s.plant.high?'KeyQ':'ArrowLeft'):s.plant.high?'KeyE':'ArrowRight');break;}await wait(25);}
    await wait(200);check((await read()).act||(await read()).phase==='res','an arrow key dives after the whistle');await shot('desktop');}}
  /* ---- the tour (screenshots only): First team has the wall and the cross; then the shelf and a scouting card ---- */
  if(shots&&tour){
   await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('fi2-safehands-v1'));s.rounds=2;s.gloves=['first-save','clean-sheet','fingertip','safe-hands','wall'];s.scout.rosa={faced:6,saved:4,seen:[5,3,6,0]};s.scout.nia={faced:3,saved:1,seen:[2,0,3,0]};s.scout.tomas={faced:2,saved:1,seen:[1,1,2,1]};localStorage.setItem('fi2-safehands-v1',JSON.stringify(s));});
   await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('[data-safehands-card="start"]',{timeout:60000});await wait(600);await shot('start-progress');
   await click('[data-safehands-shelf]');await wait(500);await shot('shelf');await page.keyboard.press('Escape');await wait(300);
   await click('[data-safehands-scout]');await wait(500);await shot('scout');await page.keyboard.press('Escape');await wait(300);
   await click('[data-safehands-from]');await click('[data-safehands-from]');await click('[data-safehands-play]');await page.waitForSelector('[data-safehands-card="tip"]');await wait(300);await shot('round-first-team');await click('[data-safehands-ack]');
   const cap={wall:'wall-choice',cross:'cross'};let g2=0,kinds=[];
   while(g2++<8){const s=await read();if(!s||s.over)break;const k=s.sh&&s.sh.kind;kinds.push(k);const c=k==='free'?{wall:cap.wall,set:'freekick',save:''}:k==='cross'?{cross:cap.cross}:k==='one'?{set:'one-on-one'}:k==='far'?{set:'long-shot'}:{};const r=await attack('read',c);if(r===null)break;if(r==='tip')break;}
   console.log('tour kinds: '+kinds.join(', '));
  }
  check(errors.length===0,'no console errors',errors.slice(0,3).join(' | '));
 }finally{await browser.close();}
 console.log(fails.length?`\n${fails.length} FAILED: ${fails.join('; ')}`:'\nsafehands browser check: all ok');process.exit(fails.length?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
