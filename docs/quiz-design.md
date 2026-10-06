# Quiz design: longer, visual lesson quizzes

Status (24 Sep 2026): the engine is built, and futsal is the pilot. Everything is local only: nothing is committed or deployed.

**What the user asked for:**
- "make the quizzes longer for each question. make it harder to get the card. must answer 5 questions per quiz to get the card."
- "more research into building the right quizzes to reinforce learning. Also building the right type, so visual quizzes."

## 1. What the research says, and what we do about it

| Principle | Evidence | What we do |
|---|---|---|
| **Retrieval practice**: recalling something strengthens memory more than seeing it again. | Dunlosky et al. (2013) reviewed 10 study techniques and rated practice testing and distributed practice the two most effective, "regardless of age". [AFT summary](https://www.aft.org/ae/fall2013/dunlosky); [testing effect](https://en.wikipedia.org/wiki/Testing_effect); [retrievalpractice.org](https://www.retrievalpractice.org/why-it-works) | Every question asks the child to pull out something **the lesson just showed**, such as a role, a space, a pass or a sequence. There is no trivia. Questions come straight after the film, so they test fresh learning. |
| **Feedback that explains**: feedback turns a wrong guess into learning. | Feedback strengthens the benefit of testing. With multiple choice, it also stops the wrong options (lures) from being learned (Butler & Roediger 2008, *Memory & Cognition* 36:604, cited in the testing-effect article). Feedback works best when it explains *why* (Hattie & Timperley 2007; Shute 2008; cited from knowledge, not fetched). | Every option has its own one-line **why**, shown on screen and voiced by the coach. A wrong pick explains that pick specifically, then the child tries again. |
| **Desirable difficulty**: effortful recall sticks, but too hard stops learning. | Bjork (1994). "Too difficult a task may dissuade the learner", and the challenge-point framework looks for the optimal level of challenge. [Desirable difficulty](https://en.wikipedia.org/wiki/Desirable_difficulty) | A 5-question difficulty curve (below). Distractors are real mistakes, never silly options. Retries are kind: a wrong pick never shows the right answer, so the second try is still real thinking. Nothing is timed. |
| **Interleaving and variation** | Mixing problem types in one session helps children tell ideas apart ([varied practice](https://en.wikipedia.org/wiki/Varied_practice); Dunlosky 2013). | Each quiz mixes at least 2 visual question types. The last question moves the idea into a **new picture** (another player, the other side or a changed defender). |
| **Spacing** | Spaced review beats cramming ([spacing effect](https://en.wikipedia.org/wiki/Spacing_effect)). | The Learning Journeys already hold spaced stages (2 and 5 days). A quiz can be replayed, and progress keeps the questions a child got right. A spaced "review quiz" that pulls earlier lessons' questions is a follow-up; the schema supports it because questions don't depend on the film being open. |
| **Reading level by age** | Children's reading grows fast from 7 to 12, so we write for the youngest reader in each format. | See the reading-level table in section 5. Every line is also spoken aloud. |
| **Visual and spatial questions for tactics** | Football decisions are perceptual: *where* the space is, *which* lane is open. Video- and picture-based decision training is a standard way to train perceptual-cognitive skills in youth sport (Larkin et al. 2015 review; cited from knowledge). Children aged 3–12 handle tapping and swiping easily. NN/g recommends **touch targets of at least 2 cm × 2 cm for young children**, and letting kids **either drag or tap the destination**. [NN/g](https://www.nngroup.com/articles/children-ux-physical-development/) | Most questions are answered **on a picture of the pitch**. Targets are at least 48 px. Drag-to-position always accepts a tap on the space too. Every picture has a spoken description for screen readers. |

Pages fetched: 8, one at a time with pauses. The Hattie & Timperley, Shute and Larkin references were not fetched.

### Difficulty curve (5+ questions)

1. **Q1–Q2** are the lesson's original on-pitch decisions. They reuse the moment the child just watched.
2. **Q3** is recall: a role, a space or a rule. Types: tap the spot, or true/false with a picture.
3. **Q4** is understanding: why it works, or what comes next. Types: order the steps, what happens next, or pick the picture.
4. **Q5** is transfer: the same idea in a changed picture. Types: best pass, or drag to position.

Keep the correct answer's position varied (A, B or C), with no pattern. Use 2–3 options for Beginner lessons and 3–4 for Advanced lessons.

## 2. Card rule

- A quiz earns a card only if it has **at least 5 questions** (`MIN_CARD_QUIZ_QUESTIONS`) and **every question is answered correctly**.
- **Every question must be right on the first try** in one run (`CARD_QUIZ_FIRST_TRY=true`, the user's decision on Sep 24 2026). A wrong answer still shows its "why" and the child retries to finish the quiz, but that run doesn't pay. The child replays the quiz to earn the card, and answers from earlier visits don't count.
- The last question's feedback shows "Quiz done: 5 of 5 correct, N right first time." This gives the child a reason to replay without taking anything away.

There is one rule, in one place, in `lib/town/quizProgress.ts`:

```ts
export const MIN_CARD_QUIZ_QUESTIONS=5;
export const CARD_QUIZ_FIRST_TRY=true;
export function quizCardEligible(questions:number,allCorrect:boolean):boolean;
export type QuizRun={lessonId:string;correct:Set<number>;firstTry:Set<number>;tried:Set<number>};
export function newQuizRun(lessonId:string):QuizRun;
export function recordRunAnswer(run:QuizRun,index:number,correct:boolean):void;
export function quizRunAllCorrect(questions:number,run:Pick<QuizRun,'correct'|'firstTry'>):boolean;
export function quizRunCardAnswers(lessonId:string,questions:number,run:QuizRun):Set<number>;
```

The rule is used in two places:
- `cardRewardTriggers.quizEligibleForCard(questions, allCorrect)` delegates to `quizCardEligible`.
- `FieldLearning.nextQuestion` calls `earnForQuiz(lesson, quizRunCardAnswers(lessonId, n, run))` at the end of the quiz. `quizRunCardAnswers` returns the run's correct answers (or nothing if `CARD_QUIZ_FIRST_TRY` is on and a retry was needed).
- `earnForQuiz` counts questions answered correctly on an earlier visit only when `CARD_QUIZ_FIRST_TRY` is off, so with it on a clean run is really required.

Lessons with fewer than 5 questions, such as Journey stage lessons, keep working as before but never pay a card.

### Resumed quizzes and feedback (30 Sep 2026, game-audit G-04/G-05/G-06/G-21)

- **The card rule is unchanged.** It is still the user's Sep 24 rule: 5+ questions, every one right first time, in one run.
- **"One run" now survives a pause:**
  - `lib/town/quizRunStore.ts` saves each lesson's first-try answers as they happen, in `fi2-quiz-runs-v1` (one small entry per unfinished quiz, at most 24).
  - A resumed quiz (a reload, "Save and return to Paths") loads that run, so a clean 5/5 still earns its card.
  - "Quiz yourself" (a fresh start) clears the run, and so does paying out at the end.
  - A retry before the pause is remembered, so the run still doesn't count as first-try.
  - Browser check: futsal "3-1: Meet the Court Roles", Q1 answered, page reloaded, resumed at Q2 → "5 of 5 right first time. Perfect!" and a card offer.
- **Rewarding completion, considered.** Completion already pays: 12 learning coins on the first pass (+6 for a perfect first-try run), per `docs/economy/ECONOMY_UPDATE_2026-09-29.md`, plus progress on the path. The card stays the perfect-run reward, as the user decided, so the economy doc's card pacing (about 60% of quizzes earn a pick) is unchanged.
- **The last line is positive:**
  - "Quiz done: all 5 answered! 3 of 5 right first time. Replay it any time and get all 5 first time to earn a card."
  - Or "… Perfect!" (`quizDoneLine`).
- **Full explanations:**
  - Route and space questions used to show only the first sentence, which cut the "why".
  - `lib/town/quizFeedback.ts` shows the whole `explain` or `choiceExplanations` text. The quiz card already scrolls on short phones.
  - It also strips a leading "Yes." / "Right," / "Correct!" so the prefix never doubles ("Correct. Right, it's false." → "Correct. It's false.").
- **Framing on phones:**
  - `lib/town/learningView.ts` reserves the quiz card's real height plus 40 px (`quizCardInset`), read only when the camera key changes, never per frame.
  - The top reserve is the Back row (100 px).
  - At 390×844 the futsal Q2 route "2" used to sit under the card. It is now above it (`scratchpad/game-fixes/lane1/mobile-06-quiz-q2-resumed-framing.png`).

## 3. Question types (engine: `components/VisualQuestion.tsx`, `lib/town/visualQuiz.ts`)

Every type draws on a static SVG mini pitch, taken from the lesson's own positions at a step. Gold attacks up. Every type resolves to **one option index**, so `options`, `correct`, `choiceExplanations`, voice, progress keys and the transcript all work unchanged.

| `kind` | The child… | Keyboard / screen reader |
|---|---|---|
| `tapSpot` | taps where a player should be or move (circles A–C) | Tab to a circle, then Enter or Space. Each circle is labelled "A: …". |
| `bestPass` | taps one of 2–4 pass arrows from the ball carrier | The arrows are focusable buttons. |
| `pickPicture` | picks the correct diagram from 2–4 small pitches | The pictures are real buttons with captions. |
| `dragToZone` | drags a player dot into a zone, **or taps the zone** | The zones are buttons: "Move the FIXO to space A". |
| `whatNext` | studies a freeze-frame (with dashed trails showing where players came from), then picks what happens next, as text or pictures | Buttons. |
| `trueFalse` | reads a statement about the picture, then taps True ✓ or False ✗ | Buttons. |
| `order` | drags 3–5 step cards into the order they happen (shown shuffled), then taps "Check order" | Each card also has up/down buttons and arrow-key moves on its grip; live "Moved … to place 2 of 4" status. |

**Feedback:**
- Only the child's own pick is coloured: green if right, coral if wrong.
- The coach voices that pick's "why", and "Try again" clears the board.
- A wrong order flags only the card in the first wrong place and shows why it isn't there; "Try again" keeps the arrangement so the child fixes it. Every step must follow from the one before (cause → effect), so only one order makes sense: no step that could fit two places, no vague "read it again" steps.
- After a correct answer, the 3D pitch lights the `feedback.highlight` actors. If `outcomeStep` is set, the child can also tap "Show me" to watch the outcome.

**Heat and motion:**
- Nothing animates at rest: no requestAnimationFrame, timers or polling.
- A ResizeObserver measures the board once and again on resize, to keep hit areas at least 48 px.
- Dragging re-renders only while the finger moves.
- Hover lifts are dropped under `prefers-reduced-motion`.

## 4. Schema (added to a lesson question in `public/lessons/<format>.json`)

A question has either `interact` (the original 3D pitch tap) or `visual` (new). Everything else is the existing `FieldQuestion`.

```jsonc
{
  "q": "Now the right ala has the ball, and a defender blocks the pivot. Which pass keeps the ball safe?",
  "options": ["Pass to the pivot ahead", "Pass back to the fixo", "Long pass across to the left ala"], // 2–4 (order: 2–5)
  "correct": 1,                          // order questions: always 0 (options are written in the correct order)
  "explain": "Yes. The fixo is behind the ball with a clear lane, so we keep the ball and try again.",
  "choiceExplanations": ["…why A is wrong…", "<same text as explain>", "…why C is wrong…"],
  "visual": {
    "kind": "bestPass",
    "frame": {                           // a freeze-frame of THIS lesson
      "step": 12,                        // lesson step (poses at the END of the step unless "progress": 0–1)
      "place": {"drm": {"x": 182, "y": 192}},  // optional what-if moves (actor id → point)
      "ball": "rm",                      // optional: an actor id (ball at their feet) or a point
      "hide": ["cb"],                    // optional: actors left out (e.g. "where does the fixo play?")
      "focus": ["rm"],                   // gold ring + name chip; also lit on the 3D pitch after answering
      "marks": [{"kind": "run", "from": "st", "to": {"x": 150, "y": 90}, "tone": "gold"}], // pass|run|dribble|zone|spot|label|cross
      "trails": false,                   // dashed "came from" trails (whatNext turns them on)
      "view": {"x": 0, "y": 80, "w": 270, "h": 240}, // optional crop; auto-crop otherwise
      "alt": "…"                         // optional screen-reader description (auto otherwise)
    },
    "from": "rm", "to": ["st", "cb", "lm"]   // bestPass: passer and one target per option (id or point)
    // tapSpot:    "spots": [{"x":135,"y":305,"r":16}, …]          one per option (r optional)
    // dragToZone: "drag": "cb", "zones": [{"x":135,"y":300,"w":70,"h":50}, …]
    // pickPicture:"pictures": [frame, frame, …]                   one per option; no "frame"
    // whatNext:   "frame" + optional "pictures" (else the options are text)
    // trueFalse:  "frame"; options must be ["True","False"]
    // order:      optional "frames": [frame, …] aligned with options
  }
  // added by the merge script: step, outcomeStep (null unless authored), voice, explainVoice, choiceVoices, feedback
}
```

**Coordinates:**
- Positions use the lesson's 270 × 400 space: x runs across the pitch and y runs down it.
- **Gold attacks toward y = 0.** The opponent's goal is at the top of the mini pitch, and ours is at y ≈ 400.
- Actor ids are the lesson's own `offense` (gold) and `defense` (blue) ids.

## 5. Authoring guide (for 7v7, 9v9 and 11v11 agents)

**Workflow (one agent per lesson file; never edit the catalog by hand):**

1. `node scripts/quiz/dump-lesson.cjs <format> <lessonId>` prints each step's line, every actor's position at the end of each step, and the existing questions.
2. Write `scripts/quiz/authored/<format>/<lessonId>.json` as `{"lesson":"<id>","questions":[…]}`. It holds only the **new** visual questions: enough to reach at least 5 in total, with at least 2 different `kind`s.
3. `node scripts/quiz/check-authored.cjs <format> [lessonId…]` validates the file in memory against the catalog, the schema, the word limits and the geometry lint. It writes nothing.
4. The lead merges and voices once for the whole format:
   - `python3 scripts/quiz/merge-visual-questions.py <format>` appends the questions, wires the voice slots and updates `quizManifest.json` and `formatPaths.json`;
   - then `<kokoro venv python> scripts/plays/kokoro-lessons.py <printed hashes>` voices all four coaches at matched volume and refreshes durations;
   - then run `node tests/visual-quiz.cjs` and add the format to `PILOT` in that test.

   Parallel agents must not run the merge or the voicing script, because both rewrite shared files.

**Content rules:**
- **Retrieval, not trivia.** Every question checks something a step's line said or showed. Name the step in your head: "S5 said the pivot gives depth ahead".
- **One idea per question.** The correct option must be clearly best *in the picture*, and the picture must contain the evidence (a blocked lane, a free space).
- **Distractors are real mistakes** kids make: ball-watching, passing into a covered lane, everyone chasing, standing flat, going too early.
- **Every "why" is one short sentence (a second is optional), spoken by a coach.** Start the correct one with "Yes." or "Right." and wrong ones with the football reason, not "Wrong". The whole "why" shows on screen after "Correct." or "Look again." (a leading "Yes."/"Right." is dropped there, but still spoken).
- **`explain` must equal `choiceExplanations[correct]`.**
- **Picture hygiene:**
  - Keep spots and zones clear of players (the lint warns within 14 units), and more than 30 units apart.
  - `focus` only the 1–3 actors that matter.
  - A picture question must not be answerable from the option text alone. In `pickPicture`, captions describe the picture neutrally ("Fixo stays back", "Fixo runs forward").
- **Transfer question last:** use `place` to change one thing (the defender moves, the other side, a different carrier) and ask the same idea.
- **Order:** 3–4 steps, each at most 7 words, from the lesson's own sequence.
- **Voice:** avoid symbols and abbreviations the coach can't say. Role names in capitals (FIXO, ALA, PIVOT) are fine because the lexicon handles them.

**Reading level (Flesch-Kincaid grade; all lines are also spoken):**

| Format | Ages | Question | Why line | Words |
|---|---|---|---|---|
| **7v7** | 7–9 | ≤ 12 words, one idea, present tense, "you/your team" | ≤ 14 words; one reason ("so…", "because…") | Everyday words: space, open, close, behind, help, safe. No jargon: "the defender between you and the goal", not "goal-side". |
| **9v9** | 9–11 | ≤ 16 words | ≤ 18 words | Name ideas the lesson taught (support angle, switch, cover, 2v1) with a short gloss the first time. |
| **futsal** | 8–12 | ≤ 16 words | ≤ 18 words | Role names from the lesson (fixo, ala, pivot, goalkeeper); explain them in the "why". |
| **11v11** | 11–12+ | ≤ 20 words | ≤ 22 words | Tactical vocabulary (half-space, overload, press trigger, rest defence) is fine, but the "why" must show the cause and effect on the pitch. |

The test also caps any line at 34 words.

## 6. Plan for 7v7, 9v9 and 11v11

| Format | Lessons | Current questions | New visual questions needed | Suggested split |
|---|---|---|---|---|
| 7v7 | 18 | 2 each (36) | 3 each = **54** | 3 agents × 6 lessons |
| 9v9 | 27 | 2 each (54) | 3 each = **81** | 4 agents × 6–7 lessons |
| 11v11 | 20 | 2 each (40) | 3 each = **60** | 3 agents × 6–7 lessons |

- **Effort:** about 25–35 minutes of agent time per lesson (dump, author, check, fix the lint). The futsal pilot took one lead plus 5 authoring agents for 30 lessons.
- **Voicing** is about 1 s per line per coach on this Mac. Each question has about 4.5 lines, so each format takes about 5–8 minutes of Kokoro time.
- **After each format:** merge, voice, add the format to `PILOT` in `tests/visual-quiz.cjs`, then run the lesson tests.

## 7. Files

- **Engine:**
  - `lib/town/visualQuiz.ts`: types, poses, crop, descriptions, validation;
  - `components/VisualQuestion.tsx` and `.module.css`;
  - FieldLearning renders the engine when `q.visual` is present and passes the run to the card rule.
- **Rule:** `lib/town/quizProgress.ts` (see section 2).
- **Authoring:** `scripts/quiz/dump-lesson.cjs`, `scripts/quiz/check-authored.cjs`, `scripts/quiz/merge-visual-questions.py` and `scripts/quiz/authored/<format>/*.json` (the source of truth for visual questions).
- **Voice:** `scripts/plays/kokoro-lessons.py`, which now also voices `choiceExplanations` for visual questions.
- **Tests:**
  - `tests/visual-quiz.cjs` covers the schema, voice, card length, 2+ types per quiz and the card rule;
  - the existing lesson tests skip `interact`-only checks for visual questions.

## Oct 4 2026 learning pass (A5): content audit, "Watch that part", pending voice

- **Content audit** of all 96 lessons / 918 steps / 486 questions against US Youth Soccer, FA and IFAB (Laws 11, 12, 13, 15, 16; Futsal Laws 12, 15, 16). Fixes: off-concept questions (skill-name trivia such as "Cruyff turn" replaced by the lesson's own idea), rule wording (offside is a pass to an offside position, not standing there; futsal goalkeeper back-pass; 10-yard free-kick distance; goal kick from the goal area), choreography that contradicted its line (9v9 runner "behind our midfield", 11v11 cut-back moved into the box), plain-language lesson goals instead of internal notes ("AYSO rule example, checked…").
- **Wrong answer → lesson moment.** A wrong answer shows **Watch that part** next to Try again: it replays the step the question's picture comes from (and the one before; pitch-tap questions stop before their outcome, which stays on "Show me"), then returns to the same question. The warm-up's wrong answers open the lesson at that step (`openPathLesson(key, q.step)`).
- **Lofted balls.** A step's `ballPathType` of `air`, `lofted`, `cross`, `chip` or `clearance` now arcs in lesson playback (`LOFTED_PATHS` / `loftPeak` in `lib/town/formatLessons.ts`); `ground` / `through` stay on the grass.
- **Pending voice.** A changed narrated line points at its new hash with `duration: 0` and is listed in `scripts/quiz/revoice-pending.json`; the lesson shows the text instead of playing it. Voice them with `<python with kokoro> scripts/plays/kokoro-lessons.py <hashes>` and remove them from the list. Until then `tests/lesson-catalog.cjs` and `tests/visual-quiz.cjs` pass only with `--structure-only`.
- **Test:** `tests/learning-content.cjs` (in `npm test`) checks every question against its lesson, answer indices, a why per option, pitch options, authored-file sync, Paths/manifest counts, voice-to-text hashes, format rules and kid copy.
