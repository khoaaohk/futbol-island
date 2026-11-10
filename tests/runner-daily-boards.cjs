// Breakaway fresh courses, Daily Run and route boards (Nov 10 2026, arcade audit part 1). Run: node tests/runner-daily-boards.cjs
//  1. seeds: the default source keeps the old deterministic formula (tests), an injected source gives fresh courses, a test can fix a
//     seed, the tennis/pinball cabinets' idle runner uses no run id, classic keeps its authored lanes
//  2. Daily Run: one seed per local play day (same course for everyone that day), its own hills, open after 1 star
//  3. one board run a day: the first finished Daily Run posts, later runs are practice (still a personal best, never the classic record)
//  4. boards: finite routes and the Daily Run have their own boards, honest ceilings, same rate as 'runner' (never looser), the
//     pinball / strikers ceilings untouched, the migration names every board and is not applied
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const ROOT=path.join(__dirname,'..');process.chdir(ROOT);
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const store=new Map();globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const R=require('../lib/arcade/runnerGame.ts'),Mo=require('../lib/arcade/runnerModes.ts'),L=require('../lib/arcade/leaderboard.ts'),S=require('../lib/arcade/results/settle.ts');
const read=f=>fs.readFileSync(f,'utf8');

// 1. Seeds.
Mo.selectRunnerMode('night');
{const a=R.createRunnerGame(),b=R.createRunnerGame();assert.equal(a.seed,47+a.runId*7,'default source = the old formula');assert.equal(b.runId,a.runId+1);
 const idle=R.createRunnerGame({idle:true});assert.equal(idle.runId,0,'idle runner: no run id');assert.equal(R.createRunnerGame().runId,b.runId+1,'idle runner burns no serial');
 assert.equal(R.createRunnerGame({seed:1234}).seed,1234,'a test can fix the seed');
 let n=0;R.setRunnerSeedSource(()=>5000+(n++));assert.equal(R.createRunnerGame().seed,5000);assert.equal(R.createRunnerGame().seed,5001,'injected source per run');
 R.setRunnerSeedSource(R.freshRunnerSeed);const seeds=new Set(Array.from({length:20},()=>R.createRunnerGame().seed));assert(seeds.size>=19,'fresh seeds differ run to run');
 for(const s of seeds)assert(Number.isInteger(s)&&s>=1000,'fresh seed is a positive integer');
 Mo.selectRunnerMode('classic');assert.equal(R.createRunnerGame().seed,47,'classic keeps its authored course');R.setRunnerSeedSource(null);
 assert(/setRunnerSeedSource\(freshRunnerSeed\)/.test(read('lib/arcade/arcadeGames.ts'))&&/createTennis\(freshRunnerSeed\(\)\)/.test(read('lib/arcade/arcadeGames.ts')),'the browser game installs fresh seeds (runner + tennis)');
 assert(/createRunnerGame\(kind==='runner'\?\{\}:\{idle:true\}\)/.test(read('lib/arcade/arcadeGames.ts')),'tennis and pinball sessions build an idle runner');}

// 2. Daily Run seed and course.
{const day=t=>{Mo.setRunnerDailyClock(()=>t);return Mo.runnerDailyDay();};
 const t0=new Date(2026,10,10,8,0).getTime(),t1=new Date(2026,10,10,23,30).getTime(),t2=new Date(2026,10,11,0,30).getTime();
 assert.equal(day(t0),'2026-11-10');assert.equal(day(t1),'2026-11-10','same local day');assert.equal(day(t2),'2026-11-11','new day after local midnight');
 assert.equal(Mo.runnerDailySeed('2026-11-10'),Mo.runnerDailySeed('2026-11-10'));assert.notEqual(Mo.runnerDailySeed('2026-11-10'),Mo.runnerDailySeed('2026-11-11'));
 const week=new Set(Array.from({length:30},(_,i)=>Mo.runnerDailySeed(`2026-12-${String(i+1).padStart(2,'0')}`)));assert.equal(week.size,30,'a new seed every day');
 Mo.setRunnerDailyClock(()=>t0);Mo.selectRunnerMode('daily');R.setRunnerSeedSource(R.freshRunnerSeed);
 const a=R.createRunnerGame(),b=R.createRunnerGame();assert.equal(a.seed,b.seed,'every Daily Run today is the same course (fresh seeds ignored)');
 assert.equal(a.seed,Mo.runnerDailySeed('2026-11-10'));assert.equal(a.day,'2026-11-10');assert.equal(a.mode,'daily');
 // Same course: the lanes of the first 40 waves are the same function of the seed for every player.
 const lanes=s=>Array.from({length:40},(_,i)=>i<6?R.RUNNER_WAVE_LANES[i%6]:[-1,0,1][Math.floor(R.seeded(s,i)*3)]).join();
 assert.equal(lanes(a.seed),lanes(Mo.runnerDailySeed('2026-11-10')));assert.notEqual(lanes(a.seed),lanes(Mo.runnerDailySeed('2026-11-11')),'tomorrow is a different course');
 R.setRunnerSeedSource(null);
 const m=Mo.RUNNER_MODES.daily;assert.equal(m.board,'rundaily');assert(m.finish>0&&m.bossKeeper&&m.ownBest);assert(!Mo.RUNNER_MODE_ORDER.includes('daily'),'not in the six-route ladder');
 assert(m.buffer>=Mo.RUNNER_MODES.classic.buffer&&m.coyote>=Mo.RUNNER_MODES.classic.coyote,'classic forgiveness windows');
 Mo.resetRunnerRoutes();store.clear();assert.equal(Mo.isRunnerModeOpen('daily',1),false,'shut for a first-timer');assert.equal(Mo.runnerModeLockHint('daily'),'Get 1 ★ on Warm-up or Breakaway');
 assert.equal(Mo.isRunnerModeOpen('daily',2),true,'open with a stage-2 record');}

// 3. One board run a day.
{store.clear();Mo.resetRunnerRoutes();const day='2026-11-10',end=(score,d=day)=>({mode:'daily',score,level:4,goals:3,collected:10,day:d});
 const first=S.settleArcadeResult(S.arcadeResultFor('runner',{runner:end(15000)}));assert.equal(first.boardScore,15000,'first finished run posts');assert.equal(first.record,null,'never the classic record');
 assert.equal(store.get('fi2-arcade-record-runner-v1'),undefined);assert.equal(store.get('fi.game.runner.best'),undefined,'nor the old best key');
 const again=S.settleArcadeResult(S.arcadeResultFor('runner',{runner:end(20000)}));assert.equal(again.boardScore,null,'practice: no board entry');
 Mo.setRunnerDailyClock(()=>new Date(2026,10,10,12).getTime());assert.deepEqual(Mo.readRunnerDaily(day),{day,counted:true,best:20000,runs:2},'practice still keeps the best');
 assert.equal(Mo.runnerTierBest('daily'),20000,'the menu and best-to-beat read today\'s best');
 assert.equal(S.arcadeResultFor('runner',{runner:end(1)}).board,'rundaily');assert.equal(S.arcadeResultFor('runner',{runner:end(1)}).coins,3*2+2,'coins at the classic rates');
 const tomorrow=S.settleArcadeResult(S.arcadeResultFor('runner',{runner:end(900,'2026-11-11')}));assert.equal(tomorrow.boardScore,900,'a new day, a new board run');
 const menu=read('components/games/RunnerMenu.tsx');assert(/Same course for everyone today/.test(menu)&&/'daily' as const/.test(menu),'Daily Run in the route menu with its label');
 assert(/Practice run\. Your first run today counts\./.test(menu)&&/Today’s board run!/.test(menu));Mo.setRunnerDailyClock(null);}

// 4. Boards.
{const want={warmup:'runwarm',classic:'runner',night:'runnight',storm:'runstorm',cup:'cupfinal',legend:'legend',daily:'rundaily'};
 for(const [id,b] of Object.entries(want)){assert.equal(Mo.runnerBoardFor(id),b,id);assert(L.isBoardGame(b),b+' is a board');assert(/^[a-z]{2,8}$/.test(b),'fits the session token pattern');}
 for(const id of ['warmup','classic','night','storm'])assert.equal(Mo.runnerKeepsOwnBest(id),false,id+' still writes the classic record');
 for(const g of ['runwarm','runnight','runstorm','rundaily']){const r=L.BOARD_RULES[g],base=L.BOARD_RULES.runner;
  assert(r.max<base.max,g+': a tighter ceiling than the endless board');assert(r.perSecond<=base.perSecond&&r.base<=base.base&&r.minSeconds>=base.minSeconds,g+': never looser than runner');
  const route=Object.values(Mo.RUNNER_MODES).find(m=>m.board===g);assert(r.max>=route.finish*100+25_000,g+': ceiling = length x 100 + 25000');}
 assert.deepEqual([L.BOARD_RULES.pinball.base,L.BOARD_RULES.pinball.perSecond,L.BOARD_RULES.live.base,L.BOARD_RULES.live.perSecond],[3000,1200,300,25],'today\'s pinball/strikers ceilings unchanged');
 assert.deepEqual([...L.BOARD_TIER_TABS.runner],['runwarm','runnight','runstorm','cupfinal','legend','rundaily']);
 const files=fs.readdirSync('supabase/migrations').filter(f=>/arcade_scores_game_check/.test(read('supabase/migrations/'+f))).sort(),last=files[files.length-1];
 assert.equal(last,'20261112_runner_route_boards.sql','the route boards migration runs last');const sql=read('supabase/migrations/'+last);
 for(const g of L.BOARD_GAMES)assert(sql.includes(`'${g}'`),'SQL allows '+g);assert(/OK, runner route boards installed/.test(sql));
 assert(!/\bdrop table\b|\btruncate\b|\bdelete from\b/i.test(sql.replace(/--.*$/gm,'')),'additive');}

console.log('runner daily + boards: fresh seeds, Daily Run course, one board run a day, route boards OK');
