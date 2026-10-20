/**
 * Wild meadow bugs (Oct 20 2026, docs/island-jobs.md §15 "Bug extras"): pure rules for lib/graphics/wildBugs.ts, no three.js.
 * Butterflies and bugs flutter round the Summit Isle meadow by Day and Sunset, and a few fireflies blink there at Night (the
 * player's own Day / Sunset / Night setting), so the Bug squad's bugs feel part of the world. Look only: walking up makes one
 * flutter away (no catching outside a shift); the first time in a visit, a note points to the Bug squad job.
 *
 * Heat first (AGENTS.md "Mobile heat is a primary requirement"): one instanced draw, built only while the player is near the meadow,
 * a hard cap by heat tier (12 cool, 6 at tiers 1–2, none at tiers 3–4, Battery saver or reduced motion), 15 Hz matrix updates
 * when not close, nothing while a bug job runs (the job draws its own), no textures, no per-frame allocation.
 */
import {BUG_SQUAD,FIREFLY_CALLS} from '../town/jobs/bugScout';

/** Window event: a wild bug fluttered away from the player (IslandJobs shows the "Try the Bug squad job" note, once a visit). */
export const WILD_BUG_HINT='fi2-wild-bug-hint';
/** The meadow's middle (between the two job signs and the bugs' spots, bugScout.ts). */
export const MEADOW={x:614,z:41} as const;
/** Built inside BUILD_M of the meadow's middle, disposed beyond DROP_M (hysteresis); full-rate updates inside NEAR_M. */
export const WILD_BUG_RANGE={BUILD_M:70,DROP_M:90,NEAR_M:35,FAR_HZ:15} as const;
/** How close the player walks before a bug flutters away, how long it flees, and how often one bug may count it. */
export const WILD_FLEE={NEAR_M:2.6,SECONDS:2.2,COUNT_EVERY_S:8,SPEED:3.2} as const;
export const WILD_BUG_CAP={cool:12,warm:6} as const;

/** How many wild bugs to draw: 12 cool, 6 at heat tiers 1–2, 0 at tiers 3–4 (Battery saver is tier 4) or with reduced motion.
 *  At Night only half as many fireflies ("a few"). */
export function wildBugCount(o:{tier:number;reduced:boolean;night:boolean}):number{
 if(o.reduced||o.tier>=3)return 0;const cap=o.tier>=1?WILD_BUG_CAP.warm:WILD_BUG_CAP.cool;return o.night?Math.ceil(cap/2):cap;
}
/** Home spots: a little off each job spot (the job's verified walkable meadow), so wild bugs and the shift's bugs never overlap. */
export const WILD_HOMES:readonly {x:number;z:number}[]=[
 ...BUG_SQUAD.map((b,i)=>({x:b.x+(i%2?1.8:-1.6),z:b.z+(i%3?1.4:-1.2)})),
 ...FIREFLY_CALLS.filter((_,i)=>i%2===0).map((f,i)=>({x:f.x+(i%2?-1.5:1.7),z:f.z+1.3})),
];
/** Day colours: the squad's own wing tints (the Football Butterfly and Captain Monarch twice, butterflies being most common). */
export const WILD_COLORS:readonly string[]=[BUG_SQUAD[4].color,BUG_SQUAD[5].color,BUG_SQUAD[0].color,BUG_SQUAD[3].color,BUG_SQUAD[4].color,BUG_SQUAD[5].color,BUG_SQUAD[2].color,BUG_SQUAD[7].color,BUG_SQUAD[1].color,BUG_SQUAD[6].color,BUG_SQUAD[4].color,BUG_SQUAD[5].color];
export const distToMeadow=(x:number,z:number)=>Math.hypot(x-MEADOW.x,z-MEADOW.z);
