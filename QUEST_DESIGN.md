# Island quest design

The path now offers eight freely selectable goals across exploring, learning, quiz retrieval and personalizing equipment. Nothing expires; there are no streak penalties or locked prerequisite quests. A selected stop explains the actual action, progress and one-time point award, then opens the relevant map, plays or Store flow.

Research informed these choices:

- Przybylski, Rigby and Ryan describe competence, autonomy and relatedness as central to game motivation. They discuss skill-graded challenges and positive feedback as support for competence. Our application is optional, legible goals, free choice of order, and small learning milestones rather than pressure to log in: [A Motivational Model of Video Game Engagement](https://selfdeterminationtheory.org/SDT/documents/2010_PrzybylskiRigbyRyan_ROGP.pdf).
- Retrieval practice combined with feedback supports learning; mistakes are compatible with learning when feedback follows. Our application links watching a play to trying its existing quiz, rewards distinct correct reads, and permits unlimited retries without loss: [Carnegie Mellon Eberly Center: Retrieval Practice](https://www.cmu.edu/teaching/resources/instructionalstrategies/activelearningstrategies/retrievalpractice/index.html).
- Explanatory feedback helps learners understand their progress. The quest layer therefore describes what counted, while existing question feedback explains the football decision: [Retrieval Practice: Metacognition and Feedback](https://www.retrievalpractice.org/feedback/).

These are design inferences, not evidence that this particular implementation improves retention or learning. Point amounts and eight milestones are product choices, not research-derived optima.

## Evidence and reward contract

- Visits require a grounded player actually arriving near a pitch. Opening the map does not count; using map travel and arriving does.
- A watched play requires natural playback completion of every authored step. Recorded steps persist between sessions. Seeking to the ending does not substitute for skipped steps. Lessons completed before this feature have no watch evidence and are not fabricated as complete.
- Quiz progress uses the existing validated per-question save, preserving previously earned stars. Duplicate correct answers do not earn more stars.
- Equipment progress is recorded when an item is equipped from the actual Store, not when the Store is opened.
- Quest points derive from completed evidence, with no claim balance that can be incremented twice. Displayed points equal quiz stars × 10 plus completed quest awards. Points cannot be spent. All current Store items are free; future eligibility metadata does not restrict current equipment.
- Evidence is local to this browser and is lost when its local storage is cleared. Storage failure retains current-session progress without crashing.

`node tests/quests.cjs` checks distinct events, skipped playback, one-time rewards, save recovery, denied storage and alignment of `questLessonManifest.json` with the actual lesson catalog. Regenerate that manifest when lesson step counts change. Typecheck also passed after integration.
