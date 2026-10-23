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
 *  Rename (relay v1.3, Oct 23 2026) = the player may change their own first name mid-party (C.Rename). */
export const Cap = { Live: 1, Ball: 2, Rename: 4 } as const;
export const CAPS_ALL = 7;
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
export const C = { Hello: 0, Pose: 1, Emote: 2, Ping: 3, Kick: 4, Lock: 5, Rotate: 6, End: 7, Leave: 8, Beat: 9, ResetName: 10, Caps: 11, Ball: 12, Rename: 13 } as const;
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
export type CResetName = [typeof C.ResetName, target: MemberId]; // host only: clears that member's typed name for everyone
/** Live feel (relay v1.2, Oct 23 2026): sent ONLY after the relay's S.Caps (an old relay never sends it, so an old relay never sees these
 *  frames and never counts them as bad). bits = the Cap bits this client understands, ANDed with the relay's. */
export type CCaps = [typeof C.Caps, bits: number];
/** The local ball, visual only for friends (never collides, never scores). Island only. state: BallState; x/y/z decimetres (island
 *  coordinates; ignored by receivers for None / Feet / Juggle, which draw the ball at the friend's own feet). */
export type CBall = [typeof C.Ball, state: BallState, x_dm: number, y_dm: number, z_dm: number];
/** Relay v1.3: change MY OWN first name (normalizeNick; the relay re-checks it). Sent ONLY after the relay's S.Caps carried Cap.Rename (an
 *  old relay never sees it). The relay re-announces the member as S.Joined (same id, new nick) to everyone, the sender included: every client
 *  store upserts Joined by id, so old clients show the new name too. Ignored after the host reset this member's name (kid safety). */
export type CRename = [typeof C.Rename, nick: string];
export type ClientMsg = CHello | CPose | CEmote | CPing | CKick | CLock | CRotate | CEnd | CLeave | CBeat | CResetName | CCaps | CBall | CRename;

// server -> client
export const S = {
  Welcome: 20, Joined: 21, Left: 22, Poses: 23, Emote: 24, Ping: 25, Host: 26, Code: 27, Ended: 28, Error: 29, Beat: 30, Renamed: 31,
  Caps: 32, Live: 33,
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
/** The host reset a member's typed name: everyone falls back to the colour name. nick is always null. */
export type SRenamed = [typeof S.Renamed, id: MemberId, nick: null];
/** Relay v1.2: sent right after every Welcome. Old clients cannot parse it and ignore it (parseServer -> null). */
export type SCaps = [typeof S.Caps, bits: number];
/** Relay v1.2, only to a client that answered C.Caps with Cap.Live: replaces S.Poses for it. t = relay clock (ms);
 *  poses = flat [id, ...PoseBody, ageMs] (stride LIVE_POSE_STRIDE), balls = flat [id, state, x_dm, y_dm, z_dm, ageMs] (stride LIVE_BALL_STRIDE).
 *  ageMs = how long before t the relay received that frame, so the receiver can place every snapshot on the sender's timeline. */
export type SLive = [typeof S.Live, t: number, poses: number[], balls: number[]];
export type ServerMsg = SWelcome | SJoined | SLeft | SPoses | SEmote | SPing | SHost | SCode | SEnded | SError | SBeat | SRenamed | SCaps | SLive;
