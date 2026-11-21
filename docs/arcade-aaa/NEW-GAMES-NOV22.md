# Arcade release of Nov 22 2026: Flick It, FootGolf Island, Pop-Up Shot and the Claw Club

Released on branch `release-games4` (from origin/main 68b88309; merges `game-footgolf`, `game-flickit`, `claw-machine`, `game-popup`,
then the site branch `site-games4`). The owner approved releasing all four together. The arcade has **fifteen** machines:
thirteen, minus Hold the Line, plus Flick It, FootGolf Island and Pop-Up Shot. The claw machine is not counted as a game.

## The games
- **Flick It** (`flickit`): flick the ball at targets in six places, curl it round walls. Doc: `flickit-direction.md`.
- **FootGolf Island** (`footgolf`): nine holes of footgolf round the island, par 34. Doc: `footgolf-direction.md`.
- **Pop-Up Shot** (`popup`): volleys and headers at pop-up targets in five arenas. Doc: `popup-direction.md`.
- **Claw Club** (lib/claw): the 3D claw machine that already stands in the room; 10 coins a try, 12 tries a day, toys go to the
  gashapon collection. Doc: `docs/performance-guide.md` ("Claw Club").

## Where they stand in the room
| Machine | x | z | yaw | Notes |
| --- | --- | --- | --- | --- |
| Pop-Up Shot | 12.85 | 5.2 | -Math.PI/3 | Hold the Line's cabinet spot on the east wall |
| Flick It | -12.75 | -5.45 | +Math.PI/3 | west wall, between the back row and the air hockey table |
| FootGolf Island | -13.85 | -3.45 | +Math.PI/3 | west wall, beside the air hockey table |
| Claw Club | -12 | 8 | +Math.PI/3 | unchanged |

The west pair mirrors the east pair (same upright cabinet, no new model or texture). It stands where the **north lounge sofa** stood
(sofa, side table and its multiplayer "lounge" area removed; the south lounge stays). A first try by the Claw Club was moved: from the
room camera the claw machine hid FootGolf's console. Clearances are pinned in `tests/arcade-room-crowd.cjs` ("west wall"): 0.71 / 0.70 m
to the nearest collider, walk-up spots clear.

Room cost (headless Chrome, `renderer.info` per frame; desktop numbers, not an iPhone temperature claim):
| View | Before (claw merged, 13 machines) | After (15 machines) |
| --- | --- | --- |
| Phone 390x844 at the door | 56 calls, 189k triangles | 55 calls, 202k triangles |
| Desktop 1440x900 at the door | 89 calls, 209k triangles | 93 calls, 222k triangles |
| Phone at the west pair | - | 78-80 calls, 198-205k triangles |
| Desktop at the west pair / east wall | - | 115 / 103 calls |
Screenshots: `.claude/worktrees/_recovery-nov20/release-games4/room/`.

## Hold the Line (retired)
Pop-Up Shot took its machine. Retired the way Clear the Box was: the game code, skin, browser check and tests are deleted
(last version on origin/main 68b88309); the board id `holdtheline` and its rule stay in `BOARD_GAMES` and in the SQL allow-list so old
scores stay valid; its coin id and cap stay as the wallet clamp; the analytics label reads "(retired Nov 22 2026)" and
`arcade_holdtheline` stays in the ingest allow-list; its device save key stays in the cloud snapshot. Old `/arcade?game=holdtheline`
links open Pop-Up Shot. The site side (page, redirect, media) is in "Site" below.

## Migrations
Renumbered so each is unique and in order, each newer copy a superset of the ones before: Flick It `20261211/20261212`, FootGolf
`20261213/20261214`, Pop-Up Shot `20261215/20261216` (was 20261211/12 on its branch). NOT applied.

## The SQL to paste
`docs/arcade-aaa/new-games-nov22-supabase.sql`, once, in the Supabase SQL editor (idempotent, additive). It replaces the per-game files
(deleted). The last row must read **"OK, Flick It, FootGolf, Pop-Up Shot and the claw machine installed"**. It sets the arcade_scores
allow-list to exactly `BOARD_GAMES` (every earlier id, `holdtheline` included, plus `flickit`, `footgolf`, `popup`) and analytics_ingest
with every earlier key plus `arcade_flickit`, `arcade_footgolf`, `arcade_popup`. The claw machine needs no key (it is time in the
arcade room, `arcade_lobby`; plays are saved with the gashapon collection). Until it is pasted, scores save on the device only.

## Site
SITE_SECTION

## Weak spots that need a real phone and a real child
- **Flick It:** swipe speed range, lift from swipe length, curl dead zone and aim gain come from synthetic swipes; heat 16-19 draws.
- **FootGolf Island:** drag gain (38% of the short side = full power), kick ranges, cup speed, the 8-kick pick-up; 30 fps heat.
- **Pop-Up Shot:** flick feel and target timing from bots; the stadium crowd may run hot on a phone (crowd LOD is the fallback idea).
- **Claw Club:** joystick feel and the drop timing on touch; the win rate (about half for a careful aim) is from the physics test.
- **The room:** the west pair is new; worth one walk past on a real phone (Play prompt, walk-up spots, nothing hidden).
