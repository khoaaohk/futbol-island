// Ride splash (Oct 23 2026, lib/graphics/rideSplash.ts): spray fans, a foam ring and a wake V when a scooter / bike / moped rolls
// through the shallows; speed-scaled, wet side of the drawn waterline only, heat-gated, one pooled InstancedMesh. Run: node tests/ride-splash.cjs
const assert=require('node:assert/strict'),fs=require('node:fs');
const {createLoader}=require('./summit-harness.cjs');
const load=createLoader();
const S=load('lib/graphics/rideSplash.ts');
const {RIDE_SPLASH:C}=S;
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
// A straight beach along x: land for z < 0, the drawn waterline at z = 0 (+ sea), flat ground; a pier deck (raised) for x > 100.
const field={distance:(x,z)=>z,lift:(x,z)=>x>100?1.2:-.2};
const run=(sp,{x=0,z=1,yaw=Math.PI/2,speed=12,mode=3,sec=1,slot=0}={})=>{let s=0;for(let i=0;i<sec*60;i++){sp.begin(1/60,mode);s=sp.rider(slot,x+i*speed/60*Math.sin(yaw),-.2,z+i*speed/60*Math.cos(yaw),yaw,speed);sp.end();}return s;};

ok('speed: nothing slow or stopped, eased up to full at speed',()=>{
 assert.equal(S.splashSpeed(0),0);assert.equal(S.splashSpeed(C.minSpeed),0);assert.equal(S.splashSpeed(C.fullSpeed),1);assert.equal(S.splashSpeed(28),1);
 let last=0;for(let v=C.minSpeed;v<=C.fullSpeed;v+=.5){const k=S.splashSpeed(v);assert(k>=last);last=k;}
 const slow=S.createRideSplash(()=>field);run(slow,{speed:2});assert.equal(slow.emitted,0,'a walking-pace ride never splashes');
 const a=S.createRideSplash(()=>field),b=S.createRideSplash(()=>field);run(a,{speed:6});run(b,{speed:20});assert(b.emitted>a.emitted*1.5,'bigger at speed '+a.emitted+' / '+b.emitted);});
ok('shallow only: dry sand nothing, a soft fade at the waterline, raised ground (deck / rocks) nothing, no field nothing',()=>{
 assert.equal(S.shoreWet(-3,-.2),0);assert.equal(S.shoreWet(C.dryD,-.2),0);assert.equal(S.shoreWet(C.wetD,-.2),1);assert.equal(S.shoreWet(2,-.2),1);
 const mid=S.shoreWet((C.dryD+C.wetD)/2,-.2);assert(mid>.3&&mid<.7,'fade '+mid);assert.equal(S.shoreWet(1,C.highLift),0);assert.equal(S.shoreWet(NaN,-.2),0);
 const dry=S.createRideSplash(()=>field);run(dry,{z:-4});assert.equal(dry.emitted,0,'riding along the dry sand');
 const deck=S.createRideSplash(()=>field);run(deck,{x:120});assert.equal(deck.emitted,0,'over a deck');
 const none=S.createRideSplash(()=>null);run(none);assert.equal(none.emitted,0,'before the shore bake');
 const edge=S.createRideSplash(()=>field),wet=S.createRideSplash(()=>field);run(edge,{z:-.9});run(wet,{z:.5});assert(edge.emitted>0&&edge.emitted<wet.emitted,'edge '+edge.emitted+' < wet '+wet.emitted);});
ok('heat gating: off in Battery saver and tier >= 3, lite at tier 2, reduced motion = foam ring only at half rate',()=>{
 assert.equal(S.rideSplashMode(0,true,false),0);assert.equal(S.rideSplashMode(3,false,false),0);assert.equal(S.rideSplashMode(4,false,true),0);
 assert.equal(S.rideSplashMode(2,false,false),2);assert.equal(S.rideSplashMode(1,false,true),1);assert.equal(S.rideSplashMode(0,false,false),3);
 const off=S.createRideSplash(()=>field);run(off,{mode:0});assert.equal(off.emitted,0);assert.equal(off.mesh.visible,false);
 const full=S.createRideSplash(()=>field),lite=S.createRideSplash(()=>field),red=S.createRideSplash(()=>field);run(full,{sec:2});run(lite,{mode:2,sec:2});run(red,{mode:1,sec:2});
 assert(lite.emitted<full.emitted*.8,'lite '+lite.emitted+' vs '+full.emitted);
 const rings=Math.round(2/(C.ringEvery*2/(.55+.45)));assert(Math.abs(red.emitted-rings)<=1,'reduced: rings only '+red.emitted+' ~ '+rings);
 assert.equal(red.soundDue(1),false,'no sound in reduced motion');});
ok('pool: never more than cap live / drawn, one InstancedMesh, no shadows, no depth write, no texture',()=>{
 const sp=S.createRideSplash(()=>field);let peak=0;
 for(let i=0;i<240;i++){sp.begin(1/60,3);for(let r=0;r<C.maxRiders;r++)sp.rider(r,r*5+i*.4,-.2,1,Math.PI/2,28);sp.end();peak=Math.max(peak,sp.alive,sp.mesh.count);}
 assert(peak<=C.cap&&C.cap<=64,'peak '+peak);assert(peak>20,'three riders fill the pool '+peak);
 assert.equal(sp.mesh.isInstancedMesh,true);assert.equal(sp.mesh.castShadow,false);assert.equal(sp.mesh.material.depthWrite,false);assert.equal(sp.mesh.geometry.index.count,6,'two triangles a particle');
 assert(!Object.values(sp.mesh.material.uniforms).some(u=>u.value&&u.value.isTexture),'no texture');
 assert.equal(sp.rider(C.maxRiders,0,0,1,0,20),0,'slots beyond maxRiders ignored');});
ok('idle: once riding stops the drops land and the mesh hides; nothing riding = no draw',()=>{
 const sp=S.createRideSplash(()=>field);run(sp);assert(sp.alive>0&&sp.mesh.visible);
 for(let i=0;i<90;i++){sp.begin(1/60,3);sp.end();}assert.equal(sp.alive,0);assert.equal(sp.mesh.visible,false);assert.equal(sp.mesh.count,0);});
ok('nearest friends: the 2 closest riders, nearest first, no allocation',()=>{
 const spots=S.createRiderSpots(8),out=new Int32Array(2),d=new Float32Array(2);
 const xs=[40,3,90,-7,12];xs.forEach((x,i)=>{spots.x[i]=x;spots.z[i]=0;});spots.n=xs.length;
 assert.equal(S.nearestRiders(spots,0,0,2,out,d),2);assert.deepEqual([...out],[1,3]);
 spots.n=1;assert.equal(S.nearestRiders(spots,0,0,2,out,d),1);assert.equal(out[0],0);spots.n=0;assert.equal(S.nearestRiders(spots,0,0,2,out,d),0);});
ok('sound: the soft splash at most once per soundEvery while splashing hard',()=>{
 const sp=S.createRideSplash(()=>field);let n=0;for(let i=0;i<60*4;i++){sp.begin(1/60,3);if(sp.soundDue(sp.rider(0,i*.3,-.2,1,Math.PI/2,20)))n++;sp.end();}
 assert(n>=2&&n<=Math.ceil(4/C.soundEvery),'sounds '+n);});
ok('no per-frame allocation: steady riding keeps the heap flat',()=>{
 if(typeof global.gc!=='function'){console.log('     (run with --expose-gc for the heap check; skipped)');return;}
 const sp=S.createRideSplash(()=>field),spots=S.createRiderSpots(8),out=new Int32Array(2),d=new Float32Array(2);spots.n=3;
 const frame=i=>{sp.begin(1/60,3);sp.rider(0,i*.3%50,-.2,1,Math.PI/2,20);const n=S.nearestRiders(spots,0,0,2,out,d);for(let k=0;k<n;k++)sp.rider(1+k,i*.2%40,-.2,1.5,0,14);sp.end();};
 for(let i=0;i<3000;i++)frame(i);global.gc();const before=process.memoryUsage().heapUsed;
 for(let i=0;i<30000;i++)frame(i);global.gc();const grew=process.memoryUsage().heapUsed-before;
 assert(grew<64*1024,'heap grew '+grew+' B over 30k frames');});
ok('wired: Town feeds me + the 2 nearest riding friends, gates on heat tier / saver / reduced, disposes; friends expose their rides',()=>{
 const town=fs.readFileSync('components/Town.tsx','utf8'),av=fs.readFileSync('lib/graphics/remoteAvatars.ts','utf8'),br=fs.readFileSync('lib/multiplayer/townBridge.ts','utf8');
 assert(/rideSplashMode\(heat\.tier,heat\.saver,reduced\)/.test(town));assert(/if\(me\|\|fr\|\|rideSplash\.alive\)/.test(town),'zero work when idle');
 assert(/nearestRiders\(fr,[^)]*RIDE_SPLASH\.friends/.test(town));assert(/rideSplash\.dispose\(\)/.test(town));
 assert(/riders\.n=0/.test(av)&&/riders\.speed\[j\]=pose\.speed/.test(av));assert(/get riders\(\)/.test(br));
 const doc=fs.readFileSync('docs/performance-guide.md','utf8');assert(/Ride splash/.test(doc),'performance-guide note');});
if(failed){console.log(failed+' failed');process.exit(1);}console.log('ride splash: all passed');
