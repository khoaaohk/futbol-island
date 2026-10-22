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
import {DIVE_FIND_RANGE,DIVE_ROOM_R,DIVE_SURFACE_Y,diveFindPoint,diveDepthRange,diveOnCrest,diveSpotAt,type DiveFind,type DiveSpot,DIVE_SPOTS} from './diveSpots';
import {WATER_PROBE_HZ} from './waterDepth';
import {DIVE_EDGE,diveEdgeBeyond,diveEdgeRim} from './diveEdge';

/** One full breath at an easy swim (s), and how fast it drains: gliding (stick still), an easy swim, the stick pushed all the way.
 *  (45 s before the Oct 20 2026 shallow reef: the reef is shallow and for young kids, so the breath lasts longer.) */
export const BREATH_SECONDS=70;
export const BREATH_DRAIN={glide:.6,swim:1,push:1.8} as const;
/** The calm "time to head up" note, and the gentle float up at 0. */
export const BREATH_LOW=.2;
/** A full refill at the surface takes this long (s); a new dive waits for this much breath. */
export const BREATH_REFILL_S=6,BREATH_MIN_DIVE=.25;
/** The breath meter's CSS variable is written at most this often (Hz) by the host. */
export const BREATH_UI_HZ=10;
/** The swim (m/s): top speed, how fast it gets there and how fast the water slows you (floaty); turning (rad/s at full stick). */
/* Oct 21 2026 (user: swim a little faster underwater): 2.4 -> 3.2 m/s, quicker pick-up, a little quicker turning and depth change. */
export const DIVE_SPEED=3.2,DIVE_ACCEL=3,DIVE_DRAG=1.6,DIVE_TURN=2.2;
/** Gliding over the shallow reef (Oct 20 2026, user: "not really diving deep, but more about going through a coral reef area"): the
 *  diver keeps a place in the water between the surface and the sand (`depthT`: 0 just under the surface .. 1 low over the sand)
 *  and follows the seabed, so a rising reef lifts them (no clipping, no hard step). ▲ / ▼ (phone) or Q / Z (desktop) rise or dip
 *  lower at about DIVE_VSPEED m/s; neither held keeps the place. DIVE_FOLLOW is how fast the body eases onto the followed height. */
export const DIVE_VSPEED=1.6,DIVE_FOLLOW=4;
/** Holding ▲ / Q (Oct 22 2026, user: "When holding the up btn, it will rise up all the way"): the rise eases in over `ease` s to `up` ×
 *  DIVE_VSPEED and carries on to the top of the water (depthT 0, the surface where the breath refills); holding ▼ / Z eases to `down` ×
 *  (gentler) down to the sand clearance. Let go: the depth holds. A tap is a small step (the first frames are at the normal speed).
 *  While held the body follows its depth `follow` × faster, so it never lags behind the button. */
export const DIVE_LIFT={up:2,down:1.3,ease:1.2,follow:2} as const;
/** The rise / dip speed multiplier after holding for `held` s in direction `dir` (+1 up, -1 down): 1 at the press, easing (smoothstep)
 *  to DIVE_LIFT.up / .down by DIVE_LIFT.ease s. */
export function diveLiftSpeed(held:number,dir:number){const k=Math.max(0,Math.min(1,held/DIVE_LIFT.ease)),e=k*k*(3-2*k);return 1+((dir>0?DIVE_LIFT.up:DIVE_LIFT.down)-1)*e;}
/** Explore v2 (Oct 21 2026) swim feel: with the stick let go the diver GLIDES (a lower drag, DIVE_GLIDE_DRAG, so a kick carries).
 *  DIVE_BANK is the roll into a turn at full stick and speed (rad). The Dart burst (5.4 m/s, F / Shift, the Dart button) was REMOVED
 *  Oct 21/22 2026 by user decision ("let's remove the dart action"): normal swimming only. */
export const DIVE_GLIDE_DRAG=.75,DIVE_BANK=.5;
/** Explore delight (Oct 21 2026): the glide carried kids past a find's prompt, so near anything still to collect (a journey pickup, an
 *  unused find, today's sparkle) the water gets a little thicker: within `far` m the drag rises up to ×`drag` and the top speed eases
 *  down by up to `speed`, fully at `near` m (an eased curve, never a sudden brake). Elsewhere the swim is unchanged. */
export const FIND_SLOW={near:1.4,far:4,drag:1.6,speed:.25} as const;
/** 0 (far, or nothing near) .. 1 (right by it): smoothstep over FIND_SLOW.far .. near. */
export function findSlow(d:number){if(!(d<FIND_SLOW.far))return 0;const t=Math.max(0,Math.min(1,(FIND_SLOW.far-d)/(FIND_SLOW.far-FIND_SLOW.near)));return t*t*(3-2*t);}
/** Where a dive starts in the water column (depthT). */
export const DIVE_START_T=.45;
/** "Surface to breathe": the reef is shallow, so the surface is always right above. At the top (depthT under DIVE_TOP_T) the diver
 *  sips air and the breath refills over BREATH_TOP_REFILL_S instead of draining. */
export const DIVE_TOP_T=.06,BREATH_TOP_REFILL_S=8;
/** After surfacing the Dive prompt waits this long (s) before it shows again (water audit P0: R / E dived straight back in). */
export const DIVE_REARM_S=2;
/** ONE breath for both dives (Oct 20 2026, user decision "unify the two Dives"):
 *  - the REEF dive (the floating Dive pill over a zone's buoy, or E): the sealed reef room, ▲ ▼ / Q Z rise and dip, finds;
 *  - the DUCK-DIVE (the water cluster's Dive button / Q at the surface anywhere, waterState.ts DIVE): a short dip under the swimmer,
 *    lighter: no room, no finds; it drains the same breath at the easy-swim rate × DUCK_DRAIN, waits on BREATH_MIN_DIVE like the reef,
 *    and when the breath runs out the diver pops up with the same calm note (and the same wa:dive_breath_out count).
 *  Both refill at the surface over BREATH_REFILL_S and show the same Breath ring (only while swimming or diving). */
export const DUCK_DRAIN=1;
/** Surfacing: the room's going-up fade (s) before the island shows again (quick: the surface is right above). */
export const DIVE_SURFACE_S=.45;
/** Where the diver starts (room-local, just under the surface at the reef's deeper edge) and the facing (toward −z, the crest). */
export const DIVE_START={x:0,y:DIVE_SURFACE_Y-1.2,z:13,yaw:Math.PI} as const;
/** The proximity tick at the surface (s): the water probe's own rate. */
export const DIVE_TICK=1/WATER_PROBE_HZ;
/** The football hook, once per device (the swim lesson's toast). A coaching idea, no fact claim. */
export const DIVE_LESSON={title:'Pace your breath',text:'Glide slowly and your breath lasts longer, and rise to the top for a quick breath. Sprint everywhere and it runs out fast, like a midfielder’s legs in a long match.',kind:'Coaching idea'} as const;
export const DIVE_LESSON_KEY='fi2-dive-lesson-v1';
export const DIVE_LOW_NOTE='Running low on breath: rise to the top for air.',DIVE_OUT_NOTE='Well done! You floated up for a breath.';

export type DivePhase='surface'|'diving'|'rising';
/** `edge` (Seamless Explore, diveEdge.ts): swum out across the zone's edge, still under the water (the island's duck-dive goes on). */
export type SurfaceReason='tap'|'breath'|'leave'|'fly'|'edge';
export type DiveEvents={
 /** The dive just began (the host builds the room, sleeps the island) / ended (the host disposes it, wakes the island). */
 started:boolean;surfaced:SurfaceReason|'';
 /** Breath crossed BREATH_LOW (once per dive) / ran out (the gentle float up starts). */
 low:boolean;out:boolean;
 /** A find was used: its id, whether it is new (saved, credited once) and its coins (0 when not new or none). */
 find:string;firstFind:boolean;coins:number;
 /** The breath meter changed enough to redraw (≤ BREATH_UI_HZ). */
 breathUi:boolean;
 /** The diver reached the reef crest for the first time this dive (analytics wa:dive_crest; wa:dive_deep is kept for old data). */
 crest:boolean;
};
export type DiveInput={
 /** Stick: x right, y DOWN (the island's convention: −1 = forward), each −1..1 (keys + joystick). */
 sx:number;sy:number;
 /** Rise (+1) / dip lower (−1): ▲ ▼ on phones, Q / Z on desktop. */
 lift:number;
 /** Explore delight: the distance (m) to the nearest thing still to collect (the runtime's pickups, finds, sparkle), for findSlow. */
 near?:number;
};

export function createDiveSession(spots:readonly DiveSpot[]=DIVE_SPOTS,found:(spot:string)=>readonly string[]=()=>[]){
 const p={x:0,y:0,z:0};
 const state={phase:'surface' as DivePhase,spot:null as DiveSpot|null,
  /** The patch the swimmer is in at the surface (the Dive prompt), by the 10 Hz test. */
  near:null as DiveSpot|null,acc:Infinity,
  /** Room-local diver: position, velocity, facing (rig yaw: forward = (sin, cos)), pitch (rad, + nose down), roll, lift offset. */
  x:0,y:0,z:0,vx:0,vy:0,vz:0,yaw:0,pitch:0,roll:0,lift:0,liftHeld:0,lift0:0,
  /** Breath 0..1 (refills at the surface), the last value the UI drew, its clock; whether the low note fired this dive. */
  breath:1,uiBreath:1,uiAcc:0,lowSaid:false,
  /** The find in reach (3D, DIVE_FIND_RANGE) and its distance; finds used this dive; the rising fade (s). */
  find:null as DiveFind|null,findDist:Infinity,used:new Set<string>(),rise:0,risingFor:'tap' as SurfaceReason,
  /** Seconds underwater this dive, and dives this page (tests and analytics). */
  time:0,dives:0,
  /** How hard the diver is swimming (0..1, for the pose and the bubbles). */
  effort:0,
  /** Seconds before the Dive prompt re-arms after surfacing; whether the near-shore duck-dive is under (it shares the breath). */
  hold:0,ducking:false,
  /** The place in the water column (0 just under the surface .. 1 low over the sand), whether the diver is at the top sipping air,
   *  and whether the reef crest was reached this dive. */
  depthT:DIVE_START_T,atTop:false,onCrest:false,
  /** Explore delight: the find slow-down this frame (0..1, findSlow). */
  slow:0,
  /** Seamless Explore: seconds before the zone's edge may be crossed again (DIVE_EDGE.cooldown after each crossing, both ways), and
   *  whether this dive came in across the edge. */
  edgeCd:0,viaEdge:false};
 const range={min:0,max:0};
 const events:DiveEvents={started:false,surfaced:'',low:false,out:false,find:'',firstFind:false,coins:0,breathUi:false,crest:false};
 const clear=()=>{events.started=events.low=events.out=events.firstFind=events.breathUi=events.crest=false;events.surfaced='';events.find='';events.coins=0;};
 const heightFor=(t:number)=>range.max-(range.max-range.min)*t;
 const markUi=(dt:number)=>{state.uiAcc+=dt;if(state.uiAcc>=1/BREATH_UI_HZ-1e-6&&Math.abs(state.breath-state.uiBreath)>.002){state.uiAcc=0;state.uiBreath=state.breath;events.breathUi=true;}};
 return {state,events,
  /** The Dive prompt's proximity test: at most WATER_PROBE_HZ a second, only while swimming at the surface (else it clears). Also
   *  refills the breath while at the surface. */
  scan(dt:number,x:number,z:number,swimming:boolean){
   clear();
   if(state.phase==='surface'&&state.breath<1&&!state.ducking){state.breath=Math.min(1,state.breath+dt/BREATH_REFILL_S);markUi(dt);}
   if(state.hold>0)state.hold=Math.max(0,state.hold-dt);// just surfaced: the Dive prompt waits (R stays the jetpack, no instant re-dive)
   if(!swimming||state.phase!=='surface'||state.hold>0){state.near=null;state.acc=Infinity;return state.near;}
   state.acc+=dt;if(state.acc<DIVE_TICK-1e-6)return state.near;state.acc=0;
   state.near=diveSpotAt(x,z,spots);return state.near;
  },
  /** The near-shore duck-dive's frame (Town, each island frame while in the sea): `under` = waterState's dive is going / gone under.
   *  Drains the shared breath while under (no refill meanwhile); `events.low` / `events.out` as in the reef (the host then surfaces
   *  the duck-dive). Does nothing during a reef dive. */
  duck(dt:number,under:boolean){
   clear();if(state.edgeCd>0)state.edgeCd=Math.max(0,state.edgeCd-Math.max(0,dt));if(state.phase!=='surface'){state.ducking=false;return events;}
   state.ducking=under;if(!under){if(state.breath>BREATH_LOW)state.lowSaid=false;return events;}
   state.breath=Math.max(0,state.breath-Math.max(0,dt)*BREATH_DRAIN.swim*DUCK_DRAIN/BREATH_SECONDS);markUi(dt);
   if(!state.lowSaid&&state.breath<=BREATH_LOW){state.lowSaid=true;events.low=true;}
   if(state.breath<=0){events.out=true;state.ducking=false;}
   return events;
  },
  /** The duck-dive may start (shared rule with the reef: enough breath). */
  get duckReady(){return state.breath>=BREATH_MIN_DIVE;},
  /** Enough breath to go under (else the prompt reads "Catch your breath"). */
  get ready(){return state.breath>=BREATH_MIN_DIVE;},
  /** "Dive": go under at the near spot. False when not in a patch, already diving or out of breath. */
  start(){
   clear();const s=state.near;if(!s||state.phase!=='surface'||state.breath<BREATH_MIN_DIVE)return false;
   begin(s,DIVE_START.x,DIVE_START.z,DIVE_START.yaw,0,DIVE_START_T);state.lowSaid=false;state.viaEdge=false;state.edgeCd=DIVE_EDGE.cooldown;return true;
  },
  /** Seamless Explore (diveEdge.ts): swum in under the water across the zone's edge. Arrives at the room point (x, z) with the facing
   *  and speed carried on and the place in the water column from the island dive; the breath goes on as it was (no refill). False
   *  while the edge waits (DIVE_EDGE.cooldown), just after surfacing (DIVE_REARM_S), already in a room, or nearly out of breath. */
  enterAt(s:DiveSpot,x:number,z:number,yaw:number,speed:number,depthT:number){
   clear();if(state.phase!=='surface'||state.edgeCd>0||state.hold>0||state.breath<DIVE_EDGE.minBreath)return false;
   begin(s,x,z,yaw,Math.max(0,Math.min(DIVE_SPEED,speed)),Math.max(0,Math.min(1,depthT)));state.lowSaid=state.breath<=BREATH_LOW;state.viaEdge=true;state.edgeCd=DIVE_EDGE.cooldown;state.ducking=false;return true;
  },
  /** One frame underwater (the host calls it only while diving or rising). */
  step(dt:number,input:DiveInput){
   clear();if(state.phase==='surface')return events;
   dt=Math.max(0,Math.min(dt,.1));
   if(state.phase==='rising'){
    // The gentle way up (a tap of Surface, Escape, or the breath running out): drift up with the bubbles, then the island.
    state.rise+=dt;state.vy+=(1.6-state.vy)*(1-Math.exp(-dt*3));state.y=Math.min(DIVE_SURFACE_Y-.2,state.y+state.vy*dt);
    state.vx*=Math.exp(-dt*2);state.vz*=Math.exp(-dt*2);state.x+=state.vx*dt;state.z+=state.vz*dt;state.pitch+=(-.5-state.pitch)*(1-Math.exp(-dt*3));
    if(state.rise>=DIVE_SURFACE_S){state.phase='surface';state.hold=DIVE_REARM_S;state.spot=null;state.find=null;state.findDist=Infinity;events.surfaced=state.risingFor;}
    return events;
   }
   state.time+=dt;
   // Steering: stick left / right turns, forward / back swims along the facing (the follow camera stays behind).
   const sx=Math.max(-1,Math.min(1,input.sx)),fwd=Math.max(-1,Math.min(1,-input.sy)),stick=Math.min(1,Math.hypot(sx,fwd));
   state.yaw+=-sx*DIVE_TURN*dt*(.45+.55*Math.min(1,Math.abs(fwd)+.3));
   const fx=Math.sin(state.yaw),fz=Math.cos(state.yaw);
   // Explore delight: near something still to collect the water is a little thicker (findSlow: more drag, a lower top speed).
   const slow=findSlow(input.near??Infinity),thick=1+(FIND_SLOW.drag-1)*slow;state.slow=slow;
   const top=1-FIND_SLOW.speed*slow,target=fwd*DIVE_SPEED*(fwd<0?.5:1)*top;
   const along=state.vx*fx+state.vz*fz,k=1-Math.exp(-dt*(Math.abs(target)>Math.abs(along)?DIVE_ACCEL:(stick<.08?DIVE_GLIDE_DRAG:DIVE_DRAG)*thick));
   const nextAlong=along+(target-along)*k,side=(state.vx*fz-state.vz*fx)*Math.exp(-dt*3);
   state.vx=fx*nextAlong+fz*side;state.vz=fz*nextAlong-fx*side;
   // Seamless Explore (diveEdge.ts): the rim (the zone's blob outline in room metres) is a doorway. DIVE_EDGE.exitOut m past it the
   // diver leaves for the island (still under: the duck-dive); while the edge waits after a crossing it holds there like a wall.
   if(state.edgeCd>0)state.edgeCd=Math.max(0,state.edgeCd-dt);
   let nx=state.x+state.vx*dt,nz=state.z+state.vz*dt;const r=Math.hypot(nx,nz),lim=Math.min(DIVE_ROOM_R,diveEdgeRim(state.spot!,Math.atan2(nz,nx))+DIVE_EDGE.exitOut);
   if(r>=lim&&state.edgeCd<=0){state.x=nx;state.z=nz;state.phase='surface';state.hold=DIVE_REARM_S;state.edgeCd=DIVE_EDGE.cooldown;state.spot=null;state.find=null;state.findDist=Infinity;state.ducking=true;events.surfaced='edge';return events;}
   if(r>lim){nx*=lim/r;nz*=lim/r;const n=(state.vx*nx+state.vz*nz)/(lim||1);if(n>0){state.vx-=nx/lim*n;state.vz-=nz/lim*n;}}
   state.x=nx;state.z=nz;
   // Rise / dip lower, then follow the seabed: the place in the water column (depthT) is kept while the reef rises or falls
   // under the diver, so a rising crest lifts them smoothly; the sand and the surface are hard limits (never clipped).
   const fl=state.spot!.floor,lift=Math.max(-1,Math.min(1,input.lift));state.lift=lift;
   diveDepthRange(state.x,state.z,fl,range);const span=Math.max(.3,range.max-range.min);
   // Held ▲ / ▼: the speed eases in (diveLiftSpeed) and carries on to the top / the sand; the direction's hold clock resets on release.
   state.liftHeld=lift===0||Math.sign(lift)!==Math.sign(state.lift0)?0:state.liftHeld+dt;state.lift0=lift;
   state.depthT=Math.max(0,Math.min(1,state.depthT-lift*DIVE_VSPEED*diveLiftSpeed(state.liftHeld,lift)*dt/span));
   const y0=state.y;let y=y0+(heightFor(state.depthT)-y0)*(1-Math.exp(-dt*DIVE_FOLLOW*(lift!==0?DIVE_LIFT.follow:1)));
   if(y<range.min)y=range.min;if(y>range.max)y=range.max;
   state.y=y;state.vy=dt>0?(y-y0)/dt:0;state.atTop=state.depthT<DIVE_TOP_T&&y>range.max-.08;
   if(!state.onCrest&&diveOnCrest(state.x,state.z,fl)){state.onCrest=true;events.crest=true;}
   // The body pitches with the climb / dive and rolls a little into turns (auto-level: both ease back to flat).
   const speed=Math.hypot(state.vx,state.vz);state.effort+=(stick-state.effort)*(1-Math.exp(-dt*4));
   state.pitch+=(Math.max(-.5,Math.min(.5,-state.vy*.35))-state.pitch)*(1-Math.exp(-dt*3));
   state.roll+=(Math.max(-DIVE_BANK,Math.min(DIVE_BANK,sx*DIVE_BANK*Math.min(1,.25+speed/DIVE_SPEED)))-state.roll)*(1-Math.exp(-dt*3));
   // Breath: the pace lesson. Glide slow, it lasts; push the stick all the way, it goes fast; at the top, a sip of air refills it.
   // No depth penalty: the whole reef is shallow.
   const base=Math.max(stick,Math.abs(input.lift)*.6);
   if(state.atTop)state.breath=Math.min(1,state.breath+dt/BREATH_TOP_REFILL_S);
   else state.breath=Math.max(0,state.breath-dt*(base<.08?BREATH_DRAIN.glide:base>.85?BREATH_DRAIN.push:BREATH_DRAIN.swim)/BREATH_SECONDS);
   markUi(dt);
   if(!state.lowSaid&&state.breath<=BREATH_LOW){state.lowSaid=true;events.low=true;}
   if(state.breath<=0){events.out=true;rise('breath');return events;}
   // The find in reach (3D): a few distance checks per frame, no allocation.
   let best:DiveFind|null=null,bestD=DIVE_FIND_RANGE;
   for(const f of state.spot!.finds){if(f.kind==='ball'&&state.used.has(f.id))continue;/* the hidden explore ball is gone once picked up (diveBalls.ts) */diveFindPoint(f,p,fl);const d=Math.hypot(p.x-state.x,p.y-state.y,p.z-state.z);if(d<bestD){bestD=d;best=f;}}
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
   if(reason==='fly')reason='leave';
   clear();if(state.phase!=='diving'&&!(reason==='leave'&&state.phase==='rising'))return events;
   if(reason==='leave'){state.phase='surface';state.hold=DIVE_REARM_S;state.spot=null;state.find=null;events.surfaced='leave';return events;}
   rise(reason);return events;
  },
  get diving(){return state.phase!=='surface';},
  /** How far past the rim the diver is (room m; negative inside): the HUD's "Leaving the reef" hint and the tests. */
  get beyond(){return state.spot?diveEdgeBeyond(state.spot,state.x,state.z):-Infinity;},
  reset(){clear();state.phase='surface';state.spot=null;state.near=null;state.find=null;state.breath=1;state.uiBreath=1;state.acc=Infinity;},
 };
 function begin(s:DiveSpot,x:number,z:number,yaw:number,speed:number,depthT:number){
  state.phase='diving';state.spot=s;state.x=x;state.z=z;state.yaw=yaw;state.vx=Math.sin(yaw)*speed;state.vz=Math.cos(yaw)*speed;state.vy=0;
  state.pitch=state.roll=state.lift=0;state.liftHeld=state.lift0=0;state.depthT=depthT;state.atTop=false;state.onCrest=false;
  diveDepthRange(state.x,state.z,s.floor,range);state.y=heightFor(state.depthT);state.find=null;state.findDist=Infinity;state.used.clear();for(const f of s.finds)if(f.kind==='ball'&&found(s.id).includes(f.id))state.used.add(f.id);state.rise=0;state.time=0;state.effort=0;state.dives++;
  events.started=true;events.breathUi=true;state.uiBreath=state.breath;
 }
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
