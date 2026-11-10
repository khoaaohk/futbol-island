// Fishing post variants (Oct 26 2026, lib/town/fishing/fishingKiosk.ts): every post has its own deterministic look (seeded by the
// post id) and stays inside the cost caps (one merged mesh, bounded triangles). Nov 10 2026: the shared cabinet became a kit of seven
// stall types (tests/fishing-stall-styles.cjs pins the types, neighbours, footprints and clearances); the cabinet/setting-prop
// assertions were replaced by the kit's equivalents below.
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
 // Posts of the same type differ in palette or turn, so even two shacks never look identical.
 for(let i=0;i<posts.length;i++)for(let j=i+1;j<posts.length;j++){const a=K.kioskVariant(posts[i].id),b=K.kioskVariant(posts[j].id);
  if(a.type===b.type)assert(a.palette!==b.palette||Math.abs(a.yaw-b.yaw)>.3,`${posts[i].id} vs ${posts[j].id}: same type, same palette and turn`);}
});

ok('deterministic: same id, same look and the same vertices; no Math.random',()=>{
 for(const p of posts){assert.deepEqual(K.kioskVariant(p.id),K.kioskVariant(p.id));
  const a=K.buildKioskGeometry(K.kioskVariant(p.id),p.x,p.z),b=K.buildKioskGeometry(K.kioskVariant(p.id),p.x,p.z);
  for(const n of ['position','normal','color'])assert.deepEqual(Array.from(a.getAttribute(n).array),Array.from(b.getAttribute(n).array),p.id+' '+n);}
 assert(!/Math\.random/.test(src('lib/town/fishing/fishingKiosk.ts')),'no Math.random in the kiosk module');
});

ok('placement and collision rule: 2.1 m beside the spot, the stall type\'s colliders, turned with the stall',()=>{
 assert(/export const KIOSK_OFFSET=2\.1;/.test(src('lib/town/fishing/fishingKiosk.ts')),'KIOSK_OFFSET unchanged');
 for(const p of posts){const k=K.kioskAt(p);assert(Math.abs(Math.hypot(k.x-p.x,k.z-p.z)-2.1)<1e-9,p.id+': 2.1 m from the spot');
  assert.equal(K.stallColliders(p).length,K.STALL_TYPES[K.stallType(p.id)].solids.length,p.id+': one collider per solid');}
 const world=src('lib/town/fishing/fishingWorld.ts');
 assert(/flatMap\(s=>stallColliders\(s\)\)/.test(world),'fishingKioskObstacles uses the stall colliders');
 assert(/buildKioskGeometry\(v,k\.x,k\.z,v\.yaw\)/.test(world),'posts placed at kioskAt, turned by their variant');
});

ok('cost caps: bounded triangles, shared primitives, still one merged mesh (no new draws)',()=>{
 let total=0;const geos=[];
 for(const p of posts){const v=K.kioskVariant(p.id),tris=K.kioskTriangles(K.kioskPlan(v));assert(tris<=K.KIOSK_TRI_CAP,`${p.id}: ${tris} triangles > ${K.KIOSK_TRI_CAP}`);total+=tris;
  const g=K.buildKioskGeometry(v,p.x,p.z);assert.deepEqual(Object.keys(g.attributes).sort(),['color','normal','position']);assert.equal(g.index,null);assert.equal(g.getAttribute('position').count,tris*3);geos.push(g);}
 assert(total<=600*posts.length,'all posts '+total+' triangles');
 assert(K.kioskPrimitiveCount()<=11,'shared primitive cache: '+K.kioskPrimitiveCount());
 assert(mergeGeometries(geos),'posts merge into one geometry');
 const m=src('lib/town/fishing/fishingKiosk.ts');
 assert(!/new T\.(Mesh|InstancedMesh|\w*Material|\w*Texture)\b/.test(m),'kiosk module makes no mesh, material or texture');
 const world=src('lib/town/fishing/fishingWorld.ts');
 assert.equal((world.match(/new T\.Mesh\(/g)||[]).length,4,'fishingWorld meshes unchanged (posts, ripple, stand sign, stand frame)');
 assert(/mergeGeometries\(all\)/.test(world)&&/kiosks\.name='fishing-posts'/.test(world),'one merged post mesh');
});

if(failed){console.log(failed+' failed');process.exit(1);}
console.log('fishing kiosk variants: all ok');
