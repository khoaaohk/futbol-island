const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set});return m.exports;}
const {createPlayer,ROLE_PROFILES,PROFILE_RANGES,profileFor}=load('lib/graphics/player.ts'),{playerBatch}=load('lib/graphics/playerBatch.ts'),{DEFAULT_CUSTOMIZATION:D}=load('lib/town/customization.ts');
const IDENTITY={height:1,build:1,legs:1,stride:1,cadence:1,lean:1,armSwing:1,agility:1,weight:1,crouch:1};
const joint=(r,n)=>r.root.getObjectByName(n),world=(r,n)=>joint(r,n).getWorldPosition(new T.Vector3()),DT=1/60;

// Seeded variance stays inside the bible ranges, within +-6 % of the preset, and is deterministic.
{
 let distinct=new Set();
 for(const role of['gk','def','mid','fwd'])for(let seed=0;seed<300;seed++){
  const p=profileFor(role,seed),base=ROLE_PROFILES[role];
  assert.deepEqual({...p},{...profileFor(role,seed)},'deterministic per seed');
  for(const key of Object.keys(PROFILE_RANGES)){const [low,high]=PROFILE_RANGES[key];assert(p[key]>=low&&p[key]<=high,`${role} ${key} ${p[key]} within [${low},${high}]`);const ratio=p[key]/base[key];assert(Math.abs(ratio-1)<=.0601||p[key]===low||p[key]===high,`${role} ${key} variance within 6 %: ${ratio}`);}
  distinct.add(p.stride.toFixed(4));
 }
 assert(distinct.size>100,'seeds actually vary the profile');
 for(const key of Object.keys(PROFILE_RANGES))for(const role of Object.keys(ROLE_PROFILES)){const [low,high]=PROFILE_RANGES[key];assert(ROLE_PROFILES[role][key]>=low&&ROLE_PROFILES[role][key]<=high,'preset inside range');}
 assert.deepEqual({...profileFor('you',123)},IDENTITY,'the user character is identity');
 assert.deepEqual({...profileFor('npc',77)},IDENTITY,'island NPCs are identity');
 assert.deepEqual({...ROLE_PROFILES.you},IDENTITY);
 console.log('PROFILE_VARIANCE_PASS',distinct.size,'distinct stride values');
}

// setProfile changes root/torso/leg scales relative to the host's base scale without compounding.
{
 const r=createPlayer('scaled','home');r.root.scale.setScalar(1.12);
 r.setProfile(ROLE_PROFILES.gk);
 assert(Math.abs(r.root.scale.x-1.12*1.05)<1e-9&&Math.abs(r.root.scale.y-1.12*1.05)<1e-9,'height multiplies the host scale');
 assert.equal(r.profileScale,1.05);
 assert(Math.abs(joint(r,'armor-torso').scale.x-1.16)<1e-9,'build widens the torso');
 assert(joint(r,'armor-torso').scale.z>1&&joint(r,'armor-torso').scale.z<1.16,'build deepens the ribcage more gently');
 assert(Math.abs(joint(r,'left-hip').scale.y-1.02)<1e-9&&Math.abs(joint(r,'left-hip').scale.x-1.02)<1e-9,'legs scale the hip group uniformly (no shear at the knee)');
 assert(Math.abs(joint(r,'player-head').scale.x*joint(r,'armor-torso').scale.x-1)<1e-9,'head width does not grow with build');
 r.setProfile(ROLE_PROFILES.fwd);
 assert(Math.abs(r.root.scale.x-1.12*1.02)<1e-9,'re-profiling does not compound the root scale');
 r.setProfile(ROLE_PROFILES.you);
 assert(Math.abs(r.root.scale.x-1.12)<1e-9&&joint(r,'armor-torso').scale.x===1&&joint(r,'left-hip').scale.y===1,'identity restores the host look');
 // Customization composes with the profile in either order; costumes still attach.
 r.setProfile(ROLE_PROFILES.def);r.setAppearance({...D,body:'strong',face:'deep'});
 assert(Math.abs(joint(r,'armor-torso').scale.x-1.14*1.14)<1e-9,'strong body multiplies the broad build');
 assert.equal(joint(r,'left-hip').scale.y,1,'defender legs stay 1.0');
 r.setAppearance({...D,body:'strong',face:'deep',costume:'arsenal'});
 assert(r.root.getObjectByName('player-head').children.some(n=>n.userData.costumeId==='arsenal'),'costume attaches to the profiled rig');
 for(let i=0;i<30;i++){r.update(i*.05,0,DT,i*DT,false,{facing:0,runIntensity:1});r.root.updateMatrixWorld(true);r.root.traverse(o=>assert(o.matrixWorld.elements.every(Number.isFinite)));}
 r.root.traverse(o=>{if(o.isMesh)assert.equal(o.matrixAutoUpdate,false,'body meshes stay cached after profile scaling');});
 r.dispose();
 console.log('PROFILE_SCALE_PASS');
}

// IK follows the scaled legs: a planted foot rests on the ground at rest and while running, for every role.
{
 const report={};
 for(const role of Object.keys(ROLE_PROFILES)){
  const r=createPlayer('ik-'+role,'home');r.setProfile(profileFor(role,role.length*31));const h=r.profileScale;
  for(let i=0;i<60;i++)r.update(0,0,DT,i*DT,false,{facing:0});
  const restL=world(r,'left-ankle').y/h,restR=world(r,'right-ankle').y/h;
  assert(Math.abs(restL-.075)<.006&&Math.abs(restR-.075)<.006,role+' soles rest on the ground: '+restL+' '+restR);
  const pelvisRest=joint(r,'player-pelvis').position.y;
  assert(r.profile.legs===1||Math.sign(pelvisRest-.88)===Math.sign(r.profile.legs-1),role+' pelvis rest height follows leg length');
  // A sprint has a flight phase (duty factor ~34 %): a boot touching down sits exactly on the pitch, never in it.
  let maxError=0,flight=0;
  for(let i=0;i<180;i++){r.update(0,i*.06,DT,1+i*DT,false,{facing:0,runIntensity:1});if(i>60){const low=Math.min(world(r,'left-ankle').y,world(r,'right-ankle').y)/h;if(low<.081)maxError=Math.max(maxError,Math.abs(low-.075));else flight++;assert(low>.069,role+' boot never sinks into the pitch: '+low);}}
  assert(maxError<.006,role+' support foot sits on the ground while sprinting: '+maxError);
  assert(flight>5&&flight<70,role+' sprint shows a short flight phase: '+flight+' of 119 frames');
  report[role]={rest:+restL.toFixed(4),pelvisRest:+pelvisRest.toFixed(3),runError:+maxError.toFixed(4)};r.dispose();
 }
 console.log('PROFILE_IK_PASS',JSON.stringify(report));
}

// Motion differs by type: at each role's own top speed (matchSim ROLE_MOVEMENT speed x a 6 u/s sprint)
// a forward runs lighter, leaner, with longer and quicker steps and a bigger arm swing than a defender;
// a defender sinks deeper into a brake and a lower ready stance; the user's profile changes nothing.
{
 const pitch=r=>joint(r,'player-pelvis').rotation.x+joint(r,'armor-torso').rotation.x,mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
 const run=(r,frames,velocity,motion,sampler)=>{const out=[];let x=0,z=0;for(let i=0;i<frames;i++){const t=i*DT,[vx,vz]=velocity(t);x+=vx*DT;z+=vz*DT;r.update(x,z,DT,t,false,motion(t));out.push(sampler(r,i));}return out;};
 const m={};
 for(const [role,speed]of[['fwd',6.6],['def',5.64]]){
  const r=createPlayer('motion','home');r.setProfile(ROLE_PROFILES[role]);const h=r.profileScale;
  const s=run(r,240,()=>[0,speed],()=>({facing:0,runIntensity:1}),rr=>({sep:(world(rr,'left-ankle').z-world(rr,'right-ankle').z)/h,pitch:pitch(rr),arm:joint(rr,'right-shoulder').rotation.x})).slice(60);
  let steps=0;for(let i=1;i<s.length;i++)if(Math.sign(s[i].sep)!==Math.sign(s[i-1].sep))steps++;
  const b=createPlayer('motion','home');b.setProfile(ROLE_PROFILES[role]);
  const brake=run(b,150,t=>[0,t<1.5?6:Math.max(0,6-30*(t-1.5))],()=>({runIntensity:1}),rr=>joint(rr,'player-pelvis').position.y);
  const q=createPlayer('motion','home'),still=createPlayer('motion','home');q.setProfile(ROLE_PROFILES[role]);still.setProfile(ROLE_PROFILES[role]);
  for(let i=0;i<90;i++){q.update(0,0,DT,i*DT,false,{facing:0,stance:'ready'});still.update(0,0,DT,i*DT,false,{facing:0});}
  m[role]={steps,stride:Math.max(...s.map(v=>Math.abs(v.sep))),pitch:mean(s.map(v=>v.pitch)),arm:Math.max(...s.map(v=>v.arm))-Math.min(...s.map(v=>v.arm)),
   brakeSink:Math.max(...brake.slice(30,90))-Math.min(...brake.slice(90)),crouch:joint(still,'player-pelvis').position.y-joint(q,'player-pelvis').position.y};
  r.dispose();b.dispose();q.dispose();still.dispose();
 }
 assert(m.fwd.pitch>m.def.pitch+.06,'a forward leans further into the sprint than a defender');
 assert(m.fwd.stride>m.def.stride*1.02,'a forward strides longer (per unit of body size) than a defender');
 assert(m.fwd.steps>m.def.steps,'a forward turns the legs over quicker than a defender at their own top speeds');
 assert(m.fwd.arm>m.def.arm*1.1,'a forward pumps the arms harder than a defender');
 assert(m.def.brakeSink>m.fwd.brakeSink*1.15,'a heavy defender sinks deeper into a hard stop than a light forward');
 assert(m.def.crouch>m.fwd.crouch*1.2,'a defender sits lower in the ready stance than a forward');
 // The user's character: profileFor('you') leaves every joint exactly where the unprofiled rig puts it.
 const pose=rr=>{const v=[];rr.root.traverse(o=>v.push(...o.position,...o.quaternion,...o.scale));return v;};
 const plain=createPlayer('you','home'),you=createPlayer('you','home');you.setProfile(profileFor('you',42));
 for(let i=0;i<150;i++){const t=i*DT,z=i<90?i*.1:9+Math.min(i-90,12)*.05,motion={runIntensity:1,brake:i>100?1:0,plant:i===95?1:0};plain.update(0,z,DT,t,false,motion);you.update(0,z,DT,t,false,motion);}
 assert.deepEqual(pose(you),pose(plain),'the you profile is a true identity: the user look and motion do not change');
 plain.dispose();you.dispose();
 console.log('PROFILE_MOTION_PASS',JSON.stringify(m));
}

// Instancing: profiles are group scales only, so the batch count and instance totals do not change.
{
 const scene=new T.Scene(),batch=playerBatch(scene),rigs=Array.from({length:22},(_,i)=>createPlayer('p'+i,i%2?'away':'home',false));
 const draw=()=>{batch.begin();for(const r of rigs){r.update(0,0,DT,1,false);batch.draw(r.root);}batch.end();const meshes=scene.children.filter(o=>o.isInstancedMesh);return {batches:meshes.length,instances:meshes.reduce((n,m)=>n+m.count,0)};};
 const before=draw();
 rigs.forEach((r,i)=>r.setProfile(profileFor(['gk','def','mid','fwd'][i%4],i)));
 const after=draw();
 assert.deepEqual(after,before,'profiles change no batch or instance count');
 assert.equal(after.batches,10);
 for(const m of scene.children.filter(o=>o.isInstancedMesh)){const matrix=new T.Matrix4();for(let i=0;i<m.count;i++){m.getMatrixAt(i,matrix);assert(matrix.elements.every(Number.isFinite));}}
 batch.dispose();rigs.forEach(r=>r.dispose());
 console.log('PROFILE_INSTANCING_PASS',JSON.stringify(after));
}
console.log('PLAYER_PROFILES_PASS variance, scales, IK ground contact, role motion, instancing');
