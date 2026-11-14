// Stadium Park pond fishing (Nov 13 2026, owner): a fresh-water post at the park pond (lib/town/fishing/fishSpots.ts park-pond):
// casts land in the pond, its own koi / perch / pike (pondFish.ts) and legend, shore-level economy, the float on the pond's surface.
// usage: node tests/fishing-pond.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const store=new Map();
const context=vm.createContext({console,Math,Set,Map,performance,Date,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,
 window:{addEventListener:()=>{},removeEventListener:()=>{},matchMedia:()=>({matches:false})},
 requestAnimationFrame:()=>1,setTimeout:()=>1,setInterval:()=>1,
 localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){const file=path.resolve(base,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id));cache.set(file,mod.exports);return mod.exports;}

const read=f=>fs.readFileSync(path.join(base,f),'utf8');
const cat=load('lib/town/fishing/fishCatalog.ts'),core=load('lib/town/fishing/fishingCore.ts'),aim=load('lib/town/fishing/fishingAim.ts'),L=load('lib/town/westParkLayout.ts');
const O=load('lib/town/fishing/fishingOdds.ts'),LG=load('lib/town/fishing/legendary.ts'),K=load('lib/town/fishing/fishingKiosk.ts'),H=load('lib/town/fishing/fishingHooks.ts'),{onIsland}=load('lib/town/shoreline.ts');
const s=cat.spotById('park-pond');assert(s&&s.pond&&!s.area&&!s.deep&&!s.boat,'the park pond is a main-island shore post');
assert.equal(cat.FISH_SPOTS.findIndex(x=>x.id==='park-pond'),18,'kept after the signature waves\' spots (they slice SHORE_SPOTS); the north-west coast follows it (Nov 13 2026)');
// 1. Placement: on the grass past the rim walk (the stall too), casting in toward the middle; the float lands in the pond's water.
assert(!L.inPond(s.x,s.z,L.POND_RIM)&&L.onGrass(s.x,s.z)&&!L.onWalkPath(s.x,s.z,.3),'stands on the grass, off the rim walk');
assert(L.pondQ(s.x,s.z,L.POND_RIM)<1.25,'right by the rim');
for(const c of K.stallColliders(s))assert(!L.inPond(c.x,c.z,L.POND_RIM)&&!L.onWalkPath(c.x,c.z,0),'the stall keeps off the rim walk and the water');
assert(core.inPondWater(s.buoy.x,s.buoy.z),'the idle float is on the pond');
{const c=core.castPoint(s,s);assert(core.inPondWater(c.x,c.z)&&c.distance>3&&c.distance<=Math.hypot(s.buoy.x-s.x,s.buoy.z-s.z)+.5,'the cast lands in the pond');
 const A=aim.aimArea(s,s);let r=1;const rand=()=>(r=(r*16807)%2147483647)/2147483647;for(let i=0;i<200;i++){const q=aim.quickCast(A,rand);assert(core.inPondWater(q.x,q.z),'every quick cast lands in the pond');}}
// The pond's water is the only island water: the plaza, the park lawn and the rim stay land; the sea is unchanged.
assert(core.inOpenWater(L.PARK_POND.x,L.PARK_POND.z)&&core.inOpenWater(-400,0),'the pond and the sea are open water');
for(const [x,z] of [[-96,-30],[-150,40],[s.x,s.z],[L.pondEdge(0,.5).x,L.pondEdge(0,.5).z]])assert(!core.inOpenWater(x,z),`(${x}, ${z}) is not open water`);
// 2. The catch: koi, perch (commons) and pike (uncommon), pond-only; shore-level mean catch; at least the legend-clue kinds; its legend.
{const ids=Object.keys(s.weights).sort();assert.deepEqual(ids,['koi','perch','pike'],'the pond table: '+ids);
 for(const id of ids){const f=cat.fishById(id);assert(f.spots.length===1&&f.spots[0]==='park-pond'&&f.group==='fish'&&f.story&&/^Fun fish fact: .+ Football: /.test(f.club.fact)&&f.club.fact.includes(f.club.entity.name),`${id}: pond-only, a split fun-fish + football fact naming its entity`);}
 const p=O.meanPrice(s.weights);assert(p>=3.75&&p<=4.26,`mean catch ${p.toFixed(2)} ≈ the shore's 4.0`);
 assert(ids.length>=LG.LEGEND_CLUE_KINDS,'enough kinds for the legend clue');
 const leg=LG.legendsAt('park-pond');assert(leg.length===1&&leg[0].name==='King Koi'&&leg[0].price===0&&!cat.FISH.includes(leg[0]),'King Koi: the pond legend, released, never sold');
 assert.equal(cat.FISH.length,167,'Fishbook 150 + the pond three + the north-west coast fourteen');
 assert(load('lib/town/fishing/fishModels.ts').MODELLED_SPECIES.filter(id=>ids.includes(id)).length===3,'each has its own 3D model');}
// 3. Visuals: the float and the line ride the pond's own surface, no sea strip / reef window / schools there; the stall type.
{const v=read('lib/town/fishing/fishingVisuals.ts'),w=read('lib/town/fishing/fishingWorld.ts');
 assert(/pondOn=!!spot\.pond;SURFACE=pondOn\?POND_SURFACE_Y\+\.017:SEA_SURFACE;/.test(v)&&/if\(!pondOn\)water\?\.begin\(/.test(v)&&/if\(waterOn&&!pondOn\)schools\.begin\(/.test(v)&&/const clear=!!water\?\.field&&!pondOn;/.test(v),'pond session: its own surface, no shore water or schools');
 assert(/FISH_SPOTS\[i\]\.pond\?POND_SURFACE_Y\+\.06:-\.36/.test(w),'the idle float bobs on the pond');
 assert.equal(cat.POND_SURFACE_Y,L.POND_Y,'the pond surface height is the pond\'s');
 assert.equal(K.stallType('park-pond'),'rowboat','a boat-hire stall');
 assert(H.VISITOR_AREAS.find(a=>a.id==='main').spots.includes('park-pond'),'today\'s main-island visitor can swim in the pond');}
console.log('PASS fishing pond: the Stadium Park pond post (grass past the rim), casts in the pond, koi / perch / pike + King Koi, shore-level odds, pond-surface float');
})().catch(e=>{console.error(e);process.exit(1);});
