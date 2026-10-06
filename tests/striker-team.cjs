// Island Strikers team play and cup (G1, Oct 4 2026): shapes, called runs, team spirit + Team Strike (both sides,
// with a counter), cup modifiers (rain, small goals), golden goal and the penalty shootout.
const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict'),m={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/arcade/strikerMatch.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math});
const {createStrikerMatch,strikerInput,strikerWinner,STRIKER_SHAPES,STRIKER_RUNS}=m.exports;
const fresh=(level=1,setup)=>{const g=createStrikerMatch(),s=g.state;s.level=level;if(setup)setup(g,s);g.reset();return{g,s,i:strikerInput()};};
const own=(s,id,x,z)=>{const p=s.players[id];Object.assign(p,{x,z,vx:0,vz:0,yaw:Math.PI/2});Object.assign(s.ball,{owner:id,x:x+.82,z,lock:0});s.selected=id;return p;};
assert.deepEqual(Object.keys(STRIKER_SHAPES),['balanced','wide','solid']);assert.equal(Object.keys(STRIKER_RUNS).length,3);
// Shapes move Gold's AI teammates.
{const where=(shape)=>{const {g,s,i}=fresh(1,(g,s)=>{s.shape=shape;});for(const p of s.players)if(p.team===1)p.stun=99;own(s,0,0,0);for(let n=0;n<180;n++){g.step(1/60,i);s.ball.owner=0;}return s.players;};
 const bal=where('balanced'),wide=where('wide'),solid=where('solid');
 assert(Math.abs(wide[1].z)>Math.abs(bal[1].z)+1.5&&Math.abs(wide[2].z)>Math.abs(bal[2].z)+1.5,'wide hugs the touchlines');assert(solid[2].x<bal[2].x-4,'solid keeps one back');}
// Called runs: in behind when a teammate is ahead and free; overlap when they are behind the ball.
{const {g,s,i}=fresh();for(const p of s.players)if(p.team===1)p.stun=99;own(s,0,0,0);Object.assign(s.players[1],{x:6,z:-6});Object.assign(s.players[2],{x:-20,z:8});Object.assign(s.players[5],{x:10,z:4});Object.assign(s.players[6],{x:12,z:-3});s.players[5].stun=s.players[6].stun=99;
 i.call=true;g.step(1/60,i);i.call=false;const r=s.players[1];assert.equal(r.callKind,'behind');assert(r.callRun>0);assert.equal(s.eventKind,'call');
 for(let n=0;n<60;n++){g.step(1/60,i);s.ball.owner=0;}assert(r.x>12.5,'runs beyond the last defender');assert.equal(s.passTarget,1,'pass preview picks the runner');}
{const {g,s,i}=fresh();for(const p of s.players)if(p.team===1)p.stun=99;own(s,0,5,4);Object.assign(s.players[1],{x:0,z:3});Object.assign(s.players[2],{x:-20,z:-8});i.call=true;g.step(1/60,i);i.call=false;assert.equal(s.players[1].callKind,'overlap');
 for(let n=0;n<70;n++){g.step(1/60,i);s.ball.owner=0;}assert(s.players[1].x>s.players[0].x+2&&s.players[1].z>s.players[0].z+2,'overlaps round the outside');}
// Team spirit fills from good play; full spirit + a near-full charge = Team Strike (one goal, still aimed).
{const {g,s,i}=fresh();for(const p of s.players)if(p.team===1&&!p.keeper)p.stun=99;assert.equal(s.spirit[0],0);s.spirit[0]=.99;own(s,0,0,0);Object.assign(s.players[1],{x:6,z:0});s.players[2].x=-20;i.pass=true;i.x=1;g.step(1/60,i);i.pass=i.x=0;
 for(let n=0;n<60&&s.ball.owner!==1;n++)g.step(1/60,i);assert.equal(s.spirit[0],1,'a completed pass fills the last bit');assert(s.spiritEvent>=1);
 own(s,1,12,0);i.shoot=true;i.power=.95;i.z=.9;g.step(1/60,i);i.shoot=false;assert.equal(s.special,1);assert.equal(s.spirit[0],0,'spent');assert(Math.hypot(s.ball.vx,s.ball.vz)>40,'fast and low');assert(s.teamStrike);}
{const {g,s,i}=fresh();s.spirit[0]=.5;own(s,0,12,0);i.shoot=true;i.power=.95;g.step(1/60,i);assert.equal(s.special,0,'no strike without full spirit');}
// Blue's Team Strike is telegraphed by a charge-up; pressure the shooter (win the ball) to stop it.
for(const pressure of [false,true]){const {g,s,i}=fresh(3);for(const p of s.players)if(p.id!==4&&!p.keeper)p.stun=99;s.spirit[1]=1;const b=s.players[4];Object.assign(b,{x:-8,z:0,yaw:-Math.PI/2,think:0,touchCycle:99});Object.assign(s.ball,{owner:4,x:-8.8,z:0,lock:0});
 g.step(1/60,i);assert(b.strikeCharge>0,'charge-up starts in range');assert.equal(s.eventKind,'bluecharge');
 if(pressure){const me=s.players[0];me.stun=0;Object.assign(me,{x:-10.4,z:0,cooldown:0});s.selected=0;i.pass=true;g.step(1/60,i);i.pass=false;for(let n=0;n<20;n++)g.step(1/60,i);assert.equal(b.strikeCharge,0,'pressure breaks the charge');assert.equal(s.special,0);assert(s.spirit[1]<=.5,'spirit halves');}
 else{for(let n=0;n<80&&s.special===0;n++)g.step(1/60,i);assert.equal(s.special,1,'unpressured, Blue strikes');assert.equal(s.specialTeam,1);}}
// Modifiers: rain lets the ball skid further; small goals shrink the mouth.
{const roll=(rain)=>{const {g,s,i}=fresh(1,(g)=>g.configure({mods:{rain}}));for(const p of s.players)p.stun=99;Object.assign(s.ball,{owner:-1,x:-10,z:0,y:.25,vx:10,vz:0,vy:0,lock:9});for(let n=0;n<120;n++)g.step(1/60,i);return s.ball.x;};assert(roll(true)>roll(false)+2,'rain: the ball skids');}
for(const small of [false,true]){const {g,s,i}=fresh(1,(g)=>g.configure({mods:{small}}));for(const p of s.players)p.stun=99;Object.assign(s.ball,{owner:-1,x:24.6,z:3.8,y:.4,vx:30,vz:0,vy:0,lock:9,lastTeam:0});g.step(1/60,i);assert.equal(s.score[0],small?0:1,small?'small goal: wide of the post':'normal goal: in');}
// Knockout: a draw at full time goes to golden goal; a goal in extra time ends it.
{const {g,s,i}=fresh(2,(g)=>g.configure({duration:20,mods:{golden:true}}));for(const p of s.players)p.stun=999;for(let n=0;n<60*21&&!s.extra;n++)g.step(1/60,i);assert(s.extra,'extra time');assert(!s.finished);
 Object.assign(s.ball,{owner:-1,x:24.6,z:0,y:.4,vx:30,vz:0,vy:0,lock:9,lastTeam:0});g.step(1/60,i);for(let n=0;n<180&&!s.finished;n++)g.step(1/60,i);assert(s.finished,'golden goal ends it');assert.equal(strikerWinner(s),0);}
// Still level after extra time: a shootout always finds a winner (auto takes, AI keepers, stick-free player).
{const {g,s,i}=fresh(2,(g)=>g.configure({duration:10,mods:{golden:true}}));for(const p of s.players)p.stun=999;for(let n=0;n<60*80&&!s.shootout.active&&!s.finished;n++){g.step(1/60,i);for(const p of s.players)if(!s.setPiece.kind)p.stun=999;}
 assert(s.shootout.active,'penalties after extra time');let kicks=0;for(let n=0;n<60*200&&!s.finished;n++){g.step(1/60,i);}assert(s.finished,'shootout ends');assert(strikerWinner(s)>=0,'someone wins');assert(s.shootout.kicks[0]>=3,'three each at least');}
console.log('PASS Strikers team + cup: shapes, called runs (behind/overlap), team spirit + Team Strike and its counter, rain, small goals, golden goal, shootout');
