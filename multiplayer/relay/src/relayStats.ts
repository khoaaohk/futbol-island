// RelayStats: one tiny singleton Durable Object (idFromName('stats')) holding DAILY aggregate counters only (see relayStatsCore.ts).
// Routes (internal, called by the worker and by PartyRoom): POST /created, POST /players {delta}, POST /ended {summary, players},
// POST /inc {id, n}, GET /stats?from&to. A daily alarm prunes day rows older than 400 days.
import { RelayStatsCore, parseRange, DAY_MS } from './relayStatsCore';
import type { RoomSummary, KV } from './relayStatsCore';

export class RelayStats {
  private core: RelayStatsCore;
  constructor(private state: DurableObjectState) {
    this.core = new RelayStatsCore(state.storage as unknown as KV, () => Date.now());
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    await this.ensureAlarm();
    if (request.method === 'GET' && url.pathname === '/stats') {
      const r = parseRange(url.searchParams.get('from'), url.searchParams.get('to'), Date.now());
      return Response.json(await this.core.stats(r.from, r.to), { headers: { 'cache-control': 'no-store' } });
    }
    if (request.method !== 'POST') return new Response('not found', { status: 404 });
    if (url.pathname === '/created') { await this.core.created(); return new Response('ok'); }
    let b: { delta?: number; summary?: RoomSummary; players?: number; id?: string; n?: number } = {};
    try { b = (await request.json()) as typeof b; } catch { return new Response('bad', { status: 400 }); }
    if (url.pathname === '/players' && typeof b.delta === 'number') { await this.core.players(b.delta); return new Response('ok'); }
    if (url.pathname === '/ended' && b.summary && typeof b.summary === 'object') {
      await this.core.ended(b.summary, typeof b.players === 'number' ? b.players : 0);
      return new Response('ok');
    }
    if (url.pathname === '/inc' && typeof b.id === 'string') {
      return (await this.core.inc(b.id, typeof b.n === 'number' ? b.n : 1)) ? new Response('ok') : new Response('bad', { status: 400 });
    }
    return new Response('not found', { status: 404 });
  }

  async alarm(): Promise<void> {
    await this.core.prune();
    await this.state.storage.setAlarm(Date.now() + DAY_MS);
  }

  private async ensureAlarm(): Promise<void> {
    if ((await this.state.storage.getAlarm()) === null) await this.state.storage.setAlarm(Date.now() + DAY_MS);
  }
}
