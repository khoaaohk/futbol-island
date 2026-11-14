/**
 * Machines under the DRIP FC Stadium's big screen (owner request, Nov 13 2026: "a row of two vending machines against that wall,
 * centred under the screen between its two posts", with "two gashapon machines on both sides"). Pure data, no three.js.
 *
 * The wall is the south stand's outer back wall (stadiumSeats.ts standBack(south)), the paved apron where the public-viewing fans
 * stand (stadiumNpcs.ts VIEWING) and the screen's two posts come down (stadiumWorld.ts screenPosts, 6.5 m either side of the
 * middle, 1.2 m out from the wall). Everything stands flush against the wall (the Konbinis' 3 cm back gap) and faces out (south,
 * yaw 0) to the viewing area:
 *  - the middle: the island's vending machine + drink machine pair (vendingCatalog.ts 'stadium', drinkMachines.ts 'drinkstadium'),
 *    side by side with the Konbini pair's 12 cm gap, centred on the screen;
 *  - either side: two gashapon machines each (lib/gashapon/machines.ts zone 'stadium'), 12 cm apart.
 * The whole row spans ±3.8 m: clear of both posts (±6.5 m, 0.6 m colliders), the south stand's stairs and their bollards (±24 m),
 * the wall uplights (none within 9 m of the middle, stadiumLights.ts), both screen-post ball targets and their kick lanes (straight
 * south from each post), and the viewers (≥ 6 m out from the wall). The machines are ≤ 2.2 m tall: the screen's underside is 7.6 m up.
 */
import {STADIUM} from './westParkLayout';
import {STANDS,standBack} from './stadiumSeats';

const r2=(v:number)=>Math.round(v*100)/100;
/** The wall's world z (its outer face) and the row's middle (x, under the screen's centre). */
export const STADIUM_SHOP_WALL_Z=STADIUM.z+standBack(STANDS.find(s=>s.id==='south')!);
export const STADIUM_SHOP_X=STADIUM.x;
/** Facing out from the wall, to the viewing area (+z, south): the Konbini machines' yaw. */
export const STADIUM_SHOP_YAW=0;
/** Back gap to the wall (vendingPlaces.ts KONBINI_BACK_GAP) and the gap between neighbouring cabinets. */
export const STADIUM_SHOP_BACK_GAP=.03,STADIUM_SHOP_GAP=.12;
/** Cabinet sizes on the ground (drinkMachines.ts CABINET_WIDTH; vendingPlaces.ts CABINET_HALF_DEPTH). */
const VEND_W=1.69,VEND_HALF_D=.559;
/** The vending machine (west) of the middle pair; its drink machine stands 1.81 m east (drinkSpotBeside). */
export function stadiumVendingSpot(){return {x:r2(STADIUM_SHOP_X-(VEND_W+STADIUM_SHOP_GAP)/2),z:r2(STADIUM_SHOP_WALL_Z+STADIUM_SHOP_BACK_GAP+VEND_HALF_D),yaw:STADIUM_SHOP_YAW};}
/** Half the middle pair's width: the gashapons start this far either side of the middle (plus the gap). */
export const STADIUM_VENDING_HALF=VEND_W+STADIUM_SHOP_GAP/2;
/** A cabinet `depth` deep, flush against the wall. */
export const stadiumShopZ=(depth:number)=>r2(STADIUM_SHOP_WALL_Z+STADIUM_SHOP_BACK_GAP+depth/2);
