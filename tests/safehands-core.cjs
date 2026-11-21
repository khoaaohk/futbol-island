// Safe Hands (Nov 21 2026, docs/arcade-aaa/safehands-direction.md): the goalkeeper game. Determinism per seed, frame-rate independence
// (fixed 1/120 s steps), the daily seed, the rules (penalty line, reach, position, the wall, crosses, 1v1s, rebounds, tricks), scoring,
// lives, the glove feats, the device save, the scouting cards, the wiring and the sound. Fairness and difficulty: tests/safehands-bots.cjs.
//   node tests/safehands-core.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']??=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const C=require('../lib/arcade/safehands/core.ts'),S=require('../lib/arcade/safehands/save.ts'),B=require('./safehands-bots.cjs'),{SH,TIERS,STRIKERS,SH_FEATS}=C;
const read=p=>fs.readFileSync(p,'utf8');let n=0;const ok=(name,fn)=>{fn();n++;};
/** runs the game until `stop(state)` or `secs` pass; returns the events */
const run=(g,secs,stop,dt=1/60)=>{const ev=[];for(let t=0;t<secs&&!g.state.over;t+=dt){if(stop&&stop(g.state))break;g.advance(dt);g.drain(e=>ev.push(e));}return ev;};
/** a Daily Shootout (all penalties) with the first shot rewritten to what the test needs */
const pen=(o={},seed=7)=>{const g=C.createSafeHands({seed,startTier:0});g.ack();assert.equal(g.state.shot.kind,'pen');const sh=g.state.shot;Object.assign(sh,{tx:2.4,ty:.5,side:1,high:false,power:.5,watch:false,stutter:0,defl:null,glance:0,fake:false,runSecs:1.4,plant:.5},o);sh.flight=Math.hypot(sh.tx-sh.bx,sh.bz)/sh.speed;g.drain(()=>{});return g;};
const toRun=g=>run(g,9,s=>s.phase==='run'),toPlant=g=>run(g,9,s=>(s.phase==='run'&&!!g.tells().plant)||s.phase==='fly'),toRes=g=>run(g,9,s=>s.phase==='res');
/** a career game played by the oracle until an attack of `kind` is on (set phase) */
const upTo=(kind,seed=3,tier=2)=>{for(let k=0;k<40;k++){const g=C.createSafeHands({seed:seed+k,startTier:tier,lives:99});g.ack();const first=g.state.shot;if(first.kind===kind)return g;
  let guard=0;while(!g.state.over&&guard++<6){const sh=g.state.shot;if(sh.kind===kind&&(g.state.phase==='set'||g.state.phase==='wall'))return g;if(g.state.phase==='wall')g.wall(sh.wallBest);run(g,30,s=>s.shot!==sh&&s.shot&&s.shot.kind!=='reb'&&s.shot.kind!=='head');}}
 throw new Error('no '+kind);};

ok('one seed, one game: the same shots, whatever the frame rate',()=>{
 const sig=(seed,dt)=>{const g=C.createSafeHands({seed});const out=[];let guard=0;while(!g.state.over&&guard++<4000){if(g.state.phase==='tip')g.ack();if(g.state.phase==='wall')g.wall(3);g.advance(dt);g.drain(e=>{if(e.type==='attack'||e.type==='goal'||e.type==='save'||e.type==='clear')out.push(`${e.type}:${e.word}:${e.a}`);});}return out.join('|')+'#'+g.state.score;};
 assert.equal(sig(42,1/60),sig(42,1/60));assert.equal(sig(42,1/60),sig(42,1/30),'30 or 60 draws a second: the same game');assert.equal(sig(42,1/60),sig(42,.011));assert.notEqual(sig(42,1/60),sig(43,1/60));
 assert.equal(SH.step,1/120);});

ok('the Daily Shootout: five penalties, the same five takers for everyone that day',()=>{
 const a=C.safehandsDailySeed('2026-11-21');assert.equal(a,C.safehandsDailySeed('2026-11-21'));assert.notEqual(a,C.safehandsDailySeed('2026-11-22'));assert.ok(a>0&&a<=2_000_000_000);
 assert.equal(a,(()=>{let h=0x811c9dc5;for(const ch of 'safehands:2026-11-21'){h^=ch.charCodeAt(0);h=Math.imul(h,0x01000193)>>>0;}return 1+h%2_000_000_000;})(),'the arcade daily seed: FNV-1a of id + day');
 const t=C.dailyTakers(a);assert.equal(t.length,5);assert.equal(new Set(t).size,5,'five different takers');assert.deepEqual(t,C.dailyTakers(a));
 const g=C.createSafeHands({seed:a,daily:true});assert.deepEqual(g.takers,t);g.ack();const kinds=[],who=[];let guard=0;while(!g.state.over&&guard++<4000){g.advance(1/30);g.drain(e=>{if(e.type==='attack'){kinds.push(e.word);who.push(e.a);}});}
 assert.deepEqual(kinds,['pen','pen','pen','pen','pen']);assert.deepEqual(who,t);assert.equal(g.state.lives,SH.lives,'no lives in a shoot-out: all five are taken');assert.equal(g.state.dailyLog.length,5);
 {const d=C.createSafeHands({seed:a,daily:true});d.ack();Object.assign(d.state.shot,{tx:.1,side:0,power:.95,watch:false});run(d,9,s=>s.phase==='res');assert.equal(d.state.res.kind,'parry','a shoot-out kick is over once it is stopped: no rebound');}
 assert.ok(g.state.t<60,'about a minute at most');});

ok('penalty: the keeper stays on the line; moving along it is allowed',()=>{
 const g=pen();g.move(1.2,3);run(g,1.5);assert.equal(g.state.kd,0,'a foot on the line');assert.ok(Math.abs(g.state.kx-1.2)<.01);g.move(9,0);run(g,.4);assert.ok(g.state.wantX<=2.5);
 toRun(g);const x=g.state.kx;g.move(-2,0);run(g,.3);assert.equal(g.state.kx,x,'the feet are set once the run-up starts');});

ok('reach: an early correct dive reaches the corner, a late one does not; the wrong way or height is a goal',()=>{
 assert.equal(C.reachAfter(0),SH.body);assert.ok(Math.abs(C.reachAfter(1)-(SH.body+SH.reachMax))<1e-9);assert.ok(C.reachAfter(.2)<C.reachAfter(.3));
 let g=pen({tx:3});toPlant(g);g.act('R');let ev=toRes(g);assert.equal(g.state.res.saved,true,'dive on the planted foot: saved');assert.ok(ev.some(e=>e.type==='save'));assert.ok(g.state.res.early,'before the kick: an early read');
 g=pen({tx:3});run(g,9,s=>s.phase==='fly'&&s.t-s.strikeT>g.state.shot.flight*.6);g.act('R');toRes(g);assert.equal(g.state.res.saved,false);assert.equal(g.state.res.why,'late');
 g=pen({tx:3});toPlant(g);g.act('L');toRes(g);assert.equal(g.state.res.why,'wrongway');
 g=pen({tx:3});toPlant(g);g.act('RH');toRes(g);assert.equal(g.state.res.why,'height');
 g=pen({tx:3,ty:1.9,high:true});toPlant(g);g.act('RH');toRes(g);assert.equal(g.state.res.saved,true);
 g=pen({tx:3});toRes(g);assert.equal(g.state.res.why,'froze');
 g=pen({tx:3});toPlant(g);assert.equal(g.act('R'),true);assert.equal(g.act('L'),false,'one action an attack');});

ok('catch, parry, fingertips, tip over: soft shots are held, hard ones are pushed wide, a hard one caught is spilled',()=>{
 let g=pen({tx:.2,side:0,power:.5});toRes(g);assert.equal(g.state.res.kind,'held','a soft shot at the keeper: caught');
 g=pen({tx:.2,side:0,power:.9});let ev=toRes(g);assert.equal(g.state.res.kind,'spill');assert.ok(ev.some(e=>e.type==='spill'));ev=run(g,3,s=>s.shot.kind==='reb'&&s.phase==='run');assert.equal(g.state.shot.kind,'reb','a spill gives a rebound');
 const lives=g.state.lives;toRes(g);assert.equal(g.state.lives,lives-(g.state.res.kind==='goal'?1:0),'only the rebound can cost the goal');assert.equal(g.state.stats.rebounds,1);assert.equal(g.state.stats.shots,1,'the rebound is part of the same attack');
 g=pen({tx:.2,side:0,power:.9});toPlant(g);g.act('L');toRes(g);assert.equal(g.state.res.kind,'parry','a hard shot at the keeper: pushed wide');
 g=pen({tx:.2,ty:1.9,side:0,high:true,power:.9});toPlant(g);g.act('up');toRes(g);assert.equal(g.state.res.kind,'tip');
 g=pen({tx:1,power:.5});toPlant(g);g.act('R');toRes(g);assert.equal(g.state.res.kind,'held','a soft shot close by: held');
 g=pen({tx:2.2,power:.5});toPlant(g);g.act('R');toRes(g);assert.equal(g.state.res.kind,'parry');
 g=pen({tx:3.2,power:.5});run(g,9,s=>s.phase==='fly');const sh=g.state.shot;run(g,9,s=>C.reachAfter(s.strikeT+sh.flight-s.t)<=3.2+.2);g.act('R');toRes(g);assert.equal(g.state.res.kind,'fingertip');assert.ok(g.state.feats.includes('fingertip'));
 assert.equal(C.bestAct({side:0,high:false,power:.9,wet:false},0,0),'R');assert.equal(C.bestAct({side:0,high:false,power:.6,wet:false},0,0),null);assert.equal(C.bestAct({side:0,high:false,power:.6,wet:true},0,0),'R','a wet ball is not caught');
 assert.equal(C.bestAct({side:-1,high:true,power:.6,wet:false},0,-2),'LH');assert.equal(C.bestAct({side:0,high:true,power:.9,wet:false},0,0),'up');});

ok('tells: the planted foot and the lean are always true; the glance follows the striker’s habit',()=>{
 for(let seed=1;seed<60;seed++){const g=C.createSafeHands({seed,startTier:seed%4,lives:99});g.ack();if(g.state.phase==='wall')g.wall(g.state.shot.wallBest);if(g.state.shot.kind==='cross')continue;toPlant(g);const sh=g.state.shot,tl=g.tells();if(g.state.phase!=='run')continue;
  assert.equal(tl.plant.side,sh.side);assert.equal(tl.plant.high,sh.high);const st=STRIKERS[sh.striker];if(sh.side!==0&&st.glance!==0)assert.equal(sh.glance,st.glance*sh.side);if(st.glance===0)assert.equal(sh.glance,0);
  if(st.fav&&sh.long&&sh.kind!=='free'&&!sh.switched){assert.equal(sh.side,st.fav.side,'the favourite corner after a long run-up');assert.equal(sh.high,st.fav.high);}}
 const g=pen({plant:.5});toRun(g);assert.equal(g.tells().plant,null,'nothing to read at the start of the run-up');assert.equal(g.tells().hips,null);run(g,g.state.shot.runSecs-.5-.25);assert.equal(g.tells().hips,1,'the hips open before the foot lands');assert.equal(g.tells().plant,null);
 assert.ok(TIERS.every((t,i)=>i===0||t.plant<TIERS[i-1].plant),'the tell window shrinks up the ladder');assert.ok(TIERS.every((t,i)=>i===0||t.speed>TIERS[i-1].speed));assert.ok(TIERS[0].aid===2&&TIERS[0].tricks===0,'Sunday league: the cone, the labels, no tricks');
 assert.ok(STRIKERS.length===10&&new Set(STRIKERS.map(s=>s.id)).size===10&&STRIKERS.every(s=>s.habits.length===4&&s.habits[0]&&s.habits[2]));});

ok('tricks: a striker who waits sends the ball the other way when the keeper moves before the foot is planted',()=>{
 let g=pen({watch:true,tx:2.4,side:1});toRun(g);run(g,.2);g.act('R');const ev=[];g.drain(e=>ev.push(e));assert.ok(ev.some(e=>e.type==='switch'));assert.equal(g.state.shot.side,-1);assert.ok(g.state.shot.tx<0);toRes(g);assert.equal(g.state.res.why,'early');
 g=pen({watch:true,tx:2.4,side:1});toPlant(g);g.act('R');toRes(g);assert.equal(g.state.res.saved,true,'wait for the foot: saved');assert.ok(g.state.feats.includes('faked-pen'));
 g=pen({stutter:.45});toRun(g);run(g,1.4*.45+.1);assert.equal(g.tells().paused,true,'the stutter step');});

ok('position: the ideal spot is on the line from the ball to the middle of the goal; stepping out narrows the angle',()=>{
 const sh={kind:'far',bx:8,bz:20,tx:-3,ty:.5,arc:0,defl:null};assert.equal(C.idealFor(sh,0).x,0);assert.equal(C.idealFor(sh,2.5).x,1);
 const off=d=>Math.abs(C.shotPath(sh,(sh.bz-d)/sh.bz).x-C.idealFor(sh,d).x);assert.ok(off(3)<off(0)-.3,'three steps out: the corner is closer');
 const g=upTo('far',3,1),s=g.state;g.move(C.idealFor(s.shot,5).x,5);toRun(g);assert.ok(s.kd>SH.chipDepth);const ev=toRes(g);assert.equal(s.res.why,'chipped','too far out: chipped');assert.ok(ev.some(e=>e.type==='goal'));});

ok('one on one: stay big when she keeps it close, dive at her feet on a heavy touch, never get too close',()=>{
 let g=upTo('one',3,0),s=g.state;s.shot.tight=true;g.move(0,5);run(g,1.8);assert.equal(g.looseBall(),null);assert.equal(g.act('L'),false,'no diving while she is still dribbling');g.act('down');assert.equal(s.res.why,'rounded');
 g=upTo('one',3,0);s=g.state;s.shot.tight=false;g.move(C.idealFor(s.shot,8,20).x,8.5);const ev=run(g,9,()=>{const l=g.looseBall();return !!l&&l.z-s.kd<=SH.smother-.3;});assert.ok(ev.some(e=>e.type==='touch'),'the heavy touch is announced');g.act('down');assert.equal(s.res.kind,'smother');assert.ok(s.feats.includes('smother'));
 g=upTo('one',3,0);s=g.state;s.shot.tight=true;g.move(s.shot.bx*.7,s.shot.bz-2);toRes(g);assert.equal(s.res.why,'rounded','closer than four metres: she goes round');
 g=upTo('one',3,0);s=g.state;Object.assign(s.shot,{tight:true,tx:0,side:0,power:.9,watch:false});const d=s.shot.bz-6;run(g,9,()=>{g.move(C.idealFor(s.shot,s.kd,g.strikerZ()).x,d);return s.phase==='run';});toRes(g);assert.equal(s.res.kind,'block','out and big: the block');});

ok('free kick: the wall guards the near post, the keeper the open side; the right number depends on where the ball is',()=>{
 const g=upTo('free',3,2),s=g.state,sh=s.shot;assert.equal(s.phase,'wall');assert.equal(sh.wallBest,Math.abs(sh.bx)<5?4:Math.abs(sh.bx)<9.5?3:2);assert.equal(sh.near,sh.bx<0?-1:1,'the wall is on the ball’s side');
 const ev=[];g.wall(sh.wallBest);g.drain(e=>ev.push(e));assert.ok(ev.some(e=>e.type==='wall'&&e.b===1));assert.equal(s.phase,'set');assert.equal(Math.sign(C.idealFor(sh,0).x),-sh.near,'stand in the open side');assert.equal(g.tells().hidden,false);
 const h=upTo('free',9,2),hs=h.state;if(hs.shot.wallBest<4){h.wall(4);toPlant(h);assert.equal(h.tells().hidden,true,'too many in the wall: the keeper cannot see the foot');assert.equal(h.tells().plant,null);}
 const w=upTo('free',5,2);run(w,8);assert.equal(w.state.shot.wallN,3,'no choice: three in the wall');});

ok('cross: claim it free, punch it in a crowd, stay when it is too far',()=>{
 const mk=(o,d)=>{const g=upTo('cross',3,2),s=g.state;Object.assign(s.shot,o);run(g,9,x=>x.phase==='cross');assert.equal(g.act('L'),false);if(d)assert.equal(g.choose(d),true);assert.equal(g.choose('stay'),!d);run(g,9,x=>x.phase!=='cross');return g;};
 let g=mk({closeIn:true,crowd:false,cz:4},'claim');assert.equal(g.state.res.kind,'claim');assert.ok(g.state.res.right);
 g=mk({closeIn:true,crowd:true,cz:4},'claim');assert.equal(g.state.res.kind,'spill','a catch in a crowd is dropped');
 g=mk({closeIn:true,crowd:true,cz:4},'punch');assert.equal(g.state.res.kind,'punch');assert.ok(g.state.res.right);
 g=mk({closeIn:false,crowd:false,cz:9},'claim');assert.equal(g.state.res.why,'stranded');
 g=mk({closeIn:false,crowd:false,cz:9},null);assert.equal(g.state.shot.kind,'head','stay: a header to save');assert.equal(g.state.phase,'run');});

ok('scoring, lives and the ladder: saves build a streak, three goals end the run, a clean round gives a life back, the cup ends it',()=>{
 let g=pen({tx:1,power:.5});toPlant(g);g.act('R');toRes(g);const p1=g.state.res.points;assert.ok(p1>=100);assert.equal(g.state.streak,1);
 const o=B.play(11,'oracle');assert.ok(o.won);assert.equal(o.stats.goals,0);assert.equal(o.tiers.filter(t=>t.cleared).length,4);assert.ok(o.feats.includes('cup')&&o.feats.includes('clean-sheet')&&o.feats.includes('first-save'));assert.ok(o.score>SH.medals[2]&&o.score<SH.scoreMax);
 assert.equal(o.stats.shots,TIERS.length*SH.shotsPerTier);assert.ok(o.secs>100&&o.secs<240,'a full run lasts two to four minutes');
 const r=B.play(11,'random');assert.equal(r.lives,0);assert.equal(r.stats.goals,3);assert.ok(!r.won);
 g=C.createSafeHands({seed:5});assert.equal(g.state.phase,'tip');g.advance(1);assert.equal(g.state.t,0,'the round card waits');assert.equal(g.ack(),true);assert.equal(g.ack(),false);
 assert.ok(TIERS.every(t=>t.kinds.length===SH.shotsPerTier));assert.deepEqual(TIERS.map(t=>new Set(t.kinds).size),[2,3,5,5],'each round adds kinds of shot');assert.ok(!TIERS[2].wet&&TIERS[3].wet);
 assert.equal(C.medalFor(SH.medals[0]-1),0);assert.equal(C.medalFor(SH.medals[2]),3);assert.equal(C.safehandsCoins(1999),1);
 assert.equal(new Set(SH_FEATS.map(f=>f.id)).size,12);assert.deepEqual(C.SH_FEAT_IDS,SH_FEATS.map(f=>f.id));});

ok('device save: best, medal, rounds, gloves, scouting cards, the daily claim; bad data is cleaned',()=>{
 const e=S.emptySafehandsSave(),stats=B.play(11,'oracle').stats;
 let r=S.settleSafehands(e,{score:7000,daily:false,day:'2026-11-21',rounds:2,won:false,stats,feats:['first-save','fingertip'],scout:[{striker:'rosa',bits:7,saved:true},{striker:'rosa',bits:5,saved:false}],dailySaves:0,kinds:['pen','one']});
 assert.equal(r.save.best,7000);assert.ok(r.newBest&&r.newMedal&&r.newRound);assert.equal(r.medal,2);assert.deepEqual(r.newGloves,['first-save','fingertip']);assert.equal(r.save.rounds,2);
 assert.deepEqual(r.save.scout.rosa,{faced:2,saved:1,seen:[2,1,2,0]});assert.deepEqual(r.newHabits,[[0,0],[0,2]],'a habit is on the card once seen twice');assert.ok(S.habitKnown(r.save.scout.rosa,0)&&!S.habitKnown(r.save.scout.rosa,1));
 const r2=S.settleSafehands(r.save,{score:900,daily:false,day:'2026-11-21',rounds:1,won:false,stats,feats:['first-save'],scout:[],dailySaves:0,kinds:[]});assert.equal(r2.save.best,7000);assert.ok(!r2.newBest);assert.deepEqual(r2.newGloves,[]);assert.equal(r2.save.rounds,2);
 let d=S.settleSafehands(r2.save,{score:800,daily:true,day:'2026-11-21',rounds:0,won:false,stats,feats:[],scout:[],dailySaves:3,kinds:['pen']});assert.ok(d.dailyFirst);assert.equal(d.save.daily.saves,3);assert.equal(d.save.best,7000,'the shoot-out does not touch the career best');
 d=S.settleSafehands(d.save,{score:900,daily:true,day:'2026-11-21',rounds:0,won:false,stats,feats:[],scout:[],dailySaves:4,kinds:[]});assert.ok(!d.dailyFirst,'only the first shoot-out of the day goes on the board');assert.equal(d.dailyBest,4);
 d=S.settleSafehands(d.save,{score:100,daily:true,day:'2026-11-22',rounds:0,won:false,stats,feats:[],scout:[],dailySaves:1,kinds:[]});assert.ok(d.dailyFirst);assert.equal(d.save.daily.saves,1);assert.equal(d.save.dailyBest,4);
 const bad=S.sanitizeSafehandsSave({best:1e12,medal:9,rounds:99,gloves:['x','cup',3],scout:{rosa:{faced:-1,seen:['a']},nobody:{faced:3}},daily:{day:'nope',saves:77}});
 assert.equal(bad.best,SH.scoreMax);assert.equal(bad.medal,3);assert.equal(bad.rounds,4);assert.deepEqual(bad.gloves,['cup']);assert.deepEqual(bad.scout,{rosa:{faced:0,saved:0,seen:[0,0,0,0]}});assert.equal(bad.daily.day,'');assert.equal(bad.daily.saves,5);
 assert.deepEqual(S.sanitizeSafehandsSave('x'),S.emptySafehandsSave());assert.equal(S.SAFEHANDS_KEY,'fi2-safehands-v1');
 assert.ok(!/streak/i.test(JSON.stringify(S.emptySafehandsSave())),'no day streak to lose');
 for(const w of C.GOAL_WHYS)assert.ok(S.WHY_LINE[w].length>20);assert.ok(S.SAFEHANDS_TIPS.length>=8);
 assert.match(S.nearMissLine({score:1,best:0,newBest:true,daily:true,dailySaves:3,rounds:0,won:false,gloves:0}),/3 out of 5\. Tomorrow/);assert.match(S.nearMissLine({score:2300,best:0,newBest:true,daily:false,dailySaves:0,rounds:1,won:false,gloves:0}),/200 points from Bronze/);});

ok('wiring: playable by /arcade?game=safehands, its own board, coins, analytics key, device save; no machine in the room yet',()=>{
 const cat=read('lib/arcade/arcadeCatalog.ts'),room=read('components/ArcadeRoom.tsx'),K=require('../lib/arcade/arcadeCatalog.ts');
 assert.deepEqual(K.arcadeUnplaced.map(c=>c.id),['safehands']);assert.ok(!K.arcadeCabinets.some(c=>c.id==='safehands'),'the room and every "N games" count are unchanged until the owner places it');assert.ok(!K.ARCADE_ROW.includes('safehands'));
 assert.equal(K.arcadeAnalyticsId('safehands'),'safehands');assert.match(cat,/export type ArcadePlayableId=ArcadeCabinetId\|typeof arcadeUnplaced\[number\]\['id'\];/);
 assert.match(room,/const SafeHands=dynamic\(\(\)=>retryImport\(\(\)=>import\('\.\/games\/SafeHandsGame'\)\)/);assert.match(room,/safehands:\(\)=>import\('\.\/games\/SafeHandsGame'\)/);assert.match(room,/arcadeUnplaced\.some\(c=>c\.id===id\)/);assert.match(room,/game==='safehands'\?<SafeHands onExit=\{back\}\/>/);
 const L=require('../lib/arcade/leaderboard.ts');assert.ok(L.BOARD_GAMES.includes('safehands'));assert.equal(L.BOARD_RULES.safehands.max,SH.scoreMax);assert.ok(!L.HALL_MACHINES.includes('safehands'));
 {const best=Math.max(...[11,12,13,14,15,16].map(i=>{const o=B.play(i,'oracle');return o.score/o.secs;}));const r=L.BOARD_RULES.safehands;assert.ok(best<r.perSecond,`the board's rate limit is above the best bot (${best.toFixed(0)} a second)`);{const cup=C.createSafeHands({seed:3,startTier:3});assert.equal(cup.state.tier,3);assert.ok(r.base+r.perSecond*45>9000,'a run started at the Cup final (the fastest scoring) fits the rate');}}
 const W=require('../lib/arcade/arcadeWalletCore.ts');assert.equal(W.arcadeCoinTarget('safehands',{points:2600}),2);assert.equal(W.arcadeCoinTarget('safehands',{points:60000}),12,'capped like the other machines');assert.equal(C.safehandsCoins(2600),2);
 assert.match(read('lib/analytics/islandIds.ts'),/'ballblaster','safehands'\] as const/);assert.match(read('lib/analytics/islandIds.ts'),/\['arcade_safehands','Arcade: Safe Hands'\]/);assert.match(read('lib/analytics/countIds.ts'),/'ballblaster','safehands'\] as const/);
 assert.match(read('lib/saves/snapshot.ts'),/'fi2-safehands-v1'/);assert.match(read('lib/arcade/lastScore.ts'),/safehands_daily:\{game:'safehands',label:'Daily Shootout',today:true\}/);
 assert.match(read('components/arcade/HighScoreEntry.tsx'),/'ballblaster','safehands','runner'/);assert.match(read('components/games/skins/index.ts'),/safehands:safehands\.skin/);assert.match(read('scripts/check-arcade-load.cjs'),/'ballblaster','safehands'/);
 const sql=read('docs/arcade-aaa/safehands-supabase.sql');assert.match(sql,/'rollball', 'ballblaster', 'safehands'\)\);/);assert.match(sql,/'arcade_ballblaster','arcade_safehands',/);assert.match(sql,/OK, Safe Hands installed/);assert.match(sql,/drop constraint if exists arcade_scores_game_check/);
 for(const g of L.BOARD_GAMES)assert.ok(sql.includes(`'${g}'`),`the owner SQL keeps board ${g}`);assert.match(read('supabase/migrations/20261205_safehands_boards.sql'),/'ballblaster', 'safehands'\)\);/);assert.match(read('supabase/migrations/20261206_analytics_safehands.sql'),/'arcade_safehands'/);});

ok('the shell: one thumb, kid-safe come-back hooks, buttons in the UI sans, the loop sleeps off the pitch',()=>{
 const t=read('components/games/SafeHandsGame.tsx'),css=read('components/games/SafeHandsGame.module.css'),v=read('lib/arcade/safehands/view.ts');
 assert.match(t,/data-game="safehands" data-arcade-kind="safehands"/);assert.match(t,/useArcadeEntry\('safehands'\)/);assert.match(t,/<ArcadeTopBar game="safehands"[^>]*backTitle="Back to arcade"/);assert.match(t,/<ComicMedalTrack score=\{result\.score\}/);assert.match(t,/data-hs-slot/);
 assert.match(t,/safehandsDailySeed\(day\)/);assert.match(t,/data-safehands-shelf/);assert.match(t,/data-safehands-scoutlist/);assert.match(t,/data-safehands-near/);assert.match(t,/else if\(s\.phase==='tip'\)return;\/\/ the round card is up: the loop sleeps/);
 assert.match(t,/if\(phaseRef\.current!=='playing'\|\|!g\|\|!v\)return;/);assert.match(t,/document\.addEventListener\('visibilitychange',hidden\)/);assert.match(t,/frameMs\.current=1000\/\(mobile\?30:60\)/);
 assert.match(t,/if\(kind==='fingertip'&&!reduced\.current\)stopUntil\.current=performance\.now\(\)\+340;/,'the close call: one brief freeze');
 assert.match(t,/beanLookFor\(c\.loadCustomization\(p\.completed,p\.total\)\)/,'the keeper is the player’s own island bean');
 assert.doesNotMatch(t,/setInterval|Notification|streak\.day|liveStreak/);assert.doesNotMatch(css,/IslandBrush/);assert.doesNotMatch(css,/blur\(|backdrop-filter|linear-gradient\(/);assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
 assert.match(v,/getContext\('2d',\{alpha:false\}\)/);assert.match(v,/dpr=Math\.min\(2,Math\.max\(1,ratio\)\)/);assert.doesNotMatch(v,/requestAnimationFrame|setTimeout|setInterval|createLinearGradient|createRadialGradient|shadowBlur|filter\s*=/);
 assert.match(v,/INK='#231a2e',PAPER='#fff3d6',SUN='#ffc83a',ORANGE='#ff8a3c',RED='#f0452e',TEAL='#19b5a5',VIOLET='#8f78b8'/,'the comic kit’s hex values');});

ok('sound: every voice -> master -> ONE limiter -> destination; nothing before a gesture; no loops',()=>{
 const a=read('lib/arcade/safehands/audio.ts');assert.match(a,/master\.connect\(limiter\);limiter\.connect\(ctx\.destination\);/);assert.equal((a.match(/limiter\.connect\(/g)||[]).length,1);
 assert.doesNotMatch(a,/setInterval|setTimeout|loop\s*=\s*true/);assert.match(a,/function unlock\(\)/);assert.match(read('components/games/SafeHandsGame.tsx'),/\(audio\.current\?\?=createSafehandsAudio\(\)\)\.unlock\(\)/);
 assert.match(read('scripts/check-arcade-audio.cjs'),/game==='safehands'/);});

if(require.main===module)console.log(`safehands-core: ${n} checks ok`);
module.exports={ok,read,C,S};
