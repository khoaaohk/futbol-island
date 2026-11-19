# Trophy Drop: game, retention and look (builder, Nov 17 2026)

**One line:** slide to aim, let go to drop a round item into a glass trophy cabinet; two of the same touch and become the next,
from a size-1 ball up to the golden trophy. Eighth arcade game (`trophydrop`), upright phone first, comic-print house style.
**Lesson:** "Small touches add up to big wins." (results card: one fact a run about small habits in football).

## Rules and numbers (`lib/arcade/trophydrop/core.ts`, all in `TD`, `TIERS`, `rampFor`)
- World 100 x 150 units, y down. Top line at y 30; items hang at y 16 and fall with gravity 420 u/s².
- Nine tiers (radius, points for making it): size-1 ball 4.2 (0) · size-3 ball 5.6 (2) · size-5 ball 7.3 (5) · boot 9.2 (10) ·
  keeper glove 11.2 (20) · medal 13.4 (40) · shield 15.9 (80) · cup 18.8 (160) · golden trophy 22 (320). Two golden trophies
  leave the cabinet together: GOLDEN DOUBLE, 640.
- Chain: a merge whose new item (under 1 s old) merges again with a resting twin. Points x chain depth (cap x5).
- Beach ball (from level 3): size-5 size, bouncy, never merges; two hard hits (closing speed > 45) deflate it into a size-5 ball.
- Drop cooldown 0.42 s. The run ends when settled items (1 s after their drop) stay over the top line for 2 s; the line turns red
  and counts down first, and the clock resets when the pile drops back under.
- Ramp, level = 1 + drops / 18, for ever: the drop weights move from [36,30,22,11,1] toward [12,18,26,26,18] (more awkward big
  items), beach-ball chance 0 → 5% at level 3, +2.5% a level to 20%, the walls step in 1.2 per side a level (to 9), the floor
  rises 2.5 a level (to 24). Walls and floor slide in at 9 u/s and push the pile; nothing ever leaves the glass.
- Medals: Bronze 1500, Silver 5000, Gold 12000. Coins: 1 per 150 points, cap 12. Free to play.

## Physics (pure, deterministic)
Position-based circle solver, fixed 1/120 s step (accumulator), seeded mulberry32 RNG: gravity, move (speed cap 260 so no
step moves more than half the smallest radius: no tunnelling), 7 passes of pair separation (heavier moves less) + wall/floor/lid
clamps, velocity read back from the move, floor friction. When every item is slower than 7 u/s for 0.45 s the world SLEEPS:
no physics until a drop, a merge or a wall move. The shell's loop also stops (`idle`), so a settled cabinet draws 0 frames.

## Retention loop
Instant restart (Play again, one tap). Results: score, NEW BEST stamp, three medals, the near line (points from your best / the
next medal / the next tier), biggest item on the tier ladder, merges, best chain, level, one coaching cue, one football fact.
Daily Drop on the start card: one seed per local play day (`trophyDailySeed`), the same drop list for everyone; today's best
and a day streak on the device. ONE all-time board `trophydrop` (top 20, every run posts); device best works offline.

## Look
Club trophy room: warm wall with a dot screen, picture rail and pennants, wooden floor, the cabinet a wooden frame with a dotted
back panel and flat glare stripes on the glass, a brass name plate. Items are inked round badges with a violet Ben-Day shadow
crescent and a paper shine: balls in paper / sun / orange with patches, then boot, glove, medal, shield crest, silver cup,
golden trophy on coloured discs. Held item + dashed drop guide to the landing spot; NEXT tag; squash on landing; merge = comic
star burst + ink rays + score pop; big tiers get a word panel (MEDAL!, CUP!, TROPHY!); CHAIN xN!; LEVEL n "The cabinet gets
smaller!"; FULL CABINET! at the end. No gradients, no glow (tests/trophydrop-core.cjs). Desktop: centred 9:16 page.

## Sound (`audio.ts`, one limiter)
Wood clonk on landing (deeper for bigger tiers), struck-glass chime per merge rising one major-scale step per tier, sparkle
on chains, bell peal for the golden double, boing for the beach ball and a hiss when it deflates, two pips on the warning.

## Polish pass (Nov 17 2026, batch 2a)
Twins of the held item wear a dashed sun ring (where to drop to merge). NEXT tag larger, item drawn at 0.6 of its real size so ball
sizes differ. Results: medal road (`ComicMedalTrack`), Play again moved up under the near line, NEW BEST stamp off the Best badge. Rules unchanged.

## AAA pass (Nov 18 2026)
Found by playing: an item landing on the bare floor never "landed" (no sound, no squash, the first drop of every run was silent);
two balls that merged in the air above the line started the top-line alarm; a tap during the 0.42 s cooldown was thrown away; the
big word panels (LEVEL n, MEDAL!) sat on the pile and the drop guide; the medal's gold disc was drawn off its ring; the drop guide
stopped in mid air on an item still falling; the NEXT tag hid an item aimed at the far right; Escape / P did nothing on the pause card.
- **Rules (`core.ts`):** queue of TWO (NEXT + THEN); buffered drop (`queued`); one small hop on a first landing (light items bounce
  more); cosmetic angle (balls roll, tiers 3+ rock and stand up); a merge pushes its neighbours (`push`); a merged item has 0.35 s
  before the top line counts it and a falling item (vy > 45) never counts; **Touch streak**: a dropped item that merges within 1.5 s
  keeps the streak, 5 in a row earn ONE **Shake** (hold 1, at most 2 a run): a jolt that lifts the pile and holds the clock 1.4 s;
  **Golden Double** also opens the cabinet again by one level of wall and floor; a dashed red preview of the next walls / floor for
  the last 4 drops of a level. No new points: every point still comes from a merge. The shake has its own RNG stream (the drop
  list never depends on it).
- **Look (`view.ts`):** every item has a face; blink = two lids drawn live (no extra sprites); stretch while falling, squash on
  landing, overshoot when made; pooled sparks and dust; bursts behind the items; ONE chain counter pop; score pops fly to the
  counter; held item hangs on a brass clamp and swings; four lighting stages (day / sunset at the medal / evening spotlights at
  the cup / gala night at the golden trophy); nine brass plaques on the plinth fill as items are first made; rug, skirting,
  crown, shelf rails; word panels moved to the strip under the cabinet; top line = red bar that fills + countdown in its tag +
  red rings on the items that are over it; touch-streak pips and the Shake button in the strip; the cards' ladder shows the real items.
- **Feel / sound:** hit-stop 40-76 ms on medal and bigger, 120 ms on the double (rules stand still, picture runs); drop pluck by
  size; detuned landings; chain climbs `CHAIN_STEPS`; streak ticks; shake rumble; earned run; warning pips rise with the clock;
  "phew" after a close escape; dull knock on an empty Shake.
- **Heat:** settled cabinet still draws 0 frames, except one blink of about 10 frames every 3-7 s (off under reduced motion);
  `bg` repaints only on a lighting stage / plaque change; sprite memory unchanged (same 11 sprites).
- **Still short of top tier:** no ambience / music bed; the queue cannot be swapped; only one special item (beach ball); the
  room is mostly wall and floor on a phone (the cabinet takes the screen); desktop play area is the same narrow column.
