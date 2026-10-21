/**
 * Summit Isle bugs (Oct 20 2026, docs/island-jobs.md §15 "Bug flight"): pure rules for the bug swarm (lib/graphics/bugSwarm.ts,
 * wrapped as the wild bugs in wildBugs.ts), no three.js. The wild bugs and the Bug squad's bugs are the same creatures: the 20
 * species of lib/town/jobs/bugSpecies.ts, each at its BUG_HOMES spot spread over the island's four bands (the rotating
 * pickBugsOnMap set), and the eight firefly calls at their FIREFLY_HOMES at Night (the player's own Day / Sunset / Night setting).
 *
 * Heat first (AGENTS.md "Mobile heat is a primary requirement"): built only while the player is on or near Summit Isle, a hard cap
 * by heat tier (bugs 12 / 10 / 8, pickBugsOnMap's caps; fireflies 8 / 6 / 4; none at tiers 3–4, Battery saver or reduced motion),
 * every frame only for bugs within NEAR_M of the player and 15 Hz for the rest, nothing simulated or drawn beyond SIM_M, no
 * textures, no per-frame allocation. Draws: one far-silhouette draw plus one per species within FULL_IN_M (full model), or two
 * at Night (firefly bodies + glows).
 */
import {bugMapCount} from '../town/jobs/bugSpecies';

/** Window event: a wild bug fluttered away from the player (IslandJobs shows the "Try the Bug squad job" note, once a visit). */
export const WILD_BUG_HINT='fi2-wild-bug-hint';
/** Built within BUILD_M of the Summit Isle middle (640, 130), disposed beyond DROP_M; per-bug: every frame within NEAR_M of the
 *  player, FAR_HZ beyond, frozen and hidden beyond SIM_M. Full model within FULL_IN_M (kept to FULL_OUT_M), silhouette beyond. */
export const WILD_BUG_RANGE={BUILD_M:250,DROP_M:290,NEAR_M:35,FAR_HZ:15,SIM_M:120,FULL_IN_M:14,FULL_OUT_M:20} as const;
/** How often (s) one bug may count a flutter for analytics. */
export const WILD_FLEE={COUNT_EVERY_S:8} as const;
/** Fireflies on the map by heat tier 0 / 1 / 2. */
export const FIREFLY_MAP_CAP:readonly number[]=[8,6,4];
/** On-screen size (m, the longer of length and wingspan) from look.size: bigger than life and evened out, so even the little
 *  spider and ladybird read from the follow camera ~40 m away (ladybird ~1 m, dragonfly ~1.6 m; the old wild bug was 1.5 m). */
/** Oct 20 2026 (user: "can't see bugs"): 1.6x bigger than the first pass (was × 1.7), so a bug reads as a bug from the follow camera. */
export const bugVisualSize=(size:number)=>(size+.25)*2.7;
export const FIREFLY_SIZE=.5;

/** How many to draw: bugs 12 / 10 / 8 at heat tiers 0 / 1 / 2 (pickBugsOnMap), fireflies 8 / 6 / 4 at Night, none at tiers 3–4
 *  (Battery saver is tier 4) or with reduced motion (bugs stay still and none are drawn). */
export function wildBugCount(o:{tier:number;reduced:boolean;night:boolean}):number{
 if(o.reduced||o.tier>=3)return 0;const t=Math.max(0,Math.min(2,Math.floor(o.tier)||0));return o.night?FIREFLY_MAP_CAP[t]:bugMapCount(t);
}
