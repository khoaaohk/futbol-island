// Map dots (Nov 13 2026; owner saw "2 on now" + "Nobody near you" and could not find the other player): the latest S.Map from the relay
// (Cap.Map, world only): the OTHER players on the open island as coarse 25 m cells with a count, never an id, name or exact spot.
// Kept only while the page's connection is a live public world; a party, "Just me", a drop or an older relay (no Cap.Map: no S.Map)
// leaves it empty, so nothing is drawn. Heat: no timer, no polling; subscribers hear only a real change (the relay sends every 5 s at
// most, and only when the cells changed).
import { S, type MapCell, type ServerMsg } from '../../multiplayer/protocol';

type MapConn = { readonly kind: 'party' | 'world' | null; readonly status: string; onMessage(fn: (m: ServerMsg) => void): () => void; onStatus(fn: () => void): () => void };

const NONE: readonly MapCell[] = [];
let cells: readonly MapCell[] = NONE;
const subs = new Set<() => void>();
const emit = () => { for (const f of Array.from(subs)) { try { f(); } catch { /* a listener must not break the socket */ } } };
const same = (a: readonly MapCell[], b: readonly MapCell[]) => a.length === b.length && a.every((c, i) => c[0] === b[i][0] && c[1] === b[i][1] && c[2] === b[i][2]);
const put = (next: readonly MapCell[]) => { if (same(next, cells)) return; cells = next.length ? next : NONE; emit(); };

/** The island (Town) attaches the page's one connection. Returns the detach (which clears the cells). */
export function attachMapDots(c: MapConn): () => void {
  const live = () => c.kind === 'world' && c.status === 'live';
  const offMsg = c.onMessage((m) => {
    if (m[0] !== S.Map) return;
    put(live() ? m[1].map((x) => [x[0], x[1], x[2]] as MapCell) : NONE);
  });
  const offStatus = c.onStatus(() => { if (!live()) put(NONE); });
  if (!live()) put(NONE);
  return () => { offMsg(); offStatus(); put(NONE); };
}

export const mapDots = {
  /** The latest cells ([] = none: not in a live world, an older relay, or nobody else on the open island). Stable between changes. */
  get: (): readonly MapCell[] => cells,
  subscribe(fn: () => void) { subs.add(fn); return () => { subs.delete(fn); }; },
};
