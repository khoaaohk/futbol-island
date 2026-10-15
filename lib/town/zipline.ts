/**
 * The Summit Isle → Coral Cay zipline (Oct 14 2026; user: "move the telescope here and in its place add a zipline that goes all
 * the way to coral island. make the zipline interactive. so that while sliding down there is animations, that you're zipping
 * down", then: "have the zipline go all the way to the top of Cay guesthouse").
 *
 * Pure rules, no three.js and no DOM (tests/zipline.cjs). Static props: ./ziplineWorld.ts; runtime (prompt, ride, camera,
 * effects): ../graphics/zipline.ts; HUD: components/ZiplineHud.tsx; map line: components/ZiplineMapMark.tsx.
 *
 *  - The start tower stands where the lookout telescope stood (the lookout + ZIP_TOWER_OFFSET), on the summit's north-west
 *    shoulder: a timber platform with a step up on its uphill (east) side, a gantry holding the cable, a sign.
 *  - The cable runs one span (no poles: nothing stands in the sea, the whale shark's or the mantas' water) north over the beach,
 *    the sandbar channel and the cove to a deck on the CORAL CAY HOSTEL's roof, and sags as a parabola (ZIP_SAG). It is steep
 *    off the tower (the rider drops away and speeds up) and flattens toward the roof (the rider eases in).
 *  - The rider hangs ZIP_HANG below the trolley (hands up on the handle); the ride takes ZIP_RIDE.seconds whatever the frame rate:
 *    clip on (walk onto the launch spot, grab the handle), the ride (a fixed speed profile: quick acceleration, a long ease-out
 *    into the brake), the landing (feet on the deck, let go).
 *  - On the roof: the landing deck (one step up from the roof), and an outside stair down the hostel's east wall to the path by
 *    the verandah. The roof is an ordinary walkable roof, so the jetpack and parachute work from it as from any other.
 *  - Free: it is gravity (no fuel). One-way: Summit Isle → Coral Cay.
 */
import {SUMMIT_LANDMARKS,summitGround} from './summitIsle';
import {HOSTEL} from './coralCay';

export type ZipPoint={x:number;y:number;z:number};
type Box={x:number;z:number;w:number;d:number};
export const ZIP_NAME='Zipline to Coral Cay';

// ---- The start tower -------------------------------------------------------------------------------------------------------
/** Where the tower stands: the telescope's old stand on the lookout's north-west shoulder (the telescope moved down the slope). */
export const ZIP_TOWER_OFFSET={dx:-9.2,dz:-1.75} as const;
/** The tower platform: a square this wide, its deck this far above the highest ground under it (a launch with some drop: the
 *  rider swings off well clear of the grass). */
export const ZIP_PLATFORM={size:2.8,lift:1.2} as const;
/** Rise of a stair tread (the walk solver steps ≤ 0.35 m). */
export const ZIP_TREAD_RISE=.3;
const L0=SUMMIT_LANDMARKS.lookout;
export const ZIP_TOWER=(()=>{
 const x=L0.x+ZIP_TOWER_OFFSET.dx,z=L0.z+ZIP_TOWER_OFFSET.dz,h=ZIP_PLATFORM.size/2;let top=-Infinity,low=Infinity;
 for(const a of [-1,-.5,0,.5,1])for(const b of [-1,-.5,0,.5,1]){const g=summitGround(x+a*h,z+b*h);top=Math.max(top,g);low=Math.min(low,g);}
 const deck=top+ZIP_PLATFORM.lift;
 // Steps on the uphill (east) side: treads .45 m deep stepping down ZIP_TREAD_RISE until they meet the ground.
 const steps:(Box&{height:number})[]=[];
 for(let k=0;k<6;k++){const tx=x+h+.45*(k+.5),height=deck-ZIP_TREAD_RISE*(k+1),under=Math.max(...[-1,0,1].map(b=>summitGround(tx,z+b*h)));
  if(k>0&&height<=under+.05)break;steps.push({x:tx,z,w:.45,d:ZIP_PLATFORM.size,height});}
 return {x,z,ground:summitGround(x,z),low,deck,steps,box:{x,z,w:ZIP_PLATFORM.size,d:ZIP_PLATFORM.size}};
})();

// ---- The roof landing ---------------------------------------------------------------------------------------------------------
/** The hostel's roof (world.ts building(): the walkable height is the walls plus the roof slab). */
export const HOSTEL_ROOF=HOSTEL.h+.23;
/** The landing deck on the roof's east half, clear of the roof tank (x ≤ 560.6) and the stepped roof room (x ≤ 556.3): one step up. */
export const ZIP_DECK={x:562.7,z:-122.3,w:3.4,d:5.4,height:HOSTEL_ROOF+ZIP_TREAD_RISE} as const;
/** Where the rider stops and lets go (the deck's middle, a little south of the anchor mast). */
export const ZIP_LAND={x:562.7,z:-121.6} as const;
/** The outside stair down the hostel's east wall: a top landing at roof height overlapping the roof's edge, then treads down
 *  south to the path along the verandah. `rail` is its outer handrail line (x), just inside the kit washing line's post (x 567). */
export const ZIP_STAIR=(()=>{
 const wall=HOSTEL.x+HOSTEL.w/2,x0=wall-.6,x1=wall+1.6,landing={x:(x0+x1)/2,z:-124.5,w:x1-x0,d:1.8,height:HOSTEL_ROOF};
 const top=landing.z+landing.d/2,n=Math.ceil(HOSTEL_ROOF/ZIP_TREAD_RISE),run=.38,rise=HOSTEL_ROOF/n;
 const treads:(Box&{height:number})[]=[];
 // Tread i (1 … n-1) at height roof − i·rise; the last one is a single rise above the path.
 for(let i=1;i<n;i++)treads.push({x:wall+.8,z:top+(i-.5)*run,w:1.6,d:run,height:HOSTEL_ROOF-i*rise});
 return {wall,x0,x1,landing,treads,rise,run,bottom:{x:wall+.8,z:top+(n-1)*run+.6},rail:x1+.06,north:landing.z-landing.d/2};
})();

// ---- The cable -------------------------------------------------------------------------------------------------------------------
/** The rider's feet hang this far below the cable (the trolley, a strap and the handle; hands up). */
export const ZIP_HANG=2.2;
/** The cable's sag (m) below the straight line between the launch and the landing, at mid-span. */
export const ZIP_SAG=5.5;
/** Horizontal direction of travel (unit), launch → landing. */
const LAUNCH_BACK=.9;
const dir0=(()=>{const dx=ZIP_LAND.x-ZIP_TOWER.x,dz=ZIP_LAND.z-ZIP_TOWER.z,l=Math.hypot(dx,dz);return {x:dx/l,z:dz/l};})();
/** Where the rider clips on (their feet on the tower deck, near its north edge, under the cable). */
export const ZIP_LAUNCH={x:ZIP_TOWER.x+dir0.x*LAUNCH_BACK,z:ZIP_TOWER.z+dir0.z*LAUNCH_BACK,y:ZIP_TOWER.deck};
export const ZIP_DIR=(()=>{const dx=ZIP_LAND.x-ZIP_LAUNCH.x,dz=ZIP_LAND.z-ZIP_LAUNCH.z,l=Math.hypot(dx,dz);return {x:dx/l,z:dz/l,yaw:Math.atan2(dx,dz)};})();
/** The ridden span (horizontal metres, launch → landing). */
export const ZIP_SPAN=Math.hypot(ZIP_LAND.x-ZIP_LAUNCH.x,ZIP_LAND.z-ZIP_LAUNCH.z);
const Y0=ZIP_TOWER.deck+ZIP_HANG,Y1=ZIP_DECK.height+ZIP_HANG;
/** The cable at fraction t of the ridden span (t < 0: behind the launch, to the tower's gantry; t > 1: on to the roof mast). */
export function cableAt(t:number):ZipPoint{
 return {x:ZIP_LAUNCH.x+(ZIP_LAND.x-ZIP_LAUNCH.x)*t,y:Y0+(Y1-Y0)*t-4*ZIP_SAG*t*(1-t),z:ZIP_LAUNCH.z+(ZIP_LAND.z-ZIP_LAUNCH.z)*t};
}
/** dy/ds of the cable (per horizontal metre) at fraction t. */
export const cableGrade=(t:number)=>((Y1-Y0)-4*ZIP_SAG*(1-2*t))/ZIP_SPAN;
/** The anchors: the gantry beam on the tower (just behind the launch) and the mast on the roof deck (past the landing). */
export const ZIP_ANCHOR_TOWER=cableAt(-.7/ZIP_SPAN),ZIP_ANCHOR_ROOF=cableAt(1+1.5/ZIP_SPAN);
/** The cable's full length (anchor to anchor) and its fractions at the anchors. */
export const ZIP_T0=-.7/ZIP_SPAN,ZIP_T1=1+1.5/ZIP_SPAN;

// ---- The ride ----------------------------------------------------------------------------------------------------------------
/** Timings (s): walk onto the launch spot and grab the handle, the ride, feet down and let go. Prompt reach (m from the tower's
 *  platform and step) on foot / riding. */
export const ZIP_RIDE={clip:.8,seconds:13.5,land:.6,reach:2.4,reachRide:3.4} as const;
/** Speed profile: v(τ) ∝ sin(π·w(τ)) with w = 1 − (1 − τ)^K: a firm push off the tower (a finite ~0.9 g, so the swing kicks back
 *  without a jolt), the top speed at τ ≈ 0.4, then a long, gentle ease-out into the brake (w′(1) = 0). */
const K=1.35,N=4096;
const W=(u:number)=>1-Math.pow(1-Math.max(0,Math.min(1,u)),K),VS=(u:number)=>Math.sin(Math.PI*W(u));
const PROFILE=(()=>{const s=new Float64Array(N+1);let acc=0;
 for(let i=1;i<=N;i++){const a=(i-1)/N,b=i/N;acc+=(VS(a)+4*VS((a+b)/2)+VS(b))/6/N;s[i]=acc;}for(let i=0;i<=N;i++)s[i]/=acc;return {s,norm:acc};})();
/** Fraction of the span covered after fraction τ of the ride time (0 → 0, 1 → 1, monotonic, eased at both ends). */
export function rideProgress(tau:number){if(tau<=0)return 0;if(tau>=1)return 1;const f=tau*N,i=Math.floor(f),k=f-i;return PROFILE.s[i]+(PROFILE.s[Math.min(N,i+1)]-PROFILE.s[i])*k;}
/** Along-cable speed (m/s, horizontal) at fraction τ. */
export function rideSpeed(tau:number){return VS(tau)/PROFILE.norm*ZIP_SPAN/ZIP_RIDE.seconds;}
/** Peak speed (m/s). */
export const ZIP_TOP_SPEED=(()=>{let m=0;for(let i=0;i<=200;i++)m=Math.max(m,rideSpeed(i/200));return m;})();

/** The trolley (on the cable) and the rider's feet at ride time `t` (s, 0 … ZIP_RIDE.seconds). */
export function ridePoint(t:number){
 const tau=t/ZIP_RIDE.seconds,f=rideProgress(tau),c=cableAt(f);
 return {f,trolley:c,feet:{x:c.x,y:c.y-ZIP_HANG,z:c.z},speed:rideSpeed(tau),grade:cableGrade(f)};
}

/** The tower prompt: within reach of the tower (its platform and step: at the foot of the step, on it or on the deck), on foot or
 *  (a little further) on a ground ride. Returns the distance to the tower's footprint, or null. */
export function towerReach(x:number,z:number,onFoot:boolean){
 const T=ZIP_TOWER,h=ZIP_PLATFORM.size/2,east=T.x+h+T.steps.length*.45;
 const dx=Math.max(T.x-h-x,0,x-east),dz=Math.max(T.z-h-z,0,z-(T.z+h)),d=Math.hypot(dx,dz);
 return d<=(onFoot?ZIP_RIDE.reach:ZIP_RIDE.reachRide)?d:null;
}
/** A cheap box test first (the prompt runs every HUD frame): within 12 m of the tower. */
export const nearTower=(x:number,z:number)=>Math.abs(x-ZIP_TOWER.x)<12&&Math.abs(z-ZIP_TOWER.z)<12;

/** Clearance samples along the ridden span: the cable, the rider's feet (with the swing allowance) at n+1 points. */
export function cableSamples(n=240){const out:{t:number;x:number;z:number;cable:number;feet:number}[]=[];
 for(let i=0;i<=n;i++){const t=i/n,c=cableAt(t);out.push({t,x:c.x,z:c.z,cable:c.y,feet:c.y-ZIP_HANG-.3});}return out;}

/** Map line (world x/z, drawn on the island maps): the tower to the roof. */
export const ZIP_MAP={from:{x:ZIP_TOWER.x,z:ZIP_TOWER.z},to:{x:ZIP_DECK.x,z:ZIP_DECK.z}} as const;

// ---- The HUD bridge (components/ZiplineHud.tsx): written only when something shown changes, never per frame. ----------------
export type ZipView={
 /** A short note ("Hold on tight!", "Welcome to Coral Cay!"), its counter (a new note restarts the CSS fade) and whether riding. */
 note:string;notes:number;riding:boolean;
};
const IDLE_VIEW:ZipView={note:'',notes:0,riding:false};
let zipView=IDLE_VIEW;const zipListeners=new Set<()=>void>();
export const zipStore={
 get:()=>zipView,server:()=>IDLE_VIEW,
 set(patch:Partial<ZipView>){let changed=false;for(const k in patch)if(!Object.is((zipView as Record<string,unknown>)[k],(patch as Record<string,unknown>)[k])){changed=true;break;}
  if(!changed)return;zipView={...zipView,...patch};zipListeners.forEach(fn=>fn());},
 reset(){if(zipView===IDLE_VIEW)return;zipView=IDLE_VIEW;zipListeners.forEach(fn=>fn());},
 subscribe(fn:()=>void){zipListeners.add(fn);return()=>{zipListeners.delete(fn);};},
};
/** The prompt's tap; the runtime installs the real one while the island is up. */
export const zipActions={ride:()=>{}};
export const ZIP_NOTES={
 start:'Hold on tight! Zipping to Coral Cay. Use the stick to look around.',
 land:'Welcome to the Coral Cay Hostel roof! The stairs down are on the east side.',
} as const;
