// Multiplayer wire protocol: constants and types (design docs/multiplayer-design.md section 4.4). Pure TS, no imports.
export const PROTOCOL_VERSION = 1;
export const PARTY_MAX = 20; // players per island party (raised from 6, Oct 22 2026: docs/multiplayer-design.md section 2.9)
export const MAX_MEMBER_ID = 31; // slot ids are 0..31 on the wire (5 bits): room for 20 live members with spare ids
/** Interest management (RoomCore.tick): each client gets the nearest INTEREST_NEAR moving friends' poses every 5 Hz tick; everyone who changed is sent once per BEACON_EVERY ticks (1 Hz). */
export const INTEREST_NEAR = 12;
export const BEACON_EVERY = 5;
export const CODE_ALPHABET = '23456789BCDFGHJKMNPQRSTVWXYZ';
export const CODE_LENGTH = 6;
export const CODE_TTL_MS = 8 * 60 * 60 * 1000; // new joins (8 h; owner decision Oct 22 2026, was 2 h)
export const PARTY_MAX_MS = 12 * 60 * 60 * 1000; // session hard cap (12 h, was 4 h)
export const RESUME_GRACE_MS = 60_000;
export const HOST_GRACE_MS = 30_000;
/** Party persistence: a member whose last pose announced they stepped away on purpose (Zone.Indoors = a room page, Mode.Busy = a menu /
 *  lesson / the walkthrough, or the Hidden flag = the tab went to the background) keeps their slot this long, host included (no migration). */
export const AWAY_GRACE_MS = 10 * 60_000;
export const EMPTY_CLOSE_MS = 120_000;
export const MAX_INBOUND_BYTES = 512;
export const LOOK_LEN = 12; // look indexes, each 0..63

export const Zone = { Main: 0, Cay: 1, Summit: 2, Sea: 3, Indoors: 4 } as const;
export type Zone = (typeof Zone)[keyof typeof Zone];
export const Mode = {
  Walk: 0, Run: 1, Scooter: 2, Bike: 3, Moped: 4, Jetpack: 5, Parachute: 6,
  Zipline: 7, Swim: 8, Dive: 9, AnimalRide: 10, Fishing: 11, Busy: 12, Idle: 13,
} as const;
export type Mode = (typeof Mode)[keyof typeof Mode];
export const Emote = { Wave: 0, Cheer: 1, HighFive: 2, JuggleWithMe: 3, ShowOff: 4, WellPlayed: 5, PassBall: 6, Laugh: 7, Dance: 8, Thanks: 9 } as const;
export type Emote = (typeof Emote)[keyof typeof Emote];
export const PingKind = { MeetHere: 0, FollowMe: 1 } as const;
export type PingKind = (typeof PingKind)[keyof typeof PingKind];
export const LeaveReason = { Left: 0, Timeout: 1, Kicked: 2, Indoors: 3 } as const;
export type LeaveReason = (typeof LeaveReason)[keyof typeof LeaveReason];
export const EndReason = { HostEnded: 0, Expired: 1, Empty: 2 } as const;
export type EndReason = (typeof EndReason)[keyof typeof EndReason];
export const ErrorCode = {
  BadMessage: 0, RateLimited: 1, Full: 2, NotFound: 3, Expired: 4, Locked: 5, NotHost: 6, BadVersion: 7, Kicked: 8, BadName: 9,
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
/** Warp: teleport (fade, skip speed check); Hidden: in a menu/away. */
export const PoseFlag = { Warp: 1, Hidden: 2 } as const;
export type PoseFlag = (typeof PoseFlag)[keyof typeof PoseFlag];

/** Relay v1.2 capability bits (S.Caps / C.Caps). Live = timestamped 10 Hz near poses (S.Live); Ball = friends' balls (C.Ball, in S.Live).
 *  Rename (relay v1.3, Oct 23 2026) = the player may change their own first name mid-party (C.Rename).
 *  EmoteAsk (relay v1.4, Oct 23 2026) = shared ball emotes are a REQUEST + ACCEPT (C.EmoteAsk / S.EmoteAsk / C.EmoteAnswer / S.EmoteAnswer /
 *  S.Duet); without it (an old relay) Pass it / Juggle with me stay today's instant one-way emote.
 *  NameLock (relay v1.5, Oct 23 2026) = the host can lock / unlock a member's name (C.NameLock); lock state arrives as S.NameLock. Without
 *  it (an old relay) the host's Lock name button is hidden.
 *  Hit (relay v1.6, Oct 23 2026) = a friend's kicked ball can knock a party friend over (C.Hit / S.Hit: a harmless ~1 s cartoon tumble).
 *  Without it (an old relay or an old client) friends are never knocked over; the NPC knock-over by my own ball is unchanged. */
export const Cap = { Live: 1, Ball: 2, Rename: 4, EmoteAsk: 8, NameLock: 16, Hit: 32 } as const;
export const CAPS_ALL = 63;
/** Relay v1.6 ball knock-over rules (C.Hit): shooter and victim within HIT_RANGE_M, each shooter at most HIT_RATE_MAX hits per
 *  HIT_RATE_WINDOW_MS, and the same shooter -> victim pair at most once per HIT_PAIR_COOLDOWN_MS. */
export const HIT_RANGE_M = 25;
export const HIT_RATE_MAX = 3;
export const HIT_RATE_WINDOW_MS = 10_000;
export const HIT_PAIR_COOLDOWN_MS = 4_000;
/** The two-player ball emotes that need the friend's yes (relay v1.4). Every other emote stays instant and one-way. */
export const ASK_EMOTES: readonly Emote[] = [Emote.JuggleWithMe, Emote.PassBall];
/** S.EmoteAnswer outcomes: No thanks (or the card timed out), Join, or the relay could not ask (old client, busy, too far, too soon). */
export const AskReply = { No: 0, Yes: 1, Unavailable: 2 } as const;
export type AskReply = (typeof AskReply)[keyof typeof AskReply];
/** None: no ball shown. Feet: dribbling / charging (drawn at the friend's feet). Juggle: keepy-ups over the feet. Free: shot / rolling / resting at x,y,z. */
export const BallState = { None: 0, Feet: 1, Juggle: 2, Free: 3 } as const;
export type BallState = (typeof BallState)[keyof typeof BallState];
export const LIVE_POSE_STRIDE = 10;
export const LIVE_BALL_STRIDE = 6;
/** Relay v1.2: between two 5 Hz ticks (so 10 Hz) each recipient also gets the nearest LIVE_NEAR friends in its room within LIVE_RANGE_M. */
export const LIVE_NEAR = 4;
export const LIVE_RANGE_M = 40;
/** A friend's ball reaches recipients in the same room within this range (m). */
export const BALL_RANGE_M = 80;
export type Look = number[]; // length LOOK_LEN, ints 0..63
export type MemberId = number; // 0..MAX_MEMBER_ID (31), server-assigned slot
/** [colour, reserved]: the second slot used to be an animal index; the relay now always sends 0 and receivers ignore it. */
export type NameIdx = [colour: number, reserved: number];
/** Pose body: [x_dm, y_dm, z_dm, yaw256, speedQ, mode, zone, flags] */
export type PoseBody = [number, number, number, number, number, Mode, Zone, number];
/** nick: the typed first name (normalizeNick), or null / absent = shown by colour name ('Red'). */
export type MemberInfo = [id: MemberId, name: NameIdx, look: Look, isHost: 0 | 1, pose: PoseBody | null, nick?: string | null];

// client -> server
export const C = { Hello: 0, Pose: 1, Emote: 2, Ping: 3, Kick: 4, Lock: 5, Rotate: 6, End: 7, Leave: 8, Beat: 9, ResetName: 10, Caps: 11, Ball: 12, Rename: 13, EmoteAsk: 14, EmoteAnswer: 15, NameLock: 16, Hit: 17 } as const;
export type C = (typeof C)[keyof typeof C];
export type CHello = [typeof C.Hello, v: number, look: Look, resumeToken: string | null, hostKey: string | null,
  reservedAnimal?: number | null, nick?: string | null]; // slot 5 reserved (old animal index: parsed, ignored; send null). nick (slot 6) is REQUIRED for new clients: a 7-element Hello with a missing or invalid nick is refused with ErrorCode.BadName. Old 5 / 6-element Hellos (no nick) are still accepted as colour-name-only during the transition period.
export type CPose = [typeof C.Pose, seq: number, ...body: PoseBody];
export type CEmote = [typeof C.Emote, emote: Emote];
export type CPing = [typeof C.Ping, kind: PingKind, x_dm: number, z_dm: number];
export type CKick = [typeof C.Kick, target: MemberId]; // host only
export type CLock = [typeof C.Lock, locked: 0 | 1]; // host only
export type CRotate = [typeof C.Rotate]; // host only: new code
export type CEnd = [typeof C.End]; // host only
export type CLeave = [typeof C.Leave];
export type CBeat = [typeof C.Beat, t: number];
/** RESERVED (retired Oct 23 2026: the host's Reset name became Lock name). Still parsed so an old client's frame is not counted as bad;
 *  the relay ignores it. New clients never send it. */
export type CResetName = [typeof C.ResetName, target: MemberId];
/** Live feel (relay v1.2, Oct 23 2026): sent ONLY after the relay's S.Caps (an old relay never sends it, so an old relay never sees these
 *  frames and never counts them as bad). bits = the Cap bits this client understands, ANDed with the relay's. */
export type CCaps = [typeof C.Caps, bits: number];
/** The local ball, visual only for friends (never collides, never scores). Island only. state: BallState; x/y/z decimetres (island
 *  coordinates; ignored by receivers for None / Feet / Juggle, which draw the ball at the friend's own feet). */
export type CBall = [typeof C.Ball, state: BallState, x_dm: number, y_dm: number, z_dm: number];
/** Relay v1.3: change MY OWN first name (normalizeNick; the relay re-checks it). Sent ONLY after the relay's S.Caps carried Cap.Rename (an
 *  old relay never sees it). The relay re-announces the member as S.Joined (same id, new nick) to everyone, the sender included: every client
 *  store upserts Joined by id, so old clients show the new name too. Ignored while the host has locked this member's name (relay v1.5). */
export type CRename = [typeof C.Rename, nick: string];
/** Relay v1.4 (Cap.EmoteAsk): ask the friend `to` to play a two-player ball emote (ASK_EMOTES) with me. Sent ONLY after S.Caps carried
 *  Cap.EmoteAsk. The relay checks both are on the island, on foot, near, outside the force field, and the pair's anti-spam rules. */
export type CEmoteAsk = [typeof C.EmoteAsk, to: MemberId, emote: Emote];
/** Relay v1.4: my answer to the ask from `from` (1 = Join, 0 = No thanks / the card timed out). */
export type CEmoteAnswer = [typeof C.EmoteAnswer, from: MemberId, yes: 0 | 1];
/** Relay v1.5 (Cap.NameLock), host only: lock (1) or unlock (0) member `target`'s name. A locked member cannot rename (C.Rename is ignored)
 *  for the rest of the party, across a resume. The host's own name can never be locked. */
export type CNameLock = [typeof C.NameLock, target: MemberId, locked: 0 | 1];
/** Relay v1.6 (Cap.Hit): my own kicked ball just hit friend `victim` fast enough to knock them over (the SHOOTER's client detects it
 *  against the friend's drawn pose). dir = the ball's travel direction (0..255 = 0..2 pi, atan2(vx, vz)). The relay checks the rules
 *  (party, same room, near, outside the force field, rate limit, pair cooldown) and silently drops a refused hit. */
export type CHit = [typeof C.Hit, victim: MemberId, dir: number];
export type ClientMsg = CHello | CPose | CEmote | CPing | CKick | CLock | CRotate | CEnd | CLeave | CBeat | CResetName | CCaps | CBall | CRename | CEmoteAsk | CEmoteAnswer | CNameLock | CHit;

// server -> client
export const S = {
  Welcome: 20, Joined: 21, Left: 22, Poses: 23, Emote: 24, Ping: 25, Host: 26, Code: 27, Ended: 28, Error: 29, Beat: 30, Renamed: 31,
  Caps: 32, Live: 33, EmoteAsk: 34, EmoteAnswer: 35, Duet: 36, NameLock: 37, Hit: 38,
} as const;
export type S = (typeof S)[keyof typeof S];
export type SWelcome = [typeof S.Welcome, v: number, you: MemberId, resumeToken: string, codeExpiresAt: number,
  partyEndsAt: number, locked: 0 | 1, members: MemberInfo[]];
export type SJoined = [typeof S.Joined, member: MemberInfo];
export type SLeft = [typeof S.Left, id: MemberId, reason: LeaveReason];
/** Batched at 5 Hz: flat list of [id, ...PoseBody] for members whose pose changed since the last tick. */
export type SPoses = [typeof S.Poses, tick: number, ...flat: number[]];
export type SEmote = [typeof S.Emote, id: MemberId, emote: Emote];
export type SPing = [typeof S.Ping, id: MemberId, kind: PingKind, x_dm: number, z_dm: number];
export type SHost = [typeof S.Host, id: MemberId];
export type SCode = [typeof S.Code, code: string, codeExpiresAt: number]; // sent to host only (after Rotate)
export type SEnded = [typeof S.Ended, reason: EndReason];
export type SError = [typeof S.Error, code: ErrorCode];
export type SBeat = [typeof S.Beat, t: number];
/** LEGACY (an old relay only): the host reset a member's typed name; everyone falls back to the colour name. nick is always null.
 *  A v1.5 relay never sends it (Reset name was replaced by Lock name); clients still apply it for a mixed-version party. */
export type SRenamed = [typeof S.Renamed, id: MemberId, nick: null];
/** Relay v1.2: sent right after every Welcome. Old clients cannot parse it and ignore it (parseServer -> null). */
export type SCaps = [typeof S.Caps, bits: number];
/** Relay v1.2, only to a client that answered C.Caps with Cap.Live: replaces S.Poses for it. t = relay clock (ms);
 *  poses = flat [id, ...PoseBody, ageMs] (stride LIVE_POSE_STRIDE), balls = flat [id, state, x_dm, y_dm, z_dm, ageMs] (stride LIVE_BALL_STRIDE).
 *  ageMs = how long before t the relay received that frame, so the receiver can place every snapshot on the sender's timeline. */
export type SLive = [typeof S.Live, t: number, poses: number[], balls: number[]];
/** Relay v1.4, to the asked friend only: `from` asks me to play `emote` together (a card with Join / No thanks). */
export type SEmoteAsk = [typeof S.EmoteAsk, from: MemberId, emote: Emote];
/** Relay v1.4, to the asker only: what `by` said (AskReply). A Yes is followed by S.Duet. */
export type SEmoteAnswer = [typeof S.EmoteAnswer, by: MemberId, emote: Emote, reply: AskReply];
/** Relay v1.4, to every Cap.EmoteAsk member (old clients get one S.Emote per player instead): `a` (the asker) and `b` play `emote`
 *  together, each with their own ball, now. seed (0..255) picks the routine so every screen plays the same one. */
export type SDuet = [typeof S.Duet, a: MemberId, b: MemberId, emote: Emote, seed: number];
/** Relay v1.5, only to Cap.NameLock members: member `id`'s name is locked (1) / unlocked (0). Sent to all of them when the host
 *  toggles it, and as a list of [id, 1] frames to a member right after its C.Caps (so a join or resume learns every lock). */
export type SNameLock = [typeof S.NameLock, id: MemberId, locked: 0 | 1];
/** Relay v1.6, to every Cap.Hit member of the room (the victim and the shooter included): `shooter`'s ball knocked `victim` over;
 *  dir = the ball's travel direction (0..255). The victim's own client plays the tumble on its local player, the others on that friend. */
export type SHit = [typeof S.Hit, shooter: MemberId, victim: MemberId, dir: number];
export type ServerMsg = SWelcome | SJoined | SLeft | SPoses | SEmote | SPing | SHost | SCode | SEnded | SError | SBeat | SRenamed | SCaps | SLive | SEmoteAsk | SEmoteAnswer | SDuet | SNameLock | SHit;
