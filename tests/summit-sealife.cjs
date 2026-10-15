// Sea life round Summit Isle (Oct 14 2026, user: "add some sharks, manta rays and even a whale shark around the mountain island").
// Paths: every shark, manta and whale-shark loop stays in open water deep enough for its animal, clear of the three fishing
// floats and their cast lines, the sandbar, Coral Cay's own sharks and mantas, and inside the flight zone. Counts per heat tier
// (desktop and phone). The whale shark's look (broad flat head, dark mouth, tall tail, spot-and-stripe shader, one draw). Heat:
// everything hidden from the main island, asleep when looking away, frozen frames / static ambience upload nothing, the
// draw-call budget at the island, no per-frame allocations, and the wiring into the island's existing frame hook.
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,Float32Array,Float64Array,require:id=>id==='three'?T:id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const S=load('lib/town/summitIsle.ts'),cay=load('lib/town/coralCay.ts'),L=load('lib/town/summitSeaLife.ts'),M=load('lib/town/mantaLoops.ts');
const {flightBlocked}=load('lib/town/simulation.ts'),{onLand,distanceToLand}=load('lib/town/landmass.ts'),{FISH_SPOTS}=load('lib/town/fishing/fishCatalog.ts');
const heat=load('lib/graphics/heatTier.ts'),{createCaySharks}=load('lib/graphics/caySharks.ts'),{createCayMantas}=load('lib/graphics/cayMantas.ts'),W=load('lib/graphics/whaleShark.ts');
const same=(a,b,msg)=>assert.equal(JSON.stringify(a),JSON.stringify(b),msg);

// ---- Paths.
const spots=FISH_SPOTS.filter(s=>s.area==='summit');assert.equal(spots.length,4,'Boulder Cove, Palm Point, Lookout Rocks and Drop-off Ledge (Oct 14 2026)');
const segment=(x,z,a,b)=>{const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz);};
const summitMantas=M.MANTA_LOOPS.filter(l=>l.island==='summit');
const creatures=[...L.SUMMIT_SHARK_LOOPS.map(l=>({...l,kind:'shark',land:25,turn:.9})),...summitMantas.map(l=>({...l,kind:'manta',land:10,turn:.8})),{...L.WHALE_SHARK_LOOP,kind:'whale',land:20,turn:.5}];
const cayCreatures=[...cay.SHARK_LOOPS,...M.MANTA_LOOPS.filter(l=>l.island!=='summit')].flatMap(l=>l.points);
assert.equal(L.SUMMIT_SHARK_LOOPS.length,3,'three sharks');assert.equal(summitMantas.length,3,'three manta bays');
for(const l of creatures){
 assert(l.points.length>=40,l.id+' is a smooth sampled loop');
 for(let i=0;i<l.points.length;i++){const a=l.points[i],b=l.points[(i+1)%l.points.length];
  assert(Math.hypot(b.x-a.x,b.z-a.z)<8,l.id+' has no jumps');
  for(let t=0;t<1;t+=.25){const x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,where=`${l.id} at ${x.toFixed(1)},${z.toFixed(1)}`;
   assert(!onLand(x,z),where+' is in the water');
   // Deep enough for the animal: sharks and the whale shark well out past the beach shelf, mantas in the bays (≥ 10 m, like the cay's).
   assert(distanceToLand(x,z)>=l.land,`${where} is ${distanceToLand(x,z).toFixed(1)} m from land (≥ ${l.land} for a ${l.kind})`);
   assert(S.sandbarFrame(x,z).dist>=20,where+' keeps off the sandbar');
   assert(!flightBlocked(x,z),where+' is inside the flight zone (seen from the jetpack)');
   for(const s of spots){assert(Math.hypot(s.buoy.x-x,s.buoy.z-z)>=30,`${where} keeps clear of ${s.name}'s float`);assert(segment(x,z,s,s.buoy)>=30,`${where} keeps clear of ${s.name}'s cast`);}
   assert(cayCreatures.every(p=>Math.hypot(p.x-x,p.z-z)>=12),where+' keeps out of Coral Cay\'s sharks and mantas');
   assert(Math.hypot(x-S.SUMMIT_CENTER.x,z-S.SUMMIT_CENTER.z)<230,where+' circles Summit Isle');}}
 let worst=0;for(let i=0;i<l.points.length;i++){const p=l.points[(i+l.points.length-1)%l.points.length],c=l.points[i],n=l.points[(i+1)%l.points.length];
  let d=Math.atan2(n.z-c.z,n.x-c.x)-Math.atan2(c.z-p.z,c.x-p.x);d=Math.atan2(Math.sin(d),Math.cos(d));worst=Math.max(worst,Math.abs(d));}
 assert(worst<l.turn,`${l.id} turns smoothly (worst ${worst.toFixed(2)} rad per sample)`);
}
for(const a of creatures)for(const b of creatures)if(a!==b){let gap=Infinity;for(const p of a.points)for(const q of b.points)gap=Math.min(gap,Math.hypot(p.x-q.x,p.z-q.z));
 assert(gap>=(a.kind==='whale'||b.kind==='whale'?40:8),`${a.id} and ${b.id} never overlap (${gap.toFixed(1)} m)`);}
// The whale shark is off the north-west coast, the side the summit lookout and the follow camera face (towards Coral Cay and the
// main island), beyond Lookout Rocks' float: much of its loop is in the frame from the lookout (Town's camera: 40° FOV, 18 m
// east, 23 m up, 30 m south of the player).
{const lk=S.SUMMIT_LANDMARKS.lookout,w=L.WHALE_SHARK_LOOP.points;
 assert(w.every(p=>p.x<S.SUMMIT_CENTER.x-40&&p.z<S.SUMMIT_CENTER.z),'whale shark off the north-west coast');
 for(const [aspect,share] of [[1440/900,.5],[390/844,.25]]){const cam=new T.PerspectiveCamera(40,aspect,1,500),g=S.summitGround(lk.x,lk.z);cam.position.set(lk.x+18,g+23,lk.z+30);cam.lookAt(lk.x,g,lk.z);cam.updateMatrixWorld();
  const seen=w.filter(p=>{const v=new T.Vector3(p.x,-.4,p.z).project(cam);return Math.abs(v.x)<1&&Math.abs(v.y)<1&&v.z<1;}).length/w.length;
  assert(seen>=share,`${Math.round(seen*100)}% of the whale shark's loop is in the frame from the lookout (${aspect>1?'desktop':'phone'})`);}
 assert(L.WHALE_SHARK_LOOP.speed<L.SUMMIT_SHARK_LOOPS.reduce((m,l)=>Math.min(m,l.speed),9),'slower than every shark');}

// ---- Counts per heat tier.
same([0,1,2,3,4].map(t=>L.summitSeaLifeCounts(t,false)),[{sharks:3,mantas:3,whaleShark:1},{sharks:2,mantas:2,whaleShark:1},{sharks:2,mantas:2,whaleShark:1},{sharks:2,mantas:1,whaleShark:1},{sharks:1,mantas:0,whaleShark:1}],'desktop counts by tier');
same(L.summitSeaLifeCounts(0,true),{sharks:3,mantas:2,whaleShark:1},'a cool phone: 3 sharks, 2 mantas, the whale shark');
function make(phone){const scene=new T.Scene();return {scene,sharks:createCaySharks(scene,{phone}),mantas:createCayMantas(scene,{phone}),whale:W.createWhaleShark(scene)};}
for(const phone of [false,true]){const w=make(phone),sr=w.sharks.regions.find(r=>r.region==='summit'),mr=w.mantas.islands.find(r=>r.island==='summit'),cr=w.sharks.regions.find(r=>r.region==='causeway');
 for(const tier of [0,1,2,3,4]){heat.forceHeatTier(tier);const want=L.summitSeaLifeCounts(tier,phone);
  assert.equal(sr.fins.count,want.sharks,`tier ${tier}: summit shark fins`);assert.equal(sr.bodies.count,want.sharks,`tier ${tier}: summit shark bodies`);
  assert.equal(mr.under.count,want.mantas,`tier ${tier}: summit mantas`);assert.equal(cr.fins.count,6,'the causeway keeps its six sharks at every tier');}
 heat.forceHeatTier(null);assert.equal(sr.fins.count,3,'back to three when the tier cools');
 w.sharks.dispose();w.mantas.dispose();w.whale.dispose();}

// ---- The whale shark's look: one low-poly mesh, broad flat head with a dark mouth across it, tall tail, spotted back.
const geo=W.whaleSharkGeometry(),tris=geo.getAttribute('position').count/3;
{geo.computeBoundingBox();const b=geo.boundingBox,len=b.max.x-b.min.x;
 assert(tris<=400,`low-poly (${tris} triangles)`);
 assert(len>=11&&len<=15,`about 13 m long (${len.toFixed(1)} m), 2–3× a shark (${(3.4*1.7).toFixed(1)} m)`);
 assert(b.max.y>=2.4,'the tall upper tail lobe stands clear of the water');
 const pos=geo.getAttribute('position'),col=geo.getAttribute('color');let headW=0,mouth=0,dark=0;
 for(let i=0;i<pos.count;i++){const x=pos.getX(i),lum=col.getX(i)+col.getY(i)+col.getZ(i);if(x>5.4)headW=Math.max(headW,Math.abs(pos.getZ(i)));if(x>6&&lum<.4)mouth++;if(pos.getY(i)>.3&&x<5&&lum<1.2)dark++;}
 {const nor=geo.getAttribute('normal');let up=0,down=0;for(let i=0;i<pos.count;i++){if(pos.getX(i)>.5&&pos.getX(i)<5.5&&Math.abs(pos.getZ(i))<1.4&&pos.getY(i)>.2){if(nor.getY(i)>.5)up++;else if(nor.getY(i)<-.5)down++;}}
  assert(up>40&&down===0,`the back faces up (front faces, so it is not culled): ${up} up, ${down} down`);}
 assert(headW>=1.3,`broad flat head (${(headW*2).toFixed(1)} m across the front)`);assert(mouth>=12,'a dark, wide mouth across the front');assert(dark>50,'dark blue-grey back');}
assert(/wsHash/.test(W.PATTERN_FRAGMENT)&&/stripe/.test(W.PATTERN_FRAGMENT)&&/spot/.test(W.PATTERN_FRAGMENT),'spots and stripes in the fragment shader (no texture)');
assert(/uWhaleTime/.test(W.TAIL_SWEEP),'tail sweep in the vertex shader');

// ---- Heat: draw budget, culling and sleep.
const {scene,sharks,mantas,whale}=make(true);
{const draws=[];scene.traverse(o=>{if(o.isMesh)draws.push(o);});
 assert(draws.every(m=>!m.castShadow&&!m.receiveShadow&&m.frustumCulled),'no shadows, culled');
 // Oct 14 2026 (user: "more of just a shadow"): a flat, see-through dark silhouette just under the surface, like the mantas'.
 assert(!whale.mesh.material.map&&whale.mesh.material.transparent&&whale.mesh.material.opacity<=.45&&!whale.mesh.material.depthWrite,'whale shark: a soft underwater shadow, no texture');
 assert(whale.mesh.scale.y<=.06,'whale shark: flattened, nothing stands out of the water');
 const summitDraws=[sharks.regions.find(r=>r.region==='summit').fins,sharks.regions.find(r=>r.region==='summit').bodies,mantas.islands.find(r=>r.island==='summit').under,whale.mesh];
 assert.equal(summitDraws.length,4,'Summit Isle sea life: 4 draw calls (shark fins, shark bodies, manta silhouettes, the whale shark), +1 only during a rare manta surfacing');}
const cam=new T.PerspectiveCamera(60,390/844,.1,900),frustum=new T.Frustum(),vp=new T.Matrix4();
const look=(from,to,y=30,ty=0)=>{cam.position.set(from.x,y,from.z);cam.lookAt(to.x,ty,to.z);cam.updateMatrixWorld();vp.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);frustum.setFromProjectionMatrix(vp);};
const sr=sharks.regions.find(r=>r.region==='summit'),mr=mantas.islands.find(r=>r.island==='summit');
const step=(dt,reduced,from)=>{sharks.update(dt,reduced,cam,from);mantas.update(dt,reduced,sharks.frustum,from);whale.update(dt,reduced,sharks.frustum,from);};
// From the main island (Island Square): nothing at Summit Isle draws or moves.
look({x:60,z:0},{x:60,z:-40});step(1/30,false,{x:60,z:0});
assert(!sr.group.visible&&!mr.group.visible&&!whale.root.visible&&whale.stats.updated===0,'from the main island: Summit Isle sea life hidden, 0 updates');
// On the north-west beach looking out to sea: the whale shark swims.
const west=S.beachPoint(-2.6,.3);step(0,false,west);const at=()=>({x:whale.mesh.position.x,z:whale.mesh.position.z});look(west,at());const p0=whale.mesh.position.clone();step(1/30,false,west);step(1/30,false,west);
assert(whale.root.visible&&whale.stats.awake&&whale.stats.updated===1&&whale.mesh.position.distanceTo(p0)>0,'whale shark swims when near and on screen');
// The summit lookout, looking west over the sea: whale shark in view and awake (the lookout is within its wake-up range).
{const lk=S.SUMMIT_LANDMARKS.lookout;const g=S.summitGround(lk.x,lk.z);look({x:lk.x+18,z:lk.z+30},lk,g+23,g);step(1/30,false,lk);assert(whale.stats.awake,'awake as seen from the summit lookout');}
// Same beach, looking inland (east, up the mountain): drawn (cheap) but asleep, nothing uploads.
look(west,{x:west.x+200,z:west.z+100},2);const v=whale.mesh.matrix.clone(),sv=sr.fins.instanceMatrix.version;step(1/30,false,west);
assert(whale.root.visible&&!whale.stats.awake&&whale.mesh.matrix.equals(v),'looking away: whale shark asleep');
// South beach looking out: the sharks swim; frozen frame and static ambience upload nothing.
const south=S.SUMMIT_LANDMARKS.southBeach;look(south,{x:south.x,z:south.z+80});let ver=sr.fins.instanceMatrix.version;step(1/30,false,south);
assert(sr.group.visible&&sr.fins.instanceMatrix.version>ver,'summit sharks cruise when near and on screen');
ver=sr.fins.instanceMatrix.version;const t0=whale.time.value;step(0,false,south);assert.equal(sr.fins.instanceMatrix.version,ver,'frozen frame: no shark upload');
look(west,at());const wm=whale.mesh.matrix.clone();step(0,false,west);assert(whale.mesh.matrix.equals(wm)&&whale.time.value===t0,'frozen frame: whale shark still');
step(1/30,true,west);const placed=whale.mesh.matrix.clone();for(let i=0;i<20;i++)step(1/30,true,west);
assert(whale.mesh.matrix.equals(placed)&&whale.time.value===t0,'static ambience / reduced motion: placed once, then still');
step(1/30,false,west);assert(!whale.mesh.matrix.equals(placed),'motion resumes when allowed');
void sv;

// ---- No per-frame allocations in the whale shark's or the sharks' frame path.
for(const file of ['lib/graphics/whaleShark.ts','lib/graphics/caySharks.ts']){const src=fs.readFileSync(path.join(base,file),'utf8');
 const body=(name)=>{const i=src.indexOf('function '+name+'(');assert(i>0,name);let depth=0,j=src.indexOf('{',i);const start=j;for(;j<src.length;j++){if(src[j]==='{')depth++;else if(src[j]==='}'&&--depth===0)break;}return src.slice(start,j);};
 for(const name of ['place','update'])assert(!/\bnew\s|\[\s*\]|\.map\(|\.filter\(|\.forEach\(|=>\s*\(/.test(body(name)),`${file} ${name} allocates nothing per frame`);}

// ---- Wiring: the island's existing frame hook (Town freezes it with dt 0 and passes static ambience), disposed with the world.
{const world=fs.readFileSync(path.join(base,'lib/town/world.ts'),'utf8');
 assert(/const whaleShark=createWhaleShark\(scene\)/.test(world),'world creates the whale shark');
 assert(/mantas\.update\(dt,reduced,sharks\.frustum,player\);whaleShark\.update\(dt,reduced,sharks\.frustum,player\)/.test(world),'whale shark shares the sharks\' frame hook and frustum');
 assert(/whaleShark\.dispose\(\)/.test(world),'disposed with the world');}

console.log(`PASS Summit Isle sea life: ${L.SUMMIT_SHARK_LOOPS.length} sharks, ${summitMantas.length} mantas (2 on phones), 1 whale shark (${tris} triangles); by tier 0-4: sharks 3/2/2/2/1, mantas 3 (phone 2)/2/2/1/0, whale shark 1; open water, clear of the 3 fishing floats, the sandbar and Coral Cay's creatures; hidden from the main island, asleep looking away, still when frozen; 4 draws`);
