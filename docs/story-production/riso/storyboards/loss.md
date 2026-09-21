# Storyboard — `loss` · After the Final Whistle (legacy 11v11)

Riso rebuild, written September 20, 2026 against `RISO_BIBLE.md` §1, §1b, §2, §3, §4, §4b, §4c, §4d, §8. Script, voice files and captions are unchanged (`lib/paths/films/legacy.ts`). Cue `at` seconds are copied verbatim from `phraseFilmScores.ts["loss"]`; chapter durations from `narrationTiming.json["loss"]` (10.517, 9.217, 10.617, 9.317, 11.217, 9.115 s). Rows marked **(result)** are visible consequences of the preceding cue, timed as an offset from that cue's `at`; they are not new audio cues.

## Conventions

- World units: short side = 1080, chapter centre = (0,0), x right, y **down**. **Core square** = x ∈ [−450, 450], y ∈ [−450, 450]: every important form lives here at every viewport. Water fields and rings bleed to ±1400.
- Camera key = `(cx, cy, zoom, rot°)` from → to, easeIO unless stated. Drawings on twos; camera, ring travel and passages every frame. Rings are **born on drawn frames** (every N drawn frames) and travel continuously (their radius samples every frame, their wobble is seeded per ring).
- Every cue cell is written as **anticipation → action → overshoot/settle → consequence** (§4b). Heavy things (numerals, stones, the scoreboard bar) accelerate slowly and stop with a bounce; light things (confetti, droplets) flutter.
- Seam = last 0.65 s of the chapter, `forwardPassage` through the named material. No reverse zoom anywhere.
- Between cues nothing drifts idly: rings already born keep travelling and decaying; the water's speckle grain slowly slides (≤ 6 units/s); the camera creeps ≤ 8 units/s.
- **The whole story is seen from above** (top-down pond). Depth is coverage: things under the water print at lower coverage and slightly refracted (6 px offset by the nearest ring).

## Headlines (§4c) and labels

HTML overlay, `IslandLoadingBrush`, one line, at most two words, only where a word carries the beat. Story file: `label` = headline (empty when none), `transcriptLabel` = the shipped sentence label.

| Ch | Headline | transcriptLabel |
|---|---|---|
| 1 | *(none)* | WHEN THE WHISTLE GOES |
| 2 | *(none)* | LET THE RIPPLES SETTLE |
| 3 | **ONE RESULT** (arrives at 2.52, leaves at 6.6) | A RESULT, NOT YOUR WORTH |
| 4 | *(none)* | LOOK WITH CURIOSITY |
| 5 | **ONE DETAIL** (arrives at 9.04 "Keep it small", stays to the seam) | CHOOSE ONE DETAIL |
| 6 | *(none)* | ROOM FOR ANOTHER DAY |

Nothing is lettered inside the artwork, with one user-mandated exception: **the scoreboard numerals** (lead imagery, §1b). They are drawn as two chunky riso **path shapes** — the glyphs "1" and "2" (a 1–2 loss) traced as torn-edge orange silhouettes with a navy misregistered echo, never font text, never a sentence. If the critics rule that numerals count as lettering, the fallback is two orange tally blocks (one bar beside two bars) of the same size and behaviour; every action below works with either.

## Lead imagery (story-owned; not used by any other 11v11 story)

1. **A referee's whistle** — orange, huge and cropped; its blast is the first force in the film; it lies at rest on the shore at the end.
2. **A scoreboard as two printed numerals** — the result; heavy; they fall into the pond, sink, lie on the bed, and are left behind.
3. **Settling ripples seen from above** — the background itself: concentric torn-edge rings born at an impact point, travelling outward, jagged when angry, sagging when disappointed, smoothing, slowing, settling to a still surface that reflects the sky.
4. **Two questions as two stones** — dropped one after the other into a night pond; their ring systems interfere and the intersections join into a thread.
5. **One small detail as a single pebble** — lifted from many pebbles on the shore, kept solid while everything else fades, then **skipped forward** across the still pond.

Football objects appear only where the narration names a football action, always in water/stone material: the ball is a **stone-ball** (a round river stone with five navy seam lines and a paper highlight) in ch5 only — "check your shoulder before receiving, or recover into space after losing possession". The opponent in ch5 is an **orange wake ring** approaching across the water. "Check your shoulder" is the pebble's highlight crescent turning to face the wake while the camera pans as the look. **Generic eye / ear / hand / bubble: none used.** "Flatten them" (ch2) is the scoreboard's own orange bar slapping the water; "talk with a teammate" (ch4) is a second stone and the thread that joins the two ring systems.

Lead imagery not used by any other 11v11 story: quiet-lantern owns lantern / cone / dark room; boat-weather owns sail / weather fronts; more-shirt owns shirt / fabric weave; regulate owns arches / channel / ribbons / star / scribble disc; reset owns branch / wind bands / leaves / knot. Nothing here overlaps. Versus the 7v7 `signal-water` (ripple bands travelling shore to shore as a signal): loss is a **top-down pond after an impact**, rings closed and concentric from a point, settling rather than carrying a message.

## Background world (unique to this story)

**A top-down pond after impact, settling.** Construction, per §1b vocabulary:

- **Grainy ink field**: blue water (`field('blue', cov .45–.6, mottle .4)`) filling the frame, with visible speckle grain in the ink and a slow dot-size ramp (deeper = larger dots toward the bottom of the frame).
- **Stepped tonal bands as concentric rings**: each ripple is its own torn-edge ring band (hand-cut inner and outer edges, `torn(seed)`), stepped coverage alternating .3 / .5 / .7, **full closed circles** born at an impact point and **expanding over time** (this is the difference from `regulate`'s static nested U-arches: ours are complete rings, off-centre, moving, decaying). Ring styles by feeling: **sagging** (lower half squashed, slow), **jagged** (wobble amp 18, dark orange × blue overprint), **smooth** (wobble 3), **dashed** (ch4, the second question), and finally **static faint bands** (settled).
- **Huge disc / outline motif**: the **sky-reflection disc** — a paper knockout ellipse on the still surface (700 × 420 in ch1, r 320 in ch3, r 300 in ch6) — and the cropped **whistle** barrel (r 170) in ch1.
- **Torn-edge shore**: a yellow grainy mud band with a hand-torn edge against the water (top edge in ch1, left edge in ch3, the whole left 60 % in ch5, the far rim in ch6); where blue and yellow meet, the overprint prints a **green wet strip** (blue × yellow).
- **Confetti accents**: whistle-blast fragments (cream, navy), the eleven team fragments (cream, ch3), pebbles (navy / blue small torn blobs, ch5), and spray droplets on every impact.
- **Night variant** (ch4): heavy navy field (cov .8, halftone letting paper through) with yellow rings only — the duotone beat.

Not used (reserved for `regulate`): nested arches, the torn navy channel, edge-to-edge diagonal ribbons.

**How this background differs from the other 11v11 stories:** quiet-lantern is a dark room pierced by one lantern's stepped light cone (radial light, static); boat-weather is weather fronts and sail cloth (curved fronts, diagonal rain, cloth); more-shirt is a fabric weave with a growing outline (lattice); regulate is arches / channel / ribbons; reset is horizontal purple wind bands with a diagonal branch. Loss is the only 11v11 story whose background is **water seen from above with concentric rings born at an impact and settling**, torn shores, and a sky-reflection disc that only appears when the water is still.

## Inks and role colours

Family 11v11. Triple: **blue `#0078bf`, orange `#ff6c2f`, yellow `#ffe800`** + navy `#22366b` key. Paper `#f0ece2`. Print order: yellow → orange → blue → navy. Registration 1.8 px, re-seeded per chapter (seam tick §4d.3).

| Role | Ink | Notes |
|---|---|---|
| Water (the metaphor) | **blue** field and ring bands; paper knockout for the sky reflection | still water = paper shows through as the reflection disc |
| Result / pressure / opponent | **orange** | whistle, numerals, scoreboard bar, the opponent wake ring (ch5); orange × blue = dark brown (angry rings, things sinking) |
| Support / teammate / the useful thing | **yellow** | the two question stones and their rings, the thread, pebble P, the shore |
| Stone-ball (the ball, ch5 only) | paper-white river stone, navy seam lines, paper highlight | has mass: accelerates over 0.2 s, stops with a bounce |
| Bed, contours, pebbles, stud track | **navy** | the pond bed is navy mottle seen through blue |

Duotone beat (once): **ch4 is navy + yellow only** (night pond; no orange = no blame; no blue because the water is the night itself).

## Dominant material metaphor and how it develops

**Water after an impact, settling.** Ch1: the whistle blasts, the numerals fall in, rings burst outward; the rings sag (disappointment) and turn jagged (anger), then smooth. Ch2: the rings fill the frame; a flat orange bar slaps the water to flatten them and only makes more; when it sinks away and nothing presses, the rings slow, shrink in amplitude and settle; the sky reflection reassembles. Ch3: through the still surface, the numerals lie small on the bed while the team fragments, the stud track and the sky disc surround them, larger. Ch4: at night, two stones drop as two questions; their ring systems interfere and the intersections join into a thread. Ch5: the shore at close scale: one pebble lifted from the many; the stone-ball received with a shoulder check and a first touch away from the orange wake; a recovery run; everything but the pebble fades. Ch6: the wide dusk pond, still; the pebble is skipped forward in three small rings; the numerals lift once and sink out of the picture; the whistle rests on the shore. Impact → rings → settle → still → forward.

## One world

One pond beside a pitch, always seen from above. Ch1 is the pond with the near shore at the top and the whistle over it. Ch2 is the same water at the impact point, rings only. Ch3 is the same spot with the water still, looking down to the bed. Ch4 is the same pond at night. Ch5 is its shore at close scale (the shallows where the numerals fell are at the right edge, tiny). Ch6 is the whole pond at dusk from higher up — ch1's place revisited at another scale and another hour, the whistle now at rest on the same shore.

---

## Chapter 1 — WHEN THE WHISTLE GOES (10.517 s) · headline: none

Narration: "What happens inside you after a loss? Disappointment or anger may follow. Caring about the result makes those feelings understandable."

**Background construction:** blue grainy water field (cov .5, mottle .4, speckle) filling the frame; **torn-edge shore** = yellow grainy mud band along the top (y < −330, torn lower edge) with the green wet strip at the waterline; a **paper sky-reflection ellipse** (knockout tone cov .3, 700 × 420) centred (+40, +60) on the still surface; no rings yet. At the impact the **concentric ring bands** begin (born every 4 drawn frames at the impact point, travelling ~260 units/s, stepped cov .25 / .4 / .55, torn edges).

Composition at 0 s: **Whistle**: orange, huge, cropped — barrel r 170 centred (−300, −180), mouthpiece running up-left out of frame, navy contour thick on the shadow side, the pea a paper knockout disc r 40 inside. **Numerals** "1" and "2": orange path glyphs 240 tall with a navy 2 px echo, standing on the shore at (+120, −250) and (+330, −250). No confetti yet.

| Cue time + words | Composition (what fills the frame) | Cue action: physical enactment (anticipation → action → settle → consequence) | Camera key | Phone note |
|---|---|---|---|---|
| **0.00** "What happens inside" (score 0) | Whistle upper-left, numerals on the shore upper-right, still water below | **Whistle** — *anticipation* 0–0.2: the barrel **inflates** 6 % and the pea lifts. *Action* 0.2–0.5: the **blast**: three navy sound rings burst from the mouth (r 40 → 320, born every 3 drawn frames, easeOut), eight cream / navy **confetti fragments** burst outward (0.4 s) and flutter down onto the water; the barrel recoils 12 units and settles (two overshoots). *Consequence* ~0.9 (**lose / drop**): the sound rings reach the numerals; they **rock** (0.2 s counter-tilt), then **tip and fall** off the shore with gravity (easeIn, rotating 30°, 0.6 s) — **impact** at 1.5 at (+200, +80): a paper `sparkBurst` splash, six droplets arc up and fall, and the **first ring** is born; rings continue every 4 drawn frames. The reflection ellipse **breaks** into ring segments as each ring crosses it. | (0,0,1.0,0) holds for the blast with a 5-unit recoil kick at 0.3; then **drops with the numerals**: (0,0,1.0,0) → (+160,+40,1.1,0) over 0.9–1.6 (easeIn, lands a beat after the impact with a 6-unit bounce) | Whistle barrel and both numerals inside the core square; impact (+200,+80) inside |
| **1.50 (result)** | Numerals under the water, rings spreading | The numerals **sink**: cov .9 → .5 and scale ×0.85 over 1.4 s (heavy, slow), refracted 6 px by each passing ring; the confetti fragments ride the rings outward. | hold with a 4-unit residual sway | — |
| **2.92** "Disappointment or anger" (noise 0) | Rings filling the lower frame | **Disappointment** 2.92–4.3: rings born now **sag** — *anticipation* each ring is born round, then its lower half **slumps** 20 % (easeOut) as it travels; ring speed ×0.6, coverage low (.25); the fragments on them slow. **Anger** ~4.3 (result +1.4): rings born now are **jagged** — *anticipation* the impact point contracts (a navy dot r 20 → 8, 0.15 s) → *action* a violent spike ring (wobble amp 18, zigzag) shoots out (easeOut, overshoot 10 % and snap back) in dark orange × blue overprint (cov .7), speed ×1.4; the ring **shakes in place** on twos for 3 drawn frames after birth; six ink **splatters** (orange, 4–10 units) burst outward and stick on the water. | pan down into the sag (+160,+40,1.1,0) → (+60,+80,1.1,−3) over 2.92–4.3 (long ease-out); at the anger a sharp counter-rotate to +3 over 4.3–4.8 with a 6-unit kick | — |
| **5.50 (result)** | Rings reach the shore | The whistle **recedes**: cov .9 → .6 (its part is done; the barrel settles 4 units lower). The jagged rings hit the torn shore and **break** into three fragments each (confetti), which settle on the mud. | hold, creep 4 units/s toward the impact | — |
| **7.96** "understandable" (noise 1) | Mixed rings; numerals dim on the bed | Rings born now are **smooth** regular circles (wobble 3), evenly spaced, still moving: *anticipation* the impact point breathes once (r 8 → 14 → 10); *action* the new ring leaves round and stays round (easeOut travel). The older dark rings **fade to plain blue** as they expand (overprint → blue over 1.2 s). *Consequence*: the numerals on the bed gain a **navy halftone shadow** (weight): the cause of the rings is visible. Splatters wash out (cov .9 → .3). | push toward the impact centre: (+60,+80,1.1,+3) → (+200,+80,1.3,0) over 7.96–9.0 | Impact centre inside core |
| **9.00 (result)** | Impact centre | A bright **paper knockout dot** (the last bubble, r 26) rises at (+200, +80) with a 0.2 s pop and holds; the newest ring leaves it. | push (+200,+80,1.3) → (+200,+80,1.7,0) over 9.0–9.87 | — |
| **9.87–10.517 seam** | Water grain at the impact centre fills the frame | **Passage through the blue water at the impact centre (grainy ink field)**, aperture = the last bubble's paper dot grown to a torn ellipse → reveals ch2: full-frame concentric rings, the numerals below. | forwardPassage | — |

Seam: Passage through **the blue water at the impact centre** → reveals **full-frame concentric torn-edge ring bands from an off-centre point, no shore, the numerals as an orange halftone beneath** (a radial field, not a shore-and-whistle scene).

Football truth: the final whistle ends the match; the feelings after a loss follow *from caring about the result* — the rings exist because something heavy fell in. No football action in this chapter; the whistle is the referee's, not a symbol.

Actions: 6 (blast + fall + impact, sink, sag, anger spike, whistle recedes + shore break, smooth rings + shadow, bubble). Camera: recoil kick, drop-with, pan + counter-rotate, push, push, passage = 6.

---

## Chapter 2 — LET THE RIPPLES SETTLE (9.217 s) · headline: none

Narration: "Think of ripples across water. You do not have to flatten them immediately. Give yourself space before deciding what the match means."

**Background construction:** full-frame **concentric stepped ring bands** from centre (−80, +40): six torn-edge bands alive at any time, born every 4 drawn frames, travelling 260 units/s, alternating cov .3 / .5 / .7 (blue) with speckle grain; wobble 12 (still unsettled); no shore; four cream confetti fragments riding the rings; at the centre a paper knockout dot r 20 (the last bubble). The **numerals** below the surface as orange halftone (cov .35) at (−80, +40), scale 0.6, sinking 2 units per drawn frame.

| Cue time + words | Composition | Cue action: physical enactment | Camera key | Phone note |
|---|---|---|---|---|
| **0.00** "Think of ripples" (ripple 0) | Rings filling the frame from an off-centre point | Rings as described; each new ring is born with a 0.15 s contraction of the centre dot and an easeOut departure; the fragments bob (lift 6) as each ring passes under them; the numerals sink, refracted. | (−80,+40,1.0,0) hold, creeping 3 units/s | Ring centre inside core |
| **2.92** "flatten them immediately" (ripple 1) | Rings; the top edge of the frame | **Press** — *anticipation* 2.92–3.05: a shadow (navy halftone 520 × 90) appears on the water at (+120, −40). *Action* 3.05–3.4: the **orange scoreboard bar** (520 × 90, torn edges, the frame the numerals stood in) **drops flat onto the water** (easeIn, heavy) with a **slap**: the water under it **deforms** (the rings beneath flatten to lines for 2 drawn frames), then *rebounds*: a burst of five new small **jagged rings** (wobble 16, born every 2 drawn frames) shoot out from under the bar, eight droplets spray up and fall, the confetti fragments are thrown outward. *Consequence*: flattening makes **more** ripples; the main rings are shoved 10 units off-centre where the slap rings cross them. | pan toward the slap a beat late: (−80,+40,1.0,0) → (+40,0,1.0,−3) over 3.0–3.5 (the slap tilts the view), 8-unit kick at 3.4 | Bar centred (+120,−40): inside core |
| **3.90 (result)** | Bar on the water | The bar **tilts** (rot 0 → 12°, easeIn) and starts to **sink** (cov .9 → .5 over 1.0 s); its slap rings cross the main rings — where they cross, paper knockout dots pop for 2 drawn frames (interference). | hold with residual −3 → 0 rotation settling over 1 s | — |
| **4.90** "Give yourself space" (ripple 2) | Bar sinking; two ring systems | **Space / loosen — the composition expands and slows**: the bar **sinks out** (cov → .1 by 6.0, drops beneath the ring stack, one last bubble); ring birth interval 4 → 10 drawn frames, speed 260 → 160, wobble 12 → 3, all on a long ease-out over 3 s; the coverage steps flatten (.3 / .5 / .7 → .35 / .45 / .55) so the bands loosen into each other; the confetti fragments stop bobbing and drift apart. *Consequence*: the numerals reach the bed at ~6.5 with a soft navy puff and a 2-unit bounce. By 8.0 the water is nearly still: the bands are static and the **sky reflection** (paper, cov .3) **reassembles** into an unbroken ellipse. | slow push following the sinking numerals: (+40,0,1.0,−3) → (−40,+60,1.15,0) over 4.9–8.0 (long ease-out; the camera breathes out with the water) | — |
| **8.00 (result)** | Still water, clear reflection | The paper reflection ellipse sharpens (cov .3 → .45, wobble 8 → 2): still water shows a clear picture. One last slow ring passes out of the frame. | push (−40,+60,1.15) → (−80,+40,1.45,0) over 8.0–8.57 | — |
| **8.57–9.217 seam** | The paper reflection fills the frame | **Passage through the still surface (the paper sky-reflection ellipse)** → reveals ch3: looking down through the water to the bed. | forwardPassage | — |

Seam: Passage through **the paper sky reflection on the still surface** → reveals **the pond bed through still water: navy mottle, faint static bands, the numerals small at the bed, a torn yellow shore at the left edge** (a looking-down composition, not an expanding ring field).

Football truth: after a loss, forcing calm makes more noise; leaving the water alone lets it settle. Metaphor chapter: no football action, by design.

Actions: 5 (ring births, slap + rebound, bar tilts and sinks, expansion / settling, reflection reassembles). Camera: creep, pan + kick, settle-rotate, breathe-out push, push, passage = 6.

---

## Chapter 3 — A RESULT, NOT YOUR WORTH (10.617 s) · headline: ONE RESULT (2.52 → 6.6)

Narration: "The score describes one result. It cannot describe your team, your effort, or your value. You still deserve respect after a difficult game."

**Background construction:** looking down through still water: **settled bands** — five faint static concentric bands (cov .2 / .28 / .36 / .28 / .2, torn edges) around (−80, +40); the **pond bed** showing through as navy mottle (cov .3, speckle); **torn-edge shore** = yellow grainy band along the left edge (x < −380, torn right edge) with the green wet strip. Grain everywhere.

Composition at 0 s: the **numerals** "1" "2" lying on the bed at (−80, +40), small (120 tall), orange cov .5 (seen through water), refracted 6 px by the nearest band. Nothing else yet.

| Cue time + words | Composition | Cue action: physical enactment | Camera key | Phone note |
|---|---|---|---|---|
| **0.00** "The score" (score 0) | Numerals small on the bed | *Anticipation* 0–0.15: the numerals settle 2 units deeper. *Action* 0.15–0.5: they **sharpen** (cov .5 → .8, easeOut) and a navy contour ring draws around both (0.3 s) — one thing, seen clearly. *Settle*: by 1.5 they relax back to cov .5. | (−60,+120,1.05,0) → pan to (−60,+60,1.05,0) over 0–1.2 | Numerals inside core |
| **2.52** "cannot describe your team, your effort, or your value" (score 1) | Numerals ringed | Three things arrive, each larger than the numerals: **team** 2.52 — *anticipation* the water's grain shivers once; *action* **eleven cream confetti fragments** drift in from the frame edges (easeOut 1.0 s, each with a small flutter) and **join** into a loose ring r 260 around the numerals; **effort** ~3.8 (result +1.3) — a **boot-stud track** (navy dashed double line, width 6, twelve stud marks) **presses** into the yellow shore mud from the top-left (−520, −400) down to the water's edge (−380, −60) (each stud a 2-frame stamp with a mud spray of 3 specks, 0.8 s total); **value** ~5.0 (result +2.5) — the **paper sky-reflection disc** (r 320, knockout tone cov .4) **settles onto the still surface** centred (+20, +20) (scale 1.08 → 1.0, easeOut 0.6 s), holding the confetti ring and dwarfing the numerals. *Consequence*: the numerals do not grow; the camera does not enlarge them. | slow pan up-left (−60,+60,1.05,0) → (−120,−40,1.05,0) over 2.52–5.0 (revealing the shore track by the pan); rot +4 → 0 over 5.0–5.6 as the disc settles | Confetti ring r 260 and the disc r 320: on the core boundary; the numerals (important) at the centre |
| **6.94** "deserve respect" (core 2) | Disc, confetti ring, track, numerals | *Anticipation* 6.94–7.1: the confetti ring loosens 10. *Action* 7.1–7.8: the ring **tightens into an even circle** (r 260 → 220, easeOut, each fragment turns to face the centre with a small counter-turn); the shore **brightens** (cov .4 → .7); the numerals' coverage **drops** (.5 → .3) — they recede under the picture. *Settle*: the ring overshoots to r 212 and relaxes to 220. | push (−120,−40,1.05) → (0,0,1.2,0) over 6.94–8.0 | — |
| **8.60 (result)** | — | The reflection disc **brightens** (cov .4 → .55) and its paper edge steadies (wobble 6 → 2): the seam material is presented. | push (0,0,1.2) → (+20,+20,1.6,0) over 8.6–9.97 | — |
| **9.97–10.617 seam** | Paper disc fills the frame | **Passage through the paper sky-reflection disc** → reveals ch4: the pond at night (navy + yellow), two stones held above the water. | forwardPassage | — |

Seam: Passage through **the paper sky-reflection disc** → reveals **a night pond: heavy navy halftone field, a yellow torn shore arc at the top-left, two yellow stones above the water** (a dark duotone composition, not a daylight bed).

Football truth: the score is a record of one result; the team (eleven), the effort (the run marks in the mud) and the person are larger than it. No football action; the stud track is the only pitch mark.

Actions: 6 (sharpen, team joins, effort track, value disc, ring tightens + shore brightens, disc brightens). Camera: pan, pan-reveal, rotate-settle, push, push, passage = 6.

---

## Chapter 4 — LOOK WITH CURIOSITY (9.317 s) · duotone navy + yellow · headline: none

Narration: "When you feel ready, ask two questions. What helped us? What could we try differently? Talk with a teammate or coach, without blame."

**Background construction:** night: **heavy navy field** (cov .8, halftone letting paper through, mottle .5, speckle) = the pond at dusk from above; a **yellow torn shore arc** at the top-left corner (cov .5); the water still (no rings at 0 s). No orange anywhere in this chapter.

Composition at 0 s: **stone S1** (yellow torn blob r 70, navy contour) held above the water at (−260, −300); **stone S2** (r 60) at (+300, −320). Both cast a faint navy halftone shadow on the water below them.

| Cue time + words | Composition | Cue action: physical enactment | Camera key | Phone note |
|---|---|---|---|---|
| **0.00** "When you feel ready" (map 0) | Still night water, two stones held above | Readiness = the water **breathes once**: a paper lens (yellow halftone sheen, cov .12, 900 × 300) passes slowly across the field (easeInOut 1.2 s); the two stones **rock** once in place (counter-tilt then settle). Nothing else moves; the camera creeps so the stillness has weight. | (0,0,1.0,0) → slow push (0,+20,1.08,0) over 0–2.0 | Both stones inside core |
| **2.88** "What helped us" (map 1) | Stones above; still water | **Stone S1 drops** — *anticipation* 2.88–3.0: S1 lifts 10. *Action* 3.0–3.4: falls with gravity (easeIn) to the water at (−160, −20): a paper knockout **splash burst** and four droplets; the stone sinks (cov → .3 over 0.5 s). *Consequence*: **solid yellow rings** are born every 4 drawn frames (stepped cov .35 / .5, 260 units/s, wobble 4). | drops with the stone: (0,+20,1.08,0) → (−100,0,1.08,0) over 3.0–3.5 (easeIn, 5-unit bounce at the splash) | Splash (−160,−20) inside core |
| **4.90 (derived +2.0, "What could we try differently?")** | S1's rings spreading | **Stone S2 drops** the same way at (+200, +120): splash, droplets, sink; its rings are **dashed** (dash 40 / gap 24), born every 4 drawn frames. | pan to the second splash: (−100,0,1.08,0) → (+40,+40,1.08,0) over 5.0–5.6, 5-unit bounce | Splash (+200,+120) inside core |
| **5.60 (result)** | Two ring systems | The systems **interfere**: where a solid ring crosses a dashed ring a paper knockout dot (r 10) **pops** for 2 drawn frames and leaves a faint yellow dot; a lattice of dots builds between the two stones (about twenty by 6.9). | hold, creep 4 units/s | — |
| **6.98** "without blame" (listen 2) | Lattice of dots between the stones | **Connect** — *anticipation* 6.98–7.15: the nearest dots to each stone brighten. *Action* 7.15–7.85: a **yellow thread** (`thread`, width 8) grows from S1's centre through the dots to S2's centre (organic ease-in, tip leading, one overshoot past S2 and back) — two separate forms physically **joined**. *Consequence*: both stones' contours **soften** (wobble → 2); the rings that reach the shore arc are absorbed without breaking. Nothing turns orange. | rotate (+40,+40,1.08,0) → (+20,+50,1.15,−5) over 6.98–7.6, then → 0 by 8.2 (the camera tilts its head with the question) | Thread from (−160,−20) to (+200,+120): inside |
| **8.20 (result)** | Thread joins the stones | The thread **brightens** (cov .7 → .95); S2's newest dashed ring widens toward the camera. | push into the ring: (+20,+50,1.15) → (+200,+120,1.5,0) over 8.2–8.67 | — |
| **8.67–9.317 seam** | S2's dashed yellow ring fills the frame | **Passage through S2's yellow dashed ring (yellow halftone ring on the navy night field)** → reveals ch5: the shore at close scale in daylight. | forwardPassage | — |

Seam: Passage through **S2's yellow dashed ring** → reveals **the shore at close scale: yellow grainy mud with many pebbles, a torn waterline at the right, the stone-ball in the shallows, a single yellow pebble among the many** (a daylight close-up, not a night ring field).

Football truth: two review questions asked side by side make a map of what happened; the conversation (thread) links what helped to what to try; no blame = no orange in the print.

Actions: 6 (breath lens + rock, S1 drops + rings, S2 drops + dashed rings, interference, thread joins, thread brightens). Camera: push, drop-with, pan + bounce, creep, rotate, push, passage = 7.

---

## Chapter 5 — CHOOSE ONE DETAIL (11.217 s) · headline: ONE DETAIL (9.04 → seam)

Narration: "Choose one football detail for practice. Perhaps check your shoulder before receiving, or recover into space after losing possession. Keep it small."

**Background construction:** the shore at close scale from above: **yellow grainy mud field** (cov .55, mottle .5, speckle) filling the left 60 %, its **torn edge** against **blue water** (cov .45 with three faint concentric bands) on the right (x > +220); the **green wet strip** (blue × yellow overprint, width 60) along the torn waterline; thirty **pebbles** (navy / blue small torn blobs r 14–30, seeded) scattered along the shore = this chapter's confetti; a tiny orange halftone smudge at the far right edge (+520, +60) = the numerals' spot, seen from far (revisit).

Composition at 0 s: **Stone-ball** (round river stone r 90, navy seam lines, paper highlight) at (+420, +160) in the shallows. **Pebble P** (single, yellow, r 44, with a paper knockout crescent = its "front") at (−140, +60) among the many. **Orange wake ring** (the opponent; a ripple arc r 120, cov .3, mottle) approaching from the top-left (−380, −330) at 30 units/s toward P. A flat **navy rock slab** (240 × 160, torn) at (−120, +40) under P.

| Cue time + words | Composition | Cue action: physical enactment | Camera key | Phone note |
|---|---|---|---|---|
| **0.00** "Choose one football" (chalk 0) | Shore with many pebbles, P among them, stone-ball in the shallows, wake far top-left | **Choose one** — *anticipation* 0–0.15: P presses 3 units into the mud. *Action* 0.15–0.5: P is **lifted** from the many (scale 1 → 1.25, easeOut, its navy shadow separates and offsets 12); *settle* 0.5–0.9: set down on the slab (scale → 1.0 with a 2-unit bounce). *Consequence*: the other pebbles **dim** (cov .8 → .5) and the two nearest **roll aside** 10 units. | (0,+40,1.0,0) → push (−60,+40,1.1,0) over 0–0.8 | P and slab inside core |
| **1.30 (result)** | — | The stone-ball **rocks** in the shallows (counter-tilt, 2 units, twice: anticipation for the pass); the orange wake creeps closer (cov .3 → .6, heavy, slow); the three faint bands in the water slide 6 units. | hold, creep 4 units/s | — |
| **3.18** "check your shoulder" (eye 2) | P on the slab, wake behind it, stone-ball right | **Look = the camera pans as the look** — *anticipation* 3.18–3.3: P's crescent dips 5° forward. *Action* 3.3–3.65: P's crescent **turns 150°** to face the wake (easeOut, overshoot 165° and settle) while the camera rotates and travels up-left; the wake is **revealed by the pan** — its torn edge sharpens (cov .6 → .85) as it enters the centre of the view. *Consequence* ~4.0: the wake **shoves** 20 toward P (0.3 s) and the mud at its edge crumples; P's crescent returns to face the stone-ball (counter-turn, 0.3 s). | the look: (−60,+40,1.1,0) → (−180,−100,1.1,−8) over 3.3–3.8; return to (−60,+40,1.1,0) over 4.0–4.4 | Wake at (−300,−260) inside core |
| **4.30 (result, receive)** | Stone-ball rolling in | *Anticipation* 4.3: the stone-ball rocks back 6. *Action* 4.45–5.2: it **rolls** from the shallows along the wet strip to P (0.75 s, accelerating then easing, spinning, a wet trail of 4 droplets); **first touch**: on contact P **rotates 20°** and the ball is **redirected** 60 units to the bottom-right, *away* from the wake (easeOut 0.4 s, one small bounce); a paper spark at the contact. *Consequence*: the wake, aimed at where the ball *was*, keeps coming. | dragged by the ball a beat late: (−60,+40,1.1,0) → (−40,+80,1.15,0) over 4.6–5.3 | Ball rest (−60,+120): inside |
| **6.40 (derived, "recover into space after losing possession")** | Wake arriving | **Lose** — *anticipation* 6.4: the wake's edge lifts 8. *Action* 6.55–6.9: the wake **overruns** the ball: the ball is overprinted orange (its seams vanish for 0.3 s, orange × paper) and is **carried** up-left 120 units inside the ring (heavy, easeIn). **Recover** 6.9–7.6: P **slides back** along the shore (easeInOut, a 10-unit overshoot) to a gap between two faint bands at (−260, +300), leaving a **navy dashed track**; the pebbles it passes roll aside; it stops goal-side, between the wake and the water. | pan following P: (−40,+80,1.15,0) → (−200,+220,1.15,0) over 6.9–7.7 | Recovery spot (−260,+300) inside core |
| **9.04** "Keep it small" (touch 1) | Everything | *Anticipation* 9.04–9.2: P brightens. *Action* 9.2–9.9: everything but P **fades to halftone** (stone-ball, wake, the many pebbles, the slab, the track: cov → .25, long ease-out); P alone stays solid (cov .95) and **settles smaller** (r 44 → 36 with a 2-unit bounce). *Consequence*: one small navy contour tick is stamped beside P (one drawn frame). | push (−200,+220,1.15) → (−260,+300,1.5,0) over 9.04–10.0 | — |
| **10.00 (result)** | — | P's yellow brightens (cov .95 → 1.0); its torn edge steadies. | push → (−260,+300,2.2,0) over 10.0–10.57 | — |
| **10.57–11.217 seam** | The pebble's yellow grain fills the frame | **Passage through the single yellow pebble (yellow grainy ink)** → reveals ch6: the whole pond at dusk from above. | forwardPassage | — |

Seam: Passage through **the single yellow pebble** → reveals **the wide dusk pond: blue field with very faint settled bands, a huge paper sun-reflection disc, the far yellow shore rim, the whistle at rest bottom-right, P on the near shore** (a wide still composition, not a close shore).

Football truth (11v11): before receiving, check the shoulder to locate the opponent; open the body and take the first touch *away* from the pressure; after losing possession, recover immediately into the space between the opponent and your goal (goal-side), not toward the ball. Pass / roll 0.75 s, first touch cushioned and redirected.

Actions: 7 (lift, rock + wake, look + reveal, receive + first touch, lose + recover, fade to one, brighten). Camera: push, creep, pan-as-look + return, drag, pan, push, push, passage = 8.

---

## Chapter 6 — ROOM FOR ANOTHER DAY (9.115 s) · headline: none

Narration: "Then make room for rest and life beyond football. You can carry a useful lesson forward without carrying the whole score with you."

**Background construction:** the wide pond at dusk from above: blue grainy field (cov .45 at top → .6 at bottom, dot-size ramp) with **very faint settled bands** (cov .06 steps, five rings from (−100, +40)); the **huge paper sun-reflection disc** (r 300, knockout tone cov .5, torn edge) at (−220, −40); the **yellow torn shore rim** along the far edge (y > +380 and x > +430, cov .5) with the green wet strip; four cream confetti fragments floating, still. Grain everywhere.

Composition at 0 s: the **whistle** at rest on the far shore, small and cropped, bottom-right (barrel r 70 at (+470, +420), orange cov .4, lying on its side); the **numerals** on the bed under the sun disc as orange halftone (cov .15, 80 tall) at (−200, +40); **P** (yellow pebble r 40) on the near shore at bottom-left (−420, +380).

| Cue time + words | Composition | Cue action: physical enactment | Camera key | Phone note |
|---|---|---|---|---|
| **0.00** "Then make room" (rest 1) | Wide pond, sun disc, whistle and pebble on the shores | **Room / rest — the composition expands and slows**: the last faint bands **dissolve** (cov .06 → 0 over 2 s, long ease-out); the sun disc **lowers** 40 units and its halftone glow ring **widens** (r 300 → 380, cov .5 → .25); the whistle's coverage drops .4 → .3 as it settles 3 units into the mud (put down); the confetti fragments drift to the shore and stop. Tempo: nothing faster than 20 units/s. | slow push (0,0,1.0,0) → (−60,+20,1.08,0) over 0–2.5 (the camera breathes out) | Sun disc, P and the whistle inside or on the core boundary; P (important) at (−420,+380) inside |
| **2.60 (result)** | — | The sun disc's edge softens (wobble 8 → 3); the water's grain slide stops. A single slow ring from the far shore passes and fades (the pond's last breath). | hold, creep 3 units/s | — |
| **4.14** "a useful lesson forward" (map 2) | P on the near shore | **Forward — P is skipped**: *anticipation* 4.14–4.3: P rocks back 8 (loads). *Action* 4.3–5.4: three ballistic hops, contacts at (−200, +220), (+40, +90), (+260, −20), 0.35 s apart, lift 60 / 40 / 25 (linear in flight, each contact a 1-frame squash and a paper splash); each contact births **two small yellow-tinted rings** (r 20 → 120) that travel forward; P lands on the far shore at (+440, −90) at ~5.4 with a 2-unit bounce and rests. *Consequence*: the small rings are the only new ripples — small, forward, travelling away. | dragged by P with an 80-unit lead: (−60,+20,1.08,0) → (+260,−40,1.08,0) over 4.3–5.5 (`motionPath`) | Hops and the landing (+440,−90) inside core |
| **5.60 (result)** | P on the far shore | P's rings cross the sun disc and pass out; P sits solid yellow; the far shore's wet strip glints (a 2-frame paper flick). | hold | — |
| **6.54** "the whole score" (score 2) | Numerals under the sun disc | **Drop / leave behind** — *anticipation* 6.54–6.85: the numerals **try to follow**: cov .15 → .35 and they lift 20 units (easeOut) toward the direction P went. *Action* 6.85–8.0: they **sink** (easeIn, heavy): scale ×0.7, cov → .03, slipping under the bed's navy mottle with one small bubble. *Consequence*: the sun disc's reflection **closes over** them, unbroken (edge wobble → 2). | rotate (+260,−40,1.08,0) → (+200,0,1.08,+2) over 6.54–7.0 then → 0 by 7.6, pan down 30 with the sinking (the camera drops a little with them, then rests) | — |
| **8.00 (result)** | Whistle at rest, P on the far shore, sun disc whole | Held print until 9.115. **End card** (§4d.6): P does one small settle (a 4-unit rock) and the sun disc's glow ring breathes once; the Replay button takes its printed-stamp look. | stop at (+200,0,1.08,0) | — |

No seam (last chapter): the final print holds, marks fixed.

Football truth: the lesson (P) travels forward to the next day; the score stays in the pond. No football action; the whistle at rest marks that the match is over.

Actions: 6 (expansion, last ring, skip, glint, numerals lift and sink, end settle). Camera: breathe-out push, creep, drag with lead, rotate + drop, stop = 5.

---

## Delight (§4d)

**Touch reaction** — `touch(sheet, x, y, age)`, ≤ 0.8 s, story inks: the tap **drops a pebble**: a small navy pebble (r 12) appears at the touch point already falling (scale 1.3 → 1 over 0.15 s) with a paper splash burst (r 20, one drawn frame) and one cream droplet arcing up 30 and falling; **two blue ripple rings** expand from the point (r 0 → 140, torn edges, cov .4 → 0 over 0.8 s, easeOut). On the yellow shore (ch5, ch3's shore band) the same tap presses a stud mark into the mud instead (navy dash, mud spray of 3 specks) — the reaction reads the material under the finger. While paused: one pebble, then sleep. Reduced motion: a single static ring that fades.

**Secondary motion that reacts to the main actions** (seeded, bounded lifetimes):
- Whistle-blast confetti fragments flutter down and ride every ring outward; they are thrown by the slap (ch2), gather as the team ring (ch3), settle on the shore (ch6).
- Spray droplets on every impact (numerals, stones, the bar, P's hops, the stone-ball's wet trail), arcing up and falling within 0.4 s.
- The sky reflection breaks into segments when a ring crosses it and reassembles when the water stills.
- Pebbles on the shore roll aside 10 units when P is lifted or slides, and when the stone-ball passes.
- The whistle's pea rattles (2-unit jitter, 3 drawn frames) on the blast and once when it is put down.
- Interference dots pop where two ring systems cross (ch2, ch4).

**Seam tick**: new registration seed and a paper flip at every seam; haptic 8 ms where supported.

**Headline arrival**: ONE RESULT / ONE DETAIL pop in with the CSS misregistration settle; nothing on canvas.

---

## Shapes needed

From the shared library (§3): `ripple` (single rings; the ring *systems* are story-specific), `field(torn|wave)`, `thread` (ch4), `chalkStroke` (the stud track and P's recovery track), `sun/lantern disc` (the sun-reflection glow ring), `sparkBurst` (splashes), `speedLines` (the stone-ball's roll); motion: `twos`, `key`, `camKeys`, `anticipate`, `settle`, `squash`, `spring`, `arc`, `motionPath`, `wob`, `blob`, `torn`; `forwardPassage`.

Story-specific (author in `stories/loss.ts`, not the library):
- `ringSystem(sheet, centre, bornEvery, speed, style: solid|dashed|jagged|sag|smooth, cov[], wobble, t)` — concentric torn-edge ring bands born on drawn frames, radius sampled every frame, seeded per ring, dropped past the frame; `settle(t)` lengthens the interval and lowers wobble on a long ease-out.
- `whistle(sheet, x, y, r, angle, inflate, pea)` — cropped barrel, mouthpiece, knockout pea; blast recoil.
- `numerals(sheet, x, y, h, cov, tilt, refract)` — the two chunky "1" / "2" path glyphs with navy echo (fallback: tally blocks).
- `scoreBar(sheet, x, y, w, h, tilt, cov)` — the flat orange bar (ch2).
- `stone(sheet, x, y, r, seed, ink)` — torn blob with contour (S1, S2, pebbles).
- `stoneBall(sheet, x, y, r, rot, orangeOverprint)` — river stone with five navy seams and a paper highlight (ch5).
- `pebble(sheet, x, y, r, crescentAngle, cov)` — P, with its knockout "front" crescent.
- `pebbleField(sheet, seed, count, dim)` — the thirty shore pebbles with roll-aside offsets.
- `shore(sheet, edgePath, cov)` — yellow grainy mud with a torn waterline and the green wet strip.
- `reflectionDisc(sheet, x, y, rx, ry, cov, breakBy: rings[])` — the paper sky disc that fragments under rings and reassembles.
- `studTrack(sheet, points, progress)` — the effort track with per-stud mud spray.
- `skip(sheet, path, t)` — P's three ballistic hops with contact squash and small ring births.
- `touch(sheet, x, y, age)` — the pebble-drop reaction (stud mark on shore).

## Reduced motion prints (one per chapter)

Ch1 at 8.6 s (smooth rings, numerals shadowed on the bed, whistle receded), ch2 at 8.2 s (still water, reflection reassembled, numerals on the bed), ch3 at 7.9 s (confetti ring tightened around the small numerals inside the sky disc, stud track on the shore), ch4 at 7.9 s (thread joining the two stones through the interference dots), ch5 at 10.0 s (P solid, everything else halftone), ch6 at 8.0 s (P on the far shore, whistle at rest, sun disc whole).

## What would make this fail (the rejected Astra look, and the repetition rule)

- A small centred ball icon with a sad-face cloud beside a "0–3" on a flat blue background. Here the whistle is r 170 and cropped, the numerals are heavy objects that fall, and the water is a grainy field with torn rings.
- **Any flat background**: a chapter whose water is a single flat blue, or rings drawn as clean vector circles without torn edges, stepped coverage, grain and travel.
- Rings that read as `regulate`'s static nested arches: ours must be full closed circles born at a point, expanding and decaying, off-centre.
- Reusing `signal-water`'s shore-to-shore ripple bands: ours never travel from one shore to another as a signal; they radiate from an impact and settle.
- The **ball-boot-eye-bubble sequence**: a hand for "flatten them", an eye for "check your shoulder", a bubble for "talk with a teammate", a boot for "recover". Here those are the scoreboard bar slapping the water, the pebble's crescent turning as the camera pans, the thread joining two stones, and the pebble sliding back into a gap.
- A cue where the word says drop / press / space / forward and the frame does not enact it: numerals that fade instead of falling with the camera dropping; a slap that makes no new rings; "space" that is only a colour change; a lesson that fades out instead of being skipped forward.
- Words or sentences drawn on the canvas beyond the two numeral glyphs (and, if ruled against, the tally fallback); a literal "1–2" text string; any caption in the art.
- Flat holds ≥ 1.5 s: rings already born must keep travelling; the camera must creep.
- Full-body figures, referees, faces, players — the referee is only the whistle; the team is eleven fragments; you are a pebble.
- Hard cuts or zoom-out seams (pulling up from the shore to show the pond). Every seam goes *into* a material: water → reflection → disc → ring → pebble.
- Per-frame random wobble on rings; per-dot halftone shaking; rings born every frame (must be on drawn frames).
- Swapping role inks (a blue opponent, an orange teammate, yellow numerals).

## Self-check — does the muted film still explain the narration?

Muted, ch1 shows a whistle inflate and blast, two heavy numerals rock, tip and fall into the water while the camera drops with them, rings burst out, sag, then spike jagged and dark with splatters, then leave round and smooth while the numerals gain a shadow on the bed: "the whistle goes; disappointment, anger; the feelings have a cause." Ch2 shows rings filling the frame, a flat orange bar slap the water and make more rings, then sink away as the rings slow and loosen until the water is still and shows a clear reflection: "you do not have to flatten them; give yourself space." Ch3 looks through the still water at two small numerals, then eleven fragments gather around them, a stud track presses into the mud, a huge sky disc settles over everything, and the ring of eleven tightens as the numerals recede: "one result; not the team, the effort, the value; respect." Ch4 is night: two stones drop one after the other, their rings interfere, and a thread joins them: "two questions; a conversation; no blame (no orange)." Ch5 is football in stone material: one pebble lifted from many, its crescent turning as the camera pans to reveal the orange wake, the stone-ball rolled in and touched away from the wake, the wake taking it, the pebble sliding back goal-side, then everything but the pebble fading: "one detail; check the shoulder; recover into space; keep it small." Ch6 shows the wide pond going still, the pebble skipped forward in three small rings to the far shore, the numerals lifting once and sinking out of sight under the unbroken reflection, the whistle at rest: "room for rest; carry the lesson forward, not the score." The only ideas that lean on the voice are *which* two questions the stones ask (the solid / dashed rings show two different questions, not their words) and the exact score (the glyphs show a result; the tally fallback shows it too). Every cue has a drawn, physical consequence; no chapter rests on a symbol the narration does not mention; no chapter has a flat background; no sentence is lettered in the artwork.

---

## Build ledger — `lib/paths/riso/stories/loss.ts` (September 20, 2026)

**Gates (all green):** `npm run typecheck` clean · `scripts/review-riso-story.mjs --id loss`: 45 samples, 5/5 seams pixel-exact (max diff 0, changed 0), zero page/draw errors, max 128 ops (a passage frame), scene ops 29–85 · `scripts/riso-perf.mjs loss` at 390×850 DPR 1.5: **median 3.6 ms**, p95 17.1 ms (passage frames), max 23.4 ms, ops median 50 · `scripts/check-riso-loss.mjs` (browser check with format tab 11v11 and button "Story: After the Final Whistle"): PASS at 390×850, 320×568, 844×390, 1440×850 — tray fits, six chapter dots, playback, pause sleeps, paused touch wakes one burst then sleeps, transcript, close releases audio, zero page errors.

**Screenshots:** `scratchpad/riso/loss/app-loss-<w>x<h>-ch<1..6>.png` (+ `-touch.png`) for the four viewports, contact sheet `scratchpad/riso/review/loss.png` (session scratchpad `/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/`).

**What was built as boarded:** the six constructions (shore + whistle + still reflection · full-frame off-centre ring field · still bed with settled bands and a huge paper disc · navy + yellow night with two ring systems · close yellow shore with pebbles and blue shallows · wide dusk pond with sun disc and shore rim). Rings are a story-owned system (`ringBand`/`rings`/`alive`): born on 12 Hz drawn frames at an impact, radius sampled every frame, seeded per ring, stepped coverage, styles solid / sag (lower half droops) / jagged (zigzag, orange × blue overprint) / smooth / dashed, dropped past the frame; ch2 lengthens the interval and lowers the wobble on a long ease-out and stops births at 7.5 s so the reflection reassembles. The whistle inflates, blasts three navy rings and eight fragments, recoils and recedes; the two numerals are torn-edge orange path glyphs with a navy echo (never text) that rock, tip, fall with the camera dropping, splash, sink, refract, gain a bed shadow, and later lift once and sink out; the score bar drops flat, the whole water flattens for two drawn frames, five jagged rebound rings and droplets burst, the bar tilts and sinks with a last bubble, interference dots pop; eleven cream fragments join a ring and tighten with a counter-turn; the stud track stamps into the mud with spray; the sky disc settles; two stones rock, lift, drop and sink, their solid and dashed rings leave a lattice of yellow crossing dots and a thread grows through them with an overshoot; the pebble is lifted with a separating shadow, its crescent turns as the camera pans to reveal the wake, the stone-ball rolls in with a wet trail and is touched away, the wake overruns and carries it while the pebble slides back leaving dashes, then everything but the pebble fades to halftone; ch6 dissolves the bands, widens the sun's glow, skips the pebble in four hops with contact squash, splashes and small forward rings, and leaves the whistle at rest. Passages: water at the impact centre → the paper reflection → the paper sky disc → S2's ring centre on the night field → the single yellow pebble. Touch: a navy pebble drops with a paper crown, one droplet and two blue rings. Reduced-motion stills at 8.6 / 8.2 / 7.9 / 7.9 / 10 / 8 s.

**Deviations from the board (and why):**
- Ring coverage steps are blue .65 / .85 alternating with **paper crests** (−.55 knockout bands) rather than .25 / .4 / .55: the low steps read as flat blue on the phone; the crest/step alternation is what makes the rings read as printed bands.
- Ch4's rings are thinner and sparser than boarded (width 30 / 28, born every .5 s, fading from r 320) because the boarded density turned the night into a solid yellow disc within three seconds; the interference lattice is sampled every four drawn frames and capped at 90 dots inside the box between the stones.
- The ch2 slap flattens the entire ring system vertically (×.55 for two drawn frames about the bar) rather than only the rings beneath the bar.
- The whistle sits at (−240, −170) in ch1 and (410, 400) r 64 in ch6 (board: −300 and 470/420) so it is not cropped at 390 wide after the camera drops with the numerals.
- Shores use a `tornStrip` for the wet strip (a strip between two torn lines) so the green overprint stays on the mud edge instead of tinting the open water.
- `touch()` has no chapter context, so the shore-aware stud mark is not implemented: the pebble-drop reaction is used everywhere.
- Headlines (ONE RESULT, ONE DETAIL) are chapter-level and pop at chapter start; no end-card settle beyond the held final frame.

**Self-critique:** the water world is convincingly printed (speckled blue field, stepped ring bands with paper crests, brown angry rings, the green wet strip, the paper disc breaking under rings and reassembling) and ch1/ch2/ch5 are dense and physical; but ch4's first three seconds are a sparse night (two stones on a navy field, by design "still water", yet the thinnest frame of either story), the numerals under the sun disc in ch6 are small enough that their lift-and-sink leans on the caption, and the stone-ball in ch5 is partly cropped at 390 wide until it rolls in.

## Fix ledger (2026-09-20, fixer agent — 11v11 review pass)

**Punch list → change (file `lib/paths/riso/stories/loss.ts`).**
- §1c.4 figures (`figure()` helper copied in). **ch1** a navy player stands on the shore beside the whistle holding the match ball; at 1.1 the ball drops and splashes (the rings), on "Disappointment or anger" (2.92) the shoulders drop and the head sinks (`mixLimbs` stand → slump over .5 s) with a slow residual heave after. The score numerals are gone from ch1. **ch3** the score is two stacks of navy stone blocks (`tally`, 1 and 2 high) on the shore with the navy ring drawn round them; on "cannot describe your team" (2.52) the camera pulls right to reveal three navy players standing shoulder to shoulder on the shore; on "respect" (6.94) they lift their heads and arms a little together. **ch4** the night prints navy .8 + blue screen .3 + paper speckle with a torn horizon band; the two questions are two paper (lantern-lit) figures — the player and a taller coach — facing each other, a paper speech disc with a tail alternating sides at 2.88 and 5.0 (the one generic shape), yellow rings born at the speaker's feet, both stepping closer with the yellow thread on "without blame". **ch5** the black rectangle is gone; the navy player checks its shoulder at 3.18 (head shifts back with a counter-nod, `lookBack`), touches the ball at 5.2 (kick pose), and on "recover into space" (6.9) runs back goal-side on a stride cycle with speed lines and the stud track; the opponent is an orange `run` figure that comes in from the top-left, overruns the ball and carries it off. **ch6** the whistle and numerals are gone; a navy player lies back on the shore, head on a yellow pillow disc, chest rising slowly; the tally blocks lift and sink under the sun disc on "the whole score"; the pebble hops stay (the lesson carried forward).
- **ch2** impact moved off-centre to (−220,−140), rings run to r 1800 and leave the frame (cross-story fix 3); the orange bar is now the whistle thrown flat on the water (the slap), tilting edge-on and sinking with a paper bubble trail; a slow ring every 1.3 s keeps the water moving after 7.5.
- **Flat holds**: ch3 slow wide rings (`R3`) keep travelling from the old impact, ch5's shallows rings drift and the pebbles breathe, ch6 gets a slow far-shore ring system (`R6`) plus the resting figure's breath; ch1 keeps a residual heave after the slump.
- **Touch**: the two blue rings grow to r 324 (was 160) at width 24 and the paper crown is doubled.

**Kid test (sound off; frames `scratchpad/riso/fix/loss/frames`, app `…/fix/loss/app`):**
- ch1 "A whistle blows, a player drops the ball into the pond and droops as the ripples spread." PASS
- ch2 "Big ripples on the water; a whistle is thrown in and sinks with bubbles; the ripples calm down." PASS
- ch3 ONE RESULT "Two little stacks of blocks on the shore with a circle round them; three players stand together." PASS
- ch4 "Two people talk at night; a speech bubble goes from one to the other and a yellow line joins them." PASS
- ch5 ONE DETAIL "A player looks over their shoulder, an orange player runs in, they kick the ball, then run back into space." PASS
- ch6 "A person lies down on the shore by the pond and a pebble skips across the water." PASS

**Gates.** typecheck: loss.ts clean · `review-riso-story --id loss`: 5 seams 0 px, 0 errors · `riso-perf`: median 4.4 ms, p95 17.1, ops median 82 · `check-riso-loss.mjs`: PASS ×4 viewports (screenshots `scratchpad/riso/fix/loss/app/*.jpg`).

**Remaining limitations.** ch2's camera still centres on the impact for the seam aperture in its last second (needed for the passage); the ch1 navy figure over the yellow shore prints dark green where it overlaps the wet strip.
