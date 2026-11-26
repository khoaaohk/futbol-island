// Ray / whale shark at the shore (owner, Nov 25 2026: "when riding the ray to the shore, i hop off but the ray gets stuck and
// shakes"; lib/town/water/animalRides.ts RET_ESC_*): a ride that ends in the shallows (the probe's clearance under RIDE_SHORE_D, or
// Let go there) leaves the body inside its hull margin. The animal must turn and swim smoothly out to deep water and back to its
// loop: never onto the sand, never stopped at the waterline, and no left/right flipping of its heading (the old shake).
// Run: node tests/ray-shore-escape.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,Float32Array,Float64Array,require:id=>id==='three'?T:id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const R=load('lib/town/water/animalRides.ts');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
function circleFriend(kind='manta',r=30,cx=0){const points=[],n=96;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;points.push({x:cx+Math.cos(a)*r,z:Math.sin(a)*r});}
 const lengths=[0];for(let i=1;i<=n;i++){const a=points[i-1],b=points[i%n];lengths.push(lengths[i-1]+Math.hypot(b.x-a.x,b.z-a.z));}
 return {kind,id:kind+'-test',points,lengths,total:lengths[n],u:0,available:true,ridden:false,free:false,fx:0,fz:0,fyaw:0,speed:kind==='whale'?.9:1.4,boost:1,bend:0,bendYaw:0};}
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
// Shores: land beyond z = S (straight), a diagonal, a curved bay corner (the rounded waterline corners of the Nov 25 reshape).
const S2=Math.SQRT1_2,shores={
 straight:S=>[(x,z)=>z>S,(x,z)=>S-z],
 diagonal:S=>[(x,z)=>(x+z)*S2>S,(x,z)=>S-(x+z)*S2],
 corner:S=>[(x,z)=>z>S||x>S,(x,z)=>Math.min(S-z,S-x)]};
ok('after a ride ends in the shallows (shore / Let go, head-on / oblique / along), the animal swims out smoothly and never shakes',()=>{
 let runs=0,worstFlips=0,worstStill=0;
 for(const kind of ['manta','whale'])for(const [sn,mk] of Object.entries(shores))for(const S of [40,60])for(const how of ['shore','off'])for(const head of [0,.8,1.5,-1.2])for(const dt of [1/60,1/24]){
  const [land,dist]=mk(S),f=circleFriend(kind,30),rides=R.createAnimalRides(()=>[f]),pos={x:30+R.RIDE_BODY[kind],z:0},vel={x:0,z:0},h=R.RIDE_HULL[kind];
  const tag=`${kind} ${sn} S=${S} ${how} head=${head} dt=${dt.toFixed(3)}`;
  rides.scan(.2,pos.x,pos.z,true);assert.equal(rides.grab(2).grabbed,kind,tag);
  // Put the ridden animal where the ride ends: the grip RIDE_SHORE_D − 0.1 m from land or the nose (+60 % of its margin) at the
  // sand, whichever comes first (the hull probe's kick-off), facing the shore (head = bearing off it).
  const inward=sn==='straight'?0:Math.PI/4,yaw=inward+head,g=R.RIDE_GRIP[kind];
  let fx=sn==='corner'?S-16:sn==='diagonal'?(S-16)*S2:30,fz=sn==='diagonal'?(S-16)*S2:S-16;
  const nz0=h.bow+h.margin*.6;for(let i=0;i<400;i++){const gx=fx+Math.sin(yaw)*g,gz=fz+Math.cos(yaw)*g;if(dist(gx,gz)<=R.RIDE_SHORE_D-.1||dist(fx+Math.sin(yaw)*nz0,fz+Math.cos(yaw)*nz0)<=.05)break;fx+=Math.sin(inward)*.05;fz+=Math.cos(inward)*.05;}
  f.fx=fx;f.fz=fz;f.fyaw=yaw;
  rides.state.land=land;// Town steps every ride frame with the probe's land test (waterProbe.isLand), so it is always kept
  const e=how==='shore'?rides.step(dt,pos,vel,{x:0,z:0},()=>true,R.RIDE_SHORE_D-.1,land):rides.letGo('off');
  assert.equal(e.ended,how,tag);assert(rides.darting,tag+': swims back');
  const body=()=>{const sx=Math.sin(f.fyaw),sz=Math.cos(f.fyaw),rx=sz,rz=-sx;
   for(const [a,s] of [[h.bow,0],[0,0],[-h.tail,0]])if(land(f.fx+sx*a+rx*s,f.fz+sz*a+rz*s))return `(${a},${s})`;return '';};
  let t=0,prevTurn=0,flips=0,still=0,maxStill=0,deep=false,px=f.fx,pz=f.fz;
  while(rides.darting&&t<25){const y0=f.fyaw;rides.dartStep(dt);t+=dt;
   if(f.free){assert.equal(body(),'',`${tag}: on the sand at t=${t.toFixed(2)}`);
    const turn=wrap(f.fyaw-y0);if(Math.abs(turn)>1e-4){if(prevTurn&&Math.sign(turn)!==Math.sign(prevTurn))flips++;prevTurn=turn;}
    const moved=Math.hypot(f.fx-px,f.fz-pz);still=moved<1e-4?still+dt:0;maxStill=Math.max(maxStill,still);px=f.fx;pz=f.fz;
    if(dist(f.fx,f.fz)>h.bow+h.side+h.margin*2)deep=true;}}
  assert(deep||!f.free,`${tag}: reached deep water`);
  assert(flips<=3,`${tag}: heading flipped ${flips} times (shaking)`);
  assert(maxStill<.6,`${tag}: stuck still for ${maxStill.toFixed(2)} s`);
  assert(!rides.darting||t>=25,`${tag}: back on its loop`);
  worstFlips=Math.max(worstFlips,flips);worstStill=Math.max(worstStill,maxStill);runs++;
 }
 console.log(`  ${runs} runs; worst heading flips ${worstFlips}, longest standstill ${worstStill.toFixed(2)} s`);
});
ok('the escape constants are named and the shake-causing side flip is gone',()=>{
 const src=fs.readFileSync(path.join(base,'lib/town/water/animalRides.ts'),'utf8');
 for(const k of ['RET_ESC_DIRS','RET_ESC_RINGS','RET_ESC_V','RET_ESC_MIN','RET_ESC_STALL','RET_ESC_RUN','RET_ESC_HOLD'])assert(typeof R[k]==='number',k);
 assert(!src.includes('state.shoreSide=-state.shoreSide'),'no per-probe side flip');
});
if(failed){console.log(failed+' failed');process.exit(1);}console.log('ray-shore-escape: all passed');
