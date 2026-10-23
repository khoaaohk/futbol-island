// Remote pose interpolation: 8-slot ring per member (preallocated), Hermite between snapshots, render delayMs in the
// past, extrapolate at most extrapolateMs then ease to a stop. A Warp flag or a >25 m jump fades out/in over 300 ms.
// sample() allocates nothing. Positions are metres, yaw radians (wire yaw256 * 2pi/256), speed m/s.
import { activityOf, type MemberId, type Mode, type PoseBody, type Zone } from '../../multiplayer/protocol';

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

const SLOTS = 8; // live feel: 10 Hz snapshots behind a delay of up to 500 ms need ~7 (was 4 at 5 Hz)
const F = 9; // floats per slot: t, x, y, z, yaw(rad), speed, mode, zone, flags
const FADE_HALF_MS = 150;
const JUMP_M = 25;
const TAU = Math.PI * 2;

type Ring = { d: Float64Array; cut: Uint8Array; n: number; head: number };

export function createInterp(opts?: { delayMs?: number; extrapolateMs?: number }): Interp {
  let delay = opts?.delayMs ?? 250;
  const cap = opts?.extrapolateMs ?? 250;
  const rings = new Map<MemberId, Ring>();

  const ci = (r: Ring, k: number): number => (r.head - r.n + k + SLOTS * 2) % SLOTS; // k = 0 is the oldest
  const at = (r: Ring, k: number): number => ci(r, k) * F;

  function push(id: MemberId, body: PoseBody, recvMs: number): void {
    let r = rings.get(id);
    if (!r) { r = { d: new Float64Array(SLOTS * F), cut: new Uint8Array(SLOTS), n: 0, head: 0 }; rings.set(id, r); }
    const x = body[0] / 10, y = body[1] / 10, z = body[2] / 10;
    let cut = r.n === 0 || (body[7] & 1) !== 0 ? 1 : 0;
    if (r.n > 0) {
      const last = at(r, r.n - 1);
      if (recvMs < r.d[last]) return; // out of order
      const dx = x - r.d[last + 1], dz = z - r.d[last + 3];
      if (dx * dx + dz * dz > JUMP_M * JUMP_M) cut = 1;
      if (recvMs === r.d[last]) { r.n--; r.head = (r.head + SLOTS - 1) % SLOTS; } // same instant: replace newest
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
    const rt = renderMs - delay;
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
    if (a === r.n - 1) { // extrapolate, velocity easing to zero across the cap
      const dt = rt - r.d[sa];
      let vx = 0, vy = 0, vz = 0;
      if (a >= 1 && !r.cut[ci(r, a)]) {
        const sp = at(r, a - 1);
        const span = r.d[sa] - r.d[sp];
        if (span > 0) { vx = (r.d[sa + 1] - r.d[sp + 1]) / span; vy = (r.d[sa + 2] - r.d[sp + 2]) / span; vz = (r.d[sa + 3] - r.d[sp + 3]) / span; }
      }
      const e = Math.min(dt, cap);
      const disp = e - (e * e) / (2 * cap);
      put(out, r, sa, r.d[sa + 1] + vx * disp, r.d[sa + 2] + vy * disp, r.d[sa + 3] + vz * disp, r.d[sa + 4]);
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
    put(out, r, sa, px, py, pz, angLerp(r.d[sa + 4], r.d[sb + 4], u));
    out.speed = r.d[sa + 5] + (r.d[sb + 5] - r.d[sa + 5]) * u;
    return true;
  }

  return { push, sample, drop: (id) => { rings.delete(id); }, setDelay: (ms) => { if (ms > 0 && ms < 2000) delay = ms; } };
}
