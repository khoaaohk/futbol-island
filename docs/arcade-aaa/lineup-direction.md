# Line Up!: game, retention and look (builder Nov 17 2026; footballs Nov 18; AAA pass Nov 18 2026)

**One line:** drag shapes made of footballs from a tray of three onto an 8 x 8 pitch; a full row or column is a complete line of
the team and clears. The run ends when no shape fits. Eighth arcade game (`lineup`), upright phone first, comic-print house style.
Lesson: "Fill the line. Keep your shape." (a team defends in lines; a gap in the line is where the other team gets through).

## Rules and numbers (`lib/arcade/lineup/core.ts`, all in `LU` and `RAMP`)
- 18 shape groups (1-5 balls), every rotation and mirror, tiers 0 (easy) to 3 (odd). Each piece is one of six ball types: red star,
  teal street, gold trophy, orange retro leather, sky beach, violet classic panel (pattern AND colour differ).
- A new tray of three is dealt the moment the last piece is placed or parked. Fair deals: levels 1-3 re-deal until every piece
  fits; later only until one fits, with fewer tries. AAA pass: a pitch with 22 or more free squares never gets three dead pieces.
- **Bench (AAA pass):** a fourth bay holds one parked shape. Drag a tray shape onto it (key B); a full bench swaps. Play the bench
  shape like any other (key 4). Parking costs no placement. Parking the last tray shape brings the next tray, so an empty bench
  saves a stuck tray once (`state.rescue`, the tip says "Drag that shape to the bench"). The run ends when nothing fits and the
  bench cannot help.
- **Team line (AAA pass):** a cleared line where 6 or more of its 8 balls are one ball type adds 100 before the streak and level
  bonus. The line glows in that ball's colour with a TEAM LINE! tag BEFORE the drop. About 9% of a bot's lines.
- Points: 1 a ball placed; lines with one piece 100 x k(k+1)/2 (+100 a team line) x streak x level. Streak: clearing placements in
  a row, one miss forgiven (the chip turns yellow: "clear now!"), x1.5 a step up to x4. Level bonus +7% a level up to x3. Clean
  sheet: 500 x level bonus.
- Level = 1 + placements / 10 (was 15: the bench makes runs longer, so the ramp steps sooner; the level bonus went from 10% to 7%
  so points for a given placement number stay about the same). Referee from level 4 (after 30 placements), two from 7, three from 11.
- Bot (tests/lineup-core.cjs --bots, 30 seeds). Before the pass: median 71 placements, 4,464 points, best 15,829. After: a bot
  that never parks a shape: 71 placements, 5,098 points, best 11,551; a bot that uses the bench: 88 placements, 7,807, best 15,428.
- Medals: Bronze 1,500, Silver 4,000, Gold 10,000. Coins: 1 per 400 points, cap 12; a play is free.

## Retention loop
Restart in one tap. Results name the nearest thing (next medal, your best, a combo, the bench if never used). Daily Line-Up: one
seed per local play day; the first finished daily run posts to the board. One all-time board `lineup`; local best works offline.

## Look and feel (comic print, shared kit `components/games/comic`)
- Ink `#231a2e`, paper `#fff3d6`; six ball colours with darker slabs. Each ball sits on a slab; slabs of one piece join.
- **Venue (AAA pass):** the scene behind changes every third level, as chapters: Morning (1-3), Afternoon (4-6), Sunset (7-9),
  Night under floodlights (10+). `VENUES` in view.ts: sky, page, stand and grass colours. A stand of bean fans in the six ball
  colours, floodlights, advert boards with the lesson, a touchline with cones under the tray. Static canvas; repainted only on
  resize and when the venue changes (one paper flash covers the change).
- **Drag (AAA pass):** the piece grows out of its bay and rises above the thumb (110 ms ease, never a jump); a ghost with a paper
  outline; magnetic snap (a square where it fits wins within 0.62 of a cell); a soft tick per square; lines that would clear glow
  and their balls pulse, with a rising cue; a tap never drops a piece (9 px slop); a bad drop knocks twice and flies back.
- **Clear (AAA pass):** the line flashes, then each ball winds up and is kicked off the pitch, rippling out from the piece that
  finished it (34 ms a square); its slab cracks away; stars fly from the line to the score counter; a combo or a team line brings
  paper bits from the stand, the crowd, and a shake.
- Near miss: after a placement that clears nothing, the last gap of any line that is one ball short pulses once.
- The end: the pitch dims from the bottom, the gaps that are left show in red, dead shapes shake under red "No room" tags, then
  the results card (tap to skip).
- Idle life at no steady cost: a glint runs over a ball just set down; a fresh tray pops in one bay after another; after 7 idle
  seconds the tray wobbles once (one timeout, never a loop).

## Sound (`lib/arcade/lineup/audio.ts`, one limiter, starts after the first tap, NO loops: the test forbids them, so no ambience bed)
Lift = felt tap; snap = soft tick; line ready = two rising notes (three for a team line); drop = wooden block with pitch drift;
bad drop = dull double knock; clear = a ripple of kicks, a rising chord that climbs with the streak, clap, horn stab and crowd
swell on combos, a ding as the points land; near miss = an open fifth; bench = a wooden seat knock (twice for a swap); streak at
risk = two low ticks; new venue = horn call and crowd; referee = pea whistle; game over = low thud and falling bars.

## Heat
2D canvas, no three.js. Seven sprites in all (six balls and the referee at the cell size; the tray and the fly-back scale them;
before the pass a sprite was made per size, and a fly-back made new ones every frame). Sparks (64) and paper bits (32) pooled.
No loop at rest: frames run only while a finger drags or an effect moves. DPR cap 2. Measured Nov 18 (390x844, DPR 2, CPU x4
slower): script per frame in a drag 0.07 ms before, 0.09 ms after; frame interval 16.7 ms both; 0 frames at rest both; canvas
memory 11.1 MB before (29 canvases), 10.2 MB after (9).

## Still short of top tier (honest list)
No music or ambience (loops are forbidden here). The crowd is a still picture. The six ball types have one rule (team line), no
special ball. No objectives inside a run beyond the venue chapters. In landscape on a phone the pitch is small.
