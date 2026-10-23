// Two-player ball emotes with a party friend (owner, Oct 23 2026: "both friends have balls: they both need to pass and juggle with both
// balls"). Played only after the friend tapped Join (relay v1.4, Cap.EmoteAsk); every screen plays the SAME routine from the relay's seed:
//  - PASS IT (two balls): both pass at the same moment, each ball on its own lane (they cross side by side, never collide), both trap, and
//    back again; an even number of exchanges so each ball ends at its owner's feet. Three variations: two-ball wall passes, ground-and-chip
//    (every other exchange is a chipped ball the partner chests down), quick one-touch.
//  - JUGGLE WITH ME (two balls): each juggles their OWN ball, the touches alternating (you, friend, you, friend...), then both flick their
//    ball across to the other's chest, chest it down, and pass it back along the ground; a jump to finish.
// Role 0 = the asker, 1 = the friend who said yes. Pure maths, no three.js; per-frame calls write into reused objects (no allocation).
import {ACTOR_SCALE, BALL_G, BALL_Y, PASS_REACH, contactAfterWindup, KICK_FROM, newActor, resetActor, trickPose, type ActorPose, type Touch} from './emoteBallPlay';
import {createTrickPose, type TrickPose} from '../graphics/trickPose';

type P3 = {x: number; y: number; z: number};
const EMOTE_JUGGLE = 3, EMOTE_PASS = 6;
const SCALE = ACTOR_SCALE[0]; // both players are island players (1.12)
const LANE = .2; // each ball's lane: this far to the passer's side
const clamp01 = (v: number) => v < 0 ? 0 : v > 1 ? 1 : v;
const smooth = (v: number) => { const t = clamp01(v); return t * t * (3 - 2 * t); };

/** One timed ball move: from (who0, f0, s0, y0) to (who1, ...) between t0 and t1; mode 0 = hold at the start point, 1 = roll, 2 = air arc. */
interface Leg {t0: number; t1: number; mode: 0 | 1 | 2; w0: number; f0: number; s0: number; y0: number; w1: number; f1: number; s1: number; y1: number}
/** One body action on ball 0's script: who 0 = the ball's owner, 1 = the partner; kind 0 = strike (windup w, swing k), 1 = ground receive
 *  (contact tc), 2 = chest, 3 = keep-up touches (first contact tc, period). */
interface Act {who: 0 | 1; t0: number; t1: number; kind: 0 | 1 | 2 | 3; tc: number; w: number; k: number; side: -1 | 1; loft: boolean; touch: Touch; period: number}
interface Say {t: number; text: string}
/** A duet routine, mirrored for both players: `legs[o]` = ball o's path when its owner is role o (actor 0 = that owner); acts are the same for both. */
export interface DuetRoutine {id: string; label: string; seconds: number; legs: Leg[]; acts: Act[]; jumpAt: number; says: Say[]}

const STRIKES = {pass: {w: .22, k: .42}, quick: {w: .08, k: .3}, loft: {w: .2, k: .4}} as const;
function passRoutine(id: string, label: string, n: number, period: number, roll: number, style: 'pass' | 'quick', chipOdd: boolean, says: Say[]): DuetRoutine {
  const legs: Leg[] = [], acts: Act[] = [];
  let t = .45, s = LANE;
  for (let k = 0; k < n; k++) {
    const chip = chipOdd && k % 2 === 1, st = chip ? STRIKES.loft : STRIKES[style], tc = t + st.w + contactAfterWindup(st.k);
    const passer = k % 2, recv = 1 - passer, side: -1 | 1 = s > 0 ? 1 : -1;
    legs.push({t0: legs.length ? legs[legs.length - 1].t1 : 0, t1: tc, mode: 0, w0: passer, f0: PASS_REACH, s0: s, y0: BALL_Y, w1: passer, f1: PASS_REACH, s1: s, y1: BALL_Y});
    acts.push({who: passer as 0 | 1, t0: t, t1: t + st.w + st.k, kind: 0, tc, w: st.w, k: st.k, side, loft: chip, touch: 'foot', period: 0});
    if (chip) { // a chip to the chest, chested down to the feet
      const fly = .9, ta = tc + fly;
      legs.push({t0: tc, t1: ta, mode: 2, w0: passer, f0: PASS_REACH, s0: s, y0: BALL_Y, w1: recv, f1: .3, s1: -s * .5, y1: 1.36});
      legs.push({t0: ta, t1: ta + .4, mode: 2, w0: recv, f0: .3, s0: -s * .5, y0: 1.36, w1: recv, f1: PASS_REACH, s1: -s, y1: BALL_Y});
      acts.push({who: recv as 0 | 1, t0: ta - .2, t1: ta + .55, kind: 2, tc: ta, w: 0, k: 0, side, loft: false, touch: 'foot', period: 0});
      t = ta + .4 + .35;
    } else {
      const ta = tc + roll;
      legs.push({t0: tc, t1: ta, mode: 1, w0: passer, f0: PASS_REACH, s0: s, y0: BALL_Y, w1: recv, f1: PASS_REACH, s1: -s, y1: BALL_Y});
      acts.push({who: recv as 0 | 1, t0: ta - .35, t1: ta + .3, kind: 1, tc: ta, w: 0, k: 0, side: side === 1 ? -1 : 1, loft: false, touch: 'foot', period: 0});
      t = Math.max(t + period, ta + .3);
    }
    s = -s;
  }
  const end = legs[legs.length - 1];
  legs.push({t0: end.t1, t1: Infinity, mode: 0, w0: end.w1, f0: end.f1, s0: end.s1, y0: end.y1, w1: end.w1, f1: end.f1, s1: end.s1, y1: end.y1});
  return {id, label, seconds: t + 1.25, legs, acts, jumpAt: t + .05, says};
}
const TOUCH_PT: Record<string, {f: number; y: number}> = {foot: {f: .45, y: .48}, knee: {f: .4, y: 1.02}, head: {f: .06, y: 2.04}};
function juggleRoutine(id: string, label: string, pattern: Touch[], n: number, period: number, says: Say[]): DuetRoutine {
  // Built for ball 0 / actor 0; actor 1 plays the same half a period later (mirrored at sample time).
  const legs: Leg[] = [], acts: Act[] = [], t0 = .75;
  legs.push({t0: 0, t1: t0 - .45, mode: 0, w0: 0, f0: PASS_REACH, s0: .11, y0: BALL_Y, w1: 0, f1: PASS_REACH, s1: .11, y1: BALL_Y});
  let prev = {f: PASS_REACH, s: .11, y: BALL_Y, t: t0 - .45};
  for (let i = 0; i < n; i++) {
    const kind = pattern[i % pattern.length], pt = TOUCH_PT[kind] ?? TOUCH_PT.foot, sd = i % 2 ? -.11 : .11, tc = t0 + i * period;
    legs.push({t0: prev.t, t1: tc, mode: 2, w0: 0, f0: prev.f, s0: prev.s, y0: prev.y, w1: 0, f1: pt.f, s1: kind === 'head' ? 0 : sd, y1: pt.y});
    prev = {f: pt.f, s: kind === 'head' ? 0 : sd, y: pt.y, t: tc};
  }
  acts.push({who: 0, t0: t0 - .5, t1: prev.t + .2, kind: 3, tc: t0, w: 0, k: 0, side: 1, loft: false, touch: 'foot', period});
  // the swap: the last touch sends it across to the partner's chest; they chest it down
  const ta = prev.t + .95;
  legs.push({t0: prev.t, t1: ta, mode: 2, w0: 0, f0: prev.f, s0: prev.s, y0: prev.y, w1: 1, f1: .3, s1: -.25, y1: 1.36});
  legs.push({t0: ta, t1: ta + .4, mode: 2, w0: 1, f0: .3, s0: -.25, y0: 1.36, w1: 1, f1: PASS_REACH, s1: -LANE, y1: BALL_Y});
  acts.push({who: 1, t0: ta - .2, t1: ta + .55, kind: 2, tc: ta, w: 0, k: 0, side: 1, loft: false, touch: 'foot', period: 0});
  // and both pass the other's ball back along the ground, so each ends with their own
  const tk = ta + .4 + period + .5, st = STRIKES.pass, tc = tk + st.w + contactAfterWindup(st.k), tr = tc + .75;
  legs.push({t0: ta + .4, t1: tc, mode: 0, w0: 1, f0: PASS_REACH, s0: -LANE, y0: BALL_Y, w1: 1, f1: PASS_REACH, s1: -LANE, y1: BALL_Y});
  legs.push({t0: tc, t1: tr, mode: 1, w0: 1, f0: PASS_REACH, s0: -LANE, y0: BALL_Y, w1: 0, f1: PASS_REACH, s1: LANE, y1: BALL_Y});
  legs.push({t0: tr, t1: Infinity, mode: 0, w0: 0, f0: PASS_REACH, s0: LANE, y0: BALL_Y, w1: 0, f1: PASS_REACH, s1: LANE, y1: BALL_Y});
  acts.push({who: 1, t0: tk, t1: tk + st.w + st.k, kind: 0, tc, w: st.w, k: st.k, side: -1, loft: false, touch: 'foot', period: 0});
  acts.push({who: 0, t0: tr - .35, t1: tr + .3, kind: 1, tc: tr, w: 0, k: 0, side: 1, loft: false, touch: 'foot', period: 0});
  return {id, label, seconds: tr + 1.3 + period / 2, legs, acts, jumpAt: tr + .3 + period / 2, says};
}
const DUET_PERIOD = .6;
/** Juggle duets: actor 1 runs the same script DUET_PERIOD / 2 later (touches alternate). */
export const JUGGLE_OFFSET = DUET_PERIOD / 2;
export const DUET_PASS_ROUTINES: readonly DuetRoutine[] = [
  passRoutine('two-ball-wall', 'Two-ball wall passes', 4, 1.6, .8, 'pass', false, [{t: .1, text: 'Inside of the foot!'}, {t: 3.4, text: 'Soft first touch!'}]),
  passRoutine('ground-chip', 'Ground pass and chip', 4, 1.6, .8, 'pass', true, [{t: .1, text: 'Pass, then chip it!'}, {t: 3.6, text: 'Chest it down!'}]),
  passRoutine('one-touch', 'Quick one-touch', 6, 1.15, .55, 'quick', false, [{t: .1, text: 'One touch: quick feet!'}, {t: 4.2, text: 'Keep it on the ground!'}]),
];
export const DUET_JUGGLE_ROUTINES: readonly DuetRoutine[] = [
  juggleRoutine('foot-knee', 'Foot and knee keep-ups', ['foot', 'foot', 'knee', 'knee'], 9, DUET_PERIOD, [{t: .1, text: 'Eyes on the ball!'}, {t: 3.2, text: 'Take turns: you, me!'}]),
  juggleRoutine('knee-head', 'Knees and a header', ['knee', 'foot', 'knee', 'foot', 'head', 'foot'], 9, DUET_PERIOD, [{t: .1, text: 'Soft touches!'}, {t: 3.2, text: 'Head it up gently!'}]),
  juggleRoutine('laces', 'Laces keep-ups', ['foot', 'foot', 'foot', 'knee'], 9, DUET_PERIOD, [{t: .1, text: 'Toes up, laces flat!'}, {t: 3.2, text: 'Nice rhythm!'}]),
];
export const isDuetEmote = (e: number) => e === EMOTE_PASS || e === EMOTE_JUGGLE;
/** The routine both screens play for (emote, seed). */
export const duetRoutine = (emote: number, seed: number): DuetRoutine => {
  const list = emote === EMOTE_JUGGLE ? DUET_JUGGLE_ROUTINES : DUET_PASS_ROUTINES;
  return list[((seed % list.length) + list.length) % list.length];
};
export const duetSeconds = (emote: number, seed: number) => duetRoutine(emote, seed).seconds + (emote === EMOTE_JUGGLE ? JUGGLE_OFFSET : 0);

export interface DuetOut {
  /** Body poses by role (0 = the asker, 1 = the friend who joined). */
  actors: [ActorPose, ActorPose];
  /** Each player's OWN ball by role. */
  balls: [P3, P3];
  /** A short teaching line and its serial (the page shows it when sayN changes). */
  say: string; sayN: number;
  /** Internal reused stores. */
  st: {jump: [{progress: number; height: number}, {progress: number; height: number}]; trick: [TrickPose, TrickPose]};
}
export const createDuetOut = (): DuetOut => ({actors: [newActor(), newActor()], balls: [{x: 0, y: 0, z: 0}, {x: 0, y: 0, z: 0}], say: '', sayN: 0,
  st: {jump: [{progress: 0, height: 0}, {progress: 0, height: 0}], trick: [createTrickPose(), createTrickPose()]}});

// pair frame (set per call)
const F = {ax: 0, ay: 0, az: 0, bx: 0, by: 0, bz: 0, ux: 0, uz: 1};
const pA = {x: 0, y: 0, z: 0}, pB = {x: 0, y: 0, z: 0};
/** A point in actor w's frame (f toward the partner, s to the right, y up; body points scale with the rig). `owner` swaps the roles. */
function pt(w: number, f: number, s: number, y: number, out: P3): P3 {
  const sgn = w === 0 ? 1 : -1, fx = F.ux * sgn, fz = F.uz * sgn, rx = fz, rz = -fx, k = y > BALL_Y + .01 ? SCALE : 1;
  const ox = w === 0 ? F.ax : F.bx, oy = w === 0 ? F.ay : F.by, oz = w === 0 ? F.az : F.bz;
  out.x = ox + fx * f * k + rx * s * k; out.z = oz + fz * f * k + rz * s * k; out.y = oy + y * k;
  return out;
}
/** Ball of the player with role `owner` at time t (the routine is authored for owner 0: the frame flips for owner 1). */
function ballAt(r: DuetRoutine, t: number, owner: number, out: P3) {
  const legs = r.legs; let i = 0; while (i < legs.length - 1 && t >= legs[i].t1) i++;
  const g = legs[i], flip = owner === 1, w0 = flip ? 1 - g.w0 : g.w0, w1 = flip ? 1 - g.w1 : g.w1;
  if (g.mode === 0 || g.t1 === Infinity) { pt(w0, g.f0, g.s0, g.y0, out); return; }
  const T = g.t1 - g.t0, u = clamp01((t - g.t0) / Math.max(1e-6, T));
  pt(w0, g.f0, g.s0, g.y0, pA); pt(w1, g.f1, g.s1, g.y1, pB);
  if (g.mode === 1) { const e = 1 - Math.pow(1 - u, 2.2); out.x = pA.x + (pB.x - pA.x) * e; out.z = pA.z + (pB.z - pA.z) * e; out.y = pA.y + (pB.y - pA.y) * e + .03 * Math.sin(u * Math.PI * 2.5) * (1 - u); }
  else { out.x = pA.x + (pB.x - pA.x) * u; out.z = pA.z + (pB.z - pA.z) * u; out.y = pA.y + (pB.y - pA.y) * u + .5 * BALL_G * T * T * u * (1 - u); }
}
/** Actor w's body: its own ball's script (who 0) on its own clock `tOwn`, and the partner's ball's script (who 1) on the partner's clock. */
function actorAt(r: DuetRoutine, tOwn: number, tOther: number, a: ActorPose, jump: {progress: number; height: number}, trick: TrickPose) {
  resetActor(a);
  let best: Act | null = null, bt = 0;
  for (let i = 0; i < r.acts.length; i++) { const c = r.acts[i], t = c.who === 0 ? tOwn : tOther; if (t >= c.t0 && t < c.t1 && (!best || c.t0 - t >= best.t0 - bt)) { best = c; bt = t; } }
  if (best) {
    const c = best, t = bt; a.side = c.side;
    if (c.kind === 0) { a.actionKind = c.loft ? 'loft' : 'pass'; if (t < c.t0 + c.w) a.windup = clamp01((t - c.t0) / c.w); else a.kick = KICK_FROM + (1 - KICK_FROM) * clamp01((t - c.t0 - c.w) / c.k); }
    else if (c.kind === 1) { if (t < c.tc) a.receive = smooth((t - c.t0) / (c.tc - c.t0)); else { a.receive = 1; a.receiveProgress = clamp01((t - c.tc) / .3); } }
    else if (c.kind === 2) { a.reaction = 'chest'; a.reactionProgress = clamp01((t - c.t0) / (c.t1 - c.t0)); }
    else { a.juggle = 1 + (t - c.tc) / c.period + .08; a.juggleTouch = touchAt(r, t); }
  }
  const t = tOwn;
  if (t < .45) a.called = Math.min(smooth(t / .2), smooth((.45 - t) / .2));
  if (t >= r.jumpAt && t < r.jumpAt + .7) { jump.progress = (t - r.jumpAt) / .7; jump.height = .4; a.jump = jump; }
  if (t >= r.jumpAt && t < r.jumpAt + 1.15) a.trick = trickPose('armsUp', Math.min(smooth((t - r.jumpAt) / .22), smooth((r.jumpAt + 1.15 - t) / .25)), trick);
  if (!best && !a.jump && !a.trick && a.juggle === undefined) a.ready = .85;
  if (a.juggle !== undefined) a.jump = undefined;
}
/** The touch kind of the keep-up at or after time t (for the rig's juggle pose). */
function touchAt(r: DuetRoutine, t: number): Touch {
  const legs = r.legs; for (let i = 0; i < legs.length; i++) { const g = legs[i]; if (g.mode === 2 && g.w0 === 0 && g.w1 === 0 && g.t1 >= t) return g.y1 > 1.5 ? 'head' : g.y1 > .8 ? 'knee' : 'foot'; }
  return 'foot';
}
/**
 * Both players and both balls at `age` (s since the duet started). `a` = the asker's feet, `b` = the friend's feet (each screen passes its own
 * view of the two; they stand still, so they agree). Writes `out` and returns it.
 */
export function duetAt(emote: number, seed: number, age: number, a: P3, b: P3, out: DuetOut): DuetOut {
  const r = duetRoutine(emote, seed), off = emote === EMOTE_JUGGLE ? JUGGLE_OFFSET : 0;
  // actor 0's frame for ball / body 0; actor 1 plays the same script `off` later from the other side
  const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz);
  F.ax = a.x; F.ay = a.y; F.az = a.z; F.bx = b.x; F.by = b.y; F.bz = b.z; if (len > 1e-4) { F.ux = dx / len; F.uz = dz / len; }
  const t0 = Math.min(age, r.seconds), t1 = Math.max(0, Math.min(age - off, r.seconds));
  ballAt(r, t0, 0, out.balls[0]); ballAt(r, t1, 1, out.balls[1]);
  actorAt(r, t0, t1, out.actors[0], out.st.jump[0], out.st.trick[0]); actorAt(r, t1, t0, out.actors[1], out.st.jump[1], out.st.trick[1]);
  let sn = 0, say = '';
  for (let i = 0; i < r.says.length; i++) if (r.says[i].t <= age) { sn = i + 1; say = r.says[i].text; }
  out.sayN = sn; out.say = say;
  return out;
}
