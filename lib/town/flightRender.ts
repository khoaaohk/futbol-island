/**
 * Rendered flight height (Oct 14 2026, user: "parachuting down is glitchy. it shakes").
 *
 * Town simulates at a fixed 60 Hz and draws at the display rate (60 / 120 Hz desktops, the 30 fps phone cap, the 20 fps idle
 * cap). The player's x/z were drawn interpolated between the last two ticks, but the flight height was drawn as the latest tick's
 * value, so a 9 m/s parachute descent moved in stairs: still on one frame, two ticks' worth on the next (120 Hz: every other
 * frame; 60 Hz: whenever the rAF clock drifts across a tick). The camera, locked to the height while a jet action runs, stepped
 * with it. Interpolating the height with the same blend as x/z makes the descent continuous at every frame rate.
 *
 * A jump larger than FLIGHT_RENDER_SNAP in one tick is a teleport (a reset, a ride change, a corrected landing), drawn at once.
 */
export const FLIGHT_RENDER_SNAP=12;
export function flightRenderHeight(previous:number,current:number,blend:number){
 if(!Number.isFinite(previous)||Math.abs(current-previous)>FLIGHT_RENDER_SNAP)return current;
 const b=blend<0?0:blend>1?1:blend;return previous+(current-previous)*b;
}
