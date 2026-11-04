// Live-match body motion (lib/town/match/matchMotion.ts, Nov 4 2026): the speed-capped turn, stride from speed, the receiver's
// control state machine (approach → cushion → sole → carry), the sole control in dribbleStop.ts, and the strike timing (the body
// faces the target by the contact frame). Then the rig wiring (player.ts): the cap only applies when the host asks for it.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),path=require('node:path'),T=require('three');
const ROOT=path.resolve(__dirname,'..'),loaded=new Map();
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 new Function('module','exports','require',code)(m,m.exports,n=>{if(n==='three')return T;if(n.startsWith('.')||n.startsWith('@/')){const base=n.startsWith('@/')?path.join(ROOT,n.slice(2)):path.resolve(path.dirname(file),n);for(const ext of ['.ts','.tsx','/index.ts',''])if(fs.existsSync(base+ext)&&fs.statSync(base+ext).isFile())return load(base+ext);}return require(n);});
 loaded.set(file,m.exports);return m.exports;}
const M=load(path.join(ROOT,'lib/town/match/matchMotion.ts')),D=load(path.join(ROOT,'lib/town/dribbleStop.ts'));
const {MOTION}=M,wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const smooth=v=>{const x=Math.max(0,Math.min(1,v));return x*x*(3-2*x);};

// ---- Turn-rate limiter ----
assert(M.maxTurnRate(0)>M.maxTurnRate(2)&&M.maxTurnRate(2)>M.maxTurnRate(5),'a faster runner turns slower');
assert(Math.abs(M.maxTurnRate(0)-MOTION.turnSlow)<1e-9&&Math.abs(M.maxTurnRate(8)-MOTION.turnSprint)<1e-9);
assert(M.maxTurnRate(5,1,true)>M.maxTurnRate(0),'a strike / first touch may turn fastest');
assert(M.maxTurnRate(3,1.1)>M.maxTurnRate(3,.9),'agility scales the rate');
function turn(from,to,speed,hz=60,action=false,smoothing=10,tol=.01){
 const s=M.createYawState(from),dt=1/hz,max=M.maxTurnRate(speed,1,action),acc=action?MOTION.turnAccelAction:MOTION.turnAccel;let t=0,maxRate=0,firstRate=null,over=0;
 for(let i=0;i<hz*4;i++){const before=s.yaw;M.stepYaw(s,to,dt,smoothing,max,acc);t+=dt;const r=Math.abs(s.yaw-before)/dt;maxRate=Math.max(maxRate,r);if(firstRate===null)firstRate=r;
  over=Math.max(over,-(wrap(to-s.yaw))*Math.sign(wrap(to-from)));if(Math.abs(wrap(to-s.yaw))<tol)break;}
 return {t,maxRate,firstRate,over,yaw:s.yaw,max};
}
for(const hz of [30,60,120])for(const speed of [0,1.5,3,6]){
 const r=turn(0,Math.PI*.95,speed,hz);
 assert(r.maxRate<=r.max+1e-6,`rate cap @${speed}m/s ${hz}Hz`);
 assert(r.firstRate<=MOTION.turnAccel/hz+1e-6,'slow-in: the first frame turns at most accel × dt');
 assert(r.over<1e-6,'never overshoots the target');
 assert(Math.abs(wrap(Math.PI*.95-r.yaw))<.01,'arrives');
 assert(r.t>=Math.PI*.95/r.max-1e-6,'a big turn takes at least angle / max rate');
}
assert(turn(0,Math.PI*.9,6,60,false,10,.3).t>turn(0,Math.PI*.9,.5,60,false,10,.3).t+.1,'a sprinter turns in a wider arc (slower) than a walker');
// A small correction is still the familiar quick ease (the cap does not make small adjustments sluggish).
assert(turn(0,.3,1).t<.5,'small turn settles quickly');
// dt 0 holds; a reversal mid-turn keeps a little momentum but still arrives.
{const s=M.createYawState(0);M.stepYaw(s,1,0,10,10,80);assert.equal(s.yaw,0);
 for(let i=0;i<20;i++)M.stepYaw(s,2,1/60,10,8,80);const mid=s.yaw;for(let i=0;i<120;i++)M.stepYaw(s,-1,1/60,10,8,80);assert(Math.abs(s.yaw+1)<.01&&mid>0,'reversal arrives');}

// ---- Stride from speed (the rig's gait formula) ----
const runFor=speed=>smooth((speed-1.5)/4);
let lastStride=0,lastCadence=0;
for(const speed of [.8,1.5,2.5,3.5,4.5,6]){const stride=M.gaitStride(runFor(speed),0,false,0,0,1,0,0),cad=M.gaitCadence(speed,stride);
 assert(stride>=lastStride-1e-9,'stride length grows with speed');assert(cad>lastCadence,'cadence grows with speed');lastStride=stride;lastCadence=cad;}
assert(M.gaitStride(1,0,false,0,0,1,0,0)/M.gaitStride(0,0,false,0,0,1,0,0)>1.6,'a sprint stride is much longer than a walk');
assert(M.gaitStride(.5,0,true,0,0,1,0,0)<M.gaitStride(.5,0,false,0,0,1,0,0),'shorter strides with the ball');
assert(M.gaitStride(.5,0,false,1,0,1,0,0)<M.gaitStride(.5,0,false,0,0,1,0,0),'short drive steps while accelerating');
assert(M.gaitStride(.5,.8,false,0,0,1,0,0)<M.gaitStride(.5,0,false,0,0,1,0,0),'compact (defending) steps');
assert(M.gaitCadence(3,0)===0);

// ---- Control state machine ----
const {CONTROL_IDLE,CONTROL_APPROACH,CONTROL_CUSHION,CONTROL_SOLE,CONTROL_CARRY}=M;
function reception({speed=.8,cushionFrames=20,strikeAt=-1,lose=-1,foot=-1}={}){
 const s=M.createControlState(),out=[];let frame=0;
 const step=i=>{const r=M.stepControl(s,1/60,{approaching:true,cushion:false,owner:false,striking:false,speed:2,foot:1,...i});out.push({r,phase:s.phase});frame++;return r;};
 for(let i=0;i<10;i++)step({});assert.equal(s.phase,CONTROL_APPROACH);
 for(let i=0;i<cushionFrames;i++)step({approaching:false,cushion:true,owner:true,foot,speed,striking:frame===strikeAt});
 for(let i=0;i<60;i++)step({approaching:false,owner:lose<0||i<lose,speed,foot:1,striking:strikeAt>=0&&frame>=strikeAt});
 return {s,out};
}
{const {out}=reception();const firing=out.filter(o=>o.r!==0);
 assert(firing.length>0&&firing.every(o=>o.r===-1),'a slow receiver steps on the ball with the receiving foot');
 const first=out.findIndex(o=>o.r!==0);assert.equal(out[first-1].phase,CONTROL_CUSHION,'the sole comes straight after the cushion');
 assert(Math.abs(firing.length/60-MOTION.soleHold)<.05,'sole phase lasts soleHold');assert.equal(out.at(-1).phase,CONTROL_CARRY,'then carries on');}
{const {out}=reception({speed:MOTION.soleMaxSpeed+.4});assert(out.every(o=>o.r===0),'a fast receiver takes it in stride (no stop)');assert.equal(out.at(-1).phase,CONTROL_CARRY);}
{const {out}=reception({strikeAt:25});assert(out.every(o=>o.r===0),'a first-time pass never puts a foot on the ball');}
{const {out}=reception({lose:5});assert.equal(out.at(-1).phase,CONTROL_IDLE,'losing the ball ends control');}
{const s=M.createControlState();for(let i=0;i<30;i++)M.stepControl(s,1/60,{approaching:false,cushion:false,owner:true,striking:false,speed:.5,foot:1});assert(s.phase===CONTROL_IDLE,'dribbling without a reception never fires');}
{const s=M.createControlState();M.stepControl(s,1/60,{approaching:false,cushion:true,owner:true,striking:false,speed:.5,foot:1});const r=M.stepControl(s,0,{approaching:false,cushion:false,owner:true,striking:false,speed:.5,foot:1});assert.equal(r,1,'paused frame: still decides');assert.equal(s.phase,CONTROL_SOLE);}

// ---- Sole control footwork (dribbleStop.ts) ----
{const f=D.createDribbleFeel();D.resetDribbleFeel(f,0,0);D.startSoleControl(f,-1,false);assert.equal(f.move,D.MOVE_STOP);assert(f.ctrl&&f.side===-1);
 let landed=false,pressed=false,t=0;const dt=1/60;
 while(f.move===D.MOVE_STOP&&t<2){D.stepDribbleFeel(f,dt,.9,0,0,t*4,false);t+=dt;if(f.footW>.95&&Math.abs(f.footLift-D.DRIBBLE.soleLift)<.03)landed=true;if(f.press>.5)pressed=true;}
 assert(landed&&pressed,'the sole lands on top of the ball and presses');assert(Math.abs(t-D.DRIBBLE.controlTime)<.05,'control hold length');assert(f.foot===0&&f.move===D.MOVE_ROLL);
 // At a brisk walk (1.5 m/s) the hold survives; a plain stop would have skipped it.
 const g=D.createDribbleFeel();D.resetDribbleFeel(g,0,0);D.startSoleControl(g,1,false);for(let i=0;i<12;i++)D.stepDribbleFeel(g,dt,1.5,0,0,i*.1,false);assert(g.t<.62*g.dur-.05,'brisk walk keeps the hold');
 const h=D.createDribbleFeel();D.resetDribbleFeel(h,0,0);D.startSoleControl(h,1,false);D.stepDribbleFeel(h,dt,2.4,0,0,0,false);assert(h.t>=.62*h.dur,'a run lifts the boot off at once');
 const r=D.createDribbleFeel();D.resetDribbleFeel(r,0,0);D.startSoleControl(r,1,true);assert.equal(r.dur,D.DRIBBLE.controlTimeReduced,'reduced motion: shorter');}

// ---- Strike timing: the wind-up turn reaches the target by the contact frame ----
const C=load(path.join(ROOT,'lib/town/match/choreo.ts')),S=load(path.join(ROOT,'lib/graphics/strikeMotion.ts'));
for(const angle of [.3,1,Math.PI/2,2.2,Math.PI*.98])for(const hz of [30,60]){
 const seconds=C.windupSeconds(angle),share=C.windupTurnShare(angle),dt=1/hz;
 const run=(rate,accel)=>{const s=M.createYawState(0);let atSwing=null;for(let t=0;t<seconds-1e-9;t+=dt){M.stepYaw(s,angle,dt,10,rate,accel);if(atSwing===null&&t+dt>=seconds*share)atSwing=Math.abs(wrap(angle-s.yaw));}return {atSwing,atContact:Math.abs(wrap(angle-s.yaw))};};
 const capped=run(M.maxTurnRate(2,1,true),MOTION.turnAccelAction),plain=run(1e9,1e9);
 assert(capped.atContact<.06,`faces the target at contact (${angle.toFixed(2)} rad, ${hz} Hz)`);
assert(capped.atSwing<=plain.atSwing+.08,'the action turn cap leaves the wind-up as square as before when the leg swings');
}
assert(S.STRIKE_CONTACT>.3&&S.STRIKE_CONTACT<.4,'contact frame (ball release) sits at the end of the backswing');
{const out={};const pass=S.strikePose(S.STRIKE_CONTACT,'pass',.45,{...out}),shot=S.strikePose(S.STRIKE_CONTACT,'shot',.85,{});assert(pass&&shot,'pass and shot poses exist');}

// ---- Receive settle (matchSim hook, off by default) ----
assert(Math.abs(M.settlePace(250,1)-MOTION.settleSpeed)<1e-12&&M.settlePace(0,1)===0,'settle pace converts m/s to sim units');
{const {MatchSim}=load(path.join(ROOT,'lib/town/match/matchSim.ts'));
 const run=settle=>{const sim=new MatchSim(271,'7v7');sim.windupScale=.32;if(settle)sim.receiveSettle=M.settlePace(34.26,.32);let settled=0,ends=[],prev=null,armed=0;
  for(let i=0;i<60*90;i++){sim.step(1/60*.32);if(sim.settleId){armed++;const p=sim.players[sim.settleId];if(sim.recv.id===sim.settleId&&sim.recv.t>0&&sim.recv.t<.02)ends.push(Math.hypot(p.vx,p.vy));}}
  return {armed,ends,cap:sim.receiveSettle};};
 const off=run(false),on=run(true);
 assert.equal(off.armed,0,'off by default: headless sims are unchanged');
 assert(on.ends.length>0,'some receivers arrive slowly and settle');
 assert(on.ends.every(v=>v<=on.cap*1.25),'a settling receiver is at walking pace when the cushion ends');}

// ---- Rig wiring ----
const {createPlayer}=load(path.join(ROOT,'lib/graphics/player.ts'));
function spin(motionExtra){const r=createPlayer('spin','home');let x=0;r.update(0,0,1/60,0,false,{facing:0,resumePose:true});
 let maxStep=0;for(let i=1;i<60;i++){x+=4/60;const before=r.root.rotation.y;r.update(0,x,1/60,i/60,false,{facing:Math.PI*.9,...motionExtra});maxStep=Math.max(maxStep,Math.abs(wrap(r.root.rotation.y-before)));}return {maxStep,yaw:r.root.rotation.y};}
const capped=spin({turnRateMax:M.maxTurnRate(4)}),free=spin({});
assert(capped.maxStep<=M.maxTurnRate(4)/60+1e-6,'rig respects the turn cap');assert(free.maxStep>capped.maxStep*1.5,'other hosts keep the plain ease');
assert(Math.abs(wrap(Math.PI*.9-capped.yaw))<.05,'capped rig still arrives');
{const r=createPlayer('reduced','home');r.update(0,0,1/60,0,false,{facing:0,resumePose:true});const b=r.root.rotation.y;r.update(0,0,1/60,1/60,true,{facing:Math.PI*.9,turnRateMax:1});assert(Math.abs(r.root.rotation.y-b)>1/60+1e-3,'reduced motion skips the cap (no long turns)');}
// Sole control: the rig steps on the ball after the first touch (press > 0); without the request a slow carry just rolls.
function control(sole){const r=createPlayer('ctrl','home');r.setDribbleFeel(true);let z=0,press=0;r.update(0,0,1/60,0,false,{facing:0,resumePose:true});
 for(let i=1;i<20;i++){z+=.8/60;r.update(0,z,1/60,i/60,false,{facing:0,dribbling:true,receive:1-i/20,receiveProgress:i/20,kickSide:1});}
 for(let i=20;i<70;i++){z+=.8/60;r.update(0,z,1/60,i/60,false,{facing:0,dribbling:true,soleControl:sole});press=Math.max(press,r.dribblePress);}return press;}
assert(control(1)>.5,'sole control presses the ball');assert.equal(control(0),0,'no request: no stop on a slow carry');
console.log('MATCH_MOTION_PASS');
