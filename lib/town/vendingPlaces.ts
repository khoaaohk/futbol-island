/**
 * Where the three Coral Cay book machines stand (Sep 29 2026). Placed from Coral Cay's stable public anchors
 * (lib/town/coralCay.ts: causewayPoint, CAUSEWAY, CAY_HOUSES, SHARKS_BEACH, CAY_LANDMARKS, isOnCayLand) instead of fixed coordinates,
 * so the machines follow any reshaping of the causeway or the cay. Pure data: evaluated once at module load, no per-frame
 * work. tests/vending-machines.cjs checks every result is on walkable cay ground, with its front and footprint on land.
 */
import {causewayPoint,CAUSEWAY,CAY_HOUSES,SHARKS_BEACH,CAY_LANDMARKS,CAY_KONBINI,isOnCayLand} from './coralCay';
import {SUMMIT_LANDMARKS,SUMMIT_PITCH,SUMMIT_FENCE,SUMMIT_OBSTACLES,SUMMIT_PATHS,TERRACE,onSummitIsle,summitGround,summitSlope} from './summitIsle';
import {kickLayout} from './summitKick';
import {drinkSpotBeside} from './drinkMachines';

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

/** Distance from (x, z) to the nearest point on any carved Summit Isle trail (the climb, the walkway round the pitch, the
 *  beach spur): keeps the kiosk off the trail's own tread, including its last stretch into the gate. */
function distanceToSummitPaths(x:number,z:number){
 let best=Infinity;
 for(const path of SUMMIT_PATHS)for(let i=0;i<path.length-1;i++){
  const a=path[i],b=path[i+1],dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz||1e-9;
  const t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/l2));
  best=Math.min(best,Math.hypot(x-(a.x+dx*t),z-(a.z+dz*t)));
 }
 return best;
}
/** The Summit 5s' own hand-placed props just outside its fence (lib/town/summitIsleWorld.ts): the "SUMMIT 5s" name board and
 *  the "SMALL-SIDED = MORE TOUCHES" teaching board flank the gate, a bench sits further west, and a floodlight mast stands on
 *  each far corner of the terrace — all on the same south walkway the kiosk now shares. Read-only reference points (built
 *  there, never here), so the kiosk and drink machine give every one of them a clean berth. The Summit Kick start post and
 *  the lookout telescope/cairn are checked from their own modules instead (kickLayout, SUMMIT_LANDMARKS.lookout).
 */
const SUMMIT_WALKWAY_Z=TERRACE.z+TERRACE.b+1.6;
const SUMMIT_HAND_PROPS:{x:number;z:number;halfW:number;halfD:number}[]=[
 {x:SUMMIT_FENCE.gate.x0-4.2,z:SUMMIT_WALKWAY_Z,halfW:2.8,halfD:.5},// "SUMMIT 5s" name board
 {x:SUMMIT_FENCE.gate.x1+5.2,z:SUMMIT_WALKWAY_Z,halfW:3.7,halfD:.5},// "SMALL-SIDED = MORE TOUCHES" teaching board
 {x:SUMMIT_PITCH.x-14,z:SUMMIT_WALKWAY_Z,halfW:1.3,halfD:.5},// the bench
 {x:SUMMIT_PITCH.x+6,z:SUMMIT_PITCH.z-(TERRACE.b+1.4),halfW:1.3,halfD:1.3},// north-east floodlight mast
 {x:SUMMIT_PITCH.x-6,z:SUMMIT_PITCH.z+(TERRACE.b+1.4),halfW:1.3,halfD:1.3},// south-west floodlight mast
];
function clearOfSummitHandProps(x:number,z:number,pad:number){
 if(Math.hypot(x-SUMMIT_LANDMARKS.lookout.x,z-SUMMIT_LANDMARKS.lookout.z)<10)return false;// lookout cairn + telescope stand
 const post=kickLayout().post;if(Math.hypot(x-post.x,z-post.z)<1.4+pad)return false;// Summit Kick start post + hoop crate
 return !SUMMIT_HAND_PROPS.some(o=>Math.abs(x-o.x)<o.halfW+pad&&Math.abs(z-o.z)<o.halfD+pad);
}
function clearOfSummitObstacles(x:number,z:number,pad:number){
 return !SUMMIT_OBSTACLES.some(o=>Math.abs(x-o.x)<o.w/2+pad&&Math.abs(z-o.z)<o.d/2+pad);
}
/** How flat the kiosk's footprint must be: well inside SUMMIT_WALK_SLOPE (0.62), so it stands level with no floating or
 *  sinking corner. The cabinet half-extents and walk-up distance match standsOnCay's (same real-world cabinet). */
const SUMMIT_FLAT_SLOPE=.22,SUMMIT_LEVEL_SPREAD=.15,SUMMIT_OBSTACLE_PAD=.6,SUMMIT_PROP_PAD=.6,SUMMIT_PATH_CLEAR=2.6;
/** Every corner of the cabinet's footprint and its walk-up point stand on flat, walkable Summit Isle ground (summitGround
 *  itself barely varies across them), clear of the pitch's fence and goals (SUMMIT_OBSTACLES), every carved trail and the
 *  hand-placed props along the walkway. */
export function standsOnSummit(s:VendingSpot,pathClear=SUMMIT_PATH_CLEAR){
 const fx=Math.sin(s.yaw),fz=Math.cos(s.yaw),rx=fz,rz=-fx;
 const pts=[[0,0],[HALF_W,HALF_D],[-HALF_W,HALF_D],[HALF_W,-HALF_D],[-HALF_W,-HALF_D]].map(([a,b])=>[s.x+rx*a+fx*b,s.z+rz*a+fz*b] as [number,number]);
 pts.push([s.x+fx*FRONT,s.z+fz*FRONT]);
 if(!pts.every(([x,z])=>onSummitIsle(x,z)&&summitSlope(x,z)<=SUMMIT_FLAT_SLOPE&&clearOfSummitObstacles(x,z,SUMMIT_OBSTACLE_PAD)&&clearOfSummitHandProps(x,z,SUMMIT_PROP_PAD)&&distanceToSummitPaths(x,z)>=pathClear))return false;
 // Never inside the fenced pitch (the fence obstacles are thin rails, so the rectangle itself is checked).
 if(pts.some(([x,z])=>Math.abs(x-SUMMIT_PITCH.x)<SUMMIT_FENCE.halfX+1&&Math.abs(z-SUMMIT_PITCH.z)<SUMMIT_FENCE.halfZ+1))return false;
 // Not hidden behind a board: the machine faces +z (towards the camera), so a wide board just south of it would stand in front of
 // its face (Oct 13 2026: the first summit spot sat 3 m behind the "SMALL-SIDED" teaching board).
 if(SUMMIT_HAND_PROPS.some(o=>o.halfW>2&&Math.abs(s.x-o.x)<o.halfW+HALF_W+.4&&o.z>s.z&&o.z-s.z<8))return false;
 const grounds=pts.map(([x,z])=>summitGround(x,z));
 return Math.max(...grounds)-Math.min(...grounds)<=SUMMIT_LEVEL_SPREAD;
}

/**
 * Summit Isle's Konbini snack stand (moved Oct 13 2026, user: "move the vending machines on top of the mountain"): now
 * stands on the summit terrace itself, on the walkway just outside the Summit 5s' fence, a few steps past the south gate
 * where the climbing trail arrives — not down at the sandbar landing any more. Placed from the terrace's own anchors
 * (SUMMIT_LANDMARKS.gate, SUMMIT_FENCE, SUMMIT_PITCH, SUMMIT_OBSTACLES, SUMMIT_PATHS, summitGround/summitSlope, plus
 * kickLayout's post), never fixed coordinates, so it follows any reshaping of the terrace or the gate. Searches a ring of
 * bearings out from the gate, starting due east along the walkway (away from the name board, the Summit Kick post and the
 * bench, which already crowd the gate's west side) and widening if that is ever blocked, keeping the first spot whose whole
 * footprint (and the drink machine's own slot beside it, drinkSpotBeside) clears everything above; falls back to a fixed
 * offset if the terrace ever reshapes past every try.
 * Faces due +z (yaw 0), like every other machine a drink machine stands beside (plaza, the Coral Cay Konbini): the pair's
 * rounded-to-the-centimetre placement (drinkSpotBeside) only cancels out exactly on an axis-aligned machine, so the search
 * only ever tries yaw 0 (the gate's own walkway runs east–west here, so facing +z reads fine from the climb's arrival).
 */
export function summitSnackSpot():VendingSpot{
 const gate=SUMMIT_LANDMARKS.gate;
 for(const r of [4,5,6,8,10,13,16,20,24,28]){
  for(let k=0;k<16;k++){
   const a=k/16*Math.PI*2,s=spot(gate.x+Math.cos(a)*r,gate.z+Math.sin(a)*r,0);
   if(standsOnSummit(s)&&standsOnSummit(drinkSpotBeside(s)))return s;
  }
 }
 // Second pass (Oct 13 2026: the first pass found nothing and the old fallback stood the pair behind the teaching board): the
 // walkway is narrow, so allow the machines closer to a trail edge, still clear of every prop, the fence and the slope rules.
 for(const r of [4,6,8,10,13,16,20,24,28,32])for(let k=0;k<24;k++){
  const a=k/24*Math.PI*2,s=spot(gate.x+Math.cos(a)*r,gate.z+Math.sin(a)*r,0);
  if(standsOnSummit(s,1)&&standsOnSummit(drinkSpotBeside(s),1))return s;
 }
 // Terrain reshaped past every try: east of the teaching board, past its posts, on the same walkway.
 return spot(SUMMIT_FENCE.gate.x1+5.2+3.7+2.8,SUMMIT_WALKWAY_Z,0);
}
