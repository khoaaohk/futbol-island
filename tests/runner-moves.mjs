// Breakaway Run round 2 (Oct 4 2026): skill moves, closers, the pair, puddles, one-twos,
// keeper finishing (placed/power/chip/round), wing crosses, the back-line boss, route forks,
// the one-tackle power shield, the pace ramp and missions.
import '../scripts/register-local-ts.mjs';
import assert from 'node:assert/strict';
const R=await import('../lib/arcade/runnerGame.ts');
const M=await import('../lib/arcade/runnerMissions.ts');
const {createRunnerGame,tickRunner,runnerJump,runnerShoot,runnerSkill,runnerContactTime,spawnRunnerBoss,runnerPace,RUNNER_TUNING,RUNNER_SKILL_FOR}=R;
const fresh=(extra={})=>{const s=createRunnerGame();s.spawn=99;s.nextGoal=1e6;Object.assign(s,extra);return s;};
const run=(s,seconds,hz=60,each)=>{for(let i=0;i<seconds*hz;i++){each?.(s,i);tickRunner(s,1/hz);}};
const def=(role,z,lane=0,extra={})=>({kind:'defender',lane,z,role,passed:false,openLane:0,...extra});
const until=(s,pred,max=600)=>{for(let i=0;i<max&&!pred(s);i++)tickRunner(s,1/60);};

// 1. Skill moves: the defender family picks the real counter; timing decides it.
for(const [role,move] of Object.entries(RUNNER_SKILL_FOR).filter(([r])=>r!=='pair')){
 const s=fresh();s.objects=[def(role,-30)];
 until(s,g=>{const t=runnerContactTime(g,g.objects[0]);return t<.3;});
 assert(runnerSkill(s),`${role}: skill starts`);assert.equal(s.skill,move,`${role} is beaten by a ${move}`);
 assert.equal(s.objects[0].beaten,1);run(s,2);assert.equal(s.lives,3,`${role}: a timed ${move} beats the tackle`);assert.equal(s.skills,1);
}
{const s=fresh();s.objects=[def('jockey',-30)];until(s,g=>runnerContactTime(g,g.objects[0])<.3);runnerSkill(s);assert.match(s.message,/PERFECT STEP-OVER/);assert.equal(s.score,100,'perfect timing earns the bonus');}
{const s=fresh();s.objects=[def('jockey',-30)];until(s,g=>g.objects[0].z>-15&&runnerContactTime(g,g.objects[0])>.75);
 assert(runnerSkill(s));assert.equal(s.objects[0].beaten,undefined,'too early: the defender recovers');assert.match(s.message,/Too early/);run(s,2);assert.equal(s.lives,2,'an early skill still meets the tackle');}
{const s=fresh({balls:0});s.objects=[def('jockey',-6)];assert.equal(runnerSkill(s),false,'no ball, no dribble');}
{const s=fresh();s.objects=[def('pair',-30,-1),def('pair',-30,1)];until(s,g=>runnerContactTime(g,g.objects[0])<.3);runnerSkill(s);assert.equal(s.skill,'croqueta');
 assert(s.objects.every(o=>o.beaten),'a croqueta splits both defenders of the pair');run(s,2);assert.equal(s.lives,3);}
{const s=fresh();s.objects=[{kind:'cone',lane:0,z:-5,passed:false,openLane:0}];assert.equal(runnerSkill(s),false,'you cannot dribble a cone');}

// 2. Closer: steps across into the trail lane after its read; the lane it leaves opens.
{const s=fresh();s.objects=[def('jockey',-34,-1,{closeTo:0}),def('sweeper',-34,1)];
 run(s,1.2);const c=s.objects[0];assert.equal(c.lane,0,'closer now guards the trail lane');assert(Math.abs((c.x??0))<.9,'and has moved across');
 const s2=fresh();s2.objects=[def('jockey',-34,-1,{closeTo:0}),def('sweeper',-34,1)];run(s2,3);assert.equal(s2.lives,2,'staying in the trail lane is tackled');
 const s3=fresh();s3.objects=[def('jockey',-34,-1,{closeTo:0}),def('sweeper',-34,1)];run(s3,3,60,g=>{if(g.objects[0]?.closing)g.lane=-1;});assert.equal(s3.lives,3,'cutting into the space they left escapes');assert.equal(s3.closersBeaten,1);}
// Every closer pattern at max speed still leaves >.85 s between the step and contact.
{const s=fresh({distance:4000,boost:100});s.objects=[def('jockey',-34,-1,{closeTo:0})];let stepZ;run(s,2,120,g=>{const o=g.objects[0];if(o&&o.closing&&stepZ===undefined)stepZ=o.z;});
 assert(stepZ!==undefined&&(-stepZ-1.2)/s.speed>.85,`closer step is readable at max speed (${stepZ})`);}

// 3. Puddles: the ball stops dead on the ground; jumping lifts it over.
{const s=fresh({balls:2});s.objects=[{kind:'mud',lane:0,z:-3,length:2.6,passed:false,openLane:0}];run(s,1);assert.equal(s.balls,1,'puddle stops one ball');assert(s.mud>0||s.speed<13);
 const j=fresh({balls:2});j.objects=[{kind:'mud',lane:0,z:-3,length:2.6,passed:false,openLane:0}];runnerJump(j);run(j,1);assert.equal(j.balls,2,'a jump lifts the ball over');assert.equal(j.puddleJumps,1);}

// 4. One-two: shoot beside a teammate, the return comes back and takes a defender out.
{const s=fresh({lane:1,x:2.4,prevLane:1,balls:1});s.objects=[{kind:'mate',lane:1,x:4.3,z:-12,passed:false,openLane:0},def('jockey',-34,1)];
 assert(runnerShoot(s));assert.equal(s.pass.phase,'out');assert.equal(s.balls,0);run(s,.7);assert.equal(s.oneTwos,1);assert.equal(s.balls,1,'the return arrives');assert(s.burst>0,'pass and move: a burst of pace');
 assert(s.objects.find(o=>o.kind==='defender').beaten>0,'the defender is taken out of the game');run(s,3);assert.equal(s.lives,3);}

// 5. Keeper goals: shoot away from the keeper; chip a rushing keeper or go round him.
const keeperGoal=(extra={})=>({kind:'goal',lane:0,z:-14,passed:false,openLane:1,keeper:true,kx:0,kclock:0,kout:0,...extra});
{const s=fresh({balls:2,lane:1,x:2.4,prevLane:1});s.objects=[keeperGoal({kclock:-99})];s.objects[0].kx=-1.9;// keeper far left
 runnerShoot(s);run(s,1);assert.equal(s.goals,1,'placed shot away from the keeper scores');}
{const s=fresh({balls:2});s.objects=[keeperGoal()];const k=s.objects[0];
 // pin the keeper on the runner's lane by stepping its clock to the middle of the sway
 runnerShoot(s);run(s,1,60,()=>{k.kclock=0;k.kx=0;});assert.equal(s.goals,0,'a shot straight at the keeper is saved');}
{const s=fresh({balls:2});s.objects=[keeperGoal({rush:true,z:-20})];run(s,.6);assert((s.objects[0].kout??0)>.3,'keeper rushes off the line');
 runnerShoot(s);run(s,.8);assert.equal(s.goals,0,'a ground shot is smothered');}
{const s=fresh({balls:2});s.objects=[keeperGoal({rush:true,z:-20})];run(s,.6);assert(runnerSkill(s),'Skill near a rushing keeper is a chip');assert.equal(s.skill,'chipShot');run(s,1.5);assert.equal(s.goals,1,'the chip floats over');assert.equal(s.chips,1);}
{const late=fresh({balls:2});late.objects=[keeperGoal({rush:true,z:-26})];run(late,3,60,g=>{const k=g.objects[0];if(k&&!k.passed&&k.z+(k.kout??0)*7>-3.4)g.lane=1;});assert.equal(late.rounded,1,'a late, decisive cut rounds the keeper');assert.equal(late.goals,1);
 const early=fresh({balls:2});early.objects=[keeperGoal({rush:true,z:-26})];run(early,3,60,g=>{const k=g.objects[0];if(k&&!k.passed&&k.z+(k.kout??0)*7>-12)g.lane=1;});assert.equal(early.goals,0,'cutting too early lets the keeper follow');}
// Wing cross: only a shot in the air finishes it.
{const s=fresh({balls:2});s.objects=[keeperGoal({cross:true})];runnerShoot(s);run(s,1);assert.equal(s.goals,0,'a ground shot is cleared');
 const v=fresh({balls:2});v.objects=[keeperGoal({cross:true,z:-16})];runnerJump(v);run(v,.2);assert(runnerShoot(v));run(v,1);assert.equal(v.goals,1,'a volley meets the cross');assert.equal(v.headers,1);}

// 6. Back line boss: two lines shift together, freeze when close, cost at most one chance.
{const first=fresh({level:2});spawnRunnerBoss(first);assert.equal(first.objects.filter(o=>o.boss).length,2,'the first back line of a run is one line');
 const s=fresh({level:2,bossSeen:1});spawnRunnerBoss(s);const line=s.objects.filter(o=>o.boss);assert.equal(line.length,4);
 for(let i=0;i<60*6;i++){tickRunner(s,1/60);for(const z of new Set(line.filter(o=>!o.passed).map(o=>o.z))){const row=line.filter(o=>o.z===z&&!o.passed);if(row.length===2){const lanes=row.map(o=>o.lane);assert.equal(new Set(lanes).size,2);assert(Math.abs(lanes[0]-lanes[1])===1,'the back line stays a compact pair');assert(lanes.every(l=>l>=-1&&l<=1));}}}
 assert(s.lives>=2,'the back line can cost one chance at most');}
{const s=fresh({level:2,lives:3,bossSeen:1});spawnRunnerBoss(s);const frozen=new Map();run(s,9,60,g=>{const o=g.objects.find(o=>o.boss&&!o.passed);if(!o)return;if(o.z>-18){if(!frozen.has(o))frozen.set(o,o.lineClock);assert.equal(o.lineClock,frozen.get(o),'line holds its shape inside 18 m');}g.lane=o.openLane;});
 assert.equal(s.lives,3,'reading the open side beats the back line');assert.equal(s.bosses,1,'boss beaten');}

// 7. Route fork: lane at the fork picks wing (safer, cross) or middle (keeper rush, goals ×2).
{const s=fresh({level:2,distance:400,lane:-1,x:-2.4,prevLane:-1});s.objects=[{kind:'fork',lane:0,z:-1,passed:false,openLane:0}];run(s,.2);assert.equal(s.route,'wing');
 const m=fresh({level:3,distance:800});m.objects=[{kind:'fork',lane:0,z:-1,passed:false,openLane:0}];run(m,.2);assert.equal(m.route,'middle');
 m.nextGoal=m.distance+.1;run(m,.05);const goal=m.objects.find(o=>o.kind==='goal');assert(goal.danger&&goal.rush,'middle route: rushing keeper, double points');}

// 8. Power run (user decision b): eight clean touches; the shield rides exactly one tackle.
{assert.equal(RUNNER_TUNING.powerTouches,8);const s=fresh({energy:7});s.objects=[{kind:'coin',lane:0,z:-.2,passed:false,openLane:0}];tickRunner(s,1/60);assert(s.boost>0&&s.shield);
 s.objects=[def('jockey',-3)];run(s,.5);assert.equal(s.lives,3,'shield rides the first tackle');assert.equal(s.shield,false);assert.equal(s.shieldSaves,1);
 s.objects=[def('jockey',-3)];run(s,.5);assert.equal(s.lives,2,'a second tackle in the same burst costs a chance');}

// 9. Pace: continuous ramp to 18 m/s by stage 5, then a gentle climb, capped at 20.
{let prev=runnerPace(0);for(let d=1;d<6000;d+=1){const v=runnerPace(d);assert(v>=prev&&v-prev<.01,'smooth, never decreasing');prev=v;}assert(Math.abs(runnerPace(1636)-18)<.01);assert.equal(runnerPace(9000),20);}

// 10. Missions: a star per mission, saved only on completion; a full set unlocks a ball.
{const store=new Map();let writes=0;globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>{writes++;store.set(k,v);}};M.resetRunnerProgress();
 const s=fresh();for(let i=0;i<120;i++){tickRunner(s,1/60);M.tickRunnerMissions(s);}assert.equal(writes,0,'no storage writes while nothing completes');
 s.goals=2;M.tickRunnerMissions(s);assert.equal(writes,1);assert.match(s.message,/MISSION/);assert.equal(M.readRunnerProgress().stars,1);
 s.skills=1;M.tickRunnerMissions(s);s.level=2;M.tickRunnerMissions(s);const p=M.readRunnerProgress();assert.equal(p.set,1,'set complete moves on');assert.equal(p.stars,3);assert.match(s.message,/New ball unlocked: Laced leather ball/);
 assert.equal(M.runnerBallFor(p).id,'laced');M.resetRunnerProgress();assert.equal(M.readRunnerProgress().set,1,'progress persists');
 const rows=M.runnerMissionRows();assert.equal(rows.length,3);assert(rows.every(r=>!r.done));delete globalThis.localStorage;M.resetRunnerProgress();}
console.log('PASS runner moves: skill counters and timing, closer, pair, puddles, one-two, keeper placed/chip/round, wing cross, back-line boss, route fork, one-tackle shield, pace ramp, missions');
