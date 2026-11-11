/**
 * Futbol Tennis endless play (Nov 10 2026, owner: "the user can play as long as they want to increase their score" and "all these
 * games should also increase in difficulty the further they play"). Pure numbers, no imports: tests read these tables directly.
 *
 * A run is a chain of MATCHES. On a court a match is the court's own game (first to its score, the Target Drill's 15 balls, the
 * Legend Cup's best of 3 sets). Winning it no longer ends the run: the starburst plays (skippable), a win bonus banks, one ball
 * comes back, and the next opponent walks on at the NEXT STOP of the nine-stop order (court 9 loops to court 1), score carried on.
 * Losing a match costs one ball and the same court is played again. On a tour (Pro, Legend) a match is TENNIS_RUN.tourMatch won
 * points; a lost point costs a ball there, as it always did. The run ends only when the balls run out.
 *
 * TENNIS_RAMP is the difficulty per match (1-based, the match number of the run; past the table see tennisRampRow).
 * Match 1 is every court and tour exactly as it was before endless play: every multiplier 1, every extra 0.
 *  - rank      the opponent's title on the score panel ("Match 4 · Harbour Net Rusher"); '' = the court's own rival name
 *  - speed     multiplier on the rival's foot speed
 *  - reach     metres added to the rival's contact reach (1.3 m at match 1)
 *  - reaction  multiplier on the rival's reaction time (smaller = quicker)
 *  - aim       multiplier on how wide the rival places its shots
 *  - sharp     added to the rival's contact-quality cap (never over TENNIS_SHARP_MAX)
 *  - variety   chance that the rival swaps its habitual shot for another one (lob, drop, power drive)
 *  - error     multiplier on the rival's read error (smaller = fewer mistakes)
 *  - wind      m/s² added to the court's peak wind
 *  - gust      added to the share of the peak a point's wind can reach (0.6 to 1 of the peak at match 1, to 1 + gust later)
 *  - sweet     multiplier on the perfect-touch window after the bounce (never under TENNIS_SWEET_FLOOR seconds)
 *  - points    multiplier on touch and point scores (the harder the match, the more a touch is worth)
 *  - bonus     points banked for winning this match (× the run's score scale)
 *  - start     points the rival starts a court match (and each set) with: 0 through the whole table, so only a run past match
 *              TENNIS_RAMP_TOP meets it (never more than the court's winning score - 1; tours have no match score and ignore it)
 */
export type TennisRampRow={match:number;rank:string;speed:number;reach:number;reaction:number;aim:number;sharp:number;variety:number;error:number;wind:number;gust:number;sweet:number;points:number;bonus:number;start:number};
export const TENNIS_RAMP:readonly TennisRampRow[]=[
 {match:1, rank:'',           speed:1,    reach:0,  reaction:1,  aim:1,   sharp:0,   variety:0,  error:1,  wind:0,  gust:0,  sweet:1,  points:1,  bonus:300,start:0},
 {match:2, rank:'Club',       speed:1.015,reach:.02,reaction:.97,aim:1.01,sharp:.005,variety:.04,error:.95,wind:0,  gust:0,  sweet:.98,points:1.1,bonus:400,start:0},
 {match:3, rank:'Coastal',    speed:1.03, reach:.04,reaction:.94,aim:1.02,sharp:.01, variety:.08,error:.9, wind:0,  gust:.03,sweet:.96,points:1.2,bonus:500,start:0},
 {match:4, rank:'Harbour',    speed:1.045,reach:.06,reaction:.91,aim:1.02,sharp:.015,variety:.12,error:.85,wind:.05, gust:.06,sweet:.94,points:1.3,bonus:600,start:0},
 {match:5, rank:'Island',     speed:1.06, reach:.08,reaction:.88,aim:1.03,sharp:.02, variety:.16,error:.8, wind:.1, gust:.09,sweet:.92,points:1.4,bonus:700,start:0},
 {match:6, rank:'Regional',   speed:1.07, reach:.1, reaction:.85,aim:1.03, sharp:.025,variety:.2, error:.75,wind:.15, gust:.12,sweet:.9, points:1.5,bonus:800,start:0},
 {match:7, rank:'National',   speed:1.08, reach:.12,reaction:.82,aim:1.04,sharp:.03, variety:.23,error:.7, wind:.2, gust:.14, sweet:.88,points:1.6,bonus:900,start:0},
 {match:8, rank:'Continental',speed:1.09, reach:.14,reaction:.79,aim:1.04,sharp:.035,variety:.26,error:.65,wind:.25, gust:.16,sweet:.86,points:1.7,bonus:1000,start:0},
 {match:9, rank:'World',      speed:1.1,  reach:.16,reaction:.76,aim:1.05,sharp:.04, variety:.29,error:.6, wind:.3, gust:.18,sweet:.84,points:1.85,bonus:1100,start:0},
 {match:10,rank:'Immortal',   speed:1.11, reach:.18,reaction:.73,aim:1.06,sharp:.045,variety:.32,error:.55,wind:.35, gust:.2, sweet:.82,points:2,  bonus:1200,start:0},
];
export const TENNIS_RAMP_TOP=TENNIS_RAMP.length;
/** Past the table the opponent keeps improving, a small step a match, until TENNIS_RAMP_END: the rival's feet, reach, reactions and
 * mistakes (wind, variety, the perfect window and the points stay at the last row, so the score rate the boards guard never moves),
 * and on a court it starts each match a point further ahead every TENNIS_RAMP_STEP.startEvery matches (the score panel shows it).
 * That head start is what finally ends a run that never misses: a seeded bot that places every ball still wins about 8 points in
 * 10 against the fastest rival, so feet alone would let it play for ever. From TENNIS_RAMP_END on every match plays the last row. */
export const TENNIS_RAMP_END=30;
export const TENNIS_RAMP_STEP={speed:.012,reach:.012,reaction:-.016,error:-.015,sharp:.001,startEvery:3,startMax:6} as const;
const beyond:TennisRampRow[]=[];
/** The row a match plays (1-based; not a number or under 1 = match 1; past TENNIS_RAMP_END = the last row). Cached, no allocation in play. */
export function tennisRampRow(match:number):TennisRampRow{const m=Math.max(1,Math.min(TENNIS_RAMP_END,Math.floor(match)||1));if(m<=TENNIS_RAMP_TOP)return TENNIS_RAMP[m-1];
 const k=m-TENNIS_RAMP_TOP,top=TENNIS_RAMP[TENNIS_RAMP_TOP-1],r=(n:number)=>Math.round(n*1000)/1000;
 return beyond[k]??={...top,match:m,speed:r(top.speed+TENNIS_RAMP_STEP.speed*k),reach:r(top.reach+TENNIS_RAMP_STEP.reach*k),reaction:r(top.reaction+TENNIS_RAMP_STEP.reaction*k),error:r(top.error+TENNIS_RAMP_STEP.error*k),sharp:r(top.sharp+TENNIS_RAMP_STEP.sharp*k),bonus:top.bonus+100*k,start:Math.min(TENNIS_RAMP_STEP.startMax,Math.ceil(k/TENNIS_RAMP_STEP.startEvery))};}
export const TENNIS_SHARP_MAX=.97;
export const TENNIS_SWEET_FLOOR=.16;
/** Run rules. `lives`: balls a court run starts with and can hold (a tour keeps its own count, TENNIS_TOUR_RULES); `tourMatch`: won
 * points that make one tour match; `stops`: the nine-stop order; `tourStops`: the stop each tour's own panel stands at (Pro = centre
 * court, Legend = the lantern final), so the world moves on from there; `pointBeat`: seconds between a point and the next serve
 * (unchanged); `seamBeat`: the match-won / match-lost beat when nobody presses; `seamSkip`: from this second on a press ends it. */
export const TENNIS_RUN={lives:3,tourMatch:5,stops:9,tourStops:[4,6],pointBeat:1.55,seamBeat:1.55,seamSkip:.45} as const;
/** The stop after this one in the nine-stop order (9 loops to 1). */
export const tennisNextStop=(stop:number)=>(Math.max(1,Math.floor(stop)||1)%TENNIS_RUN.stops)+1;
/** The stop a run stands at after `won` matches from `start`, and which lap of the nine stops that is (1-based). */
export const tennisRunStop=(start:number,won:number)=>((Math.max(1,Math.floor(start)||1)-1+Math.max(0,Math.floor(won)||0))%TENNIS_RUN.stops)+1;
export const tennisRunLap=(start:number,won:number)=>1+Math.floor((Math.max(1,Math.floor(start)||1)-1+Math.max(0,Math.floor(won)||0))/TENNIS_RUN.stops);
/** Court runs score like the tours (touch × combo), scaled by the court's tier so an easy court pays less than a hard one. */
export const tennisLadderScale=(tier:number)=>Math.round((.5+.1*Math.max(1,Math.min(6,tier)))*10)/10;
const titleCase=(s:string)=>s.toLowerCase().replace(/(^|[\s-])\S/g,m=>m.toUpperCase());
/** The opponent's name for a match: the court's own rival at match 1, with the ramp row's title in front from match 2. */
export const tennisOpponent=(rival:string,match:number)=>{const rank=tennisRampRow(match).rank,name=titleCase(rival);return rank?`${rank} ${name}`:name;};
export const tennisMatchLabel=(match:number,rival:string)=>`Match ${Math.max(1,Math.floor(match)||1)} · ${tennisOpponent(rival,match)}`;
/** One shot tip per match (rotates): shown when the next opponent walks on and on the results card. Each names a football habit. */
export const TENNIS_MATCH_TIPS=[
 'Let it bounce, plant your feet, then kick.',
 'Aim into the open space, away from the rival.',
 'A deep rival? Drop it short. A rival at the net? Lob it.',
 'Hold a shot button and let go on gold for a sweet strike.',
 'Trap a hard ball soft, then strike your second touch.',
 'Wind bends the ball: aim into the wind.',
 'Watch the landing ring, not the ball.',
 'A ball flying out is a free point: let it go.',
 'Recover to the middle after every touch.',
] as const;
export const tennisMatchTip=(match:number)=>TENNIS_MATCH_TIPS[(Math.max(1,Math.floor(match)||1)-1)%TENNIS_MATCH_TIPS.length];
