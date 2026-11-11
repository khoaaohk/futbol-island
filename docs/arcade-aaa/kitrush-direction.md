# Kit Rush: game, retention and look (builder, Nov 10 2026)

**One line:** the kit bag bursts open at golden hour; swipe YOUR team's kit out of the air, leave theirs, never touch the whistle.
Replaces Island Strikers in the arcade (`kitrush`, upright phone first). Drawn in Breakaway's comic-print house style.

## What it teaches (AGENTS.md)
- **Know your team at a glance.** Every kit has a colour AND a pattern (plain, hoops, stripes, sash), like real kits that must
  differ for players, referees and colour-blind fans. The banner and the frame of the page always show your kit.
- **Scan before you act.** A good swipe is planned: read the wave, find the line through your colours, then cut once.
- **Switch!** Your team changes mid-round: look up, re-read, play on (the transition moment in a real match).
- Results card: one authored fact per run (why keepers wear another colour, why bibs exist, the armband, the whistle,
  home and away kits...), rotated so each run shows a new one. In play: numerals, icons and short comic calls only.

## Rules and numbers (`lib/arcade/kitrush/core.ts`, all tunable in `KR`)
- Field 100 units wide, height follows the screen (130-225). Items r 7.2; your kit is hit at r +1.6 (+1.2 more in the first 8 waves),
  their kit and the whistle only at r -1.2 (a graze never costs a life). A tap is not a swipe (2.5 units of travel first).
- Kinds: ball, bib, boot, shirt, cone, bottle. Kits: Gold (plain), Teal (hoops), Red (stripes), Pink (sash; violet is kept for shadows). Slice your own
  item: 10 x its place in the swipe (10, 20 ... cap 60). A swipe links hits within 0.55 s.
  Calls at swipe end: 2 ONE-TWO, 3 HAT-TRICK, 4 TIKI-TAKA, 5 TOTAL FOOTBALL, 6+ GOLAZO (+10 per item bonus from 3).
- Rival kit: lose a life. Whistle: lose a life. Either one clears the air and gives 1.1 s of safety (never two lives in one swipe).
- Missing your own item costs no life: it resets the clean run. 12 clean in a row = SUPER SUB, one life back (max 3);
  each sub used raises the next one by 6, so a long run still has to end.
- Lives 3. Waves: 3 teaching waves (one of yours, two of yours, one of theirs), then level = wave/5. Gap 1.55 s falling x0.93 a
  level to 0.68 s; flight time 2.55 s x0.97 per level (floor x0.62);
  rival share 22% rising to 46%; whistles from wave 5 (12% rising to 34%); a third kit from level 3, a fourth from level 6.
- Wave shapes (read the pattern): single, pair, line, fan, vee, stairs, cross, wall (rival in the middle of your row),
  sandwich (whistle between two of yours), fountain.
- Switch: first at wave 7-9, then every 5-8 waves: 0.9 s beat with a kit card, the air clears, the banner and frame flip, play on.
- Specials (own colour never needed): golden ball = 5 s frenzy (only golden balls, 15 each, no hazards);
  stopwatch = 5 s slow motion (x0.55); captain's armband = double points for 8 s. One special about every 7 waves.
- Medals: Bronze 500, Silver 1200, Gold 2500, Captain 5000. Coins: 1 per 150 points, cap 12; a play is free (Nov 11 2026: every arcade game is free; was 3 coins).
- Bot runs (40 seeds each, optimistic: bots never panic): slow reader median 990 in 66 s, steady 1830 in 80 s, sharp 5070 in 149 s.

## Retention loop
1. Restart is one tap and under a second (the kit card beat doubles as "ready"). Results always name the next thing: "12 points from Silver", "Best combo 4: one more for TOTAL FOOTBALL", NEW BEST stamp.
2. **Daily Rush:** one seed per local play day, same waves for everyone; the first finished run posts to the `kitdaily` board,
   later runs are practice. Counted in "Today in the arcade" (learning coins + weekly pennant).
3. **Day streak** (device save `fi2-kitrush-v1`): consecutive days with a Daily Rush played; shown as a chip on the start card.
4. Boards `kitrush` (endless) and `kitdaily`; local best always works offline.

## Look
- Palette (from the runner files): ink `#231a2e`, paper `#fff3d6`, sun `#ffc83a`, orange `#ff8a3c`, red `#f0452e`,
  teal `#19b5a5`, violet `#8f78b8`; sky bands `#2f5fa8` / `#f08a5a` / `#ffcf7a`; pitch `#3f9a5c` with violet hatch shadow.
- Scene (one static canvas, painted once): the training ground at golden hour from the touchline: stacked-disc sun, cut clouds,
  floodlight mast and stand silhouettes, a goal frame, mown stripes with a halftone turn, an open kit bag at the bottom edge
  where everything flies from. Play canvas above it draws only moving things.
- Items: thick ink outline, flat colour, one violet shadow band, a paper highlight; the team pattern on every kind. Slash: tapered
  ink with a paper core from coalesced pointer samples. Hits: star burst, halves fly apart, IslandBrush numerals, starburst calls.
- HUD: tilted caption box score (shared top bar), a kit banner (shirt + lives), the page frame in your kit colour. Cards, buttons,
  chips: shared kit `components/games/comic/`. Desktop: a centred 9:16 page on a Ben-Day sunburst with caption strips.

## Sound (own WebAudio module, percussive and bright, one limiter)
Toss: soft skin "whup" pitched by lane. Slice: leather crack + marimba bar, a scale step up per place in the swipe. Call: marimba
run. Rival: flat cowbell + thud. Whistle: pea-whistle trill. Switch: two-tone whistle + clap. Menus and pause are silent.

## Heat
2D canvas, no three.js. The backdrop canvas never repaints; sprites are pre-rendered once per size; items, halves, bursts,
popups and trail points are pooled. The loop runs only while playing (not on start, pause, results or a hidden tab). 60 fps cap. DPR cap 2, falls to 1.5 if the frame's script cost averages over 7 ms.
Measured (headless Chrome, 390x844 @2x, `scripts/check-kitrush-browser.cjs`): rules + draw calls 0.1-0.2 ms a frame, worst 3.7 ms.
That is script time only: no GPU raster time and no phone temperature were measured.
