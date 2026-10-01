// Island jobs, Community Garden and farmers-market economy (docs/island-jobs.md).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..');
/** Values from the vm realm compare structurally. */
const same=(a,b,m)=>assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),m);
function environment(shared){
 const data=shared??new Map(),cache=new Map();
 const localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
 const context=vm.createContext({console,Set,Map,Date,Math,JSON,Promise,queueMicrotask,localStorage});
 function load(name){
  let file=path.resolve(base,name);if(!fs.existsSync(file))for(const ext of ['.ts','.tsx'])if(fs.existsSync(file+ext)){file+=ext;break;}
  if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,resolveJsonModule:true,esModuleInterop:true}}).outputText;
  const req=spec=>{if(spec.startsWith('.')){const target=path.relative(base,path.resolve(path.dirname(file),spec));if(spec.endsWith('.json'))return JSON.parse(fs.readFileSync(path.resolve(base,target),'utf8'));return load(target);}if(spec==='three')return require('three');throw Error('unexpected import '+spec+' in '+name);};
  vm.runInContext(`(function(exports,require,module){${code}\n})`,context)(mod.exports,req,mod);cache.set(file,mod.exports);return mod.exports;
 }
 return {load,data};
}
(async()=>{
 const env=environment(),E=env.load('lib/town/jobs/jobEconomy.ts');
 // ---- Pay rules ----
 const {JOB_IDS,JOB_BASE_PAY,STARTER_COINS,FIRST_JOB_BONUS,FULL_PAY_PER_DAY,HALF_PAY_PER_DAY,TIP_COINS}=E;
 assert.equal(STARTER_COINS,40,'starter buys exactly one 40-coin pack (user, Sep 27 2026; economy pass 28 Sep 2026)');
 same([0,1,2,3,4,5,9].map(E.payTier),['full','full','half','half','tip','tip','tip']);
 const day='2026-09-27';let ledger=E.emptyJobLedger(day);
 const first=E.jobPayout('leaf-rake',ledger);same(first,{coins:JOB_BASE_PAY['leaf-rake']+FIRST_JOB_BONUS,tier:'full',bonus:FIRST_JOB_BONUS});
 const pays=[];for(let i=0;i<6;i++){const p=E.jobPayout('ball-kid',ledger);pays.push(p.coins);ledger=E.recordCompletion(ledger,'ball-kid',p.coins,30-i);}
 same(pays,[14,10,5,5,1,1],'first-time bonus, full, half, half, then 1-coin tips');
 assert.equal(ledger.today['ball-kid'],6);assert.equal(ledger.best['ball-kid'],25,'best time is the fastest shift');
 assert.match(E.payMessage('ball-kid',ledger),/Come back tomorrow/);assert.doesNotMatch(E.payMessage('ball-kid',ledger),/lose|streak|hurry/i);
 const tomorrow=E.sanitizeJobLedger(JSON.parse(JSON.stringify(ledger)),'2026-09-28');
 assert.equal(tomorrow.today['ball-kid'],undefined,'soft cap resets the next day');assert.equal(tomorrow.lifetime['ball-kid'],6);
 assert.equal(E.jobPayout('ball-kid',tomorrow).coins,JOB_BASE_PAY['ball-kid'],'no second first-time bonus');
 for(const junk of [null,1,'x',{today:{'leaf-rake':-4,'fake':3},earned:'9',starter:'yes'}]){const s=E.sanitizeJobLedger(junk,day);assert.equal(s.earned,0);assert.equal(s.starter,false);assert.equal(Object.keys(s.today).length,0);}
 same(E.splitCredit(25,20),[20,5]);same(E.splitCredit(7,20),[7]);same(E.splitCredit(0,20),[]);
 // Daily ceiling: a player who does every job 4 times earns a bounded amount.
 let all=E.emptyJobLedger(day),total=0;for(const id of JOB_IDS)for(let i=0;i<FULL_PAY_PER_DAY+HALF_PAY_PER_DAY;i++){const p=E.jobPayout(id,all);total+=p.coins;all=E.recordCompletion(all,id,p.coins,40);}
 assert(total<=JOB_IDS.length*34&&total>=JOB_IDS.length*20,`full + half pay across all jobs stays bounded (${total})`);
 for(const id of JOB_IDS)if(id!=='wall-rebounds')assert(JOB_BASE_PAY[id]>=7&&JOB_BASE_PAY[id]<=10,`${id} pays inside the 7–10 coin band`);
 // Wall rebounds (30 Sep 2026, user-approved): 50 passes + 15 shots (~3.5 min) pays 26, so its coins per minute sit at the middle
 // of the other jobs instead of the bottom (it paid 8: ~2 a minute). Same tiers: half pay 13, then the 1-coin tip.
 {assert.equal(JOB_BASE_PAY['wall-rebounds'],26,'Wall rebounds pays 26');assert.equal(E.JOB_MINUTES['wall-rebounds'],3.5);
  const rate=E.jobCoinsPerMinute,others=JOB_IDS.filter(id=>id!=='wall-rebounds').map(rate).sort((a,b)=>a-b),h=others.length>>1,mid=others.length%2?others[h]:(others[h-1]+others[h])/2;
  assert.equal(others.length,11,'ten short jobs + the Garden shift (30 Sep 2026)');assert(Math.abs(rate('wall-rebounds')-mid)/mid<=.1,`wall rebounds ${rate('wall-rebounds').toFixed(2)} coins/min is within 10% of the other jobs' median ${mid.toFixed(2)}`);
  assert(rate('wall-rebounds')>others[0]&&rate('wall-rebounds')<others[others.length-1],'neither the lowest nor the highest per minute');
  assert(8/E.jobShiftMinutes('wall-rebounds')<others[0],'the old pay (8) was the lowest per minute: the reason for the raise');
  const short=JOB_IDS.filter(id=>id!=='wall-rebounds').map(E.jobShiftMinutes);assert(Math.abs(short.reduce((a,b)=>a+b,0)/short.length-1.5)<.05,'the short jobs still average 1.5 min a shift (the sim assumption)');
  let w=E.emptyJobLedger(day);const wall=[];for(let i=0;i<6;i++){const p=E.jobPayout('wall-rebounds',w);wall.push(p.coins);w=E.recordCompletion(w,'wall-rebounds',p.coins,210);}
  same(wall,[30,26,13,13,1,1],'first-time bonus, full, half, half, then 1-coin tips (rules unchanged)');
  same(E.splitCredit(30,20),[20,10],'a 30-coin payday credits in two wallet runs');}

 // ---- Wallet integration: the real arcade wallet core with in-memory ports ----
 const core=env.load('lib/arcade/arcadeWalletCore.ts');let saved=null,idn=0;
 const arcade=core.createArcadeWallet({read:()=>saved,write:v=>{saved=JSON.parse(JSON.stringify(v));},lock:fn=>Promise.resolve().then(fn),valid:new Set(['A','B','C','D','E','F','G','H']),grant:()=>true,notify:()=>{},now:()=>Date.parse('2026-09-27T10:00:00'),id:()=>'id'+(++idn),random:()=>0});
 let clock=Date.parse('2026-09-27T10:00:00');
 const W=env.load('lib/town/jobs/jobWallet.ts');
 const wallet=W.createJobWallet({creditRun:(id,game,target,reason)=>arcade.creditRun(id,game,target,reason),balance:()=>arcade.load().balance,caps:core.ARCADE_COIN_CAPS,now:()=>clock});
 assert.equal(wallet.source(),'island' in core.ARCADE_COIN_CAPS?'island':'live');
 assert.equal(await wallet.grantStarter(),STARTER_COINS);assert.equal(arcade.load().balance,STARTER_COINS);
 assert.equal(await wallet.grantStarter(),0,'starter grant is idempotent');
 env.data.delete(E.JOBS_STORAGE_KEY);assert.equal(await W.createJobWallet({creditRun:(i,g,t,r)=>arcade.creditRun(i,g,t,r),balance:()=>0,caps:core.ARCADE_COIN_CAPS,now:()=>clock}).grantStarter(),0,'even with a lost ledger, fixed run ids never pay twice');
 assert.equal(arcade.load().balance,STARTER_COINS);
 // A player who already has coins is not topped up, but is marked as welcomed.
 { const env2=environment(),W2=env2.load('lib/town/jobs/jobWallet.ts');let credits=0;const w2=W2.createJobWallet({creditRun:async()=>{credits++;return 1;},balance:()=>12,caps:{live:20},now:()=>clock});assert.equal(await w2.grantStarter(),0);assert.equal(credits,0);assert.equal(await w2.grantStarter(),0); }
 const paid=await wallet.payJob('leaf-rake','Rake the leaves',32);
 assert.equal(paid.coins,JOB_BASE_PAY['leaf-rake']+FIRST_JOB_BONUS);assert.equal(paid.credited,paid.coins);assert.equal(paid.balance,STARTER_COINS+paid.coins);
 const history=arcade.load().history.map(h=>h.reason);assert(history.some(r=>/Island job · Rake the leaves/.test(r)));assert(history.some(r=>/Welcome coins/.test(r)));
 // Deterministic run ids: replaying the same shift credit is a no-op in the wallet.
 assert.equal(await wallet.credit(`island-job:leaf-rake:${E.localDay(clock)}:1`,paid.coins-paid.bonus,'replay'),0);
 // First-time bonus is its own idempotent run: replaying it pays nothing, and it shows as its own history row.
 assert.equal(await wallet.credit('island-job-first:leaf-rake',paid.bonus,'replay'),0,'the first-shift bonus pays once');
 assert(arcade.load().history.some(h=>/First shift bonus · Rake the leaves/.test(h.reason)),'bonus row in the wallet history');
 // A job finished under the old scheme (lifetime > 0 in the ledger) never pays the bonus again.
 {const old=E.recordCompletion(E.emptyJobLedger(day),'ball-kid',14,30);assert.equal(E.jobPayout('ball-kid',old).bonus,0,'no second bonus after an old-scheme first shift');}
 // Job coins are spendable on the arcade's 40-coin card pack.
 const pack=await arcade.purchaseMysteryPack(3,['A','B'],['C','D','E','F']);assert.equal(pack.ok,true);assert.equal(arcade.load().balance,STARTER_COINS+paid.coins-40);
 clock+=86400e3;const nextDay=await wallet.payJob('leaf-rake','Rake the leaves',30);assert.equal(nextDay.coins,JOB_BASE_PAY['leaf-rake']);

 // ---- Each job completes (pure rules, walking to every goal) ----
 const C=env.load('lib/town/jobs/jobCatalog.ts'),R=env.load('lib/town/jobs/jobRules.ts'),V=env.load('lib/town/venues.ts');
 assert.equal(C.JOBS.length,JOB_IDS.length);same([...C.JOBS.map(j=>j.id)].sort(),[...JOB_IDS].sort(),'each job has exactly one definition');
 assert(C.JOBS.length>=9,'the Sep 27 jobs (offside flag, ball pump, goal anchors) are in the catalog');
 assert(!C.JOBS.some(j=>j.id==='kit-room'),'the kit room job was removed (user, Sep 29 2026)');
 // Set out the cones (Oct 1 2026, user): the session is on the grass beside the 9v9 pitch, not on it (a match is played there):
 // ≥ 1 m outside every pitch, off the east road and its sidewalk (x 190–202), ≥ 1.6 m from the touchline trees and lamp.
 {const cones=C.jobById('cone-setup'),club=V.venueById('9v9');assert.equal(cones.targets.length,8);
  for(const q of cones.targets){for(const v of V.VENUES)assert(Math.abs(q.x-v.x)>v.width/2+1||Math.abs(q.z-v.z)>v.length/2+1,`cone mark (${q.x}, ${q.z}) is ≥ 1 m outside the ${v.name} pitch`);
   assert(q.x>club.x+club.width/2+1&&q.x<=190-2,'on the east grass band, ≥ 2 m from the sidewalk');assert(q.z>club.z-club.length/2&&q.z<club.z+club.length/2,'beside the pitch (alongside the touchline)');
   for(const [x,z] of [[188,-82],[188,-104],[188,-125],[188,-145],[189,-85.5],[183.46,-72.93],[183.46,-147.07]])assert(Math.hypot(q.x-x,q.z-z)>=1.6+.3,`cone mark (${q.x}, ${q.z}) clears the obstacle at (${x}, ${z})`);}
  const gap=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),t=cones.targets;assert(Math.abs(gap(t[0],t[3])-10)<1e-9&&Math.abs(gap(t[0],t[1])-5)<1e-9,'a 10 × 5 m passing channel');
  assert.equal(gap(t[4],t[5]),2);assert.equal(gap(t[6],t[7]),2,'two 2 m dribbling gates');
  assert.match(cones.intro,/beside the pitch, so the match can keep going/);assert(Math.hypot(cones.board.x-t[4].x,cones.board.z-t[4].z)<8,'the sign stands by the session');
  for(const q of t)assert(!R.outsideJobArea(cones,q.x,q.z),'every mark is inside the job area');}
 // The Coral Cay Farm job (Sep 29 2026): 10 jobs in the catalog, a nutrition lesson with its source, pay in the 7–10 band.
 assert.equal(C.JOBS.length,12,'nine island jobs + Harvest day + Match-day snacks on Coral Cay + the Garden shift');
 {const snacks=C.jobById('match-day-snacks');assert(snacks&&snacks.kind==='sort'&&snacks.task.style==='crates'&&snacks.targets.length===3&&snacks.place==='The Farm, Coral Cay','Match-day snacks: sort six snacks into three crates');assert.match(snacks.lessonSource,/sportsdietitians/);assert.equal(JOB_BASE_PAY['match-day-snacks'],8);}
 {const farm=C.jobById('farm-harvest');assert(farm&&farm.kind==='harvest'&&farm.prop==='produce'&&farm.task.type==='harvest'&&farm.task.fruitGoal===5&&farm.task.vegGoal===5&&farm.deliver&&farm.deliver.label==='farm stand','Harvest day: shake 5 fruit and pull/pick/snip 5 veg, then unload at the farm stand');
  const goodsReg=env.load('lib/town/market/goods.ts');assert(farm.task.spots.every(sp=>goodsReg.goodById(sp.good)?.kind==='produce'),'every harvest crop is a sellable produce good');
  same([...new Set(farm.task.spots.map(sp=>sp.action))].sort(),['cut','pull','shake','twist'],'four physical actions: shake, pull, twist, snip');
  assert.equal(farm.task.spots.filter(sp=>sp.action==='shake').reduce((n,sp)=>n+sp.fruit,0),15,'15 ripe fruit hang on 5 trees (5 needed)');
  assert.equal(farm.task.spots.filter(sp=>sp.action!=='shake'&&sp.ripe!==false).length,farm.task.vegGoal,'exactly 5 ready veg; the green ones are decoys');
  assert.equal(farm.place,'The Farm, Coral Cay');assert.match(farm.lessonSource,/fifa\.com/);assert.match(farm.lesson,/carbohydrate/i);assert.match(farm.lesson,/water/i);assert.equal(JOB_BASE_PAY['farm-harvest'],8);
  assert.match(E.payMessage('farm-harvest',E.recordCompletion(E.recordCompletion(E.emptyJobLedger(day),'farm-harvest',8,30),'farm-harvest',8,30)),/The harvest is in/);}
 // Signs never crowd each other, the vending machines, the fishing posts or the Clubhouse doorway.
 const vend=[[89.5,-49],[11,-48],[132.8,-69.8],[96,115],[175.26,9],[73.8,-198.5],[434.41,-141.28],[549.5,-169],[665.62,-211.77],[526.1,-177.16],[73.1,-52.16],[74.91,-52.16],[527.91,-177.16]],fish=[[217,212.6],[63,212.6],[237.2,66],[60,-238],[-95.5,24]];
 for(const a of C.JOBS){for(const b of C.JOBS)if(a!==b)assert(Math.hypot(a.board.x-b.board.x,a.board.z-b.board.z)>2*C.BOARD_RANGE,`${a.id} and ${b.id} signs are apart`);
  for(const [x,z] of [...vend,...fish,[81.36,-52.8]])assert(Math.hypot(a.board.x-x,a.board.z-z)>C.BOARD_RANGE+3,`${a.id} sign is clear of (${x},${z})`);}
 /** Plays a Harvest day with its real actions: shake trees and pick up what falls, pull roots in the green, twist, snip. */
 function driveHarvest(job,run,events,floor){
  const pos=q=>({x:q.x,y:floor(q.x,q.z),z:q.z}),step=(q,dt=.1)=>{const ev=R.stepRun(run,pos(q),dt,floor);events.push(...ev);return ev;},press=id=>{const ev=R.runAction(run,id);events.push(...ev);return ev;};
  let guard=0,lastMiss=false;
  while(run.phase!=='done'&&guard++<4000){
   if(run.phase==='deliver'){step(job.deliver);same(R.runActions(run).map(a=>a.id),['unload'],'unload at the farm stand');press('unload');continue;}
   const h=run.harvest,goals=R.runGoals(run);assert(goals.length,'the harvest always has somewhere to go');
   if(h.ground.length){for(let k=0;k<12&&h.ground.length;k++)step(h.ground[0]);continue;}
   const g=goals[0];step(g);const a=R.runActions(run)[0];if(!a)continue;
   if(a.id==='kick'){const ev=press('kick');const miss=ev.some(e=>e.type==='miss');assert(!(miss&&lastMiss),'never two empty kicks in a row');lastMiss=miss;}
   else if(a.id==='pull'){press('pull');while(run.harvest.pull<.95)step(g,.05);press('pull:up');}
   else if(a.id==='twist')press('twist');
   else if(a.id==='cut'){press('cut');press('cut');}
  }
  return run.phase==='done';
 }
 for(const job of C.JOBS){
  assert(job.lesson.length>60&&job.intro&&job.howTo,`${job.id} teaches football`);assert(JOB_IDS.includes(job.id));
  const run=R.startRun(job),floor=(x,z)=>V.fieldSurfaceHeight(x,z);let guard=0,done=false,events=[];
  if(job.kind==='sort'){
   const walk=q=>events.push(...R.stepRun(run,{x:q.x,y:floor(q.x,q.z),z:q.z},.5,floor)),press=id=>{const ev=R.runAction(run,id);events.push(...ev);return ev;};
   const crates=job.task.style==='crates';
   assert.equal(R.runHint(run),crates?'Go to the harvest basket and take the first snack.':'Go to the kit hamper and take the first shirt.');
   for(let i=0;i<job.task.items.length;i++){const item=job.task.items[i];
    same(R.runGoals(run),[job.deliver],'snacks come from the basket');walk(job.deliver);
    assert.equal(run.carrying,-1,'nothing is taken without the action');same(R.runActions(run).map(a=>a.id),['take'],'one clear action at the basket');press('take');assert.equal(run.carrying,i);
    assert.equal(R.runGoals(run).length,0,'no arrow while carrying: read the clue first');assert.match(R.runHint(run),new RegExp(item.label));
    if(i===0){const wrongSlot=(item.slot+1)%job.targets.length;walk(job.targets[wrongSlot]);same(R.runActions(run).map(a=>a.id),['drop']);const ev=press('drop');assert(ev.some(e=>e.type==='wrong'),'a wrong crate explains');assert.equal(run.carrying,0,'the snack stays in your hands');same(R.runGoals(run),[job.targets[item.slot]],'after one wrong try the arrow shows the right crate');}
    walk(job.targets[item.slot]);assert.equal(run.step,i);press('drop');assert.equal(run.step,i+1);}
   done=run.phase==='done';
   same(job.task.items.map(it=>[it.label,job.task.slots[it.slot]]),[['Rice bowl','PRE-MATCH MEAL'],['Orange slices','HALF-TIME'],['Yoghurt and fruit','RECOVERY'],['Banana','PRE-MATCH MEAL'],['Water bottle','HALF-TIME'],['Watermelon','RECOVERY']],'snacks sorted by when they fuel a match');
   assert(job.task.items.every(it=>it.clue.startsWith(it.label)&&it.clue.length>50),'each snack has a clue');assert.match(run.note,/goes in the recovery crate!/);
  }else if(job.kind==='harvest'){done=driveHarvest(job,run,events,floor);
  }else if(job.kind==='offside'){
   const O=env.load('lib/town/jobs/offsideClips.ts');
   // Every clip's answer matches Law 11 computed from the positions at the moment of the pass.
   for(const clip of O.OFFSIDE_CLIPS){const law=O.offsideAtPass(clip);assert.equal(law.offside,clip.flag,`${clip.id}: Law 11 says ${law.offside?'offside':'onside'}`);assert(clip.why.length>40);
    for(const a of clip.actors)for(const [,aa,ss] of a.keys){const w=O.toWorld(aa,ss);assert(ss>=0&&ss<=O.OFFSIDE_PITCH.width&&aa>=O.OFFSIDE_PITCH.ownA&&aa<=O.OFFSIDE_PITCH.goalA,`${clip.id} stays on the strip`);assert(w.z<3.85,'strip is clear of the buildings south of it');}}
   same(O.OFFSIDE_CLIPS.map(c=>c.id),['level','beyond','timed-run','own-half','one-step']);
   assert.equal(O.offsideAtPass(O.OFFSIDE_CLIPS[0]).receiverA,O.offsideAtPass(O.OFFSIDE_CLIPS[0]).lineA,'replay 1 is exactly level');
   assert(O.offsideAtPass(O.OFFSIDE_CLIPS[2]).receiverA<O.offsideAtPass(O.OFFSIDE_CLIPS[2]).lineA&&O.actorAt(O.OFFSIDE_CLIPS[2].actors[1],2.4).a>O.offsideAtPass(O.OFFSIDE_CLIPS[2]).lineA,'replay 3 runs past only after the pass');
   assert(!O.offsideAtPass(O.OFFSIDE_CLIPS[3]).inOpponentsHalf,'replay 4 starts in its own half');
   same(R.runActions(run),[],'no buttons before reaching the touchline spot');
   events.push(...R.stepRun(run,{x:job.targets[0].x,y:floor(job.targets[0].x,job.targets[0].z),z:job.targets[0].z},.1,floor));assert.equal(run.phase,'watch');
   const clips=O.OFFSIDE_CLIPS;
   for(let i=0;i<clips.length;i++){let g=0;while(run.phase==='watch'&&g++<100)R.stepRun(run,{x:job.targets[0].x,y:0,z:job.targets[0].z},.1,floor);assert.equal(run.phase,'call');
    same(R.runActions(run).map(a=>a.id),['flag','play-on']);
    if(i===0){events.push(...R.runAction(run,clips[i].flag?'play-on':'flag'));assert.equal(run.right,false);assert.equal(R.runProgress(run).value,0,'a wrong call is not counted');assert.match(run.note,/^Not quite/);same(R.runActions(run).map(a=>a.label),['Watch again']);events.push(...R.runAction(run,'next'));assert.equal(run.step,0,'a wrong call replays the same clip, no penalty');g=0;while(run.phase==='watch'&&g++<100)R.stepRun(run,{x:0,y:0,z:0},.1,floor);}
    events.push(...R.runAction(run,clips[i].flag?'flag':'play-on'));assert.equal(run.right,true);assert.equal(run.phase,'explain');
    assert.equal(R.runProgress(run).value,i+1,'a right call counts immediately, before Next replay');events.push(...R.runAction(run,'next'));
    if(i<clips.length-1)assert.equal(R.runProgress(run).value,i+1,'the count holds on the next replay');}
   same(R.runProgress(run),{value:5,total:5},'end total = five right calls (the wrong call was retried, not counted)');
   done=run.phase==='done';
  }else if(job.kind==='pump'){
   // Oct 1 2026 (user): many small strokes, harder ball by ball, a gentle leak, Ready only in the green, no fail state.
   const t=job.task,balls=t.balls,stand={x:job.targets[0].x,y:floor(job.targets[0].x,job.targets[0].z),z:job.targets[0].z};same([t.min,t.max],[.6,1.1],'Law 2: 0.6–1.1 atmospheres');
   assert.equal(balls.length,5,'five balls');assert.match(job.lesson,/0\.6–1\.1 atmospheres at sea level/);assert.match(R.PUMP_TIP,/0\.6–1\.1 atm at sea level/);
   const taps=balls.map(b=>Math.ceil((b.min-b.start)/b.step-1e-6)),width=balls.map(b=>b.max-b.min);
   same(taps,[8,11,16,19,24],'strokes to the green per ball');assert(taps[0]>=8&&taps[0]<=10&&taps[4]>=20&&taps[4]<=25,'ball 1 ~8–10 strokes, ball 5 ~20–25');
   for(let i=1;i<balls.length;i++){assert(taps[i]>taps[i-1],`ball ${i+1} needs more strokes than ball ${i}`);assert(width[i]<width[i-1]-1e-9,`ball ${i+1}'s green zone is narrower`);assert(balls[i].leak>=balls[i-1].leak,'the leak never gets gentler');}
   for(const b of balls){assert(b.min>=t.min-1e-9&&b.max<=t.max+1e-9,'every green zone sits inside the Law 2 range');assert(b.start<b.min&&b.leak>0&&b.leak<=.1,'soft to start; a gentle leak');assert(b.max-b.min>=4*b.step,'the green is several strokes wide: no pixel-perfect tapping');}
   same([balls[0].min,balls[0].max,balls[4].min,balls[4].max],[.6,1.1,.75,.95],'0.6–1.1 narrows to 0.75–0.95 by ball 5');
   events.push(...R.stepRun(run,stand,.1,floor));assert.equal(run.phase,'pump');
   same(env.load('lib/town/jobs/jobMoves.ts').jobButtons(run).map(b=>[b.id,b.enabled]),[['pump',true],['release',true],['ready',true]],'Pump · Air out · Ready');
   R.runAction(run,'ready');assert.equal(run.step,0,'a soft ball is not accepted');assert.match(run.note,/too soft/);
   // One stroke adds only a little; the hint counts the strokes left and teaches Law 2.
   const p0=run.pressure;events.push(...R.runAction(run,'pump'));assert(Math.abs(run.pressure-p0-balls[0].step)<1e-9,'a stroke adds one small step');
   assert.equal(R.pumpTapsLeft(run),7);run.note='';assert.match(R.runHint(run),/Ball 1 of 5: keep tapping Pump, about 7 more strokes\. Law 2/);
   // The leak: nothing while tapping (inside the delay), then a gentle seep, never below the ball's start.
   const p1=run.pressure;R.stepRun(run,stand,t.leakDelay*.5,floor);assert.equal(run.pressure,p1,'no leak right after a stroke');
   for(let k=0;k<6;k++)R.stepRun(run,stand,.1,floor);assert(run.pressure<p1&&run.pressure>p1-balls[0].leak*.6,'air seeps back slowly once you stop');
   for(let k=0;k<200;k++)R.stepRun(run,stand,.1,floor);assert.equal(run.pressure,balls[0].start,'never below the start');
   const pumpBall=()=>{let n=0;while(run.pressure<R.pumpBall(run).min&&n<200){events.push(...R.runAction(run,'pump'));R.stepRun(run,stand,.05,floor);n++;}return n;};
   const used=[];
   for(let b=0;b<balls.length;b++){const B=balls[b];assert.equal(run.step,b);assert.equal(run.pressure,B.start,`ball ${b+1} starts soft`);
    const n=pumpBall();used.push(n);assert.equal(n,taps[b],`ball ${b+1}: ${taps[b]} quick strokes (no leak while tapping)`);
    assert(run.pressure>=B.min&&run.pressure<=B.max);
    if(b===0){// Over-pumping: past the zone it squeaks/hisses once (stage 1), Ready says too hard, the leak does not fix it: Let air out does.
     let crossed=0;while(run.pressure<=B.max){crossed+=R.runAction(run,'pump').filter(e=>e.type==='pump'&&e.stage===1).length;}assert.equal(crossed,1,'one hiss on crossing into too hard');
     R.runAction(run,'ready');assert.equal(run.step,0,'too hard is not accepted');assert.match(run.note,/too hard/);
     const hi=run.pressure;for(let k=0;k<30;k++)R.stepRun(run,stand,.1,floor);assert.equal(run.pressure,hi,'an over-pumped ball does not leak down by itself');
     while(run.pressure>B.max)R.runAction(run,'release');if(run.pressure<B.min)pumpBall();}
    if(b===4){// In the green, then wait: it leaks out of the zone, Ready is refused, a few strokes bring it back.
     for(let k=0;k<24;k++)R.stepRun(run,stand,.1,floor);assert(run.pressure>=B.min,'in the green it holds for 2.5 s: time to press Ready');
     for(let k=0;k<80&&run.pressure>=B.min;k++)R.stepRun(run,stand,.1,floor);assert(run.pressure<B.min,'then the leak can drop it out of the green');assert.match(run.note,/seeping out/);
     R.runAction(run,'ready');assert.equal(run.step,4,'Ready only counts inside the zone');pumpBall();}
    assert.match(R.runHint(run),/green zone/);events.push(...R.runAction(run,'ready'));assert.equal(run.step,b+1);
    if(b<4)assert.match(run.note,/narrower now/);}
   assert(used[4]>=2*used[0],'the last ball takes far more strokes than the first');
   done=run.phase==='done';same(R.runProgress(run),{value:5,total:5});
  }else if(job.kind==='rebound'){
   same(R.reboundEvent(run,'shot'),[],'shots only count after the wall passes');
   for(let i=0;i<C.REBOUND_WALL.passes;i++)events.push(...R.reboundEvent(run,'pass'));assert.equal(run.phase,'shots');
   assert(R.hitsReboundTarget(156.5,.9,-29.2));assert(!R.hitsReboundTarget(150,.9,-29.2),'the quest frame is not the target');assert(!R.hitsReboundTarget(156,2.6,-29.2),'over the target');
   assert(R.onReboundWall({x:150,z:-29.3}));assert(!R.onReboundWall({x:100,z:-29.3}));
   // Sep 30 2026 (user): 50 wall passes, then 15 target shots, each from a glowing circle that moves after every attempt.
   assert.equal(C.REBOUND_WALL.passes,50);assert.equal(C.REBOUND_WALL.shots,15);const S=C.REBOUND_WALL.spot,t=C.REBOUND_WALL.target;
   const inArc=q=>{const d=Math.hypot(q.x-t.x,q.z-C.REBOUND_WALL.face),a=Math.abs(Math.atan2(q.x-t.x,q.z-C.REBOUND_WALL.face));return d>=S.min-1e-6&&d<=S.max+1e-6&&a<=S.arc+1e-6&&S.avoid.every(n=>Math.hypot(q.x-n.x,q.z-n.z)>=S.clear)&&q.x>=S.lawn.x0&&q.x<=S.lawn.x1&&q.z>=S.lawn.z0&&q.z<=S.lawn.z1;};
   assert(run.spot&&inArc(run.spot),'the first circle is in the 6–14 m arc on the lawn');same(R.runGoals(run),[run.spot],'the arrow points at the circle');
   // From outside the circle: a target hit does not count and says why; the circle stays.
   {const s0={...run.spot};assert.equal(R.reboundShotStart(run,s0.x+S.radius+1,s0.z),false);same(R.reboundEvent(run,'shot'),[],'a shot from outside the circle does not count');assert.match(run.note,/Step into the glowing circle/);
    assert.equal(R.reboundShotEnd(run),false);same(run.spot,s0,'no attempt: the circle stays');}
   const seen=[];let missed=false;
   for(let i=0;i<C.REBOUND_WALL.shots;i++){const sp={...run.spot};seen.push(sp);assert(R.reboundShotStart(run,sp.x+.5,sp.z-.5),'inside the circle');
    if(i===2&&!missed){missed=true;assert(R.reboundShotEnd(run));assert.equal(run.shots,2,'a miss does not count');assert.match(run.note,/New angle: open your body/);assert(Math.hypot(run.spot.x-sp.x,run.spot.z-sp.z)>=S.minMove,'a miss moves the circle too');i--;continue;}
    events.push(...R.reboundEvent(run,'shot'));R.reboundShotEnd(run);
    if(run.phase!=='done'){assert(inArc(run.spot),'every circle is inside the arc');assert(Math.hypot(run.spot.x-sp.x,run.spot.z-sp.z)>=S.minMove,'never the same spot twice in a row');}}
   assert.equal(run.shots,15);assert(new Set(seen.map(q=>q.x.toFixed(1)+','+q.z.toFixed(1))).size>=12,'the circles vary: move and re-aim');
   done=run.phase==='done';
  }else{
   R.stepRun(run,{x:job.board.x,y:floor(job.board.x,job.board.z),z:job.board.z},.1,floor);
   if(job.kind==='trail'){const far=job.targets[5];assert.equal(R.stepRun(run,{x:far.x,y:floor(far.x,far.z),z:far.z},.1,floor).length,0,'trail dashes paint in order');}
   const at=q=>({x:q.x+.3,y:floor(q.x,q.z),z:q.z-.3});
   if(job.work){
    // Every job has an action now: standing on a target does nothing until the action is done.
    const g0=R.runGoals(run)[0],before=R.runProgress(run).value;for(let k=0;k<5;k++)R.stepRun(run,at(g0),.2,floor);
    assert.equal(R.runProgress(run).value,before,`${job.id}: walking onto the spot alone does not finish it`);assert(R.runActions(run).length===1,`${job.id}: one clear action button at the spot`);
    if(job.kind==='trail'){
     // The marker paints only while held: a dash walked with the marker up stays faded (a gap to come back for).
     const n0=run.next;R.stepRun(run,at(job.targets[n0]),.1,floor);assert.equal(run.next,n0,'marker up: no paint');assert.match(R.runHint(run),/Hold Paint/);
     same(R.runActions(run).map(a=>[a.id,a.hold]),[['paint',true]]);}
   }
   while(run.phase!=='done'&&guard++<3000){
    if(job.kind==='offside'&&run.phase==='call'){events.push(...R.runAction(run,R.offsideClip(run).flag?'flag':'play-on'));continue;}
    if(job.kind==='offside'&&run.phase==='explain'){events.push(...R.runAction(run,'next'));continue;}
    const g=R.runGoals(run)[0]??job.targets[0];assert(g,`${job.id} has an active target or action`);events.push(...R.stepRun(run,at(g),.1,floor));
    const a=R.runActions(run)[0];if(!a)continue;
    if(a.hold){events.push(...R.runAction(run,a.id));for(let k=0;k<30&&run.holding;k++)events.push(...R.stepRun(run,at(g),.1,floor));events.push(...R.runAction(run,a.id+':up'));}
    else events.push(...R.runAction(run,a.id));
   }
   done=run.phase==='done';
   const high=R.startRun(job),t=job.targets[0];assert.equal(R.stepRun(high,{x:t.x,y:floor(t.x,t.z)+20,z:t.z},.1,floor).length,0,'flying over a target does not collect it');
   // Per-job action checks.
   if(job.id==='leaf-rake'){assert(events.filter(e=>e.type==='step'&&e.stage===0).length===job.targets.length,'every pile is raked (hold) before it is bagged (tap)');assert(events.some(e=>e.type==='hold')&&events.some(e=>e.type==='deliver'));}
   if(job.id==='goal-anchor')assert.equal(events.filter(e=>e.type==='work').length,job.targets.length*3,'three hammer hits per peg');
   if(job.id==='ball-kid'){assert.equal(events.filter(e=>e.type==='pickup').length,job.targets.length);assert.equal(events.filter(e=>e.type==='return').length,job.targets.length,'each ball goes into the box once');
    // Oct 1 2026 (user): find the ball → Pick up → carry → put it in the ball box → the next ball; never thrown onto the pitch.
    const k=R.startRun(job),box=job.deliver,park=V.venueById('11v11'),seq=[],pos=q=>({x:q.x,y:floor(q.x,q.z),z:q.z});assert.equal(box.label,'ball box');
    for(let i=0;i<job.targets.length;i++){same(R.runGoals(k),[job.targets[i]],`one loose ball at a time: ball ${i+1}`);seq.push(...R.runAction(k,'box'));
     R.stepRun(k,pos(job.targets[(i+1)%job.targets.length]),.1,floor);if(i<job.targets.length-1)same(R.runActions(k),[],'another ball does not arm');
     R.stepRun(k,pos(job.targets[i]),.1,floor);same(R.runActions(k).map(x=>x.id),['pickup']);seq.push(...R.runAction(k,'pickup'));same(R.runGoals(k),[box],'carrying: the arrow points at the box');
     seq.push(...R.runAction(k,'pickup'));assert.equal(seq.filter(e=>e.type==='pickup').length,i+1,'no double pick-up');
     R.stepRun(k,pos(box),.1,floor);same(R.runActions(k).map(x=>[x.id,x.label]),[['box','Put it in the ball box']]);seq.push(...R.runAction(k,'box'),...R.runAction(k,'box'));
     assert.equal(seq.filter(e=>e.type==='return').length,i+1,'one return per ball, however fast you tap');assert.equal(k.carrying,-1);}
    assert.equal(k.phase,'done');const JMk=env.load('lib/town/jobs/jobMoves.ts');same(JMk.poseForEvent(job,{type:'return',index:0}),{kind:'drop',at:'deliver'},'the ball is set in the box (no throw onto the pitch)');
    same(JMk.JOB_SLOTS['ball-kid'].map(x=>x.ids[0]),['box','pickup']);assert.doesNotMatch(job.intro+job.howTo,/throw/i);
    for(const q of [...job.targets,box])assert(Math.abs(q.x-park.x)>park.width/2+3||Math.abs(q.z-park.z)>park.length/2+3,`(${q.x}, ${q.z}) lies ≥ 3 m outside the 11v11 pitch`);}
   if(job.id==='court-cleanup'||job.id==='cone-setup')assert.equal(events.filter(e=>e.type==='collect').length,job.targets.length);
  }
  assert(done,`${job.id} completes`);assert(events.some(e=>e.type==='done'));assert.equal(R.runProgress(run).value,R.runProgress(run).total);
  if(job.deliver&&job.kind==='collect')assert(events.some(e=>e.type==='deliver'),`${job.id} ends at the ${job.deliver.label}`);
  if(job.kind!=="rebound")assert(run.seconds>0);
  if(['offside-flag','ball-pump','goal-anchor'].includes(job.id))assert(/^https:\/\//.test(job.lessonSource),`${job.id} records its lesson source (docs only, not shown as a link)`);
 }

 // ---- Community Garden ----
 const G=env.load('lib/town/jobs/garden.ts'),t0=Date.parse('2026-09-27T10:00:00');
 assert(G.GARDEN_SPOTS.length>=30);assert.equal(new Set(G.GARDEN_SPOTS.map(s=>s.id)).size,G.GARDEN_SPOTS.length);
 let g=G.sanitizeGarden(null,t0);const ripe=G.GARDEN_SPOTS.find(s=>!s.startsUnripe),green=G.GARDEN_SPOTS.find(s=>s.startsUnripe);
 assert(G.isRipe(ripe,g,t0));assert(!G.isRipe(green,g,t0),'some produce starts not ripe yet');assert.equal(G.pickSpot(g,green,t0),null,'unripe produce cannot be picked (and nothing is lost)');
 assert(G.minutesLeft(green,g,t0)>=1);assert(G.isRipe(green,g,t0+green.regrowMs/2),'unripe produce ripens by itself');
 g=G.pickSpot(g,ripe,t0);assert(g);assert(!G.isRipe(ripe,g,t0+1000),'picked spots regrow');assert(G.isRipe(ripe,g,t0+ripe.regrowMs));
 assert.equal(G.sanitizeGarden({firstSeen:t0,picked:{[ripe.id]:t0,fake:1}},t0+5).picked.fake,undefined);

 // ---- Farmers market basket + selling (shared with fishing) ----
 const goods=env.load('lib/town/market/goods.ts'),M=env.load('lib/town/market/market.ts');
 for(const good of goods.PRODUCE_GOODS){assert(good.lesson.length>40&&good.price>0&&good.price<=5,`${good.id} teaches and is fairly priced`);}
 assert(goods.GOODS.every(x=>x.kind==='produce'||x.kind==='fish'));
 let stored=null;const credits=[];const market=M.createMarket({read:()=>stored,write:v=>{stored=JSON.parse(JSON.stringify(v));},credit:async(id,amount,reason)=>{credits.push({id,amount,reason});return amount;},now:()=>t0});
 assert.equal(market.gather('orange',3),3);assert.equal(market.gather('not-a-good'),0);
 assert.equal(market.gather('strawberry',M.BASKET_LIMIT),M.BASKET_LIMIT-3,'basket holds 20 items');assert.equal(market.gather('carrot'),0);
 const quote=market.quote('produce');assert.equal(quote.coins,M.quoteSale(M.sanitizeMarket(stored,M.localMarketDay(t0)),'produce').coins);
 assert.equal(quote.coins,3*3+16*2+1,"16 strawberries at full price reach the 40-coin allowance; the last one is half price");assert.equal(quote.halfPrice,true,'sales beyond 40 coins a day are half price');
 const sale=await market.sell('produce');assert.equal(sale.ok,true);assert.equal(sale.coins,quote.coins);assert.equal(credits.length,1);assert.match(credits[0].id,/^market:2026-09-27:1$/);
 assert.equal(M.basketCount(market.read()),0);assert.equal((await market.sell()).ok,false);
 market.gather('orange',2);assert.equal(market.quote().coins,2,'still half price later the same day');
 const nextDayMarket=M.createMarket({read:()=>stored,write:v=>{stored=v;},credit:async(i,a)=>a,now:()=>t0+86400e3});assert.equal(nextDayMarket.quote().coins,6,'full price again tomorrow');

 // ---- Harvest day actions (Sep 30 2026): shake → drop → pick up, pull timing, twist / not ready, snip, the 5 + 5 mix ----
 {const job=C.jobById('farm-harvest'),floor=(x,z)=>V.fieldSurfaceHeight(x,z),at=q=>({x:q.x,y:floor(q.x,q.z),z:q.z}),spots=job.task.spots,idx=f=>spots.findIndex(f);
  const run=R.startRun(job,7),step=(q,dt=.1)=>R.stepRun(run,at(q),dt,floor);
  const tree=idx(sp=>sp.action==='shake');step(spots[tree]);same(R.runActions(run).map(a=>a.id),['kick'],'at a ripe tree: Kick the tree');assert.match(R.runHint(run),/^Fruit 0\/5 · Veg 0\/5\. /);
  same(R.runProgress(run),{value:0,total:10});
  assert.equal(R.runAction(run,'shake').some(e=>e.type==='drop'),false,'one tap is not enough');
  for(let k=0;k<20;k++)step(spots[tree]);assert.equal(run.harvest.energy,0,'shake energy drains when you stop');
  const drops=[];for(let t=0;t<2&&!drops.length;t++)for(let k=0;k<3;k++)drops.push(...R.runAction(run,'shake').filter(e=>e.type==='drop'));
  assert(drops.length>=1&&drops.length<=2,'a full shake drops 1–2 fruit, always within two shakes');assert.equal(run.harvest.left[tree],3-drops.length,'the fruit comes off that tree');
  const g=run.harvest.ground[0];assert(Math.hypot(g.x-spots[tree].x,g.z-spots[tree].z)>1.2,'fruit lands around the trunk');
  assert.equal(step(g).filter(e=>e.type==='gather').length,0,'still falling: not pickable yet');
  const got=[];for(let k=0;k<10;k++)got.push(...step(g).filter(e=>e.type==='gather'));assert.equal(got.length,1,'walk over it to pick it up');assert.equal(run.harvest.fruit,1);assert.equal(run.harvest.bag[0],spots[tree].good);
  // Pull: too early springs back, too long slips back, the green zone pops the root out (then you pick it up).
  const root=idx(sp=>sp.action==='pull');step(spots[root]);same(R.runActions(run).map(a=>[a.id,a.hold]),[['pull',true]],'root veg: hold to pull');
  R.runAction(run,'pull');for(let k=0;k<3;k++)step(spots[root]);assert(run.harvest.pull<.8);assert(R.runAction(run,'pull:up').some(e=>e.type==='snap'),'let go too early: it springs back');assert.equal(run.harvest.done[root],false);
  R.runAction(run,'pull');let snapped=false;for(let k=0;k<25&&!snapped;k++)snapped=step(spots[root]).some(e=>e.type==='snap');assert(snapped,'hold too long: it slips back');assert.match(run.note,/Too long/);
  R.runAction(run,'pull');while(run.harvest.pull<.9)step(spots[root],.05);assert.match(R.runHint(run),/green/);assert(R.runAction(run,'pull:up').some(e=>e.type==='pop'),'green zone: pop!');
  const rootItem=run.harvest.ground.find(q=>q.kind==='veg');assert(rootItem);for(let k=0;k<10;k++)step(rootItem);assert.equal(run.harvest.veg,1,'pick up the popped root');
  // Twist: a green one is not ready (nothing lost), a red one comes off.
  const green=idx(sp=>sp.ripe===false);step(spots[green]);assert(R.runAction(run,'twist').some(e=>e.type==='unripe'));assert.equal(run.harvest.veg,1,'not ready yet: no count');assert.match(run.note,/Not ready yet/);
  assert(!R.runGoals(run).some(q=>q.x===spots[green].x&&q.z===spots[green].z),'the arrow never points at a green one');
  const red=idx(sp=>sp.action==='twist'&&sp.ripe!==false);step(spots[red]);assert(R.runAction(run,'twist').some(e=>e.type==='twist'));assert.equal(run.harvest.veg,2);
  // Snip: two quick snips cut; a slow second snip starts again.
  const greens=idx(sp=>sp.action==='cut');step(spots[greens]);R.runAction(run,'cut');for(let k=0;k<16;k++)step(spots[greens]);assert.equal(run.harvest.snips,0,'too slow: snip again');
  R.runAction(run,'cut');assert(R.runAction(run,'cut').some(e=>e.type==='cut'));assert.equal(run.harvest.veg,3);
  assert.match(R.runHint(run),/^Fruit 1\/5 · Veg 3\/5\./,'the panel shows the mix');same(R.runProgress(run),{value:4,total:10});
  // Replaying a finished spot adds nothing.
  step(spots[red]);assert.equal(R.runAction(run,'twist').length,0);assert.equal(run.harvest.veg,3);
  // Deterministic seeds: the same seed plays the same shakes.
  const a1=R.startRun(job,42),a2=R.startRun(job,42);for(const r of [a1,a2]){R.stepRun(r,at(spots[tree]),.1,floor);for(let k=0;k<3;k++)R.runAction(r,'shake');}same(a1.harvest.ground,a2.harvest.ground);
  // A whole shift: 10 crops in the bag, all sellable goods, then unload at the stand.
  const full=R.startRun(job,3),ev=[];assert(driveHarvest(job,full,ev,floor));assert.equal(full.harvest.bag.length,10);assert.equal(full.harvest.bag.filter(id=>goods.goodById(id).kind==='produce').length,10);
  assert(ev.some(e=>e.type==='deliver'),'ends at the farm stand');assert(full.seconds<120,`a harvest takes under 2 minutes of actions (${Math.round(full.seconds)} s)`);}

 // ---- Line painter: the marker paints only while held; walking with it down paints dash after dash ----
 {const job=C.jobById('line-painter'),floor=(x,z)=>V.fieldSurfaceHeight(x,z),at=q=>({x:q.x,y:floor(q.x,q.z),z:q.z}),run=R.startRun(job);
  R.stepRun(run,at(job.targets[0]),.1,floor);assert.equal(run.next,0,'marker up: the dash stays faded');R.runAction(run,'paint');assert.equal(run.next,1,'marker down on a dash paints it');
  for(let i=1;i<5;i++)R.stepRun(run,at(job.targets[i]),.1,floor);assert.equal(run.next,5,'walking with the marker down paints the next dashes');
  R.runAction(run,'paint:up');R.stepRun(run,at(job.targets[5]),.1,floor);assert.equal(run.next,5,'marker lifted: a gap');R.stepRun(run,{x:135,y:floor(135,100),z:100},.1,floor);
  R.runAction(run,'paint');R.stepRun(run,{x:135,y:floor(135,100),z:100},.1,floor);assert.match(R.runHint(run),/Off the line/,'off the circle: told to walk back onto it');}

 // ---- Farmer's share: the harvest shows up as sellable produce, exactly once per shift ----
 {const S=env.load('lib/town/jobs/harvestShare.ts'),bag=['mango','orange','banana','mango','orange','sweet-potato','tomato','pepper','sweet-potato','greens'],count=l=>l.reduce((n,x)=>n+x.count,0);
  assert.equal(count(S.jobShare('farm-harvest','full',0,bag)),3);assert.equal(count(S.jobShare('farm-harvest','half',0,bag)),2);assert.equal(count(S.jobShare('farm-harvest','tip',0,bag)),1);
  same(S.jobShare('leaf-rake','full',0,bag),[],'only the harvest gives goods');same(S.jobShare('match-day-snacks','full',0,bag),[],'the snacks job uses no produce and gives none');
  assert(S.jobShare('farm-harvest','full',0,bag).every(l=>bag.includes(l.id)),'the share comes from what you picked');
  assert.notEqual(JSON.stringify(S.jobShare('farm-harvest','full',0,bag)),JSON.stringify(S.jobShare('farm-harvest','full',1,bag)),'repeat shifts vary the mix');
  for(const tier of ['full','half','tip'])for(let life=0;life<10;life++){const v=S.jobShare('farm-harvest',tier,life,bag).reduce((n,l)=>n+goods.goodById(l.id).price*l.count,0);assert(v<=JOB_BASE_PAY['farm-harvest'],`share worth ${v} ≤ job pay (full price, before the market allowance and Training meter)`);}
  for(let life=0;life<10;life++){const sh=S.jobShare('farm-harvest','full',life,bag);assert.equal(sh.length,3,'three different goods: a mix');}
  let st=null;const mk=()=>M.createMarket({read:()=>st,write:v=>{st=JSON.parse(JSON.stringify(v));},credit:async(i,a)=>a,now:()=>t0});
  const share=S.jobShare('farm-harvest','full',0,bag),key='island-job:farm-harvest:2026-09-27:1';
  const m1=mk();same(m1.grant(key,share),share);same(m1.grant(key,share),[],'a replayed payday adds nothing');
  const m2=mk();same(m2.grant(key,share),[],'nor does a reload');assert.equal(M.basketCount(m2.read()),3);
  same(M.sanitizeMarket(JSON.parse(JSON.stringify(st)),'2026-09-28').granted,[key],'grant keys survive midnight');
  same(m2.grant('island-job:farm-harvest:2026-09-27:2',[{id:'mango',count:1}]),[{id:'mango',count:1}],'the next shift is new');
  m2.gather('strawberry',M.BASKET_LIMIT);same(m2.grant('island-job:farm-harvest:2026-09-27:3',share),[],'a full basket takes nothing');same(m2.grant('island-job:farm-harvest:2026-09-27:3',[{id:'mango',count:1}]),[],'…and the shift still counts as granted');
  for(let i=0;i<60;i++)m2.grant('k'+i,[]);assert(m2.read().granted.length<=M.GRANT_MEMORY,'grant memory is bounded');
  // The wallet pays the job exactly as before and adds the share once; Match-day snacks pays and adds nothing.
  let ms=null;const mkt=M.createMarket({read:()=>ms,write:v=>{ms=JSON.parse(JSON.stringify(v));},credit:async(i,a)=>a,now:()=>clock});
  const w3=W.createJobWallet({creditRun:(id,game,target,reason)=>arcade.creditRun(id,game,target,reason),balance:()=>arcade.load().balance,caps:core.ARCADE_COIN_CAPS,now:()=>clock,grantGoods:(k,items)=>mkt.grant(k,items)});
  const pay=await w3.payJob('farm-harvest','Harvest day',95,bag);assert.equal(pay.coins-pay.bonus,JOB_BASE_PAY['farm-harvest'],'job pay unchanged');assert.equal(pay.credited,pay.coins);assert.equal(count(pay.goods),3);same(pay.goods,pay.offered);assert.equal(M.basketCount(mkt.read()),3);
  const shiftKey=`island-job:farm-harvest:${E.localDay(clock)}:1`;same(mkt.grant(shiftKey,share),[],'the same shift key never pays goods twice');
  const snacks=await w3.payJob('match-day-snacks','Match-day snacks',60);assert.equal(snacks.coins-snacks.bonus,JOB_BASE_PAY['match-day-snacks']);assert(snacks.credited>0,'Match-day snacks pays');same(snacks.goods,[]);assert.equal(M.basketCount(mkt.read()),3);}

 // ---- Selling farm produce (Rosa's stand and the farm stand share ONE market state, allowance and Training meter) ----
 {for(const id of ['banana','mango','pepper','greens','sweet-potato']){const g=goods.goodById(id);assert(g&&g.kind==='produce'&&g.price>=2&&g.price<=3,`${id} is fairly priced produce`);assert(g.lesson.length<=85,`${id} lesson ≤ 85 chars (${g.lesson.length})`);assert.match(g.source,/^https:\/\//);}
  let st=null;const mk=M.createMarket({read:()=>st,write:v=>{st=JSON.parse(JSON.stringify(v));},credit:async(i,a)=>a,now:()=>t0});
  mk.grant('k',[{id:'mango',count:2},{id:'banana',count:1}]);assert.equal(mk.quote('produce').coins,3*2+2);assert.equal((await mk.sell('produce')).coins,8);
  mk.gather('strawberry',16);await mk.sell('produce');assert.equal(mk.read().soldToday,40);mk.gather('mango',2);assert.equal(mk.quote('produce').coins,2,'after 40 coins of sales today, farm produce sells at half price too');
  const MS=env.load('lib/town/market/marketStand.ts'),one=await MS.sellOneGood('mango',{read:()=>st,write:v=>{st=JSON.parse(JSON.stringify(v));},credit:async(i,a)=>a,refresh:()=>mk.refresh(),now:()=>t0});assert.equal(one.coins,1);assert.equal(mk.read().basket.mango,1);
  const DM=env.load('lib/town/dailyMeter.ts');assert(DM.isTrainingRun(`market:${M.localMarketDay(t0)}:3`,'island'),'every farm-stand sale is a metered market run');
  const stand=fs.readFileSync(path.join(base,'components/MarketStand.tsx'),'utf8');assert.match(stand,/place==='farm'/);assert.match(stand,/filter\(t=>t\.id==='produce'\)/,'the farm stand buys produce only');}

 // ---- Job moves (Sep 30 2026, docs/island-jobs.md §10): walking only, the job's own buttons, the ball set aside, poses ----
 {const JM=env.load('lib/town/jobs/jobMoves.ts'),job=C.jobById('farm-harvest'),floor=(x,z)=>V.fieldSurfaceHeight(x,z),at=(q,dx=0,dz=0)=>({x:q.x+dx,y:floor(q.x+dx,q.z+dz),z:q.z+dz}),spots=job.task.spots,idx=f=>spots.findIndex(f);
  // Bigger farm reaches (user: "make the radius of the farm jobs bigger for each thing").
  assert.equal(R.HARVEST.treeReach,4.5);assert.equal(R.HARVEST.vegReach,2.25);assert.equal(R.HARVEST.pickupReach,1.8);assert.equal(R.HARVEST.pickupButtonReach,3);
  // Rides wait while any job runs.
  assert.equal(JM.rideAllowed('scooter',true),false);assert.equal(JM.rideAllowed('jetpack',true),false);assert(JM.rideAllowed('walk',true));assert(JM.rideAllowed('bike',false));assert.match(JM.RIDE_WAIT_NOTE,/on foot/);
  // The three farm buttons replace Shoot (Space), Juggle (J) and Ride (R), and map onto the harvest steps.
  const run=R.startRun(job,5),step=(q,dx=0,dz=0,dt=.1)=>R.stepRun(run,at(q,dx,dz),dt,floor),btn=()=>JM.jobButtons(run).map(b=>`${b.slot}:${b.id}:${b.enabled?1:0}${b.hold?':hold':''}`);
  same(JM.jobButtons(run).map(b=>[b.slot,b.key]),[['shoot','Space'],['juggle','J'],['ride','R']]);
  same(btn(),['shoot:kick:0','juggle:pull:0','ride:pickup:0'],'nothing armed away from the crops: all three wait');
  const tree=idx(sp=>sp.action==='shake');step(spots[tree],-3.6,1);same(btn(),['shoot:kick:1','juggle:pull:0','ride:pickup:0'],'3.7 m from a tree: Kick the tree');
  const kicked=R.runAction(run,'kick');assert(kicked.some(e=>e.type==='shake'&&e.value>=1),'one kick is one full shake');assert(kicked.some(e=>e.type==='drop')||kicked.some(e=>e.type==='miss'));
  if(!kicked.some(e=>e.type==='drop'))assert(R.runAction(run,'kick').some(e=>e.type==='drop'),'never two empty kicks in a row');
  const fallen=run.harvest.ground[0];for(let k=0;k<9;k++)step(spots[tree],-3.6,1);step(fallen,2.4,0);
  same(btn()[2],'ride:pickup:1','a landed fruit within 3 m: Pick up');assert(R.runAction(run,'pickup').some(e=>e.type==='gather'&&e.x!==undefined));assert.equal(run.harvest.fruit,1,'Pick up bends down for it without walking onto it');
  const root=idx(sp=>sp.action==='pull');step(spots[root],-1.9,.3);same(btn(),['shoot:kick:0','juggle:pull:1:hold','ride:pickup:0'],'1.9 m from a root: hold Pull');
  const ripe=idx(sp=>sp.action==='twist'&&sp.ripe!==false);step(spots[ripe],-1.5,.3);same(btn()[1],'juggle:twist:1');
  const greens=idx(sp=>sp.action==='cut');step(spots[greens],-1.5,.3);same(btn()[1],'juggle:cut:1');assert.equal(JM.jobButtons(run)[1].icon,'snip');
  // Overlapping tree reaches: the armed tree only changes when another is clearly (0.6 m) nearer.
  {const a=idx(sp=>sp.x===664&&sp.z===-124),b=idx(sp=>sp.x===664&&sp.z===-117.5),r2=R.startRun(job,9),go=z=>R.stepRun(r2,{x:664,y:floor(664,z),z},.1,floor);
   go(-123);assert.equal(r2.harvest.near,a);go(-120.6);assert.equal(r2.harvest.near,a,'0.5 m nearer is not enough: no flicker');go(-120);assert.equal(r2.harvest.near,b,'1.5 m nearer: switch');go(-120.6);assert.equal(r2.harvest.near,b);}
  // The drop-off: Unload in the basket slot; a finished job gives the default buttons back.
  {const r3=R.startRun(job,4);r3.harvest.fruit=5;r3.harvest.veg=5;R.stepRun(r3,at(spots[0]),.1,floor);assert.equal(r3.phase,'deliver');R.stepRun(r3,at(job.deliver),.1,floor);
   same(JM.jobButtons(r3).map(b=>`${b.slot}:${b.id}:${b.enabled?1:0}`),['shoot:kick:0','juggle:pull:0','ride:unload:1']);R.runAction(r3,'unload');assert.equal(r3.phase,'done');assert.equal(JM.jobButtons(r3),null,'job complete: default buttons');}
  assert.equal(JM.jobButtons(null),null,'no job (quit): default buttons');
  assert.equal(JM.jobButtons(R.startRun(C.jobById('wall-rebounds'))),null,'Wall rebounds is a ball drill: it keeps Juggle / Shoot');
  for(const j of C.JOBS){const slots=JM.JOB_SLOTS[j.id];assert(slots!==undefined,`${j.id} has a button layout`);if(slots)assert(slots.length>=1&&slots.length<=3,`${j.id}: 1–3 job buttons`);}
  // Leaving the farm ends the job (the host then restores the ride, ball and buttons).
  assert(!R.outsideJobArea(job,spots[0].x,spots[0].z)&&!R.outsideJobArea(job,job.deliver.x,job.deliver.z));assert(R.outsideJobArea(job,520,-112),'the main-island side is outside the farm');
  // Poses: which job events play which bounded pose.
  same(['pop','snap','twist','unripe','snip','cut','gather'].map(type=>JM.poseForEvent(job,{type,index:0}).kind),['pop','slip','twist','nope','snip','snip','pick']);
  for(const k of ['pull','twist','snip','pick','rake','scoop','throwin','mallet','kneel'])assert(JM.HANDS_POSES.has(k),`${k} sets the ball down first`);
  for(const [k,d] of Object.entries(JM.POSE_TIME))assert(d>0&&d<=1,`${k} is a short, bounded pose`);
  same(JM.heldPose(run,0,9),null,'no pose while just walking');
  // The ball set aside: parked beside the player while the hands work, back at the feet when they walk on, and at once on job end.
  {const m=JM.createJobMoves(),pl={x:0,z:0,y:0,yaw:0},fl=()=>0;let f=m.update(.016,pl,fl,{kind:'pull',progress:0,tug:.5});
   assert(m.parked&&f.ball&&f.still&&f.pose.kind==='pull','pulling: ball set down, player still');const gap=Math.hypot(f.ball.x,f.ball.z);assert(gap>.6&&gap<1.1,`ball beside the player (${gap.toFixed(2)} m)`);
   f=m.update(.016,pl,fl,null);assert(m.parked&&f.ball,'stays down while you stand there');
   let caught=false;for(let t=0;t<40&&!caught;t++)caught=m.update(.02,{x:0,z:1+t*.02,y:0,yaw:0},fl,null).caught;assert(caught&&!m.parked,'walking on: the ball rolls back to the feet');
   m.update(.016,pl,fl,{kind:'rake',progress:.3});assert(m.parked);assert.equal(m.reset(),true);assert(!m.parked&&!m.busy&&m.update(.016,pl,fl,null).ball===null,'job over (quit / done / left the farm): ball at the feet at once');}
  // Kick the tree: step back, strike (contact), the ball meets the trunk once, rebounds to the feet; bounded; reduced motion too.
  for(const reduced of [false,true]){const m=JM.createJobMoves();let hits=0,t=0,maxBack=0,maxKick=0,nearTrunk=9,f;
   assert(m.startKick({x:0,z:5},{x:0,z:0,y:0,yaw:0},reduced,null,()=>hits++,()=>true));assert(!m.startKick({x:0,z:5},{x:0,z:0,y:0,yaw:0},reduced,null,()=>hits++,()=>true),'one kick at a time');
   do{f=m.update(.02,{x:0,z:0,y:0,yaw:0},()=>0,null);t+=.02;maxBack=Math.max(maxBack,f.back??0);maxKick=Math.max(maxKick,f.kick??0);if(f.ball)nearTrunk=Math.min(nearTrunk,Math.hypot(f.ball.x,f.ball.z-5));assert(f.still||f.caught);}while(!f.caught&&t<4);
   assert(f.caught,'the rebound comes back to the feet');assert.equal(hits,1,'the ball meets the trunk once');assert(maxKick>=JM.KICK_CONTACT);
   if(reduced)assert(t<.6&&maxBack===0,`reduced motion: a short kick, no step back (${t.toFixed(2)} s)`);else{assert(maxBack>.8,'two steps back first');assert(nearTrunk<.4,'the ball reaches the trunk');assert(t<2.4,`bounded (${t.toFixed(2)} s)`);}
   assert(!m.kicking&&m.update(.02,{x:0,z:0,y:0,yaw:0},()=>0,null).ball===null);}
  // Town wiring: the ride request, the job-end restore and the cluster owning the ball.
  const townSrc=fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8');
  assert.match(townSrc,/if\(!rideAllowed\(mode,jobActiveRef\.current\)\)\{jobNoteRef\.current\(RIDE_WAIT_NOTE\);return;\}/,'selectRide refuses rides during a job');
  assert.match(townSrc,/if\(!jobRun\)jobMoves\.end\(\);[^\n]*?jobFrame=NO_JOB_FRAME;walkBall\.reset/,'job end (quit, done, left the area) restores the ball; the last one-shot pose plays out (bug A9)');
  assert.match(townSrc,/if\(jobs\.holding&&rideRef\.current==='walk'\)\{player\.handPositions\(jobHandL,jobHandR\);jobs\.holdProps\(/,'what is in the hands follows them through the wind-down');
  assert.match(townSrc,/if\(jobButtonsRef\.current\)\{input\.current\.kick=input\.current\.juggle=false/,'no kicks or juggles while the job buttons are up');
  assert.match(fs.readFileSync(path.join(base,'components/IslandJobs.tsx'),'utf8'),/a\.actions\.length>0&&!a\.buttons/,'no duplicate action buttons in the job panel');
  // Oct 1 2026 (user): a two-row panel that fades to a chip (title · count, tap to open, round Stop) and still announces progress.
  {const src=fs.readFileSync(path.join(base,'components/IslandJobs.tsx'),'utf8');assert.match(src,/PANEL_DWELL_MS=3500/);assert.match(src,/aria-label="Stop job"/,'the chip keeps a Stop job control');
   assert.match(src,/className=\{styles\.srOnly\} aria-live="polite"/,'progress is announced while the panel is a chip');assert.match(src,/holdOpen=[^;]*act0\.gauge/,'a meter keeps the panel open');assert.doesNotMatch(src,/<small>\{active\.role\}<\/small><b>\{active\.title\}/,'no role eyebrow repeating the title');
   const css=fs.readFileSync(path.join(base,'components/IslandJobs.module.css'),'utf8');assert.match(css,/\.chipStop\{[^}]*width:var\(--btn-height,44px\);height:var\(--btn-height,44px\)/,'Stop is a 44px target');assert.match(css,/prefers-reduced-motion:reduce\)\{\.hud\[data-job-panel=fading\]\{transition:none\}/);}}

 // ---- JOB badges over every sign (Sep 30 2026): one instanced draw, billboarded, hidden while working, one look for every badge ----
 {const THREE=require('three'),B=env.load('lib/town/jobs/jobBadges.ts'),root=new THREE.Group(),spots=C.JOBS.map(j=>({id:j.id,x:j.board.x,y:3,z:j.board.z}));
  const b=B.createJobBadges(root,spots),cam=new THREE.PerspectiveCamera(40,.5,1,500),look=(x,z,d=25)=>{cam.position.set(x+d*.5,d*.8,z+d*.8);cam.lookAt(x,0,z);cam.updateMatrixWorld();cam.updateProjectionMatrix();};
  assert.equal(root.children.filter(o=>o.isMesh).length,1,'one mesh for every badge');const farm=spots.find(q=>q.id==='farm-harvest');
  look(farm.x,farm.z);assert(b.update(cam,.016,false,true)>=1&&b.mesh.visible,'a nearby sign shows its badge');
  look(-400,400);assert.equal(b.update(cam,.016,false,true),0);assert.equal(b.mesh.visible,false,'no badge in range: idle and hidden');
  const i=spots.indexOf(farm),mat=new THREE.Matrix4(),sc=new THREE.Vector3(),at=d=>{look(farm.x,farm.z,d);b.update(cam,.016,true,true);b.mesh.getMatrixAt(i,mat);return new THREE.Vector3().setFromMatrixScale(mat).x;};
  assert(at(60)>at(15),'a far badge is drawn bigger: it keeps a readable size on screen');
  const p1=(look(farm.x,farm.z),b.update(cam,.5,true,true),b.mesh.getMatrixAt(i,mat),new THREE.Vector3().setFromMatrixPosition(mat).y),p2=(b.update(cam,.5,true,true),b.mesh.getMatrixAt(i,mat),new THREE.Vector3().setFromMatrixPosition(mat).y);assert.equal(p1,p2,'reduced motion: no bob');
  b.setState('farm-harvest',[]);b.update(cam,.016,false,true);b.mesh.getMatrixAt(i,mat);assert.equal(new THREE.Vector3().setFromMatrixScale(mat).x,0,'hidden while that job runs');
  b.setState(null,['farm-harvest']);const col=new THREE.Color();b.mesh.getColorAt(i,col);assert.equal(col.r,1,'done-today badges look the same as the rest');b.mesh.getColorAt(spots.findIndex(q=>q.id==='garden-shift'),col);assert.equal(col.r,1);
  b.dispose();assert.equal(root.children.length,0);}

 // ---- Garden shift (30 Sep 2026, docs/island-jobs.md §13): the Community Garden as a paid job, with picking poses ----
 {const job=C.jobById('garden-shift'),G=env.load('lib/town/jobs/garden.ts'),JM=env.load('lib/town/jobs/jobMoves.ts'),S=env.load('lib/town/jobs/harvestShare.ts'),goodsReg=env.load('lib/town/market/goods.ts');
  const floor=(x,z)=>V.fieldSurfaceHeight(x,z),at=(q,dx=0,dz=0)=>({x:q.x+dx,y:floor(q.x+dx,q.z+dz),z:q.z+dz}),t0=Date.parse('2026-09-30T10:00:00'),spots=G.GARDEN_SPOTS;
  // Catalog entry: a normal job (badge + map J from the catalog), 8 picks with at least 2 fruit and 2 veg, then the crate.
  assert(job&&job.kind==='garden'&&job.prop==='produce'&&job.place==='Community Garden'&&job.role==='Gardener','Garden shift is in the catalog');
  same([job.task.type,job.task.goal,job.task.fruitGoal,job.task.vegGoal],['garden',8,2,2]);assert.equal(job.deliver.label,'garden crate');
  same(job.targets,spots.map(q=>({x:q.x,z:q.z})),'the targets are the garden spots, in order');
  same(JM.JOB_SLOTS['garden-shift'].map(x=>x.ids),[['pluck'],['crate']],'Pick and Drop in crate replace the ball buttons');
  // The lesson and the tip use only the garden produce lessons already in goods.ts (no new claims).
  const lessons=goodsReg.PRODUCE_GOODS.filter(g=>['strawberry','tomato','carrot','orange'].includes(g.id)).map(g=>g.lesson.toLowerCase()).join(' ');
  for(const phrase of ["main sprint fuel","vitamins and minerals that help you recover between matches","recover after training with a real meal: veg, carbs, protein and water","mostly water, so they rehydrate you"])assert(lessons.includes(phrase)&&job.lesson.toLowerCase().includes(phrase.replace('recover after','recover after')),`lesson phrase from goods.ts: ${phrase}`);
  assert(R.GARDEN_TIP.toLowerCase().includes('vitamins and minerals that help you recover between matches')&&R.GARDEN_TIP.toLowerCase().includes('sprint fuel'),'the shift tip is from the produce lessons');
  // Sign placement: by the COMMUNITY GARDEN gate sign, clear of the beds, paths, trees, benches, tables, glasshouse and Hugo.
  {const b=job.board,world=fs.readFileSync(path.join(base,'lib/town/world.ts'),'utf8'),npc=fs.readFileSync(path.join(base,'lib/town/npcDialogues.ts'),'utf8');
   assert.match(world,/sign\('COMMUNITY GARDEN',13,1\.1,207,2\.5,5\.5/,'the gate sign this job stands beside');assert(Math.hypot(b.x-207,b.z-5.5)<=12,'the job sign is by the COMMUNITY GARDEN sign');
   const hugo=npc.match(/id:'hugo'[^}]*?x:(-?[\d.]+),z:(-?[\d.]+)/);assert(hugo,'Hugo is in npcDialogues');assert(Math.hypot(b.x-+hugo[1],b.z-+hugo[2])>8,'clear of Hugo');
   const half=1.45,box=(x,z,w,d,pad)=>Math.abs(b.x-x)<w/2+half+pad&&Math.abs(b.z-z)<d/2+.2+pad;
   for(let row=0;row<3;row++)for(let col=0;col<4;col++)assert(!box(192+col*10,-28+row*11,6,6,1),'clear of every bed');
   assert(!box(208,-15,42,38,.5)&&!box(181,-15,14,4,.5),'off the garden paths and the Coaches walkway');
   assert(!box(202,19,28,18,1),'clear of the glasshouse');
   for(const [x,z] of [[201,5.5],[213,5.5],[191,1],[222,1],[207,0],[229,-15],[186,-34],[230,-34],[230,4]])assert(Math.hypot(b.x-x,b.z-z)>3,`clear of (${x},${z})`);
   for(const q of spots)assert(Math.hypot(b.x-q.x,b.z-q.z)>2*q.reach,'no Pick spot reaches the sign');
   const d=job.deliver;assert(Math.hypot(d.x-b.x,d.z-b.z)<6,'the crate is a few steps from the sign');assert(box(208,-15,42,38,0)||Math.abs(d.z-5.5)<4,'the crate is on the paving inside the gate');
   for(const [x,z] of [[201,5.5],[213,5.5],[207,0]])assert(Math.hypot(d.x-x,d.z-z)>1.5,'the crate does not crowd the gate post or the potting table');}
  // Shift ripeness: a fresh garden needs no help; a just-emptied garden is made ready, so a shift can always be finished.
  {const kinds=r=>{let f=0,v=0,tr=0,n=0;spots.forEach((q,i)=>{if(!r[i])return;n++;G.GARDEN_KIND[q.good]==='fruit'?f++:v++;if(G.isTreeSpot(q))tr++;});return {n,f,v,tr};};
   const fresh=G.shiftRipeness(G.sanitizeGarden(null,t0),t0);same(fresh.boosted,[],'enough is ripe: nothing is boosted');assert(fresh.ripe.some(r=>!r),'some produce is still green: something to check');
   const picked={};for(const q of spots)picked[q.id]=t0;const empty=G.sanitizeGarden({firstSeen:t0-1e7,picked},t0),sr=G.shiftRipeness(empty,t0+1000),k=kinds(sr.ripe);
   assert(spots.every(q=>!G.isRipe(q,empty,t0+1000)),'every spot was just picked');
   assert(k.n>=12&&k.f>=5&&k.v>=5&&k.tr>=3,`a just-emptied garden is made ready for the shift (${JSON.stringify(k)})`);assert(sr.ripe.some(r=>!r),'the rest stays green (not ripe yet)');
   same(G.shiftRipeness(empty,t0+1000),sr,'deterministic');same(Object.keys(empty.picked).length,spots.length,'shift ripeness writes nothing to the garden');
   const run=R.startRun(job,3,sr.ripe),ev=[];let guard=0;
   while(run.phase!=='done'&&guard++<400){if(run.phase==='deliver'){ev.push(...R.stepRun(run,at(job.deliver),.1,floor));same(R.runActions(run).map(a=>a.id),['crate']);ev.push(...R.runAction(run,'crate'));continue;}
    const g=R.runGoals(run)[0];assert(g,'never a dead end: always a ripe spot to go to');ev.push(...R.stepRun(run,at(g),.1,floor));const a=R.runActions(run)[0];if(a)ev.push(...R.runAction(run,a.id));}
   assert.equal(run.phase,'done','the shift completes from an emptied garden');assert(ev.some(e=>e.type==='deliver'));assert.equal(run.garden.bag.length,8);assert(run.garden.fruit>=2&&run.garden.veg>=2,'the mix');
   assert(run.garden.picked.every((p,i)=>!p||sr.ripe[i]),'only shift-ripe spots were picked');}
  // One shift by hand: arm, not ripe yet, the mix, lessons, the crate.
  {const ripe=spots.map((q,i)=>i!==1),run=R.startRun(job,1,ripe),step=(q,dx=0,dz=0)=>R.stepRun(run,at(q,dx,dz),.1,floor),press=id=>R.runAction(run,id);
   same(R.runProgress(run),{value:0,total:8});same(R.runActions(run),[],'nothing armed away from the plants');step(job.board);same(R.runActions(run),[]);
   same(JM.jobButtons(run).map(b=>`${b.slot}:${b.id}:${b.enabled?1:0}`),['shoot:pluck:0','juggle:crate:0'],'two job buttons (the ride slot shows On foot)');
   // Walking onto a ripe spot does nothing by itself: Pick does it.
   step(spots[0],.4,0);assert.equal(run.garden.near,0);assert.equal(run.garden.fruit+run.garden.veg,0,'walking alone picks nothing in a shift');same(R.runActions(run).map(a=>a.id),['pluck']);
   const e0=press('pluck');const pl=e0.find(e=>e.type==='pluck');assert(pl&&pl.index===0&&pl.value===0&&pl.x===spots[0].x&&!pl.free,'a bed pick (crouch) at the spot');
   assert.match(run.note,new RegExp(goodsReg.goodById(spots[0].good).lesson.slice(0,20).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')),'the first pick of a crop teaches its nutrition lesson');
   same(press('pluck'),[],'a picked spot cannot be picked twice');
   // Not ripe yet: a gentle look and head shake, nothing counted, never on the arrow.
   step(spots[1],.4,0);assert.equal(run.garden.near,1);const e1=press('pluck');assert(e1.some(e=>e.type==='unripe'),'not ripe yet');assert.match(run.note,/Not ripe yet/);assert.equal(run.garden.fruit+run.garden.veg,1);
   assert(!R.runGoals(run).some(q=>q.x===spots[1].x&&q.z===spots[1].z),'the arrow never points at a green one');assert.match(R.runHint(run),/^Basket 1\/8 · /);
   // A ripe spot wins over a green one next to it.
   {const r2=R.startRun(job,1,ripe);R.stepRun(r2,at(spots[1],-.2,0),.1,floor);assert.equal(r2.garden.near,1);}
   // The mix: after 6 fruit, a 7th fruit is refused (gently) until 2 veg are in.
   const fruitIdx=spots.map((q,i)=>i).filter(i=>i>1&&G.GARDEN_KIND[spots[i].good]==='fruit'),vegIdx=spots.map((q,i)=>i).filter(i=>i>1&&G.GARDEN_KIND[spots[i].good]==='veg');
   const base0=G.GARDEN_KIND[spots[0].good]==='fruit'?1:0;let fi=0;while(run.garden.fruit<6){step(spots[fruitIdx[fi]]);press('pluck');fi++;}
   if(run.garden.veg===0){step(spots[fruitIdx[fi]]);const w=press('pluck');assert(w.some(e=>e.type==='wrong'),'a 7th fruit would leave no room for veg');assert.match(run.note,/needs 2 more veg/);assert.equal(run.garden.fruit,6);
    assert(R.runGoals(run).every(q=>G.GARDEN_KIND[spots.find(s=>s.x===q.x&&s.z===q.z).good]==='veg'),'the arrow points at veg only');}
   void base0;step(spots[vegIdx[0]]);press('pluck');step(spots[vegIdx[1]]);const last=press('pluck');assert(last.some(e=>e.type==='phase'),'8 picked: off to the crate');assert.equal(run.phase,'deliver');
   same(R.runProgress(run),{value:8,total:8});same(R.runGoals(run),[job.deliver]);same(R.runActions(run),[],'Drop in crate waits for the crate');
   R.stepRun(run,at(job.deliver),.1,floor);same(JM.jobButtons(run).map(b=>`${b.id}:${b.enabled?1:0}`),['pluck:0','crate:1']);const fin=press('crate');assert(fin.some(e=>e.type==='deliver')&&fin.some(e=>e.type==='done'));
   same(run.garden.bag.length,8);assert.equal(JM.jobButtons(run),null,'done: the default buttons come back');
   // Tree fruit is a reach-up pick.
   const tree=spots.findIndex(G.isTreeSpot),r3=R.startRun(job,1);R.stepRun(r3,at(spots[tree]),.1,floor);assert.equal(R.runAction(r3,'pluck').find(e=>e.type==='pluck').value,1,'tree fruit: reach up');}
  // Pay: 10 (+4 the first time), half 5, then tips; per-minute parity with the other jobs; the daily ceiling stays bounded.
  {let l=E.emptyJobLedger(day);const p=[];for(let i=0;i<6;i++){const x=E.jobPayout('garden-shift',l);p.push(x.coins);l=E.recordCompletion(l,'garden-shift',x.coins,60);}
   same(p,[14,10,5,5,1,1],'first-time bonus, full, half, half, then 1-coin tips');assert.equal(E.JOB_MINUTES['garden-shift'],1);
   const rate=E.jobCoinsPerMinute,others=JOB_IDS.filter(id=>id!=='garden-shift'&&id!=='wall-rebounds').map(rate).sort((a,b)=>a-b),mid=(others[4]+others[5])/2;
   assert(Math.abs(rate('garden-shift')-mid)/mid<=.1,`garden shift ${rate('garden-shift').toFixed(2)} coins/min within 10% of the other short jobs' median ${mid.toFixed(2)}`);
   assert.match(E.payMessage('garden-shift',l),/garden crate is full/);}
  // The gardener's share: 2 / 1 / 1 items from the picks, worth ≤ the pay, granted once per shift.
  {const bag=['strawberry','tomato','orange','carrot','strawberry','cherry','tomato','carrot'],count=x=>x.reduce((n,y)=>n+y.count,0);
   same(['full','half','tip'].map(t=>count(S.jobShare('garden-shift',t,0,bag))),[2,1,1]);assert(S.jobShare('garden-shift','full',0,bag).every(x=>bag.includes(x.id)),'from the picks');
   for(let life=0;life<8;life++){const sh=S.jobShare('garden-shift','full',life,bag),v=sh.reduce((n,x)=>n+goodsReg.goodById(x.id).price*x.count,0);assert(v<=6&&v<JOB_BASE_PAY['garden-shift'],`share worth ${v} < pay`);assert.equal(sh.length,2,'two different goods');}
   same(S.jobShare('farm-harvest','full',0,['mango','orange','banana']).map(x=>x.count).reduce((a,b)=>a+b,0),3,'the farm share is unchanged');
   let ms=null,clk=Date.parse('2026-09-30T11:00:00');const mkt=M.createMarket({read:()=>ms,write:v=>{ms=JSON.parse(JSON.stringify(v));},credit:async(i,a)=>a,now:()=>clk});
   const w=W.createJobWallet({creditRun:(id,game,target,reason)=>arcade.creditRun(id,game,target,reason),balance:()=>arcade.load().balance,caps:core.ARCADE_COIN_CAPS,now:()=>clk,grantGoods:(k,items)=>mkt.grant(k,items)});
   const pay=await w.payJob('garden-shift','Garden shift',62,bag);assert.equal(pay.coins,14);assert.equal(pay.bonus,4);assert.equal(count(pay.goods),2);assert.equal(M.basketCount(mkt.read()),2);
   same(mkt.grant(`island-job:garden-shift:${E.localDay(clk)}:1`,pay.offered),[],'the share is added once: a replayed payday adds nothing');assert.equal(M.basketCount(mkt.read()),2);
   const second=await w.payJob('garden-shift','Garden shift',58,bag);assert.equal(second.coins,10);assert.equal(count(second.goods),2);assert.equal(M.basketCount(mkt.read()),4);}
  // Auto-stop: the shift ends a short way outside the garden (15 m, not the usual 45 m: the Coaches Centre lawn is close by).
  assert.equal(job.areaMargin,15);for(const q of [job.board,job.deliver,...spots.slice(0,3),{x:202,z:12}])assert(!R.outsideJobArea(job,q.x,q.z),'inside the garden area');
  for(const [x,z] of [[156,-25],[208,40],[260,-12],[208,-60]])assert(R.outsideJobArea(job,x,z),`(${x},${z}) is outside: the shift stops`);
  // On foot, ball parked and restored, the poses (shift and free picking alike).
  {assert.equal(JM.rideAllowed('bike',true),false,'rides wait while the shift runs');
   same(['pluck','unripe','wrong','deliver'].map(type=>JM.poseForEvent(job,{type,index:0,value:0})),[{kind:'gpick',at:'item',basket:true},{kind:'headshake',at:'item',basket:true},{kind:'headshake',at:'item',basket:true},{kind:'tipbasket',at:'deliver',basket:true}]);
   same(JM.poseForEvent(job,{type:'pluck',value:1,free:true}),{kind:'reachpick',at:'item',basket:false},'a free tree pick: reach up, no basket');
   for(const k of ['gpick','reachpick','tipbasket'])assert(JM.HANDS_POSES.has(k),`${k} sets the ball down first`);assert(!JM.HANDS_POSES.has('headshake'),'a head shake needs no hands');
   const held=JM.heldPose(R.startRun(job),0,9);same(held,{kind:'carrybasket',progress:0,upper:true,basket:true},'the basket rides in the left hand while walking');assert(JM.UPPER_POSES.has('carrybasket'));
   const m=JM.createJobMoves(),pl={x:0,z:0,y:0,yaw:0},fl=()=>0;m.start('gpick',pl,{x:0,z:1.6},fl,false,null,true);let f=m.update(.016,pl,fl,null);
   assert(m.parked&&f.ball&&f.still&&f.pose.kind==='gpick'&&f.pose.basket,'crouch-pick: ball set aside, player still, basket in hand');assert(f.stand&&Math.hypot(f.stand.x,f.stand.z-1.6)>.9,'steps up to the bed edge, not into it');
   let t=0;while(m.posing&&t<2){m.update(.05,pl,fl,null);t+=.05;}assert(t<=.9,`the pick pose is bounded (${t.toFixed(2)} s)`);assert(m.parked,'the ball waits beside you');
   assert.equal(m.reset(),true);assert(!m.parked&&m.update(.016,pl,fl,null).ball===null,'shift over: the ball is back at the feet at once');
   const m2=JM.createJobMoves();m2.start('headshake',pl,{x:0,z:1},fl,true,null,false);assert(!m2.parked,'a free head shake leaves the ball alone');let t2=0;while(m2.posing&&t2<2){m2.update(.05,pl,fl,null);t2+=.05;}assert(t2<.6,'reduced motion: shorter');}
  // Keyframes (lib/graphics/jobPoses.ts): crouch, tug, tiptoe reach, head shake; reduced motion keeps the look, not the shake.
  {const P=env.load('lib/graphics/jobPoses.ts'),pt=(kind,progress,basket=true,reduced=false)=>JSON.parse(JSON.stringify(P.jobPoseTarget({kind,progress,basket},0,reduced)));
   const crouch=pt('gpick',.3),tug=pt('gpick',.42),up=pt('gpick',.86);assert(crouch.py<.65&&crouch.tx>.7&&crouch.ar[0]<-.9,'bed: crouch and reach down');assert(tug.ar[2]<crouch.ar[2]-.2,'a small tug (the elbow bends back)');
   assert(up.py>.78&&up.ar[1]<-.2,'rises and brings it across to the basket');same(pt('gpick',.3).al,[-.55,.3,-.6,0],'the basket hand comes forward');same(pt('gpick',.3,false).al,[-.35,.35,-.4,0],'free picking: the left arm balances (no basket)');
   const reach=pt('reachpick',.4);assert(reach.toe>.4&&reach.py>.86&&reach.fl[1]>.07&&reach.ar[0]<-2.6&&reach.hx<-.3,'tree: up on tiptoe, arm straight up, eyes up');
   const s1=pt('headshake',.42),s2=pt('headshake',.58);assert(s1.hy>.25&&s2.hy<-.25,'not ripe: the head shakes');assert.equal(pt('headshake',.42,true,true).hy,0,'reduced motion: a look, no shake');
   assert(pt('gpick',1).py===.86&&pt('reachpick',1).toe===0,'every pose returns to standing');
   for(const k of ['gpick','reachpick','headshake','tipbasket'])assert(JM.POSE_TIME[k]>0&&JM.POSE_TIME[k]<=1,`${k} is a short one-shot`);}
  // Scene wiring (lib/town/jobs/jobScene.ts): the floating garden badge is gone (the catalog sign has one), free picking stays
  // outside a shift but stops during it, and the basket fills with at most 3 fruit meshes on the shared fruit geometry.
  {const src=fs.readFileSync(path.join(base,'lib/town/jobs/jobScene.ts'),'utf8');
   assert.doesNotMatch(src,/\{id:'garden',x:/,'no special garden badge spot');assert.match(src,/createJobBadges\(root,JOBS\.map\(/,'every badge comes from the catalog');
   assert.match(src,/if\(run\?\.garden\)\{setView\(\{garden:''\}\);return;\}/,'no free picking (no double pay) during a shift');
   assert.match(src,/shiftRipeness\(garden,now\(\)\)\.ripe/,'the shift starts from the garden\'s real ripeness (plus boosts)');
   assert.match(src,/new T\.InstancedMesh\(fruitGeometry,.*?,3\);fill\.name='garden-basket-fruit'/,'basket fruit: one 3-instance mesh on the shared garden fruit geometry');
   assert.match(src,/saveGarden\(markPicked\(garden,s,now\(\)\)\)/,'shift picks regrow on the normal timer (no free re-pick)');}
  assert.match(fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8'),/jobMoves\.start\(p\.kind,jobPlayer\(\),target,jobFloor,reduced,jobBallNow\(\),!!p\.basket\)/,'Town plays the garden poses (with or without the basket)');
 }

 // The former Clubhouse is a cage court; the outdoor kit job remains without an interior.
 const town=fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8'),world=fs.readFileSync(path.join(base,'lib/town/world.ts'),'utf8');
 assert.doesNotMatch(town,/BootRoom|bootRoom|boot-room/);assert.doesNotMatch(world,/house\([^\n]*'CLUBHOUSE'/);assert.match(world,/Pocket futsal court/);
 await auditRegressions();
 console.log('island jobs: economy, wallet, all catalog jobs, garden, market and cage-court checks passed');
})().catch(e=>{console.error(e);process.exit(1);});

// ---- Deploy 11 audit regressions (Sep 30 2026, lane A): A2 one job at a time, A7 payday across tabs, A8 sign glow fade, A9 last
// pose, A10 garden basket. The 3D scene (lib/town/jobs/jobScene.ts) runs headless here: three.js without a renderer or a DOM.
function sceneEnvironment(shared){
 const data=shared??new Map(),cache=new Map();
 const localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
 const context=vm.createContext({console,Set,Map,WeakMap,Date,Math,JSON,Promise,queueMicrotask,localStorage,Float32Array,Uint16Array,Uint32Array,Int32Array,Uint8Array,Array,Object,Number,String,Error,Symbol});
 const reactStub={useSyncExternalStore(){},useEffect(){},useState(){},useRef(){},createContext(){}};
 function load(name){
  let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
  if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,allowJs:true}}).outputText;
  const req=spec=>{if(spec==='react')return reactStub;if(spec==='three')return require('three');if(spec.startsWith('three/'))return load(path.resolve(base,'node_modules',spec));if(spec.startsWith('@/'))return load(spec.slice(2));
   if(spec.startsWith('.')){if(spec.endsWith('.json'))return JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),spec),'utf8'));return load(path.resolve(path.dirname(file),spec));}throw Error('unexpected import '+spec+' in '+file);};
  vm.runInContext(`(function(exports,require,module){${code}\n})`,context)(mod.exports,req,mod);cache.set(file,mod.exports);return mod.exports;}
 return {load,data};
}
async function auditRegressions(){
 const T=require('three'),env=sceneEnvironment(),S=env.load('lib/town/jobs/jobScene.ts'),C=env.load('lib/town/jobs/jobCatalog.ts'),R=env.load('lib/town/jobs/jobRules.ts'),V=env.load('lib/town/venues.ts'),JM=env.load('lib/town/jobs/jobMoves.ts');
 const floor=(x,z)=>V.fieldSurfaceHeight(x,z),at=(q)=>({x:q.x,y:floor(q.x,q.z),z:q.z}),DT=1/60;
 const make=()=>S.createJobScene(new T.Scene(),{storage:null,now:()=>Date.parse('2026-09-30T10:00:00')});
 const frames=(api,p,seconds,hands)=>{for(let t=0;t<seconds-1e-9;t+=DT){api.update(DT,p,null,true,true,false);if(hands&&api.holding)api.holdProps(hands(),hands(),0);}};
 // A2: a job runs, the player walks to another job's sign inside its area: no offer, `other` names it, start() refuses.
 {const pairs=[];for(const a of C.JOBS)for(const b of C.JOBS)if(a!==b&&!R.outsideJobArea(a,b.board.x,b.board.z))pairs.push([a,b]);
  assert(pairs.length>0,'some signs sit inside another job\'s area (Wall rebounds / Offside)');
  for(const [a,b] of pairs){const api=make();frames(api,at(a.board),.5);assert.equal(api.getView().near,a.id,`${a.id}: the sign offers`);
   assert.equal(api.start(a.id),true);frames(api,at(b.board),.6);const v=api.getView();
   assert.equal(api.run?.def.id,a.id,`${a.id} still runs at the ${b.id} sign`);assert.equal(v.near,null,`no ${b.id} offer while ${a.id} runs`);assert.equal(v.other,b.id,'G there can explain');
   assert.equal(api.start(b.id),false,`start(${b.id}) refuses while ${a.id} runs`);assert.equal(api.run?.def.id,a.id,'the running job is untouched');assert.equal(api.getView().active?.id,a.id);
   api.quit();frames(api,at(b.board),.6);assert.equal(api.getView().near,b.id,'after Stop job the other sign offers again');assert.equal(api.start(b.id),true);api.dispose();}
  const jobsSrc=fs.readFileSync(path.join(base,'components/IslandJobs.tsx'),'utf8');
  assert.match(jobsSrc,/if\(view\.active\)\{if\(view\.other\)\{e\.preventDefault\(\);busyNote\(\);\}return;\}/,'G during a job shows the note instead of opening another job');
  assert.match(jobsSrc,/if\(runtime&&!runtime\.start\(id\)\)\{busyNote\(\);/,'Start job that is refused shows the note');
  assert.match(jobsSrc,/title:'Finish or stop your current job first'[^\n]*merge:'job-busy'/,'a gentle, merged note in the toast lane');}
 // A8: the sign glow eases every frame (like the buildings): ~0.9 within 0.3 s of the offer, gone ~0.5 s after leaving.
 {const api=make(),job=C.jobById('garden-shift'),glow=()=>{let m=null;api.root.getObjectByName('job-sign-selection').traverse(o=>{if(o.name==='building-edge-outline')m=o;});return m.material.uniforms.strength.value;};
  let t=0;const p=at(job.board);while(api.getView().near!==job.id&&t<2){frames(api,p,DT);t+=DT;}assert.equal(api.getView().near,job.id);
  frames(api,p,.3);assert(glow()>=.9,`glow ${glow().toFixed(2)} ≥ 0.9 within 0.3 s (it took ~4 s when eased only on the board tick)`);
  const away={x:p.x+30,y:floor(p.x+30,p.z),z:p.z};t=0;while(api.getView().near!==null&&t<2){frames(api,away,DT);t+=DT;}
  frames(api,away,.6);assert(glow()<.02,`faded out within 0.6 s (${glow().toFixed(3)})`);
  const effect=api.root.getObjectByName('building-outline-glow');assert.equal(effect.visible,false,'nothing draws once faded');api.dispose();}
 // A9: on job end the last one-shot pose plays to its end; only the Kick the tree and the parked ball are dropped.
 {const m=JM.createJobMoves(),pl={x:0,z:0,y:0,yaw:0},fl=()=>0;m.start('toss',pl,{x:0,z:2},fl,false,{x:.5,y:.2,z:.5});m.update(.1,pl,fl,null);assert(m.parked);
  m.end();assert.equal(m.posing,'toss','the toss keeps playing after the job ends');assert(!m.parked,'the ball is back at the feet');
  let f,last=0,n=0;while(m.posing&&n++<100){f=m.update(.05,pl,fl,null);if(f.pose){assert.equal(f.pose.kind,'toss');last=f.pose.progress;}}assert.equal(last,1,'the pose reached its end (progress 1)');
  for(const k of ['tipbasket','throwin','place','mallet','drop','flagup']){const q=JM.createJobMoves();q.start(k,pl,null,fl,false);q.end();assert.equal(q.posing,k,`${k} survives the job end`);}}
 // A10: after "Drop in crate" the basket stays in the hand through the tip, then is set down (hidden), never left in mid-air.
 {const api=make(),job=C.jobById('garden-shift');let hand={x:job.board.x,y:1,z:job.board.z};const hands=()=>hand;
  frames(api,at(job.board),.5);assert.equal(api.start('garden-shift'),true);let guard=0;
  while(api.run&&guard++<200){const r=api.run;const g=r.phase==='deliver'?job.deliver:api.goals()[0];assert(g,'always somewhere to go');const p=at(g);hand={x:p.x+.3,y:p.y+1,z:p.z};frames(api,p,.15,hands);
   const a=api.getView().active?.actions?.[0];if(a)api.act(a.id);frames(api,p,.05,hands);}
  assert.equal(api.run,null,'the shift is done');const basket=api.root.getObjectByName('garden-basket');assert(basket,'the basket exists during the wind-down');
  assert(api.holding,'winding down: Town keeps posing the hands');hand={x:hand.x+1,y:hand.y,z:hand.z+1};frames(api,{x:hand.x,y:0,z:hand.z},.05,hands);
  assert(!basket.visible||Math.abs(basket.position.x-hand.x)<1e-6,'while visible, the basket is in the hand (it used to freeze where the hand was)');
  frames(api,{x:hand.x,y:0,z:hand.z},1.3,()=>{hand={x:hand.x+.05,y:hand.y,z:hand.z};return hand;});
  assert(!basket.visible||!basket.parent,'after the tip the basket is put away');assert(!api.holding,'props disposed after the wind-down');api.dispose();}
 // A7: two tabs share one ledger. Tab A has cached it; tab B finishes Rake; tab A finishes Rake too: run …:2 pays, and the card's
 // number (credited) is what the wallet paid.
 {const shared=new Map(),A=environment(shared),B=environment(shared),runs=new Map(),clock=Date.parse('2026-09-30T11:00:00');
  const creditRun=async(id,game,target)=>{const had=runs.get(id)??0;runs.set(id,Math.max(had,target));return Math.max(0,target-had);};
  const EA=A.load('lib/town/jobs/jobEconomy.ts');EA.readJobLedger(clock);// tab A's cache (its payday intro card was open)
  const wA=A.load('lib/town/jobs/jobWallet.ts').createJobWallet({creditRun,balance:()=>0,caps:{live:20},now:()=>clock}),wB=B.load('lib/town/jobs/jobWallet.ts').createJobWallet({creditRun,balance:()=>0,caps:{live:20},now:()=>clock});
  const b=await wB.payJob('leaf-rake','Rake the leaves',30);assert(b.credited>0);const a=await wA.payJob('leaf-rake','Rake the leaves',31);
  assert(runs.has(`island-job:leaf-rake:${EA.localDay(clock)}:2`),'tab A used shift 2 (fresh ledger), not a repeat of shift 1');
  assert(a.credited>0&&a.credited===a.coins,`tab A was paid (${a.credited} of ${a.coins})`);assert.equal(JSON.parse(shared.get(EA.JOBS_STORAGE_KEY)).today['leaf-rake'],2,'both shifts recorded');
  const card=fs.readFileSync(path.join(base,'components/IslandJobs.tsx'),'utf8');assert.match(card,/\+\{pay\?pay\.credited:'…'\}/,'the payday card shows the coins actually paid');assert.doesNotMatch(card,/pay\.credited\|\|pay\.coins/);}
 console.log('island jobs: audit regressions A2 A7 A8 A9 A10 pass');
}
// Regression (Sep 30 2026 overnight e2e): setPayday was swallowed into a trailing // comment, so the "Job done" card never showed.
{const fs=require('node:fs'),assert=require('node:assert/strict');const src=fs.readFileSync('components/IslandJobs.tsx','utf8');
 assert(src.split('\n').some(l=>{const i=l.indexOf('setPayday({id:def.id');return i>=0&&!l.slice(0,i).includes('//');}),'payday card is set in live code, not inside a comment');
 console.log('island jobs: payday card wired');}
