/**
 * User Timing marks for the title screen → island hand-off (Oct 9 2026, preload pass). One `performance.mark` per step, a few
 * per visit, no observers: they cost nothing measurable and let a trace (or scratchpad/preload measurement scripts) split the tan
 * hold into chunk load, scene build, shader compile and first frame. Names: `fi:<step>`.
 */
export function bootMark(name:string){try{performance.mark(`fi:${name}`);}catch{/* old Safari without User Timing L3 */}}
