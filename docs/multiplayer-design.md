# Multiplayer v1: play with friends on the same island (design, 21 Oct 2026)
> **Phase 0 status (22 Oct 2026):** code-complete on branch `mp-verify`, nothing pushed or deployed. Passed: full `npm run test:quiet` (248/248, including the six `mp-*` suites and `tests/mp-isolation.cjs`), `NEXT_DIST_DIR=.next-mpverify npm run build:quiet`, `scripts/mp-relay-smoke.mjs`, and `tsc` for `multiplayer/relay` and the root. Left for the owner: Cloudflare account and relay deploy, two-device test, legal review of the privacy draft, iPhone heat check, then enabling `NEXT_PUBLIC_MULTIPLAYER`. Flag stays off.


Status: **DESIGN, decision-ready.** No app code changed. Implementers follow this doc plus `docs/multiplayer-workplan.md`
(the task split for Phase 0). It builds on, and does not repeat:
- `docs/multiplayer-research.md` (16 Oct): the code survey, per-state drawing table, heat budget, COPPA/ICO notes.
- `docs/multiplayer-plan-2026-10-19.md` (19 Oct): transport cost table, ghost model (b), server sanity, test plan.

**What changed vs those docs:** the user's new request is *friends together* ("groups of friends ... on the same island ... how
to invite other friends"), so v1 is the 19 Oct doc's **P3 friends room, brought forward as the first thing built**. Public
shards (16/24 rooms, lobby, area of interest, reports) stay deferred. That is also the lower-risk launch (19 Oct D2).

| Topic | 19 Oct plan | This design (v1) | Why |
|---|---|---|---|
| First release | Public shards of 16/24 | **Private parties of 2-6 friends, by invite only** | User asked for friends; no strangers = far smaller safety/legal surface |
| Invite | Picture "together codes" | **6-character code + share link + QR**, picture display optional later | Works by text/AirDrop/school chat-of-parents and in person; QR lib already in repo |
| Wire | Binary 12-byte frames | **JSON compact arrays** (numbers only, plus opaque tokens) | 6 players = ~1 KB/s, binary not needed yet; easier to debug; `v` field allows binary later |
| Identity | Save-code HMAC `presenceKey` | **No identifier at all** (no save code, no install id, no hash of either) | Parties are ephemeral; blocks/reports across sessions are a public-room need |
| Heat caps | 8/8/6/4/0-new | **5/5/3/1/0-new** (max party 6 = 5 remotes) | Brief; capped friends show as a map pin, never vanish mid-view |

---

## 1. Goals and non-goals

**v1 goal:** a small group (2-6) of friends are on the **same island at the same time**, see each other's avatars (own kit),
walk/ride/swim around together, send preset emotes and "meet here / follow me" pings, and leave at any time.

**Model:** the 19 Oct "ghost presence" model (b). Every kid still runs their own island exactly as today. Friends are drawn
on top: no collision, no shared objects, no effect on anyone's save. The server owns only party membership and the latest pose.

**v1 non-goals (explicit):**
- free text chat, voice chat, typed names, custom signs (the kid may pick an animal icon from a fixed list; see Identity below);
- global/public lobbies, matchmaking with strangers, browsing parties;
- persistent friend lists (Phase 4, parent-approved only);
- competitive PvP, scores against each other;
- shared economy: no trading, gifting, shared coins, shared inventory;
- shared world state: jobs, fishing, bugs, beachcombing, Explore/dive, ball hunt all stay local (Phase 3 adds a few).

**Football teaching tie-in (AGENTS.md):** emotes are football calls ("Pass to me!", "Space!", "Well played!") with a one-line
meaning the first time each is used; Phase 3's shared kickabout and party jobs teach passing and teamwork.

---

## 2. The player experience

### 2.1 Forming a group (host)
1. Host taps **Play with friends** (people icon in the action grid; hidden when the flag is off or a grown-up locked it).
2. **Parent gate** (`components/ParentGate.tsx`, reason: "Invite friends to play on your island. Nobody can chat.").
3. Client calls the relay `POST /party` -> gets `code`, `hostKey`, `expiresAt`. The **PartyInvite** card shows:
   - the code, big, grouped `K7M-Q4R` (6 chars, unambiguous alphabet, see §3.3);
   - **Share link** button (Web Share API; falls back to **Copy link**): `https://futbolisland.app/?party=K7MQ4R`;
   - a **QR code** of the link (for "hand your phone to a friend" in person; `qrcode` package already in the repo, dynamic import as in `lib/saves/printCard.ts:42`);
   - a line for grown-ups: "Share only with friends you know. The code stops working in 2 hours."
4. The host is already in the party (connected) while the card is open; friends appear as they join.

### 2.2 Joining (friend)
- **By link:** the link opens the game; `?party=CODE` is kept in `sessionStorage` (`fi-party-pending`, not a `fi2-*` save key,
  so it is never synced). A **new player** finishes the normal intro/tutorial first (`tests/new-player-flow.cjs` must not
  change); the Join card appears when the island is ready.
- **On the title screen (Oct 22 2026, no link to remember):** the first screen (`components/landing/TitleActions.tsx`, the Start / Play
  screen every player sees first) shows a calm **Join friends** button, only when `multiplayerEnabled()` and the grown-up switch is not
  Off. It opens a small card with the same six code boxes (`components/party/CodeBoxes.tsx`, shared with Join with a code) plus Join /
  Cancel. Join does not connect: `setPendingParty(code)` stores the normalised code in the same `fi-party-pending` sessionStorage
  entry, then the screen continues as Play (returning player, straight in) or Start (new player: save code + intro first). PartyHost
  then waits for `islandReady && introDone`, runs the parent gate and animal picker and joins. A pending code (link or typed) shows
  as "Party code waiting: K7M-Q4R" with an x to clear it. The code is never logged or sent to analytics.
- **By code:** Play with friends -> **Join with a code** -> 6 big character keys (only the alphabet's characters; auto-uppercase,
  auto-dash) -> Join.
- **Parent gate on joining** (recommended, decision O3): the gate pass lasts 10 min (`GATE_PASS_MS`), so a parent approves once.
- The joiner keeps **their own kit** (their saved `CharacterCustomization`); there is no picker. They see a preview "You'll join
  as **Red Zebra**" after connecting.
- **Spawn:** the joiner arrives at the **host's current zone** (main / Coral Cay / Summit) at that zone's safe arrival point
  (the ferry dock or the zone's existing spawn), never at the host's exact position (could be a roof, the sea or a ride).
  A soft arrival ring (`characterArrival`) plays for everyone.

### 2.3 What everyone sees
| Element | v1 behaviour |
|---|---|
| Friend avatar | Their bean + kit colours + hair/headwear (look indexes on join). Costumes: base bean in v1 (Phase 2 if assets loaded). |
| Name label | Friendly, never typed: colour + animal ("Red Zebra"). The COLOUR is assigned by the server and is unique in the party (handed out in a fixed best-separated order, `COLOUR_ORDER`, so a party of 6 always gets the six most distinguishable colours, also for colour-blind kids). The ANIMAL is the kid's pick from a fixed list of 16 icons in the join / start card (an index into the 32 reviewed `NAME_ANIMALS`; `Hello` field `animal`, optional, null / absent = "Surprise me" = random); two kids may share an animal, the colour keeps names unique. New each party. Small label above the head (animal glyph, coloured dot and rim), hidden beyond 40 m. |
| Colour ring | One instanced ring (capacity 8, no shadows) on the ground under each shown friend and under the local player while the party is live, in the member's colour; it grows with camera distance (up to 4x) so friends can be found from far away, pulses briefly on an emote, and is hidden with the avatar (culled, > 160 m, Battery saver). The party sheet shows the same colour as a dot beside the animal glyph and name. |
| Movement | Walk/run/ride poses from mode + speed; vehicles drawn as pose only in v1 (merged ride proxies in Phase 2). |
| Emotes | Preset only: wave, cheer, high-five, "Pass to me!", "Space!", "Well played!". Reuse `PlayerMotion.called`, celebrations, `setExpression`. |
| Pings | "Meet here" (a pin at my spot for 20 s) and "Follow me" (others get an edge arrow to me for 60 s). |
| Party chip | Fixed corner chip: stacked mini faces (count), tap -> sheet: members (name + zone icon), Emotes, Invite more (host), Leave. |
| Map | Friend pins with their colour on the existing map (Phase 2), plus "Go to friend" using the map's existing travel. |

### 2.4 Shared vs local
| Shared in v1 | Local only in v1 | Later phases |
|---|---|---|
| membership, names, look indexes | saves, coins, wallet, cards, shop | P3 shared kickabout ball (server-owned ball) |
| position x/y/z, yaw, speed, mode, zone | jobs, fishing, bug catching, beachcombing | P3 party jobs (each earns from own wallet rules) |
| emotes, pings | Explore/dive, ball hunt, lessons, quizzes | P3 Explore together (same reef, own finds) |
| host flag, party end | time of day, music, Settings, NPCs, traffic | P3 shared bugs/sea life (UTC-phased clocks) |

### 2.5 Edge cases
| Case | Behaviour |
|---|---|
| Friends in different zones | Each receives all poses (party is small); a friend more than 160 m away is not drawn, shown as a map/edge pin. |
| Different time of day | Local only; friends are drawn under your own lighting. |
| Inside the Arcade/Konbini/Museum/Shop (separate pages) | Page unload closes the socket; friends see "Red Zebra is in the Arcade" (zone `indoors` sent just before leaving), the slot is kept 60 s, then they show as away; coming back resumes. |
| Different devices / heat tiers | Remote cap by effective tier at **admission only**: tier 0-1: 5, tier 2: 3, tier 3: 1, tier 4: 0 new (already drawn stay), Battery saver: 0 (fade 1 s). Desktop: 5. Capped friends show as a pin, never vanish. |
| Reduced motion | Emotes use the still pose + an icon bubble, no confetti; arrival ring replaced by a fade. |
| Slow / offline network | Poses extrapolate up to 250 ms then ease to a stop; after 8 s silent a friend dims; chip shows a dim dot "reconnecting"; the island plays exactly as today. |
| Joining late | Welcome contains the full roster and last pose of everyone. |
| Host leaves | 30 s grace (reconnect), then host moves to the longest-present member; the party never ends because the host left. |
| Party ends | When everyone has left for 2 min, at the 4 h hard cap (10-min warning toast), or host taps **End party for everyone**. |
| Code expiry | The code accepts new joiners for 2 h; people already in stay. Host can **New code** (rotates, old code dead). |
| Tab hidden | After 15 s hidden the client closes the socket (radio sleeps, heat rule); server keeps the slot 60 s; return resumes. |
| Full party | Join card: "This party is full (6/6)". |
| Kick | Host taps a friend -> Remove. Removed kid sees "You left the party". Host is prompted to rotate the code. |

---

## 3. Invitations

### 3.1 Options compared
| Option | Works remote | Works in person | Kid can do it alone | Persistent id? | v1 |
|---|---|---|---|---|---|
| 6-char party code (read out / typed) | yes | yes | yes | no (expires 2 h) | **yes** |
| Share link `?party=CODE` (Web Share / Copy) | yes (parent's messages) | AirDrop | needs a messaging app, usually a parent's | no | **yes** |
| QR code of the link | no | **yes** (scan with camera) | yes | no | **yes** |
| Picture code (4 pictures, 19 Oct idea) | yes | yes | best for 6-year-olds | no | later, as an alternate display of the same code |
| Parent-approved friend codes (persistent) | yes | yes | no (parent) | yes, needs consent design | Phase 4 |
| Contact lists, email, phone numbers | - | - | - | yes | **never** |

**Precedents:** Animal Crossing "Dodo Code" (temporary airport code, rotate if leaked, visitors can't change your island:
[Nintendo support](https://www.nintendo.co.uk/Support/Nintendo-Switch/How-to-Start-a-Local-or-Online-Multiplayer-Game-Animal-Crossing-New-Horizons--1747985.html),
[GamesBeat](https://gamesbeat.com/animal-crossing-new-horizons-online-guide-how-visiting-islands-works/)); Roblox private
servers by invite with parental controls to disable joining/being invited for under-13s
([Roblox families](https://about.roblox.com/families), [Vodafone guide](https://www.vodafone.co.uk/newscentre/smart-living/digital-parenting/digital-parenting-pro/roblox/)).
Our design is the Dodo model (temporary code, no world changes) plus a grown-up gate.

### 3.2 Recommendation
**Code + link + QR in v1, all three showing the same code.** No accounts: the code is the only capability. A new player who
opens a link plays the intro, then joins. No email or phone number is ever asked for; the game never learns who the friend is.

### 3.3 Party code
- **Alphabet (28):** `23456789BCDFGHJKMNPQRSTVWXYZ`: no vowels (so no real words, rude or otherwise), no 0/O, no 1/I/L,
  no U (so no U/V mix-up). 28^6 = 481,890,304 codes. Plus a small blocklist test for unlucky consonant combos.
- **Display** `XXX-XXX`; input accepts lower case, spaces and dashes; characters outside the alphabet are rejected with a gentle
  "That letter isn't used in codes" hint (no silent guessing of O->0).
- **Lifetime:** new joins 2 h from creation (or rotation); party session max 4 h.
- **Generation:** on the server (`crypto.getRandomValues`); the worker retries if the code's room is live.

### 3.4 Abuse controls
| Control | Value |
|---|---|
| Party size cap | 6 (host + 5) |
| Create rate | 5 parties / hour per IP hash (daily salt), 1 live party per connection |
| Join attempts | 10 / min per IP hash; 20 unknown-code failures / hour -> 1 h block (stops code guessing) |
| Code expiry | 2 h for new joins; rotate on demand |
| Host controls | Remove friend, New code, Lock party (no new joins), End party |
| Everyone | Leave; Hide a friend (local); Mute a friend's emotes (local) |
| Content | No strings from clients ever relayed; names come from a reviewed list by index |

---

## 4. Architecture

### 4.1 Transport choice
| Option | Fit for 2-6 friend parties | Cost | Server logic next to room | Verdict |
|---|---|---|---|---|
| **Cloudflare Worker + one Durable Object per party, hibernating WebSockets** | exact fit: one object = one party, addressed by `idFromName("party:"+code)` | ~$5/mo minimum; outgoing messages free; 19 Oct table: ~$6 / $63 / $635 at 100 / 1k / 10k concurrent | yes (validate, clamp, rate-limit, assign names) | **Recommended** |
| PartyServer (Cloudflare's PartyKit successor, on DO) | same runtime | same | yes | optional helper; adds a dependency for little code saved |
| Supabase Realtime (already used by the phone controller) | works for a prototype | $2.50/M msgs, fan-out billed per receiver; 2,500 msg/s cap | no (clients name themselves, can spoof) | fallback only |
| Colyseus (self-host or Colyseus Cloud from $15/mo per instance) | good game rooms | instance-based | yes | more ops (servers to run/scale) than DO |
| Liveblocks | built for documents | per user-minute, 10 conns/room on Pro | no | not a fit |
| Vercel WebSockets (beta) | sockets close at function max duration | Redis needed | partial | not yet |

Sources: [DO pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/),
[DO WebSockets + hibernation](https://developers.cloudflare.com/durable-objects/best-practices/websockets/),
[PartyServer repo](https://github.com/cloudflare/partykit), [Cloudflare acquires PartyKit](https://blog.cloudflare.com/cloudflare-acquires-partykit),
[Supabase Realtime limits](https://supabase.com/docs/guides/realtime/limits), [Colyseus pricing](https://docs.colyseus.io/cloud/pricing-billing),
[Liveblocks pricing](https://liveblocks.io/pricing), [Vercel WebSockets](https://vercel.com/docs/functions/websockets).

DO facts that shape the code: accept sockets with `ctx.acceptWebSocket()` (hibernation API) and keep per-socket data in
`ws.serializeAttachment()` (max 2 KB) because in-memory state is lost on hibernation; an object holds far more sockets than we
need; the batching tick (`setInterval`) runs only while 2+ members are connected and stops when idle so the object can sleep.

### 4.2 Repo layout
```
multiplayer/
  protocol/        pure TS, no imports outside this folder; used by client, worker, dev relay, tests
    types.ts       message tuples, enums, constants (the contract in §4.4)
    codes.ts       party code alphabet, generate(rand), normalize(input), isValid
    names.ts       reviewed colour + animal word lists, nameFor(idx)
    validate.ts    parseClient(raw) / parseServer(raw): JSON -> typed tuple or null, size caps
    limits.ts      token buckets, clampPose(), WORLD_BOUNDS, rate constants
    index.ts       re-exports
  relay/           Cloudflare Worker (own tsconfig, excluded from the Next build; no deps installed in Phase 0)
    wrangler.toml, tsconfig.json, src/index.ts (HTTP + upgrade routing, origin check, IP-hash rate limits),
    src/partyRoom.ts (Durable Object shell), src/roomCore.ts (pure room logic, no Cloudflare APIs), src/cf.d.ts (type shims)
  dev-relay/       local Node server for tests: node:http + a minimal RFC 6455 text-frame codec (no `ws` dependency)
    server.mjs, wsLite.mjs, loadTs.cjs (TS loader like tests/*.cjs)
  bots/            bot.mjs: N scripted clients (Node 20 `--experimental-websocket` client or wsLite) walking paths
lib/multiplayer/   game client (config, connection, store, interp, look, invite, townBridge)
lib/graphics/remoteAvatars.ts   remote rig pool
components/party/  PartyHost, PartyInvite, JoinParty, PartyChip, EmoteWheel, party.module.css
```

### 4.3 Connecting, flags and auth
- **Flag:** `NEXT_PUBLIC_MULTIPLAYER=1` enables everything; default **off** (nothing rendered, no code path runs, bundle
  pieces lazy-loaded). **Relay URL:** `NEXT_PUBLIC_MULTIPLAYER_URL` (e.g. `http://localhost:8787` for the dev relay,
  `https://party.futbolisland.app` later). `ws(s)://` is derived from it.
- **Endpoints (same on worker and dev relay):**
  - `POST /party` -> `201 {code, hostKey, expiresAt}`; `429` rate-limited.
  - `GET /party/:code` -> `200 {open:boolean, size:number, full:boolean}` or `404` (cheap pre-check for the Join card).
  - `GET /party/:code/ws` (Upgrade) -> WebSocket into the party's Durable Object.
- **Auth model (no accounts, no identifiers):** the code admits a joiner; `hostKey` (16 random bytes, base64url) proves the
  host; each member gets a `resumeToken` in Welcome to resume within 60 s. Tokens are random, short-lived, held in
  `sessionStorage` only, never shown to peers, never logged. **No install id, save code or hash of either is sent** (stricter than
  the brief's "install-id hash": not needed for ephemeral parties; revisit in Phase 4).
- **Origin check:** worker accepts `https://futbolisland.app`, the project's Vercel preview origins, and `http://localhost:*`
  in dev; others get `403`.
- **IP use:** rate limits only, as `HMAC(dailySalt, ip)` in memory (the leaderboard/`ipBucket` precedent); IPs never stored or logged.

### 4.4 Protocol (the contract; Task A implements exactly this)
JSON arrays, first element an opcode. Numbers only, except opaque tokens (regex-checked, never relayed to other members).
Positions in **decimetres as integers**; yaw in 0-255; speed in 0.25 m/s steps.

**Implementation note:** the `enum` / `const enum` below are written for readability. Implement each as a frozen
`as const` object plus a union type (e.g. `export const Mode = {Walk:0,...} as const; export type Mode = typeof Mode[keyof typeof Mode]`),
because the repo's tests load files with `ts.transpileModule` and `isolatedModules` is on (cross-file const enums break).
The numeric values are the contract and must not change.

```ts
export const PROTOCOL_VERSION = 1;
export const PARTY_MAX = 6;
export const CODE_ALPHABET = '23456789BCDFGHJKMNPQRSTVWXYZ';
export const CODE_LENGTH = 6;
export const CODE_TTL_MS = 2 * 60 * 60 * 1000;      // new joins
export const PARTY_MAX_MS = 4 * 60 * 60 * 1000;     // session hard cap
export const RESUME_GRACE_MS = 60_000;
export const HOST_GRACE_MS = 30_000;
export const EMPTY_CLOSE_MS = 120_000;
export const MAX_INBOUND_BYTES = 512;
export const LOOK_LEN = 12;                          // look indexes, each 0..63

export enum Zone { Main = 0, Cay = 1, Summit = 2, Sea = 3, Indoors = 4 }
export enum Mode { Walk = 0, Run = 1, Scooter = 2, Bike = 3, Moped = 4, Jetpack = 5, Parachute = 6,
  Zipline = 7, Swim = 8, Dive = 9, AnimalRide = 10, Fishing = 11, Busy = 12, Idle = 13 }
export enum Emote { Wave = 0, Cheer = 1, HighFive = 2, PassToMe = 3, Space = 4, WellPlayed = 5 }
export enum PingKind { MeetHere = 0, FollowMe = 1 }
export enum LeaveReason { Left = 0, Timeout = 1, Kicked = 2, Indoors = 3 }
export enum EndReason { HostEnded = 0, Expired = 1, Empty = 2 }
export enum ErrorCode { BadMessage = 0, RateLimited = 1, Full = 2, NotFound = 3, Expired = 4, Locked = 5,
  NotHost = 6, BadVersion = 7, Kicked = 8 }
export const enum PoseFlag { Warp = 1, Hidden = 2 }  // Warp: teleport (fade, skip speed check); Hidden: in a menu/away

export type Look = number[];                         // length LOOK_LEN, ints 0..63
export type MemberId = number;                       // 0..15, server-assigned slot
export type NameIdx = [colour: number, animal: number];
/** Pose body: [x_dm, y_dm, z_dm, yaw256, speedQ, mode, zone, flags] */
export type PoseBody = [number, number, number, number, number, Mode, Zone, number];
export type MemberInfo = [id: MemberId, name: NameIdx, look: Look, isHost: 0 | 1, pose: PoseBody | null];

// client -> server
export const enum C { Hello = 0, Pose = 1, Emote = 2, Ping = 3, Kick = 4, Lock = 5, Rotate = 6, End = 7, Leave = 8, Beat = 9 }
export type CHello  = [C.Hello, v: number, look: Look, resumeToken: string | null, hostKey: string | null];
export type CPose   = [C.Pose, seq: number, ...body: PoseBody];
export type CEmote  = [C.Emote, emote: Emote];
export type CPing   = [C.Ping, kind: PingKind, x_dm: number, z_dm: number];
export type CKick   = [C.Kick, target: MemberId];                // host only
export type CLock   = [C.Lock, locked: 0 | 1];                   // host only
export type CRotate = [C.Rotate];                                // host only: new code
export type CEnd    = [C.End];                                   // host only
export type CLeave  = [C.Leave];
export type CBeat   = [C.Beat, t: number];
export type ClientMsg = CHello | CPose | CEmote | CPing | CKick | CLock | CRotate | CEnd | CLeave | CBeat;

// server -> client
export const enum S { Welcome = 20, Joined = 21, Left = 22, Poses = 23, Emote = 24, Ping = 25, Host = 26,
  Code = 27, Ended = 28, Error = 29, Beat = 30 }
export type SWelcome = [S.Welcome, v: number, you: MemberId, resumeToken: string, codeExpiresAt: number,
  partyEndsAt: number, locked: 0 | 1, members: MemberInfo[]];
export type SJoined  = [S.Joined, member: MemberInfo];
export type SLeft    = [S.Left, id: MemberId, reason: LeaveReason];
/** Batched at 5 Hz: flat list of [id, ...PoseBody] for members whose pose changed since the last tick. */
export type SPoses   = [S.Poses, tick: number, ...flat: number[]];
export type SEmote   = [S.Emote, id: MemberId, emote: Emote];
export type SPing    = [S.Ping, id: MemberId, kind: PingKind, x_dm: number, z_dm: number];
export type SHost    = [S.Host, id: MemberId];
export type SCode    = [S.Code, code: string, codeExpiresAt: number];  // sent to host only (after Rotate)
export type SEnded   = [S.Ended, reason: EndReason];
export type SError   = [S.Error, code: ErrorCode];
export type SBeat    = [S.Beat, t: number];
export type ServerMsg = SWelcome | SJoined | SLeft | SPoses | SEmote | SPing | SHost | SCode | SEnded | SError | SBeat;

// pure functions (protocol/index.ts exports)
export function generateCode(rand: (n: number) => Uint8Array): string;
export function normalizeCode(input: string): string | null;   // 'k7m-q4r ' -> 'K7MQ4R'; invalid -> null
export function formatCode(code: string): string;              // 'K7M-Q4R'
export function parseClient(raw: string): ClientMsg | null;    // size cap, shape, ranges, integer checks
export function parseServer(raw: string): ServerMsg | null;
export function encode(msg: ClientMsg | ServerMsg): string;    // JSON.stringify, asserts size
export function clampPose(body: PoseBody): PoseBody | null;    // null if outside WORLD_BOUNDS / bad enums
export function speedOk(prev: PoseBody, next: PoseBody, dtMs: number): boolean; // maxSpeed[mode]*1.5*dt + 2 m; Warp bypass max 1 per 5 s (caller tracks)
export function nameFor(idx: NameIdx): string;                 // 'Red Zebra'
export function pickName(taken: NameIdx[], rand: () => number): NameIdx;   // = pickNameWith(taken, rand, null)
export function pickNameWith(taken: NameIdx[], rand: () => number, animalWanted?: number | null): NameIdx; // free colour first (COLOUR_ORDER), then the wished animal if valid, else random
export const COLOUR_ORDER: readonly number[]; export const PICKER_ANIMALS: readonly number[]; export function validAnimal(n: unknown): n is number;
// Hello = [C.Hello, v, look, resumeToken, hostKey, animal?]: the trailing animal (0..31 or null) is optional; the old 5-element Hello still parses; PROTOCOL_VERSION unchanged (1).
export class TokenBucket { constructor(perSec: number, burst: number); take(nowMs: number): boolean }
export const RATE: { pose: [8, 12]; emote: [0.5, 2]; ping: [0.33, 2]; control: [1, 3]; closeAbovePerSec: 30;
  emotePerMin: 10 };
export const WORLD_BOUNDS: { minX: -4000; maxX: 10000; minZ: -6000; maxZ: 6000; minY: -400; maxY: 2000 }; // dm; must contain main, Cay (612,-160), Summit (640,130) + flight margins
export const MAX_SPEED_MS: Record<Mode, number>;  // walk 3.7*1.7 sprint, scooter 14, bike 20, moped 28, jetpack 34, swim 3, others 6
```
**Sizes:** a pose up ~40 B; a batched `Poses` with 5 friends ~200 B. At 5 Hz: **~0.2 KB/s up, ~1 KB/s down**, ~3.6 MB/h with
TLS overhead (state it in the grown-ups copy). Target < 2 KB/s each way: met.

**Update rates:** moving -> pose at 5 Hz, only if moved > 0.15 m or yaw > 8 deg; mode/zone/emote changes immediately; idle ->
at most 1 Hz and only on change, `Beat` every 5 s; nothing while the loop sleeps or the tab is hidden. Server batches poses at
5 Hz per party (only dirty members). **Client interpolation:** render 250 ms in the past (5 Hz needs > 200 ms; the brief's
150 ms would underrun), Hermite between snapshots in a 4-slot ring (no allocation), extrapolate at most 250 ms then ease to a
stop; a Warp flag or a > 25 m jump fades out/in.

### 4.5 Server authority (roomCore)
- Validate every inbound frame with `parseClient`; > 512 bytes or bad shape -> drop + count; 5 bad frames -> close.
- Clamp/reject poses (`clampPose`, `speedOk`); token buckets per socket (`RATE`); > 30 msg/s -> close.
- Assign member ids, names (unique in the party) and host; strings from clients are never relayed (only tokens are accepted,
  and only checked against server-held values).
- Enforce `PARTY_MAX`, lock, code TTL, party max age, host-only controls, kick (the kicked socket closes; its resume token is
  revoked).
- Host migration after `HOST_GRACE_MS`; end after `EMPTY_CLOSE_MS` empty; DO storage holds only `{codeHash?, createdAt,
  codeExpiresAt, locked}` (the code itself is the object name); nothing about members is written to storage.

### 4.6 Scaling, cost, observability, failures, security
- **Scale:** one DO per party, at most 6 sockets, ~30 in-msgs/s per busy party: far under DO limits. Unknown-code lookups cost one
  DO request each, bounded by the join-failure limit.
- **Cost:** 19 Oct model (incoming billed 20:1, outgoing free). Parties of 3 average: ~$6/mo at 100 concurrent, ~$60 at 1k.
  $5 Workers Paid minimum; set a $20 billing alert.
- **Observability (counts only):** parties created, joins, rejects by `ErrorCode`, party size histogram, session length bucket,
  reconnects. Via Workers Analytics Engine or log lines with no code, token or IP. The game side sends aggregate analytics events
  only (§5.6).
- **Failures:** socket drop -> backoff 1, 2, 4, 8, 15 s (+/-30 % jitter), resume within 60 s keeps the same id/name; after
  ~2 min the chip offers "Rejoin"; DO eviction -> clients resume into a fresh object that has lost members, server answers
  `Welcome` with an empty roster and members re-Hello (graceful); relay down -> Join card "Can't reach friends right now".
- **Security:** origin allow-list, IP-hash rate limits, size caps, no PII, no string relay, `hostKey`/`resumeToken` compared in
  constant time, codes from CSPRNG, TLS only in production, no CORS wildcard.

### 4.7 Heat budget
- Remotes are `createPlayer` rigs with the bean skin, all in **one `playerBatch`** (`lib/graphics/playerBatch.ts:34`), with the
  `islandNpcs.ts` fixes (release hidden classic geometry, freeze matrices, far posing at 10 Hz beyond 20 m, 5 Hz beyond 60 m,
  not drawn beyond 160 m). **No shadow-map casting.** Registered with the view gate (`viewGate.addUnitRoots`, `Town.tsx:736`).
- Measured analogue (research doc §1.2): ~0.11-0.13 ms CPU per extra character at 4x throttle, ~1 draw. 5 remotes ~ +0.6 ms,
  +5 colour draws max, + up to 5 label sprites.
- Caps at admission by `effectiveTier()` (`lib/graphics/heatTier.ts:95`): 5/5/3/1/0-new; Battery saver 0. Network messages never
  wake the sleeping loop and never count as input (research doc §1.3 rule).
- Validate before Phase 1 ships: two-context browser check + the 19 Oct §7.3 two-iPhone heat run (owner).

### 4.8 Testing strategy
| Layer | Test | Phase |
|---|---|---|
| Protocol | `tests/mp-protocol.cjs`: codes (alphabet, no vowels, normalize, blocklist), parse/encode round trips, every bad shape rejected, clamps, speed, buckets, names unique, no string fields relayed | 0 |
| Room logic | `tests/mp-room-core.cjs`: join/full/lock/kick/rotate/end, host migration, resume, TTLs with a fake clock, rate closes | 0 |
| Relay integration | `scripts/mp-relay-smoke.mjs`: dev relay on its own port + 6 bots, all see each other, 7th gets Full, cheat bot rejected | 0 |
| Client | `tests/mp-client.cjs`: mock socket, reconnect/backoff, throttle, interpolation, store events | 0 |
| UI + wiring | `tests/mp-ui.cjs` (source checks like `calm-hud.cjs`: flag gating, gate before create/join, >= 44 px, icon-only), `tests/mp-avatars.cjs` (caps by tier at admission, no shadow roots, dispose order) | 0 |
| Isolation | `tests/mp-isolation.cjs`: `lib/multiplayer/**`, `components/party/**`, `multiplayer/**` never import `lib/saves`, `lib/analytics`, `deviceMarks` or read `fi2-install-v1`/`fi2-save-code-v1` | 0 |
| Browser | two Playwright contexts on the dev relay see each other walk | 1 |
| Load | 500 bots on the dev relay (one machine, staggered from other agents' servers), then staging worker | 1 |
| Device | two iPhones heat run (19 Oct §7.3) | 1 (owner) |

---

## 5. Client architecture in the game

### 5.1 Modules
| File | Responsibility | Public API (contract) |
|---|---|---|
| `lib/multiplayer/config.ts` | flag + URL | `multiplayerEnabled(): boolean`, `relayHttpUrl(): string \| null`, `relayWsUrl(code): string \| null` |
| `lib/multiplayer/connection.ts` | socket, Hello, resume, backoff, hidden-tab close, heartbeat | see `PartyConnection` below |
| `lib/multiplayer/store.ts` | party state for React (subscribe/snapshot, changes only on membership/emote/ping, never per frame) | `partyStore` |
| `lib/multiplayer/interp.ts` | snapshot ring + Hermite + extrapolation cap | `createInterp()` |
| `lib/multiplayer/look.ts` | `CharacterCustomization` <-> `Look` (indexes into `CUSTOMIZATION_OPTIONS`, unknown -> default) | `lookToWire(c)`, `wireToLook(l)` |
| `lib/multiplayer/invite.ts` | create party, check code, link, share, QR data URL | `createParty()`, `checkParty(code)`, `partyLink(code)`, `sharePartyLink(code)`, `partyQr(code)` |
| `lib/multiplayer/townBridge.ts` | the only thing Town calls | `createPartyRuntime(ctx)` |
| `lib/graphics/remoteAvatars.ts` | rig pool in one batch, labels, emote poses, caps | `createRemoteAvatars(scene, opts)` |

```ts
// lib/multiplayer/connection.ts
export type PartyStatus = 'idle' | 'connecting' | 'live' | 'reconnecting' | 'ended' | 'error';
export interface PartyConnection {
  join(code: string, opts: { look: Look; hostKey?: string }): void;   // opens socket, sends Hello
  sendPose(body: PoseBody, nowMs: number): void;                      // applies 5 Hz/1 Hz throttle + delta suppression
  sendEmote(e: Emote): boolean;                                       // false if locally rate-limited
  sendPing(kind: PingKind, x: number, z: number): boolean;            // metres in, dm on wire
  host: { kick(id: MemberId): void; lock(on: boolean): void; rotate(): void; end(): void };
  leave(): void;
  onMessage(fn: (m: ServerMsg) => void): () => void;
  readonly status: PartyStatus;
  dispose(): void;
}
export function createPartyConnection(deps?: { WebSocketImpl?: typeof WebSocket; now?: () => number;
  random?: () => number; setTimeout?: typeof setTimeout; clearTimeout?: typeof clearTimeout;
  visibility?: { hidden(): boolean; on(fn: () => void): () => void } }): PartyConnection;

// lib/multiplayer/store.ts
export type Member = { id: MemberId; name: string; look: Look; isHost: boolean; zone: Zone; away: boolean };
export type PartyState = { status: PartyStatus; code: string | null; codeExpiresAt: number; you: MemberId | null;
  isHost: boolean; locked: boolean; members: Member[]; lastEmote: { id: MemberId; emote: Emote; at: number } | null;
  pings: { id: MemberId; kind: PingKind; x: number; z: number; until: number }[]; error: ErrorCode | null };
export const partyStore: { get(): PartyState; subscribe(fn: () => void): () => void;
  apply(m: ServerMsg, nowMs: number): void; reset(): void };
export function usePartyState(): PartyState;  // useSyncExternalStore

// lib/multiplayer/interp.ts
export interface Interp { push(id: MemberId, body: PoseBody, recvMs: number): void;
  sample(id: MemberId, renderMs: number, out: RemotePose): boolean; drop(id: MemberId): void }
export type RemotePose = { x: number; y: number; z: number; yaw: number; speed: number; mode: Mode; zone: Zone;
  fade: number /* 0..1 for warp/arrival */ };
export function createInterp(opts?: { delayMs?: 250; extrapolateMs?: 250 }): Interp;

// lib/multiplayer/townBridge.ts
export type LocalPoseSource = () => { x: number; y: number; z: number; facing: number; speed: number; mode: Mode;
  zone: Zone; warp: boolean; hidden: boolean };
export interface PartyRuntime { update(dt: number, nowMs: number, camera: THREE.Camera): void; dispose(): void }
export function createPartyRuntime(ctx: { scene: THREE.Scene; viewGate: { addUnitRoots(r: THREE.Object3D[]): void };
  local: LocalPoseSource; phone: boolean; reducedMotion: () => boolean }): PartyRuntime | null; // null when flag off

// lib/graphics/remoteAvatars.ts
export interface RemoteAvatars { readonly root: THREE.Object3D;
  upsert(id: MemberId, look: Look, name: string): void; remove(id: MemberId): void;
  emote(id: MemberId, e: Emote): void;
  update(dt: number, poses: Map<MemberId, RemotePose>, camera: THREE.Camera, reduced: boolean): void;
  readonly shown: number; dispose(): void }
export function createRemoteAvatars(scene: THREE.Scene, opts: { phone: boolean; maxFor: (tier: HeatTier, phone: boolean) => number }): RemoteAvatars;
export function remoteCap(tier: HeatTier, phone: boolean, saver: boolean): number; // 5/5/3/1/0 phone, 5 desktop, 0 saver
```

### 5.2 Town.tsx hook (minimal; one glue owner)
- **Init** (after `viewGate` is created, `Town.tsx:736`): `const party=createPartyRuntime({scene,viewGate,local:()=>(...),phone:quality.phone,reducedMotion:()=>reduced});`
- **Update** (next to `islandNpcs.update`, `Town.tsx:1491`): `party?.update(active?dt:0,performance.now(),camera);`
- **Dispose** (cleanup, `Town.tsx:1746`): `party?.dispose();` placed **before** `scene`/renderer teardown and after the
  existing order that `tests/dive-edge.cjs` and `tests/explore-v2.cjs` check (run both).
- Remotes are **not** added to `shadowVisibility`/`npcShadows`. `PartyHost` (React) mounts once in Town's JSX behind the flag.
- `local` is assembled from values Town already has (`location`, facing, `rideRef.current`, velocity, the zone from
  `onCayLand`/summit checks, `loopSleeping`/menus -> `hidden`). No new loop, timer or `requestAnimationFrame`.

### 5.3 HUD (calm-HUD rules, `docs/ui/HUD_STACK.md`)
- **PartyChip:** fixed corner (top-left under Paths on phones, beside the minimap on desktop), icon-only (stacked faces + count),
  >= 44 px, not in `.hud-stack`; hidden when not in a party.
- **Play with friends** button: icon-only in the existing action grid style; aria-label "Play with friends".
- **Emote wheel:** one button in the action cluster while in a party -> row of 6 big picture buttons; closes on pick.
- **Messages** ("Red Zebra joined", "Party ends in 10 min", "Reconnecting") go through `lib/ui/toastLane.ts` at note priority
  (1); join bursts merge ("2 friends joined"). Never more than one message on screen.
- Invite/Join cards are dialogs (like the job card), dismissible, Esc on desktop.

### 5.4 Parent gate and Settings
- Gate before **create** and before **join** (link or code), via `parentGatePassed()` + `<ParentGate reason=...>`
  (`lib/parentGate.ts:38`, the `DonationLinks.tsx:19-21` pattern).
- Settings (`components/IslandSettings.tsx`): **Play with friends: Allowed / Off**, changing it needs the gate; stored on the
  device (`fi2-multiplayer-allowed-v1`, synced with the save is fine: it is a preference, not an identifier).

### 5.5 Privacy page and grown-ups copy (DRAFT: needs the owner's legal review)
> **DRAFT, not live.** Ship only with the flag on, after review. Adds to the privacy page (`app/privacy/page.tsx`) Players
> section (today: "no names or contact details") and §12 services.

**Players: playing with friends (DRAFT).** "A child can invite friends to play on the same island at the same time, or join a
friend, after a grown-up answers the grown-up check. They share a 6-character party code, a link or a QR code; the code stops
accepting new players after 2 hours. While playing together, the other players in that party see the child's character and its
outfit colours, where it moves on the island and which preset waves or cheers it taps. Each player gets a name made of a colour chosen by the game and an animal picked from a fixed list of icons, like
'Red Zebra', that changes every party. Players pick an animal icon from a fixed list; names are a colour and an animal chosen by the game and the child, never typed. There is no chat, no typing, no voice and no photos, and players cannot give or trade
anything. We do not ask for or keep names, contact details or friend lists. Our relay (Cloudflare) passes these live positions
between the players in the party and keeps nothing after the party ends; it uses the device's internet address only for a few
minutes to stop misuse, and does not store it. A grown-up can turn 'Play with friends' off in Settings."

**§12 services (DRAFT):** "Cloudflare relays live character positions between friends in a party while they play and keeps
nothing after the party ends."

**Grown-ups card (`AboutGrownUps.tsx`, DRAFT):** "No ads, no chat, no names or contact details. Playing with friends uses a
temporary code, needs the grown-up check, and can be turned off in Settings. It uses about 4 MB of data an hour."

### 5.6 Analytics

**Status (22 Oct 2026):** event ids `mp_party_created`, `mp_party_joined`, `mp_party_ended`, `mp_join_failed` are defined in the Phase 0 contract; wiring through the existing tracker is pending the flag rollout.
Aggregate events only, no party code, member id or token: `mp_party_created`, `mp_party_joined` (size bucket 2/3-4/5-6),
`mp_party_ended` (duration bucket), `mp_join_failed` (reason). They ride the existing visit/session pipeline (daily-rotating
visitor hash, `lib/analytics/ingest.ts:17`); `lib/multiplayer/**` must not import analytics directly: `PartyHost` calls the
existing tracker with these ids.

### 5.7 COPPA / GDPR-K engineering notes (engineering notes, not legal advice)
- **Personal information under COPPA** includes persistent identifiers, and any free text/voice/photo that lets a child disclose
  information. v1 has no free text, no voice, no chosen names, no photos, no real-world location (island coordinates are not
  geolocation), and only short-lived random tokens. The relay's IP use is for network communication and abuse prevention, the
  "support for internal operations" exception; the amended rule (final 2025) requires the online notice to name those internal
  operations and how identifiers are kept to them ([Hunton summary](https://www.hunton.com/privacy-and-cybersecurity-law-blog/ftc-publishes-final-coppa-rule-amendments),
  [Perkins Coie](https://perkinscoie.com/insights/update/ftc-announces-new-childrens-privacy-requirements-updated-coppa-rule)).
- **Verifiable parental consent triggers to avoid in v1:** chat, user-chosen names, persistent friend lists, contact import,
  photos/voice, sharing with third parties. Phase 4 persistent friends likely needs VPC or a careful parent-mediated design: book counsel.
- **ICO Children's Code / GDPR Art. 8:** high privacy by default (feature needs a grown-up step), transparency at the point of use
  (the invite card says what friends see), data minimisation (nothing stored), a short DPIA before launch.
- **Ephemeral by design:** codes expire, rooms forget members, no position history, no logs with identifiers.

---

## 6. Phased roadmap
Agent-day = 2-3 short build agents + 1 verify agent under the token rules. Model per task saves tokens: **Opus** only for design,
security review and hard sync; **Sonnet** for implementation; **Haiku** for docs/tests/cleanup at low effort.

| Phase | Scope | Done when | Agent-days | Models |
|---|---|---|---|---|
| **0 (overnight, no deploy)** | protocol; dev relay + worker code (not deployed); client modules; invite/join UI; remote avatars wired behind the flag; tests; docs | All Phase 0 tests green, `build:quiet` passes, flag off = zero behaviour change, 6-bot smoke passes on the dev relay | **4-5** | A-E Sonnet, F Haiku; one Opus review pass (0.25) |
| **1 (needs owner)** | Cloudflare account + `wrangler deploy` to `party.futbolisland.app` (or workers.dev); env vars on Vercel preview; two real devices in a party; reconnect hardening; 500-bot load test; two-context browser check; iPhone heat run | Two phones play together on a preview deploy; heat run passes; privacy copy reviewed | 2-3 | Sonnet; Opus for the heat + security review; Haiku for screenshots/load runs |
| **2** | emote animations polish, pings + follow arrow, map pins + "Go to friend", party chip polish, heat caps validated, hide/mute, costumes on remotes, merged ride proxies | Kid-tested with 3 devices; calm-HUD screenshots phone + desktop | 3-4 | Sonnet; Opus for ride proxies |
| **3** | shared kickabout ball (room-owned ball state, host-authoritative physics, teaches passing), party jobs (co-op bonus from own wallet rules), Explore together (same reef, own finds), shared bugs via UTC-phased clocks | Two friends pass a ball smoothly at 150 ms RTT | 6-9 | **Opus** for ball sync; Sonnet for jobs/Explore |
| **4** | parent-approved persistent friends (friend codes stored as hashes, parent dashboard, VPC review) | Counsel sign-off | 4-6 + legal | Opus design/security, Sonnet build |

---

## 7. Decisions needed from the owner
1. **Hosting:** Cloudflare Workers + Durable Objects ($5/mo Workers Paid, $20 alert, account on khoa0aohk@gmail.com). *Recommend yes.*
2. **Party size cap:** *6* (host + 5).
3. **Parent gate for joiners too** (not only hosts): *yes*, every create and join (10-min pass).
4. **Code expiry:** *2 h* for new joins, 4 h party max, host can rotate.
5. **Names:** server-assigned unique colour + kid-picked animal icon from a fixed list (no typing) per party ("Red Zebra"), no stable names in v1: *yes*.
6. **Default setting:** "Play with friends" *allowed* (each use is gated), lockable off by a grown-up. (Alternative: off until a grown-up turns it on.)
7. **Identity:** *no identifier at all in v1* (stricter than an install-id hash); revisit for Phase 4.
8. **Privacy/legal:** have the §5.5 draft and COPPA notes reviewed by counsel before the flag goes on in production; short DPIA.
9. **Domain:** `party.futbolisland.app` on Cloudflare (or start on `*.workers.dev`): *start on workers.dev*.
10. **Analytics:** aggregate `mp_*` events only (§5.6): *yes*.
11. **Wire format:** JSON v1, binary only for public rooms later: *yes*.

---

## 8. Risks
| # | Risk | Mitigation |
|---|---|---|
| 1 | iPhone heat/battery (extra rigs + socket keeps radio awake) | One batch, no shadows, caps at admission, send only on change, close socket when hidden, owner's two-iPhone run gates Phase 1 |
| 2 | Child safety: a code leaks to a stranger | 2 h expiry, cap 6, gate on join, host Remove/Lock/New code, no text/voice, nothing to take or change |
| 3 | Legal: notice/consent wording wrong | Draft marked for review, nothing ships until counsel + DPIA; no identifiers collected |
| 4 | `Town.tsx` merge conflicts with other lanes | One glue task owns the 4 Town edits, lands last; flag off by default |
| 5 | Desync looks bad (jitter, popping) | 250 ms buffer, Hermite, extrapolation cap, fades on warp/arrival; tune in Phase 1 on real networks |
| 6 | Friends can't find each other (different zones) | Spawn at host zone, map pins, Follow me arrow, Go to friend |
| 7 | Owner setup blocks Phase 1 | Phase 0 runs fully on the local dev relay; deploy is a short checklist |
| 8 | Cost spike from abuse (code guessing, socket floods) | IP-hash limits, failure lockout, size/rate caps, billing alert |
| 9 | Kids expect to play games together, v1 is "walk together" | Emotes + pings make it social; Phase 3 kickabout is the next visible step |

Sources (checked 21 Oct 2026): links inline above, plus `docs/multiplayer-plan-2026-10-19.md` sources for pricing.
