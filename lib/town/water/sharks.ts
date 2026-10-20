// Sharks circle the swimmer (water phase P1a, Oct 15 2026; user: "when near sharks, have the sharks circle around the
// character when in the water"; docs/swimming-research.md §2.5 and "P1a implemented").
//
// Pure (no three.js, no DOM): when a swimmer comes within SHARK_TRIGGER of a shark, up to SHARK_MAX of that region's
// nearest sharks leave their patrol loops and orbit the swimmer on a staggered ring, then peel back to their loops after
// SHARK_HOLD seconds, or at once when the swimmer reaches wading depth or takes off. No health, no harm: they are curious.
// Football (AGENTS.md): the defenders are closing in, so keep your head up and find the open side (SHARK_LESSON).
//
// Heat: the proximity test runs at the water probe's rate (WATER_PROBE_HZ, 10 Hz) and only while swimming; on land, wading
// or flying it is not called at all. The ring is placed by caySharks.ts inside its existing per-region matrix pass (the
// same instances, the same compose per shark: 0 new meshes, materials or draws); `frame` is a few scalars per frame, and
// only while a circle or its peel-off is live (`busy`). No allocation after creation, no timer, no loop of its own.
import {WATER_PROBE_HZ} from './waterDepth';

/** The character's line (user decision, Oct 15 2026): kid-safe. */
export const SHARK_LINE='Uh oh!';
/** How long the bubble stays up over the head (s). */
export const SHARK_BUBBLE_S=1.5;
/** A shark fin this close to the swimmer starts the circle (m). */
export const SHARK_TRIGGER=14;
/** At most this many sharks circle, picked nearest first within SHARK_GATHER of the swimmer (m). */
export const SHARK_MAX=3,SHARK_GATHER=26;
/**
 * The ring (Oct 20 2026, user: "doesn't circle properly around the player, follows weird"): a steady ~6-8 m radius, never
 * closer than SHARK_RING_MIN. Each shark keeps its own radius inside the water: at the probe rate it looks a little ahead
 * on its arc, and where that point is land or too shallow for its body (SHARK_ROOM of seabed depth) it eases inward, then
 * back out (a kidney-shaped orbit that hugs the open side, never over the beach).
 */
export const SHARK_RING=7,SHARK_RING_MIN=2.8,SHARK_SHORE_GAP=.7,SHARK_ROOM=1.9,SHARK_LOOK=.45;
/** Staggered slots: angular offsets (rad, not evenly spaced) and radius factors (6.3-7.7 m), so the fins never line up. */
export const SHARK_SLOTS=[[0,1],[2.25,1.1],[4.15,.9]] as const;
/** Cruise speed along the ring (m/s): slow and steady (a full turn ≈ 40 s). */
export const SHARK_SPEED=1.1;
/** The body's centre keeps this far above the seabed (m): the deepest it may swim is the bed depth minus this. */
export const SHARK_BED_CLEAR=.65;
/** Heading: how fast the shark turns toward where it is actually going (1/s), and the bank into the turn (rad per rad/s, max). */
export const SHARK_TURN=3,SHARK_BANK=.9,SHARK_BANK_MAX=.32;
/** They lose interest after this long (s). */
export const SHARK_HOLD=12;
/** Seconds to blend from the loop onto the ring (an eased glide in, no dash or pop), and back. */
export const SHARK_JOIN=5,SHARK_LEAVE=4;
/** Not again for this long after a circle ends (s): a swimmer near the causeway is not circled back to back. */
export const SHARK_COOLDOWN=25;
/** The ring centre follows the swimmer on a critically damped spring of this rate (1/s): smooth, lagging, never overshooting. */
export const SHARK_FOLLOW=1.1;
/** The proximity tick (s): the water probe's own rate. */
export const SHARK_TICK=1/WATER_PROBE_HZ;
/** The football hook (once per device, the swim lesson's toast). */
export const SHARK_LESSON={title:'Defenders closing in',text:'Keep your head up and find the open side.',kind:'Coaching idea'} as const;
export const SHARK_LESSON_KEY='fi2-shark-lesson-v1';

export type SharkEnd=''|'shore'|'bored';
/** Where the sharks are: one entry per region (caySharks.ts), `at` writes shark i's current fin position into `out`. */
export type SharkSchools={count:number;region(r:number):{active:number;awake:boolean};at(r:number,i:number,out:{x:number;z:number}):void};
export type SharkEvents={started:boolean;ended:SharkEnd};
export type SharkSwimmer={x:number;z:number;swimming:boolean;distanceToLand:number};

const ease=(t:number)=>t<=0?0:t>=1?1:t*t*(3-2*t);
const wrap=(a:number)=>{a%=Math.PI*2;return a>Math.PI?a-Math.PI*2:a<-Math.PI?a+Math.PI*2:a;};

/**
 * `land` is the island's cheap land test (polygons and boxes), used at the pick and the probe rate to keep a shark off the
 * banks; `bed` (optional) is the seabed depth under the water line at (x, z) as the clear water draws it (Infinity: open sea).
 */
export function createSharkCircle(land:(x:number,z:number)=>boolean,bed:(x:number,z:number)=>number=()=>Infinity){
 const ids=new Int8Array(SHARK_MAX).fill(-1),slot=new Int8Array(SHARK_MAX).fill(-1);
 const blend=new Float32Array(SHARK_MAX);
 // Per slot: the eased radius and its target, the depth cap (centre depth, m) and its target, the heading state.
 const rad=new Float32Array(SHARK_MAX),radT=new Float32Array(SHARK_MAX),cap=new Float32Array(SHARK_MAX).fill(Infinity),capT=new Float32Array(SHARK_MAX).fill(Infinity);
 const hx=new Float32Array(SHARK_MAX),hz=new Float32Array(SHARK_MAX),hyaw=new Float32Array(SHARK_MAX),hroll=new Float32Array(SHARK_MAX),has=new Uint8Array(SHARK_MAX);
 const best=new Float32Array(SHARK_MAX),bestI=new Int8Array(SHARK_MAX);
 const p={x:0,z:0};
 const state={active:false,region:-1,n:0,angle:0,radius:SHARK_RING,timer:0,cooldown:0,cx:0,cz:0,vx:0,vz:0,tx:0,tz:0,acc:0,leaving:false,dt:0};
 const events:SharkEvents={started:false,ended:''};
 /** No land on the straight line from a shark to its ring (3 samples): the shark swims round a bank, never through it. */
 const clear=(ax:number,az:number,bx:number,bz:number)=>{for(const t of [.25,.5,.75])if(land(ax+(bx-ax)*t,az+(bz-az)*t))return false;return !land(bx,bz);};
 /** Room for a shark at (x, z): water, and deep enough for its body. */
 const room=(x:number,z:number)=>!land(x,z)&&bed(x,z)>=SHARK_ROOM;
 /** The safe radius on bearing `a` round (cx, cz): the full `r`, stepped in while the point there or a little ahead on the arc has no room. */
 function safeRadius(cx:number,cz:number,a:number,r:number){
  for(;r>SHARK_RING_MIN;r-=.7)if(room(cx+Math.cos(a)*r,cz+Math.sin(a)*r)&&room(cx+Math.cos(a+SHARK_LOOK)*r,cz+Math.sin(a+SHARK_LOOK)*r))break;
  return Math.max(SHARK_RING_MIN,r);}
 function end(reason:SharkEnd){state.active=false;state.leaving=true;state.cooldown=SHARK_COOLDOWN;events.ended=reason;}
 function pick(sw:SharkSwimmer,schools:SharkSchools){
  for(let r=0;r<schools.count;r++){const reg=schools.region(r);if(!reg.awake||reg.active<=0)continue;
   let near=Infinity;best.fill(Infinity);bestI.fill(-1);
   for(let i=0;i<reg.active;i++){schools.at(r,i,p);const d=Math.hypot(p.x-sw.x,p.z-sw.z);if(d<near)near=d;
    if(d>SHARK_GATHER)continue;
    // Insertion into the nearest-SHARK_MAX list (no sort, no allocation).
    let k=SHARK_MAX-1;if(d>=best[k])continue;while(k>0&&best[k-1]>d){best[k]=best[k-1];bestI[k]=bestI[k-1];k--;}best[k]=d;bestI[k]=i;}
   if(near>SHARK_TRIGGER)continue;
   const radius=SHARK_RING;let n=0,base=NaN;
   for(let k=0;k<SHARK_MAX;k++){const i=bestI[k];if(i<0)continue;schools.at(r,i,p);
    const a=Math.atan2(p.z-sw.z,p.x-sw.x);if(Number.isNaN(base))base=a;
    // The slot nearest this shark's bearing that is still free: sharks join the ring without crossing each other.
    let s=-1,gap=Infinity;for(let j=0;j<SHARK_MAX;j++){let used=false;for(let m=0;m<n;m++)if(slot[m]===j)used=true;if(used)continue;
     const g=Math.abs(wrap(base+SHARK_SLOTS[j][0]-a));if(g<gap){gap=g;s=j;}}
    const ta=base+SHARK_SLOTS[s][0],tr=safeRadius(sw.x,sw.z,ta,radius*SHARK_SLOTS[s][1]);
    if(!clear(p.x,p.z,sw.x+Math.cos(ta)*tr,sw.z+Math.sin(ta)*tr))continue;
    ids[n]=i;slot[n]=s;blend[n]=0;rad[n]=radT[n]=tr;cap[n]=capT[n]=Math.max(0,bed(sw.x+Math.cos(ta)*tr,sw.z+Math.sin(ta)*tr)-SHARK_BED_CLEAR);has[n]=0;n++;}
   if(n===0)continue;
   for(let m=n;m<SHARK_MAX;m++){ids[m]=-1;slot[m]=-1;blend[m]=0;}
   state.active=true;state.leaving=false;state.region=r;state.n=n;state.angle=base;state.radius=radius;state.timer=0;
   state.cx=state.tx=sw.x;state.cz=state.tz=sw.z;state.vx=state.vz=0;events.started=true;return;}
 }
 const api={state,ids,slot,blend,events,
  /** True while a circle or its peel-off is live: only then does anything run per frame. */
  get busy(){return state.active||state.leaving;},
  /**
   * The proximity tick. Call every frame while in the water (it accumulates and works at WATER_PROBE_HZ); on land call
   * nothing (or `release()` once). Returns the events of this call (started / ended).
   */
  tick(dt:number,sw:SharkSwimmer,schools:SharkSchools):SharkEvents{
   events.started=false;events.ended='';
   if(state.cooldown>0)state.cooldown=Math.max(0,state.cooldown-dt);
   if(state.active){state.timer+=dt;if(!sw.swimming){end('shore');return events;}state.tx=sw.x;state.tz=sw.z;/* every frame: the centre's spring sees a smooth target, not 10 Hz steps */}
   state.acc+=dt;if(state.acc<SHARK_TICK-1e-6)return events;state.acc=0;
   if(state.active){
    for(let m=0;m<state.n;m++){const s=SHARK_SLOTS[slot[m]],a=state.angle+s[0];radT[m]=safeRadius(state.tx,state.tz,a,state.radius*s[1]);capT[m]=Math.max(0,bed(state.cx+Math.cos(a)*rad[m],state.cz+Math.sin(a)*rad[m])-SHARK_BED_CLEAR);}
    if(state.timer>=SHARK_HOLD)end('bored');return events;}
   if(sw.swimming&&!state.leaving&&state.cooldown<=0)pick(sw,schools);
   return events;},
  /** The swimmer climbed out, took off or the island closed: peel off now (counts as reaching the shore). */
  release():SharkEvents{events.started=false;events.ended='';if(state.active)end('shore');return events;},
  /** Per frame, only while `busy`: the ring turns, its centre follows the swimmer, the sharks blend on or off. */
  frame(dt:number){
   state.dt=0;if(!api.busy||dt<=0)return;dt=Math.min(dt,.1);state.dt=dt;
   // Critically damped spring: the ring centre glides after the swimmer (no 10 Hz steps, no wobble, no overshoot).
   const w=SHARK_FOLLOW;state.vx+=(w*w*(state.tx-state.cx)-2*w*state.vx)*dt;state.vz+=(w*w*(state.tz-state.cz)-2*w*state.vz)*dt;state.cx+=state.vx*dt;state.cz+=state.vz*dt;
   state.angle=wrap(state.angle+SHARK_SPEED/state.radius*dt);
   let live=false;const fr=1-Math.exp(-.7*dt),fc=1-Math.exp(-1.2*dt);
   for(let m=0;m<state.n;m++){blend[m]=state.active?Math.min(1,blend[m]+dt/SHARK_JOIN):Math.max(0,blend[m]-dt/SHARK_LEAVE);if(blend[m]>0)live=true;
    rad[m]+=(radT[m]-rad[m])*fr;cap[m]=Number.isFinite(cap[m])&&Number.isFinite(capT[m])?cap[m]+(capT[m]-cap[m])*fc:capT[m];}
   if(!state.active&&!live){state.leaving=false;state.n=0;state.region=-1;ids.fill(-1);slot.fill(-1);has.fill(0);}
  },
  /**
   * caySharks.ts's matrix pass: shark `i` of region `r` at its loop position (`pos`, yaw in `pos.yaw`). When it is circling,
   * moves it toward its ring slot by the eased blend, faces it where it is really going (its own motion, so a ring that
   * follows the swimmer never makes it slide sideways or swim backwards), banks it into the turn (`pos.roll`) and caps its
   * depth above the seabed (`pos.cap`, m under the line). Returns whether it changed anything.
   */
  place(r:number,i:number,pos:{x:number;z:number;yaw:number;roll:number;cap:number}){
   if(r!==state.region||state.n===0)return false;
   let m=-1;for(let k=0;k<state.n;k++)if(ids[k]===i){m=k;break;}
   if(m<0||blend[m]<=0)return false;
   const s=SHARK_SLOTS[slot[m]],a=state.angle+s[0],rr=rad[m],w=ease(blend[m]);
   const rx=state.cx+Math.cos(a)*rr,rz=state.cz+Math.sin(a)*rr;
   const loopYaw=pos.yaw;pos.x+=(rx-pos.x)*w;pos.z+=(rz-pos.z)*w;
   if(!has[m]){has[m]=1;hx[m]=pos.x;hz[m]=pos.z;hyaw[m]=loopYaw;hroll[m]=0;}
   const dt=state.dt,dx=pos.x-hx[m],dz=pos.z-hz[m];
   if(dt>0){
    // caySharks' yaw convention is atan2(-dz, dx); turn toward the motion at a steady rate, bank by the turn rate.
    let turn=0;if(dx*dx+dz*dz>1e-8){const k=Math.min(1,SHARK_TURN*dt);turn=wrap(Math.atan2(-dz,dx)-hyaw[m])*k;hyaw[m]=wrap(hyaw[m]+turn);}
    const bank=Math.max(-SHARK_BANK_MAX,Math.min(SHARK_BANK_MAX,-turn/dt*SHARK_BANK));hroll[m]+=(bank-hroll[m])*Math.min(1,2.5*dt);
    hx[m]=pos.x;hz[m]=pos.z;}
   // The heading leads the glide in (it turns before the body arrives) and hands back to the loop's on the way out.
   const h=ease(Math.min(1,blend[m]*2.5));pos.yaw=loopYaw+wrap(hyaw[m]-loopYaw)*h;pos.roll=hroll[m]*h;
   pos.cap=cap[m]+10*(1-w);return true;},
  /** Where slot m sits on the ring right now (tests). */
  ringPoint(m:number,out:{x:number;z:number}){const s=SHARK_SLOTS[slot[m]],a=state.angle+s[0],rr=rad[m];out.x=state.cx+Math.cos(a)*rr;out.z=state.cz+Math.sin(a)*rr;return out;},
  /** Slot m's current radius (m) and depth cap (tests). */
  slotRadius(m:number){return rad[m];},slotCap(m:number){return cap[m];},
  reset(){state.active=state.leaving=false;state.n=0;state.region=-1;state.cooldown=0;state.acc=0;ids.fill(-1);slot.fill(-1);blend.fill(0);has.fill(0);},
 };
 return api;
}
export type SharkCircle=ReturnType<typeof createSharkCircle>;
