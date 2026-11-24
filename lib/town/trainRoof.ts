/**
 * Roof riding on the Island Line (owner, Nov 24 2026: "allow landing on the train to ride it from the top. If entering the tunnel add
 * animation to bump the player off"). Pure maths, no three.js scene: like walking the aisle (trainWalk.ts) the rider's spot is
 * TRAIN-RELATIVE (x across, u along car 0's frame), so it moves with the train at full speed with no jitter.
 *  - The roof: |x| ≤ ROOF_HALF on the car's gently curved top (roofY follows trainCarModel's roof profile), the length of each car
 *    less ROOF_END_PAD; the 0.4 m gap between the cars is stepped over (kid-friendly: no fall between the cars).
 *  - The roof units are STEP-UPS (Looks 2, Nov 24 2026, owner shot 38: as walls they left only ~0.13 m lanes beside them, so the
 *    roof could not be walked end to end): the two air-conditioner lids (ROOF_LID_H ~0.28 m) and the pantograph's base plate
 *    (ROOF_PANTO_H ~0.17 m) add their height to the roof under the feet (roofLift / roofHeight, eased over ROOF_STEP_EASE m at
 *    their edges so the body rises onto them instead of popping). Nothing on the roof blocks the walk.
 *  - Overhead: trains run west → east through Summit Isle's tunnel; a rider whose spot reaches PORTAL_REACH m short of the west
 *    portal is bonked off (trainBonk.ts). The rest of the line is clear above a crouching rider (checked Nov 24 2026): the South
 *    Bridge trusses are pony trusses beside the cars (TRUSS_H 2.5 m over the bed, under the roof), the station roofs stand beside the
 *    line (the clearance envelope, scripts/train-clearance.cjs, keeps ±2 m clear to bed + 4.95 m), the catenary arms hang over the
 *    wire (bed + WIRE_Y + 0.4 = 5.55 m, over the surfer crouch's head at ~bed + 5.3 m); the thin contact wire itself is left out.
 * No allocation per call (out objects).
 */
import {CAR_LENGTH,CAR_GAP,TRAIN_CARS} from './trainSchedule';
import {inTunnelS,wrapS} from './trainTrack';

/** Walkable half width (m), the pad kept at each car end, the walking speed (m/s, full stick), the body's radius round a bump. */
export const ROOF_HALF=.95,ROOF_END_PAD=.2,ROOF_WALK=2.2,ROOF_BODY=.22;
/** Step-up heights over the roof (trainCarModel: the AC lid's top at ROOF_TOP − 0.02 + 0.3; the pantograph plate's top at
 *  ROOF_TOP − 0.01 + 0.165) and the run (m) over which a foot eases up onto one at its edge. */
export const ROOF_LID_H=.28,ROOF_PANTO_H=.155,ROOF_STEP_EASE=.15;
/** Car-local roof units: z0, z1, half width, height (trainCarModel: AC lids at z −2.7 / 1.7, ±0.82 long, ±0.6 wide; the pantograph's
 *  base plate ±0.48 round z −0.5). Step-ups, never walls. */
export const ROOF_BUMPS:readonly (readonly [number,number,number,number])[]=[[-3.52,-1.88,.6,ROOF_LID_H],[.88,2.52,.6,ROOF_LID_H],[-.98,-.02,.48,ROOF_PANTO_H]];
/** The roof profile (trainCarModel buildCarGeometry prof: |x| → height over the rail top). */
const PROF:readonly (readonly [number,number])[]=[[0,3.75],[.55,3.73],[1.02,3.66],[1.24,3.54]];
export function roofY(x:number){const a=Math.abs(x);for(let i=1;i<PROF.length;i++)if(a<=PROF[i][0]){const [x0,y0]=PROF[i-1],[x1,y1]=PROF[i];return y0+(y1-y0)*(a-x0)/(x1-x0);}return PROF[PROF.length-1][1];}
/** The car pitch along the train (trainWalk CAR_PITCH; kept here so trainRunning can import this file without a cycle). */
export const CAR_PITCH=CAR_LENGTH+CAR_GAP;
const lt={car:0,x:0,z:0};
/** Train frame (x, u) → car and car-local x, z (trainWalk toCar: car 1 is turned round). */
function toCar(x:number,u:number,out:typeof lt){if(u>=-CAR_PITCH/2||TRAIN_CARS<2){out.car=0;out.x=x;out.z=u;}else{out.car=1;out.x=-x;out.z=-CAR_PITCH-u;}return out;}
/** The train-frame u range of the roofs: car 0's front end … car 1's far end. */
export const ROOF_U_MAX=CAR_LENGTH/2-ROOF_END_PAD,ROOF_U_MIN=-CAR_PITCH-(CAR_LENGTH/2-ROOF_END_PAD);
/** The step-up under car-local (x, z): the highest roof unit's height there, eased to 0 over ROOF_STEP_EASE m past its edge. */
function bumpLift(x:number,z:number){let h=0;const ax=Math.abs(x);
 for(const b of ROOF_BUMPS){const e=Math.max(0,b[0]-z,z-b[1],ax-b[2]);if(e>=ROOF_STEP_EASE)continue;const k=1-e/ROOF_STEP_EASE,v=b[3]*k*k*(3-2*k);if(v>h)h=v;}
 return h;}
/** How far (m) the roof units lift a foot at train-frame (x, u) over the bare roof (0 on the gap between the cars and off the roof). */
export function roofLift(x:number,u:number){if(u>ROOF_U_MAX||u<ROOF_U_MIN)return 0;toCar(x,u,lt);return bumpLift(lt.x,lt.z);}
/** The walked roof height over the rail top at train-frame (x, u): the roof profile plus any roof unit under the feet. */
export const roofHeight=(x:number,u:number)=>roofY(x)+roofLift(x,u);
/** Can a rider stand at train-frame (x, u)? (the gap between the cars counts: it is stepped over; the roof units are step-ups) */
export function roofStandable(x:number,u:number){return !(u>ROOF_U_MAX||u<ROOF_U_MIN||Math.abs(x)>ROOF_HALF);}
/** Nearest standable spot to (p.x, p.u) (clamped onto the roof; a landing on a roof unit stays on it). */
export function roofSettle(p:{x:number;u:number}){p.x=Math.max(-ROOF_HALF,Math.min(ROOF_HALF,p.x));p.u=Math.max(ROOF_U_MIN,Math.min(ROOF_U_MAX,p.u));if(roofStandable(p.x,p.u))return p;
 for(let d=.1;d<=2.2;d+=.1){if(roofStandable(p.x,p.u+d)){p.u+=d;return p;}if(roofStandable(p.x,p.u-d)){p.u-=d;return p;}}
 for(const x of [ROOF_HALF,-ROOF_HALF])if(roofStandable(x,p.u)){p.x=x;return p;}return p;}
/** One step along the roof from (p.x, p.u) by (dx, du): axis-separated (slides along the roof edge), clamped to the roof. */
export function roofStep(p:{x:number;u:number},dx:number,du:number){
 const nx=Math.max(-ROOF_HALF,Math.min(ROOF_HALF,p.x+dx));if(roofStandable(nx,p.u))p.x=nx;
 const nu=Math.max(ROOF_U_MIN,Math.min(ROOF_U_MAX,p.u+du));if(roofStandable(p.x,nu))p.u=nu;return p;}
/** Bonked this far (m) short of the tunnel's west portal (the head meets the portal's arch first). */
export const PORTAL_REACH=1.2;
/** The track s of train-frame u for a train whose front is at s. */
export const roofTrackS=(front:number,u:number)=>wrapS(front-CAR_LENGTH/2+u);
/** Does a rider at train-frame u (train front at track s) hit the tunnel portal this frame? */
export const roofHitsPortal=(front:number,u:number)=>inTunnelS(wrapS(roofTrackS(front,u)+PORTAL_REACH));
