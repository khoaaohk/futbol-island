// Jobs upgrade (Oct 25 2026, docs/JOBS_UPGRADE_OCT25.md): next-step coaching, the rhythm streak, par times, the finish cheer and
// the reworked body poses. Pure modules only (the same vm loader as tests/island-jobs.cjs).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..');
function environment(){
 const data=new Map(),cache=new Map();
 const localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
 const context=vm.createContext({console,Set,Map,Date,Math,JSON,Promise,queueMicrotask,localStorage});
 function load(name){
  let file=path.resolve(base,name);if(!fs.existsSync(file))for(const ext of ['.ts','.tsx'])if(fs.existsSync(file+ext)){file+=ext;break;}
  if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,resolveJsonModule:true,esModuleInterop:true}}).outputText;
  const req=spec=>{if(spec.startsWith('.')){const target=path.relative(base,path.resolve(path.dirname(file),spec));if(spec.endsWith('.json'))return JSON.parse(fs.readFileSync(path.resolve(base,target),'utf8'));return load(target);}if(spec==='three')return require('three');throw Error('unexpected import '+spec);};
  vm.runInContext(`(function(exports,require,module){${code}\n})`,context)(mod.exports,req,mod);cache.set(file,mod.exports);return mod.exports;
 }
 return {load};
}
const env=environment(),C=env.load('lib/town/jobs/jobCatalog.ts'),R=env.load('lib/town/jobs/jobRules.ts'),K=env.load('lib/town/jobs/jobCoach.ts'),
 JM=env.load('lib/town/jobs/jobMoves.ts'),P=env.load('lib/graphics/jobPoses.ts');
const floor=()=>0,at=q=>({x:q.x,y:0,z:q.z}),far={x:9999,y:0,z:9999};

// ---- 1. Next-step coaching: never the whole how-to sentence while walking; the next target, the arrow, how many are left ----
{const job=C.jobById('leaf-rake'),run=R.startRun(job);R.stepRun(run,at(job.board),.1,floor);
 assert.match(R.runHint(run),/^Next: the nearest leaf pile \(follow the arrow\)\. 12 leaf piles to go\.$/);
 // Rake a pile, walk off before bagging it: sent back to it, and the arrow points only at it.
 const t=job.targets[3];R.stepRun(run,at(t),.1,floor);R.runAction(run,'rake');for(let i=0;i<20&&run.stage[3]===0;i++)R.stepRun(run,at(t),.1,floor);
 assert.equal(run.stage[3],1,'raked');R.runAction(run,'rake:up');R.stepRun(run,at(job.board),.1,floor);
 assert.match(R.runHint(run),/Go back to the leaf pile you started and Bag it\./);
 assert.deepEqual(JSON.parse(JSON.stringify(R.runGoals(run))),[{x:t.x,z:t.z}],'the arrow sends you back to the half-done pile');
 R.stepRun(run,at(t),.1,floor);R.runAction(run,'bag');assert(run.got[3]);R.stepRun(run,at(job.board),.1,floor);
 assert.match(R.runHint(run),/11 leaf piles to go/);assert.equal(R.runGoals(run).length,11,'every other pile is a goal again');
 // The bag is full: walk to the bin.
 run.got=run.got.map(()=>true);run.phase='deliver';R.stepRun(run,far,.1,floor);
 assert.equal(R.runHint(run),'All done here! Walk to the compost bin (follow the arrow) and tap Empty the bag.');
 R.stepRun(run,at(job.deliver),.1,floor);assert.equal(run.at,-2);assert.equal(R.runHint(run),job.work.deliver.hint,'at the bin: the action hint');}
{const job=C.jobById('ball-kid'),run=R.startRun(job);R.stepRun(run,far,.1,floor);assert.equal(R.runHint(run),'Run to loose ball 1 of 5 (follow the arrow).');
 R.stepRun(run,at(job.targets[0]),.1,floor);R.runAction(run,'pickup');R.stepRun(run,far,.1,floor);assert.equal(R.runHint(run),'Got it! Carry it to the ball box (follow the arrow).');}
{const job=C.jobById('cone-setup'),run=R.startRun(job);R.stepRun(run,far,.1,floor);assert.match(R.runHint(run),/glowing mark .*8 cones to go/);
 const peg=C.jobById('goal-anchor'),pr=R.startRun(peg);R.stepRun(pr,far,.1,floor);assert.match(R.runHint(pr),/6 pegs to go/);
 const bottle=C.jobById('court-cleanup'),br=R.startRun(bottle);br.got[0]=true;R.stepRun(br,far,.1,floor);assert.match(R.runHint(br),/9 bottles to go/);}
assert(C.jobById('cone-setup').radius>=1.6&&C.jobById('goal-anchor').radius>=1.5,'forgiving reaches for the cone marks and the goal pegs');
// Every job (except the Bug squad, which has its own pill) has a hint at the start, so the panel never reads empty.
for(const j of C.JOBS){if(j.swing)continue;const run=R.startRun(j);R.stepRun(run,far,.1,floor);assert(R.runHint(run).length>0,`${j.id}: a next-step hint at the start`);}
{const bug=C.JOBS.find(j=>j.swing);if(bug)assert.equal(K.coachLine(R.startRun(bug)),'','the Bug squad keeps its own copy');}

// ---- 2. Rhythm streak: cosmetic, capped, milestones once each ----
{const s=K.createJobStreak();const lines=[];for(const t of [0,3,6,9,12,15,18,21,24,27])lines.push(s.hit(t).line);
 assert.deepEqual(lines.map(l=>!!l),[false,false,true,false,true,false,false,true,false,false],'milestones at 3, 5 and 8');
 assert.equal(s.count,8,'capped at 8');assert.match(lines[2],/3 in a row/);
 assert.equal(s.hit(27+K.STREAK_GAP+.5).count,1,'a long gap starts again');s.reset();assert.equal(s.count,0);
 const c=K.createJobStreak(true);assert(c.hit(0).line===''&&c.hit(500).line===''&&/3 right calls/.test(c.hit(1000).line),'offside: right calls in a row, no time limit');
 const def=id=>C.jobById(id);
 assert(K.streakEvent(def('leaf-rake'),'collect')&&K.streakEvent(def('ball-kid'),'return')&&K.streakEvent(def('match-day-snacks'),'return')&&K.streakEvent(def('garden-shift'),'pluck'));
 assert(!K.streakEvent(def('line-painter'),'collect')&&!K.streakEvent(def('ball-pump'),'return')&&!K.streakEvent(def('offside-flag'),'return'),'no streak on the dashes, the pump or replays');
 const src=fs.readFileSync(path.join(base,'lib/town/jobs/jobCoach.ts'),'utf8');assert.doesNotMatch(src,/credit|coins\s*[+=]|wallet/i,'the streak never pays');
 assert.match(fs.readFileSync(path.join(base,'lib/audio/islandSound.ts'),'utf8'),/case 'streak':/,'the streak has its own chime');
 const scene=fs.readFileSync(path.join(base,'lib/town/jobs/jobScene.ts'),'utf8');assert.match(scene,/streakEvent\(def,e\.type\)/);assert.match(scene,/streak\.reset\(\);callStreak\.reset\(\)/,'a new shift starts the streak again');
 assert.match(scene,/lastP\.x=p\.x;lastP\.y=p\.y;lastP\.z=p\.z;/,'no new player-position object per frame');}

// ---- 3. Par times ----
{assert.equal(K.jobPar('bug-scout'),null);for(const j of C.JOBS){if(j.id==='bug-scout')continue;const p=K.jobPar(j.id);assert(p>=15&&p%5===0,`${j.id}: par ${p}`);}
 const p=K.jobPar('leaf-rake');assert.match(K.parLine('leaf-rake',p-1),/^Under par/);assert.match(K.parLine('leaf-rake',p+30),/^Par is 1:10\. Try it again/);assert.equal(K.parLine('bug-scout',30),'');
 const hud=fs.readFileSync(path.join(base,'components/IslandJobs.tsx'),'utf8');assert.match(hud,/parLine\(def\.id,payday\.seconds\)/,'the payday card shows the par');
 assert.match(hud,/const stopJob=\(\)=>\{const v=view\.active;if\(v&&v\.value>0&&!endAsk\)\{setEndAsk\(true\);return;\}/,'Stop job asks once when there is progress');
 assert.match(hud,/data-job-meter=/,'a progress meter');const css=fs.readFileSync(path.join(base,'components/IslandJobs.module.css'),'utf8');assert.match(css,/prefers-reduced-motion:reduce\)\{\.meter i\{transition:none\}/);
 const g=fs.readFileSync(path.join(base,'app/globals.css'),'utf8');assert.match(g,/\.job-action:not\(\[aria-disabled=true\]\)\{animation:jobReady/,'a ready button pops');assert.match(g,/prefers-reduced-motion:reduce\)\{\.travel-actions \.job-action\{animation:none!important;\}/);}

// ---- 4. The finish cheer ----
{const pt=(kind,progress,reduced=false)=>JSON.parse(JSON.stringify(P.jobPoseTarget({kind,progress},0,reduced)));
 assert.equal(JM.poseForEvent(C.jobById('cone-setup'),{type:'done'}).kind,'cheer');assert.equal(JM.poseForEvent(C.jobById('garden-shift'),{type:'done'}).kind,'cheer');
 assert.equal(JM.poseForEvent(C.jobById('bug-scout')??C.JOBS.find(j=>j.swing),{type:'done'}),null,'the Bug squad has its release instead');
 const hop=pt('cheer',.38);assert(hop.py>.95&&hop.toe>.5&&hop.al[0]<-2.6&&hop.ar[0]<-2.6,'a hop with both arms up');
 const pump=pt('cheer',.8);assert(pump.ar[0]<-2.3&&pump.ar[2]<-1.7&&pump.al[0]>-1,'then a fist pump');
 assert.equal(pt('cheer',1).py,.86,'back to standing');const red=pt('cheer',.38,true);assert(red.py<=.86&&red.toe===0,'reduced motion: arms up, no hop');
 assert(JM.POSE_TIME.cheer>0&&JM.POSE_TIME.cheer<=1);
 // It waits for the last action (the toss into the bin), then plays; a reset drops it.
 const m=JM.createJobMoves(),pl={x:0,z:0,y:0,yaw:0},fl=()=>0;m.start('toss',pl,{x:0,z:1.5},fl,false,null);m.start('cheer',pl,null,fl,false,null);
 assert.equal(m.posing,'toss','the toss plays first');let t=0;while(m.posing==='toss'&&t<2){m.update(.05,pl,fl,null);t+=.05;}assert.equal(m.posing,'cheer','then the cheer');
 m.end();assert.equal(m.posing,'cheer','the job ending does not cut the cheer');t=0;while(m.posing&&t<2){m.update(.05,pl,fl,null);t+=.05;}assert(t<=1,'bounded');
 const m2=JM.createJobMoves();m2.start('toss',pl,{x:0,z:1.5},fl,false,null);m2.start('cheer',pl,null,fl,false,null);m2.reset();assert.equal(m2.posing,null);m2.update(.05,pl,fl,null);assert.equal(m2.posing,null,'reset drops the queued cheer');}

// ---- 5. Body mechanics: distinct, eased, allocation-free ----
{const g=(phase,amount)=>({phase,amount,sprint:0}),T=(kind,progress,o={},time=0,reduced=false,gait)=>JSON.parse(JSON.stringify(P.jobPoseTarget({kind,progress,...o},time,reduced,gait)));
 // The same object (and arrays) come back every call: nothing is made per frame.
 const a=P.jobPoseTarget({kind:'rake',progress:.2},0,false),al=a.al,b=P.jobPoseTarget({kind:'gpick',progress:.4,basket:true},0,false);assert(a===b&&b.al===al,'one reused target');
 // Rake: reach out (arms long, chest over the front boot) then pull back in.
 const reach=T('rake',.5),pull=T('rake',0);assert(reach.tx>pull.tx+.15&&reach.al[0]<pull.al[0]-.3&&reach.fl[0]>pull.fl[0],'reach vs pull');
 assert.deepEqual(T('rake',.1,{},0,true),T('rake',.6,{},0,true),'reduced motion: one still raking pose');
 // Line marker: leaning in and looking down while painting; a push on each step.
 const paint=T('push',0,{tug:1},0,false,g(0,1)),idle=T('push',0,{tug:0},0,false,g(0,0));assert(paint.tx>idle.tx+.1&&paint.hx>idle.hx+.15,'painting: lean in, eyes on the line');
 assert.notDeepEqual(T('push',0,{tug:1},0,false,g(Math.PI/4,1)).al,T('push',0,{tug:1},0,false,g(-Math.PI/4,1)).al,'the handle pushes with the steps');
 // Carrying: the load bobs with the stride, the free arm swings, a breath and a look round when standing.
 const s1=T('carrystack',0,{},0,false,g(Math.PI/2,1)),s2=T('carrystack',0,{},0,false,g(-Math.PI/2,1));assert(Math.abs(s1.ar[0]-s2.ar[0])>.6,'the free arm swings against the stride');
 assert(T('carryball',0,{},0,false,g(0,1)).tx<-.05,'a ball hugged to the chest: the body leans back a little');
 assert.notEqual(T('carryball',0,{},1,false,g(0,0)).hy,T('carryball',0,{},4,false,g(0,0)).hy,'standing: the eyes look round');
 assert.equal(T('carryball',0,{},1,true,g(0,0)).hy,0,'reduced motion: no fidget');
 // Cone: a crouch with a beat at the bottom; bottle: squat, then over the shoulder into the bag; flag: up on the toes.
 const c1=T('place',.52,{});assert(c1.py<.58&&c1.hx>.4&&c1.al[2]<-1.3,'cone: crouch, eyes on the mark, the stack still in the arm');
 const p1=T('pick',.36),p2=T('pick',.84);assert(p1.py<.62&&p1.fl[0]>.1&&p2.ar[0]<-2.3,'bottle: squat, then the hand goes over the shoulder');
 const f=T('flagup',.5);assert(f.toe>.1&&f.ar[0]<-3&&f.al[1]>.3,'flag: straight up on the toes, the free arm out');
 // Everything finite across the pose and back to standing at the end.
 for(const kind of ['place','pick','flagup','cheer','rake','push','carryball','carrystack','carrycard','carrybasket','flaghold','kneel'])for(let k=0;k<=1.0001;k+=.05){const t=T(kind,k,{tug:k},k*3,false,g(k*6,1));
  assert([t.py,t.pz,t.tx,t.ty,t.hx,t.hy,t.toe,...t.fl,...t.fr,...t.al,...t.ar].every(Number.isFinite),`${kind} finite at ${k.toFixed(2)}`);assert(t.py>.4&&t.py<1.05,`${kind}: the pelvis stays in reach`);}
 for(const kind of ['place','pick','cheer'])assert.equal(T(kind,1).py,.86,`${kind} returns to standing`);
 // The gpick crouch keeps its values (the allocation-free blend matches the old one).
 const gp=T('gpick',.3,{basket:true});assert(gp.py<.65&&gp.tx>.7&&gp.ar[0]<-.9);}

// ---- 6. Job FX: no arrays or vectors per frame, tweens keep their order ----
{const T3=require('three'),FX=env.load('lib/town/jobs/jobFx.ts'),root=new T3.Group(),fx=FX.createJobFx(root),log=[];
 fx.tween(.1,()=>{},()=>{log.push('a');fx.tween(.1,()=>{},()=>log.push('c'));});fx.tween(.3,()=>{},()=>log.push('b'));
 for(let i=0;i<20;i++)fx.update(.05);assert.deepEqual(log,['a','c','b'],'an end callback can start a new tween');assert(!fx.busy);
 fx.burst(0,0,0,'#fff',4);assert(fx.busy);for(let i=0;i<40;i++)fx.update(.05);assert(!fx.busy,'particles die away');fx.dispose();
 const src=fs.readFileSync(path.join(base,'lib/town/jobs/jobFx.ts'),'utf8');assert.doesNotMatch(src.slice(src.indexOf('function update')),/new T\.Vector3|const keep:Tween\[\]=\[\]/,'nothing made per frame');}
console.log('job-upgrade-oct25: ok');
