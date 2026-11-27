// Fruit stays in its own tree's crown (polish Nov 27 2026, owner shot 195: "the fruits on the tree are floating in the sky" on the
// Coral Cay farm: the orchard fruit was lifted twice onto the raised ground, ~2.5 m over its crown). Two parts, run for BOTH tiers
// (normal, and Battery saver, which builds fewer broadleaf clumps):
// 1. The real town, built headless: every 'tree' / 'palm' prop (fruit is part of its tree's prop) is ONE connected body: its triangles,
//    sampled every <= 0.2 m into a 0.3 m voxel grid, form 26-connected pieces, and no SMALL piece (< 15 % of the prop) hangs off the
//    ground apart from the rest (a pine's trunk inside its crown's shell is fine: it stands on the ground).
// 2. Summit Isle's round trees (broadleaf kit + size variety + lean): every fruit slot, kind and day lies inside the drawn crown's
//    box (+ the fruit's radius) and touches its real leaves (centre within 0.6 r of the nearest leaf triangle).
// usage: node tests/fruit-crown-bounds.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
function loader(low){
 const cache=new Map(),gradient={addColorStop(){}},store={'fi2-battery-saver':low?'on':null};
 const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
 const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,performance,Float32Array,Float64Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,Infinity,NaN,
  window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false}),location:{search:''}},localStorage:{getItem:k=>store[k]??null,setItem(){},removeItem(){}},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
 function load(name){
  let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
  if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  const r=id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('@/')?load(id.slice(2)):id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8')):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
  vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
 return load;}

const A=new T.Vector3(),B=new T.Vector3(),C=new T.Vector3(),P=new T.Vector3();
/** Number of 26-connected pieces of a prop (its vertex runs' triangles sampled into a 0.3 m grid). */
const spec_comps=s=>s.comps.map(b=>'['+b.slice(0,6).map(v=>v.toFixed(1)).join(' ')+']').join(' ');
const INDEX=new Map();// position attribute -> its geometry's index (the batches are indexed): triangles = index triples inside the run
function triangles(p){const idx=INDEX.get(p.attribute),out=[];
 if(!idx){for(let v=p.start;v+2<p.start+p.count;v+=3)out.push(v,v+1,v+2);return out;}
 for(let i=0;i+2<idx.count;i+=3){const a=idx.getX(i),b=idx.getX(i+1),c=idx.getX(i+2);if(a>=p.start&&a<p.start+p.count&&b>=p.start&&b<p.start+p.count&&c>=p.start&&c<p.start+p.count)out.push(a,b,c);}return out;}
function pieces(spec){const cell=.3,grid=new Set(),key=(x,y,z)=>`${Math.floor(x/cell)},${Math.floor(y/cell)},${Math.floor(z/cell)}`;
 for(const p of spec.parts){const a=p.attribute,tr=triangles(p);for(let q=0;q<tr.length;q+=3){A.fromBufferAttribute(a,tr[q]);B.fromBufferAttribute(a,tr[q+1]);C.fromBufferAttribute(a,tr[q+2]);
  const n=Math.max(1,Math.ceil(Math.max(A.distanceTo(B),B.distanceTo(C),C.distanceTo(A))/.2));
  for(let i=0;i<=n;i++)for(let j=0;j<=n-i;j++){const u=i/n,w=j/n;P.set(A.x+(B.x-A.x)*u+(C.x-A.x)*w,A.y+(B.y-A.y)*u+(C.y-A.y)*w,A.z+(B.z-A.z)*u+(C.z-A.z)*w);grid.add(key(P.x,P.y,P.z));}}}
 const seen=new Set();let n=0;spec.comps=[];
 for(const k of grid){if(seen.has(k))continue;n++;const st=[k];seen.add(k);const bb=[1e9,1e9,1e9,-1e9,-1e9,-1e9];spec.comps.push(bb);while(st.length){const [x,y,z]=st.pop().split(',').map(Number);
  bb[6]=(bb[6]||0)+1;bb[0]=Math.min(bb[0],x*cell);bb[1]=Math.min(bb[1],y*cell);bb[2]=Math.min(bb[2],z*cell);bb[3]=Math.max(bb[3],x*cell+cell);bb[4]=Math.max(bb[4],y*cell+cell);bb[5]=Math.max(bb[5],z*cell+cell);
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++){const q=`${x+dx},${y+dy},${z+dz}`;if(grid.has(q)&&!seen.has(q)){seen.add(q);st.push(q);}}}}
 // A separate piece is fine when it is a big part of the prop (a pine's crown round its trunk: the skirt is a shell the trunk stands
 // inside) or stands on the ground (the trunk under such a crown); a small piece off the ground is something floating (fruit).
 const total=grid.size,foot=Math.min(...spec.comps.map(b=>b[1]));
 return 1+spec.comps.filter(b=>b[6]<.15*total&&b[1]>foot+.3).length;}

for(const low of [false,true]){const tier=low?'battery saver':'normal';
 // ---- Part 1: the real town's tree and palm props (the merged buffers must be non-indexed runs of triangles: they are, world.ts batching)
 {const load=loader(low),scene=new T.Scene(),world=load('lib/town/world.ts').buildTown(scene);let checked=0,cay=0;const bad=[];INDEX.clear();
  scene.traverse(o=>{const g=o.geometry;if(g&&g.index&&g.getAttribute('position'))INDEX.set(g.getAttribute('position'),g.index);});
  for(const s of world.propSpecs){if(s.kind!=='tree'&&s.kind!=='palm')continue;checked++;
   const inCay=s.min.x>640&&s.max.x<690&&s.min.z>-130&&s.max.z<-110;if(inCay)cay++;
   const n=pieces(s);if(n>1)bad.push(`${s.kind} at (${((s.min.x+s.max.x)/2).toFixed(1)},${((s.min.z+s.max.z)/2).toFixed(1)}) y ${s.min.y.toFixed(1)}..${s.max.y.toFixed(1)}: ${n} pieces `+spec_comps(s));}
  if(bad.length)console.log(bad.slice(0,12).join('\n'));
  assert(checked>100&&cay>=8,`${tier}: the town lists its trees (${checked}, Coral Cay farm ${cay})`);
  assert.equal(bad.length,0,`${tier}: ${bad.length} tree / palm props have parts floating off the tree`);
  console.log(`PASS ${tier} town: ${checked} tree / palm props (Coral Cay farm ${cay}) each one connected body`);}
 // ---- Part 2: Summit Isle's round trees, fruit on the drawn crown
 {const load=loader(low),W=load('lib/town/summitIsleWorld.ts'),RT=load('lib/graphics/fruitTrees.ts'),F=load('lib/town/summitForage.ts'),BL=load('lib/town/broadleafTrees.ts');
  const town=new T.Group(),mk=g=>{const m=new T.Mesh(g,new T.MeshStandardMaterial());town.add(m);return m;};
  const tools={box:(w,h,d,c,x,y,z)=>{const m=mk(new T.BoxGeometry(w,h,d));m.position.set(x,y,z);return m;},cylinder:(r,h,c,x,y,z)=>{const m=mk(new T.CylinderGeometry(r,r,h,10));m.position.set(x,y,z);return m;},
   sign:(t,w,h,x,y,z)=>{const m=mk(new T.PlaneGeometry(w,h));m.position.set(x,y,z);return m;},town,obstacles:[],assets:[],surfaceAreas:[],prop:(k,f)=>f()};
  W.buildSummitIsle(tools);const round=W.SUMMIT_TREE_SITES.filter(s=>s.kind==='tree'&&!s.form);let n=0,worst=0;
  assert(round.length>5,'Summit lists its round trees');
  const tri=new T.Triangle(),cp=new T.Vector3();
  for(const s of round){
   if(!BL.broadleafTreesOn()){assert(s.rig.lobes,'old trees keep their lobes');continue;}
   assert(s.rig.surface,`${tier}: round tree ${s.seed} carries its drawn crown`);
   const t=BL.broadleafTree(s.x,s.z,s.size,{trunkFoot:.2,trunkTop:.13,sides:6,low}),L=t.leaves.getAttribute('position'),lo=t.crown.min.clone().add(new T.Vector3(s.x,s.y,s.z)),hi=t.crown.max.clone().add(new T.Vector3(s.x,s.y,s.z));
   assert.equal(L.count*3,s.rig.surface.length,`${tier}: tree ${s.seed}: the rig's crown is the drawn one (same clump count)`);
   for(const fruit of F.ROUND_TREE_FRUIT){const r=F.FRUIT_LOOK[fruit].r;
    for(const day of ['2026-11-27','2026-11-28','2026-12-01'])for(let k=0;k<F.FORAGE.perTree;k++){const h=RT.hangPoint({...s,id:'t'+s.seed,fruit},k,day);n++;
     assert(h.x>=lo.x-r&&h.x<=hi.x+r&&h.y>=lo.y-r&&h.y<=hi.y+r&&h.z>=lo.z-r&&h.z<=hi.z+r,`${tier}: tree ${s.seed} ${fruit} k${k} outside its crown box`);
     let d=Infinity;for(let v=0;v+2<L.count;v+=3){tri.set(A.fromBufferAttribute(L,v).add(new T.Vector3(s.x,s.y,s.z)),B.fromBufferAttribute(L,v+1).add(new T.Vector3(s.x,s.y,s.z)),C.fromBufferAttribute(L,v+2).add(new T.Vector3(s.x,s.y,s.z)));tri.closestPointToPoint(h,cp);d=Math.min(d,cp.distanceTo(h));}
     worst=Math.max(worst,d/r);assert(d<=.6*r,`${tier}: tree ${s.seed} ${fruit} k${k} ${day}: ${(d/r).toFixed(2)} r off its leaves`);}}}
  console.log(`PASS ${tier} Summit: ${round.length} round trees, ${n} fruit positions on their drawn crowns (worst ${worst.toFixed(2)} r from the leaves)`);}
}
})().catch(e=>{console.error(e);process.exit(1);});
