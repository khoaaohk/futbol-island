const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});cache.set(file,m.exports);return m.exports;}
const {createRampMotion,rampSurface}=load('lib/town/rideRamps.ts'),r={id:'test',x:80,z:-180,yaw:0,width:3.4,length:6,height:1.35,label:'Scan'};
for(const mode of ['scooter','bike','moped']){const m=createRampMotion([r],[]),p={x:80,z:-179.9},v={x:0,z:14};assert(m.enter({x:80,z:-180.1},p,v,mode));assert(v.z>14);let peak=0,wobble=0,landed=false;for(let i=0;i<220;i++){const result=m.update(1/60,p,v,mode);peak=Math.max(peak,m.state.lift);if(m.state.phase==='land')wobble=Math.max(wobble,Math.abs(m.state.roll));landed||=result.landed;}assert(peak>3.5&&peak<4.2);assert(wobble>.06);assert(landed);assert.equal(m.state.phase,'idle');assert.equal(m.state.roll,0);assert.equal(m.state.pitch,0);assert.equal(m.state.yaw,0);assert(!m.enter({x:80,z:-174},p,v,mode),'no repeated airborne triggers');}
for(const mode of ['walk','jetpack'])assert(!createRampMotion([r],[]).enter({x:80,z:-180.1},{x:80,z:-179.9},{x:0,z:20},mode));assert(!createRampMotion([r],[]).enter({x:80,z:-179.9},{x:80,z:-180.1},{x:0,z:-20},'bike'));assert.equal(rampSurface([r],80,-177),.675);assert.equal(rampSurface([r],85,-177),0);
const m=createRampMotion([r],[{x:80,z:-167,w:10,d:.1}]),p={x:80,z:-179.9},v={x:0,z:20};m.enter({x:80,z:-180.1},p,v,'moped');for(let i=0;i<180;i++)m.update(1/60,p,v,'moped');assert(p.z<-167.8,'no tunneling through thin obstacle');console.log('RIDE_RAMPS_PASS boosts, ballistic arc, three rides, settle to straight, direction gate, walking surface and swept collision');

const roofs=[{x:-3,z:-23,w:12,d:11,height:9.73,name:'BAKERY'},{x:14,z:-23,w:12,d:12,height:11.23,name:'RUA DO SOL'},{x:32,z:-23,w:12,d:12,height:10.23,name:'FISH MARKET'}],roofRamps=load('lib/town/rideRamps.ts').planRoofRamps(roofs);
assert.equal(roofRamps.length,4);
for(const r of roofRamps.filter(r=>r.target&&!r.cannon)){
 const walls=roofs.map(b=>({...b,floor:0,top:b.height})),m=createRampMotion([r],roofs,roofs,walls),p={x:r.x+.05,z:r.z},v={x:14,z:0};
 assert(!m.enter({x:r.x-.1,z:r.z},p,v,'bike',0),'roof ramps cannot activate from street');
 assert(m.enter({x:r.x-.1,z:r.z},p,v,'bike',r.base));let landed=false;
 for(let i=0;i<200;i++){if(m.update(1/60,p,v,'bike').landed){landed=true;break;}}
 assert(landed,'land on target roof');assert(Math.abs(p.x-r.target.x)<.6);assert(Math.abs(p.z-r.target.z)<.1);
}
console.log('ROOF_RAMPS_PASS elevated entry, upward/downward roof transfers and target landings');

for(const mode of ['scooter','bike','moped'])for(const incoming of [.25,1.5,8,28]){
 const r=roofRamps[0],m=createRampMotion(roofRamps,roofs,roofs,roofs.map(b=>({...b,floor:0,top:b.height}))),p={x:r.x+1,z:r.z},v={x:incoming,z:0};
 assert(m.enter({x:p.x-.02,z:p.z},p,v,mode,r.base+r.height/3),'starting partway up a roof ramp launches');assert(v.x>incoming,'roof ramp boosts rather than slowing rider');
 for(let i=0;i<200;i++){if(m.update(1/60,p,v,mode).landed)break;}
 assert.equal(m.state.phase,'land');const next=roofRamps[1];p.x=next.x+.05;p.z=next.z;v.x=8;v.z=0;
 assert(m.enter({x:next.x-.05,z:next.z},p,v,mode,next.base),'next roof ramp works during landing wobble');
}
console.log('ROOF_BOOST_PASS slow entry, on-ramp starts, actual speed gain and chained roof jumps');

for(const r of roofRamps.filter(r=>r.target&&!r.cannon))for(const side of [-1.7,1.7])for(const mode of ['scooter','bike','moped']){
 const m=createRampMotion([r],roofs,roofs,roofs.map(b=>({...b,floor:0,top:b.height}))),p={x:r.x+.01,z:r.z+side},v={x:.25,z:0};
 assert(m.enter({x:r.x-.01,z:p.z},p,v,mode,r.base),'gentle entry near widened edge boosts');
 let landed=false;for(let i=0;i<200;i++){if(m.update(1/60,p,v,mode).landed){landed=true;break;}}
 assert(landed);assert(Math.abs(p.x-r.target.x)<1);assert(Math.abs(p.z-r.target.z-side)<.01);
}
console.log('WIDE_ROOF_RAMPS_PASS gentle near-edge entry and landing for every ride');

for(const mode of ['scooter','bike','moped']){
 const r=roofRamps[2],m=createRampMotion(roofRamps,roofs,roofs,roofs.map(b=>({...b,floor:0,top:b.height}))),p={x:r.x+.01,z:r.z},v={x:.25,z:0};
 assert(m.enter({x:r.x-.01,z:r.z},p,v,mode,r.base));assert(Math.abs(Math.hypot(v.x,v.z)-40)<.01);let peak=0,landed=false;
 for(let i=0;i<300;i++){const result=m.update(1/60,p,v,mode);peak=Math.max(peak,m.state.lift);if(result.landed){landed=true;break;}}
 assert(peak>6);assert(Math.hypot(p.x-r.target.x,p.z-r.target.z)<2);assert(landed);assert(rampSurface(roofRamps,p.x,p.z)>1,'touches down on landing slope');
}
console.log('CANNON_RAMP_PASS gentle entry, stronger launch, high arc and distant landing');

const launches=roofRamps.filter(r=>!r.landingOnly),landing=roofRamps.find(r=>r.landingOnly);
assert(launches.every(r=>r.yaw===Math.PI/2&&r.z===launches[0].z),'all rooftop ramps in one straight line');
assert.equal(landing.z,launches[0].z);assert(Math.abs(landing.yaw-Math.PI*1.5)<.0001,'landing slopes down along the same line');
console.log('RAMP_ALIGNMENT_PASS straight three-roof sequence and matching landing axis');

for(const mode of ['scooter','bike','moped']){
 const results=[];
 for(const reduced of [false,true]){
  const r=roofRamps[2],m=createRampMotion(roofRamps,roofs,roofs,roofs.map(b=>({...b,floor:0,top:b.height}))),p={x:r.x+.01,z:r.z},v={x:1,z:0};m.enter({x:r.x-.01,z:r.z},p,v,mode,r.base);
  let elapsed=0,minScale=1,trick=0,landed=false;
  for(let i=0;i<900;i++){const result=m.update(1/120,p,v,mode,reduced);elapsed+=1/120;minScale=Math.min(minScale,m.state.timeScale);trick=Math.max(trick,Math.abs(m.state[mode==='scooter'?'trickYaw':mode==='bike'?'trickPitch':'trickStretch']));if(result.landed){landed=true;break;}}
  assert(landed);assert.equal(m.state.timeScale,1);assert.equal(m.state.trickPitch+m.state.trickRoll+m.state.trickYaw,0);results.push({elapsed,minScale,trick,x:p.x,z:p.z});
 }
 assert(results[0].elapsed>results[1].elapsed*1.4,'slow motion visibly extends finale');assert(results[0].minScale<.4);assert(results[0].trick>(mode==='moped'?.9:6));assert.equal(results[1].minScale,1);assert.equal(results[1].trick,0);assert(Math.hypot(results[0].x-results[1].x,results[0].z-results[1].z)<.5,'slow clock preserves landing target');
}
console.log('FINALE_TRICKS_PASS distinct tricks, smooth slow motion, target preservation, landing reset and reduced motion');
for(const mode of ['scooter','bike','moped']){
 const r=landing,m=createRampMotion(roofRamps,roofs,roofs,roofs.map(b=>({...b,floor:0,top:b.height}))),p={x:r.x-.02,z:r.z},v={x:-2,z:0};assert(m.enter({x:r.x+.02,z:r.z},p,v,mode,.02));assert.equal(Math.round(Math.hypot(v.x,v.z)),32);let impacts=0,recovered=false,maxLift=0;
 for(let i=0;i<500;i++){const result=m.update(1/60,p,v,mode);if(result.crashed){impacts++;assert.equal(m.state.phase,'splat');assert(p.x>38.7,'stops outside building wall');assert.equal(Math.hypot(v.x,v.z),0);}maxLift=Math.max(maxLift,m.state.lift);if(result.recovered){recovered=true;break;}}
 assert.equal(impacts,1);assert(recovered);assert(maxLift>3);assert.equal(m.state.phase,'idle');assert.equal(m.state.lift,0);assert(p.x>38.7);
 assert(!m.enter({x:r.x-1,z:r.z},{x:r.x-.9,z:r.z},{x:10,z:0},mode,.3),'downhill travel does not reverse-boost');
}
console.log('REVERSE_LANDING_PASS uphill boost, swept wall stop, one splat, ground recovery and downhill gate');
