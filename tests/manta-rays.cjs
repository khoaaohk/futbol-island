// Manta rays round the smaller islands (Sep 30 2026): every glide loop stays in open water round Coral Cay and both
// sandbars (clear of the shallows, the causeway, its sharks and buoy, the Deep Sea Boat, the ferry and the East Jetty, and
// inside the flight zone), the per-island counts (desktop and phone), the shared low-poly model, and the heat hooks:
// far islands hidden, off-screen islands asleep, frozen frames and reduced motion upload nothing, surfacing is rare and
// bounded, no allocations in the per-frame path, and the wiring into the island's existing frame update.
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,Float32Array,require:id=>id==='three'?T:id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const cay=load('lib/town/coralCay.ts'),{flightBlocked}=load('lib/town/simulation.ts'),{onLand,distanceToLand}=load('lib/town/landmass.ts');
const M=load('lib/town/mantaLoops.ts'),{BOAT_MOORING}=load('lib/town/fishing/deepSeaBoatData.ts'),{EAST_PIER}=load('lib/town/eastPier.ts');
const {CORAL_CAY_SPOTS}=load('lib/town/coralCayBalls.ts'),buoy=CORAL_CAY_SPOTS.find(s=>s.buoy);
const G=load('lib/graphics/cayMantas.ts');
const same=(a,b,msg)=>assert.equal(JSON.stringify(a),JSON.stringify(b),msg); // values cross vm contexts

// ---- Paths: open water only, clear of everything else on the sea.
const loops=M.MANTA_LOOPS,sharks=cay.SHARK_LOOPS.flatMap(l=>l.points),FERRY={x:246,z:199};
for(const l of loops){
 assert(l.points.length>=40,l.id+' is a smooth sampled loop');
 for(let i=0;i<l.points.length;i++){const a=l.points[i],b=l.points[(i+1)%l.points.length];
  assert(Math.hypot(b.x-a.x,b.z-a.z)<8,l.id+' has no jumps');
  for(let t=0;t<1;t+=.25){const x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,where=`${l.id} at ${x.toFixed(1)},${z.toFixed(1)}`;
   assert(!onLand(x,z),where+' is in the water');
   // A manta is ~5.5 m across: 10 m keeps its silhouette off the sand and the 5 m shallows band.
   assert(distanceToLand(x,z)>=10,where+' clears the islands and their shallows ('+distanceToLand(x,z).toFixed(1)+' m)');
   assert(cay.causewayFrame(x,z,true).dist>=30,where+' keeps off the causeway');
   assert(!flightBlocked(x,z),where+' is inside the flight zone (seen from the jetpack)');
   assert(sharks.every(p=>Math.hypot(p.x-x,p.z-z)>=12),where+' keeps out of the sharks\' patrols');
   assert(Math.hypot(buoy.x-x,buoy.z-z)>=30,where+' keeps clear of the causeway buoy');
   assert(Math.hypot(BOAT_MOORING.x-x,BOAT_MOORING.z-z)>=80,where+' keeps clear of the Deep Sea Boat');
   assert(Math.hypot(FERRY.x-x,FERRY.z-z)>=200&&Math.hypot(EAST_PIER.cx-x,EAST_PIER.cz-z)>=150,where+' is nowhere near the ferry or the East Jetty');}}
 // Smooth: the heading turns gently from sample to sample (no kinks or hairpins).
 let worst=0;for(let i=0;i<l.points.length;i++){const p=l.points[(i+l.points.length-1)%l.points.length],c=l.points[i],n=l.points[(i+1)%l.points.length];
  let d=Math.atan2(n.z-c.z,n.x-c.x)-Math.atan2(c.z-p.z,c.x-p.x);d=Math.atan2(Math.sin(d),Math.cos(d));worst=Math.max(worst,Math.abs(d));}
 assert(worst<.8,l.id+' turns smoothly (worst '+worst.toFixed(2)+' rad per sample)');
 // Each loop circles its own island: centred on it, within the near water.
 const home=l.island==='cay'?cay.CAY_CENTER:cay.SANDBARS.find(s=>s.id===l.island),far=l.island==='cay'?160:70;
 assert(l.points.every(p=>Math.hypot(p.x-home.x,p.z-home.z)<far),l.id+' stays round its island');
}
for(const a of loops)for(const b of loops)if(a!==b){let gap=Infinity;for(const p of a.points)for(const q of b.points)gap=Math.min(gap,Math.hypot(p.x-q.x,p.z-q.z));assert(gap>=7,`${a.id} and ${b.id} never overlap (${gap.toFixed(1)} m)`);}
// Cay loops never touch the west side, where the causeway lands.
for(const l of loops.filter(l=>l.island==='cay'))assert(l.points.every(p=>p.x>cay.CAY_CENTER.x-80||Math.abs(p.z-cay.CAUSEWAY.z)>60),l.id+' avoids the causeway landfall');

// ---- Counts per island (2–3 each; phones keep two round the cay).
const count=(phone)=>Object.fromEntries(M.MANTA_ISLANDS.map(i=>[i,M.mantaLoopsFor(i,phone).length]));
same(count(false),{cay:3,starfish:2,turtle:2},'desktop: 3 round the cay, 2 per sandbar');
same(count(true),{cay:2,starfish:2,turtle:2},'phone: 2 per island');

// ---- Model: shared, low-poly, dark top / pale belly, no shadows, one draw per island while gliding.
const geo=G.mantaGeometry(),tris=geo.getAttribute('position').count/3;assert(tris<=160,'low-poly manta ('+tris+' triangles)');
{const pos=geo.getAttribute('position'),col=geo.getAttribute('color'),nor=geo.getAttribute('normal');let topDark=0,bellyPale=0;
 for(let i=0;i<pos.count;i++){const lum=col.getX(i)+col.getY(i)+col.getZ(i);if(nor.getY(i)>.5&&lum<.9)topDark++;if(nor.getY(i)<-.5&&lum>2)bellyPale++;}
 assert(topDark>40&&bellyPale>40,'dark top and pale belly');
 let fins=0;for(let i=0;i<pos.count;i++)if(pos.getX(i)>1.3)fins++;assert(fins>=8,'cephalic fins reach forward of the head');}
assert(/aPhase/.test(G.WING_WAVE)&&/uMantaTime/.test(G.WING_WAVE),'wing wave runs in the vertex shader');
function make(phone){const scene=new T.Scene();return {scene,mantas:G.createCayMantas(scene,{phone})};}
const {scene,mantas}=make(false);
{const meshes=[];scene.traverse(o=>{if(o.isInstancedMesh)meshes.push(o);});
 assert.equal(meshes.length,6,'two instanced meshes per island');
 assert(meshes.every(m=>!m.castShadow&&!m.receiveShadow&&m.frustumCulled&&m.boundingSphere),'no shadows, fixed culling bounds');
 assert.equal(new Set(meshes.map(m=>m.material)).size,2,'two shared materials');
 assert.equal(new Set(meshes.map(m=>m.geometry.getAttribute('position'))).size,1,'one shared vertex buffer');
 same(mantas.islands.map(r=>r.under.count),[3,2,2],'silhouettes per island');
 assert(mantas.islands.every(r=>!r.surface.visible),'no surfacing mesh drawn while gliding');}
same(make(true).mantas.islands.map(r=>r.under.count),[2,2,2],'phone silhouettes per island');

// ---- Culling and sleep.
const cam=new T.PerspectiveCamera(60,390/844,.1,900),frustum=new T.Frustum(),vp=new T.Matrix4();
const look=(from,to)=>{cam.position.set(from.x,30,from.z);cam.lookAt(to.x,0,to.z);cam.updateMatrixWorld();vp.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);frustum.setFromProjectionMatrix(vp);};
const ver=(r)=>r.under.instanceMatrix.version;
const turtle=mantas.islands.find(r=>r.island==='turtle'),cayR=mantas.islands.find(r=>r.island==='cay'),star=mantas.islands.find(r=>r.island==='starfish');
const T0=cay.SANDBARS[1],nearTurtle={x:T0.x,z:T0.z+40};
// Far away (Island Square): every island hidden, nothing moves.
look({x:60,z:0},{x:60,z:-40});mantas.update(1/30,false,frustum,{x:60,z:0});
assert(mantas.islands.every(r=>!r.group.visible)&&mantas.stats.updated===0&&mantas.stats.visibleIslands===0,'from the main island: hidden, 0 updates');
// Near Turtle Sandbar and looking at it: that island moves, the far cay does not.
look(nearTurtle,T0);let v=ver(turtle);mantas.update(1/30,false,frustum,nearTurtle);
assert(turtle.group.visible&&ver(turtle)>v,'Turtle Sandbar mantas glide when near and on screen');
assert.equal(mantas.stats.updated,2,'only the near island updates ('+mantas.stats.updated+')');
// Still near (on the causeway above the sandbar) but looking away, north: asleep, no matrix upload.
const roadside={x:T0.x,z:T0.z-50};look(roadside,{x:T0.x,z:T0.z-450});v=ver(turtle);mantas.update(1/30,false,frustum,roadside);
assert(turtle.group.visible,'still drawn (cheap) while near');
assert.equal(ver(turtle),v,'looking away: no upload');assert.equal(mantas.stats.updated,0,'looking away: 0 updates');
// Frozen frame (dt 0: map open, lessons) and reduced motion: placed once, then nothing.
look(nearTurtle,T0);v=ver(turtle);mantas.update(0,false,frustum,nearTurtle);assert.equal(ver(turtle),v,'frozen frame uploads nothing');
mantas.update(1/30,true,frustum,nearTurtle);const placed=ver(turtle);assert(placed>v,'reduced motion places the mantas once (static glide)');
const t0=mantas.time.value;for(let i=0;i<30;i++)mantas.update(1/30,true,frustum,nearTurtle);
assert(ver(turtle)===placed&&mantas.time.value===t0&&!turtle.surface.visible,'reduced motion: static, no flapping, no surfacing');
mantas.update(1/30,false,frustum,nearTurtle);assert(ver(turtle)>placed&&mantas.time.value>t0,'motion resumes when allowed');

// ---- Surfacing: rare and bounded (≤ 1 per island at a time, ≤ 3.2 s, gaps of 22–50 s while awake).
{const {mantas:m}=make(false),r=m.islands.find(r=>r.island==='turtle');let longest=0,run=0,events=0,was=false,maxY=-9;const mat=new T.Matrix4(),p=new T.Vector3();
 look(nearTurtle,T0);
 for(let i=0;i<30*600;i++){m.update(1/30,false,frustum,nearTurtle);const on=r.surface.visible;
  if(on){run+=1/30;r.surface.getMatrixAt(0,mat);p.setFromMatrixPosition(mat);maxY=Math.max(maxY,p.y);}else run=0;
  if(on&&!was)events++;was=on;longest=Math.max(longest,run);
  assert(r.surface.count===1,'one surfacing slot');}
 assert(events>=600/52&&events<=600/22+1,`${events} surfacings in 10 awake minutes`);
 assert(longest<=G.MANTA_EVENT.wingtip+.05,'each surfacing ends within '+G.MANTA_EVENT.wingtip+' s');
 assert(maxY>1&&maxY<2.2,'a breach clears the water gently ('+maxY.toFixed(2)+' m)');
 assert(r.events>0&&m.stats.events===events,'events counted');}

// ---- No per-frame allocations: the update/place/event code builds no objects or arrays.
{const src=fs.readFileSync(path.join(base,'lib/graphics/cayMantas.ts'),'utf8');
 const body=(name)=>{const i=src.indexOf('function '+name+'(');assert(i>0,name);let depth=0,j=src.indexOf('{',i);const start=j;for(;j<src.length;j++){if(src[j]==='{')depth++;else if(src[j]==='}'&&--depth===0)break;}return src.slice(start,j);};
 for(const name of ['place','update','startEvent','endEvent'])assert(!/\bnew\s|\[\s*\]|\.map\(|\.filter\(|=>\s*\(/.test(body(name)),name+' allocates nothing per frame');}

// ---- Wiring: created next to the sharks, updated in the same Coral Cay frame hook (which Town feeds dt 0 when frozen,
// and which never runs while the island loop sleeps behind overlays), disposed with the world.
{const world=fs.readFileSync(path.join(base,'lib/town/world.ts'),'utf8'),town=fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8');
 assert(/const mantas=createCayMantas\(scene\)/.test(world),'world creates the mantas');
 assert(/sharks\.update\(dt,reduced,camera,player\);mantas\.update\(dt,reduced,sharks\.frustum,player\)/.test(world),'mantas share the sharks\' frame hook and frustum');
 assert(/mantas\.dispose\(\)/.test(world)&&/return \{sharks,mantas,/.test(world),'disposed with the world and exposed for checks');
 assert(/world\.updateSharks\(active&&!learning\?dt:0,reduced\|\|heat\.staticAmbience,camera,location\)/.test(town),'Town freezes the hook (dt 0) and passes reduced motion / static ambience');}

// ---- Football tie-in: Nia (Starfish Sandbar lifeguard) explains the mantas and links them to a soft first touch.
{const {CORAL_CAY_NPCS}=load('lib/town/coralCayNpcs.ts'),nia=CORAL_CAY_NPCS.find(n=>n.id==='sandbar-nia'),t=nia.topics.find(t=>t.id==='mantas');
 assert(t&&/plankton/.test(t.answer)&&/first touch/i.test(t.followUp.answer),'Nia teaches the manta / first-touch link');
 assert(/manta/i.test(nia.greeting),'Nia mentions the mantas when you meet her');}

console.log(`PASS manta rays: ${loops.length} loops (cay 3/2 phone, sandbars 2 each), ${tris} triangles, open water ≥ 10 m from land, clear of causeway/sharks/buoy/boat, culling + sleep + reduced motion, rare bounded surfacing, Nia's first-touch lesson`);
