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
export type BugSpot={x:number;z:number;
 /** Shown in the job panel when you reach it ("Goalie Ladybug: the squad's goalkeeper."). */
 hint:string;
 /** Shown when it is in the jar: the football lesson for this bug. */
 note:string;
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

/** The day squad, in the order kids meet them on the walk round the meadow. */
export const BUG_SQUAD:readonly BugSpot[]=[
 {x:591,z:36,color:'#e2453c',span:.62,length:.36,lift:.15,hint:'Goalie Ladybug: the squad\'s goalkeeper (GK).',
  note:'Goalie Ladybug is in the jar! The goalkeeper is the only player allowed to handle the ball, and only inside their own penalty area.'},
 {x:576,z:40,color:'#8a95a3',span:.5,length:.42,lift:.05,hint:'Pill-bug Centre-back: a defender.',
  note:'Pill-bug Centre-back is in the jar! A pill bug curls into a ball to stay safe. Centre-backs stay compact too: keep goal-side of the striker and stay on your feet.'},
 {x:585,z:43,color:'#7cc043',span:.6,length:.6,lift:.25,hint:'Full-back Grasshopper: a defender who runs the wing.',
  note:'Full-back Grasshopper is in the jar! Full-backs spring up and down the wing: defend first, then overlap to help the attack.'},
 {x:603,z:45,color:'#3fa7c9',span:.9,length:.7,lift:.05,hint:'Midfield Dragonfly: a midfielder.',
  note:'Midfield Dragonfly is in the jar! Dragonflies see nearly all the way round. Midfielders scan too: check over your shoulder before the ball arrives.'},
 {x:618,z:45,color:'#f4f1e8',span:.85,length:.34,lift:.45,hint:'Football Butterfly, black and white like a classic ball: the winger.',
  note:'Football Butterfly is in the jar! Its wings have dark pentagons like a classic football. Wingers stay wide by the touchline to stretch the defence and make space.'},
 {x:630,z:46,color:'#f08a24',span:.85,length:.34,lift:.4,hint:'Captain Monarch: the squad\'s captain.',
  note:'Captain Monarch is in the jar! Monarch butterflies travel thousands of kilometres together. A captain leads by example, encourages teammates and speaks calmly to the referee.'},
 {x:642,z:48,color:'#2fae6a',span:.52,length:.44,lift:.1,hint:'Striker Beetle: the squad\'s striker.',
  note:'Striker Beetle is in the jar! Strikers stay alert in the box, ready to finish the chance with a calm first-time shot.'},
 {x:654,z:48,color:'#f2c230',span:.56,length:.4,lift:.3,hint:'Referee Bumblebee: the match official.',
  note:'Referee Bumblebee is in the jar! Every match needs a fair referee (Law 5), and the referee\'s decisions are final. Bright stripes help everyone spot the official, like a referee\'s own kit.'},
];

/** The night's fireflies: meadow, beach grass and the lower foothills. Each catch teaches one football call. */
export const FIREFLY_CALLS:readonly BugSpot[]=[
 ['Man on!','a defender is right behind you, so protect the ball or pass it quickly'],
 ['Time!','nobody is close, so you can take a touch and look up'],
 ['Turn!','you have space to turn and face the goal'],
 ['Square!','a teammate is level with you, ready for a sideways pass'],
 ['Switch!','play the ball across to the far side, where there is space'],
 ['Away!','clear the ball far from your own goal'],
 ['Keeper\'s!','the goalkeeper is coming to collect it, so get out of the way'],
 ['Mine!','you are taking it, so teammates do not collide'],
].map(([call,meaning],i)=>({...([{x:579,z:45},{x:588,z:40},{x:597,z:46},{x:612,z:34},{x:630,z:35},{x:639,z:35},{x:651,z:30},{x:663,z:33}][i]),
 color:'#e9ff6b',span:.3,length:.22,lift:.3,hint:`A firefly flashing: "${call}"`,
 note:`Firefly in the jar! It flashed "${call}": that call means ${meaning}. Fireflies talk with light; footballers talk with clear, early calls.`}));

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
