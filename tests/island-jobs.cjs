// Island jobs, Community Garden and farmers-market economy (docs/island-jobs.md).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..');
/** Values from the vm realm compare structurally. */
const same=(a,b,m)=>assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),m);
function environment(){
 const data=new Map(),cache=new Map();
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
 for(const id of JOB_IDS)assert(JOB_BASE_PAY[id]>=7&&JOB_BASE_PAY[id]<=10,`${id} pays inside the 7–10 coin band`);

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
 assert.equal(await wallet.credit(`island-job:leaf-rake:${E.localDay(clock)}:1`,paid.coins,'replay'),0);
 // Job coins are spendable on the arcade's 40-coin card pack.
 const pack=await arcade.purchaseMysteryPack(3,['A','B'],['C','D','E','F']);assert.equal(pack.ok,true);assert.equal(arcade.load().balance,STARTER_COINS+paid.coins-40);
 clock+=86400e3;const nextDay=await wallet.payJob('leaf-rake','Rake the leaves',30);assert.equal(nextDay.coins,JOB_BASE_PAY['leaf-rake']);

 // ---- Each job completes (pure rules, walking to every goal) ----
 const C=env.load('lib/town/jobs/jobCatalog.ts'),R=env.load('lib/town/jobs/jobRules.ts'),V=env.load('lib/town/venues.ts');
 assert.equal(C.JOBS.length,JOB_IDS.length);same([...C.JOBS.map(j=>j.id)].sort(),[...JOB_IDS].sort(),'each job has exactly one definition');
 assert(C.JOBS.length>=9,'the Sep 27 jobs (offside flag, ball pump, goal anchors) are in the catalog');
 assert(!C.JOBS.some(j=>j.id==='kit-room'),'the kit room job was removed (user, Sep 29 2026)');
 // Signs never crowd each other, the vending machines, the fishing posts or the Clubhouse doorway.
 const vend=[[89.5,-49],[11,-48],[132.8,-69.8],[96,115],[175.26,9]],fish=[[217,212.6],[63,212.6],[237.2,66],[60,-238],[-95.5,24]];
 for(const a of C.JOBS){for(const b of C.JOBS)if(a!==b)assert(Math.hypot(a.board.x-b.board.x,a.board.z-b.board.z)>2*C.BOARD_RANGE,`${a.id} and ${b.id} signs are apart`);
  for(const [x,z] of [...vend,...fish,[81.36,-52.8]])assert(Math.hypot(a.board.x-x,a.board.z-z)>C.BOARD_RANGE+3,`${a.id} sign is clear of (${x},${z})`);}
 for(const job of C.JOBS){
  assert(job.lesson.length>60&&job.intro&&job.howTo,`${job.id} teaches football`);assert(JOB_IDS.includes(job.id));
  const run=R.startRun(job),floor=(x,z)=>V.fieldSurfaceHeight(x,z);let guard=0,done=false,events=[];
  if(job.kind==='sort'){
   const walk=q=>R.stepRun(run,{x:q.x,y:floor(q.x,q.z),z:q.z},.5,floor);
   assert.equal(R.runHint(run),'Go to the kit hamper and take the first shirt.');
   for(let i=0;i<job.task.items.length;i++){const item=job.task.items[i];
    same(R.runGoals(run),[job.deliver],'shirts come from the hamper');events.push(...walk(job.deliver));assert.equal(run.carrying,i);
    assert.equal(R.runGoals(run).length,0,'no arrow while carrying: read the clue first');assert.match(R.runHint(run),new RegExp(`Number ${item.number}`));
    if(i===0){const wrongSlot=(item.slot+1)%job.targets.length,ev=walk(job.targets[wrongSlot]);assert(ev.some(e=>e.type==='wrong'),'a wrong peg explains');assert.equal(run.carrying,0,'the shirt stays in your hands');same(R.runGoals(run),[job.targets[item.slot]],'after one wrong try the arrow shows the right peg');}
    events.push(...walk(job.targets[item.slot]));assert.equal(run.step,i+1);}
   done=run.phase==='done';
   same(job.task.items.map(it=>[it.number,job.task.slots[it.slot]]),[[9,'STRIKER'],[1,'GOALKEEPER'],[7,'RIGHT WING'],[3,'LEFT BACK'],[10,'PLAYMAKER']],'traditional 2–3–5 numbers (1928)');
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
   const t=job.task;same([t.min,t.max],[.6,1.1],'Law 2: 0.6–1.1 atmospheres');
   events.push(...R.stepRun(run,{x:job.targets[0].x,y:floor(job.targets[0].x,job.targets[0].z),z:job.targets[0].z},.1,floor));assert.equal(run.phase,'pump');
   R.runAction(run,'ready');assert.equal(run.step,0,'a soft ball is not accepted');assert.match(run.note,/too soft/);
   for(let b=0;b<t.start.length;b++){let g=0;while(run.pressure<t.min&&g++<20)events.push(...R.runAction(run,'pump'));
    if(b===0){while(run.pressure<=t.max)R.runAction(run,'pump');R.runAction(run,'ready');assert.equal(run.step,0,'too hard is not accepted');assert.match(run.note,/too hard/);while(run.pressure>t.max)R.runAction(run,'release');if(run.pressure<t.min)R.runAction(run,'pump');}
    assert(run.pressure>=t.min&&run.pressure<=t.max);events.push(...R.runAction(run,'ready'));assert.equal(run.step,b+1);}
   done=run.phase==='done';
  }else if(job.kind==='rebound'){
   same(R.reboundEvent(run,'shot'),[],'shots only count after the wall passes');
   for(let i=0;i<C.REBOUND_WALL.passes;i++)events.push(...R.reboundEvent(run,'pass'));assert.equal(run.phase,'shots');
   assert(R.hitsReboundTarget(156.5,.9,-29.2));assert(!R.hitsReboundTarget(150,.9,-29.2),'the quest frame is not the target');assert(!R.hitsReboundTarget(156,2.6,-29.2),'over the target');
   assert(R.onReboundWall({x:150,z:-29.3}));assert(!R.onReboundWall({x:100,z:-29.3}));
   for(let i=0;i<C.REBOUND_WALL.shots;i++)events.push(...R.reboundEvent(run,'shot'));done=run.phase==='done';
  }else{
   R.stepRun(run,{x:job.board.x,y:floor(job.board.x,job.board.z),z:job.board.z},.1,floor);
   if(job.kind==='trail'){const far=job.targets[5];assert.equal(R.stepRun(run,{x:far.x,y:floor(far.x,far.z),z:far.z},.1,floor).length,0,'trail dashes paint in order');}
   while(run.phase!=='done'&&guard++<1200){
    if(job.task?.type==='sort'&&run.carrying>=0){const g=job.targets[job.task.items[run.step].slot];events.push(...R.stepRun(run,{x:g.x,y:floor(g.x,g.z),z:g.z},.1,floor));continue;}
    if(job.kind==='offside'&&run.phase==='call'){events.push(...R.runAction(run,R.offsideClip(run).flag?'flag':'play-on'));continue;}
    if(job.kind==='offside'&&run.phase==='explain'){events.push(...R.runAction(run,'next'));continue;}
    if(job.task?.type==='pump'&&run.phase==='pump'){events.push(...R.runAction(run,run.pressure<job.task.min?'pump':run.pressure>job.task.max?'release':'ready'));continue;}
    const g=R.runGoals(run)[0]??job.targets[0];assert(g,`${job.id} has an active target or action`);events.push(...R.stepRun(run,{x:g.x+.3,y:floor(g.x,g.z),z:g.z-.3},.1,floor));
   }
   done=run.phase==='done';
   const high=R.startRun(job),t=job.targets[0];assert.equal(R.stepRun(high,{x:t.x,y:floor(t.x,t.z)+20,z:t.z},.1,floor).length,0,'flying over a target does not collect it');
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
 // The former Clubhouse is a cage court; the outdoor kit job remains without an interior.
 const town=fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8'),world=fs.readFileSync(path.join(base,'lib/town/world.ts'),'utf8');
 assert.doesNotMatch(town,/BootRoom|bootRoom|boot-room/);assert.doesNotMatch(world,/house\([^\n]*'CLUBHOUSE'/);assert.match(world,/Pocket futsal court/);
 console.log('island jobs: economy, wallet, all catalog jobs, garden, market and cage-court checks passed');
})().catch(e=>{console.error(e);process.exit(1);});
