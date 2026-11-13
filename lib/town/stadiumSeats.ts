// West Stadium, phase 2 (Nov 12 2026, docs/stadium/PLAN.md): the stands as pure data (no three.js), shared by the 3D build
// (stadiumWorld.ts), the sit runtime (stadiumSit.ts), the map and the tests.
//
// Four stands with open corners. Each stand climbs away from the pitch in ROWS stepped rows (RISE m up, ROW_DEPTH m deep); a row
// is taller than the walk's usual 0.35 m step, but rows carry stepUp (ROW_STEP_UP) so a walker steps up a row from anywhere
// (rides do not); the AISLES (AISLE_WIDTH 2.2 m, Nov 12 2026: was 1.4) are the easy way: two treads per row (TREAD_RISE each). A CONCOURSE runs behind the top row, one tread up from it (step on anywhere), with a rail
// along its back except where a back STAIR goes straight down to the ground (each stand's entrances from outside). Rails close
// the stand ends and the stair sides (roof props: they block only a walker up at their height). The east stand is split by the
// main gate: a ground-level gap from the plaza onto the pitch-level ring round the boards. The corners are open (pitch-side gaps).
// Rows, treads and the concourse are walk surfaces (a box from the ground up to its height: nothing to fall through); the seats
// are a grid computed on demand (no per-seat objects): nearestSeat() snaps to one, facing the pitch.
import {STADIUM,STADIUM_GATE,STADIUM_PLAZA} from './westParkLayout';
import type {SponsorLayout,SponsorQuad} from '../stadium/sponsors/layout';

export const ROWS=10,ROW_DEPTH=1.3,RISE=.5,TREAD_RISE=.25,TREAD=.35,CONCOURSE=4,STAIR_WIDTH=3,AISLE_WIDTH=2.2,SEAT_PITCH=.6;
/** Seat centre from the row's front edge (m), and the sitter's root (BENCH.rootZ = .05 in front of the seat centre). */
export const SEAT_DEPTH=.95,SEAT_ROOT=.9;
/** Seat top above its row (npcSeatPose BENCH.seatTop: the seated pose's bottom rests here). */
export const SEAT_TOP=.64;
export const rowHeight=(i:number)=>RISE*(i+1);
export const CONCOURSE_HEIGHT=rowHeight(ROWS-1)+TREAD_RISE;
/** Back-stair treads from the concourse to the ground (the last one TREAD_RISE above the grass). */
export const STAIR_TREADS=Math.round(CONCOURSE_HEIGHT/TREAD_RISE)-1;
export const RAIL_TOP=1.1;

export type StandId='west'|'east'|'north'|'south';
/** axis: the stand's depth runs along world x ('x': the long side stands) or z (the ends); out: +1 / -1 away from the centre.
 *  inner: centre to the front row (m); along: the stand's span across (local metres from the centre); aisles / stairs: centres. */
export type StandDef={id:StandId;axis:'x'|'z';out:1|-1;inner:number;from:number;to:number;aisles:readonly number[];stairs:readonly number[];gap?:readonly [number,number];team:readonly [string,string];roof:boolean};
const GATE=STADIUM_GATE.halfWidth;
export const STANDS:readonly StandDef[]=[
 {id:'west',axis:'x',out:-1,inner:40,from:-52,to:52,aisles:[-39,-13,13,39],stairs:[-26,26],team:['#2f6fb5','#e9eef5'],roof:true},
 {id:'east',axis:'x',out:1,inner:40,from:-52,to:52,aisles:[-39,-21,21,39],stairs:[-31,31],gap:[-GATE,GATE],team:['#d6453d','#f4f1e6'],roof:true},
 {id:'north',axis:'z',out:-1,inner:57.5,from:-36,to:36,aisles:[-22,0,22],stairs:[-12,12],team:['#f2c230','#2f6fb5'],roof:false},
 {id:'south',axis:'z',out:1,inner:57.5,from:-36,to:36,aisles:[-22,0,22],stairs:[-24,24],team:['#2f9a5a','#f4f1e6'],roof:false},
];
export const standBack=(s:StandDef)=>s.inner+ROWS*ROW_DEPTH+CONCOURSE;
export const stairEnd=(s:StandDef)=>standBack(s)+STAIR_TREADS*TREAD;

export type Rect={x:number;z:number;w:number;d:number};
export type Surface=Rect&{height:number;stepAccess?:boolean;stepUp?:number};
/** A walker steps up a row (RISE) from anywhere (Nov 12 2026, QA: an off-angle joystick caught the row edge beside an aisle). */
export const ROW_STEP_UP=RISE+.05;
export type Rail=Rect&{floor:number;top:number};
/** A stand-local rectangle (depth d0..d1 out from the centre, along a0..a1) in world coordinates. */
export function standRect(s:StandDef,d0:number,d1:number,a0:number,a1:number):Rect{
 const dc=(d0+d1)/2*s.out,ac=(a0+a1)/2,dw=Math.abs(d1-d0),aw=Math.abs(a1-a0);
 return s.axis==='x'?{x:STADIUM.x+dc,z:STADIUM.z+ac,w:dw,d:aw}:{x:STADIUM.x+ac,z:STADIUM.z+dc,w:aw,d:dw};
}
/** World → stand-local (depth out from the centre, along). */
export function standLocal(s:StandDef,x:number,z:number){const dx=x-STADIUM.x,dz=z-STADIUM.z;return s.axis==='x'?{d:dx*s.out,a:dz}:{d:dz*s.out,a:dx};}
export function standWorld(s:StandDef,d:number,a:number){return s.axis==='x'?{x:STADIUM.x+d*s.out,z:STADIUM.z+a}:{x:STADIUM.x+a,z:STADIUM.z+d*s.out};}
/** The direction a seated fan faces (towards the pitch) as a yaw (forward = (sin yaw, cos yaw), the player's convention). */
export const standYaw=(s:StandDef)=>s.axis==='x'?Math.atan2(-s.out,0):Math.atan2(0,-s.out);

/** The along-spans with seats (between the aisles and the gate gap) and the aisle spans. */
export function standSpans(s:StandDef){
 const cuts:[number,number][]=s.aisles.map(a=>[a-AISLE_WIDTH/2,a+AISLE_WIDTH/2]);if(s.gap)cuts.push([s.gap[0],s.gap[1]]);cuts.sort((p,q)=>p[0]-q[0]);
 const seats:[number,number][]=[];let at=s.from;for(const [a,b] of cuts){if(a>at)seats.push([at,a]);at=Math.max(at,b);}if(s.to>at)seats.push([at,s.to]);
 const aisles:[number,number][]=s.aisles.map(a=>[a-AISLE_WIDTH/2,a+AISLE_WIDTH/2]);
 // The concourse and the end rails follow the stand's pieces (two halves round the gate).
 const pieces:[number,number][]=s.gap?[[s.from,s.gap[0]],[s.gap[1],s.to]]:[[s.from,s.to]];
 return {seats,aisles,pieces};
}

export type StandGeometry={surfaces:Surface[];rails:Rail[];stand:StandDef};
/** Every walk surface and rail of a stand (world coordinates). */
export function standGeometry(s:StandDef):StandGeometry{
 const surfaces:Surface[]=[],rails:Rail[]=[],{seats,aisles,pieces}=standSpans(s),back=standBack(s),rowsEnd=s.inner+ROWS*ROW_DEPTH;
 for(let i=0;i<ROWS;i++){const d0=s.inner+i*ROW_DEPTH,h=rowHeight(i);
  for(const [a0,a1] of seats)surfaces.push({...standRect(s,d0,d0+ROW_DEPTH,a0,a1),height:h,stepUp:ROW_STEP_UP});
  for(const [a0,a1] of aisles){surfaces.push({...standRect(s,d0,d0+ROW_DEPTH/2,a0,a1),height:h-TREAD_RISE,stepAccess:true});surfaces.push({...standRect(s,d0+ROW_DEPTH/2,d0+ROW_DEPTH,a0,a1),height:h,stepAccess:true});}
 }
 for(const [a0,a1] of pieces)surfaces.push({...standRect(s,rowsEnd,back,a0,a1),height:CONCOURSE_HEIGHT});
 for(const c of s.stairs)for(let k=0;k<STAIR_TREADS;k++)surfaces.push({...standRect(s,back+k*TREAD,back+(k+1)*TREAD,c-STAIR_WIDTH/2,c+STAIR_WIDTH/2),height:CONCOURSE_HEIGHT-TREAD_RISE*(k+1),stepAccess:true});
 const top=CONCOURSE_HEIGHT+RAIL_TOP+.2,R=.16;
 // The concourse's back rail, open at each stair.
 for(const [p0,p1] of pieces){let at=p0;
  const openings=s.stairs.filter(c=>c>p0&&c<p1).map(c=>[c-STAIR_WIDTH/2,c+STAIR_WIDTH/2] as const);
  for(const [a,b] of openings){if(a>at)rails.push({...standRect(s,back-R,back,at,a),floor:CONCOURSE_HEIGHT-.8,top});at=b;}
  if(p1>at)rails.push({...standRect(s,back-R,back,at,p1),floor:CONCOURSE_HEIGHT-.8,top});
  // The stand's ends (row 0 is only RISE up: stepping off it there is fine).
  for(const a of [p0,p1])rails.push({...standRect(s,s.inner,back,a-(a===p0?0:R),a+(a===p0?R:0)),floor:.8,top});
 }
 for(const c of s.stairs)for(const side of [-1,1]){const a=c+side*STAIR_WIDTH/2;rails.push({...standRect(s,back,stairEnd(s),a-(side<0?R:0),a+(side>0?R:0)),floor:.8,top});}
 return {surfaces,rails,stand:s};
}
export const stadiumGeometry=()=>STANDS.map(standGeometry);

// ---- Seats --------------------------------------------------------------------------------------------------------------------
export type Seat={id:string;stand:StandId;row:number;x:number;z:number;y:number;yaw:number};
/** Seats along a span (centres, local along): SEAT_PITCH apart, centred in the span. */
export function spanSeats(a0:number,a1:number){const n=Math.max(0,Math.floor((a1-a0)/SEAT_PITCH)),start=(a0+a1)/2-(n-1)*SEAT_PITCH/2;return {n,start};}
export function seatCount(){let n=0;for(const s of STANDS){const {seats}=standSpans(s);for(const [a0,a1] of seats)n+=spanSeats(a0,a1).n*ROWS;}return n;}
/** How far (m) from a seat the "Sit" prompt shows. Polish Nov 13 2026: 2.1 (was 1.6) so the exact centre of an aisle (1.1 m to its edge + half a
 *  seat + the span's centring slack + the up-to-.9 m depth offset inside a row) always finds the row's nearest seat; the row/height gates
 *  (not this reach) keep the concourse back and the pitch ring from offering one. */
export const SIT_REACH=2.1;
/** The nearest free seat for a player at (x, z) standing at `height` (a row or an aisle tread beside it), or null. */
export function nearestSeat(x:number,z:number,height:number,occupied?:ReadonlySet<string>,reach=SIT_REACH):Seat|null{
 let best:Seat|null=null,bestD=reach;
 for(const s of STANDS){const {d,a}=standLocal(s,x,z);if(d<s.inner-.5||d>s.inner+ROWS*ROW_DEPTH+.5||a<s.from-reach||a>s.to+reach)continue;
  const i=Math.max(0,Math.min(ROWS-1,Math.floor((d-s.inner)/ROW_DEPTH))),h=rowHeight(i);
  // On this row (or an aisle tread of it, or the concourse just behind the top row).
  if(height<h-TREAD_RISE-.1||height>h+TREAD_RISE+.05)continue;
  for(const [a0,a1] of standSpans(s).seats){const {n,start}=spanSeats(a0,a1);if(!n)continue;
   const k0=Math.max(0,Math.min(n-1,Math.round((a-start)/SEAT_PITCH)));
   for(let off=0;off<8;off++)for(const k of off?[k0-off,k0+off]:[k0]){if(k<0||k>=n)continue;const sa=start+k*SEAT_PITCH,id=`${s.id}:${i}:${Math.round(sa*10)}`;if(occupied?.has(id))continue;
    const p=standWorld(s,s.inner+i*ROW_DEPTH+SEAT_ROOT,sa),dist=Math.hypot(p.x-x,p.z-z);
    if(dist<bestD){bestD=dist;best={id,stand:s.id,row:i,x:p.x,z:p.z,y:h,yaw:standYaw(s)};}}}
 }
 return best;
}
/** The stand view from a seat: the camera behind and above the sitter's head, looking at the pitch (world coordinates). */
/** The stand view from a seat. `raised` (a portrait phone, phase 3): the camera sits higher and further back (3.6 m behind, 5.5 m (phase 3b; 4 in 3a)
 *  up instead of 2.4 / 2.5) and aims a little lower (less sky on a tall screen), so the seated player's head drops below the
 *  bottom of the narrow screen (40° vertical FOV). */
export const SEAT_VIEW={back:2.4,up:2.5,raisedBack:3.6,raisedUp:5.5,lookY:.4,raisedLookY:-2} as const;
export function seatView(seat:Seat,raised=false){
 const s=STANDS.find(q=>q.id===seat.stand)!,{a}=standLocal(s,seat.x,seat.z),dIn=standLocal(s,seat.x,seat.z).d;
 const cam=standWorld(s,dIn+(raised?SEAT_VIEW.raisedBack:SEAT_VIEW.back),a),look=standWorld(s,0,a*.45);
 return {x:cam.x,y:seat.y+(raised?SEAT_VIEW.raisedUp:SEAT_VIEW.up),z:cam.z,lx:look.x,ly:raised?SEAT_VIEW.raisedLookY:SEAT_VIEW.lookY,lz:look.z};
}
/** Where the stand view looks while a match is on: mostly at the ball, a little toward the seat's own pitch point, so the framing
 *  follows play loosely (BALL_PULL of the way) and never swings right round. */
export const BALL_PULL=.7,FOLLOW_RATE=1.6;
export function followLook(base:{lx:number;lz:number},ball:{x:number;z:number}|null,out:{x:number;z:number}){
 if(!ball){out.x=base.lx;out.z=base.lz;return out;}
 out.x=base.lx+(ball.x-base.lx)*BALL_PULL;out.z=base.lz+(ball.z-base.lz)*BALL_PULL;return out;
}

/** Portrait phones (phase 3b): the seated view widens to PORTRAIT_FOV (vertical °; the island camera's 40° gives a portrait phone
 *  only ~19° across) and is framed by portraitLook so the pitch centre and the big screen both stay on screen when the stand faces
 *  them, while the look still leans toward the ball inside that window. Margins in radians. */
export const PORTRAIT_FOV=55,PORTRAIT_PULL=.6,PORTRAIT_EDGE=.035;
const wrap=(a:number)=>Math.atan2(Math.sin(a),Math.cos(a));
/** Where a portrait stand view looks (world point, 60 m out): yaw toward the ball (PORTRAIT_PULL of the way from the centre spot),
 *  clamped to the window that keeps the centre spot and the big screen in frame (the centre spot alone when both cannot fit, e.g.
 *  from the side stands); pitch puts the screen's top near the top edge, never so low that the sitter's own head shows. */
export function portraitLook(cam:{x:number;y:number;z:number},seat:{x:number;y:number;z:number},ball:{x:number;z:number}|null,aspect:number,out:{x:number;y:number;z:number},fov=PORTRAIT_FOV){
 const vh=fov*Math.PI/360,hh=Math.atan(Math.tan(vh)*aspect),E=PORTRAIT_EDGE;
 const sx=STADIUM.x,sz=STADIUM.z+SCREEN.z,ds=Math.hypot(sx-cam.x,sz-cam.z);
 const yawTo=(x:number,z:number)=>Math.atan2(x-cam.x,z-cam.z),yC=yawTo(STADIUM.x,STADIUM.z),yS=yawTo(sx,sz),sw=Math.atan(SCREEN.w/2/Math.max(1,ds));
 const ax=ball?STADIUM.x+(ball.x-STADIUM.x)*PORTRAIT_PULL:STADIUM.x,az=ball?STADIUM.z+(ball.z-STADIUM.z)*PORTRAIT_PULL:STADIUM.z;
 // The window, as offsets from the centre spot's yaw: the centre spot's own (± hh−E) ∩ the screen's (± hh−sw−E) when they meet.
 let lo=-(hh-E),hi=hh-E;const so=wrap(yS-yC),slo=so-(hh-sw-E),shi=so+(hh-sw-E);
 if(Math.max(lo,slo)<=Math.min(hi,shi)){lo=Math.max(lo,slo);hi=Math.min(hi,shi);}
 const yaw=yC+Math.max(lo,Math.min(hi,wrap(yawTo(ax,az)-yC)));
 const eTop=Math.atan2(SCREEN.y+SCREEN.h/2-cam.y,ds),eHead=Math.atan2(seat.y+1.6-cam.y,Math.max(.5,Math.hypot(seat.x-cam.x,seat.z-cam.z)));
 // The screen hangs behind the south stand: from there it is behind the sitter (|so| > 90°), so the pitch aims at the centre spot
 // instead of tilting up to a screen nobody can see (phone QA round 2: the south stand showed only sky).
 const eAim=Math.abs(so)<Math.PI/2?eTop-vh+E*2:Math.atan2(-cam.y,Math.max(1,Math.hypot(STADIUM.x-cam.x,STADIUM.z-cam.z)));
 const pitch=Math.max(eAim,eHead+vh+E);
 out.x=cam.x+Math.sin(yaw)*Math.cos(pitch)*60;out.z=cam.z+Math.cos(yaw)*Math.cos(pitch)*60;out.y=cam.y+Math.sin(pitch)*60;return out;
}

// ---- Sit / stand state machine (pure; stadiumSit.ts drives it from Town) -------------------------------------------------------
export type SitPhase='standing'|'sitting'|'seated'|'rising';
/** SIT_TIME: the ease into the seat and the stand view (s); reduced motion snaps. STAND_PUSH: stick / keys past this get up. */
export const SIT_TIME=.45,STAND_PUSH=.35;
export type SitMachine={phase:SitPhase;seat:Seat|null;blend:number};
export const createSitMachine=():SitMachine=>({phase:'standing',seat:null,blend:0});
export function sitDown(m:SitMachine,seat:Seat,reduced:boolean){if(m.phase==='seated'||m.phase==='sitting')return false;m.seat=seat;m.phase=reduced?'seated':'sitting';if(reduced)m.blend=1;return true;}
export function standUp(m:SitMachine,reduced:boolean){if(m.phase==='standing'||m.phase==='rising')return false;m.phase=reduced?'standing':'rising';if(reduced){m.blend=0;m.seat=null;}return true;}
/** One tick. push: stick / keys magnitude; walk: on foot (any ride, flight or teleport gets up); away: the player is no longer at
 *  the seat (moved by something else). Returns true while the player is held in the seat. */
export function stepSit(m:SitMachine,dt:number,o:{push:number;walk:boolean;away:boolean;reduced:boolean}){
 if((m.phase==='sitting'||m.phase==='seated')&&(o.push>STAND_PUSH||!o.walk||o.away))standUp(m,o.reduced);
 if(m.phase==='sitting'){m.blend=o.reduced?1:Math.min(1,m.blend+dt/SIT_TIME);if(m.blend>=1)m.phase='seated';}
 else if(m.phase==='rising'){m.blend=o.reduced?0:Math.max(0,m.blend-dt/SIT_TIME);if(m.blend<=0){m.phase='standing';m.seat=null;}}
 return m.phase==='sitting'||m.phase==='seated';
}

// ---- Gate and sponsor layout -----------------------------------------------------------------------------------------------------
/** Through the gate: inside the east stand's gap, past the gate arch, before the pitch-level ring. */
export const GATE_ARCH_X=STADIUM.x+standBack(STANDS[1])+3.5;
export const inGate=(x:number,z:number)=>Math.abs(z-STADIUM_GATE.z)<GATE&&x<GATE_ARCH_X-.5&&x>STADIUM.x+STANDS[1].inner;
export const SCREEN={z:standBack(STANDS[3])+1.2,y:12.6,w:16,h:9} as const;
/** The long stands' roofs. front 44.5 (Nov 12 2026, was 37, over the boards): the roof covers rows 4–9 and the concourse, so the
 *  follow camera (above and south-east of the player) sees the whole pitch past the east roof's front edge. */
export const ROOF={front:44.5,back:standBack(STANDS[0])+.6,y:12.4,thick:.45,frameBelow:.95,frameAbove:.75} as const;
/** A roof's slab with its fascia frames (world box, the roof fade's occluder); `along` is the slab's overhang past the stand ends. */
export const ROOF_OVERHANG=2;
export function roofBox(s:StandDef){return {...standRect(s,ROOF.front,ROOF.back,s.from-ROOF_OVERHANG,s.to+ROOF_OVERHANG),floor:ROOF.y-ROOF.frameBelow,top:ROOF.y+ROOF.frameAbove};}
/** The sponsor layout matching this geometry (stadium-local: origin on the centre spot, +X east, +Z south). */
/** The plaza's 14 flag poles (westPark.ts places them with this same rule). */
export function plazaFlagPoles(){const P=STADIUM_PLAZA,pcz=(P.minZ+P.maxZ)/2,out:{x:number;z:number}[]=[];
 for(const side of [-1,1])for(let i=0;i<7;i++)out.push({x:P.minX+6+i*12,z:pcz+side*(P.maxZ-P.minZ)/2+side*.8});return out;}
export function stadiumSponsorLayout(plazaFlags:readonly {x:number;z:number}[]=plazaFlagPoles()):SponsorLayout{
 const boards:SponsorQuad[]=[],H=.92,y=H/2,E=Math.PI/2;
 for(let i=0;i<4;i++)boards.push({x:-35.5,y,z:-37.5+i*25,w:22,h:H,yaw:E});
 for(let i=0;i<4;i++)boards.push({x:-22.5+i*15,y,z:54,w:14,h:H,yaw:Math.PI});
 for(let i=0;i<4;i++)boards.push({x:35.5,y,z:37.5-i*25,w:22,h:H,yaw:-E});
 for(let i=0;i<4;i++)boards.push({x:22.5-i*15,y,z:-54,w:14,h:H,yaw:0});
 const fy=ROOF.y-.1,fx=ROOF.back+.05;
 return {
  boards,
  screen:{x:0,y:SCREEN.y,z:SCREEN.z-.32,w:SCREEN.w,h:SCREEN.h,yaw:Math.PI},
  gate:{x:GATE_ARCH_X-STADIUM.x+.76,y:9.4,z:0,w:12,h:2,yaw:E},
  fascia:[{x:-fx,y:fy,z:0,w:100,h:1.6,yaw:-E},{x:fx,y:fy,z:0,w:100,h:1.6,yaw:E}],
  // A vertical banner under each plaza flag (the flag itself keeps its team colour).
  flags:plazaFlags.map(f=>({x:f.x-STADIUM.x+.62,y:4.6,z:f.z-STADIUM.z,w:1,h:1.8,yaw:0})),
  centre:{x:0,z:0,r:4.6},
 };
}
/** Board colliders (world): each board of the ring as a thin box; the 1–3 m gaps between boards stay open. */
export function boardColliders(l:SponsorLayout):Rect[]{return l.boards.map(b=>{const side=Math.abs(Math.sin(b.yaw))>.5;return side?{x:STADIUM.x+b.x,z:STADIUM.z+b.z,w:.3,d:b.w}:{x:STADIUM.x+b.x,z:STADIUM.z+b.z,w:b.w,d:.3};});}
/** Floodlight masts at the four open corners (world). */
export const MASTS=[[-1,-1],[1,-1],[-1,1],[1,1]].map(([sx,sz])=>({x:STADIUM.x+sx*51,z:STADIUM.z+sz*67,sx,sz}));
