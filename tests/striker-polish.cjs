// Island Strikers Oct 4 polish: keeper dive/catch, interception read, cover role, overhit, near miss, focus habits, goal moment.
const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict'),m={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/arcade/strikerMatch.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math});
const {createStrikerMatch,strikerInput,STRIKER_FOCUS,STRIKER_GOAL_PAUSE,STRIKER_HIT_STOP}=m.exports;
const fresh=(level=1)=>{const g=createStrikerMatch(),s=g.state;s.level=level;g.reset();return {g,s,i:strikerInput()};};
assert.equal(STRIKER_FOCUS.length,4);assert(STRIKER_GOAL_PAUSE<2,'restart stays inside the two-second restart contract');
for(const hz of [30,60,120]){
 // Keeper reads a corner shot after the reaction delay and dives toward the crossing point.
 {const {g,s,i}=fresh(1),k=s.players[7];for(const p of s.players)if(!p.keeper)p.stun=9;Object.assign(k,{x:22.4,z:0});const sx=12,sz=-2,dx=27-sx,dz=3.8-sz,l=Math.hypot(dx,dz);
  Object.assign(s.ball,{owner:-1,x:sx,z:sz,y:.3,vx:dx/l*32,vz:dz/l*32,vy:3,lock:.2,lastTeam:0});s.lastKicker=0;k.react=.1;
  let dived=false;for(let n=0;n<hz*.5;n++){g.step(1/hz,i);if(k.dive>0){dived=true;assert(k.vz>0,'dives toward the shot side');break;}}assert(dived,`keeper dives at ${hz}Hz`);}
 // A soft central ball is held, not parried; the keeper then distributes to a teammate.
 {const {g,s,i}=fresh(1),k=s.players[7];for(const p of s.players)if(!p.keeper)p.stun=0.5;Object.assign(k,{x:22.5,z:0,think:10});Object.assign(s.ball,{owner:-1,x:22,z:0,y:.6,vx:6,vz:0,vy:0,lock:0,lastTeam:0});
  g.step(1/hz,i);assert.equal(s.ball.owner,7,'soft shot caught');assert(k.caught);for(let n=0;n<hz*2&&s.ball.owner===7;n++)g.step(1/hz,i);assert.notEqual(s.ball.owner,7,'keeper releases the ball');}
 // Overhit from range sails over the bar and teaches placement.
 {const {g,s,i}=fresh(1);for(const p of s.players)if(p.team===1)p.stun=9;Object.assign(s.players[0],{x:2,z:0});i.shoot=true;i.power=1;g.step(1/hz,i);i.shoot=false;assert(s.overhit);
  const before=s.nearMiss;for(let n=0;n<hz*1.5&&s.nearMiss===before&&s.score[0]===0;n++)g.step(1/hz,i);assert.equal(s.score[0],0,'blasted from range goes over');assert(s.nearMiss>before,'near miss counted');assert.match(s.message,/power/i);}
 // A controlled shot from the same spot stays under the bar.
 {const {g,s,i}=fresh(1);for(const p of s.players)if(!(p.team===0&&p.id===0))p.stun=9;Object.assign(s.players[0],{x:12,z:0});i.shoot=true;i.power=.6;g.step(1/hz,i);i.shoot=false;assert(!s.overhit);for(let n=0;n<hz;n++)g.step(1/hz,i);assert.equal(s.score[0],1,'placed shot scores');}
 // Goal moment: hit-stop freezes bodies, then the scorer celebrates toward the corner; ball rolls into the net.
 {const {g,s,i}=fresh(1);Object.assign(s.players[1],{x:18,z:2});s.lastKicker=1;Object.assign(s.ball,{owner:-1,x:24.8,z:1,y:.5,vx:30,vz:0,vy:0,lock:1,lastTeam:0});g.step(1/hz,i);
  assert.equal(s.score[0],1);assert.equal(s.scorer,1);assert(s.hitStop>0&&s.crowd>1);const frozen=s.players[1].x;g.step(Math.min(STRIKER_HIT_STOP*.5,1/hz),i);assert.equal(s.players[1].x,frozen,'hit-stop holds the frame');
  for(let n=0;n<hz*.8;n++)g.step(1/hz,i);assert(s.players[1].x>frozen&&s.players[1].z>2,'scorer runs to the corner');assert(Math.abs(s.ball.x)>25,'ball inside the net');}
}
// Interception: Blue reads a slow pass across a defender in round 4, never in round 1.
for(const level of [1,4]){const {g,s,i}=fresh(level);Object.assign(s.players[0],{x:-12,z:-10});Object.assign(s.players[1],{x:10,z:9});Object.assign(s.players[5],{x:2.5,z:6,think:9});Object.assign(s.players[4],{x:-14,z:-2});Object.assign(s.players[6],{x:16,z:-11});
 s.selected=1;s.lastPasser=0;s.passAge=0;Object.assign(s.ball,{owner:-1,x:-11.3,z:-9.4,y:.3,vx:20,vz:17.5,vy:.4,lock:0,lastTeam:0});let read=false;for(let n=0;n<60;n++){g.step(1/60,i);if(s.interceptor===5)read=true;}
 assert.equal(read,level===4,`interception read in round ${level}`);}
// Pressure and cover: in round 3+ a second Blue defender sits goal-side of the presser.
{const {g,s,i}=fresh(3);Object.assign(s.players[0],{x:0,z:0});Object.assign(s.ball,{owner:0,lock:0});g.step(1/60,i);assert(s.presser>=4&&s.cover>=4&&s.presser!==s.cover,'presser and cover assigned');
 const {g:g1,s:s1,i:i1}=fresh(1);g1.step(1/60,i1);assert.equal(s1.cover,-1,'round 1 has no cover');}
// Focus habit: round 3 counts a switch of play across the pitch.
{const {g,s,i}=fresh(3);for(const p of s.players)if(p.team===1)p.stun=9;Object.assign(s.players[0],{x:-10,z:-9});Object.assign(s.players[2],{x:-6,z:9});Object.assign(s.players[1],{x:-20,z:-12});s.ball.owner=0;i.z=1;i.pass=true;g.step(1/60,i);i.pass=false;i.z=0;
 for(let n=0;n<180&&s.ball.owner<0;n++)g.step(1/60,i);assert.equal(s.ball.owner,2);assert.equal(s.focus,1,'switch of play counted');assert.match(s.message,/Switched play/);}
// Pass preview warns when a defender sits in the lane.
{const {g,s,i}=fresh(1);Object.assign(s.players[0],{x:-10,z:0});Object.assign(s.players[1],{x:0,z:0});Object.assign(s.players[2],{x:-10,z:12,stun:9});Object.assign(s.players[4],{x:-5,z:0,stun:9});i.x=1;g.step(1/60,i);assert(s.passRisk>.3,'risky lane flagged');}
console.log('PASS Strikers polish: keeper dive/catch/distribute, overhit and near miss, hit-stop celebration, round-gated interception, pressure+cover, focus habit, lane risk at 30/60/120Hz');
