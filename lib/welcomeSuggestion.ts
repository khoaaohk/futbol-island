/**
 * The in-island "Welcome back!" note's "for you" suggestion: ONE extra line in the note (components/WelcomeBack.tsx). The note
 * stays a note, not a menu (owner, Oct 1 2026: no buttons): with a suggestion the whole note is the tap target. Decided on this
 * device from the local save only, never sent anywhere (docs/welcome-suggestions.md).
 *
 * Nov 14 2026, smart welcome: per player. The on-device tally (lib/welcome/tally.ts) scores the interests; the best HOOK of the
 * top interests wins by tier (lib/welcome/hooks.ts: almost done > about to be lost > new since last visit > right time >
 * evergreen); what the player tapped or ignored backs a kind off or reinforces it (lib/welcome/learn.ts). New players rotate
 * fishing / a lesson / the arcade; about 1 visit in 5 is a cross-interest nudge; 10% of devices (the holdout) get no suggestion.
 * Pure (tests/welcome-suggestions.cjs).
 */
import {crossHook,hooksFor,type WelcomeFacts,type WelcomeHook} from './welcome/hooks';
import {interestScores,rankInterests,type Interest,type Tally} from './welcome/tally';
import {backedOff,tapBoost,type Arm,type Learn} from './welcome/learn';

export type {WelcomeHook as WelcomeSuggestion} from './welcome/hooks';
export type WelcomeContext={arm:Arm;tally:Tally;learn:Learn;today:number;facts:WelcomeFacts};
/** Below this many welcome notes on the device, the player is new: rotate to learn quickly. */
export const NEW_PLAYER_VISITS=3;
export const ROTATION:readonly Interest[]=['fishing','lessons','arcade'];
/** One visit in CROSS_EVERY (after the new-player visits) is the cross-interest nudge. */
export const CROSS_EVERY=5;
/** The second interest wins only with a strictly better tier than the top one (by at least one step). */
const TOP_BONUS=0.5;

function rotate(c:WelcomeContext,ok:(h:WelcomeHook)=>boolean):WelcomeHook|null{
 const s=c.learn.n%ROTATION.length;
 for(let i=0;i<ROTATION.length;i++){const h=hooksFor(ROTATION[(s+i)%ROTATION.length],c.facts)[0];if(h&&ok(h))return h;}
 return null;
}
/** The one suggestion for this visit, or null (the holdout, or nothing fits). Pure. */
export function pickWelcomeSuggestion(c:WelcomeContext):WelcomeHook|null{
 if(c.arm==='hold')return null;
 const ok=(h:WelcomeHook)=>!backedOff(c.learn,h.kind,c.today);
 if(c.learn.n<NEW_PLAYER_VISITS)return rotate(c,ok);
 const ranked=rankInterests(interestScores(c.tally,c.today,tapBoost(c.learn)));
 if(!ranked.length)return rotate(c,ok);
 if(c.learn.n%CROSS_EVERY===CROSS_EVERY-1){const x=crossHook(ranked[0],c.facts);if(x&&ok(x))return x;}
 // The best hook of each interest in score order; a backed-off best hook skips that interest (try the next one).
 const best:WelcomeHook[]=[];
 for(const i of ranked){const h=hooksFor(i,c.facts)[0];if(h&&ok(h))best.push(h);if(best.length===2)break;}
 if(!best.length)return rotate(c,ok);
 return best.length===2&&best[1].tier>best[0].tier+TOP_BONUS?best[1]:best[0];
}
