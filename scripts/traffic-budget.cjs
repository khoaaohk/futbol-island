// Street-traffic heat probe (Nov 18 2026): the before/after gate for traffic work that claims "no extra heat". A sibling of
// scripts/gfx-budget.cjs (same page setup, same caveats: headless SwiftShader, counts exact, milliseconds are this Mac's CPU only).
//
//   NEXT_DIST_DIR=.next-traffic npx next dev -p 9025      (then)      FUTBOL_BASE_URL=http://localhost:9025 node scripts/traffic-budget.cjs
// Options (env): TB_TIME=day|night (default day), TB_TIERS=0,1,2,3,4, TB_FRAMES (default 40), TB_SETTLE ms (default 5000),
//   TB_SHOTS=<dir>, TB_JSON=<file>, TB_VIEW=<w>x<h> (default 390x844 touch phone).
//
// One page load per time of day. For every heat tier it stands at two traffic viewpoints (the town crossroads, the Coral Cay
// roundabout arm) and records, per island frame: draw calls and triangles (three's counters, shadow pass included), JS time in
// renderer.render, and JS time in streetTraffic.update. It also walks the traffic objects themselves (every vehicle, wherever it
// is, plus the signal lamps): meshes that would draw, their triangles, and their shadow casters. Those "traffic" columns do not
// depend on which cars happen to be in view, so they are exact; the whole-frame columns wobble with townsfolk and cars in view
// (the last two columns count the vehicles on screen per frame and give the draws of the frames that had none).
// The visitor's own look is pinned to the default save (it used to be rolled from the seeded Math.random, which dealt a different
// hairstyle to builds that create a different number of objects); the last column shows the rig is the same in both builds.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),ts=require('typescript'),vm=require('vm');
const BASE=process.env.FUTBOL_BASE_URL||'http://localhost:9025',TIME=process.env.TB_TIME||'day',TIERS=(process.env.TB_TIERS||'0,1,2,3,4').split(',').map(Number);
const FRAMES=Number(process.env.TB_FRAMES||40),SETTLE=Number(process.env.TB_SETTLE||5000),SHOTS=process.env.TB_SHOTS||'';
const [VW,VH]=(process.env.TB_VIEW||'390x844').split('x').map(Number);
const load=f=>{const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{exports:m.exports,module:m,Math});return m.exports;};
const R=load('lib/town/coralCay.ts').ROUNDABOUT;
const VIEWS=(process.env.TB_VIEWS?JSON.parse(process.env.TB_VIEWS):[
 {id:'crossroads',note:'town crossroads (-16,-37.5), from its south-east corner pavement',x:-10.8,z:-27,yaw:-2.6},
 {id:'roundabout',note:'Coral Cay roundabout, from the kerb south-east of the ring',x:R.x+.515*(R.roadOuter+3),z:R.z+.857*(R.roadOuter+3),yaw:-2.6},
]);
const median=a=>{const s=[...a].sort((x,y)=>x-y);return s.length?s[s.length>>1]:0;},mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const phone=VW<700,ctx=await browser.newContext({viewport:{width:VW,height:VH},isMobile:phone,hasTouch:phone,deviceScaleFactor:1});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push('pageerror: '+e.message.slice(0,300)));
 await page.addInitScript(({x,z,time})=>{
  localStorage.setItem('fi-staff','1');sessionStorage.setItem('fi2-in-game','1');localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-save-deleted-v1','device-specs');
  localStorage.setItem('fi2-time-of-day',time);
  // The visitor's look is pinned (Nov 18 2026): with no save the page rolls a random starter look from Math.random, and a build
  // that creates fewer objects shifts the seeded stream, so before and after wore different hair (one mesh, +1 draw).
  localStorage.setItem('futbol-island-customization-v1',JSON.stringify({costume:'none',character:'male',face:'warm',body:'balanced',clothing:'classic',ball:'classic',scooter:'classic',bike:'classic',moped:'classic',jetpack:'classic'}));
  sessionStorage.setItem('fi2-arcade-departure-v1',JSON.stringify({version:1,x,z,yaw:0,ride:'walk',flightHeight:0}));
  // Seeded Math.random, with three.js's UUIDs on a stream of their own while the page loads. three draws every object's UUID from
  // Math.random, so a build that creates a different number of objects used to shift the stream for everything rolled after it
  // (townsfolk looks: one hairstyle is one more draw at tier 0, where every townsperson is drawn). `__tbLoading` is cleared once the
  // island is up, so no stack is read while frames are measured.
  const stream=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
  const main=stream(20261118),ids=stream(977);window.__tbLoading=true;
  Math.random=()=>window.__tbLoading&&/generateUUID/.test(new Error().stack||'')?ids():main();
 },{x:VIEWS[0].x,z:VIEWS[0].z,time:TIME});
 await page.goto(BASE+'/play?from=arcade',{timeout:300000});
 await page.waitForFunction(()=>window.__fi2&&window.__fi2.renderer&&window.__fi2.heat&&window.__fi2.streetTraffic&&!document.querySelector('[data-island-return-loading]'),null,{timeout:300000});
 await page.evaluate(()=>{window.__tbLoading=false;
  const f=window.__fi2,r=f.renderer,orig=r.render.bind(r),log=window.__tb={on:false,rows:[],update:[]};
  r.render=(scene,camera)=>{const t0=performance.now();orig(scene,camera);const ms=performance.now()-t0;
   if(log.on&&scene===f.scene&&r.getRenderTarget()===null){
    // How many vehicles are on screen in this frame (centre inside the view, drawn): the two builds' cars are in different places
    // at the same moment, and one car in view is 1 draw after and 4 before, so whole-frame rows are only comparable like for like.
    const M=(log.m??=camera.projectionMatrix.clone()).multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).elements;let inView=0;
    for(const c of f.streetTraffic.cars){if(!c.group.visible)continue;const p=c.group.position,w=M[3]*p.x+M[7]+M[11]*p.z+M[15];if(w>0&&Math.abs((M[0]*p.x+M[4]+M[8]*p.z+M[12])/w)<1.08&&Math.abs((M[1]*p.x+M[5]+M[9]*p.z+M[13])/w)<1.08)inView++;}
    log.rows.push([r.info.render.calls,r.info.render.triangles,ms,inView]);}};
  const t=f.streetTraffic,up=t.update;t.update=function(){const t0=performance.now();const v=up.apply(this,arguments);if(log.on)log.update.push(performance.now()-t0);return v;};
 });
 await page.waitForTimeout(3000);
 const out=[];
 for(const tier of TIERS){
  await page.evaluate(t=>window.__fi2.heat.force(t),tier);
  for(const v of VIEWS){
   await page.evaluate(({x,z,yaw})=>window.__fi2.teleport(x,z,yaw),v);
   await page.waitForTimeout(SETTLE);
   await page.evaluate(()=>{window.__tb.rows.length=0;window.__tb.update.length=0;window.__tb.on=true;});
   const t0=Date.now();
   while(Date.now()-t0<40000){await page.mouse.move(300+Math.random()*20,300+Math.random()*20);await page.waitForTimeout(250);if(await page.evaluate(n=>window.__tb.rows.length>=n,FRAMES))break;}
   const r=await page.evaluate(()=>{const f=window.__fi2,g=window.__tb;g.on=false;
    const shown=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
    const tris=m=>{const geo=m.geometry;if(!geo||!geo.attributes.position)return 0;const n=(geo.index?geo.index.count:geo.attributes.position.count)/3;return n*(m.isInstancedMesh?m.count:1);};
    const acc={draws:0,triangles:0,casters:0,materials:new Set(),all:0};
    const roots=[f.streetTraffic.root,f.scene.getObjectByName('traffic-signal-lamps')].filter(Boolean);
    for(const root of roots)root.traverse(o=>{if(!(o.isMesh||o.isSprite))return;acc.all++;if(!shown(o))return;acc.draws++;acc.triangles+=o.isSprite?2:tris(o);if(o.castShadow)acc.casters++;acc.materials.add(o.material.uuid);});
    let sceneCasters=0;f.scene.traverse(o=>{if(o.isMesh&&o.castShadow&&shown(o))sceneCasters++;});
    // The visitor's own look is random per page load (hair, kit): its meshes and triangles are listed so that difference can be told apart.
    const me={draws:0,triangles:0};if(f.player&&f.player.root)f.player.root.traverse(o=>{if(o.isMesh&&shown(o)){me.draws++;me.triangles+=tris(o);}});
    return {rows:g.rows.slice(),update:g.update.slice(),traffic:{draws:acc.draws,triangles:acc.triangles,casters:acc.casters,materials:acc.materials.size,objects:acc.all},sceneCasters,me,
     tier:f.heat.tier??null,near:f.streetTraffic.cars.filter(c=>Math.hypot(c.group.position.x-f.location.x,c.group.position.z-f.location.z)<60).length,at:{x:+f.location.x.toFixed(1),z:+f.location.z.toFixed(1)}};});
   const calls=r.rows.map(x=>x[0]),tri=r.rows.map(x=>x[1]),ms=r.rows.map(x=>x[2]),empty=r.rows.filter(x=>x[3]===0);
   out.push({tier,view:v.id,frames:r.rows.length,calls:median(calls),callsMin:Math.min(...calls),callsMax:Math.max(...calls),triangles:median(tri),renderMs:+median(ms).toFixed(2),
    inView:median(r.rows.map(x=>x[3])),emptyFrames:empty.length,emptyCalls:median(empty.map(x=>x[0])),emptyTriangles:median(empty.map(x=>x[1])),updateMs:+mean(r.update).toFixed(4),updateMedianMs:+median(r.update).toFixed(4),traffic:r.traffic,sceneCasters:r.sceneCasters,me:r.me,near:r.near,at:r.at});
   if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await page.screenshot({path:path.join(SHOTS,`traffic-${TIME}-t${tier}-${v.id}-${VW}.png`)});}
  }
 }
 await browser.close();
 console.log(`traffic-budget  ${BASE}  ${VW}x${VH} DPR 1  ${TIME}  SwiftShader (counts exact; ms = CPU on this machine, NOT GPU cost or heat)`);
 console.log('| tier | view | frame draws (min-max) | frame triangles | render ms | traffic update ms (mean) | traffic draws | traffic triangles | traffic shadow casters | traffic materials | scene shadow casters | cars within 60 m | visitor rig meshes / triangles | vehicles on screen (median) | frames with none on screen: draws / triangles (frames) |');
 console.log('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
 for(const o of out)console.log(`| ${o.tier} | ${o.view} | ${o.calls} (${o.callsMin}-${o.callsMax}) | ${o.triangles} | ${o.renderMs} | ${o.updateMs} | ${o.traffic.draws} | ${o.traffic.triangles} | ${o.traffic.casters} | ${o.traffic.materials} | ${o.sceneCasters} | ${o.near} | ${o.me.draws} / ${o.me.triangles} | ${o.inView} | ${o.emptyFrames?o.emptyCalls+' / '+o.emptyTriangles+' ('+o.emptyFrames+')':'-'} |`);
 if(process.env.TB_JSON)fs.writeFileSync(process.env.TB_JSON,JSON.stringify({base:BASE,time:TIME,views:out},null,1));
 if(errors.length){console.log('page errors:');for(const e of errors.slice(0,5))console.log('  '+e);}
 if(out.some(o=>o.frames<FRAMES/2)){console.log('FAIL: too few frames at a viewpoint');process.exit(1);}
})().catch(e=>{console.error(e);process.exit(1);});
