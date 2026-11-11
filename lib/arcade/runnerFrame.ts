/**
 * Breakaway Run upright chase camera (Nov 11 2026, owner: "the break away game should not be turned sideways to play").
 * A phone held upright gets its own framing instead of the sideways one: the road runs up the screen, the horizon (sun, sea,
 * headland, lighthouse) sits about a third down the tall frame and the runner's feet sit just above the thumb controls.
 * Solved once per resize from the viewport (no per-frame fitting):
 *  - horizon: fraction of the height from the top where the horizon lands (a little higher on short screens, to keep road);
 *  - pad: CSS px the thumb cluster needs at the bottom (its 174 px height + a 26 px gap for the camera's own moves); the caller adds the bottom gutter and safe area;
 *  - lane: px per metre at the runner as a fraction of the WIDTH, so the three lanes (x = -2.4 / 0 / 2.4 m) read left / centre /
 *    right at any phone width (360 px: 41 px per metre, the side lanes 99 px either side of centre before the camera follows);
 *  - fov 48 (vertical): wider than the sideways 38 so the sun and headland stay in the narrow frame, and narrow enough that the
 *    runner stays at least as far from the lens as sideways (12.7 m), which is what keeps the reaction distance: an obstacle
 *    `height` m tall is `px` tall on screen at depth * (ppm * height / px) from the lens (runnerSightAhead).
 * Pure (no DOM, no three): lib/arcade/games/runnerGame3d.ts applies it; tests/runner-upright.cjs checks the numbers.
 */
export const RUNNER_UPRIGHT={fov:48,horizon:.36,horizonShort:.32,pad:200,lane:.115,maxPpm:52,sightPx:24} as const;
/** The sideways phone framing (lib/arcade/runnerFx.ts camera: 5.4 m up, 12 m back, looking at 1.66 m up 13 m ahead; fov 38). */
export const RUNNER_SIDEWAYS={fov:38,y:5.4,z:12,lookY:1.66,lookZ:-13} as const;
const rad=Math.PI/180,clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export type RunnerFrame={fov:number;y:number;z:number;lookY:number;lookZ:number;pitch:number;depth:number;ppm:number;horizonY:number;feetY:number};
/** Upright framing for a w x h CSS px canvas; `reserve` = px kept free at the bottom for the thumb controls. */
export function runnerUprightFrame(w:number,h:number,reserve:number=RUNNER_UPRIGHT.pad+16):RunnerFrame{
 const C=RUNNER_UPRIGHT,t=Math.tan(C.fov*rad/2),hy=C.horizonShort+(C.horizon-C.horizonShort)*clamp((h-560)/100,0,1),fy=clamp((h-reserve)/h,.56,.8);
 const pitch=Math.atan(t*(1-2*hy)),below=Math.atan(t*(2*fy-1)),elev=pitch+below,ppm=Math.min(C.maxPpm,C.lane*w),depth=h/2/(t*ppm),dist=depth/Math.cos(below);
 const y=dist*Math.sin(elev),z=dist*Math.cos(elev);
 return{fov:C.fov,y,z,lookY:y-Math.sin(pitch)*30,lookZ:z-Math.cos(pitch)*30,pitch,depth,ppm,horizonY:hy*h,feetY:fy*h};
}
/** The sideways framing's depth and scale for a canvas h CSS px tall (same maths, for the fairness comparison). */
export function runnerSidewaysFrame(h:number):{depth:number;ppm:number}{
 const S=RUNNER_SIDEWAYS,pitch=Math.atan((S.y-S.lookY)/(S.z-S.lookZ)),depth=S.z*Math.cos(pitch)+S.y*Math.sin(pitch);
 return{depth,ppm:h/2/(Math.tan(S.fov*rad/2)*depth)};
}
/** Metres AHEAD of the runner at which an obstacle `height` m tall first shows `px` px tall. Reaction time = this / speed. */
export const runnerSightAhead=(f:{depth:number;ppm:number},height=1.7,px:number=RUNNER_UPRIGHT.sightPx)=>f.depth*(f.ppm*height/px-1);
