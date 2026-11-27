// Grounding (Nov 26 2026, lib/town/grounding.ts): every building, tree and machine has contact shade, the decal only darkens and faces
// up, no sand drift sits on the track bed or in front of a machine, the build is deterministic, and ?ground=0 builds nothing.
// usage: node tests/grounding.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const fresh=()=>{const cache=new Map(),gradient={addColorStop(){}};
 const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
 const context=vm.createContext({console:{...console,log(){}},Math,Set,Map,WeakMap,Date,JSON,Promise,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,Infinity,NaN,
  window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage:{getItem:()=>null,setItem(){},removeItem(){}},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
 function load(name){let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
  if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  const r=id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('@/')?load(id.slice(2)):id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8')):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
  vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
 return load;};
const build=(on)=>{const load=fresh(),G=load('lib/town/grounding.ts');G.setGrounding(on);const scene=new T.Scene(),world=load('lib/town/world.ts').buildTown(scene);
 let decal=null;scene.traverse(o=>{if(o.name==='island-grounding')decal=o;});return {G,world,decal,load};};
const A=build(true),s=A.G.groundingStats.value;
assert.ok(s,'stats recorded');assert.ok(A.decal,'one decal mesh');assert.equal(A.decal.userData.ownDraw,true,'decal keeps its own draw (not batched)');
assert.equal(A.decal.castShadow,false,'decal casts no shadow');assert.equal(A.decal.material.depthWrite,false,'decal writes no depth');
// coverage: every building, tree and vending machine has a foot
const feet=A.G.groundingStats.feet,load=A.load,VM=load('lib/town/vendingCatalog.ts').VENDING_MACHINES;
assert.equal(s.byKind.machine,VM.length,'every vending machine');assert.ok(s.byKind.tree>=200,'trees: '+s.byKind.tree);assert.ok(s.byKind.palm>=100,'palms: '+s.byKind.palm);
assert.ok(s.byKind.building>=60,'buildings: '+s.byKind.building);assert.equal(s.byKind.house,3,'three station houses on the ground (South stands on its platform; Summit is not built)');assert.equal(s.byKind.platform,4,'four platforms');
for(const m of VM)assert.ok(feet.some(f=>f.kind==='machine'&&Math.hypot(f.x-m.x,f.z-m.z)<.01),'machine '+m.id);
// the decal only darkens (multiplier 0.3 .. 1), every triangle faces up, budget
const col=A.decal.geometry.getAttribute('color').array,pos=A.decal.geometry.getAttribute('position').array,idx=A.decal.geometry.index.array;
for(let i=0;i<col.length;i++)assert.ok(col[i]>=.3&&col[i]<=1,'multiplier in range');
for(let t=0;t<idx.length;t+=3){const a=idx[t]*3,b=idx[t+1]*3,c=idx[t+2]*3,ny=(pos[b+2]-pos[a+2])*(pos[c]-pos[a])-(pos[b]-pos[a])*(pos[c+2]-pos[a+2]);assert.ok(ny>=-1e-9,'faces up');}
assert.ok(s.decalTriangles<32000,'decal budget '+s.decalTriangles);assert.ok(s.detailTriangles<6000,'detail budget '+s.detailTriangles);
// drifts: never on the track bed, never in front of a machine
const track=load('lib/town/trainTrack.ts');
for(const d of A.G.sandDrifts.list)for(const t of [0,.5,1]){const x=d.ax+d.ux*d.len*t+d.ox*d.w*.5,z=d.az+d.uz*d.len*t+d.oz*d.w*.5;
 assert.ok(!track.trackNearest(x,z,1.6),'drift off the track bed '+x.toFixed(1)+','+z.toFixed(1));
 for(const m of VM)assert.ok(Math.hypot(x-(m.x+Math.sin(m.yaw)*.7),z-(m.z+Math.cos(m.yaw)*.7))>.8,'drift clear of '+m.id+"'s use spot");}
// deterministic
const B=build(true);assert.deepEqual(Array.from(B.decal.geometry.getAttribute('position').array),Array.from(pos),'same decal every build');
assert.equal(JSON.stringify(B.G.groundingStats.value.pieces),JSON.stringify(s.pieces),'same detail every build');
// ?ground=0: nothing
const C=build(false);assert.equal(C.decal,null,'no decal when off');assert.equal(C.G.groundingStats.value,null,'nothing built when off');
console.log('grounding ok',JSON.stringify({feet:s.feet,decal:s.decalTriangles,detail:s.detailTriangles,pieces:s.pieces,ms:s.ms}));
})().catch(e=>{console.error(e);process.exit(1);});
