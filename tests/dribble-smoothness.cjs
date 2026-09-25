const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),ts=require('typescript'),path=require('path'),T=require('three');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set});return m.exports;}
const {createPlayer}=load('lib/graphics/player.ts');let cases=0,maxSide=0,maxForwardStep=0;
for(const hz of [30,60,120])for(const speed of [1.5,3,5])for(const turn of [false,true]){
 const r=createPlayer('dribble-smooth','home'),ball=new T.Vector3();let previousLead;
 for(let i=0;i<hz*4;i++){
  const t=i/hz,yaw=turn?.35*Math.sin(t):0;
  r.update(0,t*speed,1/hz,t,false,{facing:yaw,dribbling:true});r.dribbleContact(ball);
  const angle=r.root.rotation.y,dx=ball.x-r.root.position.x,dz=ball.z-r.root.position.z;
  const lateral=dx*Math.cos(angle)-dz*Math.sin(angle),lead=dx*Math.sin(angle)+dz*Math.cos(angle);
  maxSide=Math.max(maxSide,Math.abs(lateral));assert(Math.abs(lateral)<1e-9,'no foot-to-foot lateral oscillation');
  assert(lead>=.6-1e-9&&lead<=.625+1e-9,'bounded close-control lead');
  if(i>hz)maxForwardStep=Math.max(maxForwardStep,Math.abs(lead-previousLead));previousLead=lead;
  assert(r.dribbleContact(new T.Vector3()).equals(ball),'repeated reads do not advance contact');
 }
 r.dispose();cases++;
}
assert(maxForwardStep<.002,'no fore-aft gait pumping');
const paused=createPlayer('paused-dribble','home');for(let i=0;i<60;i++)paused.update(0,i/30,1/60,i/60,false,{facing:0,dribbling:true});const a=paused.dribbleContact(new T.Vector3());paused.update(0,59/30,0,59/60,false,{facing:0,dribbling:true});assert(paused.dribbleContact(new T.Vector3()).distanceTo(a)<1e-10,'paused lane sleeps');paused.update(100,100,1/60,2,false,{facing:0,dribbling:true});const b=paused.dribbleContact(new T.Vector3());assert(Math.abs(b.x-100)<.12&&b.z>100.55&&b.z<101,'teleport resets local contact');paused.dispose();
console.log('DRIBBLE_LANE_PASS',{cases,maxSide,maxForwardStep});
