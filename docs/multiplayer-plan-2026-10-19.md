# Multiplayer plan: "see other kids walking around" (19 Oct 2026)

Written 19 Oct 2026. Research only: no source file was changed. This doc **extends** `docs/multiplayer-research.md` (16 Oct, "the research doc" below). It does not repeat that doc's survey, wire table, per-state drawing table, COPPA/ICO notes, privacy-copy draft or T2/T3 appendix. Read those there. This doc turns them into a plan you can decide on and build.

User request (19 Oct 2026): "figure out how we can make this multiplayer". The scope is still the 16 Oct one: "walking around the island, not playing games, just walking around".

Line numbers are from the working tree on 19 Oct and may move.

---

## 0. What changes from the 16 Oct doc

| Topic | 16 Oct doc | This plan | Why |
| --- | --- | --- | --- |
| P0 transport | Supabase together codes, then Cloudflare | **Cloudflare Durable Objects from day one.** Supabase is only a fallback. | Saves the adapter work (≈ 1 agent-day). Gives binary frames, ids the server assigns and server sanity checks from the first test. Supabase hits its rate caps at ≈ 170 kids (§1). |
| Room size | 12 per instance | **Hard cap 24. Fill target 16.** | The user asked for shards of 20–30. Area of interest (§2.3) keeps what each phone receives small. 24 leaves room for friends to join a busy room. |
| Remote shadows | Cast through the instanced depth path | **No shadow-map casting.** At most one instanced blob decal (1 draw) for all remotes, or none. | It adds nothing to the depth pass. A tier change still never changes what is drawn (§3). |
| Visible cap | 8/8/6/4/3 on phones, 16 on desktop | **8/8/6/4/0 on phones, 12 on desktop**, applied **at admission only** | The user suggested 12/8/4/0. The `heatTier.ts:16` "no flashing" rule still applies, so "0" means "admit no new ones" (§3.2). |
| Identity | Session-random id only. Saves and analytics are never imported. | **Save code HMAC → `presenceKey`, kept inside the signed ticket and on the server only.** Peers still see only a slot number and a made-up name. | It lets a block or a report outlast a reload. It allows rate limits per kid, not only per IP. It is the base for P3 friends (§5). |
| Phase order | P0 proto, P1 public, P2 fidelity, P3 launch | **P0 proof, P1 shards + heat caps, P2 emotes + safety UI, P3 friends/private rooms.** Ride fidelity and launch are separate lanes (§6). | The user's own phase list. |

Everything else in the research doc still holds: §4.1 areas (main / cay / summit), §4.5 state table, §4.7 sleep rules, §4.9 reconnection, §5 safety rules, §5.4 isolation tests, §6 validation, §7 emotes that teach.

---

## A. Shared island vs separate island (decide this first)

### A.1 The three models

| Model | Heat | Cost | Kid safety | Save-code consistency | Verdict |
| --- | --- | --- | --- | --- | --- |
| **(a) One shared, persistent island.** The server owns the world: the finds, the jobs, the stalls, the NPCs. | Worst. Every phone must draw every kid and every world change, and a crowd can't be capped without someone vanishing. | Highest. The server simulates the world 24/7, and every pickup is a server round trip. | Worst. Kids can steal, race, block and camp, and griefing becomes possible. | **Breaks it.** The world state would fight each kid's own save (the `fi2-*-v1` stores are per player and synced by save code). Progress would need server authority and anti-cheat. | **No** |
| **(b) Per-room instances of the same island, "ghost presence".** Shards of 16–24. Every kid runs their own island exactly as today. Others are drawn on top. | Bounded. A capped number of ghosts (§3), no world sync, no collision. | Lowest. Only position frames go through the server (§1). | Best. There is no contact surface: nobody can take, block or change anything of yours. | **Untouched.** Each save stays the only authority for its own progress. Nothing about the world goes over the wire. | **Yes, recommended** |
| **(c) A separate, dedicated multiplayer island or hub** (a plaza with no jobs or finds) | Good: a small scene built for crowds, so it could hold more remotes | Same relay, plus building a new map (≈ 5–8 agent-days of art and world) | Good (a small, designed space) | Untouched | **Not now.** Kids want to see each other where they already play. A hub splits the player base and the content. Keep it as a later option for T3 games, such as a "match lobby" pier. |

**Recommendation: (b).** It is the same island the kid already knows, in per-room instances. **Everything gameplay stays private to each player and local.** Other kids are visible ghosts: they don't collide with you and never touch your pickups, jobs, catches, seats or coins.
- Doors can't be blocked, because ghosts have no collision.
- A spot can't be crowded. The personal-space offset (§5.2) and Hide deal with a kid who hangs around.
- A catch can't be stolen, because catches never leave the device.

### A.2 System by system (under model (b))

| System | Today (source) | Under (b) | What another kid sees |
| --- | --- | --- | --- |
| Hidden balls and coins (the ball hunt) | Fixed spots, progress per player in `fi2-matchday-coins-v1` (`lib/town/coinQuest.ts:4`) | **Private.** Each kid has their own set. A ball you found never vanishes for anyone else. There is no racing and no stealing. | You only, in a `busy` or walk pose |
| Beachcombing finds | The day's finds per local day, `takenToday` in `fi2-beachcomb-v1` (`lib/graphics/beachFinds.ts:115-157`) | **Private.** The same spots for everyone on that day, each kid's own pickups. | The ghost bends down (a pose); the shell does not disappear for you |
| Summit fruit and the Community Garden | `fi2-summit-forage-v1`, garden regrow timers (`lib/town/jobs/garden.ts`) | **Private** | A shaking or picking pose only |
| Island jobs and stalls (Harvest day, Wall rebounds, Flag the offside, deliveries…) | Props built only while *your* job runs (`lib/town/jobs/jobScene.ts`), ledger `fi2-island-jobs-v1` | **Private, one copy per kid.** Two kids can do the same job at the same sign at the same time. Neither "takes" it. | `busy` (idle pose with a soft ring). Job props are never drawn for remotes. |
| Fishing spots and catches | Per-player sessions, `Math.random` fights (`lib/town/fishing/fishingCore.ts:232`), the log is per player | **Private.** A spot never runs out, and a catch never leaves the device. | The standing-cast pose, no line, no fish |
| Holding animals (the manta, the whale shark), sea life | Clocks per page (research doc §4.5) | **Visible only:** the hold pose at the sent position. The animal is not drawn for remotes. | A ghost in the hold pose |
| Zipline, ferry, rides | Zipline `t` along the cable (`lib/town/zipline.ts`). The ferry is a fixed deck (`lib/town/ferryBoarding.ts`). Your own vehicle. | **Private ride, visible.** Two kids can zip at the same time. The ferry deck holds anyone. Remotes ride proxies with no physics. **No shared seats in T1.** | The ghost on the cable or deck, or in its ride pose |
| Ball Cannon (Summit) | One seat, `seated` is local (`lib/graphics/ballCannon.ts:114`) | **Private.** You can sit even if a ghost "is" seated. The ghost is drawn beside the seat in `busy`, so the two never overlap. | `busy` next to the cannon |
| Coaches board, lessons, quizzes | DOM, per player (`components/CoachesBoard.tsx`) | **Private.** Remotes never enter your lesson. | `busy` |
| Arcade, Konbini, Museum, Shop | Separate pages (`location.assign`) | **They leave presence.** The bean fades at the door. | Nothing while inside |
| Costumes and outfits | Per save | **Visible only:** the look indexes on join (research doc decision 6 for costumes). They are never giftable. | The ghost's own look |
| Day, sunset, night | **Each player's own setting** (`fi2-time-of-day`, `lib/town/fishing/timeOfDay.ts`). The weather was removed on 15 Oct. | **Private.** Each kid sees ghosts under their own lighting. Nothing to sync. | — |
| Daily requests and quests | Per local day. `hash01` already gives every device the same requests that day (`timeOfDay.ts`). | **Private,** but the same content for everyone, so kids can talk about it at school | — |
| Economy and coins, the market basket, cards | Per save: `fi2-arcade-wallet-v1`, `fi2-market-v1`, `fi2-vending-v1` | **Private, and never shared, given or traded.** Any trading or gifting later needs its own safety and economy design (decision D11). | Nothing |
| NPC townsfolk and cars | Same cast and routes everywhere, but advanced by frame time from page load (`lib/town/npcBehavior.ts:5-9`), so each device's NPCs are elsewhere | **Local, per device.** A ghost may walk "through" a townsperson on your screen, which is fine for ghosts. Later option: UTC-phased loops, so traffic and sea life agree between phones (research doc decision 9). | — |
| Swimming and the new clear water | `lib/graphics/swimClear.ts` (19 Oct): a clear disc only around *your* swimmer | **Visible only.** A remote swimmer is drawn in the swim pose. **No clear disc for remotes** (that would be another blended pass), so a remote's legs stay hidden under the opaque sea, like a townsperson. | The head and shoulders at the surface |

### A.3 State rules
- **The server owns:** for ambient walking (P0–P2), **nothing about the world.** It owns only room membership, the slot numbers, the latest position frame for each slot, and the block and report lists (§4).
- **Client-only, cosmetic:** how a ghost is drawn, its pose, its made-up name, local Hide, and all of your own world (finds, jobs, NPCs, lighting).
- **Needs to be the same on every phone:** only "where each kid is, what mode they are in, what they look like". There are no world objects to reconcile, so there are no conflicts, no rollback and no "who got it first".
- **Anti-griefing comes from the model itself:** no collision, no shared objects, no seats that lock, no trading, plus the §5.2 sanity checks, the personal-space offset, Hide and Report.
- **A path to light interaction later**, each step opt-in and parent-friendly:
  1. waves and emotes (P2);
  2. **"high-five":** two kids emote at each other within 3 m and both get a confetti pop. It is cosmetic, with no coins.
  3. **shared seats** on the ferry, the cannon bench and the ride passenger seat, for friends rooms only. The room keeps a short seat lock (≈ 0.5 agent-day for each kind of seat).
  4. **a co-op job bonus:** two friends at the same job sign within 10 m each get +1 coin from **their own** wallets' rules, with a daily cap. Nothing is transferred.
  5. T2 ghost runs and T3 shared-ball games on the same room objects (research doc §9). That is the first time the server would own any world state (the ball).

---

## 1. Transport: comparison and pick

### 1.1 Traffic model used for every row
- A kid sends **5 Hz while moving** (moving ≈ 60 % of the time), so 3 frames/s, plus a heartbeat every 5 s while still.
- The server sends **one batched frame per 200 ms** to each kid, holding every remote in their area of interest.
- **Load:**
  - "C concurrent" is the monthly peak. The average is 20 % of the peak.
  - So kid-hours per month = **144 × C**: 14,400 at C=100, 144,000 at C=1k, 1.44 M at C=10k.
  - Rooms average 16 kids.
- **Fan-out:** the options that can't batch (Supabase, Ably without batching, Liveblocks) are modelled at **3 Hz and a 12-kid room**, to be fair to them.
- Prices checked 16–19 Oct 2026 (sources at the end). These are estimates. Check them against the first month's real bill.

### 1.2 The options

| Option | Billing unit | Per kid-hour | C = 100 | C = 1,000 | C = 10,000 | Limits that would bite |
| --- | --- | --- | --- | --- | --- | --- |
| **Cloudflare Durable Objects** (own Worker, or `partyserver` = PartyKit's library) | GB-s while a room is awake + incoming messages at 20:1. **Outgoing messages are free.** | ≈ $0.0004 | **≈ $6** ($5 minimum) | **≈ $63** | **≈ $635** | An object is single-threaded, with a soft limit of ≈ 1,000 requests/s. A 24-kid room is ≈ 72 in + 120 out per second. The lobby must not take per-frame traffic. |
| **PartyKit (managed)** | Now Cloudflare | same as DO | same | same | same | Use `partyserver` on your own Cloudflare account. Don't add another vendor. |
| **Supabase Realtime** (already in `lib/relayClient.ts`) | 1 + N messages per broadcast, $2.50/M | ≈ $0.13 | ≈ $1,850 (cap off) | ≈ $18,700, and over the 2,500 msg/s cap | needs an Enterprise contract (≈ $187k at list price) | 2,500 msg/s on Pro or Team, about **170 kids**. Presence: 10 keys per object. Clients can't batch. The sender names itself (it can spoof). JSON payloads. |
| **Ably** (Pub/Sub with server-side batching at 200 ms) | Each publish + each batch delivered, $2.50/M (down to $0.50/M at volume) | ≈ $0.07 | ≈ $1,070 | ≈ $10k (≈ $2–5k with volume discount) | ≈ $21–104k | Standard: 2,500 msg/s, 10k connections. Pro ($399): 10k msg/s. No server code: no area of interest, no sanity checks, no ids the server assigns. |
| **Liveblocks** | $0.002 per user-minute in a shared room | $0.12 | ≈ $1,730 | ≈ $17k | ≈ $173k | **10 connections per room on Pro** (50 on Team). **3,000 anonymous connections per month** on Free, Pro and Team. It is built for documents, not 5 Hz movement. Not a fit. |
| **Vercel WebSockets** (Fluid compute, public beta) | Active CPU + provisioned memory while sockets are open + data transfer, plus Redis pub/sub across instances | ≈ $0.002–0.02 (mostly Redis, unmeasured) | ≈ $40–80 | ≈ $300–3,000 | ≈ $3k–30k | Still **beta** (docs 10 Aug 2026). A socket closes at the function's max duration (300 s Hobby, 800 s Pro), so every kid reconnects every ≤ 13 min. Rooms must live in Redis. A reconnect can land on another instance. |

How the main rows were worked out:
- **DO:**
  - room-hours = kid-hours / 16;
  - a room-hour = 460.8 GB-s at $12.50 per M (after 400k included);
  - plus 540 billed requests per kid-hour at $0.15 per M;
  - plus the $5 minimum.
  - At 10k that is 41.5 M GB-s ≈ $513, plus 778 M requests ≈ $117.
- **Ably with batching:** (3 in + 5 batches out) × 3,600 = 28.8k messages per kid-hour.
- **Supabase:** 1.8 sends/s × (1 + 7) = 14.4 messages/s → 51.8k per kid-hour, as in the research doc §3.2.

### 1.3 Pick
**Cloudflare Durable Objects. Write it as a plain Worker with one `IslandRoom` class and one `Lobby` class, and borrow `partyserver` only if it saves code.**
- It is the only option where the fan-out (the expensive part) is free.
- It is the only one where our own code runs next to the room, so the server can assign ids, filter by area of interest, batch, check sanity, rate-limit and act on reports.
- It costs about 1/30 of Ably, the next cheapest. Unlike Vercel, sockets don't drop every 13 minutes.
- The same room object can later run a server tick for T3 (research doc §9).
- **Fallback if the user doesn't want a Cloudflare account:** Ably with batching for P0–P1, behind the same `Transport` interface. It works, but it is ≈ $1k/month at 100 kids, with no server-side safety.

---

## 2. Netcode for walking only

### 2.1 What to sync
- **Every frame (while moving):** `x, y, z`, `yaw`, `speed` (it drives the gait), `mode` (walk, run, scooter, bike, moped, jetpack, parachute, zipline, wade, swim, float, fishing, busy), `sub` (ride skin, zipline t or swim stroke), `emote` + serial.
- **Once per join** (and sent to anyone who joins later): look indexes from `CharacterCustomization`, i.e. build, skin, hair, hat, kit colours and shirt number (≈ 12 bytes). Costumes follow decision 6 in the research doc.
- **Never synced:** balls, games, lessons, matches, knockout, cannon (all shown as `busy`), coins, wallet, inventory, shop, the fishing catch, NPC state, the vehicles' own physics, the score, the level, the save code, the analytics id, any string.
- **Remotes are ghosts.** They don't collide with you and have no effect on your world.

### 2.2 Packets (binary, little-endian)

**Upstream (client → room), 12 bytes:**

| Byte | Field | Encoding |
| --- | --- | --- |
| 0 | `type` | 1 = state |
| 1–2 | `seq` | uint16 |
| 3–4, 5–6, 7–8 | `x`, `y`, `z` | int16, decimetres (±3,276 m covers the 2,100 × 1,700 m map) |
| 9 | `yaw` | uint8, 256 steps |
| 10 | `speed` | uint8, 0.25 m/s steps (up to 63 m/s) |
| 11 | `mode` + `emote` | high nibble = mode, low 3 bits = emote, 1 bit = emote serial toggle |

`sub` goes in an optional 13th byte, only when `mode` uses it.

**Downstream (room → client), one frame per 200 ms:**
- **Header, 4 bytes:** type, room tick (uint16), count.
- **Then 12 bytes per remote:** the slot number (uint8, assigned by the room, 0–23), then the 11 state bytes.
- **Size:** a full 24-kid room with 23 remotes in your area of interest is 4 + 23 × 12 = **280 bytes**.
- **Bandwidth:** 280 B × 5/s = **1.4 KB/s**, ≈ 2 KB/s with WebSocket, TLS and TCP overhead, so **≈ 7 MB per hour on mobile data.** State this on the opt-in card, or in the help, for parents on capped plans. Upstream ≈ 0.3 KB/s.

**Control frames:**
- `join` (slot + look);
- `leave` (slot + reason: door / gone);
- `emote` (slot + id, sent at once);
- `roster` (all slots + looks, on join).

None of them has a string field. `tests/presence-wire.cjs` enforces that.

### 2.3 Interest management
- **Shards:**
  - The room id is `isl:v2:<area>:<n>`.
  - The `Lobby` puts a joiner in **the fullest room below 16** in their area, so the island feels lived-in, and opens a new room when every room is at 16.
  - Rooms accept up to 24 for friends and rejoins only.
  - Areas and the 30 m hysteresis band follow research doc §4.1.
  - The lobby only gets a room-count update every 10 s (600 rooms at 10k kids → 60/s, well under the object limit).
- **Area of interest, computed per receiver in the room:**

| Distance | What is sent |
| --- | --- |
| ≤ 90 m | every 200 ms |
| 90–180 m | every 1 s |
| > 180 m | not sent |

  - That is ≈ 20 grid cells of 30 m per area, rebuilt once per tick, O(N) per room.
  - The 180 m limit matches the existing "> 160 m not drawn" rule plus a margin to fade in.

### 2.4 Interpolation and send rules
- **Send** only when the position changes by > 0.15 m or the yaw by > 8°. Mode and emote changes go at once. A heartbeat every 5 s while still. **Nothing at all while the loop sleeps or the tab is hidden** (research doc §4.7).
- **Render 300 ms in the past.** Use Hermite interpolation between two snapshots from a fixed 4-slot ring with no allocation. Extrapolate at most 250 ms, then ease to a stop.
- **Jumps:** a jump of > 25 m (rooftop warp, respawn, door return) is faded out and back in with `characterArrival.ts`.
- **Silence:** a remote that sends nothing for 8 s fades out.
- **Latency is irrelevant for walking.** Smoothness is what counts. 5 Hz with 300 ms of buffer looks continuous at walking speed (3.7 m/s, `lib/town/travelModes.ts:4`).

---

## 3. Rendering remotes at the cost of a townsperson (or less)

### 3.1 The path
- **New `lib/graphics/remotePlayers.ts`:**
  - a pool of `createPlayer` rigs with the bean skin, all in **one `playerBatch(remoteScene, 32)`** (`lib/graphics/playerBatch.ts:34`);
  - the bean skin draws every bean with four shared meshes, and the per-instance look and pose live in one data-texture row (`lib/graphics/beanSkin.ts:9-26`);
  - so **all remotes together cost ≤ 5 colour draws** (body, limbs, plus one per hair or hat style in view).
- **Copy the townsfolk heat fixes from `lib/graphics/islandNpcs.ts:19-46` exactly:**
  - release the hidden classic geometry (≈ 0.37 MB per rig) and detach the classic-only parts (`releaseHiddenClassic`, `detachClassic`), because a remote's look only changes on join;
  - freeze those matrices;
  - **far posing:** beyond `FAR_POSE = 20` m, solve the pose at `POSE_HZ = 10` on the shared phase-locked clock (`islandNpcs.ts:46`). For remotes, also drop to 5 Hz beyond 60 m.
- **Register with the view gate** next to `islandNpcs.root` (`components/Town.tsx:690`). Off-screen remotes are not posed. Their snapshots are still interpolated (≈ 2 µs).
- **No shadows:** remotes are **not** added to `shadowVisibility` or `npcShadows` (`Town.tsx:688`). Optionally, one instanced soft blob under all remotes (1 draw, never in the depth pass).
- **LOD:**

| Distance | Pose rate |
| --- | --- |
| ≤ 20 m | full |
| 20–60 m | 10 Hz |
| 60–160 m | 5 Hz |
| > 160 m | not drawn (fixed distance, the same on every tier, faded in and out) |

  - No geometry LOD: the bean is already ≈ 5–6k triangles, and the batch keeps the draw count flat.
- **Rides:** merged proxies (research doc §4.4, `remoteRides.ts`) in a later fidelity lane. In P0–P2 a remote on a ride is drawn in its ride pose with no vehicle.
- **Labels:** a made-up name on the closest remote only (the `npcTagFocus` pattern).
- **Taps:** one squared-distance pass on tap. No raycast and no hover.

### 3.2 Visible caps by heat tier (applied at admission only)

| Effective tier (`heatTier.ts`) | Phone / tablet | Desktop |
| --- | --- | --- |
| 0 cool | 8 | 12 |
| 1 warm | 8 | 12 |
| 2 hot | 6 | 12 |
| 3 hotter | 4 | 12 (desktop is never governed) |
| 4 hottest (governor) | **0 new**. Already-shown remotes stay. | — |
| Battery saver (the user's own switch) | **0**: remotes fade out over 1 s. Sending stays on at 2 Hz, so others still see you. | 0 |

- **Why "0 new" and not "hide":**
  - `heatTier.ts:16` says no tier may change what is drawn per frame (the deploy-4 flashing hotfix).
  - A governor drop must never make kids vanish.
  - Battery saver is a deliberate tap by the kid, so a fade there is fine.
- **Who gets a slot:** the nearest remotes. If a shown remote stays out of view for > 30 s, its slot can go to a nearer one, with a fade.
- **Budget, from the research doc §4.6, minus the shadow cost:**
  - 8 remotes on foot ≈ ≤ 5 colour draws, 0 depth draws, ≈ 45k triangles and ≈ 0.7 ms CPU per frame at 4× slowdown;
  - about the "north-beach townsfolk" change, judged acceptable;
  - to be **measured**, not assumed (§7).

---

## 4. Kid safety and moderation

The research doc §5 has the full rules. Here is what the plan builds, and when.

- **No chat, no typed text, anywhere.** The wire has no string type (§2.2). There are 6 preset emotes that teach football (research doc §7):
  - the client sends at most 1 per 2 s;
  - the room drops more than 10 per minute;
  - the "Pass to me!" and "Space!" emotes teach the habit that T3 will use.
- **Names nobody types:**
  - **Public rooms:** a colour + animal name ("Teal Puffin", 24 × 48, from a reviewed list). The receiver derives it from `hash(roomId, slot, sessionNonce)`, so it changes every visit and nobody can make one up.
  - **Recommendation: no stable save-code nickname in public rooms.** A name that stays the same every visit would let a stranger recognise and look for the same child every day.
  - **Friends rooms (P3) only:** a stable name derived from `presenceKey` (decision D4).
- **Hide, block and report:**
  - Tap a remote for **Hide** (this session), **Hide everyone**, and **Report** with picture reasons.
  - **Block lasts across reloads:** the room keeps, for 24 h, a list of `presenceKey` pairs (blocker → blocked) and never puts those two kids in the same room again. The list stays in the room and lobby storage only, never on a device.
  - **Reports:** 2 reports from different kids within 10 minutes send the reported kid to a room of their own for 24 h, without telling them, and turn off their emotes.
  - `/admin` sees daily counts only, never ids.
- **Data minimisation (COPPA-style):**
  - **Peers receive only:** slot (0–23), look indexes, position, mode and emote.
  - **The room holds in memory:** slot ↔ `presenceKey` (opaque 16 bytes) for the life of the room. The block and report lists are kept 24 h.
  - **Nothing is logged with an IP.** Rate limits use a day-salted IP hash (`lib/saves/server.ts:40`, `ipBucket`).
  - **No position history** is stored anywhere.
- **Must never be sent to peers or the room:**
  - the save code;
  - `codeHash`;
  - the analytics player id or install id (`fi2-*` keys);
  - the IP;
  - any free text;
  - device info;
  - the precise time a kid joined, shown to others.
  - `tests/presence-isolation.cjs` (research doc §5.4) enforces this. One exception: the ticket route imports `lib/saves/server.ts` on the server only, to compute `codeHash`.
- **Friends only vs public:**
  - **Recommendation: launch with friends/private rooms (P3) before public rooms.** Run a short beta with real families first.
  - Public rooms are opt-in with an equal "Not now" (ICO standard 7). A grown-up can lock presence off, or set it to "friends only", behind the existing `ParentGate` (`lib/parentGate.ts`).
- **Parents:**
  - the privacy and grown-ups copy (research doc §5.6);
  - the data-use line (≈ 7 MB/h);
  - a DPIA and a **[LAWYER]** review before public rooms. Friends-only rooms with parent-added codes are the lower-risk first launch.

---

## 5. Identity and anti-cheat

### 5.1 Join ticket (`POST /api/presence/ticket`, a Next route on Vercel)
- **Body:** `{area, roomHint?, saveCode?, friendRoom?}`.
- **Steps:**
  1. If a save code is given, compute `codeHash = HMAC(SAVE_CODE_PEPPER, "v1:"+normal)` (`lib/saves/server.ts:36`).
  2. Check the save exists (the existing `check` path).
  3. Derive `presenceKey = HMAC(PRESENCE_KEY_SECRET, "p:"+codeHash)[0..16]`.
  4. A kid without a save code gets a random `presenceKey` (one session only). They can see others, but can't be blocked across sessions, so they get stricter emote limits.
- **Ticket:** `base64url(payload).HMAC(PRESENCE_TICKET_SECRET)`.
  - The payload is `{v:2, pk, scope: area | friendRoomId, exp: now + 120 s, nonce, flags: {friendsOnly, parentLocked}}`.
  - It has no codeHash and no IP.
- **The room checks the ticket** with Web Crypto HMAC, refuses an expired one, and keeps each nonce for 2 minutes, so a ticket can be used once.
- **Rate limits on the route:** 30 tickets per minute per IP bucket and 10 per minute per `presenceKey`.

### 5.2 Server-side sanity (in `IslandRoom`, pure functions in `relay/roomLogic.ts` so Node tests can cover them)
- **Speed:** reject a frame whose movement since the last accepted frame is more than `maxSpeed[mode] × 1.5 × dt + 2 m`.
  - `maxSpeed` comes from `lib/town/travelModes.ts:4-8`: walk 3.7 (sprint 6), scooter 14, bike 20, moped 28, jetpack 34.
  - The client sends a `warp` flag for a rooftop jump, a respawn or a door return. The room allows at most 1 warp per 5 s.
- **Bounds:** clamp to `FLIGHT_BOUNDS` (`lib/town/simulation.ts:16`) and a y range of −5 to 120 m. A frame outside is dropped.
- **Values:** the mode and emote enums, the look indexes and the bytes are all range-checked. A bad look becomes the default bean.
- **Rates:**

| Traffic | Limit |
| --- | --- |
| State frames | ≤ 8/s per socket. Extras are dropped. Above 30/s the socket is closed. |
| Emotes | 1 per 2 s and 10 per minute |
| Rejoins | 6 per minute per `presenceKey` |
| Reports | 5 per hour per reporter |

- **Personal space:** a remote that stays within 1.5 m of the same kid for more than 20 s is shown offset on that kid's screen (research doc §5.1 rule 8). The room also counts it as a soft report signal.
- **The worst a cheater can do is grief** (stand in faces, spam emotes). It can't steal or change anyone's data, because nothing else is synced.

---

## 6. Phases, effort and cost

An "agent-day" means about 2–3 short build agents plus 1 fresh verify agent, under the token rules: each agent stays under ≈ 300k tokens, with grep and line ranges and quiet scripts. **≈ 0.8–1.2 M tokens per agent-day**, mostly cache reads.
- **Opus** for the relay, netcode and remote rendering.
- **Sonnet** for the HUD, the UI, tests and copy.
- **Haiku at low effort** for screenshot and test runs.

**Calendar time:** one developer reviews and runs the iPhone tests, so ≈ 1 agent-day ≈ 0.5–1 calendar day.

| Phase | Scope | Done when | Agent-days | Tokens (est.) |
| --- | --- | --- | --- | --- |
| **P0 proof** | Pure modules `lib/presence/wire.ts` + `interp.ts`; a `relay/` Worker with `IslandRoom` (one room, no lobby, dev ticket); `relayTransport.ts`; `fakeTransport.ts` (`?ghosts=N`); `remotePlayers.ts` (batch, townsfolk heat fixes, no shadows, walk / run / idle / swim poses); `presenceRuntime.step()` called from the Town frame; a dev-only `?presence=1` flag; Node tests `presence-wire`, `presence-interp`, `heat-presence` | **Two browsers (two Playwright contexts) see each other walk, run and swim smoothly.** Draws are within budget. The loop still sleeps under Settings with a remote moving. | **3–4** | ≈ 3–5 M |
| **P1 shards + heat caps** | `Lobby` (fill to 16, cap 24), areas and hysteresis, area-of-interest tiers, the ticket route and `presenceKey`, server sanity and rate limits, reconnect and resume, tier caps at admission, Battery saver fade, the far-pose LOD, the `presence-load.mjs` load test, the "who's around" HUD chip, the opt-in card and Settings toggle | 1,000 bots across ≈ 60 rooms on staging, with no frame-time regression in the A/B at 4×. The two-iPhone heat run is done (§7.3). | **5–6** | ≈ 5–7 M |
| **P2 emotes + safety UI** | The 6 emotes with their football lines, the made-up name list (reviewed), the remote card (Hide / Hide everyone / Report), block and report handling in the room, the personal-space offset, `/admin` aggregates, the ParentGate lock | A kid can wave and hide, and a reported bot is moved to its own room, in the two-context browser check | **3–4** | ≈ 3–5 M |
| **P3 friends / private rooms** | A friends room `fr:<id>` (max 6, unlisted); joining with a picture code (research doc §4.8 together codes); optional parent-added friend codes stored only as a hash on the device; a stable friends-only nickname (if D4 = yes); the "friends only" parental setting | Two siblings on two iPhones join the same friends room from a picture code. Public rooms can be turned off globally with one env flag. | **3–5** | ≈ 3–6 M |
| Fidelity lane (any time after P1) | Ride proxies, zipline, fishing, busy, door exits (research doc §4.4–4.5) | — | 3–4 | ≈ 3–5 M |
| Launch lane (before public rooms) | Privacy and grown-ups copy, the **[LAWYER]** review and DPIA, the dated performance-guide entry | — | 2–3 | ≈ 1–2 M |
| **Total** | | | **19–26** | **≈ 18–30 M** |

- **Lanes:** new files only, as in the research doc §8.
- **One glue lane owns every `components/Town.tsx` edit**, a single line at around `Town.tsx:687-690`, next to the townsfolk wiring, and lands last in each phase.
- Every agent uses its own port and `NEXT_DIST_DIR`, runs `wrangler dev` on its own port, kills by PID or port, and never touches 8092 or `.next-dev`.

### 6.1 Infra the user does (once)
1. **A Cloudflare account under khoa0aohk@gmail.com.** Subscribe to Workers Paid ($5/month) and set a $20 billing alert.
2. **`npx wrangler login`.** The secrets are `PRESENCE_TICKET_SECRET` and `PRESENCE_KEY_SECRET`, at 32+ characters each, set in both Vercel and Cloudflare.
3. **Vercel env:** `NEXT_PUBLIC_PRESENCE_URL`, plus the two secrets. P0 can use the `*.workers.dev` URL. A custom domain is optional.

### 6.2 Risks

| # | Risk | Mitigation |
| --- | --- | --- |
| 1 | **iPhone heat and battery:** 8 more beans and a socket that keeps the cellular radio awake | Caps at admission, no shadows, far-pose LOD, send only while moving, Battery saver = 0 remotes. **The iPhone run (§7.3) blocks P1 from shipping.** |
| 2 | **Child safety and legal:** strangers griefing (following, crowding, emote spam), or a privacy page that is out of date | No text, made-up names, block and report that act on the server, personal-space offset, opt-in, a parental lock. Launch with friends rooms first, and get the lawyer and DPIA done before public rooms. |
| 3 | **An empty island:** low numbers spread across rooms, so each kid sees nobody, and the feature feels broken | Fill to 16 before opening a new room. Show the "who's around" count for the whole area. Consider "ghost runs" of recorded walks (research doc §9, T2) to fill quiet hours, labelled as recordings. |
| 4 | `Town.tsx` merge conflicts with other lanes (water and swim work is happening now) | One glue lane, one call site, lands last |
| 5 | DO costs climb if rooms never sleep, or the lobby becomes a hot spot | Rooms hibernate when they have 0 sockets. The lobby gets counts only every 10 s. A budget alert. |
| 6 | Mobile data: ≈ 7 MB/h | Say so on the opt-in card. Battery saver also drops receiving to 2 Hz. |

---

## 7. Test plan

### 7.1 Automated (Node, the `heat-tiers.cjs` style)
- `presence-wire` (sizes 12 / 4 + 12n, ranges, no strings);
- `presence-interp` (Hermite, extrapolation cap, warp fade, no allocations in `step`);
- `relay-room` (fill and cap, area-of-interest tiers, speed, bounds and rate rejections, warp limit, report → own room, block pairs);
- `presence-ticket` (expiry, one use, no codeHash in the payload);
- `presence-isolation` (the import graph, a fuzz test that a planted save code or install id never shows in the bytes);
- `heat-presence` (no new `requestAnimationFrame`, `setInterval`, render target or AudioContext; remotes not in the shadow roots; caps only at admission).

### 7.2 Browser and load
- **`scripts/check-presence-browser.cjs`:** two Playwright contexts, 390×844, DPR 2, 4× CPU. Each sees the other. Read `renderer.info` and `renderStats`. Check the loop still sleeps.
- **A/B heat audit** (`docs/performance-guide.md` method): ghosts 0, 4 and 8 at spawn, Island Square and Coral Cay. The danger line is busy ≤ 50 % and a frame median ≤ 37.3 ms.
- **`scripts/presence-load.mjs`** (Node + `ws`, run against a **staging** Worker, never production):
  - It gets N tickets from a dev-only ticket endpoint protected by `LOAD_TEST_SECRET`.
  - Each bot walks a recorded island path at 5 Hz (60 % moving), with random emotes inside the limits.
  - It measures:
    - fan-out delay (the room tick time-stamped against the bot's receive time, p50 and p95);
    - dropped and rejected frames;
    - the batch size per receiver;
    - room count and fill;
    - CPU per object from `wrangler tail` or Cloudflare analytics;
    - the cost from the analytics GraphQL usage.
  - **Steps:**
    - 24 bots in 1 room at 5 Hz, then 10 Hz (the per-object ceiling);
    - 100 bots, then 1,000, then 3,000 across rooms for 15 minutes each;
    - a cheat set (speed hacks, out-of-bounds, emote flood), which must all be rejected.
  - **Pass:** p95 delay < 250 ms, 0 bad frames relayed, cost within ±50 % of §1.2.
  - The script runs from one machine. Above ≈ 3k bots, split it across 2–3 machines or a Fly machine. It is 16 GB-Mac aware, so it is not run beside other agents' servers.

### 7.3 iPhone heat test (the user must run this; emulation proves nothing about cooling)
- **Setup:** two iPhones on the same staging room (P0: dev URL; P1: friends room code). Not charging. Similar start temperature. Brightness fixed. Same 5-minute beach route.
- **Runs on phone A:**

| Run | What phone A does |
| --- | --- |
| a | presence off |
| b | presence on with phone B walking nearby |
| c | presence on with `?ghosts=8` |
| d | the run-c setup for 20 minutes, once on Wi-Fi and once on cellular |

- **For each run, record:**
  - battery % before and after;
  - whether the phone gets warm to the touch (a yes/no by hand);
  - the heat tier the governor reached (the debug readout);
  - one Safari Web Inspector timeline on phone A.
- Add the results to the dated log in `docs/performance-guide.md`.
- **Pass:** run c doesn't step the governor down earlier than run a, and run d drains ≤ 2 % more battery per 20 minutes than run a.

---

## 8. Decisions the user must make

| # | Decision | Recommended |
| --- | --- | --- |
| D0 | **World model:** (b) the same island in per-room instances, ghosts only, all gameplay private (§A). Or (c) a separate hub. | **(b)** |
| D1 | **Transport:** Cloudflare Durable Objects from P0 (needs a new Cloudflare account under khoa0aohk@gmail.com, $5/month), or Ably (no new server code, ≈ $1k/month at 100 kids, no server-side safety) | **Cloudflare** |
| D2 | **Launch order:** friends/private rooms first, then public rooms after a family beta and the lawyer review? Or public first? | **Friends first** (P3 ships before public rooms go live; P1 public stays behind a flag) |
| D3 | **Opt-in:** an opt-in card with equal "Yes / Not now", plus a Settings toggle and a grown-up lock | **Yes, opt-in** |
| D4 | **Names:** a made-up colour + animal every visit in public rooms. In friends rooms, a stable save-code nickname? | **Session names in public. Stable names in friends rooms only.** |
| D5 | **Phone caps:** 8 / 8 / 6 / 4 / 0-new, with Battery saver = none drawn. Or the user's 12 / 8 / 4 / 0. | **8 / 8 / 6 / 4 / 0-new** until the iPhone run; raise to 12 at tier 0 if it passes |
| D6 | **Room size:** fill to 16, hard cap 24 (or 20 / 30) | **16 / 24** |
| D7 | **Save-code key on the server** (in the ticket only, for blocks, reports and rate limits). Kids without a save code join with limits. | **Yes** |
| D8 | **Persistence:** keep block and report lists for 24 h (or for the session only) | **24 h** |
| D9 | **The data-use line** on the opt-in card ("uses about 7 MB an hour on mobile data") | **Yes** |
| D10 | **Booking the [LAWYER] review and DPIA** before public rooms. Friends rooms can go first. | **Book it during P1** |
| D11 | **No trading or gifting of coins, items or cards, ever, in T1.** Any later design needs its own safety review. | **Yes** |

---

Sources (checked 16–19 Oct 2026):
- [Cloudflare Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [Supabase Realtime limits](https://supabase.com/docs/guides/realtime/limits)
- [Supabase Realtime message billing](https://supabase.com/docs/guides/platform/manage-your-usage/realtime-messages)
- [Ably pricing](https://ably.com/pricing)
- [Ably message batching](https://ably.com/docs/messages/batch)
- [Liveblocks pricing](https://liveblocks.io/pricing)
- [Vercel Functions WebSockets](https://vercel.com/docs/functions/websockets)
