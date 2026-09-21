# Futsal path review — chalk-line, woven-court, kite-turned, futsl

September 20, 2026. Motion + legibility critic for the four futsal riso stories, read against `RISO_BIBLE.md` §1c (kid test, added after the first build), §4 (cue actions, seams), §4b (motion enacts the words), §4d (touch). Set-wide findings (ball duplication, ring family, floor colour, headline word clashes, lattice coverage, halftone pitch) are already in `reviews/cross-story.md`; they are referenced here by their fix number and not re-argued.

Evidence: per-cue burst strips at 390×850 (nine frames around every cue: −0.17 s … +1.0 s) and 1440×850, seam strips (−0.70 s … +0.55 s across every chapter boundary), touch strips (before, +60 ms … +700 ms) and 320×568 / 844×390 stills, in `scratchpad/riso/critic/futsal/<story>/`. Raw frames were deleted after composing; only the strips remain.

**Verdict in one line: the path moves well and prints well, but it fails the kid test in 20 of 25 chapters for one reason — there are no people in it. Every "player" is a stand-in (a chalk ring, a shuttle, a kite-and-reel, a striped sole print) and two of the four footballs do not look like footballs. Adding 1–3 cut-paper silhouettes per chapter and redrawing two balls fixes most of it without touching the texture, speed or seams.**

---

## 1. Path-level findings (not in cross-story)

1. **Nobody is on the court.** 25 chapters, zero people. Where the narration says *you, teammate, defender, player, everyone*, the drawings use: chalk-line → nothing (a ring and pink blocks); woven-court → blue lozenge "shuttles"; kite-turned → a second kite and reel; futsl → striped pill "sole prints". §1c.4 now allows silhouettes; the path needs them in every chapter that names a person (listed per chapter below). Poses carry the emotion: shoulders down for stuck/frustrated, head turned for scan/look, arms out for support/offer, leaning in for pressure.
2. **Two of four balls are not footballs.** chalk-line's ball is a wobbly chalk ring (reads as "a circle"); futsl's is a flat blue disc (reads as "a blue blob", and at scene 6 as a planet). §1c.3 requires visible panels. Both can keep their story material: chalk-line → a chalk-drawn ball with three or four chalk panel lines and a white knockout highlight; futsl → a paper ball with blue *painted* panels (paint drips off one), still "the paint spot" in colour, but a ball. woven-court's classic ball is the only one a child names instantly — cross-story fix 1 asks for thread winding; keep faint panel seams under the winding so it still reads as a ball. kite-turned's kite is the ball only by explanation (see §4 below).
3. **All four stories use the same passage: a ring iris.** chalk-line seam 3→4 and 5→6 (a huge chalk ring expands), woven-court 3→4 (a circle wipe over zooming plaid), kite-turned 3→4 (a white ring, then a blue sky disc grows), futsl 1→2 and 7→end (the blue ball swells into a ring). §4 says the seam material is named per story; a ring is the engine default, not a material. Replace: chalk-line → a chalk-dust cloud that clears; woven-court → a thread pulled across the frame that unravels the old print row by row; kite-turned → the yellow sail sweeps across (it already does this in 2→3, keep only there) and 3→4 becomes a gust that blows the yellow field off like a sheet; futsl keeps the swelling ball for 1→2 (it is the ball) but 7→end should be the walls dissolving, which it already does before the ring — drop the ring.
4. **Metaphor is not shown next to the football (§1c.7).** kite-turned ch4 and ch5 begin "In futsal…" and contain no football, no court, no player — only two kites. woven-court ch2 ("woven threads") has no football beat before the seam. chalk-line ch2 does it right (the chalk draws on a court).
5. **Touch reactions are under-scaled at phone size.** chalk-line's chalk puff is a 12 px scuff; futsl's roller dab is a glint only; kite-turned's gust moves a few green flecks; woven-court's plucked thread shows as two small rings, not a bowing thread. All four work in principle (each is its own material) but need 2–3× scale and one clear shape change (the thread visibly bows; the kite visibly rocks; the roller leaves a 200 u stroke; the chalk leaves a tick the size of the ball).
6. **Motion generally enacts the words (§4b) — this is the path's strength.** Pressure is a real push in chalk-line ch4 and futsl scenes 2/4/7 (walls squeeze the court, the gap narrows). "Breathe" expands the frame in kite-turned ch3. The futsl web rotates for attack/defend/move/think. Drawings update on twos. The seams land on the caption boundary in every strip checked (chapter-time readouts cross 0 within one frame). Keep all of this.

---

## 2. Kid test per chapter

Format: what a 9-year-old says with the sound off → PASS / FAIL, and the concrete replacement. Sizes in world units (sheet short side = 1080).

### chalk-line — The Chalk Line (yellow → pink → green; chalk on a dark green court)

| Ch | Headline | Kid says | Verdict | Replacement |
|---|---|---|---|---|
| 1 Before you feel ready | — | "A piece of chalk floats over a green field with a dotted circle." | **FAIL** — "an idea kept inside your head" has no body to be inside. | One cut-paper player silhouette (paper, navy contour, ~620 u tall) standing at the corner arc, ball at feet, head down, holding the chalk stick just above the ground and not drawing. The chalk hovers (already does) — now it hovers *in a hand*. Camera creeps 40 u over the hold (§4b "wait"). |
| 2 Room to explore | CHALK → none (cross-story) | "Chalk draws a line on a football pitch and then bends it." | PASS | Keep. Put the silhouette's hand on the chalk so the line is drawn by someone. |
| 3 Try something useful | TRY | "Chalk draws a circle with an arrow, then a yellow arrow." | **FAIL** — the circle is not a ball, the touch has no foot, and the pink pressure block named in the code never shows in the phone frames. | Chalk football (panels) at r 150; a silhouette boot (`boot`, navy) enters from the left and takes the touch; a **pink defender silhouette** (not a block) leans in from the right on "different first touch"; the redirected path stays yellow. |
| 4 Notice your options | PRESSURE | "An eye looks up and pink blocks squash a circle." | PARTIAL — the squash is a good enactment; the blocks are abstract. | Replace the two pink blocks with two pink defender silhouettes closing in shoulder-first; keep the squash of the ball and the narrowing gap. Keep the chalk eye but make it the silhouette's own head turning (a head-and-shoulders silhouette at the bottom, face up). |
| 5 A mistake gives information | FEEDBACK → INFORMATION (cross-story) | "A dark purple pitch; a circle breaks into bits; a dotted line and a letter H." | **FAIL** — nothing here is a mistake. | Keep the pink/navy duotone. Show the mistake: silhouette takes a touch that is too big, the chalk ball rolls 500 u past into a pink defender silhouette; a chalk cross marks where it went, a chalk dotted line shows the shorter touch beside it. The "H" gate becomes the defender's legs. |
| 6 Look. Try. Learn. | LOOK. TRY. → none (cross-story) | "A pitch drawing with arrows and a tick." | PARTIAL — the tick says "right", nobody did anything. | Silhouette plays the shorter touch, ball stays; the chalk tick draws itself over the ball. |

Motion notes: ch1 hold has no camera creep (add). ch3 seam 3→4 the ring iris — replace with a chalk-dust cloud (see §1.3). seam 5→6 is the *same* ring iris again inside one story — must differ. Touch: scale the chalk puff to a ~120 u puff and a ball-sized tick.

### woven-court — The Woven Court (yellow → blue → pink; plaid weave)

| Ch | Headline | Kid says | Verdict | Replacement |
|---|---|---|---|---|
| 1 Share the weight | SHARE | "A football on a checked blanket with a string and a knot." | **FAIL** — "fix everything yourself" needs a body carrying the load. | One silhouette alone holding a thread stretched tight across the frame, leaning back (strained). On "responsibility can be shared" two more silhouettes take the thread; it slackens into a curve; knots form where their hands are. The ball is at the first player's feet. Also: the ball sits directly under the SHARE band at t = 0 — move it down 160 u. |
| 2 Strength through connection | — | "Stripes; then dots appear where lines cross; one line bends." | **FAIL** — a lattice. The first 3 s are vertical stripes only (cross-story fix 10). | Make it a **goal net** (every child knows one): a 5×5 knotted net at ×3 scale, weft *and* warp from frame 1, knots drawn as real knots (loop + tail). "One strand stretched tight": a single thread pulled from the net by a pink hand, the knots around it hold. Then a football lands in the net and it gives and holds (the football beat §1c.7 wants). |
| 3 Make help visible | MOVE (over the goal — cross-story fix 7) | "A ball on a checked pitch with a blue leaf tied to it." | **FAIL** — the shuttle is a symbol for a player. | Two silhouettes: passer and receiver. Pass = ball flight 0.7 s; after passing, the passer runs 400 u into open space, arm raised (the call). Camera down 150 u so the goal clears the headline. |
| 4 Notice the next job | NEXT JOB | "The leaf things move about on the pitch." | **FAIL** | Two silhouettes: one sprints forward (leaning 20°, back leg extended), the other drops behind (arms out, facing the play). Their poses swap on "your jobs can change" — a rotation with anticipation. |
| 5 Respond together | RECOVER | "A dark grid with a ball, a string and a little goal." | **FAIL** — "possession lost / blame adds distance / recover" is invisible. | Keep the navy night duotone. A pink defender silhouette takes the ball; the two paper silhouettes are far apart (the distance), one looks away (blame); on "recover" both turn and sprint toward the goal and a thread knots between them; they stand either side of the goal as the ball is played. |
| 6 Offer. Listen. Support. | — | "A ball on a checked pitch turns round." | **FAIL** | Three silhouettes in a triangle; the ball travels round it (three 0.7 s passes); each pass knits a thread between the two players until the triangle is a woven patch. One silhouette's head turns toward the caller on "listen". |

Motion notes: seam 3→4 is a ring iris — use the thread unravel. Touch: the plucked thread must visibly bow toward the finger and snap back on twos (a blurred double line), not two paper rings. Also cross-story fix 10 (lattice to spec coverage, rest zone).

### kite-turned — The Kite That Turned (yellow → blue → green; wind bands)

| Ch | Headline | Kid says | Verdict | Replacement |
|---|---|---|---|---|
| 1 When the plan changes | LOOK AGAIN | "A tiny yellow thing on a string flies up and a green blob swallows it." | **FAIL** — kite too small (~90 u), the tree is a torn blob, the reel is a yellow gear/sun. | Kite ≥ 300 u tall from frame 1 (diamond, two spars, bow tail). A **child silhouette** stands on the ground holding the reel, string running up. A **tree** with a trunk and a torn crown (navy contour + teal overprint per storyboard). The kite snags in the crown; the child's shoulders drop (stuck). |
| 2 Adjust your angle | — | "A yellow kite on a string; it tilts." | PASS | Keep the self-drawing spars — best beat in the story. Add the child holding the reel. |
| 3 Make room to notice | BREATHE → LET GO (cross-story) | "A yellow screen with a line, a blue ball and a growing circle." | **FAIL** — a macro of the sail is unreadable at phone size; the blue dotted disc is unnameable. | Pull the camera back: the child silhouette fills the frame, chest lifts and arms open as the white ring grows (the breath is a body doing it); the kite string slackens into a curve as they "let go". The blue disc goes. |
| 4 Keep more options open | SIDEWAYS | "Two kites, a yellow and a blue one, and green bushes." | **FAIL** — begins "In futsal" and has no football, court or player (§1c.7). | Split the frame: sky keeps the yellow kite turning sideways; the green ground becomes the court: a paper player silhouette with the ball, a **blue defender silhouette** stepping into the forward lane, a teammate to the side; the sideways pass flies 0.7 s as the kite turns. The blue kite and blue reel go. |
| 5 Move after the pass | — | "The kites move around the bushes." | **FAIL** | Same ground stage: after the pass the passer runs to a new angle (motion arrow), the team plays round the defender; kite above mirrors the route. |
| 6 Notice. Choose. Adjust. | — | "A kite flies high; there is a little box on the ground." | PARTIAL — the box with a zigzag is noise. | The box becomes the child silhouette holding the reel, looking up; kite high and steady. |

Motion notes: the gust touch should rock the kite ±8° and bow the tail, not only scatter leaves. seam 3→4 ring iris → gust blows the yellow sheet off. Also cross-story: flat green horizon field (two stepped bands), crowns' navy contour.

### futsl — Love Futsl (green → blue → pink; TRACK, 7 visual scenes over 22 captions)

| Scene (captions) | Headline | Kid says | Verdict | Replacement |
|---|---|---|---|---|
| 1 (0–5.4) Smaller court, bigger game | — | "A big blue blob turns into a ring and a green pitch." | **FAIL** — the ball is a disc. | Paper ball with blue painted panels and one drip; the small court rectangle has visible pink walls from frame 1. |
| 2 (5.4–16.6) Tighter. Faster. Closer. / Less time / Less room / More decisions | TIGHTER | "A blue ball, some striped pills, and a smiley face; pink walls squash in." | **FAIL** — sole prints as players; the clock reads as a smiley/eye. The wall squash is good. | Three silhouettes: paper "you" with the ball, two pink defenders closing; the clock becomes a **stopwatch** (round face, top button, hand sweeping) or is cut. Keep the navy duotone for "Less room to hide" and the walls pressing to the touchlines. |
| 3 (16.6–23.3) On a full pitch / Seconds become moments | — | "A clock and a big circle on grass, then a blue dot." | **FAIL** — a ring for "several seconds". | A lone silhouette on wide grass with the ball, head turning left and right (scan) while the stopwatch hand sweeps; on "moments" the pink walls and defenders rush in (already the seam). |
| 4 (23.3–31.0) Scan early / Control / Combine / Solutions | SCAN EARLY | "Pink around a green box with pills; then pink squares crowd a circle." | **FAIL** | Silhouette head turned *before* the ball arrives (the scan is a body); cushion touch with a boot; one-two between two silhouettes; the maze beat: five pink defender silhouettes surround the player leaving one gap, the ball goes through it. |
| 5 (31.0–38.2) Everyone is in it / attack / defend / move / think | — | "A blue spider web with a ball on it." | **FAIL** — but the web enactment is strong. | Keep the web; put a silhouette at each of the five nodes. ATTACK all lean forward, DEFEND all crouch back, MOVE they swap nodes (web turns), THINK heads turn. |
| 6 (38.2–46.3) A smaller game? / Bigger / Every touch | EVERY TOUCH | "A tiny box and a big box; a huge blue ball; a striped thing touches it." | PARTIAL — the "striped thing" is nearly a boot. | Make it a **boot** (`boot` shape with studs, navy) touching the ball; the ball shows its painted panels at this scale. |
| 7 (46.3–54.6) Lessons travel / Wide open | WIDE OPEN | "Lines shoot out from a box; pink walls squeeze then open into a big pitch." | PASS (the only clean pass in the story) | Add one silhouette at the centre spot, arms open, as the walls dissolve; drop the final ring iris. |

Motion notes: cross-story §4 headline-leave issue (TIGHTER over scene 3, SCAN EARLY over scene 5) stands — verify on device. Touch: the roller dab must leave a visible 200 u blue stroke with two drips. Floor colour: cross-story fix 4.

---

## 3. Punch list

### HIGH — kid test (§1c)

1. **Add cut-paper silhouettes to every chapter that names a person** (chalk-line 1, 3, 4, 5, 6; woven-court 1, 3, 4, 5, 6; kite-turned 1, 2, 3, 4, 5, 6; futsl scenes 2, 3, 4, 5, 7). Build one shared `silhouette(pose, ink, s)` in each story file (not the library) with poses: *stand-ball-at-feet*, *head-turned*, *run-lean*, *arms-out-support*, *shoulders-down*, *defender-step-in*. Paper + navy contour for "you/teammates"; the story's pressure ink for defenders (chalk-line pink, kite-turned blue, futsl pink, woven-court pink). 1–3 per frame, ≥ 500 u tall, no face.
2. **Redraw the two non-balls.** chalk-line: chalk football with panel lines + knockout highlight (every chapter). futsl: paper ball with blue painted panels and a drip (every scene). woven-court: thread winding *over* faint panel seams (cross-story fix 1, constrained by §1c.3).
3. **kite-turned ch4–5: put the futsal on screen.** Ground half becomes the court with three silhouettes and a real sideways pass; remove the blue kite + blue reel.
4. **Replace the stand-ins**: woven-court shuttles → silhouettes (ch3–6); futsl sole prints → silhouettes / a boot (scenes 2, 4, 5, 6); chalk-line pink blocks → pink defender silhouettes (ch3, 4, 5); futsl clock → stopwatch or cut (scenes 2–3); kite-turned reel → reel in a child's hand (all), ch6 zigzag box → the child.
5. **woven-court ch2 → a knotted goal net** at ×3 scale with real knots, weft and warp from frame 1, a football landing in it.
6. **kite-turned ch1**: kite ≥ 300 u from the first frame, a tree with a trunk, child's shoulders drop when it snags. ch3: pull back to the child breathing (ring grows with the chest), string slackens; drop the blue disc.
7. **chalk-line ch5**: show the mistake (too-big touch into a defender, chalk cross, dotted shorter touch).

### MEDIUM — motion, seams, touch (§4, §4b, §4d)

8. **Break the four ring-iris seams**: chalk-line 3→4 and 5→6 → chalk-dust cloud (two different densities); woven-court 3→4 → thread unravel; kite-turned 3→4 → gust blows the sheet off; futsl 7→end → walls dissolve, no ring.
9. **Scale touch reactions 2–3×** with one clear shape change each: chalk tick ball-sized + 120 u puff; thread bows and snaps on twos; kite rocks ±8° and tail bows; roller leaves a 200 u stroke with drips.
10. **chalk-line ch1**: camera creep 40 u across the hold (§4b "wait").
11. **woven-court ch1**: ball down 160 u out of the headline band; ch3/ch4 camera down 150 u (cross-story fix 7).
12. **futsl**: verify on device that a seek clears the outgoing headline (cross-story §4).

### LOW — already in cross-story, listed for the builder's ledger

13. Headlines: chalk-line CHALK → none, FEEDBACK → INFORMATION, LOOK. TRY. → none; kite-turned BREATHE → LET GO (cross-story fix 6).
14. futsl floor → cream paper + pink plank grain, green only on the full pitch (fix 4).
15. woven-court lattice to spec coverage with wobble and a rest zone (fix 10).
16. kite-turned green horizon in two stepped bands; crowns with navy contour + teal overprint (§3 and fix 9).

What must not change: the ink triples, the print texture, the pace of the cue actions, the pressure squashes (chalk-line ch4, futsl scenes 2/4/7), the kite drawing itself in ch2, the futsl web turn, and every seam landing on its caption boundary.
