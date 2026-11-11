// Futbol Pinball endless play, Nov 10 2026 (owner: "the pinball game seems to freeze ... and makes you enter your initials. Fix this
// bug. We need to make it that the user can play as long as they want to increase their score. All these games should also increase in
// difficulty the further they play."). Run: node tests/pinball-endless.cjs
//  1. a run ends ONLY when the last ball is lost: the full-time whistle pays, raises the level and plays on (fixtures + seeded bots)
//  2. the ramp table: level 1 is the game as it was, every parameter moves one way, and the sim really uses each of them
//  3. no dead time: stuck-ball kick-out (up the table, down by the flippers, wedged and jittering), short designed stops
//  4. extra balls at level and score milestones, capped
//  5. boards: same three boards, raised ceilings, unchanged rates, the owner's SQL (additive, every board id, self-check)
//  6. the level on the status tab, the full-time burst, the taught pattern rotating, the frame loop awake while a ball is in play
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {ROOT,createLoader}=require('./summit-harness.cjs');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
let failed=0;const ok=async(name,fn)=>{try{await fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const load=createLoader();
const L=load('lib/arcade/leaderboard.ts'),T=load('lib/games/soccerPinballTiers.ts'),P=load('lib/games/soccerPinball.ts'),E=load('lib/games/soccerPinballEndless.ts'),
 TB=load('lib/games/soccerPinballTable.ts'),M=load('lib/games/soccerPinballMissions.ts'),F=load('lib/games/soccerPinballFeel.ts'),PT=load('lib/games/soccerPinballPatterns.ts'),SP=load('lib/games/soccerPinballScorePanel.ts');
const idle={left:false,right:false,charge:false};
const advance=(s,sec,input=idle,hz=60)=>{for(let i=0;i<Math.round(sec*hz);i++)P.stepPinball(s,input,1/hz);};
const active=(x,y,vx=0,vy=0)=>{const s=P.createPinballState();P.launchPinball(s);Object.assign(s.ball,{x,y,vx,vy});s.openingRescue=false;s.launchGrace=0;return s;};
/** Park the clock at the end of stoppage time: the next step blows the whistle. */
const toWhistle=s=>{s.clock=P.PINBALL_MATCH_TIME;s.stoppage=P.PINBALL_STOPPAGE;};
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
/** A semi-skilled flipper bot at 30 fps (the phone cap). Returns every phase change to 'over' and what the run reached. */
function bot(seed,seconds,tier=0){const r=rng(seed),s=P.createPinballState();P.beginPinballRun(s,{level:1,tier});const hold=[0,0],dt=1/30,overs=[];let t=0,wait=0,nonPlay=0,maxNonPlay=0,still=0,ax=0,ay=0,maxStill=0;
 while(t<seconds){const b=s.ball,inp={left:false,right:false,charge:false};
  if(s.phase==='ready'){wait+=dt;if(wait>.3){P.launchPinball(s,.68);wait=0;}}
  if(s.phase==='playing'){nonPlay=0;for(let i=0;i<2;i++){if(hold[i]>0)hold[i]-=dt;else if((i?b.x>180:b.x<=180)&&b.x<341&&b.y>498+r()*18&&b.y<560&&b.vy>-50&&r()>.3)hold[i]=.14;}inp.left=hold[0]>0;inp.right=hold[1]>0;
   if(Math.hypot(b.x-ax,b.y-ay)>4||b.y>450&&(s.left>.08||s.right>.08)){still=0;ax=b.x;ay=b.y;}else{still+=dt;maxStill=Math.max(maxStill,still);}}
  else{still=0;nonPlay+=dt;maxNonPlay=Math.max(maxNonPlay,nonPlay);}
  const before=s.phase;P.stepPinball(s,inp,dt);t+=dt;
  if(s.phase==='over'&&before!=='over'){overs.push({t,balls:s.balls,match:s.match});break;}}
 return{s,t,overs,maxNonPlay,maxStill};}

(async()=>{
await ok('a run ends only when the last ball is lost: full time pays, raises the level and plays on',()=>{
 // Past 90' + stoppage with three balls in hand and the ball in flight: no phase change, no input lock, the ball keeps its flight.
 const s=active(120,300,90,-60);toWhistle(s);const v=[s.ball.vx,s.ball.vy],score=s.score;P.stepPinball(s,idle,1/60);
 assert.equal(s.phase,'playing','the ball is never taken away');assert.equal(s.match,2);assert.equal(s.cue,'fullTime');assert.equal(s.balls,3);
 assert(Math.abs(s.ball.vx-v[0])<20&&Math.abs(s.ball.vy-v[1])<20,'the flight carries on');assert.equal(P.pinballMinute(s),"0'",'the next match kicks off at once');
 assert.equal(s.stoppage,-1);assert.equal(s.halfTime,false);assert.equal(s.fullTimeBonus,3*P.PINBALL_FULLTIME_BALL);assert.equal(s.score-score,1500,'score carried on, bonus added');
 P.stepPinball(s,{left:true,right:true,charge:false},1/60);assert(s.left>0&&s.right>0,'flippers answer on the very next frame');
 // Ten whistles in a row with balls left: still the same run.
 for(let i=0;i<10;i++){toWhistle(s);Object.assign(s.ball,{x:120,y:300,vx:0,vy:-200});P.stepPinball(s,idle,1/60);assert.notEqual(s.phase,'over');}
 assert.equal(s.match,12);assert(s.balls>=3);
 // A whistle that waits for the ball: the goal in stoppage time counts, then the next match starts on the plunger with every ball.
 const g=active(180,49,0,-400);g.clock=P.PINBALL_MATCH_TIME;g.stoppage=3;advance(g,1.7);assert.equal(g.phase,'ready');assert.equal(g.match,2);assert.equal(g.balls,3);assert.equal(P.launchPinball(g),true);
 // The Cup Final still finishes before the whistle.
 const c=active(60,300);toWhistle(c);c.table.mode='final';c.table.modeTime=5;advance(c,1);assert.equal(c.match,1);
 // The only way out: the last ball. Drain all three past 90' of the THIRD match.
 const d=active(120,300);for(let i=0;i<2;i++){toWhistle(d);P.stepPinball(d,idle,1/60);}assert.equal(d.match,3);d.table.assist=false;
 let guard=0;while(d.phase!=='over'&&guard++<12){if(d.phase==='ready'){d.openingRescue=false;d.table.assist=false;P.launchPinball(d);d.table.saver=false;d.table.mode='none';Object.assign(d.ball,{x:180,y:625,vx:0,vy:400});}advance(d,1.3);}
 assert.equal(d.phase,'over');assert.equal(d.balls,0,'over means no balls left');assert.equal(P.launchPinball(d),false);
 assert.match(T.pinballEndReason(d,P.pinballMinute(d)),/^Out of balls at \d+' in match 3\. /);assert.match(F.pinballTableMessage(d),/^Out of balls at \d+' · level 3 · /);
 // The source has one way to 'over'.
 const src=read('lib/games/soccerPinball.ts');assert.equal((src.match(/phase = [^;\n]*'over'/g)||[]).length,1,'one transition to over');assert.match(src,/s\.phase = s\.balls > 0 \? 'ready' : 'over';/);
 const ft=src.slice(src.indexOf('function fullTime('),src.indexOf('function extraBall('));assert(!/phase|ball\.v|tableDrain/.test(ft),'full time never touches the phase or the ball');
});

await ok('seeded bots: several matches in one run, never forced over, no dead second',()=>{
 let whistles=0;for(const seed of [11,23,37,51]){const r=bot(seed,560);whistles+=r.s.match-1;
  for(const o of r.overs)assert.equal(o.balls,0,`seed ${seed}: over at ${o.t.toFixed(0)} s with balls left`);
  if(!r.overs.length)assert(r.s.match>=3,`seed ${seed}: 560 s of play is at least the third match (got ${r.s.match})`);
  assert(r.maxNonPlay<=1.5+.3+.1,`seed ${seed}: longest stop between balls ${r.maxNonPlay.toFixed(2)} s`);
  assert(r.maxStill<=1,`seed ${seed}: a ball in play sat still for ${r.maxStill.toFixed(2)} s`);}
 assert(whistles>=4,'the bots heard full time and played on: '+whistles);
 for(const tier of [1,2]){const r=bot(5,400,tier);for(const o of r.overs)assert.equal(o.balls,0,'tier '+tier);assert.equal(T.pinballBoardFor(r.s.tier),tier===1?'pinderby':'pinfinal','a tier run keeps its board at any level');}
});

await ok('ramp table: level 1 is the old game, every parameter moves one way, and the sim uses each one',()=>{
 const R=E.PINBALL_RAMP;assert(R.length>=10);assert.deepEqual({...R[0]},{level:1,speed:1,keeper:1,reach:0,defs:1,press:0,save:1,window:1,bat:0,saver:true},'level 1 = the values before endless play');
 R.forEach((r,i)=>{assert.equal(r.level,i+1);if(!i)return;const p=R[i-1];
  for(const k of ['speed','keeper','reach','defs','press','bat'])assert(r[k]>=p[k],`${k} never falls (level ${r.level})`);
  for(const k of ['save','window'])assert(r[k]<=p[k],`${k} never grows (level ${r.level})`);assert(!(r.saver&&!p.saver),'the free saver never comes back');
  assert(r.speed-p.speed<=.035&&r.keeper-p.keeper<=.065&&r.bat-p.bat<=1&&p.save-r.save<=.11,'smooth: small steps (level '+r.level+')');
  assert(r.speed>p.speed||r.keeper>p.keeper,'every level is harder than the last');});
 const top=R[R.length-1];assert(top.speed<=1.3&&top.keeper<=1.6&&top.reach<=12&&top.save>=.3&&top.window>=.5,'the top stays playable');
 assert.equal(E.pinballRamp(1),R[0]);assert.equal(E.pinballRamp(0),R[0]);assert.equal(E.pinballRamp(NaN),R[0]);assert.equal(E.pinballRamp(2.9),R[1]);assert.equal(E.pinballRamp(999),top,'past the table: the last row');
 // Level 1 in the sim: the old numbers.
 assert.equal(P.createPinballState().match,1);assert.equal(P.pinballBatLength(1,0,1),63);assert.equal(P.pinballBatLength(1),63);assert.equal(P.pinballFlippers({left:0,right:0})[0].length,63);
 for(const [lv,b] of [[1,false],[1,true],[2,false],[4,false],[6,false]])assert.equal(E.pinballRampSave(P.pinballBallSaveTime(lv,b),1),P.pinballBallSaveTime(lv,b),'ball save at level 1 unchanged');
 {const s=P.createPinballState();P.launchPinball(s);assert.equal(s.launchGrace,5,'Build Up: 5 s of ball save');assert.equal(s.table.saver,true,'Build Up: the free goal-line saver');}
 assert.equal(M.pinballHotTime({level:1,match:1}),M.hotZoneTime(1));assert.equal(E.pinballModeNeed(3,1),3);assert.equal(TB.DUGOUT_HOLD<1,true);
 // Each parameter is live. speed: the same real time moves the table further.
 const fall=m=>{const s=active(120,200,0,0);s.match=m;advance(s,.4);return s.ball.y;};assert(fall(8)>fall(1)+3,'speed: the ball falls faster at level 8');
 // bat: shorter flippers, floor kept, tiers too.
 assert.equal(P.pinballBatLength(1,0,6),63-R[5].bat);assert.equal(P.pinballFlippers({left:0,right:0,level:1,match:6})[0].length,63-R[5].bat);assert.equal(P.pinballBatLength(6,2,99),E.PINBALL_BAT_MIN,'never under the floor');
 // save: a tighter new-ball save, never under the floor.
 {const s=P.createPinballState();s.match=6;P.launchPinball(s);assert.equal(s.launchGrace,E.pinballRampSave(5,6));assert(s.launchGrace<5&&s.launchGrace>=E.PINBALL_SAVE_FLOOR);assert.equal(E.pinballRampSave(1.5,99)>=1,true);assert.equal(E.pinballRampSave(0,5),0,'no save stays no save');}
 // saver: Build Up's free kick-back stops at level 3.
 {const s=P.createPinballState();s.match=3;P.launchPinball(s);assert.equal(s.table.saver,false);const k=P.createPinballState();k.match=2;P.launchPinball(k);assert.equal(k.table.saver,true);}
 // defs: a later match starts its next ball with more defenders even without goals.
 {const s=active(180,625,0,400);s.match=3;s.table.saver=false;advance(s,1.3);assert.equal(s.phase,'ready');assert.equal(s.defs,3);const k=active(180,625,0,400);k.table.saver=false;advance(k,1.3);assert.equal(k.defs,1,'level 1: one defender until a goal');}
 // keeper + reach: he gets further toward the post in the same time.
 const keep=m=>{const s=active(250,200,0,-500);s.match=m;s.defs=3;let far=0;for(let i=0;i<40;i++){Object.assign(s.ball,{x:250,y:200,vx:0,vy:-500});P.stepPinball(s,idle,1/60);far=Math.max(far,s.keeper);}return far;};
 assert(keep(10)>keep(1)+2,'keeper: quicker and wider at level 10');
 // press: the defenders think faster; window: the lit goal and the hot zone are shorter; mode targets rise.
 const src=read('lib/games/soccerPinball.ts');assert.match(src,/ai\.think=\.16-press\(s\)\*\.02\+i\*\.012;/);assert.match(src,/Math\.min\(PINBALL_PRESS_CAP, s\.level - 1 \+ pinballRamp\(s\.match\)\.press\)/);
 assert(.16-E.PINBALL_PRESS_CAP*.02>=0&&.72-E.PINBALL_PRESS_CAP*.05>.2&&1.04-E.PINBALL_PRESS_CAP*.065>.4,'capped: every defender timer stays positive');
 assert(M.pinballHotTime({level:1,match:8})<M.hotZoneTime(1));assert.match(read('lib/games/soccerPinballTable.ts'),/t\.wallLit=wallLitTime\(s\.level\)\*pinballRamp\(s\.match\)\.window;/);
 assert.deepEqual([1,2,3,4,5,9].map(m=>E.pinballModeNeed(3,m)),[3,3,4,4,5,5],'counted modes need more, two more at most');assert.equal(E.pinballModeNeed(1,9),1);
 assert.match(src,/pinballTierSpeed\(s\.tier\) \* pinballRamp\(s\.match\)\.speed/);
});

await ok('missions and divisions come round again in every match',()=>{
 const s=active(120,300);s.challengeComplete=true;s.table.finalPlayed=true;s.table.modesDone=5;toWhistle(s);P.stepPinball(s,idle,1/60);
 assert.equal(s.challengeComplete,false,'the division challenge is re-armed');assert.equal(s.table.finalPlayed,false,'one Cup Final per match');assert.equal(s.table.modesDone,0,'the three modes return');
 const m=active(120,300);m.table.mode='onetwo';m.table.modesDone=1;m.table.modeTime=20;toWhistle(m);P.stepPinball(m,idle,1/60);assert.equal(m.table.mode,'onetwo','a running mode is not cut off');assert.equal(m.table.modesDone,1);
 assert.equal(s.level,1,'the division is not reset by the whistle');assert.equal(s.goals,0);
});

await ok('no dead time: stuck balls are kicked out, designed stops are short',()=>{
 assert(T.PINBALL_STALL_TIME<=2.5&&T.PINBALL_TRAP_TIME<=2.6);
 const up=P.createPinballState();up.phase='playing';Object.assign(up.ball,{x:120,y:300,vx:0,vy:0});let t=0;while(!P.unstick(up,1/30)&&t<5)t+=1/30;assert(t<=2.5,'kicked within 2.5 s: '+t.toFixed(2));assert.equal(up.unstuck,1);assert(up.ball.vy<0);
 // Down by the flippers with both bats down (it used to be left there for ever).
 const low=P.createPinballState();low.phase='playing';Object.assign(low.ball,{x:60,y:520,vx:0,vy:0});t=0;while(!P.unstick(low,1/30)&&t<5)t+=1/30;assert(t<=2.5);assert(low.ball.vy<0&&low.ball.vx>0,'up and toward the middle');
 // A cradle on a raised flipper is the player's choice.
 const cr=P.createPinballState();cr.phase='playing';cr.left=1;Object.assign(cr.ball,{x:120,y:525,vx:0,vy:0});P.unstick(cr,6);assert.equal(cr.unstuck,0);
 // Wedged and jittering: speed above the stall line, going nowhere.
 const j=P.createPinballState();j.phase='playing';Object.assign(j.ball,{x:200,y:250,vx:0,vy:0});t=0;let kicked=false;
 for(let i=0;i<120&&!kicked;i++){j.ball.x=200+(i%2?3:-3);j.ball.vx=i%2?180:-180;j.ball.vy=0;kicked=P.unstick(j,1/30);t+=1/30;}assert(kicked,'the trap clock kicks a jittering ball');assert(t<=2.7,'in about 2.5 s: '+t.toFixed(2));
 // A ball that really travels is never kicked.
 const mv=P.createPinballState();mv.phase='playing';for(let i=0;i<200;i++){mv.ball.x=60+i;mv.ball.y=300;mv.ball.vx=60;mv.ball.vy=0;P.unstick(mv,1/30);}assert.equal(mv.unstuck,0);
 // Lane, scoop, a defender's feet, not playing: left alone (each is timed elsewhere).
 for(const fix of [q=>Object.assign(q.ball,{x:354,y:585}),q=>{q.table.hold=.5;},q=>{q.possession=0;},q=>{q.phase='ready';}]){const q=P.createPinballState();q.phase='playing';Object.assign(q.ball,{x:120,y:300,vx:0,vy:0});fix(q);P.unstick(q,6);assert.equal(q.unstuck,0);}
 // Designed stops: the scoop under a second, the goal beat 1.5 s and skippable by Launch in its last part, the lost beat 1 s.
 assert(TB.DUGOUT_HOLD<=.9);const g=active(180,49,0,-400);advance(g,.05);assert.equal(g.phase,'goal');assert.equal(P.skipPinballBeat(g),false,'the first part of the goal beat always plays');
 advance(g,.95);assert.equal(g.phase,'goal');assert.equal(P.skipPinballBeat(g),true);advance(g,.02);assert.equal(g.phase,'ready','Launch ends the beat about a second in');assert.equal(P.skipPinballBeat(g),false);
 P.stepPinball(g,{left:true,right:false,charge:false},1/60);assert(g.left>0,'flippers move in every phase');
 const run=read('lib/arcade/games/pinballGame.ts');assert.match(run,/else if\(id===2&&skipPinballBeat\(pinball\)\)/);
 // The frame loop is awake in every phase but the waiting plunger and the finished run, so it cannot sleep with a ball in play.
 assert.match(run,/needsFrames:\(\)=>cinema>0\|\|stage\.effectsActive\(\)\|\|\(\(\(\(!!pinballCam\?\.moving\(\)\|\|pinball\.phase!=='ready'&&pinball\.phase!=='over'\|\|/);
});

await ok('extra balls at level and score milestones, capped',()=>{
 assert.equal(E.PINBALL_MAX_BALLS,5);assert.deepEqual([1,2,3,4,5,6,7].map(E.pinballLevelGivesBall),[false,false,true,false,true,false,true]);
 const marks=[0,1,2,3,4,5,6].map(E.pinballExtraBallScore);assert.deepEqual(marks,[75000,200000,400000,700000,1000000,1500000,2000000]);marks.forEach((m,i)=>i&&assert(m>marks[i-1]));
 // Level milestone: the whistle into level 3 brings a ball, the one into level 2 does not.
 const s=active(120,300);toWhistle(s);P.stepPinball(s,idle,1/60);assert.equal(s.balls,3);toWhistle(s);P.stepPinball(s,idle,1/60);assert.equal(s.match,3);assert.equal(s.balls,4);assert.equal(s.ballsWon,1);
 // Score milestone.
 const k=active(120,300);k.score=74990;P.stepPinball(k,idle,1/60);assert.equal(k.balls,3);k.score=75000;P.stepPinball(k,idle,1/60);assert.equal(k.balls,4);assert.equal(k.cue,'extraBall');assert.equal(k.extraBalls,1);
 P.stepPinball(k,idle,1/60);assert.equal(k.balls,4,'once per mark');assert.match(F.pinballTableMessage(k),/^EXTRA BALL! 4 in hand/);assert.equal(SP.scoreCall(F.pinballTableMessage(k)).kind,'mode');
 // The cap: a full hand wins nothing and the mark is spent.
 k.balls=5;k.score=200000;P.stepPinball(k,idle,1/60);assert.equal(k.balls,5);assert.equal(k.extraBalls,2);k.balls=2;P.stepPinball(k,idle,1/60);assert.equal(k.balls,2,'not banked');
 const far=active(120,300);far.score=5_000_000;P.stepPinball(far,idle,1/60);assert.equal(far.balls,5,'never more than five in hand');
 // Elite tiers: the marks scale with the points multiplier.
 const d=P.beginPinballRun(P.createPinballState(),{tier:1});P.launchPinball(d);d.score=75000;P.stepPinball(d,idle,1/60);assert.equal(d.ballsWon,0);d.score=150000;P.stepPinball(d,idle,1/60);assert.equal(d.ballsWon,1);
 // A finished run wins nothing.
 const o=active(120,300);o.phase='over';o.balls=0;o.score=80000;P.stepPinball(o,idle,1/60);assert.equal(o.balls,0);
});

await ok('boards: the same three boards, raised ceilings, the same rates, the owner SQL',()=>{
 assert.deepEqual([0,1,2].map(T.pinballBoardFor),['pinball','pinderby','pinfinal']);for(const g of ['pinball','pinderby','pinfinal'])assert(L.isBoardGame(g));
 assert.deepEqual(L.BOARD_TIER_TABS.pinball,['pinderby','pinfinal']);assert.match(read('lib/games/soccerPinballTiers.ts'),/const KEY='fi2-pinball-tiers-v1';/,'the tier record key is unchanged');
 const R=L.BOARD_RULES;assert.deepEqual([R.pinball.max,R.pinderby.max,R.pinfinal.max],[3_000_000,6_000_000,9_000_000]);
 assert.deepEqual([R.pinball.perSecond,R.pinderby.perSecond,R.pinfinal.perSecond],[1200,2700,4400],'the scoring rates (the real guard) are unchanged');
 assert.deepEqual([R.pinball.base,R.pinderby.base,R.pinfinal.base,R.pinball.minSeconds],[3000,6000,9000,20]);
 for(const g of ['pinball','pinderby','pinfinal']){const r=R[g];
  assert.equal(L.scorePlausible(g,r.max,10*60_000),'fast',g+': the ceiling posted after ten minutes is refused');
  assert((r.max-r.base)/r.perSecond>=30*60,g+': the ceiling needs at least half an hour of session at the full rate');
  assert((r.max-r.base)/r.perSecond*1000<L.SESSION_MAX_MS,g+': and is reachable inside one play session');
  assert.equal(L.scoreInBounds(g,r.max),true);assert.equal(L.scoreInBounds(g,r.max+1),false);assert.equal(L.scoreInBounds(g,400_001),true,'past the old ceiling');}
 // A strong bot run is far inside the rate and the ceiling.
 const r=bot(23,900);assert(r.s.score/r.t<R.pinball.perSecond*.6,'bot pace '+Math.round(r.s.score/r.t)+'/s');assert.equal(L.scorePlausible('pinball',r.s.score,Math.max(20,r.t)*1000),'ok');assert(r.s.score<R.pinball.max);
 assert.equal(L.scorePlausible('pinball',1_200_000,40*60_000),'ok','a 40-minute run of 1.2M posts');
 // The SQL for the owner: wider score check, every board id, nothing destructive, a self-check row.
 const sql=read('docs/arcade-aaa/endless-supabase.sql'),code=sql.replace(/--.*$/gm,'');
 const cap=Number(/score between 1 and (\d+)/.exec(code)[1]);assert.equal(cap,Math.max(...L.BOARD_GAMES.map(g=>R[g].max)),'SQL ceiling = the highest board ceiling');
 const list=/check \(game in \(([^)]*)\)\)/.exec(code)[1].split(',').map(v=>v.trim().replace(/'/g,''));assert.deepEqual(list,[...L.BOARD_GAMES],'the allow-list names every current board, in order');
 assert(list.includes('kitrush')&&list.includes('kitdaily'));
 assert(!/\btruncate\b|\bdelete\b|\bupdate\b|\brename\b|drop (table|column|function)|alter column/i.test(code.replace(/\$ingest\$[\s\S]*?\$ingest\$/,'')/* Nov 10 2026 (Squad Snake): section 3 re-states analytics_ingest, whose own body upserts analytics rows; it is the migrations' function, checked by tests/admin-analytics-coverage.cjs */),'no row, column or board is removed, renamed or reset');
 assert.match(code,/drop constraint if exists arcade_scores_game_check/);assert.match(sql,/'OK, endless pinball ceiling installed'/);assert.match(sql.trim().split('\n').slice(-1)[0],/\) as missing\) x;$/,'ends with the self-check select');
 assert.equal(Number(/score between 1 and (\d+)/.exec(read('supabase/migrations/20261013_arcade_leaderboards.sql'))[1]),400000,'the applied migration is not edited');
});

await ok('the level on the status tab, the full-time burst, the taught pattern in rotation',()=>{
 assert.equal(E.pinballLevelLabel(1),'LV 1');assert.equal(E.pinballLevelLabel(12),'LV 12');
 const run=read('lib/arcade/games/pinballGame.ts');assert.match(run,/ · \$\{pinballLevelLabel\(pinball\.match\)\}`,message:overShow\(\)\?'GAME OVER · '\+pinball\.score:/,'the detail line ends with the level');
 const panel=read('components/games/PinballScorePanel.tsx');assert.match(panel,/const level=\/ · \(LV \\d\+\)\$\/\.exec\(hud\.detail\?\?''\)\?\.\[1\]\?\?'';/);assert.match(panel,/\{level&&<span data-pb-level>\{level\}<\/span>\}/);
 assert.match(panel,/Array\.from\(\{length:Math\.max\(3,Math\.min\(5,view\.balls\)\)\}/,'extra balls show as more discs, three at least');
 assert.match(read('components/games/skins/pinball.module.css'),/\.skin \[data-pinball-dmd\] \[data-pb-level\]\{[^}]*background:var\(--cm-sun\)/);
 const s=active(120,300);s.matchGoals=2;toWhistle(s);P.stepPinball(s,idle,1/60);const line=F.pinballTableMessage(s);
 assert.equal(line,'FULL TIME! +1700 · LEVEL 2 kicks off. This match: the rebound. Follow your shot in.');assert.equal(s.fullTimeBonus,3*P.PINBALL_FULLTIME_BALL+2*E.PINBALL_FULLTIME_GOAL);
 assert.deepEqual(SP.scoreCall(line),{kind:'mode',title:'FULL TIME!',sub:'LEVEL 2 · +1700',life:2.4},'the whistle is a burst inside the run');
 assert.equal(SP.scoreCall('GAME OVER · 1910').kind,'over');
 // Teaching: all three patterns take a turn, and a new match names the 2v1 again.
 assert.deepEqual([1,2,3,4].map(PT.pinballMatchFocusKind),['wallPass','rebound','twoVOne','wallPass']);for(const m of [1,2,3])assert(PT.pinballMatchFocus(m).length>20);
 const w=PT.createPinballPatternWatch(),p=P.createPinballState();p.stats.mbStarts=3;PT.watchPinballPatterns(w,p,5);p.stats.mbStarts=4;assert.equal(PT.watchPinballPatterns(w,p,5),false,'the fourth breakaway of a match is not named');
 p.match=2;PT.watchPinballPatterns(w,p,5);p.stats.mbStarts=5;assert.equal(PT.watchPinballPatterns(w,p,5),true);assert.equal(w.kind,'twoVOne','named again in the new match');
 const feel=read('lib/games/soccerPinballFeel.ts');assert.match(feel,/case 'halfTime':return "HALF TIME · 45'\. Keep switching feet!";/,'the coaching lines stay');assert.match(feel,/case 'extraBall':ring\(f,180,300,1\.4\);popup\(f,180,300,'EXTRA BALL!','lit'\);break;/);
});

console.log(failed?`FAILED ${failed}`:'PASS pinball endless: last-ball-only ending, ramp table, kick-out, extra balls, board caps + SQL, level readout');process.exit(failed?1:0);
})();
