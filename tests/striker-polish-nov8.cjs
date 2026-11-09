// Island Strikers polish, Nov 8 2026 (owner: "add harder levels since there is a scoreboard ... improve the game by 10x").
// Run: node tests/striker-polish-nov8.cjs
//  1. two league tiers (Pro, Legend) with their OWN boards, never 'live': ids, rules, caps, plausibility, server start/submit, SQL
//  2. league scoring: combo multiplier, skill bonuses, streak without punishment, tier multiplier, junk guards
//  3. the sim: tier 0 is exactly the old tuning, leagues are harder but fair (Blue never outruns Gold's jog), no eased retry
//  4. input buffering constants kept (one-touch window, queued pass / shot), reduced motion for the new HUD, pooled sounds
//  5. wiring: board per tier, same coins and entry as any Strikers match, rounds progress untouched by a league match, npm test
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {ROOT,createLoader}=require('./summit-harness.cjs');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let failed=0;const ok=async(name,fn)=>{try{await fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const load=createLoader();
const L=load('lib/arcade/leaderboard.ts'),T=load('lib/arcade/strikerTiers.ts'),M=load('lib/arcade/strikerMatch.ts');

(async()=>{
await ok('tiers: two leagues with their own boards, beside (never mixed into) live',()=>{
 assert.deepEqual([...T.STRIKER_TIER_IDS],['pro','legend']);
 const boards=T.STRIKER_TIER_IDS.map(id=>T.STRIKER_TIERS[id].board);assert.deepEqual(boards,['livepro','livelgnd']);
 for(const b of boards){assert(L.isBoardGame(b),b+' is a board game');assert.notEqual(b,'live');assert.match(b,/^[a-z]{2,8}$/,'fits the session token id pattern');}
 assert(L.isBoardGame('live'),'the original Strikers board is kept');assert.deepEqual(L.BOARD_RULES.live,{name:'Island Strikers',unit:'match points',max:20_000,base:400,perSecond:40,minSeconds:30,learn:'Passes and goals both score. Win as a team.'},'live rules unchanged');
 assert.equal(T.STRIKER_TIERS.pro.tier,1);assert.equal(T.STRIKER_TIERS.legend.tier,2);assert.equal(T.STRIKER_TIERS.legend.mods.small,true,'Legend plays small goals');
 assert(T.STRIKER_TIERS.legend.mult>T.STRIKER_TIERS.pro.mult&&T.STRIKER_TIERS.pro.mult>1);
});

await ok('tiers: ceilings hold a dream match, rates allow a real one, junk is refused',()=>{
 const dreamGoal=T.strikerGoalPoints({chain:9,firstTime:true,teamStrike:true,chip:true,curled:true,setPiece:true,clean:true},9).points;
 for(const id of T.STRIKER_TIER_IDS){const t=T.STRIKER_TIERS[id],r=L.BOARD_RULES[t.board];
  const dream=T.strikerTierScore({goalPoints:10*dreamGoal,passes:60,won:true,tier:id});
  assert(dream<=r.max,`${id}: a dream match (${dream}) fits under ${r.max}`);assert(r.max<=400_000,'inside the SQL table ceiling');
  // A strong real match: 6 goals at combo ×2 with one skill each, 40 passes, a win, over the shortest real wall time (~150 s).
  const real=T.strikerTierScore({goalPoints:6*T.strikerGoalPoints({chain:4,firstTime:true,teamStrike:false,chip:false,curled:false,setPiece:false,clean:false},2).points,passes:40,won:true,tier:id});
  assert.equal(L.scorePlausible(t.board,real,150_000),'ok',id+' real match plausible');
  assert.equal(L.scorePlausible(t.board,dream,t.seconds*1000*1.25),'ok',id+' even a dream match is plausible in its real wall time');
  assert.equal(L.scorePlausible(t.board,r.max,r.minSeconds*1000),'fast',id+' a max score posted early is refused');
  assert.equal(L.scorePlausible(t.board,100,10_000),'short');assert.equal(L.scoreInBounds(t.board,r.max+1),false);assert.equal(L.scoreInBounds(t.board,1.5),false);}
});

await ok('server: a league session posts to its own board and only there',async()=>{
 const SV=load('lib/arcade/leaderboardServer.ts'),ST=load('lib/arcade/leaderboardStore.ts');
 let c=Date.parse('2026-11-08T10:00:00Z');const store=ST.createMemoryBoardStore(),d={store,secret:'k'.repeat(40),now:()=>new Date(c)};
 const h={get:k=>({host:'futbol.test','x-forwarded-for':'203.0.113.9'})[k.toLowerCase()]??null};
 for(const game of ['livepro','livelgnd']){
  const t=(await SV.handleBoard('start',{body:JSON.stringify({game}),headers:h},d)).body.token;assert.match(t,new RegExp(`^v1\\.${game}\\.`));
  c+=150_000;const r=await SV.handleBoard('submit',{body:JSON.stringify({token:t,score:4200,initials:'ZOE',icon:'ball'}),headers:h},d);assert.equal(r.body.ok,true,JSON.stringify(r.body));
  const t2=(await SV.handleBoard('start',{body:JSON.stringify({game}),headers:h},d)).body.token;c+=40_000;
  assert.equal((await SV.handleBoard('submit',{body:JSON.stringify({token:t2,score:L.BOARD_RULES[game].max+1,initials:'ZOE',icon:''}),headers:h},d)).body.reason,'score','over the ceiling');}
 assert.deepEqual((await store.top('livepro','2026-11-03')).all.map(x=>x.score),[4200]);assert.deepEqual((await store.top('live','2026-11-03')).all,[],'live board untouched');
 // The SQL allow-list: additive, after the runner tiers' migration, every board game, ends with its OK row.
 const files=fs.readdirSync(path.join(ROOT,'supabase/migrations')).sort(),f='20261108_strikers_league_boards.sql';assert(files.includes(f));
 assert(files.indexOf(f)>files.indexOf('20261108_runner_tier_boards.sql'),'runs after the Breakaway tiers widen the same check');
 // Nov 8 2026 (Tennis tours): later boards widen the same check in their own later migrations (tests/summit-kick.cjs checks the LAST
 // allow-list has every board), so this file must carry every board that existed up to the Strikers leagues.
 const sql=read('supabase/migrations/'+f);for(const g of ['runner','pinball','tennis','live','puzzle','kick','cupfinal','legend','livepro','livelgnd'])assert(sql.includes(`'${g}'`),'SQL allows '+g);
 assert(/'OK, strikers league boards installed'/.test(sql));assert(!/\bdrop\s+(table|function|column)|truncate|delete from/i.test(sql.replace(/--.*$/gm,'')),'additive');
});

await ok('scoring: combo, skills, streak without punishment, tier multiplier',()=>{
 const plain={chain:0,firstTime:false,teamStrike:false,chip:false,curled:false,setPiece:false,clean:false};
 assert.deepEqual([0,1,2,3,4,5,6,9,-2,NaN].map(T.strikerCombo),[1,1,1.5,1.5,2,2,2.5,2.5,1,1]);
 assert.deepEqual(T.strikerGoalPoints(plain,1),{points:100,combo:1,tags:[]});
 const one=T.strikerGoalPoints({...plain,chain:4,firstTime:true},1);assert.equal(one.points,300);assert.deepEqual(one.tags,['Combo ×2','First-time']);
 assert.equal(T.strikerGoalPoints(plain,2).points,150,'second goal in a row: +50');assert.equal(T.strikerGoalPoints(plain,9).points,100+3*T.STRIKER_STREAK_BONUS,'streak bonus capped');
 assert(T.strikerGoalPoints({...plain,teamStrike:true,clean:true,chip:true,curled:true},3).tags.length<=3,'pop stays short');
 assert.equal(T.strikerTierScore({goalPoints:300,passes:12,won:true,tier:'pro'}),(300+120+200)*2);
 assert.equal(T.strikerTierScore({goalPoints:300,passes:12,won:false,tier:'legend'}),(300+120)*3);
 assert.equal(T.strikerTierScore({goalPoints:-5,passes:NaN,won:false,tier:'pro'}),0,'never negative');
 // Unlocks: Pro after Round 4 is won, Legend after a Pro win.
 const none={pro:{best:0,wins:0},legend:{best:0,wins:0}};
 assert.deepEqual(T.strikerTiersOpen(4,none),{pro:false,legend:false});assert.deepEqual(T.strikerTiersOpen(5,none),{pro:true,legend:false});
 assert.deepEqual(T.strikerTiersOpen(5,{...none,pro:{best:900,wins:1}}),{pro:true,legend:true});
});

await ok('sim: tier 0 is the old tuning; leagues are harder but fair; no eased retry in a league',()=>{
 const B=M.STRIKER_TIER_BOOST;assert.equal(B.length,3);for(const v of Object.values(B[0]))assert.equal(v,0,'tier 0 adds nothing');
 const top=M.STRIKER_TUNING.speed[M.STRIKER_TUNING.speed.length-1];
 assert(B[2].speed>B[1].speed&&B[1].speed>0);assert(top+B[2].speed+M.STRIKER_ADAPT.speed<8,'Legend Blue at full push is still slower than a jogging Gold player');
 for(const k of ['tackleThink','keeperReact'])assert(B[2][k]<B[1][k]&&B[1][k]<0,k+' sharper per tier');
 assert(M.STRIKER_TUNING.keeperReact[5]+B[2].keeperReact>=.1,'Legend keeper still has a human reaction');
 const g=M.createStrikerMatch();g.configure({tier:2,mods:{small:true}});assert.equal(g.state.tier,2);assert.equal(g.state.goalHalf,M.STRIKER_SMALL_GOAL_HALF);
 g.configure({});assert.equal(g.state.tier,0,'rounds and cup reset the tier');g.configure({tier:7});assert.equal(g.state.tier,0,'junk tier ignored');
 const src=read('lib/arcade/strikerMatch.ts');assert.match(src,/eased=\(\)=>state\.assist&&state\.assistLevel===state\.level&&!state\.tier/);assert.match(src,/warm=\(\)=>state\.gentle&&!state\.tier/);
 // A full league match runs (Legend, 120 s) without throwing and ends.
 const m=M.createStrikerMatch();m.state.level=6;m.configure({duration:120,mods:{small:true},tier:2});m.reset();const i=M.strikerInput();for(let n=0;n<60*160&&!m.state.finished;n++)m.step(1/60,i);
 assert(m.state.finished,'the match reaches full time');
});

await ok('buffering, reduced motion, pooled sounds, zero-cost mood',()=>{
 assert.equal(M.STRIKER_TOUCH_WINDOW,.22,'one-touch window kept');const src=read('lib/arcade/strikerMatch.ts');
 assert.match(src,/state\.queuedPass=\.65/);assert.match(src,/state\.queuedShot=\.65/,'pass and shot press buffered while the ball travels');
 const css=read('components/LiveArcadeMatch.module.css');assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.leagueHud \.combo,\.leagueTotal\[data-best\] b\{animation:none\}\.pointsPop\{animation:bannerFade/);
 for(const sel of css.match(/^[^@\n{}][^{}\n]*\{/gm)||[])if(/leagueHud|pointsPop|leagueTotal|leagueNudge/.test(sel))assert.match(sel,/\.[a-zA-Z]/,'css module selectors keep a local class');
 const audio=read('lib/arcade/strikerAudio.ts');for(const c of ['bonus','best','horn','net','bounce'])assert.match(audio,new RegExp(`case '${c}':`),c);
 assert(!/new Audio\(|fetch\(|decodeAudioData/.test(audio),'no files: synthesized through the capped tone/hiss pool');assert.match(audio,/const MAX_VOICES=14;/);
 const scene=read('lib/arcade/strikerScene.ts'),mood=/setTier:\(tier:number\)=>\{[^\n]*\}\}/.exec(scene)[0];assert(!/new T\.|scene\.add|Light/.test(mood),'league mood only recolours existing materials');
 const live=read('components/LiveArcadeMatch.tsx');assert.match(live,/now-lastBounce>120/,'bounce cue is rate limited');
});

await ok('wiring: own board per tier, same coins and entry, rounds progress untouched, npm test',()=>{
 const live=read('components/LiveArcadeMatch.tsx');
 assert.match(live,/useArcadeEntry\('live'\)/,'one paid entry for every Strikers match');assert.match(live,/creditRun\(coinRun\.current,'live',coins/,'same payout path (economy unchanged)');
 assert.match(live,/beginBoardSession\(boardRef\.current\)/);assert.match(live,/HighScoreEntry game=\{boardGame\}/);assert.match(live,/ArcadeBoards game=\{boardGame\}/);
 const league=/if\(modeRef\.current==='league'\)\{const id=tierRef\.current[^\n]*/.exec(live)[0];assert(!/saveArcadeRecord|saveStrikerStars/.test(league),'a league match never changes round unlocks or stars');
 assert.match(live,/match\.configure\(\{duration:t\.seconds,mods:t\.mods,tier:t\.tier\}\)/);
 const pkg=JSON.parse(read('package.json'));assert.match(pkg.scripts.test,/node tests\/striker-polish-nov8\.cjs/);
});

await ok('locked league tiles show the unlock hint as visible text, not only a hover title (QA Nov 8 2026)',()=>{
 const live=read('components/LiveArcadeMatch.tsx'),css=read('components/LiveArcadeMatch.module.css');
 assert.match(live,/<small className=\{open\?undefined:styles\.lockHint\}>\{!open\?strikerLockHint\(t\.unlock\)/);assert(!/\{!open\?'locked'/.test(live),'no bare "locked"');
 const hint=new Function('unlock',`return (${/const strikerLockHint=([^\n]*);\n/.exec(live)[1].replace(':string','')})(unlock)`);
 assert.equal(hint('Win Round 4 to open'),'win Round 4');assert.equal(hint('Win a Pro League match to open'),'win a Pro match');
 assert.match(css,/\.root \.seg>button small\.lockHint\{[^}]*overflow-wrap:anywhere/,'wraps inside a 390 px tile');
 // Nov 8 2026 (owner): the league unlock hints also sit on the start card (not only inside Options), as one small plain line.
 assert.match(live,/const lockedTiers=STRIKER_TIER_IDS\.filter\(id=>!tiersOpen\[id\]\);/);
 assert.match(live,/\{lockedTiers\.length>0&&<p className=\{styles\.unlockHint\} data-league-hint="">/,'start card hint line');
 assert(live.indexOf('data-league-hint')<live.indexOf('id="strikers-options"'),'outside (before) the Options panel');
 assert.match(css,/\.unlockHint\{[^}]*font:400 12px/,'small regular sans');
});

if(failed){console.log(`striker-polish-nov8: ${failed} failed`);process.exit(1);}console.log('striker-polish-nov8: all passed');
})();
