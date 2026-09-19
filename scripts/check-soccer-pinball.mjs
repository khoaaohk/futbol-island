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
const dive=active(218,220,0,-250);advance(dive,.15);assert.ok(dive.keeper>190,'keeper reacts laterally to an incoming shot');
const goal=active(180,49,0,-400);advance(goal,.05);assert.equal(goal.goals,1);assert.equal(goal.score,500);assert.equal(goal.phase,'goal');assert.equal(goal.balls,3);advance(goal,1.6);assert.equal(goal.phase,'ready');assert.equal(goal.goals,1,'goal counted exactly once');
const flip=active(145,540,0,100);advance(flip,.075,{left:true,right:false});assert.ok(flip.ball.vy< -300,'active left flipper sends the ball upward');
const right=active(215,540,0,100);advance(right,.075,{left:false,right:true});assert.ok(right.ball.vy< -300,'active right flipper sends the ball upward');
const both=active(180,400,0,0);advance(both,.1,{left:true,right:true});assert.equal(both.left,1);assert.equal(both.right,1,'simultaneous input raises both');advance(both,.15);assert.equal(both.left,0);assert.equal(both.right,0,'released inputs lower both');
const drain=active(180,625,0,400);advance(drain,.05);assert.equal(drain.balls,2);assert.equal(drain.phase,'lost');advance(drain,1.1);assert.equal(drain.phase,'ready');
for(let i=0;i<2;i++){launchPinball(drain);Object.assign(drain.ball,{x:180,y:625,vx:0,vy:400});advance(drain,1.2);}assert.equal(drain.balls,0);assert.equal(drain.phase,'over');assert.equal(launchPinball(drain),false);const restarted=createPinballState();assert.equal(restarted.phase,'ready');assert.equal(restarted.score,0);assert.equal(restarted.goals,0);assert.equal(restarted.balls,3);assert.equal(launchPinball(restarted),true,'a fresh match launches after game over');
const a=createPinballState(),b=createPinballState();launchPinball(a);launchPinball(b);for(let i=0;i<120;i++)stepPinball(a,idle,1/120);for(let i=0;i<30;i++)stepPinball(b,idle,1/30);assert.ok(Math.hypot(a.ball.x-b.ball.x,a.ball.y-b.ball.y)<.001,'render rate does not change physics');
for(let seed=0;seed<20;seed++){const s=createPinballState();for(let i=0;i<3600;i++){if(s.phase==='ready')launchPinball(s,(seed%7)/6);stepPinball(s,{left:Math.sin(i*.13+seed)>0,right:Math.sin(i*.11+seed)>.2},1/120);assert.ok(Number.isFinite(s.ball.x+s.ball.y+s.ball.vx+s.ball.vy),'stress run remains finite');assert.ok(s.balls>=0&&s.balls<=3);}}
console.log('Soccer Pinball: launch, rails, defenders, keeper, goals, both flippers, multi-input, three-ball drain, restart, frame-rate independence and 20 deterministic stress runs passed.');
