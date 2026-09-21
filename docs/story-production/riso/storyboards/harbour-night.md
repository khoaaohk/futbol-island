# The Harbour at Night — riso storyboard

Story id `harbour-night` · 9v9 · theme "Making room for rest" · six chapters, `chapters` audio mode. **A NIGHT PRINT**: every chapter but the last is printed as a heavy navy-over-blue overprint field with the paper showing through as stars and halftone; never a flat dark fill.
Sources: narration/labels `lib/paths/films/nine.ts`; word onsets `lib/paths/films/phraseFilmScores.ts["harbour-night"]`; chapter seconds `lib/paths/films/narrationTiming.json["harbour-night"]` = 10.35, 9.85, 10.55, 9.15, 10.35, 9.75.
Headlines (bible §4c): one or two words only where the chapter has a key idea to keep (three of six; the rest none), rendered as an HTML overlay in the loading-screen brush font; no lettering inside the canvas art.
Cue times are chapter-relative. **exact** = shipped word onset. `+n.n` = a consequence chained from the previous exact cue (an offset, not new audio).

## Frame conventions

- World units: short side 1080. Chapter centre (0,0); x right, y down.
- **Core square**: x −480..+480, y −400..+380 — everything that must be understood lives here (title strip above, caption tray below).
- Portrait 390×850 extends y to ≈ −900..+700 (tray from ≈ +700); landscape 844×390 extends x to ±900 and crops y to ±440; 1440×850 shows x ±915, y ±540. Backgrounds fill the whole sheet.

## Lead imagery (owned by this story)

**Moored hulls** (navy grainy hulls with torn waterlines), the **lantern** and its **stepped halftone glow**, a **sail** that fills, luffs and is **folded**, the **mooring rope** (navy thread that goes taut and slack), the **mole** (harbour wall) that shelters still water from the open swell, the **moon** and **paper stars**, a **kite** off the quay, and the **buoy-ball** (the ball as the boat's cargo buoy: paper sphere, navy panels, lashed with rope loops). Lead imagery not used by any other story in this path: different-tides owns tide lines/footprints/gauge post; unfinished-map owns pencil contours/routes/landmark; grit owns seed/roots/strata/shoot/fruit.

Football objects appear only where the narration names football: the buoy-ball is the cargo (ch1–2), is hauled and set down when "more practice" is not chosen (ch3), bobs on the rope for "another drill" (ch4), is left lashed at the mooring "away from football" (ch5) and lifted aboard for "your next session" (ch6). No eye, ear or hand in this story; "check in / how do you feel / notice" are camera pans. The single **bubble** is in ch4, drawn as a **lantern-light bubble** (the glow's reflection gathering on the water into a speech shape).

## Background construction (unique to this story): a night harbour with lantern halftone glow and still water

All chapters (except the dawn duotone) are printed on a **night field**: navy `field()` cov .75 over blue `field()` cov .5 (overprint = deep indigo), high mottle, fine speckle inside the ink, and **paper stars** = knockout dots r 3–8 scattered with a seeded density that thins near the horizon. **Water** = stacked teal bands (.35/.5/.7) with a fine horizontal ripple screen and a torn waterline; in the harbour the ripple screen is nearly still, outside the mole it rolls. The **lantern glow** = a yellow disc with **five stepped halftone rings** (yellow .7/.5/.35/.2/.1, each ring its own grainy print) — stepped tone as *radial glow*, never as concentric arches (regulate's construction) — and a **reflected column** of yellow dashes down the water. The huge-motif slot is the lantern glow (ch4), the moon disc (ch5) and the mole arc (ch2). Confetti accents = paper spray flecks where swell breaks on the mole.

How it differs from the other 9v9 stories: different-tides is daylight sand with stepped horizontal tide lines; unfinished-map is cream paper with pencilled contours and a faint grid; grit is underground strata giving way to sky. Harbour at Night is the only one printed as a dark overprint field with paper stars and a stepped lantern glow.

## Dominant material metaphor and how it develops

**The harbour as the space between journeys**: sail (effort) and mooring rope (rest) on one boat, sheltered by the mole. The metaphor develops as *what the rope and the sail are doing*:

1. approaching at night: the sail fills, luffs, and the rope tightens and eases — effort and rest side by side →
2. inside the mole from above: the swell breaks outside, the rope is thrown and holds, the sail folds — pausing keeps the cargo whole →
3. on the deck: a heavy mass presses on the folded sail and the buoy-ball; the camera checks in; the lantern's ring reaches the ball →
4. at the lantern post: the reflected light gathers into a bubble that crosses to the post and returns with a plan; the weight lifts →
5. the widest night: the sail furled, lanterns joined, a kite up, the ball left lashed but not lost →
6. dawn duotone: the ball lifted aboard, the sail set above the horizon, its slack reflection below — effort and rest in one image.

Later chapters revisit earlier places at another scale: ch4's lantern post is the tip of ch2's mole; ch6 is ch1's harbour mouth from inside, at dawn.

## Inks and role colours

Triple: **blue `#0078bf`, yellow `#ffe800`, teal `#00838a`** + navy `#22366b` on paper `#f0ece2`. Print order yellow → teal → blue → navy; registration 2.0 px re-seeded per chapter.

| Role | Ink |
|---|---|
| Night field (with navy), open-sea swell, the hull's course line | blue |
| Support / trusted adult / coach: the lantern, its glow and reflection, the moon's halo | yellow (yellow × teal overprint = green-gold where the glow lies on water) |
| Rest: harbour water, sail cloth tone, the kite | teal |
| Pressure / tiredness: the heavy solid navy mass, the weight on the sail | navy at cov 1.0 (against the field's .75) |
| Buoy-ball | paper knockout, navy panels, rope loops navy |
| Hulls, mole, rope, mast, post, stars' field | navy |
| Duotone beat | ch6, yellow + navy only (dawn) |

---

## Chapter 1 — ROOM TO PAUSE (10.35 s)

`headline`: none

Narration: "Can you care about football and still need a break? Yes. Rest belongs in your routine, alongside the effort you give to learning."

**Background.** Open night sea approaching the harbour, side view. Night field (navy over blue, paper stars, thinning to the horizon at y −150). Water: three teal bands from y −150 down with a rolling ripple screen. The **mole** = a navy grainy bar from (250,−40) to the right edge, torn top edge; the **lantern** r 40 at its tip (430,−60) with glow rings to r 260 and a reflected dash column down the water. Star confetti.

**Composition.** The **sail** (paper knockout with teal .2 tone, triangle 520 tall) at (−100,−80) leaning 12°; the **hull** (navy, grainy, 480 wide, torn waterline) at y +180; the **buoy-ball** (r 80) lashed in the hull at (−40,+120); the **rope** (navy thread 18 u) from the mast head (−100,−340) to the bow cleat (140,+150); a dashed navy **course line** on the water ahead of the bow.

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 0.00 "Can you care" | Sail, hull, ball, rope; lantern far right | "care" = the sail **fills**: anticipation (the cloth luffs flat, 0.2 s), then the curve **bellies out** 60 u (0.5 s ease-out), overshoots 10 u, settles. Consequence: the hull **heels** 6° (heavy, slow), the buoy-ball rolls to the low side and settles with a 2-bounce, the rope pulls **taut** (straightens, thickens 18→24 u). | push 1.00→1.12 and rotate +3° with the heel over 0.0→1.4 s, centred (−40,+20) | Sail top at y −340 stays under the title strip; hull above y +380 |
| **exact** 1.62 "need a break" | Same | The wind drops: the sail **luffs and slackens** — its curve collapses in three redraws (flutter on twos), the hull **rights** with a rock (settle 0.8 s), the rope **sags** into a catenary. Consequence: the course line on the water **bends** toward the lantern. | drift +120 y with the settling hull over 1.62→2.6 s (the camera drops with it) | — |
| +2.0 (3.62) "Yes." | Pan toward the lantern | The lantern **flares one step**: its rings step out one ring (0.1 s each, 5 rings), with a 10 % overshoot on the disc; the reflected dash column **lengthens** toward the hull (grow, tip leading, 0.6 s). | pan +320 x over 3.62→4.6 s, zoom 1.12 | Lantern at (430,−60) comes to the right third of the core square |
| +1.0 (4.62) | Same | Consequence: two dashes of the reflection reach the hull's waterline and print green-gold on the teal (overprint) — the light touches the boat. | hold with residual 10 u swell rock (decaying) | — |
| **exact** 6.10 "alongside the effort" | Rope (effort) and slack sail (rest) with the lantern, all in frame | A gust returns: the rope anticipates (slack deepens 10 u), pulls **taut** with a twang (2 redraws overshoot), and the sail fills **half** (curve 30 u) while its upper third stays slack — effort and rest in one drawing. Consequence: the hull moves 80 u toward the harbour mouth; the course line prints solid to the mole's end. | pan +200 x continuing over 6.1→7.2 s (never back) | Rope, sail and lantern all inside x ±480 after the pan |
| +1.2 (7.30) | Same | The buoy-ball rocks once with the gust and its paper highlight brightens (it is coming along). | hold (residual sway) | — |
| 9.7→10.35 seam | Push into the lantern glass | Passage below. | push 1.12→2.6 into the lantern disc at (430,−60) | Aperture inside the core square |

**Seam →** Passage through the **lantern glass** (aperture: the yellow disc r 60, the glow rings brightening as we enter) → reveals **chapter 2: the harbour basin from above — the mole's arc, still water inside, rolling swell outside, moored hulls** (a different composition: top-down, a huge arc).

Football truth: effort (taut rope, filled sail) and rest (slack sail, sagging rope) are drawn on the same boat in the same frame; needing a break does not remove the cargo.

---

## Chapter 2 — REST IS NOT WEAKNESS (9.85 s)

`headline`: **NOT WEAKNESS**

Narration: "Think of a harbour: a space between journeys. Pausing does not make a boat less useful. Needing rest does not make you weak."

**Background.** Top-down harbour. The **mole** = a navy grainy arc 160 wide from (−540,−300) curving through (200,−380) to (400,+380), hand-cut torn edges — a wall enclosing water, not a channel. Inside the arc: **still water** = teal .45 field with a nearly-still fine ripple screen. Outside (right/top): **open sea** = blue .7 with a rolling wave screen. The quay (left/bottom of the arc) = navy .85 field with paper cobble speckle. The **lantern** at the mole tip (300,−320) with stepped glow rings lying on the water. Two **moored hulls** (navy, 300 and 260 long) at (−200,+120) and (−80,+280) with **folded sails** (paper bars along their booms), each with a rope to a bollard. Spray confetti where the swell meets the mole.

**Composition.** Our hull (300 long from above, sail still up as a paper triangle) enters through the mouth at (420,+40); its wake = paper dashes.

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 0.00 "Think of a harbour" | Mole arc, mouth, our hull entering | Our hull anticipates (hesitates 10 u back on the swell), then **glides in** 0.9 s (ease-io), overshoots 20 u, settles; its wake dashes shorten. Consequence: the ripple screen inside the arc **flattens** .5→.2 (0.8 s) while the outer wave screen keeps rolling. | pan −300 x with the hull over 0.0→1.2 s, zoom 1.0 | Mouth at x +420 and the inner basin both inside the core square at zoom 1.0 |
| +1.4 (1.40) | Same | The swell that followed the hull **breaks on the mole**: a blue tongue climbs the arc's outer edge (anticipation draw-back, 0.3 s lunge, foam knockout, 8 spray flecks) and falls back; inside, nothing moves — the pause is sheltered. | hold, 15 u residual drift left | — |
| **exact** 3.22 "Pausing does not" | Push on the rope and bollard | The **mooring rope** is thrown: the coil pulls back 30 u (anticipation), arcs 0.4 s to a navy bollard stub on the mole, lands, pulls **taut**; the hull **swings** onto it and settles (damped, 1.2 s). Consequence: the sail **folds** — the triangle collapses onto the boom into a paper bar in 3 redraws; the buoy-ball stays lashed (paper highlight). | push 1.0→1.25 centred (240,−120) over 3.22→4.0 s | Bollard and hull inside the core square at 1.25 |
| +1.4 (4.62) "less useful" | Same | The cargo is intact: the ball's rope loops re-ink; the hull's course line ends at the bollard (journey paused, not lost). | hold | — |
| **exact** 6.44 "does not make you weak" | Rotate toward the lantern | The hull's outline is **redrawn thicker** (shadow side heavier, taper at the bow); the lantern's rings **step out** to cover the resting hull (yellow over teal = green-gold); the two neighbouring hulls each **bob** once (dip, lift, settle) — a harbour of resting boats. | rotate +10° and pan +150 x toward the lantern over 6.44→7.6 s, zoom 1.25 | Lantern at (300,−320) sits at the top-right of the core square |
| +1.0 (7.44) | Same | Consequence: the rope eases from taut to a slight sag — rest holds. | hold with residual bob | — |
| 9.2→9.85 seam | Push into the still water beside the hull | Passage below. | push 1.25→2.5 into the ripple at (120,+60) | — |

**Seam →** Passage through the **still teal water** beside the hull (aperture: a ripple ring r 200) → reveals **chapter 3: the deck close from above, the folded sail on the boom, the buoy-ball, and a heavy navy mass hanging over them** (a different composition: close, vertical, pressed).

Football truth: the pause protects the cargo; the boat's outline is stronger for having moored, not weaker.

---

## Chapter 3 — CHECK IN (10.55 s)

`headline`: **CHECK IN**

Narration: "More practice is not always the next helpful choice. How do you feel after training? Notice when you feel tired or overwhelmed."

**Background.** Close on the deck at night. **Deck planks** = navy .8 grainy field with paper seam lines every 90 u; the **folded sail** = a paper bar with teal .2 tone along the boom across the top of the frame (y −260, 40 u thick); the **lantern glow** enters from the right as cropped stepped rings; **water** at the bottom (teal bands from y +300). A **heavy navy mass** (solid cov 1.0, torn, 600 wide) hangs from the top edge above the boom — the tiredness. Stars only in the top corners.

**Composition.** The **buoy-ball** (r 200) at (−160,+140) lashed with rope loops; its **rope** (navy 24 u) runs up to the boom at (−160,−260); the **boom** (navy bar 30 u) spans x −480..+480 at y −260.

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 0.00 "More practice" | Ball, rope, boom, mass above | "practice" = the rope **hauls** the ball toward the boom: anticipation (the ball dips 15 u), lift 120 u (0.5 s ease-out) — then the haul **stops** mid-way (held drawing) and the ball is **set down** (0.6 s ease-in, 2-bounce settle): the choice not taken. | push 1.00→1.1 centred (−120,0) over 0.0→1.0 s | Ball and boom inside the core square |
| +1.8 (1.80) "not always the next helpful choice" | Same | **Pressure**: the navy mass **presses down** 120 u onto the boom (heavy: slow start, hard stop); the sail bar **sags** 30 u in the middle, the boom **bends** 4°, and the plank seams below **compress** (two paper seam lines close from 90 u to 70 u apart). | push 1.1→1.2 and rotate +2° (leaning into the push) over 1.8→2.6 s | The mass's lower edge at y −180 stays visible under the title strip |
| **exact** 3.72 "How do you feel" | **The camera is the check-in** | A slow pan left→right across the deck reveals in turn the sagging sail, the bent boom, the pressed ball (its panels dim, tone .3→.55) and the lantern glow at the right edge; the tempo is a long ease (nothing else moves — a moving hold). | pan +420 x over 3.72→5.2 s (ease-io), zoom 1.2 | Glow rings enter from x +480 |
| +1.4 (5.12) "after training" | Same | The rope goes slack and **coils** on the deck (3 redraws); one plank seam line prints wet (teal .4 dash). | hold | — |
| **exact** 6.60 "tired or overwhelmed" | Push on the ball where the glow touches it | The mass presses to its lowest: the sail bar touches the ball and the ball **squashes** 10 %; the water bands at the bottom **stop** their ripple. At the same time the lantern's first ring **steps out** and touches the ball's rim (the trusted adult is near). | push 1.2→1.35 centred (−40,+120) over 6.6→7.4 s | Ball stays above y +380 |
| +1.0 (7.60) | Same | Consequence: the ball's rim where the ring touches it **knocks out to paper** (a bright edge on a pressed thing). | hold | — |
| +2.0 (8.60) "Notice" | Same | A **breath in**: a teal ripple ring rises from the water through the deck (r 0→300, 0.8 s ease-out); the composition **expands** 20 u — the mass lifts 20 u, the sail's sag relaxes 10 u, the seams reopen 8 u. | drift −20 y (breathing with it) 8.6→9.6 s | — |
| 9.9→10.55 seam | Push into the outer glow ring on the deck | Passage below. | push 1.35→2.6 into the yellow ring at (380,+80) | — |

**Seam →** Passage through the **lantern's outer halftone ring** where it lies on the deck (aperture: the ring's arc segment 300×160) → reveals **chapter 4: the lantern on its post at the quay, the mast top at the left, the light's reflection on the water between them** (a different composition: two poles and a column of light).

Football truth: "more practice" is shown as an action begun and deliberately set down under load; the tired body is a pressed ball and a sagging sail, not a face.

---

## Chapter 4 — SAY WHAT YOU NEED (9.15 s)

`headline`: none

Narration: "Tell a trusted adult or your coach. You can say, I feel worn out. Can we plan a break before another drill?"

**Background.** The quay at night. **Lantern post** (navy, 60 wide) at right (330,−120), lantern r 120 with stepped glow rings to r 420 (the huge motif); the **mast top** and folded sail at left (−300,0); between them the **water** = teal bands with the glow's **reflected column** of yellow dashes from the post to the hull; the night field with stars above; the **navy mass** from ch3 still hangs at the top-left edge (cropped, cov 1.0).

**Composition.** The hull's bow at the bottom-left (−380,+240); the **buoy-ball** (r 80) on its rope at the bow; the bubble slot at (−80,−200).

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 0.00 "Tell a trusted" | Post, mast, reflection column | The story's one bubble: **connect** — the reflection dashes anticipate (draw back 20 u toward the hull), then **travel and join** into a **lantern-light bubble** (paper knockout with a yellow rim, 520×300 at (−80,−200), tail toward the boat) in 0.6 s ease-out; the rim overshoots 8 u and settles. | push 1.00→1.12 centred (−80,−150) over 0.0→0.8 s | Bubble inside x ±480, y −350..−50 |
| +1.6 (1.60) "or your coach" | Same | The bubble's tail thickens toward the post; the post's ring pulses once (r 120→150→130). | hold | — |
| **exact** 3.50 "I feel worn out" | Pan with the bubble to the post | Inside the bubble a **small sail** (200 u) prints **slack and sagging** (bends 20 u); the bubble's rim **sags** 20 u with it; the bubble **drifts** to the post (0.7 s ease-io). The navy mass at the top-left **shakes** once (2 redraws) — the feeling named. Consequence: the lantern's rings **step out** once (heard). | pan +250 x over 3.5→4.3 s, zoom 1.12 | Post at (330,−120) reaches the right third |
| +1.0 (4.50) | Same | The bubble is absorbed into the glow (its rim becomes the next ring). | hold | — |
| **exact** 5.26 "plan a break" | Pan back down to the hull with the return bubble | "another drill" = the buoy-ball **bobs twice** on its rope (dip, lift, dip — the drill would be more hauling). Then a **return light-bubble** (yellow rim, teal fill) leaves the post carrying a **small hull at anchor with a rope curve** (the plan), travels 0.9 s to the bow; on arrival the rope **eases** (sag) and the ball stops bobbing (settle). | pan −300 x, +120 y over 5.26→6.2 s following the return bubble | Bow at (−380,+240) inside the core square |
| +1.0 (6.26) | Same | Consequence: the navy mass at the top-left **lifts** 200 u and dissolves to halftone .3 (relief); the water bands **widen** 20 u (breathe out). | drift −30 y (the composition breathing) | — |
| +2.1 (7.36) | Same | The lantern's rings settle one ring in (no need to flare now); the course line on the water ends at the mooring. | hold | — |
| 8.5→9.15 seam | Push into the return bubble's teal | Passage below. | push 1.12→2.4 into the return bubble at (−300,+160) | — |

**Seam →** Passage through the **return light-bubble's teal paper** (aperture: its ellipse 300×180) → reveals **chapter 5: the widest night — moon, star field, the quay's lanterns, the boat furled, the ball lashed at the mooring** (a different composition: wide, sky-dominated).

Football truth: the drill is postponed by a spoken plan; the ball is still on the boat, its rope eased rather than cut.

---

## Chapter 5 — LET THE SAIL SETTLE (10.35 s)

`headline`: **MAKE ROOM**

Narration: "Make room for a regular bedtime, time with friends, and things you enjoy away from football. Your interest in the game can stay."

**Background.** The widest night. Night field fills the top 70 % with **paper stars** (r 3–8, seeded) and the **moon** (paper disc r 150 with a yellow .3 halo of three stepped rings) at (−260,−330) — the huge motif. The **quay** = navy .85 grainy bar y +160..+260 with cobble speckle. Below it the harbour water: teal bands, the moon's reflection column. Two **quay lanterns** (unlit navy rings) at (300,+120) and (420,+160).

**Composition.** Our hull at rest at (−150,+200), sail up as a slack paper triangle (furls at cue 1), rope to a bollard; the **buoy-ball** (r 110) lashed to the **mooring post** at (−400,+240); the boat's lantern (lit, r 40) on the stern.

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 0.00 "Make room" | Sky, moon, hull, ball at the post | **Room = expand and slow**: the star field scales 1→1.08 about the moon over 1.5 s (long ease-out), the moon rises 60 u; the sail **furls** — anticipation (it lifts 10 u), then rolls into a bar along the boom in 4 redraws; the rope sags; the water's ripple screen slows to a stop. | push 1.00→1.1 centred (−150,+100) over 0.0→1.2 s | Moon at (−260,−330) under the title strip; hull above the tray |
| +1.6 (1.60) "regular bedtime" | Same | The boat's stern lantern dims one ring; the moon's reflection column prints down the still water (grow, tip leading). | hold | — |
| **exact** 2.40 "time with friends" | Pan to the quay lanterns | **Connect**: the two quay lanterns **light** 0.3 s apart (each disc pops with a 10 % overshoot; rings step out), and their glow rings **travel toward each other and overlap** — yellow × yellow halftone brightens and the overlap knocks out a paper core; the boat's stern lantern's rings join them: three lights physically joined. | pan +300 x over 2.4→3.4 s, zoom 1.1 | Lanterns at x +300/+420 inside the core square after the pan |
| +1.2 (3.60) | Same | Consequence: the joined glow lies on the water as one green-gold patch (teal × yellow). | hold | — |
| **exact** 4.62 "away from football" | Tilt up with the kite | A **kite** (teal, 260 wide, paper knockout, navy string) rises from the quay at (380,−100): the string grows tip-leading (ease-in, 1.2 s) into the star field; the kite sways with a decaying settle. Meanwhile the buoy-ball stays **lashed at the post**, its highlight dimming .2 — left for the night, not lost. | tilt −260 y over 4.62→5.8 s following the kite, zoom 1.1 | Kite ends at (380,−360), under the title strip |
| +2.4 (7.02) "Your interest in the game can stay" | Pan down-left to the ball | The ball's tether **tugs** once: anticipation dip 10 u, lift 20 u, settle (the ball bobs); a moon-reflection dash lands on it and its **paper highlight returns**. | pan −480 x, +300 y over 7.0→8.2 s to centre (−380,+220) | Ball at (−400,+240) inside the core square |
| +3.4 (8.02) | Same | The rope loops re-ink; the water around the post holds one slow ripple. | hold with residual bob | — |
| 9.7→10.35 seam | Push into the moon | Passage below. | push 1.1→2.6 into the moon disc at (−260,−330) (the camera travels up-left into it) | — |

**Seam →** Passage through the **moon's paper disc** (aperture: r 150; its halo rings brighten as we enter) → reveals **chapter 6: dawn at the harbour mouth in two inks — the hull with the sail half-set, the unlit lantern on the mole, a paper horizon** (a different composition: bright, horizontal, duotone).

Football truth: the ball is left at the mooring — visibly still there and still the boat's — while other things (friends' lights, a kite) take the night.

---

## Chapter 6 — EFFORT AND REST (9.75 s) — duotone beat (yellow + navy only)

`headline`: none

Narration: "Before your next session, check in again. Talk about what you need. A useful football routine has space for effort and rest."

**Background.** Dawn. The paper shows mostly; a **yellow field** cov .35 with **three stepped bands** of dot size rising from the horizon (y −80): .35 / .2 / .1 — dawn as a stepped glow, grainy. Below the horizon the **water** = navy .3 tone bands (grainy) with a paper horizon line. The **mole** ends at (350,−60) with the lantern now **unlit** (a navy ring r 40). Paper stars fading (knockouts at tone .1 in the top band).

**Composition.** Our hull at (−200,+60), sail half-set (paper triangle with a navy outline, 420 tall); the **buoy-ball** (r 90) on its rope at the bow, still in the water at (−380,+180); the rope to the bollard slack.

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 0.00 "Before your next" | Pan from the unlit lantern to the hull | **Check in = camera**: a slow pan from the mole's unlit ring across the still water to the hull; as it arrives the sail **half-fills** (luff first, then curve 30 u, ease-out). | pan −400 x over 0.0→1.2 s (ease-io), zoom 1.0→1.1 | Mole ring at (350,−60) and hull both pass through the core square |
| +1.2 (1.20) "check in again" | Same | The water bands under the hull print one ripple; the hull's outline is redrawn (the day's first drawing). | hold | — |
| **exact** 2.80 "Talk about" | Push on the stern lantern and the post | A call and answer with no bubble: the hull's stern lantern **swings** toward the post (anticipation back 8°, swing 20°, settle), and the post's ring **answers** with one navy-ring pulse (r 60→120, 0.5 s). | push 1.1→1.12 centred (80,−40) over 2.8→3.6 s | — |
| +1.0 (3.80) "what you need" | Same | The buoy-ball is **lifted aboard**: the rope hauls — anticipation dip 12 u, lift 120 u (0.6 s), overshoot 10 u, settles into the hull. The game comes along to the next session. | hold | Ball ends at (−300,+80) |
| +2.2 (5.00) | Tilt to the sail | **Effort**: the sail **sets fully** — luff, then the curve deepens 60 u (ease-out), overshoot, settle; the rope goes **taut**; the hull heels 5°. | tilt −120 y over 5.0→5.8 s, zoom 1.12 | Sail top at y −360 |
| **exact** 6.52 "effort and rest" | Horizon as the axis | Above the horizon the taut sail (effort); below it the sail's **reflection** prints **slack** and broken into navy halftone dashes (rest) — one image, two states. **Breathe out**: the yellow bands step up one ring, the water bands **widen** 20 u, the tempo eases out; the hull moves 100 u forward toward open water. | drift +220 x with the hull over 6.52→9.1 s (long ease-out) | Reflection inside y +80..+340 |
| +1.0 (7.52) | Same | Consequence: the ball in the hull gets its paper highlight; the unlit ring prints a last pulse. | drift continues | — |
| 9.1→9.75 (end) | — | No seam. The last press re-seeds at 9.1; the drawing holds with a decaying 6 u swell. | drift to the end | — |

Football truth: the routine is drawn as one boat that carries the ball, sets the sail (effort) and shows its slack reflection (rest) at once; the coach is the post that answers.

---

## Shapes needed

Shared library (§3): `sail` (fill/luff/furl states), `sun/lantern disc(r, glow)` (with stepped rings), `thread(points,width)` (rope, tether, string), `ball(s,rot)` (as the buoy-ball with rope loops), `field(torn|wave)`, `ripple(r,count)`, `bubble(w,h,tail)` (ch4 only, light treatment), `kite`, `sparkBurst` (spray), `pressureWalls` is *not* used (the weight is a single mass, below).

Story-specific (author in `lib/paths/riso/stories/harbour-night.ts`):
- `nightField(seed, starDensity, horizonY)` — navy-over-blue overprint field with paper-star knockouts thinning to the horizon.
- `glowRings(x,y,r,steps)` — stepped yellow halftone rings + a reflected dash column on the water below.
- `hull(w, angle, seed, outlineWeight)` — grainy navy hull with a torn waterline; `outlineWeight` for ch2's thicker redraw.
- `mole(arcPoints, width)` — hand-cut navy wall with spray flecks on the sea side.
- `mooringRope(a,b, slack)` — catenary thread; `slack` 0 = taut (thicker), 1 = coiled.
- `weightMass(w, drop)` — solid navy torn mass that presses (ch3/4).
- `lightBubble(w,h,tail, fill)` — bubble drawn as gathered reflection dashes with a yellow rim (ch4).
- `moon(r)` — paper disc with three stepped yellow halo rings (ch5).
- `dawnBands(horizonY)` — three stepped yellow dot-size bands (ch6 duotone).

## What would make this fail (the rejected Astra look)

- A flat #000 or flat navy sky; stars as a uniform speckle instead of seeded paper knockouts; a lantern as a yellow circle without stepped rings and a reflection.
- A tiny boat icon centred on a dark rectangle; a literal skyline or harbour town; a full-body sailor or coach; a face.
- The sail as a static triangle: it must fill, luff, furl and set with anticipation and settle.
- "Pressure/tired" without a mass pressing and something sagging; "room/rest" without the composition expanding and the tempo slowing.
- Concentric arches for the glow (regulate's construction), a navy channel between two colour fields, diagonal ribbons.
- An icon row for "bedtime, friends, things you enjoy"; a bed, a clock, a phone.
- Any seam that zooms in then pulls back; ch6 must be revealed inside the moon.

## Delight (bible §4d)

**Touch reaction (≤ 0.8 s, in this story's material):** a tap makes the **nearest lantern flare** — its rings step out one ring (0.15 s, 10 % overshoot on the disc) — and prints a **water glint**: one yellow dash (60×10 u, paper core) on the nearest water band below the tap, which bobs once and dims (0.5 s). A tap on the sky wakes one **star** (paper dot r 3→8→4, 0.4 s). In the dawn chapter the tap makes the unlit ring pulse and the glint prints navy. One reaction alive at a time.

**Secondary motion that follows the main actions:** rope twang on every taut (2 redraws), sail flutter on twos when it luffs, wake dashes shortening as a hull slows, reflection dashes bobbing with the swell, spray flecks (paper, 6–8, ballistic 0.4 s) when a swell breaks on the mole, the boom's shadow shifting 10 u when the weight presses, the buoy-ball's rope loops tightening on a haul, cobble speckle on the quay catching a glint when a lantern flares, star knockouts twinkling only inside a lantern's outer ring (halftone jitter on twos), the kite's tail settling after each sway.

## Self-check (muted)

With the sound off: ch1 — a sail fills and heels the boat, then luffs; the rope tightens and sags; a lantern flares and its light reaches the hull (effort and rest on one boat, a harbour answering). ch2 — from above, the boat glides into a walled basin where the swell breaks outside and the water stills; a rope is thrown and holds, the sail folds, the hull is redrawn stronger under the lantern's glow (pausing keeps the boat whole). ch3 — a heavy mass presses on the folded sail and the ball; the camera slowly checks each pressed thing; the lantern's ring reaches the ball's rim and a breath lifts the mass a little (notice when you are tired). ch4 — the light gathers into a bubble that carries a slack sail to the post; the post answers with a bubble carrying a boat at anchor; the ball stops bobbing, the weight lifts, the water widens (say it; plan a break). ch5 — the sail furls, the moon rises, the stars spread, two quay lights join, a kite goes up, and the ball tugs once at its mooring (make room; the game stays). ch6, in two inks — dawn: the lantern swings, the post pulses, the ball is lifted aboard, the sail sets above the horizon while its reflection lies slack below (effort and rest in one routine). Every cue has a drawn consequence; the film explains itself without narration.

## Build ledger (September 20, 2026)

Built as `lib/paths/riso/stories/harbour-night.ts` (chapters mode, six scenes). Story-specific shapes: `nightField` (blue .5 then navy .75 overprint fields, seeded paper stars thinning to the horizon, optional scale about the moon), `water` (stacked teal bands, paper knocked out .45 under the top band so night water reads against the sky, a ripple screen of paper dashes with an amplitude that stills), `glowRings` (stepped yellow rings with paper knocked out beneath each ring so the lantern lights the night, a reflected dash column), `hull` (navy over teal, torn waterline, paper gunwale rim; weight = the ch2 thicker redraw), `sail` (paper triangle, belly/flutter/furl/slackTop), `rope` (catenary with taut/slack/coil), `buoyBall` (`footballPanels` with rope loops), `weightMass` (solid navy with a paper rim), `mast`, `dashLine`, `spray`.

Gates: typecheck clean · review: 45 samples, 5/5 seams pixel-exact, zero errors, maxOps 221 (mid-passage frames) · perf 390×850 DPR 1.5: median 4.3 ms, p95 15.4 ms, max 29.7 ms (one passage frame), ops median 92 · live app `--title "The Harbour at Night" --format 9v9`: PASS at all four viewports.
Screenshots: `/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso/harbour-night/app-harbour-night-<w>x<h>-ch1..6.png`, `-touch.png`; frame dumps in `/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso/harbour-night/frames/`; contact sheet `/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso/review/harbour-night.png`.

Art-director pass: the first render was too dim — yellow over the navy field printed olive and the boat was a quarter of the frame. Fixes: paper knocked out under every glow ring (the lantern now reads as light), the water lightened under the horizon, the ch1 boat scaled ×1.5 with a closer camera, ch2's hulls and lantern enlarged, the ch3 mass given a torn paper rim so its weight reads, and ch6 restored to a true yellow + navy duotone (the blue field had leaked in).
Deviations: the ch2 mole is one hand-cut arc ribbon rather than a wall following the exact storyboard points; the ch4 bubble carries a small slack sail drawn with the same `sail` helper; the touch cannot find the nearest lantern, so it flares a stepped glow at the touch point with a water glint below and one star above.
Self-critique: (1) ch1's mole is a thin dark bar on dark water — the lantern carries the harbour, the wall barely reads; (2) ch5 is sky-dominated by design but the hull is small at 320×568; (3) the p95/max frame times are the highest of my four stories because the glow rings cost four knockouts each — kept at four rings, not five.

## Fix ledger (September 20, 2026 — kid-legibility pass, bible §1c + cross-story fix 2 / fix 8)

**World rebuilt around people.** The lantern post and its stepped rings, the raised white sail, the kite and the ball-that-speaks are gone. The night is lit by the **moon** (`moon()`: a paper disc with ONE soft yellow dot-size ramp, no stepped rings, plus a column of paper dashes on the water) and by a **string of paper quay lights** (`quayLights()`, small lamps with soft halos on a navy cable along the wall). The **harbour wall** is a navy block of paper stones with navy joints (`wall()`), the water is lifted to teal .45/.55/.7 with paper crests so ch1–ch4 never fall below paper, the boat keeps its hull and mast with the **sail furled on the boom** (`furledSail()`, a loose paper bundle with three ties; ch1 arrives with the last of the cloth coming down), the mooring rope and ring stay. People are **abstract riso figures** (same `figure()` helper as different-tides) printed as **paper knockouts tinted teal** (the player, `mode:'paper', paperTone:.25`) or **yellow** (the adult, `.3`) so they read as moonlit cut-outs on the navy field; in the dawn duotone they print navy. The football is `ballLashed` (paper, navy panels, two rope loops) at ≥ 150 u.

| Ch | What changed | Kid test — "a 9-year-old would say…" |
|---|---|---|
| 1 | Camera on the boat (sail dropping onto the boom on "need a break", rope taut on "alongside the effort"), then pans to a big player (560 u) sitting on the wall with legs over the water and the ball beside them; shoulders round into a slump on "need a break"; leans back on both hands on "alongside the effort". Passage into the moon. | "A kid is sitting on the wall by the boats at night, tired, with a football next to him." PASS |
| 2 | Side-on at the quay: the hull glides in and stops, the rope is thrown to the ring on "Pausing does not" and holds (anticipation, arc, spark on the ring), the sail lies furled; the gunwale is redrawn thicker on "does not make you weak"; the player rests back on the wall and the ball gets a glint. Boat's second ball removed. | "The boat is tied up and resting, and the kid is resting on the wall too." PASS |
| 3 | Close on the wall: the player (640 u) sits forward with elbows on knees, head down; the ball rolls a few units away untouched on "More practice…"; on "How do you feel" a soft yellow moonlight ramp pans in from the left (camera pans with it) and settles on the player's back and the ball's rim; on "tired or overwhelmed" a hand goes to the head and the head drops further; the wall top is a teal .5 plank walkway with paper seams (cross-story fix 8). The pressing navy mass was cut (it printed over the moon). | "The kid is really tired after football — head down, holding his head." PASS |
| 4 | Two figures on the mole: the tall warm adult walks in from the right and leans in (listening); on "I feel worn out" a bubble pops from the player's head with a **crescent moon and a bed** inside; on "plan a break" the adult nods twice and answers with a bubble holding a crescent and a small football; the player straightens with relief. | "The kid is telling the grown-up he needs to go to bed, and the grown-up says OK." PASS |
| 5 | "Make room": a paper-and-navy **house with one lit window** pops up under the moon (bedtime); **two friend figures** run in from the right and sit down on the wall beside the player (friends); a **bicycle** pops up on the quay (things you enjoy); the ball stays lashed at its post with the single tug (interest can stay). Kite and blob gone. | "It's night, there's a house with a light on, and his friends come and sit next to him; there's a bike too." PASS |
| 6 | Dawn duotone: the player walks along the wall carrying the ball, steps aboard and stands on the deck; the adult waves on "Talk about", then walks to the ring and casts the rope off on "effort and rest"; the hull heels 12° and moves out with the sail still furled; ripples. | "In the morning she takes her ball onto the boat, the grown-up waves and lets the rope go, and the boat sets off." PASS |

Cross-story rulings applied: no raised sail, no lantern object, no kite, no cartoon bubble from the ball (the bubbles now belong to people); touch = one paper star wakes with a soft yellow halo and a glint dash (no rings). Path-review MED items: paper coverage in ch1–4 lifted (teal water, paper stones, moon from ch1); ch1→2 passage now enters the moon and reveals another night print (no brightness spike); ch6 end has the hull's outward drift instead of a hold.

Gates: `npm run typecheck` clean · `review-riso-story.mjs --id harbour-night` → 45 samples, 5/5 seams pixel-exact, 0 transparent frames, 0 errors, maxOps 308 (passage frames) · `riso-perf.mjs`: median 6.4 ms, p95 17.1 ms, max 18.5 ms, ops median 125 (paper figures cost one knockout per part) · `check-riso-films-browser.mjs --format 9v9 --title "The Harbour at Night"` PASS ×4 (touch 12–50 % of the box).
Screenshots: `…/scratchpad/riso/fix/harbour-night/app-harbour-night-<w>x<h>-ch1..6.jpg` (+ `strip-390.jpg`); cue frames `…/scratchpad/riso/frames/harbour-night/strip-ch1..6.jpg`.
Known limitations: median frame time is the highest of the four (6.4 ms) because paper figures knock out on every plate; the night field's blue×navy screens still moiré at 390 (engine halftone pitch, cross-story §3); the headline leave overlap at seams is the engine's.
