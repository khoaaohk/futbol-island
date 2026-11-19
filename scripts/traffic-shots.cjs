// Screenshots of the street traffic (Nov 18 2026): a signalled junction with vehicles waiting on red, and the vehicle types side
// by side. Needs a dev server (see scripts/traffic-budget.cjs).
//   FUTBOL_BASE_URL=http://localhost:9025 TS_OUT=<dir> [TS_TIME=day|night] [TS_VIEW=390x844|1280x800] [TS_LINEUP=1] node scripts/traffic-shots.cjs
// It waits (up to TS_WAIT s, default 150) for a vehicle to be held at a red light with company near, holds the traffic still (the
// lights and everything else keep running), stands the player on that junction's corner pavement, and saves the game's own frame
// plus a closer frame from a camera of its own (same renderer, same scene, same lighting). TS_LINEUP=1 also parks every vehicle
// in a row and photographs them from the front and the back.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
const BASE=process.env.FUTBOL_BASE_URL||'http://localhost:9025',TIME=process.env.TS_TIME||'day',OUT=process.env.TS_OUT||'traffic-shots',WAIT=Number(process.env.TS_WAIT||150);
const [VW,VH]=(process.env.TS_VIEW||'390x844').split('x').map(Number),phone=VW<700,tag=`${TIME}-${phone?'phone':'desktop'}`;
(async()=>{
 fs.mkdirSync(OUT,{recursive:true});
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await browser.newContext({viewport:{width:VW,height:VH},isMobile:phone,hasTouch:phone,deviceScaleFactor:1});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message.slice(0,300)));page.on('console',m=>{if(m.type()==='error'&&/shader|program|WebGL/i.test(m.text()))errors.push(m.text().slice(0,300));});
 await page.addInitScript(time=>{localStorage.setItem('fi-staff','1');sessionStorage.setItem('fi2-in-game','1');localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-save-deleted-v1','device-specs');localStorage.setItem('fi2-time-of-day',time);
  sessionStorage.setItem('fi2-arcade-departure-v1',JSON.stringify({version:1,x:-9,z:-20,yaw:0,ride:'walk',flightHeight:0}));},TIME);
 await page.goto(BASE+'/play?from=arcade',{timeout:300000});
 await page.waitForFunction(()=>window.__fi2&&window.__fi2.renderer&&window.__fi2.streetTraffic&&!document.querySelector('[data-island-return-loading]'),null,{timeout:300000});
 await page.waitForTimeout(4000);
 // A frame from our own camera: render, read the canvas back in the same task.
 const snap=async(file,eye,target,fov=38)=>{const url=await page.evaluate(({eye,target,fov})=>{const f=window.__fi2,r=f.renderer,c=f.camera.clone();c.fov=fov;c.near=.5;c.far=600;c.aspect=r.domElement.width/r.domElement.height;c.updateProjectionMatrix();
   c.position.set(eye[0],eye[1],eye[2]);c.lookAt(target[0],target[1],target[2]);c.updateMatrixWorld(true);r.render(f.scene,c);return r.domElement.toDataURL('image/png');},{eye,target,fov});
  fs.writeFileSync(path.join(OUT,file),Buffer.from(url.split(',')[1],'base64'));};
 const keepAwake=async ms=>{const t0=Date.now();while(Date.now()-t0<ms){await page.mouse.move(300+Math.random()*20,300+Math.random()*20);await page.waitForTimeout(250);}};
 // 1. Wait for a queue at a red light.
 let found=null;const t0=Date.now();
 while(Date.now()-t0<WAIT*1000&&!found){await keepAwake(500);
  found=await page.evaluate(min=>{const t=window.__fi2.streetTraffic,s=t.signals;for(const c of t.cars){if(!(c.held&&c.v<.05&&c.signalNode>=0)||(min>1&&c.axis!=='z'))continue;/* a north-south street first: the game camera looks along it */const n=t.nodes[c.signalNode],near=t.cars.filter(o=>Math.hypot(o.group.position.x-n.x,o.group.position.z-n.z)<26);
    if(near.length>=min){const up=t.update;t.update=function(dt,p,i){return up.call(this,0,p,i);};return {x:n.x,z:n.z,cx:c.group.position.x,cz:c.group.position.z,dx:c.dirX,dz:c.dirZ,cars:near.length,held:near.filter(o=>o.held).length,clock:s.clock};}}return null;},Date.now()-t0>WAIT*600?1:2);}
 if(!found){console.log('no vehicle held at a red light within',WAIT,'s');await browser.close();process.exit(1);}
 console.log('junction',JSON.stringify(found));
 // The player stands on the pavement beside the waiting vehicle (3.4 m to its right, a little ahead), looking up the street.
 await page.evaluate(f=>window.__fi2.teleport(f.cx-f.dz*3.4+f.dx*4,f.cz+f.dx*3.4+f.dz*4,Math.atan2(f.dx,f.dz)),found);await keepAwake(7000);
 await page.screenshot({path:path.join(OUT,`junction-red-${tag}.png`)});
 await snap(`junction-red-${tag}-close.png`,[found.cx-found.dx*9+found.dz*5,6.5,found.cz-found.dz*9-found.dx*5],[found.cx+found.dx*9,2.2,found.cz+found.dz*9],phone?62:40);
 // 2. The vehicle types, parked in a row on the junction (traffic is already held still).
 if(process.env.TS_LINEUP==='1'){
  await page.evaluate(({x,z})=>{const t=window.__fi2.streetTraffic,order=[0,1,2,3,4,6,7,8];order.forEach((k,i)=>{const g=t.cars[k].group;g.visible=true;g.position.set(x-10.5+i*3,0,z+(i%2?.5:-.5));g.rotation.set(0,.35,0);});
   t.cars.forEach((c,k)=>{if(!order.includes(k))c.group.position.set(x,0,z+60);});},found);
  await keepAwake(600);await snap(`vehicles-${TIME}-front.png`,[found.x,6.5,found.z+18],[found.x,.8,found.z],phone?80:52);await snap(`vehicles-${TIME}-back.png`,[found.x,6.5,found.z-18],[found.x,.8,found.z],phone?80:52);
 }
 await browser.close();
 if(errors.length){console.log('page errors:');for(const e of errors.slice(0,6))console.log('  '+e);}
 console.log('saved to',OUT);
})().catch(e=>{console.error(e);process.exit(1);});
