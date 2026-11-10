// Today in the arcade (Nov 10 2026, part 2 of the arcade audit): daily challenges per cabinet, once-a-day learning coins
// (the daily Pass Puzzle among them), the soft weekly pennant, the arcade trophies and the save-code sync key.
// Run: node -r ./scripts/test-ts-cache.cjs tests/arcade-today.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const T=require('../lib/arcade/arcadeTodayCore.ts');
const {LEARN_COINS,ARCADE_TODAY_PER_DAY}=require('../lib/economy.ts');
const {createArcadeWallet}=require('../lib/arcade/arcadeWalletCore.ts');
const {createLearnCoins,learnRunId}=require('../lib/town/learnCoins.ts');
const {isTrainingRun}=require('../lib/town/dailyMeter.ts');
const {SYNC_KEYS,isSyncKey}=require('../lib/saves/snapshot.ts');
const {TENNIS_COURTS}=require('../lib/games/soccerTennis.ts');
const {RUNNER_MODE_ORDER}=require('../lib/arcade/runnerModes.ts');
const {localPlayDay}=require('../lib/town/dailyPlay.ts');

(async()=>{
// 1. Daily selection: one challenge per cabinet, deterministic per day, varied across days.
{const day='2026-11-10',a=T.todayChallenges(day),b=T.todayChallenges(day);
 assert.deepEqual(a.map(c=>c.cabinet),['runner','puzzle','live','tennis','pinball']);
 assert.deepEqual(a.map(c=>c.id),b.map(c=>c.id),'same day, same challenges');
 for(const c of a){assert(c.line.length>0&&c.line.length<=48,`short line: ${c.line}`);assert(c.point.length>0&&c.point.length<=64,`football point: ${c.point}`);}
 const days=Array.from({length:30},(_,i)=>localPlayDay(new Date(2026,10,1+i,12).getTime()));
 for(const cab of ['pinball','tennis','live']){const ids=new Set(days.map(d=>T.todayChallenge(d,cab).id));assert(ids.size>=3,`${cab} varies across days (${ids.size})`);}
 const sig=d=>T.todayChallenges(d).map(c=>c.id).join();assert(new Set(days.map(sig)).size>=10,'different days give different sets');}
// 2. Checks read the result facts.
{const day='2026-11-10',pick=c=>T.todayChallenge(day,c);
 assert.equal(T.todayMet(day,{kind:'runner',mode:'daily',day}),'runner');
 assert.equal(T.todayMet(day,{kind:'runner',mode:'daily',day:'2026-11-09'}),null,'yesterday’s course does not count');
 assert.equal(T.todayMet(day,{kind:'runner',mode:'classic',day}),null);
 assert.equal(T.todayMet(day,{kind:'puzzle',id:'daily-2026-11-10'}),'puzzle');
 assert.equal(T.todayMet(day,{kind:'puzzle',id:'1-1'}),null);
 assert.equal(T.todayMet(day,{kind:'pinball',hot:9,moves:9,goals:9}),'pinball');assert.equal(T.todayMet(day,{kind:'pinball',hot:0,moves:0,goals:0}),null);
 assert.equal(T.todayMet(day,{kind:'live',passes:0,openPasses:0,firstTimeGoals:0,cleanWin:false,setPieceGoals:0}),null);
 assert.equal(T.todayMet(day,{kind:'live',passes:20,openPasses:20,firstTimeGoals:2,cleanWin:true,setPieceGoals:1}),'live');
 assert(pick('tennis').met({kind:'tennis',court:pick('tennis').id==='win-beach'?2:1,won:true,rally:20,perfect:9,clean:20,tour:0},day));
 assert.equal(T.TODAY_TENNIS_COURTS[0],TENNIS_COURTS[0].name);assert.equal(T.TODAY_TENNIS_COURTS[1],TENNIS_COURTS[1].name);
 const s=T.strikerTodayFacts({userPassesDone:8,safePasses:6,firstTimeGoals:1,setPieceGoals:0,score:[2,0]},0);assert.equal(s.cleanWin,true);
 assert.equal(T.strikerTodayFacts({userPassesDone:8,safePasses:6,firstTimeGoals:1,setPieceGoals:0,score:[0,0]},-1).cleanWin,false);}
// 3. Once-per-day payment through the wallet's creditOnce (replay, reload, same clock): learning coins, never metered.
{assert.equal(LEARN_COINS.arcade,2);assert(LEARN_COINS.arcade*ARCADE_TODAY_PER_DAY<LEARN_COINS.quiz,'a whole day of challenges pays less than one new lesson quiz');
 let data=null,q=Promise.resolve();const clock=new Date(2026,10,10,15).getTime();
 const ports=()=>({meter:isTrainingRun,read:()=>structuredClone(data),write:v=>{data=structuredClone(v);},lock:fn=>{const t=q.then(fn);q=t.catch(()=>{});return t;},valid:new Set(['A']),grant:()=>true,notify:()=>{},now:()=>clock,id:()=>'id'+Math.random(),random:()=>0});
 const coinsFor=w=>createLearnCoins({creditOnce:(id,g,a,r)=>w.creditOnce(id,g,a,r),notify:()=>{}});
 let w=createArcadeWallet(ports()),lc=coinsFor(w);const day=localPlayDay(clock);
 assert.equal(await lc.pay('arcade',`${day}:puzzle`,'Today in the arcade: Pass Puzzles'),2,'first daily puzzle solve pays');
 assert.equal(await lc.pay('arcade',`${day}:puzzle`,'Today in the arcade: Pass Puzzles'),0,'replay pays nothing');
 w=createArcadeWallet(ports());lc=coinsFor(w);
 assert.equal(await lc.pay('arcade',`${day}:puzzle`,'x'),0,'reload pays nothing');
 assert.equal(await lc.pay('arcade',`${day}:pinball`,'x'),2,'another cabinet pays once');
 assert.equal(await lc.pay('arcade',`2026-11-11:puzzle`,'x'),2,'the next day pays again');
 assert(data.runs[learnRunId('arcade',`${day}:puzzle`)],'learn:arcade:<day>:<cabinet> receipt');assert.equal(data.runs[learnRunId('arcade',`${day}:puzzle`)].game,'learn');
 assert.equal(isTrainingRun(learnRunId('arcade',`${day}:puzzle`),data.runs[learnRunId('arcade',`${day}:puzzle`)]),false,'never on the Training meter');
 // The card's own record is idempotent too.
 let s=T.emptyToday();const r1=T.markTodayDone(s,day,'puzzle'),r2=T.markTodayDone(r1.save,day,'puzzle');assert(r1.fresh);assert(!r2.fresh);assert.equal(r2.save,r1.save);
 // PassPuzzleGame: the daily id is no longer skipped for reward; it routes to noteArcadeToday.
 const src=fs.readFileSync('components/games/PassPuzzleGame.tsx','utf8');assert(/if\(success&&id\.startsWith\('daily-'\)\)void noteArcadeToday\(\{kind:'puzzle',id\}\)/.test(src));
 const room=fs.readFileSync('lib/arcade/arcadeToday.ts','utf8');assert(/learnCoins\.pay\('arcade',`\$\{day\}:\$\{cabinet\}`/.test(room),'one id per challenge per day');}
// 4. Weekly pennant: 3 different days in one Monday-start week; any days; nothing lost by skipping.
{assert.equal(T.weekOf('2026-11-10'),'2026-11-09');assert.equal(T.weekOf('2026-11-09'),'2026-11-09');assert.equal(T.weekOf('2026-11-15'),'2026-11-09');assert.equal(T.weekOf('2026-11-16'),'2026-11-16');
 let s=T.emptyToday();
 for(const c of ['runner','puzzle','live'])s=T.markTodayDone(s,'2026-11-10',c).save;
 assert(!T.pennantLit(s,'2026-11-10'),'3 challenges on ONE day do not light it');
 s=T.markTodayDone(s,'2026-11-12','tennis').save;assert(!T.pennantLit(s,'2026-11-12'));
 const r=T.markTodayDone(s,'2026-11-15','pinball');assert(r.pennant&&T.pennantLit(r.save,'2026-11-15'),'third different day (Sunday) lights it');
 assert(!T.markTodayDone(r.save,'2026-11-15','live').pennant,'lit once per week');assert.equal(r.save.pennants.length,1);
 let t=T.markTodayDone(r.save,'2026-11-15','live').save;t=T.markTodayDone(t,'2026-11-16','live').save;assert(!T.pennantLit(t,'2026-11-16'),'a new week starts unlit');
 assert.equal(t.pennants.length,1,'past pennants are kept after a quiet week');
 let u=T.emptyToday();for(const d of ['2026-11-01','2026-11-02','2026-11-03'])u=T.markTodayDone(u,d,'runner').save;assert.equal(u.pennants.length,0,'Sun + Mon + Tue straddle two weeks');
 // The Play button: a locked Daily Run reads "Play Breakaway" and opens the cabinet normally; unlocked it is "Play" into today's mode.
 assert.deepEqual(T.todayPlayButton('runner',{done:false,runnerOpen:false}),{label:'Play Breakaway',today:false},'locked Daily Run: Play Breakaway, normal launch');
 assert.deepEqual(T.todayPlayButton('runner',{done:true,runnerOpen:false}),{label:'Play Breakaway',today:false},'locked wins over done');
 assert.deepEqual(T.todayPlayButton('runner',{done:false,runnerOpen:true}),{label:'Play',today:true},'unlocked: Play opens the Daily Run');
 assert.deepEqual(T.todayPlayButton('runner',{done:true,runnerOpen:true}),{label:'Play again',today:true});
 assert.deepEqual(T.todayPlayButton('pinball',{done:false,runnerOpen:false}),{label:'Play',today:true},'the lock is the Breakaway row only');
 {const panelSrc=fs.readFileSync('components/arcade/ArcadeTodayPanel.tsx','utf8');assert(/if\(btn\.today\)requestTodayLaunch\(c\.cabinet\);onPlay\(c\.cabinet\)/.test(panelSrc),'only a today button requests the today launch');
  assert(/>\{btn\.label\}<\/button>/.test(panelSrc),'the button shows the helper label');
  assert(/\.play\{[^}]*font:inherit[^}]*font-weight:800/.test(fs.readFileSync('components/arcade/ArcadeTodayPanel.module.css','utf8')),'Play buttons: the UI sans at 800, never the brush');}
 const card=fs.readFileSync('components/arcade/ArcadeTodayPanel.tsx','utf8');assert(!/\b(streak|missed|lose|lost)\b/i.test(card),'no streak or missed-day copy');
 // Old days are pruned to 14; the save sanitises junk.
 let v=T.emptyToday();for(let i=1;i<=20;i++)v=T.markTodayDone(v,`2026-10-${String(i).padStart(2,'0')}`,'runner').save;assert.equal(Object.keys(v.done).length,14);
 assert.deepEqual(T.sanitizeToday({done:{'bad':['runner'],'2026-11-10':['runner','nope']},pennants:['x','2026-11-09'],trophies:{'arcade:pinball':5,'other':1}}),{v:1,done:{'2026-11-10':['runner']},pennants:['2026-11-09'],trophies:{'arcade:pinball':5}});}
// 5. Trophies: one per cabinet + the pennant ×4, each with a football skill.
{const base={runnerStars:[3,3,3,3,3,2],pinballFinalGoals:2,tennisLegendCup:false,strikerLegendWins:0,expertSolved:5,expertTotal:6,pennants:3};
 assert.deepEqual(T.arcadeTrophiesFrom(base),[],'just short of every bar');
 const all={runnerStars:[3,3,3,3,3,3],pinballFinalGoals:3,tennisLegendCup:true,strikerLegendWins:1,expertSolved:6,expertTotal:6,pennants:4};
 const got=T.arcadeTrophiesFrom(all,{'arcade:pinball':7});assert.deepEqual(got.map(t=>t.id),['arcade:breakaway','arcade:pinball','arcade:tennis','arcade:strikers','arcade:puzzles','arcade:pennant']);
 assert.equal(got[1].at,7);for(const t of T.ARCADE_TROPHIES)assert(t.skill.length>4&&t.bar.length>4,'each states its football skill and bar');
 assert.deepEqual(T.arcadeTrophiesFrom({...all,expertTotal:0,expertSolved:0}).map(t=>t.id).includes('arcade:puzzles'),false);
 assert.equal(RUNNER_MODE_ORDER.length,6,'six Breakaway routes');assert.equal(TENNIS_COURTS[8].name,'Legend Cup','tennis star slot 9 is the Legend Cup');
 const src=fs.readFileSync('lib/arcade/arcadeToday.ts','utf8');for(const k of ['fi2-runner-routes-v1','fi2-pinball-tiers-v1','fi2-tennis-stars-v1','fi2-strikers-tiers-v1','fi2-pass-puzzles-v1'])assert(src.includes(`'${k}'`),k);
 assert(fs.readFileSync('lib/arcade/runnerModes.ts','utf8').includes("const KEY='fi2-runner-routes-v1'"));assert(fs.readFileSync('lib/games/soccerPinballTiers.ts','utf8').includes("const KEY='fi2-pinball-tiers-v1'"));
 assert(fs.readFileSync('lib/arcade/strikerTiers.ts','utf8').includes("const KEY='fi2-strikers-tiers-v1'"));assert(fs.readFileSync('components/games/PassPuzzleGame.tsx','utf8').includes("const PROGRESS_KEY='fi2-pass-puzzles-v1'"));
 assert(fs.readFileSync('lib/town/backpackStore.ts','utf8').includes('...arcadeTrophySources()'),'arcade trophies on the Trophy shelf');}
// 6. Save-code sync: the one new key travels with the save, like fi2-runner-daily-v1.
{assert(SYNC_KEYS.includes('fi2-arcade-today-v1'));assert(isSyncKey(T.ARCADE_TODAY_KEY));assert(SYNC_KEYS.includes('fi2-runner-daily-v1'));}
console.log('arcade-today ok');
})().catch(e=>{console.error(e);process.exit(1);});
