const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),path=require('node:path'),T=require('three');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set});return m.exports;}
const {createPlayer}=load('lib/graphics/player.ts'),{playerBatch}=load('lib/graphics/playerBatch.ts');
const rigs=Array.from({length:22},(_,i)=>createPlayer('spine'+i,'home',false)),scene=new T.Scene(),batch=playerBatch(scene),rig=rigs[0],shirt=rig.root.getObjectByName('player-jersey'),lumbar=rig.root.getObjectByName('player-lumbar'),chest=rig.root.getObjectByName('player-chest');
assert.equal(chest.parent,lumbar);assert.equal(rig.root.getObjectByName('left-shoulder').parent,chest);assert.equal(rig.root.getObjectByName('player-head').parent,chest);
let lower=0,upper=0,maxCollarGap=0;const p=new T.Vector3(),expected=new T.Vector3();
function pose(distance){rig.update(0,distance,0,distance/3,false,{facing:0,samplePose:{speed:3,distance,heading:0}});rig.root.updateMatrixWorld(true);return [...lumbar.quaternion,...chest.quaternion,...shirt.morphTargetInfluences];}
for(let frame=0;frame<180;frame++){
 pose(frame/20);lower=Math.max(lower,Math.abs(lumbar.rotation.y));upper=Math.max(upper,Math.abs(chest.rotation.y));
 const base=shirt.geometry.getAttribute('position');
 for(let i=0;i<base.count;i++){
  shirt.getVertexPosition(i,p);assert(Number.isFinite(p.length()));
  if(base.getY(i)===0)assert(p.distanceTo(expected.fromBufferAttribute(base,i))<1e-8,'hem anchored to pelvis');
  if(base.getY(i)>.48){expected.fromBufferAttribute(base,i);expected.y-=.32;chest.localToWorld(expected);shirt.localToWorld(p);maxCollarGap=Math.max(maxCollarGap,p.distanceTo(expected));}
 }
}
assert(lower>.015&&upper>.025,'independent visible spine rotation');assert(maxCollarGap<.004,'surface follows chest collar to within 4mm');const snapshot=pose(1.7);pose(6.4);assert.deepEqual(pose(1.7),snapshot);assert.deepEqual(pose(1.7),snapshot);
rig.update(0,1.7,0,0,true,{samplePose:{speed:0,distance:0,heading:0}});assert(shirt.morphTargetInfluences.every(v=>v===0),'reduced motion clears deformation');
function draw(order){batch.begin();for(const [i,r] of order.entries()){r.update(0,i/3,0,0,false,{samplePose:{speed:3,distance:i/3,heading:0}});batch.draw(r.root);}batch.end();}
draw(rigs);const rendered=scene.children.find(m=>m.morphTexture);assert(rendered&&rendered.morphTexture.image.height>=22,'morph storage covers crowd, not only first actor');
const read=new T.Mesh(shirt.geometry,shirt.material);
for(const order of [rigs,[...rigs].reverse(),rigs.slice(0,2),rigs]){draw(order);for(let i=0;i<order.length;i++){rendered.getMorphAt(i,read);const source=order[i].root.getObjectByName('player-jersey');assert(read.morphTargetInfluences.every((v,k)=>Math.abs(v-source.morphTargetInfluences[k])<1e-6),'instanced weights follow owner after reorder/shrink');}}
const version=rendered.morphTexture.version;draw(rigs);assert.equal(rendered.morphTexture.version,version,'unchanged morphs skip texture upload');
batch.begin();for(let i=0;i<70;i++)batch.draw(rig.root);batch.end();assert(rendered.morphTexture.image.height>=70,'morph storage grows with crowd');for(let i=0;i<70;i++){rendered.getMorphAt(i,read);assert(read.morphTargetInfluences.every((v,k)=>Math.abs(v-shirt.morphTargetInfluences[k])<1e-6),'growth preserves morph rows');}
rig.setAppearance({character:'female',face:'warm',body:'slim',clothing:'coast'});pose(2);assert(shirt.morphTargetInfluences.some(v=>v>0));
const geometry=rigs[1].root.getObjectByName('player-jersey').geometry;let disposed=false;geometry.addEventListener('dispose',()=>disposed=true);rig.dispose();assert(!disposed,'shared surface survives another actor disposal');for(const r of rigs.slice(1))r.dispose();assert(disposed,'shared surface released by last actor');batch.dispose();
console.log('SPINE_PASS',{maxCollarGap,lower,upper,crowdBatches:scene.children.length});
