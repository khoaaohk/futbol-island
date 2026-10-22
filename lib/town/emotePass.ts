// Two ball emotes (user, Oct 22 2026), both played with the player's ONE existing ball (Town drives `ball.position` from these functions and gives
// it back at the end: no second ball mesh exists).
//  - PASS IT (emote 6): a GROUND pass, 3-4 m apart, five passes player -> partner -> player ...: the passer winds up, plants one foot and swings the other
//    leg through (the rig's own 'pass' strike, `windup` then `kick`), and the ball leaves the foot on the CONTACT frame (kick = STRIKE_CONTACT); it rolls
//    low along the ground (a tiny bounce at most) and the receiver traps it under the foot (`receive` cushion) before passing it back.
//  - JUGGLE WITH ME (emote 3, was "Pass to me"): 6-8 m apart, the ball goes back and forth IN THE AIR in high arcs; each holder keeps it up with
//    JUGGLE_KEEPS touches (foot / knee / head: the rig's `juggle` phase) before a loft kick (contact frame again) sends it to the other; 4 transfers.
//    Alone: a solo keep-up routine (JUGGLE_SOLO_SECONDS).
// Pure math, no three.js. Every function writes into a reused `PassBallOut` (no allocation per frame).
import {STRIKE_CONTACT} from '../graphics/strikeMotion';

export const PASS_COUNT = 5, PASS_REACH = .5, PASS_LEAD = .35;
/** The rig's strike: `windup` 0..1 draws the leg back (kick phase 0 -> KICK_FROM), then `kick` runs KICK_FROM -> 1 with the ball released at STRIKE_CONTACT. */
export const KICK_FROM = .15;
/** Seconds after the wind-up that the ball leaves the foot, for a swing of `k` seconds (kick phase KICK_FROM -> 1 over k). */
export const contactAfterWindup = (k: number) => (STRIKE_CONTACT - KICK_FROM) / (1 - KICK_FROM) * k;
export const GROUND = {windup: .22, kick: .42, roll: .7, trap: .28} as const;
/** One ground pass from the start of the wind-up to the next passer's wind-up. */
export const PASS_PERIOD = GROUND.windup + contactAfterWindup(GROUND.kick) + GROUND.roll + GROUND.trap;
export const PASS_SECONDS = PASS_LEAD + (PASS_COUNT - 1) * PASS_PERIOD + GROUND.windup + contactAfterWindup(GROUND.kick) + GROUND.roll + GROUND.trap;
/** The partner of a ground pass when no townsperson is near: an imaginary friend this far in front of you (m); the ball rolls out and comes back. */
export const AIR_PARTNER = 3.5;
export const PASS_GAP = {min: 3, max: 4} as const;

export type Touch = 'foot' | 'knee' | 'head';
export interface ActorPose {
  /** 0..1 wind-up (undefined = not winding up) and the swing (kick phase, undefined = not swinging). */
  windup: number | undefined; kick: number | undefined; actionKind: 'pass' | 'loft';
  /** 0..1 first-touch cushion (0 = none) and its progress. */
  receive: number; receiveProgress: number;
  /** Keep-up phase (the contact is at each whole number) and the touch kind, or undefined. */
  juggle: number | undefined; juggleTouch: Touch; side: -1 | 1;
}
const newActor = (): ActorPose => ({windup: undefined, kick: undefined, actionKind: 'pass', receive: 0, receiveProgress: 0, juggle: undefined, juggleTouch: 'foot', side: 1});
export interface PassBallOut {
  x: number; y: number; z: number;
  /** Who plays the ball now: 0 = you, 1 = your partner, -1 before the first. */
  from: number;
  /** 0..1 the passer's kick, 0 when not kicking (kept for the body hop). */
  kick: number;
  /** The pass / transfer number (-1 before the first). */
  index: number;
  /** The ball is in flight (rolling or flying). */
  air: boolean;
  /** The seconds (age) at which the ball last left a foot, and how many times it has. */
  contactAt: number; contacts: number;
  /** The two actors' body poses: [you, partner]. */
  actors: [ActorPose, ActorPose];
}
export const createPassBallOut = (): PassBallOut => ({x: 0, y: 0, z: 0, from: -1, kick: 0, index: -1, air: false, contactAt: -1, contacts: 0, actors: [newActor(), newActor()]});
const resetActors = (out: PassBallOut) => {
  for (const a of out.actors) { a.windup = a.kick = a.juggle = undefined; a.actionKind = 'pass'; a.receive = a.receiveProgress = 0; }
  out.kick = 0; out.air = false;
};
type P3 = {x: number; y: number; z: number};
const clamp01 = (v: number) => v < 0 ? 0 : v > 1 ? 1 : v;

/** Ground pass: the ball for Pass it at `age` seconds; `a` = the player's feet, `b` = the partner's feet. */
export function passBallAt(age: number, a: P3, b: P3, out: PassBallOut): PassBallOut {
  resetActors(out);
  const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz) || 1, ux = dx / len, uz = dz / len;
  const W = GROUND.windup, K = GROUND.kick, R = GROUND.roll, TR = GROUND.trap, tc = W + contactAfterWindup(K);
  const i = Math.max(0, Math.min(PASS_COUNT - 1, Math.floor((age - PASS_LEAD) / PASS_PERIOD))), t = age - PASS_LEAD - i * PASS_PERIOD;
  const fromMe = i % 2 === 0, p = fromMe ? 0 : 1, r = 1 - p;
  const sx = fromMe ? a.x + ux * PASS_REACH : b.x - ux * PASS_REACH, sz = fromMe ? a.z + uz * PASS_REACH : b.z - uz * PASS_REACH, sy = fromMe ? a.y : b.y;
  const ex = fromMe ? b.x - ux * PASS_REACH : a.x + ux * PASS_REACH, ez = fromMe ? b.z - uz * PASS_REACH : a.z + uz * PASS_REACH, ey = fromMe ? b.y : a.y;
  out.index = age < PASS_LEAD ? -1 : i; out.from = age < PASS_LEAD ? -1 : p;
  out.contacts = age < PASS_LEAD ? 0 : i + (t >= tc ? 1 : 0); out.contactAt = out.contacts > 0 ? PASS_LEAD + (out.contacts - 1) * PASS_PERIOD + tc : -1;
  if (age < PASS_LEAD || t < 0) { out.x = a.x + ux * PASS_REACH; out.y = a.y + .2; out.z = a.z + uz * PASS_REACH; return out; }
  const act = out.actors[p], rec = out.actors[r];
  if (t < W) act.windup = t / W;
  else if (t < W + K) { act.kick = KICK_FROM + (1 - KICK_FROM) * (t - W) / K; out.kick = clamp01((t - W) / K); }
  if (t < tc) { out.x = sx; out.y = sy + .2; out.z = sz; return out; } // the ball waits on the foot until the contact frame
  const f = clamp01((t - tc) / R);
  out.air = f < 1;
  if (f < 1) {
    const e = 1 - Math.pow(1 - f, 2.2); // a push pass: quick off the foot, slowing as it rolls
    out.x = sx + (ex - sx) * e; out.z = sz + (ez - sz) * e; out.y = sy + (ey - sy) * e + .2 + .03 * Math.sin(f * Math.PI * 2.5) * (1 - f);
    if (f > .55) { rec.receive = clamp01((f - .55) / .3); rec.receiveProgress = 0; }
  } else {
    out.x = ex; out.z = ez; const s = t - tc - R; out.y = ey + .2 + .05 * Math.max(0, 1 - s * 7) * Math.abs(Math.sin(s * 16));
    rec.receive = 1; rec.receiveProgress = clamp01(s / TR);
  }
  return out;
}

// ---- Juggle with me: the ball back and forth IN THE AIR ----
export const JUGGLE_KEEPS = 2, JUGGLE_TOUCH = .36, JUGGLE_LEAD = .4, JUGGLE_TRANSFERS = 4, JUGGLE_FLIGHT = .95, JUGGLE_LOFT = {windup: .2, kick: .4} as const;
export const JUGGLE_GAP = {min: 6, max: 8} as const, JUGGLE_PEAK = 3.4;
const KEEP_T = JUGGLE_KEEPS * JUGGLE_TOUCH, LOFT_CONTACT = JUGGLE_LOFT.windup + contactAfterWindup(JUGGLE_LOFT.kick);
/** One holder's segment (touches, loft, then the flight to the other) and the whole routine. */
export const JUGGLE_SEGMENT = KEEP_T + LOFT_CONTACT + JUGGLE_FLIGHT;
export const JUGGLE_FINAL = KEEP_T + .5;
export const JUGGLE_SECONDS = JUGGLE_LEAD + JUGGLE_TRANSFERS * JUGGLE_SEGMENT + JUGGLE_FINAL;
export const JUGGLE_SOLO_TOUCHES = 12, JUGGLE_SOLO_SECONDS = JUGGLE_LEAD + JUGGLE_SOLO_TOUCHES * JUGGLE_TOUCH + .6;
/** The touch kinds a holder uses: you foot, knee; your partner foot, head. */
const KINDS: readonly (readonly Touch[])[] = [['foot', 'knee'], ['foot', 'head']];
const SOLO_KINDS: readonly Touch[] = ['foot', 'foot', 'knee', 'foot', 'knee', 'head', 'foot', 'knee', 'foot', 'head', 'knee', 'foot'];
const CONTACT_Y: Record<Touch, number> = {foot: .3, knee: .62, head: 1.78};
/** The ball in the air between the two feet: `a` = you, `b` = your partner. */
export function juggleBallAt(age: number, a: P3, b: P3, out: PassBallOut): PassBallOut {
  resetActors(out);
  const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz) || 1, ux = dx / len, uz = dz / len;
  const front = (h: number): P3 => h % 2 === 0 ? {x: a.x + ux * PASS_REACH, y: a.y, z: a.z + uz * PASS_REACH} : {x: b.x - ux * PASS_REACH, y: b.y, z: b.z - uz * PASS_REACH};
  if (age < JUGGLE_LEAD) { const s = front(0); out.x = s.x; out.y = s.y + .2; out.z = s.z; out.from = -1; out.index = -1; out.contacts = 0; out.contactAt = -1; return out; }
  const t0 = age - JUGGLE_LEAD, h = Math.min(JUGGLE_TRANSFERS, Math.floor(t0 / JUGGLE_SEGMENT)), t = t0 - h * JUGGLE_SEGMENT, final = h === JUGGLE_TRANSFERS;
  const holder = h % 2, kinds = KINDS[holder], act = out.actors[holder], s = front(h);
  out.from = holder; out.index = h; out.contacts = h; out.contactAt = h > 0 ? JUGGLE_LEAD + (h - 1) * JUGGLE_SEGMENT + KEEP_T + LOFT_CONTACT : -1;
  if (t < KEEP_T || final) {
    const tt = Math.min(t, KEEP_T + .5), j = Math.min(JUGGLE_KEEPS - 1, Math.floor(tt / JUGGLE_TOUCH)), u = clamp01((tt - j * JUGGLE_TOUCH) / JUGGLE_TOUCH);
    if (t < KEEP_T) {
      const here = CONTACT_Y[kinds[j % 2]], next = j + 1 < JUGGLE_KEEPS ? CONTACT_Y[kinds[(j + 1) % 2]] : final ? .2 : .3;
      out.x = s.x + .05 * Math.sin(tt * 9); out.z = s.z; out.y = s.y + here + (next - here) * u + .85 * 4 * u * (1 - u);
      act.juggle = tt / JUGGLE_TOUCH; act.juggleTouch = kinds[j % 2]; act.side = j % 2 === 0 ? 1 : -1;
    } else { const k2 = t - KEEP_T; out.x = s.x; out.z = s.z; out.y = s.y + .2 + .1 * Math.max(0, 1 - k2 * 5) * Math.abs(Math.sin(k2 * 14)); } // the last keep-up settles at the feet
    return out;
  }
  const lt = t - KEEP_T; act.actionKind = 'loft';
  if (lt < JUGGLE_LOFT.windup) act.windup = lt / JUGGLE_LOFT.windup;
  else if (lt < JUGGLE_LOFT.windup + JUGGLE_LOFT.kick) { act.kick = KICK_FROM + (1 - KICK_FROM) * (lt - JUGGLE_LOFT.windup) / JUGGLE_LOFT.kick; out.kick = clamp01((lt - JUGGLE_LOFT.windup) / JUGGLE_LOFT.kick); }
  if (lt < LOFT_CONTACT) { out.x = s.x; out.z = s.z; out.y = s.y + .3 - .06 * Math.sin(lt / LOFT_CONTACT * Math.PI); return out; } // the ball waits at the foot until the contact frame
  const f = clamp01((lt - LOFT_CONTACT) / JUGGLE_FLIGHT), e = front(h + 1), land = CONTACT_Y[KINDS[(h + 1) % 2][0]];
  out.air = true;
  out.x = s.x + (e.x - s.x) * f; out.z = s.z + (e.z - s.z) * f; out.y = s.y + .3 + (e.y + land - s.y - .3) * f + JUGGLE_PEAK * 4 * f * (1 - f);
  return out;
}
/** Alone: a keep-up routine at your feet (foot, knee, head touches). */
export function juggleSoloAt(age: number, a: P3, facing: number, out: PassBallOut): PassBallOut {
  resetActors(out);
  const act = out.actors[0], fx = a.x + Math.sin(facing) * PASS_REACH, fz = a.z + Math.cos(facing) * PASS_REACH;
  out.from = 0; out.index = 0;
  const t = age - JUGGLE_LEAD;
  if (t < 0) { out.x = fx; out.z = fz; out.y = a.y + .2; return out; }
  const j = Math.min(JUGGLE_SOLO_TOUCHES - 1, Math.floor(t / JUGGLE_TOUCH));
  if (t >= JUGGLE_SOLO_TOUCHES * JUGGLE_TOUCH) { const k2 = t - JUGGLE_SOLO_TOUCHES * JUGGLE_TOUCH; out.x = fx; out.z = fz; out.y = a.y + .2 + .1 * Math.max(0, 1 - k2 * 5) * Math.abs(Math.sin(k2 * 14)); return out; }
  const u = clamp01((t - j * JUGGLE_TOUCH) / JUGGLE_TOUCH), here = CONTACT_Y[SOLO_KINDS[j]], next = j + 1 < JUGGLE_SOLO_TOUCHES ? CONTACT_Y[SOLO_KINDS[j + 1]] : .2;
  out.x = fx + .05 * Math.sin(t * 9); out.z = fz; out.y = a.y + here + (next - here) * u + .85 * 4 * u * (1 - u);
  act.juggle = t / JUGGLE_TOUCH; act.juggleTouch = SOLO_KINDS[j]; act.side = j % 2 === 0 ? 1 : -1; out.contacts = j + 1; out.contactAt = JUGGLE_LEAD + j * JUGGLE_TOUCH;
  return out;
}
