# futsl — "Love Futsl" (Futsal, why a small court makes the game bigger)

Storyboard per RISO_BIBLE §8 (with §1b texture/uniqueness, §4b motion, §4c headline and §4d delight rules). Written 20 Sep 2026 before any drawing. Sources: TRACK audio `/stories/films/futsl/narration.mp3` (54.57 s, `audio:{mode:'track'}`), cues `public/stories/films/futsl/timeline.json` (22 cues: `start`, `text`, `title`, `kind`), unchanged. Each cue is a caption (the tray reads it); the 22 cues are grouped into **7 visual chapters** (composition changes). All times below are **media time** in seconds.

## Conventions used below

- World units: short side = 1080, chapter centre `(0,0)`, x right, y down. `cam(x, y, zoom, rot°)` puts world `(x,y)` at the centre of `sheet.safe`; zoom 1 = 1080 units across the safe region's short side.
- **Core box** `±480 × ±420` is visible on every viewport (390×850, 320×568, 844×390, 1440×850). Everything that must read (the court rectangle, the paint spot, tread marks, the dial hand, wall edges) lives inside it at every camera key. Plank bands and walls extend to `±1300`. On landscape the headline band covers roughly `y < −400` at zoom 1.
- Cue times are the shipped `start` values. "Follow-through" rows are consequences of the cue before them. No audio is added. Chapter starts are cue starts; the seam passage occupies the last 0.65 s before the next chapter's first cue.
- Every cue cell is **Antic → Action → Settle → Consequence** (§4b). Drawn objects on twos; camera, light, passages on ones. When nothing is spoken a **moving hold** continues the last force (a wall's residual press, a spot's rolling settle). Registration re-seeded per chapter.
- **Headline** (§4c): one per visual chapter, not per cue, only where one idea must be kept; chapters 1, 3 and 5 show none. HTML overlay in `IslandLoadingBrush`, cream with navy echo; pops in with a misregistration settle, leaves off-register. Nothing lettered on canvas — the cue `title` strings in `timeline.json` are **not** shown (they are titles/summaries, which §4c forbids); they remain in the transcript panel only.

## Visual chapters (media time)

| Ch | Start | End | Cues inside | Headline |
|---|---|---|---|---|
| 1 | 0.00 | 5.36 | 0.00 court, 3.80 ball | — |
| 2 | 5.36 | 16.56 | 5.36 tight, 10.70 clock, 12.48 expose, 13.70 choices | TIGHTER |
| 3 | 16.56 | 23.30 | 16.56 court (full pitch), 21.10 clock | — |
| 4 | 23.30 | 31.04 | 23.30 eye, 25.18 foot, 26.84 combine, 27.78 maze | SCAN EARLY |
| 5 | 31.04 | 38.20 | 31.04 network, 34.64 attack, 35.50 defend, 36.42 flow, 37.24 think | — |
| 6 | 38.20 | 46.26 | 38.20 court, 40.94 ball, 42.78 foot | EVERY TOUCH |
| 7 | 46.26 | 54.57 | 46.26 globe, 49.26 open | WIDE OPEN |

## Lead imagery (the metaphor objects that carry the story)

**The court itself — a painted rectangle that shrinks and expands; painted lines that travel; a clock hand on the centre circle; tight pink walls; branching lanes; a web of lanes between sole prints.** Every football object is drawn in court-paint material:

| Football thing (only when the narration names it) | Drawn as |
|---|---|
| Ball ("the ball arrives faster", "control the ball", "the ball arrives") | a **paint spot**: a thick blob of blue court paint (grainy edge, one knockout gloss glint), r=60 on wide views, r=120 in tight views — it is the centre spot that has come loose and rolls; it leaves a faint paint smear when it moves fast |
| Player ("a young player", "everyone", "teammates") | a **sole print**: a futsal sole's tread mark (paper knockout tread pattern inside a navy contour, 150×70) pressed onto the floor — futsal is a sole game. You = navy tread; teammates = green treads |
| Pass / combine | the paint spot **slides along a painted lane** (a blue lane band 40 u wide rolled onto the floor as it goes, 0.5–0.8 s), the receiving tread **cushions** by tilting 10° and the spot squashing 6 % |
| Pressure / "tight" / "less room" | **pink walls**: grainy torn pink fields that press in from the frame edges and squeeze the court |
| Time ("less time to wait", "several seconds", "seconds become moments") | the **centre circle as a clock**: a painted blue circle r=110–160 with a navy **hand** that sweeps; slow ticks on the full pitch, a blur of ticks in futsal |
| "Scan", "look around", "think" | the **camera pans as the look** (§4b); "think" = the spot **stops dead** on a held drawing while lanes branch from it |
| Decisions / solutions / routes | **branching lanes**: painted blue lane bands forking from the spot; a closed lane is cut by a wall; the chosen lane rolls solid |
| Goal | the painted **D and goal box** (blue) with a navy goal frame |
| "Everyone becomes part of the game" | a **web**: five tread marks joined by painted lanes |
| "Lessons travel everywhere" | the court's painted lines **extend outward** past the rectangle as lanes to distant small courts |

No eye, ear, hand or speech bubble is used (generic count: 0); the `kind` values `eye`/`think`/`globe` in `timeline.json` are cue kinds, not drawings. Lead imagery not used by any other story in this path: chalk-line leads with chalk marks on a dusty court (chalk, not paint, and its court never changes size); woven-court with threads, knots, shuttles and a cloth; kite-turned with a kite, string, reels and wind bands. None of those uses a resizing painted rectangle, a clock hand, sole prints, paint spots or a web of lanes.

## The one metaphor: the small painted rectangle that holds a bigger game

A futsal court is a painted rectangle you could step over — but go *into* it and everything inside is faster, tighter and closer; come back out and the full pitch feels wide open. The story travels in and out of that rectangle: it is drawn small on a big sheet, we go through its paint into the tight game inside, we visit the wide pitch and watch it fold down into the rectangle, we go into the tightest space of all, then the rectangle sends its lines out across the whole sheet.

| Ch | Where in the court world | Scale | What the metaphor does |
|---|---|---|---|
| 1 | The small rectangle on a wide plank floor | 1× → 2.8× | A small court; the game inside pings; we push into it |
| 2 | Inside the paint spot: the tight court, walls, the clock | tight | Walls squeeze, the spot arrives fast, the clock blurs, a spotlight exposes, lanes branch |
| 3 | Inside the clock face: the full pitch, lines far apart | wide → folded | Slow ticks and space; then the lines fold inward into the small court |
| 4 | Inside the touchline paint: the tightest space | 2× tight | Scan (pan), cushion in a gap, one-two, a maze with one lane through |
| 5 | Inside the route line: the web of five treads | 1× court | Attack/defend/move slide and rotate the whole web; think = a held spot |
| 6 | Inside a floor plank: the small rectangle vs the big one | 1× → 2.2× | The doubt (a small copy); the spot swells through the rectangle; the touch fills the frame |
| 7 | Inside the sole print: the rectangle sending lanes outward | 1× → (lines expand) | Lanes travel to far courts; the lines slide outward until the frame is the full pitch |

Later chapters revisit earlier places at another scale: ch 6's small rectangle is ch 1's rectangle at the same size beside a big one; ch 7's far courts are ch 1's rectangle at 0.25×; ch 3's dial is ch 2's dial at 1.5×; ch 7's final wide pitch is ch 3's pitch with the ch 4 tread marks still printed on it.

## Background world: a painted hardwood court that opens into a wide field (unique to this story)

Construction (all chapters): the floor is **hardwood planks** — horizontal green grainy bands 110 u tall (stepped coverage per plank 0.30 / 0.38 / 0.34 in a seeded sequence, speckled grain in the ink, plank ends staggered), separated by **paper hairline gaps** (knockout 4 u) so the floor reads as boards; over the planks the **painted lines** are blue bands (tone 0.85, crisp but `wob`-wavy edges, a faint darker blue overprint stripe along one edge as roller drag). **Pink walls** are torn grainy fields (tone 0.7, hand-cut inner edges) that press in from the frame edges in the tight chapters; where a wall overlaps a plank the overprint (pink × green) prints a dull brown "shadow" edge, which is the wall's weight on the floor. **The floor reacts to force** (§4b): plank gaps flex (the hairlines bend 6 u) under a wall's push, and the planks nearest a fast pass darken one frame (a squeak). Confetti = **paint flecks** (blue and pink specks 12–30 u) and cream **floor dust** that kick up on fast passes, wall pushes and touches. On the wide pitch (ch 3 and ch 7 end) the same planks *stretch*: bands grow to 260 u tall, coverage drops to 0.16/0.2, gaps widen — a tight court surface opening into a wide pale field. No nested arches, no navy channel, no diagonal ribbons.

How this background differs from the other futsal stories: chalk-line uses a dusty chalk court surface with stepped chalk markings (matte, dusty, marks on a fixed court); futsl's court is glossy painted lines on wooden planks and the court's *size* is the subject; woven-court uses a weft/warp lattice; kite-turned uses streaked sky bands over a torn horizon.

## Inks and role colours

Triple: **pink `#ff48b0`, blue `#0078bf`, green `#00a95c`** + navy `#22366b` (key). Print order green → blue → pink → navy. Paper `#f0ece2`. (Futsal path uniqueness: woven-court uses pink/blue/yellow, kite-turned blue/yellow/green; pink/yellow/green remains for chalk-line.)

| Role | Ink / treatment |
|---|---|
| Paint spot (ball) | blue tone 0.9 blob with grainy edge and one paper gloss glint; heavy-ish: rolls with a settle, squashes on cushion |
| **You** | navy sole print (paper tread knockout inside navy contour) |
| Teammates / support | green sole prints |
| Pressure / opponent | pink walls and pink wedges (torn, grainy) |
| The metaphor material | blue court paint: lines, lanes, the rectangle, the clock circle; the planks (green) as the floor |
| Court lines / clock hand / goal frame | blue paint bands; navy hand and frame |
| Background | planks + paint + walls, above |

Duotone beat: chapter 4, seconds 27.78–29.5 ("every path seems closed"), prints **pink + navy only** — the maze of walls and the navy tread; blue (the paint lanes) and green (the teammate) print back at 28.9 when the solution lane rolls through: the return of the paint *is* the solution.

---

## Chapter 1 — media 0.00–5.36 — no headline

Cues: 0.00 *Did you know that a smaller court can make the game of football feel bigger?* · 3.80 *That's the secret of futsal.*

Background: wide plank floor at 1× (bands 110 u, stepped 0.30/0.38/0.34, hairline gaps), no walls; 8 paint flecks lying still.

Composition at t=0: a **small painted rectangle** (blue bands 14 u, 300×180) at `(0,0)` with a centre line and a tiny centre circle r=24; inside it a **paint spot** r=16. The rest of the sheet is bare planks — the court is small on a big floor.

| t + words | Composition (what fills the frame) | Cue action: Antic → Action → Settle → Consequence | Camera key | Phone note |
|---|---|---|---|---|
| 0.00 "a smaller court" | Small rectangle on wide planks | **Antic**: a paint roller's first dab (a 20 u blue blob) at the rectangle's corner. **Action**: the rectangle **rolls on** — its blue bands draw around the perimeter, tip leading (0.6 s ease-out), then the centre line and circle (0.3 s). **Settle**: the last band overshoots the corner 12 u and is wiped back. **Consequence**: paint flecks spray 30 u from each corner and settle | hold `cam(0,0,1.0)` with a 1 % creep (the small thing must be seen small first) | the rectangle is tiny inside the core box on purpose |
| 0.9 follow-through "make the game feel bigger" | The game inside pings | **Antic**: the spot squashes 10 % against the left band. **Action**: it **pings** end to end inside the rectangle three times (0.3 s each, ease-in-out, smear on twos), rebounding off the bands with a 6 % squash each hit. **Settle**: it rolls to a stop at the centre circle. **Consequence**: each hit makes the struck band bulge 6 u outward and the plank under it darken one frame — the small court is *lively*; the camera is pulled toward it | pan+push `cam(0,0,1.0)` → `cam(−30,10,1.6)` over 1.1 s (0.9 → 2.0; the camera is dragged toward each ping a beat late, drifting with the spot) | the rectangle grows to `±240 × ±145` relative by 2.0 |
| 2.4 follow-through (the inside fills) | Detail rolls on inside | **Antic**: the rectangle's bands pulse 4 u. **Action**: as the camera pushes on, the rectangle's inside **gains detail it did not have when small**: two painted **D's** roll on at 2.4 (0.3 s, tips leading) and two navy **goal frames** print at 2.8 with a 10 u overshoot; the centre circle thickens 4 → 10 u. **Settle**: the D's tips settle. **Consequence**: paint flecks spray from each D's end; the plank hairlines sharpen as they grow (the floor is boards, not a field) | push `cam(−30,10,1.6)` → `cam(0,0,2.8)` over 1.4 s (2.4 → 3.8, ease-in-out): the push *is* "feel bigger" | by 3.8 the rectangle spans `±420 × ±250` relative — inside the core box |
| 3.80 "That's the secret of futsal" | The spot arrives | **Antic**: the spot at the centre circle lifts 30 u (hang 0.15 s). **Action**: a **big paint spot** r=140 drops from above the frame (0.45 s ease-in, heavy) and lands on the centre circle, **squashing** 8 % and splashing eight paint flecks outward 80 u. **Settle**: it rounds out with two decaying bounces (0.4 s). **Consequence**: the centre circle's paint ripples outward one ring (a 0.4 s ring of darker blue overprint); the plank gaps under it flex | push `cam(0,0,2.8)` → `cam(0,20,3.0)` over 0.5 s (dips 20 u on the landing) | the spot centred at r=140 relative: inside |
| 4.71–5.36 seam | | | | |

**Seam:** Passage through the **paint spot's blue paint** (aperture circle r=140 at `(0,0)`) → reveals inside it a **different composition**: the tight court at close range with pink walls at both sides, four sole prints, the centre circle as a clock at the top (ch 2).

Football truth: a futsal court is roughly a quarter of a football pitch's area; the ball is in play far more often and touches are more frequent — "the game inside pings". No specific action is named; the spot's pinging is the only football motion and it is drawn in paint.

---

## Chapter 2 — media 5.36–16.56 — headline **TIGHTER** (arrives at 5.36, leaves at 10.70)

Cues: 5.36 *The space is tighter, the ball arrives faster, and every player is closer to the action.* · 10.70 *There's less time to wait.* · 12.48 *Less room to hide.* · 13.70 *And more opportunities to make a decision.*

Background: planks at tight scale (bands 110 u, stepped 0.30/0.38/0.34); **pink walls** (torn, tone 0.7) parked at `x=±700`, spanning the full height; the blue painted touchlines at `x=±540` and the **clock circle** (blue r=110) at `(0,−420)` with a navy hand pointing up; goal box D at the top under the clock. Paint flecks 10, floor dust 8.

Composition at t=0: **your navy tread** at `(−40,+120)` waiting, sole up; **green treads** at `(−380,−260)`, `(+400,−180)` and `(−300,+340)`; the **paint spot** r=110 is with the green tread at `(+400,−180)` — it will arrive at yours.

| t + words | Composition (what fills the frame) | Cue action: Antic → Action → Settle → Consequence | Camera key | Phone note |
|---|---|---|---|---|
| 5.36 "tighter … faster … closer" | Walls push, spot arrives, treads close | **Tighter** — antic: walls retreat 30 u; action: both **pink walls push in** from ±700 to ±330 (0.7 s ease-in, heavy) and stop with a shove: the touchlines' paint **buckles** (the blue bands bow inward 30 u), plank gaps flex, dust kicks up along each wall's foot; settle: the wall edges shiver 6 u. **Faster** (6.2) — antic: the green tread at `(+400,−180)` tilts back 8° over the spot; action: it plays it — the spot **arrives** along a rolled blue lane to your navy tread at `(−40,+120)` in **0.45 s** (fast, flat, smear on twos, a paint smear behind it); settle: your tread **cushions** (tilts 10°, the spot squashes 6 %, rolls back 10 u); consequence: the plank under it darkens one frame and dust kicks up along the lane. **Closer** (7.0) — action: the three green treads *press in* 120 u each toward the spot (0.5 s) and stop with a rock; consequence: the free space around the spot narrows to r≈200 (a paper knockout lens shrinks with it) | push `cam(0,0,1.0)` → `cam(0,40,1.15)` over 1.0 s (leans into the walls), then a 20 u yank toward the arriving spot at 6.2 (a beat late) | walls' inner edges at ±330 sit inside the core box; the clock at `y=−420` is at the top edge — it is context until 10.70 |
| 10.70 "less time to wait" | The clock blurs | **Antic**: the hand jerks 10° back. **Action**: the **hand sweeps a full turn in 0.6 s** (ease-in, smear on twos) and the clock face's paper fills with pink halftone (tone ramp 0 → 0.6, the pressure of time); **settle**: the hand overshoots 20° and snaps back. **Consequence** (11.2): your tread must play **first time** — the spot leaves along a rolled lane to the green tread at `(−380,−260)` in 0.5 s and is cushioned there; the pink face keeps ticking (the hand twitches every 0.25 s) | pan `cam(0,40,1.15)` → `cam(0,−300,1.15)` over 0.5 s (up to the clock, the pan is the glance at time), then `cam(0,−300,1.15)` → `cam(−160,−80,1.15)` over 0.8 s (back down after the spot) | the clock at relative `(0,−120)` during the glance: inside |
| 12.48 "Less room to hide" | The spotlight | **Antic**: the planks dim 5 % for 2 frames. **Action**: a heavy **navy grainy field** (tone 0.6, mottle) prints over the whole sheet except a **paper knockout spotlight** r=300 on the spot and the tread holding it (0.5 s, the circle irises open from r=0), and three smaller spotlights r=140 pop on the other treads (stagger 0.1 s) — everyone is lit, no one is hidden. **Settle**: each spotlight's edge shivers 6 u then holds. **Consequence**: the walls press in another 40 u (the lit space is even tighter), the touchline paint buckles again | push `cam(−160,−80,1.15)` → `cam(−200,−120,1.3)` over 0.8 s (into the main spotlight) | the main spotlight r=300 at zoom 1.3 = 390 relative: inside the core box |
| 13.70 "more opportunities to make a decision" | Lanes branch | **Antic**: the spot squashes 8 % toward the tread. **Action**: **three blue lanes roll out** from the spot (left, forward, back; 0.4 s each, staggered 0.15 s, tips leading, a roller-drag stripe on each). **Settle**: each lane's tip overshoots 20 u and settles. **Consequence** (14.5): the right wall **pushes** a pink wedge into the forward lane — the lane's paint **cuts** (a torn gap, the lane end curls up, 0.3 s); at 15.0 the tread **chooses the left lane**: the spot slides along it to the green tread at `(−380,−260)`… now at `(−480,−200)` (0.6 s), cushioned; the unchosen back lane fades to tone 0.3; dust kicks up along the chosen lane | pan `cam(−200,−120,1.3)` → `cam(−380,−180,1.25)` over 1.2 s (follows the spot down the chosen lane, a beat late) | the receiving tread at relative `(−100,−20)`: inside |
| 15.91–16.56 seam | | | | |

**Seam:** Passage through the **clock face's pink halftone** (aperture circle r=110 at `(0,−420)` in the outgoing world — the camera pans up to it during the last 0.65 s and goes in) → reveals inside it a **different composition**: the **full-sized pitch**, wide pale planks, painted lines far apart, a big slow dial at the left, one small spot and one tread in a huge space (ch 3).

Football truth: on a futsal court the nearest defender is rarely more than a few metres away (walls at ±330 u ≈ two body lengths), passes are shorter and faster (0.45 s flight), first-time play is common, and every player is always in a passing lane or a pressing position — nobody can drift out of the game. The three lanes (left / forward / back) are the real options; the forward lane closing is the typical trigger to play sideways.

---

## Chapter 3 — media 16.56–23.30 — no headline (the folding lines carry it)

Cues: 16.56 *On a full-sized pitch, a young player might have several seconds to control the ball and look around.* · 21.10 *In futsal, those seconds become moments.*

Background: **wide pitch** planks: bands stretched to 260 u tall, coverage 0.16/0.2, gaps widened to 8 u — a pale wide field; the painted lines are far apart: touchlines at `x=±1300`, goal line at `y=−900`, centre circle r=260 at `(0,+200)`; no walls. Paint flecks 6, dust 10, all still.

Composition at t=0: **paint spot** r=60 at `(−200,+100)` with **your navy tread** (110×50) under it; a **green tread** far away at `(+900,−400)` (revealed by the pan); the **dial** (blue clock circle r=160, navy hand) at `(−500,−380)`, hand at 12.

| t + words | Composition (what fills the frame) | Cue action: Antic → Action → Settle → Consequence | Camera key | Phone note |
|---|---|---|---|---|
| 16.56 "On a full-sized pitch" | Space | **Antic**: the centre circle's paint pulses. **Action**: the pitch lines **roll outward** from the centre circle to the far touchlines (0.8 s, tips leading; the roller stripes are long and slow). **Settle**: line tips overshoot 20 u. **Consequence**: the spot *arrives* from off-frame left in a **slow high pass** (1.1 s flight, a paper knockout shadow ellipse travels under it, the spot itself grows 60 → 72 then back), lands, bounces twice (heavy, decaying) and is **cushioned** by your tread (tilt 10°, squash 6 %) at 17.9 | pan `cam(−200,100,1.0)` → `cam(250,−50,1.0)` over 1.2 s (across the wide field: the space is felt by the travel) then back `→ cam(−150,60,1.0)` over 0.8 s to the landing | the far green tread at `(+900,−400)` is only in frame during the pan — intended |
| 18.8 follow-through "several seconds to control the ball and look around" | The look-around | **Antic**: 0.2 s camera dip. **Action**: the **camera pans as the look**: left (19.0, 0.5 s) to the dial — its hand **ticks once** (a 30° step with a 5° overshoot); right (19.8, 0.5 s) to the far green tread — tick two; back to the spot (20.6, 0.5 s) — tick three. **Settle**: each pan overshoots 20 u. **Consequence**: the spot rolls 20 u and stops each time the look returns (a second and third touch); three ticks = three seconds of room | rotate+pan `cam(−150,60,1.0,0°)` → `cam(−420,−260,1.0,+4°)` → `cam(+300,−200,1.0,−3°)` → `cam(−150,60,1.0,0°)` (three pans of 0.5 s with 0.3 s holds) | the dial at relative `(−80,−120)` during its pan: inside |
| 21.10 "In futsal, those seconds become moments" | The pitch folds into the court | **Antic** 0.25 s: the far lines *inhale* outward 30 u. **Action**: the **touchlines slide inward** from `x=±1300` to `±540` and the goal line from `y=−900` to `−520` (0.9 s ease-in, heavy, paint smearing behind them as they drag across the planks); the planks **compress** with them (bands 260 → 110 u, coverage 0.16 → 0.34, gaps 8 → 4) until the small court's rectangle stands around the spot. **Settle**: the lines overshoot inward 30 u and rebound. **Consequence**: the **dial shrinks** r 160 → 70 (0.6 s) and its ticks *quicken* (4 ticks in 0.8 s, hand smeared); the far green tread is carried in to `(+300,−120)` by the folding; at 22.3 **pink walls** press in to the new touchlines (0.4 s), plank gaps flex | push `cam(−150,60,1.0)` → `cam(0,0,1.35)` over 1.1 s (the world folds inward while the camera pushes forward: both move forward, no reverse zoom) | at zoom 1.35 the new touchlines at ±540 = ±730 relative — off the core box on purpose (the walls at ±540 define the edge); the spot and dial inside |
| 22.6 follow-through | Play now | **Antic**: the spot squashes toward the tread. **Action**: your tread must play now — the spot slides along a rolled lane to the green tread at `(+300,−120)` in **0.4 s** (fast smear). **Settle**: green cushions. **Consequence**: dust kicks up along the lane; the dial's hand blurs | hold `cam(0,0,1.35)` with a 15 u yank toward the pass | — |
| 22.65–23.30 seam | | | | |

**Seam:** Passage through the **near touchline's blue paint** (aperture: a rounded segment 320×90 of the painted band at `(+540,0)`, which the camera slides to during the last 0.65 s) → reveals inside it a **different composition**: the **tightest space** — a close-up of a gap between two pink walls with a big navy tread and a big paint spot (ch 4).

Football truth: on a full pitch a young player may have 2–3 s on the ball; the same situation in futsal gives well under a second, so control and look must happen *before* the ball arrives — which is what the next chapter teaches. The slow high pass (1.1 s) vs the 0.4 s futsal pass is the literal difference.

---

## Chapter 4 — media 23.30–31.04 — headline **SCAN EARLY** (arrives at 23.30, leaves at 25.18)

Cues: 23.30 *You learn to scan before the ball arrives,* · 25.18 *control it in tight spaces,* · 26.84 *combine quickly with teammates,* · 27.78 *and create solutions when every path seems closed.*

Background: planks at 2× tight scale (bands 220 u, stepped 0.30/0.38/0.34, gaps 6 u); **two pink walls** very close at `x<−380` and `x>+360` (torn inner edges), a third pink block below `y>+420`; paint flecks 12, dust 12. From 27.78 a **maze** of pink blocks (3×3 torn rectangles 150×110 with 40 u gaps) fills the lower right.

Composition at t=0: **your navy tread** (220×100) at `(−120,+200)`; the **paint spot** r=120 is *off-frame left*, arriving; **green tread** at `(+330,−120)`; the space between the walls is a paper-bright gap 740 u wide.

| t + words | Composition (what fills the frame) | Cue action: Antic → Action → Settle → Consequence | Camera key | Phone note |
|---|---|---|---|---|
| 23.30 "scan before the ball arrives" | The scan (three pans) | **Antic**: 0.15 s camera dip. **Action**: the **camera pans as the scan**: left (23.4, 0.15 s + 0.2 s hold) revealing the left wall's edge; right (23.8, 0.15 s + 0.2 s hold) revealing the green tread; up-right (24.2, 0.15 s + hold) revealing the gap in the walls at the top-right. **Settle**: each pan overshoots 15 u. **Consequence**: the spot **arrives** from the left during the scan (flight 0.65 s, lands 24.3) — the scan finished *before* it arrived; the plank under the landing darkens one frame | pan `cam(0,0,1.0)` → `cam(−160,0,1.0)` → `cam(+180,−60,1.0)` → `cam(+120,−200,1.0)` (three saccade pans) | each saccade's target inside the core box; the spot lands at `(−140,+160)` relative to the last key = inside |
| 25.18 "control it in tight spaces" | Cushion in a gap | **Antic**: the tread tilts back 8°. **Action**: your tread **cushions** the spot (tilt 12° toward it, the spot **squashes** 8 % and rolls 20 u back), then two **small touches** (sole rolls: the tread slides 40 u over the spot each, 0.25 s each, on twos) keep it within 90 u. **Settle**: the spot rocks to rest. **Consequence**: the walls **push in** to 260 u apart (0.5 s, heavy) — the paper gap narrows around the spot, the touchline paint (a fragment visible at the left) buckles, dust and paint flecks kick up along both wall feet; a paper knockout wedge marks the tiny space that is still yours | pan `cam(+120,−200,1.0)` → `cam(−100,180,1.2)` over 0.8 s (down to the tread; the camera leans 20 u into the walls' push) | the 260 u gap and the tread centred |
| 26.84 "combine quickly with teammates" | One-two | **Antic**: the tread tilts toward the green tread. **Action**: the spot slides along a rolled lane to the **green tread** (0.5 s, smear) — green **cushions** and returns it **first time** (0.5 s) into the space *behind* the right wall, which had lunged 80 u toward the first pass. **Settle**: the spot is cushioned by your tread, which has moved 160 u up-right during the exchange (moving after passing). **Consequence**: the right wall, having pushed the wrong way, *sags* (its inner edge droops 30 u) | pan `cam(−100,180,1.2)` → `cam(+160,60,1.2)` over 0.5 s (with the pass) → `cam(+40,−60,1.2)` over 0.5 s (with the return) | both treads inside `±300` |
| 27.78 "create solutions when every path seems closed" | Maze, then the lane (**duotone pink + navy 27.78–28.9**) | **Antic**: the spot squashes toward the tread. **Action**: **pink blocks push in** from three sides (0.6 s, heavy, staggered 0.08 s) and lock into a 3×3 maze around the spot, every lane cut — the blue and green plates *drop out* (duotone: only the pink maze and the navy tread remain), the plank gaps flex under the blocks, dust bursts; **settle**: the blocks shudder and stop. **Consequence** (28.9): the **paint returns** — a **blue lane rolls** through the one 40 u gap between two blocks (0.5 s, tip leading, squeezing: the lane narrows to 24 u in the gap and widens after) and the green tread prints beyond the maze at `(+420,−300)`; at 29.4 your tread **sole-rolls** the spot sideways along the lane (0.7 s, the spot squashes 10 % through the gap, paint smears on the blocks' corners) to the green tread, cushioned; the blocks it passed *deflate* 10 % | rotate+push `cam(+40,−60,1.2,0°)` → `cam(+140,−140,1.35,+10°)` over 1.4 s (into the maze gap; the roll makes the maze feel tight), then a 20 u drag along the lane at 29.4 | the gap at relative `(+60,−40)`: centred |
| 30.39–31.04 seam | | | | |

**Seam:** Passage through the **solution lane's blue paint** (aperture: a rounded segment 300×80 of the lane at the maze gap) → reveals inside it a **different composition**: the **web** — five sole prints joined by painted lanes on the court, both goals small at the top and bottom (ch 5).

Football truth: scanning before receiving (three head checks) is the core futsal habit; controlling in a tight space means a cushioned first touch and sole rolls, not big touches; the wall-pass (one-two) exploits a defender who committed to the first ball; when every lane is closed the sole roll sideways through the smallest gap is the futsal solution.

---

## Chapter 5 — media 31.04–38.20 — no headline (attack / defend / move / think are enacted)

Cues: 31.04 *And because there are fewer players, everyone becomes part of the game.* · 34.64 *You attack.* · 35.50 *You defend.* · 36.42 *You move.* · 37.24 *You think.*

Background: planks at 1× court scale (bands 110 u, stepped 0.30/0.38/0.34); the full small court painted: touchlines `x=±540`, goal box D's and navy goal frames at `(0,−560)` and `(0,+560)` (both in frame, 260 wide); paint flecks 10, dust 10; a **pink wedge** waits above the top goal.

Composition at t=0: **five sole prints** (your navy tread at `(0,+60)`, green treads at `(−360,+240)`, `(−120,−300)`, `(+300,−220)`, `(+360,+300)`) — not yet joined; the **paint spot** r=80 on your tread.

| t + words | Composition (what fills the frame) | Cue action: Antic → Action → Settle → Consequence | Camera key | Phone note |
|---|---|---|---|---|
| 31.04 "fewer players, everyone becomes part of the game" | The web joins | **Antic**: each tread presses 6 u into the floor (a plank darkens). **Action**: the five treads **print one by one** (0.2 s each, a press with a 4 u squash), then **blue lanes roll between every pair** (1.0 s, tips leading, 10 lanes, staggered) — separate forms travel and physically join into a web. **Settle**: each lane's tip overshoots and settles. **Consequence** (33.0): the spot slides to the green tread at `(−120,−300)` (0.5 s) and **every lane tightens** (width pulse 40 → 52 → 40, 0.4 s) — the whole web feels the touch | rotate `cam(0,0,1.0,+6°)` → `cam(0,0,1.0,0°)` over 1.2 s (a reveal of the web settling square) | all five treads inside `±420 × ±320` |
| 34.64 "You attack" | Web slides up | **Antic**: the web leans back 20 u. **Action**: the **whole web slides up** 200 u toward the top goal (0.6 s ease-out, heavy), lanes leaning forward (their roller stripes stretch), the spot passed centre → top tread (0.5 s). **Settle**: overshoot 30 u, settle. **Consequence**: the top goal frame's net (navy hatch knockout) bulges 10 u as the spot nears; dust streams behind the treads | pan `cam(0,0,1.0)` → `cam(0,−180,1.0)` over 0.6 s (dragged up with the attack, a beat late) | the top goal at relative `y=−380`: inside |
| 35.50 "You defend" | Web drops back, compact | **Antic**: the web lifts 15 u. **Action**: the **pink wedge** pushes down from the top goal with the spot (it has the ball: the spot rides its tip) — the **web slides back** 320 u toward the bottom goal (0.6 s, heavy) and **compacts** (the five treads pull to within 300×260, lanes shorten, width 40 → 30). **Settle**: the block rocks and holds. **Consequence**: the wedge, pushing into the compact block, **crumples** at its tip (20 u, 0.2 s) and stops; the plank gaps flex under the block | pan `cam(0,−180,1.0)` → `cam(0,+140,1.0)` over 0.6 s (down with the retreat, then a 10 u jolt on the block) | the bottom goal at relative `y=+420`: at the core box edge — acceptable, the block is the subject |
| 36.42 "You move" | Rotation | **Antic**: counter-turn −5°. **Action**: the five treads **rotate one position** around the ring (each travels to the next tread's spot along the lanes, 0.7 s ease-in-out, smear on twos); the lanes stretch and stay attached (the web turns as one mass, +72°); the wedge is left pressing on empty floor and the spot slips back to your tread as the ring turns. **Settle**: overshoot +80°, settle to +72°. **Consequence**: the wedge sags; dust circles outward from the ring | rotate `cam(0,+140,1.0,0°)` → `cam(0,+60,1.0,−12°)` over 0.7 s (the camera rotates with the ring, a beat late) | the ring inside `±330` |
| 37.24 "You think" | The held spot | **Antic**: the spot squashes 6 % (the last of the rotation's momentum). **Action**: the spot **stops dead** on a held drawing (stuck = wait = think); three lanes **branch** from it (0.15 s stagger) — left, forward through the wedge's gap, back. **Settle**: nothing on twos moves for 0.6 s; the camera creeps. **Consequence**: the wedge shifts 30 u toward the forward lane (pressure reads the thought) — the choice is not made here; it is carried into the seam | push `cam(0,+60,1.0,−12°)` → `cam(0,+40,1.15,−8°)` over 0.5 s, then a 1 % creep during the hold | the spot and three lane stubs centred |
| 37.55–38.20 seam | | | | |

**Seam:** Passage through the **floor plank under the held spot** (aperture: a rounded plank segment 340×110 of green grainy board at `(0,+80)`) → reveals inside it a **different composition**: bare wide planks with **two painted rectangles side by side**, small and large, a pink tint under the small one (ch 6).

Football truth: with five players, every player attacks, defends, rotates and decides on every possession — futsal's universal rotation (the ring turn) is a real tactical pattern; the compact block in front of goal is the defending shape; a pause to decide is drawn as a held frame with the options branching, not as an icon.

---

## Chapter 6 — media 38.20–46.26 — headline **EVERY TOUCH** (arrives at 42.78)

Cues: 38.20 *People often see futsal as a smaller version of football.* · 40.94 *But it doesn't make the game smaller.* · 42.78 *It makes every touch, movement, and decision more important.*

Background: wide planks at 1× (bands 110 u, stepped 0.30/0.38/0.34), no walls; a **pink grainy tint** (tone 0.35, torn edge) under the small rectangle only — the doubt; paint flecks 8, dust 8.

Composition at t=0: **small rectangle** (blue 14 u bands, 300×180) at `(−300,0)` with a spot r=16; **large rectangle** (blue 14 u, 520×320) at `(+250,0)` with a spot r=16; between them four **dashed navy guide lines** will join corner to corner.

| t + words | Composition (what fills the frame) | Cue action: Antic → Action → Settle → Consequence | Camera key | Phone note |
|---|---|---|---|---|
| 38.20 "a smaller version of football" | The copy | **Antic**: the big rectangle's paint pulses. **Action**: four **dashed guide lines** draw from the big rectangle's corners to the small rectangle's corners (0.5 s, tips leading) — the small one is "just a scaled copy"; the **pink tint** prints under the small rectangle (0.4 s, a torn blot). **Settle**: the guide tips overshoot and settle. **Consequence**: the small rectangle's bands *thin* 14 → 10 u (diminished) | pan `cam(−300,0,1.0)` → `cam(100,0,1.0)` over 1.0 s (across both rectangles — the comparison is made by travel) | both rectangles inside `±480` at the end of the pan |
| 40.94 "But it doesn't make the game smaller" | The spot swells through | **Antic**: the small rectangle's spot squashes 10 %. **Action**: the **spot swells** r 16 → 260 (1.0 s ease-out, heavy paint pouring outward with a grainy edge) and **bursts through** the small rectangle — its bands are pushed outward 30 u and *buckle* (deform) but hold; the pink tint is **knocked out** where the spot covers it (the doubt disappears under the game); the guide lines snap (each recoils 40 u); the big rectangle *slides off frame right* (0.6 s). **Settle**: the spot rounds with a 20 u overshoot and two bounces. **Consequence**: paint flecks spray 120 u; the planks around the small court darken one frame | push `cam(100,0,1.0)` → `cam(−300,0,2.2)` over 1.1 s (into the small rectangle with the swelling spot) | at zoom 2.2 the small rectangle spans `±330 × ±200` relative; the spot r=260 fills the centre |
| 42.78 "every touch, movement, and decision" | Three beats | **Touch** (42.78): antic — a **navy tread** (260×120) enters from the bottom and hovers 0.15 s; action — it **touches** the huge spot (a sole roll: slides 60 u over it), the spot rolls 60 u with a paint smear and squashes 6 %, `speedLines`; settle — the spot rocks back; consequence — a plank squeak (darkens) and dust. **Movement** (43.23): antic — the tread tilts; action — the tread **sweeps across the frame** left → right 500 u (0.5 s, smear on twos), leaving a navy tread track; settle — it overshoots 30 u and rocks; consequence — the small rectangle's band it crossed bulges 10 u. **Decision** (43.68): antic — the spot squashes; action — **two lanes fork** from the spot (0.3 s), one is **chosen** at 44.3 (rolls solid, the spot slides 120 u along it, 0.5 s), the other fades to tone 0.3; settle — the spot cushions against the band; consequence — the chosen lane's paint spreads a small pool at its end | pan `cam(−300,0,2.2)` → `cam(−340,+80,2.2)` at 42.78 (0.3 s, to the tread) → `cam(−140,0,2.2)` at 43.23 (0.5 s, along the sweep) → `cam(−240,−40,2.2)` at 43.68 (0.4 s, to the fork) | at zoom 2.2 every beat's subject is within `±200` of its camera key: inside at 320×568 |
| 45.0 follow-through | Rolling | **Antic**: the spot rocks. **Action**: the spot rolls along the chosen lane and across the small rectangle's band (0.6 s), the band flexing under it. **Settle**: it stops with a wobble. **Consequence**: the tread track fades to tone 0.4 | hold `cam(−240,−40,2.2)` with a 10 u drift after the spot | — |
| 45.61–46.26 seam | | | | |

**Seam:** Passage through the **navy sole print's tread** (aperture: the tread mark's rounded rectangle 260×120 at `(−340,+80)` — its paper tread knockouts are the material) → reveals inside it a **different composition**: the small rectangle at the centre of a huge sheet with **lanes radiating** from its four sides toward six far small courts (ch 7).

Football truth: the smaller court does not shrink the game; because every player is close to the ball, each touch (sole roll), each movement (the sweep) and each decision (the fork) happens more often and matters more — the tread scale here is deliberately huge.

---

## Chapter 7 — media 46.26–54.57 — headline **WIDE OPEN** (arrives at 51.4, with the expansion)

Cues: 46.26 *The court may be small, but the lessons travel everywhere.* · 49.26 *Because when players learn to solve problems in tight spaces, the full-sized pitch begins to feel wide open.*

Background: planks at 1× (bands 110 u) which will **stretch to the wide-pitch state** (260 u, coverage 0.16/0.2) from 51.4; paint flecks 12, dust 14; **pink walls** parked at `x=±700` for the 49.26 beat.

Composition at t=0: the **small rectangle** (blue 14 u, 300×180) at `(0,0)` with a spot r=40 and your navy tread; from its four sides **lane stubs** (blue 40 u) 30 u long; **six far small courts** (rectangles 120×72, blue 8 u bands) at radius ≈ 900: `(−900,−300)`, `(−820,+420)`, `(0,−920)`, `(+880,−340)`, `(+840,+400)`, `(0,+900)` — outside the core box, reached by the lanes and revealed by pans. Beyond them, faint far pitch lines (tone 0.3).

| t + words | Composition (what fills the frame) | Cue action: Antic → Action → Settle → Consequence | Camera key | Phone note |
|---|---|---|---|---|
| 46.26 "the lessons travel everywhere" | Lanes travel out | **Antic**: the four lane stubs draw back 15 u into the rectangle. **Action**: **six blue lanes roll outward** from the rectangle's sides, tips leading, to the six far courts (0.7 s each, staggered 0.12 s, ease-out, roller stripes stretching); a small paint spot r=30 **rolls along each lane** and arrives at each far court (1.0 s), squashing against its band. **Settle**: each far court's bands bulge 8 u on arrival and settle. **Consequence** (48.0): inside each far court one **lesson mark** prints (0.15 s stagger): a small tread + spot (control), a two-lane one-two, a fork, a clock circle, a compact block of three treads, a sole-roll smear — the lessons, in paint | rotate+pan `cam(0,0,1.0,0°)` → `cam(−500,−200,1.0,+8°)` over 1.2 s (out along one lane to a far court — the reveal), then `cam(−500,−200,1.0,+8°)` → `cam(0,0,1.0,0°)` over 1.0 s back along a second lane (a pan, never a zoom out) | during the outward pan the far court at `(−900,−300)` sits at relative `(−400,−100)`: inside |
| 49.26 "solve problems in tight spaces" | Tight again, solved | **Antic**: the walls retreat 30 u. **Action**: the **pink walls push in** to the small rectangle's touchlines (0.5 s, heavy, plank gaps flexing, dust), a pink wedge cuts the forward lane; your tread **sole-rolls** the spot sideways (0.4 s) and passes it through a 40 u gap in the wedge to a green tread that prints at `(+200,−60)` (0.5 s, cushioned). **Settle**: the walls shudder. **Consequence**: the wedge, beaten, sags 20 u | push `cam(0,0,1.0)` → `cam(40,−20,1.25)` over 0.9 s (isolate the tight centre court; the camera leans into the walls) | the rectangle at zoom 1.25 spans `±190 × ±110` relative: centred |
| 51.4 follow-through "the full-sized pitch begins to feel wide open" | The lines slide outward | **Antic** 0.25 s: the touchlines *inhale* inward 20 u. **Action**: the **small rectangle's lines slide outward** — touchlines from `±150` to `±1300`, goal lines from `±90` to `±900` (1.2 s, long ease-out), paint smearing behind them across the planks; the **planks stretch** with them (bands 110 → 260 u, coverage 0.34 → 0.18, gaps widen); the **pink walls dissolve** (tone 0.7 → 0, torn edges receding, 0.5 s); the six lanes and far courts are *overtaken* by the expanding lines and become the wide pitch's markings. **Settle**: the lines overshoot 40 u and ease back. **Consequence**: the **composition breathes out**: a paper knockout lens r=520 opens around the spot (0.8 s) — open space; the spot r=120 rests at centre with your navy tread; the green tread is far off at `(+700,−300)` | hold `cam(40,−20,1.25)` while the world expands under it (the expansion, not the camera, opens the frame — no reverse zoom), with a slow 60 u drift toward the spot over 1.5 s | the lens r=520 at zoom 1.25 exceeds the core box — intended: the space is bigger than the screen |
| 53.0 follow-through | The calm look | **Antic**: 0.15 s camera dip. **Action**: the **camera pans slowly as a calm look** left 200 u (0.6 s) and right 200 u (0.6 s) across the empty wide pitch — nothing is closing. **Settle**: it eases back to the spot. **Consequence**: at 53.6 the print re-seeds registration once (a fresh impression); the dust settles | pan `cam(40,−20,1.25)` → `cam(−160,−20,1.25)` → `cam(+160,−20,1.25)` → `cam(0,0,1.25)` (0.6/0.6/0.5 s) | the spot stays inside the core box throughout |
| 54.1–54.57 final hold | | Moving hold: the lens's edge settles, the spot's gloss glint brightens once. No camera travel | hold `cam(0,0,1.25)` | — |

**Seam:** none — end of track; the final print holds until the audio ends.

Football truth: skills learned under futsal pressure (scan early, cushion, sole roll, one-two, play through the smallest gap) transfer to the full pitch, where the same player now perceives far more time and space; the final image is the same player, ball and one teammate on the wide pitch with nobody closing — "wide open" is a perception drawn as an expanding composition.

---

## Delight (§4d)

**Touch reaction — `touch(sheet, x, y, age)`, ≤ 0.8 s:** a **fresh paint tick**: the nearest painted line (or lane, or the rectangle's band; if none within 140 u, the plank under the point) receives a short blue roller dab 60×24 u at the touch point (0.1 s in, holds, fades by 0.6 s) with a paper gloss glint; five paint flecks (blue/pink) spray 40–90 u outward and settle; the plank under the point darkens one frame (a squeak). If the paint spot is within 160 u it rolls 20 u away from the touch and settles. Inks: blue dab, blue/pink flecks, green plank. Reduced motion: a single static blue dab. Max 6 live ticks, oldest recycled; while paused a touch plays one tick and the canvas sleeps.

**Secondary motion that reacts to the main actions:** paint flecks spray from every corner the roller passes and from every wall push; floor dust kicks up along a wall's foot and along any lane the spot travels faster than 0.5 s; plank hairline gaps flex 6 u under walls and blocks and under the swelling spot; the plank under a cushion or a sole roll darkens one frame; the dial hand overshoots on every tick; lane tips overshoot and settle; the goal net bulges as the spot nears it. All seeded, bounded lifetimes, ≤ 1 ms per frame.

**End card:** the ch 7 print holds; the spot does one small settling roll (30 u and back), the tread presses once (a plank squeak), the open lens breathes 10 u; the Replay button appears as a printed stamp. No confetti burst.

## Shapes needed

From the shared library (§3): `dial` (the clock circle and hand), `goal` (navy frame with knockout net), `laneArrow` (as painted lanes, solid and dashed), `chalkStroke` (used for the *painted* lines with a roller-drag overprint stripe — the builder passes a paint variant), `field(kind: torn|wall)` (pink walls, pink tint, the ch 2 navy spotlight field), `pressureWalls(gap)` (pink), `ripple` (one paint ring at the ch 1 landing), `speedLines`. `ball`, `boot`, `eye`, `ear`, `hand`, `bubble`, `thread`, `kite` are **not** used.

Story-specific shapes (author in `lib/paths/riso/stories/futsl.ts`, not the library):
- `planks(bandH, covSteps, gapW, stretch, flex, seed)` — the hardwood floor with hairline gaps, stretch (tight → wide) and flex under force.
- `paintLine(a→b, width, progress, smear)` — a rolled paint band with roller-drag stripe and drag smear.
- `courtRect(w, h, lineW, buckle)` — the resizing painted rectangle with band buckle.
- `paintSpot(r, squash, glint)` — the ball as a paint blob.
- `treadMark(x, y, angle, ink, size, tilt)` — sole print with paper tread knockouts.
- `wallBlock(x, y, w, h, crumple, sag)` — pink torn wall/wedge/maze block with crumple and sag.
- `spotlight(x, y, r)` — paper knockout iris in the ch 2 navy field.
- `web(treads, laneW, tighten)` — lanes between all tread pairs with a width pulse.
- `paintTick(x, y, age)` — the touch reaction.

## What would make this fail (the rejected Astra look)

- A small court icon centred on a flat green background with a title beneath it. The court's *size change* is the story; the floor is grainy planks with hairline gaps; the only words are four one-or-two-word HTML headlines and never the cue titles.
- Walls that appear without pushing anything. Every wall push must buckle the touchline paint, flex the plank gaps and kick dust (§4b).
- A clock icon in the corner. The clock is the centre circle itself with a hand that sweeps and blurs.
- An eye for "scan", a bubble for "think", a globe for "lessons travel". Scan = camera saccades; think = a held spot with branching lanes; lessons travel = lanes rolling out to far courts.
- Full-body players, boots, faces. Players are sole prints; the ball is a paint spot; passes are rolled lanes.
- A tiny grid of six lesson icons in ch 7. The lessons print *inside far courts reached by lanes*, revealed by a pan, at 120×72 u each, and are overtaken by the expanding lines.
- Reverse zoom to show the wide pitch. Ch 3 folds the world inward while pushing; ch 7 expands the lines under a holding camera; ch 7's outward pan returns by a pan.
- A flat pale field for the wide pitch. It is the same planks stretched and lightened, with grain.
- Idle holds between cues. Every gap between cues is a follow-through row or a moving hold that decays the last force.

## Self-check (muted)

Muted, does the film still explain the narration? Ch 1: a tiny painted rectangle on a big wooden floor, a spot pinging inside it, a push in as the inside gains detail, a big spot landing — "small court, bigger game" reads. Ch 2: pink walls shove in and buckle the lines, the spot arrives in a fast smear and is cushioned, treads press closer, the clock hand blurs and the spot is played first time, a navy field with spotlights on everyone, three lanes with one cut by a wedge and one chosen — "tighter, faster, closer, less time, no hiding, decisions" reads. Ch 3: pale wide planks, lines far apart, a slow high pass, three slow ticks with three looks, then the lines slide inward and the floor compresses into the small court while the clock shrinks and ticks fast — "seconds become moments" reads. Ch 4: three saccades before the spot lands, a cushion and two sole rolls as walls squeeze, a one-two around a lunging wall, a pink maze in two inks and one blue lane rolling through the gap — "scan, control, combine, solve" reads. Ch 5: five treads joined into a web, the web sliding up, sliding back and compacting against a wedge, rotating as one ring, then a dead-still spot with three lane stubs — "everyone attacks, defends, moves, thinks" reads. Ch 6: a small copy of a big rectangle with a pink doubt under it, the spot swelling through the small one and knocking the doubt out, then a huge tread touching, sweeping and choosing — "not smaller; every touch matters" reads. Ch 7: lanes rolling out to six far courts that each receive a lesson, a last tight solve, then the lines sliding out until the frame is a wide pale pitch with an open lens and a calm look left and right — "lessons travel, wide open" reads. The weakest silent beat is ch 5 "You think" (a held frame); it is kept because the sudden stillness after a rotation is itself legible and the branching stubs give it content. Every seam names a material the camera enters; every pressure word deforms something; no chapter has a flat background.

---

## Build ledger (20 Sep 2026)

**Built:** `lib/paths/riso/stories/futsl.ts` — TRACK mode (`/stories/films/futsl/narration.mp3`, 54.56975 s). The 22 `timeline.json` cues are the caption chapters (`start` + `text` verbatim; the `title` strings live only in the transcript labels, never on screen). Seven visual scenes (starts 0 / 5.36 / 16.56 / 23.30 / 31.04 / 38.20 / 46.26) run through `playChapters` on an internal `visual` chapter list, so scene seams are forward passages while captions change every cue; the visual scene is chosen from the caption chapter so the caption's last frame equals the passage at progress 1 (all 21 caption seams pixel-exact). Between caption boundaries that are not scene seams the registration offsets are blended continuously (`sheet._passage.blend`), so the print does not jump when a caption changes. Headlines: Tighter (5.36), Scan early (23.30), Every touch (42.78), Wide open (51.4 via a cue headline). Story-specific shapes: `planks` (green bands at three stepped coverages, staggered ends, paper hairline gaps, flex field, plank squeak), `paint` (blue band + navy roller-drag stripe, self-draw), `courtRect` (resizing rectangle with buckle, D's, goal frames, thin), `spot` (paint-blob ball with smear, squash, duotone rim-only mode), `tread` (sole print with paper tread bars and cushion tilt), `wall` (pink torn wall/wedge/maze block with knocked-out floor and a pink×green shadow strip, crumple), `dial` (clock circle with pink face ramp, hand and blur ghosts), `flecks`, `lens`. Touch: a fresh blue paint dab with a gloss glint, flecks spray and settle, the plank squeaks.

**Deviations from the storyboard and why**
- Plank coverages 0.45/0.6/0.5 tight and 0.2/0.32/0.26 wide (storyboard 0.30/0.38/0.34 and 0.16/0.2) so the floor carries weight against the blue paint; the wide pitch is visibly the same planks stretched (260 u bands).
- Scene 6 opens at zoom 1.3–1.4 (storyboard 1.0): at 1.0 the two rectangles on the wide floor were a sparse frame; the big rectangle is 640×390 and the guide lines join its actual corners.
- Scene 7's walls park at x = ±1500 (storyboard ±700) so they are off-frame until "solve problems"; the far courts' lessons print at 120×72 as planned and fade as the lines expand.
- Scene 4's duotone (27.78–28.9) drops the planks and paint entirely (pink maze + navy tread + rim-only spot) — stronger than the storyboard's "blue and green plates drop out", same idea.
- Scene 2's "less room to hide" navy field is a single evenodd fill with the four spotlight irises cut from it (one op).
- The ch 7 re-seed at 53.6 and the storyboard's camera "calm look" are kept as two 200 u pans; no reverse zoom anywhere (scene 3 folds the world while pushing 1.0 → 1.35; scene 7 expands under a held 1.25).
- No 6-way "lesson icon" sprites: the lesson marks are drawn with the story's own tread/spot/paint/dial primitives inside the far courts.

**Gates:** typecheck clean for this file (a pre-existing error in another builder's `stories/grit.ts` line 32 is reported below) · `review-riso-story --id futsl` 130 samples, maxOps 163, 21 caption seams pixel-exact (max 0), zero page/draw errors · `riso-perf futsl` 390×850 DPR 1.5: median 4.2 ms, p95 18.3 ms, max 19.1 ms, ops median 89 · `scripts/check-riso-futsl.mjs` (a track-mode copy of `check-riso-films-browser.mjs`: seek slider instead of chapter dots, 22 transcript paragraphs, scene screenshots through `filmControls.seekTime`, media-time advance check) PASS at 390×850, 320×568, 844×390, 1440×850.

**Screenshots:** `/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso/futsl/app-futsl-{390x850,320x568,844x390,1440x850}-ch{1..7}.png` (scene starts +0.6 s), `-t{4.4,7.2,13.0,19.0,24.6,29.6,33.6,36.9,42.0,44.6,48.0,52.5}.png` (mid-scene), `-touch.png`, montages `montage-*.png`; contact sheet `…/scratchpad/riso/review/futsl.png`.

**Known limitations:** ops median 89 is the highest of the three stories (seven scenes with planks + paint + walls), p95 ~20 ms on passage frames; the wide pitch (scene 3 and the end of scene 7) is deliberately pale and reads lighter than the other scenes; the scene-1 → scene-2 seam (the spot's paint) is 1.56 s after the "That's futsal" caption starts, so that caption spans the passage; captions inside scene 2 (10.7, 12.48, 13.7) change while the camera is mid-move, which is intended (the visuals follow media time, not caption boundaries).

## Fix ledger (20 Sep 2026 · legibility pass, bible §1c + reviews/futsal.md + reviews/cross-story.md + ENGINE.md §10)

**What changed (story file only, engine untouched).**
- **Track mode adopted per ENGINE.md §10**: `visualChapters` (7 starts) with the headlines on the visual chapters (TIGHTER 5.36→10.70 and SCAN EARLY 23.30→25.18 end through a cue with `headline:''`; EVERY TOUCH `{at:4.58}`, WIDE OPEN `{at:5.14}`), `draw` is one line through `trackChapters`, the private `_passage.blend` workaround and the hand-rolled visual-chapter mapping are gone; captions stay on `story.chapters`.
- `figure()` helper (abstract riso pictogram per §1c.4, same code as the other three stories) + `kicker()`: paper + navy contour + blue shade = you; green cut-outs = teammates; pink cut-outs = defenders. The sole prints (`tread`) are gone.
- **The ball is a paper football with painted blue panels** (`paintBall`): a centre pentagon and five rim panels in court paint, navy seams and rim, a gloss glint and a drip of paint running off one panel; smear/squash as before; tiny (r < 24) balls print as a plain paint spot; duotone beat = paper + seams.
- **Floor** (cross-story fix 4): cream paper with pink plank grain at .1/.2 (`WOOD`), blue court paint, pink walls; green (`GRASS`) only for scene 3's full pitch and scene 7's opening pitch, cross-faded through the fold/open.
- Scene 1: the small court has visible pink walls at its sides from the first frame; the painted ball drops onto the centre circle.
- Scene 2 (TIGHTER): you (paper) receive the fast arrival from off-frame with the head already turned toward it, then kick the first-time pass to the **green teammate** (arms out); **two pink defenders** step in; the clock is a **stopwatch** (ring, top button, lugs, tick marks, sweeping hand with blur ghosts) that sweeps on "less time"; the pink walls still press the touchlines; the navy spotlight beat keeps everyone lit.
- Scene 3: a lone player on wide grass with the ball, head turning left and right (sight wedge) while the stopwatch ticks; on "moments" the walls and two pink defenders rush in as the pitch folds to pink wood; the green teammate receives.
- Scene 4 (SCAN EARLY): head turned before the ball arrives; cushion touch with the front foot; the one-two with the green teammate (both kick); the maze is **five pink defenders** running in and locking around you, leaving one gap at the upper right through which the ball goes to the far teammate.
- Scene 5: a player at each of the five web nodes (you = paper, four green); ATTACK — every body leans (run pose) toward the top goal; DEFEND — all crouch back; MOVE — they run round as the web turns; THINK — heads turn with sight wedges. The wedge, lanes and turn are unchanged.
- Scene 6 (EVERY TOUCH): a real **boot** (side view, studs, tongue, laces, navy) enters, rolls the huge painted ball on its toe, sweeps across leaving its track; the lanes fork and one is chosen.
- Scene 7 (WIDE OPEN): the six far courts keep their lesson marks (tiny figures, stopwatch, lanes); the walls press, the wedge cuts, you kick the sideways pass to the green teammate; then the **walls dissolve** while you stand at the centre spot with both arms up as the pitch grows wide and green — the closing paper ring (lens) is gone.
- **Touch** ×2–3: a 200 u blue roller stroke with a navy drag edge, a glint, two drips that run down, a paint-fleck spray and a plank squeak.

**Kid test (sound off, contact sheet + track captures at 0:02 / 0:05 / 0:14 / 0:23 / 0:32 / 0:41 / 0:50).** 1 "A tiny court with pink walls; a big painted football drops onto it." · 2 "A player on a tight court with a stopwatch above; a green teammate and two pink defenders close in while pink walls squeeze; the ball is passed." · 3 "One player alone on a big green pitch with the ball looks left and right while a stopwatch ticks; then pink walls and defenders rush in." · 4 "Pink defenders surround the player; the ball goes through the one gap to a green teammate." · 5 "Five players stand in a ring with painted lanes between them; they lean, crouch, run round and look." · 6 "A boot kicks a huge painted ball next to a small court and a big pitch." · 7 "Pink walls squeeze and melt away; a player on a wide green pitch throws both arms up with the ball at their feet." — all describable, all match the meaning.

**Gates.** typecheck clean · `review-riso-story --id futsl`: 36 samples on the 7 visual chapters, 6/6 seams pixel-exact, 0 errors, maxOps 169 · `riso-perf futsl`: median 4.3 ms, p95 16.7, max 17.2 · `check-riso-films-browser --track --title "Smaller court. Bigger game." --paragraphs 22`: PASS ×4 (touch bursts 30.5 / 9.8 / 17.4 / 48.1 % pixels). Screenshots: scratchpad `riso/fix/futsl/` (`phone-strip.jpg` = start, t 5/14/23/32/41/50, touch); contact sheet `riso/review2/futsl.png`. Headline leave check (cross-story §4): the captures at 0:14 and 0:23 show no TIGHTER / SCAN EARLY (they end at 10.70 / 25.18 through the visual-chapter cues), 0:41 and 0:50 show none yet (EVERY TOUCH and WIDE OPEN arrive at 42.78 / 51.40).

**Limitations.** Scene 5's five figures are 300 u tall (five in one frame; the ≥ 500 u guideline cannot hold for a ring of five). Scene 4's tight walls leave a narrow strip on phones during 2.6–4.5 s, which is the intended squeeze but makes the player small until the maze opens the frame. The paint drip is fixed to one panel, so it does not swing with the ball's rotation.
- Follow-up (touch gate): the engine's touch assertion now requires ≥ 2 % of a 120 px box to change at +0.3 s. The old roller dab measured 1.3 %; the rewritten reaction (200 u stroke, navy drag edge, two drips, spray) measures 29.8 / 9.8 / 17.9 / 48.1 % at 390×850 / 320×568 / 844×390 / 1440×850, with the blue held at ≥ .8 coverage for the whole 0.8 s life. All four futsal stories re-checked after the engine's seam-snap and compact-viewport (~.7) changes: browser PASS ×4 each, reviews 0 seam diffs / 0 errors.
