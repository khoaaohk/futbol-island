const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set});return m.exports;}
const{createPlayer}=load('lib/graphics/player.ts'),ankle=(r,side)=>r.root.getObjectByName(side+'-ankle').getWorldPosition(new T.Vector3());
const errors=[],summary=[];
for(const angle of[-Math.PI/2,Math.PI/2]){
 const r=createPlayer('pivot','home');r.update(0,0,1/60,0,false,{facing:0});const inside=angle>0?'left':'right';let old=ankle(r,inside),maxJump=0,maxInsideLift=0,maxSupportHeightError=0;
 for(let i=1;i<=120;i++){r.update(0,0,1/60,i/60,false,{facing:angle});const p=ankle(r,inside);maxJump=Math.max(maxJump,p.distanceTo(old));maxInsideLift=Math.max(maxInsideLift,p.y-.075);maxSupportHeightError=Math.max(maxSupportHeightError,Math.abs(Math.min(ankle(r,'left').y,ankle(r,'right').y)-.075));old=p;}
 if(maxJump>.04)errors.push(`pivot ${angle}: inside foot frame jump ${maxJump}m`);
 if(maxSupportHeightError>.005)errors.push(`pivot ${angle}: support height error ${maxSupportHeightError}m`);summary.push({angle,maxJump,maxInsideLift,maxSupportHeightError});r.dispose();
}
// At least one supporting ankle stays at pitch height for sustained directional travel.
for(const [dx,dz]of[[0,1],[0,-1],[1,0],[-1,0],[Math.SQRT1_2,Math.SQRT1_2]])for(const reduced of[false,true]){
 const r=createPlayer('feet','home');let maxError=0;
 for(let i=0;i<240;i++){r.update(dx*i*.05,dz*i*.05,1/60,i/60,reduced,{facing:0});if(i>60)maxError=Math.max(maxError,Math.abs(Math.min(ankle(r,'left').y,ankle(r,'right').y)-.075));}
 if(maxError>.005)errors.push(`support height direction ${dx},${dz} reduced=${reduced}: ${maxError}m`);
 summary.push({direction:[dx,dz],reduced,maxError});r.dispose();
}
// Teaching poses stay frozen through pause and do not depend on a reduced-motion transition.
const r=createPlayer('pause-review','home'),fresh=createPlayer('pause-review','home'),sample={facing:.8,receive:.65,kickSide:-1,samplePose:{speed:1.8,distance:2.7,heading:1.3},lookX:4,lookZ:2,lookY:.295};
const pose=r=>{const values=[];r.root.traverse(o=>values.push(...o.position,...o.quaternion));return values;};
for(let i=0;i<60;i++)r.update(i*.03,i*.02,1/60,i/60,false,{facing:i*.02});
r.update(2,3,0,1.4,false,sample);const frozen=pose(r);for(let i=0;i<30;i++)r.update(2,3,0,1.4,false,sample);assert.deepEqual(pose(r),frozen,'paused sampled body freezes');
r.update(2,3,0,1.4,true,sample);fresh.update(2,3,1/30,1.4,true,sample);const a=pose(r),b=pose(fresh);a.forEach((v,i)=>assert(Math.abs(v-b[i])<1e-9,'reduced transition has deterministic sampled pose'));r.dispose();fresh.dispose();
// Hips start returning from preparation before the chest for all football actions.
for(const kind of['pass','shot','loft']){const r=createPlayer('sequence','home');let hipMin={v:0,t:0},chestMin={v:0,t:0};for(let i=0;i<=100;i++){const t=i/100;r.update(0,0,0,0,true,{facing:0,kick:t,kickSide:1,actionKind:kind});const h=r.root.getObjectByName('player-pelvis').rotation.y,c=r.root.getObjectByName('armor-torso').rotation.y;if(h<hipMin.v)hipMin={v:h,t};if(c<chestMin.v)chestMin={v:c,t};}assert(hipMin.t<chestMin.t,kind+' pelvis leads chest out of windup');r.dispose();}
console.log('BODY_REVIEW_MEASUREMENTS',JSON.stringify(summary));assert.equal(errors.length,0,errors.join('\n'));console.log('BODY_REVIEW_PASS bilateral pivot release, 3D supporting-foot height, pause/reduced transitions and action sequence');

// Full-body balance follows the supporting side while shoulders counterbalance the hips.
const walking=createPlayer('balance-review','home');let shifts=[],counter=0;
for(let i=0;i<180;i++){
 walking.update(0,i*.04,1/60,i/60,false,{facing:0});
 if(i>60){const pelvis=walking.root.getObjectByName('player-pelvis'),chest=walking.root.getObjectByName('armor-torso');shifts.push(pelvis.position.x);if(pelvis.position.x*chest.rotation.z>0)counter++;}
}
assert(Math.max(...shifts)-Math.min(...shifts)>.06,'weight transfers visibly between supporting legs');
assert(counter>110,'chest counterbalances the lateral hip shift');walking.dispose();
console.log('BODY_BALANCE_PASS stance-driven weight transfer and upper-body counterbalance');

// Direction-specific locomotion: compare complete moving rigs, not just profile constants.
const profiles={};
for(const [name,dx,dz,pace,jockey]of[['jog',0,1,.35,0],['sprint',0,1,1,0],['backpedal',0,-1,.6,1],['left',-1,0,.5,1],['right',1,0,.5,1]]){
 const r=createPlayer('direction-review','home');let lean=0,height=0,frames=0,minSeparation=Infinity,maxLift=0;
 for(let i=0;i<180;i++){
  r.update(dx*i*.04,dz*i*.04,1/60,i/60,false,{facing:0,runIntensity:pace,jockey});
  if(i>60){const l=ankle(r,'left'),rr=ankle(r,'right');lean+=r.root.getObjectByName('armor-torso').rotation.x;height+=r.root.getObjectByName('player-pelvis').position.y;frames++;minSeparation=Math.min(minSeparation,rr.x-l.x);maxLift=Math.max(maxLift,l.y-.075,rr.y-.075);}
 }
 profiles[name]={lean:lean/frames,height:height/frames,minSeparation,maxLift};r.dispose();
}
assert(profiles.sprint.lean>profiles.jog.lean+.12,'sprinting has a stronger forward lean than jogging');
assert(profiles.backpedal.lean<profiles.jog.lean,'backpedal remains upright rather than leaning into a forward sprint');
assert(profiles.backpedal.height<profiles.jog.height-.04,'defensive retreat lowers the centre of mass');
assert(profiles.left.maxLift<profiles.sprint.maxLift*.7,'shuffles use low quick steps rather than running knee lift');
assert(profiles.left.minSeparation>0&&profiles.right.minSeparation>0,'lateral defensive feet never cross');
console.log('DIRECTIONAL_GAIT_PASS',JSON.stringify(profiles));
