# Storyboard — `reset` · Mental Toughness (legacy 11v11)

Riso rebuild, written September 20, 2026 against `RISO_BIBLE.md` §1, §1b, §2, §3, §4, §4b, §4c, §4d, §8. Script, voice files and captions are unchanged (`lib/paths/films/legacy.ts`). Cue `at` seconds are copied verbatim from `phraseFilmScores.ts["reset"]`; chapter durations from `narrationTiming.json["reset"]` (9.417, 10.617, 10.417, 9.717, 9.417, 10.415 s). Rows marked **(result)** are visible consequences of the preceding cue, timed as an offset from that cue's `at`; they are not new audio cues.

## Conventions

- World units: short side = 1080, chapter centre = (0,0), x right, y **down**. **Core square** = x ∈ [−450, 450], y ∈ [−450, 450]: every important form lives here at every viewport (fits 320×568 portrait above the tray and 844×390 landscape left of the tray with ≥ 90 units margin). Ink fields and wind bands bleed to ±1400.
- Camera key = `(cx, cy, zoom, rot°)` from → to, easeIO unless stated. Drawings on twos; camera, gust envelopes, band drift and passages every frame.
- Every cue cell is written as **anticipation → action → overshoot/settle → consequence** (§4b). Easing is named; nothing is linear except ballistic flight.
- Seam = last 0.65 s of the chapter, `forwardPassage` through the named material; aperture authored in the outgoing world; the next composition is drawn inside at scale .68 → 1 and keeps moving forward. No reverse zoom anywhere.
- **Wind direction is fixed for the whole story: pressure blows from screen-left to screen-right.** Every purple band, streak and fragment moves left→right. This is the single cause behind every change.
- Between cues nothing drifts idly: a **residual sway** (the last gust decaying, amp halving every 1.2 s) keeps the branch and the bands alive; fragments settle; the camera creeps ≤ 8 units/s.

## Headlines (§4c) and labels

HTML overlay, `IslandLoadingBrush`, one line, at most two words, only where a word carries the beat. Story file: `label` = headline (empty string when none), `transcriptLabel` = the shipped sentence label.

| Ch | Headline | transcriptLabel |
|---|---|---|
| 1 | *(none)* | WHAT IS TOUGHNESS? |
| 2 | **BEND** (arrives at 3.04 with the gust, leaves at 7.6) | BEND AND RETURN |
| 3 | **BREATHE** (arrives at 6.42, leaves at 9.6) | NOTICE THE MOMENT |
| 4 | *(none)* | ONE USEFUL ACTION |
| 5 | **NEXT** (arrives at 6.5 with the knot, stays to the seam) | SUPPORT IS STRENGTH |
| 6 | *(none)* | RESET AND RETURN |

Nothing is lettered inside the artwork.

## Lead imagery (story-owned; not used by any other 11v11 story)

1. **A flexible branch** (navy wood, purple shadow tone) that bends about its root and returns with damped overshoot.
2. **Horizontal wind bands** — the background itself is the pressure: stacked purple grainy strips that drift, compress in gusts, and relax.
3. **Leaves** — yellow, knockout veins; they flip in wind, tear off, and grow back.
4. **A knot tied in the branch** — the reset word "Next" (ch5), revisited small in ch6.
5. **The branch returning** — the final print is the branch at rest with three new leaves.

Football objects appear only where the narration names a football action, always in branch material: the ball is a **leaf-ball** (five curled yellow leaves with navy seams) — ch1 "when a pass goes wrong", ch4 "offer a simple passing option / choose one action", ch6 "returning to the game". The teammate is a **blue neighbouring branch** with a **leaf-cup** at its tip. "Check your shoulder" (ch4) is the tip leaf turning to face upwind while the camera pans as the look. **Generic eye / ear / hand / bubble: none used.** "Name that feeling" (ch3) is the leaf's own veins growing a ring around the bruise.

Lead imagery not used by any other 11v11 story: quiet-lantern owns lantern / cone / dark room; boat-weather owns sail / weather fronts; more-shirt owns shirt / fabric weave; regulate owns arches / channel / ribbons / star / scribble disc; loss owns whistle / numerals / pond rings / stones / pebble. Nothing here overlaps.

## Background world (unique to this story)

**A bending branch against horizontal wind bands.** Construction, per §1b vocabulary:

- **Grainy ink field** base: cream paper with a yellow tone ramp (dot size 0 at top-left → .3 at bottom-right) and speckle grain everywhere.
- **Horizontal wind bands**: 3–5 full-width purple strips, each its own torn-edge print (hand-cut top and bottom edges, `torn(seed)`), stepped coverage (.15 / .3 / .5 / .7 by chapter), speckled grain inside the ink, drifting left→right at band-specific speeds (far bands slow, near bands fast: 20 / 35 / 55 / 80 units/s) for parallax. Bands are **horizontal and monochrome purple**, not diagonal multi-ink ribbons; they are wind, so they *move*, *compress* in gusts (height ×0.7, speed ×3, coverage +.2) and *relax* after with a slow ease-out.
- **Huge outline motif**: the branch itself, a diagonal navy contour crossing ≥ 60 % of the frame (ch2, ch6), or a leaf interior filling the frame (ch3).
- **Confetti accents**: torn yellow / cream leaf fragments blown along the bands (8–14 per chapter, seeded, wrapping with their world index); they scatter on every push and settle after.
- **Ground**: a yellow grainy band with a torn horizon (ch1, ch2, ch6), carrying one knockout chalk line in ch6 only.
- Overprints: purple × yellow = dark olive (the line inside the leaf in ch3, and where bands overprint leaves); blue × yellow = green (where the blue branch overlaps leaves, ch6 only).

Not used (reserved for `regulate`): nested arches, the torn navy channel, edge-to-edge diagonal ribbons.

**How this background differs from the other 11v11 stories:** quiet-lantern is a dark room pierced by one lantern's stepped light cone (radial, navy-heavy, static light); boat-weather is weather fronts and sail cloth (large curved fronts, diagonal rain, cloth texture); more-shirt is a fabric weave with a growing outline (lattice, one ink knit); regulate is arches / channel / ribbons. Reset is the only 11v11 story whose background is **horizontal, moving, purple-stepped bands that compress and relax on a gust envelope**, with the branch as a diagonal counter-form.

## Inks and role colours

Family 11v11. Triple: **purple `#765ba7`, yellow `#ffe800`, blue `#0078bf`** + navy `#22366b` key. Paper `#f0ece2`. Print order: yellow → blue → purple → navy. Registration 1.8 px, re-seeded per chapter (seam tick §4d.3).

| Role | Ink | Notes |
|---|---|---|
| Leaf-ball (the ball) | yellow leaf panels, navy seams, paper knockout highlight | r 120 (ch1), 90 (ch4), 80 (ch5, ch6); has mass: accelerates over 0.2 s, lands with a bounce |
| Pressure / opponent / wind | **purple** | bands, gust streaks, the bruise, the dense blob hidden in a band (ch4) |
| Support / teammate | **blue** | the neighbouring branch and its leaf-cup; the blue branch that lifts a band (ch5) |
| Branch / leaves (the metaphor) | **navy** wood with purple shadow tone; **yellow** leaves | the branch always bends about its root; wood is heavy (slow accel, bounce), leaves are light (flutter) |
| Knot ("Next") | navy wood loop with a yellow knockout highlight | ch5 large, ch6 small |
| Chalk / offer line | navy dashed | only the passing-option line (ch4, ch6) and one touchline (ch6) |

Duotone beat (once): **ch3 is yellow + purple only** (inside the leaf; no navy, no blue). Lines there are the purple × yellow overprint. If overprint tests read muddy, fall back to yellow + navy and keep the bruise as navy halftone.

## Dominant material metaphor and how it develops

**The flexible branch in wind.** Ch1 plants it: a branch tip flicks a leaf-ball toward a blue branch and a wind band carries it off line; the response is a new blue twig growing *under* the wind. Ch2 shows the branch whole: gust, bend about the root, overshoot, return, beside a rigid post that cracks. Ch3 goes inside a leaf: the feeling is a purple bruise; naming it is the leaf's veins growing a ring around it; the breath is a paper lens of air moving along the midrib while the whole composition expands. Ch4 is the twig at the fork (the shoulder): the camera pans as the tip leaf turns to look upwind, the twig grows into the calm gap between two bands, opens a leaf-cup, and receives the leaf-ball. Ch5 is the twig pinned between two bands: a signal of three rings along the slot brings the blue branch, which lifts a band; then the twig ties a knot in itself — "Next" — and everything past the knot straightens. Ch6 is the whole branch again, seen from the knot outward: three small gust-returns (Notice, Breathe, Choose), three passes with the blue branch, three new leaves, and the branch settling to rest. Bend → return → grow.

## One world

A single tree beside a pitch, in a wind that never changes direction. Ch1 is its branch tip over the touchline. Ch2 the same branch root to tip. Ch3 inside one of its leaves (the wind bands still visible faintly through the leaf). Ch4 back on the branch at twig scale, in the calm gap between two bands. Ch5 the same twig further along, pinned in a narrower slot. Ch6 the whole branch again, from the knot outward, the bands relaxed — ch2's place revisited at another angle and a calmer weather.

---

## Chapter 1 — WHAT IS TOUGHNESS? (9.417 s) · headline: none

Narration: "What does mental toughness mean when a pass goes wrong? It means finding a useful response while making room for your feelings."

**Background construction:** calm sky of four horizontal purple wind bands (heights 160 / 200 / 180 / 220 at y-centres −340, −170, +130, +330; coverage .15 / .3 / .45 / .3; torn edges; drifting right at 20 / 35 / 55 / 80 units/s) over the grainy cream-yellow field; **ground** = yellow grainy band below a torn horizon at y = +330 (cov .35), which the lowest wind band overprints (purple × yellow olive strip). Eight torn leaf fragments blow along bands 2 and 3.

Composition at 0 s: **Branch A** (yours) enters from the left edge at (−540, +120), rising to its tip at (−120, −40), width 34 → 10, three yellow leaves at u = .4, .7, .9. At its tip the **leaf-ball** r 120. **Branch B** (teammate, blue wood and leaves) enters from the right edge at (+560, −200) to its tip at (+250, −60), ending in an open **leaf-cup** (two blue leaves, 110 wide). Between the tips: the pass gap, 370 units. **Band 3** (cov .45, y ∈ [+40, +220]) runs right under the pass line.

| Cue time + words | Composition (what fills the frame) | Cue action: physical enactment (anticipation → action → settle → consequence) | Camera key | Phone note |
|---|---|---|---|---|
| **0.00** "What does mental" (miss) | Branch tips left and right, leaf-ball at the left tip, band 3 under the gap | *Anticipation* 0–0.25: branch A's tip loads back 20 units (easeIn), leaves fold. *Action* 0.3–1.05: the tip springs forward (easeOut, overshoots 12 and returns) and the **leaf-ball flies** toward the blue cup (0.75 s ballistic). *Force*: band 3 gusts (envelope onset 0.3, peak 0.7, recovery 1.0): speed ×3, cov .45 → .7, its torn upper edge rises 60 — the band **pushes the ball**: the flight bends down-right, the ball drops into band 3, lands at (+180, +150) with a bounce (lift 24, then 8), spins to a stop at 1.4 (easeOut). *Consequence*: the blue cup **folds closed** (0.3 s); fragments scatter off the landing point and settle. | (0,0,1.0,0) → follows the ball a beat late: starts 0.45, reaches (+120,+90,1.15,0) at 1.5 (dragged by the fast thing) | Flight and landing inside the core square |
| **1.40 (result)** | Leaf-ball inside band 3 | The band **closes over** the ball: its torn edge crumples inward (edge points move 30 toward the ball, easeOut 0.4 s), mottle cov .7 → .85, the ball's yellow dims under the purple overprint (.9 → .6, olive) — the ball is *in* the noise. Residual sway on branch A decays. | hold to 2.2, then pan back to (0,+40,1.0,0) over 2.2–3.2 (bands keep drifting: no flat hold) | — |
| **4.34** "a useful response" (route) | Ball in the band, blue cup closed above right | *Anticipation* 4.34–4.5: the blue cup's leaves twitch open 10 %. *Action* 4.5–5.2: a **new blue twig grows** from the cup's base (organic ease-in, tip leading) down and left, *under* band 3, to a point 60 units in front of the leaf-ball at (+120, +190); *Overshoot*: the tip overshoots 20 and springs back; the tip unfolds into a small cup (0.3 s). *Consequence*: branch A's still-bent tip **straightens** (damped settle 0.5 s, one overshoot) and turns 10° down toward the new cup (small counter-turn first). | hold; 5.0 push to (+60,+80,1.08,0) over 0.8 (leans toward the joined forms) | New cup (+120,+190) inside core |
| **6.48** "room for your feelings" (noise) | Ball, new cup, band 3 | *Anticipation* 6.48–6.65: band 3 squeezes 10 tighter around the ball. *Action* 6.65–7.2: the band **retreats**: a **torn paper gap** (knockout, ragged edge, 320 × 200) opens around the leaf-ball (easeOut, long tail to 7.6); the band's fragments divert around the gap; band cov .85 → .6. *Settle*: the gap's edge overshoots 15 and relaxes. *Consequence*: the leaf-ball's yellow returns to .9 on paper inside the purple; the ball un-squashes (settle 0.4 s). The whole composition loosens: bands 2 and 4 drift 20 units apart. | push (+60,+80,1.08) → (+140,+150,1.2,0) over 6.48–7.6, slow ease-out (the camera breathes out with the gap) | Gap centred (+180,+150): inside |
| **8.00 (result)** | — | Gust in **band 2** (y ∈ [−260, −80]): onset 8.0, peak 8.4, recovery 8.77: speed ×3, cov .3 → .6, height ×1.3; fragments stream; branch A's leaves flip and the tip bends 10° (about the root) then begins to return. Anticipates the seam. | pan up into band 2: (+140,+150,1.2) → (+40,−170,1.35,+2) over 8.0–8.77 (leans with the wind) | — |
| **8.77–9.417 seam** | Band 2 grain fills the frame | **Passage through the purple wind band 2 (grainy ink field)**, aperture = a torn ellipse in the band's grain → reveals ch2: branch A root to tip, mid-gust, bands compressed. | forwardPassage | — |

Seam: Passage through **purple wind band 2 (grainy ink field)** → reveals **the whole branch as a diagonal from bottom-left root to upper-right tip, five bands compressed behind it, a rigid post at right** (a diagonal composition, not two tips).

Football truth: a pass pushed off line by wind (pressure from one side); the useful response is a lower option *under* the pressure (the blue twig grows below the band), not chasing the ball into the band. Flight 0.75 s.

Actions: 5 (pass carried off, band closes over, twig grows + tip straightens, gap opens, gust). Camera: follow, pan back, push, pan-up, passage = 5.

---

## Chapter 2 — BEND AND RETURN (10.617 s) · headline: BEND (3.04 → 7.6)

Narration: "Imagine a flexible branch in the wind. It bends under pressure, then finds balance. Staying rigid is not the only kind of strength."

**Background construction:** five full-width horizontal purple bands filling the frame (heights 140–200, cov .2 / .35 / .5 / .35 / .2, darkest at mid-height, torn edges, drifting right at 20–80 units/s), speckle grain in every band; **ground** yellow grainy band below y = +400 (torn horizon); fourteen leaf fragments; **huge outline motif** = branch A as a diagonal navy contour across 70 % of the frame. Gusts compress the bands (heights ×0.7, speeds ×3, cov +.2, easeIn) and release them (slow ease-out).

Composition at 0 s: **Branch A** whole: root (−520, +420) → tip (+380, −300), width 40 → 8, navy with purple shadow tone (cov .4) on the lower side; seven yellow leaves at u = .35, .48, .6, .7, .8, .9, 1.0 alternating sides. **Rigid post**: navy, straight, width 26, from (+440, +450) up to (+440, −120), purple tone at its base. Residual sway from ch1's gust (tip 14 units, decaying). No leaf-ball (this chapter is the metaphor alone).

| Cue time + words | Composition | Cue action: physical enactment | Camera key | Phone note |
|---|---|---|---|---|
| **0.00** "Imagine a flexible branch" (branch 0) | Branch diagonal, post at right, bands behind | The branch carries the ch1 gust's residual sway (amp 14 → 4 over 2 s, damped); leaves flutter one drawn frame behind the wood; bands at base drift; fragments settle onto the ground band. Nothing is still, nothing is idle. | (0,+40,0.9,0) wide, creeping to (−10,+40,0.9,0) by 3.0 | Root→tip inside core; post at x=+440 inside |
| **3.04** "bends under pressure" (branch 1) | Gust arrives | *Force*: envelope onset 3.04, peak 3.5, recovery 3.9. **Bands compress** (heights ×0.7, speed ×3, cov +.2, easeIn), fragments stream. *Anticipation* 3.04–3.24: tip lifts 20 *against* the wind. *Action* 3.24–3.7: the wind mass **pushes the branch**: it bends about its root +34° (easeIn then easeOut into the peak), tip (+380,−300) → (+430,+40); the wood's shadow tone thickens on the compressed side; leaves mirror to the wind side and stretch 15 % (light things flutter first); the leaf at u = .6 **tears off** at 3.5 and is taken by band 4. *Propagation*: the post's purple base tone flares (.4 → .5) a beat later (3.7). | push to the bend: (0,+40,0.9) → (−60,+60,1.2,−4) over 3.04–3.7, rotating with the wind (the camera leans into the push) | Bent tip (+430,+40) inside core |
| **3.90 (result)** | Wind releases | **Return**: damped settle 3.9–5.5 (two overshoots, tip amp 60 → 8 → 0, spring freq 1.1 Hz); leaves flip back one drawn frame after the wood, then flutter to rest; bands relax (heights, speed, cov back; slow ease-out over 3.9–5.0). The torn leaf spirals (2 turns) right and down on band 4 and lands on the ground at (+330, +410) at 6.5 with a small bounce. | the camera settles with the branch: rot −4 → +1 → 0, zoom 1.2 → 1.15 over 3.9–5.5 (rotation follow-through, no zoom-out) | — |
| **7.78** "only kind of strength" (branch 2) | Branch at rest; the post | Second, half-strength gust (onset 7.78, peak 8.1, recovery 8.5): bands compress again; *anticipation* tip lifts 10; the branch bends 18° (easeIn/Out) and returns by 9.2 (one overshoot). The **post** does not bend: the same push loads it (its contour thickens, 0.2 s), then a navy zigzag **crack** knockout snaps across it at y = +180 (one drawn frame), it **tilts 8° right** with a sharp stop and a 2-unit shudder, and stays tilted; the purple tone at its base spreads (.4 → .7). *Consequence*: three fragments burst from the crack and settle. | pan right to frame post + branch tip: (−60,+60,1.15,0) → (+230,+80,1.15,0) over 7.78–8.6; a 6-unit kick at the crack (8.15) | Crack (+440,+180) inside core |
| **9.20 (result)** | — | Tip at rest (+380,−300); the tip leaf turns to face the camera (small counter-turn +5°, then rot 0 → −25°, 0.4 s, settle), yellow brightens (.7 → .9): the seam material is presented. | push to the tip leaf: (+230,+80,1.15) → (+340,−240,1.4,0) over 9.2–9.97 | — |
| **9.97–10.617 seam** | Tip leaf fills the frame | **Passage through the yellow tip leaf** (aperture = leaf outline) → reveals ch3: the inside of one leaf, veins and a purple bruise, the bands faint through it. | forwardPassage | — |

Seam: Passage through **the yellow tip leaf** → reveals **a leaf interior filling the frame: midrib, veins, a purple bruise at its heart, faint wind stripes seen through the leaf** (a field interior, not a diagonal).

Football truth: pressure from one side; the receiver absorbs and rebalances rather than stiffening; the rigid post is the player who tenses up and breaks. Metaphor chapter: no ball; wind direction and purple role stay consistent with the pitch chapters.

Actions: 5 (residual sway, bend + torn leaf, return, crack, tip leaf turns). Camera: push-rotate, settle-rotate, pan + kick, push, passage = 5.

---

## Chapter 3 — NOTICE THE MOMENT (10.417 s) · duotone yellow + purple · headline: BREATHE (6.42 → 9.6)

Narration: "You might feel frustrated, embarrassed, or worried about another mistake. Name that feeling. Take a slow breath before choosing an action."

**Background construction:** the **leaf interior** as a huge motif: yellow grainy field 1000 × 560 rotated 25°, torn edge, speckle grain, centred (0,0), on cream paper; **the wind bands seen through the leaf** as faint horizontal purple stripes (cov .12, three, drifting right at 25 units/s) — the same world, seen from inside; **midrib** knockout stroke width 22 from stem (−470, +200) to tip (+470, −200), eight knockout side veins width 8. No confetti inside the leaf. Lines are the purple × yellow overprint.

Composition at 0 s: **purple bruise** (the feeling; `blob` seed 3, r 140, cov .8, mottle .6) at (−20, +10) on the midrib, edge boiling on twos.

| Cue time + words | Composition | Cue action: physical enactment | Camera key | Phone note |
|---|---|---|---|---|
| **0.00** "You might feel" (noise 0) | Leaf interior, bruise centred | Three named feelings, three **spikes** shoot from the bruise, each: *anticipation* the bruise contracts 8 % (0.15 s) → *action* the spike shoots out (easeOut 0.25 s) → *overshoot* 12 % past its length and back → *consequence* the veins it crosses are shoved 6 units aside. 0.0 "frustrated" jagged spike up-left (160); +1.1 "embarrassed" spike down-right (120); +2.2 "worried about another mistake" thin spike toward the tip (200) that shakes in place on twos. Between spikes the bruise pulses r 140 ↔ 155, period 1.2 s. | drift pan (0,0,1.0,0) → (−40,+30,1.05,−2) over 0–2.6 following the spikes; a 4-unit kick on each spike | Bruise + spikes within r 220 of centre |
| **2.60 (result)** | — | Bruise cov .8 → .95, mottle tightens (unnamed, it grows); the wind stripes through the leaf speed up ×2 and the leaf's torn edge flutters (light material responds). | hold (−40,+30,1.05,−2) with a 6-unit residual drift | — |
| **5.02** "Name that feeling" (noise 1) | Bruise with three spikes | *Anticipation* 5.02–5.2: the two side veins nearest the bruise thicken and bow outward 10. *Action* 5.2–5.7: **the veins grow a ring**: they extend (organic ease-in, tips leading, overprint line width 14) and **join** around the bruise — two forms travelling to meet — with a small overshoot past each other before the join snaps closed. *Consequence*: pulsing stops on a held drawing; the spikes round off into three soft lobes (0.4 s); boiling stops; the shoved veins straighten back (settle). Everything holds still while the camera creeps (the hold has weight). | push into the ring: (−40,+30,1.05,−2) → (0,+10,1.25,0) over 5.02–5.7, then creep 3 units/s | Vein ring ≈ 420 × 300: inside core at zoom 1.25 |
| **6.42** "Take a slow breath" (breath) | Ring holds the bruise | **Inhale** 6.42–8.0: the whole **composition expands** — the leaf scales 1.0 → 1.06 about its stem (long easeOut), the wind stripes retreat to cov .06 and slow ×0.5, the vein ring's line slackens (width 14 → 10); a **paper knockout lens** (air, 140 × 60, soft wobble edge) travels the midrib stem → tip (easeInOut 1.6 s). **Exhale** 8.0–9.77: the leaf relaxes to 0.98 (slower ease-out); a second lens travels tip → stem; the bruise's coverage opens .95 → .45 (halftone shows paper): smaller, still there, still named. Tempo slows: no other motion. | pan along the midrib with the air: (0,+10,1.25,0) → (+260,−120,1.25,+3) over 6.42–8.0 (long ease-out); rot +3 → −2 on the exhale 8.0–9.4 (the camera breathes with the leaf) | Tip region (+260,−120) inside core |
| **9.77–10.417 seam** | Leaf tip, the second lens arriving | **Passage through the paper air lens at the leaf tip** (aperture = the lens shape, convex) → reveals ch4: the twig at the fork, in the calm gap between two bands. | forwardPassage | — |

Seam: Passage through **the paper air lens at the leaf tip** → reveals **twig scale: a heavy band above, a band below, a calm paper gap between them, a twig with a fork entering from the left, the blue branch with the leaf-ball at upper right** (a layered horizontal composition, not a leaf interior).

Football truth: naming and breathing is the scan-and-settle before acting; nothing football-mechanical happens, by design. Pressure ink stays purple.

Actions: 5 (three spikes, growth, vein ring joins, inhale expansion, exhale). Camera: drift pan + kicks, push + creep, pan-with-breath, rotate, passage = 5.

---

## Chapter 4 — ONE USEFUL ACTION (9.717 s) · headline: none

Narration: "What can you do now? Check your shoulder. Move into space. Offer a simple passing option. Choose one action you can try."

**Background construction:** twig scale, high contrast: **band above** (y ∈ [−450, −200], cov .55, mottle .6, torn lower edge) and **band below** (y ∈ [+170, +450], cov .5, torn upper edge) drifting right at 55 / 80 units/s; between them the **calm gap** (y ∈ [−200, +170]) of cream paper with yellow grain (cov .15) — the space; ten leaf fragments ride the two bands, none in the gap. A **dense purple blob** (the opponent, cov .9, mottle .7, torn edge, r 120) sits *inside* band above at (−150, −300), hidden: it reads only as a slightly darker patch until the pan reveals it.

Composition at 0 s: **Twig A** (yours; navy, purple shadow tone, width 18 → 8) enters from the left edge at (−540, +260), rises to a **fork** at (−240, +200) (the shoulder; the short prong points back up-left), and continues to its tip at (−80, +230) — *inside* band below's upper edge (you are standing in the pressure), the tip leaf folded. **Branch B** (teammate, blue) enters from the top-right corner to its tip at (+320, −150) in the gap's upper part, holding the **leaf-ball** r 90 at (+250, −120) in its cup.

| Cue time + words | Composition | Cue action: physical enactment | Camera key | Phone note |
|---|---|---|---|---|
| **0.00** "What can you do" (eye 0) | Twig A low-left in the band, blue branch with the leaf-ball upper right, heavy band above | **Check the shoulder** — *anticipation* 0–0.15: the tip leaf dips forward 5°. *Action* 0.15–0.55: the tip leaf **turns back** to face upwind (rot 0 → −150°, easeOut, overshoot −165° and settle) and the tip curls back 15°. **The camera pans as the look** and *reveals* the blob: as the view rotates and travels up-left, band above's coverage thins locally (a paper-halftone window r 200 opens, easeOut 0.5 s) and the dense purple blob with its torn edge is uncovered by the pan, not faded in. *Consequence*: the blob, seen, **shoves** 20 units toward the ball (0.3 s) and band above's lower edge crumples where it pushes. | the look: (−60,−60,1.0,0) → (−150,−180,1.05,−8) over 0.15–0.7 (the camera turns as the look) | Blob (−150,−300) inside core |
| **1.30 (result)** | — | Tip leaf turns forward again (counter-turn, 0.3 s). The blob **creeps down** toward the leaf-ball at 25 units/s (heavy mass, slow accel) and band below **presses up** 15 units/s onto twig A's tip: the twig's tip **sags** 12 under it. | return: (−150,−180,1.05,−8) → (−60,−60,1.0,0) over 1.3–1.9 | — |
| **2.62** "Move into space" (pass 2) | Twig tip sagging in the band; calm gap above it | *Anticipation* 2.62–2.8: the tip dips 10 further (loads). *Action* 2.8–3.5: **twig A grows into the calm gap** — a new curve grows from the fork (organic ease-in, tip leading, smear-on-twos at the fastest frame), tip (−80,+230) → (+60,−20); *overshoot* 20 past, springs back (0.3 s); four navy `speedLines` behind. *Consequence*: band below's upper edge **slides on into the vacated spot** and stops with a 6-unit crumple (pressure fills the space you left); the fragments there scatter and settle. | pan following the tip a beat late: (−60,−60,1.0,0) → (+100,−40,1.1,0) over 2.75–3.6 | New tip (+60,−20) at the centre of the gap |
| **3.60 (result)** | Tip in the gap, facing the leaf-ball | **Offer a passing option**: *anticipation* the tip leaf twitches; *action* the tip unfolds into a **leaf-cup** (two yellow leaves, easeOut 0.5 s, overshoot open and settle) facing the ball; a **navy dashed line** self-draws leaf-ball → cup (0.6 s, easeOut). *Consequence*: branch B's tip turns 15° toward the cup (counter-turn first). The blob continues down to (−100, −200), heavy. | hold; 5.4 the cup leaves flutter once (alive); camera creeps 4 units/s toward the line | Line spans (+250,−120) → (+60,−20): inside |
| **6.36** "one action" (touch) | Line ready | *Anticipation* 6.36–6.55: branch B's tip loads back 25. *Action* 6.55–7.3: **pass** — the leaf-ball flies along the line (0.75 s ballistic, arc 30, spinning), yellow `sparkBurst` on arrival; the **cup cushions**: the twig dips 20 under the ball's mass and settles (two overshoots, 0.5 s); the ball rests in the cup. *Consequence*: the blob **stops dead** on a held drawing (the option beat the pressure); dashes vanish behind the ball as it passes. | dragged by the ball: (+100,−40,1.1,0) → (+60,−20,1.2,0) over 6.7–7.4 (a beat late) | — |
| **8.20 (result)** | Leaf-ball in the cup | The ball settles with a quarter turn (counter-turn, then 0.3 s easeOut) presenting a wide **navy seam** between two leaf panels to the camera. | push (+60,−20,1.2) → (+60,−20,1.6,0) over 8.2–9.07 | — |
| **9.07–9.717 seam** | Seam between leaf panels fills the frame | **Passage through the leaf-ball's navy seam** (aperture = the lens-shaped gap between two panels) → reveals ch5: the twig pinned in a narrow slot between two bands. | forwardPassage | — |

Seam: Passage through **the navy seam of the leaf-ball** → reveals **a horizontal slot squeezed between two heavy purple bands, twig A running through it with the leaf-ball, the blue branch at the right edge** (a squeeze composition, not an open gap).

Football truth: off the ball, check the shoulder to locate the pressure before moving; move into space *away* from the near opponent; the passing option is a visible angle; pass flight 0.75 s; receiver cushions. Pressure closes toward the ball, not toward empty grass.

Actions: 6 (look + reveal, sag, grow into gap, cup + line, pass + cushion, seam turn). Camera: pan-as-look, return, pan-follow, follow ball, push, passage = 6.

---

## Chapter 5 — SUPPORT IS STRENGTH (9.417 s) · headline: NEXT (6.5 → seam)

Narration: "If you feel stuck, ask a teammate or coach for help. A reset word, like Next, can remind you where to put your attention."

**Background construction:** two purple bands **pressing vertically**: band top (y < −60, cov .8, mottle .6, torn lower edge) and band bottom (y > +140, cov .8, torn upper edge), leaving a horizontal **slot** of paper with yellow grain (y ∈ [−60, +140]) — a horizontal squeeze, not a vertical navy channel; twelve leaf fragments jammed in the slot (confetti); grain in every band.

Composition at 0 s: **Twig A** runs through the slot from the left edge (−540, +40) to its tip at (+300, +30), carrying the **leaf-ball** r 80 at (−120, +40) in a small cup. **Branch B** (blue) enters from the right edge at (+560, −20), tip at (+380, +10).

| Cue time + words | Composition | Cue action: physical enactment | Camera key | Phone note |
|---|---|---|---|---|
| **0.00** "If you feel stuck" (closed) | Slot with the twig and leaf-ball; bands top and bottom | *Anticipation* 0–0.15: both bands lift away 8 (the breath before the squeeze). *Action* 0.15–0.65: the two band masses **push in** (easeIn, heavy): slot 200 → 120; their torn edges crumple against the twig; the twig **flattens** 4 % and its leaves fold; the leaf-ball **squashes** 4 % (`squash`); band cov .8 → .95. *Consequence*: fragments are squeezed out along the slot and pile at the tip; then **motion stops dead** on a held drawing (stuck), while the camera creeps. | push into the slot: (−120,+40,1.0,0) → (−120,+40,1.15,0) over 0–0.6 (leans into the push), then creep 4 units/s | Bands span to ±450: on the core boundary; twig and ball (important) at y ≈ +40 |
| **1.22** "ask a teammate" (ripple 2) | Ball stuck; blue tip at right | **Ask**: *anticipation* twig A's tip leaf curls 0.15 s; *action* it flicks three times toward B (three drawn frames each) sending **three navy ripple rings** (r 30 → 260, born every 4 drawn frames, alternating navy / paper knockout) along the slot; they reach B's tip at ~1.9. **Support = two forms travel and join**: B **bends in** (about its right-edge root, easeIn/Out 0.6 s, overshoot 15) and its tip **wedges under band top and lifts it**: slot 120 → 260 (easeOut 0.8 s, with a 12-unit bounce as the band's mass resists then gives); band cov .95 → .5 (paper through). *Consequence*: fragments spill out; the twig un-flattens. | pan right toward B a beat after the rings: (−120,+40,1.15,0) → (+20,+40,1.15,0) over 1.4–2.3 (zoom constant); 5-unit lift kick at 2.3 | B's tip (+380,+10) inside core |
| **2.90 (result)** | Slot open | Twig springs back to round (settle 0.4 s, one overshoot), leaves unfold with a flutter, the leaf-ball un-squashes and **rolls 60 right** along the twig to (−60, +40) (accelerates, stops with a small bounce). Band bottom stays where it is (the opponent has not gone; there is room). | hold | — |
| **4.50 (result)** | — | B **withdraws** 40 units (easeInOut; support given, not taken over); band top stays lifted at cov .5 and its edge relaxes (crumple smooths out). Residual sway on both twigs. | slow drift (+20,+40,1.15,0) → (+60,0,1.15,+2) over 4.5–6.5 | — |
| **6.50** "where to put your attention" (eye 1) | Twig continuing right past the ball | **Reset word = a knot**: *anticipation* 6.5–6.7: the twig's tip curls back 30 (counter-move). *Action* 6.7–7.2: the tip **loops back through itself** (a strand looping through another; self-draw of the loop, easeOut, yellow knockout highlight) and **pulls tight** into a **knot** r 40 at (+180, +30) with a snap (one drawn frame) and a 3-unit shudder. *Consequence*: the twig *past* the knot **straightens** (tension slackens on the near side, tightens on the far side), brightens (navy cov .9) and **grows 120 units forward** to (+340, +20) (organic ease-in, tip leading); the fragments in the slot are drawn to the knot and gather on it (attention gathers there). | rotate + pan: (+60,0,1.15,+2) → (+120,+10,1.25,0) over 6.5–7.4; a 4-unit kick at the snap (7.2) | Knot (+180,+30) and grown tip (+340,+20) inside |
| **8.10 (result)** | — | Knot tightens (r 40 → 34, easeIn, then a 2-unit relax), its yellow highlight brightens; fragments settle on it. | push to the knot: (+120,+10,1.25) → (+180,+30,1.8,0) over 8.1–8.77 | — |
| **8.77–9.417 seam** | Knot fills the frame | **Passage through the knot (navy wood loop, yellow highlight)** → reveals ch6: the whole branch from the knot outward, bands relaxed. | forwardPassage | — |

Seam: Passage through **the knot in the twig** → reveals **the whole branch again, root bottom-left to tip upper-right, the knot small on it, faint relaxed bands, the blue branch reaching in from the right, a yellow ground band with one chalk line** (the ch2 place at another angle and calmer weather).

Football truth: closed down by two opponents, the right response is to signal for a supporting angle; when a teammate offers one, the pressure opens (a defender must respect the option). The ball moves into the opened space, not through the wall.

Actions: 6 (bands push in, ask rings + B lifts band, ball rolls free, B withdraws, knot + tip grows, knot tightens). Camera: push + creep, pan + kick, drift, rotate-pan + kick, push, passage = 6.

---

## Chapter 6 — RESET AND RETURN (10.415 s) · headline: none

Narration: "You can feel disappointed and still contribute. Notice. Breathe. Choose. Practise returning to the game, one moment at a time."

**Background construction:** bands relaxed: five faint horizontal purple bands (cov .12 / .2 / .3 / .2 / .12, torn edges, drifting slowly at 10–40 units/s), the calm gap wide; **ground** yellow grainy band below a torn horizon at y = +330 with one **knockout chalk line** (the touchline, width 16, wobble) along y = +380 — the game; six leaf fragments, drifting slowly; **huge outline motif** = branch A across the frame.

Composition at 0 s: **Branch A** root (−520, +420) → tip (+400, −260), width 40 → 8, carrying a 3° residual bend from the passage; the **knot** at u = .55 (≈ (−60, +60)) at r 26; the **leaf-ball** r 80 in the tip cup; a **purple bruise** (disappointment, r 60, cov .6) on the leaf at u = .7, wearing its ch3 vein ring at small scale. **Branch B** (blue) reaches in from the right edge, tip cup at (+470, −140).

| Cue time + words | Composition | Cue action: physical enactment | Camera key | Phone note |
|---|---|---|---|---|
| **0.00** "You can feel disappointed" (noise 1) | Whole branch, knot, bruise, leaf-ball at the tip, blue cup at right | The bruise **pulses once** (contracts 6 %, then r 60 → 70 → 60, 0.6 s, settle): disappointment is present. Yet the branch keeps its residual sway and the leaf-ball **rolls 30 units** along the cup rim toward B (accelerates, stops with a bounce): contributing anyway. | (−200,0,1.1,0) creeping to (−190,0,1.1,0) | Root and tip inside core |
| **3.34** "Notice. Breathe. Choose" (breath) | Branch, bruise, tip cup | **Notice** 3.34: a weak gust (onset 3.34, peak 3.6, recovery 3.9): bands compress lightly, the branch bends 12° about the root and returns (one overshoot); **the camera pans as the look** to the bruise while the tip leaf turns to face it (counter-turn, 0.3 s); the vein ring brightens. **Breathe** ~4.1 (result +0.8): the **composition expands** — bands retreat to cov .06 and slow ×0.5, the branch's residual bend eases to 0, the paper **air lens** (90 × 40) travels the wood root → tip (easeInOut 1.6 s); the return overshoot dies out exactly as the lens reaches the tip; tempo slows. **Choose** ~4.9 (result +1.6): the tip cup turns 15° toward B (counter-turn first); a **navy dashed line** self-draws tip cup → B's cup (easeOut 0.6 s). | push (−200,0,1.1) → (−80,−60,1.2,0) over 3.34–3.9 (the look); rot −2 → +2 → 0 with the breath 4.1–5.7 (the camera breathes out); pan to (0,−60,1.2,0) over 4.9–5.6 revealing the line | Line spans (+400,−260) → (+470,−140): right edge of core; B's cup at +470 is 20 units outside the core — acceptable as the receiving edge; the ball's rest point is inside |
| **5.80 (result)** | — | Bruise cov .6 → .4 and stops boiling. 6.6 the tip leaf flutters. | hold (0,−60,1.2,0), creep 3 units/s | — |
| **7.60** "one moment at a time" (touch) | Line ready, ball at A's tip | **Three moments**, each: *anticipation* the sending cup loads back 15 (0.15 s) → *action* spring + flight (0.5 s ballistic) → *cushion* the receiving cup dips 15 under the ball's mass and settles (two overshoots) → *consequence* a yellow spark and a **new leaf unfurls** on branch A (organic ease-in, 0.3 s). 7.6–8.1 A → B; 8.3–8.8 B → A (return pass); 9.0–9.5 A → B. New leaves at u = .5, .75, .95: growth. | dragged by the ball: (0,−60,1.2,0) → (+240,−180,1.2,0) over 7.7–9.6 (`motionPath`, no stop at each pass) | Both cups and the flights inside the frame |
| **9.60 (result)** | Ball cushioned in B's cup | Branch A **settles to rest** from its residual bend (damped 0.6 s, one overshoot); bands at their faintest; three new leaves, the knot, the ball in the blue cup: held print until 10.415. | stop at (+240,−180,1.2,0) at 9.6; hold | — |

No seam (last chapter): the final print holds, marks fixed. **End card** (§4d.6): the three new leaves do one small celebratory flutter (0.5 s) and settle; the Replay button takes its printed-stamp look.

Football truth: returning to the game = short passes in rhythm with a teammate, each cushioned; the option (line) is chosen before the ball moves. The chalk line marks the pitch without claiming a goal.

Actions: 7 (pulse, roll, notice, breathe, choose, three passes + leaves, settle). Camera: push-as-look, breathe-rotate, pan, follow, stop = 5.

---

## Delight (§4d)

**Touch reaction** — `touch(sheet, x, y, age)`, ≤ 0.8 s, story inks: the tap **shakes a leaf loose**: a yellow leaf (60 × 30, knockout midrib) appears at the touch point already mid-flutter, spirals down two turns while drifting right with the wind (120 units down, 90 right, `age` eased-out), fades over the last 0.2 s; a small purple gust puff (three 2-unit streaks, 0.3 s) marks the tap. While paused: one leaf, then sleep. Reduced motion: a single static leaf mark that fades.

**Secondary motion that reacts to the main actions** (seeded, bounded lifetimes):
- Leaf fragments in the bands scatter away from every push (band close, gust, blob shove) and settle within 1.2 s; they gather on the knot in ch5.
- Leaves on the branch flip one drawn frame after the wood, flutter to rest after every return.
- The purple shadow tone on the wood thickens on the compressed side during every bend.
- The post's crack throws three fragments (ch2); the leaf-ball's landing throws a small spray of yellow specks (ch1, ch4, ch6).
- The chalk line in ch6 gets a tiny dust puff when the ball passes over it.

**Seam tick**: new registration seed and a paper flip at every seam; haptic 8 ms where supported.

**Headline arrival**: BEND / BREATHE / NEXT pop in with the CSS misregistration settle; nothing on canvas.

---

## Shapes needed

From the shared library (§3): `leaf`, `field(torn|wall)`, `ripple` (the three signal rings, ch5), `laneArrow` (dashed offer line, ch4/ch6), `chalkStroke` (one touchline, ch6), `speedLines`, `sparkBurst`; motion: `twos`, `key`, `camKeys`, `anticipate`, `settle`, `squash`, `spring`, `wob`, `blob`, `torn`; `forwardPassage`.

Story-specific (author in `stories/reset.ts`, not the library):
- `windBands(sheet, bands[], t, gust)` — full-width torn-edge purple strips with stepped coverage, per-band drift speed, compress/relax on a gust envelope; fragment confetti riding them with world-index seeding; edge crumple toward a push point.
- `gust(t, onset, peak, recovery, strength)` — envelope shared by bands, branch bend angle, streaks and camera rotation.
- `branch(sheet, root, tip, bendAngle, seed, leaves[])` — tapered wobbly spine bending about the root, purple shadow tone that thickens on the compressed side, leaves mirrored on the wind side, tear-off state, unfurl state for new leaves.
- `leafBall(sheet, r, rot, squash)` — five curled yellow leaf panels with navy seams and a paper highlight (the story's ball).
- `leafCup(sheet, x, y, angle, open, ink)` — two leaves cupped; yellow (yours) or blue (teammate); dip-and-settle on receive.
- `knot(sheet, x, y, r, tighten)` — the twig looped through itself with a yellow knockout highlight.
- `leafInterior(sheet, w, h, rot, veinCount)` and `veinRing(progress)` — ch3 field, the naming ring.
- `airLens(sheet, path, u, w, h)` — paper knockout lens travelling a path (breath; ch3 and ch6).
- `bruise(sheet, x, y, r, spikes[], cov)` — the feeling blob with shoot-out spikes / rounded lobes.
- `post(sheet, x, y0, y1, tilt, crackAt)` — rigid post with knockout crack (ch2).
- `touch(sheet, x, y, age)` — the loose-leaf reaction.

## Reduced motion prints (one per chapter)

Ch1 at 5.6 s (leaf-ball in the torn gap, new blue cup under the band), ch2 at 3.6 s (peak bend, bands compressed), ch3 at 5.7 s (vein ring around the bruise), ch4 at 7.4 s (leaf-ball cushioned in the cup in the calm gap), ch5 at 7.4 s (knot tied, twig grown past it), ch6 at 9.6 s (three new leaves, ball in the blue cup, branch at rest).

## What would make this fail (the rejected Astra look, and the repetition rule)

- A small centred ball icon with a purple "emotion" cloud on a flat navy background. Here the leaf-ball is r 120 and the wind is torn, grainy, moving bands.
- **Any flat background**: a chapter whose ground is a single flat fill, or bands drawn as clean straight stripes without torn edges, grain and drift.
- Using the reserved constructions (nested arches, a vertical torn navy channel, diagonal multi-ink ribbons) — those belong to `regulate`. Reset's bands are horizontal, single-ink purple, and move.
- The **ball-boot-eye-bubble sequence**: a boot for "move into space", an eye for "check your shoulder", a hand for "ask a teammate", a bubble for "name that feeling". Here those are the twig growing into the gap, the tip leaf turning upwind with the camera panning as the look, the blue branch lifting a band, and the veins ringing the bruise.
- A cue where the word says push / pressure / breathe and the frame does not enact it: a band that changes colour instead of pushing; a "breath" that is only a fade; a bend without anticipation, overshoot and return.
- A branch as one bezier wiggling in place with no root, no gust envelope, no leaves flipping, no torn leaf, no post to contrast.
- Flat holds ≥ 1.5 s without a drawn change or camera move; idle wobble instead of a decaying residual sway.
- Unrelated symbols: a heart, lightbulb, brain, lightning bolt; any lettering on canvas (the word "Next" is the HTML headline; the knot is the drawing).
- Tiny icon grids: three feelings as three little icons. Here they are three spikes from one bruise.
- Full-body figures or faces. "You" is a twig with a fork; the teammate is a blue branch.
- Hard cuts or zoom-out seams (pulling back from the leaf to show the tree). Every seam goes *into* a material: band → leaf → air lens → ball seam → knot.
- Per-frame random wobble on lines; per-dot halftone shaking.
- Breaking the wind direction (a gust from the right) or swapping role inks (a blue opponent, a purple teammate).

## Self-check — does the muted film still explain the narration?

Muted, ch1 shows a branch tip flick a leaf-ball toward a blue cup, a purple band surge and carry it off line into itself, a blue twig grow down under the band to re-offer a cup, and a torn paper gap open in the band around the ball: "a pass goes wrong; a useful response; room for the feeling." Ch2 shows the bands compress, one branch bend from its root and come back with overshoot while a post beside it cracks and stays tilted: "bend and return; rigid is not the only strength." Ch3 goes inside a leaf where a bruise shoots three spikes, the veins grow a ring around it and it holds still, then the whole leaf expands as a lens of air moves along the midrib and the bruise opens to halftone: "name it, breathe, it gets smaller." Ch4 is football in branch material: the camera turns as the tip leaf looks back and a hidden blob in the band is uncovered, the twig grows into the calm gap, opens a cup, a line appears, the leaf-ball is passed along it and cushioned. Ch5 shows the twig pinned in a slot, three rings sent along it, the blue branch bending in and lifting a band, then the twig tying a knot and straightening past it. Ch6 shows the whole branch with the knot on it, a small gust-return, the breath expansion, three cushioned passes with the blue branch, three new leaves, and the branch settling level. The only ideas that lean on the voice are the *names* of the three feelings in ch3 (three spikes show three, not which) and the word "Next" — which the HTML headline carries at 6.5 s over the knot. Every cue has a drawn, physical consequence; no chapter rests on a symbol the narration does not mention; no chapter has a flat background; no sentence is lettered in the artwork.

---

## Build ledger — `lib/paths/riso/stories/reset.ts` (September 20, 2026)

**Gates (all green):** `npm run typecheck` clean · `scripts/review-riso-story.mjs --id reset`: 45 samples, 5/5 seams pixel-exact (max diff 0, changed 0), zero page/draw errors, max 162 ops (a passage frame), scene ops 40–95 · `scripts/riso-perf.mjs reset` at 390×850 DPR 1.5: **median 4.1 ms**, p95 16.4 ms (passage frames), max 21.8 ms, ops median 59 · `scripts/check-riso-reset.mjs` (copy of the browser check with format tab 11v11 and button "Story: Mental Toughness"): PASS at 390×850, 320×568, 844×390, 1440×850 — tray fits, six chapter dots, playback, pause sleeps, paused touch wakes one burst then sleeps, transcript, close releases audio, zero page errors.

**Screenshots:** `scratchpad/riso/reset/app-reset-<w>x<h>-ch<1..6>.png` (+ `-touch.png`) for the four viewports, contact sheet `scratchpad/riso/review/reset.png` (session scratchpad `/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/`).

**What was built as boarded:** the six constructions (band sky + ground · whole branch + post · leaf interior duotone · calm gap between two bands with the hidden blob · vertical squeeze slot · relaxed bands + touchline); wind fixed left→right; gust envelope (`gust`/`gustInt`) drives band height/coverage/drift, the branch bend about its root with anticipation and a damped two-overshoot return (`ch2Bend`), leaf mirroring and flutter, fragment streaming; the post loads, cracks (paper zigzag) and stays tilted; the bruise shoots three spikes that round into lobes when the vein ring joins with an overshoot; inhale/exhale scale the leaf and the camera zoom while a paper air lens travels the midrib; the tip leaf turns as the look while the camera pans and uncovers the blob through a paper window; the twig grows into the gap with speed lines and the lower band slides into the vacated spot; dashed offer line, ballistic pass with cup cushion and spark; the slot squeeze (bands push in, ball squashes, twig flattens, then motion stops dead), three rings, B bends in and lifts the band with a bounce, the knot self-draws and snaps with a camera kick, the twig straightens and grows past it, fragments gather on the knot; ch6 pulse, notice-gust, breath lens, choice line, three cushioned passes with three unfurling leaves. Passages: band 2 grain → tip leaf → air lens at the leaf tip → the ball's navy seam widened into a lens → the knot's yellow eye. Touch: a loose leaf spirals down-right with a small purple gust puff. Reduced-motion stills at 5.6 / 3.6 / 5.7 / 7.4 / 7.4 / 9.6 s.

**Deviations from the board (and why):**
- Zoom keys are monotone inside every chapter (engine rule): ch1 pans back at zoom 1.15 rather than 1.0, ch2's settle keeps zoom 1.2 (rotation follow-through only), ch3's breath is a +6 % / −2 % zoom breath rather than a return.
- Ch3's bruise is off-centre (−110, 40), ragged (blob amp .22) and the vein ring is an angular 18-point contour: the first pass with a round bruise centred in the almond leaf read as an *eye*, which the bible forbids.
- Ch5's slot is 280 units at rest (board: 200) and the masses carry three stepped navy strata each (the reference's nested tonal bands, horizontal) so the squeeze is not a flat purple field; the camera sits at 1.25–1.5 so the twig, ball (r 120) and knot (r 52) read on a phone.
- Ch6's tip is (330, −230) and B's cup (420, −110) (board: 400/−260 and 470/−140) so the leaf-ball is not under the Done button at 844×390 at chapter start.
- The three ask-rings are navy only (`ripple`), not navy/paper alternating.
- Headlines (BEND, BREATHE, NEXT) are chapter-level (`chapter.headline`); the engine pops them at chapter start, not at the board's mid-chapter arrival times.
- End-card flutter is not drawn: the player holds the last frame and does not call draw past the chapter's duration.
- Every lead object was scaled ×1.3–1.5 from the board's numbers after the first contact sheet (branches 50–54 → 10–14 wide, leaves 150–175, ball r 150/110/120/100), per the pilot's lesson.

**Self-critique:** the print language holds at every viewport (stepped purple screens, olive where the ball drops into a band, green where blue leaves cross yellow, paper crests on the bands, registration echo on the headlines) and every seam is a real forward passage into a named material with zero-pixel seams; but ch4's calm gap and ch6's start are the sparsest frames — the "space" reads as intended yet a critic may still call the gap thin at 0–2 s; the ch2 crack is small on a 320-wide phone; and the leaf-ball's five curled seams read as a pinwheel more than a football when it spins fast.

## Fix ledger (2026-09-20, fixer agent — 11v11 review pass)

**Punch list → change (file `lib/paths/riso/stories/reset.ts`).**
- §1c.4 figures (`figure()` helper copied in): **ch1** a navy player winds up and kicks the ball at .3 s (the pass), the blue teammate waits with arms up (`reach`) and slumps as the pass is lost. **ch3** a navy player inside the leaf points at the purple blot on "Name that feeling" (5.02) and takes the breath on 6.42 (chest scaleX 1 → 1.18 on the inhale, eases on the exhale). **ch4** a navy player checks its shoulder at .15 (head shifts back with an anticipation nod, `lookBack`), runs into open paper on "Move into space" (2.62, stride cycle + speed lines) and the ball is passed to its feet at 6.55–7.3. **ch5** the knot is gone: the stuck player is bent forward in the slot (`slump`, head down); on "ask a teammate" (1.22) the blue teammate walks in and its hand lands on the shoulder (`mixLimbs` stand → lean); on "where to put your attention" (6.5) the player straightens in one ease-out-back, its head turning to the ball, with a yellow spark — and the NEXT headline now pops at 6.5 on that straightening (`headline:{text:'Next',at:6.5}`). **ch6** the cups are gone: the upright navy player and the blue teammate stand on the ground under the branch and play three cushioned passes (kick poses, squash on receipt).
- **Ball**: `leafBall` is a leaf-yellow disc with a navy hexagon net (centre hexagon + six around it), navy rim and paper highlight — a football, still distinct from the paper-and-pentagon ball.
- **Streamlines (cross-story fix 9)**: `windBands` takes a `flow` obstacle; every band bends around the branch (bands above lift, bands below dip, strongest near it, windward side compressed), coverage raised to .35/.5/.7 (ch6 .3–.5), drift speed ×1.8 so bands never read as static.
- **Flat holds**: a `sway()` (two-tone 2°) added to every branch bend, ch2's bend starts at 3.16 (was 3.24) with a shorter anticipation, ch3's camera gets a slow lateral/rotational creep, ch4/ch5 twigs wiggle, the blot boils until named.
- **ch3 breathe**: camera zoom expands 1 → 1.16 over 6.42–8.0 (ease-out), the blot softens .95 → .6 and shrinks 22 %, the ring is drawn round it with progress (unchanged).
- **Touch**: a BLUE leaf (150 u) with a navy stem shaken loose, a paper gust puff (r 50 → 210) and paper streak lines — visible over the yellow leaf close-up and over purple.

**Kid test (sound off; frames `scratchpad/riso/fix/reset/frames`, app `…/fix/reset/app`):**
- ch1 "A player kicks a football to a friend with their arms up, but it sinks into a purple wind band and the friend droops." PASS
- ch2 BEND "A branch with leaves bends right over in the wind and springs back; a stiff post snaps." PASS
- ch3 BREATHE "Inside a big yellow leaf a person points at a purple blob, a circle is drawn round it, then they puff their chest out with a breath." PASS
- ch4 "A player looks over their shoulder, runs into the open space and the ball is passed to their feet." PASS
- ch5 NEXT "A bent-over player squeezed in a gap; a friend puts a hand on their shoulder; they stand up straight." PASS
- ch6 "Two players pass the football to each other under the bendy branch." PASS

**Gates.** typecheck: reset.ts clean (an unrelated error in `unfinished-map.ts` belongs to another agent's in-progress edit) · `review-riso-story --id reset`: 5 seams 0 px, 0 errors · `riso-perf`: median 4.2 ms, p95 17.3, ops median 74 · `check-riso-reset.mjs`: PASS ×4 viewports (screenshots `scratchpad/riso/fix/reset/app/*.jpg`).

**Remaining limitations.** The streamline bend is moderate (k 100–130 u) so the construction still shares "stacked bands" DNA with kite-turned at a glance; the ch4 opponent stays the purple blob in the upper band (nameable as "a purple blob hiding", not a person).

---

## Rework (2026-09-21) — one world: a young tree beside the pitch

**Why.** Art director's diagnosis of the 2026-09-20 build: the "branch" was a bare stick that the figure seemed to hold like a pole (nobody says "tree"); the ball was a hexagon-net disc; the purple wind bands swallowed every frame and the wind's force never bent anything visibly; "bends under pressure, then finds balance" and the reset word never became pictures; ch3's giant leaf and ch5's purple blob were unreadable. `spec`, `audio`, chapter text / audio / seconds / cues and `figure()` are kept; every scene and lead object is rebuilt.

**World (side view, world units, camera target ≈ (0, 0..40), core ±400 × ±300 so desktop 1440×850 — the tightest crop, ±396 × ±312 at zoom 1 — keeps every important form).** Wind blows left → right for the whole story.

| Element | Construction | Position |
|---|---|---|
| Sky | cream paper with a faint yellow screen (`field(Y,.1)`); two soft purple halftone bands high up (cov .18 / .12, torn edges, drifting 20 / 14 u/s) | bands at y −560 and −400 |
| Pitch | torn horizon at **y = +230**; ground = yellow .75 × blue .45 = green, a navy .1 mowing stripe, paper touchline (knockout ribbon) at y +276 and a paper box corner | y > 230 |
| Tree | navy root flare, navy trunk (spine bent about the root, hand-cut edge, paper highlight strip), two branch ribbons, a solid green under-crown (yellow blob × blue tone), 14 overlapping cut-paper leaves (yellow knocked out then printed, blue leaves overprinting to deep green), paper midribs. Wind `g` flattens the crown (sx 1+.35g, sy 1−.22g), shifts it right, turns every leaf toward +x and stretches it | trunk base on the ground (y 240), h 330–360, crown r 165–200 |
| Wind | purple **streaks**: 7 base ribbons drifting right (always visible), count ×(1+2.2g), length ×(0.6+1.6g), coverage +.3g, on a gust envelope onset → peak → recovery; during gusts paper knockout streaks flatten the grass | air box y ∈ [−560, +200]; grass box y ∈ [240, 420] |
| Player (you) | navy `figure()` pictogram, size 300–460 | feet on y 250 |
| Teammate | blue `figure()` printed on a paper knockout (clean blue on the green) | feet on y 250 |
| Ball | paper football, navy pentagons (`footballPanels`, shadow purple), navy ground shadow | r 46–64 |
| Feeling | purple knot: a boiling blob with spikes on a paper knockout (legible on the navy torso) | at the chest |

Headlines: none / **BEND** / **BREATHE** / **ONE ACTION** / **NEXT** (at 6.5) / none.

### Ch1 (9.417 s) — the pass goes wrong, the wind hits both
Player at (60, 250) size 300 facing −x; teammate at (−380, 250) facing +x, arms up; tree at (360, 240) h 330 crown 165; ball at the player's foot (20, 214) r 46.
- 0.08–0.3 wind-up (tilt), 0.3 kick; **0.3–1.05 the ball flies low past the teammate** (arc from (20,214) to (−560,236), lift 60) and rolls out of frame left (to −700 by 1.7). The teammate turns after it (`reach`, facing flips at 0.9) then slumps (1.5). **1.3–1.8 the player's shoulders drop** (slump mix, head drop).
- **2.0 gust** (onset 2.0, peak 2.6, recovery 3.8): streaks dense and long; **the player leans right** (tilt +.25g, a foot slides) and **the tree bends the same way** (bend .5g about the root, crown flattens, leaves streak); camera leans −.03g. Release: damped settle on the tree (freq 1.0, decay 1.5).
- **4.34 "a useful response"**: 4.4–4.9 the player straightens (easeOutBack) and 4.9–5.3 raises a pointing arm toward the teammate; the teammate stands and lifts an arm (5.0).
- **6.48 "room for your feelings"**: a purple knot grows on the player's chest (6.5–6.8, easeOutBack, r 40); 7.2–8.6 it lifts off and **floats with the wind up into the tree's crown** (arc, wobble, shrinking).
- Camera: (0,20,1) → dragged left by the ball (.5–1.4: −120,30,1.08) → to tree+player on the gust (2.8: 60,0,1.12,−.03) → (5: 20,−10,1.15) → 7.4–8.77 push up into the crown (360,−160,1.45). Zoom monotone.
- **Seam: into the tree's crown** (aperture disc r 80 at the crown centre, inside the green under-crown).

### Ch2 (10.617 s) — BEND: the whole tree bends and springs back; the post snaps
Tree centred: base (0, 240) h 360 crown 200. Rigid post: navy hand-cut slab w 34 from the ground at (330, 240) up to y −80, purple base tone. No player (the metaphor alone, per the board).
- 0–3.04 residual sway from ch1 (decaying), leaves flutter, base streaks.
- **3.04 gust** (onset 3.04, peak 3.55, recovery 4.6): anticipation 3.04–3.16 the tip lifts against the wind (−.05); **3.16–3.6 the tree bends .62 rad**, crown flattens and every leaf streaks right, two leaves tear off (3.5, 3.65) and fly right; **3.6 → 6 damped overshoot return** (`settle` amp .62, freq 1.0, decay 1.5, phase π/2). Camera leans (rot −.05) and pushes.
- **7.78 gust 2** (onset 7.78, peak 8.1, recovery 8.9), half strength: the tree bends .36 and returns; **the post loads (thickens, 7.95–8.15), cracks at 8.15** (paper zigzag knockout at y +40), **its top snaps and falls** (rotates about the crack to 1.35 rad, lands on the pitch at ~8.7 with a bounce and a dust puff); the purple base tone spreads. Camera kick at the crack; pan right to frame post + tree.
- 9.2–9.6 the crown's front-right leaf turns to the camera and grows (len 200 → 300, wid 80 → 120), bright yellow; 9.2–9.97 push to it (zoom 1.15 → 1.55).
- **Seam: into that leaf** (aperture disc r 62 at the leaf centre).

### Ch3 (10.417 s) — BREATHE: name the feeling, breathe
Player big and centred: size 460 at (0, 250) facing +x, hunched (tilt .1, head down); the knot on the chest at KNOT = (14, 12) on a paper knockout; the tree's trunk and half crown at the right edge (430, 240); pitch; light streaks.
- **0 / 1.1 / 2.2 three feelings**: the chest heaves (scaleX 1 + .08·|sin(t·2π/.9)|), the knot grows in three pops (r 44 → 60 → 76, easeOutBack) and shoots three purple spikes (up-left 110, down-right 90, right 130) that shake on twos; the knot boils (reseeded on twos).
- **5.02 "Name that feeling"**: 5.2–5.7 **a paper ring draws itself around the knot** as two halves that meet with an overshoot (r 120, paper 16 wide + navy hairline); boiling stops; the spikes round into lobes; the chest heave stops.
- **6.42 "Take a slow breath"**: inhale 6.42–8.0 — **the whole composition expands**: camera zoom 1.0 → 1.14 (easeOut), chest scaleX → 1.22, the hunch lifts (tilt → −.04, head up), arms rise a little, the ring expands with the chest (r 120 → 134), streaks slow to a calm (g → 0, cov .35 → .12); exhale 8.0–9.77 — chest → 1.08 slowly, a paper puff of breath drifts forward from the head (r 30 → 70, fading), the knot shrinks ×.7 and its coverage opens .85 → .5.
- 9.1–9.77 push into the ring (zoom 1.14 → 1.7 at KNOT).
- **Seam: through the breath ring** (aperture disc r 60 at KNOT, inside the ring).

### Ch4 (9.717 s) — ONE ACTION: shoulder, space, option, pass
Wide pitch (zoom .95): player at (−260, 250) size 300 facing +x; teammate at (400, 250) facing −x with the ball at (370, 214) r 64; a **pool of open yellow space** on the grass at (40, 250) rx 190 ry 60 (paper knockout + yellow .6); the tree's crown edge at (−520, 240) for continuity.
- **0.15–0.7 "Check your shoulder"**: the head turns back (`lookBack`, head −.12) and a **yellow sight wedge** opens behind the player (angle π ± .16, L 300); the camera turns with the look (rot −.04, pan left); 1.3–1.7 head returns.
- **2.62 "Move into space"**: 2.3 the pool appears (easeOutBack); **2.8–3.5 the player runs into it** (stride on twos, speed lines, landing settle); the pool brightens (yellow .6 → .75).
- 4.3–4.7 **offer**: a pointing arm extends toward the teammate (anticipation, then easeOut); 4.6–5.2 a navy dashed lane self-draws ball → the player's feet.
- **6.36 "one action"**: the teammate loads (6.36–6.55, tilt −.1) and kicks; **6.55–7.3 the pass** flies along the lane (lift 40, spin) to (80, 214); the player cushions (scaleX 1.06, .2 s) and a paper-and-yellow spark bursts; dashes vanish behind the ball. 8.2 a quarter-turn settle presents the centre pentagon.
- Camera: (−40,40,.95) → look (−120,0,.98,−.04) → (−40,40,1) → follow the run (60,30,1.05) → follow the pass (80,60,1.15) → 8.2–9.07 push into the ball (80,214,2.6).
- **Seam: into the ball's centre pentagon** (aperture = pentagon r 17 at the ball centre, at the ball's rest rotation).

### Ch5 (9.417 s) — NEXT: stuck, a hand on the shoulder, the reset
Player at (0, 250) size 380 facing +x, **frozen mid-step** (walk legs, arms half raised, tilt .12, head down), the knot back on the chest (r 46, boiling slowly) — nothing moves but the camera creep and the light streaks (stuck has weight). Tree at (−420, 240) h 300 crown 140 at the left. Pitch.
- **1.22 "ask a teammate"**: **the teammate walks in from the right** (620 → 190 over 1.3–2.3, walk stride, facing −x, stops with a settle); **2.3–2.7 its arm lifts and a blue paper mitt (r 36) lands on the player's shoulder** at (10, 34); the player's shoulder gives a small lift (settle).
- 2.7–6.5 the two stand joined; the knot's boil slows; residual sway on the tree; the camera drifts.
- **6.5 "where to put your attention"** (NEXT pops): **6.5–7.0 the player straightens** (easeOutBack: tilt → −.02, head up, legs and arms to stand); **6.55 the knot pops into five leaves** that blow away right with the wind (spiral, rising, fading by 8.6); a yellow spark at 6.6.
- Camera: (0,20,1.1) creep → (80,20,1.15) with the teammate → (60,0,1.18) on NEXT → 8.1–8.77 push into the mitt (10,34,2.0).
- **Seam: into the teammate's hand** (aperture disc r 27 inside the blue mitt).

### Ch6 (10.415 s) — back in the game, one moment at a time
Tree at (−400, 240) h 340 crown 180 with **three new bright leaves unfurling** (0.4 / 0.9 / 1.4, easeOutBack); player A at (−60, 250) size 300 facing +x; teammate B at (330, 250) facing −x; ball r 46; wind = gentle sway (g .12).
- 0.8–1.6 A → B pass (A kicks, B cushions, spark); 2.2–2.9 B → A.
- **3.34 "Notice"**: A's head turns back with a small sight wedge (3.34–3.9), returns 4.2. **4.4 "Breathe"**: A's chest expands (scaleX 1 → 1.18, 4.4–5.3) and the frame widens (zoom 1.18 → 1.12); streaks fade. **5.5 "Choose"**: A's pointing arm (5.5–5.8) then **5.7–6.4 A → B**.
- **7.6 "one moment at a time"**: 7.7–8.4 B → A, 8.8–9.5 A → B, each cushioned with a spark.
- 8.8–9.8 the camera opens to the **wide calm frame** (−20,−10,.95): tree upright with new leaves, player and teammate side by side, wind gone to a sway. Zoom monotone decreasing 1.2 → .95 (the "breathe" widening is part of the same descent).
- Last chapter: no seam.

**Kid test targets (sound off).** ch1 "A player kicks the ball past their friend, then a big wind blows the player and the tree over sideways; they stand back up and a purple puff floats into the tree." ch2 BEND "A tree bends right over in the wind and springs back; a stiff post beside it snaps and falls." ch3 BREATHE "A person with a purple knot on their chest draws a ring round it and takes a big breath." ch4 ONE ACTION "A player looks over their shoulder, runs into the yellow space and gets the ball passed to them." ch5 NEXT "A player stuck with a purple knot; a friend walks up and puts a hand on their shoulder; they stand up straight and the knot blows away as leaves." ch6 "The tree has new leaves and the two players pass the ball to each other."

Reduced-motion stills: 2.7 / 3.6 / 5.8 / 7.4 / 7.3 / 9.9 s.

### Rework ledger (2026-09-21, `lib/paths/riso/stories/reset.ts`)

**Built as boarded** with these adjustments after the first contact sheet: a viewport fit `view(s) = clamp((safe.w/fit)/800, 1, 1.32)` multiplies every camera zoom (the desktop art region shows 793 × 625 world units at zoom 1, phones up to 1080 × 1055 — without it every object read small on a phone); trees shrunk to h 290/320/300 (crown 145/175/160) in ch1/ch2/ch6 so the crown tops clear the headline band on 1440 × 850; ch1's tree moved to x 300 and the teammate to −340 so the tree stays in frame while the camera is dragged after the miss; the wind streaks widened (15 u, len 320, cov .5 → .85 in a gust) so the wind is a visible force; the wind lean is signed by facing so the player and the teammate lean downwind like the tree; ch3's player is size 500 with the knot at (14, 8) and the ring r 106 so the ring clears the head.

**Kid test (sound off; frames `scratchpad/riso/fix/reset2/frames*/`, app captures `scratchpad/riso/fix/reset2/app-reset-<w>x<h>-ch<n>.jpg`, strips `phone-strip.jpg`, `strip-320.jpg`, `strip-844.jpg`, `strip-1440.jpg`):**
- ch1 — "A player kicks the ball and it rolls past their friend off the pitch; a big purple wind blows and the player and the tree both lean over; the player stands up and points; a purple puff floats from their chest into the tree." PASS
- ch2 BEND — "A tree bends right over in the wind and springs back; two leaves fly off; the stiff post next to it cracks and its top falls over." PASS
- ch3 BREATHE — "A big person with a purple knot on their chest; a ring is drawn round the knot; then they puff their chest up and breathe out." PASS
- ch4 ONE ACTION — "A player looks over their shoulder, runs into the yellow patch, points, and their friend kicks the ball to them." PASS
- ch5 NEXT — "A player is stuck with a purple knot; a friend walks up and puts a hand on their shoulder; the player stands up straight and the knot turns into leaves that blow away." PASS
- ch6 — "The tree has new leaves; the two players pass the ball to each other; the player looks back and takes a breath; at the end the tree and the players stand calmly." PASS

**Gates.** `npm run typecheck` clean · `review-riso-story.mjs --id reset --out …/riso/review3`: 45 samples, 5/5 seams max 0 / changed 0, held-seam 0 %, 0 transparent, 0 errors, maxOps 172 (passage frame; scenes 51–100) · `riso-perf.mjs reset` at 390×850 DPR 1.5: **median 3.2 ms**, p95 16.4 ms, max 25.8 ms, ops median 86 · `check-riso-films-browser.mjs --format 11v11 --title "Mental Toughness"`: PASS at 390×850 (touch 14.3 %), 320×568 (6.4 %), 844×390 (8.6 %), 1440×850 (12.3 %); zero page errors.

**Seams (all forward passages):** the tree's crown (ch1 → ch2) · the crown's front leaf (ch2 → ch3) · the breath ring (ch3 → ch4) · the ball's centre pentagon (ch4 → ch5) · the teammate's mitt (ch5 → ch6).

**Self-critique.** The wind now acts on things (the tree bends about its root with damped overshoot, the player leans and slides, the grass gets paper streaks) and every chapter is one nameable picture, but the streaks are still a graphic (ribbons) rather than a torn ink field, so the print texture is carried mostly by the sky bands, the green ground and the cut-paper crown. Landscape 844×390 shows everything smaller (the fit caps at 1.32 while the region shows 1180 units) and the crown of the ch3 tree is cut at the right edge by design. The ch4 passage into a 15.5-unit pentagon zooms hard in .65 s; it reads as a rush into the ball but is the most abrupt seam of the six.
