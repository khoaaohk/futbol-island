// Fishing post variants (Oct 26 2026, lib/town/fishing/fishingKiosk.ts): every post has its own deterministic look (seeded by the
// post id), keeps the shared cabinet / collision footprint, and stays inside the cost caps (one merged mesh, bounded triangles).
// Run: node tests/fishing-kiosk-variants.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const T=require('three');
const {mergeGeometries}=require('three/examples/jsm/utils/BufferGeometryUtils.js');
const {createLoader}=require('./summit-harness.cjs');
const load=createLoader();
const K=load('lib/town/fishing/fishingKiosk.ts'),{FISH_SPOTS}=load('lib/town/fishing/fishCatalog.ts');
const src=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const posts=FISH_SPOTS.filter(s=>!s.boat);

ok('every post resolves to its own variant signature',()=>{
 assert(posts.length>=16,'16 shore posts, got '+posts.length);
 const sigs=posts.map(s=>K.kioskVariant(s.id).signature);
 assert.equal(new Set(sigs).size,posts.length,'duplicate signature: '+sigs.filter((s,i)=>sigs.indexOf(s)!==i).join(', '));
 // Not just a number tweak: neighbours in the same area differ in at least three visible traits.
 const traits=v=>[v.awning,v.pattern,v.roof,v.counter,v.ground,v.hang,v.topper,v.wood];
 for(let i=0;i<posts.length;i++)for(let j=i+1;j<posts.length;j++){const a=traits(K.kioskVariant(posts[i].id)),b=traits(K.kioskVariant(posts[j].id));
  assert(a.filter((x,k)=>x!==b[k]).length>=3,`${posts[i].id} vs ${posts[j].id} differ in fewer than 3 traits`);}
});

ok('settings fit the spot: piers, rocks, river, beach all used, with their own props',()=>{
 const by=s=>posts.filter(p=>K.kioskSetting(p.id)===s).map(p=>p.id);
 assert.deepEqual(by('pier').sort(),['east-pier','harbour-wall','south-pier','west-pier']);
 assert(by('rocks').includes('north-rocks')&&by('river').includes('west-cove')&&by('beach').includes('sharks-beach'));
 for(const p of posts){const v=K.kioskVariant(p.id),plan=K.kioskPlan(v),setting=plan.filter(x=>x.tag==='setting');
  assert(setting.length>=3,p.id+': setting props');
  if(v.setting==='pier')assert(setting.some(x=>x.prim==='arc')&&setting.some(x=>x.prim==='torus'),p.id+': lifebuoy + rope coil');
  if(v.setting==='beach')assert(setting.filter(x=>x.prim==='cone4').length>=5,p.id+': shell garland');
  if(v.setting==='river')assert(setting.some(x=>x.color==='#5f8a4a'),p.id+': mossy stones');}
});

ok('deterministic: same id, same look and the same vertices; no Math.random',()=>{
 for(const p of posts){assert.deepEqual(K.kioskVariant(p.id),K.kioskVariant(p.id));
  const a=K.buildKioskGeometry(K.kioskVariant(p.id),p.x,p.z),b=K.buildKioskGeometry(K.kioskVariant(p.id),p.x,p.z);
  for(const n of ['position','normal','color'])assert.deepEqual(Array.from(a.getAttribute(n).array),Array.from(b.getAttribute(n).array),p.id+' '+n);}
 assert(!/Math\.random/.test(src('lib/town/fishing/fishingKiosk.ts')),'no Math.random in the kiosk module');
});

ok('same footprint: one identical cabinet per post, props tucked in, collision rule unchanged',()=>{
 const pos=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();
 for(const p of posts){const plan=K.kioskPlan(K.kioskVariant(p.id)),cab=plan.filter(x=>x.tag==='cabinet');
  assert.equal(cab.length,1,p.id+': one cabinet');cab[0].m.decompose(pos,q,s);
  assert.deepEqual([pos.x,pos.y,pos.z,s.x,s.y,s.z].map(n=>+n.toFixed(4)),[0,.625,0,K.KIOSK_CABINET.w,K.KIOSK_CABINET.h,K.KIOSK_CABINET.d],p.id+': cabinet box');
  assert(Math.abs(q.w)>.9999,p.id+': cabinet unrotated in its frame');
  for(const g of plan.filter(x=>x.tag==='ground')){const b=new T.Box3().setFromBufferAttribute(K.kioskPrimitive(g.prim).getAttribute('position')).applyMatrix4(g.m);
   assert(Math.max(Math.abs(b.min.x),Math.abs(b.max.x))<=1.15&&Math.max(Math.abs(b.min.z),Math.abs(b.max.z))<=.6,p.id+': ground prop tucked beside the cabinet');}}
 assert.deepEqual(K.KIOSK_CABINET,{w:1.2,h:1.25,d:.7});
 const world=src('lib/town/fishing/fishingWorld.ts');
 assert(/KIOSK_OFFSET=2\.1/.test(world)&&/size=\(1\.2\+\.7\)\*c/.test(world),'fishingKioskObstacles unchanged');
 assert(/buildKioskGeometry\(kioskVariant\(s\.id\),k\.x,k\.z,Math\.PI\/4\)/.test(world),'posts placed at kioskAt, turned 45° as before');
});

ok('cost caps: bounded triangles, shared primitives, still one merged mesh (no new draws)',()=>{
 let total=0;const geos=[];
 for(const p of posts){const v=K.kioskVariant(p.id),tris=K.kioskTriangles(K.kioskPlan(v));assert(tris<=K.KIOSK_TRI_CAP,`${p.id}: ${tris} triangles > ${K.KIOSK_TRI_CAP}`);total+=tris;
  const g=K.buildKioskGeometry(v,p.x,p.z);assert.deepEqual(Object.keys(g.attributes).sort(),['color','normal','position']);assert.equal(g.index,null);assert.equal(g.getAttribute('position').count,tris*3);geos.push(g);}
 assert(total<=600*posts.length,'all posts '+total+' triangles');
 assert(K.kioskPrimitiveCount()<=12,'shared primitive cache: '+K.kioskPrimitiveCount());
 assert(mergeGeometries(geos),'posts merge into one geometry');
 const m=src('lib/town/fishing/fishingKiosk.ts');
 assert(!/new T\.(Mesh|InstancedMesh|\w*Material|\w*Texture)\b/.test(m),'kiosk module makes no mesh, material or texture');
 const world=src('lib/town/fishing/fishingWorld.ts');
 assert.equal((world.match(/new T\.Mesh\(/g)||[]).length,4,'fishingWorld meshes unchanged (posts, ripple, stand sign, stand frame)');
 assert(/mergeGeometries\(all\)/.test(world)&&/kiosks\.name='fishing-posts'/.test(world),'one merged post mesh');
});

if(failed){console.log(failed+' failed');process.exit(1);}
console.log('fishing kiosk variants: all ok');
