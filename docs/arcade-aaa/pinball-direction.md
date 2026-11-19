# Futbol Pinball direction: "The Beach Board" (comic house style, Nov 10 2026)

One sentence: a pinball pitch-board on a boardwalk at the edge of the Breakaway coast at golden hour, printed like a comic page.
Supersedes the machine direction (wood, chrome, bulbs, amber dot-matrix): the owner ruled "make the pinball game the same style as
Breakaway" and "all these games should be in the new style". Layout, rules, scoring, missions, patterns teaching and feel are unchanged.

## Shared with Breakaway and Pass Puzzles (one implementation)
- 3D: `lib/arcade/comic/` (band shading, halftone turn, violet shadows, sun rim, ink edge, inverted-hull props, `comicLook`, the painted
  coast). HUD: `components/games/comic/` (`comicRoot` tokens, shared pill, pause card, boards, high-score entry, `ComicBurst`).
- Palette (hex): ink `#231a2e`, paper `#fff3d6`, sun `#ffc83a`, orange `#ff8a3c`, red `#f0452e`, teal `#19b5a5`, blue `#2f6fb0`,
  turf `#57b56a` / `#49a660` / shade `#3b8f55`, deck and sand `#f4d08c` / `#e7c27e`, sea `#1f8f96` / `#2b6fa3`.
- Read colours (teaching): left foot sun yellow, right foot blue `#4aa3e8`, the box and danger red.

## Its own world
- Playfield: ONE canvas print (`paintPinballPlayfield`): flat turf in two mown bands, a dot screen of the shade tone toward the
  touchlines, paper lines over an ink copy offset down-right, FUTBOL in heavy italic capitals with a block shadow, sun arrows, the
  unlit inserts as flat muted discs in an ink ring. No grain, wear, gradient or baked light.
- Board: red-and-white kerbs, advertising boards behind the goal, a sun-yellow front kerb, orange posts with paper rings, sun-and-red
  slingshots, red-capped bumpers, a red dugout roof, on a boardwalk on the sand. Every standing part keeps its height and carries its
  ink outline as an inverted hull: ONE shadow-casting draw (palms and parasols join it off phones).
- Coast: sand with printed ripples, the surf line right behind the hoardings, and the kit's painted golden-hour coast (sun cut as
  discs, headlands, glitter path) on one unlit backcloth leaned back from the surf, so the sea and the low sun sit in the top of the frame.
- Light: one white sun 22 degrees up, beyond the goal and to the left: posts, bumpers, figures and the ball throw long violet shadows
  down the pitch that break into Ben-Day dots at their edges. No tone mapping, env map, emissive or fog haze. The lights never change.
- Figures: the shared bean rigs, cloned inside this scene as matte flat colour with bands, rim and ink edge, on paper mounts; they keep
  the motor-figure motion (eighth-step facing, rock on the peg, keeper lunge) and the one low-poly shadow proxy.
- Ball: a comic football (paper leather, ink panels, sun rim, ink edge) with its real cast shadow (the blob is gone).

## Lights are print
- One shader for every lamp (`printLampMaterial`): the level is cut into four printed steps: a dotted disc, a solid disc, a solid disc
  with a Ben-Day ring, a hot disc with the full ring. Black prints nothing. Lamps over lettered inserts print as a thick ring so the
  letter stays readable. The dots are the shading's own screen. No texture, no additive blending.
- Light shows (launch chase, goal rows, drain wipe, mode spiral, nudge, game over) run through the same formula as before, now as
  rhythmic colour-and-dot chases. Page tone: a drain and full time drop the light band to dusk violet in quarter steps; a goal prints
  it hot for half a second; elite tiers tint the light band.

## Hits and beats
- Bumper, sling and target hits pop a small ink-backed impact star that snaps out in three steps. A drain lands an ink splat in the
  drain mouth. A goal gets the starburst word (the kit's `ComicBurst`) with the points caption. A nudge shakes the page frame.
- Game over: lamps flash twice and clear from the flippers up while the GAME OVER burst shows: 1.4 s, skippable by a flipper press.

## HUD (owner, Nov 10: "less of the sign at the top", "the sign is not as important")
- No display band. The score is the shared top-bar pill; a tiny status tab hangs under it (minute, three to five ball pips, division, and the
  endless level `LV n` as a sun block at its end).
  Calls (goal, save, drain, mode, combo, new best, game over) are temporary bursts over the upper table with small drawn animations
  in finite `steps()`; nothing runs at rest (one timeout per call).
- Flipper keys are paper keys with printed discs (sun / teal, flat colour changes for ready and held), Launch is a sun key with a
  printed charge fill, Nudge a paper key, the coaching line a paper caption box above the nudge key. Start card and results: kit pieces.
- Camera: the table starts under the top bar's foot on every screen; upright phones are solved on the drain mouth, so the flippers
  have clear room below them and the outlanes, drain and apron are in view above the keys. The desktop hoarding/backglass is gone.

## Sound (synthesised one-shots, trim + limiter bus, 14 voices; the fixed roll voice kept)
- Wood block + rim-shot for flippers, steel pan / kalimba on a C pentatonic for targets and lanes, cajon thump for bumpers, a tighter
  slap for slings, a pan fanfare with two claps for goals, a falling kalimba run and a dull cajon for a drain, knock + shaker for a nudge.
- Probe (`scripts/check-arcade-audio.cjs --port=<n> pinball`, peak RMS): flipper 0.016, bumper 0.027, goal 0.051, drain 0.042, menu 0.

## Budget (phone profile, `scripts/measure-arcade-games.cjs pinball`, dev server, desktop Chrome: no phone temperature measured)
- Draws 69 (max 70; was 78), triangles 33.3k (was 33.8k), GL textures 14 (was 15), menu 0 frames, ready table 0 frames.

## AAA pass (Nov 18 2026): what changed
- Found by playing: the plunger voice was never fired (and read the plunger after it had snapped back to 0); a new ball, the near
  miss at the drain and the end of the ball save were silent; flipper, foot-block and slingshot sounds never varied; holding
  Launch at half power scored from 16 of 27 launches with no flipper pressed (Division 4, 34k); nothing on the table built toward
  a jackpot; the scene never changed over a long run.
- Kick-off rule (`s.kickoff`, `PINBALL_KICKOFF_Y`): a ball straight off the plunger cannot score. Until a flipper kicks it or it
  comes down into play, the goal line plays as the top rail, with a knock and the call KICK IT FIRST! The skill shot still pays.
- Golden Pot (`s.pot`, `PINBALL_POT_STEP` 10, `PINBALL_POT_MAX` 1000): every bumper, cone and slingshot hit fills the pot. A goal
  wins it times the goals on this ball (2 = BRACE, 3 = HAT-TRICK, the cap). A lost ball empties it. Read three ways: the ink chip
  on the status tab (`POT 320 ×2`, red when full), the five red box lamps as its meter, a rising two-note cue per lamp with a
  call at the first, third and last. A hat-trick gets the big confetti and a longer freeze.
- Evening by level (`PINBALL_EVENING`): each full-time whistle prints the next step of the sunset on the light band (golden hour,
  amber, orange, rose, first dusk). Classic ladder only; two uniforms; this replaces "the lights never change" for the band's tint.
- Sound added: launch (with its real power), new-ball click, near-miss tick and crowd breath, save-off notes, pot lamp steps,
  the pot's coin run after the fanfare (it would take the fanfare's voices in the same frame), the surf bed (`pinballSeaSound`,
  one voice built once, fed only while a ball is in play). Pitch jitter on flippers, foot blocks and slingshots (left board lower).
- Bots (24 seeds, 30 fps, tap launch; before -> after, p50 / max): careless 181k / 476k -> 204k / 474k; semi-skilled 347k / 553k ->
  340k / 573k; good 467k / 722k -> 479k / 750k. Same range: the pot adds about 5%, the kick-off rule takes the free goals away.
- Budget (phone profile, dev server, desktop Chrome): open play 61 draws (max 64), 26.3k triangles; goal beat 61 (max 63), 25.4k;
  GL textures 15. No mesh, material or texture added.

## Falls short (ranked)
1. DONE (endless pass, Nov 10): a run ends only on the last ball; full time is a whistle, the level rises (ramp table in
   `lib/games/soccerPinballEndless.ts`), the status tab shows `LV n`. Still open: the ramp was tuned on bots, not on children.
2. The hoardings and the keeper are backlit, so they print in the shadow band and read dull next to the sunlit pitch.
3. Small legends (STAR LANES, BUILD UP) are still tiny on a phone; palms are boards and cones, cruder than Breakaway's.
4. Call bursts cover the goal mouth for a second or two; passing calls are narrower but still sit on the wall.
5. DONE (fix round 2): the n-th tap launch of a run leaves the plunger up to 0.03 softer or harder (`pinballTapSpread`, a fixed
   sequence, no random number: same inputs, same run). The first ball of every run is still the plain tap.
6. PART DONE (fix round 2): levels 6 to 12 run faster and levels 5 to 12 give a shorter save. A semi-skilled bot held at one level
   lasts 6.4 min at level 6 (was 7.7), 4.2 at 8 (was 5.2), 1.6 at 12 (was 2.6). A full run is still about 14 minutes at the
   median, because the median bot run ends at level 4 and levels 1 to 4 were left alone for young children.
7. DONE (fix round 2): the sky and sea backcloth takes the evening step too (its material colour; no new draw).
8. File and hook names kept from the machine passes (`soccerPinballCabinet.ts`, `data-pinball-dmd`, `giHeat`).
