import {saveIslandReturnPosition,readIslandReturnPosition,type IslandReturnPosition} from '../arcade/islandReturnPosition';
import type {TravelMode} from '../town/travelModes';

/**
 * The Kit Shop (Oct 12 2026, user: "turn the community hall building into a futbol shop … combine community hall and club grounds
 * building … make the shop more modern looking"). One modern flagship store across the two old Club Grounds lots (CLUB GROUNDS at
 * x 151.5–166.5 and COMMUNITY HALL at x 173.5–188.5, both 13 m deep at z −177) plus the 7 m gap between them.
 *
 * The island ↔ shop document boundary is the Museum's and the Konbini's (lib/museum/museumDoors.ts): entering saves a departure at
 * the door and navigates to /shop (the island unloads completely); leaving returns to `/?from=shop`, which spawns the player
 * outside the same door. Pure except save/read, which use the Arcade's tab-local departure record.
 *
 * The front faces +z (south, onto the Club Grounds street at z −159), so "facing out" is yaw 0.
 */
export const KIT_SHOP={x:170,z:-177,w:37,d:13,h:8,name:'KIT SHOP',label:'Kit Shop'} as const;
/** The front plane of the shop (z of the glass line) and the central double door. */
export const KIT_SHOP_FRONT=KIT_SHOP.z+KIT_SHOP.d/2;
export const SHOP_DOOR={x:KIT_SHOP.x,front:KIT_SHOP_FRONT,label:'Kit Shop'} as const;
/** The rooftop sign (a slim navy panel on steel legs at the front edge of the roof) and the entrance canopy. */
export const SHOP_ROOF_SIGN={x:KIT_SHOP.x+1.5,w:17,h:2.7,y0:KIT_SHOP.h+.55,d:.35,z:KIT_SHOP_FRONT-1.1} as const;
export const SHOP_CANOPY={x0:164.6,x1:175.4,depth:2.6,y:5.2,t:.22} as const;
/** The accent fin (one vertical plane in the shop's colour, rising past the roof at the east end of the shopfront). */
export const SHOP_FIN={x:187.9,w:1.2,h:11.4,d:.7} as const;
/** The hover/tap box: the volume, the overhanging roof slab, the rooftop sign, the canopy and the fin. */
export const KIT_SHOP_BOUNDS={min:{x:KIT_SHOP.x-KIT_SHOP.w/2-.3,y:0,z:KIT_SHOP.z-KIT_SHOP.d/2-.3},max:{x:KIT_SHOP.x+KIT_SHOP.w/2+.3,y:SHOP_FIN.h+.1,z:KIT_SHOP_FRONT+SHOP_CANOPY.depth+.1}} as const;
/** Outline pieces for the shared building highlight (lib/graphics/buildingGlow.ts), as offsets from the building centre. */
export const KIT_SHOP_GLOW=[
 {w:KIT_SHOP.w+.22,d:KIT_SHOP.d+.24,h:KIT_SHOP.h+.2,x:0,y:(KIT_SHOP.h+.2)/2,z:0},
 {w:KIT_SHOP.w+.82,d:KIT_SHOP.d+.86,h:.34,x:0,y:KIT_SHOP.h+.09,z:0},
 {w:SHOP_ROOF_SIGN.w+.3,d:SHOP_ROOF_SIGN.d+.3,h:SHOP_ROOF_SIGN.h+.3,x:SHOP_ROOF_SIGN.x-KIT_SHOP.x,y:SHOP_ROOF_SIGN.y0+SHOP_ROOF_SIGN.h/2,z:SHOP_ROOF_SIGN.z-KIT_SHOP.z},
 {w:SHOP_CANOPY.x1-SHOP_CANOPY.x0+.12,d:SHOP_CANOPY.depth+.12,h:SHOP_CANOPY.t+.14,x:(SHOP_CANOPY.x0+SHOP_CANOPY.x1)/2-KIT_SHOP.x,y:SHOP_CANOPY.y,z:KIT_SHOP.d/2+SHOP_CANOPY.depth/2},
 {w:SHOP_FIN.w+.14,d:SHOP_FIN.d+.14,h:SHOP_FIN.h+.1,x:SHOP_FIN.x-KIT_SHOP.x,y:SHOP_FIN.h/2,z:KIT_SHOP.d/2+SHOP_FIN.d/2},
] as const;
export const SHOP_EXIT_OFFSET=2.4;
export const SHOP_URL='/shop';
export const SHOP_RETURN_URL='/?from=shop';
/** The Enter prompt zone: in front of the shopfront, a little wider than the double door (like the museum's). */
export function shopDoorNear(x:number,z:number){return Math.abs(x-SHOP_DOOR.x)<7&&z>SHOP_DOOR.front-.5&&z<SHOP_DOOR.front+6;}
/** Where the player stands outside after leaving: 2.4 m out from the door, facing away from it. */
export function shopExitPoint(){return {x:SHOP_DOOR.x,z:SHOP_DOOR.front+SHOP_EXIT_OFFSET,yaw:0};}
/** Departure record: outside the door, on the ride the player walked up with (never flight), the island's follow camera. */
export function shopDeparture(ride:TravelMode='walk'):IslandReturnPosition{
 const p=shopExitPoint();
 return {version:1,x:p.x,z:p.z,yaw:p.yaw,ride:ride==='jetpack'?'walk':ride,flightHeight:0,camera:{x:p.x+18,y:23,z:p.z+30}};
}
export function saveShopDeparture(ride:TravelMode='walk'){saveIslandReturnPosition(shopDeparture(ride));}
/** On exit, re-save for the shop door (a direct /shop visit has no departure); keep the saved ride when it was ours. */
export function refreshShopDeparture(){
 const saved=readIslandReturnPosition(),p=shopExitPoint();
 saveShopDeparture(saved&&Math.hypot(saved.x-p.x,saved.z-p.z)<1?saved.ride:'walk');
}
