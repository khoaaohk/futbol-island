# Pass Puzzles, round 3 (Oct 26 2026)

Cabinet `puzzle`: `components/games/PassPuzzleGame.tsx` (+ css), `lib/passPuzzle/*`, `lib/arcade/passPuzzleScene.ts`. The simplified start menu (one Play, settings chip, 2x5 packs) is kept.

## Audit (short)
Already strong: draw-the-pass with live lane read, Scan, two hint tiers, coach's route, rewind on the fail card, combo callouts, confetti, trails. Gaps: no way to undo a pass while playing, no cinematic weight on the strike or the result, the counter clock was invisible, nothing harder than "Match Problems", the daily never changed character, the hint button was easy to miss.

## Changes
**Hard levels: the Expert tier** (`lib/passPuzzle/expert.ts`, wired through `catalog.ts`)
- Two packs at the top of the map, behind one pink **Expert** tile under the 2x5 grid (the grid itself is unchanged). The tile opens a small sheet with both packs.
- Expert Combos (gate 50 ★): Trap and Hunter (45), Pass Around the Press (82), Fast One-Two (90). Expert Final (gate 66 ★): Switch and Go (61), Four in a Row (74), Set and Switch (79). Numbers are the bot ratings from `scripts/pass-puzzle-curve.cjs`; each pack ramps and opens at <= 65 like the rest of the map.
- What makes them hard: 3-4 pass chains, hunters that press every receiver, recovering defenders, an offside trap, and the counter-attack clock (5-9 s) on four of the six.
- Unlock rules extend the old ones: star gates (core max was 34; core total is 120 ★), first puzzle of a pack open, the next one after a star. Saves are untouched: stars are keyed by puzzle id, the new `replay` setting is optional and read defensively; no version bump. Coins/board use the existing per-puzzle rates.
- One kid-friendly "Big idea" line per new concept (`EXPERT_CONCEPTS`), shown on the brief card and in the play tip before the first pass.
- Daily: on Saturday and Sunday a child who has opened Expert gets a remix of an expert move (pool of 4, each validated by the engine for 60 dates; the tile shows **Hard**). The daily tile also gets a seasonal tint (autumn/winter/spring/summer, CSS only).

**Cinematic beats** (`lib/passPuzzle/cinematic.ts`, new, pure, allocation-free)
- `createCinematic()` owns `timeScale` (0.3-1), `push` (camera lean, 0-0.65) and a reused `focus {x,z}`. Beats: `intro`, `strike`, `arrive`, `goal`, `miss`, `hint`; each has a hard hold cap (<= 0.9 s), slow-mo per attempt is budgeted (1.6 s), the focus moves at a capped speed (gentle whip, no jump), no roll, zoom <= +11.7% (`zoomFor`). `skip()` = 1x and wide at once.
- In play: the strike slows to ~0.4x and leans on the passer, the camera follows the ball down the lane, slows again as it reaches the receiver/defender/keeper, then the goal push-in on the scorer (card after ~0.95 s) or the "So close!" beat with the stop mark on the defender (card after ~0.75 s). Any tap skips; replays keep their own camera.
- Level start: a freeze-frame tour (the carrier, then an open teammate from the Scan), then wide. The best-pass hint is revealed slowly: the camera leans toward the spot while a dot rolls from the ball to it and the ring opens.
- Reduced motion: no slow-mo, no push (a plain cut), hint appears at once.
- Replay chip: a **Slow / 1x** toggle, remembered in the save.

**Controls and kid help**
- **Undo** (64 px, bottom-left, above the tip): takes back the last pass while aiming (the existing one-rewind-per-try rule).
- Grab radii more forgiving: start a run within 2.1 m of a teammate (was 1.4), ball zone 2.4 m (was 2.2). Feet passes already snap to the teammate.
- Mode/Scan buttons 52 px, header buttons 48 px.
- Counter clock chip (bottom-right) counts down during play and pulses red under 2 s (written to a data attribute, no React re-render per frame).
- The hint button pulses after 14 s of thinking (6 s on a retry), at most once per aim.
- Fail card: "So close!" with a small wobble (reduced-motion safe).

## Cost (before → after)
- Draw calls / meshes: unchanged (the hint reveal reuses the existing ring + dot; no new geometry, materials or textures).
- Per-frame allocation: none added (the beat helper mutates its own numbers; `setReplayFocus` reuses its vector).
- Frames: +~2 s at the level's first aim (intro tour, 30 fps on phones), each pass flight ~0.3-0.5 s longer (slow-mo), +0.75-0.95 s before the result card. Aiming still drops to 15 fps and then sleeps; the result card still hard-stops (verified: frame counter frozen on the result card, phone + tablet).
- Not measured: real-phone heat.

## Tests
- `tests/pass-puzzle-r3-expert.cjs` (in `npm test`): gates/ladder/map order, copy rules + idea lines, every expert route drawn through `readStroke` (solve, bonus, clock, replay-identical, naive fails, sloppy 21/24, youth mode), expert dailies 60/60, the cinematic helper (slow-mo bounds, wide again, capped whip, skip, budget, intro length, reduced motion, zoom cap) and source wiring.
- Updated: `tests/pass-puzzle-menu-simple.cjs` (menu state union gained `'expert'`). `curve.ts` regenerated (existing ratings unchanged).
- Browser (dev 8154, headless, --mute-audio): 390x844 (first puzzle solved by a real drawn stroke; intro active then sleeps; slow-mo min ~0.5x seen at 7 fps headless; Undo works; result card sleeps), expert path (tile → sheet → brief → play with clock chip; a held stroke lofted and was saved → "So close!" card), 820x1180 and 1280x800 menu + play. No page errors (one unrelated 503 from a board fetch).

## Eyeball on a real phone
- The intro tour and slow-mo feel: not too long, no queasy motion; a tap during either should snap wide immediately.
- Undo placement above the tip, and the clock chip, on a small phone with the Shoot height row open.
- Expert puzzles: Trap and Hunter should be doable by a confident kid in 1-3 tries; Fast One-Two is the hardest.
- The seasonal daily tile colours; the weekend Hard daily once 50 ★ are earned.
