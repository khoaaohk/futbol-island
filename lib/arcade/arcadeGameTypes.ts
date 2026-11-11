export type ArcadeKind='tennis'|'pinball'|'runner';
export type ArcadeInput={x:number;y:number;left:boolean;right:boolean;charge:boolean};
/** Nov 8 2026 pinball polish: pinballStreak = the PERFECT ×N badge, pinballBalls = balls in hand, pinballMult = the elite tier's points ×, pinballEnd = the plain 'why it ended' line. */
export type ArcadeHUD={pinballStreak?:string;/** Nov 10 2026: the football pattern just played (lib/games/soccerPinballPatterns.ts), one reused chip. */pinballPattern?:string;pinballPatternWhy?:string;pinballPatternOn?:boolean;pinballBalls?:number;/** Nov 8 2026: the match clock chip (moved off the floor) and its late-game red. */pinballClock?:string;pinballLate?:boolean;pinballMult?:number;pinballEnd?:string;score:string;detail:string;message:string;over:boolean;ready:boolean;headerReady?:boolean;scissorReady?:boolean;tennisAerial?:boolean;tennisTrap?:boolean;trapReady?:boolean;bicycleReady?:boolean;tennisCall?:string;tennisButton?:string;leftReady?:boolean;rightReady?:boolean;nudgeReady?:boolean;nudgeOff?:boolean;nextLabel?:string;skillLabel?:string;skillReady?:boolean;coach?:string;flash?:string;flashId?:number;
 /** Breakaway Run margin strip (Nov 10 2026, pass 2; lib/arcade/runnerHud.ts): hearts held / route maximum, balls in hand, clean-play multiplier, metres run or to go, near misses so far. */
 runnerLives?:number;runnerMaxLives?:number;runnerBalls?:number;runnerMult?:number;runnerMeters?:number;runnerToGo?:boolean;runnerNear?:number;/** Endless play: the round being played (1-based). */runnerStage?:number;
 /** Futbol Tennis round 3 HUD chips: live rally count, wind arrows ('' calm), sets line ('' on one-game courts). */
 tennisRally?:number;tennisWind?:string;tennisSets?:string;
 /** Nov 8 2026: the last touch's multiplier (×1–×4, 0 before a touch) and, on a tour, balls left / start, combo, the last gain
  * (+ an id that changes per gain for the HUD pop) and the ramp level (1-based). */
 tennisMult?:number;tennisTourLives?:number;tennisTourMax?:number;tennisCombo?:number;tennisGain?:number;tennisGainId?:number;tennisTourLevel?:number};
