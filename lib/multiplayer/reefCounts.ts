// Reef counts (Nov 21 2026, docs/multiplayer-rooms-design.md Phase 5 "public-island count"): the latest S.Reef from the relay
// (Cap.Reef, world only): how many OTHER players of my public world are in each shared reef (rooms 41..47), counts only, never an id,
// name or spot. The relay already leaves me out and anyone held apart from me, and counts party-style friends of the same world too.
// Kept only while the page's connection is a live public world; a party, "Just me", a drop or an older relay (no Cap.Reef: no S.Reef)
// leaves every count at 0, so the dive flag falls back to the roster count (townBridge takes the larger of the two). Heat: no timer,
// no polling; subscribers hear only a real change (the relay sends at most once a second, and only when a count changed).
import { S, RoomCode, REEF_AREAS, type ServerMsg } from '../../multiplayer/protocol';

type ReefConn = { readonly kind: 'party' | 'world' | null; readonly status: string; onMessage(fn: (m: ServerMsg) => void): () => void; onStatus(fn: () => void): () => void };

const counts = new Array<number>(REEF_AREAS).fill(0);
const subs = new Set<() => void>();
const emit = () => { for (const f of Array.from(subs)) { try { f(); } catch { /* a listener must not break the socket */ } } };
/** Copy `next` (missing entries = 0; extra entries a later relay may add are ignored) and tell subscribers only on a change. */
const put = (next: readonly number[] | null) => {
  let changed = false;
  for (let i = 0; i < REEF_AREAS; i++) { const n = next && Number.isInteger(next[i]) && next[i] > 0 ? next[i] : 0; if (n !== counts[i]) { counts[i] = n; changed = true; } }
  if (changed) emit();
};

/** The island (Town) attaches the page's one connection. Returns the detach (which zeroes the counts). */
export function attachReefCounts(c: ReefConn): () => void {
  const live = () => c.kind === 'world' && c.status === 'live';
  const offMsg = c.onMessage((m) => { if (m[0] === S.Reef) put(live() ? m[1] : null); });
  const offStatus = c.onStatus(() => { if (!live()) put(null); });
  if (!live()) put(null);
  return () => { offMsg(); offStatus(); put(null); };
}

export const reefCounts = {
  /** Other players in reef room `room` (41..47) by the relay's count; 0 for any other room, outside a live world or an older relay. */
  get(room: number): number { const i = room - RoomCode.Reef - 1; return i >= 0 && i < REEF_AREAS ? counts[i] : 0; },
  subscribe(fn: () => void) { subs.add(fn); return () => { subs.delete(fn); }; },
};

/** The flag's count: the larger of the roster count (party friends, or same-room strangers I can see) and the relay's public count.
 *  Never a sum: on a public world the relay's count already includes everyone the roster shows, and neither counts me. */
export function reefFlagCount(rosterN: number, publicN: number): number { return Math.max(rosterN | 0, publicN | 0, 0); }
