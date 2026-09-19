const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three');
function load(file){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,WeakMap,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
const {createPlayer}=load('lib/graphics/player.ts'),{createKnockoutGrounding}=load('lib/graphics/knockoutGrounding.ts'),{knockoutPose,HIT_RECOVERY,OUT_TELEPORT,OUT_ARRIVAL}=load('lib/games/knockoutAnimation.ts');
const ground=createKnockoutGrounding(),point=new T.Vector3();let samples=0;
for(const costume of ['none','arsenal','barcelona'])for(const character of ['male','female'])for(const merged of [true,false]){
 const rig=createPlayer('ground-test','home',merged);rig.setAppearance({costume,character,face:'light',body:'strong',clothing:'coast'});
 const parent=new T.Group();parent.position.set(66,10.23,151.75);parent.add(rig.root);
 for(const eliminated of [false,true])for(const reduced of [false,true]){
  ground(rig.root,false,10.23);
  for(let i=0;i<=96;i++){
   const age=i/96*(eliminated?OUT_TELEPORT+OUT_ARRIVAL:HIT_RECOVERY);
   const p={alive:!eliminated,hitFlash:eliminated?0:Math.max(0,HIT_RECOVERY-age),outAge:age};
   rig.update(0,0,1/60,age,reduced,{facing:age*3,kick:i<10?.7:0});
   rig.root.rotation.set(0,age*3,0);rig.root.scale.setScalar(1);
   const pose=knockoutPose(p,reduced);rig.root.rotation.z+=pose.roll;rig.root.rotation.y+=pose.turn;rig.root.position.y+=pose.lift;rig.root.scale.multiplyScalar(Math.max(.001,pose.scale));rig.root.scale.y*=1+pose.stretch*1.5;rig.root.scale.x*=1-pose.stretch*.65;
   ground(rig.root,true,10.23);rig.root.updateWorldMatrix(true,true);
   let minimum=Infinity;
   rig.root.traverseVisible(mesh=>{if(!(mesh instanceof T.Mesh))return;const positions=mesh.geometry.attributes.position;for(let k=0;k<positions.count;k++){point.fromBufferAttribute(positions,k).applyMatrix4(mesh.matrixWorld);minimum=Math.min(minimum,point.y);}});
   assert(minimum>=10.23-.00001,`${costume}/${character}/${merged} ${eliminated?'out':'hit'} ${age}: mesh penetrates roof (${minimum})`);
   if(age>.45&&age<1)assert(minimum<10.5,'prone body stays near roof rather than hovering high above it');
   samples++;
  }
 }
 rig.dispose();
}
// Sleeping game and standing/waiting rigs do no support traversal/matrix work.
const idle=new T.Group();idle.updateWorldMatrix=()=>{throw Error('idle support work');};idle.traverseVisible=()=>{throw Error('idle scan');};ground(idle,false,0);
console.log(`PASS ${samples} actual-vertex grounding samples: characters, costumes, merged/batched rigs, hit recovery, elimination, return and reduced motion; inactive fast path`);
