# Line Up!: game, retention and look (builder, Nov 17 2026)

**One line:** drag shapes made of bean players from a tray of three onto an 8 x 8 pitch; a full row or column is a complete line of
the team and clears. The run ends when no tray shape fits. Eighth arcade game (`lineup`), upright phone first, comic-print house style.
Lesson: "Fill the line. Keep your shape." (a team defends in lines; a gap in the line is where the other team gets through).

## Rules and numbers (`lib/arcade/lineup/core.ts`, all in `LU` and `RAMP`)
- 18 shape groups (1-5 beans), every rotation and mirror: tier 0 dot, pair, three, corner; tier 1 box, four, L, T; tier 2 zig,
  five, wide corner, one-two (diagonal pair); tier 3 cup, cross, stairs, long L, flag, diagonal three. Each piece wears a kit colour.
- A new tray of three is dealt the moment the last piece is placed (no dead time). Fair deals: levels 1-3 re-deal (up to 40/30
  tries) until every piece fits somewhere; later levels only until one fits, with fewer tries, none from level 12.
- Points: 1 a bean placed; lines with one piece 100 x k(k+1)/2 (1: 100, 2: 300, 3: 600, 4: 1000) x streak x level.
  Streak: clearing placements in a row, one placement without a clear forgiven, x1.5 per step up to x4. Level bonus +10% a level
  up to x3. Clean sheet (empty pitch after a clear): 500 x level bonus.
- Level = 1 + placements / 15. Ramp (level: tier weights easy/mid/big/odd, single-bean weight, referees max / life / chance, fair
  tries): 1: .60/.34/.06/0, 1, 0, 40 · 2: .54/.36/.10/0, .8, 0, 40 · 3: .47/.37/.14/.02, .6, 0, 30 · 4: .41/.36/.18/.05, .5,
  1/3/.30, 20 · 5: .36/.35/.21/.08, .4, 1/4/.40, 12 · 6: .32/.33/.24/.11, .35, 1/4/.45, 8 · 7: .28/.32/.26/.14, .3, 2/5/.50, 5 ·
  8: .25/.31/.27/.17, .25, 2/5/.55, 3 · 9: .22/.30/.28/.20, .2, 2/6/.60, 2 · 10: .20/.28/.29/.23, .2, 2/6/.65, 1 ·
  11: .17/.27/.30/.26, .15, 3/6/.70, 1 · 12+: .14/.26/.32/.28, .12, 3/7/.75, 0.
- Referee (level 4+): walks on with a new tray onto a random free square (never when 12 or fewer are free), blocks it for `life`
  placements (the number on the tile counts down), then leaves. A line with a referee in it cannot complete.
- Bot (tests/lineup-core.cjs, 30 seeds): held at level 1 a careful greedy bot lasts a median 221 placements, held at level 12 only
  20; free runs: median 71 placements, 4,464 points, best 15,829; every run ends.
- Medals: Bronze 1,500, Silver 4,000, Gold 10,000. Coins: 1 per 400 points, cap 12; a play is free.

## Retention loop
1. Restart: one tap (about 50 ms to a fresh pitch). The results card names the nearest thing: points to the next medal, points from
   your best, "clear two lines with one piece for a combo". NEW BEST stamp.
2. **Daily Line-Up** on the start card: one seed per local play day (same pieces for everyone). The first finished daily run posts to
   the board; later daily runs are practice. Day streak in the save (`fi2-lineup-v1`).
3. One all-time island board `lineup` (top 20); the local best works offline and before the owner's SQL runs.

## Look and feel (comic print, shared kit `components/games/comic`)
- Ink `#231a2e`, paper `#fff3d6`; kits red `#f0452e`, teal `#19b5a5`, sun `#ffc83a`, orange `#ff8a3c`, sky `#4a9fe0`, violet `#8f78b8`
  with darker shade sides and a halftone dot screen. Pitch in mown bands with chalk lines, an inked frame and a hard shadow;
  a stand of crowd heads above, a paper tray shelf with three bays below.
- Each bean is a tile: the shirt is the tile, a head with two eyes and a smile, a collar. Referee: ink kit with a yellow card.
- Drag: a finger lifts the piece full size about one cell above the thumb (a mouse holds it centred), a ghost snaps to the grid,
  lines that would clear glow sun-yellow and their beans pulse; a red dashed outline and crosses mark a square that blocks.
  A bad drop knocks twice and the piece flies back to its bay. Pieces that fit nowhere fade with "No room".
- Clear: beans swell and fade outward from the piece, a paper flash runs along the line, pooled star sparks, a starburst word
  (LINE UP! / DOUBLE! / TRIPLE! / FOUR LINES! / WHAT A TEAM! with the streak) and the points rise off the line; the pitch shakes on combos.

## Sound (`lib/arcade/lineup/audio.ts`, one limiter, starts after the first tap, no loops)
Lift = felt tap; drop = wooden block (lower for bigger shapes); bad drop = dull double knock; clear = a rising chord that climbs with
the streak, clap, horn stab on combos; clean sheet = horn fanfare; referee = pea whistle; game over = low thud and falling bars.

## Heat
2D canvas, no three.js. The static scene repaints only on resize; bean tiles are pre-rendered once per kit and size; sparks pooled
(64). No loop at rest: frames run only while a finger drags or an effect moves. DPR cap 2.
