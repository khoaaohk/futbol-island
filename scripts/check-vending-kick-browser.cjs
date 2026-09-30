// Browser check for kicking a vending machine (lib/graphics/vendingKick.ts): walking the ball up to the machine and pushing into
// it never triggers it; a shot does (shake + flicker + sky signal + tip bubble). Captures a frame strip from a CDP screencast and
// measures draw calls, frame time and update cost during the effect vs idle.
// usage: OUT=/path node scripts/check-vending-kick-browser.cjs [desktop|phone] [sunset|day|night]   (dev server on :8092)
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const view=process.argv[2]||'desktop',time=process.argv[3]||'sunset',OUT=process.env.OUT||'/tmp/vending-kick';fs.mkdirSync(OUT,{recursive:true});
const phone=view==='phone',machineId=process.env.MACHINE||'plaza',STAND=2.6;// metres in front of the cabinet centre (clear of the plaza bench)
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 try{
  const context=await browser.newContext(phone?{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:1280,height:800}});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(t=>{try{localStorage.setItem('fi2-welcome-v1','1');localStorage.setItem('fi2-time-of-day',t);}catch{}},time);
  await page.goto(process.env.FUTBOL_BASE_URL||'http://localhost:8092',{timeout:180000,waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__fi2?.vendingKick&&window.__fi2.vending,null,{timeout:180000});await page.waitForTimeout(3000);
  // Walk mode the normal way (R cycles rides; the island starts on the jetpack).
  for(let i=0;i<5&&await page.evaluate(()=>window.__fi2.rideRef.current)!=='walk';i++){await page.keyboard.press('r');await page.waitForTimeout(1200);}
  assert.equal(await page.evaluate(()=>window.__fi2.rideRef.current),'walk');
  const place=d=>page.evaluate(([id,d])=>{const f=window.__fi2,e=f.vending.entries.find(e=>e.machine.id===id),m=e.machine;f.location.x=m.x+Math.sin(m.yaw)*d;f.location.z=m.z+Math.cos(m.yaw)*d;f.velocity.x=f.velocity.z=0;f.walkBall.reset({x:f.location.x,z:f.location.z,y:m.y,yaw:m.yaw+Math.PI});return {x:m.x,z:m.z,yaw:m.yaw};},[machineId,d]);
  const m=await place(STAND);await page.waitForTimeout(1800);
  // Instrument: per-frame draw calls and the cost of vendingKick.update (the Town loop calls it through this object).
  await page.evaluate(()=>{const f=window.__fi2,k=f.vendingKick,orig=k.update.bind(k);window.__vk={frames:[],cost:[]};
   k.update=(...a)=>{const t0=performance.now();orig(...a);window.__vk.cost.push({t:performance.now()-t0,active:k.active});};
   const loop=now=>{window.__vk.frames.push({now,calls:f.renderer.info.render.calls,tris:f.renderer.info.render.triangles,active:k.active});requestAnimationFrame(loop);};requestAnimationFrame(loop);});
  // 1. Gentle walk-up: find the key that walks toward the machine, then dribble into its front for 3 s.
  let best=null;
  for(const key of [['w'],['a'],['s'],['d'],['w','a'],['w','d'],['s','a'],['s','d']]){await place(STAND);await page.waitForTimeout(250);const a=await page.evaluate(()=>({x:window.__fi2.location.x,z:window.__fi2.location.z}));for(const k of key)await page.keyboard.down(k);await page.waitForTimeout(250);for(const k of key)await page.keyboard.up(k);await page.waitForTimeout(150);const b=await page.evaluate(()=>({x:window.__fi2.location.x,z:window.__fi2.location.z}));
   const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz)||1,toward=-(dx*Math.sin(m.yaw)+dz*Math.cos(m.yaw))/len;if(!best||toward>best.toward)best={key,toward:+toward.toFixed(2)};}
  // Start 4 m out and dribble straight into the machine's face for 3 s (the walk-up-to-buy approach, then pushing against it).
  await place(STAND+1.5);await page.waitForTimeout(500);
  for(const k of best.key)await page.keyboard.down(k);await page.waitForTimeout(3000);await page.screenshot({path:path.join(OUT,`${view}-${time}-walkup.png`)});for(const k of best.key)await page.keyboard.up(k);await page.waitForTimeout(500);
  const walk=await page.evaluate(([id])=>{const f=window.__fi2,e=f.vending.entries.find(e=>e.machine.id===id),m=e.machine;return {kicks:f.vendingKick.kicks,active:f.vendingKick.active,metresFromCabinet:+Math.hypot(f.location.x-m.x,f.location.z-m.z).toFixed(2),goPrompt:f.vending.target};},[machineId]);
  assert.ok(best.toward>.2,'found a key that walks toward the machine');
  assert.equal(walk.kicks,0,'walking the ball up to the machine does not set it off');
  // 2. Idle baseline standing at the machine.
  await place(STAND);await page.waitForTimeout(1200);
  await page.evaluate(()=>{window.__vk.frames.length=0;window.__vk.cost.length=0;});await page.waitForTimeout(2500);
  const idle=await page.evaluate(()=>({frames:window.__vk.frames.slice(),cost:window.__vk.cost.slice()}));
  // Baseline: the identical shot into the machine with the reaction switched off (ball trail/ghost/spark effects only).
  await page.evaluate(()=>{const k=window.__fi2.vendingKick;window.__vkKick=k.kick;k.kick=()=>false;window.__vk.frames.length=0;window.__vk.cost.length=0;});
  await page.evaluate(([id])=>{const f=window.__fi2,m=f.vending.entries.find(e=>e.machine.id===id).machine,yaw=m.yaw+Math.PI;f.walkBall.shoot({x:f.location.x,z:f.location.z,y:m.y,yaw},yaw,.04);},[machineId]);
  await page.waitForTimeout(1800);const missed=await page.evaluate(()=>{const k=window.__fi2.vendingKick;k.kick=window.__vkKick;return {frames:window.__vk.frames.slice(),cost:window.__vk.cost.slice()};});
  await place(STAND);await page.waitForTimeout(1500);
  // 3. Shot, recorded with a CDP screencast (every frame, timestamps) instead of slow screenshots.
  const cdp=await context.newCDPSession(page),frames=[];
  cdp.on('Page.screencastFrame',f=>{frames.push({t:f.metadata.timestamp*1000,data:f.data});cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{});});
  await cdp.send('Page.startScreencast',{format:'jpeg',quality:85,everyNthFrame:1,maxWidth:phone?780:1280,maxHeight:phone?1688:800});
  await page.waitForTimeout(400);
  await page.evaluate(()=>{window.__vk.frames.length=0;window.__vk.cost.length=0;});
  const machinePx=await page.evaluate(([id])=>{const f=window.__fi2,m=f.vending.entries.find(e=>e.machine.id===id).machine,v=f.camera.position.clone().set(m.x,m.y+1.6,m.z).project(f.camera);return {x:(v.x+1)/2,y:(1-v.y)/2};},[machineId]);
  const kickAt=await page.evaluate(([id])=>{const f=window.__fi2,e=f.vending.entries.find(e=>e.machine.id===id),m=e.machine,yaw=m.yaw+Math.PI;f.walkBall.shoot({x:f.location.x,z:f.location.z,y:m.y,yaw},yaw,.04);
   return new Promise(res=>{const t=setInterval(()=>{if(f.vendingKick.kicks>0){clearInterval(t);const at=Date.now();const w=setInterval(()=>{if(!f.vendingKick.active){clearInterval(w);window.__vkIdleAt=Date.now()-at;}},5);res(at);}},5);});},[machineId]);
  await page.screenshot({path:path.join(OUT,`${view}-${time}-burst.png`)});
  await page.waitForFunction(()=>window.__vkIdleAt!==undefined,null,{timeout:6000});const idleAgainMs=await page.evaluate(()=>window.__vkIdleAt);
  await page.waitForTimeout(400);await cdp.send('Page.stopScreencast');
  const during=await page.evaluate(()=>({frames:window.__vk.frames.slice(),cost:window.__vk.cost.slice()}));
  // Frame strip: 9 frames from the kick to 2.3 s.
  const picks=[0,.12,.25,.45,.7,.95,1.25,1.7,2.3].map(s=>{const target=kickAt+s*1000;return frames.reduce((a,b)=>Math.abs(b.t-target)<Math.abs(a.t-target)?b:a);});
  const files=picks.map((f,i)=>{const file=path.join(OUT,`${view}-${time}-f${i}.jpg`);fs.writeFileSync(file,Buffer.from(f.data,'base64'));return file;});
  const W=phone?300:560,stripName=path.join(OUT,`${view}-${time}-strip.jpg`);
  execFileSync('ffmpeg',['-y','-loglevel','error',...files.flatMap(f=>['-i',f]),'-filter_complex',`${files.map((_,i)=>`[${i}:v]scale=${W}:-2[v${i}]`).join(';')};${[0,1,2].map(r=>`[v${r*3}][v${r*3+1}][v${r*3+2}]hstack=inputs=3[r${r}]`).join(';')};[r0][r1][r2]vstack=inputs=3`,stripName]);
  // Close-up crop strip of the machine for the first 0.9 s (shake + buzz + flicker), 2x.
  const close=[0,.06,.12,.18,.26,.34,.45,.6,.9].map(s=>{const target=kickAt+s*1000;return frames.reduce((a,b)=>Math.abs(b.t-target)<Math.abs(a.t-target)?b:a);});
  const closeFiles=close.map((f,i)=>{const file=path.join(OUT,`${view}-${time}-c${i}.jpg`);fs.writeFileSync(file,Buffer.from(f.data,'base64'));return file;});
  const size=phone?220:160,fw=phone?780:1280,fh=phone?1688:800,cx=Math.round(Math.min(fw-size,Math.max(0,machinePx.x*fw-size/2))),cy=Math.round(Math.min(fh-size,Math.max(0,machinePx.y*fh-size/2))),closeName=path.join(OUT,`${view}-${time}-shake-closeup.jpg`);
  execFileSync('ffmpeg',['-y','-loglevel','error',...closeFiles.flatMap(f=>['-i',f]),'-filter_complex',`${closeFiles.map((_,i)=>`[${i}:v]scale=${fw}:${fh},crop=${size}:${size}:${cx}:${cy},scale=320:320[c${i}]`).join(';')};${[0,1,2].map(r=>`[c${r*3}][c${r*3+1}][c${r*3+2}]hstack=inputs=3[r${r}]`).join(';')};[r0][r1][r2]vstack=inputs=3`,closeName]);
  // Same-frame draw-call delta with the signal on vs off, and the idle update cost (tight loop, µs per call).
  const cost=await page.evaluate(()=>{const f=window.__fi2,k=f.vendingKick;const calls=()=>{f.renderer.render(f.scene,f.camera);return f.renderer.info.render.calls;};
   const on=calls(),off=on;
   const n=200000,t0=performance.now();for(let i=0;i<n;i++)k.update(0,f.camera,false,1280,800);const idleMicros=(performance.now()-t0)/n*1000;
   return {signalDrawCalls:on-off,idleUpdateMicros:+idleMicros.toFixed(4)};});
  const stat=(fr,co)=>{const dts=fr.slice(1).map((f,i)=>f.now-fr[i].now).sort((a,b)=>a-b),calls=fr.map(f=>f.calls).sort((a,b)=>a-b),tris=fr.map(f=>f.tris).sort((a,b)=>a-b),c=co.map(x=>x.t);const med=a=>a.length?a[Math.floor(a.length/2)]:0,sum=c.reduce((a,b)=>a+b,0);
   return {frames:fr.length,frameMsMedian:+med(dts).toFixed(1),frameMsP95:+(dts[Math.floor(dts.length*.95)]??0).toFixed(1),drawCallsMedian:med(calls),drawCallsMax:calls.at(-1),trianglesMedian:med(tris),updates:co.length,updateMicrosMean:+(co.length?sum/co.length*1000:0).toFixed(1),activeUpdates:co.filter(x=>x.active).length};};
  const result={view,time,machine:machineId,walkKey:best.key,walk,idleAgainMs,screencastFrames:frames.length,...cost,
   idle:stat(idle.frames,idle.cost),missedShot:stat(missed.frames,missed.cost),during:stat(during.frames.filter(f=>f.active),during.cost.filter(c=>c.active)),after:stat(during.frames.filter(f=>!f.active),during.cost.filter(c=>!c.active)),strip:stripName,closeup:closeName,errors};
  console.log(JSON.stringify(result,null,1));
  assert.equal(result.idle.activeUpdates,0,'idle: no active kick work');assert.ok(idleAgainMs<3000,'idle again within ~2.5 s');assert.equal(errors.length,0,errors.join('\n'));
  fs.writeFileSync(path.join(OUT,`${view}-${time}.json`),JSON.stringify(result,null,1));
  console.log('PASS vending kick browser check',view,time);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
