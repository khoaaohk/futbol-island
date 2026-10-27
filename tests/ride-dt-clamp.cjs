// Animal rides never teleport (QA audit 4 #5, Oct 26 2026: a stalled page once moved the whale shark and its rider ~80 m in one
// frame): every ride movement (the steered ride, the dart, the swim back) clamps its step to RIDE_DT_MAX, a NaN / negative /
// Infinity step moves nothing, the swim back hands over to the loop exactly where the animal is, and the host steps rides on the
// fixed 1/60 s tick under the frame clamp. Run: node tests/ride-dt-clamp.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,Float32Array,Float64Array,require:id=>id==='three'?T:id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const R=load('lib/town/water/animalRides.ts'),W=load('lib/town/water/waterDepth.ts'),H=load('lib/town/water/waterHud.ts');
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const near=(a,b,eps,msg)=>assert(Math.abs(a-b)<=eps,`${msg}: ${a} vs ${b}`);

/** A fake friend on a circle of radius `r` round (cx, 0): 96 samples, like a manta loop (as tests/water-rides.cjs). */
function circleFriend(kind='manta',r=30,cx=0){const points=[],n=96;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;points.push({x:cx+Math.cos(a)*r,z:Math.sin(a)*r});}
 const lengths=[0];for(let i=1;i<=n;i++){const a=points[i-1],b=points[i%n];lengths.push(lengths[i-1]+Math.hypot(b.x-a.x,b.z-a.z));}
 return {kind,id:kind+'-test',points,lengths,total:lengths[n],u:0,available:true,ridden:false,free:false,fx:0,fz:0,fyaw:0,dx:0,dz:0,dyaw:0,bank:0,speed:kind==='whale'?.9:1.4,boost:1,bend:0,bendYaw:0};}

const OPEN=()=>true,STICK={x:1,z:0},hyp=(a,b,c,d)=>Math.hypot(a-c,b-d);
ok('RIDE_DT_MAX is short: one resumed frame moves the ride at most a few tenths of a metre',()=>{
 assert(R.RIDE_DT_MAX>0&&R.RIDE_DT_MAX<=.05,'max step <= .05 s');
 for(const kind of ['whale','manta']){
  const f=circleFriend(kind,40),rides=R.createAnimalRides(()=>[f]),pos={x:40+R.RIDE_BODY[kind],z:0},vel={x:0,z:0};
  rides.scan(.2,pos.x,pos.z,true);assert.equal(rides.grab(3,pos.x,pos.z,0).grabbed,kind);
  for(let i=0;i<120;i++)rides.step(1/60,pos,vel,STICK,OPEN,50);
  const cap=R.rideSpeed(kind)*R.RIDE_DT_MAX+1e-6;
  for(const big of [10,80,3600,Infinity]){const ax=f.fx,az=f.fz,px=pos.x,pz=pos.z;rides.step(big,pos,vel,STICK,OPEN,50);
   assert(hyp(f.fx,f.fz,ax,az)<=cap,`${kind}: a ${big} s frame moves the animal ${hyp(f.fx,f.fz,ax,az).toFixed(2)} m (cap ${cap.toFixed(2)})`);
   assert(hyp(pos.x,pos.z,px,pz)<=cap+.05,`${kind}: a ${big} s frame moves the rider ${hyp(pos.x,pos.z,px,pz).toFixed(2)} m`);}
  for(const bad of [NaN,-5,0]){const ax=f.fx,az=f.fz;rides.step(bad,pos,vel,STICK,OPEN,50);assert.equal(hyp(f.fx,f.fz,ax,az),0,`${kind}: a ${bad} step moves nothing`);assert(Number.isFinite(pos.x)&&Number.isFinite(pos.z));}
  // The drawn pose after a resumed frame sits between the last two ticks: never a jump.
  const out={x:0,z:0},ax=f.fx,az=f.fz;rides.step(60,pos,vel,STICK,OPEN,50);rides.present(.5,out);assert(hyp(f.dx,f.dz,ax,az)<=cap,'drawn between the ticks');
  // The dart / swim back after Let go: a resumed frame moves it at most its top speed × RIDE_DT_MAX.
  rides.letGo('off');assert(rides.darting);
  for(let i=0;i<30;i++){const was=f.free,bx=f.fx,bz=f.fz;rides.dartStep(i%3?1/60:30);
   if(was&&f.free)assert(hyp(f.fx,f.fz,bx,bz)<=30*R.RIDE_DT_MAX,`${kind}: swim back step ${hyp(f.fx,f.fz,bx,bz).toFixed(2)} m`);
   assert(Number.isFinite(f.u)&&Number.isFinite(f.fx),'the animal stays finite');}
 }
});
ok('the swim back hands over to the loop exactly where the animal is (no pop when it is caught)',()=>{
 for(const kind of ['whale','manta']){
  const f=circleFriend(kind,30),rides=R.createAnimalRides(()=>[f]),pos={x:30+R.RIDE_BODY[kind],z:0},vel={x:0,z:0},p={x:0,z:0,yaw:0};
  rides.scan(.2,pos.x,pos.z,true);rides.grab(3);for(let i=0;i<60*12;i++)rides.step(1/60,pos,vel,{x:0,z:-1},OPEN,50);
  rides.letGo('off');let caught=false,t=0,lx=f.fx,lz=f.fz;
  while(rides.darting&&t<40){if(f.free){lx=f.fx;lz=f.fz;}rides.dartStep(1/60);t+=1/60;
   if(!f.free&&!caught){caught=true;R.loopPoint(f.points,f.lengths,f.total,f.u,p);const dx=p.x+Math.cos(p.yaw)*f.bend,dz=p.z-Math.sin(p.yaw)*f.bend;
    assert(hyp(dx,dz,lx,lz)<=.5,`${kind}: drawn ${hyp(dx,dz,lx,lz).toFixed(2)} m from where it swam at the hand-over`);}}
  assert(caught,`${kind}: caught its loop`);
 }
});
ok('the host: rides step on the fixed 1/60 s tick under the frame clamp; a resume resets the accumulator',()=>{
 const town=fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8'),cap=fs.readFileSync(path.join(base,'lib/town/frameCap.ts'),'utf8');
 assert(/while\(accumulator>=1\/60\)\{[^}]*tick\(1\/60\)/.test(town),'tick(1/60) in the accumulator loop');
 assert(/function tick\(dt:number\)\{[\s\S]{0,900}animalRides\.dartStep\(dt\)/.test(town),'the dart steps inside tick');
 assert(/animalRides\.step\(dt,location/.test(town),'the ride steps inside tick');
 assert(/const dt=Math\.max\(0,Math\.min\(ms\/1000,FRAME_DT_MAX\)\)/.test(town),'the frame dt is clamped');
 const m=/FRAME_DT_MAX\s*=\s*([\d. /]+);/.exec(cap);assert(m&&Function('return '+m[1])()<=.1,'FRAME_DT_MAX is short');
 assert(/visibility=\(\)=>\{[^}]*accumulator=0/.test(town),'tab visibility resets the accumulator (no catch-up burst)');
});
if(failed){console.log(`\n${failed} failed`);process.exit(1);}
console.log('PASS ride dt clamp: no teleport on a stalled / resumed frame, NaN-safe, exact swim-back hand-over, host tick wiring');

/** A fake friend on a circle of radius `r` round (cx, 0): 96 samples, like a manta loop. */
function circleFriend(kind='manta',r=30,cx=0){const points=[],n=96;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;points.push({x:cx+Math.cos(a)*r,z:Math.sin(a)*r});}
 const lengths=[0];for(let i=1;i<=n;i++){const a=points[i-1],b=points[i%n];lengths.push(lengths[i-1]+Math.hypot(b.x-a.x,b.z-a.z));}
 return {kind,id:kind+'-test',points,lengths,total:lengths[n],u:0,available:true,ridden:false,free:false,fx:0,fz:0,fyaw:0,speed:kind==='whale'?.9:1.4,boost:1,bend:0,bendYaw:0};}
