// Every island job sign is reachable on foot and offers its job (bug, Sep 30 2026: "Flag the offside" stood inside the High School
// east wing, so the walkable height there read 13–15 m against a ground of 0 and walking up never offered the job).
// Headless: the real town (lib/town/world.ts buildTown) gives the buildings, roofs and obstacles; the real on-foot travel
// (lib/town/rooftopTravel.ts) walks the player up to each sign; the real job scene (lib/town/jobs/jobScene.ts) runs its update.
// Also: the job badges' wake range is measured from the player (heat audit #9) and shows exactly the badges the camera rule did.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
function fixture(){
 const cache=new Map(),storage=new Map(),gradient={addColorStop(){}};
 const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
 const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
 const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,queueMicrotask,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,
  window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage,document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
 function load(name){
  let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
  if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,allowJs:true}}).outputText;
  const r=id=>id==='react'?{useSyncExternalStore:(_s,get)=>get(),useEffect(){},useState(){},useRef(){},createContext(){}}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('@/')?load(id.slice(2)):
   id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8')):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
  vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
 return {load};
}
const F=fixture(),world=F.load('lib/town/world.ts').buildTown(new T.Scene());
const {createRooftopTravel}=F.load('lib/town/rooftopTravel.ts'),V=F.load('lib/town/venues.ts'),C=F.load('lib/town/jobs/jobCatalog.ts'),S=F.load('lib/town/jobs/jobScene.ts');
const floor=(x,z)=>V.fieldSurfaceHeight(x,z),DT=1/30;
const travel=start=>createRooftopTravel([...world.buildings,...world.walkSurfaces],world.obstacles,start,world.roofObstacles,()=>0,world.landingExclusions);
assert(world.buildings.some(b=>b.name==='HIGH SCHOOL EAST WING'),'the fixture builds the real town (the school wing that hid the offside sign)');

// 1. The ground under and around each sign is the sign's own floor (no roof over it), within 1.5 m.
const probe=travel({x:0,z:0});
for(const job of C.JOBS){const {x,z}=job.board,g=floor(x,z);
 for(let r=0;r<=2;r+=1)for(let a=0;a<8;a++){const px=x+Math.cos(a*Math.PI/4)*r,pz=z+Math.sin(a*Math.PI/4)*r,h=probe.surface(px,pz);
  assert(Math.abs(h-g)<=1.5,`${job.id}: walkable height ${h.toFixed(2)} m at (${px.toFixed(1)}, ${pz.toFixed(1)}) is within 1.5 m of the sign's floor ${g.toFixed(2)} m`);if(!r)break;}
 // Its task spots and drop-off are standable too (the offside flag spot used to be inside the school wall).
 for(const t of [...job.targets,...(job.deliver?[job.deliver]:[])]){const h=probe.surface(t.x,t.z);assert(Math.abs(h-floor(t.x,t.z))<=1.5,`${job.id}: spot (${t.x}, ${t.z}) is not under a roof (${h.toFixed(2)} m)`);}}

// 1b. Off the pitch (Oct 1 2026, user): the cone marks (beside the 9v9 pitch) and the ball kid's loose balls and ball box (around
// the 11v11 pitch) are on open grass, checked on the real town: outside every pitch rectangle (a match is played there; loose balls
// ≥ 3 m out), off every road and its sidewalks (the road footprint), ≥ 1.6 m from every obstacle and building.
{const boxGap=(q,o)=>Math.hypot(Math.max(0,Math.abs(q.x-o.x)-o.w/2),Math.max(0,Math.abs(q.z-o.z)-o.d/2));
 assert(world.roads.length>10&&world.obstacles.length>100,'the fixture returns the real roads and obstacles');
 const kid=C.jobById('ball-kid'),cones=C.jobById('cone-setup');
 const spots=[...cones.targets.map(q=>[q,'cone mark',1]),[cones.board,'cone sign',1],...kid.targets.map(q=>[q,'loose ball',3]),[kid.deliver,'ball box',3]];
 for(const [q,what,out] of spots){
  for(const v of V.VENUES)assert(Math.abs(q.x-v.x)>v.width/2+out||Math.abs(q.z-v.z)>v.length/2+out,`${what} (${q.x}, ${q.z}) is ≥ ${out} m outside the ${v.name} pitch`);
  for(const r of world.roads)assert(boxGap(q,r)>=1,`${what} (${q.x}, ${q.z}) is ≥ 1 m off the road and sidewalk at (${r.x}, ${r.z})`);
  for(const o of world.obstacles)assert(boxGap(q,o)>=1.6,`${what} (${q.x}, ${q.z}) clears the obstacle at (${o.x.toFixed(1)}, ${o.z.toFixed(1)}) by ≥ 1.6 m (${boxGap(q,o).toFixed(2)})`);
  for(const b of world.buildings)assert(boxGap(q,b)>=1.6,`${what} clear of ${b.name}`);}
 const park=V.venueById('11v11'),side=q=>Math.abs(q.x-park.x)>park.width/2?'touchline':'goal line';
 assert(new Set(kid.targets.map(side)).size===2,'loose balls lie over the touchline and behind the goal lines');
 assert(kid.targets.some(q=>q.z<park.z)&&kid.targets.some(q=>q.z>park.z),'behind both ends');}

// 2. Walk up to each sign on foot (real collisions) from 9 m out in front, and the job is offered.
const scene=S.createJobScene(new T.Scene(),{storage:null,now:()=>Date.parse('2026-09-30T10:00:00')});
for(const job of C.JOBS){const b=job.board,fx=Math.sin(b.yaw),fz=Math.cos(b.yaw);
 const p={x:b.x+fx*9,z:b.z+fz*9},v={x:0,z:0},rt=travel(p);rt.reset(p.x,p.z);
 assert(Math.abs(rt.state.height-floor(p.x,p.z))<=1.5,`${job.id}: the approach starts on the ground`);
 let offered=false;for(let t=0;t<6&&!offered;t+=DT){const dx=b.x-p.x,dz=b.z-p.z,d=Math.hypot(dx,dz);rt.update(DT,p,v,d>2.2?{x:dx/d,z:dz/d,sprint:false}:{x:0,z:0,sprint:false},'walk');
  scene.update(DT,{x:p.x,y:rt.state.height,z:p.z},null,true,true,false);offered=scene.getView().near===job.id;}
 assert(offered,`${job.id}: walking up to the sign offers the job (stopped at ${Math.hypot(b.x-p.x,b.z-p.z).toFixed(1)} m, height ${rt.state.height.toFixed(2)} m)`);
 assert(Math.abs(rt.state.height-floor(b.x,b.z))<1.5,`${job.id}: the player is on the sign's floor`);
 // The task spot is reachable on foot from the sign (within the job's own radius).
 const goal=job.targets[0];if(goal){const q={x:p.x,z:p.z},w={x:0,z:0},rt2=travel(q);rt2.reset(q.x,q.z);let best=Infinity;
  for(let t=0;t<30&&best>job.radius*.8;t+=DT){const dx=goal.x-q.x,dz=goal.z-q.z,d=Math.hypot(dx,dz);best=Math.min(best,d);rt2.update(DT,q,w,{x:dx/d,z:dz/d,sprint:false},'walk');}
  if(job.kind==='offside')assert(best<=job.radius*.8,`${job.id}: the flag spot is reachable (closest ${best.toFixed(2)} m)`);}
 scene.update(DT,{x:b.x+80,y:0,z:b.z},null,true,true,false);}
scene.dispose();

// 3. Job badges (heat audit #9): waking against the player shows exactly the badges the old camera rule showed, from the follow
// camera (≈37 m behind, 18 m up) and a flying camera, all round the island; with none in view nothing is uploaded.
{const {createJobBadges}=F.load('lib/town/jobs/jobBadges.ts'),spots=C.JOBS.map(j=>({id:j.id,x:j.board.x,y:floor(j.board.x,j.board.z)+3.25,z:j.board.z}));
 const a=createJobBadges(new T.Group(),spots),bb=createJobBadges(new T.Group(),spots),cam=new T.PerspectiveCamera(50,390/844,.1,900);
 const shownSet=m=>{const out=[],e=new T.Matrix4();for(let i=0;i<spots.length;i++){m.getMatrixAt(i,e);if(e.elements[0]!==0)out.push(i);}return out.join(',');};
 let compared=0,awake=0;
 for(const job of C.JOBS)for(const off of [0,20,45,70,95,110])for(let k=0;k<8;k++)for(const [back,up] of [[37,18],[30,40],[55,26]]){
  const yaw=k*Math.PI/4,px=job.board.x+Math.cos(yaw)*off,pz=job.board.z+Math.sin(yaw)*off,head=yaw+[0,Math.PI/2,Math.PI][k%3];
  cam.position.set(px-Math.sin(head)*back,up,pz-Math.cos(head)*back);cam.lookAt(px,1,pz);cam.updateMatrixWorld();
  const oldN=a.update(cam,DT,true,true),newN=bb.update(cam,DT,true,true,{x:px,z:pz});
  assert.equal(newN,oldN,`same number of badges shown (player ${px.toFixed(0)}, ${pz.toFixed(0)})`);if(newN)assert.equal(shownSet(bb.mesh),shownSet(a.mesh),'the same badges');compared++;if(newN)awake++;}
 assert(compared>1000&&awake>100,`compared ${compared} views, ${awake} with badges`);
 // Reduced motion and a still camera: the matrices are not uploaded again.
 const v0=bb.mesh.instanceMatrix.version;bb.update(cam,DT,true,true,{x:cam.position.x,z:cam.position.z});const v1=bb.mesh.instanceMatrix.version;bb.update(cam,DT,true,true,{x:cam.position.x,z:cam.position.z});
 assert.equal(bb.mesh.instanceMatrix.version,v1,'no upload when nothing changed');assert(v1>=v0);
 // Bobbing badges still move every frame (the look is unchanged).
 const j=C.JOBS[0];cam.position.set(j.board.x,8,j.board.z+20);cam.lookAt(j.board.x,2,j.board.z);cam.updateMatrixWorld();
 const p0={x:j.board.x,z:j.board.z+6};bb.update(cam,DT,false,true,p0);const e1=new T.Matrix4(),e2=new T.Matrix4();bb.mesh.getMatrixAt(0,e1);const v2=bb.mesh.instanceMatrix.version;
 bb.update(cam,.1,false,true,p0);bb.mesh.getMatrixAt(0,e2);assert(bb.mesh.instanceMatrix.version>v2&&e1.elements[13]!==e2.elements[13],'the badge bobs (uploaded while it moves)');
 // Reduced motion with that badge on screen and a still camera: drawn, but uploaded once only.
 assert(bb.update(cam,DT,true,true,p0)>0,'the badge is shown');const v4=bb.mesh.instanceMatrix.version;bb.update(cam,DT,true,true,p0);bb.update(cam,DT,true,true,p0);
 assert.equal(bb.mesh.instanceMatrix.version,v4,'shown, still and reduced: no further uploads');
 // Far from every sign: idle, hidden, no upload.
 cam.position.set(-400,20,-400);cam.lookAt(-400,0,-430);cam.updateMatrixWorld();const v3=bb.mesh.instanceMatrix.version;
 assert.equal(bb.update(cam,DT,false,true,{x:-400,z:-420}),0);assert.equal(bb.mesh.visible,false);bb.update(cam,DT,false,true,{x:-400,z:-420});
 assert(bb.mesh.instanceMatrix.version<=v3+1,'at most one upload (the hide) when leaving');a.dispose();bb.dispose();}

// 4. Heat audit #8: the panel view is compared field by field (no JSON round trip per call) and the frame key is not a string.
{const src=fs.readFileSync(path.join(base,'lib/town/jobs/jobScene.ts'),'utf8');
 assert.doesNotMatch(src,/JSON\.stringify\(next\)===JSON\.stringify\(view\)/,'setView no longer stringifies the whole view');
 assert.doesNotMatch(src,/key=`\$\{run\.at\}/,'no per-frame template-string key');}
console.log(`job boards: all ${C.JOBS.length} signs reachable on foot and offering; badges wake by the player with identical views`);
})().catch(e=>{console.error(e);process.exit(1);});
