// Durable Object shell around RoomCore (one object per party, named by the party code).
//
// ROTATE (decision, Phase 0): "New code" keeps the SAME room and its members. RoomCore.rotate() issues a new code and
// restarts the 2 h join window; the OLD code is retired at once (this object answers NotFound / 404 for it, so a leaked
// code stops working). The new code is served by a tiny alias object: PARTY.idFromName(newCode) stores `alias = <this
// object's name>` and forwards every request to it. Members never move, nobody is dropped, and the host gets
// [S.Code, newCode, expiresAt] on its socket. (The workplan's simpler variant, a fresh party under the new code with the
// members left behind, would strand friends who are already inside, so it was not used.) The dev relay does the same
// with a plain Map re-key (see multiplayer/dev-relay/server.mjs).
//
// Storage holds only {name, createdAt, hostKeyBytes}: hostKeyBytes is a random secret (no PII) kept so the host can still
// prove itself if this object is evicted and re-created; nothing about members is ever written.
// Eviction: a woken object has no members, so a socket that talks to it is closed with 4006 and the client resumes with a
// fresh Hello (graceful: empty roster, members re-Hello). Phase 0 caveat: not exercised on real Cloudflare.
import { RoomCore, CLOSE } from './roomCore';
import type { Peer } from './roomCore';
import { generateCode } from '../../protocol';

export interface Env { PARTY: DurableObjectNamespace }

interface Saved { name: string; createdAt: number; hostKey: number[] }

const TICK_MS = 200;
const ALARM_MS = 5000;

export class PartyRoom {
  private core: RoomCore | null = null;
  private peers = new Map<WebSocket, Peer>();
  private timer: ReturnType<typeof setInterval> | null = null;

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
    if (!core || core.ended || !code || code !== core.code) return new Response('not found', { status: 404 });
    if (url.pathname === '/info') return Response.json(core.info());
    if (url.pathname === '/ws') {
      if (request.headers.get('Upgrade') !== 'websocket') return new Response('expected websocket', { status: 426 });
      const pair = new WebSocketPair();
      const server = pair[1] as HibernatableWebSocket;
      this.state.acceptWebSocket(server);
      const peer: Peer = { send: (t) => server.send(t), close: (c) => { try { server.close(c, 'bye'); } catch { /* closed */ } } };
      this.peers.set(server, peer);
      core.connect(peer);
      this.afterEvent();
      return new Response(null, { status: 101, webSocket: pair[0] } as ResponseInit);
    }
    return new Response('not found', { status: 404 });
  }

  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void {
    const peer = this.peers.get(ws);
    if (!peer || !this.core) { try { ws.close(CLOSE.Refused, 'resume'); } catch { /* closed */ } return; } // woke after eviction
    if (typeof message === 'string') this.core.message(peer, message);
    else peer.close(CLOSE.BadMessages);
    this.afterEvent();
  }

  webSocketClose(ws: WebSocket): void {
    const peer = this.peers.get(ws);
    this.peers.delete(ws);
    if (peer && this.core) this.core.disconnect(peer);
    this.afterEvent();
  }

  webSocketError(ws: WebSocket): void { this.webSocketClose(ws); }

  async alarm(): Promise<void> {
    if (!this.core) return;
    this.core.tick();
    this.afterEvent();
  }

  private async init(body: unknown): Promise<Response> {
    const b = body as { code?: string; createdAt?: number };
    if (!b || typeof b.code !== 'string' || typeof b.createdAt !== 'number') return new Response('bad', { status: 400 });
    if (await this.state.storage.get<Saved>('saved')) return new Response('exists', { status: 409 });
    const core = this.build(b.code, b.createdAt, null);
    await this.state.storage.put('saved', { name: b.code, createdAt: b.createdAt, hostKey: [...this.hostKeyBytes] } satisfies Saved);
    this.core = core;
    this.afterEvent();
    return Response.json({ hostKey: core.hostKey, expiresAt: core.codeExpiresAt });
  }

  private hostKeyBytes: Uint8Array = new Uint8Array(0);

  private build(code: string, createdAt: number, hostKey: number[] | null): RoomCore {
    let first = true;
    const random = (n: number): Uint8Array => {
      if (first && hostKey) { first = false; return Uint8Array.from(hostKey); }
      const a = new Uint8Array(n);
      crypto.getRandomValues(a);
      if (first) { first = false; this.hostKeyBytes = a.slice(); }
      return a;
    };
    const core = new RoomCore({ code, createdAt, clock: { now: () => Date.now() }, random });
    core.onRotate = (_old, next) => {
      void this.state.storage.get<Saved>('saved').then((s) => {
        if (!s) return;
        void this.env.PARTY.get(this.env.PARTY.idFromName(next)).fetch('https://do/alias', { method: 'POST', body: JSON.stringify({ origin: s.name }) });
      });
    };
    return core;
  }

  private async load(): Promise<RoomCore | null> {
    if (this.core) return this.core;
    const s = await this.state.storage.get<Saved>('saved');
    if (!s) return null;
    this.core = this.build(s.name, s.createdAt, s.hostKey); // code resets to the original name after eviction (Phase 0 caveat)
    return this.core;
  }

  /** Tick at 5 Hz only while >= 2 sockets are open; an alarm covers the quiet cases (hello timeout, grace, empty close). */
  private afterEvent(): void {
    const core = this.core;
    if (!core) return;
    if (core.ended) {
      if (this.timer) clearInterval(this.timer);
      this.timer = null;
      void this.state.storage.deleteAlarm();
      return;
    }
    const sockets = this.state.getWebSockets().length;
    if (sockets >= 2 && !this.timer) this.timer = setInterval(() => { core.tick(); if (core.ended) this.afterEvent(); }, TICK_MS);
    else if (sockets < 2 && this.timer) { clearInterval(this.timer); this.timer = null; }
    void this.state.storage.setAlarm(Date.now() + ALARM_MS);
  }
}

/** Used by the worker to mint a code. */
export function newPartyCode(): string {
  return generateCode((n) => { const a = new Uint8Array(n); crypto.getRandomValues(a); return a; });
}
