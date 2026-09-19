# Island Paths: first-island journey proposal

September 16, 2026. Repository audit and implementation plan only. No application behavior, future island, challenge, deployment, or saved progress changed by this document. Current source takes precedence over older design notes.

## Recommended player journey

Create your character → explore the first island and learn concepts in four format paths, with Ball Hunt and Explore alongside them → finish all four format paths → prepare for future travel on the existing Matchday Ferry → future Academy Island, academy player to first team → future Professional Training Island.

User clarification: the first island is for exploration and learning each format. Other islands come later. The existing Matchday Ferry is the future travel mechanism and stays locked for travel now, including after all current paths are complete. Do not introduce a replacement travel UI.

Keep all four formats available from the start. Present futsal, 7v7, 9v9, and 11v11 in that order as a suggestion, with one recommended next lesson. Returning players resume their chosen format. Exploration is the setting and a parallel activity, not a compulsory checklist before learning.

The next implementation should reorganize existing teaching content and connect progress. It should not build Academy Island, Professional Training Island, or challenges. Future content has a clearly labeled unavailable state and never contributes to the current completion denominator.

## What exists now

| Area | Current source and behavior | Gap |
| --- | --- | --- |
| Character onboarding | `components/IslandOnboarding.tsx`, `lib/town/onboarding.ts`: six welcome steps; character selection; skip/replay; `fi2-welcome-v1` stores completed or dismissed | Describes concept chapters rather than four formats; no explicit first-island/future-island journey |
| Paths overview | `components/IslandQuests.tsx`: Ball Hunt and Explore summaries above `QuestLearningPath` | Parallel activities already fit the requested structure; keep them |
| Learning road | `components/QuestLearningPath.tsx`, `lib/town/learningJourneys.ts`: Support angles (futsal), Width and timing (7v7), Off ball movement (futsal) | Three pilot concepts, no 9v9/11v11 paths; not an overview of the complete teaching library |
| Pilot stages | Six stages per concept; first four constitute `isJourneyComplete`; reviews become available after two and seven days | “Stage completed” records reaching the end, including wrong answers; it is not proof of correct quiz answers or independent learning |
| Full lesson library | `public/lessons/{format}.json`, cached `loadCatalog` in `lib/town/formatLessons.ts` | Library exists but normal lessons are not represented by the current Paths road |
| Stories | Five persistent story IDs in `lib/paths/stories.ts`, currently distributed across three pilot concepts | Need explicit placement across four formats, preserving IDs and completion |
| Story interaction | Current `PathStoryModal.tsx` permits early exit without completion; completion becomes eligible on reaching final moment, and saves on dismissal | Older story notes describe a stricter gate that current source no longer implements; retain easy exit |
| Ball Hunt | `coinQuest.ts`, `coinProgress.ts`, `BallHuntLesson.tsx`: collection, clue/reveal, reward migration, individual teaching moments | Collection is separate from format learning. Do not turn hunt teaching cards into automatic format lesson credit |
| Explore | `exploreChecklist.ts`, `exploreActivity.ts`: 16 existing checklist entries, including pitch visits, five plays, five quizzes, conversations, and island activities | Keep its distinct checklist presentation and progress; do not require every activity to qualify for Academy |
| World structure | `app/page.tsx` renders `Town`; four venues in `venues.ts` are fields on the existing island | Four format paths must not be labeled as four separate islands |
| Matchday Ferry | `lib/town/world.ts` creates the moored ferry and dock; `ferryBoarding.ts` defines its existing walkable ramp/deck | Preserve physical exploration; travel remains locked. Boarding the existing deck is not inter-island travel |
| Legacy Academy UI | `components/Academy.tsx` and `lib/progress.ts` exist but are not the root app route | This is not the requested future Academy Island; do not expose or rename it as if the new island existed |

Catalog and manifest counts agree in this audit:

| Format | Existing lessons | Quiz questions | Played steps |
| --- | ---: | ---: | ---: |
| Futsal | 31 | 63 | 257 |
| 7v7 | 18 | 36 | 172 |
| 9v9 | 27 | 54 | 285 |
| 11v11 | 20 | 40 | 204 |
| Total | 96 | 193 | 918 |

Every listed lesson has quiz questions. Counts should be generated from content, not maintained in UI copy. The library has uneven sizes and many 9v9 categories; exposing every category as an additional path would recreate the confusion.

## Screen structure and copy

### Paths overview

Use the existing shared modal. Show “Island Paths” and a short introduction: “Explore your island and learn the game in four formats.”

1. Ball Hunt and Explore remain compact sibling summaries, each with its own count and entry point.
2. Four format cards, two columns when space allows and one column on narrow screens. Each has format name, one short teaching purpose, completed lessons/required lessons, and Start or Continue. Completed cards offer Review.
3. One quiet future-journey block below the cards: “Matchday Ferry · Travel coming later.” Supporting copy: “Keep exploring and learn all four formats. The ferry will take you to new islands when they are ready.” Below it, small text may name Academy Island and Professional Training Island as future destinations. Once qualified, say “All four paths complete. Ferry travel is coming later.” No Travel or Unlock button today; reuse the existing ferry when destination travel is eventually implemented.

Avoid separate counters for score, stars, stages, stories, and rewards on the overview. Main progress is four paths; each path has its lesson count. Do not show a functioning island selector or destination marker for unavailable islands.

### Format detail

Title examples: “Futsal Path” and “9v9 Path.” Keep Back, a progress summary, and one prominent Continue action. Continue resumes the last incomplete lesson or opens the first incomplete required lesson. If the lesson's play is complete but quiz answers remain, offer “Continue quiz.”

Render a simple vertical sequence grouped into a few readable chapters. For the initial release, preserve the authored catalog lesson order. Use existing category labels as section metadata, grouping adjacent small categories only after content review. Do not reorder by title or fabricate a new pedagogical sequence.

Each lesson row shows its title and one clear state: Not started, Watch play, Try quiz, or Complete. Opening a row uses the existing field lesson and quiz experience. Explain once: “Watch the whole play and answer each quiz question correctly. You can retry.” Replays remain available. Players may choose any lesson; Continue guides order without locking the library.

Side-story stops appear at relevant chapter boundaries with a book icon and “Optional story.” Their completion is separate from the core lesson count. A small “Challenges · Coming later” note at the end is sufficient; no numbered challenge node, disabled quiz, or fake progress bar.

### Story placement default

Reuse the five existing stories, preserving the same story IDs and narrative:

| Path | Story ID | Teaching connection |
| --- | --- | --- |
| Futsal | `reset` | Recover focus after a missed finish |
| 7v7 | `empathy` | Notice and support a quiet teammate |
| 9v9 | `regulate` | Respond constructively when a decision feels unfair |
| 11v11 | `grit`, `loss` | Healthy practice and learning after a loss |

Author each attachment by stable lesson ID in the path definition, not by an array position. Recommend the story after its preceding lesson; allow it to be opened early and replayed. Stories teach teamwork/emotional skills, but watching one is not evidence of mastering those skills. Moving a story must never remove its completed state.

### Onboarding

Keep character selection, skip, replay, and existing appearance persistence. Update the tour to explain the first island and four paths with concise copy: “Explore first, or pick a field format in Paths. Ball Hunt and Explore are adventures alongside your lessons.” End on the island with an optional Paths entry, not a forced lesson or second modal. Mention Academy and Professional Training briefly as future destinations, without suggesting they can be visited today. Do not replay onboarding for existing users merely because Paths changed.

## Completion contract

Recommended version-one default: all 96 existing catalog lessons form the four core paths. This matches a full-format curriculum without inventing lessons. It is a substantial journey; if a shorter introductory route is desired, curate and name it explicitly before implementation rather than silently counting a few pilot stages as a completed format.

- A play is watched when every required step has playback-completion evidence. Existing `fieldRuntime.ts` records a step only when active playback reaches its end and narration is no longer pending. Seeking to the last frame is insufficient.
- A lesson is complete when its play is watched AND each of its quiz question keys has a saved correct answer. Answers may be accumulated across visits; retries and hints are allowed. This represents completion, not independent mastery.
- A format path is complete when every required lesson in its versioned definition is complete.
- The first-island learning journey is complete when all four format paths are complete. Ball Hunt, Explore, stories, pilot practice, delayed reviews, and future challenges are optional and excluded from this gate.
- Existing Applied/Remembered pilot evidence remains available for those concepts but is not generalized to all lessons. Delayed reviews must not force players to wait days to qualify.
- Academy eligibility and ferry travel availability are separate. Eligibility may be earned now; Matchday Ferry travel stays locked until an implemented, released destination and its future travel system exist. Do not invent its curriculum, graduation threshold, or professional eligibility criteria in this change.
- Completion counts are derived from evidence, never inferred from opening a card, visiting a field, finishing onboarding, viewing a story, or pressing a final quiz button.

Freeze the required lesson-ID sets under a curriculum version. New optional lessons must not revoke a previously completed path or earned Academy eligibility. For a future major curriculum revision, retain prior earned completion and show new material as additional learning. Do not silently change quiz ordering/IDs under persisted positional keys.

## Persistence and migration

Existing stores to preserve:

| Storage key | Meaning | Treatment |
| --- | --- | --- |
| `futbol-island-quests-v1` | Visited formats; played `format:lesson:step` keys; equipment evidence | Source of watched-play evidence |
| `futbol-island-quiz-progress-v1` | Correct `format:lesson:question` keys | Source of quiz completion; no score conversion |
| `fi2-football-learning-v1` | Three pilot concept journeys, cursors, assistance/attempts, reviews | Retain intact; expose as optional practice attached to relevant futsal/7v7 lessons |
| `fi2-life-paths-v1` | Completed side-story IDs | Reuse, without renaming story IDs |
| `fi2-matchday-coins-v1` | Ball Hunt collection/reveal/rewards | Preserve existing sanitizer and grandfathered costume rewards |
| `fi2-explore-activity-v1` | Explore activity evidence | Keep independent |
| `fi2-welcome-v1` | Completed/dismissed tour | Keep independent; no forced reset |
| `futbol-island-customization-v1` | Character/equipment appearance | Keep independent |
| `futbol-island2.progress.v1` | Legacy Academy component scores | Leave intact; do not treat as equivalent to Town lesson evidence |

Also preserve unrelated mascot/club story and user preference stores. No storage clearing, broad migration, cloud-sync promise, or account requirement is needed.

Add a small versioned Paths state only for navigation/cursor and durable earned milestones, for example `fi2-island-paths-v1`: selected format, last lesson per format, bounded saved lesson cursor, curriculum version, format completion timestamps, Academy eligibility timestamp. Completion evidence remains in its existing source stores; do not duplicate 918 step flags or 193 answers.

On first use, derive progress from existing valid evidence. A previously completed normal lesson immediately counts. Pilot stage 0 can contribute existing canonical step/quiz evidence; stages 1–5 use synthetic variants and must not be falsely mapped to unrelated catalog lessons. Keep their records through the existing pilot sanitizer; do not replace its known journey IDs with the four format IDs. Optional pilot practice needs a reachable secondary entry so preserved progress is not hidden forever.

Use a single subscribed adapter for overview/detail progress. Story completion currently uses local component state plus storage reads; add the same event-driven/cross-tab subscription behavior as the other stores. Merge monotonic completion sets with persisted evidence before writes; current quiz writes do not merge with the latest storage value and can lose a different tab's answer. Retain latest local cursor without treating it as completion.

Storage failures should keep current-visit progress in memory and display a quiet “Progress could not be saved in this browser” message. Only promise browser-local saving. Bound and validate cursor indices against the loaded lesson; do not restore an answered question as correct unless the evidence says so. Preserve the difference between a selected answer and an earned correct-answer key.

## Implementation sequence

1. **Define curriculum and progress selectors.** Add `lib/paths/formatPaths.ts` with four IDs, curriculum version, canonical required lesson IDs, story attachments, and optional pilot references. Add pure selectors for lesson/path/island completion over existing manifests/evidence. Generate compact metadata from catalogs; parity checks reject missing/duplicate IDs and count drift.
2. **Build a progress adapter and migration tests.** Subscribe to existing evidence; introduce only cursor/milestone persistence. Test import of partially watched, correctly answered, pilot-only, old costume, completed-story, malformed-storage, and multi-tab cases. Verify no reset and no invented credit.
3. **Replace the three-chapter entry screen.** Update `IslandQuests` and `QuestLearningPath` or introduce `FormatPathOverview`/`FormatPathDetail`. Retain Ball Hunt/Explore and shared modal navigation. Keep pilot practice available through the relevant lesson's optional practice entry.
4. **Add explicit lesson launch context.** Extend the existing Town/FieldLearning launch integration with format, canonical lesson ID, saved cursor, and return-to-path context. Keep pilot `LearningId` support separate. Closing a path lesson returns to the same format and scroll position; closing a field-opened lesson returns to the island. Use existing playback/quiz recording, not a parallel player.
5. **Attach stories and future journey status.** Move placement metadata, keep the lazy story modal, and subscribe to completion. Future destinations/challenges are static explanatory content referencing the existing Matchday Ferry. Academy eligibility is derived and then preserved once earned; the ferry stays locked for travel, with no new travel UI or asset fetch.
6. **Update onboarding wording and validate the whole flow.** No automatic welcome reset. Confirm keyboard/mobile focus, Back/Escape, early story exit, explicit replay, small screens, and saved-state restoration.

The parent play/quiz clarity work has completed with its build and coverage checks passing. Integrate only the lesson-launch context after reviewing those settled changes; this proposal does not require a renderer rewrite.

## Runtime cost and validation

Read `AGENTS.md` and `docs/performance-guide.md` before implementation. The overview should use lightweight metadata plus existing evidence; do not fetch all four large lesson catalogs, story sprites, videos, or future-island assets. Fetch only the selected format through the existing cached `loadCatalog`, and load a story only when opened. If chapter detail needs titles before selection, use generated metadata without actor/animation payloads.

Compute progress on evidence changes or modal opening, never from Town's frame loop. Subscribe only while relevant UI is mounted. Add no RAF, polling, autoplay, live 3D card preview, or repeating progress animation. Preserve normal-menu island pause, video ownership, hidden-story suspension, finite story choreography, renderer reuse, and clean resume without a simulation catch-up burst. Static future cards have no background work.

Acceptance checks:

- Fresh and returning players see exactly four format paths plus independent Ball Hunt/Explore; all four fields remain accessible.
- Existing correct answers and played steps populate the new paths; pilot completion alone does not complete a full format.
- Watching without quiz success, quiz success without watching, and skipping to the end cannot complete a lesson. Wrong answers remain retryable.
- Completing a lesson from a field updates Paths and Explore identically; completing it from Paths uses that same evidence.
- All four core paths complete produces earned Academy eligibility and “Ferry travel is coming later”; the existing Matchday Ferry remains travel-locked, with no destination entry, future challenge requirement, or optional-story/hunt gate.
- Reload, replay, cross-tab merges, storage failure, existing rewards, and later content additions preserve earned progress.
- Browser test at 390×700 plus desktop covers Continue, back navigation, cursor bounds, completion messaging, focus restoration, and no blocked story exit.
- Network checks confirm no initial story art or bulk lesson/future-island fetch. Frame counters remain stable while the ordinary Paths modal is idle; story activity stops after its finite timeline and on hide/close.
- Run relevant existing `tests/quiz-progress.cjs`, `tests/lesson-catalog.cjs`, `tests/path-stories.cjs`, `tests/story-choreography.cjs`, and progression/checklist tests, add meaningful selector/migration/integration coverage, then production build. Review test filenames against the current repository before invoking them.
- Physical iPhone feedback is required for any temperature claim; passing desktop mobile emulation only establishes UI and work-count behavior.

## Product choices and suggested defaults

The only material curriculum decision is whether all 96 current lessons are core or a smaller authored selection defines first-island graduation. Recommend all current lessons in a frozen version-one curriculum unless the user wants a shorter introductory journey. Recommended remaining defaults: open format access; suggested sequence only; stories/hunt/exploration optional; retries accepted; delayed reviews optional; no current travel to future islands. These defaults make the plan implementable without inventing unfinished content or discarding existing progress.

Validation of this proposal: inspected current TypeScript/React sources and counted the four JSON catalogs plus both progress manifests. No application tests or build were run because this change is documentation only. Deployment status was not checked.
