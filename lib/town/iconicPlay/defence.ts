/**
 * Defensive + goalkeeper iconic-play templates (save, penalty_save, sweeper_keeper, last_ditch_tackle, aerial_clearance).
 * Coordinates follow types.ts: the goal at the TOP (y = 0) is the goal the STAR DEFENDS; opponents ('opp') attack upward.
 * The star keeper is role 'star'; the star's own keeper in outfield plays is a 'mate'.
 *
 * Authoring rules kept by every template:
 * - Tracks are built from straight waypoint legs and densified (every ~0.2 s) so a spline-interpolating engine stays on the
 *   same path; a dribbled ball is sampled off the carrier's path so they never drift apart.
 * - Every contact (strike, save, tackle, header) has a keyframe for BOTH the ball and the player at the same t, with the
 *   player within reach of the ball, and the pose is timed to that keyframe.
 * - The ball moves continuously (no teleports), never enters the goal mouth, and no 'net' event is ever fired.
 * - Every play ends with everyone standing still for >= 1 s (the star celebrating).
 * - params.side = where the attack comes from (left = -x); params.dive = the direction the keeper dives (left = -x on screen).
 * - Scale: pitch ~10 units/m, court ~15 units/m; ball heights are in the same units on both fields (crossbar ~ 40).
 */
import type {Actor,BallKey,Field,Params,Play,PlayEvent,Pose,Role,Template,TemplateId,Track} from './types';

type Dims={court:boolean;hw:number;len:number;mouth:number;boxD:number;spot:number;k:number};
/** k scales pitch-authored run lengths/offsets down to the futsal court. */
const dims=(f:Field):Dims=>f==='court'?{court:true,hw:200,len:560,mouth:50,boxD:120,spot:90,k:.62}:{court:false,hw:340,len:900,mouth:75,boxD:165,spot:110,k:1};

/** Deterministic PRNG (mulberry32) salted per template so the same player always gets the same play. */
function rng(seed:number,salt:number){let a=((seed>>>0)^Math.imul(salt,0x9E3779B1))>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
type Rng=()=>number;
const R=(r:Rng,a:number,b:number)=>a+(b-a)*r();
const sideSign=(s:Params['side'],r:Rng)=>s==='left'?-1:s==='right'?1:s==='center'?0:(r()<.5?-1:1);
const diveSign=(d:Params['dive'],r:Rng)=>d==='left'?-1:d==='right'?1:(r()<.5?-1:1);
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const r2=(v:number)=>Math.round(v*100)/100;
type P2=[number,number];

/** Linear sample of [t,x,y,...] keys. */
function sample<K extends number[]>(keys:K[],t:number):K{
 if(t<=keys[0][0])return keys[0];const n=keys.length;if(t>=keys[n-1][0])return keys[n-1];
 let i=1;while(keys[i][0]<t)i++;const a=keys[i-1],b=keys[i],u=(t-a[0])/(b[0]-a[0]||1);
 return a.map((v,j)=>v+(b[j]-v)*u) as K;
}

/** A player: straight waypoint legs, densified on output. */
class Mover{
 wp:[number,number,number][];poses:{t:number;pose:Pose;hold?:number}[]=[];
 constructor(public id:string,public role:Role,x:number,y:number){this.wp=[[0,x,y]];}
 get end(){return this.wp[this.wp.length-1];}
 to(t:number,x:number,y:number){if(t<=this.end[0]+1e-6)throw new Error(`${this.id}: waypoint ${t} not after ${this.end[0]}`);this.wp.push([t,x,y]);return this;}
 stay(t:number){return t>this.end[0]+1e-6?this.to(t,this.end[1],this.end[2]):this;}
 pose(t:number,pose:Pose,hold?:number){this.poses.push({t:r2(t),pose,...(hold!==undefined?{hold:r2(hold)}:{})});return this;}
 at(t:number):P2{const s=sample(this.wp,t);return [s[1],s[2]];}
 /** unit direction of travel at t (fallback when standing). */
 dir(t:number,fb:P2=[0,-1]):P2{const a=this.at(t-.06),b=this.at(t+.06),dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);return l<1e-3?fb:[dx/l,dy/l];}
 actor(duration:number):Actor{
  this.stay(duration);const track:Track=[];
  for(let i=0;i<this.wp.length;i++){const [t,x,y]=this.wp[i];track.push([r2(t),r2(x),r2(y)]);
   const nx=this.wp[i+1];if(!nx)break;const moving=nx[1]!==x||nx[2]!==y,steps=moving?Math.floor((nx[0]-t)/.2):0;
   for(let s=1;s<steps;s++){const tt=t+(nx[0]-t)*s/steps,p=this.at(tt);track.push([r2(tt),r2(p[0]),r2(p[1])]);}}
  const poses=this.poses.slice().sort((a,b)=>a.t-b.t);
  return {id:this.id,role:this.role,track,...(poses.length?{poses}:{})};
 }
}

/** The ball: every key continues from the previous one. */
class Ball{
 k:BallKey[];
 constructor(x:number,y:number,h=0){this.k=[[0,x,y,h]];}
 get end(){return this.k[this.k.length-1];}
 push(t:number,x:number,y:number,h:number){if(t<=this.end[0]+1e-6)return;this.k.push([t,x,y,Math.max(0,h)]);}
 stay(t:number){const e=this.end;this.push(t,e[1],e[2],e[3]);return this;}
 at(t:number):[number,number,number]{const s=sample(this.k,t);return [s[1],s[2],s[3]];}
 /** At the carrier's feet, `lead` units ahead in the direction of travel, from the current end time to t1. */
 follow(m:Mover,t1:number,lead:number,fb:P2=[0,-1]){
  const t0=this.end[0],n=Math.max(1,Math.ceil((t1-t0)/.16));
  for(let i=1;i<=n;i++){const t=t0+(t1-t0)*i/n,p=m.at(t),d=m.dir(t,fb);this.push(t,p[0]+d[0]*lead,p[1]+d[1]*lead,0);}
  return this;
 }
 /** Flight to (x,y,h) arriving at t1. xy: 'lin' constant speed or 'out' decelerating roll. h: blend of end heights + arc. */
 fly(t1:number,x:number,y:number,h:number,peak=0,ease:'lin'|'out'='lin',n=0){
  const [t0,x0,y0,h0]=this.end,steps=n||Math.max(2,Math.ceil((t1-t0)/.1));
  const bump=peak>0?Math.max(0,peak-(h0+h)/2):0;
  for(let i=1;i<=steps;i++){const u=i/steps,e=ease==='out'?1-(1-u)*(1-u):u;
   this.push(t0+(t1-t0)*u,x0+(x-x0)*e,y0+(y-y0)*e,h0+(h-h0)*u+4*bump*u*(1-u));}
  return this;
 }
 keys():BallKey[]{return this.k.map(([t,x,y,h])=>[r2(t),r2(x),r2(y),r2(h)] as BallKey);}
}

const ev=(t:number,kind:PlayEvent['kind'],x:number,y:number,dir?:number):PlayEvent=>({t:r2(t),kind,x:r2(x),y:r2(y),...(dir!==undefined?{dir:r2(dir)}:{})});
const angle=(a:P2,b:P2)=>Math.atan2(b[1]-a[1],b[0]-a[0]);
const diveOf=(dv:number):Pose=>dv<0?'dive-left':'dive-right';

function build(field:Field,duration:number,movers:Mover[],ball:Ball,events:PlayEvent[],lane?:{from:number;to:number}):Play{
 duration=r2(clamp(duration,5.5,8));ball.stay(duration);
 for(const m of movers)for(const p of m.poses)if(p.pose==='celebrate')p.hold=r2(duration-p.t);
 return {duration,field,actors:movers.map(m=>m.actor(duration)),ball:ball.keys(),events:events.sort((a,b)=>a.t-b.t),...(lane?{lane:{from:r2(lane.from),to:r2(lane.to)}}:{})};
}

/** Where a ball parried at (cx,cy) must go so it crosses the goal line (y=0) outside the post on side dv, ending at y=endY<0. */
function parryOut(D:Dims,dv:number,cx:number,cy:number,endY:number,margin:number):P2{
 const u0=cy/(cy-endY),cross=dv*(D.mouth+margin);
 return [clamp(cx+(cross-cx)/u0,-D.hw+10,D.hw-10),endY];
}

/* ───────────────────────── save: a hard shot, the keeper dives and palms it wide ───────────────────────── */
const save:Template=(p,seed,field)=>{
 const D=dims(field),c=D.court,k=D.k,r=rng(seed,101),s=sideSign(p.side,r),dv=diveSign(p.dive,r);
 const dist=p.distance??(['box','edge','long'] as const)[Math.floor(r()*3)];
 const shotY=c?{box:105,edge:145,long:195}[dist]:{box:150,edge:205,long:285}[dist];
 const shotX=s===0?R(r,-18,18):s*R(r,45,85)*k;
 const inward=s===0?(r()<.5?-1:1):s;
 const start:P2=[shotX+inward*R(r,35,70)*k,shotY+R(r,170,200)*k];
 const tShot=R(r,2.3,2.7),lead=c?7:9;
 // Shooter: drives at goal, cuts in a touch, strikes on the run, follows through.
 const opp=new Mover('striker','opp',...start);
 opp.to(tShot*.55,(start[0]+shotX)/2+inward*12*k,(start[1]+shotY)/2).to(tShot,shotX,shotY);
 const B0:P2=[shotX+opp.dir(tShot)[0]*lead,shotY+opp.dir(tShot)[1]*lead];
 opp.to(tShot+.4,shotX+opp.dir(tShot)[0]*16*k,shotY-18*k).pose(tShot-.06,'kick',.36);
 // A beaten defender trails the run and lunges too late.
 const def=new Mover('defender','mate',start[0]-inward*30*k,start[1]+40*k);
 def.to(tShot-.2,shotX-inward*20*k,shotY+30*k).to(tShot+.25,shotX-inward*10*k,shotY+10*k).pose(tShot-.2,'slide',.55).stay(tShot+1.2);
 const ball=new Ball(start[0],start[1]-lead);ball.follow(opp,tShot,lead);ball.k[ball.k.length-1]=[tShot,B0[0],B0[1],0];
 // The shot: aimed inside the post on the dive side; contact where the line meets the keeper's reach.
 const gx=dv*D.mouth*R(r,.55,.72),high=!c&&r()<.55,th=c?R(r,4,12):high?R(r,26,35):R(r,7,14);
 const cy=c?22:10,u=(B0[1]-cy)/B0[1],cx=B0[0]+(gx-B0[0])*u,ch=3+(th-3)*u;
 const tc=tShot+Math.hypot(cx-B0[0],cy-B0[1])/(c?300:340);
 ball.fly(tc,cx,cy,ch,0,'lin',3);
 // Keeper: mirrors the ball on the angle, sets (still) before the strike, dives to the ball.
 const setD=c?26:16,norm=(q:P2):P2=>{const l=Math.hypot(q[0],q[1])||1;return [q[0]/l*setD,q[1]/l*setD];};
 const gk=new Mover('keeper','star',0,c?8:6);
 for(let t=.5;t<tShot-.4;t+=.5){const q=norm(ball.at(t) as unknown as P2);gk.to(t,q[0],q[1]);}
 const K0=norm(B0);gk.to(tShot-.32,K0[0],K0[1]).stay(tShot+.04);
 gk.to(tc,cx-dv*11,cy+3).to(tc+.22,cx-dv*1,cy+5).pose(tShot+.04,diveOf(dv),tc-tShot+.75);
 // Parry: pushed wide past the post (low) or tipped up and over the bar (high), out for a corner.
 const [ex,ey]=parryOut(D,dv,cx,cy,c?-12:-15,c?14:16),tOut=tc+(high?.85:.6);
 ball.fly(tOut,ex,ey,0,high?70:ch*.5+6,'lin').fly(tOut+.35,ex+dv*14*k,ey-6,0,high?6:0,'out');
 const tUp=tc+.95,tCel=tUp+.5;
 gk.stay(tUp).to(tCel,cx*.45,c?30:22).pose(tCel,'celebrate');
 opp.stay(tc+.6);
 const events=[ev(tShot,'speed',B0[0],B0[1],angle(B0,[gx,0])),ev(tc,'burst',cx,cy)];
 return build(field,Math.max(tCel+1.4,ball.end[0]+1,R(r,5.7,6.2)),[gk,opp,def],ball,events);
};

/* ───────────────────────── penalty_save: run-up, strike, the keeper guesses right ───────────────────────── */
const penalty_save:Template=(p,seed,field)=>{
 const D=dims(field),c=D.court,k=D.k,r=rng(seed,202),dv=diveSign(p.dive,r);
 const runSide=p.foot==='right'?-1:p.foot==='left'?1:(()=>{const s=sideSign(p.side,r);return s===0?(r()<.5?-1:1):s;})();
 const S:P2=[0,D.spot],tRun=R(r,1.2,1.45),tKick=tRun+R(r,1.15,1.35);
 const taker=new Mover('taker','opp',runSide*R(r,24,38)*k,S[1]+R(r,62,74)*k);
 taker.stay(tRun).to(tKick-.45,runSide*16*k,S[1]+28*k).to(tKick,runSide*6,S[1]+8).pose(tKick-.06,'kick',.36);
 taker.to(tKick+.4,runSide*2,S[1]-14*k);
 // Keeper on the line: bounces to put the taker off, dives the right way at the strike.
 const gk=new Mover('keeper','star',0,4);
 for(let t=.45,i=0;t<tKick-.12;t+=.38,i++)gk.to(t,(i%2?5:-5)*k,4);
 gk.to(tKick,0,4);
 const gx=dv*D.mouth*R(r,.6,.78),th=c?R(r,5,16):R(r,8,26),cy=6,u=(S[1]-cy)/S[1],cx=gx*u,ch=2+(th-2)*u;
 const tc=tKick+Math.hypot(cx,S[1]-cy)/(c?300:330);
 gk.to(tc,cx-dv*11,cy+3).to(tc+.2,cx-dv,cy+4).pose(tKick,diveOf(dv),tc-tKick+.8);
 const ball=new Ball(S[0],S[1]);ball.stay(tKick).fly(tc,cx,cy,ch,0,'lin',3);
 const [ex,ey]=parryOut(D,dv,cx,cy,c?-12:-16,c?14:18),tOut=tc+.6;
 ball.fly(tOut,ex,ey,0,ch*.6+10).fly(tOut+.35,ex+dv*12*k,ey-5,0,0,'out');
 // Players waiting outside the box follow in, too late for any rebound.
 const edgeY=c?170:D.boxD+14;
 const mate=new Mover('mate','mate',-runSide*55*k,edgeY),rival=new Mover('rival','opp',runSide*62*k,edgeY+4);
 mate.stay(tKick).to(tKick+1,-runSide*40*k,edgeY-50*k);rival.stay(tKick).to(tKick+1,runSide*45*k,edgeY-46*k);
 const tUp=tc+.85,tCel=tUp+.55;gk.stay(tUp).to(tCel,dv*14*k,c?30:26).pose(tCel,'celebrate');
 const events=[ev(.5,'whistle',S[0],S[1]),ev(tKick,'speed',S[0],S[1],angle(S,[gx,0])),ev(tc,'burst',cx,cy)];
 return build(field,Math.max(tCel+1.4,ball.end[0]+1,R(r,5.8,6.4)),[gk,taker,mate,rival],ball,events);
};

/* ───────────────────────── sweeper_keeper: ball in behind, the keeper races out and wins it ───────────────────────── */
const sweeper_keeper:Template=(p,seed,field)=>{
 const D=dims(field),c=D.court,k=D.k,r=rng(seed,303),s=sideSign(p.side,r),sw=s===0?(r()<.5?-1:1):s;
 const lineY=c?205:300,lx=s===0?R(r,-20,20)*k:s*R(r,40,80)*k;
 const I:P2=[lx*.85,c?150:215];                // beyond the box (pitch 165) / area (court 120)
 const P:P2=[-sw*R(r,40,90)*k,c?370:520],tPass=R(r,.85,1.05),variant=r()<.5?'kick':'slide';
 const passer=new Mover('passer','opp',P[0],P[1]+30*k);passer.to(tPass,P[0],P[1]).pose(tPass-.06,'kick',.36).to(tPass+.6,P[0],P[1]-20*k);
 const ball=new Ball(P[0],P[1]+30*k-9);ball.follow(passer,tPass,9);
 const B0=ball.at(tPass);let tc:number;
 if(c){tc=tPass+1.2;ball.fly(tc,I[0],I[1],0,0,'out');}           // futsal: a ground pass split between the two defenders
 else{const L:P2=[lx,I[1]+47],L2:P2=[(L[0]+I[0])/2,(L[1]+I[1])/2+8];  // pitch: lofted over the high line, bounces, rolls on
  ball.fly(tPass+1.1,L[0],L[1],0,70).fly(tPass+1.4,L2[0],L2[1],0,10,'lin',3);tc=tPass+1.7;ball.fly(tc,I[0],I[1],0,0,'out',3);}
 // Keeper starts high (a sweeper-keeper) and sprints out the moment the pass is hit.
 const gk=new Mover('keeper','star',0,c?34:62),go=tPass+.12;gk.stay(go);
 const striker=new Mover('striker','opp',lx+sw*R(r,55,75)*k,lineY+14);
 striker.stay(tPass).to(tc,I[0]+sw*14*k,I[1]+24*k);
 const cb1=new Mover('cb1','mate',clamp(lx*.3-75*k,-D.hw+30,D.hw-30),lineY-6),cb2=new Mover('cb2','mate',clamp(lx*.3+75*k,-D.hw+30,D.hw-30),lineY);
 for(const cb of[cb1,cb2]){cb.to(tPass,cb.end[1],cb.end[2]-8*k).to(tc+.6,(cb.end[1]+I[0])/2,I[1]+75*k);}
 const out=I[0]===0?sw:Math.sign(I[0]);let tEnd:number,tCel:number;
 if(variant==='kick'){
  gk.to(tc,I[0],I[1]-9).pose(tc-.08,'kick',.34);
  const C:P2=[out*(D.hw-60*k),I[1]+(c?250:400)];tEnd=tc+(c?1.1:1.35);
  ball.fly(tEnd,C[0],C[1],0,c?55:90).fly(tEnd+.4,C[0]+out*10,C[1]+25*k,0,6,'out');
  striker.to(tc+.45,I[0]+sw*18*k,I[1]+6*k);            // pulls up
  tCel=tc+.7;gk.to(tCel,I[0],I[1]-14).pose(tCel,'celebrate');
 }else{
  gk.to(tc-.28,I[0]-sw*4,I[1]-34*k).to(tc,I[0]-sw*2,I[1]-7).to(tc+.25,I[0],I[1]+6).pose(tc-.28,'slide',.75);
  tEnd=tc+1;ball.fly(tEnd,out*(D.hw+6),I[1]+R(r,30,70)*k,0,0,'out');   // swept off his toes, out for a throw
  striker.to(tc+.5,I[0]+sw*6*k,I[1]-16*k).pose(tc+.1,'fall',.9);
  tCel=tc+1.05;gk.stay(tc+.8).to(tCel,I[0],I[1]+2).pose(tCel,'celebrate');
 }
 const events=[ev(tPass,'speed',B0[0],B0[1],angle([B0[0],B0[1]],I)),ev(go,'speed',0,c?34:62,Math.PI/2),ev(tc,'burst',I[0],I[1])];
 return build(field,Math.max(tCel+1.4,ball.end[0]+1,R(r,5.8,6.3)),[gk,striker,passer,cb1,cb2],ball,events);
};

/* ───────────────────────── last_ditch_tackle: recovery sprint and a clean sliding tackle ───────────────────────── */
const last_ditch_tackle:Template=(p,seed,field)=>{
 const D=dims(field),c=D.court,k=D.k,r=rng(seed,404),s=sideSign(p.side,r);
 const Lx=s===0?R(r,-30,30)*k:s*R(r,90,130)*k,cs=s===0?(r()<.5?-1:1):s;   // the star comes from the inside (-cs side)
 const tc=c?R(r,2.7,3):R(r,3,3.35),lead=c?8:10,fy=c?140:205;
 const striker=new Mover('striker','opp',Lx+cs*20*k,c?390:520);
 striker.to(tc*.45,Lx+cs*8*k,(striker.end[2]+fy)/2+30*k).to(tc,Lx*.78,fy+lead);
 const ball=new Ball(Lx+cs*20*k,(c?390:520)-lead);
 ball.follow(striker,tc,lead);const T=ball.at(tc);
 // Star: recovery run from behind and inside, level by the edge of the box, then the slide across the ball.
 const star=new Mover('star','star',Lx-cs*80*k,(c?390:520)+45*k);
 const mid=striker.at(tc-1);star.to(tc-1,mid[0]-cs*45*k,mid[1]+18*k);
 star.to(tc-.3,T[0]-cs*38*k,T[1]+10*k).to(tc,T[0]-cs*9,T[1]-3).to(tc+.3,T[0]+cs*6,T[1]-12).pose(tc-.3,'slide',.8);
 // The ball squirts out towards the touchline and away from goal; the striker tumbles over the slide.
 const tEnd=tc+1.1;ball.fly(tEnd,clamp(T[0]+cs*R(r,110,160)*k,-D.hw-6,D.hw+6),T[1]+R(r,50,90)*k,0,6,'out');
 striker.to(tc+.45,T[0]+cs*4,T[1]-20*k).pose(tc+.06,'fall',1);
 const keeper=new Mover('keeper','mate',0,12);keeper.to(tc,T[0]*.2,c?30:38).to(tc+1,T[0]*.1,24);
 const sx=clamp(Lx-cs*200*k,-D.hw+30,D.hw-30),sup=new Mover('support','opp',sx,(c?420:600));sup.to(tc,clamp(Lx-cs*140*k,-D.hw+30,D.hw-30),fy+80*k).to(tc+.8,clamp(Lx-cs*130*k,-D.hw+30,D.hw-30),fy+60*k);
 const tCel=tc+1.05;star.stay(tc+.8).to(tCel,T[0]+cs*10,T[1]-8).pose(tCel,'celebrate');
 const events=[ev(.45,'speed',star.at(.45)[0],star.at(.45)[1],angle(star.at(.3),star.at(.6))),ev(tc,'burst',T[0],T[1])];
 return build(field,Math.max(tCel+1.4,tEnd+1,R(r,5.8,6.4)),[star,striker,keeper,sup],ball,events);
};

/* ───────────────────────── aerial_clearance: rise above the striker, head it high and away ───────────────────────── */
const aerial_clearance:Template=(p,seed,field)=>{
 const D=dims(field),c=D.court,k=D.k,r=rng(seed,505),s=sideSign(p.side,r),sw=s===0?(r()<.5?-1:1):s;
 const H:P2=c?[-sw*R(r,5,25),R(r,55,70)]:[-sw*R(r,5,35),R(r,80,100)],hH=R(r,34,40),tCross=R(r,1.1,1.4);
 // Delivery: a cross from the wing (side left/right) or a long ball from deep (center).
 const crosser=s===0?new Mover('crosser','opp',R(r,-40,40)*k,c?410:600):new Mover('crosser','opp',s*(c?165:285),c?240:340);
 const X:P2=s===0?[crosser.end[1]*.9,c?370:540]:[s*(c?178:302),c?170:245];
 crosser.to(tCross,...X).pose(tCross-.06,'kick',.36).to(tCross+.5,X[0],X[1]-14*k);
 const ball=new Ball(crosser.wp[0][1],crosser.wp[0][2]-9);ball.follow(crosser,tCross,9);
 const B0=ball.at(tCross),tc=tCross+Math.hypot(H[0]-B0[0],H[1]-B0[1])/(c?200:235);
 ball.fly(tc,H[0],H[1],hH,c?R(r,70,90):R(r,95,120));
 // Striker attacks the ball from deeper; the star is goal-side, reads it and gets up first.
 const striker=new Mover('striker','opp',H[0]-sw*40*k,H[1]+110*k);
 striker.to(tc-.3,H[0]+sw*6,H[1]+30*k).to(tc,H[0]+sw*7,H[1]+16).pose(tc-.25,'jump',.5).to(tc+.35,H[0]+sw*8,H[1]+12);
 const star=new Mover('star','star',H[0]-sw*20*k,H[1]+60*k);
 star.to(tc-.35,H[0],H[1]+18).to(tc,H[0],H[1]+2).pose(tc-.33,'jump',.3).pose(tc-.03,'head',.35).to(tc+.3,H[0],H[1]-4);
 // Header: high and away upfield, back towards the side it came from.
 const C:P2=[clamp(sw*R(r,120,190)*k,-D.hw+30,D.hw-30),H[1]+(c?R(r,200,240):R(r,300,360))],tLand=tc+(c?1.2:1.5);
 ball.fly(tLand,C[0],C[1],0,c?R(r,80,100):R(r,110,140));
 const dx=C[0]-H[0],dy=C[1]-H[1],dl=Math.hypot(dx,dy);ball.fly(tLand+.45,C[0]+dx/dl*25*k,C[1]+dy/dl*25*k,0,8,'out');
 const keeper=new Mover('keeper','mate',0,10);keeper.to(tCross,sw*14*k,12).stay(tc+.3).to(tc+1,0,14);
 const far=new Mover('far','opp',-sw*70*k,H[1]+70*k),farMate=new Mover('farMate','mate',-sw*60*k,H[1]+40*k);
 far.to(tc,-sw*55*k,c?40:45);farMate.to(tc,-sw*48*k,c?32:36);
 const tCel=tc+1;star.stay(tc+.6).to(tCel,H[0],H[1]).pose(tCel,'celebrate');
 const events=[ev(tCross,'speed',B0[0],B0[1],angle([B0[0],B0[1]],H)),ev(tc,'burst',H[0],H[1])];
 return build(field,Math.max(tCel+1.4,ball.end[0]+1,R(r,5.8,6.3)),[star,striker,crosser,keeper,far,farMate],ball,events,{from:tc,to:tLand});
};

export const DEFENCE_TEMPLATES:Partial<Record<TemplateId,Template>>={save,penalty_save,sweeper_keeper,last_ditch_tackle,aerial_clearance};
