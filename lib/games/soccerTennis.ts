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
export type TennisShot='auto'|'drive'|'drop'|'lob'|'slam'|'header'|'scissor';
/** kickStyle drives the animation: 0 = soft tap, 1 = full swing, 2 = volley, 3 = header, 4 = scissor */
export interface TennisPlayer{x:number;y:number;vx:number;vy:number;targetX:number;targetY:number;kick:number;stride:number;kickStyle:number;moveX:number;moveY:number;direct:boolean;kickFacing:number;kickSpan:number;kickContactX:number;kickContactZ:number;kickHeight:number;kickPower:number;kickKind:'pass'|'shot'|'loft';}
export interface TennisBall{
 x:number;y:number;z:number;vx:number;vy:number;vz:number;
 /** spin vector, rad/s — wx/wy tip the flight (top/backspin dip & lift), wz bends it sideways */
 wx:number;wy:number;wz:number;
 /** render helpers: accumulated roll angle, bounce-squash timer, net flag */
 rot:number;squash:number;netHit:boolean;
 last:TennisSide;bounces:number;crossed:boolean;
}
export interface TennisState{
 phase:TennisPhase;you:TennisPlayer;rival:TennisPlayer;ball:TennisBall;score:{you:number;rival:number};server:TennisSide;
 rally:number;bestRally:number;message:string;version:number;clock:number;phaseTime:number;queuedKick:number;aim:number|null;
 aiThink:number;aiReaction:number;seed:number;winner:TennisSide|null;
 /** shot system + fx (all mutated in place — the frame loop stays allocation-free) */
 queuedShot:TennisShot;lastShot:TennisShot;lastKicker:TennisSide;kickCount:number;aiSlam:boolean;
 fxSlam:number;fxSlamX:number;fxSlamY:number;fxSlamZ:number;
 fxLand:number;fxLandX:number;fxLandY:number;fxLandI:number;
 pointWinner:TennisSide|null;shotAim:number;cleanReturns:number;cleanStreak:number;bestCleanStreak:number;rivalIntent:string;
}
export const TENNIS={halfWidth:5,halfLength:8,netHeight:1.1,ballRadius:.17,gravity:10.5,winningScore:7,humanSpeed:7.3,aiSpeed:4.1,drag:.018,magnus:.012,restitution:.68,kickDuration:.42};
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const other=(s:TennisSide):TennisSide=>s==='you'?'rival':'you';
const player=(y:number):TennisPlayer=>({x:0,y,vx:0,vy:0,targetX:0,targetY:y,kick:0,stride:0,kickStyle:1,moveX:0,moveY:0,direct:false,kickFacing:y>0?Math.PI:0,kickSpan:TENNIS.kickDuration,kickContactX:0,kickContactZ:.65,kickHeight:.23,kickPower:.35,kickKind:'shot'});
const mkball=(x:number,y:number,last:TennisSide):TennisBall=>({x,y,z:.23,vx:0,vy:0,vz:0,wx:0,wy:0,wz:0,rot:0,squash:0,netHit:false,last,bounces:0,crossed:false});
export function createTennis(seed=47):TennisState{return {phase:'ready',you:player(5.3),rival:player(-5.3),ball:mkball(.3,4.95,'you'),score:{you:0,rival:0},server:'you',rally:0,bestRally:0,message:'A little court. A good rally.',version:0,clock:0,phaseTime:0,queuedKick:0,aim:null,aiThink:0,aiReaction:0,seed:seed>>>0,winner:null,
 queuedShot:'auto',lastShot:'auto',lastKicker:'you',kickCount:0,aiSlam:false,fxSlam:0,fxSlamX:0,fxSlamY:0,fxSlamZ:0,fxLand:0,fxLandX:0,fxLandY:0,fxLandI:0,pointWinner:null,shotAim:0,cleanReturns:0,cleanStreak:0,bestCleanStreak:0,rivalIntent:'Ready at the baseline'};}
export function resetTennis(s:TennisState){Object.assign(s,createTennis(s.seed));}
function random(s:TennisState){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
export function beginTennis(s:TennisState){s.phase='serve';s.phaseTime=0;s.message='Choose an angle. Move left or right, then Serve.';s.version++;}
export function setTennisTarget(s:TennisState,x:number,y:number){if(Math.abs(x-s.you.x)>.25)s.shotAim=clamp((x-s.you.x)/2,-1,1);s.you.direct=false;s.you.targetX=clamp(x,-4.55,4.55);s.you.targetY=clamp(y,.95,7.45);}
/** Analog movement is velocity input, not a repeatedly displaced destination. A
 * released stick brakes once; pointer targets continue to use arrival steering. */
export function setTennisMovement(s:TennisState,x:number,y:number){
 const p=s.you,length=Math.hypot(x,y),scale=length>1?1/length:1;
 if(Math.abs(x)>.15)s.shotAim=clamp(x*scale,-1,1);
 if(length>.001){p.direct=true;p.moveX=x*scale;p.moveY=y*scale;}
 else if(p.direct){p.moveX=p.moveY=0;p.targetX=p.x;p.targetY=p.y;}
}
export function requestTennisKick(s:TennisState,aim?:number,shot:TennisShot='auto'){if(s.phase!=='rally'&&!(s.phase==='serve'&&s.server==='you'))return;if(s.phase==='serve'&&(shot==='header'||shot==='scissor')){s.message='Serve with your foot. Save aerial moves for the return.';s.version++;return;}s.queuedKick=.32;s.queuedShot=shot;s.aim=aim===undefined?s.shotAim:clamp(aim,-1,1);if(shot==='header'&&!canTennisHeader(s,'you')){s.message='Header: get underneath a high incoming ball.';s.version++;}if(shot==='scissor'&&!canTennisScissor(s,'you')){s.message='Scissor: get close as the high ball drops.';s.version++;}}
/** drag + Magnus + gravity — the one acceleration model shared by the live sim and the predictor */
function accel(b:{vx:number;vy:number;vz:number;wx:number;wy:number;wz:number}){
 const sp=Math.hypot(b.vx,b.vy,b.vz),D=TENNIS.drag*sp,M=TENNIS.magnus;
 return {ax:-D*b.vx+M*(b.wy*b.vz-b.wz*b.vy),ay:-D*b.vy+M*(b.wz*b.vx-b.wx*b.vz),az:-TENNIS.gravity-D*b.vz+M*(b.wx*b.vy-b.wy*b.vx)};
}
/** numerically fly the ball to its landing (ignoring the net) so predictions honor drag + spin */
function flight(b:TennisBall){
 const c={x:b.x,y:b.y,z:b.z,vx:b.vx,vy:b.vy,vz:b.vz,wx:b.wx,wy:b.wy,wz:b.wz};
 let t=0,netZ:number|null=null;const dt=1/90,R=TENNIS.ballRadius;
 while(t<3.2){
  const a=accel(c);c.vx+=a.ax*dt;c.vy+=a.ay*dt;c.vz+=a.az*dt;
  const oy=c.y;c.x+=c.vx*dt;c.y+=c.vy*dt;c.z+=c.vz*dt;t+=dt;
  if(netZ===null&&((oy<0&&c.y>=0)||(oy>0&&c.y<=0)))netZ=c.z-c.vz*dt*(c.y/(c.y-oy));
  const decay=Math.max(0,1-.3*dt);c.wx*=decay;c.wy*=decay;c.wz*=decay;
  if(c.z<=R&&c.vz<0)break;
 }
 return {x:c.x,y:c.y,time:t,netZ};
}
export function tennisLanding(s:TennisState){const f=flight(s.ball);return {x:f.x,y:f.y,time:f.time};}
export function canTennisKick(s:TennisState,side:TennisSide){if(s.phase!=='rally'||s.ball.last===side||!s.ball.crossed)return false;const p=s[side],b=s.ball;return (side==='you'?b.y>.15:b.y<-.15)&&b.z<1.15&&Math.hypot(p.x-b.x,p.y-b.y)<1.3;}
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
function kick(s:TennisState,side:TennisSide){
 const p=s[side],b=s.ball,sign=side==='you'?-1:1,serve=s.phase==='serve';
 const high=!serve&&b.z>=1.15;
 // shot selection: your queued intent (auto/drive upgrade to a SLAM on a high ball);
 // the rival mostly drives, lobs sometimes, drops when you camp deep — and spikes high balls
 let shot:TennisShot=serve?'auto':s.queuedShot;
 if(side==='rival'&&!serve){
  if(high)shot='slam';
  else{const r=random(s);shot=s.you.y>5.6?'drop':s.you.y<3.1?'lob':r<.78?'auto':'lob';}
  s.rivalIntent=shot==='drop'?'SHORT BALL · close the space':shot==='lob'?'DEEP LOB · recover behind it':shot==='slam'?'SPIKE · prepare to react':'WIDE RETURN · cover the angle';
 }
 if(high&&(shot==='auto'||shot==='drive'))shot='slam';
 if(shot==='slam'&&!high)shot='auto';
 // contact quality: planted next to the ball = clean; lunging at full stretch = scrappy.
 // An overhead slam punishes stretching hardest, and long rallies pile on pressure.
 const reach=Math.hypot(p.x-b.x,p.y-b.y),pace=Math.hypot(p.vx,p.vy);
 const pressure=side==='you'?0:Math.min(.25,s.rally*.025);
 let q=serve?.88+random(s)*.1
  :shot==='header'?clamp(1.18-reach*.6-pace*.04-pressure,.3,1)
  :shot==='scissor'?clamp(1.22-reach*.9-pace*.07-pressure,.2,1)
  :shot==='slam'?clamp(1.2-reach*.85-pace*.07-pressure,.2,1)
  :clamp(1.18-reach*.6-pace*.05-Math.max(0,b.z-.75)*.4-pressure,.22,1);
 if(side==='rival')q=Math.min(q,.58+random(s)*.42); // the rival mixes sharp days and scrappy ones
 if(side==='you'&&!serve){const clean=q>=.72;s.cleanReturns+=clean?1:0;s.cleanStreak=clean?s.cleanStreak+1:0;s.bestCleanStreak=Math.max(s.bestCleanStreak,s.cleanStreak);}
 const err=(1-q)*(shot==='slam'||shot==='scissor'?2.2:1.6);
 let tx=side==='you'
  ?((s.aim??s.shotAim)*3.7)
  :clamp((s.you.x>.4?-1:s.you.x<-.4?1:random(s)<.5?-1:1)*(2.4+random(s)*.8),-3.6,3.6);
 let ty=sign*(shot==='drop'?1.5+random(s)*1.1:shot==='lob'?5.7+random(s)*1.9:shot==='slam'?2.6+q*2.1+random(s)*1.4:4.3+random(s)*1.7);
 if(shot==='drop')tx*=.7; // soft balls stay honest, near the middle of the front court
 tx=clamp(tx+(random(s)-.5)*err*2.4,-5.6,5.6);
 ty=ty+(random(s)-.5)*err*2.2;ty=sign<0?clamp(ty,side==='you'?-8.6:-7.9,shot==='drop'?-1.1:-1.4):clamp(ty,shot==='drop'?1.1:1.4,side==='rival'?7.9:8.6);
 const dist=Math.max(.5,Math.hypot(tx-b.x,ty-b.y)),dx=(tx-b.x)/dist,dy=(ty-b.y)/dist;
 // shot shape: drops float with backspin and die, lobs sail high & deep, slams hammer DOWN
 // from the contact height, drives skim flat with heavy topspin, loops are the safe default
 const drive=shot==='drive'||(shot==='auto'&&!serve&&q>.72);
 let T:number,clear:number,ts:number;
 if(shot==='scissor'){T=clamp(.39+dist*.009,.43,.59);clear=.2+q*.09;ts=20+q*8;}
 else if(shot==='header'){T=1.02+dist*.028;clear=.4+q*.2;ts=3+q*2;}
 else if(shot==='slam'){T=clamp(Math.sqrt(2*Math.max(.25,b.z-.25)/TENNIS.gravity)+dist*.012,.34,.72);clear=.16+q*.12;ts=15+q*10;} // clear stays ABOVE the tape-clip band
 else if(shot==='drop'){T=1+dist*.075;clear=.24+q*.22;ts=-(2.5+q*3.5);}
 else if(shot==='lob'){T=1.45+dist*.06;clear=1.05+q*.75;ts=2+q*2.5;}
 else if(drive){T=.85+dist*.042;clear=.19+q*.12;ts=11+q*8;}
 else{T=1.22+dist*.052+(1-q)*.25;clear=.2+q*.25;ts=4+q*5;}
 const ss=(random(s)-.5)*(1-q)*22+(random(s)-.5)*4;  // sidespin: wild contacts slice and hook
 b.wx=-ts*dy;b.wy=ts*dx;b.wz=ss;
 b.z=clamp(b.z,.17,shot==='header'?2.75:shot==='scissor'?2.5:shot==='slam'?2.1:1.05);
 solve(b,tx,ty,T,clear,drive||shot==='slam'||shot==='scissor');
 // contact noise — a stretched toe-poke (or wild spike) flies with a mind of its own
 const n=(1-q)*(shot==='slam'?1:.65);
 b.vx+=(random(s)-.5)*n*2.4;b.vy+=(random(s)-.5)*n*2.2;b.vz+=(random(s)-.65)*n*2;
 b.last=side;b.bounces=0;b.crossed=false;b.netHit=false;
 p.kickSpan=shot==='scissor'?.85:shot==='header'?.58:TENNIS.kickDuration;p.kick=p.kickSpan;p.kickFacing=Math.atan2(b.vx,b.vy);p.kickStyle=shot==='scissor'?4:shot==='header'?3:shot==='slam'?2:shot==='drop'?0:1;
 // Keep the committed contact in the outgoing frame; the visible island boot
 // must not chase the ball's next simulation position during follow-through.
 const contactX=b.x-p.x,contactZ=b.y-p.y,sin=Math.sin(p.kickFacing),cos=Math.cos(p.kickFacing);
 p.kickContactX=contactX*cos-contactZ*sin;p.kickContactZ=contactX*sin+contactZ*cos;p.kickHeight=b.z;
 p.kickKind=shot==='drop'?'pass':shot==='lob'?'loft':'shot';p.kickPower=(shot==='drop'?.2:shot==='lob'?.48:shot==='scissor'?1:shot==='header'?.6:shot==='slam'?.95:drive?.72:.45)*(.7+.3*q);
 s.lastShot=shot==='auto'?(drive?'drive':'auto'):shot;s.lastKicker=side;s.kickCount++;
 if(shot==='slam'||shot==='header'||shot==='scissor'){s.fxSlam=shot==='scissor'?.65:.42;s.fxSlamX=b.x;s.fxSlamY=b.y;s.fxSlamZ=b.z;}
 s.rally++;s.bestRally=Math.max(s.bestRally,s.rally);s.phase='rally';s.queuedKick=0;s.queuedShot='auto';
 // a slam travels ~half a second — the rival gets a hurried (imperfect) chance to dig it out;
 // and the rival only WANTS to spike some of your returns (decided here, per kick)
 s.aiReaction=(shot==='slam'||shot==='scissor')&&side==='you'?.16+random(s)*.2:.3+random(s)*.24;s.aiThink=0;
 if(side==='you')s.aiSlam=random(s)<.45;
 s.message=s.rally===1?'Recover toward the middle. Read the return.'
  :side==='you'?(
   shot==='scissor'?'SCISSOR! Extra pace — recover from the landing.'
   :shot==='header'?'HEADER! Meet the ball, guide it into space.'
   :shot==='slam'?(q>.55?'SLAM! Hammered down the other side.':'A wild spike — anything can happen.')
   :shot==='drop'?'A soft touch, floating just past the tape.'
   :shot==='lob'?'Up and over — deep toward the back line.'
   :q>.75?`CLEAN TOUCH${s.cleanStreak>1?' ×'+s.cleanStreak:''} · recover to the middle.`:q>.45?'Across it goes. Find your next position.':'A stretched touch — recover quickly!')
  :(shot==='slam'?'The rival SPIKES it — dig it out!'
   :shot==='drop'?'A sneaky drop ball — sprint in!'
   :shot==='lob'?'A high lob floats deep. Get under it.'
   :q>.68?s.rivalIntent:'A scrappy return floats over. Attack it.');
 s.version++;
}
function point(s:TennisState,winner:TennisSide,reason:string){s.score[winner]++;s.phaseTime=0;s.queuedKick=0;const b=s.ball;b.vx=b.vy=b.vz=0;b.wx=b.wy=b.wz=0;b.squash=0;s.pointWinner=winner;s.you.direct=s.rival.direct=false;s.you.moveX=s.you.moveY=0;s.you.targetX=s.rival.targetX=0;s.you.targetY=5.3;s.rival.targetY=-5.3;
 s.cleanStreak=0;s.message=`${winner==='you'?'YOUR POINT':'RIVAL POINT'} · ${reason}${s.rally>=5?' · '+s.rally+'-touch rally!':''}`;s.phase='point';s.version++;
 if(s.score[winner]>=TENNIS.winningScore){s.you.vx=s.you.vy=s.rival.vx=s.rival.vy=0;s.winner=winner;s.phase='over';s.message=`${winner==='you'?'COURT WON':'MATCH COMPLETE'} · ${s.cleanReturns} clean returns · best rally ${s.bestRally}`;}}
function nextServe(s:TennisState){s.pointWinner=null;s.server=(s.score.you+s.score.rival)%2?'rival':'you';s.you=player(5.3);s.rival=player(-5.3);const p=s[s.server];s.ball=mkball(p.x+.3,p.y+(s.server==='you'?-.35:.35),s.server);s.rally=0;s.phase='serve';s.phaseTime=0;s.message=s.server==='you'?'Your serve. Take your time.':'Rival serving. Find a comfortable position.';s.version++;}
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
 s.clock+=dt;s.phaseTime+=dt;s.queuedKick=Math.max(0,s.queuedKick-dt);s.aiReaction=Math.max(0,s.aiReaction-dt);
 s.fxSlam=Math.max(0,s.fxSlam-dt);s.fxLand=Math.max(0,s.fxLand-dt);
 if(s.phase==='ready'||s.phase==='over')return;
 if(s.phase==='point'){s.you.direct=false;move(s.you,TENNIS.humanSpeed*.8,dt);move(s.rival,TENNIS.aiSpeed*1.3,dt);s.ball.squash=Math.max(0,s.ball.squash-dt*2.2);if(s.phaseTime>1.55)nextServe(s);return;}
 move(s.you,TENNIS.humanSpeed*(s.you.kickStyle===4&&s.you.kick>.22?.45:1),dt);contain(s.you,.9,7.5);
 if(s.phase==='serve'){
  const p=s[s.server];s.ball.x=p.x+.3;s.ball.y=p.y+(s.server==='you'?-.35:.35);s.ball.z=.23;
  if((s.server==='you'&&s.queuedKick>0)||(s.server==='rival'&&s.phaseTime>1.1))kick(s,s.server);return;
 }
 s.aiThink-=dt;
 if(s.aiThink<=0&&s.aiReaction<=0){s.aiThink=.16+random(s)*.08;
  if(s.ball.last==='you'){
   const land=tennisLanding(s),out=Math.abs(land.x)>5.35||land.y<-8.4;
   if(out&&random(s)<.85){s.rival.targetX=clamp(land.x*.4,-3,3);s.rival.targetY=-5.4;s.aiReaction=Math.max(s.aiReaction,.45);} // reads it long — lets it sail
   else {const bl=s.ball,hv=Math.max(.5,Math.hypot(bl.vx,bl.vy)); // read the bounce: wait a step BEHIND the landing along the ball's line
    s.rival.targetX=clamp(land.x+bl.vx/hv*.5+(random(s)-.5)*1.1,-4.5,4.5);s.rival.targetY=clamp(land.y+bl.vy/hv*.5+(random(s)-.5)*.8,-7.4,-1);}
  }
  else {s.rival.targetX=clamp(s.you.x*.22,-1.1,1.1);s.rival.targetY=s.you.y<3?-5.9:-4.7;}
 }
 move(s.rival,TENNIS.aiSpeed,dt);contain(s.rival,-7.5,-.9);
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
   s.message='Into the net…';s.version++;
  }else if(crossZ<nh+R*.95){ // kissed the tape — it can dribble over or fall back
   const pace=Math.abs(b.vy);b.y=0;b.z=nh+R;
   const over=random(s)<.52+Math.min(.2,pace*.015);
   b.vy=(over?-from:from)*(.35+random(s)*Math.min(1.7,pace*.28));
   b.vx*=.45;b.vz=.5+random(s)*1.2;b.wx*=.3;b.wy*=.3;b.wz*=.3;b.squash=.08;
   if(over){b.crossed=true;s.message='Off the tape… and over!';}else{b.netHit=true;s.message='Clipped the tape…';}
   s.version++;
  }else b.crossed=true;
 }
 if(s.queuedKick>0&&(s.queuedShot==='header'?canTennisHeader(s,'you'):s.queuedShot==='scissor'?canTennisScissor(s,'you'):canTennisKick(s,'you')||canTennisSlam(s,'you'))){kick(s,'you');return;}
 if(s.aiReaction<=0&&(canTennisKick(s,'rival')||(s.aiSlam&&canTennisSlam(s,'rival')))){kick(s,'rival');return;}
 if(b.z<=TENNIS.ballRadius&&b.vz<0){
  const outside=Math.abs(b.x)>TENNIS.halfWidth||Math.abs(b.y)>TENNIS.halfLength;
  if(outside){if(b.bounces>0)point(s,b.last,'it skipped away after the bounce');else point(s,other(b.last),'out of bounds');return;}
  if(!b.crossed){point(s,other(b.last),b.netHit?'the ball caught the net':'the return did not cross the net');return;}
  b.bounces++;if(b.bounces>1){point(s,b.last,'two bounces');return;}
  // energy-losing bounce: restitution up; friction across the ground converts spin —
  // topspin skids through low and quick, backspin checks up short
  const R=TENNIS.ballRadius,imp=-b.vz;b.z=R;b.vz=imp*TENNIS.restitution;
  const k=.5,pre=Math.hypot(b.vx,b.vy);
  b.vx-=k*(b.vx-b.wy*R);b.vy-=k*(b.vy+b.wx*R);
  const post=Math.hypot(b.vx,b.vy),cap=pre*.92+.2;
  if(post>cap){const f=cap/post;b.vx*=f;b.vy*=f;}
  b.wx*=.55;b.wy*=.55;b.wz*=.7;b.squash=Math.min(.16,.05+imp*.014);
  s.fxLand=.45;s.fxLandX=b.x;s.fxLandY=b.y;s.fxLandI=Math.min(1,.25+imp*.09);
  s.message='One bounce. Get close and kick it back.';s.version++;
 }
 if(Math.abs(b.x)>6.8||Math.abs(b.y)>10.5){if(b.bounces>0)point(s,b.last,'it skipped away after the bounce');else point(s,other(b.last),'out of bounds');}
}
export function tickTennis(s:TennisState,seconds:number){let remaining=Math.max(0,Math.min(.08,seconds));while(remaining>0){const dt=Math.min(remaining,1/120);step(s,dt);remaining-=dt;}}
export function tennisNeedsFrames(s:TennisState){return s.phase==='rally'||s.phase==='point'||s.fxSlam>0||s.fxLand>0||(s.phase==='serve'&&((s.you.direct&&Math.hypot(s.you.moveX,s.you.moveY)>.001)||s.server==='rival'||s.queuedKick>0||(!s.you.direct&&Math.hypot(s.you.targetX-s.you.x,s.you.targetY-s.you.y)>.006)||Math.hypot(s.you.vx,s.you.vy)>0||s.you.kick>0));}
