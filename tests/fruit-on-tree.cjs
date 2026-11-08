// Fruit on the tree (Nov 8 2026, owner: "fix the fruit, it's not on the tree. Audit ALL the fruit trees to make sure none is hanging
// in the air"). Pure geometry: for every Summit Isle tree and palm (orchard forms, the island's round trees, palms), every fruit kind it
// can bear, every fruit slot and a run of days, the runtime's hangPoint (lib/graphics/fruitTrees.ts) must put the fruit ON the baked
// canopy: its centre just outside the real faceted leaves (low-poly icosahedron lobes, rebuilt here from orchardParts and the island's
// tree() formula, not from the rig), never floating off them and never buried in them. 'Under' hangers: a papaya touches its trunk,
// a banana hand sits on its stalk, a coconut touches the palm's nut cluster or trunk. Also Coral Cay's decorative orchard fruit.
// usage: node tests/fruit-on-tree.cjs   (FRUIT_VERBOSE=1 lists the failures)
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');
const fakeWindow={addEventListener(){},removeEventListener(){},requestAnimationFrame:()=>1,setTimeout:()=>1,setInterval:()=>1};
const cache=new Map();
function load(file){
 file=path.isAbsolute(file)?file:path.resolve(ROOT,file);
 if(cache.has(file))return cache.get(file).exports;
 const mod={exports:{}};cache.set(file,mod);
 if(file.endsWith('.json'))return mod.exports=JSON.parse(fs.readFileSync(file,'utf8'));
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
 vm.runInNewContext(code,{exports:mod.exports,module:mod,Math,JSON,Set,Map,Object,Array,Number,String,Symbol,Promise,Error,console,Date,Float32Array,Float64Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,
  window:fakeWindow,requestAnimationFrame:fakeWindow.requestAnimationFrame,setTimeout:fakeWindow.setTimeout,setInterval:fakeWindow.setInterval,navigator:undefined,document:undefined,
  require:id=>{
   if(!id.startsWith('.')&&!id.startsWith('@/'))return id==='react'?{useSyncExternalStore:(_s,get)=>get()}:require(id);
   const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(file),id);
   for(const f of [base,base+'.ts',base+'.tsx',base+'.js',base+'.json',path.join(base,'index.ts')])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
   throw new Error('Cannot resolve '+id+' from '+file);}});
 return mod.exports;
}
const T=require('three');
const W=load('lib/town/summitIsleWorld.ts'),F=load('lib/town/summitForage.ts'),O=load('lib/town/summitOrchard.ts'),RT=load('lib/graphics/fruitTrees.ts');

// ---- The unit icosahedron (three's IcosahedronGeometry(1,0)): face normals and the inscribed radius.
const ICO=(()=>{const g=new T.IcosahedronGeometry(1,0),p=g.getAttribute('position'),n=[];let rin=1;
 for(let f=0;f<p.count;f+=3){const a=new T.Vector3().fromBufferAttribute(p,f),b=new T.Vector3().fromBufferAttribute(p,f+1),c=new T.Vector3().fromBufferAttribute(p,f+2);
  const m=b.clone().sub(a).cross(c.clone().sub(a)).normalize();if(m.dot(a)<0)m.negate();n.push(m);rin=Math.min(rin,m.dot(a));}
 return {n,rin};})();
const reach=u=>{let b=0;for(const m of ICO.n)b=Math.max(b,m.dot(u));return ICO.rin/b;};
/** Signed distance (m, + outside) from world point q to a lobe (world matrix of a unit icosahedron), measured along its radial ray. */
function lobeGap(L,q){const inv=L.clone().invert(),l=q.clone().applyMatrix4(inv),len=l.length();if(len<1e-9)return -1;const u=l.clone().divideScalar(len);
 const lin=new T.Matrix3().setFromMatrix4(L),s=u.clone().applyMatrix3(lin).length();return (len-reach(u))*s;}
const canopyGap=(lobes,q)=>Math.min(...lobes.map(L=>lobeGap(L,q)));
/** Distance from q to segment a→b and the fraction along it. */
function segDist(q,a,b){const ab=b.clone().sub(a),f=Math.max(0,Math.min(1,q.clone().sub(a).dot(ab)/ab.lengthSq()));return {d:q.distanceTo(a.clone().addScaledVector(ab,f)),f};}

// ---- Build the island (stub tools, like tests/summit-forage.cjs) to get its trees, palms and orchard.
const town=new T.Group(),mk=g=>{const m=new T.Mesh(g,new T.MeshStandardMaterial());town.add(m);return m;};
const tools={box:(w,h,d,c,x,y,z)=>{const m=mk(new T.BoxGeometry(w,h,d));m.position.set(x,y,z);return m;},cylinder:(r,h,c,x,y,z)=>{const m=mk(new T.CylinderGeometry(r,r,h,10));m.position.set(x,y,z);return m;},
 sign:(t,w,h,x,y,z)=>{const m=mk(new T.PlaneGeometry(w,h));m.position.set(x,y,z);return m;},town,obstacles:[],assets:[],surfaceAreas:[]};
W.buildSummitIsle(tools);
const sites=W.SUMMIT_TREE_SITES;
const plans=O.planOrchard(()=>false,[]);// extra seeds/forms beyond the island's own layout: every form, many seeds
assert(sites.length>20&&plans.length>20,'the island lists its trees and the orchard plans');

const days=Array.from({length:12},(_,i)=>`2026-11-${String(i+1).padStart(2,'0')}`);
const fails={},count={},worst={};
const bump=(k,ok,v,msg)=>{count[k]=(count[k]||0)+1;if(!ok){fails[k]=(fails[k]||0)+1;if(process.env.FRUIT_VERBOSE&&fails[k]<=4)console.log('  FAIL',k,msg);}
 worst[k]=worst[k]||{lo:Infinity,hi:-Infinity};worst[k].lo=Math.min(worst[k].lo,v);worst[k].hi=Math.max(worst[k].hi,v);};

/** The baked canopy lobes of an orchard plan, from its parts (leaf-coloured detail-0 icosahedra; not the banana bud or papaya knob). */
function orchardTruth(p){const parts=O.orchardParts(p),lobes=[];let trunk=null,stalk=null;
 parts.forEach((part,i)=>{const g=part.geo(),P=g.parameters;
  if(i===0){const h=P.height;trunk={a:new T.Vector3(0,-h/2,0).applyMatrix4(part.matrix),b:new T.Vector3(0,h/2,0).applyMatrix4(part.matrix),r0:P.radiusBottom,r1:P.radiusTop};}
  else if(g.type==='IcosahedronGeometry'&&P.detail===0&&part.color!=='#7a3d5a'&&part.color!=='#5f8a48')lobes.push(part.matrix.clone().multiply(new T.Matrix4().makeScale(P.radius,P.radius,P.radius)));
  else if(g.type==='CylinderGeometry'&&Math.abs(P.height-.7)<1e-6)stalk={a:new T.Vector3(0,-.35,0).applyMatrix4(part.matrix),b:new T.Vector3(0,.35,0).applyMatrix4(part.matrix)};
  g.dispose();});
 return {lobes,trunk,stalk};}
/** The island's own round tree (summitIsleWorld.ts tree()): two lobes. */
const roundTruth=s=>({lobes:[new T.Matrix4().compose(new T.Vector3(s.x,s.y+2.9*s.size,s.z),new T.Quaternion().setFromEuler(new T.Euler(0,s.seed,0)),new T.Vector3().setScalar(1.7*s.size)),
 new T.Matrix4().compose(new T.Vector3(s.x+.6*s.size,s.y+3.9*s.size,s.z-.3*s.size),new T.Quaternion().setFromEuler(new T.Euler(0,s.seed*2,0)),new T.Vector3().setScalar(1.15*s.size))]});

function checkTree(site,fruits,truth,label){
 for(const fruit of fruits){const L=F.FRUIT_LOOK[fruit],r=L.r,t={...site,id:`${site.kind}-${Math.round(site.x)}-${Math.round(site.z)}`,fruit};
  for(const day of days)for(let k=0;k<F.FORAGE.perTree;k++){const h=RT.hangPoint(t,k,day);
   if(fruit==='banana'){const {d}=segDist(h,truth.stalk.a,truth.stalk.b);bump('banana hand on stalk',d<=.05,d,`${label} k${k} ${d.toFixed(3)} m off the stalk`);continue;}
   if(site.kind==='palm'){// a coconut touches the nut cluster or the trunk
    const g1=h.distanceTo(truth.nut)-.28*.85,{d}=segDist(h,truth.trunk.a,truth.trunk.b),g2=d-.13,gap=Math.min(g1,g2)-r;
    bump('coconut on palm',gap<=.3*r&&gap>=-r,gap/r,`${label} k${k} gap ${(gap/r).toFixed(2)} r`);continue;}
   if(site.form==='papaya'){const {d,f}=segDist(h,truth.trunk.a,truth.trunk.b),tr=truth.trunk.r0+(truth.trunk.r1-truth.trunk.r0)*f,gap=d-tr-r*L.width;
    bump('papaya on trunk',gap<=.3*r&&gap>=-r,gap/r,`${label} k${k} gap ${(gap/r).toFixed(2)} r`);continue;}
   const g=canopyGap(truth.lobes,h);// centre just outside the faceted leaves: touching, never floating, never buried
   bump(`${site.form??'island round'} canopy`,g>=-.15*r&&g<=.6*r,g/r,`${label} ${fruit} k${k} ${day} centre ${(g/r).toFixed(2)} r from the leaves`);}}
}
for(const s of sites){
 if(s.kind==='palm'){const top=new T.Vector3(s.top.x,s.top.y,s.top.z);checkTree(s,['coconut'],{nut:top.clone().add(new T.Vector3(0,-.35,0)),trunk:{a:new T.Vector3(s.x,s.y,s.z),b:top}},`palm ${s.seed}`);continue;}
 if(s.form)continue;// the orchard's plants: checked from their plans below (the same planOrchard → orchardRig/orchardParts)
 checkTree(s,F.ROUND_TREE_FRUIT,roundTruth(s),`round ${s.seed}`);}
// Every form across many more seeds (the plan list without the island's clear zones), each with every fruit its form can bear.
for(const p of plans){const rig=O.orchardRig(p);for(const fruit of O.FORM_FRUIT[p.form])checkTree({kind:'tree',x:p.x,z:p.z,y:p.y,size:p.s,seed:p.seed,form:p.form,fruit,rig},[fruit],orchardTruth(p),`plan ${p.form} ${p.seed}`);}

// ---- Coral Cay's farm orchard (decorative fruit, coralCayWorld.ts): every little fruit touches its canopy.
{const C=load('lib/town/coralCayWorld.ts');if(typeof C.coralOrchardFruit==='function')for(const tr of C.coralOrchardFruit()){
  const L=new T.Matrix4().compose(new T.Vector3(tr.x,tr.cy,tr.z),new T.Quaternion(),new T.Vector3(tr.r,tr.r*.85,tr.r));
  for(const f of tr.fruit){const g=lobeGap(L,new T.Vector3(f.x,f.y,f.z));bump('coral cay canopy',g>=-.15*.13&&g<=.6*.13,g/.13,`coral ${tr.kind} ${g.toFixed(3)}`);}}
 else{fails['coral cay canopy (no coralOrchardFruit export)']=1;count['coral cay canopy (no coralOrchardFruit export)']=1;}}

let total=0,bad=0;
for(const k of Object.keys(count).sort()){total+=count[k];bad+=fails[k]||0;
 console.log(`${fails[k]?'FAIL':'ok  '} ${k}: ${fails[k]||0}/${count[k]} off the tree  (centre gap ${worst[k]?worst[k].lo.toFixed(2):'-'}..${worst[k]?worst[k].hi.toFixed(2):'-'} r)`);}
assert.equal(bad,0,`${bad} of ${total} fruit positions are not on their tree`);
console.log(`fruit on tree: all ${total} fruit positions sit on their tree`);
