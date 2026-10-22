# Multiplayer in every room: friends together in the Konbini, Museum, Arcade, Kit Shop and reefs (design, 22 Oct 2026)

Owner request (verbatim): "we need to make sure that it works in all places, allow multi players to be in the museum, konbini,
arcade, and so on".

Status: **Phase 1 BUILT (22 Oct 2026, branch `mp-rooms-phase1`)**: the room party layer + the Konbini, as specified below, with the
owner's answers to section 6 (door hint yes, reefs no, Leave-only chip, two separate Konbinis, relay v1.1 later). Notes:
`docs/multiplayer-design.md` 5.8. Phases 2-5 remain design only. Builds on `docs/multiplayer-design.md` (4.4 protocol, 4.4.1
presence, 4.7 heat) and assumes the parallel branch **`party-persist`** lands first: the stored party session auto-resumes on every
page load and the relay keeps an Indoors member's slot longer. This doc does not repeat that work; section 3.1 says exactly where
the two meet.

## 0. Summary

| Room | Route / mount | Shared avatars? | Effort | Heat risk | Phase |
|---|---|---|---|---|---|
| Room party layer (shared code) | `lib/multiplayer/roomParty.ts` + `components/party/RoomPartyChip.tsx` | n/a | M | n/a | 1 |
| Konbini (main + Cay variants) | `/konbini` (`app/konbini/page.tsx` -> `components/KonbiniRoom.tsx`, `lib/konbini/konbiniScene.ts`) | **Yes** | S (on top of the layer) | Low | 1 |
| History Museum | `/museum` (`components/MuseumRoom.tsx`, `lib/museum/museumScene.ts`) | **Yes** | S | Low-Med | 2 |
| Arcade hub | `/arcade` (`components/ArcadeRoom.tsx`, `lib/arcade/arcadeRoomScene.ts`) | **Yes** (friends replace crowd NPCs) | M | Med | 3 |
| Arcade game in progress | in-page overlay inside `/arcade` (`components/games/*`, `LiveArcadeMatch`) | No: force field at the cabinet, "Playing Pinball" | S (in 3) | none | 3 |
| Kit Shop floor | `/shop` (`components/shop/ShopRoom.tsx`, `lib/shop/shopScene.ts`) | **Yes** | S-M | Low-Med | 4 |
| Kit Shop studios (ball / boot / jersey try-on) | in-page overlays in `/shop` | No: field "Designing a kit"; new outfit shows after the relay update (4) | S (relay) | none | 4 |
| Explore reefs (7 spots) | in-island sealed dive room (`lib/graphics/diveRoom.ts` own `THREE.Scene`, driven by `lib/town/water/diveRuntime.ts` from `Town.tsx`) | Yes, later: same spot = same instance | L | Med-High | 5 (optional) |
| Konbini shelf zoom, eating, counter talk, stamps | in-page in `/konbini` | No: field in the room | in 1 | none | 1 |
| Museum exhibit zoom / experiences / certificate | in-page in `/museum` | No: field at the exhibit | in 2 | none | 2 |
| Vending zoom, fishing, lessons, quiz, map, settings, wardrobe | island overlays (`Town.tsx`) | No: Busy + field (exists today) | none | none | - |

**Recommended first slice (Phase 1):** pure room-pose helpers + the room party layer + the Konbini. No relay redeploy, no protocol
version bump, old clients and the old relay keep parsing every frame. ~10 agent-hours build + ~3 verify.

**Key decision:** rooms ride on the *existing* wire. A room pose is `zone = Indoors`, a **reserved y band** (y_dm in [-400, -300])
marks "these x/z are room-local", and the **speed byte carries the room code**. Adding Zone values 5+ would make the deployed relay
count every frame as bad (5 bad frames = socket closed) and make old clients drop whole `Poses` batches and even the `Welcome`
(`validate.ts` `isPose` -> `clampPose` rejects zone > 4). See 2.1.

---

## 1. Inventory

Common to all four room pages: each is its own Next.js route, entered with `location.assign` from the island door
(`lib/*/…Doors.ts`) and left with `location.assign(…_RETURN_URL)` (e.g. `KONBINI_RETURN_URL='/?from=konbini'`). The island
(`components/Town.tsx`) unmounts, so today the shared connection (`townBridge.ts` `partyConnection()`), the friend layer
(`createPartyRuntime`) and PartyHost all die with it; only `pagehide` sends a last Busy + `Zone.Indoors` + room Activity pose at the
door (`presence.ts` `fillLocalBody`). Each room has its own `WebGLRenderer({powerPreference:'low-power'})`, its own local player
built with `createPlayer('you','home',true,true)` + `setBeanLook` + `wearBackpack` (the same rig family the remote layer uses), a
frame loop that **sleeps when nothing moves** (`frame===0`), a `setCovered(bool)` that stops the loop under overlays, and a
`state` getter with `draws` / `frames` / `render.calls` (useful for the heat checks below). None imports the remote avatar layer
today; none has a view gate.

| | Konbini | Museum | Arcade hub | Kit Shop | Dive room (Explore) |
|---|---|---|---|---|---|
| Factory | `createKonbiniScene(canvas, shop, cb)` konbiniScene.ts:44 | `createMuseumScene(canvas,input,cb)` museumScene.ts:41 | `createArcadeRoomScene(canvas,onNear,start,…)` arcadeRoomScene.ts:27 | `createShopScene(canvas,cb)` shopScene.ts:79 | `createDiveRoom(spot,opt)` diveRoom.ts:185 |
| Variants | `main`, `cay` (`konbiniVariants.ts`, chosen from the stored door) | one | one | one | 7 spots (`DIVE_SPOTS`, diveSpots.ts:173+) |
| Camera | Ortho (-8..8 x -6..6) follow + in-world shelf zoom (`konbiniZoom.ts`) | Ortho + exhibit zoom (`ZD=9`, `zoomTo`) | Ortho, follow (cam at y 14, z+14) | **Perspective** 40 deg, follow | Perspective, swim follow |
| Bounds (local m) | x +-7.4, z -5.6..5.7 (door 6.3); ~15 x 12 m | main hall x -12..12, z -8..8 + west wing x -21..-12, z -8..18; ~33 x 26 m | x +-14, z -11..12; ~28 x 23 m | x +-8, z -7..4.5; ~16 x 11.5 m | radius 24 m (`DIVE_ROOM_R`), y floor..3.2 |
| Movement | joystick / WASD / tap-to-walk, path grid `konbiniPath.ts`, `collide()` (konbiniScene.ts:349) | same recipe, museumScene.ts:249-266 | stick / keys / tap, clamp + route to cabinet `walkTo` (arcadeRoomScene.ts:136, 210) | museum recipe (shopScene.ts:26) | 3D swim (`diveSession.ts`) |
| Frame rule | sleeps when still; phones 30 fps cap (`frameCapSlot`, `tierSettings`) | same | **never fully idle while visible**: 15 fps idle, 30/60 when active (attract screens, crowd) | sleeps; NPC-only walks at 20 fps, rests after `IDLE_REST` | runs while diving (heavy: reef, kelp sway, fish) |
| NPCs | clerk (`CASHIERS[shop]`) | guide Ada | crowd 3 phone / 5 desktop (`arcadeRoomCrowd.ts:17`) | clerk Femi + shoppers (`shopCast.ts`), one walks at a time | zone friend, fish, whale (instanced) |
| Covered / busy states | `overlay`, `reveal`, `packReveal`, `talking`, `stampsOpen` (KonbiniRoom.tsx:112); shelf zoom; eating | `guideOpen`, `cert`, `balls`, `experience` (MuseumRoom.tsx:91); exhibit zoom | `list`, `hall` (ArcadeRoom.tsx:48); a running `game` replaces the room | `studio`, `myKit`, `talking` (ShopRoom.tsx:87) | breath rest, finds |
| Expected friends at once | 2-4 (small shop) | 2-6 | 2-8 (most social room) | 2-4 | 2-3 per spot |
| Heat today | low (sleeps) | low-med (bigger hall, sleeps) | **medium** (15 fps floor, attract demos, crowd rigs) | low-med (perspective, shoppers) | **med-high** (already the heaviest water scene) |

In-island Busy activities (not rooms; keep as today): vending zoom + store sheet (`Activity.Vending`), fishing (`Fishing`),
lessons / quiz / settings / map / wardrobe / chat. They already send Busy, freeze at the last outdoor pose and show the force field
(`docs/multiplayer-design.md` 4.4.1). Other routes (`/coffee`, `/controller`, `/privacy`, the `*-lab` pages, `(site)`) are not play
spaces: no party layer (they keep the session in storage only, via party-persist).

---

## 2. Protocol

### 2.1 Why not new Zone values
`multiplayer/protocol/limits.ts` `clampPose` rejects `zone > Zone.Indoors`. On the **deployed relay** that is `bad(m)`; five bad
frames close the socket (`roomCore.ts` `pose()` / `bad()`). On **old clients** `parseServer` uses the same check (`validate.ts`
`isPose`, used by `S.Poses` and `isMember` in `S.Welcome` / `S.Joined`): one friend in a new zone makes an old client drop the whole
Poses batch and refuse the Welcome (cannot join). `PROTOCOL_VERSION` must not change either (`roomCore.ts:347` refuses any other
`v`). So every room pose must stay inside today's ranges.

### 2.2 Room pose encoding (v1-safe, no relay change)
New pure file `multiplayer/protocol/rooms.ts` (exported from `protocol/index.ts`, tested like `presence.ts`):

```ts
export const ROOM_Y_MIN = -400, ROOM_Y_MAX = -300, ROOM_Y_MID = -350; // dm; island poses never go below -29 m (add a test)
export const RoomCode = {           // carried in body[4] (speed byte) while zone = Indoors
  Arcade: 5, Museum: 6, Shop: 7, Konbini: 8,   // = the Activity codes, so OLD clients still print "In the museum" when Busy
  KonbiniCay: 32,                   // new rooms 32..63 (old clients read unknown codes as plain "Busy")
  Reef: 40,                         // 40 + spot area (1..7): 41..47
} as const;
/** Room-local pose -> wire body. x/z: room metres * 10 (rooms are < 40 m: well inside WORLD_BOUNDS); y: ROOM_Y_MID + localY*10, clamped to the band. */
export function roomBody(out: PoseBody, room: number, x: number, y: number, z: number, yaw: number, mode: Mode, flags: number): PoseBody;
/** The room a body is in (room code), or -1 when it is an island pose or a legacy door pose (Indoors with y above the band). */
export function roomOf(body: ArrayLike<number>): number;   // zone === Indoors && y in band ? body[4] : -1
export function roomLocalY(yDm: number): number;
```

Rules:
- In a room the **mode** is Walk / Run / Idle as usual (Dive in a reef); **Busy** inside a room = mode Busy at the room-local spot.
  The speed byte is the room code in every case, so receivers derive the walk cycle from mode (Walk ~2 m/s, Run ~4 m/s) or from the
  interpolated position delta (`interp.ts` already interpolates position; the room layer writes `pose.speed` from the delta).
- The *kind* of busy inside a room (which cabinet, which exhibit, the counter) is **not on the wire**: receivers look up the nearest
  station in the room's own layout table (`arcadeCatalog` cabinets, `museumExhibits`, the Konbini counter / shelves) within 2.5 m.
  Zero new fields, and the label is always in the receiver's own words.
- **Legacy door pose** (Busy + Indoors + Activity at the island door, y >= 0) stays exactly as today; it is what old clients and
  rooms that do not mount the layer send.
- Old island clients see a room pose as Indoors: the friend fades out at the door as today (`remoteAvatars.ts:314`), and the party
  list says "In the Konbini" while they are Busy, plain "Busy" while walking (activityOf only reads the byte under Busy). Acceptable.
- **Warp on every page entry.** The relay's speed check compares against the last accepted pose (door -> room-local is a jump), and
  allows one Warp per 5 s (`WARP_MIN_GAP_MS`). If a kid pops out of a lesson (a warp) and into the Konbini within 5 s, the entry
  warp is silently dropped and every later pose fails `speedOk` forever. Client rule (pure, in `presence.ts`): the first pose after a
  Welcome carries Warp, and **one retry Warp 5.5 s later**; non-warp poses in between. Same rule on the island after returning from a
  room. Covered by a unit test that replays the relay's `pose()` with a fake clock.
- `C.Ping` (Meet here / Follow me) is island-only: the room chip hides it, and island receivers ignore pings from a member whose
  last pose is in a room.
- Emotes work unchanged: the relay drops `C.Emote` only for Busy / Hidden members (`roomCore.ts:216`), and a walking in-room member
  is Indoors, not shielded.

### 2.3 Bounds, speed, interest (relay)
**Phase 1-3 need no relay change**: room poses are inside `WORLD_BOUNDS`, Walk speeds pass `speedOk`, and with parties <= 20 the
nearest-12 interest rule only bites when > 12 members move in one tick (the 1 Hz beacon then still delivers everyone).

**Relay v1.1 (Phase 4, optional, backward compatible, one `wrangler deploy` by the owner):**
1. `limits.ts` `ROOM_BOUNDS[roomCode]` (half extents + 3 m margin: Konbini 11 x 9, Museum 25 x 22, Arcade 18 x 16, Shop 12 x 10,
   Reef 28 x 28 m) checked in `clampPose` when `roomOf(body) >= 0`; out of bounds = drop (not `bad()`, so a layout change never
   kicks anyone).
2. A change of `roomOf` (island <-> room, room <-> room) is accepted as an implicit warp (no 5 s gap): removes the retry dance.
3. `interest()`: recipients hear members in the **same room** at 5 Hz (nearest 12 among them); members elsewhere only on the 1 Hz
   beacon. Island members stop receiving 5 Hz room walking; room members stop receiving island running.
4. `markAway`: today it skips every Indoors member (`roomCore.ts:406`); skip only the legacy door pose so a silent in-room member
   shows Away like everyone else.
5. Resume Hello updates `m.look` and broadcasts `S.Joined` with the new MemberInfo (the client store upserts by id; old clients have no capability flag, so
   test first that an old client does not show the row twice). This is
   what makes a new shop outfit visible after leaving the studio.

Interest **on the client** (always, no relay needed): a friend is drawn iff `roomOf(friend) === myRoom` (island: `myRoom = -1`, and
the existing non-Indoors rule). Everyone else is roster-only.

### 2.4 Party list / chip text
`presence.ts` gains `roomText(code)`: Konbini / Konbini Cay "In the Konbini", Museum "In the museum", Arcade "In the arcade"
(Busy at a cabinet: "Playing arcade"; same room: "Playing Pinball" from the station lookup), Shop "In the Kit Shop", Reef 41..47
"Exploring <spot name>". `store.ts` stores `room = roomOf(pose)` next to presence (one more field compared at line 81, still emits
only on flips); `PartyHost.tsx` `memberActivityLine` prefers it. Inside a room, friends in the same room show no line (just playing)
or their station line; friends on the island show the zone label ("on the island", `ZONE_LABEL`).

### 2.5 Compatibility matrix
| Sender \ Receiver | old client (island) | new client (island) | new client (same room) |
|---|---|---|---|
| old client entering a room | door pose -> fades out, "In the Konbini" | same | roster only (legacy door pose, not this room) |
| new client in a room (walking) | fades out at door (it is Indoors), "Busy" text | fades out, "In the Konbini" | **drawn, walking** |
| new client busy in a room | "In the Konbini" | "In the Konbini" | drawn in a force field, "At the counter" |
| relay (deployed v1) | accepts all of the above (inside bounds / ranges) | | |

---

## 3. Client architecture: the room party layer

### 3.1 Connection and lifetime (coordinate with `party-persist`)
- party-persist owns: auto-resume of the stored session (`connection.ts` `Session` in sessionStorage, `SESSION_KEY`) on every page
  load, the longer Indoors grace, and "close only on explicit End / Leave". This design only needs one thing from it: a page-level
  `partyConnection()` that is resumed **before** the room scene mounts, and `bindConnection` (already ref-counted,
  `lib/multiplayer/index.ts`). Ask that branch to export the resume as `resumeStoredParty(): PartyConnection | null` so rooms call it
  in one line; if it lands as an effect inside PartyHost instead, the room layer calls PartyHost's helper.
- `townBridge.ts` keeps the island; the generic parts move out (below). No `pagehide` door pose from a room page that runs the layer:
  the room page's own last pose (room-local) is what friends keep.

### 3.2 `lib/multiplayer/roomParty.ts` (new, ~200 lines; extracted from `createPartyRuntime`)
`createPartyRuntime` (townBridge.ts:67) is already scene-agnostic except for `viewGate`, the island-only `partyLocal` zone maths and
the Indoors filter. Split it:

```ts
export function createRoomParty(ctx: {
  scene: THREE.Scene; room: number;                 // RoomCode (or -1 = island, used by Town via the same core)
  local: () => RoomLocal;                           // {x, y, z, facing, moving, running, busy: boolean, hidden}
  phone: boolean; reducedMotion: () => boolean;
  wake: () => void;                                 // the room's own wake(): called when a SAME-ROOM friend's pose arrives
  viewGate?: { addUnitRoots(r: THREE.Object3D[]): void };
}): RoomParty | null;                               // null when multiplayer is off / not allowed / no stored party
interface RoomParty { update(dt: number, nowMs: number, camera: THREE.Camera): boolean /* friends still settling: keep frames */;
  friendsHere(): Iterable<RemotePose>; dispose(): void }
```
- Reuses `createRemoteAvatars` (one `playerBatch` capacity 8, one instanced ring, labels <= 8, `remoteCap` 5/5/3/1/0, Battery saver 0),
  `createInterp`, the store, Hide / Mute filters (`setHiddenFriends` / `setMutedFriends` stay module level in townBridge, move with
  it), `fillLocalBody` -> a sibling `fillRoomBody` that writes `roomBody(...)` and Busy-in-room (no freezing at an outdoor anchor:
  the room spot IS the anchor).
- **Filter:** `onPoses` pushes only when `roomOf(body) === ctx.room` into interp; others update only the store (roster text).
- **Loop wake (the heat rule for rooms).** Islands never wake on network; rooms must, or a still kid never sees a friend walk in.
  Rule: a same-room pose that *changed* calls `ctx.wake()`; the room keeps frames while `update()` returns true (any same-room
  interpolator still moving or fading, at most 300 ms after the last change); otherwise it sleeps as before. Remote-only frames
  run at **20 fps on phones** (the Kit Shop's `npcOnly` precedent, shopScene.ts `frameMs`), the room's normal cap when the local
  player moves. Battery saver: no remote wake at all (the roster still updates).
- **Beat while covered.** When a room is covered (overlay, game, studio) its loop stops; like the island's `SLEEP_SAMPLE_MS` trick,
  `conn.onBeforeBeat` sends the Busy room pose from the beat tick (no new timer).
- **Labels / rings / emote bubbles:** as on the island (sizeAttenuation off, so ortho cameras are fine; `LABEL_RANGE` 25 m covers
  every room). The local colour ring replaces each room's own `disc(.42)` / shadow under the player while live (as `meRing` does).
- **Lighting:** the batch's bean material is lit by the room's lights; check the instanced beans against each room's palette in the
  verify pass (the remote layer has only ever rendered under island lighting). Risk: low.

### 3.3 UI in rooms: `components/party/RoomPartyChip.tsx` (new, light)
Do **not** mount the full PartyHost (423 lines, invite / code entry / host controls, island-gated by `islandReady`). Rooms get a
small chip: the party colour dot + "3 friends here" + the existing `EmoteWheel.tsx` (6 emotes, same rate limits), and a tap opens
the read-only roster with the same `memberActivityLine`, Hide / Mute and Leave. Host controls (kick, lock, new code, end) stay on
the island in v1 (open question 6.3). The chip sits in the room HUD's top-right slot (`docs/ui/HUD_STACK.md` calm-HUD rules), hidden
while the room is covered. Mount lines per room page:
```tsx
const party = useRoomParty(sceneRef, RoomCode.Konbini);   // creates/disposes createRoomParty with the scene
{party && <RoomPartyChip party={party} />}
```
Emotes in rooms: the wheel plays the local emote on the local rig (each scene exposes its rig; arcade already has `wave`,
`applaud`, `celebrate` reactions), no camera change (rooms have fixed follow cameras; the island's emote zoom does not apply).
Friend-pair emotes (high five) pick from `friendsHere()` only.

### 3.4 Busy inside rooms (force field in the room)
| Room | Busy when (existing flags) | Others see |
|---|---|---|
| Konbini | `overlay`, `reveal`, `packReveal`, `talking`, `stampsOpen`, shelf zoom, eating | field at the spot; "At the counter" / "Looking at the shelves" / "Having a snack" |
| Museum | `guideOpen`, `cert`, `balls`, `experience`, exhibit zoom | field at the exhibit; "Looking at <exhibit>" |
| Arcade | a running `game`, `list`, `hall` | field at the cabinet: "Playing Striker"; the Hall: "Looking at high scores" |
| Shop | `studio`, `myKit`, `talking` | field at the studio stand: "Designing a kit" |
Rule as on the island: no emotes to or from a busy friend; walking into their field nudges you out (rooms already have `collide()`;
add the field as a circle obstacle r 0.6 m).

### 3.5 Shutdown
Leaving a room page = page unload: the layer disposes, the connection is **not** closed (party-persist), the next page resumes
the slot. Only explicit Leave / End (chip or island PartyHost) or the grown-up switch (`multiplayerAllowed`) closes it.

---

## 4. Per-room notes and risks

**Konbini (Phase 1).** 15 x 12 m, ortho camera, sleeps when still: the cleanest first room. Purchases, stamps, eating, the ball
toy (`konbiniBall.ts`) and the clerk greeting stay **per player** (local saves, local economy; nothing shared, nothing to sync).
Two kids at the counter both see the clerk talk to *them*: fine. Variants: `main` and `cay` are different room codes, so friends in
the other Konbini are roster-only. Risk: the door walk-in animation (`doorOpen`, `leaving`) is local; a friend arriving appears at
the door (Warp fade). Busy on shelf zoom keeps the field small (the room is small: field r 1.15 m covers an aisle; use r 0.8 in
rooms).

**Museum (Phase 2).** Largest room (~33 x 26 m with the west wing). Everyone sees everyone (no rooms within the room). Exhibit zoom
and experiences = Busy at the exhibit. Later: "Look with me" (a friend's zoom target shown as a small pointer; needs a wire field:
out of scope). Risk: the guide Ada + up to 5 friend rigs on a phone: within the cap; the hall is ortho, so frustum culling helps
little: verify draws.

**Arcade hub (Phase 3).** Most social room and already the warmest (15 fps floor, attract demos, crowd 3/5). Heat-neutral trick:
**friends replace crowd NPCs** (`createArcadeRoomCrowd` count = max(0, base - friendsShown)): the rig count on screen never rises.
A game in progress is single player: the room is replaced by the game (`game` state), the layer sends Busy at the cabinet from the
beat tick, friends in the hub see "Playing Pinball". Multiplayer games are out of scope. Risk: the arcade's own social routines
(`arcadeSocial.ts`, keep-ups with NPCs) must not target friends (local-only).

**Kit Shop (Phase 4).** Floor shared; studios are covered overlays (Busy). Live try-on is NOT shared in v1 (the look is sent only in
Hello). With relay v1.1 item 5, the new outfit shows the next time the friend changes page (resume Hello carries the new look).
Truly live outfits would need a `C.Look` message: out of scope. Shoppers: reduce by friends shown (as the arcade).

**Explore reefs (Phase 5, optional).** Not a page: the dive room is its own `THREE.Scene` inside Town (`diveRoom.ts:191`) with a
room-local frame (radius 24 m). Same spot = same instance (room code 40 + `area`). Work: Town's runtime switches `room` to the spot
while diving, re-parents `avatars.root` into the dive scene, sends `roomBody(..., Mode.Dive)`, and island viewers draw a reef
friend as today's Busy field at the spot's surface buoy (new clients map code -> `spot.surface`; old clients just see Indoors and
fade). The reef zone friends / whale / sparkle stay per player. Risk: the dive scene is already the heaviest water scene; cap
remotes at 3 there on phones. Value is real (swimming together) but it is the costliest slice: build last or cut.

**Vending zoom, fishing, lessons, quiz, map, settings, wardrobe.** Stay Busy with a field (exists). No shared avatars: they are
full-screen, short, and single player by nature.

---

## 5. Phases

Agent-hours = one agent's wall time. Every phase: build agent, then a fresh verify agent (token rules). Tests are `tests/*.cjs`
(the repo's style; `ts.transpileModule`, so `as const` objects, no `const enum`).

### Phase 1: room layer + Konbini (first slice) - effort M, ~10 h build + 3 h verify, **no relay redeploy**
- Files: new `multiplayer/protocol/rooms.ts`; `multiplayer/protocol/index.ts` (export); `lib/multiplayer/presence.ts`
  (`fillRoomBody`, entry Warp + 5.5 s retry, `roomText`); `lib/multiplayer/store.ts` (room field); new
  `lib/multiplayer/roomParty.ts` (core moved from `townBridge.ts`, which keeps island glue); `lib/graphics/remoteAvatars.ts` (accept
  "same room" friends with zone Indoors: skip the door fade when `roomOf === myRoom`; field r option); new
  `components/party/RoomPartyChip.tsx` + `useRoomParty`; `components/party/PartyHost.tsx` (`memberActivityLine`); `KonbiniRoom.tsx`
  + `konbiniScene.ts` (expose `scene`, `camera`, `wake`, local pose; render the layer in `tick`).
- Tests: `tests/mp-rooms.cjs` (encode / decode, band, old-client `parseServer` + old relay `clampPose` accept every room body,
  warp-retry against a fake-clock RoomCore, roomOf filter), extend `tests/mp-client.cjs`, `tests/mp-avatars.cjs` and `tests/mp-isolation.cjs`.
- Verify: two browser contexts (dev relay `multiplayer/dev-relay/server.mjs`), both in the Konbini, one on the island; one phone +
  one desktop screenshot.
- Risks: the warp-drop case; Konbini loop wake/sleep regressions; party-persist not merged yet (stub the resume behind its API).

### Phase 2: Museum - effort S, ~3 h + 2 h verify
`MuseumRoom.tsx`, `museumScene.ts` (expose scene/camera/wake, exhibit lookup for the station line). Risk: draw count in the big
hall.

### Phase 3: Arcade hub - effort M, ~5 h + 2 h verify
`ArcadeRoom.tsx`, `arcadeRoomScene.ts` (layer in `tick`, Busy at the cabinet while `game`), `arcadeRoomCrowd.ts` (count minus
friends). Risk: the 15 fps floor means remote frames are free here, but the crowd swap must not pop NPCs (fade them at their
station).

### Phase 4: Kit Shop + relay v1.1 - effort S-M, ~4 h shop + ~4 h relay + 2 h verify, **relay redeploy (owner, `wrangler deploy`)**
`ShopRoom.tsx`, `shopScene.ts` (shoppers minus friends); relay items 2.3.1-5 in `multiplayer/protocol/limits.ts`,
`multiplayer/relay/src/roomCore.ts`, `multiplayer/dev-relay`; tests `tests/mp-room-core.cjs` and `tests/mp-protocol.cjs`. Deploy order: relay first (it is
backward compatible), then clients. Risk: `S.Joined` re-broadcast on resume with old clients (test before deploy).

### Phase 5: Explore reefs (optional) - effort L, ~10-12 h + 3 h verify, no relay change (v1.1 nice to have)
`Town.tsx` (runtime room switch), `lib/town/water/diveRuntime.ts`, `lib/graphics/diveRoom.ts` (host the friend layer), surface
proxy on the island. Risk: dive-room heat; Town.tsx is large and shared by every lane (merge conflicts).

### Go / no-go per phase
**Phone heat** (measure with each scene's `state.frames`, `state.draws`, `render.calls`, 4x CPU throttle, plus the owner's
two-iPhone run from `multiplayer-design.md` 4.7):
- [ ] Room idle with 2 still friends: 0 rAF after 0.5 s (sleeping stays true).
- [ ] Remote-only motion runs at <= 20 fps on phones; stops <= 300 ms after the last friend stops.
- [ ] Per extra avatar ~0.12 ms CPU (island measurement); 3 walking friends p95 frame <= 33 ms at 4x.
- [ ] Draw calls +<= 3 (one batch, one ring, labels) plus at most one field mesh; no shadow casters added.
- [ ] Caps follow `remoteCap`: 5/5/3/1/0 by tier, Battery saver 0 and no remote wake; Arcade / Shop rig count does not rise (NPC swap).
- [ ] Bandwidth: still ~1 KB/s down per client with 5 friends.
**Child safety** (nothing new):
- [ ] No chat, no new free text on the wire (room codes are numbers; station names are looked up locally).
- [ ] Same host controls (kick revokes the slot everywhere); Hide / Mute apply in rooms.
- [ ] A room instance is per party: only party members ever appear; strangers never share a room.
- [ ] Emote rate limits unchanged; no emotes to / from busy friends.
- [ ] The grown-up switch Off leaves the party from any room.

---

## 6. Recommendation

**Build order:** Phase 1 (Konbini + layer) -> 2 (Museum) -> 3 (Arcade hub) -> 4 (Kit Shop + relay v1.1). That covers every room the
owner named with ~30 agent-hours and one relay deploy. Phase 5 (shared reefs) only if the owner wants it after seeing 1-3.

**Cut / keep Busy:** arcade games in progress, shop studios, museum experiences, Konbini shelf zoom / eating, vending zoom, fishing,
lessons and menus stay **Busy with a force field** (no shared avatars): single player by nature, full-screen, short, and sharing
them would mean new wire fields. Live outfit preview and "Look with me" are cut from v1.

### Open questions for the owner
1. Is "friends in the same room appear, everyone else is a line in the list" the experience you want, or should island friends
   also see a hint at the door (e.g. a small "3 in the Konbini" sign)? (Cheap: client-only.)
2. Shared reefs (Phase 5): worth ~12 agent-hours and some dive-room heat, or keep "Exploring the reef" as a field?
3. Host controls in rooms: chip with Leave only (recommended v1), or the full host sheet (kick / lock / end) in rooms too?
4. Two Konbinis: should friends in the Cay Konbini and the main one see each other (one shared room) or not (recommended: not)?
5. OK to schedule the relay v1.1 deploy (Phase 4) after Phase 3 ships, with `party-persist`'s relay changes in the same deploy?
