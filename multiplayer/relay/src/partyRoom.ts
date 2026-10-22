// Durable Object shell around RoomCore (one object per party, named by the party code).
//
// ROTATE (decision, Phase 0): "New code" keeps the SAME room and its members. RoomCore.rotate() issues a new code and
// restarts the 8 h join window. The OLD code is RETIRED, not deleted: /ws still accepts it, but a socket that came in through
// a retired code is admitted only with a valid resume token or the host key (so a leaked old code never admits a stranger,
// while a guest whose connection drops after a Rotate can still resume). /info answers 404 for a retired code. The new code is
// served by a tiny alias object: PARTY.idFromName(newCode) stores `alias = <this object's name>` and forwards every request
// to it. Members never move, nobody is dropped, and the host gets [S.Code, newCode, expiresAt] on its socket. The dev relay
// does the same with a plain Map (see multiplayer/dev-relay/server.mjs).
//
// STORAGE (review #2, #14): 'saved' = {name, createdAt, hostKeyHash, code, codeIssuedAt, locked, revoked, retired}: the
// host key is kept only as a SHA-256 digest, no member data. On End (or past the 12 h cap) everything is deleted and a tiny
// 'tombstone' is written, so an eviction can never revive an ended party. Members survive an eviction through the per-socket
// attachment (serializeAttachment: id, server-picked name, look, resume token); only members whose socket is gone are lost
// (they re-Hello as new faces). Phase 0 caveat: not exercised on real Cloudflare.
import { RoomCore, CLOSE } from './roomCore';
import type { MemberAttachment, Peer, RoomSnapshot } from './roomCore';
import { generateCode, PARTY_MAX_MS } from '../../protocol';

export interface Env { PARTY: DurableObjectNamespace; MP_ALLOWED_ORIGINS?: string; MP_DEV?: string }

interface Saved extends RoomSnapshot { name: string; createdAt: number; hostKeyHash: string }

const TICK_MS = 200;
const ALARM_MS = 5000;

export class PartyRoom {
  private core: RoomCore | null = null;
  private loading: Promise<RoomCore | null> | null = null;
  private base: { name: string; createdAt: number; hostKeyHash: string } | null = null;
  private peers = new Map<WebSocket, Peer>();
  private attSig = new Map<WebSocket, string>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private alarmAt = 0;

  constructor(private state: DurableObjectState, private env: Env) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const alias = await this.state.storage.get<string>('alias');
    if (alias) return this.env.PARTY.get(this.env.PARTY.idFromName(alias)).fetch(request); // rotated code -> origin room
    if (url.pathname === '/init' && request.method === 'POST') return this.init(await request.json());
    if (url.pathname === '/alias' && request.method === 'POST') {
      const b = (await request.json()) as { origin?: string };
      if (typeof b.origin === 'string') await this.state.storage.put('alias', b.origin);
      return new Response('ok');
    }
    const core = await this.load();
    const code = url.searchParams.get('code');
    const status = core && code ? core.codeStatus(code) : null;
    if (!core || core.ended || !status) return new Response('not found', { status: 404 });
    if (url.pathname === '/info') {
      if (status === 'retired') return new Response('not found', { status: 404 }); // a retired code is not joinable
      const i = core.info();
      return Response.json({ open: i.open, full: i.full }); // no party size (review #23)
    }
    if (url.pathname === '/ws') {
      if (request.headers.get('Upgrade') !== 'websocket') return new Response('expected websocket', { status: 426 });
      const pair = new WebSocketPair();
      const server = pair[1] as HibernatableWebSocket;
      this.state.acceptWebSocket(server);
      const peer = this.makePeer(server);
      this.peers.set(server, peer);
      core.connect(peer, status === 'retired');
      this.afterEvent();
      return new Response(null, { status: 101, webSocket: pair[0] } as ResponseInit);
    }
    return new Response('not found', { status: 404 });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const core = await this.load();
    const peer = this.peers.get(ws);
    if (!peer || !core) { try { ws.close(CLOSE.Refused, 'resume'); } catch { /* closed */ } return; }
    if (typeof message === 'string') core.message(peer, message);
    else peer.close(CLOSE.BadMessages);
    this.syncAttachment(ws as HibernatableWebSocket, peer, core);
    this.afterEvent();
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    const peer = this.peers.get(ws);
    this.peers.delete(ws);
    this.attSig.delete(ws);
    try { ws.close(1000, 'bye'); } catch { /* already closed: reciprocal close so the socket is not left half-open (review #23) */ }
    if (peer && this.core) this.core.disconnect(peer);
    this.afterEvent();
  }

  async webSocketError(ws: WebSocket): Promise<void> { await this.webSocketClose(ws); }

  async alarm(): Promise<void> {
    this.alarmAt = 0;
    const core = await this.load();
    if (!core) return;
    core.tick();
    this.afterEvent();
  }

  private makePeer(server: WebSocket): Peer {
    return { send: (t) => server.send(t), close: (c) => { try { server.close(c, 'bye'); } catch { /* closed */ } } };
  }

  private syncAttachment(ws: HibernatableWebSocket, peer: Peer, core: RoomCore): void {
    const a = core.attachmentFor(peer);
    if (!a) return;
    const sig = JSON.stringify(a);
    if (this.attSig.get(ws) === sig) return;
    this.attSig.set(ws, sig);
    try { ws.serializeAttachment(a); } catch { /* socket closed */ }
  }

  private async init(body: unknown): Promise<Response> {
    const b = body as { code?: string; createdAt?: number };
    if (!b || typeof b.code !== 'string' || typeof b.createdAt !== 'number') return new Response('bad', { status: 400 });
    if ((await this.state.storage.get('saved')) || (await this.state.storage.get('tombstone'))) return new Response('exists', { status: 409 });
    const core = this.build(b.code, b.createdAt, null, null);
    this.base = { name: b.code, createdAt: b.createdAt, hostKeyHash: core.digest };
    await this.state.storage.put('saved', { ...this.base, ...core.snapshot() } satisfies Saved);
    this.core = core;
    this.afterEvent();
    return Response.json({ hostKey: core.hostKey, expiresAt: core.codeExpiresAt });
  }

  private build(name: string, createdAt: number, hostKeyHash: string | null, restore: RoomSnapshot | null): RoomCore {
    const random = (n: number): Uint8Array => { const a = new Uint8Array(n); crypto.getRandomValues(a); return a; };
    const core = new RoomCore({ code: name, createdAt, clock: { now: () => Date.now() }, random, hostKeyHash: hostKeyHash ?? undefined, restore: restore ?? undefined });
    core.onRotate = (_old, next) => {
      const origin = this.base?.name;
      if (origin) void this.env.PARTY.get(this.env.PARTY.idFromName(next)).fetch('https://do/alias', { method: 'POST', body: JSON.stringify({ origin }) });
    };
    return core;
  }

  private load(): Promise<RoomCore | null> {
    if (this.core) return Promise.resolve(this.core);
    if (!this.loading) this.loading = this.doLoad().finally(() => { this.loading = null; });
    return this.loading;
  }

  private async doLoad(): Promise<RoomCore | null> {
    if (await this.state.storage.get('tombstone')) return null; // ended: never revived
    const s = await this.state.storage.get<Saved>('saved');
    if (!s) return null;
    if (Date.now() >= s.createdAt + PARTY_MAX_MS) { await this.finish(); return null; } // past the 12 h cap
    this.base = { name: s.name, createdAt: s.createdAt, hostKeyHash: s.hostKeyHash };
    const core = this.build(s.name, s.createdAt, s.hostKeyHash, s);
    // a hibernated object wakes with its sockets still attached: put the members back on them
    for (const ws of this.state.getWebSockets()) {
      const peer = this.makePeer(ws);
      this.peers.set(ws, peer);
      const a = ws.deserializeAttachment() as MemberAttachment | null;
      if (a && typeof a.token === 'string') { core.restoreMember(peer, a); this.attSig.set(ws, JSON.stringify(a)); }
      else core.connect(peer);
    }
    this.core = core;
    return core;
  }

  /** Delete everything and leave only a tombstone (review #2). */
  private async finish(): Promise<void> {
    try { await this.state.storage.deleteAlarm(); } catch { /* none */ }
    await this.state.storage.deleteAll();
    await this.state.storage.put('tombstone', Date.now());
  }

  private async persist(core: RoomCore): Promise<void> {
    if (core.ended) { await this.finish(); return; }
    if (this.base) await this.state.storage.put('saved', { ...this.base, ...core.snapshot() } satisfies Saved);
  }

  /** The alarm is set only when none is pending (review #3): one billed write per 5 s, not one per frame. */
  private async ensureAlarm(): Promise<void> {
    const now = Date.now();
    if (now < this.alarmAt) return;
    const cur = await this.state.storage.getAlarm();
    if (cur !== null && cur > now) { this.alarmAt = cur; return; }
    this.alarmAt = now + ALARM_MS;
    await this.state.storage.setAlarm(this.alarmAt);
  }

  /** Tick at 5 Hz only while >= 2 sockets are open; the alarm (re-armed after each run) covers the quiet cases. */
  private afterEvent(): void {
    const core = this.core;
    if (!core) return;
    if (core.stateChanged) { core.stateChanged = false; void this.persist(core); }
    if (core.ended) {
      if (this.timer) clearInterval(this.timer);
      this.timer = null;
      return;
    }
    const sockets = this.state.getWebSockets().length;
    if (sockets >= 2 && !this.timer) this.timer = setInterval(() => { core.tick(); if (core.ended || core.stateChanged) this.afterEvent(); }, TICK_MS);
    else if (sockets < 2 && this.timer) { clearInterval(this.timer); this.timer = null; }
    void this.ensureAlarm();
  }
}

/** Used by the worker to mint a code. */
export function newPartyCode(): string {
  return generateCode((n) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return a; });
}
