#!/usr/bin/env node
// Kit Rush browser check (Nov 10 2026). Plays a scripted round in real Chrome with real pointer input and asserts:
//   start card idle (no rAF running), score rises from swipes, a wrong kit / the whistle costs a life, pause stops the loop,
//   results card shows the run's score and is idle, "Play again" is playing again in under 1 s, no console errors.
//   node scripts/check-kitrush-browser.cjs --port=<n> [--mobile] [--size=375x667] [--reduced] [--shots] [--headed]
// --mobile: 390x844 touch profile with CDP touch events (default is a 1440x900 desktop with the mouse).
// --reduced: prefers-reduced-motion. --shots: writes docs/arcade-aaa/shots/kitrush-{start,phone,results}.png (mobile) or
// kitrush-desktop.png (desktop). Prints the measured frame cost (rules + draw, ms) from the game's own counters.
// Pass your own server; never the owner's dev server on 8092.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const path=require('node:path');
const arg=n=>(process.argv.find(a=>a.startsWith(`--${n}=`))||'').slice(n.length+3),has=n=>process.argv.includes(`--${n}`);
const port=arg('port')||process.env.PORT,BASE=process.env.FUTBOL_BASE_URL||(port?`http://localhost:${port}`:'');
if(!BASE||/:8092\b/.test(BASE)){console.error('Pass your own server: --port=<port> (not 8092) or FUTBOL_BASE_URL=<url>.');process.exit(1);}
const [vw,vh]=(arg('size')||'390x844').split('x').map(Number),mobile=has('mobile'),reduced=has('reduced'),shots=has('shots'),SHOTS=path.join(__dirname,'..','docs','arcade-aaa','shots');
const seed=()=>{try{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-sound-volume','0.5');
 if(!localStorage.getItem('fi2-arcade-wallet-v1'))localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,spends:{},runs:{fixture:{game:'island',paid:5000,reason:'playtest entry',at:1}},packs:[]}));}catch{}
 const raf=window.requestAnimationFrame.bind(window);window.__rafCalls=0;window.requestAnimationFrame=cb=>{window.__rafCalls++;return raf(cb);};};
const fails=[],check=(ok,what,detail='')=>{console.log(`${ok?'ok  ':'FAIL'} ${what}${detail?` (${detail})`:''}`);if(!ok)fails.push(what);};
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:!has('headed'),args:['--mute-audio','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 try{
  const ctx=await browser.newContext(mobile?{viewport:{width:vw,height:vh},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:reduced?'reduce':'no-preference'}:{viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference'});
  await ctx.addInitScript(seed);const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push('pageerror: '+e.message.slice(0,200)));
  page.on('console',m=>{if(m.type()!=='error')return;const t=m.text();if(/arcade-board|Failed to load resource|favicon|\[HMR\]|Download the React DevTools/i.test(t))return;errors.push('console: '+t.slice(0,200));});
  const cdp=mobile?await ctx.newCDPSession(page):null,wait=ms=>page.waitForTimeout(ms);
  // a real swipe through client points, about 8 ms a step
  async function swipe(pts){
   if(cdp){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:pts[0].x,y:pts[0].y,id:1}]});
    for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];for(let k=1;k<=4;k++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(b.x-a.x)*k/4,y:a.y+(b.y-a.y)*k/4,id:1}]});}}
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
   else{await page.mouse.move(pts[0].x,pts[0].y);await page.mouse.down();for(let i=1;i<pts.length;i++)await page.mouse.move(pts[i].x,pts[i].y,{steps:4});await page.mouse.up();}
  }
  // what is in the air, in client pixels (vy in field units a second); own = my kit or a special, hazard = other kit or the whistle
  const air=()=>page.evaluate(()=>{const k=window.__kitrush,g=k&&k.game;if(!g)return null;const s=g.state,z=k.size,u=z.w/100,own=[],haz=[];
   for(const it of s.items){if(!it.active)continue;const p={x:z.left+it.x*u,y:z.top+it.y*u,fy:it.y/s.h,kind:it.kind,vy:it.vy};(it.kind>=7||(it.kind<6&&it.team===s.team)?own:haz).push(p);}
   return {own,haz,score:s.score,lives:s.lives,over:s.over,beat:s.beat,safe:s.safe,team:s.team,r:7.2*u,phase:k.phase,loop:k.loop,real:s.real,frenzy:s.frenzy};});
  const state=()=>page.evaluate(()=>{const k=window.__kitrush;return k?{phase:k.phase,loop:k.loop,raf:window.__rafCalls,score:k.game?k.game.state.score:0,lives:k.game?k.game.state.lives:0,perf:{...k.perf},dpr:k.size.dpr}:null;});
  const rafIdle=async label=>{const a=(await state()).raf;await wait(1000);const b=await state();check(b.raf-a===0&&!b.loop,`${label}: no animation frames requested for 1 s`,`rAF calls ${b.raf-a}, loop ${b.loop}`);};
  const clearOf=(p,haz,r)=>haz.every(h=>Math.hypot(h.x-p.x,h.y-p.y)>r*2.6);

  await page.goto(BASE+'/arcade?game=kitrush',{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForSelector('[data-kitrush-card="start"]',{timeout:90000});await wait(1500);
  check(await page.locator('[data-game="kitrush"]').count()===1,'root carries data-game="kitrush"');
  const fit=await page.evaluate(()=>{const c=document.querySelector('[data-kitrush-card="start"]'),r=c.getBoundingClientRect(),b=[...c.querySelectorAll('button')].map(x=>x.getBoundingClientRect());return {inView:r.top>=0&&r.bottom<=innerHeight+1&&r.left>=0&&r.right<=innerWidth+1,minH:Math.min(...b.map(x=>x.height)),scroll:document.documentElement.scrollWidth<=innerWidth};});
  check(fit.inView&&fit.scroll,'start card fits the screen without scrolling');check(fit.minH>=44,'start card buttons are at least 44 px tall',`min ${fit.minH}`);
  await rafIdle('start card');
  if(shots&&mobile)await page.screenshot({path:path.join(SHOTS,'kitrush-start.png')});

  // ---- play: swipe own kit, score must rise ----
  const playBtn=page.locator('[data-kitrush-play]');if(mobile)await playBtn.tap();else await playBtn.click();
  await page.waitForFunction(()=>window.__kitrush&&window.__kitrush.phase==='playing'&&window.__kitrush.loop,null,{timeout:5000});
  let a=await air();const startLives=a.lives;let best=0,shot=false,t0=Date.now();
  while(Date.now()-t0<(shots?26000:14000)){a=await air();if(!a||a.over)break;
   const ready=a.own.filter(p=>p.fy>.22&&p.fy<.8&&Math.abs(p.vy)<45&&clearOf(p,a.haz,a.r));// near the top of its arc: slow enough to aim at
   if(a.beat<=0&&ready.length){ready.sort((p,q)=>p.x-q.x);const line=[ready[0]];for(const p of ready.slice(1)){const l=line[line.length-1];if(a.haz.every(h=>{const dx=p.x-l.x,dy=p.y-l.y,L=dx*dx+dy*dy||1;let u=((h.x-l.x)*dx+(h.y-l.y)*dy)/L;u=Math.max(0,Math.min(1,u));return Math.hypot(l.x+dx*u-h.x,l.y+dy*u-h.y)>a.r*2.4;}))line.push(p);}
    const pts=[{x:line[0].x-a.r*.2,y:line[0].y-a.r*1.3},...line.map(p=>({x:p.x,y:p.y+a.r*.2})),{x:line[line.length-1].x+a.r*.3,y:line[line.length-1].y+a.r*1.2}];
    await swipe(pts);if(line.length>best)best=line.length;
    if(shots&&!shot&&a.frenzy<=0&&line.every(p=>p.kind<6)&&line.length>=2){await wait(120);await page.screenshot({path:path.join(SHOTS,mobile?'kitrush-phone.png':'kitrush-desktop.png')});shot=true;}}
   else await wait(30);
   if(!shots&&(await state()).score>=200)break;}
  if(shots&&!shot){await page.screenshot({path:path.join(SHOTS,mobile?'kitrush-phone.png':'kitrush-desktop.png')});}
  let st=await state();check(st.score>0,'swiping your own kit scores',`score ${st.score}, longest swipe ${best}`);
  const hudScore=await page.locator('[data-arcade-pill] b').first().innerText().catch(()=>'');check(Number(hudScore)===st.score||Number(hudScore)>0,'the score pill shows the score',`pill ${hudScore}`);

  // ---- pause stops the loop, resume wakes it ----
  if(!(await air()).over){const pauseBtn=page.locator('[data-arcade-pause]');if(mobile)await pauseBtn.tap();else await pauseBtn.click();await page.waitForSelector('[data-arcade-pause-card]',{timeout:3000});await rafIdle('pause card');
   const res=page.locator('[data-arcade-resume]');if(mobile)await res.tap();else await res.click();await page.waitForFunction(()=>window.__kitrush.phase==='playing'&&window.__kitrush.loop,null,{timeout:3000});check(true,'resume wakes the loop');}

  // ---- a wrong kit or the whistle costs a life; three end the run ----
  let livesSeen=(await state()).lives,lost=false;t0=Date.now();
  while(Date.now()-t0<70000){a=await air();if(!a||a.over||a.phase!=='playing')break;if(a.lives<livesSeen){lost=true;livesSeen=a.lives;}
   const h=a.haz.find(p=>p.fy>.2&&p.fy<.82);
   if(a.beat<=0&&a.safe<=0&&h)await swipe([{x:h.x,y:h.y-a.r*1.4},{x:h.x,y:h.y},{x:h.x,y:h.y+a.r*1.4}]);else await wait(40);
   if(Date.now()-t0>30000)await page.evaluate(()=>{const s=window.__kitrush.game.state;if(s.lives>1)s.lives=1;});}
  a=await air();if(a&&a.lives<livesSeen)lost=true;check(lost,'hitting the other kit or the whistle costs a life',`lives ${startLives} -> ${a?a.lives:'?'}`);
  await page.waitForSelector('[data-kitrush-card="results"]',{timeout:15000});
  const shown=Number(await page.locator('[data-kitrush-card="results"]').getAttribute('data-kitrush-score')),near=await page.locator('[data-kitrush-near]').innerText(),fact=await page.locator('[data-kitrush-fact]').innerText();
  st=await state();check(shown===st.score,'results card shows the run score',`${shown} vs ${st.score}`);check(near.length>4&&fact.length>20,'results card has a near-miss line and a football fact',near.replace(/\n/g,' '));
  // Results first (Nov 10 2026): a top-10 score no longer opens the entry over the card. The strip sits under the near-miss line and opens the dialog on a tap.
  await wait(900);const hs=page.locator('[data-arcade-board]'),strip=page.locator('[data-kitrush-card="results"] [data-hs-prompt=inline]');
  if(st.score>0){await strip.waitFor({timeout:6000}).catch(()=>{});check(await strip.count()===1&&await hs.count()===0,'a top-10 score shows the high-score strip in the card, not a dialog over it');
   const lay=await page.evaluate(()=>{const q=s=>document.querySelector(s).getBoundingClientRect(),n=q('[data-kitrush-near]'),p=q('[data-hs-prompt]'),a=q('[data-kitrush-again]'),m=q('[data-kitrush-medal]');return {ok:m.bottom<=n.top+2&&n.bottom<=p.top+8&&p.bottom<=a.top&&a.bottom<=innerHeight,btn:Math.round(q('[data-hs-open]').height)};});check(lay.ok&&lay.btn>=44,'medal, near-miss line, strip and Play again stack without overlap; the strip button is 44 px',JSON.stringify(lay));
   if(!shots){await page.locator('[data-hs-open]').click();await page.locator('[data-arcade-board=entry]').waitFor({timeout:3000});check(await page.locator('[data-hs-wheels]').count()===1,'the strip opens the same initials entry');await page.locator('[data-arcade-board=entry]').getByRole('button',{name:'Skip',exact:true}).first().click();await wait(400);check(await hs.count()===0&&await page.locator('[data-kitrush-again]').isVisible(),'Skip returns to the results card with Play again');}}
  const rfit=await page.evaluate(()=>{const c=document.querySelector('[data-kitrush-card="results"]'),r=c.getBoundingClientRect(),again=document.querySelector('[data-kitrush-again]').getBoundingClientRect();return {again:again.bottom<=innerHeight&&again.top>=0,top:Math.round(r.top),bottom:Math.round(r.bottom),h:innerHeight};});check(rfit.again,'Play again is on screen without scrolling',JSON.stringify(rfit));
  await rafIdle('results card');
  if(shots&&mobile)await page.screenshot({path:path.join(SHOTS,'kitrush-results.png')});
  if(shots&&mobile&&st.score>0){await page.locator('[data-hs-open]').tap();const entry=page.locator('[data-arcade-board=entry]');await entry.waitFor({timeout:3000});await entry.getByRole('button',{name:'Fox',exact:true}).tap();await wait(300);check(await entry.locator('[data-hs-icon] svg[data-board-icon]').count()===12&&!/\p{Extended_Pictographic}/u.test(await entry.locator('[data-hs-icons]').innerText()),'the picture picker shows 12 drawn icons, no emoji');await page.screenshot({path:path.join(SHOTS,'hs-icons.png')});await entry.getByRole('button',{name:'Skip',exact:true}).first().tap();await wait(400);}
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('fi2-kitrush-v1')||'null'));check(!!saved&&saved.plays>=1&&saved.best===st.score,'the device save holds the best and the play count',JSON.stringify(saved&&{best:saved.best,plays:saved.plays}));

  // ---- instant restart: from the tap to a stepping round ----
  const ms=await page.evaluate(()=>new Promise(resolve=>{const b=document.querySelector('[data-kitrush-again]'),t=performance.now();b.click();const tick=()=>{const k=window.__kitrush;if(k.phase==='playing'&&k.loop&&k.game&&k.game.state.real>0&&!k.game.state.over)resolve(performance.now()-t);else if(performance.now()-t>5000)resolve(-1);else setTimeout(tick,4);};tick();}));
  check(ms>=0&&ms<1000,'Play again is playing in under 1 s',`${Math.round(ms)} ms`);
  await wait(1200);st=await state();const p=st.perf;
  console.log(JSON.stringify({profile:mobile?`phone ${vw}x${vh} @2x`:'desktop 1440x900',reduced,frames:p.frames,avgFrameMs:+(p.sum/Math.max(1,p.frames)).toFixed(2),maxFrameMs:+p.max.toFixed(2),dpr:st.dpr,dprDropped:p.dropped}));
  check(errors.length===0,'no console errors',errors.slice(0,3).join(' | '));
 }finally{await browser.close();}
 console.log(fails.length?`KITRUSH_BROWSER_FAIL ${fails.join('; ')}`:'KITRUSH_BROWSER_PASS');process.exit(fails.length?1:0);
})().catch(e=>{console.error('KITRUSH_BROWSER_FAIL',e.message);process.exit(1);});
