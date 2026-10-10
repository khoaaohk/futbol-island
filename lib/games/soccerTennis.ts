/** Original, simplified arcade soccer tennis: singles, feet and headers, one bounce,
 * one return per side and first to seven. Not competition futnet rules.
 * The ball flies a real projectile path: gravity, quadratic air drag and Magnus
 * lift/curve from spin. Bounces lose energy through restitution + ground
 * friction (spin converts to roll), and the net tape is a live object — a ball
 * can thud into the mesh, clip the tape and dribble over, or fall back. */
export type TennisSide='you'|'rival';
export type TennisPhase='ready'|'serve'|'rally'|'point'|'over';
/** shot intents: auto picks drive/loop from contact; drop = soft short ball, lob = high & deep,
 * drive = flat topspin, slam = overhead spike (only available on a HIGH incoming ball) */
export type TennisShot='auto'|'drive'|'drop'|'lob'|'slam'|'header'|'scissor'|'chest'|'trap'|'bicycle'|'shark'|'dive'|'flick';
/** kickStyle drives the animation: 0 = soft tap, 1 = full swing, 2 = volley, 3 = header, 4 = scissor, 5 = chest trap,
 * 6 = bicycle kick, 7 = shark attack (jumping sole stamp), 8 = thigh trap, 9 = sliding stretch, 10 = rainbow-flick serve */
export interface TennisPlayer{x:number;y:number;vx:number;vy:number;targetX:number;targetY:number;kick:number;stride:number;kickStyle:number;moveX:number;moveY:number;direct:boolean;kickFacing:number;kickSpan:number;kickContactX:number;kickContactZ:number;kickHeight:number;kickPower:number;kickKind:'pass'|'shot'|'loft';
 /** Seconds still on the ground / landing after a bicycle kick or a sliding stretch (slow feet). */
 down:number;}
export interface TennisBall{
 x:number;y:number;z:number;vx:number;vy:number;vz:number;
 /** spin vector, rad/s — wx/wy tip the flight (top/backspin dip & lift), wz bends it sideways */
 wx:number;wy:number;wz:number;
 /** render helpers: accumulated roll angle, bounce-squash timer, net flag */
 rot:number;squash:number;netHit:boolean;
 last:TennisSide;bounces:number;crossed:boolean;
}
export interface TennisState{
 level:number;courtsWon:number;aiReadErrorX:number;aiReadErrorY:number;
 bounceAge:number;perfectTouches:number;perfectFlash:number;
 phase:TennisPhase;you:TennisPlayer;rival:TennisPlayer;ball:TennisBall;score:{you:number;rival:number};server:TennisSide;
 rally:number;bestRally:number;message:string;version:number;clock:number;phaseTime:number;queuedKick:number;aim:number|null;
 aiThink:number;aiReaction:number;seed:number;winner:TennisSide|null;
 /** shot system + fx (all mutated in place — the frame loop stays allocation-free) */
 queuedShot:TennisShot;lastShot:TennisShot;lastKicker:TennisSide;kickCount:number;aiSlam:boolean;
 fxSlam:number;fxSlamX:number;fxSlamY:number;fxSlamZ:number;
 fxLand:number;fxLandX:number;fxLandY:number;fxLandI:number;
 pointWinner:TennisSide|null;shotAim:number;cleanReturns:number;cleanStreak:number;bestCleanStreak:number;rivalIntent:string;
 /** First-touch read-out for the last kick: the visible lesson behind the hidden quality value. */
 touchGrade:TennisGrade;touchSide:TennisSide;touchQuality:number;
 /** The rival commits to a shot before contact (later on harder courts) so its body can telegraph it. */
 rivalPlan:TennisShot|null;rivalPlanX:number;rivalPlanAt:number;
 /** Visible AI mistakes: wrong-footed stumble timer, a ball it chose to let go, and how often you beat it. */
 rivalStumble:number;rivalLetGo:boolean;wrongFooted:number;
 /** How long the pressed kick has been patiently held for a closer ball. */
 kickHold:number;
 /** Golden touch: perfect touches fill the meter (0–TENNIS_GOLD); a full meter powers your next shot. */
 gold:number;goldReady:boolean;goldenShot:boolean;goldenUsed:number;
 /** Two-touch courts: a cushioned trap sets the ball up on your own side for a stronger second touch. */
 youTrapped:boolean;rivalTrapped:boolean;setBonus:number;trapEvents:number;trapSide:TennisSide;trapGrade:TennisGrade;
 /** Trickster fake: the rival shows a sole-roll, then switches sides. */
 rivalFake:boolean;fakeReads:number;fakeShown:boolean;
 /** Personality habit beaten (drop vs deep defender, lob vs net rusher …) and your last shot. */
 habitWins:number;lastYouShot:TennisShot;
 /** Hidden, bounded adaptive help: + after a run of lost points, − after a run of won points. */
 assist:number;winRun:number;lossRun:number;
 /** Target drill (challenge court): balls left, hits, the moving gold target. */
 drillLeft:number;drillHits:number;targetX:number;targetY:number;targetEvents:number;
 /** Stars earned when the court ends (0–3). */
 stars:number;
 /** Your touch grades this court (for the coach's takeaway), the perfect-touch streak,
  * and whether the last touch was a clean volley (taken before the bounce). */
 gradeCounts:Record<Exclude<TennisGrade,''>,number>;perfectStreak:number;touchVolley:boolean;
 /** The rival's read of a high ball: this exchange it will head it back if it can. */
 aiHeader:boolean;
 /** A long rally: the rival goes for a winner down the line (riskier contact). */
 rivalFinish:boolean;
 /** Flight read of the incoming ball, made once at the rival's contact: where it bounces,
  * whether it is flying out (let it go!) and, for a high ball, the spot to head it. */
 landX:number;landY:number;incomingOut:boolean;headSpot:boolean;headX:number;headY:number;outEvents:number;
 /** Times the rival planned its shot against where you stood (camped deep/close or left wide). */
 caught:number;
 /** Event counters + payloads for sound/visual layers (read-only outside the sim). */
 bounceEvents:number;netEvents:number;netKind:'net'|'over'|'back';netX:number;netPace:number;pointKind:TennisPointKind;
}
export type TennisGrade='perfect'|'good'|'heavy'|'early'|'late'|'stretched'|'';
export type TennisPointKind='space'|'letgo'|'net'|'out'|'miss'|'target'|'';
/** Contact quality grades. The early/late/stretched names tell the player which habit to fix. */
export const TENNIS_GRADE_TIPS:Record<Exclude<TennisGrade,''>,string>={perfect:'Early bounce, balanced feet.',good:'Clean touch.',heavy:'Heavy: slow your feet before the touch.',early:'Too early: let it bounce first.',late:'Late: meet it before it drops.',stretched:'Stretched: get your body beside the ball.'};
/** The tennis ladder. Each stop adds one football decision, a court surface or rule, and a rival
 * personality with a habit you can read and beat (`counter`). `tier` is the difficulty (1–5).
 * Rules stay arcade-simple: singles, one bounce; two-touch courts allow one trap first. */
export type TennisStyle='steady'|'baseliner'|'drill'|'rusher'|'trickster'|'champion';
export type TennisSurface='hard'|'sand';
export const TENNIS_COURTS=[
 {name:'First Touch',lesson:'Let it bounce, plant your feet, then kick.',style:'steady' as TennisStyle,surface:'hard' as TennisSurface,touches:1,aerial:false,tier:1,
  rival:'STEADY',habit:'Returns to the middle every time.',counter:'auto' as TennisShot,star3:'Keep an 8-touch rally',aim:1.6,sharp:0.7,pace:1.08,speed:4.3,reaction:0.32,error:1.15,read:.22,press:0},
 {name:'Beach Day',lesson:'Sand is slow and the bounce is low: move early, bend your knees.',style:'baseliner' as TennisStyle,surface:'sand' as TennisSurface,touches:1,aerial:true,tier:2,
  rival:'DEEP DEFENDER',habit:'Stays far back on the baseline.',counter:'drop' as TennisShot,star3:'Win 2 points with a Drop',aim:3.0,sharp:0.72,pace:1,speed:4.5,reaction:0.29,error:1.0,read:.2,press:0},
 {name:'Target Drill',lesson:'Control the ball, then place it on the gold target.',style:'drill' as TennisStyle,surface:'hard' as TennisSurface,touches:2,aerial:true,tier:2,
  rival:'BALL FEEDER',habit:'Feeds 15 balls. Hit 6 gold rings to pass.',counter:'auto' as TennisShot,star3:'Hit 12 targets',aim:2.4,sharp:0.9,pace:1,speed:0,reaction:.3,error:0,read:.2,press:0},
 {name:'Futnet Rules',lesson:'Two touches: trap it soft, then strike. Lob the rusher.',style:'rusher' as TennisStyle,surface:'hard' as TennisSurface,touches:2,aerial:true,tier:3,
  rival:'NET RUSHER',habit:'Runs to the net after every shot.',counter:'lob' as TennisShot,star3:'Win 2 points with a Lob',aim:3.0,sharp:0.7,pace:0.94,speed:4.6,reaction:0.25,error:0.8,read:.18,press:.45},
 {name:'Trick Shots',lesson:'Watch the ball, not the fake. Stay balanced in the middle.',style:'trickster' as TennisStyle,surface:'sand' as TennisSurface,touches:1,aerial:true,tier:4,
  rival:'TRICKSTER',habit:'Rolls the ball with its sole, then switches sides.',counter:'auto' as TennisShot,star3:'Return 2 fakes',aim:3.3,sharp:0.82,pace:0.86,speed:5.2,reaction:0.2,error:0.5,read:.17,press:.2},
 {name:'Neon Final',lesson:'Use everything: trap, place, lob the press, finish into space.',style:'champion' as TennisStyle,surface:'hard' as TennisSurface,touches:2,aerial:true,tier:5,
  rival:'CHAMPION',habit:'Mixes every habit. Read each shot.',counter:'auto' as TennisShot,star3:'Hit a Golden Touch',aim:3.45,sharp:0.88,pace:0.82,speed:5.6,reaction:0.17,error:0.35,read:.16,press:.3},
];
export type TennisCourt=typeof TENNIS_COURTS[number];
const court=(s:TennisState)=>TENNIS_COURTS[s.level-1];
export const tennisCourt=court;
/** Difficulty index 0–4 (tier − 1) so the drill stop doesn't jump the ramp. */
const tier=(s:TennisState)=>court(s).tier-1;
const isDrill=(s:TennisState)=>court(s).style==='drill';
const sandy=(s:TennisState)=>court(s).surface==='sand';
/** Drill: number of feeds and the gold target radius. */
/** Rally tempo step (0…tier+2): +1 every 5 touches, reset every point. */
export const tennisTempo=(s:Pick<TennisState,'rally'|'level'>)=>{const t=TENNIS_COURTS[s.level-1].tier;return Math.min(t+2,Math.floor(s.rally/(t>=4?4:5)));};
/** Long rallies have an ending on the first two match courts: after TENNIS_TIRE_RALLY touches the rival
 * tires (slower feet, looser reads, softer returns), so a ball placed into open space finishes the point.
 * 0 until then, rising to 1 over the next 8 touches. Later courts end rallies with their own finisher. */
export const TENNIS_TIRE_RALLY=10;
export const tennisRivalTire=(s:Pick<TennisState,'rally'|'level'>)=>{const c=TENNIS_COURTS[s.level-1];return c.tier>2||c.style==='drill'?0:Math.max(0,Math.min(1,(s.rally-TENNIS_TIRE_RALLY)/8));};
/** The open space on the rival's court: -1 (your left), 1 (your right) or 0 when the rival is central.
 * Drives the "aim here" ring and the call-out, so placing the ball is a visible decision. */
export const tennisOpenSide=(s:Pick<TennisState,'rival'>)=>s.rival.x>.7?-1:s.rival.x<-.7?1:0;
/** Perfect touches needed for a Golden Touch; a scrappy touch takes one back. */
export const TENNIS_GOLD=5;
export const TENNIS_DRILL={balls:15,radius:.85,stars:[6,9,12]};
export const TENNIS={halfWidth:5,halfLength:8,netHeight:1.1,ballRadius:.17,gravity:10.5,winningScore:7,humanSpeed:7.3,aiSpeed:4.1,drag:.018,magnus:.012,restitution:.68,kickDuration:.42};
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const other=(s:TennisSide):TennisSide=>s==='you'?'rival':'you';
const player=(y:number):TennisPlayer=>({x:0,y,vx:0,vy:0,targetX:0,targetY:y,kick:0,stride:0,kickStyle:1,moveX:0,moveY:0,direct:false,kickFacing:y>0?Math.PI:0,kickSpan:TENNIS.kickDuration,kickContactX:0,kickContactZ:.65,kickHeight:.23,kickPower:.35,kickKind:'shot',down:0});
const mkball=(x:number,y:number,last:TennisSide):TennisBall=>({x,y,z:.23,vx:0,vy:0,vz:0,wx:0,wy:0,wz:0,rot:0,squash:0,netHit:false,last,bounces:0,crossed:false});
export function createTennis(seed=47,level=1):TennisState{return {level:clamp(Math.floor(level)||1,1,TENNIS_COURTS.length),courtsWon:0,aiReadErrorX:0,aiReadErrorY:0,bounceAge:99,perfectTouches:0,perfectFlash:0,phase:'ready',you:player(5.3),rival:player(-5.3),ball:mkball(.3,4.95,'you'),score:{you:0,rival:0},server:'you',rally:0,bestRally:0,message:'A little court. A good rally.',version:0,clock:0,phaseTime:0,queuedKick:0,aim:null,aiThink:0,aiReaction:0,seed:seed>>>0,winner:null,
 queuedShot:'auto',lastShot:'auto',lastKicker:'you',kickCount:0,aiSlam:false,fxSlam:0,fxSlamX:0,fxSlamY:0,fxSlamZ:0,fxLand:0,fxLandX:0,fxLandY:0,fxLandI:0,pointWinner:null,shotAim:0,cleanReturns:0,cleanStreak:0,bestCleanStreak:0,rivalIntent:'Ready at the baseline',
 touchGrade:'',touchSide:'you',touchQuality:0,rivalPlan:null,rivalPlanX:0,rivalPlanAt:0,rivalStumble:0,rivalLetGo:false,wrongFooted:0,kickHold:0,gold:0,goldReady:false,goldenShot:false,goldenUsed:0,youTrapped:false,rivalTrapped:false,setBonus:0,trapEvents:0,trapSide:'you',trapGrade:'',rivalFake:false,fakeReads:0,fakeShown:false,habitWins:0,lastYouShot:'auto',assist:0,winRun:0,lossRun:0,drillLeft:0,drillHits:0,targetX:0,targetY:-4.6,targetEvents:0,stars:0,gradeCounts:{perfect:0,good:0,heavy:0,early:0,late:0,stretched:0},perfectStreak:0,touchVolley:false,aiHeader:false,rivalFinish:false,landX:0,landY:0,incomingOut:false,headSpot:false,headX:0,headY:0,outEvents:0,caught:0,bounceEvents:0,netEvents:0,netKind:'net',netX:0,netPace:0,pointKind:''};}
/** The existing replay action advances a won court; a loss keeps its practice tier. */
export function resetTennis(s:TennisState){const won=s.winner==='you',level=Math.min(TENNIS_COURTS.length,s.level+(won?1:0)),courtsWon=s.courtsWon+(won?1:0);Object.assign(s,createTennis(s.seed,level));s.courtsWon=courtsWon;}
function random(s:TennisState){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
export function beginTennis(s:TennisState){s.phase='serve';s.phaseTime=0;const c=court(s);
 if(isDrill(s)){s.server='rival';s.drillLeft=TENNIS_DRILL.balls;s.drillHits=0;moveTarget(s);s.ball=mkball(s.rival.x+.3,s.rival.y+.35,'rival');}
 s.message=`COURT ${s.level} · ${c.name} · ${c.lesson}`;/* the rival's habit is on the court card and its call-out */s.version++;}
/** Drill targets sit at the three depths your shots reach: short (Drop), middle (Kick), deep (Lob). */
export const TENNIS_TARGET_DEPTHS=[-2.05,-5.15,-6.65];
function moveTarget(s:TennisState){const depth=Math.floor(random(s)*3);s.targetY=TENNIS_TARGET_DEPTHS[depth];s.targetX=(random(s)<.5?-1:1)*(depth===0?.4+random(s)*1.8:.6+random(s)*2.6);}
/** Which shot reaches the current drill target's depth. */
export const tennisTargetShot=(s:TennisState):TennisShot=>s.targetY>-3.5?'drop':s.targetY<-6?'lob':'auto';
export function setTennisTarget(s:TennisState,x:number,y:number){if(Math.abs(x-s.you.x)>.25)s.shotAim=clamp((x-s.you.x)/2,-1,1);s.you.direct=false;s.you.targetX=clamp(x,-4.55,4.55);s.you.targetY=clamp(y,.95,7.45);}
/** Analog movement is velocity input, not a repeatedly displaced destination. A
 * released stick brakes once; pointer targets continue to use arrival steering. */
export function setTennisMovement(s:TennisState,x:number,y:number){
 const p=s.you,length=Math.hypot(x,y),scale=length>1?1/length:1;
 if(Math.abs(x)>.15)s.shotAim=clamp(x*scale,-1,1);
 if(length>.001){p.direct=true;p.moveX=x*scale;p.moveY=y*scale;}
 else if(p.direct){p.moveX=p.moveY=0;p.targetX=p.x;p.targetY=p.y;}
}
export function requestTennisKick(s:TennisState,aim?:number,shot:TennisShot='auto'){if(s.phase!=='rally'&&!(s.phase==='serve'&&s.server==='you'))return;if(s.phase==='serve'&&(shot==='header'||shot==='scissor')){s.message='Serve with your foot. Save aerial moves for the return.';s.version++;return;}s.queuedKick=shot==='header'||shot==='scissor'?.48:shot==='trap'?.36:.32;s.kickHold=0;s.queuedShot=shot;s.aim=aim===undefined?s.shotAim:clamp(aim,-1,1);if(shot==='header'&&!canTennisHeader(s,'you')){s.message='Header: get underneath a high incoming ball.';s.version++;}if(shot==='scissor'&&!canTennisScissor(s,'you')){s.message='Scissor: get close as the high ball drops.';s.version++;}
 if(shot==='trap'&&court(s).touches<2){s.queuedKick=0;s.message='One touch on this court. Two-touch courts allow a trap.';s.version++;}}
/** drag + Magnus + gravity — the one acceleration model shared by the live sim and the predictor */
function accel(b:{vx:number;vy:number;vz:number;wx:number;wy:number;wz:number}){
 const sp=Math.hypot(b.vx,b.vy,b.vz),D=TENNIS.drag*sp,M=TENNIS.magnus;
 return {ax:-D*b.vx+M*(b.wy*b.vz-b.wz*b.vy),ay:-D*b.vy+M*(b.wz*b.vx-b.wx*b.vz),az:-TENNIS.gravity-D*b.vz+M*(b.wx*b.vy-b.wy*b.vx)};
}
/** numerically fly the ball to its landing (ignoring the net) so predictions honor drag + spin */
function flight(b:TennisBall,contactHeight=TENNIS.ballRadius){
 const c={x:b.x,y:b.y,z:b.z,vx:b.vx,vy:b.vy,vz:b.vz,wx:b.wx,wy:b.wy,wz:b.wz};
 let t=0,netZ:number|null=null;const dt=1/90,R=TENNIS.ballRadius;
 while(t<3.2){
  const a=accel(c);c.vx+=a.ax*dt;c.vy+=a.ay*dt;c.vz+=a.az*dt;
  const oy=c.y;c.x+=c.vx*dt;c.y+=c.vy*dt;c.z+=c.vz*dt;t+=dt;
  if(netZ===null&&((oy<0&&c.y>=0)||(oy>0&&c.y<=0)))netZ=c.z-c.vz*dt*(c.y/(c.y-oy));
  const decay=Math.max(0,1-.3*dt);c.wx*=decay;c.wy*=decay;c.wz*=decay;
  if(c.z<=Math.max(R,contactHeight)&&c.vz<0)break;
 }
 return {x:c.x,y:c.y,vx:c.vx,vy:c.vy,time:t,netZ};
}
export function tennisLanding(s:TennisState){const f=flight(s.ball);return {x:f.x,y:f.y,time:f.time};}
/** Keep the receiving guide useful after the bounce: show where the dropping
 * ball reaches a comfortable foot height, rather than erasing the destination.
 * Uses the same drag/spin path and existing throttled visual prediction. */
export function tennisReceivingPoint(s:TennisState){const f=flight(s.ball,s.ball.bounces>0?.7:TENNIS.ballRadius);return {x:f.x,y:f.y,time:f.time};}
export function canTennisKick(s:TennisState,side:TennisSide){if(s.phase!=='rally'||s.ball.last===side||!s.ball.crossed)return false;const p=s[side],b=s.ball;return (side==='you'?b.y>.15:b.y<-.15)&&b.z<1.15&&Math.hypot(p.x-b.x,p.y-b.y)<1.3;}
/** The same contact test drives the mint timing cue and its reward. */
export function canTennisPerfect(s:TennisState){const p=s.you,b=s.ball,easy=court(s).tier<=2;return canTennisKick(s,'you')&&b.bounces===1&&s.bounceAge>=.045&&s.bounceAge<=(easy?.32:.26)&&Math.hypot(p.x-b.x,p.y-b.y)<(easy?.9:.8)&&Math.hypot(p.vx,p.vy)<3;}
/** Comfortable contact distance: inside it a planted touch grades clean. */
export const TENNIS_SWEET_REACH=.6;
/** Patient first touch: a pressed kick waits (up to TENNIS_KICK_HOLD) while the ball is still
 * coming closer, instead of lunging the instant it enters reach. Courts 1–3 also wait
 * for a falling ball to bounce. Pure read of the state. */
export const TENNIS_KICK_HOLD=.42;
export function tennisShouldWait(s:TennisState){
 const p=s.you,b=s.ball,rx=b.x-p.x,ry=b.y-p.y,d=Math.hypot(rx,ry);
 // Courts 1–3 let a dropping ball bounce first (the lesson); later courts leave that timing to you.
 if(court(s).tier<=2&&b.bounces===0){const h=Math.max(0,b.z-TENNIS.ballRadius),g=TENNIS.gravity,t=(b.vz+Math.sqrt(b.vz*b.vz+2*g*h))/g;if(t<TENNIS_KICK_HOLD-s.kickHold)return true;}
 if(court(s).tier<=2&&b.bounces===1&&s.bounceAge<.05)return true; // a beat after the bounce, as it rises
 if(d<=TENNIS_SWEET_REACH||canTennisPerfect(s))return false;
 const vx=b.vx-p.vx,vy=b.vy-p.vy,v2=vx*vx+vy*vy;if(v2<.04)return false;
 const tca=-(rx*vx+ry*vy)/v2;if(tca<=.01||tca>.4)return false;
 const cx=rx+vx*tca,cy=ry+vy*tca;return Math.hypot(cx,cy)<d-.15;
}
/** Two-touch courts: a first touch that cushions the ball up on your own side (thigh or chest). */
export function canTennisTrap(s:TennisState,side:TennisSide='you'){const b=s.ball,p=s[side];return court(s).touches>=2&&s.phase==='rally'&&b.last!==side&&b.crossed&&!(side==='you'?s.youTrapped:s.rivalTrapped)&&(side==='you'?b.y>.15:b.y<-.15)&&b.z>.3&&b.z<1.6&&Math.hypot(p.x-b.x,p.y-b.y)<1.05;}
/** Shark attack: near the net, a high ball on your side is stamped down with the sole. */
export function canTennisShark(s:TennisState,side:TennisSide='you'){const b=s.ball,p=s[side];return s.phase==='rally'&&b.last!==side&&b.crossed&&(side==='you'?p.y<2.8&&b.y>.15:p.y>-2.8&&b.y<-.15)&&b.z>=1.25&&b.z<2.4&&Math.hypot(p.x-b.x,p.y-b.y)<1.05;}
/** Bicycle kick: the golden version of the scissor, on a high ball. */
export const canTennisBicycle=(s:TennisState)=>s.goldReady&&canTennisScissor(s,'you');
/** Sliding stretch: a low ball passing just out of reach that will not come closer. Last resort. */
export function canTennisDive(s:TennisState){const b=s.ball,p=s.you;if(s.phase!=='rally'||b.last==='you'||!b.crossed||b.y<.15||b.z>.9||p.down>0)return false;
 const rx=b.x-p.x,ry=b.y-p.y,d=Math.hypot(rx,ry);if(d<1.25||d>2.15)return false;const vx=b.vx-p.vx,vy=b.vy-p.vy,v2=vx*vx+vy*vy,tca=v2<.04?0:Math.max(0,-(rx*vx+ry*vy)/v2);return Math.hypot(rx+vx*tca,ry+vy*tca)>1.2;}
/** Training wheels: courts 1–3 hold a pressed kick for the sweet spot (and the bounce); courts 4–5 hold it
 * less and less; the final leaves the timing to you (the KICK NOW cue still shows). */
export const tennisAssist=(s:TennisState)=>Math.min(1,(court(s).tier<=2?1:court(s).tier===3?.7:court(s).tier===4?.5:0)+Math.max(0,s.assist)*.5);
/** Overhead volleys only connect cleanly close to the body. */
export const tennisSlamTooFar=(s:TennisState)=>Math.hypot(s.you.x-s.ball.x,s.you.y-s.ball.y)>.85;
/** The ball will still come meaningfully closer to this player within 0.4 s. */
function closing(s:TennisState,side:TennisSide){const p=s[side],b=s.ball,rx=b.x-p.x,ry=b.y-p.y,d=Math.hypot(rx,ry),vx=b.vx-p.vx,vy=b.vy-p.vy,v2=vx*vx+vy*vy;if(v2<.04)return false;const tca=-(rx*vx+ry*vy)/v2;if(tca<=.01||tca>.4)return false;return Math.hypot(rx+vx*tca,ry+vy*tca)<d-.15;}
/** The rival is patient too: it lets a ball come into its body instead of lunging (harder courts more so). */
const rivalWaits=(s:TennisState)=>Math.hypot(s.rival.x-s.ball.x,s.rival.y-s.ball.y)>.75-tier(s)*.04&&closing(s,'rival');
/** HUD cue: '' (not in reach), 'step' (let it come to you), 'now', 'high' (volley it) or 'drop' (too far up: let it drop). */
export function tennisKickCue(s:TennisState):''|'step'|'now'|'high'|'drop'{if(canTennisKick(s,'you'))return tennisShouldWait(s)?'step':'now';return canTennisSlam(s,'you')?(tennisSlamTooFar(s)?'drop':'high'):'';}
/** Where to stand for the perfect window: just past the bounce, as the ball rises again.
 * Same drag/spin flight as the other guides; allocation is one small result object. */
export function tennisSweetPoint(s:TennisState){const b=s.ball;
 if(b.bounces>0){if(s.bounceAge<.2)return {x:b.x+b.vx*(.15-s.bounceAge*.5),y:b.y+b.vy*(.15-s.bounceAge*.5),time:0};return tennisReceivingPoint(s);}
 const f=flight(b);return {x:f.x+f.vx*.11,y:f.y+f.vy*.11,time:f.time};}
/** the overhead window: an incoming ball hanging HIGH within reach (near/after its apex) —
 * kicking now is a SLAM. Kept tight so it rewards reading a lob, not every loopy return. */
export function canTennisSlam(s:TennisState,side:TennisSide){if(s.phase!=='rally'||s.ball.last===side||!s.ball.crossed)return false;const p=s[side],b=s.ball;return (side==='you'?b.y>.15:b.y<-.15)&&b.z>=1.15&&b.z<2.25&&b.vz<.4&&Math.hypot(p.x-b.x,p.y-b.y)<1.35;}
/** Deliberate aerial returns: close body position, on your side, before the ball passes. */
export function canTennisHeader(s:TennisState,side:TennisSide){const b=s.ball,p=s[side];return s.phase==='rally'&&b.last!==side&&b.crossed&&(side==='you'?b.y>.15:b.y<-.15)&&b.z>=1.35&&b.z<=2.75&&b.vz<1.2&&Math.hypot(p.x-b.x,p.y-b.y)<1.15;}
export function canTennisScissor(s:TennisState,side:TennisSide){const b=s.ball,p=s[side];return s.phase==='rally'&&b.last!==side&&b.crossed&&(side==='you'?b.y>.15:b.y<-.15)&&b.z>=1.25&&b.z<=2.5&&b.vz<.6&&Math.hypot(p.x-b.x,p.y-b.y)<1.15&&p.kick<=0;}
/** solve an initial velocity that lands the (already-spinning) ball on target while clearing the
 * net; flat shots also pull the arc DOWN so drives genuinely skim the tape */
function solve(b:TennisBall,tx:number,ty:number,T:number,clear:number,flat:boolean){
 const g=TENNIS.gravity;
 b.vx=(tx-b.x)/T;b.vy=(ty-b.y)/T;b.vz=(TENNIS.ballRadius-b.z)/T+.5*g*T;
 for(let i=0;i<4;i++){
  const f=flight(b),want=TENNIS.netHeight+clear;
  b.vx+=(tx-f.x)/T*.8;b.vy+=(ty-f.y)/T*.8;
  if(f.netZ!==null){
   if(f.netZ<want)b.vz+=(want-f.netZ)/(T*.45);
   else if(flat&&f.netZ>want+.05)b.vz-=Math.min(1.8,(f.netZ-want-.05)/(T*.45));
  }
 }
}
const INTENT:Record<string,string>={drop:'SHORT BALL · close the space',lob:'DEEP LOB · recover behind it',scissor:'SCISSOR · cover the open side',slam:'SPIKE · prepare to react',shark:'SHARK ATTACK · it stamps down near the net',drive:'ATTACK · your touch floated, it drives',auto:'WIDE RETURN · cover the angle',trap:'IT TRAPS · get set for the strike',header:'HEADER · a soft loop is coming',finish:'GOING FOR THE LINE · stay central'};
/** How close the incoming ball gets before the rival commits (and starts showing) its
 * shot. Early courts commit soon and give a long read; later courts disguise it longer. */
export const tennisCommitRange=(level:number)=>3.4-(TENNIS_COURTS[clamp(Math.floor(level)||1,1,TENNIS_COURTS.length)-1].tier-1)*.35;
/** The rival picks shot and side BEFORE contact, from where you stand right now,
 * so its hips and the court-1/2 call-out can telegraph it. */
function planRival(s:TennisState){
 const r=random(s),side=s.you.x>.4?-1:s.you.x<-.4?1:random(s)<.5?-1:1,style=court(s).style,steady=style==='steady';
 // Everyone punishes a player camped too deep or too close (the steady rival only a real camp).
 // Otherwise each personality plays its own mix, so every court asks a different read.
 const deep=s.you.y>(steady?6.3:5.6),close=s.you.y<(steady?2.5:3.1);
 let shot:TennisShot=deep?'drop':close?'lob':tier(s)>=2&&s.you.vy>.8?'drop':RIVAL_MIX[style](r);
 // You're pulled wide: the rival drives into the open side (the same lesson, used against you).
 const wide=!steady&&Math.abs(s.you.x)>2.2&&s.you.y>=3.1&&s.you.y<=5.6&&r<.55+tier(s)*.08;if(wide)shot='drive';
 if(deep||close||wide)s.caught++;
 // A weak first touch gets punished: past court 1 the rival attacks a floating return with a drive.
 if(tier(s)>=1&&s.touchSide==='you'&&s.touchGrade!==''&&s.touchQuality<.5&&s.rally>1&&random(s)<.4+tier(s)*.1)shot='drive';
 // Long rallies have an ending: from court 4 the rival goes for a winner near the line. It is riskier for it too.
 s.rivalFinish=tier(s)>=2&&s.rally>=8&&shot!=='drop'&&random(s)<Math.min(.5,(s.rally-7)*.08);if(s.rivalFinish)shot='drive';
 s.rivalPlan=shot;s.rivalPlanX=clamp(side*(court(s).aim+tennisTempo(s)*.15+random(s)*.8+(s.rivalFinish?.7:0)),-4.6,4.6);s.rivalPlanAt=s.clock;s.rivalIntent=s.rivalFinish?INTENT.finish:INTENT[shot];
 // The trickster (and sometimes the champion) shows a sole-roll fake, then plays the other side.
 s.rivalFake=(style==='trickster'&&random(s)<.4)||(style==='champion'&&random(s)<.18);s.fakeShown=false;
 if(court(s).tier<=2&&s.rally>1){s.message=`READ IT · ${deep?'you stayed deep, so ':close?'you are close to the net, so ':''}${shot==='drop'?'a short ball is coming':shot==='lob'?'a high lob is coming':'it goes '+(s.rivalPlanX<0?'to your left':'to your right')}${deep||close?'. Recover to the middle!':''}`;s.version++;}
}
/** Each personality's everyday shot mix (r is one uniform draw). */
const RIVAL_MIX:Record<TennisStyle,(r:number)=>TennisShot>={
 steady:r=>r<.9?'auto':'lob',
 baseliner:r=>r<.66?'auto':r<.86?'lob':'drop',
 drill:()=>'auto',
 rusher:r=>r<.45?'drive':r<.8?'auto':'drop',
 trickster:r=>r<.35?'drop':r<.7?'auto':r<.85?'lob':'drive',
 champion:r=>r<.3?'drive':r<.55?'auto':r<.78?'drop':'lob',
};
/** Which habit cost the most: reaching (stretched), running through the ball (heavy),
 * height before the bounce (early) or letting the ball die after it (late). */
function gradeTouch(q:number,perfect:boolean,reachPen:number,heavyPen:number,earlyPen:number,latePen:number):TennisGrade{
 if(perfect)return 'perfect';if(q>=.72)return 'good';
 const worst=Math.max(reachPen,heavyPen,earlyPen,latePen);
 return earlyPen===worst?'early':latePen===worst&&latePen>0?'late':heavyPen===worst?'heavy':'stretched';
}
/** Pace cost of a ground touch: jogging is fine, sprinting through the ball makes it heavy. */
const runPenalty=(pace:number)=>pace*.05+Math.max(0,pace-3)*.04;
/** One flight read per rival contact (two short integrations, no allocation in the frame loop):
 * where the ball bounces, whether it is flying out, and on aerial courts where a high ball
 * drops through head height on your side. Cleared on your touch. */
export const TENNIS_HEAD_HEIGHT=1.7;
function readIncoming(s:TennisState){
 const b=s.ball;s.incomingOut=false;s.headSpot=false;if(b.last!=='rival'||isDrill(s))return;
 const f=flight(b);s.landX=f.x;s.landY=f.y;
 const clears=f.netZ===null||f.netZ>=TENNIS.netHeight+TENNIS.ballRadius*.95;
 if(clears&&f.y>0&&(Math.abs(f.x)>TENNIS.halfWidth+.08||f.y>TENNIS.halfLength+.08)){s.incomingOut=true;s.outEvents++;return;}
 const apex=b.z+Math.max(0,b.vz)*b.vz/(2*TENNIS.gravity);
 if(court(s).aerial&&clears&&apex>TENNIS_HEAD_HEIGHT+.45){const h=flight(b,TENNIS_HEAD_HEIGHT);if(h.y>.6&&h.y<TENNIS.halfLength-.2&&Math.abs(h.x)<TENNIS.halfWidth-.2){s.headSpot=true;s.headX=h.x;s.headY=h.y;}}
}
function kick(s:TennisState,side:TennisSide){
 const p=s[side],b=s.ball,sign=side==='you'?-1:1,serve=s.phase==='serve',profile=court(s);
 const high=!serve&&b.z>=1.15;
 // shot selection: your queued intent (auto/drive upgrade to a SLAM on a high ball);
 // the rival mostly drives, lobs sometimes, drops when you camp deep — and spikes high balls
 let shot:TennisShot=serve?(side==='you'&&s.queuedShot==='lob'?'flick':side==='you'&&s.queuedShot==='drop'?'drop':side==='rival'&&!isDrill(s)&&tier(s)>=1&&random(s)<.3?(random(s)<.5?'flick':'drop'):'auto'):s.queuedShot;
 if(serve&&isDrill(s))shot=s.drillLeft<=5?(random(s)<.5?'drop':'lob'):s.drillLeft<=10&&random(s)<.4?'lob':'auto';
 if(side==='rival'&&!serve){
  if(high)shot=s.aiHeader&&b.z>=1.35&&canTennisHeader(s,'rival')?'header':canTennisShark(s,'rival')&&tier(s)>=2?'shark':tier(s)>=2&&canTennisScissor(s,'rival')&&random(s)<.32?'scissor':'slam';
  else{
   // A pressured opponent buys recovery time; otherwise it plays the shot it
   // committed to (and telegraphed) as the ball approached.
   const stretched=Math.hypot(p.x-b.x,p.y-b.y)>.9;if(!s.rivalPlan)planRival(s);
   shot=tier(s)>=2&&stretched?'lob':s.rivalPlan!;
  }
  s.rivalIntent=INTENT[shot];
 }
 if(side==='you'&&!serve&&shot==='scissor'&&s.goldReady)shot='bicycle';
 if(high&&(shot==='auto'||shot==='drive'||shot==='slam')&&canTennisShark(s,side))shot='shark';
 if(high&&(shot==='auto'||shot==='drive'))shot='slam';
 if(shot==='slam'&&!high)shot='auto';
 if(shot==='trap')shot='auto';
 // Chest trap: an ordinary touch on a chest-high ball, with your body in line, is cushioned
 // on the chest and floated back. Lunging at it from the side stays a scrappy early kick.
 if(side==='you'&&!serve&&(shot==='auto'||shot==='drive')&&b.z>=.9&&b.z<1.15&&Math.hypot(p.x-b.x,p.y-b.y)<.65)shot='chest';
 // contact quality: planted next to the ball = clean; lunging at full stretch = scrappy.
 // An overhead slam punishes stretching hardest, and long rallies pile on pressure.
 const reach=Math.hypot(p.x-b.x,p.y-b.y),pace=Math.hypot(p.vx,p.vy);
 const pressure=side==='you'?0:Math.min(.25,s.rally*Math.max(0,.025-tier(s)*.006));
 let q=serve?.88+random(s)*.1
  :shot==='header'?clamp(1.18-reach*.6-pace*.04-pressure,.3,1)
  :shot==='scissor'?clamp(1.22-reach*.9-pace*.07-pressure,.2,1)
  :shot==='chest'?clamp(1.16-reach*.6-pace*.06,.3,1)
  :shot==='slam'?clamp(1.2-reach*.85-pace*.07-pressure,.2,1)
  :shot==='shark'?clamp(1.22-reach*.75-pace*.05-pressure,.3,1)
  :shot==='bicycle'?1
  :shot==='dive'?.3+random(s)*.15
  :clamp(1.18-reach*.6-runPenalty(pace)-Math.max(0,b.z-.75)*.4-pressure-(b.bounces===1?Math.min(.12,Math.max(0,s.bounceAge-.6)*.3):0),.22,1);
 // Set & strike: the second touch after your own trap is planted and balanced.
 const setStrike=side==='you'&&!serve&&s.setBonus>0&&s.youTrapped&&shot!=='dive';
 const perfect=side==='you'&&!serve&&(canTennisPerfect(s)||setStrike&&q>.55);
 if(perfect){q=Math.min(1,q+.18);s.perfectTouches++;s.perfectFlash=.7;}
 if(setStrike)q=Math.min(1,q+.12);
 // Golden touch: a full meter (3 perfect touches) makes your next shot pure and fast.
 const golden=side==='you'&&!serve&&s.goldReady&&shot!=='dive';
 if(golden){q=1;s.goldReady=false;s.gold=0;s.goldenUsed++;}
 else if(perfect&&side==='you'){s.gold=Math.min(TENNIS_GOLD,s.gold+1);if(s.gold>=TENNIS_GOLD)s.goldReady=true;}
 else if(side==='you'&&!serve&&q<.5&&!s.goldReady)s.gold=Math.max(0,s.gold-1);
 s.goldenShot=golden;
 if(side==='rival'){const cap=court(s).sharp-s.assist*.1-tennisRivalTire(s)*.3;q=Math.min(q,cap+random(s)*(1-cap));if(s.rivalTrapped)q=Math.min(1,q+.1);if(s.rivalFinish&&!serve)q=Math.max(.3,q-.12);} // the rival mixes sharp days and scrappy ones
 if(side==='you'&&!serve){s.lastYouShot=shot;const clean=q>=.72;if(clean&&s.rivalFake&&s.fakeShown)s.fakeReads++;s.cleanReturns+=clean?1:0;s.cleanStreak=clean?s.cleanStreak+1:0;s.bestCleanStreak=Math.max(s.bestCleanStreak,s.cleanStreak);}
 if(!serve){const aerial=shot==='header'||shot==='scissor'||shot==='slam'||shot==='chest'||shot==='shark'||shot==='bicycle'||setStrike;
  const ground=!aerial&&shot!=='dive';
  s.touchGrade=side==='rival'?(q<.66&&reach>.75?'stretched':''):gradeTouch(q,perfect,reach*.6,ground?runPenalty(pace):pace*.05,aerial||b.bounces>0||b.z<=.55?0:(b.z-.55)*.6+.12,b.bounces===1?Math.max(0,s.bounceAge-.6):0);
  s.touchSide=side;s.touchQuality=q;
  if(side==='you'){const g=s.touchGrade;if(g)s.gradeCounts[g]++;s.perfectStreak=g==='perfect'?s.perfectStreak+1:0;
   s.touchVolley=ground&&b.bounces===0&&q>=.72;}}
 else{s.touchGrade='';s.touchVolley=false;}
 const err=(1-q)*(shot==='slam'||shot==='scissor'||shot==='shark'?2.2:1.6);
 let tx=side==='you'
  ?((s.aim??s.shotAim)*3.7)
  :s.rivalPlan&&!serve?s.rivalPlanX:clamp((s.you.x>.4?-1:s.you.x<-.4?1:random(s)<.5?-1:1)*(2.4+random(s)*.8),-3.6,3.6);
 // The final court sometimes disguises a committed shot and switches sides late.
 const disguised=side==='rival'&&!serve&&s.rivalFake&&s.fakeShown;if(disguised)tx=-tx;
 const deep=side==='rival'&&court(s).style==='baseliner'&&shot==='auto'?1.1:0;
 let ty=sign*(shot==='drop'?1.5+random(s)*1.1:shot==='lob'||shot==='flick'?5.7+random(s)*1.9:shot==='slam'?2.6+q*2.1+random(s)*1.4:shot==='shark'?2.2+random(s)*2.4:shot==='dive'?3+random(s)*3:4.3+random(s)*1.7+deep);
 if(shot==='drop')tx*=.7; // soft balls stay honest, near the middle of the front court
 // A heavy touch runs away from you: the ball flies longer than you meant.
 if(side==='you'&&s.touchGrade==='heavy')ty+=sign*Math.max(0,pace-3)*.3;
 tx=clamp(tx+(random(s)-.5)*err*2.4,-5.6,5.6);
 ty=ty+(random(s)-.5)*err*2.2;ty=sign<0?clamp(ty,side==='you'?-8.6:-7.9,shot==='drop'?-1.1:-1.4):clamp(ty,shot==='drop'?1.1:1.4,side==='rival'?7.9:8.6);
 if(serve&&isDrill(s)){tx=clamp(s.you.x*.4+(random(s)-.5)*5,-3.8,3.8);ty=shot==='drop'?2+random(s)*1.2:shot==='lob'?5.6+random(s)*1.4:3.6+random(s)*2.4;}
 const dist=Math.max(.5,Math.hypot(tx-b.x,ty-b.y)),dx=(tx-b.x)/dist,dy=(ty-b.y)/dist;
 // shot shape: drops float with backspin and die, lobs sail high & deep, slams hammer DOWN
 // from the contact height, drives skim flat with heavy topspin, loops are the safe default
 const drive=shot==='drive'||(shot==='auto'&&!serve&&q>.72);
 let T:number,clear:number,ts:number;
 if(shot==='scissor'||shot==='bicycle'){T=clamp(.39+dist*.009,.43,.59)*(shot==='bicycle'?.92:1);clear=.2+q*.09;ts=20+q*8;}
 else if(shot==='shark'){T=clamp(.3+dist*.012,.32,.5);clear=.14+q*.08;ts=18;}
 else if(shot==='dive'){T=1.35+dist*.05;clear=.6;ts=2;}
 else if(shot==='flick'){T=1.75+dist*.05;clear=1.7;ts=-1;}
 else if(shot==='header'){T=1.02+dist*.028;clear=.4+q*.2;ts=3+q*2;}
 else if(shot==='slam'){T=clamp(Math.sqrt(2*Math.max(.25,b.z-.25)/TENNIS.gravity)+dist*.012,.34,.72);clear=.16+q*.12;ts=15+q*10;} // clear stays ABOVE the tape-clip band
 else if(shot==='chest'){T=1.3+dist*.05;clear=.32+q*.2;ts=2+q*2;}
 else if(shot==='drop'){T=1+dist*.075;clear=.24+q*.22;ts=-(2.5+q*3.5);}
 else if(shot==='lob'){T=1.45+dist*.06;clear=1.05+q*.75;ts=2+q*2.5;}
 else if(drive){T=.85+dist*.042;clear=.19+q*.12;ts=11+q*8;}
 else{T=1.22+dist*.052+(1-q)*.25;clear=.2+q*.25;ts=4+q*5;}
 // A lunging, full-sprint toe-poke often goes wrong (real football: arrive early, don't stretch).
 // A tired early-court rival also makes unforced errors (no extra random draw while it is fresh).
 const tired=side==='rival'&&!serve?tennisRivalTire(s):0;
 const mishit=!serve&&shot!=='dive'&&(q<.42&&random(s)<(.42-q)*(side==='you'?2.6:1.6)||tired>0&&random(s)<tired*.14);
 if(mishit){if(random(s)<.55){clear=-.3;ty=sign*(.8+random(s)*1.5);}else ty=sign*(8.9+random(s)*1.2);}
 if(perfect&&shot!=='lob'&&shot!=='drop')T*=.9;
 if(golden&&shot!=='lob'&&shot!=='drop')T*=.84;
 if(side==='rival'&&!serve&&shot!=='lob'&&shot!=='drop')T*=court(s).pace;
 // Rally tempo (Pong-style): every 5 touches the exchange speeds up a step, capped per court, reset each point.
 if(!serve&&shot!=='lob'&&shot!=='flick')T/=1+tennisTempo(s)*.12;
 if(sandy(s)&&!serve)T*=1.04;
 const ss=(random(s)-.5)*(1-q)*22+(random(s)-.5)*4;  // sidespin: wild contacts slice and hook
 b.wx=-ts*dy;b.wy=ts*dx;b.wz=ss;
 b.z=clamp(b.z,.17,shot==='header'?2.75:shot==='scissor'||shot==='bicycle'?2.5:shot==='slam'||shot==='shark'?2.4:1.05);
 solve(b,tx,ty,T,clear,drive||shot==='slam'||shot==='scissor'||shot==='bicycle'||shot==='shark');
 // contact noise — a stretched toe-poke (or wild spike) flies with a mind of its own
 const n=(1-q)*(shot==='slam'||shot==='shark'?1:.65);
 b.vx+=(random(s)-.5)*n*2.4;b.vy+=(random(s)-.5)*n*2.2;b.vz+=(random(s)-.65)*n*2;
 // Wrong-footing: a return sent against the rival's momentum costs it a visible stumble.
 const gap=tx-s.rival.x,wrong=side==='you'&&!serve&&Math.abs(s.rival.vx)>1.1&&Math.sign(s.rival.vx)!==Math.sign(gap)&&Math.abs(gap)>1.4;
 if(wrong){s.rivalStumble=.55;s.wrongFooted++;}
 b.last=side;b.bounces=0;b.crossed=false;b.netHit=false;s.rivalPlan=null;s.rivalLetGo=false;s.youTrapped=s.rivalTrapped=false;s.setBonus=0;
 p.kickSpan=shot==='scissor'?.85:shot==='bicycle'?1.25:shot==='shark'?.72:shot==='dive'?.9:shot==='flick'?.7:shot==='header'?.58:shot==='chest'?.52:TENNIS.kickDuration;p.kick=p.kickSpan;p.kickFacing=Math.atan2(b.vx,b.vy);p.kickStyle=shot==='chest'?5:shot==='bicycle'?6:shot==='shark'?7:shot==='dive'?9:shot==='flick'?10:shot==='scissor'?4:shot==='header'?3:shot==='slam'?2:shot==='drop'?0:1;
 p.down=shot==='bicycle'?.85:shot==='dive'?.75:shot==='shark'?.25:0;
 // Keep the committed contact in the outgoing frame; the visible island boot
 // must not chase the ball's next simulation position during follow-through.
 const contactX=b.x-p.x,contactZ=b.y-p.y,sin=Math.sin(p.kickFacing),cos=Math.cos(p.kickFacing);
 p.kickContactX=contactX*cos-contactZ*sin;p.kickContactZ=contactX*sin+contactZ*cos;p.kickHeight=b.z;
 p.kickKind=shot==='drop'||shot==='chest'||shot==='dive'?'pass':shot==='lob'||shot==='flick'?'loft':'shot';p.kickPower=(shot==='drop'?.2:shot==='chest'?.25:shot==='dive'?.3:shot==='lob'||shot==='flick'?.48:shot==='scissor'||shot==='bicycle'||shot==='shark'?1:shot==='header'?.6:shot==='slam'?.95:drive?.72:.45)*(.7+.3*q);
 s.lastShot=shot==='auto'?(drive?'drive':'auto'):shot;s.lastKicker=side;s.kickCount++;
 if(shot==='slam'||shot==='header'||shot==='scissor'||shot==='bicycle'||shot==='shark'){s.fxSlam=shot==='scissor'||shot==='bicycle'?.65:.42;s.fxSlamX=b.x;s.fxSlamY=b.y;s.fxSlamZ=b.z;}
 s.rally++;s.bestRally=Math.max(s.bestRally,s.rally);s.phase='rally';s.queuedKick=0;s.queuedShot='auto';
 readIncoming(s);
 // a slam travels ~half a second — the rival gets a hurried (imperfect) chance to dig it out;
 // and the rival only WANTS to spike some of your returns (decided here, per kick)
 s.aiReaction=((shot==='slam'||shot==='scissor'||shot==='shark'||shot==='bicycle')&&side==='you'?.16+random(s)*.2:profile.reaction+random(s)*.24)+(wrong?.16-tier(s)*.02:0)+(golden?.15:0)+(side==='you'?Math.max(0,s.assist)*.06+tennisRivalTire(s)*.12:0);s.aiThink=0;
 if(isDrill(s)&&side==='you')s.aiReaction=99;
 if(side==='you'){
  s.aiSlam=random(s)<.45+tier(s)*.07||q<.5; // a floating return invites the spike
  // Aerial courts: some high balls are headed back instead of waiting for the drop.
  s.aiHeader=court(s).aerial&&!isDrill(s)&&random(s)<.22+tier(s)*.05;
  // One reading error per incoming shot. Re-reading the flight should refine
  // the same destination, rather than randomly twitch the player's feet.
  const e=profile.error*(1+Math.max(-.5,s.assist)*.6)*(golden?1.6:1)*(1+tennisRivalTire(s)*1.2);s.aiReadErrorX=(random(s)-.5)*e;
  s.aiReadErrorY=(random(s)-.5)*e*.73;
 }
 s.message=serve&&isDrill(s)?`BALL ${TENNIS_DRILL.balls-s.drillLeft+1} of ${TENNIS_DRILL.balls} · control it, then hit the gold ring`
  :s.rally===1?(shot==='flick'?(side==='you'?'RAINBOW FLICK SERVE · high and deep. Recover.':'A high flick serve! Back up and let it drop.'):'Recover toward the middle. Read the return.')
  :side==='you'?(
   golden?(shot==='bicycle'?'BICYCLE KICK! Golden touch. Now get up fast!':'GOLDEN TOUCH! Pure contact, extra pace.')
   :shot==='shark'?'SHARK ATTACK! Stamped down from the net.'
   :shot==='dive'?'A sliding stretch! Scramble back up — move earlier next time.'
   :setStrike?'SET & STRIKE! A soft first touch made the second one easy.'
   :perfect?(s.perfectStreak>=3?`PERFECT ×${s.perfectStreak}! Bounce, plant, strike. Keep the rhythm.`:'PERFECT RETURN! Early bounce, balanced feet.')
   :s.touchVolley?'VOLLEY! Clean before the bounce. You were set early.'
   :wrong?'WRONG-FOOTED! You played into the open space.'
   :shot==='scissor'?'SCISSOR! Extra pace — recover from the landing.'
   :shot==='header'?'HEADER! Meet the ball, guide it into space.'
   :shot==='chest'?(q>.72?'CHEST TRAP! Cushioned and floated back.':'Chest trap. Get in line earlier to cushion it.')
   :shot==='slam'?(q>.55?'SLAM! Hammered down the other side.':'A wild spike — anything can happen.')
   :shot==='drop'?'A soft touch, floating just past the tape.'
   :shot==='lob'?'Up and over — deep toward the back line.'
   :s.touchGrade==='heavy'?'HEAVY TOUCH · slow your feet before the ball arrives.'
   :q>.75?`CLEAN TOUCH${s.cleanStreak>1?' ×'+s.cleanStreak:''} · recover to the middle.`:s.touchGrade==='early'?'EARLY TOUCH · let it bounce, then lift it over.':s.touchGrade==='late'?'LATE TOUCH · meet it before it drops.':q>.45?'Across it goes. Find your next position.':'A stretched touch — recover quickly!')
  :(s.incomingOut?'It is flying LONG… judge it. Let it go!':disguised?'FAKE! It rolled the ball and switched sides.':s.touchGrade==='stretched'?'The rival is stretched! Its return is weak.':shot==='scissor'?'The rival goes airborne — cover the angle!':shot==='slam'?'The rival SPIKES it — dig it out!'
   :shot==='shark'?'SHARK ATTACK from the rival — stay low and react!'
   :shot==='header'?'The rival HEADS it back — a soft loop, move in!'
   :s.headSpot?'HIGH BALL · get under the blue ring and head it!'
   :s.rivalFinish?'It goes for the line! Stay central in long rallies.'
   :shot==='drop'?'A sneaky drop ball — sprint in!'
   :shot==='lob'?'A high lob floats deep. Get under it.'
   :q>.68?s.rivalIntent:'A scrappy return floats over. Attack it.');
 s.version++;
}
/** A cushioned first touch (thigh below the waist, chest above): kills the pace and pops the ball
 * up in front of the body, on your own side, ready for a planted second touch. */
function trap(s:TennisState,side:TennisSide){
 const p=s[side],b=s.ball,dir=side==='you'?-1:1,reach=Math.hypot(p.x-b.x,p.y-b.y),pace=Math.hypot(p.vx,p.vy);
 const q=clamp(1.15-reach*.7-pace*.06,.3,1),chest=b.z>=.85,T=.72+q*.12,wild=(1-q);
 const fx=clamp(p.x+(b.x-p.x)*.35+(random(s)-.5)*wild*1.6,-4.4,4.4),fy=side==='you'?clamp(p.y+dir*.45+(random(s)-.5)*wild*1.4,.7,7.4):clamp(p.y+dir*.45+(random(s)-.5)*wild*1.4,-7.4,-.7);
 b.vx=(fx-b.x)/T;b.vy=(fy-b.y)/T;b.vz=(.55-b.z)/T+.5*TENNIS.gravity*T;b.wx=b.wy=b.wz=0;b.bounces=0;s.bounceAge=99;s.incomingOut=s.headSpot=false;
 p.kickSpan=.55;p.kick=p.kickSpan;p.kickFacing=Math.atan2(b.x-p.x,b.y-p.y);p.kickStyle=chest?5:8;p.kickKind='pass';p.kickPower=.2;p.kickHeight=b.z;p.kickContactX=0;p.kickContactZ=.4;
 if(side==='you'){s.youTrapped=true;s.setBonus=1.6;s.queuedKick=0;s.queuedShot='auto';s.trapGrade=q>=.72?'good':pace*.06>reach*.7?'heavy':'stretched';s.lastYouShot='trap';}
 else{s.rivalTrapped=true;s.aiReaction=.12;s.rivalIntent=INTENT.trap;}
 s.trapSide=side;s.trapEvents++;
 s.message=side==='you'?(q>=.72?'SOFT TRAP · it sits up for you. Now strike!':'A heavy trap — get to it and strike!'):'The rival TRAPS it — get set, a strike is coming.';s.version++;
}
/** Kid-readable point reasons that name the football idea, not just the rule. */
function pointReason(s:TennisState,winner:TennisSide,kind:TennisPointKind){
 if(kind==='letgo')return winner==='you'?'the rival let it go… and it dropped in!':'you let it go… and it dropped in';
 if(kind==='space')return winner==='you'?'into the open space!':'it beat you into the open space';
 if(kind==='net')return winner==='you'?'the rival found the net':s.touchGrade==='early'?'into the net. Let it bounce, then lift it':'into the net';
 if(kind==='out')return winner==='you'?(s.incomingOut?'good leave! You judged it out':'the rival hit it out'):'your return went out';
 if(kind==='target')return winner==='you'?'on the gold target!':'missed the target';
 return 'the return did not cross the net';
}
/** Stars for the court just finished: win, 4 perfect touches, and beating the rival's habit.
 * The drill awards stars by targets hit. Pure. */
export function tennisStars(s:TennisState){const c=court(s);
 if(c.style==='drill')return TENNIS_DRILL.stars.filter(n=>s.drillHits>=n).length;
 if(s.winner!=='you')return 0;
 const third=c.style==='steady'?s.bestRally>=8:c.style==='trickster'?s.fakeReads>=2:c.style==='champion'?s.goldenUsed>=1:s.habitWins>=2;
 return 1+(s.perfectTouches>=4?1:0)+(third?1:0);}
function drillPoint(s:TennisState,hit:boolean,kind:TennisPointKind){
 s.drillLeft=Math.max(0,s.drillLeft-1);if(hit){s.drillHits++;s.targetEvents++;}
 s.score.you=s.drillHits;s.score.rival=TENNIS_DRILL.balls-s.drillLeft-s.drillHits;
 s.pointKind=kind;s.pointWinner=hit?'you':'rival';s.rivalPlan=null;s.phaseTime=0;s.queuedKick=0;const b=s.ball;b.vx=b.vy=b.vz=0;b.wx=b.wy=b.wz=0;b.squash=0;
 s.you.direct=false;s.you.moveX=s.you.moveY=0;s.you.targetX=0;s.you.targetY=5.3;
 s.message=hit?`TARGET! ${s.drillHits} hit · ${s.drillLeft} balls left`:`${kind==='target'?'Close! Missed the ring':kind==='net'?'Into the net':kind==='out'?'Out':'Missed'} · ${s.drillLeft} balls left`;
 if(hit)moveTarget(s);s.phase='point';s.version++;
 if(s.drillLeft<=0){s.winner=s.drillHits>=TENNIS_DRILL.stars[0]?'you':'rival';s.phase='over';s.stars=tennisStars(s);s.you.vx=s.you.vy=0;
  s.message=`DRILL DONE · ${s.drillHits} of ${TENNIS_DRILL.balls} targets${s.winner==='you'?'':` · hit ${TENNIS_DRILL.stars[0]} to pass`}`;}
}
function point(s:TennisState,winner:TennisSide,kind:TennisPointKind){if(isDrill(s)){drillPoint(s,false,kind);return;}const reason=pointReason(s,winner,kind);s.pointKind=kind;s.rivalPlan=null;s.rivalStumble=0;s.score[winner]++;
 if(winner==='you'&&(kind==='space'||kind==='letgo')&&s.lastKicker==='you'&&s.lastYouShot===court(s).counter&&court(s).counter!=='auto')s.habitWins++;
 // Hidden adaptive help (bounded): a few lost points in a row ease the rival a little; a winning run tightens it.
 if(winner==='you'){s.winRun++;s.lossRun=0;if(s.winRun>=3)s.assist=Math.max(-.5,s.assist-.25);}else{s.lossRun++;s.winRun=0;if(s.lossRun>=2)s.assist=Math.min(1,s.assist+.35);}s.phaseTime=0;s.queuedKick=0;const b=s.ball;b.vx=b.vy=b.vz=0;b.wx=b.wy=b.wz=0;b.squash=0;s.pointWinner=winner;s.you.direct=s.rival.direct=false;s.you.moveX=s.you.moveY=0;s.you.targetX=s.rival.targetX=0;s.you.targetY=5.3;s.rival.targetY=-5.3;
 s.cleanStreak=0;s.message=`${winner==='you'?'YOUR POINT':'RIVAL POINT'} · ${reason}${s.rally>=5?' · '+s.rally+'-touch rally!':''}`;s.phase='point';s.version++;
 if(s.score[winner]>=TENNIS.winningScore){s.you.vx=s.you.vy=s.rival.vx=s.rival.vy=0;s.winner=winner;s.phase='over';s.stars=tennisStars(s);s.message=`${winner==='you'?(s.level===TENNIS_COURTS.length?'CIRCUIT WON':'COURT '+s.level+' WON'):'COURT '+s.level+' · TRY AGAIN'} · ${s.cleanReturns} clean returns · best rally ${s.bestRally}`;}}
function nextServe(s:TennisState){s.pointWinner=null;s.incomingOut=s.headSpot=s.rivalFinish=false;s.rivalPlan=null;s.rivalLetGo=false;s.rivalStumble=0;s.touchGrade='';s.youTrapped=s.rivalTrapped=false;s.setBonus=0;s.rivalFake=false;s.server=isDrill(s)?'rival':(s.score.you+s.score.rival)%2?'rival':'you';s.you=player(5.3);s.rival=player(-5.3);const p=s[s.server];s.ball=mkball(p.x+.3,p.y+(s.server==='you'?-.35:.35),s.server);s.rally=0;s.phase='serve';s.phaseTime=0;s.message=isDrill(s)?`Ball ${TENNIS_DRILL.balls-s.drillLeft+1} of ${TENNIS_DRILL.balls} · get ready`:s.server==='you'?'Your serve. Kick, or Lob for a rainbow flick, Drop for a short serve.':'Rival serving. Find a comfortable position.';s.version++;}
function move(p:TennisPlayer,speed:number,dt:number){
 const dx=p.targetX-p.x,dy=p.targetY-p.y,d=Math.hypot(dx,dy);
 // Arrival speed falls with distance, avoiding overshoot/orbiting a close target.
 const v=Math.min(speed,d*8),tx=p.direct?p.moveX*speed:d>.006?dx/d*v:0,ty=p.direct?p.moveY*speed:d>.006?dy/d*v:0;
 const braking=tx*p.vx+ty*p.vy<=0||Math.hypot(tx,ty)<Math.hypot(p.vx,p.vy),blend=1-Math.exp(-(braking?26:18)*dt);
 p.vx+=(tx-p.vx)*blend;p.vy+=(ty-p.vy)*blend;
 if(Math.hypot(tx,ty)<.001&&Math.hypot(p.vx,p.vy)<.025){p.vx=p.vy=0;if(!p.direct&&d<.006){p.x=p.targetX;p.y=p.targetY;}}
 p.x+=p.vx*dt;p.y+=p.vy*dt;p.stride+=Math.hypot(p.vx,p.vy)*dt*2.4;p.kick=Math.max(0,p.kick-dt);
}
function contain(p:TennisPlayer,minY:number,maxY:number){
 const x=clamp(p.x,-4.6,4.6),y=clamp(p.y,minY,maxY);
 if(x!==p.x)p.vx=0;if(y!==p.y)p.vy=0;p.x=x;p.y=y;
}
function step(s:TennisState,dt:number){
 s.bounceAge+=dt;s.perfectFlash=Math.max(0,s.perfectFlash-dt);s.clock+=dt;s.phaseTime+=dt;s.queuedKick=Math.max(0,s.queuedKick-dt);s.aiReaction=Math.max(0,s.aiReaction-dt);
 s.fxSlam=Math.max(0,s.fxSlam-dt);s.fxLand=Math.max(0,s.fxLand-dt);s.setBonus=Math.max(0,s.setBonus-dt);s.you.down=Math.max(0,s.you.down-dt);s.rival.down=Math.max(0,s.rival.down-dt);
 if(s.phase==='ready'||s.phase==='over')return;
 if(s.phase==='point'){s.you.direct=false;move(s.you,TENNIS.humanSpeed*.8,dt);move(s.rival,TENNIS.aiSpeed*1.3,dt);s.ball.squash=Math.max(0,s.ball.squash-dt*2.2);if(s.phaseTime>1.55)nextServe(s);return;}
 move(s.you,TENNIS.humanSpeed*(sandy(s)?.88:1)*(s.you.kickStyle===4&&s.you.kick>.22?.45:1)*(s.you.down>0?.3:1),dt);contain(s.you,.9,7.5);
 if(s.phase==='serve'){
  const p=s[s.server];s.ball.x=p.x+.3;s.ball.y=p.y+(s.server==='you'?-.35:.35);s.ball.z=.23;
  if((s.server==='you'&&s.queuedKick>0&&s.queuedShot!=='trap')||(s.server==='rival'&&s.phaseTime>(isDrill(s)?.9:1.1)))kick(s,s.server);return;
 }
 s.aiThink-=dt;
 if(isDrill(s)){s.rival.targetX=0;s.rival.targetY=-5.6;s.aiReaction=99;}
 if(s.aiThink<=0&&s.aiReaction<=0){s.aiThink=court(s).read+random(s)*.04;
  if(s.ball.last==='you'){
   const land=tennisLanding(s),out=Math.abs(land.x)>5.35||land.y<-8.4;
   if(out&&random(s)<.85){s.rival.targetX=clamp(land.x*.4,-3,3);s.rival.targetY=-5.4;s.aiReaction=Math.max(s.aiReaction,.45);s.rivalLetGo=true;} // reads it long — lets it sail
   else {const bl=s.ball,hv=Math.max(.5,Math.hypot(bl.vx,bl.vy)); // read the bounce: wait a step BEHIND the landing along the ball's line
    s.rival.targetX=clamp(land.x+bl.vx/hv*.5+s.aiReadErrorX,-4.5,4.5);s.rival.targetY=clamp(land.y+bl.vy/hv*.5+s.aiReadErrorY,-7.4,-1);}
  }
  else {
   // Bisect the possible return angles, with a visible forward press on later
   // courts. A lob beats the press; a drop punishes a deep recovery.
   // Recovery by personality: the deep defender hangs back, the rusher charges the net.
   const style=court(s).style;
   // A tiring rival is slow to get back to the middle: the space it leaves is the place to aim.
   const tire=tennisRivalTire(s);s.rival.targetX=clamp(s.ball.x*(.22+tier(s)*.025)*(1-tire)+s.rival.x*tire*.85,-1.5-tire*2,1.5+tire*2);
   s.rival.targetY=style==='baseliner'?-6.5:style==='rusher'&&s.you.y>3?-2.4:s.you.y<3?-5.9:-4.7+court(s).press*3;
  }
 }
 // Long rallies speed the rival up a little (tension); a wrong-footed rival slows to a stumble.
 if(s.ball.last==='you'&&s.ball.crossed&&!s.rivalPlan&&!s.rivalLetGo&&Math.hypot(s.ball.x-s.rival.x,s.ball.y-s.rival.y)<tennisCommitRange(s.level))planRival(s);
 s.rivalStumble=Math.max(0,s.rivalStumble-dt);
 // Personality footwork: the deep defender is slow coming forward, the rusher slow going back.
 const style=court(s).style,forward=s.rival.targetY>s.rival.y+.3,back=s.rival.targetY<s.rival.y-.3;
 const habitPace=style==='baseliner'&&forward?.72:style==='rusher'&&back?.66:1;
 move(s.rival,court(s).speed*habitPace*(sandy(s)?.9:1)*(1-Math.max(0,s.assist)*.1)*(1+Math.min(.12,s.rally*.012))*(1-tennisRivalTire(s)*.38)*(s.rivalStumble>0?.5:1)*(s.rival.kickStyle===4&&s.rival.kick>.22?.45:1)*(s.rival.down>0?.3:1),dt);contain(s.rival,-7.5,-.9);
 if(s.rivalFake&&s.rivalPlan&&!s.fakeShown&&s.ball.last==='you'&&Math.hypot(s.ball.x-s.rival.x,s.ball.y-s.rival.y)<1.9){s.fakeShown=true;s.message='Watch the FAKE! Stay balanced in the middle.';s.version++;}
 const b=s.ball,oldY=b.y,oldZ=b.z,a=accel(b);
 b.vx+=a.ax*dt;b.vy+=a.ay*dt;b.vz+=a.az*dt;
 b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;
 const dec=Math.max(0,1-.3*dt);b.wx*=dec;b.wy*=dec;b.wz*=dec;
 const hs=Math.hypot(b.vx,b.vy),dir=Math.abs(b.vx)>Math.abs(b.vy)*.6?(b.vx>=0?1:-1):(b.vy>=0?1:-1);
 b.rot+=dir*(hs*1.6+Math.abs(b.wx)*.18)*dt;b.squash=Math.max(0,b.squash-dt*2.2);
 if((oldY<0&&b.y>=0)||(oldY>0&&b.y<=0)){
  const nh=TENNIS.netHeight,R=TENNIS.ballRadius,from=oldY<0?-1:1,crossZ=oldZ+(b.z-oldZ)*(-oldY/(b.y-oldY));
  if(crossZ<nh-R*.5){ // thudded into the mesh — the net swallows it
   b.y=from*.12;b.vy*=-.14;b.vx*=.3;b.vz=Math.min(b.vz,0)*.3-.4;b.wx*=.2;b.wy*=.2;b.wz*=.2;b.netHit=true;b.squash=.1;
   s.message='Into the net…';s.netEvents++;s.netKind='net';s.netX=b.x;s.netPace=Math.abs(b.vy/.14);s.version++;
  }else if(crossZ<nh+R*.95){ // kissed the tape — it can dribble over or fall back
   const pace=Math.abs(b.vy);b.y=0;b.z=nh+R;
   // Contact height and momentum decide a tape clip, not a coin flip.
   // A low, soft ball falls back; a high grazing strike keeps its direction.
   const grazing=clamp((crossZ-(nh-R*.5))/(R*1.45),0,1);
   const over=grazing+Math.min(.28,pace*.018)>.52;
   b.vy=(over?-from:from)*clamp(pace*(.1+grazing*.14),.35,2.1);
   b.vx*=.45;b.vz=clamp(Math.abs(b.vz)*.2+pace*.055,.5,2.1);b.wx*=.3;b.wy*=.3;b.wz*=.3;b.squash=.08;
   s.incomingOut=s.headSpot=false;
   if(over){b.crossed=true;s.message='Off the tape… and over!';}else{b.netHit=true;s.message='Clipped the tape…';}
   s.netEvents++;s.netKind=over?'over':'back';s.netX=b.x;s.netPace=pace;
   s.version++;
  }else b.crossed=true;
 }
 if(s.queuedKick>0&&s.queuedShot==='trap'){if(canTennisTrap(s,'you')){trap(s,'you');return;}}
 else if(s.queuedKick>0&&s.queuedShot!=='header'&&s.queuedShot!=='scissor'&&!canTennisKick(s,'you')&&!canTennisSlam(s,'you')&&canTennisDive(s)){s.queuedShot='dive';kick(s,'you');return;}
 else if(s.queuedKick>0&&(s.queuedShot==='header'?canTennisHeader(s,'you'):s.queuedShot==='scissor'?canTennisScissor(s,'you'):canTennisKick(s,'you')||canTennisSlam(s,'you'))){
  // Patient first touch: hold the pressed kick while the ball is still coming to you.
  const aerialOnly=s.queuedShot!=='header'&&s.queuedShot!=='scissor'&&canTennisSlam(s,'you')&&!canTennisKick(s,'you'),ground=s.queuedShot!=='header'&&s.queuedShot!=='scissor'&&!aerialOnly;
  // A high ball out of comfortable reach is never swatted at full stretch: let it drop instead.
  if(aerialOnly&&tennisSlamTooFar(s)){if(s.kickHold<TENNIS_KICK_HOLD){s.kickHold+=dt;s.queuedKick=Math.max(s.queuedKick,dt*2);}}
  else if(ground&&s.kickHold<TENNIS_KICK_HOLD*tennisAssist(s)&&tennisShouldWait(s)){s.kickHold+=dt;s.queuedKick=Math.max(s.queuedKick,dt*2);
   // First courts: a small assisted step lines your body up beside the ball.
   if(court(s).tier<=2&&s.you.kick<=0){const p=s.you,ax=b.x-p.x,ay=b.y+.25-p.y,ad=Math.hypot(ax,ay);if(ad>.3){const k=Math.min(ad-.3,1.6*dt)/ad;p.x+=ax*k;p.y+=ay*k;contain(p,.9,7.5);}}
  }else{kick(s,'you');return;}
 }
 if(!isDrill(s)&&s.aiReaction<=0&&(canTennisKick(s,'rival')&&!rivalWaits(s)||(s.aiSlam&&canTennisSlam(s,'rival')&&Math.hypot(s.rival.x-s.ball.x,s.rival.y-s.ball.y)<=.95)||(s.aiHeader&&s.ball.z>=1.35&&canTennisHeader(s,'rival')&&Math.hypot(s.rival.x-s.ball.x,s.rival.y-s.ball.y)<=.8))){
  // Two-touch courts: a stretched or chest-high rival traps first and sets itself up.
  const rb=s.ball,rr=Math.hypot(s.rival.x-rb.x,s.rival.y-rb.y);
  if(canTennisTrap(s,'rival')&&(rr>.8||rb.z>.85)&&random(s)<.5+tier(s)*.05){trap(s,'rival');return;}
  kick(s,'rival');return;}
 if(b.z<=TENNIS.ballRadius&&b.vz<0){
  const outside=Math.abs(b.x)>TENNIS.halfWidth||Math.abs(b.y)>TENNIS.halfLength;
  if(outside){if(b.bounces>0)point(s,b.last,'space');else point(s,other(b.last),'out');return;}
  if(!b.crossed){point(s,other(b.last),b.netHit?'net':'miss');return;}
  s.bounceEvents++;b.bounces++;
  if(isDrill(s)&&b.last==='you'&&b.y<0){const hit=Math.hypot(b.x-s.targetX,b.y-s.targetY)<=TENNIS_DRILL.radius;drillPoint(s,hit,hit?'target':'target');return;}
  if(b.bounces>1){point(s,b.last,b.last==='you'&&s.rivalLetGo?'letgo':'space');return;}
  // energy-losing bounce: restitution up; friction across the ground converts spin —
  // topspin skids through low and quick, backspin checks up short
  // Sand swallows energy: a lower, slower bounce (bend your knees!).
  s.bounceAge=0;const R=TENNIS.ballRadius,imp=-b.vz;b.z=R;b.vz=imp*TENNIS.restitution*(sandy(s)?.78:1);
  const k=sandy(s)?.6:.5,pre=Math.hypot(b.vx,b.vy);
  b.vx-=k*(b.vx-b.wy*R);b.vy-=k*(b.vy+b.wx*R);
  const post=Math.hypot(b.vx,b.vy),cap=pre*.92+.2;
  if(post>cap){const f=cap/post;b.vx*=f;b.vy*=f;}
  b.wx*=.55;b.wy*=.55;b.wz*=.7;b.squash=Math.min(.16,.05+imp*.014);
  s.fxLand=.45;s.fxLandX=b.x;s.fxLandY=b.y;s.fxLandI=Math.min(1,.25+imp*.09);
  if(!(b.last==='you'&&b.y>0)){s.message=s.youTrapped&&b.y>0?'It bounced — strike it now!':sandy(s)&&b.y>0?'Low sand bounce — bend your knees and get close.':'One bounce. Get close and kick it back.';s.version++;}
 }
 if(Math.abs(b.x)>6.8||Math.abs(b.y)>10.5){if(b.bounces>0)point(s,b.last,'space');else point(s,other(b.last),'out');}
}
export function tickTennis(s:TennisState,seconds:number){let remaining=Math.max(0,Math.min(.08,seconds));while(remaining>0){const dt=Math.min(remaining,1/120);step(s,dt);remaining-=dt;}}
export function tennisNeedsFrames(s:TennisState){return s.phase==='rally'||s.phase==='point'||s.fxSlam>0||s.fxLand>0||(s.phase==='serve'&&((s.you.direct&&Math.hypot(s.you.moveX,s.you.moveY)>.001)||s.server==='rival'||s.queuedKick>0||(!s.you.direct&&Math.hypot(s.you.targetX-s.you.x,s.you.targetY-s.you.y)>.006)||Math.hypot(s.you.vx,s.you.vy)>0||s.you.kick>0));}
/** The court card's touch guide: which touches this court uses and WHEN, in kid words (first entry = the
 * main first touch). Pure data from the ladder, so the guide always matches the rules of the court. */
export type TennisTouchGuide={touch:'kick'|'trap'|'header'|'lob'|'drop'|'aim';when:string};
export function tennisCourtTouches(level:number):TennisTouchGuide[]{
 const c=TENNIS_COURTS[clamp(Math.floor(level)||1,1,TENNIS_COURTS.length)-1],out:TennisTouchGuide[]=[];
 out.push({touch:'kick',when:c.surface==='sand'?'Low ball: bend your knees, kick after the bounce':'Low ball: let it bounce, plant, then kick'});
 if(c.touches>1)out.push({touch:'trap',when:'Waist-high ball: cushion it soft, then kick'});
 if(c.aerial&&c.style!=='drill')out.push({touch:'header',when:'High ball: stand under it and head it'});
 if(c.counter==='drop'||c.counter==='lob')out.push({touch:c.counter,when:c.counter==='drop'?'Rival stays deep: play it short':'Rival rushes the net: lob over'});
 else out.push({touch:'aim',when:c.style==='drill'?'Push the stick toward the gold ring':'Push the stick toward the open space'});
 return out;
}
/** The one touch that fits the ball right now — drives the glowing button and the HUD cue, so a
 * 7–12 year old can see WHICH touch to use (kick a low ball, trap a waist-high one, head a high one). */
export type TennisCall=''|'move'|'wait'|'kick'|'perfect'|'trap'|'header'|'scissor'|'bicycle'|'volley'|'drop'|'letgo';
export function tennisTouchCall(s:TennisState):TennisCall{
 const b=s.ball;if(s.phase!=='rally'||b.last!=='rival')return '';
 if(s.incomingOut&&b.bounces===0)return 'letgo';
 if(!b.crossed)return 'move';
 if(canTennisPerfect(s))return 'perfect';
 const c=court(s);
 if(c.aerial&&canTennisBicycle(s))return 'bicycle';
 if(c.aerial&&canTennisHeader(s,'you'))return 'header';
 if(c.aerial&&canTennisScissor(s,'you'))return 'scissor';
 // A waist-to-chest-high ball on a two-touch court: cushion it first (the futnet first touch).
 if(canTennisTrap(s)&&b.z>=.7&&!(b.bounces===1&&canTennisKick(s,'you')&&b.z<.85))return 'trap';
 if(canTennisSlam(s,'you'))return tennisSlamTooFar(s)?'drop':'volley';
 if(canTennisKick(s,'you'))return tennisShouldWait(s)?'wait':'kick';
 return 'move';
}
/** Which on-screen button the call lights up ('' = none: move, wait for it, or let it go). */
export const tennisCallButton=(call:TennisCall):''|'kick'|'trap'|'header'|'scissor'=>call==='perfect'||call==='kick'||call==='volley'||call==='wait'?'kick':call==='trap'?'trap':call==='header'?'header':call==='scissor'||call==='bicycle'?'scissor':'';
/** Screen-direction arrow for the open space (the camera looks up the court: -x is screen-left). */
const spaceArrow=(side:number)=>side<0?'◀':'▶';
/** The HUD cue line: the touch to use, in kid words, plus where the open space is when you can strike. */
export function tennisCallDetail(s:TennisState,call:TennisCall=tennisTouchCall(s)){
 const side=tennisOpenSide(s),aim=side?` · aim ${spaceArrow(side)} into space`:'';
 switch(call){
  case 'perfect':return `PERFECT WINDOW · kick now!${aim}`;
  case 'kick':return `KICK NOW · plant & strike${aim}`;
  case 'wait':return 'LET IT COME · step in, stay balanced';
  case 'trap':return 'TRAP IT soft · then strike';
  case 'bicycle':return 'GOLDEN · Bicycle kick now!';
  case 'header':return canTennisScissor(s,'you')?'HIGH BALL · Header (or Scissor)':'HEADER · meet it above you';
  case 'scissor':return 'SCISSOR · strike the dropping ball';
  case 'volley':return `HIGH BALL · Volley now${aim}`;
  case 'drop':return 'TOO HIGH · let it drop, then control it';
  case 'letgo':return 'GOING OUT · let it go!';
  case 'move':return s.headSpot?'HIGH BALL · stand on the blue ring':sandy(s)?'LOW SAND BOUNCE · get there early, bend your knees':'MOVE · get to the bounce spot early';
 }
 return tennisStatus(s);
}
/** HUD status line while playing (court, rival personality, golden meter, drill count). */
export function tennisStatus(s:TennisState){const c=court(s);
 if(c.style==='drill')return `Court ${s.level} · TARGET DRILL · ${s.drillLeft} balls left`;
 const gold=s.goldReady?'GOLDEN READY':`Gold ${'●'.repeat(s.gold)}${'○'.repeat(TENNIS_GOLD-s.gold)}`;
 return `Court ${s.level} · ${c.rival} · Rally ${s.rally} · ${gold}`;}
/** The coach's one-line takeaway after a court: the habit that cost the most touches, in kid words. */
export const TENNIS_COACH:Record<'heavy'|'early'|'late'|'stretched'|'recover'|'rhythm'|'start',string>={
 recover:'After each kick, get back to the middle. Then read the next ball.',
 heavy:'Heavy touches: slow your feet before the ball arrives.',
 early:'Early touches: let it bounce first, then kick.',
 late:'Late touches: meet the ball as it rises.',
 stretched:'Stretched touches: move early so the ball comes to your body.',
 rhythm:'Great rhythm: bounce, plant, strike!',
 start:'Let it bounce, plant your feet, then kick.',
};
export function tennisTakeaway(s:Pick<TennisState,'gradeCounts'|'perfectTouches'|'caught'>){
 const g=s.gradeCounts;let worst:'heavy'|'early'|'late'|'stretched'|null=null,n=1;
 for(const k of ['heavy','early','late','stretched'] as const)if(g[k]>n){n=g[k];worst=k;}
 // Positioning comes first: a player caught out of position keeps getting stretched.
 if(s.caught>=4&&s.caught>=n)return TENNIS_COACH.recover;
 if(worst&&n>=Math.max(2,g.perfect*.5))return TENNIS_COACH[worst];
 return s.perfectTouches>=4?TENNIS_COACH.rhythm:worst?TENNIS_COACH[worst]:TENNIS_COACH.start;
}
/** End-of-court summary with stars, the coach's takeaway and, after a win, the next rival. */
export function tennisOverDetail(s:TennisState){const c=court(s),stars='★'.repeat(s.stars)+'☆'.repeat(3-s.stars),next=s.winner==='you'?TENNIS_COURTS[s.level]:undefined;
 const tail=`${s.stars<3?' · 3rd star: '+c.star3:''} · Coach: ${tennisTakeaway(s)}${next?` · Next: ${next.name} vs ${next.rival}`:''}`;
 return c.style==='drill'?`${stars} · ${s.drillHits}/${TENNIS_DRILL.balls} targets${tail}`:`${stars} · Court ${s.level} · ${c.name} · ${s.perfectTouches} perfect · best rally ${s.bestRally}${tail}`;}
