/**
 * Futbol Pinball endless play (Nov 10 2026, owner: "the user can play as long as they want to increase their score" and "all these
 * games should also increase in difficulty the further they play"). Pure numbers, no imports: tests read these tables directly.
 *
 * A run is a season of matches. Each match is still 90' (three minutes of live play, lib/games/soccerPinball.ts). The full-time
 * whistle no longer ends the run: it pays the result bonus, raises the LEVEL by one and the next match kicks off with the same
 * ball, score and balls in hand. The run ends only when the last ball is lost.
 *
 * PINBALL_RAMP is the difficulty per level (the match number, 1-based; levels past the table play the last row). Level 1 is the
 * game as it was before endless play: every multiplier 1, every bonus 0, so a young child's first match is unchanged.
 *  - speed   whole-table sim speed (the ball, the keeper and the clock all run this much faster; multiplies an elite tier's speed)
 *  - keeper  keeper pace multiplier
 *  - reach   extra px of keeper patrol toward each post (the corner pocket he can never cover is ~18 px wide at level 1)
 *  - defs    defenders on the pitch from the first ball of the match (goals still call more, up to the back three)
 *  - press   added to the division's "sharpness" for the defenders: quicker reads, blocks and counters (division + press, capped)
 *  - save    multiplier on the new-ball save window (never under PINBALL_SAVE_FLOOR seconds while the division gives one)
 *  - window  multiplier on timed targets: the lit goal after the wall falls and the hot zone
 *  - bat     px taken off each flipper (the centre gap widens, as in the hard divisions: 63 px classic, never under PINBALL_BAT_MIN)
 *  - saver   whether Build Up still raises the free goal-line saver on every ball (the earned G-O-A-L saver and the quiet
 *            two-quick-drains assist stay at every level)
 */
export type PinballRampRow={level:number;speed:number;keeper:number;reach:number;defs:number;press:number;save:number;window:number;bat:number;saver:boolean};
export const PINBALL_RAMP:readonly PinballRampRow[]=[
 {level:1, speed:1,   keeper:1,   reach:0, defs:1,press:0,  save:1,  window:1,  bat:0, saver:true},
 {level:2, speed:1.03,keeper:1.06,reach:1, defs:2,press:.5, save:.9, window:.95,bat:0, saver:true},
 {level:3, speed:1.06,keeper:1.12,reach:2, defs:3,press:1,  save:.8, window:.9, bat:1, saver:false},
 {level:4, speed:1.09,keeper:1.18,reach:3, defs:3,press:1.5,save:.7, window:.85,bat:2, saver:false},
 {level:5, speed:1.12,keeper:1.24,reach:4, defs:3,press:2,  save:.62,window:.8, bat:3, saver:false},
 {level:6, speed:1.14,keeper:1.3, reach:5, defs:3,press:2.5,save:.55,window:.75,bat:4, saver:false},
 {level:7, speed:1.16,keeper:1.35,reach:6, defs:3,press:3,  save:.5, window:.7, bat:5, saver:false},
 {level:8, speed:1.18,keeper:1.4, reach:7, defs:3,press:3.5,save:.45,window:.66,bat:6, saver:false},
 {level:9, speed:1.2, keeper:1.44,reach:8, defs:3,press:4,  save:.42,window:.63,bat:7, saver:false},
 {level:10,speed:1.22,keeper:1.48,reach:9, defs:3,press:4.5,save:.4, window:.6, bat:8, saver:false},
 {level:11,speed:1.24,keeper:1.52,reach:10,defs:3,press:5,  save:.38,window:.57,bat:9, saver:false},
 {level:12,speed:1.26,keeper:1.56,reach:11,defs:3,press:5.5,save:.36,window:.55,bat:10,saver:false},
];
export const PINBALL_RAMP_TOP=PINBALL_RAMP.length;
/** The ramp row for a level (match number). Anything below 1 or not a number plays level 1; past the table plays the last row. */
export const pinballRamp=(level:number):PinballRampRow=>PINBALL_RAMP[Math.max(0,Math.min(PINBALL_RAMP_TOP-1,Math.floor(Number.isFinite(level)?level:1)-1))];
export const PINBALL_SAVE_FLOOR=1,PINBALL_PRESS_CAP=8,PINBALL_BAT_MIN=48;
/** New-ball save seconds at a level: the division's own window, tightened by the ramp. */
export const pinballRampSave=(base:number,level:number)=>base<=PINBALL_SAVE_FLOOR?base:Math.max(PINBALL_SAVE_FLOOR,Math.round(base*pinballRamp(level).save*10)/10);
/** Mode targets recur every match and rise: a counted mode (One-Two 3 passes, Counter Attack 3 blocks) needs one more every
 * second level, two more at most. A single-step mode (Free Kick: the whole wall) stays single. */
export const pinballModeNeed=(base:number,level:number)=>base<=1?base:base+Math.min(2,Math.floor((Math.max(1,level)-1)/2));

/** Full-time result bonus: every ball still in hand and every goal scored in that match (first ten). */
export const PINBALL_FULLTIME_GOAL=100,PINBALL_FULLTIME_GOALS_MAX=10;
/**
 * Extra balls, so a skilled player can go long (capped: never more than PINBALL_MAX_BALLS in hand, a milestone reached with a
 * full hand is not banked for later):
 *  - a level milestone: one ball at the whistle that starts level 3, 5, 7, ... (every PINBALL_EXTRA_BALL_LEVELS levels);
 *  - a score milestone: one ball at each PINBALL_EXTRA_BALL_SCORES mark (× the elite tier's points multiplier), then one
 *    every PINBALL_EXTRA_BALL_EVERY points past the last mark.
 */
export const PINBALL_MAX_BALLS=5,PINBALL_EXTRA_BALL_LEVELS=2;
export const PINBALL_EXTRA_BALL_SCORES:readonly number[]=[75_000,200_000,400_000,700_000,1_000_000],PINBALL_EXTRA_BALL_EVERY=500_000;
/** The n-th (0-based) score milestone, before the tier multiplier. */
export const pinballExtraBallScore=(n:number)=>n<PINBALL_EXTRA_BALL_SCORES.length?PINBALL_EXTRA_BALL_SCORES[n]:PINBALL_EXTRA_BALL_SCORES[PINBALL_EXTRA_BALL_SCORES.length-1]+(n-PINBALL_EXTRA_BALL_SCORES.length+1)*PINBALL_EXTRA_BALL_EVERY;
export const pinballLevelGivesBall=(level:number)=>level>=3&&(level-1)%PINBALL_EXTRA_BALL_LEVELS===0;
/** The level label on the status tab and the results line. */
export const pinballLevelLabel=(level:number)=>`LV ${Math.max(1,Math.floor(level))}`;
