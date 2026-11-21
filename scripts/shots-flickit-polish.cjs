#!/usr/bin/env node
// Flick It polish pictures (Nov 21 2026): for each stage, the ready view and the kicker's follow-through just after the ball leaves,
// plus renderer.info per stage; --clip records a phone clip of real slow touch swipes (the kicker's wind-up, strike, follow-through).
//   node scripts/shots-flickit-polish.cjs --port=<n> --out=<dir> [--stages=garden,pitch] [--clip] [--tag=after]
// Always --mute-audio, phone profile 390x844 DPR 2 touch. Pass your own server; never the owner's dev server on 8092.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const path=require('node:path'),fs=require('node:fs');
const arg=n=>(process.argv.find(a=>a.startsWith(`--${n}=`))||'').slice(n.length+3),has=n=>process.argv.some(a=>a===`--${n}`||a.startsWith(`--${n}=`));
const port=arg('port'),BASE=port?`http://localhost:${port}`:'';if(!BASE||port==='8092'){console.error('Pass --port=<your server> (not 8092).');process.exit(1);}
const OUT=arg('out'),TAG=arg('tag')||'after',STAGES=(arg('stages')||'garden,plaza,pitch,beach,roof,stadium').split(',');fs.mkdirSync(OUT,{recursive:true});
const SAVE={v:1,best:0,stars:[1,1,1,1,1,1],bests:[0,0,0,0,0,0],plays:5,tricks:0,daily:{day:'',best:0,stars:0,runs:0},streak:{day:'',n:0,best:0}};
const seed=o=>{try{localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-sound-volume','0');localStorage.setItem('fi2-flickit-v1',JSON.stringify(o.save));
 if(!localStorage.getItem('fi2-arcade-wallet-v1'))localStorage.setItem('fi2-arcade-wallet-v1',JSON.stringify({version:1,spends:{},runs:{fixture:{game:'island',paid:5000,reason:'playtest entry',at:1}},packs:[]}));}catch{}};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// a kick per stage for the follow-through picture: [dx, dy, bend] as shares of the swipe scale (bend < 0 = inside of the foot)
const KICK={garden:[0,-.4,0],plaza:[-.1,-.6,-.12],pitch:[-.26,-.52,-.16],beach:[.02,-.4,.1],roof:[0,-.55,-.1],stadium:[.16,-.6,-.14]};
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio','--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});await ctx.addInitScript(seed,{save:SAVE});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e).slice(0,200)));const cdp=await ctx.newCDPSession(page);
  const S=await(async()=>{await page.goto(`${BASE}/arcade?game=flickit`,{waitUntil:'domcontentloaded'});await page.waitForSelector('[data-flickit-card="start"]',{timeout:90000});await wait(800);return page.evaluate(()=>{const r=window.__flickit.stage;return Math.min(r.width,r.height*.62);});})();
  const open=async id=>{await page.goto(`${BASE}/arcade?game=flickit`,{waitUntil:'domcontentloaded'});await page.waitForSelector('[data-flickit-card="start"]',{timeout:60000});await wait(400);
   await page.click('[data-flickit-practice]');await page.click(`[data-flickit-stage-pick="${id}"]`);await page.waitForFunction(()=>window.__flickit&&window.__flickit.phase==='playing',null,{timeout:20000});await wait(2900);};
  const flick=(dx,dy,bend,ms=120)=>page.evaluate(([dx,dy,bend,ms])=>{const f=window.__flickit,r=f.stage,b=f.view.project(0,.22,0),p=[];for(let i=0;i<=10;i++){const u=i/10;p.push({x:b.x+dx*u+bend*4*u*(1-u),y:b.y+dy*u,t:1000+ms*u});}const s=f.flickToShot(p,{w:r.width,h:r.height},f.view.flickCam());if(s)f.shoot(s);return s;},[dx,dy,bend,ms]);
  /** a real, slow touch swipe from the ball (CDP), so the kicker's wind-up plays while the finger moves */
  const swipe=async(dx,dy,bend,ms=360)=>{const b=await page.evaluate(()=>{const f=window.__flickit,p=f.view.project(0,.22,0),r=f.stage;return {x:r.x+p.x,y:r.y+p.y};}),n=14;
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x,y:b.y,id:1}]});for(let i=1;i<=n;i++){const u=i/n,e=u*u;await wait(ms/n);await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x+dx*e+bend*4*e*(1-e),y:b.y+dy*e,id:1}]});}
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
  const tee=async(max=9000)=>{const t0=Date.now();while(Date.now()-t0<max){const s=await page.evaluate(()=>window.__flickit.game.state.phase);if(s==='tee')return;await wait(120);}};
  for(const id of STAGES){await open(id);const info=await page.evaluate(()=>window.__flickit.view.info());console.log(`heat ${TAG} ${id}: ${info.calls} draws, ${info.triangles} triangles, scenery ${info.scenery} (baked), ${info.textures} textures, ${info.programs} programs`);
   await page.screenshot({path:path.join(OUT,`${TAG}-${id}.png`)});const k=KICK[id];await flick(k[0]*S,k[1]*S,k[2]*S);await wait(Number(arg('ft')||190));await page.screenshot({path:path.join(OUT,`${TAG}-${id}-strike.png`)});}
  if(has('clip')){await open('garden');const frames=[];cdp.on('Page.screencastFrame',f=>{frames.push({d:f.data,t:f.metadata.timestamp});cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});
   await cdp.send('Page.startScreencast',{format:'jpeg',quality:80,everyNthFrame:1});await wait(700);
   for(const [dx,dy,bend] of [[0,-.42,0],[.3,-.5,.12],[-.3,-.36,-.14]]){await tee();await wait(500);await swipe(dx*S,dy*S,bend*S);await wait(2100);}
   await cdp.send('Page.stopScreencast');const dir=path.join(OUT,'frames');fs.mkdirSync(dir,{recursive:true});const secs=frames.length>1?frames[frames.length-1].t-frames[0].t:1,fps=Math.max(5,Math.min(60,(frames.length-1)/secs));
   frames.forEach((f,i)=>fs.writeFileSync(path.join(dir,`f${String(i).padStart(4,'0')}.jpg`),Buffer.from(f.d,'base64')));
   require('node:child_process').execFileSync('/opt/homebrew/bin/ffmpeg',['-loglevel','error','-y','-framerate',fps.toFixed(2),'-i',path.join(dir,'f%04d.jpg'),'-vf','scale=trunc(iw/2)*2:trunc(ih/2)*2','-pix_fmt','yuv420p','-r','30',path.join(OUT,`${TAG}-phone-clip.mp4`)]);fs.rmSync(dir,{recursive:true,force:true});console.log(`clip ${frames.length} frames ${secs.toFixed(1)} s`);}
  console.log(errors.length?`page errors: ${errors.join(' | ')}`:'no page errors');await ctx.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
