import {SPOTS,spotOf,swatch,clash,KIT_ROLES,type Kits,type Spot} from './data';

/**
 * shirts · "The kit room, matchday 1928", the game model (Oct 12 2026 anatomy restyle; the rules of the Oct 10 game are kept).
 * Pure, so tests/museum-exp-shirts.cjs checks it in Node. The history and the clash maths live in data.ts (unchanged, sourced).
 *
 * The kit room is a bench: a TACTICS BOARD with the eleven pegs of the 1928 2-3-5, a NUMBER PRESS (hopper, tray, a stamp head on
 * two guide posts, a clock dial) and eight DYE VATS. Two halves against the clock:
 *  1. Numbers (40 s): a shirt lies on the press with its number; drag it onto the peg where that number played (or tap the peg).
 *     Right: a player stands on the peg with the number on his back (10 + a streak bonus); wrong: a nudge, the streak is lost.
 *  2. Colours (30 s): your team plays in red. Dye the other team's kit, both keepers' and the referee's from the vats. Law 4:
 *     every one of them must look different from all the others (data.clash, ΔE under 45). A clash is refused with the reason.
 * Reduced motion: the clock stops (turn-based), every rule is the same.
 */
export const NUM_SECONDS=40,COL_SECONDS=30;
export const SHIRT_POINTS=10,STREAK_STEP=5,STREAK_CAP=4,KIT_POINTS=20,CLASH_PENALTY=5,TEAM_BONUS=30;
export const shirtPoints=(streak:number)=>SHIRT_POINTS+STREAK_STEP*Math.min(streak,STREAK_CAP);
/** The eleven numbers in a random order (Fisher–Yates). */
export function pile(rng:()=>number=Math.random):number[]{const a=Array.from({length:11},(_,i)=>i+1);
 for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
/** Seconds left on the clock turn into points when a half is finished early (none when the clock is off). */
export const timeBonus=(left:number)=>Math.max(0,Math.floor(left));

// ── Colours ────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const HOME='red';
export const VATS=['red','orange','yellow','green','sky','navy','white','black'] as const;
export type Job=Exclude<keyof Kits,'home'>;
export const JOBS:readonly {key:Job;label:string;tag:string}[]=[
 {key:'away',label:'Other team',tag:'Away'},{key:'homeGk',label:'Your keeper',tag:'GK 1'},{key:'awayGk',label:'Their keeper',tag:'GK 2'},{key:'referee',label:'Referee',tag:'Ref'}];
const roleLabel=(k:keyof Kits)=>KIT_ROLES.find(r=>r.key===k)!.label.toLowerCase();
/**
 * Dye a kit: Law 4 says the teams, the referee and each keeper must all look different. The new colour is checked against
 * every kit already dyed (all five roles are pairwise checked by data.lawChecks, so this is the same rule, one pick at a time).
 */
export function dye(job:Job,colour:string,kits:Partial<Kits>):{ok:true;say:string}|{ok:false;say:string;with:keyof Kits}{
 for(const k of ['home','away','homeGk','awayGk','referee'] as const){if(k===job)continue;const c=kits[k];if(!c)continue;
  if(clash(colour,c))return {ok:false,with:k,say:`${swatch(colour).name} is too close to ${roleLabel(k)==='your team'?'your team':'the '+roleLabel(k)} in ${swatch(c).name.toLowerCase()}. Pick a colour nobody else wears.`};}
 return {ok:true,say:`${swatch(colour).name} for ${roleLabel(job)==='your team'?'your team':'the '+roleLabel(job)}: easy to tell apart.`};}

// ── The tactics board ──────────────────────────────────────────────────────────────────────────────────────────────────
/** World units per pitch metre on the board. */
export const BS=3;
/** The board in frame space: a from our goal line towards theirs (105 m), b across (68 m), our right side at +b. */
export const BOARD={a0:0,a1:105*BS,b0:-34*BS,b1:34*BS} as const;
/** A 1928 spot (data.SPOTS: x across 0–68 with the right wing at 61, y 0–105 with our goal at 105) → board (a, b). */
export const pegOf=(s:Spot)=>({a:+((105-s.y)*BS).toFixed(1),b:+((s.x-34)*BS).toFixed(1)});
/** The other team stands in its own 2-3-5, attacking our goal (their right is our left), a little to one side of ours. */
export const awayOf=(s:Spot)=>({a:+(s.y*BS).toFixed(1),b:+((34-s.x)*BS+10).toFixed(1)});
export const REF_AT={a:52*BS,b:22*BS} as const;
export {spotOf,SPOTS};
