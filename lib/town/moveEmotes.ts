// Moving emotes (user, Oct 22 2026: "do the walking emotes"): while you walk or run on foot the Emote wheel shows the moving emotes that play
// ON TOP of your locomotion. Pure data + pose functions + rules, no three.js, no DOM, no allocation per frame.
//  - Mechanics: an upper-body overlay only (arms, torso lean / twist / side bend, head, hip sway, a small bounce on the walk bob). Velocity,
//    input and the leg cycle are never touched: the legs keep walking / running underneath (lib/graphics/moveEmotePose.ts writes no leg joint).
//  - Oct 23 2026 (owner: "emotes while walking or running"): all TEN standing emotes now have a moving version (50..59), so the wheel while
//    moving mirrors the standing wheel; the ball emotes become mimes (no ball while moving), Laugh / Thanks / Well played get their own.
//  - Each emote has three very different variants drawn from a shuffled bag (you, a friend: their own bag).
//  - Local ids 50..59 (ground 0..9, rides 10..18, flying / swimming 20..34, townsperson sets 40..49). Friends only get an existing protocol
//    value (`wire`, Emote 0..9): their avatar plays the moving version when the SENDER'S mode is Walk / Run and they are moving (`moveForWire`).
//    No new wire values: old clients just see the matching standing emote's bubble.
//  - A townsperson you pass answers without leaving its route (`moveAnswerFor` / `moveAnswerAt`): a wave, a clap, a fist pump, a nod; the
//    run-by high five gets the townsperson's half (an air five) with a brief slow-down. A seated one only turns its head and waves a little.
// Pose vector: lib/town/emoteBody.ts BODY_CH / BC layout (the same channels as the whole-body emotes). Channels the overlay owns: hop (a small
// bounce added to the pelvis), yaw / roll (a hip twist / sway added to the pelvis), pitch / twist / side (added to the torso), hx / hy / hz
// (added to the head) and both arms (NaN in an arm = leave that arm to the walk swing). px / pz / crouch and the legs stay 0: never written.
import {BC, BODY_CH} from './emoteBody';

export const MOVE_EMOTE = {WaveOnMove: 50, VictoryJog: 51, Skip: 52, Strut: 53, RunByFive: 54, CallForIt: 55, JuggleOnMove: 56, WellPlayedOnMove: 57, LaughOnMove: 58, ThanksOnMove: 59} as const;
export type MoveEmote = (typeof MOVE_EMOTE)[keyof typeof MOVE_EMOTE];
export const isMoveEmote = (e: number): e is MoveEmote => e >= 50 && e <= 59;
/** Protocol Mode values (multiplayer/protocol/types.ts Mode.Walk / Mode.Run), copied so this module stays dependency-free; tests pin them. */
export const WIRE_WALK = 0, WIRE_RUN = 1;
/** On foot above this speed (m/s) the wheel shows the moving set; it goes back to the standing set below MOVE_WHEEL_OFF (hysteresis at ~4 Hz). */
export const MOVE_WHEEL_ON = .9, MOVE_WHEEL_OFF = .45;
/** A moving emote that is still playing when you stop eases out over this long (s) instead of running its whole length. */
export const MOVE_STOP_FADE = .6;
/** You count as stopped below this speed (m/s). */
export const MOVE_STOPPED = .3;
/** Largest bounce (m) the overlay adds on top of the walk bob. */
export const MOVE_MAX_HOP = .22;

type O = Float32Array | number[];
export type MovePoseFn = (t: number, o: O) => void;
export interface MoveVariant {id: string; name: string; pose: MovePoseFn}
export interface MoveScript {
  emote: MoveEmote; label: string; icon: string; emoji: string;
  /** Length (s), the protocol Emote value friends receive, and when (s) the hand meets for the run-by high five (-1: no hit). */
  seconds: number; wire: number; hitAt: number;
  /** The townsperson's answer: arm pose (0 wave, 1 fist pump, 2 air five, 5 clap), how much of its speed it keeps (1 = no change), a nod, and its bubble (an Emote value). */
  npcArm: number; npcSlow: number; npcNod: number; npcBubble: number;
  variants: readonly MoveVariant[];
}

const TAU = Math.PI * 2;
const cl = (v: number) => v < 0 ? 0 : v > 1 ? 1 : v;
const S = (v: number) => { const t = cl(v); return t * t * (3 - 2 * t); };
const seg = (t: number, a: number, b: number) => S((t - a) / (b - a));
/** On between a and b with eased edges of length e. */
const win = (t: number, a: number, b: number, e = .3) => Math.min(seg(t, a, a + e), 1 - seg(t, b - e, b));
const arc = (t: number, t0: number, len: number) => { const u = (t - t0) / len; return u <= 0 || u >= 1 ? 0 : 4 * u * (1 - u); };
const pos = (v: number) => v > 0 ? v : 0;
const sin = Math.sin, cos = Math.cos, abs = Math.abs;
const RA = [.05, .12, -.1] as const; // arm at rest (emoteBody.ts)
/** Arm L (left) or right: rest → (sx, out, el) by f. Arm numbers as emoteBody.ts: shoulder-x < 0 swings forward / up, out lifts sideways (mirrored), elbow < 0 bends. */
function arm(o: O, L: boolean, f: number, sx: number, sz: number, el: number) {
  const i = L ? BC.lsx : BC.rsx; o[i] = RA[0] + (sx - RA[0]) * f; o[i + 1] = RA[1] + (sz - RA[1]) * f; o[i + 2] = RA[2] + (el - RA[2]) * f;
}
function armTo(o: O, L: boolean, f: number, sx: number, sz: number, el: number) {
  const i = L ? BC.lsx : BC.rsx; o[i] += (sx - o[i]) * f; o[i + 1] += (sz - o[i + 1]) * f; o[i + 2] += (el - o[i + 2]) * f;
}
/** Leave this arm to the walk / run swing. */
function free(o: O, L: boolean) { const i = L ? BC.lsx : BC.rsx; o[i] = o[i + 1] = o[i + 2] = NaN; }

// ------------------------------------------------------------------------------------------------------------------- WAVE ON THE MOVE (3.4 s)
/** Big arc wave: the right arm high overhead sweeping wide arcs, the head turned to the side, shoulders swaying with each sweep. */
function waveArc(t: number, o: O) {
  const e = win(t, .05, 3.35, .35), ws = sin(TAU * 1.5 * t);
  o[BC.side] = .16 * ws * e; o[BC.twist] = .22 * e; o[BC.hy] = .5 * e; o[BC.hz] = .12 * ws * e; o[BC.hx] = -.1 * e; o[BC.roll] = .06 * ws * e;
  o[BC.hop] = .035 * pos(sin(TAU * 3 * t)) * e;
  arm(o, false, e, -2.75, .5 + .6 * ws, -.25 - .25 * ws); free(o, true);
}
/** Two-hand hello: both arms wide in a big V with bent "hello" hands, wiping side to side together, the whole upper body swaying with them. */
function waveTwoHand(t: number, o: O) {
  const e = win(t, .05, 3.35, .35), s = sin(TAU * 1.3 * t);
  o[BC.pitch] = -.14 * e; o[BC.hx] = (-.18 + .14 * abs(s)) * e; o[BC.hz] = -.2 * s * e; o[BC.roll] = .11 * s * e; o[BC.side] = -.24 * s * e;
  o[BC.hop] = .04 * abs(s) * e;
  arm(o, true, e, -2.05, 1.4 + .55 * s, -.95); arm(o, false, e, -2.05, 1.4 - .55 * s, -.95);
}
/** Look-back wave: twisted round over the right shoulder, waving back at someone you just passed (hand low behind), the other arm pumping on. */
function waveLookBack(t: number, o: O) {
  const e = win(t, .05, 3.35, .45), w = sin(TAU * 2.2 * t);
  o[BC.twist] = -.6 * e; o[BC.hy] = -.95 * e; o[BC.side] = .14 * e; o[BC.yaw] = -.18 * e; o[BC.hx] = -.08 * e; o[BC.hz] = .1 * w * e;
  o[BC.hop] = .03 * pos(sin(TAU * 2.6 * t)) * e;
  arm(o, false, e, .45, 1.05 + .3 * w, -.55 - .45 * w); arm(o, true, e, -.75 + .3 * sin(TAU * 1.3 * t), .2, -1.4);
}

// ------------------------------------------------------------------------------------------------------------------- VICTORY JOG (3.6 s)
/** Alternating fist pumps: right, left, right... each one punched to the sky with a bounce, chest proud. */
function jogPumps(t: number, o: O) {
  const e = win(t, .05, 3.55, .3), p = sin(TAU * 1.4 * t), r = pos(p), l = pos(-p);
  o[BC.pitch] = -.16 * e; o[BC.hx] = -.22 * e; o[BC.side] = .12 * p * e; o[BC.twist] = .16 * p * e; o[BC.hop] = .09 * abs(p) * e; o[BC.hz] = -.08 * p * e;
  arm(o, false, e, -1.0 - 1.75 * r, .25 + .2 * r, -2.0 + 1.75 * r); arm(o, true, e, -1.0 - 1.75 * l, .25 + .2 * l, -2.0 + 1.75 * l);
}
/** Sky punch: both fists thrown straight up together, head back, a big bounce on each punch. */
function jogSkyPunch(t: number, o: O) {
  const e = win(t, .05, 3.55, .3), u = pos(sin(TAU * 1.2 * t - .6));
  o[BC.hop] = (.04 + .14 * u) * e; o[BC.hx] = (-.1 - .35 * u) * e; o[BC.pitch] = (.08 - .26 * u) * e; o[BC.roll] = .05 * sin(TAU * .6 * t) * e;
  arm(o, true, e, -.9 - 2.0 * u, .3 + .35 * u, -1.9 + 1.75 * u); arm(o, false, e, -.9 - 2.0 * u, .3 + .35 * u, -1.9 + 1.75 * u);
}
/** Aeroplane victory lap: arms straight out like wings, banking left and right, the head tilting against the bank. */
function jogAeroplane(t: number, o: O) {
  const e = win(t, .05, 3.55, .4), b = sin(TAU * .55 * t);
  o[BC.side] = .34 * b * e; o[BC.roll] = .1 * b * e; o[BC.hz] = -.24 * b * e; o[BC.twist] = .18 * b * e; o[BC.pitch] = .12 * e; o[BC.hx] = -.12 * e;
  o[BC.hop] = .03 * pos(sin(TAU * 2.6 * t)) * e;
  arm(o, true, e, -.15, 1.5 + .1 * b, -.05); arm(o, false, e, -.15, 1.5 - .1 * b, -.05);
}

// ------------------------------------------------------------------------------------------------------------------- SKIP (3.2 s)
/** Skip and swing: a skipping hop twice a second with both arms swinging big and opposite, forward and back. */
function skipSwing(t: number, o: O) {
  const e = win(t, .05, 3.15, .3), s = sin(TAU * t), h = pos(sin(TAU * 2 * t));
  o[BC.hop] = .15 * h * e; o[BC.twist] = -.22 * s * e; o[BC.hx] = .1 * h * e; o[BC.pitch] = .05 * e; o[BC.hz] = .08 * s * e;
  arm(o, false, e, -.4 - 1.25 * s, .22, -.55); arm(o, true, e, -.4 + 1.25 * s, .22, -.55);
}
/** Arm-circle skip: both arms circling forward together like a windmill while skipping, head bobbing. */
function skipCircles(t: number, o: O) {
  const e = win(t, .05, 3.15, .3), w = TAU * 1.15 * t, h = pos(sin(TAU * 2 * t + .4));
  o[BC.hop] = .13 * h * e; o[BC.hx] = .14 * sin(2 * w) * e; o[BC.pitch] = (.1 + .08 * sin(w)) * e; o[BC.side] = .1 * cos(w) * e; o[BC.roll] = .06 * sin(TAU * t) * e;
  arm(o, true, e, -1.35 - 1.3 * sin(w), .45 + .2 * cos(w), -.3); arm(o, false, e, -1.35 - 1.3 * sin(w), .45 + .2 * cos(w), -.3);
}
/** Clap skip: a hop every half second with a clap high over the head at the top of each hop. */
function skipClap(t: number, o: O) {
  const e = win(t, .05, 3.15, .3), c = pos(sin(TAU * 2 * t));
  o[BC.hop] = .17 * c * e; o[BC.hx] = (-.15 - .15 * c) * e; o[BC.pitch] = -.1 * e; o[BC.side] = .08 * sin(TAU * t) * e;
  arm(o, true, e, -2.55, .75 - .62 * c, -.45 + .2 * c); arm(o, false, e, -2.55, .75 - .62 * c, -.45 + .2 * c);
}

// ------------------------------------------------------------------------------------------------------------------- STRUT (3.6 s)
/** Collar pop: chest out, hips swaying, both hands at the collar popping it up three times, chin high and looking round slowly. */
function strutCollar(t: number, o: O) {
  const e = win(t, .05, 3.55, .35), sw = sin(TAU * .9 * t), pop = arc(t, .7, .4) + arc(t, 1.7, .4) + arc(t, 2.7, .4);
  o[BC.pitch] = -.2 * e; o[BC.roll] = .13 * sw * e; o[BC.yaw] = .15 * sw * e; o[BC.side] = -.1 * sw * e; o[BC.hx] = (-.24 - .1 * pop) * e; o[BC.hy] = .4 * sin(TAU * .3 * t) * e;
  o[BC.hop] = .02 * pos(sw) * e;
  arm(o, true, e, -1.05 - .3 * pop, .5 + .35 * pop, -2.35); arm(o, false, e, -1.05 - .3 * pop, .5 + .35 * pop, -2.35);
}
/** Hair flip: one hand on the hip, the other runs back through the hair, then a big head toss, twice, hips swinging. */
function strutHair(t: number, o: O) {
  const e = win(t, .05, 3.55, .35), sw = sin(TAU * .9 * t), flip = arc(t, 1.0, .55) + arc(t, 2.5, .55), up = win(t, .4, 1.55, .25) + win(t, 1.9, 3.05, .25);
  o[BC.roll] = .15 * sw * e; o[BC.yaw] = -.12 * sw * e; o[BC.side] = .12 * sw * e - .12 * flip; o[BC.pitch] = -.1 * e;
  o[BC.hx] = (-.1 - .45 * flip) * e; o[BC.hz] = .28 * flip * e; o[BC.hy] = -.2 * flip * e;
  arm(o, true, e, .35, .55, -1.65); arm(o, false, e, -.3, .4, -.4); armTo(o, false, cl(up) * e, -2.6, .95 + .2 * flip, -2.25);
}
/** Finger guns: leaning back cool, shoulders rolling, both hands pointing ahead and firing "pew pew" with a recoil and a nod on each shot. */
function strutGuns(t: number, o: O) {
  const e = win(t, .05, 3.55, .35), roll = sin(TAU * .9 * t), pew = arc(t, .8, .3) + arc(t, 1.5, .3) + arc(t, 2.2, .3) + arc(t, 2.9, .3);
  o[BC.pitch] = -.16 * e; o[BC.twist] = .32 * roll * e; o[BC.side] = .15 * roll * e; o[BC.roll] = .08 * roll * e; o[BC.hx] = (.05 + .2 * pew) * e; o[BC.hy] = -.25 * roll * e;
  arm(o, true, e, -1.45 + .5 * pew, -.1, -.15 - .55 * pew); arm(o, false, e, -1.45 + .5 * pew, -.1, -.15 - .55 * pew);
}

// ------------------------------------------------------------------------------------------------------------------- RUN-BY HIGH FIVE (2.8 s, hit at 1.1 s)
const HIT = 1.1;
/** Side high five: the right hand reaches out and up to the side, the slap (a recoil), then a fist pump looking back. */
function fiveSide(t: number, o: O) {
  const reach = win(t, .15, HIT + .2, .35), hit = arc(t, HIT - .05, .3), pump = win(t, HIT + .3, 2.75, .3), p = pos(sin(TAU * 2 * (t - HIT)));
  o[BC.side] = .22 * reach - .1 * pump; o[BC.hy] = .6 * reach - .5 * pump; o[BC.twist] = .2 * reach - .25 * pump; o[BC.hz] = .1 * reach; o[BC.hop] = .1 * hit + .06 * p * pump;
  o[BC.hx] = -.2 * pump;
  arm(o, false, reach, -1.85 + .45 * hit, 1.3, -.15); armTo(o, false, pump, -2.4 - .3 * p, .3, -1.0 + .7 * p); free(o, true);
}
/** Low five: a lean to the side with the hand low and out, the slap, then shaking the stinging hand ("ouch!") with the head down laughing. */
function fiveLow(t: number, o: O) {
  const reach = win(t, .15, HIT + .2, .35), hit = arc(t, HIT - .05, .3), shake = win(t, HIT + .25, 2.75, .25), sh = sin(TAU * 7 * t);
  o[BC.side] = .3 * reach + .1 * shake; o[BC.pitch] = .22 * reach + .18 * shake; o[BC.hx] = .2 * reach + (.25 + .08 * sh) * shake; o[BC.hy] = .35 * reach;
  o[BC.hop] = .05 * hit + .05 * pos(sin(TAU * 3 * t)) * shake; o[BC.twist] = -.15 * shake; o[BC.roll] = .08 * sin(TAU * 1.5 * t) * shake;
  arm(o, false, reach, -.35 + .25 * hit, .95, -.1); armTo(o, false, shake, -1.1, .35, -1.9 + .35 * sh); arm(o, true, shake, -.9, .3, -1.5);
}
/** Jump five: both hands thrown up for a two-hand air five with a jump, then pointing back at your friend. */
function fiveJump(t: number, o: O) {
  const up = win(t, .2, HIT + .3, .3), jump = arc(t, HIT - .25, .5), point = win(t, HIT + .35, 2.75, .3);
  o[BC.hop] = .2 * jump + .02 * point; o[BC.pitch] = -.12 * up + .08 * point; o[BC.hx] = -.3 * up; o[BC.twist] = .35 * point; o[BC.hy] = .5 * point;
  arm(o, true, up, -2.75, .45, -.2); arm(o, false, up, -2.75, .45, -.2);
  armTo(o, false, point, -1.5, .9, -.05); armTo(o, true, point, -.9, .2, -1.95);
}

// ------------------------------------------------------------------------------------------------------------------- JUGGLE ON THE MOVE (3.4 s)
// No ball while moving (the ball emotes need you standing): a mime of keepy-ups that says "juggle with me" without stopping.
/** Header bounce: nodding imaginary headers twice a second with a big bounce on each, the hands low in front bouncing an imaginary ball in turn. */
function juggleHeaders(t: number, o: O) {
  const e = win(t, .05, 3.35, .3), n = pos(sin(TAU * 2 * t)), b = sin(TAU * t);
  o[BC.hx] = (-.35 + .8 * n) * e; o[BC.pitch] = (-.15 + .3 * n) * e; o[BC.hop] = .16 * n * e; o[BC.side] = .1 * b * e; o[BC.roll] = .05 * b * e;
  arm(o, true, e, -.35 - .75 * pos(b), .65, -.6); arm(o, false, e, -.35 - .75 * pos(-b), .65, -.6);
}
/** Come-juggle beckon: turned back over the LEFT shoulder, the left hand beckoning a friend to come and juggle, the right arm pumping on. */
function juggleBeckon(t: number, o: O) {
  const e = win(t, .05, 3.35, .4), c = sin(TAU * 2.4 * t);
  o[BC.twist] = .55 * e; o[BC.hy] = .9 * e; o[BC.side] = -.12 * e; o[BC.yaw] = .16 * e; o[BC.hx] = (-.05 + .08 * c) * e;
  o[BC.hop] = .03 * pos(sin(TAU * 2.6 * t)) * e;
  arm(o, true, e, -1.35, .9, -1.1 - .7 * c); arm(o, false, e, -.6 + .35 * sin(TAU * 1.3 * t), .2, -1.5);
}
/** Chest trap: leaning back with arms swept back behind, the chest popping up three times as if killing a ball dead, a proud chin after. */
function juggleChest(t: number, o: O) {
  const e = win(t, .05, 3.35, .35), pop = arc(t, .6, .45) + arc(t, 1.5, .45) + arc(t, 2.4, .45);
  o[BC.pitch] = (-.26 - .2 * pop) * e; o[BC.hx] = (.3 - .35 * pop) * e; o[BC.hop] = .1 * pop * e; o[BC.roll] = .05 * sin(TAU * .9 * t) * e; o[BC.twist] = .1 * sin(TAU * .9 * t) * e;
  arm(o, true, e, .6 + .25 * pop, .7, -.2); arm(o, false, e, .6 + .25 * pop, .7, -.2);
}

// ------------------------------------------------------------------------------------------------------------------- WELL PLAYED ON THE MOVE (3.4 s)
/** Turn-and-clap: twisted toward whoever played well, clapping at chest height, nodding along with a bounce. */
function wellClap(t: number, o: O) {
  const e = win(t, .05, 3.35, .3), c = .5 + .5 * sin(TAU * 2.5 * t), n = sin(TAU * 1.25 * t);
  o[BC.hx] = (.08 + .14 * n) * e; o[BC.pitch] = (.06 + .06 * n) * e; o[BC.twist] = -.5 * e; o[BC.hy] = -.6 * e; o[BC.hop] = .07 * c * e; o[BC.yaw] = -.1 * e; o[BC.hz] = .1 * sin(TAU * .6 * t) * e;
  arm(o, true, e, -1.35, .05 + .55 * c, -1.15); arm(o, false, e, -1.35, .05 + .55 * c, -1.15);
}
/** Double thumbs-up: elbows out wide, both thumbs up at shoulder height, bobbing up and down, the head tilting side to side with a grin. */
function wellThumbs(t: number, o: O) {
  const e = win(t, .05, 3.35, .3), b = sin(TAU * 1.6 * t), s = sin(TAU * .8 * t);
  o[BC.hz] = .3 * s * e; o[BC.side] = .16 * s * e; o[BC.twist] = .2 * s * e; o[BC.hx] = -.08 * e; o[BC.hop] = .05 * pos(b) * e; o[BC.roll] = .05 * s * e;
  arm(o, true, e, -.9 - .3 * b, 1.25, -1.5 + .3 * b); arm(o, false, e, -.9 - .3 * b, 1.25, -1.5 + .3 * b);
}
/** Point and tap: the right arm points out to the side at whoever played well, then pats the chest, twice. */
function wellPointTap(t: number, o: O) {
  const e = win(t, .05, 3.35, .35), p = win(t, .25, 1.15, .25) + win(t, 1.75, 2.65, .25), tap = win(t, 1.15, 1.75, .2) + win(t, 2.65, 3.25, .2);
  o[BC.side] = (-.25 * p + .05 * tap) * e; o[BC.hy] = (-.65 * p) * e; o[BC.hx] = (.25 * tap - .05) * e; o[BC.twist] = (-.3 * p) * e; o[BC.hop] = .05 * tap * e; o[BC.yaw] = -.08 * p * e;
  arm(o, false, e, -.4, .2, -.2); armTo(o, false, cl(p) * e, -1.45, 1.35, -.05); armTo(o, false, cl(tap) * e, -1.0, -.2, -2.3); free(o, true);
}

// ------------------------------------------------------------------------------------------------------------------- CALL FOR IT (Pass it, 3.2 s)
/** Hand up: the LEFT arm straight up calling for the ball, fingers flicking, glancing back at the passer. */
function passHandUp(t: number, o: O) {
  const e = win(t, .05, 3.15, .35), f = sin(TAU * 3 * t);
  o[BC.side] = -.22 * e; o[BC.hy] = .55 * e; o[BC.twist] = .25 * e; o[BC.hx] = -.18 * e; o[BC.roll] = -.06 * e; o[BC.hop] = .03 * pos(sin(TAU * 2.6 * t)) * e;
  arm(o, true, e, -2.95, .25, -.1 - .25 * pos(f)); free(o, false);
}
/** Point into space: leaning forward, the right arm jabbing ahead into the space ("there!"), the left hand waving the passer on. */
function passPoint(t: number, o: O) {
  const e = win(t, .05, 3.15, .3), j = arc(t, .5, .5) + arc(t, 1.4, .5) + arc(t, 2.3, .5), w = sin(TAU * 2 * t);
  o[BC.pitch] = (.22 + .08 * j) * e; o[BC.hx] = (-.2 - .1 * j) * e; o[BC.twist] = -.18 * e; o[BC.hop] = .08 * j * e; o[BC.hy] = .1 * w * e; o[BC.roll] = -.05 * e;
  arm(o, false, e, -1.5 - .1 * j, .05, -.6 + .55 * j); arm(o, true, e, -.6, .55, -1.2 + .6 * w);
}
/** Give-and-go: looking back at the passer with both palms out ("give it"), then a sweep pointing ahead with a twist, twice. */
function passGiveGo(t: number, o: O) {
  const e = win(t, .05, 3.15, .35), sw = win(t, .9, 1.5, .2) + win(t, 2.2, 2.8, .2);
  o[BC.twist] = (.4 - .8 * sw) * e; o[BC.pitch] = (.1 - .12 * sw) * e; o[BC.hy] = (.6 - 1.0 * sw) * e; o[BC.hx] = (.18 - .15 * sw) * e; o[BC.hop] = .08 * sw * e;
  arm(o, true, e, -1.25, .75, -.55); arm(o, false, e, -1.25, .75, -.55);
  armTo(o, false, cl(sw) * e, -1.9, .35, -.05); armTo(o, true, cl(sw) * e, -.3, .25, -1.3);
}

// ------------------------------------------------------------------------------------------------------------------- LAUGH ON THE MOVE (3.2 s)
/** Belly laugh: hands on the belly, the body shaking with laughter in quick little bounces, head bobbing. */
function laughBelly(t: number, o: O) {
  const e = win(t, .05, 3.15, .3), q = sin(TAU * 5 * t), s = sin(TAU * .7 * t);
  o[BC.pitch] = (.24 + .08 * q) * e; o[BC.hx] = (.2 + .15 * q) * e; o[BC.hop] = .05 * pos(q) * e; o[BC.side] = .1 * s * e; o[BC.roll] = .06 * s * e;
  arm(o, true, e, -.45, .3, -1.95); arm(o, false, e, -.45, .3, -1.95);
}
/** Head-back roar: head thrown back laughing at the sky, both hands on top of the head, shoulders shaking. */
function laughHeadBack(t: number, o: O) {
  const e = win(t, .05, 3.15, .35), q = sin(TAU * 4 * t), s = sin(TAU * .9 * t);
  o[BC.hx] = (-.6 + .1 * q) * e; o[BC.pitch] = (-.24 + .05 * q) * e; o[BC.hz] = .15 * s * e; o[BC.twist] = .15 * s * e; o[BC.hop] = .04 * pos(q) * e; o[BC.roll] = .05 * s * e;
  arm(o, true, e, -2.2 + .12 * q, .95, -2.4); arm(o, false, e, -2.2 - .12 * q, .95, -2.4);
}
/** Point and laugh: the LEFT arm pointing ahead at the joke, the right hand on the belly, bent sideways with laughter. */
function laughPoint(t: number, o: O) {
  const e = win(t, .05, 3.15, .35), q = sin(TAU * 4.5 * t);
  o[BC.side] = (-.32 - .06 * q) * e; o[BC.hz] = -.25 * e; o[BC.hx] = (.1 + .12 * q) * e; o[BC.twist] = -.22 * e; o[BC.hop] = .05 * pos(q) * e; o[BC.roll] = -.08 * e;
  arm(o, true, e, -1.55 + .15 * q, .4, -.1); arm(o, false, e, -.4, .35, -2.0);
}

// ------------------------------------------------------------------------------------------------------------------- THANKS ON THE MOVE (3.2 s)
/** Hand on heart: the right hand pressed to the chest, two warm nods, a slight bow. */
function thanksHeart(t: number, o: O) {
  const e = win(t, .05, 3.15, .35), n = arc(t, .8, .6) + arc(t, 1.9, .6);
  o[BC.hx] = (.05 + .4 * n) * e; o[BC.pitch] = (.05 + .2 * n) * e; o[BC.hy] = .3 * e; o[BC.twist] = .12 * e; o[BC.hop] = .03 * n * e; o[BC.roll] = .07 * n * e;
  arm(o, false, e, -.95, -.15, -2.3); free(o, true);
}
/** Salute: a crisp salute at the brow, chin up, held, then snapped away with a little hop. */
function thanksSalute(t: number, o: O) {
  const e = win(t, .05, 3.15, .3), snap = arc(t, 2.4, .4);
  o[BC.hx] = (-.22 + .1 * snap) * e; o[BC.pitch] = -.14 * e; o[BC.hy] = -.35 * e; o[BC.twist] = -.15 * e; o[BC.hop] = .1 * snap * e; o[BC.yaw] = -.08 * e;
  arm(o, false, e, -1.95 + .6 * snap, 1.1, -2.35 + 1.2 * snap); free(o, true);
}
/** Prayer bow: both hands together up in front of the face, two deep bows from the waist with a nod each. */
function thanksPrayer(t: number, o: O) {
  const e = win(t, .05, 3.15, .35), b = arc(t, .7, .7) + arc(t, 1.8, .7);
  o[BC.pitch] = (.08 + .45 * b) * e; o[BC.hx] = (.08 + .4 * b) * e; o[BC.hop] = .04 * b * e; o[BC.roll] = .04 * sin(TAU * .8 * t) * e; o[BC.hz] = .1 * sin(TAU * .8 * t) * e;
  arm(o, true, e, -1.6, -.05, -2.1); arm(o, false, e, -1.6, -.05, -2.1);
}

const V = (id: string, name: string, pose: MovePoseFn): MoveVariant => ({id, name, pose});
export const MOVE_SCRIPTS: readonly MoveScript[] = [
  {emote: MOVE_EMOTE.WaveOnMove, label: 'Wave on the move', icon: 'hand', emoji: '\u{1F44B}', seconds: 3.4, wire: 0, hitAt: -1, npcArm: 0, npcSlow: 1, npcNod: 0, npcBubble: 0,
    variants: [V('arc', 'Big arc wave', waveArc), V('two-hand', 'Two-hand hello', waveTwoHand), V('look-back', 'Look-back wave', waveLookBack)]},
  {emote: MOVE_EMOTE.VictoryJog, label: 'Victory jog', icon: 'move-jog', emoji: '\u{1F3C3}', seconds: 3.6, wire: 1, hitAt: -1, npcArm: 1, npcSlow: 1, npcNod: 0, npcBubble: 1,
    variants: [V('pumps', 'Fist pumps', jogPumps), V('sky-punch', 'Sky punch', jogSkyPunch), V('aeroplane', 'Aeroplane lap', jogAeroplane)]},
  {emote: MOVE_EMOTE.Skip, label: 'Skip', icon: 'move-skip', emoji: '\u{1F3B6}', seconds: 3.2, wire: 8, hitAt: -1, npcArm: 5, npcSlow: 1, npcNod: 0, npcBubble: 5,
    variants: [V('swing', 'Skip and swing', skipSwing), V('circles', 'Arm-circle skip', skipCircles), V('clap', 'Clap skip', skipClap)]},
  {emote: MOVE_EMOTE.Strut, label: 'Strut', icon: 'move-strut', emoji: '\u{1F60E}', seconds: 3.6, wire: 4, hitAt: -1, npcArm: 1, npcSlow: 1, npcNod: 1, npcBubble: 4,
    variants: [V('collar', 'Collar pop', strutCollar), V('hair', 'Hair flip', strutHair), V('guns', 'Finger guns', strutGuns)]},
  {emote: MOVE_EMOTE.RunByFive, label: 'Run-by high five', icon: 'move-five', emoji: '\u{1F64C}', seconds: 2.8, wire: 2, hitAt: HIT, npcArm: 2, npcSlow: .35, npcNod: 0, npcBubble: 2,
    variants: [V('side', 'Side high five', fiveSide), V('low', 'Low five', fiveLow), V('jump', 'Jump five', fiveJump)]},
  {emote: MOVE_EMOTE.CallForIt, label: 'Call for it', icon: 'pass', emoji: '\u{1F64B}', seconds: 3.2, wire: 6, hitAt: -1, npcArm: 0, npcSlow: 1, npcNod: 1, npcBubble: 6,
    variants: [V('hand-up', 'Hand up', passHandUp), V('point', 'Point into space', passPoint), V('give-go', 'Give-and-go', passGiveGo)]},
  {emote: MOVE_EMOTE.JuggleOnMove, label: 'Juggle on the move', icon: 'juggle-air', emoji: '\u{1F938}', seconds: 3.4, wire: 3, hitAt: -1, npcArm: 0, npcSlow: 1, npcNod: 1, npcBubble: 3,
    variants: [V('headers', 'Header bounce', juggleHeaders), V('beckon', 'Come-juggle beckon', juggleBeckon), V('chest', 'Chest trap', juggleChest)]},
  {emote: MOVE_EMOTE.WellPlayedOnMove, label: 'Well played on the move', icon: 'heart', emoji: '\u{1F44F}', seconds: 3.4, wire: 5, hitAt: -1, npcArm: 5, npcSlow: 1, npcNod: 1, npcBubble: 5,
    variants: [V('clap', 'Jogging applause', wellClap), V('thumbs', 'Double thumbs-up', wellThumbs), V('point-tap', 'Point and tap', wellPointTap)]},
  {emote: MOVE_EMOTE.LaughOnMove, label: 'Laugh on the move', icon: 'smile', emoji: '\u{1F602}', seconds: 3.2, wire: 7, hitAt: -1, npcArm: 5, npcSlow: 1, npcNod: 1, npcBubble: 7,
    variants: [V('belly', 'Belly laugh', laughBelly), V('head-back', 'Head-back roar', laughHeadBack), V('point', 'Point and laugh', laughPoint)]},
  {emote: MOVE_EMOTE.ThanksOnMove, label: 'Thanks on the move', icon: 'thanks', emoji: '\u{1F64F}', seconds: 3.2, wire: 9, hitAt: -1, npcArm: 0, npcSlow: 1, npcNod: 1, npcBubble: 9,
    variants: [V('heart', 'Hand on heart', thanksHeart), V('salute', 'Salute', thanksSalute), V('prayer', 'Prayer bow', thanksPrayer)]},
];
export const MOVE_VARIANT_COUNT = 3;
export const moveScriptFor = (e: number): MoveScript | undefined => MOVE_SCRIPTS.find(s => s.emote === e);
export const MOVE_EMOTE_EMOJI: Record<number, string> = Object.fromEntries(MOVE_SCRIPTS.map(s => [s.emote, s.emoji]));
/** The standing wheel's order by wire value (lib/town/emoteReact.ts LOCAL_EMOTES): Wave, High five, Cheer, Pass it, Juggle, Well played, Laugh, Dance, Thanks, Show off. */
const WHEEL_WIRE_ORDER = [0, 2, 1, 6, 3, 5, 7, 8, 9, 4] as const;
/** The wheel while you walk / run: all ten moving emotes in the standing wheel's order, Wave on the move first. */
export const moveWheel = () => WHEEL_WIRE_ORDER.map(w => MOVE_SCRIPTS.find(s => s.wire === w)!).map(s => ({emote: s.emote as number, icon: s.icon, label: s.label}));
/** Analytics variant index (countIds.ts EMOTE_VARIANT_COUNTS.move): emote order × 3 + variant. */
export const moveVariantIndex = (emote: number, v: number): number => { const i = MOVE_SCRIPTS.findIndex(s => s.emote === emote); return i < 0 ? -1 : i * MOVE_VARIANT_COUNT + v; };

/** Rest for the overlay: every channel 0, both arms NaN (the walk swing keeps them). */
export function moveRest(o: O): O { for (let i = 0; i < BODY_CH; i++) o[i] = 0; free(o, true); free(o, false); return o; }
/** The overlay of `emote` variant `v` at `age` s, into `out` (BODY_CH numbers; NaN arms = untouched). */
export function sampleMovePose(emote: number, v: number, age: number, out: O): O {
  moveRest(out);
  const s = moveScriptFor(emote); if (!s) return out;
  const d = s.variants[((v % s.variants.length) + s.variants.length) % s.variants.length];
  d.pose(Math.max(0, Math.min(s.seconds, age)), out);
  return out;
}
/** The overlay's weight at `age` s: eases in over .25 s and out toward `end` (the script length, or sooner when you stopped). */
export const moveWeight = (age: number, end: number): number => cl(Math.min(age / .25, (end - age) / .35));
/** The emote's end time after a frame at `speed` m/s: stopping shortens it to MOVE_STOP_FADE from now (never lengthens it). */
export const moveEndAfter = (age: number, end: number, speed: number): number => speed < MOVE_STOPPED ? Math.min(end, age + MOVE_STOP_FADE) : end;

// ------------------------------------------------------------------------------------------------------------------- bags + rules
/** A FRIEND'S moving emote end time (remoteAvatars.ts), the same rule as yours: their streamed speed below MOVE_STOPPED shortens it to
 *  MOVE_STOP_FADE from now (moveEndAfter); off their feet (`onFoot` false: a ride, flying, swimming) it ends now (moveEmoteStop). */
export const friendMoveEnd = (age: number, end: number, speed: number, onFoot: boolean): number => onFoot ? moveEndAfter(age, end, speed) : Math.min(end, age);
export interface MoveBag {order: Uint8Array; pos: number; last: number}
export const createMoveBag = (): MoveBag => ({order: Uint8Array.from([0, 1, 2]), pos: 3, last: -1});
/** Shuffled bag of three: all three before any repeat, and a new bag never starts with the last one. */
export function nextMoveVariant(rand: () => number, bag: MoveBag): number {
  const o = bag.order, n = o.length;
  if (bag.pos >= n) {
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)) % (i + 1); const t = o[i]; o[i] = o[j]; o[j] = t; }
    if (o[0] === bag.last) { const j = 1 + Math.min(n - 2, Math.floor(rand() * (n - 1))); const t = o[0]; o[0] = o[j]; o[j] = t; }
    bag.pos = 0;
  }
  const v = o[bag.pos++]; bag.last = v; return v;
}
/** You and a friend draw from separate bags (the wire only carries the emote). */
export const MOVE_ROLE = {Self: 0, Friend: 1} as const;
const bags: Record<number, MoveBag[]> = Object.fromEntries(MOVE_SCRIPTS.map(s => [s.emote, [createMoveBag(), createMoveBag()]]));
export function pickMoveVariant(emote: number, role: number, rand: () => number = Math.random): number {
  const b = bags[emote]; return b ? nextMoveVariant(rand, b[role === MOVE_ROLE.Self ? 0 : 1]) : 0;
}

/** The wheel flips to the moving set on foot above MOVE_WHEEL_ON and back below MOVE_WHEEL_OFF (`was` = it shows the moving set now). */
export function moveWheelOn(was: boolean, s: {speed: number; ride: string; flying: boolean; swimming: boolean; inJob?: boolean}): boolean {
  if (s.ride !== 'walk' || s.flying || s.swimming || s.inJob) return false;
  return s.speed > (was ? MOVE_WHEEL_OFF : MOVE_WHEEL_ON);
}
/** Why a running moving emote must end now ('' = keep playing). Moving and stopping never end it (stopping only shortens it, moveEndAfter). */
export function moveEmoteStop(s: {age: number; end: number; ride: string; flying: boolean; swimming: boolean; inJob: boolean; lesson: boolean; menuOpen: boolean; room: boolean}): string {
  if (s.menuOpen) return 'menu';
  if (s.room) return 'room';
  if (s.ride !== 'walk') return 'ride';
  if (s.flying) return 'fly';
  if (s.swimming) return 'swim';
  if (s.inJob) return 'job';
  if (s.lesson) return 'lesson';
  return s.age >= s.end ? 'done' : '';
}
/** Which moving emote a friend's avatar plays for the protocol value `wire`: only when the SENDER'S mode is Walk / Run and they are moving (else the standing emote). */
export function moveForWire(wire: number, mode: number, speed: number): MoveScript | undefined {
  if ((mode !== WIRE_WALK && mode !== WIRE_RUN) || speed <= MOVE_STOPPED) return undefined;
  return MOVE_SCRIPTS.find(s => s.wire === wire);
}

/** A townsperson's answer while you pass (it keeps its route): the arm pose, its weight, the speed factor, a nod and a head turn toward you (0..1). */
export interface MoveAnswer {emote: number; seconds: number; arm: number; slow: number; nod: number; seated: boolean}
export interface MoveAnswerOut {slow: number; arm: number; armW: number; nod: number; look: number}
/** The answer for your emote; a seated townsperson only turns its head and waves a little (no stand-up, no slow-down). */
export function moveAnswerFor(emote: number, seated: boolean): MoveAnswer | null {
  const s = moveScriptFor(emote); if (!s) return null;
  return seated ? {emote, seconds: Math.min(2.6, s.seconds), arm: 0, slow: 1, nod: 0, seated: true} : {emote, seconds: s.seconds, arm: s.npcArm, slow: s.npcSlow, nod: s.npcNod, seated: false};
}
export function moveAnswerAt(a: MoveAnswer, age: number, out: MoveAnswerOut): MoveAnswerOut {
  const ramp = cl(Math.min(age / .3, (a.seconds - age) / .35));
  out.look = ramp; out.arm = a.arm; out.nod = a.nod * ramp * abs(sin(age * 6));
  out.armW = cl(Math.min((age - .25) / .25, (a.seconds - .2 - age) / .3)) * (a.seated ? .6 : 1);
  out.slow = 1 + (a.slow - 1) * (a.slow < 1 ? cl(Math.min(age / .3, (2 - age) / .5)) : 0); // the run-by five: a brief slow-down, then its own pace again
  return out;
}
