// Handshake emotes (user, Oct 22 2026: "the handshakes need to be like the arcade ones where it's more complex ... make them all very different
// and not look static and the same"). HIGH FIVE (10 choreographed multi-beat handshakes), THANKS (5) and WELL PLAYED (5) are PAIR emotes: the
// player half (half 0: you, or a friend's "air" version) and the partner half (half 1: the townsperson) run on ONE clock and meet at the same
// contact times (`hits`), where the pooled spark ring pops. Pure data + tiny helpers; no three.js, no DOM, no allocation after module load.
//
// Full body, one row per key (HS_STRIDE numbers, times ascending, seconds):
//   t | A arm sx, sz, elbow | B arm sx, sz, elbow | lean, twist, tilt | nod, look | crouch, dy, fwd, side, spin | legA, legB
// Arms are in the RIGHT-arm convention of the rig (shoulder-x < 0 swings forward / up, z > 0 lifts the arm OUT, elbow < 0 bends); the writer
// (lib/graphics/handshakePose.ts) mirrors them per side. A is the "five" arm (the right arm for you, the left for the partner, so the two meet).
// lean = chest pitch (+ bows forward), twist = chest yaw (+ turns the chest toward the A side), tilt = side bend (+ toward A), nod (+ looks
// down), look (+ toward A), crouch 0..1 (both knees; the pelvis drops so the feet stay planted), dy = hop (m), fwd = step toward the partner
// (1 = the hands meet at the real gap, 1.5 = chest / hip contact; < 0 steps back, in units of 0.5 m), side = shuffle toward the A side (m),
// spin = body turn (rad, toward A; holds its last value, whole turns end where they began), legA / legB = knee lift of that side's leg (rad).
// Every value stays inside EMOTE_BOUNDS (lib/town/emoteBounds.ts): jumps, spins and bumps happen in place (tests/emote-handshakes.cjs).
import {EMOTE} from './emoteReact';
import {EMOTE_BOUNDS} from './emoteBounds';

export const HS_STRIDE = 19, HS_CHANNELS = HS_STRIDE - 1;
/** Channel indices in a sampled row (time removed). */
export const CH = {a0: 0, a1: 1, a2: 2, b0: 3, b1: 4, b2: 5, lean: 6, twist: 7, tilt: 8, nod: 9, look: 10, crouch: 11, dy: 12, fwd: 13, side: 14, spin: 15, legA: 16, legB: 17} as const;
type Arm = readonly [number, number, number];
export interface HsPose {a?: Arm; b?: Arm; l?: number; tw?: number; tl?: number; nd?: number; lk?: number; c?: number; y?: number; f?: number; s?: number; sp?: number; la?: number; lb?: number}
type Key = readonly [number, HsPose];

// ---- arm shapes (right-arm convention) ----
const R: Arm = [.05, .15, -.12], UP: Arm = [-2.85, .3, -.2], HI: Arm = [-2.4, .12, -.06], WND: Arm = [.8, .6, -.45], LO: Arm = [-.55, .3, -.1], LOH: Arm = [-.8, .18, -.04],
  FW: Arm = [-1.52, .02, -.08], CCK: Arm = [-1.0, .2, -1.9], SNP: Arm = [-2.2, .55, -2.0], SNP2: Arm = [-1.95, .8, -1.7], OPN: Arm = [-1.2, .8, -.35], CLP: Arm = [-1.3, -.34, -.5],
  TOUT: Arm = [-.1, 1.5, -.08], VUP: Arm = [-2.75, .65, -.12], ELB: Arm = [-1.35, 1.0, -1.8], BEH: Arm = [.55, -.3, -1.7], BACKSLAP: Arm = [1.0, .85, -.15], HEART: Arm = [-.6, -.7, -2.05],
  SAL: Arm = [-1.25, 1.15, -2.5], THB: Arm = [-1.3, .35, -1.5], PNT: Arm = [-1.65, .12, -.02], HUG: Arm = [-1.5, .5, -1.25], PAT: Arm = [-1.9, .45, -.75], PAT2: Arm = [-1.75, .4, -1.15],
  FLEX: Arm = [-.15, 1.4, -2.1], PRAY: Arm = [-.75, -.5, -2.1], HIP: Arm = [-.2, .95, -1.9], GRIP: Arm = [-1.25, .08, -.45], GRIP_UP: Arm = [-1.45, .08, -.5], GRIP_DN: Arm = [-1.05, .08, -.4],
  SIDE: Arm = [-1.2, .75, -.15], ACROSS: Arm = [-1.15, -.75, -.35], PALM2: Arm = [-1.6, .2, -.08], TUG: Arm = [-.45, -.4, -1.75], TUG_OUT: Arm = [-.7, -.3, -1.35], FPUMP: Arm = [-2.8, .35, -1.2],
  OFFER: Arm = [-.95, .85, -.55], SWEEP: Arm = [-.7, -.45, -.25], THUMB: Arm = [-1.6, .55, -1.25], OVER: Arm = [-2.6, -.35, -1.1], BIB: Arm = [-1.45, .1, -.25], WAVE_A: Arm = [-2.6, .9, -.6], WAVE_B: Arm = [-2.6, .3, -.9],
  // the windmill: the A arm circles backward and comes over the top into the slap (unwound by the writer's shortest-turn blend)
  W1: Arm = [1.6, .25, -.05], W2: Arm = [3.14, .25, -.05], W3: Arm = [4.71, .25, -.05], W4: Arm = [6.28, .25, -.05], W5: Arm = [7.85, .25, -.05], W6: Arm = [9.42, .25, -.05], HIT_B: Arm = [3.88, .12, -.06], WHIT: Arm = [3.88 + 6.2832, .12, -.06];
const BECKON: Arm = [-1.2, .8, -1.4], SCRATCH: Arm = [-2.3, .9, -2.3];
const turn = (a: Arm, k: number): Arm => [a[0] + k * 6.2832, a[1], a[2]];
const TAU = 6.2832;

export interface HandshakeDef {
  id: string; name: string; emote: number; duration: number;
  /** Contact times (s): the spark pops between the two at hand height `hitY[i]` (fraction of the body). Ascending, inside the duration. */
  hits: readonly number[]; hitY: readonly number[];
  /** What touches at each hit (palm, fist, chest, hip, elbow, ...), for readers and the difference tests. */
  contact: readonly string[];
  player: Float32Array; npc: Float32Array;
  /** Kept for the old arcade-window API (lib/town/highFive.ts): the full-body keys own the rig now, so always empty. */
  segs: readonly never[];
}

function row(out: number[], t: number, p: HsPose, spin: number) {
  const a = p.a ?? R, b = p.b ?? R;
  out.push(t, a[0], a[1], a[2], b[0], b[1], b[2], p.l ?? 0, p.tw ?? 0, p.tl ?? 0, p.nd ?? 0, p.lk ?? 0, p.c ?? 0, p.y ?? 0, p.f ?? 0, p.s ?? 0, spin, p.la ?? 0, p.lb ?? 0);
}
/** Key list -> table. Spin is sticky (a missing `sp` holds the last one), everything else defaults to the rest pose. */
function half(keys: readonly Key[]): Float32Array {
  const out: number[] = []; let spin = 0;
  for (const [t, p] of keys) { if (p.sp !== undefined) spin = p.sp; row(out, t, p, spin); }
  return Float32Array.from(out);
}
const hs = (id: string, name: string, emote: number, duration: number, hits: readonly (readonly [number, number, string])[], player: readonly Key[], npc: readonly Key[]): HandshakeDef =>
  ({id, name, emote, duration, hits: hits.map(h => h[0]), hitY: hits.map(h => h[1]), contact: hits.map(h => h[2]), player: half(player), npc: half(npc), segs: []});

const HF = EMOTE.HighFive, TY = EMOTE.Thanks, WP = EMOTE.WellPlayed;

/** The ten high fives: full multi-beat handshakes like the arcade's (lib/arcade/arcadeSocial.ts), 4-5 s each. */
export const HIGH_FIVE_SEQS: readonly HandshakeDef[] = [
  // 1 Slap-slap-snap-bump: right five, left five, low five, snap-snap by the head, double fist bump that explodes into a hop.
  hs('slapsnap', 'Slap, slap, snap, bump', HF, 4.4, [[.7, 1.12, 'palm-high'], [1.3, 1.12, 'palm-high-other'], [1.9, .38, 'palm-low'], [3.5, .62, 'fist-double']],
    [[0, {}], [.35, {a: WND, c: .3, l: .15, tw: .35, f: .15}], [.7, {a: HI, f: 1, y: .06, tw: -.25, la: .3, l: -.05}], [1.0, {a: SNP, b: WND, f: .7, c: .2, tw: -.35}],
      [1.3, {a: HIP, b: HI, f: 1, y: .06, tw: .25, lb: .3}], [1.6, {a: LO, c: .45, l: .35, f: .75}], [1.9, {a: LOH, c: .55, l: .45, f: 1, nd: .3}],
      [2.3, {a: SNP, b: SNP, y: .1, lk: .4, tl: .18, f: .1}], [2.65, {a: SNP2, b: SNP2, lk: -.4, tl: -.18, c: .15, f: .1}], [3.1, {a: CCK, b: CCK, c: .3, f: .5, l: .1}],
      [3.5, {a: FW, b: FW, f: 1, l: .15, la: .2}], [3.85, {a: VUP, b: VUP, y: .3, f: .35, l: -.2, nd: -.3, la: .4, lb: .4}], [4.4, {}]],
    [[0, {}], [.4, {a: OPN, c: .2, f: .2, tl: -.1}], [.7, {a: HI, f: 1, y: .04, tw: -.2, lb: .25}], [1.0, {b: WND, f: .7, c: .25, tw: .3, lk: .2}],
      [1.3, {b: HI, f: 1, y: .05, tw: .2, la: .25}], [1.6, {a: LO, c: .5, l: .3, f: .7, nd: .2}], [1.9, {a: LOH, c: .5, l: .4, f: 1, nd: .35}],
      [2.3, {a: SNP2, b: SNP2, c: .2, lk: -.35, tl: -.2, f: .1}], [2.65, {a: SNP, b: SNP, y: .1, lk: .35, tl: .2, f: .1}], [3.1, {a: CCK, b: CCK, c: .35, f: .5, l: .15}],
      [3.5, {a: FW, b: FW, f: 1, l: .12, lb: .2}], [3.85, {a: TOUT, b: TOUT, c: .35, f: .3, l: .1, tw: .3}], [4.4, {}]]),
  // 2 Jump chest bump: load, leap into a chest bump, land, point at each other, slap, flex both ways.
  hs('chestbump', 'Jump chest bump', HF, 4.3, [[.8, .78, 'chest'], [2.2, 1.12, 'palm-high'], [3.6, .38, 'palm-low']],
    [[0, {}], [.4, {a: WND, b: WND, c: .6, l: .35, f: .3}], [.8, {a: UP, b: UP, y: .5, f: 1.55, l: -.35, nd: -.2, la: .6, lb: .45}], [1.15, {a: TOUT, b: TOUT, c: .5, f: 1.2, l: .25}],
      [1.6, {a: PNT, b: PNT, f: .7, c: .1, tw: .2, la: .25}], [1.9, {a: WND, f: .7, c: .2, tw: .35}], [2.2, {a: HI, f: 1, y: .1, tw: -.3}],
      [2.6, {a: FLEX, b: FLEX, f: .45, tw: .45, c: .15, lk: .5}], [3.0, {a: FLEX, b: FLEX, f: .45, tw: -.45, c: .15, lk: -.5, y: .05}],
      [3.35, {a: LO, c: .35, l: .3, f: .8}], [3.6, {a: LOH, c: .5, l: .4, f: 1, nd: .3}], [4.3, {}]],
    [[0, {}], [.45, {a: WND, b: WND, c: .55, l: .4, f: .3}], [.8, {a: VUP, b: VUP, y: .45, f: 1.55, l: -.35, nd: -.25, la: .5, lb: .6}], [1.15, {a: OPN, b: OPN, c: .55, f: 1.15, l: .3}],
      [1.6, {a: PNT, b: HIP, f: .65, c: .1, tw: -.2, lb: .25}], [1.9, {a: OPN, b: HIP, f: .7, tw: .2}], [2.2, {a: HI, f: 1, y: .08, tw: -.25}],
      [2.6, {a: FPUMP, b: FPUMP, f: .5, y: .15, nd: -.2}], [3.0, {a: UP, b: UP, f: .5, y: .2, tl: .2}],
      [3.35, {a: LO, c: .4, l: .35, f: .8}], [3.6, {a: LOH, c: .5, l: .4, f: 1, nd: .3}], [4.3, {}]]),
  // 3 Elbow-hook spin: hook elbows, skip round a quarter turn, unhook into a full twirl, then a pointed five.
  hs('elbowspin', 'Elbow-hook spin', HF, 4.8, [[.8, .68, 'elbow-hook'], [3.7, 1.12, 'palm-high']],
    [[0, {}], [.4, {a: ELB, f: .5, tw: .3, c: .15}], [.8, {a: ELB, f: 1.1, s: .2, tw: .45, la: .3}], [1.15, {a: ELB, f: 1.1, s: .4, sp: .5, y: .12, lb: .5}],
      [1.5, {a: ELB, f: 1.1, s: .55, sp: .9, la: .5}], [1.85, {a: ELB, f: 1.0, s: .45, sp: 1.2, y: .12, lb: .5}], [2.2, {a: TOUT, b: TOUT, f: .4, s: .2, sp: 1.5, c: .2}],
      [2.9, {a: TOUT, b: TOUT, f: .3, s: 0, sp: TAU, y: .15, l: -.1}], [3.3, {a: PNT, b: HIP, f: .6, c: .15, sp: TAU}], [3.7, {a: HI, f: 1, y: .12, tw: -.3, sp: TAU}],
      [4.1, {a: VUP, b: VUP, f: .3, y: .15, sp: TAU}], [4.8, {sp: TAU}]],
    [[0, {}], [.4, {a: ELB, f: .5, tw: .25, c: .2}], [.8, {a: ELB, f: 1.1, s: -.2, tw: .4, lb: .3}], [1.15, {a: ELB, f: 1.1, s: -.4, sp: .5, la: .5}],
      [1.5, {a: ELB, f: 1.1, s: -.55, sp: .9, y: .12, lb: .5}], [1.85, {a: ELB, f: 1.0, s: -.45, sp: 1.2, la: .5}], [2.2, {a: OPN, b: OPN, f: .4, s: -.2, sp: 1.5, c: .25}],
      [2.9, {a: OPN, b: OPN, f: .3, s: 0, sp: TAU, c: .1, tl: .2}], [3.3, {a: UP, b: HIP, f: .6, sp: TAU, nd: -.2}], [3.7, {a: HI, f: 1, y: .1, tw: -.25, sp: TAU}],
      [4.1, {a: FPUMP, b: R, f: .3, c: .2, sp: TAU}], [4.8, {sp: TAU}]]),
  // 4 Shoulder bump + double palm: shoulders lead into a bump, a comic stagger, then a two-hand push and a double five up top.
  hs('shoulderpalm', 'Shoulder bump, double palm', HF, 4.4, [[.85, .8, 'shoulder'], [2.5, .7, 'two-palm'], [3.4, 1.12, 'two-palm-high']],
    [[0, {}], [.4, {tw: -.6, f: .4, c: .3, a: HIP, b: R}], [.85, {tw: -.75, f: 1.45, y: .15, s: -.1, tl: .2, a: HIP}], [1.2, {a: [-.6, 1.1, -.4], b: [-.6, 1.1, -.4], f: .45, l: -.25, la: .45, tl: -.15}],
      [1.7, {a: HIP, b: HIP, f: .4, c: .2, tl: .15, lk: .3}], [2.1, {a: OPN, b: OPN, f: .7, c: .25, l: -.1}], [2.5, {a: PALM2, b: PALM2, f: 1, l: .2, la: .25}],
      [2.9, {a: UP, b: UP, f: .6, y: .3, lb: .3, la: .3}], [3.4, {a: HI, b: HI, f: 1, y: .2}], [3.8, {a: OPN, b: OPN, c: .35, f: .4, l: .15}], [4.4, {}]],
    [[0, {}], [.4, {tw: -.65, f: .4, c: .25, a: R, b: HIP}], [.85, {tw: -.8, f: 1.45, y: .12, s: .1, tl: .2}], [1.2, {a: [-.5, 1.2, -.3], b: [-.5, 1.2, -.3], f: .4, l: -.3, lb: .5, tl: .2}],
      [1.7, {a: [-.9, -.3, -1.6], b: [-.9, -.3, -1.6], f: .4, c: .3, l: .3, nd: .3}], [2.1, {a: OPN, b: OPN, f: .7, c: .2}], [2.5, {a: PALM2, b: PALM2, f: 1, l: .15, lb: .25}],
      [2.9, {a: UP, b: UP, f: .6, c: .35, l: .1}], [3.4, {a: HI, b: HI, f: 1, y: .25}], [3.8, {a: VUP, b: VUP, f: .4, y: .15, nd: -.2}], [4.4, {}]]),
  // 5 Point-and-slap: finger guns, point to the sky, a big side slap that spins you away, then a back-hand five.
  hs('pointslap', 'Point and slap', HF, 4.2, [[2.25, .65, 'palm-side'], [3.1, 1.12, 'palm-high-back']],
    [[0, {}], [.3, {a: PNT, b: HIP, la: .25, nd: -.1, f: .2}], [.7, {a: UP, b: HIP, nd: -.35, y: .08}], [1.0, {a: PNT, b: PNT, tw: .45, c: .2, f: .3, la: .3}], [1.3, {a: PNT, b: PNT, tw: -.45, c: .05, f: .3, y: .12}],
      [1.6, {a: PNT, b: PNT, tw: .45, c: .25, f: .3, lb: .3}], [1.95, {a: WND, b: R, c: .3, l: .2, tw: .5, f: .5}], [2.25, {a: SIDE, f: 1, tw: -.4, c: .15}],
      [2.6, {a: ACROSS, tw: -.6, sp: -.9, f: .6, la: .3}], [2.85, {b: WND, sp: -.4, f: .8}], [3.1, {b: HI, sp: 0, f: 1, y: .08}],
      [3.55, {a: UP, b: UP, y: .2, nd: -.35, f: .4}], [4.2, {}]],
    [[0, {}], [.3, {a: HIP, b: HIP, c: .1, tl: .15}], [.7, {a: PNT, b: HIP, lb: .25}], [1.0, {a: PNT, b: PNT, tw: -.3, c: .15, f: .3}], [1.3, {a: PNT, b: PNT, tw: .3, c: .15, f: .3}],
      [1.6, {a: PNT, b: PNT, tw: -.3, c: .2, f: .3, y: .06}], [1.95, {a: OPN, c: .25, f: .5, l: .1}], [2.25, {a: SIDE, f: 1, tw: -.35, c: .15}],
      [2.6, {a: ACROSS, tw: -.5, sp: -.8, f: .6, lb: .3}], [2.85, {b: WND, sp: -.35, f: .8}], [3.1, {b: HI, sp: 0, f: 1, y: .06}],
      [3.55, {a: FPUMP, b: R, c: .3, f: .4, tl: .2}], [4.2, {}]]),
  // 6 Clap-clap, five, pull-in: two claps on the bounce, a five, grip, pull into a hug with back pats, point at each other.
  hs('clappull', 'Clap, clap, pull-in', HF, 4.6, [[1.4, 1.12, 'palm-high'], [2.2, .72, 'pull-in-hug']],
    [[0, {}], [.3, {a: OPN, b: OPN, c: .2}], [.5, {a: CLP, b: CLP, y: .08}], [.72, {a: OPN, b: OPN, c: .2}], [.95, {a: CLP, b: CLP, y: .08}],
      [1.15, {a: WND, c: .25, f: .5}], [1.4, {a: HI, f: 1, y: .14}], [1.8, {a: GRIP, f: 1.1, l: .1}], [2.2, {a: GRIP, b: HUG, f: 1.45, l: .2, tw: -.2, lk: -.3}],
      [2.5, {a: GRIP, b: PAT2, f: 1.45, l: .2, tw: -.2}], [2.75, {a: GRIP, b: HUG, f: 1.45, l: .2}], [3.0, {a: GRIP, b: PAT2, f: 1.45, l: .2, tw: -.15}],
      [3.35, {a: [-.6, .9, -.3], b: [-.6, .9, -.3], f: .3, y: .1}], [3.75, {a: PNT, b: HIP, f: .3, l: -.1, nd: .2}], [4.6, {}]],
    [[0, {}], [.3, {a: OPN, b: OPN, c: .15, tl: .1}], [.5, {a: CLP, b: CLP, c: .25}], [.72, {a: OPN, b: OPN, c: .1, tl: -.1}], [.95, {a: CLP, b: CLP, c: .25}],
      [1.15, {a: UP, c: .2, f: .5}], [1.4, {a: HI, f: 1, y: .1}], [1.8, {a: GRIP, f: 1.1, l: .1}], [2.2, {a: GRIP, b: HUG, f: 1.45, l: .25, tw: -.2, lk: -.3}],
      [2.5, {a: GRIP, b: HUG, f: 1.45, l: .25, nd: .3}], [2.75, {a: GRIP, b: PAT2, f: 1.45, l: .25}], [3.0, {a: GRIP, b: HUG, f: 1.45, l: .2}],
      [3.35, {a: OPN, b: OPN, f: .3, c: .2}], [3.75, {a: PNT, b: PNT, f: .3, c: .1, tw: .2}], [4.6, {}]]),
  // 7 Behind-the-back + fist: turn side-on for a five behind the back, a low five under the lifted knee, then a fist bump that blows up.
  hs('behindfist', 'Behind-the-back fist', HF, 4.6, [[1.05, .55, 'palm-behind-back'], [1.95, .32, 'palm-under-leg'], [2.9, .62, 'fist']],
    [[0, {}], [.35, {a: BEH, c: .2, sp: .5}], [.7, {a: BEH, sp: 1.35, c: .25, f: .5, l: .15}], [1.05, {a: BACKSLAP, sp: 1.45, f: .85, l: .3, nd: .2, lk: .5}],
      [1.5, {a: R, sp: 0, f: .6}], [1.95, {a: LO, la: 1.0, l: .35, f: 1, nd: .3}], [2.5, {a: CCK, f: .6, c: .25, tw: .3}], [2.9, {a: FW, f: 1, l: .15, tw: -.2}],
      [3.2, {a: [-2.3, 1.2, -.3], f: .5, y: .1, l: -.15}], [3.6, {a: TOUT, b: TOUT, f: -.2, y: .15, l: -.2}], [4.6, {}]],
    [[0, {}], [.35, {a: OPN, c: .15}], [.7, {a: SIDE, c: .25, f: .6, l: .15, tw: .3, lb: .35}], [1.05, {a: LOH, c: .35, f: .85, l: .35, nd: .3, lk: -.3}],
      [1.5, {a: R, f: .6, c: .1}], [1.95, {a: LOH, c: .55, l: .45, f: 1, nd: .35}], [2.5, {a: CCK, f: .6, c: .2, tw: .25}], [2.9, {a: FW, f: 1, l: .15, tw: -.2}],
      [3.2, {a: [-2.3, 1.2, -.3], f: .5, c: .2, l: .1}], [3.6, {a: VUP, b: VUP, f: -.2, c: .3, tl: .2}], [4.6, {}]]),
  // 8 Hip bump + five: turn side-on, two hip bumps on the beat, twirl back round to face, a jumping five, a shoulder shimmy.
  hs('hipbump', 'Hip bump five', HF, 4.4, [[.9, .5, 'hip'], [1.5, .5, 'hip-2'], [2.9, 1.15, 'palm-high-jump']],
    [[0, {}], [.4, {a: HIP, b: HIP, sp: 1.5, c: .2, s: .1}], [.9, {a: HIP, b: HIP, sp: 1.55, f: 1.45, tl: .3, c: .15}], [1.2, {a: HIP, b: HIP, sp: 1.55, f: .7, tl: -.1, c: .25}],
      [1.5, {a: HIP, b: HIP, sp: 1.55, f: 1.45, tl: .3, c: .15}], [1.9, {a: TOUT, b: TOUT, sp: 3.5, f: .5, y: .08}], [2.5, {a: WND, sp: TAU, c: .3, f: .6}],
      [2.9, {a: HI, sp: TAU, f: 1, y: .4, la: .5, lb: .3}], [3.35, {a: HIP, b: HIP, sp: TAU, c: .2, tl: .2, f: .5}], [3.7, {a: HIP, b: HIP, sp: TAU, c: .2, tl: -.2, f: .5}],
      [4.4, {sp: TAU}]],
    [[0, {}], [.4, {a: HIP, b: HIP, sp: 1.5, c: .25, s: -.1}], [.9, {a: HIP, b: HIP, sp: 1.55, f: 1.45, tl: .3, c: .2, nd: -.15}], [1.2, {a: [-.6, 1.1, -.4], b: HIP, sp: 1.55, f: .65, tl: -.15, c: .2}],
      [1.5, {a: HIP, b: HIP, sp: 1.55, f: 1.45, tl: .3, c: .2}], [1.9, {a: OPN, b: OPN, sp: 3.5, f: .5, c: .15}], [2.5, {a: UP, sp: TAU, c: .35, f: .6}],
      [2.9, {a: HI, sp: TAU, f: 1, y: .35, la: .3, lb: .5}], [3.35, {a: [-.8, -.2, -1.7], b: [-.8, -.2, -1.7], sp: TAU, l: .2, c: .3, f: .5}], [3.7, {a: FPUMP, b: R, sp: TAU, y: .12, f: .5}],
      [4.4, {sp: TAU}]]),
  // 9 Windmill slap: a two-circle windmill over the top into the slap, the other arm's half windmill, then a double windmill five with a hop.
  // (the arm keeps circling the same way: values grow by whole turns and the writer's shortest-turn blend unwinds them at the fade)
  hs('windmill', 'Windmill slap', HF, 4.6, [[1.55, 1.12, 'palm-windmill'], [2.65, 1.12, 'palm-windmill-other'], [3.7, 1.15, 'two-palm-windmill']],
    [[0, {}], [.3, {a: W1, tw: .3, c: .15}], [.6, {a: W2, tw: .2, y: .06}], [.85, {a: W3, tw: -.2, c: .2}], [1.05, {a: W4, tw: .3, y: .06}], [1.25, {a: W5, tw: .3, c: .25, f: .6}],
      [1.4, {a: W6, f: .85}], [1.55, {a: WHIT, f: 1, y: .1, tw: -.3, la: .3}], [1.85, {a: WHIT, b: W1, f: .7, c: .2}], [2.2, {a: turn(R, 2), b: W2, f: .6, tw: -.3}],
      [2.65, {a: turn(R, 2), b: HIT_B, f: 1, y: .1, tw: .3, lb: .3}], [2.95, {a: turn(W1, 2), b: turn(W1, 1), f: .6, c: .35, l: -.1}], [3.3, {a: turn(W2, 2), b: turn(W2, 1), f: .6, y: .1}],
      [3.7, {a: turn(HIT_B, 2), b: turn(HIT_B, 1), f: 1, y: .3, la: .4, lb: .4}], [4.0, {a: turn(VUP, 3), b: turn(VUP, 2), f: .4, c: .2}], [4.6, {a: turn(R, 3), b: turn(R, 2)}]],
    [[0, {}], [.3, {a: OPN, b: OPN, c: .25, tl: .15}], [.6, {a: BECKON, b: BECKON, c: .3, l: .1}], [.85, {a: OPN, b: OPN, c: .25, tl: -.15, y: .06}], [1.05, {a: BECKON, b: BECKON, c: .3, l: .1}],
      [1.25, {a: UP, c: .2, f: .6}], [1.4, {a: UP, f: .85, c: .1}], [1.55, {a: HI, f: 1, y: .08, tw: -.25, lb: .3}], [1.85, {a: HI, b: W1, f: .7, c: .25, tl: .15}], [2.2, {a: R, b: W2, f: .6, tw: -.25}],
      [2.65, {a: R, b: HIT_B, f: 1, y: .08, tw: .3, la: .3}], [2.95, {a: W1, b: turn(W1, 1), f: .6, c: .3}], [3.3, {a: W2, b: turn(W2, 1), f: .6, c: .1}],
      [3.7, {a: HIT_B, b: turn(HIT_B, 1), f: 1, y: .25, la: .4, lb: .4}], [4.0, {a: turn(FPUMP, 1), b: turn(FPUMP, 2), f: .4, y: .1}], [4.6, {a: turn(R, 1), b: turn(R, 2)}]]),
  // 10 Victory pull-in hug: hop-hop with arms in a V, run in to a double five, swing locked hands side to side, a big hug that rocks, a fist pump.
  hs('victoryhug', 'Victory pull-in hug', HF, 4.8, [[1.5, 1.15, 'two-palm-high'], [2.8, .72, 'hug']],
    [[0, {}], [.3, {a: VUP, b: VUP, y: .22, l: -.2, nd: -.2}], [.55, {a: VUP, b: VUP, c: .3}], [.8, {a: VUP, b: VUP, y: .3, l: -.2}], [1.15, {a: OPN, b: OPN, f: .6, la: .4, c: .1}],
      [1.5, {a: HI, b: HI, f: 1, y: .3}], [1.9, {a: [-2.0, .4, -.3], b: [-2.0, .4, -.3], f: 1, s: .3, tl: .2}], [2.2, {a: [-2.0, .4, -.3], b: [-2.0, .4, -.3], f: 1, s: -.3, tl: -.2}],
      [2.5, {a: OPN, b: OPN, f: 1.2, s: 0}], [2.8, {a: HUG, b: HUG, f: 1.5, l: .2, nd: .25, lk: .45}], [3.1, {a: HUG, b: PAT2, f: 1.5, l: .2, tl: .2, y: .06}],
      [3.4, {a: HUG, b: HUG, f: 1.5, l: .2, tl: -.2, y: .06}], [3.85, {a: FPUMP, b: R, f: .3, y: .25, nd: -.2}], [4.8, {}]],
    [[0, {}], [.3, {a: VUP, b: VUP, c: .3}], [.55, {a: VUP, b: VUP, y: .22, l: -.2}], [.8, {a: VUP, b: VUP, c: .3}], [1.15, {a: OPN, b: OPN, f: .6, lb: .4, c: .1}],
      [1.5, {a: HI, b: HI, f: 1, y: .25}], [1.9, {a: [-2.0, .4, -.3], b: [-2.0, .4, -.3], f: 1, s: -.3, tl: -.2}], [2.2, {a: [-2.0, .4, -.3], b: [-2.0, .4, -.3], f: 1, s: .3, tl: .2}],
      [2.5, {a: OPN, b: OPN, f: 1.2, s: 0}], [2.8, {a: HUG, b: HUG, f: 1.5, l: .25, nd: .3, lk: .45}], [3.1, {a: PAT2, b: HUG, f: 1.5, l: .2, tl: .2}],
      [3.4, {a: HUG, b: HUG, f: 1.5, l: .2, tl: -.2}], [3.85, {a: VUP, b: VUP, f: .3, c: .3, l: .1}], [4.8, {}]]),
];

/** THANKS: five gratitude moves, ~4 s each. The partner answers each one its own way. */
export const THANKS_SEQS: readonly HandshakeDef[] = [
  // 1 Bow + hand on heart: hand to the heart, a deep bow, rise with open palms, a small second bow.
  hs('heartbow', 'Bow, hand on heart', TY, 4, [],
    [[0, {}], [.4, {a: HEART, b: BEH, lb: .15}], [1.0, {a: HEART, b: BEH, l: .6, c: .15, nd: .35}], [1.6, {a: HEART, b: BEH, l: .55, c: .15, nd: .3}],
      [2.2, {a: OFFER, b: OFFER, l: -.1, y: .05, f: .2, la: .2}], [2.8, {a: OFFER, b: OFFER, l: -.05, tw: .25, lk: .2}], [3.3, {a: HEART, b: HEART, l: .3, nd: .25}], [4, {}]],
    [[0, {}], [.5, {a: HEART, c: .1, tl: .2, nd: -.1}], [1.1, {a: HEART, b: HEART, tl: .25, l: .1, c: .3}], [1.6, {a: HEART, b: HEART, tl: -.2, l: .1}],
      [2.2, {a: OFFER, b: OFFER, l: .05, f: .2, lb: .3}], [2.8, {a: THB, c: .1, y: .06}], [3.3, {a: HEART, l: .3, nd: .25}], [4, {}]]),
  // 2 Two-hand clasp shake: step in, wrap both hands round theirs, pump it with the whole body, dip the head, step back with a hand on the heart.
  hs('clasp', 'Two-hand clasp shake', TY, 4, [[.8, .55, 'two-hand-clasp']],
    [[0, {}], [.45, {a: GRIP, b: GRIP, f: .6, la: .3}], [.8, {a: GRIP, b: [-1.25, -.3, -.6], f: 1, l: .1}], [1.0, {a: GRIP_UP, b: [-1.45, -.3, -.65], f: 1, y: .05}],
      [1.2, {a: GRIP_DN, b: [-1.05, -.3, -.55], f: 1, c: .35, l: .2}], [1.4, {a: GRIP_UP, b: [-1.45, -.3, -.65], f: 1, y: .05}], [1.6, {a: GRIP_DN, b: [-1.05, -.3, -.55], f: 1, c: .35, l: .2}],
      [2.05, {a: GRIP, b: [-1.25, -.3, -.6], f: 1, l: .6, nd: .5, c: .25}], [2.6, {a: OFFER, b: OFFER, f: -.2, la: .2, l: -.1}], [3.1, {a: HEART, b: HEART, l: .35, nd: .3}], [4, {}]],
    [[0, {}], [.45, {a: GRIP, f: .6, lb: .25}], [.8, {a: GRIP, f: 1, l: -.1, nd: -.15}], [1.0, {a: GRIP_UP, b: SCRATCH, f: 1, y: .04, tl: .2}],
      [1.2, {a: GRIP_DN, b: SCRATCH, f: 1, c: .15, tl: .25}], [1.4, {a: GRIP_UP, b: SCRATCH, f: 1, y: .04, tl: .2}], [1.6, {a: GRIP_DN, b: [-1.3, -.25, -.6], f: 1, c: .15}],
      [2.05, {a: GRIP, b: [-1.3, -.25, -.6], f: 1, l: .4, nd: .35, c: .15}], [2.6, {b: [-.9, .6, -.5], f: .1, tw: .3}], [3.1, {a: THB, b: R, y: .08}], [4, {}]]),
  // 3 Tap chest, then point: two thumps on the chest, a lunge pointing at them, finger guns, double thumbs up on a hop.
  hs('tappoint', 'Tap chest, point', TY, 4, [],
    [[0, {}], [.3, {a: CCK, l: -.05}], [.45, {a: HEART, l: -.15, y: .04}], [.65, {a: CCK, l: -.05}], [.8, {a: HEART, l: -.15, y: .04, nd: .1}],
      [1.25, {a: PNT, f: .55, la: .5, c: .25, l: .15, tw: -.25}], [1.6, {a: PNT, f: .55, c: .3, l: .15, tw: -.3}], [1.95, {a: PNT, b: PNT, f: .35, tw: .2, c: .15}],
      [2.25, {a: PNT, b: PNT, f: .35, tw: -.2, c: .15}], [2.7, {a: UP, b: HIP, y: .2, nd: -.35}], [3.15, {a: PNT, b: PNT, f: .4, c: .3, l: .25, la: .3}], [4, {}]],
    [[0, {}], [.4, {a: HIP, b: HIP, tl: .15}], [.8, {a: HIP, b: HIP, tl: -.15}], [1.25, {a: HEART, l: .1, tl: .15, nd: .1}], [1.6, {a: HEART, l: .25, c: .1, nd: .3}],
      [1.95, {a: PNT, b: R, tw: .2}], [2.25, {a: PNT, b: R, tw: -.2}], [2.7, {a: THB, y: .15}], [3.1, {a: THB, b: THB, c: .2}], [4, {}]]),
  // 4 Prayer-hands bow + fist bump: palms together, two bows, then step in for a fist bump that opens like fireworks.
  hs('praybump', 'Prayer bow, fist bump', TY, 4, [[2.85, .62, 'fist']],
    [[0, {}], [.35, {a: PRAY, b: PRAY}], [.9, {a: PRAY, b: PRAY, l: .5, c: .1, nd: .35}], [1.4, {a: PRAY, b: PRAY, l: .05}], [1.85, {a: PRAY, b: PRAY, l: .35, nd: .25, c: .1}],
      [2.3, {a: CCK, f: .6, la: .25, tw: .25}], [2.85, {a: FW, f: 1, l: .15, tw: -.2}], [3.2, {a: [-2.3, 1.2, -.3], f: .4, y: .12, l: -.15}], [4, {}]],
    [[0, {}], [.45, {a: HEART, tl: .2}], [1.0, {a: HEART, l: .3, nd: .3, c: .15}], [1.5, {a: OFFER, b: OFFER, tw: .3, y: .05}], [1.95, {a: OFFER, b: OFFER, tw: -.3, c: .2}],
      [2.35, {a: CCK, f: .6, lb: .25, tw: .2}], [2.85, {a: FW, f: 1, l: .15, tw: -.2}], [3.2, {a: [-2.3, 1.2, -.3], f: .4, c: .25, l: .1}], [4, {}]]),
  // 5 Salute, then thumbs: heels together and a crisp salute, the hand flicks out, a sweeping courtly bow, double thumbs up on a hop.
  hs('salutethumbs', 'Salute, then thumbs', TY, 4, [],
    [[0, {}], [.4, {a: SAL, y: .06, l: -.15}], [1.0, {a: SAL, l: -.15, nd: -.1}], [1.25, {a: [-1.6, 1.0, -.2], tw: .3}], [1.75, {a: SWEEP, l: .55, c: .15, lb: .3, nd: .3}],
      [2.3, {a: SWEEP, l: .5, c: .15, lb: .3, nd: .3}], [2.75, {a: THB, b: THB, y: .2, l: -.1}], [3.15, {a: THB, b: THB, c: .2, tl: .15}], [4, {}]],
    [[0, {}], [.5, {a: OPN, tl: .2, la: .3}], [1.0, {a: SAL, y: .05, l: -.1}], [1.4, {a: SAL, l: -.1}], [1.75, {a: HEART, l: .3, nd: .25, c: .25}],
      [2.3, {a: HEART, l: .2, tl: .2}], [2.75, {a: THB, y: .15}], [3.15, {a: THB, b: THB, tl: -.15, c: .15}], [4, {}]]),
];

/** WELL PLAYED (good game): five sporting-respect moves, ~4 s each. */
export const WELL_PLAYED_SEQS: readonly HandshakeDef[] = [
  // 1 Fist bump + pat on the back: step in, fist bump, pull in with three pats, step back and applaud.
  hs('fistpat', 'Fist bump, pat on the back', WP, 4, [[.75, .62, 'fist'], [1.5, .78, 'back-pat']],
    [[0, {}], [.4, {a: CCK, f: .6, la: .3}], [.75, {a: FW, f: 1, l: .1}], [1.15, {a: GRIP, b: PAT, f: 1.35, l: .15, lk: -.3}], [1.5, {a: GRIP, b: PAT2, f: 1.35, l: .2, nd: .2}],
      [1.8, {a: GRIP, b: PAT, f: 1.35, l: .15}], [2.1, {a: GRIP, b: PAT2, f: 1.35, l: .2}], [2.6, {f: -.2, l: -.05}], [2.95, {a: OPN, b: OPN, f: -.2, c: .15}],
      [3.15, {a: CLP, b: CLP, f: -.2, y: .05}], [3.4, {a: OPN, b: OPN, f: -.2, c: .15}], [3.6, {a: CLP, b: CLP, f: -.2, y: .05}], [4, {}]],
    [[0, {}], [.4, {a: CCK, f: .6, lb: .3}], [.75, {a: FW, f: 1, l: .1}], [1.15, {a: GRIP, b: HUG, f: 1.35, l: .25, lk: .45, nd: .35, c: .2}], [1.5, {a: GRIP, b: HUG, f: 1.35, l: .25, lk: .45, nd: .35, c: .2}],
      [1.8, {a: GRIP, b: PAT2, f: 1.35, l: .25, lk: .45, nd: .3, c: .2}], [2.1, {a: GRIP, b: HUG, f: 1.35, l: .2, c: .15}], [2.6, {f: -.2, c: .3}], [2.95, {a: VUP, b: VUP, y: .25, f: -.2, l: -.15}],
      [3.4, {a: FPUMP, b: R, c: .2, f: -.1, tw: .3}], [4, {}]]),
  // 2 Double handshake + shoulder squeeze: shake with a pumping bob, the other hand squeezes their shoulder, switch to a thumb grip, nod and point.
  hs('doubleshake', 'Double handshake, shoulder squeeze', WP, 4, [[.6, .55, 'handshake'], [2.25, .7, 'thumb-grip']],
    [[0, {}], [.35, {a: GRIP, f: .6, la: .25}], [.6, {a: GRIP, f: 1}], [.8, {a: GRIP_UP, f: 1, s: .2, tl: .15}], [1.0, {a: GRIP_DN, f: 1, s: -.2, tl: -.15}], [1.2, {a: GRIP_UP, f: 1, s: .2, tl: .15}],
      [1.6, {a: GRIP, b: PAT, f: 1.1, l: .15, tl: .15, nd: .15}], [1.95, {a: GRIP, b: PAT2, f: 1.1, l: .2}], [2.25, {a: THUMB, b: R, f: 1.05, tw: -.2, l: .05}],
      [2.7, {a: THUMB, b: TOUT, f: 1.05, tw: -.45, c: .3, l: .25}], [3.15, {a: PNT, f: .2, nd: .2}], [4, {}]],
    [[0, {}], [.35, {a: GRIP, f: .6, lb: .25}], [.6, {a: GRIP, f: 1}], [.8, {a: GRIP_UP, f: 1, y: .04}], [1.0, {a: GRIP_DN, f: 1, c: .15}], [1.2, {a: GRIP_UP, f: 1, y: .04}],
      [1.6, {a: GRIP, f: 1.1, nd: .3, l: .1}], [1.95, {a: GRIP, b: PAT2, f: 1.1, l: .15}], [2.25, {a: THUMB, b: R, f: 1.05, tw: -.2}],
      [2.7, {a: THUMB, f: 1.05, tw: -.25, c: .2}], [3.15, {a: THB, f: .2, y: .08}], [4, {}]]),
  // 3 Jersey tug + applause: tug the badge out twice, then bouncing applause toward them; they bow and clap back.
  hs('jerseyclap', 'Jersey tug, applause', WP, 4, [],
    [[0, {}], [.3, {a: TUG, b: TUG, l: -.1}], [.55, {a: TUG_OUT, b: TUG_OUT, l: -.25, y: .06, nd: -.15}], [.8, {a: TUG, b: TUG, l: -.1}], [1.05, {a: TUG_OUT, b: TUG_OUT, l: -.25, y: .06, nd: -.15}],
      [1.45, {a: OPN, b: OPN, f: .3, c: .2}], [1.65, {a: CLP, b: CLP, f: .35, y: .06}], [1.85, {a: OPN, b: OPN, f: .4, c: .2, tw: .2}], [2.05, {a: CLP, b: CLP, f: .45, y: .06}],
      [2.25, {a: OPN, b: OPN, f: .5, c: .2, tw: -.2}], [2.45, {a: CLP, b: CLP, f: .5, y: .06}], [2.8, {a: VUP, b: VUP, y: .2, f: .4, l: -.15}], [3.2, {a: CLP, b: CLP, c: .2, f: .3}], [4, {}]],
    [[0, {}], [.4, {a: HIP, b: HIP, tl: .2}], [1.0, {a: HEART, l: .2}], [1.45, {a: HEART, b: BEH, l: .5, c: .15, nd: .35}], [2.0, {a: HEART, b: BEH, l: .5, c: .15, nd: .35}],
      [2.4, {a: OPN, b: OPN, c: .25, f: .2, tw: .25}], [2.6, {a: CLP, b: CLP, y: .06, f: .3}], [2.8, {a: OPN, b: OPN, c: .25, f: .35, tw: -.25}], [3.0, {a: CLP, b: CLP, y: .06, f: .35}], [3.3, {a: THB, b: R, y: .15, f: .2, lb: .3}], [4, {}]]),
  // 4 Swap-bib bow: pull the bib off over the head, hold it out, swap with them, a deep bow with it on the chest, wave it overhead.
  hs('bibswap', 'Swap-bib bow', WP, 4, [[1.55, .62, 'bib-swap']],
    [[0, {}], [.3, {a: TUG, b: TUG, c: .1}], [.65, {a: OVER, b: OVER, l: -.2, nd: -.2}], [.95, {a: UP, b: UP, l: -.25, y: .05}], [1.25, {a: BIB, b: BIB, f: .6, la: .25}],
      [1.55, {a: BIB, b: BIB, f: 1, l: .1}], [1.9, {a: HEART, b: HEART, f: .4}], [2.3, {a: HEART, b: BEH, l: .6, c: .15, nd: .35}], [2.7, {a: HEART, b: BEH, l: .5, c: .15, nd: .3}],
      [3.05, {a: WAVE_A, y: .08}], [3.3, {a: WAVE_B, c: .1}], [3.55, {a: WAVE_A, y: .08}], [4, {}]],
    [[0, {}], [.35, {a: TUG, b: TUG, c: .1}], [.7, {a: OVER, b: OVER, l: -.2}], [1.0, {a: UP, b: UP, l: -.2}], [1.25, {a: BIB, b: BIB, f: .6, lb: .25}],
      [1.55, {a: BIB, b: BIB, f: 1, l: .1}], [1.9, {a: HEART, b: HEART, f: .4}], [2.3, {a: HEART, b: HEART, l: .45, nd: .3}], [2.7, {a: OFFER, b: OFFER, l: .05, tw: .2}],
      [3.05, {a: WAVE_B, b: R, c: .1}], [3.3, {a: WAVE_A, y: .08}], [3.55, {a: WAVE_B, c: .1}], [4, {}]]),
  // 5 Chest-tap + salute: two thumps on the badge, a point, heels together for a held salute, then an open palm offered across.
  hs('chestsalute', 'Chest tap, salute', WP, 4, [[3.0, .65, 'palm-offer']],
    [[0, {}], [.3, {a: CCK, b: R, l: -.05}], [.45, {a: HEART, l: -.2, y: .05}], [.65, {b: CCK, l: -.05}], [.8, {b: HEART, l: -.2, y: .05}], [1.15, {a: PNT, tw: -.2, f: .3, la: .3}],
      [1.6, {a: SAL, y: .06, l: -.15}], [2.3, {a: SAL, l: -.15, nd: -.1}], [2.65, {a: OFFER, f: .6, c: .1}], [3.0, {a: GRIP, f: 1, l: .1}], [3.4, {a: GRIP, f: 1, l: .25, nd: .3}], [4, {}]],
    [[0, {}], [.35, {a: HIP, b: HIP, c: .25}], [.8, {a: HIP, b: HIP, tl: .15, lk: .3}], [1.15, {a: HEART, l: .1, tw: .25}], [1.6, {a: SAL, y: .06, l: -.15, lb: .3}],
      [2.3, {a: SAL, l: -.15}], [2.65, {a: OFFER, f: .6, c: .1}], [3.0, {a: GRIP, f: 1, l: .1}], [3.4, {a: GRIP, b: PAT2, f: 1.1, l: .15}], [4, {}]]),
];

/** Every handshake in one table: the global index is what plays (`v`): 0..9 high fives, 10..14 thanks, 15..19 well played. */
export const HANDSHAKES: readonly HandshakeDef[] = [...HIGH_FIVE_SEQS, ...THANKS_SEQS, ...WELL_PLAYED_SEQS];
export const HS_RANGE: Readonly<Record<number, readonly [number, number]>> = {
  [HF]: [0, HIGH_FIVE_SEQS.length], [TY]: [HIGH_FIVE_SEQS.length, HIGH_FIVE_SEQS.length + THANKS_SEQS.length],
  [WP]: [HIGH_FIVE_SEQS.length + THANKS_SEQS.length, HANDSHAKES.length],
};
export const isHandshakeEmote = (emote: number): boolean => emote === HF || emote === TY || emote === WP;

/** Blend in / out over the first / last HS_FADE seconds so the pose never snaps. */
export const HS_FADE = .2;
export const hsEnvelope = (age: number, dur: number): number => { const v = Math.min(age / HS_FADE, (dur - age) / HS_FADE); return v < 0 ? 0 : v > 1 ? 1 : v; };

/**
 * Samples a half's channels at `time` into `out` (HS_CHANNELS numbers). Monotone cubic between keys: smooth through the beats, no
 * overshoot (so the bounds hold), and every peak / contact is a natural hold. Allocates nothing.
 */
export function sampleHandshake(keys: Float32Array, time: number, out: Float32Array): Float32Array {
  const S = HS_STRIDE, n = keys.length / S;
  if (time <= keys[0]) { for (let c = 1; c < S; c++) out[c - 1] = keys[c]; return out; }
  const last = (n - 1) * S;
  if (time >= keys[last]) { for (let c = 1; c < S; c++) out[c - 1] = keys[last + c]; return out; }
  let i = 0;
  while (i < n - 2 && time >= keys[(i + 1) * S]) i++;
  const a = i * S, b = a + S, t0 = keys[a], t1 = keys[b], h = t1 - t0, u = (time - t0) / h, u2 = u * u, u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  const hasP = i > 0, hasN = i < n - 2;
  for (let c = 1; c < S; c++) {
    const p0 = keys[a + c], p1 = keys[b + c], d = (p1 - p0) / h;
    let m0 = 0, m1 = 0;
    if (hasP) { const dp = (p0 - keys[a - S + c]) / (t0 - keys[a - S]); m0 = dp * d > 0 ? 2 / (1 / dp + 1 / d) : 0; }
    if (hasN) { const dn = (keys[b + S + c] - p1) / (keys[b + S] - t1); m1 = dn * d > 0 ? 2 / (1 / dn + 1 / d) : 0; }
    out[c - 1] = h00 * p0 + h10 * h * m0 + h01 * p1 + h11 * h * m1;
  }
  return out;
}

/** Reference gap (m) the `fwd` channel is authored at, and the gap at which the two hands meet. */
export const HS_REF_GAP = 2.2, HS_HAND_GAP = 1.05, HS_MAX_STEP = 1.3;
/**
 * The root offset (m) for a sampled row: `out.f` toward the partner, `out.s` toward the A side, already clamped inside EMOTE_BOUNDS.rootRadius.
 * `gap` = the distance between the two characters' feet when nobody leans in (NaN: no partner, the authored reference).
 */
export function handshakeStep(out: {f: number; s: number}, row: Float32Array, gap: number): {f: number; s: number} {
  const g = gap === gap ? gap : HS_REF_GAP, close = Math.max(0, Math.min(HS_MAX_STEP, (g - HS_HAND_GAP) / 2)), fw = row[CH.fwd];
  let f = fw > 0 ? fw * close : fw * .5, s = row[CH.side];
  const len = Math.hypot(f, s), max = Math.min(HS_MAX_STEP, EMOTE_BOUNDS.rootRadius - .05);
  if (len > max) { f *= max / len; s *= max / len; }
  out.f = f; out.s = s; return out;
}
/** Knee bend (rad at the hip) for a crouch value, and how far that drops the pelvis (m, at body scale 1) so the feet stay planted. */
export const crouchAngle = (c: number): number => Math.max(0, Math.min(1, c)) * 1.05;
export const crouchDrop = (c: number): number => .83 * (1 - Math.cos(crouchAngle(c)));
/** Spin to show at a sampled value: whole turns wrapped away so the fade in / out never unwinds a finished twirl. */
export const spinShown = (spin: number): number => { const r = spin - TAU * Math.round(spin / TAU); return r; };

// ---- shuffled bags: every variant before a repeat, never the same twice in a row (also across bags). No allocation per pick. ----
export interface HsBag { order: Uint8Array; pos: number; last: number }
export function createHsBag(n: number): HsBag { const order = new Uint8Array(n); for (let i = 0; i < n; i++) order[i] = i; return {order, pos: n, last: -1}; }
export function nextInBag(rand: () => number, bag: HsBag): number {
  const o = bag.order, n = o.length;
  if (bag.pos >= n) {
    for (let i = n - 1; i > 0; i--) { const j = Math.min(i, Math.floor(rand() * (i + 1))); const t = o[i]; o[i] = o[j]; o[j] = t; }
    if (n > 1 && o[0] === bag.last) { const j = 1 + Math.min(n - 2, Math.floor(rand() * (n - 1))); const t = o[0]; o[0] = o[j]; o[j] = t; }
    bag.pos = 0;
  }
  const v = o[bag.pos++]; bag.last = v; return v;
}
/** One bag per handshake emote (high five, thanks, well played). */
export interface HsBags { [emote: number]: HsBag }
export function createHsBags(): HsBags { return {[HF]: createHsBag(HIGH_FIVE_SEQS.length), [TY]: createHsBag(THANKS_SEQS.length), [WP]: createHsBag(WELL_PLAYED_SEQS.length)}; }
/** The global handshake index to play for `emote` (-1 = not a handshake emote, or reduced motion: the bubble and a single raised arm). */
export function handshakePlan(emote: number, reduced: boolean, rand: () => number, bags: HsBags, hfBag?: HsBag): number {
  if (reduced || !isHandshakeEmote(emote)) return -1;
  const r = HS_RANGE[emote], bag = emote === HF && hfBag ? hfBag : bags[emote];
  return r[0] + nextInBag(rand, bag);
}
