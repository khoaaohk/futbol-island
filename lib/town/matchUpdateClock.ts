/** Unseen matches accumulate at most 100 ms; visible matches consume time immediately. */
export function createMatchUpdateClock(){
 let pending=0;
 return {take(dt:number,immediate:boolean,active:boolean){if(!active)return 0;pending+=Math.max(0,dt);if(!immediate&&pending<.1)return 0;const elapsed=pending;pending=0;return elapsed;},get pending(){return pending;}};
}
