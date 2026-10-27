// Futbol Tennis round 3: the HARD courts (wind, bouncy floor, banana spin, best of 3 sets), the gentle first court,
// rally milestone rewards, set-aware match point, the 9-court unlock cap (old saves unchanged) and the bounce spot.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const store=new Map(),localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{exports:m.exports,module:m,Math,Number,JSON,console,localStorage,
  require:id=>id.startsWith('@/')?load(path.resolve(id.slice(2)+'.ts')):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
const t=load('lib/games/soccerTennis.ts'),rec=load('lib/arcade/arcadeRecords.ts');
const C=t.TENNIS_COURTS,advance=(s,sec,hz=120)=>{for(let i=0;i<Math.round(sec*hz);i++)t.tickTennis(s,1/hz);};
function rally(level,ball,extra={}){const s=t.createTennis(47,level);s.phase='rally';s.rally=3;s.aiReaction=99;Object.assign(s,extra);Object.assign(s.you,{x:0,y:5.3,targetX:0,targetY:5.3,vx:0,vy:0});Object.assign(s.ball,{vx:0,vy:0,vz:0,wx:0,wy:0,wz:0,last:'rival',crossed:true,bounces:1},ball);return s;}

// 1. Ladder: six courts, then three HARD ones (tier 6) with a faster, sharper rival and one modifier each.
assert.equal(C.length,9);assert.equal(t.TENNIS_HARD_FROM,7);
assert(C.slice(6).every(c=>c.hard&&c.tier===6)&&C.slice(0,6).every(c=>!c.hard));
assert(C[6].wind>0&&C[7].bounce>1.1&&C[7].spin>0&&C[8].sets===2&&C[8].spin>0,'wind · bouncy + spin · best of 3');
assert(C[6].speed>C[5].speed&&C[8].reaction<C[5].reaction&&C[8].sharp>C[5].sharp,'hard rivals are faster and sharper');
assert.equal(t.tennisAssist(t.createTennis(1,9)),0,'no hidden assist on the hard courts');
// Gentle first court: first to 5, a slower and looser rival than court 2.
assert.equal(t.tennisPointsToWin(1),5);assert.equal(t.tennisPointsToWin(2),7);assert(C[0].pace>C[1].pace&&C[0].error>C[1].error);

// 2. Wind: a new wind each point on court 7 only; it bends YOUR shot (35% help), the landing predictions include it.
const w=t.createTennis(9,7);t.beginTennis(w);assert(Math.abs(w.wind)>=C[6].wind*.6-1e-9&&Math.abs(w.wind)<=C[6].wind+1e-9,'court 7 has a breeze');
const calm=t.createTennis(9,2);t.beginTennis(calm);assert.equal(calm.wind,0,'calm on the classic courts');
function myShot(wind){const s=rally(7,{x:.2,y:4.6,z:.3,vy:2},{bounceAge:.1});s.wind=wind;s.shotAim=0;t.requestTennisKick(s,0);for(let i=0;i<40&&s.ball.last!=='you';i++)t.tickTennis(s,1/120);assert.equal(s.ball.last,'you');return t.tennisLanding(s).x;}
const still=myShot(0),right=myShot(1.5),left=myShot(-1.5);
assert(right-still>.15&&still-left>.15,`the wind drifts your shot (${left.toFixed(2)} · ${still.toFixed(2)} · ${right.toFixed(2)})`);

// 3. Bouncy floor: a bigger rebound on court 8; grass (court 9) skids lower.
function rebound(level){const s=rally(level,{x:0,y:3,z:.6,vz:-6,vy:1,bounces:0,last:'rival',crossed:true});for(let i=0;i<120&&s.ball.bounces===0;i++)t.tickTennis(s,1/240);return s.ball.vz;}
const base=rebound(4),bouncy=rebound(8),grass=rebound(9);assert(bouncy>base*1.15,`bouncy floor (${bouncy.toFixed(2)} vs ${base.toFixed(2)})`);assert(grass<base,'grass stays low');

// 4. Banana spin: the court-8 rival curls its drives (big sidespin), landing still on the planned spot.
let curled=0;for(let seed=1;seed<=30;seed++){const s=t.createTennis(seed*7919,8);s.phase='rally';s.rally=2;Object.assign(s.ball,{x:0,y:-5.3,z:.5,vx:0,vy:0,vz:0,last:'you',crossed:true,bounces:1});Object.assign(s.rival,{x:0,y:-5.3});
 t.tickTennis(s,1/120);if(s.ball.last==='rival'&&(s.lastShot==='auto'||s.lastShot==='drive')&&Math.abs(s.ball.wz)>=C[7].spin*.6)curled++;}
assert(curled>5,`the spring king bananas its drives (${curled})`);

// 5. Best of 3: court 9 plays sets to 4; the match ends when one side wins 2 sets; the score resets between sets.
const cup=t.createTennis(47,9);t.beginTennis(cup);let resets=0,last=0;
for(let i=0;i<600*120&&cup.phase!=='over';i++){if(cup.phase==='serve')t.requestTennisKick(cup);if(cup.phase==='rally'&&cup.ball.last==='rival'){const l=t.tennisLanding(cup);t.setTennisTarget(cup,l.x,l.y);t.requestTennisKick(cup);}
 t.tickTennis(cup,1/120);const sum=cup.score.you+cup.score.rival;if(sum<last)resets++;last=sum;}
assert.equal(cup.phase,'over','the cup finishes');const winner=cup.winner;assert.equal(cup.sets[winner],2,'two sets win the cup');assert(cup.setEvents>=1&&resets>=1,'a set ends and the score resets');
assert(cup.pointsPlayed>=8&&cup.pointsPlayed<=21);
// Match point is set-aware; stars: the 3rd star on the cup is a win without dropping a set.
const fm=load('lib/arcade/tennisFeel.ts');
assert.equal(fm.tennisMatchPoint({score:{you:3,rival:0},level:9,sets:{you:0,rival:0}}),'','set point, not match point');
assert.equal(fm.tennisMatchPoint({score:{you:3,rival:0},level:9,sets:{you:1,rival:0}}),'you');
assert.equal(fm.tennisWindArrow(-1.4),'◀◀');assert.equal(fm.tennisWindArrow(.8),'▶');assert.equal(fm.tennisWindArrow(.05),'');
const st=t.createTennis(1,9);st.winner='you';st.perfectTouches=4;st.sets={you:2,rival:0};assert.equal(t.tennisStars(st),3);st.sets.rival=1;assert.equal(t.tennisStars(st),2);
const wp=t.createTennis(1,7);wp.winner='you';wp.bestRally=10;assert.equal(t.tennisStars(wp),2,'windy pier 3rd star: a 10-touch rally');

// 6. Rally milestones: touch 5 (10, 15 …) pops a milestone and +1 on the Golden Touch meter (not on the drill).
const m=rally(2,{x:.2,y:4.6,z:.3,vy:2},{bounceAge:.1,rally:4});t.requestTennisKick(m,0);for(let i=0;i<40&&m.ball.last!=='you';i++)t.tickTennis(m,1/120);
assert.equal(m.rally,5);assert.equal(m.milestoneEvents,1);assert.equal(m.rallyMilestone,5);assert(m.gold>=1,'milestone feeds the gold meter');
const n=rally(2,{x:.2,y:4.6,z:.3,vy:2},{bounceAge:.1,rally:5});t.requestTennisKick(n,0);for(let i=0;i<40&&n.ball.last!=='you';i++)t.tickTennis(n,1/120);assert.equal(n.milestoneEvents,0,'touch 6 is not a milestone');
assert.deepEqual([...t.TENNIS_RALLY_MILESTONES],[5,10,15,20,30]);

// 7. Saves: tennis unlocks up to 9 courts on the same key; old saves read unchanged; other games stay capped at 6.
assert.equal(rec.arcadeUnlockCap('tennis'),9);assert.equal(rec.arcadeUnlockCap('runner'),6);
const J=JSON.stringify;
store.set('fi2-arcade-record-tennis-v1',J({best:14,unlocked:6}));assert.equal(J(rec.readArcadeRecord('tennis')),J({best:14,unlocked:6}),'an old save reads as before');
rec.saveArcadeRecord('tennis',3,7);assert.equal(J(rec.readArcadeRecord('tennis')),J({best:14,unlocked:7}),'winning court 6 unlocks the first HARD court');
rec.saveArcadeRecord('tennis',3,99);assert.equal(rec.readArcadeRecord('tennis').unlocked,9);
rec.saveArcadeRecord('runner',1,9);assert.equal(rec.readArcadeRecord('runner').unlocked,6);
// Stars: an old 6-court stars array pads with zeros for the new courts.
store.set('fi2-tennis-stars-v1',JSON.stringify([3,2,1,0,0,1]));assert.equal(J(fm.readTennisStars()),J([3,2,1,0,0,1,0,0,0]));

// 8. Bounce spot decal: shrinks as the ball closes in (pure scale curve).
const spot=load('lib/arcade/tennisBounceSpot.ts');assert(spot.tennisBounceSpotScale(1)>spot.tennisBounceSpotScale(.5)&&spot.tennisBounceSpotScale(.5)>spot.tennisBounceSpotScale(0));
assert.equal(spot.tennisBounceSpotScale(5),spot.TENNIS_BOUNCE_SPOT.max);
console.log('TENNIS_R3_COURTS_PASS 9-court ladder, gentle court 1, wind drift, bouncy/grass bounce, banana spin, best of 3, set-aware match point, milestones, 9-court saves, bounce spot');
