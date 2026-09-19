# Learning football through quests and Passport

## Recommendation

Make **reading the game the game**. A child should return to Futbol Island because they can help a teammate solve a new football problem, see their decision change the play, and discover that they can recognize a pattern they previously missed. Quests should deliver that experience. Passport should preserve the evidence and suggest a useful next challenge.

The strongest next investment is a connected sequence of existing plays and quizzes: **watch → predict → act → see why → try a changed situation → revisit later**. Club stories, current stars, historic players, animal characters, and equipment can make that sequence personal. They should lead into football decisions and celebrate learning, while remaining distinct from proof of tactical understanding.

Start with three concept journeys—support angles, width and timing, and movement off the ball—using the existing Barcelona, Arsenal, and Bayern material. Connect each to the full teaching renderer and several genuinely different quiz situations. Test whether children understand and remember the concepts before expanding the collection economy or all 23 club journeys.

The proposed audience is children approximately **8–12**, with adjustable support for reading level and football experience. Exact session lengths, promotion thresholds, and review intervals below are product hypotheses to test, not scientifically established prescriptions for this app. Sources and product examples were checked on 14 September 2026. No cited study evaluates Futbol Island itself.

## Current product and the main opportunity

Futbol Island already has substantial teaching content: 96 lessons, 918 steps, and 193 quizzes across futsal, 7v7, 9v9, and 11v11. Its animations can show spaces, passing connections, movement, changes of direction, and consequences. Pause, replay, explanations after mistakes, demonstrations without credit, and retries provide a useful foundation. This is a better starting point than adding another disconnected minigame.

The current quest system has eight milestones. It records pitch visits, equipment use, completed lesson steps, and distinct correct quiz IDs. These establish participation and some successful answers, but cannot distinguish an independent decision from a correct retry after the answer was demonstrated. Its learning buttons return to the general lesson catalog rather than a specific next concept.

Passport currently combines a club story, two player questions, and a separate animated pitch challenge into a four-part journey. The six player questions already ask about football decisions—support angles, overlaps, offside timing, dropping short, and escaping a marker. They are not merely celebrity trivia. However, these journeys are not connected to the full field lessons, and their completion flags cannot show retention, assistance, or transfer to another situation.

| Existing element | Preserve | Improve next |
|---|---|---|
| Full plays and quizzes | Authored football scenes and visual explanations | Add concept tags, prerequisites, alternate situations, and direct quest entry points |
| Wrong-answer replay | Safe mistakes and explanations | Distinguish practice with help from a later independent check |
| Quests | Clear goals and resumable progress | Replace generic quantity goals with meaningful football problems |
| Passport | Persistent personal record and club/player context | Separate completed stories from demonstrated concepts |
| Store and animal costumes | Choice, identity, original island fiction | Link celebrations to named learning; keep equipment accessible |
| Island exploration and NPCs | A place worth exploring | Let an NPC introduce a football problem and remember its resolution |

These observations derive from the local implementation, particularly `lib/town/questModel.ts`, `lib/town/passport.ts`, `lib/town/passportProgress.ts`, the quiz progress model, and the existing Passport plan. Existing achievements should remain earned. Historical completion data must not be silently relabeled as evidence of mastery.

## Learning evidence and its limits

### Retrieval and support for younger learners

Retrieval practice means reconstructing an answer instead of only seeing it again. In an adult science-learning experiment, retrieval improved comprehension and inference performance relative to elaborative study with concept mapping. This supports making the child predict the next football decision, rather than repeatedly watching the solution.[^1]

Age changes the design. Karpicke and colleagues studied children aged 9–11 and found that tasks with little support, including free recall of educational text, were difficult and ineffective in the initial experiment. Structured question maps made retrieval more feasible; a later experiment found an advantage over restudy on subsequent recall. These were classroom text activities, not animated sports instruction.[^2]

**Design implication:** begin with a short scene, a concrete question, and visible alternatives. Let a novice tap the space that helps the ball carrier. Do not require a written tactical explanation from a blank page. Gradually remove answer-revealing arrows as the child succeeds, while preserving access to a hint. A child who needs help should receive another teaching opportunity, not lose lives or equipment.

### Spacing and revisiting

Cepeda and colleagues studied fact learning in more than 1,350 participants, with study gaps and final tests extending over substantial intervals. The best spacing depended on how long the information needed to be retained; there was no universally optimal gap.[^3] This supports returning to concepts over time, but does not validate a specific “1, 3, 7 day” football schedule.

**Design implication:** after initial success, put a changed support-angle situation in a future session. Try a review after roughly 1–3 days, another around a week, and later reviews based on performance. These are pilot defaults. If the child returns two weeks later, present a welcoming recap and one manageable review. Keep earned stamps; a missed day is not a failure. Allow continued learning immediately rather than making a timer a prerequisite.

### Worked examples and gradually reduced help

Atkinson, Renkl, and Merrill examined transitions from worked examples to independent problem solving. Their work distinguishes near transfer from more distant transfer: fading steps alone was not a reliable route to far transfer, and the experiments investigated explanatory prompts alongside fading.[^4] A separate game-based mathematics study with 12–15-year-old prevocational students examined embedded faded worked examples, showing that this technique has been studied inside games as well as conventional instruction.[^5]

**Design implication:** show a complete give-and-go, then let the child finish its last movement, then ask them to choose the entire support run. Once that is familiar, change the defender's behavior. The final task should require reading the new situation, not copying the remembered arrow. Experienced children can begin with a quick diagnostic and skip already understood explanations.

### Visual signaling, segmentation, and cognitive load

Mautone and Mayer's experiments tested signals that directed learners toward the organization of a multimedia science explanation.[^6] Mayer and Chandler found that learner-paced segments improved transfer, but not retention, in two narrated-animation experiments.[^7] Mayer and Moreno's broader framework explains why competing visual and verbal demands can exceed available processing capacity.[^8] These studies provide design principles, not a rule that more arrows or more animation always produces more learning.

**Design implication:** every motion should answer a football question. A single step can contain several connected beats: defender closes, support player changes direction, passing lane opens, ball travels. Reveal those relationships in order. Avoid moving every player, flashing all zones, scrolling text, and playing a celebration simultaneously. Keep the relevant players and destination visible above the controls on small screens.

Use a stable visual vocabulary: one line style for a pass, another for a run, a distinct treatment for defensive pressure, and a shaded region for usable space. Explain these symbols once and reinforce them briefly in context. Provide pause, replay, a scrub or step control, captions, optional narration, and a still-frame alternative. Color should reinforce meaning alongside shapes and labels.

### Explanatory feedback and transfer

In two multimedia studies, Moreno found better transfer with explanatory feedback than with feedback that merely corrected the answer; interest and motivation ratings were comparable.[^9] Butler's four experiments found that repeated testing supported later answers to new inference questions as well as retention of studied material. Those adult prose-learning results do not establish transfer to physical sport.[^10]

**Design implication:** explain a wrong pass through the football consequence. Animate the defender intercepting or closing the lane, then show the alternative and why it changes the outcome. Ask for a new decision afterwards. An immediate correct retry remains valuable practice, but should not alone certify independent understanding.

Avoid treating one chosen play as the only conceivable good football action. Author the scene so that its objective and constraints support the expected answer. Where two responses are defensible, accept both with different explanations or narrow the question. Use wording such as “Which option keeps possession here?” rather than “What should you always do?”

### Gamification and motivation

Habgood and Ainsworth compared versions of a mathematics game for children aged 7–11. In one study, integrating the learning into the core game improved learning within a fixed time. A second, much smaller free-choice study found more time spent with the integrated version. The result is unusually relevant to the proposed age group, but is one game and one subject, not a universal retention forecast.[^11]

A serious-games meta-analysis reported advantages for learning and retention, while its motivation advantage was not statistically significant.[^12] Sailer and Homner's gamification meta-analysis found positive average cognitive, motivational, and behavioral effects. In the more rigorous subset, cognitive effects remained significant but motivation and behavior estimates were not significant. Outcomes varied substantially between studies.[^13]

Negative findings matter. Hanus and Fox's 16-week study of 71 university students associated a badge-and-leaderboard course with declining motivation and poorer final performance; its course comparison cannot establish that all badges are harmful.[^14] A randomized higher-education badge study also found less effect on motivation and performance than commonly assumed.[^15]

Reward research is contested. Deci, Koestner, and Ryan found risks from several kinds of expected tangible rewards, whereas Cameron, Banko, and Pierce disputed the breadth of those negative conclusions and emphasized reward conditions.[^16][^17] Neither justifies removing every celebration or assuming every collectible motivates learning. Research on game motivation also links perceived autonomy and competence with enjoyment, but much of this evidence is outside the target child population.[^18]

**Design judgment:** make the pleasurable action itself a football decision. Offer meaningful choice, visible improvement, friendly characters, and satisfying consequences. Use stamps as informative records of what a child did. Do not make the main loop “answer a question to earn fuel for unrelated driving,” or rank children by hours spent. Optional cooperative challenges can be tested later; public leaderboards and lost streaks are unnecessary for the pilot.

### Football evidence and real-world transfer

A small quasi-experimental study followed 18 boys averaging 10.7 years through a questioning-based football program involving modified games. After the intervention, the experimental group showed advantages in some passing and dribbling decisions and passing execution. Its small sample and combination of on-pitch activities and questioning prevent isolating a screen-only effect.[^19]

Nimmerichter and colleagues randomly assigned 34 academy players averaging 14.4 years to additional video training or control. After six weeks, the study reported improved video decision performance and reactive agility in the training group. The authors explicitly said actual or simulated match performance remained to be established.[^20]

A football video-training review found generally encouraging decision outcomes but only two studies with retention tests and one with a match-related transfer test among ten included studies.[^21] A youth team-sport meta-analysis found tactical benefits but no significant between-group technical-execution difference, with methodological heterogeneity and bias limitations.[^22]

**Product boundary:** Futbol Island can aim to improve recognizing spaces, anticipating moves, and explaining decisions. It cannot currently claim that a stamp demonstrates better passing technique or match performance. An optional coach-led small-sided activity is a bridge worth evaluating. FIFA's published 8–12 “Find the gap” session similarly connects finding space, questioning, and game application; it is coaching guidance, not an app efficacy trial.[^23]

## The proposed quest and Passport structure

### One learning record, several natural entrances

Keep Passport in its existing visible location and Settings entry. Make **My game** its default page, followed by **Football stories**. Quests becomes the action list that feeds the same record. An NPC, a player card, a pitch entrance, or a store item can start a quest, but all should open the same authored teaching sequence and save to the same concept history.

My game shows a small set of understandable capabilities: “Find a passing lane,” “Help the player with the ball,” “Create width,” “Time a run,” and “Protect dangerous space.” Each card answers three questions: what the child can do, what evidence is saved, and what to try next. Avoid a single football IQ score or unsupported “pro player” level.

Football stories holds club culture, real mascot history, and player learning cards. Original island characters remain clearly identified as fiction. A club story can be complete even when its related football concept still needs practice. A concept can be learned without memorizing the club's founding year or choosing that club's character.

A quest detail view should contain a short situation, one football objective, the next playable step, and visible progress. For example: “Cove's team keeps losing the return pass. Help a teammate find a new angle.” Its main button is **Try the play**. Completing the full field activity returns the player to the quest result, not the general catalog. Keep modal dimensions stable, matching the established UI.

### A six-part episode

The following is an authored example and proposed interaction sequence, not a measured optimal schedule.

| Part | Child's experience | Teaching purpose | Saved evidence |
|---|---|---|---|
| Situation | NPC shows a teammate trapped behind a defender | Give the concept a clear purpose | Quest started, concept |
| See it | Watch a short play with two or three connected beats | Build an initial model | Example exposure |
| Predict it | Choose a return-run destination before movement starts | Retrieve the relationship | First response, assistance |
| See why | Their choice plays out; a comparison is available | Connect decision and consequence | Feedback/demo exposure |
| Change it | Defender closes a different lane; choose again | Check adaptation | New variant response |
| Return to it | A later session offers another short scene | Check retention | Delayed independent response |

Aim initially for episodes around 4–7 minutes with an early decision, and a later review lasting roughly a minute. Measure actual completion and fatigue; the app should always allow stopping and resuming. A short successful episode is preferable to making children remain online to finish a quota.

Narrative should change because of football understanding. When the child creates width, the NPC team demonstrates a new outside option in its closing scene. On return, the team faces a different press. The narrative continues because the football problem develops, not because a character invents arbitrary errands.

### Honest progress states

Use friendly descriptions backed by explicit evidence. Avoid claiming certainty from a handful of multiple-choice answers.

| State | Example child-facing copy | Proposed evidence rule |
|---|---|---|
| Introduced | “You've seen how a new angle helps.” | Example or lesson viewed |
| Practicing | “You found the lane with help.” | Guided decision completed |
| Applied | “You found it in two different plays.” | Independent success on two distinct authored variants |
| Remembered | “You spotted it again later.” | Independent success on a delayed, previously unseen variant |
| Next challenge | “Try it when the defender stays back.” | A new context is available; prior achievement remains |

These are starting rules to validate, not a psychometric mastery standard. An answer after a hint or demonstration remains practice evidence. Do not overwrite the first response when the child retries. If a later check is wrong, show “Let's practice this part” and route to the relevant beat. Keep historical achievements while updating the recommended support.

A stamped page should show the evidence: “Support angles — two different plays completed; revisited later.” Offer a tiny replay of the child's solved scene. This makes the collectible meaningful and creates a useful way to revisit learning.

### Age and experience adaptations

For an 8–9-year-old novice, begin with a few relevant players, one short spoken or written prompt, large choice targets, and a complete example. Explain terms through the scene: “Move where your teammate can pass to you” before introducing “support angle.” For a more experienced 10–12-year-old, offer a diagnostic, additional opponents, a choice of role, and a new perspective or pressure pattern. These are proposed support settings, not fixed developmental boundaries.

Let a child request more help without changing their displayed age or receiving a lower-status identity. A strong reader can still be a football beginner, and an experienced player can need simpler text. Match challenge to observed decisions and comprehension; never infer ability from reading speed alone. Keep narration optional, captions available, and controls usable without precise dragging.

## Visual play and quiz design

### Teach a causal chain, then remove the answer

For a support-angle lesson, first establish the ball carrier, receiver, defender, and intended goal. Show the original passing connection closing. Move the support player into a new lane. Draw the new connection and play the return pass. The explanation should point to the relationship as it changes.

During a quiz, retain neutral player identifiers and enough context to understand the situation. Remove the glowing correct destination and future solution trail until after the answer. A highlight that teaches during an example can reveal the answer during assessment. Audit these two states separately.

A mistake should produce a short, legible consequence: the selected lane is blocked, the defender steps across, and the ball stops or is intercepted. Then explain, “The defender can reach this line. A new angle takes the pass around them.” A second demonstration may compare the successful route. Do not award the independent check for watching it.

### Vary the required thinking

Use the simplest interaction that tests the concept. Recommended additions, in increasing authoring cost:

1. **Choose the space:** tap a large destination region; provide equivalent buttons.
2. **Choose the connection:** select which teammate has a usable passing lane.
3. **Choose the timing:** pause at the pass and choose whether to go, hold, or change direction; begin untimed.
4. **Complete the play:** choose the missing final movement after a worked example.
5. **Repair the play:** move one support player so a blocked connection opens.
6. **Explain the cue:** choose a short reason tied to visible evidence.
7. **Read a new scene:** altered defender movement changes which action is useful.

Do not grade fine drawing precision or reaction speed when the objective is tactical understanding. A drag interaction needs a tap alternative. Timed challenges can be optional for experienced learners after accuracy is established; they should not control basic progress.

Variants must change the decision structure. Mirroring the pitch or changing shirt colors tests some generalization but is not enough. Change which lane a defender closes, whether the teammate is already wide, whether the runner is available, or whether keeping possession is preferable to forcing a forward pass. Mix previously learned concepts once a child can distinguish them, rather than presenting a long block with the same obvious answer.

Offside, restarts, and positional responsibilities need format-specific authoring. Do not transfer a rule uncritically from an 11v11 lesson to a small-sided format with different applicable rules. Each item needs a football content reviewer, a stated objective, plausible alternatives, and an explanation of its constraints.

## Concrete journeys using existing content

### Journey 1: Find the next pass

**Concept:** support angles. **Existing context:** Barcelona, Lamine Yamal, Lionel Messi, and the Cove island character. These names are subjects of existing educational content, not claimed endorsers or playable official characters.

Cove introduces a teammate whose straight return pass keeps getting blocked. The child watches the full field give-and-go example and completes its missing support movement. A later scene changes which side the defender closes. The child must select the other available angle and identify the defender's position as the reason.

The player-card link asks what to watch away from the ball, then sends the child to the same concept scene. The club story remains an optional cultural chapter. The Passport result records “Support angles,” while the related cosmic ball displays the existing Pass & move learning badge. Equipping that ball does not increase quiz accuracy, remove defenders, or bypass another learning check.

#### Worked route through the current app

The following uses verified existing IDs; the quest orchestration and new variants are proposed. Quiz keys currently use `format:lessonId:questionIndex`, with zero-based question indices, not the lesson step index.

| Episode action | Existing destination or proposed addition | Completion and return behavior |
|---|---|---|
| Enter from Cove, Quests, or Passport | Proposed quest `support-first-lane`; concept `support-angles` | Save quest source and current stage; show “Try the play” |
| Learn the basic relationship | Futsal `prn_f_support`, **Make a Passing Lane** | Open the existing full lesson at its start; preserve pause/replay |
| First predictions | `futsal:prn_f_support:0` and `futsal:prn_f_support:1` | Existing questions attach to lesson steps 1 and 6; record assistance and first responses |
| See combination play | Futsal `f_pared`, **Wall Pass or Keep It** | Use its existing questions `futsal:f_pared:0` and `futsal:f_pared:1` as additional practice |
| Apply with a changed defender | New authored variant under the same concept | Keep its solution hidden; independently validate the expected answer |
| Finish the episode | Passport → My game → Support angles | Show the earned practice/application evidence and offer “Explore” or “Another play” |
| Return later | Proposed unseen review variant; optional later 7v7 `prn_7_support` | Review one decision; do not replay the whole onboarding or require traversing the island again |

If the child closes the lesson during a replay, save the quest stage and lesson/step destination but resume paused at a clear teaching boundary. If they leave before selecting an answer, do not record a response. If they leave after feedback, retain that response and assistance history; restarting must not convert it into an unseen first attempt. A completed quest's **Review** button should replay learning without duplicating awards.

After a reload, Passport's main action becomes **Continue: Find the next pass**. A small recap identifies the current problem. Choosing a different quest remains allowed. A store or player-card detour preserves the pending learning destination so **Back to my quest** returns directly to it.

The 7v7 counterparts `prn_7_support` (**Step Out of the Blocked Lane**) and `s_onetwo` (**A Wall Pass, or Keep It**) can extend this concept to another format after their constraints are reviewed. They are existing content to evaluate for transfer, not automatically certified independent variants merely because their IDs differ.

### Journey 2: Make room on the wing

**Concept:** width and timing. **Existing context:** Arsenal, Bukayo Saka, Thierry Henry, and the Pebble island character.

The existing 7v7 lesson `prn_7_spread` (**Make Room for Your Team**), with quiz keys `7v7:prn_7_spread:0` and `7v7:prn_7_spread:1`, provides a verified width foundation. The proposed overlap sequence builds on that foundation rather than treating width and overlap as identical. The first new scene asks the child to recognize an outside support run. The next scene has that lane already occupied, so copying the same overlap is no longer automatically useful. A separate timing scene freezes at the teammate's pass, with the appropriate format and rule stated. Explanations connect the positions to the decision.

A delayed quest lets the child be the defender: which space must now be protected? This perspective change checks whether the child understands the relationship rather than only memorizing the attacker's route. The road bike's Wide runner badge is a visible record and a route back to the lesson. It is not proof that the child has physically mastered an overlapping run.

### Journey 3: Arrive in scoring space

**Concept:** movement off the ball. **Existing context:** Bayern, Harry Kane, Gerd Müller, and the Moss island character.

The player first sees a striker draw a marker away. They then choose where a second movement opens a finishing lane. In the changed scene, the defender does not follow: the better response differs. The reward replay shows the teammate and runner coordinating their timing, with the ball traveling only when the lane exists.

The helicopter's existing Space spotter badge can link to a bird's-eye replay. Flight remains an island traversal feature; an aerial camera helps illustrate space but does not simulate the perceptual demands of being a player at pitch level. Include a later lower-angle or different-view scene as a design experiment rather than assuming transfer.

### Additional concepts after the pilot

Expand by football need, not by whichever club has the easiest collectible to make. Priorities include scanning before receiving, supporting behind the ball, defending as a pair, delaying an attacker, switching play, goalkeeper positioning, and recognizing a safe restart option. Include defenders, goalkeepers, and women's football examples in later player chapters, with their facts sourced before publication.

A cooperative NPC quest can ask the child to solve a sequence from two roles: first the ball carrier, then the supporting teammate. An optional parent or coach mode can alternate “choose” and “explain” turns on one device. This offers social play without requiring public rankings, live chat, or a multiplayer backend.

## Return visits, collections, and equipment

A useful return screen offers one unfinished episode, one short review, and one new choice. It should explain the football reason: “Can you still spot the return lane?” The review is an invitation, not an overdue assignment. Do not let repeated review prompts crowd out exploration.

Collect **plays understood**, not only objects. A child can build a personal playbook of solved situations, mark a favorite concept, and replay a scene with the guidance switched off. Club stamps and player learning cards add context, but should be visually and semantically different from these concept records.

Equipment can celebrate learning through a named badge or an optional original cosmetic detail. Keep the existing free-item promise. If cosmetic variants are later earned, disclose the exact learning requirement and avoid random drops, duplicate rarity systems, expiring rewards, or power advantages in educational quizzes. Trails and costumes should not obscure the pitch while learning.

Current football can supply a rotating editorial hook: a verified player story or a clearly labeled original scenario inspired by a common tactical problem. Live news should not generate unreviewed “correct” tactical answers. Evergreen concept teaching must remain understandable after a transfer or match becomes old news. Record source dates and retire stale player affiliations without deleting learning records.

## Product examples worth borrowing selectively

| Example | Verified pattern | Adaptation for Futbol Island | Limit |
|---|---|---|---|
| Khan Academy Mastery Challenges | Reviews previously learned skills with a short personalized mix of questions | Offer a small mixed review within Passport | Product documentation is not evidence for this app; do not copy its timer or level-down rules automatically[^24] |
| DragonBox | Official method describes engagement, exploration, reflection, and application | Let arranging a football play be the central game interaction | Marketing statements are not independent proof; guided examples remain important[^25] |
| Minecraft Education assessment guidance | Learners can document creations and explanations as evidence | Save a solved-play replay and a brief chosen explanation in Passport | Classroom tools and adult support differ from solo mobile use[^26] |
| FIFA grassroots sessions | Football questions are connected to modified games and game application | Provide optional coach-led “try this idea in a game” cards | These are coaching resources, not validation of screen-to-pitch transfer[^23] |

The transferable pattern is an observable learning action with a visible result. A copied reward system, visual style, or daily schedule is not the educational mechanism.

## Implementation plan for a measured pilot

### Phase 1: Connect the existing teaching

Create a small concept registry that maps the three pilot concepts to existing lesson IDs, quiz IDs, player cards, and Passport journeys. Add direct quest launch and return destinations. Keep one teaching renderer; avoid expanding the separate Passport pitch implementation into a competing lesson system.

Introduce attempt records with concept, lesson, item and variant IDs, content version, timestamp, selected response, first-response correctness, assistance shown, and whether the answer followed a demonstration. Capture only data needed for progress and evaluation. Existing local storage can support a pilot; persistence across browsers or devices remains a separate requirement.

A minimal proposed event contract makes those distinctions explicit:

```ts
type LearningAttempt = {
  eventId: string;          // deduplicate reloads and repeated delivery
  attemptId: string;        // one answer attempt, preserved through a reload
  questId?: string;
  conceptId: string;
  format: 'futsal' | '7v7' | '9v9' | '11v11';
  lessonId: string;
  questionIndex: number;   // existing quiz index
  variantId: string;       // identifies the actual authored situation
  contentVersion: string;
  at: string;              // ISO timestamp for later review
  responseId: string;
  correct: boolean;
  attemptNumber: number;
  assistance: ('hint' | 'solution-demo' | 'answer-revealing-cue')[];
  mode: 'practice' | 'independent-check' | 'delayed-review';
};
```

This is a suggested contract, not implemented code. Store exposure events separately when no answer occurs. Derive independent evidence from the actual assistance history, not only the requested mode. Use elapsed time between relevant events for a delayed check, while treating a locally editable clock as approximate. No personal name, precise birth date, voice recording, or location is needed for this progress model.

Preserve current completion flags and rewards. Mark them as completed material. New independent checks can establish the richer concept states. Keep reward derivation idempotent so reloads and replays cannot duplicate achievements.

### Phase 2: Author and validate the experience

For each pilot concept, prepare one concise worked sequence, one partially guided task, two independent decision variants, and two later-review variants. This is an authoring target, not a scientific minimum. Reuse assets, but have a football reviewer check every changed decision and explanation.

Audit lesson and quiz states separately. Check that arrows, destination zones, text, camera framing, and narration agree; that wrong outcomes explain a real misconception; and that a quiz never reveals its answer before selection. Verify pause, reduced motion, touch alternatives, stable modal size, and a clean return to the quest.

Run small observational sessions with roughly 8–12 children across the assumed age range and differing football experience. This sample is for usability discovery, not an efficacy claim. Ask children to show what they think is happening and why. Observe without coaching them through every tap; record where independent use breaks down.

### Phase 3: Evaluate learning and return behavior

Compare the connected quest experience with the existing teaching content under comparable learning exposure. Both groups should receive useful instruction. Define a primary outcome before examining results: accuracy on delayed, unseen football situations, supported by a simple explanation rubric. Use a brief baseline and a later check around one week; a longer check is valuable if feasible.

For a causal trial, randomize where feasible and calculate the sample size from a meaningful learning difference, expected variation, and attrition. A small product pilot should report estimates and uncertainty, not declare proof from a few enthusiastic sessions. Separate results by age band and prior football experience, while avoiding conclusions from tiny subgroups.

| Measure | Why it matters | Interpretation caution |
|---|---|---|
| Independent first response on unseen scenes | Tests applying the concept | A few multiple-choice items can be guessed |
| Delayed unseen-scene performance | Tests remembered understanding | Returning participants may differ from those who leave |
| Explanation quality | Checks the football reason | Reading and language demands can confound it |
| Help and demo use | Identifies support needs | Help is productive learning, not misconduct |
| Return with a meaningful learning action | Measures useful return behavior | App opens or driving time alone do not count |
| Learning per active learning minute | Checks efficiency | Do not penalize careful or accessibility-related pacing |
| Frustration, voluntary continuation, and stopping | Checks experience quality | Novelty and adult presence affect responses |
| Frame stability and scene visibility | Checks technical access | A missed tap or hidden player is not a misconception |

Use a simple explanation rubric for human review: 0 = no relevant cue; 1 = identifies a useful cue or space; 2 = links the cue to the chosen movement and consequence. Let children point or choose an explanation when writing would introduce an unrelated barrier. Do not require automatic speech analysis for the pilot.

If later claiming improvement on the real pitch, add a separate coach-led evaluation using comparable small-sided game situations, blinded or independently checked coding where feasible, and a baseline. TacticUP illustrates that football decision assessment can include off-ball attacking and defending situations with explicit validation; it does not validate this app's items or grant permission to copy its test.[^27]

### Release decision

Advance when children can independently enter and finish a quest, explain the relevant football relationship, and perform credibly on changed scenes. Expand only if learning outcomes improve or remain acceptably strong alongside better voluntary return behavior. If return rate rises while delayed understanding falls, revise the design rather than declaring the retention mechanic successful.

Defer a large economy, public competitive rankings, automated live-news quests, comprehensive player collections, and advanced adaptive algorithms until the three connected journeys work. The highest-value first deliverable is a reliable path from an appealing island problem into an excellent play, a meaningful quiz, and a Passport page that accurately shows what the child learned.

## Sources

Numbered notes identify the evidence supporting factual claims. Recommendations, example episodes, timing ranges, UI structure, and proposed progress rules are design judgments to evaluate. Research abstracts or author manuscripts were used where publisher full text was restricted; no numerical result here relies on inaccessible tables. Local implementation inventory reflects the project inspected for this report.

[^1]: Karpicke, J. D., and Blunt, J. R. “Retrieval Practice Produces More Learning than Elaborative Studying with Concept Mapping.” *Science* 331, 772–775, 2011. [Original article manuscript](https://learninglab.psych.purdue.edu/downloads/2011/2011_Karpicke_Blunt_Science.pdf). Adult science-text experiments; retrieval and inference learning.

[^2]: Karpicke, J. D., Blunt, J. R., Smith, M. A., and Karpicke, S. S. “Retrieval-Based Learning: The Need for Guided Retrieval in Elementary School Children.” *Journal of Applied Research in Memory and Cognition* 3, 198–206, 2014. [Author manuscript](https://learninglab.psych.purdue.edu/downloads/2014/2014_Karpicke_etal_JARMAC.pdf). Three elementary-school experiments; support requirements and limitations of unguided recall.

[^3]: Cepeda, N. J., Vul, E., Rohrer, D., Wixted, J. T., and Pashler, H. “Spacing Effects in Learning: A Temporal Ridgeline of Optimal Retention.” *Psychological Science* 19, 1095–1102, 2008. [Article record and abstract](https://pubmed.ncbi.nlm.nih.gov/19076480/). Spacing relative to the retention horizon.

[^4]: Atkinson, R. K., Renkl, A., and Merrill, M. M. “Transitioning From Studying Examples to Solving Problems: Effects of Self-Explanation Prompts and Fading Worked-Out Steps.” *Journal of Educational Psychology* 95, 774–783, 2003. [Author institution record](https://asu.elsevierpure.com/en/publications/transitioning-from-studying-examples-to-solving-problems-effects-/). Fading, explanation, and limits on far transfer.

[^5]: ter Vrugte, J., de Jong, T., Vandercruysse, S., Wouters, P., van Oostendorp, H., and Elen, J. “Computer Game-Based Mathematics Education: Embedded Faded Worked Examples Facilitate Knowledge Acquisition.” *Learning and Instruction*, 2017. [Publisher article](https://www.sciencedirect.com/science/article/pii/S0959475216302316). Original empirical study of fading within an educational game; used only for that bounded claim.

[^6]: Mautone, P. D., and Mayer, R. E. “Signaling as a Cognitive Guide in Multimedia Learning.” *Journal of Educational Psychology* 93, 377–389, 2001. [Article and author-provided abstract](https://www.researchgate.net/publication/232494695_Signaling_as_a_Cognitive_Guide_in_Multimedia_Learning). DOI: 10.1037/0022-0663.93.2.377. Three experiments with science explanations.

[^7]: Mayer, R. E., and Chandler, P. “When Learning Is Just a Click Away: Does Simple User Interaction Foster Deeper Understanding of Multimedia Messages?” *Journal of Educational Psychology* 93, 390–397, 2001. [Original paper](https://tecfa.unige.ch/tecfa/teaching/methodo/Mayer_Chandler01.pdf). Learner-paced animation and transfer/retention distinction.

[^8]: Mayer, R. E., and Moreno, R. “Nine Ways to Reduce Cognitive Load in Multimedia Learning.” *Educational Psychologist* 38, 43–52, 2003. [Publisher article](https://www.tandfonline.com/doi/abs/10.1207/S15326985EP3801_6). Research-based framework; not an app-specific trial.

[^9]: Moreno, R. “Decreasing Cognitive Load for Novice Students: Effects of Explanatory versus Corrective Feedback in Discovery-Based Multimedia.” *Instructional Science* 32, 99–113, 2004. [ERIC record with author abstract](https://eric.ed.gov/?id=EJ732333). Two explanatory-feedback experiments.

[^10]: Butler, A. C. “Repeated Testing Produces Superior Transfer of Learning Relative to Repeated Studying.” *Journal of Experimental Psychology: Learning, Memory, and Cognition* 36, 1118–1133, 2010. [Article record and abstract](https://pubmed.ncbi.nlm.nih.gov/20804289/). Four experiments with delayed inference questions.

[^11]: Habgood, M. P. J., and Ainsworth, S. E. “Motivating Children to Learn Effectively: Exploring the Value of Intrinsic Integration in Educational Games.” *Journal of the Learning Sciences* 20, 169–206, 2011. [Publisher article and abstract](https://www.tandfonline.com/doi/full/10.1080/10508406.2010.508029). Two studies of children aged 7–11; 58 in the learning study and 16 in the free-choice study.

[^12]: Wouters, P., van Nimwegen, C., van Oostendorp, H., and van der Spek, E. D. “A Meta-Analysis of the Cognitive and Motivational Effects of Serious Games.” *Journal of Educational Psychology* 105, 249–265, 2013. [Authors' article PDF](https://www.researchgate.net/profile/C-Nimwegen-2/publication/263936571_A_Meta-Analysis_of_the_Cognitive_and_Motivational_Effects_of_Serious_Games/links/5ece14544585152945148fe6/A-Meta-Analysis-of-the-Cognitive-and-Motivational-Effects-of-Serious-Games.pdf). Original quantitative synthesis; positive learning/retention and nonsignificant motivation result.

[^13]: Sailer, M., and Homner, L. “The Gamification of Learning: A Meta-Analysis.” *Educational Psychology Review* 32, 77–112, 2020; online 2019. [Full article](https://link.springer.com/article/10.1007/s10648-019-09498-w). See high-methodological-rigor subsplit and heterogeneity discussion.

[^14]: Hanus, M. D., and Fox, J. “Assessing the Effects of Gamification in the Classroom: A Longitudinal Study on Intrinsic Motivation, Social Comparison, Satisfaction, Effort, and Academic Performance.” *Computers & Education* 80, 152–161, 2015. [Publisher article](https://www.sciencedirect.com/science/article/pii/S0360131514002000). University course comparison; negative outcomes with a particular badge/leaderboard design.

[^15]: Kyewski, E., and Krämer, N. C. “To Gamify or Not to Gamify? An Experimental Field Study of the Influence of Badges on Motivation, Activity, and Performance in an Online Learning Course.” *Computers & Education*, 2018. [Publisher article](https://www.sciencedirect.com/science/article/pii/S0360131517302506). Randomized higher-education field study; limited badge effects.

[^16]: Deci, E. L., Koestner, R., and Ryan, R. M. “A Meta-Analytic Review of Experiments Examining the Effects of Extrinsic Rewards on Intrinsic Motivation.” *Psychological Bulletin* 125, 627–668, 1999. [Article record and abstract](https://pubmed.ncbi.nlm.nih.gov/10589297/). Original synthesis of 128 studies.

[^17]: Cameron, J., Banko, K. M., and Pierce, W. D. “Pervasive Negative Effects of Rewards on Intrinsic Motivation: The Myth Continues.” *The Behavior Analyst* 24, 1–44, 2001. [Article record and abstract](https://pubmed.ncbi.nlm.nih.gov/22478353/). Countervailing reward meta-analysis; publication year is 2001, not its later PubMed indexing date.

[^18]: Ryan, R. M., Rigby, C. S., and Przybylski, A. “The Motivational Pull of Video Games: A Self-Determination Theory Approach.” *Motivation and Emotion* 30, 2006. [Original article/author abstract](https://www.researchgate.net/publication/225998888_The_Motivational_Pull_of_Video_Games_A_Self-Determination_Theory_Approach). DOI: 10.1007/s11031-006-9051-8. Four studies of game motivation.

[^19]: Práxedes, A., Moreno, A., Sevil, J., García-González, L., and Del Villar, F. “A Preliminary Study of the Effects of a Comprehensive Teaching Program, Based on Questioning, to Improve Tactical Actions in Young Footballers.” *Perceptual and Motor Skills* 122, 742–756, 2016. [Article record and abstract](https://pubmed.ncbi.nlm.nih.gov/27207601/). Small quasi-experimental football intervention, 18 boys.

[^20]: Nimmerichter, A., Weber, N. J. R., Wirth, K., and Haller, A. “Effects of Video-Based Visual Training on Decision-Making and Reactive Agility in Adolescent Football Players.” *Sports* 4, article 1, 2016; published 31 December 2015. [Full article](https://pmc.ncbi.nlm.nih.gov/articles/PMC5968940/). Randomized academy-player study; explicitly limited match-transfer claim.

[^21]: Zhao, J., Gu, Q., Zhao, S., and Mao, J. “Effects of Video-Based Training on Anticipation and Decision-Making in Football Players: A Systematic Review.” *Frontiers in Human Neuroscience*, 2022. [Full article](https://pmc.ncbi.nlm.nih.gov/articles/PMC9686440/). Ten-study synthesis; scarcity of retention and real-game transfer assessments.

[^22]: Silva, A. F., Ramirez-Campillo, R., Sarmento, H., Afonso, J., and Clemente, F. M. “Effects of Training Programs on Decision-Making in Youth Team Sports Players: A Systematic Review and Meta-Analysis.” *Frontiers in Psychology*, 2021. [Full article](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.663867/full). Tactical effects, technical-execution null comparison, and methodological qualifications.

[^23]: FIFA. “Find the Gap.” *FIFA Training Centre*, 22 November 2022. [Ages 8–12 coaching session](https://www.fifatrainingcentre.com/en/practice/grassroots/8-to-12/find-the-gap.php). Official practical guidance with questions and game application.

[^24]: Khan Academy. “What Are Mastery Challenges?” Updated 20 September 2024. [Official help article](https://support.khanacademy.org/hc/en-us/articles/360037494231-What-are-Mastery-Challenges). Verified product mechanic, not independent efficacy evidence.

[^25]: DragonBox. “DragonBox Math Apps” and method overview. Undated, checked September 2026. [Official product site](https://dragonbox.com/). Verified design example; marketing efficacy statements are not adopted as research findings.

[^26]: Minecraft Education / Danny Bedingfield. “Assessment in Minecraft Education Edition — A Guide for Teachers.” Updated 4 February 2022. [Official lesson resource](https://education.minecraft.net/en-us/lessons/assessment-in-minecraft-education-edition-a-guide-for-teachers). Portfolio and explanation-based evidence example.

[^27]: Machado, G., and Teoldo da Costa, I. “TacticUP Video Test for Soccer: Development and Validation.” *Frontiers in Psychology*, 4 August 2020. [Original validation study](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2020.01690/full). Includes off-ball decisions, expert review, and validation; not validation of Futbol Island.
