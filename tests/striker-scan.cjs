// Island Strikers scanning + support pass (Oct 9 2026): scan markers (lane openness), open/blocked pass counts,
// AI support angles out of a defender's shadow, the clean-strike band, the Blue Team Strike cap and the replay caption.
const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict'),m={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/arcade/strikerMatch.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math});
const {createStrikerMatch,strikerInput,strikerGoalStory,STRIKER_CLEAN,STRIKER_BLUE_STRIKES}=m.exports;
const fresh=(level=1)=>{const g=createStrikerMatch(),s=g.state,i=strikerInput();s.level=level;g.reset();return {g,s,i};};
const own=(s,id,x,z)=>{Object.assign(s.players[id],{x,z,vx:0,vz:0});Object.assign(s.ball,{owner:id,x:x+.8,z,lock:0});s.selected=id;};
// Scan markers: a teammate with a defender standing in the lane reads as covered; a clear one reads as open.
{const {g,s,i}=fresh();for(const p of s.players)if(p.team===1)p.stun=99;own(s,0,-10,0);
 Object.assign(s.players[1],{x:-2,z:-6});Object.assign(s.players[2],{x:-2,z:6});
 for(const p of s.players)if(p.team===1&&!p.keeper)Object.assign(p,{x:-6,z:20});Object.assign(s.players[5],{x:-6,z:-3});
 g.step(1/60,i);assert(s.laneOpen[1]<.35,'defender in the lane: covered');assert(s.laneOpen[2]>.8,'clear lane and unmarked: open');assert.equal(s.laneOpen[0],0,'the carrier gets no marker');
 // Marked: a defender right beside the receiver also closes it, even with a clear lane.
 Object.assign(s.players[5],{x:-2,z:7.2});g.step(1/60,i);assert(s.laneOpen[2]<.3,'tight marker closes the receiver');}
// Pass counts follow the preview the player saw: open lane = safe, warm lane = risky.
for(const blocked of [false,true]){const {g,s,i}=fresh();for(const p of s.players)if(p.team===1&&!p.keeper)Object.assign(p,{x:15,z:12,stun:99});own(s,0,-10,0);
 Object.assign(s.players[1],{x:0,z:0});Object.assign(s.players[2],{x:-20,z:12});if(blocked)Object.assign(s.players[5],{x:-5,z:.2});
 i.x=1;i.pass=true;g.step(1/60,i);assert.equal(blocked?s.riskyPasses:s.safePasses,1,blocked?'blocked lane counts as risky':'open lane counts as safe');assert.equal(blocked?s.safePasses:s.riskyPasses,0);}
// Support angles: a teammate whose shape spot sits in a defender's shadow steps out of it within about half a second.
{const {g,s,i}=fresh();own(s,0,-8,0);for(const p of s.players)if(p.team===1&&!p.keeper)Object.assign(p,{x:20,z:12,stun:99});
 Object.assign(s.players[1],{x:-3,z:-8});Object.assign(s.players[5],{x:-5.5,z:-4.2,stun:99});Object.assign(s.players[2],{x:-3,z:8});
 for(let n=0;n<60;n++){g.step(1/60,i);s.ball.owner=0;}assert(s.laneOpen[1]>.6,`supporting teammate finds a clear lane (${s.laneOpen[1].toFixed(2)})`);
 assert(Math.hypot(s.players[1].x-s.players[2].x,s.players[1].z-s.players[2].z)>5,'support spots stay spread out');}
// Clean strike: a release inside the band is flagged, flatter and read later by the keeper; overhit and soft are not.
for(const hz of [30,60,120]){const results={};for(const power of [.45,(STRIKER_CLEAN[0]+STRIKER_CLEAN[1])/2,.97]){const {g,s,i}=fresh();own(s,0,8,0);i.shoot=true;i.power=power;g.step(1/hz,i);results[power]={clean:s.cleanStrike,count:s.cleanStrikes,react:s.players[7].react};}
 const [soft,clean,hard]=Object.values(results);assert(clean.clean&&clean.count===1,'band release is a clean strike');assert(!soft.clean&&!hard.clean,'outside the band is not');assert(clean.react>soft.react,'keeper reads a clean strike later');}
// Blue Team Strike: capped per match by round, so it stays a moment to answer, not background noise.
for(const level of [1,4]){const {g,s,i}=fresh(level);let charges=0,last=s.event;for(let k=0;k<4;k++){for(const p of s.players)if(p.id!==4&&!p.keeper)p.stun=99;s.spirit[1]=1;const b=s.players[4];Object.assign(b,{x:-8,z:0,yaw:-Math.PI/2,think:0,touchCycle:99,strikeCharge:0,stun:0});Object.assign(s.ball,{owner:4,x:-8.8,z:0,lock:0});
  for(let n=0;n<3;n++){g.step(1/60,i);if(s.event!==last){last=s.event;if(s.eventKind==='bluecharge')charges++;}}b.strikeCharge=0;}
 assert.equal(charges,STRIKER_BLUE_STRIKES[level-1],`round ${level}: Blue charges at most ${STRIKER_BLUE_STRIKES[level-1]} Team Strikes`);
 g.reset();assert.equal(s.blueStrikes,0,'cap resets each match');}
// Replay caption and goal story: what built the goal, in kid-level words.
{const {g,s,i}=fresh(3);s.passChain=3;s.habitAt=s.time;s.firstTimeShot=true;Object.assign(s.ball,{owner:-1,x:24.8,z:1,y:.5,vx:30,vz:0,vy:0,lock:9,lastTeam:0});s.lastKicker=1;g.step(1/60,i);
 assert.equal(s.score[0],1);assert.equal(s.goalStory.chain,3);assert(s.goalStory.habit&&s.goalStory.firstTime);
 assert.equal(strikerGoalStory(s.goalStory,3),'3 passes · switch play across the pitch · first-time finish');
 assert.equal(strikerGoalStory({chain:0,habit:false,firstTime:false,teamStrike:false,chip:false,curled:false,setPiece:false,clean:true},1),'Solo run · clean strike');}
console.log('PASS Strikers scan: lane-open markers, safe/risky pass counts, support angles, clean strike at 30/60/120Hz, Blue Team Strike cap, replay caption');
