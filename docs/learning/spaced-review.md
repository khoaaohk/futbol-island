# Spaced review and My football (30 Sep 2026, lane 3)

Local only. Nothing here is committed or deployed. This closes audit gap **G-07** ("the learning never comes back", `scratchpad/game-audit/AUDIT.md`).

## What the player sees

- **Daily warm-up.** Lessons come back one day after their quiz is passed, then 3, 7, 14 and 30 days after each right review.
  - Each due lesson asks one short question, using its own visual quiz on the static SVG mini pitch (`VisualQuestion`).
  - A warm-up holds at most 3 lessons. Missed lessons come first, then the most overdue.
  - The first answer counts. Retries are practice: the child sees the per-choice "why", then tries again.
  - There are no streaks and no penalty for missed days. An overdue lesson just waits.
- **Where it opens:**
  - the welcome-back card (Lane 1, `components/WelcomeBack.tsx`);
  - the new **Review** card in Paths, under the landing card;
  - the My football tab.
- **My football.** This is the mastery screen. It shows:
  - the four formats, each with "n/12 passed";
  - a stacked progress bar and legend (Remembered, Applied, Practicing, Introduced, Not started);
  - every starter stop by chapter, with its stage chip, a 4-step stage meter and "Review due / tomorrow / in N days";
  - "Seen on the island ×N" and a Start / Watch again button (`openPathLesson`);
  - Go-deeper lessons, once touched.
  - The three pilot "new situation" journeys (`LearningJourneys`), which were only reachable from the never-rendered `IslandPassport`. It now sits at the bottom of the tab.
  - Opens from Paths (Review card), the backpack ("My football" button in the backpack header) and the welcome-back card.

## Stages (`lib/learning/review.ts` `stageOf`)

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
| `components/LearningReview.tsx` | The drawer: Warm-up + My football (Fishbook-style coastal side drawer, `--btn-*` buttons) |
| `components/LearningHost.tsx` | Mounted once in `Town.tsx`. Opens the drawer on `fi2-learning-review-open` and shows the Spot-it card |
| `components/PathReviewEntry.tsx` | The Paths "Review" card |

**Public API** (`lib/learning/reviewStore.ts`):
- `getDueReviews()` returns `{count, items:[{key, format, lessonId, name, concept}]}`, at most 3 items, and syncs enrollment first;
- `useDueReviewCount()` returns a live number for a badge;
- `useReviewState()` returns the records (the grown-ups summary reads it);
- `openLearningReview('review' | 'mastery')`;
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
