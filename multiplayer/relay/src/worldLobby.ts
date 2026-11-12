// WorldLobby: one singleton Durable Object (LOBBY.idFromName('lobby'), wrangler migration v3) around WorldLobbyCore (relay v2.0).
// Internal routes (called by the worker and by the world rooms; never reachable from a browser directly):
//   GET  /assign?in=N         -> {open:true, shard, n} | {open:false}
//   POST /admit {shard, h}    -> {open, held}         (a world socket is arriving; h = the worker's daily IP hash)
//   POST /count {shard, n}    -> {public}             (a world's live count: on change + every 30 s)
//   POST /hold  {h}           -> ok                   (a quarantine: hold that IP hash for 1 h, memory only)
//   GET  /control             -> {public, tokenSet, shards:[{shard,n}], total}
//   POST /control {public}    -> the same; public:false also closes every world (POST /world-close to each pub-N room)
// Storage: the owner's switch ('public', a boolean) and 'counts' ([shard, n, at] rows: counts only, written on change at most every
// COUNTS_WRITE_MS and refreshed every COUNTS_REFRESH_MS while a world is known), reloaded on start so an eviction or restart does not
// hand a full world out as empty (live stress test, Nov 12 2026). Holds are memory only; the hash is never stored or logged.
import { WorldLobbyCore, COUNTS_WRITE_MS, COUNTS_REFRESH_MS } from './worldLobbyCore';
import { WORLD_MAX_SHARDS } from '../../protocol';
import type { Env } from './partyRoom';

export class WorldLobby {
  private core: WorldLobbyCore;
  private loaded: Promise<void> | null = null;
  private savedVer = -1;
  private savedAt = 0;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private state: DurableObjectState, private env: Env) {
    this.core = new WorldLobbyCore(() => Date.now(), () => typeof env.CONTROL_TOKEN === 'string' && env.CONTROL_TOKEN.length >= 16);
  }

  private load(): Promise<void> {
    if (!this.loaded) {
      this.loaded = Promise.all([this.state.storage.get<boolean>('public'), this.state.storage.get<unknown>('counts')]).then(([v, rows]) => {
        this.core.stored = v === true;
        try { this.core.restore(rows); } catch { /* a bad row: start empty, the worlds re-report within 30 s */ }
        this.savedVer = this.core.version;
      });
    }
    return this.loaded;
  }

  /** Write 'counts' when a count changed (at most every COUNTS_WRITE_MS) or to refresh report times while any world is known. */
  private saveCounts(now = Date.now()): void {
    const c = this.core;
    if (c.version === this.savedVer && !(c.known().length > 0 && now - this.savedAt >= COUNTS_REFRESH_MS)) return;
    const wait = this.savedAt + COUNTS_WRITE_MS - now;
    if (wait > 0) {
      if (!this.saveTimer) this.saveTimer = setTimeout(() => { this.saveTimer = null; this.saveCounts(); }, wait);
      return;
    }
    this.savedVer = c.version; this.savedAt = now;
    void this.state.storage.put('counts', c.snapshot()).catch(() => undefined);
  }

  async fetch(request: Request): Promise<Response> {
    await this.load();
    const url = new URL(request.url);
    const c = this.core;
    if (request.method === 'GET' && url.pathname === '/assign') {
      const q = url.searchParams.get('in');
      const n = q !== null && /^\d{1,3}$/.test(q) ? Number(q) : undefined;
      return Response.json(c.assign(n));
    }
    if (request.method === 'GET' && url.pathname === '/control') return Response.json(c.state());
    if (request.method !== 'POST') return new Response('not found', { status: 404 });
    let b: { shard?: unknown; n?: unknown; h?: unknown; public?: unknown } = {};
    try { b = (await request.json()) as typeof b; } catch { return new Response('bad', { status: 400 }); }
    const h = typeof b.h === 'string' && /^[0-9a-f]{8,64}$/.test(b.h) ? b.h : null;
    if (url.pathname === '/admit') return Response.json(c.admit(Number(b.shard), h));
    if (url.pathname === '/count') { const pub = c.report(Number(b.shard), Number(b.n)); this.saveCounts(); return Response.json({ public: pub }); }
    if (url.pathname === '/hold') { c.hold(h); return new Response('ok'); }
    if (url.pathname === '/control') {
      if (typeof b.public !== 'boolean') return new Response('bad', { status: 400 });
      c.stored = b.public;
      await this.state.storage.put('public', b.public);
      if (!c.isPublic) await this.closeAll();
      this.savedAt = 0; this.saveCounts(); // the kill switch's cleared counts go to storage at once
      return Response.json(c.state());
    }
    return new Response('not found', { status: 404 });
  }

  /** Kill switch: every known world (and, after a lobby restart forgot them, the worlds' own next count report) closes its sockets. */
  private async closeAll(): Promise<void> {
    const shards = this.core.known();
    this.core.clear();
    await Promise.all(shards.filter((s) => s >= 1 && s <= WORLD_MAX_SHARDS).map((s) =>
      this.env.PARTY.get(this.env.PARTY.idFromName('pub-' + s)).fetch('https://do/world-close', { method: 'POST' }).catch(() => undefined)));
  }
}
