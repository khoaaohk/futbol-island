// Stadium Park orchards (Nov 13 2026, owner N3): small orchards by the park trails and the plaza's edges, off the paths and paving,
// clear of the signs, the pond and the lawns, baked into the island chunks (no draw of their own) with trunk colliders; the fruit
// hangs on the canopy (one instanced mesh); walking up picks it into the market basket with the forage save and cap rules; a picked
// fruit regrows on a timer. usage: node tests/stadium-orchard.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}},store=new Map();
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,performance,Float32Array,Float64Array,Uint8Array,Uint16Array,Uint32Array,Int8Array,Int32Array,Array,Object,Number,String,Error,Symbol,Infinity,NaN,
 window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const r=id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('@/')?load(id.slice(2)):id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8')):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
const L=load('lib/town/westParkLayout.ts'),O=load('lib/town/stadiumOrchard.ts'),F=load('lib/graphics/stadiumOrchardFruit.ts'),SF=load('lib/town/summitForage.ts'),{insideObstacle}=load('lib/town/simulation.ts');

// ---- 1. Placement, in the real built town.
const scene=new T.Scene(),world=load('lib/town/world.ts').buildTown(scene),trees=world.westPark.orchard;
assert(trees.length>=28&&trees.length<=32,`about double the first 14: small orchards round the bowl and the park (${trees.length} trees)`);
// Save compatibility (Nov 13 2026): the first 14 trees keep their ids, forms, fruit and order (a save's picks are keyed by id); the
// newer orchards' trees are appended after them, with ids of their own.
{const first=['tree--122--71','tree--127--71','tree--117--71','tree--124--75','tree--124-13','tree--129-13','tree--119-13','tree--126-9','tree--112-99','tree--117-99','tree--187-82','tree--192-82','tree--189-78','tree--189-86'];
 assert.equal(trees.slice(0,14).map(t=>t.id).join(),first.join(),'the first 14 trees keep their ids and order');
 assert.equal(trees.slice(0,14).map(t=>t.fruit+'/'+t.form).join(),O.ORCHARD_LEGACY.map(t=>t.fruit+'/'+t.form).join(),'and their fruit and forms');
 assert.equal(new Set(trees.map(t=>t.id)).size,trees.length,'every id is unique');
 for(const t of trees.slice(0,14)){const l=O.ORCHARD_LEGACY.find(u=>u.id===t.id);assert(Math.hypot(l.x-t.x,l.z-t.z)<8,t.id+': replanted (if at all) near its old spot');}
 const sides=new Set(trees.map(t=>Math.abs(t.x-L.STADIUM.x)>Math.abs(t.z-L.STADIUM.z)*.8?(t.x<L.STADIUM.x?'west':'east'):(t.z<L.STADIUM.z?'north':'south')));
 assert(sides.size>=4,'orchards on every side of the stadium: '+[...sides]);}
const clusters=new Set(trees.map(t=>O.ORCHARD_CENTRES.findIndex(c=>Math.hypot(c.x-t.x,c.z-t.z)<10)));assert(clusters.size>=8&&!clusters.has(-1),'in several clusters by the trails and the plaza');
for(const t of trees){const w=`${t.id}`;
 assert(!L.onParkPaving(t.x,t.z,2),w+': off the paths and paving');assert(L.onGrass(t.x,t.z),w+': on the lawn');
 for(const [sx,sz] of L.PARK_SIGNS)assert(Math.hypot(t.x-sx,t.z-sz)>=8,w+': clear of the signs');
 assert(!L.inPond(t.x,t.z,L.POND_RIM+5),w+': clear of the pond');
 assert(!L.PARK_LAWNS.some(l=>Math.hypot((t.x-l.x)/(l.rx+2),(t.z-l.z)/(l.rz+2))<1),w+': clear of the lawns');
 assert(world.obstacles.some(o=>insideObstacle(t.x,t.z,o,0)),w+': has a trunk collider');
 assert(!world.obstacles.some(o=>o.w>1&&Math.abs(o.x-t.x)<o.w/2+1.5&&Math.abs(o.z-t.z)<o.d/2+1.5),w+': clear of beds, benches and signs');
 assert(!trees.some(u=>u!==t&&Math.hypot(u.x-t.x,u.z-t.z)<4),w+': spaced like an orchard');
 assert(!world.assets.some(a=>a.kind==='tree'&&!trees.some(u=>u.x===a.x&&u.z===a.z)&&Math.hypot(a.x-t.x,a.z-t.z)<3),w+': the park trees keep clear');
 assert(world.propSpecs.some(s=>s.kind==='tree'&&t.x>=s.min.x-.5&&t.x<=s.max.x+.5&&t.z>=s.min.z-.5&&t.z<=s.max.z+.5),w+': a kicked ball rustles it');}
assert.deepEqual(trees.map(t=>t.id),O.stadiumOrchardTrees().filter(t=>trees.some(u=>u.id===t.id)).map(t=>t.id),'deterministic');
assert(world.westPark.orchardTriangles<trees.length*120,`modest triangles (${world.westPark.orchardTriangles})`);
{let own=0;scene.traverse(o=>{if(o.isMesh&&/orchard/.test(o.name))own++;});assert.equal(own,0,'the trees are baked into the chunks (no mesh of their own)');}
for(const t of trees)assert(SF.sanitizeForage({version:1,day:SF.localForageDay(Date.now()),today:1,tip:false,trees:{[t.id]:{n:1,t:Date.now()}}},Date.now()).trees[t.id],t.id+': its id survives the forage save rules');

// ---- 2. The fruit and the picking.
let clock=Date.parse('2026-11-13T10:00:00'),basket=[],full=false,saved=null,summit=null;
const orch=F.createStadiumOrchard(new T.Scene(),{trees,gather:id=>{if(full)return 0;basket.push(id);return 1;},now:()=>clock,read:()=>saved,write:v=>{saved=v;},readSummit:()=>summit});
assert(orch.mesh.isInstancedMesh&&orch.mesh.count===trees.length*O.ORCHARD_RULES.perTree,'one instanced mesh for all the fruit');
const {orchardRig}=load('lib/town/summitOrchard.ts');
trees.forEach((t,i)=>{const rig=orchardRig(O.orchardPlanOf(t)),c=rig.crown;for(let k=0;k<3;k++){const h=orch.hang[i*3+k];
 assert(h.y>c.y-c.ry-.3&&Math.hypot(h.x-c.x,h.z-c.z)<c.rx+.7,`${t.id}: fruit ${k} is on the canopy`);}});
const inp=o=>({dt:1/60,x:trees[0].x+1.5,z:trees[0].z,y:0,onFoot:true,shown:true,reduced:false,...o});
orch.update(inp({shown:false}));assert(!orch.mesh.visible&&orch.stats.idle===1,'hidden off the west region');
orch.update(inp({x:trees[0].x+40}));assert(orch.mesh.visible,'shown near the orchards');assert.equal(orch.stats.picks,0,'nothing picked from afar');
for(let i=0;i<180;i++)orch.update(inp());
assert.equal(orch.stats.picks,3,'walking up picks every fruit, one at a time');assert.deepEqual(basket,[trees[0].fruit,trees[0].fruit,trees[0].fruit],'into the market basket');
assert.equal(orch.hangingOn(0),0);assert(JSON.parse(saved).trees[trees[0].id].n===3,'the save remembers');
assert.equal(SF.forageStore.get().note,`+1 ${load('lib/town/market/goods.ts').goodById(trees[0].fruit).name} in your basket`,'the forage note');
for(let i=0;i<120;i++)orch.update(inp({onFoot:false,x:trees[0].x+20}));
clock+=O.ORCHARD_RULES.regrowMin*60000+1000;for(let i=0;i<70;i++)orch.update(inp({x:trees[0].x+20}));assert.equal(orch.hangingOn(0),1,'one grows back on the timer');
const re=F.createStadiumOrchard(new T.Scene(),{trees,gather:()=>1,now:()=>clock,read:()=>saved,write(){}});assert.equal(re.hangingOn(0),1,'and after a reload');re.dispose();
clock=Date.parse('2026-11-14T08:00:00');for(let i=0;i<70;i++)orch.update(inp({x:trees[0].x+20}));assert.equal(orch.hangingOn(0),3,'all back the next day');
// Basket full: the fruit stays on the tree. The day's cap is shared with Summit Isle.
full=true;for(let i=0;i<60;i++)orch.update(inp());assert.equal(orch.hangingOn(0),3,'basket full: nothing picked');full=false;
summit=JSON.stringify({version:1,day:SF.localForageDay(clock),today:SF.FORAGE.dailyCap,tip:true,trees:{}});
for(let i=0;i<60;i++)orch.update(inp());assert.equal(orch.hangingOn(0),3,"Summit Isle's picks count toward today's cap");summit=null;
for(let i=0;i<60;i++)orch.update(inp({onFoot:false}));assert.equal(orch.hangingOn(0),3,'riding past picks nothing');
for(let i=0;i<60;i++)orch.update(inp({reduced:true}));assert(orch.hangingOn(0)<3,'reduced motion still picks (no flight)');
orch.dispose();
// ---- 3. Town wiring.
const town=fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8');
assert(/createStadiumOrchard\(scene,\{trees:world\.westPark\.orchard,gather:id=>islandMarket\.gather\(id\)/.test(town)&&/orchard\.update\(\{/.test(town)&&/disposers\.add\(\(\)=>orchard\.dispose\(\)\)/.test(town),'wired into Town');
console.log(`stadium orchard: ok (${trees.length} trees in ${clusters.size} orchards, ${world.westPark.orchardTriangles} triangles baked, ${trees.length*3} fruit)`);
})().catch(e=>{console.error(e);process.exit(1);});
