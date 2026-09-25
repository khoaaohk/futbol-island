const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),Math,console});return m.exports;}
const {createPlayer,ROLE_PROFILES,PLAYER_KICK_CONTACT}=load('lib/graphics/player.ts');
let worst=0,lowestVelocity=Infinity,cases=0;
for(const role of ['you','fwd','def','gk'])for(const kind of ['pass','shot','loft'])for(const side of [-1,1])for(const facing of [-2.8,0,1.2])for(const powered of [false,true]){
 if(powered&&kind!=='shot')continue;
 const r=createPlayer('contact','home',false);r.setProfile(ROLE_PROFILES[role]);r.root.scale.multiplyScalar(1.12);const scale=r.root.scale.x;
 const contact=phase=>{r.update(2,3,0,0,false,{facing,kick:phase,kickSide:side,actionKind:kind,powerKick:powered,shotPower:1,samplePose:{speed:0,distance:0,heading:facing}});return r.ballContact(side,new T.Vector3());};
 const before=contact(PLAYER_KICK_CONTACT-.0001),at=contact(PLAYER_KICK_CONTACT),after=contact(PLAYER_KICK_CONTACT+.0001);
 const wanted=new T.Vector3(2+scale*(side*.14*Math.cos(facing)+.65*Math.sin(facing)),scale*.19,3+scale*(.65*Math.cos(facing)-side*.14*Math.sin(facing)));
 const error=at.distanceTo(wanted),velocity=((after.x-before.x)*Math.sin(facing)+(after.z-before.z)*Math.cos(facing))/(.0002*scale);
 worst=Math.max(worst,error);lowestVelocity=Math.min(lowestVelocity,velocity);cases++;
 assert(error<.03,`${role} ${kind} ${side}: centre misses boot contact by ${error}`);
 assert(velocity>.5,`${role} ${kind}: boot continues through impact (${velocity})`);
 const follow=contact(.43);assert((follow.x-at.x)*Math.sin(facing)+(follow.z-at.z)*Math.cos(facing)>.025,'follow-through continues beyond impact');
 r.dispose();
}
// A changing foot request cannot swap legs in a committed live strike.
const rig=createPlayer('commit','home');rig.update(0,0,1/60,0,false,{facing:0});
for(let i=1;i<=30;i++)rig.update(0,0,1/60,i/60,false,{facing:0,kick:i/60,kickSide:i<10?-1:1,actionKind:'pass'});
const left=rig.root.worldToLocal(rig.root.getObjectByName('left-ankle').getWorldPosition(new T.Vector3())),right=rig.root.worldToLocal(rig.root.getObjectByName('right-ankle').getWorldPosition(new T.Vector3()));
assert(left.z>right.z+.2,'committed left kick stays left');rig.dispose();
console.log('STRIKE_CONTACT_PASS',{cases,worst,lowestVelocity});

// The live dribble can leave a longer/lateral contact than the neutral teaching pose.
for(const role of ['you','fwd','def','gk'])for(const kind of ['pass','shot','loft'])for(const side of [-1,1])for(const reach of [.55,.75,.92]){
 const r=createPlayer('reach','home');r.setProfile(ROLE_PROFILES[role]);
 r.update(0,0,0,0,false,{facing:0,kick:.36,kickSide:side,actionKind:kind,strikeX:side*.25,strikeZ:reach,samplePose:{speed:0,distance:0,heading:0}});
 const p=r.ballContact(side,new T.Vector3()).divideScalar(r.root.scale.x);
 assert(p.distanceTo(new T.Vector3(side*.25,.19,reach))<.03,`${role} ${kind}: reach ${reach} retains contact`);r.dispose();
}
console.log('STRIKE_REACH_PASS 72 lateral/extended contacts');

// Movement intent changes the preparation pose before root velocity turns.
function anticipation(withIntent){
 const r=createPlayer('anticipate','home'),poses=[];
 for(let i=0;i<90;i++){
  const t=i/60;r.update(0,t*3,1/60,t,false,{facing:0,runIntensity:.7,intentHeading:withIntent&&i>=60?Math.PI/2:0});
  if(i>=65&&i<72)poses.push(r.root.getObjectByName('player-pelvis').position.y);
 }
 r.dispose();return poses.reduce((a,b)=>a+b,0)/poses.length;
}
assert(anticipation(true)<anticipation(false)-.008,'body loads into known turn before velocity changes');
const retreat=createPlayer('retreat','home');let z=0;
for(let i=0;i<90;i++){z-=2/60;retreat.update(0,z,1/60,i/60,false,{facing:0,backpedal:1});}
retreat.update(0,z-2/60,1/60,1.5,false,{facing:Math.PI,backpedal:0,intentHeading:Math.PI});
const firstYaw=retreat.root.rotation.y;assert(Math.abs(firstYaw)<Math.PI*.5,'retreat-to-chase opens over several frames');
for(let i=1;i<60;i++){z-=2/60;retreat.update(0,z,1/60,1.5+i/60,false,{facing:Math.PI,backpedal:0,intentHeading:Math.PI});}
assert(Math.abs(Math.abs(retreat.root.rotation.y)-Math.PI)<.1,'opening completes into a forward chase');retreat.dispose();
console.log('ANTICIPATION_PASS turn preparation and retreat-to-chase');
