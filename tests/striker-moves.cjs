// Island Strikers moves (G1, Oct 4 2026): skill moves that beat a committed tackle, fatigue, the timed tackle on a
// heavy touch, chip over a rushing keeper, aftertouch curl, lofted through ball over the press, headers.
const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict'),m={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/arcade/strikerMatch.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math});
const {createStrikerMatch,strikerInput,STRIKER_SKILLS,STRIKER_HEAVY_TOUCH}=m.exports;
const fresh=(level=1)=>{const g=createStrikerMatch(),s=g.state;s.level=level;g.reset();return{g,s,i:strikerInput()};};
const carrier=(s,x=0,z=0)=>{const p=s.players[0];Object.assign(p,{x,z,vx:0,vz:0,yaw:Math.PI/2});Object.assign(s.ball,{owner:0,x:x+.82,z,lock:0});s.selected=0;return p;};
for(const hz of [30,60,120]){const dt=1/hz;
 // Stick relative to facing picks the move.
 for(const [x,z,kind] of [[-1,0,'dragBack'],[0,1,'stepover'],[0,-1,'stepover'],[0,0,'roulette'],[1,0,'roulette']]){const {g,s,i}=fresh();for(const p of s.players)if(p.team===1)p.stun=9;const p=carrier(s);i.skill=true;i.x=x;i.z=z;g.step(dt,i);assert.equal(p.skillKind,kind,`stick ${x},${z}`);assert(p.skill>0);assert.equal(s.eventKind,'skill');}
 // Step-over goes to the side the stick points; the ball stays with the carrier through the move.
 {const {g,s,i}=fresh();for(const p of s.players)if(p.team===1)p.stun=9;const p=carrier(s);i.skill=true;i.z=1;g.step(dt,i);i.skill=false;for(let n=0;n<hz*.7;n++)g.step(dt,i);assert(p.z>.8,'stepover bursts to the stick side');assert.equal(s.ball.owner,0);}
 // Drag-back turns the carrier around.
 {const {g,s,i}=fresh();for(const p of s.players)if(p.team===1)p.stun=9;const p=carrier(s);i.skill=true;i.x=-1;g.step(dt,i);i.skill=false;i.x=0;for(let n=0;n<hz*.7;n++)g.step(dt,i);assert(Math.cos(p.yaw-Math.PI/2)<-.9,'drag-back faces the other way');assert.equal(s.ball.owner,0);}
 // A committed tackle: without a skill the carrier loses it; a skill started as it comes in beats it.
 for(const useSkill of [false,true]){const {g,s,i}=fresh(4);for(const p of s.players)if(p.id!==0&&p.id!==4)p.stun=99;const p=carrier(s);const d=s.players[4];Object.assign(d,{x:2.4,z:0,think:0});
  let fired=false;for(let n=0;n<hz*1.2;n++){if(useSkill&&!fired&&d.windup>0&&d.windup<.12){i.skill=true;i.z=1;fired=true;}else i.skill=false;g.step(dt,i);if(d.tackle<=0&&d.cooldown>0&&n>2)break;}
  for(let n=0;n<hz*.4;n++){i.skill=false;g.step(dt,i);}
  if(useSkill){assert.equal(s.ball.owner,0,`skill keeps the ball at ${hz}Hz`);assert(s.beatEvent>=1||d.cooldown>0,'tackle beaten or missed');}else assert.notEqual(s.ball.owner,0,'no skill: tackled');}
 // Spamming tires the legs: the fourth quick skill is refused.
 {const {g,s,i}=fresh();for(const p of s.players)if(p.team===1)p.stun=99;const p=carrier(s);let done=0;for(let n=0;n<hz*2.6;n++){i.skill=p.skill<=0;g.step(dt,i);i.skill=false;if(s.eventKind==='tired')break;}assert.equal(s.eventKind,'tired');assert.equal(p.skillCount,3);}
 // Timed tackle: step in during the carrier's heavy touch for a clean steal; otherwise it is an ordinary slide.
 for(const heavy of [true,false]){const {g,s,i}=fresh();for(const p of s.players)if(p.team===1&&p.id!==4)p.stun=99;const b=s.players[4];Object.assign(b,{x:0,z:0,yaw:-Math.PI/2,heavy:heavy?STRIKER_HEAVY_TOUCH*.6:0,touchCycle:9});Object.assign(s.ball,{owner:4,x:-.82,z:0,lock:0});
  const me=s.players[0];Object.assign(me,{x:-2.6,z:0,cooldown:0});s.selected=0;i.pass=true;g.step(dt,i);i.pass=false;
  if(heavy){assert.equal(s.ball.owner,0,'perfect tackle steals it');assert.equal(s.perfectTackle,1);assert.equal(s.eventKind,'steal');}else{assert.equal(s.perfectTackle,0);assert(me.tackle>0,'ordinary slide');}}
 // Blue carriers keep a heavy-touch rhythm (readable, not random).
 {const {g,s,i}=fresh();const b=s.players[4];for(const p of s.players)if(p.id!==4)p.stun=99;Object.assign(b,{x:20,z:0,touchCycle:.2,think:9});Object.assign(s.ball,{owner:4,x:19.2,z:0,lock:0});let seen=0,was=false;for(let n=0;n<hz*3;n++){g.step(dt,i);if(b.heavy>0&&!was)seen++;was=b.heavy>0;}assert(seen>=2,'heavy touches repeat');}
}
// Chip: over a keeper who rushed out; the ball clears the keeper's reach at their position.
{const {g,s,i}=fresh();for(const p of s.players)if(!p.keeper)p.stun=99;const k=s.players[7];Object.assign(k,{x:17,z:0,think:99});const p=carrier(s,11,0);i.shoot=true;i.sprint=true;i.power=.6;g.step(1/60,i);i.shoot=i.sprint=false;assert(s.chip,'sprint + shoot chips');
 let over=0;for(let n=0;n<120&&s.score[0]===0;n++){g.step(1/60,i);if(Math.abs(s.ball.x-k.x)<.5)over=Math.max(over,s.ball.y);}assert(over>2.4,`chip clears the keeper (${over.toFixed(2)})`);assert.equal(s.score[0],1,'chip over a rushing keeper scores');}
// Aftertouch curl bends a shot toward the held side.
{const bendZ=(hold)=>{const {g,s,i}=fresh();for(const p of s.players)p.stun=99;s.players[0].stun=0;carrier(s,8,0);i.shoot=true;i.power=.5;g.step(1/60,i);i.shoot=false;i.z=hold;for(let n=0;n<20;n++)g.step(1/60,i);return s.ball.vz;};
 assert(bendZ(1)>bendZ(0)+3,'holding down after the strike curls it');assert(bendZ(-1)<bendZ(0)-3,'holding up curls it the other way');}
// Lofted through ball: Through + Sprint flies over a defender standing in the lane.
{const {g,s,i}=fresh(2);for(const p of s.players)if(p.team===1&&p.id!==5)p.stun=99;carrier(s,-6,0);Object.assign(s.players[1],{x:8,z:0});s.players[2].x=-20;Object.assign(s.players[5],{x:1,z:0,think:99});
 i.through=true;i.sprint=true;i.x=1;g.step(1/60,i);i.through=i.sprint=false;i.x=0;assert(s.ball.vy>5,'lofted');let touchedBy5=false;for(let n=0;n<90&&s.ball.owner<0;n++){g.step(1/60,i);}assert.notEqual(s.ball.owner,5,'flies over the press');}
// Header: a high ball met with a first-time shot becomes a header.
{const {g,s,i}=fresh();for(const p of s.players)if(p.team===1)p.stun=99;const r=s.players[1];Object.assign(r,{x:15,z:0});s.selected=1;s.lastPasser=0;Object.assign(s.ball,{owner:-1,x:13.6,z:0,y:1.6,vx:12,vz:0,vy:0,lock:0,lastTeam:0});
 i.shoot=true;g.step(1/120,i);i.shoot=false;for(let n=0;n<60&&s.shots[0]===0;n++)g.step(1/120,i);assert.equal(s.shots[0],1);assert(r.header>0,'header pose');assert.match(s.message,/HEADER/);}
console.log('PASS Strikers moves: skill choice/paths, beat a committed tackle, fatigue, timed steal on heavy touch, chip, curl, lofted through ball, header at 30/60/120Hz');
