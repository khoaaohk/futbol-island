// Realistic close control (lib/town/dribbleStop.ts, Oct 23 2026): sole stop, drag-back turn, cut touches and the touch rhythm,
// stepped from a rig's speed / yaw / gait phase. Pure curves: timing, thresholds, ball bounds, cooldowns, no allocation; then the
// rig wiring (player.ts): the sole lands on the ball, the ball never clips into the legs, lessons keep their lane.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),path=require('node:path'),T=require('three'),{spawnSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..'),loaded=new Map();
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 new Function('module','exports','require',code)(m,m.exports,n=>{if(n==='three')return T;if(n.startsWith('.')||n.startsWith('@/')){const base=n.startsWith('@/')?path.join(ROOT,n.slice(2)):path.resolve(path.dirname(file),n);for(const ext of ['.ts','.tsx','/index.ts',''])if(fs.existsSync(base+ext)&&fs.statSync(base+ext).isFile())return load(base+ext);}return require(n);});
 loaded.set(file,m.exports);return m.exports;}
const D=load(path.join(ROOT,'lib/town/dribbleStop.ts')),{DRIBBLE,MOVE_ROLL,MOVE_STOP,MOVE_TURN,TOUCH_LACES}=D;
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));

// Thresholds.
assert.equal(D.turnKind(.3),0);assert.equal(D.turnKind(.7),1);assert.equal(D.turnKind(-1.2),1);assert.equal(D.turnKind(1.7),2);assert.equal(D.turnKind(Math.PI),2);assert.equal(D.turnKind(-2.5),2);
assert(D.pushFor(4,false)>4*D.pushFor(.8,false),'a run pushes the ball much further than a walk');assert(Math.abs(D.pushFor(4,true)-D.pushFor(4,false)/2)<1e-12,'reduced motion halves the push');
assert.equal(D.stepsPerTouch(1,1),1);assert.equal(D.stepsPerTouch(2,1),3);assert.equal(D.stepsPerTouch(1.5,3),3,'hysteresis');assert.equal(D.stepsPerTouch(1.2,3),1);
assert(D.rollCurve(0)===0&&Math.abs(D.rollCurve(1/3)-1)<1e-12&&D.rollCurve(1)===0,'touch curve: at the boot at each touch, peak a third of the way');

// A small simulated mover: speed, yaw (turning toward target at rate 10 x yawScale), distance-driven gait phase.
function mover(reduced=false){
 const f=D.createDribbleFeel(),s={f,speed:0,yaw:0,target:0,phase:0,dist:0,t:0,frames:0,maxStep:0,minDist:9,maxDist:0,prevX:null,prevZ:null,events:[]};
 s.step=(dt,want,target)=>{
  s.speed+=(want-s.speed)*(1-Math.exp(-12*dt));s.target=target;
  const d=wrap(target-s.yaw);s.yaw+=d*(1-Math.exp(-dt*10*f.yawScale));
  s.phase+=s.speed*dt/(1.1*.82)*Math.PI*2;
  const before=f.move;D.stepDribbleFeel(f,dt,s.speed,s.yaw,target,s.phase,reduced);if(f.move!==before)s.events.push({t:s.t,from:before,to:f.move});
  s.t+=dt;s.frames++;
  // Ball in the mover's own frame (it travels with the body): no jump between frames.
  const x=Math.sin(f.ballYaw)*f.ballDist+Math.cos(f.ballYaw)*f.ballSide,z=Math.cos(f.ballYaw)*f.ballDist-Math.sin(f.ballYaw)*f.ballSide;
  if(s.prevX!==null)s.maxStep=Math.max(s.maxStep,Math.hypot(x-s.prevX,z-s.prevZ));s.prevX=x;s.prevZ=z;
  s.minDist=Math.min(s.minDist,Math.hypot(x,z));s.maxDist=Math.max(s.maxDist,Math.hypot(x,z));
 };
 return s;
}
const run=(s,seconds,speed,target,hz=60,each)=>{for(let i=0;i<seconds*hz;i++){s.step(1/hz,speed,target);each?.(s);}};

// 1. Sole stop: run, then let go of the stick.
for(const reduced of [false,true]){
 const s=mover(reduced);run(s,2,3.2,0);assert.equal(s.f.move,MOVE_ROLL);
 let maxW=0,pressed=0,startT=-1,endT=-1,heldLift=0;
 run(s,2,0,0,60,m=>{if(m.f.move===MOVE_STOP&&startT<0)startT=m.t;if(startT>=0&&endT<0&&m.f.move===MOVE_ROLL)endT=m.t;maxW=Math.max(maxW,m.f.footW);if(m.f.press>0)pressed++;if(m.f.move===MOVE_STOP&&m.f.footW>.99)heldLift=m.f.footLift;});
 assert(startT>=0&&startT<2+.25,`stop starts promptly (${startT})`);
 const want=reduced?DRIBBLE.stopTimeReduced:DRIBBLE.stopTime;assert(Math.abs(endT-startT-want)<.04,`stop lasts ${want}s (${(endT-startT).toFixed(3)})`);
 assert(maxW>.99,'the sole lands fully on the ball');assert(pressed>3,'the ball is pressed (small squash) under the sole');
 assert(heldLift>.24&&heldLift<.4,`the sole sits on the top of the ball (ankle lift ${heldLift})`);
 assert(Math.abs(s.f.ballDist-DRIBBLE.rest)<.02,'the ball rests in front of the boots');assert.equal(s.f.footW,0,'the boot is back to its stance');
 assert(s.maxStep<.06,`no teleport (max ${s.maxStep.toFixed(3)} m per frame)`);
 // Standing still: no second stop (cooldown + the peak is spent).
 const n=s.events.length;run(s,2,0,0);assert.equal(s.events.length,n,'a stop never retriggers while standing');
}

// 2. Drag-back: running, the stick swings round (> 90 deg).
for(const [reduced,flip] of [[false,Math.PI*.95],[false,-Math.PI*.7],[true,2.2]]){
 const s=mover(reduced);run(s,2,3,0);
 let seen=null,minDist=9,maxYawLag=0;
 run(s,1.2,3,flip,60,m=>{if(m.f.move===MOVE_TURN){if(!seen)seen={t:m.t,side:m.f.side,dir:m.f.dir};minDist=Math.min(minDist,m.f.ballDist);}});
 assert(seen,'a sharp turn is a drag-back');assert.equal(seen.dir,Math.sign(flip));assert.equal(seen.side,-Math.sign(flip),'the far-side boot drags, the other is the pivot');
 assert(minDist>=DRIBBLE.minDist-1e-9&&minDist<=DRIBBLE.drag+.05,`the sole pulls the ball in close (${minDist.toFixed(3)})`);
 assert(Math.abs(wrap(s.f.ballYaw-flip))<.15,'dribbling carries on in the new direction');assert.equal(s.f.move,MOVE_ROLL);
 assert(s.maxStep<.12,`the ball rolls round, never jumps (max ${s.maxStep.toFixed(3)} m per frame)`);
 assert(s.events.filter(e=>e.to===MOVE_TURN).length===1,'one turn, one drag-back');
}

// 3. Gentle turns: an inside / outside touch, no drag-back.
{const s=mover();run(s,2,3,0);let styles=new Set();for(let k=1;k<=4;k++)run(s,.9,3,k*.75,60,m=>{if(m.f.style!==TOUCH_LACES)styles.add(m.f.style);});
 assert(!s.events.some(e=>e.to===MOVE_TURN),'a curve is not a drag-back');assert(styles.size>=1,'a curve uses inside / outside touches');}

// 4. Cooldown: a stick flicking back and forth cannot fire a turn every frame.
{const s=mover();run(s,2,3,0);let k=0;run(s,3,3,0,60,()=>{});for(let i=0;i<180;i++){s.step(1/60,3,(i%2)?Math.PI*.9:0);}
 const turns=s.events.filter(e=>e.to===MOVE_TURN).length;assert(turns>=1&&turns<=3,`turns are spaced by their length + cooldown (${turns} in 3 s)`);}

// 5. Rhythm: walking = a touch every step, feet alternating, ball close; running = every third step, bigger push.
for(const [speed,per] of [[1,1],[4,3]]){
 const s=mover();const touches=[];let last=null;
 run(s,4,speed,0,60,m=>{if(m.f.touchStep!==last){last=m.f.touchStep;touches.push({step:m.f.touchStep,side:m.f.touchSide,push:m.f.push});}});
 const steady=touches.slice(3);assert(steady.length>3,'touches happen');
 for(let i=1;i<steady.length;i++){assert.equal(steady[i].step-steady[i-1].step,per,`a touch every ${per} step(s) at ${speed} m/s`);assert.equal(steady[i].side,-steady[i-1].side,'the touching foot alternates');}
 assert(s.minDist>=DRIBBLE.rest-1e-9,'rolling never brings the ball into the boots');
 if(speed===1)assert(s.maxDist<DRIBBLE.contact+.06,'walking keeps the ball close');else assert(s.maxDist>DRIBBLE.contact+.2&&s.maxDist<=DRIBBLE.maxDist,'running pushes it ahead');
}

// 6. dt 0 holds everything (a paused frame).
{const s=mover();run(s,1,3,0);const snap=JSON.stringify(s.f);D.stepDribbleFeel(s.f,0,0,2,2,s.phase,false);assert.equal(JSON.stringify(s.f),snap,'a paused frame changes nothing');}

// 7. No allocation per step (heap sampling over 20 000 steps with stops and turns).
{const insp=require('node:inspector'),ses=new insp.Session();ses.connect();const f=D.createDribbleFeel();let sp=0,yaw=0,ph=0,t=0;
 const tick=()=>{t+=1/60;const want=(t%3)<2?3:0,target=(t%6)<3?0:3;sp+=(want-sp)*.18;yaw+=wrap(target-yaw)*.15*f.yawScale;ph+=sp/60/.9*Math.PI*2;D.stepDribbleFeel(f,1/60,sp,yaw,target,ph,false);};
 for(let i=0;i<20000;i++)tick();
 let bytes=-1;ses.post('HeapProfiler.startSampling',{samplingInterval:512,includeObjectsCollectedByMinorGC:true,includeObjectsCollectedByMajorGC:true},()=>{for(let i=0;i<20000;i++)tick();ses.post('HeapProfiler.stopSampling',(e,r)=>{
  // only samples attributed to the dribbleStop module
  const walk=(n,acc)=>{if(/dribbleStop|stepDribbleFeel|stepStop|stepTurn/.test(n.callFrame.functionName))acc.v+=n.selfSize;for(const c of n.children)walk(c,acc);return acc;};
  bytes=walk(r.profile.head,{v:0}).v/20000;});});
 assert(bytes>=0&&bytes<4,`stepDribbleFeel allocates nothing per frame (${bytes} B)`);}

// 8. Rig wiring: the sole lands on the ball top, the ball never clips into a leg, the lesson lane is untouched, rig stays optimisable.
{const {createPlayer}=load(path.join(ROOT,'lib/graphics/player.ts'));
 const rig=createPlayer('dribble-stop','home');rig.setDribbleFeel(true);const ball=new T.Vector3(),ankle=new T.Vector3(),lane=new T.Vector3();
 let x=0,z=0,t=0,minSole=9,minLeg=9,stopSeen=false,turnSeen=false,heading=0,maxBallStep=0,prev=null;
 const frame=(speed,h)=>{t+=1/60;heading=h;x+=Math.sin(h)*speed/60;z+=Math.cos(h)*speed/60;rig.update(x,z,1/60,t,false,{dribbling:true,facing:speed>.05?h:undefined});rig.dribbleContact(ball);
  if(prev)maxBallStep=Math.max(maxBallStep,Math.hypot(ball.x-prev.x-Math.sin(h)*speed/60,ball.z-prev.z-Math.cos(h)*speed/60));prev=prev??new T.Vector3();prev.copy(ball);
  rig.root.updateWorldMatrix(true,true);
  for(const name of ['left-ankle','right-ankle']){const a=rig.root.getObjectByName(name);a.getWorldPosition(ankle);const d=ankle.distanceTo(ball);
   // While a sole is on the ball the ankle sits just above its top; otherwise no ankle is inside the ball.
   if(rig.dribblePress>.3)minSole=Math.min(minSole,d);minLeg=Math.min(minLeg,d);}
 };
 for(let i=0;i<120;i++)frame(3,0);
 for(let i=0;i<90;i++){frame(0,0);if(rig.dribblePress>0)stopSeen=true;}
 for(let i=0;i<60;i++)frame(2.5,0);
 for(let i=0;i<60;i++){frame(2.5,Math.PI);if(rig.dribblePress>0)turnSeen=true;}
 for(let i=0;i<60;i++)frame(2.5,Math.PI);
 assert(stopSeen&&turnSeen,'the rig plays a sole stop and a drag-back');
 assert(minSole<.34,`the sole is on the ball (ankle ${minSole.toFixed(3)} m from its centre)`);
 assert(minLeg>.17,`no ankle inside the ball (${minLeg.toFixed(3)} m)`);
 assert(maxBallStep<.12,`the rig's ball never jumps (${maxBallStep.toFixed(3)} m per frame)`);
 // Lessons: ballContact while dribbling is the quiet fixed lane, feel or not.
 rig.ballContact(1,lane);const scale=Math.abs(rig.root.scale.x),y=rig.root.rotation.y;
 const ahead=(lane.x-rig.root.position.x)*Math.sin(y)+(lane.z-rig.root.position.z)*Math.cos(y);assert(ahead>=.6*scale-1e-6&&ahead<=.63*scale,'lessons keep the authored lane');
 rig.setDribbleFeel(false);rig.update(x,z+.05,1/60,t+1/60,false,{dribbling:true,facing:Math.PI});rig.dribbleContact(ball);
 const off=(ball.x-rig.root.position.x)*Math.sin(rig.root.rotation.y)+(ball.z-rig.root.position.z)*Math.cos(rig.root.rotation.y);assert(off>=.6*scale-1e-6&&off<=.63*scale,'feel off = the old lane');
 rig.dispose();}

// The rig with the feel on still reaches V8's optimising tier and allocates little (as tests/rig-optimizable.cjs).
{const probe=`
const fs=require('fs'),ts=require('typescript'),path=require('path'),T=require('three');const ROOT=${JSON.stringify(ROOT)};const loaded=new Map();
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 new Function('module','exports','require',code)(m,m.exports,n=>{if(n==='three')return T;if(n.startsWith('.')){const base=path.resolve(path.dirname(file),n);for(const ext of ['.ts','.tsx','/index.ts',''])if(fs.existsSync(base+ext)&&fs.statSync(base+ext).isFile())return load(base+ext);}return require(n);});
 loaded.set(file,m.exports);return m.exports;}
const {createPlayer}=load(path.join(ROOT,'lib/graphics/player.ts'));
const rig=createPlayer('npc-3','neutral',true,true);rig.setDribbleFeel(true);const motion={travelMode:'walk',facing:0,dribbling:true};let t=0,x=0,z=0;
const step=()=>{t+=1/60;const sp=(t%3)<2?3:0,h=(t%6)<3?0:3;motion.facing=h;x+=Math.sin(h)*sp/60;z+=Math.cos(h)*sp/60;rig.update(x,z,1/60,t,false,motion);};
const circle=()=>{t+=1/60;motion.facing=undefined;rig.update(Math.sin(t)*3,Math.cos(t)*3,1/60,t,false,motion);};
for(let i=0;i<30000;i++)circle();
const status=%GetOptimizationStatus(rig.update);// (a stop-start loop never reaches the optimised tier, feel or not: measured the same before this change)
const insp=require('inspector'),s=new insp.Session();s.connect();
s.post('HeapProfiler.startSampling',{samplingInterval:1024,includeObjectsCollectedByMinorGC:true,includeObjectsCollectedByMajorGC:true},()=>{
 const N=4000;for(let i=0;i<N;i++)circle();
 s.post('HeapProfiler.stopSampling',(e,r)=>{const bytes=r.profile.samples.reduce((a,x)=>a+x.size,0)/N;console.log(JSON.stringify({status,bytes}));});
});`;
 const r=spawnSync(process.execPath,['--allow-natives-syntax','-e',probe],{cwd:ROOT,encoding:'utf8',timeout:120000,env:{...process.env,NODE_PATH:path.join(ROOT,'node_modules')}});
 assert.equal(r.status,0,r.stderr);const {status,bytes}=JSON.parse((r.stdout||'').trim().split('\n').pop());
 assert(status&(1<<4),`rig.update with the dribble feel stays optimised (${status.toString(2)})`);assert(bytes<12000,`rig.update with the feel allocates ${bytes.toFixed(0)} B per call`);
 console.log(`DRIBBLE_STOP_PASS rig ${bytes.toFixed(0)} B/update`);}
