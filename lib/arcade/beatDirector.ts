/* Arcade beat director (Nov 10 2026, arcade part 3). The arcade cinemas (Breakaway Run, Island Strikers, Futbol Tennis, Futbol
 * Pinball) each had their own copy of the same bookkeeping: a real-time clock that slow-mo never slows, "one slow-mo per N
 * seconds" / "one camera push per M seconds" gates, the reduced-motion gate and the smoothstep easing. This owns those; each
 * cinema stays a thin spec (its beat table and its own envelope shape) on top.
 *
 * What stays per game, on purpose: the envelope curves and skip ramps differ per game (attack-hold-release with an eased skip in
 * the runner, a linear fade in pinball, a separate slow-mo depth ramp in Strikers, a piecewise strike curve in tennis). Folding
 * them into one curve would change what players see, and tests/arcade-beat-director.cjs pins every cinema's output bit for bit.
 * Pass Puzzles' cinematic keeps its own code: it eases exponentially and spends a per-attempt slow-mo budget instead of a gap
 * clock, so there is nothing here it could share without changing its feel.
 *
 * No allocation after create: tick/ready/mark are plain number reads and writes.
 */

/** Smoothstep on 0..1, clamped. The one easing every cinema uses. */
export const smoothstep=(u:number)=>u<=0?0:u>=1?1:u*u*(3-2*u);
/** True when at least `gap` seconds of real time have passed since `last` (the shared cap rule: >= opens the gate). */
export const beatGateOpen=(clock:number,last:number,gap:number)=>clock-last>=gap;

export type BeatDirectorSpec<C extends string>={
 /** Reduced motion: the cinema plays no beats (each cinema decides what a skipped beat still shows, e.g. a flash). */
 reduced:boolean;
 /** Minimum real seconds between two beats of each channel (e.g. slow: 6, cam: 2.5). */
 gaps:Record<C,number>;
 /** "Never fired" time for every channel (default -99: open from the first frame). */
 never?:number;
};
export type BeatDirector<C extends string>={
 /** Real-time clock (seconds, never slowed). */
 readonly clock:number;
 reduced:boolean;
 /** Advance the real-time clock. */
 tick(dt:number):void;
 /** The channel's gap has passed (a beat may start). */
 ready(channel:C):boolean;
 /** A beat of this channel starts now. */
 mark(channel:C):void;
 /** Seconds since the channel last fired. */
 since(channel:C):number;
 /** Time the channel last fired (debug / tests). */
 last(channel:C):number;
 /** Forget when channels fired (the clock keeps running). */
 resetGates():void;
};

export function createBeatDirector<C extends string>(spec:BeatDirectorSpec<C>):BeatDirector<C>{
 const never=spec.never??-99,gaps=spec.gaps,fired={} as Record<C,number>;
 for(const k in gaps)fired[k]=never;
 let clock=0;
 return{
  get clock(){return clock;},
  reduced:spec.reduced,
  tick(dt){clock+=dt;},
  ready(ch){return beatGateOpen(clock,fired[ch],gaps[ch]);},
  mark(ch){fired[ch]=clock;},
  since(ch){return clock-fired[ch];},
  last(ch){return fired[ch];},
  resetGates(){for(const k in gaps)fired[k]=never;},
 };
}
