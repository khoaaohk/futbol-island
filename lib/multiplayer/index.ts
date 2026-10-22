// Public entry for lib/multiplayer. Poses bypass the React store: they go to onPoses listeners (feed them to interp.push).
import { S, type MemberId, type PoseBody } from '../../multiplayer/protocol';
import type { PartyConnection } from './connection';
import { partyStore } from './store';

export * from './config';
export * from './connection';
export * from './store';
export * from './interp';
export * from './look';

export type PoseListener = (id: MemberId, body: PoseBody, recvMs: number) => void;
const poseSubs = new Set<PoseListener>();

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
    if (m[0] === S.Poses) {
      if (poseSubs.size === 0) return;
      const t = now();
      for (let i = 2; i + 8 < m.length; i += 9) {
        const body = [m[i + 1], m[i + 2], m[i + 3], m[i + 4], m[i + 5], m[i + 6], m[i + 7], m[i + 8]] as PoseBody;
        for (const f of Array.from(poseSubs)) f(m[i] as number, body, t);
      }
      return;
    }
    partyStore.apply(m, now());
  });
  const offStatus = conn.onStatus((s) => partyStore.setStatus(s, conn.code));
  partyStore.setStatus(conn.status, conn.code);
  return () => { offMsg(); offStatus(); };
}
