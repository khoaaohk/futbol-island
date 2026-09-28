const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict'),m={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/arcade/strikerMatch.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math});
const {createStrikerMatch,strikerInput,STRIKER_ROUNDS}=m.exports;
assert.equal(STRIKER_ROUNDS.length,4);
for(const hz of [30,60,120]){
 const g=createStrikerMatch(),s=g.state,i=strikerInput();
 g.reset(true);assert.equal(s.level,1,'cannot skip a live match');
 s.finished=true;s.score[1]=1;g.reset(true);assert.equal(s.level,1,'loss retries same round');
 s.finished=true;g.reset(true);assert.equal(s.level,1,'draw retries same round');
 for(let round=2;round<=5;round++){s.finished=true;s.score[0]=2;s.score[1]=1;g.reset(true);assert.equal(s.level,Math.min(4,round),'win advances with bounded finale');assert.deepEqual(Array.from(s.score),[0,0]);assert.equal(s.time,0);assert(!s.finished);}
 g.reset();assert.equal(s.level,4,'restart preserves chosen difficulty');
 const p=s.players[4];Object.assign(s.players[0],{x:0,z:0});Object.assign(s.ball,{owner:0,x:.82,z:0,lock:0});Object.assign(p,{x:2.6,z:0,think:0});
 g.step(1/hz,i);assert(p.windup>0,'defender telegraphs');const aim=[p.tackleX,p.tackleZ];
 s.players[0].z=6;s.ball.z=6;
 for(let n=0;n<hz&&p.tackle<=0;n++)g.step(1/hz,i);
 assert(p.tackle>0,'telegraph resolves into challenge');assert.deepEqual([p.tackleX,p.tackleZ],aim,'sidestep cannot redirect committed tackle');assert(p.vz<0,'challenge goes toward original lane, not relocated carrier');
 for(let n=0;n<hz/3;n++)g.step(1/hz,i);
 assert.equal(p.tackle,0);assert(p.cooldown>.35,'miss leaves recoverable opening');assert.equal(s.ball.owner,0,'evading a committed challenge preserves possession');
 p.jockey=1;p.tackleX=9;p.tackleZ=3;g.reset();assert.equal(p.jockey+p.tackleX+p.tackleZ,0,'reset clears tactical pose and target');
 // Crossing height, not end-of-step height, decides a rising/falling shot.
 for(const rising of [true,false]){
  g.reset();for(const q of s.players)q.stun=10;
  Object.assign(s.ball,{owner:-1,x:24.99,z:0,y:rising?2.79:2.81,vx:40,vz:0,vy:rising?5:-5,lock:1});
  g.step(1/hz,i);assert.equal(s.score[0],rising?1:0,'crossbar judged at plane crossing');
 }
}
// Higher rounds press more quickly, without making an opening challenge instant.
function warning(level){const g=createStrikerMatch(),s=g.state;s.level=level;Object.assign(s.players[0],{x:0,z:0});Object.assign(s.ball,{x:.82,z:0,owner:0});Object.assign(s.players[4],{x:2.6,z:0,think:0});g.step(1/120,strikerInput());return s.players[4].windup;}
assert(warning(4)<warning(1));assert(warning(4)>.25,'final still gives readable anticipation');
console.log('PASS Strikers depth: win-only rounds, final cap, committed sidestep, recovery, reset, swept crossbar at 30/60/120Hz');
function tactical(level,travel){const g=createStrikerMatch(),s=g.state;s.level=level;s.selected=1;for(const p of s.players)Object.assign(p,{x:p.team?15:-10,z:p.id%4===1?-10:10,vx:0,vz:0,think:10});Object.assign(s.players[0],{x:0,z:0});Object.assign(s.players[1],{x:8,z:-10});Object.assign(s.players[4],{x:2,z:0});Object.assign(s.players[5],{x:10,z:-5});Object.assign(s.players[6],{x:12,z:8});Object.assign(s.ball,{owner:travel?-1:0,x:.82,z:0,vx:0,vz:0,lock:10});s.lastPasser=travel?0:-1;g.step(1/120,strikerInput());return s.players;}
const easy=tactical(1,true),press=tactical(2,true),final=tactical(4,true);
assert(press[5].vz<easy[5].vz-.05,'press round closes receiver lane while pass travels');assert(final[5].vz<easy[5].vz-.05,'final includes receiver press');assert(press[6].vz<0,'third defender retains cover rather than joining receiver press');
const marks=tactical(1,false),block=tactical(3,false);
assert(block[5].vz>marks[5].vz+.05,'block round protects central space instead of following wide mark');assert(block[6].vz<marks[6].vz-.05,'opposite cover tucks inward');
console.log('PASS tactical rounds: receiver pressure, third-player cover, compact defensive block');
