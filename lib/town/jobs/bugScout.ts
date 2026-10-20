/**
 * Summit Isle bug jobs (Oct 20 2026, user: "add new jobs on the mountain island. catching butterflies and other bugs. tie the bugs
 * into the concept of futbol. for nighttime add catching fireflies instead since it's night time."). Pure data, no three.js.
 *
 * ONE job since the same day's merge (user: "don't have two separate jobs, the bug squad changes to catching the fireflies if
 * switching to night mode"): the Bug squad, whose target set follows the player's own Day / Sunset / Night setting
 * (lib/town/fishing/timeOfDay.ts, never the real clock; `activeSet`, `bugRoster`, `BUG_SETS` at the end of this file):
 *  - bugs (Day and Sunset): eight bugs, each playing a football position (a 7v7 squad plus the referee). Hold Net still (a soft
 *    first touch) until the bug drifts into your jar; each catch teaches its position. Release the squad at the bug hotel.
 *  - fireflies (Night): eight fireflies; hold Cup the jar until one drifts in; each catch teaches a football call ("Man on!",
 *    "Time!"), because fireflies talk with light signals. Then they glow over the little lantern goal, like floodlights, and fly free.
 * Bugs are only looked at and let go, never hurt.
 *
 * Positions were checked against the real island (tests/summit-bugs.cjs): on walkable Summit Isle ground, ≥ 1.6 m from every
 * collider, slopes under 0.5. Pay: lib/economy.ts JOB_PAY (5 each, like Trail clean-up), metered by the usual full / half / tip
 * tiers and the Training meter. Runtime: lib/town/jobs/jobScene.ts (one instanced draw of ≤ 8 bugs while a shift runs, nothing idle).
 */
import {BUG_SPECIES,BUG_HOMES,FIREFLY_SET,FIREFLY_HOMES,type BugStory} from './bugSpecies';
export type BugSpot={x:number;z:number;
 /** Species id (bugSpecies.ts BUG_SPECIES / FIREFLY_SET): the Bug book, the swarm and the catch all key on it. */
 id:string;
 /** Display name ("Goalie Ladybug", "“Man on!” firefly") and the squad role / call label. */
 name:string;role:string;
 /** Shown in the job panel when you reach it ("Goalie Ladybug: the squad's goalkeeper."). */
 hint:string;
 /** Shown when it is in the jar: the football lesson for this bug. */
 note:string;
 /** The species' real football stories (the catch card's "Real football fact", rotating on repeat catches). */
 stories:readonly BugStory[];
 /** Wing tint (instance colour; the body and the pentagon spots stay dark). */
 color:string;
 /** Shape: wing span, body length, wing lift (radians, how high the wings are raised). */
 span:number;length:number;lift:number};

/** One job, one sign (Oct 20 2026, user: "don't have two separate jobs, the bug squad changes to catching the fireflies if switching
 *  to night mode" and "place the bug job at the top of the mountain on the south west end"). The sign stands on the flat south-west
 *  corner of the summit terrace (north is -z, west is -x), west of the Summit 5s fence and a few metres off the trail's arrival,
 *  facing south (yaw 0) toward kids walking up. The bugs and fireflies stay out on the slopes and the meadow below (their spots are
 *  per set, `bugRoster`). */
export const BUG_BOARD={x:606,z:130,yaw:0} as const;
/** The drop-offs, behind the sign (north) on the same flat: the bug hotel (bugs set) and the lantern goal (fireflies set). */
export const BUG_HOTEL={x:604.5,z:126.5,label:'bug hotel'} as const;
export const LANTERN_GOAL={x:607.6,z:126,label:'lantern goal'} as const;

/** The day squad (catching lane, Oct 20 2026): the 20 realistic species of bugSpecies.ts at their island homes (up high on the
 *  mountain, along the trails, near the water; nothing on the north end but beaches): 11 starters in a 4-3-3, the subs and the staff.
 *  A shift catches FROM THE SWARM (lib/graphics/bugSwarm.ts); each species fills its page in the squad once per squad completion. */
export const BUG_SQUAD:readonly BugSpot[]=BUG_SPECIES.map(sp=>{const h=BUG_HOMES.find(q=>q.id===sp.id)!;
 return {x:h.x,z:h.z,id:sp.id,name:sp.name,role:sp.role.label+(sp.role.shirt?` (No. ${sp.role.shirt})`:''),
  hint:`${sp.name}: the squad's ${sp.role.label.toLowerCase()}.`,note:`${sp.name} is in the jar! ${sp.role.lesson}`,stories:sp.stories,
  color:sp.look.palette[0],span:.4+sp.look.size,length:.2+sp.look.size*.5,lift:sp.look.wings==='scaled'?.4:.15};});

/** The night's fireflies: eight calls at their homes. Each catch teaches one football call (and a real football story). */
export const FIREFLY_CALLS:readonly BugSpot[]=FIREFLY_SET.map(f=>{const h=FIREFLY_HOMES.find(q=>q.id===f.id)!;
 return {x:h.x,z:h.z,id:f.id,name:`“${f.call}” firefly`,role:'Football call',color:'#e9ff6b',span:.3,length:.22,lift:.3,stories:f.stories,
  hint:`A firefly flashing: "${f.call}"`,note:`Firefly in the jar! It flashed "${f.call}": that call means ${f.meaning}. Fireflies talk with light; footballers talk with clear, early calls.`};});

/** The Bug book's old (index-based, v1) page order, for migrating saved counts to species ids (bugBook.ts). The first lane's eight
 *  bugs map to the species that took their place (Pill-bug Centre-back → the Rhino Beetle centre-back, Football Butterfly winger →
 *  the Swallowtail winger, Striker Beetle → the Stag Beetle striker). */
export const LEGACY_BUG_IDS:readonly string[]=['ladybug','rhino-beetle','grasshopper','dragonfly','swallowtail','monarch','stag-beetle','bumblebee'];
export const LEGACY_FIREFLY_IDS:readonly string[]=['man-on','time','turn','square','switch','away','keepers','mine'];

export const BUG_JOB_LESSON='A football team is a squad where everyone has a job: the goalkeeper guards the goal, defenders protect it, full-backs run the wings, midfielders scan and link the play, wingers stretch the pitch wide and the striker finishes. In 7v7 every player still attacks and defends together, and the referee keeps the game fair.';
export const FIREFLY_JOB_LESSON='Fireflies flash light signals to find each other in the dark. Footballers signal too: call early and clearly ("Man on!", "Time!", "Turn!"), point where you want the pass, and wave when you are free. Under the floodlights, a loud, clear call helps your team find you.';

// ---- Target sets (Oct 20 2026 merge): one Bug squad job whose catch list follows the player's Time of day setting. ----
/** Which collection the Bug squad catches: bugs by Day and Sunset, fireflies at Night. Data-driven: a new set (or a bigger roster
 *  table from the content work) only needs an entry here and in `BUG_SETS`, never a hard-coded count. */
export type BugSetId='bugs'|'fireflies';
export const BUG_SET_IDS:readonly BugSetId[]=['bugs','fireflies'];
/** The set the job hunts at this time of day (the player's own setting, lib/town/fishing/timeOfDay.ts). */
export function activeSet(timeOfDay:'day'|'sunset'|'night'|string):BugSetId{return timeOfDay==='night'?'fireflies':'bugs';}
/** Per-set facts the job, its panel and its props read. `prop` picks the runtime look (instanced bug shape vs glowing firefly). */
export const BUG_SETS:Record<BugSetId,{title:string;prop:'bug'|'firefly';drop:{x:number;z:number;label:string};unit:string}>={
 bugs:{title:'Bug squad',prop:'bug',drop:BUG_HOTEL,unit:'Bugs in the squad'},
 fireflies:{title:'Night squad: fireflies',prop:'firefly',drop:LANTERN_GOAL,unit:'Fireflies in the jar'},
};
/** The species in a set, in catching order (any length: the job, the panel, the Bug book and the props size themselves from it). */
export function bugRoster(set:BugSetId):readonly BugSpot[]{return set==='fireflies'?FIREFLY_CALLS:BUG_SQUAD;}
/** Old job ids kept so saves, ledgers and analytics resolve to the merged job (firefly-floodlights was its own job until Oct 20 2026). */
export const BUG_JOB_ALIASES:Readonly<Record<string,'bug-scout'>>={'firefly-floodlights':'bug-scout'};
