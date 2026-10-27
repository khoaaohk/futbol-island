// Natural swimming (Oct 27 2026; docs/SWIM_NATURAL_OCT27.md): the pure motion helpers in lib/town/water/swimMotion.ts (drag, the
// momentum turn, the stroke surge and clock, the bob, rate-limited pitch, buoyancy, the bank, the reef's near-coral precision, the
// current, the soft slide, the FOV ease) and how the surface swim, the duck-dive and the reef use them.
// Run: node tests/swim-natural-oct27.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),T=require('node:module').createRequire(base+'/package.json')('three');
const G={Math,Map,Set,WeakMap,Uint8Array,Uint16Array,Uint32Array,Int8Array,Int16Array,Int32Array,Float32Array,Float64Array,console,JSON,Number,Object,Array,String,Symbol,Error,Promise,Date,RegExp,isFinite,parseFloat,parseInt};
const loaded=new Map();function load(file){file=path.resolve(base,file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,{...G,exports:mod.exports,module:mod,
  require:id=>id==='three'?T:id.startsWith('@/')?load(resolveTs(path.resolve(base,id.slice(2)))):id.startsWith('.')?load(resolveTs(path.resolve(path.dirname(file),id))):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const resolveTs=p=>fs.existsSync(p+'.ts')?p+'.ts':fs.existsSync(p+'.tsx')?p+'.tsx':p+'/index.ts';
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
let passed=0;const ok=(name,fn)=>{try{fn();passed++;console.log('ok  ',name);}catch(e){console.error('FAIL',name);throw e;}};
const M=load('lib/town/water/swimMotion.ts'),W=load('lib/town/water/waterDepth.ts'),S=load('lib/town/water/waterState.ts'),DS=load('lib/town/water/diveSession.ts'),D=load('lib/town/water/diveSpots.ts');
const F=1/60;

ok('drag: approach / wrap / smooth01 are bounded and eased',()=>{
 assert.equal(M.approach(5,0),0);assert(M.approach(5,1)>.99&&M.approach(5,1)<1);assert.equal(M.approach(-1,1),0,'never negative');
 assert(Math.abs(M.wrapAngle(Math.PI*3)-Math.PI)<1e-9||Math.abs(M.wrapAngle(Math.PI*3)+Math.PI)<1e-9);assert(Math.abs(M.wrapAngle(.5+Math.PI*4)-.5)<1e-9);
 assert.equal(M.smooth01(-1,0,1),0);assert.equal(M.smooth01(2,0,1),1);assert(Math.abs(M.smooth01(.5,0,1)-.5)<1e-9);assert.equal(M.smooth01(.2,.9,.3),1,'a falling edge');
});

ok('the momentum turn: the heading eases on, never faster than the turn rate, slower at speed; a hard turn sheds a little pace',()=>{
 const h=M.turnHeading(0,Math.PI*.9,0,.1);assert(h>0&&h<=M.SWIM_MOTION.turn.slow*.1+1e-9,'capped at slow rate: '+h);
 assert(M.turnHeading(0,Math.PI*.9,1,.1)<=M.SWIM_MOTION.turn.fast*.1+1e-9,'slower at top speed');
 assert(Math.abs(M.turnHeading(0,.01,0,.1)-.01)<.01,'small changes ease straight on');
 assert.equal(M.turnKeep(0),1);assert(Math.abs(M.turnKeep(Math.PI/2)-(1-M.SWIM_MOTION.turn.shed))<1e-9);assert.equal(M.turnKeep(Math.PI),M.turnKeep(Math.PI/2),'capped at 90°');
});

ok('swimVelocity: a reversal swims an arc (never through zero), a release glides down on the drag, a push from still goes straight',()=>{
 const v={x:0,z:4.8};let minS=9,side=0;for(let i=0;i<120;i++){const s=M.swimVelocity(v,0,-1,4.8,6.5,3.4,4.8,F);minS=Math.min(minS,s);side=Math.max(side,Math.abs(v.x));}
 assert(minS>2,'kept moving through the U-turn: '+minS.toFixed(2));assert(side>1,'swam an arc: '+side.toFixed(2));assert(v.z< -4,'ends heading the new way: '+v.z.toFixed(2));
 const r={x:3,z:0},s1=M.swimVelocity(r,0,0,0,6.5,3.4,4.8,.1);assert(s1<3&&s1>3*.7,'momentum carries: '+s1);
 const st={x:0,z:0};for(let i=0;i<30;i++)M.swimVelocity(st,1,0,4.8,6.5,3.4,4.8,F);assert(Math.abs(st.z)<1e-9&&st.x>3,'from still: straight off along the stick');
});

ok('the stroke: surge averages 1 (no faster on average) and peaks on the pull; the clock speeds with the stick, Swim fast quickest, slower under',()=>{
 let sum=0,hi=0,lo=9;const N=2000;for(let i=0;i<N;i++){const s=M.strokeSurge(i/N*Math.PI*2,1);sum+=s;hi=Math.max(hi,s);lo=Math.min(lo,s);}
 assert(Math.abs(sum/N-1)<.005,'mean 1: '+(sum/N));assert(hi>1.05&&hi<=1+M.SWIM_MOTION.surge.amp+1e-9);assert(lo>.9);assert.equal(M.strokeSurge(1,0),1,'no effort, no surge');
 const r0=M.strokeRate(.2,0,false,0,false),r1=M.strokeRate(1,1,false,0,false);assert(r1>r0,'quicker with the stick');
 assert(M.strokeRate(1,1,true,0,false)>r1,'Swim fast quickest');assert(M.strokeRate(1,1,false,1,false)<r1,'slower under');assert.equal(M.strokeRate(0,0,false,0,true),M.SWIM_MOTION.stroke.tread);
});

ok('the bob: small and smaller at speed; pitch is rate-limited; the dive arc and buoyancy',()=>{
 let a0=0,a1=0;for(let t=0;t<6;t+=.02){a0=Math.max(a0,Math.abs(M.surfaceBob(t,0,0)));a1=Math.max(a1,Math.abs(M.surfaceBob(t,1,0)-M.SWIM_MOTION.bob.heave));}
 assert(a0<=M.SWIM_MOTION.bob.amp+1e-9&&a0>.02,'bob at rest '+a0);assert(a1<a0,'smaller when swimming');
 const p=M.pitchToward(0,1,.1);assert(p<=M.SWIM_MOTION.pitch.rate*.1+1e-9&&p>0,'rate-limited '+p);assert.equal(M.pitchToward(.3,.3,.1),.3);
 assert(M.climbPitch(2)<0,'rising: nose up');assert.equal(M.climbPitch(99),-M.SWIM_MOTION.pitch.max);
 assert.equal(M.diveArcPitch(0,true,.6),0);assert(Math.abs(M.diveArcPitch(.5,true,.6)-.6)<1e-9);assert(M.diveArcPitch(.5,false,.6)<0,'head up on the way back');
 assert(M.buoyancyRate(1)>1&&M.buoyancyRate(0)<1,'brisk from the bottom, gentle at the top');
});

ok('the bank leans into the turn (capped), the reef turn has momentum, near-coral precision, the current, the soft slide, the FOV ease',()=>{
 assert(M.bankFor(2,1,.5,2.2)<0&&M.bankFor(-2,1,.5,2.2)>0,'into the turn');assert.equal(M.bankFor(-99,1,.5,2.2),.5,'capped');assert(Math.abs(M.bankFor(-2,0,.5,2.2))<Math.abs(M.bankFor(-2,1,.5,2.2)),'less when slow');
 let r=0;r=M.reefYawRate(r,2,0,F);assert(r>0&&r<.5,'eases in: '+r);let rn=M.reefYawRate(0,2,1,F);assert(rn>r,'quicker near coral');
 assert.equal(M.reefNear(5),0);assert.equal(M.reefNear(0),1);assert(M.reefNear(.6)>0&&M.reefNear(.6)<1);
 assert(M.reefCurrent(1)<=M.SWIM_MOTION.current.push+1e-9&&M.reefCurrent(-1)>0,'a gentle push, always down-current');
 const v={vx:-1,vz:1};assert.equal(M.slideAlong(v,1,0,1),true);assert.equal(v.vx,0);assert.equal(v.vz,1,'slides along');const v2={vx:1,vz:0};assert.equal(M.slideAlong(v2,1,0),false,'moving away: untouched');
 assert.equal(M.fovKick(1,false),0,'off: none');assert.equal(M.fovKick(1,true),M.SWIM_MOTION.fov.kick);let f=0;for(let i=0;i<300;i++)f=M.easeFov(f,3,F);assert.equal(f,3,'snaps once close');
});

ok('surface swim: a U-turn is an arc, Swim fast still reaches SWIM_SPRINT, the glide under carries further',()=>{
 const allowed=()=>true,land=()=>false,p={x:20,z:0},v={x:0,z:0};
 for(let i=0;i<300;i++)W.swimStep(p,v,{x:1,z:0},false,F,allowed,land,0);let minS=9;for(let i=0;i<120;i++)minS=Math.min(minS,W.swimStep(p,v,{x:-1,z:0},false,F,allowed,land,0));
 assert(minS>1.5,'no dead stop in a U-turn: '+minS.toFixed(2));
 const a={x:0,z:0},va={x:3,z:0},b={x:0,z:0},vb={x:3,z:0};for(let i=0;i<60;i++){W.swimStep(a,va,{x:0,z:0},false,F,allowed,land,0,1,0);W.swimStep(b,vb,{x:0,z:0},false,F,allowed,land,0,1,1);}
 assert(b.x>a.x*1.15,'under: a longer glide '+b.x.toFixed(2)+' vs '+a.x.toFixed(2));
});

ok('waterState: bob and bank on the pose (none with reduced motion), buoyancy, the pitch never snaps; the reef: momentum, bank, near-coral, current only while swimming',()=>{
 const probe={sample:()=>3,isLand:()=>false,allowed:()=>true,reset(){},d:30};const w=S.createWaterState(probe,()=>false);
 let yaw=0,maxBank=0,maxBob=0;for(let i=0;i<120;i++){w.step(F,0,0,{stick:1,moving:true,speed:4,landY:0,yaw,airborne:false});yaw+=1.5*F;maxBank=Math.max(maxBank,Math.abs(w.pose.bank));maxBob=Math.max(maxBob,Math.abs(w.pose.bob));}
 assert(maxBank>.1&&maxBank<=.29,'banks into a turn: '+maxBank);assert(maxBob>.005,'bobs');
 const wr=S.createWaterState(probe,()=>true);for(let i=0;i<60;i++){wr.step(F,0,0,{stick:1,moving:true,speed:4,landY:0,yaw:i*.03,airborne:false});}assert.equal(wr.pose.bank,0);assert.equal(wr.pose.bob,0);
 let maxStep=0,prev=w.pose.tilt;w.press('dive','tap');for(let i=0;i<180;i++){w.step(F,30,0,{stick:0,moving:false,speed:0,landY:0,yaw:0,airborne:false});maxStep=Math.max(maxStep,Math.abs(w.pose.tilt-prev));prev=w.pose.tilt;}
 assert(maxStep<=M.SWIM_MOTION.pitch.rate*F+1e-9,'pitch never snaps: '+maxStep);
 // The reef: the turn eases in (no instant yaw rate), the bank follows it, no drift at rest.
 const spot=D.diveSpotById('kelp-trawler'),s=DS.createDiveSession();s.scan(.2,spot.x,spot.z,true);assert(s.start());
 s.step(1/30,{sx:1,sy:-1,lift:0});const y1=Math.abs(s.state.yawV);assert(y1>0&&y1<DS.DIVE_TURN*.5,'the turn eases in: '+y1);
 for(let i=0;i<60;i++)s.step(1/30,{sx:1,sy:-1,lift:0});assert(Math.abs(s.state.roll)>.2,'banks: '+s.state.roll);
 for(let i=0;i<300;i++)s.step(1/30,{sx:0,sy:0,lift:0});const x0=s.state.x,z0=s.state.z;for(let i=0;i<90;i++)s.step(1/30,{sx:0,sy:0,lift:0});
 assert(Math.hypot(s.state.x-x0,s.state.z-z0)<.05,'at rest the current does not carry the diver');
 const src=read('lib/town/water/swimMotion.ts');assert(!/new [A-Z]|=\s*\[|return\s*\{|\(\s*\{/.test(src.replace(/\/\*\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'').replace(/export const SWIM_MOTION=[\s\S]*?as const;/,'')),'no allocation in the helpers');
});

ok('wired: Town feeds the surge + under and eases the Swim fast FOV behind waterFxOn; the reef camera FOV is off when lite / calm / reduced',()=>{
 const town=read('components/Town.tsx'),room=read('lib/graphics/diveRoom.ts');
 assert(/strokeSurge\(water\.pose\.phase,water\.pose\.effort\),water\.state\.under\)/.test(town));assert(/fovKick\([^;]*waterFxOn\(\)\)/.test(town));
 assert(room.includes('fovOn=!(opt.reduced||opt.lite||opt.calm)'));
});
console.log(`swim-natural-oct27: ${passed} passed`);
