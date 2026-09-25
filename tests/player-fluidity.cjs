const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
function loader(unfiltered=false){
 const cache=new Map();return function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);
  if(unfiltered==='spring'&&file.endsWith('/poseResponse.ts')){const original=loader()(file);return {...original,inertialResponse:original.poseResponse};}
  if(unfiltered===true&&file.endsWith('/poseResponse.ts'))return {poseResponse:(_s,_c,target)=>target,inertialResponse:(_s,_c,target)=>target};
  const m={exports:{}};cache.set(file,m.exports);
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set});return m.exports;
 };
}
const load=loader(),{poseResponse,inertialResponse}=load('lib/graphics/poseResponse.ts');
// The same held target reaches the same position/velocity at 30, 60 and 120 Hz.
const responses=[];
for(const hz of [30,60,120]){
 const state=new Float64Array(2);poseResponse(state,0,0,0,32,true);let prior=0;
 for(let i=0;i<hz/2;i++){const v=poseResponse(state,0,1,1/hz,32,false);assert(v>=prior&&v<=1,'no overshoot or reversal');prior=v;}
 const held=Array.from(state);poseResponse(state,0,-1,0,32,false);assert.deepEqual(Array.from(state),held,'pause freezes velocity too');responses.push(held);
}
responses.slice(1).forEach(r=>r.forEach((v,i)=>assert(Math.abs(v-responses[0][i])<1e-10)));
// Continuous motion tracks without persistent phase lag; pause holds all state,
// and a marked transition decays its offset instead of replacing the incoming pose.
for(const hz of [30,60,120]){
 const s=new Float64Array(6);inertialResponse(s,0,0,0,30,true,false);
 for(let i=1;i<=hz;i++)assert(Math.abs(inertialResponse(s,0,i/hz,1/hz,30,false,false)-i/hz)<1e-12);
 const changed=inertialResponse(s,0,2,1/hz,30,false,true);assert(changed>1&&changed<1.2,'intent change preserves incoming pose/momentum');
 const paused=Array.from(s);inertialResponse(s,0,5,0,30,false,true);assert.deepEqual(Array.from(s),paused);
}
// Compare the actual rig with immediate target posing across receive/release and jockey changes.
function measure(unfiltered,hz){
 const {createPlayer}=loader(unfiltered)('lib/graphics/player.ts'),r=createPlayer('fluidity','home',false);
 const names=['armor-torso','left-shoulder','right-shoulder','left-elbow','right-elbow'];
 let previous,velocity,maxAcceleration=0,maxStep=0,shoulderMin=Infinity,shoulderMax=-Infinity;
 for(let i=0;i<hz*4;i++){
  const t=i/hz,receiving=t>=1&&t<1.35,defending=t>=2&&t<2.5;
  r.update(0,t*2.4,1/hz,t,false,{facing:0,runIntensity:.8,receive:receiving?1:0,kickSide:1,jockey:defending?1:0});
  const values=names.flatMap(n=>{const v=r.root.getObjectByName(n).rotation;return [v.x,v.y,v.z];});
  const arm=r.root.getObjectByName('left-shoulder').rotation.x;if(t>2.8){shoulderMin=Math.min(shoulderMin,arm);shoulderMax=Math.max(shoulderMax,arm);}
  if(previous){const next=values.map((v,j)=>(v-previous[j])*hz);if(t>.8){maxStep=Math.max(maxStep,...values.map((v,j)=>Math.abs(v-previous[j])));if(velocity)maxAcceleration=Math.max(maxAcceleration,...next.map((v,j)=>Math.abs(v-velocity[j])*hz));}velocity=next;}
  previous=values;
 }
 // Holding the procedural clock must freeze all filtered joints exactly.
 r.update(0,(4-1/hz)*2.4,0,4-1/hz,false,{facing:0,runIntensity:.8});
 const held=names.flatMap(n=>{const v=r.root.getObjectByName(n).rotation;return [v.x,v.y,v.z];});
 if(!unfiltered)held.forEach((v,i)=>assert(Math.abs(v-previous[i])<1e-10,'held upper-body pose'));
 r.dispose();return {maxAcceleration,maxStep,armRange:shoulderMax-shoulderMin};
}
const report=[];
for(const hz of [30,60,120]){
 const before=measure(true,hz),spring=measure('spring',hz),after=measure(false,hz);report.push({hz,before,spring,after});
 assert(after.maxAcceleration<before.maxAcceleration*.65,'intent changes have lower angular acceleration');
 assert(after.maxStep<before.maxStep*.65,'intent changes have smaller joint jumps');
 assert(after.armRange>before.armRange*.65,'retain expressive arm drive rather than freezing limbs');
 assert(after.armRange>spring.armRange*1.02,'recover arm excursion lost to continuous position filtering');
}
console.log('PLAYER_FLUIDITY_PASS',JSON.stringify(report));
