/**
 * Motion maths for the title screen (Oct 9 2026). Pure functions, no DOM, so tests/landing.cjs runs them in Node.
 *
 * Heat rules (AGENTS.md, docs/performance-guide.md "Landing page (was /start)" and "Title screen at /"):
 *  - the parallax spring runs a frame loop ONLY while it is moving; settled() ends it, so the page sits at 0 rAF at rest;
 *  - ambient CSS loops calm (pause) after CALM_MS without input, and pause while the tab is hidden;
 *  - device tilt is read only after a user gesture, ignores tiny changes (TILT_DEADBAND) and is dropped when calm.
 */
export const CALM_MS=8000;
export const TILT_DEADBAND=0.02;
/** A critically-damped-ish spring: k stiffness, c damping (ζ ≈ 0.72). */
export const SPRING={k:90,c:13.5};
export type Axis={x:number;v:number};
/** One semi-implicit Euler step towards `target`; dt in seconds (clamped so a slow frame never explodes). */
export function springStep(a:Axis,target:number,dt:number,{k,c}=SPRING):Axis{
 const h=Math.min(Math.max(dt,0),1/30);const v=a.v+(-k*(a.x-target)-c*a.v)*h;return {x:a.x+v*h,v};
}
export const settled=(a:Axis,target:number,eps=0.0015)=>Math.abs(a.x-target)<eps&&Math.abs(a.v)<eps*10;
export const clamp=(n:number,lo=-1,hi=1)=>Math.min(hi,Math.max(lo,n));
/** Pointer → parallax target in [-1,1] for each axis. */
export const pointerTarget=(px:number,py:number,w:number,h:number)=>({x:clamp((px/Math.max(w,1))*2-1),y:clamp((py/Math.max(h,1))*2-1)});
/** Tilt (deg from the first reading) → target; ±18° covers the range. Below the deadband the old target stands. */
export function tiltTarget(gamma:number,beta:number,g0:number,b0:number,prev:{x:number;y:number}){
 const next={x:clamp((gamma-g0)/18),y:clamp((beta-b0)/18)};
 return Math.abs(next.x-prev.x)<TILT_DEADBAND&&Math.abs(next.y-prev.y)<TILT_DEADBAND?prev:next;
}
export type Box={left:number;top:number;width:number;height:number};
/** FLIP: the transform that puts an element laid out at `to` exactly over `from` (origin top-left). */
export function invert(from:Box,to:Box){
 return {x:from.left-to.left,y:from.top-to.top,sx:from.width/Math.max(to.width,1),sy:from.height/Math.max(to.height,1)};
}
export const flipTransform=(i:ReturnType<typeof invert>)=>`translate(${i.x}px, ${i.y}px) scale(${i.sx}, ${i.sy})`;
/** The game's springy settle as a CSS easing (one overshoot). */
export const SPRING_EASE='cubic-bezier(.2,1.28,.32,1)';
