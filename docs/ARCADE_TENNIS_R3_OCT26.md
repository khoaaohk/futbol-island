# Futbol Tennis, round 3 (Oct 26 2026)

Cabinet `tennis`. This round builds on `docs/ARCADE_TENNIS_UPGRADE2_OCT26.md` (hold to power and the dynamic camera). The goals were hard courts, a gentler first court, a cleaner menu, cinematic beats, a "more dynamic" feel, the rally counter and streak rewards, and a clearer bounce spot.

## 1. The ladder: 9 courts, 3 of them HARD (`lib/games/soccerTennis.ts`)

Every court now carries the same modifier fields (`MOD`): `to`, `wind`, `bounce`, `skid`, `spin`, `sets` and `hard`. The first six courts keep their values, so their rules have not changed. The exception is court 1.

| # | Court | Surface | New in round 3 |
|---|---|---|---|
| 1 | First Touch | hard | **Gentler**: first to 5 (was 7), slower rival shots (pace 1.18 vs 1.08), looser reads (error 1.3), softer cap (sharp .66), slower reaction (.34 s) |
| 7 | Windy Pier (HARD) | clay | **Wind**: a new direction each point, 60–100% of 1.5 m/s² sideways. The rival allows for it fully; your shots get 35% help, so you learn to aim into it. Clay grips (skid .9, bounce ×1.06). 3rd ★: a 10-touch rally |
| 8 | Bounce House (HARD) | neon | **Bouncy floor** (restitution ×1.24) and **banana spin**: the rival's drives carry 10–14 rad/s of sidespin that curls out toward the line. The solver still lands the ball on target, so the landing ring stays honest. 3rd ★: 2 Golden Touches |
| 9 | Legend Cup (HARD) | grass | **Best of 3 sets**, each first to 4. Spin 18, a .8 breeze, and grass that skids low (bounce ×.88, skid 1.08). 3rd ★: win without losing a set |

- **Rival on the hard courts**: tier 6 (the AI formulas extrapolate cleanly) with the champion style.
  - Foot speed 5.8 → 6.2, reaction .16 → .14 s, sharp .9 → .92, wider aim (3.6–3.8).
  - No hidden assist on tier ≥ 5. The bounded comeback assist (`s.assist`) still works everywhere.
- **Wind in the physics**: `TennisBall.wind` feeds `accel()`, so `flight()` includes the wind. Every prediction (the landing guide, the bounce spot, the rival's read) stays true.
- **Scoring state**: `pointsPlayed` counts every point and never resets. The feel layer and the frame loop use it to detect points, because the score goes back to 0 : 0 when a set ends.
- **Fairness check**: a scripted auto-player completes every court at 30, 60 and 120 Hz (`tests/tennis-circuit.mjs`). The hard courts take longer (about 12–17 points against 7–11). The bot is not a child, so tune these numbers on a real phone.

## 2. Rally counter and streak rewards

- **Rally milestones** at 5, 10, 15, 20 and 30 touches (`TENNIS_RALLY_MILESTONES`). Each one gives:
  - a "RALLY 10!" banner that says "+1 gold"
  - +1 on the Golden Touch meter
  - a crowd roar (louder for longer rallies) and a floodlight flare
  - streamers from 10 touches up
  - the streak fanfare cue
  - a push-in
- **Live rally chip**: an in-play chip row in the top-left, `pointer-events:none`. It shows "Rally N" (gold from 10), "Wind ◀◀" on windy courts and "Sets 1 : 0" on the cup.
- **Floodlights**: the floodlight pools warm up as a rally grows (`tennisRallyGlow`, +0.2 opacity at most) and settle between points.
- **Sets**: winning a set has its own banner ("SET TO YOU!"). Match point only counts on the deciding set.
- **Wind call-out**: on windy courts, the first touch of each point shows "WIND ◀◀ · aim a little right ▶".

## 3. Bounce spot (`lib/arcade/tennisBounceSpot.ts`, new)

- One flat decal (dot, ring and four ticks, drawn once into a 128 px canvas) sits on the exact bounce of the rival's ball, from the sim's own `landX/landY`. It needs no extra flight prediction.
- It shrinks from 1.18× to 0.62× as the ball closes in, so it works as a countdown.
- It hides after the bounce, after a net clip, and when the ball is flying out (the existing red "let it go" ring takes over).
- The yellow "stand here" sweet ring stays, so the two read as "ball lands here, you stand there".

## 4. Cinematic beats (`lib/arcade/tennisCinema.ts`, new; owner request)

A pure director with no three.js inside. Each frame it returns `{scale, close, follow, push, flash}`.

**Strike beat (slow-mo)**
- **Triggers**: your sweet power strike or Golden Touch (strength 1), a bicycle or scissor (.9), a slam or shark (.8), a power strike (.6), or a clean volley (.45).
- **Clock**: the game clock eases down to 0.3× over 0.1 s, holds for 0.4–0.7 s of real time (longer for stronger strikes), then eases back to 1× over 0.35 s.
- **Camera**: it swings into a closer 3/4 shot over your shoulder. The look target then whips from you to the ball as it leaves, and the camera pulls back to the rally framing.

**Caps**
- At most one slow-mo every 6 s. A capped strike gets a push-in instead.
- At most one push-in every 2.5 s.
- The close-up weight is at most .62.
- The push is a dolly of at most 10%, with no FOV change and no roll. Every curve is a smoothstep.

**Push-ins**: an ace, match point (at the serve), a rally milestone and a sliding save each get a 0.9 s push-in that then settles.

**Wind-up**
- On your serve, holding a shot eases into the 3/4 shot (weight .42).
- In a rally, holding gives only a 3.5% dolly, so the incoming ball stays in view.
- There is **no slow-mo during a hold**, because the gold window runs on game time.

**Control**
- Input stays live in slow-mo.
- Any shot button, a canvas tap or the start of a wind-up skips the beat (back to 1× in 0.12 s).
- The rival's incoming ball cancels slow-mo at once.

**Reduced motion**: no slow-mo, no close-up and no push. A beat becomes a gentle flare of your light pool (pool flashes now show at 0.6× under reduced motion instead of not at all).

**Code changes**
- It replaces the old 0.62 s slam/scissor beat in `arcadeGames.ts`.
- `needsFrames` includes `tennisBeat.active()`.
- `runtime.tennisBeat()` is a QA read.

## 5. Dynamic feel and visuals

- **Surfaces**: shared material swaps on the two court halves, with no new draws.
  - **Clay**: terracotta.
  - **Neon**: a glowing purple bounce floor.
  - **Grass**: two-tone green.
  - **Sand** and **hard** are unchanged.
- **Ball trail**: now an additive, unlit comet (MeshBasicMaterial). It is the same single instanced draw and is cheaper than the lit spheres. It is 1.35× bigger on sweet or golden strikes.
- **Kept from earlier rounds**: split-step hops, plant puffs, net-cord wobble, hit-stop, crowd wave, celebrate and droop poses, and the adaptive assist.

## 6. Menu (`components/games/TennisCard.tsx`, new; `TennisCourtPicker.tsx` rewritten)

The tennis card replaces the shared card for tennis only. Other cabinets are untouched. The changes in `ArcadeGame3D.tsx` are one ternary and one chip line, scoped by `kind==='tennis'`.

**Start card**
- Title.
- A court row: six chips (number, stars or a lock icon) plus a "HARD" row with courts 7–9. Each chip is 48×56 px.
- One info box: the court name, the rival and its habit, up to three modifier pills (Clay, Wind, Best of 3, First to 5…), and your best stars.
- A first-time tip, shown only once (`fi2-tennis-r3-hint-v1`, a device key registered in `lib/saves/snapshot.ts` and `docs/accounts-design.md`).
- One big **Play** button (64 px, with "3 coins" inside).
- Small icon buttons (56 px): Scores, How, Arcade. "How" is the single chevron that swaps the court row for the touch guide, the star rules and the help text.

**Pause card**: the score, the sets line, Resume, and the small buttons.

**Full-time card**
- "COURT WON!", "GOOD GAME!" or "CHAMPION!".
- A big score (sets on the cup).
- Three stars that pop in (static under reduced motion).
- Three stat chips: best rally, perfect, sweet.
- A "Next up: court 8, Bounce House (HARD)" or 3rd-star line.
- The coach takeaway line.
- One primary button: Next court, Retry court or Defend the title.
- Small buttons: Scores, **Courts** (back to the picker) and Arcade.
- The long header detail at full time is now just "Full time".

**Saves and controls**
- **Saves**: `arcadeUnlockCap('tennis')` is 9 (other games stay at 6). The key and shape are the same; old saves read unchanged, and winning court 6 unlocks court 7. The stars array pads with zeros.
- **Coins**: the coin and economy rules are unchanged.
- **Kick button**: on touch screens, Serve/Kick is now an 80 px target. It overflows its 58 px cell and keeps a 5 px gap to its neighbours. The other buttons stay 58 px.

## Cost (headless Chrome, rally view)

| Screen | Draw calls during a rally |
|---|---|
| Phone 390×844 | 49–52 |
| Desktop 1440×900 | 88 (crowd included) |

**What's new**
- **The bounce spot**: +1 draw, only while a rival ball is in the air.
- **Streamers on a milestone**: they reuse the confetti pool, +1 draw only while alive.

**No change in draws**
- Surfaces are material swaps.
- The trail is the same single draw, now unlit.
- Cinema is camera math only.
- The chips are DOM, updated at the existing 100 ms HUD cadence.

**No per-frame allocation**
- The beat returns one pooled object (this is tested).
- The bounce spot and floodlight glow mutate in place.
- The floodlight opacity is written only when it changes by more than 0.004.

**Sleep**
- The serve loop still sleeps.
- `active()` covers the roar flare and the glow settle, and returns false once they finish.

## Tests

`tests/tennis-r3-courts.cjs` (new) covers:
- the 9-court ladder
- the gentle court 1
- wind drift both ways
- the bouncy and grass rebounds
- banana spin
- a full best-of-3 cup with a set reset
- set-aware match point and wind arrows
- the hard-court stars
- rally milestones and gold
- the 9-court save cap with old saves and padded stars
- the bounce-spot scale

`tests/tennis-r3-cinema.cjs` (new) covers:
- the slow-mo band (0.25–0.4×) and the ramp back to exactly 1×
- the slow-mo length cap and the frequency cap
- skip, and the cancel on the rival's return
- push-in settle and its cap
- the wind-up behaviour
- reduced motion = flash only
- the pooled state

Updated:
- `tennis-depth` (9 courts)
- `tennis-arena-feel` (the match-point fixture moved to court 2; the test bumps `pointsPlayed`)

Headless Chrome QA used `--mute-audio` with synthesized touch at 390×844 and 820×1180, plus the mouse at 1440×900, and a reduced-motion pass. It checked that:
- no card scrolls
- every button is at least 48 px
- the court pick plays the right court
- the hint is shown once
- a held Kick serve runs the beat (scale 1 → 0.3 → 1, close .62 → 0, follow → 1)
- the bounce spot shows
- the chips show
- the full-time card appears and **Courts** returns to the picker with the new unlock
- there are no page errors

## Eyeball on a real phone

- The slow-mo after a sweet serve or a slam: does the 3/4 swing feel good or dizzy? It is capped at .62. Tune `TENNIS_BEAT.close` and `slowMax` if needed.
- The wind on Windy Pier: is a 35%-helped drift fair for kids? Watch whether shots sail out.
- Bounce House: can kids reach the high bounces? It may want the Header button called out more.
- Legend Cup length: about 12–20 points.
- The clay colour under the glass grid reads quite dark. Consider brightening it.
- The 80 px Kick sits close to the right edge on narrow phones (7 px), so check the reach.
- Not tested on a real iPhone. No thermal claim.
