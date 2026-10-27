# Island Strikers, round 3 (Oct 26 2026)

The owner asked for five things across all arcade games: better graphics, better controls, better gameplay with HARD levels, cleaner menus,
and an easier time for kids. Two later asks were added: dynamic camera moments and a more "living" match. This round also fixes the bug
where the match played upright in a narrow desktop window.

## 1. The pitch is always sideways (priority fix)
- **Upright phones** (`(pointer:coarse) and (orientation:portrait) and (max-width:500px)`) keep RotateLock's "Turn your phone sideways
  to play" card. The coordinator's interim "Make this window wider" card for mouse windows (fc6d7833) is removed again. A card left a
  desktop player with nothing to do.
- **Every other tall window** (a narrow desktop window, or an upright tablet) now letterboxes a **4:3 game frame**, centred on a dark
  backdrop (`LiveArcadeMatch.module.css`, "Landscape frame"):
  - The frame holds the header, a pitch at about 16:9 and the footer.
  - The scene picks the sideways camera from the canvas shape alone (aspect >= .85), so no JS change was needed.
  - `.root.root` beats ArcadeRoom's `section{height:100%}`.
  - A `.backdrop` sibling blocks taps from reaching the room behind the frame.
  - The root has no containment, so the fixed leaderboard modals still cover the whole window.
- **Menus open over the whole window** (`.overlay` is fixed in frame mode), so cards never squeeze into a 375 px frame.
- **Upright tablets** use the landscape thumb layout inside the frame. Every coarse landscape media block also matches
  `(pointer:coarse) and (min-width:501px)`. The coarse portrait blocks now apply to phones only, and only behind the card.
- **Mouse windows** hide the touch buttons. The keycaps sit in the free space under the frame for the whole match.
- **UX choice:** the card is for phones only, because a phone can be turned. A window or tablet always plays, because asking a mouse
  user to resize the window is a dead end.

## 2. Cinematic beats (`lib/arcade/strikerCinema.ts`, new)
A pure state machine with no THREE and no per-frame allocation. The match loop triggers a beat, steps it with real seconds and feeds
`timeScale` into the sim (`state.cinemaScale`). The sim runs at the slower of this and its own charge slow-mo. `strikerScene` blends
the camera from it.

| Beat | When | What |
|---|---|---|
| through | Gold's player has the ball past x=9 with no Blue outfielder ahead (once per run) | .35x slow-mo for at most .6 s real, a low 3/4 push-in behind the striker, a "Through on goal!" banner |
| charge | Charging a shot in the attacking half | Low angle. The sim's existing charge slow-mo stays the only slow-mo, and the meter still fills in real time |
| setpiece | Gold's free kick, penalty or corner | Low angle behind the ball |
| strike | Gold's shot | Slow-mo released; the camera chases the ball toward goal, then pulls wide |
| goal / save / tackle | Goal (scorer), save (keeper), Gold intercept or perfect tackle | Push-in, quick push, punch-in |
| kickoff / fulltime | First kick-off and the final whistle | Sweeping sideways glide, zoomed out a touch |

**Caps:**
- One slow-mo per 8 s, with at most .9 s held. The time scale never goes below .3x.
- Every beat lasts 2.4 s or less, and tackles are at least 3 s apart.
- A lower-priority beat never interrupts a higher one.
- Tapping the pitch skips a beat (but not while charging).
- Replays skip the beat.
- Reduced motion: no beat triggers.

**Comfort:**
- Smoothstep envelopes and damped look-point follow.
- No roll, and zoom stays within ±12%.
- Push-ins are a capped dolly toward a look point between the player and the goal.

`tests/strikers-r3-cinema.cjs` covers the ramp back to 1x, the caps, the priorities, skip, reduced motion, the wiring and the
no-allocation `update()`.

## 3. Hard levels, gentle start, adaptive Blue (`strikerMatch.ts`)
- **Round 5, Storm Press:** rain (the ball skids) against a faster press with cover.
- **Round 6, Island Legends:** small goals, the sharpest block and keeper, and 3 Blue Team Strikes.
- Every tuning knob climbs or tightens round over round. The tackle telegraph stays >= .3 s, so the game stays learnable.
- Round 5 star challenge: score from a set piece. Round 6: win with a clean sheet. Start-card chips name the modifier, and the round
  picker marks 5 and 6 as HARD.
- **Saves are unchanged:**
  - Star lists pad from 4 to 6 entries, and old stars are kept.
  - `arcadeRecords` already allowed unlocks up to 6.
  - Coins and economy rules are unchanged, and the cup is unchanged.
- **Gentle first minute:** a first-ever Round 1 (no star yet) eases Blue for 45 s and fades back to the normal Round 1
  (`STRIKER_GENTLE`).
- **Adaptive Blue:** Blue eases a notch while Gold trails by 2 or more, and pushes a notch while Gold leads by 3 or more (`state.adapt`,
  damped, ±1).

## 4. Living match
- **Match events:**
  - One at a time, never in the first 25 s or the last 15 s, a set piece, a goal pause or a first-ever match. Gap 45-65 s.
  - **Gust of wind** (9 s): the loose ball drifts.
  - **Power zone** (12 s): a pink ring in the upper attacking half. The first player in gets full sprint and a spirit boost (Blue can
    take it too).
- **Commentator captions:** "What a save!", "Off the post!", "Perfect tackle!" and "Read it! Intercepted." appear as a pop-and-fade
  pill, hidden while a banner shows.
- **Impact:** dust puffs on tackles, steals and zone pickups, from the stage's pooled particle burst.

## 5. Menus
- **Pause:** "Paused", the score and time left, a big **Resume match**, a small **Arcade**, and keycaps on keyboard devices.
- **Full time:**
  - A big "You win! / Draw! / Blue wins", the score and three big stars, plus "New best!".
  - One short kid line and ONE primary: **Next round**, **Try again** or **Play again**.
  - Small **Arcade / More / Leaderboard** buttons.
  - **More** holds the stats, the coach line, the star goals, the match type and the lesson. On short landscape screens it opens as a
    second column, so nothing scrolls.
- **Start card:** the wall of key text is replaced by keycaps (keyboard devices only). A first keyboard kick-off shows the keycaps over
  the pitch for 8 s, once (`fi-strikers-keys-seen`).

## Cost
- **Draw calls in play:** phone landscape 844x390 about 98-101, desktop about 106, the 500x950 frame 106. New meshes: one zone ring
  plus its fill, only while a power zone shows (+2 draws). The cinema adds no draws. Captions and keycaps are DOM, and their
  animations use opacity and transform only.
- **Per frame:**
  - `cinema.update` is O(1), with no allocation.
  - The through check loops 8 players only while Gold's player has the ball.
  - Match events do O(1) work, or loop 8 players while a zone is live.
- The heat budget is unchanged. Nothing was measured on a real iPhone.

## Tests
- New: `tests/strikers-r3-frame.cjs`, `strikers-r3-cinema.cjs` and `strikers-r3-levels.cjs`, added at the end of the `test` chain.
- Updated for the new media queries and six rounds: `strikers-landscape-controls`, `strikers-landscape-orientation`,
  `strikers-portrait-controls`, `strikers-portrait-tip`, `striker-celebrate`, `striker-polish`, `striker-loop` and `striker-depth`.

## Eyeball on a real device
- **iPhone held upright:** the turn-sideways card shows.
- **Sideways:**
  - The through-on-goal slow-mo feels like a moment, not a stall.
  - The camera never hides the goal behind the buttons.
  - A power zone is reachable and clear of the thumbs.
- **iPad held upright:** the frame and the thumb arc inside it.
- **A narrow desktop window:** the keycaps under the frame, and that Esc, Space and K work.
- **Rounds 5 and 6:** they feel hard but fair.
- **A first-ever Round 1:** Blue is gentler for the first 45 s.
