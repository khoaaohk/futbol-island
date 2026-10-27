# Futbol Pinball round 3: hard divisions, cinematic beats, living table, simpler card (Oct 26 2026)

Follows `ARCADE_PINBALL_UPGRADE2_OCT26.md` (full-screen cabinet, action camera, thumb pads). Owner brief: better graphics,
controls and gameplay, HARD levels, a cleaner menu, easier for kids. Mid-round additions: cinematic camera beats with a
short slow-motion set-up, and a more dynamic, living table.

## What changed

**Ladder: six divisions, two of them HARD** (`lib/games/soccerPinball.ts`, `PINBALL_DIVISIONS`).
- 1–4 are unchanged: Build Up, Find the Corner, Play the Angles, Complete Forward. A run climbs one division per
  2 goals and tops out at 4. The Cup Final still starts after 8 goals from Build Up.
- **5 High Press**: shorter flippers (59 instead of 63, so the centre gap widens from about 49 to 57 px). The three
  training cones turn slowly around their centre ("rondo cones", the moving bumpers). Mode timers are 25% shorter, the
  ball save is 2 s, and each new ball starts a **RUSH clock** (25 s). A goal before the clock runs out pays +800, and
  that goal is also the division challenge (+800). The lesson is to score before the defence is set.
- **6 Champions Night**: 57-length flippers and faster cones. A green **sweeper-keeper** patrols the edge of the box
  (y 124), shadowing the ball. He blocks but never parries. Every ball becomes a **2v1 multiball** once it is out on the
  pitch, the rush clock is 20 s, and the ball save is 1.5 s. The challenge (+1000) is a goal in the 2-ball attack.
- The keeper and defenders already scale with the division (think rate, lead, pace, pass speed), so they run sharper
  at 5 and 6 without new code.
- **Unlocks**: a run's saved rung is `pinballUnlockReach()`, which returns the division reached, or 5 once Complete
  Forward has its goals star. A run started at 5 can climb to 6. The start card also opens the hard tier for older
  saves whose stars show Complete Forward was already cleared. `arcadeRecords` already capped `unlocked` at 6, so the
  record format is unchanged.
- **Stars**: 6 × 3 = 18. The `fi2-pinball-stars-v1` save is read as 4 or 6 entries (4 is padded with two zeros) and
  merged as before, so no progress is lost. The economy is unchanged: coins still come only from goals and moves at
  the same rates.

**Kid helpers.**
- Beginner ball save: a player whose best score is under 4,000 gets 8 s (instead of 5 s) in Build Up and 6 s (instead
  of 4 s) in Find the Corner. Players who started higher on the ladder never get it.
- Nudge is optional (card options, "Nudge button", on by default). When it is off, the Nudge pill is hidden during
  play and Space no longer nudges.
- The tutorial hint shows once ever: "Tap = left kick / right kick" labels over the waiting table. They go away with
  the first launch (`fi2-pinball-tutorial-v1`). The tip line above the pill already explains how to launch.

**Start / pause / full-time card** (`components/games/PinballCard.tsx` + `.module.css`; tennis and Breakaway Run keep
the shared card):
- One big gold **Play** button (80 px tall; Resume when paused, Play again at full time).
- The ladder sits in one row of six 56 px chips with numbers and stars. Locked chips show a lock, and 5–6 sit under an
  orange HARD rail. Picking a hard chip turns the card orange.
- Three 52 px icon buttons: leaderboard, options (gear: the nudge switch plus the controls help) and back.
- Full time shows the big score, a one-line summary, one coaching takeaway and the ladder, so the next division is one
  tap away.
- Nothing scrolls at 390×844, 820×1180 or 1440×900. The last pick and the nudge option are remembered per device
  (`fi2-pinball-prefs-v1`).

**Cinematic beats** (`lib/games/soccerPinballCinema.ts`, a small reusable helper):

| beat | when | slow-mo | length | camera |
|---|---|---|---|---|
| keeper | a fast shot will reach the goal within 0.35 s | 0.4× | 0.7 s | push on the goal mouth |
| launch | a charged plunger release (≥ 86%) | 0.5× | 0.55 s | follows the ball up the lane |
| save | the goal-line saver clears a ball | 0.4× | 0.6 s | push on the saver |
| target | multiball start (not Champions Night's automatic one), the dugout scoop or the skill shot | 0.5× | 0.6 s | follows the ball |
| drain | "bullet time": a falling ball clips the tip of a resting flipper | 0.3× | 0.5 s | follows the ball |
| goal | replay-style push on the net (the sim is already stopped) | none | 1.2 s | push on the net |
| mode | a bonus mode starts: a sweep from goal to flippers and back | none | 1.6 s | sweep |

Limits:
- Only one beat runs at a time. Slow motion runs at most once every 6 s; camera-only beats need a 2.5 s gap.
- Any flipper press (a tap anywhere is a flipper press) ends the slow motion in the same frame, and the camera eases
  back over 0.25 s. So the flippers are never slowed: the sim runs at 1× before the press is simulated.
- The time scale eases in over 0.1 s and back out over the last 30% of the beat.
- The camera blends the beat into its shot (`createPinballCamera().update(dt, s, cine)`). While a beat is active, its
  zoom and pan limits rise from 0.62 to 1.5 per second and from 12 to 18 units per second. It stays damped, with no
  roll and no FOV change (the push is a dolly). The safety pass still keeps every live ball above the thumb pads.
- Reduced motion: no beat ever triggers.
- The helper allocates nothing per frame (tested).

**Living table** (`lib/games/soccerPinballMissions.ts` for the rules, `lib/games/soccerPinballHype.ts` for the visuals):
- **Hot zone ("find the space")**: a gold ring lights one of five open spots for 11 s (9 s from Play the Angles, 7 s
  in the hard tier). It shrinks as its time runs out and blinks near the end. Rolling through it pays 250 + 50 per hit
  (×2 in the hard tier), with a chime, an "IN THE SPACE!" pop and a coach line. The lesson is to attack the open
  grass, not the defender.
- **Hype** (0–1) rises with alternate-foot combos, hot zones, multiball and goals, then drains slowly.
- **Chase lights**: 26 rail lamps in one instanced draw. A wave chases round the left rail, the top and the lane
  divider. It speeds up and brightens with hype, and turns gold at full hype. The lamps nearest the ball glow, so the
  lights react to the ball. The hard tier uses an orange palette and a darker purple floor. Under reduced motion there
  is no chase, only the glow near the ball.
- **Crowd and commentator captions** (the pooled canvas pop-ups):
  - Each goal gets a second line that names the idea behind it: BEAT THE CLOCK!, CHALLENGE DONE!, FOLLOWED IT UP!,
    INTO THE CORNER!, WHAT A MOVE!, TWO ON ONE! or WHAT A FINISH!
  - A 4× combo gets "THE CROWD IS ON ITS FEET!".
  - A tip near-miss gets "OOH! SO CLOSE!" and a sweeper stop gets "SWEEPER SAVE!".
- Squash, trails, hit-stop, sparks, net ripple and confetti were already in place and are unchanged.

**HUD**: during a hard-tier rally the rush clock replaces the match minute ("RUSH 20s · DIV 6 · …"). Stars show as
`n/18 ★`.

**Script fix**: in `scripts/check-soccer-pinball-browser.cjs`, the stale `/FINISH/` step now checks the lit-goal state
(`moveTime > 0`) and that the tip row shows a coach line. The script also turns the cinematic slow motion off for its
frame-stepped physics and pose fixtures. It now passes end to end on mobile, desktop and mobile with reduced motion.

## Cost (headless Chrome, 390×844, `renderer.info.render.calls` in the same scene)
- Divisions 1–4: **+1 draw call** (chase lights), plus 1 while a hot zone is lit. Division 6 adds about 4 for the
  sweeper rig. The rig is hidden below Champions Night, so it costs nothing there. Measured: 84 without the new pieces
  vs 90 with all of them visible at division 6.
- Per frame:
  - 26 instance colours written while playing. Nothing is written while the table waits on the plunger, so it still
    sleeps.
  - 3 cone matrices, only in the hard tier and only when the angle moves.
  - One ring transform for the hot zone.
  - The beat watcher diffs a few counters.
  - No allocation, no new lights, no new loops.
- The sim adds a handful of comparisons per 480 Hz substep.
- Slow motion makes each frame do less sim work, not more.
- The card is static DOM. The tutorial's CSS pulse runs 4 times and stops.

## Tests / QA
- `tests/pinball-r3-oct26.cjs` (in `npm test`) covers:
  - ladder climb and caps, unlock reach, and the cleared-top-division rule from any start
  - hard modifiers: flippers, save times, rush and its challenge, rondo cones, the sweeper saves, the auto 2v1 and its
    challenge
  - beginner save and the nudge option
  - hot zone and hype
  - star migration from 4 to 6 entries
  - beat caps, skip, reduced motion, time scale, the watcher triggers and tip detection, and no allocation
  - camera and beat: it pushes in, the ball stays above the pads, then it settles; reduced motion keeps the camera
    fixed
  - card and wiring source checks
- Existing pinball tests are unchanged except one: `pinball-table.cjs` now expects 6-entry star saves.
- `scripts/qa-pinball-r3-browser.cjs` (`FUTBOL_BASE_URL=… --size=WxH`) passes at 390×844, 820×1180 and 1440×900 with
  synthesized touch and no page errors. It checks:
  - the card fits, the chips and Play are big enough, there is one primary button, and the ladder locks
  - the options panel and the nudge switch
  - the tutorial shows once and goes away with the launch
  - the setup reaches the run
  - a charged-launch beat slows the sim (about 0.58× over the first frames) and a flipper press restores 1× at once
  - Champions Night: the sweeper, hot zone, chase lights and rush HUD
  - the full-time card opens High Press after Complete Forward
- `scripts/check-soccer-pinball.mjs` (not in `npm test`) still fails its combination-points line, as it did before
  this round. Its 50-point expectation predates the read bonus.

## Eyeball on a real phone
- Whether the keeper and bullet-time slow motion feels exciting rather than sluggish, and whether a tap always makes
  it snap back instantly.
- The goal replay push and the mode sweep on a small screen: there should be no queasiness.
- High Press / Champions Night difficulty: whether a decent player clears the rush and the 2v1 challenge within a few
  tries.
- Whether the hot-zone ring and chase lights read in bright light without cluttering the table.
- The start card at 390×664 (Safari toolbar shown): the Play button and ladder chips under the thumb.
