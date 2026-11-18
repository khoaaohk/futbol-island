# Street Dash: game, retention and look (builder, Nov 17 2026)

**One line:** an endless side-on run in PORTRAIT through the island's streets, rooftops and beach, the bean dribbling a ball at its
feet. Eleventh arcade game (`streetdash`; ninth when it was built), last in the back row, comic-print house style. Owner, Nov 17: "can we also build a game that
is a sidescroller?" Lesson: "Keep the ball close. Look up early." Different from Breakaway Run (behind-the-player lanes): this is
platforming from the side.

## Controls (one thumb anywhere; `components/games/StreetDashGame.tsx`)
- Tap = jump; hold = higher (hold gravity 13 instead of 30 for up to 0.24 s: tap apex 1.4 m, full hold 2.45 m).
- Swipe down = slide (0.6 s, 0.55 m tall); in the air it is a fast fall that slides on landing.
- Tap the glowing SHOOT prompt (thumb zone, right) or the ringed target = volley, only while the ball is at the feet on the ground.
- Keys: Space / Up / W jump (hold = higher), Down / S slide, X / Enter shoot, P / Escape pause.
- Forgiveness: coyote time 90 ms, jump buffer 120 ms, volley buffer 160 ms, a touch waits 55 ms to tell a tap from a swipe and the
  core stretches its ledge grace by that wait; hazard boxes are trimmed, the drawn bean is 1.3x its hitbox; feet 0.38 m under a
  ledge still climb it.

## Rules and numbers (`lib/arcade/streetdash/core.ts`, all in `SD`, `rampAt`, `CHUNKS`)
- Fixed 1/120 s steps, seeded (mulberry32); frame-rate independent; no allocation in a step (pools: 40 ground, 48 hazards, 64 stars).
- Hearts 3. A tackle, wall, crate, gate, puddle, banner, dog (steals the ball) or a fall costs a heart, knocks the ball loose (it rolls
  back in 0.9 s) and gives 1.5 s of blink. The first 20 s are three soft lessons (JUMP! / SLIDE! / SHOOT!) that cost no heart.
- 23 hand-made patterns, spaced by speed so their timing holds at every speed: stars, wall, tackle, banner, crate, puddle, gap
  (grade 0); two walls, dog, cone gate, street goal with a keeper cut-out (streets), roof steps (rooftops) (1); chimney hop
  (rooftops), wall then banner, wide gap, moving platform, crate then gate, sea wind gap (beach) (2); two tackles, puddle then dog,
  gap then banner, wind and tackle (beach), shoot then jump (streets) (3). Backdrop changes every 500 m: streets, rooftops, beach.
- Ramp (level = metres / 400): speed 6.2 m/s rising linearly to 10.2 m/s at 2,400 m; grade 1 from 200 m, 2 from 500 m, 3 from 900 m;
  pull toward hard grades 0.4 a level to 2.4, then +0.05 a level forever; open street between patterns 1.25 s down to 0.5 s; gaps,
  banners and puddles widen to their cap by 2,400 m.
- Score: 1 a metre + 10 a star + shots x streak (crate 40, gate 60, goal 150; x1 / x1.5 / ... / x3 for shots in a row without a hit)
  + 25 a near miss (a jump under 0.17 s before a hazard, or off the very edge of a gap).
- Fairness (tests/streetdash-core.cjs): a search bot runs 3,000 m without a hit on 30 seeds at all 7 speed tiers; two hazards are
  never closer than 0.45 s; bots at 80 / 90 / 95 % reaction always end (median 528 / ~700 / 1,353 points); a clean free 3 km ~9,500.
- Medals: Bronze 800, Silver 2,500, Gold 6,000. Coins: 1 per 250 points, cap 12; a play is free. Board: one all-time `streetdash`
  board (base 1,500 + 150 a second; bots peak at 28 points a second).

## Retention loop
Instant restart (one tap); results card names the nearest thing (points to a medal, to your best, "tap the glowing target");
**Daily Dash** on the start card (one seed per local day, same street for everyone, first finished run posts, day streak in
`fi2-streetdash-v1`); the island board works once the owner runs docs/arcade-aaa/new-games-supabase.sql (Nov 17 2026 merge; it carries Street Dash's board id and activity key).

## Look (`lib/arcade/streetdash/view.ts`, one canvas)
- Portrait: street line at 63% of the height, parallax above (sky with a dot screen and cut clouds, a far strip at 0.12, a mid strip
  at 0.4), the thumb zone below (kerb, road with a lane line, dot screen; brick wall with windows on the roofs; sand on the beach).
  Camera: the bean 30% from the left, zooming out 18% with speed, following the ground height, not the jump.
- Readability rule: scenery is muted and thin-lined; everything that hurts or scores is saturated with a thick ink line and a hard
  shadow; a red "!" tab at the right edge announces a hazard before it scrolls in; gaps are dark pits (sea on the beach).
- Palettes: streets morning `#8fd0e6` sky, pastel houses; rooftops sunset `#e9825c` / `#c95b45` tiles; beach `#7cc8ea` sky, `#3aa7c4`
  sea. Ink `#231a2e`, paper `#fff3d6`, sun `#ffc83a`, red `#f0452e`, teal bean `#19b5a5`, rival tackler violet `#8f78b8`.
- Backdrop change (Nov 17 2026): ONE sky layer (bands, sun, dot screen, clouds) blends its colours and sun position from the old
  theme to the new over 24 m, so two suns never show; only the far and mid building strips cross-fade.
- Reduced motion: no shake, no flash, no pulsing, no speed lines, parallax at 35%.

## Sound (`lib/arcade/streetdash/audio.ts`, one limiter, starts on the first tap, no loops)
Rubber-pop jump, sneaker landing, slide swish, leather volley thump, splintering crate, gate clack, goal = net swish + crowd + horn
that climbs with the streak, steel-drum stars climbing a scale, whistle + oof on a hit (a yip for the dog), falling bars at the end.
