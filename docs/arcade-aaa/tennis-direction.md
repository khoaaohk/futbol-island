# Futbol Tennis direction: "Club Marea, printed" (comic house style, Nov 10 2026)

One line: the same whitewashed beach club, nine courts and two tours, now printed like a comic page: ink, flat colour, Ben-Day
dots, one big cut-paper sun over a banded sea. Supersedes the realistic "Club Marea" pass: the owner ruled "the tennis game should
be in that style too" (Breakaway Run's look). Rules, scoring, wind, reactions, camera, first touch and hold-power are unchanged.

## Shared with Breakaway and Pass Puzzles (one implementation)
- 3D: `lib/arcade/comic/` (`comicLook`, band shading, halftone turn, violet shadows, sun rim, ink edge, inverted-hull props).
  HUD: `components/games/comic/` (tokens and shared chrome, composed into the skin class in `skins/tennis.module.css`).
- Palette (hex): ink `#231a2e`, paper `#fff3d6`, sun `#ffc83a`, orange `#ff8a3c`, red `#f0452e`, teal `#19b5a5`, blue `#2f6fb0`,
  violet `#8f78b8`. Whitewash `#fff0dc`, terracotta `#d9623b`, palm `#2f8a5a` / `#1d5a55`, sand `#f4d08c`.

## Its own world: nine panels of one club
Each stop is a different comic panel (palette, hour and sun side in `lib/arcade/tennisVenues.ts`):
1. Practice court, morning: clay `#d9623b`, pale blue sky, lemon sun on the left.
2. Sand court, high noon: sand `#f4d08c`, deep blue sky, a white sun riding high, blue rope lines.
3. Back court, late morning: teal hard court `#1fa396` in a terracotta apron, sun on the right.
4. Centre court, afternoon: clay, the grandstand and members, warm haze.
5. Sand court, golden hour: Breakaway's own evening (orange bands, stacked-disc sun, long violet shadows).
6. Centre court, lantern evening: a night panel (`#141a44`, moon, stars); the court sits in warm lamp pools, everything
   outside them prints in blue shadow, players and ball included.
7. Pier court, windy afternoon: timber planks over open water, a slate sky, whitecaps as ink dashes.
8. Rubber court, sunrise: coral checker tiles, pink and violet sky, the lowest sun of the tour.
9. The lawn, championship afternoon: two mowing bands, crisp paper lines, the grandstand.
Tours: Pro = centre court in a sea breeze; Legend = the night final under a red moon.

## Sky, sea and the horizon
The rally camera looks down at the court, so a true horizon is never in frame on a phone. The world therefore ends at a printed
horizon a few metres past the surf: the sea is drawn in flat bands (surf line, near band, dotted turn, far band, a glitter path
under the sun) and everything beyond it is the sky panel, drawn in screen space by the sea and sky shaders together: three flat
bands with dot-screen turns, the sun as stacked discs with poster bars (a moon and stars at night), cut clouds, two headlands
and a lighthouse. The sun sits beside the scoreboard on a phone and stays a circle in every camera beat. 0 textures, 2 draws.

## Court, props, line
- Courts: flat colour with printed marks (rake strokes, scuffs and plank or tile lines as ink strokes, a dot screen where feet
  wear the surface). Lines are paper with an ink keyline. The net is paper cord with an ink edge, the tape casts a hard shadow.
- Props (posts, umpire chair, wall, parasols, loungers, palms, clubhouse, boats, pier) carry their ink outline as an inverted hull
  in the same merged mesh; flags, bunting and fronds carry an ink backing. No fake AO, no roof tiles, slats or trunk rings.
- Light: one white sun, low and ahead of the camera (12 to 30 degrees; higher only at noon), so shadows rake toward the player
  and break into dots at their edges. No tone mapping, no fog haze.
- Members and grandstand: flat comic figures, one instanced draw, no shadow pass, behind `TENNIS_CLUB_CROWD` in `tennisWorld.ts`
  (off = no members, no umpire, no stand).

## Wind, marks, moments
- Wind: drawn gust lines cross the court with the wind, flags and bunting stream, fronds lean, the net bellies.
- Bounce: a small ink-edged cloud and an ink smudge that fades. The ball shadow is a hard violet-ink disc; rings (aim, landing,
  contact, bounce spot, first touch) are paper bands with ink keylines, readable on every surface.
- Point: a starburst word panel (red star, sun lettering) in the Breakaway manner; set and match points bigger; a lost point is a
  small cracked paper panel. Power charge: the ring at your feet inks in teal, sun, red and speed lines grow around it.

## HUD
Comic score panel (paper, ink border, hard shadow, slightly tilted): names, hand-cut numerals, set pips, server dot, rally and
a wind pennant. Kick is the big sun disc, Lob / Drop / Header / Scissor / Trap are inked paper discs (same positions and hit
areas); the stick is Breakaway's inked ring and paper knob. Start card, court picker (repainted comic thumbnails), results,
pause card, boards and high-score entry use the kit. Buttons: UI sans 800.

## Sound (synthesised, one limiter, `tennis:hush` kept)
Breakaway's percussive world: cajon and hand-drum strikes (a different drum per shot type), surface bounces (clay thud, sand
hiss, hard knock, timber clack, grass pat), a wood-block point call, applause as hand claps in rhythm, a light sea bed.

## Endless (Nov 10 2026: rules only, the look above is untouched)
Owner: "the user can play as long as they want to increase their score", "increase in difficulty the further they play", one board
per game. Tables and helpers: `lib/arcade/tennisEndless.ts`; rules: `lib/games/soccerTennis.ts` (`endMatch`, `advanceMatch`).
- A run is a chain of matches and ends only when the balls run out. Court run: 3 balls; a LOST MATCH costs one and the same court is
  played again; a won match banks a bonus, brings one ball back (never over 3) and the next court walks on (9 loops to 1). Tours keep
  their rule (a lost point costs a ball) and every 5 won points is a tour match: bonus, a ball back, the next stop.
- Why a ball per match on courts: a child already reads the match score; a ball goes only at one clear moment (the match is lost),
  never for a single missed touch, and three tries at a court is kinder than the old one try.
- The seam is the ordinary 1.55 s point beat (starburst, "COURT WON!", stars), skippable by any shot press from 0.45 s. The venue
  swap is the world's existing one: every stop is already built and only shown or hidden, the palette is uniforms, the one court
  sheet is repainted into the same canvas texture. Nothing is created or disposed.
- Ramp: `TENNIS_RAMP`, one row per match of the run (rival speed, reach, reaction, placement, contact quality, shot variety, read
  error, wind, gust, the perfect window, points, win bonus). Row 1 changes nothing: a first match is the court as it always was.
  Past row 10 the rival keeps improving to match 30 and starts each court match a point further ahead every 3 matches. From the
  second lap every rival plays with at least the Legend Cup rival's feet, in its own style.
- Score: courts now score like the tours (touch x combo, won point, match bonus, scaled by court tier) and post the run score to the
  same `tennis` board; the device record stays the best rally. Stars: the same three conditions, judged per match won.
- Score panel: "Match 4 · Harbour" with the balls as three red pips, the run points in the foot. Results name how far the run got.
- Checks: `tests/tennis-endless.cjs`, `scripts/check-tennis-endless.cjs --port=<n>` (fast by default, `--full` for whole matches).

## Budget (phone profile, `scripts/measure-arcade-games.cjs` counters, dev server, desktop Chrome: no phone temperature measured)
Median draws (max) / triangles / GL textures. Before: 48 / 45.5k / 16 on court 1, about 53k triangles on the evening.
After: court 1 46 (49) / 34.9k / 14; lantern evening 42 (50) / 39.0k / 14; the lawn 45 (52) / 37.6k / 14; pier 41 (44) / 31.6k / 14.
Menu 0 frames. Details and the removed list: `docs/performance-guide.md` (Nov 10 2026, tennis comic entry).

## Falls short (ranked)
1. Transient frames pass 48 draws (up to 52 on the lawn): the aim, landing, countdown and bounce-spot rings are separate decals.
2. Casters carry ink hulls, so they cannot receive shadows: palm shadows stop at the wall and the clubhouse.
3. The members are very small on a phone and read as coloured dots; the lost-point panel is small.
4. The sea is a narrow strip on beach stops (the beach was shortened to bring the horizon into frame).
5. The low strike beat shows the court sheet's ink strokes at a grazing angle, where they shimmer a little.
