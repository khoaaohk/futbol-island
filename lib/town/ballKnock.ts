// Ball knock-overs between party friends (owner, Oct 23 2026; relay v1.6, Cap.Hit). Pure: no three.js, no DOM.
// The same harmless cartoon tumble the townspeople get from my kicked ball (lib/graphics/ballReactions.ts), shortened for players:
// ~1 s down-and-up, an "Oof!" bubble, nobody hurt, nobody moved. Rules (the relay re-checks them, multiplayer/relay/src/roomCore.ts hit):
// - only a ball moving at least KNOCK.minSpeed (the NPC threshold: ballReactions.hit ignores slower balls) knocks anyone over;
// - the SHOOTER's screen detects its own ball against friends' drawn poses (KNOCK.radius m, body height band), then sends C.Hit;
// - never a friend inside the force field (busy / away), indoors, swimming, flying, riding or fishing: on foot only;
// - a per-friend cooldown and a per-shooter rate limit, so nobody is knocked over again and again.
// Heat: no allocation per call; callers test only while their ball moves fast, against the few shown friends near it.
import { Mode, PoseFlag, Zone } from '../../multiplayer/protocol/types';
import { HIT_PAIR_COOLDOWN_MS, HIT_RATE_MAX, HIT_RATE_WINDOW_MS } from '../../multiplayer/protocol/types';

export const KNOCK = {
  /** m/s: the NPC knock-over threshold (ballReactions.hit returns false below 1). */
  minSpeed: 1,
  /** Horizontal reach (m) from the friend's feet to the ball centre. */
  radius: .55,
  /** Height band (m) over the friend's feet the ball must be in (the NPC test uses the same band). */
  low: -.1, high: 1.9,
  /** A friend's tumble: total seconds, when they are flat, when they start getting up; reduced motion: a small wobble this long. */
  tumbleS: 1.1, flatAt: .22, upAt: .55, reducedS: .6,
  /** Movement input during the tumble skips ahead to the get-up from this age (s): input is never locked longer. */
  inputFreeAt: .35,
  /** Faster than this (m/s) between two samples is a teleport / snap of a friend's ball, never a kick. */
  maxSpeed: 45,
} as const;

/** A pose that may be knocked over: on foot, outside the force field, outdoors, not in the sea. */
export function knockable(mode: number, zone: number, flags = 0): boolean {
  if (zone === Zone.Indoors || zone === Zone.Sea || (flags & PoseFlag.Hidden) !== 0) return false;
  return mode === Mode.Walk || mode === Mode.Run || mode === Mode.Idle;
}

/** Does a ball at bx, by, bz touch a body standing at px, py, pz? */
export function ballTouches(bx: number, by: number, bz: number, px: number, py: number, pz: number, radius: number = KNOCK.radius): boolean {
  if (by < py + KNOCK.low || by > py + KNOCK.high) return false;
  const dx = bx - px, dz = bz - pz;
  return dx * dx + dz * dz <= radius * radius;
}

/** Fast enough to knock someone over (the NPC threshold), and not a teleport. */
export function fastBall(vx: number, vz: number): boolean {
  const s2 = vx * vx + vz * vz;
  return s2 >= KNOCK.minSpeed * KNOCK.minSpeed && s2 <= KNOCK.maxSpeed * KNOCK.maxSpeed;
}

/** Travel direction (atan2(vx, vz)) <-> the wire byte 0..255. */
export function dirToByte(vx: number, vz: number): number {
  const a = Math.atan2(vx, vz); return Math.round(((a < 0 ? a + Math.PI * 2 : a) / (Math.PI * 2)) * 256) & 255;
}
export function byteToDir(b: number): number { return ((b & 255) / 256) * Math.PI * 2; }

/** The shooter's own mirror of the relay's rules (so a refused hit is never even sent): per-victim cooldown and a rate limit. */
export interface KnockGate { allow(victim: number, nowMs: number): boolean; note(victim: number, nowMs: number): void; reset(): void }
export function createKnockGate(pairMs: number = HIT_PAIR_COOLDOWN_MS, rateMax: number = HIT_RATE_MAX, windowMs: number = HIT_RATE_WINDOW_MS): KnockGate {
  const last = new Map<number, number>(), times: number[] = [];
  return {
    allow(victim, nowMs) {
      const t = last.get(victim);
      if (t !== undefined && nowMs - t < pairMs) return false;
      let n = 0; for (let i = 0; i < times.length; i++) if (nowMs - times[i] < windowMs) n++;
      return n < rateMax;
    },
    note(victim, nowMs) {
      last.set(victim, nowMs);
      let w = 0; for (let i = 0; i < times.length; i++) if (nowMs - times[i] < windowMs) times[w++] = times[i];
      times.length = w; times.push(nowMs);
    },
    reset() { last.clear(); times.length = 0; },
  };
}

/** One tumble's state (a friend's avatar or the local player). age < 0 = none. */
export interface Tumble { age: number; dir: number; reduced: boolean }
export const createTumble = (): Tumble => ({ age: -1, dir: 0, reduced: false });
export function startTumble(t: Tumble, dir: number, reduced: boolean): boolean {
  if (t.age >= 0) return false; // already down: never twice in a row
  t.age = 0; t.dir = dir; t.reduced = reduced; return true;
}
export function tumbleOn(t: Tumble): boolean { return t.age >= 0; }
/** Ages the tumble; `moving` = the player is steering: skip ahead to the get-up (never a lock beyond KNOCK.inputFreeAt). */
export function stepTumble(t: Tumble, dt: number, moving = false): void {
  if (t.age < 0) return;
  t.age += dt;
  if (moving && !t.reduced && t.age >= KNOCK.inputFreeAt && t.age < KNOCK.upAt) t.age = KNOCK.upAt;
  if (t.age >= (t.reduced ? KNOCK.reducedS : KNOCK.tumbleS)) t.age = -1;
}
const smooth = (x: number, a: number, b: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
/** The overlay at this age, in the BODY's frame (facing = the rig's yaw): pitch (forward, rad) and roll (rad); reduced = a small wobble. */
export function tumblePose(t: Tumble, facing: number, out: { pitch: number; roll: number; fall: number }): { pitch: number; roll: number; fall: number } {
  out.pitch = 0; out.roll = 0; out.fall = 0;
  if (t.age < 0) return out;
  if (t.reduced) { const k = 1 - t.age / KNOCK.reducedS; out.roll = Math.sin(t.age * 16) * .09 * Math.max(0, k); return out; }
  // the NPC curve (ballReactions fall), shortened: down fast, a beat flat, then back up with a little wobble
  const down = t.age < KNOCK.upAt ? smooth(t.age, 0, KNOCK.flatAt) : 1 - smooth(t.age, KNOCK.upAt, KNOCK.tumbleS - .12);
  const a = t.dir - facing, fall = down * 1.4;
  out.fall = down; out.pitch = Math.cos(a) * fall; out.roll = -Math.sin(a) * fall;
  if (t.age > KNOCK.tumbleS - .2) out.roll += Math.sin(t.age * 30) * .06; // the little "I'm fine!" wobble
  return out;
}
/** The bubble words: one per knock, cycling (no Math.random: every screen shows the same for the same dir byte). */
export const KNOCK_WORDS = ['Oof!', 'Whoops!', 'Bonk!', 'Oops!'] as const;
export const knockWord = (dirByte: number): string => KNOCK_WORDS[(dirByte >> 3) % KNOCK_WORDS.length];
