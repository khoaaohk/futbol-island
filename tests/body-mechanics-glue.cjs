// Glue lane (docs/body-mechanics/BODY_MECHANICS.md): fieldRuntime assigns role profiles once per
// live rig and maps the sim's brake/backpedal/plant/facing/stance into each frame's PlayerMotion.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three'),cache=new Map();
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{})});
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,window:{matchMedia:()=>({matches:false}),innerHeight:800,addEventListener(){},removeEventListener(){}},document:{createElement:()=>({getContext:()=>ctx})},localStorage:{getItem:()=>null,setItem(){}},require:id=>id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}

// Spy on every rig the runtime creates: count setProfile calls per rig.
const playerModule=load('lib/graphics/player.ts'),{profileFor,ROLE_PROFILES}=playerModule,realCreate=playerModule.createPlayer,calls=new Map();
playerModule.createPlayer=(...args)=>{const rig=realCreate(...args),set=rig.setProfile;calls.set(rig,[]);rig.setProfile=p=>{calls.get(rig).push({...p});return set(p);};return rig;};
const {createFieldRuntime,assignRigProfile,profileSeed}=load('lib/town/fieldRuntime.ts'),{ROLE_MOVEMENT}=load('lib/town/match/matchSim.ts');

const scene=new T.Scene(),runtime=createFieldRuntime(scene),camera=new T.PerspectiveCamera(60,1,.1,500),e=runtime.entries.find(e=>e.venue.id==='11v11'),v=e.venue;
camera.position.set(v.x,110,v.z+40);camera.lookAt(v.x,0,v.z);camera.updateMatrixWorld();
for(let i=0;i<150;i++)runtime.update(1/30,i/30,camera,null,true,'11v11');
assert(e.rigs.size>=20,'live 11v11 rigs were created');
const roles=new Set();
for(const [id,rig] of e.rigs){
  const role=e.sim.players[id].role,log=calls.get(rig);roles.add(role);
  assert.equal(log.length,1,`${id}: setProfile runs exactly once across 150 frames`);
  const expected={...profileFor(role,profileSeed(v.id,id))};
  assert.deepEqual(log[0],expected,`${id}: receives the ${role} profile with its stable seed`);
  assert.deepEqual({...rig.profile},expected);
  assert(Math.abs(rig.profileScale-expected.height)<1e-12,'height applies through the rig root scale');
}
assert(['gk','def','mid','fwd'].every(r=>roles.has(r)),'every role is present in 11v11');
assert.equal(profileSeed('11v11','g1'),profileSeed('11v11','g1'),'seed is stable');
assert.notEqual(profileSeed('11v11','g1'),profileSeed('7v7','g1'),'seed differs per venue/player');
// Forwards read lighter/longer-striding than defenders even with the ±6 % variance.
const byRole=r=>[...e.rigs].filter(([id])=>e.sim.players[id].role===r).map(([,rig])=>rig.profile);
assert(Math.min(...byRole('fwd').map(p=>p.stride))>Math.max(...byRole('def').map(p=>p.stride)),'forward stride > defender stride');
assert(Math.max(...byRole('fwd').map(p=>p.weight))<Math.min(...byRole('def').map(p=>p.weight)),'defenders carry more weight');

// Teaching keeps `mid`; assignment is idempotent and never re-applies per frame.
const lessonRig=playerModule.createPlayer('L1','home',false);
assert.equal(assignRigProfile(lessonRig,'7v7','L1','mid'),true);
for(let i=0;i<30;i++)assert.equal(assignRigProfile(lessonRig,'7v7','L1','mid'),false);
assert.equal(calls.get(lessonRig).length,1);
assert.deepEqual({...lessonRig.profile},{...profileFor('mid',profileSeed('7v7','L1'))});
lessonRig.dispose();

// Freeze the match (dt 0, inactive) and drive the sim outputs by hand.
const freeze=()=>{for(const rig of e.rigs.values())delete rig.root.userData.brakeEstimate;e.sim.recv.t=0;e.sim.recv.id=null;e.sim.ball.owner=null;e.sim.ball.target=null;e.sim.ball.intBy=null;e.sim.ball.height=0;for(const p of Object.values(e.sim.players)){p.kick=0;p.brake=0;p.backpedal=0;p.plant=0;p.faceX=0;p.faceY=0;}};
const frame=()=>runtime.update(0,10,camera,null,false,'11v11');
const ids=Object.keys(e.sim.players),pick=(role,team)=>ids.find(id=>e.sim.players[id].role===role&&(!team||e.sim.players[id].team===team));
const motionOf=id=>e.liveFrame.rows.get(id).motion;

// Motion fields map straight through, and backpedalling faces the carrier, not the velocity.
freeze();const defId=pick('def'),def=e.sim.players[defId];
e.sim.ball.x=def.x+60;e.sim.ball.y=def.y;
def.vx=0;def.vy=50;def.brake=.7;def.backpedal=1;def.plant=.5;def.faceX=1;def.faceY=0;
frame();let m=motionOf(defId);
assert.equal(m.brake,.7);assert.equal(m.backpedal,1);assert.equal(m.plant,.5);
assert(Math.abs(m.facing-Math.atan2(v.width/250,0))<1e-9,'backpedal faces faceX/faceY (the carrier)');
assert(Math.abs(m.facing-Math.atan2(0,50*v.length/380))>1,'not the travel direction');
// Without backpedal the facing is no longer forced toward faceX/faceY.
def.backpedal=0;def.faceX=0;frame();m=motionOf(defId);
assert.equal(m.backpedal,0);assert.equal(m.brake,.7);
assert.notEqual(m.facing,Math.atan2(v.width/250,0));

// Role speed scales runIntensity: same velocity, forward reads faster than defender.
freeze();const fwdId=pick('fwd'),fwd=e.sim.players[fwdId];
for(const p of [fwd,def]){p.vx=60;p.vy=0;}
e.sim.ball.x=0;e.sim.ball.y=0;frame();
const fi=motionOf(fwdId).runIntensity,di=motionOf(defId).runIntensity;
assert(fi>di,'forward runIntensity > defender at equal velocity');
const base=T.MathUtils.smoothstep(60/84,.25,1);assert(Math.abs(fi-base**(1/ROLE_MOVEMENT.fwd.speed))<1e-9&&Math.abs(di-base**(1/ROLE_MOVEMENT.def.speed))<1e-9,'scaled by ROLE_MOVEMENT speed');
for(const p of [fwd,def]){p.vx=84;}frame();assert.equal(motionOf(fwdId).runIntensity,1);assert.equal(motionOf(defId).runIntensity,1,'full tactical pace is a sprint for every role');
assert(fi<=1&&di>0);

// Ready stance: keeper and defender still near a live ball; midfielders never; far ball → none.
freeze();const gkId=pick('gk'),gk=e.sim.players[gkId],midId=pick('mid'),mid=e.sim.players[midId];
for(const p of [gk,def,mid]){p.vx=p.vy=0;}
e.sim.ball.x=gk.x;e.sim.ball.y=gk.y+(gk.y<200?20:-20);frame();
assert.equal(motionOf(gkId).stance,'ready','still keeper, loose ball nearby');
e.sim.ball.x=def.x+8;e.sim.ball.y=def.y;frame();
assert.equal(motionOf(defId).stance,'ready','still defender, loose ball nearby');
e.sim.ball.x=mid.x+8;e.sim.ball.y=mid.y;frame();
assert.equal(motionOf(midId).stance,undefined,'midfielders do not take the ready stance');
e.sim.ball.x=def.x>135?def.x-200:def.x+200;e.sim.ball.y=def.y<200?def.y+300:def.y-300;frame();
assert.equal(motionOf(defId).stance,undefined,'far ball: no ready stance');
// Own team in possession → the ball is not a threat: no ready stance.
const mate=ids.find(id=>id!==defId&&e.sim.players[id].team===def.team&&!e.sim.players[id].isGK);
e.sim.ball.owner=mate;e.sim.ball.x=def.x+6;e.sim.ball.y=def.y;frame();
assert.equal(motionOf(defId).stance,undefined,'teammate carrying: no ready stance');
// Running at pace (not jockeying) drops the stance.
e.sim.ball.owner=null;def.vx=80;frame();
assert.equal(motionOf(defId).stance,undefined,'running defender is not in a still ready stance');

// Never a deep crouch at pace: jockey fades out by ~.6 pace and the ready stance needs < READY_MAX_PACE.
{const {READY_MAX_PACE}=load('lib/town/fieldRuntime.ts');freeze();
 const carrierId=ids.find(id=>e.sim.players[id].team!==def.team&&!e.sim.players[id].isGK),carrier=e.sim.players[carrierId];
 e.sim.ball.owner=carrierId;e.sim.ball.x=carrier.x=def.x+4;e.sim.ball.y=carrier.y=def.y;
 const at=pace=>{def.vx=pace*84;def.vy=0;frame();return motionOf(defId);};
 let mm=at(.1);assert(mm.jockey>.3,'slow defender near the carrier jockeys');assert.equal(mm.stance,'ready','…in the ready stance');
 mm=at(.3);assert(mm.jockey>.3&&mm.stance==='ready','a slow containing shuffle keeps the stance');
 for(const pace of [READY_MAX_PACE+.01,.45,.55,.6,.7,.8,.95,1])assert.equal(at(pace).stance,undefined,`pace ${pace}: no ready stance at speed`);
 for(const pace of [.6,.7,.9,1])assert.equal(at(pace).jockey,0,`pace ${pace}: jockey is gone`);
 let last=Infinity;for(let pace=.3;pace<=.62;pace+=.02){const j=at(pace).jockey;assert(j<=last+1e-12,'jockey fades monotonically with pace');last=j;}
 e.sim.ball.owner=null;}

// Brake: a real deceleration reads as a strong brake even when the sim's per-step value is weak;
// cruising, gentle easing and sampling gaps never fake one.
{freeze();const sim=e.sim,t0=sim.stats.time,step=1/60*.32;
 const sample=(speed,dtSim,simBrake=0)=>{sim.stats.time+=dtSim;def.vx=speed;def.vy=0;def.brake=simBrake;frame();return motionOf(defId).brake;};
 e.sim.ball.x=def.x+200;e.sim.ball.y=def.y;
 sample(60,step);assert.equal(sample(60,step),0,'cruising: no brake');
 let b=sample(56,step,.1);assert(b>.9,`a hard stop (~750 u/s²) brakes hard although the sim read .1 (got ${b.toFixed(2)})`);
 b=sample(55.6,step,0);assert(b>.75,'the brake holds through a one-step dip in the sim read');
 for(let i=0;i<12;i++)b=sample(55.6,step);assert.equal(b,0,'…and releases within ~.15 s of the stop ending');
 for(let i=0;i<8;i++)b=Math.max(b,sample(55.6-.3*(i+1),step));assert.equal(b,0,'gentle easing (~55 u/s²) is not a brake');
 sample(60,step);b=sample(20,1);assert.equal(b,0,'a sampling gap (offscreen / reset) is not a stop');
 sample(3,step);b=sample(1,step);assert.equal(b,0,'no brake once the player is at rest');
 def.brake=.8;frame();assert.equal(motionOf(defId).brake,.8,'the sim read still passes through (max, not replace)');
 sim.stats.time=t0;}

// Frames never re-apply profiles.
for(const [,rig] of e.rigs)assert.equal(calls.get(rig).length,1);
assert.deepEqual(Object.keys(ROLE_PROFILES).sort(),['def','fwd','gk','mid','npc','you']);
assert.deepEqual({...profileFor('you',0)},{...ROLE_PROFILES.you},'the walking character profile is identity');
runtime.dispose();
console.log('PASS body-mechanics glue: one role profile per live rig, brake/backpedal/plant mapping, carrier facing, role-scaled run, ready stance (never at pace), jockey fade and decel brake estimate');
