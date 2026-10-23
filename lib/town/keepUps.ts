/**
 * Keep-ups, shared by the island (lib/town/walkBall.ts counted juggle, components/Town.tsx) and the Konbini
 * (lib/konbini/konbiniBall.ts). Pure, no DOM, no three.js: tests/keepup-counter.cjs runs it in Node.
 *
 * Owner, Oct 22 2026: "the kickup on the main screen should act just like the one in the kombini where it counts your kickups.
 * One minor change to both, if holding the button the kick is higher in the air".
 *
 * COUNT: one per touch that keeps the ball up (the first touch from the feet is 1). The ball landing without a touch, a shot,
 * or stopping (a ride, a dialog, walking out) ends the run. ONE best for both places: the Konbini's existing per-player record
 * (`fi2-konbini-ball-v1`, lib/konbini/konbiniBall.ts recordStreak / readBallRecord, already a synced key in
 * lib/saves/snapshot.ts), so a run on the island can beat a run in the store and the other way round. No new key.
 *
 * HOLD: a press that keeps the button down lifts the touch it triggers higher: nothing for a tap (< HOLD.start), then a linear
 * ramp to HOLD.maxLift × the normal rise at HOLD.full, capped there (the ball still comes back into reach: the extra flight time
 * is √1.6 ≈ 1.26× and the touch window is unchanged). One press triggers at most one touch.
 */
export {KEEPUP_HOLD,holdCharge,holdLift} from './walkBall';
/**
 * The pill's state after the live count changes (island: Town polls walkBall.state.streak; the Konbini gets touch/drop events).
 * `n > 0` → a live count; `n === 0` after a run → the finished run (recorded by the caller) that fades out; null → nothing shown.
 */
export type KeepUpView={n:number;live:boolean;newBest?:boolean};
export function keepUpStep(prev:number,n:number):{kind:'touch'|'end'|'none';view:KeepUpView|null;finished:number}{
 // A restart in the same frame (count fell but is not 0) still finishes the old run.
 if(n>0)return {kind:n!==prev?'touch':'none',view:{n,live:true},finished:n<prev?prev:0};
 if(prev>0)return {kind:'end',view:{n:prev,live:false},finished:prev};
 return {kind:'none',view:null,finished:0};
}
/** How long the finished pill stays (ms): a new best lingers a little longer, like the Konbini's. */
export const keepUpLinger=(newBest:boolean)=>newBest?2600:1800;
