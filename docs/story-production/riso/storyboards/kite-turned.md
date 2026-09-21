# kite-turned — "The Kite That Turned" (Futsal, adapting when plans change)

Storyboard per RISO_BIBLE §8 (with §1b texture/uniqueness, §4b motion, §4c headline and §4d delight rules). Written 20 Sep 2026 before any drawing. Sources: narration/labels `lib/paths/films/futsal.ts` (`kite-turned` beats), cue onsets `lib/paths/films/phraseFilmScores.ts["kite-turned"]`, chapter seconds `narrationTiming.json` → `[9.883, 9.983, 8.683, 10.283, 9.683, 11.485]`. Audio `/stories/narration/futsal/kite-turned/{01..06}.m4a`, unchanged.

## Conventions used below

- World units: short side = 1080, chapter centre `(0,0)`, x right, y down. `cam(x, y, zoom, rot°)` puts world `(x,y)` at the centre of `sheet.safe`; zoom 1 = 1080 units across the safe region's short side.
- **Core box** `±480 × ±420` is visible on every viewport (390×850, 320×568, 844×390, 1440×850). Everything that must read (kite, reels, string foot, the gap, tree crowns' leading edges) lives inside it at every camera key. Sky bands and the ground field extend to `±1300`. On landscape the headline band covers roughly `y < −400` at zoom 1; the kite's top corner may cross it only during a climb that is itself the point.
- Cue `at` values are the shipped word onsets (three per chapter). "Follow-through" rows are consequences of the cue before them. No audio is added.
- Every cue cell is **Antic → Action → Settle → Consequence** (§4b). Drawn objects on twos; camera, light, passages on ones. When nothing is spoken a **moving hold** continues the last gust as a decaying sway of the kite and tail. Registration re-seeded per chapter. Seam passage = last 0.65 s of each chapter.
- **Headline** (§4c): only where one idea must be kept; chapters 2, 5 and 6 show none. HTML overlay in `IslandLoadingBrush`, cream with navy echo; pops in with a misregistration settle, leaves off-register. Nothing lettered on canvas.

## Lead imagery (the metaphor objects that carry the story)

**Kite (yellow diamond sail, navy spars, five tail bows), the string, wind streaks/gusts, the angle of the sail, the reel it is anchored to, tree crowns that catch kites.** Every football object is drawn in kite material:

| Football thing (only when the narration names it) | Drawn as |
|---|---|
| Ball ("keep the ball close", the pass) | **the kite itself** — the thing in play; whoever holds its string has it. Keeping it close = reeling the string short; a pass = the string is handed across and the kite swings on the wind to above the receiving reel (0.65–0.8 s); the receiver "cushions" by letting out 20 u of string as it arrives |
| You | **yellow reel** (a flat winder disc r=90 face-on, string wound on its rim, navy contour, yellow tone 0.6) standing on the ground; your kite is yellow |
| Teammate / support | **blue reel** (same form, blue tone 0.6) and its **blue kite** |
| Defender / pressure ("a defender may close your forward pass") | **tree crown**: a green torn grainy mass (400–560 u) that rises from the horizon into the sky and *catches kites* — it leans toward the kite and overprints whatever it touches (green × yellow = yellow-green: a caught sail) |
| Route / forward pass / different route | the **string's path**: navy dashed line in the sky between wind bands; a closed route = the string jammed in a crown |
| Sideways / backward pass | the string foot transfers from one reel to the other and the kite swings across the sky |
| Support angle | the reel rolling along the ground to a new spot (a reel is round: it rolls) |

No eye, ear, hand or speech bubble is used (generic count: 0): every "look / notice / scan" is performed by the camera panning as the look (§4b). Lead imagery not used by any other story in this path: chalk-line leads with chalk marks on a dusty court; woven-court with threads, knots, shuttles and a cloth; futsl with the painted court surface shrinking and expanding, a clock hand and tight walls. None of those uses a kite, string, reels, wind bands or tree crowns.

## The one metaphor: a kite in changing wind

A kite stays up by changing its angle, not its purpose: the string stays anchored to the same reel while the sail turns to meet a new wind. When the wind you expected is gone (a tree crown in the way), the answer is to reel in, look sideways, hand the string across and let the kite find a different route to open sky. The world is one **kite field over a futsal court**: a sky of wind bands above a torn green horizon that is the court; reels stand on the court; crowns rise from its edge.

| Ch | Where in the kite field | Scale | What the metaphor does | Headline |
|---|---|---|---|---|
| 1 | Ground level: your reel, the string climbing right, a crown rising into it | 1× | The expected route is blocked; the string jams; the camera looks up | LOOK AGAIN |
| 2 | Inside a tail bow: the wide sky, kite, gusts, string down to the reel | 0.8× | Gusts push the sail; it turns to stay aloft; the reel never moves | — |
| 3 | Inside the sail: the fabric, wind streaming across it | 4× | The composition breathes out; the jammed string slackens; a second route appears | BREATHE |
| 4 | Inside the breath ring: the court oblique, crown vs forward route | 1× | Reel in short; the camera scans; string handed sideways; time opens | SIDEWAYS |
| 5 | Inside the wind band the kite crossed: the court from the side, two crowns | 1.1× | Reel rolls to a new angle; backward hand-off opens the gap; kite goes through | — |
| 6 | Inside the yellow reel: the whole field, small court, big kite | 0.6× | The crumpled route becomes the string; notice/choose/adjust as three turns; open sky | — |

Later chapters revisit earlier places at another scale: ch 6's small court is ch 1's ground seen from high above (the same crumpled navy route is still on it); ch 5's gap is ch 4's crown seen from the side; ch 6's kite is ch 2's kite at the same angle it finally chose.

## Background world: wind-streaked sky bands over a torn horizon (unique to this story)

Construction (all chapters): the sky is **5–7 horizontal wind bands** — broad blue grainy ink fields (stepped coverage 0.16 / 0.24 / 0.32 rising toward the top of the frame; speckled grain throughout) whose long edges are **streaked**: each band's edge is a `wob` line stretched into wind-combed tails (dashes 60–200 u long trailing to the right), with paper showing between bands. Below, a **torn green horizon field** (tone 0.55, mottle 0.4, hand-cut top edge) is the court; a single navy court line runs along it. **The bands are the wind**: they slide right with each gust (band offset = gust envelope × 80 u), their streak tails lengthen at the gust's peak and relax after, and the horizon field's torn edge lifts 10 u as a gust passes (grass in wind). Confetti = **leaf fragments** (green torn flecks 20–40 u) and cream paper bits blown along the bands, scattering on every gust and crown push. Chapter 3, inside the sail, has no horizon: the sail's yellow grainy fabric field with the wind bands crossing it as blue streaks (blue × yellow = green streaks: the wind visibly *on* the fabric). The horizon height changes per chapter (ground level `y=+200` in ch 1, `+520` in ch 2, `+300` in ch 4, `+260` rotated in ch 5, `+560` in ch 6). No nested arches, no navy channel, no diagonal ribbons.

How this background differs from the other futsal stories: chalk-line uses a dusty chalk court surface with stepped court markings; woven-court a weft/warp lattice with overprint cells; futsl a painted hardwood court (plank bands and painted lines) that expands into a wide field. Only kite-turned has a sky of streaked horizontal wind bands and a torn horizon.

## Inks and role colours

Triple: **blue `#0078bf`, yellow `#ffe800`, green `#00a95c`** + navy `#22366b` (key). Print order yellow → blue → green → navy. Paper `#f0ece2`. (Futsal path uniqueness: woven-court uses pink/blue/yellow, futsl pink/blue/green; pink/yellow/green remains for chalk-line.)

| Role | Ink / treatment |
|---|---|
| **You / your kite / your reel** | yellow: sail 380×520 diamond tone 0.7 with grain, **knocked out of the blue plate** (a real kite is opaque paper: no green where it crosses a band); navy spars 12 u; tail bows yellow; reel yellow tone 0.6 |
| Teammate / support | blue kite (same knockout rule) and blue reel, tone 0.6–0.7 with navy contour — distinguishable from wind bands by solid contour and density |
| Pressure / opponent | green tree crowns: torn grainy masses tone 0.7, navy torn edge line; they **overprint** (green × blue = deep teal on bands; green × yellow = yellow-green on a caught sail) |
| Purpose / string / routes | navy: string = `thread` width 8 with slack/taut states; routes = navy dashed lanes |
| Wind / sky | blue bands, low coverage (above) |
| The metaphor material | the sail (yellow fabric), the string (navy), the wind bands (blue) |

Duotone beat: chapter 3, seconds 0–3.4 ("Adapting means responding to what is happening now"), prints **yellow + navy only** — the sail fabric and the jammed string; the blue wind plate prints at 3.4 with the breath, so the *wind arriving* is the visible breath. Green is absent from ch 3 except the crown fragment at the corner.

---

## Chapter 1 — "When the plan changes" (9.883 s) — headline **LOOK AGAIN** (arrives at 7.68)

Narration: *What happens when the option you expected disappears? You might feel frustrated or stuck. That feeling signals a need to look again.*

Background: sky bands with the horizon at `y=+200` (ground level view: the green field fills `y > +200` to `+1300`), bands stepped 0.16/0.24/0.32, streak tails 80–160 u trailing right (a steady wind); leaf confetti 10 flecks moving right at 20 u/s. Navy court line along `y=+240`.

Composition at t=0: **your yellow reel** r=90 at `(−260,+200)` standing on the horizon. The **string** (navy 8 u) rises from the reel up-right along the expected route toward `(+560,−520)` (off the top-right: the kite is above the frame, only its lowest **tail bow** will enter). A paper knockout **sky gap** (a bright opening between two bands, 300×160) at `(+420,−380)` — the expected option. A **tree crown** (green torn mass 520×460) waits below the horizon at `(+380,+700)`.

| t + words | Composition (what fills the frame) | Cue action: Antic → Action → Settle → Consequence | Camera key | Phone note |
|---|---|---|---|---|
| 0.00 "What happens" | Reel, string climbing right to the gap | **Antic**: the reel rocks 10 u back. **Action**: the string *pays out* from the reel, tip leading up-right along the route (0.7 s ease-out) until it leaves the frame toward the gap; the reel spins (rim string visibly unwinds). **Settle**: the string overshoots to a bow and tightens straight (0.2 s). **Consequence**: two leaf flecks lift off the ground along the string's line | push `cam(0,0,0.9)` → `cam(60,−80,1.0)` over 1.2 s (reveal the route toward the gap) | reel at `(−260,+200)` and the gap at `(+420,−380)` both inside the core box at zoom 1 |
| 1.6 follow-through "the option you expected disappears" | Crown rises | **Antic**: the horizon's torn edge bulges 20 u at `x=+380`. **Action**: the **tree crown pushes up** through the horizon from `y=+700` to `y=−120` (0.7 s ease-in, heavy) *into the string's route*: the string is **pushed** — it bends over the crown's top (deforms into an arc), the sky gap is covered (crown overprints the band: deep teal), the bands above crumple (streak tails kink) and leaf flecks scatter outward 60 u. **Settle**: the crown stops with a shove and its edge shivers. **Consequence**: the string, wrapped over the crown, goes *taut* (width 8 → 6, a straight strained line) — the kite above is pulling against a jam | hold `cam(60,−80,1.0)` with a 20 u lean toward the crown as it rises | the crown's leading edge `(+120…+560, −120…+200)` inside the core box |
| 4.00 "frustrated or stuck" | The jam | **Antic**: the string draws 15 u tighter. **Action**: it **jams** — a violent spike: the string zig-zags in place (jagged 30 u shake, 4 drawn frames), the reel is *yanked* 40 u toward the crown and **squashes** 12 % against the ground, then **stops dead** on a held drawing (stuck); leaf flecks burst outward from the jam point. **Settle**: nothing moves for 0.8 s except the camera creeping. **Consequence**: the crown's green overprints the string's contact stretch (a caught string) | push `cam(60,−80,1.0)` → `cam(−60,40,1.25)` over 0.9 s (isolate the reel and jam), then the camera **still creeps** 1 % during the stuck hold so it has weight | reel and the jam point `(+40,−60)` inside `±300` |
| 7.68 "look again" | The look | **Antic** 0.2 s: the camera dips 15 u (a breath before looking). **Action**: the **camera pans up the string as the look** (1.1 s ease-in-out): from the reel, over the crown's top, to the string's continuation into open sky at upper-left; the pan *reveals* (not fades in) the kite's lowest **tail bow** (yellow, 120×80) at `(−140,−520)` fluttering, and beyond it the string still flying — the kite is up there, and to the left the sky is open (a band gap at `(−420,−600)` becomes visible only through the pan). **Settle**: the pan overshoots 20 u and settles on the bow. **Consequence**: the string, seen from this side, is slack above the crown: the plan is jammed but the kite is not lost | pan `cam(−60,40,1.25)` → `cam(−120,−460,1.25)` over 1.1 s (the pan is the look) | at the end the tail bow is at frame centre and the crown's top edge at the bottom of the core box |
| 9.23–9.883 seam | | | | |

**Seam:** Passage through the **yellow tail bow's fabric** (aperture: the bow's rounded diamond at `(−140,−520)`, 120×80) → reveals inside it a **different composition**: the wide sky of ch 2 with the whole kite small at `(60,−160)`, all seven wind bands, the string running down to the reel on a low horizon.

Football truth: the expected forward option (the gap) is closed by a defender arriving — the correct reaction is not to force it (the jammed string) but to look again. No football action is named in this chapter, so none is drawn.

---

## Chapter 2 — "Adjust your angle" (9.983 s) — no headline (the turning kite carries it)

Narration: *Think of a kite in changing wind. Staying aloft takes adjustment. You can keep your purpose while changing the angle you use.*

Background: sky bands with the horizon at `y=+520` (a wide sky); bands stepped 0.16/0.24/0.32, streak tails 60 u at rest; two authored **gust envelopes** (onset 0.3 s, peak 0.5 s, recovery 0.6 s) at 2.9 and 5.0 slide the bands right 80 u and stretch the tails to 220 u; leaf confetti 14 flecks.

Composition at t=0: **your kite** (yellow diamond 380×520, navy spars, five tail bows) at `(60,−160)`, angle 0°; the **string** from its bridle down to the **yellow reel** r=90 at `(−200,+520)` on the horizon (the anchor: purpose); a navy court line on the horizon.

| t + words | Composition (what fills the frame) | Cue action: Antic → Action → Settle → Consequence | Camera key | Phone note |
|---|---|---|---|---|
| 0.00 "Think of a kite" | Kite draws in the sky | **Antic**: the spars' tips pull back 20 u. **Action**: the kite self-draws — spars first (0.3 s), then the sail fills from the centre outward (0.4 s ease-out), tail bows whip in one after another (0.08 s stagger). **Settle**: the whole kite overshoots up 30 u and settles (light thing: flutter of 3 cycles). **Consequence**: the string draws down to the reel, tip leading (0.5 s), and the reel spins a quarter turn as it takes the tension | push `cam(0,0,0.9)` → `cam(40,−100,1.0)` over 1.2 s (into the kite) | kite inside `±270 × ±260` at zoom 1 |
| 2.90 "Staying aloft" | Gust 1 | **Antic**: the bands pause and the kite's tail lifts 20 u (the wind drops for a beat). **Action**: **gust 1 pushes from the left**: the bands slide right 80 u with streak tails to 220 u; the gust mass **pushes the sail** — the sail *dents* 30 u on its windward edge (deforms), the kite is shoved right 140 u and *drops* 100 u with gravity; the string bows. **Settle**: to stay up the kite **turns** (counter-turn −6° then +18°, as one mass, 0.5 s), catches the gust, recovers its height with a 40 u overshoot and settles. **Consequence**: leaf flecks stream past; the reel does not move (it rocks 8 u and holds) | pan `cam(40,−100,1.0)` → `cam(160,−40,1.0,+4°)` over 0.9 s (dragged right and rolled by the gust a beat late) | kite stays inside the core box after the shove |
| 5.0 follow-through (gust 2) | Gust from upper-left | **Antic**: the bands' tails shorten 0.2 s. **Action**: **gust 2 pushes from upper-left**: bands slide right and *down* 60 u; the sail dents on its upper-left edge, the kite is pushed down-right 120 u and rolls −10°. **Settle**: the tail whips and settles over 0.6 s. **Consequence**: the string slackens then snaps taut with a visible twang (2 drawn frames) — the anchor holds | hold `cam(160,−40,1.0,+4°)` with a 20 u dip on the push | — |
| 6.52 "changing the angle" | The turn | **Antic**: counter-turn +5° (0.15 s). **Action**: the kite **rotates to −22°** as one mass (0.6 s ease-in-out) — the new angle; the wind streaks now *flow along its face* (the band tails bend around the sail's silhouette) and a paper knockout glint prints on the sail's leading edge. **Settle**: overshoot to −26°, settle to −22°. **Consequence**: the kite **climbs** 160 u along the gust (0.8 s ease-out); the reel stays exactly where it was — the camera pans down to prove it, then back up | pan `cam(160,−40,1.0,+4°)` → `cam(−60,+300,1.0,0°)` over 1.0 s (down the string to the anchored reel — "keep your purpose"), then `cam(−60,+300,1.0)` → `cam(40,−200,1.05)` over 1.1 s (back up to the climbing kite; a pan, never a zoom out) | during the down-pan the reel at `(−200,+520)` sits at relative `(−140,+220)`: inside |
| 9.33–9.983 seam | | | | |

**Seam:** Passage through the **yellow sail's fabric** (aperture: the kite's diamond at `(40,−240)`) → reveals inside it a **different composition**: the fabric seen at 4× — a yellow grainy field with one navy spar crossing the corner, the jammed string stretched across it, no horizon (ch 3).

Football truth: adjusting the angle without changing purpose = changing the type or direction of the pass/run while keeping the same aim (go forward). The anchored reel is the aim; the sail's angle is the method. No football action named; none drawn.

---

## Chapter 3 — "Make room to notice" (8.683 s) — headline **BREATHE** (arrives at 3.40)

Narration: *Adapting means responding to what is happening now. Take a breath. Let go of the first answer to notice another.*

Background (**duotone yellow + navy until 3.40**): inside the sail — the whole sheet is the sail's **yellow grainy fabric field** (tone 0.4, mottle 0.3, a faint diagonal weave in the grain); a navy **spar** (width 40) crosses the top-right corner from `(+200,−700)` to `(+700,−200)`; a torn green **crown fragment** (the caught corner) intrudes at `(+520,+380)`, 260×220. From 3.40 the blue plate prints: the wind bands cross the fabric as **blue streaks** (green where they overprint the yellow: the wind is *on* the cloth). Confetti: 6 cream bits.

Composition at t=0: the **jammed string** (navy 6 u, strained straight) runs from `(−600,+320)` to the crown fragment at `(+520,+380)`, pinned there. Centre `(0,0)` is clear fabric — where the breath will open.

| t + words | Composition (what fills the frame) | Cue action: Antic → Action → Settle → Consequence | Camera key | Phone note |
|---|---|---|---|---|
| 0.00 "Adapting means responding to what is happening now" | Fabric, spar, strained string | **Antic**: the string draws 10 u tighter. **Action**: the crown fragment *presses* 40 u further onto the fabric (0.5 s ease-in): the fabric **dents** under it (the grain field's tone ramps to 0.55 in a 200 u bowl), the string is dragged 20 u and hums (jagged 2 frames). **Settle**: the dent holds with a 6 u pulse. **Consequence**: the spar bends 8 u — force propagates through the kite | pan `cam(−120,0,1.0)` → `cam(60,40,1.0)` over 1.0 s (toward the press) | string and crown fragment's edge inside the core box; the spar is context at the corner |
| 3.40 "Take a breath" | The breath | **Antic** 0.25 s: everything contracts 3 % toward centre. **Action**: the **whole composition expands** (1.2 s, long ease-out): the crown fragment *retreats* 120 u off the corner, the fabric dent flattens, the fabric field's tone drops 0.4 → 0.25 (lighter = room), the spar straightens and slides 60 u outward, and the **blue plate prints**: wind bands arrive across the fabric as slow wide streaks (tails 300 u) — a paper knockout **breath ring** grows from `(0,0)` (r 0 → 360, recipe N, one ring per 4 drawn frames, three rings). **Settle**: the rings ease to a stop. **Consequence**: the string's tension **slackens** — it droops 90 u with gravity between its ends (0.6 s) and its width recovers 6 → 8 | push `cam(60,40,1.0)` → `cam(0,0,1.12)` over 1.2 s, then the camera itself "breathes out": zoom eases 1.12 → 1.08 over 0.8 s (a slow release, not a reverse zoom: the composition keeps expanding under it) | the breath ring's outer edge at r=360 fits the core box |
| 5.0 follow-through "Let go of the first answer" | The string is released | **Antic**: the string tip at the crown twitches. **Action**: the crown fragment *lets the string go* — it **slips and falls** (the free end drops 200 u with gravity, 0.4 s ease-in, whips once) and lies slack across the fabric. **Settle**: two decaying bounces. **Consequence**: the wind streaks that were bending around the taut string now run straight across | drop `cam(0,0,1.08)` → `cam(20,60,1.08)` over 0.4 s (the camera falls with the string) | slack string inside `±420` |
| 6.24 "notice another" | The look | **Antic**: 0.2 s camera dip. **Action**: the **camera pans left as the look** (0.9 s ease-in-out) along the slack string toward `(−420,+180)`; the pan *reveals* a second route: a navy **dashed string path** already lying on the fabric, running off-left toward a **blue reel** r=70 at `(−560,+220)` (the teammate, seen only because we looked). **Settle**: the pan overshoots 20 u and settles on the dashed path. **Consequence**: the dashed path draws solid from the blue reel toward centre (0.5 s, tip leading) — the other answer becomes usable | pan `cam(20,60,1.08)` → `cam(−300,120,1.08,−6°)` over 0.9 s | blue reel at relative `(−260,+100)`: inside the core box |
| 8.03–8.683 seam | | | | |

**Seam:** Passage through the **innermost breath ring's fabric** (aperture circle r=140 at `(0,0)` in the outgoing world — the yellow fabric inside the first ring) → reveals inside it a **different composition**: the court seen obliquely from ground level with your reel, your kite on a short string, a crown rising and the blue reel to the left (ch 4).

Football truth: adapting = reading the current picture; the breath is the moment between losing the first option and finding the second. The "other answer" is a sideways support option (the blue reel to the left), consistent with what ch 4 plays.

---

## Chapter 4 — "Keep more options open" (10.283 s) — headline **SIDEWAYS** (arrives at 6.58)

Narration: *In futsal, a defender may close your forward pass. Keep the ball close. Scan for support. A sideways pass can create time.*

Background: sky bands with the horizon at `y=+300`; the green ground field carries two navy court lines (touchline `y=+330`, a second line `y=+520`); bands stepped 0.16/0.24/0.32; leaf confetti 12 flecks; a gust at 6.58 (onset 0.2, peak 0.4, recovery 0.6) blowing **left** (bands slide left 80 u).

Composition at t=0: **your yellow reel** r=90 at `(−120,+300)`; **your kite** (yellow, 300×410) at `(−60,−160)` on a string of 460 u; **forward route**: navy dashed path from the kite up-right to a **sky gap** (paper knockout between bands, 300×160) at `(+360,−420)`. **Tree crown** (green torn 560×480) below the horizon at `(+400,+720)`. **Blue reel** r=90 at `(−520,+320)` off-left with its **blue kite** (260×360) parked low at `(−480,+20)`.

| t + words | Composition (what fills the frame) | Cue action: Antic → Action → Settle → Consequence | Camera key | Phone note |
|---|---|---|---|---|
| 0.00 "In futsal, a defender may close your forward pass" | Crown closes the route | **Antic**: the horizon bulges 20 u at `x=+400`. **Action**: the **crown pushes up and across** into the forward route (0.7 s ease-in, heavy): it covers the gap (deep teal overprint on the bands), the dashed route *crumples* where the crown meets it (kinks, 4 drawn frames), the kite is **pushed back** 60 u and its sail dents 25 u; leaf flecks scatter. **Settle**: the crown stops with a shove and leans 10° toward the kite. **Consequence**: the string goes taut and the reel is dragged 20 u | push `cam(0,0,1.0)` → `cam(40,−60,1.12)` over 1.0 s (leans 20 u into the crown's push) | the crown's leading edge and the kite inside the core box |
| 3.40 "Keep the ball close" | Reel in | **Antic**: the reel rocks 10 u away from the kite. **Action**: the reel **winds in** (rim string visibly winds, 0.6 s): the string shortens 460 → 140 u and the kite *drops* to `(−100,+150)`, just above the reel, flying three small tight circles (r=40, on twos) — the ball under the sole. **Settle**: the kite's tail settles against the reel. **Consequence**: the crown, pressing toward the kite, *leans* to 20° and its edge overhangs the reel — the gap between crown and kite narrows to 60 u; a paper knockout arc (a shield) prints between them | pan `cam(40,−60,1.12)` → `cam(−80,120,1.25)` over 0.9 s (tight follow, isolate reel + kite) | reel `(−120,+300)` at relative `(−40,+180)`: inside |
| 5.0 follow-through "Scan for support" | The scan | **Antic**: 0.2 s camera dip. **Action**: the **camera pans left as the scan** (0.9 s), *revealing* the blue reel and the blue kite parked low at `(−480,+20)` — they were outside the frame until the look. **Settle**: overshoot 20 u, settle. **Consequence**: the blue kite *lifts* 60 u (a signal: the teammate is ready), its tail flicks | pan `cam(−80,120,1.25)` → `cam(−300,140,1.2)` over 0.9 s (the pan is the scan) | blue reel at relative `(−220,+180)`: inside; the yellow reel stays at relative `(+180,+160)` |
| 6.58 "A sideways pass can create time" | The hand-off | **Antic** 0.2 s: the yellow reel lets out 30 u of string (a dip). **Action**: the gust blows left and the **string is handed sideways**: the string foot transfers from the yellow reel to the blue reel (the string's bottom end slides along the ground line 400 u in 0.3 s) and the **kite swings across the sky** on the wind from above the yellow reel to above the blue reel (0.7 s arc, apex 120 u higher, smear on twos). **Settle**: the blue reel **cushions** — lets out 20 u of string; the kite overshoots 30 u and settles at `(−480,−140)`. **Consequence**: the crown, committed rightward, *leans the wrong way* (rotates 15° further right, 0.5 s) and cannot reach; **time opens** — the wind bands part around the blue kite (a paper knockout lens r=260 grows over 0.6 s, the composition expands), and leaf flecks settle | pan `cam(−300,140,1.2)` → `cam(−440,−40,1.15)` over 0.8 s (pulled along by the kite a beat late) | the blue kite and the time lens centred; the crown's tip still visible at the right edge |
| 9.63–10.283 seam | | | | |

**Seam:** Passage through the **wind band the kite crossed** (aperture: a streaked lozenge 360×120 of the blue grainy band at `(−300,−200)`) → reveals inside it a **different composition**: the court from the side, camera rolled −10°, two crowns with a gap between them, the blue reel holding the kite, your yellow reel free to move (ch 5).

Football truth: a defender closing the forward lane; keep the ball close (reel in, small touches); scan (the camera pans as the look); the sideways pass to a teammate the defender is not marking creates time because the defender has committed toward the first lane. The pass flight is 0.7 s and the receiver cushions.

---

## Chapter 5 — "Move after the pass" (9.683 s) — no headline (backward-then-forward is enacted)

Narration: *Then move to offer a new angle. Together, your team can find a different route. Going backward can help you move forward later.*

Background: sky bands with the horizon at `y=+260`, camera rolled −10° so the horizon tilts; bands stepped 0.16/0.24/0.32 with a steady right-going wind (tails 120 u); leaf confetti 10 flecks; the ground carries a navy court line and a **navy track** that the reel will draw as it rolls.

Composition at t=0: **blue reel** r=90 at `(−260,+260)` holding the **kite** (yellow, 300×410) at `(−240,−120)` on a 380 u string. **Your yellow reel** r=90 at `(−60,+300)`. **Two tree crowns** (green torn 460×400 and 420×380) rising from the horizon at `(+120,+80)` and `(+520,+40)` with a **sky gap** 200 u wide between them at `(+320,−300)`.

| t + words | Composition (what fills the frame) | Cue action: Antic → Action → Settle → Consequence | Camera key | Phone note |
|---|---|---|---|---|
| 0.00 "Then move to offer a new angle" | Reel rolls | **Antic**: the yellow reel rocks 15 u backward. **Action**: it **rolls** along the ground line to `(+260,+240)` (0.9 s ease-in-out, heavy: slow start), drawing a navy track behind it, its rim string spinning; `speedLines` behind. **Settle**: overshoots 30 u, rolls back and rocks to rest. **Consequence**: a navy dashed lane appears from the blue reel's kite to above the yellow reel — a new angle; the nearer crown leans 10° toward the rolling reel (pressure follows) | pan `cam(−100,0,1.0,−10°)` → `cam(120,40,1.0,−10°)` over 1.0 s (follow the reel, a beat late) | both reels inside the core box at the end of the pan |
| 2.2 follow-through (the pass) | Hand-off forward-right | **Antic**: the blue reel lets out 30 u. **Action**: the string foot transfers to the yellow reel and the kite swings across to above it (0.7 s arc, smear on twos). **Settle**: the yellow reel cushions (lets out 20 u); the kite overshoots and settles at `(+280,−140)`. **Consequence**: both crowns lean toward the kite (0.5 s) — the gap between them *narrows* 200 → 120 u (pressure closes) | hold `cam(120,40,1.0,−10°)` with a 15 u lean toward the kite | — |
| 4.10 "a different route" | Route grows | **Antic**: the kite dips 20 u. **Action**: a navy **dashed route grows** from the kite, tip leading along a curve, up between the two crowns toward the gap (0.7 s ease-out, organic growth). **Settle**: the tip overshoots into the gap and settles. **Consequence**: the crowns' edges shiver — but the gap is only 120 u; the route is there but not yet open | rotate+push `cam(120,40,1.0,−10°)` → `cam(220,−120,1.15,−4°)` over 0.9 s (isolate the gap; the roll eases toward level as the route straightens) | gap at relative `(+100,−180)`: inside |
| 5.54 "Going backward can help you move forward later" | Back, then through | **Antic** 0.2 s: the yellow reel lets out 30 u. **Action (backward)**: the string is handed **back** to the blue reel — the kite swings left/back to `(−240,−120)` (0.7 s). **Settle**: blue cushions. **Consequence 1**: both crowns *lean back after it* (rotate 15° left, 0.6 s, heavy) — and the **gap opens** 120 → 280 u. **Action (forward, 7.0)**: the blue reel hands the string forward high: the kite swings up and **through the gap** (0.8 s arc, apex above the crowns, the sail knocks out the bands as it passes) to above your yellow reel, which has rolled on to `(+440,+200)` (0.6 s roll during the backward pass). **Settle**: the yellow reel cushions; the kite overshoots 40 u upward and settles at `(+460,−260)`. **Consequence 2**: the crowns, leaning the wrong way, shrink 10 % (deflate) and leaf flecks fall from them; the kite's string is now straight and the wind bands stream past it into open sky | pan `cam(220,−120,1.15,−4°)` → `cam(−120,−60,1.1,−6°)` over 0.8 s (back with the kite), then `cam(−120,−60,1.1,−6°)` → `cam(360,−200,1.1,0°)` over 1.0 s (pulled forward through the gap; the roll levels: the plan is straight again) | at the end the kite `(+460,−260)` sits at relative `(+100,−60)`: inside; the yellow reel at relative `(+80,+400)`: bottom of the core box |
| 9.03–9.683 seam | | | | |

**Seam:** Passage through the **yellow reel's disc** (aperture circle r=90 at `(+440,+200)` — the yellow tone of the winder's face) → reveals inside it a **different composition**: the whole kite field from high above — a low horizon with a tiny court and two tiny reels, the kite huge at `(0,−200)`, three wide wind bands (ch 6).

Football truth: after passing, move to offer a new angle (the reel rolls); a backward pass draws the defenders toward the ball and opens the space behind them; the forward pass then goes through the gap. Every hand-off is 0.7–0.8 s with a cushion; pressure follows the ball both times.

---

## Chapter 6 — "Notice. Choose. Adjust." (11.485 s) — no headline (three actions; the open sky is the idea)

Narration: *Changing your plan does not erase your effort. It puts that effort to use. Notice, choose, adjust. Keep your purpose. Stay open to another way.*

Background: three wide wind bands (stepped 0.16/0.24/0.32, tails 100 u) with a **low horizon** at `y=+560`: the green field is a thin band with a **small court** on it (navy line rectangle 400×140 at `(0,+600)`, two tiny reels r=24 — the ch 1 ground seen from far above). A new wind band will enter from upper-left at 5.12 and another from the right at 9.14. Leaf confetti 16 flecks.

Composition at t=0: the **kite** (yellow 360×480) at `(0,−200)`, angle −22° (the angle it chose in ch 2); the **string** runs down to the yellow reel on the small court at `(−40,+600)`, currently *slack* (a lazy curve); on the court the **crumpled navy route** from ch 1 lies as a jagged line 260 u long at `(+60,+620)`.

| t + words | Composition (what fills the frame) | Cue action: Antic → Action → Settle → Consequence | Camera key | Phone note |
|---|---|---|---|---|
| 0.00 "Changing your plan does not erase your effort" | The crumple becomes the string | **Antic**: the crumpled route twitches 10 u. **Action**: the reel *winds* and the **crumpled line unfolds into the string** — its zig-zags straighten one by one from the reel outward (0.8 s ease-out, tips leading) and feed up into the slack string, which takes up the length. **Settle**: the last kink snaps straight with a 15 u whip. **Consequence** (2.6, "puts that effort to use"): the string goes **taut** (0.5 s) and the kite *rises* 80 u, sail glint knockout | pan `cam(0,500,1.0)` → `cam(0,−160,1.0)` over 1.4 s (a reveal up the string from the court to the kite) | the small court sits at the bottom of the core box at the start; the kite at centre by the end |
| 5.12 "Notice, choose, adjust" | Three beats, 0.5 s apart | **Notice** (5.12): antic — camera dip; action — the **camera pans up-left as the noticing** (0.45 s), revealing a **new wind band** entering from upper-left (its streak tails lead); consequence — the kite's tail lifts toward it. **Choose** (5.62): antic — counter-turn +5°; action — the kite **rotates to −15°** as one mass (0.4 s) to face the new band; settle — overshoot −18°, settle; consequence — the string foot on the court shifts 20 u (the reel rocks). **Adjust** (6.12): antic — counter-turn −4°; action — the kite turns to **+12°** (0.4 s) as the band arrives and *pushes* the sail (dent 20 u, then the sail fills and the dent pops out); settle — the tail bows settle in sequence over 0.6 s; consequence — the new band's streaks bend around the sail and the kite climbs 60 u | pan `cam(0,−160,1.0)` → `cam(−160,−300,1.0,−4°)` at 5.12 (0.45 s, the noticing) → `cam(−40,−220,1.05,0°)` at 5.62 (0.4 s) → `cam(20,−260,1.05,+3°)` at 6.12 (0.4 s) | the kite never leaves the core box; its top corner may touch `y=−400` during the climb at 6.12 — accepted, the climb is the point |
| 7.5 follow-through "Keep your purpose" | The anchor holds | **Antic**: the string draws 10 u tighter. **Action**: the camera **pans down the taut string to the reel** on the small court (0.8 s) — the reel has not moved from `(−40,+600)`; the crumpled route is gone (used). **Settle**: overshoot 20 u, settle on the reel. **Consequence**: the reel rocks 6 u and holds | pan `cam(20,−260,1.05,+3°)` → `cam(−20,+420,1.05,0°)` over 0.8 s | reel at relative `(−20,+180)`: inside |
| 9.14 "Stay open to another way" | Another band, open sky | **Antic**: the camera dips 15 u. **Action**: the camera pans back up to the kite (0.9 s, a pan, never a zoom out) while a **second new wind band** enters from the right; the kite *drifts into it* (0.6 s, light: flutter) and **climbs** 120 u (0.8 s ease-out), the sail knocking out the band as it passes; the composition **expands**: the two new bands part (a paper gap widens 200 → 420 u around the kite), streak tails lengthen and slow. **Settle**: the kite's tail sways decaying over 1.0 s. **Consequence**: the string is straight from the reel to the kite — purpose kept, angle changed; at 10.6 the print re-seeds registration once (a fresh impression) | pan `cam(−20,+420,1.05)` → `cam(40,−300,1.05)` over 0.9 s; then hold with a 1 % creep during the final sway | the kite at relative `(0,−80)` at the end; the open gap fills the core box |
| 10.8–11.485 final hold | | Moving hold: the tail's sway decays to zero; the two bands' tails relax. No camera travel | hold `cam(40,−300,1.05)` | — |

**Seam:** none — last chapter; the final print holds under the caption until the audio ends.

Football truth: a changed plan reuses the effort already made (the run you made, the position you took); notice = look, choose = pick the option, adjust = change the angle of the pass or run while the aim stays the same. No football action named; none drawn.

---

## Delight (§4d)

**Touch reaction — `touch(sheet, x, y, age)`, ≤ 0.8 s:** a **gust** at the touch point: a blue streaked puff (three short wind tails 80–140 u, grainy, cov 0.3) blows right from the point over 0.4 s and fades; if the string passes within 160 u, a **ripple runs down the string** from the nearest point toward the reel (a travelling 14 u S-wave, 0.5 s) and the reel rocks 6 u; if the kite is within 220 u, its **tail flicks** once and the sail dents 8 u on the side facing the touch. Inks: blue puff, navy string, yellow tail. Reduced motion: a single static blue streak mark. Max 6 live gusts, oldest recycled; while paused a touch plays one gust and the canvas sleeps.

**Secondary motion that reacts to the main actions:** leaf confetti (green torn flecks, cream bits) is blown along the bands, scatters outward 60–100 u from every crown push and jam, streams past the kite on each gust and settles over 1 s; tail bows flutter in sequence (0.08 s stagger) after every turn and every hand-off; the horizon's torn edge lifts 10 u as each gust passes; the wind bands' streak tails lengthen at gust peaks and relax; the reel's rim string visibly winds/unwinds on every reel-in and hand-off; leaf flecks fall from a crown when it deflates (ch 5). All seeded, bounded lifetimes, ≤ 1 ms per frame.

**End card:** the ch 6 print holds; the kite does one small settling turn (+3° and back over 0.6 s), its tail bows settle in sequence, the string twangs once; the Replay button appears as a printed stamp. No confetti burst.

## Shapes needed

From the shared library (§3): `kite` (diamond sail with spars, angle, dent parameter, tail bows), `thread` (the string, with slack/taut states and travelling-wave support), `field(kind: torn)` (green crowns, green horizon), `laneArrow` (dashed routes), `chalkStroke` (court lines, the crumpled route), `ripple` (breath rings, paper knockout), `speedLines`, `sun/lantern disc` is **not** used. `ball`, `boot`, `eye`, `ear`, `hand`, `bubble` are **not** used.

Story-specific shapes (author in `lib/paths/riso/stories/kite-turned.ts`, not the library):
- `windBands(count, horizonY, covSteps, gust, seed)` — the streaked grainy sky bands with gust offset and tail length.
- `horizon(y, lift, seed)` — torn green ground field with a lift parameter for gusts.
- `reel(x, y, ink, spin, squash)` — winder disc with rim string and spin.
- `crown(x, y, w, h, lean, deflate, seed)` — tree crown torn mass with lean and deflate.
- `sailDent(kite, side, amount)` — windward-edge deformation of the sail.
- `crumple(points, amount)` — jagged crumpling/unfolding of a route line.
- `timeLens(x, y, r)` — paper knockout lens that parts the bands.
- `gustPuff(x, y, age)` — the touch reaction.

## What would make this fail (the rejected Astra look)

- A small kite icon centred on a flat blue sky. The kite is 380×520 u, the sky is seven grainy streaked bands, the horizon is torn.
- Gusts that do not push anything. Every gust must slide the bands, dent the sail, move the kite and scatter leaves (§4b).
- A "look" done by fading in an eye. Every look/notice/scan is a camera pan that reveals something that was outside the frame.
- Full-body flyers, hands holding the string, faces. Players are reels; there are no generic forms.
- Passes drawn as arrows between icons. A pass is the string foot sliding along the ground and the kite swinging on the wind, with a cushion.
- The kite printing green where it crosses a wind band. The sail knocks out the blue plate; only crowns overprint.
- Reverse zoom at any seam or a zoom-out to "show the whole field". Ch 6 arrives at the wide view *through* the reel; within chapters only pans travel down and back up.
- A flat yellow chapter 3. The fabric is a grainy field with a tone ramp, a bowl dent and blue streaks overprinting green.
- Sentences or lettering drawn into the artwork; only the three one-or-two-word HTML headlines exist.
- Idle wobble on the kite between cues. Holds are decaying sways from the last gust.

## Self-check (muted)

Muted, does the film still explain the narration? Ch 1: a string pays out toward a bright gap, a green crown shoves up into it, the string jams and shakes, the reel is yanked and squashed, everything stops — then the camera climbs the string and finds the kite still flying with open sky to the left: "the option disappears / stuck / look again" reads. Ch 2: gusts slide the bands and dent the sail, the kite drops and turns to recover, then turns to a new angle and climbs while the camera pans down to a reel that has not moved: "adjust the angle, keep your purpose" reads. Ch 3: a crown pressing a dent into fabric with a strained string, then the whole picture expanding with rings and arriving wind, the string drooping and dropping free, and a pan that finds a second path to a blue reel: "breathe, let go, notice another" reads. Ch 4: a crown closes the gap and shoves the kite, the reel winds in short, the camera scans left to a blue reel, the string is handed sideways and the crown leans the wrong way as the bands part: "close, keep close, scan, sideways, time" reads. Ch 5: the reel rolls to a new spot, the kite is handed to it, a route grows between two crowns, the kite goes back and the crowns follow so the gap opens, the kite goes through: "move, different route, backward then forward" reads. Ch 6: a crumpled line unfolds into the taut string and the kite rises, three turns into a new band, a pan down to the unmoved reel, a second band and a climb into open sky: "effort put to use, notice/choose/adjust, purpose kept, stay open" reads. The weakest silent beat is "Choose" (a 0.4 s rotation); it is kept because it sits between the noticing pan and the pushing band, so cause and consequence bracket it. Every seam names a material the camera enters; every pressure word deforms something; no chapter has a flat background.

---

## Build ledger (20 Sep 2026)

**Built:** `lib/paths/riso/stories/kite-turned.ts` — six scenes on `playChapters`, text/labels/audio verbatim from `lib/paths/films/futsal.ts`, cue onsets from `phraseFilmScores.ts`, seconds from `narrationTiming.json`. Story-specific shapes: `bandPath`/`sky` (wind-combed blue bands with irregular heights and pitch, wobbling long-wave edges, 16 tapered streak tails per band, gust offset and tail length), `ground` (torn green horizon with lift and navy court lines), `leaves`, `reel` (paper-knocked disc, rim string ticks that spin, hub), `kite` (opaque diamond sail knocked out of every plate then inked, navy spars and contour, dent on a named windward edge, self-draw, tail with bows, glint), `crown` (hand-cut torn mass with inner navy tone patches, lean about its base, deflate), `stringPts`/`string` (slack, crumple), `route` (dashed navy path with crumple), `skyGap`, `bowShape`. Headlines: Look again / — / Breathe / Sideways / — / —. Touch: a gust — three blue streak tails blow right and fade, leaves scatter, a yellow tail bow flicks (static streak under reduced motion).

**Deviations from the storyboard and why**
- Sky band coverages run 0.32/0.45/0.6 (storyboard 0.16–0.32) — the low steps read as pastel; the first sheet also stacked the bands like a flag, so heights and pitch now vary per band and every band carries long streak tails.
- Ch 1: the crown rises to y −200 (storyboard −120) so its top actually pushes the string route; the string arcs over the crown top and, once jammed, its far end swings left to the kite's lowest tail bow at (−140, −520), which the "look again" pan reveals. Reel r 110, string 12 u (9 u taut) — the storyboard's 8/6 u was a hairline on phones.
- Ch 2: gust shoves are displacement envelopes that return to the kite's station (a kite on a string swings back), so the kite ends at (40, −320) after the climb and the seam aperture is the sail there. The camera's pan down to the reel and back up is kept as two pans; zoom stays monotone.
- Ch 3: the camera's 1.12 → 1.08 "release" was dropped (a reverse zoom, however small); the exhale is carried by the expanding rings, the retreating crown, the lightening fabric (0.6 → 0.45) and the arriving blue streaks (green on the yellow). The diagonal weave is a 45° yellow 0.88 lattice on the 0.6 field.
- Ch 4: the blue kite is parked at (−640, −60) instead of (−480, +20) so the yellow kite can land above the blue reel without overlapping it; zoom holds at 1.2 from 4.3 s (no decreasing zoom). Strings are 11 u (8 u when reeled tight).
- Ch 5: the final camera is (360, −120) not (360, −200) so the yellow reel (the seam aperture) stays inside the 320×568 safe region.
- Ch 6's second registration re-seed at 10.6 is not implemented (seed is chapter-indexed inside `press()`).

**Gates:** typecheck clean · `review-riso-story` 45 samples, maxOps 146, five seams pixel-exact, zero page/draw errors · `riso-perf` 390×850 DPR 1.5: median 3.3 ms, p95 14.5 ms, max 14.8 ms, ops median 61 · `check-riso-films-browser --title "The Kite That Turned"` PASS at 390×850, 320×568, 844×390, 1440×850.

**Screenshots:** `/private/tmp/claude-501/-Users-khoado-Desktop-Warp-Claude-Projects/a94b3f51-4163-4951-814b-79d6d6d74e9a/scratchpad/riso/kite-turned/app-kite-turned-{390x850,320x568,844x390,1440x850}-ch{1..6}.png` (+ `-touch.png`, `montage-*.png`); contact sheet `…/scratchpad/riso/review/kite-turned.png`.

**Known limitations:** ch 3 opens as a large yellow field with small leads for its first 0.7 s (the duotone beat; the crown press and the breath fill it after); the tail bows are placed along the smoothed tail so they slide slightly when the tail whips; the kite's dent is an edge-midpoint push (one control point per edge), so a strong dent reads as a crease rather than a billow.

## Fix ledger (20 Sep 2026 · legibility pass, bible §1c + reviews/futsal.md + reviews/cross-story.md)

**What changed (story file only, engine untouched).**
- `figure()` helper (abstract riso pictogram per §1c.4, same code as chalk-line/woven-court): paper cut-out + navy contour + blue halftone shade = the child / you / teammates; blue cut-out = the defender who closes a lane (blue is already the wind that pushes, so the pressure ink on the court is blue; green crowns stay the pressure in the sky). 300–880 u tall, 1–3 per frame.
- **The reel is in the child's hand in every chapter** (`HAND()` + `reach`); the kite string always runs from that hand.
- ch1 (LOOK AGAIN, headline now arrives at 7.68): the kite is ≥ 320 u from frame 1 flying in the sky gap; a **tree with a trunk** stands at the right; at 1.6–2.3 a gust (bands slide, tails lengthen) shoves the kite into the crown where it sticks and twitches; on "frustrated or stuck" the string shakes and the child's shoulders drop (slump); on "look again" the child straightens, the head turns to the open sky at the left with a paper sight wedge and the camera pans there. Seam into the stuck kite's sail.
- ch2: unchanged kite (self-drawing spars kept) + the child holding the reel on the ground; the string bows and twangs from the hand.
- ch3 (LET GO): the child fills the frame on the yellow sail field — leaning back with the string taut to the crown (0–3.4), then **the breath is the body**: the torso grows 6 %, arms open and rise, three paper rings grow from the chest, the camera zooms out (composition expands); on "Let go" the string falls from the hand; on "notice another" the head turns left where a second (blue) kite already flies and the dashed route draws solid. The blue dotted disc and the blue reel are gone.
- **Seam 3→4 is a gust**: one huge blue wind band sweeps in from the left from 7.9 while the whole yellow sheet slides 420 u right; the aperture sits inside the band.
- ch4 (SIDEWAYS, §1c.7): the frame is split — the kite in the sky, a **futsal court** below with the same child holding the string and a **kite-cloth football** (paper sphere, yellow diamond patches, navy seams) at their feet; a **blue defender** steps into the forward lane (the dashed route crumples and fades); "Keep the ball close" pulls the ball in behind the shield arc and reels the kite short; "Scan for support" turns the head (sight wedge) and the camera pans to the **teammate** with arms out; "A sideways pass" = the front foot swings and the ball flies 0.7 s to the teammate's feet while the kite swings sideways with it. The blue kite and blue reel are gone.
- ch5: same court; "Then move" — the passer runs to a new angle; dashed routes back and forward; "Going backward" — the teammate passes back (0.7 s), then the ball goes forward past the lunging defender through the gap to the teammate who ran on; the kite mirrors the ball (back, then forward and high between two trees with trunks); the string runs from whoever has the ball.
- ch6: the zigzag box is now the child standing on the small court far below holding the reel; the crumpled route unfolds from the hand into the string; kite high and steady, open sky as before.
- Cross-story: the green horizon is now **two stepped bands** (a navy torn band along the horizon at .2, a yellow wear band lower at .32); crowns carry a **teal (blue × green) overprint** and a navy torn contour; BREATHE → LET GO.
- **Touch** ×2–3: a small yellow kite appears at the point, rocks ±8° with a bowing tail as three 300 u blue streaks blow right; leaves scatter.

**Kid test (sound off, 390×850 captures + contact sheet).** 1 "A kid flies a kite; a gust blows it into a tree and it gets stuck; the kid slumps, then looks the other way." · 2 "The kite tilts and turns in the wind on a string down to the kid's reel." · 3 "A big kid on yellow pulls a string, breathes with arms up, lets the string go and looks left at another kite." · 4 "A kid with a kite has a ball; a blue defender steps in front; the kid passes sideways to a friend and the kite swings sideways too." · 5 "The friend passes back, then the ball goes forward past the defender and the kite goes up between the trees." · 6 "A small kid on a court flies the kite high in an open sky." — all describable, all match the meaning.

**Gates.** typecheck clean · `review-riso-story --id kite-turned`: 45 samples, 5/5 seams pixel-exact, 0 errors, maxOps 177 · `riso-perf kite-turned`: median 4.0 ms, p95 16.1, max 18.2 · `check-riso-films-browser --title "The Kite That Turned"`: PASS ×4. Screenshots: scratchpad `riso/fix/kite-turned/` (`phone-strip.jpg`); contact sheet `riso/review2/kite-turned.png`.

**Limitations.** The touch cannot rock the scene's own kite (the touch handler has no way to alter what `draw` already printed), so the gust rocks a small kite of its own at the touch point. In ch4 the teammate at x −560 is partly visible at phone width from the first frame (the pan then centres them) rather than being fully hidden until the scan. The ch5 kite mirrors the ball's x position, so for a few frames of the back pass it hangs left of the trees' gap before climbing through it.
