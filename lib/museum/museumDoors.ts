import {saveIslandReturnPosition,readIslandReturnPosition,type IslandReturnPosition} from '../arcade/islandReturnPosition';
import type {TravelMode} from '../town/travelModes';

/**
 * The walk-in History Museum's island ↔ museum document boundary (Oct 3 2026), the Konbini pattern (lib/konbini/konbiniDoors.ts):
 * entering saves a departure at the museum door and navigates to /museum (the island unloads completely); leaving returns to
 * `/?from=museum`, which spawns the player outside the same door. Pure except save/read, which use the Arcade's tab-local
 * departure record (lib/arcade/islandReturnPosition.ts, read-only use of Astra's module).
 *
 * Door anchor: lib/town/world.ts `house(168,181,30,9,5,'HISTORY MUSEUM')` draws its door at x − w·0.26 = 168 − 7.8 = 160.2, on the
 * front face z + d/2 + 0.2 = 185.7. The front faces +z (south), so "facing out" is yaw 0.
 */
export const MUSEUM_DOOR={x:168-30*.26,front:181+9/2+.2,label:'History Museum'} as const;
/** The building footprint (world.ts) for the shared highlight and the from-the-air Enter (Town registers it already). */
export const MUSEUM_BUILDING={x:168,z:181,w:30,d:9,h:5} as const;
export const MUSEUM_EXIT_OFFSET=2.4;
export const MUSEUM_URL='/museum';
export const MUSEUM_RETURN_URL='/?from=museum';
/** Where the player stands outside after leaving: 2.4 m out from the door, facing away from it. */
export function museumExitPoint(){return {x:MUSEUM_DOOR.x,z:MUSEUM_DOOR.front+MUSEUM_EXIT_OFFSET,yaw:0};}
/** Departure record: outside the door, on the ride the player walked up with (never flight), the island's follow camera. */
export function museumDeparture(ride:TravelMode='walk'):IslandReturnPosition{
 const p=museumExitPoint();
 return {version:1,x:p.x,z:p.z,yaw:p.yaw,ride:ride==='jetpack'?'walk':ride,flightHeight:0,camera:{x:p.x+18,y:23,z:p.z+30}};
}
export function saveMuseumDeparture(ride:TravelMode='walk'){saveIslandReturnPosition(museumDeparture(ride));}
/** On exit, re-save for the museum door (a direct /museum visit has no departure); keep the saved ride when it was ours. */
export function refreshMuseumDeparture(){
 const saved=readIslandReturnPosition(),p=museumExitPoint();
 saveMuseumDeparture(saved&&Math.hypot(saved.x-p.x,saved.z-p.z)<1?saved.ride:'walk');
}
/**
 * The west wing (Oct 3 2026, user: "expand the museum to have another wing and fill this grass area. L shape building"): the grass
 * lot between the museum's west wall (x 153), the high-school road's sidewalk (z 171), the pier path (x 132.5–137.5) and the
 * SOUTH PIER sign (z 203, posts at x 142.7/149.3) and its lamp (148, 205.5). Joined to the museum's west wall so the footprint
 * reads as an L; the main door stays the only entrance. Inside, it is the "Your Collection" wing (lib/museum/museumLayout.ts).
 */
export const MUSEUM_WING={x:146,z:186,w:14,d:26,h:5} as const;
