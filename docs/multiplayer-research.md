# Multiplayer presence: other kids walking around the island (research and design)

Written 16 Oct 2026. This is research and design only. No source file was changed. The only commit is this doc, on the branch `multiplayer-research` (never `main`). Line numbers are from `main` at `04de1f7c` and may move.

User request (16 Oct 2026, verbatim):

> "research how multi player can work"

User clarification the same day (verbatim):

> "walking around the island. not playing games, just walking around"

So this doc is a **buildable design for Tier 1 presence only**: other kids show up as bean avatars walking, riding, flying and swimming around the main island, the causeway, Coral Cay and Summit Isle. They can tap preset emotes. There is no chat, no shared ball, no matches and no trading. Tiers 2 and 3 (ghost races, playing together) get a one-page appendix (§9), so that the Tier 1 choices don't block them.

Constraints every proposal below was checked against:
- **AGENTS.md:** every feature teaches football. Mobile heat is a primary requirement. Prefer bounded work, shared assets and sleeping content. Avoid background polling. Never claim iPhone cooling from desktop emulation.
- **`docs/performance-guide.md`:** the thermal tiers, the governor, the view gate, the townsfolk shadow batch, the idle-ride 20 fps rule, and the deploy-4 rule in `lib/graphics/heatTier.ts:16`: "No tier may change what is drawn per frame … no distance hiding".
- **`docs/accounts-design.md`:** a kids' game (7v7 age and up, many under 13). No names, no email, no free text. The save code is the only key, and it is stored only as a keyed hash.
- **Privacy page today** (`components/privacy/PrivacyPolicy.tsx:47-48`): "No accounts and no personal details" and "No ads, no chat with other players". `components/about/AboutGrownUps.tsx:17`: "No ads, no chat, no names or contact details."

### Corrections to this morning's first-cut answer

| First cut (16 Oct, morning) | Corrected by evidence |
| --- | --- |
| T1 presence ≈ 10–15 agent-days | **16–22 agent-days.** The extra time goes to a relay server for public rooms (§3), cheap ride proxies for remotes on scooters and bikes (an NPC scooter costs 12 colour + 12 depth draws, `performance-guide.md:2053`), and the safety layer (§5). The two-phone prototype on its own is **6–8**. |
| "Vercel functions can't hold sockets" | **Out of date.** Vercel Functions now serve WebSockets (public beta, all plans; docs updated 10 Aug 2026, checked 16 Oct 2026). Each socket still closes when the function hits its max duration (300 s on Hobby, 800 s on Pro), reconnects may land on another instance, and Vercel's own docs say rooms and presence must live in an external store such as Redis. So Vercel is still a poor home for a room relay, for different reasons (§3.4). |
| A dedicated realtime server is needed only for T3 | **It is needed for public T1 rooms too, on cost alone.** Supabase bills each broadcast as 1 + N messages, and its messages-per-second caps run out at about 170 concurrent kids (§3.2). Supabase is still the right tool for the prototype, and the project already uses it for the phone controller. |
| (not stated) | **The project already runs Supabase Realtime in production code:** `lib/relayClient.ts:1-29` (Broadcast + Presence, `eventsPerSecond: 40`) and `lib/usePhoneController.ts:37-76` (room channel `ctrl:<ROOM>`, presence key `host`). The privacy page's services list (`PrivacyPolicy.tsx:130`, "Supabase stores saves and visit counts") does not mention that relay. Fix that in the same privacy pass (§5.6). |

---

## 1. What the code gives us today (survey)

### 1.1 The rig and the look
- **One rig for everyone.** `createPlayer(id, team, …)` returns a `PlayerRig` (`lib/graphics/player.ts:307-336`) with `setBeanLook`, `setExpression`, `setProfile` and `update(x, z, dt, time, reduced, motion)`. The main player is made at `components/Town.tsx:503`, and the side-game locals at `Town.tsx:570`. A remote kid can be exactly this rig, driven by a `PlayerMotion` assembled from network state.
- **`PlayerMotion` (`player.ts:27-128`) already covers every T1 state.** It has `facing`, `runIntensity`, `travelMode` (walk, scooter, bike, moped, jetpack: `lib/town/travelModes.ts:1`), `flight`, `parachute`, `zipline`, `swim`, `rooftopPose`, `called` (hand up, calling for the ball), `jump`, `reaction` and `trick`. Remotes need **no new poses**. Emotes reuse `called`, the `celebrations.ts` poses and `setExpression` (`BEAN_EXPRESSIONS` includes `'calling'` and `'happy'`, `beanLook.ts:32`).
- **The look is already made of safe ids.** `CharacterCustomization` (`lib/town/customization.ts:10-15`) holds enum ids, and "Colour fields hold palette ids, not raw hex, so saves sanitise" (`customization.ts:14`). `beanLookFor` and `playerOutfit` (`customization.ts:113-124`) rebuild the look from those ids. So the wire can carry about 12 small integers (option indexes), never a string or a colour. The receiver rebuilds the look through the same functions, and an unknown index falls back to the default.
- **Costumes** (club mascots, `lib/town/costumes.ts`, `beanCostumes.ts`) add geometry. P0 shows a remote in its base bean and kit. Costumes come in P2, only if the costume's assets are already loaded (decision 6).

### 1.2 How characters are drawn, and what one more costs
- **Batched characters are cheap.** `playerBatch` (`lib/graphics/playerBatch.ts:5-9, 34`) consolidates visible rigs into instanced draws with per-instance data rows. Measured: "32 characters in one batch … classic 21 draws (colour + shadow), bean 5" (`performance-guide.md:1760`). It is already used by live fields (`lib/town/fieldRuntime.ts:49`), the coach wall, volleyball and the knockout (`liveKnockout.ts:26`).
- **Townsfolk are not batched.** The 149 islanders are individually rendered: "an individually rendered NPC is 4 draws" (`performance-guide.md:1761`). Their shadows share a few instanced depth draws (`npcShadowBatch.ts:4-10`). Batching them was tried and dropped because of picking, hover, labels and costumes (`performance-guide.md:1969, 2582`). **Remotes need none of that** (no conversation and no hover), so remotes can go straight into a `playerBatch`.
- **The best evidence for the cost per person is the townsfolk A/B** (`performance-guide.md:23-26`, Oct 13 heat audit, 4× CPU throttle, 390×844):
  - North beach, 1 → 10 townsfolk drawn: CPU 2.8 → 3.8 ms/frame, GPU 1.72 → 1.94 ms, draws 46 → 56, triangles 38k → 72k, busy 12.5 → 15.4 %.
  - Coral Cay, 10 → 17 drawn: CPU 3.6 → 4.5 ms/frame, draws 97 → 102.
  - **So one more visible character costs ≈ 0.11–0.13 ms CPU per frame at 4×, ≈ 0.025 ms GPU, ≈ 1 draw and ≈ 4–5k triangles.** That figure includes each NPC's routine stepping (NPC update 4.3 → 12.0 ms/s for the same 9 people, `performance-guide.md:50`), which a remote does not have.
- **Rides are the expensive part.** "Each NPC scooter is a full player vehicle, 12 colour + 12 depth draws, and each skateboard is 5 + 5" (`performance-guide.md:2053`; `lib/graphics/npcRide.ts:4-7` builds `createVehicle()`). Eight remotes on full scooters would add about 190 draws to a ~200-draw scene, so remote rides need merged proxies (§4.4).
- **Sleeping machinery to reuse:**
  - the view gate hides off-view units for one render, pixel-identically (`lib/graphics/viewGate.ts:3-14`, registered at `Town.tsx:687` with `addUnitRoots`);
  - off-screen townsfolk step at 10 Hz (`performance-guide.md:2251`);
  - offscreen posing is skipped (`resumePose`, `player.ts:48-49`);
  - only the closest townsperson's label is ever visible (`npcTagFocus.ts`, `performance-guide.md:2769`).

### 1.3 The island loop and heat tiers
- **Tiers in code are 0–4** (`lib/graphics/heatTier.ts:10-28`): 0 cool, 1 warm, 2 hot, 3 static ambience, 4 a 24 fps cap (also Battery saver). The table in `performance-guide.md:2447-2451` still lists four tiers with "NPCs beyond 40 m not drawn", which the deploy-4 hotfix removed (`heatTier.ts:16`). **The guide's table is stale.** This design follows the code: tiers never hide what is already drawn.
- **The loop sleeps** (0 frames) while the map or Settings is open, while a quiz is waiting and while the easel is still (`Town.tsx:1098-1108`). The **idle-ride rule** drops to 20 fps after 4 s without input on a ride or in the water (`lib/town/idleRide.ts:1-16`, `Town.tsx:1112-1113`). `renderStats` (`Town.tsx:725`) counts rendered, skipped and sleeping frames and the idle ride. **Rule: a network message never wakes the loop and never counts as input.**

### 1.4 Places, doors and rides
- **Areas:** the main island sits round the origin, Coral Cay at `CAY_CENTER {612, −160}` (`lib/town/coralCay.ts:32`), reached by `CAUSEWAY_PATH` from the coast near x ≈ 226 (`coralCay.ts:54-62`, `world.ts:1704`), and Summit Isle at `SUMMIT_CENTER {640, 130}` (`lib/town/summitIsle.ts:14`), about 290 m north of the Cay. The sea is everywhere in between.
- **The Arcade, Konbini, Museum and Shop are separate pages.** Town saves a departure, then calls `window.location.assign('/arcade')` (`Town.tsx:240, 243, 261, 265`). The page unload closes any socket, so a kid who goes inside **leaves presence**, as asked.
- **Rides and water:**
  - the zipline is a fixed cable (`lib/town/zipline.ts:82-114`, `cableAt(t)`), so a remote can send one number, `t`;
  - water phases are in `lib/town/water/waterState.ts` and the poses in `swimPose.ts`;
  - animal rides are `RideKind = 'manta' | 'whale'` (`lib/town/water/animalRides.ts:19-49`). The whale shark's clock is per page (`whaleShark.ts:122`, `state.clock += step`), so **two phones never agree where the whale shark is.** A remote on a whale shark is drawn holding on, in its swim pose at its own sent position, and no second animal is drawn (§4.5).

### 1.5 Identity, saves and analytics (what must never reach the channel)
- **Save codes** travel only in JSON bodies and are hashed at once with `HMAC-SHA256(SAVE_CODE_PEPPER, "v1:"+normal)` (`lib/saves/server.ts:6-7, 36`).
- **The analytics player id (Oct 16)** is `HMAC(salt, "c:"+codeHash)` or `HMAC(salt, "i:"+installId)`, made server-side from the `pc` / `pi` key a session start sends (`lib/analytics/playerId.ts:1-11`, `tracker.ts:58, 251`, `deviceMarks.ts:34`, keys `fi2-save-code-v1` and `fi2-install-v1`). Any of these on a realtime channel would give other children (and anyone listening) **a persistent identifier**. §5.4 makes that impossible by construction and tests it.
- **Precedents to copy:**
  - the leaderboard: a stateless HMAC play token, initials A–Z with a blocklist, a picture id from a fixed set, and per-IP caps on a day-salted IP hash, "never the IP" (`lib/arcade/leaderboardServer.ts:1-13`);
  - the grown-up gate: a sum question, a 10-minute pass and 3 tries (`lib/parentGate.ts:8-21`).

### 1.6 Platform facts (checked 16 Oct 2026)

| Service | Published limits and prices that matter here |
| --- | --- |
| **Supabase Realtime** ([limits](https://supabase.com/docs/guides/realtime/limits), [pricing](https://supabase.com/pricing), [message billing](https://supabase.com/docs/guides/platform/manage-your-usage/realtime-messages)) | Concurrent connections: Free 200, Pro 500 (spend cap on) or 10,000 (cap off), Team 10,000. Messages/s: 100 / 500 / 2,500 / 2,500. Presence messages/s: 20 / 50 / 1,000. Presence keys per object: 10. Presence calls per client per 30 s: 5. Channels per connection: 100. Included messages per month: Free 2 M, Pro 5 M; then **$2.50 per million**. Connections over the quota: $10 per 1,000 peak. Pro starts at $25/month. **Billing: "if you broadcast a message and 4 clients listen to it, it counts as 5 messages".** |
| **Cloudflare Durable Objects** ([pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)) | On Free and Paid. Paid includes 1 M requests/month, then $0.15 per million, and 400,000 GB-s/month, then $12.50 per million GB-s (128 MB per object). **Outgoing WebSocket messages are free. Incoming ones are billed 20:1.** Idle objects hibernate for free, but a room that receives positions every 200 ms stays awake. Workers Paid has a $5/month minimum. PartyKit is Cloudflare's own library on top of these (`partyserver`), so it costs the same. |
| **Fly.io** ([pricing](https://docs.fly.io/about/pricing)) | shared-cpu-1x: 256 MB $2.19, 512 MB $3.69, 1 GB $6.70 per month; performance-1x 2 GB $33. Outbound $0.02/GB in North America and Europe. Machines bill while running. |
| **Vercel Functions** ([WebSockets](https://vercel.com/docs/functions/websockets)) | WebSockets in public beta, Fluid compute. A socket closes at the function's max duration. "Store durable state, presence, counters, rooms, and pub/sub coordination in an external data store." Billed as function usage while the connection is active, plus data transfer. |

---

## 2. Design overview

**Decision (proposed): a presence layer behind one interface, with two transports.**
- **P0 prototype:** Supabase Realtime, reusing `relayClient()`. It needs no new account, and a two-phone test costs nothing on the free tier.
- **P1 public rooms:** a small relay on **Cloudflare Durable Objects**, one object per room. The client code above the interface does not change.

```
Town loop ──► presenceRuntime.step(dt)            (lib/presence/presenceRuntime.ts, no loop of its own)
               ├─ publish: local state → wire.encode → transport.send   (at most 5 Hz, only when changed)
               ├─ receive: transport.onFrame → snapshot ring per remote (no allocation, never wakes the loop)
               └─ remotes.update(now): interpolate → PlayerMotion → rig.update (in playerBatch)
transport: SupabaseTransport (P0) | RelayTransport (P1, Cloudflare DO "IslandRoom")
```

---

## 3. Transport (decision)

### 3.1 Traffic model (shared by all options)
- **Rooms:** at most 12 kids per room instance, with about 8 on average. Rooms are sharded by area (§4.1).
- **Send:** 5 Hz on the relay or 3 Hz on Supabase, **only while moving** (60 % of the time, assumed). A heartbeat every 5 s while still. Mode changes and emotes are sent at once.
- **Peak and average:** "C concurrent" means the monthly peak. The monthly average is assumed to be **20 % of the peak** (kids play afternoons and weekends). So C=50 means 7,200 kid-hours a month. Every number below is an estimate to check against the first month of real data.

### 3.2 Supabase Realtime (Broadcast + Presence)
- **Per kid:** 3 Hz × 0.6 = 1.8 sends/s. Each is billed 1 + 7 receivers = 8, so **14.4 billed messages per second ≈ 51,800 per kid-hour ≈ $0.13 per kid-hour.**
- **Rate caps:** at the peak, C × 14.4 msg/s. C=50 → 720 msg/s, above Pro with a spend cap (500), so the cap must be turned off (limit 2,500). C=500 → 7,200 msg/s, above Team (2,500), so it needs Enterprise. **The ceiling is ≈ 170 concurrent kids on Pro or Team.**
- **Cost per month:**

| Peak C | Messages/month | Supabase cost |
| --- | --- | --- |
| 50 | ≈ 373 M | ≈ **$945** (the $25 Pro plan + ≈ $920 of messages) |
| 500 | ≈ 3.7 B | ≈ **$9,300**, and over the rate cap |
| 5,000 | — | not possible without an Enterprise contract (≈ $93,000 at list price) |

- **Other weaknesses:**
  - Supabase can't batch or filter by distance: every position is a separate frame to every room member.
  - The sender names itself, so a modified client can claim another kid's session id. With private channels and RLS (Realtime Authorization) you can gate *joining*, but not the *content*.
- **Strengths:** it is already wired in (`relayClient.ts`), it runs no server, and it costs ≈ $0 for a few phones. Presence gives join and leave for free (and it is also how the phone controller sees its pair).
- **Verdict:** the right transport for the **P0 prototype** and for small private "together" rooms (§4.8). Too expensive and capped for public rooms.

### 3.3 Cloudflare Durable Objects relay ("IslandRoom", optionally via `partyserver`)
- **How it works:** one object per room instance.
  - It accepts the sockets and **assigns the session id itself** (8 random bytes, so it can't be spoofed).
  - It validates each frame against the schema and drops anything malformed.
  - It rate-limits emotes.
  - It **batches all remotes into one frame per 200 ms** per receiver, and only sends remotes within 160 m of that receiver (area of interest).
  - Outbound messages are free, so the fan-out costs nothing.
- **Cost:** a room-hour is 3,600 s × 0.128 GB = 460.8 GB-s. Per kid-hour that is 3 incoming/s × 3,600 / 20 = 540 billed requests.

| Peak C | Kid-hours/month | Duration | Requests | Total per month |
| --- | --- | --- | --- | --- |
| 50 | 7,200 → 900 room-hours | 415k GB-s, ≈ $0.2 | 3.9 M, ≈ $0.4 | ≈ **$6** with the $5 minimum |
| 500 | 72,000 | 4.15 M GB-s, ≈ $47 | ≈ $6 | ≈ **$58** |
| 5,000 | 720,000 | 41.5 M GB-s, ≈ $513 | ≈ $58 | ≈ **$576** |

  - Rooms of 16 instead of 8 would halve the duration line.
  - If a peak were sustained 24/7, multiply by 5.
- **Ops:** one Worker plus one Durable Object class, deployed with `wrangler`. No machines, regions or TLS to manage. A failure only affects the rooms on that object.
- **Fit with Vercel:** independent. The game page opens `wss://presence.<domain>/room/<id>?ticket=…`. A tiny Vercel route issues a short-lived ticket (§5.5).
- **Verdict: recommended for public T1.** The same object can later run a server-authoritative tick for a 2v2 room (§9), so T3 is not blocked.

### 3.4 Alternatives considered

| Option | Cost at 50 / 500 / 5,000 | Ops burden | Why not (for T1) |
| --- | --- | --- | --- |
| **Colyseus on Fly.io or Railway** | ≈ $7–13 / $15–35 / $200–500 a month (1 GB VMs, then performance VMs; capacity per VM is unmeasured and needs a load test) | Medium-high: machines, regions, a matchmaker, Redis presence for multi-process, deploys and health checks, 24/7 billing | A strong second choice. Pick it if Cloudflare is unwanted. It is good for T3 (authoritative rooms are its core feature). |
| **PartyKit (managed)** | ≈ Durable Objects pricing | Low | Now part of Cloudflare. Use `partyserver` on your own Cloudflare account (§3.3) rather than another vendor. |
| **Nakama (Heroic Labs)** | Self-host ≈ $30+/month plus Postgres; managed Heroic Cloud is priced for studios (not checked) | High | It ships accounts, chat, friends and groups, which this game must not use. Too much surface for a kids' game. |
| **Vercel WebSockets** | Function usage while sockets are open, plus Redis pub/sub per message | Medium | Beta. Sockets drop at 300 s (Hobby) or 800 s (Pro), and rooms need an external Redis because instances don't share memory. Revisit when it is GA with longer durations. |
| **WebRTC peer to peer** | ≈ $0 plus TURN (≈ $0.4–1 per GB relayed) | Medium (signalling, TURN) | **It gives each child's IP address to the other children's devices.** That is a privacy failure for kids, unless every connection is forced through TURN, which makes it a relay anyway. It is also an N² mesh. **Rejected for T1.** It might work for a parent-gated 2-player T3 session through TURN only. |

**Recommendation per tier:**
- **T1 prototype:** Supabase.
- **T1 public:** Cloudflare Durable Objects.
- **T2:** the existing Vercel routes and Supabase tables (no realtime).
- **T3:** the same Durable Objects with a server tick, or Colyseus if a heavier simulation needs Node.

---

## 4. Presence design

### 4.1 Areas, rooms and instances
- **Areas** are computed from position with a 30 m hysteresis band:

| Area | Where |
| --- | --- |
| `main` | the main island and its sea, x < 300 |
| `cay` | the causeway, Coral Cay and the sea round it: x ≥ 300 and z < −15 |
| `summit` | Summit Isle and its sea: x ≥ 300 and z ≥ −15 |

  - The Cay and Summit are 290 m apart, beyond the 160 m area of interest, so splitting them loses nothing.
  - While a kid is in a band, the client **listens** to the neighbouring area but only **sends** to the current one. That is 2 channels at most, against Supabase's limit of 100 per connection.
- **Separate pages leave presence:** the Arcade room, Konbini, Museum and Shop (`location.assign`, §1.4). So does a sealed dive room, if one is built (the swimming doc's decision 5); while inside it, the kid's bean is not drawn for others.
- **Instances:** room id `isl:v1:<area>:<n>`. A client joins `n = 0`. If the presence count is ≥ 12, it moves to `n + 1`. On the relay, a tiny lobby object assigns the instance, so the race is avoided.
- **Joining a friend:** an instance is random. Siblings who want to see each other use a **together code** (§4.8).

### 4.2 The wire (no strings, ever)
Each frame is an array of numbers, or 16 binary bytes on the relay:

| Field | Encoding | Notes |
| --- | --- | --- |
| `x, z` | int16, decimetres | ±3,276 m covers the 2,100 × 1,700 m map |
| `y` | int16, decimetres | flight height, roofs, the Summit |
| `yaw` | uint8 (256 steps) | |
| `speed` | uint8, 0.1 m/s | it drives the gait (`runIntensity`) |
| `mode` | uint8 enum | idle, walk, run, scooter, bike, moped, fly, parachute, zipline, wade, swim, float, hold-manta, hold-whale, fish, busy |
| `sub` | uint8 | ride skin index, zipline `t` × 255, or swim stroke |
| `emote` | uint8 | 0 = none, else 1–6, with a serial so a repeat replays |
| `seq` | uint16 | drops stale frames |

- **Look:** sent once on join (in Presence state on Supabase, or a join frame on the relay). It is the `CharacterCustomization` option indexes from §1.1, about 12 bytes, ≤ 10 Presence keys.
- **No name, code, hash, install id, player id, IP or text.**
- The receiver validates every field's range and enum. An invalid frame is dropped, and an invalid look becomes the default bean.

### 4.3 Cadence and interpolation
- **Send** at 5 Hz on the relay (3 Hz on Supabase) only while the position changes by > 0.15 m or the yaw by > 8°.
  - Mode changes and emotes are sent at once.
  - A heartbeat every 5 s while still.
  - Nothing at all while the island loop is sleeping or the tab is hidden.
- **Receive:** each remote has a fixed 4-slot ring of snapshots, written in place.
- **Render:** each remote is drawn 300 ms (relay) or 450 ms (Supabase) in the past.
  - Positions use Hermite interpolation between the two snapshots around that time, with velocity from `speed` and `yaw`, so walking curves don't zig-zag.
  - Extrapolation is capped at 250 ms, then the remote eases to a stop.
  - A jump of > 25 m (a teleport, a respawn or a rooftop warp) is not interpolated: the remote fades out and back in, reusing `characterArrival.ts`.
- **Cost:** one Hermite and one `PlayerMotion` fill per remote per frame, ≈ 1–2 µs. Decoding: on the relay, 5 frames/s for all remotes together; on Supabase, up to 11 × 3 = 33 callbacks/s at ≈ 20 µs each, ≈ 0.7 ms/s.
- **Latency doesn't matter for presence.** The remote is a walker you see, not a ball you have to meet. A 300–450 ms delay is invisible, and smoothness is what counts.

### 4.4 Rendering remotes (owner's look, instanced)
- **New `lib/graphics/remotePlayers.ts`:**
  - a pool of `createPlayer` rigs, made lazily and reused (never disposed during a session, so there is no GC churn when kids come and go);
  - all of them in **one `playerBatch(remoteScene, 32)`**, as `fieldRuntime.ts:49` does;
  - each remote gets `setBeanLook(beanLookFor(look), playerOutfit(look))`, a shirt number from the kit, and `profileFor('npc', seed)`;
  - **no ball** at a remote's feet in P0 (decision 5).
- **Shadows:** remotes cast through the same instanced depth path. Their root is registered with `viewGate.addUnitRoots` and with the shadow visibility test.
- **Labels:** **one** name tag, on the closest remote only (the `npcTagFocus.ts` pattern), painted once per change.
- **Ride proxies (new `lib/graphics/remoteRides.ts`):**
  - Remotes do **not** use `createVehicle()`.
  - The first time a ride kind and skin is needed, its vehicle meshes are merged into **one geometry with vertex colours** (one colour draw and one depth draw), shared by every remote on that kind through an `InstancedMesh`.
  - The jetpack is a merged pack with no exhaust particles. The parachute canopy is one merged mesh. The zipline needs none (the cable exists already).
  - Cost: ≤ 2 draws per ride kind in view, whatever the number of riders, against 24 draws per scooter today.
- **Tapping a remote:** one squared-distance pass over ≤ 16 remote positions on tap (no raycast, no hover). It opens the small remote card (§5.3).

### 4.5 What remotes do in each state

| Remote's state | Drawn as | Notes |
| --- | --- | --- |
| Walking, running, idle | bean, gait from `speed` | idle breathing comes from the rig itself |
| Scooter, bike, moped | rig in ride pose plus the merged proxy | the `sub` byte picks the skin colour |
| Jetpack flight | `flight` pose plus a merged pack | no trail and no exhaust for remotes |
| Parachute | `parachute` pose plus a merged canopy | |
| Zipline | rig at `cableAt(t)` with the `zipline` grip | `t` comes from `sub`, so it is exact on the cable |
| Wade, swim, float | `swim` pose (`swimPose.ts`) | no splash effects for remotes (the opaque sea hides the body) |
| Holding a manta or the whale shark | swim hold pose at the sent position | the animals' clocks are per page, so no second animal is drawn. Later option: run the sea-life loop phases from UTC time so every phone agrees (decision 9) |
| Fishing | standing cast pose, no rod line | |
| In a lesson, quiz, match, cannon or knockout | `busy`: idle pose with a soft ring | remotes never enter your lesson or match |
| Inside the Arcade, Konbini, Museum or Shop | not drawn (left presence) | sends `exit:door` first, so the bean fades at the door rather than vanishing mid-walk |

- Remotes are **ghosts**: no collision with you, townsfolk, the ball or vehicles. They never push, knock down or block anyone.

### 4.6 Visible cap and per-remote cost

| Tier (code) | Phone and tablet cap | Desktop cap |
| --- | --- | --- |
| 0 cool | 8 | 16 |
| 1 warm | 8 | 16 |
| 2 hot | 6 | 12 |
| 3 hotter | 4 | 8 |
| 4 hottest / Battery saver | 3 | 3 |

- **The cap is applied only at admission.** When the tier drops, remotes already shown stay shown (the deploy-4 "no flashing" rule, `heatTier.ts:16`). A slot freed by a leaver is not refilled above the new cap.
- **Who gets a slot:** the nearest remotes. Remotes past the cap still count in "who's around" (§4.7) but are never drawn.

**Per-remote budget** (estimates from §1.2, to measure in §6):

| Item | One remote on foot | 8 remotes on foot | One remote riding |
| --- | --- | --- | --- |
| Colour draws | +0–1 (shared batch: ≤ 5 for all) | ≤ 5 | +1 per ride kind in view |
| Depth draws | +0 (shared instanced shadow) | ≤ 5 | +1 per ride kind |
| Triangles | ≈ 5–6k (1.9k body + 3.0k limbs + one style, `performance-guide.md:1762`) | ≈ 45k | + proxy (≈ 1–3k) |
| CPU per frame at 4× | ≈ 0.08–0.11 ms (posing; no routine) | ≈ 0.7–0.9 ms | + 1 matrix |
| Network CPU | ≈ 0.1 ms/s | ≈ 0.7 ms/s | — |

**Expected net effect at tier 0 with 8 remotes:** about the north-beach townsfolk change. That was +3 busy points at 4×, judged "borderline, still at half the load of the town centre" (`performance-guide.md:50`). It stays below the 50 % danger line in every audited view.

### 4.7 Sleep rules (presence never adds a loop)
- **No new `requestAnimationFrame`, `setInterval`, render target or AudioContext.** Everything runs inside `presenceRuntime.step()`, which Town calls in its existing frame. The only background work is the socket's own events, which just write into the snapshot rings.
- **Off-screen remotes:** the view gate hides them for the render. They are not posed (`resumePose` when they come back), but their snapshots are still interpolated, which costs next to nothing.
- **Remotes > 160 m away:** not drawn and not posed. They count in "who's around". The relay doesn't even send them.
- **Island loop asleep** (map, Settings, a waiting quiz, the easel): no sending and no rendering. Incoming frames overwrite the rings. **They never wake the loop.**
- **Idle rides:** remotes moving don't count as input, so the 20 fps idle cap holds.
- **Tab hidden** (`visibilitychange`): sending stops at once, and the channel is left after 15 s, which closes the socket. On visible again, the client rejoins with the same session id (§4.9).
- **Battery saver:** cap 3 and send at 2 Hz. A Settings option, **"See other players: off"**, closes presence entirely (§5.1).

### 4.8 Joining, together codes and leaving
- **Opt-in** (decision 1): the first time the island loads after this ships, a card asks: "Other players can be on the island too. You'll see their characters and wave. There's no chatting." The two buttons are equal: **Yes, show them** and **Not now**. The answer is kept on the device. Settings has the same toggle. A grown-up can lock it off behind the existing `ParentGate`.
- **Public rooms:** join the area instance (§4.1).
- **Together code (private room):** one device shows a code made of four pictures (from the save-code word art, so there are no letters to misread). The other device types or taps it. Both join `tog:<code>` (max 4 kids, expires after 2 hours, unlisted).
  - This is the P0 prototype path, a copy of the phone controller's `ctrl:<ROOM>` pairing.
  - **No friend list is ever stored.**
- **Leaving:** a door (`exit:door`), page unload (the socket closes and others fade the bean after 8 s of silence), opting out, or the tab hidden for more than 15 s.
- **Arrivals:** a new remote fades in with the `characterArrival` ring (no pop), only once it has 2 snapshots.

### 4.9 Reconnection
- **Session id** (8 random bytes) is stored in `sessionStorage` with a 30-minute TTL. A reload, or a trip into the Konbini and back, keeps the same id and the same made-up name. A new visit gets a new id. It is never written to `localStorage`, saves or analytics.
- **Backoff:** 1, 2, 4, 8, 16, 30 s with ±30 % jitter, and no retry while the tab is hidden. On the relay, the server re-admits the same session id within 60 s, so others see the bean continue rather than leave and rejoin.
- **Offline:** the HUD chip shows a dim "–". There is no error dialog; the island plays exactly as today.

### 4.10 HUD: "who's around"
- **New `components/PresenceHud.tsx`:** a small chip with a people icon and a number, the count in your area instance (`4`).
  - It updates only on presence or join changes. That is a React state change a few times a minute, never per frame (the `stableMemo` rule).
  - Tapping it opens a sheet: "4 players on Coral Cay", **Hide everyone**, **Leave** (turns presence off), and the emote row.
- **Emote button:** one HUD button opens a row of 6 big picture buttons. It is hidden when presence is off, and it lives in the existing action cluster.

---

## 5. Kid safety and privacy (required)

### 5.1 The rules
1. **No free text, ever.** No chat, no typed names, no custom signs. The wire schema has no string field (§4.2), and tests enforce it.
2. **Preset emotes only:** 6 of them (§7). The client sends at most 1 per 2 s, and the relay drops more than 10 per minute.
3. **Random display names that the child does not choose:** colour + animal, for example "Teal Puffin". They are **derived on the receiving device from the session id** (a hash into 24 colours × 48 animals = 1,152 names, from a reviewed word list), so a sender can't make up a name. A name lasts one session.
4. **No friend lists.** Together codes are temporary and stored nowhere. If friends ever come, it is only through a parent-gated friend code (decision 3).
5. **Hide, block and report** on every remote (§5.3).
6. **Session-scoped ids only.** The other client receives the session id (8 random bytes, ≤ 30 minutes, per tab), the look indexes, the position and the emotes. Nothing else.
7. **No contact surface.** No following ("follow this player" doesn't exist), no gifts, no trading, no invitations from strangers. Remotes can't touch you, your ball or the NPCs.
8. **Personal space:** a remote that stays within 1.5 m of you for more than 20 s is shown at a 3 m offset on your screen only. A remote that keeps doing it can be hidden with one tap.
9. **Presence is opt-in** (§4.8), and a grown-up can lock it off.

### 5.2 COPPA and GDPR-K, stated plainly (not legal advice; **[LAWYER]**)
- **COPPA:**
  - A child's character position in a virtual world is not "geolocation".
  - The look indexes are not personal information.
  - The session id is a persistent identifier only for ≤ 30 minutes. It is used only to relay positions (the **support-for-internal-operations exception, §312.5(c)(7)**, as in `accounts-design.md:44-50`). The 2025 rule requires the notice to say which internal operation it supports and how it is kept from other uses (§5.4).
  - The relay sees IP addresses to run the socket. It doesn't log them, and the rate limits use a day-salted hash, as the leaderboard does.
  - **The key COPPA risk is "enabling a child to make personal information publicly available"** (chat, names, photos). Rules 1 and 3 remove that surface. If any future feature adds free text or chosen names, verifiable parental consent comes back.
- **UK and EU (ICO Age Appropriate Design Code, GDPR Article 8):**
  - Being visible to other users is the kind of feature the code expects **off by default**, or a real, equal choice (standard 7, high privacy by default; standard 13, no nudges). Hence the opt-in.
  - A short **DPIA** is needed (standard 2).
  - Transparency at the point of use (standard 4): the opt-in card says what others see.
  - The lawful basis is probably contract or legitimate interests, not consent.
- **Child-safety review:** before public rooms, test griefing (crowding, emote spam, standing in faces) with real kids and parents in a together-code beta.

### 5.3 Hide, block and report (no identity needed)
- **Tap a remote** to see a card with its made-up name and three buttons:
  - **Hide** (only you stop seeing it, for the session);
  - **Hide everyone**;
  - **Report**: pick a reason from pictures ("following me", "too many emotes", "something else").
- **Report on the relay:** the server counts reports per session. Two reports from different sessions in 10 minutes **quietly move that session to a room on its own** and drop its emotes. Nothing is stored after the room closes. A daily aggregate count ("reports today: 3") goes to `/admin`, with no ids.
- **Report on Supabase (prototype):** Hide only. There is no server to act on a report.

### 5.4 Keeping the analytics player id (and every other key) off the channel
- **`lib/presence/*` must not import** `lib/analytics/*`, `lib/saves/*` or `deviceMarks`, and must not read the `fi2-install-v1`, `fi2-save-code-v1` or `fi2-*` analytics keys. The session id is made fresh by `crypto.getRandomValues` (P0) or by the relay (P1).
- **Tests** (`tests/presence-isolation.cjs`):
  - an import-graph regex over `lib/presence/**`, `components/PresenceHud.tsx` and `relay/**`;
  - a schema test: every encoded frame decodes to numbers only;
  - a fuzz test: random `CharacterCustomization` plus a planted save code and install id in storage never appear in encoded bytes.
- **Analytics** may count presence only as an aggregate beat ("presence on", "room size bucket") under the normal visit counter, **never with a session id**. The relay never sends its ids to `/api/visit`.

### 5.5 Abuse and keys
- **Ticket:** `POST /api/presence/ticket` (Vercel) returns an HMAC ticket for an area or a together code: `PRESENCE_TICKET_SECRET`, a 2-minute lifetime and a random nonce. It holds no identity. Per-IP-hash caps work as in `leaderboardServer.ts`. The relay rejects connections without a valid ticket.
- **Supabase prototype:** private channels with an RLS policy on `realtime.messages`, so only ticket holders can join, plus the Realtime "private only" setting.

### 5.6 What the privacy page would have to say (draft)
- **§1, the short version** (replace "no chat with other players"):
  > "No ads and no chat. If you turn on *See other players*, other children on the island see your character, where it walks and the waves you tap, with a made-up name like 'Teal Puffin' that changes every visit. Nobody can type anything, and nothing about where you went is kept."
- **§12, services:**
  > "Cloudflare relays live character positions between players while they play and keeps nothing after they leave."
  > "Supabase also relays the phone-controller pairing."
  (The second sentence fixes an existing omission.)
- **§9, what we never collect:** keep it, adding "chosen names or messages to other players".
- **Grown-ups copy** (`AboutGrownUps.tsx:17`):
  > "No ads, no chat, no names or contact details. Seeing other players is optional and can be locked off behind the grown-up check."

---

## 6. Heat budget and validation (required)

| Feature | Draws | Triangles | CPU per frame | Sleeps / gates | Reuses |
| --- | --- | --- | --- | --- | --- |
| Remote beans (≤ 8 on phones) | ≤ 5 colour + ≤ 5 depth for all | ≈ 5–6k each | ≈ 0.1 ms each at 4× | view gate, no posing off-screen, > 160 m not drawn, cap at admission | `playerBatch`, the bean skin, `npcShadowBatch` path, `characterArrival` |
| Ride proxies | ≤ 2 per ride kind in view | 1–3k each | 1 instance matrix | as above | merged once from `vehicle.ts` meshes |
| Name tag | 1 sprite | 2 | paint on change | closest only | `npcTagFocus` |
| Interpolation | — | — | ≈ 2 µs per remote | none while the loop sleeps | — |
| Socket | — | — | ≈ 0.1 ms/s per remote (Supabase), ≈ 0.05 (relay batches) | stop sending when the tab is hidden, leave after 15 s | `relayClient` |
| HUD chip and emotes | DOM | — | a React update on join or leave only | — | action cluster |

**Battery and radio.**
- A socket receiving 5 frames/s keeps a phone's cellular radio out of its low-power state the whole time. On LTE and 5G that is a real battery cost, though not much heat. On Wi-Fi it is small.
- **Mitigations:** the relay batches (5 wake-ups/s total, not one per remote), sending only while moving, and a 2 Hz receive mode under Battery saver.
- **Measure it** (below). Don't assume it.

**Explicitly NOT to do:**
- per-remote vehicles from `createVehicle()`;
- remote exhaust, trails, splashes or dust;
- a new loop or timer;
- polling a REST endpoint for positions;
- remotes waking the loop or resetting the idle-ride timer;
- hiding already-shown remotes when the tier changes;
- raycasts or hover on remotes;
- per-remote labels;
- P2P WebRTC.

**How to validate:**
1. **Node tests** (vm-transpiled TS plus source regex, the `heat-tiers.cjs` and `idle-ride.cjs` style):
   - `presence-wire.cjs` (encode and decode, ranges, no strings);
   - `presence-interp.cjs` (Hermite, extrapolation cap, teleport fade, no allocations in `step`);
   - `remote-players.cjs` (with three in node: ≤ 5 colour draws for 16 remotes, cap at admission, a tier drop doesn't hide);
   - `heat-presence.cjs` (no `requestAnimationFrame`, `setInterval`, `WebGLRenderTarget`, `AudioContext` or `backdrop-filter` in the new files; the idle-ride and sleep wiring untouched);
   - `presence-isolation.cjs` (§5.4);
   - `presence-names.cjs` (deterministic, the reviewed list only).
2. **A dev knob, `?ghosts=N`:** a fake transport that replays recorded paths for N remotes, so heat runs need no network (the `?npcx=N` pattern, `performance-guide.md:263`).
3. **Browser:** `scripts/check-presence-browser.cjs` (Playwright) with **two browser contexts** on one together code, 390×844 touch, DPR 2, 4× CPU.
   - Each sees the other walk, ride, swim and wave.
   - Read `__fi2.renderer.info` draws and triangles and `renderStats`.
   - Assert the loop still sleeps under Settings with a remote moving.
4. **A/B by the heat-audit method** (`performance-guide.md:12-20`): production builds, interleaved reps, busy % at 4× and 6×. Scenarios: spawn idle, Island Square walk, Coral Cay walk, each with ghosts 0, 4, 8 and 16 (desktop). Danger line: busy ≤ 50 % and the frame median ≤ 37.3 ms.
5. **Real iPhones (the project rule):** two iPhones on one together code.
   - The same 5-minute beach route, not charging, comparable start temperature.
   - Safari Web Inspector timeline on one phone.
   - Runs: presence off, presence with 1 remote, presence with 8 ghosts.
   - Plus **a 20-minute battery-drain run on cellular and on Wi-Fi** (battery % before and after, screen brightness fixed).
   - Record everything in the guide's dated log. **No cooling or heat claim from emulation.**

---

## 7. Teaching tie-in (AGENTS.md)

Each emote names its football meaning the first time a kid uses it. Coaching metaphors are labelled as such.

| Emote | Pose (existing) | Football meaning shown | Type |
| --- | --- | --- | --- |
| Wave "Hi!" | arm wave (celebration pose) | "Teams shake hands before and after a game. Say hi!" | fair-play habit |
| Hand up "Pass to me!" | `called` + `'calling'` face | "Hand up and call: it tells a teammate you're free for the ball." | coaching habit |
| Point "Space!" | point arm | "Point to space: show your teammate where to run or pass." | coaching habit |
| Thumbs up "Nice one!" | thumbs up | "Good teammates praise a good pass, even a missed one." | coaching habit |
| Clap "Well played" | clap | "Clap the other team too. That's respect." | fair-play habit |
| Cheer | celebration jump | "Celebrate together: the whole team scored." | coaching metaphor |

- **Spacing tip:** once per session, when 3 or more beans stand within 3 m of each other, the coach line says: "Spread out! Good teams make the pitch big so there's room to pass." It is labelled a coaching metaphor, uses no new audio, and reuses the coach toast.
- **Later (T3):** "Pass to me!" becomes the real call for the ball in a shared-ball game. Presence teaches the habit first.
- **Kid-first:** nothing about presence is a score, a ranking or a reward, and nothing is lost by turning it off.

---

## 8. Plan

### Phases

| Phase | Scope | Estimate (agent-days) |
| --- | --- | --- |
| **P0 prototype** | wire, names, session, Supabase transport, together code, remote rigs in a batch, interpolation, walking and swimming states, HUD chip and the emote row, the opt-in card, tests, the two-context browser check. **Milestone: two phones on one together code see each other walk on the beach and wave.** | **6–8** |
| **P1 public rooms** | Cloudflare relay (`IslandRoom` plus a lobby), tickets, area instances and hysteresis, area of interest, batching, server rate limits, report handling, reconnection with session resume, the relay transport | **5–7** |
| **P2 fidelity** | ride proxies (scooter, bike, moped, jetpack, parachute), zipline, animal hold, fishing and busy states, door exits, the personal-space rule, Battery saver mode, costumes if decision 6 says yes | **3–4** |
| **P3 safety and launch** | privacy and grown-ups copy (after the **[LAWYER]** review), the ParentGate lock, the `/admin` aggregate, A/B heat runs, the two-iPhone session and the battery runs, the guide's dated entry | **2–3** |
| **Total T1** | | **16–22** |

### Lanes (parallel, each owning new files)

**`components/Town.tsx` is shared and huge, so one glue lane (F) owns its edits and lands last in each phase.**

| Lane | Phase | Owns (new files) | Touches (minimal, additive) | Tests |
| --- | --- | --- | --- | --- |
| **A: protocol** | P0 | `lib/presence/wire.ts`, `lib/presence/names.ts` (+ reviewed word list), `lib/presence/emotes.ts`, `lib/presence/session.ts`, `lib/presence/areas.ts` | none | `presence-wire.cjs`, `presence-names.cjs`, `presence-areas.cjs` |
| **B: transports** | P0, P1 | `lib/presence/transport.ts` (interface), `lib/presence/supabaseTransport.ts`, `lib/presence/relayTransport.ts`, `lib/presence/fakeTransport.ts` (`?ghosts=N`) | `lib/relayClient.ts` (only if a second channel option is needed) | `presence-transport.cjs` (backoff, resume, hidden-tab leave) |
| **C: relay** | P1 | `relay/` (Worker, `IslandRoom` and `Lobby` Durable Objects, `wrangler.toml`, room logic as a pure module), `app/api/presence/ticket/route.ts`, `lib/presence/ticketServer.ts` | `.env.example` | `relay-room.cjs` (pure room logic: area of interest, batching, rate limits, reports), `presence-ticket.cjs` |
| **D: remote rendering** | P0, P2 | `lib/presence/interp.ts`, `lib/graphics/remotePlayers.ts`, `lib/graphics/remoteRides.ts` | none (read-only use of `player.ts`, `playerBatch.ts`, `beanSkin.ts`, `vehicle.ts`) | `presence-interp.cjs`, `remote-players.cjs`, plus the `player-batch`, `bean-skin` and `view-gate` goldens |
| **E: HUD and safety UI** | P0, P2 | `components/PresenceHud.tsx` (+ CSS module), `components/PresenceOptIn.tsx`, `components/RemoteCard.tsx` | `components/IslandSettings.tsx` (one toggle row and the gate lock) | `presence-ui.cjs`, `ui-spec.cjs` additions |
| **F: glue** | each phase | `lib/presence/presenceRuntime.ts` (one `step()`) | `components/Town.tsx` (create, step, view-gate registration, door `exit` before `location.assign`, sleep and hidden hooks) | `heat-presence.cjs`, `presence-isolation.cjs`, `scripts/check-presence-browser.cjs` |
| **G: copy and legal** | P3 | — | `components/privacy/PrivacyPolicy.tsx`, `components/about/AboutGrownUps.tsx`, `docs/accounts-design.md` (addendum), `docs/performance-guide.md` (dated entry only, through lane F) | `privacy-page.cjs` if present, else a regex check |

- **Agent hygiene** (user memory): each agent uses its own `NEXT_DIST_DIR`, kills its servers and browsers, and never touches port 8092 or `.next-dev`. The two-context browser check runs on its own port.

### Infra steps for the user
Futbol Island uses only the khoa0aohk@gmail.com accounts, so create any new account there.

**P0 (Supabase, about 10 minutes):**
1. In Vercel → Project → Settings → Environment Variables, confirm that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set for Production and Preview. The controller needs them too (`relayClient.ts:10-11`).
2. Add `PRESENCE_TICKET_SECRET` (32+ random characters) to Vercel.
3. In Supabase → Realtime → Settings, turn on private channels only. Lane B's migration adds the RLS policy on `realtime.messages`.
4. Leave the Supabase spend cap **on** during the prototype.

**P1 (Cloudflare, about 30 minutes):**
1. Create a Cloudflare account and subscribe to Workers Paid ($5/month).
2. Run `npx wrangler login` once on the dev machine.
3. Deploy with `npx wrangler deploy` from `relay/`.
4. Run `npx wrangler secret put PRESENCE_TICKET_SECRET` (the same value as on Vercel).
5. Optional: a custom domain `presence.<your domain>` (or use the `*.workers.dev` URL).
6. Add `NEXT_PUBLIC_PRESENCE_URL` to Vercel.
7. Set a Cloudflare billing alert at $20.
8. Optional: add a `CLOUDFLARE_API_TOKEN` GitHub secret for a deploy workflow.

### Monthly cost (T1, the §3 assumptions: peak C, average 20 % of peak)

| Peak concurrent kids | Prototype on Supabase | Recommended: Cloudflare DO relay | Colyseus on Fly (alternative) |
| --- | --- | --- | --- |
| 50 | ≈ $945 (Pro, cap off) | **≈ $6** | ≈ $7–13 |
| 500 | ≈ $9,300 and over the rate cap | **≈ $58** | ≈ $15–35 |
| 5,000 | not possible without Enterprise | **≈ $576** | ≈ $200–500 (needs a load test) |

- Together-code rooms (2–4 kids) on Supabase cost ≈ $0.02 per kid-hour, so the prototype is effectively free.

---

## 9. Later (appendix): Tiers 2 and 3, and why the T1 choices don't block them

**T2, async together (3–5 agent-days).** No realtime at all.
- **Ghost runs** for Breakaway Run and the zipline: record ≤ 10 Hz position traces (≤ 3 KB) and post them with a signed run token, exactly like `/api/arcade-board/*` (`leaderboardServer.ts`: token, plausibility checks, top 10 only) into a new Supabase table. Replay a ghost with the T1 `remotePlayers` pool (the same rig, interpolation and cap).
- **Shared daily challenges and island team totals:** a Vercel route plus a counter table. Clients read a cached total (edge-cached like `top`).
- **"A friend caught this" fishing notes:** need a friend relationship, so they wait for decision 3.

**T3, real-time play (≈ 35–50 agent-days on the T1 relay).**
- **Is the match sim deterministic today? Partly.**
  - It is seeded, with its own LCG (`lib/town/match/matchSim.ts:561-568`).
  - There is no `Math.random` in `matchSim.ts`, `walkBall.ts` or `liveBallPhysics.ts`.
  - It substeps at ≤ 0.034 s (`matchSim.ts:1437-1442`).
  - **But the step size follows the frame clock.** `fieldRuntime.ts:99-102` passes the wall-clock `matchDt` (batched to 100 ms when unseen, `matchUpdateClock.ts:1-5`) times `liveGameSpeed`.
  - It also uses 39 `Math.sin`, `cos`, `atan2` and `hypot` calls in `matchSim.ts`, whose last-bit results may differ between browser engines.
  - So it repeats only for the same dt sequence on the same engine. **It is not lockstep- or rollback-ready.**
- **Recommended authority model: server-authoritative on the same Durable Object.**
  - A fixed 30 Hz tick runs a trimmed 2v2 cage sim (the `makeCageSim` futsal path, `matchSim.ts:209`).
  - Clients send inputs and predict only their own bean.
  - The ball is shown about 100 ms in the past, with a generous kick radius for kids' phones and their lag.
  - A rollback client (host-authoritative) would need the fixed-step sim, deterministic maths and per-device verification, which is more work for little gain at 2v2.
- **Passing a ball between two players:**
  - the ball is server-owned;
  - the passer's kick is predicted locally and corrected within 150 ms;
  - teaching hooks: pass weight, calling ("Pass to me!" from T1) and spacing.
- **Rooms and matchmaking:** together codes first (no strangers in contact games), then the area lobby. Reconnection with the T1 session resume.
- **Fishing side by side:** T1 already covers it (a remote in the fishing pose). Shared catches would be a T2 note.

**So the T1 choices hold:**
- the transport interface and the relay already carry rooms, tickets, session ids and batching;
- the `remotePlayers` pool draws ghosts (T2) and opponents (T3);
- the safety rules (no text, made-up names, together codes) apply unchanged.

---

## 10. Decisions for the user

1. **Opt-in or on by default?** Recommended: **opt-in** with an equal "Not now", plus a Settings toggle and a grown-up lock (ICO standard 7). On by default would mean more kids see each other, but it needs the lawyer's sign-off.
2. **Prototype path.** Recommended: P0 on Supabase together codes (no new account, about a week sooner), then the Cloudflare relay for public rooms. Or skip Supabase and build on Cloudflare from day one (saves ≈ 1 agent-day of adapter work).
3. **Friends.** Recommended: **none in T1**; together codes are temporary. Later, a parent-gated friend code (the grown-up adds it, and it is stored as a hash on the device only)?
4. **Public rooms with strangers at all?** Recommended: yes, but only after a together-code beta with real kids and parents. Or together codes only, forever (the safest, but the island feels empty).
5. **A ball at remote feet?** Recommended: no ball for remotes in T1 (no shared ball, less to draw). Or a cosmetic ball that follows each remote's own dribble (+1 instanced draw, and it looks livelier).
6. **Costumes on remotes.** Show a remote's club costume only if your device already has that costume loaded (otherwise base bean and kit), or always base bean and kit?
7. **Room size.** 12 per instance (recommended), or 16 or 24 with area of interest (cheaper relay, more crowding).
8. **The visible cap on phones.** 8 at tier 0 (recommended, about the north-beach townsfolk change), or 6 to be safer until the iPhone run.
9. **Shared sea-life clocks.** Run the whale shark, manta and shark loop phases from UTC time, so a remote riding the whale shark is really on it (≈ 1 agent-day, P2)? Or keep it hold-pose only?
10. **The name list.** Colour + animal (recommended: 24 × 48, reviewed for kid safety), or football-word names ("Swift Striker")?
11. **The privacy wording** in §5.6, and booking the **[LAWYER]** review and DPIA before public rooms.
12. **Cloudflare account.** OK to create it under khoa0aohk@gmail.com, on Workers Paid ($5/month)?
