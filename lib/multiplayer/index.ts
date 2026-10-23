// Public entry for lib/multiplayer. Poses bypass the React store: they go to onPoses listeners (feed them to interp.push).
import { S, LIVE_POSE_STRIDE, LIVE_BALL_STRIDE, type MemberId, type PoseBody, type ServerMsg } from '../../multiplayer/protocol';
import { liveClock } from './liveClock';
import type { PartyConnection } from './connection';
import { partyStore } from './store';

export * from './config';
export * from './connection';
export * from './store';
export * from './interp';
export * from './look';
export * from './names';
export * from './nick';
export * from './liveClock';

export type PoseListener = (id: MemberId, body: PoseBody, recvMs: number) => void;
const poseSubs = new Set<PoseListener>();

/** Live feel: a friend's ball (state = BallState; metres; tMs on the same timeline as the poses). Relay v1.2 only. */
export type BallListener = (id: MemberId, state: number, x: number, y: number, z: number, tMs: number) => void;
const ballSubs = new Set<BallListener>();
export function onBalls(fn: BallListener): () => void {
  ballSubs.add(fn);
  return () => { ballSubs.delete(fn); };
}

/** Subscribe to remote poses (one call per member per Poses message). Never touches React state. */
export function onPoses(fn: PoseListener): () => void {
  poseSubs.add(fn);
  return () => { poseSubs.delete(fn); };
}

/**
 * Wire a connection to the store and to onPoses listeners. Returns an unbind function.
 * `now` is the clock used for recvMs (same base as interp.sample's renderMs).
 */
const bound = new WeakMap<PartyConnection, { n: number; off: () => void }>();
export function bindConnection(conn: PartyConnection, now: () => number = () => performance.now()): () => void {
  // Idempotent per connection (townBridge and PartyHost both bind): one real subscription, reference counted.
  const had = bound.get(conn);
  const rec = had ?? { n: 0, off: bindOnce(conn, now) };
  if (!had) bound.set(conn, rec);
  rec.n++;
  let done = false;
  return () => { if (done) return; done = true; if (--rec.n === 0) { rec.off(); bound.delete(conn); } };
}

function bindOnce(conn: PartyConnection, now: () => number): () => void {
  const offMsg = conn.onMessage((m) => {
    if (m[0] === S.Live) {
      // Relay v1.2: every snapshot on the sender's timeline (liveClock); the store sees the same poses as an S.Poses would carry.
      const t = now(), st = m[1], ps = m[2], bs = m[3];
      const legacy: number[] = [S.Poses, 0];
      for (let i = 0; i + LIVE_POSE_STRIDE <= ps.length; i += LIVE_POSE_STRIDE) {
        const body = [ps[i + 1], ps[i + 2], ps[i + 3], ps[i + 4], ps[i + 5], ps[i + 6], ps[i + 7], ps[i + 8]] as PoseBody;
        const at = liveClock.map(st, ps[i + 9], t);
        for (const f of Array.from(poseSubs)) f(ps[i], body, at);
        legacy.push(ps[i], ...body);
      }
      for (let i = 0; i + LIVE_BALL_STRIDE <= bs.length; i += LIVE_BALL_STRIDE) {
        const at = liveClock.map(st, bs[i + 5], t);
        for (const f of Array.from(ballSubs)) f(bs[i], bs[i + 1], bs[i + 2] / 10, bs[i + 3] / 10, bs[i + 4] / 10, at);
      }
      if (legacy.length > 2) partyStore.apply(legacy as unknown as ServerMsg, t);
      return;
    }
    if (m[0] === S.Welcome) liveClock.reset(); // a (re)connect: the next relay may be an old one
    if (m[0] === S.Poses) {
      const t = now();
      if (poseSubs.size) {
        for (let i = 2; i + 8 < m.length; i += 9) {
          const body = [m[i + 1], m[i + 2], m[i + 3], m[i + 4], m[i + 5], m[i + 6], m[i + 7], m[i + 8]] as PoseBody;
          for (const f of Array.from(poseSubs)) f(m[i] as number, body, t);
        }
      }
      // The store keeps only zone / away / presence per member and emits only when one flips (the party list's activity line).
      partyStore.apply(m, t);
      return;
    }
    partyStore.apply(m, now());
  });
  const offStatus = conn.onStatus((s) => partyStore.setStatus(s, conn.code));
  partyStore.setStatus(conn.status, conn.code);
  // Party rejoin: tab ownership and a lapsed slot (set before the status they come with, so the UI reads both together).
  const hasLocal = typeof conn.onLocal === 'function'; // a test double may not have it
  const offLocal = hasLocal ? conn.onLocal(() => partyStore.setLocal(conn.tab ?? null, !!conn.lapsed)) : () => {};
  if (hasLocal) partyStore.setLocal(conn.tab ?? null, !!conn.lapsed);
  const health = () => ({ rttMs: conn.rttMs ?? null, reconnects: conn.reconnects ?? 0 });
  partyStore.setHealthSource(health);
  return () => { offMsg(); offStatus(); offLocal(); partyStore.setHealthSource(null); };
}
