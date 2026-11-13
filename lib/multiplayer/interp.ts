// Remote pose interpolation: 24-slot ring per member (preallocated), Hermite between snapshots, render delayMs in the
// past, extrapolate at most extrapolateMs then ease to a stop and glide back onto the last real pose (a quiet stream
// must never leave the avatar parked somewhere the sender never was). A Warp flag or a >25 m jump (x, y or z) fades
// out/in over 300 ms. The drawn y never sinks more than Y_SINK_M below the poses it comes from (landings, warps).
// sample() allocates nothing. Positions are metres, yaw radians (wire yaw256 * 2pi/256), speed m/s.
import { MAX_SPEED_MS, Mode as M, Zone as Z, activityOf, type MemberId, type Mode, type PoseBody, type Zone } from '../../multiplayer/protocol';

/** flags: the pose flags of the newest snapshot at or before the render time (Hidden = away; design 4.4.1). Optional for old callers. */
export type RemotePose = { x: number; y: number; z: number; yaw: number; speed: number; mode: Mode; zone: Zone; fade: number; flags?: number;
  /** The Activity a Busy pose carries in its speed byte (0 otherwise). */
  activity?: number };
export interface Interp {
  push(id: MemberId, body: PoseBody, recvMs: number): void;
  /** renderMs is the current clock (same base as recvMs); the delay is subtracted inside. */
  sample(id: MemberId, renderMs: number, out: RemotePose): boolean;
  drop(id: MemberId): void;
  /** Live feel: the render delay (ms) from now on (lib/multiplayer/liveClock.ts picks it). */
  setDelay(ms: number): void;
}

// live feel: 10 Hz snapshots behind a delay of up to 500 ms need ~7, but a beacon-tier member that comes near is still drawn up to
// BEACON_DELAY_MAX_MS behind while its stream is already 10 Hz: 8 slots (0.8 s) fell off the ring there (one 59 m frame, live QA Nov 12)
const SLOTS = 24;
const F = 9; // floats per slot: t, x, y, z, yaw(rad), speed, mode, zone, flags
const FADE_HALF_MS = 150;
const JUMP_M = 25;
const RETURN_MS = 300; // after the extrapolation cap: ease the extrapolated offset back to zero over this long
// Extrapolation velocity (live QA round 4, Nov 12 2026): a flat 30 m/s cut froze every jetpack flyer (cruise 29-34 m/s plus jitter).
// The velocity is now measured over at least VEL_SPAN_MS (back through un-cut slots), so a ±30 ms receive jitter on a 10 Hz stream
// cannot spike it, and only a velocity well above what the relay itself lets that mode move (MAX_SPEED_MS * 1.5, plus the sender's
// 1 m-per-pose slack) counts as a catch-up leap and is not extrapolated. Warps / >25 m jumps are cut marks and never extrapolate.
const VEL_SPAN_MS = 180;
const EXTRAP_SLACK_MPS = 12;
const extrapLimit = (mode: number): number => (MAX_SPEED_MS[mode as Mode] ?? 6) * 1.5 + EXTRAP_SLACK_MPS;
const Y_SINK_M = 0.25; // the drawn y may dip at most this far below the lower of the source poses
const TAU = Math.PI * 2;

// Slow streams (live QA rounds 5-6, Nov 12 2026): a sender with nobody within 40 m sends moving poses about every 500 ms, so a far
// jetpack flyer outran the 250 ms extrapolation cap, stalled, then leapt 6-13 m. Each ring keeps a smoothed interval of its MOVING
// snapshots (moved by position, so idle beacons and room poses standing still never count) and the cap stretches to 1.3 x that
// interval (at most 800 ms). Nothing else adapts: the render delay and the snapshot times stay exactly as they were, so a 10 Hz
// stream behaves as before (an adaptive delay + time smoothing tried in 55625b19 stuttered close take-offs and left extra lag).
const IV_CAP = 1.3, IV_CAP_MAX_MS = 800, IV_MAX = 1500, MOVED_M = 0.05;
// The beacon tier (overnight soak Nov 12 2026): on a full island a member outside a watcher's nearest 12 arrives about once a second,
// and no extrapolation can bridge 1 s of jetpack flight (34 m) without overshooting every stop. A slow-stream member is drawn further
// in the past instead (BEACON_K x its moving interval in total), so it is always INTERPOLATED between real snapshots: smooth, about a
// second behind (it is far away and outside the nearest 12). The extra delay moves at most EXTRA_SLEW of real time, so a member that
// comes close catches up within a couple of seconds (slight fast-forward) and 5-10 Hz streams never get any.
const BEACON_DELAY_MAX_MS = 1400, EXTRA_SLEW = 0.5;
// Tier transitions (live QA Nov 12 2026, full island): a flyer crossing 40 / 70 / 100 m changes stream rate (10 -> 5 -> 1 Hz and back)
// and popped 6-59 m. Every transition is now continuous in time:
//  - the extra delay is iv * BEACON_K minus the shared delay (continuous in iv: 0 for 5-10 Hz, ~0.9 s at 1 Hz; the old 600 ms
//    threshold flipped it by 0.5 s), and it changes at a smoothed rate (EX_EASE_MS / EXV_TAU_MS, at most EXTRA_SLEW) both ways;
//  - a shrinking extra delay never takes the render time past the newest snapshot (it pauses there instead of extrapolating);
//  - a starved fast mover (the first 1 s gap on leaving the nearest 12, before iv knows it) brakes the render time smoothly
//    (rate 1 -> BRAKE_FLOOR as it runs BRAKE_E_MS past the newest snapshot, never more than LIN_MS) instead of extrapolating to the
//    cap, gliding back and leaping 20 m when the late snapshot lands; the brake lets go when the stream is really quiet (a stop);
//  - its extrapolation is linear for LIN_MS (the brake keeps it there), so the hand-over to the late snapshot is seamless.
const BEACON_K = 1.15, EX_EASE_MS = 300, EXV_TAU_MS = 250;
const BRAKE_MPS = 8, BRAKE_E_MS = 120, BRAKE_FLOOR = 0.15, LIN_MS = 300, BRAKE_RELEASE_MS = 1200;

// Coming into sight (local harness, Nov 13 2026: real RoomCore + this interp, a 32 m/s flyer leaving 160 m and coming back on the
// 1 Hz beacon): the S.Joined / Welcome roster pose has no timestamp, so it was stamped on ARRIVAL (100-250 ms later than the
// sender-timeline stamps of S.Live): the next real snapshot then looked like a 60+ m/s leap (no extrapolation: a 0.8 s freeze, then
// a 6 m step), or, alone, it sat still for a whole second and then leapt 20-33 m. Now a MOVING roster pose is never pushed
// (seedable(); a still friend still shows at once), and a ring holding one snapshot of a fast mover stays invisible until the second
// one arrives, so the member fades in already on the right (beacon) delay, interpolated between real snapshots.
/** May a roster pose (S.Welcome / S.Joined, no timestamp) seed the interpolator? Only a member standing still (Busy: the speed byte is
 *  the activity; a room pose: it is the room code). */
export const seedable = (body: PoseBody): boolean => body[4] === 0 || body[5] === M.Busy || body[6] === Z.Indoors;

type Ring = { d: Float64Array; cut: Uint8Array; n: number; head: number; iv: number; lastMoved: boolean; ex: number; exv: number; lt: number };

export function createInterp(opts?: { delayMs?: number; extrapolateMs?: number }): Interp {
  let delay = opts?.delayMs ?? 250;
  const capBase = opts?.extrapolateMs ?? 250;
  const rings = new Map<MemberId, Ring>();

  // the slot's real speed (m/s): a Busy pose carries its activity and a room pose (Zone.Indoors) its room code in the speed byte
  const speedAt = (r: Ring, s: number): number => (r.d[s + 6] === M.Busy || r.d[s + 7] === Z.Indoors ? 0 : r.d[s + 5]);
  const ci = (r: Ring, k: number): number => (r.head - r.n + k + SLOTS * 2) % SLOTS; // k = 0 is the oldest
  const at = (r: Ring, k: number): number => ci(r, k) * F;

  function push(id: MemberId, body: PoseBody, recvMs: number): void {
    let r = rings.get(id);
    if (!r) { r = { d: new Float64Array(SLOTS * F), cut: new Uint8Array(SLOTS), n: 0, head: 0, iv: 0, lastMoved: false, ex: 0, exv: 0, lt: -1 }; rings.set(id, r); }
    const x = body[0] / 10, y = body[1] / 10, z = body[2] / 10;
    let cut = r.n === 0 || (body[7] & 1) !== 0 ? 1 : 0;
    if (r.n > 0) {
      const last = at(r, r.n - 1);
      if (recvMs < r.d[last]) return; // out of order
      const dx = x - r.d[last + 1], dy = y - r.d[last + 2], dz = z - r.d[last + 3];
      // a teleport is a move no mode could make in the gap: 25 m, or more for a slow (beacon-tier) stream of a fast mode (1 s of jetpack is 34 m)
      const jumpM = Math.max(JUMP_M, extrapLimit(body[5]) * (recvMs - r.d[last]) / 1000);
      if (dx * dx + dy * dy + dz * dz > jumpM * jumpM) cut = 1;
      const moved = dx * dx + dy * dy + dz * dz > MOVED_M * MOVED_M;
      if (recvMs === r.d[last]) { // same instant: replace newest, but keep its cut mark (a Warp must survive a same-ms retry)
        r.head = (r.head + SLOTS - 1) % SLOTS; r.n--;
        if (r.cut[r.head]) cut = 1;
      } else if (moved && !cut && (r.lastMoved || (r.n === 1 && speedAt(r, last) > 0))) { // a moving gap: this member's stream interval (a slower stream is believed at once; a ring that STARTED on a moving pose counts its first gap, so a 1 Hz member just come into sight is drawn on the beacon delay at once)
        const g = Math.min(IV_MAX, recvMs - r.d[last]);
        r.iv = r.iv === 0 || g > r.iv ? (r.iv === 0 ? g : r.iv + (g - r.iv) * 0.5) : r.iv + (g - r.iv) * 0.2;
      }
      r.lastMoved = moved && !cut;
    }
    const s = r.head * F;
    r.d[s] = recvMs; r.d[s + 1] = x; r.d[s + 2] = y; r.d[s + 3] = z;
    r.d[s + 4] = (body[3] * TAU) / 256; r.d[s + 5] = body[4] * 0.25; r.d[s + 6] = body[5]; r.d[s + 7] = body[6]; r.d[s + 8] = body[7] & ~1;
    r.cut[r.head] = cut;
    r.head = (r.head + 1) % SLOTS;
    if (r.n < SLOTS) r.n++;
  }

  function angLerp(a: number, b: number, u: number): number {
    let d = (b - a) % TAU;
    if (d > Math.PI) d -= TAU; else if (d < -Math.PI) d += TAU;
    const v = (a + d * u) % TAU;
    return v < 0 ? v + TAU : v;
  }

  function put(out: RemotePose, r: Ring, s: number, x: number, y: number, z: number, yaw: number): void {
    out.x = x; out.y = y; out.z = z; out.yaw = yaw; out.speed = r.d[s + 5];
    out.mode = r.d[s + 6] as Mode; out.zone = r.d[s + 7] as Zone; out.flags = r.d[s + 8]; out.activity = activityOf(r.d[s + 6], r.d[s + 5] * 4);
  }

  function sample(id: MemberId, renderMs: number, out: RemotePose): boolean {
    const r = rings.get(id);
    if (!r || r.n === 0) return false;
    const s0 = at(r, 0);
    if (r.n === 1 && speedAt(r, s0) >= BRAKE_MPS) { // one snapshot of a fast mover: no velocity, no interval yet; wait unseen
      put(out, r, s0, r.d[s0 + 1], r.d[s0 + 2], r.d[s0 + 3], r.d[s0 + 4]);
      out.fade = 0; r.lt = -1; // the second snapshot starts the extra delay at its target (no ease from 0)
      return true;
    }
    const exMax = Math.max(0, BEACON_DELAY_MAX_MS - delay);
    const want = Math.max(0, Math.min(exMax, r.iv * BEACON_K - delay));
    const sw = at(r, r.n - 1), tn = r.d[sw], base = renderMs - delay;
    const fast = !r.cut[ci(r, r.n - 1)] && speedAt(r, sw) >= BRAKE_MPS; // the newest pose is a fast mover
    if (r.lt < 0 || r.n < 2) { r.ex = want; r.exv = 0; }
    else {
      const dt = Math.max(0, Math.min(100, renderMs - r.lt));
      if (dt > 0) {
        const g = Math.max(-EXTRA_SLEW, Math.min(EXTRA_SLEW, (want - r.ex) / EX_EASE_MS));
        r.exv += (g - r.exv) * Math.min(1, dt / EXV_TAU_MS);
        let ex = r.ex + r.exv * dt;
        if (ex < r.ex && base - ex > tn) ex = Math.max(ex, Math.min(r.ex, base - tn)); // shrinking: never past the newest snapshot
        const over = base - ex - tn;
        if (fast && over > 0 && renderMs - tn < BRAKE_RELEASE_MS + r.iv) { // starved: brake the render time
          const rate = over >= LIN_MS ? 0 : Math.max(BRAKE_FLOOR, 1 - over / BRAKE_E_MS);
          ex = Math.max(ex, r.ex + (1 - rate) * dt);
          if (r.exv < 0) r.exv = 0;
        }
        r.ex = Math.min(ex, Math.max(r.ex, exMax));
      }
    }
    r.lt = renderMs;
    const rt = base - r.ex;
    const cap = r.iv > 0 ? Math.max(capBase, Math.min(IV_CAP_MAX_MS, r.iv * IV_CAP)) : capBase;
    let a = -1; // newest slot with t <= rt
    for (let k = 0; k < r.n; k++) { if (r.d[at(r, k)] <= rt) a = k; else break; }
    // fade windows: 1 -> 0 -> 1 around each cut; the very first slot only fades in (arrival)
    let fade = 1;
    for (let k = 0; k < r.n; k++) {
      if (!r.cut[ci(r, k)]) continue;
      const dd = rt - r.d[at(r, k)];
      const f = k === 0 && dd < 0 ? 0 : Math.min(1, Math.abs(dd) / FADE_HALF_MS);
      if (f < fade) fade = f;
    }
    out.fade = fade;
    if (a < 0) { // before the first snapshot: sit on it, invisible
      const s = at(r, 0);
      put(out, r, s, r.d[s + 1], r.d[s + 2], r.d[s + 3], r.d[s + 4]);
      out.fade = 0;
      return true;
    }
    const sa = at(r, a);
    if (a === r.n - 1) { // extrapolate, velocity easing to zero across the cap, then glide back onto the real pose
      const dt = rt - r.d[sa];
      let vx = 0, vy = 0, vz = 0;
      const lin = fast ? LIN_MS : 0; // a fast mover runs on linearly for LIN_MS (the brake holds it there), then eases as before
      if (a >= 1 && !r.cut[ci(r, a)] && dt < lin + cap + RETURN_MS) {
        let b = a - 1; // the base slot: back through un-cut slots until the span covers VEL_SPAN_MS (a cut slot is a base, never crossed)
        while (b > 0 && !r.cut[ci(r, b)] && r.d[sa] - r.d[at(r, b)] < VEL_SPAN_MS) b--;
        const sp = at(r, b);
        const span = r.d[sa] - r.d[sp];
        if (span > 0) {
          vx = (r.d[sa + 1] - r.d[sp + 1]) / span; vy = (r.d[sa + 2] - r.d[sp + 2]) / span; vz = (r.d[sa + 3] - r.d[sp + 3]) / span;
          const lim = extrapLimit(r.d[sa + 6]);
          if ((vx * vx + vy * vy + vz * vz) * 1e6 > lim * lim) { vx = 0; vy = 0; vz = 0; } // per ms -> m/s
        }
      }
      const e = Math.max(0, Math.min(dt, lin + cap) - lin);
      let disp = Math.min(dt, lin) + e - (e * e) / (2 * cap);
      if (dt > lin + cap) { const w = Math.min(1, (dt - lin - cap) / RETURN_MS); disp *= 1 - w * w * (3 - 2 * w); } // stream quiet: ease back
      const ya = r.d[sa + 2];
      const y = Math.max(ya - Y_SINK_M, ya + vy * disp);
      put(out, r, sa, r.d[sa + 1] + vx * disp, y, r.d[sa + 3] + vz * disp, r.d[sa + 4]);
      return true;
    }
    if (r.cut[ci(r, a + 1)]) { // hold until the cut
      put(out, r, sa, r.d[sa + 1], r.d[sa + 2], r.d[sa + 3], r.d[sa + 4]);
      return true;
    }
    const sb = at(r, a + 1);
    const t0 = r.d[sa], t1 = r.d[sb], h = t1 - t0;
    const u = h > 0 ? (rt - t0) / h : 1;
    const hasPrev = a >= 1 && !r.cut[ci(r, a)];
    const hasNext = a + 2 < r.n && !r.cut[ci(r, a + 2)];
    const sp = hasPrev ? at(r, a - 1) : sa, sn = hasNext ? at(r, a + 2) : sb;
    const u2 = u * u, u3 = u2 * u;
    const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
    let px = 0, py = 0, pz = 0;
    for (let c = 1; c <= 3; c++) {
      const p0 = r.d[sa + c], p1 = r.d[sb + c];
      const sec = (p1 - p0) / h;
      const m0 = hasPrev ? (p1 - r.d[sp + c]) / (t1 - r.d[sp]) : sec;
      const m1 = hasNext ? (r.d[sn + c] - p0) / (r.d[sn] - t0) : sec;
      const v = h00 * p0 + h10 * h * m0 + h01 * p1 + h11 * h * m1;
      if (c === 1) px = v; else if (c === 2) py = v; else pz = v;
    }
    const yFloor = Math.min(r.d[sa + 2], r.d[sb + 2]) - Y_SINK_M; // Hermite overshoot on a landing must not sink the avatar
    if (py < yFloor) py = yFloor;
    put(out, r, sa, px, py, pz, angLerp(r.d[sa + 4], r.d[sb + 4], u));
    out.speed = r.d[sa + 5] + (r.d[sb + 5] - r.d[sa + 5]) * u;
    return true;
  }

  return { push, sample, drop: (id) => { rings.delete(id); }, setDelay: (ms) => { if (ms > 0 && ms < 2000) delay = ms; } };
}
