// Pure public-world lobby (relay v2.0, Nov 11 2026): fill-first shard assignment, the owner's kill switch and the quarantine holds.
// No Cloudflare or Node APIs: the WorldLobby Durable Object (worldLobby.ts) and the Node dev relay both wrap it.
// PRIVACY: it keeps a live member COUNT per shard and, for quarantine, a daily IP hash -> hold-until time IN MEMORY ONLY. Never a
// name, member id, position or token; the hash is never written to storage or logged. Only `public` (the owner's switch) persists.
import { WORLD_SOFT, WORLD_HARD, WORLD_MAX_SHARDS, REPORT } from '../../protocol';

/** A shard that has not reported for this long is forgotten (worlds re-report their count every WORLD_HEARTBEAT_MS). */
export const SHARD_STALE_MS = 90_000;
export const WORLD_HEARTBEAT_MS = 30_000;
/** GET /world hands out a seat before the socket arrives: it counts against the shard for this long (fill-first under a burst). */
export const RESERVE_MS = 15_000;
const MAX_HOLDS = 20_000;

export type Assign = { open: true; shard: number; n: number } | { open: false };
interface Shard { n: number; at: number; resv: number[] }

export class WorldLobbyCore {
  private shards = new Map<number, Shard>();
  private holds = new Map<string, number>();
  /** The owner's switch as stored. Effective only when a control token exists (fail safe: no secret = closed). */
  stored = false;
  constructor(private now: () => number, private hasToken: () => boolean) {}

  get isPublic(): boolean { return this.stored && this.hasToken(); }

  private live(s: Shard, now: number): number {
    while (s.resv.length && now - s.resv[0] >= RESERVE_MS) s.resv.shift();
    return s.n + s.resv.length;
  }
  private prune(now: number): void {
    this.shards.forEach((s, k) => { if (now - s.at >= SHARD_STALE_MS || this.live(s, now) === 0) this.shards.delete(k); });
  }

  /**
   * GET /world. `inShard` = the world the caller is (re)joining (a reconnect, a room page): kept while it exists, also at WORLD_HARD,
   * because the caller usually still holds a seat there (a door's 2-min away grace, a drop's 60 s): the room resumes that seat and
   * refuses a fresh join over WORLD_HARD with Full, and the client then asks once without `in` (PHASE1-VERIFY low item, Nov 11 2026).
   * Otherwise the FULLEST shard under WORLD_SOFT (ties: the lowest number); a new shard (the lowest free number) only when every open
   * shard is at WORLD_SOFT. n = that shard's members now (the caller's "N on now", the caller not included).
   */
  assign(inShard?: number): Assign {
    if (!this.isPublic) return { open: false };
    const now = this.now();
    this.prune(now);
    if (inShard !== undefined && Number.isInteger(inShard)) {
      const s = this.shards.get(inShard);
      if (s) { const n = s.n; if (this.live(s, now) < WORLD_HARD) s.resv.push(now); return { open: true, shard: inShard, n: Math.max(0, Math.min(WORLD_HARD - 1, n)) }; }
    }
    let best = -1, bestN = -1;
    this.shards.forEach((s, k) => {
      const n = this.live(s, now);
      if (n < WORLD_SOFT && (n > bestN || (n === bestN && k < best))) { best = k; bestN = n; }
    });
    if (best < 0) {
      for (let k = 1; k <= WORLD_MAX_SHARDS; k++) if (!this.shards.has(k)) { best = k; break; }
      if (best < 0) return { open: false };
      this.shards.set(best, { n: 0, at: now, resv: [] });
    }
    const s = this.shards.get(best) as Shard;
    const n = s.n;
    s.resv.push(now);
    return { open: true, shard: best, n };
  }

  /** A world's live count (on every change and every WORLD_HEARTBEAT_MS). n = 0 forgets the shard. Returns the switch state. */
  report(shard: number, n: number): boolean {
    if (!Number.isInteger(shard) || shard < 1 || shard > WORLD_MAX_SHARDS) return this.isPublic;
    const now = this.now();
    const c = Math.max(0, Math.min(WORLD_HARD, Math.floor(n) || 0));
    if (c === 0) { this.shards.delete(shard); return this.isPublic; }
    const s = this.shards.get(shard);
    if (!s) { this.shards.set(shard, { n: c, at: now, resv: [] }); return this.isPublic; }
    for (let i = s.n; i < c && s.resv.length; i++) s.resv.shift(); // arrivals use up their reservations
    s.n = c; s.at = now;
    return this.isPublic;
  }

  /** A socket for `shard` arrives: open, under the hard cap (the room checks too), and whether its IP hash is on hold. */
  admit(shard: number, hash: string | null): { open: boolean; held: boolean } {
    return { open: this.isPublic && Number.isInteger(shard) && shard >= 1 && shard <= WORLD_MAX_SHARDS, held: this.held(hash) };
  }

  /** Quarantine hold on a daily IP hash for REPORT.holdMs (memory only). */
  hold(hash: string | null): void {
    if (!hash) return;
    const now = this.now();
    if (this.holds.size >= MAX_HOLDS) this.holds.forEach((t, k) => { if (now >= t) this.holds.delete(k); });
    if (this.holds.size >= MAX_HOLDS) return;
    this.holds.set(hash, now + REPORT.holdMs);
  }
  held(hash: string | null): boolean {
    if (!hash) return false;
    const t = this.holds.get(hash);
    if (t === undefined) return false;
    if (this.now() >= t) { this.holds.delete(hash); return false; }
    return true;
  }

  /** GET /control: the switch and each shard's live count (counts only). */
  state(): { public: boolean; tokenSet: boolean; shards: { shard: number; n: number }[]; total: number } {
    const now = this.now();
    this.prune(now);
    const shards: { shard: number; n: number }[] = [];
    this.shards.forEach((s, k) => { if (s.n > 0) shards.push({ shard: k, n: s.n }); });
    shards.sort((a, b) => a.shard - b.shard);
    return { public: this.isPublic, tokenSet: this.hasToken(), shards, total: shards.reduce((a, s) => a + s.n, 0) };
  }

  /** Shards a kill switch must close (every shard the lobby knows). */
  known(): number[] { return Array.from(this.shards.keys()).sort((a, b) => a - b); }
  /** After POST /control {public:false}: every count is dropped (the worlds close their sockets). */
  clear(): void { this.shards.clear(); }
}
