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
/** Far (relay v2.0 world mode only): the member went out of sight for THIS recipient (beyond WORLD_SEE_M, another room, or the relay
 *  stopped showing them). Fade them out quietly; they may come back with a new S.Joined. The recipient is never told which. */
export const LeaveReason = { Left: 0, Timeout: 1, Kicked: 2, Indoors: 3, Far: 4 } as const;
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
export const Cap = { Live: 1, Ball: 2, Rename: 4, EmoteAsk: 8, NameLock: 16, Hit: 32, Kit: 64, Match: 128, World: 256, Quiet: 512, Report: 1024, Goal: 2048, Map: 4096, KitClub: 8192 } as const;
/** What a PARTY socket is offered (S.Caps): exactly 255, as before relay v2.0, so every old client keeps parsing S.Caps. */
export const CAPS_ALL = 255;
/** Relay v2.0 (public worlds, Nov 11 2026; docs/multiplayer/WORLD-HANDOFF.md). Only a WORLD socket (/world/:shard/ws) is offered
 *  CAPS_WORLD: the party bits that stay between strangers (Live, Ball, EmoteAsk, Kit, Match; never Rename, NameLock, Hit) plus
 *  World (S.World live count), Quiet (S.Quiet near count) and Report (C.Report). A client ANDs its bits with S.Caps, so it never sends
 *  a bit above 255 to an old relay (whose parser takes 0..255). New parsers take 0..CAPS_MAX. */
/** Phase 3 (Nov 12 2026): Cap.Goal (the island-wide daily goal: C.Goal / S.Goal) joins CAPS_WORLD. A client still ANDs with S.Caps, so a
 *  relay without it never gets C.Goal. */
/** Map dots (Nov 13 2026): Cap.Map (S.Map, anonymous coarse cells of the other players for the island map) joins CAPS_WORLD. An old
 *  relay never offers it (no S.Map: no dots); an old client never answers it (nothing new is sent). */
/** Drip FC club kit (Nov 13 2026): Cap.KitClub (a Kit may carry KIT_CLUB_LEN slots: the club crest, boot and ball stickers) joins
 *  CAPS_WORLD. A client sends the long kit only when S.Caps offered it (else the first KIT_LEN slots); the relay forwards the long kit
 *  only to Cap.KitClub members and its first KIT_LEN slots to everyone else, so an old relay and an old client never see one. A party
 *  (CAPS_ALL stays exactly 255) keeps the short kit. */
export const CAPS_WORLD = Cap.Live | Cap.Ball | Cap.EmoteAsk | Cap.Kit | Cap.Match | Cap.World | Cap.Quiet | Cap.Report | Cap.Goal | Cap.Map | Cap.KitClub;
export const CAPS_MAX = 0xffff;

// ---- relay v2.0: public worlds (strangers on one island). Shared by the client, the relay, the dev relay and the tests. ----
/** A world fills to WORLD_SOFT before the lobby opens another; WORLD_HARD is the room's real cap (room for reconnects of members
 *  already assigned). The lobby never opens more than WORLD_MAX_SHARDS worlds (then GET /world answers open:false). */
/** Owner, Nov 12 2026: raised from soft 20 / hard 24. Member ids stay 0..MAX_MEMBER_ID (32 ids): WORLD_HARD leaves WORLD_ID_SPARE ids
 *  free, and seat holders (dropped / away members within their grace) count toward WORLD_HARD, so a fresh join can never run out of ids. */
export const WORLD_SOFT = 26;
export const WORLD_HARD = 30;
export const WORLD_ID_SPARE = 2;
export const WORLD_MAX_SHARDS = 64;
/** Interest between strangers (m, horizontal): nobody farther than WORLD_SEE_M is ever sent (no 1 Hz beacon either); one who left
 *  sight comes back at WORLD_SEE_BACK_M (no flicker at the edge). Indoors, only members in the same room are seen. */
export const WORLD_SEE_M = 160;
export const WORLD_SEE_BACK_M = 150;
/** S.Quiet counts the others I can see within this range (m). 0 = nobody near: the client may send poses at 2 Hz. */
export const QUIET_RANGE_M = 40;
/** World slots: an announced away (room page, menu, background) keeps the slot WORLD_AWAY_GRACE_MS after a drop (party: 10 min);
 *  a member who has not moved (or has been away) for WORLD_IDLE_MS is removed and closed with CloseCode.Idle. */
export const WORLD_AWAY_GRACE_MS = 2 * 60_000;
export const WORLD_IDLE_MS = 5 * 60_000;
/** Following guard (relay, 1 Hz): A within nearM of B for more than holdMs while B moved more than movedM (path) in that time ->
 *  B stops receiving A, until A has been farther than releaseM from B for releaseMs. */
export const FOLLOW = { nearM: 4, holdMs: 45_000, movedM: 30, releaseM: 15, releaseMs: 30_000 } as const;
/** C.Report reasons (ints on the wire). */
export const ReportReason = { Following: 0, InMyWay: 1, TooManyWaves: 2, SomethingElse: 3 } as const;
export type ReportReason = (typeof ReportReason)[keyof typeof ReportReason];
/** Stats ids (relay counters), index = ReportReason. */
export const REPORT_REASON_IDS = ['following', 'in_my_way', 'too_many_waves', 'something_else'] as const;
/** Report rules: DISTINCT reporters (by daily IP hash) per target within windowMs; toQuarantine of them quarantine the target for
 *  that connection and hold its IP hash for holdMs (memory only). Each reporter has a rate bucket [perSec, burst] and one report per target in that span. */
export const REPORT = { windowMs: 10 * 60_000, toQuarantine: 2, holdMs: 60 * 60_000, rate: [0.1, 3] } as const;
/** Phase 3 (Nov 12 2026), the island-wide daily goal: every world counts the goals its kids' teams score today (UTC day). A count only:
 *  no id, name or position is kept. target = the day's goal shown to kids; max = where the count stops; rate = each member's C.Goal
 *  bucket [perSec, burst] (one goal per 10 s sustained: a real live-match goal is rarer than that). */
export const ISLAND_GOAL = { target: 50, max: 9999, rate: [0.1, 3] } as const;
/** Map dots (Nov 13 2026, Cap.Map): every `everyMs` the relay sends each Cap.Map member S.Map, the OTHER players on the open island
 *  as cells of `cellM` metres with a count per cell. Never an id, name, kit or exact spot; never me, anyone in a room or indoors, away
 *  (Hidden), quarantined, not yet posed, or held back from me (or me from them) by a report or the following guard. Sent only when the
 *  list changed; at most `maxCells` cells (the fullest kept). Cell (cx, cz) covers x in [cx * cellM, (cx + 1) * cellM) m. */
export const MAP_DOTS = { cellM: 25, everyMs: 5000, maxCells: 32 } as const;
/** WebSocket close codes the client must handle on a world socket (the relay's full list is CLOSE in roomCore.ts). */
export const CloseCode = {
  /** Public play was switched off by the owner (POST /control): go to "Just me" quietly; do not retry until GET /world says open. */
  WorldOff: 4007,
  /** The slot was freed after WORLD_IDLE_MS idle / away: go to "Just me" quietly; reconnect (GET /world) on the next real input. */
  Idle: 4008,
} as const;
/** Relay v1.8 (Cap.Match, Nov 4 2026; docs/join-live-game-design.md "Multiplayer slice 2"): friends play the SAME live match.
 *  ONE new client frame C.Match and ONE new server frame S.Match, each [code, MatchKind, ...]. An old client never answers Cap.Match in
 *  C.Caps, so it never gets S.Match (and could not parse it: parseServer -> null); an old relay never offers it, so a new client never
 *  sends C.Match and every kid plays their own local match (slice 1).
 *  - C.Match Join  [19, 0, field, team, slot]: I took `slot` (an index into that format's MatchSim.ids) on `team` (0 gold, 1 blue) of
 *    `field` (MATCH_FIELDS index). The relay keeps one roster per field: one human per slot, first come; the first joiner OWNS the field
 *    (runs the only MatchSim). A taken slot is refused (the joiner gets the roster without itself).
 *  - C.Match Leave [19, 1]: I left my match (also implied by a disconnect, a leave, a kick or a timeout).
 *  - C.Match In    [19, 2, seq, mx, my, buttons, passPower, shootPower, long, aimX, aimH]: a non-owner's controls (sim-space stick and
 *    0..1 values x100, MATCH_BTN bits, aim -1000 = auto), ~12 Hz + at once on a button press. Forwarded ONLY to the field's owner.
 *  - C.Match Snap  [19, 3, field, ...state]: the owner's snapshot (lib/town/match/matchNet.ts encodeSnap), ~12 Hz while the field has a
 *    friend. Accepted only from the owner, forwarded only to the field's other members.
 *  - S.Match Roster [40, 0, field, owner, ...flat (member, team, slot)]: to every Cap.Match member when a field's roster changes (owner -1
 *    = nobody), and every live roster right after C.Caps. Owner migration: the earliest remaining joiner.
 *  - C.Match Watch [19, 4, field]: (Nov 5 2026) a party friend NOT in that match watches it (field -1 = stop): the relay also forwards
 *    that field's Snaps to them, so their screen shows the real shared match (a puppet, no controls). One watched field per member.
 *  - S.Match In    [40, 2, from, seq, ...the C.Match In values]: to the owner. S.Match Snap [40, 3, field, ...state]: to the members
 *    and the field's watchers. The Snap may end with one packed event value per human (matchNet SNAP_EVENTS; older readers skip it).
 *  - S.Match Watch [40, 4, field, watchers]: to the field's owner when its watcher count may have changed (an owner alone on the field
 *    snapshots only while someone watches). */
export const MatchKind = { Join: 0, Leave: 1, In: 2, Snap: 3, Watch: 4 } as const;
export type MatchKind = (typeof MatchKind)[keyof typeof MatchKind];
/** S.Match kind 0 is the roster (the relay's answer to Join / Leave). */
export const MATCH_ROSTER = MatchKind.Join;
/** Field ids on the wire (lib/town/venues LiveFormat order). Append only: an index never changes meaning. 'stadium' (5, Nov 12 2026,
 *  the West Coast Stadium's big match) needs the relay redeployed (its validator accepts field < MATCH_FIELDS.length); an older
 *  relay rejects field 5, so a stadium match then stays on this phone, and older clients drop a field they do not know. */
export const MATCH_FIELDS = ['7v7', 'futsal', '9v9', '11v11', 'beach', 'stadium'] as const;
export const MATCH_SLOT_MAX = 31;
/** C.Match In button bits. */
export const MATCH_BTN = { pass: 1, shoot: 2, through: 4, tackle: 8, jockey: 16, sprint: 32, call: 64, save: 128, trick: 256, press: 512 } as const;
/** A snapshot frame's number count cap (a 9v9 is ~70; 11v11 ~80). */
export const MATCH_SNAP_MAX = 120;
/** Relay v1.7 (Cap.Kit, Oct 26 2026): a member's worn Kit Shop gear (lib/multiplayer/kit.ts) so friends see it on their avatar and ball.
 *  A flat array of KIT_LEN integers (never the kid's ball drawing, decals, crest or names):
 *   0 shirt, 1 shirt trim, 2 shorts, 3 socks, 4 sock tops  (colours 0..0xFFFFFF; jersey worn iff [0] >= 0, then 1..4 are colours too)
 *   5 shirt number (-1 none, 0..99)
 *   6 boots colour (-1 = no shop boots)
 *   7 ball layout (-1 = no shop ball; else an index), 8..10 panel colours a / b / c, 11 pattern kind (index), 12..13 pattern colours,
 *   14 pattern target (0 all, 1 a, 2 b, 3 c), 15 pattern seed (0..9999), 16 finish (index)
 *  Indexes are 0..KIT_INDEX_MAX on the wire (the client maps an unknown one to its default), so a new shop option never needs a relay deploy.
 *  Nothing worn = null. The relay checks the shape and size (KIT_MAX_BYTES), keeps the latest per slot, and forwards it as S.Kit. */
export const KIT_LEN = 17;
export const KIT_INDEX_MAX = 63;
export const KIT_MAX_BYTES = 200;
/** Cap.KitClub (Nov 13 2026): the Drip FC club kit adds five slots after the KIT_LEN above (lib/shop/dripKit.ts packs them):
 *   17 shirt club code (0 none, 1 chest crest, 2 sleeve crest, +4 wordmark; 0 when no shop jersey)
 *   18 boot club bits (1 side, 2 heel; 0 when no shop boots)
 *   19..21 ball club stickers (-1 none, else one packed sticker 0..0xFFFFFF; all -1 when no shop ball)
 *  A long kit is sent only when it carries something (else the short one), and is at most KIT_CLUB_MAX_BYTES as JSON. */
export const KIT_CLUB_LEN = 22;
export const KIT_CLUB_MAX_BYTES = 280;
export type Kit = number[];
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
/** [colour, animal]. Party: the second slot is reserved, the relay sends 0 and receivers ignore it. World (relay v2.0): the relay
 *  assigns an index into WORLD_ANIMALS (names.ts) there; old clients still show the colour only. */
export type NameIdx = [colour: number, reserved: number];
/** Pose body: [x_dm, y_dm, z_dm, yaw256, speedQ, mode, zone, flags] */
export type PoseBody = [number, number, number, number, number, Mode, Zone, number];
/** nick: the typed first name (normalizeNick), or null / absent = shown by colour name ('Red'). */
export type MemberInfo = [id: MemberId, name: NameIdx, look: Look, isHost: 0 | 1, pose: PoseBody | null, nick?: string | null];

// client -> server
export const C = { Hello: 0, Pose: 1, Emote: 2, Ping: 3, Kick: 4, Lock: 5, Rotate: 6, End: 7, Leave: 8, Beat: 9, ResetName: 10, Caps: 11, Ball: 12, Rename: 13, EmoteAsk: 14, EmoteAnswer: 15, NameLock: 16, Hit: 17, Kit: 18, Match: 19,
  /** Relay v2.0, world sockets with Cap.Report only: [60, member, ReportReason]. Client ids are 0..19 and 60+; server ids 20..59. */
  Report: 60,
  /** Phase 3 (Nov 12 2026), world sockets with Cap.Goal only: [61]: my team just scored a goal (the island-wide daily goal). */
  Goal: 61 } as const;
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
/** Relay v1.7 (Cap.Kit): my worn Kit Shop gear (Kit, or null = nothing worn). Sent ONLY after S.Caps carried Cap.Kit (an old relay never
 *  sees it), right after each S.Caps and on a change, at most once per KIT_GAP_MS (lib/multiplayer/connection.ts). */
export type CKit = [typeof C.Kit, kit: Kit | null];
/** Relay v1.8 (Cap.Match): see MatchKind. Integers only. */
export type CMatch = [typeof C.Match, kind: MatchKind, ...rest: number[]];
/** Relay v2.0 (Cap.Report): report a stranger I have seen this connection. Nothing comes back but S.Left [id, Far] (the relay stops
 *  showing us to each other). */
export type CReport = [typeof C.Report, target: MemberId, reason: ReportReason];
/** Phase 3 (Cap.Goal): my team scored. Nothing comes back but the next S.Goal. */
export type CGoal = [typeof C.Goal];
export type ClientMsg = CGoal | CReport | CMatch | CHello | CPose | CEmote | CPing | CKick | CLock | CRotate | CEnd | CLeave | CBeat | CResetName | CCaps | CBall | CRename | CEmoteAsk | CEmoteAnswer | CNameLock | CHit | CKit;

// server -> client
export const S = {
  Welcome: 20, Joined: 21, Left: 22, Poses: 23, Emote: 24, Ping: 25, Host: 26, Code: 27, Ended: 28, Error: 29, Beat: 30, Renamed: 31,
  Caps: 32, Live: 33, EmoteAsk: 34, EmoteAnswer: 35, Duet: 36, NameLock: 37, Hit: 38, Kit: 39, Match: 40,
  /** Relay v2.0 world only: S.Quiet [41, near] (Cap.Quiet), S.World [42, n] (Cap.World). */
  Quiet: 41, World: 42,
  /** Phase 3 (Nov 12 2026), world only (Cap.Goal): S.Goal [43, n] = goals this world scored today (0..ISLAND_GOAL.max). */
  Goal: 43,
  /** Map dots (Nov 13 2026), world only (Cap.Map): S.Map [44, [[cellX, cellZ, count], ...]] (MAP_DOTS). */
  Map: 44,
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
/** Relay v1.7, only to Cap.Kit members: member `id` wears `kit` (null = nothing from the Kit Shop). Sent to every other Cap.Kit member
 *  when it changes, and once per member wearing something to a member right after its C.Caps (a join or a resume learns every kit). */
export type SKit = [typeof S.Kit, id: MemberId, kit: Kit | null];
/** Relay v1.8 (Cap.Match): see MatchKind. Integers only. */
export type SMatch = [typeof S.Match, kind: MatchKind, ...rest: number[]];
/** Relay v2.0 (Cap.Quiet): how many others I can see within QUIET_RANGE_M (0..255). Sent after C.Caps and when it changes (1 Hz). */
export type SQuiet = [typeof S.Quiet, near: number];
/** Relay v2.0 (Cap.World): members in my world now, me included (0..WORLD_HARD). Sent after C.Caps and when it changes (1 Hz). */
export type SWorld = [typeof S.World, n: number];
/** Phase 3 (Cap.Goal): goals this world scored today (UTC). Sent after C.Caps and when it changes (at most 1 Hz). */
export type SGoal = [typeof S.Goal, n: number];
/** Map dots (Cap.Map): [cellX, cellZ, count] per cell (MAP_DOTS); [] = nobody else on the open island. Counts only, no ids. */
export type MapCell = [cx: number, cz: number, n: number];
export type SMap = [typeof S.Map, cells: MapCell[]];
export type ServerMsg = SMap | SGoal | SQuiet | SWorld | SMatch | SWelcome | SJoined | SLeft | SPoses | SEmote | SPing | SHost | SCode | SEnded | SError | SBeat | SRenamed | SCaps | SLive | SEmoteAsk | SEmoteAnswer | SDuet | SNameLock | SHit | SKit;
