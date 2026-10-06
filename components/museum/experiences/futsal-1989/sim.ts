/**
 * futsal-1989 "Count the touches": a tiny top-down match model, in metres and seconds, with no DOM so a Node test can run it.
 * The same rules, player speeds and ball run on a futsal court (40 × 20 m, 5 v 5) and on a grass pitch (105 × 68 m, 11 v 11).
 * Only the space and the number of players change, which is the whole lesson: on the small court the ball finds you far more
 * often. This is a game model, not a measurement of real matches (the experience says so).
 */
export type Mode='court'|'pitch';
export type Field={mode:Mode;L:number;W:number;goalW:number;perSide:number;label:string;size:string;
 /** Formation for the home team as fractions of the field (index 0 = goalkeeper); `you` is your index in it. */
 shape:[number,number][];you:number;shotRange:number;hold:[number,number];passScale:number};
export const FIELDS:Record<Mode,Field>={
 court:{mode:'court',L:40,W:20,goalW:3,perSide:5,label:'Futsal court',size:'40 × 20 m · 5 v 5',
  shape:[[.04,.5],[.24,.5],[.44,.2],[.44,.8],[.58,.5]],you:4,shotRange:9,hold:[.35,.9],passScale:12},
 pitch:{mode:'pitch',L:105,W:68,goalW:7.32,perSide:11,label:'Grass pitch',size:'105 × 68 m · 11 v 11',
  shape:[[.04,.5],[.22,.14],[.2,.38],[.2,.62],[.22,.86],[.42,.12],[.4,.38],[.4,.62],[.42,.88],[.6,.4],[.6,.6]],you:6,shotRange:24,hold:[.6,1.5],passScale:20},
};
export type Player={x:number;y:number;vx:number;vy:number;team:0|1;gk:boolean;you:boolean;ax:number;ay:number;fx:number;fy:number;
 hold:number;pressure:number;safe:number;moved:number;stun:number};
export type Ball={x:number;y:number;vx:number;vy:number;owner:number;last:number;grace:number;target:number;shot:boolean;ignore:number[]};
export type SimEvent={type:'touch';x:number;y:number;kind:'receive'|'dribble'|'pass'|'win'}|{type:'goal';team:0|1}|{type:'kick'};
export type Input={/** world point you run to, or null */to:{x:number;y:number}|null;/** keyboard direction, or null */dir:{x:number;y:number}|null;
 /** seconds since the visitor last steered; after IDLE the autopilot plays your position for you */idle:number;pass:boolean;passTo:number};
export type Sim={field:Field;players:Player[];ball:Ball;t:number;touches:number;dots:{x:number;y:number}[];score:[number,number];rnd:()=>number;youIdx:number};

export const ROLL_DAMP=1.1,REACH=.75,GK_REACH=1.3,AI_SPEED=5,PRESS_SPEED=5.6,YOU_SPEED=6.2,DRIBBLE_SPEED=3.4,IDLE=4,DRIBBLE_EVERY=.5;
export function rng(seed:number){let a=seed>>>0;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const dist=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);

export function createSim(mode:Mode,seed=1):Sim{
 const f=FIELDS[mode],players:Player[]=[];
 for(const team of [0,1] as const)f.shape.forEach(([fx0,fy],i)=>{const fx=team?1-fx0:fx0,x=fx*f.L,y=fy*f.W;
  players.push({x,y,vx:0,vy:0,team,gk:i===0,you:team===0&&i===f.you,ax:x,ay:y,fx,fy,hold:0,pressure:0,safe:0,moved:0,stun:0});});
 const s:Sim={field:f,players,ball:{x:f.L/2,y:f.W/2,vx:0,vy:0,owner:-1,last:-1,grace:0,target:-1,shot:false,ignore:[]},t:0,touches:0,dots:[],score:[0,0],rnd:rng(seed),youIdx:f.you};
 kickoff(s,1);return s;
}
/** The team that kicks off gets the ball in the centre circle (its most central outfielder). */
function kickoff(s:Sim,team:0|1){const f=s.field;s.players.forEach(p=>{p.x=p.fx*f.L;p.y=p.fy*f.W;p.vx=p.vy=0;p.pressure=0;});
 let best=-1,bd=1e9;s.players.forEach((p,i)=>{if(p.team!==team||p.gk||p.you)return;const d=Math.hypot(p.x-f.L/2,p.y-f.W/2);if(d<bd){bd=d;best=i;}});
 const p=s.players[best];p.x=f.L/2+(team?1:-1)*.6;p.y=f.W/2;give(s,best,.6);}
function give(s:Sim,i:number,hold?:number){const p=s.players[i],b=s.ball;const [a,c]=s.field.hold;b.owner=i;b.last=i;b.target=-1;b.shot=false;b.vx=b.vy=0;b.ignore=[];
 p.hold=hold??a+s.rnd()*(c-a);p.safe=.5;p.pressure=0;p.moved=0;}
const attackX=(s:Sim,team:0|1)=>team===0?s.field.L:0;

/** Kick the ball from player i to a point, arriving after about T seconds on the rolling-ball model. */
function kickTo(s:Sim,i:number,x:number,y:number,speedCap=22,target=-1,shot=false){const b=s.ball,p=s.players[i];
 const d=Math.max(.5,Math.hypot(x-p.x,y-p.y)),T=shot?d/18:clamp(d/11,.3,2.4),v0=Math.min(speedCap,ROLL_DAMP*d/(1-Math.exp(-ROLL_DAMP*T)));
 b.vx=(x-b.x)/Math.max(.5,Math.hypot(x-b.x,y-b.y))*v0;b.vy=(y-b.y)/Math.max(.5,Math.hypot(x-b.x,y-b.y))*v0;b.owner=-1;b.last=i;b.grace=.22;b.target=target;b.shot=shot;b.ignore=[];p.stun=.3;}
function passTo(s:Sim,i:number,j:number){const r=s.players[j],d=dist(s.players[i],r),T=clamp(d/11,.3,2.4);kickTo(s,i,r.x+r.vx*T*.4,r.y+r.vy*T*.4,22,j);}
/** An AI-style pass choice: open, near and forward team-mates are likelier. You get no bonus: fair for both fields. */
export function choosePass(s:Sim,i:number):number{const p=s.players[i],opp=s.players.filter(o=>o.team!==p.team);let tot=0;const w:number[]=[];
 s.players.forEach((q,j)=>{if(j===i||q.team!==p.team){w.push(0);return;}const d=dist(p,q),open=clamp(Math.min(...opp.map(o=>dist(o,q)))/4,.15,1.5),
  fwd=clamp(1+((q.x-p.x)*(p.team?-1:1))/(s.field.L*.5),.4,1.6),v=open*Math.exp(-d/s.field.passScale)*fwd*(q.gk?.25:1);w.push(v);tot+=v;});
 let r=s.rnd()*tot;for(let j=0;j<w.length;j++){r-=w[j];if(r<=0&&w[j]>0)return j;}return w.findIndex(v=>v>0);}

function touch(s:Sim,ev:SimEvent[],kind:'receive'|'dribble'|'pass'|'win'){const y=s.players[s.youIdx];s.touches++;s.dots.push({x:y.x,y:y.y});ev.push({type:'touch',x:y.x,y:y.y,kind});}
function moveToward(p:Player,tx:number,ty:number,speed:number,dt:number){const dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy);
 if(d<.05){p.vx=p.vy=0;return;}const v=Math.min(speed,d/dt*.9);p.vx=dx/d*v;p.vy=dy/d*v;p.x+=p.vx*dt;p.y+=p.vy*dt;}

/** One fixed step. Returns the events (your touches, goals, kicks) for sound and pop-ups. */
export function step(s:Sim,dt:number,input:Input):SimEvent[]{
 const ev:SimEvent[]=[],f=s.field,b=s.ball,P=s.players,you=P[s.youIdx],auto=input.idle>IDLE&&!input.dir;s.t+=dt;
 const possTeam=b.owner>=0?P[b.owner].team:(b.last>=0?P[b.last].team:-1);
 // Who chases a loose ball: the intended receiver, plus the nearest outfielder of each team.
 const chasers=new Set<number>();if(b.owner<0){if(b.target>=0)chasers.add(b.target);for(const team of [0,1]){let bi=-1,bd=1e9;P.forEach((p,i)=>{if(p.team!==team||p.gk)return;const d=dist(p,b);if(d<bd){bd=d;bi=i;}});if(bi>=0)chasers.add(bi);}}
 // The defending team's nearest outfielder presses the holder.
 let presser=-1;if(b.owner>=0){let bd=1e9;P.forEach((p,i)=>{if(p.team===P[b.owner].team||p.gk)return;const d=dist(p,P[b.owner]);if(d<bd){bd=d;presser=i;}});}
 const stopX=b.x+b.vx/ROLL_DAMP,stopY=b.y+b.vy/ROLL_DAMP;
 P.forEach((p,i)=>{p.safe=Math.max(0,p.safe-dt);p.stun=Math.max(0,p.stun-dt);
  if(i===b.owner)return;
  if(p.you&&!auto){if(input.dir){const d=Math.hypot(input.dir.x,input.dir.y)||1;moveToward(p,p.x+input.dir.x/d*2,p.y+input.dir.y/d*2,YOU_SPEED,dt);}
   else if(input.to)moveToward(p,input.to.x,input.to.y,YOU_SPEED,dt);else p.vx=p.vy=0;}
  else if(p.gk){const gx=p.team?f.L-.6:.6,ty=clamp(f.W/2+(b.y-f.W/2)*.35,f.W/2-f.goalW/2,f.W/2+f.goalW/2);moveToward(p,gx,ty,AI_SPEED,dt);}
  else if(chasers.has(i)){// Meet the ball on its line: the closest point of its path ahead of you (or chase it once it has slowed).
   const sp=Math.hypot(b.vx,b.vy);let tx=stopX,ty=stopY;if(sp>1.5){const ux=b.vx/sp,uy=b.vy/sp,len=Math.hypot(stopX-b.x,stopY-b.y),k=clamp((p.x-b.x)*ux+(p.y-b.y)*uy,0,len);tx=b.x+ux*k;ty=b.y+uy*k;}
   moveToward(p,tx,ty,PRESS_SPEED,dt);}
  else if(i===presser){const h=P[b.owner],d=dist(p,h)||1;moveToward(p,h.x+(p.x-h.x)/d*.8,h.y+(p.y-h.y)/d*.8,PRESS_SPEED*.85,dt);}
  else{const push=possTeam===p.team?(p.team?-1:1)*f.L*.12:(p.team?1:-1)*f.L*.04;
   const tx=clamp(p.ax+(b.x-f.L/2)*.5+push,1,f.L-1),ty=clamp(p.ay+(b.y-f.W/2)*.28,1,f.W-1);moveToward(p,tx,ty,AI_SPEED*.85,dt);}
  p.x=clamp(p.x,-.5,f.L+.5);p.y=clamp(p.y,-.5,f.W+.5);});

 if(b.owner>=0){const h=P[b.owner],dir=h.team?-1:1;h.hold-=dt;
  if(h.you&&!auto){
   if(input.dir){const d=Math.hypot(input.dir.x,input.dir.y)||1;moveToward(h,h.x+input.dir.x/d*2,h.y+input.dir.y/d*2,DRIBBLE_SPEED+1,dt);}
   else if(input.to)moveToward(h,input.to.x,input.to.y,DRIBBLE_SPEED+1,dt);else h.vx=h.vy=0;
   if(input.pass){const j=input.passTo>=0&&P[input.passTo]?.team===0&&input.passTo!==b.owner?input.passTo:choosePass(s,b.owner);touch(s,ev,'pass');passTo(s,b.owner,j);ev.push({type:'kick'});}
  }else{
   // Dribble forward (and a little toward the middle), then pass or shoot when the hold runs out.
   moveToward(h,h.x+dir*2,h.y+(f.W/2-h.y)*.15,DRIBBLE_SPEED,dt);
   if(h.hold<=0){const gx=attackX(s,h.team);
    if(Math.abs(gx-h.x)<f.shotRange&&!h.gk){if(h.you)touch(s,ev,'pass');kickTo(s,b.owner,gx+dir*1.5,f.W/2+(s.rnd()-.5)*f.goalW*1.3,24,-1,true);ev.push({type:'kick'});}
    else{const j=choosePass(s,b.owner);if(h.you)touch(s,ev,'pass');passTo(s,b.owner,j);ev.push({type:'kick'});}}
  }
  if(b.owner>=0){const o=P[b.owner];const sp=Math.hypot(o.vx,o.vy);
   if(o.you&&sp>.8){o.moved+=dt;if(o.moved>=DRIBBLE_EVERY){o.moved=0;touch(s,ev,'dribble');}}
   const hx=sp>.2?o.vx/sp:(o.team?-1:1),hy=sp>.2?o.vy/sp:0;b.x=o.x+hx*.45;b.y=o.y+hy*.45;b.vx=b.vy=0;
   // Tackles: an opponent close to the holder for long enough wins the ball.
   let near=false;for(const q of P)if(q.team!==o.team&&!q.gk&&q.stun<=0&&dist(q,o)<1.1)near=true;
   if(near&&o.safe<=0){o.pressure+=dt;if(o.pressure>.5){let wi=-1,wd=1e9;P.forEach((q,i)=>{if(q.team===o.team)return;const d=dist(q,o);if(d<wd){wd=d;wi=i;}});o.stun=.8;give(s,wi);if(P[wi].you)touch(s,ev,'win');}}else o.pressure=Math.max(0,o.pressure-dt);}
 }else{
  b.x+=b.vx*dt;b.y+=b.vy*dt;const k=Math.exp(-ROLL_DAMP*dt);b.vx*=k;b.vy*=k;b.grace-=dt;
  let wi=-1,wd=1e9;const fast=Math.hypot(b.vx,b.vy)>6;P.forEach((p,i)=>{if((i===b.last&&b.grace>0)||b.ignore.includes(i)||p.stun>0)return;const d=dist(p,b),r=p.gk?GK_REACH:REACH;if(d<r&&d<wd){wd=d;wi=i;}});
  // A fast ball running past someone it wasn't meant for is only sometimes stopped (keepers save more often).
  if(wi>=0&&fast&&wi!==b.target&&s.rnd()>(P[wi].gk?.85:.3)){b.ignore.push(wi);wi=-1;}
  if(wi>=0){give(s,wi);if(P[wi].you)touch(s,ev,'receive');}
  else if(b.y<0||b.y>f.W){// Kick-in (futsal) or throw-in (grass) to the other team, at the line.
   const team=(b.last>=0?1-P[b.last].team:0) as 0|1;b.y=clamp(b.y,0,f.W);b.x=clamp(b.x,1,f.L-1);let ni=-1,nd=1e9;P.forEach((p,i)=>{if(p.team!==team||p.gk)return;const d=dist(p,b);if(d<nd){nd=d;ni=i;}});
   const p=P[ni];p.x=b.x;p.y=b.y<f.W/2?.3:f.W-.3;give(s,ni,.7);if(p.you)touch(s,ev,'receive');}
  else if(b.x<0||b.x>f.L){const end=b.x<0?0:1,inGoal=Math.abs(b.y-f.W/2)<f.goalW/2;
   if(inGoal){const scorer=(end===0?1:0) as 0|1;s.score[scorer]++;ev.push({type:'goal',team:scorer});kickoff(s,(1-scorer) as 0|1);}
   else{const gi=P.findIndex(p=>p.gk&&p.team===end);const g=P[gi];g.x=end?f.L-.6:.6;g.y=f.W/2;give(s,gi,.8);}}
 }
 // Nobody near your own player for a while? Your position stays sensible when the visitor is idle (handled above by auto).
 void you;return ev;
}
/** Idle-visitor run (the autopilot plays your spot) for the Node test: touches per minute on each field. */
export function idleRate(mode:Mode,seed:number,seconds=60){const s=createSim(mode,seed),dt=1/60,inp:Input={to:null,dir:null,idle:99,pass:false,passTo:-1};
 for(let t=0;t<seconds;t+=dt)step(s,dt,inp);return s.touches/(seconds/60);}
