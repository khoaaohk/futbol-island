// Party socket: Hello with look + resume token, backoff reconnect, hidden-tab close, send throttle, heartbeat.
// All timers / clock / randomness / WebSocket / visibility are injectable. Design: docs/multiplayer-design.md 2.5, 4.3, 4.4, 5.1.
import {
  C, PROTOCOL_VERSION, S, TokenBucket, ErrorCode, encode, normalizeCode, parseServer,
  type ClientMsg, type Emote, type Look, type MemberId, type PingKind, type PoseBody, type ServerMsg,
} from '../../multiplayer/protocol';
import { relayWsUrl } from './config';

export type PartyStatus = 'idle' | 'connecting' | 'live' | 'reconnecting' | 'ended' | 'error';
export interface PartyConnection {
  join(code: string, opts: { look: Look; hostKey?: string }): void;
  sendPose(body: PoseBody, nowMs: number): void;
  sendEmote(e: Emote): boolean;
  sendPing(kind: PingKind, x: number, z: number): boolean;
  host: { kick(id: MemberId): void; lock(on: boolean): void; rotate(): void; end(): void };
  leave(): void;
  onMessage(fn: (m: ServerMsg) => void): () => void;
  readonly status: PartyStatus;
  dispose(): void;
  /** Extras beyond the design API (used by index.ts bindConnection). */
  onStatus(fn: (s: PartyStatus) => void): () => void;
  readonly code: string | null;
}

export const SESSION_KEY = 'fi-party-session';
export const SESSION_TTL_MS = 30 * 60 * 1000;
export const BACKOFF_MS = [1000, 2000, 4000, 8000, 15000] as const;
export const JITTER = 0.3;
export const HIDDEN_CLOSE_MS = 15000;
export const BEAT_MS = 5000;
export const MAX_ATTEMPTS = 12;
const MOVE_GAP_MS = 200; // 5 Hz
const IDLE_GAP_MS = 1000; // 1 Hz
const EMOTE_GAP_MS = 2000;
const MOVE_DM = 1.5; // 0.15 m
const YAW_UNITS = (8 * 256) / 360; // 8 degrees

type Session = { code: string; resumeToken: string | null; hostKey: string | null; at: number };
type WSLike = { send(s: string): void; close(): void; readyState: number; onopen: any; onmessage: any; onclose: any; onerror: any };
type StorageLike = { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void };

export type ConnectionDeps = {
  WebSocketImpl?: typeof WebSocket; now?: () => number; random?: () => number;
  setTimeout?: typeof setTimeout; clearTimeout?: typeof clearTimeout;
  visibility?: { hidden(): boolean; on(fn: () => void): () => void };
  storage?: StorageLike | null; // sessionStorage by default
  url?: (code: string) => string | null; // relayWsUrl by default
};

export function createPartyConnection(deps: ConnectionDeps = {}): PartyConnection {
  const WS = (deps.WebSocketImpl ?? (globalThis as any).WebSocket) as any;
  const now = deps.now ?? (() => Date.now());
  const random = deps.random ?? Math.random;
  const st = (deps.setTimeout ?? globalThis.setTimeout.bind(globalThis)) as (fn: () => void, ms: number) => any;
  const ct = (deps.clearTimeout ?? globalThis.clearTimeout.bind(globalThis)) as (h: any) => void;
  const urlFor = deps.url ?? relayWsUrl;
  const vis = deps.visibility ?? defaultVisibility();
  const storage = deps.storage === undefined ? safeSessionStorage() : deps.storage;

  let status: PartyStatus = 'idle';
  let code: string | null = null;
  let look: Look = [];
  let hostKey: string | null = null;
  let resumeToken: string | null = null;
  let ws: WSLike | null = null;
  let attempt = 0;
  let retryTimer: any = null;
  let hiddenTimer: any = null;
  let beatTimer: any = null;
  let pendingResume = false; // wanted a (re)connect while hidden
  let disposed = false;
  let seq = 0;
  let lastSendAt = -1e12;
  let last: PoseBody | null = null;
  let lastPoseAt = -1e12;
  let localHidden = false;
  let lastEmoteAt = -1e12;
  const pingBucket = new TokenBucket(0.33, 2);
  const msgSubs = new Set<(m: ServerMsg) => void>();
  const statusSubs = new Set<(s: PartyStatus) => void>();

  const setStatus = (s: PartyStatus) => { if (s !== status) { status = s; for (const f of Array.from(statusSubs)) f(s); } };
  const open = () => ws !== null && ws.readyState === 1;

  function readSession(): Session | null {
    try {
      const raw = storage?.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw) as Session;
      if (!s || typeof s.code !== 'string' || typeof s.at !== 'number' || now() - s.at > SESSION_TTL_MS) return null;
      return s;
    } catch { return null; }
  }
  function writeSession() {
    if (!code) return;
    try { storage?.setItem(SESSION_KEY, JSON.stringify({ code, resumeToken, hostKey: hostKey ?? undefined, at: now() })); } catch { /* private mode */ }
  }
  function clearSession() { try { storage?.removeItem(SESSION_KEY); } catch { /* ignore */ } }

  function raw(msg: ClientMsg): boolean {
    if (!open()) return false;
    try { ws!.send(encode(msg)); lastSendAt = now(); return true; } catch { return false; }
  }

  function clearTimers() {
    if (retryTimer) { ct(retryTimer); retryTimer = null; }
    if (hiddenTimer) { ct(hiddenTimer); hiddenTimer = null; }
    if (beatTimer) { ct(beatTimer); beatTimer = null; }
  }

  function dropSocket() {
    const w = ws;
    ws = null;
    if (beatTimer) { ct(beatTimer); beatTimer = null; }
    if (w) { w.onopen = w.onmessage = w.onclose = w.onerror = null; try { w.close(); } catch { /* ignore */ } }
  }

  function connect() {
    if (disposed || !code) return;
    if (vis.hidden()) { pendingResume = true; return; }
    pendingResume = false;
    const url = urlFor(code);
    if (!url || !WS) { setStatus('error'); return; }
    dropSocket();
    setStatus(attempt === 0 && status !== 'reconnecting' ? 'connecting' : 'reconnecting');
    let w: WSLike;
    try { w = new WS(url) as WSLike; } catch { scheduleRetry(); return; }
    ws = w;
    w.onopen = () => {
      if (ws !== w) return;
      raw([C.Hello, PROTOCOL_VERSION, look, resumeToken, hostKey]);
      scheduleBeat();
    };
    w.onmessage = (ev: { data: unknown }) => {
      if (ws !== w || typeof ev.data !== 'string') return;
      const m = parseServer(ev.data);
      if (m) handle(m);
    };
    w.onclose = () => { if (ws === w) { ws = null; if (beatTimer) { ct(beatTimer); beatTimer = null; } scheduleRetry(); } };
    w.onerror = () => { /* close follows */ };
  }

  function handle(m: ServerMsg) {
    if (m[0] === S.Welcome) {
      resumeToken = m[3];
      attempt = 0;
      last = null; // first pose after (re)connect is always sent
      writeSession();
      setStatus('live');
    } else if (m[0] === S.Ended) {
      clearSession();
      setStatus('ended');
      dropSocket();
    } else if (m[0] === S.Error) {
      const e = m[1];
      if (e === ErrorCode.Full || e === ErrorCode.NotFound || e === ErrorCode.Expired || e === ErrorCode.Kicked ||
        e === ErrorCode.BadVersion || e === ErrorCode.Locked) {
        clearSession();
        setStatus('error');
        dropSocket();
      }
    }
    for (const f of Array.from(msgSubs)) f(m);
  }

  function scheduleRetry() {
    if (disposed || !code || status === 'ended' || status === 'error' || status === 'idle') return;
    if (retryTimer) return;
    if (attempt >= MAX_ATTEMPTS) { setStatus('error'); return; }
    setStatus('reconnecting');
    const base = BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)];
    const delay = Math.round(base * (1 + (random() * 2 - 1) * JITTER));
    attempt++;
    retryTimer = st(() => {
      retryTimer = null;
      if (vis.hidden()) { pendingResume = true; return; } // no retry while hidden
      connect();
    }, delay);
  }

  function scheduleBeat() {
    if (beatTimer) ct(beatTimer);
    beatTimer = st(() => {
      beatTimer = null;
      if (!open()) return;
      if (now() - lastSendAt >= BEAT_MS - 50) raw([C.Beat, Math.round(now() / 1000)]);
      scheduleBeat();
    }, BEAT_MS);
  }

  const offVis = vis.on(() => {
    if (disposed || !code) return;
    if (vis.hidden()) {
      if (hiddenTimer || status === 'idle' || status === 'ended' || status === 'error') return;
      hiddenTimer = st(() => {
        hiddenTimer = null;
        if (!vis.hidden()) return;
        if (retryTimer) { ct(retryTimer); retryTimer = null; }
        dropSocket();
        pendingResume = true;
        setStatus('reconnecting');
      }, HIDDEN_CLOSE_MS);
    } else {
      if (hiddenTimer) { ct(hiddenTimer); hiddenTimer = null; }
      if (pendingResume || (!ws && !retryTimer && (status === 'reconnecting' || status === 'connecting'))) {
        if (retryTimer) { ct(retryTimer); retryTimer = null; }
        attempt = 0;
        connect();
      }
    }
  });

  function poseMoved(a: PoseBody, b: PoseBody): boolean {
    const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
    if (dx * dx + dy * dy + dz * dz > MOVE_DM * MOVE_DM) return true;
    const dyaw = Math.abs(b[3] - a[3]);
    return Math.min(dyaw, 256 - dyaw) > YAW_UNITS;
  }

  const self: PartyConnection = {
    join(c, opts) {
      const norm = normalizeCode(c);
      if (!norm || disposed) { setStatus('error'); return; }
      clearTimers();
      dropSocket();
      const sess = readSession();
      const same = sess && sess.code === norm;
      code = norm;
      look = opts.look;
      hostKey = opts.hostKey ?? (same ? sess!.hostKey : null) ?? null;
      resumeToken = same ? sess!.resumeToken : null;
      attempt = 0; seq = 0; last = null; lastPoseAt = -1e12; localHidden = false;
      writeSession();
      setStatus('idle'); // reset, then connecting
      connect();
    },
    sendPose(body, nowMs) {
      localHidden = (body[7] & 2) !== 0;
      if (localHidden || !open() || status !== 'live') return;
      let send = false;
      if (!last) send = true;
      else if (body[5] !== last[5] || body[6] !== last[6] || (body[7] & 1) !== 0 || body[7] !== last[7]) send = true; // mode / zone / flags: immediate
      else if (poseMoved(last, body)) send = nowMs - lastPoseAt >= MOVE_GAP_MS;
      else if (body.some((v, i) => v !== last![i])) send = nowMs - lastPoseAt >= IDLE_GAP_MS;
      if (!send) return;
      if (raw([C.Pose, seq & 0xffff, ...body] as ClientMsg)) { seq++; last = body.slice() as PoseBody; lastPoseAt = nowMs; }
    },
    sendEmote(e) {
      const t = now();
      if (localHidden || !open() || t - lastEmoteAt < EMOTE_GAP_MS) return false;
      if (!raw([C.Emote, e])) return false;
      lastEmoteAt = t;
      return true;
    },
    sendPing(kind, x, z) {
      if (localHidden || !open() || !pingBucket.take(now())) return false;
      return raw([C.Ping, kind, Math.round(x * 10), Math.round(z * 10)]);
    },
    host: {
      kick: (id) => { raw([C.Kick, id]); },
      lock: (on) => { raw([C.Lock, on ? 1 : 0]); },
      rotate: () => { raw([C.Rotate]); },
      end: () => { raw([C.End]); },
    },
    leave() {
      if (open()) raw([C.Leave]);
      clearTimers();
      dropSocket();
      clearSession();
      code = null; resumeToken = null; hostKey = null; pendingResume = false; last = null;
      setStatus('idle');
    },
    onMessage(fn) { msgSubs.add(fn); return () => { msgSubs.delete(fn); }; },
    onStatus(fn) { statusSubs.add(fn); return () => { statusSubs.delete(fn); }; },
    get status() { return status; },
    get code() { return code; },
    dispose() {
      if (disposed) return;
      clearTimers();
      dropSocket();
      offVis();
      msgSubs.clear(); statusSubs.clear();
      disposed = true;
    },
  };
  return self;
}

function defaultVisibility() {
  return {
    hidden: () => typeof document !== 'undefined' && document.visibilityState === 'hidden',
    on: (fn: () => void) => {
      if (typeof document === 'undefined') return () => {};
      document.addEventListener('visibilitychange', fn);
      return () => document.removeEventListener('visibilitychange', fn);
    },
  };
}

function safeSessionStorage(): StorageLike | null {
  try { return typeof sessionStorage === 'undefined' ? null : sessionStorage; } catch { return null; }
}
