// Rides on the island friends (water phase P1b, Oct 15 2026; user: "when near a manta ray or whale shark, have a btn that comes up
// to say hang on, on click the drag the character through the water faster"; docs/swimming-research.md §2.6 and "P1b implemented").
//
// Pure (no three.js, no DOM): a swimmer within RIDE_RANGE of a manta (any manta loop: lib/town/mantaLoops.ts) or Summit Isle's
// whale shark (summitSeaLife.ts WHALE_SHARK_LOOP) sees a floating "Hang on!" prompt over the animal; a tap grabs on and the animal
// drags the swimmer along its own loop at RIDE_MULT × the sprint swim (SWIM_FAST_SPEED), the body rolling with its turns. The
// ride is FREE-STEERED (Oct 19 2026, user: "allow controlling where they go like the truck"): the stick (the same camera-relative
// vector and mobile joystick the truck reads) turns the animal at a limited rate, it cruises at the ride speed (RIDE_IDLE of it with the
// stick released), stops short of land / the swim range edge, and the ride ends on "Let go", on reaching the shore, or at RIDE_MAX_TIME
// (the heat rule: nothing runs on). The animal then swims back to its loop (nearest point, pure pursuit, settled by a short bend blend:
// no pop); either way the swimmer is left treading
// water where it ended. These are "island friends" (user decision): never hooked by fishing, never paid or sold; the catalogue's
// whale shark (lib/town/fishing) is a different animal.
// Football (AGENTS.md): RIDE_LESSON, once per device: moving with the play is faster than against it.
//
// The animals keep their own meshes (lib/graphics/cayMantas.ts: the manta is held on its existing 1-instance surfacing mesh;
// lib/graphics/whaleShark.ts: the same one mesh). Each exposes its loops as RideFriend records; while one is ridden, this module
// owns its position along the loop (`u`, metres) and the graphics only place the mesh there, so the rider and the animal never
// drift apart. Heat: `scan` (the prompt's proximity test) runs at the water probe's rate (WATER_PROBE_HZ) and only while
// swimming; `step` is a few scalars per frame and only while riding; `dartStep` likewise, only for the DART_TIME s after one. No allocation after creation, no timer, no loop of its own.
import {SWIM_FAST_SPEED,WATER_PROBE_HZ} from './waterDepth';

export type RideKind='manta'|'whale';
/** One ridable animal on its loop (written by the graphics module that draws it). */
export type RideFriend={
 readonly kind:RideKind;readonly id:string;
 /** The closed loop and its cumulative lengths (lengths[n] = total), as the graphics module walks them. */
 readonly points:readonly {x:number;z:number}[];readonly lengths:ArrayLike<number>;readonly total:number;
 /** Where the animal is along the loop (m). The graphics module advances it; while ridden, this module does. */
 u:number;
 /** FREE mode (steered ride, and the swim back to the loop): while `free`, this module owns the animal's place (fx, fz, m) and
  *  heading (fyaw: the rig's yaw, forward = (sin, cos)) and the graphics module places the mesh there instead of at `u`. */
 free:boolean;fx:number;fz:number;fyaw:number;
 /** The DRAWN pose while free (Oct 20 2026, user: "when riding the whale, they are not together"): the ride steps at the fixed
  *  60 Hz tick but the rider is drawn at the tick-interpolated place, so `present` writes this interpolated pose each frame and
  *  the graphics module places the mesh there (the rider's seat is computed from the same pose: no lag, no jitter). */
 dx:number;dz:number;dyaw:number;
 /** The animal's bank into the steered turn (rad, the rider's roll; eased back to 0 after a ride). The graphics module rolls the
  *  body by bank × RIDE_BANK[kind] about the long axis through the rider's seat (so the seat itself never swings). */
 bank:number;
 /** Drawn and swimming right now (its island is near, its heat tier keeps it). */
 readonly available:boolean;
 /** Held by a rider: the graphics module stops advancing `u`, places the mesh there and keeps it awake. */
 ridden:boolean;
 /** Its own loop speed (m/s) and, for the dart after a ride (DART_*), a multiplier on it (1 = its own pace), a sideways offset
  *  from the loop (m, + = right of the heading) and the matching extra heading (rad, + = towards the right). The graphics module
  *  advances `u` by speed × boost and places the mesh `bend` to the side; this module writes them only while darting. */
 readonly speed:number;boost:number;bend:number;bendYaw:number;
};
/** The prompt's label (the existing store-enter-prompt style) and the one water action while riding. */
export const RIDE_PROMPT='Hang on!';
export const RIDE_PROMPT_LABEL={manta:'Hang on to the manta ray',whale:'Hang on to the whale shark'} as const;
export const LET_GO_LABEL='Let go';
/** The prompt shows within this distance (m) of the animal's body: the centre point, less its body's reach (a manta's disc is
 *  ~5.5 m across; the whale shark is 13 m long, so its reach is its half length). */
export const RIDE_RANGE=5;
export const RIDE_BODY={manta:2.6,whale:6} as const;
/** Ride speed: × the sprint swim (SWIM_FAST_SPEED). The whale shark is bigger (a bigger wake), the manta quicker. */
export const RIDE_MULT={manta:1.6,whale:1.3} as const;
export const rideSpeed=(kind:RideKind)=>SWIM_FAST_SPEED*RIDE_MULT[kind];
/** The animal eases up to the ride speed from the swimmer's own speed (1/s), and the grip point: metres ahead of the animal's
 *  centre along its heading (the manta's disc centre; the whale shark's back just behind the head, where the tail sweep is ~0). */
export const RIDE_EASE=1.6;
/** Oct 20 2026 (user: "when riding the whale, they are not together", "same with ray"): the rider's ROOT sits RIDE_GRIP m ahead of
 *  the animal's centre (the pelvis lands ~.1 m further on): the whale shark's back at x ≈ 1.9 (its model is +x forward: the head
 *  starts at 3.4, the first dorsal at .5), so the hands reach to just behind the head and the legs end ahead of the dorsal fin;
 *  the manta's disc centre (the body over the wing roots, the head and arms towards the cephalic fins). */
export const RIDE_GRIP={manta:-.1,whale:1.8} as const;
/** The seat height: while ridden the animal rises until its back is RIDE_BACK m under the water line (from its 1-2 m swimming
 *  depth, WHALE_DEPTH / MANTA_DEPTH) and the rider's root lifts RIDE_SEAT_LIFT m (prone on the back, the body clear of the
 *  water so the sea veil's surface depth never hides it). Both ease at RIDE_RISE (1/s: ~.5 s to 95 %), and the rider glides from where they grabbed onto the seat over
 *  RIDE_GLIDE; at let-go the animal sinks back and the rider settles to the swim height. */
export const RIDE_BACK={manta:.1,whale:.15} as const,RIDE_SEAT_LIFT=.16,RIDE_RISE=6;
/** The grab's glide onto the seat (s, smoothstep: it starts and lands softly) and the turn to the animal's heading with it. */
export const RIDE_GLIDE=.6;
const glideLeft=(t:number)=>{const k=Math.max(0,Math.min(1,t/RIDE_GLIDE));return 1-k*k*(3-2*k);};
/** How much of the rider's roll the animal banks with (the manta tips its wings; the long whale shark rolls less). */
export const RIDE_BANK={manta:1,whale:.45} as const;
/** The ride's wake rings sit on the animal (not the rider): the bow ring this far ahead of its centre and the two side rings
 *  this far back / out (m, model space ×scale: the whale shark's snout and pectorals, the manta's head and wingtips). */
export const RIDE_WAKE_AT={manta:{bow:1.7,back:-.6,side:2.1},whale:{bow:6.4,back:1.2,side:2.6}} as const;
/** The body rolls into the animal's turns: roll = −turn rate × RIDE_ROLL (rad per rad/s), at most RIDE_ROLL_MAX, eased. */
export const RIDE_ROLL=.55,RIDE_ROLL_MAX=.45,RIDE_ROLL_EASE=4;
/** The camera's follow sits this much higher while riding (m; the normal follow otherwise). */
export const RIDE_CAM_LIFT=1.1;
/** Steering: the most the animal turns (rad/s), how fast the turn rate follows the stick (1/s), the fraction of the ride speed with the
 *  stick released, the look-ahead (s of travel, at least RIDE_LOOK_MIN m past the grip) that stops it short of land, the clearance (m
 *  to land) under which the ride ends at the shore, and the generous time cap (s). */
export const RIDE_TURN=1.9,RIDE_TURN_EASE=6,RIDE_IDLE=.55,RIDE_LOOK_T=.6,RIDE_LOOK_MIN=3,RIDE_SHORE_D=2.05,RIDE_MAX_TIME=90,RIDE_BRAKE=5;
/** The swim back to the loop: aim RET_LEAD m ahead of the nearest loop point, turn up to RET_TURN rad/s, catch within RET_CATCH m,
 *  then blend the leftover offset away over RET_SETTLE s. */
export const RET_LEAD=6,RET_TURN=2.6,RET_CATCH=2.5,RET_SETTLE=1.4;
/** The wake: rings every RIDE_WAKE_STEP s, sized ×RIDE_WAKE (the swim wake's are 1 / 1.25), from the existing ring pool. */
export const RIDE_WAKE_STEP={manta:.2,whale:.24} as const;
export const RIDE_WAKE={manta:1.7,whale:2.3} as const;
/** The little dismount splash (ballEffects.splashDown size) and how much of the ride's speed the swimmer keeps (it glides out). */
export const RIDE_DISMOUNT_SPLASH=.55,RIDE_DISMOUNT_CARRY=.35;
/** The dart (Oct 15 2026, user: "when getting off the whale and ray, make them move away fast from the character"): on Let go or
 *  the lap's end the animal shoots off along its loop for DART_TIME s: up to DART_MULT × its loop speed, never slower than the
 *  ride it just gave (× DART_RIDE: the ride is already 4–7× its loop pace, so it pulls away rather than braking), held for
 *  DART_HOLD s, then easing back to its own pace by DART_TIME. It bends DART_BEND m to the side the loop turns (away from the
 *  swimmer's straight glide) and back, and leaves a DART_WAKE × bigger wake from the ring pool. The swimmer is never touched. */
export const DART_TIME=3,DART_HOLD=1.1,DART_RISE=.3,DART_MULT=2.5,DART_RIDE=1.15,DART_WAKE=1.35;
export const DART_BEND={manta:3,whale:4.5} as const;
/** The dart's speed (m/s) `t` s after letting go, from `start` (the ride speed) up to `peak`, back down to `loop`. */
export function dartSpeed(t:number,start:number,peak:number,loop:number){
 if(t<=0)return start;if(t<DART_RISE)return start+(peak-start)*(t/DART_RISE);if(t<DART_HOLD)return peak;if(t>=DART_TIME)return loop;
 const k=(t-DART_HOLD)/(DART_TIME-DART_HOLD);return peak+(loop-peak)*k*k*(3-2*k);
}
/** The sideways bend (fraction of DART_BEND) `t` s after letting go: out quickly, held, back onto the loop by DART_TIME. */
export function dartBend(t:number){
 if(t<=0||t>=DART_TIME)return 0;const a=Math.min(1,t/.7),b=t<1.8?1:1-(t-1.8)/(DART_TIME-1.8);return a*a*(3-2*a)*b*b*(3-2*b);
}
/** The proximity tick (s): the water probe's own rate. */
export const RIDE_TICK=1/WATER_PROBE_HZ;
/** Oct 24 2026 (user: "it was able to ride it to shore and it was hidden in the sand a bit ... before the head of the whale hits the
 *  sand, do something that kicks the character off"): the animal's body from its centre (m: nose `bow` ahead, tail `tail` behind,
 *  half width `side`; RIDE_WAKE_AT's snout / pectorals) and the clear water it keeps from land (`margin`, m: the shelf is
 *  SHELF_SLOPE × distance deep, so the snout keeps ~.8 m of water under it). The hull probe (`hullLand`) tests the nose, the
 *  shoulders, the flanks and the tail at RIDE_TICK (or sooner when a slow frame or a quick turn outruns the last probe), each pushed
 *  `look` = margin + max(this frame's step, the top speed × RIDE_TICK) along the heading, so neither the ride's speed nor the swim
 *  back's dart (DART_MULT) can carry any part of the body onto the sand before the next probe. Land in it ends the ride ('shore'):
 *  the rider is tossed off seaward (RIDE_SHORE_TOSS rad off the heading, toward the open side, at most RIDE_SHORE_TOSS_V m/s
 *  before RIDE_DISMOUNT_CARRY) and the animal shore-brakes, turning away along the shore (RIDE_SHORE_TURN × RET_TURN, at
 *  most RIDE_SHORE_V × its loop speed) for RIDE_SHORE_T s after the last land it sees, then swims back to its loop. */
export const RIDE_HULL={manta:{bow:1.7,tail:2.4,side:2.8,margin:1},whale:{bow:6.4,tail:6.6,side:2.6,margin:1.8}} as const;
export const RIDE_SHORE_TOSS=2,RIDE_SHORE_TOSS_V=3,RIDE_SHORE_TURN=1,RIDE_SHORE_V=1.2,RIDE_SHORE_T=.8,RIDE_HULL_YAW=.08;
/** The football hook, once per device (the swim lesson's toast). A coaching idea, no fact claim. */
export const RIDE_LESSON={title:'Ride the wave',text:'A counter-attack is fastest when you move with the play, not against it.',kind:'Coaching idea'} as const;
export const RIDE_LESSON_KEY='fi2-ride-lesson-v1';

export type RideEnd=''|'lap'|'off'|'gone'|'shore'|'time';
export type RideEvents={grabbed:RideKind|'';ended:RideEnd;kind:RideKind|'';x:number;z:number;yaw:number;speed:number};

/** The point `u` metres along a closed loop (binary search over the lengths), the heading as the rig's yaw (forward =
 *  (sin yaw, cos yaw)), written into `out`. */
export function loopPoint(points:readonly {x:number;z:number}[],lengths:ArrayLike<number>,total:number,u:number,out:{x:number;z:number;yaw:number}){
 const n=points.length;u=((u%total)+total)%total;
 let lo=1,hi=n;while(lo<hi){const mid=(lo+hi)>>1;if(lengths[mid]<u)lo=mid+1;else hi=mid;}
 const a=points[lo-1],b=points[lo%n],seg=(lengths[lo]-lengths[lo-1])||1,f=(u-lengths[lo-1])/seg,dx=b.x-a.x,dz=b.z-a.z;
 out.x=a.x+dx*f;out.z=a.z+dz*f;out.yaw=Math.atan2(dx,dz);return out;
}
const wrap=(a:number)=>{a%=Math.PI*2;return a>Math.PI?a-Math.PI*2:a<-Math.PI?a+Math.PI*2:a;};
/** The loop distance `u` of the point on the closed loop nearest (x, z) (segment projection; once per ride end). */
export function nearestLoopU(points:readonly {x:number;z:number}[],lengths:ArrayLike<number>,x:number,z:number){
 const n=points.length;let best=Infinity,bu=0;
 for(let i=1;i<=n;i++){const a=points[i-1],b=points[i%n],dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/l2)),d=Math.hypot(a.x+dx*t-x,a.z+dz*t-z);
  if(d<best){best=d;bu=lengths[i-1]+t*(lengths[i]-lengths[i-1]);}}
 return bu;
}

/** `friends` lists every ridable animal (the mantas' records, then the whale shark's); read on the probe tick only. */
export function createAnimalRides(friends:()=>readonly RideFriend[]){
 const p={x:0,z:0,yaw:0};
 const state={near:null as RideFriend|null,nearDist:Infinity,riding:null as RideFriend|null,speed:0,travelled:0,
  /** The rider's place and heading (the grip point), the body roll, the time since the last wake. */
  x:0,z:0,yaw:0,roll:0,turn:0,wake:0,acc:Infinity,laps:0,
  /** The previous tick's animal pose (for `present`), and the grab glide: the swimmer's offset from the seat when they grabbed
   *  (m, world), gliding out over RIDE_GLIDE (`glideT` s since the grab). */
  px:0,pz:0,pyaw:0,gx:0,gz:0,gyaw:0,glideT:0,
  /** The rider's drawn heading (`present`): the animal's drawn heading, plus the grab's leftover turn gliding out. */
  drawYaw:0,
  /** The dart after a ride (DART_*): the animal, the time since letting go, its start / peak speed, the side, the wake clock. */
  ret:null as RideFriend|null,retT:0,retStart:0,retPeak:0,retSettle:-1,retBend:0,retYaw:0,retBoost:1,rideT:0,dart:null as RideFriend|null,dartT:0,dartStart:0,dartPeak:0,dartSide:1,dartWake:0,darts:0,
  /** The hull probe (RIDE_HULL): the host's dry-land test (kept from `step` for the swim back), the time / metres left before the
   *  next probe and the heading it was taken at; the shore brake's turn side (±1, 0 = none), its time left (s) and whether the
   *  last probe still saw land ahead (it turns only then). */
  land:null as ((x:number,z:number)=>boolean)|null,hullAcc:Infinity,hullBudget:0,hullYaw:0,shoreSide:0,shoreT:0,shoreBlock:false};
 const events:RideEvents={grabbed:'',ended:'',kind:'',x:0,z:0,yaw:0,speed:0};
 const clear=()=>{events.grabbed='';events.ended='';};
 function endRet(){const f=state.ret;if(!f)return;f.free=false;f.boost=1;f.bend=0;f.bendYaw=0;state.ret=null;state.retT=0;state.retSettle=-1;}
 function endDart(){const f=state.dart;if(!f)return;f.boost=1;f.bend=0;f.bendYaw=0;state.dart=null;state.dartT=0;}
 /** Any of the body's samples (nose, shoulders, flanks, tail: RIDE_HULL) `look` m further along heading `yaw` is dry land. */
 function hullLand(f:RideFriend,yaw:number,look:number,land:(x:number,z:number)=>boolean){
  const h=RIDE_HULL[f.kind],m=h.margin,fx=Math.sin(yaw),fz=Math.cos(yaw),rx=fz,rz=-fx,x=f.fx+fx*look,z=f.fz+fz*look;
  const a=h.bow+m,sa=h.bow*.5+m*.7,sw=h.side+m*.5,mw=h.side+m,t=h.tail+m*.5;
  return land(x+fx*a,z+fz*a)||land(x+fx*sa+rx*sw,z+fz*sa+rz*sw)||land(x+fx*sa-rx*sw,z+fz*sa-rz*sw)
   ||land(x+rx*mw,z+rz*mw)||land(x-rx*mw,z-rz*mw)||land(f.fx-fx*t,f.fz-fz*t);/* the tail where it is: it swings, it never leads */
 }
 /** The open side to turn to (±1): the nose swung a radian each way, the free one; both free (or both land) the current turn's. */
 function openSide(f:RideFriend,land:(x:number,z:number)=>boolean){
  const h=RIDE_HULL[f.kind],a=h.bow+h.margin*2,pref=state.turn>=0?1:-1;
  const l=land(f.fx+Math.sin(f.fyaw+pref)*a,f.fz+Math.cos(f.fyaw+pref)*a),r=land(f.fx+Math.sin(f.fyaw-pref)*a,f.fz+Math.cos(f.fyaw-pref)*a);
  return l&&!r?-pref:pref;
 }
 /** Due a hull probe: the tick is up, this step outruns the metres the last one covered, or the heading swung since. */
 const hullDue=(yaw:number,ds:number)=>state.hullAcc>=RIDE_TICK-1e-6||ds>state.hullBudget||Math.abs(wrap(yaw-state.hullYaw))>RIDE_HULL_YAW;
 const grip=(f:RideFriend,u:number)=>{loopPoint(f.points,f.lengths,f.total,u,p);const g=RIDE_GRIP[f.kind];p.x+=Math.sin(p.yaw)*g;p.z+=Math.cos(p.yaw)*g;return p;};
 function end(reason:RideEnd){
  const f=state.riding;if(!f)return events;
  f.ridden=false;state.riding=null;state.rideT=0;state.near=null;state.nearDist=Infinity;state.acc=Infinity;
  // The dart: the animal shoots off (not when it is gone: a hot tier or a map trip took it away).
  if(f.free){
   // Swim back to the loop (free pose -> nearest loop point + RET_LEAD ahead); the mesh stays free until it is caught.
   if(reason!=='gone'&&f.available){endRet();state.ret=f;state.retT=0;state.retSettle=-1;state.retStart=state.speed;state.retPeak=Math.max(DART_MULT*f.speed,state.speed*DART_RIDE);
    f.u=(nearestLoopU(f.points,f.lengths,f.fx,f.fz)+RET_LEAD)%f.total;f.boost=state.speed/(f.speed||1);state.dartWake=RIDE_WAKE_STEP[f.kind];state.darts++;}
   else{f.free=false;f.bank=0;}
  }else if(reason!=='gone'&&f.available){endDart();state.dart=f;state.dartT=0;state.dartStart=state.speed;state.dartPeak=Math.max(DART_MULT*f.speed,state.speed*DART_RIDE);
   state.dartSide=state.turn>=0?1:-1;state.dartWake=RIDE_WAKE_STEP[f.kind];state.darts++;f.boost=state.speed/(f.speed||1);}
  events.ended=reason;events.kind=f.kind;events.x=state.x;events.z=state.z;events.yaw=state.yaw;events.speed=state.speed;state.roll=0;
  state.hullAcc=Infinity;state.hullBudget=0;state.shoreSide=0;state.shoreT=0;state.shoreBlock=false;
  if(reason==='shore'&&state.land&&state.ret===f){
   // The shore brake (RIDE_HULL): the rider is tossed off seaward, the animal turns away along the shore before it swims home.
   const s=openSide(f,state.land);state.shoreSide=s;state.shoreT=RIDE_SHORE_T;state.shoreBlock=true;
   events.yaw=wrap(state.yaw+s*RIDE_SHORE_TOSS);events.speed=Math.min(state.speed,RIDE_SHORE_TOSS_V);
  }
  return events;
 }
 /** The swim back (free pose chasing a fixed loop point), then the settle blend; a few scalars, no allocation. */
 function retStep(dt:number){
  const f=state.ret;if(!f)return;if(!f.available||f.ridden){endRet();return;}
  dt=Math.max(0,Math.min(dt,.25));f.bank*=Math.exp(-dt*4);
  if(state.retSettle>=0){
   const t=state.retSettle+=dt,k=Math.min(1,t/RET_SETTLE),e=1-k*k*(3-2*k);
   f.bend=state.retBend*e;f.bendYaw=state.retYaw*e;f.boost=1+(state.retBoost-1)*e;state.dartWake+=dt;if(k>=1)endRet();return;
  }
  const t=state.retT+=dt;loopPoint(f.points,f.lengths,f.total,f.u,p);
  const dx=p.x-f.fx,dz=p.z-f.fz,dist=Math.hypot(dx,dz),rate=RET_TURN*dt;
  const y0=f.fyaw;if(!(state.shoreT>0&&state.land))f.fyaw=wrap(f.fyaw+Math.max(-rate,Math.min(rate,wrap(Math.atan2(dx,dz)-f.fyaw))));// (the shore brake steers instead)
  let sp=Math.min(Math.max(dartSpeed(t,state.retStart,state.retPeak,f.speed),f.speed*1.4)*(1+t*.12),dist*3+f.speed);
  // Never into land on the way home (RIDE_HULL): a land hit ahead starts / renews the shore brake (slow, turning to the open side).
  const land=state.land;state.hullAcc+=dt;
  if(land){
   if(state.shoreT>0){state.shoreT-=dt;sp=Math.min(sp,Math.max(2,f.speed*RIDE_SHORE_V));if(state.shoreBlock)f.fyaw=wrap(f.fyaw+state.shoreSide*RET_TURN*RIDE_SHORE_TURN*dt);}// turn until the way ahead is clear (along the shore), then swim on
   const ds=sp*dt;
   if(hullDue(f.fyaw,ds)){
    const look=Math.max(ds,sp*RIDE_TICK);
    state.shoreBlock=hullLand(f,f.fyaw,look,land);
    if(state.shoreBlock){
     if(state.shoreT<=0)state.shoreSide=openSide(f,land);state.shoreT=RIDE_SHORE_T;
     // This frame's turn would swing the body (the tail, a flank) into the margin: hold the heading and turn the other way.
     if(hullLand(f,f.fyaw,0,land)&&!hullLand(f,y0,0,land)){f.fyaw=y0;state.shoreSide=-state.shoreSide;}
     sp=hullLand(f,f.fyaw,0,land)?0:Math.min(sp,Math.max(2,f.speed*RIDE_SHORE_V));state.hullBudget=sp>0&&!hullLand(f,f.fyaw,sp*RIDE_TICK,land)?sp*RIDE_TICK:0;
    }else state.hullBudget=look;
    state.hullAcc=0;state.hullYaw=f.fyaw;
   }
   if(sp*dt>state.hullBudget)sp=Math.max(0,state.hullBudget)/(dt||1);state.hullBudget-=sp*dt;
  }
  f.fx+=Math.sin(f.fyaw)*sp*dt;f.fz+=Math.cos(f.fyaw)*sp*dt;f.dx=f.fx;f.dz=f.fz;f.dyaw=f.fyaw;f.boost=sp/(f.speed||1);state.dartWake+=dt;
  if(dist<RET_CATCH||t>20){
   // Caught: take over as the loop's own, with the leftover offset (bend) and heading difference blended away.
   const rx=f.fx-p.x,rz=f.fz-p.z,ts=Math.sin(p.yaw),tc=Math.cos(p.yaw);
   f.u=((f.u+rx*ts+rz*tc)%f.total+f.total)%f.total;loopPoint(f.points,f.lengths,f.total,f.u,p);
   state.retBend=(f.fx-p.x)*Math.cos(p.yaw)-(f.fz-p.z)*Math.sin(p.yaw);state.retYaw=wrap(f.fyaw-p.yaw);state.retBoost=Math.min(DART_MULT,Math.max(1,f.boost));
   f.free=false;f.bank=0;f.bend=state.retBend;f.bendYaw=state.retYaw;state.retSettle=0;
  }
 }
 return {state,events,
  /** The prompt's proximity test: at most WATER_PROBE_HZ a second, only while swimming and not riding (else it clears). */
  scan(dt:number,x:number,z:number,swimming:boolean){
   if(!swimming||state.riding){state.near=null;state.nearDist=Infinity;state.acc=Infinity;return state.near;}
   state.acc+=dt;if(state.acc<RIDE_TICK-1e-6)return state.near;state.acc=0;
   let best:RideFriend|null=null,bestD=Infinity;
   for(const f of friends()){if(!f.available||f.ridden||f.free||f===state.dart)continue;/* not one darting off */loopPoint(f.points,f.lengths,f.total,f.u,p);
    const d=Math.hypot(p.x-x,p.z-z)-RIDE_BODY[f.kind];if(d<=RIDE_RANGE&&d<bestD){bestD=d;best=f;}}
   state.near=best;state.nearDist=best?Math.max(0,bestD):Infinity;return best;
  },
  /** Where the prompt floats: over the animal now (between probe ticks it keeps swimming). */
  anchor(f:RideFriend,out:{x:number;z:number;yaw:number}){if(f.free){out.x=f.fx;out.z=f.fz;out.yaw=f.fyaw;return out;}return loopPoint(f.points,f.lengths,f.total,f.u,out);},
  /** "Hang on!": grab the near animal. `speed` is the swimmer's own (the animal eases up from it); (x, z), when given, is where
   *  the swimmer is: they glide from there onto the seat (RIDE_GLIDE) instead of popping onto it. */
  grab(speed:number,x?:number,z?:number,yaw?:number){
   clear();const f=state.near;if(!f||state.riding||!f.available)return events;if(state.dart===f)endDart();
   f.ridden=true;state.riding=f;state.speed=Math.max(0,speed);state.travelled=0;state.wake=0;state.roll=0;state.turn=0;state.rideT=0;
   loopPoint(f.points,f.lengths,f.total,f.u,p);f.fx=f.dx=state.px=p.x;f.fz=f.dz=state.pz=p.z;f.fyaw=f.dyaw=state.pyaw=p.yaw;f.bank=0;f.free=true;
   grip(f,f.u);state.x=p.x;state.z=p.z;state.yaw=p.yaw;state.glideT=0;
   state.gx=x===undefined?0:x-p.x;state.gz=z===undefined?0:z-p.z;const gl=Math.hypot(state.gx,state.gz);if(gl>RIDE_RANGE+RIDE_BODY[f.kind]+2){state.gx*=(RIDE_RANGE+RIDE_BODY[f.kind]+2)/gl;state.gz*=(RIDE_RANGE+RIDE_BODY[f.kind]+2)/gl;}
   state.gyaw=yaw===undefined?0:wrap(yaw-p.yaw);state.drawYaw=p.yaw+state.gyaw;
   events.grabbed=f.kind;events.kind=f.kind;return events;
  },
  /** One frame of the ride: the stick (`inp`, camera-relative world vector, length <= 1) steers the animal and the rider on it; `ok`
   *  is the swimmable-water test (waterProbe.allowed), `clearance` the probe's cached distance to land. Writes the rider's place and
   *  velocity. A few scalars; no allocation. */
  step(dt:number,pos:{x:number;z:number},vel:{x:number;z:number},inp:{x:number;z:number},ok:(x:number,z:number)=>boolean,clearance:number,land?:(x:number,z:number)=>boolean){
   clear();const f=state.riding;if(!f)return events;
   if(!f.available)return end('gone');// thinned out by a heat tier, or its island was left behind (a map trip): let go
   dt=Math.max(0,Math.min(dt,.25));// the water step's own clamp: a slow frame still covers its distance
   state.rideT+=dt;state.px=f.fx;state.pz=f.fz;state.pyaw=f.fyaw;state.glideT+=dt;
   // Steer: the turn rate follows the stick's bearing, limited, and eased (smooth heading).
   const len=Math.hypot(inp.x,inp.z),has=len>.15;
   const want=has?Math.max(-RIDE_TURN,Math.min(RIDE_TURN,wrap(Math.atan2(inp.x,inp.z)-f.fyaw)*4))*Math.min(1,len*1.5):0;
   state.turn+=(want-state.turn)*(1-Math.exp(-dt*RIDE_TURN_EASE));f.fyaw=wrap(f.fyaw+state.turn*dt);
   // Speed eases to the ride speed (less with the stick released); land or the range edge ahead brakes it to a stop.
   const g=RIDE_GRIP[f.kind],sy=Math.sin(f.fyaw),cy=Math.cos(f.fyaw),la=g+Math.max(RIDE_LOOK_MIN,state.speed*RIDE_LOOK_T);
   const blocked=!ok(f.fx+sy*la,f.fz+cy*la)||!ok(f.fx+sy*la*.5,f.fz+cy*la*.5);
   const target=blocked?0:rideSpeed(f.kind)*(has?1:RIDE_IDLE);state.speed+=(target-state.speed)*(1-Math.exp(-dt*(blocked?RIDE_BRAKE:RIDE_EASE)));
   if(state.speed<.02)state.speed=0;
   const ds=state.speed*dt,nx=f.fx+sy*ds,nz=f.fz+cy*ds;
   // The hull probe (RIDE_HULL): land within the body + margin + the next probe's travel ends the ride before any of it touches sand.
   if(land){state.land=land;state.hullAcc+=dt;
    if(hullDue(f.fyaw,ds)){const look=Math.max(ds,Math.max(state.speed,rideSpeed(f.kind))*RIDE_TICK);
     if(hullLand(f,f.fyaw,look,land)||hullLand(f,wrap(f.fyaw+state.turn*RIDE_TICK*1.5),look,land))return end('shore');
     state.hullAcc=0;state.hullBudget=look;state.hullYaw=f.fyaw;}
    state.hullBudget-=ds;}
   if(ds>0&&ok(nx+sy*g,nz+cy*g)){f.fx=nx;f.fz=nz;state.travelled+=ds;}else if(ds>0)state.speed=0;
   const gk=glideLeft(state.glideT);
   state.yaw=f.fyaw;state.x=f.fx+sy*g+state.gx*gk;state.z=f.fz+cy*g+state.gz*gk;
   state.roll=Math.max(-RIDE_ROLL_MAX,Math.min(RIDE_ROLL_MAX,-state.turn*RIDE_ROLL));f.bank=state.roll;
   f.dx=f.fx;f.dz=f.fz;f.dyaw=f.fyaw;state.drawYaw=wrap(f.fyaw+state.gyaw*gk);// the drawn pose until `present` interpolates it this frame
   pos.x=state.x;pos.z=state.z;vel.x=sy*state.speed;vel.z=cy*state.speed;
   state.wake+=dt;
   if(clearance<RIDE_SHORE_D)return end('shore');// reached the shallows
   if(state.rideT>=RIDE_MAX_TIME){state.laps++;return end('time');}// the heat cap
   return events;
  },
  /** One frame of the dart (only while one runs: the host checks `darting`). Writes the animal's boost and bend; the graphics
   *  module moves it. A few scalars, no allocation. */
  dartStep(dt:number){
   if(state.ret){retStep(dt);return;}
   const f=state.dart;if(!f)return;if(!f.available||f.ridden){endDart();return;}
   dt=Math.max(0,Math.min(dt,.25));const t0=state.dartT,t=state.dartT=t0+dt;if(t>=DART_TIME){endDart();return;}
   const speed=dartSpeed(t,state.dartStart,state.dartPeak,f.speed),B=DART_BEND[f.kind]*state.dartSide,bend=B*dartBend(t);
   f.boost=speed/(f.speed||1);f.bendYaw=dt>0?Math.atan2((bend-B*dartBend(t0))/dt,speed):0;f.bend=bend;state.dartWake+=dt;
  },
  /** The dart's wake is due (bigger rings while it is still fast); writes where the animal is. */
  dartWakeDue(out:{x:number;z:number;yaw:number}){
   const r=state.ret;
   if(r){if(state.dartWake<RIDE_WAKE_STEP[r.kind]||r.boost<1.5)return false;state.dartWake=0;out.x=r.fx;out.z=r.fz;out.yaw=r.fyaw;return true;}
   const f=state.dart;if(!f||state.dartWake<RIDE_WAKE_STEP[f.kind]||f.boost<1.5)return false;state.dartWake=0;
   loopPoint(f.points,f.lengths,f.total,f.u,out);out.x+=Math.cos(out.yaw)*f.bend;out.z-=Math.sin(out.yaw)*f.bend;return true;
  },
  get darting(){return state.dart!==null||state.ret!==null;},
  /** Once per drawn frame while riding (after the host interpolates its own place, `blend` = the tick fraction): the animal's
   *  drawn pose between the last two ticks (into dx/dz/dyaw) and the rider's seat on it, written into `out` (the rider's drawn
   *  place). One pose for both, so they never drift apart by a frame. Returns false (out untouched) when not riding. */
  present(blend:number,out:{x:number;z:number}){
   const f=state.riding;if(!f)return false;const b=Math.max(0,Math.min(1,blend));
   f.dx=state.px+(f.fx-state.px)*b;f.dz=state.pz+(f.fz-state.pz)*b;f.dyaw=wrap(state.pyaw+wrap(f.fyaw-state.pyaw)*b);
   const g=RIDE_GRIP[f.kind],gk=glideLeft(state.glideT-(1-b)/60);
   out.x=f.dx+Math.sin(f.dyaw)*g+state.gx*gk;out.z=f.dz+Math.cos(f.dyaw)*g+state.gz*gk;state.drawYaw=wrap(f.dyaw+state.gyaw*gk);return true;
  },
  /** The wake is due (the host spawns the pooled rings); resets its clock. */
  wakeDue(){const f=state.riding;if(!f||state.wake<RIDE_WAKE_STEP[f.kind])return false;state.wake=0;return true;},
  /** "Let go" (or anything that ends the swim: a map trip, the water state leaving the sea). */
  letGo(reason:RideEnd='off'){clear();const e=end(reason);if(reason==='gone'){endDart();endRet();}return e;},
  get riding(){return state.riding!==null;},
 };
}
export type AnimalRides=ReturnType<typeof createAnimalRides>;
