// Multiplayer wire protocol: constants and types (design docs/multiplayer-design.md section 4.4). Pure TS, no imports.
export const PROTOCOL_VERSION = 1;
export const PARTY_MAX = 6;
export const CODE_ALPHABET = '23456789BCDFGHJKMNPQRSTVWXYZ';
export const CODE_LENGTH = 6;
export const CODE_TTL_MS = 2 * 60 * 60 * 1000; // new joins
export const PARTY_MAX_MS = 4 * 60 * 60 * 1000; // session hard cap
export const RESUME_GRACE_MS = 60_000;
export const HOST_GRACE_MS = 30_000;
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
export const Emote = { Wave: 0, Cheer: 1, HighFive: 2, PassToMe: 3, Space: 4, WellPlayed: 5, PassBall: 6, Laugh: 7, Dance: 8, Thanks: 9 } as const;
export type Emote = (typeof Emote)[keyof typeof Emote];
export const PingKind = { MeetHere: 0, FollowMe: 1 } as const;
export type PingKind = (typeof PingKind)[keyof typeof PingKind];
export const LeaveReason = { Left: 0, Timeout: 1, Kicked: 2, Indoors: 3 } as const;
export type LeaveReason = (typeof LeaveReason)[keyof typeof LeaveReason];
export const EndReason = { HostEnded: 0, Expired: 1, Empty: 2 } as const;
export type EndReason = (typeof EndReason)[keyof typeof EndReason];
export const ErrorCode = {
  BadMessage: 0, RateLimited: 1, Full: 2, NotFound: 3, Expired: 4, Locked: 5, NotHost: 6, BadVersion: 7, Kicked: 8,
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
/** Warp: teleport (fade, skip speed check); Hidden: in a menu/away. */
export const PoseFlag = { Warp: 1, Hidden: 2 } as const;
export type PoseFlag = (typeof PoseFlag)[keyof typeof PoseFlag];

export type Look = number[]; // length LOOK_LEN, ints 0..63
export type MemberId = number; // 0..15, server-assigned slot
export type NameIdx = [colour: number, animal: number];
/** Pose body: [x_dm, y_dm, z_dm, yaw256, speedQ, mode, zone, flags] */
export type PoseBody = [number, number, number, number, number, Mode, Zone, number];
/** nick: the typed first name (normalizeNick), or null / absent = use the made-up name. */
export type MemberInfo = [id: MemberId, name: NameIdx, look: Look, isHost: 0 | 1, pose: PoseBody | null, nick?: string | null];

// client -> server
export const C = { Hello: 0, Pose: 1, Emote: 2, Ping: 3, Kick: 4, Lock: 5, Rotate: 6, End: 7, Leave: 8, Beat: 9, ResetName: 10 } as const;
export type C = (typeof C)[keyof typeof C];
export type CHello = [typeof C.Hello, v: number, look: Look, resumeToken: string | null, hostKey: string | null,
  animal?: number | null, nick?: string | null]; // animal: optional trailing index into NAME_ANIMALS (absent / null = random); nick: optional first name (normalizeNick, bad = null); old 5 / 6-element Hellos still valid
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
export type ClientMsg = CHello | CPose | CEmote | CPing | CKick | CLock | CRotate | CEnd | CLeave | CBeat | CResetName;

// server -> client
export const S = {
  Welcome: 20, Joined: 21, Left: 22, Poses: 23, Emote: 24, Ping: 25, Host: 26, Code: 27, Ended: 28, Error: 29, Beat: 30, Renamed: 31,
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
/** The host reset a member's typed name: everyone falls back to the made-up name. nick is always null. */
export type SRenamed = [typeof S.Renamed, id: MemberId, nick: null];
export type ServerMsg = SWelcome | SJoined | SLeft | SPoses | SEmote | SPing | SHost | SCode | SEnded | SError | SBeat | SRenamed;
