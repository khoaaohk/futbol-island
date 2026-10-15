// Rides on the island friends (water phase P1b, Oct 15 2026; user: "when near a manta ray or whale shark, have a btn that comes up
// to say hang on, on click the drag the character through the water faster"; docs/swimming-research.md §2.6 and "P1b implemented").
//
// Pure (no three.js, no DOM): a swimmer within RIDE_RANGE of a manta (any manta loop: lib/town/mantaLoops.ts) or Summit Isle's
// whale shark (summitSeaLife.ts WHALE_SHARK_LOOP) sees a floating "Hang on!" prompt over the animal; a tap grabs on and the animal
// drags the swimmer along its own loop at RIDE_MULT × the sprint swim (SWIM_FAST_SPEED), the body rolling with its turns. The
// ride ends by itself after ONE lap (the heat rule: nothing runs on), or on "Let go"; either way the swimmer is left treading
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
export const RIDE_GRIP={manta:.25,whale:2.2} as const;
/** The body rolls into the animal's turns: roll = −turn rate × RIDE_ROLL (rad per rad/s), at most RIDE_ROLL_MAX, eased. */
export const RIDE_ROLL=.55,RIDE_ROLL_MAX=.45,RIDE_ROLL_EASE=4;
/** The camera's follow sits this much higher while riding (m; the normal follow otherwise). */
export const RIDE_CAM_LIFT=1.1;
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
/** The football hook, once per device (the swim lesson's toast). A coaching idea, no fact claim. */
export const RIDE_LESSON={title:'Ride the wave',text:'A counter-attack is fastest when you move with the play, not against it.',kind:'Coaching idea'} as const;
export const RIDE_LESSON_KEY='fi2-ride-lesson-v1';

export type RideEnd=''|'lap'|'off'|'gone';
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

/** `friends` lists every ridable animal (the mantas' records, then the whale shark's); read on the probe tick only. */
export function createAnimalRides(friends:()=>readonly RideFriend[]){
 const p={x:0,z:0,yaw:0};
 const state={near:null as RideFriend|null,nearDist:Infinity,riding:null as RideFriend|null,speed:0,travelled:0,
  /** The rider's place and heading (the grip point), the body roll, the time since the last wake. */
  x:0,z:0,yaw:0,roll:0,turn:0,wake:0,acc:Infinity,laps:0,
  /** The dart after a ride (DART_*): the animal, the time since letting go, its start / peak speed, the side, the wake clock. */
  dart:null as RideFriend|null,dartT:0,dartStart:0,dartPeak:0,dartSide:1,dartWake:0,darts:0};
 const events:RideEvents={grabbed:'',ended:'',kind:'',x:0,z:0,yaw:0,speed:0};
 const clear=()=>{events.grabbed='';events.ended='';};
 function endDart(){const f=state.dart;if(!f)return;f.boost=1;f.bend=0;f.bendYaw=0;state.dart=null;state.dartT=0;}
 const grip=(f:RideFriend,u:number)=>{loopPoint(f.points,f.lengths,f.total,u,p);const g=RIDE_GRIP[f.kind];p.x+=Math.sin(p.yaw)*g;p.z+=Math.cos(p.yaw)*g;return p;};
 function end(reason:RideEnd){
  const f=state.riding;if(!f)return events;
  f.ridden=false;state.riding=null;state.near=null;state.nearDist=Infinity;state.acc=Infinity;
  // The dart: the animal shoots off (not when it is gone: a hot tier or a map trip took it away).
  if(reason!=='gone'&&f.available){endDart();state.dart=f;state.dartT=0;state.dartStart=state.speed;state.dartPeak=Math.max(DART_MULT*f.speed,state.speed*DART_RIDE);
   state.dartSide=state.turn>=0?1:-1;state.dartWake=RIDE_WAKE_STEP[f.kind];state.darts++;f.boost=state.speed/(f.speed||1);}
  events.ended=reason;events.kind=f.kind;events.x=state.x;events.z=state.z;events.yaw=state.yaw;events.speed=state.speed;state.roll=0;return events;
 }
 return {state,events,
  /** The prompt's proximity test: at most WATER_PROBE_HZ a second, only while swimming and not riding (else it clears). */
  scan(dt:number,x:number,z:number,swimming:boolean){
   if(!swimming||state.riding){state.near=null;state.nearDist=Infinity;state.acc=Infinity;return state.near;}
   state.acc+=dt;if(state.acc<RIDE_TICK-1e-6)return state.near;state.acc=0;
   let best:RideFriend|null=null,bestD=Infinity;
   for(const f of friends()){if(!f.available||f.ridden||f===state.dart)continue;/* not one darting off */loopPoint(f.points,f.lengths,f.total,f.u,p);
    const d=Math.hypot(p.x-x,p.z-z)-RIDE_BODY[f.kind];if(d<=RIDE_RANGE&&d<bestD){bestD=d;best=f;}}
   state.near=best;state.nearDist=best?Math.max(0,bestD):Infinity;return best;
  },
  /** Where the prompt floats: over the animal now (between probe ticks it keeps swimming). */
  anchor(f:RideFriend,out:{x:number;z:number;yaw:number}){return loopPoint(f.points,f.lengths,f.total,f.u,out);},
  /** "Hang on!": grab the near animal. `speed` is the swimmer's own (the animal eases up from it). */
  grab(speed:number){
   clear();const f=state.near;if(!f||state.riding||!f.available)return events;if(state.dart===f)endDart();
   f.ridden=true;state.riding=f;state.speed=Math.max(0,speed);state.travelled=0;state.wake=0;state.roll=0;state.turn=0;
   grip(f,f.u);state.x=p.x;state.z=p.z;state.yaw=p.yaw;events.grabbed=f.kind;events.kind=f.kind;return events;
  },
  /** One frame of the ride: the animal (and the rider on it) moves along its loop; writes the rider's place and velocity. */
  step(dt:number,pos:{x:number;z:number},vel:{x:number;z:number}){
   clear();const f=state.riding;if(!f)return events;
   if(!f.available)return end('gone');// thinned out by a heat tier, or its island was left behind (a map trip): let go
   dt=Math.max(0,Math.min(dt,.25));// the water step's own clamp: a slow frame still covers its distance
   const target=rideSpeed(f.kind);state.speed+=(target-state.speed)*(1-Math.exp(-dt*RIDE_EASE));
   const ds=state.speed*dt;f.u=(f.u+ds)%f.total;state.travelled+=ds;
   const before=state.yaw;grip(f,f.u);state.x=p.x;state.z=p.z;state.yaw=p.yaw;
   // The loop is a polyline (the heading steps at each sample): smooth the turn rate first, then lean (bounded).
   const k=1-Math.exp(-dt*RIDE_ROLL_EASE);state.turn+=((dt>0?wrap(state.yaw-before)/dt:0)-state.turn)*k;
   state.roll=Math.max(-RIDE_ROLL_MAX,Math.min(RIDE_ROLL_MAX,-state.turn*RIDE_ROLL));
   pos.x=state.x;pos.z=state.z;vel.x=Math.sin(state.yaw)*state.speed;vel.z=Math.cos(state.yaw)*state.speed;
   state.wake+=dt;
   // One lap, then it ends itself (heat: no ride runs on).
   if(state.travelled>=f.total){state.laps++;return end('lap');}
   return events;
  },
  /** One frame of the dart (only while one runs: the host checks `darting`). Writes the animal's boost and bend; the graphics
   *  module moves it. A few scalars, no allocation. */
  dartStep(dt:number){
   const f=state.dart;if(!f)return;if(!f.available||f.ridden){endDart();return;}
   dt=Math.max(0,Math.min(dt,.25));const t0=state.dartT,t=state.dartT=t0+dt;if(t>=DART_TIME){endDart();return;}
   const speed=dartSpeed(t,state.dartStart,state.dartPeak,f.speed),B=DART_BEND[f.kind]*state.dartSide,bend=B*dartBend(t);
   f.boost=speed/(f.speed||1);f.bendYaw=dt>0?Math.atan2((bend-B*dartBend(t0))/dt,speed):0;f.bend=bend;state.dartWake+=dt;
  },
  /** The dart's wake is due (bigger rings while it is still fast); writes where the animal is. */
  dartWakeDue(out:{x:number;z:number;yaw:number}){
   const f=state.dart;if(!f||state.dartWake<RIDE_WAKE_STEP[f.kind]||f.boost<1.5)return false;state.dartWake=0;
   loopPoint(f.points,f.lengths,f.total,f.u,out);out.x+=Math.cos(out.yaw)*f.bend;out.z-=Math.sin(out.yaw)*f.bend;return true;
  },
  get darting(){return state.dart!==null;},
  /** The wake is due (the host spawns the pooled rings); resets its clock. */
  wakeDue(){const f=state.riding;if(!f||state.wake<RIDE_WAKE_STEP[f.kind])return false;state.wake=0;return true;},
  /** "Let go" (or anything that ends the swim: a map trip, the water state leaving the sea). */
  letGo(reason:RideEnd='off'){clear();const e=end(reason);if(reason==='gone')endDart();return e;},
  get riding(){return state.riding!==null;},
 };
}
export type AnimalRides=ReturnType<typeof createAnimalRides>;
