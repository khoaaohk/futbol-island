// Breakaway Run polish (Nov 8 2026): elite tiers (Cup Final, Legend) with their own boards, the perfect-dodge chain, the
// "why you lost" line, tier bests, coin parity, reduced motion, pooled sounds and the simplified card.
import '../scripts/register-local-ts.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const R=await import('../lib/arcade/runnerGame.ts');
const Mo=await import('../lib/arcade/runnerModes.ts');
const H=await import('../lib/arcade/runnerHud.ts');
const L=await import('../lib/arcade/leaderboard.ts');
const Srv=await import('../lib/arcade/leaderboardServer.ts');
const W=await import('../lib/arcade/arcadeWalletCore.ts');
const {createRunnerGame,tickRunner,runnerShoot,runnerTopSpeed,RUNNER_PERFECT_DODGE,runnerPerfectMultiplier}=R;
const {RUNNER_MODES,RUNNER_MODE_ORDER,selectRunnerMode,runnerBoardFor,isRunnerModeOpen,resetRunnerRoutes,readRunnerRoutes,runnerRunStars,recordRunnerStars,saveRunnerTierBest,runnerTierBest}=Mo;
const read=f=>fs.readFileSync(f,'utf8');
const game=(id,extra={})=>{selectRunnerMode(id);const s=createRunnerGame();Object.assign(s,extra);return s;};
const run=(s,sec,hz=60,each)=>{for(let i=0;i<sec*hz;i++){each?.(s,i);tickRunner(s,1/hz);}};
const def=(role,z,lane=0)=>({kind:'defender',lane,z,role,passed:false,openLane:lane?0:1});
const blank={v:1,mode:'warmup',stars:{warmup:0,classic:0,night:0,storm:0,cup:0,legend:0},played:0,best:{}};

// 1. The ladder: two new tiers after the Storm Final, each harder, each with less (never zero) forgiveness.
assert.deepEqual([...RUNNER_MODE_ORDER],['warmup','classic','night','storm','cup','legend']);
{const st=RUNNER_MODES.storm,cup=RUNNER_MODES.cup,lg=RUNNER_MODES.legend;
 for(const m of [cup,lg]){assert(m.hard&&m.pace>=st.pace&&m.gap<st.gap&&m.startLevel>st.startLevel&&m.moving>=st.moving,`${m.id} is harder than the Storm Final`);
  assert(m.combos&&m.doubleJump&&m.hazards,`${m.id}: every answer tool (double jump) stays on`);}
 assert.equal(cup.finish,2400);assert(cup.bossKeeper);assert.equal(lg.finish,0,'Legend is endless (a high-score chase)');assert.equal(lg.maxLives,2);
 for(const k of ['buffer','coyote','laneGrace'])for(let i=1;i<RUNNER_MODE_ORDER.length;i++){const a=RUNNER_MODES[RUNNER_MODE_ORDER[i-1]][k],b=RUNNER_MODES[RUNNER_MODE_ORDER[i]][k];
  assert(b<=a,`${k} never grows up the ladder`);assert(b>=.06,`${k} keeps a readable floor (${RUNNER_MODE_ORDER[i]} ${b})`);}}

// 2. Own boards: the four original routes keep 'runner'; Cup Final and Legend post to their own boards, which the server accepts.
/* Nov 10 2026: the finite routes have their own boards; Breakaway keeps 'runner' (tests/runner-daily-boards.cjs) */assert.equal(runnerBoardFor('classic'),'runner');assert.equal(runnerBoardFor('warmup'),'runwarm');assert.equal(runnerBoardFor('night'),'runnight');assert.equal(runnerBoardFor('storm'),'runstorm');
assert.equal(runnerBoardFor('cup'),'cupfinal');assert.equal(runnerBoardFor('legend'),'legend');assert.equal(runnerBoardFor('nope'),'runner');
// Endless play (Nov 10 2026): the Breakaway ceilings rose to 5,000,000; the table's ceiling in force is docs/arcade-aaa/endless-supabase.sql (9,000,000).
{const sqlCap=Math.max(Number(/score between 1 and (\d+)/.exec(read('supabase/migrations/20261013_arcade_leaderboards.sql'))[1]),Number(/score between 1 and (\d+)/.exec(read('docs/arcade-aaa/endless-supabase.sql'))[1])),mig=read('supabase/migrations/20261108_runner_tier_boards.sql');
 for(const g of ['cupfinal','legend']){assert(L.isBoardGame(g));assert(/^[a-z]{2,8}$/.test(g),'fits the session token pattern');const r=L.BOARD_RULES[g];
  assert(r.max<=sqlCap,'inside the SQL ceiling');assert(r.perSecond<=2_000&&r.minSeconds>=12,'rate and minimum play time stay strict');
  assert(new RegExp(`'${g}'`).test(mig),'migration widens the game check');
  const tok=Srv.makeToken('x'.repeat(40),g,Date.now());assert.equal(Srv.readToken('x'.repeat(40),tok)?.game,g,'session token round-trips');
  assert.equal(L.scorePlausible(g,500_000,60_000),'fast');assert.equal(L.scoreInBounds(g,400_001),true,'an honest long run posts');assert.equal(L.scoreInBounds(g,5_000_001),false);}
 for(const g of ['runner','pinball','tennis','live','puzzle','kick'])assert(new RegExp(`'${g}'`).test(mig),`migration keeps '${g}'`);
 assert.equal(L.BOARD_RULES.runner.max,5_000_000,'endless play: the runner ceiling rose');assert.deepEqual([L.BOARD_RULES.runner.base,L.BOARD_RULES.runner.perSecond,L.BOARD_RULES.runner.minSeconds],[3000,1500,12],'the original runner rate rules are untouched');}

// 3. Unlocks and stars: Cup Final after 2 Storm stars, Legend after 2 Cup stars; Legend's stars are distance and goals.
resetRunnerRoutes(blank);assert(!isRunnerModeOpen('cup',6)&&!isRunnerModeOpen('legend',6));
recordRunnerStars({mode:'storm',finished:true,won:true,goals:1,level:8,hits:1,lives:2});assert(isRunnerModeOpen('cup',1));assert(!isRunnerModeOpen('legend',1));
recordRunnerStars({mode:'cup',finished:true,won:true,goals:2,level:9,hits:2,lives:1});assert(isRunnerModeOpen('legend',1));
assert.deepEqual(runnerRunStars({mode:'legend',finished:false,won:false,goals:8,level:9,hits:2,lives:0,distance:1200}),[true,true,false]);
assert.deepEqual(runnerRunStars({mode:'legend',finished:false,won:false,goals:0,level:6,hits:2,lives:0,distance:300}),[false,false,false],'starting at stage 6 earns no free stars');

// 4. Tier bests live in the routes save; old saves (no best map) still read; the classic record is never written by an elite run.
resetRunnerRoutes(blank);assert.equal(runnerTierBest('legend'),0);assert(saveRunnerTierBest('legend',1234));assert(!saveRunnerTierBest('legend',900),'only a better score');
assert.equal(runnerTierBest('legend'),1234);assert.equal(runnerTierBest('cup'),0);
resetRunnerRoutes({v:1,mode:'storm',stars:{warmup:1,classic:2,night:2,storm:1},played:4});assert.equal(readRunnerRoutes().stars.storm,1);assert.equal(runnerTierBest('cup'),0,'old saves read');
{const g=read('components/games/ArcadeGame3D.tsx'),rr=read('lib/arcade/results/runnerResult.ts');/* Nov 10 2026: game over moved to lib/arcade/results */assert(/const own=runnerKeepsOwnBest\(s\.mode\);[^]{0,300}?record:own\?null:/.test(rr)&&/if\(r\.runnerTierBest\)saveRunnerTierBest[^;]*;\s*else if\(r\.record\)/.test(read('lib/arcade/results/settle.ts')),'elite runs skip the classic record');
 assert(/beginBoardSession\(boardKind\)/.test(g)&&/<HighScoreEntry game=\{kind==='runner'\?runnerBoardFor\(/.test(g),'session and high-score entry use the tier board');}

// 5. Coins: an elite run pays exactly the classic rate (goals and footballs) inside the same per-run cap.
{const st={goals:2,collected:15};assert.equal(W.arcadeCoinTarget("runner",st),2*2+3);assert(W.arcadeCoinTarget('runner',{goals:999,collected:9999})<=W.ARCADE_COIN_CAPS.runner,'capped');
 assert(!/mode/.test(/export function arcadeCoinTarget[\s\S]*?\n}/.exec(read('lib/arcade/arcadeWalletCore.ts'))[0]),'no per-mode coin bonus');}

// 6. Perfect dodge: a late lane cut away from a committed tackle scores ×2, a chain climbs to ×5, a tackle resets it.
const dodge=(s,cutAt)=>{s.objects.push(def('jockey',-30,s.lane));let cut=false;
 for(let i=0;i<240;i++){const o=s.objects.find(x=>x.kind==='defender'&&!x.passed);if(!o)break;if(!cut&&-o.z<=cutAt){s.lane=s.lane>=1?0:s.lane+1;cut=true;}tickRunner(s,1/60);}};
{const s=game('classic',{spawn:99,nextGoal:1e6});dodge(s,3.2);assert.equal(s.lives,3);assert.equal(s.perfectDodges,1,'a late cut is a perfect dodge');assert.equal(s.perfectChain,1);
 assert.equal(s.eventKind,'perfect');assert.equal(H.runnerFlash(s),'','no in-play word for a perfect dodge (Oct 27 clean-UI rule; Nov 8 2026)');const one=s.score;assert.equal(one,25*2,'×2 the dodge reward');
 run(s,.3);dodge(s,3.2);assert.equal(s.perfectChain,2);assert.equal(H.runnerFlash(s),'');
 const e=game('classic',{spawn:99,nextGoal:1e6});dodge(e,11);assert.equal(e.lives,3);assert.equal(e.perfectDodges,0,'an earlier cut is a normal dodge');assert(e.nearMisses<=1&&e.score<=25,'and pays less');
 assert.equal(runnerPerfectMultiplier(1),2);assert.equal(runnerPerfectMultiplier(9),1+RUNNER_PERFECT_DODGE.maxChain);assert(RUNNER_PERFECT_DODGE.window<=.4);
 const h=game('classic',{spawn:99,nextGoal:1e6,perfectChain:3,perfectAt:0});h.objects=[{kind:'cone',lane:0,z:-.2,passed:false,openLane:1}];tickRunner(h,.05);assert.equal(h.perfectChain,0,'a tackle resets the chain');}

// 6b. Perfect dodge end-to-end (QA Nov 8 2026): five late cuts in a row climb ×2 → ×3 → ×4 → ×5 and cap at ×5, the in-play flash never
// says PERFECT (Oct 27 clean-UI rule), a pause past the chain window starts over at ×2, and a real tackle zeroes the chain.
{const s=game('classic',{spawn:99,nextGoal:1e6}),ks=[];
 for(let n=0;n<5;n++){const before=s.score;dodge(s,3.2);assert.equal(s.lives,3);assert.equal(s.perfectChain,n+1);ks.push(Number(/×(\d)/.exec(s.message)[1]));
  assert(s.score-before>=25*ks[n],'the dodge pays at least its chain multiple');
  for(let i=0;i<20;i++){const f=H.runnerHud(s).flash;assert(!/perfect/i.test(f),`no PERFECT in the HUD flash (${f})`);tickRunner(s,1/60);}}
 assert.deepEqual(ks,[2,3,4,5,5],'chain multiplier ×2 … ×5, capped');assert.equal(s.perfectDodges,5);assert.equal(s.bestPerfectChain,5);
 run(s,RUNNER_PERFECT_DODGE.chain+.5);dodge(s,3.2);assert.equal(s.perfectChain,1,'a long gap restarts the chain');assert.match(s.message,/×2/);
 s.objects=[{...def('tackler',-1.2,s.lane),read:1,aim:s.lane,tackle:.2}];run(s,.2);assert.equal(s.lives,2,'tackled');assert.equal(s.perfectChain,0,'a tackle resets the chain');
 assert.equal(s.bestPerfectChain,5,'the best chain is kept for the card');assert.equal(H.runnerHud(s).flash,'Tackled!');}

// 6c. Full-time card (QA Nov 8 2026): a completed Warm-up keeps its goals and metres for the card. The menu remounts at full time and
// used to apply the default route there, resetting the finished run to 0 goals · 0 m; only the ready screen may do that now.
// Endless play (Nov 10 2026): the goal line clears round 1 and the run carries on; full time comes when the hearts run out, and the run
// then reads as a finished route (it reached a goal line).
{const w=game('warmup',{lives:1e6});for(let i=0;i<60*400&&!w.clears;i++){if(i%40===0)runnerShoot(w);tickRunner(w,1/60);}
 assert(w.clears===1&&w.round===2&&!w.finished&&!R.runnerOver(w),'the warm-up goal line clears the round, the run goes on');
 run(w,3);/* the road goes on past the goal line */
 for(let n=0;n<40&&w.lives>0;n++){w.lives=1;w.boost=0;w.shield=false;w.hurt=0;w.spawn=99;w.objects=[{...def('tackler',-1.2,w.lane),read:1,aim:w.lane,tackle:.2}];run(w,.3);}
 for(let i=0;i<600&&!R.runnerOver(w);i++)R.runnerOutro(w,1/60);
 assert(w.lives<=0&&w.finished&&R.runnerOver(w),'the warm-up route completes');assert(w.goals>0&&w.distance>=RUNNER_MODES.warmup.finish,'goals and metres survive full time');
 const m=read('components/games/RunnerMenu.tsx'),mount=/useEffect\(\(\)=>\{if\(phase!=='ready'\)\{setMode\(selectedRunnerMode\(\)\.id\);\}else\{const id=defaultRunnerMode[^\n]*onPreview\(\)/.exec(m);
 assert(mount,'the first-open default (and its reset) only runs on the ready screen');
 // Header matches the outcome: full time + trophy for a finished route, Tackled! (no trophy) for a tackle-out; the why line stays.
 assert(/completed\?'FULL TIME!':state&&state\.lives<=0\?'TACKLED!':'RUN OVER'/.test(m)&&/const completed=over&&!!state&&\(state\.finished\|\|state\.won\)/.test(m));
 /* Nov 10 2026 arcade AAA: the comic card uses no emoji, so the best score reads 'Best N' on every card (never a trophy). */assert(/>Best \{shownBest\}</.test(m)&&!/🏆/.test(m),'no trophy on a lost run');assert(/data-runner-why/.test(m));}

// 7. Why you lost: the tackle's own tip, on the full-time card.
{const s=game('classic',{spawn:99,nextGoal:1e6,lives:1});s.objects=[{...def('tackler',-1.2),read:1,aim:0,tackle:.2}];tickRunner(s,.02);assert.equal(s.lives,0);
 assert.match(H.runnerLossLine(s),/Low tackle! Jump/);const ok=game('classic');assert.equal(H.runnerLossLine(ok),'');}

// 8. Fair and bounded: elite speed never passes the measured fairness ceiling; every lane line keeps an open lane (jump/slide
// gauntlets fill all three lanes on purpose: their answer is the jump, then the slide); long runs stay bounded.
for(const id of ['cup','legend']){const s=game(id,{lives:1e6});let most=0,fast=0;
 for(let i=0;i<60*200&&!(s.lap&&s.clears);i++){if(i%40===0)runnerShoot(s);tickRunner(s,1/60);most=Math.max(most,s.objects.length);fast=Math.max(fast,s.speed/runnerTopSpeed(s.distance));
  if(i%30===0)for(const z of new Set(s.objects.filter(o=>o.kind==='defender'&&!o.passed&&!o.boss&&!o.gauntlet&&o.drift===undefined&&o.z<-26).map(o=>o.z))){const lanes=new Set(s.objects.filter(o=>o.kind==='defender'&&o.z===z&&!o.passed).map(o=>o.lane));assert(lanes.size<3,`${id}: a line at ${z} leaves a lane open`);}}
 assert(fast<=1.1+1e-9,`${id}: speed stays under the fairness ceiling (${fast.toFixed(3)})`);assert(most<34,`${id}: bounded objects (${most})`);
 if(id==='cup')assert(s.clears===1,'Cup Final reaches its goal line');else assert(s.distance>2000,'Legend keeps going');}

// 9. Heat, reduced motion and sound: no new meshes or lights for the tiers or the perfect dodge; pooled voices only.
{const fx=read('lib/arcade/runnerFx.ts'),perfect=/else if\(kind==='perfect'\)\{[^\n]*/.exec(fx)[0];assert(/if\(!reduced\)\{lineFlash=1/.test(perfect),'reduced motion: no flare, dust or flashes');assert(!/new T\./.test(perfect));
 const w=read('lib/arcade/runnerWeather.ts');for(const sky of new Set(Object.values(RUNNER_MODES).map(m=>m.sky)))assert(new RegExp(`\\n ${sky}:\\{top:`).test(w),`sky palette for ${sky}`);
 const a=read('components/games/runnerAudio.ts'),cue=/else if \(kind === "perfect"\)[^\n]*/.exec(a)[0];assert(/tone\(sfx/.test(cue)&&!/createOscillator|new Audio|fetch\(/.test(cue),'synth through the capped voice pool');}

// 10. Simplified card: one primary (Play / Retry), Back + Scores at full time, no duplicate Arcade/Help buttons, regular sans buttons.
{const m=read('components/games/RunnerMenu.tsx'),css=read('components/games/RunnerMenu.module.css');
 assert.equal((m.match(/className=\{styles\.play\}/g)||[]).length,1);assert(/'Retry'/.test(m)&&/data-runner-back/.test(m)&&/>Scores</.test(m));assert(!/How to play|aria-label="Help"/.test(m),'help panel folded into one keys line');
 assert(/data-runner-why/.test(m)&&/KeyR/.test(m),'why line and quick retry');assert(!/IslandBrush/.test(/\.play\{[^}]*\}/.exec(css)[0]+/\.small small\{[^}]*\}/.exec(css)[0]),'buttons use the regular sans');
 assert(/\.small\{[^}]*min-height:var\(--arcade-small-h\)/.test(css),'44 px+ secondary buttons');}
console.log('PASS runner polish Nov 8: elite tiers + own boards, unlocks/stars, tier bests, coin parity, perfect-dodge chain, loss line, fairness, heat/reduced/sound, simplified card');
