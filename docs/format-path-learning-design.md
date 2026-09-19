# Learning design for the four format paths

September 16, 2026. Research and curriculum proposal; no application behavior or saved progress changed. Read alongside [the journey plan](island-paths-journey-plan.md) and [performance guide](performance-guide.md). This document proposes an explicit shorter starter curriculum in place of the journey plan's earlier default of requiring all 96 lessons. The proposed 48-lesson threshold is a product/design judgment, not a research-established graduation standard. It must be adopted explicitly in the implementation definition and player copy.

## Recommendation

Give each format a **12-lesson Starter Path**, followed by optional **Go deeper** lessons. Keep every existing lesson accessible: 48 starter lessons and 48 depth lessons across the island. Suggest futsal → 7v7 → 9v9 → 11v11, but permit any starting format and preserve the returning player's choice. Use one Continue action, short chapters, existing field playback and quizzes, and optional stories between lessons. Ball Hunt and Explore remain sibling activities.

The first island introduces how to read football: find your role, receive and support, attack together, protect the goal, react when possession changes, and restart. Requiring every specialized formation matchup before recognizing that introduction would make the unequal catalog sizes dictate graduation. The selection below covers those ideas in each format while retaining the specialist content for players who want more. Twelve is a manageable editorial scope, not a magic learning number; validate it with learners.

Completing all four Starter Paths can earn the explicitly named **First-island starter journey complete** milestone. It does not mean the entire library is finished, football is mastered, or Academy has been built. All 96 lessons completed is a separate library accomplishment. Academy eligibility may reference the starter milestone if that product policy is adopted; the existing Matchday Ferry still offers no travel until a destination is implemented and released. Academy Island, Professional Training Island, and challenges remain clearly marked future content, outside every current completion denominator.

## Evidence and its limits

The following sources are primary experiments or official evidence guidance. They support instructional principles; none tests this application, proves a particular island order, or establishes a football mastery threshold.

| Finding | Evidence | Application proposed here |
| --- | --- | --- |
| Recall can improve later memory beyond repeated study. | Karpicke, Blunt and Smith's three experiments involved 88 children, mean age ten, learning words. Benefits occurred across the measured reading-comprehension and processing-speed differences. This supports children's retrieval practice, not claims about match performance. [Original study](https://pubmed.ncbi.nlm.nih.gov/27014156/) | Let players make a decision before showing its explanation, then return to the idea later. Preserve reading/narration choices and no response timer. |
| Spacing, examples interspersed with problems, explanatory questions, and quizzes have differing levels of supporting evidence. | The IES practice guide rates recommendations separately; its worked-example recommendation has moderate evidence, while some quizzing and explanatory-question recommendations have strong evidence. [IES guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1) | Model one decision, ask the player to choose, then ask what changed. Offer later retrieval without making a calendar delay a progression gate. |
| Novices benefit from guidance that becomes less intrusive as knowledge develops. | NSW's evidence-based practice guide recommends worked examples, gradual independent problem solving, removing inessential information, and colocating essential information. [NSW guide](https://education.nsw.gov.au/about-us/education-data-and-research/cese/publications/practical-guides-for-educators/cognitive-load-theory-in-practice.html) | One situation and one question at a time, short coach wording, existing pitch cues, optional help. Avoid simultaneous story text, score effects, instructions, and moving match content. |
| Retrieval success and feedback conditions matter. | Three experiments found that retrieval success during practice moderated later benefits under repeated feedback; difficult unsuccessful retrieval alone was not a universal solution. The task used word pairs, not football. [Primary experiment](https://pubmed.ncbi.nlm.nih.gov/32418183/) | After a wrong answer, give specific existing feedback and a replay or retry. Do not repeatedly demand unaided guesses from a confused beginner. |
| Transfer needs its own evidence. | A study of 205 participants found differences in video-based soccer decisions associated with experience in sports sharing relevant elements. It compared existing sport experience, not an Island Paths intervention. [Causer and Ford](https://pubmed.ncbi.nlm.nih.gov/24414520/) | Connect the same tactical relation across formats, then assess a changed scene. Never award real-world skill mastery from collecting objects or passing these screen quizzes. |
| Classroom implementation is context dependent. | EEF's commissioned evidence review examines cognitive-science approaches in classrooms; its practical caveats concern age, prior knowledge, subject, and implementation. [Review and materials](https://educationendowmentfoundation.org.uk/education-evidence/evidence-reviews/cognitive-science-approaches-in-the-classroom) | Treat session length, mixing schedule, story placement, and curriculum size below as testable design choices. Do not assume all interleaving is beneficial or shuffle unrelated beginner material randomly. |

A hint, a worked example, and repeated attempts are useful learning supports. They are different evidence from a first unaided response in an unfamiliar situation. “Mastery learning” here means giving feedback and another chance until the lesson criterion is met; it does not justify calling that criterion proof of durable mastery.

## One lesson, one small learning cycle

Target a comfortable **3–6 minute visit for one lesson**, with 1–2 lessons offered per session and an optional earlier review. This is an initial UX hypothesis, not an age-based attention-span claim. Current lessons contain 6–17 authored steps; narration, reading speed, and retries vary. Measure actual durations before promising a time estimate. Longer lessons may span visits; do not speed narration or delete teaching steps to fit the estimate.

| Moment | Player action | Existing implementation and first-release boundary |
| --- | --- | --- |
| Watch | See the worked example and hear/read the important cue. | Existing `FieldLearning`, `FieldVisualBeat`, lesson narration/transcript, pause and replay. Finish the authored play for watched credit. |
| Predict | Look at the frozen quiz scene and think where the next useful route is. | Existing question setup and pitch markers. “Predict” is the mental part of the existing quiz, not a new game or additional required screen. |
| Try | Tap a route, player, or space before the answer is shown. | Existing `FieldQuestion.interact` and answer handling. The second question often changes the defender or teammate cue; retain it. |
| Explain | Compare the selected route with the feedback: “What changed? Why does this option work now?” | Existing `explain`, `choiceExplanations`, and `QuizReplay`. An optional spoken-to-yourself prompt needs no microphone, text submission, AI grader, or new correctness gate. |
| Revisit | On a later visit, try the idea before replaying the solution. | Existing pilot reviews already support this for three concepts. Other lessons can be manually replayed now; a dated review recommendation for the full library is a later small feature, not existing functionality. |

The normal catalog's full play precedes its quizzes. An immediate correct response can therefore reflect recently seeing the answer. It is still useful practice, but it is not an independent mastery check. Preserve that distinction in copy and data.

Keep **Try again**, **Watch explanation**, **Back to lesson**, and an easy exit. Do not subtract rewards, consume lives, hide help after failure, demand a perfect first attempt, or force a full replay for one missed question. A wrong answer can advance to the next question in today's UI; the completion selector must still require saved correct evidence for the missed question. Do not equate the final Next/Back button with success.

## Concrete starter order

IDs below are existing catalog IDs, in proposed teaching order. Orders guide Continue; no lesson needs a prerequisite lock. Chapters are lightweight presentation metadata, not new games. For 7v7, 9v9, and 11v11 these selections retain the first twelve authored lessons in their existing order. Futsal removes two early formation/run alternatives and brings the existing far-post defense lesson alongside the attack it answers.

### Futsal: close support and fast changes

| Chapter | Required lessons, in order | Purpose |
| --- | --- | --- |
| Find your connection | `learnf_roles31` → `bld_f_passtofeet` → `prn_f_support` | Meet court roles; read pressure; make a clear passing angle. |
| Attack and protect across goal | `f_pared` → `f_pivot` → `learnf_farpost` → `gapf_farpostdefense` | Choose a wall pass or pivot action; time the far-post arrival; recognize the same danger when defending. |
| When the ball changes teams | `def_f_goalside` → `trn_f_firstpass` → `trn_f_winitback` | Delay with cover; attack or retain after a regain; pressure or recover after loss. |
| Start with another option | `bld_f_splitcb` → `set_f_throwin` | Goal-clearance continuation and a backup kick-in route. |

This is 12 lessons and 25 questions; goal-clearance has three questions. Suggested optional pilot: `support` after `prn_f_support`. Attach the optional `movement` pilot after its canonical depth lesson `expf_kickinthird`, not to an unrelated lesson just because it involves running.

### 7v7: give your teammate a useful option

| Chapter | Required lessons, in order | Purpose |
| --- | --- | --- |
| Meet the team and restart | `learn7_roles` → `learn7_shape` → `learn7_buildout` | Roles, lines, and the catalog's explicitly labeled AYSO goal-kick/build-out example. |
| Look and help | `learn7_receive` → `learn7_carry` → `prn_7_spread` → `prn_7_support` | Turn or return, carry or pass, add width, escape the passing shadow. |
| Connect around pressure | `s_onetwo` → `bld_7_usekeeper` | Combine only when the return is open; use the keeper when available. |
| Protect the goal together | `def_7_goalside` → `dbz_7_dontballwatch` → `gap7_lostball` | Goal-side position, runner awareness, then recovery after loss. |

Twelve lessons, 24 questions. Optional `width` pilot attaches to `prn_7_spread`. `learn7_buildout` is a regional example, not a universal 7v7 rule. Keep its AYSO title and context; choosing this existing lesson for core does not imply every player's competition uses that rule.

### 9v9: connect units and share protection

| Chapter | Required lessons, in order | Purpose |
| --- | --- | --- |
| Find your unit and receive | `learn9_shape` → `learn9_receive` → `prn_9_support` | Add unit responsibilities without losing the familiar scan/receive/support decisions. |
| Read the spare option | `learn9_two_one` → `learn9_switch` → `learn9_wall` → `bld_9_usekeeper` | Read the defender, switch through support, evaluate the return pass, connect through the keeper. |
| Share the next job | `learn9_cover` → `trn_9_firstpass` → `trn_9_recover` | Pressure/cover and choices immediately after gaining or losing possession. |
| Restart and track | `learn9_restart` → `gap9_runnerhandoff` | Two restart options and a runner handoff only when cover exists. |

Twelve lessons, 24 questions. Preserve the existing FA/local-competition qualification in `learn9_restart`. There is no existing 9v9 six-stage pilot; do not invent one in the launch adapter.

### 11v11: coordinate the whole team

| Chapter | Required lessons, in order | Purpose |
| --- | --- | --- |
| Receive inside the team shape | `learn11_shape` → `bld_11_throughlines` → `bld_11_whenlong` | Shared jobs, first-touch decisions, then reading a different route past pressure. |
| Create the next opening | `e_switch` → `e_thirdman` → `learn11_cutback` | Switch for space, use a third player only when needed, find a clear cutback. |
| Keep the team connected | `def_11_pressurecover` → `def_11_shift` → `trn_11_recover` → `trn_11_restdefense` | Pressure/cover, group movement, response to loss, protection behind the attack. |
| Restart and time the run | `learn11_restart` → `gap11_runoncue` | Offer two options; coordinate a run with an available pass. |

Twelve lessons, 24 questions. The eight detailed formation/opposition lessons remain depth. There is no current 11v11 pilot or independent mastery assessment.

## Optional depth: every remaining catalog lesson

These lists account for all remaining IDs exactly once. Within each group retain the order shown; opening depth early is allowed. Names shown to players should come from catalog metadata, not raw IDs.

| Format | Optional lessons | Suggested use |
| --- | --- | --- |
| Futsal: shape and routes | `learnf_shape22`, `f_paralela`, `fmn_f_40` | Alternative support structures after the starter support/combination chapters. |
| Futsal: create an advantage | `expf_2v1`, `expf_thirdplayer`, `expf_switchblock`, `expf_replacepivot`, `expf_trailingoption` | Extend attacker/defender reads, pivot connections, and different arrival depths. |
| Futsal: defend together | `expf_pressreturn`, `expf_diamondshift`, `expf_denypivot`, `expf_delay2v1` | Coordinated pressing, connected shape, denying entries, and outnumbered recovery. |
| Futsal: restarts and keeper | `expf_cornercutback`, `expf_defendcorner`, `expf_kickinthird`, `expf_freekickbalance`, `expf_keeperrelease`, `expf_keeperoverload`, `expf_keeperposition` | Specific restart, legal continuation, and goalkeeper decisions. |
| 7v7: next situations | `next7_reachableforward`, `next7_outsideback`, `next7_dribbleroom`, `next7_shotreaction` | One-forward support, outside width, dribble space, reaction after a shot. |
| 7v7: local rules | `next7_offsideboundary`, `next7_dribblein` | Preserve AYSO and FA labels respectively; never blend these into one universal ruleset. |
| 9v9: formation jobs | `nx9_twoblocks`, `nx9_midfieldhelper`, `nx9_fourthrunner`, `nx9_twobackcover`, `nx9_keeperthird`, `nx9_twostrikers`, `nx9_midfieldjoins` | Compare how different player allocations change who supplies a missing job. |
| 9v9: opponent and restart reads | `next9_spareback`, `next9_frontpairpress`, `next9_frontthreescreen`, `next9_restartreturn`, `next9_singleholder`, `next9_fourtofrontthree`, `next9_backtwoflanks`, `next9_shortcornerbudget` | Extend unit knowledge to opponent shapes, changing numbers, and restart responsibilities. |
| 11v11: progress against a shape | `exp11_checking8`, `exp11_insidefullback` | Locate a spare connector or missing supporting lane. |
| 11v11: protect and reassign | `exp11_safetyfive`, `exp11_diamondjump`, `exp11_wingbackcue`, `exp11_droppingnine`, `exp11_secondball`, `exp11_shortfreekick` | Reassign cover/pressure with different formations, loose balls, and restart jobs. |

Inventory: futsal 12 starter + 19 depth = 31; 7v7 12 + 6 = 18; 9v9 12 + 15 = 27; 11v11 12 + 8 = 20. Total: **48 starter + 48 depth = 96**, with **97 starter + 96 depth = 193 questions**. Full catalogs contain 918 played steps. These are September 16 audit counts; generate UI counts from a versioned definition rather than copying these numbers into components.

## Spacing and useful comparisons

Start with a short coherent chapter. Once the player understands an idea, recommend one previously encountered decision alongside the next lesson. Do not switch among four formats inside every novice lesson. Concrete later comparisons already exist:

| Idea | Existing cross-format comparison |
| --- | --- |
| Clear passing angle | `prn_f_support` → `prn_7_support` → `prn_9_support`; ask which defender blocks the route. |
| Receive under pressure | `bld_f_passtofeet` → `learn7_receive` → `learn9_receive` → `bld_11_throughlines`; ask whether the forward turn remains available. |
| Pressure and cover | `def_f_goalside` → `gap7_lostball` → `learn9_cover` → `def_11_pressurecover`; ask who can approach and who protects. |
| Reach the other side | `expf_switchblock` → `learn9_switch` → `e_switch`; futsal's depth lesson is an optional comparison, not a hidden starter prerequisite. |

The present pilots provide review stages at roughly two and seven days after stage 3. Reuse those optional timings; do not advertise them as an optimal spacing formula for all players. Compute due status when Paths opens or relevant evidence changes. A future full-library review queue should recommend at most one review initially, avoid overdue penalties, and retain previous completion even after an incorrect review.

Two catalog questions often contrast available and blocked routes. That is helpful discrimination practice, but replaying the identical question is not a new transfer task. Existing pilot stages 3 and 5 change tactical cues; stages 4–5 also move the scene and add another actor. Even these are narrow near-transfer evidence, not real-match competence.

## Stories and island games

| Story ID | Suggested attachment | Teaching connection |
| --- | --- | --- |
| `reset` | Futsal, after `learnf_farpost` | Reset after a missed finish before considering defensive responsibility. |
| `empathy` | 7v7, after `prn_7_support` | Make a teammate available and notice teammates who need support. |
| `regulate` | 9v9, after `learn9_restart` | Respond constructively around restarts or disputed decisions. The story is not instruction on a specific law. |
| `grit` | 11v11, after `bld_11_whenlong` | Practice a difficult read with help and appropriate breaks. |
| `loss` | 11v11, after `gap11_runoncue` | Reflect on a finished session and what to revisit. |

Use stable attachment IDs and preserve `fi2-life-paths-v1`. Stories are optional, replayable, and easy to leave; they never interrupt a decision or require a fixed watch duration before a lesson can continue. Their completion indicates story viewing, not demonstrated emotional regulation. Do not autoplay the next story.

Use existing Explore entries as optional invitations after a lesson: visit the relevant field, watch an existing live game and notice a support angle, or play existing arcade/knockout activities to attend to space and timing. `visit-futsal`, `visit-7v7`, `visit-9v9`, `visit-11v11`, `watch-plays`, `try-quizzes`, `play-arcade`, `shoot-target`, and `win-knockout` already exist. The latter games' current mechanics and completion remain unchanged. They are thematic practice opportunities, not validated measures of the lesson's team tactics. Ball Hunt's existing clues/teaching cards can point back to the same optional pilot concepts; collecting a ball must not award an unattempted format quiz or watched-play flag.

## Completion and mastery contracts

**Lesson complete:** all canonical played-step evidence plus a saved correct answer for every canonical question. Help and retries are allowed. Correctness accumulates across visits. Watched evidence must come from active completed playback, not seeking, card opening, or reaching a final UI screen. Finishing the quiz without watching leaves Watch play unfinished; watching without correct answers leaves Try quiz unfinished.

**Starter Path complete:** all twelve required IDs under a frozen curriculum version meet that lesson criterion. The card should say “Starter lessons 8/12,” with depth progress secondary. **Starter island journey complete:** all four Starter Paths complete. Stories, Ball Hunt, Explore, depth, pilots, delayed reviews, and future challenges do not gate it. Preserve earned milestones through additions to the library.

**Evidence of application/retention:** preserve existing pilot `Introduced`, `Practicing`, `Applied`, and `Remembered` statuses for their three concepts only. `learningStatus` requires first-attempt correct responses without recorded assistance on at least two variants for Applied, and a qualifying later review for Remembered. `isJourneyComplete` merely checks stages 0–3; it is not equivalent to either status. Also, production progress differs from development Paths preview, which must not award real evidence.

The normal quiz store retains correct keys, not the complete first-response/assistance history needed for stronger mastery claims. Do not derive “independent,” “remembered,” percentage skill proficiency, or a format-wide mastery star from that store. The smallest release needs honest completion labels, not a new assessment engine. If future challenges measure new situations, author and validate their evidence model separately.

## Small first release and runtime costs

1. Adopt a versioned definition containing the explicit core/depth IDs and story attachments above. Generate compact titles/counts from catalogs; assert complete/disjoint coverage. Leave catalog animations, quizzes, local-rule wording, actor counts, and game mechanics intact.
2. Connect four format cards and one Continue action to the existing FieldLearning session, saved cursor, and return-to-path context. Read the existing watched/quiz stores and retain all previously earned evidence. Ordinary field learning and Paths must count the same canonical evidence.
3. Show chapter groups, correct incomplete state, retry/replay, and optional depth. Keep the three pilot launch points reachable without generalizing their synthetic lesson IDs into canonical format progress.
4. Place the five existing stories. Show the existing ferry's future status and static “Challenges coming later.” No future-island travel selector, background asset fetch, or challenge completion counter.
5. Defer generalized spaced-review scheduling, new variations, new tests, and automatic explanation grading. Manual replay plus existing pilot reviews is enough for the first release.

Keep the overview on compact metadata; load only the chosen format with the existing promise-cached `loadCatalog`. Story code/art loads only when opened. Reuse the existing renderer, voice ownership, transcript, and quiz replay. Progress derives on evidence events or modal open; subscribe only while relevant UI is mounted. Add no polling, RAF, background timers, animated preview cards, concurrent video players, or progress loops. Preserve the normal menu's world pause, hidden-content suspension, and bounded story choreography. These choices bound additional work; they do not establish lower iPhone temperature.

## Validation before implementation is considered finished

Catalog validation must prove 96 distinct canonical IDs, 48 core/48 depth with no omissions/duplicates, four twelve-lesson cores, 193 total questions, valid story anchors, and valid pilot references. Counts must fail visibly if content changes rather than silently shortening a path.

Exercise fresh, partially watched, quiz-only, wrong-answer, retry, existing complete, pilot-only, and completed-story saves. Confirm that wrong final answers do not complete a lesson; assistance does not prevent completion; existing progress survives; optional content never changes graduation. Check cross-tab merging, storage failure, cursor bounds, Back/Escape, return focus, small screens, and no forced restart of onboarding.

Learning evaluation is separate from UI verification: observe a few novice and returning players completing one lesson and explaining the relevant cue; check whether they can use it in a changed existing scene on a later visit. Record actual session time, confusion, help use, and abandonment qualitatively before building analytics. A real-pitch transfer claim would require observing representative football decisions and comparison evidence outside the app. Desktop browser tests cannot establish that outcome or phone cooling.

Documentation validation performed: read current project instructions, performance/journey notes, all four catalogs' IDs/concepts/questions, learning journeys/variants/progression, FieldLearning controls, current Paths/story mapping, Explore and Ball Hunt definitions; verified catalog counts. No application tests/build/deployment were run because this is a research/design-only change.
