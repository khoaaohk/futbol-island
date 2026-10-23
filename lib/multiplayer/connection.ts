// Party socket: Hello with look + resume token, backoff reconnect, hidden-tab close, send throttle, heartbeat.
// All timers / clock / randomness / WebSocket / visibility are injectable. Design: docs/multiplayer-design.md 2.5, 4.3, 4.4, 5.1.
import {
  C, PARTY_MAX_MS, PROTOCOL_VERSION, S, PoseFlag, TokenBucket, ErrorCode, encode, normalizeCode, normalizeNick, parseServer,
  Cap, CAPS_ALL, BallState, WORLD_BOUNDS, type ClientMsg, type Emote, type Look, type MemberId, type PingKind, type PoseBody, type ServerMsg,
} from '../../multiplayer/protocol';
import { relayWsUrl } from './config';

export type PartyStatus = 'idle' | 'connecting' | 'live' | 'reconnecting' | 'ended' | 'error';
export interface PartyConnection {
  /** nick: the typed first name (memory only: sent in Hello, never stored; the UI requires a valid one, the relay refuses a bad one with BadName). */
  join(code: string, opts: { look: Look; hostKey?: string; nick?: string | null }): void;
  /** Party persistence: back into the party this tab was in (a reload, a room page round trip, back / forward, an island remount).
   *  Uses the stored session ({code, resumeToken, hostKey}); sends no name (the relay keeps it on the slot). True when a resume
   *  started; false when there is no stored session or the connection is already in a party. Status goes 'reconnecting' then 'live'. */
  resume(opts: { look: Look }): boolean;
  /** True while this device holds a party session (the stored one, within the party cap). */
  hasSession(): boolean;
  /** Party rejoin (Oct 22 2026): "Use it here". Like resume(), but takes the party over from another tab of this browser (that tab
   *  goes quiet with tab 'moved', its stored session untouched). False when nothing is stored or already in a party. */
  takeOver(opts: { look: Look }): boolean;
  /** The stored party for the Play with friends menu: its code and whether this device holds its host key (never the key or the
   *  token themselves). Null when nothing is stored or it is past the 12 h cap. */
  storedParty(): { code: string; host: boolean } | null;
  /** Forget the stored party (a rejoin found that the party ended). */
  forget(): void;
  /** Which tab owns the party: 'here' (this tab), 'elsewhere' (another tab held it when this page tried to resume), 'moved'
   *  (another tab took it over), null (no party). */
  readonly tab: TabState;
  /** A resume reached the relay but the slot had lapsed (60 s / 10 min grace): the stored session is kept so the menu can offer
   *  'Join with the code' with the code filled in. Reset by the next join / resume. */
  readonly lapsed: boolean;
  /** tab / lapsed changed. */
  onLocal(fn: () => void): () => void;
  sendPose(body: PoseBody, nowMs: number): void;
  /** Live feel: the local ball (metres; island only). Sent only to a v1.2 relay (Cap.Ball), on a state change, and for a Free ball at
   *  most every BALL_GAP_MS while it moves. Visual only for friends. */
  sendBall(state: BallState, x: number, y: number, z: number, nowMs: number): void;
  /** The capability bits agreed with the relay (0 = an old relay: 5 Hz poses, no ball). */
  readonly caps: number;
  sendEmote(e: Emote): boolean;
  /** Relay v1.4 (Cap.EmoteAsk): ask friend `to` to play a two-player ball emote; false (not sent) on an old relay, away, or not live. */
  sendEmoteAsk(to: MemberId, e: Emote): boolean;
  /** Relay v1.4: my answer to `from`'s ask (true = Join). */
  sendEmoteAnswer(from: MemberId, yes: boolean): boolean;
  /** Change MY OWN first name mid-party (Your party > List). n goes through normalizeNick (the join form's rules); memory only, like the
   *  join name: every later reconnect Hello carries it. 'sent': a v1.3 relay (Cap.Rename) gets C.Rename now (or the next resume Hello)
   *  and re-announces me to friends. 'local': an old relay (no Cap.Rename): only this device shows it until a resume reaches a v1.3 relay.
   *  null: not a valid name, not in a party, or the host reset my name (it stays reset for this party, kid safety). */
  rename(n: string): 'sent' | 'local' | null;
  /** The host reset my typed name in this party: no Change name until the next party. */
  readonly nameLocked: boolean;
  sendPing(kind: PingKind, x: number, z: number): boolean;
  host: { resetName(id: MemberId): void; kick(id: MemberId): void; lock(on: boolean): void; rotate(): void; end(): void };
  leave(): void;
  onMessage(fn: (m: ServerMsg) => void): () => void;
  /** Called on every 5 s beat tick before the beat is sent (the island bridge sends a Busy pose from here while the frame loop sleeps;
   *  anything it sends counts as the beat). No extra timer. */
  onBeforeBeat(fn: (() => void) | null): void;
  readonly status: PartyStatus;
  dispose(): void;
  /** Extras beyond the design API (used by index.ts bindConnection). */
  onStatus(fn: (s: PartyStatus) => void): () => void;
  readonly code: string | null;
  /** Connection health for this party (Oct 22 2026, docs/analytics-multiplayer-plan.md §7 RTT): the median round trip (ms) of the
   *  last heartbeat echoes (null before the first), and how many unexpected drops were recovered. Reset by join(). Plain numbers:
   *  this file stays analytics-free; partyStore.health() reads them and PartyHost passes a band to its onTrack callback. */
  readonly rttMs: number | null;
  readonly reconnects: number;
}

/** Party rejoin (Oct 22 2026, docs/multiplayer-design.md "Party rejoin"): the stored session lives in device storage (this device,
 *  every tab) so a player who closed the tab can get back in. Device-only (a DEVICE key in the save allowlist): never part of a
 *  save code. Holds {code, resumeToken, hostKey, at} only, never the first name; the token and key go only to the relay. */
export const SESSION_KEY = 'fi2-party-session-v1';
/** Before Oct 22 2026 the session lived per tab (sessionStorage) under this key: moved over once, then removed. */
const OLD_TAB_KEY = 'fi-party-session';
/** Only one tab holds the live connection: a Web Lock with this name (navigator.locks). A page without Web Locks falls back to the
 *  relay's own rule: the newest tab wins and the older one is closed with 4005. */
export const HOLDER_LOCK = 'fi2-party-holder';
/** The stored session lives as long as a party can (12 h cap); it is cleared only by Leave / End / Kicked / ended / expired.
 *  NOT by 4005 (another tab took the party over: that tab owns it now). */
export const SESSION_TTL_MS = PARTY_MAX_MS;
export type TabState = 'here' | 'elsewhere' | 'moved' | null;
export const BACKOFF_MS = [1000, 2000, 4000, 8000, 15000] as const;
export const JITTER = 0.3;
export const HIDDEN_CLOSE_MS = 15000;
export const BEAT_MS = 5000;
export const MAX_ATTEMPTS = 12;
/** A resume (no Welcome yet in this page) gives up after this many failed sockets (~15 s): the relay refuses the upgrade (404) once a
 *  party is gone. Online at that point, the stored session is cleared (the party ended while away); offline, it is kept for next time. */
export const RESUME_ATTEMPTS = 4;
const CLOSE_KICKED = 4003, CLOSE_ENDED = 4004, CLOSE_REPLACED = 4005; // relay close codes (roomCore CLOSE)
const MOVE_GAP_MS = 200; // 5 Hz (an old relay: its pose bucket is 8 / s)
/** Live feel: ~10 Hz while moving once the relay said it is v1.2 (S.Caps with Cap.Live); its pose bucket is 12 / s. */
export const LIVE_MOVE_GAP_MS = 90; // 90, not 100: on a 60 / 30 fps frame loop the real gap lands on 90-107 / 100 ms (never the 117-133 a 100 ms gap gives)
/** A free (shot / rolling) ball: at most 10 updates a second, and only when it moved more than BALL_MOVE_DM. */
export const BALL_GAP_MS = 100;
const BALL_MOVE_DM = 1;
const IDLE_GAP_MS = 1000; // 1 Hz
const EMOTE_GAP_MS = 2000;
const MOVE_DM = 1.5; // 0.15 m
const YAW_UNITS = (8 * 256) / 360; // 8 degrees

type Session = { code: string; resumeToken: string | null; hostKey: string | null; at: number };
type WSLike = { send(s: string): void; close(): void; readyState: number; onopen: any; onmessage: any; onclose: any; onerror: any };
type StorageLike = { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void };
/** The navigator.locks shape used here (injectable: tests pass a fake). */
export type LockManagerLike = {
  request(name: string, opts: { ifAvailable?: boolean; steal?: boolean }, cb: (lock: unknown) => unknown): PromiseLike<unknown>;
};

export type ConnectionDeps = {
  WebSocketImpl?: typeof WebSocket; now?: () => number; random?: () => number;
  setTimeout?: typeof setTimeout; clearTimeout?: typeof clearTimeout;
  visibility?: { hidden(): boolean; on(fn: () => void): () => void };
  storage?: StorageLike | null; // device storage by default (deviceStorage(); see SESSION_KEY)
  locks?: LockManagerLike | null; // navigator.locks by default; null = no tab coordination (the relay's 4005 decides)
  url?: (code: string) => string | null; // relayWsUrl by default
  /** Send a heartbeat at least this often even while poses flow, so the RTT has samples while moving (one ~10-byte message).
   *  0 = only the normal idle beat. Default: 30 s when NEXT_PUBLIC_ANALYTICS_PARTY_RETENTION=1, else 0 (Phase C switch). */
  rttProbeMs?: number;
  /** navigator.onLine by default (a failed resume clears the stored session only while online). */
  online?: () => boolean;
};
export const RTT_SAMPLES = 15;
export const RTT_PROBE_MS = 30000;

export function createPartyConnection(deps: ConnectionDeps = {}): PartyConnection {
  const WS = (deps.WebSocketImpl ?? (globalThis as any).WebSocket) as any;
  const now = deps.now ?? (() => Date.now());
  const random = deps.random ?? Math.random;
  const st = (deps.setTimeout ?? globalThis.setTimeout.bind(globalThis)) as (fn: () => void, ms: number) => any;
  const ct = (deps.clearTimeout ?? globalThis.clearTimeout.bind(globalThis)) as (h: any) => void;
  const urlFor = deps.url ?? relayWsUrl;
  const vis = deps.visibility ?? defaultVisibility();
  const storage = deps.storage === undefined ? deviceStorage() : deps.storage;
  const locks = deps.locks === undefined ? defaultLocks() : deps.locks;
  const online = deps.online ?? (() => typeof navigator === 'undefined' || navigator.onLine !== false);
  const rttProbeMs = deps.rttProbeMs ?? (process.env.NEXT_PUBLIC_ANALYTICS_PARTY_RETENTION === '1' ? RTT_PROBE_MS : 0);

  let status: PartyStatus = 'idle';
  let code: string | null = null;
  let look: Look = [];
  let hostKey: string | null = null;
  let nick: string | null = null; // in memory only; cleared if the host resets it, so a reconnect never sends it back
  let nameLocked = false; // the host reset my name: no self rename for the rest of this party
  let renamePending = false; // a rename made while the socket was down: sent after the next S.Caps
  let you: number | null = null;
  let resumeToken: string | null = null;
  let ws: WSLike | null = null;
  let attempt = 0;
  let retryTimer: any = null;
  let hiddenTimer: any = null;
  let beatTimer: any = null;
  let pendingResume = false; // wanted a (re)connect while hidden
  let resuming = false; // resume() started and no Welcome yet
  let disposed = false;
  let seq = 0;
  let lastSendAt = -1e12;
  let last: PoseBody | null = null;
  let lastPoseAt = -1e12;
  let localHidden = false;
  let beforeBeat: (() => void) | null = null;
  let lastEmoteAt = -1e12;
  let caps = 0; // agreed with the relay after each Welcome (S.Caps -> C.Caps)
  let ballSt = -1, ballX = 0, ballY = 0, ballZ = 0, ballAt = -1e12;
  const pingBucket = new TokenBucket(0.33, 2);
  // Health: the last beat sent (its echoed value and local send time), recent round trips, drops recovered.
  let beatOut: { v: number; at: number } | null = null;
  let lastProbeAt = -1e12;
  let rtts: number[] = [];
  let reconnects = 0;
  let dropped = false;
  // Tab ownership (Party rejoin): the Web Lock this page holds while it owns the party, and what the menu should say.
  let holding: { release: () => void; token: object } | null = null;
  let acquiring = false;
  let opGen = 0; // bumped by every join / resume / leave / dispose: a late lock grant for an older request is let go
  let tab: TabState = null;
  let lapsed = false;
  const localSubs = new Set<() => void>();
  const msgSubs = new Set<(m: ServerMsg) => void>();
  const statusSubs = new Set<(s: PartyStatus) => void>();

  const setStatus = (s: PartyStatus) => { if (s !== status) { status = s; for (const f of Array.from(statusSubs)) f(s); } };
  const open = () => ws !== null && ws.readyState === 1;
  const setLocal = (t: TabState, l: boolean) => { if (t !== tab || l !== lapsed) { tab = t; lapsed = l; for (const f of Array.from(localSubs)) f(); } };

  /** Take the holder lock (steal: from another tab), then got(); busy() when another tab holds it (ifAvailable). No Web Locks:
   *  got() at once. A stolen lock (another tab tapped Use it here) makes this page go quiet (movedAway). */
  function acquire(steal: boolean, got: () => void, busy: () => void) {
    if (holding || !locks) { got(); return; }
    const token = {};
    let release: () => void = () => {};
    let decided = false;
    acquiring = true;
    let p: PromiseLike<unknown> | null = null;
    try {
      p = locks.request(HOLDER_LOCK, steal ? { steal: true } : { ifAvailable: true }, (lock) => {
        decided = true; acquiring = false;
        if (!lock) { busy(); return undefined; }
        const held = new Promise<void>((r) => { release = r; });
        holding = { release: () => release(), token };
        got();
        return held;
      });
    } catch { acquiring = false; got(); return; }
    if (p && typeof p.then === 'function') {
      p.then(() => { if (holding?.token === token) holding = null; }, () => {
        if (holding?.token === token) { holding = null; movedAway(); } // stolen (AbortError): another tab owns the party now
        else if (!decided) { acquiring = false; got(); } // the lock request itself failed: carry on without coordination
      });
    }
  }
  function releaseLock() { const h = holding; holding = null; if (h) h.release(); }
  /** Another tab owns the party now: close quietly, keep the stored session (that tab uses it), no reconnect. */
  function movedAway() {
    opGen++;
    clearTimers(); dropSocket(); releaseLock();
    code = null; resumeToken = null; hostKey = null; last = null; pendingResume = false; resuming = false;
    setLocal('moved', false);
    setStatus('idle');
  }

  function readSession(): Session | null {
    try {
      const raw = storage?.getItem(SESSION_KEY) ?? migrateTabSession(storage);
      if (!raw) return null;
      const s = JSON.parse(raw) as Session;
      if (!s || typeof s.code !== 'string' || typeof s.at !== 'number') return null;
      if (now() - s.at > SESSION_TTL_MS) { clearSession(); return null; } // past the 12 h cap: removed, not just ignored (privacy policy 3 / 7a)
      return s;
    } catch { return null; }
  }
  function writeSession() {
    if (!code) return;
    try { storage?.setItem(SESSION_KEY, JSON.stringify({ code, resumeToken, hostKey: hostKey ?? undefined, at: now() })); } catch { /* private mode */ }
  }
  function clearSession() { try { storage?.removeItem(SESSION_KEY); } catch { /* ignore */ } }
  /** The party is over for this page (left, ended, kicked, refused): forget it and free the holder lock. */
  function endHere() { clearSession(); releaseLock(); setLocal(null, false); }

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
      // Slot 5 is the reserved old animal field: always null. With no name (never from the UI; after a host reset) send the old 5-element Hello = colour name only.
      // A resume (no name in this page) sends an EMPTY name slot: a live slot resumes as before, a lapsed one is refused (BadName)
      // instead of becoming a nameless new slot, so the player is asked for the code and name again (Party rejoin).
      const hello: ClientMsg = nick !== null ? [C.Hello, PROTOCOL_VERSION, look, resumeToken, hostKey, null, nick]
        : resuming ? [C.Hello, PROTOCOL_VERSION, look, resumeToken, hostKey, null, null]
        : [C.Hello, PROTOCOL_VERSION, look, resumeToken, hostKey];
      raw(hello);
      scheduleBeat();
    };
    w.onmessage = (ev: { data: unknown }) => {
      if (ws !== w || typeof ev.data !== 'string') return;
      const m = parseServer(ev.data);
      if (m) handle(m);
    };
    w.onclose = (ev: { code?: number } | undefined) => {
      if (ws !== w) return;
      ws = null;
      if (beatTimer) { ct(beatTimer); beatTimer = null; }
      const cc = ev && typeof ev.code === 'number' ? ev.code : 0;
      // Terminal close codes (review #15): never reconnect after being kicked, after the party ended, or after another tab took over.
      if (cc === CLOSE_REPLACED) { movedAway(); return; } // another tab resumed this slot: it owns the stored session now
      if (cc === CLOSE_KICKED || cc === CLOSE_ENDED) {
        clearTimers(); endHere();
        if (cc === CLOSE_KICKED) setStatus('error');
        else setStatus('ended');
        return;
      }
      if (status === 'live') dropped = true; // an unexpected drop (a hidden-tab close never reaches here)
      scheduleRetry();
    };
    w.onerror = () => { /* close follows */ };
  }

  function handle(m: ServerMsg) {
    if (m[0] === S.Welcome) {
      resumeToken = m[3];
      you = m[2];
      attempt = 0; resuming = false;
      setLocal('here', false);
      if (dropped) { dropped = false; reconnects++; }
      last = null; // first pose after (re)connect is always sent
      caps = 0; ballSt = -1; // the relay sends S.Caps after every Welcome (an old relay never does)
      writeSession();
      setStatus('live');
    } else if (m[0] === S.Caps) {
      caps = m[1] & CAPS_ALL;
      if (caps) raw([C.Caps, caps]);
      if (renamePending && nick !== null && (caps & Cap.Rename) && !nameLocked && raw([C.Rename, nick])) renamePending = false;
    } else if (m[0] === S.Renamed) {
      if (m[1] === you) { nick = null; nameLocked = true; } // the host reset my name: never send it again on a reconnect
    } else if (m[0] === S.Code) {
      // Rotate: the room now lives under a new code. Every later reconnect (and the stored session) must use it (review #1).
      code = m[1];
      writeSession();
    } else if (m[0] === S.Beat) {
      if (beatOut && m[1] === beatOut.v) {
        const rtt = now() - beatOut.at; beatOut = null;
        if (rtt >= 0 && rtt < 10000) { rtts.push(rtt); if (rtts.length > RTT_SAMPLES) rtts.shift(); }
      }
    } else if (m[0] === S.Ended) {
      clearTimers(); pendingResume = false; // bug sweep Oct 22: a pending hidden-tab close must not turn 'ended' back into 'reconnecting'
      endHere();
      setStatus('ended');
      dropSocket();
    } else if (m[0] === S.Error) {
      const e = m[1];
      if (e === ErrorCode.BadName && resuming) {
        // A resume Hello carries an empty name slot: the relay refuses it with BadName only when the slot lapsed (a live slot resumes
        // first). Keep the stored session: the menu offers 'Join with the code' with the code filled in (and the name asked again).
        resuming = false; clearTimers(); dropSocket(); releaseLock();
        code = null; resumeToken = null; hostKey = null;
        setLocal(null, true);
        setStatus('error');
      } else if (e === ErrorCode.Full || e === ErrorCode.NotFound || e === ErrorCode.Expired || e === ErrorCode.Kicked ||
        e === ErrorCode.BadVersion || e === ErrorCode.Locked || e === ErrorCode.BadName) {
        clearTimers(); pendingResume = false; resuming = false;
        endHere();
        setStatus('error');
        dropSocket();
      }
    }
    for (const f of Array.from(msgSubs)) f(m);
  }

  function scheduleRetry() {
    if (disposed || !code || status === 'ended' || status === 'error' || status === 'idle') return;
    if (retryTimer) return;
    if (resuming && attempt >= RESUME_ATTEMPTS) {
      resuming = false; if (online()) clearSession();
      releaseLock(); setLocal(null, false);
      code = null; resumeToken = null; hostKey = null;
      setStatus('error'); return;
    }
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
      if (beforeBeat) { try { beforeBeat(); } catch { /* the bridge must never stop the beat */ } }
      const t = now(), probe = rttProbeMs > 0 && t - lastProbeAt >= rttProbeMs;
      if (t - lastSendAt >= BEAT_MS - 50 || probe) {
        const v = Math.round(t / 1000);
        if (raw([C.Beat, v])) { beatOut = { v, at: t }; lastProbeAt = t; }
      }
      scheduleBeat();
    }, Math.max(50, Math.min(BEAT_MS, BEAT_MS - (now() - lastSendAt)))); // due 5 s after the LAST frame sent (never a ~10 s gap)
  }

  const offVis = vis.on(() => {
    if (disposed || !code) return;
    if (vis.hidden()) {
      // Away at once (design 4.4.1): the last pose again with the Hidden flag, so friends see the zzz field instead of a statue.
      if (status === 'live' && last && (last[7] & PoseFlag.Hidden) === 0) {
        const away = last.slice() as PoseBody; away[7] = (away[7] | PoseFlag.Hidden) & ~PoseFlag.Warp;
        if (raw([C.Pose, seq, ...away] as ClientMsg)) { seq++; last = away; }
      }
      if (hiddenTimer || status === 'idle' || status === 'ended' || status === 'error') return;
      hiddenTimer = st(() => {
        hiddenTimer = null;
        if (!vis.hidden() || status === 'idle' || status === 'ended' || status === 'error') return;
        if (retryTimer) { ct(retryTimer); retryTimer = null; }
        dropSocket();
        pendingResume = true;
        setStatus('reconnecting');
      }, HIDDEN_CLOSE_MS);
    } else {
      if (hiddenTimer) { ct(hiddenTimer); hiddenTimer = null; }
      last = null; // back: the next frame's pose (no Hidden flag) is sent at once
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

  /** resume() / takeOver(): back into the stored party once this page holds the party (or another tab holds it: tab 'elsewhere'). */
  function start(opts: { look: Look }, steal: boolean): boolean {
    if (disposed || code || acquiring || (status !== 'idle' && status !== 'error' && status !== 'ended')) return false;
    const sess = readSession();
    if (!sess || !sess.resumeToken) return false;
    const norm = normalizeCode(sess.code);
    if (!norm) { clearSession(); return false; }
    const gen = ++opGen;
    acquire(steal, () => {
      if (gen !== opGen || disposed) { releaseLock(); return; } // a late grant for an older request (Leave / dispose / a newer op since): let it go
      const now2 = readSession(); // another tab may have ended the party while the lock was on its way
      if (!now2 || !now2.resumeToken || normalizeCode(now2.code) !== norm) { releaseLock(); setLocal(null, false); return; }
      clearTimers(); dropSocket();
      code = norm; look = opts.look; nick = null; you = null;
      hostKey = now2.hostKey ?? null; resumeToken = now2.resumeToken;
      attempt = 0; seq = 0; last = null; lastPoseAt = -1e12; localHidden = false;
      beatOut = null; lastProbeAt = -1e12; rtts = []; reconnects = 0; dropped = false;
      resuming = true;
      setLocal('here', false);
      setStatus('reconnecting'); // the 'Reconnecting' note, never 'connecting' (a fresh join)
      connect();
    }, () => { if (gen === opGen && !disposed) setLocal('elsewhere', false); });
    return true;
  }

  const self: PartyConnection = {
    join(c, opts) {
      const norm = normalizeCode(c);
      if (!norm || disposed) { setStatus('error'); return; }
      clearTimers();
      dropSocket();
      const gen = ++opGen;
      // An explicit create / join makes this tab the party tab (a tab still in another party goes quiet).
      if (!holding && locks) {
        setStatus('connecting');
        acquire(true, () => { if (gen === opGen && !disposed) self.join(c, opts); else releaseLock(); }, () => {}); // stale grant: let it go
        return;
      }
      const sess = readSession();
      const same = sess && sess.code === norm;
      code = norm;
      look = opts.look;
      nick = normalizeNick(opts.nick ?? null);
      if (!same) nameLocked = false; // a new party: the old host's reset does not carry over
      renamePending = false;
      you = null;
      hostKey = opts.hostKey ?? (same ? sess!.hostKey : null) ?? null;
      resumeToken = same ? sess!.resumeToken : null;
      attempt = 0; seq = 0; last = null; lastPoseAt = -1e12; localHidden = false;
      beatOut = null; lastProbeAt = -1e12; rtts = []; reconnects = 0; dropped = false; resuming = false;
      writeSession();
      setLocal('here', false);
      setStatus('idle'); // reset, then connecting
      connect();
    },
    resume(opts) { return start(opts, false); },
    takeOver(opts) { return start(opts, true); },
    hasSession() { return readSession() !== null; },
    storedParty() {
      const s = readSession();
      const c = s ? normalizeCode(s.code) : null;
      return s && c ? { code: c, host: typeof s.hostKey === 'string' && s.hostKey.length > 0 } : null;
    },
    forget() { if (!code) { clearSession(); setLocal(null, false); } },
    get tab() { return tab; },
    get lapsed() { return lapsed; },
    onLocal(fn) { localSubs.add(fn); return () => { localSubs.delete(fn); }; },
    onBeforeBeat(fn) { beforeBeat = fn; },
    sendPose(body, nowMs) {
      // Hidden (away) is sent like any flag change (once); while hidden, emotes and pings stay off.
      localHidden = (body[7] & 2) !== 0;
      if (!open() || status !== 'live') return;
      let send = false;
      if (!last) send = true;
      else if (body[5] !== last[5] || body[6] !== last[6] || (body[7] & 1) !== 0 || body[7] !== last[7]) send = true; // mode / zone / flags: immediate
      else if (poseMoved(last, body)) send = nowMs - lastPoseAt >= ((caps & Cap.Live) ? LIVE_MOVE_GAP_MS : MOVE_GAP_MS);
      else if (body.some((v, i) => v !== last![i])) send = nowMs - lastPoseAt >= IDLE_GAP_MS;
      if (!send) return;
      if (raw([C.Pose, seq, ...body] as ClientMsg)) { seq++; last = body.slice() as PoseBody; lastPoseAt = nowMs; }
    },
    sendBall(state, x, y, z, nowMs) {
      if (!(caps & Cap.Ball) || !open() || status !== 'live') return;
      const st = localHidden ? BallState.None : state;
      const B = WORLD_BOUNDS, q = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round((Number.isFinite(v) ? v : 0) * 10)));
      const qx = q(x, B.minX, B.maxX), qy = q(y, B.minY, B.maxY), qz = q(z, B.minZ, B.maxZ);
      if (nowMs - ballAt < BALL_GAP_MS) return; // a state change waits too (sendBall runs every frame, so it goes out next time)
      if (st === ballSt) {
        if (st !== BallState.Free) return;
        const dx = qx - ballX, dy = qy - ballY, dz = qz - ballZ;
        if (dx * dx + dy * dy + dz * dz <= BALL_MOVE_DM * BALL_MOVE_DM) return;
      }
      if (raw([C.Ball, st, qx, qy, qz])) { ballSt = st; ballX = qx; ballY = qy; ballZ = qz; ballAt = nowMs; }
    },
    get caps() { return caps; },
    get nameLocked() { return nameLocked; },
    rename(n) {
      const v = normalizeNick(n);
      if (v === null || nameLocked || code === null || status === 'idle' || status === 'ended' || status === 'error') return null;
      nick = v;
      if (!(caps & Cap.Rename)) return 'local';
      // Not connected right now: sent right after the next S.Caps (a resume Hello never renames).
      renamePending = !(open() && status === 'live' && raw([C.Rename, v]));
      return 'sent';
    },
    sendEmote(e) {
      const t = now();
      if (localHidden || !open() || t - lastEmoteAt < EMOTE_GAP_MS) return false;
      if (!raw([C.Emote, e])) return false;
      lastEmoteAt = t;
      return true;
    },
    sendEmoteAsk(to, e) {
      if (!(caps & Cap.EmoteAsk) || localHidden || !open() || status !== 'live') return false;
      return raw([C.EmoteAsk, to, e]);
    },
    sendEmoteAnswer(from, yes) {
      if (!(caps & Cap.EmoteAsk) || !open() || status !== 'live') return false;
      return raw([C.EmoteAnswer, from, yes ? 1 : 0]);
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
      resetName: (id) => { raw([C.ResetName, id]); },
    },
    leave() {
      if (open()) raw([C.Leave]);
      opGen++; acquiring = false;
      clearTimers();
      dropSocket();
      endHere();
      code = null; resumeToken = null; hostKey = null; nick = null; nameLocked = false; renamePending = false; pendingResume = false; last = null; resuming = false;
      setStatus('idle');
    },
    onMessage(fn) { msgSubs.add(fn); return () => { msgSubs.delete(fn); }; },
    onStatus(fn) { statusSubs.add(fn); return () => { statusSubs.delete(fn); }; },
    get status() { return status; },
    get code() { return code; },
    get rttMs() {
      if (!rtts.length) return null;
      const s = rtts.slice().sort((a, b) => a - b), h = s.length >> 1;
      return Math.round(s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2);
    },
    get reconnects() { return reconnects; },
    dispose() {
      if (disposed) return;
      opGen++;
      clearTimers();
      dropSocket();
      releaseLock(); // the stored session stays (the next page resumes it)
      offVis();
      msgSubs.clear(); statusSubs.clear(); localSubs.clear();
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

/** The device's storage for the one party session key (SESSION_KEY). The only persistent storage lib/multiplayer touches
 *  (tests/mp-client.cjs checks it): never the first name, never anything else. */
function deviceStorage(): StorageLike | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage; } catch { return null; }
}
/** A session stored per tab by an older build (sessionStorage) moves to the device key once. */
function migrateTabSession(storage: StorageLike | null | undefined): string | null {
  try {
    if (!storage || typeof sessionStorage === 'undefined') return null;
    const old = sessionStorage.getItem(OLD_TAB_KEY);
    if (!old) return null;
    sessionStorage.removeItem(OLD_TAB_KEY);
    storage.setItem(SESSION_KEY, old);
    return old;
  } catch { return null; }
}
function defaultLocks(): LockManagerLike | null {
  try { return typeof navigator !== 'undefined' && (navigator as any).locks && typeof (navigator as any).locks.request === 'function' ? (navigator as any).locks : null; } catch { return null; }
}
