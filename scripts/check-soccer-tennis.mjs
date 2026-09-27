import './register-local-ts.mjs';
import assert from 'node:assert/strict';
const {createTennis,beginTennis,resetTennis,requestTennisKick,tickTennis,setTennisTarget,canTennisKick,tennisLanding,tennisNeedsFrames}=await import('../lib/games/soccerTennis.ts');
const advance=(s,seconds)=>{for(let i=0;i<seconds*120;i++)tickTennis(s,1/120);};
const s=createTennis(47);assert.equal(s.phase,'ready');assert.equal(tennisNeedsFrames(s),false);beginTennis(s);assert.equal(s.phase,'serve');assert.equal(tennisNeedsFrames(s),false,'human serve sleeps until input');
requestTennisKick(s);tickTennis(s,1/120);assert.equal(s.phase,'rally');assert.equal(s.ball.last,'you');assert.equal(s.rally,1);let maxHeight=0;
for(let i=0;i<360&&s.rally===1;i++){tickTennis(s,1/120);maxHeight=Math.max(maxHeight,s.ball.z);}assert(maxHeight>2);assert(s.rally>=2,'AI returns a reachable serve');assert.equal(s.ball.last,'rival');
advance(s,7);assert(s.score.you+s.score.rival>0,'an unanswered rally awards a point');
const receive=createTennis();beginTennis(receive);receive.phase='rally';Object.assign(receive.ball,{x:.4,y:5.2,z:.6,vx:0,vy:3,vz:-1,last:'rival',crossed:true});assert(canTennisKick(receive,'you'));requestTennisKick(receive);tickTennis(receive,1/120);assert.equal(receive.ball.last,'you');assert(receive.ball.vy<0);const landing=tennisLanding(receive);assert(landing.y<0&&landing.y>-8&&Math.abs(landing.x)<5,'return targets legal opposite court');
requestTennisKick(receive);tickTennis(receive,1/120);assert.equal(receive.rally,1,'one player cannot return their own shot');
const net=createTennis();beginTennis(net);net.phase='rally';Object.assign(net.ball,{x:0,y:.01,z:.6,vx:0,vy:-5,vz:0,last:'you',crossed:false});advance(net,.6);assert.equal(net.score.rival,1,'net fault awards opponent');
const bounce=createTennis();beginTennis(bounce);bounce.phase='rally';bounce.aiReaction=99;Object.assign(bounce.ball,{x:3,y:-4,z:.18,vx:0,vy:0,vz:-1,last:'you',crossed:true,bounces:0});tickTennis(bounce,.02);assert.equal(bounce.ball.bounces,1);assert.equal(bounce.score.you,0);advance(bounce,1);assert.equal(bounce.score.you,1,'second bounce awards last hitter');
const out=createTennis();beginTennis(out);out.phase='rally';Object.assign(out.ball,{x:5.5,y:-4,z:.18,vx:0,vy:0,vz:-1,last:'you',crossed:true});tickTennis(out,.02);assert.equal(out.score.rival,1,'out before legal bounce faults hitter');
const match=createTennis();beginTennis(match);for(let i=0;i<7;i++){match.phase='rally';Object.assign(match.ball,{x:0,y:-.01,z:.6,vx:0,vy:5,vz:0,last:'rival',crossed:false});advance(match,.6);}assert.equal(match.phase,'over');assert.equal(match.score.you,7);assert.equal(match.winner,'you');assert.equal(tennisNeedsFrames(match),false);advance(match,3);assert.equal(match.score.you,7,'finished match cannot score again');resetTennis(match);assert.equal(match.score.you,0);assert.equal(match.score.rival,0);assert.equal(match.phase,'ready');assert.equal(match.winner,null);
setTennisTarget(match,999,-999);assert.equal(match.you.targetX,4.55);assert.equal(match.you.targetY,.95);beginTennis(match);advance(match,10);assert(match.you.x<=4.6&&match.you.y>=.9,'movement stays on own court');
const a=createTennis(8),b=createTennis(8);for(const game of[a,b]){beginTennis(game);requestTennisKick(game);advance(game,8);}assert.deepEqual(a,b,'seeded simulation is repeatable');
const skilled=createTennis(47);beginTennis(skilled);for(let i=0;i<120*240&&skilled.phase!=='over';i++){if(skilled.phase==='serve')requestTennisKick(skilled);if(skilled.phase==='rally'&&skilled.ball.last==='rival'){const land=tennisLanding(skilled);setTennisTarget(skilled,land.x,land.y);requestTennisKick(skilled);}tickTennis(skilled,1/120);}assert.equal(skilled.phase,'over','A complete match reaches a winner');assert.ok(['you','rival'].includes(skilled.winner));assert.ok(Number.isFinite(skilled.ball.x+skilled.ball.y+skilled.ball.z),'Long rallies remain finite');
console.log('SOCCER_TENNIS_SIM_PASS serve, rally, return, net, bounces, out, score7, reset, movement bounds, deterministic AI');

const {setTennisMovement,canTennisSlam}=await import('../lib/games/soccerTennis.ts');
const jog=createTennis(),sprint=createTennis(),diagonal=createTennis();
for(const game of [jog,sprint,diagonal])beginTennis(game);
setTennisMovement(jog,.3,0);setTennisMovement(sprint,1,0);setTennisMovement(diagonal,1,-1);
advance(jog,.35);advance(sprint,.35);advance(diagonal,.35);
assert(Math.abs(jog.you.vx/sprint.you.vx-.3)<.01,'analog deflection controls jogging speed');
assert(Math.abs(Math.hypot(diagonal.you.vx,diagonal.you.vy)-sprint.you.vx)<.01,'diagonal input cannot run faster');
const releaseX=sprint.you.x;setTennisMovement(sprint,0,0);advance(sprint,1);
assert(sprint.you.x-releaseX<.32,'release brakes promptly instead of pursuing stale stick target');
assert.equal(sprint.you.vx,0);assert.equal(tennisNeedsFrames(sprint),false,'released human serve sleeps after braking');
setTennisTarget(sprint,-2,4);advance(sprint,3);
assert(Math.abs(sprint.you.x+2)<.01&&Math.abs(sprint.you.y-4)<.01,'pointer arrival settles without orbiting');
assert.equal(tennisNeedsFrames(sprint),false,'pointer arrival sleeps');
const seam=createTennis();beginTennis(seam);seam.phase='rally';
Object.assign(seam.ball,{x:0,y:5.3,z:1.1,vx:0,vy:0,vz:-1,last:'rival',crossed:true});
assert(canTennisKick(seam,'you'),'waist-high ball has no dead contact-height gap');
assert(!canTennisSlam(seam,'you'));
const stale=createTennis();beginTennis(stale);stale.phase='rally';stale.aiReaction=99;
Object.assign(stale.ball,{x:0,y:2,z:4,vx:0,vy:0,vz:0,last:'rival',crossed:true});
requestTennisKick(stale);advance(stale,.4);assert.equal(stale.queuedKick,0,'early kick does not remain queued for most of a second');
const swept=createTennis();beginTennis(swept);swept.phase='rally';swept.aiReaction=99;
Object.assign(swept.ball,{x:0,y:.001,z:1.35,vx:0,vy:-20,vz:-35,last:'you',crossed:false});
tickTennis(swept,1/120);assert(swept.ball.crossed&&!swept.ball.netHit,'net checks height at crossing, not lower end-of-step height');
const at30=createTennis(23),at60=createTennis(23);
for(const game of [at30,at60]){beginTennis(game);setTennisMovement(game,.5,-.3);}
for(let i=0;i<30;i++)tickTennis(at30,1/30);
for(let i=0;i<60;i++)tickTennis(at60,1/60);
assert(Math.hypot(at30.you.x-at60.you.x,at30.you.y-at60.you.y)<.001,'30/60 Hz controls share the same simulation motion');
console.log('SOCCER_TENNIS_FLUIDITY_PASS analog, diagonal, release, arrival, contact window, buffer, swept net, cadence');

// Follow the actual sleep predicate instead of continuing to tick a sleeping game.
for(const hz of [24,30,60,90,120]){
 const rest=createTennis();beginTennis(rest);setTennisMovement(rest,1,0);advance(rest,.25);setTennisMovement(rest,0,0);
 let frames=0;while(tennisNeedsFrames(rest)&&frames++<hz*2)tickTennis(rest,1/hz);
 assert(frames<hz*2,`released serve sleeps at ${hz} Hz`);
 assert.equal(rest.you.vx,0,`sleep waits for full braking at ${hz} Hz`);
}
console.log('SOCCER_TENNIS_SLEEP_PASS 24/30/60/90/120 Hz release reaches exact rest');

const contact=(seed=47)=>{const game=createTennis(seed);beginTennis(game);game.phase='rally';game.aiReaction=99;Object.assign(game.ball,{x:0,y:5.3,z:.55,vx:0,vy:0,vz:-1,last:'rival',crossed:true});return game;};
const left=contact(),right=contact();
for(const [game,aim] of [[left,-1],[right,1]]){setTennisMovement(game,aim,0);setTennisMovement(game,0,0);requestTennisKick(game);tickTennis(game,1/120);}
assert(tennisLanding(left).x<-2&&tennisLanding(right).x>2,'last horizontal intent deliberately controls placement after releasing movement');
assert.equal(left.cleanReturns,1,'planted close contact is a clean return');
assert.equal(left.lastShot,'drive','planted low contact consistently drives rather than randomly choosing flight');
const stretched=contact();stretched.you.x=1.1;requestTennisKick(stretched);tickTennis(stretched,1/120);assert.equal(stretched.cleanReturns,0,'stretching loses clean-contact quality');
for(const [humanY,expected]of [[6.8,'drop'],[2,'lob']]){
 const game=createTennis();beginTennis(game);game.phase='rally';game.you.y=game.you.targetY=humanY;game.aiReaction=0;
 Object.assign(game.ball,{x:0,y:-5.3,z:.55,vx:0,vy:0,vz:-1,last:'you',crossed:true});tickTennis(game,1/120);
 assert.equal(game.lastShot,expected,'rival punishes the space left by camping');assert(game.rivalIntent.length>10,'tactical return has readable intent');
}
console.log('SOCCER_TENNIS_SKILL_PASS deliberate placement, planted drive, contact quality, tactical rival');

const followThrough=contact();requestTennisKick(followThrough,-1);tickTennis(followThrough,1/120);
const strikeFacing=followThrough.you.kickFacing;advance(followThrough,.2);
assert.equal(followThrough.you.kickFacing,strikeFacing,'strike orientation does not chase the departing ball');
assert(followThrough.you.kick>0,'contact flows into recovery instead of ending immediately');
const recover=createTennis();beginTennis(recover);recover.phase='rally';recover.you.x=recover.you.targetX=3;recover.you.y=recover.you.targetY=7;
Object.assign(recover.ball,{x:5.5,y:-4,z:.18,vx:0,vy:0,vz:-1,last:'you',crossed:true});tickTennis(recover,1/120);
const pointX=recover.you.x;advance(recover,.7);assert(recover.you.x<pointX-1,'players recover toward baseline while point is announced');
assert.equal(recover.pointWinner,'rival');advance(recover,1);assert.equal(recover.pointWinner,null,'next serve clears celebration');
console.log('SOCCER_TENNIS_MOTION_PASS strike orientation, follow-through, active point recovery');

const soft=contact(),firm=contact(),aerial=contact();
for(const game of [soft,firm,aerial]){game.ball.x=.4;game.ball.y=5.45;}
aerial.ball.z=1.55;
requestTennisKick(soft,0,'drop');requestTennisKick(firm,0,'drive');requestTennisKick(aerial,0,'slam');
for(const game of [soft,firm,aerial])tickTennis(game,1/120);
assert.equal(soft.you.kickKind,'pass');assert.equal(firm.you.kickKind,'shot');
assert(soft.you.kickPower<firm.you.kickPower,'soft drop and firm drive give the rig distinct strike energy');
assert.equal(aerial.you.kickStyle,2);assert(aerial.you.kickHeight>1.4,'high-ball volley remembers contact height');
const committed=[firm.you.kickContactX,firm.you.kickContactZ];
assert(Math.abs(committed[0])>.2,'off-centre contact retains its lateral boot target');
const theta=firm.you.kickFacing;
assert(Math.abs(committed[0]*Math.cos(theta)+committed[1]*Math.sin(theta)-.4)<.01,'stored contact reconstructs the physical lateral offset');
advance(firm,.2);assert.deepEqual([firm.you.kickContactX,firm.you.kickContactZ],committed,'strike target stays committed while ball departs');
console.log('SOCCER_TENNIS_BEAN_CONTACT_PASS contact frame, latched target, shot energy, aerial height');

const {canTennisHeader,canTennisScissor}=await import('../lib/games/soccerTennis.ts');
const aerialReturn=(shot)=>{const game=contact();Object.assign(game.ball,{x:.25,y:5.15,z:1.8,vz:-.5});requestTennisKick(game,0,shot);tickTennis(game,1/120);return game;};
const overhead=aerialReturn('slam'),scissor=aerialReturn('scissor'),header=aerialReturn('header');
assert.equal(scissor.lastShot,'scissor');assert.equal(header.lastShot,'header');assert.equal(scissor.you.kickStyle,4);assert.equal(header.you.kickStyle,3);
assert(Math.hypot(scissor.ball.vx,scissor.ball.vy)>Math.hypot(overhead.ball.vx,overhead.ball.vy)*1.1,'scissor earns materially more pace than the normal aerial volley');
assert(scissor.you.kickSpan>overhead.you.kickSpan,'power scissor carries a longer landing/recovery');
for(const game of[scissor,header]){const land=tennisLanding(game);assert(land.y<0&&land.y>-8&&Math.abs(land.x)<5,'clean aerial return lands on opposite court');}
assert(tennisLanding(header).time>tennisLanding(scissor).time*1.5,'header trades power for a more controlled flight');
const low=contact();assert(!canTennisHeader(low,'you')&&!canTennisScissor(low,'you'));requestTennisKick(low,0,'header');tickTennis(low,1/120);assert.equal(low.kickCount,0,'Header does not silently become a foot kick on a low ball');
const serveOnly=createTennis();beginTennis(serveOnly);requestTennisKick(serveOnly,0,'scissor');tickTennis(serveOnly,1/120);assert.equal(serveOnly.phase,'serve','aerial buttons cannot replace the foot serve');
const own=contact();own.ball.last='you';own.ball.z=1.8;assert(!canTennisHeader(own,'you')&&!canTennisScissor(own,'you'),'aerial moves cannot double-touch own return');
const gap=contact();gap.ball.z=1.8;gap.ball.x=1.2;assert(!canTennisScissor(gap,'you'),'scissor requires closer positioning than ordinary kick reach');
console.log('SOCCER_TENNIS_AERIAL_PASS header/scissor contact, extra power, recovery, legal placement, deliberate windows');
