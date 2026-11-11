#!/usr/bin/env node
// Air Futbol browser check (Nov 11 2026). Plays in real Chrome with real input and asserts:
//   start card idle (no rAF running); solo: a real finger (CDP touch) or the mouse drives the striker inside its half, real hits,
//   a real goal against level 1, the game sleeps when the puck waits and no finger is down, pause stops the loop, lost pointer-ups
//   never leave the striker glued (the page drops pointerup / touchend on purpose), results card with a coaching line is idle and
//   "Play again" is playing in under 1 s; no console errors.
//   --two: two-player mode with two simultaneous touches, each moving only its own striker, a palm ignored, a lost pointer-up on one
//          side, the results card with today's tally (no board entry), rematch in under 1 s.
//   --room: in the arcade room, walk to the table, the Play prompt appears above it, a tap on the table walks back to it, Play opens the game.
//   node scripts/check-airhockey-browser.cjs --port=<n> [--mobile] [--size=390x664] [--reduced] [--two] [--room] [--shots] [--headed]
// --mobile: touch profile (default size 390x844; short sizes 390x664, 375x553, 360x560; sideways 844x390). Default: 1440x900 desktop.
// --shots: writes docs/arcade-aaa/shots/airhockey-{start,phone,goal,results,two,desktop,room-prompt}.png for the profile in use.
// Two results are reached by setting the match score in the page before a last REAL goal (marked "set up" in the output), so the
// check does not have to win a whole run. Prints the measured frame cost (physics + draw, ms) from the game's own counters.
// Pass your own server; never the owner's dev server on 8092.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const path=require('node:path');
const arg=n=>(process.argv.find(a=>a.startsWith(`--${n}=`))||'').slice(n.length+3),has=n=>process.argv.includes(`--${n}`);
const port=arg('port')||process.env.PORT,BASE=process.env.FUTBOL_BASE_URL||(port?`http://localhost:${port}`:'');
if(!BASE||/:8092\b/.test(BASE)){console.error('Pass your own server: --port=<port> (not 8092) or FUTBOL_BASE_URL=<url>.');process.exit(1);}
const mobile=has('mobile'),[vw,vh]=(arg('size')||(mobile?'390x844':'1440x900')).split('x').map(Number),reduced=has('reduced'),shots=has('shots'),two=has('two'),roomCheck=has('room'),SHOTS=path.join(__dirname,'..','docs','arcade-aaa','shots');
const seed=()=>{try{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-sound-volume','0.5');}catch{}
 const raf=window.requestAnimationFrame.bind(window);window.__rafCalls=0;window.requestAnimationFrame=cb=>{window.__rafCalls++;return raf(cb);};
 // lost-release switch: registered before the game, so it can swallow the events the way iOS sometimes does
 window.__drop={up:false,touch:false};const eat=k=>e=>{if(window.__drop[k])e.stopImmediatePropagation();};
 for(const t of ['pointerup','pointercancel','lostpointercapture','pointerleave'])window.addEventListener(t,eat('up'),true);for(const t of ['touchend','touchcancel'])window.addEventListener(t,eat('touch'),true);};
const fails=[],check=(ok,what,detail='')=>{console.log(`${ok?'ok  ':'FAIL'} ${what}${detail?` (${detail})`:''}`);if(!ok)fails.push(what);};
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:!has('headed'),args:['--mute-audio','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 try{
  const ctx=await browser.newContext(mobile?{viewport:{width:vw,height:vh},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:reduced?'reduce':'no-preference'}:{viewport:{width:vw,height:vh},deviceScaleFactor:1,reducedMotion:reduced?'reduce':'no-preference'});
  await ctx.addInitScript(seed);const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push('pageerror: '+e.message.slice(0,200)));
  page.on('console',m=>{if(m.type()!=='error')return;const t=m.text();if(/arcade-board|Failed to load resource|favicon|\[HMR\]|Download the React DevTools/i.test(t))return;errors.push('console: '+t.slice(0,200));});
  const cdp=await ctx.newCDPSession(page),wait=ms=>page.waitForTimeout(ms),shot=async name=>{if(shots)await page.screenshot({path:path.join(SHOTS,`airhockey-${name}.png`)});};
  const st=()=>page.evaluate(()=>{const k=window.__airhockey,g=k&&k.game,s=g&&g.state;return s?{phase:k.phase,loop:k.loop,p:s.phase,over:s.over,px:s.px,py:s.py,pvx:s.pvx,pvy:s.pvy,sx:[...s.sx],sy:[...s.sy],held:[...s.held],goals:[...s.goals],score:s.score,lives:s.lives,level:s.level,hits:s.stats.hits,owners:k.owners,serves:s.serves}:{phase:k&&k.phase,loop:k&&k.loop};});
  const rafIdle=async(ms=500)=>{const a=await page.evaluate(()=>window.__rafCalls);await wait(ms);return (await page.evaluate(()=>window.__rafCalls))-a;};
  /** Table units -> client px (the page's own layout). */
  let L=null;const layout=async()=>{L=await page.evaluate(()=>{const k=window.__airhockey;const r=document.querySelector('[data-air-stage]').getBoundingClientRect();return {...k.layout,left:r.left,top:r.top};});return L;};
  const P=(x,y)=>({x:L.left+(L.side?L.cx+(y-80)*L.scale:L.cx+(x-50)*L.scale),y:L.top+(L.side?L.cy-(x-50)*L.scale:L.cy+(y-80)*L.scale)});
  const fingers=new Map(),send=type=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:[...fingers].map(([id,p])=>({x:p.x,y:p.y,id}))});
  // CDP (measured in Chrome): touchEnd with no points lifts everything; touchEnd WITH points lifts exactly the points it lists
  const touch={down:async(id,x,y)=>{fingers.set(id,P(x,y));await send('touchStart');},move:async(id,x,y)=>{fingers.set(id,P(x,y));await send('touchMove');},up:async id=>{const p=fingers.get(id);fingers.delete(id);if(p)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:fingers.size?[{x:p.x,y:p.y,id}]:[]});}};
  const pointer=mobile?{down:(x,y)=>touch.down(1,x,y),move:(x,y)=>touch.move(1,x,y),up:()=>touch.up(1)}:{down:async(x,y)=>{const p=P(x,y);await page.mouse.move(p.x,p.y);},move:async(x,y)=>{const p=P(x,y);await page.mouse.move(p.x,p.y);},up:async()=>{await page.mouse.move(2,2);}};
  const press=async sel=>{const l=page.locator(sel).first();if(mobile)await l.tap();else await l.click();};
  /** Plays the bottom striker like a careful child until `done(state)` or the time runs out: get behind the puck, then drive through it at the goal. */
  const playUntil=async(done,ms)=>{const t0=Date.now();let s=await st(),down=false;while(Date.now()-t0<ms){s=await st();if(done(s))break;if(s.p==='between'||s.over){await wait(60);continue;}
   let tx=50,ty=132;if(s.p==='play'&&s.py>82){const ax=50+(s.px<50?9:-9),dx=ax-s.px,dy=-s.py,d=Math.hypot(dx,dy),ux=dx/d,uy=dy/d,rx=s.px-s.sx[0],ry=s.py-s.sy[0],along=rx*ux+ry*uy,lat=Math.abs(rx*uy-ry*ux);
     if(along>5&&lat<6){tx=s.px+ux*26;ty=s.py+uy*26;}else if(s.sy[0]<s.py+2){tx=s.px+(s.sx[0]<s.px?-16:16);ty=s.py+10;}else{tx=s.px-ux*15+s.pvx*.05;ty=s.py-uy*15+s.pvy*.05;}}
   else if(s.p==='play'){tx=50+(s.px-50)*.45;ty=138;}
   tx=Math.max(9,Math.min(91,tx));ty=Math.max(89,Math.min(151,ty));if(!down){await pointer.down(tx,ty);down=true;}else await pointer.move(tx,ty);await wait(24);}
   return s;};

  if(roomCheck){
   await page.goto(`${BASE}/arcade`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__arcadeRoom&&window.__arcadeRoom.state.draws>3,null,{timeout:120000});await wait(3600);
   check(await page.locator('[data-arcade-play]').count()===0,'room: no Play prompt at the door');
   await page.evaluate(()=>window.__arcadeRoom.walkTo('airhockey'));
   await page.waitForFunction(()=>{const b=document.querySelector('[data-arcade-play="airhockey"]');return b&&getComputedStyle(b).visibility==='visible';},null,{timeout:20000}).catch(()=>{});
   const at=await page.evaluate(()=>{const b=document.querySelector('[data-arcade-play="airhockey"]'),s=window.__arcadeRoom.state;if(!b)return null;const r=b.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,bottom:r.bottom,vis:getComputedStyle(b).visibility,label:b.getAttribute('aria-label'),px:s.x,pz:s.z,vw:innerWidth,vh:innerHeight};});
   check(!!at&&at.vis==='visible'&&at.label==='Play Air Futbol','room: standing by the table shows the Play prompt',at?`${at.label} at ${Math.round(at.x)},${Math.round(at.y)}; player ${at.px.toFixed(1)},${at.pz.toFixed(1)}`:'no prompt');
   if(at){check(at.x>0&&at.x<at.vw&&at.y>40&&at.bottom<at.vh,'room: the prompt is on screen, above the table');check(Math.abs(at.pz+1)<1.2&&at.px>-8.2&&at.px<-7,'room: the player stands at the aisle side of the table',`${at.px.toFixed(2)},${at.pz.toFixed(2)}`);}
   await wait(500);if(shots)await page.screenshot({path:path.join(SHOTS,'airhockey-room-prompt.png')});
   // Walk away with the keyboard (the camera follows, the table stays on screen), then find the table with the mouse: hovering it shows
   // the same prompt (desktop), and a real click ON the table walks the player back to it. Phones have no hover: a real tap just under
   // where the prompt was does the same.
   const visible=()=>page.evaluate(()=>{const b=document.querySelector('[data-arcade-play="airhockey"]');if(!b||getComputedStyle(b).visibility!=='visible')return null;const r=b.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};});
   const arrived=()=>page.waitForFunction(()=>{const s=window.__arcadeRoom.state,b=document.querySelector('[data-arcade-play="airhockey"]');return !!b&&getComputedStyle(b).visibility==='visible'&&s.x<-7&&s.x>-8.3&&Math.abs(s.z+1)<1.3;},null,{timeout:20000}).then(()=>true).catch(()=>false);
   const canvasBox=await page.locator('canvas[aria-label^="Walkable arcade room"]').boundingBox();
   if(!mobile){await page.mouse.move(canvasBox.x+canvasBox.width*.8,canvasBox.y+canvasBox.height*.8);await page.locator('canvas[aria-label^="Walkable arcade room"]').focus();await page.keyboard.down('KeyD');await wait(1100);await page.keyboard.up('KeyD');await wait(500);
    check(!(await visible()),'room: walking away drops the prompt');
    let hover=null;scan:for(let fy=.3;fy<=.75;fy+=.05)for(let fx=.05;fx<=.6;fx+=.04){await page.mouse.move(canvasBox.x+canvasBox.width*fx,canvasBox.y+canvasBox.height*fy);await wait(70);const v=await visible();if(v){hover={...v,mx:canvasBox.x+canvasBox.width*fx,my:canvasBox.y+canvasBox.height*fy};break scan;}}
    check(!!hover,'room: hovering the table from a distance highlights it and shows Play',hover?`mouse ${Math.round(hover.mx)},${Math.round(hover.my)}; prompt ${Math.round(hover.x)},${Math.round(hover.y)}`:'never hovered');
    if(hover){await page.mouse.click(hover.mx,hover.my);await wait(150);await page.mouse.move(canvasBox.x+canvasBox.width*.8,canvasBox.y+canvasBox.height*.8);}
    check(hover?await arrived():false,'room: a click on the table walks the player to it and the prompt stays');}
   else{await page.evaluate(()=>window.__arcadeRoom.walkTo('runner'));await page.waitForFunction(()=>!document.querySelector('[data-arcade-play="airhockey"]'),null,{timeout:15000}).catch(()=>{});check(!(await visible()),'room: walking away drops the prompt');
    await page.evaluate(()=>window.__arcadeRoom.walkTo('airhockey'));check(await arrived(),'room: walking back shows the prompt again');}
   // wait until the walk has ended (the prompt follows the camera while the player moves), then a real click / tap on Play
   await page.waitForFunction(()=>{const s=window.__arcadeRoom.state,k=`${s.x.toFixed(2)},${s.z.toFixed(2)}`,w=window;if(w.__spot!==k){w.__spot=k;w.__spotAt=performance.now();return false;}return performance.now()-w.__spotAt>700;},null,{timeout:20000,polling:100}).catch(()=>{});
   const pb=await page.locator('[data-arcade-play="airhockey"]').boundingBox();if(pb){if(mobile)await page.touchscreen.tap(pb.x+pb.width/2,pb.y+pb.height/2);else await page.mouse.click(pb.x+pb.width/2,pb.y+pb.height/2);}const opened=await page.waitForSelector('[data-air-card=start]',{timeout:60000}).then(()=>true).catch(()=>false);
   check(opened,'room: Play opens Air Futbol');check(page.url().includes('game=airhockey'),'room: the page route is /arcade?game=airhockey');
  }else{
   await page.goto(`${BASE}/arcade?game=airhockey`,{waitUntil:'domcontentloaded'});await page.waitForSelector('[data-air-card=start]',{timeout:120000});await wait(900);
   check((await rafIdle())<=2,'start card: no animation loop');
   const fit=await page.evaluate(()=>{const b=document.querySelector('[data-air-play]').getBoundingClientRect(),d=document.querySelector('[data-air-duo]').getBoundingClientRect(),vv=window.visualViewport,back=document.querySelector('[data-game=airhockey] button').getBoundingClientRect();return {play:b.bottom,duo:d.bottom,h:vv?vv.height:innerHeight,backTop:back.top,backW:back.width};});
   check(fit.play<=fit.h+1&&fit.backW>=44,'start card: Play is visible in the viewport and the Arcade back button is there',`play bottom ${Math.round(fit.play)} of ${fit.h}; 2 players bottom ${Math.round(fit.duo)}`);
   await shot(mobile?'start':'desktop-start');
   if(!two){
    await press('[data-air-play]');await page.waitForFunction(()=>window.__airhockey&&window.__airhockey.phase==='playing',null,{timeout:10000});await wait(500);await layout();
    const fitT=await page.evaluate(()=>{const k=window.__airhockey,l=k.layout,z=k.size,vv=window.visualViewport;return {top:l.y0,bottom:l.y0+l.fh,left:l.x0,right:l.x0+l.fw,h:z.h,w:z.w,vis:vv?vv.height:innerHeight,stageTop:z.top,side:l.side,scale:l.scale,bar:document.querySelector('[data-air-stage] i').offsetHeight};});
    check(fitT.top>=fitT.bar&&fitT.bottom+fitT.stageTop<=fitT.vis+1&&fitT.left>=0&&fitT.right<=fitT.w+1,'table: both goals inside the visible viewport, under the top bar',`table ${Math.round(fitT.top)}..${Math.round(fitT.bottom)} of ${fitT.vis}, ${fitT.scale.toFixed(2)} px a unit${fitT.side?', sideways':''}`);
    let s=await st();check(s.p==='wait'&&!s.loop,'serve: the puck waits and the game sleeps until a touch',`loop ${s.loop}`);check((await rafIdle(400))<=2,'waiting for the serve: no animation loop');
    check(await page.locator('[data-air-hint]').count()===1,'serve hint is shown');
    // a real finger: the striker follows it inside its half and cannot teleport
    await pointer.down(30,120);await wait(60);s=await st();check(s.held[0]&&s.loop,'a touch wakes the game and holds the striker');await wait(500);s=await st();
    check(Math.hypot(s.sx[0]-30,s.sy[0]-120)<1.5,'the striker follows the finger',`${s.sx[0].toFixed(1)},${s.sy[0].toFixed(1)}`);check(s.p==='play'&&s.serves===1,'the held finger served the puck');
    await pointer.move(60,20);await wait(250);s=await st();check(s.sy[0]>=80+7.9&&Math.abs(s.sx[0]-60)<2,'the striker stays in its own half',`y ${s.sy[0].toFixed(1)}`);
    // play for real until a goal goes in at the top
    s=await playUntil(x=>x.goals[0]>=1,70000);check(s.hits>=1,'real hits on the puck',`${s.hits} hits`);check(s.goals[0]>=1&&s.score>=100,'a real goal against level 1 scores points',`${s.goals[0]}-${s.goals[1]}, ${s.score} pts`);
    if(s.goals[0]>=1){await wait(reduced?80:260);await shot(mobile?'goal':'desktop-goal');}
    await page.waitForFunction(()=>window.__airhockey.game.state.phase!=='goal',null,{timeout:5000}).catch(()=>{});
    s=await playUntil(x=>x.p==='play'&&Math.hypot(x.pvx,x.pvy)>120&&x.py>30&&x.py<130,25000);await shot(mobile?'phone':'desktop');
    // lost pointer-up (phone): the finger lifts but pointerup AND touchend are swallowed, then a new finger lands: it takes over
    if(mobile){await page.evaluate(()=>{window.__drop.up=true;});await touch.up(1);await wait(120);s=await st();check(s.owners[0]<0&&!s.held[0],'lost pointerup: the touch list shows no finger, so the striker is released',`owner ${s.owners[0]}`);
     await page.evaluate(()=>{window.__drop.up=false;});await touch.down(1,50,130);await wait(80);await page.evaluate(()=>{window.__drop.up=true;window.__drop.touch=true;});await touch.up(1);await wait(120);s=await st();const ghost=s.owners[0];
     await page.evaluate(()=>{window.__drop.up=false;window.__drop.touch=false;});await touch.down(2,70,120);await wait(350);s=await st();check(ghost>=0&&s.owners[0]>=0&&s.owners[0]!==ghost&&Math.hypot(s.sx[0]-70,s.sy[0]-120)<12,'ghost finger (no pointerup, no touchend): the next finger takes the striker over',`was ${ghost}, now ${s.owners[0]}, striker ${s.sx[0].toFixed(0)},${s.sy[0].toFixed(0)}`);
     await touch.up(2);await wait(100);s=await st();check(s.owners[0]<0,'and lifting it lets go');}
    else{await pointer.up();await wait(150);s=await st();check(!s.held[0],'the mouse leaving the table lets go of the striker');await page.keyboard.down('ArrowLeft');await wait(400);const k1=await st();await page.keyboard.up('ArrowLeft');check(k1.sx[0]<s.sx[0]-20,'arrow keys drive the striker',`${s.sx[0].toFixed(0)} -> ${k1.sx[0].toFixed(0)}`);}
    // pause stops everything
    await page.keyboard.press('KeyP');await wait(200);s=await st();check(s.phase==='paused'&&!s.loop,'pause stops the loop');check((await rafIdle(400))<=2,'paused: no animation loop');
    check(await page.evaluate(()=>!window.__airhockey.audio||!window.__airhockey.audio.humming),'paused: the table hum is gone');
    await page.keyboard.press('KeyP');await wait(150);check((await st()).phase==='playing','P resumes');
    // set up: last life, 0-4 down; the last goal against is a real one (nobody defends)
    await page.evaluate(()=>{const s=window.__airhockey.game.state;s.lives=1;s.goals[1]=4;});console.log('     set up: lives 1, 0-4 down');
    await pointer.down(12,150);const t0=Date.now();while(Date.now()-t0<45000){s=await st();if(s.over||s.phase==='over')break;await pointer.move(12,150);await wait(120);}
    if(!(s.over||s.phase==='over')){await page.evaluate(()=>{const s=window.__airhockey.game.state;s.px=50;s.py=150;s.pvx=0;s.pvy=200;s.phase='play';s.inGoal=false;});console.log('     set up: the puck was sent at the open goal');}
    await page.waitForSelector('[data-air-card=results]',{timeout:15000}).catch(()=>{});if(mobile)await touch.up(1).catch(()=>{});
    const res=await page.evaluate(()=>{const c=document.querySelector('[data-air-card=results]');if(!c)return null;const b=c.querySelector('[data-air-again]').getBoundingClientRect(),vv=window.visualViewport;return {score:Number(c.getAttribute('data-air-result')),near:c.querySelector('[data-air-near]').textContent,coach:c.querySelector('[data-air-coach]').textContent,key:c.querySelector('[data-air-coach]').getAttribute('data-air-coach'),again:b.bottom,h:vv?vv.height:innerHeight};});
    check(!!res&&res.score>=100,'results card shows the run',res?`${res.score} pts; "${res.near}"; coach(${res.key}): ${res.coach.slice(5,80)}`:'no card');
    if(res){check(res.coach.length>30&&res.near.length>8,'results: a coaching line tied to the run and a near-miss line');check(res.again<=res.h+1,'results: Play again is visible in the viewport',`${Math.round(res.again)} of ${res.h}`);}
    await wait(700);check((await rafIdle())<=2,'results: no animation loop');await shot(mobile?'results':'desktop-results');
    const best=await page.evaluate(()=>JSON.parse(localStorage.getItem('fi2-airhockey-v1')||'{}'));check(best.best>=100&&best.plays===1,'the save keeps the best',JSON.stringify(best).slice(0,90));
    const t1=Date.now();await press('[data-air-again]');await page.waitForFunction(()=>window.__airhockey.phase==='playing'&&window.__airhockey.game.state.score===0,null,{timeout:5000});const dt=Date.now()-t1;check(dt<1000,'restart under 1 s',`${dt} ms`);
    const perf=await page.evaluate(()=>{const p=window.__airhockey.perf,z=window.__airhockey.size;return {avg:p.sum/Math.max(1,p.frames),max:p.max,frames:p.frames,sleeps:p.sleeps,dpr:z.dpr,w:z.w,h:z.h};});
    console.log(`     frame cost (physics + draw): avg ${perf.avg.toFixed(2)} ms, worst ${perf.max.toFixed(1)} ms over ${perf.frames} frames at ${Math.round(perf.w)}x${Math.round(perf.h)} @${perf.dpr}x; slept ${perf.sleeps} times`);
    check(perf.avg<4,'frame cost stays small',`${perf.avg.toFixed(2)} ms`);
   }else{
    await press('[data-air-duo]');await page.waitForFunction(()=>window.__airhockey&&window.__airhockey.phase==='playing'&&window.__airhockey.mode==='duo',null,{timeout:10000});await wait(400);await layout();
    let s=await st();check(s.p==='wait'&&!s.loop,'two players: the puck waits, the game sleeps');check(await page.locator('[data-air-hint]').count()===2,'two players: a serve hint at each end');
    if(mobile){
     // two fingers at once: each striker follows only its own
     fingers.set(1,P(30,125));fingers.set(2,P(70,35));await send('touchStart');await wait(450);s=await st();
     check(s.owners[0]>=0&&s.owners[1]>=0&&s.owners[0]!==s.owners[1],'two simultaneous touches: one finger per striker',`owners ${s.owners}`);
     check(Math.hypot(s.sx[0]-30,s.sy[0]-125)<2&&Math.hypot(s.sx[1]-70,s.sy[1]-35)<2,'each striker is under its own finger',`${s.sx.map(v=>v.toFixed(0))} / ${s.sy.map(v=>v.toFixed(0))}`);
     const b0=[s.sx[0],s.sy[0]];await touch.move(2,25,20);await wait(300);s=await st();check(Math.hypot(s.sx[1]-25,s.sy[1]-20)<2&&Math.abs(s.sx[0]-b0[0])<.01&&Math.abs(s.sy[0]-b0[1])<.01,'moving the top finger moves only the top striker');
     const b1=[s.sx[1],s.sy[1]];await touch.move(1,75,140);await wait(300);s=await st();check(Math.hypot(s.sx[0]-75,s.sy[0]-140)<2&&Math.abs(s.sx[1]-b1[0])<.01&&Math.abs(s.sy[1]-b1[1])<.01,'moving the bottom finger moves only the bottom striker');
     await shot('two');
     // a palm / third touch in the bottom half is ignored
     await touch.down(3,20,100);await wait(250);s=await st();check(Math.hypot(s.sx[0]-75,s.sy[0]-140)<2,'a third touch (palm) in a half moves nothing',`striker ${s.sx[0].toFixed(0)},${s.sy[0].toFixed(0)}`);await touch.up(3);await wait(60);s=await st();check(s.owners[0]>=0,'lifting the palm keeps the real finger');
     // the top player's release is lost: only that striker lets go
     await page.evaluate(()=>{window.__drop.up=true;});await touch.up(2);await wait(150);await page.evaluate(()=>{window.__drop.up=false;});s=await st();check(s.owners[1]<0&&s.owners[0]>=0&&!s.held[1]&&s.held[0],'lost pointerup at one end: only that striker is released',`owners ${s.owners}`);
     await touch.up(1);await wait(100);
    }else{await pointer.down(30,125);await page.keyboard.down('KeyD');await wait(450);s=await st();await page.keyboard.up('KeyD');check(Math.hypot(s.sx[0]-30,s.sy[0]-125)<2&&s.sx[1]>70,'desktop: the mouse drives player 1 and W A S D drive player 2',`${s.sx.map(v=>v.toFixed(0))}`);await shot('desktop-two');}
    // set up 6-0, then a real last goal: the bottom player shoots at an undefended goal
    await page.evaluate(()=>{const s=window.__airhockey.game.state;s.goals[0]=6;});console.log('     set up: 6-0');
    if(mobile){fingers.clear();}
    s=await playUntil(x=>x.over||x.phase==='over',45000);
    if(!(s.over||s.phase==='over')){await page.evaluate(()=>{const s=window.__airhockey.game.state;s.px=50;s.py=10;s.pvx=0;s.pvy=-200;s.phase='play';s.inGoal=false;s.lastHit=0;});console.log('     set up: the puck was sent at the open goal');}
    await page.waitForSelector('[data-air-card=duo]',{timeout:15000}).catch(()=>{});if(mobile)await touch.up(1).catch(()=>{});
    const res=await page.evaluate(()=>{const c=document.querySelector('[data-air-card=duo]');if(!c)return null;const b=c.querySelector('[data-air-again]').getBoundingClientRect(),vv=window.visualViewport,f=c.querySelector('[data-air-flip]');return {winner:c.getAttribute('data-air-winner'),tally:c.querySelector('[data-air-tally]').getAttribute('data-air-tally'),again:b.bottom,h:vv?vv.height:innerHeight,flip:f?getComputedStyle(f).rotate+' '+getComputedStyle(f).display:'',text:c.textContent.slice(0,160)};});
    check(!!res&&res.winner==='1'&&res.tally==='1-0','two players: the results card names the winner and keeps today’s head-to-head',res?`${res.text.slice(0,90)} | tally ${res.tally}`:'no card');
    if(res){check(res.again<=res.h+1,'two players: Rematch is visible in the viewport');if(mobile)check(/180deg/.test(res.flip)&&!/none/.test(res.flip),'two players: a line is turned round for the player at the top end',res.flip);}
    check(await page.locator('[data-hs-entry],[data-hs-strip],[data-arcade-board]').count()===0,'two players: no board entry');
    const sv=await page.evaluate(()=>({air:JSON.parse(localStorage.getItem('fi2-airhockey-v1')||'{}'),rec:localStorage.getItem('fi2-arcade-record-airhockey-v1')}));check(sv.air.best===0&&sv.air.duo.p1===1&&!sv.rec,'two players: no score is recorded, only the tally',JSON.stringify(sv).slice(0,120));
    await wait(600);check((await rafIdle())<=2,'two players results: no animation loop');await shot(mobile?'two-results':'desktop-two-results');
    const t1=Date.now();await press('[data-air-again]');await page.waitForFunction(()=>window.__airhockey.phase==='playing'&&window.__airhockey.game.state.goals[0]===0,null,{timeout:5000});const dt=Date.now()-t1;check(dt<1000,'rematch in one tap, under 1 s',`${dt} ms`);
   }
  }
  check(errors.length===0,'no console errors',errors.slice(0,3).join(' | '));
 }finally{await browser.close();}
 console.log(fails.length?`\nFAILED: ${fails.length}\n- ${fails.join('\n- ')}`:'\nAll Air Futbol browser checks passed.');process.exit(fails.length?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
