// Breakaway Run, arcade AAA pass (Nov 18 2026). Run: node tests/runner-aaa-nov18.cjs
// Found by playing: the bag is full three quarters of the time (footballs gave points and nothing else), the final hill was ten empty
// seconds, and the return ball (a danger cue) had no sound. This pins the fixes:
//  1. golden shot: trail footballs into a FULL bag fill the gold pips; link and ladder balls do not; the pips map 0..5
//  2. a golden shot is never blocked or returned, drives through a lane of defenders and beats a keeper; it pays what the same shot pays
//  3. ball ladder: a zig-zag on the final hill of every goal-line route, one lane per step, clear of every line, the same for a seed
//  4. the whole ladder pays a bonus and arms a golden shot; rungs do not build the power run; routes without a goal line have none
//  5. difficulty: a careful bot survives the opening, a run always ends, later rounds cost more hearts per minute than round 1
//  6. sound and HUD: the return ball, the armed golden shot and the full ladder each have a cue; the strip shows the gold pips
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {ROOT,createLoader}=require('./summit-harness.cjs');const {botRun}=require('./runner-endless-bot.cjs');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const store=new Map();globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const load=createLoader();
const R=load('lib/arcade/runnerGame.ts'),Mo=load('lib/arcade/runnerModes.ts'),H=load('lib/arcade/runnerHud.ts');
const game=(mode,extra={},seed=61)=>{Mo.selectRunnerMode(mode);const s=R.createRunnerGame({seed});Object.assign(s,extra);return s;};
const run=(s,sec,hz=60,each)=>{for(let i=0;i<sec*hz;i++){each?.(s,i);R.tickRunner(s,1/hz);R.runnerOutro(s,1/hz);}};
const coin=(s,extra={})=>{s.objects.push({kind:'coin',lane:s.lane,z:-.5,passed:false,openLane:0,...extra});run(s,.1);};
const quiet=s=>{s.spawn=99;s.nextGoal=Infinity;s.objects=[];};
const G=R.RUNNER_GOLDEN,L=R.RUNNER_LADDER;

ok('1. gold pips fill only from trail footballs into a full bag',()=>{
 const s=game('classic');quiet(s);s.balls=3;coin(s);coin(s);assert.equal(s.balls,5);assert.equal(s.gold,0,'filling the bag is not gold');
 coin(s,{link:true});coin(s,{ladder:1});assert.equal(s.gold,0,'link and ladder balls never count');
 for(let i=0;i<G.need-1;i++){quiet(s);coin(s);}assert.equal(s.gold,G.need-1);assert(!s.golden);assert.equal(R.runnerGoldPips(s),G.pips-1);
 quiet(s);coin(s);assert(s.golden,'the last pip arms the shot');assert.equal(s.gold,0);assert.equal(s.eventKind,'golden');assert.equal(R.runnerGoldPips(s),G.pips);
 quiet(s);coin(s);assert.equal(s.gold,0,'no pips while a golden shot is armed');
 const hud=H.runnerHud(s);assert.equal(hud.runnerGold,G.pips);assert.equal(hud.runnerGolden,true);
});
ok('2. a golden shot cannot be blocked, clears the lane and beats the keeper for the pay of a placed goal',()=>{
 const planted=()=>({kind:'defender',role:'wall',lane:0,z:-20,passed:false,openLane:0});
 let s=game('classic');quiet(s);s.objects=[planted()];assert(R.runnerShoot(s));run(s,.5);assert.equal(s.shots.some(p=>p.returner||p.returning)||s.eventKind==='block'||s.eventKind==='return',true,'a plain centred shot is blocked');
 s=game('classic');quiet(s);s.golden=true;s.objects=[planted(),{...planted(),z:-27},{...planted(),z:-34}];const before=s.score;assert(R.runnerShoot(s));assert(!s.golden,'used');assert.equal(s.goldenShots,1);assert.match(s.message,/GOLDEN SHOT/);
 run(s,.9);assert(s.objects.filter(o=>o.kind==='defender').every(o=>o.passed&&o.knock!==undefined),'all three defenders in the lane are knocked away');assert.equal(s.score-before,300);assert(!s.shots.some(p=>p.returning));
 const keeperGoal=()=>({lane:0,z:-18,kind:'goal',passed:false,openLane:1,keeper:true,kx:0,kclock:0,kout:0,rush:false,cross:false});
 s=game('classic');quiet(s);s.level=2;s.objects=[keeperGoal()];R.runnerShoot(s);run(s,.4,60,x=>{const g=x.objects.find(o=>o.kind==='goal');if(g){g.kx=x.x+R.RUNNER_STRIKE_X;g.kclock=0;}});assert.equal(s.goals,0,'a plain shot at the keeper is saved');
 s=game('classic');quiet(s);s.level=2;s.golden=true;s.objects=[keeperGoal()];R.runnerShoot(s);const at=s.score;run(s,.4);assert.equal(s.goals,1);assert.equal(s.goldenGoals,1);assert.match(s.message,/GOLDEN GOAL/);
 assert.equal(s.score-at,(150+150)*R.runnerMultiplier(s),'the pay of a placed goal: no precision and no power bonus');
 // A golden goal does not count toward a heart: sure goals must not turn into endless hearts.
 s=game('classic');quiet(s);s.level=2;s.golden=true;s.lives=s.maxLives-1;s.refillCount=s.refillGoals-1;s.objects=[keeperGoal()];R.runnerShoot(s);run(s,.4);assert.equal(s.goals,1);assert.equal(s.lives,s.maxLives-1);
 const src=read('lib/arcade/runnerGame.ts');assert(src.includes("scoreGoal(s,target,shot.x,!!shot.earned,!target.keeper&&!!shot.precision,'GOLDEN GOAL',true)"));
});
const hill=(mode,seed,round=1)=>{const s=game(mode,{},seed);quiet(s);s.round=round;s.distance=s.finish-201;run(s,.3);return s;};
ok('3. the ball ladder: one lane per step, clear of the goal line and of every defender, the same for the same seed',()=>{
 for(const mode of Object.keys(Mo.RUNNER_MODES)){const m=Mo.RUNNER_MODES[mode];if(!m.finish)continue;
  for(const seed of[3,61,977]){const s=hill(mode,seed),rungs=s.objects.filter(o=>o.ladder).sort((a,b)=>a.ladder-b.ladder);
   assert.equal(s.finishPhase,'hill');assert.equal(rungs.length,s.ladderSize);assert(rungs.length>=L.minBalls&&rungs.length<=L.balls,`${mode}: ${rungs.length} rungs`);
   for(let i=1;i<rungs.length;i++){assert.equal(Math.abs(rungs[i].lane-rungs[i-1].lane),1,'adjacent lanes only');const step=rungs[i-1].z-rungs[i].z;assert(step>=L.step[0]-1e-6&&step<=L.step[1]+1e-6,'step '+step);assert(step/(s.speed*1.3)>=.36,'time for the lane change, even on a power run');}
   const left=s.finish-s.distance;assert(left+rungs[rungs.length-1].z>=L.clear-1,'ends before the last defenders and the goal trail');
   const again=hill(mode,seed).objects.filter(o=>o.ladder).map(o=>o.lane+':'+o.z.toFixed(3)).join();assert.equal(again,s.objects.filter(o=>o.ladder).map(o=>o.lane+':'+o.z.toFixed(3)).join(),'deterministic');}}
 // A line still on the road pushes the ladder beyond it; too little clear road means no ladder at all.
 Mo.selectRunnerMode('night');let s=R.createRunnerGame({seed:5});quiet(s);s.distance=s.finish-201;s.objects=[{kind:'defender',role:'jockey',lane:0,z:-50,passed:false,openLane:1}];run(s,.3);
 const first=s.objects.filter(o=>o.ladder).sort((a,b)=>b.z-a.z)[0];assert(first&&first.z<=s.objects.find(o=>o.kind==='defender').z-14,'starts beyond the defender');
 s=R.createRunnerGame({seed:5});quiet(s);s.distance=s.finish-201;s.objects=[{kind:'cone',lane:0,z:-95,passed:false,openLane:1}];run(s,.3);assert.equal(s.ladderSize,0);assert(!s.objects.some(o=>o.ladder));
 for(const mode of Object.keys(Mo.RUNNER_MODES))if(!Mo.RUNNER_MODES[mode].finish){const r=botRun(R,Mo,mode,{seed:4,maxSeconds:200});assert.equal(r.s.ladders,0);assert.equal(r.s.ladderSize,0);}
});
ok('4. the whole ladder pays the bonus and arms a golden shot; rungs do not build the power run',()=>{
 const s=hill('warmup',61);const n=s.ladderSize,energy=s.energy;let got=0;s.balls=5;
 run(s,8,60,x=>{const next=x.objects.filter(o=>o.ladder&&!o.passed).sort((a,b)=>b.z-a.z)[0];if(next)x.lane=next.lane;got=Math.max(got,x.ladder);});
 assert.equal(s.ladders,1);assert(s.golden,'golden shot armed for the goal line');assert.equal(s.energy,energy,'no power-run touches from rungs');assert.equal(got,n-1);
 const t=hill('warmup',61);t.balls=5;const before=t.score;let bonusSeen=false;run(t,8,60,x=>{const next=x.objects.filter(o=>o.ladder&&!o.passed).sort((a,b)=>b.z-a.z)[0];if(next)x.lane=next.lane;if(x.eventKind==='ladder'&&/FULL LADDER! \+(\d+)/.test(x.message))bonusSeen=true;});assert(bonusSeen);
 // Missing a rung costs nothing but the bonus.
 const u=hill('warmup',61);const lane=u.objects.filter(o=>o.ladder)[0].lane;u.lane=lane;const lives=u.lives;run(u,8);assert.equal(u.ladders,0);assert.equal(u.lives,lives);assert(!u.golden||u.goldenShots===0);
 assert(before>=0);
});
ok('5. difficulty: a careful bot survives the opening, every run ends, later rounds are harder',()=>{
 for(const mode of['warmup','classic']){for(let seed=1;seed<=8;seed++){let firstHit=Infinity;botRun(R,Mo,mode,{seed,lapse:0,react:.2,nerve:1,maxSeconds:45,each:(s,t)=>{if(s.hits&&firstHit===Infinity)firstHit=t;}});assert(firstHit>=45,`${mode} seed ${seed}: careful bot hit at ${firstHit.toFixed(1)} s`);}}
 let early=0,earlyT=0,late=0,lateT=0;
 for(let seed=1;seed<=10;seed++){let hits=0;const r=botRun(R,Mo,'warmup',{seed,lapse:.05,react:.35,nerve:.4,maxSeconds:3600,hz:30,each:s=>{const h=s.hits-hits;hits=s.hits;if(s.round<=1){early+=h;earlyT+=1/30;}else if(s.round>=3){late+=h;lateT+=1/30;}}});assert(r.ended,'seed '+seed+' ends');}
 assert(lateT>60&&late/lateT>early/earlyT*1.5,`hearts lost per minute: round 1 ${(early/earlyT*60).toFixed(2)}, round 3+ ${(late/lateT*60).toFixed(2)}`);
});
ok('6. sound and HUD wiring',()=>{
 const audio=read('components/games/runnerAudio.ts'),pad=read('components/games/RunnerControls.tsx'),css=read('components/games/RunnerControls.module.css'),fx=read('lib/arcade/runnerFx.ts'),view=read('lib/arcade/games/runnerGame3d.ts');
 assert(audio.includes('kind === "return"'),'the return ball has a danger cue');assert(audio.includes('kind === "golden" || kind === "ladder"'));assert(audio.includes('(s.ladder ?? 0) > 0'),'rungs climb in pitch');assert(audio.includes('(s.goldenShots ?? 0) > last.goldenShots'));
 assert(pad.includes('data-gold={i<gold||undefined}')&&pad.includes('data-runner-shoot data-golden={golden||undefined}'));assert(css.includes('.balls u[data-gold]{background:#ffc83a')&&css.includes('.shoot.shoot[data-golden]'));
 assert(/@media \(prefers-reduced-motion:reduce\)\{\.balls u\[data-gold\],\.balls\[data-golden\] u,\.shoot\.shoot\[data-golden\]\{animation:none\}\}/.test(css));
 assert(fx.includes("kind==='golden'")&&fx.includes("kind==='ladder'"));assert(view.includes('if(o.ladder){')&&view.includes("goldTrail?'#ffc83a':RUNNER_PAPER"));
 assert(!/—/.test(audio.slice(audio.indexOf('Return ball (found silent'),audio.indexOf('Return ball (found silent')+900)));
});
ok('7. run challenge: a different extra goal each run, the same for everyone on the Daily Run, a small bonus once, nothing saved',()=>{
 const M=load('lib/arcade/runnerMissions.ts'),C=M.RUNNER_RUN_CHALLENGES;assert(C.length>=6);assert(M.RUNNER_CHALLENGE_BONUS<=500,'too small to move a board');
 const seen=new Set();for(let turn=0;turn<C.length;turn++)seen.add(M.runnerChallengeFor('warmup',turn).id);assert.equal(seen.size,C.length,'every challenge comes round');
 assert.notEqual(M.runnerChallengeFor('warmup',3).id,M.runnerChallengeFor('warmup',4).id,'run 2 differs from run 1');
 for(let turn=0;turn<C.length;turn++)assert(!M.runnerChallengeFor('classic',turn).line,'no ladder challenge on a route without a goal line');
 assert.equal(M.runnerChallengeFor('daily',1,'2026-11-18').id,M.runnerChallengeFor('daily',9,'2026-11-18').id,'the Daily Run: one challenge for everyone that day');
 let writes=0;const keep=globalThis.localStorage;globalThis.localStorage={getItem:k=>keep.getItem(k),setItem:(k,v)=>{writes++;keep.setItem(k,v);},removeItem:k=>keep.removeItem(k)};
 try{const s=game('warmup');quiet(s);run(s,2);M.tickRunnerMissions(s);const row=M.runnerChallengeRow(s),c=C.find(x=>x.label===row.label);assert(c&&!row.done);
  const before=s.score;s.goldenGoals=1;s.perfectDodges=2;s.ladders=1;s.streak=3;s.insideCuts=2;s.nearMisses=4;s.goldenShots=1;s.eventAt=-9;
  for(let i=0;i<6;i++){s.eventAt=-9;M.tickRunnerMissions(s);}
  assert(M.runnerChallengeRow(s).done);assert(s.score-before>=M.RUNNER_CHALLENGE_BONUS&&(s.score-before)%M.RUNNER_CHALLENGE_BONUS===0&&s.score-before===M.RUNNER_CHALLENGE_BONUS,'paid once');
  const next=game('warmup');quiet(next);M.tickRunnerMissions(next);assert.notEqual(M.runnerChallengeRow(next).label,row.label,'the next run gets the next challenge');
 }finally{globalThis.localStorage=keep;}
 const card=read('components/games/RunnerMissionCard.tsx'),menu=read('components/games/RunnerMenu.tsx');assert(card.includes('data-runner-challenge')&&menu.includes('data-runner-challenge'));
});
// Fix round (Nov 18 2026): Cup Final's wave at 230 m put a cone and a drifting defender 3 m in front of the back line, so the one lane
// the line leaves open could be filled (a child-level bot lost a heart there at 13 s in 5 of 10 seeds). A back line now stands alone.
ok('fix round: a back line stands alone, and a child-level bot clears the first 600 m of the Cup Final',()=>{
 for(const mode of ['night','storm','cup','legend','daily'])for(let seed=1;seed<=6;seed++){const born=new WeakMap();let lines=0;
  botRun(R,Mo,mode,{seed,lapse:0,maxSeconds:90,each:(s,t)=>{const line=s.objects.filter(o=>o.role==='line'&&!o.passed);lines+=line.length;
   for(const o of s.objects)if(!born.has(o)){born.set(o,1);if((o.kind==='defender'||o.kind==='cone'||o.kind==='mud')&&o.role!=='line')for(const l of line)assert(Math.abs(o.z-l.z)>20,mode+' seed '+seed+': a '+o.kind+' spawned '+Math.abs(o.z-l.z).toFixed(0)+' m from a live back line at '+t.toFixed(1)+' s');}}});
  if(mode==='cup')assert(lines>0,'the Cup Final still has its back line');}
 let early=0;for(let seed=1;seed<=10;seed++){let lives=null,hit=false;botRun(R,Mo,'cup',{seed,lapse:0,react:.4,nerve:.3,maxSeconds:40,each:s=>{if(lives===null)lives=s.lives;if(s.lives<lives&&s.distance<600)hit=true;lives=s.lives;}});if(hit)early++;}
 assert(early<=1,'a child-level bot (react .4 s, jumps 3 tackles in 10) lost a heart in the first 600 m in '+early+' of 10 seeds');
});
if(failed){console.log(failed+' failed');process.exit(1);}console.log('runner-aaa-nov18 ok');
