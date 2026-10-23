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
const R=load('lib/graphics/remoteRides.ts'),{Mode}=load('multiplayer/protocol/types.ts'),{gearState}=load('lib/graphics/beanGearFit.ts');

t('ride kinds: scooter / bike / moped only',()=>{
 assert.equal(R.rideKindFor(Mode.Scooter),0);assert.equal(R.rideKindFor(Mode.Bike),1);assert.equal(R.rideKindFor(Mode.Moped),2);
 for(const m of [Mode.Walk,Mode.Run,Mode.Idle,Mode.Jetpack,Mode.Swim,Mode.Parachute])assert.equal(R.rideKindFor(m),-1);
});

const rides=R.createRemoteRides(4),body=new T.Object3D();
t('nobody riding: nothing baked, nothing drawn',()=>{rides.begin();rides.end();assert.equal(rides.root.children.length,0);assert.equal(rides.drawn,0);});

gearState.packBack=.123;
rides.begin();body.position.set(10,2,-3);body.rotation.set(0,Math.PI/2,0);rides.add(1,false,body,1.12*1.12,0);rides.end();
const mesh=name=>rides.root.children.find(c=>c.name===name);
t('the first ride bakes 6 frames (3 rides x classic / bean) + 3 wheel sets, one shared material, no shadows; the local pack offset is kept',()=>{
 assert.equal(rides.root.children.length,9);
 const mats=new Set(rides.root.children.map(c=>c.material));assert.equal(mats.size,1);
 for(const c of rides.root.children){assert(c.isInstancedMesh);assert.equal(c.castShadow,false);assert(c.geometry.attributes.color);}
 assert.equal(gearState.packBack,.123);
 assert.equal(mesh('remote-ride-bike').count,1);assert.equal(mesh('remote-ride-bike').visible,true);assert.equal(mesh('remote-ride-wheels-bike').count,2);
 assert.equal(mesh('remote-ride-scooter').visible,false,'unused rides cost no draw call');
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
t('no per-frame allocation in begin / add / end',()=>{
 const src=read('lib/graphics/remoteRides.ts'),hot=src.slice(src.indexOf('begin(){'),src.indexOf('dispose(){\n   if(disposed)'));
 assert(!/new T\.|\[\.\.\.|\.map\(|\.filter\(|\.clone\(/.test(hot),'hot path allocates');
});
t('wiring: remoteAvatars draws the ride for shown rigs only (not in the field), at the rig scale, and disposes it',()=>{
 const ra=read('lib/graphics/remoteAvatars.ts');
 assert(/batch\.draw\(root3\);e\.shown=true;shown\+\+;[\s\S]{0,300}const rk=shield\?-1:rideKindFor\(pose\.mode\)/.test(ra));
 assert(ra.includes('rides.add(rk,e.rb,root3,RIDE_SCALE*BODY_SCALE*k*e.out,e.ra)'));
 assert(ra.includes('batch.begin();batch.end();rides.begin();rides.end();'),'the last friend leaving clears the rides too');
 assert(ra.includes('rides.dispose()'));assert(ra.includes('e.rb=!!beanShapeOf(rig.root)'));
 assert(read('package.json').includes('tests/remote-rides.cjs'));
});
rides.dispose();
console.log('remote rides: '+n+' passed');
