import '../scripts/register-local-ts.mjs';
import assert from 'node:assert/strict';
const {createRunnerGame,tickRunner,runnerJump,runnerShoot,spawnRunnerPattern,runnerPatternFor,RUNNER_STAGES}=await import('../lib/arcade/runnerGame.ts');
for(let level=1;level<=8;level++)for(let wave=0;wave<24;wave++){
 const s=createRunnerGame();s.level=level;s.wave=wave;s.nextGoal=1e6;
 const spacing=spawnRunnerPattern(s),challenges=s.objects.filter(o=>o.kind==='defender'||o.kind==='cone');
 const rows=[...new Set(challenges.map(o=>o.z))].sort((a,b)=>b-a),pattern=runnerPatternFor(wave,RUNNER_STAGES[Math.min(level-1,5)].patterns);
 assert(rows.length<3);assert.equal(rows.length>1,pattern>=3&&pattern!==6);
 let previousLane;
 for(const z of rows){const row=challenges.filter(o=>o.z===z),balls=s.objects.filter(o=>o.kind==='coin'&&!o.link&&o.z>z&&o.z<z+20);assert.equal(balls.length,level>=4?2:3,'the ball trail fades from stage 4');assert(balls.every(o=>o.lane===balls[0].lane));const lane=balls[0].lane;
  // A squeezing pair starts in the outside lanes and finishes .7 m from the centre: the trail lane is open at contact.
  if(row[0].role==='pair')assert(row.every(o=>Math.abs(Math.sign(o.lane)*.7-lane*2.4)>1.5),'the pair squeeze leaves the outside lane open');
  else assert(row.every(o=>o.lane!==lane),'each defensive line has a marked, physically open lane');
  assert.equal(new Set(row.map(o=>o.lane)).size,row.length);
  if(previousLane!==undefined)assert(Math.abs(lane-previousLane)<=1,'no forced two-lane reversal');previousLane=lane;
 }
 if(rows.length>1){assert((rows[0]-rows[1])/23.4>1.25,'late-stage boosted reaction window');assert(spacing>=74);}
 assert(s.objects.length<=12,'bounded pattern size (two lines, two trails, two link balls)');
}
const heights=[];
for(const hz of [30,60,120]){
 const s=createRunnerGame();s.spawn=99;s.nextGoal=1e6;runnerJump(s);for(let n=0;n<hz*.3;n++)tickRunner(s,1/hz);heights.push(s.y);
 const blast=createRunnerGame();blast.spawn=99;blast.nextGoal=1e6;blast.charge=1;
 blast.objects=[{kind:'cone',lane:0,z:-1.6,passed:false,openLane:0},{kind:'cone',lane:0,z:-1.9,passed:false,openLane:0},{kind:'goal',lane:0,z:-2.2,passed:false,openLane:0}];
 runnerShoot(blast);for(let n=0;n<hz/5;n++)tickRunner(blast,1/hz);
 assert.equal(blast.goals,1,'blast cannot tunnel past a tightly grouped second blocker');assert.equal(blast.score,850);assert.equal(blast.lives,3);
}
assert(Math.max(...heights)-Math.min(...heights)<1e-10,'same ballistic height at each frame rate');
const s=createRunnerGame();s.lives=1e6;let largest=0;for(let n=0;n<36000;n++){tickRunner(s,1/60);largest=Math.max(largest,s.objects.length);}
assert(largest<30);assert.equal(s.shots.length,4);assert(s.level>6);assert.equal(s.stageName,'Complete striker');
console.log(`PASS runner depth: 192 authored routes, safe two-line spacing, swept blasts and exact jumps at 30/60/120 Hz; ten-minute object peak ${largest}`);
