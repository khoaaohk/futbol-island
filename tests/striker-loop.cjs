// Island Strikers loop (G1, Oct 4 2026): single-idea round curve, eased retry, one-touch window, stars.
const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict'),m={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/arcade/strikerMatch.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math});
const {createStrikerMatch,strikerInput,strikerStars,STRIKER_TUNING:T,STRIKER_ASSIST:A,STRIKER_CHALLENGES}=m.exports;
// 1. One idea per round: the tactical flags, and generic knobs that creep in small even steps.
assert.deepEqual([...T.receiverPress],[false,true,false,true],'press is round 2 and the final');
assert.deepEqual([...T.cover],[false,false,true,true],'cover arrives with the block in round 3');
const steps={speed:.2,tackleWindup:.02,tackleThink:.08,carrierThink:.06,keeperReact:.02,keeperDive:.45,interceptSkill:.08};
for(const [k,max] of Object.entries(steps))for(let i=k==="interceptSkill"?2:1;i<4;i++){const d=Math.abs(T[k][i]-T[k][i-1]);assert(d<=max+1e-9,`${k} step ${i} is ${d}, too steep`);}
for(let i=1;i<4;i++){assert(T.speed[i]>=T.speed[i-1]&&T.keeperDive[i]>=T.keeperDive[i-1]&&T.keeperReact[i]<=T.keeperReact[i-1]&&T.tackleWindup[i]<=T.tackleWindup[i-1],'never easier as rounds rise');}
assert(T.tackleWindup[3]>.3,'the final still telegraphs a tackle for 0.3 s');assert.equal(STRIKER_CHALLENGES.length,4);
// 2. Eased retry: a loss or draw eases the same round one notch; a win or a new round clears it.
{const g=createStrikerMatch(),s=g.state;s.level=3;g.reset();
 const windup=()=>{Object.assign(s.players[0],{x:0,z:0});Object.assign(s.ball,{owner:0,x:.82,z:0,lock:0});Object.assign(s.players[4],{x:2.6,z:0,think:0,windup:0});s.selected=0;g.step(1/120,strikerInput());return s.players[4].windup;};
 const hard=windup();s.finished=true;s.score[0]=0;s.score[1]=1;g.reset(true);assert.equal(s.level,3,'loss retries');assert(s.assist,'loss eases the retry');const soft=windup();assert(soft>hard+.03,'eased retry telegraphs longer');
 s.finished=true;s.score[0]=1;s.score[1]=1;g.reset(true);assert(s.assist,'a draw keeps the help');
 s.finished=true;s.score[0]=2;s.score[1]=0;g.reset(true);assert.equal(s.level,4);assert(!s.assist,'a win clears the help');
 s.finished=true;s.score[0]=0;s.score[1]=2;g.reset(true);assert(s.assist);s.level=2;g.reset();assert(!s.assist,'choosing another round clears the help');
 assert(A.keeperReact>0&&A.keeperDive<0&&A.tackleWindup>0&&A.interceptSkill<1);}
// 3. One-touch window: it opens late in a pass's travel; a tap inside it is perfect.
for(const hz of [30,60,120]){
 const setup=(kind)=>{const g=createStrikerMatch(),s=g.state,i=strikerInput();g.reset();for(const p of s.players)if(p.team===1)p.stun=99;Object.assign(s.players[0],{x:-6,z:0});Object.assign(s.players[1],{x:6,z:0,vx:0,vz:0});s.players[2].x=-20;s.players[2].z=10;
  Object.assign(s.ball,{owner:0,x:-5.2,z:0,lock:0});s.selected=0;i.pass=true;i.x=1;g.step(1/hz,i);i.pass=false;i.x=0;assert.equal(s.selected,1,'control follows the pass');
  let opened=-1,early=false;for(let n=0;n<hz*2&&s.ball.owner!==1&&s.shots[0]===0;n++){if(s.touchWindow>0&&opened<0){opened=n;if(kind){i[kind]=true;i.power=0;if(kind==='pass')i.x=-1;}}else{i.pass=i.shoot=false;}g.step(1/hz,i);if(opened<0&&s.ball.owner<0&&s.touchWindow===0)early=true;}
  return {s,opened,early};};
 const plain=setup(null);assert(plain.opened>0&&plain.early,'window opens only near arrival');assert.equal(plain.s.perfect,0);
 const shot=setup('shoot');assert.equal(shot.s.perfect,1,`perfect first-time shot at ${hz}Hz`);assert.equal(shot.s.shots[0],1,'first-time shot taken');assert(shot.s.firstTimeShot);
 const pass=setup('pass');assert.equal(pass.s.perfect,1,`perfect first-time pass at ${hz}Hz`);assert(pass.s.passes[0]>=1,'one-touch pass completed');
}
// A first-time shot queued before the window is still a first-time shot, just not "perfect".
{const g=createStrikerMatch(),s=g.state,i=strikerInput();g.reset();for(const p of s.players)if(p.team===1)p.stun=99;Object.assign(s.players[0],{x:-6,z:0});Object.assign(s.players[1],{x:8,z:0});Object.assign(s.ball,{owner:0,x:-5.2,z:0,lock:0});s.selected=0;i.pass=true;i.x=1;g.step(1/60,i);i.pass=false;i.x=0;
 g.step(1/60,i);i.shoot=true;g.step(1/60,i);i.shoot=false;assert(s.queuedShot>0&&!s.queuedPerfect);for(let n=0;n<120&&s.ball.owner!==1&&s.eventKind!=='shot';n++)g.step(1/60,i);assert.equal(s.eventKind,'shot');assert.equal(s.perfect,0);}
// 4. Stars: each earned on its own.
const st=(level,a,b,extra={})=>strikerStars({level,score:[a,b],focus:0,habitGoals:0,firstTimeGoals:0,...extra});
assert.equal(st(1,2,0).count,2,'clean-sheet win: win + challenge');assert.equal(st(1,2,1).count,1);assert.equal(st(1,0,1,{focus:3}).count,1,'habit star even in a loss');
assert(st(2,1,1,{firstTimeGoals:1}).challenge&&!st(2,1,0).challenge);assert(st(3,1,2,{habitGoals:1}).challenge);assert(st(4,3,1).challenge&&!st(4,2,1).challenge);assert.equal(st(4,3,1,{focus:5}).count,3);
// Habit then goal inside the window counts for the round-3 star.
{const g=createStrikerMatch(),s=g.state,i=strikerInput();s.level=3;g.reset();s.habitAt=s.time;for(const p of s.players)p.stun=9;Object.assign(s.ball,{owner:-1,x:24.9,z:0,y:.3,vx:30,vz:0,vy:0,lock:1});g.step(1/60,i);assert.equal(s.score[0],1);assert.equal(s.habitGoals,1);}
console.log('PASS Strikers loop: single-idea curve steps, eased retry, one-touch window + perfect pass/shot at 30/60/120Hz, stars');
