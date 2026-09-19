/** Original, simplified arcade soccer tennis: singles, feet only, one bounce,
 * one return per side and first to seven. Not competition futnet rules.
 * The ball flies a real projectile path: gravity, quadratic air drag and Magnus
 * lift/curve from spin. Bounces lose energy through restitution + ground
 * friction (spin converts to roll), and the net tape is a live object — a ball
 * can thud into the mesh, clip the tape and dribble over, or fall back. */
export type TennisSide='you'|'rival';
export type TennisPhase='ready'|'serve'|'rally'|'point'|'over';
/** shot intents: auto picks drive/loop from contact; drop = soft short ball, lob = high & deep,
 * drive = flat topspin, slam = overhead spike (only available on a HIGH incoming ball) */
export type TennisShot='auto'|'drive'|'drop'|'lob'|'slam';
/** kickStyle drives the animation: 0 = soft tap, 1 = full swing, 2 = jumping slam */
export interface TennisPlayer{x:number;y:number;vx:number;vy:number;targetX:number;targetY:number;kick:number;stride:number;kickStyle:number;}
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
}
export const TENNIS={halfWidth:5,halfLength:8,netHeight:1.1,ballRadius:.17,gravity:10.5,winningScore:7,humanSpeed:7.3,aiSpeed:4.1,drag:.018,magnus:.012,restitution:.68};
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const other=(s:TennisSide):TennisSide=>s==='you'?'rival':'you';
const player=(y:number):TennisPlayer=>({x:0,y,vx:0,vy:0,targetX:0,targetY:y,kick:0,stride:0,kickStyle:1});
const mkball=(x:number,y:number,last:TennisSide):TennisBall=>({x,y,z:.23,vx:0,vy:0,vz:0,wx:0,wy:0,wz:0,rot:0,squash:0,netHit:false,last,bounces:0,crossed:false});
export function createTennis(seed=47):TennisState{return {phase:'ready',you:player(5.3),rival:player(-5.3),ball:mkball(.3,4.95,'you'),score:{you:0,rival:0},server:'you',rally:0,bestRally:0,message:'A little court. A good rally.',version:0,clock:0,phaseTime:0,queuedKick:0,aim:null,aiThink:0,aiReaction:0,seed:seed>>>0,winner:null,
 queuedShot:'auto',lastShot:'auto',lastKicker:'you',kickCount:0,aiSlam:false,fxSlam:0,fxSlamX:0,fxSlamY:0,fxSlamZ:0,fxLand:0,fxLandX:0,fxLandY:0,fxLandI:0};}
export function resetTennis(s:TennisState){Object.assign(s,createTennis(s.seed));}
function random(s:TennisState){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
export function beginTennis(s:TennisState){s.phase='serve';s.phaseTime=0;s.message='Your serve. Tap Serve when you’re ready.';s.version++;}
export function setTennisTarget(s:TennisState,x:number,y:number){s.you.targetX=clamp(x,-4.55,4.55);s.you.targetY=clamp(y,.95,7.45);}
export function requestTennisKick(s:TennisState,aim?:number,shot:TennisShot='auto'){if(s.phase!=='rally'&&!(s.phase==='serve'&&s.server==='you'))return;s.queuedKick=.8;s.queuedShot=shot;s.aim=aim===undefined?null:clamp(aim,-1,1);}
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
  if(netZ===null&&((oy<0&&c.y>=0)||(oy>0&&c.y<=0)))netZ=c.z;
  if(c.z<=R&&c.vz<0)break;
 }
 return {x:c.x,y:c.y,time:t,netZ};
}
export function tennisLanding(s:TennisState){const f=flight(s.ball);return {x:f.x,y:f.y,time:f.time};}
export function canTennisKick(s:TennisState,side:TennisSide){if(s.phase!=='rally'||s.ball.last===side||!s.ball.crossed)return false;const p=s[side],b=s.ball;return (side==='you'?b.y>.15:b.y<-.15)&&b.z<1.05&&Math.hypot(p.x-b.x,p.y-b.y)<1.3;}
/** the overhead window: an incoming ball hanging HIGH within reach (near/after its apex) —
 * kicking now is a SLAM. Kept tight so it rewards reading a lob, not every loopy return. */
export function canTennisSlam(s:TennisState,side:TennisSide){if(s.phase!=='rally'||s.ball.last===side||!s.ball.crossed)return false;const p=s[side],b=s.ball;return (side==='you'?b.y>.15:b.y<-.15)&&b.z>=1.15&&b.z<2.25&&b.vz<.4&&Math.hypot(p.x-b.x,p.y-b.y)<1.35;}
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
 const high=!serve&&b.z>=1.05;
 // shot selection: your queued intent (auto/drive upgrade to a SLAM on a high ball);
 // the rival mostly drives, lobs sometimes, drops when you camp deep — and spikes high balls
 let shot:TennisShot=serve?'auto':s.queuedShot;
 if(side==='rival'&&!serve){
  if(high)shot='slam';
  else{const r=random(s);shot=r<.7?'auto':r<.9?'lob':'drop';if(s.you.y>5.7&&random(s)<.45)shot='drop';}
 }
 if(high&&(shot==='auto'||shot==='drive'))shot='slam';
 if(shot==='slam'&&!high)shot='auto';
 // contact quality: planted next to the ball = clean; lunging at full stretch = scrappy.
 // An overhead slam punishes stretching hardest, and long rallies pile on pressure.
 const reach=Math.hypot(p.x-b.x,p.y-b.y),pace=Math.hypot(p.vx,p.vy);
 const pressure=Math.min(.34,s.rally*(side==='you'?.015:.032));
 let q=serve?.88+random(s)*.1
  :shot==='slam'?clamp(1.2-reach*.85-pace*.07-pressure,.2,1)
  :clamp(1.18-reach*.6-pace*.05-Math.max(0,b.z-.75)*.4-pressure,.22,1);
 if(side==='rival')q=Math.min(q,.58+random(s)*.42); // the rival mixes sharp days and scrappy ones
 const err=(1-q)*(shot==='slam'?3:2.2);
 let tx=side==='you'
  ?(s.aim===null?clamp((s.rival.x>0?-3.25:3.25)+(random(s)-.5)*.9,-4,4):s.aim*3.7)
  :clamp(-s.you.x*.8+(random(s)-.5)*1.6,-3.6,3.6);
 let ty=sign*(shot==='drop'?1.5+random(s)*1.1:shot==='lob'?5.7+random(s)*1.9:shot==='slam'?2.6+q*2.1+random(s)*1.4:4.3+random(s)*1.7);
 if(shot==='drop')tx*=.7; // soft balls stay honest, near the middle of the front court
 tx=clamp(tx+(random(s)-.5)*err*2.4,-5.6,5.6);
 ty=ty+(random(s)-.5)*err*2.2;ty=sign<0?clamp(ty,side==='you'?-8.6:-7.9,shot==='drop'?-1.1:-1.4):clamp(ty,shot==='drop'?1.1:1.4,side==='rival'?7.9:8.6);
 const dist=Math.max(.5,Math.hypot(tx-b.x,ty-b.y)),dx=(tx-b.x)/dist,dy=(ty-b.y)/dist;
 // shot shape: drops float with backspin and die, lobs sail high & deep, slams hammer DOWN
 // from the contact height, drives skim flat with heavy topspin, loops are the safe default
 const drive=shot==='drive'||(shot==='auto'&&!serve&&q>.62&&random(s)<.7);
 let T:number,clear:number,ts:number;
 if(shot==='slam'){T=clamp(Math.sqrt(2*Math.max(.25,b.z-.25)/TENNIS.gravity)+dist*.012,.34,.72);clear=.16+q*.12;ts=15+q*10;} // clear stays ABOVE the tape-clip band
 else if(shot==='drop'){T=1+dist*.075;clear=.24+q*.22;ts=-(2.5+q*3.5);}
 else if(shot==='lob'){T=1.45+dist*.06;clear=1.05+q*.75;ts=2+q*2.5;}
 else if(drive){T=.85+dist*.042;clear=.06+q*.12;ts=11+q*8;}
 else{T=1.22+dist*.052+(1-q)*.25;clear=.2+q*.25;ts=4+q*5;}
 const ss=(random(s)-.5)*(1-q)*22+(random(s)-.5)*4;  // sidespin: wild contacts slice and hook
 b.wx=-ts*dy;b.wy=ts*dx;b.wz=ss;
 b.z=clamp(b.z,.17,shot==='slam'?2.1:1.05);
 solve(b,tx,ty,T,clear,drive||shot==='slam');
 // contact noise — a stretched toe-poke (or wild spike) flies with a mind of its own
 const n=(1-q)*(shot==='slam'?1.3:1);
 b.vx+=(random(s)-.5)*n*2.4;b.vy+=(random(s)-.5)*n*2.2;b.vz+=(random(s)-.65)*n*2;
 b.last=side;b.bounces=0;b.crossed=false;b.netHit=false;
 p.kick=.34;p.kickStyle=shot==='slam'?2:shot==='drop'?0:1;
 s.lastShot=shot==='auto'?(drive?'drive':'auto'):shot;s.lastKicker=side;s.kickCount++;
 if(shot==='slam'){s.fxSlam=.42;s.fxSlamX=b.x;s.fxSlamY=b.y;s.fxSlamZ=b.z;}
 s.rally++;s.bestRally=Math.max(s.bestRally,s.rally);s.phase='rally';s.queuedKick=0;s.queuedShot='auto';
 // a slam travels ~half a second — the rival gets a hurried (imperfect) chance to dig it out;
 // and the rival only WANTS to spike some of your returns (decided here, per kick)
 s.aiReaction=shot==='slam'&&side==='you'?.16+random(s)*.2:.3+random(s)*.24;s.aiThink=0;
 if(side==='you')s.aiSlam=random(s)<.45;
 s.message=s.rally===1?'Over the net. Get ready for the return.'
  :side==='you'?(
   shot==='slam'?(q>.55?'SLAM! Hammered down the other side.':'A wild spike — anything can happen.')
   :shot==='drop'?'A soft touch, floating just past the tape.'
   :shot==='lob'?'Up and over — deep toward the back line.'
   :q>.75?'Clean contact. Find your next position.':q>.45?'Across it goes. Find your next position.':'A stretched touch — recover quickly!')
  :(shot==='slam'?'The rival SPIKES it — dig it out!'
   :shot==='drop'?'A sneaky drop ball — sprint in!'
   :shot==='lob'?'A high lob floats deep. Get under it.'
   :q>.68?'Watch the shadow. Move close, then kick.':'A scrappy return floats over. Attack it.');
 s.version++;
}
function point(s:TennisState,winner:TennisSide,reason:string){s.score[winner]++;s.phaseTime=0;s.queuedKick=0;const b=s.ball;b.vx=b.vy=b.vz=0;b.wx=b.wy=b.wz=0;b.squash=0;s.you.vx=s.you.vy=s.rival.vx=s.rival.vy=0;s.you.targetX=s.you.x;s.you.targetY=s.you.y;s.rival.targetX=s.rival.x;s.rival.targetY=s.rival.y;
 s.message=`${winner==='you'?'Your point':'Rival’s point'} · ${reason}`;s.phase='point';s.version++;
 if(s.score[winner]>=TENNIS.winningScore){s.winner=winner;s.phase='over';s.message=winner==='you'?'The court is yours. Play another?':'Good game. Ready for a rematch?';}}
function nextServe(s:TennisState){s.server=(s.score.you+s.score.rival)%2?'rival':'you';s.you=player(5.3);s.rival=player(-5.3);const p=s[s.server];s.ball=mkball(p.x+.3,p.y+(s.server==='you'?-.35:.35),s.server);s.rally=0;s.phase='serve';s.phaseTime=0;s.message=s.server==='you'?'Your serve. Take your time.':'Rival serving. Find a comfortable position.';s.version++;}
function move(p:TennisPlayer,speed:number,dt:number){const dx=p.targetX-p.x,dy=p.targetY-p.y,d=Math.hypot(dx,dy),v=Math.min(speed,d/Math.max(dt,.001)),blend=1-Math.exp(-14*dt);p.vx+=(d>.03?dx/d*v-p.vx:-p.vx)*blend;p.vy+=(d>.03?dy/d*v-p.vy:-p.vy)*blend;p.x+=p.vx*dt;p.y+=p.vy*dt;p.stride+=Math.hypot(p.vx,p.vy)*dt*2.4;p.kick=Math.max(0,p.kick-dt);}
function step(s:TennisState,dt:number){
 s.clock+=dt;s.phaseTime+=dt;s.queuedKick=Math.max(0,s.queuedKick-dt);s.aiReaction=Math.max(0,s.aiReaction-dt);
 s.fxSlam=Math.max(0,s.fxSlam-dt);s.fxLand=Math.max(0,s.fxLand-dt);
 if(s.phase==='ready'||s.phase==='over')return;
 if(s.phase==='point'){s.ball.squash=Math.max(0,s.ball.squash-dt*2.2);if(s.phaseTime>1.55)nextServe(s);return;}
 move(s.you,TENNIS.humanSpeed,dt);s.you.x=clamp(s.you.x,-4.6,4.6);s.you.y=clamp(s.you.y,.9,7.5);
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
  else {s.rival.targetX*=.92;s.rival.targetY=-5.6;}
 }
 move(s.rival,TENNIS.aiSpeed,dt);s.rival.x=clamp(s.rival.x,-4.6,4.6);s.rival.y=clamp(s.rival.y,-7.5,-.9);
 const b=s.ball,oldY=b.y,a=accel(b);
 b.vx+=a.ax*dt;b.vy+=a.ay*dt;b.vz+=a.az*dt;
 b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;
 const dec=Math.max(0,1-.3*dt);b.wx*=dec;b.wy*=dec;b.wz*=dec;
 const hs=Math.hypot(b.vx,b.vy),dir=Math.abs(b.vx)>Math.abs(b.vy)*.6?(b.vx>=0?1:-1):(b.vy>=0?1:-1);
 b.rot+=dir*(hs*1.6+Math.abs(b.wx)*.18)*dt;b.squash=Math.max(0,b.squash-dt*2.2);
 if((oldY<0&&b.y>=0)||(oldY>0&&b.y<=0)){
  const nh=TENNIS.netHeight,R=TENNIS.ballRadius,from=oldY<0?-1:1;
  if(b.z<nh-R*.5){ // thudded into the mesh — the net swallows it
   b.y=from*.12;b.vy*=-.14;b.vx*=.3;b.vz=Math.min(b.vz,0)*.3-.4;b.wx*=.2;b.wy*=.2;b.wz*=.2;b.netHit=true;b.squash=.1;
   s.message='Into the net…';s.version++;
  }else if(b.z<nh+R*.95){ // kissed the tape — it can dribble over or fall back
   const pace=Math.abs(b.vy);b.y=0;b.z=nh+R;
   const over=random(s)<.52+Math.min(.2,pace*.015);
   b.vy=(over?-from:from)*(.35+random(s)*Math.min(1.7,pace*.28));
   b.vx*=.45;b.vz=.5+random(s)*1.2;b.wx*=.3;b.wy*=.3;b.wz*=.3;b.squash=.08;
   if(over){b.crossed=true;s.message='Off the tape… and over!';}else{b.netHit=true;s.message='Clipped the tape…';}
   s.version++;
  }else b.crossed=true;
 }
 if(s.queuedKick>0&&(canTennisKick(s,'you')||canTennisSlam(s,'you'))){kick(s,'you');return;}
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
export function tennisNeedsFrames(s:TennisState){return s.phase==='rally'||s.phase==='point'||s.fxSlam>0||s.fxLand>0||(s.phase==='serve'&&(s.server==='rival'||s.queuedKick>0||Math.hypot(s.you.targetX-s.you.x,s.you.targetY-s.you.y)>.035||Math.hypot(s.you.vx,s.you.vy)>.03||s.you.kick>0));}
