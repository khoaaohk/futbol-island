const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),path=require('node:path');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set});return m.exports;}
const {createPlayer,ROLE_PROFILES}=load('lib/graphics/player.ts'),T=require('three');
let cases=0,maxRecoveryStep=0;
for(const role of ['fwd','def','gk'])for(const side of [-1,1])for(const hz of [30,60,120]){
 const r=createPlayer('recovery','home');r.setProfile(ROLE_PROFILES[role]);
 const hip=r.root.getObjectByName('player-pelvis'),waist=r.root.getObjectByName('player-lumbar'),chest=r.root.getObjectByName('player-chest');
 const sample=kick=>r.update(0,0,0,0,false,{facing:0,kickSide:side,kick,actionKind:'shot',samplePose:{speed:0,distance:0,heading:0}});
 sample(.18);assert(hip.position.x*side<-.06,'load moves hips over support side');assert(waist.rotation.y*side<0&&chest.rotation.y*side<0,'waist and chest coil on load');sample(.6);assert(chest.rotation.y*side>0,'chest unwinds after contact');
 r.update(0,0,1/hz,0,false,{facing:0,resumePose:true});
 for(let i=0;i<hz;i++)r.update(0,0,1/hz,i/hz,false,{facing:0});
 for(let i=0;i<hz;i++)r.update(0,0,1/hz,1+i/hz,false,{facing:0,kickSide:side,kick:i/hz,actionKind:'shot'});
 const ankle=r.root.getObjectByName((side===1?'right':'left')+'-ankle'),pos=new T.Vector3(),prev=ankle.getWorldPosition(new T.Vector3());
 for(let i=0;i<Math.ceil(hz*.4);i++){
  r.update(0,0,1/hz,2+i/hz,false,{facing:0});ankle.getWorldPosition(pos);maxRecoveryStep=Math.max(maxRecoveryStep,pos.distanceTo(prev));prev.copy(pos);
  if(i===2){const hold=pos.clone();r.update(0,0,0,2+i/hz,false,{facing:0});assert(ankle.getWorldPosition(pos).distanceTo(hold)<.004,'pause during recovery does not advance landing');}
 }
 assert(pos.z>.08,'striking foot lands forward');assert(Math.abs(pos.y-.075*r.profileScale)<.008,'recovery lands on ground');
 const a=pos.clone();r.update(0,0,0,2.4,false,{facing:0});assert(ankle.getWorldPosition(pos).distanceTo(a)<.004,'paused recovery holds');sample(.36);const contact=r.ballContact(side,new T.Vector3());sample(.8);sample(.36);assert(r.ballContact(side,new T.Vector3()).distanceTo(contact)<1e-9,'seek clears recovery history');r.dispose();cases++;
}
assert(maxRecoveryStep<.07,'bounded recovery step');console.log('STRIKE_RECOVERY_PASS',{cases,maxRecoveryStep});
const interrupted=createPlayer('interrupt','home');interrupted.update(0,0,1/60,0,false,{facing:0});for(let i=1;i<60;i++)interrupted.update(0,0,1/60,i/60,false,{facing:0,kick:i/60,kickSide:1,actionKind:'shot'});interrupted.update(0,0,1/60,1,false,{facing:0});interrupted.update(0,0,1/60,1.02,false,{facing:0,kick:.36,kickSide:-1,actionKind:'shot'});const hit=interrupted.ballContact(-1,new T.Vector3());assert(hit.distanceTo(new T.Vector3(-.14,.19,.65))<1e-8,'new opposite-foot strike cancels recovery without missing contact');interrupted.dispose();console.log('RECOVERY_INTERRUPT_PASS');
