// Public island phase 3 (Nov 12 2026; docs/multiplayer/PHASE3-VERIFY.md): three small "the island is alive" things, all per world and
// counts only, inert unless the island is in a public world (publicWorldEnabled() + the people button's "With other players").
//  - Match o'clock: the first MATCH_OCLOCK_MIN minutes of every hour (UTC, so every kid in a world meets at the same moment), one live
//    pitch is the meeting pitch (rotating by the hour through MATCH_OCLOCK_FIELDS). Nothing is scheduled on the relay: the shared live
//    match that already exists (Cap.Match: the first kid on a pitch owns it, the others drop in) does the rest.
//  - The island goal: S.Goal [43, n] = goals this world's kids' teams scored today (relay, Cap.Goal); my team's goal sends C.Goal.
//  - Activity glows: the live pitches where another kid in my world is playing now (the S.Match rosters the relay already sends every
//    Cap.Match member: ids only, no names or positions), plus the Match o'clock pitch while it is on.
// Heat: no timer, no polling. The clock is read from Town's existing frame at most once a second (lifeFrame); the counts arrive on the
// socket. Subscribers hear only real changes. Light on purpose: no three.js, no React, no storage.
import { S, MatchKind, MATCH_FIELDS, ISLAND_GOAL, type ServerMsg } from '../../multiplayer/protocol';
import type { LiveFormat } from '../town/venues';

/** Match o'clock lasts this many minutes from the top of each hour (UTC). */
export const MATCH_OCLOCK_MIN = 10;
/** The meeting pitch, by the hour (UTC hour % length). The big 11v11 pitch is left out (too big to find each other on). */
export const MATCH_OCLOCK_FIELDS: readonly LiveFormat[] = ['7v7', 'beach', 'futsal', '9v9'];
export const ISLAND_GOAL_TARGET = ISLAND_GOAL.target;
const CLOCK_SAMPLE_MS = 1000;

export type MatchClock = { on: boolean; field: LiveFormat; hour: number };
/** Match o'clock at time `ms` (epoch ms): on during the first MATCH_OCLOCK_MIN minutes of the UTC hour; `hour` = the hour's number
 *  (one Match o'clock per hour: the banner's once-per-hour key). */
export function matchOClock(ms: number): MatchClock {
  const hour = Math.floor(ms / 3_600_000);
  const min = Math.floor((ms - hour * 3_600_000) / 60_000);
  return { on: min < MATCH_OCLOCK_MIN, field: MATCH_OCLOCK_FIELDS[((hour % MATCH_OCLOCK_FIELDS.length) + MATCH_OCLOCK_FIELDS.length) % MATCH_OCLOCK_FIELDS.length], hour };
}

type LifeConn = { readonly kind: 'party' | 'world' | null; readonly status: string; onMessage(fn: (m: ServerMsg) => void): () => void; onStatus(fn: () => void): () => void; sendGoal(): boolean };
export type IslandLife = {
  /** Today's island goal count in my world (null = unknown: not in a world, or an older relay). */
  goal: number | null;
  /** Match o'clock now, and its pitch (only meaningful while in a world). */
  clock: MatchClock;
  /** In a live public world right now. */
  inWorld: boolean;
  /** Pitches where another kid in my world plays now. */
  busy: readonly LiveFormat[];
};

let state: IslandLife = { goal: null, clock: matchOClock(0), inWorld: false, busy: [] };
const subs = new Set<() => void>();
const emit = () => { for (const f of Array.from(subs)) { try { f(); } catch { /* a listener must not break the socket */ } } };
const set = (p: Partial<IslandLife>) => { state = { ...state, ...p }; emit(); };
/** field index -> others (not me) on that pitch's roster. */
const others = new Map<number, number>();
let nextClockAt = 0, me: () => number = () => -1, conn: LifeConn | null = null;

function busyList(): LiveFormat[] {
  const out: LiveFormat[] = [];
  for (const [f, n] of others) if (n > 0 && MATCH_FIELDS[f]) out.push(MATCH_FIELDS[f] as LiveFormat);
  return out.sort();
}
const sameList = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

function sync(): void {
  const live = !!conn && conn.kind === 'world' && conn.status === 'live';
  if (live === state.inWorld) return;
  if (!live) { others.clear(); set({ inWorld: false, goal: null, busy: [] }); } else set({ inWorld: true });
}

/** The island (Town) attaches the page's one connection; `myId` = my member id (-1 before a Welcome). Returns the detach. */
export function attachIslandLife(c: LifeConn, myId: () => number): () => void {
  conn = c; me = myId;
  const offMsg = c.onMessage((m) => {
    if (c.kind !== 'world') return;
    if (m[0] === S.Goal) { const n = Math.max(0, Math.min(ISLAND_GOAL.max, m[1])); sync(); if (n !== state.goal) set({ goal: n }); return; }
    if (m[0] !== S.Match) return;
    const a = m as unknown as number[];
    if (a[1] !== MatchKind.Join) return; // the roster (MATCH_ROSTER): [40, 0, field, owner, ...(member, team, slot)]
    let n = 0;
    for (let i = 4; i + 2 < a.length; i += 3) if (a[i] !== me()) n++;
    if (n) others.set(a[2], n); else others.delete(a[2]);
    const b = busyList();
    if (!sameList(b, state.busy)) set({ busy: b });
  });
  const offStatus = c.onStatus(() => sync());
  sync();
  return () => { offMsg(); offStatus(); if (conn === c) conn = null; others.clear(); state = { ...state, inWorld: false, goal: null, busy: [] }; emit(); };
}

/** Town's existing frame: reads the clock at most once a second (`nowMs` = Date.now()). No timer of its own. */
export function lifeFrame(t: number, nowMs: number): void {
  if (t < nextClockAt) return;
  nextClockAt = t + CLOCK_SAMPLE_MS;
  sync();
  const k = matchOClock(nowMs), c = state.clock;
  if (k.on !== c.on || k.field !== c.field || k.hour !== c.hour) set({ clock: k });
}

/** My team scored in a live match (Town's liveJoin goal event, mine). Sent only in a live world with Cap.Goal; the relay limits it. */
export function noteTeamGoal(): boolean { return !!conn && conn.kind === 'world' && conn.sendGoal(); }

/** The pitches to glow: busy pitches, plus the Match o'clock pitch while it is on. Empty outside a world. */
export function glowFields(s: IslandLife = state): LiveFormat[] {
  if (!s.inWorld) return [];
  const out = new Set<LiveFormat>(s.busy);
  if (s.clock.on) out.add(s.clock.field);
  return Array.from(out).sort();
}

export const islandLife = {
  get: () => state,
  subscribe(fn: () => void) { subs.add(fn); return () => { subs.delete(fn); }; },
  /** Tests only. */
  reset() { others.clear(); nextClockAt = 0; conn = null; me = () => -1; state = { goal: null, clock: matchOClock(0), inWorld: false, busy: [] }; emit(); },
};
