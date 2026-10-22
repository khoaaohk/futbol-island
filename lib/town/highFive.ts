// High five variations (user, Oct 22 2026: "the high five emote only waves, it needs to do an actual high five sequence ... ten
// variations, randomized"). Pure data + tiny helpers; no three.js, no DOM, no allocation after module load.
//
// Every variation is TWO keyframed halves on ONE clock: the player's (half 0) and the townsperson's (half 1). Both halves reach
// the same hit times (`hits`), where the pooled spark ring pops between the two characters' hands. A friend's screen plays the
// player half alone (an "air five"). Row layout (HF_STRIDE numbers per key, times ascending, seconds):
//   t | A arm: shoulder-x, shoulder-z, elbow | B arm: shoulder-x, shoulder-z, elbow | lean (chest pitch) | dy (m: hop +, crouch -) | spin (rad)
// Arm numbers are for the RIGHT arm of the rig (shoulder-x < 0 swings forward/up, shoulder-z lifts sideways, elbow < 0 bends);
// the writer (lib/graphics/highFivePose.ts) mirrors z for the left arm. A is the "five" arm, B the other one.
//
// Arcade reuse (user: "for the handshake, use the existing ones that are in the arcade"): the arcade crowd's rig-native `highFive` and
// `fistBump` skill poses (lib/graphics/skillMoves.ts, played by lib/arcade/arcadeSocial.ts) drive the arms in `segs` windows of
// variations 1, 3, 6 and 9 (same joint data; the partner plays the opposite side, as the arcade partner does). The keyed rows inside a
// window mirror that pose so the difference tests see it.
import {EMOTE} from './emoteReact';

export const HF_COUNT = 10, HF_STRIDE = 10;
type Arm = readonly [number, number, number];
const REST: Arm = [.05, .12, -.1], REST_B: Arm = [.05, .25, -.12], WIND: Arm = [.8, .8, -.3], UP: Arm = [-2.85, .3, -.2], HIT: Arm = [-2.6, .15, -.05],
  LOW: Arm = [-.9, .45, -.15], LOW_HIT: Arm = [-.7, .3, -.05], BACK: Arm = [1.2, .35, -.9], BACK_SWING: Arm = [1.5, .8, -.4], SIDE_HIT: Arm = [-1.25, .5, -.2],
  FIST_IN: Arm = [-1.3, .1, -1.6], SNAP: Arm = [-1.9, .2, -1.9], CLAP: Arm = [-1.4, .1, -1.1], HALF: Arm = [-1.6, .4, -.3],
  OUT: Arm = [-.3, 1.4, -.2], WAVE1: Arm = [-.3, 2.4, -.9], WAVE2: Arm = [-.3, 2.9, -.4], MISS: Arm = [-2.9, .2, -.05], DROP: Arm = [-.6, .4, -.5],
  // The arcade skill poses at their contact (skillMoves.ts highFive armS: sx -2.25 / el -.08; fistBump: sx -1.57 / el -.08).
  ARC_FIVE: Arm = [-2.25, .08, -.08], ARC_FIST: Arm = [-1.57, .06, -.08], ARC_WIND: Arm = [-.3, 0, -.7], ARC_OUT: Arm = [-1.4, .06, -.6];
const k = (t: number, a: Arm, b: Arm = REST_B, lean = 0, dy = 0, spin = 0): number[] => [t, a[0], a[1], a[2], b[0], b[1], b[2], lean, dy, spin];
const table = (rows: number[][]): Float32Array => Float32Array.from(rows.flat());

/** A window where the rig plays an arcade skill pose (`highFive` / `fistBump`) on `side` (the player's arm; the partner takes the other). */
export interface HfSeg { type: 'highFive' | 'fistBump'; t0: number; dur: number; side: 1 | -1 }
export interface HighFiveDef {
  id: string; name: string; duration: number;
  /** Contact times (s): the spark pops and, with a partner, the hands meet. Ascending, all inside the duration. */
  hits: readonly number[];
  /** Hand height at each hit as a fraction of the character's height (the spark sits there). */
  hitY: readonly number[];
  /** How the hands meet at each hit (palm / fist / two-palm, high / low / side / top), for readers and the difference tests. */
  contact: readonly string[];
  player: Float32Array; npc: Float32Array;
  /** Arcade skill windows (empty = keyframes only). */
  segs: readonly HfSeg[];
}
const def = (id: string, name: string, duration: number, hits: number[], hitY: number[], contact: string[], player: number[][], npc: number[][], segs: HfSeg[] = []): HighFiveDef =>
  ({id, name, duration, hits, hitY, contact, player: table(player), npc: table(npc), segs});

export const HIGH_FIVES: readonly HighFiveDef[] = [
  // 1 Classic: the arcade's own `highFive` (1.5 s, contact at 52 %).
  def('classic', 'Classic', 1.5, [.78], [1.1], ['palm-high'],
    [k(0, REST), k(.27, ARC_WIND, REST_B, -.05), k(.78, ARC_FIVE, REST_B, .08), k(1.1, [-2.1, .08, -.3], REST_B, .04), k(1.5, REST)],
    [k(0, REST), k(.4, HALF, REST_B, 0), k(.78, ARC_FIVE, REST_B, .05), k(1.1, [-2.1, .08, -.3], REST_B), k(1.5, REST)], [{type: 'highFive', t0: 0, dur: 1.5, side: 1}]),
  // 2 Low five: crouch, hand low and slap.
  def('low', 'Low five', 1.5, [.8], [.3], ['palm-low'],
    [k(0, REST), k(.3, [.4, .6, -.3], REST_B, .22, -.08), k(.6, LOW, REST_B, .3, -.12), k(.8, LOW_HIT, REST_B, .32, -.12), k(1.05, LOW, REST_B, .22, -.08), k(1.5, REST)],
    [k(0, REST), k(.35, [.2, .5, -.3], REST_B, .15, -.06), k(.65, LOW, REST_B, .25, -.12), k(.8, LOW_HIT, REST_B, .28, -.12), k(1.1, LOW, REST_B, .15, -.06), k(1.5, REST)]),
  // 3 Double high five: the arcade's `doubleFive` (a `highFive` on each side, at tempo .8).
  def('double', 'Double high five', 2.4, [.62, 1.82], [1.1, 1.1], ['palm-high-right', 'palm-high-left'],
    [k(0, REST, REST), k(.2, ARC_WIND, REST), k(.62, ARC_FIVE, REST, .06), k(1.0, REST, REST_B, 0), k(1.2, REST, ARC_WIND), k(1.82, REST, ARC_FIVE, .06), k(2.2, REST, [-2.1, .08, -.3], .02), k(2.4, REST, REST)],
    [k(0, REST, REST), k(.2, HALF, REST), k(.62, ARC_FIVE, REST, .05), k(1.0, REST, REST_B), k(1.2, REST, HALF), k(1.82, REST, ARC_FIVE, .05), k(2.4, REST, REST)],
    [{type: 'highFive', t0: 0, dur: 1.2, side: 1}, {type: 'highFive', t0: 1.2, dur: 1.2, side: -1}]),
  // 4 Jump five: hop with the hand up, slap at the top.
  def('jump', 'Jump five', 1.6, [.9], [1.4], ['palm-top'],
    [k(0, REST), k(.3, WIND, [.4, .6, -.3], .15, -.12), k(.6, UP, UP, .05, .3), k(.9, HIT, [-1.4, .8, -.3], .1, .5), k(1.15, UP, REST_B, 0, .12), k(1.3, REST, REST_B, .1, -.06), k(1.6, REST)],
    [k(0, REST), k(.3, HALF, REST_B, .1, -.1), k(.6, UP, UP, .05, .3), k(.9, HIT, [-1.4, .8, -.3], .1, .5), k(1.15, UP, REST_B, 0, .12), k(1.3, REST, REST_B, .1, -.06), k(1.6, REST)]),
  // 5 Spin five: a quick 360 with arms out, then the slap.
  def('spin', 'Spin five', 1.9, [1.45], [1.1], ['palm-high-after-spin'],
    [k(0, REST), k(.25, OUT, OUT, -.1, -.06, 0), k(1.15, OUT, OUT, .05, .04, 6.2832), k(1.3, UP, REST_B, .1, 0, 6.2832), k(1.45, HIT, REST_B, .15, 0, 6.2832), k(1.65, UP, REST_B, .05, 0, 6.2832), k(1.9, REST, REST_B, 0, 0, 6.2832)],
    [k(0, REST), k(.3, [-1.6, .5, -.4], [-1.6, .5, -.4], .05, .06), k(.6, [-1.4, .8, -.4], [-1.4, .8, -.4], 0, 0), k(.9, [-1.6, .5, -.4], [-1.6, .5, -.4], .05, .08), k(1.2, [-1.4, .8, -.4], REST_B, 0, 0), k(1.3, UP, REST_B, .05), k(1.45, HIT, REST_B, .1), k(1.7, UP, REST_B), k(1.9, REST)]),
  // 6 Slap then fist bump: a keyed slap, then the arcade's `fistBump` (1.35 s, contact at 50 %).
  def('fistbump', 'Slap then fist bump', 2.5, [.8, 1.73], [1.1, .6], ['palm-high', 'fist'],
    [k(0, REST), k(.3, WIND, REST_B, -.08), k(.55, UP, REST_B, .08), k(.8, HIT, REST_B, .15), k(1.05, ARC_OUT, REST_B, .04), k(1.3, FIST_IN, REST_B, .08, -.03), k(1.73, ARC_FIST, REST_B, .12, -.02), k(2.1, FIST_IN, REST_B, .04), k(2.5, REST)],
    [k(0, REST), k(.4, HALF, REST_B), k(.65, UP, REST_B, .05), k(.8, HIT, REST_B, .1), k(1.05, ARC_OUT, REST_B, .03), k(1.3, FIST_IN, REST_B, .05, -.03), k(1.73, ARC_FIST, REST_B, .08, -.02), k(2.1, FIST_IN, REST_B), k(2.5, REST)],
    [{type: 'fistBump', t0: 1.05, dur: 1.35, side: 1}]),
  // 7 Behind-the-back five: hand swung back behind the body, then round to a side slap.
  def('behind', 'Behind-the-back five', 1.7, [1.05], [.7], ['palm-side'],
    [k(0, REST), k(.3, BACK, REST_B, .08), k(.7, BACK_SWING, REST_B, .22, -.04), k(.9, [.2, .7, -.4], REST_B, .1), k(1.05, SIDE_HIT, REST_B, .05), k(1.3, SIDE_HIT, REST_B, 0), k(1.7, REST)],
    [k(0, REST), k(.45, [.4, 1.2, -.3], BACK, .1), k(.8, [-.9, 1.1, -.2], BACK, .18), k(1.05, [-1.25, .9, -.2], BACK, .22), k(1.35, [-1.0, 1.0, -.2], BACK, .12), k(1.7, REST)]),
  // 8 Up-top fake-out: hand up, pulled away ("too slow!"), then the slap.
  def('fakeout', 'Up-top fake-out', 2, [1.5], [1.1], ['palm-high-after-fake'],
    [k(0, REST), k(.3, UP, REST_B, .08), k(.7, UP, REST_B, .08), k(.9, DROP, REST_B, -.22, 0), k(1.15, DROP, [-.2, .5, -.3], -.2), k(1.3, WIND, REST_B, -.05), k(1.5, HIT, REST_B, .15), k(1.7, UP, REST_B, .05), k(2, REST)],
    [k(0, REST), k(.3, HALF, REST_B), k(.6, UP, REST_B, .05), k(.8, MISS, REST_B, .22, 0), k(.95, DROP, REST_B, .2, -.04), k(1.2, DROP, REST_B, .05), k(1.4, UP, REST_B, .05), k(1.5, HIT, REST_B, .1), k(1.7, UP, REST_B), k(2, REST)]),
  // 9 Secret handshake: arcade `highFive`, a keyed snap and clap, then the arcade `fistBump` on the other arm (tempos .63 / .63).
  def('secret', 'Secret handshake', 2.55, [.49, 2.075], [1.1, .6], ['palm-high', 'fist-left'],
    [k(0, REST), k(.2, ARC_WIND, REST_B, -.03), k(.49, ARC_FIVE, REST_B, .08), k(.95, FIST_IN, REST_B, .02), k(1.05, SNAP, REST_B, .08, .04), k(1.2, FIST_IN, REST_B), k(1.3, CLAP, CLAP, .2), k(1.45, [-1.6, .5, -.6], [-1.6, .5, -.6], .16), k(1.55, CLAP, CLAP, .2), k(1.65, REST, ARC_OUT), k(2.075, REST, ARC_FIST, .1), k(2.3, REST, FIST_IN), k(2.55, REST, REST)],
    [k(0, REST), k(.2, HALF, REST_B), k(.49, ARC_FIVE, REST_B, .05), k(.95, FIST_IN, REST_B), k(1.05, SNAP, REST_B, .05, .04), k(1.2, FIST_IN, REST_B), k(1.3, CLAP, CLAP, .08), k(1.45, [-1.6, .5, -.6], [-1.6, .5, -.6]), k(1.55, CLAP, CLAP, .08), k(1.65, REST, ARC_OUT), k(2.075, REST, ARC_FIST, .06), k(2.3, REST, FIST_IN), k(2.55, REST, REST)],
    [{type: 'highFive', t0: 0, dur: .95, side: 1}, {type: 'fistBump', t0: 1.65, dur: .85, side: -1}]),
  // 10 Wave then five: a small wave, then a big five with a little hop.
  def('wavefive', 'Wave then five', 2, [1.5], [1.1], ['palm-high-after-wave'],
    [k(0, REST), k(.2, WAVE1, REST_B), k(.4, WAVE2, REST_B), k(.6, WAVE1, REST_B), k(.8, WAVE2, REST_B), k(1, WIND, REST_B, -.08), k(1.3, UP, REST_B, .08), k(1.5, HIT, REST_B, .15, .12), k(1.7, UP, REST_B, .05), k(2, REST)],
    [k(0, REST), k(.3, WAVE1, REST_B), k(.5, WAVE2, REST_B), k(.7, WAVE1, REST_B), k(.9, WAVE2, REST_B), k(1.15, HALF, REST_B), k(1.35, UP, REST_B, .05), k(1.5, HIT, REST_B, .1, .1), k(1.7, UP, REST_B), k(2, REST)]),
];

/** The pose is blended in and out so it never snaps: 0 .. 1 .. 0 over the first / last `FADE` seconds. */
export const HF_FADE = .18;
export const hfEnvelope = (age: number, dur: number): number => { const v = Math.min(age / HF_FADE, (dur - age) / HF_FADE); return v < 0 ? 0 : v > 1 ? 1 : v; };

/** Writes the sampled channels (HF_STRIDE - 1 numbers) at `time` into `out`. Smoothstep between keys, linear for the spin channel. */
export function sampleKeys(keys: Float32Array, time: number, out: Float32Array): Float32Array {
  const n = keys.length / HF_STRIDE;
  if (time <= keys[0]) { for (let c = 1; c < HF_STRIDE; c++) out[c - 1] = keys[c]; return out; }
  const last = (n - 1) * HF_STRIDE;
  if (time >= keys[last]) { for (let c = 1; c < HF_STRIDE; c++) out[c - 1] = keys[last + c]; return out; }
  let i = 0;
  while (i < n - 2 && time >= keys[(i + 1) * HF_STRIDE]) i++;
  const a = i * HF_STRIDE, b = a + HF_STRIDE, u = (time - keys[a]) / (keys[b] - keys[a]), s = u * u * (3 - 2 * u);
  for (let c = 1; c < HF_STRIDE; c++) { const q = c === HF_STRIDE - 1 ? u : s; out[c - 1] = keys[a + c] + (keys[b + c] - keys[a + c]) * q; }
  return out;
}

/** How much the arcade skill pose owns the arms and chest at `age` (0..1, eased in / out over 0.08 s at the window's ends). */
export function segBlend(d: HighFiveDef, age: number): number {
  let best = 0;
  for (let i = 0; i < d.segs.length; i++) {
    const s = d.segs[i], v = Math.min((age - s.t0) / .08, (s.t0 + s.dur - age) / .08);
    if (v > best) best = v;
  }
  return best < 0 ? 0 : best > 1 ? 1 : best;
}
/** The arcade skill to play at `age` (or false): writes type / progress / side into `out` (side is the player's; the partner passes half 1 for the opposite). */
export function highFiveSkill(out: {type: HfSeg["type"]; progress: number; side: 1 | -1}, v: number, half: 0 | 1, age: number): boolean {
  const d = HIGH_FIVES[v]; if (!d) return false;
  for (let i = 0; i < d.segs.length; i++) {
    const s = d.segs[i];
    if (age >= s.t0 && age <= s.t0 + s.dur) { out.type = s.type; out.progress = (age - s.t0) / s.dur; out.side = (half === 0 ? s.side : -s.side) as 1 | -1; return true; }
  }
  return false;
}

/** Index of the hit crossed while the clock went from `from` (exclusive) to `to` (inclusive), or -1. */
export function hitCrossed(d: HighFiveDef, from: number, to: number): number {
  for (let i = 0; i < d.hits.length; i++) if (d.hits[i] > from && d.hits[i] <= to) return i;
  return -1;
}

/** Shuffled bag: all ten are used before any repeats, and the first of a new bag is never the last of the old one. In place, no allocation. */
export interface HighFiveBag { order: Uint8Array; pos: number; last: number }
export function createHighFiveBag(): HighFiveBag { const order = new Uint8Array(HF_COUNT); for (let i = 0; i < HF_COUNT; i++) order[i] = i; return {order, pos: HF_COUNT, last: -1}; }
export function nextHighFive(rand: () => number, bag: HighFiveBag): number {
  if (bag.pos >= HF_COUNT) {
    const o = bag.order;
    for (let i = HF_COUNT - 1; i > 0; i--) { const j = Math.min(i, Math.floor(rand() * (i + 1))); const t = o[i]; o[i] = o[j]; o[j] = t; }
    if (o[0] === bag.last) { const j = 1 + Math.min(HF_COUNT - 2, Math.floor(rand() * (HF_COUNT - 1))); const t = o[0]; o[0] = o[j]; o[j] = t; }
    bag.pos = 0;
  }
  const v = bag.order[bag.pos++]; bag.last = v; return v;
}

/** Which variation plays for an emote: -1 = none (not a high five, or reduced motion: just the bubble and a single raised arm). */
export function highFivePlan(emote: number, reduced: boolean, rand: () => number, bag: HighFiveBag): number {
  return emote === EMOTE.HighFive && !reduced ? nextHighFive(rand, bag) : -1;
}
/** Seconds the sequence runs (the pose and bubble last this long). */
export const highFiveSeconds = (v: number): number => HIGH_FIVES[v].duration;

/** Character height (m, at scale 1) the `hitY` fractions are taken from. */
export const HF_BODY_HEIGHT = 1.75;
/**
 * Where the spark ring pops at hit `hit`: the midpoint between the two characters' hands (a at ax,ay,az; b the partner), or, with no
 * partner, an "air five" a little in front of the player toward `faceYaw` (the camera side). Writes `out`, allocates nothing.
 */
export function sparkPoint(out: {x: number; y: number; z: number}, d: HighFiveDef, hit: number, ax: number, ay: number, az: number, aScale: number,
  hasB: boolean, bx: number, by: number, bz: number, bScale: number, faceYaw: number): void {
  const f = d.hitY[Math.max(0, Math.min(d.hitY.length - 1, hit))] * HF_BODY_HEIGHT;
  if (hasB) { out.x = (ax + bx) / 2; out.z = (az + bz) / 2; out.y = (ay + f * aScale + by + f * bScale) / 2; }
  else { out.x = ax + Math.sin(faceYaw) * .55; out.z = az + Math.cos(faceYaw) * .55; out.y = ay + f * aScale; }
}
