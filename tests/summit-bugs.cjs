// Summit Isle bug jobs (Oct 20 2026, user: "add new jobs on the mountain island. catching butterflies and other bugs. tie the bugs
// into the concept of futbol. for nighttime add catching fireflies instead since it's night time."). lib/town/jobs/bugScout.ts,
// the two catalog entries (jobCatalog.ts), the runtime (jobScene.ts) and the analytics ids. Headless, on the real island:
//  1. the data: a 7v7 Bug squad plus the referee by day, eight football-call fireflies at night, each teaching football;
//  2. every sign, bug, firefly and drop-off on walkable Summit Isle ground, clear of colliders (the real buildTown obstacles);
//  3. day / night: Bug squad only by day (and sunset), Firefly floodlights only at night; switching the time ends a shift;
//  4. a whole shift played through the real job scene: hold the net at each bug, release at the bug hotel, paid like a collect job;
//     bugs flutter only while a shift runs (no props, no uploads when idle); the props are disposed after;
//  5. pay in the usual band and metered, buttons and poses, analytics ids on the allowlist with call sites, shown in /admin.
// usage: node tests/summit-bugs.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const storage=new Map(),localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const cache=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,queueMicrotask,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,
 window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage,document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,allowJs:true}}).outputText;
 const r=id=>id==='react'?{useSyncExternalStore:(_s,get)=>get(),useEffect(){},useState(){},useRef(){},createContext(){}}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('@/')?load(id.slice(2)):
  id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8')):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
const B=load('lib/town/jobs/bugScout.ts'),C=load('lib/town/jobs/jobCatalog.ts'),E=load('lib/town/jobs/jobEconomy.ts'),M=load('lib/town/jobs/jobMoves.ts'),R=load('lib/town/jobs/jobRules.ts');
const SI=load('lib/town/summitIsle.ts'),V=load('lib/town/venues.ts'),floor=(x,z)=>V.fieldSurfaceHeight(x,z);
const day=C.jobById('bug-scout'),night=C.jobById('firefly-floodlights');

// ---- 1. The data teaches football ----
{assert(day&&night,'both jobs are in the catalog');
 assert.equal(B.BUG_SQUAD.length,8,'a 7v7 squad plus the referee');assert.equal(B.FIREFLY_CALLS.length,8,'eight fireflies');
 for(const [job,list,prop,when] of [[day,B.BUG_SQUAD,'bug','day'],[night,B.FIREFLY_CALLS,'firefly','night']]){
  assert.equal(job.kind,'collect');assert.equal(job.prop,prop);assert.equal(job.when,when);assert.equal(job.place,'Summit Isle meadow');
  assert.equal(job.targets.length,list.length);assert.equal(job.spotHints.length,list.length);assert.equal(job.spotNotes.length,list.length);
  assert(job.deliver&&job.work.target.length===1&&job.work.target[0].mode==='hold'&&job.work.deliver,`${job.id}: hold at each bug, one tap at the drop-off`);
  assert(job.lesson.length>120&&/footballer|squad|team/i.test(job.lesson),`${job.id}: a football lesson`);
  for(const b of list){assert(b.note.length>60&&b.hint.length>8,'each bug has a hint and a catch note');assert(/^#[0-9a-f]{6}$/i.test(b.color));
   assert(!/\b(sting|kill|squash|hurt|die|dead)\b/i.test(b.note+b.hint),'friendly copy: no stings, no harm');}}
 const positions=['goalkeeper','defender','midfielder','winger','captain','striker','referee'];
 for(const w of positions)assert(B.BUG_SQUAD.some(b=>(b.hint+b.note).toLowerCase().includes(w)),`the squad has a ${w}`);
 assert(B.BUG_SQUAD.some(b=>/pentagon/i.test(b.note)),'the Football Butterfly has a football\'s pentagons');
 for(const call of ['Man on!','Time!','Turn!'])assert(B.FIREFLY_CALLS.some(f=>f.note.includes(call)),`a firefly teaches "${call}"`);
 assert(/let.{0,20}go|release/i.test(day.intro)&&/fly free/i.test(night.intro),'bugs are let go, never kept');
 assert(/Law 5/.test(B.BUG_SQUAD.find(b=>/Referee/.test(b.hint)).note),'the referee bug cites Law 5');}

// ---- 2. On the real island: walkable, clear of colliders, gentle slopes, apart from the other signs ----
{const world=load('lib/town/world.ts').buildTown(new T.Scene());
 const gap=(q,o)=>Math.hypot(Math.max(0,Math.abs(q.x-o.x)-o.w/2),Math.max(0,Math.abs(q.z-o.z)-o.d/2));
 assert(world.obstacles.length>100,'the real obstacles');
 for(const job of [day,night])for(const [q,what] of [[job.board,'sign'],[job.deliver,job.deliver.label],...job.targets.map((t,i)=>[t,`spot ${i}`])]){
  assert(SI.onSummitIsle(q.x,q.z),`${job.id} ${what} (${q.x}, ${q.z}) is on walkable Summit Isle ground`);
  assert(SI.summitSlope(q.x,q.z)<.5,`${job.id} ${what}: a gentle slope (${SI.summitSlope(q.x,q.z).toFixed(2)})`);
  const clear=Math.min(...world.obstacles.map(o=>gap(q,o)));assert(clear>=1.6,`${job.id} ${what} (${q.x}, ${q.z}) is ≥ 1.6 m from every collider (${clear.toFixed(2)})`);
  assert(!R.outsideJobArea(job,q.x,q.z),`${job.id} ${what} is inside the job area`);}
 for(const t of [...day.targets,...night.targets])assert(Math.hypot(t.x-day.board.x,t.z-day.board.z)<70,'every bug is within a short walk of the signs');
 const trail=C.jobById('trail-cleanup');for(const j of [day,night])assert(Math.hypot(j.board.x-trail.board.x,j.board.z-trail.board.z)>2*C.BOARD_RANGE,'clear of the Trail clean-up sign');}

// ---- 3. Day and night ----
{same(['day','sunset','night'].map(t=>C.jobOpenAt(day,t)),[true,true,false]);same(['day','sunset','night'].map(t=>C.jobOpenAt(night,t)),[false,false,true]);
 assert(C.jobOpenAt(C.jobById('trail-cleanup'),'night'),'the other jobs run at any time');
 assert.match(C.jobClosedNote(day),/night/i);assert.match(C.jobClosedNote(night),/only come out at night/);}

// ---- 4. A whole shift on the real job scene ----
const S=load('lib/town/jobs/jobScene.ts'),DT=1/30;let tod='night';
const api=S.createJobScene(new T.Scene(),{storage:null,now:()=>Date.parse('2026-10-20T10:00:00'),timeOfDay:()=>tod});
const at=q=>({x:q.x,y:floor(q.x,q.z),z:q.z}),frames=(p,s)=>{for(let t=0;t<s-1e-9;t+=DT)api.update(DT,p,null,true,true,false);};
{const kids=api.root.children.length;
 frames(at(day.board),.5);assert.equal(api.getView().near,'bug-scout','the sign still offers at night (the card says when)');
 assert.equal(api.isOpen('bug-scout'),false);assert.equal(api.start('bug-scout'),false,'no day bugs at night');assert.equal(api.root.children.length,kids,'nothing built');
 assert.equal(api.isOpen('firefly-floodlights'),true);
 tod='day';assert.equal(api.start('firefly-floodlights'),false,'no fireflies in the day');assert.equal(api.start('bug-scout'),true,'Bug squad starts by day');
 const props=api.root.getObjectByName('job-props-bug-scout'),bugs=props.children.find(o=>o.isInstancedMesh&&o.count===8);assert(bugs,'one instanced draw of the eight bugs');
 assert(props.getObjectByName('job-net')&&props.getObjectByName('job-jar'),'a net and a jar');
 const v0=bugs.instanceMatrix.version;frames(at(day.board),.2);assert(bugs.instanceMatrix.version>v0,'the bugs flutter while the shift runs');
 const hold=(i,q)=>{frames(at(q),2.2);assert.equal(api.run.at,i,`at bug ${i}`);assert(api.getView().active.hint.includes(day.spotHints[i].slice(0,12)),'the panel names the bug '+i+': '+api.getView().active.hint);
  api.act('net');frames(at(q),1);api.act('net:up');assert.equal(api.run.got[i],true,`bug ${i} drifted into the jar`);};
 day.targets.forEach((q,i)=>hold(i,q));
 assert.equal(api.run.phase,'deliver','all eight: off to the bug hotel');
 frames(at(day.deliver),.2);api.act('letfree');frames(at(day.deliver),1.5);
 const done=api.getView().done;assert(done&&done.id==='bug-scout','the shift is done (payday)');
 assert.equal(api.root.getObjectByName('job-props-bug-scout'),undefined,'the props are disposed after the release');
 // Night: start, catch one, then the player switches to Day: the shift ends (the fireflies go home at daybreak).
 tod='night';api.dismissDone();frames(at(night.board),.5);assert.equal(api.start('firefly-floodlights'),true);
 const ff=api.root.getObjectByName('job-props-firefly-floodlights');assert(ff.getObjectByName('firefly-glow'),'each firefly glows');
 frames(at(night.targets[0]),.15);api.act('jar');frames(at(night.targets[0]),1);api.act('jar:up');assert.equal(api.run.got[0],true);
 tod='day';frames(at(night.targets[0]),.4);assert.equal(api.run,null,'switching to Day ends the firefly shift');
 frames(at(night.board),1.5);assert.equal(api.root.getObjectByName('job-props-firefly-floodlights'),undefined,'and its props are gone');
 api.dispose();}

// ---- 5. Pay, buttons, poses, analytics, admin ----
{for(const j of [day,night]){assert.equal(E.JOB_BASE_PAY[j.id],5,'pays 5, like Trail clean-up');assert(E.JOB_IDS.includes(j.id));
  const [lo,hi]=load('lib/economy.ts').JOB_PAY_BAND;assert(E.JOB_BASE_PAY[j.id]>=lo&&E.JOB_BASE_PAY[j.id]<=hi);
  let l=E.emptyJobLedger('2026-10-20');const p=[];for(let i=0;i<6;i++){const x=E.jobPayout(j.id,l);p.push(x.coins);l=E.recordCompletion(l,j.id,x.coins,60);}
  same(p,[9,5,3,3,1,1],'first-time bonus, full, half, half, then 1-coin tips: metered like every job');
  assert(M.JOB_SLOTS[j.id]&&M.JOB_SLOTS[j.id].length===2,'own buttons');assert(M.poseForEvent(j,{type:'collect',index:0}),'a catch pose');assert.equal(M.poseForEvent(j,{type:'deliver'}).kind,'toss');}
 const icons=read('components/TravelIcon.tsx');for(const k of ['net','jar','release'])assert(new RegExp(`\\n ${k}:'`).test(icons),`icon ${k}`);
 const CID=load('lib/analytics/countIds.ts'),ev=read('lib/analytics/summitEvents.ts'),admin=read('app/admin/SummitKitSection.tsx');
 for(const id of ['su:bug_catch','su:bug_squad','su:firefly_catch','su:firefly_shift']){assert(CID.isCountId(id),'allowlisted '+id);assert(ev.includes(`'${id}'`),'a call site for '+id);assert(admin.includes(`'${id}'`),'shown in /admin: '+id);}
 const scene=read('lib/town/jobs/jobScene.ts');assert.match(scene,/countBugCatch\(def\.prop\)/);assert.match(scene,/countBugShift\(def\.prop\)/);
 assert.match(read('components/Town.tsx'),/createJobScene\(scene,\{timeOfDay:\(\)=>timeRef\.current\}\)/,'Town passes its time of day');
 assert.match(read('components/IslandJobs.tsx'),/jobClosedNote\(introJob\)/,'the intro card says when to come back');}
console.log('PASS summit bugs: Bug squad (8 football-position bugs, day) and Firefly floodlights (8 football calls, night) on Summit Isle, day/night gated, a full shift played and disposed, paid 5 and metered, analytics shown in /admin');
function same(a,b,m){assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),m);}
})().catch(e=>{console.error(e);process.exit(1);});
