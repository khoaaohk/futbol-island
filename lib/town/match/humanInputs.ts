// Human players in a live MatchSim (join a live game, slice 1, Nov 4 2026). The sim keeps one HumanInput per human-
// controlled SLOT (keyed by the slot's player id), so N humans can share a match: solo play uses one entry, the
// multiplayer slice feeds the others from the network. Pure data + helpers, no three.js, safe in tests.

export type HumanTeam='gold'|'blue';
/** One frame of controls, as a client sends it (screen stick already turned into sim space by the caller). */
export type HumanFrame={mx:number;my:number;pass?:boolean;/** Hold-to-charge pass, 0 = tap (normal pace) … 1 = full hold (PASS_POWER_MAX × pace). */passPower?:number;shoot?:boolean;shootPower?:number;through?:boolean;tackle?:boolean;jockey?:boolean;sprint?:boolean;call?:boolean;/** Keeper: dive / save (A). */save?:boolean;/** Pass held past LONG_BALL_MS: a lofted long ball, 0 = the ground pass … 1 = the longest (owner Nov 4 2026). */long?:number;/** Trick button (on the ball): a dribbling trick. */trick?:boolean;/** Press button (the other side has it): two NPC teammates press the carrier together. */press?:boolean;/** Shoot aimed at one of AIM_MARKS (owner Nov 4 2026): its x (-1..1 of the goal half, sim x) and height (0 low … 1 high); NaN / absent = the auto-aim. */aimX?:number;aimH?:number};
export type HumanInput={
  id:string;team:HumanTeam;
  moveX:number;moveY:number;mag:number;faceX:number;faceY:number;
  sprint:boolean;jockey:boolean;
  /** One-shot actions stay armed for `INPUT_BUFFER` seconds so a press just before the ball arrives still fires. */
  pass:number;shoot:number;through:number;tackle:number;
  /** Keeper only (human keepers, Nov 4 2026): a dive / save press, buffered like the others so a press just before the strike still fires. */
  save:number;
  shootPower:number;passPower:number;
  /** Sprint button eased 0..1 (SPRINT_EASE_IN / OUT): the sim's sprint boost and the rig's sprint posture read it. */
  sprintE:number;
  /** "Call for the ball": seconds the call stays heard by the carrier. */
  call:number;
  /** Long ball (hold Pass): 0 = a ground pass, (0..1] = the lofted long ball's charge, armed with `pass`. */
  passLong:number;
  /** Tackle recovery (real seconds): after a missed lunge the next tackle waits TACKLE_RECOVER. */
  tackleRec:number;
  /** Dribbling trick (Trick button, owner Nov 4 2026): request buffer (sim s), protected window and cooldown (real s),
   *  the move played and a serial the view watches to start the rig's authored move. */
  trickReq:number;trick:number;trickCd:number;/** Burst after a trick (real s): he glides through the gap at TRICK.burstPace. */trickBoost:number;trickKind:TrickKind;trickSide:-1|1;trickSerial:number;
  /** Press together (Press button): request buffer (sim s), seconds left and cooldown (real s), the two NPC pressers. */
  pressReq:number;pressT:number;pressCd:number;pressA:string|null;pressB:string|null;pressSerial:number;
  /** Aimed shot (Shoot held, a corner picked): AIM_MARKS x / height, NaN = auto-aim. Armed with `shoot`. */
  aimX:number;aimH:number;
  /** Bumps on every human shot (the view's slow motion, power-shot flame + sound); its power and whether it was aimed. */
  shotSerial:number;shotPw:number;shotAimed:boolean;
  /** Hard to be tackled (owner Nov 4 2026): protection after receiving (real s), whether he had the ball last step,
   *  and the "slipped away!" near-miss serial + its cooldown (real s). */
  guard:number;hadBall:boolean;slipSerial:number;slipCd:number;
  /** Tackle assist (owner Nov 5 2026): seconds left of the assisted lunge at the carrier (real s), and the "get it back"
   *  window after an AI tackle took the ball off him (real s), when his next tackle is almost sure to win it. */
  lunge:number;backT:number;
};
/** The dribbling tricks the Trick button plays (lib/graphics/skillMoves.ts poses): stick back = drag-back, else the tap cycles. */
export const TRICK_KINDS=['stepover','croqueta','dragBack'] as const;
export type TrickKind=typeof TRICK_KINDS[number];
/** Trick: the protected window (no steal, nearby opponents bamboozled), its cooldown, how far "nearby" reaches (sim
 *  units) and how slow a bamboozled opponent runs (× his pace), all real seconds. The view plays the move in TRICK_ANIM. */
export const TRICK={window:.6,cooldown:1.2,radius:16,slow:.35,anim:.68,/** Burst after the move: real seconds (from the tap) and pace ×. */boost:1.4,burstPace:1.15} as const;
/** Snappier controls for kids (owner Nov 4 2026; humans only, AI-only matches unchanged). Before → after: stick
 *  convergence P.accel 12 → 18 /s, dribble attach time constant .05 → .035 s, first-touch settle .11 → .075 s, loose
 *  first touch × .45 → × .2 of the AI's chance, the rig's turn rate × 1.35 below sprint pace (fieldRuntime). */
export const HUMAN_FEEL={accel:18,dribbleTau:.035,trapTau:.075,looseMul:.2,turnMul:1.35} as const;
/** Press together: how long the two NPC pressers hunt the carrier and the button's cooldown (real seconds, from the tap),
 *  their extra pace and the tackle-chance boost when both are on him (double team). */
export const PRESS={seconds:4,cooldown:8,pace:1.14,both:2.6,one:1.5,bothDist:10} as const;
/** Easier human tackling (owner Nov 4 2026, kid-friendly): reach × TACKLE.reachMul, success when facing the carrier
 *  roughly (auto-aimed), a little less when turned away, and a short recovery after a miss (real seconds). */
export const TACKLE={reachMul:1.4,chance:.85,chanceAway:.7,recover:.35} as const;
/** Tackle assist (owner Nov 5 2026: "make it easier to tackle and get the ball back"; humans only). Tackle pressed with the
 *  carrier within `assistR` units but outside the reach: an assisted lunge at him (up to `lunge` real s, × `lungePace`;
 *  it ends once he is 1.3 × assistR away: a carrier who outruns it has beaten him) and the
 *  press stays armed until he is in reach. In reach from the FRONT or SIDE (carrier heading · carrier→tackler ≥ `behindCos`):
 *  a clean win at `front`, otherwise a poke-away (`pokeSpeed` units/s, loose, the carrier barred) instead of a miss; from
 *  behind `chanceAway` and a miss costs `recover` real s (was .35). After an AI tackle on him, `back` real s when his next
 *  tackle wins at `backChance` (the carrier's protection ignored). Loose balls: `pickup` extra units of claim reach and a
 *  pull toward a loose ball within `magnetR` when the stick points at it (cos ≥ `magnetCos`) or he is idle within `idleR`. */
export const TACKLE_ASSIST={assistR:24,lunge:1.2,lungePace:1.3,front:.95,chanceAway:.75,behindCos:-.45,recover:.15,pokeSpeed:48,back:2.5,backChance:.97,pickup:3.5,magnetR:20,magnetCos:.55,idleR:9} as const;
/** Long ball (hold Pass): a hold past LONG_BALL.ms (real ms) lofts it; the charge reaches 1 at the strike's full charge.
 *  Distance wanted (sim units) and the peak height (m) grow with the charge. */
export const LONG_BALL={ms:250,fullMs:700,near:70,far:170,peak0:1.8,peak1:3.6} as const;
/** Shooting for kids (owner Nov 4 2026). The five aim marks on the goal mouth: x = side across the goal in sim x (-1..1 of
 *  the goal's half-width), h = height (0 low, 1 high). Index order: top-left, top-right, low-left, low-right, centre
 *  ("left" = smaller sim x; the runtime picks by where each mark is on SCREEN, so the names never matter to the kid). */
export const AIM_MARKS=[{x:-1,h:1},{x:1,h:1},{x:-1,h:0},{x:1,h:0},{x:0,h:.5}] as const;
/** Aimed shot: the mark is reached at `inLow` (tap) … `inFull` (full charge) of the goal half-width, always inside the
 *  posts (the assist's post inset is .82), so a picked corner never goes wide: that is the accuracy forgiveness. Heights
 *  are shotPlacement's shotHeight (1 = just under the bar). `minHoldMs`: a shorter press is the 1-tap auto-aimed shot
 *  (little kids), and the marks only show after it. `dead` = stick / drag length below which the auto-aim stays. */
export const SHOT_AIM={inLow:.6,inFull:.8,high:.92,low:.16,mid:.5,minHoldMs:180,dead:.35,centre:.38,highAt:.3,dragPx:14,goalHalf:19} as const;
/** Power shot: a charge at or above `full` is the power shot (flame trail, louder kick, a little more pace). */
export const POWER_SHOT={full:.95,pace:1.08} as const;
/** Shot slow motion (human shots only, local, off with reduced motion): a power or aimed shot from the shooting zone runs
 *  the match at `scale` for `hold` real seconds, then eases back over `ease`; the camera eases `in` s to a low view
 *  behind the shot. A tap skips it. `minCharge`: an un-aimed shot needs at least this charge. */
export const SHOT_FX={scale:.3,hold:1.2,ease:.3,in:.35,minCharge:.5,back:7.5,up:2.1,side:1.4} as const;
/** Hard to be tackled (owner Nov 4 2026; human carriers only): an AI tackle on a human succeeds `tackleMul` as often, a
 *  roll that WOULD have won it under the old rate is a near miss ("Slipped away!", at most every `slipCd` real s), and
 *  nobody can tackle him for `receive` real s after he gets the ball. */
export const HUMAN_GUARD={tackleMul:1/3,receive:.8,slipCd:1.4} as const;
/** Kid-friendly passing (owner Nov 4 2026): a human pass to the highlighted target is cut out `interceptMul` as often;
 *  a stick that points at nobody falls back to a wide cone (`looseCone`, ~105°) before the no-stick pick; the two nearest
 *  NPC teammates of a human carrier step out of blocked lanes (`laneClear` units) and come to `near`..`far` units of him. */
export const PASS_HELP={interceptMul:.5,looseCone:-.25,laneClear:9,near:24,far:52,step:14,supporters:2} as const;
/** Pick an aim mark from a SCREEN direction (sx, sy: y up, any length), the goal's screen lateral axis (lx, ly: toward
 *  the mark x = +1) and its screen up axis (vx, vy). -1 = keep the auto-aim (no push). Pure. */
export function pickAimMark(sx:number,sy:number,lx:number,ly:number,vx:number,vy:number){
  const m=Math.hypot(sx,sy);if(m<SHOT_AIM.dead)return -1;
  const ll=Math.hypot(lx,ly)||1,vl=Math.hypot(vx,vy)||1,a=(sx*lx+sy*ly)/(m*ll),b=(sx*vx+sy*vy)/(m*vl);
  if(Math.abs(a)<SHOT_AIM.centre)return 4;
  return (b>SHOT_AIM.highAt?0:2)+(a>0?1:0);
}
/** Shot power curve (0..1 hold → launch pace multiple of P.shotSpeed and the power-shot flag). Pure. */
export function shotPace(pw:number){const p=Math.max(0,Math.min(1,pw));return (1.9+.8*p)*(p>=POWER_SHOT.full?POWER_SHOT.pace:1);}
export const INPUT_BUFFER=.16;
export const CALL_HEARD=1.4;
/** Pass charge: a full hold plays the pass up to this × the assisted pace (a tap keeps today's pace). */
export const PASS_POWER_MAX=1.5;
/** Sprint (owner, Nov 4 2026): a held button, never the stick's magnitude. Top speed × SPRINT_BOOST, eased in over
 *  SPRINT_EASE_IN s and back out over SPRINT_EASE_OUT s so the pace never snaps (no flicker, no jitter in the rig). */
export const SPRINT_BOOST=1.42,SPRINT_EASE_IN=.35,SPRINT_EASE_OUT=.3;
/** Advance the sprint ease one step; returns the smoothstepped amount 0..1 (no allocation). */
export function stepSprint(h:HumanInput,dt:number,on:boolean){
  h.sprintE=on?Math.min(1,h.sprintE+dt/SPRINT_EASE_IN):Math.max(0,h.sprintE-dt/SPRINT_EASE_OUT);
  const e=h.sprintE;return e*e*(3-2*e);
}

export function createHumanInput(id:string,team:HumanTeam):HumanInput{
  return {id,team,moveX:0,moveY:0,mag:0,faceX:0,faceY:team==='gold'?-1:1,sprint:false,jockey:false,pass:0,shoot:0,through:0,tackle:0,save:0,shootPower:1,passPower:0,sprintE:0,call:0,passLong:0,tackleRec:0,trickReq:0,trick:0,trickCd:0,trickBoost:0,trickKind:'stepover',trickSide:1,trickSerial:0,pressReq:0,pressT:0,pressCd:0,pressA:null,pressB:null,pressSerial:0,aimX:NaN,aimH:NaN,shotSerial:0,shotPw:0,shotAimed:false,guard:0,hadBall:false,slipSerial:0,slipCd:0,lunge:0,backT:0};
}
/** Write one frame of controls (no allocation). */
export function writeHumanInput(h:HumanInput,f:HumanFrame){
  h.moveX=f.mx;h.moveY=f.my;h.mag=Math.min(1,Math.hypot(f.mx,f.my));
  if(h.mag>.05){h.faceX=f.mx;h.faceY=f.my;}
  h.sprint=!!f.sprint;h.jockey=!!f.jockey;
  if(f.pass){h.pass=INPUT_BUFFER;h.passPower=f.passPower??0;h.passLong=f.long??0;}
  if(f.shoot){h.shoot=INPUT_BUFFER;h.shootPower=f.shootPower??1;h.aimX=f.aimX??NaN;h.aimH=f.aimH??NaN;}
  if(f.through){h.through=INPUT_BUFFER;h.passPower=f.passPower??0;}
  if(f.tackle)h.tackle=INPUT_BUFFER;
  if(f.save)h.save=INPUT_BUFFER;
  if(f.call)h.call=CALL_HEARD;
  if(f.trick)h.trickReq=INPUT_BUFFER;
  if(f.press)h.pressReq=INPUT_BUFFER;
}
/** Age the buffers; while the human is on the ball nothing expires (he acts on his next decision). */
export function tickHumanInput(h:HumanInput,dt:number,onBall:boolean){
  h.call=Math.max(0,h.call-dt);
  if(onBall)return;
  h.pass=Math.max(0,h.pass-dt);h.shoot=Math.max(0,h.shoot-dt);h.through=Math.max(0,h.through-dt);h.tackle=Math.max(0,h.tackle-dt);h.save=Math.max(0,h.save-dt);h.trickReq=Math.max(0,h.trickReq-dt);h.pressReq=Math.max(0,h.pressReq-dt);
}
/** Age the real-time timers (trick window + cooldown, press cooldown, tackle recovery); `rdt` is real seconds. */
export function tickHumanTimers(h:HumanInput,rdt:number){
  h.trick=Math.max(0,h.trick-rdt);h.trickCd=Math.max(0,h.trickCd-rdt);h.trickBoost=Math.max(0,h.trickBoost-rdt);h.pressCd=Math.max(0,h.pressCd-rdt);h.tackleRec=Math.max(0,h.tackleRec-rdt);h.guard=Math.max(0,h.guard-rdt);h.slipCd=Math.max(0,h.slipCd-rdt);h.lunge=Math.max(0,h.lunge-rdt);h.backT=Math.max(0,h.backT-rdt);
}
export function clearHumanActions(h:HumanInput){h.pass=h.shoot=h.through=h.tackle=h.save=h.trickReq=h.pressReq=0;}

/** Humans per team in a roster (any iterable of inputs). */
export function humanCounts(humans:Iterable<{team:HumanTeam}>){
  let gold=0,blue=0;for(const h of humans){if(h.team==='gold')gold++;else blue++;}return {gold,blue};
}
