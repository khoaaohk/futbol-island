// Pure party-room logic: no Cloudflare or Node APIs. Used by the Durable Object (partyRoom.ts) and the Node dev relay.
// Design: docs/multiplayer-design.md 4.4 / 4.5. Time and randomness are injected so tests are deterministic.
import {
  C, S, PROTOCOL_VERSION, PARTY_MAX, CODE_TTL_MS, PARTY_MAX_MS, RESUME_GRACE_MS, HOST_GRACE_MS, EMPTY_CLOSE_MS,
  ErrorCode, EndReason, LeaveReason, Zone, PoseFlag, RATE, TokenBucket,
  parseClient, encode, clampPose, speedOk, generateCode, pickNameWith, sha256Hex, normalizeNick,
} from '../../protocol';
import type { ClientMsg, Emote, PingKind, MemberInfo, NameIdx, PoseBody, ServerMsg } from '../../protocol';

export interface Peer { send(text: string): void; close(code: number): void }
export interface RoomClock { now(): number }
/** What a Durable Object must keep so an eviction cannot revive an ended party, a retired code or a revoked token (review #2). */
export interface RoomSnapshot { code: string; codeIssuedAt: number; locked: boolean; revoked: string[]; retired: string[] }
/** Per-socket state a hibernating Durable Object keeps with serializeAttachment so members survive an eviction. */
export interface MemberAttachment { id: number; name: NameIdx; look: number[]; token: string; joinSeq: number; host: boolean }

/** WebSocket close codes the relay uses (4xxx = application range). */
export const CLOSE = {
  Normal: 1000, HelloTimeout: 4000, BadMessages: 4001, Flood: 4002, Kicked: 4003, Ended: 4004, Replaced: 4005, Refused: 4006,
} as const;

const HELLO_TIMEOUT_MS = 5000;
const BAD_FRAME_LIMIT = 5;
const WARP_MIN_GAP_MS = 5000;
export const KICK_LOCK_MS = 60_000; // auto-lock after a kick (review #6)

interface Member {
  // nick: the typed first name. In memory on the member ONLY: never in attachments, snapshots, storage or logs (owner decision).
  id: number; name: NameIdx; nick: string | null; look: number[]; token: string; joinSeq: number;
  peer: Peer | null; goneAt: number | null; // goneAt: disconnected since (resume grace)
  pose: PoseBody | null; poseAt: number; lastSeq: number; dirty: boolean; lastWarpAt: number;
  poseBucket: TokenBucket; emoteBucket: TokenBucket; pingBucket: TokenBucket; ctlBucket: TokenBucket;
  emoteTimes: number[]; bad: number; secStart: number; secCount: number;
}

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
  private emptySince: number;
  private hostId = -1;
  private hadHost = false;
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
    if (r) { this._code = r.code; this.codeIssuedAt = r.codeIssuedAt; this.locked = r.locked; this.revoked = r.revoked.slice(); this.retired = r.retired.slice(); }
  }

  get digest(): string { return this.hostKeyHash; }
  snapshot(): RoomSnapshot {
    return { code: this._code, codeIssuedAt: this.codeIssuedAt, locked: this.locked, revoked: this.revoked.slice(), retired: this.retired.slice() };
  }
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
  }
  attachmentFor(peer: Peer): MemberAttachment | null {
    const m = this.byPeer.get(peer);
    return m ? { id: m.id, name: m.name, look: m.look, token: m.token, joinSeq: m.joinSeq, host: m.id === this.hostId } : null;
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
    if (this.ended) { this.send(peer, [S.Error, ErrorCode.Expired]); peer.close(CLOSE.Ended); return; }
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
    // flood guard: more than closeAbovePerSec frames within one second -> close
    if (now - m.secStart >= 1000) { m.secStart = now; m.secCount = 0; }
    if (++m.secCount > RATE.closeAbovePerSec) {
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
      case C.Leave: this.remove(m, LeaveReason.Left, CLOSE.Normal); return;
      default: break;
    }
    // host-only controls: Kick, Lock, Rotate, End, ResetName
    if (!m.ctlBucket.take(now)) { this.send(peer, [S.Error, ErrorCode.RateLimited]); return; }
    if (m.id !== this.hostId) { this.send(peer, [S.Error, ErrorCode.NotHost]); return; }
    if (msg[0] === C.ResetName) {
      const t = this.members.get(msg[1] as number);
      if (!t || t === m || t.nick === null) return;
      t.nick = null;
      this.broadcast([S.Renamed, t.id, null], null);
    } else if (msg[0] === C.Kick) {
      const t = this.members.get(msg[1] as number);
      if (!t || t === m) return;
      this.revoked.push(t.token);
      this.kickLockUntil = this.clock.now() + KICK_LOCK_MS; // the kicked child cannot walk straight back in
      this.stateChanged = true;
      if (t.peer) this.send(t.peer, [S.Error, ErrorCode.Kicked]);
      this.remove(t, LeaveReason.Kicked, CLOSE.Kicked);
    } else if (msg[0] === C.Lock) {
      this.locked = msg[1] === 1;
      if (!this.locked) this.kickLockUntil = 0;
      this.stateChanged = true;
    } else if (msg[0] === C.Rotate) {
      const old = this._code;
      const code = this.rotate();
      this.send(peer, [S.Code, code, this.codeExpiresAt]);
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

  /** 5 Hz: hello timeouts, grace expiry, host migration, empty / age close, batched dirty poses. */
  tick(): void {
    if (this.ended) return;
    const now = this.clock.now();
    for (const [peer, deadline] of Array.from(this.pending)) {
      if (now >= deadline) { this.pending.delete(peer); peer.close(CLOSE.HelloTimeout); }
    }
    if (now >= this.partyEndsAt) { this.end(EndReason.Expired); return; }
    for (const m of Array.from(this.members.values())) {
      if (m.goneAt !== null && now - m.goneAt >= RESUME_GRACE_MS) {
        this.remove(m, m.pose && m.pose[6] === Zone.Indoors ? LeaveReason.Indoors : LeaveReason.Timeout, null);
      }
    }
    this.migrateHost(now);
    if (this.members.size === 0 && now - this.emptySince >= EMPTY_CLOSE_MS) { this.end(EndReason.Empty); return; }
    // batch poses: each recipient gets every dirty member except itself
    const dirty: Member[] = [];
    this.members.forEach((m) => { if (m.dirty && m.pose) dirty.push(m); });
    if (dirty.length) {
      this.tickNo++;
      this.members.forEach((r) => {
        if (!r.peer) return;
        const flat: number[] = [];
        for (const d of dirty) if (d !== r) flat.push(d.id, ...(d.pose as PoseBody));
        if (flat.length) this.send(r.peer, [S.Poses, this.tickNo, ...flat] as ServerMsg);
      });
      dirty.forEach((d) => { d.dirty = false; });
    }
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
      if (m && (m.goneAt === null || now - m.goneAt < RESUME_GRACE_MS)) {
        const old = m.peer;
        if (old) { this.byPeer.delete(old); m.peer = null; old.close(CLOSE.Replaced); }
        this.pending.delete(peer);
        m.peer = peer; m.goneAt = null;
        m.lastSeq = -1; // the client restarts its pose counter at 0 on every connect (review #7)
        this.byPeer.set(peer, m);
        this.welcome(m);
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
    if (isHostKey && !this.members.has(this.hostId)) { this.hostId = id; this.hadHost = true; }
    this.welcome(m);
    this.broadcast([S.Joined, this.memberInfo(m)], m);
  }

  private newMember(id: number, name: NameIdx, nick: string | null, look: number[], token: string, joinSeq: number, peer: Peer, now: number): Member {
    return {
      id, name, nick, look: look.slice(), token, joinSeq,
      peer, goneAt: null, pose: null, poseAt: now, lastSeq: -1, dirty: false, lastWarpAt: -1e12,
      poseBucket: new TokenBucket(RATE.pose[0], RATE.pose[1]), emoteBucket: new TokenBucket(RATE.emote[0], RATE.emote[1]),
      pingBucket: new TokenBucket(RATE.ping[0], RATE.ping[1]), ctlBucket: new TokenBucket(RATE.control[0], RATE.control[1]),
      emoteTimes: [], bad: 0, secStart: now, secCount: 0,
    };
  }

  private migrateHost(now: number): void {
    if (!this.hadHost) return; // the code alone never makes someone host; only the hostKey does
    const h = this.members.get(this.hostId);
    if (h && (h.goneAt === null || now - h.goneAt < HOST_GRACE_MS)) return;
    // host removed, or gone for >= 30 s: oldest connected member takes over
    let best: Member | null = null;
    this.members.forEach((m) => { if (m.goneAt === null && m.peer && (!best || m.joinSeq < best.joinSeq)) best = m; });
    const b = best as Member | null;
    if (b && b.id !== this.hostId) { this.hostId = b.id; this.broadcast([S.Host, b.id], null); }
  }

  private welcome(m: Member): void {
    const list: MemberInfo[] = [];
    this.members.forEach((x) => list.push(this.memberInfo(x)));
    this.send(m.peer as Peer, [S.Welcome, PROTOCOL_VERSION, m.id, m.token, this.codeExpiresAt, this.partyEndsAt, this.locked ? 1 : 0, list]);
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
    if (body[7] & PoseFlag.Warp) {
      if (now - m.lastWarpAt < WARP_MIN_GAP_MS) return; // at most one teleport per 5 s
      m.lastWarpAt = now;
    } else if (m.pose && !speedOk(m.pose, body, now - m.poseAt)) {
      return; // speed cheat: dropped, never relayed; the last good pose stays
    }
    m.lastSeq = seq; m.pose = body; m.poseAt = now; m.dirty = true;
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
    this.members.delete(m.id);
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
    this.stateChanged = true;
    this.members.forEach((m) => { if (m.peer) { this.send(m.peer, [S.Ended, reason]); m.peer.close(CLOSE.Ended); } });
    this.pending.forEach((_d, p) => p.close(CLOSE.Ended));
    this.members.clear(); this.byPeer.clear(); this.pending.clear();
  }

  private refuse(peer: Peer, code: ErrorCode): void {
    this.pending.delete(peer);
    this.send(peer, [S.Error, code]);
    peer.close(CLOSE.Refused);
  }

  private freeId(): number {
    for (let i = 0; i < 16; i++) {
      const id = (this.idCursor + i) % 16;
      if (!this.members.has(id)) { this.idCursor = (id + 1) % 16; return id; }
    }
    return 0; // unreachable: PARTY_MAX < 16
  }

  private send(peer: Peer, msg: ServerMsg): void {
    try { peer.send(encode(msg)); } catch { /* peer already gone */ }
  }

  private broadcast(msg: ServerMsg, except: Member | null): void {
    const text = encode(msg);
    this.members.forEach((m) => {
      if (m !== except && m.peer) { try { m.peer.send(text); } catch { /* ignore */ } }
    });
  }
}
