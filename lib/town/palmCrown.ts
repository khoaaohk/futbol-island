/**
 * Palm crowns on their trunks (owner Nov 27 2026, shot 212, looking up at a palm: "the leaves are not on the trunk of the tree
 * properly"). The trunk leans (world.ts tilts it about its middle; Summit Isle by `lean`), so its tip sits off the palm's axis, and the
 * size variety (taller palms) made the gap ~0.3 m: the fronds' hub hung beside the trunk tip. Every palm builder now hangs its crown
 * from the trunk's real tip (the trunk mesh's own transform) and records the gap here (frond hub - trunk tip, metres) for
 * tests/palm-crown.cjs. Build time only; the list is cleared by nothing (a page builds the town once; tests read it after one build).
 */
export type PalmCrownCheck={x:number;z:number;where:string;gap:number};
export const PALM_CROWNS:PalmCrownCheck[]=[];
export const PALM_KNOB_COLOR='#7f6547';
