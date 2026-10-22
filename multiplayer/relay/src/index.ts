// Worker entry: routes POST /party, GET /party/:code, GET /party/:code/ws. Origin allow-list + IP-hash token buckets.
// Phase 0: buckets live in isolate memory (they reset on a cold start and are per isolate). Phase 1 should switch to the
// Workers Rate Limiting binding. IPs are only ever used as an HMAC with a daily salt, never stored or logged.
import { normalizeCode, TokenBucket } from '../../protocol';
import { PartyRoom, newPartyCode } from './partyRoom';
import type { Env } from './partyRoom';
import { originAllowed } from './origins';
import { RelayStats } from './relayStats';
import { bearerOk } from './relayStatsCore';

export { PartyRoom, RelayStats };

interface Limits { create: TokenBucket; join: TokenBucket; misses: number[]; blockedUntil: number }
const limits = new Map<string, Limits>();
let salt = crypto.getRandomValues(new Uint8Array(16));
let saltDay = Math.floor(Date.now() / 86400000);

async function ipKey(request: Request): Promise<string> {
  const day = Math.floor(Date.now() / 86400000);
  if (day !== saltDay) { saltDay = day; salt = crypto.getRandomValues(new Uint8Array(16)); limits.clear(); }
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = await crypto.subtle.importKey('raw', salt, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(ip)));
  let s = '';
  for (let i = 0; i < 8; i++) s += sig[i].toString(16).padStart(2, '0');
  return s;
}
function limitsFor(k: string): Limits {
  let l = limits.get(k);
  if (!l) {
    if (limits.size > 5000) limits.clear();
    l = { create: new TokenBucket(5 / 3600, 5), join: new TokenBucket(10 / 60, 10), misses: [], blockedUntil: 0 }; // 5 parties/h, 10 joins/min
    limits.set(k, l);
  }
  return l;
}
function noteMiss(l: Limits, now: number): void {
  l.misses = l.misses.filter((t) => now - t < 3600000);
  l.misses.push(now);
  if (l.misses.length >= 20) l.blockedUntil = now + 3600000; // 20 unknown codes / hour -> 1 h block
}

// Worker-level refusal counters (rl:origin_refused, rl:create_rate, rl:lookup_miss, rl:join_rate). They are batched in the isolate and
// flushed at most once per 10 s as plain counts, so a flood of refused requests cannot hammer the RelayStats object. Best effort.
const pendingStats = new Map<string, number>();
let lastFlush = 0;
function noteStat(env: Env, ctx: ExecutionContext | undefined, id: string, now: number): void {
  pendingStats.set(id, (pendingStats.get(id) || 0) + 1);
  if (!env.STATS || !ctx || now - lastFlush < 10000) return;
  lastFlush = now;
  const batch = Array.from(pendingStats);
  pendingStats.clear();
  const stub = env.STATS.get(env.STATS.idFromName('stats'));
  ctx.waitUntil(Promise.all(batch.map(([k, n]) => stub.fetch('https://do/inc', { method: 'POST', body: JSON.stringify({ id: k, n }) }).catch(() => undefined))));
}

const json = (status: number, body: unknown, origin: string | null, env: Env): Response => {
  const h: Record<string, string> = { 'content-type': 'application/json', 'cache-control': 'no-store' };
  if (origin && originAllowed(origin, env)) { h['access-control-allow-origin'] = origin; h['vary'] = 'Origin'; }
  return new Response(JSON.stringify(body), { status, headers: h });
};

export default {
  async fetch(request: Request, env: Env, ctx?: ExecutionContext): Promise<Response> {
    const origin = request.headers.get('Origin');
    const url = new URL(request.url);
    // GET /stats: server-to-server only (the Next admin route). Bearer STATS_TOKEN, constant-time compare. No CORS headers, no
    // OPTIONS answer: a browser page can never read it. 404 when the secret is not set or the method is wrong, 401 for a bad token.
    if (url.pathname === '/stats') {
      if (request.method !== 'GET' || !env.STATS_TOKEN || !env.STATS) return new Response('not found', { status: 404 });
      if (!bearerOk(request.headers.get('Authorization'), env.STATS_TOKEN)) return new Response('unauthorized', { status: 401, headers: { 'www-authenticate': 'Bearer' } });
      const res = await env.STATS.get(env.STATS.idFromName('stats')).fetch('https://do/stats' + url.search);
      return new Response(res.body, { status: res.status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
    }
    if (!originAllowed(origin, env)) { noteStat(env, ctx, 'rl:origin_refused', Date.now()); return new Response('forbidden', { status: 403 }); }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: origin ? {
        'access-control-allow-origin': origin, 'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers': 'content-type', vary: 'Origin',
      } : {} });
    }
    const now = Date.now();
    const lim = limitsFor(await ipKey(request));

    if (request.method === 'POST' && url.pathname === '/party') {
      if (!lim.create.take(now)) { noteStat(env, ctx, 'rl:create_rate', now); return json(429, { error: 'rate_limited' }, origin, env); }
      for (let i = 0; i < 4; i++) {
        const code = newPartyCode();
        const createdAt = now;
        const res = await env.PARTY.get(env.PARTY.idFromName(code)).fetch('https://do/init', { method: 'POST', body: JSON.stringify({ code, createdAt }) });
        if (res.status === 409) continue; // code already live: try another
        if (!res.ok) return json(502, { error: 'unavailable' }, origin, env);
        const b = (await res.json()) as { hostKey: string; expiresAt: number };
        return json(201, { code, hostKey: b.hostKey, expiresAt: b.expiresAt }, origin, env);
      }
      return json(503, { error: 'busy' }, origin, env);
    }

    const m = request.method === 'GET' ? /^\/party\/([^/]+)(\/ws)?$/.exec(url.pathname) : null;
    if (!m) return json(404, { error: 'not_found' }, origin, env);
    if (now < lim.blockedUntil || !lim.join.take(now)) { noteStat(env, ctx, 'rl:join_rate', now); return json(429, { error: 'rate_limited' }, origin, env); }
    let decoded = '';
    try { decoded = decodeURIComponent(m[1]); } catch { /* malformed escape: treated as an unknown code (review #12) */ }
    const code = normalizeCode(decoded);
    if (!code) { noteMiss(lim, now); noteStat(env, ctx, 'rl:lookup_miss', now); return json(404, { error: 'not_found' }, origin, env); }
    const stub = env.PARTY.get(env.PARTY.idFromName(code));
    const target = 'https://do/' + (m[2] ? 'ws' : 'info') + '?code=' + code;
    const res = await stub.fetch(m[2] ? new Request(target, request) : target);
    if (res.status === 404) { noteMiss(lim, now); noteStat(env, ctx, 'rl:lookup_miss', now); return json(404, { error: 'not_found' }, origin, env); }
    if (m[2]) return res; // the 101 upgrade (or 426)
    const body = await res.text();
    return new Response(body, { status: res.status, headers: json(200, null, origin, env).headers });
  },
};
