# Grit — riso storyboard

Story id `grit` · 9v9 · **track mode**: one audio file `/stories/films/grit/narration.mp3`, media duration **64.73 s** (ffprobe 64.731375). Nine visual chapters on **media time**.
Cue sources — **read this first**: `public/stories/films/grit/narration-cues.json` is in the *old story clock* (its times run to 71.6 s, past the media's end) — it is **not** media time. The 33 sentences' true media times are in `public/stories/films/grit/recording-alignment.json` (0.00 → 64.30 s) and the story→media map is `lib/paths/gritNarrationTiming.json` (piecewise linear). Sentence cues below are **exact** from `recording-alignment.json`. Mid-sentence word cues marked **≈** are the word onsets from `narration-cues.json` mapped through `gritNarrationTiming.json` (accurate to ≈ 0.1 s); they are derived from shipped audio, not invented. Captions stay as shipped in `lib/paths/gritScript.json`.
Headlines (bible §4c): one or two words per *visual chapter* (four of nine; the rest none), HTML overlay in the loading-screen brush font; nothing lettered in the artwork.

## Frame conventions

- World units: short side 1080. Chapter centre (0,0); x right, y down. This story is one **vertical world**: the ground line is y = 0 in ch1–3, 5, 6; the underground chapters (4, 7, 9) are the same world 600–1400 u deeper; the crown chapter (8) is 600 u higher.
- **Core square**: x −480..+480, y −400..+380 (title strip above, caption tray below).
- Portrait 390×850 extends y to ≈ −900..+700 (tray from ≈ +700) — this story benefits: the strata continue down and the sky up; landscape 844×390 extends x to ±900 and crops y to ±440; 1440×850 shows x ±915, y ±540. Backgrounds fill the whole sheet.

## Lead imagery (owned by this story)

**Seed**, **roots** (navy threads with paper growing-tips), **strata** (stacked underground bands), **stones** (red masses embedded in the strata), **the shoot** and its hooked tip, **leaves** (blue × yellow = green overprint), the **crust** at the surface, the **sun** and its stepped light, **fruit** (red discs with orange overprint highlights), **mica flecks** (paper knockouts in the dark), and the **seed-ball** with a **boot** for the unseen work (see below). Lead imagery not used by any other story in this path: different-tides owns tide lines/footprints/gauge post; harbour-night owns hulls/lantern/sail/mole; unfinished-map owns pencil contours/routes/landmark.

Football tie-in (as briefed for this story): the narration never names football, so the football objects are drawn entirely in the tree's material and appear only in the two "work in the dark" chapters and their mirror. The **seed-ball** = the seed from ch1 swollen to a sphere, paper with navy **crack-panels** (reads as a ball); the **boot** = a cropped navy boot silhouette whose sole is a root (no leg, no figure). In ch7 and ch9 the boot repeats one inside-of-foot touch on the seed-ball in the dark; in ch8 the mirror is the **fruit-ball** (a red fruit with navy panel lines) that everybody reaches for. The single generic shape is the **hand** in ch8 — drawn as **leaf-cluster hands** (cupped hands made of three leaves) reaching for the fruit. No eye, ear or bubble in this story; "nobody sees you" is enacted by the mica flecks going out and the field closing, and by the camera.

## Background construction (unique to this story): underground strata that give way to sky

Every chapter is printed on **stacked strata**: 4–6 horizontal bands stepping deeper — topsoil (navy .55 over blue .3), then navy .7 over blue .45, then navy .8 over blue .55 (overprint = deep indigo), then navy .85 — each band its own grainy flat print with a **torn, hand-cut upper edge**, fine speckle inside the ink, and **mica flecks** (paper knockout dots r 2–5, seeded, thinning with depth). **Stones** = red .7 torn masses embedded across band edges. Above the **crust** (a torn navy edge with paper chips) the **sky** is paper with a **stepped yellow dot-ramp** (three bands .1/.2/.35 up to the sun) — stepped tone as light, never as arches. The huge-motif slot is the **seed** (ch1), the **mirrored tree** (ch2/6), the **sun disc** (ch3/5) and the **seed-ball** (ch7). Confetti accents = soil grains (navy/blue speckle that trickles), crust chips, falling leaves.

How it differs from the other 9v9 stories: different-tides is daylight sand with horizontal tide bands; harbour-night is a night field with a stepped lantern glow and still water; unfinished-map is cream paper with pencil contours. Grit is the only one whose ground is a deep vertical stack of overprinted strata pierced by roots, with the sky as a stepped glow above.

## Dominant material metaphor and how it develops

**A tree grows in two directions at once**: roots down into strata that squeeze them, a shoot up into light that opens. The film's camera lives in one vertical world and keeps travelling through it:

1. the seed lands on the crust; a root hair and a shoot start in two directions →
2. the young tree as a mirror: the camera turns a full circle so roots read as crown and back →
3. two pulls on one trunk: the sun's arrow up, gravity's arrow down; roots bend away from the light →
4. down: darkness closes, a stone resists, strata squeeze, dirt clogs; the root shoves past →
5. the shoot breaks the crust and reaches; the red walls dissolve — less resistance →
6. the whole tree printed as one picture, roots and crown matching →
7. underground: a boot repeats one touch on the seed-ball in the dark while mica goes out and a stone presses; yellow specks gather on the roots above →
8. the crown in light: fruit; leaf-hands reach; the fruit-ball is caught; the crowd's flecks blink; results pop →
9. inside a fruit is a seed: back underground, the touch continues through a season; a trunk thickens; a new seed forms.

Later chapters revisit earlier places at another scale: ch7/ch9 are ch4's strata around the root-ball; ch8 is ch2's crown from inside; ch6 is ch2's tree seen as a finished print.

## Inks and role colours

Triple: **blue `#0078bf`, bright red `#ff665e`, yellow `#ffe800`** + navy `#22366b` on paper `#f0ece2`. Print order yellow → blue → red → navy; registration 2.2 px (a rough poster) re-seeded per chapter.

| Role | Ink |
|---|---|
| Light: the sun, its stepped ramp, the glow specks on the roots, fruit highlights | yellow (yellow × red = orange fruit highlight; yellow × blue = green leaves and shoot) |
| Strata (with navy), sky ramp's base, the shoot's stem | blue |
| Pressure / resistance / dirt: stones, the squeezing strata walls, the pressing mass | red (red × blue overprint = brown "dirt" speckle) |
| Roots, seed, trunk, crust, boot, the deep field | navy |
| Seed-ball / fruit-ball | paper with navy crack-panels / red disc with navy panel lines |
| Duotone beat | ch7 is printed in **navy + yellow only** (the dark work and the light it makes) |

---

## Chapter 1 — SEED (0.00–6.30 s)

`headline`: none

Sentences: "Did you know that a tree grows in two directions at the same time?" (0.00) · "It's always growing down and growing up." (3.68)

**Background.** Cross-section at the ground. The **crust** = a torn navy edge at y 0 with paper chips; below it four strata bands stepping deeper (topsoil navy .55/blue .3 → navy .85), mica flecks; above, sky paper with the yellow ramp (.1/.2/.35) to the top. One small red stone in band 2 at (−220,+260).

**Composition.** The **seed** (navy teardrop 160 tall with a paper highlight knockout) will land at (0,+60), half in the crust — the huge motif at this scale.

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 0.00 "Did you know" | Crust, strata, sky; seed above the frame | The seed **drops** in from above (0.4 s, gravity), **lands** on the crust with a 12 % squash, rebounds 10 u, settles; **soil grains** (8 navy specks) puff out and trickle back; the crust dents 8 u under it. | push 1.00→1.15 centred (0,+40) over 0.0→0.5 s (dropping with it) | Seed at the centre of the core square |
| **exact** 0.52 "that a tree grows in two directions" | Same | Two threads leave the seed at once: a **root hair** (navy thread 14 u, paper tip) eases down 120 u into band 1, and a **shoot** (blue × yellow = green, 14 u) eases up 100 u — ease-in growth from the base, tips leading (0.8 s). | hold | — |
| ≈ 1.32 "two" / ≈ 1.90 "directions" | Same | Each thread **forks** (a second thread branches from each, 0.4 s); the mica flecks nearest the root tip glint (paper pop). | hold with 10 u creep down | — |
| **exact** 3.68 "It's always growing down" | Tilt down with the root | The root **lengthens** 200 u down through band 1's torn edge into band 2 (0.9 s ease-in, tip leading); the band's edge **parts** 6 u around it; grains trickle. | tilt +100 y over 3.68→4.5 s, zoom 1.15 | Root tip at y +380 stays above the tray |
| **exact** 4.66 "and growing up" | Tilt up with the shoot | The shoot **lengthens** 220 u up and two **leaves** unfold (each: a curled bud that opens with a small overshoot, 0.3 s); the yellow ramp's lowest band brightens .1→.2 around it. | tilt −160 y over 4.66→5.6 s, zoom 1.15→1.2 | Leaves at y −300 under the title strip |
| +0.8 (5.46) | Same | Both threads keep growing slowly; the seed at the centre holds. | hold | — |
| 5.65→6.30 seam | Push into the upper leaf | Passage below. | push 1.2→2.5 into the leaf's green at (30,−300) | — |

**Seam →** Passage through the **leaf's green overprint** (aperture: the leaf 120×60) → reveals **chapter 2: the young tree whole, crown above, roots below, mirror-symmetric** (a different composition: a full tree, small, centred on the ground line).

Football truth (metaphor stage): none named; the two directions are drawn as two real growths from one seed.

---

## Chapter 2 — MIRROR (6.30–14.26 s)

`headline`: none

Sentences: "And what's interesting is the root system mirrors the fruit system." (6.30) · "Now here's what's fascinating about a tree." (11.46)

**Background.** The strata and sky as ch1 at half scale (six bands visible, the sun's ramp stronger); the ground line at y 0 across the sheet.

**Composition.** A **young tree**: trunk (navy 60 wide) from (0,+40) to (0,−200); **crown** = three green overprint lobes (blue × yellow) 420 wide at y −260; **roots** = five navy threads spreading 420 wide down to y +300, paper tips; three **fruit** (red discs r 30) in the crown.

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 6.30 "And what's interesting is" | Whole tree | A **paper knockout line** flashes along the ground line (the mirror axis, 0.2 s), then holds as a thin cream line; grains settle on it. | push 1.00→1.08 centred (0,0) over 6.3→7.2 s | Crown and roots both inside the core square |
| ≈ 7.66 "root" | Same | The roots **redraw thicker** (pressure-varied, 0.3 s) and each tip gets a navy nodule; band edges part around them. | hold | — |
| ≈ 8.27 "mirrors" | **Rotate = the mirror** | The camera **rotates 180°** over 0.9 s (ease-io, anticipation: a −5° counter-turn first) so the roots read as a crown; during the turn the crown's lobes **redraw** to match the root spread flipped. | rotate 0→180° about (0,0) over 8.27→9.2 s | Both halves stay inside the core square at zoom 1.08 |
| ≈ 9.23 "fruit system" | Roots now at the top | Five **fruit pop** in the (now lower) crown, 0.15 s apart, each with a 10 % overshoot; the nodules on the roots (now at the top) glint paper — a matching count. | hold at 180° | — |
| **exact** 11.46 "Now here's what's fascinating" | Rotate on (never back) | The camera **continues** rotating 180°→360° (0.9 s) so the tree returns upright by going *forward* round the circle; the fruit swing and settle (decaying, 0.6 s). | rotate 180→360° over 11.46→12.4 s | — |
| ≈ 12.24 "fascinating" | Push on the trunk/ground junction | The trunk base **swells** (buttress, +20 u each side, 0.4 s overshoot) where crown and roots meet; one grain trickles down the bark. | push 1.08→1.3 centred (0,+20) over 12.24→13.2 s | — |
| 13.61→14.26 seam | Push into the bark | Passage below. | push 1.3→2.6 into the navy trunk at (0,+10) | — |

**Seam →** Passage through the **trunk's navy bark** (aperture: the trunk's width, 60×200) → reveals **chapter 3: the trunk huge and vertical with the sun at the top-right and a stone in the strata** (a different composition: a diagram-scale close of one trunk with two arrows).

---

## Chapter 3 — TWO PULLS (14.26–21.92 s)

`headline`: none

Sentences: "Its nature is both gravitropic and phototropic." (14.26) · "So the root system grows away from light and toward gravity" (17.78; caption "That means its roots grow away from the light—and toward gravity.")

**Background.** The strata stepping down from y 0; the sky's yellow ramp stepped toward the **sun disc** (yellow r 220 with two stepped halftone rings to r 400) at (380,−360) — the huge motif; a **red stone** (300×220) in band 2 at (−200,+260); mica flecks.

**Composition.** The **trunk** (navy 140 wide) vertical from y −400 to y +400 through the ground line; two **leaves** at (−120,−300) and (120,−340); **roots** from the base: one straight down, one left, one right, paper tips.

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 14.26 "gravitropic" | Tilt down to the roots | A **navy laneArrow** (40 wide) draws from the root tip **downward** (0.5 s, tip leading); the root tip **bends** 12° toward straight down (anticipation: a 3° counter-bend); band 2's edge parts. | tilt +200 y over 14.26→15.0 s, zoom 1.0→1.1 | Root tips above y +380 |
| **exact** 15.98 "phototropic" | Tilt up to the sun | A **yellow laneArrow** draws from the shoot's top **toward the sun** (0.5 s); the top **bends** 15° to the sun; the leaves **rotate** to face it (0.4 s, small overshoot); the sun's outer ring steps out. | tilt −400 y and pan +200 x over 15.98→16.9 s, zoom 1.1 | Sun at (380,−360) sits at the top-right of the core square |
| **exact** 17.78 "grows away from light" | Rotate/pan down round the trunk (forward, never back) | The sun's glow ramps .35→.5; the roots' tips **turn away** from the sun side by 20° (the sun-side root shortens 40 u, the shadow-side root lengthens 80 u; tips leading); grains trickle from the parted band. | rotate −10° and pan −200 x, +300 y over 17.78→18.8 s, zoom 1.1 | Roots back inside the core square |
| **exact** 19.74 "and toward gravity" | Push on the root tips | The navy arrow **doubles in width**; the roots **thicken** 14→22 u and **drop** 120 u (heavy: slow start, hard stop); the trunk base **widens** (buttress +20 u). Consequence: the trunk above **leans** 2° toward the shadow side. | push 1.1→1.25 centred (−60,+280) over 19.74→20.6 s | — |
| ≈ 21.05 "gravity" | Same | A second root branch reaches the **red stone** and **deflects** around it (bends 30°, 0.5 s, the stone does not move) — anticipating ch4. | hold, 10 u creep down | — |
| 21.27→21.92 seam | Push into the soil under the root tip | Passage below. | push 1.25→2.6 into the dark pocket at (−60,+380) | — |

**Seam →** Passage through the **soil pocket beneath the root tip** (aperture: a dark oval 160×100, the strata's deep indigo) → reveals **chapter 4: fully underground — the seed as a big form at the top, the root descending between stones** (a different composition: no sky, the deep field).

---

## Chapter 4 — DOWNWARD (21.92–32.80 s)

`headline`: **DOWNWARD**

Sentences: "and before the tree can ever grow upward, the seed first" (21.92) · "has to grow downward into darkness, resistance, pressure and dirt." (25.50; recording-alignment splits it: darkness 25.50, resistance 26.96, pressure 27.82, dirt 28.06) · "The roots literally have to fight their way deeper underground" (28.86)

**Background.** Fully underground: bands navy .7/blue .45 → navy .85/blue .55 stepping deeper; a faint **yellow surface line** at the top edge (y −520) at first; mica flecks at 100 %; three **red stones** (300×220 at (−240,+60), 240×200 at (260,+140), 260×240 at (40,+420)); soil-grain speckle.

**Composition.** The **seed** big (r 200, navy with a paper highlight) at (0,−300); the **root** (navy thread 24 u, paper tip 40 wide) descends from it.

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 21.92 "before the tree can ever grow upward" | Tilt up to the surface line | The camera looks up: the **yellow surface line** is revealed at the top with a tiny green shoot knockout above it; the seed's highlight faces it. | tilt −120 y over 21.92→22.8 s, zoom 1.0 | Surface line at y −520 is visible on portrait, cropped on landscape (acceptable: the seed's upward highlight carries it) |
| **exact** 23.80 "the seed first" (caption "must first grow downward") | Tilt down with the root | The root **extends** 260 u down (1.0 s, ease-in, tip leading); band edges part; grains trickle. | tilt +400 y over 23.8→24.9 s, zoom 1.0→1.1 | Root tip reaches y +200 |
| **exact** 25.50 "into darkness" | Same | **Darkness closes**: the field's coverage steps .55→.8 in five redraws (twos), the yellow line leaves the frame above, the mica flecks drop to 30 % and the seed's highlight dims to tone .5; the camera's push slows to a crawl. | push 1.1→1.14 (creep) | — |
| **exact** 26.96 "resistance" | Push on the stone contact | The root tip **hits stone 1**: the stone does **not** move; the tip **flattens** (squash 40 %, 0.15 s), the root **buckles** 20 u behind it (a bend), then **shoves** around the stone's edge (0.6 s, ease-out), leaving a paper scrape mark on the stone. | push 1.14→1.3 centred (−120,+80) over 26.96→27.4 s (leaning in) | Contact inside the core square |
| **exact** 27.82 "pressure" | Same | **Strata squeeze**: the two bands either side **close in** — `pressureWalls` gap 700→380 in 0.4 s (heavy, hard stop); the root **thins** in the gap (24→12 u), its outline **crumples**; the stone is pushed 10 u; the camera **leans** (rotate +3°). | push 1.3→1.4 and rotate +3° over 27.82→28.2 s | Walls' inner edges inside x ±200 |
| **exact** 28.06 "and dirt" | Same | **Dirt**: a blue .5 speckle prints over the red stone edges (red × blue = brown), the mottle jumps, and the root **clogs** — four navy blobs bulge on it; grains pile at the walls' feet. | hold | — |
| **exact** 28.86 "The roots literally have to fight" | Follow the tip down (on ones) | **Fight = shove past**: the root **pulses** three times (twos): each pulse anticipates (draws back 10 u), then **shoves** 60 u down; each impact on **stone 3** throws a paper sparkBurst (r 80) and soil grains; the walls **yield** 380→420 u on the second pulse. | pan +360 y following the tip over 28.86→31.8 s, rotate +6°, zoom 1.4 | The tip stays centred; stones enter and leave the frame |
| ≈ 31.03 "fight" / ≈ 31.66 "deeper" | Same | On the third pulse the root **splits** into two around stone 3 (both tips leading); the walls yield to 460; the mica flecks around the tips glint (the first light is the root's own paper). | pan continues | — |
| 32.15→32.80 seam | Push into the root's paper growing-tip | Passage below. | push 1.4→2.8 into the tip's paper at the frame centre | — |

**Seam →** Passage through the **root's paper growing-tip** (aperture: the tip 40×60) → reveals **chapter 5: the surface from just below — the crust across the frame, the shoot's hooked tip beneath it, the sky and the sun's glow above** (a different composition: a horizon, the shoot about to break).

Football truth (metaphor stage): pressure is a mass pressing and a thing deforming; the root moves past by shoving, not by the stone moving.

---

## Chapter 5 — BREAK THROUGH (32.80–39.08 s)

`headline`: **BREAK THROUGH**

Sentences: "but once the tree breaks through the surface and starts growing upward" (32.80; caption "…and begins reaching toward the light…" at 34.66) · "there's less resistance." (37.30)

**Background.** The **crust** across the frame at y +200 (torn navy edge with paper chips); strata below (three bands); sky above = paper with the yellow ramp to the top-right where the **sun's glow** enters (rings cropped); the red **walls** from ch4 still visible as red .7 masses at the left and right edges below the crust.

**Composition.** The **shoot** (green, 80 wide, hooked tip) at (0,+220) just under the crust; two leaf buds folded on it.

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 32.80 "but once the tree" | Crust, shoot below, glow above | Anticipation: the shoot **presses down** 20 u (0.2 s, the hook tightens). | push 1.00→1.2 centred (0,+180) over 32.8→33.4 s | Crust at y +200 inside the core square |
| ≈ 33.80 "breaks" / ≈ 34.37 "surface" | Same | **Break**: the shoot **straightens** and drives up 120 u (0.3 s); the crust **cracks** — three navy torn chips lift, tumble (0.5 s, gravity) and land; soil knockouts scatter; the shoot **overshoots** 15 u and settles above the crust; the first **leaf unfolds** (0.3 s, overshoot). | push continues, 10 u camera jolt on the crack | — |
| **exact** 34.66 "and starts growing upward" (caption "reaching toward the light") | Tilt up with the tip | **Reach**: the shoot **grows** 300 u upward toward the sun (1.2 s, ease-in from its base, tip leading, a gentle S-curve); the leaves **rotate** to the light; the yellow ramp's band around the tip brightens .2→.35. | tilt −300 y over 34.66→35.9 s, zoom 1.2 | Tip ends at y −280 |
| ≈ 35.73 "upward" | Same | A second pair of leaves unfolds; a grain that clung to the tip falls back to the crust. | hold | — |
| **exact** 37.30 "there's less resistance" | Rotate/drift into open sky | **Less resistance = the composition opens**: the red walls at the edges **dissolve** (halftone .7→.1 in 0.6 s) and slide 100 u outward; the shoot's outline goes from wobbly-thick to clean-thin (the strain leaves the line); the sky ramp widens. | rotate −5° and drift −100 y over 37.3→38.0 s (breathing out) | — |
| ≈ 37.78 "less" | Same | The shoot **sways** once freely (settle, decaying 0.8 s); the crust chips lie still. | hold | — |
| 38.43→39.08 seam | Push into the sun's glow | Passage below. | push 1.2→2.6 into the yellow ring at (380,−360) | — |

**Seam →** Passage through the **sun's stepped yellow glow** (aperture: the disc r 220) → reveals **chapter 6: the whole tree as one printed picture, crown and roots, torn paper edge around it** (a different composition: a finished print inside the light).

---

## Chapter 6 — THE PICTURE (39.08–43.90 s)

`headline`: none

Sentences: "And honestly that is one of the most beautiful pictures of how life works." (39.08; caption split "And honestly…" 39.08 / "That is one of the most beautiful pictures…" 40.12)

**Background.** The full tree print: strata below y 0 (four bands), sky ramp above, the sun top-right; a **torn paper edge** frames the whole sheet (field kind torn, 40 u in from the edges) — this chapter reads as a print pinned up.

**Composition.** **Crown** = green overprint blobs 520 wide at (0,−280) with five fruit slots; **trunk** navy; **roots** = navy threads 520 wide to y +330 with nodules, mirroring the crown's spread.

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 39.08 "And honestly" | The whole print | **A new print**: registration re-seeds and the whole image **redraws** over four twos-frames as the plates settle into place (each plate slides 2 px into register); the torn edge prints last. | push 1.00→1.08 centred (0,0) over 39.08→39.7 s | Crown and roots inside the core square |
| **exact** 40.12 "That is one of the most beautiful" | Pan to the fruit | Five **fruit print** in sequence (0.12 s apart, each a red disc r 40 popping with a 10 % overshoot and swinging once); the branch under each **dips** 6 u with the weight. | pan +160 x, −100 y over 40.12→41.4 s, zoom 1.08 | Fruit at y −300..−240 |
| ≈ 41.51 "beautiful" | Same | The sun's glow **ramps** over the crown: yellow over red = **orange highlights** on each fruit (0.4 s); leaves knock out paper highlights. | hold | — |
| ≈ 41.95 "pictures" | Pan down through the ground line | The ground line **knocks out** as a mirror line; the roots **re-ink darker** to match the crown's mass (0.4 s), nodules glinting — the two halves are one picture. | pan −160 x, +320 y over 41.95→42.9 s, zoom 1.08 | Roots inside the core square |
| ≈ 42.90 "life works" | Same | One root and one branch **extend** 60 u at the same moment (tips leading) — still growing; a grain trickles, a leaf flutters. | hold | — |
| 43.25→43.90 seam | Push into the darkest root pocket | Passage below. | push 1.08→2.6 into the deep indigo at (−120,+300) | — |

**Seam →** Passage through the **darkest root pocket** (aperture: an oval 160×100 of navy-over-blue) → reveals **chapter 7: an underground room among the roots — the seed-ball and the boot** (a different composition: close, dark, duotone).

---

## Chapter 7 — NOBODY SEES (43.90–51.82 s) — duotone beat (navy + yellow only)

`headline`: **NOBODY SEES**

Sentences: "Because the work you do in the dark, when nobody sees you," (43.90; caption split at "when nobody sees you…" 45.68) · "when life feels difficult and heavy is what creates the success people admire." (47.10; caption split at "is what creates the success people admire later…" 49.30)

**Background.** Underground room: the field navy .8 (no blue in this beat: the dark is navy over paper halftone, still not flat — mottle .5, speckle, mica flecks at 40 %); thick **roots** (navy threads 40–60 u) cross the top of the frame at y −300..−200; strata edges faint (navy .9 bands below y +300).

**Composition.** The **seed-ball** (r 200, paper with navy crack-panels, highlight tone .4 so it reads in the dark) at (−60,+120); the **boot** (cropped navy silhouette 380 long, root-sole, paper tone .3 fill) at (240,+180) facing the ball. Nothing else.

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 43.90 "Because the work you do in the dark" | Ball, boot, roots above | **Touch 1**: the boot draws back 30 u (anticipation 0.15 s), **touches** the ball with the inside of the foot (0.2 s), the ball rolls 40 u left and stops (settle, no bounce), the boot resets (0.4 s). Dust: 4 grains puff. | push 1.00→1.2 centred (60,+140) over 43.9→44.6 s | Ball and boot inside the core square |
| ≈ 44.55 "work" | Same | **Touch 2** (the other way): same anticipation → touch → settle; the ball's crack-panels catch a paper glint on the roll. | hold | — |
| ≈ 45.34 "dark" | Same | The field steps .8→.85; the ball's highlight drops .4→.6; the mica flecks nearest the ball **go out** (paper knockouts fill in, 3 redraws). | hold, 8 u creep | — |
| **exact** 45.68 "when nobody sees you" | Pan up-right along the roots (round, never back) | **Nobody sees**: the camera pans away from the work up the roots into an empty corner (nothing there but roots and one dim fleck), while the touches continue **off-centre**: touch 3 at ≈ 46.24 and touch 4 at 46.9 are heard as small dust puffs at the frame's lower left. | pan +300 x, −300 y over 45.68→46.3 s, then rotate +8° and pan +0 x, +200 y over 46.3→47.0 s (a circular route back down toward the stone, forward only), zoom 1.2 | The ball stays inside the extended sheet (lower-left) — on portrait it is visible; on landscape it is at the edge, its dust still visible |
| **exact** 47.10 "when life feels difficult and heavy" | Pan down to the stone lowering | **Heavy = pressure**: a **navy mass** (cov 1.0 against the field's .85, torn, 320 wide — the duotone's stone) **lowers** from the roots to y −120 above the ball (heavy: slow start, hard stop, 0.5 s); the roots above it **sag** 20 u; the boot's outline **thickens** (heavier line); **touch 5** at ≈ 47.54 is slower (0.45 s) and the ball rolls only 25 u; **touch 6** at ≈ 47.99 the same. | pan −200 x, +200 y over 47.1→47.9 s (arriving at the pressed work), zoom 1.2→1.25 | Mass's underside at y −120, ball at +120: both inside |
| **exact** 49.30 "is what creates the success people admire" | Push on the touch point with the roots at the top | **Consequence of the work**: each touch now leaves a **yellow speck** (tone .15) on the root directly above (touch 7 at ≈ 49.93 "success", touch 8 at ≈ 50.65 "admire"); the specks **accumulate** (six by 51.4) and the roots **thicken** 8 u per touch; the mass lifts 10 u each time. | push 1.25→1.4 centred (0,+40) over 49.3→50.8 s | Roots' undersides at y −200 inside the core square |
| +2.1 (51.40) | Same | The roots above the ball **glow** faintly yellow (tone .3); the ball's highlight returns to .4. | hold | — |
| 51.17→51.82 seam | Push up into the glowing root | Passage below. | push 1.4→2.8 into the yellow-specked root at (0,−220) | — |

**Seam →** Passage through the **yellow-glowing root** (aperture: the root's width 60×140) → reveals **chapter 8: the crown in daylight from inside — leaves, branches, fruit** (a different composition: bright, three inks back, leaf-hands).

Football truth: one inside-of-foot touch, anticipation → contact → roll → stop, repeated with no audience; the ball is cushioned, never struck; pressure is a mass that makes the touch slower, not a symbol.

---

## Chapter 8 — THE FRUIT (51.82–60.34 s)

`headline`: **THE FRUIT**

Sentences: "Later in the light everybody wants the fruit, everybody wants the visible success," (51.82; caption "in the light." 51.82 / "Everybody wants the fruit." 53.86 / "Everybody wants the visible success…" 55.98) · "recognition and results." (57.96; caption "the recognition…" 57.96 / "and the results." 58.70)

**Background.** Inside the crown in daylight: paper bright; the yellow ramp at .35 with the sun's stepped rings at the top-right; **leaf masses** (green overprint blobs 200–300 wide, grainy) crossing; **branches** (navy threads 30 u) with pressure-varied edges; below the frame's lower edge the trunk (navy) descends. Confetti: leaf flecks.

**Composition.** Four **fruit** (red discs r 80 with orange highlights) hanging at (−260,−200), (−40,−300), (200,−240), (380,−80); the **fruit-ball** (a red fruit r 110 with navy panel lines) at (60,+60) on the lowest branch; leaf-hands enter from the edges.

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 51.82 "Later in the light" | Crown, fruit | The yellow ramp **ramps to full** (.35→.5, 0.6 s); leaves **knock out** paper highlights in sequence (light arriving across the crown, left→right); the fruit's orange highlights print. | push 1.00→1.12 centred (0,−120) over 51.82→52.7 s | Fruit at y −300 under the title strip only if zoom > 1.2 |
| **exact** 53.86 "everybody wants the fruit" | Pan down-right to the first hand | The one generic: a **leaf-cluster hand** (three leaves cupped, 320 wide, green overprint) **reaches** up from the bottom-right (anticipation: it draws back 20 u, then rises 0.6 s ease-out, overshoot 15 u); the nearest fruit **drops** into it (0.4 s gravity, squash 10 %, settle); the branch **springs** up 12 u, released. | pan +260 x, +200 y over 53.86→54.6 s, zoom 1.12 | Hand at (380,+260) inside the core square |
| ≈ 54.36 "fruit" | Same | Two more leaf-hands reach from the left edge (0.2 s apart) toward the fruit-ball — the crowd wanting; leaf flecks flutter down. | hold | — |
| **exact** 55.98 "everybody wants the visible success" | Pan down-left with the fruit-ball | The **fruit-ball drops** from its branch (anticipation: the branch dips, then releases; 0.7 s ballistic fall), **lands** in the left hands with a 12 % squash and a 2-bounce settle; a yellow sparkBurst (r 180) — the visible result. | pan −400 x, +160 y and rotate +6° over 55.98→56.9 s, zoom 1.12 | Landing at (−300,+300) above the tray |
| **exact** 57.96 "recognition" | Tilt up to the flecks | **Recognition**: along the top edge the leaf flecks **blink** to paper in sequence (five knockouts, 0.2 s apart, left→right) — the crowd's glints; the branches **sway** toward the hands (settle). | tilt −300 y over 57.96→58.8 s, zoom 1.12 | — |
| **exact** 58.70 "and results" | Same | **Results**: two more **fruit pop** on the branch (0.15 s apart, overshoot); the hands **close** on the fruit they hold (leaves curl, 0.3 s). | hold | — |
| 59.69→60.34 seam | Push into a hanging fruit's red | Passage below. | push 1.12→2.6 into the fruit at (200,−240) | — |

**Seam →** Passage through the **fruit's red disc** (aperture: r 80) → reveals **chapter 9: inside the fruit is a seed — the underground room again, smaller, a season passing above** (a different composition: the ch7 room at a further scale with the sun's arc at the top).

Football truth: the visible result is a fruit-ball caught and shown; it drops from the branch that the unseen touches thickened (ch7's specks are this chapter's light).

---

## Chapter 9 — LONELY SEASONS (60.34–64.73 s)

`headline`: none

Sentences: "But very few people are willing to go through the lonely seasons that create it." (60.34; caption "…endure the lonely seasons…" 60.34 / "that create them." 63.00). Voice ends 64.30; media ends 64.73.

**Background.** The underground room from ch7 at a further scale: strata bands navy .85 over blue .55 (three inks back), mica flecks at 30 %, more roots crossing (their yellow specks now many, tone .3); at the very top edge the **crust** (y −420) with the **sun** as a small yellow disc (r 60) that will cross left→right; three leaves at the top edge.

**Composition.** The **seed-ball** (r 120) at (−60,+140) and the **boot** (240 long) at (140,+180); the ch8 **leaf-hands** withdrawing at the top edge.

| Cue time + words | Composition | Cue action: cause → physical enactment → visible result | Camera key | Phone note |
|---|---|---|---|---|
| **exact** 60.34 "But very few people are willing" | Room; hands at the top | The leaf-hands **withdraw** upward out of frame (0.6 s ease-in); the field steps .8→.85; the mica flecks nearest the top go out. | tilt −120 y following the hands over 60.34→61.0 s, zoom 1.0 | Ball and boot remain in the lower half of the core square |
| ≈ 61.90 "lonely" | Same | **Touch 1** (same as ch7: anticipation, contact, 30 u roll, settle) with 3 grains of dust; no fleck lights. | hold, 8 u creep down | — |
| ≈ 62.33 "seasons" | Pan right with the sun | **A season passes**: the sun disc **crosses** the crust edge left→right (1.0 s, ease-io) and its light ramp on the crust follows; three **leaves fall** through the frame (flutter on twos, 0.8 s, land on the strata); **touch 2**. | pan +200 x over 62.33→63.3 s, zoom 1.0→1.1 | Sun at y −420 visible on portrait; on landscape its ramp on the crust carries it |
| **exact** 63.00 "that create it" | Push on the trunk base and the ball | A root above the ball **thickens into a trunk base** (60→140 u wide, 0.6 s, overshoot) and a **yellow tone .4 spreads up it** (the light it will reach); **touch 3**; at ≈ 63.14 "create" a **new seed** forms at the root's nodule (a navy teardrop 60 tall with a paper highlight — ch1's seed at ch1's scale ratio). | push 1.1→1.25 centred (−20,+40) over 63.0→64.3 s | Trunk base at y −200, ball at +140: both inside |
| 64.30→64.73 (end) | — | No seam. The last redraw at 64.3 leaves the boot in contact with the ball and the seed glinting; the player holds this frame after the media ends (readable ≥ 0.8 s including the hold). | push settles | — |

Football truth: the same touch, alone, through a season; the trunk that thickens above it is the visible result of the invisible work; the new seed says it starts again.

---

## Shapes needed

Shared library (§3): `seed`, `leaf`, `thread(points,width)` (roots, branches), `sun/lantern disc(r, glow)` (with stepped rings), `pressureWalls(gap)` (ch4 strata squeeze), `laneArrow` (the two pulls), `hand(s, angle, open)` (ch8 only, leaf-cluster treatment), `boot(s, angle, mirror)` (ch7/9, root-sole treatment), `ball(s, rot)` (as the seed-ball's crack-panels and the fruit-ball's lines), `field(torn)`, `sparkBurst`, `speedLines`.

Story-specific (author in `lib/paths/riso/stories/grit.ts`):
- `strata(seed, bands[], groundY)` — stacked navy-over-blue bands with torn upper edges, in-band speckle, mica knockouts thinning with depth; `part(x,y,w)` opens a band edge around a root.
- `skyRamp(sunX, sunY, steps)` — three stepped yellow dot-size bands up to the sun.
- `stone(w,h, seed, dirt)` — red torn mass; `dirt` adds the blue speckle overprint (brown).
- `root(points, width, tipPaper, clogs)` — navy thread with a paper growing-tip, optional clog blobs and yellow specks.
- `crust(y, chips)` — torn navy edge with paper chips that can lift and tumble.
- `treePrint(scale, fruitCount, rotation)` — crown lobes + trunk + mirrored roots as one cached drawing (ch2/6).
- `seedBall(r, highlight)` — paper sphere with navy crack-panels; `fruitBall(r)` — red disc with navy panel lines and an orange highlight.
- `bootRoot(s, angle)` — cropped navy boot with a root sole (ch7/9).
- `leafHand(s, angle, open)` — cupped hand made of three leaves (ch8).
- `weightMass(w, drop)` — navy solid mass for the ch7 duotone press.

## What would make this fail (the rejected Astra look)

- A tree icon centred on a flat brown/blue split; strata without torn edges, grain and steps; a flat black "darkness".
- "Resistance / pressure / dirt" without a stone that stops the root, walls that close and thin it, and speckle that clogs it — a label alone is a failure.
- A full-body player kicking, a stadium, a goal frame, a trophy, a scoreboard for "results"; faces or a crowd of figures for "recognition".
- The mirror shown by fading in a flipped copy instead of the camera rotating forward through a full circle.
- Nested arches, a navy channel between two colour fields, diagonal ribbons (reserved for regulate).
- A seam that zooms in then pulls back out; ch6's whole tree must be revealed inside the sun's glow, ch9 inside a fruit.
- Holds > 1.5 s without a redraw; the boot touches drawn as a static loop with no anticipation, roll and settle.

## Delight (bible §4d)

**Touch reaction (≤ 0.8 s, in this story's material):** underground (ch4, 7, 9 and below the ground line elsewhere) a tap **cracks the stratum**: a navy-and-paper zigzag crack 120 u long opens from the touch point (0.15 s) with 4 mica flecks glinting, then **heals** to halftone .3 (0.5 s) and a grain trickles from it. Above ground a tap throws a **spray of five leaves** (green overprint) from the touch point that flutter on twos and fall out of frame (0.7 s). In the ch7 duotone the crack is navy-only and the flecks paper. One reaction alive at a time.

**Secondary motion that follows the main actions:** soil grains (navy/blue speckle, 4–8) trickling whenever a root pushes or a band parts; mica flecks glinting when a root tip passes; crust chips tumbling and landing on the break-through; leaves fluttering on twos after every sway; fruit swinging and settling after a pop or a drop; a branch dipping under fruit weight and springing when released; dust puffs on every boot touch; yellow specks accumulating on the roots above the touches; the trunk's buttress swelling with a small overshoot; the walls' feet piling grains as they close.

## Self-check (muted)

With the sound off: ch1 — a seed lands on the crust and sends one thread down and one up, then each lengthens as the camera tilts with it (two directions). ch2 — a young tree; the camera turns a full circle so the roots read as a crown and the fruit pop where the nodules were (root system mirrors fruit system). ch3 — one trunk, a navy arrow down and a yellow arrow to the sun; roots turn away from the light and drop toward gravity, deflecting round a stone. ch4 — underground: the light leaves the frame, the field closes, a stone stops the root and it flattens and shoves round, strata squeeze it thin, dirt clogs it, and it fights down in three pulses, splitting past the last stone. ch5 — the shoot presses down, breaks the crust, reaches for the sun; the red walls dissolve and its line goes clean (less resistance). ch6 — the whole tree as one settled print, fruit lit, roots matching. ch7, in two inks — a boot repeats one touch on the seed-ball in the dark; the camera pans away to nothing; a mass presses and the touches slow; yellow specks gather on the roots above (the unseen work makes light). ch8 — the crown in daylight: leaf-hands reach, a fruit drops, the fruit-ball falls into the crowd's hands, flecks blink, more fruit pop (everybody wants the fruit). ch9 — inside a fruit is the dark room again: the hands leave, the sun crosses, leaves fall, the touch continues, a trunk thickens above it and a new seed forms (the lonely seasons that create it). Every cue has a drawn consequence; the film explains itself without narration.

## Build ledger (September 20, 2026)

Built as `lib/paths/riso/stories/grit.ts` — **track mode**: `audio:{mode:'track',src:'/stories/films/grit/narration.mp3',duration:64.731375}`. The story's `chapters` are the 22 shipped captions from `lib/paths/gritScript.json` at their media times (each caption start mapped through `lib/paths/gritNarrationTiming.json`; every one is a breakpoint of that table, so the map is exact): 0, 3.68, 6.30, 11.46, 14.26, 17.78, 21.92, 25.50, 26.96, 27.82, 28.06, 28.86, 32.80, 34.66, 39.08, 40.12, 43.90, 47.10, 51.82, 53.86, 55.98, 60.34. Headlines ride on the caption chapters inside their visual chapter (Downward, Break through, Nobody sees, The fruit). The nine visual chapters run on `VS=[0,6.3,14.26,21.92,32.8,39.08,43.9,51.82,60.34]` (all sentence onsets in `recording-alignment.json`; `narration-cues.json` was NOT used for timing — its word onsets were only mapped through the timing table to place mid-sentence beats such as "mirrors" 8.27, "breaks" 33.80, "fight" 31.03, "lonely" 61.90).
Because the engine's `playChapters` would run a passage at every caption seam, `story.draw` plays the visual chapters itself with the same contract: arrival scale via `passageArrival`, `forwardPassage` into the next scene over the last .65 s of each visual chapter, reduced-motion stills. Engine work-around (reported): the player re-seeds the registration offset per *caption* index (`press(f.chapter)`), so the story eases `sheet._passage.blend` across the last min(.65 s, caption length) of every caption chapter; caption seams are pixel-exact and the registration never pops mid-visual-chapter.
Story-specific shapes: `strata` (blue + navy stepped bands with torn edges, mica flecks thinning with depth, `close` darkens a step), `crust` (torn navy edge with paper chips that lift and tumble), `skyRamp` (three stepped yellow bands + the sun's stepped rings), `stone` (paper knocked out beneath a red torn mass; `dirt` = blue speckle → brown), `root` (navy thread with a paper halo, paper growing-tip, clogs, yellow specks, glow), `leaf`/`shoot` (blue + yellow on one path = green), `seedShape`, `seedBall`, `fruit`, `fruitBall`, `bootRoot`, `leafHand`, `treePrint`, `grains`, `mica`.

Gates: typecheck clean · review (`review-riso-story.mjs --id grit`, works in track mode): 129 samples, 21/21 caption seams pixel-exact, zero errors, maxOps 296 (a passage frame) · perf 390×850 DPR 1.5: median 3.3 ms, p95 16.5 ms, max 19.6 ms, ops median 88 · live app: `scripts/check-riso-grit.mjs` (a copy of the chapters-mode checker adapted for track mode: opens 9v9 → "Story: Not yet is a starting point.", asserts the riso player, seek slider instead of chapter dots, seeks to each visual chapter for a screenshot, pause sleep, touch burst then sleep, a 22-paragraph transcript, close cleanup): PASS at 390×850, 320×568, 844×390, 1440×850.
Screenshots: `/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso/grit/app-grit-<w>x<h>-ch1..9.png`, `-touch.png`; frame dumps in `/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso/grit/frames/`; contact sheet `/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso/review/grit.png`.

Art-director pass: after the first render the seed was tiny, stones and the pressure walls printed as mud over the navy strata, roots and the boot vanished into the dark and the yellow arrow was lost on the yellow sky. Fixes: ch1 camera ×1.45–1.8, paper knocked out beneath every stone and wall, a paper halo on every root, the boot printed as paper with navy tone and a heavier contour, the sun arrow given a navy edge, the ch2 tree scaled 1.25.
Deviations: ch4's strata squeeze is drawn with two hand-cut red walls (paper beneath) instead of the library's `pressureWalls` (which would overprint mud); the first "new print" beat of ch6 is emulated by sliding the whole drawing 2–6 units over four twos-frames; ch7's camera pans away twice (up the roots, then round to the stone) rather than a single circular route.
Self-critique: (1) ch1's two directions read but the root hair is thin at 320×568; (2) the eight boot touches in ch7 are the same anticipation → contact → roll pattern — the mass slows them but a muted viewer may not count them; (3) the ch8 crown is dense and lively but the leaf-hands are leaf clusters first and "hands" second.

## Fix ledger (September 20, 2026 — kid-legibility pass, bible §1c + ENGINE §10 adoption)

**Track mode via the engine.** `story.visualChapters` declares the nine visual chapters (start, 1–2 word headline, label) and `draw(f){const v=trackChapters(story,f);playChapters(v.story,v.frame,SCENES);}` replaces the hand-rolled visual-chapter player and the `sheet._passage.blend` workaround; caption chapters carry only text (their per-caption `headline` field is gone — the headline now belongs to the visual chapter). Headlines: DOWNWARD · BREAK THROUGH · NOBODY SEES · **EVERYBODY WANTS** (was THE FRUIT).

**Legibility.** People are **abstract riso figures** (the shared `figure()` helper, copied in): paper knockouts tinted yellow in the two dark rooms, navy in daylight. The practice ball is **`gritBall`** — a real football (paper, navy panels, ONE yellow panel, scuff marks); the seed stays a seed and the fruit are **fruit** (`fruit()`: paper knocked out under a red disc with a yellow overprint, a paper highlight, a navy stem and one green leaf — no more navy dots on green). ch3's navy down-arrow is now paper-white. The root-soled boot, the leaf-hands and the fruit-ball are deleted.

| Ch | What changed | Kid test — "a 9-year-old would say…" |
|---|---|---|
| 1 Seed | unchanged | "A seed falls and grows a root and a shoot." PASS |
| 2 Mirror | fruit are now orange fruit with stems and leaves; the mirror-axis flash is a paper ribbon (the flat band produced a 1-value seam diff) | "The tree turns upside down and the roots look like the branches." PASS |
| 3 Two pulls | the down arrow prints paper-white | "A white arrow down and a yellow arrow up to the sun." PASS |
| 4 Downward | unchanged | "The root gets squeezed between the red walls." PASS |
| 5 Break through | unchanged | "The plant breaks out and reaches for the sun." PASS |
| 6 The picture | fruit as fruit | "A tree full of oranges." PASS |
| 7 Nobody sees | **A player practises alone in the dark**: a yellow-paper figure at the left, a navy strata wall at the right; four kick → wall → return → control cycles on the old tap timings (anticipation, ball squash on the wall, paper dust, settle on control), the pressing mass and the yellow specks on the roots as before; the camera never leaves the player (the empty-frame pan is gone). | "A kid practising kicking a ball against a wall on his own in the dark." PASS |
| 8 Everybody wants | leaf-hands → **three navy figures rise from below with arms up** (anticipation, overshoot); a hanging fruit drops, then the big fruit falls into the middle figure's hands with a yellow burst; more fruit pop. Trunk moved left so nobody stands on it. | "Everyone's reaching up for the oranges and one kid catches the big one." PASS |
| 9 Lonely seasons | the same figure **sits against the wall with the ball between the feet**; the sun crosses the crust and lets paper through (the frame brightens .15 → .45 and the root specks glow up to .6, so the story ends lighter than ch7); leaves fall; the figure stands and keeps kicking against the wall. | "He sits on his own for a bit, then gets up and keeps practising while the leaves fall." PASS |

Gates: `npm run typecheck` clean · `review-riso-story.mjs --id grit` → 42 samples on the 9 visual chapters, 8/8 seams pixel-exact, 0 errors, maxOps 358 (passage frames) · `riso-perf.mjs`: median 4.0 ms, p95 15.9 ms, max 17.9 ms, ops median 98 · `check-riso-grit.mjs` PASS ×4.
Screenshots: `…/scratchpad/riso/fix/grit/app-grit-<w>x<h>-t*.jpg` (+ `strip-390.jpg`); cue frames `…/scratchpad/riso/frames/grit/strip-ch7..9.jpg`, `mix.jpg`.
Known limitations: the passage frames peak at 358 ops (two full scenes with paper figures); the ch8 trunk sits between the reaching figures at 390 — acceptable; the shared halftone moiré on the navy rooms is the engine's.
