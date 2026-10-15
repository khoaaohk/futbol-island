/**
 * ball-curve · a tiny deterministic flight lab (pure, no DOM: tests/museum-exp-ball-curve.cjs runs it in Node).
 *
 * A football is struck at a CONTACT POINT on its back (cx: −1 left … +1 right of centre, cy: −1 bottom … +1 top, as the kicker
 * sees it) with a POWER (0…1). Off-centre contact turns some of the strike into spin; spin + speed = a sideways (Magnus) push:
 * the spinning ball throws the air one way, so the air pushes the ball the other way. The flight is integrated with a fixed
 * 1/120 s step: gravity, air drag, Magnus, and — for a ball with almost no spin — a knuckle wobble (a seeded, repeatable sway).
 * It only runs while a shot is in flight (the exhibit's loop replays these samples), so nothing runs at rest.
 *
 * The constants are a SIMPLE TEACHING MODEL tuned to sensible numbers (a 0.43 kg ball of radius 0.11 m; up to about 30 m/s and
 * about 10 turns a second; a hard curler bends a few metres over 25 m), not a measurement. Coordinates in metres: x across
 * (+ right as the kicker looks), y forward (towards the target), z up.
 */
export const R=.11,MASS=.43,G=9.81,DT=1/120;
const RHO=1.2,AREA=Math.PI*R*R,CD=.25;
export const K_DRAG=.5*RHO*CD*AREA/MASS;// a = K_DRAG·v²
export const K_MAGNUS=.0052;// a = K_MAGNUS·(ω × v)
export const SPIN_PER=2.6;// rad/s of spin per (m/s of ball speed) for a full off-centre strike
export const KNUCKLE_SPIN=9;// below this (rad/s) the ball is a knuckleball and wobbles
export const WOBBLE=11,WOBBLE_HZ=[1.3,1.9] as const;
export type Strike={cx:number;cy:number;power:number;aim:number/* degrees, + right */;seed?:number};
export type Sample={t:number;x:number;y:number;z:number};
export type Flight={samples:Sample[];spin:{side:number;back:number;total:number};speed:number;knuckle:boolean;launchDeg:number};

const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
/** Ball speed off the foot: power sets it; an off-centre strike loses some of it to spin. */
export const speedOf=(s:Strike)=>(14+18*clamp(s.power,0,1))*(1-.22*(s.cx*s.cx+Math.max(0,-s.cy)*Math.max(0,-s.cy)*.5));
/** Launch angle: under the ball lifts it, over the top keeps it low. */
export const launchOf=(s:Strike)=>4+24*Math.max(0,-s.cy)-3*Math.max(0,s.cy);
/**
 * The spin the strike gives (rad/s). Sidespin ωz (+ = anticlockwise seen from above): striking RIGHT of centre turns the ball
 * anticlockwise, so it curves LEFT; striking left of centre curves it right. ωx: striking under the ball = backspin (+, it floats),
 * over the top = topspin (−, it dips).
 */
export function spinOf(s:Strike){const v=speedOf(s),side=SPIN_PER*clamp(s.cx,-1,1)*v,back=SPIN_PER*.25*-clamp(s.cy,-1,1)*v;
 return {side,back,total:Math.hypot(side,back)};}
/** A seeded wobble phase (no Math.random: the same strike always flies the same way). */
const phase=(seed:number,k:number)=>{let h=(Math.imul(seed+1,2654435761)^Math.imul(k+7,40503))>>>0;h=Math.imul(h^(h>>>15),2246822519)>>>0;return (h%6283)/1000;};

/** Fly the ball until it reaches `yEnd`, stops, or 4 s pass. `wobble: false` gives the smooth prediction (no knuckle sway). */
export function fly(s:Strike,{yEnd=30,wobble=true}:{yEnd?:number;wobble?:boolean}={}):Flight{
 const v0=speedOf(s),la=launchOf(s)*Math.PI/180,aim=s.aim*Math.PI/180,sp=spinOf(s),knuckle=sp.total<KNUCKLE_SPIN;
 let x=0,y=0,z=R,vx=v0*Math.cos(la)*Math.sin(aim),vy=v0*Math.cos(la)*Math.cos(aim),vz=v0*Math.sin(la),wz=sp.side,wx0=sp.back,t=0;
 const seed=s.seed??0,p1=phase(seed,1),p2=phase(seed,2),out:Sample[]=[{t,x,y,z}];
 const calm=clamp(1-sp.total/KNUCKLE_SPIN,0,1);// 1 = no spin at all
 while(t<4){
  const v=Math.hypot(vx,vy,vz)||1e-9;
  // spin axis: wz about the vertical, wx about the across axis (rotated with the aim so backspin stays "back")
  const wx=wx0*Math.cos(aim),wy=-wx0*Math.sin(aim);
  let ax=-K_DRAG*v*vx+K_MAGNUS*(wy*vz-wz*vy),ay=-K_DRAG*v*vy+K_MAGNUS*(wz*vx-wx*vz),az=-G-K_DRAG*v*vz+K_MAGNUS*(wx*vy-wy*vx);
  if(wobble&&calm>0){const q=(v/25)*(v/25)*WOBBLE*calm;ax+=q*Math.sin(2*Math.PI*WOBBLE_HZ[0]*t+p1)*Math.cos(aim);ay-=q*Math.sin(2*Math.PI*WOBBLE_HZ[0]*t+p1)*Math.sin(aim);az+=.6*q*Math.sin(2*Math.PI*WOBBLE_HZ[1]*t+p2);}
  vx+=ax*DT;vy+=ay*DT;vz+=az*DT;x+=vx*DT;y+=vy*DT;z+=vz*DT;t+=DT;
  wz*=1-DT/9;
  if(z<R){z=R;if(vz<-.6){vz=-vz*.45;vx*=.82;vy*=.82;}else{vz=0;const f=Math.max(0,1-.9*DT/Math.max(.5,Math.hypot(vx,vy)));vx*=f;vy*=f;}}
  out.push({t,x,y,z});
  if(y>=yEnd||Math.hypot(vx,vy)<1.2)break;
 }
 return {samples:out,spin:sp,speed:v0,knuckle,launchDeg:launchOf(s)};
}
/** Where the flight crosses the line y = Y (interpolated), or null if it never gets there. */
export function crossing(f:Flight,Y:number){const s=f.samples;for(let i=1;i<s.length;i++)if(s[i].y>=Y){const a=s[i-1],b=s[i],k=(Y-a.y)/((b.y-a.y)||1e-9);
 return {t:a.t+(b.t-a.t)*k,x:a.x+(b.x-a.x)*k,z:a.z+(b.z-a.z)*k};}return null;}
/** The sideways bend: how far the ball ends from the straight line of its aim when it reaches y = Y (+ = bent right). */
export function bendAt(f:Flight,Y:number,aimDeg:number){const c=crossing(f,Y);return c?c.x-Math.tan(aimDeg*Math.PI/180)*Y:null;}
/** The knuckle sway: how many times the sideways drift changes direction (a smooth curve: 0 or 1). */
export function swayTurns(f:Flight){let turns=0,last=0;const s=f.samples;
 for(let i=2;i<s.length;i++){const ax=(s[i].x-2*s[i-1].x+s[i-2].x);const sg=Math.abs(ax)<1e-7?0:Math.sign(ax);if(sg&&last&&sg!==last)turns++;if(sg)last=sg;}return turns;}
export const apex=(f:Flight)=>Math.max(...f.samples.map(p=>p.z));

// ── The challenges ────────────────────────────────────────────────────────────────────────────────────────────────────────
export const GOAL_W=7.32,POST=GOAL_W/2,BAR=2.44,WALL_TOP=1.95,PLAYER_W=.5;
export type Challenge='wall'|'cross'|'knuckle';
export type Verdict={ok:boolean;code:string};
/** 1. Around the wall: a free kick 20 m out, the wall square on the near half of the goal, a keeper guarding the other half. */
export const WALL_SET={goalY:20,goalX:1.6,wall:{y:9.15,x0:-1.2,x1:.8},keeper:{x:3.4,reach:1.8}} as const;
/** 2. The curling cross: from the right wing, past a defender, onto a team-mate's head in the box. */
export const CROSS_SET={mate:{x:-15,y:17},defender:{x:-6.6,y:7.5},catchR:1.6,headTop:2.4,blockR:.8,blockTop:2.6} as const;
/** 3. The knuckleball: a hard, spinless shot on target from 25 m, the keeper in the middle. */
export const KNUCKLE_SET={goalY:25,goalX:0,minPower:.75} as const;
export const yEndOf=(c:Challenge)=>c==='wall'?WALL_SET.goalY+.5:c==='cross'?CROSS_SET.mate.y+3:KNUCKLE_SET.goalY+.5;

export function judge(c:Challenge,s:Strike,f:Flight):Verdict{
 if(c==='wall'){const W=WALL_SET,atWall=crossing(f,W.wall.y),end=crossing(f,W.goalY);
  if(atWall&&atWall.x>W.wall.x0-R&&atWall.x<W.wall.x1+R&&atWall.z-R<WALL_TOP)return {ok:false,code:'blocked'};
  if(!end)return {ok:false,code:'short'};
  const gx=end.x-W.goalX;
  if(Math.abs(gx)>POST)return {ok:false,code:'wide'};
  if(end.z>BAR)return {ok:false,code:'over'};
  // a slow ball gives the keeper time to get across
  if(Math.abs(end.x-W.keeper.x)<=W.keeper.reach+Math.max(0,end.t-1.2)*2.5)return {ok:false,code:'saved'};
  return {ok:true,code:'goal'};}
 if(c==='cross'){const C=CROSS_SET;
  // the defender: the ball passes him low enough for a head or a boot
  for(const p of f.samples)if(Math.hypot(p.x-C.defender.x,p.y-C.defender.y)<C.blockR&&p.z<C.blockTop)return {ok:false,code:'cut-out'};
  let best=Infinity,bz=0;for(const p of f.samples){const d=Math.hypot(p.x-C.mate.x,p.y-C.mate.y);if(d<best){best=d;bz=p.z;}}
  if(best<=C.catchR&&bz<=C.headTop)return {ok:true,code:'met'};
  if(best<=C.catchR)return {ok:false,code:'too-high'};
  return {ok:false,code:'missed'};}
 const K=KNUCKLE_SET,end=crossing(f,K.goalY);
 if(s.power<K.minPower)return {ok:false,code:'soft'};
 if(!end)return {ok:false,code:'short'};
 if(Math.abs(end.x-K.goalX)>POST)return {ok:false,code:'wide'};
 if(end.z>BAR)return {ok:false,code:'over'};
 if(!f.knuckle)return {ok:false,code:'spin'};
 return {ok:true,code:'knuckle'};
}

// ── The wind tunnel (Fig. 1): a ball on a spindle in a clear tunnel, air blowing past it ──────────────────────────────────
/**
 * The tunnel is a top-down 2D flow past the ball, in the tunnel's own frame: x along the air (it blows +x), y across.
 * `spin` −1…1: + means the ball's surface on the +y side moves WITH the air (and on the −y side against it). That side's air
 * is sped up, its pressure drops, and the ball is pushed towards +y; the air leaving the ball is thrown the other way (−y).
 * (Stated by which side moves with the air, so it is true seen from above or below, in a mirror or not.)
 * The smoke lines are streamlines of a simple TEACHING MODEL: ideal flow round a circle with circulation (the spin drags the air
 * round), plus a wake bent to the side the air is thrown. The push is the textbook estimate F ≈ ½·ρ·A·U·r·ω (lift coefficient ≈
 * spin ratio r·ω/U for slow spins), labelled as an estimate.
 */
export const WIND_MAX=30,SPIN_MAX=10;// m/s; turns per second
export const windOf=(fan:number)=>WIND_MAX*clamp(fan,0,1);
export const spinRateOf=(spin:number)=>SPIN_MAX*clamp(spin,-1,1);// turns/s, signed
/** The sideways push (newtons, signed: + = towards +y) on a real ball (r 0.11 m) in a wind U (m/s) spinning n turns a second. */
export function magnus(U:number,turns:number){const w=turns*2*Math.PI;return .5*1.2*AREA*U*R*w;}
export const WEIGHT=MASS*G;// the ball's weight, newtons (about 4.2 N)
/** How strongly the drawn flow turns round the ball (the circulation, as a share of the most a smooth model allows). */
export function circulation(U:number,turns:number){if(U<.5)return 0;const S=R*Math.abs(turns)*2*Math.PI/U;return Math.sign(turns)*Math.min(.62,S*2);}
/** The air's velocity at (x, y) round a ball of radius a centred at the origin, in a wind U, with circulation share g. */
export function flowAt(x:number,y:number,a:number,U:number,g:number){
 const r2=Math.max(x*x+y*y,a*a*1.0001),r4=r2*r2,gam=2*g*U*a;
 let u=U*(1-a*a*(x*x-y*y)/r4)+gam*y/r2,v=-U*2*a*a*x*y/r4-gam*x/r2;
 // the wake: behind the ball the air keeps the sideways throw it was given (to −y for g > 0)
 if(x>0){const ramp=Math.min(1,x/(3*a)),ramp2=ramp*ramp*(3-2*ramp);v+=-g*U*.55*ramp2*Math.exp(-(y*y)/(2.6*a)**2);}
 return [u,v];
}
/** Smoke lines: streamlines from a rake of nozzles at x0, traced to x1 (step ds). Pure and repeatable. */
export function smokeLines({a,U,g,x0,x1,ys,ds=1.6}:{a:number;U:number;g:number;x0:number;x1:number;ys:readonly number[];ds?:number}){
 return ys.map(y0=>{const pts:[number,number][]=[[x0,y0]];let x=x0,y=y0;
  for(let i=0;i<600&&x<x1;i++){const [u,v]=flowAt(x,y,a,Math.max(U,1e-6),g),l=Math.hypot(u,v)||1;
   // midpoint step (RK2): smooth lines that never cut into the ball
   const mx=x+u/l*ds/2,my=y+v/l*ds/2,[u2,v2]=flowAt(mx,my,a,Math.max(U,1e-6),g),l2=Math.hypot(u2,v2)||1;x+=u2/l2*ds;y+=v2/l2*ds;
   const r=Math.hypot(x,y);if(r<a*1.04){x=x/r*a*1.04;y=y/r*a*1.04;}
   pts.push([x,y]);}
  return pts;});
}
