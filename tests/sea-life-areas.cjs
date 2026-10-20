// Open-sea whale sharks and rays (Oct 20 2026, user: "add more whale in the bigger water areas. also add rays to balance the
// different areas out"): lib/town/seaLifeAreas.ts (areas, loops, caps, the per-area table) and lib/graphics/openSeaLife.ts.
// Every new loop is in swimmable open water (never on land, inside the flight zone, within the 60 m swim range), clear of the
// fishing floats, the East Jetty and the other animals; every big area has a whale shark and every area a ray or a whale; the
// heat caps hold at every tier; the whale sharks share one geometry/material and only the nearest are drawn; far ones step at
// 15 Hz; the rides and the analytics are wired.
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,Float32Array,Float64Array,require:id=>id==='three'?T:id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const A=load('lib/town/seaLifeAreas.ts'),cay=load('lib/town/coralCay.ts'),L=load('lib/town/summitSeaLife.ts'),M=load('lib/town/mantaLoops.ts'),E=load('lib/town/eastPier.ts'),S=load('lib/town/summitIsle.ts');
const {flightBlocked}=load('lib/town/simulation.ts'),{onLand,distanceToLand}=load('lib/town/landmass.ts'),{FISH_SPOTS}=load('lib/town/fishing/fishCatalog.ts'),{SWIM_RANGE}=load('lib/town/water/waterDepth.ts');
const heat=load('lib/graphics/heatTier.ts'),{createOpenSeaLife}=load('lib/graphics/openSeaLife.ts'),R=load('lib/town/water/animalRides.ts');
let groups=0;const ok=(name,fn)=>{fn();groups++;};
const segment=(x,z,a,b)=>{const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz);};
const whales=A.OPEN_SEA_WHALE_LOOPS.map(l=>({...l,kind:'whale',land:[20,SWIM_RANGE],turn:.5})),rays=A.OPEN_SEA_RAY_LOOPS.map(l=>({...l,kind:'ray',land:[10,50],turn:.8}));
const fresh=[...whales,...rays];
const old=[...cay.SHARK_LOOPS.map(l=>({k:'shark',id:l.id,p:l.points})),...L.SUMMIT_SHARK_LOOPS.map(l=>({k:'shark',id:l.id,p:l.points})),...M.MANTA_LOOPS.map(l=>({k:'manta',id:l.id,p:l.points})),{k:'whale',id:L.WHALE_SHARK_LOOP.id,p:L.WHALE_SHARK_LOOP.points}];
const gapOf=(a,b)=>{let g=Infinity;for(const p of a)for(const q of b)g=Math.min(g,Math.hypot(p.x-q.x,p.z-q.z));return g;};
const need=(ka,kb)=>ka==='whale'&&kb==='whale'?60:ka==='shark'||kb==='shark'?14:ka==='whale'||kb==='whale'?16:12;

ok('paths: open water, swimmable, clear of land, floats, the jetty and the sandbar; smooth',()=>{
 for(const l of fresh){
  assert(l.points.length>=40,l.id+' is a smooth sampled loop');
  let cx=0,cz=0;for(const p of l.points){cx+=p.x;cz+=p.z;}cx/=l.points.length;cz/=l.points.length;assert(!onLand(cx,cz),l.id+' centre is not on land');
  for(let i=0;i<l.points.length;i++){const a=l.points[i],b=l.points[(i+1)%l.points.length];assert(Math.hypot(b.x-a.x,b.z-a.z)<8,l.id+' has no jumps');
   for(let t=0;t<1;t+=.5){const x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,where=`${l.id} at ${x.toFixed(1)},${z.toFixed(1)}`,d=distanceToLand(x,z);
    assert(!onLand(x,z),where+' is in the water');
    assert(d>=l.land[0]&&d<=l.land[1],`${where} is ${d.toFixed(1)} m from land (${l.land[0]}–${l.land[1]} for a ${l.kind}; swim range ${SWIM_RANGE})`);
    assert(!flightBlocked(x,z)&&!flightBlocked(x+8,z)&&!flightBlocked(x-8,z)&&!flightBlocked(x,z+8)&&!flightBlocked(x,z-8),where+' is inside the flight zone');
    for(const s of FISH_SPOTS){assert(Math.hypot(s.buoy.x-x,s.buoy.z-z)>=30,`${where} keeps clear of ${s.name}'s float`);assert(segment(x,z,s,s.buoy)>=25,`${where} keeps clear of ${s.name}'s cast`);}
    assert(E.JETTY_PATH.every(j=>Math.hypot(j.x-x,j.z-z)>=20),where+' keeps clear of the East Jetty');
    assert(S.sandbarFrame(x,z).dist>=20,where+' keeps off the Summit sandbar');}}
  let worst=0;for(let i=0;i<l.points.length;i++){const p=l.points[(i+l.points.length-1)%l.points.length],c=l.points[i],n=l.points[(i+1)%l.points.length];
   let d=Math.atan2(n.z-c.z,n.x-c.x)-Math.atan2(c.z-p.z,c.x-p.x);d=Math.atan2(Math.sin(d),Math.cos(d));worst=Math.max(worst,Math.abs(d));}
  assert(worst<l.turn,`${l.id} turns gently (worst ${worst.toFixed(2)} rad per sample)`);
 }
 for(const l of whales)assert(l.speed<L.WHALE_SHARK_LOOP.speed&&l.speed<Math.min(...cay.SHARK_LOOPS.map(s=>s.speed),...L.SUMMIT_SHARK_LOOPS.map(s=>s.speed)),l.id+' is slow and gentle');
});

ok('spacing: new animals never overlap each other or the existing sharks, mantas and whale shark',()=>{
 const all=[...old,...fresh.map(l=>({k:l.kind==='whale'?'whale':'ray',id:l.id,p:l.points}))];
 for(const a of fresh){const ka=a.kind==='whale'?'whale':'ray';for(const b of all){if(b.id===a.id)continue;const g=gapOf(a.points,b.p);assert(g>=need(ka,b.k),`${a.id} and ${b.id} are ${g.toFixed(1)} m apart (≥ ${need(ka,b.k)})`);}}
 const ids=fresh.map(l=>l.id);assert.equal(new Set(ids).size,ids.length,'unique ids');
});

ok('areas: every big area has a whale shark, every area a ray or a whale; the getter and the before table',()=>{
 const after=A.getSeaLifeAreas(),before=A.seaLifeInventory(false);
 assert.equal(A.getSeaLifeAreas(),after,'built once');assert.equal(after.length,A.SEA_AREAS.length);
 for(const a of after){const s=a.species,raysN=s.mantas+s.eagleRays+s.stingrays;
  if(a.big)assert(s.whaleSharks+s.humpbacks>=1,a.id+' (big) has a whale');
  assert(raysN+s.whaleSharks+s.humpbacks>=1,a.id+' has at least one ray or whale');
  assert(raysN<=A.MAX_RAYS_PER_AREA+3||a.id==='coral-cay','no area is swamped with rays');}
 for(const l of A.OPEN_SEA_WHALE_LOOPS){let x=0,z=0;for(const p of l.points){x+=p.x;z+=p.z;}assert.equal(A.seaAreaAt(x/l.points.length,z/l.points.length).id,l.area,l.id+' sits in its own area');}
 for(const l of A.OPEN_SEA_RAY_LOOPS){let x=0,z=0;for(const p of l.points){x+=p.x;z+=p.z;}assert.equal(A.seaAreaAt(x/l.points.length,z/l.points.length).id,l.area,l.id+' sits in its own area');}
 const row=a=>{const s=a.species;return `${a.id.padEnd(17)} sh ${s.sharks} ws ${s.whaleSharks} ma ${s.mantas} ea ${s.eagleRays} st ${s.stingrays} fish ${s.fishSpots}`;};
 if(process.env.SEA_LIFE_TABLE){console.log('before:');before.forEach(a=>console.log('  '+row(a)));console.log('after:');after.forEach(a=>console.log('  '+row(a)));}
 // Each area with new life has its own mix (no two the same).
 const sig=after.filter(a=>A.OPEN_SEA_RAY_LOOPS.some(l=>l.area===a.id)).map(a=>JSON.stringify({...a.species,fishSpots:0}));assert.equal(new Set(sig).size,sig.length,'each area keeps a distinct mix');
});

ok('caps per heat tier, battery-saver tier included; whale sharks share ONE geometry/material; nearest drawn only',()=>{
 for(const phone of [false,true])for(const t of [0,1,2,3,4]){const c=A.openSeaCounts(t,phone);assert(c.whales>=1&&c.whales<=A.MAX_WHALES_DRAWN&&c.raysPerArea<=A.MAX_RAYS_PER_AREA,'caps at tier '+t);}
 for(const phone of [false,true]){const scene=new T.Scene(),sea=createOpenSeaLife(scene,{phone}),fr=new T.Frustum();
  const ws=sea.whales.filter((w,i)=>A.OPEN_SEA_WHALE_LOOPS[i].kind==='whale-shark'),hb=sea.whales.filter((w,i)=>A.OPEN_SEA_WHALE_LOOPS[i].kind==='humpback');
  for(const [set,name] of [[ws,'whale shark'],[hb,'humpback']]){assert(set.length>=1,name);assert.equal(new Set(set.map(w=>w.mesh.geometry)).size,1,'one '+name+' geometry');assert.equal(new Set(set.map(w=>w.mesh.material)).size,1,'one '+name+' material');}
  assert.notEqual(ws[0].mesh.geometry,hb[0].mesh.geometry,'the humpback has its own shape');
  assert.equal(new Set(ws.map(w=>w.shadow.material.map)).size,1,'one seabed silhouette texture');assert.equal(new Set(hb.map(w=>w.shadow.material.map)).size,1,'one humpback silhouette');
  assert(sea.rays.islands.every(r=>r.under.isInstancedMesh),'one instanced mesh per ray area');
  for(const tier of [0,1,2,3,4]){heat.forceHeatTier(tier);const c=A.openSeaCounts(tier,phone);
   for(const r of sea.rays.islands)assert(r.under.count<=c.raysPerArea&&r.active<=c.raysPerArea,`tier ${tier}: ≤ ${c.raysPerArea} rays in ${r.island}`);
   // Stand between the main island's three whale areas: several are within draw range, only `cap` are drawn.
   for(const p of [{x:20,z:0},{x:-100,z:-200},{x:200,z:200},{x:700,z:-220}]){sea.update(1/60,false,fr,p);assert(sea.stats.whalesDrawn<=c.whales,`tier ${tier}: ≤ ${c.whales} whale sharks drawn at ${p.x},${p.z}`);}}
  heat.forceHeatTier(null);
  sea.update(1/60,false,fr,{x:1e5,z:1e5});assert.equal(sea.stats.whalesDrawn,0,'far away: no whale drawn');assert(sea.rays.islands.every(r=>!r.group.visible),'far away: no ray drawn');
  sea.dispose();}
});

ok('only near animals animate; far ones step at 15 Hz; frozen frames upload nothing',()=>{
 const scene=new T.Scene(),sea=createOpenSeaLife(scene,{phone:false}),w=sea.whales.find(x=>x.friend.id==='humpback-main-south');
 const cam=new T.PerspectiveCamera(60,1,1,1000);const f=new T.Frustum();
 const look=(px,pz,tx,tz)=>{cam.position.set(px,30,pz);cam.lookAt(tx,0,tz);cam.updateMatrixWorld();f.setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse));};
 // 100 m off the loop's box, looking at it: awake but stepping at FAR_HZ.
 const b=w.box,p={x:(b.minX+b.maxX)/2,z:b.minZ-100};look(p.x,p.z,p.x,b.maxZ);let ups=0;
 for(let i=0;i<60;i++){sea.update(1/60,false,f,p);ups+=w.stats.updated;}
 assert(ups>=12&&ups<=16,`far whale steps at ~15 Hz (${ups} updates in 1 s)`);
 const p2={x:p.x,z:b.minZ-10};look(p2.x,p2.z,p2.x,b.maxZ);ups=0;for(let i=0;i<60;i++){sea.update(1/60,false,f,p2);ups+=w.stats.updated;}assert(ups>=58,`near whale steps every frame (${ups})`);
 const u=w.friend.u;for(let i=0;i<10;i++)sea.update(0,false,f,p2);assert.equal(w.friend.u,u,'frozen frames: no movement');
 for(let i=0;i<10;i++)sea.update(1/60,true,f,p2);assert.equal(w.friend.u,u,'static ambience: no movement');
 sea.dispose();
});

ok('rides: the open-sea whale sharks and mantas are friends (eagle and sting rays only glide); a ride grabs and lets go',()=>{
 const scene=new T.Scene(),sea=createOpenSeaLife(scene,{phone:false}),f=new T.Frustum();
 const kinds=sea.friends.map(x=>x.kind);assert.equal(kinds.filter(k=>k==='whale').length,A.OPEN_SEA_WHALE_LOOPS.length,'every whale shark is ridable');
 assert.equal(kinds.filter(k=>k==='manta').length,A.OPEN_SEA_RAY_LOOPS.filter(l=>l.species==='manta').length,'only the mantas among the rays');
 const w=sea.whales.find(x=>x.friend.id==='whale-jetty-south'),o={x:0,z:0,yaw:0};R.loopPoint(w.friend.points,w.friend.lengths,w.friend.total,w.friend.u,o);
 sea.update(1/60,false,f,o);assert(w.friend.available,'the near whale is drawn');
 const rides=R.createAnimalRides(()=>sea.friends);rides.scan(.2,o.x+3,o.z,true);assert.equal(rides.state.near,w.friend,'the prompt picks the whale shark');
 const g=rides.grab(1,o.x+3,o.z,0);assert.equal(g.grabbed,'whale');assert(sea.owns(rides.state.riding),'an open-sea friend (wa:ride_open_whale)');
 // A held whale stays drawn even when the cap would pick others (player far from it in the box sense is impossible while riding).
 heat.forceHeatTier(4);sea.update(1/60,false,f,o);assert(w.friend.available,'held through a hot tier');heat.forceHeatTier(null);
 const e=rides.letGo('off');assert.equal(e.ended,'off');sea.dispose();
});

ok('analytics + wiring: count ids, the ray spot, the minimal Town hook',()=>{
 const ids=load('lib/analytics/countIds.ts');for(const id of ['wa:ride_open_whale','wa:ray_spot','wa:ride_whale'])assert(ids.FIXED_COUNT_IDS.includes(id),id+' is a known counter');
 const scene=new T.Scene(),sea=createOpenSeaLife(scene,{phone:false}),f=new T.Frustum();const r=sea.rays.islands[0],t=r.tracks[0],o={x:0,z:0,yaw:0};
 R.loopPoint(t.loop.points,t.lengths,t.total,t.u,o);sea.update(1/60,false,f,o);
 assert.equal(sea.spot(.6,o.x,o.z,false),false,'not while on land/out of the water');assert.equal(sea.spot(.6,o.x,o.z,true),true,'a near ray is spotted');assert.equal(sea.lastSpotted(),t.loop.species,'its kind is known (the ray lesson)');assert.equal(sea.spot(.6,o.x,o.z,true),false,'once per ray');sea.dispose();
 const town=fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8');
 assert.match(town,/const openSea=createOpenSeaLife\(scene\);/);assert.match(town,/\.\.\.openSea\.friends\]/);assert.match(town,/openSea\.update\(active&&!learning\?dt:0,reduced\|\|heat\.staticAmbience,world\.sharks\.frustum,location\)/);
 const sec=fs.readFileSync(path.join(base,'app/admin/WaterSection.tsx'),'utf8');
 for(const id of ['wa:ride_open_whale','wa:ray_spot'])assert(sec.includes(`value(rows,'${id}')`),id+' has its own tile in the admin Water section');
 assert.match(town,/openSea\.dispose\(\)/);assert.match(town,/countOpenSeaWhaleRide\(\)/);assert.match(town,/countRaySpot\(\)/);
});
ok('the ray lesson: 1–2 short coaching lines per ray kind, once per kind per visit, the shared toast',()=>{
 for(const k of Object.keys(A.RAY_SPECIES)){const l=A.RAY_LESSONS[k];assert(l&&l.length>=1&&l.length<=2,k+' has 1–2 lines');
  for(const x of l){assert(x.title.length<=24&&x.text.length<=130,`${k}: "${x.title}" is short`);assert(!/[<>]|https?:/.test(x.text),'plain text');}
  assert.equal(A.rayLessonFor(k,0),l[0]);assert.equal(A.rayLessonFor(k,l.length),l[0],'alternates');}
 assert.equal(A.RAY_LESSON_KIND,'Coaching idea');assert(A.RAY_LESSONS.manta.some(x=>/space/.test(x.text))&&A.RAY_LESSONS.eagle.some(x=>/space/.test(x.text)),'gliding = passing / moving into space');
 const town=fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8'),toast=fs.readFileSync(path.join(base,'components/RayLessonToast.tsx'),'utf8');
 assert.match(town,/const raysTaught=new Set<string>\(\);let rayLessons=0;/);assert.match(town,/if\(k&&!raysTaught\.has\(k\)\)\{raysTaught\.add\(k\);waterStore\.set\(\{rayLesson:\+\+rayLessons,rayKind:k\}\);\}/);
 assert.match(town,/<RayLessonToast blocked=\{toastBlocked\}\/>/);
 assert.match(toast,/export default function RayLessonToast/);assert(!/localStorage/.test(toast),'per visit: nothing saved');assert.equal((toast.match(/setTimeout\(/g)||[]).length,2,'one wait + one hide timeout');
 assert.match(toast,/toastLane\.request\('ray'\)/);
});

// Merge hygiene (Oct 20 2026): the seven dive zones (water/diveSpots.ts) landed with the open-sea animals and overlapped some
// island loops by 2–14 m. No animal loop may cross a zone's blob: sharks keep 8 m off its edge, every other animal 5 m. Fixed by
// nudging the loops (mantaLoops.ts, summitSeaLife.ts), never the zones.
ok('dive zones: no shark, manta, ray or whale loop crosses a dive patch',()=>{
 const Dv=load('lib/town/water/diveSpots.ts');
 const every=[...old,...fresh.map(l=>({k:l.kind==='whale'?'whale':'ray',id:l.id,p:l.points}))];
 for(const z of Dv.DIVE_SPOTS)for(const l of every){let g=Infinity;for(const p of l.p){const dx=p.x-z.x,dz=p.z-z.z;g=Math.min(g,Math.hypot(dx,dz)-Dv.diveBlobR(z,Math.atan2(dz,dx)));}
  const m=l.k==='shark'?8:5;assert(g>=m,`${l.id} (${l.k}) is ${g.toFixed(1)} m from the ${z.id} dive patch (≥ ${m})`);}
});
// The humpback (Oct 20 2026): a low-poly procedural whale from the whale-shark kit, South Bay's whale and the one off Summit Isle's
// south-east; no texture, one geometry, a surface cruiser whose tail lift is a shader term (no CPU), ridable like the whale sharks.
ok('the humpback: South Bay and Summit south-east, low-poly, no texture, surface cruiser with a shader tail lift, ridable',()=>{
 const H=load('lib/graphics/humpback.ts'),W=load('lib/graphics/whaleShark.ts'),hb=A.OPEN_SEA_WHALE_LOOPS.filter(l=>l.kind==='humpback');
 assert.equal(hb.map(l=>l.area).sort().join(),'main-south,summit-isle','South Bay (big) and Summit Isle');
 const se=hb.find(l=>l.area==='summit-isle');let cx=0,cz=0;for(const p of se.points){cx+=p.x;cz+=p.z;}cx/=se.points.length;cz/=se.points.length;
 assert(cx>S.SUMMIT_CENTER.x&&cz>S.SUMMIT_CENTER.z,'south-east of Summit Isle');assert(se.points.every(p=>Math.hypot(p.x-S.SUMMIT_CENTER.x,p.z-S.SUMMIT_CENTER.z)<230),'round Summit Isle');
 assert.equal(L.SUMMIT_SHARK_LOOPS.length,3,'Summit keeps three shark patrols');
 const g=H.humpbackGeometry(),tris=g.attributes.position.count/3;assert(tris>=150&&tris<=400,`low-poly (${tris} triangles)`);assert(!g.index&&g.attributes.color,'vertex colours');
 const sh=W.createWhaleSharkShared('humpback');assert.equal(sh.material.map,null,'no texture');assert.equal(sh.depth,H.HUMP_DEPTH);
 assert(H.HUMP_DEPTH.mean+H.HUMP_DEPTH.bob<.3&&H.HUMP_DEPTH.finTop-H.HUMP_DEPTH.backTop>H.HUMP_DEPTH.mean+H.HUMP_DEPTH.bob,'a surface cruiser: the fin breaks the surface');
 assert(/hbLift/.test(H.HUMP_SWIM)&&/mod\(uWhaleTime,46\.0\)/.test(H.HUMP_SWIM),'the tail lift is a vertex term on the shared clock');
 const prog={uniforms:{},vertexShader:'#include <common>\n#include <begin_vertex>\n#include <project_vertex>',fragmentShader:'#include <common>\n#include <color_fragment>'};sh.material.onBeforeCompile(prog);
 assert(prog.vertexShader.includes('hbLift')&&prog.fragmentShader.includes('knob'),'the humpback shader');assert.equal(sh.material.customProgramCacheKey(),'humpback-3d');sh.dispose();
 const scene=new T.Scene(),sea=createOpenSeaLife(scene,{phone:true});assert(hb.every(l=>sea.friends.some(f=>f.id===l.id&&f.kind==='whale')),'ridable (wa:ride_open_whale)');
 assert(A.OPEN_SEA_WHALE_LOOPS.length+1<=12&&A.MAX_WHALES_DRAWN===2,'the drawn cap is unchanged');sea.dispose();
});
console.log(`sea-life-areas: ${groups} groups passed (${A.OPEN_SEA_WHALE_LOOPS.length} open-sea whales incl. ${A.OPEN_SEA_WHALE_LOOPS.filter(l=>l.kind==='humpback').length} humpbacks, ${A.OPEN_SEA_RAY_LOOPS.length} rays in ${A.OPEN_SEA_RAY_GROUPS.length} areas)`);
