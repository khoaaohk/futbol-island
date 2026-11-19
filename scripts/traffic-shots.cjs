// Screenshots of the street traffic (Nov 18 2026): a signalled junction with vehicles waiting on red, and the vehicle types side
// by side. Needs a dev server (see scripts/traffic-budget.cjs).
//   FUTBOL_BASE_URL=http://localhost:9025 TS_OUT=<dir> [TS_TIME=day|night] [TS_VIEW=390x844|1280x800] [TS_LINEUP=1] node scripts/traffic-shots.cjs
// It runs the traffic forward (up to TS_WAIT simulated seconds, default 900; a few seconds of real time) until a real QUEUE stands
// at a red light: two or more vehicles stopped one behind the other on the same street, with red still to run. It then holds the
// traffic still (the lights are a function of the traffic clock, so they hold too; everything else keeps running), stands the
// player on the pavement beside the queue, and saves a frame from a camera of its own behind the queue (queue-red-<time>-<phone|desktop>.png: same
// renderer, same scene, same lighting, the viewport's size) plus the game's own frame with the HUD (…-game.png). TS_LINEUP=1 also parks every vehicle
// in a row and photographs them from the front and the back.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
const BASE=process.env.FUTBOL_BASE_URL||'http://localhost:9025',TIME=process.env.TS_TIME||'day',OUT=process.env.TS_OUT||'traffic-shots',WAIT=Number(process.env.TS_WAIT||900);
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
 const snap=async(file,eye,target,fov=38)=>{const url=await page.evaluate(({eye,target,fov})=>{const f=window.__fi2,r=f.renderer,c=f.camera.clone(),ratio=r.getPixelRatio();r.setPixelRatio(1);/* one canvas pixel per CSS pixel: the file is the viewport's size */c.fov=fov;c.near=.5;c.far=600;c.aspect=r.domElement.width/r.domElement.height;c.updateProjectionMatrix();
   c.position.set(eye[0],eye[1],eye[2]);c.lookAt(target[0],target[1],target[2]);c.updateMatrixWorld(true);r.render(f.scene,c);const png=r.domElement.toDataURL('image/png');r.setPixelRatio(ratio);return png;},{eye,target,fov});
  fs.writeFileSync(path.join(OUT,file),Buffer.from(url.split(',')[1],'base64'));};
 const keepAwake=async ms=>{const t0=Date.now();while(Date.now()-t0<ms){await page.mouse.move(300+Math.random()*20,300+Math.random()*20);await page.waitForTimeout(250);}};
 // 1. Run the traffic forward to a queue at a red light, and hold it there.
 const found=await page.evaluate(({wait,phone})=>{const t=window.__fi2.streetTraffic,s=t.signals,f=window.__fi2,up=t.update,light=(time,off,axis)=>{let x=(time+off+(axis==='x'?11.5:0))%23;if(x<0)x+=23;return x<8?2:x<10?1:0;};
   const high={x:f.location.x,y:40,z:f.location.z},inter={vx:0,vz:0,reduced:false,onCrash(){}};let best=null;
   for(let tick=0;tick<wait*60&&!best;tick++){up.call(t,1/60,high,inter);if(tick%15)continue;
    for(const c of t.cars){if(!(c.held&&c.v<.05&&c.signalNode>=0)||(tick<wait*36&&!(c.dirZ>.9||!phone&&c.dirX<-.9)))continue;/* southbound (or, on a wide screen, westbound) first: the game camera looks from the south-east, so those lanes are on the far side of the street from the buildings that would hide them, and a north-south street runs up a portrait screen */
     const off=s.offset[c.signalNode];if(light(s.clock,off,c.axis)!==0||light(s.clock+4,off,c.axis)!==0)continue;
     const queue=t.cars.filter(o=>o.from===c.from&&o.to===c.to&&o.v<.05).sort((a,b)=>(a.length-a.distance)-(b.length-b.distance));if(queue.length<2||queue[0]!==c)continue;
     const last=queue[queue.length-1],n=t.nodes[c.signalNode];best={x:n.x,z:n.z,cx:c.group.position.x,cz:c.group.position.z,lx:last.group.position.x,lz:last.group.position.z,dx:c.dirX,dz:c.dirZ,queued:queue.length,gaps:queue.slice(1).map((o,k)=>+((o.length-o.distance)-(queue[k].length-queue[k].distance)-o.halfLength-queue[k].halfLength).toFixed(2)),axis:c.axis,clock:+s.clock.toFixed(1)};break;}}
   if(best)t.update=function(dt,p,i){return up.call(this,0,p,i);};return best;},{wait:WAIT,phone});
 if(!found){console.log('no queue at a red light within',WAIT,'simulated seconds');await browser.close();process.exit(1);}
 console.log('queue',JSON.stringify(found));
 // The player stands on the street's centre line beside the queue (the traffic is held, so nobody minds), 2 m (a north-south street) or 9 m (an east-west one) behind its first vehicle: the game's own
 // camera looks ahead of the player, which puts the queue and the lights it waits at in one frame with the open street, not a building, in front of it.
 await page.evaluate(f=>{const back=f.axis==='z'?2:9;window.__fi2.teleport(f.cx-f.dx*back+f.dz*2.4,f.cz-f.dz*back-f.dx*2.4,Math.atan2(f.dx,f.dz));},found);await keepAwake(7000);
 await page.screenshot({path:path.join(OUT,`queue-red-${tag}-game.png`)});
 // The queue and the lights it waits at, from behind its last vehicle on the open (centre-line) side: the camera is the script's own.
 {const f=found,side=phone?2.2:5,back=phone?8:13;await snap(`queue-red-${tag}.png`,[f.lx-f.dx*back+f.dz*side,phone?7:7.5,f.lz-f.dz*back-f.dx*side],[f.cx+f.dx*9,2.4,f.cz+f.dz*9],phone?58:40);}
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
