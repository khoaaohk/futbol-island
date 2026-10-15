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
/** The ring: radius (m), never closer than SHARK_RING_MIN, and kept inside the water (the probe's distance to land). */
export const SHARK_RING=4.6,SHARK_RING_MIN=2.4,SHARK_SHORE_GAP=.7;
/** Staggered slots: angular offsets (rad, not evenly spaced) and radius factors, so the fins never line up. */
export const SHARK_SLOTS=[[0,1],[2.25,1.12],[4.15,.9]] as const;
/** Cruise speed along the ring (m/s). */
export const SHARK_SPEED=1.2;
/** They lose interest after this long (s). */
export const SHARK_HOLD=12;
/** Seconds to blend from the loop onto the ring, and back. */
export const SHARK_JOIN=1.8,SHARK_LEAVE=2.4;
/** Not again for this long after a circle ends (s): a swimmer near the causeway is not circled back to back. */
export const SHARK_COOLDOWN=25;
/** The ring centre follows the swimmer at this rate (1/s). */
export const SHARK_FOLLOW=2.2;
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

/** `land` is the island's cheap land test (polygons and boxes), used once per pick to keep a shark from crossing a bank. */
export function createSharkCircle(land:(x:number,z:number)=>boolean){
 const ids=new Int8Array(SHARK_MAX).fill(-1),slot=new Int8Array(SHARK_MAX).fill(-1);
 const blend=new Float32Array(SHARK_MAX);
 const best=new Float32Array(SHARK_MAX),bestI=new Int8Array(SHARK_MAX);
 const p={x:0,z:0};
 const state={active:false,region:-1,n:0,angle:0,radius:SHARK_RING,timer:0,cooldown:0,cx:0,cz:0,tx:0,tz:0,acc:0,leaving:false};
 const events:SharkEvents={started:false,ended:''};
 /** No land on the straight line from a shark to its ring (3 samples): the shark swims round a bank, never through it. */
 const clear=(ax:number,az:number,bx:number,bz:number)=>{for(const t of [.25,.5,.75])if(land(ax+(bx-ax)*t,az+(bz-az)*t))return false;return !land(bx,bz);};
 const ringRadius=(d:number)=>Math.max(SHARK_RING_MIN,Math.min(SHARK_RING,(d-SHARK_SHORE_GAP)/SHARK_SLOTS[1][1]));
 function end(reason:SharkEnd){state.active=false;state.leaving=true;state.cooldown=SHARK_COOLDOWN;events.ended=reason;}
 function pick(sw:SharkSwimmer,schools:SharkSchools){
  for(let r=0;r<schools.count;r++){const reg=schools.region(r);if(!reg.awake||reg.active<=0)continue;
   let near=Infinity;best.fill(Infinity);bestI.fill(-1);
   for(let i=0;i<reg.active;i++){schools.at(r,i,p);const d=Math.hypot(p.x-sw.x,p.z-sw.z);if(d<near)near=d;
    if(d>SHARK_GATHER)continue;
    // Insertion into the nearest-SHARK_MAX list (no sort, no allocation).
    let k=SHARK_MAX-1;if(d>=best[k])continue;while(k>0&&best[k-1]>d){best[k]=best[k-1];bestI[k]=bestI[k-1];k--;}best[k]=d;bestI[k]=i;}
   if(near>SHARK_TRIGGER)continue;
   const radius=ringRadius(sw.distanceToLand);let n=0,base=NaN;
   for(let k=0;k<SHARK_MAX;k++){const i=bestI[k];if(i<0)continue;schools.at(r,i,p);
    const a=Math.atan2(p.z-sw.z,p.x-sw.x);if(Number.isNaN(base))base=a;
    // The slot nearest this shark's bearing that is still free: sharks join the ring without crossing each other.
    let s=-1,gap=Infinity;for(let j=0;j<SHARK_MAX;j++){let used=false;for(let m=0;m<n;m++)if(slot[m]===j)used=true;if(used)continue;
     const g=Math.abs(wrap(base+SHARK_SLOTS[j][0]-a));if(g<gap){gap=g;s=j;}}
    const tr=radius*SHARK_SLOTS[s][1],ta=base+SHARK_SLOTS[s][0];
    if(!clear(p.x,p.z,sw.x+Math.cos(ta)*tr,sw.z+Math.sin(ta)*tr))continue;
    ids[n]=i;slot[n]=s;blend[n]=0;n++;}
   if(n===0)continue;
   for(let m=n;m<SHARK_MAX;m++){ids[m]=-1;slot[m]=-1;blend[m]=0;}
   state.active=true;state.leaving=false;state.region=r;state.n=n;state.angle=base;state.radius=radius;state.timer=0;
   state.cx=state.tx=sw.x;state.cz=state.tz=sw.z;events.started=true;return;}
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
   if(state.active){state.timer+=dt;if(!sw.swimming){end('shore');return events;}}
   state.acc+=dt;if(state.acc<SHARK_TICK-1e-6)return events;state.acc=0;
   if(state.active){state.tx=sw.x;state.tz=sw.z;state.radius=ringRadius(sw.distanceToLand);if(state.timer>=SHARK_HOLD)end('bored');return events;}
   if(sw.swimming&&!state.leaving&&state.cooldown<=0)pick(sw,schools);
   return events;},
  /** The swimmer climbed out, took off or the island closed: peel off now (counts as reaching the shore). */
  release():SharkEvents{events.started=false;events.ended='';if(state.active)end('shore');return events;},
  /** Per frame, only while `busy`: the ring turns, its centre follows the swimmer, the sharks blend on or off. */
  frame(dt:number){
   if(!api.busy||dt<=0)return;dt=Math.min(dt,.1);
   const f=1-Math.exp(-SHARK_FOLLOW*dt);state.cx+=(state.tx-state.cx)*f;state.cz+=(state.tz-state.cz)*f;
   state.angle=wrap(state.angle+SHARK_SPEED/state.radius*dt);
   let live=false;
   for(let m=0;m<state.n;m++){blend[m]=state.active?Math.min(1,blend[m]+dt/SHARK_JOIN):Math.max(0,blend[m]-dt/SHARK_LEAVE);if(blend[m]>0)live=true;}
   if(!state.active&&!live){state.leaving=false;state.n=0;state.region=-1;ids.fill(-1);slot.fill(-1);}
  },
  /**
   * caySharks.ts's matrix pass: shark `i` of region `r` at its loop position (`pos`, yaw in `pos.yaw`). When it is circling,
   * moves it toward its ring slot by the eased blend and turns it along the ring. Returns whether it changed anything.
   */
  place(r:number,i:number,pos:{x:number;z:number;yaw:number}){
   if(r!==state.region||state.n===0)return false;
   let m=-1;for(let k=0;k<state.n;k++)if(ids[k]===i){m=k;break;}
   if(m<0||blend[m]<=0)return false;
   const s=SHARK_SLOTS[slot[m]],a=state.angle+s[0],rr=state.radius*s[1],w=ease(blend[m]);
   const rx=state.cx+Math.cos(a)*rr,rz=state.cz+Math.sin(a)*rr;
   // Counter-clockwise in x/z: the heading is the tangent; caySharks' yaw convention is atan2(-dz, dx).
   const ryaw=Math.atan2(-Math.cos(a),-Math.sin(a));
   pos.x+=(rx-pos.x)*w;pos.z+=(rz-pos.z)*w;pos.yaw+=wrap(ryaw-pos.yaw)*w;return true;},
  /** Where slot m sits on the ring right now (tests). */
  ringPoint(m:number,out:{x:number;z:number}){const s=SHARK_SLOTS[slot[m]],a=state.angle+s[0],rr=state.radius*s[1];out.x=state.cx+Math.cos(a)*rr;out.z=state.cz+Math.sin(a)*rr;return out;},
  reset(){state.active=state.leaving=false;state.n=0;state.region=-1;state.cooldown=0;state.acc=0;ids.fill(-1);slot.fill(-1);blend.fill(0);},
 };
 return api;
}
export type SharkCircle=ReturnType<typeof createSharkCircle>;
