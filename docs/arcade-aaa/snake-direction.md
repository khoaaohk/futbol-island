# Squad Snake: game, retention and look (builder, Nov 10 2026)

**One line:** your captain runs the pitch calling the squad together; team-mates join the line in position order until eleven stand as a formation. Sixth cabinet (`snake`), upright phone first, comic-print house style.

## What it teaches (AGENTS.md)
- **The eleven and their jobs.** Team-mates join keeper first, then defenders, midfielders, forwards, each in a position
  colour with a label (GK / DEF / MID / FWD) and a shirt number, so the line reads from the back like a team sheet.
- **Reading a formation.** The numbers count from the back, never the keeper. YOU decide the shape: while a line is open
  the pitch offers one more of it or the first of the next line. **Coach's call:** each squad the coach asks for 4-4-2,
  4-3-3 or 3-5-2; build it and the bonus doubles. Results: best shape built, one authored fact about it, a near-miss line.

## Rules and numbers (`lib/arcade/snake/core.ts`, all in `SN` and `RAMP`)
- Pitch 11 x 15 cells; touchlines are walls (the classic tension, and out of play is football's own rule; wrap would hide
  it). Logic is a fixed tick (a cell a tick); drawing is interpolated between cells.
- Turns: swipe (22 px; one drag can turn twice), arrows / WASD, optional d-pad. Two are buffered; a reversal is refused,
  so a fast double swipe is the legal two-step U-turn, never a death. Swipe is the default: four absolute directions
  need no thought about which way the captain faces (tap-left/right is relative and was not kept).
- Line rules: GK, then 3-5 DEF, 3-5 MID, 1-3 FWD (ten outfield). Shapes: 3-4-3, 3-5-2, 4-3-3, 4-4-2, 4-5-1, 5-3-2, 5-4-1.
- Points x level (cap x12): team-mate 10, FULL SQUAD 200 (x2 on the coach's call), boot 50, dash 5 a cell, dash knock 25.
  FULL SQUAD: 1.5 s beat, bonus banked, shape named, line back to the captain, level up, last-ditch save refilled.
- Kind crashes: a head-on hit (touchline, own line, presser) first skids for one tick (a late turn still counts, a turn
  into a wall is taken back); the next blocked tick spends the one LAST-DITCH save (turned into open grass) or ends the run.
- Opponents from level 2: pressing defenders patrol a marked lane (one cell every 2 ticks); referees from level 3 wander
  (every 3 ticks). Touch a referee: whistle, the last team-mate is sent back (or 50 points with nobody behind you).
- Loose ball: THROUGH PASS, 8 cells at x1.5, opponents are run past. Golden boot: on a touchline cell, timed: a tight turn.
- Ramp (`RAMP`, level: seconds per cell / pressers / referees / boot timer): 1: .30/0/0/9.0 · 2: .28/1/0/8.5 ·
  3: .26/1/1/8.0 · 4: .245/2/1/7.5 · 5: .23/2/1/7.0 · 6: .215/2/2/6.5 · 7: .20/3/2/6.0 · 8: .19/3/2/5.6 ·
  9: .18/3/2/5.2 · 10: .17/4/2/4.8 · 11: .16/4/3/4.5 · 12+: .15/4/3/4.2. The run ends only on the player's crash.
- Medals: Bronze 300 (about one squad), Silver 1000, Gold 2500, Captain 6000. Coins: 1 per 150 points, cap 12; a play is free (Nov 11 2026: every arcade game is free; was 3 coins).

## Retention loop
1. Restart: one tap, under a second (a 0.7 s beat doubles as "ready"). Results name the next thing: "2 players from a Full
   Squad", "140 points from Silver", "Build the coach's 4-3-3 for double points", NEW BEST stamp.
2. **Daily Squad:** one seed per local play day; the first finished run posts to `snakedaily`, later runs are practice.
   Counted in "Today in the arcade". **Day streak** (save `fi2-snake-v1`): days in a row with a Daily Squad.
3. Boards `snake` (endless) and `snakedaily`; local best works offline. A shape album on the start card (which of the
   seven shapes you have built) is a second reason to come back.

## Look (comic print, the house style; palette from the runner / Kit Rush files)
- Ink `#231a2e`, paper `#fff3d6`, sun `#ffc83a`, orange `#ff8a3c`, red `#f0452e`, teal `#19b5a5`, violet `#8f78b8`;
  pitch `#3f9a5c` / `#4aa868` mown bands, printed dot grid, paper lines.
- Positions: GK orange, DEF teal, MID sun, FWD red; captain paper white with a red armband; pressers violet, referee ink
  with a yellow card. Colour is never alone: label tags on pick-ups, numbers on shirts.
- Beans: round inked body in kit colour, number, face; they bob as they run (a wave down the line), lean into turns,
  squash on a pick-up with a ripple to the tail and small starbursts.
- Scene (one static canvas per resize): pitch, stand and golden-hour sky above, sand and sea below on tall phones with a
  printed swipe compass where the thumb goes. Moving layer: beans, pick-ups, opponents, bursts, word panels.
- Words: FULL SQUAD! + the shape; TURN!, LAST-DITCH!, THROUGH PASS!; crash = cracked panel (OUT! / TANGLED! / TACKLED!),
  0.78 s, a tap or key skips it. HUD: shared top bar (standard Arcade back button), a team sheet (eleven slots in position
  colours, coach's call, level, save glove). Cards, pause, boards: `components/games/comic`. Desktop: centred 9:16 page.

## Sound (own WebAudio module, percussive mallets, one limiter; silent on menus, pause, results; starts after the first tap)
Each pick-up plays the next note of an eleven-note rising phrase (a full line is a tune); FULL SQUAD = brass fanfare, claps;
skid = brush scrape; save = glove thump; dash = whoosh; card = pea whistle; crash = low thud, falling bar.

## Heat
2D canvas, no three.js. Static scene never repaints; sprites pre-rendered per resize; effects pooled; the loop runs only while
playing (60 fps cap, DPR cap 2 falling to 1.5 on long frames). Measured (headless Chrome, `scripts/check-snake-browser.cjs`):
rules + draw 0.20 ms a frame avg, worst 4.9 ms at 390x844 @2x. Script time only: no GPU raster time or phone temperature measured.
