/**
 * The dive (water phase P2, Oct 16 2026; docs/swimming-research.md §2.4 and "P2 implemented: one spot"): the "Dive" prompt's
 * proximity test at the surface, the swim → dive → surface state machine, the 3D swim in the sealed room (slow, floaty, auto-level
 * over the sand), the breath meter and the finds.
 *
 * Pure: no three.js, no DOM, no timers, no allocation in `scan` / `step` (one events object, cleared each tick). The host
 * (components/Town.tsx) owns the island and the room (lib/graphics/diveRoom.ts); this decides what the dive is doing.
 *
 * Teaching (AGENTS.md): the breath meter IS the lesson. One breath lasts BREATH_SECONDS at an easy swim; gliding drains it slower
 * (BREATH_DRAIN.glide), pushing the stick all the way faster (BREATH_DRAIN.push): pace is a resource, like a midfielder's legs
 * over 90 minutes. At BREATH_LOW a calm note says to head up; at 0 the diver floats up gently by themselves ("Good dive!"),
 * nothing is lost and nobody is hurt. Breath refills at the surface over BREATH_REFILL_S, and a new dive waits for
 * BREATH_MIN_DIVE of it (recover before the next sprint). DIVE_LESSON shows once per device.
 */
import {DIVE_CEILING_GAP,DIVE_FIND_RANGE,DIVE_FLOOR_GAP,DIVE_ROOM_R,DIVE_SURFACE_Y,diveFindPoint,diveFloor,diveSpotAt,type DiveFind,type DiveSpot,DIVE_SPOTS} from './diveSpots';
import {WATER_PROBE_HZ} from './waterDepth';

/** One full breath at an easy swim (s), and how fast it drains: gliding (stick still), an easy swim, the stick pushed all the way. */
export const BREATH_SECONDS=45;
export const BREATH_DRAIN={glide:.6,swim:1,push:1.8} as const;
/** The calm "time to head up" note, and the gentle float up at 0. */
export const BREATH_LOW=.2;
/** A full refill at the surface takes this long (s); a new dive waits for this much breath. */
export const BREATH_REFILL_S=6,BREATH_MIN_DIVE=.25;
/** The breath meter's CSS variable is written at most this often (Hz) by the host. */
export const BREATH_UI_HZ=10;
/** The swim (m/s): top speed, how fast it gets there and how fast the water slows you (floaty); turning (rad/s at full stick). */
export const DIVE_SPEED=2.4,DIVE_ACCEL=2.2,DIVE_DRAG=1.4,DIVE_TURN=1.9;
/** Auto-level: the diver eases toward DIVE_HOVER m over the sand (lower near a find), at DIVE_LEVEL per second; the Q / Z keys
 *  (desktop) add a rise / sink offset up to DIVE_LIFT_MAX m. */
export const DIVE_HOVER=1.6,DIVE_LEVEL=1.6,DIVE_RISE=1.4,DIVE_LIFT_MAX=4.5;
/** Surfacing: the room's going-up fade (s) before the island shows again. */
export const DIVE_SURFACE_S=.6;
/** Where the diver starts (room-local, just under the surface, over the start of the reef) and the facing (toward −z, the relic). */
export const DIVE_START={x:0,y:DIVE_SURFACE_Y-1.6,z:3,yaw:Math.PI} as const;
/** The proximity tick at the surface (s): the water probe's own rate. */
export const DIVE_TICK=1/WATER_PROBE_HZ;
/** The football hook, once per device (the swim lesson's toast). A coaching idea, no fact claim. */
export const DIVE_LESSON={title:'Pace your breath',text:'Glide slowly and your breath lasts longer. Sprint everywhere and it runs out fast, like a midfielder’s legs in a long match.',kind:'Coaching idea'} as const;
export const DIVE_LESSON_KEY='fi2-dive-lesson-v1';
export const DIVE_LOW_NOTE='Running low on breath: time to head up.',DIVE_OUT_NOTE='Good dive! You floated up for a breath.';

export type DivePhase='surface'|'diving'|'rising';
export type SurfaceReason='tap'|'breath'|'leave';
export type DiveEvents={
 /** The dive just began (the host builds the room, sleeps the island) / ended (the host disposes it, wakes the island). */
 started:boolean;surfaced:SurfaceReason|'';
 /** Breath crossed BREATH_LOW (once per dive) / ran out (the gentle float up starts). */
 low:boolean;out:boolean;
 /** A find was used: its id, whether it is new (saved, credited once) and its coins (0 when not new or none). */
 find:string;firstFind:boolean;coins:number;
 /** The breath meter changed enough to redraw (≤ BREATH_UI_HZ). */
 breathUi:boolean;
};
export type DiveInput={
 /** Stick: x right, y DOWN (the island's convention: −1 = forward), each −1..1 (keys + joystick). */
 sx:number;sy:number;
 /** Desktop: rise (+1) / sink (−1). */
 lift:number;
};

export function createDiveSession(spots:readonly DiveSpot[]=DIVE_SPOTS,found:(spot:string)=>readonly string[]=()=>[]){
 const p={x:0,y:0,z:0};
 const state={phase:'surface' as DivePhase,spot:null as DiveSpot|null,
  /** The patch the swimmer is in at the surface (the Dive prompt), by the 10 Hz test. */
  near:null as DiveSpot|null,acc:Infinity,
  /** Room-local diver: position, velocity, facing (rig yaw: forward = (sin, cos)), pitch (rad, + nose down), roll, lift offset. */
  x:0,y:0,z:0,vx:0,vy:0,vz:0,yaw:0,pitch:0,roll:0,lift:0,
  /** Breath 0..1 (refills at the surface), the last value the UI drew, its clock; whether the low note fired this dive. */
  breath:1,uiBreath:1,uiAcc:0,lowSaid:false,
  /** The find in reach (3D, DIVE_FIND_RANGE) and its distance; finds used this dive; the rising fade (s). */
  find:null as DiveFind|null,findDist:Infinity,used:new Set<string>(),rise:0,risingFor:'tap' as SurfaceReason,
  /** Seconds underwater this dive, and dives this page (tests and analytics). */
  time:0,dives:0,
  /** How hard the diver is swimming (0..1, for the pose and the bubbles). */
  effort:0};
 const events:DiveEvents={started:false,surfaced:'',low:false,out:false,find:'',firstFind:false,coins:0,breathUi:false};
 const clear=()=>{events.started=events.low=events.out=events.firstFind=events.breathUi=false;events.surfaced='';events.find='';events.coins=0;};
 const markUi=(dt:number)=>{state.uiAcc+=dt;if(state.uiAcc>=1/BREATH_UI_HZ-1e-6&&Math.abs(state.breath-state.uiBreath)>.002){state.uiAcc=0;state.uiBreath=state.breath;events.breathUi=true;}};
 return {state,events,
  /** The Dive prompt's proximity test: at most WATER_PROBE_HZ a second, only while swimming at the surface (else it clears). Also
   *  refills the breath while at the surface. */
  scan(dt:number,x:number,z:number,swimming:boolean){
   clear();
   if(state.phase==='surface'&&state.breath<1){state.breath=Math.min(1,state.breath+dt/BREATH_REFILL_S);markUi(dt);}
   if(!swimming||state.phase!=='surface'){state.near=null;state.acc=Infinity;return state.near;}
   state.acc+=dt;if(state.acc<DIVE_TICK-1e-6)return state.near;state.acc=0;
   state.near=diveSpotAt(x,z,spots);return state.near;
  },
  /** Enough breath to go under (else the prompt reads "Catch your breath"). */
  get ready(){return state.breath>=BREATH_MIN_DIVE;},
  /** "Dive": go under at the near spot. False when not in a patch, already diving or out of breath. */
  start(){
   clear();const s=state.near;if(!s||state.phase!=='surface'||state.breath<BREATH_MIN_DIVE)return false;
   state.phase='diving';state.spot=s;state.x=DIVE_START.x;state.y=DIVE_START.y;state.z=DIVE_START.z;state.yaw=DIVE_START.yaw;state.vx=state.vy=state.vz=0;
   state.pitch=state.roll=state.lift=0;state.lowSaid=false;state.find=null;state.findDist=Infinity;state.used.clear();state.rise=0;state.time=0;state.effort=0;state.dives++;
   events.started=true;events.breathUi=true;state.uiBreath=state.breath;return true;
  },
  /** One frame underwater (the host calls it only while diving or rising). */
  step(dt:number,input:DiveInput){
   clear();if(state.phase==='surface')return events;
   dt=Math.max(0,Math.min(dt,.1));
   if(state.phase==='rising'){
    // The gentle way up (a tap of Surface, Escape, or the breath running out): drift up with the bubbles, then the island.
    state.rise+=dt;state.vy+=(1.6-state.vy)*(1-Math.exp(-dt*3));state.y=Math.min(DIVE_SURFACE_Y-.2,state.y+state.vy*dt);
    state.vx*=Math.exp(-dt*2);state.vz*=Math.exp(-dt*2);state.x+=state.vx*dt;state.z+=state.vz*dt;state.pitch+=(-.5-state.pitch)*(1-Math.exp(-dt*3));
    if(state.rise>=DIVE_SURFACE_S){state.phase='surface';state.spot=null;state.find=null;state.findDist=Infinity;events.surfaced=state.risingFor;}
    return events;
   }
   state.time+=dt;
   // Steering: stick left / right turns, forward / back swims along the facing (the follow camera stays behind).
   const sx=Math.max(-1,Math.min(1,input.sx)),fwd=Math.max(-1,Math.min(1,-input.sy)),stick=Math.min(1,Math.hypot(sx,fwd));
   state.yaw+=-sx*DIVE_TURN*dt*(.45+.55*Math.min(1,Math.abs(fwd)+.3));
   const target=fwd*DIVE_SPEED*(fwd<0?.5:1),fx=Math.sin(state.yaw),fz=Math.cos(state.yaw);
   const along=state.vx*fx+state.vz*fz,k=1-Math.exp(-dt*(Math.abs(target)>Math.abs(along)?DIVE_ACCEL:DIVE_DRAG));
   const nextAlong=along+(target-along)*k,side=(state.vx*fz-state.vz*fx)*Math.exp(-dt*3);
   state.vx=fx*nextAlong+fz*side;state.vz=fz*nextAlong-fx*side;
   let nx=state.x+state.vx*dt,nz=state.z+state.vz*dt;const r=Math.hypot(nx,nz);
   if(r>DIVE_ROOM_R){nx*=DIVE_ROOM_R/r;nz*=DIVE_ROOM_R/r;const n=(state.vx*nx+state.vz*nz)/(DIVE_ROOM_R||1);if(n>0){state.vx-=nx/DIVE_ROOM_R*n;state.vz-=nz/DIVE_ROOM_R*n;}}
   state.x=nx;state.z=nz;
   // Auto-level: ease toward a comfortable height over the sand (lower near a find), plus the desktop rise / sink offset.
   state.lift=Math.max(-DIVE_HOVER+DIVE_FLOOR_GAP,Math.min(DIVE_LIFT_MAX,state.lift+input.lift*DIVE_RISE*dt));
   const floor=diveFloor(state.x,state.z),findY=state.find?diveFindPoint(state.find,p).y+.3:Infinity;
   const want=Math.max(floor+DIVE_FLOOR_GAP,Math.min(DIVE_SURFACE_Y-DIVE_CEILING_GAP,Math.min(floor+DIVE_HOVER,findY)+state.lift));
   const vyWant=Math.max(-1.2,Math.min(1.2,(want-state.y)*DIVE_LEVEL));state.vy+=(vyWant-state.vy)*(1-Math.exp(-dt*3));
   state.y=Math.max(floor+DIVE_FLOOR_GAP*.8,Math.min(DIVE_SURFACE_Y-DIVE_CEILING_GAP*.8,state.y+state.vy*dt));
   // The body pitches with the climb / dive and rolls a little into turns (auto-level: both ease back to flat).
   const speed=Math.hypot(state.vx,state.vz);state.effort+=(stick-state.effort)*(1-Math.exp(-dt*4));
   state.pitch+=(Math.max(-.5,Math.min(.5,-state.vy*.35))-state.pitch)*(1-Math.exp(-dt*3));
   state.roll+=(Math.max(-.35,Math.min(.35,sx*.3*Math.min(1,speed)))-state.roll)*(1-Math.exp(-dt*3));
   // Breath: the pace lesson. Glide slow, it lasts; push the stick all the way, it goes fast.
   const drain=stick<.08?BREATH_DRAIN.glide:stick>.85?BREATH_DRAIN.push:BREATH_DRAIN.swim;
   state.breath=Math.max(0,state.breath-dt*drain/BREATH_SECONDS);markUi(dt);
   if(!state.lowSaid&&state.breath<=BREATH_LOW){state.lowSaid=true;events.low=true;}
   if(state.breath<=0){events.out=true;rise('breath');return events;}
   // The find in reach (3D): a few distance checks per frame, no allocation.
   let best:DiveFind|null=null,bestD=DIVE_FIND_RANGE;
   for(const f of state.spot!.finds){diveFindPoint(f,p);const d=Math.hypot(p.x-state.x,p.y-state.y,p.z-state.z);if(d<bestD){bestD=d;best=f;}}
   state.find=best;state.findDist=best?bestD:Infinity;
   return events;
  },
  /** Use the find in reach (its prompt's tap, or E). Each find is new once ever per spot (`found` reads the save); a burst can be
   *  touched again for the show, but credits nothing more. */
  use(){
   clear();const f=state.find,s=state.spot;if(!f||!s||state.phase!=='diving')return events;
   const first=!found(s.id).includes(f.id)&&!state.used.has(f.id);state.used.add(f.id);
   events.find=f.id;events.firstFind=first;events.coins=first?f.coins??0:0;return events;
  },
  /** Surface: the gentle drift up (a tap of Surface or Escape). `leave` ends it at once (a map trip, the island unmounting). */
  surface(reason:SurfaceReason='tap'){
   clear();if(state.phase!=='diving'&&!(reason==='leave'&&state.phase==='rising'))return events;
   if(reason==='leave'){state.phase='surface';state.spot=null;state.find=null;events.surfaced='leave';return events;}
   rise(reason);return events;
  },
  get diving(){return state.phase!=='surface';},
  reset(){clear();state.phase='surface';state.spot=null;state.near=null;state.find=null;state.breath=1;state.uiBreath=1;state.acc=Infinity;},
 };
 function rise(reason:SurfaceReason){state.phase='rising';state.rise=0;state.risingFor=reason;state.find=null;state.findDist=Infinity;}
}
export type DiveSession=ReturnType<typeof createDiveSession>;

/** Saved finds (SYNC key, lib/saves/snapshot.ts): {version:1, spots:{[spotId]: findIds}}. Unknown spots / finds are dropped. */
export const DIVE_FINDS_KEY='fi2-dive-finds-v1';
export type DiveFindsSave={version:1;spots:Record<string,string[]>};
export function parseDiveFinds(raw:unknown,spots:readonly DiveSpot[]=DIVE_SPOTS):DiveFindsSave{
 const out:DiveFindsSave={version:1,spots:{}};
 const src=raw&&typeof raw==='object'&&(raw as {spots?:unknown}).spots&&typeof (raw as {spots:unknown}).spots==='object'?(raw as {spots:Record<string,unknown>}).spots:{};
 for(const s of spots){const ids=src[s.id];if(!Array.isArray(ids))continue;const ok=ids.filter((id):id is string=>typeof id==='string'&&s.finds.some(f=>f.id===id));if(ok.length)out.spots[s.id]=[...new Set(ok)];}
 return out;
}
export function addDiveFind(save:DiveFindsSave,spot:string,find:string):DiveFindsSave{
 const have=save.spots[spot]??[];if(have.includes(find))return save;return {version:1,spots:{...save.spots,[spot]:[...have,find]}};
}
/** The wallet run for a find's coins: metered by the Training meter (lib/town/dailyMeter.ts `dive:`), and fixed, so it pays once ever. */
export const diveRunId=(spot:string,find:string)=>`dive:${spot}:${find}`;
