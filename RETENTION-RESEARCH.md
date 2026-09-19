# Giving players a football reason to return

Research and proposed design, September 13, 2026. No gameplay changes implemented in this research task. This supplements RETENTION-IDEAS.md and supersedes its older suggestion to create generic costumes: the 23 club mascots now exist.

**Recommendation: introduce earned football collectibles and short tasks, joined by a personal learning journey.** The useful loop is: choose something you care about → play a short football challenge → understand the decision → earn a visible memory → return to apply it in a different situation. More items alone will eventually run out; improving competence and discovering football give the collection lasting meaning.

## What the actual app already supports

Inspected AGENTS.md, PROJECT.md, questModel.ts, questProgress.ts, quizProgress.ts, progress.ts, CostumeCollection.tsx, store.ts, npcDialogues.ts, Arcade.tsx, CoachesCentre.tsx and arcade game code.

- There are eight permanent introductory quests, not a rotating task system. Their evidence tracks pitch visits, watched lesson steps and equipping an item; quiz completion contributes separately. Watching all steps is completion evidence, not proof of understanding.
- The lesson inventory is 96 lessons across four formats. The current visual-teaching work is a prerequisite for rewarding meaningful decisions consistently.
- All 23 mascot costumes already offer stories, a question and saved “Story learned” status. All are free to equip. The 30 equipment options are also currently free. Preserve that access; put new earned recognition alongside it.
- NPCs already discuss passing, communication, scanning, captaincy, tactics and football news. Their personalities and locations are a strong basis for recurring challenges. Most conversations are static, not persistent relationship arcs.
- Arcade already has Soccer Pinball, Soccer Tennis, Breakaway Run and live match entry. Breakaway Run **already saves a best score** (`fi.game.runner.best`); Soccer Tennis displays a best rally within its game state. A proposal for personal records should extend and connect these, not claim to invent them.
- Quiz progress saves unique correct question keys, not a complete attempt history, confidence, hint use or delayed recall. Existing browser storage supports a prototype; verified remote competition and cross-device collections need additional persistence.
- Coaches IDP and Coaches Board are still Coming soon.
- One NPC still says rides unlock through quizzes while the store says everything is free. Align that copy before introducing any new reward system.

## What research supports—and what remains a hypothesis

EA SPORTS FC separates introductory, daily, weekly, dynamic and permanent milestone objectives. This demonstrates a useful hierarchy of goals. Its expiry and seasonal-reset policies are not necessary for this educational island; keep completed learning and collectible opportunities available. This source documents features, not a causal retention effect. [EA objective documentation](https://help.ea.com/en/articles/ea-sports-fc/ultimate-team-objectives/)

Nintendo connects ordinary island activities to Nook Miles and rewards. The relevant design lesson is to make exploration, conversations and activities contribute to a visible goal. For Futbol Island, the credited activity must include a football discovery or decision, rather than simply distance traveled. [Nintendo island activities](https://animalcrossing.nintendo.com/new-horizons/explore/)

Duolingo uses spaced repetition and accuracy to decide what learners revisit. Football scenarios could similarly revisit concepts after a delay and change the scene to distinguish understanding from memorizing an answer. This is a proposed adaptation; language-learning results do not establish effectiveness in this app. [Duolingo practice explanation](https://blog.duolingo.com/spaced-repetition-for-learning/)

Research applying self-determination theory to educational games emphasizes competence, autonomy and relatedness. That supports offering meaningful choices, clear improvement feedback and constructive relationships. It does not imply a particular reward schedule guarantees players will return. [Rigby and Przybylski, 2009](https://selfdeterminationtheory.org/SDT/documents/2009_RigbyPrzybylski_TRE.pdf)

FIFA Training Centre describes scanning and body orientation as connected, and progressive practice that changes player relationships and decision demands. This supports challenges where players read changing pressure and space, rather than grinding identical taps. [Scanning research brief](https://www.fifatrainingcentre.com/en/environment/research-brief/high-performance/play/aksum-scanning.php), [progressive box practices](https://www.fifatrainingcentre.com/en/practice/training-perspectives/outplaying-the-opponent-with-michael-beale/michael-beale-outplaying-skills-through-box-practices.php)

Duolingo's Friends Quests demonstrate asynchronous shared learning goals and an opt-out. A football team goal could use this pattern without requiring everyone online together. Published company engagement claims are not a forecast for Futbol Island. [Friends Quests](https://blog.duolingo.com/friends-quests/)

## Ten ideas, in recommended order

Effort is relative: S = content/UI extension; M = new persistent activity flow; L = new gameplay or server-backed system. These are scope estimates, not delivery commitments. Every row below is proposed design.

| Priority | Addition and football purpose | Repeat loop and cadence | Reward / example | Effort and dependency | Measure |
|---|---|---|---|---|---|
| 1 | **Football Passport:** turn existing mascot knowledge into a collection about clubs, countries and football culture. | Choose a club, learn its story, answer; later compare two clubs or recall the story. Evergreen, with a featured club each week. | Club stamp; a regional page becomes a displayable pennant. Start with the existing 23 stories. | M; reuse learned-story IDs and snapshots. | First stamp completion, second club explored, delayed culture recall. |
| 2 | **Matchday Missions:** extend the quest system into a useful 3–5 minute visit. | Offer a choice of three small linked tasks; retain unfinished tasks. Refresh suggestions daily, never erase progress. | Talk to Priya about scanning → find pressure before receiving → select the open teammate. Earn a Scanning card. | M; concept tags, task evidence, reliable visual scenarios. | Mission completion, voluntary next mission, D7 learning return. |
| 3 | **Personal Coach / IDP:** let players see what they are improving. | Choose “be a better midfielder” or “understand defending”; alternate new learning and delayed review. Two or three suggested sessions weekly. | A progress map: recognize → decide → apply. Return to the same concept in 7v7 and 11v11. | M–L; attempt history, scheduling, multiple scenario variants. | First-attempt accuracy on an unseen variant after 7 days. |
| 4 | **NPC football friendships:** give recurring characters meaningful continuity. | Each mentor has a short permanent chapter chain and remembers the last challenge. New chapter after demonstrated understanding. | Sam needs an available teammate; Amina asks you to organize defensive cover. Earn a teammate note or captain pennant. | M; staged dialogue and football task outcomes. | Return to the same mentor, chapter completion, decision improvement. |
| 5 | **Skill courts and personal records:** improve the game side through football control. | Repeat 45–90 second passing, first-touch or dribble courses, with changed angles. Show the previous attempt and one actionable tip. | “Receive away from pressure”; accuracy and control medal. Extend existing runner records into a unified record book. | M–L; new skill challenge logic and fair scoring. | Voluntary retries, improved accuracy, successful decisions at equal difficulty. |
| 6 | **Build a tactical playbook:** collect useful moves rather than generic XP. | See a give-and-go, arrange its movements, then solve when it is useful. Evergreen chapters, optionally featured weekly. | Animated give-and-go, overlap, switch-of-play and defensive-cover cards; each replays its explanation. | M–L; reuses richer lesson animation, later adds arrangement interaction. | Correct sequencing and application to new defensive shapes. |
| 7 | **Weekly Island Cup:** make several sessions feel like one football event. | Complete any three sessions around one concept: learn, practice, apply. Archive past cups so late players can participate. | “Create Space Cup”: passing decision + first-touch drill + matching live-game situation. Permanent pennant. | M after missions and skill scoring exist. | Participants returning for a second session; transfer-question accuracy. |
| 8 | **Your football locker:** make earned progress visible and personal. | Choose a favorite club stamp, role card and pennant after each milestone; revisit to rearrange. | A compact locker screen or shareable postcard: “I learned to create a passing angle.” | S–M; start in existing modal, no new 3D building. | Voluntary display/equip rate and revisits after earning an item. |
| 9 | **Football this week:** connect learning to real matches. | A reporter introduces a verified result and one curated, reusable tactical explanation. Weekly, not a constant news stream. | A dated match notebook entry explaining a pressing trap or substitution role. | M plus ongoing editorial work; verify feed availability and sourcing. | Story-to-lesson conversion, next-week return, correct tactical explanation. |
| 10 | **Teammate challenges:** encourage learning with another person. | Share the same scenario seed and compare reasoning; later complete a cooperative weekly football goal asynchronously. | Joint team pennant; each player contributes a correct read, not thousands of repetitive actions. | S–M for unranked local/share challenge; L for verified shared progress. | Invited learner completion and repeat participation; solo completion remains available. |

## What to collect

Use **one Football Passport/collection**, with a few understandable item families, rather than several currencies and inventories:

- **Club stamps:** earned from existing mascot stories. Their reverse shows the verified history and country. All costumes remain freely wearable.
- **Position cards:** goalkeeper, centre-back, full-back, midfielder, winger and striker; earn by solving role-specific situations. A card explains responsibilities, not a universal numerical player rating.
- **Tactic cards:** passing triangle, overlap, third-player run, compact block and counterpress. Each contains a short replay and the condition that makes it useful.
- **Pennants and armbands:** permanent recognition for a sequence of learning and application, visibly tied to the achievement.

Let players select the item they are working toward and see exactly how to earn it. No duplicates, random packs, trading economy or loss of earned items. A map discovery can reveal a story or challenge, but simply touching a floating pickup should not count as football mastery. Do not tie football learning rewards to knocking NPCs over, car crashes or flying laps; those activities do not demonstrate the intended learning.

A specific example: choose Dortmund's passport page → learn why EMMA is a bee and who Emmerich was → earn the club stamp → optionally choose a separate finishing lesson → earn a finishing card by identifying the better shooting opportunity. Label the finishing connection as our curriculum, not a historical claim that the mascot represents that tactic.

## First three iterations

### 1. Connect the island's existing strengths

Build a Football Passport with the existing 23 club stamps and a small “Your next football challenge” entry point. Add six hand-authored mission chains using current NPC topics, story questions and the improved visual lesson engine. Let players choose a goal. Credit previously completed stories automatically and retain the original eight quests. Include a simple collection display; keep all existing free equipment and mascots free.

First session: choose a club → discover its story → receive stamp → choose a three-minute football mission. End with what was learned and a saved next step. No login wall or streak countdown. Instrument completion and return events before drawing conclusions.

### 2. Make returning demonstrate improvement

Activate a small IDP pilot with three concepts: scanning before receiving, supporting with a passing angle, and pressure/cover. Author at least three materially different scenarios per concept. Record first answer, retries, hint use and completion. Offer review roughly 1, 3 and 7 days later as an initial scheduling hypothesis; adjust with evidence. Review stays available when someone returns late. Add one controllable first-touch/passing challenge before adding many arcade rewards.

Award a mastery card for success on different scenarios separated in time, not repeated clicks on the same answer. Present progress neutrally (“Ready to practice again”) without removing earned recognition.

### 3. Give the island a shared football rhythm

Introduce one archived weekly cup using those concepts, an NPC chapter and a permanent pennant. Add one sourced football-current-events story only if editorial maintenance is realistic. Pilot shareable unranked scenario links. Add accounts/cloud saves and verified joint goals only once the local loop is useful and persistence requirements are clear.

## How to judge whether it works

Use **returning learners who complete a meaningful football activity and improve on a delayed new scenario** as the main outcome. Time spent alone can reflect confusion or grinding.

- Activation: proportion of new players completing a story check or football decision, not merely opening the island.
- D1/D7/D28 learning return: a new-player cohort returns in the stated period and completes a learning or skill activity. Report cohort size and define windows consistently; browser-only IDs undercount cross-device returns and reset with cleared storage.
- Learning: first-attempt accuracy on a held-out scenario at the same difficulty after a delay; report hint use separately. Track culture recall separately from tactical decisions.
- Enjoyment: voluntary retries and a brief optional “Would you play another?” question; look for improvement alongside retries.
- Collection usefulness: how often players inspect, display or revisit an earned item, plus whether they can explain its football meaning.
- Practical guardrails: task abandonment, repeated same-answer farming, error rates, mobile responsiveness and load cost. Keep new UI/data lightweight and reuse the existing renderer.

Compare against a baseline or staggered pilot, not an invented retention target. A feature can increase activity without teaching more; that would miss the project's stated purpose. Weekly flexibility, clear stopping points and saved progress are design choices here, not claims that one particular cadence has been scientifically proven best.
