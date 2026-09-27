import './register-local-ts.mjs';
import assert from 'node:assert/strict';
import {createPinballState,launchPinball,stepPinball,pinballDefenders,PINBALL_STEP} from '../lib/games/soccerPinball.ts';
const idle={left:false,right:false};
function advance(s,seconds,input=idle){for(let i=0;i<Math.round(seconds/PINBALL_STEP);i++)stepPinball(s,input,PINBALL_STEP);}
function active(x,y,vx,vy){const s=createPinballState();launchPinball(s);Object.assign(s.ball,{x,y,vx,vy});return s;}
const launch=createPinballState();assert.equal(launchPinball(launch),true);assert.equal(launchPinball(launch),false);advance(launch,.1);assert.ok(launch.ball.y<490,'launch travels up the table');
const wall=active(29,400,-750,0);advance(wall,.025);assert.ok(wall.ball.x>=27&&wall.ball.vx>0,'fast ball reflects off side wall');
const top=active(90,64,0,-740);advance(top,.025);assert.ok(top.ball.vy>0&&top.ball.y>=57,'fast ball cannot tunnel through top rail');
const d=pinballDefenders(0)[0],bumper=active(d.x,d.y+30,0,-400);advance(bumper,.05);assert.ok(bumper.ball.vy>0&&bumper.score===10,'defender reflects and scores once');
const keeper=active(180,108,0,-500);advance(keeper,.04);assert.ok(keeper.ball.vy>0,'keeper saves a shot aimed at their body');
const dive=active(218,220,0,-250);advance(dive,.15);assert.ok(dive.keeper>187,'keeper reacts laterally to an incoming shot');
const goal=active(180,49,0,-400);advance(goal,.05);assert.equal(goal.goals,1);assert.equal(goal.score,500);assert.equal(goal.phase,'goal');assert.equal(goal.balls,3);advance(goal,1.6);assert.equal(goal.phase,'ready');assert.equal(goal.goals,1,'goal counted exactly once');
const flip=active(145,540,0,100);advance(flip,.075,{left:true,right:false});assert.ok(flip.ball.vy< -300,'active left flipper sends the ball upward');
const right=active(215,540,0,100);advance(right,.075,{left:false,right:true});assert.ok(right.ball.vy< -300,'active right flipper sends the ball upward');
const both=active(180,400,0,0);advance(both,.1,{left:true,right:true});assert.equal(both.left,1);assert.equal(both.right,1,'simultaneous input raises both');advance(both,.15);assert.equal(both.left,0);assert.equal(both.right,0,'released inputs lower both');
const drain=active(180,625,0,400);advance(drain,.05);assert.equal(drain.balls,2);assert.equal(drain.phase,'lost');advance(drain,1.1);assert.equal(drain.phase,'ready');
for(let i=0;i<2;i++){launchPinball(drain);Object.assign(drain.ball,{x:180,y:625,vx:0,vy:400});advance(drain,1.2);}assert.equal(drain.balls,0);assert.equal(drain.phase,'over');assert.equal(launchPinball(drain),false);const restarted=createPinballState();assert.equal(restarted.phase,'ready');assert.equal(restarted.score,0);assert.equal(restarted.goals,0);assert.equal(restarted.balls,3);assert.equal(launchPinball(restarted),true,'a fresh match launches after game over');
const a=createPinballState(),b=createPinballState();launchPinball(a);launchPinball(b);for(let i=0;i<120;i++)stepPinball(a,idle,1/120);for(let i=0;i<30;i++)stepPinball(b,idle,1/30);assert.ok(Math.hypot(a.ball.x-b.ball.x,a.ball.y-b.ball.y)<.001,'render rate does not change physics');
for(let seed=0;seed<20;seed++){const s=createPinballState();for(let i=0;i<3600;i++){if(s.phase==='ready')launchPinball(s,(seed%7)/6);stepPinball(s,{left:Math.sin(i*.13+seed)>0,right:Math.sin(i*.11+seed)>.2},1/120);assert.ok(Number.isFinite(s.ball.x+s.ball.y+s.ball.vx+s.ball.vy),'stress run remains finite');assert.ok(s.balls>=0&&s.balls<=3);}}
console.log('Soccer Pinball: launch, rails, defenders, keeper, goals, both flippers, multi-input, three-ball drain, restart, frame-rate independence and 20 deterministic stress runs passed.');
// Placement is a football skill: the post pockets reward precision, while a
// straight-through goal preserves the original 500-point baseline.
for(const x of[118,242]){const s=active(x,49,0,-400);advance(s,.05);assert.equal(s.score,650);assert.equal(s.cue,'corner');assert.equal(s.lastGoalPoints,650);}
const smoothing=active(218,220,0,-250);advance(smoothing,.03);assert.ok(smoothing.keeperVelocity>0&&smoothing.keeperVelocity<40,'keeper accelerates instead of teleporting into full speed');advance(smoothing,.12);assert.equal(smoothing.keeperDive,0,'distant approach uses footwork rather than permanent dive lean');assert.ok(smoothing.keeperVelocity<=107,'ordinary tracking keeps bounded speed');
const diving=active(216,150,0,-500);advance(diving,.09);assert.ok(diving.keeperCommit>0&&diving.keeperDive>.2,'close shot triggers committed dive');const direction=diving.keeperDirection;diving.ball.x=145;advance(diving,.04);assert.equal(diving.keeperDirection,direction,'dive cannot reverse in midair');advance(diving,.7);assert(Number.isFinite(diving.keeperDive));
const blocking=active(185,370,0,-350);advance(blocking,.06);assert(blocking.defenderAI[0].block>0,'approaching ball triggers foot block before contact');assert(blocking.defenderAI[0].cooldown>0,'block has a recovery window');assert(Math.abs(blocking.defenderAI[0].offset)>0,'defender tracks the incoming lane');
const scratch=createPinballState(),scratchArray=scratch.defenders,scratchBody=scratch.defenders[0];launchPinball(scratch);advance(scratch,.2);assert.equal(scratch.defenders,scratchArray);assert.equal(scratch.defenders[0],scratchBody,'collision body scratch reused across substeps');
const allocationOutput=pinballDefenders(0);for(const count of[1,2,3]){const actual=pinballDefenders(12,count,.35,count-1,allocationOutput),expected=pinballDefenders(12,count,.35,count-1);assert.deepEqual(actual,expected,'pooled patrol positions match public renderer positions during entrances');}
const saved=active(180,108,0,-500);advance(saved,.04);assert.equal(saved.cue,'save');assert.ok(saved.cueTime>0);
const strike=active(145,540,0,100);advance(strike,.04,{left:true,right:false});assert.equal(strike.cue,'strike');
console.log('Pinball placement bonus, keeper acceleration and 480 Hz pose, reused collision bodies, defender entrances and shot coaching passed.');

const grazing=active(27,250,-4,400);advance(grazing,.006);assert.ok(Math.abs(grazing.ball.omega)<1,'a grazing rail contact cannot invent spin beyond its friction impulse');

const combination=active(145,540,0,100);advance(combination,.075,{left:true,right:false});assert.equal(combination.combination,1);advance(combination,.15);Object.assign(combination.ball,{x:215,y:540,vx:0,vy:100});const beforeCombination=combination.score;advance(combination,.075,{left:false,right:true});assert.equal(combination.combination,2);assert.equal(combination.score-beforeCombination,50,'alternating flippers earns a combination reward');advance(combination,.15);Object.assign(combination.ball,{x:215,y:540,vx:0,vy:100});advance(combination,.075,{left:false,right:true});assert.equal(combination.combination,1,'same-foot return restarts the combination');

const built=active(145,540,0,100);advance(built,.075,{left:true,right:false});assert.equal(built.moveTime,0);advance(built,.15);Object.assign(built.ball,{x:215,y:540,vx:0,vy:100});advance(built,.075,{left:false,right:true});assert.ok(built.moveTime>13,'two feet open a finishing window');Object.assign(built.ball,{x:118,y:49,vx:0,vy:-400});advance(built,.05);assert.equal(built.lastGoalBonus,750);assert.equal(built.lastGoalPoints,1400);assert.equal(built.moves,1);assert.equal(built.moveTime,0,'scoring consumes the chance');
const expired=active(180,49,0,-400);expired.moveTime=.001;advance(expired,.05);assert.equal(expired.lastGoalBonus,0,'expired chance cannot score a bonus');assert.equal(expired.lastGoalPoints,500);
const nextMove=active(180,49,0,-400);nextMove.moves=2;nextMove.moveTime=5;advance(nextMove,.05);assert.equal(nextMove.lastGoalPoints,1750,'mastery increases move value');
console.log('Pinball build-switch-finish window, expiry, corner conversion and mastery rewards passed.');

const contact=active(29,400,-750,0);advance(contact,.01);assert.ok(contact.ball.contact>.7,'hard contact retains a readable impact pulse');assert.equal(contact.ball.contactX,1);assert.equal(contact.ball.contactY,0);Object.assign(contact.ball,{x:70,y:390,vx:0,vy:0});advance(contact,.15);assert.equal(contact.ball.contact,0,'contact pulse expires without new impact');
console.log('Pinball directional contact pulse and finite recovery passed.');

const recovery=createPinballState();recovery.phase='goal';recovery.timer=1;recovery.bumperCooldown[0]=.16;recovery.flipperCooldown[0]=.1;advance(recovery,.2);assert.equal(recovery.bumperCooldown[0],0);assert.equal(recovery.flipperCooldown[0],0,'contact recovery continues through goal pause');

// A torso hit opens a temporary lane; a committed boot contact keeps its defender active.
const bodyTarget=pinballDefenders(0)[0],bodyHit=active(bodyTarget.x,bodyTarget.y+22,0,-400);bodyHit.defenderAI[0].cooldown=1;
advance(bodyHit,.03);assert(bodyHit.defenderAI[0].dazed>1.9,'missed foot block dazes the defender');assert.equal(bodyHit.defenderAI[0].block,0);assert.equal(bodyHit.cue,'dazed');
const down=bodyHit.defenderAI[0];Object.assign(bodyHit.ball,{x:down.hitX,y:down.hitY+22,vx:0,vy:-400});const hitCount=bodyHit.hitId;advance(bodyHit,.06);assert.equal(bodyHit.hitId,hitCount,'downed defender cannot block or take repeated hits');assert(bodyHit.ball.vy<0,'lane stays open while defender is down');
bodyHit.phase='ready';advance(bodyHit,2.1);assert.equal(down.dazed,0,'defender recovers even between balls');
const footHit=active(bodyTarget.x,bodyTarget.y+30,0,-400);Object.assign(footHit.defenderAI[0],{block:.2,cooldown:1,aim:0});advance(footHit,.02);assert.equal(footHit.defenderAI[0].dazed,0,'successful foot block avoids knockdown');assert.equal(footHit.cue,'block');assert(footHit.ball.vy>0);
const exemptKeeper=active(180,108,0,-500);advance(exemptKeeper,.04);assert.equal(exemptKeeper.cue,'save');assert(exemptKeeper.defenderAI.every(ai=>ai.dazed===0),'keeper saves never daze outfield players');
console.log('Pinball boot block versus body hit, temporary open lane, recovery and keeper exemption passed.');

// A keeper pinned at a post cannot contribute fictitious lateral impulse.
const postKeeper=active(290,400,0,0);Object.assign(postKeeper,{keeper:220,keeperVelocity:100,keeperDirection:1,keeperCommit:.65});stepPinball(postKeeper,idle,PINBALL_STEP);assert.equal(postKeeper.keeper,220);assert.equal(postKeeper.keeperVelocity,0);
const waitingRecovery=createPinballState();Object.assign(waitingRecovery.defenderAI[0],{dazed:.5,block:.3,cooldown:.8});advance(waitingRecovery,.4);assert.equal(waitingRecovery.defenderAI[0].block,0);assert.ok(waitingRecovery.defenderAI[0].cooldown<.401,'block cooldown continues while waiting or down');
console.log('Pinball post-boundary velocity and off-play AI recovery passed.');
