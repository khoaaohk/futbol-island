// Record real live-match play: join FMT with camera ANGLE, a scripted player chases the ball (screen-relative arrow keys, the
// game's own controls) and passes/shoots; the WebGL canvas itself is recorded (canvas.captureStream(30) + MediaRecorder VP9,
// 1920x1080 device pixels, no DOM HUD). Usage: node record.cjs <fmt> <angle> <seconds>
const {chromium}=require('playwright');
const fs=require('fs');
const OUT=process.env.OUTDIR||require('os').tmpdir()+'/live-match-raw',FMT=process.argv[2],ANGLE=process.argv[3],SECS=+(process.argv[4]||20);fs.mkdirSync(OUT,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist','--mute-audio']});
 const ctx=await browser.newContext({viewport:{width:1280,height:720},deviceScaleFactor:1.5});
 const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(a=>{localStorage.setItem('fi2-welcome-v1','completed');sessionStorage.setItem('fi2-island-handoff','1');sessionStorage.setItem('fi2-join-cam-v1',a);},ANGLE);
 await page.goto('http://localhost:'+(process.env.PORT||9032)+'/play?from=e2e',{waitUntil:'domcontentloaded',timeout:300000});
 await page.waitForFunction(()=>window.__fi2?.games&&window.__fi2?.liveJoin&&!document.querySelector('[class*=IslandLoading]'),null,{timeout:300000});await page.waitForTimeout(2500);
 for(let i=0;i<3;i++){if(!(await page.locator('dialog[open]').count()))break;await page.keyboard.press('Escape');await page.waitForTimeout(400);}
 await page.waitForFunction(f=>window.__fi2.games.entries.some(e=>e.venue.id===f),FMT,{timeout:120000});
 const v=await page.evaluate(f=>{const e=window.__fi2.games.entries.find(e=>e.venue.id===f);return {x:e.venue.x,z:e.venue.z,w:e.venue.width,yaw:e.venue.yaw??0};},FMT);
 await page.evaluate(({x,z,w,yaw})=>{const f=window.__fi2;f.rideRef.current='walk';f.flight.height=0;const off=w/2+2;f.location.x=x+(yaw?0:off);f.location.z=z+(yaw?off:0);},v);
 await page.waitForTimeout(2500);
 await page.keyboard.press('Enter');await page.waitForTimeout(1200);await page.keyboard.press('Enter');await page.waitForTimeout(2500);
 const joined=await page.evaluate(()=>({j:window.__fi2.liveJoin.joined,a:window.__fi2.liveJoin.cameraAngle,f:window.__fi2.liveJoin.format}));
 console.log('joined',JSON.stringify(joined));if(!joined.j){await browser.close();process.exit(2);}
 // the scripted player: where am I and the ball on screen
 const look=()=>page.evaluate(f=>{const F=window.__fi2,e=F.games.entries.find(e=>e.venue.id===f),me=F.liveJoin.position({x:0,z:0});if(!me)return null;
  const T=F.camera.position.constructor,b=new T(),p=new T();e.ball.getWorldPosition(b);p.set(me.x,b.y,me.z);
  const d=Math.hypot(b.x-me.x,b.z-me.z);b.project(F.camera);p.project(F.camera);return {dx:b.x-p.x,dy:b.y-p.y,d,score:{...e.sim.score},t:e.sim.stats.time};},FMT);
 // start recording the canvas
 await page.evaluate(()=>{const c=window.__fi2.renderer.domElement,s=c.captureStream(30);
  const r=new MediaRecorder(s,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:40e6});window.__chunks=[];window.__rec=r;
  r.ondataavailable=ev=>{if(ev.data.size)window.__chunks.push(ev.data);};r.start(1000);window.__t0=performance.now();});
 const held=new Set();const setKeys=async want=>{for(const k of [...held])if(!want.has(k)){await page.keyboard.up(k);held.delete(k);}for(const k of want)if(!held.has(k)){await page.keyboard.down(k);held.add(k);}};
 const t0=Date.now();let owned=0,lastKick=0,kicks=0,log=[];
 while(Date.now()-t0<SECS*1000){
  const s=await look();if(!s){await page.waitForTimeout(100);continue;}
  const want=new Set(),m=Math.hypot(s.dx,s.dy);
  if(m>.02){if(s.dx>m*.38)want.add('ArrowRight');if(s.dx<-m*.38)want.add('ArrowLeft');if(s.dy>m*.38)want.add('ArrowUp');if(s.dy<-m*.38)want.add('ArrowDown');}
  if(s.d<1.4){owned++;}else owned=0;
  await setKeys(want);
  if(owned>=4&&Date.now()-lastKick>1800){const k=kicks%3===2?' ':'j';await page.keyboard.down(k);await page.waitForTimeout(k==='j'?380:120);await page.keyboard.up(k);lastKick=Date.now();kicks++;owned=0;log.push([((Date.now()-t0)/1000).toFixed(1),k==='j'?'shot':'pass']);}
  await page.waitForTimeout(90);
 }
 await setKeys(new Set());
 const end=await look();
 const b64=await page.evaluate(()=>new Promise(res=>{const r=window.__rec;r.onstop=async()=>{const blob=new Blob(window.__chunks,{type:'video/webm'});const fr=new FileReader();fr.onload=()=>res(String(fr.result).split(',')[1]);fr.readAsDataURL(blob);};r.stop();}));
 const pr=await page.evaluate(()=>window.__fi2.renderer.getPixelRatio());
 const file=`${OUT}/${FMT}-${ANGLE}.webm`;fs.writeFileSync(file,Buffer.from(b64,'base64'));
 console.log(JSON.stringify({file,bytes:fs.statSync(file).size,pr,score:end&&end.score,kicks:log,errors:errors.slice(0,3)}));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
