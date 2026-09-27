// Expressive flight poses: selection, blending, sleep/reduced-motion behaviour and rig output.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const path = require('node:path');
function load(file){const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:mod,exports:mod.exports,Math,Float32Array,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return mod.exports;}
const {createFlightPoses,FLIGHT_POSES}=load('lib/graphics/flightPoses.ts');
const {createFlightMotion}=load('lib/graphics/flightMotion.ts');
const {createPlayer}=load('lib/graphics/player.ts');
const DT=1/60;
let seed=7;const random=()=>((seed=(seed*16807)%2147483647)/2147483647);
const sum=w=>Array.from(w).reduce((a,b)=>a+b,0);

// 1. Hover at rest, Superman variants while cruising, all weights bounded.
{
 const poses=createFlightPoses(random);let z=0;
 for(let i=0;i<60;i++)poses.update(DT,0,0,28,'cruise',1,0,0,'idle','classic',false);
 assert.equal(poses.style.dominant,'hover','still flight floats in the hover pose');
 const seen=new Set();let maxSum=0,switches=0,last=poses.style.variant;
 for(let i=0;i<60*60;i++){z+=34*DT;const s=poses.update(DT,0,z,28,'cruise',1,0,0,'idle','classic',false);maxSum=Math.max(maxSum,sum(s.weights));seen.add(s.dominant);if(s.variant!==last){switches++;last=s.variant;}}
 assert(maxSum<=1.0001,'blend weights never exceed 1');
 assert(switches>=5&&switches<=16,'steady cruise changes variant every several seconds ('+switches+' in 60 s)');
 for(const name of ['superman','glide'])assert(seen.has(name),'cruise shows '+name);
 assert(seen.has('oneArmL')||seen.has('oneArmR'),'cruise shows a one-arm Superman');
 // Turning holds the current variant (no switching mid-bank).
 const before=poses.style.variant;for(let i=0;i<60*12;i++){z+=34*DT;poses.update(DT,0,z,28,'cruise',1,.8,0,'idle','classic',false);}
 assert.equal(poses.style.variant,before,'banking does not reshuffle the pose');
 assert(poses.style.bank>.7,'banking follows the turn');
}
// 2. Blends are eased (no snapping): ~0.3–0.6 s to settle.
{
 const poses=createFlightPoses(()=>.1);let z=0;
 for(let i=0;i<120;i++){z+=34*DT;poses.update(DT,0,z,28,'cruise',1,0,0,'idle','classic',false);}
 poses.style.variant=3;let t50=-1,t90=-1;const glide=FLIGHT_POSES.indexOf('glide');let prev=poses.style.weights[glide],maxStep=0;
 for(let i=1;i<=60;i++){z+=34*DT;const w=poses.update(DT,0,z,28,'cruise',1,0,0,'idle','classic',false).weights[glide];maxStep=Math.max(maxStep,w-prev);prev=w;if(t50<0&&w>.5)t50=i*DT;if(t90<0&&w>.9)t90=i*DT;}
 assert(t50>.05&&t50<.2&&t90>.25&&t90<.6,'variant blend settles in ~0.3–0.6 s (50% '+t50.toFixed(2)+' s, 90% '+t90.toFixed(2)+' s)');
 assert(maxStep<.15,'no single-frame snap');
}
// 3. Actions and phases: dash → Superman, blast/takeoff → climb, landing → dive that clears before touchdown.
{
 const poses=createFlightPoses(random);
 for(let i=0;i<30;i++)poses.update(DT,0,i*2,28,'cruise',1,0,0,'dash','classic',false);assert.equal(poses.style.dominant,'superman','boost dash flies Superman');
 for(let i=0;i<30;i++)poses.update(DT,0,60,28+i*3,'cruise',1,0,0,'blast','classic',false);assert.equal(poses.style.dominant,'climb','blast reaches up');
 poses.reset();for(let i=0;i<30;i++)poses.update(DT,0,0,i,'takeoff',i/60,0,0,'idle','classic',false);assert.equal(poses.style.dominant,'climb','take-off reaches up');
 poses.reset();const dive=FLIGHT_POSES.indexOf('dive');let peak=0,end=1;
 for(let i=0;i<57;i++){const p=i/57;const s=poses.update(DT,0,0,28-26*p,'landing',p,0,0,'idle','classic',false);peak=Math.max(peak,s.weights[dive]);if(p>.6&&p<.62)end=s.total;}
 assert(peak>.6,'landing opens with a dive');assert(end<.15,'dive hands the body back to the landing brace before touchdown');
 for(const kind of ['flying-car','mini-plane','rocketboard']){const q=createFlightPoses();for(let i=0;i<30;i++)q.update(DT,0,i,28,'cruise',1,0,0,'dash',kind,false);assert.equal(q.style.total,0,kind+' keeps its own vehicle pose');}
 for(const action of ['parachute','fall']){poses.update(DT,0,0,28,'cruise',1,0,0,action,'classic',false);assert.equal(poses.style.total,0,action+' clears the style');}
}
// 4. Sleeping loop (dt = 0) changes nothing; reduced motion is one calm, shallower glide without bob.
{
 const fm=createFlightMotion();let z=0;for(let i=0;i<120;i++){z+=34*DT;fm.update(DT,i*DT,0,34,0,'cruise',1,false,0,z,28,'idle','classic');}
 const snapshot=Array.from(fm.poses.style.weights).join(),variant=fm.poses.style.variant;
 for(let i=0;i<600;i++)fm.update(0,5,0,34,0,'cruise',1,false,0,z+i,28,'idle','classic');
 assert.equal(Array.from(fm.poses.style.weights).join(),snapshot,'paused frames hold the pose');assert.equal(fm.poses.style.variant,variant,'paused frames never pick a new variant');
 const reduced=createFlightMotion();z=0;const doms=new Set();let maxPitch=0,bobMin=Infinity,bobMax=-Infinity;
 for(let i=0;i<60*30;i++){z+=34*DT;const p=reduced.update(DT,i*DT,0,34,0,'cruise',1,true,0,z,28,'idle','classic');if(i>120){doms.add(reduced.poses.style.dominant);maxPitch=Math.max(maxPitch,p.pitch);if(i>600){bobMin=Math.min(bobMin,p.bob);bobMax=Math.max(bobMax,p.bob);}}}
 assert.deepEqual([...doms],['glide'],'reduced motion keeps one calm glide');assert(maxPitch<.85,'reduced motion lies less flat');assert(bobMax-bobMin<.002,'reduced motion has no bob');
}
// 5. Rig: Superman lies flat with fists overhead and legs together; every pose stays finite, costume rig included.
{
 const rig=createPlayer('flight-poses','home',true,true),fm=createFlightMotion();const joint=n=>rig.root.getObjectByName(n);let z=0,pose;
 for(let i=0;i<120;i++){fm.poses.style.variant=0;z+=34*DT;pose=fm.update(DT,i*DT,0,34,0,'cruise',1,false,0,z,28,'idle','classic');rig.update(0,z,DT,i*DT,false,{travelMode:'jetpack',facing:0,flight:pose});}
 assert.equal(fm.poses.style.dominant,'superman');assert(pose.pitch>1.25,'Superman body is near horizontal');
 for(const side of ['left','right'])assert(joint(side+'-shoulder').rotation.x<-2.6,side+' fist reaches overhead');
 assert(Math.abs(joint('left-hip').rotation.z-joint('right-hip').rotation.z)<.1,'legs stay together');
 for(const [variant,name] of [[1,'oneArmL'],[2,'oneArmR'],[3,'glide']]){for(let i=0;i<90;i++){fm.poses.style.variant=variant;z+=34*DT;pose=fm.update(DT,i*DT,0,34,0,'cruise',1,false,0,z,28,'idle','classic');rig.update(0,z,DT,i*DT,false,{travelMode:'jetpack',facing:0,flight:pose});}
  assert.equal(fm.poses.style.dominant,name);rig.root.traverse(n=>assert([...n.position,...n.quaternion].every(Number.isFinite),'finite '+name));}
assert(joint('right-shoulder').rotation.z>.5&&joint('left-shoulder').rotation.z<-.5,'glide spreads both arms like wings');
 for(let i=0;i<30;i++)rig.update(0,z,DT,9+i*DT,false,{travelMode:'walk',facing:0});assert(Math.abs(joint('left-shoulder').rotation.x)<.6,'walking takes the arms back down');
 rig.dispose();
}
console.log('FLIGHT_POSES_PASS hover, Superman/one-arm/glide rotation, eased blends, dash/climb/dive, vehicles, sleep, reduced motion and rig output');
