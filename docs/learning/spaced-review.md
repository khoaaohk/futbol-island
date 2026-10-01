# Spaced review: the daily Warm-up (30 Sep 2026, lane 3; mastery screen removed 1 Oct 2026)

> **1 Oct 2026, user decision: the "My football" mastery screen was removed completely.** Its tab in the learning drawer, the
> "My football" buttons on the welcome-back card, in the Paths Review card and in the backpack header are gone, with its view code,
> CSS and the helpers only it used (`dueLabel`, `STAGE_LABEL`, `STAGE_DETAIL`, the `'mastery'` view of `openLearningReview`, the
> `compact` mode of `LearningJourneys`). The **daily Warm-up stays**: it is its own learning feature (spaced retrieval of passed
> quizzes, paid coins), so the drawer now holds only the warm-up and is titled **Warm-up**. It opens from the Paths Review card's
> "Warm up" button when lessons are due (the welcome-back card no longer has buttons, by the same decision). Saved data is
> untouched: `fi2-lesson-review-v1` is still read and written by the warm-up, the book checks and the island ticks, and the
> stages still feed For grown-ups (`lib/grownups/progress.ts`). Coins already earned are kept. The three pilot journeys
> (`LearningJourneys`) were only reachable from the mastery tab, so they are unreachable again (as before lane 3) until a new
> home is chosen. Guarded by `tests/oct1-ui.cjs`.

Local only. Nothing here is committed or deployed. This closes audit gap **G-07** ("the learning never comes back", `scratchpad/game-audit/AUDIT.md`).

## What the player sees

- **Daily warm-up.** Lessons come back one day after their quiz is passed, then 3, 7, 14 and 30 days after each right review.
  - Each due lesson asks one short question, using its own visual quiz on the static SVG mini pitch (`VisualQuestion`).
  - A warm-up holds at most 3 lessons. Missed lessons come first, then the most overdue.
  - The first answer counts. Retries are practice: the child sees the per-choice "why", then tries again.
  - There are no streaks and no penalty for missed days. An overdue lesson just waits.
- **Where it opens:** the **Review** card in Paths, under the landing card ("Warm up", shown when lessons are due). Until 1 Oct
  2026 it also opened from the welcome-back card and the mastery tab, both removed.
- *(Removed 1 Oct 2026: the mastery screen, with per-format stage bars, a lesson list with stage chips and the pilot journeys.)*

## Stages (`lib/learning/review.ts` `stageOf`; shown to grown-ups in For grown-ups)

| Stage | Evidence |
|---|---|
| Introduced | Watched a step, answered a question, or a "seen on the island" tick (magazine, job, fishing, ball hunt, a tapped match callout) |
| Practicing | The lesson quiz is passed. Every question has a saved correct answer; retries count as practice |
| Applied | Right at a spaced review (box ≥ 1), or right first time at a book's "Take it to your game" check |
| Remembered | Right at two spaced reviews in a row (box ≥ 2), so still known at least 4 days later |

- A wrong review drops the lesson one box, brings it back tomorrow and puts it first in the next warm-up.
- Answering a lesson before it is due never moves its box, so the spacing can't be skipped.
- Reviews are scheduled in local days, not 24-hour blocks (QA11). A review is due from the start of the player's local day: "tomorrow" means from midnight, so a quiz passed at 17:30 is waiting after school the next day. `localDayStart` uses calendar fields, so month ends and DST days land on the right midnight.
- Island ticks are evidence only: they never change the schedule.

## Code

| File | Role |
|---|---|
| `lib/learning/review.ts` | Pure rules: boxes, due list, stages, the daily coin cap, sanitising |
| `lib/learning/reviewStoreCore.ts` | Store logic with injected ports (tests use fakes) |
| `lib/learning/reviewStore.ts` | Browser singleton: localStorage `fi2-lesson-review-v1`, React hooks, the **public API** below |
| `components/LearningReview.tsx` | The Warm-up drawer (Fishbook-style coastal side drawer, `--btn-*` buttons) |
| `components/LearningHost.tsx` | Mounted once in `Town.tsx`. Opens the drawer on `fi2-learning-review-open` and shows the Spot-it card |
| `components/PathReviewEntry.tsx` | The Paths "Review" card (its "Warm up" button opens the drawer) |

**Public API** (`lib/learning/reviewStore.ts`):
- `getDueReviews()` returns `{count, items:[{key, format, lessonId, name, concept}]}`, at most 3 items, and syncs enrollment first;
- `useDueReviewCount()` returns a live number for a badge;
- `useReviewState()` returns the records (the grown-ups summary reads it);
- `openLearningReview()` (opens the Warm-up);
- `openPathLesson(key)`;
- `syncReviews()`.

Enrollment is lazy and cheap:
- it happens when a surface asks, and once on the first hook subscription per page load;
- a passed lesson is enrolled with its first review due tomorrow.

## Heat

No new loops or timers:
- The drawer is static DOM plus the static SVG mini pitch, and its code loads on first open (`next/dynamic`).
- Lesson JSON loads only for the formats a warm-up needs, cached by `loadCatalog`.

## Economy

- A right warm-up answer pays `LEARN_COINS.review` (2), at most `REVIEW_PAID_PER_DAY` (3) a day.
- Wallet ids are `learn:review:<day>:<n>`.
- See `docs/economy/ECONOMY_UPDATE_2026-09-30.md`.

## Tests

`tests/learning-review.cjs` (in `npm test`) checks:
- scheduling: 1 → 3 → 7 days, missed first, early answers never skip, 3 per warm-up;
- stages, and that ticks never change the schedule;
- the store's due list, the 3-a-day paid cap with unique ids, and reload.

Browser check: `scratchpad/game-fixes/lane3/check-lane3.cjs` at 390×844 and 1280×800.
