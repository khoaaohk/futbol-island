# Arcade load baseline (Nov 11 2026, before the loading fixes)

Production build (`NEXT_DIST_DIR=.next-agent-load next build`, `next start -p 8148`), measured with
`node scripts/check-arcade-load.cjs --port=8148`: one cold, cache-disabled load per URL on a 390x664 phone (DPR 3, touch),
Chrome headless with CDP network throttling. **slow** = 400 kbit/s down/up, 400 ms RTT; **fast** = Fast 4G (≈8.1 Mbit/s down,
165 ms RTT). "Playable" = every loading card gone and the first tap target visible and enabled (room: the walkable canvas after
the room's first draw; games: the start card's Play button). KB are transfer sizes. "Generations" = initiator depth of JS/CSS
(HTML = 1, a chunk the HTML lists = 2, a chunk loaded by that code = 3). Single runs; the machine was busy with other agents,
so treat ±0.3 s as noise.

First Load JS (build output): `/` 145 kB, `/arcade` 199 kB, `/play` 161 kB, shared 101 kB.

| URL | profile | first paint s | playable s | KB by playable | KB total (+3 s) | requests | generations |
|---|---|---|---|---|---|---|---|
| `/arcade` | slow | 3.10 | 23.32 | 991 | 991 | 54 | 3 |
| `/arcade?game=kitrush` | slow | 2.98 | 21.06 | 691 | 1011 | 58 | 3 |
| `/arcade?game=snake` | slow | 3.05 | 21.07 | 695 | 1014 | 58 | 3 |
| `/arcade?game=runner` | slow | 3.08 | 26.59 | 1213 | 1220 | 62 | 3 |
| `/arcade?game=tennis` | slow | 3.09 | 26.61 | 1213 | 1220 | 62 | 3 |
| `/arcade?game=pinball` | slow | 3.04 | 26.74 | 1220 | 1220 | 62 | 3 |
| `/arcade?game=puzzle` | slow | 3.07 | 25.02 | 1122 | 1130 | 64 | 3 |
| `/arcade?game=airhockey` | slow | 3.08 | 20.48 | 690 | 1009 | 58 | 3 |
| `/arcade` | fast | 0.44 | 3.82 | 991 | 991 | 54 | 3 |
| `/arcade?game=kitrush` | fast | 0.44 | 2.78 | 1011 | 1011 | 58 | 3 |
| `/arcade?game=snake` | fast | 0.44 | 2.79 | 1014 | 1014 | 58 | 3 |
| `/arcade?game=runner` | fast | 0.44 | 3.01 | 1220 | 1220 | 62 | 3 |
| `/arcade?game=tennis` | fast | 0.44 | 3.02 | 1220 | 1220 | 62 | 3 |
| `/arcade?game=pinball` | fast | 0.44 | 3.05 | 1220 | 1220 | 62 | 3 |
| `/arcade?game=puzzle` | fast | 0.45 | 3.10 | 1130 | 1130 | 64 | 3 |
| `/arcade?game=airhockey` | fast | 0.45 | 2.79 | 1009 | 1009 | 58 | 3 |

The slow profile is bandwidth bound (about 50 KB/s): the waterfall is only 3 generations deep, so the time is the bytes.

## Largest files (gzip transfer) and what is in them

| file | KB | contents | who needs it |
|---|---|---|---|
| `b536a0f1-*.js` | 167 | three.js | room, 3D games, Pass Puzzles; **also every 2D game** (see below) |
| `8599.*.js` | 196 | ArcadeGame3D + all three 3D scene factories (tennis, pinball, runner) and their cards | one 3D game at a time |
| `67625-*.js` | 145 | the island bean rig (`lib/graphics/player.ts`, costumes, poses) | room, 3D games, puzzle, party avatars |
| `51966-*.js` | 62 | multiplayer party layer (room party, public world, protocol) | party only |
| `45962-*.js` | 50 | island data reached through the rig: `player.ts → jobPoses → jobMoves → jobRules → market/goods → beachcombing` | nothing in the arcade uses it |
| `72024-*.js` | 21 | `coinQuest.ts` text via `arcadeStage → islandArcadePlayer → customization` | as above |
| `59316-*.js` | 14 | club costume facts (`costumes.ts`) via `player.ts → clubCostume` | as above |
| `1787.*.js` | 84 | Pass Puzzles | puzzle |
| `fd9d1056`, `52117` | 54, 33 | React / Next runtime | all |
| css `0e87ef…` | 16 | tennis + pinball skins, TennisCourtPicker, RunnerMenu, RunnerControls, PinballCard CSS | 3D games; also loaded by the 2D games |
| css `b91ee2…` | 15 | PassPuzzleGame + Strikers skin CSS | puzzle; also loaded by every other game |

## Waste found

1. **The party layer on every load (biggest).** `ArcadeRoom` called `useArcadeRoomParty()` at mount; with `NEXT_PUBLIC_MULTIPLAYER=1`
   it imports `lib/arcade/arcadeRoomParty.ts`, which statically pulls three.js, the bean rig and the multiplayer client
   (≈ 500 KB gzip). A deep link to Kit Rush, Squad Snake or Air Futbol (no three.js of their own) downloaded it in parallel with
   the game and only became playable after ~690 KB instead of ~470 KB; the room and the 3D games shared the bandwidth with it.
2. **All three 3D games in one chunk.** `ArcadeGame3D` imported the dispatcher `lib/arcade/arcadeGames.ts`, so tennis, pinball and
   runner each downloaded the other two scene factories.
3. **The game download started only after hydration** (a `useEffect` read `?game=`), not when the page code arrived.
4. **CSS merged across games** by Next's `CssChunkingPlugin` (always on in production; merges CSS chunks to ≥ 30 KB) together with
   `components/games/skins/index.ts` importing all eight skins: a 2D game downloads ≈ 31 KB of 3D / puzzle CSS.
5. **Island data through the shared rig** (≈ 85 KB gzip: beachcombing, coin quest, club costume facts) in every three.js load.

Checked and fine: a deep link does not load or initialise the room scene (`import('@/lib/arcade/arcadeRoomScene')` runs only when
no game is open); the 2D games' own code never imports three.js; leaderboards, Today, high-score entry, Gashapon and the Hall are
lazy (`next/dynamic`); no audio is fetched before Play; images before Play are only `entry-grain.png` (21 KB) and the IslandBrush
font (25 KB, preloaded, used by the loading card).
