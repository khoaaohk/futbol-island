/**
 * One name tag at a time (user, Oct 1 2026): only the townsperson closest to the player shows a tag, the one "Talk to …" would
 * open. Pure and allocation-free so `islandNpcs.update` can call it every frame.
 *
 * Hysteresis like the HUD arbiter (lib/ui/hudStack.ts createFocusArbiter, docs/ui/HUD_STACK.md): the current choice keeps its tag
 * until it leaves the range or stops being eligible, or a challenger is at least NPC_TAG_MARGIN metres closer, so two people
 * standing side by side never flicker between tags as the player walks past.
 */
export const NPC_TAG_MARGIN=1.5;
export type TagCandidate={distance:number};
/**
 * The tag focus for this frame. `current` is last frame's choice (or null); `eligible` says whether a candidate may hold a tag
 * at all (drawn, not knocked over…); `range` is the tag's show range (a candidate at or beyond it never shows).
 */
export function pickTagFocus<T extends TagCandidate>(current:T|null,items:readonly T[],eligible:(item:T)=>boolean,range:number,margin=NPC_TAG_MARGIN):T|null{
 let best:T|null=null;
 for(let i=0;i<items.length;i++){const item=items[i];if(item.distance>=range||!eligible(item))continue;if(best===null||item.distance<best.distance)best=item;}
 if(current!==null&&best!==null&&current!==best&&current.distance<range&&eligible(current)&&best.distance>current.distance-margin)return current;
 return best;
}
