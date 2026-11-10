// Futbol Pinball polish, Nov 8 2026 (owner: "add harder levels since there is a scoreboard ... improve the game by 10x").
// Run: node tests/pinball-polish-nov8.cjs
//  1. two elite tiers (Derby Night, World Final) with their OWN boards, never 'pinball': ids, rules, caps, plausibility, server, SQL
//  2. the sim: tier 0 is exactly the old tuning; tiers start on Champions Night, faster, shorter bats, fewer balls, ×2 / ×3 points
//  3. feel: timing constants kept (tap buffer, PERFECT swing window), the PERFECT ×N badge, the dead-ball watchdog
//  4. result card: plain "why it ended" line, NEW BEST, tier progress + unlocks, reduced motion, CSS module rules, pooled sounds
//  5. wiring: board per tier, same coins and entry as any pinball run, classic record untouched by a tier run, npm test
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {ROOT,createLoader}=require('./summit-harness.cjs');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const store=new Map();globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
let failed=0;const ok=async(name,fn)=>{try{await fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const load=createLoader();
const L=load('lib/arcade/leaderboard.ts'),T=load('lib/games/soccerPinballTiers.ts'),P=load('lib/games/soccerPinball.ts');
const idle={left:false,right:false};
const advance=(s,sec,input=idle,hz=60)=>{for(let i=0;i<Math.round(sec*hz);i++)P.stepPinball(s,input,1/hz);};

(async()=>{
await ok('tiers: two tiers with their own boards, beside (never mixed into) pinball',()=>{
 assert.deepEqual([...T.PINBALL_TIER_IDS],['derby','final']);
 const boards=T.PINBALL_TIER_IDS.map(id=>T.PINBALL_TIERS[id].board);assert.deepEqual(boards,['pinderby','pinfinal']);
 for(const b of boards){assert(L.isBoardGame(b),b+' is a board game');assert.notEqual(b,'pinball');assert.match(b,/^[a-z]{2,8}$/,'fits the session token id pattern');}
 assert.deepEqual(L.BOARD_RULES.pinball,{name:'Futbol Pinball',unit:'points',max:400_000,base:3_000,perSecond:1_200,minSeconds:20,learn:'Time your strike as the ball arrives.'},'pinball rules untouched');
 assert.equal(T.pinballBoardFor(0),'pinball');assert.equal(T.pinballBoardFor(1),'pinderby');assert.equal(T.pinballBoardFor(2),'pinfinal');assert.equal(T.pinballBoardFor(7),'pinball');
 const d=T.PINBALL_TIERS.derby,f=T.PINBALL_TIERS.final;
 assert(f.speed>d.speed&&d.speed>1,'faster, then fastest');assert(f.flipper<d.flipper&&d.flipper<57,'shorter bats than Champions Night (57)');
 assert(f.mult>d.mult&&d.mult>1);assert(f.balls<=d.balls&&d.balls<=3);assert.equal(d.ballSave,true);assert.equal(f.ballSave,false);
 assert(d.speed<=1.15&&f.speed<=1.25,'still fair: at most a quarter faster');assert(f.flipper>=52,'the centre gap stays playable');
});

await ok('tiers: ceilings inside the SQL table, rates scale by speed × multiplier, junk is refused',()=>{
 const sqlCap=Number(/score between 1 and (\d+)/.exec(read('supabase/migrations/20261013_arcade_leaderboards.sql'))[1]);
 for(const id of T.PINBALL_TIER_IDS){const t=T.PINBALL_TIERS[id],r=L.BOARD_RULES[t.board];
  assert(r.max<=sqlCap,'inside the SQL ceiling');assert(r.minSeconds>=L.BOARD_RULES.pinball.minSeconds,'minimum play time as strict as classic');
  assert(r.perSecond>=Math.ceil(L.BOARD_RULES.pinball.perSecond*t.speed*t.mult*.99),`${id}: rate covers classic pace × speed × mult`);
  assert(r.perSecond<=L.BOARD_RULES.pinball.perSecond*t.speed*t.mult*1.05,`${id}: rate no looser than it must be`);
  // A strong real run: 3 minutes of match clock in tier real time at 60% of the classic ceiling pace.
  const secs=P.PINBALL_MATCH_TIME/t.speed,real=Math.round(.6*L.BOARD_RULES.pinball.perSecond*secs*t.mult);
  assert.equal(L.scorePlausible(t.board,real,secs*1000),'ok',id+' strong run plausible');
  assert.equal(L.scorePlausible(t.board,r.max,r.minSeconds*1000),'fast',id+' a max score posted early is refused');
  assert.equal(L.scorePlausible(t.board,100,10_000),'short');assert.equal(L.scoreInBounds(t.board,r.max+1),false);assert.equal(L.scoreInBounds(t.board,1.5),false);}
});

await ok('server: a tier session posts to its own board and only there; SQL widens the check last',async()=>{
 const SV=load('lib/arcade/leaderboardServer.ts'),ST=load('lib/arcade/leaderboardStore.ts');
 let c=Date.parse('2026-11-08T10:00:00Z');const st=ST.createMemoryBoardStore(),d={store:st,secret:'k'.repeat(40),now:()=>new Date(c)};
 const h={get:k=>({host:'futbol.test','x-forwarded-for':'203.0.113.9'})[k.toLowerCase()]??null};
 for(const game of ['pinderby','pinfinal']){
  const t=(await SV.handleBoard('start',{body:JSON.stringify({game}),headers:h},d)).body.token;assert.match(t,new RegExp(`^v1\\.${game}\\.`));
  c+=150_000;const r=await SV.handleBoard('submit',{body:JSON.stringify({token:t,score:42000,initials:'ZOE',icon:'ball'}),headers:h},d);assert.equal(r.body.ok,true,JSON.stringify(r.body));
  const t2=(await SV.handleBoard('start',{body:JSON.stringify({game}),headers:h},d)).body.token;c+=40_000;
  assert.equal((await SV.handleBoard('submit',{body:JSON.stringify({token:t2,score:L.BOARD_RULES[game].max+1,initials:'ZOE',icon:''}),headers:h},d)).body.reason,'score','over the ceiling');}
 assert.deepEqual((await st.top('pinderby','2026-11-03')).all.map(x=>x.score),[42000]);assert.deepEqual((await st.top('pinball','2026-11-03')).all,[],'pinball board untouched');
 const files=fs.readdirSync(path.join(ROOT,'supabase/migrations')).sort(),f='20261109_pinball_tier_boards.sql';assert(files.includes(f));
 // Nov 8 2026: the Pass Puzzles cup boards came later (20261110_puzzle_tier_boards.sql runs last and repeats this whole list).
 const widen=files.filter(x=>/arcade_scores_game_check/.test(read('supabase/migrations/'+x))).filter(x=>x<'20261110');assert.equal(widen.pop(),f,'runs after every earlier board migration (each replaces the same allow-list)');
 const sql=read('supabase/migrations/'+f);for(const g of L.BOARD_GAMES.filter(g=>!['puzpro','puzlgnd'].includes(g)))assert(sql.includes(`'${g}'`),'SQL allows '+g);
 assert(/'OK, pinball tier boards installed'/.test(sql));assert(!/\bdrop\s+(table|function|column)|truncate|delete from|\bupdate\s+public/i.test(sql.replace(/--.*$/gm,'')),'additive');
});

await ok('sim: tier 0 keeps the old tuning; tiers start on Champions Night, harder, on their own rules',()=>{
 const c=P.beginPinballRun(P.createPinballState(),{level:1});assert.equal(c.tier,0);assert.equal(c.balls,3);
 assert.deepEqual([1,4,5,6].map(P.pinballFlipperLength),[63,63,59,57],'classic bats unchanged');
 assert.equal(P.pinballFlippers(c)[0].length,63);P.launchPinball(c);assert(c.launchGrace>0,'classic ball save kept');
 assert.equal(T.pinballTierSpeed(0),1);assert.equal(T.pinballTierMult(0),1);
 const d=P.beginPinballRun(P.createPinballState(),{level:2,tier:1,beginner:true});assert.deepEqual([d.tier,d.level,d.startLevel,d.balls,d.beginner,d.defs],[1,6,6,3,false,3]);
 assert.equal(P.pinballFlippers(d)[0].length,56);P.launchPinball(d);assert(d.launchGrace>0,'Derby keeps a short ball save');
 const f=P.beginPinballRun(P.createPinballState(),{tier:2});assert.deepEqual([f.tier,f.level,f.balls],[2,6,2]);assert.equal(P.pinballFlippers(f)[0].length,54);
 P.launchPinball(f);assert.equal(f.launchGrace,0,'World Final: no ball save');assert.equal(f.mbAuto,true,'still the 2v1 kick-off');
 assert.equal(P.beginPinballRun(P.createPinballState(),{tier:9}).tier,0,'junk tier = classic');
 // Speed: the table runs faster in real time.
 const a=P.beginPinballRun(P.createPinballState(),{level:6}),b=P.beginPinballRun(P.createPinballState(),{tier:2});P.launchPinball(a);P.launchPinball(b);
 advance(a,1);advance(b,1);assert(Math.abs(b.time/a.time-1.22)<.03,`World Final runs ×1.22 (${(b.time/a.time).toFixed(3)})`);
});

await ok('sim: every point a tier scores is multiplied once (HUD = board score)',()=>{
 const run=tier=>{const s=P.beginPinballRun(P.createPinballState(),{level:6,tier});P.launchPinball(s);s.extraLive=false;const before=s.score;Object.assign(s.ball,{x:108,y:49,vx:0,vy:-400});advance(s,.05,idle,120);return {gain:s.score-before,goals:s.goals};};
 const c=run(0),d=run(1),f=run(2);assert.equal(c.goals,1);assert.equal(d.goals,1);assert.equal(f.goals,1);
 assert(c.gain>0);assert(Math.abs(d.gain/c.gain-2)<.12,`Derby ×2 (${c.gain} -> ${d.gain})`);assert(Math.abs(f.gain/c.gain-3)<.18,`Final ×3 (${c.gain} -> ${f.gain})`);
 const s=P.beginPinballRun(P.createPinballState(),{tier:1});const sc=s.score;P.stepPinball(s,idle,1/60);assert.equal(s.score,sc,'no points from nothing');
});

await ok('feel: input buffer and timing windows kept, PERFECT ×N badge, dead-ball watchdog',()=>{
 assert.equal(P.PERFECT_SWING,.8);assert.equal(P.EARLY_SWING,.92);assert.equal(P.PERFECT_POINTS,50);
 const s=P.createPinballState();s.phase='playing';P.tapPinballFlipper(s,0);assert.equal(s.flipperPulse[0],.065,'a tap is buffered 65 ms');
 assert.deepEqual([0,1,2,3,5,9,NaN].map(T.pinballStreakBadge),['','','PERFECT ×2','PERFECT ×3','PERFECT ×5','PERFECT ×5','']);
 // Watchdog: a ball resting up the table gets a kick after PINBALL_STALL_TIME; never on the flippers, in the lane or the scoop.
 const w=P.createPinballState();w.phase='playing';Object.assign(w.ball,{x:120,y:300,vx:0,vy:0});
 assert.equal(P.unstick(w,1),false);assert.equal(P.unstick(w,1),false);assert.equal(P.unstick(w,.3),true);assert.equal(w.unstuck,1);
 assert.equal(w.ball.vy,-T.PINBALL_STALL_KICK);assert(w.ball.vx>0,'kicked toward the middle');assert.equal(w.stall,0);
 Object.assign(w.ball,{x:120,y:300,vx:0,vy:0});P.unstick(w,1.5);w.ball.vx=200;P.unstick(w,.01);assert.equal(w.stall,0,'a moving ball resets the clock');
 for(const [x,y] of [[150,500],[354,585]]){const q=P.createPinballState();q.phase='playing';Object.assign(q.ball,{x,y,vx:0,vy:0});P.unstick(q,5);assert.equal(q.unstuck,0,`no kick at ${x},${y}`);}
 const h=P.createPinballState();h.phase='playing';h.table.hold=1;Object.assign(h.ball,{x:306,y:262,vx:0,vy:0});P.unstick(h,5);assert.equal(h.unstuck,0,'dugout hold left alone');
 const r=P.createPinballState();Object.assign(r.ball,{x:120,y:300,vx:0,vy:0});P.unstick(r,5);assert.equal(r.unstuck,0,'only while playing');
});

await ok('result card: why it ended, tip split, tier progress and unlocks',()=>{
 assert.equal(T.pinballEndReason({balls:0,fullTimeBonus:0},"64'"),"Out of balls at 64'. The last ball slipped past the flippers.");
 assert.equal(T.pinballEndReason({balls:2,fullTimeBonus:1000}),'Full-time whistle! 2 balls kept: +1,000.');
 assert.equal(T.pinballTipOnly("Out of balls at 4' · Next time: wait."),'Next time: wait.');assert.equal(T.pinballTipOnly('Plain tip'),'Plain tip');
 store.clear();const empty=T.readPinballTiers();assert.deepEqual(empty,{derby:{best:0,goals:0},final:{best:0,goals:0}});
 assert.deepEqual(T.pinballTiersOpen(5,empty),{derby:false,final:false});assert.deepEqual(T.pinballTiersOpen(6,empty),{derby:true,final:false});
 let r=T.savePinballTier('derby',8000,0);assert.equal(r.best,true);assert.deepEqual(T.pinballTiersOpen(6,r.progress),{derby:true,final:false},'a Derby score without a goal keeps the Final shut');
 r=T.savePinballTier('derby',5000,1);assert.equal(r.best,false,'lower score is not a best');assert.deepEqual(r.progress.derby,{best:8000,goals:1});
 assert.deepEqual(T.pinballTiersOpen(1,r.progress),{derby:true,final:true},'a Derby goal opens the World Final for good');
 store.set('fi2-pinball-tiers-v1','{"derby":{"best":"x","goals":-4}}');assert.deepEqual(T.readPinballTiers().derby,{best:0,goals:0},'junk cleaned');
 store.set('fi2-pinball-tiers-v1','{oops');assert.deepEqual(T.readPinballTiers().final,{best:0,goals:0});
});

await ok('UI: CSS module rules all local, reduced motion, tap targets, pooled sounds',()=>{
 for(const f of ['components/games/PinballCard.module.css','components/games/ArcadeGame3D.module.css']){
  const css=read(f).replace(/\/\*[\s\S]*?\*\//g,'').replace(/@keyframes\s+\w+\{(?:[^{}]*\{[^}]*\})*\}/g,'');
  for(const m of css.matchAll(/([^{}@]+)\{[^{}]*\}/g)){const sel=m[1].trim();if(!sel||/^(from|to|\d)/.test(sel))continue;for(const part of sel.split(','))assert(/\.[A-Za-z]/.test(part),`${f}: "${part.trim()}" has a local class`);}}
 const card=read('components/games/PinballCard.module.css');assert(/prefers-reduced-motion:reduce\)\{\.badge\[data-fresh\],\.score\[data-fresh\]\{animation:none\}/.test(card));
 assert(/\.card \.tiers button\{[^}]*min-height:52px/.test(card)&&/\.card \.tiers button\{min-height:48px/.test(card),'tier chips >= 48 px');
 const hud=read('components/games/ArcadeGame3D.module.css');assert(/prefers-reduced-motion:reduce\)\{\.game\[data-arcade-kind=pinball\] \.pbHud strong\{animation:none\}/.test(hud));
 assert(/\.pbHud\{[^}]*pointer-events:none/.test(hud),'the HUD badge never blocks a flipper zone');
 const audio=read('lib/games/soccerPinballAudio.ts');assert(/const MAX_VOICES=14/.test(audio),'voice cap kept');
 assert(/case 'pb-best':if\(!throttled\(v,cue,now,2\)\)\{arpeggio\(/.test(audio),'new-best fanfare is throttled and uses the capped voices');
});

await ok('wiring: board per tier, classic record untouched, same coins, npm test',()=>{
 const g=read('components/games/ArcadeGame3D.tsx');
 assert(/beginPinballRun\(game\.current\.state\.pinball,\{[^}]*tier:pinballSetup\.current\?\.tier\}\)/.test(g),'the card picks the tier');
 assert(/const boardKind=[^;]*kind==='pinball'\?pinballBoardFor\(game\.current\?\.state\.pinball\.tier\?\?0\)/.test(g)&&/beginBoardSession\(boardKind\)/.test(g),'board session per tier');
 assert(/<HighScoreEntry game=\{[^}]*kind==='pinball'\?pinballBoardFor\(/.test(g),'high-score entry posts to the tier board');
 assert(/<ArcadeBoards game=\{[^}]*kind==='pinball'\?pinballBoardFor\(/.test(g),'leaderboard opens on the tier board');
 assert(/savePinballTier\(pinTier\.id,/.test(g)&&/else if\(!pinTier[^)]*\)setRecord\(/.test(g),'a tier run keeps its own best, never the classic record');
 assert(/if\(game==='pinball'\)value=n\(s\.goals\)\*3\+n\(s\.moves\)\*2;/.test(read('lib/arcade/arcadeWalletCore.ts')),'coins from goals and moves only (the multiplier never pays coins)');
 const arcade=read('lib/arcade/arcadeGames.ts');assert(/floorBase\.setHex\(pinball\.tier===2\?0x353323:pinball\.tier===1\?0x402340:/.test(arcade),'tier look = a floor colour, no extra draw');
 assert(/"test":[^\n]*node tests\/pinball-polish-nov8\.cjs/.test(read('package.json')),'in npm test');
});

if(failed){console.log(`\n${failed} FAILED`);process.exit(1);}console.log('\nPINBALL_POLISH_NOV8_PASS');
})();
