// Beach loungers and the islanders who sunbathe on them (Nov 13 2026, owner: "NPCs lying on bare sand look dead"). Every lying
// townsperson lies ON a lounger UNDER an umbrella, on the back, reclined against the backrest (lib/graphics/npcSeatPose.ts 'lie').
// The umbrella sets are the ones the beaches already build (world.ts North Beach and Palm Coast, coralCayWorld.ts umbrella());
// Luana moved off the cay lawn onto the south beach's ring umbrella. Pure data, no three.js: the builders, the cast and tests/beach-npcs.cjs
// read the same numbers, so a sunbather always lands on the pad, head at the backrest.
import {NORTH_BEACH_UMBRELLAS} from './shoreline';

/** A lounger: pad top height, the pad's north (head) end from the umbrella, and where the lying body goes on it. The backrest
 *  rises from the pad toward the head end (tilt rad about x, + = high end north), its centre BACK_DZ in from the head end. */
export const LOUNGER={backDz:.35,backDy:.21,backTilt:.55,backLen:.75,rootDz:.65} as const;
/** North Beach and Coral Cay sets (world.ts, coralCayWorld.ts umbrella()): two loungers at x ± 1.1, pads .8 × .18 × 2.2 at y .12
 *  centred z + 1.2 (head end z + .1). */
export const SET_LOUNGER={dx:[-1.1,1.1],padY:.12,padH:.18,padLen:2.2,padDz:1.2,top:.21} as const;
/** Palm Coast sets (world.ts): one lounger at x + 1.4, pad .85 × .22 × 2.4 at y .16 centred z + 1 (head end z - .2). */
export const PALM_LOUNGER={dx:1.4,padY:.16,padH:.22,padLen:2.4,padDz:1,top:.27} as const;
export const PALM_COAST_UMBRELLAS=[{x:-18,z:101},{x:8,z:108},{x:32,z:116}] as const;
/** The Coral Cay beach-ring umbrella on the south sand (coralCayWorld.ts ring, every 17th shore point; tests/beach-npcs.cjs checks
 *  it is still built there): Luana's set. */
export const CAY_SUNBATHER_UMBRELLA={x:599.4993,z:-247.887} as const;
/** The backrest centre (y, z) for a pad whose head end is at `headZ` with its top at `top`. */
export const loungerBack=(headZ:number,top:number)=>({y:top+LOUNGER.backDy,z:headZ+LOUNGER.backDz});
type Spot={x:number;z:number;yaw:number;top:number};
const onSet=(u:{x:number;z:number},side:0|1):Spot=>({x:u.x+SET_LOUNGER.dx[side],z:u.z+SET_LOUNGER.padDz-SET_LOUNGER.padLen/2+LOUNGER.rootDz,yaw:0,top:SET_LOUNGER.top});
const onPalm=(u:{x:number;z:number}):Spot=>({x:u.x+PALM_LOUNGER.dx,z:u.z+PALM_LOUNGER.padDz-PALM_LOUNGER.padLen/2+LOUNGER.rootDz,yaw:0,top:PALM_LOUNGER.top});
/** Where each sunbather lies: root on the pad's centre line, facing +z (feet toward the pad's foot), `top` the pad's height. */
export const SUNBATHERS={
 aroha:onSet(NORTH_BEACH_UMBRELLAS[1],0),
 fatou:onSet(NORTH_BEACH_UMBRELLAS[3],0),
 tama:onPalm(PALM_COAST_UMBRELLAS[1]),
 luana:onSet(CAY_SUNBATHER_UMBRELLA,0),
} as const satisfies Record<string,Spot>;
