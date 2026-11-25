/**
 * Island signs: where a sign's posts go (Nov 25 2026, owner shots 78/79: a post ran up through "ISLAND LINE" and the South
 * name board's posts passed in front of its words; "audit all the signs on the island and make sure the poles don't run up
 * into the sign and cover the text").
 * The rule: a post stands BEHIND the sign face (at least SIGN_POST_GAP clear of the face plane, so the face hides it from the
 * readable side and never z-fights with it), or at the face's outer edges, outside the text box (SIGN_TEXT_MARGIN of the width
 * in from each edge). A two-sided board puts its posts between its two faces or at its edges. scripts/sign-posts-scan.cjs
 * checks every board the island builds against this (tests/island-signs.cjs).
 */
/** How far behind a sign face its posts' centres stand by default (a 6-7 cm post then clears the face by 3-4 cm). */
export const SIGN_POST_SET=.1;
/** The least clearance between a post's front and the face plane. */
export const SIGN_POST_GAP=.02;
/** The text box's inset from each side edge, as a share of the board's width. */
export const SIGN_TEXT_MARGIN=.06;
/** A point `by` metres behind a face at (x, z) turned `rotation` about y (a PlaneGeometry faces +z at rotation 0). */
export function behindSign(x:number,z:number,rotation:number,by=SIGN_POST_SET){return {x:x-Math.sin(rotation)*by,z:z-Math.cos(rotation)*by};}
/** True when a round post (centre `u` across the face from its middle, `n` along the face normal, radius r) keeps the rule. */
export function postClearsText(w:number,u:number,n:number,r:number){return n+r<=-SIGN_POST_GAP||Math.abs(u)-r>=w/2-SIGN_TEXT_MARGIN*w;}
