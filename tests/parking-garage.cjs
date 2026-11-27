// Palm Street parking garage (Nov 27 2026, owner: "this inside below the futsal doesn't make sense … should be a parking garage with
// cars"). Run: node tests/parking-garage.cjs
//  1. No grass inside: a concrete floor covers the whole footprint above the lawn, and no lawn / garden piece stands inside it.
//  2. It reads as a garage: bays (≥ 45, numbered), columns with safety sleeves, wheel stops, barrier, booth, height bar, signs
//     (P on the street, PARKING, EXIT, MAX 2.1 m), ceiling strips, parked cars.
//  3. The way in: the apron in front of the door is clear of colliders; the only collider in the doorway is the barrier arm;
//     the side walls and the court's perimeter colliders are unchanged.
//  4. Heat: four draws, no lights, no shadow casters, under the triangle budget.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..');
let failed=0;const ok=async(name,fn)=>{try{await fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
// Nov 27 2026: 21,002 measured after merging the soft sweep (its 14-sided car wheels + rounded pickup bed reach the 7 parked cars); budget 22k.
const TRIANGLE_BUDGET=22000;
async function buildWorld(){
 const req=require('node:module').createRequire(ROOT+'/package.json'),T=req('three');
 const utils=await import(ROOT+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
 const cache=new Map(),gradient={addColorStop(){}};
 const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
 const context=vm.createContext({console,Math,Set,Map,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage:{getItem:()=>null,setItem(){}},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
 const resolve=(file,id)=>{const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(file),id);for(const e of ['.ts','.tsx','/index.ts',''])if(fs.existsSync(base+e)&&fs.statSync(base+e).isFile())return base+e;throw new Error('cannot resolve '+id);};
 function load(name){const file=path.resolve(ROOT,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):req(id));
  cache.set(file,mod.exports);return mod.exports;}
 const scene=new T.Scene(),meshes=new Set(),gen=load('lib/town/world.ts').buildTownSteps(scene);let world;
 for(;;){const r=gen.next();scene.traverse(o=>{if(o.isMesh&&!String(o.name).startsWith('island-chunk-'))meshes.add(o);});if(r.done){world=r.value;break;}}
 return {T,load,world,scene,meshes:[...meshes]};
}
(async()=>{
const {T,load,world,scene,meshes}=await buildWorld();
const P=load('lib/town/parkingGarage.ts'),G=P.GARAGE,E=P.GARAGE_ENTRANCE;
// the batching pass merges these into its chunks: measure them as built (the generator steps' snapshot)
const NAMES=['parking-garage-body','parking-garage-floor','parking-garage-signs','parking-garage-lights'],own=NAMES.map(n=>meshes.find(m=>m.name===n)),root={getObjectByName:n=>own[NAMES.indexOf(n)]};
await ok('garage is in the world with its four meshes',()=>{for(const n of NAMES)assert.ok(root.getObjectByName(n),n);});
await ok('no grass inside: the floor covers the footprint above the lawn; no lawn / garden piece inside',()=>{
 const f=root.getObjectByName('parking-garage-floor');f.updateWorldMatrix(true,false);const b=new T.Box3().setFromObject(f);
 assert.ok(b.min.x<=G.minX+.01&&b.max.x>=G.maxX-.01&&b.min.z<=G.minZ+.01&&b.max.z>=G.maxZ-.01,'floor spans the inside');
 assert.ok(b.min.y>0&&b.min.y<.2,'floor sits just over the ground ('+b.min.y+')');
 assert.ok(!f.material.map||f.material.map.isTexture,'painted floor');
 const lawn=['#7a9e67','#8b9e6b','#5b8c5c'];
 for(const m of meshes){if(!m.material||Array.isArray(m.material)||!m.material.color)continue;const hex='#'+m.material.color.getHexString();if(!lawn.includes(hex))continue;
  const bb=new T.Box3().setFromObject(m);if(bb.max.y>-.2&&bb.min.y<1.5&&bb.min.x>G.minX&&bb.max.x<G.maxX&&bb.min.z>G.minZ&&bb.max.z<G.maxZ)assert.fail('lawn piece inside the garage: '+hex+' '+m.geometry.type+' '+m.name+' '+JSON.stringify([bb.min,bb.max].map(v=>[v.x,v.y,v.z].map(n=>+n.toFixed(2))))+' parent '+(m.parent&&m.parent.name));}
 assert.ok(world.surfaceAreas.some(a=>a.kind==='garage'),'garage surface area (no ground decals inside)');
});
await ok('reads as a garage: bays, columns, stops, barrier, booth, bar, signs, strips, cars',()=>{
 assert.ok(P.GARAGE_BAYS.length>=45,'bays '+P.GARAGE_BAYS.length);assert.equal(new Set(P.GARAGE_BAYS.map(b=>b.n)).size,P.GARAGE_BAYS.length,'numbered');
 for(const b of P.GARAGE_BAYS)assert.ok(b.x>G.minX&&b.x<G.maxX&&b.z>G.minZ&&b.z<G.maxZ,'bay inside');
 assert.ok(P.GARAGE_COLUMNS.length>=8,'columns');
 for(const l of ['PARKING','EXIT','2.1 m','P'])assert.ok(P.GARAGE_LABELS.includes(l),l);
 const src=fs.readFileSync(path.join(ROOT,'lib/town/parkingGarage.ts'),'utf8');
 for(const t of ["'PARKING'","'EXIT'","'2.1 m'","buildVehicleGeometry","YELLOW","Wheel stops","Booth","Barrier","Height bar"])assert.ok(src.includes(t),t);
 const signs=root.getObjectByName('parking-garage-signs');assert.ok(signs.material.map,'sign atlas');assert.ok(signs.geometry.getAttribute('position').count>=20,'≥ 5 sign planes');
 const lights=root.getObjectByName('parking-garage-lights');assert.ok(lights.material.emissiveIntensity>0&&lights.material.userData.nightGlow>1,'strips glow, brighter at night');
 const wsrc=fs.readFileSync(path.join(ROOT,'lib/town/world.ts'),'utf8');assert.ok(/sign\('P',1\.5,1\.6,23,2,46\.65/.test(wsrc),'street-side P sign kept');
});
await ok('the way in: apron clear, only the barrier in the doorway, walls kept',()=>{
 const doorL=E.x-E.w/2,doorR=E.x+E.w/2,hit=(o,x0,x1,z0,z1)=>o.x+o.w/2>x0&&o.x-o.w/2<x1&&o.z+o.d/2>z0&&o.z-o.d/2<z1;
 const apron=world.obstacles.filter(o=>hit(o,doorL+.1,doorR-.1,46.3,E.apronTo));assert.equal(apron.length,0,'apron colliders: '+JSON.stringify(apron));
 const door=world.obstacles.filter(o=>hit(o,doorL+.1,doorR-.1,44,46.3));assert.equal(door.length,1,'one collider in the doorway: '+JSON.stringify(door));
 assert.ok(Math.abs(door[0].z-P.GARAGE_BARRIER.z)<.01,'it is the barrier');
 for(const [x,z] of [[-3,18],[25,20.5],[11,-10]])assert.ok(world.obstacles.some(o=>o.x===x&&o.z===z),'wall '+x+','+z);
 assert.ok(world.obstacles.some(o=>hit(o,-2.9,2.6,45.9,46.1))&&world.obstacles.some(o=>hit(o,9.2,24.9,45.9,46.1)),'street-side walls either side of the door');
 const V=load('lib/town/venues.ts');assert.equal(V.parkingSurfaceHeight(11,18),6,'court height unchanged');assert.equal(V.parkingSurfaceHeight(31,20),6*(45-20)/50,'ramp unchanged');
});
await ok('heat: 4 draws, no lights, no shadow casters, triangles under budget',()=>{
 let tris=0,lights=0;scene.traverse(o=>{if(o.isLight&&o.name.includes('garage'))lights++;});own.forEach(o=>{{assert.equal(o.castShadow,false,o.name+' casts');const g=o.geometry;tris+=(g.index?g.index.count:g.getAttribute('position').count)/3;}});
 assert.equal(lights,0);assert.equal(own.length,4);
 console.log('     garage triangles '+tris+' (budget '+TRIANGLE_BUDGET+')');assert.ok(tris<TRIANGLE_BUDGET,'triangles '+tris);
});
console.log(failed?failed+' failed':'all passed');process.exit(failed?1:0);
})();
