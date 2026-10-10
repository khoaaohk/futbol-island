// Breakaway Run first-run coach (Oct 10 2026): teach-by-doing slow motion for the four core decisions.
import '../scripts/register-local-ts.mjs';
import assert from 'node:assert/strict';
const R=await import('../lib/arcade/runnerGame.ts');
const C=await import('../lib/arcade/runnerCoach.ts');
const H=await import('../lib/arcade/runnerHud.ts');
const {createRunnerGame,tickRunner,runnerJump,runnerShoot,runnerSkill}=R;
const {tickRunnerCoach,resetRunnerCoach,readRunnerCoach,RUNNER_COACH}=C;
const store=new Map();globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const fresh=(extra={})=>{const s=createRunnerGame();s.spawn=99;s.nextGoal=1e6;Object.assign(s,extra);return s;};
const def=(role,z,lane=0,extra={})=>({kind:'defender',lane,z,role,passed:false,openLane:0,...extra});
/** One frame as the arcade loop runs it: the coach sees real time, the simulation runs scaled. */
const frame=(s,dt=1/60)=>{tickRunnerCoach(s,dt);tickRunner(s,dt*s.coachScale);};
const clean=()=>{store.clear();resetRunnerCoach();};

// 1. Lane beat: a defender in your lane with space beside you slows time, names the swipe and lights the arrow.
{clean();const s=fresh({readLane:1});s.objects=[def('jockey',-30,0),{kind:'coin',lane:1,z:-26,passed:false,openLane:0}];
 let seen=false,minScale=1;for(let i=0;i<120&&!seen;i++){frame(s);if(s.coach==='lane')seen=true;}
 assert(seen,'lane beat fires as the defender approaches');assert.equal(s.coachButton,'right');assert.match(s.coachPrompt,/SWIPE →/);assert.equal(s.coachWord,'MOVE →');
 for(let i=0;i<20;i++){frame(s);minScale=Math.min(minScale,s.coachScale);}
 assert(minScale<RUNNER_COACH.scale.lane+.05,`eases into slow motion (${minScale.toFixed(2)})`);
 const hud=H.runnerHud(s);assert.equal(hud.message,s.coachPrompt,'the coach prompt owns the coaching line');assert.equal(hud.coach,'right','HUD names the button to light');
 s.lane=1;for(let i=0;i<40;i++)frame(s);
 assert.equal(s.coach,'','acting ends the beat');assert(s.coachScale>.97,'time returns to full speed');assert(readRunnerCoach().done.includes('lane'),'the lane lesson is learned');
 assert.equal(s.lives,3);assert.equal(H.runnerHud(s).coach,'');}

// 2. A learned beat never fires again; an unlearned one is offered in at most RUNNER_COACH.runs runs.
{const s=fresh({readLane:1});s.objects=[def('jockey',-30,0)];for(let i=0;i<60;i++)frame(s);assert.notEqual(s.coach,'lane','learned beats stay quiet');}
{clean();for(let run=0;run<RUNNER_COACH.runs+1;run++){const s=fresh({readLane:1});s.objects=[def('jockey',-30,0)];let fired=false;for(let i=0;i<160;i++){frame(s);if(s.coach==='lane')fired=true;}
  assert.equal(fired,run<RUNNER_COACH.runs,`run ${run+1}: offered only while under the cap`);}
 assert(!readRunnerCoach().done.includes('lane'),'ignoring the prompt is not learning it');}

// 3. Slow motion is capped in real time, so a child who freezes is never stuck.
{clean();const s=fresh({readLane:1});s.objects=[def('jockey',-60,0)];s.speed=4;
 let slowed=0;for(let i=0;i<60*6;i++){frame(s);if(s.coachScale<.9)slowed+=1/60;}
 assert(slowed<=RUNNER_COACH.hold+.4,`slow motion lasts ≤ hold (${slowed.toFixed(2)} s)`);}

// 4. Jump beat (after the lane lesson): a low slide tackle in your lane names JUMP; jumping learns it and clears it.
{clean();resetRunnerCoach({done:['lane'],offered:{}});const s=fresh();s.objects=[def('tackler',-20,0)];
 let seen=false;for(let i=0;i<120&&!seen;i++){frame(s);if(s.coach==='jump')seen=true;}
 assert(seen,'jump beat fires for a low tackle');assert.equal(H.runnerHud(s).coach,'jump');
 for(let i=0;i<33;i++)frame(s); // a child's 0.55 s reaction time still lands the hurdle
 runnerJump(s);for(let i=0;i<90;i++)frame(s);
 assert(readRunnerCoach().done.includes('jump'));assert.equal(s.lives,3,'the coached jump clears the tackle');assert.equal(s.hurdles,1);}

// 5. Skill beat: a defender inside the skill window names the real counter move; pressing it beats him.
{clean();resetRunnerCoach({done:['lane','jump'],offered:{}});const s=fresh();s.objects=[def('jockey',-24,0)];
 let seen=false;for(let i=0;i<120&&!seen;i++){frame(s);if(s.coach==='skill')seen=true;}
 assert(seen,'skill beat fires inside the window');assert.match(s.coachPrompt,/STEP-OVER/);assert.equal(H.runnerHud(s).coach,'skill');
 assert(runnerSkill(s),'the named move works at the coached moment');for(let i=0;i<5;i++)frame(s);
 assert.equal(s.coach,'');assert(readRunnerCoach().done.includes('skill'));assert.equal(s.skills,1);}

// 6. Shoot beat: lined up with the gold gap, the game names SHOOT; shooting learns it.
{clean();resetRunnerCoach({done:['lane','jump','skill'],offered:{}});const s=fresh();s.objects=[{kind:'goal',lane:0,z:-30,passed:false,openLane:0}];
 let seen=false;for(let i=0;i<120&&!seen;i++){frame(s);if(s.coach==='shoot')seen=true;}
 assert(seen,'shoot beat fires in range');assert.equal(H.runnerHud(s).coach,'shoot');runnerShoot(s);for(let i=0;i<60;i++)frame(s);
 assert.equal(s.goals,1);assert(readRunnerCoach().done.includes('shoot'));assert.equal(s.coachScale,1);}

// 7. Never during full time, and storage failures are harmless.
{clean();const s=fresh({lives:0,outro:1,readLane:1});s.objects=[def('jockey',-12,0)];tickRunnerCoach(s,1/60);assert.equal(s.coach,'');assert.equal(s.coachScale,1);}
{const saved=globalThis.localStorage;globalThis.localStorage={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}};resetRunnerCoach();
 const s=fresh({readLane:1});s.objects=[def('jockey',-30,0)];for(let i=0;i<90;i++)frame(s);assert.equal(s.coach,'lane','works without storage');globalThis.localStorage=saved;}
clean();

// 7b. The coached jump clears the tackle for any reaction from instant to ~0.9 s.
for(const delay of[0,30,54]){clean();resetRunnerCoach({done:['lane'],offered:{}});const s=fresh();s.objects=[def('tackler',-20,0)];
 for(let i=0;i<120&&s.coach!=='jump';i++)frame(s);assert.equal(s.coach,'jump');for(let i=0;i<delay;i++)frame(s);runnerJump(s);for(let i=0;i<90;i++)frame(s);
 assert.equal(s.lives,3,`jump after ${delay} frames clears it`);assert.equal(s.hurdles,1);}

// 7c. Personal best: announced once, after any fresh teaching moment, never without a record to beat.
{const s=fresh({bestToBeat:100});s.score=150;s.eventAt=s.time;s.eventKind='goal';tickRunner(s,1/60);assert.equal(s.newBest,false,'waits for the goal moment to be read');
 for(let i=0;i<90;i++)tickRunner(s,1/60);assert.equal(s.newBest,true);assert.equal(s.eventKind,'best');assert.match(s.message,/NEW PERSONAL BEST! You beat 100/);
 const e=s.event;s.score=400;for(let i=0;i<120;i++)tickRunner(s,1/60);assert.equal(s.event,e,'only once per run');assert.match(H.runnerHud({...s,eventAt:s.time}).message,/PERSONAL BEST/);}
{const s=fresh();s.score=5000;for(let i=0;i<90;i++)tickRunner(s,1/60);assert.equal(s.newBest,false,'first ever run has no record to beat');}
clean();

// 7d. A ball collected in the same tick as a tackle never hides the tackle (message, hit-stop, sound).
{const s=fresh();s.objects=[def('jockey',-1.2,0,{tackle:.2,read:1,aim:0}),{kind:'coin',lane:0,z:-.3,passed:false,openLane:0}];const e=s.event;
 for(let i=0;i<6&&s.lives===3;i++)tickRunner(s,1/60);assert.equal(s.lives,2);assert.equal(s.eventKind,'hit','the hit owns its frame');assert.match(s.message,/Tackled/);assert(s.event>e);}
clean();

// 7e. HUD: the back line names its open side; the phone pill is two short lines (have / where).
{resetRunnerCoach({done:['lane','jump','skill','shoot'],offered:{}});const s=fresh({distance:800,level:3});R.spawnRunnerBoss(s);for(let i=0;i<60*3&&!s.objects.some(o=>o.boss&&o.z>-20);i++)tickRunner(s,1/60);
 const line=s.objects.find(o=>o.boss&&!o.passed&&o.z>-24),hud=H.runnerHud(s);assert(line);s.x=line.x??line.lane*2.4;
 assert.match(H.runnerHud(s).message,line.openLane<0?/open side: ← LEFT/:/open side: RIGHT →/,'back-line tip names the open side');
 const d=hud.detail.split('\n');assert.equal(d.length,2);assert.match(d[0],/^♥♥♥ · ⚽ \d\/5/);assert.match(d[1],/^\d+ m · BACK LINE!$/);
 assert(d.every(l=>l.length<=22),'each pill line fits ~130 px at 10 px');}
clean();

// 8. "Play again" resets the SAME object (Object.assign): missions and the coach must start a fresh run.
{const M=await import('../lib/arcade/runnerMissions.ts');store.clear();M.resetRunnerProgress({set:0,done:['goals2','skill1'],stars:2});
 const s=fresh();s.level=2;s.eventAt=-9;M.tickRunnerMissions(s);assert.equal(M.readRunnerProgress().set,1,'third mission completes set 1');assert.match(M.runnerMissionSummary(s),/★ 1 this run/);
 Object.assign(s,createRunnerGame());s.spawn=99;s.nextGoal=1e6;
 assert.match(M.runnerMissionSummary(s),/★ 0 this run · set 2: 0\/3/,'a new run starts on the new set with a clean count');
 assert.deepEqual(M.runnerMissionRows(s).map(r=>r.done),[false,false,false],'the new set is not shown as done');
 s.hurdles=1;s.eventAt=-9;M.tickRunnerMissions(s);assert.deepEqual(M.readRunnerProgress().done,['hurdle'],'missions keep counting after Play again');
 M.resetRunnerProgress();
 clean();const g=fresh({readLane:1});g.objects=[def('jockey',-30,0)];for(let i=0;i<90;i++)frame(g);assert.equal(g.coach,'lane');
 Object.assign(g,createRunnerGame(),{spawn:99,nextGoal:1e6,readLane:1});g.objects=[def('jockey',-30,0)];let again=false;for(let i=0;i<90;i++){frame(g);if(g.coach==='lane')again=true;}
 assert(again,'the coach offers an unlearned beat again on the next run of the same object');}
clean();
console.log('RUNNER_COACH_PASS');
