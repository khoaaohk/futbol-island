# West Stadium: build plan

Owner request (Nov 12 2026): push the island west and add a walkable outdoor stadium in a landscaped park. Approved concept:
scratchpad `west-stadium/index.html`. Branch `stadium` (never pushed from an agent). Heat rules (AGENTS.md) apply to every
phase: static geometry goes into the 50 m chunk batches, nothing animates off screen, on-demand loading, bounded work.

## Layout (single source: `lib/town/westParkLayout.ts`, no three.js)
- Coast: `lib/town/shoreline.ts` anchors; west anchors pushed ~230 m (coast at x ≈ -332). East of x -72 unchanged.
- `STADIUM` centre (-205,-30), long axis N–S, bowl 124 × 164 m, pitch 63 × 100 m. `STADIUM_GATE` east side (x -143).
- `STADIUM_PLAZA` x -140…-52, z -52…-8 (fan walk from the x -45 street / Old Town). `PARK_POND` (-150,72).
- `PARK_PATHS` (Béziers), `BOWL_RING`, `PARK_LAWNS`, `PARK_GROVES`, `inStadiumFootprint()`.

## Phase 1: land, park, plaza, map (DONE on this branch)
- `shoreline.ts`: anchors, `WEST_BEACH_X`, 9 m beach ribbon west of x -110, lawn kept 8 m behind it (`INTERIOR_GRASS` blend).
- `simulation.ts`: `ISLAND_BOUNDS.minX` -336, `WEST_WATER_MARGIN` 80 (flight/map edge x -416). `flightOutline.data.ts`
  regenerated (`node scripts/generate-flight-outline.cjs`). `lib/graphics/islandShore.ts` bake rect from x -422 (+26% texels,
  once at mount).
- `seaLifeAreas.ts` (west whale/rays, north eagle ray), `fishing/fishSpots.ts` West Cove moved to the new coast (x -324.5).
- `westPark.ts` (`buildWestPark`, `buildStadiumPlaceholder`), called from `world.ts` after `buildCoralCay`. CORNER DELI and
  PRAÇA HOMES removed (their scheme/shape draws kept so other houses keep their looks); z -55 bunting removed.
- `world.ts`: west chunks (cx ≤ -3) behind one frustum-box region gate (`westRegion`, like the cay/isle gates).
- Map: `components/IslandOverview.tsx` (bowl, pitch, gate, plaza, paths, pond, lawns, groves; STADIUM / PLAZA / PARK / WEST
  BEACH labels). Travel map widens automatically (FLIGHT_BOUNDS).
- Tests: `tests/west-stadium.cjs` (new); updated town, coral-cay, admin-analytics-places, island-connectivity grid.

## Phase 2: stadium structure (DONE on this branch: `stadiumSeats.ts` data, `stadiumWorld.ts` build, `stadiumSit.ts` runtime)
- Built: 4 stands, open corners. 10 rows (1.3 m deep, 0.5 m rise: too tall to step, so you climb the aisles: 2 treads of 0.25 m per
  row), a 4 m concourse one tread above the top row (5.25 m), straight back stairs to the park (20 treads), rails as roof props
  (stand ends, concourse back, stair sides: only a walker at their height). East stand split by the gate (14 m gap, ground level,
  arch + turnstiles) onto the pitch-level ring; board ring colliders keep their 1–3 m gaps. Long stands roofed (a plain box, so
  the canopy pass makes it landable from the sky). Screen frame behind the south stand, 4 static floodlight masts.
- Seats: a computed grid (5,250 seats; `nearestSeat`, occupied set for phase 5), strips per row and block in team colours.
  "Sit" (HUD arbiter key `stadium-seat`) snaps, bench pose, stand-view camera; stick / keys / Stand up / ride / teleport get up.
- Sponsors: `ensureStadiumSponsors(scene, stadiumSponsorLayout())` within SPONSOR_LOAD_RADIUS (group at the centre spot,
  y -0.045); `countStadiumVisit()` walking in through the gate. Plaza flags get a vertical banner under the team flag.
- Cost: +3 west chunks (66 → 69 draw calls with all the west in view), +19.7k triangles (50.9k → 70.6k), no texture,
  material or per-frame work (sponsor art: its own 2 draws + 1 atlas, lazily). No LOD needed at this size.
- Seated view: the camera's far plane comes in to 175 m while seated (the level view across the island was 925 draw calls on
  desktop without it). Headless Chrome (dev server, not a device): plaza looking west 71 draws / 84k tris desktop, 53 / 60k phone;
  seated 68 / 92k desktop, 50 / 70k phone. No iPhone heat measurement.
- Not done: drag-to-look while seated; crowd; tunnel (the gate and corners are the ways in).

Original plan:
### Phase 2: stadium structure (`lib/town/stadiumWorld.ts`, `lib/town/stadiumSeats.ts`)
- Replace `buildStadiumPlaceholder`: 4 stands (open corners), walkable concourse behind/under each stand, stairs + aisles as
  `walkSurfaces` (world.ts already collects `walkSurfaces` / `landableDecks.ts` for raised decks; rooftop stairs in world.ts are
  the pattern), handrails as obstacles, roof over the long stands (fascia = sponsor slot 4).
- Seats: a seat grid per stand (pure data, `stadiumSeats.ts`): nearest-seat lookup, "Sit" prompt, seated pose
  (`lib/graphics/npcSeatPose.ts` / `npcStandUp.ts` patterns), camera faces the pitch centre (`lib/town/emoteCamera*.ts` /
  `liveJoinCamera.ts` patterns). Seat rows drawn as one InstancedMesh per stand side (not 1 mesh per seat).
- Gate arch (sponsor slot 3), turnstile props. Collision: `obstacleGrid.ts` handles the extra colliders.
- Keep the bowl in `inStadiumFootprint`; trees already stay out.

## Phase 3a: the stadium as a live venue (DONE on this branch)
- `STADIUM_VENUE` ('stadium', West Coast Stadium, 63 × 100 m at (-205,-30), 7.32 × 2.44 m goals) is in `LIVE_VENUES` only (lessons,
  quests, coin routes, `fieldSurfaceHeight` untouched). `LiveFormat` gains 'stadium'; `simFormat()` maps it to the 11v11 rules in
  `MatchSim` (squads, tuning, AI, human knobs, shirt numbers, position guide); its own goal venue and `elevation` (-0.15) put rigs
  and the sim's goal frames on the stadium grass (y -0.045). Joinable (`LIVE_JOIN_FORMATS`), Play-only bar like the beach court
  (`PLAY_BARS` in Town, no lesson path in `FieldPathCard`), red v blue kits (`BIB_COLOURS.stadium`, team names Red / Blue).
- Wire: `MATCH_FIELDS` / `NET_FIELDS` append 'stadium' (id 5). **Relay redeploy needed** for shared stadium matches (its validator
  accepts field < MATCH_FIELDS.length); until then a stadium match stays on the phone, and old clients drop field 5.
- Analytics: `LIVE_MATCH_FORMATS` + 'stadium' (`lm:stadium_*` counts pass the SQL key regex; no migration). The heat-map place
  `stadium` is still phase 7 (needs an ingest allow-list migration). Match o'clock rotation unchanged (owner decision: add the
  stadium? changing the rotation re-maps hours for clients on the old build).
- Real goals: `fields.ts goalGeometry()` shared; the stadium frames are painted into the chunk batch, both nets one LineSegments
  (+1 draw in view), side/back net colliders. Seat backs: low strip + one quad per seat (2 tris, merged): +10.5k tris, 0 draws.
- Big screen (`stadiumScreen.ts`): 256 × 144 canvas plane in front of the sponsor screen while the stadium match is awake and the
  player is within 190 m; redrawn only on a goal / new minute, at most 1 Hz. `setScreenSponsor(false)` during the match.
- Seats: the prompt says "Sit and watch" while the match runs; the stand view's look point eases toward the ball (70 %, rate 1.6/s).
  Portrait phones use a raised view (3.6 m back, 4 m up, aim 2 m lower): the head no longer covers the bottom.
- Map / travel: "STADIUM GATE" destination (`STADIUM_ARRIVAL`, plaza 8 m east of the gate, facing it).
- Cost (headless Chrome, dev server, no device heat): west chunks 69 draws (unchanged) / 81.8k tris (+11.2k). Seated in the north
  stand with the match on: desktop 96 draws / 228k tris, phone 49–70 / 141–151k; the same session at Eleven Park's touchline: desktop
  232 / 266k, phone 111 / 142k. The rise over phase 2's seated numbers is the 22 match rigs (the same as any island match).

## Phase 3: watching games
- Today: pitches are `VENUES` / `LIVE_VENUES` (`venues.ts`); live matches run in `fieldRuntime.ts` + `liveJoin*.ts`, sim in
  `lib/town/match/matchSim.ts` (`elevenAI.ts` for 11v11), sync in `lib/multiplayer/sharedMatch.ts` / `matchLink.ts`, focus and
  far-match freezing in `matchFocus.ts` (Town passes `fieldSession`; "far matches hold still").
- Add a `'stadium'` LiveVenue (11v11, `x:-205,z:-30`, width/length from the pitch) to `LIVE_VENUES` only (not `VENUES`, so
  lessons/quests/coin routes do not move). Check every `LiveFormat` switch (`grep -rn "LiveFormat\|'beach'" lib components`).
- Big match: join from the gate or watch from a seat (seated players count as spectators, not squad).
- NPC exhibition matches when no live game is on: reuse the AI-only match path the island pitches use when idle; runs only while
  the stadium is in view (west region gate + `matchFocus`), paused otherwise. Crowd: a few instanced low-poly fans, no animation
  off screen.
- Big screen (sponsor slot 2) shows score/time from a 256 px canvas updated on goals/minute only.

## Phase 4: sponsor slots
- One 2048 × 1024 atlas (`public/sponsors/atlas.webp`) + `lib/town/sponsorSlots.ts` (UV rect per slot): pitchside board ring
  (16 panels, one InstancedMesh with per-instance UV offset), big screen, gate arch, roof fascia, plaza flags (14, replace the
  current flat colours), centre-circle logo (decal). Small "Sponsor" label baked into each panel.
- Placeholder Futbol Island art now; `/admin` swap later (`app/admin/*`, upload → rebuilt atlas, cached, loaded on demand when
  the west region first becomes visible).

## Phase 5: multiplayer
- Public world: the stadium is Zone.Main land (no relay change for position). The relay has no island bounds
  (`multiplayer/protocol/limits.ts` WORLD_BOUNDS ±4–10 km; interest is nearest-N / LIVE_RANGE_M 40 m by distance), so the new
  land needs no relay change.
- Seated pose for others: `Mode` (`multiplayer/protocol/types.ts`) has no Sit; add `Mode.Sit` (protocol minor bump, old
  clients map unknown modes to Idle) or encode via activity; `lib/graphics/remoteAvatars.ts` draws the seated pose.
- Big match join/watch through the existing shared-match flow (`sharedMatch.ts`).

## Phase 6: copy
- "No ads" wording appears in 19 files (`grep -rlE "No ads|no ads" app components lib`: privacy, about, marketing, llms-full,
  play page, GrownUps, TitleActions…). Sponsor boards are ads: owner decides the new line (e.g. "No ads in your way: just a few
  sponsor boards round the stadium, never pop-ups or videos"). Update privacy + llms text together.

## Phase 7: heat and QA
- Measure on a phone: draw calls/triangles at the plaza looking west, from a seat, and from the east island looking west
  (west gate should hide everything). Real-device heat only from a device.
- Analytics heat-map: `lib/analytics/islandIds.ts` GRID starts at x -160, so the new land is not sampled. Do NOT move x0
  (stored cell indices would shift); append west cells after CELL_COUNT (check SQL caps in `supabase/`), add a `stadium`
  place to `lib/analytics/islandPlaces.ts` and `app/admin/IslandHeatmap.tsx`.
- Full `npm run test:quiet`, tsc, eslint; play-through: walk Old Town → plaza → gate → pitch → seat; fly the coast.

## Risks and checks (phase 1 status)
- Save positions: old saves in the former west sea (x -99…-152) now load on land; `islandReturnPosition.ts` accepts
  FLIGHT_BOUNDS (wider). OK.
- Arrival spots / travel: map destinations are named points east of x -72; unchanged. A STADIUM travel destination is phase 2/3.
- Fishing: West Cove float moved; kiosks/backdrops derive from the spot. `fishing*` tests pass.
- Boats, ferry, lighthouse, East Jetty, Coral Cay, Summit Isle: all east; unchanged.
- Map bounds / minimap: FLIGHT_BOUNDS minX -416 widens the travel map ~26%; `IslandTravelMap.tsx` derives from it.
- Camera far plane 500 m, fog: from the west beach the east coast is ~580 m away and fades; acceptable.
- Ocean plane (2100 × 1700, centre x 350) reaches x -700: covers the new west sea.
- Shore bake: +26% texels, one-time at mount; foam strip tiles are frustum-culled.
- Lamps, traffic, ground decals follow `onIsland` / road data automatically; no new roads in phase 1.
- Pre-existing failures (quarantined, not caused here): night-atmosphere "bounded pool size", field-light-collisions.
