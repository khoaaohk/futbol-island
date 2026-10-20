// Heat offsets (Oct 19 2026, docs/performance-guide.md "Heat offsets for the water look"): savings that offset the clear water and
// ground detail costs on phones, idle states and hot tiers. Tier 0 on desktop draws exactly as before. Run: node tests/heat-offsets.cjs
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const store=new Map(),localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const cache={};
const load=(path,extra={})=>{if(cache[path])return cache[path];const m={exports:{}};cache[path]=m.exports;
 vm.runInNewContext(ts.transpileModule(read(path),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,localStorage,Math,...extra,require:n=>n==='./heatTier'?load('lib/graphics/heatTier.ts'):n==='three'?require('three'):{}});
 return cache[path]=m.exports;};
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const H=load('lib/graphics/heatTier.ts');

ok('1. deep rest: a QUIET rest drops to 15 fps after 30 s without input; not quiet stays 20 fps; input restores 30 fps',()=>{
 const R=load('lib/town/idleRide.ts');const {createIdleRide,IDLE_DEEP_AFTER_MS,IDLE_DEEP_FRAME_MS,IDLE_RIDE_FRAME_MS,IDLE_FOOT_AFTER_MS}=R;
 assert.equal(IDLE_DEEP_AFTER_MS,30000);assert.equal(IDLE_DEEP_FRAME_MS,1000/15);
 assert(IDLE_DEEP_FRAME_MS<=1000*load('lib/town/frameCap.ts').FRAME_DT_MAX+1e-9,'one deep frame fits the dt clamp (nothing runs slower)');
 const F=1000/30,p={x:0,y:0,z:0},c={x:0,y:6,z:-8};const r=createIdleRide();let t=0;
 for(;t<IDLE_FOOT_AFTER_MS+F*2;t+=F)r.sample(t,p,c);assert.equal(r.interval(t,true,IDLE_FOOT_AFTER_MS,true),IDLE_RIDE_FRAME_MS,'20 fps first');
 for(;t<IDLE_DEEP_AFTER_MS-F;t+=F)r.sample(t,p,c);assert.equal(r.interval(t,true,IDLE_FOOT_AFTER_MS,true),IDLE_RIDE_FRAME_MS,'not before 30 s');
 t=IDLE_DEEP_AFTER_MS+F;r.sample(t,p,c);assert.equal(r.interval(t,true,IDLE_FOOT_AFTER_MS,true),IDLE_DEEP_FRAME_MS,'15 fps after 30 s quiet');
 assert.equal(r.interval(t,true,IDLE_FOOT_AFTER_MS,false),IDLE_RIDE_FRAME_MS,'something moving near: back to 20 fps');
 assert.equal(r.interval(t,true),IDLE_RIDE_FRAME_MS,'old callers (no quiet flag) unchanged');
 r.stir(t+10);assert.equal(r.interval(t+20,true,IDLE_FOOT_AFTER_MS,true),0,'input: full rate at once');
 r.sample(t+40,{x:5,y:0,z:0},c);assert.equal(r.interval(t+60,true,IDLE_FOOT_AFTER_MS,true),0,'travel: full rate');});

ok('2. rest soft resolution: a phone at rest for 8 s draws at the moving ratio; input/movement/menus return; desktop never',()=>{
 const {MotionResolution,REST_SOFT_MS}=load('lib/graphics/quality.ts');assert.equal(REST_SOFT_MS,8000);
 const p=new MotionResolution(1.75,true);let t=0;assert.equal(p.update(t,false,false,true),0,'starts sharp');
 for(t=33;t<REST_SOFT_MS-50;t+=33)assert.equal(p.update(t,false,false,true),0,'not before 8 s');
 assert.equal(p.update(REST_SOFT_MS+1,false,false,true),1.5,'soft after 8 s');assert.equal(p.ratio,1.5);
 assert.equal(p.update(REST_SOFT_MS+40,false,false,true),0,'stays soft');
 assert.equal(p.update(REST_SOFT_MS+80,false,false,false),1.75,'rest ends (a tap, something moves near) with the view still: sharp at once');
 for(t=0;t<REST_SOFT_MS+100;t+=33)p.update(20000+t,false,false,true);assert.equal(p.ratio,1.5);assert.equal(p.update(30000,false,true,true),1.75,'a menu/quiz (sharpNow) is sharp at once');
 const q=new MotionResolution(1.75,true);for(t=0;t<REST_SOFT_MS+100;t+=33)q.update(t,false,false,true);assert.equal(q.ratio,1.5);assert.equal(q.update(t+33,true,false,false),0,'movement: moving ratio (already 1.5)');
 const d=new MotionResolution(2,false);for(t=0;t<REST_SOFT_MS*2;t+=33)assert.equal(d.update(t,false,false,true),0,'desktop: never');assert.equal(d.ratio,2);
 // The real phone setup (Town: moving ratio = sharp, so the moving step is off): the rest step still works and returns at once.
 const ph=new MotionResolution(1.75,true,1.75);assert.equal(ph.enabled,false);assert.equal(ph.restEnabled,true);
 for(t=0;t<REST_SOFT_MS-50;t+=33)assert.equal(ph.update(t,false,false,true),0);assert.equal(ph.update(REST_SOFT_MS+5,false,false,true),1.5,'phone: soft after 8 s');
 assert.equal(ph.update(REST_SOFT_MS+40,true,false,false),1.75,'phone: input/movement: sharp at once (no moving step)');
 assert.equal(new MotionResolution(1.25,true,1.25).restEnabled,false,'a 1.25 device never steps');
 const h=new MotionResolution(1.75,true);h.setLimit(1.25);h.update(0,false);for(t=33;t<REST_SOFT_MS*2;t+=33)h.update(t,false,false,true);assert.equal(h.ratio,1.25,'a tier limit below 1.5 still wins');});

ok('3. quiet rest shadows: every 2nd frame while resting, every frame again after; focus and tier cadence untouched',()=>{
 H.forceHeatTier(0);const {createIslandHeat}=load('lib/graphics/islandHeat.ts',{window:undefined,document:undefined});
 const renderer={shadowMap:{autoUpdate:true,needsUpdate:false}},sun={shadow:{mapSize:{x:1536,set(x){this.x=x;}},map:{dispose(){}}}};
 const heat=createIslandHeat({renderer,sun,resolution:{setLimit(){}},npcs:{setDrawDistance(){}},traffic:{cars:[],rider:{index:-1}},governed:true});
 assert.equal(heat.resting,false);heat.setRest(true);assert.equal(renderer.shadowMap.autoUpdate,false);
 let n=0;for(let i=0;i<10;i++){renderer.shadowMap.needsUpdate=false;heat.beforeRender({x:0,z:0});if(renderer.shadowMap.needsUpdate)n++;}assert.equal(n,5,'half rate');
 heat.setRest(false);assert.equal(renderer.shadowMap.autoUpdate,true,'every frame again');
 heat.setFocus(true);heat.setRest(true);heat.setRest(false);assert.equal(renderer.shadowMap.autoUpdate,false,'focus mode keeps its half rate');heat.setFocus(false);assert.equal(renderer.shadowMap.autoUpdate,true);
 heat.dispose();H.forceHeatTier(null);});

ok('3b. the governor judges a rest frame against its own slot: 20 fps rest after 30 fps play is not "throttling"',()=>{
 const {createIslandHeat}=load('lib/graphics/islandHeat.ts',{window:undefined,document:undefined});
 const run=(capMs)=>{H.forceHeatTier(null);H.setGovernorTier(0);const renderer={shadowMap:{autoUpdate:true,needsUpdate:false}},sun={shadow:{mapSize:{x:1536,set(x){this.x=x;}},map:{dispose(){}}}};
  const heat=createIslandHeat({renderer,sun,resolution:{setLimit(){}},npcs:{setDrawDistance(){}},traffic:{cars:[],rider:{index:-1}},governed:true});
  let t=0;for(;t<30000;t+=1000/30)heat.afterRender(t,1000/30,5,40,'');// 30 s of healthy 30 fps play: baseline 33 ms
  for(const end=t+60000;t<end;t+=50){heat.setRest(true,capMs);heat.afterRender(t,50,5,40,'');}// 60 s resting at 20 fps
  const tier=H.effectiveTier();heat.dispose();H.setGovernorTier(0);return tier;};
 assert.equal(run(50),0,'rest paced at 50 ms: tier 0 kept');
 assert.equal(run(0),1,'without the cap (the old judgement) the same rest stepped the phone to tier 1');});

ok('4. grain off from tier 1; decals and macro detail hidden from tier 2 (restored on cooling)',()=>{
 const tint=read('lib/graphics/groundTint.ts');assert.match(tint,/export const GROUND_GRAIN_OFF_TIER=1;/);
 const D=load('lib/graphics/groundDecals.ts');assert.equal(D.DECALS_OFF_TIER,2);
 const T=require('three'),parent=new T.Group();H.forceHeatTier(0);
 const plan={stones:[{x:0,y:0,z:0,r:0,s:1,c:0}],tufts:[],flowers:[],macro:[]};const built=D.buildGroundDecals(parent,plan,'decals-test');
 assert.equal(built.group.visible,true,'tier 0 drawn');H.forceHeatTier(1);assert.equal(built.group.visible,true,'tier 1 drawn');
 H.forceHeatTier(2);assert.equal(built.group.visible,false,'tier 2 hidden');H.forceHeatTier(4);assert.equal(built.group.visible,false,'Battery saver hidden');
 H.forceHeatTier(0);assert.equal(built.group.visible,true,'cooled: drawn again');built.dispose();H.forceHeatTier(2);assert.equal(built.group.visible,true,'disposed: no longer subscribed');H.forceHeatTier(null);});

ok('5. Town wiring: one quiet flag feeds the deep rest, the rest shadows and the soft resolution',()=>{
 const town=read('components/Town.tsx');
 assert(town.includes("const restNear=!paused&&games.stats.visiblePlayers===0&&streetTraffic.rider.index<0&&!streetTraffic.cars.some("),'rest gate: no field players, no carried truck, no car near');
 assert(town.includes(",quietNear=restNear&&islandNpcs.stats.moving===0;"),'quiet = rest gate + no townsfolk moving near');
 assert(town.includes("!fishing.focused&&!heat.focused&&(coarse?restNear:quietNear);"),'foot rest: phones accept walking townsfolk, desktop keeps the quiet gate');
 assert(town.includes("footRest?IDLE_FOOT_AFTER_MS:undefined,quietNear);heat.setRest(idleFrame>0&&quietNear,idleFrame);"),"deep rest + rest shadows + the governor pacing");
 assert(town.includes("paused||Boolean(quiz?.quiz)||aimWaiting,idleFrame>0);"),'soft resolution only at a rest');});

if(failed){console.log(failed+' failed');process.exit(1);}console.log('heat-offsets: all passed');
