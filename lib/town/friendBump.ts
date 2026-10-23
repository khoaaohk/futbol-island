// Friend bumps (owner, Oct 23 2026: a kid-friendly animation when two party friends run into each other: both flying, both walking /
// running, both on a bike / scooter / moped, and the local player bumping a friend). docs/multiplayer-friend-bumps.md.
// Pure data + math, no three.js. Purely VISUAL and local to each screen: no protocol change, no gameplay effect. A bump never moves
// anyone's real position or takes control; each screen detects it from the poses it already draws and plays a short cosmetic overlay
// (squash + step back for walkers, handlebar wobble + skid for rides, spin-away tumble for flyers) plus a "Oof!" / "Bonk!" bubble.
// Heat: O(n^2) over at most BUMP_BODIES (7) bodies a frame, early-outs on the mode family / height / distance, and NO allocation per frame
// (the pair table is fixed typed arrays, bodies / hits / reactions are reused objects).
import {Mode} from '../../multiplayer/protocol/types';

/** Mode families: only the same family bumps (walkers with walkers, rides with rides, flyers with flyers). 0 = never bumps. */
export const FAM = {None: 0, Walk: 1, Ride: 2, Fly: 3} as const;
/** A body's own reaction (picked from its own mode, so a bike and a scooter each do their own wobble). */
export const KIND = {Walk: 1, Ride: 2, Fly: 3} as const;
export const BUMP = {
  /** Horizontal contact distance (m) between the two bodies' centres, the re-arm distance (they must part this far before another bump), */
  touch: 1.2, rearm: 1.7,
  /** max height gap (m): flyers 1.5 m, ground bodies 0.8 m (a friend on a roof above you is not a bump), */
  flyDy: 1.5, groundDy: .8,
  /** closing speed (m/s) needed (two friends standing close never bonk), the per-pair cooldown (s), the short "were apart" gap (s). */
  minClose: .5, cooldown: 2.5, apartGap: .2,
  /** Reaction lengths (s) by kind. */
  walkS: .7, rideS: .8, flyS: 1.0,
} as const;
/** At most this many bodies are tested (the local player + the shown friend rigs: rig cap 5 on most phones, 8 in the batch). */
export const BUMP_BODIES = 9;
/** Pair cooldown slots (fixed): a free / stale slot is reused, the oldest one evicted when all are busy. */
export const BUMP_PAIRS = 24;

export function bumpFamily(mode: number): number {
  return mode === Mode.Walk || mode === Mode.Run || mode === Mode.Idle ? FAM.Walk
    : mode === Mode.Bike || mode === Mode.Scooter || mode === Mode.Moped ? FAM.Ride
    : mode === Mode.Jetpack ? FAM.Fly : FAM.None;
}

/** One body's cosmetic reaction (reused; one per friend entry + one for the local player). */
export interface BumpReact {
  on: boolean; age: number; dur: number; kind: number;
  /** Unit direction (world XZ) AWAY from the other body; side = spin direction (+1 / -1); power 0.6..1 from the closing speed. */
  nx: number; nz: number; side: number; power: number;
  /** The yaw offset the overlay put on a rig root last frame (undone before the next frame: a far friend's rig is not re-posed every frame). */
  yawOn: number;
}
export const createBumpReact = (): BumpReact => ({on: false, age: 0, dur: 0, kind: 0, nx: 0, nz: 1, side: 1, power: 1, yawOn: 0});

/** A body for this frame's test (filled by the caller into a reused array). vx / vz = its velocity (m/s). */
export interface BumpBody {id: number; x: number; y: number; z: number; vx: number; vz: number; fam: number; mode: number; react: BumpReact}
export const createBumpBody = (): BumpBody => ({id: 0, x: 0, y: 0, z: 0, vx: 0, vz: 0, fam: 0, mode: 0, react: createBumpReact()});
/** A bump this frame: the two body indices, the midpoint (for the bubble) and the closing speed. */
export interface BumpHit {a: number; b: number; x: number; y: number; z: number; close: number; kind: number}
export const createBumpHit = (): BumpHit => ({a: 0, b: 0, x: 0, y: 0, z: 0, close: 0, kind: 0});

export interface BumpDetector {
  clock: number;
  /** Pair table: ids (lo < hi; -1 = the local player), the last time they were within `rearm`, the cooldown end; used = -1 free. */
  lo: Int16Array; hi: Int16Array; near: Float64Array; until: Float64Array; used: Uint8Array;
  /** armed = they have been apart (outside `rearm`) since their last bump. */
  armed: Uint8Array;
  hits: BumpHit[]; hitN: number; fired: number;
}
export function createBumpDetector(): BumpDetector {
  const hits: BumpHit[] = [];
  for (let i = 0; i < BUMP_BODIES; i++) hits.push(createBumpHit());
  return {clock: 0, lo: new Int16Array(BUMP_PAIRS), hi: new Int16Array(BUMP_PAIRS), near: new Float64Array(BUMP_PAIRS), until: new Float64Array(BUMP_PAIRS), used: new Uint8Array(BUMP_PAIRS), armed: new Uint8Array(BUMP_PAIRS), hits, hitN: 0, fired: 0};
}
function findPair(d: BumpDetector, lo: number, hi: number): number {
  for (let i = 0; i < BUMP_PAIRS; i++) if (d.used[i] && d.lo[i] === lo && d.hi[i] === hi) return i;
  return -1;
}
function claimPair(d: BumpDetector, lo: number, hi: number): number {
  let best = 0, bestNear = Infinity;
  for (let i = 0; i < BUMP_PAIRS; i++) {
    if (!d.used[i]) { best = i; break; }
    // stale = cooled down and apart a while: as good as free; otherwise evict the one seen together longest ago
    const n = d.clock >= d.until[i] && d.clock - d.near[i] > BUMP.apartGap ? -Infinity : d.near[i];
    if (n < bestNear) { bestNear = n; best = i; }
  }
  d.used[best] = 1; d.lo[best] = lo; d.hi[best] = hi; return best;
}
/** Forget pairs (party over / a friend left): cheap, no allocation. */
export function resetBumps(d: BumpDetector) { d.used.fill(0); d.hitN = 0; }

/**
 * Tests every pair of the first `n` bodies (same family, height gap, horizontal touch, closing, armed, cooled down) and starts both
 * reactions on a bump. Returns the number of hits written to d.hits (at most BUMP_BODIES a frame). No allocation.
 */
export function detectBumps(d: BumpDetector, bodies: readonly BumpBody[], n: number, dt: number): number {
  d.clock += dt; d.hitN = 0;
  if (n > BUMP_BODIES) n = BUMP_BODIES;
  const R2 = BUMP.touch * BUMP.touch, A2 = BUMP.rearm * BUMP.rearm;
  for (let i = 0; i < n; i++) {
    const a = bodies[i];
    if (a.fam === FAM.None) continue;
    for (let j = i + 1; j < n; j++) {
      const b = bodies[j];
      if (b.fam !== a.fam) continue;
      const dy = a.y - b.y;
      if ((dy < 0 ? -dy : dy) > (a.fam === FAM.Fly ? BUMP.flyDy : BUMP.groundDy)) continue;
      const dx = a.x - b.x, dz = a.z - b.z, h2 = dx * dx + dz * dz;
      if (h2 >= A2) continue; // far apart: nothing to track (the pair re-arms through `near` going stale)
      const lo = a.id < b.id ? a.id : b.id, hi = a.id < b.id ? b.id : a.id;
      let p = findPair(d, lo, hi);
      if (p >= 0) { if (d.clock - dt - d.near[p] > BUMP.apartGap) d.armed[p] = 1; d.near[p] = d.clock; }
      if (h2 >= R2) continue;
      if (p >= 0 && (!d.armed[p] || d.clock < d.until[p])) { d.armed[p] = 0; continue; } // a touch in the cooldown uses up the arm
      // closing speed along the line between them (a -> b): both bodies' velocities
      const h = Math.sqrt(h2), ux = h > 1e-4 ? -dx / h : 0, uz = h > 1e-4 ? -dz / h : 1;
      const close = (a.vx - b.vx) * ux + (a.vz - b.vz) * uz;
      if (close < BUMP.minClose) continue;
      if (p < 0) p = claimPair(d, lo, hi);
      d.near[p] = d.clock; d.until[p] = d.clock + BUMP.cooldown; d.armed[p] = 0;
      const power = Math.min(1, .6 + close * .1);
      // spin direction: which side the other one came from (relative velocity across the line)
      const across = (a.vx - b.vx) * -uz + (a.vz - b.vz) * ux, side = across >= 0 ? 1 : -1;
      startBump(a.react, a.mode, -ux, -uz, side, power);
      startBump(b.react, b.mode, ux, uz, -side, power);
      if (d.hitN < d.hits.length) {
        const o = d.hits[d.hitN++];
        o.a = i; o.b = j; o.x = (a.x + b.x) / 2; o.y = (a.y + b.y) / 2; o.z = (a.z + b.z) / 2; o.close = close; o.kind = a.fam;
      }
      d.fired++;
    }
  }
  return d.hitN;
}

export function kindForMode(mode: number): number {
  const f = bumpFamily(mode);
  return f === FAM.Ride ? KIND.Ride : f === FAM.Fly ? KIND.Fly : KIND.Walk;
}
export function startBump(r: BumpReact, mode: number, nx: number, nz: number, side: number, power: number) {
  r.on = true; r.age = 0; r.kind = kindForMode(mode); r.dur = r.kind === KIND.Fly ? BUMP.flyS : r.kind === KIND.Ride ? BUMP.rideS : BUMP.walkS;
  r.nx = nx; r.nz = nz; r.side = side; r.power = power;
}
export function stepBump(r: BumpReact, dt: number) {
  if (!r.on) return;
  r.age += dt; if (r.age >= r.dur) { r.on = false; r.age = 0; }
}

/** The overlay at this instant: back (m along n, away from the other), lift (m), squash (y scale), bulge (x / z scale), yaw / roll (rad). */
export interface BumpPose {back: number; lift: number; squash: number; bulge: number; yaw: number; roll: number}
export const createBumpPose = (): BumpPose => ({back: 0, lift: 0, squash: 1, bulge: 1, yaw: 0, roll: 0});
/**
 * Writes the cosmetic overlay. Every curve starts AND ends at rest (the body is back exactly on its real pose at the end). Rides: yaw +
 * roll only about the tyre line (both contact points stay on the ground, commit 5549550c) and a short back skid, no squash or lift.
 * Reduced motion: no motion at all (the caller shows only a tiny sparkle).
 */
export function bumpPose(r: BumpReact, reduced: boolean, out: BumpPose): BumpPose {
  out.back = 0; out.lift = 0; out.squash = 1; out.bulge = 1; out.yaw = 0; out.roll = 0;
  if (!r.on || reduced || r.dur <= 0) return out;
  const t = Math.min(1, r.age / r.dur), bell = Math.sin(Math.PI * t), fade = (1 - t) * (1 - t), p = r.power;
  if (r.kind === KIND.Walk) {
    // a quick squash on contact, a bouncy recover, a small step back and a wobble
    const hit = t < .18 ? t / .18 : Math.max(0, 1 - (t - .18) / .3);
    out.squash = 1 - .14 * p * hit + .05 * p * Math.sin(t * 20) * fade * (t > .18 ? 1 : 0);
    out.bulge = 1 + .07 * p * hit;
    out.back = .22 * p * bell;
    out.roll = .13 * p * r.side * Math.sin(t * 17) * fade;
  } else if (r.kind === KIND.Ride) {
    // handlebar wobble (fast yaw wiggle) + lean wobble + a brief rear skid
    out.yaw = r.side * p * (.16 * Math.sin(t * 24) * fade + .22 * bell * (1 - t));
    out.roll = -r.side * .07 * p * Math.sin(t * 15) * fade;
    out.back = .14 * p * bell;
  } else {
    // flyers: a spin-away (one full turn, eased, ends where it began), a tumble that recovers, drift apart and a little bob
    const e = 1 - (1 - t) * (1 - t) * (1 - t);
    out.yaw = r.side * Math.PI * 2 * e;
    out.roll = r.side * .55 * p * bell * (1 - t * .5);
    out.back = .6 * p * bell;
    out.lift = .18 * p * bell;
  }
  return out;
}
