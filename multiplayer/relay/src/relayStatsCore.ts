// Pure relay statistics: daily aggregate counters only. No Cloudflare or Node APIs (tests run it in Node with a Map-backed store).
// Plan: docs/analytics-multiplayer-plan.md section 7. PRIVACY: every key is a fixed id from ALLOWED below (or a fixed bucket name),
// every value is a count. Never a party code, name, nick, IP, host key, member id, token or per-party timestamp; rows are per UTC
// day, so the only time we keep is the day itself.

export type Row = Record<string, number>;

/** Minimal async key-value store (a Durable Object's storage, or a Map in tests). */
export interface KV {
  get<T = unknown>(key: string): Promise<T | undefined>;
  put<T = unknown>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<boolean>;
  list<T = unknown>(opts?: { prefix?: string }): Promise<Map<string, T>>;
}

export const KEEP_DAYS = 400;
export const DAY_MS = 86400000;
export const DAY_PREFIX = 'day:';
export const LIVE_KEY = 'live';

// ---- buckets (fixed strings; the same edges are used by the room, the core and the tests) ----
export const PEAK_BUCKETS = ['1', '2', '3', '4_5', '6p'] as const;
export const LEN_BUCKETS = ['lt5m', '5_15m', '15_30m', '30_60m', '60mp'] as const;
export const JOIN_BUCKETS = ['1', '2_3', '4_9', '10p'] as const;
export const MSG_BUCKETS = ['lt1k', '1k_10k', '10k_50k', '50kp'] as const;

export const peakBucket = (n: number): string => (n <= 1 ? '1' : n === 2 ? '2' : n === 3 ? '3' : n <= 5 ? '4_5' : '6p');
export const lenBucket = (ms: number): string => {
  const m = ms / 60000;
  return m < 5 ? 'lt5m' : m < 15 ? '5_15m' : m < 30 ? '15_30m' : m < 60 ? '30_60m' : '60mp';
};
export const joinsBucket = (n: number): string => (n <= 1 ? '1' : n <= 3 ? '2_3' : n <= 9 ? '4_9' : '10p');
export const msgsBucket = (n: number): string => (n < 1000 ? 'lt1k' : n < 10000 ? '1k_10k' : n < 50000 ? '10k_50k' : '50kp');

// ---- ids ----
/** Why a join failed. */
export const FAIL_REASONS = ['not_found', 'full', 'closed', 'expired', 'bad_name', 'rate_limited', 'locked'] as const;
export type FailReason = (typeof FAIL_REASONS)[number];
/** Names for protocol ErrorCode 0..9 (index = code). */
export const ERR_NAMES = ['bad_message', 'rate', 'full', 'not_found', 'expired', 'locked', 'not_host', 'bad_version', 'kicked', 'bad_name'] as const;
export const END_REASONS = ['host', 'expired', 'empty'] as const; // index = protocol EndReason

const ids: string[] = [
  'rl:created', 'rl:welcome', 'rl:resume', 'rl:kick', 'rl:rotate', 'rl:lock', 'rl:name_reset', 'rl:rate_close', 'rl:msgs',
  'rl:origin_refused', 'rl:create_rate', 'rl:lookup_miss', 'rl:join_rate',
  'rl:live_parties_max', 'rl:live_players_max',
];
for (const r of END_REASONS) ids.push('rl:ended_' + r);
for (const b of PEAK_BUCKETS) ids.push('rl:peak_' + b);
for (const b of LEN_BUCKETS) ids.push('rl:len_' + b);
for (const b of JOIN_BUCKETS) ids.push('rl:joins_' + b);
for (const b of MSG_BUCKETS) ids.push('rl:msgs_' + b);
for (const r of FAIL_REASONS) ids.push('rl:fail_' + r);
for (const e of ERR_NAMES) ids.push('rl:err_' + e);
/** Every id a row may ever contain. Anything else is dropped on the way in. */
export const ALLOWED: ReadonlySet<string> = new Set(ids);
/** Ids that are daily maxima (gauges), not sums. */
const GAUGES: ReadonlySet<string> = new Set(['rl:live_parties_max', 'rl:live_players_max']);

/** What a room reports once, when it ends. Counts only; the bucket names are derived from them by the stats core. */
export interface RoomSummary {
  endReason: number;
  peak: number; // peak simultaneous members
  lenMs: number;
  joins: number; // fresh joins (a new face got a Welcome)
  resumes: number;
  kicks: number; rotates: number; locks: number; nameResets: number; rateCloses: number;
  msgs: number; // inbound messages
  fails: Record<string, number>; // by FailReason
  errs: Record<string, number>; // by ERR_NAMES name
}

export interface Live { parties: number; players: number }

export const dayOf = (ms: number): string => new Date(ms).toISOString().slice(0, 10);
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.min(Math.floor(v), 1e9) : 0);

function bump(row: Row, id: string, n = 1): void {
  if (!ALLOWED.has(id) || n <= 0) return;
  row[id] = GAUGES.has(id) ? Math.max(row[id] || 0, n) : (row[id] || 0) + n;
}

/** A RoomSummary -> ids (only allow-listed ones are ever produced). */
export function summaryIncrements(s: RoomSummary): Row {
  const row: Row = {};
  bump(row, 'rl:ended_' + (END_REASONS[s.endReason] ?? 'expired'));
  bump(row, 'rl:peak_' + peakBucket(Math.max(1, num(s.peak))));
  bump(row, 'rl:len_' + lenBucket(num(s.lenMs)));
  bump(row, 'rl:joins_' + joinsBucket(num(s.joins)));
  bump(row, 'rl:msgs_' + msgsBucket(num(s.msgs)));
  bump(row, 'rl:msgs', num(s.msgs));
  bump(row, 'rl:welcome', num(s.joins));
  bump(row, 'rl:resume', num(s.resumes));
  bump(row, 'rl:kick', num(s.kicks));
  bump(row, 'rl:rotate', num(s.rotates));
  bump(row, 'rl:lock', num(s.locks));
  bump(row, 'rl:name_reset', num(s.nameResets));
  bump(row, 'rl:rate_close', num(s.rateCloses));
  for (const r of FAIL_REASONS) bump(row, 'rl:fail_' + r, num(s.fails && s.fails[r]));
  for (const e of ERR_NAMES) bump(row, 'rl:err_' + e, num(s.errs && s.errs[e]));
  return row;
}

/** Daily totals store. All writes go through here so the allow-list and the day keying cannot be bypassed. */
export class RelayStatsCore {
  constructor(private kv: KV, private now: () => number) {}

  private async row(day: string): Promise<Row> { return (await this.kv.get<Row>(DAY_PREFIX + day)) ?? {}; }
  private async live(): Promise<Live> { return (await this.kv.get<Live>(LIVE_KEY)) ?? { parties: 0, players: 0 }; }

  private async write(mut: (row: Row, live: Live) => void, touchLive: boolean): Promise<void> {
    const day = dayOf(this.now());
    const row = await this.row(day);
    const live = await this.live();
    mut(row, live);
    live.parties = Math.max(0, live.parties); live.players = Math.max(0, live.players);
    bump(row, 'rl:live_parties_max', live.parties);
    bump(row, 'rl:live_players_max', live.players);
    await this.kv.put(DAY_PREFIX + day, row);
    if (touchLive) await this.kv.put(LIVE_KEY, live);
  }

  /** A party was created. */
  async created(): Promise<void> {
    await this.write((row, live) => { bump(row, 'rl:created'); live.parties += 1; }, true);
  }
  /** The members connected to one room changed by `delta` (a rare +1 / -1). */
  async players(delta: number): Promise<void> {
    const d = Math.max(-100, Math.min(100, Math.trunc(delta) || 0));
    if (!d) return;
    await this.write((_r, live) => { live.players += d; }, true);
  }
  /** A room ended: add its summary and take it off the live gauge (`reportedPlayers` = members it had reported as live). */
  async ended(s: RoomSummary, reportedPlayers: number): Promise<void> {
    const inc = summaryIncrements(s);
    await this.write((row, live) => {
      for (const id of Object.keys(inc)) bump(row, id, inc[id]);
      live.parties -= 1; live.players -= num(reportedPlayers);
    }, true);
  }
  /** One worker-level counter (`rl:origin_refused`, `rl:create_rate`, `rl:lookup_miss`, `rl:join_rate`). */
  async inc(id: string, n = 1): Promise<boolean> {
    if (!ALLOWED.has(id) || GAUGES.has(id)) return false;
    await this.write((row) => { bump(row, id, Math.min(num(n), 1000)); }, false);
    return true;
  }

  /** Drop day rows older than KEEP_DAYS. Returns the number removed. */
  async prune(): Promise<number> {
    const cutoff = dayOf(this.now() - KEEP_DAYS * DAY_MS);
    let n = 0;
    for (const k of (await this.kv.list<Row>({ prefix: DAY_PREFIX })).keys()) {
      if (k.slice(DAY_PREFIX.length) < cutoff) { await this.kv.delete(k); n++; }
    }
    return n;
  }

  /** Totals for an inclusive day range (YYYY-MM-DD), plus the live gauge now. Gauges in `totals` are the max over the range. */
  async stats(from: string, to: string): Promise<{ from: string; to: string; days: Record<string, Row>; totals: Row; live: Live }> {
    const days: Record<string, Row> = {};
    const totals: Row = {};
    for (const [k, row] of await this.kv.list<Row>({ prefix: DAY_PREFIX })) {
      const d = k.slice(DAY_PREFIX.length);
      if (d < from || d > to) continue;
      days[d] = row;
      for (const id of Object.keys(row)) bump(totals, id, row[id]);
    }
    return { from, to, days, totals, live: await this.live() };
  }
}

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
/** Parse ?from&to for GET /stats: defaults to the last 30 days, at most KEEP_DAYS wide. */
export function parseRange(fromQ: string | null, toQ: string | null, now: number): { from: string; to: string } {
  const to = toQ && DAY_RE.test(toQ) ? toQ : dayOf(now);
  let from = fromQ && DAY_RE.test(fromQ) ? fromQ : dayOf(Date.parse(to + 'T00:00:00Z') - 29 * DAY_MS);
  const floor = dayOf(Date.parse(to + 'T00:00:00Z') - (KEEP_DAYS - 1) * DAY_MS);
  if (from < floor) from = floor;
  return { from, to };
}

/** Constant-time bearer check (compared over the longer length, no early exit). A missing or short token never matches. */
export function bearerOk(header: string | null, token: string | undefined): boolean {
  if (!token || token.length < 16 || !header) return false;
  const given = header.startsWith('Bearer ') ? header.slice(7) : '';
  let d = given.length ^ token.length;
  const n = Math.max(given.length, token.length);
  for (let i = 0; i < n; i++) d |= (given.charCodeAt(i) || 0) ^ (token.charCodeAt(i) || 0);
  return d === 0;
}
