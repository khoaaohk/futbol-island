// Remote pose interpolation: 8-slot ring per member (preallocated), Hermite between snapshots, render delayMs in the
// past (more for a slow stream: see IV_*), extrapolate at most extrapolateMs (or 1.3 x the member's interval) then ease to a
// stop and glide back onto the last real pose (a quiet stream must never leave the avatar parked somewhere the sender never was).
// A Warp flag or a >25 m jump (x, y or z) fades out/in over 300 ms. The drawn y never sinks more than Y_SINK_M below the poses it comes from (landings, warps).
// sample() allocates nothing. Positions are metres, yaw radians (wire yaw256 * 2pi/256), speed m/s.
import { MAX_SPEED_MS, activityOf, seatedWire, type MemberId, type Mode, type PoseBody, type Zone } from '../../multiplayer/protocol';

/** flags: the pose flags of the newest snapshot at or before the render time (Hidden = away; design 4.4.1). Optional for old callers. */
export type RemotePose = { x: number; y: number; z: number; yaw: number; speed: number; mode: Mode; zone: Zone; fade: number; flags?: number;
  /** The Activity a Busy pose carries in its speed byte (0 otherwise). */
  activity?: number;
  /** Seated in the stadium's stands (multiplayer/protocol/seat.ts): drawn on the seat, never moving. The island runtime also checks the
   *  spot is a real seat (lib/town/stadiumSeatShare.ts) and clears this when it is not. */
  seated?: boolean };
export interface Interp {
  push(id: MemberId, body: PoseBody, recvMs: number): void;
  /** renderMs is the current clock (same base as recvMs); the delay is subtracted inside. */
  sample(id: MemberId, renderMs: number, out: RemotePose): boolean;
  drop(id: MemberId): void;
  /** Live feel: the render delay (ms) from now on (lib/multiplayer/liveClock.ts picks it). */
  setDelay(ms: number): void;
}

const SLOTS = 8; // live feel: 10 Hz snapshots behind a delay of up to 500 ms need ~7 (was 4 at 5 Hz)
const F = 11; // floats per slot: t (draw time), x, y, z, yaw(rad), speed, mode, zone, flags, raw receive time, moved (1 = moved > MOVED_M since the previous snapshot)
const MOVED_M = 0.01; // 'moving' is judged by position, never by the speed byte (in a room pose that byte is the room code)
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
// Per-member stream rate (live QA round 5, Nov 12 2026): a sender with nobody within QUIET_RANGE_M sends moving poses at 2 Hz
// (connection.ts QUIET_MOVE_GAP_MS), and the relay's 5 Hz tick lands them 400-600 ms apart. Behind the ~240 ms live delay with a
// flat 250 ms cap, a far jetpack flyer stalled for ~5 frames then leapt 6-13 m. Each ring now keeps a smoothed interval of its
// MOVING snapshots (moved by position on both ends, no cut; idle 1 Hz poses, room poses standing still and warps never count) and gets
//   its own render delay >= interval + 2 x its jitter (slewed, never a time jump once visible), and a cap that grows by 1.3 x that extra
//   delay (up to 800 ms), so a jitter overrun eases on instead of stopping. A stream the shared delay already covers is unchanged.
const IV_START = 100; // ms: the nominal live interval until a member's own gaps are measured
const IV_MAX = 1000;
const IV_RISE = 0.5, IV_FALL = 0.1; // a slower stream is believed at once, a faster one over ~10 snapshots
const IV_JIT = 0.2; // smoothing of the gaps' mean deviation from the interval (the member's jitter)
const IV_DELAY_JIT = 2; // member delay >= interval + this * jitter (a late snapshot rarely leaves the stream dry)
const IV_DELAY_MAX_MS = 900;
const IV_CAP = 1.3, IV_CAP_MAX_MS = 800;
// Draw-time smoothing: a moving snapshot within half an interval of where the steady stream puts it (previous draw time + interval)
// is drawn TS_PULL of the way toward that spot, so receive jitter does not turn into speed wobble or a backward step.
const TS_PULL = 0.6;
const EXTRA_SLEW = 0.1; // ms per ms: the member's extra delay moves at most 10 % of real time (slight slow-mo / fast-forward)

/** m (a Float64Array, so sample() stores never box a double): [IV] smoothed moving-snapshot interval (ms, 0 = not measured),
 *  [JV] mean |gap - interval| (ms), [EX] extra render delay (ms) on top of the shared one, [LT] last sample time (-1 = none). */
type Ring = { d: Float64Array; cut: Uint8Array; n: number; head: number; m: Float64Array };
const IV = 0, JV = 1, EX = 2, LT = 3;

export function createInterp(opts?: { delayMs?: number; extrapolateMs?: number }): Interp {
  let delay = opts?.delayMs ?? 250;
  const capBase = opts?.extrapolateMs ?? 250;
  const rings = new Map<MemberId, Ring>();

  const ci = (r: Ring, k: number): number => (r.head - r.n + k + SLOTS * 2) % SLOTS; // k = 0 is the oldest
  const at = (r: Ring, k: number): number => ci(r, k) * F;

  function push(id: MemberId, body: PoseBody, recvMs: number): void {
    let r = rings.get(id);
    if (!r) { r = { d: new Float64Array(SLOTS * F), cut: new Uint8Array(SLOTS), n: 0, head: 0, m: new Float64Array([0, 0, 0, -1]) }; rings.set(id, r); }
    const x = body[0] / 10, y = body[1] / 10, z = body[2] / 10;
    let cut = r.n === 0 || (body[7] & 1) !== 0 ? 1 : 0;
    let moved = 0;
    if (r.n > 0) {
      const last = at(r, r.n - 1);
      if (recvMs < r.d[last + 9]) return; // out of order
      const dx = x - r.d[last + 1], dy = y - r.d[last + 2], dz = z - r.d[last + 3];
      if (dx * dx + dy * dy + dz * dz > JUMP_M * JUMP_M) cut = 1;
      if (dx * dx + dy * dy + dz * dz > MOVED_M * MOVED_M) moved = 1;
      if (recvMs === r.d[last + 9]) { // same instant: replace newest, but keep its cut mark (a Warp must survive a same-ms retry)
        r.head = (r.head + SLOTS - 1) % SLOTS; r.n--;
        if (r.cut[r.head]) cut = 1;
      } else if (!cut && moved && r.d[last + 10] > 0) { // a moving gap: learn this member's stream interval
        const g = Math.min(IV_MAX, recvMs - r.d[last + 9]);
        if (r.m[IV] === 0) r.m[IV] = g;
        else { r.m[JV] += (Math.abs(g - r.m[IV]) - r.m[JV]) * IV_JIT; r.m[IV] += (g - r.m[IV]) * (g > r.m[IV] ? IV_RISE : IV_FALL); }
      }
    }
    let t = recvMs;
    if (r.n > 0 && !cut && moved && r.m[IV] > 0) {
      const p = at(r, r.n - 1);
      if (r.d[p + 10] > 0) {
        const pred = r.d[p] + r.m[IV];
        if (Math.abs(recvMs - pred) < r.m[IV] * 0.5) t = recvMs + (pred - recvMs) * TS_PULL;
        if (t <= r.d[p]) t = r.d[p] + 1;
      }
    }
    const s = r.head * F;
    r.d[s] = t; r.d[s + 9] = recvMs; r.d[s + 10] = moved; r.d[s + 1] = x; r.d[s + 2] = y; r.d[s + 3] = z;
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
    out.seated = isSeated(r, s); if (out.seated) out.speed = 0;
  }
  const isSeated = (r: Ring, s: number): boolean => seatedWire(r.d[s + 6], r.d[s + 5] * 4, r.d[s + 7]);

  function sample(id: MemberId, renderMs: number, out: RemotePose): boolean {
    const r = rings.get(id);
    if (!r || r.n === 0) return false;
    // this member's extra delay: toward interval + IV_DELAY_JIT * jitter beyond the shared delay; set at once while it is still arriving (n < 3)
    const iv = r.m[IV] || IV_START;
    const want = Math.max(0, Math.min(IV_DELAY_MAX_MS, iv + IV_DELAY_JIT * r.m[JV]) - delay);
    if (r.m[LT] < 0 || r.n < 3) r.m[EX] = want;
    else { const st = EXTRA_SLEW * Math.max(0, Math.min(100, renderMs - r.m[LT])); r.m[EX] = want > r.m[EX] ? Math.min(want, r.m[EX] + st) : Math.max(want, r.m[EX] - st); }
    r.m[LT] = renderMs;
    const cap = Math.max(capBase, Math.min(IV_CAP_MAX_MS, capBase + IV_CAP * want)); // a stream the shared delay covers keeps capBase
    const rt = renderMs - delay - r.m[EX];
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
    // Seated (stadium stands): exactly on the seat, never extrapolated, and never sliding into or out of it (it pops, as the sitter snaps).
    if (isSeated(r, sa) || (a + 1 < r.n && isSeated(r, at(r, a + 1)))) {
      put(out, r, sa, r.d[sa + 1], r.d[sa + 2], r.d[sa + 3], r.d[sa + 4]);
      return true;
    }
    if (a === r.n - 1) { // extrapolate, velocity easing to zero across the cap, then glide back onto the real pose
      const dt = rt - r.d[sa];
      let vx = 0, vy = 0, vz = 0;
      if (a >= 1 && !r.cut[ci(r, a)] && dt < cap + RETURN_MS) {
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
      const e = Math.min(dt, cap);
      let disp = e - (e * e) / (2 * cap);
      if (dt > cap) { const w = Math.min(1, (dt - cap) / RETURN_MS); disp *= 1 - w * w * (3 - 2 * w); } // stream quiet: ease back
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
