const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set});return m.exports;}
const {createPlayer,ROLE_PROFILES}=load('lib/graphics/player.ts');
const joint=(r,n)=>r.root.getObjectByName(n),world=(r,n)=>joint(r,n).getWorldPosition(new T.Vector3());
// Whole-body forward pitch: the pelvis carries part of the lean, the torso the rest.
const pitch=r=>joint(r,'player-pelvis').rotation.x+joint(r,'armor-torso').rotation.x;
const finite=r=>{r.root.updateMatrixWorld(true);r.root.traverse(o=>{for(const v of[...o.position,...o.quaternion,...o.scale,...o.matrixWorld.elements])assert(Number.isFinite(v),'finite transform '+o.name);});};

for(const hz of [30,60,120])for(const role of ['you','def','fwd','gk']){
 const rig=createPlayer('retreat-'+role,'home');rig.setProfile(ROLE_PROFILES[role]);let z=0,minPitch=Infinity,maxStep=0,last=0;
 for(let i=0;i<hz*3;i++){
  const t=i/hz,speed=t<1.5?-2.6:-Math.max(0,2.6-(t-1.5)*5);
  z+=speed/hz;rig.update(0,z,1/hz,t,false,{facing:0,backpedal:t<2?1:0,runIntensity:.7,brake:t>1&&t<2?1:0,jockey:.5});finite(rig);
  const current=pitch(rig);if(t>.8&&t<2){minPitch=Math.min(minPitch,current);maxStep=Math.max(maxStep,Math.abs(current-last));}last=current;
 }
 rig.dispose();assert(minPitch>-.035,`${role} ${hz}Hz retreat pitches too far back: ${minPitch}`);assert(maxStep<.12,`retreat brake transition jumps ${maxStep}`);
 console.log('RETREAT_BALANCE_PASS',role,hz,{minPitch,maxStep});
}

// A broad stance bends through the hip/knee solve while the wrists remain
// articulated, and secondary motion freezes with a held playback frame.
{
 const r=createPlayer('articulation','home',false);let minWidth=Infinity,maxKnee=0,minKnee=Infinity,wristMin=Infinity,wristMax=-Infinity,forearmMin=Infinity,forearmMax=-Infinity;
 for(let i=0;i<180;i++){
  r.update(0,-i/30,1/60,i/60,false,{facing:0,backpedal:1,jockey:.8});finite(r);if(i<60)continue;
  minWidth=Math.min(minWidth,Math.abs(world(r,'left-ankle').x-world(r,'right-ankle').x));
  const knee=joint(r,'left-knee').rotation.x;maxKnee=Math.max(maxKnee,knee);minKnee=Math.min(minKnee,knee);
  const wrist=joint(r,'left-hand'),forearm=joint(r,'left-elbow');assert(wrist?.parent===forearm,'hand has a real wrist joint');
  wristMin=Math.min(wristMin,wrist.rotation.x);wristMax=Math.max(wristMax,wrist.rotation.x);forearmMin=Math.min(forearmMin,forearm.rotation.y);forearmMax=Math.max(forearmMax,forearm.rotation.y);
 }
 assert(minWidth>.28,'retreat feet occupy separate lanes: '+minWidth);assert(maxKnee>.5,'knees visibly bend: '+maxKnee);assert(wristMax-wristMin>.15,'wrist follows the arm');assert(forearmMax-forearmMin>.2,'forearm rotates');
 const names=['left-hand','right-hand','left-elbow','right-elbow'],before=names.flatMap(n=>joint(r,n).quaternion.toArray());
 r.update(0,-179/30,0,179/60,false,{facing:0,backpedal:1,jockey:.8});const after=names.flatMap(n=>joint(r,n).quaternion.toArray());before.forEach((v,i)=>assert(Math.abs(v-after[i])<1e-9,'paused secondary motion stays frozen'));
 console.log('ARTICULATION_PASS',{minWidth,minKnee,maxKnee,wristRange:wristMax-wristMin,forearmRange:forearmMax-forearmMin});r.dispose();
}
