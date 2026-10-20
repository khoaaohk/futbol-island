// Summit Isle's Bug squad (Oct 20 2026, user: "add new jobs on the mountain island. catching butterflies and other bugs ... for
// nighttime add catching fireflies"; merged the same day: "don't have two separate jobs, the bug squad changes to catching the
// fireflies if switching to night mode"; moved: "place the bug job at the top of the mountain on the south west end"; and "release
// bugs doesn't work ... zoom in on the main character releasing all the bugs and then zoom out"). Headless, on the real island:
//  1. the data: ONE job (bug-scout) with two target sets from the roster getter (bugs by Day / Sunset, fireflies at Night), each
//     teaching football; the old firefly-floodlights id resolves to it;
//  2. the sign and both drop-offs on the flat south-west corner of the summit, every spot walkable and clear of colliders;
//  3. a whole shift on the real job scene: catch some bugs, switch to Night (the set swaps, the shift goes on, progress is kept per
//     set), back to Day, finish, Net down / Net up, then the release cinematic (camera in and out, controls held, then payday);
//     skipping it, quitting mid-cinematic and reduced motion are safe;
//  5. pay unchanged (5, metered), the ledger migration of the old id, buttons (the net toggle replaces On foot), poses, analytics.
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
const day=C.jobVariant('bug-scout','bugs'),night=C.jobVariant('bug-scout','fireflies');

// ---- 1. One job, two sets, data-driven ----
{assert(day&&night,'both sets resolve');assert.equal(C.JOBS.filter(j=>j.id==='bug-scout').length,1,'one catalog entry');
 assert(!C.JOBS.some(j=>j.id==='firefly-floodlights'),'no second job');assert.equal(C.jobById('firefly-floodlights')?.id,'bug-scout','the old id resolves to the merged job');
 assert.equal(C.canonicalJobId('firefly-floodlights'),'bug-scout');assert.equal(C.jobById('bug-scout'),day,'the catalog entry is the bugs set');
 same(['day','sunset','night'].map(B.activeSet),['bugs','bugs','fireflies']);
 same(['day','sunset','night'].map(t=>C.jobVariant('bug-scout',t).set),['bugs','bugs','fireflies'],'the variant follows the time of day');
 assert.equal(C.jobVariant('bug-scout','night'),night,'memoised');assert(C.jobOpenAt(day,'night')&&C.jobOpenAt(night,'day'),'always open: the set changes instead');
 assert.equal(day.title,'Bug squad');assert.match(night.title,/^Night squad/);assert.equal(day.board.x,night.board.x,'one sign');
 assert(day.nightNote&&/night/i.test(day.nightNote)&&/firefl/i.test(day.nightNote),'the card says it changes at night');
 for(const [job,set,prop] of [[day,'bugs','bug'],[night,'fireflies','firefly']]){const list=B.bugRoster(set);
  assert.equal(job.kind,'collect');assert.equal(job.prop,prop);assert.equal(job.id,'bug-scout');assert.equal(job.set,set);assert(!job.when,'no time gate');
  assert.equal(job.targets.length,list.length,'targets come from the roster getter (no fixed count)');assert.equal(job.spotHints.length,list.length);assert.equal(job.spotNotes.length,list.length);
  assert(job.deliver&&job.work.target.length===1&&job.work.target[0].mode==='hold'&&job.work.deliver,`${set}: hold at each, one tap at the drop-off`);
  assert(job.lesson.length>120&&/footballer|squad|team/i.test(job.lesson),`${set}: a football lesson`);
  for(const b of list){assert(b.note.length>60&&b.hint.length>8);assert(/^#[0-9a-f]{6}$/i.test(b.color));assert(!/\b(sting|kill|squash|hurt|die|dead)\b/i.test(b.note+b.hint),'friendly copy');}}
 for(const w of ['goalkeeper','defender','midfielder','winger','captain','striker','referee'])assert(B.BUG_SQUAD.some(b=>(b.hint+b.note).toLowerCase().includes(w)),`the squad has a ${w}`);
 for(const call of ['Man on!','Time!','Turn!'])assert(B.FIREFLY_CALLS.some(f=>f.note.includes(call)),`a firefly teaches "${call}"`);
 assert(/let.{0,20}go|release/i.test(day.intro)&&/fly free/i.test(night.intro),'bugs are let go, never kept');}

// ---- 2. The summit's south-west corner (north is -z, west is -x) ----
{const world=load('lib/town/world.ts').buildTown(new T.Scene()),P=SI.SUMMIT_PEAK,H=SI.TERRACE.h;
 const gap=(q,o)=>Math.hypot(Math.max(0,Math.abs(q.x-o.x)-o.w/2),Math.max(0,Math.abs(q.z-o.z)-o.d/2));
 for(const [q,what] of [[day.board,'sign'],[day.deliver,'bug hotel'],[night.deliver,'lantern goal']]){
  assert(q.x<P.x-15&&q.z>P.z+5,`${what} (${q.x}, ${q.z}) is on the summit's south-west end`);
  assert(floor(q.x,q.z)>H-1,`${what} is on top of the mountain (${(floor(q.x,q.z)-H).toFixed(2)} m from the terrace)`);
  assert(SI.summitSlope(q.x,q.z)<.2,`${what}: flat (${SI.summitSlope(q.x,q.z).toFixed(2)})`);}
 assert.equal(day.board.yaw,0,'the sign faces south, toward the trail arriving');assert(SI.summitTrailDistance(day.board.x+2,day.board.z+5)<6,'beside the trail');
 for(const job of [day,night])for(const [q,what] of [[job.board,'sign'],[job.deliver,job.deliver.label],...job.targets.map((t,i)=>[t,`spot ${i}`])]){
  assert(SI.onSummitIsle(q.x,q.z),`${job.set} ${what} on Summit Isle`);assert(SI.summitSlope(q.x,q.z)<.5,`${job.set} ${what}: gentle slope`);
  const clear=Math.min(...world.obstacles.map(o=>gap(q,o)));assert(clear>=1.6,`${job.set} ${what} (${q.x}, ${q.z}) ≥ 1.6 m from every collider (${clear.toFixed(2)})`);
  assert(!R.outsideJobArea(job,q.x,q.z));}
 // Bug homes are spread down the slopes (the content work's bands); the sign on the summit is the start and the finish.
 for(const t of [...day.targets,...night.targets])assert(Math.hypot(t.x-day.board.x,t.z-day.board.z)<140,'every bug within the job area walk');
 assert(Math.hypot(day.deliver.x-night.deliver.x,day.deliver.z-night.deliver.z)>2.5,'the two drop-offs apart');
 for(const j of C.JOBS)if(j.id!=='bug-scout')assert(Math.hypot(j.board.x-day.board.x,j.board.z-day.board.z)>2*C.BOARD_RANGE,'clear of '+j.id);}

// ---- 3. A whole shift on the real job scene ----
const S=load('lib/town/jobs/jobScene.ts'),DT=1/30;let tod='day',reduced=false;
const api=S.createJobScene(new T.Scene(),{storage:null,now:()=>Date.parse('2026-10-20T10:00:00'),timeOfDay:()=>tod});
const cam=new T.PerspectiveCamera(50,1.6,.1,500);
const at=q=>({x:q.x,y:floor(q.x,q.z),z:q.z}),frames=(p,s)=>{for(let t=0;t<s-1e-9;t+=DT){api.update(DT,p,null,true,true,reduced);cam.position.set(p.x,p.y+12,p.z+18);cam.lookAt(p.x,p.y,p.z);api.applyCamera(cam,DT,reduced);}};
const catchAt=(def,i,id)=>{frames(at(def.targets[i]),.2);assert.equal(api.run.at,i,`at ${def.set} ${i}`);api.act(id);frames(at(def.targets[i]),1);api.act(id+':up');assert.equal(api.run.got[i],true,`${def.set} ${i} in the jar`);};
{const kids=api.root.children.length;
 frames(at(day.board),.5);assert.equal(api.getView().near,'bug-scout','the one sign offers the job');assert.equal(api.variant('bug-scout'),day);
 tod='night';assert.equal(api.variant('bug-scout'),night,'the card shows the night set at night');tod='day';
 assert.equal(api.root.children.length,kids,'nothing built while idle');
 assert.equal(api.start('bug-scout'),true);const props=api.root.getObjectByName('job-props-bug-scout'),bugs=props.children.find(o=>o.isInstancedMesh&&o.count===day.targets.length);
 assert(bugs,'one instanced draw of the roster');assert(props.getObjectByName('job-net')&&props.getObjectByName('job-jar'),'a net and a jar');
 assert.equal(api.getView().active.title,'Bug squad');
 const v0=bugs.instanceMatrix.version;frames(at(day.board),.2);assert(bugs.instanceMatrix.version>v0,'the bugs flutter');
 for(const i of [0,1,2])catchAt(day,i,'net');
 // Net down / Net up (the ride slot): careful steps, calmer bugs; disabled outside the roaming phase.
 let btn=api.getView().active.buttons;assert.equal(btn.length,3);assert.equal(btn[2].slot,'ride');assert.equal(btn[2].id,'netlow');assert.equal(btn[2].key,'R');assert(btn[2].enabled);
 api.act('netlow');assert.equal(api.run.stalk,true);assert(api.walkScale<1&&api.walkScale>0,'Net down slows the walk');frames(at(day.board),.3);
 assert.equal(api.getView().active.buttons[2].id,'netup');api.act('netup');assert.equal(api.run.stalk,false);assert.equal(api.walkScale,1);
 // Night falls mid-shift: the set swaps, the shift goes on, the bugs fly off and the fireflies grow in.
 tod='night';frames(at(day.board),.4);assert(api.run,'the shift does NOT end');assert.equal(api.run.def.set,'fireflies');
 assert.equal(api.getView().active.title,night.title,'the panel title changes');assert.equal(api.getView().active.value,0,'the fireflies have their own progress');
 assert(api.root.getObjectByName('job-props-bug-scout').getObjectByName('firefly-glow'),'the fireflies glow');
 assert(api.root.children.some(o=>o.isInstancedMesh&&o.count===day.targets.length),'the old bugs fly off (fading)');frames(at(day.board),1);
 assert(!api.root.children.some(o=>o.isInstancedMesh&&o.parent===api.root&&o.count===day.targets.length),'and are disposed after the fade');
 catchAt(night,0,'jar');
 tod='day';frames(at(day.board),.4);assert.equal(api.run.def.set,'bugs');assert.equal(api.getView().active.value,3,'the bug squad progress was kept');
 for(let i=3;i<day.targets.length;i++)catchAt(day,i,'net');
 assert.equal(api.run.phase,'deliver','all caught: off to the bug hotel');
 // Regression (user: "release bugs doesn't work"): the Release button explains itself until you are at the hotel, and the hotel's
 // reach covers the patch around it.
 frames(at(day.board),.3);assert.equal(api.getView().active.buttons[1].enabled,false);assert.match(api.disabledHint('letfree'),/bug hotel/);
 const d=day.deliver;frames({x:d.x+2.2,y:floor(d.x+2.2,d.z),z:d.z},.3);assert.equal(api.getView().active.buttons[1].enabled,true,'armed within 2.8 m of the hotel');
 const fov=cam.fov,p0=at({x:d.x+2.2,z:d.z});
 api.act('letfree');assert.equal(api.getView().releasing,true,'the release cinematic starts');assert.equal(api.locked,true);assert.equal(api.walkScale,0,'controls held');
 frames(p0,1.2);assert(Math.hypot(cam.position.x-p0.x,cam.position.z-(p0.z+18))>3,'the camera moved in on the player');assert(api.run&&!api.getView().done,'not paid yet');
 const jar=api.root.getObjectByName('job-jar');assert(jar.visible&&jar.position.y>p0.y+1.5,'the jar is lifted over the head');
 frames(p0,3.8);const done=api.getView().done;assert(done&&done.id==='bug-scout'&&done.set==='bugs','payday after the cinematic');
 assert.equal(api.getView().releasing,false);assert.equal(api.locked,false);frames(p0,1.5);assert.equal(cam.fov,fov,'the camera is back');
 assert.equal(api.root.getObjectByName('job-props-bug-scout'),undefined,'props disposed');
 // Night shift: tap to skip; then quitting mid-cinematic; then reduced motion (a quick release, no camera).
 api.dismissDone();tod='night';frames(at(day.board),.3);assert.equal(api.start('bug-scout'),true);assert.equal(api.run.def.set,'fireflies');
 const fill=()=>{api.run.got=api.run.got.map(()=>true);api.run.phase='deliver';api.run.at=-1;};const g=night.deliver,pg=at(g);
 fill();frames(pg,.2);api.act('glow');assert.equal(api.getView().releasing,true);frames(pg,.5);api.skipRelease();
 assert(api.getView().done&&api.getView().done.set==='fireflies','skipping goes straight to payday');assert.equal(api.locked,false);frames(pg,1.5);assert.equal(cam.fov,fov);
 api.dismissDone();frames(at(day.board),.3);api.start('bug-scout');fill();frames(pg,.2);api.act('glow');frames(pg,1.6);api.quit();
 assert.equal(api.locked,false);assert.equal(api.getView().releasing,false);assert.equal(api.run,null);frames(pg,1.5);assert.equal(cam.fov,fov,'quitting mid-cinematic restores the camera');
 reduced=true;api.start('bug-scout');fill();frames(pg,.2);api.act('glow');assert(api.getView().done,'reduced motion: released at once');assert.equal(api.locked,false);reduced=false;
 api.dispose();}

// ---- 5. Pay, migration, buttons, poses, analytics, admin ----
{const j=day;assert.equal(E.JOB_BASE_PAY[j.id],5,'pays 5, like Trail clean-up');assert(E.JOB_IDS.includes(j.id));assert(!E.JOB_IDS.includes('firefly-floodlights'));
 const [lo,hi]=load('lib/economy.ts').JOB_PAY_BAND;assert(E.JOB_BASE_PAY[j.id]>=lo&&E.JOB_BASE_PAY[j.id]<=hi);
 let l=E.emptyJobLedger('2026-10-20');const p=[];for(let i=0;i<6;i++){const x=E.jobPayout(j.id,l);p.push(x.coins);l=E.recordCompletion(l,j.id,x.coins,60);}
 same(p,[9,5,3,3,1,1],'either set pays like one shift: first-time bonus, full, half, half, then tips');
 const old=E.sanitizeJobLedger({version:1,day:'2026-10-20',today:{'firefly-floodlights':2,'bug-scout':1},lifetime:{'firefly-floodlights':5,'bug-scout':3},best:{'firefly-floodlights':40,'bug-scout':55},earned:30},'2026-10-20');
 same([old.today['bug-scout'],old.lifetime['bug-scout'],old.best['bug-scout'],old.today['firefly-floodlights']],[3,8,40,undefined],'old firefly shifts fold into the Bug squad (no lost progress)');
 const only=E.sanitizeJobLedger({version:1,day:'2026-10-19',today:{'firefly-floodlights':2},lifetime:{'firefly-floodlights':4}},'2026-10-20');same([only.lifetime['bug-scout'],only.today['bug-scout']],[4,undefined]);
 assert.equal(M.JOB_SLOTS['bug-scout'].length,3,'net / jar, release, and the net toggle in the ride slot (no On foot button)');assert.equal(M.JOB_SLOTS['firefly-floodlights'],undefined);
 assert.equal(M.poseForEvent(day,{type:'collect',index:0}).kind,'scoop');assert.equal(M.poseForEvent(night,{type:'collect',index:0}).kind,'reachpick');assert.equal(M.poseForEvent(night,{type:'deliver'}).kind,'toss');
 const icons=read('components/TravelIcon.tsx');for(const k of ['net','jar','release','netlow','netup'])assert(new RegExp(`\\n ${k}:'`).test(icons),`icon ${k}`);
 const CID=load('lib/analytics/countIds.ts'),ev=read('lib/analytics/summitEvents.ts'),admin=read('app/admin/SummitKitSection.tsx');
 for(const id of ['su:bug_catch','su:bug_squad','su:firefly_catch','su:firefly_shift']){assert(CID.isCountId(id),'allowlisted '+id);assert(ev.includes(`'${id}'`),'a call site for '+id);assert(admin.includes(`'${id}'`),'shown in /admin: '+id);}
 assert.match(admin,/Bug squad job \(one job/);
 const scene=read('lib/town/jobs/jobScene.ts');assert.match(scene,/countBugCatch\(def\.prop\)/);assert.match(scene,/countBugShift\(def\.prop\)/);
 const town=read('components/Town.tsx');assert.match(town,/createJobScene\(scene,\{timeOfDay:\(\)=>timeRef\.current\}\)/,'Town passes its time of day');
 assert.match(town,/jobs\.walkScale/,'Town slows the walk for Net down and holds it in the cinematic');assert.match(town,/jobs\.locked/);assert.match(town,/jobs\.disabledHint\(b\.id\)/,'a tapped unarmed button explains itself');
 const ij=read('components/IslandJobs.tsx');assert.match(ij,/introJob\.nightNote/,'the card says it changes at night');assert.match(ij,/skipRelease/,'tap to skip');
 assert.match(ij,/onClick=\{e=>\{if\(e\.detail===0\)runtime\?\.skipRelease\(\);\}\}/,'regression: the Release tap\'s own trailing click must not skip the cinematic (the overlay appears under the finger)');}
console.log('PASS summit bugs: one Bug squad job (bugs by day, fireflies at night, data-driven sets, old id aliased) on the summit\'s south-west corner, set swap mid-shift with progress per set, Net down/up, the release cinematic (skip, quit, reduced motion), paid 5 and metered, ledger migrated, analytics shown in /admin');
function same(a,b,m){assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),m);}
})().catch(e=>{console.error(e);process.exit(1);});
