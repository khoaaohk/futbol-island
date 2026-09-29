// Manhole covers open ONLY from a flight drop (user, Sep 28 2026): walking, scooter, bike, moped and the pickup truck roll over a
// cover and it stays closed, at any speed and frame rate; ramp landings, roof falls and a grounded jetpack do not open it either.
// A jetpack or parachute drop inside the ring still opens it. Headless: loads lib/graphics/coinHunt.ts with three in a vm.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
function fixture(){
 const cache=new Map(),storage=new Map(),gradient={addColorStop(){}};
 const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
 const context=vm.createContext({console,Math,Set,Map,performance,Float32Array,Uint8Array,window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
 function load(name){const file=path.resolve(base,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id));return mod.exports;}
 return {load};
}
function hunt(){
 const f=fixture(),q=f.load('lib/town/coinQuest.ts'),p=f.load('lib/town/coinProgress.ts'),{createCoinHunt}=f.load('lib/graphics/coinHunt.ts'),{TRAVEL_MODES}=f.load('lib/town/travelModes.ts');
 const near=[],h=createCoinHunt(new T.Scene(),()=>{},t=>near.push(t));h.connectCollisions([],[]);
 const covers=q.COIN_QUEST.filter(s=>s.manhole);
 return {h,covers,near,TRAVEL_MODES,open:id=>p.readCoinProgress().revealed.includes(id)};
}
const TRUCK_BED=.98;// the pickup bed height the rider reports (coinQuest truck spots sit at y .98)
// Straight past the cover centre (offset 0) and just inside the 1.5 m rim, at full speed. Town clamps a frame to 0.05 s; 15 fps
// here steps the full 1/15 s so a fast ride jumps up to 1.9 m between frames.
function ride(t,cover,{speed,y=0,fps=60,offset=0,flying=false,airRamp=null,parachuting=false,angle=0,to=20}){
 const dt=1/fps,dx=Math.cos(angle),dz=Math.sin(angle),p={x:0,y,z:0};let minD=1e9;
 for(let d=-20;d<=to;d+=speed*dt){p.x=cover.x+dx*d-dz*offset;p.z=cover.z+dz*d+dx*offset;t.h.update(dt,p,true,false,airRamp,parachuting,flying);minD=Math.min(minD,Math.hypot(p.x-cover.x,p.z-cover.z));}
 return minD;
}

// 1. Every ground ride at full speed, through the centre and just off it, at 60, 30 and 15 fps, from four headings: closed.
{
 const t=hunt(),rides=[['walk',t.TRAVEL_MODES.walk.maxSpeed],['walk sprint',6],['scooter',t.TRAVEL_MODES.scooter.maxSpeed],['bike',t.TRAVEL_MODES.bike.maxSpeed],['moped',t.TRAVEL_MODES.moped.maxSpeed],['truck',18,TRUCK_BED],['truck boost',30,TRUCK_BED]];
 let passes=0;
 for(const [k,[name,speed,y=0]] of rides.entries())for(const fps of [60,30,15])for(const offset of [0,.9,-1.3])for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5]){
  const cover=t.covers[(k*7+fps+Math.round(offset*10))%t.covers.length],minD=ride(t,cover,{speed,y,fps,offset,angle});
  assert(minD<1.5,`${name} really crosses the cover (${minD.toFixed(2)} m)`);
  assert(!t.open(cover.id),`${name} at ${speed} m/s, ${fps} fps, ${offset} m off centre leaves ${cover.id} closed`);
  assert.equal(t.h.manholeTarget(),null,`${name}: no landing ring on the ground`);passes++;}
 assert.equal(t.h.stats.reveals,0,'no cover opened by any ride');
 const c=t.covers[4];t.h.update(.05,{x:c.x+2,y:0,z:c.z},true,false,null,false,false);
 assert.equal(t.near.at(-1),'A football manhole cover! Fly over it, then drop down onto it to open it.','the ground hint tells kids to fly and drop');
 assert(!t.near.some(s=>/Step onto/i.test(s)),'no "step onto it" hint');t.h.dispose();
 console.log(`PASS ${passes} ground passes (walk, scooter, bike, moped, truck; 60/30/15 fps; centre and off-centre; four headings): every cover stays closed`);
}

// 2. Ramp jumps and roof falls onto a cover (Town calls land() without fromFlight) stay closed, even after an earlier fly-over armed it.
{
 const t=hunt(),a=t.covers[1],b=t.covers[2];
 ride(t,a,{speed:20,y:1.6,airRamp:'roof-ramp-finale'});t.h.land({x:a.x,y:0,z:a.z});assert(!t.open(a.id),'ramp air over the cover and a ramp landing on it: closed');
 for(let y=6;y>=0;y-=.5)t.h.update(1/30,{x:b.x+.3,y,z:b.z},true,false,null,false,false);t.h.land({x:b.x+.3,y:0,z:b.z});assert(!t.open(b.id),'a roof fall onto the cover: closed');
 t.h.update(.05,{x:b.x,y:25,z:b.z},true,false,null,false,true);t.h.update(.05,{x:b.x+6,y:25,z:b.z},true,false,null,false,true);// fly-over arms it
 ride(t,b,{speed:20});t.h.land({x:b.x,y:0,z:b.z});assert(!t.open(b.id),'armed by a fly-over, then a bike and a ramp/roof landing: still closed');
 assert.equal(t.h.stats.reveals,0);t.h.dispose();
 const town=fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8');
 assert(/if\(rampStep\.landed\)\{[^\n]*?coinHunt\.land\(\{x:location\.x,y:rooftop\.surface\(location\.x,location\.z\),z:location\.z\}\);/.test(town),'ramp landings call land() without fromFlight');
 assert(/if\(rooftop\.state\.impact\)\{coinHunt\.land\(\{x:location\.x,y:rooftop\.state\.height,z:location\.z\}\);/.test(town),'roof impacts call land() without fromFlight');
 assert.equal((town.match(/coinHunt\.land\([^)]*\},true\)/g)||[]).length,1,'only the flight landingImpact passes fromFlight');
 assert(/function landingImpact\(height:number\)\{\s*coinHunt\.land\(\{x:location\.x,y:height,z:location\.z\},true\);/.test(town),'the flight landing is the one fromFlight call');
 const src=fs.readFileSync(path.join(base,'lib/graphics/coinHunt.ts'),'utf8');assert(!/walkOpen/.test(src),'no walk/ride opening path');
 console.log('PASS ramp jumps and roof falls onto a cover stay closed, even after a fly-over armed it; only the flight landing passes fromFlight');
}

// 3. A grounded jetpack (taking off, or skimming the road below the 2.5 m arming height) never arms or opens a cover.
{
 const t=hunt(),c=t.covers[6];
 for(const fps of [60,15])ride(t,c,{speed:34,y:.4,fps,flying:true});
 for(let y=0;y<2.4;y+=.2)t.h.update(1/60,{x:c.x,y,z:c.z},true,false,null,false,true);
 t.h.land({x:c.x,y:0,z:c.z},true);assert(!t.open(c.id),'grounded jetpack over and on the cover: closed (never above the arming height)');t.h.dispose();
 console.log('PASS grounded jetpack: skims and take-offs below 2.5 m never open a cover');
}

// 4. The flight rule is unchanged: fly over (also fast, at 15 fps), then drop inside the ring → opens once. Parachute too.
{
 const t=hunt(),c=t.covers[8],d=t.covers[9],e=t.covers[11];
 ride(t,c,{speed:34,y:20,fps:15,flying:true,to:2});// comes down just past the centre
 t.h.land({x:c.x+1.2,y:0,z:c.z-.8},true);assert(t.open(c.id),'jetpack fly-over at 15 fps then a drop inside the ring opens it');
 t.h.update(.05,{x:d.x,y:22,z:d.z},true,false,null,false,true);t.h.land({x:d.x+3.9,y:0,z:d.z},true);assert(!t.open(d.id),'a drop outside the 3.5 m ring misses');
 t.h.update(.05,{x:e.x,y:9,z:e.z},true,false,null,true,true);t.h.land({x:e.x+.5,y:0,z:e.z},true);assert(t.open(e.id),'a parachute drop inside the ring opens it');
 assert.equal(t.h.stats.reveals,2);t.h.dispose();
 console.log('PASS jetpack (fast, 15 fps) and parachute drops inside the ring open the cover; a drop outside the ring misses');
}
})().catch(e=>{console.error(e);process.exit(1);});
