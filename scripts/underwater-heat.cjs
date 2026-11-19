// Underwater (Explore reef room) heat numbers and screenshots at fixed camera spots (Nov 18 2026 visual pass).
// Needs a running server:  FUTBOL_BASE_URL=http://localhost:9022 node scripts/underwater-heat.cjs [tag] [shotsDir]
//   tag       prefix of the screenshot files (default "after"; shots are <tag>-<spot>-<phone|desktop>.png)
//   shotsDir  where they go (default: no screenshots)
// Env: UW_BREAKDOWN=1 also prints each draw's triangles. UW_ZONE (default captains-cup), UW_PROFILES (comma list of phone-t0,phone-t2,desktop-t0; default all three).
// Profiles: phone-t0 = 390x844 touch, heat tier 0; phone-t2 = the same with heat tier 2 forced before the dive (the room's `lite`
// build); desktop-t0 = 1280x800. The reef room has no shadow pass, no post-processing and no render target, so
// renderer.info.render.calls after the room's render IS the whole frame (counted by wrapping renderer.render and keeping the
// calls / triangles of the renders whose scene is named "dive-room"; the max and the median over the sample window are printed).
// calls / tris include the diver's own rig, whose look (hair, hat, bag) is random per fresh save: compare the ROOM columns (every
// visible mesh named dive-*: draws, triangles x instances, points), which are deterministic.
// Frame time: median requestAnimationFrame interval (capped by the game's own frame pacing), the mean CPU time inside
// renderer.render (submit), and the median of render + a 1-pixel gl.readPixels, which waits for the frame (finish ms: with software rendering this is the fragment and
// vertex work of the frame, the nearest thing to a GPU cost here) over 4 s. Headless SwiftShader
// is software rendering: compare before / after on the same machine only; it is not a phone.
// Spots (room-local metres; the diver is placed, the follow camera settles for 3 s): see SPOTS below.
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const BASE=process.env.FUTBOL_BASE_URL||'http://localhost:9022',TAG=process.argv[2]||'after',OUT=process.argv[3]||'';
const ZONE=process.env.UW_ZONE||'captains-cup',PROFILES=(process.env.UW_PROFILES||'phone-t0,phone-t2,desktop-t0').split(',');
if(OUT)fs.mkdirSync(OUT,{recursive:true});
/** Each spot: where the diver floats and what it faces. `wreck` = 10 m off the wreck's side, facing it; `reef` = over the biggest
 *  coral head's edge, facing its middle; `seabed` = low over the sand in the room's south, facing the open reef. */
const SPOTS=(process.env.UW_SPOTS||'reef,wreck,seabed').split(',');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const rows=[];
 try{for(const prof of PROFILES){const phone=prof.startsWith('phone'),tier=+prof.split('-t')[1]||0;
  const ctx=await browser.newContext(phone?{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1}:{viewport:{width:1280,height:800},deviceScaleFactor:1});
  const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const zone=await (async()=>{
   // straight into the island (the arcade-return path skips the start screen), like scripts/check-dive-browser.cjs
   await page.addInitScript(()=>{sessionStorage.setItem('fi2-in-game','1');localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-save-deleted-v1','device-specs');
    sessionStorage.setItem('fi2-arcade-departure-v1',JSON.stringify({version:1,x:80,z:-40,yaw:0,ride:'walk',flightHeight:0}));});
   await page.goto(BASE+'/play?from=arcade',{timeout:300000,waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.__fi2&&window.__fi2.dive&&window.__fi2.teleport&&!document.querySelector('[data-island-return-loading]'),null,{timeout:300000});await page.waitForTimeout(4000);
   for(let i=0;i<6;i++){if(!await page.locator('dialog[open]').count())break;await page.keyboard.press('Escape');await page.waitForTimeout(400);}
   return page.evaluate(id=>{const d=window.__fi2.dive;window.__fi2.dive.slots(0,0);const s=(d.session.spots||[]).find(q=>q.id===id);return s?{x:s.x,z:s.z}:null;},ZONE).catch(()=>null);})();
  // The zone's island position: read from the session when it lists its spots, else from the known table below.
  const AT={'captains-cup':{x:309,z:-291},'pauls-grotto':{x:512,z:-296},'kelp-trawler':{x:812,z:-255},'ray-meadow':{x:761,z:-62},'moon-arch':{x:835,z:-14},'ball-crate':{x:349,z:222},'turtle-pool':{x:842,z:204}};
  const at=zone||AT[ZONE];
  if(tier)await page.evaluate(t=>window.__fi2.heat.force(t),tier);
  await page.evaluate(({x,z})=>window.__fi2.teleport(x,z,0),at);
  await page.waitForFunction(id=>window.__fi2.dive.session.state.near&&window.__fi2.dive.session.state.near.id===id,ZONE,{timeout:60000});
  await page.waitForFunction(()=>window.__fi2.dive.start()||window.__fi2.dive.diving,null,{timeout:60000,polling:500});
  await page.waitForFunction(()=>window.__fi2.dive.diving&&window.__fi2.dive.room,null,{timeout:20000});
  // Count the room's own renders.
  await page.evaluate(()=>{const r=window.__fi2.renderer,orig=r.render.bind(r),log=window.__uw={calls:[],tris:[],ms:[],gpu:[],raf:[],on:false,px:new Uint8Array(4)};
   const gl=r.getContext();r.render=(scene,cam)=>{const t0=performance.now();orig(scene,cam);if(log.on&&scene.name==='dive-room'){const t1=performance.now();gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,log.px);log.gpu.push(performance.now()-t0);log.ms.push(t1-t0);log.calls.push(r.info.render.calls);log.tris.push(r.info.render.triangles);}};
   let last=0;const tick=t=>{if(log.on&&last)log.raf.push(t-last);last=t;requestAnimationFrame(tick);};requestAnimationFrame(tick);});
  if(process.env.UW_BREAKDOWN){// what each draw in the room submits (triangles x instances), biggest first
   console.log(prof,'breakdown',JSON.stringify(await page.evaluate(()=>{const out=[];window.__fi2.dive.room.scene.traverse(o=>{if(!(o.isMesh||o.isPoints)||!o.visible)return;const g=o.geometry,n=(g.index?g.index.count:g.getAttribute('position').count)/(o.isPoints?1:3),k=o.isInstancedMesh?o.count:(g.instanceCount&&isFinite(g.instanceCount)?g.instanceCount:1);out.push([o.name||o.parent?.name||'?',Math.round(n*k)]);});
    const m=new Map();for(const [k,v] of out)m.set(k,(m.get(k)||0)+v);return {draws:out.length,by:[...m].sort((a,b)=>b[1]-a[1])};})));}
  for(const spot of SPOTS){
   const placed=await page.evaluate(spot=>{const d=window.__fi2.dive,st=d.session.state,room=d.room,wk=st.spot.theme.wreck;
    const floorY=(x,z)=>{const ray=new (room.camera.position.constructor)(0,-1,0),reef=room.scene.getObjectByName('dive-reef');void ray;void reef;return null;};void floorY;
    let x=0,z=8,yaw=Math.PI,y=null;
    if(spot==='wreck'&&wk){const c=Math.cos(wk.yaw),s=Math.sin(wk.yaw);x=wk.x+c*10;z=wk.z-s*10;yaw=Math.atan2(wk.x-x,wk.z-z);}
    else if(spot==='reef'){x=6;z=10;yaw=Math.atan2(-x,-z-4);}
    else if(spot==='seabed'){x=-10;z=14;yaw=Math.atan2(4-x,-2-z);}
    st.x=x;st.z=z;st.yaw=yaw;st.vx=st.vy=st.vz=0;if('breath' in st)st.breath=1;
    return {x,z,yaw:+yaw.toFixed(3),y:+st.y.toFixed(2)};},spot);
   // Hold the depth: low over the sand at `seabed`, mid-water elsewhere (keys: Z sinks). The session clamps to the floor and surface.
   if(spot==='seabed'){await page.keyboard.down('z');await page.waitForTimeout(1800);await page.keyboard.up('z');}
   await page.evaluate(({x,z,yaw})=>{const st=window.__fi2.dive.session.state;st.x=x;st.z=z;st.yaw=yaw;st.vx=st.vz=0;if('breath' in st)st.breath=1;},placed);
   await page.waitForTimeout(3000);
   await page.evaluate(()=>{const l=window.__uw;l.calls.length=l.tris.length=l.ms.length=l.gpu.length=l.raf.length=0;l.on=true;});
   await page.waitForTimeout(4000);
   const m=await page.evaluate(()=>{const l=window.__uw;l.on=false;const med=a=>{const b=[...a].sort((p,q)=>p-q);return b.length?b[b.length>>1]:0;},mean=a=>a.length?a.reduce((p,q)=>p+q,0)/a.length:0;
    const r=window.__fi2.renderer,st=window.__fi2.dive.session.state;
    return {frames:l.calls.length,callsMax:Math.max(0,...l.calls),callsMed:med(l.calls),trisMax:Math.max(0,...l.tris),trisMed:med(l.tris),rafMed:+med(l.raf).toFixed(1),renderMs:+mean(l.ms).toFixed(2),gpuMed:+med(l.gpu).toFixed(1),
     ...(()=>{let roomDraws=0,roomTris=0,points=0;window.__fi2.dive.room.scene.traverse(o=>{if(!(o.isMesh||o.isPoints)||!o.visible||!o.name.startsWith('dive-'))return;roomDraws++;const g=o.geometry,n=g.index?g.index.count:g.getAttribute('position').count,k=o.isInstancedMesh?o.count:(g.instanceCount&&isFinite(g.instanceCount)?g.instanceCount:1);if(o.isPoints)points+=n;else roomTris+=Math.round(n/3*k);});return {roomDraws,roomTris,points};})(),
     geometries:r.info.memory.geometries,textures:r.info.memory.textures,programs:r.info.programs?r.info.programs.length:0,pixelRatio:+r.getPixelRatio().toFixed(2),diving:window.__fi2.dive.diving,at:[+st.x.toFixed(1),+st.y.toFixed(1),+st.z.toFixed(1)]};});
   rows.push({profile:prof,spot,...m});console.log(JSON.stringify({profile:prof,spot,...m}));
   if(OUT&&tier===0){const f=path.join(OUT,`${TAG}-${spot}-${phone?'phone':'desktop'}.png`);await page.screenshot({path:f});console.log('shot',f);}
  }
  if(errors.length)console.log('PAGE ERRORS',prof,errors.slice(0,5).join(' || '));
  await ctx.close();}
 }finally{await browser.close();}
 console.log('\nprofile      spot    calls  tris     | room: draws tris   points | raf ms  submit ms  finish ms');
 for(const r of rows)console.log(`${r.profile.padEnd(12)} ${r.spot.padEnd(7)} ${String(r.callsMax).padStart(3)}    ${String(r.trisMax).padStart(6)}   |       ${String(r.roomDraws).padStart(3)}   ${String(r.roomTris).padStart(6)} ${String(r.points).padStart(5)}  | ${String(r.rafMed).padStart(6)}  ${String(r.renderMs).padStart(8)}  ${String(r.gpuMed).padStart(8)}`);
})().catch(e=>{console.error(e);process.exit(1);});
