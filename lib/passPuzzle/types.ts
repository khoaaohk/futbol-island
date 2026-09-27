/**
 * Pass Puzzle shared types (lane C owns this file; D, E and F import it).
 * The first block is the contract (docs/pass-puzzle/CONTRACT.md) verbatim.
 *
 * Pitch frame (metres): x across the pitch (−halfWidth … +halfWidth), z along it.
 * The play area runs z = −length/2 … +length/2 and the attacking goal line is at
 * z = +length/2, centred on x = 0. Crossbar height comes from goalWidth
 * (≥7 m → 2.44, ≥6 m → 2.13, else 1.98). y is height above the grass.
 */
export type Vec2={x:number;z:number};
export type Format='7v7'|'9v9'|'11v11';
export type KickKind='pass-feet'|'pass-space'|'header'|'shot';
export type Scenario={
  id:string; pack:string; title:string;
  concept:string;                      // e.g. 'third-man', 'overlap', 'switch', 'cutback'
  brief:Record<Format,string>;         // kid wording scaled by format
  hint:Record<Format,string>;
  pitch:{halfWidth:number;length:number;goalWidth:number};  // metres; the attacking goal is at +z
  carrier:number;                      // index into attackers
  attackers:{x:number;z:number;run?:{delay:number;path:Vec2[];speed?:number;
    /** (engine addition) Start the run `delay` s after this player's own pass (pass-and-move / one-two).
     *  The run then survives this player receiving and passing. */
    afterPass?:boolean}}[];
  defenders:{x:number;z:number;mark?:number;press?:boolean}[]; // mark = attacker index
  keeper?:{x:number;z:number};
  attempts:number;                     // usually 3
  require:{minPasses:number;finish:'goal'|'reach-zone';zone?:{x:number;z:number;r:number}};
  bonus?:{kind:'curl'|'chip'|'header'|'first-time'|'scorer';scorer?:number;label:string};
  lesson:string;                       // what the child learned, shown after success
};

/* ───────────── engine types (additive to the contract) ───────────── */

export type Vec3=Vec2&{y:number};

/** A pointer sample already converted to pitch metres; t in seconds (any origin). */
export type StrokePoint={x:number;z:number;t:number};

/** readStroke's result, and the input to predict() / world.kick(). */
export type Kick={
  kind:KickKind;
  target:Vec2;
  /** Attacker index the pass is meant for (feet/header, and the best runner for pass-space). */
  receiver?:number;
  /** −1..1. Positive bows the path toward (d.z, −d.x) where d is the kick direction:
   *  for a kick up the pitch (+z) that is the +x side. The ball bows the same way the stroke bowed. */
  curl:number;
  /** 0..1, from holding still at the end of the stroke (0 = ground ball). */
  loft:number;
  /** 0..1, from stroke length. */
  power:number;
};

export type PuzzleEventType='kick'|'receive'|'intercept'|'save'|'heavy_touch'|'deflect'|'parry'|'goal'|'out';
export type Touch='feet'|'thigh'|'chest'|'header';

export type PuzzleEvent={
  type:PuzzleEventType;
  tick:number;            // world tick (1/120 s) when it happened
  t:number;               // action-clock seconds (the clock is frozen while aiming)
  at:Vec3;                // ball position
  /** Attacker index: kicker (kick), receiver (receive/heavy_touch), scorer (goal), last toucher (out). */
  attacker?:number;
  /** Defender index for intercept / deflect. */
  defender?:number;
  /** True when the keeper made the save / parry / claim. */
  keeper?:boolean;
  kind?:KickKind;         // kick
  touch?:Touch;           // receive / heavy_touch
  speed?:number;          // ball speed at the moment (m/s)
  /** kick only: the real turn the kicker made (radians) and the windup it cost. */
  turn?:number;
  windup?:number;
};

export type Phase='aiming'|'windup'|'flight'|'success'|'fail';

export type FailReason='intercept'|'save'|'out'|'rest'|'too-few-passes'|'timeout';

export type AttackerState={
  p:Vec2; v:Vec2;
  facing:number;          // radians, atan2(dir.x, dir.z): 0 faces +z (the goal)
  /** 'run' = on the scripted run, 'meet' = moving to meet a pass, 'hold' = has the ball. */
  mode:'idle'|'run'|'meet'|'hold';
  runT:number;            // seconds of scripted run elapsed (after its delay)
  runLeg:number;          // index of the next run waypoint
  target?:Vec2;           // where a 'meet' run is heading
  passedAt?:number;       // action-clock time of this player's last kick (afterPass runs)
};

export type DefenderState={
  p:Vec2; v:Vec2; facing:number;
  mode:'mark'|'press'|'hold'|'intercept';
  /** Seconds since the current ball flight began (reaction gate). */
  react:number;
  target?:Vec2;           // intercept point being attacked
  slide?:boolean;         // the plan needs a slide (low ball, stretch reach) → 'slide' reaction, deflect
};

export type KeeperState={
  p:Vec2; v:Vec2; facing:number;
  mode:'set'|'dive'|'claim'|'hold';
  react:number;
  dive:number;            // 0..1 dive extension (for the rig)
  diveDir:number;         // −1 / +1 along x
  target?:Vec2;
};

export type BallState={
  p:Vec3; v:Vec3;
  spin:number;            // side spin; positive (= +curl) swings out to the +curl side and bends back
  owner:number|null;      // attacker index while held (aiming / windup)
  atHead:boolean;         // held at head height for a header
  lastTouch:{side:'att'|'def'|'gk';i:number}|null;
  still:number;           // seconds the loose ball has been (almost) at rest
};

export type PuzzleResult={
  outcome:'success'|'fail';
  reason?:FailReason;
  passes:number;
  bonus:boolean;
};

export type PuzzleState={
  tick:number;
  t:number;               // action clock (s): only runs during windup and flight
  phase:Phase;
  attempt:number;         // 1-based
  attemptsLeft:number;    // after the current attempt
  passes:number;          // clean receives by a different attacker this attempt
  carrier:number;         // who has (or last had) the ball
  aimTime:number;         // seconds spent aiming since the ball was last received
  ball:BallState;
  attackers:AttackerState[];
  defenders:DefenderState[];
  keeper:KeeperState|null;
  /** Kick being wound up / in flight. */
  pending:{kick:Kick;kicker:number;left:number;total:number;turn:number;fromHead:boolean}|null;
  flight:{kick:Kick;kicker:number;elapsed:number;receiver:number|null;header:boolean;firstTime:boolean;
    /** A defender or the keeper touched it: a later receive is not a completed pass. */
    dirty:boolean}|null;
  /** Kicks this attempt, used for bonus evaluation. */
  chain:{kind:KickKind;curl:number;loft:number;kicker:number;header:boolean;firstTime:boolean}[];
  result:PuzzleResult|null;
  /** Ball-only look-ahead of the current loose ball (flat x,y,z every 4 ticks from tick0); AI plans on it. */
  path:{tick0:number;pts:number[]}|null;
};

export type PuzzleSnapshot={scenario:Scenario;state:PuzzleState};

/** A recorded kick: applied when the world reaches `tick` (it is in the aiming phase then). */
export type PuzzleInput={tick:number;kick:Kick};

export type PuzzleWorld={
  readonly scenario:Scenario;
  /** Live state; treat as read-only outside the engine. */
  readonly state:PuzzleState;
  /** Advance by real seconds (fixed 1/120 internal ticks, dt clamped to 0.25). */
  step(dt:number):void;
  /** Start a kick from the aiming phase. Returns false if not aiming. */
  kick(k:Kick):boolean;
  snapshot():PuzzleSnapshot;
  restore(s:PuzzleSnapshot):void;
  /** Events since the last drain (also delivered to listeners as they happen). */
  drain():PuzzleEvent[];
  on(fn:(e:PuzzleEvent)=>void):()=>void;
  /** Start the next attempt from the scenario start. False when no attempts are left. */
  retry():boolean;
  /** Snapshot taken at the start of the current attempt, plus its recorded inputs: pass both to replay(). */
  attemptStart():PuzzleSnapshot;
  inputs():PuzzleInput[];
  /** Kicker's turn (radians, signed) and the windup that kick would cost right now. */
  turnFor(k:Kick):{turn:number;windup:number};
};

export type Prediction={
  path:Vec3[];            // sampled every 1/30 s from the launch point
  end:'goal'|'out'|'rest'|'intercept';
  threats:number[];       // defender indices who can reach a path point before the ball
  keeperThreat:boolean;   // the keeper can reach the path first (save / claim)
  receiver?:number;       // attacker predicted to receive it
  receiveAt?:Vec3;        // where (path is truncated there)
  hitsPost?:boolean;
};

export type Replay={
  readonly world:PuzzleWorld;
  readonly speed:number;
  /** Advance by real seconds; sim time advances by dt × speed. Frozen aiming is skipped. */
  advance(realDt:number):PuzzleEvent[];
  /** Run to the end of the attempt (success/fail) at sim speed; returns all events. */
  run():PuzzleEvent[];
  readonly done:boolean;
};
