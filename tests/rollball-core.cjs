// Roll It In (Nov 17 2026, docs/arcade-aaa/rollball-direction.md): the physics, every puzzle module solved by its scripted bot through the
// real physics, the seeded level generator and its ramp, runs that end, the device save and the arcade wiring.
// Run: node tests/rollball-core.cjs  (--bots prints the bot numbers the medal marks come from)
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const K=require('../lib/arcade/rollball/core.ts'),S=require('../lib/arcade/rollball/save.ts');
const read=p=>fs.readFileSync(p,'utf8'),{RB,MODULES}=K,BOTS=process.argv.includes('--bots');
let n=0;const ok=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL: '+name);throw e;}};

/** Plays a game with the scripted bot (a new bot per module and after every respawn). noise: the drifting thumb (0 = exact). */
function play(g,{noise=0,seed=1,star=false,maxSec=120,until=s=>s.stats.levels>0}={}){
 const s=g.state,rnd=K.mulberry(seed);let bot=null,key='',since=0;
 for(let i=0;i<maxSec/RB.dt&&!s.over;i++){const P=s.world.mods[s.mod],k=s.level+':'+s.mod+':'+(s.stats.falls+s.stats.timeouts);
  if(k!==key){key=k;since=s.t;bot=K.scriptBot(P.def,P.z,{noise,rnd,star});}
  if(s.t-since>45&&s.respawnIn<=0&&s.between<=0){g.retry();since=s.t;}// stuck (a cone knocked too softly...): a child presses Retry
  if(s.respawnIn>0||s.between>0)g.input(0,0);else bot.next(g);g.step();
  g.drain(e=>{if(e.type==='respawn')bot=K.scriptBot(s.world.mods[s.mod].def,s.world.mods[s.mod].z,{noise,rnd,star:false});});
  if(until(s))break;}
 return s;
}
/** Holds the stick in one direction on a flat strip of one surface and returns the top speed reached. */
function topSpeed(surf){const g=K.createRollBall({seed:3,fixPlan:[0]}),s=g.state;for(const p of s.world.pieces)if(p.mod===0)p.surf=surf;s.ball.z=.5;let v=0;
 for(let i=0;i<120*1.2;i++){g.input(0,1);g.step();v=Math.max(v,Math.hypot(s.ball.vx,s.ball.vz));}return v;}

ok('physics: surfaces feel different, slopes pull, steps climb, walls stop, water costs a heart',()=>{
 const sp={};for(const k of ['grass','long','sand','mud','wood','ice'])sp[k]=topSpeed(k);
 assert.ok(sp.mud<sp.sand&&sp.sand<sp.long&&sp.long<sp.grass&&sp.grass<sp.wood,'mud < sand < long grass < short grass < planks: '+JSON.stringify(sp));
 {const flat=MODULES.findIndex(m=>m.id==='hold-door'),g=K.createRollBall({seed:3,fixPlan:[flat]}),s=g.state;for(const p of s.world.pieces)if(p.mod===0)p.surf='ice';s.ball.x=1.5;s.ball.vz=4;for(let i=0;i<120;i++){g.input(0,0);g.step();}
  const g2=K.createRollBall({seed:3,fixPlan:[flat]}),s2=g2.state;s2.ball.x=1.5;s2.ball.vz=4;for(let i=0;i<120;i++){g2.input(0,0);g2.step();}assert.ok(s.ball.z-1>1.4*(s2.ball.z-1),'wet tiles slide much further than grass: '+[s.ball.z,s2.ball.z]);}
 {const g=K.createRollBall({seed:3,fixPlan:[0]}),s=g.state;s.ball.z=6.6;for(let i=0;i<120;i++){g.input(0,0);g.step();}assert.ok(s.ball.z>7,'the ball rolls down the far side of the hill on its own');}
 {const i=MODULES.findIndex(m=>m.id==='steps'),g=K.createRollBall({seed:3,fixPlan:[i]}),s=g.state;for(let k=0;k<120*2;k++){g.input(0,1);g.step();}assert.ok(s.ball.y>RB.r+.5,'0.2 m steps are climbed: '+s.ball.y);}
 {const i=MODULES.findIndex(m=>m.id==='first-touch'),g=K.createRollBall({seed:3,fixPlan:[i]}),s=g.state;s.ball.x=1.5;for(let k=0;k<120*3;k++){g.input(0,1);g.step();}assert.ok(s.ball.z<10.2&&s.ball.z>9,'a closed gate is a wall (the plate was missed): '+s.ball.z);}
 {const g=K.createRollBall({seed:3,fixPlan:[0]}),s=g.state,ev=[];s.level=RB.gentle+1;for(let k=0;k<120*2.5;k++){g.input(k<200?1:0,0);g.step();g.drain(e=>ev.push(e.type));}assert.equal(s.hearts,RB.hearts-1,'off the edge into the water');assert.ok(ev.includes('splash')&&ev.includes('respawn'));assert.ok(Math.abs(s.ball.x)<.01&&s.ball.z<1.5,'back at the checkpoint');}
 // the first minutes forgive (Nov 17 improve pass): level 1 costs no heart, levels 1-3 respawn on the last firm spot with the puzzle kept
 for(const L of [1,2]){const g=K.createRollBall({seed:3,fixPlan:[0]}),s=g.state,ev=[];s.level=L;for(let k=0;k<120*2.5;k++){g.input(k<200?1:0,0);g.step();g.drain(e=>ev.push(e.type));}assert.equal(s.hearts,L===1?RB.hearts:RB.hearts-1,'level '+L+' fall: hearts');assert.equal(s.stats.falls,1);assert.ok(ev.includes('splash')&&ev.includes('respawn'));assert.ok(Math.abs(s.ball.x)>.3&&Math.abs(s.ball.x)<2,'level '+L+': back close to where it fell, not at the checkpoint');}
});
ok('every module is solvable: its scripted bot finishes it through the real physics, within par, and reaches its star',()=>{
 const times=[];
 MODULES.forEach((m,i)=>{const s=play(K.createRollBall({seed:7,fixPlan:[i]}));assert.equal(s.stats.levels,1,m.id+' finished');assert.equal(s.stats.falls,0,m.id+' without a fall');
  const t=s.levelTime-K.GOAL_MODULE.par;assert.ok(t<=m.par,`${m.id}: bot ${t.toFixed(1)} s within par ${m.par}`);times.push(`${m.id} ${t.toFixed(1)}/${m.par}`);
  if(m.starBot){const s2=play(K.createRollBall({seed:7,fixPlan:[i]}),{star:true});assert.equal(s2.stats.levels,1,m.id+' with the star route');assert.equal(s2.stats.stars,1,m.id+' star taken');}});
 assert.ok(MODULES.length>=16,'at least 16 modules');for(const t of [0,1,2,3])assert.ok(MODULES.filter(m=>m.theme===t).length>=4,'four modules or more per theme');
 assert.equal(new Set(MODULES.map(m=>m.id)).size,MODULES.length);
 assert.ok(MODULES.filter(m=>m.mech.length>=3).length>=3,'combined puzzles (three mechanics or more)');
 if(BOTS)console.log('bot module times (s / par):',times.join(', '));
});
ok('generator: deterministic, one new puzzle a level until all are met, difficulty rises with the level',()=>{
 const plans=seed=>{const r=K.mulberry(seed),seen=new Set();return Array.from({length:60},(_,L)=>K.levelPlan(r,L+1,seen));};
 assert.deepEqual(plans(42),plans(42),'same seed, same run');assert.notDeepEqual(plans(42),plans(43));
 for(const seed of [1,2,3,4,5,6]){const P=plans(seed),seen=new Set();
  P.slice(0,MODULES.length).forEach((p,L)=>{const fresh=p.filter(i=>!seen.has(i));assert.equal(fresh.length,1,`seed ${seed} level ${L+1} brings exactly one new puzzle`);for(const i of p)seen.add(i);});
  assert.equal(seen.size,MODULES.length,'every module is met by level '+MODULES.length);
  const mean=(a,b)=>{let t=0;for(let L=a;L<=b;L++)t+=K.levelRating(P[L-1]);return t/(b-a+1);};
  const bands=[mean(1,4),mean(5,9),mean(10,16),mean(17,30),mean(31,60)];for(let k=1;k<bands.length;k++)assert.ok(bands[k]>bands[k-1],`seed ${seed}: rating rises ${bands.map(v=>v.toFixed(1))}`);
  const avg=(a,b)=>{let t=0,c=0;for(let L=a;L<=b;L++)for(const i of P[L-1]){t+=MODULES[i].rating;c++;}return t/c;};assert.ok(avg(40,60)>avg(17,25),'the easy ones leave the mix');}
 assert.equal(K.levelSize(1),1);assert.ok(K.levelSize(30)>K.levelSize(8));assert.equal(K.clockFor(3,50)>0,true);assert.ok(K.clockFor(40,60)<K.clockFor(5,60),'the clock share shrinks');
 assert.equal(K.rollballDailySeed('2026-11-17'),K.rollballDailySeed('2026-11-17'));assert.notEqual(K.rollballDailySeed('2026-11-17'),K.rollballDailySeed('2026-11-18'));
 const a=K.createRollBall({seed:K.rollballDailySeed('2026-11-17'),daily:true}),b=K.createRollBall({seed:K.rollballDailySeed('2026-11-17'),daily:true});assert.deepEqual(a.state.plan,b.state.plan,'the Daily Roll is the same for everyone');
});
ok('runs: an exact bot keeps going and the streak pays; a drifting thumb loses hearts and every run ends',()=>{
 const g=K.createRollBall({seed:11}),s=play(g,{maxSec:600,until:s=>s.level>=9});assert.ok(s.level>=9&&!s.over,'the exact bot reaches level 9');assert.equal(s.hearts,RB.hearts);assert.ok(s.stats.bestStreak>=8);
 const ends=[],scores=[];for(const seed of [101,202,303,404,505,606]){const r=play(K.createRollBall({seed}),{noise:1.1,seed,maxSec:2400,until:()=>false});ends.push(r.over);scores.push(r.score);}
 assert.ok(ends.every(Boolean),'every drifting-thumb run ends: '+ends);
 scores.sort((a,b)=>a-b);assert.ok(scores.filter(v=>v>=RB.medals[0]).length>=3,'bronze is in reach of a wobbly first-timer: '+scores);assert.ok(scores[scores.length-1]<RB.medals[2],'gold is not');
 if(BOTS)console.log('drifting-thumb scores (noise 1.1):',scores.join(' '),' exact bot level 9 score',s.score);
 assert.equal(K.medalFor(RB.medals[0]-1),0);assert.equal(K.medalFor(RB.medals[2]),3);assert.equal(K.rollballCoins(900),3);
});
ok('puzzle rules: heavy plates ignore the ball, order plates reset on a wrong press, timed plates close, retry is free',()=>{
 const hi=MODULES.findIndex(m=>m.id==='hold-door'),g=K.createRollBall({seed:1,fixPlan:[hi]}),s=g.state,pl=s.world.plates[0];s.ball.x=pl.x;s.ball.z=pl.z;for(let i=0;i<60;i++){g.input(0,0);g.step();}assert.equal(s.world.sig[pl.sig],false,'the ball alone is too light');
 const oi=MODULES.findIndex(m=>m.id==='shell-order'),g2=K.createRollBall({seed:1,fixPlan:[oi]}),s2=g2.state,ev=[],press=k=>{const p=s2.world.plates[k];s2.ball.x=p.x;s2.ball.z=p.z;s2.ball.vx=s2.ball.vz=0;for(let i=0;i<20;i++){g2.input(0,0);g2.step();}s2.ball.x=0;s2.ball.z=1;for(let i=0;i<5;i++)g2.step();g2.drain(e=>ev.push(e.type));};
 press(0);press(2);assert.ok(ev.includes('wrong'));assert.ok(s2.world.plates.every(p=>!p.lit),'all unlit after a wrong press');press(0);press(1);press(2);assert.equal(s2.world.sig[0],true,'1, 2, 3 opens');
 const ti=MODULES.findIndex(m=>m.id==='quick-gate'),g3=K.createRollBall({seed:1,fixPlan:[ti]}),s3=g3.state,tp=s3.world.plates[0];s3.ball.x=tp.x;s3.ball.z=tp.z;for(let i=0;i<10;i++)g3.step();assert.equal(s3.world.sig[0],true);s3.ball.x=0;s3.ball.z=1;for(let i=0;i<120*(tp.T+.2);i++){g3.input(0,0);g3.step();}assert.equal(s3.world.sig[0],false,'the timed plate lets go');
 const hearts=s.hearts;g.retry();assert.equal(s.hearts,hearts,'retry costs nothing');assert.ok(s.ball.z<1.5);
});
ok('AAA pass (Nov 18 2026): cones teach their rule, boost pads, sweepers, the goal keeper, close calls, the look and feel hooks',()=>{
 const mod=id=>MODULES.findIndex(m=>m.id===id),evs=(g,n,fn)=>{const ev=[];for(let i=0;i<n;i++){if(fn)fn(i);g.step();g.drain(e=>ev.push(e));}return ev;};
 // a cone hit too softly rocks and stays, and says how close it was; hard enough knocks it; a quick glancing hit is forgiven
 {const hit=(vx,vz,dx=0)=>{const g=K.createRollBall({seed:1,fixPlan:[mod('cone-knock')]}),s=g.state,c=s.world.posts[0];s.ball.x=c.x+dx;s.ball.z=c.z-1.2;s.ball.y=RB.r;s.ball.vx=vx;s.ball.vz=vz;const ev=evs(g,90,()=>g.input(0,0));return {c,ev};};
  const soft=hit(0,2),w=soft.ev.find(e=>e.type==='wobble');assert.ok(w&&!soft.c.down,'a soft hit leaves the stack standing and emits a wobble');assert.ok(w.b>.3&&w.b<1,'the wobble carries the share of the speed needed: '+w.b);
  const softer=hit(0,1.2).ev.find(e=>e.type==='wobble');assert.ok(softer&&softer.b<w.b,'a softer hit rocks less');
  const hard=hit(0,5);assert.ok(hard.c.down&&hard.ev.some(e=>e.type==='cone'),'a hard hit knocks it');
  const glance=hit(0,6,.52);assert.ok(glance.c.down,'a quick glancing hit knocks it too');assert.ok(RB.knockGlance<1&&RB.knockFast>1);}
 // a boost pad sends the ball off at its own speed however it came; a crate on it does nothing
 {const g=K.createRollBall({seed:1,fixPlan:[mod('speed-strip')]}),s=g.state,pad=s.world.plates.find(p=>p.kind==='boost');s.ball.x=pad.x;s.ball.z=pad.z-.9;s.ball.vz=1;const ev=evs(g,120,()=>g.input(0,.2));
  assert.ok(ev.some(e=>e.type==='boost'),'boost event');assert.ok(ev.some(e=>e.type==='cone'),'the pad alone carries the ball through the first cone: speed is the lesson');assert.ok(!ev.some(e=>e.type==='plate'),'a pad is not a plate');}
 // sweepers: the same place at the same time for everyone, they knock the ball away, and the scripted bots wait for the gap
 {const at=()=>{const g=K.createRollBall({seed:5,fixPlan:[mod('crab-walk')]});for(let i=0;i<333;i++)g.step();return g.state.world.posts[0].x;};assert.equal(at(),at(),'deterministic');
  const g=K.createRollBall({seed:1,fixPlan:[mod('crab-walk')]}),s=g.state,p=s.world.posts[0];assert.equal(p.kind,'sweeper');let lo=9,hi=-9;const ev=evs(g,120*4,()=>{lo=Math.min(lo,p.x);hi=Math.max(hi,p.x);s.ball.x=0;s.ball.z=p.hz;s.ball.y=RB.r;});
  assert.ok(hi-lo>2,'it slides across: '+[lo,hi]);assert.ok(ev.some(e=>e.type==='sweep'),'a ball left on its rail is knocked away');}
 // the goal keeper: none early, on from KEEPER.from, a little faster every level, never under the floor; the exact bot still scores past it
 {const keeper=L=>K.buildWorld([0],L).posts.find(p=>p.kind==='sweeper');assert.equal(keeper(K.KEEPER.from-1),undefined);assert.ok(keeper(K.KEEPER.from),'a keeper from level '+K.KEEPER.from);
  assert.ok(K.keeperPeriod(20)<K.keeperPeriod(K.KEEPER.from),'later keepers are quicker');assert.equal(K.keeperPeriod(500),K.KEEPER.min);
  for(const L of [6,14,40]){const g=K.createRollBall({seed:9,fixPlan:[0]}),s=g.state;s.level=L;s.world=K.buildWorld(s.plan,L);const r=play(g,{maxSec:60});assert.equal(r.stats.levels,1,'level '+L+': the bot scores past the keeper');assert.equal(r.hearts,RB.hearts);}}
 // through a timed gate with under a second left: one close-call event
 {const g=K.createRollBall({seed:1,fixPlan:[mod('quick-gate')]}),s=g.state,pl=s.world.plates[0],r=s.world.recvs.find(q=>q.kind==='gate');s.ball.x=pl.x;s.ball.z=pl.z;evs(g,10);s.ball.x=0;s.ball.z=r.z0-.8;s.ball.vx=0;s.ball.vz=0;
  evs(g,Math.round(120*(pl.T-.7)),()=>g.input(0,0));s.ball.z=r.z0-.4;s.ball.vz=4.5;const ev=evs(g,90,()=>g.input(0,1));assert.equal(ev.filter(e=>e.type==='close').length,1,'JUST IN TIME');}
 // walls are heard now, and landings bounce
 {const g=K.createRollBall({seed:1,fixPlan:[0]}),s=g.state;s.ball.x=1.2;s.ball.z=9.6;s.ball.vz=6;const ev=evs(g,40,()=>g.input(0,0));assert.ok(ev.some(e=>e.type==='wall'&&e.b>3),'a wall hit reports its speed');}
 const view=read('lib/arcade/rollball/view.ts'),shell=read('components/games/RollBallGame.tsx'),css=read('components/games/RollBallGame.module.css'),audio=read('lib/arcade/rollball/audio.ts');
 assert.match(view,/ring\.material=hot\?coneHot:ringOff/,'the speed ring glows when the ball is quick enough');assert.match(view,/p\.wob\*p\.wob/,'the stack rocks by the share');assert.match(view,/getConeStack\(\)/,'a standing stack is one mesh');
 assert.match(view,/introT=reduced\?0:1/,'the level opens with a look over the puzzle, not for reduced motion');assert.match(view,/rib\.visible=heat>\.03&&!reduced/);assert.match(view,/gulls\.visible=t!==3&&!reduced/);assert.match(view,/moodFor\(curLevel\)/,'time of day by level');
 assert.match(view,/fragmentShader:BOOST/);assert.match(view,/th===1\?getCrab\(\):getDummy\(\)/);
 assert.match(shell,/hold\(70\)/,'hit-stop on a cone');assert.match(shell,/if\(!reduced\.current\)holdUntil\.current=/);assert.match(shell,/teach\('cone'\)/);assert.match(shell,/data-rollball-tip/);assert.match(shell,/data-rollball-pts/);
 for(const line of shell.match(/const TIPS=\{[^}]*\}/)[0].match(/'[^']+'/g))assert.ok(line.length<36&&!/[—;]/.test(line),'tips are one short line: '+line);
 assert.match(css,/@keyframes rbFly/);assert.match(css,/prefers-reduced-motion:reduce\)\{\.hurt\{display:none\}\.pts\{animation:rbPuzzleFade/);
 for(const cue of ['wobble','boost','sweep','close','respawn','ambience'])assert.match(audio,new RegExp('\\b'+cue+'\\('),'a sound for '+cue);assert.match(audio,/const jit=/,'repeats are detuned');
});
ok('device save: best, daily first run, day streak, medal, sanitising, results lines',()=>{
 const stats={levels:3,modules:5,stars:2,starsSeen:4,falls:3,timeouts:0,perfect:1,bestStreak:1,knocks:1,time:120};
 let st=S.settleRollball(S.emptyRollballSave(),{score:2600,daily:false,day:'2026-11-17',stats,level:4});assert.ok(st.newBest);assert.equal(st.save.best,2600);assert.equal(st.medal,1);assert.ok(st.newMedal);
 st=S.settleRollball(st.save,{score:900,daily:true,day:'2026-11-17',stats,level:2});assert.ok(st.dailyFirst);assert.equal(st.save.best,2600,'a daily run does not touch the endless best');assert.equal(st.streak,1);
 const again=S.settleRollball(st.save,{score:1000,daily:true,day:'2026-11-17',stats,level:2});assert.equal(again.dailyFirst,false,'later daily runs are practice');assert.equal(again.dailyBest,1000);
 const next=S.settleRollball(again.save,{score:10,daily:true,day:'2026-11-18',stats,level:1});assert.equal(next.streak,2,'a day in a row');assert.equal(S.liveStreak(next.save,'2026-11-20'),0,'a missed day ends it');
 assert.equal(S.sanitizeRollballSave({best:-5,medal:99,daily:{day:'x'}}).best,0);assert.equal(S.sanitizeRollballSave({medal:99}).medal,3);
 assert.match(S.nearMissLine({score:1450,best:0,newBest:true,daily:false,stats}),/50 points from Bronze/);assert.match(S.nearMissLine({score:900,best:1000,newBest:false,daily:false,stats}),/100 points from your best/);
 assert.match(S.coachLine(stats,'clock'),/clock/);assert.ok(S.ROLLBALL_TIPS.length>=5);
});
ok('arcade wiring: last in the back row, board, coins, save key, last score, room route, analytics, SQL',()=>{
 const L=require('../lib/arcade/leaderboard.ts'),{arcadeCabinets,ARCADE_ROW}=require('../lib/arcade/arcadeCatalog.ts'),{arcadeCoinTarget}=require('../lib/arcade/arcadeWalletCore.ts'),{ARCADE_COIN_CAPS}=require('../lib/economy.ts');
 const {isSyncKey}=require('../lib/saves/snapshot.ts'),{LAST_SCORE_GAMES}=require('../lib/arcade/lastScore.ts');
 const cab=arcadeCabinets.find(c=>c.id==='rollball');assert.ok(cab,'a cabinet');assert.equal(ARCADE_ROW[ARCADE_ROW.indexOf('trophydrop')+1],'rollball','after Trophy Drop (Nov 18 2026: the retired tap puzzle\'s place)');assert.equal(ARCADE_ROW[ARCADE_ROW.length-2],'rollball','Ball Blaster follows it');
 assert.equal(cab.lesson,'Look before you roll. Plan the next touch.');assert.equal(cab.name,'Roll It In');assert.equal(cab.z,-10);assert.equal(cab.yaw,0);
 assert.ok(L.BOARD_GAMES.includes('rollball')&&L.HALL_MACHINES.includes('rollball'),'one all-time board, in the Hall');assert.equal(L.BOARD_TIER_TABS.rollball,undefined,'no second (daily) board');assert.equal(L.BOARD_RULES.rollball.learn,cab.lesson);
 assert.equal(arcadeCoinTarget('rollball',{points:900}),3);assert.equal(arcadeCoinTarget('rollball',{points:1e6}),ARCADE_COIN_CAPS.rollball);
 assert.ok(isSyncKey('fi2-rollball-v1'),'the save travels with the player');assert.ok(LAST_SCORE_GAMES.includes('rollball')&&LAST_SCORE_GAMES.includes('rollball_daily'));
 const room=read('components/ArcadeRoom.tsx');assert.match(room,/rollball:\(\)=>import\('\.\/games\/RollBallGame'\)/);assert.match(room,/RollBall=dynamic\(\(\)=>retryImport\(\(\)=>import\('\.\/games\/RollBallGame'\)\)/);assert.match(room,/game==='rollball'\?<RollBall onExit=\{back\}\/>/);
 assert.match(read('lib/analytics/islandIds.ts'),/'trophydrop','rollball','ballblaster'()?(,'keepyuppy')?(,'holdtheline')?(,'popup')?\]/);assert.match(read('lib/analytics/islandIds.ts'),/\['arcade_rollball','Arcade: Roll It In'\]/);
 assert.match(read('components/arcade/HighScoreEntry.tsx'),/'trophydrop','rollball'/,'results-first high-score strip');assert.match(read('components/games/skins/index.ts'),/rollball:rollball\.skin/);
 const own=read('docs/arcade-aaa/rollball-supabase.sql');assert.match(own,/'clearbox', 'streetdash', 'rollball'\)\);/);assert.match(own,/'arcade_streetdash','arcade_rollball',/);assert.match(own.trim().split('\n').pop(),/end as status;$/);assert.match(own,/'OK, Roll It In installed'/);
 const sql=read('docs/arcade-aaa/swap-games-supabase.sql')/* Nov 18 2026: the owner's paste file for Roll It In and Ball Blaster */,list=/check \(game in \(([^)]*)\)\)/.exec(sql.replace(/--.*$/gm,''))[1].split(',').map(v=>v.trim().replace(/'/g,''));assert.deepEqual(list,[...L.BOARD_GAMES].filter(g=>g!=='keepyuppy'&&g!=='holdtheline'&&g!=='popup'/* Nov 21 2026: the three new games' boards come in docs/arcade-aaa/new-games-nov21-supabase.sql */),'the owner file names every board');
 assert.match(sql,/prosrc like '%arcade_rollball%'/,'the self-check looks for the key');
 {const mig=read('supabase/migrations/20261203_ballblaster_boards.sql')/* Nov 18 2026: the newest board file, it keeps 'rollball' */;for(const g of L.BOARD_GAMES.filter(g=>g!=='keepyuppy'&&g!=='holdtheline'&&g!=='popup'))assert.ok(mig.includes(`'${g}'`),'migration names '+g);}assert.match(read('supabase/migrations/20261202_analytics_rollball.sql'),/'arcade_streetdash','arcade_rollball'/);
 const shell=read('components/games/RollBallGame.tsx');assert.match(shell,/beginBoardSession\('rollball'\)/);assert.match(shell,/!r\.daily\|\|settled\.dailyFirst/,'only the first daily run posts');assert.match(shell,/data-rollball-daily/,'the Daily Roll is offered on the start card');
 assert.match(read('scripts/check-arcade-audio.cjs'),/game==='rollball'/);assert.match(read('scripts/check-arcade-load.cjs'),/'trophydrop','rollball','ballblaster'()?(,'keepyuppy')?(,'holdtheline')?(,'popup')?\]/);
});
ok('sound: one limiter wired to the output only; made on the first tap; no timers',()=>{
 const a=read('lib/arcade/rollball/audio.ts');assert.match(a,/master\.connect\(limiter\);limiter\.connect\(ctx\.destination\);/);assert.equal((a.match(/limiter\.connect\(/g)||[]).length,1);
 assert.doesNotMatch(a,/setInterval|setTimeout/);assert.equal((a.match(/loop\s*=\s*true/g)||[]).length,1,'one looped voice: the roll, whose gain follows the speed');assert.match(a,/quiet\(\)/);assert.match(a,/function unlock\(\)/);
 assert.match(read('components/games/RollBallGame.tsx'),/\(audio\.current\?\?=createRollballAudio\(\)\)\.unlock\(\)/);
});
ok('heat and input: one canvas, the loop only while playing and capped at 60, low-power WebGL, capped pixel ratio, modules disposed, stick and keys',()=>{
 const shell=read('components/games/RollBallGame.tsx'),view=read('lib/arcade/rollball/view.ts');
 assert.equal((shell.match(/<canvas /g)||[]).length,1,'one canvas');assert.match(shell,/if\(phaseRef\.current!=='playing'\|\|!g\|\|!v\)return;/,'the loop stops off the pitch');assert.match(shell,/FRAME_MS=1000\/61/);
 assert.match(shell,/import\('@\/lib\/arcade\/rollball\/view'\)/,'three.js loads with the game, through retryImport');assert.match(shell,/useFloatingStick/);assert.match(shell,/'ArrowLeft'\)\|\|k\.has\('KeyA'\)/);assert.match(shell,/e\.code==='KeyR'/);
 assert.match(view,/powerPreference:'low-power'/);assert.match(view,/Math\.min\(dpr,mobile\?1\.5:2\)/);assert.match(view,/disposeMod\(mods\[k\]\)/,'modules behind the ball are freed');assert.match(view,/renderer\.forceContextLoss\(\)/);
 assert.doesNotMatch(view,/EffectComposer|postprocessing/);assert.equal((view.match(/castShadow=true;const sm=/g)||[]).length,1,'one shadow-casting light');
 const core=read('lib/arcade/rollball/core.ts');assert.match(core,/dt:1\/120/,'a fixed step');assert.doesNotMatch(core,/Math\.random|Date\.now|performance/,'the core is pure and seeded');
});
console.log(`rollball-core: ${n} checks passed`);
