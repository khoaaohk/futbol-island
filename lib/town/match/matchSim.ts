import {sevenBuildOutY,behindBuildOut,retreatBuildOutY} from "../buildOut";
import {liveVenueById,type LiveVenue,type LiveFormat} from '../venues';
import {sweepGoalFrame,type FrameHit} from '../goalCollisions';
import {shotProgress,shotHeightAt,shotOffsetAt} from '../shotPlacement';
import {firstTouchDirection} from "./firstTouch";
import { laneAdjustment, screenPosition } from "./tacticalMovement";
import { windupSeconds } from "./choreo";
import { Combos, comboSettings } from "./combos"; // [combos]
import { sevenOffside, sevenOnsideDepth, sevenWideX, SEVEN_NOTES } from "./sevenAI"; // 7v7 lane (formatAI "7v7")
import { formatAI, sweeperOffset, onsideDepth, type FormatAI } from "./formatAI"; // per-format rules & coaching (9v9 lane)
import { ringPush, markSpot, assignMarks, chanceQuality, laneFactor, isBetterChance, FUTSAL_NOTES, MARK_GAP, MARK_SAG } from "./futsalAI"; // futsal laws & habits (ai-futsal lane)
import { createHumanInput, writeHumanInput, tickHumanInput, tickHumanTimers, stepSprint, PASS_POWER_MAX, SPRINT_BOOST, TRICK, TRICK_KINDS, PRESS, TACKLE, TACKLE_ASSIST, INPUT_BUFFER, LONG_BALL, HUMAN_FEEL, SHOT_AIM, POWER_SHOT, HUMAN_GUARD, PASS_HELP, shotPace, type HumanInput, type HumanFrame } from "./humanInputs"; // join a live game
import { PASS_ASSIST, pickPassTarget, scorePassTarget, stickyTarget, leadPoint, passSpeedFor, shotAim, segmentDistance, type PassContext, type StickyTarget, type PassMode } from "./passAssist";
import { createRunContext, pickOffBallRun, supportOffset, RUN, RUNS } from "./offBallRuns";
const RUNS_SUPPORT = RUNS.supportRadius;
import { ELEVEN_FORMAT_AI, defendAI, recoveryDepth, formatNotes, type DefendAI, type CoachNotes } from "./elevenAI"; // 11v11 lane
/** Lane B: xG multiplier of an acrobatic first-time finish (volley, scissor, bicycle, diving header). */
const ACRO_XG = 0.7;
// Standalone two-way football match simulation (the "brain + body").
// Pure logic in field space (270 x 400) with NO rendering/DOM deps, so it can be
// unit-tested in Node at full speed. BabylonStage just reads positions each frame.
//
// Gold attacks the TOP goal (y→0); Blue attacks the BOTTOM goal (y→400).

export type Team = "gold" | "blue";
export type Role = "gk" | "def" | "mid" | "fwd";
/** A ball touch the view turns into a body action (lib/town/match/choreo.ts). `height` is the ball's
 * height (m) at the touch, `speed` the ball's pace (u/s) arriving (or leaving, for `kick`),
 * `heavy` a first touch that pops out of stride, `other` the dispossessed carrier of a tackle. */
export type TouchKind = "receive" | "intercept" | "tackle" | "heavy" | "parry" | "goal" | "kick";
export type TouchEvent = { serial: number; kind: TouchKind; id: string; other: string | null; team: Team; height: number; speed: number; heavy: boolean; time: number };
export type KickWindup = { id: string; kind: "pass" | "loft" | "shot" | "clear"; to: string | null; firm: number; loftKind: "through" | "cross" | "switch"; t: number; dur: number; tx: number; ty: number; turn: number };

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
  // ---- body-mechanics outputs (read by fieldRuntime each frame; see docs/body-mechanics) ----
  brake: number; // 0..1 current deceleration / this player's max brake (explicit stop request for the rig)
  backpedal: number; // 0..1 retreating toward own goal while FACING the carrier (short quick steps)
  plant: number; // 0..1 hard-plant impulse set when a cut/plant begins, decays over ~0.2 s
  faceX: number; // unit vector toward the carrier while backpedalling (0,0 otherwise) — the rig's facing
  faceY: number;
  intentX?: number; // desired velocity before momentum integration, for anticipatory posing
  intentY?: number;
  moveDistance?: number;
}

// The composure beat absorbs the wind-up of a typical kick (a 60° turn): square-on kicks leave
// the foot a touch sooner than before the wind-up existed, big turns a touch later.
const WINDUP_LEAD_TURN = Math.PI / 3;
const WINDUP_FINISH: Record<string, number> = { futsal: 1.75, "7v7": 1.3, "9v9": 1.45, "11v11": 1.15, beach: 1 };
// ---- beach soccer (FIFA Beach Soccer Laws 2024-25; the Coral Cay live match) ----
// Attract-mode clock: three 2-minute periods of REAL time, ~6 min a game and ~3 goals typical (Oct 29 2026; the real game: 3 × 12 min), a 15 s extra time when level (3 min), then a
// penalty shoot-out (5 kicks each, then sudden death); a short full-time beat, then a fresh game kicks off.
export const BEACH_PERIOD = 120, BEACH_EXTRA = 15, BEACH_FULL_TIME = 3;
/** Sand: a rolling ball dies ~30 % quicker (air drag is unchanged, so lifted passes and throws keep their flight). */
const BEACH_GROUND_FRICTION = 2.2 * 1.3;
/** Sand legs: every player runs a little slower (running on sand costs ~1.6× the energy of firm ground). */
const BEACH_LEGS = 0.93;
/** A joined human on the beach (Nov 4 2026): a kick-in / kick-off he takes leaves his feet within this many REAL seconds (Law 15:
 *  4 s), else the pass is played for him; and the one-line toasts he gets (matchSim.humanNote → liveJoinRuntime). */
export const BEACH_HUMAN_RESTART_S = 4;
/** Quick goal reset (owner Nov 5 2026, docs/join-live-game-design.md "Quick goal reset"): in a match with a joined human the scored
 *  ball fades in the net and reappears on the centre spot (the character's blue arrival effect, drawn by fieldRuntime), so nobody
 *  fetches it. REAL seconds: `hold` celebration (AI-only keeps 1.8 sim s), the ball hides `fadeAt` after the goal (the view fades it
 *  over `fade`), `arrive` = the dead-ball beat while it lands on the spot, then the kick-off goes once the taker is there (the
 *  both-halves check waits at most `grace`). AI-only matches never enter this path (fixtures/live-match-summary.json unchanged). */
export const GOAL_RESET = { hold: 1.4, fadeAt: 0.45, fade: 0.35, arrive: 0.75, grace: 0.45 } as const;
export const BEACH_HUMAN_NOTES = {
  kickin: "Kick-in: kick or throw it to a teammate within 4 seconds",
  kickoff: "Kick-off: pass it first. It can't go straight in",
  late: "4 seconds up: the pass was played for you",
  noGoal: "No goal: a kick-in, kick-off or keeper's throw can't go straight in",
} as const;
/** Beach shot quality by game state: [two or more up, one up, behind]. */
export const BEACH_LEAD_XG = [0.7, 0.9, 1.1];
const GY_TOP = 8;
const GY_BOT = 392;
const GHALF = 19; // goal half-width in field units (~6.4m of a 45.7m pitch)
/** A human in goal (owner, Nov 4 2026: "you can even play as goalie now"). The stick moves him inside his box (the area
 *  the AI keeper uses), A dives at the shot with a strong assist: the dive aims at where the ball will cross his line
 *  (not where the stick points) and lands before the ball; B throws / kicks it out through the pass assist. */
export const HUMAN_KEEPER = {
  /** The box he may move in: |x − 135| ≤ boxHalf, depth off his goal line ≤ boxDepth (sim units). */
  boxHalf: 44, boxDepth: 46,
  /** A dive covers at most this far (sim units) and takes at most diveTime sim seconds (≈ .44 real s at live pace). */
  diveRange: 22, diveTime: 0.14, diveMin: 0.035,
  /** Extra save reach at full stretch, kept a beat after landing (sim s). */
  diveReach: 3.5, stretchHold: 0.12,
  /** A dive at an opponent's feet wins the ball this often (once per dive). */
  smother: 0.8,
  /** Law 12, the six-second rule: past this (real seconds) in his hands the AI distributes it for him. */
  holdSeconds: 6,
  /** With nothing to dive at, A is a short dive along the stick. */
  idleDive: 7,
} as const;

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

// ---- role movement profiles (docs/body-mechanics/BODY_MECHANICS.md — shared contract) ----
// speed: max-speed multiplier on P.runSpeed (owner/carry/keeper cases keep their existing
//        multipliers relative to that); accel: multiplier on P.accel when speeding up;
// brake: multiplier on P.accel when slowing down (defenders stop hard and plant);
// turn:  agility — a sharper cut costs 1/turn of the speed; burst: short-range multiplier
//        within 4 u of a live loose ball (only the keeper springs).
// Balance-tuned from the contract's starting values (fwd 1.10 / def .94 / gk .90 speed,
// def accel .85 / turn .85, bleed .8): those raised goals/game 12-27 % over 96 seeds per
// format — a quick forward outrunning a slow back line and a slower keeper. These values
// keep the role ordering and feel with no measurable shift (docs/body-mechanics/balance-after.txt).
export const ROLE_MOVEMENT: Record<Role, { speed: number; accel: number; brake: number; turn: number; burst: number }> = {
  fwd: { speed: 1.04, accel: 1.15, brake: 1.00, turn: 1.15, burst: 1 },
  mid: { speed: 1.00, accel: 1.00, brake: 1.05, turn: 1.00, burst: 1 },
  def: { speed: 0.98, accel: 0.95, brake: 1.30, turn: 0.95, burst: 1 },
  gk: { speed: 1.00, accel: 1.20, brake: 1.25, turn: 1.00, burst: 1.35 },
};
// momentum-model tunables (field units / seconds)
const M = {
  plantAngleCos: 0.342, // desired direction more than ~70° off the current velocity → plant first
  plantSpeed: 25, // only at real running speed (below this a change of direction is just a step)
  plantBleed: 0.6, // share of entry speed a plant bleeds at turn 1 — scaled by 1/turn (fwd keep more, def less)
  plantFloorMax: 0.95, // at most this fraction of speed is bled in a plant, at least .4
  plantDecay: 0.2, // s for the plant impulse to fade
  plantTargetDist: 10, // a reversal onto a target nearer than this is an arrival stop, not a cut
  plantCooldown: 0.4, // s after a plant begins before another can trigger (no plant chains)
  backpedalSpeed: 0.62, // retreat pace while facing the carrier
  backpedalOn: 28, // target toward own goal within this → backpedal…
  backpedalOff: 36, // …and keep backpedalling until the target is this far (hysteresis)
  backpedalDwell: 0.12, // s the raw decision must hold before the state flips (no flicker)
  backpedalRamp: 0.1, // s time-constant for the 0..1 output engaging
  backpedalRelease: 0.05, // s for the output to fall 1 → 0 once released (~0.16 s wall-clock at live speed)
  keeperBurst: 4, // u from a live loose ball inside which the keeper springs (burst)
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
// Beach 5-a-side diamond (keeper, defender, two wingers, pivot): the same slot ids as futsal, a touch wider and
// higher (the sand court is almost as wide as it is long, and there is no offside to hold the pivot back).
const GOLD_HOME_BEACH: [string, number, number, Role][] = [
  ["gk", 135, 374, "gk"], ["cb", 135, 296, "def"], ["lm", 56, 236, "mid"], ["rm", 214, 236, "mid"], ["st", 135, 160, "fwd"],
];
const BLUE_HOME_BEACH: [string, number, number, Role][] = [
  ["dgk", 135, 26, "gk"], ["dcb", 135, 104, "def"], ["dlm", 56, 164, "mid"], ["drm", 214, 164, "mid"], ["dst", 135, 240, "fwd"],
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
const NO_IDS: readonly string[] = []; // integrate(): a player exempt from spacing iterates nobody
/** integrate() separation: squared-distance reject a touch beyond P.sepRadius (15 u), so the exact test still decides edge cases. */
const SEP_REJECT2 = 15.01 * 15.01;
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
  /** Quick goal reset (GOAL_RESET; human matches only): `hidden` while the scored ball is faded out, `serial` bumps when it lands on
   *  the centre spot (the view plays the arrival effect). Never touched by an AI-only match. matchNet mirrors both to friends. */
  readonly goalReset = { serial: 0, hidden: false };
  /** This goal takes the quick reset (a human was on the pitch when it went in). */
  private goalQuick = false;
  /** ...and its kick-off taker, picked as it goes in so he walks to the spot during the celebration. */
  private quickTaker: string | null = null;
  ballImpact = 0; // 0..1 how hard the ball just hit the net (drives the bulge)
  // Render-only reads (never used by the AI): a counter per launch plus its shape, so the view can
  // give the ball real vertical physics (gravity arc, bounces) without changing gameplay.
  kicks = 0;
  lastKick = { height: 0, loft: 0, dur: 0, shotHeight: 0, fromY: 0, goalY: 0, aimX: 135 };
  frameContact={serial:0,height:0,vy:0,x:0,y:0,z:0,part:'post' as 'post'|'crossbar'};
  private goalVenue:LiveVenue;
  /** The goal frames the shot sweep tests, in the venue's own (unturned) frame round its centre. */
  private frameVenues:LiveVenue[];
  private frameFrom={x:0,y:0,z:0};
  private frameTo={x:0,y:0,z:0};
  private frameHit:FrameHit={x:0,y:0,z:0,t:0,nx:0,ny:0,nz:0,part:'post'};

  // ---- human control (join a live game, Nov 4 2026; lib/town/match/humanInputs.ts) ----
  // Every human-controlled SLOT has one HumanInput, keyed by the slot's player id: N humans per match (solo uses one,
  // the multiplayer slice feeds the rest). A human is LOCKED to his slot: control never jumps to the carrier.
  readonly humans = new Map<string, HumanInput>();
  /** Humans per team (kept in step with `humans`). */
  readonly humanOn: Record<Team, number> = { gold: 0, blue: 0 };
  /** A human may take the keeper slot (join picker's Goalkeeper; human keeper control, Nov 4 2026: HUMAN_KEEPER). */
  readonly humanKeepers: boolean = true;
  /** Human keepers at full stretch: sim seconds of extra save reach left (HUMAN_KEEPER.diveReach). Empty without humans. */
  private hkStretch = new Map<string, number>();
  /** The dive at an opponent's feet of each human keeper (smother rolled once at the dive). */
  private hkSmother = new Map<string, boolean>();
  private hkAim = { x: 0, y: 0, t: 0, smother: false };
  /** First human's slot / team (compat for older single-user readers such as combos). */
  userTeam: Team | null = null;
  userId: string | null = null;
  passTargetId: string | null = null; // team-mate a Pass would reach for the first human on the ball (receiver marker)
  /** The ball in flight is a human's full-charge power shot (matchEffects: flame trail). Any new kick clears it. */
  powerShot = false;
  private supOut = { x: 0, y: 0 };
  /** Per human slot: the Pass and Forward-pass targets the assist shows (hysteresis, passAssist.stickyTarget). */
  readonly humanTargets = new Map<string, { pass: StickyTarget; forward: StickyTarget }>();
  /** Last "call for the ball": who called and whether the lane was open (the HUD shows "Not open: move into space"). */
  lastCall: { id: string; open: boolean; time: number } | null = null;
  /** Off-ball runs in behind chosen on the think clock (offBallRuns.ts): a Forward pass prefers these runners. */
  readonly runners = new Set<string>();
  private runCtx = createRunContext();
  private runOut = { x: 0, y: 0 };
  private assistOut = { score: 0 };
  private looseTier = 0; // which loosePick tier the last pick came from (0 = the stick's cone)
  private leadOut = { x: 0, y: 0 };
  /** A human pass's assisted point and pace, consumed by the next doPass. */
  private humanLead: { x: number; y: number; speed: number; /** Long ball (hold Pass): its peak height (m); 0 = a ground pass. */ peak?: number; /** Hold charge (1 = tap … PASS_POWER_MAX): a beach pass the sand lifts keeps it. */ charge?: number } | null = null;
  /** Press together (human Press button): the NPC pressers of every active press (rebuilt only on start / end). Empty without humans. */
  readonly pressSet = new Set<string>();
  /** Opponents bamboozled by a human's dribbling trick: real seconds of slowed legs left. Empty without humans. */
  readonly dazed = new Map<string, number>();
  private passCtx: PassContext | null = null;

  private passCd = 1;
  private lastFrom: string | null = null;
  private deadT = 0; // how long a loose ball has sat (near) still — unsticks a dead ball

  private lastOwner: string | null = null;
  private hold = 0;
  private combination: {runner:string;wall:string;team:Team;x:number;y:number;expires:number}|null = null;
  private carryUntil = 0;
  private tacticalReason = "Build through connected support";
  private carryDirection = {x:0,y:0};
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
  /** Write a steering target IN PLACE (one object per player for the whole match: no per-frame allocation). */
  private setTarget(id: string, x: number, y: number) { const t = this.targets[id]; if (t) { t.x = x; t.y = y; } else this.targets[id] = { x, y }; }
  private ownerPosS = { x: 0, y: 0 }; // computeTargets' carrier/ball point, reused every frame
  private huggerIds: (string | null)[] = [null, null, null]; // goal celebration: the 3 team-mates nearest the scorer
  // ---- futsal (formatAI knobs: restartRing / keeperBackPass / manMark / extraPass; neutral in every other format) ----
  private gkPlayed: Record<Team, boolean> = { gold: false, blue: false }; // Law 12: the keeper released it and no opponent has touched it since
  /** Man-oriented marking: each defender's attacker (read by tests and any view that wants to draw "buddy" lines). */
  markOf: Record<string, string | null> = {};
  private markTeam: Team | null = null;
  private markNext = 0; // ~3 Hz think clock for the marking re-assignment
  private mk = { ids: new Array<string>(11).fill(""), att: new Array<string>(11).fill(""), dx: new Array<number>(11).fill(0), dy: new Array<number>(11).fill(0), sx: new Array<number>(11).fill(0), sy: new Array<number>(11).fill(0), prev: new Array<number>(11).fill(-1), out: new Array<number>(11).fill(-1), used: new Array<boolean>(11).fill(false) };
  private ringOut = { x: 0, y: 0 };
  private markPt = { x: 0, y: 0 };
  /** Futsal telemetry (tests / balance harness): 5 m ring corrections, back passes refused, extra passes, marking switches. */
  futsalStats = { ringPushes: 0, backPassBlocked: 0, extraPasses: 0, markSwitches: 0 };
  private presserId: string | null = null;
  private defenseIntent = {cover:null as string|null,balance:null as string|null};
  private chaserIds = new Set<string>(); // players running onto a loose ball this frame
  private passMul = 1; // futsal: quicker, zippier passing (smaller, faster game)
  /** Ceiling on a human pass's combined pace multiplier (passMul × the human 1.3 × the hold charge): the 18.5 m rooftop
   *  futsal court is too small for 1.22 × 1.3 × PASS_POWER_MAX (≈ 2.4), so a charged ball would run out of play. AI passes never read it. */
  humanPassCap = Infinity;
  /** Human-only pace knobs (11v11 = the adult-tuned format, owner Nov 5 2026). The sprint boost: 11v11 runs 6.9 m/s, so the
   *  kids' SPRINT_BOOST 1.42 would sprint 9.8 m/s, over the pose relay's walk check (MAX_SPEED_MS 6.3 × 1.5 = 9.4); 1.3 sprints
   *  ~9.0 m/s (a real adult sprint). The chaser slow-down on a human carrier (kids: × 0.82) is off on the 11v11. AI never reads them. */
  humanSprintBoost: number = SPRINT_BOOST;
  humanChaseMul = 0.82;
  /** The live-join pace ladder (owner Nov 5 2026: "11v11 has great speed of play and ball movement", applied to the other
   *  adult-paced formats; 7v7 keeps the kid tuning at 1). `humanPace` multiplies the human's top speed (run, dribble, sprint,
   *  jockey) AND the opponents chasing a human carrier (with humanChaseMul), so chasers stay level with him as on the 11v11.
   *  `humanBallPace` multiplies a human's pass, long ball and shot pace (ground passes still under humanPassCap; lifted ones
   *  land soft via landCap). Ladder vs the 11v11 human (run 6.91 m/s, sprint 8.99, shot 46.5): 9v9 90 %, futsal 80 %, beach
   *  70 % (sand). Human-only: read only for a human or with a human carrier, so AI-only matches are byte-identical. */
  humanPace = 1;
  humanBallPace = 1;
  private allowLoft = false; // 11v11: allow lofted balls "over the top" (bigger field)
  private useBuildOut = false;
  private useOffside = false; // 11v11/9v9 only (futsal & 7v7 have no offside)
  /** Per-format rules & coaching knobs (formatAI.ts); neutral = the engine's long-standing behaviour. */
  readonly ai: FormatAI;
  /** This format's coaching lines for the live feed (formatAI.ts formatNotes). */
  private notes: CoachNotes;
  /** Defending knobs beyond the shared table (elevenAI.ts; neutral for every format but 11v11). */
  private defend: DefendAI;
  /** Restart taker whose first pass cannot be offside (throw-in, goal kick, corner; Law 11). */
  private offsideFree: string | null = null;
  /** A pass released to a team-mate standing offside (the passer misread it): called when he receives it. */
  private offsidePass: { id: string; x: number; y: number } | null = null;
  private loftDur = 0; // remaining flight time of a lofted ball (drives the height arc)
  /** A human's charged pass the beach sand lifted: its ground pace on landing is capped here (the sand kills the bounce), so the quicker
   *  flight never rolls the ball out of the small court. 0 = none (every AI ball). */
  private landCap = 0;
  private loftT = 0;
  private loftPeak = 0;
  // ---- beach soccer (format 'beach' only; every other format keeps these at their neutral values) ----
  private beach = false;
  /** Rolling-ball friction (sand slows a ground ball more; airborne drag stays P.friction × .35). */
  groundFriction = P.friction;
  private legs = 1; // top-speed multiplier on sand
  /** The next launch by this player may not score directly (a keeper's throw, a kick-in or a kick-off: Laws 8, 12, 15). */
  private noDirect: string | null = null;
  private directBan = false; // the ball in flight came straight from such a restart / the keeper's hands
  /** One-line toasts for a joined human (beach restarts, Nov 4 2026): the runtime shows `text` when `serial` changes and `id` is his slot. */
  humanNote = { serial: 0, id: "", text: "" };
  private tellHuman(id: string | null, text: string) { if (!id || !this.humans.has(id)) return; this.humanNote.serial++; this.humanNote.id = id; this.humanNote.text = text; }
  private nextNote: Record<string, number> = {};
  /** Beach match clock: period 1–3, 4 = extra time, 5 = penalties / full time. */
  period = 1;
  private periodEnd = BEACH_PERIOD;
  private fullTime = 0; // > 0: the full-time beat before the next game (real seconds)
  private gameStart = 0;
  /** The match clock in REAL seconds (QA audit 4 #7, Oct 26 2026: the beach clock ran at ~0.5x wall time because periods and the
   *  feed's times were read from stats.time, the SIM clock, which the host steps at liveGameSpeed (beach .48) of real time). Each
   *  step's sim dt is divided by windupScale (= liveGameSpeed; 0 = no playback speed, sim time is real time). Periods, extra time,
   *  the full-time beat, the match arc and the feed's m:ss all read this. */
  clock = 0;
  /** Seconds into the current game on the match clock (beach: since the last kick-off of period 1; elsewhere the whole clock). */
  get matchTime() { return this.beach ? Math.max(0, this.clock - this.gameStart) : this.clock; }
  /** Teaching commentary from the sim itself (beach rules, periods): matchEffects announces each new serial. */
  note = { serial: 0, text: "", reason: "" };
  /** Games finished on this court and how the last one ended (read by tests and the live panel). */
  results: { gold: number; blue: number; pens?: { gold: number; blue: number }; extra: boolean }[] = [];
  teach(text: string, reason = "", key = "", cooldown = 0) {
    if (key) { if (this.stats.time < (this.nextNote[key] ?? -Infinity)) return; this.nextNote[key] = this.stats.time + cooldown; }
    this.note.serial++; this.note.text = text; this.note.reason = reason;
  }
  get isBeach() { return this.beach; }
  /** The dead-ball restart being set up, for the view: 'kickin' is a THROW-IN where ai.touchline says so (9v9, 11v11). */
  get restartKind(): "kickoff" | "kickin" | "goalkick" | "corner" | null { return this.restart ? this.restart.kind : null; }

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
  // quick (human matches, GOAL_RESET): the ball is already on the spot; the taker walks over and it goes without the long setup.
  private restart: { kind: "kickoff" | "kickin" | "goalkick" | "corner"; t: number; x: number; y: number; taker: string; carry?: "fetch" | "carrying"; quick?: boolean } | null = null;

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
  // ---- momentum state (see integrate) ----
  // floor: >0 while a plant is bleeding speed — the speed at which re-acceleration resumes;
  // back/backT: the backpedal decision with its dwell timer (hysteresis so it never flickers).
  private mom: Record<string, { floor: number; cool: number; back: boolean; backT: number }> = {};

  // stats (for testing) — carries counts SUSTAINED drives (a carry episode >= 15 units)
  stats = { passes: 0, turnovers: 0, shots: 0, shotsGold: 0, shotsBlue: 0, interceptions: 0, possGold: 0, possBlue: 0, time: 0, recvOwn: 0, looseOwn: 0, looseOpp: 0, carries: 0, carryDist: 0, decided: 0, xgSum: 0, combinations: 0, combinationReturns: 0, crosses:0, switches:0, firstTime:0, beachOnside:0, offsideCalls:0 };
  private nextAerial=0; // switch-of-play cooldown
  private nextCross=0; // cross cooldown: its own clock, so a switch of play never starves the wide play
  private aerialKind:'cross'|'switch'='switch';
  private carryAcc = 0; // distance covered in the current carry episode
  private carryOwner: string | null = null;

  // ---- public VFX reads (additive — consumed by BabylonStage's shot trail/particles) ----
  // TRUE only while a struck shot is genuinely in flight toward goal (released, unclaimed).
  // Flips false automatically on every resolution path: goal (goal-line crossing clears
  // ballIsShot), save/catch, parry, fizzle-out, out-of-bounds restart, or any claim.
  get shotActive(): boolean { return this.ballIsShot && this.ball.owner === null; }
  // ---- keeper dive / aerial reads (additive — consumed by choreo.ts, lane B of docs/bean-characters) ----
  /** The venue this match is played on (field → world scale, goal size). */
  get venue(): Readonly<LiveVenue> { return this.goalVenue; }
  /** A lofted ball in flight: its clock, flight time, peak height (m) and whether its target may head it. */
  get aerial(): { t: number; dur: number; peak: number; header: boolean } | null {
    if (this.loftDur <= 0 || !this.ball.lofted) return null;
    const a = this.aerialRead; a.t = this.loftT; a.dur = this.loftDur; a.peak = this.loftPeak; a.header = this.headerBall; return a;
  }
  private aerialRead = { t: 0, dur: 0, peak: 0, header: false };
  /** A keeper finishing a save at full stretch: he travels to where he met the ball (x, y) over t sim seconds. */
  get keeperDive(): Readonly<{ id: string; x: number; y: number; t: number }> | null { return this.gkDive; }
  /** The keeper stops a shot once it is this close to him (sim units). */
  get saveReach(): number { return P.gkReach + 1; }
  /** Sim seconds before the ball in flight can be stopped or received (the strike's keep-out). */
  get flightHold(): number { return Math.max(0, this.ballFlight); }
  private gkDive: { id: string; x: number; y: number; t: number } | null = null;
  /** [combos] combination plays, rebounds and skills (lib/town/match/combos.ts); null when switched off. */
  combos: Combos | null = null;
  /** A lofted ball its target will finish first time (volley / scissor / bicycle / diving header) if he meets it. */
  get acrobatic(): Readonly<{ to: string }> | null { return this.acro; }
  private acro: { to: string } | null = null; // an acrobatic first-time finish is harder than a set strike: xG × ACRO_XG
  // The keeper's save outcome is rolled at the strike (same 20 % deflection as before), so the view can shape
  // the hands before the contact: a high ball is tipped over the bar, anything else parried out to the side.
  private saveRoll = -1;
  /** How the keeper will deal with the shot in flight if he gets to it: 'catch' | 'parry' | 'tip' ('goal' = beaten). */
  get saveOutcome(): 'catch' | 'parry' | 'tip' | 'goal' {
    if (this.shotIsGoal) return 'goal';
    if (this.saveRoll >= 0 && this.saveRoll < 0.2) return this.lastKick.shotHeight >= 0.9 ? 'tip' : 'parry';
    return 'catch';
  }
  // A save further than this from the keeper is made at full stretch (a dive); he lands where he met it.
  private diveAt(id: string) {
    const g = this.players[id];
    if (!g || dist(g.x, g.y, this.ball.x, this.ball.y) < 3.5 || this.windupScale <= 0) return;
    // ≈ .19 real seconds from the hands meeting the ball to landing on the side (choreo DIVE timing).
    this.gkDive = { id, x: this.ball.x, y: this.ball.y, t: 0.19 * this.windupScale };
  }
  // ---- public reception read (additive — consumed by BabylonStage's first-touch pose) ----
  // ONE shared object mutated in place (zero per-frame allocations): who is taking a
  // first touch right now (id, else null), the countdown t / total dur of the cushion,
  // which foot takes the touch, and the yaw target (faceX/faceY, unit, field space) the
  // receiver's hips OPEN toward while cushioning — the bisector between where the ball
  // came from and where his next action points, so he half-turns instead of squaring up
  // to the passer. Foot convention: with y-down field coords, a player facing (fx,fy)
  // has his right-hand side along (-fy, fx).
  recv = { id: null as string | null, t: 0, dur: 0, foot: "R" as "L" | "R", faceX: 0, faceY: -1 };
  // ---- touch events (additive — consumed by choreo.ts) ----
  // A fixed ring of 8 preallocated events; touchSerial counts every touch ever emitted, so a
  // reader keeps its last serial and reads the newer ones (zero allocations per touch).
  touches: TouchEvent[] = Array.from({ length: 8 }, () => ({ serial: 0, kind: "receive" as TouchKind, id: "", other: null, team: "gold" as Team, height: 0, speed: 0, heavy: false, time: 0 }));
  touchSerial = 0;
  // ---- kick wind-up (CONTRACT §5) ----
  // An AI kick does not leave the foot the instant it is chosen: the kicker winds up for
  // windupSeconds(turn) real seconds (longer the further he must turn to face the target),
  // converted to sim time by windupScale (the live playback speed; 0 disables it).
  windupScale = 0.32;
  // [motion] receive settle (lib/town/match/matchMotion.ts, Nov 4 2026; 0 = off, the default, so headless sims are unchanged):
  // a receiver arriving at no more than twice this pace (sim u/s) stays at or below it through his first touch and
  // receiveSettleTime sim seconds after, so the view can show him slow down and step on the ball (sole control).
  receiveSettle = 0;
  receiveSettleTime = 0.15;
  private settleId: string | null = null;
  private settleT = 0;
  private windup: KickWindup | null = null;
  private releasing = false;
  private deciding = false;
  private passIntended: string | null = null; // the receiver a pass in flight was meant for (even if it's being cut out)
  private trapHeavy = false;
  private headerBall = false; // a cross in flight: its target may meet it at head height
  /** The kick being wound up right now (read-only for the view), else null. */
  get kickWindup(): Readonly<KickWindup> | null { return this.windup; }
  /** Who is calling for the ball: the target of a kick being wound up or of a pass in flight. */
  get callFor(): string | null {
    if (this.restart || this.goalHold > 0) return null;
    if (this.windup) return this.windup.to;
    return this.ball.owner === null && !this.ballIsShot && (this.ball.target || this.ball.intBy) ? this.passIntended : null;
  }
  private touch(kind: TouchKind, id: string, other: string | null, height: number, speed: number, heavy = false) {
    const e = this.touches[this.touchSerial % this.touches.length];
    this.touchSerial++;
    e.serial = this.touchSerial; e.kind = kind; e.id = id; e.other = other; e.team = this.players[id]?.team ?? "gold";
    e.height = height; e.speed = speed; e.heavy = heavy; e.time = this.stats.time;
  }
  // Defer an AI kick into a wind-up. Returns true when the kick was deferred (the caller stops);
  // the release re-enters the same doPass/doLoft/doShot/doClear with fresh positions.
  private defer(fromId: string, kind: KickWindup["kind"], to: string | null, firm = 1, loftKind: KickWindup["loftKind"] = "through"): boolean {
    if (!this.deciding || this.releasing || this.windupScale <= 0 || this.humans.has(fromId)) return false;
    if (this.windup) return true;
    const from = this.players[fromId], gy = this.atkGoalY(from.team);
    const t = to ? this.players[to] : null;
    const tx = t ? t.x : kind === "shot" ? 135 : from.x, ty = t ? t.y : gy;
    // body direction: his run, else the way the first touch opened him, else up the pitch
    let fx = from.vx, fy = from.vy;
    if (Math.hypot(fx, fy) < 12) { if (this.recv.id === fromId) { fx = this.recv.faceX; fy = this.recv.faceY; } else { fx = 0; fy = this.dirY(from.team); } }
    const turn = Math.abs(Math.atan2(fx * (ty - from.y) - fy * (tx - from.x), fx * (tx - from.x) + fy * (ty - from.y)));
    const dur = windupSeconds(turn) * this.windupScale;
    this.windup = { id: fromId, kind, to, firm, loftKind, t: dur, dur, tx, ty, turn };
    return true;
  }

  constructor(seed = 1, format: LiveFormat = "9v9", squads?: { gold: [string, number, number, Role][]; blue: [string, number, number, Role][] }) {
    this.goalVenue=liveVenueById(format);this.frameVenues=[this.goalVenue.yaw?{...this.goalVenue,yaw:0}:this.goalVenue];
    // deterministic PRNG so tests are reproducible
    let s = seed >>> 0;
    this.rng = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
    const gold = squads?.gold ?? (format === "11v11" ? GOLD_HOME_11 : format === "futsal" ? GOLD_HOME_5 : format === "beach" ? GOLD_HOME_BEACH : format === "7v7" ? GOLD_HOME_7 : GOLD_HOME);
    const blue = squads?.blue ?? (format === "11v11" ? BLUE_HOME_11 : format === "futsal" ? BLUE_HOME_5 : format === "beach" ? BLUE_HOME_BEACH : format === "7v7" ? BLUE_HOME_7 : BLUE_HOME);
    if (format === "futsal") { this.passMul = 1.22; this.humanPassCap = 1.6; } // zippier passing for the quick small-sided game; human passes capped at 1.6× (the court is 18.5 m wide)
    this.windupScale = format === "futsal" || format === "beach" ? 0.48 : 0.32; // = liveGameSpeed(format) in fieldRuntime, which sets it too
    if (format === "11v11") { this.allowLoft = true; this.humanSprintBoost = 1.3; this.humanChaseMul = 1; } // big field → balls over the top / crosses; adult human pace (see humanSprintBoost)
    // The pace ladder (humanPace): 9v9 90 %, futsal 80 %, beach 70 % of the 11v11 human's m/s; the 11v11 sprint boost + full-speed chasers.
    if (format === "9v9") { this.humanPace = 1.29; this.humanBallPace = 1.29; this.humanPassCap = 1.3 * PASS_POWER_MAX; this.humanSprintBoost = 1.3; this.humanChaseMul = 1; } // the cap: a full charge rolls no further than before (≤ 68 m of 69.5)
    if (format === "7v7") { this.humanPace = 1.72; this.humanBallPace = 1.5; this.humanSprintBoost = 1.3; this.humanChaseMul = 1; } // owner Nov 5 2026: "way too slow even for kids, match 9v9": run 3.62 -> 6.2 m/s like the 9v9 (sprint boost 1.3 keeps the sprint under the pose limit)
    if (format === "futsal") { this.humanPace = 1.4; this.humanBallPace = 1.075; this.humanSprintBoost = 1.3; this.humanChaseMul = 1; } // passes stay under the 1.6 court cap
    if (format === "beach") { this.humanPace = 1.39; this.humanBallPace = 1.08; this.humanSprintBoost = 1.3; this.humanChaseMul = 1; } // measured on sand (BEACH_LEGS)
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
    // Beach: five a side on sand. Small-sided structure like futsal (passMul > 1), but the ball goes up: lifted
    // passes, throws, crosses and balls over the top (allowLoft), volleys and overhead kicks; no offside.
    else if (format === "beach") this.T = { press: 1.6, lane: 1.8, misplace: 1.9, shoot: 1.8, openReq: 8, laneReq: 6, loftP: 0.14, switchAt: 3, carryP: 0.3, fwdAdv: 145, shotRange: 160, finish: 1.5, lineUp: 50, lineDn: 88 };
    if (format === "beach") { this.beach = true; this.passMul = 1.15; this.allowLoft = true; this.groundFriction = BEACH_GROUND_FRICTION; this.legs = BEACH_LEGS; }
    // Kick wind-up compensation: the wind-up gives keepers and lane defenders a beat to set
    // (fewer keeper-out-of-position goals, more read passes), so finishing is eased to hold
    // goals/game on the 96-seed balance sample (docs/pass-puzzle/CONTRACT.md, lane B status).
    this.T.finish *= WINDUP_FINISH[format];
    this.useBuildOut = format === "7v7";
    this.useOffside = format === "11v11" || format === "9v9"; // futsal & 7v7 don't play offside
    this.ai = format === "11v11" ? { ...formatAI(format), ...ELEVEN_FORMAT_AI } : formatAI(format); // 11v11 row: elevenAI.ts
    this.defend = defendAI(format);
    this.notes = formatNotes(format); // this format's coaching lines (11v11 lane: Eleven Park explains its own laws)
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
    this.combos = comboSettings.enabled ? new Combos(this, seed) : null; // [combos]
    this.kickOff("gold");
  }
  private add(id: string, team: Team, x: number, y: number, role: Role) {
    this.players[id] = { id, team, role, isGK: role === "gk", x, y, vx: 0, vy: 0, hx: x, hy: y, kick: 0, brake: 0, backpedal: 0, plant: 0, faceX: 0, faceY: 0 };
    (team === "gold" ? this.goldIds : this.blueIds).push(id);
    this.mom[id] = { floor: 0, cool: 0, back: false, backT: 0 };
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
    // 2nd-deepest opponent up the pitch — a two-slot scan (same answer as sort-and-pick, no per-call arrays)
    let a = -Infinity, b = -Infinity;
    for (const id of this.foes(t)) { const d = this.depth(t, this.players[id].y); if (d > a) { b = a; a = d; } else if (d > b) b = d; }
    return b > -Infinity ? b : a > -Infinity ? a : 400;
  }
  // a receiver is offside if, in the attacking half, they are CLEARLY beyond BOTH the
  // 2nd-last defender and the ball. Only enforced in 11v11/9v9 (futsal & youth 7v7 don't
  // play offside).
  private isOffside(t: Team, y: number) {
    if (!this.useOffside && !this.ai.offsideZone) return false;
    if (this.offsideFree !== null && this.ball.owner === this.offsideFree) return false; // restart's first pass (Law 11)
    const rd = this.depth(t, y);
    // 7v7 (US Youth): offside counts only past the opponent's build-out line (sevenAI.ts, lesson next7_offsideboundary)
    if (this.ai.offsideZone) return sevenOffside(rd, this.offsideLine(t), this.depth(t, this.ball.y));
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
    this.msg = "Offside!"; this.msgT = 1.8; this.stats.turnovers++; this.stats.offsideCalls++;
    this.offsidePass = null; this.passIntended = null; this.carrying = false; this.combination = null; this.counterT = 0; this.counterTeam = null;
    this.ball.lofted = false; this.ballIsShot = false; this.shotIsGoal = false; this.ballFlight = 0; this.lastFrom = null; this.passRelease = null;
    if (this.ai.teach) this.teach(this.notes.offside[0], this.notes.offside[1]);
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

  // ---- human control API (join a live game; N humans, each locked to his slot) ----
  /** Lock the slot `id` to a human (he keeps his own player: no auto-switching). Returns false for an unknown id (or a
   *  keeper while `humanKeepers` is off). */
  lockHuman(id: string): boolean {
    const p = this.players[id];
    if (!p || (p.isGK && !this.humanKeepers)) return false;
    if (!this.humans.has(id)) {
      this.humans.set(id, createHumanInput(id, p.team));
      this.humanTargets.set(id, { pass: { id: null, age: 0 }, forward: { id: null, age: 0 } });
      this.humanOn[p.team]++;
      const b = this.brain[id]; if (b) { b.lapse = 0; b.ox = 0; b.oy = 0; b.mode = 0; }
      if (this.windup?.id === id) this.windup = null;
    }
    this.syncPrimaryHuman();
    return true;
  }
  /** Give the slot back to the AI (he plays on from the same spot). */
  releaseHuman(id: string) {
    const h = this.humans.get(id);
    if (!h) return;
    this.humans.delete(id); this.humanTargets.delete(id); this.humanOn[h.team] = Math.max(0, this.humanOn[h.team] - 1);
    this.hkStretch.delete(id); this.hkSmother.delete(id);
    if (h.pressT > 0) { if (h.pressA) this.pressSet.delete(h.pressA); if (h.pressB) this.pressSet.delete(h.pressB); }
    if (!this.humans.size) this.dazed.clear();
    if (this.passTargetId && this.ball.owner === id) this.passTargetId = null;
    this.syncPrimaryHuman();
  }
  isHuman(id: string) { return this.humans.has(id); }
  /** A dead ball is being restarted (the AI walks the taker; the HUD says "get ready"). */
  get isRestart() { return this.restart !== null; }
  /** One frame of controls for the human on slot `id` (sim-space stick). */
  humanInput(id: string, frame: HumanFrame) { const h = this.humans.get(id); if (h) writeHumanInput(h, frame); }
  /** Put a player on a spot (a joiner's entry point, a substitute coming back on from the touchline). */
  placePlayer(id: string, x: number, y: number) {
    const p = this.players[id]; if (!p) return;
    p.x = clamp(x, 4, 266); p.y = clamp(y, 4, 396); p.vx = 0; p.vy = 0;
    const t = this.targets[id]; if (t) { t.x = clamp(p.x, 14, 256); t.y = clamp(p.y, 12, 388); }
  }
  /** The Pass (or Forward pass) target the assist shows for the human on slot `id` (null when he is not on the ball). */
  humanTarget(id: string, mode: PassMode = "short") { const t = this.humanTargets.get(id); return t ? (mode === "short" ? t.pass.id : t.forward.id) : null; }
  /** Multiplayer slice 2 (lib/town/match/matchNet.ts): this sim becomes a PUPPET of a friend's match (never stepped; snapshots write
   *  its players and ball). Clears the in-flight view state a stale step would otherwise keep drawing (wind-up, first touch, release,
   *  dive). Never called in a solo or AI-only match. */
  enterPuppet() {
    this.windup = null; this.releasing = false; this.passRelease = null; this.gkDive = null; this.recv.id = null; this.recv.t = 0; this.acro = null;
  }
  /** The friend who ran the match left and this phone takes it over: play on from the last snapshot with a dropped ball (Law 8:
   *  no restart owed, nobody's ball). */
  leavePuppet() {
    this.restart = null; this.goalHold = 0; this.goalQuick = false; this.quickTaker = null; this.goalReset.hidden = false; this.windup = null; this.ballIsShot = false; this.shotIsGoal = false;
    const b = this.ball; b.owner = null; b.target = null; b.intBy = null; b.vx = 0; b.vy = 0; b.height = 0; b.lofted = false;
    for (const id of this.ids) { const p = this.players[id], t = this.targets[id]; p.kick = 0; if (t) { t.x = clamp(p.x, 14, 256); t.y = clamp(p.y, 12, 388); } }
  }
  private syncPrimaryHuman() {
    const first = this.humans.values().next();
    this.userId = first.done ? null : first.value.id; this.userTeam = first.done ? null : first.value.team;
  }
  // Compat (the old "Play" island API, no callers left): lock the outfielder of `team` nearest the ball.
  enableUser(team: Team) { const id = this.nearestOfTeam(team, this.ball.x, this.ball.y); if (id) this.lockHuman(id); }
  // Wipe the scoreline and kick off fresh — called when the Play game (re)starts so a new
  // session always begins 0–0 rather than inheriting the attract-mode match's score.
  resetMatch() { this.score.gold = 0; this.score.blue = 0; this.goalHold = 0; this.goalNet = null; this.kickOff("gold"); }
  // Compat: per-frame input for the first human (act = pass on the ball / tackle without it).
  setUserInput(mx: number, my: number, shoot: boolean, act: boolean, extra?: { sprint?: boolean; through?: boolean; switchReq?: boolean; shootPower?: number; jockey?: boolean }) {
    if (!this.userId) return;
    const h = this.humans.get(this.userId)!;
    writeHumanInput(h, { mx, my, shoot, shootPower: extra?.shootPower, pass: act, tackle: act, through: extra?.through, sprint: extra?.sprint, jockey: extra?.jockey });
  }
  /** Pass assist context for a human on the ball (one reused object). */
  private assistContext(from: SimPlayer, h: HumanInput, mode: PassMode): PassContext {
    const c = this.passCtx ?? (this.passCtx = { from, aimX: 0, aimY: 0, dirY: -1, ids: this.ids, players: this.players, mode, offsideY: null, runners: this.runners });
    c.from = from; c.mode = mode; c.dirY = this.dirY(from.team); c.ids = this.ids; c.players = this.players;
    // No stick → no aim: the assist picks the most open teammate ahead.
    c.aimX = h.mag > 0.05 ? h.moveX : 0; c.aimY = h.mag > 0.05 ? h.moveY : 0;
    c.offsideY = this.offsideLineY(from.team);
    return c;
  }
  /** Sim y a receiver must not be beyond (the second-last defender / ball / halfway, as isOffside), null if none. */
  private offsideLineY(team: Team): number | null {
    // isOffside(team, y) is monotonic in depth: walk from the ball forward until it turns true.
    const dir = this.dirY(team);
    let y = this.ball.y;
    for (let i = 0; i < 80; i++) { const ny = y + dir * 5; if (ny < 4 || ny > 396) return null; if (this.isOffside(team, ny)) return y; y = ny; }
    return null;
  }
  /** Refresh the shown targets for a human on the ball (hysteresis so the marker never flickers). */
  private refreshHumanTargets(id: string, h: HumanInput, dt: number) {
    const t = this.humanTargets.get(id); if (!t) return;
    const from = this.players[id];
    for (const mode of ["short", "forward"] as const) {
      const c = this.assistContext(from, h, mode), s = mode === "short" ? t.pass : t.forward;
      let pick = pickPassTarget(c, this.assistOut); this.looseTier = 0;
      if (!pick && mode === "short") pick = this.loosePick(c); // a sloppy stick still finds a sensible teammate (PASS_HELP)
      // Hysteresis in the SAME cone the pick came from (Nov 5 2026): scored in the strict cone, a loose-fallback target was
      // "invalid" every frame, so the marker flipped at once between fallback picks (running past everyone at the 7v7 pace).
      const cur = s.id ? this.scoreAtTier(c, s.id, this.looseTier) : -Infinity;
      stickyTarget(s, dt, pick, this.assistOut.score, cur);
    }
  }
  /** No teammate in the stick's cone: a wide cone (PASS_HELP.looseCone), then no aim at all (the most open teammate
   *  ahead). Leaves `c` as it found it; `assistOut.score` is the winner's score in the cone it was found in. */
  private loosePick(c: PassContext) {
    c.coneCos = PASS_HELP.looseCone; let pick = pickPassTarget(c, this.assistOut); c.coneCos = undefined; this.looseTier = 1;
    if (!pick) { const ax = c.aimX, ay = c.aimY; c.aimX = c.aimY = 0; pick = pickPassTarget(c, this.assistOut); c.aimX = ax; c.aimY = ay; this.looseTier = 2; }
    return pick;
  }
  /** scorePassTarget under loosePick's tier: 0 = the stick's cone, 1 = the wide cone, 2 = no aim. Leaves `c` as found. */
  private scoreAtTier(c: PassContext, id: string, tier: number) {
    if (tier === 0) return scorePassTarget(c, id);
    if (tier === 1) { c.coneCos = PASS_HELP.looseCone; const s = scorePassTarget(c, id); c.coneCos = undefined; return s; }
    const ax = c.aimX, ay = c.aimY; c.aimX = c.aimY = 0; const s = scorePassTarget(c, id); c.aimX = ax; c.aimY = ay; return s;
  }
  /** A human plays a pass: the assisted target, led into space for a runner and weighted to arrive. */
  private humanPass(owner: string, h: HumanInput, mode: PassMode) {
    const o = this.players[owner], t = this.humanTargets.get(owner);
    const shown = t ? (mode === "short" ? t.pass.id : t.forward.id) : null;
    let tgt = shown ?? pickPassTarget(this.assistContext(o, h, mode));
    if (!tgt && mode === "short") tgt = this.loosePick(this.assistContext(o, h, mode));
    if (!tgt && mode === "forward") tgt = t?.pass.id ?? pickPassTarget(this.assistContext(o, h, "short"));
    tgt = tgt ?? this.safePass(owner) ?? this.nearestOfTeam(o.team, o.x, o.y, owner);
    if (!tgt) return;
    const r = this.players[tgt], moving = Math.hypot(r.vx, r.vy) > 12;
    if (mode === "forward" || moving) leadPoint(o.x, o.y, r, this.leadOut, mode === "forward" ? PASS_ASSIST.throughSpace : 0);
    else { this.leadOut.x = r.x; this.leadOut.y = r.y; }
    const d = Math.hypot(this.leadOut.x - o.x, this.leadOut.y - o.y);
    const charge = 1 + (PASS_POWER_MAX - 1) * clamp(h.passPower, 0, 1);
    this.humanLead = { x: this.leadOut.x, y: this.leadOut.y, speed: passSpeedFor(d, mode === "forward" ? PASS_ASSIST.arriveSpeed * 1.15 : PASS_ASSIST.arriveSpeed) * Math.min(this.passMul * 1.3 * charge * this.humanBallPace, this.humanPassCap) + (this.groundFriction - P.friction) * d, charge }; /* sand (beach) rolls dead sooner: the extra loss over d added back so it still arrives (0 on grass) */ // human passes zip like the shot (user: faster passing); hold-to-charge: tap = this pace, full hold = PASS_POWER_MAX ×
    this.doPass(owner, tgt, mode === "forward" ? 1.3 : 1);
    this.humanLead = null;
  }
  /** Long ball (hold Pass, owner Nov 4 2026): a lofted pass over the defenders to the best teammate at the distance the
   *  hold asks for (open, ahead, a runner in space, the stick's side), led into his run and timed to land soft at his feet;
   *  nobody suitable → into the space toward the goal. Its loft makes the match trail purple (matchEffects). */
  private humanLongBall(owner: string, h: HumanInput) {
    const o = this.players[owner], dir = this.dirY(o.team), c = clamp(h.passLong, 0, 1);
    const want = LONG_BALL.near + (LONG_BALL.far - LONG_BALL.near) * c, peak = LONG_BALL.peak0 + (LONG_BALL.peak1 - LONG_BALL.peak0) * c;
    let best: string | null = null, bs = -Infinity;
    for (const id of this.mates(o.team)) {
      const r = this.players[id]; if (id === owner || r.isGK || this.isOffside(o.team, r.y)) continue;
      const d = dist(o.x, o.y, r.x, r.y); if (d < 30) continue;
      let open = 40; for (const fid of this.foes(o.team)) { const f = this.players[fid]; if (!f.isGK) open = Math.min(open, dist(f.x, f.y, r.x, r.y)); }
      const ahead = (r.y - o.y) * dir, aim = h.mag > 0.3 ? ((r.x - o.x) * h.moveX + (r.y - o.y) * h.moveY) / d : 0, run = r.vy * dir > 10 ? 8 : 0;
      const sc = ahead * 0.35 - Math.abs(d - want) * 0.45 + Math.min(open, 30) * 1.2 + aim * 25 + run;
      if (sc > bs) { bs = sc; best = id; }
    }
    if (best) {
      const r = this.players[best];
      if (Math.hypot(r.vx, r.vy) > 12) leadPoint(o.x, o.y, r, this.leadOut, PASS_ASSIST.throughSpace); else { this.leadOut.x = r.x; this.leadOut.y = r.y; }
      this.humanLead = { x: this.leadOut.x, y: this.leadOut.y, speed: 0, peak };
      this.doPass(owner, best, 1);
      this.humanLead = null;
      return;
    }
    // Nobody to find: into the space toward the goal (a loose ball to chase), the same flight as the long pass.
    const tx = clamp(o.x * 0.7 + 135 * 0.3, 15, 255), ty = clamp(o.y + dir * want, 16, 384), L = dist(o.x, o.y, tx, ty);
    const base = clamp(L * 1.35 + 125, 185, 330), pace = base * this.humanBallPace, drag = P.friction * 0.35;
    this.launch(owner, tx, ty, pace, 0, null, peak);
    this.loftDur = -Math.log(Math.max(0.05, 1 - drag * L / pace)) / drag; this.lastKick.dur = this.loftDur;
    if (pace > base) this.landCap = Math.max(60, (base - drag * L) * 1.1); // the quicker flight still lands as soft (stays in a small court)
    this.passCd = 0.5; this.stats.passes++; this.lastOwner = owner;
  }
  /** Dribbling trick (Trick button, owner Nov 4 2026): stick pulled back = drag-back, else each tap plays the next of
   *  stepover → La Croqueta → drag-back, to the stick's side. For TRICK.window real seconds nobody can steal it and the
   *  opponents near him are bamboozled (slowed, a step lost). The view plays the authored move (combos.ts trick). */
  private humanTrick(o: SimPlayer, h: HumanInput) {
    const sp = Math.hypot(o.vx, o.vy), dir = this.dirY(o.team), hx = sp > 2 ? o.vx / sp : 0, hy = sp > 2 ? o.vy / sp : dir;
    const stick = h.mag > 0.3, dot = stick ? (h.moveX * hx + h.moveY * hy) / h.mag : 1, cross = stick ? (hx * h.moveY - hy * h.moveX) / h.mag : 0;
    h.trickKind = stick && dot < -0.35 ? "dragBack" : TRICK_KINDS[h.trickSerial % TRICK_KINDS.length];
    h.trickSide = Math.abs(cross) > 0.2 ? (cross > 0 ? 1 : -1) : h.trickSerial % 2 ? -1 : 1;
    h.trick = TRICK.window; h.trickCd = TRICK.cooldown; h.trickBoost = TRICK.boost; h.trickSerial++;
    for (const fid of this.foes(o.team)) {
      const f = this.players[fid]; if (f.isGK || this.humans.has(fid) || dist(f.x, f.y, o.x, o.y) > TRICK.radius) continue;
      this.dazed.set(fid, TRICK.window); f.vx *= 0.3; f.vy *= 0.3; // wrong-footed: he loses a step
    }
  }
  /** Tackle assist (owner Nov 5 2026): a human's tackle that does not win it cleanly from the front / side knocks the ball
   *  loose instead of missing: off the carrier's foot toward the tackler (± up to ~35°), the carrier barred from the
   *  re-claim, so it is a 50/50 the tackler usually wins (TACKLE_ASSIST.pickup). Humans only; no allocation. */
  private pokeAway(h: HumanInput, owner: string) {
    const u = this.players[h.id], b = this.ball;
    const a = (this.rng() - 0.5) * 1.2, dx = u.x - b.x, dy = u.y - b.y, L = Math.hypot(dx, dy) || 1;
    const c = Math.cos(a), sn = Math.sin(a), ux = dx / L, uy = dy / L, sp = TACKLE_ASSIST.pokeSpeed * (0.85 + this.rng() * 0.4);
    this.carrying = false; this.carryUntil = 0; this.windup = null; this.passRelease = null; this.passIntended = null;
    b.owner = null; this.endTrap(); b.target = null; b.intBy = null; b.height = 0; b.lofted = false; this.loftDur = 0;
    b.vx = (ux * c - uy * sn) * sp; b.vy = (ux * sn + uy * c) * sp;
    this.ballIsShot = false; this.shotIsGoal = false;
    this.possession = h.team; // his touch is the last touch
    this.lastFrom = owner; this.ballFlight = 0.1; this.deadT = 0;
    this.touch("tackle", h.id, owner, 0, Math.hypot(u.vx, u.vy));
    this.msg = "Poked it away!"; this.msgT = 0.9;
  }
  /** An AI tackle on a HUMAN carrier (owner Nov 4 2026: hard to be tackled): one roll; it wins at HUMAN_GUARD.tackleMul
   *  of the old rate, and a roll that would have won before is a near miss: the "Slipped away!" serial (rate-limited). */
  private slipOrTackle(h: HumanInput, p: number) {
    const r = this.rng();
    if (r < p * HUMAN_GUARD.tackleMul) return true;
    if (r < p && h.slipCd <= 0) { h.slipSerial++; h.slipCd = HUMAN_GUARD.slipCd; }
    return false;
  }
  /** Per step with humans: real-time timers, Press requests (two nearest NPC teammates of the carrier's opponents), the
   *  press ending (time up, the ball won or dead) and the bamboozled opponents recovering. No allocation per frame. */
  private humanMovesStep() {
    const rdt = this.realDt, owner = this.ball.owner, carrier = owner ? this.players[owner] : null;
    let changed = false;
    for (const h of this.humans.values()) {
      tickHumanTimers(h, rdt);
      // A short protection window after he gets the ball (HUMAN_GUARD.receive): nobody can tackle him at once.
      if (owner === h.id) { if (!h.hadBall) { h.hadBall = true; h.guard = HUMAN_GUARD.receive; } } else h.hadBall = false;
      if (h.pressT > 0) {
        h.pressT = Math.max(0, h.pressT - rdt);
        if (h.pressT <= 0 || this.restart || (carrier && carrier.team === h.team)) { h.pressT = 0; h.pressA = h.pressB = null; changed = true; }
      }
      if (h.pressReq > 0 && h.pressCd <= 0 && carrier && carrier.team !== h.team && !this.restart && !(carrier.isGK && this.keeperHands)) {
        h.pressReq = 0;
        let a: string | null = null, b: string | null = null, da = Infinity, db = Infinity;
        for (const id of this.mates(h.team)) {
          const q = this.players[id]; if (q.isGK || this.humans.has(id)) continue;
          const d = dist(q.x, q.y, carrier.x, carrier.y);
          if (d < da) { b = a; db = da; a = id; da = d; } else if (d < db) { b = id; db = d; }
        }
        if (a) { h.pressA = a; h.pressB = b; h.pressT = PRESS.seconds; h.pressCd = PRESS.cooldown; h.pressSerial++; changed = true; this.msg = "Press together!"; this.msgT = 0.9; }
      }
    }
    if (changed) { this.pressSet.clear(); for (const h of this.humans.values()) if (h.pressT > 0) { if (h.pressA) this.pressSet.add(h.pressA); if (h.pressB) this.pressSet.add(h.pressB); } }
    if (this.dazed.size) this.dazed.forEach(this.ageDazed);
  }
  private ageDazed = (t: number, id: string) => { if (t - this.realDt <= 0) this.dazed.delete(id); else this.dazed.set(id, t - this.realDt); };
  /** Press together: where presser `id` goes. The first (nearest) closes the near side goal-side of the carrier; the
   *  second cuts off the pass to the carrier's nearest teammate, so the two arrive from two angles instead of bunching. */
  private pressSpot(id: string, c: SimPlayer) {
    const out = this.pressOut, into = this.dirY(c.team) * -1;
    let first = false; for (const h of this.humans.values()) if (h.pressT > 0 && h.pressA === id) first = true;
    if (first) { const p = this.players[id], side = p.x >= c.x ? 1 : -1; out.x = c.x + side * 1.5; out.y = c.y + into * 2.5; return out; }
    let mx = 0, my = 0, md = Infinity;
    for (const mid of this.mates(c.team)) { if (mid === c.id) continue; const q = this.players[mid], d = dist(q.x, q.y, c.x, c.y); if (d < md) { md = d; mx = q.x; my = q.y; } }
    const L = md < Infinity ? md || 1 : 1;
    if (md < Infinity) { out.x = c.x + (mx - c.x) / L * 3.2; out.y = c.y + (my - c.y) / L * 3.2; } else { out.x = c.x; out.y = c.y - into * 3; }
    return out;
  }
  private pressOut = { x: 0, y: 0 };
  /** Press together: the tackle-chance multiplier for presser `id` on carrier `c` (both pressers on him = a double team). */
  private pressBoost(id: string, c: SimPlayer) {
    for (const h of this.humans.values()) {
      if (h.pressT <= 0 || (h.pressA !== id && h.pressB !== id)) continue;
      const other = h.pressA === id ? h.pressB : h.pressA, q = other ? this.players[other] : null;
      return q && dist(q.x, q.y, c.x, c.y) < PRESS.bothDist ? PRESS.both : PRESS.one;
    }
    return 1;
  }
  /** A human teammate calling for the ball with an open lane (the AI carrier answers it); null otherwise. */
  private callerFor(owner: string): string | null {
    if (!this.humans.size) return null;
    const o = this.players[owner];
    for (const h of this.humans.values()) {
      if (h.call <= 0 || h.team !== o.team || h.id === owner) continue;
      const r = this.players[h.id], d = dist(o.x, o.y, r.x, r.y);
      let lane = Infinity;
      for (const fid of this.foes(o.team)) { const f = this.players[fid]; if (!f.isGK && dist(f.x, f.y, o.x, o.y) > 5) lane = Math.min(lane, segmentDistance(f.x, f.y, o.x, o.y, r.x, r.y)); }
      const open = d >= 8 && d <= 200 && lane >= PASS_ASSIST.laneBlock && !this.isOffside(o.team, r.y);
      if (!this.lastCall || this.lastCall.id !== h.id || this.lastCall.time < this.stats.time - 1) this.lastCall = { id: h.id, open, time: this.stats.time };
      else this.lastCall.open = open;
      h.call = open ? 0 : h.call; // an open call is answered once
      if (open) return h.id;
    }
    return null;
  }
  // Each human's steering target from his stick. No stick: he holds his spot (he is in control, not the AI), except
  // that a pass played to him is still met (the receiver run is an assist) and a restart he takes is AI-walked.
  private applyHumanTargets() {
    for (const h of this.humans.values()) {
      const id = h.id, p = this.players[id];
      if (this.restart && this.restart.taker === id) continue;
      const own = this.ball.owner, b = this.ball;
      if (h.lunge > 0 && own && this.players[own].team !== h.team && !p.isGK) {
        // TACKLE ASSIST lunge (owner Nov 5 2026): straight at the carrier's next step, whatever the stick says.
        const c = this.players[own];
        if (dist(c.x, c.y, p.x, p.y) > TACKLE_ASSIST.assistR * 1.3) h.lunge = 0; // he outran the lunge: beaten, back to the stick
        else { this.targets[id] = { x: clamp(c.x + c.vx * 0.12, 14, 256), y: clamp(c.y + c.vy * 0.12, 12, 388) }; continue; }
      }
      if (!own && !this.restart && !(this.goalHold > 0) && !b.target && !b.intBy && !p.isGK && this.lastFrom !== id && b.height < 1) {
        // Loose ball near him (TACKLE_ASSIST magnet): the stick pointing at it, or standing idle right by it, takes him onto it.
        const bx = b.x - p.x, by = b.y - p.y, bd = Math.hypot(bx, by);
        if (bd > 0.5 && (h.mag > 0.05 ? bd < TACKLE_ASSIST.magnetR && (bx * h.moveX + by * h.moveY) / (bd * h.mag) >= TACKLE_ASSIST.magnetCos : bd < TACKLE_ASSIST.idleR)) {
          this.targets[id] = { x: clamp(b.x + b.vx * 0.1, 14, 256), y: clamp(b.y + b.vy * 0.1, 12, 388) };
          continue;
        }
      }
      if (h.jockey && this.ball.owner && this.players[this.ball.owner].team !== h.team) {
        // JOCKEY (hold while defending): sit just goal-side of the carrier and pace him without diving in.
        const c = this.players[this.ball.owner];
        const sgn = Math.sign(this.ownGoalY(h.team) - c.y) || 1; // toward our own goal
        this.targets[id] = { x: clamp(c.x, 14, 256), y: clamp(c.y + sgn * PASS_ASSIST.jockeyGap, 12, 388) };
        continue;
      }
      if (h.mag > 0.05) {
        const ux = h.moveX / h.mag, uy = h.moveY / h.mag;
        this.targets[id] = { x: clamp(p.x + ux * 44, 14, 256), y: clamp(p.y + uy * 44, 12, 388) };
      } else if (this.ball.owner === id || !(this.ball.owner === null && (this.ball.target === id || this.ball.intBy === id))) {
        this.targets[id] = { x: clamp(p.x, 14, 256), y: clamp(p.y, 12, 388) }; // hold
      }
      if (p.isGK) { this.keeperBox(p.team, this.targets[id]); continue; }
      const retreat = this.buildOutTeam;
      if (retreat && p.team !== retreat) this.targets[id].y = retreatBuildOutY(this.targets[id].y, retreat);
    }
  }
  /** Is the keeper of `team` a human? (false without humans: zero work for AI-only matches) */
  private humanKeeperOf(team: Team) {
    if (!this.humans.size) return false;
    for (const h of this.humans.values()) if (h.team === team && this.players[h.id].isGK) return true;
    return false;
  }
  /** Human keepers: start a dive on A (buffered), keep the stretch window and the smother at an opponent's feet. */
  private humanKeeperStep(dt: number) {
    for (const [id, t] of this.hkStretch) {
      const left = t - dt;
      if (left <= 0) { this.hkStretch.delete(id); this.hkSmother.delete(id); continue; }
      this.hkStretch.set(id, left);
      const owner = this.ball.owner, g = this.players[id];
      if (this.hkSmother.get(id) && owner && this.players[owner].team !== g.team && this.protect <= 0 && dist(g.x, g.y, this.ball.x, this.ball.y) < P.gkReach * 0.9) {
        this.hkSmother.delete(id);
        this.carrying = false; this.windup = null;
        this.ball.owner = id; this.possession = g.team;
        this.startTrap(id); // hands: a clean gather (startTrap no-ops the trap for keepers)
        this.touch("tackle", id, owner, 0, Math.hypot(g.vx, g.vy));
        this.passCd = 0.7; this.protect = 0.8; this.lastFrom = null;
        this.stats.turnovers++; this.msg = "Smothered by the keeper!"; this.msgT = 1.0;
      }
    }
    for (const h of this.humans.values()) {
      if (h.save <= 0) continue;
      const g = this.players[h.id];
      if (!g.isGK || this.restart || this.goalHold > 0 || this.ball.owner === h.id) { h.save = 0; continue; }
      if (this.gkDive?.id === h.id) continue; // in the air already: the press waits (buffered) for the landing
      if (!this.humanDiveAim(g, h)) continue; // a shot being wound up: keep the press until the strike
      h.save = 0;
      const a = this.hkAim;
      this.gkDive = { id: h.id, x: a.x, y: a.y, t: a.t };
      this.hkStretch.set(h.id, a.t + HUMAN_KEEPER.stretchHold);
      if (a.smother) this.hkSmother.set(h.id, this.rng() < HUMAN_KEEPER.smother); else this.hkSmother.delete(h.id);
    }
  }
  /** Where a human keeper's dive goes (into hkAim); false when A should stay buffered (an opponent winding up a shot). */
  private humanDiveAim(g: SimPlayer, h: HumanInput): boolean {
    const a = this.hkAim, ogy = this.ownGoalY(g.team), b = this.ball, H = HUMAN_KEEPER;
    a.smother = false;
    let tx: number, ty: number, tArr: number = H.diveTime;
    const toGoal = Math.sign(ogy - b.y);
    if (this.ballIsShot && !b.owner && this.possession !== g.team && Math.abs(b.vy) > 1 && Math.sign(b.vy) === toGoal) {
      // THE assist: dive to where the shot crosses his line (the goal line once it is past him), whatever the stick says.
      const lineY = (g.y - b.y) * toGoal > 0 ? g.y : ogy;
      tArr = Math.max(0, (lineY - b.y) / b.vy);
      tx = b.x + b.vx * tArr; ty = lineY;
    } else if (this.windup && this.windup.kind === "shot" && this.players[this.windup.id].team !== g.team) {
      return false;
    } else if (b.owner && this.players[b.owner].team !== g.team && dist(g.x, g.y, b.x, b.y) < H.diveRange + P.gkReach) {
      tx = b.x; ty = b.y; a.smother = true; // at the carrier's feet
    } else if (!b.owner && dist(g.x, g.y, b.x, b.y) < H.diveRange + P.gkReach) {
      tx = b.x + b.vx * 0.1; ty = b.y + b.vy * 0.1; // onto a loose ball
    } else {
      const m = h.mag > 0.05 ? h.mag : 1, ux = h.mag > 0.05 ? h.moveX / m : 1, uy = h.mag > 0.05 ? h.moveY / m : 0;
      tx = g.x + ux * H.idleDive; ty = g.y + uy * H.idleDive;
    }
    const dx = tx - g.x, dy = ty - g.y, L = Math.hypot(dx, dy);
    if (L > H.diveRange) { tx = g.x + (dx / L) * H.diveRange; ty = g.y + (dy / L) * H.diveRange; }
    a.x = clamp(tx, 8, 262); a.y = clamp(ty, 6, 394);
    a.t = clamp(tArr * 0.85, H.diveMin, H.diveTime);
    return true;
  }
  /** Keep a human keeper's steering target inside his box (the area the AI keeper uses). */
  private keeperBox(team: Team, t: { x: number; y: number }) {
    const ogy = this.ownGoalY(team), s = Math.sign(200 - ogy), H = HUMAN_KEEPER;
    t.x = clamp(t.x, 135 - H.boxHalf, 135 + H.boxHalf);
    const depth = clamp((t.y - ogy) * s, 2, H.boxDepth);
    t.y = ogy + s * depth;
  }
  kickOff(conceding: Team) {
    this.combination=null;this.carryUntil=0;this.carrying=false;
    for (const id of this.ids) {
      const p = this.players[id];
      p.x = p.hx; p.y = p.hy; p.vx = 0; p.vy = 0;
      p.brake = 0; p.backpedal = 0; p.plant = 0; p.faceX = 0; p.faceY = 0;
      const m = this.mom[id]; if (m) { m.floor = 0; m.cool = 0; m.back = false; m.backT = 0; }
    }
    this.ball.x = 135; this.ball.y = 200; this.ball.vx = 0; this.ball.vy = 0; this.ball.height = 0;
    this.ball.target = null; this.ball.intBy = null; this.ball.lofted = false; this.loftDur = 0;
    this.possession = conceding;
    this.ball.owner = (conceding === "gold" ? this.goldIds : this.blueIds)[2]; // a central defender
    this.passCd = 0.8;
    this.lastFrom = null;
    this.counterT = 0; this.counterTeam = null; // a restart is never a counter
    this.restart = null; this.gkDive = null;
    if (this.goalQuick || this.goalReset.hidden) { this.goalQuick = false; this.quickTaker = null; this.goalReset.hidden = false; }
    this.endTrap(); // cold placement — the restart choreography owns the ball
  }
  // A goal does NOT teleport everyone back to their spots — the ball is placed dead on
  // the centre spot, both teams JOG back into shape, the conceding side's taker walks
  // over, and after the setup beat the kick-off is taken. (resetMatch/ctor still use the
  // instant kickOff, which is correct for a cold start.)
  /** Beach match clock (periods, extra time, penalties, the full-time beat). Returns true when it owned this step. */
  private beachClock(dt: number): boolean {
    if (this.fullTime > 0) {
      this.fullTime -= this.realDt; this.msgT -= dt;
      this.ball.vx = 0; this.ball.vy = 0; this.ball.height = Math.max(0, this.ball.height - dt * 2);
      this.ball.owner = null; this.ball.target = null; this.ball.intBy = null; this.ballIsShot = false; this.shotIsGoal = false; this.windup = null;
      for (const id of this.ids) { const p = this.players[id]; if (p.kick > 0) p.kick = Math.max(0, p.kick - dt / 0.45); this.targets[id] = { x: p.hx, y: p.team === "gold" ? Math.max(214, p.hy) : Math.min(186, p.hy) }; }
      this.presserId = null; this.chaserIds.clear();
      this.integrate(dt);
      if (this.fullTime <= 0) {
        this.score.gold = 0; this.score.blue = 0; this.period = 1; this.gameStart = this.clock; this.periodEnd = this.clock + BEACH_PERIOD;
        this.stageKickoff(this.results.length % 2 ? "blue" : "gold");
        this.teach("New game on Sharks Beach", "Five a side including the keeper, all barefoot on the sand");
      }
      return true;
    }
    // The whistle waits for a goal celebration and for a shot already on its way (the referee lets it finish).
    if (this.goalHold > 0 || this.clock < this.periodEnd || this.shotActive) return false;
    const level = this.score.gold === this.score.blue;
    if (this.period < 3) {
      this.period++; this.periodEnd += BEACH_PERIOD;
      this.teach(`End of period ${this.period - 1} of 3`, "A beach match has three periods of 12 minutes, with short breaks to drink water and hear the coach");
      this.stageKickoff(this.period === 2 ? "blue" : "gold");
      return false;
    }
    if (this.period === 3 && level) {
      this.period = 4; this.periodEnd += BEACH_EXTRA;
      this.teach("Level after three periods: extra time!", "FIFA beach matches can't end in a draw: 3 minutes of extra time, and no golden goal");
      this.stageKickoff("blue");
      return false;
    }
    const result: { gold: number; blue: number; pens?: { gold: number; blue: number }; extra: boolean } = { gold: this.score.gold, blue: this.score.blue, extra: this.period === 4 };
    if (level) {
      // Shoot-out: five kicks each, then sudden death (decided here; the feed tells it kick by kick in one line).
      const pens = { gold: 0, blue: 0 };
      for (let round = 0; round < 25; round++) {
        if (this.rng() < 0.72) pens.gold++;
        if (this.rng() < 0.72) pens.blue++;
        if (round >= 4 && pens.gold !== pens.blue) break;
        if (round < 4) { const left = 4 - round; if (pens.gold > pens.blue + left || pens.blue > pens.gold + left) break; }
      }
      if (pens.gold === pens.blue) pens.gold++;
      result.pens = pens;
      const winner = pens.gold > pens.blue ? "Gold" : "Blue";
      this.teach(`Penalties! ${winner} win the shoot-out ${Math.max(pens.gold, pens.blue)}–${Math.min(pens.gold, pens.blue)}`, "Still level after extra time: five penalties each, then sudden death. Beach soccer always has a winner");
    } else {
      const winner = this.score.gold > this.score.blue ? "Gold" : "Blue";
      this.teach(`Full time: ${winner} win ${Math.max(this.score.gold, this.score.blue)}–${Math.min(this.score.gold, this.score.blue)}`, result.extra ? "Decided in extra time" : "Three periods played, shake hands with the other team");
    }
    this.results.push(result);
    this.period = 5; this.fullTime = BEACH_FULL_TIME; this.restart = null; this.msg = "Full time"; this.msgT = BEACH_FULL_TIME;
    return true;
  }
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
      this.nearestOfTeam(conceding, this.ball.x, this.ball.y, null) ??
      this.mates(conceding)[0];
    this.restart = { kind: "kickoff", t: 2.0, x: 135, y: 200, taker, carry: "fetch" };
  }
  /** The outfielder of `team` nearest the centre spot (the quick reset's kick-off taker; a human too). */
  private spotTaker(team: Team) {
    let taker: string | null = null, bd = Infinity;
    for (const id of this.mates(team)) { const p = this.players[id]; if (p.isGK) continue; const d = dist(p.x, p.y, 135, 200); if (d < bd) { bd = d; taker = id; } }
    return taker ?? this.mates(team)[0];
  }
  /** Sim seconds per real second (the live game speed): GOAL_RESET is in real seconds. */
  private wsReal() { return this.windupScale > 0 ? this.windupScale : 1; }
  /** Quick goal reset (GOAL_RESET, human matches): the faded ball lands straight on the centre spot (goalReset.serial: the view's
   *  arrival effect) and the conceding side's outfielder nearest the spot (a human too: the AI walks him there, then the ball is
   *  his for the pass) takes the kick-off after a short beat. Nobody fetches the ball from the net. */
  private stageQuickKickoff(conceding: Team) {
    this.goalQuick = false; this.goalReset.hidden = false; this.goalReset.serial++;
    const b = this.ball;
    b.x = 135; b.y = 200; b.vx = 0; b.vy = 0; b.height = 0;
    b.owner = null; b.target = null; b.intBy = null; b.lofted = false; this.loftDur = 0;
    this.ballIsShot = false; this.shotIsGoal = false; this.carrying = false;
    this.possession = conceding;
    this.counterT = 0; this.counterTeam = null;
    this.lastFrom = null;
    const taker = this.quickTaker && this.players[this.quickTaker]?.team === conceding ? this.quickTaker : this.spotTaker(conceding);
    this.quickTaker = null;
    this.restart = { kind: "kickoff", t: GOAL_RESET.arrive * this.wsReal(), x: 135, y: 200, taker, quick: true };
    this.msg = "Kick-off"; this.msgT = 1.4;
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
      // ball sits dead where it lies while the taker jogs over to collect it. Radius 10.5 (not 6):
      // a scored ball rests INSIDE the net (as deep as y=3), past the pitch clamp the taker walks
      // under — from the closest legal standing spot (target clamp y=12, and a hard-braking
      // defender stops a few tenths short of it) he must still be able to reach in and collect it.
      // (was 9: exactly the edge case, which the momentum model's harder brake exposed — takers
      // stood 9.3 u from the ball until the failsafe, doubling every kick-off's dead time)
      if (dist(tk.x, tk.y, this.ball.x, this.ball.y) < 10.5 || r.t < -6) r.carry = "carrying";
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
    const ready=this.ringReady(r,tk.team)&&(r.kind!=='goalkick'||!this.useBuildOut||this.buildOutReady(tk.team))&&(r.kind!=='kickoff'||this.ids.every(id=>{if(id===r.taker)return true;const p=this.players[id];return (p.team==='gold'?p.y>=201:p.y<=199)&&(p.team===tk.team||dist(p.x,p.y,135,200)>=25);}));
    if ((ready || (r.quick && r.t < -GOAL_RESET.grace * this.wsReal())) && ((r.t <= 0 && near) || (r.kind!=='kickoff'&&r.t < -4))) {
      this.ball.owner = r.taker;
      this.possession = tk.team;
      // Beach: the first kick of a kick-in or kick-off may not score directly (Laws 8 and 15).
      if (this.beach && (r.kind === "kickin" || r.kind === "kickoff")) { this.noDirect = r.taker; this.tellHuman(r.taker, r.kind === "kickin" ? BEACH_HUMAN_NOTES.kickin : BEACH_HUMAN_NOTES.kickoff); }
      if (this.ai.restartOffsideFree && r.kind !== "kickoff") this.offsideFree = r.taker; // no offside from a throw-in, goal kick or corner
      this.endTrap(); // restart take is its own choreography — no trap (dribbleBall still eases the pickup)
      this.protect = 0.5; this.passCd = 0.35; this.lastFrom = null; this.hold = 0;
      this.counterT = 0; this.counterTeam = null; // a restart is never a counter
      this.restart = null;
    }
  }

  /** Futsal: a kick-in / corner waits until every opponent is ~5 m away (1 m grace; after 3 s it goes anyway). */
  private ringReady(r: { kind: string; t: number; x: number; y: number }, team: Team) {
    const R = this.ai.restartRing;
    if (R <= 0 || (r.kind !== "kickin" && r.kind !== "corner") || r.t < -3) return true;
    const kx = this.goalVenue.width / 250, ky = this.goalVenue.length / 380;
    for (const id of this.foes(team)) { const p = this.players[id]; if (!p.isGK && Math.hypot((p.x - r.x) * kx, (p.y - r.y) * ky) < R - 1) return false; }
    return true;
  }
  /** Retreat applies to keeper control / goal kicks, never a centre kickoff. */
  get buildOutTeam():Team|null {
    if(!this.useBuildOut)return null;
    if(this.restart)return this.restart.kind==='goalkick'?this.players[this.restart.taker].team:null;
    const owner=this.ball.owner?this.players[this.ball.owner]:null;
    if(owner?.isGK&&this.gkFeetId===owner.id)return null; // 7v7: a back pass to his feet is open play (no retreat)
    return owner?.isGK?owner.team:null;
  }
  /** 7v7 (formatAI.handsBuildOut): the keeper who took a team-mate's pass with his FEET (pass-back rule: no hands, no
   *  build-out retreat) until he releases it; null otherwise. */
  private gkFeetId:string|null=null;
  /** 7v7 telemetry (tests, audits): back passes to the keeper, his feet touches, onside waits held by off-ball attackers. */
  seven={backPasses:0,keeperFeet:0,onsideWaits:0};
  /** The keeper on the ball is holding it in his hands (false only for a 7v7 back pass to his feet). Read by the view. */
  get keeperHands():boolean{return !(this.gkFeetId!==null&&this.ball.owner===this.gkFeetId);}
  /** 7v7: the carrier's own keeper when he is a safe back pass (in range, unmarked, a clear lane), else null. */
  private keeperRecycleTarget(fromId:string):string|null{
    const from=this.players[fromId];
    for(const id of this.mates(from.team)){
      const g=this.players[id];if(!g.isGK)continue;
      const d=dist(from.x,from.y,g.x,g.y);if(d<20||d>140)return null;
      const nf=this.nearestFoe(id,g.x,g.y);if(nf&&nf.d<28)return null;
      for(const fid of this.foes(from.team)){const f=this.players[fid];if(f.isGK||dist(f.x,f.y,from.x,from.y)<8)continue;if(segDist(f.x,f.y,from.x,from.y,g.x,g.y)<this.T.laneReq+2)return null;}
      return id;
    }
    return null;
  }
  private buildOutReady(team:Team){return this.foes(team).every(id=>behindBuildOut(this.players[id].y,team,.5));}

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
      // never play a team-mate into an offside position — unless (9v9 coaching) the passer misreads a forward who has
      // drifted beyond the line: the pass goes, and the offside is called when he receives it (see offsidePass)
      if (this.isOffside(from.team, t.y) && !(this.ai.offsideMisread > 0 && t.role === "fwd" && !from.isGK && this.rng() < this.ai.offsideMisread)) continue;
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
  /** Sparse pitch-control read: compare arrival times only at plausible receiving options.
   * Original heuristic, inspired by pitch-control analysis; no full-field grid or ML runtime.
   */
  private bestAerial(fromId:string):string|null{
    const noSwitch=this.stats.time<this.nextAerial,noCross=this.stats.time<this.nextCross;
    if(this.goalVenue.id==='futsal'||noSwitch&&noCross)return null;
    const from=this.players[fromId],gy=this.atkGoalY(from.team),foes=this.foes(from.team);
    let crowd=0;for(const id of foes)if(dist(from.x,from.y,this.players[id].x,this.players[id].y)<65)crowd++;
    let best:string|null=null,bestValue=-Infinity;
    for(const id of this.mates(from.team)){
      const t=this.players[id];if(id===fromId||t.isGK||this.isOffside(from.team,t.y))continue;
      const width=Math.abs(t.x-from.x),d=dist(t.x,t.y,from.x,from.y);
      const cross=!noCross&&Math.abs(from.x-135)>62&&Math.abs(from.y-gy)<125&&Math.abs(t.x-135)<55&&Math.abs(t.y-gy)<80&&width>48;
      const switching=!noSwitch&&width>110&&(from.x-135)*(t.x-135)<0&&Math.abs(t.y-from.y)<95&&crowd>=2;
      if((!cross&&!switching)||d>250||d<65)continue;
      const tx=clamp(t.x+t.vx*.18,15,255),ty=clamp(t.y+t.vy*.18,16,384);
      const arrival=.18+dist(t.x+t.vx*.18,t.y+t.vy*.18,tx,ty)/(P.runSpeed*ROLE_MOVEMENT[t.role].speed);
      let defender=Infinity;
      for(const fid of foes){const f=this.players[fid];defender=Math.min(defender,.18+dist(f.x+f.vx*.18,f.y+f.vy*.18,tx,ty)/(P.runSpeed*ROLE_MOVEMENT[f.role].speed));}
      const advantage=defender-arrival;if(advantage<.12)continue;
      const value=advantage*35+(cross?20:width*.09)-d*.025;
      if(value>bestValue){bestValue=value;best=id;this.aerialKind=cross?'cross':'switch';}
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
    // 9v9 build-up: pressed in our own half → the keeper is the free player (formatAI.keeperOutlet)
    let outlet = 0;
    if (this.ai.keeperOutlet > 0 && !from.isGK && this.depth(from.team, from.y) < 200) { const pf = this.nearestFoe(fromId, from.x, from.y); if (pf && pf.d < P.pressDist) outlet = this.ai.keeperOutlet; }
    let best: string | null = null;
    let bestScore = -Infinity;
    for (const id of this.mates(from.team)) {
      if (id === fromId) continue;
      const t = this.players[id];
      if (this.isOffside(from.team, t.y)) continue; // don't recycle into an offside team-mate either
      if (t.isGK && this.ai.keeperBackPass && this.gkPlayed[from.team] && this.depth(from.team, t.y) < 200) {
        // futsal Law 12: the keeper already released it — he can't have it back in his half until an opponent touches it
        this.futsalStats.backPassBlocked++;
        const pf = this.deciding ? this.nearestFoe(fromId, from.x, from.y) : null;
        if (pf && pf.d < P.pressDist) this.teach(FUTSAL_NOTES.backPass[0], FUTSAL_NOTES.backPass[1], "fbackpass", 90);
        continue;
      }
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
        (t.isGK ? -50 + outlet : 0) + // only go back to the keeper as a last resort (9v9: his outlet under pressure)
        this.rng() * 6;
      if (score > bestScore) { bestScore = score; best = id; }
    }
    return best;
  }

  private launch(fromId: string, tx: number, ty: number, speed: number, height: number, target: string | null, loft = 0) {
    const from = this.players[fromId];
    if(this.combination&&!(fromId===this.combination.wall&&target===this.combination.runner))this.combination=null;
    this.carrying=false;this.carryUntil=0;
    this.passRelease=target?{id:fromId,x:from.x,y:from.y,tx,ty,target}:null;
    this.offsideFree = null; this.offsidePass = null; // any new kick ends a restart's offside exemption and a pending call
    this.gkFeetId = null; // 7v7: the keeper's back-pass touch ends with his release
    this.windup = null; this.passIntended = null; this.headerBall = false; this.acro = null; this.saveRoll = -1; this.powerShot = false; this.landCap = 0;
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
    if (from.isGK && this.ai.keeperBackPass) this.gkPlayed[from.team] = true; // futsal Law 12: no back pass to him in his half now
    // Beach: a keeper's throw (all his distribution is from the hands) and the first kick of a kick-in or kick-off can
    // never score directly — if it goes straight in, it is a goal clearance for the other side.
    if (this.beach) { this.directBan = from.isGK || this.noDirect === fromId; this.noDirect = null; }
    this.ballFlight = 0.16; // in flight — the passer can't instantly re-collect it
    // lofted ball: arc its height over the flight (see step) so it clears the defenders
    this.ball.lofted = loft > 0;
    if (loft > 0) { this.loftPeak = loft; this.loftT = 0; this.loftDur = Math.max(0.55, L / (speed * 0.72)); }
    else { this.loftDur = 0; }
    this.kicks++; this.lastKick.height = height; this.lastKick.loft = loft; this.lastKick.dur = this.loftDur;
    this.lastKick.shotHeight=0;this.lastKick.fromY=from.y;this.lastKick.goalY=ty;this.lastKick.aimX=tx;
    from.kick = 1;
    this.touch("kick", fromId, target, height + loft, speed);
  }
  /** 11v11 lane (elevenAI.ts defendAI.releaseRead): the kick is being struck and the chosen receiver has drifted
   *  offside during the wind-up. Most of the time the passer sees the flag-bait and switches to an onside team-mate
   *  (returned); otherwise (null) the ball goes and the offside is called on his touch: a mistimed run, about once a
   *  game, explained in the feed. Neutral (releaseRead 0) for every other format: no check, no rng draw. */
  private reReadRun(fromId: string, toId: string): string | null {
    const read = this.defend.releaseRead, t = this.players[toId];
    if (read <= 0 || fromId === this.userId || !t || t.isGK || !this.isOffside(t.team, t.y) || this.rng() >= read) return null; // the human's pass is his own
    const alt = this.safePass(fromId);
    return alt && alt !== toId ? alt : null;
  }
  // a lofted ball over the top — flies through the air (no ground interception), arcs down
  // to a forward runner. Used only in 11v11 (bigger field).
  private doLoft(fromId: string, toId: string,kind:'through'|'cross'|'switch'='through') {
    if (this.defer(fromId, "loft", toId, 1, kind)) return;
    { const alt = this.reReadRun(fromId, toId); if (alt) { this.doPass(fromId, alt, 1.1); return; } } // 11v11: see reReadRun
    const from = this.players[fromId];
    const t = this.players[toId];
    const offLoft = this.defend.releaseRead > 0 && !t.isGK && this.isOffside(from.team, t.y) ? t : null; // 11v11: a ball over the top to a man already beyond the line is flagged too
    const dir = this.dirY(from.team);
    const tx = clamp(t.x+(kind==='through'?0:t.vx*.18),15,255);
    const ty = clamp(t.y+(kind==='through'?dir*14:t.vy*.18),16,384);
    const D = dist(from.x, from.y, tx, ty);
    const speed = clamp(D * 1.5 + 165, 250, 430);
    // (beach: a small court and a light ball — flatter lifts, still over a defender's head)
    const peak=this.beach?(kind==='cross'?2.5:kind==='switch'?Math.min(3.2,2.2+D*.004):2.9):kind==='cross'?3.2:kind==='switch'?Math.min(5,3+D*.006):4.4;
    this.launch(fromId, tx, ty, speed, 0, toId, peak);
    if (offLoft) this.offsidePass = { id: toId, x: offLoft.x, y: offLoft.y }; // whistled if he is the one who meets it
    this.passIntended = toId; this.headerBall = kind === "cross";
    // In range of goal a cross or ball over the top is sometimes met first time (acrobatic finish).
    // Beach: much more often (volleys and overhead kicks are the sand game's signature finishes), and a ball over the
    // top may be met in the air too, so an overhead kick can meet it above head height.
    const nearGoal = kind !== 'switch' && dist(t.x, t.y, 135, this.atkGoalY(from.team)) < 75;
    if (nearGoal && this.rng() < (this.beach ? 0.55 : 0.28)) this.acro = { to: toId };
    if (this.beach && nearGoal && this.acro) this.headerBall = true;
    if(kind!=='through'){
      // Integrate the same air drag as ballLogic so the ball lands at its receiving lane.
      const drag=P.friction*.35;this.loftDur=-Math.log(Math.max(.05,1-drag*D/speed))/drag;this.lastKick.dur=this.loftDur;
      const cool=this.stats.time+(this.goalVenue.id==='7v7'?7:5);if(kind==='cross')this.nextCross=cool;else this.nextAerial=cool;
      if(kind==='cross')this.stats.crosses++;else this.stats.switches++;
      this.tacticalReason=kind==='cross'?'High cross: find the runner arriving in the box':'Switch play: escape pressure into the far-side space';
      this.msg=kind==='cross'?'High cross':'Switch of play';this.msgT=1.6;
    }
    this.passCd = 0.5;
    this.stats.passes++;
    this.lastOwner = fromId;
  }
  // firm: pass pace multiplier — >1 is a driven/hard ball, <1 is a gentle roll-in.
  private doPass(fromId: string, toId: string, firm = 1) {
    if (this.defer(fromId, "pass", toId, firm)) return;
    { const alt = this.reReadRun(fromId, toId); if (alt) { this.doPass(fromId, alt, firm); return; } } // 11v11: see reReadRun
    const from = this.players[fromId];
    const t = this.players[toId];
    const dir = this.dirY(from.team);
    // NB: offside is respected by NOT selecting offside receivers (bestPass/safePass filter) —
    // a turnover-call here proved too disruptive to balance, so the AI just plays onside.
    // (9v9 opts in to rare, honest calls: only a pass the passer misread — the receiver visibly beyond the line now.)
    const offAt = this.ai.offsideMisread > 0 && this.isOffside(from.team, t.y) ? t : null;
    // pressure at the moment of release — a pressured player can misplace the pass,
    // which is the main STEADY source of turnovers (self-limiting: no pressure → accurate)
    const nf = this.nearestFoe(fromId, from.x, from.y);
    const pressure = nf ? nf.d : 99;
    let ox = 0;
    let oy = 0;
    // a player who just won the ball (protect>0) has steadied it → clean pass;
    // otherwise pressure can misplace it (self-limiting turnover source)
    if (pressure < P.pressDist && this.protect <= 0 && !this.humanLead) { // a human's assisted pass is never misplaced
      const err = (P.pressDist - pressure) / P.pressDist; // 0 (edge) .. 1 (right on top)
      if (this.rng() < err * 0.18 * this.T.misplace * this.fairMul) { // fairness: long monopolies get sloppier
        ox = (this.rng() * 2 - 1) * err * 11;
        oy = (this.rng() * 2 - 1) * err * 11;
      }
    }
    let tx = t.x + ox;
    let ty = t.y + dir * 5 + oy; // lead the runner a touch
    // [combos] a through ball / cut-back is played into the runner's path, not to his feet
    const comboLead = this.combos ? this.combos.passLead(fromId, toId) : null; if (comboLead) { tx = comboLead.x; ty = comboLead.y; }
    // Pass assist (a human's pass): led into the runner's space and weighted to arrive (passAssist.ts).
    const assisted = this.humanLead && this.humans.has(fromId) ? this.humanLead : null;
    if (assisted) { tx = assisted.x; ty = assisted.y; }
    // weight the pass so it ARRIVES at the receiver's feet; firmness varies the pace so
    // driven balls zip in flat while recycles roll in gently (still reaches the target)
    const D = dist(from.x, from.y, tx, ty);
    const speed = assisted ? assisted.speed : clamp((D * 1.68 + 134) * firm * this.passMul, 210 * this.passMul, 346 * this.passMul); // zips — well faster than any runner (futsal quicker); slight global bump
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
    // Beach: sand stops a ground ball, so anything but a short pass (≈5 m) is lifted — chipped over the lane and
    // controlled on the thigh or chest. A lifted ball is harder (not impossible) to cut out.
    const long = assisted?.peak ?? 0; // a human's long ball (hold Pass): lofted over the lane
    const lift = long > 0 || (this.beach && !from.isGK ? (D > 55 || (laneDef !== null && laneD < laneW && D > 30)) : false);
    if (laneDef && laneD < laneW) {
      // a defender who's read the lane can cut it out; a driven/risky ball (firm > 1) is
      // easier to read than a gentle recycle — most passes still complete
      const risk = clamp(0.22 + (firm - 1) * 0.18, 0.1, 0.38);
      const pInter = clamp(risk - (laneD / laneW) * risk, 0, risk);
      // A human's pass to the highlighted target (Pass ring / Forward marker) is cut out half as often (PASS_HELP, kids).
      const shown = assisted ? this.humanTargets.get(fromId) : undefined, help = shown && (shown.pass.id === toId || shown.forward.id === toId) ? PASS_HELP.interceptMul : 1;
      if (this.rng() < pInter * (long > 0 ? 0.25 : lift ? 0.6 : 1) * help) intercepted = true;
    }
    if (lift || (this.beach && from.isGK && D > 55)) {
      // Lifted pass / keeper's throw: the same pace and air drag as a loft, flight timed to land at the target.
      const to = intercepted && laneDef ? laneDef : null, lx = to ? to.x : tx, ly = to ? to.y : ty, LD = dist(from.x, from.y, lx, ly);
      const base = clamp(LD * 1.35 + 125, 185, 330) * (from.isGK ? 1.1 : 1), charge = assisted && !long ? assisted.charge ?? 1 : 1, drag = P.friction * 0.35;
      const pace = base * charge * (assisted ? this.humanBallPace : 1); // a human's charged pass the sand lifts keeps its hold pace (tap = the AI's pace; AI passes never read it)
      this.launch(fromId, lx, ly, pace, 0, to ? null : toId, long > 0 ? long : clamp(0.75 + LD * 0.009, 0.9, from.isGK ? 2.4 : 1.9));
      this.loftDur = -Math.log(Math.max(0.05, 1 - drag * LD / pace)) / drag; this.lastKick.dur = this.loftDur;
      if (pace > base) this.landCap = Math.max(60, (base - drag * LD) * 1.1); // lands about as soft as a tap's (it still reaches him)
      if (to) this.ball.intBy = to.id;
    } else if (intercepted && laneDef) {
      // ball is played into the defender who reads it — visibly travels to them
      this.launch(fromId, laneDef.x, laneDef.y, speed * 0.92, height, null);
      this.ball.intBy = laneDef.id;
    } else {
      this.launch(fromId, tx, ty, speed, height, toId);
    }
    this.passIntended = toId;
    if (offAt && !intercepted) this.offsidePass = { id: toId, x: offAt.x, y: offAt.y }; // whistled when he receives it
    if (this.ai.teach && t.isGK && !from.isGK && !intercepted && pressure < P.pressDist) this.teach(this.notes.keeper[0], this.notes.keeper[1], "keeper", 70);
    if (this.ai.coach7 && t.isGK && !from.isGK && !intercepted) { this.seven.backPasses++; this.teach(SEVEN_NOTES.backPass[0], SEVEN_NOTES.backPass[1], "keeper7", 60); } // 7v7: bld_7_usekeeper
    const prior=this.combination;
    this.combination=null;
    if(!intercepted&&prior?.wall===fromId&&prior.runner===toId){
      this.stats.combinationReturns++;
    }else if(!intercepted&&!from.isGK&&!t.isGK&&D>=18&&D<=(this.passMul>1?105:90)&&Math.abs(t.y-from.y)<(this.passMul>1?70:55)&&!this.lastManRisk(fromId)){
      const side=from.x>=t.x?1:-1;
      const futsal=this.passMul>1;
      const rx=clamp(t.x+side*(futsal?20:24),22,248),ry=clamp(from.y+dir*(futsal?28:38),28,372);
      if(!this.isOffside(from.team,ry)){
        this.combination={runner:fromId,wall:toId,team:from.team,x:rx,y:ry,expires:this.stats.time+(futsal?2.2:2.8)};
        this.tacticalReason=futsal&&t.role==='fwd'?"Pivot link: lay off to the rotating runner":"Pass and run beyond the wall player";
        this.stats.combinations++;
      }
    }
    this.carryUntil=0;
    this.passCd = 0.48;
    this.stats.passes++;
  }
  private doShot(fromId: string, xgMul = 1) { // [combos] xgMul: quality of a planned first-time finish
    if (this.defer(fromId, "shot", null)) return;
    const from = this.players[fromId];
    const gy = this.atkGoalY(from.team);
    // Outcome is decided AT THE STRIKE (same philosophy as passes): an xG from range and
    // angle picks goal / saved / wide, then the ball is placed to SELL that outcome —
    // a goal arrows for the corner with the keeper reading it late, a save is hit close
    // enough for a set keeper, a miss rolls just wide and restarts with the other team.
    const distGoal = dist(from.x, from.y, 135, gy);
    const angle = Math.abs(from.x - 135);
    let xg = clamp(0.34 - (distGoal - 28) * 0.0035, 0.05, 0.34) * clamp(1.15 - angle / 60, 0.35, 1) * this.T.finish * xgMul * this.ai.finishMul; // [combos] xgMul
    // Beach: game state — a side two up protects its lead (fewer bodies forward, a worse chance), a side behind throws
    // everyone forward (the keeper included). Keeps the high-scoring sand game a contest instead of a runaway.
    if (this.beach) { const lead = from.team === "gold" ? this.score.gold - this.score.blue : this.score.blue - this.score.gold; xg *= lead >= 2 ? BEACH_LEAD_XG[0] : lead === 1 ? BEACH_LEAD_XG[1] : lead <= -1 ? BEACH_LEAD_XG[2] : 1; }
    const roll = this.rng();
    const side = this.rng() < 0.5 ? -1 : 1;
    let aimx: number;
    // A human in goal decides it himself (his position and dive): never a pre-decided goal against him.
    const humanGk = this.humanKeeperOf(from.team === "gold" ? "blue" : "gold");
    this.shotIsGoal = roll < xg && !humanGk;
    if (this.shotIsGoal) this.stats.decided++; // decided-at-strike goals (leak telemetry: must equal goals scored by AI)
    this.stats.xgSum += xg; // shot-quality telemetry (avg chance quality = xgSum / shots)
    if (roll < xg) {
      aimx = 135 + side * GHALF * (0.88 + this.rng() * 0.11); // right in the corner — past the dive
      this.shotRead = 20; // keeper picks it up far too late
    } else if (roll < xg + 0.3) {
      aimx = 135 + side * GHALF * (1.2 + this.rng() * 0.42); // dragged wide — far enough that some run OUT (goal kick), not always gathered
      if(roll<xg+.07)aimx=135+side*GHALF*1.08; // a narrow miss strikes a post
      else if(roll<xg+.12)aimx=135+side*GHALF*.45; // high miss clips the bar
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
    if (roll < xg) spd = Math.max(spd, dist(from.x, from.y, aimx, gy) * this.groundFriction + 75);
    // Compact-court strikes should snap toward goal rather than read like a pass.
    if (this.goalVenue.id === 'futsal') spd *= 1.3;
    else if (this.beach) spd *= 1.2;
    this.launch(fromId, aimx, gy, spd, 1.0, null);
    this.saveRoll = this.rng();
    // Placement is presentation metadata: preserve the existing outcome and random sequence.
    // Some finishes stay low; the strongest corner placements rise into the upper net.
    this.lastKick.shotHeight=roll<xg*.65?.96:roll<xg?.18:roll>=xg+.07&&roll<xg+.12?1.25:.45;
    this.ballIsShot = true;
    this.shotIsGoal = roll < xg && !humanGk; // re-assert AFTER launch() wipes flight state
    this.shotAim = { x: aimx, y: gy }; // remembered so a decided goal can be re-steered if it ever stalls
    this.passCd = 0.65;
    this.stats.shots++;
    if (from.team === "gold") this.stats.shotsGold++; else this.stats.shotsBlue++;
    this.msg = "Shot!"; this.msgT = 1.0;
  }
  // the human's shot — a driven, corner-placed rocket (aimed to the side the player is
  // facing) that flies flat and hard, so it beats the keeper and rips into the net.
  private doUserShot(fromId: string, h: HumanInput) {
    const from = this.players[fromId];
    const gy = this.atkGoalY(from.team);
    // Aim: where the kid's facing crosses the goal line, then a gentle assist (passAssist.shotAim) toward the corner
    // away from the keeper, inside the posts. It bends the aim a little; the keeper still decides the outcome.
    const fy = h.faceY, towards = (gy - from.y) * fy > 0 && Math.abs(fy) > 0.15
    const raw = towards ? from.x + (h.faceX / fy) * (gy - from.y) : 135 + (h.faceX >= 0 ? 1 : -1) * GHALF * 0.6;
    let keeperX = 135;
    for (const fid of this.foes(from.team)) if (this.players[fid].isGK) keeperX = this.players[fid].x;
    // shot power (0..1): a tap places a firm shot, a full hold rips a rocket.
    const pw = clamp(h.shootPower, 0, 1), aimed = Number.isFinite(h.aimX) && Number.isFinite(h.aimH);
    // Aimed (Shoot held, a corner picked on the goal mouth, owner Nov 4 2026): the mark, always inside the posts (the
    // forgiveness), tighter with more charge; else the auto-aim above (the 1-tap shot for little kids).
    const aimx = aimed ? 135 + clamp(h.aimX, -1, 1) * GHALF * (SHOT_AIM.inLow + (SHOT_AIM.inFull - SHOT_AIM.inLow) * pw) : shotAim(clamp(raw, 135 - GHALF * 2, 135 + GHALF * 2), keeperX, GHALF);
    // ~20% over the original (1.25 + 0.55·pw) so the human's strike rips too; a full charge is the power shot (shotPace).
    // The compact courts snap like their AI strikes (doShot: futsal ×1.3, beach ×1.2).
    this.launch(fromId, aimx, gy, P.shotSpeed * shotPace(pw) * (this.goalVenue.id === 'futsal' ? 1.3 : this.beach ? 1.2 : 1) * this.humanBallPace, 0.5 + 0.6 * pw, null);
    this.lastKick.shotHeight = aimed ? (h.aimH >= 0.75 ? SHOT_AIM.high : h.aimH <= 0.25 ? SHOT_AIM.low : SHOT_AIM.mid) : .22+.74*pw;
    this.powerShot = pw >= POWER_SHOT.full; h.shotSerial++; h.shotPw = pw; h.shotAimed = aimed; h.aimX = h.aimH = NaN;
    this.saveRoll = this.rng();
    this.ballIsShot = true;
    this.shotIsGoal = false; // no pre-decided outcome for the human
    this.shotRead = 80; // the keeper reads a human strike honestly — placement & power decide it
    this.ballFlight = 0.05; // barely any keep-out — it's a strike, not a lay-off
    this.passCd = 0.65;
    this.stats.shots++;
    if (from.team === "gold") this.stats.shotsGold++; else this.stats.shotsBlue++;
    this.msg = "Shot!"; this.msgT = 1.0;
  }
  /** Beach keeper on the ball: everything leaves his hands within 4 seconds (Law 12) — a roll-out to a free
   *  team-mate close by, or a long throw to start the attack; never a punt (no kicking the ball out of the hands). */
  private beachKeeper(id: string, o: SimPlayer, pressured: boolean) {
    this.carrying = false;
    const fwd = this.bestPass(id), keep = this.safePass(id);
    if (fwd && (pressured || this.rng() < 0.6)) this.doPass(id, fwd, 1.15);
    else if (keep) this.doPass(id, keep, 0.95);
    else if (fwd) this.doPass(id, fwd, 1.15);
    else this.doClear(id);
    if (this.windup?.id === id || this.ball.owner !== id) this.teach("Keeper's throw", "Beach keepers start attacks with their hands: 4 seconds to release it, and no kicking it out of the hands", "gkthrow", 45);
    void o;
  }
  private doClear(fromId: string) {
    if (this.defer(fromId, "clear", null)) return;
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
  /** This step's real seconds (the match clock's share of the sim dt). */
  private realDt = 0;
  private stepOnce(dt: number) {
    this.stats.time += dt;this.realDt = this.windupScale > 0 ? dt / this.windupScale : dt;this.clock += this.realDt;
    if (this.beach && this.beachClock(dt)) return;
    if (this.windup && (this.restart || this.goalHold > 0)) this.windup = null;
    const combination=this.combination;
    if(combination&&(this.stats.time>combination.expires||this.possession!==combination.team||this.restart||this.goalHold>0))this.combination=null;

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
      // the 3 team-mates nearest the scorer run in to mob him (selected in place: no per-frame arrays)
      const huggers = this.huggerIds; huggers[0] = huggers[1] = huggers[2] = null;
      if (scorer) {
        for (let k = 0; k < 3; k++) {
          let bd = Infinity;
          for (const mid of this.mates(scoringTeam)) {
            if (mid === scorer.id || this.players[mid].isGK || mid === huggers[0] || mid === huggers[1]) continue;
            const d = dist(this.players[mid].x, this.players[mid].y, scorer.x, scorer.y);
            if (d < bd) { bd = d; huggers[k] = mid; }
          }
        }
      }
      const fade = clamp(this.goalHold / 1.8, 0, 1); // celebration run decays as the beat ends
      for (const id of this.ids) {
        const p = this.players[id];
        let tx = p.hx; let ty = p.hy; // everyone else begins the jog back to shape
        if (scorer && id === scorer.id) {
          // wheel away toward the near touchline, decelerating as the beat closes
          tx = p.x + (p.x >= 135 ? 1 : -1) * 34 * fade;
          ty = p.y + (scoringTeam === "gold" ? 26 : -26) * fade;
        } else if (scorer && (id === huggers[0] || id === huggers[1] || id === huggers[2])) {
          tx = scorer.x + (p.x >= scorer.x ? 7 : -7);
          ty = scorer.y + (p.y >= scorer.y ? 5 : -5);
        }
        if (id === this.quickTaker) { tx = 135; ty = 200 + (p.team === "gold" ? 3 : -3); } // quick reset: straight to the spot
        this.setTarget(id, clamp(tx, 14, 256), clamp(ty, 12, 388));
      }
      this.presserId = null; this.chaserIds.clear();
      this.integrate(dt);
      if (this.goalQuick && !this.goalReset.hidden && this.goalHold <= (GOAL_RESET.hold - GOAL_RESET.fadeAt) * this.wsReal()) this.goalReset.hidden = true;
      if (this.goalHold <= 0) { const conceding: Team = this.goalNet === "top" ? "blue" : "gold"; this.goalNet = null; if (this.goalQuick) this.stageQuickKickoff(conceding); else this.stageKickoff(conceding); }
      return;
    }

    // ---- match arc & fatigue ----
    // one attract "match" is ~4 minutes: fresh legs in the opening, a lull past the hour
    // mark, and — when the score is close — an urgent finale; then the cycle renews.
    // legsMul only nudges AI top speed a few percent, and tired legs also bias the
    // decision-making toward safer passes (see ballLogic).
    // (beach: the 180 s game — three periods — is stretched over the same 240 s arc)
    const mt = this.beach ? Math.min(239, (this.clock - this.gameStart) * 4 / 3) : this.stats.time % 240;
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
    if (this.offsideFree !== null && this.ball.owner !== this.offsideFree && !this.restart) this.offsideFree = null; // taker lost it first
    if (this.ball.owner && this.ball.owner === this.lastOwner) this.hold += dt;
    else this.hold = 0;
    this.lastOwner = this.ball.owner;

    if (this.possession === "gold") this.stats.possGold += dt; else this.stats.possBlue += dt;

    // who a Pass would go to right now, per human on the ball (receiver marker; hysteresis in refreshHumanTargets).
    // Zero work when no human is on the ball.
    this.passTargetId = null;
    if (this.humans.size) {
      const owner = this.ball.owner, h = owner ? this.humans.get(owner) : undefined;
      for (const [id, t] of this.humanTargets) if (id !== owner && (t.pass.id || t.forward.id)) { t.pass.id = t.forward.id = null; }
      if (h && owner) { this.refreshHumanTargets(owner, h, dt); this.passTargetId = this.humanTargets.get(owner)?.pass.id ?? null; }
    }
    if (this.ai.keeperBackPass) {
      if (this.possession === "gold" || this.restart?.kind === "kickoff") this.gkPlayed.blue = false;
      if (this.possession === "blue" || this.restart?.kind === "kickoff") this.gkPlayed.gold = false;
    }
    if (this.humans.size) this.humanKeeperStep(dt);
    if (this.humans.size) this.humanMovesStep();
    if (this.restart) this.restartLogic(dt);
    else this.ballLogic(dt);
    this.combos?.step(dt); // [combos] plan bookkeeping, rebounds, pending skills
    if (this.windup && this.windup.id !== this.ball.owner) this.windup = null; // robbed mid wind-up: no ghost kick or call
    this.updateShape(dt); // team line heights first (the shared prior)…
    this.brainLogic(dt); // …then each player's throttled individual read of it
    this.computeTargets(dt);
    if (this.humans.size) this.applyHumanTargets();
    this.integrate(dt);
    // input buffering: an action pressed just before you can act is held for a short window
    // so it fires the instant it's legal (instead of being dropped).
    for (const h of this.humans.values()) tickHumanInput(h, dt, this.ball.owner === h.id);
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
    const o=this.players[id],dir=this.dirY(o.team);
    let best=-1;
    // Three short forward corridors: straight, left half-space, right half-space.
    // Read only on the existing decision clock. Store one selected heading for the run.
    for(const side of [0,-.6,.6]){
      const dx=side,dy=dir*Math.sqrt(1-side*side);
      let lane=this.passMul>1?36:45;
      if(o.x+dx*lane<18||o.x+dx*lane>252)continue;
      for(const fid of this.foes(o.team)){
        const f=this.players[fid];
        const fx=f.x-o.x,fy=f.y-o.y,along=fx*dx+fy*dy;
        if(along>=-2&&Math.abs(fx*dy-fy*dx)<15)lane=Math.min(lane,Math.max(0,along));
      }
      const score=lane-(side===0?0:3);
      if(score>best){best=score;this.carryDirection.x=dx;this.carryDirection.y=dy;}
    }
    return Math.max(0,best);
  }
  /** Read on demand by diagnostics; no new rendering or simulation loop. */
  get tacticalIntent(){
    return {reason:this.tacticalReason,combination:this.combination?{...this.combination}:null,
      carrying:this.carrying,carryDirection:{...this.carryDirection},presser:this.presserId,
      defense:{...this.defenseIntent,reason:"First defender presses; goal-side cover protects the lane; remaining unit recovers compactly"},
      style:this.passMul>1?"futsal rotations and pivot links":"outdoor width and depth"};
  }
  /** Defenders standing in the shooting lane from (x, y) to the goal on y = gy (keepers excluded). */
  private shotBlockers(team: Team, x: number, y: number, gy: number) {
    let n = 0;
    for (const fid of this.foes(team)) { const f = this.players[fid]; if (!f.isGK && segDist(f.x, f.y, x, y, 135, gy) < 7) n++; }
    return n;
  }
  /** The extra pass: an open, onside team-mate in a clear lane whose chance clearly beats the shooter's (futsalAI). */
  private extraPassTarget(ownerId: string): string | null {
    if (this.rng() >= this.ai.extraPass) return null;
    const o = this.players[ownerId], gy = this.atkGoalY(o.team);
    const own = chanceQuality(o.x, o.y, gy) * laneFactor(this.shotBlockers(o.team, o.x, o.y, gy));
    let best: string | null = null, bq = 0;
    for (const id of this.mates(o.team)) {
      if (id === ownerId) continue;
      const t = this.players[id];
      if (t.isGK || this.isOffside(o.team, t.y)) continue;
      const d = dist(o.x, o.y, t.x, t.y);
      if (d < 14 || d > 120) continue;
      const nf = this.nearestFoe(id, t.x, t.y);
      if (nf && nf.d < 10) continue; // he must be free to take it
      let blocked = false;
      for (const fid of this.foes(o.team)) {
        const f = this.players[fid];
        if (f.isGK || dist(f.x, f.y, o.x, o.y) < 8) continue;
        if (segDist(f.x, f.y, o.x, o.y, t.x, t.y) < this.T.laneReq) { blocked = true; break; }
      }
      if (blocked) continue;
      const q = chanceQuality(t.x, t.y, gy) * laneFactor(this.shotBlockers(o.team, t.x, t.y, gy)) * 0.9; // receiving costs a touch
      if (q > bq) { bq = q; best = id; }
    }
    return best && isBetterChance(own, bq, 1.35) ? best : null;
  }
  /** Man-oriented marking (formatAI manMark): every defender but the presser picks up an outfield attacker other than
   *  the carrier — cheapest goal-side spot first, sticky so pairs don't swap every beat. Re-picked ~3 Hz and the moment
   *  the ball changes hands; allocation-free (preallocated scratch). */
  private updateMarks(defTeam: Team, presser: string | null) {
    if (this.restart?.kind === "kickoff") { // both teams are back in their halves: nobody is marking anybody
      if (this.markTeam) { for (const id of this.ids) this.markOf[id] = null; this.markTeam = null; }
      return;
    }
    const now = this.stats.time, fresh = defTeam !== this.markTeam;
    if (!fresh && now < this.markNext) return;
    if (fresh) for (const id of this.ids) this.markOf[id] = null; // the side that just won it stops marking
    this.markTeam = defTeam; this.markNext = now + 0.3;
    const k = this.mk, carrier = this.ball.owner, gy = this.ownGoalY(defTeam);
    let nd = 0, na = 0;
    for (const aid of this.foes(defTeam)) {
      const a = this.players[aid];
      if (a.isGK || aid === carrier) continue;
      markSpot(this.markPt, a.x, a.y, gy, this.ball.x, this.ball.y, MARK_GAP, MARK_SAG);
      k.att[na] = aid; k.sx[na] = this.markPt.x; k.sy[na] = this.markPt.y; na++;
    }
    for (const did of this.mates(defTeam)) {
      const d = this.players[did];
      if (d.isGK || (carrier && did === presser)) { this.markOf[did] = null; continue; }
      const was = fresh ? null : this.markOf[did];
      let pi = -1;
      for (let j = 0; j < na; j++) if (k.att[j] === was) pi = j;
      k.ids[nd] = did; k.dx[nd] = d.x; k.dy[nd] = d.y; k.prev[nd] = pi; nd++;
    }
    assignMarks(k.dx, k.dy, nd, k.sx, k.sy, na, k.prev, 30, k.out, k.used);
    for (let i = 0; i < nd; i++) {
      const id = k.ids[i], m = k.out[i] >= 0 ? k.att[k.out[i]] : null;
      if (!fresh && m && this.markOf[id] && m !== this.markOf[id]) this.futsalStats.markSwitches++;
      this.markOf[id] = m;
    }
    if (fresh && this.possession !== defTeam && this.ball.owner) this.teach(FUTSAL_NOTES.marking[0], FUTSAL_NOTES.marking[1], "fmark", 90);
  }
  private combinationReturn(owner:string):string|null {
    const c=this.combination;
    if(!c||c.wall!==owner||this.stats.time>c.expires)return null;
    const wall=this.players[owner],runner=this.players[c.runner];
    const d=dist(wall.x,wall.y,runner.x,runner.y);
    if(d<14||d>95||(runner.y-wall.y)*this.dirY(wall.team)<8||this.isOffside(wall.team,runner.y))return null;
    const nearest=this.nearestFoe(runner.id,runner.x,runner.y);
    if(nearest&&nearest.d<9){this.combination=null;this.tacticalReason="Return runner marked: find another route";return null;}
    for(const fid of this.foes(wall.team)){
      const f=this.players[fid];
      if(dist(f.x,f.y,wall.x,wall.y)>8&&segDist(f.x,f.y,wall.x,wall.y,runner.x,runner.y)<this.T.laneReq){this.combination=null;this.tacticalReason="Return lane screened: recycle or carry";return null;}
    }
    this.tacticalReason="Return into the space opened by the first pass";
    return runner.id;
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
  /** Shared preview/commit geometry: presentation and control choose the same foot. */
  get receptionRadius(){return P.ctrlRadius;}
  receptionPlan(id:string,bvx=this.ball.vx,bvy=this.ball.vy){
    const p=this.players[id];
    const tight = this.humans.has(id);
    // next-action direction: take it in STRIDE — the receiver's own movement first,
    // else his attacking direction (a standing player still plays it slightly in front)
    let ux = p.vx, uy = p.vy;
    const mv = Math.hypot(ux, uy);
    if (mv > 12) { ux /= mv; uy /= mv; } else { ux = 0; uy = this.dirY(p.team); }
    if(!tight){
      // Prepare the NEXT action before contact instead of opening toward the chase
      // back to the incoming ball. The same plan drives preview and actual cushion.
      const wall=this.combination?.wall===id?this.combination:null;
      if(wall){const runner=this.players[wall.runner],dx=runner.x-p.x,dy=runner.y-p.y,L=Math.hypot(dx,dy)||1;ux=dx/L;uy=dy/L;}
      else if(uy*this.dirY(p.team)<.2){ux=0;uy=this.dirY(p.team);}
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
    return {foot,faceX:fx,faceY:fy,ux,uy,mv,tight};
  }
  private startTrap(id: string) {
    const p = this.players[id];
    this.ball.lofted = false; this.loftDur = 0;
    const bvx = this.ball.vx, bvy = this.ball.vy;
    this.ball.vx = 0; this.ball.vy = 0;
    if (p.isGK) { this.trapT = 0; this.recv.id = null; this.recv.t = 0; this.trapHeavy = false; return; } // hands — caught clean, no trap
    const inSp = Math.hypot(bvx, bvy); // pace still on the arriving ball
    const {foot,faceX:fx,faceY:fy,ux,uy,mv,tight}=this.receptionPlan(id,bvx,bvy);
    const rx=-fy,ry=fx;
    // ---- touch weight ----
    // firmer arriving ball + tired legs + a lapsing mind = heavier touch that pops
    // further out for a beat before control tightens (never for the human's tight touch)
    const pace = clamp(inSp / 340, 0, 1);
    const lapse = (this.brain[id]?.lapse ?? 0) > 0 ? 1 : 0;
    const heavy = pace * 0.6 + this.fatigue * 0.25 + lapse * 0.5;
    let ahead = (2 + Math.min(3, mv / 28)) * (tight ? 0.8 : 1); // in-stride 2..5, tighter for the human
    let dur = 0.14 + pace * (tight ? 0.1 : 0.16); // cushion ~0.14-0.3s
    this.trapHeavy = false;
    if (!tight && this.rng() < heavy * 0.3) {
      this.trapHeavy = true;
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
    // [motion] receive settle: a slow arrival controls the ball before moving off (AI only; the human keeps his pace).
    if (this.receiveSettle > 0 && id !== this.userId && Math.hypot(p.vx, p.vy) <= this.receiveSettle * 2) { this.settleId = id; this.settleT = dur + this.receiveSettleTime; } else this.settleId = null;
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
      const k = 1-Math.exp(-dt/(this.humans.size && this.humans.has(o.id) ? HUMAN_FEEL.trapTau : .11)); // the human's touch settles quicker
      this.ball.x += (tx - this.ball.x) * k;
      this.ball.y += (ty - this.ball.y) * k;
    } else {
      if (this.trapT > 0) this.endTrap(); // owner changed mid-trap (tackle) — stale trap dies
      const k = 1-Math.exp(-dt/(this.humans.size && this.humans.has(o.id) ? HUMAN_FEEL.dribbleTau : .05)); // attached: tight, continuous tracking (stickier for the human)
      this.ball.x += (fx - this.ball.x) * k;
      this.ball.y += (fy - this.ball.y) * k;
    }
    if (dist(this.ball.x, this.ball.y, fx, fy) > 16) { this.ball.x = fx; this.ball.y = fy; this.endTrap(); }
    this.ball.height = this.ball.height > 0 ? Math.max(0, this.ball.height - dt * 3) : 0;
    this.ball.vx = 0; this.ball.vy = 0;
  }

  // AI kicks chosen inside ballLogic wind up first; a direct doPass/doShot (tests, tools) is immediate.
  private ballLogic(dt: number) {
    this.deciding = true;
    try { this.ballLogicStep(dt); } finally { this.deciding = false; }
  }
  private ballLogicStep(dt: number) {
    let owner = this.ball.owner;
    if (this.noDirect && owner !== null && owner !== this.noDirect) this.noDirect = null; // the restart taker lost it first

    // ---- HUMAN tackle (any human pressing Tackle while an opponent has the ball) ----
    // A lunge: right on the carrier (with a mild assist reach, PASS_ASSIST.tackleReach) is a good chance to win it.
    if (owner && this.humans.size) {
      for (const h of this.humans.values()) {
        if (this.players[owner].team === h.team) continue;
        if (h.lunge > 0 && h.tackle <= 0) h.tackle = INPUT_BUFFER; // the assisted lunge keeps his press armed until he is in reach
        if (h.tackle <= 0) continue;
        if (h.tackleRec > 0) continue; // recovering from a missed lunge: the press stays buffered for a moment
        h.tackle = 0;
        if (this.players[owner].isGK && this.keeperHands) { h.lunge = 0; continue; } // the ball is in the keeper's hands
        const u = this.players[h.id], o = this.players[owner], d = dist(u.x, u.y, o.x, o.y);
        if (this.humans.get(owner)?.trick) { h.tackleRec = TACKLE.recover; h.lunge = 0; continue; } // fooled by a human's trick
        // Easier tackling (owner Nov 4 2026, kid-friendly): reach × TACKLE.reachMul, auto-aimed at the carrier (the lunge
        // turns him whatever the stick says). No steals from range.
        // Tackle assist (owner Nov 5 2026, TACKLE_ASSIST): out of reach but within assistR, or the carrier still protected,
        // he lunges at the carrier with the press armed; in reach from the front / side it is a clean win or a poke-away,
        // from behind a short-recovery miss; just after an AI tackle on him ("get it back") it almost always wins.
        const back = h.backT > 0;
        if (d >= (P.tackleDist + PASS_ASSIST.tackleReach) * TACKLE.reachMul || (this.protect > 0 && !back)) {
          if (d < TACKLE_ASSIST.assistR && h.lunge <= 0) h.lunge = TACKLE_ASSIST.lunge;
          continue;
        }
        h.lunge = 0;
        h.faceX = (o.x - u.x) / (d || 1); h.faceY = (o.y - u.y) / (d || 1); // auto-aim
        // front / side: the carrier's heading (his attacking direction when he stands) against carrier → tackler
        const ov = Math.hypot(o.vx, o.vy), hx = ov > 5 ? o.vx / ov : 0, hy = ov > 5 ? o.vy / ov : this.dirY(o.team);
        const ahead = d > 0.01 ? ((u.x - o.x) * hx + (u.y - o.y) * hy) / d >= TACKLE_ASSIST.behindCos : true;
        if (this.rng() >= (back ? TACKLE_ASSIST.backChance : ahead ? TACKLE_ASSIST.front : TACKLE_ASSIST.chanceAway)) {
          if (ahead || back) { this.pokeAway(h, owner); owner = null; break; } // not a miss: the ball is knocked loose
          h.tackleRec = TACKLE_ASSIST.recover; continue; // from behind: a miss, retried after a short recovery
        }
        h.backT = 0;
        {
          this.ball.owner = h.id; this.possession = h.team;
          this.startTrap(h.id); // won ball eases across, not a teleport (tight — human touch)
          this.touch("tackle", h.id, owner, 0, Math.hypot(u.vx, u.vy));
          this.passCd = 0.45; this.protect = P.protectTime; this.lastFrom = null;
          this.startCounter(h.team); // won it in open play → break fast
          this.stats.turnovers++; this.msg = back ? "Got it back!" : "Tackle won!"; this.msgT = 0.9;
          owner = this.ball.owner; // the human now has it — fall into the on-ball branch below
          break;
        }
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

      // ---- HUMAN on the ball: no AI auto-pass/shoot; the human drives it (with the pass/shot assist) ----
      const hu = this.humans.get(owner);
      // A human keeper holding it past the six seconds (HUMAN_KEEPER.holdSeconds): the AI distribution below plays it.
      if (hu && o.isGK && this.hold <= HUMAN_KEEPER.holdSeconds * (this.windupScale > 0 ? this.windupScale : 1)) {
        this.carrying = false;
        if (hu.shoot > 0 || hu.through > 0) {
          // Kick: long, into the space ahead of a runner (the Forward pass assist), struck with at least some power.
          hu.shoot = hu.through = hu.pass = 0; hu.passPower = Math.max(hu.passPower, 0.6);
          this.humanPass(owner, hu, "forward");
        } else if (hu.pass > 0) {
          hu.pass = 0;
          this.humanPass(owner, hu, "short"); // Throw: to the open teammate the marker shows
        }
        return; // in his hands: no tackle
      }
      if (hu && !o.isGK) {
        this.carrying = false;
        if (!hu.hadBall) { hu.hadBall = true; hu.guard = HUMAN_GUARD.receive; } // just got it: a short protection window
        const nfu = this.nearestFoe(owner, o.x, o.y);
        // Beach kick-in / kick-off he took (Law 15: within 4 s): still on his feet when the time is up, the shown pass is played for him.
        if (this.beach && this.noDirect === owner && hu.shoot <= 0 && hu.pass <= 0 && hu.through <= 0 && this.hold > BEACH_HUMAN_RESTART_S * (this.windupScale > 0 ? this.windupScale : 1)) {
          this.humanPass(owner, hu, "short"); this.tellHuman(owner, BEACH_HUMAN_NOTES.late); return;
        }
        if (hu.shoot > 0) {
          hu.shoot = hu.pass = hu.through = 0;
          this.doUserShot(owner, hu);
        } else if (hu.through > 0) {
          hu.through = hu.pass = 0;
          this.humanPass(owner, hu, "forward"); // into the space ahead of a runner
        } else if (hu.pass > 0) {
          hu.pass = 0;
          if (hu.passLong > 0) this.humanLongBall(owner, hu); // held: a lofted long ball over the defenders
          else this.humanPass(owner, hu, "short"); // to the open teammate the marker shows
        } else if (hu.trickReq > 0) {
          hu.trickReq = 0;
          if (hu.trickCd <= 0) this.humanTrick(o, hu);
        } else if (hu.trick <= 0 && hu.guard <= 0 && this.protect <= 0 && nfu && nfu.d < P.tackleDist && this.slipOrTackle(hu, P.tackleChance * dt)) {
          // a defender right on the human can still win it (keeps the game a challenge), a third as often (HUMAN_GUARD)
          this.ball.owner = nfu.p.id; this.possession = nfu.p.team;
          this.startTrap(nfu.p.id); // the steal eases across to the winner's feet
          this.touch("tackle", nfu.p.id, owner, 0, Math.hypot(nfu.p.vx, nfu.p.vy));
          this.passCd = 0.45; this.protect = P.protectTime; this.lastFrom = null;
          this.startCounter(nfu.p.team);
          this.stats.turnovers++; this.msg = "Tackled!"; this.msgT = 0.9;
          hu.backT = TACKLE_ASSIST.back; // "get it back" (owner Nov 5 2026): his next tackle almost always wins it
        }
        return; // skip the AI decision for the human's player
      }
      // ---- a human teammate called for it with an open lane: the AI carrier plays it to him ----
      if (this.humans.size && !this.windup && !o.isGK && this.passCd <= 0.2) {
        const caller = this.callerFor(owner);
        if (caller) { this.doPass(owner, caller, 1.05); if (this.ball.owner !== owner || this.windup) return; }
      }
      // ---- kick wind-up: the chosen kick releases once the wind-up has run ----
      // No new decision while winding up; a tackle can still take the ball off him (below).
      let winding = false;
      if (this.windup) {
        const w = this.windup;
        if (w.id !== owner) this.windup = null;
        else {
          w.t -= dt;
          if (w.t > 0) winding = true;
          else {
            this.windup = null; this.releasing = true;
            if (w.kind === "pass" && w.to) this.doPass(owner, w.to, w.firm);
            else if (w.kind === "loft" && w.to) this.doLoft(owner, w.to, w.loftKind);
            else if (w.kind === "shot") this.doShot(owner);
            else this.doClear(owner);
            this.releasing = false;
            if (this.ball.owner !== owner) return;
          }
        }
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
      const clearChance = !winding && !o.isGK && distGoal < 40 && angle < 24;
      // graded shooting instinct in the final third: closer + more central + a clear
      // sight of goal (few defenders in the shot lane) → higher chance to shoot. This
      // is what actually produces shots against a compact block.
      let shootChance = 0;
      const R = this.T.shotRange * this.persona[o.team].range * this.ai.shotRange; // small-sided games shoot from further out; the aggressor lets fly earlier
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
        if (this.ai.shotPatience > 0 && laneBlockers > 0 && distGoal > R * 0.7) shootChance *= 1 - this.ai.shotPatience; // futsal: don't blast through a defender from range
      }
      // The composure beat already includes the shortest wind-up (a square-on kick), so the
      // decision comes that much earlier and the ball leaves the foot on the old rhythm.
      const lead = this.humans.has(owner) ? 0 : windupSeconds(WINDUP_LEAD_TURN) * this.windupScale;
      const canAct = !winding && (this.passCd <= lead || (pressured && this.passCd < 0.15 + lead) || this.hold > 1.6);

      // ---- GK on the ball: purposeful distribution ----
      // unpressed → a quick roll-out to an open team-mate keeps the build alive; pressed
      // (or nobody safe short) → go long: a lofted ball over the top in 11v11, else a
      // driven kick up the pitch. The keeper never dribbles upfield or shoots.
      if (o.isGK) {
        if(this.useBuildOut&&this.gkFeetId!==owner&&!this.buildOutReady(o.team))return; // (7v7 back pass at his feet: no wait)
        if (this.beach) { if (canAct || this.hold > 3.2) this.beachKeeper(owner, o, pressured); return; }
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
      // [combos] multi-step sequences and skills (combos.ts) take this beat when they have a plan (the tackle check below still runs)
      const comboTook = canAct && !clearChance && !!this.combos && this.combos.onBall(owner, pressured, nf ? nf.p.id : null, pressure);
      const returnTo=canAct&&!comboTook?this.combinationReturn(owner):null;
      if (comboTook) { /* [combos] took the beat */ } else if(returnTo&&!clearChance){
        this.carrying=false;this.doPass(owner,returnTo,1.12);
      } else if (clearChance && (this.passCd <= lead || pressured)) {
        this.carrying = false;
        this.doShot(owner);
      } else if (canAct && shootChance > 0 && this.rng() < shootChance) {
        // a sight of goal in the final third → shoot (comes before everything else)
        this.carrying = false;
        // …unless a team-mate has a clearly better chance: the extra pass (futsal habit, formatAI extraPass)
        const extra = this.ai.extraPass > 0 ? this.extraPassTarget(owner) : null;
        if (extra) {
          this.futsalStats.extraPasses++;
          this.tacticalReason = "Extra pass: the team-mate had the better chance";
          this.teach(FUTSAL_NOTES.extraPass[0], FUTSAL_NOTES.extraPass[1], "fextra", 45);
          this.doPass(owner, extra, 1.12);
        } else this.doShot(owner);
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
        const aerial=this.hold>.25-lead&&!clearChance?this.bestAerial(owner):null;
        if(aerial&&!pressured&&this.rng()<(this.aerialKind==='cross'?.65:.5)){
          this.doLoft(owner,aerial,this.aerialKind);return;
        }
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
            this.combos?.onBeatMan(owner, nf.p.id, side); // [combos] show the skill that beat him
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
        if (carryP > 0 && ((this.carrying&&this.stats.time<this.carryUntil)||this.rng() < carryP)) {
          if(!this.carrying)this.carryUntil=this.stats.time+(this.passMul>1?.65:.95);
          this.tacticalReason="Carry into the open corridor until a defender engages";
          this.carrying = true; // TAKE the lane (integrate() gives the carry a gallop)
          this.passCd = 0.4; // decide again shortly — release when someone engages
        } else if (this.ai.keeperRecycle > 0 && pressured && ph !== "counter" && this.depth(o.team, o.y) < 135 && this.keeperRecycleTarget(owner) !== null && this.rng() < this.ai.keeperRecycle) {
          // 7v7 (bld_7_usekeeper): pressed in our own third with the keeper free → play back to his feet and start again
          this.carrying = false;
          this.doPass(owner, this.keeperRecycleTarget(owner)!, 0.95);
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
      const jockeying = !!nf && !!this.humans.get(nf.p.id)?.jockey;
      // A presser can still rob him mid wind-up (the composure beat was shortened by the lead,
      // so his total exposure matches the pre-wind-up rhythm).
      // Press together (human Press button): a double team on the carrier wins it far more often (1 without a press).
      const pressMul = this.pressSet.size && nf && this.pressSet.has(nf.p.id) ? this.pressBoost(nf.p.id, o) : 1;
      if (!jockeying && this.ball.owner === owner && this.protect <= 0 && nf && nf.d < P.tackleDist && this.rng() < P.tackleChance * this.T.press * this.persona[nf.p.team].press * this.fairMul * pressMul * dt) {
        this.carrying = false;
        this.ball.owner = nf.p.id;
        this.possession = nf.p.team;
        this.startTrap(nf.p.id); // the won ball eases to the tackler's feet, no teleport
        this.touch("tackle", nf.p.id, owner, 0, Math.hypot(nf.p.vx, nf.p.vy));
        this.passCd = 0.45; // can act (clear to safety) while still protected
        this.protect = P.protectTime;
        this.lastFrom = null;
        this.startCounter(nf.p.team); // the tackle springs a counter the other way
        this.stats.turnovers++;
        this.msg = "Turnover!"; this.msgT = 0.9;
        if (this.ai.teach && nf.p.id === this.presserId && this.defenseIntent.cover) this.teach(this.notes.cover[0], this.notes.cover[1], "cover", 90); // learn9_cover, seen live
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
            this.touch("tackle", defGkId, owner, 0, Math.hypot(g.vx, g.vy));
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
      // Sweep the actual round goal frame before scoring. Use the same placement
      // curve as presentation, so a visible post/bar hit is a real loose-ball rebound.
      if(this.ballIsShot&&this.lastKick.shotHeight>0){
        const venue=this.frameVenues[0],k=this.lastKick,a=this.frameFrom,b=this.frameTo;
        const p0=shotProgress(k,prevBY),p1=shotProgress(k,this.ball.y),base=(venue.elevation??0)+.295;
        a.x=venue.x+(prevBX-135)*venue.width/250+shotOffsetAt(k,p0,venue.goalWidth,venue.width);
        a.y=base+shotHeightAt(k,p0,venue.goalHeight);a.z=venue.z+(prevBY-200)*venue.length/380;
        b.x=venue.x+(this.ball.x-135)*venue.width/250+shotOffsetAt(k,p1,venue.goalWidth,venue.width);
        b.y=base+shotHeightAt(k,p1,venue.goalHeight);b.z=venue.z+(this.ball.y-200)*venue.length/380;
        if(sweepGoalFrame(a,b,.19,this.frameHit,this.frameVenues)){
          const hit=this.frameHit,vx=(b.x-a.x)/dt,vy=(b.y-a.y)/dt,vz=(b.z-a.z)/dt,dot=vx*hit.nx+vy*hit.ny+vz*hit.nz;
          this.ball.x=135+(hit.x-venue.x)*250/venue.width;this.ball.y=200+(hit.z-venue.z)*380/venue.length;
          this.ball.vx=(vx-1.72*dot*hit.nx)*250/venue.width;this.ball.vy=(vz-1.72*dot*hit.nz)*380/venue.length;
          this.ball.height=Math.max(0,hit.y-base);this.frameContact.serial++;this.frameContact.height=this.ball.height;this.frameContact.vy=vy-1.72*dot*hit.ny;this.frameContact.part=hit.part;
          // Surface contact stays anchored to the frame after the ball rebounds.
          this.frameContact.x=hit.x-hit.nx*.19;this.frameContact.y=hit.y-hit.ny*.19;this.frameContact.z=hit.z-hit.nz*.19;
          // A turned court (the beach court runs east–west): the sweep ran in its own frame; the contact is reported in world space.
          const yaw=this.goalVenue.yaw;if(yaw){const ox=this.frameContact.x-venue.x,oz=this.frameContact.z-venue.z,c=Math.cos(yaw),s=Math.sin(yaw);this.frameContact.x=venue.x+ox*c+oz*s;this.frameContact.z=venue.z-ox*s+oz*c;}
          this.ballIsShot=false;this.shotIsGoal=false;this.ball.lofted=false;this.loftDur=0;this.ball.target=null;this.ball.intBy=null;this.ballFlight=.12;
          this.msg=hit.part==='post'?'Off the post!':'Off the crossbar!';this.msgT=1.2;return;
        }
      }
      // a lofted ball keeps its pace (less friction while airborne), and arcs up then down
      const fr = Math.max(0, 1 - (this.loftDur > 0 ? P.friction * 0.35 : this.groundFriction) * dt);
      this.ball.vx *= fr; this.ball.vy *= fr;
      if (this.loftDur > 0) {
        this.loftT += dt;
        const prog = clamp(this.loftT / this.loftDur, 0, 1);
        this.ball.height = this.loftPeak * Math.sin(Math.PI * prog); // rise then fall
        if (prog >= 1) { this.loftDur = 0; this.ball.height = 0; this.ball.lofted = false; if (this.landCap > 0) { const v = Math.hypot(this.ball.vx, this.ball.vy); if (v > this.landCap) { this.ball.vx *= this.landCap / v; this.ball.vy *= this.landCap / v; } this.landCap = 0; } }
      } else if (this.ball.height > 0) {
        this.ball.height = Math.max(0, this.ball.height - dt * 2.4);
      }
      const airborne = this.ball.lofted && this.ball.height > 1.2; // too high to be controlled
      // a dropping cross can be met by its target at head height (a header, see choreo)
      const headerReach = airborne && this.headerBall && !!this.ball.target && this.ball.height <= 2.1 && this.loftT > this.loftDur * 0.5;
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
        const shotHeight=this.ballIsShot&&this.lastKick.shotHeight>0?shotHeightAt(this.lastKick,shotProgress(this.lastKick,lineY),this.goalVenue.goalHeight):0;
        const crossHeight=this.ballIsShot?shotHeight:Math.max(shotHeight,this.ball.height);
        if (Math.abs(xc - 135) < GHALF&&crossHeight+.295+.19<this.goalVenue.goalHeight+.105&&this.directBan) {
          // Beach: straight in from the keeper's hands, a kick-in or a kick-off does not count — a goal clearance.
          this.teach("No goal: it went straight in", "In beach soccer a keeper's throw, a kick-in or a kick-off can't score directly; it's a goal clearance");
          this.tellHuman(this.lastFrom, BEACH_HUMAN_NOTES.noGoal);
        } else if (Math.abs(xc - 135) < GHALF&&crossHeight+.295+.19<this.goalVenue.goalHeight+.105) {
          if (crossedTop) { this.score.gold++; this.msg = "GOAL — Gold!"; this.goalNet = "top"; }
          else { this.score.blue++; this.msg = "GOAL — Blue!"; this.goalNet = "bottom"; }
          this.msgT = 2.4;
          this.scorerId = this.lastFrom; // launch() stamped the striker
          if (this.scorerId) { this.touch("goal", this.scorerId, null, 0, sp); this.touches[(this.touchSerial - 1) % this.touches.length].team = crossedTop ? "gold" : "blue"; }
          this.goalQuick = this.humans.size > 0; this.goalHold = this.goalQuick ? GOAL_RESET.hold * this.wsReal() : 1.8;
          if (this.goalQuick) this.quickTaker = this.spotTaker(crossedTop ? "blue" : "gold"); this.ballImpact = Math.min(1, sp / 220);
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
        this.msg = kind === "corner" ? "Corner!" : kind === "goalkick" ? (this.beach || this.ai.goalClearance ? "Goal clearance" : "Goal kick") : this.ai.touchline;
        if (this.ai.teach && kind === "kickin") { const n = this.notes.throwIn(team === "gold" ? "Gold" : "Blue"); this.teach(n[0], n[1], "throwin", 75); }
        if (this.ai.restartRing > 0 && kind === "kickin") { const n = FUTSAL_NOTES.kickIn(team === "gold" ? "Gold" : "Blue"); this.teach(n[0], n[1], "fkickin", 60); }
        if (this.ai.goalClearance && kind === "goalkick") this.teach(FUTSAL_NOTES.clearance[0], FUTSAL_NOTES.clearance[1], "fclear", 90);
        // 11v11 lane: every restart explains itself (the optional lines only ELEVEN_NOTES carries; cooldown-limited)
        if (this.ai.teach && kind === "corner" && this.notes.corner) { const n = this.notes.corner(team === "gold" ? "Gold" : "Blue"); this.teach(n[0], n[1], "corner", 60); }
        if (this.ai.teach && kind === "goalkick" && this.notes.goalKick) { const n = this.notes.goalKick(team === "gold" ? "Gold" : "Blue"); this.teach(n[0], n[1], "goalkick", 90); }
        if (this.ai.coach7 && kind === "goalkick") this.teach(SEVEN_NOTES.buildOut[0], SEVEN_NOTES.buildOut[1], "buildout7", 45); // 7v7: learn7_buildout
        if (this.beach && kind === "kickin") this.teach(`Kick-in for ${team === "gold" ? "Gold" : "Blue"}`, "On sand the taker chooses: kick it in or throw it in, within 4 seconds. It can't go straight in for a goal", "kickin", 35);
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
        const stretch = defGk && this.hkStretch.size && (this.hkStretch.get(defGk) ?? 0) > 0 ? HUMAN_KEEPER.diveReach : 0; // a human keeper at full stretch
        if (!this.shotIsGoal && g && this.ballFlight <= 0 && dist(g.x, g.y, this.ball.x, this.ball.y) < P.gkReach + 1 + stretch) {
          // ~1 in 5 stops is a PARRY, not a catch: the keeper touches it last (so a ball
          // over the line is a CORNER) and a deflection kept in play is a live rebound —
          // restarts and scrambles the critic can actually see.
          const outcome = this.saveOutcome;
          if (outcome === 'parry' || outcome === 'tip' || (this.saveRoll < 0 && this.rng() < 0.2)) {
            this.possession = g.team; // keeper's touch counts as the last touch
            const outX = Math.sign(this.ball.x - 135) || (this.rng() < 0.5 ? -1 : 1);
            this.ball.vx = outX * (70 + this.rng() * 50);
            this.ball.vy = Math.sign(this.ownGoalY(g.team) - 200) * (30 + this.rng() * 45);
            this.ball.height = 0.4; this.ballIsShot = false; this.shotIsGoal = false;
            // Tipped over: fingertips push it UP and over the bar, it drops behind the goal (a corner).
            if (outcome === 'tip') {
              // Fast enough to clear the bar before the height decays (2.4 m/s): over the line within ~.2 s.
              const toLine = Math.abs(this.ownGoalY(g.team) - this.ball.y);
              this.ball.vx = outX * (8 + this.rng() * 14); this.ball.vy = Math.sign(this.ownGoalY(g.team) - 200) * Math.max(70, toLine / 0.2) * 1.3; this.ball.height = this.goalVenue.goalHeight + 0.8;
            }
            this.ball.target = null; this.ball.intBy = null; this.ballFlight = 0.25;
            this.lastFrom = defGk!; // the keeper can't instantly re-collect his own parry
            this.msg = "Great save!"; this.msgT = 1.2;
            this.diveAt(defGk!);
            this.touch("parry", defGk!, null, 0.4, sp);
            this.combos?.onParry(defGk!, outcome); // [combos] some parries drop into the danger zone: a live rebound
          } else { this.diveAt(defGk!); claimer = defGk!; claimVia = "shot"; }
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
      } else if (this.ballFlight <= 0 && (!airborne || headerReach)) {
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
            // a human outfielder's loose-ball reach is TACKLE_ASSIST.pickup bigger (and counted closer), Nov 5 2026; 0 without humans
            const hb = this.humans.size && !p.isGK && this.humans.has(id) ? TACKLE_ASSIST.pickup : 0;
            const reach = (p.isGK ? (inBox ? P.gkReach : P.recvRadius + 1) : P.recvRadius) + deadBonus + hb;
            const d = dist(p.x, p.y, this.ball.x, this.ball.y) - hb;
            if (d < reach - hb && d < nd) { nd = d; claimer = id; }
          }
        }
      }
      if (claimer) {
        const cp = this.players[claimer];
        if (this.offsidePass) {
          // 9v9: the receiver was beyond the line when the pass was played → free kick to the defence from that spot.
          // Anyone else touching it first (an interception, a loose ball) means the call never comes.
          const off = this.offsidePass; this.offsidePass = null;
          if (claimVia === "recv" && claimer === off.id) { this.callOffside(cp.team, off.x, off.y); return; }
        } else if (this.ai.teach && claimVia === "recv" && cp.role === "fwd" && this.passRelease && this.passRelease.target === claimer && this.depth(cp.team, cp.y) > this.offsideLine(cp.team) + 4 && this.depth(cp.team, cp.y) > 230) {
          this.teach(this.notes.onside[0], this.notes.onside[1], "onside", 80); // in behind, legally: the run was timed
        }
        // First-time acrobatic finish: the target strikes the dropping ball at once (no trap), from where he met it.
        // [combos] a planned first-time finish (rebound, cut-back, near/far post, lay-off, one-two): see combos.ts
        const comboFinish = this.combos ? this.combos.finishOnClaim(claimer, claimVia) : 0;
        if (((this.acro && this.acro.to === claimer && claimVia === "recv") || comboFinish > 0) && !cp.isGK) {
          const h = this.ball.height;
          this.acro = null; this.possession = cp.team; this.ball.owner = claimer; this.ball.target = null; this.ball.intBy = null;
          this.passIntended = null; this.stats.recvOwn++; this.stats.firstTime++;
          // Struck on the contact (no wind-up): the move's contact phase is timed to this claim.
          this.releasing = true; try { this.doShot(claimer, comboFinish || ACRO_XG); } finally { this.releasing = false; } // [combos] xgMul
          this.ball.height = Math.max(this.ball.height, h);
          return;
        }
        // ---- rare genuinely LOOSE first touch → an organic 50/50 ----
        // the ball squirts on past the touch in its direction of travel; the toucher is
        // barred from an instant re-claim (lastFrom), so a pressing defender can pounce.
        // Kept RARE — and only off a ball arriving with real pace, never a GK catch —
        // so the turnover/switch balance holds (verified with scripts/simavg.mjs).
        if (!cp.isGK && claimVia !== "shot" && sp > 60) {
          const lapse = (this.brain[claimer]?.lapse ?? 0) > 0;
          const pLoose = (0.012 + (sp > 200 ? 0.014 : 0) + this.fatigue * 0.012 + (lapse ? 0.05 : 0)) *
            (this.humans.has(claimer) ? HUMAN_FEEL.looseMul : 1); // the human's touch is more reliable (was .45; kids, Nov 4 2026)
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
            this.touch("heavy", claimer, null, this.ball.height, sp, true);
            return;
          }
        }
        const kept = this.players[claimer].team === this.possession;
        // Beach: a receiver beyond the last defender who would be offside on grass — the rule that isn't there.
        if (this.beach && claimVia === "recv" && !cp.isGK && this.passRelease && this.passRelease.target === claimer) {
          const rd = this.depth(cp.team, cp.y);
          if (rd >= 230 && rd > this.offsideLine(cp.team) + 6 && rd > this.depth(cp.team, this.passRelease.y) + 6) {
            this.stats.beachOnside++;
            this.teach("No offside on sand", "He waited behind the last defender and it's allowed: beach soccer has no offside, so defenders must keep talking", "offside", 40);
          }
        }
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
        const touchHeight = this.ball.height;
        this.startTrap(claimer);
        this.touch(claimVia === "inter" ? "intercept" : "receive", claimer, null, touchHeight, sp, this.trapHeavy);
        this.passIntended = null;
        if (this.ai.handsBuildOut && cp.isGK) {
          // 7v7: a team-mate's pass is taken with the FEET (pass-back rule) and moved on quickly, with no retreat;
          // a save or a claim is his hands → the other team retreats behind the build-out line (buildOutTeam)
          this.gkFeetId = claimVia === "recv" && kept ? claimer : null;
          if (this.gkFeetId) { this.passCd = Math.min(this.passCd, 0.45); this.seven.keeperFeet++; }
          else if (this.ai.coach7) this.teach(SEVEN_NOTES.buildOut[0], SEVEN_NOTES.buildOut[1], "buildout7", 45);
        }
        if(!cp.isGK&&!this.humans.has(claimer)&&claimVia==='recv'){
          const returnTo=this.combinationReturn(claimer);
          const nearby=this.nearestFoe(claimer,cp.x,cp.y);
          const lane=this.openLaneLen(claimer);
          // Safe receivers carry THROUGH the cushion; close pressure retains the
          // deliberate shielding beat. A pre-read wall return needs only one touch.
          if(returnTo){
            this.passCd=Math.min(this.passCd,.12);
            this.carrying=false;
          }else if((!nearby||nearby.d>16)&&lane>=25&&!this.lastManRisk(claimer)){
            this.carrying=true;this.carryUntil=this.stats.time+(this.passMul>1?.5:.75);
            this.passCd=Math.min(this.passCd,.28);
            this.tacticalReason="Receive on the move into the free next-action corridor";
          }else this.carrying=false;
        }
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
      b.ox=0;b.oy=0;b.screen=null;this.runners.delete(id);
      const owner=this.ball.owner?this.players[this.ball.owner]:null;
      if(owner&&owner.id!==id){
        if(p.team===this.possession){
          let strongest=0;
          for(const fid of this.foes(p.team)){
            const foe=this.players[fid];if(foe.isGK)continue;
            const offset=laneAdjustment(owner,p,foe,p.hx>=135?1:-1),strength=Math.hypot(offset.x,offset.y);
            if(strength>strongest){strongest=strength;b.ox=offset.x;b.oy=offset.y;}
          }
          // Off-ball run (offBallRuns.ts): one pick per think — in behind, check to the ball, hold width, make space.
          this.runners.delete(id);
          if(!this.humans.has(id)){
            const c=this.runCtx;c.px=p.x;c.py=p.y;c.hx=p.hx;c.role=p.role;c.dirY=this.dirY(p.team);c.carrierX=owner.x;c.carrierY=owner.y;c.carrierHuman=this.humans.has(owner.id);
            c.carrierTime=this.nearestFoe(owner.id,owner.x,owner.y)?.d??99;c.supportNear=0;c.humanX=NaN;c.humanY=NaN;
            for(const mid of this.mates(p.team)){if(mid===id||mid===owner.id)continue;const m=this.players[mid];if(!m.isGK&&dist(m.x,m.y,owner.x,owner.y)<RUNS_SUPPORT)c.supportNear++;}
            if(this.humans.size){let hd=Infinity;for(const h of this.humans.values()){if(h.team!==p.team||h.id===owner.id)continue;const hp=this.players[h.id],d=dist(hp.x,hp.y,p.x,p.y);if(d<hd){hd=d;c.humanX=hp.x;c.humanY=hp.y;}}}
            const run=pickOffBallRun(c,this.rng(),this.runOut);
            if(run!==RUN.Hold){b.ox+=this.runOut.x;b.oy+=this.runOut.y;if(run===RUN.Beyond)this.runners.add(id);}
            // A human carrier (owner Nov 4 2026, kids): his two nearest NPC teammates make themselves available, in
            // passing range and out of blocked lanes (offBallRuns.supportOffset). No rng, so AI-only matches are unchanged.
            if(c.carrierHuman&&run!==RUN.Beyond){const dme=dist(p.x,p.y,owner.x,owner.y);let closer=0;
              for(const mid of this.mates(p.team)){if(mid===id||mid===owner.id)continue;const m=this.players[mid];if(!m.isGK&&dist(m.x,m.y,owner.x,owner.y)<dme)closer++;}
              if(closer<PASS_HELP.supporters){let ld=Infinity,bx=0,by=0;for(const fid of this.foes(p.team)){const f=this.players[fid];if(f.isGK)continue;const q=segDist(f.x,f.y,owner.x,owner.y,p.x,p.y);if(q<ld){ld=q;bx=f.x;by=f.y;}}
                supportOffset(p.x,p.y,owner.x,owner.y,bx,by,ld,this.supOut);b.ox+=this.supOut.x;b.oy+=this.supOut.y;}}
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
      if (!this.humans.has(id) && this.rng() < 0.012 + this.fatigue * 0.02) b.lapse = 0.5 + this.rng() * 0.7;
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
    const retreat=this.buildOutTeam;
    const rst = this.restart; // dead ball: teams get SET rather than chase/press
    const poss = this.possession;
    const defTeam: Team = poss === "gold" ? "blue" : "gold";
    const dir = this.dirY(poss);
    const ballOwner = this.ball.owner;
    const ownerPos = this.ownerPosS; ownerPos.x = ballOwner ? this.players[ballOwner].x : this.ball.x; ownerPos.y = ballOwner ? this.players[ballOwner].y : this.ball.y;
    let presser = this.nearestOfTeam(defTeam, ownerPos.x, ownerPos.y);
    const previous=this.presserId?this.players[this.presserId]:null;
    if(previous&&previous.team===defTeam&&presser&&!this.humans.has(previous.id)){
      const candidate=this.players[presser];
      if(dist(previous.x,previous.y,ownerPos.x,ownerPos.y)<dist(candidate.x,candidate.y,ownerPos.x,ownerPos.y)+8)presser=previous.id;
    }
    this.presserId = presser;
    // second defender provides COVER behind the presser, so passing lanes near the
    // ball are contested by two and the block engages rather than only recycling
    let cover:string|null=null,coverScore=Infinity;
    const ownGoal=this.ownGoalY(defTeam);
    for(const id of this.mates(defTeam)){
      const p=this.players[id];if(p.isGK||id===presser)continue;
      const wrongSide=Math.max(0,Math.abs(p.y-ownGoal)-Math.abs(ownerPos.y-ownGoal));
      const score=dist(p.x,p.y,ownerPos.x,ownerPos.y)+wrongSide*.8;
      if(score<coverScore){coverScore=score;cover=id;}
    }
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
    this.defenseIntent.cover=cover;this.defenseIntent.balance=balance;
    if (this.ai.manMark > 0) this.updateMarks(defTeam, presser);
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
    const chasers = this.chaserIds; chasers.clear(); // reused set: no per-frame allocation
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
    // Onside discipline (formatAI.onsideHold, 9v9): the deepest an off-ball attacker may stand — read once per frame.
    const onsideCap = this.ai.onsideHold > 0 && !rst ? (this.ai.offsideZone ? sevenOnsideDepth(this.offsideLine(poss), this.depth(poss, this.ball.y), this.ai.onsideHold) /* 7v7: only past the build-out line */ : onsideDepth(this.offsideLine(poss), this.depth(poss, this.ball.y), this.ai.onsideHold)) : 0;
    // (chasers IS this.chaserIds) integrate() exempts chasers from separation — they COMMIT
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
        // walked by the AI for the duration, see applyHumanTargets)
        if (id === rst.taker) {
          // kickoff carry: first jog to the ball (still in the net), then bring it to the spot
          const gx = rst.carry === "fetch" ? this.ball.x : rst.x;
          const gy = rst.carry === "fetch" ? this.ball.y : rst.y;
          this.setTarget(id, clamp(gx, 14, 256), clamp(gy, 12, 388));
          continue;
        }
        if (rst.kind === "kickoff") {
          tx = p.hx; ty = p.team === 'gold' ? Math.max(214, p.hy) : Math.min(186, p.hy);
          // Keep the opposition outside the centre circle as well as in their half.
          if(p.team!==this.possession&&dist(tx,ty,135,200)<30)ty=p.team==='gold'?230:170;
          this.setTarget(id,tx,ty);
          continue;
        }
        // kick-in / corner / goal kick: both sides take up their normal shape around the
        // spot (the code below reads the dead ball's position), minus pressing/chasing
      }
      if(retreat){
        if(p.team!==retreat){
          this.setTarget(id,p.hx,retreatBuildOutY(p.hy,retreat,8));
          continue;
        }else if(!p.isGK&&id!==ballOwner){
          // Two wide short outlets plus staggered midfield options demonstrate a
          // buildup, rather than leaving teammates beyond the retreating press.
          const depth=p.role==='def'?42:p.role==='mid'?100:Math.abs(sevenBuildOutY(retreat)-this.ownGoalY(retreat))+12;
          // 7v7 (formatAI.buildOutSplit/attackWidth): the centre-backs split to the edges of the box and the wide
          // midfielders hold the touchlines, so the keeper has a free first pass into the space the retreat left
          const bx=this.ai.buildOutSplit>0&&p.role==='def'?135+Math.sign(p.hx-135)*this.ai.buildOutSplit:this.ai.attackWidth>0&&p.role==='mid'&&Math.abs(p.hx-135)>55?135+Math.sign(p.hx-135)*this.ai.attackWidth:p.hx;
          this.setTarget(id,bx,clamp(this.ownGoalY(retreat)+this.dirY(retreat)*depth,18,382));
          continue;
        }
      }
      if (!staged) {
      if (loose && chasers.has(id)) {
        tx = this.ball.x + this.ball.vx * 0.16; // run onto the ball, leading it
        ty = this.ball.y + this.ball.vy * 0.16;
        this.setTarget(id, clamp(tx, 14, 256), clamp(ty, 12, 388));
        continue;
      }
      // [combos] planned runs: box runs, lay-off / through-ball runners, rebound racers, rotations, sole rolls
      const comboRun = this.combos ? this.combos.runTarget(id) : null;
      if (comboRun) { this.setTarget(id, comboRun.x, comboRun.y); continue; }
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
            // Beach: with his team on the ball in the other half the keeper steps up as an extra outfield option
            // (beach keepers start attacks and support them), never further than ~6 m off his line.
            if (this.beach && p.team === poss && !rst) { const adv = clamp((this.depth(p.team, this.ball.y) - 170) * 0.45, 0, 64); ty += Math.sign(200 - ogy) * adv; tx = 135 + (tx - 135) * 0.6; }
            // Sweeper keeper (formatAI.sweeper, 9v9): with the ball far away he steps up behind his back line to
            // sweep balls in behind and offer a back pass, then retreats onto the angle line as play comes back.
            if (this.ai.sweeper > 0 && !rst) {
              const sw = sweeperOffset(this.ai.sweeper, danger, this.shape[p.team].line);
              if (sw > off) { ty = ogy + Math.sign(200 - ogy) * sw; tx = 135 + (tx - 135) * (1 - 0.5 * sw / this.ai.sweeper); }
            }
          }
        }
      } else if (p.team === poss) {
        // ---- ATTACKING ----
        if (id === ballOwner) {
          const nf = this.nearestFoe(id, p.x, p.y);
          if (this.carrying) {
            // drive toward goal, angling away from the nearest defender
            tx = p.x + this.carryDirection.x * 34;
            ty = p.y + (this.carryDirection.y || dir) * 34;
            if (nf && nf.d < 22) tx += (p.x - nf.p.x >= 0 ? 1 : -1) * 12;
          } else if(this.recv.id===id&&this.recv.t>0&&(!nf||nf.d>16)){
            // Let a prepared one-touch receiver step through contact as well; only
            // nearby pressure asks for a stationary shielding touch.
            tx=p.x+this.touchX*3;ty=p.y+this.touchY*3;
          } else if (nf && nf.d < 16) {
            tx = p.x + (p.x - nf.p.x >= 0 ? 1 : -1) * 6; ty = p.y; // shield & look to pass
          } else {
            tx = p.x; ty = p.y; // hold, look up
          }
        } else if(this.combination?.runner===id&&this.combination.team===poss){
          tx=this.combination.x;ty=this.combination.y;
        } else if (tmr === id && tmrRecv && this.depth(poss, this.ball.y) > 170) {
          // THIRD-MAN RUN: as the pass travels, burst BEYOND the receiver into the space
          // the pass has opened — arriving as the next option the moment it's controlled
          tx = tmrRecv.x + (p.hx >= 135 ? 22 : -22);
          ty = clamp(tmrRecv.y + dir * (this.passMul>1?30:46), 26, 374);
        } else if (s1 === id) {
          // SHORT OUTLET (triangle point one): show at a lateral/back angle so the
          // carrier always has a safe ball — never hiding behind a defender square-on
          const side = p.x >= ownerPos.x ? 1 : -1;
          tx = ownerPos.x + side * 27;
          ty = ownerPos.y - dir * (this.passMul>1?10:13);
        } else if (s2 === id) {
          // LINE-BREAKER (triangle point two): sit in the half-space between the lines
          // ahead of the ball — never dropping BACK to it (a striker already beyond the
          // spot keeps pushing the line instead of coming short)
          tx = (p.hx + ownerPos.x) / 2;
          const aheadBy = Math.max(38, (p.y - ownerPos.y) * dir + 6);
          ty = clamp(ownerPos.y + dir * aheadBy, 26, 374);
        } else {
          const ownGoalY = this.ownGoalY(p.team);
          const humanAttacking = this.humanOn[p.team] > 0;
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
            if (wide && this.ai.attackWidth > 0) tx = sevenWideX(p.hx, this.ball.x, this.ai.attackWidth); // 7v7: make room — hug the touchline
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
        const bandOff = p.role === "def" ? (this.defOff[id] ?? 0) : p.role === "mid" ? (this.passMul>1?40:55) : (this.passMul>1?74:100); // band separation (+ back-line stagger)
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
          ty = ownerPos.y - into * (this.passMul>1?(squeeze?11:17):(squeeze?13:22));
        } else if (id === balance && ballOwner) {
          // balance third man: tucks central, deeper again, protecting the middle if the
          // press is beaten — completing the press → cover → balance chain
          tx = ownerPos.x * 0.3 + 135 * 0.7;
          ty = ownerPos.y - into * 32;
        } else {
          tx = (this.ai.defendNarrow !== 1 ? 135 + (p.hx - 135) * this.ai.defendNarrow : p.hx) + shiftX + (b ? b.ox : 0); // slot + decision noise (never a robot grid); 7v7 squeezes narrow
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
            ty = (nf.p.y-into*7) * 0.45 + ty * 0.55;
          }
        }
        // MAN-ORIENTED (futsal): blend toward the goal-side spot on this defender's own attacker
        const markId = this.ai.manMark > 0 && !(id === presser && ballOwner) ? this.markOf[id] : null;
        if (markId) {
          const m = this.players[markId];
          markSpot(this.markPt, m.x, m.y, ownY, this.ball.x, this.ball.y, MARK_GAP, MARK_SAG);
          tx += (this.markPt.x - tx) * this.ai.manMark; ty += (this.markPt.y - ty) * this.ai.manMark;
        }
      }
      } // end !staged (restart shape targets still get the wander layer below)
      // Purposeful adjustments replace perpetual outfield oscillation. Do not move
      // a restart actor or a committed receiver away from the authored target.
      const brain=this.brain[id];
      if(!rst&&!chasers.has(id)&&id!==ballOwner&&!this.humans.has(id)&&!p.isGK){
        if(p.team===poss&&brain){tx+=brain.ox;ty+=brain.oy;}
        else if(id!==presser&&brain?.screen&&dist(tx,ty,brain.screen.x,brain.screen.y)<40){
          tx+=(brain.screen.x-tx)*.45;ty+=(brain.screen.y-ty)*.45;
        }
      }
      // RECOVERY RUNS (elevenAI.ts defendAI.recover, 11v11 lane): with the ball in our half nobody defends from the wrong side of
      // it. Every outfielder but the presser / cover / balance (already goal-side of the carrier) and the central
      // striker (the out-ball for the counter) gets at least `recover` units goal-side of the ball: wingers track back
      // into a 4-5-1, midfielders drop in front of the back four. Floors keep the shape when the ball is in a corner
      // (back four on the six-yard line, midfield no deeper than the penalty spot).
      if(this.defend.recover>0&&!rst&&p.team!==poss&&!p.isGK&&id!==presser&&id!==cover&&id!==balance&&!this.humans.has(id)&&!chasers.has(id)&&!(p.role==='fwd'&&Math.abs(p.hx-135)<30)){
        const own=this.ownGoalY(p.team),cap=recoveryDepth(this.defend.recover,Math.abs(this.ball.y-own),p.role==='def');
        if(Math.abs(ty-own)>cap)ty=own+Math.sign(200-own)*cap;
      }
      const w=this.wanderP[id];
      if(w&&p.isGK&&!rst&&!this.ballIsShot&&!gkSet&&!this.humans.has(id))
        tx+=Math.sin(this.stats.time*w.f1+w.p1)*1.2;
      // Low-pass the off-ball targets. When a marker sits between two attackers the
      // "nearest foe" can flip frame-to-frame and the raw target teleports between two
      // spots — smoothing settles the player at the midpoint instead of jittering back
      // and forth. The ball carrier stays fully responsive so play still looks sharp.
      // Stay onside: level with the last defender, never parked beyond him. The man a pass is being shaped for starts
      // his run now (a timed run); a ball-watching lapse lets a forward drift offside (the misread pass is then called).
      // 7v7 feed: a forward visibly waiting on the line (sevenAI SEVEN_NOTES.onside, lesson next7_offsideboundary)
      if (this.ai.coach7 && onsideCap > 0 && p.role === "fwd" && p.team === poss && id !== ballOwner && this.windup?.to !== id && this.depth(poss, ty) > onsideCap + 6) { this.seven.onsideWaits++; this.teach(SEVEN_NOTES.onside[0], SEVEN_NOTES.onside[1], "onside7", 60); }
      if (onsideCap > 0 && p.team === poss && !p.isGK && id !== ballOwner && !this.humans.has(id) && (brain?.lapse ?? 0) <= 0) {
        // the timed run may arrive LEVEL as the ball is struck (inside isOffside's +6 benefit of the doubt), never beyond
        const cap = this.windup?.to === id ? onsideCap + this.ai.onsideHold + 4 : onsideCap;
        if (this.depth(poss, ty) > cap) ty = poss === "gold" ? 400 - cap : cap;
      }
      // Press together (human Press button): the two NPC pressers hunt the carrier from two angles (empty set: no work).
      if (this.pressSet.size && ballOwner && !rst && this.pressSet.has(id) && this.players[ballOwner].team !== p.team) {
        const c = this.players[ballOwner], spot = this.pressSpot(id, c); tx = spot.x; ty = spot.y;
      }
      let nx = clamp(tx, 14, 256);
      let ny = clamp(ty, 12, 388);
      const prev = this.targets[id];
      // the carrier, first presser and committed ball chasers stay fully
      // responsive; only the zonal / get-open players get smoothed (that's where the
      // nearest-foe flip jitter lives)
      const responsive = id === ballOwner || id === presser || chasers.has(id) || (this.pressSet.size > 0 && this.pressSet.has(id));
      if (prev && !responsive) {
        const response=1-Math.exp(-dt/Math.max(.08,(this.brain[id]?.react??.2)*.65));
        nx = prev.x + (nx - prev.x) * response;
        ny = prev.y + (ny - prev.y) * response;
      }
      if (rst && this.ai.restartRing > 0 && (rst.kind === "kickin" || rst.kind === "corner") && id !== rst.taker && !p.isGK && p.team !== this.players[rst.taker].team
        && ringPush(this.ringOut, nx, ny, rst.x, rst.y, this.ai.restartRing, this.goalVenue.width, this.goalVenue.length)) { nx = this.ringOut.x; ny = this.ringOut.y; this.futsalStats.ringPushes++; }
      this.setTarget(id, nx, ny);
    }
  }

  // ---- movement integration: role speeds + momentum + backpedal (docs/body-mechanics) ----
  // Every player has a role movement profile (ROLE_MOVEMENT): forwards are quicker and
  // lighter, defenders slower to wind up but stop hard and plant, keepers spring within a
  // few units of a loose ball. Velocity keeps MOMENTUM: speeding up uses accel×role.accel,
  // slowing down accel×role.brake, and a cut of more than ~70° at running speed bleeds
  // speed first (a plant — the bled share scales with 1/role.turn) before the player
  // re-accelerates along the new line. Outfield defenders whose next step is toward their
  // own goal with the carrier in front of them BACKPEDAL (retreat facing the carrier at
  // ≤ .62 × max) while the target is near; further than that they turn and recover at
  // full speed. The presser's committed lunge, the build-out retreat and the human's
  // stick feel are untouched. Runs inside the ≤1/30 s substeps of step(), so the rates
  // are safe however much wall-clock time a distant match accumulates.
  private integrate(dt: number) {
    if (this.settleId && ((this.settleT -= dt) <= 0 || this.ball.owner !== this.settleId)) this.settleId = null; // [motion] receive settle
    const buildOut=this.buildOutTeam;
    const carrierId = this.ball.owner;
    const carrier = carrierId ? this.players[carrierId] : null;
    const liveBall = carrierId === null && !this.restart && this.goalHold <= 0; // a loose ball in play
    const fatigueBrake = 1 - this.fatigue * 0.025; // tired legs brake a touch softer (half the legsMul bite)
    for (const id of this.ids) {
      const p = this.players[id];
      // A diving keeper is in the air: he carries on to where he met the ball, then lands (no steering).
      const dive = this.gkDive;
      if (dive && dive.id === id) {
        const k = Math.min(1, dt / Math.max(dt, dive.t));
        p.vx = (dive.x - p.x) / Math.max(dt, dive.t); p.vy = (dive.y - p.y) / Math.max(dt, dive.t);
        p.x = clamp(p.x + (dive.x - p.x) * k, 8, 262); p.y = clamp(p.y + (dive.y - p.y) * k, 6, 396);
        p.brake = 0; p.backpedal = 0; p.plant = 0; p.intentX = p.vx; p.intentY = p.vy; p.moveDistance = 0;
        dive.t -= dt; if (dive.t <= 0) { this.gkDive = null; p.vx = p.vy = 0; }
        continue;
      }
      // [combos] a keeper who parried at full stretch is still on the grass (combos.ts rebound)
      if (this.combos && this.combos.pinned(id)) { p.vx = 0; p.vy = 0; p.brake = 0; p.backpedal = 0; p.plant = 0; continue; }
      const t = this.targets[id];
      const rm = ROLE_MOVEMENT[p.role];
      const hu = this.humans.get(id), isUser = !!hu;
      const dx = t.x - p.x;
      const dy = t.y - p.y;
      const d = Math.hypot(dx, dy);
      // keepers SPRING for a live shot (~25% quicker) — matches the faster strike pace so
      // decided saves still get made; decided goals are unaffected (they can't be saved)
      // a COMMITTED carry gallops (66 u/s; 76 in transition space on the counter) —
      // quicker than the shielding dribble but still catchable by a sprinting defender
      // (84), so every long carry eventually gets engaged and has to make its choice
      // — all scaled by the role's speed multiplier (keeper/owner/carry keep their ratios)
      const carryV = this.counterT > 0 && this.counterTeam === p.team ? 76 : 66;
      let maxV = (p.isGK ? P.gkSpeed * (this.ballIsShot && carrierId === null ? 1.25 : 1) : id === carrierId ? (this.carrying && !isUser ? carryV : isUser ? P.runSpeed * 0.92 : P.ownerSpeed) : P.runSpeed) * rm.speed;
      // burst: the keeper springs at a loose ball within reach (claims, smothers, spills)
      if (rm.burst > 1 && liveBall && dist(p.x, p.y, this.ball.x, this.ball.y) < M.keeperBurst) maxV *= rm.burst;
      if (!isUser) maxV *= this.legsMul; // match-arc legs (AI only — never the human)
      // Press together: the NPC pressers sprint at the carrier; a trick's bamboozled opponents lose a step (humans only).
      if (this.pressSet.size && carrier && carrier.team !== p.team && this.pressSet.has(id)) maxV *= PRESS.pace;
      if (this.dazed.size && !isUser && this.dazed.has(id)) maxV *= TRICK.slow;
      // Just for fun (owner Nov 4): opponents chasing a HUMAN carrier run ~18% slower, so a kid can outrun them (humans only; AI-only matches unchanged).
      if (!isUser && carrierId && this.humans.has(carrierId) && this.players[carrierId].team !== p.team) maxV *= this.humanChaseMul * this.humanPace;
      maxV *= this.legs; // sand (beach) — 1 on every other surface
      if (this.settleId === id) maxV = Math.min(maxV, this.receiveSettle); // [motion] receive settle
      let jockeying = false;
      if (isUser) {
        jockeying = !!(hu!.jockey && carrier && carrier.team !== hu!.team) && hu!.lunge <= 0; // a tackle lunge overrides the jockey
        if (jockeying) {
          stepSprint(hu!, dt, false);
          maxV = P.runSpeed * rm.speed * (hu!.sprint ? 1.2 : 0.9); // controlled containing pace (fast-jockey on sprint)
        } else {
          // analog speed: a soft push jogs, a hard push runs. Keyboard passes mag≈1 (full
          // speed, unchanged). Dead zone + quadratic curve give fine low-speed control.
          const m = hu!.mag;
          let analog = 1;
          if (m < 0.985) { const dz = 0.12; const t = m <= dz ? 0 : (m - dz) / (1 - dz); analog = 0.42 + 0.58 * (t * t); }
          // Sprint (a HELD button, owner Nov 4 2026): eased in/out (humanInputs.stepSprint) so the pace never snaps;
          // the stick only steers while it is held (the analog slow-down fades out), and top speed rises × SPRINT_BOOST.
          const se = stepSprint(hu!, dt, hu!.sprint && !p.isGK); // a keeper has no sprint (HUMAN_KEEPER)
          // A sprinting carrier is not held back by the shielding pace (ownerSpeed 50): it eases up to ~92% of a runner's pace first (owner Nov 4: sprint with the ball should be faster).
          if (id === carrierId && se > 0) maxV += (P.runSpeed * rm.speed * 0.92 - maxV) * se;
          maxV *= (analog + (1 - analog) * se) * (1 + (this.humanSprintBoost - 1) * se);
          if (id === carrierId && hu!.trickBoost > 0) maxV *= TRICK.burstPace; // the trick's burst through the gap
        }
        maxV *= this.humanPace; // the format's pace ladder (1 on the 7v7 + 11v11)
        if (hu!.lunge > 0 && carrier && carrier.team !== hu!.team) maxV *= TACKLE_ASSIST.lungePace; // the assisted tackle lunge
      }
      const pressing = (id === this.presserId || (this.pressSet.size > 0 && this.pressSet.has(id) && !!carrier && carrier.team !== p.team)) && carrierId && carrierId !== id;
      // ---- backpedal decision (outfield players defending a carrier) ----
      // carrier "in front" = up the pitch from this player (dot with his attacking direction
      // ≥ .3) and his target lies toward his own goal: near the target he retreats FACING
      // the carrier at ≤ .62 × max speed; far from it he turns and recovers at full speed.
      // Distance hysteresis (28 on / 36 off) plus a short dwell keep the decision steady.
      // The presser (lunge) and committed chasers are exempt; the human only while jockeying
      // (flag + facing for the rig, but his pace stays his own).
      // Hard exits (no opposing carrier, the lunge, a loose-ball chase, the human letting go
      // of jockey) drop the state at once; the geometric decision is debounced BOTH ways
      // (dwell) so a one-frame wobble of the target never toggles the pace cap.
      const mom = this.mom[id];
      let wantBack = false;
      let fx = 0, fy = 0;
      const exempt = !carrier || carrier.team === p.team || p.isGK || (isUser ? !jockeying : !!pressing || this.chaserIds.has(id));
      if (!exempt) {
        const cx = carrier.x - p.x, cy = carrier.y - p.y, cl = Math.hypot(cx, cy) || 1;
        fx = cx / cl; fy = cy / cl;
        const up = this.dirY(p.team); // this player's attacking direction — "in front" of a defender facing play
        const inFront = fy * up >= 0.3;
        const goalward = d > 0.5 && (dy / d) * -up >= 0.3; // next step is toward own goal
        if (inFront && goalward) wantBack = isUser ? true : mom.back ? d < M.backpedalOff : d < M.backpedalOn;
      }
      if (exempt || isUser) { mom.back = wantBack; mom.backT = 0; }
      else if (wantBack !== mom.back) { mom.backT += dt; if (mom.backT >= M.backpedalDwell) { mom.back = wantBack; mom.backT = 0; } }
      else mom.backT = 0;
      const backpedalling = mom.back;
      const maxV0 = maxV;
      if (backpedalling && !isUser) maxV *= M.backpedalSpeed;
      // desired velocity — arrive: full speed until close, then ease. The PRESSER gets no
      // ease-in: he closes at full sprint right onto the carrier (the lunge) — with the
      // ease he'd decelerate into orbit just outside tackle range and never win a ball.
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
      // A legal build-out retreat must not deadlock against stationary outlets.
      // (committed chase/retreat: spacing forces don't apply — decided once per player, not per pair)
      const spaced = !(pressing || this.chaserIds.has(id) || (buildOut&&p.team!==buildOut));
      for (const oid of spaced ? this.ids : NO_IDS) {
        if (oid === id) continue;
        if (id === this.ball.owner && (oid === this.presserId || (this.pressSet.size > 0 && this.pressSet.has(oid)))) continue; // carrier can't body the tackler away
        const o = this.players[oid];
        // cheap reject first (11v11: 462 pairs a step): squared distance clearly outside the radius skips the hypot;
        // anything near the edge still takes the exact test below, so the result is bit-identical
        const ex = p.x - o.x, ey = p.y - o.y;
        if (ex * ex + ey * ey > SEP_REJECT2) continue;
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
      let dv = Math.hypot(dvx, dvy);
      if (dv > maxV) { dvx = (dvx / dv) * maxV; dvy = (dvy / dv) * maxV; dv = maxV; }
      p.intentX=dvx;p.intentY=dvy;p.moveDistance=d;
      // ---- momentum model ----
      const speed = Math.hypot(p.vx, p.vy);
      const accRate = P.accel * rm.accel;
      const brkRate = P.accel * rm.brake * (isUser ? 1 : fatigueBrake);
      p.plant = Math.max(0, p.plant - dt / M.plantDecay);
      if (isUser) {
        // the human keeps the current stick feel: plain convergence, no plant bleed
        mom.floor = 0;
        const k = Math.min(1, dt * HUMAN_FEEL.accel); // snappier than the AI's P.accel (kids, owner Nov 4 2026)
        p.vx += (dvx - p.vx) * k;
        p.vy += (dvy - p.vy) * k;
      } else {
        // a cut: the desired line is >~70° off the current velocity at running speed →
        // plant. The share of speed bled scales with 1/turn (nimble forwards keep more,
        // heavy defenders nearly stop and re-plant); the impulse scales with entry speed.
        // (a reversal onto a target within ~10 u is an arrival overshoot — a STOP, which the
        // brake rate handles — not a cut; and a fresh plant can't chain straight into another)
        if (mom.cool > 0) mom.cool -= dt;
        if (mom.floor <= 0 && mom.cool <= 0 && speed > M.plantSpeed && d >= M.plantTargetDist && dv >= 8 && p.vx * dvx + p.vy * dvy < speed * dv * M.plantAngleCos) {
          mom.floor = speed * (1 - clamp(M.plantBleed / rm.turn, 0.4, M.plantFloorMax));
          mom.cool = M.plantCooldown;
          p.plant = Math.max(p.plant, clamp(speed / (maxV0 * 0.5), 0, 1));
        }
        if (mom.floor > 0) {
          // planting: velocity shrinks toward zero at the brake rate…
          // (never below the floor: a 1/30 s step would otherwise overshoot it and the
          // bled share would quantise to whole frames instead of following 1/turn)
          const kb = Math.min(1, dt * brkRate);
          const sp2 = Math.max(mom.floor, speed * (1 - kb));
          const shrink = speed > 0.01 ? sp2 / speed : 0;
          p.vx *= shrink;
          p.vy *= shrink;
          // …until enough is bled (or the new line agrees with the momentum left) — then
          // ordinary acceleration takes over along the desired direction
          const cos2 = sp2 > 0.01 && dv > 0.01 ? (p.vx * dvx + p.vy * dvy) / (sp2 * dv) : 1;
          if (sp2 <= mom.floor || cos2 > 0.7) mom.floor = 0;
        } else {
          const k = Math.min(1, dt * (dv >= speed ? accRate : brkRate));
          p.vx += (dvx - p.vx) * k;
          p.vy += (dvy - p.vy) * k;
        }
      }
      // brake read: actual deceleration this step against this player's hardest possible
      // brake (full speed × brake rate) — 1 on a hard stop / plant, 0 while cruising
      const decel = (speed - Math.hypot(p.vx, p.vy)) / dt;
      p.brake = decel > 0 ? clamp(decel / (maxV0 * brkRate), 0, 1) : 0;
      // backpedal output (render-only; the pace cap above already follows mom.back), read after
      // this step's velocity so a released defender never shows the retreat pose at recovery pace
      if (backpedalling) p.backpedal += (1 - p.backpedal) * Math.min(1, dt / M.backpedalRamp);
      else {
        // Released: the turn-and-recover run must not carry the upright retreat pose. Drop
        // linearly in backpedalRelease, and never read more than the pace allows: at 1.15 × the
        // retreat cap (~59 u/s for a defender) the output is gone. Both terms only ever lower
        // the value, so the release stays monotonic (no flicker; re-engaging still waits out
        // the dwell above).
        const capV = maxV0 * M.backpedalSpeed, speedNow = Math.hypot(p.vx, p.vy);
        p.backpedal = Math.min(p.backpedal - dt / M.backpedalRelease, clamp((capV * 1.15 - speedNow) / (capV * 0.15), 0, 1));
      }
      if (p.backpedal <= 0.02) { p.backpedal = 0; p.faceX = 0; p.faceY = 0; }
      else if (!exempt) { p.faceX = fx; p.faceY = fy; } // ramping out after a hard exit keeps the last facing
      p.x = clamp(p.x + p.vx * dt, 8, 262);
      p.y = clamp(p.y + p.vy * dt, 6, 396);
    }
  }
}
