// Futbol Tennis depth: ladder, patient first touch, trap & set, golden touch, shark/bicycle/slide/flick moves,
// rival personalities and fakes, target drill, stars, rally tempo and bounded adaptive help.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{exports:m.exports,module:m,Math,Number,JSON,console,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
const t=load('lib/games/soccerTennis.ts');
const advance=(s,seconds,hz=120)=>{for(let i=0;i<Math.round(seconds*hz);i++)t.tickTennis(s,1/hz);};
function rally(level,ball,you={},extra={}){const s=t.createTennis(47,level);s.phase='rally';s.rally=3;s.aiReaction=99;Object.assign(s,extra);Object.assign(s.you,{x:0,y:5.3,targetX:0,targetY:5.3,vx:0,vy:0},you);Object.assign(s.ball,{vx:0,vy:0,vz:0,wx:0,wy:0,wz:0,last:'rival',crossed:true,bounces:0},ball);return s;}

// 1. The ladder: six stops, each with a surface/rule, a personality and a counter to learn.
const C=t.TENNIS_COURTS;assert.equal(C.length,6);
assert.equal(C.map(c=>c.style).join(),'steady,baseliner,drill,rusher,trickster,champion');
assert.equal(C[0].aerial,false,'court 1 keeps the controls simple');assert(C.slice(1).every(c=>c.aerial));
assert.equal(C[1].surface,'sand');assert(C.some(c=>c.touches===2));
for(let i=1;i<C.length;i++)assert(C[i].tier>=C[i-1].tier,'difficulty never steps back');
assert(C.filter(c=>c.style!=='drill').every((c,i,a)=>i===0||c.speed>a[i-1].speed),'rival footspeed rises monotonically');

// 2. Patient first touch: on court 1 an early press waits for the ball to come in; court 6 strikes at once.
const early=rally(1,{x:.2,y:4.25,z:.3,vy:3,bounces:1},{},{bounceAge:.3});t.requestTennisKick(early);t.tickTennis(early,1/120);
assert.equal(early.ball.last,'rival','court 1 holds the pressed kick while the ball is still coming');assert(t.tennisKickCue(early)==='step');
for(let i=0;i<60&&early.ball.last==='rival';i++)t.tickTennis(early,1/120);
assert.equal(early.ball.last,'you','the held kick fires');assert(early.touchQuality>=.72,'and is clean');
const raw=rally(6,{x:.2,y:4.25,z:.3,vy:3,bounces:1},{},{bounceAge:.3});t.requestTennisKick(raw);t.tickTennis(raw,1/120);
assert.equal(raw.ball.last,'you','the final leaves timing to you');assert(raw.touchQuality<early.touchQuality);
assert.equal(t.tennisAssist(t.createTennis(1,1)),1);assert.equal(t.tennisAssist(t.createTennis(1,6)),0);
// A high ball out of comfortable reach is never swatted at full stretch.
const far=rally(6,{x:1.1,y:5.3,z:1.6,vz:-.2});t.requestTennisKick(far);t.tickTennis(far,1/120);
assert.equal(far.ball.last,'rival','no stretched spike: let it drop');assert.equal(t.tennisKickCue(far),'drop');

// 3. Trap & set (two-touch courts only).
const one=rally(1,{x:.15,y:5,z:.8,vy:1,bounces:1},{},{bounceAge:.3});t.requestTennisKick(one,0,'trap');t.tickTennis(one,1/120);
assert.equal(one.trapEvents,0,'one-touch courts refuse the trap');assert.match(one.message,/One touch/);
const trap=rally(4,{x:.15,y:5,z:.8,vy:1,bounces:1},{},{bounceAge:.3});assert(t.canTennisTrap(trap));t.requestTennisKick(trap,0,'trap');t.tickTennis(trap,1/120);
assert.equal(trap.trapEvents,1);assert.equal(trap.youTrapped,true);assert(trap.ball.vz>0&&trap.ball.y>0,'the ball pops up on your own side');assert.equal(trap.you.kickStyle,8,'thigh trap pose below the chest');
assert.equal(trap.rally,3,'a trap is a touch, not a return');assert(!t.canTennisTrap(trap),'only one trap per side');
let kicked=false;for(let i=0;i<240&&!kicked;i++){if(t.canTennisKick(trap,'you'))t.requestTennisKick(trap,0);t.tickTennis(trap,1/120);kicked=trap.ball.last==='you';}
assert(kicked,'set ball is struck');assert.equal(trap.touchGrade,'perfect','set & strike counts as a perfect touch');assert.match(trap.message,/SET & STRIKE/);
const chestTrap=rally(4,{x:.1,y:5.1,z:1.0,vz:-.5});t.requestTennisKick(chestTrap,0,'trap');t.tickTennis(chestTrap,1/120);assert.equal(chestTrap.you.kickStyle,5,'chest trap above the waist');

// 4. Golden touch: 5 perfect touches charge it; the next shot is pure and the meter resets. Scissor → bicycle.
const gold=rally(1,{});gold.gold=t.TENNIS_GOLD-1;gold.bounceAge=.12;Object.assign(gold.ball,{x:.1,y:5.2,z:.3,vz:2,bounces:1});t.requestTennisKick(gold);t.tickTennis(gold,1/120);
assert.equal(gold.touchGrade,'perfect');assert.equal(gold.goldReady,true,'the fifth perfect touch charges the golden touch');
const golden=rally(2,{x:.2,y:5.2,z:.35,bounces:1},{},{bounceAge:.4,goldReady:true,gold:t.TENNIS_GOLD});t.requestTennisKick(golden);t.tickTennis(golden,1/120);
assert.equal(golden.goldenShot,true);assert.equal(golden.touchQuality,1);assert.equal(golden.goldReady,false);assert.equal(golden.gold,0);assert.equal(golden.goldenUsed,1);
const bike=rally(2,{x:.2,y:5.1,z:1.8,vz:-.2},{},{goldReady:true,gold:t.TENNIS_GOLD});assert(t.canTennisBicycle(bike));t.requestTennisKick(bike,0,'scissor');t.tickTennis(bike,1/120);
assert.equal(bike.lastShot,'bicycle');assert.equal(bike.you.kickStyle,6);assert(bike.you.down>.5,'you land on your back: slow to recover');assert(t.tennisLanding(bike).y<0);
const sloppy=rally(6,{x:1.2,y:5.3,z:.3,bounces:1},{},{bounceAge:.4,gold:2});t.requestTennisKick(sloppy);t.tickTennis(sloppy,1/120);assert.equal(sloppy.gold,1,'a scrappy touch takes one pip back (never the whole meter)');

// 5. Shark attack near the net; sliding stretch for a ball passing out of reach; rainbow-flick serve.
const shark=rally(4,{x:.25,y:2,z:1.7,vy:.5,vz:-.3},{y:2.2,targetY:2.2});assert(t.canTennisShark(shark));t.requestTennisKick(shark);t.tickTennis(shark,1/120);
assert.equal(shark.lastShot,'shark');assert.equal(shark.you.kickStyle,7);const sl=t.tennisLanding(shark);assert(sl.y<0&&sl.y>-5.5,'stamped down into the front half');
const slide=rally(4,{x:1.7,y:5.4,z:.3,vx:2.5,vy:.3,bounces:1},{},{bounceAge:.4});assert(t.canTennisDive(slide));t.requestTennisKick(slide);t.tickTennis(slide,1/120);
assert.equal(slide.lastShot,'dive');assert.equal(slide.you.kickStyle,9);assert(slide.you.down>.5);assert(slide.touchQuality<.5,'a last-resort stretch is never clean');
const coming=rally(4,{x:1.7,y:4,z:.3,vx:-2,vy:2,bounces:1},{},{bounceAge:.4});assert(!t.canTennisDive(coming),'no slide when the ball will still come to you');
const flick=t.createTennis(47,2);t.beginTennis(flick);t.requestTennisKick(flick,0,'lob');t.tickTennis(flick,1/120);
assert.equal(flick.lastShot,'flick');assert.equal(flick.you.kickStyle,10);assert(t.tennisLanding(flick).y<-5,'rainbow flick serve lands deep');

// 6. Personalities: deep defender hangs back, rusher charges the net, trickster's fake switches sides.
const deep=t.createTennis(5,2);deep.phase='rally';Object.assign(deep.ball,{x:1,y:3,z:3,last:'rival',crossed:true});t.tickTennis(deep,1/120);assert(deep.rival.targetY<-6,'deep defender recovers to the baseline');
const rush=t.createTennis(5,4);rush.phase='rally';Object.assign(rush.ball,{x:1,y:3,z:3,last:'rival',crossed:true});t.tickTennis(rush,1/120);assert(rush.rival.targetY>-3,'net rusher charges the net');
function fake(force){const s=t.createTennis(9,5);s.phase='rally';s.rally=4;Object.assign(s.you,{x:-.2,y:4.6,targetX:-.2,targetY:4.6});Object.assign(s.rival,{x:0,y:-5.3,targetX:0,targetY:-5.3});Object.assign(s.ball,{x:.1,y:-.5,z:1.5,vx:0,vy:-4.6,vz:.4,last:'you',crossed:true,bounces:0});
 let planX=0,shown=false;const k=s.kickCount;for(let i=0;i<360&&s.kickCount===k;i++){t.tickTennis(s,1/120);if(s.rivalPlan){s.rivalFake=force;planX=s.rivalPlanX;}shown=shown||s.fakeShown;}return{s,planX,shown};}
const honest=fake(false),faked=fake(true);
assert(faked.shown,'the fake is shown before contact');assert.match(faked.s.message,/FAKE/);
assert(Math.sign(t.tennisLanding(faked.s).x)!==Math.sign(faked.planX),'after the fake the ball goes the other way');
assert.equal(Math.sign(t.tennisLanding(honest.s).x),Math.sign(honest.planX),'without a fake it goes where it showed');

// 7. Target drill: the feeder serves 15 balls; hits are counted on the gold ring; stars by hits.
const drill=t.createTennis(3,3);t.beginTennis(drill);assert.equal(drill.drillLeft,15);assert.equal(drill.server,'rival');
for(let i=0;i<120*200&&drill.phase!=='over';i++){if(drill.phase==='rally'&&drill.ball.last==='rival'){const l=t.tennisSweetPoint(drill);t.setTennisTarget(drill,l.x,l.y+.15);if(t.canTennisKick(drill,'you')){const sh=t.tennisTargetShot(drill);t.requestTennisKick(drill,Math.max(-1,Math.min(1,drill.targetX/(3.7*(sh==='drop'?.7:1)))),sh);}}t.tickTennis(drill,1/120);}
assert.equal(drill.phase,'over');assert.equal(drill.drillLeft,0);assert.equal(drill.score.you+drill.score.rival,15);
assert(drill.drillHits>=t.TENNIS_DRILL.stars[0],`an aimed, patient drill passes (${drill.drillHits})`);assert.equal(drill.stars,t.TENNIS_DRILL.stars.filter(n=>drill.drillHits>=n).length);
assert(t.TENNIS_TARGET_DEPTHS.every(y=>y<0),'targets sit on the rival court');

// 8. Stars: win, 4 perfect touches, the court's habit.
const won=t.createTennis(1,2);won.winner='you';won.perfectTouches=4;won.habitWins=2;assert.equal(t.tennisStars(won),3);
won.habitWins=1;assert.equal(t.tennisStars(won),2);won.winner='rival';assert.equal(t.tennisStars(won),0,'no stars without the win, no penalty either');
const habit=t.createTennis(1,2);habit.phase='rally';habit.aiReaction=99;habit.lastKicker='you';habit.lastYouShot='drop';Object.assign(habit.ball,{x:1,y:-2,z:.18,vz:-1,last:'you',crossed:true});advance(habit,1.2);
assert.equal(habit.habitWins,1,'a drop-shot winner beats the deep defender habit');

// 9. Rally tempo steps every 5 touches (4 on late courts), capped, and resets every point.
assert.equal(t.tennisTempo({rally:4,level:1}),0);assert.equal(t.tennisTempo({rally:5,level:1}),1);assert.equal(t.tennisTempo({rally:50,level:1}),3,'court 1 caps the tempo');
assert(t.tennisTempo({rally:50,level:6})>t.tennisTempo({rally:50,level:1}));assert.equal(t.tennisTempo({rally:0,level:6}),0);

// 10. Hidden adaptive help stays bounded.
const help=t.createTennis(4,4);help.phase='rally';for(let i=0;i<12;i++){help.phase='rally';help.aiReaction=99;Object.assign(help.ball,{x:0,y:3,z:.18,vx:0,vy:0,vz:-1,last:'rival',crossed:true,bounces:1});advance(help,1.4);}
assert(help.assist>0&&help.assist<=1,'a losing run eases the rival a little');
// 12. Rival variety: each personality's everyday mix (you recovered to the middle) differs by court.
function mix(level){const n={};for(let seed=1;seed<=160;seed++){const s=t.createTennis(seed*7919,level);s.phase='rally';s.rally=3;Object.assign(s.you,{x:0,y:4.6,targetX:0,targetY:4.6});Object.assign(s.rival,{x:0,y:-5.3,targetX:0,targetY:-5.3});
 Object.assign(s.ball,{x:.1,y:-.5,z:1.5,vx:0,vy:-4.6,vz:.4,last:'you',crossed:true,bounces:0});for(let i=0;i<240&&!s.rivalPlan;i++)t.tickTennis(s,1/120);if(s.rivalPlan)n[s.rivalPlan]=(n[s.rivalPlan]||0)+1;}return n;}
const steady=mix(1),rusher=mix(4),trick=mix(5),champ=mix(6);
assert(steady.auto>=130,'the steady rival keeps it simple: '+JSON.stringify(steady));
assert((rusher.drive||0)>=50&&!(rusher.lob),'the net rusher drives low to come in: '+JSON.stringify(rusher));
assert((trick.drop||0)>(steady.drop||0)+30,'the trickster loves the short ball: '+JSON.stringify(trick));
assert(Object.keys(champ).length>=4,'the champion mixes every shot: '+JSON.stringify(champ));
// The steady rival's mid-court balls stay away from the lines (court 1 is a gentle start).
assert(t.TENNIS_COURTS[0].aim<t.TENNIS_COURTS[1].aim);
// 13. Rival headers on aerial courts; never on court 1.
function head(level,seed){const s=t.createTennis(seed,level);s.phase='rally';s.rally=3;s.aiHeader=true;Object.assign(s.rival,{x:0,y:-5,targetX:0,targetY:-5});Object.assign(s.ball,{x:.1,y:-5,z:1.8,vx:0,vy:0,vz:-.2,last:'you',crossed:true,bounces:0});t.tickTennis(s,1/120);return s;}
const rh=head(4,3);assert.equal(rh.lastShot,'header','an aerial-court rival heads a high ball');assert.equal(rh.rival.kickStyle,3);assert(t.tennisLanding(rh).y>0,'over to your side');assert.match(rh.message,/HEADS/);
let headers=0;for(let seed=1;seed<=200;seed++){const s=t.createTennis(seed*7919,1);t.beginTennis(s);t.requestTennisKick(s);t.tickTennis(s,1/120);headers+=s.aiHeader?1:0;}assert.equal(headers,0,'court 1 rival never plans a header');
// 14. Long rallies end: from court 4 the rival sometimes goes for the line, at some risk.
let finishes=0;for(let seed=1;seed<=200;seed++){const s=t.createTennis(seed*7919,6);s.phase='rally';s.rally=12;Object.assign(s.you,{x:0,y:4.6,targetX:0,targetY:4.6});Object.assign(s.ball,{x:.1,y:-.5,z:1.5,vx:0,vy:-4.6,vz:.4,last:'you',crossed:true,bounces:0});for(let i=0;i<240&&!s.rivalPlan;i++)t.tickTennis(s,1/120);if(s.rivalFinish){finishes++;assert.equal(s.rivalPlan,'drive');assert(Math.abs(s.rivalPlanX)>3.7);}}
assert(finishes>20&&finishes<150,'the finisher is a habit, not every ball: '+finishes);
// 15. Flight read: a ball flying long warns you to let it go; leaving it wins the point.
let found=null;for(let seed=1;seed<600&&!found;seed++){const s=t.createTennis(seed*7919,4);s.phase='rally';s.rally=4;s.aiSlam=false;s.aiHeader=false;s.aiReaction=0;Object.assign(s.you,{x:0,y:4.6,targetX:0,targetY:4.6});Object.assign(s.rival,{x:1.28,y:-5.3,targetX:1.28,targetY:-5.3});Object.assign(s.ball,{x:0,y:-5.3,z:.4,vx:0,vy:0,vz:0,last:'you',crossed:true,bounces:1});t.tickTennis(s,1/120);if(s.ball.last==='rival'&&s.incomingOut)found=s;}
assert(found,'some rival returns fly out');assert(found.outEvents>0);assert.match(found.message,/LONG/);
const land=t.tennisLanding(found);assert(Math.abs(land.x)>5||land.y>8,'the warning is honest: it lands out');
for(let i=0;i<600&&found.phase==='rally';i++)t.tickTennis(found,1/120);
assert.equal(found.pointKind,'out','left alone, it lands out');{assert.equal(found.pointWinner,'you');assert.match(found.message,/good leave/);}
// Head spot: a high incoming lob on an aerial court marks where it drops through head height.
let spot=null;for(let seed=1;seed<400&&!spot;seed++){const s=t.createTennis(seed*7919,6);s.phase='rally';s.rally=4;s.aiSlam=false;s.aiHeader=false;Object.assign(s.you,{x:0,y:2.9,targetX:0,targetY:2.9});Object.assign(s.rival,{x:0,y:-5.3,targetX:0,targetY:-5.3});Object.assign(s.ball,{x:.1,y:-.5,z:1.5,vx:0,vy:-4.6,vz:.4,last:'you',crossed:true,bounces:0});const k=s.kickCount;for(let i=0;i<360&&s.kickCount===k;i++)t.tickTennis(s,1/120);if(s.headSpot)spot=s;}
assert(spot,'a high lob gets a head spot');assert(spot.headY>0&&spot.headY<8&&Math.abs(spot.headX)<5);
let passZ=null;for(let i=0;i<400&&spot.ball.last==='rival';i++){const z0=spot.ball.z;t.tickTennis(spot,1/120);if(passZ===null&&z0>t.TENNIS_HEAD_HEIGHT&&spot.ball.z<=t.TENNIS_HEAD_HEIGHT&&spot.ball.vz<0){passZ=Math.hypot(spot.ball.x-spot.headX,spot.ball.y-spot.headY);}}
assert(passZ!==null&&passZ<.25,'the ball really drops through head height on the blue spot ('+passZ+')');
const flat=t.createTennis(5,1);assert.equal(flat.headSpot,false);
// 16. Court progression: the end card names the coach's takeaway and, after a win, the next rival.
const end=t.createTennis(1,2);end.winner='you';end.phase='over';end.stars=2;end.gradeCounts.heavy=4;
const detail=t.tennisOverDetail(end);assert.match(detail,/Coach: Heavy/);assert.match(detail,new RegExp('Next: '+t.TENNIS_COURTS[2].name));
end.winner='rival';assert.doesNotMatch(t.tennisOverDetail(end),/Next:/);end.stars=3;end.winner='you';assert.doesNotMatch(t.tennisOverDetail(end),/3rd star/,'no 3rd-star hint once it is earned');
// 11. Deterministic.
const a=t.createTennis(8,4),b=t.createTennis(8,4);for(const g of[a,b]){t.beginTennis(g);t.requestTennisKick(g);advance(g,10);}assert.equal(JSON.stringify(a),JSON.stringify(b));
console.log('PASS tennis depth: rival mixes/headers/finisher, flight read (out + head spot), coach card, ladder, patient touch, trap & set, golden/bicycle, shark/slide/flick, personalities + fake, drill, stars, tempo, adaptive help');
