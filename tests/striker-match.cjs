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
// Assisted passes reach a teammate at different distances; neutral input helps receive.
for(const distance of [8,18,28]){
 const game=createStrikerMatch(),s=game.state,i=strikerInput();
 Object.assign(s.players[0],{x:-18,z:0});Object.assign(s.players[1],{x:-18+distance,z:2});Object.assign(s.players[2],{x:-20,z:-11});
 for(const p of s.players)if(p.team===1)p.stun=10;
 i.x=1;i.pass=true;game.step(1/60,i);assert.equal(s.selected,1,'direction picks the forward receiver');i.x=0;i.pass=false;
 for(let n=0;n<240&&s.ball.owner<0;n++)game.step(1/60,i);
 assert.equal(s.ball.owner,1,`assisted ${distance}m pass reaches receiver`);assert.equal(s.passes[0],1);
}
console.log('PASS assisted passing at 8, 18 and 28m');
for(const hz of [30,60,120]){
 const g=createStrikerMatch(),s=g.state,i=strikerInput();i.charge=true;
 for(let n=0;n<hz;n++)g.step(1/hz,i);
 assert(s.charge>.9,'charge fills in real time');assert(s.timeScale<.4,'full wind-up slows simulation');assert(Math.abs(s.time-1)<.001,'match clock stays real time');
 i.charge=false;i.shoot=true;i.power=s.charge;g.step(1/hz,i);assert(s.shotMoment>0,'power shot gets brief impact slow motion');i.shoot=false;
 for(let n=0;n<hz/2;n++)g.step(1/hz,i);assert.equal(s.timeScale,1,'normal speed returns after shot');
}
console.log('PASS charge cinematic timing at 30/60/120Hz');
// Passing must remain useful while the same thumb/key keeps the receiver moving.
// These fixtures isolate lead accuracy; defenders are tested separately below.
for(const hz of [30,60,120])for(const distance of [8,18,28])for(const axis of [[.25,0],[.65,0],[1,0],[.7,.7]])for(const sprint of [false,true]){
 const g=createStrikerMatch(),s=g.state,i=strikerInput();
 Object.assign(s.players[0],{x:-18,z:-3});Object.assign(s.players[1],{x:-18+distance,z:-1});Object.assign(s.players[2],{x:-22,z:-12});
 for(const p of s.players)if(p.team===1)p.stun=10;
 i.x=axis[0];i.z=axis[1];i.sprint=sprint;i.pass=true;g.step(1/hz,i);i.pass=false;
 assert.equal(s.selected,1,'assisted target respects the aimed forward lane');
 for(let n=0;n<hz*3&&s.ball.owner<0;n++)g.step(1/hz,i);
 assert.equal(s.ball.owner,1,`moving reception: ${hz}Hz, ${distance}m, ${axis}, sprint ${sprint}`);
 assert.equal(s.passes[0],1);
}
{
 const g=createStrikerMatch(),s=g.state,i=strikerInput();
 Object.assign(s.players[0],{x:-18,z:0});Object.assign(s.players[1],{x:0,z:2});Object.assign(s.players[2],{x:-22,z:-12});
 for(const p of s.players)if(p.team===1)p.stun=10;
 i.x=1;i.pass=true;g.step(1/60,i);i.pass=false;
 const heading=Math.atan2(s.ball.vz,s.ball.vx);i.x=0;i.z=-1;
 for(let n=0;n<18;n++)g.step(1/60,i);
 assert(Math.abs(Math.atan2(s.ball.vz,s.ball.vx)-heading)<1e-9,'manual direction changes do not curve an assisted pass');
 assert(s.players[1].z<1&&s.players[1].vz< -6,'receiver can override the predicted run');
}
console.log('PASS moving receptions: analog, keyboard, diagonal, sprint, 8/18/28m at 30/60/120Hz; manual override without homing');
for(const hz of [30,60,120]){
 const g=createStrikerMatch(),s=g.state,i=strikerInput(),p=s.players[0];
 for(const other of s.players)if(other!==p)other.stun=10;
 i.x=1;for(let n=0;n<hz/2;n++)g.step(1/hz,i);
 const stopX=p.x;i.x=0;for(let n=0;n<hz/2;n++)g.step(1/hz,i);
 assert(p.x-stopX<.33,'release brakes within a bootstep');assert.equal(p.vx,0,'settled feet stop drifting');
 i.x=-1;for(let n=0;n<Math.ceil(hz*.12);n++)g.step(1/hz,i);assert(p.vx< -6,'reverse accelerates promptly');
 Object.assign(p,{x:-24,z:0,vx:-8,vz:0});g.step(1/hz,i);assert.equal(p.x,-24);assert.equal(p.vx,0,'edge cancels outward velocity');
}
console.log('PASS responsive braking, reversal and boundary velocity at 30/60/120Hz');
{
 const g=createStrikerMatch(),s=g.state,i=strikerInput();for(const p of s.players)if(p.team===1)p.stun=10;
 i.pass=true;g.step(1/60,i);i.pass=false;
 for(let n=0;n<240&&s.ball.owner<0;n++)g.step(1/60,i);
 const receiver=s.players[s.ball.owner];assert(receiver.receive>0,'reception starts a short cushion');
 const before=receiver.x;i.x=1;g.step(1/60,i);assert(receiver.x>before,'first touch does not lock movement');
 i.pass=true;g.step(1/60,i);assert.equal(receiver.receive,0,'a first-time pass takes priority over cushioning');assert.equal(s.ball.owner,-1);
 g.reset();assert(s.players.every(p=>p.receive===0),'kickoff clears receipt animation');
}
console.log('PASS first touch: cushion, uninterrupted movement, instant pass priority and reset');
