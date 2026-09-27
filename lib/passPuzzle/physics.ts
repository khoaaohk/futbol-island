/**
 * Pass Puzzle ball physics: pure, allocation-free per step, fixed 1/120 s.
 * Gravity, quadratic air drag, a Magnus-style side-spin term, bounce restitution,
 * rolling friction, post + crossbar cylinders, goal-line / out detection and a net.
 */
import type {Scenario,Vec2,Vec3} from './types';

export const STEP=1/120;
/** Math.hypot is slow in V8; plain sqrt is ~10× faster and just as deterministic here. */
export function hyp(a:number,b:number,c=0):number{return Math.sqrt(a*a+b*b+c*c);}
export const G=9.81;
export const R=0.11;             // ball radius (size 4/5 ≈ 0.11 m)
export const DRAG=0.0133;        // a = −k|v|v  (½ρCdA/m for a match ball)
export const MAGNUS=0.08;        // lateral a = MAGNUS·spin·|v| ⟂ v
export const REST=0.45;          // bounce restitution
export const ROLL=1.1;           // rolling friction deceleration (m/s²)
export const POST_R=0.06;
export const POST_REST=0.6;
export const NET_DEPTH=1.2;
const SPIN_KEEP=Math.exp(-STEP/2.5);
const SOLVE_DT=1/60, SOLVE_MAX=300; // aim solver runs at half rate (≤5 s); both predict and the world use it, so aims match
const GROUND_MAGNUS=0.4;

export type Geo={hw:number;len:number;goalZ:number;backZ:number;halfGoal:number;barH:number};
export function geoOf(sc:Scenario):Geo{
  const gw=sc.pitch.goalWidth;
  return {hw:sc.pitch.halfWidth,len:sc.pitch.length,goalZ:sc.pitch.length/2,backZ:-sc.pitch.length/2,halfGoal:gw/2,barH:gw>=7?2.44:gw>=6?2.13:1.98};
}

export const F_BOUNCE=1,F_POST=2,F_GOAL=4,F_OUT=8,F_BAR=16;
export type BallLike={p:Vec3;v:Vec3;spin:number};

function hitCylinder(b:BallLike,da:number,db:number,axisA:'x'|'y',axisB:'z'):boolean{
  // generic 2D circle push-out in the (axisA, axisB) plane; da/db = ball offset from the cylinder axis
  const d=hyp(da,db),min=R+POST_R;
  if(d>=min||d<1e-9)return false;
  const na=da/d,nb=db/d,push=min-d;
  b.p[axisA]+=na*push;b.p[axisB]+=nb*push;
  const vn=b.v[axisA]*na+b.v[axisB]*nb;
  if(vn<0){b.v[axisA]-=(1+POST_REST)*vn*na;b.v[axisB]-=(1+POST_REST)*vn*nb;b.spin*=0.5;}
  return true;
}

/**
 * One fixed step. `geo` null = open field (used by the aim solver).
 * `inNet` enables the net box after a goal. Returns F_* flags.
 */
export function stepBall(b:BallLike,geo:Geo|null,inNet=false,dt=STEP):number{
  const p=b.p,v=b.v;let f=0;
  const grounded=p.y<=R+1e-6&&Math.abs(v.y)<1e-6;
  const sp=Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z);
  let ax=-DRAG*sp*v.x,ay=-DRAG*sp*v.y,az=-DRAG*sp*v.z;
  const m=MAGNUS*b.spin*(grounded?GROUND_MAGNUS:1);
  ax+=m*-v.z;az+=m*v.x;               // spin>0 accelerates toward (−v.z, v.x)
  if(!grounded)ay-=G;
  v.x+=ax*dt;v.y+=ay*dt;v.z+=az*dt;
  if(grounded){
    v.y=0;const h=Math.sqrt(v.x*v.x+v.z*v.z);
    if(h>0){const nh=h>ROLL*dt?h-ROLL*dt:0;v.x*=nh/h;v.z*=nh/h;}
  }
  const pz=p.z,px=p.x;
  p.x+=v.x*dt;p.y+=v.y*dt;p.z+=v.z*dt;
  if(p.y<R){
    p.y=R;
    if(v.y<-0.8){v.y=-v.y*REST;v.x*=0.92;v.z*=0.92;b.spin*=0.6;f|=F_BOUNCE;}
    else v.y=0;
  }
  b.spin*=dt===STEP?SPIN_KEEP:Math.exp(-dt/2.5);
  if(!geo)return f;
  const gz=geo.goalZ;
  if(Math.abs(p.z-gz)<R+POST_R+0.02){
    if(p.y<geo.barH+R){
      if(hitCylinder(b,p.x+geo.halfGoal,p.z-gz,'x','z'))f|=F_POST;
      if(hitCylinder(b,p.x-geo.halfGoal,p.z-gz,'x','z'))f|=F_POST;
    }
    if(Math.abs(p.x)<=geo.halfGoal&&hitCylinder(b,p.y-geo.barH,p.z-gz,'y','z'))f|=F_BAR;
  }
  if(inNet){
    if(p.z>gz+NET_DEPTH){p.z=gz+NET_DEPTH;v.z=-v.z*0.1;v.x*=0.3;v.y*=0.3;b.spin=0;}
    if(p.z>gz+R){
      if(p.x>geo.halfGoal-R){p.x=geo.halfGoal-R;v.x=-v.x*0.1;}
      if(p.x<-geo.halfGoal+R){p.x=-geo.halfGoal+R;v.x=-v.x*0.1;}
      if(p.y>geo.barH-R){p.y=geo.barH-R;v.y=-v.y*0.1;}
    }
    return f;
  }
  const line=gz+R;
  if(pz<=line&&p.z>line){
    const t=(line-pz)/(p.z-pz),cx=px+(p.x-px)*t;
    if(Math.abs(cx)<geo.halfGoal-POST_R&&p.y<geo.barH-POST_R)f|=F_GOAL;else f|=F_OUT;
  }else if(p.z>line){
    // already behind the line and not a goal (cannot happen once caught by the caller)
  }
  if(Math.abs(p.x)>geo.hw+R&&Math.abs(px)<=geo.hw+R)f|=F_OUT;
  if(p.z<geo.backZ-R&&pz>=geo.backZ-R)f|=F_OUT;
  return f;
}

/**
 * Aim solver: launch velocity from `o` so the ball's centre passes over `target`
 * (horizontal) at height `yT` (lofted) with horizontal speed ≈ `h` and side spin `spin`.
 * Ground balls (lofted=false) roll with vy=0. Deterministic; ~4 short open-field sims.
 */
export function solveLaunch(o:Vec3,target:Vec2,yT:number,h:number,spin:number,lofted:boolean):Vec3{
  const dx=target.x-o.x,dz=target.z-o.z,dist=Math.max(0.5,hyp(dx,dz));
  const ux=dx/dist,uz=dz/dist,nx=uz,nz=-ux; // nR = (d.z, −d.x)
  let T=dist/h;
  const aLat=MAGNUS*Math.abs(spin)*h*(lofted?1:GROUND_MAGNUS);
  let lat=Math.sign(spin)*0.5*aLat*T;       // swing out to the +nR side for spin>0
  let yaw=Math.atan2(lat,h);                // angle off the chord toward +nR
  let vy=lofted?(yT-o.y+0.5*G*T*T)/T:0;
  let speed=h;
  const b:BallLike={p:{x:0,y:0,z:0},v:{x:0,y:0,z:0},spin:0};
  let short=0;
  for(let it=0;it<5;it++){
    const c=Math.cos(yaw),s=Math.sin(yaw);
    b.p.x=o.x;b.p.y=o.y;b.p.z=o.z;b.spin=spin;
    b.v.x=(ux*c+nx*s)*speed;b.v.z=(uz*c+nz*s)*speed;b.v.y=vy;
    let t=0,prevS=0,prevL=0,prevY=o.y,reached=false,eL=0,eY=0;
    for(let n=0;n<SOLVE_MAX;n++){
      stepBall(b,null,false,SOLVE_DT);t+=SOLVE_DT;
      const rx=b.p.x-o.x,rz=b.p.z-o.z,sAlong=rx*ux+rz*uz,sLat=rx*nx+rz*nz;
      if(sAlong>=dist){
        const k=(dist-prevS)/Math.max(1e-6,sAlong-prevS);
        eL=prevL+(sLat-prevL)*k;eY=prevY+(b.p.y-prevY)*k-yT;T=t;reached=true;break;
      }
      prevS=sAlong;prevL=sLat;prevY=b.p.y;
      if(b.v.x*ux+b.v.z*uz<=0.05)break;                       // stopped / turned back: short
      if(lofted&&b.p.y<=R+1e-6&&n>2)break;                    // lofted ball landed short
    }
    if(!reached){
      // out of range at this power: a little more pace (twice at most), then accept a short ball
      if(short++>=2)break;
      speed*=1.15;if(lofted)vy*=1.1;continue;
    }
    yaw-=Math.atan2(eL,dist);
    if(lofted)vy-=eY/Math.max(0.2,T);
    if(Math.abs(eL)<0.05&&(!lofted||Math.abs(eY)<0.05))break;
  }
  const c=Math.cos(yaw),s=Math.sin(yaw);
  return {x:(ux*c+nx*s)*speed,y:vy,z:(uz*c+nz*s)*speed};
}

/**
 * Lofted ball with a chosen apex: vertical speed comes from the apex height, horizontal speed is
 * solved so the ball comes DOWN through height `yT` over `target`. Keeps lofted passes realistic
 * (3–8 m peaks) instead of raising the arc when the distance grows.
 */
export function solveLob(o:Vec3,target:Vec2,yT:number,apex:number,spin:number):Vec3{
  const dx=target.x-o.x,dz=target.z-o.z,dist=Math.max(0.5,Math.hypot(dx,dz));
  const ux=dx/dist,uz=dz/dist,nx=uz,nz=-ux;
  const top=Math.max(apex,o.y+0.3,yT+0.3);
  const vy=Math.sqrt(2*G*(top-o.y));
  let T=vy/G+Math.sqrt(2*Math.max(0.05,top-yT)/G);
  let h=dist/T;
  let yaw=Math.atan2(Math.sign(spin)*0.5*MAGNUS*Math.abs(spin)*h*T,h);
  const b:BallLike={p:{x:0,y:0,z:0},v:{x:0,y:0,z:0},spin:0};
  for(let it=0;it<6;it++){
    const c=Math.cos(yaw),s=Math.sin(yaw);
    b.p.x=o.x;b.p.y=o.y;b.p.z=o.z;b.spin=spin;
    b.v.x=(ux*c+nx*s)*h;b.v.z=(uz*c+nz*s)*h;b.v.y=vy;
    let pS=0,pL=0,pY=o.y,sAt=-1,lAt=0;
    for(let n=0;n<SOLVE_MAX;n++){
      stepBall(b,null,false,SOLVE_DT);
      const rx=b.p.x-o.x,rz=b.p.z-o.z,sA=rx*ux+rz*uz,sL=rx*nx+rz*nz;
      if(b.v.y<0&&b.p.y<=yT){const k=(pY-yT)/Math.max(1e-6,pY-b.p.y);sAt=pS+(sA-pS)*k;lAt=pL+(sL-pL)*k;break;}
      pS=sA;pL=sL;pY=b.p.y;
    }
    if(sAt<=0.1)break;
    h*=dist/sAt;
    yaw-=Math.atan2(lAt,dist);
    if(Math.abs(sAt-dist)<0.05&&Math.abs(lAt)<0.05)break;
  }
  const c=Math.cos(yaw),s=Math.sin(yaw);
  return {x:(ux*c+nx*s)*h,y:vy,z:(uz*c+nz*s)*h};
}

/** Launch speed for a ground ball that is still rolling at `arrive` m/s when it reaches `dist`. */
export function groundSpeedFor(dist:number,arrive:number):number{
  let v0=Math.sqrt(arrive*arrive+2*ROLL*dist);
  const b:BallLike={p:{x:0,y:R,z:0},v:{x:0,y:0,z:0},spin:0};
  for(let it=0;it<4;it++){
    b.p.x=0;b.p.y=R;b.p.z=0;b.v.x=0;b.v.y=0;b.v.z=v0;
    let vm=-1;
    for(let n=0;n<SOLVE_MAX;n++){stepBall(b,null,false,SOLVE_DT);if(b.p.z>=dist){vm=b.v.z;break;}if(b.v.z<=0.05)break;}
    if(vm<0){v0*=1.15;continue;}
    const e=arrive-vm;v0+=e*(arrive/Math.max(0.5,vm));
    if(Math.abs(e)<0.1)break;
  }
  return v0;
}
