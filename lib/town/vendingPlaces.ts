/**
 * Where the three Coral Cay book machines stand (Sep 29 2026). Placed from Coral Cay's stable public anchors
 * (lib/town/coralCay.ts: causewayPoint, CAUSEWAY, CAY_HOUSES, SHARKS_BEACH, CAY_LANDMARKS, isOnCayLand) instead of fixed coordinates,
 * so the machines follow any reshaping of the causeway or the cay. Pure data: evaluated once at module load, no per-frame
 * work. tests/vending-machines.cjs checks every result is on walkable cay ground, with its front and footprint on land.
 */
import {causewayPoint,CAUSEWAY,CAY_HOUSES,SHARKS_BEACH,CAY_LANDMARKS,CAY_KONBINI,isOnCayLand} from './coralCay';

export type VendingSpot={x:number;z:number;yaw:number};
const round=(v:number)=>Math.round(v*100)/100;
const spot=(x:number,z:number,yaw:number):VendingSpot=>({x:round(x),z:round(z),yaw:+yaw.toFixed(4)});
/** Cabinet half-extents (VENDING_SIZE × VENDING_SCALE, rounded up) and the walk-up distance the controller uses. */
const HALF_W=.9,HALF_D=.6,FRONT=1.5;
/** The cabinet corners, its centre and the walk-up point are all on walkable cay ground. */
export function standsOnCay(s:VendingSpot){
 const fx=Math.sin(s.yaw),fz=Math.cos(s.yaw),rx=fz,rz=-fx;
 const pts=[[0,0],[HALF_W,HALF_D],[-HALF_W,HALF_D],[HALF_W,-HALF_D],[-HALF_W,-HALF_D]].map(([a,b])=>[s.x+rx*a+fx*b,s.z+rz*a+fz*b]);
 pts.push([s.x+fx*FRONT,s.z+fz*FRONT]);
 return pts.every(([x,z])=>isOnCayLand(x,z));
}

/** Causeway: on the north beach bank at the bend before the Turtle Sandbar stop (t ≈ 0.6–0.7 of the road), where that
 *  bank is widest, facing the road so walkers and riders pass its glass front. */
function causeway():VendingSpot{
 let best=causewayPoint(.635);
 for(let t=.6;t<=.7;t+=.005){const p=causewayPoint(t);if(p.bankLeft>best.bankLeft+.05)best=p;}
 // Left of travel (north): (dirZ, -dirX). Stand in the middle of the bank, at least 1.6 m off the deck edge.
 const nx=best.dirZ,nz=-best.dirX,d=CAUSEWAY.deckHalf+Math.max(1.6,best.bankLeft*.5);
 const s=spot(best.x+nx*d,best.z+nz*d,Math.atan2(-nx,-nz));
 if(standsOnCay(s))return s;
 // Bank reshaped too narrow: stand on the deck's north edge instead (still on the road, clear of the lanes' centre).
 const e=CAUSEWAY.walkHalf-1.2;return spot(best.x+nx*e,best.z+nz*e,Math.atan2(-nx,-nz));
}
/** Coral Cay: on the pavement outside the Coconut Café (east end of its front, clear of the door and the café tables), facing the boulevard. */
function cafe():VendingSpot{
 const h=CAY_HOUSES.find(c=>c[5]==='COCONUT CAFÉ');
 if(h){const [x,z,w,d]=h,s=spot(x+w/2-.5,z+d/2+1.5,0);if(standsOnCay(s))return s;}
 return spot(CAY_LANDMARKS.plaza.x-10,CAY_LANDMARKS.plaza.z-9,0);
}
/** Coral Cay: on the Sharks Beach sand, 6 m up from the waterline and 4 m along the beach from its centre, away from the
 *  beach soccer club's banner and signs (toward the lifeguard headland), facing the island camera. That keeps it clear of
 *  the beach's own ball-hunt parcel at the centre, the palms and the umbrellas. */
function sharks():VendingSpot{
 const ux=(SHARKS_BEACH.x-SHARKS_BEACH.shoreX)/12,uz=(SHARKS_BEACH.z-SHARKS_BEACH.shoreZ)/12;
 const L=CAY_LANDMARKS.lifeguardTower;let tx=-uz,tz=ux;if((L.x-SHARKS_BEACH.x)*tx+(L.z-SHARKS_BEACH.z)*tz<0){tx=-tx;tz=-tz;}
 for(const [along,up] of [[4,6],[5,5],[3,7],[6,6]]){const s=spot(SHARKS_BEACH.shoreX+tx*along+ux*up,SHARKS_BEACH.shoreZ+tz*along+uz*up,Math.atan2(16,33));if(standsOnCay(s))return s;}
 return spot(SHARKS_BEACH.x,SHARKS_BEACH.z+4,Math.atan2(16,33));
}
/**
 * Konbini machines stand FLUSH against the shopfront (user, Sep 29 2026: "sit flush against the building instead of a gap behind
 * them"), 2.1 m east of the store centre (user, Sep 29 2026: shifted left so the snack + drinks pair sits inside the 10 m
 * shopfront instead of overhanging its east corner; still clear of the sliding doors and the Enter prompt strip), facing out (yaw 0: both Konbinis face +z).
 * Depth: the glass line is the store's `front`; its window ledges and corner pillars stand 0.25 m proud of it
 * (lib/town/world.ts hub block, lib/town/coralCayWorld.ts), so the cabinet's back sits 0.03 m in front of those (no z-fighting,
 * and the kick shake's small nod barely touches them), plus half the cabinet depth (VENDING_SIZE.d × VENDING_SCALE / 2).
 */
export const KONBINI_FACADE_PROUD=.25,KONBINI_BACK_GAP=.03,CABINET_HALF_DEPTH=.559,KONBINI_MACHINE_EAST=2.1;
export function konbiniMachineSpot(store:{x:number;front:number}):VendingSpot{
 return spot(store.x+KONBINI_MACHINE_EAST,store.front+KONBINI_FACADE_PROUD+KONBINI_BACK_GAP+CABINET_HALF_DEPTH,0);
}
/** Island Square's Konbini (lib/town/world.ts hub block, shifted: centre x 71, glass front z −53; the same anchor as
 *  lib/konbini/konbiniDoors.ts KONBINI_DOORS.main, whose door is 0.55 m west of the centre). */
export const ISLAND_SQUARE_KONBINI={x:71,front:-53} as const;
/** Coral Cay Konbini: flush against its glass front, by the roundabout (from CAY_KONBINI). */
function konbini():VendingSpot{return konbiniMachineSpot(CAY_KONBINI);}
export const cayVendingSpots={causeway,cafe,sharks,konbini};
