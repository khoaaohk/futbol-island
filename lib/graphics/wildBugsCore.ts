/**
 * Summit Isle bugs (Oct 20 2026, docs/island-jobs.md §15 "Bug flight"): pure rules for the bug swarm (lib/graphics/bugSwarm.ts,
 * wrapped as the wild bugs in wildBugs.ts), no three.js. The wild bugs and the Bug squad's bugs are the same creatures: the 20
 * species of lib/town/jobs/bugSpecies.ts, each at its BUG_HOMES spot spread over the island's four bands (the rotating
 * pickBugsOnMap set), and the eight firefly calls at their FIREFLY_HOMES at Night (the player's own Day / Sunset / Night setting).
 *
 * Heat first (AGENTS.md "Mobile heat is a primary requirement"): built only while the player is on or near Summit Isle, a hard cap
 * by heat tier (bugs 12 / 10 / 8, pickBugsOnMap's caps, none at tiers 3–4; fireflies FIREFLY_AMBIENT 48 / 30 / 20 / 8 desktop, 28 / 16 / 16 / 8 phone; none on Battery saver or with reduced motion),
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
/** Oct 21 2026 (user: "bugs on the island are still drawn at large size"): believable sizes by real-relative class. look.size is
 *  already the species' relative size (spider .2, ant .24, ladybird .32 … dragonfly .7); the island draws it with a gentle
 *  readability boost of × 1.3 for the tiniest down to × 1.0 for the biggest (spider ≈ .26 m, ladybird ≈ .39 m, monarch ≈ .43 m,
 *  dragonfly .7 m), instead of the old (size + .25) × 2.7 (a 1.5 m ladybird). Finding them is the halo's and the hint arrow's job
 *  (bugSpotFx haloSize), not the body's. The caught-bug stage keeps the old scale (bugStageSize). */
export const bugReadBoost=(size:number)=>1.3-.3*Math.min(1,Math.max(0,(size-.2)/.5));
export const bugVisualSize=(size:number)=>size*bugReadBoost(size);
/** The catch stage's source size (the earlier island scale; stageFlightScale caps it to STAGE_BUG_MAX on the stage). */
export const bugStageSize=(size:number)=>(size+.25)*2.7;
export const FIREFLY_SIZE=.5;

/** How many to draw: bugs 12 / 10 / 8 at heat tiers 0 / 1 / 2 (pickBugsOnMap), fireflies 8 / 6 / 4 at Night, none at tiers 3–4
 *  (Battery saver is tier 4) or with reduced motion (bugs stay still and none are drawn). */
/** Oct 21 2026 (user: "need more fireflies flying around on the mountain island"): the Night sky over Summit Isle is busy. Every
 *  firefly shown is one of the eight calls (ambient ones are extra copies of a call, so the jar and the squad still count calls);
 *  by heat tier 0-4, desktop / phone. Tier 3 keeps a few; Battery saver (tier 4) and reduced motion: none (a shift still keeps its
 *  FIREFLY_MAP_CAP catchable ones). One instanced body draw + one glow draw whatever the count. */
export const FIREFLY_AMBIENT={desktop:[48,30,20,8,0],phone:[28,16,16,8,0]} as const;
/** A night shift keeps at least this many fireflies within BUG_LOCAL.radius of the player (tier 0; fewer when fewer are out). */
export const FIREFLY_LOCAL_WANT=14;
export function wildBugCount(o:{tier:number;reduced:boolean;night:boolean;phone?:boolean}):number{
 if(o.reduced)return 0;const t4=Math.max(0,Math.min(4,Math.floor(o.tier)||0));
 if(o.night)return FIREFLY_AMBIENT[o.phone?'phone':'desktop'][t4];
 if(o.tier>=3)return 0;return bugMapCount(Math.min(2,t4));
}
