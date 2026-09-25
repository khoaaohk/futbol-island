const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm'),path=require('path');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set});return m.exports;}
const {createPlayer}=load('lib/graphics/player.ts'),T=require('three');
const pose=r=>{const out=[];r.root.traverse(n=>out.push(...n.position,...n.quaternion));return out;};
const same=(a,b)=>{assert.equal(a.length,b.length);a.forEach((v,i)=>assert(Math.abs(v-b[i])<1e-9,`pose component ${i}: ${v} != ${b[i]}`));};
// A quiz frame must not depend on prior walking, turning, or the render delta.
const a=createPlayer('seek','home'),b=createPlayer('seek','home');
for(let i=0;i<120;i++)a.update(i*.012,i*.025,1/60,i/60,false,{facing:i*.02});
const sample={facing:.7,receive:.65,kickSide:-1,lookX:4,lookZ:5,scanYaw:.2,samplePose:{speed:1.7,distance:2.3,heading:1.2}};
a.update(1,2,0,2,false,sample);b.update(1,2,1/30,2,false,sample);same(pose(a),pose(b));
const frozen=pose(a);for(let i=0;i<30;i++)a.update(1,2,0,2,false,sample);same(frozen,pose(a));a.dispose();b.dispose();
// Passing opens the boot; shots use a stronger torso and leg follow-through.
const kicks={};for(const kind of ['pass','shot','loft']){const r=createPlayer('strike','home');r.update(0,0,0,.5,false,{facing:0,kick:.55,kickSide:1,actionKind:kind});kicks[kind]={hip:r.root.getObjectByName('right-hip').rotation.toArray(),torso:r.root.getObjectByName('armor-torso').rotation.toArray()};r.dispose();}
assert(kicks.pass.hip[1]>kicks.shot.hip[1]+.1);assert(Math.abs(kicks.shot.torso[1])>Math.abs(kicks.pass.torso[1]));assert.notEqual(kicks.shot.hip[0],kicks.loft.hip[0]);
// Turning plants the inside foot while the other foot clears the surface.
const r=createPlayer('pivot','home');r.update(0,0,1/60,0,false,{facing:0});const ankle=r.root.getObjectByName('left-ankle'),start=ankle.getWorldPosition(new T.Vector3());let maxSlide=0,maxLift=0;
for(let i=1;i<=12;i++){r.update(0,0,1/60,i/60,false,{facing:.45});const p=ankle.getWorldPosition(new T.Vector3());maxSlide=Math.max(maxSlide,Math.hypot(p.x-start.x,p.z-start.z));maxLift=Math.max(maxLift,r.root.getObjectByName('right-ankle').getWorldPosition(new T.Vector3()).y-start.y);}
assert(maxSlide<.035,`support drift ${maxSlide}`);assert(maxLift>.015,'pivot foot clears ground');r.dispose();
// Defensive/keeper shapes remain distinct from idle and do not require extra meshes.
const keeper=createPlayer('keeper','home');keeper.update(0,0,0,0,false,{facing:0,keeper:1,keeperReach:.8});assert(keeper.root.getObjectByName('player-pelvis').position.y<.83);assert(keeper.root.getObjectByName('left-shoulder').rotation.x<-.9);keeper.dispose();
console.log('BODY_MECHANICS_PASS deterministic seek/pause, pass/shot/loft, support pivot, keeper; pivot slide',maxSlide);

// Soles stay level across wide stances, mirrored shuffles and weight-bearing kicks.
// Check the transformed boot axis, not the ankle's local Euler angles: parent roll matters.
{
 const {ROLE_PROFILES}=load('lib/graphics/player.ts');let contacts=0,maxRoll=0;
 for(const role of ['you','def','fwd','gk'])for(const direction of [-1,0,1]){
  const rig=createPlayer('sole-'+role,'home',false);rig.setProfile(ROLE_PROFILES[role]);rig.root.scale.multiplyScalar(1.12);
  for(let frame=0;frame<150;frame++){
   rig.update(direction*frame/30,0,1/60,frame/60,false,{facing:0,jockey:1,stance:'ready'});
   rig.root.updateMatrixWorld(true);
   if(frame<30)continue;
   for(const side of ['left','right']){
    const boot=rig.root.getObjectByName(side+'-ankle'),position=boot.getWorldPosition(new T.Vector3());
    if(position.y/rig.root.scale.y>.11)continue;
    const across=new T.Vector3(1,0,0).transformDirection(boot.matrixWorld);
    maxRoll=Math.max(maxRoll,Math.abs(across.y));contacts++;
    assert(Math.abs(across.y)<1e-8,`${role} shuffle ${direction}: support sole rolls sideways`);
   }
  }
  rig.dispose();
 }
 for(const side of [-1,1]){
  const rig=createPlayer('sole-kick','home',false);
  for(let frame=0;frame<120;frame++){
   rig.update(0,frame/20,1/60,frame/60,false,{facing:.35,kickSide:side,actionKind:'shot',kick:frame>30&&frame<90?(frame-30)/60:undefined});
   if(frame<=30||frame>=90)continue;
   rig.root.updateMatrixWorld(true);
   const boot=rig.root.getObjectByName((side===1?'left':'right')+'-ankle');
   const across=new T.Vector3(1,0,0).transformDirection(boot.matrixWorld);
   assert(Math.abs(across.y)<1e-8,'shot support sole stays level while pelvis rotates');
  }
  rig.dispose();
 }
 assert(contacts>500,'exercise actual near-ground contacts');
 console.log('SOLE_SUPPORT_PASS', {contacts,maxRoll});
}
