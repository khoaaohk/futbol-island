// Rides on slopes (Oct 15 2026, user: "riding on the mountain, the bike is in the island", a screenshot of the bike's wheels sunk
// into Summit Isle's grass):
//  - rideSlopePose: on a 20° slope at any heading both tyres touch the ground (within 2 cm) and no part of either wheel goes into
//    it, the pitch matches the slope along the ride, the roll is light and capped at 8°; on level ground it is unchanged (the
//    height + 0.005, no pitch, no roll).
//  - createDrawnGround: heights of a tilted test mesh are exact, -Infinity off it.
//  - On Summit Isle's real drawn terrain (from the build), a bike posed on the drawn grass at 300 random slope spots never has a
//    wheel more than 2 cm into it (the walked height alone sank it up to ~0.4 m).
// usage: node tests/ride-slope.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Float32Array,Float64Array,Uint8Array,Uint32Array,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const T=require('three');
const {rideSlopePose,rideWheelbase,RIDE_SLOPE_ROLL_MAX}=load('lib/town/rideSurfacePose.ts'),{createDrawnGround}=load('lib/town/drawnGround.ts');
const RADIUS={scooter:.12*1.12,bike:.32*1.12,moped:.24*1.12};
// Lowest gap between each wheel (a circle in the ride's plane, contact at the root's level) and the ground; and the worst sink.
const e=new T.Euler(),m=new T.Matrix4(),v=new T.Vector3();
function wheels(mode,x,z,yaw,pose,ground){e.set(pose.pitch,yaw,pose.roll,'YXZ');m.makeRotationFromEuler(e);const {front,rear}=rideWheelbase(mode),r=RADIUS[mode];let touch=[],sink=-Infinity;
 for(const w of [front,-rear]){let gap=Infinity;for(let k=0;k<64;k++){const a=k/64*Math.PI*2;v.set(0,r+Math.cos(a)*r,w+Math.sin(a)*r).applyMatrix4(m);const g=ground(x+v.x,z+v.z),y=pose.height+v.y;gap=Math.min(gap,y-g);sink=Math.max(sink,g-y);}touch.push(gap);}
 return {touch,sink};}
const out={height:0,pitch:0,roll:0};
// ---- A 20° plane, rising toward (cos d, sin d).
for(const mode of ['scooter','bike','moped'])for(let i=0;i<48;i++){const d=i*.7,g=Math.tan(20*Math.PI/180),plane=(x,z)=>3+g*(x*Math.cos(d)+z*Math.sin(d));
 const x=5*Math.cos(i),z=4*Math.sin(i*1.3),yaw=i*Math.PI/12,along=g*(Math.sin(yaw)*Math.cos(d)+Math.cos(yaw)*Math.sin(d)),across=g*(Math.cos(yaw)*Math.cos(d)-Math.sin(yaw)*Math.sin(d));
 rideSlopePose(mode,x,z,yaw,plane,across,out);
 assert(Math.abs(-out.pitch-Math.atan(along))<.01,`${mode}: pitch matches the slope along the ride (${(-out.pitch).toFixed(3)} vs ${Math.atan(along).toFixed(3)})`);
 assert(Math.abs(out.roll)<=RIDE_SLOPE_ROLL_MAX+1e-9,'the roll is capped');
 const w=wheels(mode,x,z,yaw,out,plane);for(const t of w.touch)assert(Math.abs(t)<.02,`${mode} at yaw ${yaw.toFixed(2)}: each tyre touches the 20° slope (${t.toFixed(3)} m)`);
 assert(w.sink<.02,`${mode}: no wheel goes into the slope (${w.sink.toFixed(3)} m)`);}
// Light roll: half the cross-slope angle, never past 8°.
rideSlopePose('bike',0,0,0,()=>0,Math.tan(10*Math.PI/180),out);assert(Math.abs(out.roll-5*Math.PI/180)<1e-6,'half the cross slope');
rideSlopePose('bike',0,0,0,()=>0,-1,out);assert(Math.abs(out.roll+RIDE_SLOPE_ROLL_MAX)<1e-9,'capped at 8° on a 45° cross slope');
// ---- Level ground: unchanged.
for(const mode of ['scooter','bike','moped']){rideSlopePose(mode,10,-4,1.1,()=>.7,0,out);assert.equal(out.pitch,0);assert.equal(out.roll,0);assert(Math.abs(out.height-.705)<1e-9,'level: height + 0.005');}

// ---- createDrawnGround on a tilted plane mesh.
{const g=new T.PlaneGeometry(20,20,7,5);g.rotateX(-Math.PI/2);const mesh=new T.Mesh(g);mesh.position.set(3,1,-2);mesh.rotation.z=.3;const dg=createDrawnGround(()=>[mesh]);
 const n=new T.Vector3(0,1,0).applyEuler(mesh.rotation),c=mesh.position,plane=(x,z)=>c.y-(n.x*(x-c.x)+n.z*(z-c.z))/n.y;
 for(let i=0;i<200;i++){const x=c.x-6+Math.random()*12,z=c.z-8+Math.random()*16;assert(Math.abs(dg.height(x,z)-plane(x,z))<1e-4,'drawn height on the mesh');}
 assert.equal(dg.height(200,200),-Infinity,'off the mesh');}

// ---- Summit Isle's real drawn terrain.
{const S=load('lib/town/summitIsle.ts'),{fieldSurfaceHeight}=load('lib/town/venues.ts'),{nearSummit,summitGradient}=load('lib/town/rideSlope.ts');
 const town=new T.Group(),mk=g=>{const mm=new T.Mesh(g,new T.MeshStandardMaterial());town.add(mm);return mm;};
 load('lib/town/summitIsleWorld.ts').buildSummitIsle({box:(w,h,d,c,x,y,z)=>{const mm=mk(new T.BoxGeometry(w,h,d));mm.position.set(x,y,z);return mm;},cylinder:(r,h,c,x,y,z)=>{const mm=mk(new T.CylinderGeometry(r,r,h,10));mm.position.set(x,y,z);return mm;},
  sign:(t,w,h,x,y,z)=>{const mm=mk(new T.PlaneGeometry(w,h));mm.position.set(x,y,z);return mm;},town,obstacles:[],assets:[],surfaceAreas:[]});
 town.updateMatrixWorld(true);const meshes=[];town.traverse(o=>{if(o.isMesh&&/^(summit-isle-ground-|summit-isle-pitch$|summit-sandbar-)/.test(o.name))meshes.push(o);});assert(meshes.length>=8,'the island ground meshes are named');
 const dg=createDrawnGround(()=>meshes),drawn=(x,z)=>dg.height(x,z);
 // Town's sampler: the walked height, lifted to the drawn grass (+ SUMMIT_VISUAL_DROP) where that stands higher.
 const rideGround=(x,z)=>{const h=fieldSurfaceHeight(x,z);if(!nearSummit(x,z))return h;const d=dg.height(x,z)+S.SUMMIT_VISUAL_DROP;return d>h?d:h;};
 const grad={gx:0,gz:0};let n=0,worst=-Infinity,old=-Infinity,seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 for(let i=0;i<20000&&n<300;i++){const x=S.SUMMIT_BOX.minX+rnd()*(S.SUMMIT_BOX.maxX-S.SUMMIT_BOX.minX),z=S.SUMMIT_BOX.minZ+rnd()*(S.SUMMIT_BOX.maxZ-S.SUMMIT_BOX.minZ);
  if(!S.onSummitIsle(x,z)||S.summitSlope(x,z)<.15)continue;n++;const yaw=rnd()*Math.PI*2;summitGradient(x,z,grad);
  rideSlopePose('bike',x,z,yaw,rideGround,grad.gx*Math.cos(yaw)-grad.gz*Math.sin(yaw),out);worst=Math.max(worst,wheels('bike',x,z,yaw,out,drawn).sink);
  rideSlopePose('bike',x,z,yaw,fieldSurfaceHeight,0,out);old=Math.max(old,wheels('bike',x,z,yaw,out,drawn).sink);}
 assert(n===300,'300 slope spots');
 assert(old>.1,`the walked height alone sank the bike (${old.toFixed(2)} m): the case this guards`);
 assert(worst<.02,`a bike on Summit Isle's drawn slopes stays out of the grass (worst ${worst.toFixed(3)} m)`);
 console.log(`summit: worst wheel sink ${worst.toFixed(3)} m (walked height alone: ${old.toFixed(3)} m)`);}
console.log('ride slope: ok');
