# Keep-up audit: making it easier for kids (Oct 24 2026)

Owner: "audit the way the keep-up works and see if there are ways to make this a smoother experience for kids so that it is
easier to use." This is a read-only audit of `b7d07afc` (integrate-dive-bugs-sealife). No game code was changed.
Persona: a 6-9 year old on a phone, left thumb on the joystick, right thumb on the action buttons, who reads little.

## How it works today (the rules that matter)
- **Juggle** (`lib/town/walkBall.ts` `keepUp` / `update`): one touch every **1.05 s** (default ball; frost 0.8 s, solar 1.2 s).
  A press arms the next touch only in the falling half (`KEEPUP_ARM` .45, so about the last **0.58 s** before the touch). A press
  that is still held when the window opens also counts. An early tap is ignored without a penalty. A late tap does not count:
  the run drops **at once** when the touch moment passes unarmed.
- **Hold**: 250-600 ms lifts the touch up to 1.6×. Past **800 ms** it becomes a sky kick. The ring is full at **1.6 s**.
- **Sky** (`KEEPUP_SKY`): apex 15.7 m, hang **3.2 s**, lands 2-2.6 m away. Catch zone r **1.5 m**, 0.1-2.2 m over the feet.
  A press arms the catch once the ball is under 6 m (plus a 0.25 s buffer). Pressed: re-kick at foot height. Not pressed: a trap,
  then the ball waits **3 s** for a press and the run ends silently.
- **Cues** (`components/Town.tsx` 1816-1844, `app/globals.css` keep-up block): a red ring that turns green when "catch now",
  a 0.09 m band; a conic charge ring and a badge on the button ("Hold…" / "Max!" / "Catch!", 10 px); an edge arrow; and two
  hints (13 px) for the first 3 runs (`fi2-keepup-sky-hints`).
- **Phone layout** (globals.css 397-405): a 2×2 grid of 58 px buttons with 16 px gaps. Keep-up is bottom-left. **Shoot is in
  the bottom-right corner, where the right thumb rests**, and **both are the same yellow `#f4cc7c`** (line 431). Any Kick press
  during a run ends it: `shoot` / `beginCharge` → `reset` → `endRun`.

## Measurements (Node sim on the real `createWalkBall`, 60 Hz; script: scratchpad `ku-audit-sim.cjs`)
| Scenario | Result |
|---|---|
| One 90 ms tap per bounce at offset t from the touch | t = −0.6 … 0 s keeps the run. **t = +0.02 s already drops it** (no late grace) |
| Rhythm kid, offsets N(−0.15 s, sd 0.1 / 0.2 / 0.3) | reaches 10: **47 % / 11 % / 2 %** (average streak 10.5 / 4.3 / 3.0) |
| "On the beat" kid, N(0, 0.15) | reaches 10: **0 %**, average streak 2.1 (half of all taps are late) |
| Masher, a tap every 150-500 ms | never drops (20 s cap), **0 accidental sky kicks**. At 700 ms: drops at 2.1 s |
| Hold from the feet 300 / 600 / 800 ms | lifted touches, no sky kick (good: a slow tap is safe) |
| Hold 900 / 1000 ms | sky kick at 1.05 s (touch 2), only 0.15 / 0.05 s after release, apex 4.9 / 6.4 m |
| Hold 1200 / 1600 / 2000 ms | sky kick at **2.38 s (touch 3)**, **1.18 / 0.78 / 0.38 s after release** |
| Hold 3000 ms | sky kick at 2.38 s **while still held** |
| Sky chase, standing still | **MISS** every time (ring centre 2.6 m away > 1.5 m) |
| Run at 3.7 / 2 / 1 / 0.5 m/s, start after | catches when starting ≤ 2.5 / 2.5 / 1.5 / 0.5 s after launch (hang 3.2 s) |
| Stop off the ring centre | −1.4 … +1.4 m traps; ±1.6 m misses |
| Pressed arrival 1.4 m short or past | re-kick (good) |
| Trapped, no press | the run ends silently **3.0 s** later |
| Tap-catch (quick tap on the way down) | light pop-up, apex 3.4 m, lands 0.64 m away in 1.43 s (an easy chain) |

**Analytic window model** (per-touch success p, reach 10 = p⁹). Late grace +0.15 s: rhythm kid sd 0.2 goes 8 % → **46 %**,
on-beat kid 0 % → **21 %**. A wider early edge as well (`KEEPUP_ARM` .45 → .30, +0.2 s grace): 68 % / 42 %.
Konbini: a press counts while the ball falls below 1.05 m, down to the floor. That is a little late grace (estimated ~0.09 s),
so **the island is stricter than the Konbini today.**

## P0: clear friction, do now (about 7 agent-hours in total)
1. **Late-tap grace ("coyote time") for juggle and wall returns.** Impact: high (the main reason runs end). Effort: 2 h.
   `walkBall.ts`: add `KEEPUP_LATE=.15`. At `flightAge>=flight` with no press armed, let the ball dip past the contact for up to
   0.15 s (y may go to contact − 0.15 m). A press in that time counts as the touch (count +1, the flight starts from there).
   Otherwise `dropKeepUp`. Do the same on the wall `returning` branch. Konbini: set its floor test to match (about 0.15 s).
   Tests: `keepup-counter.cjs` (late tap at +0.1 s keeps the run; +0.2 s drops it). Risk: low. Mashing is unaffected; experts
   barely notice.
2. **Release = kick for the sky kick.** Impact: high (the "launch on the 3rd touch" is confusing). Effort: 3-4 h. Today, holding
   1.1-1.6 s kicks 0.8-1.2 s *after* the release, and 0.9-1.0 s gives a small sky kick one touch earlier, so the result does not
   follow the hold. Proposal: when a counted touch arrives while the press is held past `KEEPUP_SKY.start` (800 ms), **stall the
   ball on the foot** (a balance pose, `skyWind` already drives a wind-up). It launches **on release** with `skyCharge(ms)`, or by
   itself at `full`+400 ms = 2.0 s. Files: `walkBall.ts` (counted branch around line 306-309, `launchSky`), `skyKeepUpMoves.ts`
   / `lib/graphics/player.ts` (balance pose), `tests/keepup-sky.cjs` (the "touch 3" assertion becomes "on release, touch 2").
   Risk: medium. The owner tuned the current feel, so show it as an A/B (`?skykick=stall`).
3. **Stop a stray Kick ending the run.** Impact: high on phones. Effort: 1.5 h. (a) Keep-up button colour distinct from Shoot:
   sky blue `#9fd8ff` with a `#17323b` icon (globals.css 431, both copies of the rule). (b) `Town.tsx` `actionDown`: while
   `walkBall.state.counted`, **ignore Kick and travel-mode presses within 350 ms of a keep-up press or release** (a thumb that rolls
   over). (c) Phones: a 20 px gap between juggle and shoot (today 16 px; 12 px at ≤ 350 px). Risk: low. A deliberate shot
   still works.
4. **Fix the hint words and logic.** Impact: medium-high. Effort: 1.5 h. `Town.tsx` 1838-1844 + the globals.css hint and badge.
   - "Run to the red ring, **tap to catch!**" is wrong: with no press, the ball is trapped anyway (sim: 100 % trap). Use **"Run to
     the ring!"**.
   - New third hint after a trap: **"Tap to keep going!"**, plus the button badge "Tap!" (green, pulse) while the ball waits.
     Raise `KEEPUP_SKY.settle` from 3 to **5 s**. Today the run ends silently after 3 s.
   - Separate counters: show the hold hint until the first sky kick ever (max 6 runs), and the ring hint on the first **3 sky
     kicks**. Today `hintRuns` burns on any 3 runs, so a kid whose first runs have no sky kick never sees the ring hint.
   - Hint 13 → **16 px**, badge 10 → **12 px**. Add a ⭕ / 👆 glyph so non-readers get it. Risk: low.
5. **Remove the old 0.6 s `data-holding` outline fill on the island button** (globals.css 494-496). It reads "full" at 0.6 s
   while the real ring needs 1.6 s: two charge meters that disagree. Keep it in the Konbini, where 0.6 s = the full lift.
   Effort: 0.3 h. Risk: none.

## P1: next (about 7 agent-hours)
6. **The first sky kicks land inside the ring.** For the player's first 3 sky kicks (the hint phase), drift = **1.0 m** (< catch
   radius 1.5 m), so a kid who stands still is still trapped and learns "the ball lands in the ring". Today standing still is
   always a MISS. `launchSky` gets a drift scale through `Environment`, and Town passes it from the hint counter. Effort: 1.5 h.
   Risk: low.
7. **"Almost" catch.** A hidden catch radius of **2.0 m** (the drawn ring stays 1.5 m), or one free auto-save per run ("Phew!")
   when the ball lands within 2.5 m. Sim: stopping 1.6 m off is a miss today. `inSkyCatch` gets a `radius` argument; add tests.
   Effort: 1 h. Risk: low (it still needs the kid to run).
8. **Milestones and feel.** At 5 / 10 / 20 / 50: `sound.ui` chime + pill bounce + a "10!" bubble (pooled
   `emoteBubbles.showText`), and the Konbini's `keepUpTip` coach lines on the island too. A distinct haptic on a sky catch
   (`navigator.vibrate(20)`) and on a milestone (`[15,40,15]`), skipped under reduced motion. Note: iOS Safari has no Vibration
   API, so haptics are Android-only and sound is the main channel. Add a soft "aww" sound on a drop. Effort: 2 h. Risk: low.
9. **A ring that kids can read.** Keep the owner's skinny band, but add (a) a **falling-ball ground shadow** that grows as the
   ball nears (the most natural cue) and (b) a faint fill disc (opacity .18) inside the ring. Colour-blind: red `#ff2d2d` and
   green `#3dff6e` differ well in brightness (relative luminance ~0.24 vs ~0.73), but add a non-colour "catch now" cue: the fill
   disc to .35 and the band 2× wide while `skyCatch`. Cost: +1 draw only while a sky ball is up. Effort: 1.5 h. Risk: low.
10. **Smooth the mark jump after a wall rebound**: ease the ring over 0.2 s instead of snapping (`predictSky` on hit). 0.5 h.

## P2: later / optional
11. **Wall mode during counted runs**: facing any wall within 8 m (`WALL_JUGGLE_DISTANCE`), the ball flies off to it on its own,
    with a different rhythm. A kid cannot see why. Limit it to **4 m** while `counted`, or only while standing still. 1 h.
    Owner call.
12. **Discoverability before the first press**: after 20 s walking with the ball and no keep-up ever, give one bounce of the
    keep-up button and a "Keep-ups!" label (once, localStorage). 1 h.
13. **Rhythm reward**: mashing (≤ 500 ms) is unbeatable and never ends a run. That is fine for kids, but an in-window tap with no
    extra presses could earn a star / gold count. 1.5 h.
14. **Friends**: party friends see the sky ball as a free ball (`party.ball` state 3). They could also see the count bubble
    over the player. 2 h (relay field).

## Keep as is (already kid-friendly)
- **Un-pressed arrival traps**, so the chase needs only the joystick thumb: the two-thumb problem is solved. Pressed arrivals
  from 1.4 m short or past still re-kick.
- The chase is generous: full speed works with a start up to 2.5 s late, and even 1 m/s works with a 1.5 s late start. Overshoot
  up to 1.4 m is fine. Speed 3.7 m/s against 2-2.6 m drift is right.
- Early taps are ignored, not punished. Mashing never makes an accidental sky kick, and a slow tap (≤ 800 ms) never does either.
- Tap-catch gives a light 3.4 m pop-up landing 0.64 m away, an easy chain. Holding through a catch gives a big one (continuous).
- Instant restart: a press after a drop starts a new run from the feet at once.
- Catch window `armHigh` 6 m + 0.25 s buffer. `launchSky` refuses landings in the sea, on blocked cells and at big height steps.
  The edge arrow shows when the mark is off-screen. The camera lifts with the ball (`skyCamLift`). NPC talk is off during a run.
- Steady (not pulsing) ring, as the owner asked. Pulses are off with reduced motion and Battery saver.
- Perf/heat: 1 pooled draw, `--keepup-charge` written in 1/40 steps only on change, arrow transform only on change, one
  projection per frame while airborne. None of the proposals above adds per-frame allocation. #9 adds ≤ 1 draw while airborne.

## Suggested order
One Sonnet agent for P0 #1 + #3 + #4 + #5 (walkBall grace, button guard and colour, hints; tests: `keepup-counter`,
`keepup-sky`). One Opus agent for P0 #2 (stall-on-foot launch + pose, A/B flag). Then a verify agent with one phone and one
desktop screenshot. Then P1 #6-#9 as one batch.
