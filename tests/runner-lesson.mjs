// Breakaway Run lesson pass (Oct 9 2026): "Beat the tackle. Find the goal." The first defender stands in the
// kick-off lane, a single line may sit in a goal's run-up, beating a defender then scoring is tracked and
// rewarded with a mission, and the HUD speaks in hearts and short takeaways.
import '../scripts/register-local-ts.mjs';
import assert from 'node:assert/strict';
const R=await import('../lib/arcade/runnerGame.ts');
const M=await import('../lib/arcade/runnerMissions.ts');
const H=await import('../lib/arcade/runnerHud.ts');
const {createRunnerGame,tickRunner,runnerShoot,runnerSkill,runnerContactTime,spawnRunnerPattern,RUNNER_GOAL_RUNUP,RUNNER_BEAT_SCORE_WINDOW}=R;
const fresh=(extra={})=>{const s=createRunnerGame();s.spawn=99;s.nextGoal=1e6;Object.assign(s,extra);return s;};
const run=(s,seconds,hz=60,each)=>{for(let i=0;i<seconds*hz;i++){each?.(s,i);tickRunner(s,1/hz);}};
const until=(s,pred,max=900)=>{for(let i=0;i<max&&!pred(s);i++)tickRunner(s,1/60);};
const def=(role,z,lane=0,extra={})=>({kind:'defender',lane,z,role,passed:false,openLane:0,...extra});

// 1. The very first encounter: a defender in the kick-off (centre) lane, the ball trail in an open lane.
{const s=fresh();s.wave=0;spawnRunnerPattern(s);const centre=s.objects.filter(o=>o.kind==='defender'&&o.lane===0);const trail=s.objects.filter(o=>o.kind==='coin'&&!o.link);
 assert.equal(centre.length,1,'first defender stands in the kick-off lane');assert(trail.length===3&&trail.every(o=>o.lane!==0),'the trail leads into space');}
// Doing nothing is no longer safe in stage 1: an idle runner loses a chance early.
{const s=createRunnerGame();let first=0;run(s,30,60,g=>{if(!first&&g.hits)first=g.distance;});assert(first>0&&first<120,`idle runner is tackled early (${Math.round(first)} m)`);}

// 2. Goal run-up: a single line can spawn inside the old 62 m reserve and stands AHEAD of the golden trail.
{assert(RUNNER_GOAL_RUNUP<62);const s=createRunnerGame();s.distance=1000;s.nextGoal=1050;s.wave=4;s.level=3;s.spawn=0;s.objects=[];
 tickRunner(s,1/60);const lines=[...new Set(s.objects.filter(o=>o.kind==='defender'||o.kind==='cone').map(o=>o.z))];assert.equal(lines.length,1,'one line only in the run-up');
 assert.match(s.message,/Beat the defender, then find the goal/);
 until(s,g=>g.objects.some(o=>o.kind==='goal'),4000);const goal=s.objects.find(o=>o.kind==='goal'),line=s.objects.find(o=>(o.kind==='defender'||o.kind==='cone')&&!o.passed);
 const golden=s.objects.filter(o=>o.kind==='coin'&&o.lane===goal.openLane&&o.z<=-27);
 assert(line,'the run-up line is still ahead when the goal appears');assert(line.z>Math.max(...golden.map(o=>o.z))+5,'the line is beaten before the golden trail starts');
 assert(goal.z<=-59,'the goal itself is never crowded');}
{const s=createRunnerGame();s.distance=1000;s.nextGoal=1030;s.spawn=0;s.objects=[];tickRunner(s,1/60);assert(!s.objects.some(o=>o.kind==='defender'||o.kind==='cone'),'inside the run-up reserve nothing new spawns');}

// 3. Beat the tackle, then find the goal: a skill move then a goal inside the window counts once.
const beatThenShoot=(gap)=>{const s=fresh({balls:3});s.objects=[def('jockey',-26)];until(s,g=>runnerContactTime(g,g.objects[0])<.3);assert(runnerSkill(s));
 run(s,gap);s.objects.push({kind:'goal',lane:0,z:-14,passed:false,openLane:0});s.lane=0;runnerShoot(s);run(s,1);return s;};
{const s=beatThenShoot(.5);assert.equal(s.goals,1);assert.equal(s.beatScores,1,'beat then score counted');assert.match(s.message,/Beat the tackle, found the goal/);
 const late=beatThenShoot(RUNNER_BEAT_SCORE_WINDOW+.5);assert.equal(late.goals,1);assert.equal(late.beatScores,0,'too long after the dodge is just a goal');}
// A near miss opens the window too; losing a chance closes it.
{const s=fresh({balls:2});s.objects=[def('tackler',-26)];let cut=false;run(s,2.4,60,g=>{if(!cut&&g.objects[0]&&g.objects[0].z>-5.2){g.lane=1;cut=true;}});assert.equal(s.nearMisses,1);assert(s.time-s.lastBeatAt<2);
 s.objects=[def('jockey',-3,1)];run(s,.6);assert.equal(s.lives,2);assert.equal(s.lastBeatAt,-99,'a lost chance forgets the dodge');}
// Perfect skills and a clean stage are counted for missions.
{const s=fresh();s.objects=[def('jockey',-30)];until(s,g=>runnerContactTime(g,g.objects[0])<.3);runnerSkill(s);assert.equal(s.perfectSkills,1);
 const c=createRunnerGame();c.lives=1e6;c.distance=360.5;tickRunner(c,1/60);assert.equal(c.level,2);assert.equal(c.cleanStage,2,'reached stage 2 clean');c.hits=1;c.distance=720.5;tickRunner(c,1/60);assert.equal(c.cleanStage,2,'a lost chance freezes the clean stage');}

// 4. Missions: an eighth set teaches the lesson directly.
{assert.deepEqual([...M.RUNNER_MISSION_SETS.at(-1)],['beatScore','perfect3','clean3']);const s=fresh({beatScores:1,perfectSkills:3,cleanStage:3});
 for(const id of['beatScore','perfect3','clean3'])assert(M.RUNNER_MISSIONS[id].value(s)>=M.RUNNER_MISSIONS[id].target,id);}

// 5. HUD: hearts for chances, a calm full-bag line, and a lesson takeaway at full time.
{assert.equal(H.runnerHearts(3),'♥♥♥');assert.equal(H.runnerHearts(1),'♥♡♡');assert.equal(H.runnerHearts(0),'♡♡♡');
 const s=fresh();assert.match(H.runnerHud(s).detail,/^♥♥♥ · ⚽ 1\/5/);
 const bag=fresh({balls:5});bag.objects=[{kind:'coin',lane:0,z:-.2,passed:false,openLane:0}];tickRunner(bag,1/60);assert.match(bag.message,/bag full/);
 const over=fresh({lives:0,goals:2,beatScores:2});assert.match(H.runnerHud(over).detail,/Beat the tackle, then scored: 2×/);
 assert.match(H.runnerLessonTakeaway(fresh({goals:1,skills:1})),/beat a defender, then shoot/);assert.equal(H.runnerLessonTakeaway(fresh()),'');
 // Tips lead with the action a child can take.
 const t=fresh();t.objects=[def('tackler',-12,0,{read:.1})];assert.match(H.runnerHud(t).message,/JUMP it/);}
console.log('PASS runner lesson: first defender in the kick-off lane, goal run-up line, beat-then-score, perfect/clean counters, lesson missions, hearts HUD');
