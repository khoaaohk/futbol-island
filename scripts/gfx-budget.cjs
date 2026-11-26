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
// Café by the Sea (Nov 24 2026): GFX_VIEWS=cafe, the café and its garden from the beach south-west of the steps; GFX_NO_CAFE=1 builds the
// island without the café's scenery (world.ts 'fi-no-cafe') for the before column.
if(process.env.GFX_VIEWS==='cafe')VIEWS.splice(0,VIEWS.length,{id:'cafe',note:'Café by the Sea and garden, from the beach',x:698,z:-80,yaw:Math.PI});
// Sand and shallows (Nov 25 2026): GFX_VIEWS=sand, the Summit beach (along the sand, waterline to dune line), the sand/grass line,
// the sandbar, a Coral Cay beach for reference and the main island's shore.
if(process.env.GFX_VIEWS==='sand'){const SI=load('lib/town/summitIsle.ts'),CC=load('lib/town/coralCay.ts'),PK=SI.SUMMIT_PEAK;
 const at=(a,f)=>{const rc=SI.peakCoastRadius(a),bw=SI.beachWidth(a),r=rc-bw*f;return {x:PK.x+Math.cos(a)*r,z:PK.z+Math.sin(a)*r,yaw:Math.atan2(-Math.sin(a),Math.cos(a))};};
 const B=SI.SANDBAR_PATH,bi=B.reduce((m,p,i)=>Math.abs(p.z+28)<Math.abs(B[m].z+28)?i:m,0),bm=B[bi],bn=B[bi+2],cs=CC.CAY_SAND,ci=Math.round(cs.length*.3),c0=cs[ci],c1=cs[(ci+2)%cs.length];
 const SA=Number(process.env.GFX_SAND_BEARING||2.2);
 VIEWS.splice(0,VIEWS.length,
  {id:'summit-beach',note:'Summit Isle beach, along the sand',...at(SA,.45)},
  {id:'summit-dune',note:'Summit Isle sand/grass line',...at(SA+.25,.9)},
  {id:'summit-water',note:'Summit Isle waterline, facing the sea',...at(SA+.5,.12),yaw:Math.atan2(Math.cos(SA+.5),Math.sin(SA+.5))},
  {id:'sandbar',note:'the sandbar, along it',x:bm.x,z:bm.z,yaw:Math.atan2(bn.x-bm.x,bn.z-bm.z)},
  {id:'cay-beach',note:'Coral Cay beach, along the sand',x:c0.outer.x*.45+c0.inner.x*.55,z:c0.outer.z*.45+c0.inner.z*.55,yaw:Math.atan2(c1.outer.x-c0.outer.x,c1.outer.z-c0.outer.z)},
  {id:'shore',note:'Palm Coast Beach waterline, facing the sea',x:shore.x,z:shore.z,yaw:shore.yaw});}
// Swim view at the shore (Nov 25 2026): GFX_VIEWS=swimshore, swimming 7 m off Palm Coast Beach looking back at the sand (the clear
// water window + swim disc path), and a five-step walk-in across the waterline (same heading, 2 m up the sand to 9 m out).
if(process.env.GFX_VIEWS==='swimshore'){const at=(id,o,note)=>({id,note,x:shore.x+shore.ux*o,z:shore.z+shore.uz*o,yaw:shore.yaw+Math.PI});
 VIEWS.splice(0,VIEWS.length,at('swim-near',8,'swimming 7 m off the beach, facing the sand'),at('fly-sea',Number(process.env.GFX_FLY_OFF||22),'over the sea off the beach (use with GFX_FLY)'),
  // a hilltop first (Summit Isle's peak: the camera goes well over the water there), as a walk down from high ground or a landing would
  (p=>({id:'hill',note:'Summit Isle peak (camera high over the water)',x:p.x,z:p.z,yaw:0}))(load('lib/town/summitIsle.ts').SUMMIT_PEAK),at('inland-15',-15,'15 m up the beach'),at('inland-8',-8,'8 m up the beach'),at('walkin-1',-1,'on the sand'),at('walkin-2',1.5,'at the waterline'),at('walkin-3',3.5,'wading'),at('walkin-4',6,'swimming in'),at('walkin-5',10,'swimming'));
 const SB=load('lib/town/summitIsle.ts').SANDBAR_PATH,bi=SB.reduce((m,q,i)=>Math.abs(q.z+28)<Math.abs(SB[m].z+28)?i:m,0);for(const v of VIEWS)v.probe=true;VIEWS.push({id:'swim-sandbar',note:'swimming 9 m off the sandbar',x:SB[bi].x+9,z:SB[bi].z,yaw:-Math.PI/2,swim:true});
 const cs=load('lib/town/coralCay.ts').CAY_SAND;for(const [id,f] of [['cay-shore-a',.3],['cay-shore-b',.62],['cay-shore-c',.88]]){const c=cs[Math.round(cs.length*f)%cs.length];VIEWS.push({id,note:'Coral Cay sand, 2 m from the water',x:c.outer.x*.85+c.inner.x*.15,z:c.outer.z*.85+c.inner.z*.15,yaw:0});}}
// GFX_ONLY=id,id keeps those views; GFX_FLY=<m> arrives at the first kept view on the jetpack at that height (no teleport after:
// the high camera, where the clear water window is off) and measures only that view.
if(process.env.GFX_ONLY){const keep=process.env.GFX_ONLY.split(',');VIEWS.splice(0,VIEWS.length,...VIEWS.filter(v=>keep.includes(v.id)));}
const FLY=Number(process.env.GFX_FLY||0);if(FLY&&process.env.GFX_FLY_TP!=='1')VIEWS.length=1;// GFX_FLY_TP=1: arrive flying, then teleport to every view on foot (a landing: the clear window's old height latch)
const NO_CAFE=process.env.GFX_NO_CAFE==='1';
const NO_TRAIN=process.env.GFX_NO_TRAIN==='1',SAVER=process.env.GFX_SAVER==='1';// GFX_SAVER=1: Battery saver on before load, so the world BUILDS at the lowest tier (the Island Line's lighter build)
const median=a=>{const s=[...a].sort((x,y)=>x-y);return s.length?s[s.length>>1]:0;};
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 // GFX_VIEWPORT=desktop (Nov 23 2026, Island Line): a 1440x900 desktop window instead of the phone.
 const DESKTOP=process.env.GFX_VIEWPORT==='desktop';
 const DPR=Number(process.env.GFX_DPR||1);// GFX_DPR=2: sharper shots for close-up crops (the counts are the same)
 const ctx=await browser.newContext(DESKTOP?{viewport:{width:1440,height:900},deviceScaleFactor:DPR}:{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:DPR});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push('pageerror: '+e.message.slice(0,300)));
 await page.addInitScript(({x,z,time,seed,noTrain,saver,noCafe,fly,yaw})=>{
  localStorage.setItem('fi-staff','1');// staff device: the analytics tracker sends nothing
  sessionStorage.setItem('fi2-in-game','1');localStorage.setItem('fi2-welcome-v1','completed');localStorage.setItem('fi2-save-deleted-v1','device-specs');
  localStorage.setItem('fi2-time-of-day',time);
  if(noTrain)localStorage.setItem('fi-no-train','1');else localStorage.removeItem('fi-no-train');
  if(noCafe)localStorage.setItem('fi-no-cafe','1');else localStorage.removeItem('fi-no-cafe');
  if(saver)localStorage.setItem('fi2-battery-saver','on');else localStorage.removeItem('fi2-battery-saver');
  sessionStorage.setItem('fi2-arcade-departure-v1',JSON.stringify(fly?{version:1,x,z,yaw,ride:'jetpack',flightHeight:fly}:{version:1,x,z,yaw:0,ride:'walk',flightHeight:0}));
  if(seed){let s=20261117;Math.random=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
 },{x:VIEWS[0].x,z:VIEWS[0].z,time:TIME,seed:SEED,noTrain:NO_TRAIN,saver:SAVER,noCafe:NO_CAFE,fly:FLY,yaw:VIEWS[0].yaw||0});
 await page.goto(BASE+'/play?from=arcade',{timeout:240000});
 await page.waitForFunction(()=>window.__fi2&&window.__fi2.renderer&&window.__fi2.heat&&window.__fi2.water&&!document.querySelector('[data-island-return-loading]'),null,{timeout:240000});
 // GFX_NO_PASSENGERS=1 (Nov 24 2026, Gameplay 3 A/B): the train passengers never update, so their instanced mesh is never built (0 draws)
 if(process.env.GFX_NO_PASSENGERS==='1')await page.evaluate(()=>{const p=window.__fi2.trainPassengers;if(p)p.update=()=>{};});
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
  if(!FLY||process.env.GFX_FLY_TP==='1')await page.evaluate(({x,z,yaw})=>window.__fi2.teleport(x,z,yaw),v);
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
  if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await page.screenshot({path:path.join(SHOTS,`${process.env.GFX_SHOT_PREFIX||'gfx'}-${v.id}.png`)});}
  // Shore probe (Nov 25 2026): the screen positions (CSS px) of a world line crossing the shore (6 m up the sand to 30 m out, every
  // 0.5 m, 4 m along the beach from the player), written beside the shot; scripts/shore-steps.py samples the shot along it.
  if(SHOTS&&v.probe){const pts=[];for(let o=-6;o<=30;o+=.5)pts.push([shore.x+shore.ux*o-shore.uz*4,o<0?.05:-.4,shore.z+shore.uz*o+shore.ux*4,o]);
   const px=await page.evaluate(pts=>{const c=window.__fi2.lessonPass.camera;c.updateMatrixWorld();const v=c.matrixWorldInverse.elements,p=c.projectionMatrix.elements,W=innerWidth,H=innerHeight;
    return pts.map(([x,y,z,o])=>{const ex=v[0]*x+v[4]*y+v[8]*z+v[12],ey=v[1]*x+v[5]*y+v[9]*z+v[13],ez=v[2]*x+v[6]*y+v[10]*z+v[14],cw=-ez;return {o,x:(p[0]*ex+p[8]*ez)/cw*.5*W+W/2,y:H/2-(p[5]*ey+p[9]*ez)/cw*.5*H};});},pts);
   const cw=await page.evaluate(()=>{const w=window.__fi2.clearWin;return w?{strength:+w.strength.toFixed(2),open:w.open}:null;});v.cw=cw;
   fs.writeFileSync(path.join(SHOTS,`${process.env.GFX_SHOT_PREFIX||'gfx'}-${v.id}.probe.json`),JSON.stringify({dpr:DPR,px,cw}));}
 }
 await browser.close();
 console.log(`gfx-budget${NO_TRAIN?' (no train)':''}${SAVER?' (battery saver build)':''}  ${BASE}  ${DESKTOP?'1440x900 desktop':'390x844'} DPR 1  tier ${TIER}  ${TIME}  SwiftShader (counts exact; render ms = CPU submit on this machine, NOT GPU cost or heat)`);
 console.log('| view | draw calls (min-max) | triangles | programs | textures | geometries | render ms (CPU) | water phase | ocean blended | frames |');
 console.log('|---|---|---|---|---|---|---|---|---|---|');
 for(const v of VIEWS)if(v.cw)console.log(`clear window at ${v.id}: strength ${v.cw.strength}, ocean blended ${v.cw.open}`);
 for(const o of out)console.log(`| ${o.view} | ${o.calls} (${o.callsMin}-${o.callsMax}) | ${o.triangles} | ${o.programs} | ${o.textures} | ${o.geometries} | ${o.renderMs} | ${o.phase}${o.reached?'':' (swim NOT reached)'} | ${o.oceanBlended?'yes':'no'} | ${o.frames} |`);
 if(process.env.GFX_JSON)fs.writeFileSync(process.env.GFX_JSON,JSON.stringify({base:BASE,tier:TIER,time:TIME,views:out},null,1));
 if(errors.length){console.log('page errors:');for(const e of errors.slice(0,5))console.log('  '+e);}
 if(out.some(o=>o.frames<FRAMES/2)){console.log('FAIL: too few frames at a viewpoint');process.exit(1);}
})().catch(e=>{console.error(e);process.exit(1);});
