import {firstTouchDirection} from "./firstTouch";
import { laneAdjustment, screenPosition } from "./tacticalMovement";
// Standalone two-way football match simulation (the "brain + body").
// Pure logic in field space (270 x 400) with NO rendering/DOM deps, so it can be
// unit-tested in Node at full speed. BabylonStage just reads positions each frame.
//
// Gold attacks the TOP goal (y→0); Blue attacks the BOTTOM goal (y→400).

export type Team = "gold" | "blue";
export type Role = "gk" | "def" | "mid" | "fwd";

export interface SimPlayer {
  id: string;
  team: Team;
  role: Role;
  isGK: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number; // formation home
  hy: number;
  kick: number; // >0 briefly after striking the ball (for animation)
}

const GY_TOP = 8;
const GY_BOT = 392;
const GHALF = 19; // goal half-width in field units (~6.4m of a 45.7m pitch)

// tunables (all field-units / seconds)
const P = {
  runSpeed: 84, // outfield sprint (slower than a struck pass so the ball beats the chase)
  ownerSpeed: 50, // ball carrier moves slower (shielding/looking up)
  gkSpeed: 56,
  accel: 12, // how fast velocity converges to desired (higher = snappier)
  sepRadius: 15, // personal space (keeps shape, avoids clustering)
  sepForce: 150,
  passSpeed: 150,
  shotSpeed: 190, // struck hard so it reaches the goal from the final third despite roll decay
  clearSpeed: 160,
  friction: 2.2, // ball roll decay (higher → faster passes still settle at the receiver, not overrun)
  recvRadius: 5.5, // loose-ball control radius (clearances/deflections)
  ctrlRadius: 12, // the intended receiver's control zone — they own a pass aimed at them
  gkReach: 9.5, // keepers' save radius
  pressDist: 12, // "under pressure" range
  tackleDist: 4.2,
  tackleChance: 0.9, // per second when a defender is right on the carrier
  protectTime: 0.55, // a player who just won/received the ball can't be tackled for this long
  interceptRadius: 3.4, // a defender must be right on a pass to cut it out (else sequences never build)
};

const GOLD_HOME: [string, number, number, Role][] = [
  ["gk", 135, 374, "gk"], ["lcb", 70, 336, "def"], ["cb", 135, 348, "def"], ["rcb", 200, 336, "def"],
  ["lcm", 96, 266, "mid"], ["rcm", 174, 266, "mid"], ["lw", 50, 176, "fwd"], ["st", 135, 156, "fwd"], ["rw", 220, 176, "fwd"],
];
const BLUE_HOME: [string, number, number, Role][] = [
  ["dgk", 135, 26, "gk"], ["dlcb", 70, 64, "def"], ["dcb", 135, 52, "def"], ["drcb", 200, 64, "def"],
  ["dlcm", 96, 134, "mid"], ["drcm", 174, 134, "mid"], ["dlw", 50, 224, "fwd"], ["dst", 135, 244, "fwd"], ["drw", 220, 224, "fwd"],
];
// 11-a-side 4-3-3 (11v11) — ids match OFF_11 / DEF_11 in plays.ts
const GOLD_HOME_11: [string, number, number, Role][] = [
  ["gk", 135, 374, "gk"], ["lb", 45, 332, "def"], ["lcb", 100, 350, "def"], ["rcb", 170, 350, "def"], ["rb", 225, 332, "def"],
  ["lcm", 82, 262, "mid"], ["cm", 135, 274, "mid"], ["rcm", 188, 262, "mid"], ["lw", 52, 165, "fwd"], ["st", 135, 148, "fwd"], ["rw", 218, 165, "fwd"],
];
const BLUE_HOME_11: [string, number, number, Role][] = [
  ["dgk", 135, 26, "gk"], ["dlb", 45, 68, "def"], ["dlcb", 100, 50, "def"], ["drcb", 170, 50, "def"], ["drb", 225, 68, "def"],
  ["dlcm", 82, 138, "mid"], ["dcm", 135, 126, "mid"], ["drcm", 188, 138, "mid"], ["dlw", 52, 235, "fwd"], ["dst", 135, 252, "fwd"], ["drw", 218, 235, "fwd"],
];
// 7-a-side 2-3-1 — ids match OFF_7 / DEF_7 in plays.ts
const GOLD_HOME_7: [string, number, number, Role][] = [
  ["gk", 135, 374, "gk"], ["lcb", 95, 332, "def"], ["rcb", 175, 332, "def"],
  ["lm", 58, 252, "mid"], ["cm", 135, 262, "mid"], ["rm", 212, 252, "mid"], ["st", 135, 158, "fwd"],
];
const BLUE_HOME_7: [string, number, number, Role][] = [
  ["dgk", 135, 26, "gk"], ["dlcb", 95, 68, "def"], ["drcb", 175, 68, "def"],
  ["dlm", 58, 148, "mid"], ["dcm", 135, 138, "mid"], ["drm", 212, 148, "mid"], ["dst", 135, 242, "fwd"],
];
// Futsal 5-a-side 1-2-1 — ids match OFF_5 / DEF_5 in plays.ts
const GOLD_HOME_5: [string, number, number, Role][] = [
  ["gk", 135, 372, "gk"], ["cb", 135, 300, "def"], ["lm", 62, 240, "mid"], ["rm", 208, 240, "mid"], ["st", 135, 168, "fwd"],
];
const BLUE_HOME_5: [string, number, number, Role][] = [
  ["dgk", 135, 28, "gk"], ["dcb", 135, 100, "def"], ["dlm", 62, 160, "mid"], ["drm", 208, 160, "mid"], ["dst", 135, 232, "fwd"],
];

// ---- team philosophies ----
// Each match deals TWO DISTINCT tactical identities (Football-Manager-style mentality
// cards): one coherent set of biases per team that drives line height, press bite,
// attacking width, pass directness, long-ball appetite, trap stepping and counter
// urgency — so the two sides read DIFFERENT to a viewer within a minute.
//   possession — high line, patient wide circulation, walks it up the pitch
//   press      — highest line + biggest tackle bite, squeezes the opponent's build
//   counter    — low narrow block that explodes forward the moment the ball turns over
//   direct     — mid block, long balls over the top, lets fly from range
// press/line/carry/range are multipliers on existing knobs (kept near the old ±10-18%
// aggressor/block card so balance holds); holdLine is the attacking rest-defence cap
// (how high the back line may push, in depth units from own goal — see updateShape).
export type StyleName = "possession" | "press" | "counter" | "direct" | "balanced";
interface Persona { style: StyleName; press: number; line: number; direct: number; carry: number; range: number; holdLine: number; width: number; trap: number; urgency: number; loft: number }
const STYLES: Record<StyleName, Omit<Persona, "style">> = {
  possession: { press: 0.02, line: 0.08, direct: -0.05, carry: -0.05, range: -0.08, holdLine: 200, width: 9, trap: 1.0, urgency: 0.85, loft: 0.5 },
  press: { press: 0.09, line: 0.12, direct: 0.01, carry: 0.1, range: 0.05, holdLine: 198, width: 5, trap: 1.3, urgency: 1.1, loft: 0.8 },
  counter: { press: -0.08, line: -0.16, direct: 0.04, carry: 0.12, range: 0.04, holdLine: 172, width: 2, trap: 0.75, urgency: 1.5, loft: 1.3 },
  direct: { press: 0.04, line: -0.04, direct: 0.06, carry: -0.08, range: 0.14, holdLine: 182, width: 6, trap: 1.15, urgency: 1.2, loft: 2.0 },
  balanced: { press: 0, line: 0, direct: 0, carry: 0, range: 0, holdLine: 185, width: 5, trap: 1.0, urgency: 1.0, loft: 1.0 },
};
// spice scales how pronounced the identity plays today (like the old aggressor card)
function mkPersona(s: StyleName, spice: number): Persona {
  const b = STYLES[s];
  return {
    style: s,
    press: 1 + b.press * spice, line: 1 + b.line * spice, direct: b.direct * spice,
    carry: 1 + b.carry * spice, range: 1 + b.range * spice,
    holdLine: b.holdLine, width: b.width, trap: b.trap, urgency: b.urgency, loft: b.loft,
  };
}

// Street cage 3-a-side: a keeper + two outfielders per team (small, frantic).
const GOLD_HOME_3: [string, number, number, Role][] = [
  ["cgk", 135, 360, "gk"], ["clm", 95, 250, "mid"], ["cst", 175, 185, "fwd"],
];
const BLUE_HOME_3: [string, number, number, Role][] = [
  ["cdgk", 135, 40, "gk"], ["cdlm", 175, 150, "mid"], ["cdst", 95, 215, "fwd"],
];
// A self-contained 3v3 sim for the cage game (futsal mechanics, custom small squads).
export function makeCageSim(seed: number): MatchSim {
  return new MatchSim(seed, "futsal", { gold: GOLD_HOME_3, blue: BLUE_HOME_3 });
}

const TEAMS: Team[] = ["gold", "blue"]; // hoisted — updateShape runs per frame, keep it allocation-free
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);
// distance from point p to segment a→b
function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const abx = bx - ax;
  const aby = by - ay;
  const L2 = abx * abx + aby * aby || 1;
  let t = ((px - ax) * abx + (py - ay) * aby) / L2;
  t = clamp(t, 0, 1);
  return Math.hypot(ax + abx * t - px, ay + aby * t - py);
}

export class MatchSim {
  players: Record<string, SimPlayer> = {};
  goldIds: string[] = [];
  blueIds: string[] = [];
  ids: string[] = [];
  ball = { x: 135, y: 200, vx: 0, vy: 0, height: 0, owner: null as string | null, target: null as string | null, intBy: null as string | null, lofted: false };
  passRelease: {id:string;x:number;y:number;tx:number;ty:number;target:string}|null=null;
  possession: Team = "gold";
  score = { gold: 0, blue: 0 };
  msg = "Kick-off";
  msgT = 1.2;
  // goal celebration hold: after a goal the ball stays dead in the net for a beat (so it
  // visibly flies in and the net can bulge) before the kick-off resets everything.
  goalHold = 0;
  goalNet: "top" | "bottom" | null = null;
  ballImpact = 0; // 0..1 how hard the ball just hit the net (drives the bulge)

  // ---- user control (the "Play" island) ----
  // When userTeam is set, one player on that team is driven by the human, not the AI.
  // BabylonStage feeds a move direction + one-shot shoot/pass each frame; the sim
  // auto-switches control to whoever is nearest the ball (FIFA-style).
  userTeam: Team | null = null;
  userId: string | null = null;
  private userMove = { x: 0, y: 0 };
  private userMoveMag = 0; // how hard the stick is pushed (0..1) → analog walk/jog/run speed
  private userFace = { x: 0, y: 0 }; // last non-zero move dir — the way the player is aimed
  passTargetId: string | null = null; // team-mate who'll receive a Pass right now (for the on-field indicator)
  private userShoot = false;
  private userShootPower = 1; // 0..1 shot power (from how long SHOOT was held)
  private userAct = false; // space: pass (on the ball) / tackle (defending)
  private userSprint = false; // held: boosts the controlled player's speed
  private userThrough = false; // one-shot: a driven through-ball
  private userSwitch = false; // one-shot: switch to another team-mate
  private userJockey = false; // held: contain the attacker (stay goal-side, don't lunge)
  private shootBuf = 0; private actBuf = 0; private throughBuf = 0; // input-buffer windows (s)
  private prevPoss: Team | null = null; // to detect the moment we lose possession

  private passCd = 1;
  private lastFrom: string | null = null;
  private deadT = 0; // how long a loose ball has sat (near) still — unsticks a dead ball

  private lastOwner: string | null = null;
  private hold = 0;
  private carrying = false; // owner is driving the ball forward into space
  private ballFlight = 0; // min time a pass stays airborne before anyone can receive it
  private ballIsShot = false; // ball is a shot on goal (only the keeper can stop it)
  private protect = 0; // tackle-immunity timer for the current owner
  // ---- first-touch trap (reception layer) ----
  // A claimed ball is never TELEPORTED to the new owner's feet: for trapT seconds the
  // incoming momentum is cushioned away while the ball eases into a settle point a few
  // units ahead of the receiver (in stride, biased onto the receiving foot). See
  // startTrap()/dribbleBall(). trapVX/trapVY hold the residual momentum being bled off;
  // touchX/touchY the settle bias (relaxes to the plain dribble spot as control tightens).
  private trapT = 0;
  private trapDur = 0;
  private trapVX = 0;
  private trapVY = 0;
  private touchX = 0;
  private touchY = 0;
  private rng: () => number;
  private targets: Record<string, { x: number; y: number }> = {};
  private presserId: string | null = null;
  private chaserIds = new Set<string>(); // players running onto a loose ball this frame
  private passMul = 1; // futsal: quicker, zippier passing (smaller, faster game)
  private allowLoft = false; // 11v11: allow lofted balls "over the top" (bigger field)
  private useOffside = false; // 11v11/9v9 only (futsal & 7v7 have no offside)
  private loftDur = 0; // remaining flight time of a lofted ball (drives the height arc)
  private loftT = 0;
  private loftPeak = 0;

  // ---- phases & momentum ----
  private counterT = 0; // seconds left in the counter-attack window after winning the ball
  private counterTeam: Team | null = null;
  // possession-fairness pressure: the longer one team keeps the ball UNINTERRUPTED, the
  // likelier a misplaced pass / won tackle becomes — one side can't monopolise for minutes.
  private possT = 0;
  private fairT: Team | null = null;
  private fairMul = 1;
  // stalemate breaker: how long the ball has lived in the middle third — past ~10s the
  // next on-ball action is forced DIRECT (through-ball / switch / clearance).
  private midT = 0;
  // match-arc tempo: >1 in the energetic opening & urgent finale (more shots, quicker
  // release), <1 through the mid-match lull — makes the arcs visibly different.
  private tempoMul = 1;
  private scorerId: string | null = null; // who struck the goal — the celebration magnet
  // per-format feel tuning: pressing bite, lane-interception width, pass error under
  // pressure, shot appetite, how open a receiver must be, and when the pitch counts as
  // "overloaded" (→ switch play). Small-sided games press/turn over MUCH more (that's
  // what makes futsal frantic); 11v11 shoots a touch less and rarely lofts.
  private T = { press: 1.38, lane: 1.24, misplace: 1.45, shoot: 1, openReq: 11, laneReq: 8, loftP: 0.05, switchAt: 4, carryP: 0.28, fwdAdv: 120, shotRange: 110, finish: 0.9, lineUp: 30, lineDn: 62 };
  private shotRead = 100; // how far out the defending GK picks up the flight of this shot
  // a shot whose outcome was rolled a GOAL at the strike cannot be overturned by the
  // keeper's emergent positioning (e.g. mid-rush he happens to stand in the path) — the
  // placement already "beat" him. Human shots stay honest (null → keeper can save).
  private shotIsGoal = false;
  private shotAim = { x: 135, y: 0 }; // where the decided shot was placed (failsafe steer target)

  // ---- staged restarts ----
  // when the ball goes out (or in) play doesn't teleport back — the ball sits DEAD on the
  // restart spot while a taker walks over and both teams get set, then the restart pass is
  // played. kinds: kickoff (centre after a goal), kickin (touchline), goalkick (keeper),
  // corner (deep kick-in when the defence turned it behind).
  // kickoff only: the taker first FETCHES the ball (from the net) then CARRIES it to the
  // centre spot — the ball visibly travels back rather than teleporting.
  private restart: { kind: "kickoff" | "kickin" | "goalkick" | "corner"; t: number; x: number; y: number; taker: string; carry?: "fetch" | "carrying" } | null = null;

  // ---- team personality ----
  // seeded per match: each side draws a DISTINCT philosophy card (see STYLES above) —
  // the matchup gets a narrative ("high-press gold suffocate a low-block blue that
  // counters in a flash") built from biases on EXISTING knobs plus the line-height caps.
  private persona: Record<Team, Persona> = { gold: mkPersona("balanced", 1), blue: mkPersona("balanced", 1) };
  styles: Record<Team, StyleName> = { gold: "balanced", blue: "balanced" }; // public read (attract-mode UI could caption the matchup)

  // ---- team shape (line-height engine) ----
  // THE visible fix: each team's back line is a LIVE height (depth from own goal), not
  // a set of parked home spots. In possession it pushes up with the ball toward
  // ~halfway (rest defence, capped by philosophy holdLine); out of possession it holds
  // the engage/drop curve; it steps up together on balls played away from goal
  // (trap-lite) and drops faster when the ball comes back over the top. Rate-limited
  // both ways so the unit BREATHES rather than teleports. Modelled on the FIFA EFI
  // "defensive line height & team length" metric (line height = deepest outfield
  // unit's distance from own goal; team length stays compact and breathes with play):
  // https://www.fifatrainingcentre.com/en/fwc2022/efi-metrics/efi-metric--defensive-line-height-and-team-length.php
  // Verified by scripts/lineheight.mjs (correlation / range / peak-height gates).
  private shape: Record<Team, { line: number; stepUp: number }> = { gold: { line: 52, stepUp: 0 }, blue: { line: 52, stepUp: 0 } };

  // ---- individual brains, shared shape ----
  // A light utility layer (classic game-AI "utility system": score a few candidate
  // objectives, team shape as a strong prior): every ~0.3-0.45s — staggered per player,
  // ~2-4 Hz, zero per-frame allocations — each outfielder re-picks an objective:
  //   0 hold the shape slot · 2 overlap up the wing (attacking wide defender)
  //   4 step out of the line to touch-tight mark the attacker in his zone
  // plus per-player REACTION LATENCY (react): each man chases the team line with his
  // own delay, so the unit ripples like humans instead of moving in lock-step; and
  // rare fatigue-scaled LAPSES (ball-watching — his line freezes for a beat), the
  // organic errors that gift the occasional chance without breaking balance.
  private brain: Record<string, { next: number; mode: 0 | 2 | 4; react: number; pl: number; lapse: number; ox: number; oy: number; screen: {x:number;y:number}|null }> = {};
  // formation stagger: each defender's home depth minus his unit's mean — preserved on
  // the pushed-up line so rest defence stays staggered (one CB deeper), never statues
  // shoulder-to-shoulder on halfway.
  private defOff: Record<string, number> = {};

  // ---- match arc & fatigue ----
  // energetic opening → mid-match lull → urgent finale when the score is close, plus
  // slowly tiring legs. legsMul scales AI top speed a few percent either way — an ebb you
  // feel over minutes, never a sluggish frame. fatigue also nudges late passing safer.
  private legsMul = 1;
  private fatigue = 0; // 0..1 across one ~4-minute attract-mode "match"

  // ---- off-ball micro-movement ----
  // per-player two-sine wander (seeded phase/frequency pairs) so nobody stands planted
  // between beats: attackers check toward/away from the ball, defenders shuffle laterally,
  // the keeper bounces on his line. BabylonStage's gait animates whatever velocity we
  // output, so even these sub-1 u/s adjustments read as constant purposeful motion.
  private wanderP: Record<string, { f1: number; f2: number; p1: number; p2: number }> = {};

  // stats (for testing) — carries counts SUSTAINED drives (a carry episode >= 15 units)
  stats = { passes: 0, turnovers: 0, shots: 0, shotsGold: 0, shotsBlue: 0, interceptions: 0, possGold: 0, possBlue: 0, time: 0, recvOwn: 0, looseOwn: 0, looseOpp: 0, carries: 0, carryDist: 0, decided: 0, xgSum: 0 };
  private carryAcc = 0; // distance covered in the current carry episode
  private carryOwner: string | null = null;

  // ---- public VFX reads (additive — consumed by BabylonStage's shot trail/particles) ----
  // TRUE only while a struck shot is genuinely in flight toward goal (released, unclaimed).
  // Flips false automatically on every resolution path: goal (goal-line crossing clears
  // ballIsShot), save/catch, parry, fizzle-out, out-of-bounds restart, or any claim.
  get shotActive(): boolean { return this.ballIsShot && this.ball.owner === null; }
  // ---- public reception read (additive — consumed by BabylonStage's first-touch pose) ----
  // ONE shared object mutated in place (zero per-frame allocations): who is taking a
  // first touch right now (id, else null), the countdown t / total dur of the cushion,
  // which foot takes the touch, and the yaw target (faceX/faceY, unit, field space) the
  // receiver's hips OPEN toward while cushioning — the bisector between where the ball
  // came from and where his next action points, so he half-turns instead of squaring up
  // to the passer. Foot convention: with y-down field coords, a player facing (fx,fy)
  // has his right-hand side along (-fy, fx).
  recv = { id: null as string | null, t: 0, dur: 0, foot: "R" as "L" | "R", faceX: 0, faceY: -1 };

  constructor(seed = 1, format: "9v9" | "11v11" | "futsal" | "7v7" = "9v9", squads?: { gold: [string, number, number, Role][]; blue: [string, number, number, Role][] }) {
    // deterministic PRNG so tests are reproducible
    let s = seed >>> 0;
    this.rng = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
    const gold = squads?.gold ?? (format === "11v11" ? GOLD_HOME_11 : format === "futsal" ? GOLD_HOME_5 : format === "7v7" ? GOLD_HOME_7 : GOLD_HOME);
    const blue = squads?.blue ?? (format === "11v11" ? BLUE_HOME_11 : format === "futsal" ? BLUE_HOME_5 : format === "7v7" ? BLUE_HOME_7 : BLUE_HOME);
    if (format === "futsal") this.passMul = 1.22; // zippier passing for the quick small-sided game
    if (format === "11v11") this.allowLoft = true; // big field → balls over the top / crosses
    // finish (xG multiplier) is tuned so a full 180-sim-second game averages ~1.2–1.5 goals
    // in EVERY format — enough that a typical 2–3 minute viewing window contains a goal (and
    // the post-goal celebration + carry-to-centre restart actually get seen), while staying
    // near the ~1 goal/game balance target (verify with `npx tsx scripts/simavg.mjs <fmt>`).
    // (futsal finish trimmed 1.12→0.98 when strike pace went up ~20% — the quicker shot
    // resolution feeds futsal more attacking sequences, so conversion is eased to hold
    // the same goals/game; verified over 20 seeds)
    // (all formats re-tuned up ~15-25% when the carry engine + first-touch trap landed:
    // carries burn clock and get engaged before the box, which trimmed underlying
    // xG/game to ~1.0 — finish restores it to ~1.25, measured via stats.xgSum)
    if (format === "futsal") this.T = { press: 1.7, lane: 1.9, misplace: 2.0, shoot: 1.8, openReq: 8, laneReq: 6, loftP: 0, switchAt: 3, carryP: 0.52, fwdAdv: 145, shotRange: 155, finish: 1.22, lineUp: 50, lineDn: 88 };
    else if (format === "7v7") this.T = { press: 1.5, lane: 1.7, misplace: 1.8, shoot: 1.6, openReq: 9, laneReq: 6.5, loftP: 0, switchAt: 3, carryP: 0.45, fwdAdv: 135, shotRange: 135, finish: 1.2, lineUp: 46, lineDn: 82 };
    else if (format === "11v11") this.T = { press: 1.15, lane: 1.15, misplace: 1.1, shoot: 0.85, openReq: 11, laneReq: 8, loftP: 0.03, switchAt: 4, carryP: 0.28, fwdAdv: 120, shotRange: 110, finish: 0.73, lineUp: 30, lineDn: 62 };
    this.useOffside = format === "11v11" || format === "9v9"; // futsal & 7v7 don't play offside
    // deal the philosophy cards for this match (seeded → reproducible): two DISTINCT
    // styles from the deck, then `spice` sets how pronounced the identities are today
    const deck: StyleName[] = ["possession", "press", "counter", "direct"];
    // warm the LCG first: its earliest draws cluster for small/sequential seeds, which
    // was skewing the style deal (and handing gold the stronger card far too often)
    // (6 draws, re-picked when the carry/trap layer changed the draw pattern per match)
    for (let w = 0; w < 6; w++) this.rng();
    const i1 = Math.floor(this.rng() * 4);
    const i2 = (i1 + 1 + Math.floor(this.rng() * 3)) % 4; // guaranteed different
    const spice = 0.7 + this.rng() * 0.6;
    this.persona = { gold: mkPersona(deck[i1], spice), blue: mkPersona(deck[i2], spice) };
    this.styles = { gold: deck[i1], blue: deck[i2] };
    for (const [id, x, y, role] of gold) this.add(id, "gold", x, y, role);
    for (const [id, x, y, role] of blue) this.add(id, "blue", x, y, role);
    this.ids = [...this.goldIds, ...this.blueIds];
    // rest-defence stagger offsets: each back-line player keeps his formation's relative
    // depth (fullbacks a touch higher, one CB deeper) wherever the team line travels
    for (const t of ["gold", "blue"] as Team[]) {
      const own = this.ownGoalY(t);
      const defs = this.mates(t).filter((id) => this.players[id].role === "def");
      const mean = defs.reduce((s, id) => s + Math.abs(this.players[id].hy - own), 0) / (defs.length || 1);
      for (const id of defs) this.defOff[id] = Math.abs(this.players[id].hy - own) - mean;
    }
    this.kickOff("gold");
  }
  private add(id: string, team: Team, x: number, y: number, role: Role) {
    this.players[id] = { id, team, role, isGK: role === "gk", x, y, vx: 0, vy: 0, hx: x, hy: y, kick: 0 };
    (team === "gold" ? this.goldIds : this.blueIds).push(id);
    // seeded wander pair — every player gets his own micro-movement rhythm
    this.wanderP[id] = { f1: 0.45 + this.rng() * 0.5, f2: 0.8 + this.rng() * 0.8, p1: this.rng() * Math.PI * 2, p2: this.rng() * Math.PI * 2 };
    // seeded brain: staggered think-clock, personal reaction latency, line-follow state
    this.brain[id] = { next: this.rng() * 0.4, mode: 0, react: 0.12 + this.rng() * 0.3, pl: Math.abs(y - (team === "gold" ? GY_BOT : GY_TOP)), lapse: 0, ox: 0, oy: 0, screen: null };
  }

  private atkGoalY(t: Team) { return t === "gold" ? GY_TOP : GY_BOT; }
  private ownGoalY(t: Team) { return t === "gold" ? GY_BOT : GY_TOP; }
  private dirY(t: Team) { return t === "gold" ? -1 : 1; } // toward opponent goal
  private mates(t: Team) { return t === "gold" ? this.goldIds : this.blueIds; }
  private foes(t: Team) { return t === "gold" ? this.blueIds : this.goldIds; }

  // ---- offside ----
  // depth = how far a point is up the pitch toward the opponent goal (0 at own end).
  private depth(t: Team, y: number) { return t === "gold" ? 400 - y : y; }
  // the offside line: depth of the SECOND-LAST opponent (last defender in front of the GK).
  private offsideLine(t: Team) {
    const ds = this.foes(t).map((id) => this.depth(t, this.players[id].y)).sort((a, b) => b - a);
    return ds[1] ?? ds[0] ?? 400; // 2nd-deepest opponent up the pitch
  }
  // a receiver is offside if, in the attacking half, they are CLEARLY beyond BOTH the
  // 2nd-last defender and the ball. Only enforced in 11v11/9v9 (futsal & youth 7v7 don't
  // play offside).
  private isOffside(t: Team, y: number) {
    if (!this.useOffside) return false;
    const rd = this.depth(t, y);
    if (rd < 210) return false; // only past the halfway line, into the attacking half
    return rd > this.offsideLine(t) + 6 && rd > this.depth(t, this.ball.y) + 6;
  }
  // free kick to the defending team from the offside spot
  private callOffside(attTeam: Team, x: number, y: number) {
    const def: Team = attTeam === "gold" ? "blue" : "gold";
    let bestId = this.foes(attTeam)[0]; let bd = Infinity;
    for (const id of this.foes(attTeam)) { const p = this.players[id]; if (p.isGK) continue; const d = dist(p.x, p.y, x, y); if (d < bd) { bd = d; bestId = id; } }
    const p = this.players[bestId];
    this.ball.x = p.x; this.ball.y = p.y; this.ball.vx = 0; this.ball.vy = 0; this.ball.height = 0;
    this.ball.owner = bestId; this.ball.target = null; this.ball.intBy = null;
    this.possession = def; this.protect = 0.6; this.passCd = 0.5; this.hold = 0.3;
    this.loftDur = 0; this.ball.height = 0; this.endTrap(); // whistle placement, no touch
    this.msg = "Offside!"; this.msgT = 1.8; this.stats.turnovers++;
  }

  // ---- phases of play ----
  // The attack reads differently by zone: BUILD (own third — patient circulation),
  // PROGRESS (middle — purposeful), FINAL (attacking third — urgent) — plus COUNTER
  // right after winning the ball, when the fastest route forward beats a set defence.
  // This one word drives tempo (composure time), pass firmness, off-ball running and
  // how high the opposing block steps up, so each phase LOOKS different from the stands.
  private phaseOf(t: Team): "build" | "progress" | "final" | "counter" {
    if (this.counterT > 0 && this.counterTeam === t) return "counter";
    const d = this.depth(t, this.ball.y);
    return d < 150 ? "build" : d < 262 ? "progress" : "final";
  }
  // the moment possession is WON in open play — opens a short window where the winning
  // team plays fast and direct while the other side is still out of shape.
  // A counter-philosophy side lives for this: its window runs noticeably longer.
  private startCounter(t: Team) { this.counterT = 3.0 + 0.6 * this.persona[t].urgency; this.counterTeam = t; }

  // ---- user control API ----
  // Hand control of `team` to the human. Called once when the "Play" island opens.
  enableUser(team: Team) { this.userTeam = team; this.updateUserPlayer(); }
  // Wipe the scoreline and kick off fresh — called when the Play game (re)starts so a new
  // session always begins 0–0 rather than inheriting the attract-mode match's score.
  resetMatch() { this.score.gold = 0; this.score.blue = 0; this.goalHold = 0; this.goalNet = null; this.kickOff("gold"); }
  // Per-frame input: move dir + one-shot shoot/act, plus optional extra buttons (sprint held,
  // a driven through-ball, and switch-player) — the object keeps this future-proof for more.
  setUserInput(mx: number, my: number, shoot: boolean, act: boolean, extra?: { sprint?: boolean; through?: boolean; switchReq?: boolean; shootPower?: number; jockey?: boolean }) {
    this.userMove.x = mx; this.userMove.y = my;
    this.userMoveMag = Math.min(1, Math.hypot(mx, my)); // magnitude drives analog speed
    if (Math.hypot(mx, my) > 0.05) { this.userFace.x = mx; this.userFace.y = my; } // remember aim
    if (shoot) { this.userShoot = true; this.userShootPower = extra?.shootPower ?? 1; this.shootBuf = 0.16; }
    if (act) { this.userAct = true; this.actBuf = 0.16; }
    if (extra?.through) { this.userThrough = true; this.throughBuf = 0.16; }
    this.userSprint = !!extra?.sprint;
    this.userJockey = !!extra?.jockey;
    if (extra?.switchReq) this.userSwitch = true;
  }
  // Pass where the player is aimed, but weighted: direction is primary (so it obeys your
  // intent), then openness, distance and a clear lane break near-ties. Moving receivers are
  // LED (aim ahead of their run) so through-balls reach them.
  private userPassTarget(fromId: string): string | null {
    const from = this.players[fromId];
    const fl = Math.hypot(this.userFace.x, this.userFace.y);
    if (fl < 0.01) return null; // no aim yet → let the caller fall back to the AI pick
    const ux = this.userFace.x / fl, uy = this.userFace.y / fl;
    let best: string | null = null;
    let bestScore = -Infinity;
    for (const id of this.mates(from.team)) {
      if (id === fromId) continue;
      const t = this.players[id];
      if (t.isGK) continue;
      // lead the runner: aim ~0.22s ahead of where a moving team-mate is going
      const lx = t.x + t.vx * 0.22, ly = t.y + t.vy * 0.22;
      const dx = lx - from.x, dy = ly - from.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < 7 || d > 195) continue;
      const align = (dx / d) * ux + (dy / d) * uy; // cosine between aim and the team-mate
      if (align < 0.25) continue; // must be roughly the way you're facing
      const nf = this.nearestFoe(id, lx, ly);
      const open = nf ? nf.d : 40; // how much space at the target
      // is the passing lane blocked by a defender sitting in it?
      let laneD = Infinity;
      for (const fid of this.foes(from.team)) { const f = this.players[fid]; if (f.isGK) continue; laneD = Math.min(laneD, segDist(f.x, f.y, from.x, from.y, lx, ly)); }
      const laneBlock = laneD < 5 ? -40 : 0;
      // direction DOMINATES; openness/distance/lane only separate similar options
      const score = align * 80 + Math.min(open, 30) * 0.9 - d * 0.06 + laneBlock;
      if (score > bestScore) { bestScore = score; best = id; }
    }
    return best;
  }
  // ON OFFENSE (we have the ball / it's coming to us) control auto-follows the ball — the
  // carrier, or the receiver mid-pass — like a normal attacking game. ON DEFENSE it's
  // STICKY: you keep the same player until you press SWITCH (which grabs the man nearest
  // the ball), so control doesn't jump around while chasing.
  private updateUserPlayer() {
    if (!this.userTeam) return;
    // auto-switch the moment we lose the ball → grab the defender nearest the ball so
    // control is never stranded on a bystander during the turnover.
    // kickoff fetch/carry: the taker walks the cinematic under AI control — park the human on
    // another team-mate (near the centre spot, where play resumes) and keep switching off him
    const cine = this.restart?.carry ? this.restart.taker : null;
    if (cine && this.userId === cine && this.players[cine].team === this.userTeam) {
      this.userId = this.nearestOfTeam(this.userTeam, 135, 200, cine) ?? this.userId;
    }
    if (this.prevPoss === this.userTeam && this.possession !== this.userTeam) {
      const near = this.nearestOfTeam(this.userTeam, this.ball.x, this.ball.y, cine);
      if (near) this.userId = near;
    }
    this.prevPoss = this.possession;
    if (this.userSwitch) {
      this.userSwitch = false;
      // push the stick while switching → take the team-mate in that direction; otherwise the
      // one nearest the ball (avoids being handed a random far player).
      const dir = this.userMoveMag > 0.3 && this.userId ? this.dirSwitchTarget(this.userId) : null;
      this.userId = dir ?? this.nearestOfTeam(this.userTeam, this.ball.x, this.ball.y, cine);
      return;
    }
    const owner = this.ball.owner;
    if (owner && this.players[owner].team === this.userTeam) { this.userId = owner; return; } // offense: our carrier
    if (owner === null && this.ball.target && this.players[this.ball.target].team === this.userTeam) { this.userId = this.ball.target; return; } // offense: our receiver mid-pass
    // defense / out of possession → keep the current player (only SWITCH changes it)
    if (!this.userId || !this.players[this.userId] || this.players[this.userId].team !== this.userTeam) {
      this.userId = this.nearestOfTeam(this.userTeam, this.ball.x, this.ball.y);
    }
  }
  // team-mate best aligned with the stick direction (for directional switching)
  private dirSwitchTarget(fromId: string): string | null {
    const from = this.players[fromId];
    const fl = Math.hypot(this.userMove.x, this.userMove.y) || 1;
    const ux = this.userMove.x / fl, uy = this.userMove.y / fl;
    let best: string | null = null, bestScore = -Infinity;
    for (const id of this.mates(from.team)) {
      if (id === fromId || this.players[id].isGK) continue;
      const t = this.players[id];
      const dx = t.x - from.x, dy = t.y - from.y;
      const d = Math.hypot(dx, dy) || 1;
      const align = (dx / d) * ux + (dy / d) * uy;
      if (align < 0.3) continue; // must be roughly the way you pushed
      const score = align * 60 - d * 0.1; // most-aligned, prefer nearer
      if (score > bestScore) { bestScore = score; best = id; }
    }
    return best;
  }
  // Override the controlled player's steering target from the human's input. Only takes
  // over when there's input (or they're on the ball) — otherwise the AI keeps them in shape.
  private applyUserTarget() {
    if (!this.userTeam || !this.userId) return;
    // kickoff fetch/carry cinematic: the taker's walk is AI-owned — human input must never
    // override it (stick steering is field-clamped and can strand the fetch forever)
    if (this.restart?.carry && this.userId === this.restart.taker) return;
    const p = this.players[this.userId];
    // JOCKEY (hold while defending): shepherd the carrier — sit just goal-side of them and
    // pace them without diving in (the tackle is suppressed while jockeying, see ballLogic).
    if (this.userJockey && this.ball.owner && this.players[this.ball.owner].team !== this.userTeam) {
      const c = this.players[this.ball.owner];
      const sgn = Math.sign(this.ownGoalY(this.userTeam) - c.y) || 1; // toward our own goal
      this.targets[this.userId] = { x: clamp(c.x, 14, 256), y: clamp(c.y + sgn * 7, 12, 388) };
      return;
    }
    const mag = Math.hypot(this.userMove.x, this.userMove.y);
    if (mag > 0.05) {
      const ux = this.userMove.x / mag, uy = this.userMove.y / mag;
      this.targets[this.userId] = { x: clamp(p.x + ux * 44, 14, 256), y: clamp(p.y + uy * 44, 12, 388) };
    } else if (this.ball.owner === this.userId) {
      this.targets[this.userId] = { x: p.x, y: p.y }; // on the ball, no input → hold
    }
  }

  kickOff(conceding: Team) {
    for (const id of this.ids) {
      const p = this.players[id];
      p.x = p.hx; p.y = p.hy; p.vx = 0; p.vy = 0;
    }
    this.ball.x = 135; this.ball.y = 200; this.ball.vx = 0; this.ball.vy = 0; this.ball.height = 0;
    this.ball.target = null; this.ball.intBy = null; this.ball.lofted = false; this.loftDur = 0;
    this.possession = conceding;
    this.ball.owner = (conceding === "gold" ? this.goldIds : this.blueIds)[2]; // a central defender
    this.passCd = 0.8;
    this.lastFrom = null;
    this.counterT = 0; this.counterTeam = null; // a restart is never a counter
    this.restart = null;
    this.endTrap(); // cold placement — the restart choreography owns the ball
  }
  // A goal does NOT teleport everyone back to their spots — the ball is placed dead on
  // the centre spot, both teams JOG back into shape, the conceding side's taker walks
  // over, and after the setup beat the kick-off is taken. (resetMatch/ctor still use the
  // instant kickOff, which is correct for a cold start.)
  private stageKickoff(conceding: Team) {
    // the ball STAYS where it lies (in the net) — the taker fetches it and carries it to
    // the centre spot, so the reset visibly travels instead of teleporting (see restartLogic)
    this.ball.vx = 0; this.ball.vy = 0; this.ball.height = 0;
    this.ball.owner = null; this.ball.target = null; this.ball.intBy = null; this.ball.lofted = false; this.loftDur = 0;
    this.ballIsShot = false; this.shotIsGoal = false; this.carrying = false;
    this.possession = conceding;
    this.counterT = 0; this.counterTeam = null;
    this.lastFrom = null;
    // in a user-controlled game never hand the fetch to the human's player — the cinematic
    // walk is AI business (the human's steering is field-clamped and can't reach the net)
    const taker =
      this.nearestOfTeam(conceding, this.ball.x, this.ball.y, conceding === this.userTeam ? this.userId : null) ??
      this.mates(conceding)[0];
    this.restart = { kind: "kickoff", t: 2.0, x: 135, y: 200, taker, carry: "fetch" };
  }
  // Dead-ball housekeeping: the ball sits ON the restart spot while the taker walks over;
  // once the setup beat has passed AND the taker has arrived, the restart is taken (with a
  // failsafe so a straggling taker can never freeze the match).
  private restartLogic(dt: number) {
    const r = this.restart!;
    const tk = this.players[r.taker];
    this.ball.vx = 0; this.ball.vy = 0; this.ball.height = 0;
    this.ball.owner = null; this.ball.target = null; this.ball.intBy = null; this.ballIsShot = false; this.shotIsGoal = false;
    r.t -= dt;
    // ---- kickoff fetch/carry: the ball visibly travels from the net to the spot ----
    if (r.carry === "fetch") {
      // ball sits dead where it lies while the taker jogs over to collect it. Radius 9 (not 6):
      // a scored ball rests INSIDE the net, past the pitch clamp the taker walks under — from the
      // closest legal standing spot he must still be able to reach in and collect it.
      if (dist(tk.x, tk.y, this.ball.x, this.ball.y) < 9 || r.t < -6) r.carry = "carrying";
      return;
    }
    if (r.carry === "carrying") {
      // ball rolled along at the jogging taker's feet toward the centre spot
      this.ball.x = tk.x; this.ball.y = tk.y + Math.sign(r.y - tk.y || 1) * 3;
      if (dist(tk.x, tk.y, r.x, r.y) < 5 || r.t < -10) {
        r.carry = undefined;
        this.ball.x = r.x; this.ball.y = r.y;
        r.t = Math.max(r.t, 0.9); // guaranteed dead-ball beat on the spot before it's taken
        this.msg = "Kick-off"; this.msgT = 1.4;
      }
      return;
    }
    this.ball.x = r.x; this.ball.y = r.y;
    const near = dist(tk.x, tk.y, r.x, r.y) < 9;
    const ready=r.kind!=='kickoff'||this.ids.every(id=>{if(id===r.taker)return true;const p=this.players[id];return (p.team==='gold'?p.y>=201:p.y<=199)&&(p.team===tk.team||dist(p.x,p.y,135,200)>=25);});
    if (ready && ((r.t <= 0 && near) || (r.kind!=='kickoff'&&r.t < -4))) {
      this.ball.owner = r.taker;
      this.possession = tk.team;
      this.endTrap(); // restart take is its own choreography — no trap (dribbleBall still eases the pickup)
      this.protect = 0.5; this.passCd = 0.35; this.lastFrom = null; this.hold = 0;
      this.counterT = 0; this.counterTeam = null; // a restart is never a counter
      this.restart = null;
    }
  }

  private nearestFoe(id: string, x: number, y: number) {
    const p = this.players[id];
    let bd = Infinity;
    let best: SimPlayer | null = null;
    for (const fid of this.foes(p.team)) {
      const f = this.players[fid];
      if (f.isGK) continue;
      const d = dist(f.x, f.y, x, y);
      if (d < bd) { bd = d; best = f; }
    }
    return best ? { p: best, d: bd } : null;
  }
  private nearestOfTeam(team: Team, x: number, y: number, except: string | null = null) {
    let bd = Infinity;
    let best: string | null = null;
    for (const id of this.mates(team)) {
      if (this.players[id].isGK || id === except) continue;
      const d = dist(this.players[id].x, this.players[id].y, x, y);
      if (d < bd) { bd = d; best = id; }
    }
    return best;
  }

  // penetrating pass: a forward, open, un-blocked option (progresses the attack)
  private bestPass(fromId: string): string | null {
    const from = this.players[fromId];
    const gy = this.atkGoalY(from.team);
    let best: string | null = null;
    let bestScore = -Infinity;
    for (const id of this.mates(from.team)) {
      if (id === fromId || id === this.lastFrom) continue;
      const t = this.players[id];
      if (t.isGK) continue;
      if (this.isOffside(from.team, t.y)) continue; // never play a team-mate into an offside position
      const d = dist(from.x, from.y, t.x, t.y);
      if (d < 12 || d > 195) continue;
      const forward = Math.abs(from.y - gy) - Math.abs(t.y - gy);
      if (forward < 5) continue;
      const nf = this.nearestFoe(id, t.x, t.y);
      const open = nf ? nf.d : 40;
      let blocked = false;
      for (const fid of this.foes(from.team)) {
        const f = this.players[fid];
        if (f.isGK) continue;
        if (dist(f.x, f.y, from.x, from.y) < 10) continue; // the presser on my toes doesn't shadow the lane — I play it past him
        if (segDist(f.x, f.y, from.x, from.y, t.x, t.y) < this.T.laneReq) { blocked = true; break; }
      }
      if (blocked || open < this.T.openReq) continue; // only play it to a genuinely open man in a clear lane
      // favour progressing to the NEAREST forward option (build through the lines),
      // not hoofing it to the furthest man — hence the distance penalty vs forward reward
      const score = open * 1.1 + forward * 0.6 - d * 0.14 + this.rng() * 7;
      if (score > bestScore) { bestScore = score; best = id; }
    }
    return best;
  }
  // 11v11 only: a lofted ball OVER the top — a longer diagonal to a forward-breaking team-mate
  // that flies through the air (no ground interception). Onside only.
  private bestLoft(fromId: string): string | null {
    const from = this.players[fromId];
    const gy = this.atkGoalY(from.team);
    let best: string | null = null;
    let bestScore = -Infinity;
    for (const id of this.mates(from.team)) {
      if (id === fromId || id === this.lastFrom) continue;
      const t = this.players[id];
      if (t.isGK) continue;
      if (this.isOffside(from.team, t.y)) continue;
      const d = dist(from.x, from.y, t.x, t.y);
      if (d < 90 || d > 300) continue;                    // long balls only
      const forward = Math.abs(from.y - gy) - Math.abs(t.y - gy);
      if (forward < 55) continue;                          // must gain serious ground
      const nf = this.nearestFoe(id, t.x, t.y);
      const open = nf ? nf.d : 40;
      if (open < 9) continue;                              // land it into space, not a crowd
      const score = open * 1.0 + forward * 0.5 - d * 0.05 + this.rng() * 6;
      if (score > bestScore) { bestScore = score; best = id; }
    }
    return best;
  }
  // keep-ball pass: prefer an OPEN team-mate, but with a strong FORWARD/lateral bias so
  // possession is worked UP the pitch (build-up), not endlessly recycled to the keeper.
  private safePass(fromId: string): string | null {
    const from = this.players[fromId];
    const gy = this.atkGoalY(from.team);
    // overload read: when the carrier's zone is crowded with defenders, the far side of
    // the pitch is free — weight a cross-field SWITCH up so the team visibly plays out
    // of the overload instead of banging it into the wall in front of them.
    let crowd = 0;
    for (const fid of this.foes(from.team)) { const f = this.players[fid]; if (!f.isGK && dist(f.x, f.y, from.x, from.y) < 80) crowd++; }
    const overloaded = crowd >= this.T.switchAt;
    let best: string | null = null;
    let bestScore = -Infinity;
    for (const id of this.mates(from.team)) {
      if (id === fromId) continue;
      const t = this.players[id];
      if (this.isOffside(from.team, t.y)) continue; // don't recycle into an offside team-mate either
      const d = dist(from.x, from.y, t.x, t.y);
      if (d < 12 || d > 150) continue;
      const nf = this.nearestFoe(id, t.x, t.y);
      const open = nf ? nf.d : 40;
      let blocked = false;
      for (const fid of this.foes(from.team)) {
        const f = this.players[fid];
        if (f.isGK) continue;
        if (dist(f.x, f.y, from.x, from.y) < 10) continue; // a presser at arm's length doesn't shadow the lane
        if (segDist(f.x, f.y, from.x, from.y, t.x, t.y) < this.T.laneReq) { blocked = true; break; }
      }
      // forward = how much closer to the opponent goal the receiver is (negative = backward)
      const forward = Math.abs(from.y - gy) - Math.abs(t.y - gy);
      const score =
        open * 1.25 +
        forward * 0.42 + // gentle progression bias — prefer forward/lateral over backward
        (forward < -12 ? -32 : 0) + // penalise a big backward pass
        (blocked ? -60 : 20) -
        d * 0.16 + // prefer a nearer team-mate (short build-up, not a long ball)
        (overloaded && Math.abs(t.x - from.x) > 78 ? 34 : 0) + // escape the overload — switch it
        (id === this.lastFrom ? -45 : 0) +
        (t.isGK ? -50 : 0) + // only go back to the keeper as a last resort
        this.rng() * 6;
      if (score > bestScore) { bestScore = score; best = id; }
    }
    return best;
  }

  private launch(fromId: string, tx: number, ty: number, speed: number, height: number, target: string | null, loft = 0) {
    const from = this.players[fromId];
    this.passRelease=target?{id:fromId,x:from.x,y:from.y,tx,ty,target}:null;
    const dx = tx - from.x;
    const dy = ty - from.y;
    const L = Math.hypot(dx, dy) || 1;
    this.ball.x = from.x; this.ball.y = from.y; this.ball.height = height;
    this.ball.vx = (dx / L) * speed; this.ball.vy = (dy / L) * speed;
    this.ball.owner = null;
    this.endTrap(); // ball leaves the foot — any in-progress first touch is over
    this.ball.target = target;
    this.ball.intBy = null;
    this.ballIsShot = false; this.shotIsGoal = false;
    this.lastFrom = fromId;
    this.ballFlight = 0.16; // in flight — the passer can't instantly re-collect it
    // lofted ball: arc its height over the flight (see step) so it clears the defenders
    this.ball.lofted = loft > 0;
    if (loft > 0) { this.loftPeak = loft; this.loftT = 0; this.loftDur = Math.max(0.55, L / (speed * 0.72)); }
    else { this.loftDur = 0; }
    from.kick = 1;
  }
  // a lofted ball over the top — flies through the air (no ground interception), arcs down
  // to a forward runner. Used only in 11v11 (bigger field).
  private doLoft(fromId: string, toId: string) {
    const from = this.players[fromId];
    const t = this.players[toId];
    const dir = this.dirY(from.team);
    const tx = t.x;
    const ty = t.y + dir * 14; // lead the run — the ball drops in ahead of them
    const D = dist(from.x, from.y, tx, ty);
    const speed = clamp(D * 1.5 + 165, 250, 430);
    this.launch(fromId, tx, ty, speed, 0, toId, 4.4); // peak ~4.4 units — clears the defence
    this.passCd = 0.5;
    this.stats.passes++;
    this.lastOwner = fromId;
  }
  // firm: pass pace multiplier — >1 is a driven/hard ball, <1 is a gentle roll-in.
  private doPass(fromId: string, toId: string, firm = 1) {
    const from = this.players[fromId];
    const t = this.players[toId];
    const dir = this.dirY(from.team);
    // NB: offside is respected by NOT selecting offside receivers (bestPass/safePass filter) —
    // a turnover-call here proved too disruptive to balance, so the AI just plays onside.
    // pressure at the moment of release — a pressured player can misplace the pass,
    // which is the main STEADY source of turnovers (self-limiting: no pressure → accurate)
    const nf = this.nearestFoe(fromId, from.x, from.y);
    const pressure = nf ? nf.d : 99;
    let ox = 0;
    let oy = 0;
    // a player who just won the ball (protect>0) has steadied it → clean pass;
    // otherwise pressure can misplace it (self-limiting turnover source)
    if (pressure < P.pressDist && this.protect <= 0) {
      const err = (P.pressDist - pressure) / P.pressDist; // 0 (edge) .. 1 (right on top)
      if (this.rng() < err * 0.18 * this.T.misplace * this.fairMul) { // fairness: long monopolies get sloppier
        ox = (this.rng() * 2 - 1) * err * 11;
        oy = (this.rng() * 2 - 1) * err * 11;
      }
    }
    const tx = t.x + ox;
    const ty = t.y + dir * 5 + oy; // lead the runner a touch
    // weight the pass so it ARRIVES at the receiver's feet; firmness varies the pace so
    // driven balls zip in flat while recycles roll in gently (still reaches the target)
    const D = dist(from.x, from.y, tx, ty);
    const speed = clamp((D * 1.68 + 134) * firm * this.passMul, 210 * this.passMul, 346 * this.passMul); // zips — well faster than any runner (futsal quicker); slight global bump
    const height = 0; // passes stay along the ground — the pace (firm) conveys the weight
    // Completion is decided ONCE here from how open the lane is (not a per-frame
    // lottery over the whole flight, which was killing pass completion). A defender
    // sitting in the passing lane may pick it off; otherwise the pass reaches its man.
    let laneDef: SimPlayer | null = null;
    let laneD = Infinity;
    for (const fid of this.foes(from.team)) {
      const f = this.players[fid];
      if (f.isGK) continue;
      if (dist(f.x, f.y, from.x, from.y) < 8) continue; // the presser is beaten by the release — reads happen DOWN the lane
      const d = segDist(f.x, f.y, from.x, from.y, tx, ty);
      if (d < laneD) { laneD = d; laneDef = f; }
    }
    let intercepted = false;
    const laneW = 4 * this.T.lane; // how far off the lane a defender can still read it (format feel)
    if (laneDef && laneD < laneW) {
      // a defender who's read the lane can cut it out; a driven/risky ball (firm > 1) is
      // easier to read than a gentle recycle — most passes still complete
      const risk = clamp(0.22 + (firm - 1) * 0.18, 0.1, 0.38);
      const pInter = clamp(risk - (laneD / laneW) * risk, 0, risk);
      if (this.rng() < pInter) intercepted = true;
    }
    if (intercepted && laneDef) {
      // ball is played into the defender who reads it — visibly travels to them
      this.launch(fromId, laneDef.x, laneDef.y, speed * 0.92, height, null);
      this.ball.intBy = laneDef.id;
    } else {
      this.launch(fromId, tx, ty, speed, height, toId);
    }
    this.passCd = 0.48;
    this.stats.passes++;
  }
  private doShot(fromId: string) {
    const from = this.players[fromId];
    const gy = this.atkGoalY(from.team);
    // Outcome is decided AT THE STRIKE (same philosophy as passes): an xG from range and
    // angle picks goal / saved / wide, then the ball is placed to SELL that outcome —
    // a goal arrows for the corner with the keeper reading it late, a save is hit close
    // enough for a set keeper, a miss rolls just wide and restarts with the other team.
    const distGoal = dist(from.x, from.y, 135, gy);
    const angle = Math.abs(from.x - 135);
    const xg = clamp(0.34 - (distGoal - 28) * 0.0035, 0.05, 0.34) * clamp(1.15 - angle / 60, 0.35, 1) * this.T.finish;
    const roll = this.rng();
    const side = this.rng() < 0.5 ? -1 : 1;
    let aimx: number;
    this.shotIsGoal = roll < xg;
    if (this.shotIsGoal) this.stats.decided++; // decided-at-strike goals (leak telemetry: must equal goals scored by AI)
    this.stats.xgSum += xg; // shot-quality telemetry (avg chance quality = xgSum / shots)
    if (roll < xg) {
      aimx = 135 + side * GHALF * (0.88 + this.rng() * 0.11); // right in the corner — past the dive
      this.shotRead = 20; // keeper picks it up far too late
    } else if (roll < xg + 0.3) {
      aimx = 135 + side * GHALF * (1.2 + this.rng() * 0.42); // dragged wide — far enough that some run OUT (goal kick), not always gathered
      this.shotRead = 150; // keeper watches it past the post
    } else {
      aimx = 135 + side * GHALF * this.rng() * 0.55; // too close to the keeper
      this.shotRead = 170; // read early, gathered
    }
    // struck hard enough to BEAT the roll decay from this range — friction bleeds speed
    // linearly with distance (v_end = v0 − friction·d), so pace scales with range or a
    // long "shot" crawls its last metres and gets calmly gathered.
    // (~20% over the original 3.4/230/390 tuning so strikes FEEL struck — flight-time
    // percentiles verified with scratchpad shotpace.mjs, balance with scripts/simavg.mjs)
    let spd = clamp(distGoal * 4.1, 275, 460) * (0.95 + this.rng() * 0.12);
    // a DECIDED goal must physically reach the net: guarantee enough pace that friction
    // (linear in distance) still leaves ~75 u/s at the line — else long-range "goals"
    // died 2 units short and were quietly demoted to loose balls (the goal leak)
    if (this.shotIsGoal) spd = Math.max(spd, dist(from.x, from.y, aimx, gy) * P.friction + 75);
    this.launch(fromId, aimx, gy, spd, 1.0, null);
    this.ballIsShot = true;
    this.shotIsGoal = roll < xg; // re-assert AFTER launch() wipes flight state
    this.shotAim = { x: aimx, y: gy }; // remembered so a decided goal can be re-steered if it ever stalls
    this.passCd = 0.65;
    this.stats.shots++;
    if (from.team === "gold") this.stats.shotsGold++; else this.stats.shotsBlue++;
    this.msg = "Shot!"; this.msgT = 1.0;
  }
  // the human's shot — a driven, corner-placed rocket (aimed to the side the player is
  // facing) that flies flat and hard, so it beats the keeper and rips into the net.
  private doUserShot(fromId: string) {
    const from = this.players[fromId];
    const gy = this.atkGoalY(from.team);
    const side = this.userFace.x >= 0 ? 1 : -1; // place it toward the way you're aimed
    // tuck it right inside the post — wide enough that the keeper can't cover from centre
    const aimx = clamp(135 + side * GHALF * 0.9, 135 - GHALF * 0.95, 135 + GHALF * 0.95);
    // shot power (0..1): a tap places a firm shot, a full hold rips a rocket. Aim stays
    // assisted (corner) — only the pace scales, so shooting is accessible but expressive.
    const pw = clamp(this.userShootPower, 0, 1);
    // ~20% over the original (1.25 + 0.55·pw) so the human's strike rips too
    this.launch(fromId, aimx, gy, P.shotSpeed * (1.5 + 0.66 * pw), 0.5 + 0.6 * pw, null);
    this.ballIsShot = true;
    this.shotIsGoal = false; // no pre-decided outcome for the human
    this.shotRead = 80; // the keeper reads a human strike honestly — placement & power decide it
    this.ballFlight = 0.05; // barely any keep-out — it's a strike, not a lay-off
    this.passCd = 0.65;
    this.stats.shots++;
    if (from.team === "gold") this.stats.shotsGold++; else this.stats.shotsBlue++;
    this.msg = "Shot!"; this.msgT = 1.0;
  }
  private doClear(fromId: string) {
    const from = this.players[fromId];
    const gy = this.atkGoalY(from.team);
    this.launch(fromId, from.x + this.rng() * 40 - 20, gy, P.clearSpeed, 0.7, null);
    this.passCd = 0.4;
  }

  step(dt: number) {
    // Substep big deltas: BabylonStage now hands us WALL-CLOCK time (a throttled tab can
    // deliver 0.1s+ frames). Euler ball flight at that dt tunnels past control radii and
    // the goal mouth, so integrate in <=1/30s slices — identical maths at any frame rate.
    while (dt > 0.034) { this.stepOnce(0.034); dt -= 0.034; }
    if (dt > 0) this.stepOnce(dt);
  }
  private stepOnce(dt: number) {
    this.stats.time += dt;

    // ---- goal celebration: ball dead in the net, but NOBODY freezes mid-stride ----
    // the scorer wheels away, his nearest team-mates converge to celebrate, and the
    // conceding side starts its jog back into shape — then the staged kick-off begins.
    if (this.goalHold > 0) {
      this.goalHold -= dt;
      this.msgT -= dt;
      // heavy decel so the ball nestles into the back of the net and stops there
      const fr = Math.max(0, 1 - 7 * dt);
      this.ball.vx *= fr; this.ball.vy *= fr;
      this.ball.x = clamp(this.ball.x + this.ball.vx * dt, 120, 150);
      this.ball.y = this.goalNet === "top"
        ? clamp(this.ball.y + this.ball.vy * dt, GY_TOP - 5, GY_TOP)
        : clamp(this.ball.y + this.ball.vy * dt, GY_BOT, GY_BOT + 5);
      this.ball.height = Math.max(0, this.ball.height - dt * 1.5);
      this.ballImpact = Math.max(0, this.ballImpact - dt * 1.6);
      for (const id of this.ids) if (this.players[id].kick > 0) this.players[id].kick = Math.max(0, this.players[id].kick - dt / 0.45);
      const scoringTeam: Team = this.goalNet === "top" ? "gold" : "blue";
      const scorer = this.scorerId && this.players[this.scorerId]?.team === scoringTeam ? this.players[this.scorerId] : null;
      // the 3 team-mates nearest the scorer run in to mob him
      const huggers = new Set<string>();
      if (scorer) {
        this.mates(scoringTeam)
          .filter((id) => id !== scorer.id && !this.players[id].isGK)
          .sort((a, b) => dist(this.players[a].x, this.players[a].y, scorer.x, scorer.y) - dist(this.players[b].x, this.players[b].y, scorer.x, scorer.y))
          .slice(0, 3)
          .forEach((id) => huggers.add(id));
      }
      const fade = clamp(this.goalHold / 1.8, 0, 1); // celebration run decays as the beat ends
      for (const id of this.ids) {
        const p = this.players[id];
        let tx = p.hx; let ty = p.hy; // everyone else begins the jog back to shape
        if (scorer && id === scorer.id) {
          // wheel away toward the near touchline, decelerating as the beat closes
          tx = p.x + (p.x >= 135 ? 1 : -1) * 34 * fade;
          ty = p.y + (scoringTeam === "gold" ? 26 : -26) * fade;
        } else if (scorer && huggers.has(id)) {
          tx = scorer.x + (p.x >= scorer.x ? 7 : -7);
          ty = scorer.y + (p.y >= scorer.y ? 5 : -5);
        }
        this.targets[id] = { x: clamp(tx, 14, 256), y: clamp(ty, 12, 388) };
      }
      this.presserId = null; this.chaserIds.clear();
      this.integrate(dt);
      if (this.goalHold <= 0) { const conceding: Team = this.goalNet === "top" ? "blue" : "gold"; this.goalNet = null; this.stageKickoff(conceding); }
      return;
    }

    // ---- match arc & fatigue ----
    // one attract "match" is ~4 minutes: fresh legs in the opening, a lull past the hour
    // mark, and — when the score is close — an urgent finale; then the cycle renews.
    // legsMul only nudges AI top speed a few percent, and tired legs also bias the
    // decision-making toward safer passes (see ballLogic).
    const mt = this.stats.time % 240;
    this.fatigue = mt / 240;
    const closeGame = Math.abs(this.score.gold - this.score.blue) <= 1;
    let arc = 1;
    if (mt < 35) arc = 1 + 0.03 * (1 - mt / 35); // energetic opening
    else if (mt > 95 && mt < 165) arc = 0.985; // mid-match lull
    else if (mt > 185 && closeGame) arc = 1 + 0.025 * Math.min(1, (mt - 185) / 25); // urgent finale
    this.legsMul = arc * (1 - this.fatigue * 0.05);
    // tempoMul makes the same arc audible in the EVENTS, not just the legs: shot appetite
    // and release speed rise in the opening/finale and sag through the lull.
    this.tempoMul = mt < 30 ? 1.3 : mt > 95 && mt < 165 ? 0.8 : mt > 185 && closeGame ? 1.35 : 1;

    // possession-fairness pressure: past ~18s of uninterrupted possession, misplaced
    // passes and won tackles become up to ~1.9x likelier — monopolies break themselves.
    if (this.possession !== this.fairT) { this.fairT = this.possession; this.possT = 0; }
    this.possT += dt;
    this.fairMul = 1 + clamp((this.possT - 18) / 30, 0, 1) * 0.9;

    // stalemate clock: ball living in the middle third (no restart pending)
    if (this.ball.y > 133 && this.ball.y < 266 && !this.restart) this.midT += dt; else this.midT = 0;

    this.passCd -= dt;
    this.msgT -= dt;
    if (this.protect > 0) this.protect -= dt;
    if (this.counterT > 0) this.counterT -= dt; // the counter window closes as the defence recovers
    for (const id of this.ids) if (this.players[id].kick > 0) this.players[id].kick = Math.max(0, this.players[id].kick - dt / 0.45);

    // hold timer
    if (this.ball.owner && this.ball.owner === this.lastOwner) this.hold += dt;
    else this.hold = 0;
    this.lastOwner = this.ball.owner;

    if (this.possession === "gold") this.stats.possGold += dt; else this.stats.possBlue += dt;

    if (this.userTeam) this.updateUserPlayer();
    // who a Pass would go to right now (for the on-field receiver indicator)
    this.passTargetId = this.userTeam && this.userId && this.ball.owner === this.userId
      ? (this.userPassTarget(this.userId) ?? this.bestPass(this.userId) ?? this.safePass(this.userId))
      : null;
    if (this.restart) this.restartLogic(dt);
    else this.ballLogic(dt);
    this.updateShape(dt); // team line heights first (the shared prior)…
    this.brainLogic(dt); // …then each player's throttled individual read of it
    this.computeTargets(dt);
    if (this.userTeam) this.applyUserTarget();
    this.integrate(dt);
    // input buffering: an action pressed just before you can act is held for a short window
    // so it fires the instant it's legal (instead of being dropped).
    this.shootBuf -= dt; this.actBuf -= dt; this.throughBuf -= dt;
    if (this.ball.owner !== this.userId) {
      if (this.shootBuf <= 0) this.userShoot = false;
      if (this.actBuf <= 0) this.userAct = false;
      if (this.throughBuf <= 0) this.userThrough = false;
    }
  }

  // ---- carry telemetry ----
  // bank the current carry episode: only a sustained drive (>= 15 units) counts as a
  // "carry" in the stats — a half-step shuffle before a pass isn't a dribble.
  private bankCarry() {
    if (this.carryAcc >= 15) { this.stats.carries++; this.stats.carryDist += this.carryAcc; }
    this.carryAcc = 0; this.carryOwner = null;
  }
  // how much open grass lies in the forward corridor ahead of the carrier (toward the
  // opponent goal): distance to the nearest opponent inside a ~30-unit-wide lane, capped
  // at 45 — the "is the lane genuinely open?" read that invites a dribble.
  private openLaneLen(id: string): number {
    const o = this.players[id];
    const dir = this.dirY(o.team);
    let lane = 45;
    for (const fid of this.foes(o.team)) {
      const f = this.players[fid];
      if (f.isGK) continue;
      const fwdD = (f.y - o.y) * dir;
      if (fwdD < -2) continue; // behind — beaten already
      if (Math.abs(f.x - o.x) < 15 && fwdD < lane) lane = Math.max(0, fwdD);
    }
    return lane;
  }
  // last-man read: never dribble around in front of your own goal — if no outfield
  // team-mate is goal-side of the carrier while the ball is still in the defensive
  // half-and-a-bit, losing the carry means a clean run on the keeper. Carry is off.
  private lastManRisk(id: string): boolean {
    const o = this.players[id];
    const ownD = this.depth(o.team, o.y);
    if (ownD > 170) return false; // past the middle third — a lost carry isn't fatal
    for (const mid of this.mates(o.team)) {
      if (mid === id) continue;
      const m = this.players[mid];
      if (m.isGK) continue;
      if (this.depth(o.team, m.y) < ownD - 2) return false; // cover exists behind me
    }
    return true;
  }

  // ---- reception quality (the trap layer) ----
  // Called at every moment a player takes CONTROL in open play: pass received, pass
  // intercepted, loose ball picked up, tackle won. Seeds the cushion window that
  // dribbleBall() then plays out over ~0.14-0.42s — the ball arrives with momentum,
  // gets cushioned, and settles slightly AHEAD of the receiver in his stride, on the
  // chosen receiving foot. Keepers use their hands, so their claims stay immediate.
  // `tight` (the human's player) takes a shorter, closer touch — control feel matters.
  private startTrap(id: string) {
    const p = this.players[id];
    this.ball.lofted = false; this.loftDur = 0;
    const bvx = this.ball.vx, bvy = this.ball.vy;
    this.ball.vx = 0; this.ball.vy = 0;
    if (p.isGK) { this.trapT = 0; this.recv.id = null; this.recv.t = 0; return; } // hands — caught clean, no trap
    const inSp = Math.hypot(bvx, bvy); // pace still on the arriving ball
    const tight = id === this.userId;
    // next-action direction: take it in STRIDE — the receiver's own movement first,
    // else his attacking direction (a standing player still plays it slightly in front)
    let ux = p.vx, uy = p.vy;
    const mv = Math.hypot(ux, uy);
    if (mv > 12) { ux /= mv; uy /= mv; } else { ux = 0; uy = this.dirY(p.team); }
    if(!tight){
      const direction=firstTouchDirection(p,{x:ux,y:uy},this.foes(p.team).map(id=>this.players[id]));
      ux=direction.x;uy=direction.y;
    }
    // where the ball CAME from (unit) — degenerate (tackle/steal, ball already dead) →
    // treat it as arriving from ahead so the geometry below still resolves
    let ax = -bvx, ay = -bvy;
    const al = Math.hypot(ax, ay);
    if (al > 1) { ax /= al; ay /= al; } else { ax = ux; ay = uy; }
    // ---- body shape: open the hips toward the bisector of (ball origin, next action) ----
    let fx = ax + ux, fy = ay + uy;
    const fl = Math.hypot(fx, fy);
    if (fl > 0.2) { fx /= fl; fy /= fl; } else { fx = ux; fy = uy; } // opposed vectors → face the next action
    // ---- receiving foot ----
    // coaching standard: let the ball run ACROSS the body onto the far/back foot (opens
    // the field); near-foot trap only when a presser is right on his back. With y-down
    // field coords, the player's right-hand side (facing fx,fy) is (-fy, fx).
    const rx = -fy, ry = fx;
    const fromRight = ax * rx + ay * ry > 0; // ball approaching his right side
    let foot: "L" | "R" = fromRight ? "L" : "R"; // far foot, across the body
    const nf = this.nearestFoe(id, p.x, p.y);
    const pressedBehind = !!nf && nf.d < P.pressDist * 0.8 &&
      (nf.p.x - p.x) * fx + (nf.p.y - p.y) * fy < 0; // presser is BEHIND the open shape
    if (pressedBehind) foot = fromRight ? "R" : "L"; // shield it — near-foot trap
    // ---- touch weight ----
    // firmer arriving ball + tired legs + a lapsing mind = heavier touch that pops
    // further out for a beat before control tightens (never for the human's tight touch)
    const pace = clamp(inSp / 340, 0, 1);
    const lapse = (this.brain[id]?.lapse ?? 0) > 0 ? 1 : 0;
    const heavy = pace * 0.6 + this.fatigue * 0.25 + lapse * 0.5;
    let ahead = (2 + Math.min(3, mv / 28)) * (tight ? 0.8 : 1); // in-stride 2..5, tighter for the human
    let dur = 0.14 + pace * (tight ? 0.1 : 0.16); // cushion ~0.14-0.3s
    if (!tight && this.rng() < heavy * 0.3) {
      ahead = 6 + this.rng() * 2; // a heavy touch — out to ~6-8 units
      dur = 0.3 + this.rng() * 0.12;
    }
    // settle point: ahead along the stride, landed on the receiving foot's side
    const fs = foot === "R" ? 1 : -1;
    this.touchX = ux * ahead + rx * fs * 1.3;
    this.touchY = uy * ahead + ry * fs * 1.3;
    this.trapDur = this.trapT = dur;
    // keep a share of the arriving momentum through the cushion (capped so a rocket
    // pass can't carry the ball straight through the receiver)
    const keep = inSp > 0 ? Math.min(1, 110 / inSp) * 0.55 : 0;
    this.trapVX = bvx * keep; this.trapVY = bvy * keep;
    // expose the reception read (mutate in place — zero allocations)
    this.recv.id = id; this.recv.t = dur; this.recv.dur = dur;
    this.recv.foot = foot; this.recv.faceX = fx; this.recv.faceY = fy;
  }
  // cancel any in-progress trap (ball released / dead-ball placement owns the ball)
  private endTrap() {
    this.trapT = 0;
    this.recv.id = null; this.recv.t = 0;
  }
  // ---- ball-at-feet attachment (replaces the old hard snap) ----
  // While trapping: bleed the residual momentum hard (the cushioning foot) and ease the
  // ball toward the settle point, whose touch bias relaxes as control tightens. Once
  // controlled: fast-but-continuous smoothing toward the dribble spot, so ownership
  // changes and direction changes never teleport the ball. A distance failsafe snaps
  // only if the ball somehow trails absurdly far (it shouldn't).
  private dribbleBall(o: SimPlayer, dir: number, dt: number) {
    const fx = o.x, fy = o.y + dir * 4; // the classic dribble spot at his feet
    if (this.trapT > 0 && this.recv.id === o.id) {
      this.trapT -= dt;
      this.recv.t = Math.max(0, this.trapT);
      if (this.trapT <= 0) { this.recv.id = null; }
      const cushion = Math.exp(-9*dt); // hard decel — momentum dies in ~0.1s
      this.trapVX *= cushion; this.trapVY *= cushion;
      this.ball.x += this.trapVX * dt;
      this.ball.y += this.trapVY * dt;
      const q = this.trapDur > 0 ? clamp(this.trapT / this.trapDur, 0, 1) : 0;
      const tx = clamp(fx + this.touchX * q, 9, 261);
      const ty = clamp(fy + this.touchY * q, 5, 395);
      const k = 1-Math.exp(-dt/.11);
      this.ball.x += (tx - this.ball.x) * k;
      this.ball.y += (ty - this.ball.y) * k;
    } else {
      if (this.trapT > 0) this.endTrap(); // owner changed mid-trap (tackle) — stale trap dies
      const k = 1-Math.exp(-dt/.05); // attached: tight, continuous tracking
      this.ball.x += (fx - this.ball.x) * k;
      this.ball.y += (fy - this.ball.y) * k;
    }
    if (dist(this.ball.x, this.ball.y, fx, fy) > 16) { this.ball.x = fx; this.ball.y = fy; this.endTrap(); }
    this.ball.height = this.ball.height > 0 ? Math.max(0, this.ball.height - dt * 3) : 0;
    this.ball.vx = 0; this.ball.vy = 0;
  }

  private ballLogic(dt: number) {
    let owner = this.ball.owner;

    // ---- HUMAN manual tackle (space while an opponent has the ball) ----
    // A lunge: if the controlled player is right on the carrier, a good chance to win it.
    if (this.userAct && this.userTeam && this.userId && owner && this.players[owner].team !== this.userTeam) {
      this.userAct = false;
      const u = this.players[this.userId], o = this.players[owner];
      if (dist(u.x, u.y, o.x, o.y) < P.tackleDist + 2.5 && this.protect <= 0 && this.rng() < 0.82) {
        this.ball.owner = this.userId; this.possession = this.userTeam;
        this.startTrap(this.userId); // won ball eases across, not a teleport (tight — human touch)
        this.passCd = 0.45; this.protect = P.protectTime; this.lastFrom = null;
        this.startCounter(this.userTeam); // won it in open play → break fast
        this.stats.turnovers++; this.msg = "Tackle won!"; this.msgT = 0.9;
        owner = this.ball.owner; // the human now has it — fall into the on-ball branch below
      }
    }

    if (owner) {
      const o = this.players[owner];
      const dir = this.dirY(o.team);
      this.dribbleBall(o, dir, dt);
      // carry telemetry: accumulate the live drive; bank the episode when it ends
      if (this.carrying && !o.isGK) {
        if (this.carryOwner !== owner) { this.bankCarry(); this.carryOwner = owner; }
        this.carryAcc += Math.hypot(o.vx, o.vy) * dt;
      } else if (this.carryAcc > 0) this.bankCarry();

      // ---- HUMAN on the ball: no AI auto-pass/shoot; the user drives it manually ----
      if (owner === this.userId) {
        this.carrying = false;
        const nfu = this.nearestFoe(owner, o.x, o.y);
        if (this.userShoot) {
          this.userShoot = false; this.userAct = false; this.userThrough = false;
          this.doUserShot(owner);
        } else if (this.userThrough) {
          this.userThrough = false; this.userAct = false;
          // a driven through-ball: hardest pass, aimed where you're facing / the best forward
          const tgt = this.userPassTarget(owner) ?? this.bestPass(owner) ?? this.safePass(owner) ?? this.nearestOfTeam(o.team, o.x, o.y, owner);
          if (tgt) this.doPass(owner, tgt, 1.5);
        } else if (this.userAct) {
          this.userAct = false;
          // pass where the player is aimed first; fall back to an AI pick if nobody's there
          const tgt = this.userPassTarget(owner) ?? this.bestPass(owner) ?? this.safePass(owner) ?? this.nearestOfTeam(o.team, o.x, o.y, owner);
          if (tgt) this.doPass(owner, tgt, 1.12);
        } else if (this.protect <= 0 && nfu && nfu.d < P.tackleDist && this.rng() < P.tackleChance * dt) {
          // a defender right on the user can still win it (keeps the game a challenge)
          this.ball.owner = nfu.p.id; this.possession = nfu.p.team;
          this.startTrap(nfu.p.id); // the steal eases across to the winner's feet
          this.passCd = 0.45; this.protect = P.protectTime; this.lastFrom = null;
          this.startCounter(nfu.p.team);
          this.stats.turnovers++; this.msg = "Tackled!"; this.msgT = 0.9;
        }
        return; // skip the AI decision for the human's player
      }

      const atkGoalY = this.atkGoalY(o.team);
      const distGoal = dist(o.x, o.y, 135, atkGoalY);
      const angle = Math.abs(o.x - 135);
      const nf = this.nearestFoe(owner, o.x, o.y);
      const pressure = nf ? nf.d : 99;
      const pressured = pressure < P.pressDist;

      // is the lane toward goal clear enough to DRIVE into? (no defender just ahead)
      let clearAhead = true;
      for (const fid of this.foes(o.team)) {
        const f = this.players[fid];
        if ((f.y - o.y) * dir > 0 && dist(f.x, f.y, o.x, o.y) < 30 && Math.abs(f.x - o.x) < 22) { clearAhead = false; break; }
      }
      // point-blank chance — taken almost always
      const clearChance = !o.isGK && distGoal < 40 && angle < 24;
      // graded shooting instinct in the final third: closer + more central + a clear
      // sight of goal (few defenders in the shot lane) → higher chance to shoot. This
      // is what actually produces shots against a compact block.
      let shootChance = 0;
      const R = this.T.shotRange * this.persona[o.team].range; // small-sided games shoot from further out; the aggressor lets fly earlier
      if (!o.isGK && distGoal < R && angle < 50) {
        let laneBlockers = 0;
        for (const fid of this.foes(o.team)) {
          const f = this.players[fid];
          if (f.isGK) continue;
          if (segDist(f.x, f.y, o.x, o.y, 135, atkGoalY) < 7) laneBlockers++;
        }
        const closeF = clamp((R - distGoal) / R, 0, 1);
        const angleF = clamp((50 - angle) / 50, 0, 1);
        shootChance = (0.24 + closeF * 0.7 + angleF * 0.36) * (laneBlockers === 0 ? 1 : laneBlockers === 1 ? 0.62 : 0.18) * this.T.shoot * this.tempoMul; // arcs: eager early/late, shy in the lull
      }
      const canAct = this.passCd <= 0 || (pressured && this.passCd < 0.15) || this.hold > 1.6;

      // ---- GK on the ball: purposeful distribution ----
      // unpressed → a quick roll-out to an open team-mate keeps the build alive; pressed
      // (or nobody safe short) → go long: a lofted ball over the top in 11v11, else a
      // driven kick up the pitch. The keeper never dribbles upfield or shoots.
      if (o.isGK) {
        if (canAct) {
          this.carrying = false;
          // distribution is a philosophy read: a DIRECT side's keeper often skips the
          // short roll-out and launches it long (11v11 only, where the loft exists) —
          // often, not always, or the hoof-bleed hands the match to a patient opponent
          if (!pressured && !(this.allowLoft && this.persona[o.team].loft >= 2 && this.rng() < 0.55)) {
            const keep = this.safePass(owner);
            if (keep) { this.doPass(owner, keep, 0.9); return; }
          }
          const long = this.allowLoft ? this.bestLoft(owner) : null;
          if (long) { this.doLoft(owner, long); return; }
          const fwd = this.bestPass(owner);
          if (fwd) { this.doPass(owner, fwd, 1.28); return; }
          const keep2 = this.safePass(owner);
          if (keep2) { this.doPass(owner, keep2, 1.0); return; }
          this.doClear(owner);
        }
        return; // keepers hold with their hands — no tackle check while they set the play
      }

      // decision (Man-City progression: pass forward if on, else CARRY into space,
      // else recycle to keep it — shoot when a real sight of goal opens up)
      if (clearChance && (this.passCd <= 0 || pressured)) {
        this.carrying = false;
        this.doShot(owner);
      } else if (canAct && shootChance > 0 && this.rng() < shootChance) {
        // a sight of goal in the final third → shoot (comes before everything else)
        this.carrying = false;
        this.doShot(owner);
      } else if (canAct && this.protect > 0.12 && pressured && !clearChance) {
        // won it under pressure → deep in our own half, HOOF it clear to relieve the
        // press and push play back toward midfield (this is what breaks a team out of
        // being pinned); higher up, play it to a safe team-mate instead
        this.carrying = false;
        const keep = this.safePass(owner);
        if (keep) this.doPass(owner, keep, 1.02); else this.doClear(owner);
      } else if (canAct) {
        const ph = this.phaseOf(o.team); // build / progress / final / counter — sets the tempo
        // ---- STALEMATE BREAKER ----
        // ball has lived in the middle third 10s+ → the next action MUST be direct: a
        // ball over the top, a penetrating pass, a big switch, or failing all, a clearance
        if (this.midT > 10) {
          this.midT = 0;
          this.carrying = false;
          const long0 = this.allowLoft ? this.bestLoft(owner) : null;
          if (long0) { this.doLoft(owner, long0); return; }
          const fwd0 = this.bestPass(owner);
          if (fwd0) { this.doPass(owner, fwd0, 1.4); return; }
          // no runner free → switch it to the far side (or hoof clear of the stalemate)
          let far: string | null = null; let fd = -1;
          for (const mid of this.mates(o.team)) {
            if (mid === owner || this.players[mid].isGK || this.isOffside(o.team, this.players[mid].y)) continue;
            const dxx = Math.abs(this.players[mid].x - o.x);
            if (dxx > fd) { fd = dxx; far = mid; }
          }
          if (far && fd > 60) this.doPass(owner, far, 1.3); else this.doClear(owner);
          return;
        }
        let handled = false;
        // ---- engaged mid-carry: beat the man or release ----
        // a defender has stepped out to stop the drive. If he's ISOLATED (no second
        // defender covering near him) the carrier may knock it past him on the open
        // side and keep going — otherwise the engagement just opened a pass, so he
        // releases (the pressured pass chain below fires). A mistimed knock still
        // loses to the per-frame tackle roll — the built-in balance for taking men on.
        if (this.carrying && pressured && nf) {
          let iso = true;
          for (const fid of this.foes(o.team)) {
            const f = this.players[fid];
            if (f.isGK || f.id === nf.p.id) continue;
            if (dist(f.x, f.y, nf.p.x, nf.p.y) < 26) { iso = false; break; }
          }
          if (iso && this.rng() < 0.34 * this.persona[o.team].carry * (1 - this.fatigue * 0.3)) {
            // touch it past him on the open side — reuse the trap easing for the knock
            const side = (o.x - nf.p.x) >= 0 ? 1 : -1;
            this.trapDur = this.trapT = 0.22;
            this.trapVX = 0; this.trapVY = 0;
            this.touchX = side * 5; this.touchY = dir * 7;
            const kl = Math.hypot(5, 7);
            this.recv.id = owner; this.recv.t = this.recv.dur = 0.22;
            this.recv.foot = side * -dir > 0 ? "R" : "L"; // knock with the open-side foot
            this.recv.faceX = (side * 5) / kl; this.recv.faceY = (dir * 7) / kl;
            this.protect = 0.3; // the touch buys half a step on the lunging defender
            this.passCd = 0.42;
            handled = true;
          } else this.carrying = false; // engaged and not beating him → release below
        }
        // 11v11: occasionally play a ball OVER THE TOP before considering ground passes
        // (a DIRECT side reaches for it several times as often — long balls + second
        // balls are its identity; a possession side almost never hoofs it)
        if (!handled && this.allowLoft && !pressured && distGoal > 90 && this.rng() < this.T.loftP * this.persona[o.team].loft) {
          const loftTgt = this.bestLoft(owner);
          if (loftTgt) { this.carrying = false; this.doLoft(owner, loftTgt); handled = true; }
        }
        if (handled) {
          // ball is in the air (or knocked past the man) — decision made
        } else {
        // Pass-first — but with a live CARRY-UTILITY competitor: when the corridor
        // ahead is genuinely open, driving into it beats recycling a pass.
        const fwd = this.bestPass(owner);
        // carry utility: open-lane length + progression toward goal, scaled by style
        // appetite (counter sprints into transition space, possession carries patiently,
        // direct barely bothers — persona.carry encodes it) and tired legs; never when
        // pressed, near the box (shooting logic owns that), or as the LAST MAN deep.
        let carryP = 0;
        if (!pressured && distGoal > 34) {
          const lane = this.openLaneLen(owner);
          if (lane >= 25 && !this.lastManRisk(owner)) {
            const gain = clamp((lane - 25) / 20, 0, 1); // 25 → 45+ units of open grass
            carryP = (0.3 + 0.45 * gain) * this.persona[o.team].carry * (1 - this.fatigue * 0.3) * (ph === "counter" ? 1.3 : 1);
          }
        }
        if (carryP > 0 && this.rng() < carryP) {
          this.carrying = true; // TAKE the lane (integrate() gives the carry a gallop)
          this.passCd = 0.4; // decide again shortly — release when someone engages
        } else if (ph === "counter" && fwd) {
          // COUNTER: the defence is out of shape — hit the fastest forward route NOW,
          // a driven vertical ball to a runner, before the block can recover.
          // Counter-philosophy sides hit it hardest — their signature moment.
          this.carrying = false;
          this.doPass(owner, fwd, 1.15 + 0.23 * this.persona[o.team].urgency);
        } else if (ph === "counter" && clearAhead && !pressured) {
          // no runner free but open grass ahead → drive it upfield at pace
          this.carrying = true;
          this.passCd = 0.35;
        } else if (fwd && (this.rng() < 0.92 + this.persona[o.team].direct - this.fatigue * 0.06 || pressured)) {
          // penetrating forward ball — the primary action (firmer as the phases advance)
          this.carrying = false;
          this.doPass(owner, fwd, pressured ? 1.22 : ph === "final" ? 1.18 : 1.12);
        } else {
          const keep = this.safePass(owner);
          if (fwd) {
            // a forward option exists but we occasionally take the keep-ball instead
            this.carrying = false;
            this.doPass(owner, keep ?? fwd, keep ? 1.0 : 1.12);
          } else if (keep && !(clearAhead && distGoal > 44 && !pressured && this.rng() < this.T.carryP * this.persona[o.team].carry * (1 - this.fatigue * 0.25))) {
            // no forward option → recycle to a team-mate's feet (keep possession),
            // only dribbling in the rare case of clear space ahead and no pressure
            this.carrying = false;
            this.doPass(owner, keep, pressured ? 1.15 : 0.98);
          } else if (clearAhead && !pressured) {
            this.carrying = true; // drive into the open space
            this.passCd = 0.45;
          } else {
            this.carrying = false;
            this.doClear(owner);
          }
        }
        } // end ground-pass (handled === false)
      }
      // tackle — a defender right on the carrier can win it (harder when the carrier
      // has just settled it; a fresh touch is protected so possession doesn't ping-pong).
      // While the human JOCKEYS, their player contains without lunging — no auto-tackle.
      const jockeying = this.userJockey && nf && nf.p.id === this.userId;
      if (!jockeying && this.ball.owner === owner && this.protect <= 0 && nf && nf.d < P.tackleDist && this.rng() < P.tackleChance * this.T.press * this.persona[nf.p.team].press * this.fairMul * dt) {
        this.carrying = false;
        this.ball.owner = nf.p.id;
        this.possession = nf.p.team;
        this.startTrap(nf.p.id); // the won ball eases to the tackler's feet, no teleport
        this.passCd = 0.45; // can act (clear to safety) while still protected
        this.protect = P.protectTime;
        this.lastFrom = null;
        this.startCounter(nf.p.team); // the tackle springs a counter the other way
        this.stats.turnovers++;
        this.msg = "Turnover!"; this.msgT = 0.9;
      }
      // ---- keeper smother ----
      // the rushing keeper (see the breakaway charge in computeTargets) can dive on the
      // ball at the carrier's feet — the payoff that makes charging out worth it
      if (this.ball.owner === owner && this.protect <= 0 && !o.isGK) {
        const defGkId = this.foes(o.team).find((id) => this.players[id].isGK);
        if (defGkId) {
          const g = this.players[defGkId];
          if (Math.abs(o.y - this.ownGoalY(g.team)) < 80 && dist(g.x, g.y, o.x, o.y) < P.gkReach * 0.75 && this.rng() < 1.5 * dt) {
            this.carrying = false;
            this.ball.owner = defGkId;
            this.possession = g.team;
            this.startTrap(defGkId); // GK smother → hands, snaps clean (startTrap no-ops the trap for keepers)
            this.passCd = 0.7; this.protect = 0.8; this.lastFrom = null;
            this.stats.turnovers++;
            this.msg = "Smothered by the keeper!"; this.msgT = 1.0;
          }
        }
      }
    } else {
      // loose ball
      if (this.ballFlight > 0) this.ballFlight -= dt;
      const prevBX = this.ball.x, prevBY = this.ball.y; // pre-step position (goal-line crossing test)
      this.ball.x += this.ball.vx * dt;
      this.ball.y += this.ball.vy * dt;
      // a lofted ball keeps its pace (less friction while airborne), and arcs up then down
      const fr = Math.max(0, 1 - (this.loftDur > 0 ? P.friction * 0.35 : P.friction) * dt);
      this.ball.vx *= fr; this.ball.vy *= fr;
      if (this.loftDur > 0) {
        this.loftT += dt;
        const prog = clamp(this.loftT / this.loftDur, 0, 1);
        this.ball.height = this.loftPeak * Math.sin(Math.PI * prog); // rise then fall
        if (prog >= 1) { this.loftDur = 0; this.ball.height = 0; this.ball.lofted = false; }
      } else if (this.ball.height > 0) {
        this.ball.height = Math.max(0, this.ball.height - dt * 2.4);
      }
      const airborne = this.ball.lofted && this.ball.height > 1.2; // too high to be controlled
      const sp = Math.hypot(this.ball.vx, this.ball.vy);
      // UNSTICK: a loose ball that has rolled dead must always be claimable. If the
      // nearest man is the last kicker (normally barred from re-collecting his own pass)
      // he may take it after a beat — otherwise two players can orbit a dead ball forever
      // (the last kicker stands on it unable to claim, separation holds the rival out).
      if (sp < 10) { this.deadT += dt; if (this.deadT > 1.2) this.lastFrom = null; }
      else this.deadT = 0;

      // goal? → test WHERE the ball CROSSED the goal line this substep (not where it was
      // sampled afterwards): a fast angled shot can travel 10+ units in one substep, so
      // sampling drifted its x past the post and corner-bound goals were being misread
      // as "off target" → goal kick (the other half of the goal leak). Then let the ball
      // fly on into the net and hold for a celebration beat (the kick-off happens when
      // goalHold expires; ballImpact drives the net bulge).
      const crossedTop = prevBY > GY_TOP && this.ball.y <= GY_TOP;
      const crossedBot = prevBY < GY_BOT && this.ball.y >= GY_BOT;
      if (crossedTop || crossedBot) {
        const lineY = crossedTop ? GY_TOP : GY_BOT;
        const f = (lineY - prevBY) / (this.ball.y - prevBY || 1);
        const xc = prevBX + (this.ball.x - prevBX) * f; // x where it actually crossed the line
        if (Math.abs(xc - 135) < GHALF) {
          if (crossedTop) { this.score.gold++; this.msg = "GOAL — Gold!"; this.goalNet = "top"; }
          else { this.score.blue++; this.msg = "GOAL — Blue!"; this.goalNet = "bottom"; }
          this.msgT = 2.4;
          this.scorerId = this.lastFrom; // launch() stamped the striker
          this.goalHold = 1.8; this.ballImpact = Math.min(1, sp / 220);
          this.ball.x = clamp(xc, 135 - GHALF + 1.5, 135 + GHALF - 1.5); // nestle inside the posts for the net bulge
          this.ball.owner = null; this.ballIsShot = false; this.shotIsGoal = false; this.ball.target = null; this.ball.intBy = null;
          return;
        }
      }
      // out of bounds → a STAGED restart from where it went out (no teleporting the ball
      // back into play): kick-in on the touchline, corner when the defence turned it
      // behind its own goal line, goal kick when the attack knocked it over.
      if (this.ball.x < 8 || this.ball.x > 262 || this.ball.y < 4 || this.ball.y > 396) {
        const last: Team = this.possession; // team of the last touch
        const other: Team = last === "gold" ? "blue" : "gold";
        let kind: "kickin" | "goalkick" | "corner";
        let team: Team; let sx: number; let sy: number;
        if (this.ball.y < 4 || this.ball.y > 396) {
          const endTop = this.ball.y < 4;
          const defTeam: Team = endTop ? "blue" : "gold"; // who defends this goal line
          if (last === defTeam) { // defence turned it behind → corner for the attack
            kind = "corner"; team = other;
            sx = this.ball.x < 135 ? 18 : 252; sy = endTop ? 14 : 386;
          } else { // attacker knocked it over → goal kick
            kind = "goalkick"; team = defTeam;
            sx = clamp(this.ball.x, 110, 160); sy = endTop ? 18 : 382;
          }
        } else {
          kind = "kickin"; team = other;
          sx = this.ball.x < 135 ? 16 : 254; sy = clamp(this.ball.y, 22, 378);
        }
        const taker = kind === "goalkick"
          ? (this.mates(team).find((id) => this.players[id].isGK) ?? this.nearestOfTeam(team, sx, sy) ?? this.mates(team)[0])
          : (this.nearestOfTeam(team, sx, sy) ?? this.mates(team)[0]);
        this.possession = team;
        this.ball.x = sx; this.ball.y = sy; this.ball.vx = 0; this.ball.vy = 0; this.ball.height = 0;
        this.ball.owner = null; this.ball.target = null; this.ball.intBy = null; this.ballIsShot = false; this.shotIsGoal = false;
        this.ball.lofted = false; this.loftDur = 0;
        this.counterT = 0; this.counterTeam = null; this.lastFrom = null; this.carrying = false;
        this.restart = { kind, t: 1.0 + this.rng() * 0.8, x: sx, y: sy, taker };
        this.msg = kind === "corner" ? "Corner!" : kind === "goalkick" ? "Goal kick" : "Kick-in";
        this.msgT = this.restart.t + 0.6; // the feed line covers the WHOLE dead-ball beat — the restart is legible
        return;
      }
      // ---- reception ----
      let claimer: string | null = null;
      let claimVia: "inter" | "recv" | "loose" | "shot" = "loose";
      if (this.ballIsShot) {
        // a shot can only be stopped by the keeper defending that goal
        // the defending keeper — found by ROLE (not a hardcoded id) so any squad, incl. the 3v3 cage, works
        const defGk = this.foes(this.possession).find((id) => this.players[id].isGK);
        const g = defGk ? this.players[defGk] : null;
        if (!this.shotIsGoal && g && this.ballFlight <= 0 && dist(g.x, g.y, this.ball.x, this.ball.y) < P.gkReach + 1) {
          // ~1 in 5 stops is a PARRY, not a catch: the keeper touches it last (so a ball
          // over the line is a CORNER) and a deflection kept in play is a live rebound —
          // restarts and scrambles the critic can actually see.
          if (this.rng() < 0.2) {
            this.possession = g.team; // keeper's touch counts as the last touch
            const outX = Math.sign(this.ball.x - 135) || (this.rng() < 0.5 ? -1 : 1);
            this.ball.vx = outX * (70 + this.rng() * 50);
            this.ball.vy = Math.sign(this.ownGoalY(g.team) - 200) * (30 + this.rng() * 45);
            this.ball.height = 0.4; this.ballIsShot = false; this.shotIsGoal = false;
            this.ball.target = null; this.ball.intBy = null; this.ballFlight = 0.25;
            this.lastFrom = defGk!; // the keeper can't instantly re-collect his own parry
            this.msg = "Great save!"; this.msgT = 1.2;
          } else { claimer = defGk!; claimVia = "shot"; }
        }
        else if (sp < 40) {
          if (this.shotIsGoal) {
            // DECIDED goal running out of legs (shouldn't happen now launch pace is
            // guaranteed, but a substep edge can shave it): keep it trundling over the
            // line toward its placement — it must NOT demote to a claimable loose ball
            const dxa = this.shotAim.x - this.ball.x, dya = this.shotAim.y - this.ball.y;
            const L = Math.hypot(dxa, dya) || 1;
            this.ball.vx = (dxa / L) * 65; this.ball.vy = (dya / L) * 65;
          } else { this.ballIsShot = false; this.shotIsGoal = false; } // shot has fizzled out → live ball again
        }
      } else if (this.ballFlight <= 0 && !airborne) {
        // Outcome was decided at launch. A pass reaches its receiver (or its chosen
        // interceptor) when the ball arrives in their control zone. No random defender
        // can vacuum it up mid-flight — that was turning every pass into a scramble.
        // (A lofted ball can't be controlled until it drops — see `airborne`.)
        if (this.ball.intBy) {
          const d = this.players[this.ball.intBy];
          if (dist(d.x, d.y, this.ball.x, this.ball.y) < P.ctrlRadius) { claimer = this.ball.intBy; claimVia = "inter"; this.stats.interceptions++; }
          else if (sp < 22) this.ball.intBy = null; // ran dead → loose
        } else if (this.ball.target) {
          const r = this.players[this.ball.target];
          if (dist(r.x, r.y, this.ball.x, this.ball.y) < P.ctrlRadius) { claimer = this.ball.target; claimVia = "recv"; }
          else if (sp < 22) this.ball.target = null; // overhit / receiver cut off → loose
        }
        // genuine loose ball (clearance / deflection / dead pass): nearest within reach
        if (!claimer && !this.ball.target && !this.ball.intBy) {
          let nd = Infinity;
          for (const id of this.ids) {
            if (id === this.lastFrom) continue;
            const p = this.players[id];
            // keepers keep their big reach for SAVES, but shouldn't vacuum up every
            // loose ball near their box — outfielders clear those (fewer GK touches).
            // EXCEPTION: a genuinely loose ball right in front of goal is the keeper's —
            // he comes and CLAIMS it with his full reach before an attacker pounces.
            const inBox = p.isGK && dist(this.ball.x, this.ball.y, 135, this.ownGoalY(p.team)) < 42;
            // failsafe: a ball that has sat dead for seconds becomes progressively easier
            // to pick up, so no geometric stand-off can ever freeze the match
            const deadBonus = this.deadT > 2.5 ? (this.deadT - 2.5) * 3 : 0;
            const reach = (p.isGK ? (inBox ? P.gkReach : P.recvRadius + 1) : P.recvRadius) + deadBonus;
            const d = dist(p.x, p.y, this.ball.x, this.ball.y);
            if (d < reach && d < nd) { nd = d; claimer = id; }
          }
        }
      }
      if (claimer) {
        const cp = this.players[claimer];
        // ---- rare genuinely LOOSE first touch → an organic 50/50 ----
        // the ball squirts on past the touch in its direction of travel; the toucher is
        // barred from an instant re-claim (lastFrom), so a pressing defender can pounce.
        // Kept RARE — and only off a ball arriving with real pace, never a GK catch —
        // so the turnover/switch balance holds (verified with scripts/simavg.mjs).
        if (!cp.isGK && claimVia !== "shot" && sp > 60) {
          const lapse = (this.brain[claimer]?.lapse ?? 0) > 0;
          const pLoose = (0.012 + (sp > 200 ? 0.014 : 0) + this.fatigue * 0.012 + (lapse ? 0.05 : 0)) *
            (claimer === this.userId ? 0.45 : 1); // the human's touch is more reliable
          if (this.rng() < pLoose) {
            const sq = 62 + this.rng() * 26; // squirt pace — a chaseable few units, not a clearance
            this.ball.vx = (this.ball.vx / sp) * sq + cp.vx * 0.3;
            this.ball.vy = (this.ball.vy / sp) * sq + cp.vy * 0.3;
            this.ball.height = 0;
            this.ball.target = null; this.ball.intBy = null;
            this.ballIsShot = false; this.shotIsGoal = false;
            this.possession = cp.team; // his touch counts as the last touch
            this.lastFrom = claimer; // he must chase it down again like everyone else
            this.ballFlight = 0.12;
            this.deadT = 0;
            this.msg = "Heavy touch!"; this.msgT = 0.9;
            return;
          }
        }
        const kept = this.players[claimer].team === this.possession;
        if (claimVia === "recv") this.stats.recvOwn++;
        else if (claimVia === "loose") { if (kept) this.stats.looseOwn++; else this.stats.looseOpp++; }
        this.ball.owner = claimer;
        this.ball.target = null;
        this.ball.intBy = null;
        this.ballIsShot = false; this.shotIsGoal = false;
        this.possession = this.players[claimer].team;
        if (!kept) this.startCounter(this.possession); // stolen in flight / loose → break!
        // first touch + a beat of COMPOSURE, scaled by phase: in build-up an unhurried
        // player visibly scans before releasing (deliberate circulation); on the counter
        // or in the final third the ball moves much quicker. Tackle-immune while settling
        // so the receiver isn't robbed mid-touch.
        const ph = this.phaseOf(this.possession);
        // tempo arc scales the composure beat: urgent phases release quicker, the lull dwells
        const tempoBeat = clamp(2 - this.tempoMul, 0.7, 1.2);
        this.passCd = (ph === "counter" ? 0.35 : ph === "final" ? 0.5 : ph === "build" ? 0.72 + this.rng() * 0.35 : 0.62 + this.rng() * 0.25) * tempoBeat;
        // immunity is SHORTER than the composure beat — an unhurried touch is safe, but a
        // presser arriving during the scan can genuinely rob you (this window is where
        // pressing football wins the ball; without it tackles never land)
        this.protect = 0.4;
        // first touch: cushion the arriving ball in (reads incoming velocity — must run
        // while the flight momentum is still on the ball)
        this.startTrap(claimer);
      }
    }
  }

  // ---- line-height engine (see the `shape` field doc) ----
  // One cheap pass per frame: for each team decide the WANTED back-line height from
  // ball depth + possession + phase + philosophy, then move the live line toward it at
  // human rates — push up slower than you drop, step quicker on balls played away from
  // your goal, scramble back quicker when the ball is coming over the top.
  private updateShape(dt: number) {
    const sp = Math.hypot(this.ball.vx, this.ball.vy);
    const ph = this.phaseOf(this.possession);
    for (const t of TEAMS) {
      const sh = this.shape[t];
      const own = this.ownGoalY(t);
      const ballD = Math.abs(this.ball.y - own); // ball's depth from this team's goal
      const ps = this.persona[t];
      const attacking = this.possession === t;
      const away = t === "gold" ? this.ball.vy < -25 : this.ball.vy > 25; // ball travelling away from our goal
      let want: number;
      let push = this.T.lineUp; // u/s the line climbs (deliberate; small-sided blocks shift quicker)
      let drop = this.T.lineDn; // u/s the line retreats (urgent)
      if (attacking) {
        // REST DEFENCE: follow the ball up — and once play is genuinely deep, step
        // steeper so sustained final-third pressure parks the back line ~halfway
        // (philosophy-capped), squeezing the whole pitch
        want = clamp(ballD <= 220 ? ballD * 0.55 : 121 + (ballD - 220) * 0.75, 45, ps.holdLine);
        if (this.ball.owner === null && sp > 85 && away) push = this.T.lineUp + 20; // our clearance / long ball → the unit steps up together
      } else {
        // DEFENDING: engage high while they build, retreat into the block as they
        // progress (the old curve, philosophy-scaled) — always goal-side of the ball
        want = ph === "build" ? clamp(ballD * 0.52 * ps.line, 60, 152) : clamp(ballD * 0.45 * ps.line, 50, 120);
        // trap-lite: a loose ball punted away from our goal → step up NOW and squeeze
        if (this.ball.owner === null && !this.ballIsShot && sp > 85 && away && ballD > sh.line + 20) sh.stepUp = 0.9;
        if (sh.stepUp > 0) want = Math.min(want + 26 * ps.trap, Math.max(40, ballD - 12));
        if (this.ball.owner === null && sp > 110 && !away) drop = this.T.lineDn + 38; // ball in behind → sprint the line back
      }
      sh.stepUp = Math.max(0, sh.stepUp - dt);
      sh.line += clamp(want - sh.line, -drop * dt, push * dt);
    }
  }

  // ---- individual brains (see the `brain` field doc) ----
  // Per-frame: only the cheap latency follow. The utility re-pick runs at each player's
  // own ~2-4 Hz think-clock (staggered), so this stays phone/headless-test cheap.
  private brainLogic(dt: number) {
    const now = this.stats.time;
    for (const id of this.ids) {
      const p = this.players[id];
      if (p.isGK) continue;
      const b = this.brain[id];
      // reaction ripple: his personal line chases the team line with HIS latency;
      // during a lapse he's ball-watching — the line moves without him for a beat
      if (b.lapse > 0) b.lapse -= dt;
      else b.pl += (this.shape[p.team].line - b.pl) * Math.min(1, dt / b.react);
      if (now < b.next) continue;
      b.next = now + 0.28 + this.rng() * 0.17; // ~2-4 Hz, staggered per player
      // Read space on the existing staggered think-clock, not on every render.
      // An open player can hold position; a screened player takes a useful side step.
      b.ox=0;b.oy=0;b.screen=null;
      const owner=this.ball.owner?this.players[this.ball.owner]:null;
      if(owner&&owner.id!==id){
        if(p.team===this.possession){
          let strongest=0;
          for(const fid of this.foes(p.team)){
            const foe=this.players[fid];if(foe.isGK)continue;
            const offset=laneAdjustment(owner,p,foe,p.hx>=135?1:-1),strength=Math.hypot(offset.x,offset.y);
            if(strength>strongest){strongest=strength;b.ox=offset.x;b.oy=offset.y;}
          }
        }else{
          let option:SimPlayer|null=null,nearest=46;
          for(const fid of this.foes(p.team)){
            const foe=this.players[fid];if(foe.isGK||foe.id===owner.id)continue;
            const distance=dist(p.x,p.y,foe.x,foe.y);
            if(distance<nearest){nearest=distance;option=foe;}
          }
          if(option)b.screen=screenPosition(owner,option);
        }
      }
      // rare individual error — a mistimed step / late drop that opens an organic gap
      // (never the human's player: his mistakes are his own)
      if (id !== this.userId && this.rng() < 0.012 + this.fatigue * 0.02) b.lapse = 0.5 + this.rng() * 0.7;
      b.mode = 0;
      const ps = this.persona[p.team];
      if (p.team === this.possession) {
        // OVERLAP: a wide defender on the ball's side with play advanced may choose to
        // bomb up his wing — likelier for width-loving philosophies
        if (p.role === "def" && Math.abs(p.hx - 135) > 40 && Math.sign(p.hx - 135) === Math.sign(this.ball.x - 135) && Math.abs(this.ball.x - 135) > 20) {
          const phn = this.phaseOf(p.team);
          if ((phn === "progress" || phn === "final") && this.rng() < 0.3 + ps.width * 0.04) b.mode = 2;
        }
      } else if (p.role === "def") {
        // STEP OUT: an attacker in my zone who's a LIVE option (near the ball) → this
        // CB leaves the line to get tight (pressier philosophies commit more often).
        // An attacker parked far from play is left to the line — marking him would
        // drag the unit out of its ball-tracking shape.
        const nf = this.nearestFoe(id, p.x, p.y);
        if (nf && nf.d < 26 && dist(nf.p.x, nf.p.y, this.ball.x, this.ball.y) < 100 && this.rng() < (ps.press > 1 ? 0.55 : 0.4)) b.mode = 4;
      }
    }
  }

  private computeTargets(dt: number) {
    const rst = this.restart; // dead ball: teams get SET rather than chase/press
    const poss = this.possession;
    const defTeam: Team = poss === "gold" ? "blue" : "gold";
    const dir = this.dirY(poss);
    const ballOwner = this.ball.owner;
    const ownerPos = ballOwner ? { x: this.players[ballOwner].x, y: this.players[ballOwner].y } : { x: this.ball.x, y: this.ball.y };
    const presser = this.nearestOfTeam(defTeam, ownerPos.x, ownerPos.y);
    this.presserId = presser;
    // second defender provides COVER behind the presser, so passing lanes near the
    // ball are contested by two and the block engages rather than only recycling
    const cover = this.nearestOfTeam(defTeam, ownerPos.x, ownerPos.y, presser);
    // third defender gives BALANCE — tucks central goal-side of the cover so the press
    // is a coordinated unit (press → cover → balance), never three men chasing one ball.
    // Only with 6+ outfielders (9v9/11v11): in small-sided games committing a third man
    // to the ball would strip the zone bare.
    let balance: string | null = null; let balD = Infinity;
    if (this.mates(defTeam).length >= 7) {
      for (const bid of this.mates(defTeam)) {
        if (this.players[bid].isGK || bid === presser || bid === cover) continue;
        const d = dist(this.players[bid].x, this.players[bid].y, ownerPos.x, ownerPos.y);
        if (d < balD) { balD = d; balance = bid; }
      }
    }
    const ph = this.phaseOf(poss); // one phase read per frame drives both teams' shape

    // ---- attacking support cast (passing triangle + third-man runner) ----
    // s1: nearest team-mate = the SHORT outlet, showing at a lateral/back angle;
    // s2: nearest team-mate up the pitch = the LINE-BREAKING option in the half-space.
    // Together with the carrier they hold a live passing TRIANGLE at all times.
    // tmr: while a pass is in flight, the mate nearest the receiver makes a THIRD-MAN
    // run beyond it — the move that makes a team look like it thinks two passes ahead.
    let s1: string | null = null, s2: string | null = null, tmr: string | null = null;
    let tmrRecv: SimPlayer | null = null;
    if (ballOwner) {
      let d1 = Infinity, d2 = Infinity;
      for (const mid of this.mates(poss)) {
        if (mid === ballOwner || this.players[mid].isGK) continue;
        const m = this.players[mid];
        const d = dist(m.x, m.y, ownerPos.x, ownerPos.y);
        if (d < d1) { d1 = d; s1 = mid; }
      }
      for (const mid of this.mates(poss)) {
        if (mid === ballOwner || mid === s1 || this.players[mid].isGK) continue;
        const m = this.players[mid];
        if (m.role === "fwd") continue; // forwards keep STRETCHING the last line — they don't drop in to combine
        if ((m.y - ownerPos.y) * dir < 6) continue; // must already be ahead of the ball
        const d = dist(m.x, m.y, ownerPos.x, ownerPos.y);
        if (d < d2) { d2 = d; s2 = mid; }
      }
    } else if (this.ball.target && !this.ball.intBy && this.players[this.ball.target].team === poss) {
      tmrRecv = this.players[this.ball.target];
      tmr = this.nearestOfTeam(poss, tmrRecv.x, tmrRecv.y, this.ball.target);
    }

    // Ball not owned: the intended RECEIVER runs onto it; the nearest opponent
    // closes it down too (contest). A truly loose ball (clearance/shot) is chased
    // by the nearest of each team so it never dies in open space.
    const loose = this.ball.owner === null && !rst; // a dead ball on a restart spot is not chased
    const chasers = new Set<string>();
    if (loose) {
      if (this.ball.intBy) {
        // ball is being played into an interceptor — they run onto it
        chasers.add(this.ball.intBy);
      } else if (this.ball.target) {
        chasers.add(this.ball.target);
        const opp = this.nearestOfTeam(this.players[this.ball.target].team === "gold" ? "blue" : "gold", this.ball.x, this.ball.y);
        if (opp) chasers.add(opp);
      } else {
        const a = this.nearestOfTeam("gold", this.ball.x, this.ball.y);
        const b = this.nearestOfTeam("blue", this.ball.x, this.ball.y);
        if (a) chasers.add(a);
        if (b) chasers.add(b);
      }
    }
    this.chaserIds = chasers; // integrate() exempts chasers from separation — they COMMIT
    // to the ball like the presser does, else mutual spacing forces can hold everyone in
    // an orbit just outside claim radius around a dead ball, freezing the match

    for (const id of this.ids) {
      const p = this.players[id];
      let tx: number = p.x;
      let ty: number = p.y;
      let gkSet = false; // keeper "set" stance (opponent carrying into range) — for the wander gate
      let staged = false; // restart shape target assigned; still falls through to the wander layer
      // ---- staged restart: the taker walks to the spot; on a kick-off everyone else
      // jogs back into their formation shape (no teleports — you SEE the reset) ----
      if (rst) {
        // the taker is ALWAYS AI-driven — even in user-controlled games (the human can't legally
        // reach a ball in the net, so leaving the fetch to them froze the reset; control is
        // parked on a different team-mate for the duration, see updateUserPlayer)
        if (id === rst.taker) {
          // kickoff carry: first jog to the ball (still in the net), then bring it to the spot
          const gx = rst.carry === "fetch" ? this.ball.x : rst.x;
          const gy = rst.carry === "fetch" ? this.ball.y : rst.y;
          this.targets[id] = { x: clamp(gx, 14, 256), y: clamp(gy, 12, 388) };
          continue;
        }
        if (rst.kind === "kickoff") {
          tx = p.hx; ty = p.team === 'gold' ? Math.max(214, p.hy) : Math.min(186, p.hy);
          // Keep the opposition outside the centre circle as well as in their half.
          if(p.team!==this.possession&&dist(tx,ty,135,200)<30)ty=p.team==='gold'?230:170;
          this.targets[id]={x:tx,y:ty};
          continue;
        }
        // kick-in / corner / goal kick: both sides take up their normal shape around the
        // spot (the code below reads the dead ball's position), minus pressing/chasing
      }
      if (!staged) {
      if (loose && chasers.has(id)) {
        tx = this.ball.x + this.ball.vx * 0.16; // run onto the ball, leading it
        ty = this.ball.y + this.ball.vy * 0.16;
        this.targets[id] = { x: clamp(tx, 14, 256), y: clamp(ty, 12, 388) };
        continue;
      }
      if (p.isGK) {
        const ogy = this.ownGoalY(p.team);
        // ...but only once the shot is inside his REACTION window (~0.5s of flight) — a
        // keeper who reads a 30m drive from the moment it's struck saves everything and
        // the match dies 0-0; late reads mean well-placed strikes still beat him
        const incoming = this.ballIsShot && this.ball.owner === null && p.team !== poss && Math.abs(this.ball.vy) > 1 && Math.sign(this.ball.vy) === Math.sign(ogy - this.ball.y) && Math.abs(this.ball.y - ogy) < this.shotRead;
        if (incoming) {
          // SHOT: read the trajectory and set for it — move to where the ball will CROSS
          // the line, not where it is now (this is what makes saves look deliberate,
          // and what stops breakaway strikes being automatic goals)
          const tArr = Math.max(0, (ogy - this.ball.y) / this.ball.vy);
          tx = clamp(this.ball.x + this.ball.vx * tArr, 135 - GHALF, 135 + GHALF);
          ty = ogy + (p.team === "gold" ? -3 : 3);
        } else {
          // open play: play the ANGLE — stand on the ball–goal line, stepping further off
          // the line the closer the danger, exactly like a coached keeper narrowing the angle
          const dxb = this.ball.x - 135;
          const dyb = this.ball.y - ogy;
          const L = Math.hypot(dxb, dyb) || 1;
          const danger = Math.abs(this.ball.y - ogy);
          const carrier = this.ball.owner && this.players[this.ball.owner].team !== p.team ? this.players[this.ball.owner] : null;
          // BREAKAWAY: an opposing carrier clean through (no outfield mate goal-side of
          // him) → RUSH out to narrow the angle and smother, instead of waiting rooted
          let thru = false;
          if (carrier && dist(carrier.x, carrier.y, 135, ogy) < 95) {
            thru = true;
            for (const mid of this.mates(p.team)) {
              const m = this.players[mid];
              if (m.isGK) continue;
              if (Math.abs(m.y - ogy) < Math.abs(carrier.y - ogy) + 4 && Math.abs(m.x - carrier.x) < 30) { thru = false; break; }
            }
          }
          const looseNear = this.ball.owner === null && !this.ball.target && !this.ball.intBy && !rst && this.ballFlight <= 0 && dist(this.ball.x, this.ball.y, 135, ogy) < 52;
          if (thru && carrier) {
            // charge the carrier — but never further than ~34 units off the line, so a
            // chip/placed finish is still on and he can recover for the strike
            const cx = carrier.x - 135, cy = carrier.y - ogy;
            const cl = Math.hypot(cx, cy) || 1;
            const out = Math.min(cl * 0.62, 34);
            tx = clamp(135 + (cx / cl) * out, 100, 170);
            ty = ogy + (cy / cl) * out;
          } else if (looseNear) {
            // CLAIM a loose ball in front of goal before an attacker pounces on it
            tx = this.ball.x + this.ball.vx * 0.12;
            ty = this.ball.y + this.ball.vy * 0.12;
          } else {
            // a step off the line playing the ANGLE — visible even without a shot: the
            // keeper arc-tracks the ball's x every tick. When an opponent carries into
            // shooting range he gets SET (a touch further out, stance frozen — no bounce).
            gkSet = !!carrier && dist(carrier.x, carrier.y, 135, ogy) < 105;
            const off = clamp((gkSet ? 19 : 16) - danger * 0.05, 3, gkSet ? 14 : 11);
            tx = clamp(135 + (dxb / L) * off + clamp(dxb * 0.06, -7, 7), 108, 162);
            ty = ogy + (dyb / L) * off;
          }
        }
      } else if (p.team === poss) {
        // ---- ATTACKING ----
        if (id === ballOwner) {
          const nf = this.nearestFoe(id, p.x, p.y);
          if (this.carrying) {
            // drive toward goal, angling away from the nearest defender
            tx = p.x + (135 - p.x) * 0.12;
            ty = p.y + dir * 34;
            if (nf && nf.d < 22) tx += (p.x - nf.p.x >= 0 ? 1 : -1) * 12;
          } else if (nf && nf.d < 16) {
            tx = p.x + (p.x - nf.p.x >= 0 ? 1 : -1) * 6; ty = p.y; // shield & look to pass
          } else {
            tx = p.x; ty = p.y; // hold, look up
          }
        } else if (tmr === id && tmrRecv && this.depth(poss, this.ball.y) > 170) {
          // THIRD-MAN RUN: as the pass travels, burst BEYOND the receiver into the space
          // the pass has opened — arriving as the next option the moment it's controlled
          tx = tmrRecv.x + (p.hx >= 135 ? 22 : -22);
          ty = clamp(tmrRecv.y + dir * 46, 26, 374);
        } else if (s1 === id) {
          // SHORT OUTLET (triangle point one): show at a lateral/back angle so the
          // carrier always has a safe ball — never hiding behind a defender square-on
          const side = p.x >= ownerPos.x ? 1 : -1;
          tx = ownerPos.x + side * 27;
          ty = ownerPos.y - dir * 13;
        } else if (s2 === id) {
          // LINE-BREAKER (triangle point two): sit in the half-space between the lines
          // ahead of the ball — never dropping BACK to it (a striker already beyond the
          // spot keeps pushing the line instead of coming short)
          tx = (p.hx + ownerPos.x) / 2;
          const aheadBy = Math.max(38, (p.y - ownerPos.y) * dir + 6);
          ty = clamp(ownerPos.y + dir * aheadBy, 26, 374);
        } else {
          const ownGoalY = this.ownGoalY(p.team);
          const humanAttacking = !!this.userTeam && p.team === this.userTeam;
          const b = this.brain[id];
          if (p.role === "def" && !humanAttacking) {
            // ---- REST DEFENCE (the visible fix) ----
            // In possession the back line is a live pushed-up UNIT from the shape
            // engine — to ~halfway under sustained pressure — not statues on home
            // spots: staggered (defOff keeps one CB deeper), rippled (each man follows
            // the team line with his own latency), philosophy-capped (holdLine).
            const depth = clamp((b ? b.pl : this.shape[p.team].line) + (this.defOff[id] ?? 0), 30, this.persona[p.team].holdLine + 16);
            tx = p.hx + (this.ball.x - 135) * 0.15 + (b ? b.ox : 0);
            ty = ownGoalY + dir * depth;
            if (b && b.mode === 2) {
              // OVERLAP: this wide defender has picked the attacking objective — bomb
              // past the ball up his wing, an individually-readable run that still
              // serves the team (the rest of the line holds its stagger behind him)
              tx = p.hx + Math.sign(p.hx - 135) * 20;
              ty = ownGoalY + dir * Math.min(Math.abs(this.ball.y - ownGoalY) + 28, this.persona[p.team].holdLine + 60);
            }
          } else {
            const prog = clamp(Math.abs(this.ball.y - ownGoalY) / 384, 0, 1);
            // on the COUNTER everyone in front of the ball SPRINTS forward to stretch
            // the recovering defence; in normal phases they advance with the ball
            const counterBoost = ph === "counter" && p.role !== "def" ? 45 : 0;
            // (human island team: the user's back line still pushes right up to 150)
            const advance = (p.role === "fwd" ? this.T.fwdAdv : p.role === "def" ? 150 : 115) + counterBoost;
            // WIDTH: wide players hold near the touchline through build/progress to
            // stretch the block — how wide is a philosophy statement (possession sides
            // stretch the pitch, counter sides stay narrow)
            const wide = Math.abs(p.hx - 135) > 55 && ph !== "final";
            tx = p.hx + (this.ball.x - 135) * (wide ? 0.08 : 0.2);
            if (wide) tx += Math.sign(p.hx - 135) * (this.persona[p.team].width - 4) * 1.1;
            ty = clamp(p.hy + dir * prog * advance, 40, 360);
            // team-length budget (EFI compactness): through build/transition the front
            // never detaches from the back line — the team moves as one connected
            // block. Once play is deep the budget hangs off the BALL instead, so the
            // box still gets attacked while the line is completing its climb.
            if (!humanAttacking) {
              // forwards get the longest leash — they're the out-ball stretching the
              // last line; mids stay knitted to the block
              const rope = p.role === "fwd" ? (this.passMul > 1 ? 115 : 90) : this.passMul > 1 ? 70 : 45; // futsal's tiny squads need the longer leash
              const cap = Math.max(this.shape[p.team].line + 155, Math.abs(this.ball.y - ownGoalY) + rope);
              if (Math.abs(ty - ownGoalY) > cap) ty = ownGoalY + dir * cap;
            }
          }
          // GET OPEN — step into space away from the nearest marker
          const nf = this.nearestFoe(id, tx, ty);
          if (nf && nf.d < 26) {
            const md = nf.d || 1;
            tx += ((tx - nf.p.x) / md) * 20;
            ty += ((ty - nf.p.y) / md) * 14;
          }
        }
      } else {
        // ---- DEFENDING (a breathing 3-band block on the live team line) ----
        const ownY = this.ownGoalY(defTeam);
        const into = defTeam === "blue" ? 1 : -1; // direction from own goal into the pitch
        const ballDepth = Math.abs(this.ball.y - ownY); // how far the ball is from own goal
        // The block's height comes from the shape engine (engage high vs build, retreat
        // as they progress, trap-lite step-ups — philosophy-scaled); each player then
        // follows that line with HIS OWN reaction latency (brain.pl), so the unit
        // drops/steps as one but ripples through like humans, never lock-step.
        const b = this.brain[id];
        const pline = b ? b.pl : this.shape[defTeam].line;
        const bandOff = p.role === "def" ? (this.defOff[id] ?? 0) : p.role === "mid" ? 55 : 100; // band separation (+ back-line stagger)
        const shiftX = clamp((this.ball.x - 135) * 0.34, -46, 46);
        const lineY = ownY + into * clamp(pline + bandOff, 18, 320);
        if (id === presser && ballOwner) {
          tx = ownerPos.x;
          ty = ownerPos.y - into * 3; // get tight, goal-side of the carrier (close enough to tackle)
        } else if (id === cover && ballOwner) {
          // cover second man: goal-side and toward the middle, screening the next pass.
          // PRESSING SIGNATURE: when the aggressor team defends with the ball in ITS half,
          // the cover man CONVERGES on the carrier too — two shirts visibly swarming.
          const squeeze = this.persona[defTeam].press > 1 && ballDepth < 190;
          tx = squeeze ? ownerPos.x * 0.72 + 135 * 0.28 : ownerPos.x * 0.45 + 135 * 0.55;
          ty = ownerPos.y - into * (squeeze ? 8 : 17);
        } else if (id === balance && ballOwner) {
          // balance third man: tucks central, deeper again, protecting the middle if the
          // press is beaten — completing the press → cover → balance chain
          tx = ownerPos.x * 0.3 + 135 * 0.7;
          ty = ownerPos.y - into * 32;
        } else {
          tx = p.hx + shiftX + (b ? b.ox : 0); // slot + decision noise (never a robot grid)
          ty = lineY + into * (b ? b.oy : 0);
          const nf = this.nearestFoe(id, tx, ty);
          if (b && b.mode === 4 && nf && nf.d < 46) {
            // STEP OUT: this defender has read the danger and leaves the line to get
            // tight on the attacker in his zone — visibly tighter than the zonal
            // half-step, but a stride off touch-tight so passes aren't smothered dead
            tx = nf.p.x * 0.78 + tx * 0.22;
            ty = (nf.p.y - into * 5) * 0.72 + ty * 0.28;
          } else if (nf && nf.d < 46) {
            // default zonal half-step toward an attacker in the zone (don't dive in)
            tx = nf.p.x * 0.5 + tx * 0.5;
            ty = nf.p.y * 0.45 + ty * 0.55;
          }
        }
      }
      } // end !staged (restart shape targets still get the wander layer below)
      // Purposeful adjustments replace perpetual outfield oscillation. Do not move
      // a restart actor or a committed receiver away from the authored target.
      const brain=this.brain[id];
      if(!rst&&!chasers.has(id)&&id!==ballOwner&&id!==this.userId&&!p.isGK){
        if(p.team===poss&&brain){tx+=brain.ox;ty+=brain.oy;}
        else if(id!==presser&&brain?.screen&&dist(tx,ty,brain.screen.x,brain.screen.y)<40){
          tx+=(brain.screen.x-tx)*.45;ty+=(brain.screen.y-ty)*.45;
        }
      }
      const w=this.wanderP[id];
      if(w&&p.isGK&&!rst&&!this.ballIsShot&&!gkSet&&id!==this.userId)
        tx+=Math.sin(this.stats.time*w.f1+w.p1)*1.2;
      // Low-pass the off-ball targets. When a marker sits between two attackers the
      // "nearest foe" can flip frame-to-frame and the raw target teleports between two
      // spots — smoothing settles the player at the midpoint instead of jittering back
      // and forth. The ball carrier stays fully responsive so play still looks sharp.
      let nx = clamp(tx, 14, 256);
      let ny = clamp(ty, 12, 388);
      const prev = this.targets[id];
      // the carrier, first presser and committed ball chasers stay fully
      // responsive; only the zonal / get-open players get smoothed (that's where the
      // nearest-foe flip jitter lives)
      const responsive = id === ballOwner || id === presser || chasers.has(id);
      if (prev && !responsive) {
        const response=1-Math.exp(-dt/Math.max(.08,(this.brain[id]?.react??.2)*.65));
        nx = prev.x + (nx - prev.x) * response;
        ny = prev.y + (ny - prev.y) * response;
      }
      this.targets[id] = { x: nx, y: ny };
    }
  }

  private integrate(dt: number) {
    for (const id of this.ids) {
      const p = this.players[id];
      const t = this.targets[id];
      const dx = t.x - p.x;
      const dy = t.y - p.y;
      const d = Math.hypot(dx, dy);
      // keepers SPRING for a live shot (~25% quicker) — matches the faster strike pace so
      // decided saves still get made; decided goals are unaffected (they can't be saved)
      // a COMMITTED carry gallops (66 u/s; 76 in transition space on the counter) —
      // quicker than the shielding dribble but still catchable by a sprinting defender
      // (84), so every long carry eventually gets engaged and has to make its choice
      const carryV = this.counterT > 0 && this.counterTeam === p.team ? 76 : 66;
      let maxV = p.isGK ? P.gkSpeed * (this.ballIsShot && this.ball.owner === null ? 1.25 : 1) : id === this.ball.owner ? (this.carrying && id !== this.userId ? carryV : P.ownerSpeed) : P.runSpeed;
      if (id !== this.userId) maxV *= this.legsMul; // match-arc legs (AI only — never the human)
      if (id === this.userId) {
        const jockeying = this.userJockey && this.ball.owner && this.players[this.ball.owner]?.team !== this.userTeam;
        if (jockeying) {
          maxV = P.runSpeed * (this.userSprint ? 1.2 : 0.9); // controlled containing pace (fast-jockey on sprint)
        } else {
          // analog speed: a soft push jogs, a hard push runs. Keyboard passes mag≈1 (full
          // speed, unchanged). Dead zone + quadratic curve give fine low-speed control.
          const m = this.userMoveMag;
          if (m < 0.985) { const dz = 0.12; const t = m <= dz ? 0 : (m - dz) / (1 - dz); maxV *= 0.42 + 0.58 * (t * t); }
          if (this.userSprint) maxV *= 1.4; // sprint on top
        }
      }
      // desired velocity — arrive: full speed until close, then ease. The PRESSER gets no
      // ease-in: he closes at full sprint right onto the carrier (the lunge) — with the
      // ease he'd decelerate into orbit just outside tackle range and never win a ball.
      const pressing = id === this.presserId && this.ball.owner && this.ball.owner !== id;
      let dvx = 0;
      let dvy = 0;
      if (d > 0.5) {
        const s = pressing ? maxV : Math.min(maxV, d * 6);
        dvx = (dx / d) * s;
        dvy = (dy / d) * s;
      }
      // separation keeps spacing/shape — but a presser in flight is COMMITTED: nobody
      // shoulders him off his line (else the cover man's own spacing push keeps
      // deflecting the tackle attempt), and the carrier isn't pushed off the ball either
      let sx = 0;
      let sy = 0;
      for (const oid of this.ids) {
        if (oid === id) continue;
        if (pressing || this.chaserIds.has(id)) continue; // committed lunge / loose-ball chase — spacing forces don't apply
        if (id === this.ball.owner && oid === this.presserId) continue; // carrier can't body the tackler away
        const o = this.players[oid];
        const od = dist(p.x, p.y, o.x, o.y);
        if (od > 0.01 && od < P.sepRadius) {
          const f = (P.sepRadius - od) / P.sepRadius;
          sx += ((p.x - o.x) / od) * f * P.sepForce;
          sy += ((p.y - o.y) / od) * f * P.sepForce;
        }
      }
      dvx += sx;
      dvy += sy;
      // cap
      const dv = Math.hypot(dvx, dvy);
      if (dv > maxV) { dvx = (dvx / dv) * maxV; dvy = (dvy / dv) * maxV; }
      // accelerate toward desired velocity
      const k = Math.min(1, dt * P.accel);
      p.vx += (dvx - p.vx) * k;
      p.vy += (dvy - p.vy) * k;
      p.x = clamp(p.x + p.vx * dt, 8, 262);
      p.y = clamp(p.y + p.vy * dt, 6, 396);
    }
  }
}
