// Dance (user, Oct 22 2026: "many of them look similar here they are standing and just waving their arms ... make them all very
// different and not look static and the same"). Ten whole-body dances, each about 4 s with its own signature, played from a shuffled bag
// (never the same twice in a row). A townsperson dancing along takes the NEXT dance from the same bag, so it always differs from yours.
//
// Pure data + math: no three.js, no DOM, no allocation per frame. A pose is BODY_CHANNELS numbers (see the channel list below); the
// writer (lib/graphics/dancePose.ts) puts them on the rig right after `rig.update`. Every move happens IN PLACE: the hips glide at most
// ~0.8 m from where the emote started and the highest point stays far below EMOTE_BOUNDS.maxHeight (tests/emote-dance-show.cjs).
//
// Channels (rig conventions: shoulder / hip x < 0 swings the limb forward / up; SZ / HZ > 0 lifts it OUT to the side (the writer mirrors
// the left side); elbow < 0 and knee > 0 bend; ankle > 0 points the toe; torso / head x > 0 leans / nods forward; pelvis PP < 0 tips back):
//   SPIN (rad, the whole body turns; written modulo a full turn) | HOP (m, hips up off the grounded height) | GX, GZ (m, hips glide
//   sideways / forward) | PY, PR, PP (pelvis twist / hip roll / pitch) | TX, TY, TZ (torso) | HX, HY, HZ (head) |
//   left arm SX SZ EL | right arm SX SZ EL | left leg HX HZ KN | right leg HX HZ KN | left / right ankle.
export const SPIN = 0, HOP = 1, GX = 2, GZ = 3, PY = 4, PR = 5, PP = 6, TX = 7, TY = 8, TZ = 9, HX = 10, HY = 11, HZ = 12,
  LSX = 13, LSZ = 14, LEL = 15, RSX = 16, RSZ = 17, REL = 18, LHX = 19, LHZ = 20, LKN = 21, RHX = 22, RHZ = 23, RKN = 24, LAN = 25, RAN = 26;
export const BODY_CHANNELS = 27;
export type Pose = Float32Array;
/** Standing still: arms hanging, knees soft. Every variant starts from this and fades back to the rig's own pose. */
export const NEUTRAL: readonly number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, .05, .12, -.1, .05, .12, -.1, 0, .02, .05, 0, .02, .05, 0, 0];
export const DANCE_SECONDS = 4;

// ---- leg geometry (lib/graphics/player.ts): thigh .43, shin .40, ankle to sole ~.08, kneecap ~.06. The writer grounds the lowest
// foot (or knee, for a kneel) so crouches, lunges and knee slides keep a foot on the floor without an IK pass.
export const THIGH = .43, SHIN = .40, SOLE = .08, KNEECAP = .06;
/** How far below the hip the lowest foot / knee reaches for this pose (m, at leg scale 1). */
export function legReach(o: ArrayLike<number>): number {
  let best = 0;
  for (let s = 0; s < 2; s++) {
    const hx = o[s ? RHX : LHX], hz = o[s ? RHZ : LHZ], kn = o[s ? RKN : LKN], cz = Math.cos(hz);
    const knee = THIGH * Math.cos(hx) * cz, foot = knee + (SHIN + SOLE) * Math.cos(hx + kn) * cz;
    if (knee + KNEECAP > best) best = knee + KNEECAP;
    if (foot > best) best = foot;
  }
  return best;
}
export const STAND_REACH = legReach(NEUTRAL);
/** Hips up (m) for a pose: grounded on the lowest foot / knee, plus the hop; in the air (a big hop) the tucked legs no longer pull the hips down. */
export function pelvisLift(o: ArrayLike<number>, legScale = 1): number {
  const air = o[HOP] / .3, g = air >= 1 ? 0 : 1 - (air < 0 ? 0 : air);
  return (legReach(o) - STAND_REACH) * legScale * g + o[HOP];
}

// ---- tiny shaping helpers (scalar, no allocation)
export const clamp01 = (v: number) => v < 0 ? 0 : v > 1 ? 1 : v;
export const ease = (v: number) => { const t = clamp01(v); return t * t * (3 - 2 * t); };
/** 0 before a, 1 after b, eased between. */
export const win = (t: number, a: number, b: number) => ease((t - a) / (b - a));
/** 0 outside [a, d], 1 inside [b, c], eased ramps between. */
export const band = (t: number, a: number, b: number, c: number, d: number) => win(t, a, b) * (1 - win(t, c, d));
/** A single smooth bump over [a, b] (0 -> 1 -> 0). */
export const bump = (t: number, a: number, b: number) => t <= a || t >= b ? 0 : Math.sin(Math.PI * (t - a) / (b - a));
/** A ballistic hop of height h over [a, b]. */
export const hop = (t: number, a: number, b: number, h: number) => { if (t <= a || t >= b) return 0; const u = (t - a) / (b - a); return 4 * h * u * (1 - u); };
const TAU = Math.PI * 2;
/** A groove bounce 0..1 on a beat (`hz` beats a second, the low point on the beat). */
export const groove = (t: number, hz: number) => .5 - .5 * Math.cos(TAU * hz * t);
/** Linear blend of channel `c` toward `v` by `w`. */
export const to = (o: Pose, c: number, v: number, w: number) => { o[c] += (v - o[c]) * w; };
/** Blend one arm (side -1 left, 1 right) toward shoulder-x / shoulder-z (out) / elbow by `w`. */
export function arm(o: Pose, side: number, sx: number, sz: number, el: number, w = 1) {
  const b = side < 0 ? LSX : RSX; o[b] += (sx - o[b]) * w; o[b + 1] += (sz - o[b + 1]) * w; o[b + 2] += (el - o[b + 2]) * w;
}
/** Blend one leg toward hip-x / hip-z (out) / knee / ankle by `w`. */
export function leg(o: Pose, side: number, hx: number, hz: number, kn: number, an = 0, w = 1) {
  const b = side < 0 ? LHX : RHX; o[b] += (hx - o[b]) * w; o[b + 1] += (hz - o[b + 1]) * w; o[b + 2] += (kn - o[b + 2]) * w;
  const a = side < 0 ? LAN : RAN; o[a] += (an - o[a]) * w;
}
/** Soft knees: both legs bend by `d` (0..1 ~ a deep groove), hips slightly forward so the body sinks straight down. */
export function sink(o: Pose, d: number) { o[LKN] += 1.4 * d; o[RKN] += 1.4 * d; o[LHX] -= .7 * d; o[RHX] -= .7 * d; o[LAN] -= .1 * d; o[RAN] -= .1 * d; o[TX] += .15 * d; }
/** Arm presets (shoulder-x, shoulder-z out, elbow). */
export const A = {
  down: [.05, .12, -.1], up: [-2.9, .25, -.1], vee: [-2.6, .75, -.1], out: [-.1, 1.45, -.1], fwd: [-1.5, .08, -.08], hip: [-.25, .95, -1.95],
  head: [-2.5, .95, -2.4], chest: [-1.25, -.45, -1.9], flex: [-.2, 1.45, -2.2], pump: [-.6, .2, -1.7], back: [.9, .25, -.2], point: [-2.55, .2, -.02],
} as const;
type ArmP = readonly number[];
export const armP = (o: Pose, side: number, p: ArmP, w = 1) => arm(o, side, p[0], p[1], p[2], w);
/** Blend both arms toward presets. */
export const arms = (o: Pose, l: ArmP, r: ArmP, w = 1) => { armP(o, -1, l, w); armP(o, 1, r, w); };
/** Snap-hold timing for "robot" moves: 0 until `start`, then a fast linear snap over `dur` with a tiny mechanical overshoot. */
const snap = (t: number, start: number, dur: number) => { const u = (t - start) / dur; return u <= 0 ? 0 : u >= 1 ? 1 + .06 * Math.max(0, Math.sin((u - 1) * 18)) * Math.exp(-(u - 1) * 6) : u; };

export interface BodyMove { id: string; name: string; seconds: number; pose: (t: number, o: Pose) => void }

// ---------------------------------------------------------------------------------------------------------------- the ten dances
const floss: BodyMove = {id: 'floss', name: 'The floss', seconds: 4, pose(t, o) {
  const on = band(t, .1, .45, 3.25, 3.55), th = TAU * 1.5 * t, a = Math.sin(th);
  // straight arms swing to one side while the hips swing to the other; the crossing arm passes in front, then behind
  const swing = a * on, fb = -.5 * Math.cos(th) * on;
  arm(o, 1, .05 + fb, .15 + 1.0 * swing, -.05, on); arm(o, -1, .05 + fb, .15 - 1.0 * swing, -.05, on);
  o[GX] = -.16 * swing; o[PR] = -.28 * swing; o[TZ] = .14 * swing; o[PY] = .12 * swing; o[HY] = .18 * swing; o[HZ] = -.1 * swing;
  sink(o, (.25 + .2 * groove(t, 3)) * on);
  // finish: hop into arms-up "ta-da"
  const f = win(t, 3.3, 3.55); arms(o, A.vee, A.vee, f); o[HOP] = hop(t, 3.28, 3.62, .22); o[HX] -= .25 * f; o[TX] -= .12 * f;
}};
const ROBOT: readonly (readonly number[])[] = [ // [l sx, sz, el, r sx, sz, el, torso yaw, head yaw, head pitch, knee lift side, sink, glide x]
  [0, .2, -1.57, 0, .2, -1.57, 0, 0, 0, 0, .1, 0],
  [0, .2, -1.57, -1.57, .1, -1.57, .5, -.6, 0, 0, .1, .12],
  [0, 1.5, -1.57, 0, .2, -1.57, -.5, .7, 0, 1, .15, .12],
  [-1.57, .1, -1.57, -1.57, .1, -1.57, 0, 0, .35, 0, .45, 0],
  [-2.95, .1, 0, 0, .2, -1.57, .55, -.5, -.2, -1, .1, -.12],
  [0, 1.5, -1.57, 0, 1.5, -1.57, 0, .6, 0, 0, .25, -.12],
  [0, .2, -1.57, -2.95, .1, 0, -.55, .5, -.2, 1, .1, 0],
  [0, 1.5, -.05, 0, 1.5, -.05, 0, 0, 0, 0, .2, 0],
];
const lr = (q: readonly number[], p: readonly number[], k: number, s: number) => q[k] + (p[k] - q[k]) * s;
const robot: BodyMove = {id: 'robot', name: 'The robot', seconds: 4, pose(t, o) {
  const beat = .42, i = Math.min(ROBOT.length - 1, Math.max(0, Math.floor((t - .15) / beat))), p = ROBOT[i], q = ROBOT[Math.max(0, i - 1)];
  const s = Math.min(1.06, snap(t, .15 + i * beat, .11)), on = band(t, 0, .2, 3.75, 3.95);
  arm(o, -1, lr(q, p, 0, s), lr(q, p, 1, s), lr(q, p, 2, s), on); arm(o, 1, lr(q, p, 3, s), lr(q, p, 4, s), lr(q, p, 5, s), on);
  o[TY] = lr(q, p, 6, s) * on; o[HY] = lr(q, p, 7, s) * on; o[HX] = lr(q, p, 8, s) * on; o[GX] = lr(q, p, 11, s) * on;
  sink(o, lr(q, p, 10, s) * on);
  const lift = p[9] * (s > 1 ? 1 : s) * (1 - win(t, .15 + (i + .8) * beat, .15 + (i + 1) * beat));
  if (lift > 0) leg(o, 1, -1.0, .05, 1.5, .1, lift * on); else if (lift < 0) leg(o, -1, -1.0, .05, 1.5, .1, -lift * on);
  // power-down at the end: the robot runs out of battery and droops, then reboots upright
  const d = band(t, 3.45, 3.6, 3.8, 3.95);
  o[TX] += .55 * d; o[HX] += .5 * d; arm(o, -1, .2, .1, -.05, d); arm(o, 1, .2, .1, -.05, d); sink(o, .35 * d);
}};
const runningMan: BodyMove = {id: 'running-man', name: 'Running man', seconds: 4, pose(t, o) {
  const on = band(t, .05, .35, 3.2, 3.45), ph = (t * 2.4) % 2, side = ph < 1 ? 1 : -1, u = ph % 1;
  // the lifted knee comes up high while the standing foot slides back; then they swap
  const up = Math.sin(Math.PI * u), slide = u;
  leg(o, side, -1.25 * up + .1, .03, 1.7 * up + .1, .3 * up, on);
  leg(o, -side, .45 * slide - .15, .03, .25 + .25 * slide, .4 * slide, on);
  o[HOP] = .1 * up * on; o[TX] = .22 * on; o[GZ] = .06 * Math.sin(TAU * 1.2 * t) * on;
  arm(o, side, -.85 * up - .1, .25, -1.7, on); arm(o, -side, .45 * up, .25, -1.5, on);
  o[HX] = (.12 - .2 * up) * on; o[HY] = .15 * side * on; o[TY] = .18 * side * up * on;
  // finish: a cocky lean back, arms crossed, one knee popped
  const f = win(t, 3.25, 3.55); armP(o, -1, A.chest, f); arm(o, 1, -1.25, -.55, -2.0, f); o[TX] -= .35 * f; o[HX] -= .15 * f; leg(o, 1, -.25, .1, .55, .2, f); o[HZ] += .15 * f;
}};
const moonwalk: BodyMove = {id: 'moonwalk', name: 'Moonwalk', seconds: 4, pose(t, o) {
  const on = band(t, .05, .3, 3.7, 3.95), glide = band(t, .2, 2.45, 2.5, 3.35);
  o[GZ] = -.72 * glide; // glides back, then spins forward to the start
  const step = (t * 2.6) % 2, side = step < 1 ? 1 : -1, heel = Math.sin(Math.PI * (step % 1)) * band(t, .2, .4, 2.3, 2.5);
  leg(o, side, -.3, .03, .95, .9, heel); leg(o, -side, .12, .03, .08, 0, heel); // one heel up, the other foot slides flat
  o[TX] += .18 * on; o[HX] = .1 * Math.sin(TAU * 1.3 * t) * on; o[PR] = .06 * side * heel;
  arm(o, -1, -.3 + .25 * Math.sin(TAU * 1.3 * t), .35, -1.3, on); arm(o, 1, -.3 - .25 * Math.sin(TAU * 1.3 * t), .35, -1.3, on);
  // the spin on the toes, arms tucked, then the toe stand with a hand on the hat
  const sp = win(t, 2.5, 3.2); o[SPIN] = TAU * sp;
  const spinOn = band(t, 2.45, 2.55, 3.15, 3.3); armP(o, -1, A.chest, spinOn); arm(o, 1, -1.1, -.3, -1.9, spinOn); leg(o, -1, 0, .0, .15, .7, spinOn); leg(o, 1, -.5, -.15, 1.3, .7, spinOn);
  const f = win(t, 3.2, 3.4); leg(o, -1, 0, -.02, .05, .85, f); leg(o, 1, 0, -.02, .05, .85, f); o[HOP] += .05 * f;
  arm(o, 1, -2.5, .5, -2.3, f); arm(o, -1, .15, .45, -.1, f); o[HZ] += .25 * f; o[TX] -= .12 * f;
}};
const disco: BodyMove = {id: 'disco', name: 'Disco point', seconds: 4, pose(t, o) {
  const on = band(t, .05, .3, 3.75, 3.95), b = Math.floor(t / .5), u = (t % .5) / .5, up = (b % 2) === 0;
  const hand = t < 2 ? 1 : -1, pop = Math.sin(Math.PI * Math.min(1, u * 2.2));
  // step-touch side to side, a hip pop on every beat
  const dir = up ? 1 : -1; o[GX] = .14 * dir * ease(u * 2) * on; o[PR] = .18 * dir * hand * pop * on; o[TZ] = -.12 * dir * pop * on;
  leg(o, -dir, -.15, .32, .45, .5, pop * on);
  // the pointing hand: up and across, then down to the other hip
  const reach = up ? ease(u * 3) : 1 - ease(u * 3);
  arm(o, hand, -2.65 * reach + .35 * (1 - reach), .9 * reach + .5 * (1 - reach) - .55 * reach, -.02, on);
  armP(o, -hand, A.hip, on);
  o[HY] = -.45 * hand * reach * on; o[HX] = (-.4 * reach + .2 * (1 - reach)) * on; sink(o, (.2 + .15 * pop) * on);
  const f = win(t, 3.45, 3.65); arm(o, 1, -2.6, -.45, -.02, f); armP(o, -1, A.hip, f); o[PR] += .2 * f; o[HY] += .4 * f; o[HX] -= .3 * f;
}};
const spinDip: BodyMove = {id: 'spin-dip', name: 'Spin and dip', seconds: 4, pose(t, o) {
  const sway = band(t, .05, .3, 1.15, 1.35), s = Math.sin(TAU * 1.25 * t);
  o[GX] = .13 * s * sway; o[TZ] = -.15 * s * sway; o[PR] = .1 * s * sway; arm(o, -1, -.4 - .3 * s, .5, -.6, sway); arm(o, 1, -.4 + .3 * s, .5, -.6, sway);
  sink(o, .25 * sway); leg(o, s > 0 ? -1 : 1, -.1, .3, .3, .4, Math.abs(s) * sway);
  const crouch = band(t, 1.15, 1.35, 1.4, 1.55); sink(o, .5 * crouch); arms(o, A.chest, A.chest, crouch);
  // a full spin, arms flung out, one leg lifted
  const sp = win(t, 1.35, 2.25); o[SPIN] = TAU * sp; const spinOn = band(t, 1.35, 1.5, 2.15, 2.3);
  arm(o, -1, -.25, 1.4, -.1, spinOn); arm(o, 1, -.25, 1.4, -.1, spinOn); leg(o, 1, -.5, .45, .9, .6, spinOn); o[HOP] = hop(t, 1.4, 2.2, .08);
  // the dip: lean right back, one leg forward, one arm high
  const dip = band(t, 2.25, 2.55, 3.3, 3.6);
  o[TX] -= .6 * dip; o[HX] -= .35 * dip; leg(o, -1, -.75, .05, .12, -.2, dip); leg(o, 1, .3, .05, 1.25, .2, dip);
  arm(o, 1, -2.75, .8, -.1, dip); arm(o, -1, -.9, .5, -1.4, dip); o[GZ] = -.12 * dip;
  const f = win(t, 3.45, 3.75); arms(o, A.vee, A.vee, f); o[HOP] += hop(t, 3.5, 3.85, .15);
}};
const bumpAt = (pos: number, x: number) => Math.max(0, 1 - Math.abs(pos * 6 - x) / 1.2);
const hipHop: BodyMove = {id: 'hiphop-wave', name: 'Hip-hop bounce and arm wave', seconds: 4, pose(t, o) {
  const on = band(t, .05, .3, 3.7, 3.95), g = groove(t, 2);
  sink(o, (.45 + .35 * g) * on); o[TX] += (.12 + .15 * g) * on; o[HX] = (.25 * g - .05) * on; o[TY] = .12 * Math.sin(TAU * t) * on;
  // the arm wave: a bump travels hand -> elbow -> shoulder -> chest -> other shoulder -> elbow -> hand, then back
  const wv = band(t, .35, .55, 2.45, 2.65), pos = t < 1.5 ? (t - .45) / .9 : 1 - (t - 1.5) / .9;
  arm(o, -1, -.1, 1.45 + .45 * bumpAt(pos, 1), -.1 - 1.1 * bumpAt(pos, 0), wv); arm(o, 1, -.1, 1.45 + .45 * bumpAt(pos, 5), -.1 - 1.1 * bumpAt(pos, 6), wv);
  o[TZ] += .2 * (bumpAt(pos, 2) - bumpAt(pos, 4)) * wv; o[HZ] += .25 * (bumpAt(pos, 2.5) - bumpAt(pos, 3.5)) * wv;
  // then a body roll: chest pushes forward, hips follow
  const roll = band(t, 2.55, 2.7, 3.35, 3.5), r = Math.sin(TAU * 1.6 * (t - 2.55));
  o[TX] += .3 * r * roll; o[GZ] = .08 * Math.sin(TAU * 1.6 * (t - 2.55) - 1.2) * roll; o[PP] = -.08 * r * roll; arms(o, A.pump, A.pump, roll);
  const f = win(t, 3.4, 3.6); armP(o, -1, A.chest, f); arm(o, 1, -1.25, -.55, -2.0, f); o[TX] -= .4 * f; o[HZ] += .2 * f; leg(o, -1, -.3, .25, .5, .3, f);
}};
const MAC: readonly (readonly number[])[] = [ // the ten macarena hand moves: [side, sx, sz, el]
  [1, -1.5, .05, -.05], [-1, -1.5, .05, -.05], [1, -1.62, .1, -.3], [-1, -1.62, .1, -.3], [1, -1.3, -.75, -1.7], [-1, -1.3, -.75, -1.7],
  [1, -2.6, .95, -2.35], [-1, -2.6, .95, -2.35], [1, -.35, -.35, -1.6], [-1, -.35, -.35, -1.6],
];
const macarena: BodyMove = {id: 'macarena', name: 'Macarena', seconds: 4, pose(t, o) {
  const on = band(t, .05, .25, 3.7, 3.95), beat = .26;
  for (let i = 0; i < MAC.length; i++) { const m = MAC[i], w = win(t, .12 + i * beat, .12 + i * beat + .14) * (1 - win(t, 2.85, 3.0)); if (w > 0) arm(o, m[0], m[1], m[2], m[3], w); }
  const b = groove(t, 1 / beat / 2); o[PR] = .14 * Math.sin(TAU * t / beat / 2) * on; o[GX] = .05 * Math.sin(TAU * t / beat / 2) * on; sink(o, (.15 + .12 * b) * on); { const bi = Math.floor(t / beat), pop = Math.sin(Math.PI * ((t % beat) / beat)); leg(o, bi % 2 ? 1 : -1, -.3, .12, .75, .35, pop * on * (1 - win(t, 2.75, 2.9))); }
  o[HY] = .2 * Math.sin(TAU * t / beat / 4) * on;
  // hip circles with the hands on the hips, then the jump turn and the jump back: "hey!"
  const hc = band(t, 2.8, 2.95, 3.05, 3.15); arms(o, A.hip, A.hip, hc); o[PR] += .15 * Math.sin(TAU * 3 * t) * hc; o[GZ] = .07 * Math.cos(TAU * 3 * t) * hc;
  o[SPIN] = (Math.PI / 2) * band(t, 3.1, 3.35, 3.5, 3.75); o[HOP] = hop(t, 3.08, 3.38, .2) + hop(t, 3.48, 3.78, .2);
  const hey = band(t, 3.1, 3.2, 3.75, 3.9); arms(o, A.vee, A.vee, hey);
}};
const jumpKicks: BodyMove = {id: 'jump-kicks', name: 'Jumpstyle kicks', seconds: 4, pose(t, o) {
  const on = band(t, .05, .25, 3.2, 3.35), per = .5, i = Math.floor(t / per), u = (t % per) / per, side = i % 2 ? 1 : -1;
  // a hop on every beat, one leg kicks forward and the other back; the middle kicks go out to the side
  const k = Math.sin(Math.PI * u), sideKick = i === 3 || i === 4;
  o[HOP] = .2 * k * on;
  if (sideKick) { leg(o, side, -.2, .8 * k, .1, .4, on); leg(o, -side, 0, -.05, .25, .2, on); o[TZ] = -.2 * side * k * on; }
  else { leg(o, side, -1.05 * k, .03, .15, .5 * k, on); leg(o, -side, .45 * k, .03, .6 * k, .3, on); o[TX] = -.15 * k * on; }
  arm(o, side, .6 * k, .3, -.7, on); arm(o, -side, -1.3 * k, .3, -1.0, on); o[HX] = -.1 * k * on;
  // the star jump finish
  const s = band(t, 3.25, 3.45, 3.6, 3.75); o[HOP] += hop(t, 3.25, 3.75, .35);
  arm(o, -1, -2.4, 1.1, -.05, s); arm(o, 1, -2.4, 1.1, -.05, s); leg(o, -1, 0, .5, .05, .6, s); leg(o, 1, 0, .5, .05, .6, s); o[HX] -= .3 * s;
  const land = band(t, 3.75, 3.85, 3.9, 4); sink(o, .4 * land);
}};
const wiggle: BodyMove = {id: 'wiggle-worm', name: 'Wiggle worm', seconds: 4, pose(t, o) {
  const on = band(t, .05, .3, 3.3, 3.5), w = TAU * 1.6 * t;
  // an S-curve rolls up through the body: hips, then chest, then head
  o[PR] = .18 * Math.sin(w) * on; o[TZ] = -.28 * Math.sin(w - .9) * on; o[HZ] = .2 * Math.sin(w - 1.8) * on; o[GX] = .1 * Math.sin(w + .6) * on;
  const s = Math.sin(w) > 0 ? 1 : -1; leg(o, s, -.35, -.18, .65, .4, Math.abs(Math.sin(w)) * on); // knock-kneed wiggle
  arm(o, -1, -.1 + .25 * Math.sin(w - 1.2), 1.25 + .3 * Math.sin(w - .6), -.5 - .5 * Math.sin(w - 1.8), on);
  arm(o, 1, -.1 + .25 * Math.sin(w + 1.2), 1.25 - .3 * Math.sin(w - .6), -.5 + .5 * Math.sin(w - 1.8), on);
  // shimmy down low, shoulders shaking, then wiggle back up
  const low = band(t, 1.5, 1.9, 2.5, 2.95); sink(o, (.25 + .7 * low) * on); o[TY] = .22 * Math.sin(TAU * 5 * t) * low;
  const f = win(t, 3.3, 3.55); arm(o, -1, -2.6, .5 + .25 * Math.sin(TAU * 3 * t), -.6 * Math.sin(TAU * 3 * t + 1), f); arm(o, 1, -2.6, .5 - .25 * Math.sin(TAU * 3 * t), -.6 * Math.sin(TAU * 3 * t), f);
  o[HOP] += hop(t, 3.3, 3.62, .18); o[PR] += .15 * Math.sin(TAU * 3 * t) * f;
}};
export const DANCES: readonly BodyMove[] = [floss, robot, runningMan, moonwalk, disco, spinDip, hipHop, macarena, jumpKicks, wiggle];
export const DANCE_COUNT = DANCES.length;

/** Writes move `m` at `t` seconds into `out` (BODY_CHANNELS numbers): the neutral pose, then the move. */
export function sampleMove(m: BodyMove, t: number, out: Pose): Pose {
  for (let i = 0; i < BODY_CHANNELS; i++) out[i] = NEUTRAL[i];
  m.pose(Math.max(0, Math.min(m.seconds, t)), out);
  return out;
}

// ---- shuffled bags (like the high-five bag): every move once before any repeats, never the same twice in a row. In place, no allocation.
export interface MoveBag { order: Uint8Array; pos: number; last: number }
export function createMoveBag(n: number): MoveBag { const order = new Uint8Array(n); for (let i = 0; i < n; i++) order[i] = i; return {order, pos: n, last: -1}; }
export function nextMove(rand: () => number, bag: MoveBag): number {
  const o = bag.order, n = o.length;
  if (bag.pos >= n) {
    for (let i = n - 1; i > 0; i--) { const j = Math.min(i, Math.floor(rand() * (i + 1))); const t = o[i]; o[i] = o[j]; o[j] = t; }
    if (n > 1 && o[0] === bag.last) { const j = 1 + Math.min(n - 2, Math.floor(rand() * (n - 1))); const t = o[0]; o[0] = o[j]; o[j] = t; }
    bag.pos = 0;
  }
  const v = o[bag.pos++]; bag.last = v; return v;
}
