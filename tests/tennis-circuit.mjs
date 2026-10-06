import '../scripts/register-local-ts.mjs';
import assert from 'node:assert/strict';
import {createTennis,resetTennis,beginTennis,tickTennis,requestTennisKick,TENNIS_COURTS,tennisLanding,setTennisTarget} from '../lib/games/soccerTennis.ts';
const advance=(s,seconds,hz=120)=>{for(let i=0;i<Math.round(seconds*hz);i++)tickTennis(s,1/hz);};
const run=createTennis();
for(let level=1;level<=TENNIS_COURTS.length;level++){
 assert.equal(run.level,level);beginTennis(run);assert(run.message.includes(TENNIS_COURTS[level-1].name));
 run.phase='over';run.winner='rival';resetTennis(run);assert.equal(run.level,level,'loss preserves practice tier');
 run.phase='over';run.winner='you';resetTennis(run);assert.equal(run.level,Math.min(TENNIS_COURTS.length,level+1));assert.equal(run.courtsWon,level);
}
assert.equal(createTennis(1,100).level,TENNIS_COURTS.length);assert.equal(createTennis(1,-10).level,1);
for(const hz of [30,60,120])for(let level=1;level<=TENNIS_COURTS.length;level++){
 const s=createTennis(47,level);beginTennis(s);const drill=TENNIS_COURTS[level-1].style==='drill';
 if(drill){advance(s,1.2,hz);assert.equal(s.ball.last,'rival','drill feeder serves every ball');}
 else{requestTennisKick(s);advance(s,1/hz,hz);
 const error=[s.aiReadErrorX,s.aiReadErrorY];assert(Math.abs(error[0])<=TENNIS_COURTS[level-1].error/2);
 while(s.rally===1&&s.phase==='rally'&&s.clock<4){tickTennis(s,1/hz);assert.deepEqual([s.aiReadErrorX,s.aiReadErrorY],error,'read error stays committed through incoming flight');}
 assert(s.rally>=2,`court ${level} returns reachable serve at ${hz}Hz`);}
 // A deterministic input driver covers full matches without assuming it wins.
 for(let i=0;i<480*hz&&s.phase!=="over";i++){
  if(s.phase==='serve')requestTennisKick(s);
  if(s.phase==='rally'&&s.ball.last==='rival'){const land=tennisLanding(s);setTennisTarget(s,land.x,land.y);requestTennisKick(s);}
  tickTennis(s,1/hz);assert(Number.isFinite(s.ball.x+s.ball.y+s.ball.z));
 }
 assert.equal(s.phase,'over',`court ${level} remains completable at ${hz}Hz`);
}
const pressured=createTennis(47,4);pressured.phase='rally';pressured.rally=2;
Object.assign(pressured.ball,{x:1,y:-5.3,z:.5,vx:0,vy:0,vz:0,last:'you',crossed:true});
tickTennis(pressured,1/120);assert.equal(pressured.lastShot,'lob','stretched advanced rival buys recovery time instead of attacking blindly');
const recoveries=[createTennis(47,1),createTennis(47,4)];
for(const s of recoveries){s.phase='rally';Object.assign(s.ball,{x:3,y:2,z:4,vx:0,vy:0,vz:0,last:'rival',crossed:true});tickTennis(s,1/120);assert(s.rival.targetX>0,'recovery shades toward possible return angles');}
assert(recoveries[1].rival.targetY>recoveries[0].rival.targetY+.8,'net-pressure court leaves deep space for a deliberate lob');
let aerials=0;
for(let seed=1;seed<=20;seed++){
 const s=createTennis(seed*7919,4);s.phase="rally";s.aiSlam=true; // spread seeds: small LCG seeds give correlated first draws
 Object.assign(s.ball,{x:.1,y:-5.3,z:1.8,vx:0,vy:0,vz:-.1,last:'you',crossed:true});tickTennis(s,1/120);
 if(s.lastShot==='scissor'){aerials++;assert(s.rival.kickSpan>.8,'rival aerial also has committed recovery');}
}
assert(aerials>0&&aerials<20,'late rival varies aerial choices without spamming the move');
function tape(seed,height,pace){const s=createTennis(seed);s.phase='rally';s.aiReaction=99;Object.assign(s.ball,{x:0,y:.015,z:height,vx:0,vy:-pace,vz:0,last:'you',crossed:false});tickTennis(s,1/120);return s.ball;}
const skim=tape(1,1.23,12),skim2=tape(100,1.23,12),low=tape(1,1.04,2);
assert(skim.crossed&&skim.vy<0,'high fast graze continues over tape');
assert(low.netHit&&low.vy>0,'low soft clip falls back');
assert.equal(skim.vy,skim2.vy,'same physical tape contact is independent of random seed');
console.log('TENNIS_CIRCUIT_PASS six-stop ladder, fair retry, capped advancement, stable reads, cadence, completed matches, physical tape clips');
