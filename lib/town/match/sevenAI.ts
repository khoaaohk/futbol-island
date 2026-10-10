// 7v7 helpers for the live-match engine (lib/town/match/matchSim.ts; knobs in formatAI.ts, "7v7" entry).
// Old Town Ground plays the US Youth small-sided rules its lessons teach: the build-out line (learn7_buildout),
// offside only past the build-out line (next7_offsideboundary), the keeper as the spare player (bld_7_usekeeper),
// and a shape that makes room (prn_7_spread, learn7_shape). Pure functions: unit-tested in tests/ai-7v7.cjs.
import {sevenBuildOutY} from '../buildOut';

/** Depth (field units from a team's own goal line, y 400 → 0 for gold) of the OPPONENT's build-out line: past it,
 *  offside counts. The two lines are symmetric about halfway, so one number serves both teams. */
export const SEVEN_OFFSIDE_ZONE_DEPTH=400-sevenBuildOutY('blue');

/** US Youth 7v7 offside: only past the build-out line, and (Law 11) beyond both the second-last defender and the
 *  ball. `tolerance` keeps the AI's call honest (level is onside). */
export function sevenOffside(receiverDepth:number,secondLastDepth:number,ballDepth:number,tolerance=6){
 if(receiverDepth<=SEVEN_OFFSIDE_ZONE_DEPTH)return false;
 return receiverDepth>secondLastDepth+tolerance&&receiverDepth>ballDepth+tolerance;
}

/** The deepest an off-ball attacker may wait and stay onside: anywhere short of the zone, else level with the
 *  second-last defender or the ball (whichever is deeper), `hold` units short of it. */
export function sevenOnsideDepth(secondLastDepth:number,ballDepth:number,hold:number){
 return Math.max(SEVEN_OFFSIDE_ZONE_DEPTH,Math.max(secondLastDepth,ballDepth)-hold);
}

/** Wide-player target x in settled possession: the touchline lane on his side, nudged a touch toward the ball. */
export function sevenWideX(homeX:number,ballX:number,width:number){
 return 135+Math.sign(homeX-135)*width+(ballX-135)*.08;
}

/** The live feed's coaching lines for 7v7 (text, reason). Words follow conceptMap's 'simple' level. */
export const SEVEN_NOTES={
 buildOut:['Build-out line','On a goal kick, or when the keeper holds the ball, the other team waits behind the build-out line until the ball is played'],
 backPass:['Back to the keeper','The way forward was blocked, so the keeper helps keep the ball. A back pass is played with the feet: the keeper can’t pick it up'],
 onside:['Wait on the line','In 7v7 offside only counts past the build-out line, so the forward waits level with the last defender until the pass'],
 spread:['Spread out','Your team has the ball: wide players run to the sidelines to make room, and the other team squeezes together to guard the middle'],
 offside:['Offside!','He was past the build-out line and the last defender when the pass was played. In 7v7 that is the only place offside counts'],
} as const;
