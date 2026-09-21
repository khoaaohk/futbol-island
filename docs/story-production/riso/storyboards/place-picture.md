# place-picture — "A Place in the Picture" (7v7, belonging as yourself)

Storyboard per RISO_BIBLE §8 with §1b (texture, uniqueness), §4b (motion enacts the words), §4c (headlines) and §4d (delight). Written 20 Sep 2026 before any drawing. Sources: narration/labels `lib/paths/films/seven.ts` (`pictureBeats`), cue onsets `lib/paths/films/phraseFilmScores.ts["place-picture"]`, chapter seconds `narrationTiming.json` → `[8.7, 11, 9.2, 10.7, 11.1, 9.3]`. Audio `/stories/narration/7v7/place-picture/{1..6}.m4a`, unchanged.

## Conventions used below

- World units: short side = 1080, chapter centre `(0,0)`, x right, y down. `cam(x, y, zoom, rot°)` puts world `(x,y)` at the centre of `sheet.safe`; zoom 1 = 1080 units across the safe region's short side.
- **Core box** `±480 × ±420` is visible on every viewport (390×850, 320×568, 844×390, 1440×850). Anything that must read lives inside it at every camera key. Backgrounds extend to `±1400`. The landscape title/headline band covers roughly `y < −400` at zoom 1, so nothing important sits above `y = −400`.
- Cue `at` values are the shipped word onsets; nothing is added to the audio. "Follow-through" rows are consequences of the cue before them, not new cues.
- Every cue cell is written **Ant. → Act. → Settle → Result** (§4b): a 0.15–0.3 s counter-move, the main action on a real easing curve, an overshoot/settle, and a consequence on something else. Camera participates: it leans 1–2° into pushes, is dragged a beat late by fast things, and eases out on "room/grow". Drawn objects on twos; camera on ones. Between cues the last force decays as a residual sway (no idle drift).
- Registration offset re-seeded at each chapter start. Seam passage = last 0.65 s. Zoom never decreases inside a chapter except the single permitted 4 % "breathe-out" where noted; the world grows toward the camera instead.
- Headline (§4c): the HTML overlay word(s) in the loading-screen brush font; never drawn on canvas; none when no single word carries the beat.

## Lead imagery (this story only)

**Separate pigment plates that only complete the picture together.** Three enormous torn-edge pigment sheets — **Pink** (you), **Gold** (yellow, a teammate), **Green** (a teammate) — plus the overprint colours they make where they cross (orange = pink×yellow, lime = yellow×green, plum = pink×green), a **slot** cut into the picture in Pink's own shape, **offcut chips** (paper and pigment triangles torn from plate edges) as confetti, a **sprout** (a fan of short strokes a plate grows when it has an idea), **stamped afterimages** (misregistered copies a plate leaves when it moves fast), and the plates' **rim bands** (each plate prints a stepped rim: a solid 0.9 band inside its torn edge over a 0.35 body). Football objects only where the narration names a football action, in this story's material: the ball is a **pigment disc** (paper knockout disc r=50 with one navy pentagon and a pink rim crescent); the goal is a **navy plate rectangle with a paper mouth**; pass lanes are **overprint bands** (a strip where two plates print over each other). Generic marks at most once each, in pigment: an eye once (ch 3, a paper knockout blot in the Pink plate with a navy pigment pupil), an ear once (ch 5, a pink crescent offcut). No boot, no hand, no bubble, no figures.

*Lead imagery not used by any other story in this path* (pocket-radio: cone/dial/needle/waveform; signal-water: shores/signal ripple/returning ripple/flag/buoy; empathy: soft translucent washes/wash ear/wash hand).

## Background construction: overlapping hard-edged colour plates

Whole story: three huge torn-edge pigment sheets overlap in a different arrangement per chapter. Every sheet is a **grainy ink field** (speckle in the ink) at stepped coverage: body 0.35 halftone + a 0.9 solid **rim band** 70 u wide inside the torn edge (two tonal steps per plate); where two sheets cross, the multiply overprint makes the third colour; **offcut confetti** floats near torn edges; cream paper shows wherever a plate is missing; navy prints the furniture last. The pitch inside the Green plate has **horizontal mown stripes as stepped tonal bands** (0.35 / 0.5 alternating, 160 u tall, wobbly edges). No nested arches, no torn channel, no diagonal ribbons anywhere in this story.

**How it differs from the other 7v7 stories:** hard, torn, registered plates that snap, fan, stack and get cut — the background is the print's own separations. Pocket-radio's background is concentric wave rings from a speaker; signal-water's is horizontal water bands between two torn shorelines; empathy's is soft-edged translucent washes with dot-ramp rims and no torn edges.

## One continuous world

The **Picture** is a 7v7 pitch printed from the three plates: Green plate = the pitch (1400×900, torn, mown bands) centred `(0,40)`; Gold plate = a broad wedge across the upper-left (1100×520 at `(−320,−380)`) with a paper knockout sun r=150 at `(−380,−300)`; Pink plate = a 900×700 torn sheet at `(−120,−40)` over the left-centre of the pitch. Navy furniture: goal plate 260×110 at `(560,60)` cropped by the right edge; centre circle = paper knockout ring r=170 at `(0,60)`.

| Ch | Where in the Picture | Scale | What the metaphor does | Headline |
|---|---|---|---|---|
| 1 | Whole Picture, then its upper-left overlap | 1× → 1.6× | Plates print one at a time; overlaps bloom | none |
| 2 | Inside the orange overlap | 3× | Plates pressed into one colour; a hole; plates separate | DIFFERENT |
| 3 | Inside the Pink plate | 2.2× | Four things a plate can do | none |
| 4 | Goal corner | 1.4× | A slot cut in Pink's own shape survives a miss | WELCOME |
| 5 | Centre circle | 1.2× | Pass / idea / invite / listen as overprint bands | OFFER |
| 6 | Whole Picture, wider, with a new offcut | 0.75× | The sheet tears wider to make room | ROOM |

Ch 6 frames ch 1's composition at 0.75× with the slot (ch 4) and the three overprint lanes (ch 5) still printed.

## Inks and role colours

Triple: **pink `#ff48b0`, yellow `#ffe800`, green `#00a95c`** + navy `#22366b`. Print order yellow → pink → green → navy. Paper `#f0ece2`. (Unique in 7v7: pocket-radio pink/yellow/orange; signal-water yellow/green/orange; empathy pink/green/orange.)

| Role | Ink / treatment |
|---|---|
| **You** | Pink plate: torn silhouette seed `P1`, body 0.35 + rim band 0.9 |
| **Teammates / support** | Gold plate (seed `Y1`) and Green plate (seed `G1`), same stepped treatment |
| **Pressure / sameness** | navy: a navy tone mass (0.7, torn) that pushes into Pink; the register that presses all plates into one colour |
| **The metaphor material** | the overprints: orange, lime, plum; the paper where a plate is missing |
| Ball (ch 4, 5 only) | pigment disc: paper knockout r=50, one navy pentagon, pink rim crescent |
| Goal (ch 4) | navy plate 520×220 with a paper mouth |
| Lanes (ch 5, 6) | overprint bands 60 u wide: orange (Pink→Gold), lime (Gold→Green), plum (Green→Pink) |

Duotone beat: chapter 2, 0–3.98 s prints **yellow + navy only**.

---

## Chapter 1 — "A place for you" (8.7 s) — headline: none

Narration: *Do you ever feel you need to be like everyone else to belong? Think of a picture made from many different colours.*

**Background this chapter:** Green plate printed (grainy mown-band pitch, torn edges); Gold and Pink present only as navy contours on cream paper (unprinted); offcut chips in navy outline along the torn edges. The paper is most visible here — the "before" state of the print.

| t + words | Composition | Cue action (Ant. → Act. → Settle → Result) | Camera key | Phone note |
|---|---|---|---|---|
| 0.00 "Do you ever" | Whole Picture 1×; only Green + navy printed | **Ant.** Pink's contour tightens inward 15 u (0.2 s). **Act.** Pink slides 90 u toward Gold (0.6 s, ease-in-out) while its silhouette bends toward Gold's wedge (`P1` → 40 % `Y1`), tips of the torn edge leading. **Settle** overshoot 12 u, bounce back (0.3 s). **Result** two chips shake loose from Pink's trailing edge and flutter down (0.5 s) | `cam(0,0,1.0)` hold, leaning 1° toward Gold | Pink (−120,−40) and Gold's lower edge in core |
| 1.62 "like everyone else" | Sameness pushes | **Ant.** a navy mass (torn, tone 0.7, 1300 wide) rises 30 u from the bottom edge (0.2 s). **Act.** the mass PUSHES up into Pink to y=+300 (0.6 s, ease-in): Pink **squashes** (height −22 %, width +14 %), its lower edge crumples into Gold's outline, and it prints in the wrong ink — yellow tone 0.3, no rim band. **Settle** the mass stops with a 10-u bounce. **Result** the copy's edge ripples once; the centre-circle knockout beneath it is dented 20 u | push `cam(0,0,1.0)` → `cam(40,−60,1.25)` over 1.4 s, leaning 2° into the push | the mass stays below y=+300 |
| 3.76 "Think of a picture" | Release; plates start landing | **Ant.** the mass draws down 20 u (0.2 s). **Act.** it tears away downward (0.5 s, ease-in) and Pink **springs back** to `P1` (0.4 s) with overshoot (+8 % size) and settle; its yellow tint knocks out. Gold plate **prints**: one drawn frame of over-inking, then body 0.35 + rim 0.9 (a slap, the whole sheet shivers 3 px once). **Result** six chips flutter 80 u off Gold's torn edge and settle (0.6 s); the sun knockout appears | pan+push `cam(40,−60,1.25)` → `cam(−140,−120,1.45)` over 1.3 s (the release lets the camera travel up-left) | sun's lower half in frame |
| 5.12 "many different colours" | Plates keep landing | **Ant.** the sheet shivers (1 drawn frame). **Act.** Pink prints at 5.12 (body + rim, slap) and Green re-prints at 5.9; each slap shifts registration by its stable 1.8 px. **Settle** the shiver decays over 0.4 s. **Result** the overlaps **bloom** where plates cross: orange lens ~360×260 at `(70,−90)` (Pink×Gold), lime at `(160,60)`, plum at `(−20,120)`, each blooming outward from its centre (0.5 s) | rotate+drift `cam(−140,−120,1.45,0°)` → `cam(0,−40,1.6,−4°)` over 2.2 s, ending centred on the orange lens | lens ends inside ±200 of centre |
| 7.3 follow-through | Four-plate Picture | The loose chips **land inside the overlaps** and print in the overlap colour (0.4 s, chip by chip): the new colours are real ink. Residual: the sheet's shiver decays to zero | hold `cam(0,−40,1.6,−4°)` | — |
| 8.05–8.70 seam | | | | |

**Seam:** Passage through the **orange overlap lens (pink×yellow pigment at (70,−90))** → reveals a **different composition**: three plate sheets standing edge-on in a stack (ch 2).

Football truth: a 7v7 pitch with one goal, a centre circle, mown stripes — correct furniture; no action claimed.

---

## Chapter 2 — "Different, together" (11 s) — headline: DIFFERENT (arrives at 3.98)

Narration: *If every colour became the same, something would be missing. Your team needs different people too. You can belong without copying someone else.*

**Background this chapter:** inside the orange lens: three **plate sheets** (torn rectangles 520×900, grainy, body 0.35 + rim 0.9) in a shallow stack — yellow `(−300,0)`, pink `(0,0)` 60 u behind, green `(300,0)` 120 u behind — each with a large knockout silhouette of the Picture's shapes; chips between the sheets; paper elsewhere. **Duotone 0–3.98: yellow + navy only.**

| t + words | Composition | Cue action (Ant. → Act. → Settle → Result) | Camera key | Phone note |
|---|---|---|---|---|
| 0.00 "If every colour" | Three sheets (all yellow) | **Ant.** the outer sheets lean outward 4° (0.2 s). **Act.** they are PRESSED into register behind the front sheet (0.8 s, ease-in, heavy): as each arrives the front sheet **compresses** 3 % and its rim band buckles; the three knockouts overlap into one blurred outline. **Settle** the stack bounces 8 u. **Result** chips squeezed from between the sheets shoot out sideways and fall (0.5 s) | `cam(0,0,1.0)` hold, leaning 2° into the press; slow push to 1.1 by 2.3 | sheets inside ±560 |
| 2.34 "something would be missing" | One yellow sheet | **Ant.** the sheet's centre bulges 10 u (0.2 s). **Act.** a **paper hole** the exact `P1` silhouette (300×260) tears open at `(0,−60)` (0.4 s): the cut-out **falls** with gravity out of the bottom of the frame, tumbling (0.7 s, ease-in). **Settle** the hole's edge quivers (0.3 s). **Result** the camera **drops** 40 u with the fall, then holds on the hole | pan+push `cam(0,0,1.1)` → `cam(0,−20,1.5)` over 1.2 s (drop, then settle 40 u higher on the hole) | hole centred, 450×390 on screen |
| 3.98 "Your team needs" | Duotone ends; **headline DIFFERENT pops in** | **Ant.** the sheets shrug 6 u inward (0.2 s). **Act.** they **fan apart** (0.9 s, ease-out): green swings right to `(300,0)`, pink to `(0,0)` rotated −6°, yellow left; pink and green plates press as they land (slaps). **Settle** each sheet overshoots 5° and settles. **Result** Pink's shape re-fills the hole from its own sheet; overprints bloom where sheets still overlap: orange band `(−150,0)` 120 wide, lime band `(150,0)` | pull-forward pan `cam(0,−20,1.5)` → `cam(0,60,1.5,0°)` over 1.5 s travelling down the pink sheet | pink sheet + both bands in core |
| 6.90 "without copying" | Fanned sheets | **Ant.** the pink sheet's silhouette (30 % drifted toward `Y1`) flexes toward Gold (0.15 s). **Act.** it **redraws to `P1`** over 3 drawn frames, torn tips leading, and its rim band re-prints on its true edge; green does the same to `G1`. **Settle** rim bands snap into register (2 px). **Result** the last stray chips fall off both sheets | rotate `cam(0,60,1.5,0°)` → `cam(30,80,1.6,3°)` over 1.6 s | — |
| 8.9 follow-through | Same | Each sheet **stamps its rim band** in turn (yellow, pink, green: one drawn frame each, a slap and a 3-px shiver): three different edges, one print | push `cam(30,80,1.6,3°)` → `cam(0,40,1.9,3°)` over 1.4 s onto the pink sheet's pigment | pink sheet fills the core |
| 10.35–11.00 seam | | | | |

**Seam:** Passage through the **pink sheet's own pigment (its body halftone)** → reveals a **different composition**: four plate behaviours inside the Pink plate (ch 3).

Football truth: nothing tactical is claimed; the pitch silhouettes on the sheets keep the game present.

---

## Chapter 3 — "Bring yourself" (9.2 s) — headline: none

Narration: *You might be quiet, full of ideas, quick to move, or good at noticing others. These are things you can bring.*

**Background this chapter:** inside the Pink plate at 2.2×: a whole-frame **grainy pink field** with its two tonal steps (the 0.9 rim band crossing the lower-right as a torn stripe over the 0.35 body), Gold's and Green's torn corners entering top-left and bottom-right (orange and plum overlap wedges), chips scattered.

Four **plate behaviours**, each dominant in turn (≥ 60 % of the core when it is the subject): **Quiet** = a solid pink offcut disc r=40 at `(0,0)`; **Ideas** = a **sprout** at `(−320,−240)`; **Quick** = a pink offcut wedge 520×180 at `(380,140)`; **Noticing** = the eye, once: a paper knockout blot 560×260 at `(−60,−420)` with a navy pigment pupil r=70.

| t + words | Composition | Cue action (Ant. → Act. → Settle → Result) | Camera key | Phone note |
|---|---|---|---|---|
| 0.00 "You might be quiet" | All four pale (0.3); disc | **Ant.** everything else dims to 0.15 (0.2 s). **Act.** the disc **prints solid** (0.9, one slap) and a navy ring r=90 draws around it (0.5 s, ease-out) — then motion **stops dead** on the held drawing. **Settle** none: the hold has weight. **Result** the camera keeps creeping so the stillness reads | `cam(0,0,1.3)` creeping push to 1.34 over 1.1 s | disc at centre |
| 1.12 "full of ideas" | Sprout | **Ant.** the origin point swells 8 u (0.15 s). **Act.** nine strokes **grow** from it one per drawn frame (0.75 s, ease-in growth along curves, tips leading), lime ones as yellow×green overprint. **Settle** tips overshoot 10 u and spring back. **Result** the fan's weight tilts the whole plate field 1° (residual sway) | pan+push `cam(0,0,1.34)` → `cam(−240,−200,1.5)` over 1.0 s | fan tips inside core |
| 2.40 "quick to move" | Wedge | **Ant.** the wedge draws back 40 u (0.2 s). **Act.** it **rushes** 140 u toward the disc in 0.4 s (ease-in, smear-on-twos: a stretched drawing for 1 frame) leaving three misregistered stamped copies behind (+18 u each, tones 0.4/0.3/0.2). **Settle** overshoot 30 u, settle 0.3 s. **Result** the disc is nudged 12 u and wobbles back; the camera is dragged a beat late | whip-pan `cam(−240,−200,1.5)` → `cam(300,120,1.5)` starting 0.15 s late, over 0.9 s | wedge nose ends at (200,60) |
| 3.82 "noticing others" | Eye blot | **Ant.** the blot's slit narrows (0.15 s). **Act.** the paper blot **opens** (slit → half → open, 2 drawn frames) and the camera **pans as the look**: from the blot toward the sprout, then toward the wedge, revealing each by the pan (0.8 s). **Settle** the pupil overshoots and centres. **Result** the sprout's tips quiver as they are looked at | pan `cam(300,120,1.5)` → `cam(−40,−360,1.5)` over 0.6 s, then the look-pans `cam(−200,−300,1.5)` → `cam(120,−240,1.5)` over 0.8 s | blot centre at safe centre, below the landscape band |
| 5.38 "These are things" | All four | **Ant.** the four marks lift 10 u (0.2 s). **Act.** they **slide into one row** at y=+40 (0.9 s, ease-in-out): disc `(−390,40)`, sprout `(−130,40)` at 0.55, wedge `(150,40)` at 0.5, blot `(400,40)` at 0.5; a navy rim band draws under the row. **Settle** each lands with a 6-u bounce in sequence. **Result** chips shaken from each mark settle on the band | pull-forward pan `cam(120,−240,1.5)` → `cam(0,60,1.5)` over 1.4 s | the two central marks always visible |
| 7.2 follow-through | Row | The Pink plate **prints its rim band around the whole row** (one drawn frame slap, 3-px shiver): these are the plate's contents | push `cam(0,60,1.5)` → `cam(400,40,2.2)` over 1.3 s onto the eye blot | pupil centred |
| 8.55–9.20 seam | | | | |

**Seam:** Passage through the **eye blot's navy pigment pupil** → reveals a **different composition**: the goal corner with the cut slot (ch 4).

Football truth: "quick to move" = a shape relocating with a trail; "noticing" = the look before receiving. Off-the-ball habits; no pass claimed.

---

## Chapter 4 — "Room to learn" (10.7 s) — headline: WELCOME (arrives at 0.00)

Narration: *Belonging means being welcomed and treated with respect. You do not have to earn that by scoring goals or getting every pass right.*

**Background this chapter:** goal corner at 1.4×: Green's **mown stepped bands** fill the frame (grainy, 0.35/0.5), Gold's torn edge crosses the top-left (lime wedge), the navy goal plate 520×220 at `(300,−120)` with its paper mouth, chips near the goal. The **slot**: a paper knockout in both Gold and Green at `(−200,60)`, initially a rough oval 320×280.

| t + words | Composition | Cue action (Ant. → Act. → Settle → Result) | Camera key | Phone note |
|---|---|---|---|---|
| 0.00 "Belonging means" | Slot; Pink waiting at `(−520,60)` | **Ant.** the slot's edges draw inward 15 u (0.2 s). **Act.** the slot **opens wider** — the composition expands: Gold and Green retreat from the slot's edge (0.7 s, long ease-out) — and Pink **travels in** and **joins** the slot (0.8 s), its rim band meeting the cut edge. **Settle** Pink overshoots 15 u past the slot's centre and settles. **Result** the mown bands either side bow 10 u outward from the join | `cam(−200,80,1.0)` hold, easing out 2 % as the slot opens | slot + goal in core; goal's right end crops |
| 2.14 "treated with respect" | Pink in the slot | **Ant.** the slot's oval edge flexes (0.15 s). **Act.** the edge is **re-cut to Pink's exact `P1` torn silhouette** (2 drawn frames, ease-out): the picture is shaped to you. **Settle** the cut edge snaps into register with Pink's rim band. **Result** a lime halo r=260 (Gold×Green) prints behind the slot (0.5 s); chips from the trimming fall away | slow push `cam(−200,80,1.0)` → `cam(−160,60,1.2)` over 1.8 s | — |
| 4.82 "earn that by scoring" | Goal enters | **Ant.** the pigment disc appears at Pink's lower edge `(−180,300)` and is drawn back 20 u (0.2 s). **Act.** it is **struck** toward the goal (0.7 s flight, 40 u lift, ease-out) and **misses**: it **slips** 60 u wide of the near post and **drops** with gravity to `(560,−60)`, two bounces. **Settle** it rolls to rest (0.4 s). **Result** the camera **drops** with the miss; a navy chip-burst at the miss point | pan `cam(−160,60,1.2)` → `cam(120,20,1.2)` over 0.9 s following the ball, then a 30-u drop | goal central |
| 7.12 "every pass right" | Ball wide; slot | **Ant.** the ball rocks back 10 u (0.15 s). **Act.** it is rolled back toward the slot and **overhit** — it **slides** 180 u past the slot to `(−520,120)` (0.7 s), skidding. **Settle** it stops with a wobble. **Result** the slot **does not close**: its cut edges hold and a second, thicker rim band prints around it (0.4 s) | pan+push `cam(120,20,1.2)` → `cam(−240,100,1.4)` over 1.2 s | slot 300×260 → 420×364 |
| 9.0 follow-through | Slot, ball at left | The ball rolls back (0.75 s, ease-in-out) and **joins** Pink's lower edge with a soft bump (settle 0.3 s) | push `cam(−240,100,1.4)` → `cam(−300,−140,1.9)` over 1.05 s onto Gold's band above the slot | Gold's pigment fills the upper core |
| 10.05–10.70 seam | | | | |

**Seam:** Passage through the **Gold plate's pigment (the yellow band above the slot)** → reveals a **different composition**: the centre circle from above (ch 5).

Football truth: a shot wide and an overhit pass are realistic 7v7 errors; 0.7 s flight; the ball goes wide, not through the post. The slot (welcome) persists through both.

---

## Chapter 5 — "Make room for others" (11.1 s) — headline: OFFER (arrives at 2.66)

Narration: *In football, bring one strength today. Offer a pass. Share an idea. Invite a teammate into the game. Listen to their ideas too.*

**Background this chapter:** centre circle at 1.2× from above: Green's **mown bands**, the paper ring r=380 at `(0,40)` with a paper halfway line, chips; Pink as a 300×260 offcut at `(−260,120)`, Gold offcut 340×220 at `(240,−80)`, a Green offcut 260×340 (rim 0.9 over the 0.35 pitch) cropped at `(620,200)`. A navy pressure mass (torn, 0.7) 260 wide at `(60,160)` between Pink and the goal side.

| t + words | Composition | Cue action (Ant. → Act. → Settle → Result) | Camera key | Phone note |
|---|---|---|---|---|
| 0.00 "In football" | Pink with the pigment disc at `(−200,180)`; mass ahead | **Ant.** the mass leans back 15 u (0.2 s). **Act.** it PUSHES 60 u into Pink (0.5 s, ease-in): the gap narrows to 20 u, Pink's near edge **crumples** and it sags 8 % toward the ball. **Settle** the mass stops with a bounce. **Result** the paper ring dents where the mass crosses it | `cam(0,40,1.0)` hold, leaning 2° into the push | mass never crosses x<−100 |
| 2.66 "Offer a pass" | Lane up-right; **headline OFFER** | **Ant.** the disc is drawn back 15 u (0.2 s). **Act.** an **orange overprint band** draws from the ball to Gold (0.3 s) and the ball **travels** it (0.7 s, ease-out) and **joins** Gold: Gold **cushions** (dips 12 u, settle 0.4). **Settle** Pink springs back to shape as the pressure loses its object. **Result** the mass, still pushing, now leans on nothing and topples 20 u forward | pan `cam(0,40,1.0)` → `cam(120,−20,1.25)` over 0.9 s following the ball | Gold near centre |
| 3.92 "Share an idea" | Gold with the ball | **Ant.** Gold's upper edge swells (0.15 s). **Act.** a **sprout** (lime strokes) **grows** from it at `(300,−330)` (0.5 s, tips leading). **Settle** tips overshoot and spring. **Result** two strokes reach across and touch Pink's rim (a shared idea is a join) | slow push `cam(120,−20,1.25)` → `cam(200,−120,1.35)` over 1.0 s | keep camera y=−120 so the tips stay below the band |
| 5.02 "Invite a teammate" | Green enters | **Ant.** the Green offcut rocks 10 u outward (0.2 s). **Act.** a **lime band** draws from Gold toward the right and Green **travels in** to `(420,220)` (0.7 s, heavy ease-in, settle 0.3 with a 10-u bounce) and **joins** the band's end; the ball passes Gold → Green (0.7 s), Green cushions. **Result** the mass, now far from the ball, shrinks to tone 0.4 | pan `cam(200,−120,1.35)` → `cam(300,80,1.35)` over 1.0 s including all three | Green at (420,220) inside ±480 |
| 7.26 "Listen to their ideas" | Triangle of offcuts | **Ant.** Pink's right edge flexes toward Green (0.15 s). **Act.** the ear, once: a **pink crescent offcut** 380×300 **grows** from Pink's right edge at `(−120,120)` opening toward Green (0.5 s); Green grows its own small sprout at `(560,−20)` and a **plum ripple** (three pink×green arcs) **travels** from it into the crescent (0.8 s) and **joins** it. **Settle** the crescent rocks once. **Result** the camera **pans as the listening**, from Pink to Green and back to the crescent | rotate+pan `cam(300,80,1.35,0°)` → `cam(60,80,1.4,−5°)` over 1.4 s ending on the triangle | vertices inside ±480 |
| 9.2 follow-through | Triangle | The ball returns Green → Pink (0.75 s) along a **plum band** and stops with a bump; the three bands close a triangle in the three overprint colours | push `cam(60,80,1.4,−5°)` → `cam(−200,180,2.0,−5°)` over 1.25 s onto the ball | ball 100 u → 200 u on screen |
| 10.45–11.10 seam | | | | |

**Seam:** Passage through the **ball's navy pentagon** → reveals a **different composition**: the whole Picture at 0.75×, wider, with a blank edge (ch 6).

Football truth: 7v7 build-out — pressure closes on the carrier, pass to the support angle, cushion, a third player offers a new angle, the ball moves again; passes 0.7–0.75 s.

---

## Chapter 6 — "Still yourself" (9.3 s) — headline: ROOM (arrives at 3.54)

Narration: *You can learn new things and still be yourself. A team grows when there is room for each person in the picture.*

**Background this chapter:** the whole Picture at 0.75× — all three plates overlapping, the slot (ch 4) at the goal corner and the three lanes (ch 5) in the circle still printed, the sheet's **torn paper edge** at `x = ±700, y = ±520`, chips along it. A pale navy contour of a **new offcut** ("New", seed `N1`, 240×240) waits outside the right paper edge at `(780,0)`.

| t + words | Composition | Cue action (Ant. → Act. → Settle → Result) | Camera key | Phone note |
|---|---|---|---|---|
| 0.00 "You can learn" | Whole Picture | **Ant.** Pink's upper-right edge dimples (0.15 s). **Act.** Pink **grows a lobe** there (`P1` → `P1+lobe`, 3 drawn frames, ease-in growth, tip leading). **Settle** the lobe overshoots and springs. **Result** a lime sliver blooms where the lobe crosses Gold | `cam(0,0,0.75)` hold 0–1.66 | the whole Picture fits |
| 1.66 "still be yourself" | Same | **Ant.** the rest of Pink flexes (0.15 s). **Act.** its contour **redraws to exactly `P1`** with the lobe kept (2 drawn frames) and its rim band re-prints. **Settle** register snaps. **Result** the lobe's chips settle | push `cam(0,0,0.75)` → `cam(−100,−40,1.05)` over 1.3 s onto Pink | Pink centred |
| 3.54 "A team grows" | The right paper edge; **headline ROOM** | **Ant.** the edge draws in 20 u (0.2 s). **Act.** the **composition expands**: the paper edge tears outward 220 u (0.7 s, long ease-out), Green extends into the new area with a fresh mown band, the goal plate slides right 120 u, all forms loosen 3 % apart. **Settle** the new edge quivers. **Result** six chips flutter off the tear; the camera eases out its permitted 4 % (1.05 → 1.01) as the sheet breathes | pan `cam(−100,−40,1.05)` → `cam(320,20,1.01)` over 1.2 s toward the new edge | new edge at the right edge on 390-wide phones (the edge is the point) |
| 4.86 "room for each person" | New enters | **Ant.** New rocks outward 10 u (0.2 s). **Act.** New **travels in** to `(600,60)` (0.8 s, heavy ease-in) and **joins** the sheet: Pink and Gold both print its shape in the same place → New is orange, an overprint no single plate owns; its rim band prints; an orange band connects it to the circle's triangle. **Settle** 10-u bounce. **Result** the mown band beneath it dips and recovers | rotate `cam(320,20,1.01,0°)` → `cam(200,0,1.1,2°)` over 1.5 s including Pink, Gold, Green, New | all four inside core |
| 6.9 follow-through | Complete grown Picture | The navy plate **re-presses once** (one registration shift, seed = chapter 6, a 3-px shiver that decays over 0.5 s): the sheet is finished; orange, lime and plum all visible together ≥ 1.2 s | slow push `cam(200,0,1.1,2°)` → `cam(120,20,1.2,2°)` over 2.0 s | Pink, Gold, Green, New, slot, triangle inside core |
| 8.65–9.30 end | Hold the finished print; lead objects do one small settle (§4d end card) | — | hold | — |

**Seam:** none — last chapter.

Football truth: no football action is named; the pitch furniture stays correct while the sheet grows.

---

## Delight (§4d)

**Touch reaction — pigment blot.** `touch(sheet, x, y, age)`: a torn-edge blot r=60 blooms at the point over 0.25 s (ease-out, overshoot to r=66), printed in the **next ink in print order after whatever is under the finger** (on Green → pink blot = plum; on Gold → pink = orange; on Pink → green = plum; on paper → yellow), so every blot **overprints with what it lands on**; holds 0.3 s; three chips flutter off its edge and settle by 0.8 s; the blot then fades off-register. Reduced motion: a single static blot. ≤ 6 live.

**Secondary motion (seeded, bounded):** offcut chips flutter off a torn edge whenever a plate lands, slides or is cut (0.5–0.6 s, gravity, settle); a 3-px registration shiver on every plate slap decaying over 0.4 s; sprout tips quiver after growth; mown bands bow away from a push and recover; the paper ring dents under the pressure mass; a chip-burst at the missed shot; the residual sway of the last force between cues.

**End card:** the finished print holds; Pink, Gold, Green and New each do one small rim-band re-press (a 2-px settle) in sequence.

## Shapes needed

From the shared library (§3): `field(torn)` (plates, sheets, pressure mass), `chalkStroke`, `laneArrow` (the overprint bands are two `fill` strips, one per plate — no arrow head), `goal(w,h,depth)` (navy plate variant), `ripple` (plum arcs), `sparkBurst` (chip burst), `speedLines` (wedge smear direction only), `eye` (once, as a knockout blot), `ear` (once, as a crescent offcut), `sun disc` (paper knockout).

Story-specific (author in `lib/paths/riso/stories/place-picture.ts`, not the library):
- `plate(seed, w, h, blend?, squash?)` — torn silhouette per seed (`P1`, `Y1`, `G1`, `N1`) with body 0.35 + rim 0.9, optional blend toward another seed and a squash/sag deformation under pressure.
- `mownBands(rect, step, bow)` — horizontal stepped bands inside Green, bowing away from a push.
- `slot(seed, cut)` — paper knockout in a plate seed's shape, animating from a rough oval to the exact cut.
- `sprout(origin, n, inks, u)` — a fan of strokes grown along curves, tips leading, with overshoot.
- `afterimages(shape, dir, n)` — misregistered stamped copies behind a rushing offcut, plus the one-frame smear drawing.
- `offcutChips(seed, n, region, force)` — paper/pigment triangles that flutter with gravity and settle.
- `pigmentDisc(r)` — the story's ball; `blot(x, y, ink, age)` — the touch reaction.
- `overlapLens(a, b)` — intersection path of two plates (ch 1→2 aperture; overprint checks).

## What would make this fail (the rejected look)

- Small centred icons: a 90-u paint blob or token ball floating in a flat field. Every dominant form here is ≥ 600 u wide at its key.
- A flat colour background: every field is a grainy halftone body with a stepped rim band, torn edges and chips.
- Words drawn in the artwork, or a headline that is a caption ("A picture of many colours") rather than the one word to keep.
- Illustrating beside the words instead of enacting them: a pressure cue where nothing is pushed or deformed; a "room" cue where nothing expands; a "quick" cue without overshoot.
- Reusing another story's imagery: no boot, hand, bubble, radio, water or washes. The eye and ear appear once each, in pigment.
- Unrelated symbols; tiny icon grids; full-body figures or faces.
- Reverse zoom; hard cuts; a seam revealing the same composition at another zoom; flat holds > 1.5 s; idle wobble.

## Self-check (muted playback)

Sound off: ch 1 shows a pink shape pushed by a navy mass until it squashes into a pale copy of the yellow one, springing back as the plates slap down one by one and new colours bloom where they cross. Ch 2 shows the plates pressed into one yellow sheet, a shape-sized hole torn out and falling, then the sheets fanning back into their own colours with the pink one redrawing its own edge — and the one word DIFFERENT. Ch 3 shows four things a plate can do: hold dead still, sprout strokes, rush with stamps, open and look (the camera does the looking), then line up as one plate's contents. Ch 4 shows a slot opening to receive the pink shape, re-cut to its exact outline, staying open through a shot that slips wide and drops and a pass that skids past. Ch 5 shows a mass crumpling the pink shape, a ball travelling an orange band to a teammate who cushions it, an idea sprouting across, a green shape arriving to join a lime band, and a plum ripple growing into a pink crescent. Ch 6 shows the pink shape growing a lobe and staying itself, the paper tearing wider as everything loosens, and a new orange shape arriving and joining. Each cue is enacted on something; the print explains the narration.

---

## Build ledger (20 Sep 2026)

**Built:** `lib/paths/riso/stories/place-picture.ts` — six scenes on the engine (`playChapters`), inks yellow → pink → green → navy. Story-specific material: `plate` (torn silhouette, knocks the sheet out beneath, 0.6 halftone body + solid rim band), `ghost` (unprinted plate as navy contour), `pitch` (Green plate with stepped mown bands, paper centre circle, navy goal plate with paper mouth), `lens` (re-prints the under-plate inside a blooming disc so the overprint colour appears where intended), `chips` (offcut triangles with gravity), `pigmentDisc` (ball), `sprout`, `band` (two-ink overprint strip), `shapeP` (P1 silhouette). Headlines: Different / Welcome / Offer / Room (ch 1 and 3 none). Touch: pink blot with a yellow echo that drifts off-register, three paper chips.

**Deviations and why:**
- Ch 1 prints a yellow 0.45 field behind everything (the storyboard had bare paper for the "before" state): a bare-paper frame read as sparse against the art-director rule; the ghost contours were also thickened to 13 u to read on phones.
- Ch 2's falling cut-out prints solid yellow with a navy contour instead of 0.6 halftone so the fall reads on a yellow sheet.
- Ch 3's quiet disc, sprout and wedge were scaled up ~1.3× after the first review (the row read as small tokens); the eye blot sits at y=−400 rather than −420 so it clears the landscape band.
- Ch 5's ear crescent is a paper-knocked pink crescent (not a plate) so the plum ripple prints clean into it.
- Chapter 6's pigment furniture (slot, triangle lanes) is printed statically; the "re-press" is the shared shiver on the camera.

**Perf (scripts/riso-perf.mjs, 390×850 @1.5):** median 3.6 ms, p95 16.2 ms, max 18.2 ms, ops median 58 / max 200 (passage frames). Seams: all five pixel-exact (`review-riso-story.mjs`). Live app: PASS at 390×850, 320×568, 844×390, 1440×850 (`scripts/check-riso-place-picture.mjs`).

**Screenshots:** `/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso/place-picture/app-place-picture-<w>x<h>-ch<n>.png` (24 frames + touch + settled per viewport); contact sheet `/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso/review/place-picture.png`.

**Known limitations:** overlap lenses are discs, not the true intersection polygon (an `overlapLens` path op would cost a second clip per plate per frame); the ch 2 duotone is achieved by printing yellow on the pink/green sheets rather than dropping plates; lime lens colour on the yellow field is subtle at 320 wide.

---

## Fix ledger (20 Sep 2026, §1c legibility pass after the 7v7 review)

**What changed (`lib/paths/riso/stories/place-picture.ts`).** The plates stay the picture; the *people* are now cut-paper pictogram figures (`figure()`: head disc + hand-cut torso block + two leg strokes + two arm strokes, role ink knocked out beneath with a navy contour, poses blended by `k`, walk cycle on twos). Pink figure = you, yellow and green figures = teammates, orange figure (pink+yellow printed in the same place) = the newcomer. The ball is `paintBall` (paper disc r 64–66, five hand-cut navy pentagons in a net, pink rim crescent) — the one-pentagon "eyeball" is gone. The goal is `goalPosts` (two navy posts, a bar, a knocked-out paper net over a .28 halftone). Overlap lenses now re-print the *true* intersection of two plates (clip over ∩ under) instead of a disc, so the pink plate no longer reads as an eye.

- **ch1** — pink figure walks onto the pitch (0–1.0 s, legs alternate on twos) beside a standing yellow figure; ghost contours draw on with tips leading (fills the 0–1.62 hold); on "like everyone else" a navy wall slides in from the left and presses the pink figure (leans, slides 60 u) and its **head prints yellow** (the copy); the wall retreats on "Think of a picture"; on "many different colours" the pink plate slaps and the head prints pink again. Camera ends in the pink plate (aperture).
- **ch2** — a figure ghost on each side sheet (yellow: arms out; green: pointing) while every colour is the same; the front figure is a yellow-toned copy of the yellow figure's pose; on "something would be missing" a **figure-shaped hole** tears out and the yellow cut-out tumbles; on "Your team needs" the sheets fan into their own inks and the figures print in their own inks, the pink one refilling the hole; on "without copying" the pink figure changes from the copied pose to its own (arm up) over three drawn frames.
- **ch3** — four pink figures instead of four shapes: standing still (navy ring draws round it, then holds), arms up with the sprout from its head, a run pose with smear + three navy afterimages, a head turned toward the others with a torn paper eye blot inside the head disc (the cross-story "torn knockout blot" eye) and a sight wedge while the camera pans; all four slide into the row at 5.38 and the rim band prints round them.
- **ch4** — a green figure beckons (arm waving on twos) beside a paper spot; the pink figure walks in and steps into the spot on "treated with respect" (green opens its arms); the pink figure kicks a shot wide of the posts+bar+net goal (spark), then an overhit pass past the green figure (green turns to look); the ball rolls home. WELCOME now has someone welcoming.
- **ch5** — the wall presses the pink figure (pressed pose) in 8-u pulses until "Offer a pass" (the 0.7–2.66 hold is gone); pink kicks the orange band pass to the yellow figure's feet (yellow crouches to cushion); "Share an idea" = arm up + sprout from the head; "Invite" = the green figure walks in from the right and receives the lime band pass; "Listen" = pink's head tilts toward green with a small pink ear crescent on the head disc while plum rings travel from green's head; the plum band pass returns.
- **ch6** — plum field (pink .6 + navy .32 tone) instead of navy halftone; the picture with the three figures standing in it; the pink figure raises an arm over three drawn frames with overshoot, settling on "still be yourself" (fills the 0.7–3.54 hold) and stays pink; the sheet tears wider on "A team grows"; the orange figure walks in from the right on "room for each person" and stands in the torn extension. Headline ROOM → **STILL YOU**.

**Kid test (sound off, 390×850 frames in `scratchpad/riso/frames/place-picture/` and app captures in `scratchpad/riso/fix/place-picture/`).**
- ch1 — "A pink paper kid walks onto a pitch next to a yellow kid; a dark wall squashes the pink kid and its head turns yellow like the other one; then the coloured paper slaps down and it goes pink again." PASS.
- ch2 — "Three kids drawn on yellow cards all look the same; a kid-shaped hole falls out of the middle card; the cards fan out yellow, pink and green with a kid on each, and the pink kid does its own pose." PASS.
- ch3 — "Four pink kids: one stands still, one has ideas sprouting out of its head, one runs fast, one turns its head to look at the others; they line up in a row." PASS.
- ch4 — "A green kid waves a pink kid over to a white spot; the pink kid kicks the ball wide of the goal, then passes too hard past the green kid, and the ball comes back." PASS.
- ch5 — "A dark wall squashes the pink kid; it passes to the yellow kid, has an idea, waves a green kid in, and leans its ear to listen." PASS.
- ch6 — "The picture: three paper kids on a pitch; the pink one puts an arm up; the paper tears wider and an orange kid walks in to join." PASS.

**Gates.** `npm run typecheck` clean · `review-riso-story.mjs --id place-picture` → 5 seams pixel-exact, 0 held-seam diffs, 0 errors · `riso-perf.mjs` median 4.4 ms, p95 16.8 ms (passage frames), ops median 73 / max 203 · `check-riso-films-browser.mjs --format 7v7 --title "A Place in the Picture"` PASS ×4 (touch 10.7 % / 3.6 % / 5.3 % / 48 %).

**Remaining limitations.** The green figure on the green pitch (ch4/ch6) relies on its navy contour for contrast; figures are 340–380 u at zoom 1 (about a third of the phone safe height) — the bible's lower bound — because chapters 1, 5 and 6 hold three figures and the picture at once.
