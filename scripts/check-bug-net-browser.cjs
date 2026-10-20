// Bug squad net close-ups (bug-polish, Oct 20 2026; docs/island-jobs.md §15 "Bug polish"): starts a Bug squad shift and shoots
// the player holding the net, each shot split in two views of the same frame: SIDE (left half) and BACK (right half), from close
// cameras rendered over the game's own frame. States: idle, walking, sprinting, turning, Net down (sneaking), then scooter / bike /
// moped with the net on the backpack's side socket. Also measures the local bug density (bugs within 40 m at 8 spots).
// Screenshots to $BUG_SHOTS (default /tmp/bug-polish). Fails on console / page errors.
// usage: FUTBOL_BASE_URL=http://localhost:8211 node scripts/check-bug-net-browser.cjs [--mobile]
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/khoado/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const fs=require('node:fs');
const OUT=process.env.BUG_SHOTS||'/tmp/bug-polish',base=process.env.FUTBOL_BASE_URL||'http://localhost:8211';
const mobile=process.argv.includes('--mobile'),tag=mobile?'phone':'desktop';fs.mkdirSync(OUT,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const SIGN={x:606,z:133.5};
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--mute-audio','--use-angle=metal']});const report={tag};
 try{
  const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>{if(!/ChunkLoadError|Loading chunk|error while hydrating/.test(e.message))errors.push(e.message);});
  page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|favicon|net::ERR|404/.test(m.text()))errors.push(m.text());});
  await page.addInitScript(({SIGN})=>{if(sessionStorage.getItem('bug-test-seeded'))return;sessionStorage.setItem('bug-test-seeded','1');
   localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-time-of-day','day');
   for(const [k,v] of Object.entries({'fi2-audio-mix':'4-50-v1','fi2-sound-muted':'true','fi2-music-enabled':'false','fi2-voice-enabled':'false'}))localStorage.setItem(k,v);
   sessionStorage.setItem('fi2-arcade-departure-v1',JSON.stringify({version:1,x:SIGN.x,z:SIGN.z,yaw:Math.PI,ride:'walk',flightHeight:0}));},{SIGN});
  await page.goto(base+'/?from=konbini',{timeout:240000});await page.waitForFunction(()=>window.__fi2&&window.__fi2Jobs,null,{timeout:180000});
  await page.locator('[data-island-return-loading]').waitFor({state:'detached',timeout:90000}).catch(()=>{});await wait(1500);
  const tap=loc=>mobile?loc.tap():loc.click();
  const offer=page.locator('[data-job-offer="bug-scout"]');await offer.waitFor({timeout:20000});await tap(offer);
  const go=page.getByRole('button',{name:'Start job'});await go.waitFor({timeout:8000});await tap(go);await page.waitForFunction(()=>window.__fi2Jobs.run,null,{timeout:8000});await wait(1200);
  const tp=(x,z,yaw=0)=>page.evaluate(({x,z,yaw})=>window.__fi2.teleport(x,z,yaw),{x,z,yaw});
  // Local density: bugs within 40 m at 8 spots over the island (after 5 s at each).
  const spots=[[606,133],[640,140],[584,24],[700,150],[540,190],[740,115],[668,160],[575,150]];report.within40=[];
  for(const [x,z] of spots){await tp(x,z);await wait(5000);report.within40.push(await page.evaluate(()=>{const f=window.__fi2,l=f.location;return f.wildBugs.query(l.x,0,l.z,3000).filter(b=>Math.hypot(b.x-l.x,b.z-l.z)<=40).length;}));}
  report.spotFx=await page.evaluate(()=>window.__fi2.wildBugs.spotFx?.counts);
  await tp(640,140,Math.PI);await wait(1500);await page.screenshot({path:`${OUT}/${tag}-0-game-view.png`});
  // Close cameras: SIDE (the player's right) and BACK, both rendered over the game's frame each draw (scissored halves).
  await page.evaluate(()=>{const f=window.__fi2,r=f.renderer,T=f.camera.constructor,orig=r.render.bind(r);
   const side=f.camera.clone(),back=f.camera.clone();window.__closeCams={on:false};
   r.render=(s,c)=>{orig(s,c);if(!window.__closeCams.on||c!==f.camera)return;const p=f.player.root,y=p.rotation.y,fx=Math.sin(y),fz=Math.cos(y),px=p.position.x,py=p.position.y+1.1,pz=p.position.z;
    const W=r.domElement.width/r.getPixelRatio(),H=r.domElement.height/r.getPixelRatio();
    for(const [cam,ox,oz,x0] of [[side,-fz*3.6+fx*.4,fx*3.6+fz*.4,0],[back,-fx*3.8,-fz*3.8,W/2]]){cam.aspect=(W/2)/H;cam.fov=45;cam.near=.1;cam.updateProjectionMatrix();cam.position.set(px+ox,py+.5,pz+oz);cam.lookAt(px,py+.1,pz);cam.updateMatrixWorld();
     r.setScissorTest(true);r.setScissor(x0,0,W/2,H);r.setViewport(x0,0,W/2,H);r.autoClear=false;r.clearDepth();orig(s,cam);r.autoClear=true;}
    r.setScissorTest(false);r.setViewport(0,0,W,H);};});
  await page.evaluate(()=>{window.__closeCams.on=true;});await tp(640,140,Math.PI);await wait(800);
  const shot=name=>page.screenshot({path:`${OUT}/${tag}-${name}.png`});
  const hold=async(keys,ms,name)=>{for(const k of keys)await page.keyboard.down(k);await wait(ms);await shot(name);for(const k of [...keys].reverse())await page.keyboard.up(k);await wait(500);};
  await wait(800);await shot('1-idle');
  await hold(['w'],1100,'2-walking');await tp(640,140,Math.PI);
  await hold(['Shift','w'],1100,'3-sprinting');await tp(640,140,Math.PI);
  await hold(['w','a'],900,'4-turning');await tp(640,140,Math.PI);
  await page.keyboard.press('e');await wait(400);await hold(['w'],1000,'5-net-down');await page.keyboard.press('e');await wait(400);
  report.poses=await page.evaluate(()=>({job:!!window.__fi2Jobs.run,net:window.__fi2Jobs.root.getObjectByName('job-net')?.visible}));
  for(const ride of ['scooter','bike','moped']){await page.evaluate(m=>window.__fi2.selectRide(m),ride);await tp(640,140,Math.PI);await wait(900);await hold(['w'],900,'6-'+ride);}
  report.rideNet=await page.evaluate(()=>window.__fi2Jobs.root.getObjectByName('job-net')?.visible);
  await page.evaluate(()=>window.__fi2.selectRide('walk'));await wait(400);
  report.errors=errors.slice(0,5);await ctx.close();
 }catch(e){report.error=String(e&&e.stack||e).slice(0,600);}
 finally{await browser.close();console.log(JSON.stringify(report));}
})();
