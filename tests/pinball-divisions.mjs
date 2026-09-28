import '../scripts/register-local-ts.mjs';
import assert from 'node:assert/strict';
import {createPinballState,launchPinball,stepPinball,pinballDivision,pinballReadyFoot} from '../lib/games/soccerPinball.ts';
const idle={left:false,right:false};
function advance(s,time,hz=120,input=idle){for(let n=0;n<Math.round(time*hz);n++)stepPinball(s,input,1/hz);}
function goal(s,x=180){if(s.phase==='ready')launchPinball(s);Object.assign(s.ball,{x,y:49,vx:0,vy:-400});advance(s,.05);assert.equal(s.phase,'goal');}
for(const hz of [30,60,120]){
 const s=createPinballState();
 for(let n=0;n<6;n++){goal(s);advance(s,1.6,hz);assert.equal(s.level,Math.min(4,1+Math.floor((n+1)/2)));assert.equal(s.defs,Math.min(3,n+2));}
 assert.equal(pinballDivision(s).name,'Complete Forward');
 s.balls=2;s.moveTime=8;launchPinball(s);s.moveTime=8;goal(s,118);
 assert.equal(s.lastChallengeBonus,600);assert.equal(s.balls,3);assert.equal(s.challengeBall,true);
 advance(s,1.6,hz);launchPinball(s);s.moveTime=8;goal(s,118);assert.equal(s.lastChallengeBonus,0,'challenge cannot be farmed again');
}
const corner=createPinballState();corner.level=2;corner.balls=1;goal(corner);assert.equal(corner.lastChallengeBonus,0,'central finish still scores but does not complete placement objective');assert.equal(corner.lastGoalPoints,500);
advance(corner,1.6);corner.level=2;goal(corner,242);assert.equal(corner.lastChallengeBonus,250);assert.equal(corner.balls,2);
for(const [x,vx] of [[29,-750],[330,750]]){
 const bank=createPinballState();bank.level=3;launchPinball(bank);Object.assign(bank.ball,{x,y:250,vx,vy:0});advance(bank,.02);assert(bank.banked,'both playable side rails register a deliberate bank');goal(bank);assert.equal(bank.lastChallengeBonus,400);
}
const reset=createPinballState();launchPinball(reset);reset.banked=true;Object.assign(reset.ball,{x:145,y:540,vx:0,vy:100});advance(reset,.075,120,{left:true,right:false});assert.equal(reset.banked,false,'new attacking strike begins a new shot');
const release=createPinballState();launchPinball(release);release.left=1;Object.assign(release.ball,{x:145,y:510,vx:0,vy:400});advance(release,.075);assert.equal(release.sfx.flipper,0,'lowering flipper cannot award an attacking combination');
const commitment=createPinballState();launchPinball(commitment);const ai=commitment.defenderAI[0];Object.assign(ai,{block:.3,think:0,target:15});Object.assign(commitment.ball,{x:70,y:350,vx:0,vy:0});advance(commitment,.05);assert.equal(ai.target,15,'extended foot cannot magically change its intercept target');
console.log('PASS pinball divisions, optional placement/bank/combo challenges, capped rewards, flipper release and committed defending');

const timing=createPinballState();launchPinball(timing);
Object.assign(timing.ball,{x:130,y:480,vx:0,vy:350});assert.equal(pinballReadyFoot(timing),0,'left drop lights left flipper');
Object.assign(timing.ball,{x:230,y:480});assert.equal(pinballReadyFoot(timing),1,'right drop lights right flipper');
timing.ball.vy=-350;assert.equal(pinballReadyFoot(timing),-1,'rising shot never asks for a premature strike');
Object.assign(timing.ball,{x:180,vy:350});assert.equal(pinballReadyFoot(timing),-1,'centre drain does not pretend either flipper reaches it');
timing.phase='ready';assert.equal(pinballReadyFoot(timing),-1,'ready table does not flash a timing cue');
console.log('PASS passive flipper timing: left/right drops, rising ball, drain and ready exclusions');
