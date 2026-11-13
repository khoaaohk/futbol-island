// DRIP FC Stadium flight bumps (Nov 13 2026, owner: flew straight through a floodlight mast and its head panel). A flyer (jetpack
// cruise, glides, dashes, parachute) now bumps off the stadium's tall pieces instead of passing through: the floodlight masts and
// heads, the roofs (slab, fascia and front frames, posts), the big screen and its posts, the stands' back walls, the gate arch,
// pillars and sign, and the plaza flag poles and cloths. The bump reuses the friend-bump flyer reaction (friendBump.ts: the
// spin-away tumble, drift back and bob, cosmetic only, on the drawn frame) plus a real knock-back: the step is pushed out of the
// solid and the velocity reflected away from it, which the jetpack's own acceleration then eases back into the stick.
// Pure data + math (no three.js). Heat: the colliders are built once (about 70 boxes and upright cylinders); a frame away from the
// stadium costs one rectangle test, near it one squared-distance reject per solid; no allocation per frame (one reused contact).
// Walking never calls this: only the flight branches in Town.tsx do.
import {STANDS,ROOF,FRONT_FRAME,ROOF_OVERHANG,FRAME_PROUD,FASCIA_PROUD,MASTS,SCREEN,GATE_ARCH_X,CONCOURSE_HEIGHT,ROWS,ROW_DEPTH,rowHeight,standBack,standRect,standSpans,standWorld,plazaFlagPoles} from './stadiumSeats';
import {STADIUM,STADIUM_GATE} from './westParkLayout';
import {createBumpReact,createBumpPose,startBump,stepBump,bumpPose,type BumpReact,type BumpPose} from './friendBump';
import {Mode} from '../../multiplayer/protocol/types';

export type FlightSolidKind='mast'|'head'|'roof'|'fascia'|'roofPost'|'screen'|'screenPost'|'stand'|'standEnd'|'gate'|'sign'|'flag';
/** A solid: an oriented box (half sizes hw along (c, s), hd along (−s, c)) or, `round`, an upright cylinder of radius hw. y0..y1 world. */
export type FlightSolid={kind:FlightSolidKind;x:number;z:number;hw:number;hd:number;c:number;s:number;y0:number;y1:number;round:boolean;flag:number;reach:number};
/** The flyer's body: radius and height above the feet (flight.height is the feet). */
export const FLIGHT_BODY={r:.6,h:1.8} as const;
/** The knock-back: the outward speed a fresh bump leaves (m/s, at least), the share of the inward speed bounced back, the spin
 *  reaction's re-arm (s: holding the stick into a mast slides along it without spinning every frame), sweep step (m). */
export const FLIGHT_BUMP={minOut:8,restitution:.55,rearm:.9,step:.35} as const;
/** The auto-land glide (Town's "glide to the landing spot", Nov 13 2026): a solid whose top is at most `hop` m above the feet is
 *  climbed over at `climb` m/s (a stand's back or end wall); a taller one (a mast, the screen) is slid round. */
export const LAND_GLIDE={hop:7,climb:9} as const;

/** The stadium's flight colliders (world). Sizes follow stadiumWorld.ts / stadiumFeed.ts / plazaFlags.ts (checked by tests). */
export function stadiumFlightSolids():FlightSolid[]{
 const out:FlightSolid[]=[];
 const box=(kind:FlightSolidKind,x:number,z:number,w:number,d:number,y0:number,y1:number,yaw=0,flag=-1)=>{
  const hw=w/2,hd=d/2;out.push({kind,x,z,hw,hd,c:Math.cos(yaw),s:-Math.sin(yaw),y0,y1,round:false,flag,reach:Math.hypot(hw,hd)});};
 const rect=(kind:FlightSolidKind,r:{x:number;z:number;w:number;d:number},y0:number,y1:number)=>box(kind,r.x,r.z,r.w,r.d,y0,y1);
 const pole=(kind:FlightSolidKind,x:number,z:number,r:number,y0:number,y1:number,flag=-1)=>out.push({kind,x,z,hw:r,hd:r,c:1,s:0,y0,y1,round:true,flag,reach:r});
 // Floodlight masts (r .45, 30 m) and their heads (lamp 6 × 3.4 × .5 and frame 6.4 × 3.8 × .3, 0.2 m behind it, at 30.5 m).
 for(const m of MASTS){const yaw=Math.atan2(-m.sx,-m.sz),fx=Math.sin(yaw),fz=Math.cos(yaw);pole('mast',m.x,m.z,.45,0,30);
  box('head',m.x+fx*.09,m.z+fz*.09,6.4,.7,30.5-1.9,30.5+1.9,yaw);}
 // Roofs: the slab, the back fascia frame with its banner, the front frame, the posts behind the concourse.
 for(const s of STANDS.filter(q=>q.roof)){const a0=s.from-ROOF_OVERHANG,a1=s.to+ROOF_OVERHANG,P=FRAME_PROUD;
  rect('roof',standRect(s,ROOF.front,ROOF.back,a0,a1),ROOF.y-ROOF.thick/2,ROOF.y+ROOF.thick/2);
  rect('fascia',standRect(s,ROOF.back-.12,ROOF.back+P+FASCIA_PROUD,a0-P,a1+P),ROOF.y-ROOF.frameBelow,ROOF.y+ROOF.frameAbove);
  rect('roof',standRect(s,ROOF.front-P,ROOF.front+.12,a0-P,a1+P),ROOF.y-FRONT_FRAME.below,ROOF.y+FRONT_FRAME.above);
  for(const a of [-50,-38,-12,12,38,50]){const p=standWorld(s,standBack(s)+.35,a);pole('roofPost',p.x,p.z,.28,0,ROOF.y);}}
 // The big screen: its frame (screen + 1 m, 0.5 m deep) and the two posts under it (stadiumWorld.ts screenPosts / SCREEN_POST).
 {const z=STADIUM.z+SCREEN.z,fw=SCREEN.w+1,fh=SCREEN.h+1;box('screen',STADIUM.x,z,fw,.5,SCREEN.y-fh/2,SCREEN.y+fh/2);
  for(const sx of [-1,1])pole('screenPost',STADIUM.x+sx*(SCREEN.w/2-1.5),z,.22,0,SCREEN.y-fh/2);}
 // The stands' back walls up to the concourse (the face the park and the plaza see). The rows and the concourse are landable floors,
 // so the wall stops at the concourse floor: a parachute settling by the back rail is never pushed off it.
 for(const s of STANDS){const back=standBack(s);for(const [a0,a1] of standSpans(s).pieces)rect('stand',standRect(s,back-.16,back,a0,a1),0,CONCOURSE_HEIGHT);}
 // Nov 13 2026: the stands' short END walls (every piece's two ends: the open corners, and the east stand's gate passage), 0.16 m
 // thick like the back wall. Stepped with the rows (two rows a box, up to the lower row's top, then the concourse), so every row
 // stays a landable floor: a flyer over a row is never blocked, and the last half-metre step is the floor the flight already rides.
 for(const s of STANDS){const back=standBack(s),rowsEnd=s.inner+ROWS*ROW_DEPTH;
  for(const [a0,a1] of standSpans(s).pieces)for(const [e0,e1] of [[a0,a0+.16],[a1-.16,a1]] as const){
   for(let i=0;i<ROWS;i+=2)rect('standEnd',standRect(s,s.inner+i*ROW_DEPTH,s.inner+Math.min(ROWS,i+2)*ROW_DEPTH,e0,e1),0,rowHeight(i));
   rect('standEnd',standRect(s,rowsEnd,back,e0,e1),0,CONCOURSE_HEIGHT);}}
 // The gate: two 1.6 m pillars (11 m), the arch beam (1.4 × 2.4 at 9.4 m) and the sign standing on it (13 × 2.2 m, 0.72 m east).
 {const G=STADIUM_GATE,gx=GATE_ARCH_X;for(const sz of [-1,1])box('gate',gx,G.z+sz*(G.halfWidth+.4),1.6,1.6,0,11);
  box('gate',gx,G.z,1.4,G.halfWidth*2+3.2,8.2,10.6);box('sign',gx+.72,G.z,.3,G.halfWidth*2-1,10.6,10.7+2.2);}
 // Plaza flags (plazaFlags.ts FLAG): the pole and finial (7.32 m), and the cloth (1.9 × 1.15 m at 6.4 m, east of the pole).
 plazaFlagPoles().forEach((p,k)=>{pole('flag',p.x,p.z,.14,0,7.32,k);box('flag',p.x+.06+.95,p.z,1.9,.3,6.4-.6,6.4+.6,0,k);});
 return out;
}

/** The world rectangle every collider sits in (+ the body), and the highest top: one test a frame decides "nowhere near". */
function boundsOf(solids:readonly FlightSolid[]){
 let x0=Infinity,x1=-Infinity,z0=Infinity,z1=-Infinity,top=-Infinity;
 for(const q of solids){x0=Math.min(x0,q.x-q.reach);x1=Math.max(x1,q.x+q.reach);z0=Math.min(z0,q.z-q.reach);z1=Math.max(z1,q.z+q.reach);top=Math.max(top,q.y1);}
 const m=FLIGHT_BODY.r+.5;return {x0:x0-m,x1:x1+m,z0:z0-m,z1:z1+m,top};
}

export type FlightContact={solid:FlightSolid|null;nx:number;nz:number;depth:number};
export type StadiumFlight=ReturnType<typeof createStadiumFlight>;
export function createStadiumFlight(solids:readonly FlightSolid[]=stadiumFlightSolids()){
 const b=boundsOf(solids),R=FLIGHT_BODY.r,contact:FlightContact={solid:null,nx:0,nz:0,depth:0};
 const react:BumpReact=createBumpReact(),pose:BumpPose&{on:boolean;nx:number;nz:number}={...createBumpPose(),on:false,nx:0,nz:1};
 let cool=0;const stats={tests:0,bumps:0,slides:0},lastResult:{contact:FlightContact|null;fresh:boolean}={contact:null,fresh:false},held:{solid:FlightSolid|null;nx:number;nz:number}={solid:null,nx:0,nz:0};
 const near=(x:number,z:number,y:number)=>y<b.top&&x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1;
 /** The deepest solid the body at (x, feet y, z) overlaps, into `contact` (normal = out of the solid, world XZ); false when clear. */
 function test(x:number,z:number,y:number){
  contact.solid=null;contact.depth=0;if(!near(x,z,y))return false;stats.tests++;
  for(let i=0;i<solids.length;i++){const q=solids[i];
   if(y>=q.y1-.02||y+FLIGHT_BODY.h<=q.y0)continue;
   const dx=x-q.x,dz=z-q.z,lim=q.reach+R;if(dx>lim||dx<-lim||dz>lim||dz<-lim)continue;
   let nx=0,nz=0,depth=0;
   if(q.round){const d2=dx*dx+dz*dz,r=q.hw+R;if(d2>=r*r)continue;const d=Math.sqrt(d2);depth=r-d;if(d>1e-6){nx=dx/d;nz=dz/d;}else{nx=1;nz=0;}}
   else{const lx=dx*q.c+dz*q.s,lz=-dx*q.s+dz*q.c,cx=Math.max(-q.hw,Math.min(q.hw,lx)),cz=Math.max(-q.hd,Math.min(q.hd,lz)),ex=lx-cx,ez=lz-cz,d2=ex*ex+ez*ez;
    if(d2>=R*R)continue;let ux=0,uz=0;
    if(d2>1e-12){const d=Math.sqrt(d2);ux=ex/d;uz=ez/d;depth=R-d;}
    else{const px=q.hw-Math.abs(lx),pz=q.hd-Math.abs(lz);if(px<pz){ux=lx<0?-1:1;depth=px+R;}else{uz=lz<0?-1:1;depth=pz+R;}}
    nx=ux*q.c-uz*q.s;nz=ux*q.s+uz*q.c;}
   if(depth>contact.depth){contact.solid=q;contact.nx=nx;contact.nz=nz;contact.depth=depth;}
  }
  return contact.solid!==null;
 }
 const api={
  solids,bounds:b,contact,react,pose,stats,near,test,
  /** For jet actions' step tests (dash, glide, parachute): is the body at (x, z) with feet at y inside a stadium solid? */
  solid(x:number,z:number,y:number){if(!test(x,z,y))return false;held.solid=contact.solid;held.nx=contact.nx;held.nz=contact.nz;return true;},
  /** After a jet action whose step `solid` refused: the knock reaction off that solid (once per re-arm). True when it started. */
  knock(reduced=false){const q=held.solid;held.solid=null;if(!q||cool>0)return false;
   contact.solid=q;contact.nx=held.nx;contact.nz=held.nz;contact.depth=0;cool=FLIGHT_BUMP.rearm;stats.bumps++;
   startBump(react,Mode.Jetpack,held.nx,held.nz,1,1);if(reduced)react.on=false;return true;},
  /**
   * After a flight step from (ox, oz) to p (feet y): sweeps the step (no tunnelling through a 0.9 m mast after a long frame), stops
   * at the first contact, pushes the body out along the normal and reflects `v` (m/s) away from the solid. A fresh bump (re-armed)
   * leaves at least FLIGHT_BUMP.minOut outward and starts the flyer spin reaction; a held push just slides. Returns the contact
   * (shared; null when clear) and whether it was a fresh bump.
   */
  resolve(p:{x:number;z:number},ox:number,oz:number,y:number,v:{x:number;z:number}|null,reduced=false):{contact:FlightContact|null;fresh:boolean}{
   if(!near(p.x,p.z,y)&&!near(ox,oz,y))return NONE;
   const dx=p.x-ox,dz=p.z-oz,n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/FLIGHT_BUMP.step));let hit=false;
   for(let i=1;i<=n;i++){const x=ox+dx*i/n,z=oz+dz*i/n;if(test(x,z,y)){p.x=x;p.z=z;hit=true;break;}}
   if(!hit)return NONE;
   const nx=contact.nx,nz=contact.nz,first=contact.solid;
   // Out of every solid it touches (a few passes: a mast's foot beside a roof post).
   for(let k=0;k<3&&test(p.x,p.z,y);k++){p.x+=contact.nx*(contact.depth+.02);p.z+=contact.nz*(contact.depth+.02);}
   contact.solid=first;contact.nx=nx;contact.nz=nz;
   const fresh=cool<=0;
   if(v){const vn=v.x*nx+v.z*nz;
    if(vn<0){const back=-vn*(fresh?1+FLIGHT_BUMP.restitution:1);v.x+=nx*back;v.z+=nz*back;}
    if(fresh){const out=v.x*nx+v.z*nz;if(out<FLIGHT_BUMP.minOut){v.x+=nx*(FLIGHT_BUMP.minOut-out);v.z+=nz*(FLIGHT_BUMP.minOut-out);}}}
   if(fresh){cool=FLIGHT_BUMP.rearm;stats.bumps++;const side=v&&(v.x*-nz+v.z*nx)<0?-1:1;startBump(react,Mode.Jetpack,nx,nz,side,1);if(reduced)react.on=false;}
   else stats.slides++;
   lastResult.contact=contact;lastResult.fresh=fresh;return lastResult;
  },
  /**
   * The auto-land glide's step (Town.tsx: after choosing to land, the flyer glides to rooftop.findLanding's spot): from p toward
   * `target` by `step` m at feet height y, through the same sweep as free flight. On a solid it stops at the face; a low one
   * (top ≤ LAND_GLIDE.hop m above the feet) asks to climb (`lift`, m/s), a tall one is slid round (the rest of the step along its
   * face, toward the target's side). `fresh` = a new bump (Town plays the bump feedback). p is moved in place.
   */
  glide(p:{x:number;z:number},target:{x:number;z:number},y:number,step:number,reduced=false):{hit:boolean;fresh:boolean;lift:number}{
   const dx=target.x-p.x,dz=target.z-p.z,d=Math.hypot(dx,dz);if(d<1e-6)return {hit:false,fresh:false,lift:0};
   const ux=dx/d,uz=dz/d,s=Math.min(step,d),ox=p.x,oz=p.z;p.x+=ux*s;p.z+=uz*s;
   const r=api.resolve(p,ox,oz,y,null,reduced);if(!r.contact)return {hit:false,fresh:false,lift:0};
   const q=r.contact.solid,fresh=r.fresh,nx=r.contact.nx,nz=r.contact.nz;
   if(q&&q.y1-y<=LAND_GLIDE.hop)return {hit:true,fresh,lift:LAND_GLIDE.climb};
   // Slide round: the step's remainder along the face (the tangent nearer the target; head-on, a fixed side).
   const rest=Math.max(0,s-Math.hypot(p.x-ox,p.z-oz)),tx=-nz,tz=nx,side=ux*tx+uz*tz<0?-1:1,sx=p.x,sz=p.z;
   p.x+=tx*side*Math.max(rest,s*.5);p.z+=tz*side*Math.max(rest,s*.5);api.resolve(p,sx,sz,y,null,reduced);
   return {hit:true,fresh,lift:0};
  },
  /** Each frame (also on foot, so a reaction never freezes mid-spin): ages the reaction and writes the drawn overlay into `pose`. */
  update(dt:number,reduced=false){cool=Math.max(0,cool-dt);stepBump(react,dt);bumpPose(react,reduced,pose);pose.on=react.on&&!reduced;pose.nx=react.nx;pose.nz=react.nz;},
  reset(){cool=0;react.on=false;pose.on=false;held.solid=null;},
 };
 return api;
}
const NONE={contact:null,fresh:false} as const;
