// Friends' rides (Oct 23 2026): a friend on a scooter / bike / moped showed the big ride ring but no vehicle (friend avatars only drew the body).
// lib/graphics/remoteRides.ts bakes the island's own classic rides into instanced meshes. Checks: mode mapping, the bake (wheels on the ground,
// bean seats lower than classic, the shared pack offset untouched), instancing follows the body (yaw, bump roll), capacity, zero draw calls
// when nobody rides, no per-frame allocation, and the wiring in remoteAvatars (shown rigs only, none in the force field, the rig scale).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8'),req=require('node:module').createRequire(ROOT+'/package.json');
const T=req('three'),cache=new Map();
function load(file){
 if(cache.has(file))return cache.get(file).exports;
 const full=path.join(ROOT,file),m={exports:{}};cache.set(file,m);
 vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
  {module:m,exports:m.exports,console,Math,Object,Array,Number,String,JSON,Error,Symbol,Set,WeakMap,Promise,Float32Array,Float64Array,Int16Array,Uint8Array,Uint16Array,Uint32Array,Map,Infinity,NaN,globalThis:{},require:id=>{
   if(id==='three')return T;
   if(id.startsWith('.')){const rel=path.resolve(path.dirname(full),id);for(const ext of ['.ts','.tsx','/index.ts'])if(fs.existsSync(rel+ext))return load(path.relative(ROOT,rel+ext));}
   return req(id);}});
 return m.exports;
}
let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const R=load('lib/graphics/remoteRides.ts'),R2=R,{Mode}=load('multiplayer/protocol/types.ts'),{gearState}=load('lib/graphics/beanGearFit.ts');

t('ride kinds: scooter / bike / moped only',()=>{
 assert.equal(R.rideKindFor(Mode.Scooter),0);assert.equal(R.rideKindFor(Mode.Bike),1);assert.equal(R.rideKindFor(Mode.Moped),2);
 for(const m of [Mode.Walk,Mode.Run,Mode.Idle,Mode.Jetpack,Mode.Swim,Mode.Parachute])assert.equal(R.rideKindFor(m),-1);
});

const rides=R.createRemoteRides(4),body=new T.Object3D();
t('nobody riding: nothing baked, nothing drawn',()=>{rides.begin();rides.end();assert.equal(rides.root.children.length,0);assert.equal(rides.drawn,0);});

gearState.packBack=.123;
rides.begin();body.position.set(10,2,-3);body.rotation.set(0,Math.PI/2,0);rides.add(1,false,body,1.12*1.12,0);rides.end();
const mesh=name=>rides.root.children.find(c=>c.name===name);
t('the first ride bakes 6 frames (3 rides x classic / bean) + 3 wheel sets + 1 crank, one shared material, no shadows; the local pack offset is kept',()=>{
 assert.equal(rides.root.children.length,10);
 const mats=new Set(rides.root.children.map(c=>c.material));assert.equal(mats.size,1);
 for(const c of rides.root.children){assert(c.isInstancedMesh);assert.equal(c.castShadow,false);assert(c.geometry.attributes.color);}
 assert.equal(gearState.packBack,.123);
 assert.equal(mesh('remote-ride-bike').count,1);assert.equal(mesh('remote-ride-bike').visible,true);assert.equal(mesh('remote-ride-wheels-bike').count,2);
 assert.equal(mesh('remote-ride-scooter').visible,false,'unused rides cost no draw call');
 assert.equal(mesh('remote-ride-cranks').visible,false,'a classic bike rider: no extra crank');
});

const lowY=g=>{g.computeBoundingBox();return g.boundingBox.min.y;};
t('wheels touch the ground: each tyre bottom sits at y 0 for every ride',()=>{
 for(const k of R.RIDE_KINDS){const w=mesh('remote-ride-wheels-'+k);const m=new T.Matrix4(),p=new T.Vector3();
  // the bottom of the tyre: centre (from the instance) minus the outer radius
  w.geometry.computeBoundingSphere();const r=w.geometry.boundingSphere.radius;
  rides.begin();body.position.set(0,0,0);body.rotation.set(0,0,0);rides.add(R.RIDE_KINDS.indexOf(k),false,body,1,0);rides.end();
  w.getMatrixAt(0,m);p.setFromMatrixPosition(m);assert(Math.abs(p.y-r)<.02,k+' tyre bottom '+(p.y-r).toFixed(3));
 }
});
t('the bean frame drops the seat (the bean sits lower than the classic body)',()=>{
 const top=g=>{g.computeBoundingBox();return g.boundingBox;};
 const c=mesh('remote-ride-bike').geometry,b=mesh('remote-ride-bike-bean').geometry;assert.notEqual(c,b);
 assert(c.attributes.position.count>100&&b.attributes.position.count>100);
 assert(lowY(c)>-.01&&lowY(b)>-.01,'no frame part below the ground');
 void top;
});
t('follows the body: position, yaw and a bump roll; the scale is the given one',()=>{
 rides.begin();body.position.set(5,1,7);body.rotation.set(0,1.2,.2,'YXZ');rides.add(2,true,body,1.25,0);rides.end();
 const m=new T.Matrix4(),p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();mesh('remote-ride-moped-bean').getMatrixAt(0,m);m.decompose(p,q,s);
 assert(p.distanceTo(body.position)<1e-6);assert(Math.abs(q.angleTo(body.quaternion))<1e-5);assert(Math.abs(s.x-1.25)<1e-6&&Math.abs(s.y-1.25)<1e-6);
});
t('capacity: never more than the cap per ride; zero scale draws nothing',()=>{
 rides.begin();for(let i=0;i<9;i++)rides.add(0,false,body,1,i);rides.add(1,false,body,0,0);rides.end();
 assert.equal(mesh('remote-ride-scooter').count,4);assert.equal(mesh('remote-ride-wheels-scooter').count,8);assert.equal(mesh('remote-ride-bike').visible,false);
});
const V=load('lib/graphics/vehicle.ts');
t('bean bike pedals: one shared crank mesh (max 1 extra draw call for every rider), about the crank axle, turning forward with the angle',()=>{
 rides.begin();for(let i=0;i<3;i++){body.position.set(i*3,0,0);body.rotation.set(0,0,0);rides.add(1,true,body,1,0,0);}rides.end();
 const ck=mesh('remote-ride-cranks');assert.equal(ck.count,3);assert.equal(ck.visible,true);
 assert.equal(rides.root.children.filter(c=>c.visible).length,3,'bean bike frame + wheels + cranks: 3 draw calls for 3 riders');
 rides.begin();body.position.set(0,0,0);rides.add(1,false,body,1,0,0);rides.add(0,true,body,1,0,0);rides.end();assert.equal(ck.visible,false,'classic bikes and scooters: no crank');
 // the axle height at the island's bean crank, the pedals one arm away, both above the ground; turning a quarter moves the top pedal forward
 const g=ck.geometry;g.computeBoundingBox();const bb=g.boundingBox,R=V.BIKE_CRANK_ARM;
 assert(Math.abs(bb.max.y-(R+.028))<1e-3&&Math.abs(bb.min.y+(R+.028))<1e-3,'arms + pedals span one arm each way');
 assert(Math.abs(bb.max.x-(V.BIKE_PEDAL_X+.05))<1e-3,'pedals stick out each side');
 const at=a=>{rides.begin();body.position.set(0,0,0);body.rotation.set(0,0,0);rides.add(1,true,body,1,0,a);rides.end();const m=new T.Matrix4();ck.getMatrixAt(0,m);return m;};
 const axle=new T.Vector3().setFromMatrixPosition(at(0));
 assert(Math.abs(axle.y-V.BIKE_CRANK[1])<.02&&Math.abs(axle.z-V.BIKE_CRANK[2])<.05,'at the bean crank '+axle.y.toFixed(3));
 assert(axle.y-R-.028>0,'the low pedal clears the ground');
 const top=new T.Vector3(V.BIKE_PEDAL_X,R,0).applyMatrix4(at(Math.PI/2));assert(top.z-axle.z>R*.95&&Math.abs(top.y-axle.y)<1e-3,'+ angle = forward');
 assert.equal(R2.bikeCrankRate(0),0);assert.equal(R2.bikeCrankRate(.3),0);
 assert(R2.bikeCrankRate(1)>0&&R2.bikeCrankRate(6)>R2.bikeCrankRate(2),'faster with speed');
 assert(Math.abs(R2.bikeCrankRate(8)-(.8+.85)*Math.PI*2)<1e-9,'the rig\'s cadence (player.ts) at full effort');
 assert(/phase \+= motion\?\.travelMode==='bike'\s*\?dt\*\(\.8\+\.85\*Math\.min\(speed\/8,1\)\)\*Math\.PI\*2\*amount/.test(read('lib/graphics/player.ts')),'player.ts cadence unchanged');
 assert(/arm\.name='bike-crank-'/.test(read('lib/graphics/vehicle.ts')),'the island arms are named so the bake drops them for the turning crank');
});
t('tail-whip: vyaw turns the vehicle alone (frame + wheels + crank) about its root, tyres stay on the ground; dy drops it under a lifted rider',()=>{
 rides.begin();body.position.set(2,0,3);body.rotation.set(0,.4,0,'YXZ');rides.add(0,false,body,1,0,0,Math.PI/2,0);rides.end();
 const m=new T.Matrix4(),p=new T.Vector3(),q=new T.Quaternion(),sc=new T.Vector3();mesh('remote-ride-scooter').getMatrixAt(0,m);m.decompose(p,q,sc);
 const want=new T.Quaternion().setFromEuler(new T.Euler(0,.4+Math.PI/2,0,'YXZ'));assert(q.angleTo(want)<1e-5,'yaw = body yaw + vyaw');assert(p.distanceTo(body.position)<1e-6);
 const w=mesh('remote-ride-wheels-scooter');w.geometry.computeBoundingSphere();const r=w.geometry.boundingSphere.radius;
 for(let i=0;i<2;i++){w.getMatrixAt(i,m);p.setFromMatrixPosition(m);assert(Math.abs(p.y-r)<.02,'tyre on the ground');}
 rides.begin();body.position.set(0,.18,0);rides.add(0,false,body,1,0,0,0,-.18);rides.end();mesh('remote-ride-scooter').getMatrixAt(0,m);p.setFromMatrixPosition(m);assert(Math.abs(p.y)<1e-6,'the rider\'s lift is not the deck\'s');
 const Ctx=load('lib/town/emoteContexts.ts'),RE=load('lib/town/rideEmotes.ts'),FL={roll:0,pitch:0,yaw:0,lift:0,ripple:0};
 const tw=RE.rideScriptForWire('scooter',4);assert.equal(tw.emote,RE.RIDE_EMOTE.ScooterTailWhip,'Show off on a scooter = the tail-whip');
 Ctx.flourishAt(tw.emote,.95,tw.seconds,FL);assert(FL.vyaw>.5&&FL.rlift>0,'the friend flourish carries the vehicle-only channels');
 Ctx.flourishAt(tw.emote,tw.seconds,tw.seconds,FL);assert(Math.abs(FL.vyaw-Math.PI*2)<1e-6,'a full whip: back facing forward');
 // every ride trick that moves the vehicle alone is covered (only VYAW is vehicle-only; WHEEL spin is passed too)
 const buf=new Float32Array(RE.RT_CH);const vy=[];for(const s2 of RE.RIDE_SCRIPTS){let any=false;for(let a=0;a<s2.seconds;a+=.05){RE.sampleRideTrick(s2.emote,a,buf);if(buf[RE.RT.VYAW]!==0)any=true;}if(any)vy.push(s2.emote);}
 assert.deepEqual(vy,[RE.RIDE_EMOTE.ScooterTailWhip]);
 Ctx.flourishAt(0,1,2,FL);assert.equal(FL.vyaw,0,'non-ride flourish: none');
});
t('no per-frame allocation in begin / add / end',()=>{
 const src=read('lib/graphics/remoteRides.ts'),hot=src.slice(src.indexOf('begin(){'),src.indexOf('dispose(){\n   if(disposed)'));
 assert(!/new T\.|\[\.\.\.|\.map\(|\.filter\(|\.clone\(/.test(hot),'hot path allocates');
});
t('wiring: remoteAvatars draws the ride for shown rigs only (not in the field), at the rig scale, and disposes it',()=>{
 const ra=read('lib/graphics/remoteAvatars.ts');
 assert(/batch\.draw\(root3\);e\.shown=true;shown\+\+;[\s\S]{0,300}const rk=shield\?-1:rideKindFor\(pose\.mode\)/.test(ra));
 assert(ra.includes('rides.add(rk,e.rb,root3,RIDE_SCALE*BODY_SCALE*k*e.out,e.ra,e.ca,tr?FL.vyaw??0:0,tr?-(FL.rlift??0)*k:0)'));
 assert(/if\(rk===1&&e\.rb&&!reduced\)\{e\.ca\+=sdt\*bikeCrankRate\(pose\.speed\)/.test(ra),'the crank turns with their speed, still under reduced motion');
 assert(/const tr=fs0!==undefined&&!reduced/.test(ra)&&/e\.ra\+=sdt\*\(pose\.speed\+\(tr\?FL\.wheel\?\?0:0\)\)/.test(ra),'a trick\'s extra wheel spin');
 assert(ra.includes('batch.begin();batch.end();rides.begin();rides.end();'),'the last friend leaving clears the rides too');
 assert(ra.includes('rides.dispose()'));assert(ra.includes('e.rb=!!beanShapeOf(rig.root)'));
 assert(read('package.json').includes('tests/remote-rides.cjs'));
});
rides.dispose();
console.log('remote rides: '+n+' passed');
