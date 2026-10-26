/**
 * The job work camera's easing (Oct 26 2026, owner; docs/JOBS_UPGRADE_OCT25.md open item 1). Pure: no three.js.
 * While a job action is held (rake, hammer, pump…) the follow camera eases gently toward the player; it lingers between holds so
 * it never pumps in and out, and eases back once the action stops. jobScene.ts applies the returned amount as a dolly.
 */
export const WORK_DOLLY=.28;
/** Seconds the camera stays in after a hold ends, so back-to-back holds read as one move. */
export const WORK_LINGER=1.2;
/** Ease rates (1/s): in is the gentler one. */
export const WORK_IN_RATE=1.2,WORK_OUT_RATE=2.4;
export type WorkCam={k:number;linger:number};
export const newWorkCam=():WorkCam=>({k:0,linger:0});
/**
 * Advances the state and returns the dolly amount (0 = the follow camera, WORK_DOLLY = fully in), smoothstepped so the start is soft.
 * `busy`: another shot camera owns the view (the referee replay, a catch push-in), so the work camera eases out of its way.
 * Reduced motion: never moves.
 */
export function stepWorkCam(s:WorkCam,dt:number,o:{active:boolean;holding:boolean;busy:boolean;reduced:boolean}):number{
 if(o.reduced){s.k=0;s.linger=0;return 0;}
 s.linger=o.holding?WORK_LINGER:Math.max(0,s.linger-dt);
 const want=o.active&&!o.busy&&(o.holding||s.linger>0);
 s.k+=((want?1:0)-s.k)*(1-Math.exp(-Math.max(0,dt)*(want?WORK_IN_RATE:WORK_OUT_RATE)));
 if(!want&&s.k<1e-3)s.k=0;
 return s.k*s.k*(3-2*s.k)*WORK_DOLLY;
}
