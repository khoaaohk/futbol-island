// Breakaway Run endless play, Nov 10 2026 (owner: "We need to make it that the user can play as long as they want to increase their
// score. All these games should also increase in difficulty the further they play."). Run: node tests/runner-endless.cjs
//  1. a run ends ONLY when the hearts run out: the goal line clears a round, banks a bonus and the same run carries on
//  2. round 1 of every route is the route as it was (literal table), and applying the round-1 row changes nothing
//  3. the ramp table: every parameter moves one way, the sim really uses each, the fairness ceiling and the open lane hold
//  4. hearts back at round clears, capped; heart refills get scarcer
//  5. the Daily Run's seed gives the same rounds to everyone that day
//  6. boards: same mapping, same ids and storage keys, raised ceilings, unchanged rates, inside the owner's SQL ceiling
//  7. seeded bots: three rounds and more on every route, no forced over, no dead time, bounded objects, missions keep counting
//  8. the round on the margin strip, the round sky, the rotating lesson, the skippable strike beat
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {ROOT,createLoader}=require('./summit-harness.cjs');const {botRun}=require('./runner-endless-bot.cjs');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const store=new Map();globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const load=createLoader();
const R=load('lib/arcade/runnerGame.ts'),Mo=load('lib/arcade/runnerModes.ts'),E=load('lib/arcade/runnerEndless.ts'),L=load('lib/arcade/leaderboard.ts'),H=load('lib/arcade/runnerHud.ts'),
 M=load('lib/arcade/runnerMissions.ts'),Route=load('components/games/runnerRoute.ts'),Res=load('lib/arcade/results/runnerResult.ts');
const game=(mode,extra={})=>{Mo.selectRunnerMode(mode);const s=R.createRunnerGame({seed:61});Object.assign(s,extra);return s;};
const run=(s,sec,hz=60,each)=>{for(let i=0;i<sec*hz;i++){each?.(s,i);R.tickRunner(s,1/hz);R.runnerOutro(s,1/hz);}};
const tackle=s=>{for(let n=0;n<40&&s.lives>0;n++){const lives=s.lives;s.boost=0;s.shield=false;s.hurt=0;s.spawn=99;s.objects=[{kind:'defender',role:'tackler',lane:s.lane,z:-1.2,passed:false,openLane:0,read:1,aim:s.lane,tackle:.2}];run(s,.3);if(s.lives<lives)return;}};
/** Run up the final hill and beat the goal-line keeper (or the open Warm-up goal). */
const scoreFinal=s=>{s.distance=s.finish-205;s.spawn=99;let shot=false;const step=g=>{const o=g.objects.find(o=>o.kind==='goal'&&o.final&&!o.passed);if(!o||shot)return;
 if(!o.keeper){g.lane=0;if(o.z>-20&&o.z<-10&&Math.abs(g.x)<.5){R.runnerShoot(g);shot=true;}return;}
 if(o.z>-20&&o.z<-10&&Math.abs((o.kx??0)-g.x)>2.4){R.runnerShoot(g);shot=true;}else if(o.z>-22)g.lane=(o.kx??0)>0?-1:1;};
 for(let i=0;i<60*20&&!s.clears;i++){step(s);R.tickRunner(s,1/60);}};
const MODES=['warmup','classic','night','storm','cup','legend','daily'];
/** The seven routes as they were before endless play (lib/arcade/runnerModes.ts on Nov 10 2026): round 1 must play exactly these. */
const TODAY={
 warmup:{lives:5,maxLives:5,refill:1,pace:.86,gap:1.14,startLevel:1,moving:0,combos:false,doubleJump:false,hazards:false,finish:900,bossKeeper:false,sky:'arcade',board:'runwarm'},
 classic:{lives:3,maxLives:3,refill:3,pace:1,gap:1,startLevel:1,moving:0,combos:false,doubleJump:false,hazards:false,finish:0,bossKeeper:false,sky:'arcade',board:'runner'},
 night:{lives:3,maxLives:3,refill:3,pace:1.1,gap:.88,startLevel:3,moving:.5,combos:false,doubleJump:true,hazards:true,finish:1500,bossKeeper:true,sky:'night',board:'runnight'},
 storm:{lives:3,maxLives:3,refill:4,pace:1.16,gap:.82,startLevel:4,moving:.8,combos:true,doubleJump:true,hazards:true,finish:1800,bossKeeper:true,sky:'storm',board:'runstorm'},
 cup:{lives:3,maxLives:3,refill:5,pace:1.2,gap:.78,startLevel:5,moving:.9,combos:true,doubleJump:true,hazards:true,finish:2400,bossKeeper:true,sky:'final',board:'cupfinal'},
 legend:{lives:2,maxLives:2,refill:5,pace:1.26,gap:.76,startLevel:6,moving:1,combos:true,doubleJump:true,hazards:true,finish:0,bossKeeper:false,sky:'legend',board:'legend'},
 daily:{lives:3,maxLives:3,refill:3,pace:1.04,gap:.94,startLevel:2,moving:.3,combos:false,doubleJump:true,hazards:true,finish:1200,bossKeeper:true,sky:'arcade',board:'rundaily'},
};

ok('a run ends only when the hearts run out: the goal line clears the round and the same run carries on',()=>{
 for(const mode of ['night','warmup']){const s=game(mode),lap=Mo.RUNNER_MODES[mode].finish;scoreFinal(s);
  assert.equal(s.clears,1,mode+': the goal line is a round clear');assert.equal(s.round,2);assert.equal(s.lineGoals,1);assert.equal(s.lives,TODAY[mode].lives,'the clear costs no heart');
  assert(!s.finished&&!R.runnerOver(s)&&s.outro===0,mode+': no full time, no outro');assert.equal(s.finishPhase,'','a fresh goal line ahead');assert.equal(s.finish,2*lap,'one route length on');assert.equal(s.lastFinish,lap);
  assert.equal(s.roundBonus,E.RUNNER_RAMP[0].bonus*(TODAY[mode].bossKeeper?E.RUNNER_KEEPER_BONUS:1),'the round bonus banks');assert.match(s.message,/ROUND 1 CLEAR! \+\d+ · ROUND 2, /);
  // The road goes on: the clock, the distance and the score keep running and every input answers at once.
  const score=s.score,d=s.distance,t=s.time;R.runnerJump(s);assert(s.jumping,'no input lock at the seam');run(s,4);assert(s.time>t+3.9&&s.distance>d+40&&s.score>=score,'the run carries on past the goal line');
  assert(Number.isFinite(s.nextGoal)&&s.nextGoal>d+100&&(s.nextGoal-90)%180===0,'goals come back, on the gentle segments');
  // Past the finish with hearts left: minutes later the run is still live.
  s.lives=1e6;run(s,60,30);assert(!R.runnerOver(s)&&s.distance>lap+600,mode+': still running a minute past the goal line');
  s.lives=1;tackle(s);assert.equal(s.lives,0);assert(!R.runnerOver(s),'full time waits for the outro beat');run(s,R.RUNNER_OUTRO+.2);assert(R.runnerOver(s),'the last heart ends the run');
  assert(s.finished&&s.won,'at full time the run reads as one that reached and won a goal line (stars, the card header)');assert.equal(Mo.runnerRunStars(s)[0],true);}
 // Three keeper saves: the round still clears (no keeper bonus), no heart is lost, three fresh tries next time.
 const miss=game('storm');miss.distance=miss.finish-205;for(let i=0;i<30*60&&!miss.clears;i++){miss.balls=0;miss.spawn=9;R.tickRunner(miss,1/30);}assert.equal(miss.clears,1);assert.equal(miss.lineGoals,0);assert.equal(miss.lives,3);assert.equal(miss.bossTries,0);assert.equal(miss.roundBonus,E.RUNNER_RAMP[0].bonus);assert(!R.runnerOver(miss));
 // Routes that never had a goal line: a round every RUNNER_OPEN_ROUND metres, nothing stops.
 for(const mode of ['classic','legend']){const s=game(mode,{lives:1e6});run(s,150,30);assert(s.distance>2*E.RUNNER_OPEN_ROUND&&s.round===1+Math.floor(s.distance/E.RUNNER_OPEN_ROUND),mode+': rounds by distance');assert(!R.runnerOver(s)&&!s.finished&&s.finish===0);}
 const src=read('lib/arcade/runnerGame.ts');assert(!/s\.finished=true/.test(src),'nothing but the last heart sets full time');assert(/if\(s\.lives<=0\)\{s\.outro=RUNNER_OUTRO;[^}]*s\.finished=s\.clears>0;s\.won=s\.lineGoals>0;\}/.test(src));
});

ok('round 1 of every route is the route as it was',()=>{
 assert.deepEqual(E.RUNNER_RAMP[0],{round:1,speed:1,gap:1,moving:0,telegraph:1,pickups:1,keeper:1,blockers:0,refill:0,rollers:false,combos:false,bonus:1000});
 for(const mode of MODES){const m=Mo.RUNNER_MODES[mode],want=TODAY[mode];for(const k of Object.keys(want))assert.deepEqual(m[k],want[k],`${mode}.${k} is today's value`);
  const s=game(mode);assert.deepEqual({lives:s.lives,maxLives:s.maxLives,refill:s.refillGoals,pace:s.paceMul,gap:s.gapMul,startLevel:s.level,moving:s.moving,combos:s.combos,doubleJump:s.doubleJump,hazards:s.hazards,finish:s.finish,bossKeeper:s.bossKeeper,sky:s.sky,board:Mo.runnerBoardFor(mode)},want,mode+': a new run starts on today\'s numbers');
  assert.deepEqual([s.round,s.rampSpeed,s.telegraph,s.pickups,s.keeperPace,s.blockers,s.lap],[1,1,1,1,1,0,want.finish]);
  const before=JSON.stringify(s);R.applyRunnerRound(s);assert.equal(JSON.stringify(s),before,mode+': the round-1 row changes nothing');}
 // The same seed plays the same first round with the ramp code in place: pace, spacing and the first patterns of the classic run.
 const a=game('classic',{lives:1e6}),lanes=[];for(let i=0;i<8;i++){a.spawn=0;a.objects=[];R.tickRunner(a,1/60);lanes.push(a.readLane);}assert.deepEqual(lanes.slice(0,6),[...R.RUNNER_WAVE_LANES],'classic keeps its authored lane order');
 const b=game('classic');R.tickRunner(b,1/60);assert(Math.abs(b.speed-R.runnerPace(b.distance))<.05,'round 1 runs at the old pace');
 // The route itself: the first lap of a goal-line route has the same hills as before (lap only repeats the final hill further on).
 for(const mode of ['warmup','night','storm','cup','daily']){Mo.applyRunnerRoute(mode);const p=Route.routeProfile(),h=[];for(let d=0;d<=p.finish;d+=30)h.push(Route.routeHeight(d));
  Route.setRouteProfile({...p,lap:0});const old=[];for(let d=0;d<=p.finish;d+=30)old.push(Route.routeHeight(d));assert.deepEqual(h,old,mode+': the first lap\'s hills are unchanged');
  Route.setRouteProfile(p);for(let k=1;k<=3;k++){const end=p.finish*k;assert(Math.abs(Route.routeGrade(end))<1e-9,mode+`: goal line ${k} is flat`);assert(Route.routeHeight(end-60)>Route.routeHeight(end-240),mode+`: a final hill before goal line ${k}`);}}
});

ok('the ramp: every parameter moves one way, and the sim uses each',()=>{
 const up=['speed','moving','blockers','refill','bonus'],down=['gap','telegraph','pickups','keeper'];
 for(let i=1;i<E.RUNNER_RAMP.length;i++){const a=E.RUNNER_RAMP[i-1],b=E.RUNNER_RAMP[i];assert.equal(b.round,i+1);for(const k of up)assert(b[k]>=a[k],`${k} never falls (round ${b.round})`);for(const k of down)assert(b[k]<=a[k],`${k} never rises (round ${b.round})`);
  assert(b.rollers>=a.rollers&&b.combos>=a.combos,'a hazard never turns off');assert(b.speed-a.speed<=.03&&a.gap-b.gap<=.04,'smooth steps');}
 const top=E.RUNNER_RAMP[E.RUNNER_RAMP_TOP-1];assert(E.RUNNER_RAMP_TOP>=8&&top.speed>1&&top.gap<1&&top.telegraph<1&&top.pickups<1&&top.keeper<1&&top.blockers>0&&top.refill>0,'every parameter has moved by the top row');
 assert.equal(E.runnerRamp(0),E.RUNNER_RAMP[0]);assert.equal(E.runnerRamp(NaN),E.RUNNER_RAMP[0]);assert.equal(E.runnerRamp(3.9),E.RUNNER_RAMP[2]);assert.equal(E.runnerRamp(999),top,'past the table plays the last row');
 for(const mode of MODES)for(let r=1;r<=12;r++){const s=game(mode);s.round=r;R.applyRunnerRound(s);const m=Mo.RUNNER_MODES[mode],row=E.runnerRamp(r);
  assert(s.gapMul>=E.RUNNER_GAP_FLOOR&&s.gapMul<=m.gap,'spacing tightens, never under the floor');assert.equal(s.rampSpeed,row.speed);assert(s.moving<=1&&s.moving>=m.moving);assert.equal(s.refillGoals,m.refill+row.refill);
  assert.equal(s.hazards,m.hazards||row.rollers);assert.equal(s.combos,m.combos||row.combos);assert(s.doubleJump||!(s.hazards||s.combos),'rollers and gauntlets always come with the double jump');assert.equal(s.blockers,m.finish?row.blockers:0);}
 // Speed: the cruise rises, the measured fairness ceiling does not.
 const a=game('classic'),b=game('classic');b.round=10;R.applyRunnerRound(b);R.tickRunner(a,1/60);R.tickRunner(b,1/60);assert(Math.abs(b.speed/a.speed-top.speed)<1e-6,'round 10 cruises faster');
 const c=game('legend',{distance:3000,boost:9,burst:9});c.round=10;c.roundMark=1e9;R.applyRunnerRound(c);let fast=0;for(let i=0;i<600;i++){c.boost=9;c.burst=9;c.objects=[];c.spawn=9;R.tickRunner(c,1/60);fast=Math.max(fast,c.speed/(R.runnerTopSpeed(c.distance)*1.1));}assert(fast<=1+1e-9,'boost + burst + a descent never pass the old top speed');
 // Telegraph: a drifting defender sets later.
 const set=t=>{const s=game('night',{spawn:99,nextGoal:1e6});s.telegraph=t;s.objects=[{kind:'defender',role:'jockey',lane:0,z:-40,passed:false,openLane:0,drift:1,driftEnd:1,driftClock:0}];let at=0;for(let i=0;i<300&&!at;i++){R.tickRunner(s,1/120);if(s.objects[0].drift===undefined)at=s.objects[0].z;}return at;};
 assert(Math.abs(set(1)+26)<.4,'round 1: set 26 m out');assert(Math.abs(set(top.telegraph)+26*top.telegraph)<.4,'top row: set closer in');
 // Pick-ups: shorter trails (never under one football), fewer magnets.
 assert.equal(E.runnerTrailBalls(3,1),3);assert.equal(E.runnerTrailBalls(2,1),2);assert(E.runnerTrailBalls(3,top.pickups)<3&&E.runnerTrailBalls(2,top.pickups)>=1);for(let n=1;n<=3;n++)for(const row of E.RUNNER_RAMP)assert(E.runnerTrailBalls(n,row.pickups)>=1&&E.runnerTrailBalls(n,row.pickups)<=n);
 const balls=p=>{const s=game('classic',{lives:1e6});s.pickups=p;let n=0,m=0;for(let i=0;i<60;i++){s.spawn=0;s.objects=[];s.pickups=p;R.tickRunner(s,1/60);n+=s.objects.filter(o=>o.kind==='coin'&&!o.link).length;m+=s.objects.filter(o=>o.kind==='magnet').length;}return[n,m];};
 const [n1,m1]=balls(1),[n2,m2]=balls(top.pickups);assert(n2<n1&&m2<=m1,`fewer footballs (${n2} < ${n1}) and no more magnets (${m2} <= ${m1})`);
 // The goal-line keeper sways quicker; blockers stand on the final hill with a lane open.
 const src=read('lib/arcade/runnerGame.ts');assert(/RUNNER_BOSS_KEEPER\.period\*s\.keeperPace/.test(src));
 const s=game('night',{lives:1e6});s.round=5;R.applyRunnerRound(s);s.distance=s.finish-140;run(s,1.2,60,g=>{g.spawn=9;});const block=s.objects.filter(o=>o.kind==='defender'&&!o.passed);
 assert.equal(block.length,E.runnerRamp(5).blockers,'two defenders on the final hill in round 5');assert(new Set(block.map(o=>o.lane)).size<3&&block.every(o=>o.openLane!==o.lane),'one lane stays open');
 const first=game('night',{lives:1e6});first.distance=first.finish-140;run(first,1.2,60,g=>{g.spawn=9;});assert.equal(first.objects.filter(o=>o.kind==='defender').length,0,'round 1: the final hill is clear, as before');
});

ok('hearts come back at round clears, capped; refills get scarcer',()=>{
 const s=game('night');s.lives=1;s.hits=2;scoreFinal(s);assert.equal(s.clears,1);assert(s.lives>=2,'a heart back for the round');assert(s.heartsBack>=1);assert.equal(s.cleanClears,0,'not a clean round');
 const full=game('night');scoreFinal(full);assert.equal(full.lives,full.maxLives,'never above the route cap');assert.equal(full.cleanClears,1);assert.deepEqual(Mo.runnerRunStars({...full,finished:true,won:true}),[true,true,true],'the keep-every-heart star is earned at the clear');
 assert.deepEqual(Mo.runnerRunStars({mode:'night',finished:true,won:true,goals:1,level:6,hits:2,lives:0,cleanClears:0}),[true,true,false]);assert.deepEqual(Mo.runnerRunStars({mode:'night',finished:true,won:true,goals:1,level:6,hits:0,lives:3}),[true,true,true],'old result shapes still read');
 for(const mode of ['classic','legend']){const o=game(mode,{lives:1});o.distance=E.RUNNER_OPEN_ROUND-1;run(o,.5,60,g=>{g.spawn=9;});assert.equal(o.round,2);assert.equal(o.lives,2,mode+': a heart back at the mark');const cap=game(mode);cap.distance=E.RUNNER_OPEN_ROUND-1;run(cap,.5,60,g=>{g.spawn=9;});assert.equal(cap.lives,cap.maxLives);}
 assert.equal(E.RUNNER_ROUND_HEARTS,1);assert(game('legend').maxLives===2&&game('warmup').maxLives===5,'the caps are the routes\' own');
 const w=game('warmup');w.round=6;R.applyRunnerRound(w);assert(w.refillGoals>Mo.RUNNER_MODES.warmup.refill,'later rounds need more goals per heart');
});

ok('the Daily Run: the same rounds for everyone that day, endless',()=>{
 const sig=(t,botSeed)=>{Mo.setRunnerDailyClock(()=>t);const out=[];let wave=-1;
  Mo.selectRunnerMode('daily');const s=R.createRunnerGame();assert.equal(s.seed,Mo.runnerDailySeed(s.day));
  // Two different players (different inputs), endless hearts: what the course PLACES per wave is the same for both.
  for(let i=0;i<30*400&&s.round<4;i++){s.lives=9;if(botSeed&&i%botSeed===0)s.lane=[-1,0,1][(i/botSeed)%3];R.tickRunner(s,1/30);
   if(s.wave!==wave){wave=s.wave;out.push(`${s.round}:${s.wave}:${s.readLane}:${s.pattern}`);}}
  assert(s.round>=4,'three rounds cleared');return{text:out.join('|'),profile:Route.routeProfile().salt,seed:s.seed};};
 const noon=Date.parse('2026-11-10T12:00:00'),a=sig(noon,0),b=sig(noon+3*3600_000,0),next=sig(noon+86_400_000,0);
 assert.equal(a.text,b.text,'same day: identical rounds');assert.equal(a.profile,b.profile,'same hills');assert.notEqual(a.text,next.text,'tomorrow: a different course');assert(/^1:.*\|2:.*\|3:/.test(a.text),'the sequence runs through rounds 1, 2 and 3');
 // The lane and pattern of a given wave number come from the day's seed alone (a second player with other inputs gets the same).
 const pick=t=>new Map(t.split('|').map(x=>{const [r,w,l]=x.split(':');return[w,l];})),p1=pick(a.text),p2=pick(sig(noon,37).text);let same=0,both=0;for(const [w,l] of p1)if(p2.has(w)){both++;if(p2.get(w)===l)same++;}
 assert(both>20&&same===both,'every wave opens the same lane for every player that day');
 Mo.setRunnerDailyClock(null);
});

ok('boards: same mapping, same ids and keys, raised ceilings, unchanged rates',()=>{
 const want={warmup:'runwarm',classic:'runner',night:'runnight',storm:'runstorm',cup:'cupfinal',legend:'legend',daily:'rundaily'};
 for(const [id,b] of Object.entries(want)){assert.equal(Mo.runnerBoardFor(id),b);assert.equal(Mo.RUNNER_MODES[id].board,b);assert(L.isBoardGame(b));
  const s=game(id);s.score=1_234_567;s.round=9;assert.equal(Res.runnerResult(s).board,b,id+': an endless run posts to the route\'s own board');assert.equal(Res.runnerResult(s).score,1_234_567);}
 assert.deepEqual([...L.BOARD_TIER_TABS.runner],['runwarm','runnight','runstorm','cupfinal','legend','rundaily'],'one board per route, no new ones');
 const modes=read('lib/arcade/runnerModes.ts');assert(/const DAILY_KEY='fi2-runner-daily-v1'/.test(modes)&&/const KEY='fi2-runner-routes-v1'/.test(modes),'storage keys unchanged');
 const sqlCap=Number(/score between 1 and (\d+)/.exec(read('docs/arcade-aaa/endless-supabase.sql'))[1]);assert.equal(sqlCap,9_000_000);
 for(const b of Object.values(want)){const r=L.BOARD_RULES[b],elite=b==='cupfinal'||b==='legend';assert.equal(r.max,E.RUNNER_SCORE_MAX,b+' ceiling');assert(r.max<=sqlCap,b+' fits the table');
  assert.deepEqual([r.base,r.perSecond,r.minSeconds],[3000,elite?1800:1500,12],b+': the rate check is unchanged');
  assert(L.scoreInBounds(b,1_000_000)&&!L.scoreInBounds(b,E.RUNNER_SCORE_MAX+1));assert.equal(L.scorePlausible(b,1_000_000,60_000),'fast','a typed-in million still fails the rate');assert.equal(L.scorePlausible(b,1_000_000,45*60_000),'ok');}
 assert.equal(L.SESSION_MAX_MS,3*60*60_000);assert(E.RUNNER_SCORE_MAX>=460*L.SESSION_MAX_MS/1000,'a perfect bot\'s rate for the whole session fits');
 // Device bests accept a long run (they used to clamp at 400000) and old saves still read.
 Mo.resetRunnerRoutes();store.clear();assert.equal(Mo.saveRunnerTierBest('cup',1_200_000),true);assert.equal(Mo.runnerTierBest('cup'),1_200_000);Mo.resetRunnerRoutes();assert.equal(Mo.runnerTierBest('cup'),1_200_000,'and it survives a reload');
 store.set('fi2-runner-routes-v1',JSON.stringify({v:1,mode:'cup',stars:{cup:2},played:4,best:{cup:90_000}}));Mo.resetRunnerRoutes();assert.equal(Mo.runnerTierBest('cup'),90_000,'an old save keeps its best');assert.equal(Mo.readRunnerRoutes().stars.cup,2);
 Mo.setRunnerDailyClock(()=>Date.parse('2026-11-10T12:00:00'));assert.equal(Mo.claimRunnerDailyRun('2026-11-10',700_000),true);assert.equal(Mo.readRunnerDaily('2026-11-10').best,700_000);Mo.setRunnerDailyClock(null);Mo.resetRunnerRoutes();store.clear();
});

ok('seeded bots: three rounds and more on every route, no forced over, no dead time at the seam',()=>{
 for(const mode of MODES){M.resetRunnerProgress?.();let lastScore=0,most=0,graceWave=-1,graceUntil=-1,lastRound=1,forced=0,stall=0,maxStall=0,lastD=0;
  const r=botRun(R,Mo,mode,{seed:211,lapse:0,maxSeconds:420,each:(s,t)=>{s.lives=Math.max(s.lives,2);M.tickRunnerMissions(s);
   assert(s.score>=lastScore,mode+': the score never drops');lastScore=s.score;most=Math.max(most,s.objects.length);
   if(R.runnerOver(s)||s.finished||s.outro>0)forced++;
   if(s.round!==lastRound){lastRound=s.round;graceWave=s.wave;graceUntil=s.time+E.RUNNER_ROUND_GRACE-.05;}
   if(s.time<graceUntil)assert.equal(s.wave,graceWave,mode+': no new line in the grace window of round '+s.round);
   // Dead time: the run must be moving every half second of play.
   if(s.distance-lastD<.05){stall++;maxStall=Math.max(maxStall,stall);}else stall=0;lastD=s.distance;}});
  assert(r.s.round>=4,`${mode}: three rounds cleared in seven minutes (reached round ${r.s.round})`);assert.equal(forced,0,mode+': never over, never an outro, while hearts remain');assert(!r.ended);
  assert(maxStall<=1,mode+': the run never stops');assert(most<40,`${mode}: bounded objects (${most})`);
  for(let i=1;i<r.rounds.length;i++)assert(r.rounds[i].score>r.rounds[i-1].score&&r.rounds[i].distance>r.rounds[i-1].distance);
  assert.equal(r.s.clears,r.s.round-1);assert(r.s.goals>=3,mode+': goals keep counting across rounds (missions read the same counters)');
  const rule=L.BOARD_RULES[Mo.runnerBoardFor(mode)];assert(r.s.score<=rule.base+rule.perSecond*r.t,mode+': an honest long run passes the rate check');assert(L.scoreInBounds(Mo.runnerBoardFor(mode),r.s.score));}
 // With real hearts the run ends when they run out, and only then.
 const real=botRun(R,Mo,'cup',{seed:5,lapse:.03,react:.35,nerve:.4,maxSeconds:3600});assert(real.ended&&real.s.lives<=0,'a child-like bot\'s run ends on its last heart');
 // The ramp bites: with endless hearts, a child-like bot is tackled more per kilometre in the late rounds than in the first three.
 let early=0,late=0,ek=0,lk=0;for(const mode of ['warmup','classic','night','daily'])for(let i=0;i<4;i++){let h=0,d=0,round=1;botRun(R,Mo,mode,{seed:300+i*17,lapse:.03,react:.35,nerve:.4,maxSeconds:700,each:s=>{s.lives=Math.max(s.lives,3);
  if(s.round!==round){if(round<=3){early+=s.hits-h;ek+=s.distance-d;}else if(round>=7){late+=s.hits-h;lk+=s.distance-d;}h=s.hits;d=s.distance;round=s.round;}}});}
 assert(ek>3000&&lk>3000&&late/lk>early/ek*1.3,`later rounds are harder (${(early/ek*1000).toFixed(2)} → ${(late/lk*1000).toFixed(2)} tackles per km)`);
});

ok('the round on the margin strip, the sky of the round, the rotating lesson, the skippable beat',()=>{
 const s=game('night');assert.equal(H.runnerHud(s).runnerStage,1);scoreFinal(s);const hud=H.runnerHud(s);assert.equal(hud.runnerStage,2);assert.equal(hud.runnerToGo,true);assert(hud.runnerMeters>1300,'metres to the NEXT goal line');assert.equal(hud.flash,'GOAL!');assert.equal(hud.over,false);
 assert(/runnerStage\?:number/.test(read('lib/arcade/arcadeGameTypes.ts')));
 const pad=read('components/games/RunnerControls.tsx');assert(/data-runner-round=\{hud\.runnerStage\}/.test(pad)&&/>Round \{hud\.runnerStage\}</.test(pad),'the margin strip shows the round');
 const css=read('components/games/RunnerControls.module.css');assert(/\.run i\{[^}]*font:800 11px\/1 system-ui/.test(css),'UI sans, weight 800 (no brush)');assert(/\.run i\[data-up\]\{animation:none\}|\.run em,\.run i\[data-up\]\{animation:none\}/.test(css),'reduced motion: no stamp');
 // Skies: the route's own in round 1, then golden hour → dusk → night → storm → red sun, round and round.
 assert.deepEqual([...E.RUNNER_SKY_ORDER],['arcade','final','night','storm','legend']);
 assert.deepEqual([1,2,3,4,5,6].map(r=>E.runnerRoundSky('arcade',r)),['arcade','final','night','storm','legend','arcade']);assert.deepEqual([1,2,3].map(r=>E.runnerRoundSky('storm',r)),['storm','legend','arcade']);
 for(const mode of MODES)assert.equal(game(mode).sky,Mo.RUNNER_MODES[mode].sky);assert.equal(s.sky,'storm','Night Derby round 2 runs into the storm front');
 const weather=read('lib/arcade/runnerWeather.ts');assert(/if\(s\.sky!==skyMode\)/.test(weather)&&/const storm=s\.sky==='storm'/.test(weather)&&/behind<8\?s\.lastFinish:s\.finish/.test(weather),'the dome eases to the round\'s sky; the cleared arch stays until it is behind');
 assert(!/new T\.(Mesh|[A-Za-z]*Geometry|[A-Za-z]*Material|CanvasTexture)\([^)]*\)[^\n]*s\.sky/.test(weather),'a sky change builds nothing');
 // The lesson rotates with the round, on the clear line.
 const lessons=new Set(Array.from({length:E.RUNNER_ROUND_LESSONS.length},(_,i)=>E.runnerRoundLesson(i+1)));assert.equal(lessons.size,E.RUNNER_ROUND_LESSONS.length);assert(E.RUNNER_ROUND_LESSONS.length>=6);
 assert.notEqual(E.runnerRoundLesson(2),E.runnerRoundLesson(3));assert.equal(E.runnerRoundLesson(1),E.runnerRoundLesson(1+E.RUNNER_ROUND_LESSONS.length));assert(s.message.includes(E.runnerRoundLesson(2)),'the clear line teaches the next round\'s lesson');
 assert.equal(E.runnerRoundLabel(3),'ROUND 3');
 const fx=read('lib/arcade/runnerFx.ts');assert(/if\(k&&k!=='duel'\)cinema\.skip\(\)/.test(fx),'any input skips the strike beat');assert(/kind==='round'\)pop\(`ROUND \$\{s\.round-1\} CLEAR!`/.test(fx)&&/`Round \$\{s\.round-1\} clear · \+\$\{s\.roundBonus\}`/.test(fx));
 assert(/m\.finish\} m rounds, endless/.test(read('components/games/RunnerMenu.tsx')),'the menu says the route is endless');
 // The full-time card line counts the rounds.
 s.lives=1;tackle(s);run(s,2);assert.match(H.runnerFinishLine(s),/Night Derby: BOSS KEEPER BEATEN! 1 round cleared/);
});

console.log(failed?`\n${failed} FAILED`:'\nrunner endless: lives-out only, round 1 unchanged, ramp, hearts, daily seed, boards and caps, bots OK');process.exit(failed?1:0);
