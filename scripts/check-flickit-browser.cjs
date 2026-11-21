#!/usr/bin/env node
// Flick It browser check (Nov 21 2026). Plays in real Chrome (always --mute-audio) with real input (CDP touch swipes on the phone
// profile, mouse drags on desktop) and asserts: the cards are idle (no rAF running), a swipe kicks the ball, a curved swipe gives
// the ball spin, a level reaches its card, pause stops the loop, every stage loads, no console errors. Prints draw calls and
// triangles per stage (renderer.info) and the cost of a frame.
//   node scripts/check-flickit-browser.cjs --port=<n> [--mobile] [--size=390x844] [--shots=<dir>] [--clip=<dir>] [--headed]
// --shots: writes flickit-*.png into the directory. --clip=<dir>: records a few flicks (CDP screencast frames -> mp4 by the system ffmpeg, next to <dir>).
// Pass your own server; never the owner's dev server on 8092.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const path=require('node:path'),fs=require('node:fs');
const arg=n=>(process.argv.find(a=>a.startsWith(`--${n}=`))||'').slice(n.length+3),has=n=>process.argv.some(a=>a===`--${n}`||a.startsWith(`--${n}=`));
const port=arg('port')||process.env.PORT,BASE=process.env.FUTBOL_BASE_URL||(port?`http://localhost:${port}`:'');
if(!BASE||/:8092\b/.test(BASE)){console.error('Pass your own server: --port=<port> (not 8092) or FUTBOL_BASE_URL=<url>.');process.exit(1);}
const mobile=has('mobile'),[vw,vh]=(arg('size')||(mobile?'390x844':'1440x900')).split('x').map(Number),SHOTS=arg('shots'),CLIP=arg('clip'),tag=mobile?'phone':'desktop';
const SAVE={v:1,best:0,stars:[1,1,1,1,1,1],bests:[0,0,0,0,0,0],plays:5,tricks:0,daily:{day:'',best:0,stars:0,runs:0},streak:{day:'',n:0,best:0}};
const seed=o=>{try{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-sound-volume','0.5');if(o.save)localStorage.setItem('fi2-flickit-v1',JSON.stringify(o.save));
 if(!localStorage.getItem('fi2-arcade-wallet-v1'))localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,spends:{},runs:{fixture:{game:'island',paid:5000,reason:'playtest entry',at:1}},packs:[]}));}catch{}
 const raf=window.requestAnimationFrame.bind(window);window.__rafCalls=0;window.requestAnimationFrame=cb=>{window.__rafCalls++;return raf(cb);};};
const fails=[],check=(ok,what,detail='')=>{console.log(`${ok?'ok  ':'FAIL'} ${what}${detail?` (${detail})`:''}`);if(!ok)fails.push(what);};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:!has('headed'),args:['--mute-audio','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 try{
  const ctx=await browser.newContext({viewport:{width:vw,height:vh},deviceScaleFactor:mobile?2:1,hasTouch:mobile,isMobile:mobile});
  await ctx.addInitScript(seed,{save:has('fresh')?null:SAVE});const page=await ctx.newPage(),errors=[];
  page.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource|supabase|net::ERR/i.test(m.text()))errors.push(m.text().slice(0,200));});page.on('pageerror',e=>errors.push(String(e).slice(0,200)));
  const cdp=await ctx.newCDPSession(page);
  const shot=async name=>{if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await page.screenshot({path:path.join(SHOTS,`flickit-${tag}-${name}.png`)});}};
  const st=()=>page.evaluate(()=>{const f=window.__flickit,g=f&&f.game;return g?{phase:f.phase,loop:f.loop,gp:g.state.phase,flicks:g.state.flicks,score:g.state.score,spin:g.state.shot.spin,power:g.state.shot.power,stage:g.state.stage.id,ballZ:g.state.ball.z,done:g.state.ents.filter(e=>e.done).length}:{phase:f?f.phase:'none',loop:f?f.loop:false};});
  const box=()=>page.evaluate(()=>{const r=window.__flickit.stage;return {x:r.x,y:r.y,w:r.width,h:r.height};});
  const ballAt=()=>page.evaluate(()=>{const f=window.__flickit,p=f.view.project(0,.22,0),r=f.stage;return {x:r.x+p.x,y:r.y+p.y};});
  /** A swipe from the ball: `dx,dy` its end (px, y up negative), `bend` px of sideways bulge in the middle, over `ms`. */
  const swipe=async(dx,dy,bend=0,ms=130)=>{const b=await ballAt(),n=9,pts=[];for(let i=0;i<=n;i++){const u=i/n;pts.push({x:b.x+dx*u+bend*4*u*(1-u),y:b.y+dy*u});}
   if(mobile){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:pts[0].x,y:pts[0].y,id:1}]});for(let i=1;i<=n;i++){await wait(ms/n);await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:pts[i].x,y:pts[i].y,id:1}]});}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
   else{await page.mouse.move(pts[0].x,pts[0].y);await page.mouse.down();for(let i=1;i<=n;i++){await wait(ms/n);await page.mouse.move(pts[i].x,pts[i].y);}await page.mouse.up();}};
  /** A kick from a made-up finger path with exact times (CDP events arrive late, so real swipes cannot test speed): through the real flickToShot and the shell's kick. */
  const flick=(dx,dy,bend=0,ms=130)=>page.evaluate(([dx,dy,bend,ms])=>{const f=window.__flickit,r=f.stage,b=f.view.project(0,.22,0),p=[];for(let i=0;i<=10;i++){const u=i/10;p.push({x:b.x+dx*u+bend*4*u*(1-u),y:b.y+dy*u,t:1000+ms*u});}const s=f.flickToShot(p,{w:r.width,h:r.height},f.view.flickCam());if(s)f.shoot(s);return s;},[dx,dy,bend,ms]);
  const tee=async(max=9000)=>{const t0=Date.now();while(Date.now()-t0<max){const s=await st();if(s.gp==='tee'||s.phase!=='playing')return s;await wait(120);}return st();};
  await page.goto(`${BASE}/arcade?game=flickit`,{waitUntil:'domcontentloaded'});await page.waitForSelector('[data-flickit-card="start"]',{timeout:90000});await wait(1200);
  {const a=await page.evaluate(()=>window.__rafCalls);await wait(700);const b=await page.evaluate(()=>window.__rafCalls);check(b-a<=2,'start card: no frames drawn',`${b-a} rAF calls in 0.7 s`);}
  await shot('menu');
  const sb=await page.evaluate(()=>{const r=window.__flickit.stage;return {w:r.width,h:r.height};}),S=Math.min(sb.w,sb.h*.62),heat=[];
  const stages=['garden','plaza','pitch','beach','roof','stadium'];
  for(const id of stages){
   await page.click('[data-flickit-practice]');await page.click(`[data-flickit-stage-pick="${id}"]`);await page.waitForFunction(()=>window.__flickit&&window.__flickit.phase==='playing',null,{timeout:20000});
   await wait(2900);let s=await st();check(s.stage===id&&s.gp==='tee','stage loads: '+id,JSON.stringify(s));
   heat.push({id,...await page.evaluate(()=>window.__flickit.view.info())});await shot(`${id}-ready`);
   if(id==='garden'){await swipe(.3*S,-S*.5,0,90);await wait(200);s=await st();check(s.flicks===5,'a real swipe kicks the ball',JSON.stringify(s));await tee();const k=await flick(0,-S*.36,0,110);await wait(330);s=await st();check(Math.abs(s.spin)<.2&&s.power>.3,'a straight swipe: no curl, power from speed',JSON.stringify(k));await shot('garden-flight');s=await tee();check(s.done>0,'the straight kick knocks cans over',`${s.done} things done, score ${s.score}`);
    await page.keyboard.press('KeyP');await wait(300);const a=await page.evaluate(()=>window.__rafCalls);await wait(600);const b=await page.evaluate(()=>window.__rafCalls);check(b-a<=2,'pause: the loop sleeps',`${b-a} rAF`);await page.keyboard.press('KeyP');await wait(200);}
   if(id==='pitch'){const k=await flick(-S*.26,-S*.52,-S*.16,120);check(k&&k.spin>.3,'a swipe that bends right gives the ball right-hand curl',JSON.stringify(k));await wait(620);await shot('pitch-curl');await tee();}
   if(id==='beach'){await flick(S*.02,-S*.4,S*.1,120);await wait(450);await shot('beach-flight');await tee();}
   if(id==='stadium'){await flick(S*.16,-S*.6,-S*.14,105);await wait(560);await shot('stadium-flight');await tee();}
   // out through pause -> restart is not needed: leave by reloading the game card
   await page.goto(`${BASE}/arcade?game=flickit`,{waitUntil:'domcontentloaded'});await page.waitForSelector('[data-flickit-card="start"]',{timeout:60000});await wait(500);}
  for(const h of heat)console.log(`heat ${tag} ${h.id}: ${h.calls} draw calls, ${h.triangles} triangles, ${h.textures} textures, ${h.geometries} geometries, ${h.programs} programs`);
  if(CLIP){// a clip of the curl stage: the page's own frames (CDP screencast), put together by the system ffmpeg
   fs.mkdirSync(CLIP,{recursive:true});const frames=[];cdp.on('Page.screencastFrame',f=>{frames.push({d:f.data,t:f.metadata.timestamp});cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});
   await page.click('[data-flickit-practice]');await page.click('[data-flickit-stage-pick="pitch"]');await page.waitForFunction(()=>window.__flickit&&window.__flickit.phase==='playing');await wait(600);
   await cdp.send('Page.startScreencast',{format:'jpeg',quality:82,everyNthFrame:1});await wait(2300);
   for(const [dx,dy,bend,ms] of [[-.3,-.5,-.17,120],[.12,-.56,.13,115],[-.05,-.5,0,100],[-.34,-.3,0,90]]){await tee(6000);await flick(dx*S,dy*S,bend*S,ms);await wait(1900);}
   await cdp.send('Page.stopScreencast');const secs=frames.length>1?frames[frames.length-1].t-frames[0].t:1,fps=Math.max(5,Math.min(60,(frames.length-1)/secs));frames.forEach((f,i)=>fs.writeFileSync(path.join(CLIP,`f${String(i).padStart(4,'0')}.jpg`),Buffer.from(f.d,'base64')));
   const out=path.join(CLIP,'..',`flickit-${tag}-clip.mp4`);require('node:child_process').execFileSync(process.env.FFMPEG||'/opt/homebrew/bin/ffmpeg',['-loglevel','error','-y','-framerate',fps.toFixed(2),'-i',path.join(CLIP,'f%04d.jpg'),'-vf','scale=trunc(iw/2)*2:trunc(ih/2)*2','-pix_fmt','yuv420p','-r','30',out]);fs.rmSync(CLIP,{recursive:true,force:true});console.log(`clip: ${frames.length} frames, ${secs.toFixed(1)} s, ${fps.toFixed(1)} fps -> ${out}`);
   await page.goto(`${BASE}/arcade?game=flickit`,{waitUntil:'domcontentloaded'});await page.waitForSelector('[data-flickit-card="start"]',{timeout:60000});await wait(500);}
  if(CLIP||has('level')){// a whole level on the first stage: flicks until its card
   await page.click('[data-flickit-practice]');await page.click('[data-flickit-stage-pick="garden"]');await wait(2900);const plan=[[0,-.42,0,120],[.33,-.52,0,120],[-.3,-.3,0,260],[-.16,-.52,.1,130],[.2,-.6,-.1,120],[.3,-.5,0,120]];
   for(const [dx,dy,bend,ms] of plan){const s=await tee();if(s.phase!=='playing'||s.gp!=='tee')break;await flick(dx*S,dy*S,bend*S,ms);await wait(700);}
   await page.waitForSelector('[data-flickit-card="results"]',{timeout:20000});await wait(900);await shot('results');const score=await page.getAttribute('[data-flickit-card="results"]','data-flickit-score');check(Number(score)>0,'a level reaches its results card with a score',`score ${score}`);
   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('fi2-flickit-v1')||'{}'));check(saved.plays===6,'the save is written',`plays ${saved.plays}`);}
  check(errors.length===0,'no console errors',errors.slice(0,3).join(' | '));
  await ctx.close();
 }finally{await browser.close();}
 console.log(fails.length?`\n${fails.length} FAILED: ${fails.join('; ')}`:'\nall checks passed');process.exit(fails.length?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
