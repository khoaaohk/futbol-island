# Apply in play: side activities point back to the lessons (30 Sep 2026, lane 3)

Local only. This closes audit gap **G-08** ("learning isn't applied in play") and the books part of **G-14**.

## One concept map

`lib/learning/conceptMap.ts` holds 22 football concepts. Examples: one-two, third man, overlap, switch play, support angle, width, team roles, scan and receive, 2v1, press and cover, goal-side, win it, lose it, offside, through ball, cut-back, far post, pivot, keeper build-up, restart options, keeper set, follow in.

Each concept has:
- **words at three levels:** futsal and 7v7 simplest, 9v9 middle, 11v11 fullest (`levelFor`);
- **Paths lessons** per format, core stops first. Every one of the 48 starter stops maps to at least one concept;
- the **ball-hunt kinds**, **combo feed lines / sim counters**, **Konbini magazines**, **island jobs** and **fishing keeper beats** that show the same idea.

## Live matches: "Spot it!"

- When a live pitch plays a concept the child has **passed a lesson for**, a small card appears under the top HUD. It says "You learned this! Switch play — Move the ball through support to the side the defence left" and has **See the lesson**.
  - The same-format lesson is preferred, then the nearest format **of the same game**: the grass ladder (7v7 → 9v9 → 11v11) or futsal. A grass callout never opens a futsal lesson and a futsal callout never a grass one (QA11 C-7: an 11v11 "Attack the box" used to open futsal's far-post lesson; there is no grass far-post lesson yet, so it now shows nothing). The beach court (not a path format) may use any format. `conceptLessons(concept, format, true)` in `lib/learning/conceptMap.ts`.
  - The sole drag-back skill's "Pull-back" line is not a cut-back, so only `Cut-back!` maps to that concept.
  - Why 7v7 fires less (QA11 C-7, checked, throttles kept): most 7v7 feed lines are 1v1 skill moves (Stepover, Body feint…), which teach no path concept. 7v7 fires on `One-two!`, `Overlap on the wing`, `Parried — rebound!` / `Rebound goal!` (its own lessons) and switches (9v9/11v11 lessons, if passed). The `watching` rule (radius + 35 m of the camera, about 30 m from the pitch's centre for the player) is not the limit.
  - The words follow the pitch being watched.
- **Triggers** (no new detection logic):
  - the combos teaching feed (`One-two!`, `Overlap on the wing`, `Through ball!`, `Cut-back!`, `Attack the box`, `Pivô holds it up`, `Goalkeeper throw`, `Kick-in…`, `Parried — rebound!`);
  - the sim counters `stats.switches` and `stats.offsideCalls`. Offside is only called in 9v9 and 11v11.
- **Cost:**
  - `matchEffects.update` already compares the feed serial and those counters every update.
  - It calls `reportMatchConcept` only when one changes **and** `watching` is true.
  - `watching` is set by `fieldRuntime`: the pitch is on screen, it is not in a lesson, the loop is active, and the camera is within the pitch radius + 35 m (or the player is viewing that format).
  - Off-screen and dormant pitches never report.
- **Throttle** (`lib/learning/spotIt.ts`):
  - one card per 90 s island-wide;
  - the same concept at most once per 10 min;
  - 6 per visit.
  - Throttle checks run before the learned-lesson lookup.
- **UI:** the card shows for 8 s under a single timeout. Tapping it ticks the lessons and opens the lesson.
- Nothing is shown while the map, store, a conversation, the customizer, the arcade or onboarding is open.

## Books: "Take it to your game"

- On a pop-up book's final page, a gold **Take it to your game** pill opens one question (`lib/learning/bookChecks.ts`, all 37 books).
- The question turns the book's message into a football decision. For example, Cafu leads to the overlap and Kanté to "win it, then give it quickly".
- Each check names a concept and a format. `bookLesson(bookId)` resolves the lesson, and the test checks that the lesson teaches that concept in that format.
- **A right answer first time:**
  - counts as that lesson's review if it is due;
  - otherwise records **Applied** evidence without skipping the spacing.
- **The first right answer (any try):** pays `LEARN_COINS.book` (5) once per book (`learn:book:<bookId>`).
- **Watch the lesson** closes the book and opens the lesson.

## Magazines, jobs, fishing, ball hunt

These are "seen around the island" **ticks**: evidence only, once per source, ever. A tick makes an untouched lesson **Introduced** and shows "Seen on the island ×N". Ticks never change the review schedule.

| Source | Hook | Concept → lessons |
|---|---|---|
| Konbini magazine answered right | `KonbiniRoom` magazine check | offside → 7v7 *Which Line Matters?*, 11v11 *Run When the Pass Is On*; throw-in → restart options |
| Island job finished | `IslandJobs` payday effect | offside-flag → offside; wall-rebounds → scan and receive; ball-kid → restart options |
| Fishing keeper lesson shown | `FishingHost` lesson toast | keeper set → futsal *Keeper: Defend the Goal or the Space* (one tick ever) |
| Ball-hunt lesson finished | `BallHuntLesson` | 77 of 100 ball ideas link to a Paths lesson. The ball's level picks the format (1 → 7v7, 2 → 9v9, 3 → 11v11). The card shows "In Paths: *lesson* · Watch it" |

Rules, health and beach-only ideas (warm-up, water, heading, the whole-ball line, barefoot…) have no Paths lesson, so they stay unlinked.

**Arcade:** Astra's `lib/arcade/*` and the Arcade room are read-only for this lane, so nothing was added there.

## Tests

`tests/learning-review.cjs` checks:
- every book has a check that resolves to a real lesson teaching its concept in its format;
- Spot it: off screen = none, not learned = none, the 90 s and 10 min gaps, the session cap, the scaled words;
- every report in `matchEffects` sits behind `watching`, and `fieldRuntime`'s `watching` expression;
- concept-map coverage: all 48 starter stops; lesson, ball-kind, magazine, job and keeper-beat ids exist; every feed pattern matches a real combos line.
