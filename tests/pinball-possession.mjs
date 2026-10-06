import '../scripts/register-local-ts.mjs';
import assert from 'node:assert/strict';
const {createPinballState,stepPinball,pinballDefenders,nudgePinball,launchPinball,tapPinballFlipper}=await import('../lib/games/soccerPinball.ts');
function incoming(owner=0,defs=3,time=0,speed=-100){const s=createPinballState();s.phase='playing';s.defs=defs;s.time=time;s.openingRescue=false;s.launchGrace=0;const d=pinballDefenders(time,defs)[owner];Object.assign(s.ball,{x:d.x,y:d.y+24,vx:0,vy:speed});return s;}
const input={left:false,right:false};
for(const hz of [30,60,120])for(const owner of [0,1,2]){
 const s=incoming(owner);let controls=0,passes=0,shots=0,previous='';
 for(let n=0;n<5*hz&&s.phase==='playing';n++){
  stepPinball(s,input,1/hz);
  if(s.cue!==previous){if(s.cue==='control')controls++;if(s.cue==='pass')passes++;if(s.cue==='attack')shots++;previous=s.cue;}
  if(s.possession>=0){assert.equal(s.ball.vx,0);assert.equal(s.ball.vy,0);assert(s.possessionTime<=.72);}
  assert(Number.isFinite(s.ball.x+s.ball.y+s.ball.vx+s.ball.vy));
 }
 assert(controls>=3,`receipts owner ${owner} at ${hz}Hz`);assert.equal(passes,2,'two real passes before the shot');assert.equal(shots,1,'possession cannot cycle forever');
}
const solo=incoming(0,1);let soloShot=false;
for(let i=0;i<240;i++){stepPinball(solo,input,1/120);if(solo.cue==='attack')soloShot=true;assert.notEqual(solo.cue,'pass','no phantom teammate');}assert(soloShot);
const rescue=incoming();stepPinball(rescue,input,1/60);assert.equal(rescue.possession,0);assert(nudgePinball(rescue));assert.equal(rescue.possession,-1);stepPinball(rescue,input,1/60);assert.equal(rescue.possession,-1,'nudge releases possession rather than immediately recapturing');
const hard=incoming(0,3,0,-700);for(let i=0;i<12;i++)stepPinball(hard,input,1/120);assert.equal(hard.possession,-1,'hard hit never becomes a soft catch');assert(hard.defenderAI[0].dazed>0||hard.cue==='block');
const reset=incoming();stepPinball(reset,input,1/60);reset.phase='ready';assert(launchPinball(reset));assert.equal(reset.possession,-1);assert.equal(reset.attackPasses,0);assert.equal(reset.passTarget,-1);
console.log('PASS pinball soft control, physical two-pass combinations, counter shots, solo finish, hard contact, nudge escape, relaunch reset at 30/60/120Hz');

for(const hz of [30,60,120])for(const side of [0,1]){const s=createPinballState();tapPinballFlipper(s,side);let peak=0;for(let i=0;i<hz;i++){stepPinball(s,input,1/hz);peak=Math.max(peak,side?s.right:s.left);}assert(peak>.95,'sub-frame tap completes a deliberate stroke');assert.equal(s.flipperPulse[side],0);assert.equal(side?s.right:s.left,0,'tap returns to rest without timers');}
console.log('PASS flipper tap pulse retained across 30/60/120Hz and settles to rest');
