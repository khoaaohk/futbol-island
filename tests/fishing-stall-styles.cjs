// Fishing stall styles (Nov 10 2026, lib/town/fishing/fishingKiosk.ts; owner: "all of them are the same. give them variety in shape
// and styles"). Every shore post is one of seven stall types with its own silhouette; neighbouring posts never share a type; each
// type's round colliders stay off the standing spot, the cast, the sea and other colliders; the draw budget is unchanged (one merged
// mesh, bounded triangles, no new mesh/material/texture) and the kit stays out of the lazy fishing chunks' business.
// Run: node tests/fishing-stall-styles.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadIslandWorld}=require('../scripts/island-world-load.cjs');
const src=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
let failed=0;const ok=async(name,fn)=>{try{await fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
(async()=>{
 const {T,L,world,obstacles}=await loadIslandWorld(path.join(__dirname,'..'));
 const K=L('lib/town/fishing/fishingKiosk.ts'),{FISH_SPOTS}=L('lib/town/fishing/fishSpots.ts'),sim=L('lib/town/simulation.ts'),core=L('lib/town/fishing/fishingCore.ts');
 const posts=FISH_SPOTS.filter(s=>!s.boat),types=K.STALL_TYPE_IDS;
 const PLAYER=.32;
 /** A part's exact box in the stall frame (its transformed vertices, not a rotated box). */
 const partBox=p=>{const a=K.kioskPrimitive(p.prim).getAttribute('position'),b=new T.Box3(),v=new T.Vector3();for(let i=0;i<a.count;i++)b.expandByPoint(v.fromBufferAttribute(a,i).applyMatrix4(p.m));return b;};
 /** A plan's bounding box in the stall frame, rods excluded (they lean out and are hairline-thin). */
 const bounds=v=>{const b=new T.Box3();for(const p of K.kioskPlan(v))if(p.tag!=='rod')b.union(partBox(p));return b;};
 const sample=type=>K.kioskVariant(posts.find(p=>K.stallType(p.id)===type).id);

 await ok('every post has a stall type; all seven types are used, none more than three times',()=>{
  assert.equal(posts.length,16,'16 shore posts');
  assert.deepEqual([...types].sort(),['booth','cart','lighthouse','market','rowboat','shack','tiki']);
  for(const p of posts)assert(K.STALL_BY_SPOT[p.id],p.id+': has an explicit stall type');
  for(const t of types){const n=posts.filter(p=>K.stallType(p.id)===t).length;assert(n>=1&&n<=3,t+' used '+n+' times');}
  assert.equal(Object.keys(K.STALL_BY_SPOT).length,posts.length,'no stale ids in STALL_BY_SPOT');
 });

 await ok('neighbours differ: the two nearest posts, and every post within 150 m, have another type',()=>{
  for(const s of posts){const others=posts.filter(o=>o!==s).map(o=>({o,d:Math.hypot(o.x-s.x,o.z-s.z)})).sort((a,b)=>a.d-b.d);
   for(const {o,d} of others)if(others.indexOf(others.find(x=>x.o===o))<2||d<150)assert.notEqual(K.stallType(o.id),K.stallType(s.id),`${s.id} and ${o.id} (${d.toFixed(0)} m) share ${K.stallType(s.id)}`);}
 });

 await ok('the types differ in shape, not paint: size, height and primitive mix all vary',()=>{
  const info=types.map(t=>{const b=bounds(sample(t)),plan=K.kioskPlan(sample(t)),mix={};for(const p of plan)mix[p.prim]=(mix[p.prim]||0)+1;return {t,w:b.max.x-b.min.x,d:b.max.z-b.min.z,h:b.max.y,mix};});
  for(const i of info)console.log(`     ${i.t.padEnd(10)} ${i.w.toFixed(2)} × ${i.d.toFixed(2)} m, ${i.h.toFixed(2)} m tall`);
  const hs=info.map(i=>i.h);assert(Math.max(...hs)-Math.min(...hs)>=1,'heights span at least 1 m');
  const ws=info.map(i=>i.w);assert(Math.max(...ws)-Math.min(...ws)>=.6,'widths span at least 0.6 m');
  for(let i=0;i<info.length;i++)for(let j=i+1;j<info.length;j++){const a=info[i],b=info[j];
   const dims=Math.max(Math.abs(a.w-b.w),Math.abs(a.d-b.d),Math.abs(a.h-b.h));
   const prims=new Set([...Object.keys(a.mix),...Object.keys(b.mix)]);let diff=0;for(const k of prims)diff+=Math.abs((a.mix[k]||0)-(b.mix[k]||0));
   assert(dims>=.3,`${a.t} vs ${b.t}: bounding boxes within 0.3 m`);assert(diff>=10,`${a.t} vs ${b.t}: almost the same parts (${diff})`);}
 });

 await ok('one cue on every stall: the fish sign (board + emblem) and two rods',()=>{
  for(const p of posts){const plan=K.kioskPlan(K.kioskVariant(p.id)),sign=plan.filter(x=>x.tag==='sign'),rods=plan.filter(x=>x.tag==='rod');
   assert.equal(sign.length,5,p.id+': sign parts');assert(sign.some(x=>x.prim==='ico')&&sign.some(x=>x.prim==='cone3'),p.id+': fish emblem');
   assert.equal(rods.length,4,p.id+': two rods with reels');
   const b=partBox(sign[1]);
   assert(b.max.x-b.min.x>=.7,p.id+': the sign is at least 0.7 m wide');}
 });

 await ok('colliders match each footprint: inside the stall, covering its lower body',()=>{
  for(const t of types){const spec=K.STALL_TYPES[t],b=bounds(sample(t));
   assert(spec.solids.length>=1&&spec.solids.length<=3,t+': 1-3 colliders');
   for(const [x,z,r] of spec.solids){assert(x-r>=b.min.x-.15&&x+r<=b.max.x+.15&&z-r>=b.min.z-.35&&z+r<=b.max.z+.35,t+': collider inside the stall');}
   // The lower body (parts under 1.3 m, small props aside) is covered by the colliders within 0.35 m.
   const c=new T.Vector3();
   for(const p of K.kioskPlan(sample(t))){if(p.tag)continue;const pb=partBox(p);
    if(pb.min.y>1.3||pb.getSize(c).x*pb.getSize(c).z<.12)continue;pb.getCenter(c);
    assert(spec.solids.some(([x,z,r])=>Math.hypot(c.x-x,c.z-z)<=r+.35),`${t}: a body part at ${c.x.toFixed(2)},${c.z.toFixed(2)} sits outside the colliders`);}}
 });

 await ok('every post: standing spot, cast and approach clear; stall on walkable ground; no clash with other colliders',()=>{
  const mine=new Set(K.STALL_TYPE_IDS.length?posts.flatMap(p=>K.stallColliders(p).map(o=>o.x+','+o.z)):[]);
  const others=obstacles.filter(o=>!mine.has(o.x+','+o.z));
  const segDist=(px,pz,ax,az,bx,bz)=>{const dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((px-ax)*dx+(pz-az)*dz)/(dx*dx+dz*dz)));return Math.hypot(px-ax-dx*t,pz-az-dz*t);};
  for(const s of posts){const cols=K.stallColliders(s),cast=core.castPoint(s,s),dx=s.buoy.x-s.x,dz=s.buoy.z-s.z,l=Math.hypot(dx,dz);
   const land={x:s.x-dx/l*4,z:s.z-dz/l*4};
   let minSpot=9,minCast=9;
   for(const o of cols){const r=o.cornerRadius;
    minSpot=Math.min(minSpot,Math.hypot(o.x-s.x,o.z-s.z)-r);minCast=Math.min(minCast,segDist(o.x,o.z,s.x,s.z,cast.x,cast.z)-r);
    assert(!sim.insideObstacle(s.x,s.z,o,PLAYER+.5),`${s.id}: a collider crowds the standing spot`);
    assert(segDist(o.x,o.z,s.x,s.z,cast.x,cast.z)>r+PLAYER,`${s.id}: a collider sits on the cast line`);
    assert(segDist(o.x,o.z,s.x,s.z,land.x,land.z)>r+PLAYER,`${s.id}: a collider blocks the walk up to the spot from inland`);
    for(let a=0;a<8;a++){const x=o.x+Math.cos(a*Math.PI/4)*r,z=o.z+Math.sin(a*Math.PI/4)*r;assert(!sim.blocked(x,z,[],0),`${s.id}: collider edge off walkable ground at ${x.toFixed(1)},${z.toFixed(1)}`);}
    for(const q of others){const dxq=Math.max(0,Math.abs(o.x-q.x)-q.w/2),dzq=Math.max(0,Math.abs(o.z-q.z)-q.d/2);
     if(Math.hypot(dxq,dzq)<r-.05&&!q.cornerRadius)assert.fail(`${s.id}: collider overlaps a world collider at ${q.x.toFixed(1)},${q.z.toFixed(1)}`);}}
   // The whole stall's ground footprint (parts below 2 m, rods aside) stands on walkable ground, never over the sea.
   const v=K.kioskVariant(s.id),k=K.kioskAt(s);
   for(const p of K.kioskPlan(v)){if(p.tag==='rod')continue;const pb=partBox(p);if(pb.min.y>.6)continue;
    for(const [x,z] of [[pb.min.x,pb.min.z],[pb.max.x,pb.min.z],[pb.min.x,pb.max.z],[pb.max.x,pb.max.z]]){const w=K.stallToWorld(k,v.yaw,x,z);assert(!sim.blocked(w.x,w.z,[],0),`${s.id}: ${v.type} part over the water at ${w.x.toFixed(1)},${w.z.toFixed(1)}`);}}
   assert(minSpot>=.85&&minCast>=.85,`${s.id}: colliders within 0.85 m of the spot or the cast (${minSpot.toFixed(2)}, ${minCast.toFixed(2)})`);
   console.log(`     ${s.id.padEnd(17)} ${K.stallType(s.id).padEnd(10)} spot clear ${minSpot.toFixed(2)} m, cast line ${minCast.toFixed(2)} m`);}
 });

 await ok('fishingKioskObstacles hands Town exactly the stall colliders',()=>{
  const got=L('lib/town/fishing/fishingWorld.ts').fishingKioskObstacles(),want=posts.flatMap(p=>K.stallColliders(p));
  assert.deepEqual(got,want);for(const o of got)assert(o.cornerRadius>0&&Math.abs(o.w-2*o.cornerRadius)<1e-9,'round colliders');
 });

 await ok('draw budget unchanged: one merged mesh, bounded triangles, shared primitives, nothing new per frame',()=>{
  let total=0;for(const p of posts){const v=K.kioskVariant(p.id),tris=K.kioskTriangles(K.kioskPlan(v));assert(tris<=K.KIOSK_TRI_CAP,`${p.id}: ${tris} > ${K.KIOSK_TRI_CAP}`);total+=tris;}
  assert(total<=600*posts.length,'all stalls '+total+' triangles');console.log('     '+total+' triangles for all stalls');
  assert(K.kioskPrimitiveCount()<=11,'shared primitives '+K.kioskPrimitiveCount());
  const m=src('lib/town/fishing/fishingKiosk.ts');assert(!/new T\.(Mesh|InstancedMesh|\w*Material|\w*Texture|\w*Light)\b/.test(m)&&!/Math\.random|requestAnimationFrame|performance\.now/.test(m),'kiosk module: no mesh, material, texture, light, randomness or clock');
  const w=src('lib/town/fishing/fishingWorld.ts');
  assert.equal((w.match(/new T\.Mesh\(/g)||[]).length,4,'fishingWorld meshes unchanged');
  assert(/kiosks\.name='fishing-posts';kiosks\.castShadow=true/.test(w)&&/mergeGeometries\(all\)/.test(w),'one merged, shadow-casting post mesh as before');
  assert(!/fishingVisuals|fishModels/.test(m.replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm,'')),'the kit does not pull in the lazy fishing visuals');
  assert(/^import \* as T from 'three';\s*$/m.test(m)&&(m.match(/^import /gm)||[]).length===1,'the kit imports three only');
 });

 if(failed){console.log(failed+' failed');process.exit(1);}
 console.log('fishing stall styles: all ok');
})().catch(e=>{console.error(e);process.exit(1);});
