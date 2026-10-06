// Breakaway Run feel pass (Oct 4 2026): near misses, presser role, fast-fall,
// link balls, smooth pace, kind recovery, full-time outro and the soundtrack.
import '../scripts/register-local-ts.mjs';
import assert from 'node:assert/strict';
const R=await import('../lib/arcade/runnerGame.ts');
const {createRunnerGame,tickRunner,runnerJump,runnerSlide,spawnRunnerPattern,runnerOutro,runnerOver,RUNNER_OUTRO}=R;
const fresh=()=>{const s=createRunnerGame();s.spawn=99;s.nextGoal=1e6;return s;};
const run=(s,seconds,hz=60,each)=>{for(let i=0;i<seconds*hz;i++){each?.(s,i);tickRunner(s,1/hz);}};

// 1. Near miss: standing in a committed tackle's path late, then cutting away, is rewarded.
for(const hz of[30,60,120]){
 const s=fresh();s.objects=[{kind:'defender',lane:0,z:-26,role:'tackler',passed:false,openLane:0}];
 let cut=false;run(s,2.4,hz,g=>{if(!cut&&g.objects[0].z>-5.2){g.lane=1;cut=true;}});
 assert.equal(s.lives,3,`late cut escapes the tackle at ${hz} Hz`);assert.equal(s.nearMisses,1,'near miss counted once');assert.equal(s.score,25);assert.match(s.message,/Beat the tackle/);
}
{const s=fresh();s.lane=1;s.x=2.4;s.prevLane=1;s.objects=[{kind:'defender',lane:0,z:-26,role:'sweeper',passed:false,openLane:0}];run(s,2.4);
 assert.equal(s.nearMisses,0,'an adjacent-lane defender is not a near miss');assert.equal(s.lives,3);}
{const s=fresh();s.objects=[{kind:'defender',lane:0,z:-26,role:'jockey',passed:false,openLane:0}];run(s,2.4);
 assert.equal(s.lives,2,'staying in the tackle lane is still a hit');assert.equal(s.nearMisses,0);}

// 2. Presser: appears from stage 3, closes down visibly, keeps its lane band and its warning.
{const roles=new Set();for(let wave=0;wave<12;wave++){const s=fresh();s.level=1;s.wave=wave;spawnRunnerPattern(s);for(const o of s.objects)if(o.role)roles.add(o.role);}assert(!roles.has('presser'),'no presser in the first stages');}
{const roles=new Set();for(let wave=0;wave<12;wave++){const s=fresh();s.level=3;s.wave=wave;spawnRunnerPattern(s);for(const o of s.objects)if(o.role)roles.add(o.role);}assert(roles.has('presser'),'presser joins at stage 3');}
{const s=fresh();s.x=0;s.objects=[{kind:'defender',lane:1,z:-30,role:'presser',passed:false,openLane:0},{kind:'cone',lane:-1,z:-30,passed:false,openLane:0}];
 for(let i=0;i<70;i++){tickRunner(s,1/60);assert(Math.abs((s.objects[0].x??2.4)-2.4)<=.801,'presser stays in its lane band');}
 assert(s.objects[0].z>s.objects[1].z+1,'presser sprints out ahead of its line');assert((s.objects[0].press??0)>.5);}
for(const role of['jockey','tackler','sweeper','presser']){const s=fresh();s.distance=2000;s.boost=100;s.objects=[{kind:'defender',lane:0,z:-34,role,passed:false,openLane:0}];
 for(let n=0;n<120&&!s.objects[0].passed;n++)tickRunner(s,1/60);assert((s.objects[0].read??0)>=1,`${role} telegraphs ≥1 s before max-speed contact`);}

// 3. Fast-fall: slide pressed at the apex lands sooner and the slide starts on landing.
{const a=fresh(),b=fresh();runnerJump(a);runnerJump(b);run(a,.3);run(b,.3);runnerSlide(b);let la=0,lb=0;
 for(let i=1;i<60;i++){tickRunner(a,1/60);tickRunner(b,1/60);if(!la&&!a.jumping)la=i;if(!lb&&!b.jumping)lb=i;}
 assert(lb&&la&&lb<la-4,`fast-fall lands earlier (${lb} vs ${la} frames)`);assert(b.slides===1,'buffered slide fires on landing');}

// 4. Link balls: a greedy ball-follower is never lured into a defender while the trail is
// the lesson (stages 1-2, up to the first back line). From then on reading is required:
// closers, the back line and the squeezing pair punish blind ball-following (round 2).
{const greedy=(s)=>{const coin=s.objects.filter(o=>o.kind==='coin'&&!o.passed&&o.z<0).sort((a,b)=>b.z-a.z)[0],goal=s.objects.find(o=>o.kind==='goal'&&!o.passed&&o.z<0);
  s.lane=goal&&(!coin||coin.z<goal.z+40)?goal.openLane:coin?coin.lane:s.lane;};
 const s=createRunnerGame();s.lives=99;while(s.distance<520){greedy(s);tickRunner(s,1/60);}
 assert.equal(s.hits,0,'greedy trail-following is safe through stages 1-2');
 let total=0;for(const start of[700,1100,1500]){const g=createRunnerGame();g.distance=start;g.lives=99;for(let i=0;i<60*60;i++){greedy(g);tickRunner(g,1/60);}total+=g.hits;}
 assert(total>=3,`blind ball-following is no longer a complete solution from stage 2 (${total} hits)`);}
{const s=fresh();s.wave=3;s.level=3;spawnRunnerPattern(s);const links=s.objects.filter(o=>o.link);assert.equal(links.length,2,'one link ball past each line');
 const boost=fresh();boost.energy=4;boost.objects=[{kind:'coin',lane:0,z:-.2,passed:false,openLane:0,link:true}];tickRunner(boost,.05);assert.equal(boost.energy,4,'link balls reload without building the power run');assert.equal(boost.balls,2);}

// 5. Pace ramps smoothly; a lost chance eases it briefly; the outro coasts then shows full time.
{const a=fresh(),b=fresh();a.distance=359;b.distance=361;tickRunner(a,1/60);tickRunner(b,1/60);assert(Math.abs(a.speed-b.speed)<.05,'no stage-boundary speed jolt');}
{const s=fresh();s.distance=400;s.objects=[{kind:'cone',lane:0,z:-.2,passed:false,openLane:0}];tickRunner(s,1/60);tickRunner(s,1/60);const slow=s.speed;run(s,2);
 assert(slow<s.speed-1,'a lost chance briefly eases the pace');assert.equal(s.lives,2);}
{const s=fresh();s.lives=1;s.objects=[{kind:'cone',lane:0,z:-.2,passed:false,openLane:0},{kind:'coin',lane:1,z:-20,passed:false,openLane:0}];tickRunner(s,1/60);
 assert.equal(s.lives,0);assert(!runnerOver(s),'full time waits for the outro beat');assert.equal(s.outro,RUNNER_OUTRO);
 const time=s.time,distance=s.distance,z=s.objects[1].z;let steps=0;while(!runnerOver(s)&&steps<200){runnerOutro(s,1/30);tickRunner(s,1/30);steps++;}
 assert(runnerOver(s)&&steps<=Math.ceil(RUNNER_OUTRO*30)+1,'outro finishes on time');assert.equal(s.time,time,'match clock stays frozen');
 assert(s.distance>distance&&s.distance-distance<s.speed*RUNNER_OUTRO,'world coasts to a stop');assert(Math.abs((s.objects[1].z-z)-(s.distance-distance))<1e-9,'objects coast with the pitch');
 const settled=s.distance;runnerOutro(s,1);assert.equal(s.distance,settled,'nothing moves after full time');}
console.log('PASS runner feel: near miss, presser, fast-fall, link balls, smooth pace, recovery and full-time outro');

// 6. Soundtrack: schedules ahead from frames only, follows pace, bounded voices, silent when muted.
globalThis.localStorage={store:{},getItem(k){return this.store[k]??null;},setItem(k,v){this.store[k]=String(v);}};
class Param{constructor(v=0){this.value=v;}setValueAtTime(){}linearRampToValueAtTime(){}exponentialRampToValueAtTime(v){if(!(v>0))throw new RangeError('exponential ramp to non-positive');}}
class Node{connect(){}disconnect(){}}
let started=0,live=0;
class Source extends Node{constructor(){super();this.frequency=new Param(440);this.onended=null;}start(_at,_offset,duration){started++;live++;if(duration!==undefined)this.onended?.();}stop(){this.onended?.();}}
class Ctx{constructor(){this.state='running';this.currentTime=0;this.sampleRate=8000;this.destination=new Node();}
 createGain(){return Object.assign(new Node(),{gain:new Param(1)});}createOscillator(){return new Source();}createBufferSource(){const s=new Source();s.buffer=null;return s;}
 createBiquadFilter(){return Object.assign(new Node(),{type:'',Q:new Param(1),frequency:new Param(1000)});}createStereoPanner(){return Object.assign(new Node(),{pan:new Param(0)});}
 createBuffer(_c,length,rate){const data=new Float32Array(length);return{duration:length/rate,getChannelData:()=>data};}}
const {createRunnerSoundtrack}=await import('../components/games/runnerAudio.ts');
const ctx=new Ctx(),track=createRunnerSoundtrack(()=>ctx),game=createRunnerGame();
const notesIn=(seconds,speed)=>{game.speed=speed;const before=started;for(let i=0;i<seconds*30;i++){ctx.currentTime+=1/30;track.frame(1/30,game);}return started-before;};
const slow=notesIn(4,13),fast=notesIn(4,18);assert(slow>20,'music plays from frame updates');assert(fast>slow,'tempo builds with pace');
assert(track.debug().voices<=28,'voice cap holds');
const pauseBefore=started;ctx.currentTime+=5;assert.equal(started,pauseBefore,'no frames, no notes (pause/hidden/finished sleep)');
game.lives=0;const overBefore=started;notesIn(2,18);assert.equal(started,overBefore,'music stops at full time');game.lives=3;
localStorage.setItem('fi2-sound-muted','true');notesIn(1.1,15);const mutedBefore=started;notesIn(3,15);assert.equal(started,mutedBefore,'muted means silent');
localStorage.setItem('fi2-sound-muted','false');localStorage.setItem('fi2-music-enabled','false');notesIn(1.2,15);const musicOff=started;notesIn(2,15);assert(started-musicOff<4,'music toggle silences the beat (crowd only on events)');
game.cuts++;game.nearMisses++;game.event++;game.eventKind='goal';const fxBefore=started;notesIn(.1,15);assert(started>fxBefore,'near-miss whoosh and goal roar play');
track.dispose();console.log('PASS runner soundtrack: frame-scheduled, pace tempo, voice cap, pause/full-time/mute silence, event layers');
