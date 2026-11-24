/**
 * Walking inside the Island Line (train Gameplay 3, owner Nov 24 2026: "walk inside the carriage + change seat"). Pure maths, no
 * three.js scene: the standing rider's spot is TRAIN-RELATIVE, so it moves with the train and never slides.
 *  - The train frame: car 0's local frame (x across, u = z along the car toward its cab; trainRunning carMatrix). Car 1 is turned
 *    round (its cab at the back), so its local point is (−x, −(CAR_LENGTH + CAR_GAP) − u). The gangway between the cars sits at
 *    u ≈ −6.2; one u runs from car 0's cab partition through the gangway to car 1's.
 *  - The walkable floor: the aisle between the benches (|x| ≤ AISLE_X), the door bays (|x| ≤ BAY_X: you can stand at a door), the
 *    gangway (|x| ≤ GANG_X), never past a cab partition (CAB_Z). Moves are axis-separated, so you slide along a bench front.
 *  - Seats: only the PLAYER_SEATS (the 8 the wire can carry: 4 a car by the middle door); a seat is "near" within NEAR_SEAT m of
 *    its aisle spot. Occupied seats (friends riding, passed in as a test) are skipped.
 * No allocation per call (out objects).
 */
import {CAR_LENGTH,CAR_GAP,TRAIN_CARS} from './trainSchedule';
import {AISLE_HALF,DOORS,DOOR_HALF,HALF_W,GANGWAY_HALF,CAB_Z,BENCHES} from './trainCarModel';
import {SEAT_TABLE,PLAYER_SEATS,TRAIN_SEATS} from './trainRunning';

/** Body clearance (m): the aisle centre line limit between benches, at a door bay, and through the gangway. */
export const AISLE_X=AISLE_HALF-.27,BAY_X=HALF_W-.42,GANG_X=GANGWAY_HALF-.2;
/** Walking speed in the aisle (m/s, full stick), the seat "near" radius (m) and the glow radius (m: free seats light up as you pass). */
export const WALK_IN=1.7,NEAR_SEAT=.85,GLOW_SEAT=3.2,SQUEEZE=2.5;
/** The car pitch along the train and the gangway's u (car 0's −z end meets car 1's −z end). */
export const CAR_PITCH=CAR_LENGTH+CAR_GAP,GANG_U=-CAR_PITCH/2;
/** The walkable u range: car 0's cab partition … car 1's (a body's width clear of each). */
export const U_MAX=CAB_Z-.32,U_MIN=-CAR_PITCH-(CAB_Z-.32);
/** Car-local end of the passenger room by the gangway (the bellows start just past it). */
const END_Z=-CAR_LENGTH/2+.3;

export type TrainLocal={car:number;x:number;z:number};
/** Train frame (x, u) → car c and its car-local x, z. */
export function toCar(x:number,u:number,out:TrainLocal):TrainLocal{
 if(u>=GANG_U||TRAIN_CARS<2){out.car=0;out.x=x;out.z=u;}else{out.car=1;out.x=-x;out.z=-CAR_PITCH-u;}return out;
}
/** Car c's local x, z → train frame (out.x, out.z = u). */
export function fromCar(car:number,x:number,z:number,out:{x:number;z:number}){
 if(car%2===0){out.x=x;out.z=z;}else{out.x=-x;out.z=-CAR_PITCH-z;}return out;
}
const inBay=(z:number)=>{for(const d of DOORS)if(Math.abs(z-d)<DOOR_HALF-.12)return true;return false;};
const onBench=(z:number)=>{for(const b of BENCHES)if(z>b[0]-.05&&z<b[1]+.05)return true;return false;};
/** The half width you can stand in at car-local z (one car; both cars are the same inside). */
export function halfWidthAt(z:number){
 if(z<END_Z)return GANG_X;// the gangway end of the room and the bellows
 if(inBay(z)&&!onBench(z))return BAY_X;
 return AISLE_X;
}
const lt:TrainLocal={car:0,x:0,z:0};
/** Is train-frame (x, u) a spot you can stand on? */
export function walkable(x:number,u:number){if(u>U_MAX||u<U_MIN)return false;toCar(x,u,lt);return Math.abs(lt.x)<=halfWidthAt(lt.z)+1e-6;}
/** One step of the standing rider from (p.x, p.u) by (dx, du): axis-separated, so it slides along a bench front or a wall. */
export function stepWalk(p:{x:number;u:number},dx:number,du:number){
 // across first, clamped to the width where you stand; then along, blocked (not pushed) when it would leave the floor
 toCar(p.x,p.u,lt);const w=halfWidthAt(lt.z);let nx=Math.max(-w,Math.min(w,p.x+dx));
 const nu=Math.max(U_MIN,Math.min(U_MAX,p.u+du));
 if(walkable(nx,nu)){p.x=nx;p.u=nu;return p;}
 // into a narrower part (a bench run, the gangway): slide in toward the centre line (at most SQUEEZE × the step along, so it reads
 // as walking round the corner of the bay), else stop
 toCar(nx,nu,lt);const w2=halfWidthAt(lt.z),over=Math.abs(nx)-w2;
 if(over<=Math.max(.12,Math.abs(du)*SQUEEZE)){nx=Math.max(-w2,Math.min(w2,nx));if(walkable(nx,nu)){p.x=nx;p.u=nu;return p;}}
 else{nx-=Math.sign(nx)*Math.abs(du)*SQUEEZE;}
 p.x=nx;return p;
}
/** Player seat j's aisle spot (train frame): in front of the seat, where you stand to sit down. */
export function seatAisle(j:number,out:{x:number;z:number}){
 const s=SEAT_TABLE[PLAYER_SEATS[j]];return fromCar(s.car,s.side*(AISLE_X-.02),s.z,out);
}
const sp={x:0,z:0};
/** The free player seat nearest train-frame (x, u) within `radius` (the aisle spot), or -1. `taken(j)`: a friend sits there. */
export function nearestFreeSeat(x:number,u:number,radius:number,taken:(j:number)=>boolean,mine=-1){
 let best=-1,bd=radius;
 for(let j=0;j<TRAIN_SEATS;j++){if(j===mine||taken(j))continue;seatAisle(j,sp);const d=Math.hypot(sp.x-x,sp.z-u);if(d<bd){bd=d;best=j;}}
 return best;
}
/** The door bay nearest train-frame (x, u): its distance along the car (m), -1 when none within `reach`. */
export function nearDoor(x:number,u:number,reach=.9){
 toCar(x,u,lt);let best=Infinity;for(const d of DOORS)best=Math.min(best,Math.abs(lt.z-d));return best<=DOOR_HALF+reach?best:-1;
}
/** The track s (m) level with train-frame u, for a train whose front is at s (wrap with trainTrack.wrapS). */
export const trackSOfU=(s:number,u:number)=>s-CAR_LENGTH/2+u;
