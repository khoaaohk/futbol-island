# Bug catch upgrade (Oct 25 2026)

User: "improve the bug catching job and mechanism. add more detail to the movements of catching the bugs using the net and jar.
improve the game play for this".

## 1. Audit: how catching worked before this pass

**Controls (phone, portrait).** On a Bug squad shift the action cluster shows Swing net (day) or Cup (night, the firefly jar), Net
down / Net up (the stalk: slow steps, calmer bugs) and Ride (scooter / bike / moped; Swing while riding hops off). A quick tap on
the screen near a bug swings at it (`TAP_RANGE` 5.5 m, `TAP_SCREEN_SLOP`). The ➤ button shows the nearest uncaught bug for 7 s.

**Swing.** `bugCatch.ts SWING` = wind-up 0.3 s, hit frame 0.58 s, sweep end 0.85 s, end 1.25 s. Swing auto-aims at the nearest
uncaught bug within `AUTO_AIM_RANGE` 4.2 m (all round). The locked bug holds still until the hit frame (`swarm.hold`). If
`predictCatch` says it connects, the swing plays as the **catch stage** (push-in, plain backdrop, the swing, a 70 ms hit-stop,
the bug sucked into the hoop, the bag flipping shut, the raise with a hop, the name, the story card). Otherwise the swing plays on
the island and is resolved at the hit frame (`swingResult`). Reduced motion: no stage, the quick island catch.

**Jar.** Day: a small jar at the hip shows once a bug is caught (it only pulsed in scale, `jarPop`). Night: the tool *is* the jar
(`bugJar.ts`): the Cup scoop, a hinged lid that snapped shut, a glow that fills with each firefly.

**Feedback.** Hit: the stage (or sparkles + the `netcatch` pose), `jobCue('jar')`, `tapHaptic`, the story card. Miss: the nearest
bug within 10 m startles away and one toast ("Whoosh! Just missed. Sneak a little closer, then Swing." or "No bug close.").

**Escape per species.** `bugFlight.ts FLIGHT_PROFILES` already gives every movement style its own motion (butterfly glide,
dragonfly dart, damsel / bee hover, hop arcs, beetle trundle, ground dash, ant march, mantis stalk, spider jump, ...) and
`SNEAK[rarity]` sets how near a kid can walk before a bug notices (common 2 m … legendary 5 m, more when running). Fireflies pulse
their glow sprites. These were kept as they are.

**What felt flat or unclear for kids.**
- No way to know *before* swinging whether a bug is in reach: the halo was the same gold whether a swing would catch or whiff.
- The miss line said "sneak closer" but not how much closer, and did not say when a bug was simply too high.
- The island swing had no outcome: a catch on the island did not even close the bag (it called `close(false)`), and a miss ended
  exactly like a hit. The hoop's arc also jumped about 1 m at the end of the sweep.
- The body pose ran for 0.62 s while the net swing ran 1.25 s: the body was already in its follow-through at the hit frame.
- The hip jar only scaled; the night jar's lid snapped with no screw, no shake, and the firefly sat still as a lamp.
- No reason to chain good catches; every shift was equally hard from the first swing (a new player and a full squad alike).
- Jar progress was text only (`Today's jar 3/6`) and only in the open panel.

## 2. What changed

**Movements**
- Net swing phases (`bugNet.ts swingAim`): a *ready* dip before the wind-up, the wind-up easing into a cocked hold at the top, a
  low sweep through the hit frame that now ends where the recovery starts (no jump), then the outcome: a **catch flicks** the
  hoop up and over and closes the bag (`outcome('hit')`, reopened at the swing's end), a **miss follows through** further across
  the body with a wobble and kicks the empty bag's spring (`outcome('miss')`). One reused result object, no allocation.
- Body (`jobPoses.ts netswing`): a ready key (knees bend, a small turn) and a follow-through key; `POSE_TIME.netswing / jarcup`
  0.62 → 1 s so the body's sweep lands near the net's hit frame.
- Firefly jar (`bugJar.ts`): the lid now snaps shut, then **screws on** (1.5 turns, `JAR_SCREW_S`), then the jar gives a little
  **shake** (`JAR_SHAKE_S`); opening, it **unscrews first**, then the hinge swings back. The firefly **flutters inside** the glass
  (the glow sprite loops a few cm, more during the shake). A miss wobbles the empty jar.
- Day hip jar (`jobScene.ts updateGear`, timeline `bugCatch.ts jarTip`): after each catch the lid unscrews and lifts, the jar
  tips toward the net (the bug drops in), the lid screws back on, a little shake. Reduced motion never starts it.
- Bugs react to the net (`bugSwarm.ts`): a locked bug trembles (roll / pitch only, it never moves, so the catch stays fair).

**Gameplay**
- Aim ring (`aimState`, `jobScene tickAim` at 8 Hz): the nearest bug's halo turns **green** (thicker, faster pulse) when a swing
  now would catch it, warm gold when a few steps more, and the Swing button glows green (`data-job-ready`); one light haptic tap
  when it turns ready (at most every 1.5 s).
- Near-miss coaching (`missKind`, `missHint`, `stepsToReach`): "So close! One more step in, then Swing." / "2 more steps" /
  "Too far away. Walk closer until the ring turns green" / "It is up high! Wait for it to flutter down".
- Gentle ramp (`catchEase`, `CATCH_RAMP`): the first catch of a shift gets a 1.3× window (lock reach and sweep), easing to 1×
  by the fourth; a brand-new squad (fewer than 3 species) keeps 1.15×; rarer bugs need to be a little closer (uncommon 0.97,
  rare 0.93, legendary 0.9). Always clamped to [0.9, 1.3].
- Catch streak (`streakAfter`, `streakCheer`, `STREAK.cap` 5): catches in a row; a swing with no bug near is only a whoosh and
  keeps it, a real miss resets it. Football words: "Two in a row: a brace!", "Hat-trick! Three in a row, like three goals in one
  match." A ding on the streak and bigger (bounded) sparkles. **No coins**: the economy is unchanged.
- Jar meter: a thin fill bar under the pill's title and in the open panel, plus "· 3 in a row".
- Release one bug: **not added**. Bugs leave the jar only in the release cinematic at the drop-off; a per-bug release would need
  new UI in the one-line pill and changes the shift goal. Left for the owner to decide.

**Heat / perf.** No new meshes or textures; one uniform on the existing halo; the aim check is one swarm query at 8 Hz while a
shift runs (nothing otherwise); the jar timeline and swing aim write into reused objects. Reduced motion: no tremble, no screw
spin or shake, no hip-jar tip, the ring snaps instead of easing, the button glow does not pulse.

## 3. Tests

`tests/bug-catch-feel.cjs` (chained in `npm test`): the ramp's bounds and order, lock reach, aim states, miss copy, streak cap
and no-coin rule, the jar tip timeline, net swing continuity (plain / hit / miss), the ready dip, the hit flick vs the miss
follow-through, the jar's screw lid, shake, unscrew-before-open and flutter, pose timing, and the wiring. `summit-bugs.cjs` now
expects the near-miss coaching line instead of "Just missed".

## 4. Needs the owner's real-phone check

- The green ring and the Swing button glow read clearly in sunlight on a phone, and the ready haptic is not too chatty.
- The 1 s swing pose (was 0.62 s) does not feel like the character is stuck after a miss.
- The hip jar tip and the firefly jar screw / shake read at the follow camera's distance.
