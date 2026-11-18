# Clear the Box: game, retention and look (builder, Nov 17 2026)

**One line:** a crowded penalty box seen from above; every bean faces up, right, down or left. Tap a bean and it sprints out of
the box that way; if anyone stands in its lane it bumps (a foul: one of three whistles). Clear every bean before the box clock
runs out and the next, more crowded box slides in. Ninth arcade game (`clearbox`), upright phone first, comic-print house style.
Lesson: "Time your run. Make the space." (a run only works into space; every team-mate who moves away makes space for another).

## Rules and numbers (`lib/arcade/clearbox/core.ts`, all in `CB` and `RAMP`)
- Boxes are built BACKWARDS from an empty box with a seeded RNG: each new bean goes only where its lane is clear of the beans
  already placed, so the reverse build order always clears the box. `tangle` is the share of beans placed on the cell that blocks
  the most existing lanes (deeper chains). tests/clearbox-core.cjs replays the plan and runs a depth-first solver on 200 seeds.
- Ramp (box: w x h, beans, defenders, turners, tangle, clock s): 1: 5x5, 5, 0, 0, .2, 30 · 2: 5x6, 7, 0, 0, .35, 30 ·
  3: 6x6, 9, 1, 0, .5, 29 · 4: 6x7, 11, 1, 0, .6, 28 · 5: 6x7, 13, 2, 1, .65, 27 · 6: 7x7, 15, 2, 1, .7, 26 ·
  7: 7x8, 17, 3, 2, .75, 25 · 8: 7x8, 19, 3, 2, .8, 24 · 9: 7x9, 21, 3, 3, .85, 23 · 10: 7x9, 23, 4, 3, .9, 22.
  After box 10: +1 bean every 2 boxes (to 60% of the box), +1 turner every 4 (to 6), clock -0.5 s a box down to 9 s.
- Defenders never move (inner cells, never side by side). Turners (sun badge and sun ring) turn 90 degrees clockwise every time a
  bean leaves. If no bean can run, turners spin for free (up to 4 times); a box that is still stuck is swapped for a new one.
- A foul: the bean lunges, bumps, springs back; one whistle lost; the clean streak breaks. Third foul or clock at zero = full time.
- Points: a bean out 10 x level factor (+10% a box, up to x3). A box: 100 x level factor + 10 a whole second left, x clean streak
  (x1.5, x2 ... up to x4) when the box had no foul. Three clean boxes in a row win a whistle back (never above three).
- The clock waits 0.45 s while a new box slides in (no time lost to the transition). Restart is one tap (about 50 ms).
- Bot (40 seeds, 0.45 s + 0.03 s a bean per tap, 93% right): held at box 1 it clears a median 118 boxes, at box 6 only 6,
  box 12: 2, box 20: 0. Free runs: median 7 boxes, 5,296 points, best 12,456, about a minute; a 99.5% bot median 15,573. Every run ends.
- Medals: Bronze 2,500, Silver 6,000, Gold 14,000. Coins: 1 per 400 points, cap 12. Board: base 2,000 + 220 a second.

## Retention loop
1. Results card: the nearest thing (points to the next medal, points from your best, "two clean boxes in a row"); NEW BEST stamp.
2. **Daily Drill** on the start card: one seed per local play day (same boxes for everyone). The first finished daily run posts to
   the board; later daily runs are practice. Day streak in the save (`fi2-clearbox-v1`).
3. One all-time island board `clearbox` (top 20); the device best works offline and before the owner's SQL runs.

## Look and feel (comic print, shared kit `components/games/comic`)
- Mown pitch bands with a soft dot screen; the box in chalk with the goal and net on the goal line and the D below.
- Beans from above: kit shirt with a halftone shade side, hands, a head with hair at the back and eyes at the front, and a chalk
  arrow on the grass in front. Defenders: dark kit, arms spread, a red dashed square with a cross (planted).
- Run: a short crouch, then an accelerating sprint off the page with dust kicked up behind. Foul: lunge and bounce back, the blocker
  squashes, star sparks at the bump, the blocked lane flashes red dashes, a FOUL! burst, a small shake. Box clear: the chalk lines
  flash sun-yellow, stars, BOX CLEAR! (or CLEAN x2!) with the points on the goal line; the next box slides in from the right.
- HUD strip: box number, three whistles, beans left, and a big clock block (sun; orange under 10 s; red and pulsing tenths under 5 s)
  with a draining bar.

## Sound (`lib/arcade/clearbox/audio.ts`, one limiter, starts after the first tap, no loops)
Run = stud scuff + dust whoosh (longer lane, longer whoosh) + a pluck that climbs; foul = body thump + sharp whistle; turn = felt
click; last five seconds = wood ticks; box = snare roll, rising plucks by clean streak, crowd swell; full time = three whistle blasts.

## Heat
2D canvas, no three.js. The pitch repaints only on resize. While a box is in play one rAF callback runs the clock; the canvas
repaints only while something moves or the state changed; the clock face is written to the DOM only when its tenth changes.
Beans are pre-rendered once per kit and size and rotated when drawn; dust pooled (48). DPR cap 2. Menus, pause, results: no loop.
