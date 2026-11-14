import {SCREEN} from './stadiumSeats';
import {STADIUM} from './westParkLayout';

/** The viewing area in front of the screen's back face: stadiumNpcs.ts VIEWING (repeated here so the island bundle does not pull in
 *  the stadium cast; tests/qa-leftovers-nov14.cjs keeps them equal). */
const BACK_Z=STADIUM.z+SCREEN.z+.3;
export const SCREEN_VIEWING={x:STADIUM.x,z0:BACK_Z+4.6,z1:BACK_Z+9.4,halfW:5.6} as const;
const VIEWING=SCREEN_VIEWING;

/**
 * Public viewing on a portrait phone (QA Nov 14 2026): the follow camera looks down at the walker, so from the viewing area the
 * big screen (12.6 m up, north of it) and its back feed sat above the frame; the feed rendered but a kid could not see it.
 * In and near the viewing area the camera target slides north (toward the screen) and eases back along its own view line, so
 * the walker sits low in the frame with the screen above. Same view direction as everywhere (no tilt). Weight 1 inside the
 * viewing box, easing to 0 over SCREEN_FRAME.fade m round it; 0 on desktop / landscape (the frame is wide enough there).
 */
export const SCREEN_FRAME={north:9,back:.18,margin:2,fade:5} as const;
export function screenFrameWeight(x:number,z:number){
 const dx=Math.max(0,Math.abs(x-VIEWING.x)-VIEWING.halfW-SCREEN_FRAME.margin),dz=Math.max(0,VIEWING.z0-SCREEN_FRAME.margin-z,z-VIEWING.z1-SCREEN_FRAME.margin);
 const d=Math.hypot(dx,dz);if(d>=SCREEN_FRAME.fade)return 0;const t=1-d/SCREEN_FRAME.fade;return t*t*(3-2*t);
}
