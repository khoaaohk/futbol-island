# Different Tides — riso storyboard

Story id `different-tides` · 9v9 · theme "Growing at your own pace" · six chapters, `chapters` audio mode.
Sources: narration/labels `lib/paths/films/nine.ts`; word onsets `lib/paths/films/phraseFilmScores.ts["different-tides"]`; chapter seconds `lib/paths/films/narrationTiming.json["different-tides"]` = 10, 10.8, 9.8, 8.9, 10.4, 10.1.
Headlines (bible §4c): at most one or two words, only where a chapter has a key idea to keep (three of six chapters here; the rest none), rendered as an HTML overlay in the loading-screen brush font; the tray carries the narration; no lettering inside the canvas art.
Cue times are chapter-relative. **exact** = shipped word onset. `+n.n` = a consequence chained from the previous exact cue (an offset, not new audio).

## Frame conventions

- World units: short side 1080. Chapter centre (0,0); x right, y down.
- **Core square** (readable at every viewport): x −480..+480, y −400..+380. Everything that must be understood lives here; the title strip sits above y −400 on portrait, the caption tray below y +380 (the tray itself starts ≈ +700 on the extended portrait sheet, so +380 is a safety margin).
- Portrait 390×850 extends y to ≈ −900..+700; landscape 844×390 extends x to ±900 and crops y to ±440; 1440×850 shows x ±915, y ±540. Backgrounds fill the whole sheet in every case.

## Lead imagery (owned by this story)

**Tide lines** (stepped bands of wet sand, each a flat grainy print), the **shore** seen from above and from its edge, **water reaching different marks**, a **tide-gauge post** with stepped marks, **foam lips** (paper knockouts on an advancing edge), **footprints in wet sand**, and a **float-ball** (the ball as a tide float: paper sphere, navy panels, a navy tether line to a shore peg). Lead imagery not used by any other story in this path: harbour-night owns moored hulls/lantern/sail; unfinished-map owns pencil contours/routes/landmark; grit owns seed/roots/strata/shoot/fruit.

Football objects appear only where the narration names a football action: ch3 "a stronger shot" and "understanding a pass" (the float-ball struck / rolled across the wet sand), ch4 "checking your shoulder before receiving" (footprints turn; the float-ball arrives), ch5 "compare that action" (two sets of footprints). No eye, ear or hand in this story; "look / notice / compare" are camera pans. The single **bubble** is in ch6 ("questions"), drawn as a **foam bubble** lifting off the tide line.

## Background construction (unique to this story): stepped tide lines on a shore

Every chapter's background is built from **wobbly horizontal tide-line bands**: 5–7 bands of teal and blue at stepped coverage (.12 / .25 / .4 / .55 / .7 / .8), each band its own grainy flat print with a **torn, hand-cut upper edge** (the last high-water line), stepping from dry paper sand down into full-ink water. Fine stochastic speckle lives *inside* every band (grain on ink, not only on paper). Confetti accents = shell chips (paper, blue) and dry weed flecks (navy) scattered sparsely on the sand bands. The bands are never concentric arches (that construction belongs to regulate) and never a navy channel between two colour fields; they are stacked tide lines that **move** (a band advances = the tide comes in). The huge-motif slot is the **low sun reflected in the wet sand** (ch3) and the **gauge post** (ch4).

How it differs from the other 9v9 stories: harbour-night is a navy night field with a lantern's halftone glow and still water; unfinished-map is cream paper with pencilled contour lines and a faint grid; grit is underground strata giving way to sky. Different Tides is the only one built from stepped *horizontal* wet-sand bands whose edges are tide lines.

## Dominant material metaphor and how it develops

One ocean, two shores: a **wide bay** where the tide runs up fast and leaves a high mark at once, and a **narrow inlet** where the same water creeps in and leaves its mark later. The metaphor is *the mark the water leaves*, developed chapter by chapter:

1. two tide lines advance at two speeds (the bay's jumps; the inlet's creeps) →
2. water finds its way along a rocky shore and a sandy shore: one pool fills in a rush, one seeps until an old mark drowns →
3. on the wet sand the low sun is reflected; a loud shot skips across it, quiet changes show as the reflection's edge moving →
4. the tide gauge: the coach's marks on the post; footprints turn to check the shoulder; the water reaches the receiving mark →
5. duotone: the inlet bank with the old line and today's line, two sets of footprints (washed / crisp) →
6. the coast at evening: both shores higher than in ch1, still different; a foam bubble asks, the tide answers, the water rests.

Later chapters revisit earlier places at another scale: ch5 is the bank at the top-left of ch1; ch6 is ch1's coast with ch1's tide lines still printed on it.

## Inks and role colours

Triple: **blue `#0078bf`, teal `#00838a`, bright red `#ff665e`** + navy `#22366b` on paper `#f0ece2`. Print order teal → blue → red → navy; registration 1.8 px re-seeded per chapter.

| Role | Ink |
|---|---|
| Shared ocean; the **fast, visible** tide; the teammate's shore and the teammate's pass | blue (blue × teal overprint = deep sea-green where the waters meet) |
| The **slow, quiet** tide; *your* shore, your footprints' wet fill, the support lane | teal |
| Pressure / opponent (the ch4 undertow wedge that drags at the receiving spot) | red (tone .7, torn) |
| Float-ball | paper knockout, navy panels, tether thread navy |
| Rock, gauge post, tide marks, footprints' outlines, weed flecks | navy |
| Sand | paper + navy speckle .1, torn band edges |
| Duotone beat | ch5, teal + navy only |

---

## Chapter 1 — YOUR OWN PACE (10.0 s)

`headline`: none (the tray narration carries the question)

Narration: "Have you ever watched a teammate improve and wondered why you feel stuck? Learning football can move at different speeds for different people."

**Background.** Top-down shore. Grainy paper sand with navy speckle at the top of the sheet; six stepped tide-line bands (teal .12→blue .8) stepping down to open water at the bottom; every band's upper edge torn. A **headland** (navy over teal, grainy, torn) is a blunt wedge 380 wide from (−60,−440) to its tip (−60,−40). Right of it the bands are wide and nearly straight (the **bay**); left of it they narrow and curl down-left into the **inlet** (channel 150 wide). Shell-chip confetti on the dry sand. The **float-ball** (r 90) is tethered to a navy peg on the inlet sand at (−330,+190), resting on band 2 (dry).

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 0.00 "Have you ever" | Whole coast, both shores, ball on the inlet sand | "watched a teammate improve" = **rush**: the bay's outer band anticipates (draws back 30 u, 0.2 s), then **surges** +300 u up the bay in 0.7 s (ease-out, smear on twos), its foam lip a paper knockout; it **overshoots** 40 u past the next band's edge and settles back 40 u (0.4 s). Consequence: the sand it covered is re-inked as a new wet band (teal .45) — a new tide line printed where there was none. | push 1.00→1.12 over 0.0→2.8 s centred (120,+40); the camera is dragged 60 u up the bay a beat after the surge (0.3 s late) | Bay and headland fill the right two-thirds of the core square; inlet bottom-left inside x −480 |
| +1.6 (1.60) | Same | Result readable: the new high mark hardens (navy tide line prints over the band's torn edge). A blue sparkBurst where the surge slaps the headland; two shell chips are flung 80 u and land. | (push continues) | — |
| **exact** 3.14 "you feel stuck" | Pan lands on the inlet, ball, peg | **Stuck = motion stops dead on a held drawing**: the inlet band creeps +22 u toward the ball (0.5 s ease-in), touches the tether peg… and holds. The float-ball rocks 8° on contact (anticipation), settles (0.4 s) — and stays dry. The camera keeps creeping so the hold has weight. | pan −420 x, +80 y over 3.14→4.2 s (ease-io) to centre (−300,+120); zoom holds 1.12, then a creeping push 1.12→1.16 through the hold | Inlet, peg and ball centred; bay off-frame on landscape, visible at top on portrait |
| +0.9 (4.04) | Same | The inlet's old tide line (band 3's edge at y +120) is re-traced by a navy chalk-thin line — nothing new here yet; the ball's paper highlight dims to tone .2. | hold (creep continues) | — |
| **exact** 6.20 "different speeds" | Rotate so the inlet reads vertical, headland tip at centre, both waters in frame | Two forces in one shot: the bay band anticipates (−20 u) then **lunges** +60 u at 260 u/s and settles; the inlet band **eases** +40 u at 40 u/s with no overshoot. Wave-tone lines in the bay stroke at 2× the inlet's rate. | rotate −12° and push 1.16→1.25 over 6.2→7.4 s about the headland tip (−60,−40) | After rotation both fronts inside x ±420 |
| +0.8 (7.00) | Same | Consequence: the inlet band leaves a **thin darker wet line** (teal .55, 6 u) behind it — it moved. The bay's foam fades. | hold rotation; camera continues a 20 u drift down the inlet | — |
| 8.6→10.0 seam | Camera drives into the inlet water at (−250,+60) | Passage below. | push 1.25→2.4 into the aperture, continuous with the previous push | Aperture centred in the core square |

**Seam →** Passage through the **teal inlet water** (aperture: the channel's convex ellipse 320×180 at (−250,+60)) → reveals **chapter 2: the shore edge from above at close scale, water fingering along a rocky shore and a sandy shore** — a different composition (two shore textures, water fingers, pools) that keeps travelling forward as the camera arrives.

Football truth: a teammate's visible improvement is a real, fast change that leaves a mark at once; your progress is still movement (the inlet moved 22 u and 40 u) with a fainter mark. "Stuck" is a held feeling, not zero change.

---

## Chapter 2 — DIFFERENT TIDES (10.8 s)

`headline`: none

Narration: "Think of water finding its way along different shores. Some changes arrive quickly. Others build quietly, before you can see them."

**Background.** Top-down, close to the water's edge. Left half: **rocky shore** — three big navy-over-teal boulders (grainy, torn): A 340×260 at (−300,−40), B 300×220 at (40,+120), C 380×300 at (380,−160); between them 40–60 u gaps. Right/bottom: **sandy shore** = paper with navy speckle and four stepped tide-line bands (teal .15→.55) curving around the boulders. Open water (blue .75, wave-tone lines) along the bottom and right edge. A **pool** (teal .35) is trapped between A and B with its edge at y +330; a navy mark on B's face at y +250 (last month's level). Confetti: dry weed flecks on the sand.

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 0.00 "Think of water" | Boulders left, sand bands right, pool | **Grow/reach**: a **teal water finger** (thread, 28 u wide, tip leading, paper highlight on the tip) eases in from (−440,−300) and finds its way down A's face and into the A/B gap (0.9 s, ease-in growth from its base along the curve). | push 1.00→1.15 following the finger's tip, 0.0→3.0 s | Finger path inside x −480..−40 |
| +1.4 (1.40) | Same | The finger **splits** at the gap (a second finger, 16 u) — two ways along one shore; a drop falls from the lower tip into the pool: one ripple r 0→90 (0.6 s ease-out). | (push continues) | — |
| **exact** 3.90 "Some changes arrive" | Whip to C's crest and the sandy bands | **Rush**: the outer sand band anticipates (−20 u), then a **blue surge** climbs the sand 320 u in 0.5 s (smear on twos), **overshoots** the band above by 50 u, settles 50 u; foam lip knockout + 6 blue drops sparkBurst on C's corner. Consequence: the pool on the right of B **jumps** +120 u (its torn edge redraws two bands higher). | whip-pan +380 x over 3.9→4.4 s (ease-out); the camera arrives 0.15 s after the surge (dragged) | Surge and pool jump inside y ±440 on landscape |
| +0.9 (4.80) | Same | The surge settles into a steady blue band; over the teal it overprints deep green — an obvious new line. | hold with 15 u residual drift right (decaying) | — |
| **exact** 6.46 "Others build quietly" | Pan to the trapped pool under the seeping fingers | **Quiet build = slow ease with no overshoot**: the pool rises +4 u/s; its halftone density ramps .35→.55 over 2 s (darkens before the level visibly changes). The composition slows: wave-tone lines in the open water halve their speed. | pan −500 x, +260 y over 6.46→7.5 s, zoom 1.15→1.3 centred (−120,+300) | Pool and mark on B inside y +200..+380 |
| +1.2 (7.66) | Same | Consequence: the pool edge reaches the navy mark on B (+250) — the mark **goes under** (now drawn beneath the teal band, showing through the screen). The seeping fingers thicken 4 u. | hold | — |
| 9.4→10.8 seam | Push into the pool where a drop lands | Passage below. | push 1.3→2.5 into the ripple | Aperture at (−120,+300) |

**Seam →** Passage through the **teal pool water** (aperture: the ripple ring r 220 at (−120,+300)) → reveals **chapter 3: the wet sand at the water's edge, side-on, with the low sun's reflection as a huge cream disc** — the pool was the sheen.

Football truth: both the surge and the seep are progress; only the quiet one drowns an old mark, so muted viewers read "quiet change is still change".

---

## Chapter 3 — LOOK CLOSER (9.8 s)

`headline`: **PROGRESS TOO** (HTML overlay, brush font; nothing lettered in the artwork)

Narration: "A stronger shot is easy to notice. Looking up sooner, finding space, or understanding a pass can be progress too."

**Background.** Side-on at the water's edge, low angle. **Wet sand** = a big grainy teal .3 field from y +60 down, with stepped horizontal reflection bands (blue .15/.3/.45 — the sky reflected) whose edges are the last three tide lines. The **huge disc motif**: the low sun's reflection, a **paper knockout disc r 300** at (60,+200) on the wet sand with a yellow-free warm ring (red tone .12 rim) and grain inside. Water line (blue .7, torn foam edge) at y −150; sky above = paper with blue tone ramp .1. The **float-ball** r 150 sits on the sand at (−300,+120), its tether thread running to a peg off-left. Where the narration names football actions the shore's own objects perform them: the shot is an off-frame strike from the left edge, shown only by the float-ball's departure (anticipation squash, speedLines, sand spray); no boot is drawn.

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 0.00 "A stronger shot" | Ball at left, sun disc centre-right, water line behind | **Shot = rush**: the ball squashes 12 % against the sand (anticipation 0.2 s), then **skips** right across the wet sand in 0.65 s (three touches, each a sand-spray knockout + blue sparkBurst r 120), overshoots past the disc's far rim and **stops against the tide line** at (420,+60) with a 2-bounce settle. The camera is dragged a beat late. | push 1.00→1.2 centred (0,+100) over 0.0→1.2 s; the pan follows the ball +300 x, 0.15 s late | Ball path inside y +60..+200; the stop point at x +420 is inside the core square |
| +0.65 (0.65) | Ball at rest right | Consequence: the reflection disc's rim is **broken** where the ball crossed it (three paper gaps), and a dark teal splash line prints — the loud change everyone sees. | (push continues) | — |
| **exact** 2.78 "Looking up sooner" | **The camera is the look**: it tilts from the sand up to the water line and sky | Tilt −330 y over 1.0 s (ease-io); as the frame rises the **water line is revealed** advancing (torn foam edge, +30 u ease-in) and the sky's blue tone ramp lightens .1→.2 — something was there to see. | pan −120 x, −330 y over 2.78→3.8 s, zoom 1.2 | Water line at y −150 becomes the lower third of the frame |
| +1.7 (4.48) "finding space" | Sand + water line | **Room/space = the composition expands**: the reflection bands widen (band edges slide apart 40 u, 0.8 s long ease-out) and a **teal lane** (laneArrow, width 50) draws along the wet sand from the ball's start to the open sand at (300,+60), tip leading. | drift +60 y following the lane head, 4.48→5.2 s | — |
| **exact** 6.90 "progress too" | Pan right to the ball's resting place | "understanding a pass" = **connect**: a **blue pass** rolls in along the sand from the right edge (0.75 s, ease-out, a blue coneLine flash), meets the resting float-ball and **nudges it 60 u** onto the lane (the two forms touch; the contact prints a deep green overprint spot). The ball settles in 0.4 s with no bounce. | pan +250 x, +180 y over 6.9→7.8 s, zoom 1.2→1.3 centred (60,+140) | Keep the ball ≤ y +380 |
| +1.0 (7.90) | Same | Consequence: the water line moves up 20 u behind — the tide is still coming while the quiet things happen; a ripple r 0→70 spreads from the ball's contact into the sheen. | hold with residual 10 u drift | — |
| 9.15→9.8 seam | Push into the ball's navy panel | Passage below. | push 1.3→2.6 into the panel at (−40,+150) | — |

**Seam →** Passage through the **float-ball's navy panel** (aperture: the pentagon 120 wide) → reveals **chapter 4: the tide-gauge post seen from the water, its stepped marks rising** — the panel's navy becomes the post.

Football truth: the shot is a real strike (squash, skip, stop); the pass is 0.75 s along the ground and the receiver's ball is nudged, not stopped dead; "finding space" is a lane along the shore, not a symbol.

---

## Chapter 4 — ONE SMALL TARGET (8.9 s)

`headline`: **ONE THING** (HTML overlay, brush font; nothing lettered in the artwork)

Narration: "What is one thing you can practise today? Try checking your shoulder before receiving. Ask your coach what to look for."

**Background.** The **tide-gauge post**: a huge navy post 180 wide from (−240,−520) to the sand at (−240,+380), grainy, with **stepped paper marks** (knockout bars every 70 u, wider every fifth) — the huge-motif slot. Around it, top-down-ish stepped tide-line bands (teal .15→.7) rising across the frame from the bottom right. Wet sand (paper + speckle) at the top-left. Two **footprints** (navy outline, teal .5 fill, 200 long) at (120,+40) and (200,+140), pointing up-frame. A **red undertow wedge** (pressure, red .7, torn, 300 tall, point toward the footprints) at (300,−320). The float-ball, tethered to the post's base, at (−140,+300).

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 0.00 "What is one thing" | Post, bands, footprints, wedge far | The tide band nearest the post anticipates (−15 u) then **rises one mark** on the post (+70 u, 0.6 s ease-out, small overshoot 8 u): one thing. The paper mark it reaches prints bright. The wedge begins **closing** toward the footprints at 90 u/s (pressure closes toward the receiving spot). | push 1.00→1.1 centred (−60,0) over 0.0→1.0 s | All four forms inside the core square |
| +1.0 (1.00) | Same | The band leaves a wet line on the post; the wedge's tip is 200 u from the prints. | hold | — |
| **exact** 2.60 "checking your shoulder" | **Rotate = the shoulder check** | Anticipation: the footprints counter-turn −6° (0.2 s), then **rotate +140°** as one mass over 0.5 s (the body turning to look back); the camera rotates with them. Consequence: the **wedge stops dead** on a held drawing (crumples 10 % at its tip), and a **teal lane** draws from the prints away from it. | rotate +25° about (160,+90) and push 1.1→1.2 over 2.6→3.4 s | Wedge sits in the upper-right of the core square after rotation |
| +1.6 (4.20) "before receiving" | The pass arrives | A **blue pass** flashes along the sand from the lower-left (flight 0.7 s, ease-out); the float-ball is **received**: it deforms 8 % against the leading footprint, the print **sags** 12 u to cushion (yield), the ball rolls 120 u along the teal lane and settles. | pan +120 x, +40 y with the ball 4.2→5.0 s | — |
| **exact** 5.84 "what to look for" | Pan to the post's marks | "Ask your coach" = the coach's marks: two **paper bars on the post** print thicker (0.5 s each) — the one the water reaches (+the receiving mark) and the next one up; a navy thread runs from each bar to the two things to watch (the wedge, the open sand). | pan −300 x over 5.84→6.8 s, zoom 1.2→1.3 centred (−200,0) | Post marks inside y −380..+300 |
| +0.9 (6.74) | Same | The open-sand bar gets a second brighter pass (the answer); the wedge's bar stays thin. The water laps the post once (+10 u, settle). | hold | — |
| 8.25→8.9 seam | Push into the bright post mark | Passage below. | push 1.3→2.6 into the bar at (−240,−40) | — |

**Seam →** Passage through the **paper of the gauge mark** (aperture: the bar 180×40; paper brightens as we enter) → reveals **chapter 5: the inlet bank from ch1 seen side-on and close, in two inks, with the old tide line and today's line** — a different composition (a rock face, two horizontal lines, two sets of footprints).

Football truth: the shoulder check is a turn *before* the ball arrives; pressure closes toward the receiving spot and stops when seen; the first touch goes away from it.

---

## Chapter 5 — NOTICE YOUR CHANGE (10.4 s) — duotone beat (teal + navy only)

`headline`: **SMALL CHANGE** (HTML overlay, brush font; nothing lettered in the artwork)

Narration: "After practice, compare that action with your own earlier attempts. What felt clearer? What still needs help? A small change counts."

**Background.** Side-on **inlet bank**: a rock face (navy field over teal tone → deep green-black, grainy, torn) fills the left 60 % (x −540..+80) with a **ledge** at y +40. On the face: the **old tide line** (navy, thin, y +120, with three tick marks) and space for **today's line** (teal .55, y +40, printed at cue 1). Stepped teal bands (.15→.5) run across the lower right = the inlet water lapping the ledge. Two sets of **footprints** on the ledge sand: an old pair (washed: teal .2, edges dissolved) at (−200,+10) pointing into the rock; today's pair (crisp navy outline, teal .5) at (−120,+20) pointing along the ledge. Confetti: navy weed flecks.

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 0.00 "After practice" | Rock face, old line, ledge, prints | The water anticipates (−10 u) then **rises** to the ledge (1.0 s, ease-out, 6 u overshoot) and prints **today's line** at +40 — 80 u above the old line, which stays. | push 1.00→1.15 centred (−200,+40) over 0.0→1.5 s | Both lines inside y +40..+120 |
| +2.0 (2.00) "compare that action" | Pan to the two pairs of prints | **Compare = two prints coexisting**: the old pair re-inks (teal .2→.35) so it can be seen, then today's pair prints over it at full ink, turned 40° along the ledge (the open body). Both hold 1.2 s. | pan +260 x over 2.0→3.0 s, zoom 1.15 | The pairs overlap at (−120,+20); tint vs full ink stays readable at 320×568 |
| **exact** 4.42 "What felt clearer" | **The camera is the look**: tilt up the rock face | The pan reveals **today's line** running along the whole face (the teal band prints its full length as the frame travels), and the water below stills: wave-tone lines slow to a stop (long ease-out). | pan −80 x, −300 y over 4.42→5.2 s, zoom 1.15→1.2 | — |
| +1.4 (5.82) "What still needs help" | Same | The old pair of prints re-inks once more (.35→.45) and a navy hook is drawn under it (marked to work on, not erased). | hold | — |
| **exact** 7.12 "A small change counts" | Push on the gap between the lines | A paper **knockout underline** draws between the old line (+120) and today's line (+40); the water laps once (+10 u, settle) and the underline is left wet (teal .6). | push 1.2→1.45 centred (−260,+80) over 7.12→8.4 s | At 1.45 the two lines span the core width; the ledge stays above the tray |
| +0.9 (8.02) | Same | Consequence: today's footprints get their paper highlight back (tone .2→0) — the dimness from ch1 is gone. | hold | — |
| 9.75→10.4 seam | Push into today's line | Passage below. | push 1.45→2.8 into the teal band at (−260,+60) | — |

**Seam →** Passage through the **teal water of today's line** (aperture: a lens 360×120 at (−260,+60)) → reveals **chapter 6: the coast from above at evening, both shores higher than in ch1, ch1's lines still printed** — a different composition (top-down, dusk, a foam bubble).

Football truth: you compare with your own earlier attempt (the washed prints), not with the teammate; the useful difference is one open-body turn.

---

## Chapter 6 — KEEP YOUR RHYTHM (10.1 s)

`headline`: none (the rest beat is carried by the composition breathing out)

Narration: "You can learn from teammates without matching their pace. Choose your next useful step. Leave room for practice, questions, and rest."

**Background.** ch1's coast at evening: the same stepped tide-line bands, now printed with a navy tone .2 overlay (dusk) and their edges higher — bay front at y −200, inlet front at y +20 — with ch1's marks (+90 bay, +120 inlet) still drawn as thin navy lines. Headland as ch1. Confetti: paper shell chips catch the last light (knockouts). The **teammate's shore** (bay side) carries a blue wet band; **your shore** (inlet) a teal one. The float-ball at (−300,+200) on your sand, its tether to the peg.

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 0.00 "You can learn" | Whole coast, both shores, ball on yours | "from teammates" = **connect**: a **blue surge** leaves the bay shore, rounds the headland tip and **joins** the teal inlet water (the overlap prints deep green, 0.75 s ease-out); the join **pushes** the float-ball 40 u along the sand (it rocks and settles). The bay front lunges once more (+60 u) while the inlet stays put. | pan −480 x, +300 y with the surge over 0.0→0.9 s, zoom 1.0→1.1 | Both shores inside the core square at zoom 1.0; after the pan your shore centres |
| +1.0 (1.00) "without matching their pace" | Same | The bay's new high mark prints; the inlet's line does **not** move: two rhythms held 1.2 s in one frame. | hold | — |
| **exact** 3.36 "your next useful step" | Push on your sand | One **footprint** presses into the wet sand (anticipation: sand lifts 6 u, then the print sinks with a 10 u squash, 0.4 s) and a teal laneArrow draws exactly one step long. | push 1.1→1.25 centred (−280,+180) over 3.36→4.2 s | — |
| +0.8 (4.16) | Same | A second print; the inlet band laps over the first (teal .3 wash). | hold | — |
| **exact** 5.78 "practice, questions, and rest" | Rotate up the inlet | Three beats 0.5 s apart: **practice** = a third print sinks; **questions** = a **foam bubble** (280×160, paper knockout with a navy rim, tail toward the bay shore) lifts off the tide line and drifts 60 u; **rest = breathe out**: the whole composition **expands** — bands slide apart 30 u, wave-tone lines slow to a stop, the ball rolls 20 u and settles with one ripple r 0→120. | rotate −8° and pan −200 y (up the inlet) over 5.78→7.2 s, zoom 1.25 | Bubble at (−200,+40) inside x ±480 |
| +2.4 (8.18) | Same | Consequence: a **return foam bubble** (blue rim) drifts back from the bay shore and the two bubbles touch (join → deep green rim); both tide fronts remain at their different heights. | drift −120 y forward up the inlet over 8.6→10.1 s (long ease-out) | End frame: ball at rest, both fronts and both sets of marks visible |
| 9.45→10.1 (end) | — | No seam. The last press re-seeds at 9.45; the drawing holds with a decaying 6 u lap. | drift to the end | — |

Football truth: the teammate's contribution is water that joins yours and moves your ball; "next useful step" is literally one print; "rest" is the water stilling, not vanishing.

---

## Shapes needed

Shared library (§3): `ball(s,rot)` (as the float-ball), `laneArrow/coneLine`, `thread(points,width)` (tether, water fingers, coach's threads), `field(torn|wave)`, `ripple(r,count)`, `sparkBurst`, `speedLines`, `bubble(w,h,tail)` (ch6 only, foam treatment), `chalkStroke` (tide marks).

Story-specific (author in `lib/paths/riso/stories/different-tides.ts`):
- `tideBands(seed, edges[], inks[], covs[])` — stacked wobbly tide-line bands with torn upper edges and in-band grain; `edges` animate per cue.
- `coast(seed, bayY, inletY)` — top-down sand + bands + headland wedge + inlet channel path; returns the inlet centreline for camera pans (ch1, ch6).
- `foamLip(points)` — paper knockout lip on an advancing edge.
- `boulder(w,h,seed)` — navy-over-teal torn rock (ch2, ch5 face).
- `sunReflection(r)` — huge paper disc with a red .12 rim and interior grain (ch3).
- `gaugePost(x, marks[])` — navy post with stepped paper bars (ch4).
- `footprint(s, angle, wet)` — navy outline + teal fill; `wet` < 1 dissolves the edges (ch4, ch5, ch6).
- `undertowWedge(s, angle)` — red torn pressure wedge (ch4).

## What would make this fail (the rejected Astra look)

- A ball centred on a flat blue rectangle with nothing else in motion; bands without grain, torn edges or steps.
- The coast as a small map icon instead of a full-sheet shore; two tide lines moving at the same speed, or an inlet that never moves.
- Full-body players, a coach figure, a face; a drawn boot kicking the ball (the strike is off-frame; the receive is a footprint yielding).
- Unrelated symbols: clocks, speedometers, ticks, trophies, bar charts for "compare".
- Nested arches, a navy channel between two fields, or diagonal ribbons (reserved for regulate).
- A seam that zooms in and pulls back out; ch6 must be revealed inside ch5's water.
- Holds > 1.5 s without a redraw; a "practice / questions / rest" icon row.
- Cue words that are not enacted: a "surge" without overshoot, "stuck" without a dead stop, "rest" without the composition expanding and slowing.

## Delight (bible §4d)

**Touch reaction (≤ 0.8 s, in this story's material):** a tap prints a **wet tide mark** at the touch point — a teal .6 crescent 140 u wide with a torn upper edge and a paper foam lip flashes on (0.1 s), **darkens** to navy-over-teal (0.25 s), then **dries** back into the sand (tone fades .6→0 over 0.45 s) leaving a faint navy tick on the nearest tide line. On the water (blue bands) the same tap makes one ripple r 0→160 with a paper highlight instead. Never spawns text or icons; at most one reaction alive at a time (a second tap restarts it).

**Secondary motion that follows the main actions:** sand spray (paper knockout grains, 6–10, ballistic, 0.4 s) on every surge and every footprint press; foam lips that fray into 3–5 paper flecks after a lunge; shell-chip confetti that skids 40–80 u when a band overshoots and settles; weed flecks that drift 10 u on the inlet's slow creep; the float-ball's tether thread that goes taut on a nudge and slackens on settle; wave-tone lines that speed up with the bay and slow with the inlet; in ch4 the gauge post's wet line that drips two beads (navy, 0.6 s) after the water laps it; in ch6 the foam bubbles that wobble on twos and leave a paper ring when they touch.

## Self-check (muted)

With the sound off: ch1 — one sea, a wide shore where the water lunges and prints a new line at once, a narrow shore where it creeps to a peg and stops (different paces; "stuck" is the held creep). ch2 — water fingers along rock and sand; one surge jumps two bands, one pool seeps until an old mark drowns (quick vs quiet). ch3 — a ball skips loudly across the sun's reflection; the camera looks up and finds the tide coming; a lane opens; a pass nudges the ball (loud vs quiet progress). ch4 — the water rises one mark on the gauge; footprints turn to look back and the undertow stops; the ball is cushioned into the lane; the coach's marks say what to watch. ch5, in two inks — old washed prints beside today's, old line beside today's, the gap underlined. ch6 — the teammate's water joins yours and moves the ball; one print, a foam question answered, the composition breathing out with both shores still different. Every cue has a drawn consequence; the film explains itself without narration.

## Build ledger (September 20, 2026)

Built as `lib/paths/riso/stories/different-tides.ts` (chapters mode, six scenes, `playChapters`). Story-specific shapes authored in the file: `coast` (warm paper sand + red .1 tint + navy speckle, six stepped tide bands with torn edges via `bandPath`, foam-lip knockout, drifting wave dashes, navy-over-teal headland wedge, weed/shell confetti, optional dusk overlay), `floatBall` (`footballPanels` on a navy tether with a peg), `footprint`, `boulder`, `foamBubble`, `spray`. Camera helper `cam` uses per-segment `key()` eases so cue-timed moves land on the word.

Gates: `npm run typecheck` clean · `review-riso-story.mjs`: 45 samples, 5/5 seams pixel-exact (max diff 0), zero page/draw errors, maxOps 113 · `riso-perf.mjs` at 390×850 DPR 1.5: median 3.1 ms, p95 15.8 ms, max 16 ms, ops median 54 · `check-riso-films-browser.mjs --title "Different Tides" --format 9v9`: PASS at 390×850, 320×568, 844×390, 1440×850 (tray fit, playback, pause sleep, touch burst then sleep, transcript, close cleanup, zero page errors).
Screenshots: `/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso/different-tides/app-different-tides-<w>x<h>-ch1..6.png`, `-touch.png`; full-size frame dumps in `/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso/different-tides/frames/`; contact sheet `/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso/review/different-tides.png`.

Art-director pass (what changed after the first render): ch2 gained a rocky shore of five big boulders up the top so the safe region is no longer bare sand; ch3 gained a stepped red sunset, a half-set sun on the horizon and a warm red tint on the wet sand so all three inks carry weight and the water line separates from the sand; ch4 gained an older wet band and weed flecks across the upper-left sand and its pass now starts in view on desktop; ch5's old tide line became a bleached paper mark (navy-on-navy was invisible) and the water now rises to the ledge and settles back so the old line stays visible; the float-ball grew to r 130.
Deviations from the storyboard: the ch1 inlet is a lower, narrower front left of the headland rather than a curling channel; ch5's ledge is a paper strip in 3/4 view so the footprints can be seen; the touch reaction cannot know whether it landed on water, so every tap prints the wet crescent plus one blue ripple ring.
Self-critique: (1) the tide bands read as a print but the bay/inlet "two speeds" rely on the foam lip and the marks — a muted viewer may need the second lunge at 6.2 s to get it; (2) ch2's boulders are the same construction five times; a shore with one different rock shape would be richer; (3) the wave dashes are small at 390 wide and the ch6 foam-bubble join is subtle at 320×568.

## Fix ledger (September 20, 2026 — kid-legibility pass, bible §1c)

**People are abstract riso figures** (§1c.4 as clarified): `figure(sheet,x,y,size,ink,seed,pose,opts)` in `different-tides.ts` prints a head disc + a torn torso block + two leg strokes + two arm strokes (six cut-paper shapes, big head, short legs, no face/hands/clothes), one ink or a paper knockout (`mode:'paper'`), poses `stand walk run kick reach point lean slump lookBack sit sitSlump sitKnee sitBack kneel`, a `stride(k)` run cycle on the twos grid, and per-figure overrides (`tilt`, `headDrop`, `head`, `arms`, `legs`, `scaleX`, `cov` for a ghost print). The same helper is copied into the other three 9v9 files. Role inks: navy = "you", teal = the teammate and the coach, red = the opponent. **The ball is now a football** (`tideBall`: paper sphere, teal pentagon panels, navy rim, one halftone crescent) — the tide float, its peg and tether are gone (cross-story fix 1 is satisfied by the teal panels, §1c.3 by the visible panels).

| Ch | What changed | Kid test — "a 9-year-old would say…" |
|---|---|---|
| 1 | Two figures on the sand: the teal teammate runs the bay tide line with the ball (run cycle, a kick at 1.0 and again on the way back at 6.7), navy "you" stands still in a slump with the ball at your feet; on "you feel stuck" the head drops a little more and holds while the inlet creeps to your feet (spray, wet mark). Camera follows the runner, pans to you on the cue, pulls back to .82 for "different speeds". The headland cliff stays behind. | "One kid is running around with the ball and the other one just stands there with his head down while the water comes up to him." PASS |
| 2 | Boulder row → a cliff band along the top; two stones with flat bases (small at right, big at left). The breaking wave (blue crest + paper foam cap) rushes in at 3.9–4.55 and knocks the small stone over (anticipation, 1.9 rad tip with settle, spray, spark). From 6.46 a quiet teal band creeps up the big stone linearly to the end and prints a wet line on it; the stone never moves. Fingers, pool and thread cut. | "A wave smashes into the little stone and flips it, and the water slowly creeps up the big stone." PASS |
| 3 | Sun = red .5 halftone disc half-set on the horizon (was a paper moon), sea = one teal/blue strip, wet sand below with the sun's red reflection (the stacked-band moiré is gone). "You" (navy, 560 u) winds up and kicks — the ball skips three times to the right; the teal teammate walks in and stands over it; on "Looking up sooner" your head lifts and a solid navy dotted sight line runs to the teammate; "finding space" = the teal lane; "understanding a pass" = the teammate kicks and the ball travels the lane back to your foot, cushioned (settle, ripple). Camera pans on the look. | "The kid boots the ball, then looks up at his friend, and his friend passes it back to him." PASS |
| 4 | Gauge post gone. The red opponent figure runs in from behind (top right) and stops dead when the shoulder is checked; "you" (navy) counter-turns then looks back over the shoulder (head shifted back, torso narrowed) with a dotted sight line to the opponent; the teal lane opens away; the pass arrives from the bottom-left and is cushioned; on "Ask your coach" a taller teal coach walks in at the left and points over your head at the opponent (dotted line from the hand). The .3 rad camera tilt stays as the "check". | "A red player is sneaking up behind, the kid looks back over his shoulder, then the big coach points at the red one." PASS |
| 5 | Teal duotone: the same player twice — "earlier" as a .32 teal ghost print in a walk pose with the ball 280 u ahead and speed lines (running away), "now" solid navy standing with the front foot on the ball (prints on at 2.5). "What felt clearer" = a teal spark on the kept ball and a push-in; "What still needs help" = the ghost ball wobbles; "A small change counts" = a paper underline runs beneath both prints with a teal arrow at its end. Footprints and rock face cut. | "Before, the ball got away from him; now he's got it under his foot." PASS |
| 6 | Headland moved right (`hx:300`) so the figures never sit on navy. The teammate runs the far bay line with the ball and leaves; "you" (navy, 540 u) sits on a flat boulder with one knee up (rest is named); on "your next useful step" you stand, take one step and nudge the ball a lane's length; "practice" = another tap, "questions" = a foam bubble from your head with three paper dots and the answer bubble drifting back from the bay with a teal tick, "rest" = you sit back on the rock as the water stills; a residual 1.2 Hz sway decays to the end (no dead holds). | "His friend runs off; he has a sit on the rock, then gets up and has a little kick, thinks about it, and sits back down." PASS |

Cross-story rulings applied: touch = one big teal crescent (220 u, .8) with a foam lip and paper spray, no ring, no navy tick; the sun moved down under the PROGRESS TOO headline; no tide-gauge post under ONE THING; ball redrawn per story (teal panels).

Gates: `npm run typecheck` clean · `review-riso-story.mjs --id different-tides` → 45 samples, 5/5 seams pixel-exact (max 0), 0 errors, maxOps 157 (passage frames) · `riso-perf.mjs` 390×850 DPR 1.5: median 3.5 ms, p95 15.8 ms, max 17 ms, ops median 72 · `check-riso-films-browser.mjs --format 9v9 --title "Different Tides"` PASS at 390×850, 320×568, 844×390, 1440×850.
Screenshots: `/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso/fix/different-tides/app-different-tides-<w>x<h>-ch1..6.jpg` (+ `strip-390.jpg`), full-size cue frames in `…/scratchpad/riso/frames/different-tides/strip-ch1..6.jpg`.
Known limitations: the ch1→ch2 one-frame transparent passage frame is the engine's (`clearRect` before the iris) and is reported, not fixed here; the headline leave animation still overlaps the next print for 2–3 frames (engine CSS); at 390 the ch5 "earlier" ghost sits at the left frame edge until the push-in at 5.2 s.
