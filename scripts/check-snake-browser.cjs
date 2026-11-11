#!/usr/bin/env node
// Squad Snake browser check (Nov 10 2026). Plays a scripted run in real Chrome with real input and asserts:
//   start card idle (no rAF running), real swipes (phone) / arrow keys (desktop) turn the captain, calling team-mates raises the
//   score and the line, a fast double swipe is a two-step U-turn (never a death), pause stops the loop, a crash ends the run,
//   results card shows the score with a near-miss line and a fact and is idle, "Play again" is playing in under 1 s, no console errors.
//   node scripts/check-snake-browser.cjs --port=<n> [--mobile] [--size=375x667] [--reduced] [--shots] [--headed]
// Nov 11 2026 (owner: "on mobile there are no controls to move"): phones get the d-pad by default inside the VISIBLE viewport (short
// sizes: --size=390x664, 375x553, 360x560), the kick-off waits for the first input, and real CDP touches turn the captain all four ways by
// d-pad and by swipe (also swipes that start on the team sheet or between the d-pad keys), with the two-turn buffer and no reversal death.
// --mobile: 390x844 touch profile with CDP touch events (default is a 1440x900 desktop with the keyboard).
// --reduced: prefers-reduced-motion. --shots: writes docs/arcade-aaa/shots/snake-{start,phone,fullsquad,results}.png (mobile) or
// snake-desktop.png (desktop). Prints the measured frame cost (rules + draw, ms) from the game's own counters.
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
// In the page: the direction a careful player would take now (BFS to the wanted pick-up, clear of the line, lanes and referees).
const think=()=>{const k=window.__snake,g=k&&k.game;if(!g)return null;const s=g.state;if(s.over||s.beat>0||s.qn>0)return null;const C=s.cols,R=s.rows,DX=[0,1,0,-1],DY=[-1,0,1,0],block=new Uint8Array(C*R);
 for(let i=1;i<s.len-1;i++)block[s.ys[i]*C+s.xs[i]]=1;
 for(const f of s.foes)if(f.on&&s.dash<=0)for(const [x,y] of [[f.x,f.y],[f.x+f.dx,f.y+f.dy],[f.x-f.dx,f.y-f.dy],[f.x+1,f.y],[f.x-1,f.y],[f.x,f.y+1],[f.x,f.y-1]])if(x>=0&&y>=0&&x<C&&y<R)block[y*C+x]=1;
 const picks=s.picks.filter(p=>p.on),hx=s.xs[0],hy=s.ys[0],call=[[4,4,2],[4,3,3],[3,5,2]][s.call];let want=picks[0];
 if(picks.length===2){const more=p=>p.pos===2?s.d<call[0]:p.pos===3?(s.m===0?s.d===call[0]:s.m<call[1]):p.pos===4?s.m===call[1]:true;want=picks.find(more)||picks[0];for(const p of picks)if(p!==want)block[p.y*C+p.x]=1;}
 const dist=new Int16Array(C*R).fill(-1),first=new Int8Array(C*R).fill(-1),q=[hy*C+hx],back=(s.moved+2)%4,target=want?want.y*C+want.x:-1;dist[q[0]]=0;let found=-1;
 for(let qi=0;qi<q.length;qi++){const c=q[qi],x=c%C,y=(c-x)/C;if(c===target){found=c;break;}for(let d=0;d<4;d++){if(qi===0&&d===back)continue;const nx=x+DX[d],ny=y+DY[d];if(nx<0||ny<0||nx>=C||ny>=R)continue;const nc=ny*C+nx;if(block[nc]||dist[nc]>=0)continue;dist[nc]=dist[c]+1;first[nc]=qi===0?d:first[c];q.push(nc);}}
 let d=found>=0?first[found]:-1;if(d<0){let best=-1;for(let j=0;j<4;j++){if(j===back)continue;const nx=hx+DX[j],ny=hy+DY[j];if(nx<0||ny<0||nx>=C||ny>=R||block[ny*C+nx])continue;let room=0;for(const c of q)if(first[c]===j)room++;if(room>best){best=room;d=j;}}}
 return d>=0&&d!==s.dir?d:null;};
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:!has('headed'),args:['--mute-audio','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 try{
  const ctx=await browser.newContext(mobile?{viewport:{width:vw,height:vh},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:reduced?'reduce':'no-preference'}:{viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference'});
  await ctx.addInitScript(seed);const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push('pageerror: '+e.message.slice(0,200)));
  page.on('console',m=>{if(m.type()!=='error')return;const t=m.text();if(/arcade-board|Failed to load resource|favicon|\[HMR\]|Download the React DevTools/i.test(t))return;errors.push('console: '+t.slice(0,200));});
  const cdp=mobile?await ctx.newCDPSession(page):null,wait=ms=>page.waitForTimeout(ms);
  const KEYS=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'],VX=[0,1,0,-1],VY=[-1,0,1,0];
  // a real swipe in the thumb zone below the pitch (phone) or a real key press (desktop)
  let zone={x:vw/2,y:vh-90};
  async function swipe(dirs){
   if(!cdp){for(const d of dirs)await page.keyboard.press(KEYS[d]);return;}
   let x=zone.x-dirs.reduce((a,d)=>a+VX[d],0)*17,y=zone.y-dirs.reduce((a,d)=>a+VY[d],0)*17;
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
   for(const d of dirs)for(let k=1;k<=3;k++){x+=VX[d]*11.5;y+=VY[d]*11.5;await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y,id:1}]});}
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }
  const state=()=>page.evaluate(()=>{const k=window.__snake;if(!k)return null;const g=k.game,s=g&&g.state;return {phase:k.phase,loop:k.loop,raf:window.__rafCalls,score:s?s.score:0,len:s?s.len:0,joined:s?s.joined:0,level:s?s.level:0,over:s?s.over:false,dir:s?s.dir:0,moved:s?s.moved:0,x:s?s.xs[0]:0,y:s?s.ys[0]:0,t:s?s.t:0,ticks:s?s.ticks:0,beat:s?s.beat:0,saves:s?s.saves:0,squads:s?s.stats.squads:0,perf:{...k.perf},dpr:k.size.dpr,layout:k.layout};});
  const rafIdle=async label=>{const a=(await state()).raf;await wait(1000);const b=await state();check(b.raf-a===0&&!b.loop,`${label}: no animation frames requested for 1 s`,`rAF calls ${b.raf-a}, loop ${b.loop}`);};
  const press=async sel=>{const b=page.locator(sel);if(mobile)await b.tap();else await b.click();};

  await page.goto(BASE+'/arcade?game=snake',{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForSelector('[data-snake-card="start"]',{timeout:90000});await wait(1500);
  check(await page.locator('[data-game="snake"]').count()===1,'root carries data-game="snake"');
  const fit=await page.evaluate(()=>{const c=document.querySelector('[data-snake-card="start"]'),r=c.getBoundingClientRect(),b=[...c.querySelectorAll('button')].map(x=>x.getBoundingClientRect());return {inView:r.top>=0&&r.bottom<=innerHeight+1&&r.left>=0&&r.right<=innerWidth+1,minH:Math.min(...b.map(x=>x.height)),scroll:document.documentElement.scrollWidth<=innerWidth,top:Math.round(r.top),bottom:Math.round(r.bottom)};});
  check(fit.inView&&fit.scroll,'start card fits the screen without scrolling',JSON.stringify(fit));check(fit.minH>=44,'start card buttons are at least 44 px tall',`min ${fit.minH}`);
  const back=await page.evaluate(()=>{const b=document.querySelector('[data-arcade-bar] button'),cs=getComputedStyle(b);return {text:b.textContent.trim(),bg:cs.backgroundColor,border:cs.borderTopColor};});
  check(/Arcade/.test(back.text)&&back.bg==='rgb(36, 34, 62)'&&back.border==='rgb(129, 251, 237)','the Arcade back button is the standard one (dark, teal rim)',JSON.stringify(back));
  await rafIdle('start card');
  if(shots&&mobile)await page.screenshot({path:path.join(SHOTS,'snake-start.png')});

  // ---- play ----
  await press('[data-snake-play]');
  await page.waitForFunction(()=>window.__snake&&window.__snake.phase==='playing'&&window.__snake.loop,null,{timeout:5000});
  let st=await state();const L=st.layout;
  const minCell=vh>=800?29:vh>=640?24:18;
  if(mobile){const padTop=await page.evaluate(()=>document.querySelector('[data-snake-pad]')?.getBoundingClientRect().top??innerHeight),below=padTop-(L.y0+L.ph);zone=below>=70?{x:vw/2,y:L.y0+L.ph+below/2}:{x:vw/2,y:L.y0+L.ph*.72};check(L.cell>=minCell&&L.x0>=4&&L.y0+L.ph<=padTop-4,'the pitch fits above the d-pad with cells a child can see',`cell ${L.cell}px at ${vw}x${vh}, ${Math.round(below)}px between pitch and d-pad`);}
  // ---- kick-off waits for the first input; the hint and (phone) the d-pad are on screen ----
  await wait(1200);st=await state();check(st.ticks===0&&!st.over,'the kick-off waits for the first input',`ticks ${st.ticks}`);
  const hint=await page.locator('[data-snake-hint]').innerText().catch(()=>'');check(/Swipe or (tap the arrows|use the arrow keys)/.test(hint),'the first-move hint is shown',hint.replace(/\n/g,' '));
  if(mobile){
   const pad=await page.evaluate(()=>{const vv=window.visualViewport,bottom=vv?vv.offsetTop+vv.height:innerHeight,keys=[...document.querySelectorAll('[data-snake-pad] button')].map(b=>{const r=b.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return{w:r.width,h:r.height,top:r.top,bottom:r.bottom,hit:!!hit&&b.contains(hit)};});return{n:keys.length,min:Math.min(...keys.map(k=>Math.min(k.w,k.h))),inView:keys.every(k=>k.top>=0&&k.bottom<=bottom),hit:keys.every(k=>k.hit),bottom:Math.round(Math.max(...keys.map(k=>k.bottom))),vv:Math.round(bottom)};});
   check(pad.n===4&&pad.min>=56&&pad.inView&&pad.hit,'four d-pad keys of at least 56 px, inside the visible viewport and on top',JSON.stringify(pad));
   const T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
   const key=async d=>{const b=await page.locator(`[data-snake-pad] [data-dir="${d}"]`).boundingBox();const pt={x:b.x+b.width/2,y:b.y+b.height/2,id:3};await T('touchStart',[pt]);await T('touchEnd',[]);};
   const drag=async(x,y,d)=>{await T('touchStart',[{x,y,id:4}]);for(let k=1;k<=3;k++)await T('touchMove',[{x:x+VX[d]*12*k,y:y+VY[d]*12*k,id:4}]);await T('touchEnd',[]);};
   const tick=async()=>{const t=(await state()).ticks;await page.waitForFunction(t=>window.__snake.game.state.ticks>=t+1,t,{timeout:4000});return state();};
   const sheetBox=await page.locator('[data-snake-sheet]').boundingBox(),padBox=await page.locator('[data-snake-pad]').boundingBox();
   // d-pad Right starts the run facing right
   await key(1);st=await tick();check(st.moved===1&&!st.over,'d-pad Right starts the run and turns right',`moved ${st.moved}`);
   check(await page.locator('[data-snake-hint]').count()===0,'the hint goes away after the first move');
   await drag(zone.x,zone.y,0);st=await tick();check(st.moved===0,'swipe up turns up',`moved ${st.moved}`);
   await key(3);st=await tick();check(st.moved===3,'d-pad Left turns left',`moved ${st.moved}`);
   await drag(sheetBox.x+sheetBox.width/2,sheetBox.y+sheetBox.height/2,2);st=await tick();check(st.moved===2,'a swipe down that starts on the team sheet turns down',`moved ${st.moved}`);
   await key(0);st=await tick();check(st.moved===2&&!st.over,'d-pad Up while heading down is refused, never a reversal death',`moved ${st.moved}, over ${st.over}`);
   await drag(padBox.x+8,padBox.y+12,1);st=await tick();check(st.moved===1,'a swipe right that starts between the d-pad keys turns right',`moved ${st.moved}`);
   await key(2);st=await tick();check(st.moved===2,'d-pad Down turns down',`moved ${st.moved}`);
   await drag(zone.x,zone.y,3);st=await tick();check(st.moved===3,'swipe left turns left',`moved ${st.moved}`);
   // two quick d-pad presses in one tick: the two-turn buffer (Up, then Right), never lost, never a reversal
   await key(0);await key(1);st=await tick();const mid=st.moved;st=await tick();check(mid===0&&st.moved===1&&!st.over,'two quick d-pad presses are both kept (Up then Right)',`moved ${mid} -> ${st.moved}`);
   await key(0);st=await tick();check(st.moved===0&&!st.over,'heading up again for the U-turn check',`moved ${st.moved}`);
   if(shots)await page.screenshot({path:path.join(SHOTS,`snake-controls-${vh<700?'short':'tall'}.png`)});
  }else{await page.keyboard.press('ArrowUp');}
  await page.waitForFunction(()=>window.__snake.game.state.ticks>=1,null,{timeout:4000});
  // a fast double swipe: a two-step U-turn, never a death
  st=await state();const before=st.moved;await swipe([1,2]);await page.waitForFunction(t=>window.__snake.game.state.ticks>=t+2,st.ticks,{timeout:4000});st=await state();
  check(!st.over&&st.moved===2&&before===0,'a fast double swipe (right, down) is a two-step U-turn',`heading ${before} -> ${st.moved}, over ${st.over}`);
  // steer with real input from the careful player's choice until team-mates have joined
  let t0=Date.now(),shot=false,squadShot=false,inputs=0;const goal=shots?(mobile?13:8):3,limit=shots?150000:45000;
  while(Date.now()-t0<limit){st=await state();if(!st||st.over||st.phase!=='playing')break;
   if(shots&&mobile&&!squadShot&&st.beat>0&&st.beat<1.15){await page.screenshot({path:path.join(SHOTS,'snake-fullsquad.png')});squadShot=true;}
   if(shots&&!shot&&st.len>=(mobile?10:8)&&st.beat<=0){await page.screenshot({path:path.join(SHOTS,mobile?'snake-phone.png':'snake-desktop.png')});shot=true;}
   if((!shots&&st.joined>=goal)||(shots&&shot&&(squadShot||!mobile)))break;
   const d=await page.evaluate(think);if(d!==null&&d!==undefined){await swipe([d]);inputs++;}else await wait(12);}
  st=await state();check(st.score>0&&(st.len>1||st.squads>0),'calling team-mates raises the score and the line',`score ${st.score}, line ${st.len-1}, level ${st.level}, ${inputs} real ${mobile?'swipes':'key presses'}`);
  const hudScore=await page.locator('[data-arcade-pill] b').first().innerText().catch(()=>'');check(Number(hudScore)>0,'the score pill shows the score',`pill ${hudScore}`);
  const sheet=await page.locator('[data-snake-sheet]').getAttribute('data-joined').catch(()=>null);check(sheet!==null,'the team sheet shows the line',`joined ${sheet}`);

  // ---- pause stops the loop, resume wakes it ----
  if(!st.over){await press('[data-arcade-pause]');await page.waitForSelector('[data-arcade-pause-card]',{timeout:3000});await rafIdle('pause card');
   await press('[data-arcade-resume]');await page.waitForFunction(()=>window.__snake.phase==='playing'&&window.__snake.loop,null,{timeout:3000});check(true,'resume wakes the loop');}

  // ---- hands off: the captain runs out of the pitch; a skid, the last-ditch save, then the run ends ----
  await page.waitForFunction(()=>window.__snake.game.state.over,null,{timeout:60000});
  await page.waitForSelector('[data-snake-card="results"]',{timeout:15000});
  const shown=Number(await page.locator('[data-snake-card="results"]').getAttribute('data-snake-score')),near=await page.locator('[data-snake-near]').innerText(),fact=await page.locator('[data-snake-fact]').innerText(),built=await page.locator('[data-snake-built]').innerText();
  st=await state();check(shown===st.score,'results card shows the run score',`${shown} vs ${st.score}`);check(near.length>4&&fact.length>20&&built.length>2,'results card has a near-miss line, what you built and a football fact',`${near.replace(/\n/g,' ')} | ${built}`);
  await wait(900);const hs=page.locator('[data-arcade-board]');if(await hs.count()){await page.keyboard.press('Escape').catch(()=>{});await wait(300);if(await hs.count()){const skip=page.getByRole('button',{name:/skip|done|close/i}).first();await skip.click({force:true}).catch(()=>{});await wait(300);}}
  const rfit=await page.evaluate(()=>{const c=document.querySelector('[data-snake-card="results"]'),r=c.getBoundingClientRect(),again=document.querySelector('[data-snake-again]').getBoundingClientRect();return {again:again.bottom<=innerHeight&&again.top>=0,top:Math.round(r.top),bottom:Math.round(r.bottom),h:innerHeight};});check(rfit.again,'Play again is on screen without scrolling',JSON.stringify(rfit));
  await rafIdle('results card');
  if(shots&&mobile)await page.screenshot({path:path.join(SHOTS,'snake-results.png')});
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('fi2-snake-v1')||'null'));check(!!saved&&saved.plays>=1&&saved.best===st.score,'the device save holds the best and the play count',JSON.stringify(saved&&{best:saved.best,plays:saved.plays,shapes:saved.shapes}));

  // ---- instant restart: from the tap to a stepping run ----
  const ms=await page.evaluate(()=>new Promise(resolve=>{const b=document.querySelector('[data-snake-again]'),t=performance.now();b.click();const tick=()=>{const k=window.__snake;if(k.phase==='playing'&&k.loop&&k.game&&k.game.state.t>0&&!k.game.state.over)resolve(performance.now()-t);else if(performance.now()-t>5000)resolve(-1);else setTimeout(tick,4);};tick();}));
  check(ms>=0&&ms<1000,'Play again is playing in under 1 s',`${Math.round(ms)} ms`);
  await wait(1500);st=await state();const p=st.perf;
  console.log(JSON.stringify({profile:mobile?`phone ${vw}x${vh} @2x`:'desktop 1440x900',reduced,frames:p.frames,avgFrameMs:+(p.sum/Math.max(1,p.frames)).toFixed(2),maxFrameMs:+p.max.toFixed(2),dpr:st.dpr,dprDropped:p.dropped,cell:st.layout.cell}));
  check(errors.length===0,'no console errors',errors.slice(0,3).join(' | '));
 }finally{await browser.close();}
 console.log(fails.length?`SNAKE_BROWSER_FAIL ${fails.join('; ')}`:'SNAKE_BROWSER_PASS');process.exit(fails.length?1:0);
})().catch(e=>{console.error('SNAKE_BROWSER_FAIL',e.message);process.exit(1);});
