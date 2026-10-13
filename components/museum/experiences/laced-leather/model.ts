import {HEAD_BALLS,LEATHER} from './facts';

/**
 * laced-leather · "The weather machine", the model (Oct 12 2026 anatomy restyle; the numbers and rules of the Oct 10 game are kept).
 * Pure, so tests/museum-exp-laced-leather.cjs checks it in Node. Every number comes from facts.ts (sourced there).
 *
 *  1. THE RAIN MACHINE: a hood with nozzles over two dial scales. Hold RAIN: the leather ball drinks water and its scale climbs
 *     from 410 g to 595 g (the 2023 lab test: a copy of the 1966 leather ball, 90 minutes in water); the modern ball beside it stays
 *     the same (the Telstar 18 in the same water did not change weight; drawn here at 430 g, the middle of Law 2's 410–450 g).
 *  2. THE RAIN MATCH (match.ts): eight long passes, minute 0 to minute 90, the ball soaking as the match goes on.
 */
export const clamp01=(n:number)=>Math.max(0,Math.min(1,n));
export const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
/** What the scale reads at a given soak (0 dry → 1 after the lab's 90 minutes). */
export const gramsAt=(soak:number)=>Math.round(LEATHER.dry+(LEATHER.wet-LEATHER.dry)*clamp01(soak));
/** Seconds of holding RAIN from dry to soaked (stands for the lab's 90 minutes). A tap adds 15 minutes. */
export const SOAK_SECONDS=4,TAP_SOAK=1/6;
export const MODERN_G=HEAD_BALLS.modern.g;
export const minutesAt=(soak:number)=>Math.round(clamp01(soak)*LEATHER.soakMinutes);
/** The leather's colour as it soaks: dry tan → dark wet brown (colour is the lesson here). */
export const LEATHER_DRY='#b9834c',LEATHER_WET='#5b3a1f';
const hx=(h:string)=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
export const leatherTone=(soak:number)=>{const a=hx(LEATHER_DRY),b=hx(LEATHER_WET),t=clamp01(soak);return '#'+a.map((v,i)=>Math.round(v+(b[i]-v)*t).toString(16).padStart(2,'0')).join('');};
/** The soak a ball of g grams stands for (for its colour in the match). */
export const soakOfGrams=(g:number)=>clamp01((g-LEATHER.dry)/(LEATHER.wet-LEATHER.dry));
/** A dial scale: the needle's angle (radians from 12 o'clock, clockwise) for a weight, over a 300° sweep from 300 g to 700 g. */
export const DIAL={min:300,max:700,from:-150*Math.PI/180,span:300*Math.PI/180} as const;
export const needleAngle=(g:number)=>DIAL.from+clamp01((g-DIAL.min)/(DIAL.max-DIAL.min))*DIAL.span;
/** How far the pan sinks under a weight (world units; a stiff spring). */
export const panSink=(g:number)=>clamp((g-DIAL.min)/100,0,6)*1.2;

// ── The rain match flight ───────────────────────────────────────────────────────────────────────────────────────────────
/** The flight of a kick that lands at `to` metres: time, height (m) and where the ball is s seconds in. */
export const flightTime=(to:number)=>.8+to/34;
export function flightAt(to:number,s:number){const T=flightTime(to),u=clamp(s/T,0,1);return {u:lerp(0,to,u),z:4*(.6+to*.13)*u*(1-u),done:u>=1};}
