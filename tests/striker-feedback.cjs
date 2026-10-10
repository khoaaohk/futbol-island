// Island Strikers playtest pass (Oct 9 2026): honest pass stat (your passes played / reached a teammate), the "why Blue
// scored" cause, the context hint for the action buttons, full-time coach grammar, and the UI/scene wiring for the
// pass-chain cue, follow camera and button hints.
const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
const load=file=>{const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math});return m.exports;};
const {createStrikerMatch,strikerInput,strikerHint,STRIKER_CONCEDE_LINES,STRIKER_SHOOT_ZONE}=load('lib/arcade/strikerMatch.ts');
const {scanTakeaway,passLine}=load('lib/arcade/strikerCoach.ts');
const fresh=(level=1)=>{const g=createStrikerMatch(),s=g.state,i=strikerInput();s.level=level;g.reset();return {g,s,i};};
const own=(s,id,x,z)=>{Object.assign(s.players[id],{x,z,vx:0,vz:0});Object.assign(s.ball,{owner:id,x:x+.8,z,lock:0});s.selected=id;};
const blueAway=s=>{for(const p of s.players)if(p.team===1&&!p.keeper)Object.assign(p,{x:15,z:12,stun:99});};
// A completed pass by the player counts as played and received; an AI teammate's pass counts as neither.
for(const hz of [30,60,120]){const {g,s,i}=fresh();blueAway(s);own(s,0,-10,0);Object.assign(s.players[1],{x:0,z:0});Object.assign(s.players[2],{x:-20,z:12});
 i.x=1;i.pass=true;g.step(1/hz,i);i.pass=false;i.x=0;assert.equal(s.userPasses,1,'manual pass counted');assert(s.userPassLive);
 for(let n=0;n<hz*2&&s.ball.owner<0;n++)g.step(1/hz,i);assert.equal(s.ball.owner,1);assert.equal(s.userPassesDone,1,`pass reached a teammate at ${hz}Hz`);assert(!s.userPassLive);
 // The teammate (now AI-free: selected moved to 1) — a keeper distribution is not the player's pass.
 const before=s.userPasses;s.players[3].think=0;Object.assign(s.ball,{owner:3,x:-21,z:0,lock:0});s.selected=1;for(let n=0;n<hz*.5;n++)g.step(1/hz,i);assert.equal(s.userPasses,before,'keeper pass is not the player\'s');}
// An intercepted pass is played but not received, and a Blue goal soon after is explained by the interception.
{const {g,s,i}=fresh();blueAway(s);own(s,0,-10,0);Object.assign(s.players[1],{x:0,z:0});Object.assign(s.players[2],{x:-20,z:12,stun:99});Object.assign(s.players[5],{x:-3,z:0,think:9,stun:0});
 i.x=1;i.pass=true;g.step(1/60,i);i.pass=false;i.x=i.z=0;let stolen=false;for(let n=0;n<180;n++){g.step(1/60,i);if(s.ball.owner>=4){stolen=true;break;}}
 assert(stolen,'a defender in the lane cuts the pass out');assert.equal(s.userPasses,1);assert.equal(s.userPassesDone,0,'cut-out pass did not reach a teammate');assert.equal(s.lostKind,'intercept');
 s.lastKicker=5;Object.assign(s.ball,{owner:-1,x:-24.8,z:1,y:.5,vx:-30,vz:0,vy:0,lock:1,lastTeam:1});g.step(1/60,i);assert.equal(s.score[1],1);assert.equal(s.concedeCause,'intercept');assert.match(STRIKER_CONCEDE_LINES[s.concedeCause],/cyan ring/);}
// Tackled, Team Strike, set piece and a plain shot each get their own line.
{const {g,s,i}=fresh();own(s,0,-5,0);const d=s.players[4];Object.assign(d,{x:-3.6,z:0,vx:0,vz:0,stun:0,cooldown:0});for(const p of s.players)if(p.team===1&&p!==d&&!p.keeper)p.stun=99;
 d.tackle=.28;d.vx=-16;g.step(1/60,i);assert.equal(s.lostKind,'tackle','tackle on the carrier is recorded');
 Object.assign(s.ball,{owner:-1,x:-24.8,z:1,y:.5,vx:-30,vz:0,vy:0,lock:1,lastTeam:1});g.step(1/60,i);assert.equal(s.concedeCause,'tackle');}
{const {g,s,i}=fresh();s.time=40;s.lostKind='tackle';s.lostAt=20;Object.assign(s.ball,{owner:-1,x:-24.8,z:1,y:.5,vx:-30,vz:0,vy:0,lock:1,lastTeam:1});g.step(1/60,i);assert.equal(s.concedeCause,'shot','an old turnover does not explain the goal');}
{const {g,s,i}=fresh();s.teamStrike=true;Object.assign(s.ball,{owner:-1,x:-24.8,z:1,y:.5,vx:-40,vz:0,vy:0,lock:1,lastTeam:1});g.step(1/60,i);assert.equal(s.concedeCause,'teamStrike');}
{const {g,s,i}=fresh();s.bluePieceAt=s.time;Object.assign(s.ball,{owner:-1,x:-24.8,z:1,y:.5,vx:-30,vz:0,vy:0,lock:1,lastTeam:1});g.step(1/60,i);assert.equal(s.concedeCause,'setPiece');
 g.reset();assert.equal(s.userPasses+s.userPassesDone,0);assert.equal(s.lostKind,'');assert.equal(s.concedeCause,'shot','reset clears the feedback state');}
for(const k of ['intercept','tackle','teamStrike','setPiece','shot'])assert(STRIKER_CONCEDE_LINES[k].length<70,'concede line fits a banner');
// Context hint: shoot in the zone, pass when pressed with a free teammate, tackle on the heavy touch, nothing in a stoppage.
{const {g,s,i}=fresh();blueAway(s);own(s,0,STRIKER_SHOOT_ZONE+1,0);g.step(1/60,i);assert.equal(strikerHint(s),'shoot');
 own(s,0,-10,0);Object.assign(s.players[1],{x:-2,z:-6});Object.assign(s.players[2],{x:-2,z:8});g.step(1/60,i);s.holdTime=0;assert.equal(strikerHint(s),'','no hurry, no hint');
 s.holdTime=2.2;assert.equal(strikerHint(s),'pass','held too long with a free teammate');
 s.goalPause=1;assert.equal(strikerHint(s),'','no hint while celebrating');s.goalPause=0;
 const b=s.players[4];Object.assign(b,{x:-6,z:0,stun:0,heavy:.2});Object.assign(s.ball,{owner:4,x:-6.8,z:0});Object.assign(s.players[0],{x:-8,z:0});assert.equal(strikerHint(s),'tackle');
 b.heavy=0;assert.equal(strikerHint(s),'','close down, wait for the heavy touch');}
// Coach copy: grammar for one pass, all passes, some passes.
assert.match(scanTakeaway({safe:0,risky:1,clean:0,gold:0,passes:0,tried:1,done:0}),/^Your pass went into a blocked lane/);
assert.match(scanTakeaway({safe:0,risky:1,clean:0,gold:0,passes:1,tried:1,done:1}),/^Your pass got there, but through a blocked lane/);
assert.match(scanTakeaway({safe:3,risky:0,clean:0,gold:0,passes:5}),/all 3 of your passes went into open lanes/);
assert.match(scanTakeaway({safe:1,risky:2,clean:0,gold:0,passes:5}),/^2 of your 3 passes went into a blocked lane/);
assert.doesNotMatch(scanTakeaway({safe:1,risky:0,clean:1,gold:1,passes:1}),/1 of your 1/);
assert.equal(passLine(3,5),'3/5');assert.equal(passLine(0,0),'0');
// Wiring: chain cue, follow camera (off under reduced motion), hint attributes, concede line on the banner.
const ui=fs.readFileSync('components/LiveArcadeMatch.tsx','utf8'),scene=fs.readFileSync('lib/arcade/strikerScene.ts','utf8'),audio=fs.readFileSync('lib/arcade/strikerAudio.ts','utf8'),css=fs.readFileSync('components/LiveArcadeMatch.module.css','utf8');
assert.match(audio,/case 'chain':/,'pass chain has its own rising cue');assert.match(ui,/cue\('chain',chain\)/);
assert.match(scene,/followOn=follow&&motion&&!portrait/,'follow cam respects reduced motion and portrait');assert.match(ui,/visual\.setFollow\(active&&!match\.state\.finished\)/,'follow cam only while playing');
assert.match(ui,/STRIKER_CONCEDE_LINES\[s\.concedeCause\]/);assert.match(ui,/data-hint=\{view\.hint==='shoot'\|\|undefined\}/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.bump,\.chain,\.prompt,\.starList li\[data-done\]\{animation:none\}/,'new UI motion stops under reduced motion');
console.log('PASS Strikers feedback: player pass stat, concede causes, context hints, coach grammar, chain/follow/hint wiring at 30/60/120Hz');
