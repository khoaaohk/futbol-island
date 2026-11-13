// West Stadium, phase 1 (Nov 12 2026, docs/stadium/PLAN.md): the new west coast, Stadium Park, Stadium Plaza and the stadium's
// reserved footprint, checked against the town the game actually builds: the land and walk/flight bounds follow the new coast,
// the plaza and gate are open, nothing grows inside the bowl, the park stays inside its draw budget (west chunks only, one
// region gate hides them off screen) and the map draws the stadium. usage: node tests/west-stadium.cjs
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

const L=load('lib/town/westParkLayout.ts'),{onIsland,ISLAND_SHORE,INTERIOR_GRASS}=load('lib/town/shoreline.ts'),sim=load('lib/town/simulation.ts');
const {STADIUM:S,STADIUM_GATE:G,STADIUM_PLAZA:P,PARK_POND}=L;
// 1. Land: the stadium, park and plaza are on the island; the old west coast (x -99) is inland; the sea starts past x -332.
for(const [x,z] of [[S.x,S.z],[S.x-S.bowlW/2,S.z],[S.x,S.z-S.bowlL/2],[S.x,S.z+S.bowlL/2],[PARK_POND.x,PARK_POND.z],[P.minX,P.minZ],[-300,-150],[-250,100]])assert(onIsland(x,z),`(${x}, ${z}) is land`);
assert(!onIsland(-340,-30)&&!onIsland(-200,140)&&!onIsland(-150,-235),'sea beyond the new west, south-west and north-west coasts');
assert(Math.min(...ISLAND_SHORE.map(p=>p.x))>=sim.ISLAND_BOUNDS.minX,'ISLAND_BOUNDS takes in the new coast');
assert(sim.FLIGHT_BOUNDS.minX<=sim.ISLAND_BOUNDS.minX-50,'open sea west of the West Beach is flyable');
// The lawn keeps a West Beach of sand (not 40 m of bare sand): at the stadium's latitude the grass starts 12–25 m in from the coast.
{let coast=-400;while(!onIsland(coast,S.z))coast+=.25;const inside=(x,z)=>{let c=false;for(let i=0,j=INTERIOR_GRASS.length-1;i<INTERIOR_GRASS.length;j=i++){const a=INTERIOR_GRASS[i],b=INTERIOR_GRASS[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)c=!c;}return c;};
 let grass=coast;while(!inside(grass,S.z))grass+=.25;assert(grass-coast>=12&&grass-coast<=25,`West Beach sand ${(grass-coast).toFixed(1)} m`);}

// 2. The built town.
const world=load('lib/town/world.ts').buildTown(new T.Scene());
const blocked=(x,z)=>sim.blocked(x,z,world.obstacles,.32);
for(const [x,z,what] of [[(P.minX+P.maxX)/2,(P.minZ+P.maxZ)/2,'plaza centre'],[-55,S.z,'plaza east end (from the x -45 street)'],[G.x+4,G.z,'in front of the gate'],[G.x-1,G.z,'through the gate'],[S.x,S.z,'centre spot'],[S.x+20,S.z-40,'on the pitch']])assert(!blocked(x,z),what+' is open');
assert(blocked(S.x-S.bowlW/2+4,S.z),'the west stand is solid (phase 2 makes its concourse walkable)');
assert(blocked(PARK_POND.x,PARK_POND.z),'the pond is not walkable');
// Nothing grows on the pitch or in the stands: no tree/palm asset inside the bowl.
const trees=world.assets.filter(a=>a.kind==='tree'||a.kind==='palm');
assert(!trees.some(a=>L.inStadiumFootprint(a.x,a.z,2)),'no trees in the bowl');
assert(!trees.some(a=>a.x>P.minX-6&&a.x<P.maxX&&a.z>P.minZ-6&&a.z<P.maxZ+6),'no trees on the plaza');
const st=world.westPark;
assert(st.trees>=250&&st.trees<=340,'park trees '+st.trees);assert(st.palms>=6&&st.palms<=10,'West Beach palms '+st.palms);assert.equal(st.flags,14,'plaza flags');
// CORNER DELI and PRAÇA HOMES made way for the plaza; their neighbours stay.
const names=new Set(world.buildings.map(b=>b.name));
assert(!names.has('CORNER DELI')&&!names.has('PRAÇA HOMES')&&names.has('MAKERS HOUSE')&&names.has('THE GROCER'),'plaza replaced two west houses');

// 3. Draw budget: everything west of x -100 is in the 50 m chunk batches (cx ≤ -3), all behind the one west region gate.
const scene=world.dynamicScenery.parent;const chunks=scene.children.filter(o=>o.isMesh&&o.name.startsWith('island-chunk-')&&+o.name.slice('island-chunk-'.length).split(':')[0]<=-3);
let tris=0;for(const m of chunks){const g=m.geometry;tris+=(g.index?g.index.count:g.getAttribute('position').count)/3;}
assert.equal(chunks.length,world.westChunkCount,'every west chunk is gated');
console.log(`west chunks (draw calls when all in view): ${chunks.length}; triangles: ${Math.round(tris)}; trees ${st.trees}, palms ${st.palms}, flags ${st.flags}, hedges ${st.hedges}, beds ${st.beds}`);
assert(chunks.length<=90,'west draw calls bounded: '+chunks.length);assert(tris<=150000,'west triangles bounded: '+Math.round(tris));
assert(!scene.children.some(o=>o.name==='park-pond'),'the pond is batched into its chunk (no loose mesh)');

// 4. The map draws the stadium, the park and the plaza.
const map=fs.readFileSync(path.join(base,'components/IslandOverview.tsx'),'utf8');
assert(/data-west-stadium="bowl"/.test(map)&&/data-west-stadium="park"/.test(map)&&/>STADIUM</.test(map)&&/STADIUM PLAZA/.test(map),'map shows the stadium');
assert(!/lib\/town\/westPark'/.test(map),'the map imports the three-free layout module');
console.log('west stadium phase 1: ok');
})().catch(e=>{console.error(e);process.exit(1);});
