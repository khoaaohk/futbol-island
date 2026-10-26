// Explore + swimming upgrade (Oct 25 2026; docs/EXPLORE_SWIM_UPGRADE_OCT25.md): the reef strokes' sound clock, the reef hint going
// once the swimmer reaches the zone, the secret ball's gentle nudge (never a lead to it), and the swim pose additions.
// Run: node tests/explore-swim-oct25.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const G={Math,Map,Set,WeakMap,Uint8Array,Uint16Array,Uint32Array,Int8Array,Int16Array,Int32Array,Float32Array,Float64Array,console,JSON,Number,Object,Array,String,Symbol,Error,Promise,Date,RegExp,isFinite,parseFloat,parseInt};
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{...G,exports:mod.exports,module:mod,
  require:id=>id==='three'?T:id.startsWith('@/')?load(resolveTs(path.resolve(base,id.slice(2)))):id.startsWith('.')?load(resolveTs(path.resolve(path.dirname(file),id))):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const resolveTs=p=>fs.existsSync(p+'.ts')?p+'.ts':fs.existsSync(p+'.tsx')?p+'.tsx':p+'/index.ts';
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
let passed=0;const ok=(name,fn)=>{try{fn();passed++;console.log('ok  ',name);}catch(e){console.error('FAIL',name);throw e;}};
const D=load('lib/town/water/diveSpots.ts'),RT=load('lib/town/water/diveRuntime.ts'),R=load('lib/town/water/reefDiscovery.ts');
const mkRuntime=(extra={})=>{const root=new T.Group(),scene=new T.Scene();scene.add(root);
 return RT.createDiveRuntime({scene,renderer:{render(){}},camera:new T.PerspectiveCamera(50,390/844),player:{root,update(){}},phone:true,reduced:()=>false,ui:()=>null,place(){},hide(){},
  entered(){},surfaced(){},found(){},credit(){},low(){},out(){},fly:()=>false,calm:()=>true,...extra});};

ok('the reef strokes have a clock: the runtime exposes the rig stroke phase and Town feeds it to the reef sound (it was 0: silent)',()=>{
 const spot=D.diveSpotById('ray-meadow'),rt=mkRuntime();rt.scan(.2,spot.x,spot.z,true);assert(rt.start());
 const p0=rt.strokePhase;for(let i=0;i<30;i++)rt.frame(1/30,{sx:0,sy:-1,lift:0},390,844);assert(rt.strokePhase>p0+1,'the clock runs while swimming');rt.dispose();
 const town=read('components/Town.tsx');assert(town.includes("ss.phase=dive.strokePhase;"),'Town feeds the reef stroke clock');assert(!town.includes("ss.kind=st.effort>.12?'crawl':'tread';ss.phase=0;"));
});

ok('the reef hint goes once the swimmer is in that zone (or under), and wading in counts for it',()=>{
 const spot=D.diveSpotById('ray-meadow'),h=R.createReefHints(),m=new Float32Array(16);m[0]=1;m[10]=-1;
 R.reefStore.hint(spot,false,0);assert.equal(R.reefStore.get().hint?.id,spot.id);
 h.step(.6,spot.x-60,spot.z,true,false,'',m);assert.equal(R.reefStore.get().hint?.id,spot.id,'kept while still on the way');
 h.step(.6,spot.x,spot.z,true,false,'',m);assert.equal(R.reefStore.get().hint,null,'gone inside the patch');
 R.reefStore.hint(spot,false,0);h.step(.01,spot.x-60,spot.z,false,true,'',m);assert.equal(R.reefStore.get().hint,null,'gone at once when a dive starts');
 assert(read('components/Town.tsx').includes("!dive.diving&&(water.inWater/*"),'wading is eligible');
 assert(read('components/ReefHintToast.tsx').includes('if(shown&&!hint)setShown(0);'),'the toast frees the lane when cleared');
});

ok('the secret ball: once only it is left, Dot circles and a gentle note shows once a dive; never with the ball found; no lead to it',()=>{
 assert(RT.DIVE_SECRET_NOTE.length<=90&&!/ball|chest/i.test(RT.DIVE_SECRET_NOTE),'kid copy, and it does not name the ball or the chest');
 const spot=D.diveSpotById('pauls-grotto'),rt=mkRuntime();rt.scan(.2,spot.x,spot.z,true);assert(rt.start());const st=rt.session.state;
 // Hovering with tasks left: the buddy leads (no note).
 for(let i=0;i<120;i++){rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);st.breath=1;}assert.notEqual(RT.diveStore.get().note,RT.DIVE_SECRET_NOTE,'not while other things are left');
 // Everything but the ball done: pickups swum through, task finds used.
 for(const p of rt.pickups){st.x=p.x;st.z=p.z;st.y=p.y+.2;st.depthT=1;rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);st.breath=1;}
 for(const f of D.diveTaskFinds(spot)){const p=D.diveFindPoint(f,{x:0,y:0,z:0},spot.floor);st.x=p.x;st.z=p.z;st.y=p.y;st.find=f;rt.use();st.breath=1;}
 rt.closeCard();RT.diveStore.set({note:''});st.x=0;st.z=12;st.vx=st.vz=0;
 for(let i=0;i<120;i++){rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);st.breath=1;}
 assert.equal(RT.diveStore.get().note,RT.DIVE_SECRET_NOTE,'the nudge');RT.diveStore.set({note:''});
 for(let i=0;i<200;i++){rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);st.breath=1;}assert.notEqual(RT.diveStore.get().note,RT.DIVE_SECRET_NOTE,'once a dive');
 // Pick the ball up, come up, explore again: nothing left, so no nudge.
 const ball=spot.finds.find(f=>f.kind==='ball');st.find=ball;rt.use();rt.closeCard();rt.session.surface('leave');rt.dispose();
 rt.scan(3,spot.x,spot.z,true);rt.scan(.2,spot.x,spot.z,true);assert(rt.start(),'explore again');RT.diveStore.set({note:''});
 for(let i=0;i<200;i++){rt.frame(1/30,{sx:0,sy:0,lift:0},390,844);rt.session.state.breath=1;}assert.notEqual(RT.diveStore.get().note,RT.DIVE_SECRET_NOTE,'the ball is found: no nudge');
 rt.dispose();
 const src=read('lib/town/water/diveJourney.ts');assert(/for\(const f of diveTaskFinds\(spot\)\)/.test(src),'the lead (nextTarget) only knows the reef tasks, never the ball');
});

console.log(`explore-swim-oct25: ${passed} passed`);
