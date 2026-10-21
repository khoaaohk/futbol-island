// Playtest as a first-time kid: fresh save, start at the sign, walk to bugs (W from the follow camera), Swing, catch 5+, release.
// Asserts the job pill is in the DOM, visible, in the viewport and not covered at every step; screenshots at 10/25/40 m.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
// usage: FUTBOL_BASE_URL=http://localhost:PORT [TOD=day|sunset|night] node scripts/check-bug-visible-browser.cjs [--mobile]
const base=process.env.FUTBOL_BASE_URL||'http://localhost:8137',OUT=process.env.BUG_SHOTS||'/tmp/bug-visible';require('node:fs').mkdirSync(OUT,{recursive:true});const mobile=process.argv.includes('--mobile'),tag=mobile?'phone':'desktop';
const time=process.env.TOD||'day';const wait=ms=>new Promise(r=>setTimeout(r,ms));const SIGN={x:606,z:133.5};const log=[];const t0=Date.now();
const note=s=>{log.push(`${((Date.now()-t0)/1000).toFixed(1)}s ${s}`);};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--mute-audio','--use-angle=metal']});const rep={tag,time};
try{const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|favicon|404/.test(m.text()))errors.push(m.text());});
 await page.addInitScript(({SIGN,time})=>{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-time-of-day',time);
  for(const [k,v] of Object.entries({'fi2-sound-muted':'true','fi2-music-enabled':'false','fi2-voice-enabled':'false'}))localStorage.setItem(k,v);
  sessionStorage.setItem('fi2-arcade-departure-v1',JSON.stringify({version:1,x:SIGN.x,z:SIGN.z,yaw:Math.PI,ride:'walk',flightHeight:0}));},{SIGN,time});
 await page.goto(base+'/?from=konbini',{timeout:300000});await page.waitForFunction(()=>window.__fi2&&window.__fi2Jobs,null,{timeout:300000});
 await page.locator('[data-island-return-loading]').waitFor({state:'detached',timeout:90000}).catch(()=>{});await wait(1500);note('island loaded at the sign');
 const tap=loc=>mobile?loc.tap():loc.click();
 const pill=async(when)=>{const r=await page.evaluate(()=>{const el=document.querySelector('[data-job-active]');if(!el)return {ok:false,why:'missing'};const b=el.getBoundingClientRect();
   if(b.width<40||b.height<20)return {ok:false,why:'zero rect'};if(b.top<0||b.left<0||b.bottom>innerHeight||b.right>innerWidth)return {ok:false,why:'off screen'};
   const pts=[[b.left+b.width/2,b.top+b.height/2],[b.right-16,b.top+b.height/2]];for(const [x,y] of pts){const top=document.elementFromPoint(x,y);if(!top||!el.contains(top))return {ok:false,why:'covered by '+(top?.className||top?.tagName)};}
   const end=el.querySelector('[data-job-end]')||[...el.querySelectorAll('button')].find(x=>/end job/i.test(x.getAttribute('aria-label')||x.textContent||''));const hint=el.querySelector('[data-bug-hint]');
   return {ok:!!end&&!!hint,why:(!end?'no End job ':'')+(!hint?'no hint':'')};});
  if(!r.ok)rep.pillFail=(rep.pillFail||[]).concat(when+': '+r.why);return r.ok;};
 const offer=page.locator('[data-job-offer="bug-scout"]');await offer.waitFor({timeout:20000});await tap(offer);const go=page.getByRole('button',{name:'Start job'});await go.waitFor({timeout:8000});await tap(go);
 await page.waitForFunction(()=>window.__fi2Jobs.run,null,{timeout:8000});note('shift started');await wait(1200);await pill('start');
 const btn=()=>page.evaluate(()=>[...document.querySelectorAll('[data-job-action]')].map(b=>b.dataset.jobAction+(b.getAttribute('aria-disabled')?':off':':on')).join(' '));
 rep.buttonsAtStart=await btn();
 // camera "forward" (W walks away from the camera): the camera sits behind the player; read it from the camera.
 const fwd=await page.evaluate(()=>{const f=window.__fi2,c=f.camera??f.cameraObject;return null;});
 const nearestBug=()=>page.evaluate(()=>{const f=window.__fi2,j=window.__fi2Jobs,l=f.location,list=j.run.def.targets?j.run.def:null;const got=new Set();
  const all=f.wildBugs.query(l.x,0,l.z,3000).map(b=>({id:b.id,sp:b.species?.id,x:b.x,y:b.y,z:b.z,d:Math.hypot(b.x-l.x,b.z-l.z)}));return {l,all};});
 const camU=()=>page.evaluate(()=>{const f=window.__fi2,e=f.camera.matrixWorld.elements,dx=e[8],dz=e[10],n=Math.hypot(dx,dz)||1;return {ux:dx/n,uz:dz/n};});// camera back axis (toward the camera)
 let caught=0,swings=0,misses=0;const times=[];
 for(let k=0;k<12&&caught<6;k++){
  const {l,all}=await nearestBug();const run=await page.evaluate(()=>window.__fi2Jobs.run.got.slice());
  const got=await page.evaluate(()=>{const r=window.__fi2Jobs.run;return r.def.targets.map((t,i)=>r.got[i]?t.id??t.species??'':'' );});const bug=all.find(b=>!run.length||true)&&all[0];if(!bug){note('no bug out!');break;}
  // stand 12 m from the bug, on the camera side (camera is +x,+z of the player), facing it, then walk in with W
  const {ux,uz}=await camU();const sx=bug.x+ux*12,sz=bug.z+uz*12;
  await page.evaluate(({x,z,yaw})=>window.__fi2.teleport(x,z,yaw),{x:sx,z:sz,yaw:Math.atan2(bug.x-sx,bug.z-sz)});await wait(700);
  const tWalk=Date.now();await page.keyboard.down('KeyW');let reached=0,d=99;
  for(let i=0;i<60;i++){await wait(100);d=await page.evaluate(id=>{const f=window.__fi2,l=f.location,p={x:0,y:0,z:0};const b=f.wildBugs.bugs.find(b=>b.id===id);return Math.hypot(b.x-l.x,b.z-l.z);},bug.id);if(d<5){reached=Date.now();break;}}
  await page.keyboard.up('KeyW');
  const tSwing=Date.now();await page.keyboard.press('Space');swings++;await wait(900);
  const z=await page.evaluate(()=>({zoom:window.__fi2Jobs.zooming,got:window.__fi2Jobs.run?.got.filter(Boolean).length??0,hint:window.__fi2Jobs.getView().active?.hint}));
  if(z.zoom){caught++;times.push(((Date.now()-tWalk)/1000).toFixed(1));note(`catch ${caught}: ${bug.sp} walked ${((reached||Date.now())-tWalk)/1000|0}s, swing at ${d.toFixed(1)} m → zoom (total ${((Date.now()-tWalk)/1000).toFixed(1)} s)`);
   if(caught===1)await page.screenshot({path:`${OUT}/play-${tag}-${time}-catch-zoom.png`});await wait(4200);await pill('after catch '+caught);
   if(caught===1){await page.screenshot({path:`${OUT}/play-${tag}-${time}-story-card.png`});}
   const card=page.locator('[data-bug-card]');if(await card.count()){await tap(card.first()).catch(()=>{});}await wait(400);}
  else{misses++;note(`miss on ${bug.sp} at ${d.toFixed(1)} m: "${z.hint||''}"`);await wait(800);await pill('after miss');}
 }
 rep.caught=caught;rep.swings=swings;rep.misses=misses;rep.times=times;rep.buttonsAfter=await btn();
 // riding: the pill stays
 await page.keyboard.press('KeyR');await wait(1200);await pill('riding');note('riding, run '+(await page.evaluate(()=>!!window.__fi2Jobs.run)));rep.buttonsRiding=await btn();await page.keyboard.press('KeyR');await page.keyboard.press('KeyR');await page.keyboard.press('KeyR');await wait(800);
 // screenshots at 10 / 25 / 40 m from the follow camera: hold one bug still, stand D m in front of it (the bug up-screen)
 const {all}=await nearestBug();const b=all.find(x=>x.sp)??all[0];rep.shotBug=b?.sp;
 await page.evaluate(()=>window.__fi2.teleport(640,140,Math.PI));await wait(1500);
 for(const D of (mobile?[3,10,17]:[10,25,40])){const {ux,uz}=await camU();
  const cd=await page.evaluate(({id,D,ux,uz})=>{const f=window.__fi2,l=f.location,b=f.wildBugs.bugs.find(q=>q.id===id);b.x=b.hx=l.x-ux*D;b.z=b.hz=l.z-uz*D;b.y=b.y-b.g+(b.g=l.y??b.g);f.wildBugs.hold(id,8);
   const c=f.camera.position;return Math.round(Math.hypot(c.x-b.x,c.y-b.y,c.z-b.z));},{id:b.id,D,ux,uz});await wait(1500);
  (rep.camDist=rep.camDist||[]).push(cd);await page.screenshot({path:`${OUT}/${tag}-${time}-${D}m-cam${cd}m.png`});}
 // Release: fill the jar, walk to the hotel
 if(!(await page.evaluate(()=>!!window.__fi2Jobs.run))){note('shift ended by the far teleports: '+(await page.evaluate(()=>window.__fi2Jobs.getView().ended?.text||'?')));const offer=page.locator('[data-job-offer="bug-scout"]');await page.evaluate(()=>window.__fi2.teleport(606,133.5,Math.PI));await wait(1500);await tap(offer);await tap(page.getByRole('button',{name:'Start job'}));await wait(1500);}
 await page.evaluate(()=>{const r=window.__fi2Jobs.run;r.got=r.got.map(()=>true);r.phase='deliver';r.at=-1;});await wait(400);rep.buttonsDeliver=await btn();await pill('jar full');
 await page.evaluate(()=>window.__fi2.teleport(604.5,128.8,Math.PI));await wait(1200);const rel=page.locator('[data-job-slot="juggle"]');await tap(rel);await wait(500);
 rep.releasing=await page.evaluate(()=>!!window.__fi2Jobs.getView().releasing);note('release tapped');
 await page.waitForFunction(()=>document.querySelector('#job-done-title'),null,{timeout:20000}).then(()=>note('payday card')).catch(()=>note('no payday card'));
 rep.errors=errors.slice(0,5);await ctx.close();
}catch(e){rep.error=String(e.stack||e).slice(0,600);}finally{await browser.close();rep.log=log;console.log(JSON.stringify(rep,null,1));if(rep.pillFail||rep.error||(rep.errors&&rep.errors.length)||rep.caught<5)process.exitCode=1;}})();
