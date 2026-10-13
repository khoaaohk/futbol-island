import {BALL} from './content';
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));

/**
 * futsal-1989 · the game model (Oct 10 2026; Oct 12 2026: the pixel drawing is gone, the machines are drawn with the anatomy kit
 * in the Paper theme by Rig.tsx and Court.tsx). Pure: tests/museum-exp-futsal-1989.cjs plays it in Node. Two machines:
 *
 *  1. THE DROP RIG. Two claws hold a futsal ball and a grass ball 2 m over a hard court. Press DROP: real gravity, and each ball
 *     bounces with the middle of its band from the Laws (futsal Law 2: 50–65 cm back from 2 m; FIFA Quality Pro grass ball:
 *     120–165 cm). Gold markers stay at each ball's first rebound.
 *  2. THE RONDO. Five a side on a hard court: your four outfielders (fixo, two alas, pivô) keep the ball from two Dutch
 *     defenders. Drag from the ball toward a team-mate to aim (aim assist snaps onto them); the drag length is the power. The ball
 *     really bounces, and the receiver traps it with the SOLE: the ball rebounds off the sole at speed × e × SOLE, and if that is
 *     more than CONTROL m/s it squirts away. With the futsal ball (low e) you can pass hard and still trap it; with the bouncy
 *     grass ball only soft passes stick, and soft passes get cut out. That is why futsal uses a low-bounce ball.
 *     A round is 30 s (or 3 balls lost); score = passes completed. Play it with both balls.
 * World: metres, seconds; x runs to the screen's lower right, y to the lower left. Your goal is behind the fixo at x < 0.
 */
export type Kind='futsal'|'grass';
const G=9.81;
/** Coefficient of restitution from the middle of each ball's band: e = √(rebound ÷ drop). */
export const E:Record<Kind,number>={futsal:Math.sqrt(((BALL.futsal.lo+BALL.futsal.hi)/2)/BALL.drop),grass:Math.sqrt(((BALL.grass.lo+BALL.grass.hi)/2)/BALL.drop)};

// ── 1. The drop rig ──────────────────────────────────────────────────────────────────────────────────────────────────────
export type DropBall={z:number;vz:number;bounces:number;first:number;rest:boolean;trail:number[]};
export type Drop={t:number;dropped:boolean;balls:Record<Kind,DropBall>};
const dropBall=():DropBall=>({z:2,vz:0,bounces:0,first:0,rest:false,trail:[]});
export const newDrop=():Drop=>({t:0,dropped:false,balls:{futsal:dropBall(),grass:dropBall()}});
/** A bounce slower than this (m/s) and the ball just sits (a few mm hops are invisible at this scale). */
export const REST_V=.9;
/** Advance the drop (dt s). Returns true while a ball still moves. */
export function stepDrop(d:Drop,dt:number){if(!d.dropped)return false;const H=1/240,n=Math.max(1,Math.ceil(dt/H));let moving=false;
 for(const k of ['futsal','grass'] as Kind[]){const b=d.balls[k];if(b.rest)continue;moving=true;
  for(let i=0;i<n;i++){b.vz-=G*dt/n;b.z+=b.vz*dt/n;
   if(b.z<=0){b.z=0;b.vz=-b.vz*E[k];b.bounces++;if(b.vz<REST_V){b.vz=0;b.rest=true;break;}}
   if(b.bounces===1)b.first=Math.max(b.first,b.z);}
  if(!b.rest&&(b.trail.length===0||Math.abs(b.trail[b.trail.length-1]-b.z)>.02))b.trail.push(b.z);}
 d.t+=dt;return moving;}
export function settleDrop(d:Drop){d.dropped=true;for(let i=0;i<4000&&stepDrop(d,1/120);i++){/* to rest */}return d;}
/** The first rebound in cm (what the Law measures). */
export const reboundCm=(b:DropBall)=>Math.round(b.first*100);

// ── 2. The rondo ─────────────────────────────────────────────────────────────────────────────────────────────────────────
export const ROLES=['fixo','ala','ala','pivô'] as const;
export const HOME=[{x:1.4,y:4},{x:4.6,y:.9},{x:4.6,y:7.1},{x:7.9,y:4}] as const;
export const DEF_HOME=[{x:4.2,y:3.2},{x:5.2,y:4.9}] as const;
export const ROUND_S=30,LOST_MAX=3,REDUCED_PASSES=10;
export const SOLE=.45,CONTROL=2.8,REACH=.6,KNEE=.5,INT_R=.5,TACKLE_R=.55,LIFT=.2,ROLL=.6;
/** The press: a defender closes to PRESS_GAP m, then lunges once you have held the ball for HOLD_MAX s. */
export const HOLD_MAX=3,PRESS_GAP=1.2,LUNGE=4;
export const DEF_PRESS=1.7,DEF_CHASE=2.6,MATE_JOG=1.6;
export const COURT={x0:-.6,x1:10.4,y0:-.8,y1:8.8};
export type Lost='intercepted'|'bounced'|'tackled'|'out'|'short';
export type Rondo={
 kind:Kind;t:number;clock:number;state:'hold'|'pass'|'lost'|'over';reduced:boolean;
 mates:{x:number;y:number}[];defs:{x:number;y:number}[];holder:number;passer:number;target:number;
 ball:{x:number;y:number;z:number;vx:number;vy:number;vz:number};
 passes:number;lost:number;streak:number;best:number;lostT:number;why:Lost|null;lastOut:number;frame:number;holdT:number;
 trail:{x:number;y:number;z:number}[];
};
export function newRondo(kind:Kind,reduced=false):Rondo{
 const r:Rondo={kind,t:0,clock:ROUND_S,state:'hold',reduced,mates:HOME.map(h=>({...h})),defs:DEF_HOME.map(h=>({...h})),holder:0,passer:-1,target:-1,
  ball:{x:0,y:0,z:0,vx:0,vy:0,vz:0},passes:0,lost:0,streak:0,best:0,lostT:0,why:null,lastOut:0,frame:0,holdT:0,trail:[]};
 atFeet(r);return r;}
function atFeet(r:Rondo){const m=r.mates[r.holder];r.ball={x:m.x+.35,y:m.y+.1,z:0,vx:0,vy:0,vz:0};}
const d2=(a:{x:number;y:number},b:{x:number;y:number})=>Math.hypot(a.x-b.x,a.y-b.y);
const toward=(p:{x:number;y:number},t:{x:number;y:number},speed:number,dt:number)=>{const d=d2(p,t);if(d<1e-6)return;const k=Math.min(1,speed*dt/d);p.x+=(t.x-p.x)*k;p.y+=(t.y-p.y)*k;};
export const powerOf=(dragM:number)=>clamp(3+dragM*1.5,3,12);
/** Aim assist: a direction within 22° of a team-mate snaps onto them. Returns the unit direction and the mate (or -1). */
export function aim(r:Rondo,dx:number,dy:number):{x:number;y:number;mate:number}{
 const l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,from=r.mates[r.holder];let best=-1,bc=Math.cos(22*Math.PI/180);
 r.mates.forEach((m,i)=>{if(i===r.holder)return;const mx=m.x-from.x,my=m.y-from.y,ml=Math.hypot(mx,my)||1,c=(mx*ux+my*uy)/ml;if(c>bc){bc=c;best=i;}});
 if(best<0)return {x:ux,y:uy,mate:-1};const m=r.mates[best],mx=m.x-from.x,my=m.y-from.y,ml=Math.hypot(mx,my)||1;return {x:mx/ml,y:my/ml,mate:best};}
/** Kick: a pass along (dx, dy) at `speed` m/s. Ignored unless you hold the ball. */
export function kick(r:Rondo,dx:number,dy:number,speed:number){if(r.state!=='hold')return false;const a=aim(r,dx,dy),v=clamp(speed,3,12);
 r.passer=r.holder;r.target=a.mate;r.ball.vx=a.x*v;r.ball.vy=a.y*v;r.ball.vz=LIFT*v;r.state='pass';r.trail=[{x:r.ball.x,y:r.ball.y,z:0}];return true;}
/** How fast the ball comes off the receiver's sole (m/s): the bouncier the ball, the faster it squirts away. */
export const soleOut=(kind:Kind,speed:number)=>speed*E[kind]*SOLE;
function lose(r:Rondo,why:Lost){r.state='lost';r.why=why;r.lost++;r.streak=0;r.lostT=0;}
/** One step of the rondo (dt s). Returns true while the loop must keep running. */
export function stepRondo(r:Rondo,dt:number):boolean{
 if(r.state==='over')return false;
 if(r.reduced&&r.state==='hold')return false;// turn-based: wait for the next pass
 const H=1/120,n=Math.max(1,Math.ceil(dt/H)),st=()=>r.state as Rondo['state'];for(let i=0;i<n&&st()!=='over';i++)sub(r,dt/n);
 return st()!=='over'&&!(r.reduced&&st()==='hold');}
function sub(r:Rondo,h:number){
 r.t+=h;r.frame=Math.floor(r.t*8);
 if(!r.reduced&&(r.state==='hold'||r.state==='pass')){r.clock=Math.max(0,r.clock-h);if(r.clock<=0&&r.state==='hold'){r.state='over';return;}}
 // Team-mates show for the ball: back to their spot, a step away from the nearest defender.
 r.mates.forEach((m,i)=>{if(i===r.holder&&r.state==='hold')return;const hm=HOME[i],nd=r.defs.reduce((a,b)=>d2(a,hm)<d2(b,hm)?a:b);const dx=hm.x-nd.x,dy=hm.y-nd.y,l=Math.hypot(dx,dy)||1;
  toward(m,{x:clamp(hm.x+dx/l*.7,COURT.x0+.3,COURT.x1-.3),y:clamp(hm.y+dy/l*.7,COURT.y0+.3,COURT.y1-.3)},MATE_JOG,h);});
 const b=r.ball;
 if(r.state==='hold'){// the press: one defender closes the holder down, the other screens the easiest pass
  const hold=r.mates[r.holder];if(!r.reduced){r.holdT+=h;const d0=r.defs[0],gap=d2(d0,hold);
   if(r.holdT>HOLD_MAX)toward(d0,hold,LUNGE,h);else if(gap>PRESS_GAP)toward(d0,{x:hold.x+(d0.x-hold.x)/gap*PRESS_GAP,y:hold.y+(d0.y-hold.y)/gap*PRESS_GAP},DEF_PRESS,h);
   const others=r.mates.map((m,i)=>({m,i})).filter(o=>o.i!==r.holder).sort((a,c)=>d2(a.m,hold)-d2(c.m,hold));const lane=others[0].m;toward(r.defs[1],{x:(hold.x+lane.x)/2,y:(hold.y+lane.y)/2},DEF_PRESS*.8,h);
   if(d2(r.defs[0],hold)<TACKLE_R)lose(r,'tackled');}
  atFeet(r);return;}
 if(r.state==='lost'){r.lostT+=h;if(r.lostT>.9){if(r.lost>=LOST_MAX||(!r.reduced&&r.clock<=0)){r.state='over';return;}
   r.holder=0;r.holdT=0;r.defs=DEF_HOME.map(x=>({...x}));r.state='hold';r.why=null;atFeet(r);}return;}
 // The pass: flight, bounces on the hard floor, rolling friction.
 b.vz-=G*h;b.z+=b.vz*h;if(b.z<=0){b.z=0;b.vz=b.vz<0?-b.vz*E[r.kind]:b.vz;if(b.vz<.35)b.vz=0;}
 const sp=Math.hypot(b.vx,b.vy);if(b.z===0&&sp>0){const ns=Math.max(0,sp-ROLL*h);b.vx*=ns/sp;b.vy*=ns/sp;}
 b.x+=b.vx*h;b.y+=b.vy*h;const lt=r.trail[r.trail.length-1];if(!lt||d2(lt,b)>.2)r.trail.push({x:b.x,y:b.y,z:b.z});
 // Defenders chase it.
 for(const d of r.defs){toward(d,{x:b.x,y:b.y},DEF_CHASE,h);if(d2(d,b)<INT_R&&b.z<.7){lose(r,'intercepted');return;}}
 // A team-mate traps it with the sole (or it squirts off the sole).
 for(let i=0;i<r.mates.length;i++){if(i===r.passer)continue;const m=r.mates[i];if(d2(m,b)<REACH&&b.z<KNEE){const out=soleOut(r.kind,Math.hypot(b.vx,b.vy));r.lastOut=out;
  if(out>CONTROL){lose(r,'bounced');return;}
  r.holder=i;r.holdT=0;r.passes++;r.streak++;r.best=Math.max(r.best,r.streak);r.state='hold';
  if(r.reduced&&r.passes>=REDUCED_PASSES)r.state='over';return;}}
 if(b.x<COURT.x0||b.x>COURT.x1||b.y<COURT.y0||b.y>COURT.y1){lose(r,'out');return;}
 if(Math.hypot(b.vx,b.vy)<.25&&b.z===0){lose(r,'short');return;}
}
/** Run the rondo with a fixed list of passes (tests): each pass is [mate, speed]; returns the finished state. */
export function playScript(kind:Kind,passes:readonly [number,number][],reduced=true){const r=newRondo(kind,reduced);
 for(const [mate,speed] of passes){for(let i=0;i<300&&r.state==='lost';i++)sub(r,1/30);if(r.state!=='hold')break;
  const tgt=mate===r.holder?(mate+1)%4:mate,m=r.mates[tgt],h=r.mates[r.holder];kick(r,m.x-h.x,m.y-h.y,speed);for(let i=0;i<600&&(r.state as Rondo['state'])==='pass';i++)sub(r,1/60);}
 return r;}

/** Where the rig and the court are drawn (Rig.tsx, Court.tsx): the two balls' drop columns and the court's corners, metres. */
export const RIG_X:Record<Kind,number>={futsal:-.62,grass:.62};
