// Browser check for the island vending machines (docs/vending-machines.md): placement against the live world (roads,
// buildings, props), reachability on foot from Island Square, draw-call delta and the idle per-frame cost of the controller.
// usage: node scripts/check-vending-browser.cjs   (dev server on :8092; FUTBOL_BASE_URL to override)
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{try{localStorage.setItem('fi2-welcome-v1','1');}catch{}});
  await page.goto(process.env.FUTBOL_BASE_URL||'http://localhost:8092');await page.waitForFunction(()=>window.__fi2?.vending,null,{timeout:180000});await page.waitForTimeout(2000);
  const d=await page.evaluate(()=>{const f=window.__fi2;return {roads:f.world.roads,buildings:f.world.buildings,obstacles:f.world.obstacles,walls:f.world.walls,machines:f.vending.entries.map(e=>({...e.machine,front:e.front})),own:f.vending.obstacles};});
  const key=o=>`${o.x}:${o.z}:${o.w}:${o.d}`,own=new Set(d.own.map(key));
  const overlap=(a,b,m=0)=>Math.abs(a.x-b.x)<(a.w+b.w)/2+m&&Math.abs(a.z-b.z)<(a.d+b.d)/2+m;
  const issues=[];
  // Machines set with their back against a building wall (0.2 m gap, no z-fighting) keep a tighter clearance.
  const WALL_BACKED=new Set(['market']);
  for(const [i,m] of d.machines.entries()){
   const fp=d.own[i],stand={x:m.x+Math.sin(m.yaw)*2.2,z:m.z+Math.cos(m.yaw)*2.2,w:1.8,d:1.8};
   for(const r of d.roads){if(overlap(fp,r,.3))issues.push(`${m.id} on a road`);if(overlap(stand,r))issues.push(`${m.id} stand zone on a road`);}
   for(const o of [...d.obstacles,...d.walls]){if(own.has(key(o)))continue;const floor=o.floor??0;if(floor>m.y+1||(o.top!==undefined&&o.top<m.y+.2))continue;
    // A rooftop machine (High School roof) stands on its building: the building's untopped ground-level walk collider is below it.
    if(o.top===undefined&&m.y>1&&floor<m.y-1)continue;
    if(overlap(fp,o,WALL_BACKED.has(m.id)?.1:.3))issues.push(`${m.id} overlaps ${o.name??'prop'} at ${o.x},${o.z}`);if(overlap(stand,o))issues.push(`${m.id} stand zone blocked by ${o.name??'prop'} at ${o.x},${o.z}`);}
  }
  // Reachability on foot: flood fill on a 0.5 m grid from Island Square, ground-level blockers only.
  const minX=-102,minZ=-253,S=.5,W=Math.ceil(352/S),H=Math.ceil(479/S),blocked=new Uint8Array(W*H);
  const mark=(o,pad=.3)=>{const x0=Math.max(0,Math.floor((o.x-o.w/2-pad-minX)/S)),x1=Math.min(W-1,Math.ceil((o.x+o.w/2+pad-minX)/S)),z0=Math.max(0,Math.floor((o.z-o.d/2-pad-minZ)/S)),z1=Math.min(H-1,Math.ceil((o.z+o.d/2+pad-minZ)/S));for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++)blocked[z*W+x]=1;};
  for(const o of [...d.obstacles,...d.walls])if((o.floor??0)<1)mark(o);
  const cell=(x,z)=>Math.round((z-minZ)/S)*W+Math.round((x-minX)/S),seen=new Uint8Array(W*H),queue=[cell(95,-35)];seen[queue[0]]=1;
  for(let q=0;q<queue.length;q++){const c=queue[q],x=c%W,z=(c-x)/W;for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz;if(nx<0||nz<0||nx>=W||nz>=H)continue;const n=nz*W+nx;if(!seen[n]&&!blocked[n]){seen[n]=1;queue.push(n);}}}
  if(process.env.DEBUG)console.log('start',blocked[queue[0]],'reached',queue.length,'bad',[...d.obstacles,...d.walls].filter(o=>!Number.isFinite(o.x+o.z+o.w+o.d)).length);
  const reach={};for(const m of d.machines){if(m.y>0){reach[m.id]='rooftop (ramp)';continue;}const c=cell(m.x+Math.sin(m.yaw)*2.4,m.z+Math.cos(m.yaw)*2.4);reach[m.id]=!!seen[c];if(!seen[c])issues.push(`${m.id} front not reachable on foot`);}
  // Draw calls at the Island Square machine, with and without the machines, and the idle controller cost.
  const perf=await page.evaluate(()=>{const f=window.__fi2,T=f.camera.position.constructor;const x=89.5,z=-49;f.location.x=x+1;f.location.z=z+3;f.camera.position.set(x+18,23,z+30);f.camera.lookAt(x,1,z);f.camera.updateMatrixWorld();
   const root=f.scene.getObjectByName('vending-machines');const calls=()=>{f.renderer.render(f.scene,f.camera);return f.renderer.info.render.calls;};
   const on=[calls(),calls()][1];root.visible=false;const off=[calls(),calls()][1];root.visible=true;
   const prompt=document.createElement('button');const args={now:1e6,dt:1/30,reduced:false,hoverRay:null,canEnter:true,flying:false,flightHeight:0,location:{x:0,z:0},groundY:0,camera:f.camera,width:1280,height:800,hidePrompt:false,prompt,placeUI(){},setUIHidden(el,h){el.hidden=h;},onHoverStart(){}};
   for(let i=0;i<2000;i++)f.vending.update(args);const n=20000,t0=performance.now();for(let i=0;i<n;i++){args.now+=33;f.vending.update(args);}const idle=(performance.now()-t0)/n*1000;
   const cam=new T();const t1=performance.now();for(let i=0;i<n;i++)f.vending.applyCamera(f.camera,1/30,false);const camIdle=(performance.now()-t1)/n*1000;void cam;
   return {drawCallsWith:on,drawCallsWithout:off,delta:on-off,idleUpdateMicroseconds:+idle.toFixed(3),idleCameraMicroseconds:+camIdle.toFixed(3)};});
  const result={issues,reach,perf,errors};console.log(JSON.stringify(result,null,1));
  assert.equal(issues.length,0,issues.join('\n'));assert.equal(errors.length,0,errors.join('\n'));assert(perf.delta<=4,'at most a few extra draws in view');assert(perf.idleUpdateMicroseconds<20,'idle update is a handful of distance checks');
  console.log('PASS vending browser check');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
