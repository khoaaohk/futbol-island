#!/usr/bin/env node
// FootGolf Island browser check (Nov 21 2026). Plays in real Chrome (always --mute-audio) with real input (CDP touch drags on the phone
// profile, mouse drags on desktop) and asserts: the start card is idle, the flyover plays and a tap skips it, a drag back kicks the
// ball, the loop sleeps on a still aim view, pause stops the loop, every hole loads, no console errors. Prints draw calls and triangles
// per hole (renderer.info).
//   node scripts/check-footgolf-browser.cjs --port=<n> [--mobile] [--size=390x844] [--shots=<dir>] [--clip=<dir>] [--headed]
// --shots: writes footgolf-*.png into the directory. --clip=<dir>: records ~10 s of play (CDP screencast frames -> mp4 by ffmpeg).
// Pass your own server; never the owner's dev server on 8092. Structure copied from scripts/check-flickit-browser.cjs (branch game-flickit).
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const path=require('node:path'),fs=require('node:fs'),{execFileSync}=require('node:child_process');
const arg=n=>(process.argv.find(a=>a.startsWith(`--${n}=`))||'').slice(n.length+3),has=n=>process.argv.some(a=>a===`--${n}`||a.startsWith(`--${n}=`));
const port=arg('port')||process.env.PORT,BASE=process.env.FUTBOL_BASE_URL||(port?`http://localhost:${port}`:'');
if(!BASE||/:8092\b/.test(BASE)){console.error('Pass your own server: --port=<port> (not 8092) or FUTBOL_BASE_URL=<url>.');process.exit(1);}
const mobile=has('mobile'),[vw,vh]=(arg('size')||(mobile?'390x844':'1440x900')).split('x').map(Number),SHOTS=arg('shots'),CLIP=arg('clip'),tag=mobile?'phone':'desktop';
const seed=()=>{try{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-sound-volume','0.5');
 if(!localStorage.getItem('fi2-arcade-wallet-v1'))localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,spends:{},runs:{fixture:{game:'island',paid:5000,reason:'playtest entry',at:1}},packs:[]}));}catch{}
 const raf=window.requestAnimationFrame.bind(window);window.__rafCalls=0;window.requestAnimationFrame=cb=>{window.__rafCalls++;return raf(cb);};};
const fails=[],check=(ok,what,detail='')=>{console.log(`${ok?'ok  ':'FAIL'} ${what}${detail?` (${detail})`:''}`);if(!ok)fails.push(what);};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:!has('headed'),args:['--mute-audio','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 try{
  const ctx=await browser.newContext({viewport:{width:vw,height:vh},deviceScaleFactor:mobile?2:1,hasTouch:mobile,isMobile:mobile});
  await ctx.addInitScript(seed);const page=await ctx.newPage(),errors=[];
  page.on('console',m=>{if(m.type()==='error'&&!/favicon|Failed to load resource|supabase|net::ERR/i.test(m.text()))errors.push(m.text().slice(0,200));});page.on('pageerror',e=>errors.push(String(e).slice(0,200)));
  const cdp=await ctx.newCDPSession(page);
  const shot=async name=>{if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await page.screenshot({path:path.join(SHOTS,`footgolf-${tag}-${name}.png`)});}};
  const st=()=>page.evaluate(()=>{const f=window.__footgolf,g=f&&f.game;return g?{phase:f.phase,loop:f.loop,gp:g.state.phase,kicks:g.state.kicks,ix:g.state.ix,hole:g.state.hole.def.id,bx:g.state.ball.x,bz:g.state.ball.z,fly:f.view.flying,cam:f.view.camMode,dist:g.cupDist()}:{phase:f?f.phase:'none'};});
  const stage=()=>page.evaluate(()=>{const r=document.querySelector('[data-footgolf-stage]').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};});
  /** A drag back from the middle of the stage: `dy` px down (more = harder), `dx` px sideways, over `ms`. */
  const pull=async(dy,dx=0,ms=400)=>{const b=await stage(),x0=b.x+b.w/2,y0=b.y+b.h*.42,n=10;
   if(mobile){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x0,y:y0,id:1}]});for(let i=1;i<=n;i++){await wait(ms/n);await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x0+dx*i/n,y:y0+dy*i/n,id:1}]});}await wait(120);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
   else{await page.mouse.move(x0,y0);await page.mouse.down();for(let i=1;i<=n;i++){await wait(ms/n);await page.mouse.move(x0+dx*i/n,y0+dy*i/n);}await wait(120);await page.mouse.up();}};
  const tapStage=async()=>{const b=await stage();if(mobile)await page.touchscreen.tap(b.x+b.w/2,b.y+b.h*.4);else await page.mouse.click(b.x+b.w/2,b.y+b.h*.4);};
  const until=async(fn,max=15000)=>{const t0=Date.now();while(Date.now()-t0<max){const s=await st();if(fn(s))return s;await wait(150);}return st();};
  const info=()=>page.evaluate(()=>window.__footgolf.view.info());
  await page.goto(`${BASE}/arcade?game=footgolf`,{waitUntil:'domcontentloaded'});await page.waitForSelector('[data-footgolf-card="start"]',{timeout:120000});await wait(1500);
  {const a=await page.evaluate(()=>window.__rafCalls);await wait(700);const b=await page.evaluate(()=>window.__rafCalls);check(b-a<=2,'start card: no frames drawn',`${b-a} rAF calls in 0.7 s`);}
  await page.click('[data-footgolf-play]');await page.waitForSelector('[data-footgolf-hud]',{timeout:15000});await wait(900);
  let s=await st();check(s.fly,'the hole opens with a flyover',s.cam);await shot('flyover');
  let clip=null;if(CLIP){fs.mkdirSync(CLIP,{recursive:true});const frames=[];await cdp.send('Page.startScreencast',{format:'jpeg',quality:70,maxWidth:mobile?780:1280,everyNthFrame:1});cdp.on('Page.screencastFrame',f=>{frames.push({t:f.metadata.timestamp,d:f.data});cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});clip=frames;}
  if(!CLIP)await tapStage();s=await until(x=>!x.fly&&x.gp==='aim',9000);check(!s.fly&&s.gp==='aim','flyover ends at the aim view',s.cam);await wait(900);await shot('aim');
  {await wait(1800);const a=await page.evaluate(()=>window.__rafCalls);await wait(700);const b=await page.evaluate(()=>window.__rafCalls);check(b-a<=2,'still aim view: the loop sleeps',`${b-a} rAF calls in 0.7 s`);}
  // a long kick off the tee
  await page.click('[data-footgolf-kick="long"]');await pull(mobile?190:230,0,500);s=await st();check(s.kicks===1,'a drag back kicks the ball',`kicks ${s.kicks}, ${s.gp}`);
  await wait(500);{const i=await info();console.log(`  in flight: ${i.calls} draws, ${i.triangles} triangles, ${i.textures} textures, ${i.programs} programs`);}await shot('flight');
  s=await until(x=>x.gp==='aim'||x.gp==='done',20000);check(s.dist<45,'the kick goes down the hole',`${s.dist.toFixed(1)} m to the cup`);
  // play the hole out with the suggested kicks and a computed pull (the shell's own power for the distance)
  for(let k=0;k<7&&s.gp!=='done';k++){s=await until(x=>x.gp==='aim'&&!x.loop||x.gp==='done',12000);if(s.gp==='done')break;
   const d=s.dist,b=await stage(),m=Math.min(b.w,b.h)*.38,kind=await page.evaluate(()=>document.querySelector('[data-footgolf-kick][data-on]')?.getAttribute('data-footgolf-kick'));
   const frac=kind==='putt'?Math.min(1,(d*.55+1.2)/9):kind==='pass'?Math.min(1,d/34):kind==='chip'?Math.min(1,d/30):Math.min(1,d/58);
   if(kind==='putt'&&k>=0)await shot('putt');
   await pull(Math.max(12,frac*m),0,450);await wait(700);if(kind==='putt')await shot('rolling');s=await until(x=>x.gp==='aim'||x.gp==='done',20000);}
  if(clip){await cdp.send('Page.stopScreencast');const dir=fs.mkdtempSync(path.join(CLIP,'.frames-'));clip.forEach((f,i)=>fs.writeFileSync(path.join(dir,`f${String(i).padStart(4,'0')}.jpg`),Buffer.from(f.d,'base64')));
   const secs=clip.length>1?clip[clip.length-1].t-clip[0].t:1,fps=Math.max(5,Math.min(30,Math.round(clip.length/secs)));
   try{execFileSync('/opt/homebrew/bin/ffmpeg',['-y','-loglevel','error','-framerate',String(fps),'-i',path.join(dir,'f%04d.jpg'),'-vf','scale=trunc(iw/2)*2:trunc(ih/2)*2','-c:v','libx264','-pix_fmt','yuv420p','-t','12',path.join(CLIP,`footgolf-${tag}.mp4`)]);console.log(`  clip: ${clip.length} frames, ${secs.toFixed(1)} s`);}catch(e){console.log('  clip failed',String(e).slice(0,120));}
   fs.rmSync(dir,{recursive:true,force:true});}
  console.log(`  hole 1 after the play: ${s.gp}, ${s.kicks} kicks`);
  // pause stops the loop
  await page.keyboard.press('KeyP');await wait(400);{const a=await page.evaluate(()=>window.__rafCalls);await wait(600);const b=await page.evaluate(()=>window.__rafCalls);const ph=(await st()).phase;check(ph==='paused'||ph==='between'||ph==='over','P pauses',ph);if(ph==='paused')check(b-a<=1,'paused: no frames',`${b-a}`);}
  // every hole loads: draws and triangles at the aim view of each tee
  const rows=[];
  console.log('  per hole (aim view at the tee):');
  for(let i=0;i<9;i++){await page.evaluate(i=>window.__footgolf.loadHole(i),i);await wait(300);const s2=await st();await page.evaluate(()=>window.__footgolf.view.skipFlyover());await wait(500);await page.evaluate(()=>window.__footgolf.wake());await wait(900);const inf=await info();rows.push({hole:s2.hole,...inf});console.log(`   ${i+1} ${s2.hole}: ${inf.calls} draws, ${inf.triangles} triangles`);
   if(i===5||i===7)await shot(`hole${i+1}`);}
  check(rows.length===9&&rows.every(r=>r.calls>0),'every hole draws');
  // a putt across the museum's steep green (it breaks downhill): the low cup camera
  {await page.evaluate(()=>window.__footgolf.loadHole(5));await wait(300);await page.evaluate(()=>window.__footgolf.view.skipFlyover());await wait(900);
   await page.evaluate(()=>{const f=window.__footgolf,c=f.game.state.hole.cup;f.placeBall(c[0]+5,c[1]-7);f.setKind('putt');});await wait(1300);await shot('green-aim');
   await pull(mobile?150:170,0,450);await wait(1500);await shot('green-rolling');const s3=await until(x=>x.gp==='aim'||x.gp==='done',12000);console.log(`  green putt: ${s3.gp}, ${s3.dist.toFixed(2)} m left`);}
  check(errors.length===0,'no console errors',errors.slice(0,3).join(' | '));
 }finally{await browser.close();}
 if(fails.length){console.log(`\n${fails.length} FAILED: ${fails.join('; ')}`);process.exit(1);}console.log('\nall ok');
})().catch(e=>{console.error(e);process.exit(1);});
