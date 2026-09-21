# woven-court — "The Woven Court" (Futsal, trust and shared responsibility)

Storyboard per RISO_BIBLE §8 (with §1b texture/uniqueness, §4b motion and §4c headline rules). Written 20 Sep 2026 before any drawing. Sources: narration/labels `lib/paths/films/futsal.ts` (`woven-court` beats), cue onsets `lib/paths/films/phraseFilmScores.ts["woven-court"]`, chapter seconds `narrationTiming.json` → `[9.267, 10.067, 8.767, 11.667, 11.067, 9.165]`. Audio `/stories/narration/futsal/woven-court/{01..06}.m4a`, unchanged.

## Conventions used below

- World units: short side = 1080, chapter centre `(0,0)`, x right, y down. `cam(x, y, zoom, rot°)` puts world `(x,y)` at the centre of `sheet.safe`; zoom 1 = 1080 units across the safe region's short side.
- **Core box** `±480 × ±420` is visible on every viewport (390×850, 320×568, 844×390, 1440×850). Everything that must read (knot-ball, thread heads, knots, the tear, shuttles) lives inside it at every camera key. Fields, lattice and secondary threads extend to `±1300` so no paper edge shows on portrait. On landscape the title/headline band covers roughly `y < −400` at zoom 1; nothing important sits above `y = −400`.
- Cue `at` values are the shipped word onsets (three per chapter). "Follow-through" rows are consequences of the cue in front of them. No audio is added.
- Every cue cell is written as **Antic → Action → Settle → Consequence** (§4b). Drawn objects update on twos; camera, light and passages on ones. When nothing is spoken a **moving hold** continues the last force as a decaying sway (never idle wobble). Registration re-seeded per chapter. Seam passage = last 0.65 s of each chapter.
- `thread(points, width)` is the workhorse: a pressure-varied ribbon with occasional gaps, never a 2 px vector line. Every thread head carries a knockout "eyelet" (paper disc r=8) so direction reads.
- **Headline** (§4c): at most one or two words, only where a chapter has one idea the viewer must keep (an instruction or a force); chapters 2 and 6 show none. HTML overlay in `IslandLoadingBrush`, cream with navy echo, at the top of the safe region; it pops in with a misregistration settle and leaves off-register (CSS). Nothing is lettered on the canvas.

## Lead imagery (the metaphor objects that carry the story)

**Threads, knots, a loaded weave, loom shuttles, a torn cloth, a knot-ball.** Every football object is drawn in thread:

| Football thing (only when the narration names it) | Drawn as |
|---|---|
| Ball | **knot-ball**: a paper sphere wound with navy thread in a 5-panel pattern (panel seams are thread; a knot where seams meet), r=150 in ch 1, r=110 on court chapters, r=90 in ch 6 |
| Player ("after passing", "one player moves", "recover") | **shuttle**: a loom shuttle (pointed boat shape 150×60, navy contour, tone 0.6 in the player's colour) that *carries* its thread — the thread trails from its tail |
| Pass | the knot-ball running along a thread pulled taut between two shuttles (0.65–0.8 s); the receiving shuttle **cushions** by letting its thread go slack 20 u |
| Pressure / opponent | **snag**: yellow torn field that catches threads (where it lies over a thread the overprint shows: yellow×blue = green, yellow×pink = orange = "a snagged thread") |
| Goal ("space near goal") | the **loom frame**: a navy rectangular frame 390×120 whose net is a fine weave (blue warp/pink weft at 20 u pitch) |
| A call ("an angle and a call", "communicate") | a **plucked thread**: the thread is plucked (snaps 30 u sideways) and vibration rings (`ripple`, paper knockout) travel along it to the other shuttle |

No eye, ear, hand or speech bubble is used anywhere in this story (generic count: 0). Lead imagery not used by any other story in this path: chalk-line leads with chalk marks on a dusty court; kite-turned with kite/string/wind streaks/sail angle; futsl with the court surface itself shrinking and expanding, a clock hand and tight walls. None of those uses threads, knots, shuttles, snags, a cloth tear or a woven loom frame.

## The one metaphor: woven thread

A single strand under load stretches and frays; a weave shares the load at its **crossings**, and in riso a crossing is literally a new colour: pink × blue = **purple**. Connection is where two colours overprint. The world is one **woven court**: the futsal court is a cloth, its lines are warp and weft, the goal is a loom frame with a woven net, and a pass lane is a thread pulled across the cloth.

| Ch | Where in the woven court | Scale | What the metaphor does | Headline |
|---|---|---|---|---|
| 1 | One strand across the sheet, knot-ball hanging from it | 1× (strand 28 u) | One strand carries the whole weight, sags and frays | SHARE |
| 2 | Inside the strand's fibre: a weave of 5 × 4 threads | 4× (threads 34 u) | Crossings print purple; load spreads; one strand alone stretches | — (the purple knots carry it) |
| 3 | Inside a purple knot: the centre circle of the court | 1× court | Pass lanes are threads; the passer's thread keeps going; a call is a plucked thread | MOVE |
| 4 | Inside the plucked thread's vibration ring: the attacking half | 1.3× court | Two threads swap jobs; the weave re-patterns | NEXT JOB |
| 5 | Inside the knot-ball's seam knot: the court at night, possession lost | 1× court, duotone opening | The cloth tears (distance); recovery re-knots it in front of the loom frame | RECOVER |
| 6 | Inside the loom frame's net: the whole cloth seen flat | 0.6× cloth | Loom bars pull the cloth taut; the knot-ball drops and the **whole** weave catches it | — (the catch is the idea) |

Later chapters revisit earlier places at another scale: ch 6's centre knot is ch 2's centre crossing (seed `K0`) at 0.6×; ch 5's court is ch 3's court from the other end; ch 6's cloth is ch 1's strand from far enough away to see it was always part of a weave.

## Background world: the loom lattice (unique to this story)

Construction (all chapters): a **weft/warp lattice** of broad grainy ink bands — vertical **warp bands** (blue, coverage stepped 0.18 / 0.26 alternating band by band, speckled grain in the ink, edges slightly wavy from `wob`) crossed by horizontal **weft bands** (pink, same stepped coverage). Where a warp band crosses a weft band the overprint prints a **purple lattice cell**, so the background is a soft grainy plaid of paper / blue / pink / purple. Loose **fibre confetti** (cream knockout flecks 20–40 u and a few blue flecks) drifts in the lattice as the secondary accent. Torn / hand-cut edges belong to the yellow **snag fields** and to the ch 5 **cloth tear**, never to the lattice. The lattice **changes pitch and orientation with the chapter** (260 u in ch 1, 120 u inside the fibre in ch 2, 340 u at court scale, rotated with the camera in ch 5, 60 u dense in ch 6) — one world seen closer or farther; the chapter's drawn threads are the *solid* version of the same lattice (band → thread). Night (ch 5) is the lattice under a navy 0.7 grainy field with the court lines knocked out. **The lattice itself reacts to force** (§4b): when the weave is loaded the background bands bow with it (half amplitude, one drawn frame late). No nested arches, no navy channel, no diagonal ribbons in this story.

How this background differs from the other futsal stories: chalk-line uses a dusty chalk court surface with stepped court markings; kite-turned uses wind-streaked sky bands over a torn horizon; futsl uses a painted hardwood court surface (plank bands and painted lines) that expands into a wide field. Only woven-court has a two-direction lattice with overprint cells.

## Inks and role colours

Triple: **pink `#ff48b0`, blue `#0078bf`, yellow `#ffe800`** + navy `#22366b` (key). Print order yellow → blue → pink → navy. Paper `#f0ece2`. (Futsal path uniqueness: kite-turned uses blue/yellow/green, futsl uses pink/blue/green; the remaining triple pink/yellow/green is free for chalk-line.)

| Role | Ink / treatment |
|---|---|
| Knot-ball | paper sphere, navy thread seams (width 8) in a 5-panel layout, one knot per seam junction; has mass: falls fast, bounces once |
| **You / your thread** | pink thread 28–34 u, seed `T-you`, tone 0.85 with solid rim; your shuttle = pink tone 0.6 + navy contour |
| Teammates / support | blue threads 30 u; blue shuttles |
| Pressure / opponent | yellow snag fields, torn edges, tone 0.7; overprint stains (green / orange) where they lie on a thread; snags are heavy: they accelerate slowly and stop with a shove |
| The metaphor material | the threads and their **purple** crossings (pink × blue at cov 1.0 in knots) |
| Court lines, loom frame, lanes | navy stroke 9–14 u pressure-varied; in ch 6 the court lines are navy threads |
| Background | the loom lattice above |

Duotone beat: chapter 5, seconds 0–5.98, prints **navy + yellow only** (loss and pressure). The pink and blue plates return at 5.98 "recover" — the return of the inks is the recovery.

---

## Chapter 1 — "Share the weight" (9.267 s) — headline **SHARE**

Narration: *Do you feel you have to fix everything yourself? On a team, responsibility can be shared. You still matter. So does everyone else.*

Background: loom lattice at pitch 260 u (warp blue / weft pink, stepped 0.18/0.26, grainy), fibre confetti 12 flecks drifting up-left at 15 u/s. A **yellow torn snag field** (tone 0.65, mottle 0.4, hand-cut top edge) fills the bottom third from `y=+300` to `+1300`, its edge rising to a peak at `(0,+220)` — the weight that pulls.

Composition at t=0: one **pink strand** (width 28) will span `(−620,+380)` → `(+620,−300)` — not yet drawn. Two slack **blue threads** curl at the frame edges: coiled r=80 at `(−640,−220)` and at `(+620,+300)`. Knot-ball r=150 waits above the frame at `(0,−700)`.

| t + words | Composition (what fills the frame) | Cue action: Antic → Action → Settle → Consequence | Camera key | Phone note |
|---|---|---|---|---|
| 0.00 "Do you feel" | Lattice, yellow snag field below, two coiled blue threads | **Antic** 0.2 s: a navy knot dot at `(−620,+380)` tightens and the strand's first 40 u pulls back left. **Action**: the pink strand self-draws left → right with the tip leading (0.6 s ease-out), whipping past its end point by 30 u. **Settle**: tip recoils to `(+620,−300)` (0.2 s). **Consequence** (0.9): the knot-ball, heavy, drops from `(0,−700)` (0.4 s, ease-in) onto the strand's middle; the strand *sags* into a V of 120 u at `(0,+60)` (deforms under mass), overshoots 30 u, bounces once and rests; the lattice bands under it bow 15 u a frame late | push `cam(0,0,0.85)` → `cam(0,20,1.0)` over 1.2 s; on the ball's landing the camera dips 20 u and recovers (leans into the weight) | strand ends leave the core box; the V and ball are at centre on every viewport |
| 1.9 follow-through "fix everything yourself" | Same | **Antic**: the snag field's torn peak dips 20 u. **Action**: the peak *pushes up* 140 u into the ball's underside (0.6 s, ease-in-out): the pressure mass meets the ball, the ball squashes 6 % vertically, the strand thins 28 → 18 u at the V and its edge wobble doubles (fray); where yellow lies over pink the overlap prints **orange**. **Settle**: the peak holds against the ball with a residual 8 u pulse. **Consequence**: the two coiled blue threads twitch once at the strand's strain | hold `cam(0,20,1.0)` with a 1 % creep in zoom (the hold has weight) | orange stain at `(0,+130)`, centre |
| 3.98 "responsibility can be shared" | Two blue threads uncoil | **Antic** 0.2 s: each coil winds tighter by a quarter turn. **Action**: both blue threads *uncoil and travel* toward the strand, tips leading along a curve (0.7 s ease-out), and **physically join** it at `(−260,+190)` and `(+240,−60)`: each tip loops once around the pink strand. **Settle**: the loop cinches (0.15 s overshoot). **Consequence**: at each loop a **purple disc** r=46 prints (pink×blue at cov 1) and a navy knot loop draws; the load is now carried by three threads: the V sag eases 120 → 50 u (0.5 s), the ball un-squashes, the snag peak is pushed back down to `y=+300`, the orange stain shrinks to nothing | pan `cam(0,20,1.0)` → `cam(−120,100,1.05)` over 0.9 s (dragged by the first thread, a beat late), then → `cam(80,−20,1.05)` over 0.9 s (the second) | both knots inside `±300`; the ball never leaves the core box |
| 7.22 "So does everyone" | Four threads, straight strand | **Antic**: the strand dips 15 u as if bracing. **Action**: a third and fourth blue thread enter from top `(−80,−700)` and bottom `(+120,+700)`, travel (0.6 s) and loop the strand at `(−80,−30)` and `(+120,+10)` → two more purple knots. **Settle**: the strand straightens with an overshoot upward of 25 u and settles to sag 10 (0.5 s); the ball rises with it to `(0,−20)`, a knockout highlight prints on its top-left panel. **Consequence**: two confetti flecks settle onto the new knots; the lattice bands relax straight | push `cam(80,−20,1.05)` → `cam(0,−20,1.3)` over 1.4 s (isolate the shared strand) | at zoom 1.3 the four knots span `±290` — visible at 320×568 |
| 8.62–9.267 seam | | | | |

**Seam:** Passage through the **pink strand's fibre** (aperture: a rounded lozenge 300×110 along the strand at `(0,−20)`, rotated to the strand's angle) → reveals inside it a **different composition**: the strand is itself made of threads — the 5 × 4 weave of ch 2 at 4×, the lattice at 120 u pitch, no ball, no snag field.

Football truth: one player trying to fix everything is a strand under load; a team shares the load. Not yet a play — the premise. The blue threads arrive at angles to the strand (support offers an angle, not the same line).

---

## Chapter 2 — "Strength through connection" (10.067 s) — no headline

Narration: *Think of woven threads. Their strength comes from the places they connect. Support spreads the load instead of leaving one strand stretched tight.*

Background: loom lattice at pitch 120 u (inside the fibre: dense, finer-grained), stepped 0.14/0.22 so the solid threads read over it; confetti 8 flecks, slow.

Composition at t=0: **Warp**: 5 vertical blue threads (34 u) at `x = −400, −200, 0, +200, +400`, `y = −1300 … +1300`. **Weft**: 4 horizontal pink threads (34 u) at `y = −300, −100, +100, +300`. Under/over alternation via a 40 u knockout gap on the "under" thread at each crossing. At t=0 threads are cov 0.6 so crossings are dull purple. Centre crossing `(0,+100)` = seed `K0` (reused in ch 6).

| t + words | Composition (what fills the frame) | Cue action: Antic → Action → Settle → Consequence | Camera key | Phone note |
|---|---|---|---|---|
| 0.00 "Think of woven" | Weave draws on | **Antic**: each warp thread's tip pulls back 20 u above the frame. **Action**: warp threads self-draw top → bottom, tips leading (0.6 s ease-out, staggered 0.08 s left → right), then weft threads left → right (0.6 s, staggered 0.1 s), each *passing under and over* the warps (knockout gaps appear as each crossing completes). **Settle**: each thread overshoots 20 u past the frame edge and recoils. **Consequence**: the lattice bands behind align to the threads' pitch (one drawn frame late) | pan `cam(−200,−300,1.0)` → `cam(0,0,1.0)` over 1.6 s, following the drawing tips | the central 3×2 crossings `(±200, −100…+100)` sit inside the core box |
| 3.02 "places they connect" | Knots brighten | **Antic**: all threads tense (width 34 → 30 for 0.15 s). **Action**: every crossing *cinches* outward from centre (stagger 0.06 s): thread cov 0.6 → 1.0 inside r=46 (the **purple** goes vivid) and a navy knot loop draws around it, the two threads visibly pulling into each other 6 u. **Settle**: each knot overshoots to r=52 and settles to 46. **Consequence**: the weave as a whole tightens — every thread straightens by 8 u, the plaid cells behind sharpen | push `cam(0,0,1.0)` → `cam(0,−100,1.35)` over 1.2 s (into the brightest knots) | nothing important outside `±360` at zoom 1.35 |
| 5.0 follow-through "spreads the load" | Three weights land | **Antic**: three navy weights (grainy discs r=40) appear above frame and hang for 0.15 s. **Action**: they drop with gravity (0.4 s ease-in, staggered 0.15 s) onto crossings `(−200,−100)`, `(0,+100)`, `(+200,−300)`; each landing *presses* its crossing down 30 u (the threads deform into a local V). **Settle**: the weights bounce 10 u and rest. **Consequence**: each dip **travels along both threads** as a 0.5 s wave (amp 30 → 8) into the neighbouring crossings and the lattice bows behind: the load is visibly shared; no single thread thins | rotate `cam(0,−100,1.35,0°)` → `cam(0,0,1.3,−6°)` over 1.4 s (rolls with the travelling wave) | weights land inside `±220` |
| 7.08 "one strand stretched" | One pink weft alone | **Antic**: the warp threads flicker to cov 0.8 for 2 drawn frames. **Action**: warp and three wefts *let go* (cov → 0.25, 0.4 s) — only the weft at `y=+100` stays solid; the three weights *slide* along the fading threads onto it (0.5 s, ease-in) and it **stretches under the mass**: width 34 → 14 at centre, sag 160 u, fray ×3, a navy hairline crack at `(0,+260)`. **Settle**: the strand hums (residual 6 u sway). **Consequence** at **8.3** ("instead of"): the warp returns to cov 1.0 (0.5 s), the weights redistribute along it (0.4 s), the strand relaxes to width 30 with an upward overshoot of 25 u and sag 10 — the crack closes | pan `cam(0,0,1.3,−6°)` → `cam(0,100,1.3,−6°)` over 0.9 s, dropping with the sag; at 8.3 the camera lifts 40 u with the relief | the stretched centre `(0,+260)` is inside the core box in both orientations |
| 9.42–10.067 seam | | | | |

**Seam:** Passage through the **purple centre knot** at `(0,+100)` (aperture circle r=120) → reveals inside it a **different composition**: the knot is the **centre circle of a futsal court** from above (ch 3), lattice at 340 u pitch behind navy court lines, shuttles and a knot-ball.

Football truth: load spreading is team shape — when one player is under pressure the players around take up the work (offer passes, cover space). The wave through neighbouring crossings is that; the lone strand is a player isolated with no options.

---

## Chapter 3 — "Make help visible" (8.767 s) — headline **MOVE** (arrives at 3.46 "After passing", the instruction to keep)

Narration: *In futsal, trust grows through clear actions. After passing, move into view. Give your teammate an angle and a call.*

Background: loom lattice at pitch 340 u, stepped 0.16/0.24; the court floor *is* the lattice (the cloth), navy court lines printed over it; confetti 10 flecks.

Composition at t=0: half court from above: navy thread lines width 10 (touchlines `x=±540`, halfway `y=+520`, D at top, centre circle r=170 at `(0,+300)`); the **loom frame** goal 300×90 at `(0,−520)` with woven net. **Knot-ball** r=110 at `(−180,+160)`. **Your shuttle** (pink) at the ball, its thread trailing off-frame to `(−600,+700)`. **Teammate shuttle** (blue) at `(+220,+40)`, thread trailing right. **Snags** (yellow torn): 240×160 at `(+40,−120)` and 200×140 at `(−320,−60)`, between ball and goal.

| t + words | Composition (what fills the frame) | Cue action: Antic → Action → Settle → Consequence | Camera key | Phone note |
|---|---|---|---|---|
| 0.00 "In futsal" | Court draws | **Antic**: the centre circle's thread tip pulls back 20 u. **Action**: court lines self-draw outward from the centre circle, tips leading (0.6 s ease-out); the knot-ball drops in from above and lands at `(−180,+160)` with one bounce (0.5 s); shuttles slide in from below and stop with a 15 u overshoot. **Settle**: the loom frame's net weaves in (0.3 s, warp then weft). **Consequence**: the lattice bands under the ball's landing dip 10 u | pan `cam(0,300,1.0)` → `cam(−100,120,1.05)` over 1.2 s (centre circle → ball) | goal at `y=−520` sits above the core box; context here, it returns large in ch 5 |
| 1.4 follow-through "clear actions" | Same | **Antic**: the blue shuttle rocks back 15 u. **Action**: it *checks toward the ball* 60 u (0.3 s ease-out) then away (0.3 s) — a visible signal. **Settle**: its trailing thread whips and settles (0.3 s). **Consequence**: the snag at `(+40,−120)` *pushes* 80 u toward the ball (heavy: 0.6 s ease-in) and stops with a shove; the lattice bands ahead of it compress 6 u | hold `cam(−100,120,1.05)` with a 30 u lean toward the snag | — |
| 3.46 "After passing" | Pass, then the passer keeps moving | **Antic** 0.2 s: the pink shuttle draws its thread taut to the blue shuttle and dips back 20 u. **Action**: the knot-ball *runs along the taut thread* `(−180,+160)` → `(+220,+40)` (0.7 s, ease-in-out, seam knots rotating). **Settle**: the blue shuttle **cushions** — its thread goes slack 20 u and the ball stops 10 u short, rolls back to the shuttle's point (0.2 s). **Consequence** (4.2): the pink shuttle *keeps travelling*: `(−180,+160)` → `(−140,−40)` → `(−60,−240)` (0.8 s ease-out, `speedLines`, a 20 u overshoot at the end), laying its thread — the passer moves into view; a paper knockout wedge (the receiver's sightline, apex at the blue shuttle, 30° wide) opens toward the pink shuttle as it arrives | pan `cam(−100,120,1.05)` → `cam(80,20,1.05)` over 0.8 s (dragged by the ball a beat late) | pink shuttle `(−60,−240)` and blue shuttle `(+220,+40)` inside the core box |
| 6.24 "an angle and a call" | Plucked thread + taut lane | **Antic**: the pink shuttle pulls the thread now stretched between the shuttles 30 u sideways (0.15 s). **Action**: it lets go — the thread *snaps* back and vibrates (2 drawn frames of 30 u zig-zag) and three **vibration rings** (paper knockout `ripple`, r 30 → 120, one per 4 drawn frames) *travel along it* to the blue shuttle (0.6 s). The thread lies beside, not through, the snag: the angle is open. **Settle**: the rings fade at the blue shuttle. **Consequence** (7.1): the ball **returns** along the plucked thread (0.7 s), the pink shuttle cushions; the snag *lunges* 100 u toward where the ball was (0.5 s ease-in) and stops on empty cloth with a shove | push `cam(80,20,1.05)` → `cam(−20,−140,1.3)` over 1.0 s (toward the vibrating thread); a 10 u camera shake on the pluck | the ring nearest the pink shuttle ends at `(−60,−240)`: inside the core box at zoom 1.3 |
| 8.12–8.767 seam | | | | |

**Seam:** Passage through the **last vibration ring** on the plucked thread (aperture: circle r=120 at `(−60,−240)`) → reveals inside it a **different composition**: the attacking half of the court at 1.3× with **two threads side by side** and two snags with a gap in front of the loom frame (ch 4).

Football truth: pass and move; the receiver's cushion takes 0.2 s; support offers an *angle* (not a line through the defender) and the call comes with the movement — trust is built by visible actions. The snag closing on the previous ball position is correct defensive behaviour.

---

## Chapter 4 — "Notice the next job" (11.667 s) — headline **NEXT JOB**

Narration: *Shared responsibility means noticing what the moment needs. One player moves forward. Another offers support behind. Your jobs can change with the play.*

Background: loom lattice at pitch 340 u seen at 1.3× (≈ 440 u on screen), stepped 0.16/0.24; the D-arc and goal line printed as navy thread; confetti 8 flecks.

Composition at t=0: attacking third: **loom frame** 390×120 at `(0,−480)`; **pink shuttle** (you) at `(−120,+120)` with the knot-ball r=110, thread trailing down off-frame; **blue shuttle** at `(+140,+140)`, thread trailing down. **Snags**: two yellow torn fields spanning `x=−700…−110` and `+110…+700` at `y=−260 ± 70` (`pressureWalls(gap=220)` in yellow), parked at `x` offsets ±600 at t=0.

| t + words | Composition (what fills the frame) | Cue action: Antic → Action → Settle → Consequence | Camera key | Phone note |
|---|---|---|---|---|
| 0.00 "Shared responsibility" | Snags push in | **Antic**: both snags retreat 30 u outward. **Action**: they *push in* from ±600 (0.6 s ease-in, heavy) and stop with a shove, leaving the gap at `(0,−260)`; the lattice bands between them crumple (wob amplitude ×2 for 0.4 s) and the two threads bend 20 u away from the snags. **Settle**: the snag edges shiver 6 u. **Consequence**: a "noticing" pulse runs from the ball along both threads (width 34 → 44 → 34, 0.5 s) | push `cam(0,0,1.0)` → `cam(0,−80,1.1)` over 1.0 s (toward the gap); the camera leans 15 u toward whichever snag is moving | gap at `(0,−260)`; the loom frame's top bar may sit under the landscape headline — acceptable, the gap is the subject |
| 2.0 follow-through "what the moment needs" | Same | **Antic**: both shuttles rock back. **Action**: two navy dashed lanes *grow* from the shuttles, tips leading (0.5 s): blue's lane through the gap to `(+60,−420)`, pink's lane back to `(−200,+220)`. **Settle**: lane tips overshoot 15 u. **Consequence**: the gap between snags widens 20 u as if the lane pried it | hold `cam(0,−80,1.1)`, 1 % zoom creep | — |
| 4.24 "One player moves" | Blue forward, pink back | **Antic** 0.2 s: the blue shuttle dips back 25 u. **Action**: it *races through the gap* to `(+60,−420)` laying thread (0.8 s ease-out, smear on twos, 30 u overshoot); the pink shuttle drops back to `(−200,+220)` (0.6 s). **Settle**: blue recoils to its mark. **Consequence** (5.3): the pink shuttle pulls its thread taut through the gap and the ball runs along it (0.75 s); blue cushions (thread slack 20 u). The snags *collapse toward the ball* (inner ends push 90 u toward `(+60,−420)`, 0.5 s ease-in) and now lie over the blue thread: green overprint stains appear where they press it, and the thread bends 15 u under them | pan `cam(0,−80,1.1)` → `cam(40,−260,1.1)` over 1.0 s (pulled by the blue shuttle, a beat late) | blue shuttle at relative `−160`: safe |
| 8.64 "Your jobs can change" | Roles swap, colours do not | **Antic**: the blue shuttle, pressed on both sides, twists a quarter turn back. **Action**: it pulls its thread taut **back** to pink and the ball runs to `(−200,+220)` (0.7 s, 9.4); the forward dashed lane *travels* from blue to pink (0.4 s) and the pink shuttle runs forward along the left touchline to `(−40,−120)` (0.8 s ease-out, overshoot 20 u) while blue drops back to `(+160,+200)` (0.6 s). Thread colours never change — only the lanes (the jobs). **Settle**: both shuttles rock and stop. **Consequence** (10.3): the ball runs the taut pink thread to `(−40,−120)` (0.6 s) and is cushioned in front of the gap; the snags, having pressed the wrong thread, ease off the blue thread (green stains vanish) | rotate+pan `cam(40,−260,1.1,0°)` → `cam(−60,−60,1.15,+8°)` over 1.4 s (rolls with the lane's travel) | both shuttles inside `±260`; eyelets and shuttle points show direction at 320×568 |
| 11.02–11.667 seam | | | | |

**Seam:** Passage through the **knot-ball's navy seam knot** (aperture: the knot where three seams meet on the ball at `(−40,−120)`, circle r=40) → reveals inside it a **different composition**: the court at night — a heavy navy grainy field over the lattice, court lines knocked out, the ball gone to the other side (ch 5).

Football truth: in futsal roles rotate constantly — the player who runs beyond becomes the one under pressure and plays back; the supporting player becomes the forward option. Support behind is a real futsal position. Pressure closes to the ball both times.

---

## Chapter 5 — "Respond together" (11.067 s) — headline **RECOVER**

Narration: *When possession is lost, blame adds distance. A helpful response brings you together: recover, protect space near goal, and communicate the next job.*

Background (**duotone: navy + yellow only until 5.98**): the loom lattice rotated with the camera (+7° by 2.7 s), printed *under* a **navy grainy night field** at tone 0.7 with mottle, paper showing through the speckle; court lines are **paper knockouts** (width 10); pink/blue plates unprinted, so only the navy field's varying density hints the plaid. Confetti: 6 cream flecks.

Composition at t=0: defending half, own **loom frame** 390×120 at `(0,+460)` (net in knockout weave), centre circle at `(0,−300)`. The two threads are drawn but printed **in navy only**: shuttle contours at `(−60,−40)` (you) and `(+60,−20)` (teammate), 120 u apart. Knot-ball r=110 at `(0,−60)`. **Yellow snag** (tone 0.8, torn) at `(+420,−80)` entering from the right.

| t + words | Composition (what fills the frame) | Cue action: Antic → Action → Settle → Consequence | Camera key | Phone note |
|---|---|---|---|---|
| 0.00 "When possession is lost" | Night court, two grey shuttles, yellow snag | **Antic** 0.2 s: the snag rears back 30 u. **Action**: it *lunges* and **catches the ball**: the ball is dragged `(0,−60)` → `(+380,−80)` (0.5 s ease-in) inside the snag's torn edge, the ball squashes 8 % against it. **Settle**: the snag stops with a shove; the ball rattles inside it (2 frames). **Consequence**: the two shuttles are left pointing at empty paper, their threads *slack and drooping* 40 u (loss = something slips); the knockout court lines pulse once | pan `cam(0,0,1.0)` → `cam(120,−40,1.0)` over 0.6 s (yanked after the ball, then a 15 u drop) | ball at `+380` is `+260` relative: inside |
| 1.70 "blame adds distance" | Shuttles pull apart; the cloth tears | **Antic**: both shuttles jerk 20 u *toward* each other. **Action**: they *pull apart* (0.8 s ease-in): you to `(−330,+40)`, teammate to `(+330,−60)` — gap 120 → 660 u; their trailing threads stretch, fray (wobble ×3, ribbon gaps) and one strand between them **snaps and recoils** (a 30 u whip at each end). **Settle**: the shuttles stop hard, thread ends curling. **Consequence**: a **cloth tear** (paper knockout, hand-cut jagged edges, 20 u wide) rips from `(0,−200)` to `(0,+200)` (0.6 s) — distance as a rip; the snag, unchallenged, turns toward the loom frame and *advances* 120 u (0.6 s, heavy) | rotate `cam(120,−40,1.0,0°)` → `cam(0,0,1.0,+7°)` over 1.0 s (the frame tilts with the split); the camera drops 20 u on the snap | tear at centre; shuttles at ±330 inside the core box |
| 5.98 "recover, protect" | Plates return; V in front of the frame | **Antic** 0.2 s: both shuttles pull back 30 u away from goal. **Action**: the **pink and blue plates print** (threads bloom to colour in one plate slap) and both shuttles *run toward the frame* laying thread: you to `(−120,+300)`, teammate to `(+120,+300)` (0.8 s ease-out, speed lines, smear on twos), and **physically cross** at `(0,+240)` — one thread loops through the other. **Settle**: each overshoots 25 u past its mark and recoils; the loop cinches. **Consequence**: a **new purple knot** prints at the crossing; the tear *closes* as they cross (knockout shrinks to nothing, 0.6 s); the snag, arriving at `(0,+120)`, *pushes into the V* and is **blocked** — its torn edge crumples 20 u against the two threads, which bow 15 u and hold; it recoils 0.2 s | pan+push `cam(0,0,1.0,+7°)` → `cam(0,240,1.2,0°)` over 1.2 s (down to the knot, roll straightens); a 10 u jolt on the block | knot centred; the loom frame at relative `+220 × 1.2`: inside |
| 8.8 follow-through "communicate the next job" | Plucked thread, ball won | **Antic**: the blue shuttle pulls the thread between them 30 u. **Action**: it *plucks* — snap, vibration rings travel to the pink shuttle (0.5 s); a navy solid lane *grows* from the pink shuttle toward the ball (0.4 s, tip leading). **Settle**: rings fade. **Consequence** (9.5): the pink shuttle *steps* 80 u and takes the ball — the ball rolls out of the snag onto the pink thread (0.5 s, ease-out); the snag sags (edge droops 20 u); the blue shuttle checks 60 u away into support (0.3 s) | hold `cam(0,240,1.2)` with a 20 u lean toward the ball | — |
| 10.42–11.067 seam | | | | |

**Seam:** Passage through the **loom frame's woven net** (aperture: one diamond of the net at `(0,+470)`, 180×180) → reveals inside it a **different composition**: the net's crossing is the **whole woven cloth** flat and wide (ch 6): dense weave, loom bars at its edges, no court.

Football truth: after losing the ball the correct futsal response is immediate recovery runs toward goal (get goal-side), compact shape in front of the goal (the V), and one clear call about the next job; blame = players drifting apart = the opponent walks through. The snag advancing unchallenged during "blame" and being blocked by the V is the visible consequence.

---

## Chapter 6 — "Offer. Listen. Support." (9.165 s) — no headline (three actions, no single word; the catch is the idea)

Narration: *Ask yourself: what can I do to help someone else play? Offer, listen, support. Trust grows when you can rely on each other.*

Background: loom lattice at 60 u pitch — the densest plaid of the story, stepped 0.14/0.2, grain in every cell; confetti 14 flecks. The drawn weave is the *solid* version of this lattice, so figure and ground are one material; the lattice bows with the weave at half amplitude.

Composition at t=0: the whole cloth at 0.6×: 9 blue warp threads (22 u) at `x = −480 … +480` step 120, 7 pink wefts at `y = −360 … +360` step 120; every crossing purple with a small navy knot; the court's lines woven in as **navy threads** (rectangle `±420 × ±300`, centre circle r=110). Centre crossing `(0,0)` = seed `K0`. Knot-ball r=90 at `(0,0)`. Two **loom tension bars** (navy bars 40×720, grainy, with thread hooks) wait off-frame at `x=∓700`.

| t + words | Composition (what fills the frame) | Cue action: Antic → Action → Settle → Consequence | Camera key | Phone note |
|---|---|---|---|---|
| 0.00 "Ask yourself" | Cloth at a tilt | **Antic**: the left bar rocks 15 u outward. **Action**: the **left loom bar** slides in from `x=−700` to `−560` (0.6 s ease-in-out) and *hooks* the three left-most warps, pulling them 30 u toward it: the weave **flexes** — a 40 u bow travels left → right through every warp (0.5 s) and the lattice behind bows with it. **Settle**: the bow decays over 0.6 s. **Consequence**: the ball rolls 60 u right on the bowing cloth and back; at 1.6 a spare **pink shuttle** runs from the bar laying a short thread to the ball and *nudges* it back onto `K0` (0.6 s, 10 u overshoot) | rotate+push `cam(0,0,0.9,−12°)` → `cam(0,0,1.0,−4°)` over 1.2 s (the cloth settles flat toward us); the camera sways 10 u with the bow | the bar stays at `x > −600`: cropped only at 320×568, hooks still visible |
| 3.76 "Offer, listen, support" | Three beats, left → right | **Offer** (3.76): antic — a blue shuttle at `(−300,+240)` dips back 20 u; action — it runs its thread to the pink weft at `(−240,0)` and *loops through it* (0.3 s); settle — the loop cinches; consequence — a purple knot pops. **Listen** (4.21): antic — the pink weft at `(−240,0)` is pulled 30 u; action — released, it *snaps and vibrates*, rings run right along it (0.5 s); consequence — the blue warp at `x=+240` **vibrates in sympathy** (20 u snap, 2 drawn frames): a thread receiving. **Support** (4.66): antic — the right bar rocks outward; action — it slides in to `x=+560` (0.5 s) and hooks the right warps; settle — both bars pull and the whole cloth *tightens* (every thread's wobble halves, the cloth flattens 20 u); consequence — the ball sits steadier, its highlight brightens | pan `cam(0,0,1.0,−4°)` → `cam(−200,−60,1.05,−4°)` at 3.76 (0.4 s) → `cam(+200,−40,1.05,−4°)` at 4.21 (0.4 s, the pan *is* the listening: it travels along the vibrating weft) → `cam(0,0,1.05,−2°)` at 4.66 (0.5 s) | each beat's subject within `±320` of its camera centre |
| 6.94 "rely on each other" | The whole weave catches the ball | **Antic**: the ball lifts 40 u off the cloth (hang 0.15 s). **Action**: it **drops** from `(0,−520)` with gravity (0.4 s ease-in, seam knots spinning) onto the cloth: the **whole weave dips** 80 u in a soft bowl (every crossing within r=300 moves, amplitude falling with distance; the lattice dips at half amplitude a frame late). **Settle**: the bowl rebounds 30 u and settles (0.6 s); the ball bounces once and rests at `K0`. **Consequence**: no single strand thinned; at 8.2 the print **re-seeds registration** once (a fresh impression: all knots cov 1.0, one frame of slight over-ink on the purple) | push `cam(0,0,1.05,−2°)` → `cam(0,0,1.15,0°)` over 1.1 s (falls with the ball, dips 20 u on impact) | at zoom 1.15 the cloth spans `±420 × ±315` relative: inside the core box, both bars' hooks visible |
| 8.5–9.165 final hold | | Moving hold: the bowl's last sway decays to zero (0.4 s); the ball's highlight breathes once. No camera travel | hold `cam(0,0,1.15,0°)` | — |

**Seam:** none — last chapter; the final print holds under the caption until the audio ends.

Football truth: a team that keeps its shape absorbs pressure together (the bowl — everyone shifts a little rather than one player sprinting to cover). Offer = show for the ball; Listen = receive the call; Support = hold the shape from behind.

---

## Shapes needed

From the shared library (§3): `thread` (with width ramp, fray amplitude and eyelet), `goal` (as the loom frame with a woven net), `laneArrow` (dashed and solid), `chalkStroke` (court lines), `field(kind: torn)` (yellow snags, navy night field), `pressureWalls(gap)` (yellow), `ripple` (vibration rings), `speedLines`. `ball`, `boot`, `eye`, `ear`, `hand`, `bubble` are **not** used.

Story-specific shapes (author in `lib/paths/riso/stories/woven-court.ts`, not the library):
- `lattice(pitch, rot, covA, covB, seed, bow)` — background weft/warp bands with grain, overprint cells and a bow displacement field.
- `knotBall(r, rot)` — paper sphere wound with navy thread seams in a 5-panel layout, knots at seam junctions, knockout highlight.
- `shuttle(x, y, angle, ink)` — loom shuttle carrying its thread.
- `weave(warpXs, weftYs, width, cov, seed)` — warp/weft with knockout gaps at "under" crossings; returns the crossing list.
- `knot(x, y, r, cov)` — purple crossing disc plus navy loop.
- `pluck(thread, at, t)` — sideways snap plus travelling knockout rings.
- `tear(points, width, progress)` — paper knockout rip with hand-cut edges.
- `snag(x, y, w, h, angle, crumple)` — yellow torn opponent field with an edge-crumple parameter for blocked pushes.
- `loomBar(x, h)` — tension bar with thread hooks.
- `weaveBowl(centre, r, depth, t)` — crossing displacement for the ch 6 catch and ch 2 load waves.

## Delight (§4d)

**Touch reaction — `touch(sheet, x, y, age)`, ≤ 0.8 s:** the nearest thread (drawn thread, or a lattice band if no thread is within 120 u) is **plucked at the touch point**: it is pulled 24 u toward the pointer over 0.1 s, released, and twangs as a damped zig-zag (amp 24 → 0, 3 cycles, 0.5 s on twos); two paper knockout vibration rings (r 20 → 90) travel 160 u along the thread in both directions and fade; if the pluck point is within 60 u of a purple knot the knot flashes one frame of over-ink. Inks: the thread's own ink; rings are paper. Reduced motion: a single static knockout ring r=40 at the point. Max 6 live plucks, oldest recycled; while paused a touch plays one pluck and the canvas sleeps.

**Secondary motion that reacts to the main actions:** fibre confetti (cream/blue flecks) scatters outward 40–80 u when a snag pushes or a weight lands, then drifts back to its slow lattice drift over 1 s; loose fibre "fluff" (3–5 tiny navy hooks) lifts off a thread at every fray moment (ch 1 1.9, ch 2 7.08, ch 5 1.70) and settles; knot loops shiver 4 u for 0.3 s whenever a wave passes through them; thread eyelets brighten one frame on every cushion. All seeded, bounded lifetimes, ≤ 1 ms per frame.

**End card:** the ch 6 print holds; the two loom bars ease their pull 10 u and re-tighten once (a breath of the cloth), the knot-ball's highlight brightens, and the Replay button appears as a printed stamp. No confetti burst.

## What would make this fail (the rejected Astra look)

- A small thread icon in the centre of a flat purple background. The ch 1 strand spans the full frame and sags under a ball the size of a head, over a grainy lattice.
- Threads drawn as clean 2 px vector lines. They are ribbons 28–34 u wide with pressure, gaps and fray.
- Crossings that stay the thread colour. The purple **must** be the overprint of the pink and blue plates at cov 1; a flat purple fill kills the argument.
- A held weave for the 3 s between cues. Every cue row keeps changing (waves, weights sliding, snags collapsing) and the holds are moving holds.
- Pressure that does not deform anything: a snag must visibly press a ball/thread and the pressed thing must squash or bend (§4b).
- Full-body players, boots, faces, eyes or speech bubbles. Players are shuttles; the call is a plucked thread; no generic forms in this story.
- A plain background in any chapter. Every chapter names the lattice pitch and coverage.
- A tiny grid of icons for offer / listen / support. The three beats are three actions on the same cloth with the camera panning between them.
- Sentences or arrows-with-text drawn into the artwork. The only words are the one-word HTML headlines.
- Reverse zoom at any seam. Every seam travels *into* a named material (fibre, knot, vibration ring, seam knot, net mesh).
- A flat night in ch 5: the navy field is a 0.7 grainy halftone with mottle, court lines knocked out, lattice faintly beneath.

## Self-check (muted)

Muted, does the film still explain the narration? Ch 1: a lone strand sags under a wound ball, a yellow field pushes up and stains it orange, then four blue threads loop onto it and the strand straightens — "share the weight" reads. Ch 2: crossings cinch purple, weights drop and the dip spreads, then one strand alone thins and frays under the sliding weights until the others return — "strength at the connections / one strand stretched" reads. Ch 3: a shuttle sends the ball down a taut thread, keeps moving into a white wedge, plucks the thread so rings run to the other shuttle, and the ball comes back past a lunging snag — "pass, move into view, angle and a call" reads. Ch 4: snags push in leaving a gap, one shuttle through, one back, ball through, then the lane travels from one shuttle to the other and the ball goes back and forward again — "jobs change" reads because the lanes move and the colours do not. Ch 5: the ball snagged, shuttles pulling apart with a strand snapping and a white rip between them while the snag walks toward the frame, then colour returning as both run, cross into a V that the snag crumples against, and the rip closes — "blame adds distance / recover together" reads. Ch 6: loom bars hook and tighten the cloth, three beats (loop-knot, plucked thread answered by another thread, second bar), the ball dropped and caught by the whole weave — "rely on each other" reads. The weakest silent beat is "Listen" (sympathetic vibration is subtle); it is kept because it is in-material, the camera pans along the vibrating weft as the act of listening, and it lasts 0.45 s inside a continuous action. Every seam names a material the camera enters; no chapter holds a still frame; every pressure word deforms something; no chapter has a flat background.

---

## Build ledger (20 Sep 2026)

**Built:** `lib/paths/riso/stories/woven-court.ts` — six scenes on `playChapters`, chapter text/labels/audio verbatim from `lib/paths/films/futsal.ts`, cue onsets from `phraseFilmScores.ts`, seconds merged from `narrationTiming.json`. Story-specific shapes as planned: `loom` (warp/weft lattice with stepped coverages, bow/sag displacement fields, warp-only mode), `flecks`, `ribbonVar` (variable-width ribbon for thinning strands), `strand` (thread with navy rim, self-draw, fray + fluff), `knotBall`, `shuttle`, `snag` (hand-cut yellow mass with `pressPts` crumple), `knots` (pink×blue overprint discs + navy loops, batched), `rings` (paper vibration rings, one knockout), `tear`, `loomFrame` (bars, hooks, woven or paper net), `courtLines`, `plucked` (pull + damped standing wave). Headlines: Share / — / Move / Next job / Recover / —. Touch: a thread at the touch point is pulled toward the pointer, released and twangs, two paper rings run along it (static ring under reduced motion).

**Deviations from the storyboard and why**
- Background coverage was raised well above the storyboard's 0.14–0.26: at those levels the print read as pastel gingham (first review sheet); the lattice now runs at 0.45/0.6 (0.32/0.45 in ch 6) so all three inks carry weight and the crossings print real purple. Ch 2's "inside the fibre" is a pink halftone field with blue warp bands only (a different construction from the plaid chapters), ch 3/4/6 lift the court/cloth with a 0.4–0.45 paper knockout so figure and ground separate, ch 5 prints the lattice as thin paper lines knocked out of a 0.88 navy night field.
- Under/over alternation at crossings is not drawn: multiply overprint cannot show one ink over another, and the bible wants crossings to be the purple overprint anyway.
- Ch 4's yellow snags run x = ±110…±900, y = −390…−130 (thicker than the storyboard's ±70) so the pressure masses fill the top of the frame; their inner corners deform toward the ball (green stains on the blue thread appear from the overprint) and return.
- Ch 5's threads swap sides at the crossing (pink ends at +120, blue at −120) so the recovery runs physically cross at (0, +240); the snag keeps the ball until the pink shuttle steps to it at 9.5.
- Ch 6's "fresh impression" at 8.2 and the ch 5 lattice rotation are not implemented: the registration seed is chapter-indexed inside `press()` (engine), and the camera roll rotates the whole world instead.
- Shuttles were scaled to 200×82 (storyboard 150×60) and court lines to 16 u after the first sheet read as a court map at phone size; the ch 6 ball is r 105 (storyboard 90).

**Gates:** typecheck clean · `review-riso-story` 45 samples, maxOps 120, five seams pixel-exact (max 0), zero page/draw errors · `riso-perf` 390×850 DPR 1.5: median 3.8 ms, p95 15.9 ms, max 17.5 ms, ops median 59 · `check-riso-films-browser --title "The Woven Court"` PASS at 390×850, 320×568, 844×390, 1440×850 (tray fit, playback, pause sleep, touch burst then sleep, transcript, cleanup, zero page errors).

**Screenshots:** `/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso/woven-court/app-woven-court-{390x850,320x568,844x390,1440x850}-ch{1..6}.png` (+ `-touch.png`, montages `montage-*.png`); contact sheet `…/scratchpad/riso/review/woven-court.png`.

**Known limitations:** p95 on passage frames is ~16 ms (two scenes drawn); the plaid can shimmer slightly on 320-wide phones where the halftone cell approaches the band pitch; the "Listen" sympathetic vibration (ch 6, 0.25 s) is subtle when muted; touch pluck acts on a generated thread segment at the point rather than the nearest drawn thread (the scene geometry is not exposed to `touch`).

## Fix ledger (20 Sep 2026 · legibility pass, bible §1c + reviews/futsal.md + reviews/cross-story.md)

**What changed (story file only, engine untouched).**
- `figure()` helper (abstract riso pictogram per §1c.4, same code as chalk-line plus a `pull` pose): pink cut-out = you, blue cut-outs = teammates, yellow cut-outs = defenders (the snags' ink and torn edges), each knocked out beneath with a navy contour and navy halftone shade; 440–600 u tall, 1–3 per frame. The shuttles are gone.
- **Knot-ball**: a paper football with a filled navy centre panel, three loops of navy thread wound round it (twist ticks) and knots where the loops cross, pink halftone shadow — it reads as a ball first and thread second (cross-story fix 1 bounded by §1c.3).
- **Lattice to spec** (cross-story fix 10): every loom call at coverage .2/.32 with wobbled band edges (amp 8–16) and a paper rest zone (`rest()`) knocked out around the ball in ch1/ch2; ch2 shows weft *and* warp from the first second.
- ch1 (SHARE): you stand at the left, leaning back (pull pose, strain eases on the cues) holding a thread that runs off to the weight; the football hangs on it 160 u lower than before (out of the headline band); on "responsibility can be shared" two blue teammates run in and take hold (their hands at the join knots), the sag lifts; the third and fourth threads still join from off-frame on "So does everyone".
- ch2: **a goal net** — navy posts and bar, 7 warps × 5 wefts at ×3 scale, knots (loop + tail) cinching outward on "places they connect"; on "connect" the football flies in and lands in the net at 5.4 (the net dips with a spring and holds); on "one strand stretched tight" the weft under the ball thins and frays while the others fade, then the load spreads at 8.3. The three navy weights are gone.
- ch3 (MOVE): you (pink) kick the pass (0.7 s flight), run 420 u into open space (run pose, speed lines) and raise both arms on "a call"; the blue teammate offers with arms out and cushions; two yellow defenders, one stepping toward the ball; camera 270 u higher so the goal clears the headline (cross-story fix 7).
- ch4 (NEXT JOB): blue sprints forward in a run lean, pink offers behind with arms out facing the play; on "Your jobs can change" the poses swap (pink runs forward, blue drops back); the two yellow slabs are two yellow defenders stepping in and collapsing toward the ball; camera 150 u higher.
- ch5 (RECOVER, night duotone): a yellow defender takes the ball at their feet; you and the teammate print as paper cut-outs far apart, heads turned away, shoulders down ("blame adds distance"); on "recover" they turn, colour arrives, both sprint to the goal (the thread knots between them) and stand either side of it with arms out as the ball is played.
- ch6: three players in a triangle; three 0.7 s passes (ask → offer → support), each knitting a thread between passer and receiver with a knot; on "listen" your head turns toward the teammate with a paper sight wedge; on "rely on each other" all three raise their arms, the triangle tightens and the ball drops into the woven centre, which gives and holds. The 9×7 cloth and dots are gone (they competed with the players).
- **Seam 3→4** is a thread pulled across the frame from 7.9 that frays as it unravels the print (`pulledThread`), not a circle wipe; 1→2 into the strand's fibre, 2→3 into the ball's panel, 4→5 into the ball, 5→6 into the net, unchanged.
- **Touch** ×2–3: a 700 u thread with a navy rim bows 90 u toward the finger, is released and twangs on twos with a blurred double line; two 190 u paper rings run along it.

**Kid test (sound off, 390×850 captures + contact sheet).** 1 "One player pulls a rope with a football hanging on it; two friends run in and hold it too." · 2 "A football lands in a goal net full of knots; the net stretches and holds." · 3 "The pink player passes to the blue one, runs into space and puts both arms up; yellow defenders stand around." · 4 "The blue player runs to the goal while the pink one waits behind; then they swap." · 5 "At night two players lose the ball to a yellow one and turn away from each other; then they run back together to the goal." · 6 "Three players pass the ball round a triangle, one turns to listen, then all cheer with the ball in the middle." — all describable, all match the meaning.

**Gates.** typecheck clean · `review-riso-story --id woven-court`: 45 samples, 5/5 seams pixel-exact, 0 errors, maxOps 153 · `riso-perf woven-court`: median 4.1 ms, p95 15.7, max 20.3 · `check-riso-films-browser --title "The Woven Court"`: PASS ×4. Screenshots: scratchpad `riso/fix/woven-court/` (`phone-strip.jpg`, `ch3.jpg`); contact sheet `riso/review2/woven-court.png`.

**Limitations.** ch4's last two seconds cluster four figures and the ball in front of the goal (legible, but the busiest frame in the story); ch5's colour arrives on twos as a snap at "recover" (the paper → ink switch) rather than the earlier blend. The yellow figures on the blue/pink lattice print olive/orange fringes where the lattice bands pass under them (knockout covers the body; the rim halftone overlaps).
