// Futbol Tennis aim + drill teaching (Oct 10 2026): the open-space cue never goes blank, the KICK NOW cue waits for the
// ball to reach the body, the Target Drill lights the touch for the ring's depth and sets rings where a full aim lands,
// and straight-at-the-rival returns are counted for the coach nudge.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{exports:m.exports,module:m,Math,Number,JSON,console,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
const t=load('lib/games/soccerTennis.ts');
function rally(level,ball,you={},extra={}){const s=t.createTennis(47,level);t.beginTennis(s);s.phase='rally';s.rally=3;s.aiReaction=99;Object.assign(s,extra);Object.assign(s.you,{x:0,y:5.3,targetX:0,targetY:5.3,vx:0,vy:0},you);Object.assign(s.ball,{vx:0,vy:0,vz:0,wx:0,wy:0,wz:0,last:'rival',crossed:true,bounces:0},ball);return s;}

// 1. Aim cue: always a side while you receive. Open space if the rival left one; otherwise wide, away from its lean.
const r=rally(1,{x:.1,y:5.2,z:.3,vz:2,bounces:1},{},{bounceAge:.12});
for(const [x,vx,you,side] of [[1.6,0,0,-1],[-1.6,0,0,1],[.3,0,0,-1],[-.3,0,0,1],[0,1.5,0,-1],[0,-1.5,0,1],[0,0,1,-1],[0,0,-1,1]]){
 r.rival.x=x;r.rival.vx=vx;r.you.x=you;assert.equal(t.tennisAimSide(r),side,`rival x ${x} vx ${vx}, you ${you}`);assert.match(t.tennisCallDetail(r),side<0?/aim ◀/:/aim ▶/,'the cue always names a side');}

// 2. KICK NOW waits for a ball that will still reach the body (even later than the hold): no full-stretch call.
const late=rally(6,{x:.5,y:4.3,z:.4,vy:2,vz:2.5,bounces:1},{},{bounceAge:.4});
assert(t.canTennisKick(late,'you'),'in reach (at full stretch)');assert.equal(t.tennisTouchCall(late),'wait','still coming to the body: LET IT COME');
assert(t.TENNIS_WAIT_LOOKAHEAD>t.TENNIS_KICK_HOLD);
const passing=rally(6,{x:1.1,y:5.3,z:.4,vy:0,vx:2,bounces:1},{},{bounceAge:.3});assert.equal(t.tennisTouchCall(passing),'kick','moving away: kick now or lose it');
// Waiting for that ball grades better than lunging at it (court 6 leaves the timing to you).
const lunge=rally(6,{x:.5,y:4.3,z:.4,vy:2,vz:2.5,bounces:1},{},{bounceAge:.4});t.requestTennisKick(lunge,0);t.tickTennis(lunge,1/120);
const patient=rally(6,{x:.5,y:4.3,z:.4,vy:2,vz:2.5,bounces:1},{},{bounceAge:.4});for(let i=0;i<120&&patient.ball.last==='rival';i++){if(t.tennisTouchCall(patient)==='kick'||t.tennisTouchCall(patient)==='perfect')t.requestTennisKick(patient,0);t.tickTennis(patient,1/120);}
assert.equal(lunge.ball.last,'you');assert.equal(patient.ball.last,'you');assert(patient.touchQuality>lunge.touchQuality+.1,`following the call is cleaner (${patient.touchQuality.toFixed(2)} vs ${lunge.touchQuality.toFixed(2)})`);

// 3. Target Drill: rings sit on full-aim lanes; the lit button is the touch for the ring's depth; the cue names both.
const d=t.createTennis(9,3);t.beginTennis(d);const seen=new Set();
for(let i=0;i<60;i++){d.targetX=99;t.beginTennis(d);const shot=t.tennisTargetShot(d);seen.add(shot+(d.targetX<0?'L':'R'));
 assert(Math.abs(Math.abs(d.targetX)-(shot==='drop'?t.TENNIS_DRILL_LANE*.7:t.TENNIS_DRILL_LANE))<1e-9,'ring on a full-aim lane');}
assert.equal(seen.size,6,'all three depths on both sides');
const lane=(shot,x)=>{const s=rally(3,{x:.1,y:5.2,z:.3,vz:2,bounces:1},{},{bounceAge:.12});s.targetY=t.TENNIS_TARGET_DEPTHS[shot==='drop'?0:shot==='lob'?2:1];s.targetX=x;return s;};
for(const [shot,button,text] of [['drop','drop',/DROP · short ◀/],['auto','kick',/KICK · middle ◀/],['lob','lob',/LOB · deep ◀/]]){
 const s=lane(shot,-t.tennisAimX(1,shot));assert.equal(t.tennisHudButton(s),button);assert.match(t.tennisCallDetail(s),text);assert.doesNotMatch(t.tennisCallDetail(s),/into space|wide/,'no rival-space cue on the drill');
 s.shotAim=-1;assert(t.tennisDrillLinedUp(s),'full left aim lines up');s.shotAim=1;assert(!t.tennisDrillLinedUp(s));}
// Following the cue (lit touch + full aim) on a clean touch lands on the ring nearly every time.
let hits=0;for(let seed=1;seed<=30;seed++)for(const shot of ['drop','auto','lob']){const s=lane(shot,t.tennisAimX(seed%2?1:-1,shot));s.seed=seed*977;t.requestTennisKick(s,seed%2?1:-1,shot);for(let i=0;i<700&&s.phase==='rally';i++)t.tickTennis(s,1/120);hits+=s.drillHits;}
assert(hits>=80,`cue-following drill touches hit the ring (${hits}/90)`);
// The drill never lights an aerial touch: control with the feet, then place it.
const high=rally(3,{x:.1,y:5.2,z:1.7,vz:-.2});assert(t.canTennisHeader(high,'you'));assert(!['header','scissor','bicycle'].includes(t.tennisTouchCall(high)));
const highMatch=rally(4,{x:.1,y:5.2,z:1.7,vz:-.2});assert.equal(t.tennisTouchCall(highMatch),'header','match courts still call the header');

// 4. Straight-at-the-rival returns are counted (coach nudge); a wide aim, a lob or a drop resets the run.
const c=rally(1,{});const strike=(aim,shot='auto')=>{Object.assign(c.ball,{x:.1,y:5.2,z:.3,vx:0,vy:0,vz:2,last:'rival',crossed:true,bounces:1});c.bounceAge=.12;c.phase='rally';c.queuedKick=0;t.requestTennisKick(c,aim,shot);t.tickTennis(c,1/120);};
strike(0);strike(.1);strike(-.2);assert.equal(c.centerRun,3);strike(1);assert.equal(c.centerRun,0,'wide aim resets');strike(0);strike(0,'lob');assert.equal(c.centerRun,0,'a lob is a choice, not a straight return');
const dc=lane('auto',3.7);dc.centerRun=2;t.requestTennisKick(dc,0);t.tickTennis(dc,1/120);assert.equal(dc.centerRun,2,'the drill does not count');
// 5. Soft gate: a missed drill lowers the pass mark (6 → 5 → 4, floor 4); a pass resets it; stars stay 9/12.
const g=t.createTennis(5,3);assert.equal(t.tennisDrillPass(g),6);
const finish=(hits)=>{t.beginTennis(g);g.drillHits=hits;g.drillLeft=1;g.phase='rally';Object.assign(g.ball,{x:0,y:-3,z:.17,vx:0,vy:0,vz:-1,last:'you',crossed:true,bounces:0});g.targetX=4;g.targetY=-7;t.tickTennis(g,1/120);assert.equal(g.phase,'over');return g;};
finish(5);assert.equal(g.winner,'rival');assert.equal(g.stars,0);assert.match(g.message,/hit 5 to pass next time/);t.resetTennis(g);assert.equal(g.level,3);assert.equal(t.tennisDrillPass(g),5);
finish(5);assert.equal(g.winner,'you','five rings pass after one miss');assert.equal(g.stars,1);t.resetTennis(g);assert.equal(g.level,4);assert.equal(g.drillTries,0);
const floor=t.createTennis(5,3);for(let i=0;i<5;i++){floor.phase='over';floor.winner='rival';t.resetTennis(floor);}assert.equal(t.tennisDrillPass(floor),t.TENNIS_DRILL_MIN_PASS);
const m=t.createTennis(5,1);m.phase='over';m.winner='rival';t.resetTennis(m);assert.equal(m.drillTries,0,'match-court losses do not touch the drill mark');
const top=t.createTennis(5,3);t.beginTennis(top);top.drillHits=12;top.drillLeft=0;top.winner='you';assert.equal(t.tennisStars(top),3);top.drillHits=9;assert.equal(t.tennisStars(top),2);
assert.match(t.tennisStatus(g.level===3?g:floor),/rings to pass/);
console.log('PASS tennis aim + drill: aim cue never blank, KICK NOW waits for the body, drill lanes + lit depth touch + lined-up ring, no drill aerial calls, straight-return run');
