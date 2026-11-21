# Three new arcade games (Nov 21 2026): owner handover

Branch `games-nov21` holds all three, merged and verified together. None is in the arcade room yet (`arcadeUnplaced` in
`lib/arcade/arcadeCatalog.ts`): every "eleven games" line is unchanged and their /games pages are built but noindex and linked from nowhere.

## The games
- **Safe Hands** (`safehands`): you are the goalkeeper. Set your position, read the striker's planted foot and lean, then swipe to dive.
  Four rounds from Sunday league to a Cup final in the rain, and a Daily Shootout. Doc: `safehands-direction.md`.
- **Keepy-Uppy Beat** (`keepyuppy`): juggling to music. Tap the foot, thigh and head pads as each ball lands, on the beat; six tracks,
  six real tricks and a weak-foot part. Doc: `keepyuppy-direction.md`.
- **Hold the Line** (`holdtheline`): you are the back line. Drag to step up together and catch the runner offside (judged when the ball
  is played, against the second-last defender), drop, slide, press. Ten teams, then the Island Premier at night. Doc: `holdtheline-direction.md`.

## Try them
On a local dev server (your own port, e.g. `NEXT_DIST_DIR=.next-try npx next dev -p 9040`):
`/arcade?game=safehands`, `/arcade?game=keepyuppy`, `/arcade?game=holdtheline`.
Their pages: `/games/soccer-goalkeeper-game`, `/games/soccer-juggling-game`, `/games/soccer-defending-game`.

## To release them (your decisions, in this order)
1. **Room spot for each.** Proposals from the direction docs (check each against `lib/arcade/arcadeRoomProps.ts` and the door):

   | Game | Wall | x | z | yaw | Note |
   | --- | --- | --- | --- | --- | --- |
   | Safe Hands | east | 11.6 | -1 | -Math.PI/2 | mirror of the Air Futbol table (option A in its doc) |
   | Keepy-Uppy Beat | east | 11.6 | 2 | -Math.PI/2 | beside Safe Hands, toward the door: an "east wall pair" |
   | Hold the Line | west | -11.6 | -4.5 | Math.PI/2 | its doc said "mirror of Safe Hands' spot", but that is where Air Futbol stands (x -10, z -1), so this is next to it, toward the front |

2. **One catalog line per game.** In `lib/arcade/arcadeCatalog.ts` move the game's entry from `arcadeUnplaced` into `arcadeCabinets`
   and add `x`, `z`, `yaw` from the table. Every count then reads twelve / thirteen / fourteen and the page is listed everywhere (hub,
   sitemap, llms.txt, Library, drill links, watch page) with no other site edit. Room steps (from the Safe Hands doc): add the id to
   `HALL_MACHINES`, to the coins panel `earning` line, to `arcadeCabinetAttract` TITLES, and update the room tests.
   If the hub share picture should count it, move its row in `docs/seo/build-game-images.py` from UNPLACED into GAMES and re-run it.
3. **Paste `docs/arcade-aaa/new-games-nov21-supabase.sql`** once in the Supabase SQL editor (idempotent; the last row must read
   "OK, Safe Hands, Keepy-Uppy Beat and Hold the Line installed"). Until then scores save on the device and the island board refuses them.
   Do not paste the three per-game files; this one replaces them.
4. **Confirm the raised media caps** in `tests/seo-games.cjs`: public/games top level 2.0 -> 2.06 MB (Keepy-Uppy Beat) -> 2.11 MB
   (Hold the Line's 55 KB share picture; 2,158 KB now). The 21 MB gameplay media cap was not raised (20.84 MB with all three).
5. **After placing:** `node scripts/gen-lastmod.cjs`, `node tests/seo-games-gate.cjs`, the full verify (`npm run test:quiet`, a
   production build with `NEXT_PUBLIC_PUBLIC_WORLD=1`, the suite against it, `scripts/seo-crawl.cjs`), then push.

## Weak spots that need a real phone and a real child
- **Safe Hands:** the tells (hips, approach) are subtle, so most kids will read only the foot and the lean; animation is pose-based;
  the keeper is a 2D bean, not the 3D rig. Swipe feel and dive timing are tuned by bots.
- **Keepy-Uppy Beat:** timing windows (55 / 110 / 170 ms), balls per track and the 24 px swipe are from bots; the default +20 ms audio
  offset on iOS Safari and Bluetooth speakers is untested; Around the World accepts any swipe.
- **Hold the Line:** drag gain, tap radius and wind-up times are from bots, not children; one answer per wave, the keeper is automatic,
  the line is always straight; its sound was checked through the Web Audio graph only.
