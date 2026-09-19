# The Missing Matchday Balls

Implemented exploration side quest: 40 spinning soccer balls distributed across the island. Open Quests and use Clues & discoveries for a landmark, a specific hint, then a saved gold marker. Every find connects to a football idea; exploration does not substitute for learning plays or answering quizzes.

- Search the island’s gardens, markets, waterfront and building rooftops.
- Kick marked solid boxes and either of the two practice-wall targets.
- Six raised boxes on south-facing building walls require a high shot or wall juggle. Their balls drop to ground level when revealed.
- Drop onto four gold-marked grass hatches beside buildings. They open from downward landings, not kicks or walking.
- Four padded boxes accept a landing or kick.
- Ride the third rooftop ramp to collect the airborne ball before the fourth landing ramp. Flight cannot bypass this jump.
- Two moving pickups carry one ball each. Fly directly over the marked bed and choose Walk to land. Stay still to ride, move to dismount, or choose Flight to take off. Their clue markers follow them.

All normal unopened boxes and hidden trunks have collision. Revealed breakable boxes clear their collision; hidden trunks clear when their ball is collected. Hidden balls sit behind the trunk so users can collect them without walking through it. Moving pickup beds require accurate overhead alignment to start landing.

Progress stores revealed and collected IDs separately under the existing `fi2-matchday-coins-v1` key, preserving earlier discoveries. All 40 finds unlock the island-original gold-and-teal Matchday Fox. Existing free costumes remain free. Completion has a celebration and Store equip action. No timers, daily resets or purchases.

Implementation: `coinQuest.ts` registry, `coinProgress.ts` persistence, `coinHunt.ts` shared geometry and pooled particles, `streetTraffic.ts` pickup beds and routes, and Town’s flight/landing/ramp hooks. Plays, quizzes and blocking panels pause hunt interactions; reduced motion quiets cosmetic animation. The onboarding walkthrough covers the current exploration mechanics and football learning path.
