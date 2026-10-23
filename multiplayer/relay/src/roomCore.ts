// Pure party-room logic: no Cloudflare or Node APIs. Used by the Durable Object (partyRoom.ts) and the Node dev relay.
// Design: docs/multiplayer-design.md 4.4 / 4.5. Time and randomness are injected so tests are deterministic.
import {
  C, S, PROTOCOL_VERSION, PARTY_MAX, MAX_MEMBER_ID, INTEREST_NEAR, BEACON_EVERY, CODE_TTL_MS, PARTY_MAX_MS, RESUME_GRACE_MS, HOST_GRACE_MS, AWAY_GRACE_MS, EMPTY_CLOSE_MS,
  ErrorCode, Mode, EndReason, LeaveReason, Zone, PoseFlag, RATE, TokenBucket, Cap, CAPS_ALL, LIVE_NEAR, LIVE_RANGE_M, BALL_RANGE_M, BallState, EMOTE_ASK, AskReply,
  HIT_RANGE_M, HIT_RATE_MAX, HIT_RATE_WINDOW_MS, HIT_PAIR_COOLDOWN_MS,
  parseClient, encode, clampPose, roomBoundsOk, roomOf, speedOk, generateCode, pickNameWith, sha256Hex, normalizeNick, AWAY_SILENCE_MS, presenceOf, shielded,
} from '../../protocol';
import { peakBucket, lenBucket, joinsBucket, msgsBucket, ERR_NAMES } from './relayStatsCore';
import type { RoomSummary, FailReason } from './relayStatsCore';
import type { ClientMsg, Emote, PingKind, MemberInfo, NameIdx, PoseBody, ServerMsg } from '../../protocol';

/** Party persistence (docs/multiplayer-design.md "Party persistence"): how long a gone member keeps their slot. A member whose last
 *  pose said they stepped away on purpose (a room page: Zone.Indoors; a menu, lesson or the walkthrough: Mode.Busy; a background tab:
 *  the Hidden flag) gets AWAY_GRACE_MS (10 min); a plain drop keeps `plain` (60 s for a member, 30 s before the host migrates).
 *  The relay's own away mark (silence) does not count: only what the client announced. */
export function graceFor(m: { pose: PoseBody | null; relayAway?: boolean }, plain: number): number {
  const p = m.pose;
  if (!p) return plain;
  const announcedHidden = (p[7] & PoseFlag.Hidden) !== 0 && !m.relayAway;
  return p[6] === Zone.Indoors || p[5] === Mode.Busy || announcedHidden ? Math.max(plain, AWAY_GRACE_MS) : plain;
}

export interface Peer { send(text: string): void; close(code: number): void }
export interface RoomClock { now(): number }
/** What a Durable Object must keep so an eviction cannot revive an ended party, a retired code or a revoked token (review #2). */
export interface RoomSnapshot { code: string; codeIssuedAt: number; locked: boolean; revoked: string[]; retired: string[]; stats?: RoomStatsSnapshot }
/** Aggregate counters only (no codes, names, ids, tokens or times). Persisted in the snapshot so an eviction keeps them. */
export interface RoomCounters {
  peak: number; joins: number; resumes: number; kicks: number; rotates: number; locks: number; nameResets: number; rateCloses: number; msgs: number;
  /** Relay v1.1: room poses dropped for standing outside their room's bounds (a count only; never a kick). */
  roomOob: number;
  fails: Record<string, number>; errs: Record<string, number>; endReason: number; // endReason -1 while the party is live
}
/** The counters plus their fixed bucket names as they stand now. */
export interface RoomStatsSnapshot extends RoomCounters { buckets: { peak: string; len: string; joins: string; msgs: string } }
const newCounters = (): RoomCounters => ({ peak: 0, joins: 0, resumes: 0, kicks: 0, rotates: 0, locks: 0, nameResets: 0, rateCloses: 0, msgs: 0, roomOob: 0, fails: {}, errs: {}, endReason: -1 });
const FAIL_OF: Partial<Record<number, FailReason>> = {
  [ErrorCode.Expired]: 'expired', [ErrorCode.Full]: 'full', [ErrorCode.NotFound]: 'not_found', [ErrorCode.BadName]: 'bad_name',
  [ErrorCode.Locked]: 'locked', [ErrorCode.RateLimited]: 'rate_limited',
};
/** Per-socket state a hibernating Durable Object keeps with serializeAttachment so members survive an eviction. */
export interface MemberAttachment { id: number; name: NameIdx; look: number[]; token: string; joinSeq: number; host: boolean; nameLock?: 1 }

/** WebSocket close codes the relay uses (4xxx = application range). */
export const CLOSE = {
  Normal: 1000, HelloTimeout: 4000, BadMessages: 4001, Flood: 4002, Kicked: 4003, Ended: 4004, Replaced: 4005, Refused: 4006,
} as const;

const HELLO_TIMEOUT_MS = 5000;
const BAD_FRAME_LIMIT = 5;
const WARP_MIN_GAP_MS = 5000;
/** Relay v1.1: a change of room (island <-> room, room <-> room) is an implicit warp, at most one per second (no page loads faster). */
const ROOM_FLIP_MIN_GAP_MS = 1000;
export const KICK_LOCK_MS = 60_000; // auto-lock after a kick (review #6)

interface Member {
  // nick: the typed first name. In memory on the member ONLY: never in attachments, snapshots, storage or logs (owner decision).
  id: number; name: NameIdx; nick: string | null; look: number[]; token: string; joinSeq: number;
  peer: Peer | null; goneAt: number | null; // goneAt: disconnected since (resume grace)
  pose: PoseBody | null; poseAt: number; lastSeq: number; dirty: boolean; farDirty: boolean; lastWarpAt: number;
  /** Relay v1.1: roomOf(pose) (-1 = island or a legacy door pose), when the room last changed, and whether it changed this tick. */
  room: number; lastFlipAt: number; flipped: boolean;
  poseBucket: TokenBucket; emoteBucket: TokenBucket; pingBucket: TokenBucket; ctlBucket: TokenBucket;
  emoteTimes: number[]; bad: number; secStart: number; secCount: number;
  /** Presence (design 4.4.1): last frame heard from this member, and whether the relay itself set the away (Hidden) flag on its pose. */
  heardAt: number; relayAway: boolean;
  /** Relay v1.2 (live feel, Oct 23 2026). caps: what this client answered to S.Caps (0 = an old client: legacy S.Poses only).
   *  poseNo / ballNo: room-unique stamps of the current pose / ball; seen / seenBall: the stamp of each friend's pose / ball this
   *  recipient already has (nothing is ever sent twice, so a 10 Hz near send and the 5 Hz tick never duplicate a snapshot).
   *  ball: [state, x_dm, y_dm, z_dm] (null = never sent), ballAt: when it arrived. */
  caps: number; poseNo: number; ballNo: number; seen: Map<number, number>; seenBall: Map<number, number>;
  ball: number[] | null; ballAt: number; ballBucket: TokenBucket;
  /** Relay v1.5 (Oct 23 2026): the host locked this member's name (C.NameLock), so C.Rename is ignored until the host unlocks it. Kept
   *  on the slot, so it survives a resume. renameTimes: recent C.Rename times (RENAME_PER_MIN per minute). */
  nickLocked: boolean; renameTimes: number[];
  /** Relay v1.6 (Cap.Hit): this member's recent accepted C.Hit times as a shooter, and when its ball last knocked anyone over it. */
  hitTimes: number[]; knockedAt: number;
}

/** C.Rename: at most this many name changes per member per minute (the control bucket also applies). */
const RENAME_PER_MIN = 4;

/** Relay v1.4 (Cap.EmoteAsk): one sender -> receiver pair's ask state. pendingUntil > 0 = an ask is open until then (+ graceMs);
 *  declines = No / unanswered asks in a row; blockedUntil = no asks before then. */
interface AskPair { emote: Emote; pendingUntil: number; lastAskAt: number; declines: number; blockedUntil: number }
const ON_FOOT = (mode: number) => mode === Mode.Walk || mode === Mode.Run || mode === Mode.Idle;

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
function b64url(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] || 0) << 8) | (bytes[i + 2] || 0);
    out += B64[(n >> 18) & 63] + B64[(n >> 12) & 63];
    if (i + 1 < bytes.length) out += B64[(n >> 6) & 63];
    if (i + 2 < bytes.length) out += B64[n & 63];
  }
  return out; // 16 bytes -> 22 chars
}
/** Constant-time string compare (tokens are fixed length). */
function ctEq(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export class RoomCore {
  /** The raw host key exists only on the instance that created the party (it is handed out once); a restored room has ''. */
  readonly hostKey: string;
  private hostKeyHash: string;
  readonly createdAt: number;
  ended = false;
  private _code: string;
  private codeIssuedAt: number;
  private locked = false;
  private clock: RoomClock;
  private random: (n: number) => Uint8Array;
  private members = new Map<number, Member>();
  private byPeer = new Map<Peer, Member>();
  private pending = new Map<Peer, number>(); // peer -> hello deadline
  private revoked: string[] = []; // tokens of kicked members: cannot resume
  private retired: string[] = []; // codes replaced by Rotate: admit only a resume token or the host key
  private retiredPeers = new Set<Peer>(); // sockets that arrived through a retired code
  private kickLockUntil = 0;
  /** Set when something the Durable Object must persist changed (lock, kick, rotate, end); the caller reads and clears it. */
  stateChanged = false;
  private joinSeq = 0;
  private idCursor = 0;
  private tickNo = 0;
  private beaconCount = 0;
  private stampSeq = 0;
  /** Fan-out counters for the cost model / smoke test: Poses frames sent and pose entries inside them. */
  stats = { poseFrames: 0, poseEntries: 0, ballEntries: 0 };
  private emptySince: number;
  private hostId = -1;
  private hadHost = false;
  private counters: RoomCounters = newCounters();
  private endedAt = 0;
  /** True when a counter moved since the Durable Object last persisted (it saves them on its 5 s alarm, not per message). */
  countersDirty = false;
  /** Relay v1.4: emote asks by pair key from * 64 + to (never persisted: a restarted relay simply forgets open asks). */
  private asks = new Map<number, AskPair>();
  /** Relay v1.6: when shooter * 64 + victim last knocked that friend over (pair cooldown; never persisted). */
  private hitPairs = new Map<number, number>();
  /** Called after Rotate so the worker / dev relay can re-register the room under the new code. */
  onRotate: ((oldCode: string, newCode: string) => void) | null = null;

  constructor(opts: { code: string; createdAt: number; clock: RoomClock; random: (n: number) => Uint8Array; hostKeyHash?: string; restore?: RoomSnapshot }) {
    this._code = opts.code;
    this.createdAt = opts.createdAt;
    this.codeIssuedAt = opts.createdAt;
    this.clock = opts.clock;
    this.random = opts.random;
    this.emptySince = opts.createdAt;
    if (opts.hostKeyHash) { this.hostKey = ''; this.hostKeyHash = opts.hostKeyHash; }
    else { this.hostKey = b64url(this.random(16)); this.hostKeyHash = sha256Hex(this.hostKey); }
    const r = opts.restore;
    if (r) { this._code = r.code; this.codeIssuedAt = r.codeIssuedAt; this.locked = r.locked; this.revoked = r.revoked.slice(); this.retired = r.retired.slice();
      if (r.stats) { const c = newCounters(); Object.assign(c, r.stats); delete (c as unknown as { buckets?: unknown }).buckets; c.fails = { ...(r.stats.fails || {}) }; c.errs = { ...(r.stats.errs || {}) }; this.counters = c; } }
  }

  get digest(): string { return this.hostKeyHash; }
  snapshot(): RoomSnapshot {
    return { code: this._code, codeIssuedAt: this.codeIssuedAt, locked: this.locked, revoked: this.revoked.slice(), retired: this.retired.slice(), stats: this.statsSnapshot() };
  }
  private statsSnapshot(): RoomStatsSnapshot {
    const c = this.counters;
    return { ...c, fails: { ...c.fails }, errs: { ...c.errs },
      buckets: { peak: peakBucket(Math.max(1, c.peak)), len: lenBucket(this.lenMs()), joins: joinsBucket(c.joins), msgs: msgsBucket(c.msgs) } };
  }
  private lenMs(): number { return Math.max(0, (this.endedAt || this.clock.now()) - this.createdAt); }
  /** The one end-of-party report (counts only). Call after `ended`. */
  summary(): RoomSummary {
    const c = this.counters;
    return { endReason: c.endReason < 0 ? EndReason.Expired : c.endReason, peak: c.peak, lenMs: this.lenMs(), joins: c.joins, resumes: c.resumes,
      kicks: c.kicks, rotates: c.rotates, locks: c.locks, nameResets: c.nameResets, rateCloses: c.rateCloses, msgs: c.msgs, roomOob: c.roomOob || 0, fails: { ...c.fails }, errs: { ...c.errs } };
  }
  /** Members with a live socket (the live players gauge). */
  get liveMembers(): number { let n = 0; this.members.forEach((m) => { if (m.peer) n++; }); return n; }
  /** End the party from outside (the 12 h cap found on wake-up). */
  expire(): void { this.end(EndReason.Expired); }
  private count(k: 'joins' | 'resumes' | 'kicks' | 'rotates' | 'locks' | 'nameResets' | 'rateCloses' | 'msgs' | 'roomOob'): void { this.counters[k] = (this.counters[k] || 0) + 1; this.countersDirty = true; }
  private notePeak(): void { const n = this.liveMembers; if (n > this.counters.peak) { this.counters.peak = n; this.countersDirty = true; } }
  private fail(code: ErrorCode): void { const r = FAIL_OF[code]; if (r) { this.counters.fails[r] = (this.counters.fails[r] || 0) + 1; this.countersDirty = true; } }
  /** 'current' | 'retired' | null for a code that is neither. */
  codeStatus(code: string): 'current' | 'retired' | null {
    return code === this._code ? 'current' : this.retired.includes(code) ? 'retired' : null;
  }
  private isLocked(now: number): boolean { return this.locked || now < this.kickLockUntil; }
  /** Wake-up path for a hibernated Durable Object: put a member back on its surviving socket. */
  restoreMember(peer: Peer, a: MemberAttachment): void {
    if (this.ended || this.members.has(a.id)) return;
    const m = this.newMember(a.id, a.name, null, a.look, a.token, a.joinSeq, peer, this.clock.now());
    this.members.set(a.id, m); this.byPeer.set(peer, m);
    this.joinSeq = Math.max(this.joinSeq, a.joinSeq + 1);
    if (a.host) { this.hostId = a.id; this.hadHost = true; }
    if (a.nameLock === 1) m.nickLocked = true; // relay v1.5: the host's name lock survives an eviction (the locked member's next frame syncs it)
  }
  attachmentFor(peer: Peer): MemberAttachment | null {
    const m = this.byPeer.get(peer);
    if (!m) return null;
    const a: MemberAttachment = { id: m.id, name: m.name, look: m.look, token: m.token, joinSeq: m.joinSeq, host: m.id === this.hostId };
    if (m.nickLocked) a.nameLock = 1;
    return a;
  }

  get code(): string { return this._code; }
  get codeExpiresAt(): number { return this.codeIssuedAt + CODE_TTL_MS; }
  get partyEndsAt(): number { return this.createdAt + PARTY_MAX_MS; }

  info(): { open: boolean; size: number; full: boolean } {
    const size = this.members.size;
    const full = size >= PARTY_MAX;
    const now = this.clock.now();
    const open = !this.ended && !this.isLocked(now) && !full && now < this.codeExpiresAt && now < this.partyEndsAt;
    return { open, size, full };
  }

  /** `retired`: the socket came in through a code that Rotate replaced; it may only resume or present the host key. */
  connect(peer: Peer, retired = false): void {
    if (this.ended) { this.counters.fails.closed = (this.counters.fails.closed || 0) + 1; this.countersDirty = true; this.send(peer, [S.Error, ErrorCode.Expired]); peer.close(CLOSE.Ended); return; }
    if (retired) this.retiredPeers.add(peer);
    this.pending.set(peer, this.clock.now() + HELLO_TIMEOUT_MS);
  }

  message(peer: Peer, raw: string): void {
    if (this.ended) return;
    const now = this.clock.now();
    const m = this.byPeer.get(peer);
    if (!m) {
      if (!this.pending.has(peer)) return;
      const msg = parseClient(raw);
      if (!msg || msg[0] !== C.Hello) {
        this.pending.delete(peer);
        this.send(peer, [S.Error, ErrorCode.BadMessage]);
        peer.close(CLOSE.BadMessages);
        return;
      }
      this.hello(peer, msg, now);
      return;
    }
    this.count('msgs');
    m.heardAt = now; // any frame (pose, beat, emote) proves they are here
    if (m.relayAway) this.unAway(m);
    // flood guard: more than closeAbovePerSec frames within one second -> close
    if (now - m.secStart >= 1000) { m.secStart = now; m.secCount = 0; }
    if (++m.secCount > RATE.closeAbovePerSec) {
      this.count('rateCloses');
      this.send(peer, [S.Error, ErrorCode.RateLimited]);
      this.drop(m, CLOSE.Flood);
      return;
    }
    const msg = parseClient(raw);
    if (!msg) { this.bad(m); return; }
    switch (msg[0]) {
      case C.Hello: this.bad(m); return;
      case C.Pose: this.pose(m, msg as number[], now); return;
      case C.Emote: {
        if (!m.emoteBucket.take(now)) return;
        // A member inside the force field (busy in a lesson / menu, or away) cannot emote: old or modded clients are ignored here.
        if (m.pose && shielded(presenceOf(m.pose[5], m.pose[6], m.pose[7]))) return;
        m.emoteTimes = m.emoteTimes.filter((t) => now - t < 60000);
        if (m.emoteTimes.length >= RATE.emotePerMin) return;
        m.emoteTimes.push(now);
        this.broadcast([S.Emote, m.id, msg[1] as Emote], m);
        return;
      }
      case C.Ping:
        if (!m.pingBucket.take(now)) return;
        this.broadcast([S.Ping, m.id, msg[1] as PingKind, msg[2] as number, msg[3] as number], m);
        return;
      case C.Beat: this.send(peer, [S.Beat, msg[1] as number]); return;
      case C.Caps: this.caps(m, msg[1] as number); return;
      case C.Ball: this.ballMsg(m, msg as number[], now); return;
      case C.Leave: this.remove(m, LeaveReason.Left, CLOSE.Normal); return;
      case C.Rename: this.rename(m, msg[1] as string, now); return;
      case C.EmoteAsk: this.emoteAsk(m, msg[1] as number, msg[2] as Emote, now); return;
      case C.EmoteAnswer: this.emoteAnswer(m, msg[1] as number, msg[2] === 1, now); return;
      case C.Hit: this.hit(m, msg[1] as number, msg[2] as number, now); return;
      case C.ResetName: return; // retired (Oct 23 2026, replaced by C.NameLock): an old host client's frame is ignored, never an error
      default: break;
    }
    // host-only controls: Kick, Lock, Rotate, End, NameLock
    if (!m.ctlBucket.take(now)) { this.send(peer, [S.Error, ErrorCode.RateLimited]); return; }
    if (m.id !== this.hostId) { this.send(peer, [S.Error, ErrorCode.NotHost]); return; }
    if (msg[0] === C.NameLock) {
      const t = this.members.get(msg[1] as number);
      const on = msg[2] === 1;
      if (!t || t === m || t.nickLocked === on) return; // unknown id, the host's own name, or no change
      t.nickLocked = on;
      if (on) this.count('nameResets'); // the counter now counts name locks (kept under its old key for the dashboards)
      this.lockNews(t);
    } else if (msg[0] === C.Kick) {
      const t = this.members.get(msg[1] as number);
      if (!t || t === m) return;
      this.count('kicks');
      this.revoked.push(t.token);
      this.kickLockUntil = this.clock.now() + KICK_LOCK_MS; // the kicked child cannot walk straight back in
      this.stateChanged = true;
      if (t.peer) this.send(t.peer, [S.Error, ErrorCode.Kicked]);
      this.remove(t, LeaveReason.Kicked, CLOSE.Kicked);
    } else if (msg[0] === C.Lock) {
      if (msg[1] === 1 && !this.locked) this.count('locks');
      this.locked = msg[1] === 1;
      if (!this.locked) this.kickLockUntil = 0;
      this.stateChanged = true;
    } else if (msg[0] === C.Rotate) {
      this.count('rotates');
      const old = this._code;
      const code = this.rotate();
      // Every member hears the new code (Party rejoin, Oct 22 2026: guests show it on their Code tab to help a friend in, and their
      // stored session and reconnects use it). Old clients already handled S.Code (they only ever got it as the host): backward compatible.
      this.broadcast([S.Code, code, this.codeExpiresAt], null);
      if (this.onRotate) this.onRotate(old, code);
    } else if (msg[0] === C.End) {
      this.end(EndReason.HostEnded);
    }
  }

  disconnect(peer: Peer): void {
    this.pending.delete(peer);
    this.retiredPeers.delete(peer);
    const m = this.byPeer.get(peer);
    if (!m) return;
    this.byPeer.delete(peer);
    m.peer = null;
    m.goneAt = this.clock.now(); // slot kept for RESUME_GRACE_MS; others hear Left/Timeout only when it lapses
  }

  /** Relay v1.2: called between two 5 Hz ticks (the Durable Object steps at 10 Hz): only the nearest LIVE_NEAR friends within
   *  LIVE_RANGE_M of each Live client, plus balls, go out. Nothing else (timeouts, hosts, away) runs here. */
  halfTick(): void {
    if (this.ended) return;
    this.fanOut(true);
  }

  /** 5 Hz: hello timeouts, grace expiry, host migration, empty / age close, batched dirty poses. */
  tick(): void {
    if (this.ended) return;
    const now = this.clock.now();
    for (const [peer, deadline] of Array.from(this.pending)) {
      if (now >= deadline) { this.pending.delete(peer); peer.close(CLOSE.HelloTimeout); }
    }
    if (now >= this.partyEndsAt) { this.end(EndReason.Expired); return; }
    for (const m of Array.from(this.members.values())) {
      if (m.goneAt !== null && now - m.goneAt >= graceFor(m, RESUME_GRACE_MS)) {
        this.remove(m, m.pose && m.pose[6] === Zone.Indoors ? LeaveReason.Indoors : LeaveReason.Timeout, null);
      }
    }
    this.markAway(now);
    this.migrateHost(now);
    if (this.members.size === 0 && now - this.emptySince >= EMPTY_CLOSE_MS) { this.end(EndReason.Empty); return; }
    this.fanOut(false);
  }

  /**
   * Interest management. Every 5 Hz tick each recipient gets the NEAREST INTEREST_NEAR (12) members whose pose it has not had yet
   * (horizontal distance from the recipient's last pose; ties by id, so it is deterministic). Every BEACON_EVERY-th tick (1 Hz) it gets
   * EVERY member whose pose it has not had instead, so far friends still move on the roster / map.
   * Relay v1.1 (rooms design 2.3 item 3): the 5 Hz near set only holds members in the recipient's OWN room (roomOf; island and legacy door
   * poses are room -1), so island players stop hearing room walking and room members stop hearing island running; everyone else arrives on
   * the 1 Hz beacon. A member whose room changed this tick is sent to everyone at once (their door step, so the old room sees them leave).
   * Relay v1.2 (live feel): halfTick (between two ticks, so 10 Hz) sends a Live client its nearest LIVE_NEAR same-room friends within
   * LIVE_RANGE_M, and every tick sends a Ball client the balls it has not had (same room, within BALL_RANGE_M). A Live client gets S.Live
   * (timestamped) instead of S.Poses; an old client gets exactly the old S.Poses at 5 Hz.
   */
  private fanOut(half: boolean): void {
    const beacon = !half && ++this.beaconCount % BEACON_EVERY === 0;
    const now = this.clock.now();
    const posed: Member[] = [];
    this.members.forEach((m) => { if (m.pose) posed.push(m); });
    if (posed.length) {
      const seg = new Map<Member, string>(), live = new Map<Member, string>(), balls = new Map<Member, string>(); // each entry's JSON text is built once (relay CPU)
      const text = (d: Member): string => {
        let t = seg.get(d);
        if (t === undefined) { t = ',' + d.id + ',' + (d.pose as PoseBody).join(','); seg.set(d, t); }
        return t;
      };
      const liveText = (d: Member): string => {
        let t = live.get(d);
        if (t === undefined) { t = d.id + ',' + (d.pose as PoseBody).join(',') + ',' + Math.min(60000, Math.max(0, now - d.poseAt)); live.set(d, t); }
        return t;
      };
      const ballText = (d: Member): string => {
        let t = balls.get(d);
        if (t === undefined) { t = d.id + ',' + (d.ball as number[]).join(',') + ',' + Math.min(60000, Math.max(0, now - d.ballAt)); balls.set(d, t); }
        return t;
      };
      let sentAny = false;
      this.members.forEach((r) => {
        if (!r.peer) return;
        const isLive = (r.caps & Cap.Live) !== 0;
        const list = half ? (isLive ? this.nearLive(r, posed) : []) : this.interest(r, posed, beacon);
        const bl = (r.caps & Cap.Ball) !== 0 ? this.ballInterest(r, posed) : [];
        if (!list.length && !bl.length) return;
        let body: string;
        if (isLive) {
          body = '[' + S.Live + ',' + now + ',[';
          for (let i = 0; i < list.length; i++) body += (i ? ',' : '') + liveText(list[i]);
          body += '],[';
          for (let i = 0; i < bl.length; i++) body += (i ? ',' : '') + ballText(bl[i]);
          body += ']]';
        } else {
          if (!list.length) return;
          if (!sentAny) { this.tickNo++; sentAny = true; }
          body = '[' + S.Poses + ',' + this.tickNo;
          for (const d of list) body += text(d);
          body += ']';
        }
        for (const d of list) r.seen.set(d.id, d.poseNo);
        for (const d of bl) r.seenBall.set(d.id, d.ballNo);
        try { r.peer.send(body); if (list.length) { this.stats.poseFrames++; this.stats.poseEntries += list.length; } if (bl.length) this.stats.ballEntries += bl.length; } catch { /* peer already gone */ }
      });
    }
    if (!half) this.members.forEach((m) => { m.dirty = false; m.flipped = false; if (beacon) m.farDirty = false; });
  }

  /** Who `r` hears about this tick: never itself, never a pose it already has; on a beacon tick everyone else; on a normal tick the
   *  nearest INTEREST_NEAR in r's own room, plus anyone who changed room this tick. */
  private interest(r: Member, posed: Member[], beacon: boolean): Member[] {
    // dirty: changed since the last 5 Hz tick; farDirty: since the last beacon (the old pools), and not already sent to r (halfTick).
    const fresh = (d: Member): boolean => d !== r && (beacon ? d.farDirty : d.dirty) && r.seen.get(d.id) !== d.poseNo;
    if (beacon) return posed.filter(fresh);
    const out: Member[] = [], flips: Member[] = [];
    for (const d of posed) { if (!fresh(d)) continue; if (d.room === r.room) out.push(d); else if (d.flipped) flips.push(d); }
    if (out.length <= INTEREST_NEAR) return flips.length ? out.concat(flips) : out;
    const near = this.nearest(r, out, INTEREST_NEAR);
    return flips.length ? near.concat(flips) : near;
  }

  /** halfTick: the nearest LIVE_NEAR friends in r's room within LIVE_RANGE_M whose pose r has not had. */
  private nearLive(r: Member, posed: Member[]): Member[] {
    if (!r.pose) return [];
    const R = LIVE_RANGE_M * 10, ox = r.pose[0], oz = r.pose[2], out: Member[] = [];
    for (const d of posed) {
      if (d === r || d.room !== r.room || r.seen.get(d.id) === d.poseNo) continue;
      const p = d.pose as PoseBody, dx = p[0] - ox, dz = p[2] - oz;
      if (dx * dx + dz * dz <= R * R) out.push(d);
    }
    return out.length <= LIVE_NEAR ? out : this.nearest(r, out, LIVE_NEAR);
  }

  /** Balls r has not had: same room, the ball (or, for Feet / Juggle / None, its owner) within BALL_RANGE_M of r. */
  private ballInterest(r: Member, posed: Member[]): Member[] {
    const out: Member[] = [];
    const R = BALL_RANGE_M * 10, ox = r.pose ? r.pose[0] : 0, oz = r.pose ? r.pose[2] : 0;
    for (const d of posed) {
      if (d === r || !d.ball || d.room !== r.room || r.seenBall.get(d.id) === d.ballNo) continue;
      const b = d.ball, p = d.pose as PoseBody, free = b[0] === BallState.Free;
      const dx = (free ? b[1] : p[0]) - ox, dz = (free ? b[3] : p[2]) - oz;
      if (!r.pose || dx * dx + dz * dz <= R * R || b[0] === BallState.None) out.push(d);
    }
    return out;
  }

  private nearest(r: Member, out: Member[], n: number): Member[] {
    const ox = r.pose ? r.pose[0] : 0, oz = r.pose ? r.pose[2] : 0;
    const dist = (d: Member): number => { const p = d.pose as PoseBody, dx = p[0] - ox, dz = p[2] - oz; return dx * dx + dz * dz; };
    return out.map((d) => ({ d, k: dist(d) })).sort((a, b) => a.k - b.k || a.d.id - b.d.id).slice(0, n).map((e) => e.d);
  }

  /** Can these two play a ball emote together now? Both connected new clients, on the island, on foot, outside the force field, near. */
  private duetOk(a: Member, b: Member): boolean {
    if (!a.peer || !b.peer || !(a.caps & Cap.EmoteAsk) || !(b.caps & Cap.EmoteAsk) || !a.pose || !b.pose || a.room >= 0 || b.room >= 0) return false;
    for (const m of [a, b]) { const p = m.pose as PoseBody; if (shielded(presenceOf(p[5], p[6], p[7])) || p[6] === Zone.Indoors || !ON_FOOT(p[5])) return false; }
    const pa = a.pose, pb = b.pose, r = (EMOTE_ASK.rangeM + EMOTE_ASK.slackM) * 10;
    return Math.abs(pa[1] - pb[1]) <= EMOTE_ASK.yM * 10 && (pa[0] - pb[0]) ** 2 + (pa[2] - pb[2]) ** 2 <= r * r;
  }
  /** An unanswered ask that ran out counts as a No (lazily, when the pair is next looked at). */
  private settleAsk(q: AskPair, now: number): void {
    if (q.pendingUntil > 0 && now > q.pendingUntil + EMOTE_ASK.graceMs) { q.pendingUntil = 0; this.declined(q, q.lastAskAt + EMOTE_ASK.timeoutMs); }
  }
  private declined(q: AskPair, at: number): void {
    if (++q.declines >= EMOTE_ASK.declinesToBlock) { q.declines = 0; q.blockedUntil = at + EMOTE_ASK.blockMs; }
  }
  /** C.EmoteAsk: rate limited like an emote; refused (S.EmoteAnswer Unavailable, so the asker plays it alone at once) unless the two can
   *  play together and the pair's anti-spam rules allow it (one open ask, a cooldown per pair, a block after repeated Nos). */
  private emoteAsk(m: Member, to: number, emote: Emote, now: number): void {
    if (!(m.caps & Cap.EmoteAsk) || !m.emoteBucket.take(now)) return;
    const t = this.members.get(to), key = m.id * 64 + to;
    let q = this.asks.get(key);
    if (q) this.settleAsk(q, now);
    m.emoteTimes = m.emoteTimes.filter((x) => now - x < 60000);
    const spam = m.emoteTimes.length >= RATE.emotePerMin || (!!q && (q.pendingUntil > 0 || now < q.blockedUntil || now - q.lastAskAt < EMOTE_ASK.cooldownMs));
    if (!t || t === m || spam || !this.duetOk(m, t)) { if (m.peer) this.send(m.peer, [S.EmoteAnswer, to, emote, AskReply.Unavailable]); return; }
    m.emoteTimes.push(now);
    if (!q) { q = { emote, pendingUntil: 0, lastAskAt: 0, declines: 0, blockedUntil: 0 }; this.asks.set(key, q); }
    q.emote = emote; q.lastAskAt = now; q.pendingUntil = now + EMOTE_ASK.timeoutMs;
    this.send(t.peer!, [S.EmoteAsk, m.id, emote]);
  }
  /** C.EmoteAnswer from the asked friend: a No goes back to the asker; a Yes (re-checked) starts the duet on every screen. */
  private emoteAnswer(m: Member, from: number, yes: boolean, now: number): void {
    if (!m.ctlBucket.take(now)) return;
    const q = this.asks.get(from * 64 + m.id), a = this.members.get(from);
    if (!q || q.pendingUntil <= 0 || now > q.pendingUntil + EMOTE_ASK.graceMs) return; // nothing open (or it ran out): ignored
    q.pendingUntil = 0;
    if (!a || !a.peer) return;
    if (!yes) { this.declined(q, now); this.send(a.peer, [S.EmoteAnswer, m.id, q.emote, AskReply.No]); return; }
    q.declines = 0;
    if (!this.duetOk(a, m)) { this.send(a.peer, [S.EmoteAnswer, m.id, q.emote, AskReply.Unavailable]); return; }
    this.send(a.peer, [S.EmoteAnswer, m.id, q.emote, AskReply.Yes]);
    const duet = encode([S.Duet, a.id, m.id, q.emote, this.random(1)[0]]), oldA = encode([S.Emote, a.id, q.emote]), oldB = encode([S.Emote, m.id, q.emote]);
    this.members.forEach((r) => {
      if (!r.peer) return;
      try { if (r.caps & Cap.EmoteAsk) r.peer.send(duet); else { r.peer.send(oldA); r.peer.send(oldB); } } catch { /* gone */ }
    });
  }
  /** Relay v1.6 (Cap.Hit): may `a`'s ball knock `b` over now? Both connected Cap.Hit party members on the island (same zone), outside the
   *  force field (not busy / away / indoors), the victim on foot (never swimming, flying, riding or fishing), within HIT_RANGE_M. */
  private hitOk(a: Member, b: Member): boolean {
    if (a === b || !a.peer || !b.peer || !(a.caps & Cap.Hit) || !(b.caps & Cap.Hit) || !a.pose || !b.pose || a.room >= 0 || b.room >= 0) return false;
    const pa = a.pose, pb = b.pose;
    if (pa[6] !== pb[6] || pa[6] === Zone.Indoors || shielded(presenceOf(pa[5], pa[6], pa[7])) || shielded(presenceOf(pb[5], pb[6], pb[7])) || !ON_FOOT(pb[5])) return false;
    const r = HIT_RANGE_M * 10;
    return (pa[0] - pb[0]) ** 2 + (pa[2] - pb[2]) ** 2 <= r * r;
  }
  /** C.Hit [victim, dir]: the shooter's own ball knocked a friend over. Checked (hitOk, the shooter's HIT_RATE_MAX per HIT_RATE_WINDOW_MS,
   *  the pair's HIT_PAIR_COOLDOWN_MS and the victim's own short cooldown), then S.Hit goes to every Cap.Hit member. A refused hit is
   *  dropped silently (nobody is told; the shooter's screen never played anything on its own). */
  private hit(m: Member, victim: number, dir: number, now: number): void {
    const t = this.members.get(victim);
    if (!t || !this.hitOk(m, t)) return;
    m.hitTimes = m.hitTimes.filter((x) => now - x < HIT_RATE_WINDOW_MS);
    const key = m.id * 64 + t.id, last = this.hitPairs.get(key);
    if (m.hitTimes.length >= HIT_RATE_MAX || (last !== undefined && now - last < HIT_PAIR_COOLDOWN_MS)) return;
    if (t.knockedAt > 0 && now - t.knockedAt < HIT_PAIR_COOLDOWN_MS / 2) return; // nobody is knocked over twice in a row by two friends
    m.hitTimes.push(now); this.hitPairs.set(key, now); t.knockedAt = now;
    const text = encode([S.Hit, m.id, t.id, dir & 255]);
    this.members.forEach((r) => { if (r.peer && (r.caps & Cap.Hit) && r.room < 0) { try { r.peer.send(text); } catch { /* gone */ } } });
  }
  private forgetHits(id: number): void { this.hitPairs.forEach((_t, k) => { if (Math.floor(k / 64) === id || k % 64 === id) this.hitPairs.delete(k); }); }
  private forgetAsks(id: number): void { this.asks.forEach((_q, k) => { if (Math.floor(k / 64) === id || k % 64 === id) this.asks.delete(k); }); }

  /** C.Ball (only ever sent by a client that saw S.Caps): rate limited, island only, ignored inside a force field (shown as no ball). */
  private ballMsg(m: Member, msg: number[], now: number): void {
    if (!(m.caps & Cap.Ball) || !m.ballBucket.take(now)) return;
    const busy = !!m.pose && shielded(presenceOf(m.pose[5], m.pose[6], m.pose[7]));
    const st = busy || m.room >= 0 ? BallState.None : msg[1];
    const b = m.ball;
    if (b && b[0] === st && b[1] === msg[2] && b[2] === msg[3] && b[3] === msg[4]) return;
    m.ball = [st, msg[2], msg[3], msg[4]]; m.ballAt = now; m.ballNo = ++this.stampSeq;
  }

  /** New code for the same room (TTL restarts); the caller retires the old code so it no longer finds the room. */
  rotate(): string {
    this.retired.push(this._code);
    this.stateChanged = true;
    this._code = generateCode(this.random);
    this.codeIssuedAt = this.clock.now();
    return this._code;
  }

  // ---- internals ----
  private hello(peer: Peer, msg: ClientMsg, now: number): void {
    const [, v, look, resumeToken, hostKey, , rawNick] = msg as [number, number, number[], string | null, string | null, (number | null)?, (string | null)?];
    const hasNickSlot = (msg as unknown[]).length >= 7; // new clients always send the name; old Hellos (5 / 6 elements) are colour-only
    const nick = normalizeNick(rawNick ?? null); // parseClient already normalised; a name is only ever set here, at Hello
    if (v !== PROTOCOL_VERSION) return this.refuse(peer, ErrorCode.BadVersion);
    if (now >= this.partyEndsAt) return this.refuse(peer, ErrorCode.Expired);
    const viaRetired = this.retiredPeers.delete(peer);
    const isHostKey = hostKey !== null && hostKey.length > 0 && ctEq(sha256Hex(hostKey), this.hostKeyHash);
    if (resumeToken !== null) {
      if (this.revoked.some((t) => ctEq(t, resumeToken))) return this.refuse(peer, ErrorCode.Kicked);
      let found: Member | null = null;
      this.members.forEach((x) => { if (ctEq(x.token, resumeToken)) found = x; });
      const m = found as Member | null;
      if (m && (m.goneAt === null || now - m.goneAt < graceFor(m, RESUME_GRACE_MS))) {
        const old = m.peer;
        if (old) { this.byPeer.delete(old); m.peer = null; old.close(CLOSE.Replaced); }
        this.pending.delete(peer);
        m.peer = peer; m.goneAt = null;
        m.lastSeq = -1; // the client restarts its pose counter at 0 on every connect (review #7)
        m.heardAt = now; if (m.relayAway) this.unAway(m);
        this.byPeer.set(peer, m);
        this.count('resumes'); this.notePeak();
        // Relay v1.1 (rooms design 2.3 item 5): a resume may carry a new look (a Kit Shop outfit). Only a CHANGED look is re-announced, as
        // S.Joined for the same id: every client store since the first one upserts Joined by id (tests/mp-room-core.cjs checks the old
        // reducer), so the row is replaced, never doubled. An unchanged look keeps the resume invisible to others, as before.
        // A resume never renames (the slot keeps its name); a self rename is only ever C.Rename (relay v1.3).
        const changed = Array.isArray(look) && (look.length !== m.look.length || look.some((v, i) => v !== m.look[i]));
        if (changed) m.look = look.slice();
        this.welcome(m);
        if (changed) this.broadcast([S.Joined, this.memberInfo(m)], m);
        return;
      }
      // unknown / lapsed token: fall through to a fresh join (graceful after a Durable Object eviction)
    }
    if (hasNickSlot && nick === null) return this.refuse(peer, ErrorCode.BadName); // a new client must send a valid first name
    if (viaRetired && !isHostKey) return this.refuse(peer, ErrorCode.NotFound); // a leaked old code never admits a new face
    if (!isHostKey) {
      if (this.isLocked(now)) return this.refuse(peer, ErrorCode.Locked);
      if (now >= this.codeExpiresAt) return this.refuse(peer, ErrorCode.Expired);
    }
    if (this.members.size >= PARTY_MAX) return this.refuse(peer, ErrorCode.Full);
    this.pending.delete(peer);
    const taken: NameIdx[] = [];
    this.members.forEach((x) => taken.push(x.name));
    const r = this.random(4);
    const rnd = () => (r[0] * 16777216 + r[1] * 65536 + r[2] * 256 + r[3]) / 4294967296;
    const id = this.freeId();
    const m = this.newMember(id, pickNameWith(taken, rnd), nick, look, b64url(this.random(16)), this.joinSeq++, peer, now);
    this.members.set(id, m);
    this.byPeer.set(peer, m);
    this.count('joins'); this.notePeak();
    if (isHostKey && !this.members.has(this.hostId)) { this.hostId = id; this.hadHost = true; }
    this.welcome(m);
    this.broadcast([S.Joined, this.memberInfo(m)], m);
  }

  private newMember(id: number, name: NameIdx, nick: string | null, look: number[], token: string, joinSeq: number, peer: Peer, now: number): Member {
    return {
      id, name, nick, look: look.slice(), token, joinSeq,
      peer, goneAt: null, pose: null, poseAt: now, lastSeq: -1, dirty: false, farDirty: false, lastWarpAt: -1e12, room: -1, lastFlipAt: -1e12, flipped: false,
      caps: 0, poseNo: 0, ballNo: 0, seen: new Map(), seenBall: new Map(), ball: null, ballAt: now, ballBucket: new TokenBucket(RATE.ball[0], RATE.ball[1]),
      poseBucket: new TokenBucket(RATE.pose[0], RATE.pose[1]), emoteBucket: new TokenBucket(RATE.emote[0], RATE.emote[1]),
      pingBucket: new TokenBucket(RATE.ping[0], RATE.ping[1]), ctlBucket: new TokenBucket(RATE.control[0], RATE.control[1]),
      emoteTimes: [], bad: 0, secStart: now, secCount: 0, heardAt: now, relayAway: false, nickLocked: false, renameTimes: [], hitTimes: [], knockedAt: 0,
    };
  }

  /** Silence (no frame for AWAY_SILENCE_MS, connected or within the resume grace) shows the member as Away: the Hidden flag on their pose.
   *  The legacy door pose (Indoors, y above the room band: a page without the room layer) is never marked; a silent member walking in a
   *  room (room pose, relay v1.1 item 4) is, like everyone else. */
  private markAway(now: number): void {
    this.members.forEach((m) => {
      const p = m.pose;
      if (!p || m.relayAway || (p[7] & PoseFlag.Hidden) !== 0 || (p[6] === Zone.Indoors && m.room < 0) || now - m.heardAt < AWAY_SILENCE_MS) return;
      const q = p.slice() as PoseBody; q[7] = (q[7] | PoseFlag.Hidden) & ~PoseFlag.Warp;
      m.pose = q; m.relayAway = true; m.dirty = true; m.farDirty = true; m.poseNo = ++this.stampSeq;
    });
  }

  /** The member spoke again: drop the relay-set away flag (a client-set one stays until their next pose). */
  private unAway(m: Member): void {
    m.relayAway = false;
    if (m.pose && (m.pose[7] & PoseFlag.Hidden) !== 0) {
      const q = m.pose.slice() as PoseBody; q[7] &= ~PoseFlag.Hidden; m.pose = q; m.dirty = true; m.farDirty = true; m.poseNo = ++this.stampSeq;
    }
  }

  private migrateHost(now: number): void {
    if (!this.hadHost) return; // the code alone never makes someone host; only the hostKey does
    const h = this.members.get(this.hostId);
    if (h && (h.goneAt === null || now - h.goneAt < graceFor(h, HOST_GRACE_MS))) return;
    // host removed, or gone for >= 30 s (10 min after announcing a room / menu / background): oldest connected member takes over
    let best: Member | null = null;
    this.members.forEach((m) => { if (m.goneAt === null && m.peer && (!best || m.joinSeq < best.joinSeq)) best = m; });
    const b = best as Member | null;
    if (b && b.id !== this.hostId) {
      this.hostId = b.id; this.broadcast([S.Host, b.id], null);
      if (b.nickLocked) { b.nickLocked = false; this.lockNews(b); } // the host's own name is never locked
    }
  }

  /** C.Rename (relay v1.3): the member's own first name. parseClient already normalised it. Re-announced as S.Joined (same id) to
   *  everyone including the sender (its confirmation); old clients upsert Joined by id, so they show the new name too. */
  private rename(m: Member, nick: string, now: number): void {
    if (m.nickLocked) { if (m.peer && (m.caps & Cap.NameLock)) this.send(m.peer, [S.NameLock, m.id, 1]); return; } // locked: refused
    if (nick === m.nick || !m.ctlBucket.take(now)) return;
    m.renameTimes = m.renameTimes.filter((t) => now - t < 60000);
    if (m.renameTimes.length >= RENAME_PER_MIN) return;
    m.renameTimes.push(now);
    m.nick = nick;
    this.broadcast([S.Joined, this.memberInfo(m)], null);
  }

  /** C.Caps: what this client understands. A Cap.NameLock client then hears every current name lock (a join or a resume). */
  private caps(m: Member, bits: number): void {
    m.caps = bits & CAPS_ALL;
    if (!(m.caps & Cap.NameLock) || !m.peer) return;
    const peer = m.peer;
    this.members.forEach((x) => { if (x.nickLocked) this.send(peer, [S.NameLock, x.id, 1]); });
  }

  /** Relay v1.5: tell every Cap.NameLock member that `t`'s name lock changed (old clients never see S.NameLock). */
  private lockNews(t: Member): void {
    const text = encode([S.NameLock, t.id, t.nickLocked ? 1 : 0]);
    this.members.forEach((r) => { if (r.peer && (r.caps & Cap.NameLock)) { try { r.peer.send(text); } catch { /* gone */ } } });
  }

  private welcome(m: Member): void {
    const list: MemberInfo[] = [];
    this.members.forEach((x) => list.push(this.memberInfo(x)));
    this.send(m.peer as Peer, [S.Welcome, PROTOCOL_VERSION, m.id, m.token, this.codeExpiresAt, this.partyEndsAt, this.locked ? 1 : 0, list]);
    // Relay v1.2: the roster carries every pose, so this socket has them all; a fresh socket starts as an old client (caps 0) until it
    // answers S.Caps (old clients cannot parse S.Caps and ignore it).
    m.seen.clear(); m.seenBall.clear(); m.caps = 0;
    this.members.forEach((x) => { if (x !== m && x.pose) m.seen.set(x.id, x.poseNo); });
    this.send(m.peer as Peer, [S.Caps, CAPS_ALL]);
  }

  private memberInfo(m: Member): MemberInfo {
    return [m.id, m.name, m.look, m.id === this.hostId ? 1 : 0, m.pose ? (m.pose.slice() as PoseBody) : null, m.nick];
  }

  private pose(m: Member, msg: number[], now: number): void {
    if (!m.poseBucket.take(now)) return;
    const seq = msg[1];
    if (seq <= m.lastSeq) return;
    const body = clampPose(msg.slice(2) as PoseBody);
    if (!body) { this.bad(m); return; }
    // Relay v1.1 item 1: a room pose outside its room is dropped (counted), never bad(): a layout change must not kick anyone.
    if (!roomBoundsOk(body)) { this.count('roomOob'); return; }
    const room = roomOf(body);
    // Relay v1.1 item 2: a change of room is an implicit warp (no 5 s Warp gap, no speed check: room-local and island coordinates do
    // not compare), at most one per ROOM_FLIP_MIN_GAP_MS; inside one room or on the island the Warp / speed checks stay.
    const flip = m.pose !== null && room !== m.room && now - m.lastFlipAt >= ROOM_FLIP_MIN_GAP_MS;
    if (flip) {
      m.lastFlipAt = now; m.flipped = true;
    } else if (body[7] & PoseFlag.Warp) {
      if (now - m.lastWarpAt < WARP_MIN_GAP_MS) return; // at most one teleport per 5 s
      m.lastWarpAt = now;
    } else if (m.pose && !speedOk(m.pose, body, now - m.poseAt)) {
      return; // speed cheat: dropped, never relayed; the last good pose stays
    }
    m.lastSeq = seq; m.pose = body; m.poseAt = now; m.dirty = true; m.farDirty = true; m.relayAway = false; m.room = room; m.poseNo = ++this.stampSeq;
  }

  private bad(m: Member): void {
    if (++m.bad >= BAD_FRAME_LIMIT) {
      if (m.peer) this.send(m.peer, [S.Error, ErrorCode.BadMessage]);
      this.drop(m, CLOSE.BadMessages);
    }
  }

  /** Close the socket and treat it as a disconnect (resume grace applies). */
  private drop(m: Member, code: number): void {
    const p = m.peer;
    if (p) { this.byPeer.delete(p); m.peer = null; m.goneAt = this.clock.now(); p.close(code); }
  }

  private remove(m: Member, reason: LeaveReason, closeCode: number | null): void {
    this.members.delete(m.id); this.forgetAsks(m.id); this.forgetHits(m.id);
    if (m.peer) {
      const p = m.peer;
      this.byPeer.delete(p); m.peer = null;
      if (closeCode !== null) p.close(closeCode);
    }
    this.broadcast([S.Left, m.id, reason], null);
    if (this.members.size === 0) this.emptySince = this.clock.now();
    if (this.hostId === m.id) { this.hostId = -1; this.migrateHost(this.clock.now()); } // host explicitly left or was removed: no 30 s wait
  }

  private end(reason: EndReason): void {
    if (this.ended) return;
    this.ended = true;
    this.counters.endReason = reason; this.endedAt = this.clock.now(); this.countersDirty = true;
    this.stateChanged = true;
    this.members.forEach((m) => { if (m.peer) { this.send(m.peer, [S.Ended, reason]); m.peer.close(CLOSE.Ended); } });
    this.pending.forEach((_d, p) => p.close(CLOSE.Ended));
    this.members.clear(); this.byPeer.clear(); this.pending.clear();
  }

  private refuse(peer: Peer, code: ErrorCode): void {
    this.fail(code);
    this.pending.delete(peer);
    this.send(peer, [S.Error, code]);
    peer.close(CLOSE.Refused);
  }

  private freeId(): number {
    const n = MAX_MEMBER_ID + 1;
    for (let i = 0; i < n; i++) {
      const id = (this.idCursor + i) % n;
      if (!this.members.has(id)) { this.idCursor = (id + 1) % n; return id; }
    }
    return 0; // unreachable: PARTY_MAX (20) < 32 slot ids
  }

  private send(peer: Peer, msg: ServerMsg): void {
    if (msg[0] === S.Error) { const n = ERR_NAMES[msg[1] as number]; if (n) { this.counters.errs[n] = (this.counters.errs[n] || 0) + 1; this.countersDirty = true; } }
    try { peer.send(encode(msg)); } catch { /* peer already gone */ }
  }

  private broadcast(msg: ServerMsg, except: Member | null): void {
    const text = encode(msg);
    this.members.forEach((m) => {
      if (m !== except && m.peer) { try { m.peer.send(text); } catch { /* ignore */ } }
    });
  }
}
