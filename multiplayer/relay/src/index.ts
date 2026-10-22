// Worker entry: routes POST /party, GET /party/:code, GET /party/:code/ws. Origin allow-list + IP-hash token buckets.
// Phase 0: buckets live in isolate memory (they reset on a cold start and are per isolate). Phase 1 should switch to the
// Workers Rate Limiting binding. IPs are only ever used as an HMAC with a daily salt, never stored or logged.
import { normalizeCode, TokenBucket } from '../../protocol';
import { PartyRoom, newPartyCode } from './partyRoom';
import type { Env } from './partyRoom';

export { PartyRoom };

const ORIGINS: RegExp[] = [
  /^https:\/\/futbolisland\.app$/,
  /^https:\/\/www\.futbolisland\.app$/,
  /^https:\/\/futbol-island[a-z0-9-]*\.vercel\.app$/, // the project's Vercel previews
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];
const originAllowed = (o: string | null): boolean => !o || ORIGINS.some((r) => r.test(o)); // no Origin = not a browser

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

const json = (status: number, body: unknown, origin: string | null): Response => {
  const h: Record<string, string> = { 'content-type': 'application/json', 'cache-control': 'no-store' };
  if (origin && originAllowed(origin)) { h['access-control-allow-origin'] = origin; h['vary'] = 'Origin'; }
  return new Response(JSON.stringify(body), { status, headers: h });
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');
    if (!originAllowed(origin)) return new Response('forbidden', { status: 403 });
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: origin ? {
        'access-control-allow-origin': origin, 'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers': 'content-type', vary: 'Origin',
      } : {} });
    }
    const now = Date.now();
    const lim = limitsFor(await ipKey(request));

    if (request.method === 'POST' && url.pathname === '/party') {
      if (!lim.create.take(now)) return json(429, { error: 'rate_limited' }, origin);
      for (let i = 0; i < 4; i++) {
        const code = newPartyCode();
        const createdAt = now;
        const res = await env.PARTY.get(env.PARTY.idFromName(code)).fetch('https://do/init', { method: 'POST', body: JSON.stringify({ code, createdAt }) });
        if (res.status === 409) continue; // code already live: try another
        if (!res.ok) return json(502, { error: 'unavailable' }, origin);
        const b = (await res.json()) as { hostKey: string; expiresAt: number };
        return json(201, { code, hostKey: b.hostKey, expiresAt: b.expiresAt }, origin);
      }
      return json(503, { error: 'busy' }, origin);
    }

    const m = request.method === 'GET' ? /^\/party\/([^/]+)(\/ws)?$/.exec(url.pathname) : null;
    if (!m) return json(404, { error: 'not_found' }, origin);
    if (now < lim.blockedUntil || !lim.join.take(now)) return json(429, { error: 'rate_limited' }, origin);
    const code = normalizeCode(decodeURIComponent(m[1]));
    if (!code) { noteMiss(lim, now); return json(404, { error: 'not_found' }, origin); }
    const stub = env.PARTY.get(env.PARTY.idFromName(code));
    const target = 'https://do/' + (m[2] ? 'ws' : 'info') + '?code=' + code;
    const res = await stub.fetch(m[2] ? new Request(target, request) : target);
    if (res.status === 404) { noteMiss(lim, now); return json(404, { error: 'not_found' }, origin); }
    if (m[2]) return res; // the 101 upgrade (or 426)
    const body = await res.text();
    return new Response(body, { status: res.status, headers: json(200, null, origin).headers });
  },
};
