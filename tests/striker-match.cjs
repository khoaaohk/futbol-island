const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict'),m={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/arcade/strikerMatch.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math});
const {createStrikerMatch,strikerInput}=m.exports;
{
 const game=createStrikerMatch(),s=game.state,i=strikerInput();
 s.selected=2;s.ball.owner=-1;s.ball.lock=1;s.ball.x=s.players[2].x;s.ball.z=s.players[2].z;i.switchPlayer=true;game.step(1/60,i);assert.notEqual(s.selected,2,'switch always leaves the previously selected player');
 game.reset();i.switchPlayer=false;s.ball.owner=4;s.players[4].windup=.001;s.players[4].think=1;game.step(1/60,i);assert.equal(s.players[4].tackle,0,'a player who wins possession cancels their defensive windup');
 game.reset();s.ball.owner=-1;s.ball.x=0;s.ball.z=0;s.ball.y=.25;s.ball.vx=10;s.ball.vz=0;s.ball.lock=5;for(let n=0;n<60;n++)game.step(1/60,i);assert(s.ball.vx<4.5,'ground friction makes a loose ball recoverable');
 game.reset();const defender=s.players[4];defender.x=s.players[0].x+2.5;defender.z=0;defender.think=0;s.ball.lock=0;game.step(1/60,i);assert(defender.windup>0&&defender.tackle===0,'AI shows a warning before committing to a tackle');
 game.reset();i.pass=true;game.step(1/60,i);assert(s.players[0].run>1,'passer makes a forward support run');assert(s.selected>0,'control transfers to the indicated receiver');
 game.reset();i.pass=false;s.ball.owner=-1;s.ball.lock=5;s.ball.x=0;s.ball.z=10;for(let n=0;n<120;n++)game.step(1/60,i);assert(s.players[1].z<-3&&s.players[5].z<-3,'off-ball players preserve width while one teammate pursues a loose ball');
 game.reset();s.ball.owner=-1;s.ball.lock=1;s.ball.x=18;s.ball.z=4;s.ball.vx=20;s.players[7].think=.2;s.players[7].keeperAim=0;game.step(.05,i);assert.equal(s.players[7].keeperAim,0,'keeper waits for the next reaction before changing target');
}
for(const hz of [30,60,120]){
 const game=createStrikerMatch(),i=strikerInput(),s=game.state;let x=s.players[0].x;i.x=1;i.sprint=true;
 for(let n=0;n<hz;n++)game.step(1/hz,i);assert(s.players[0].x>x+5,'accelerate');assert(s.players[0].stamina<1,'sprint costs stamina');
 const frozen=JSON.stringify(s);game.step(0,i);assert.equal(JSON.stringify(s),frozen,'zero dt frozen');
 game.reset();i.sprint=false;i.pass=true;game.step(1/hz,i);i.pass=false;assert.equal(s.ball.owner,-1,'pass releases');assert.notEqual(s.selected,0,'switch to receiver');assert.equal(s.players[0].strikeKind,'pass');assert(s.players[0].strikePower<.3,'pass uses controlled contact');
 game.reset();i.shoot=true;i.power=1;i.z=.7;game.step(1/hz,i);i.shoot=false;assert.equal(s.ball.owner,-1);assert(s.ball.vx>30,'charged shot');assert(s.ball.vz>0,'aim shot');assert.equal(s.players[0].strikeKind,'shot');assert(s.players[0].strikePower>.9,'charged shot carries power into pose');
 game.reset();s.ball.owner=-1;s.ball.x=24.8;s.ball.z=3;s.ball.y=1;s.ball.vx=40;s.ball.vz=0;s.ball.vy=0;s.ball.lock=1;game.step(1/hz,i);assert.equal(s.score[0],1,'crossing scores once');for(let n=0;n<hz;n++)game.step(1/hz,i);assert.equal(s.score[0],1);assert(s.goalPause>0);for(let n=0;n<hz;n++)game.step(1/hz,i);assert(s.goalPause<=0&&s.ball.owner>=0,'restart');
 game.reset();s.ball.owner=-1;s.ball.x=24.8;s.ball.z=9;s.ball.vx=40;s.ball.lock=1;game.step(1/hz,i);assert.equal(s.score[0],0);assert(s.ball.vx<0,'end board rebound');
 game.reset();const user=s.players[0],other=s.players[4];other.x=user.x+1;other.z=user.z;s.ball.owner=4;s.ball.lock=0;s.ball.x=other.x;s.ball.z=other.z;i.pass=true;game.step(1/hz,i);i.pass=false;assert(other.stun>0,'tackle impact');
 game.reset();i.x=0;i.z=0;for(let n=0;n<hz*181;n++){game.step(1/hz,i);assert(s.players.every(p=>Number.isFinite(p.x+p.z+p.vx+p.vz)),'finite bodies');assert(Number.isFinite(s.ball.x+s.ball.z+s.ball.y),'finite ball');}assert(s.finished,'full time');const ended=JSON.stringify(s);game.step(1/hz,i);assert.equal(JSON.stringify(s),ended,'finished sleeps');
}
console.log('PASS arcade match: movement, stamina, passing, charged aimed shots, swept goals, rebounds, tackle, full time and pause at30/60/120Hz');
