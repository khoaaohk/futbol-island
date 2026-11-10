/**
 * Breakaway Run swipes (Nov 10 2026, arcade audit part 1). Runners are swipe-native: a quick flick on the track changes lane
 * (left / right), jumps (up) or slides (down), exactly like the stick and the Jump / Slide buttons, which stay for players who
 * prefer them. The swipe fires the moment it is clear (no wait for the finger to lift), so it is faster than the stick's
 * on/off/repeat steps (runnerSteer.ts). Jump and slide then go through the same per-route input buffer as the buttons
 * (runnerModes.ts buffer / coyote / laneGrace), so each route keeps its forgiving windows.
 *
 *  - minDist: CSS px the finger must travel along the main axis (a tap or a wobble is not a swipe);
 *  - maxTime: seconds from touch-down; a slow drag is not a flick and never fires;
 *  - axisRatio: the main axis must be this many times the other one, so a diagonal waits until it is clearly one way and a
 *    true 45° flick is ignored (never a lane change AND a jump);
 *  - one action per swipe: after it fires, the same finger does nothing until it lifts.
 * Pure (no DOM): components/games/RunnerControls.tsx feeds it pointer positions; tests/runner-swipe.cjs covers it.
 */
export const RUNNER_SWIPE={minDist:28,maxTime:.45,axisRatio:1.4} as const;
export type RunnerSwipe='left'|'right'|'up'|'down';
export type RunnerSwipeState={id:number;x:number;y:number;t:number;done:boolean}|null;

export const runnerSwipeStart=(id:number,x:number,y:number,t:number):RunnerSwipeState=>({id,x,y,t,done:false});

/** Feed a move (or the lift, with `end`) of the same pointer; returns the swipe to act on now, or '' (at most once per swipe). */
export function runnerSwipeMove(s:RunnerSwipeState,id:number,x:number,y:number,t:number):RunnerSwipe|''{
 if(!s||s.done||s.id!==id)return '';
 if(t-s.t>RUNNER_SWIPE.maxTime){s.done=true;return '';}
 const dx=x-s.x,dy=y-s.y,ax=Math.abs(dx),ay=Math.abs(dy);
 if(Math.max(ax,ay)<RUNNER_SWIPE.minDist)return '';
 if(ax>=ay*RUNNER_SWIPE.axisRatio){s.done=true;return dx>0?'right':'left';}
 if(ay>=ax*RUNNER_SWIPE.axisRatio){s.done=true;return dy>0?'down':'up';}
 return '';
}
/** What a swipe does: a lane step (−1 / 1) or a pad action id (ArcadeGame3D action: 1 jump, 2 slide). */
export const runnerSwipeAction=(w:RunnerSwipe):{lane:number}|{action:1|2}=>w==='left'?{lane:-1}:w==='right'?{lane:1}:w==='up'?{action:1}:{action:2};
