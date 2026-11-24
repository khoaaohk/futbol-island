// Graphics budget probe (Nov 17 2026, docs/graphics/island-graphics-plan-nov17.md): the before/after gate for any island
// graphics change that claims "no extra heat".
//
// Needs a running server (FUTBOL_BASE_URL, default http://localhost:9023), e.g.
//   NEXT_DIST_DIR=.next-gfx npx next dev -p 9023        (then)        node scripts/gfx-budget.cjs
// Options (env): GFX_TIER=0..4 (forced heat tier, default 0), GFX_TIME=day|sunset|night (default day), GFX_FRAMES (default 40),
//   GFX_SETTLE=<ms> (wait after each teleport, default 4000; 14000 lets the follow camera come to rest),
//   GFX_SHOTS=<dir> (one PNG per viewpoint), GFX_JSON=<file> (the raw table), GFX_SEED=0 (leave Math.random alone).
//
// It opens /play as a 390x844 touch phone (DPR 1) flagged as a staff device (no analytics: lib/analytics/staff.ts), enters the island
// the way scripts/check-dive-browser.cjs does, forces one heat tier and one time of day, then teleports to four fixed viewpoints
// (town, beach shore, swimming in the sea, stadium). At each it wraps `renderer.render` and, for GFX_FRAMES island frames, reads
// three's own counters: draw calls and triangles per frame (shadow pass included), compiled programs, live textures and
// geometries, and the JS time spent inside `renderer.render` (CPU submit time). Medians are printed; min-max shows the noise
// (townsfolk and cars move, so draw calls wobble by a few).
//
// WHAT THIS IS NOT: headless Chrome draws with SwiftShader (software GL). Draw calls, triangles, programs, textures and geometries
// are exact and comparable. The "render ms" column is CPU-side submit work on this Mac, useful only as a same-machine before/after
// hint; it says nothing about GPU fill cost, overdraw or phone temperature. Per-fragment shader cost is covered by the static
// estimate in tests/water-tropical-cost.cjs; heat itself needs a real iPhone (AGENTS.md).
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),ts=require('typescript'),vm=require('vm');
const BASE=process.env.FUTBOL_BASE_URL||'http://localhost:9023',TIER=Number(process.env.GFX_TIER||0),TIME=process.env.GFX_TIME||'day';
const SETTLE=Number(process.env.GFX_SETTLE||4000),FRAMES=Number(process.env.GFX_FRAMES||40),SHOTS=process.env.GFX_SHOTS||'',SEED=process.env.GFX_SEED!=='0';
// The game's own pure TypeScript modules (no three.js), for real coordinates instead of copied literals.
const ROOT=path.join(__dirname,'..'),cache=new Map();
const load=file=>{file=path.resolve(ROOT,file);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const res=p=>fs.existsSync(p+'.ts')?p+'.ts':fs.existsSync(p+'.tsx')?p+'.tsx':p+'/index.ts';
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {Math,Map,Set,WeakMap,Float32Array,Float64Array,Uint8Array,Uint16Array,Int16Array,Int32Array,Uint32Array,JSON,Number,Object,Array,String,Symbol,Error,isFinite,console,exports:mod.exports,module:mod,
   require:id=>id.startsWith('@/')?load(res(path.resolve(ROOT,id.slice(2)))):id.startsWith('.')?load(res(path.resolve(path.dirname(file),id))):require(id)});
 cache.set(file,mod.exports);return mod.exports;};
const L=load('lib/town/landmass.ts'),SWIMMER=load('lib/town/npcSwim.ts').NPC_SWIMMERS.kiri,W=load('lib/town/westParkLayout.ts');
// Palm Coast Beach: the nearest dry land to the islander who swims there, one metre in from the waterline, facing the sea.
const shore=(()=>{for(let r=1;r<200;r++)for(let a=0;a<180;a++){const t=a/180*Math.PI*2,x=SWIMMER.x+Math.cos(t)*r,z=SWIMMER.z+Math.sin(t)*r;
  if(L.onLand(x,z)){const ux=(SWIMMER.x-x)/r,uz=(SWIMMER.z-z)/r;return {x:x-ux,z:z-uz,yaw:Math.atan2(ux,uz),ux,uz};}}throw new Error('no shore found');})();
const VIEWS=[
 {id:'town',note:'Island Square spawn',x:103,z:-20,yaw:0},
 {id:'shore',note:'Palm Coast Beach waterline, facing the sea',x:shore.x,z:shore.z,yaw:shore.yaw},
 {id:'swim',note:'swimming 22 m off that beach',x:shore.x+shore.ux*23,z:shore.z+shore.uz*23,yaw:shore.yaw,swim:true},
 {id:'stadium',note:'Stadium Plaza arrival, facing the gate',x:W.STADIUM_ARRIVAL.x,z:W.STADIUM_ARRIVAL.z,yaw:W.STADIUM_ARRIVAL.yaw},
];
// Island Line (Nov 23 2026): GFX_VIEWS=train swaps in the train's five check views; GFX_NO_TRAIN=1 builds the island without the
// line (world.ts's 'fi-no-train' A/B switch) for the before column.
if(process.env.GFX_VIEWS==='train')VIEWS.splice(0,VIEWS.length,
 {id:'shore',note:'Palm Coast Beach waterline, facing the sea',x:shore.x,z:shore.z,yaw:shore.yaw},
 {id:'west-beach',note:'West Beach station, from the stadium side',x:-282,z:-30,yaw:Math.atan2(-1,0)},
 {id:'south',note:'South station, from the Museum door',x:160,z:200,yaw:0},
 {id:'summit-portal',note:'Summit Isle platform, facing the west portal',x:506,z:204,yaw:Math.atan2(32.5,-34.5)},
 {id:'coral-cay',note:'Coral Cay station, from the plaza path',x:590,z:-94,yaw:0},
 // Phase 2 (Nov 23 2026): the worst case, all three trains pinned at the North station (window.__fi2.trains.cluster), looking down the line.
 {id:'trains-near',note:'North station platform, all 3 trains pinned in view',x:186,z:-203.5,yaw:-Math.PI/2,cluster:2534});
const NO_TRAIN=process.env.GFX_NO_TRAIN==='1';
const median=a=>{const s=[...a].sort((x,y)=>x-y);return s.length?s[s.length>>1]:0;};
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 // GFX_VIEWPORT=desktop (Nov 23 2026, Island Line): a 1440x900 desktop window instead of the phone.
 const DESKTOP=process.env.GFX_VIEWPORT==='desktop';
 const ctx=await browser.newContext(DESKTOP?{viewport:{width:1440,height:900},deviceScaleFactor:1}:{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push('pageerror: '+e.message.slice(0,300)));
 await page.addInitScript(({x,z,time,seed,noTrain})=>{
  localStorage.setItem('fi-staff','1');// staff device: the analytics tracker sends nothing
  sessionStorage.setItem('fi2-in-game','1');localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-save-deleted-v1','device-specs');
  localStorage.setItem('fi2-time-of-day',time);
  if(noTrain)localStorage.setItem('fi-no-train','1');else localStorage.removeItem('fi-no-train');
  sessionStorage.setItem('fi2-arcade-departure-v1',JSON.stringify({version:1,x,z,yaw:0,ride:'walk',flightHeight:0}));
  if(seed){let s=20261117;Math.random=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
 },{x:VIEWS[0].x,z:VIEWS[0].z,time:TIME,seed:SEED,noTrain:NO_TRAIN});
 await page.goto(BASE+'/play?from=arcade',{timeout:240000});
 await page.waitForFunction(()=>window.__fi2&&window.__fi2.renderer&&window.__fi2.heat&&window.__fi2.water&&!document.querySelector('[data-island-return-loading]'),null,{timeout:240000});
 // One wrapper for the whole run: every island-scene render records three's counters and its own JS time.
 await page.evaluate(tier=>{
  const f=window.__fi2,r=f.renderer,orig=r.render.bind(r),log=window.__gfx={on:false,rows:[]};
  f.heat.force(tier);
  r.render=(scene,camera)=>{const t0=performance.now();orig(scene,camera);const ms=performance.now()-t0;
   if(log.on&&scene===f.scene&&r.getRenderTarget()===null)log.rows.push([r.info.render.calls,r.info.render.triangles,ms]);};
 },TIER);
 await page.waitForTimeout(3000);
 const out=[];
 for(const v of VIEWS){
  await page.evaluate(c=>{const t=window.__fi2.trains;if(t)t.cluster=c==null?NaN:c;},v.cluster??null);// Island Line: the trains-near view pins all three
  await page.evaluate(({x,z,yaw})=>window.__fi2.teleport(x,z,yaw),v);
  let reached=true;
  if(v.swim)reached=await page.waitForFunction(()=>window.__fi2.water.state.phase==='swim',null,{timeout:20000}).then(()=>true,()=>false);
  await page.waitForTimeout(SETTLE);// camera settles, chunks in view compile, splash-down ends (GFX_SETTLE: the follow camera needs ~10 s after a long teleport)
  // Keep the loop awake (an idle island drops to 20 fps or sleeps): a pointer wiggle in the empty top-right corner, away from the HUD buttons.
  await page.evaluate(()=>{window.__gfx.rows.length=0;window.__gfx.on=true;});
  const t0=Date.now();
  while(Date.now()-t0<30000){
   await page.mouse.move(300+Math.random()*20,300+Math.random()*20);await page.waitForTimeout(250);
   if(await page.evaluate(n=>window.__gfx.rows.length>=n,FRAMES))break;
  }
  const r=await page.evaluate(()=>{const f=window.__fi2,g=window.__gfx;g.on=false;const i=f.renderer.info,o=f.scene.getObjectByName('surrounding-ocean');
   return {rows:g.rows.slice(),programs:i.programs?i.programs.length:0,textures:i.memory.textures,geometries:i.memory.geometries,
    phase:f.water.state.phase,tier:f.heat.tier??null,dpr:f.renderer.getPixelRatio(),oceanBlended:!!(o&&o.material&&(o.material.transparent||o.material.blending===5/* CustomBlending: swimClear.ts createOceanBlend */)),
    at:{x:+f.location.x.toFixed(1),z:+f.location.z.toFixed(1)}};});
  const calls=r.rows.map(x=>x[0]),tris=r.rows.map(x=>x[1]),ms=r.rows.map(x=>x[2]);
  out.push({view:v.id,note:v.note,frames:r.rows.length,calls:median(calls),callsMin:Math.min(...calls),callsMax:Math.max(...calls),triangles:median(tris),
   programs:r.programs,textures:r.textures,geometries:r.geometries,renderMs:+median(ms).toFixed(2),phase:r.phase,reached,oceanBlended:r.oceanBlended,dpr:r.dpr,at:r.at});
  if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await page.screenshot({path:path.join(SHOTS,`gfx-${v.id}.png`)});}
 }
 await browser.close();
 console.log(`gfx-budget${NO_TRAIN?' (no train)':''}  ${BASE}  ${DESKTOP?'1440x900 desktop':'390x844'} DPR 1  tier ${TIER}  ${TIME}  SwiftShader (counts exact; render ms = CPU submit on this machine, NOT GPU cost or heat)`);
 console.log('| view | draw calls (min-max) | triangles | programs | textures | geometries | render ms (CPU) | water phase | ocean blended | frames |');
 console.log('|---|---|---|---|---|---|---|---|---|---|');
 for(const o of out)console.log(`| ${o.view} | ${o.calls} (${o.callsMin}-${o.callsMax}) | ${o.triangles} | ${o.programs} | ${o.textures} | ${o.geometries} | ${o.renderMs} | ${o.phase}${o.reached?'':' (swim NOT reached)'} | ${o.oceanBlended?'yes':'no'} | ${o.frames} |`);
 if(process.env.GFX_JSON)fs.writeFileSync(process.env.GFX_JSON,JSON.stringify({base:BASE,tier:TIER,time:TIME,views:out},null,1));
 if(errors.length){console.log('page errors:');for(const e of errors.slice(0,5))console.log('  '+e);}
 if(out.some(o=>o.frames<FRAMES/2)){console.log('FAIL: too few frames at a viewpoint');process.exit(1);}
})().catch(e=>{console.error(e);process.exit(1);});
