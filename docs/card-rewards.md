# Card rewards: choose 1 of 3

Status (24 Sep 2026): built and tested locally, behind one launch switch that is still off. Nothing is committed or deployed.

## Launch switch

**To launch, change one line.** In `lib/town/cardRewards.ts`, set `export const CARD_REWARDS_LAUNCH=true`.

Both flags are derived from it:
- `CARD_REWARDS_ENABLED = CARD_REWARDS_LAUNCH` turns rewards on.
- `UNLOCK_ALL_CARDS = !CARD_REWARDS_LAUNCH` (in `cardCollection.ts`) turns unlock-all off.

It is held at `false` until the remaining new-player films are done. The dev switches `?cards=earn` and `?cards=all` still flip one browser either way in dev builds. `tests/card-collection.cjs` stubs unlock-all off in the served bundle, and it handles the derived form.

## What the user asked for

> "After they collected a ball, talked to an NPC, or completed a quiz correctly, we give them the option to choose between three cards. This will be completely random until they have collected all cards."

There are 353 cards: 276 football cards and 77 futsal cards.

## How it works

1. A trigger fires: a ball is found, a chat is finished, or a quiz is passed.
2. The game makes one **offer**: 3 cards drawn at random from the cards the child doesn't own.
3. The offer opens at the next calm moment, never on top of the ball lesson or the chat.
4. All three cards are shown **face-up** (portrait, name, number, Star or Legend) as a **deck** (user, Sep 24 2026): one large card in front, as big as the screen allows without scrolling, with the other two smaller, turned and dimmed behind it. The arrows, a swipe, the arrow keys (Home/End too) or a tap on a card behind bring a card to the front. Under the front card are "1 of 3", its position and one strength, and a clear **"Choose [first name]"** pill.
5. After Choose, the other cards slip away and the chosen card **spins once** (≈0.85 s, transform only, none with reduced motion) into the full **PlayerCard**, the binder viewer's card, loaded lazily. It has hover tilt, "Flip card" for the back (Strengths / Top Plays / History) and "Play" for the player's film. Escape or Stop ends only the film and returns to the reveal. "[Name] is yours" and "Keep playing" / "See it in my binder" are the way out. The card goes into the binder and is never offered again. In the binder itself (the pill), the dialog still closes straight away so the card lands in its pocket.
6. **The child picks one there and then** (user, Sep 24 2026): there is no "Choose later" and Escape can't skip it. If the page is closed mid-offer, the offer stays pending and reopens on the next visit (the Paths badge, the Collect cards tile and the binder pill also reopen it). A pick that has been earned is never lost.
7. If fewer than 3 cards are missing, the offer shows what is left. When nothing is missing, the child sees a friendly "Every card is in your binder!" message instead (once per session).

### How this fits with the earlier proposal

The earlier proposal (scratchpad `research/card-rewards.md`) recommended themed rewards with no randomness. It rested on RETENTION-RESEARCH.md: "no duplicates, random packs…". The user asked for random offers, so this build takes the **safe parts of randomness** and keeps the proposal's guardrails:

- **Random offers, but no gamble.** Nothing is hidden and nothing is revealed after a pick. The child sees all three cards and chooses, so there are no packs, no odds and no "rare pull". This is the proposal's "Alternative B: choose 1 of 3", with random draws in place of themed ones.
- **No duplicates.** An offer only ever holds missing cards. If a card is collected somewhere else before an offer is opened, that card is replaced when the offer opens (`refreshOffer`). Two pending offers avoid sharing cards while enough cards remain. Because every pick is a new card, 353 picks always complete the set, so there is no "last 10%" wall. `tests/card-rewards.cjs` simulates this.
- **The teaching link.** Each offer carries a one-line reason tied to what the child just did, for example:
  - "You found a ball and learned 'Scan before receiving'."
  - "You passed '3-1: Meet the Court Roles', a quiz about futsal."
  - "You learned from Mr. Okafor, island mentor."

  Under each card is its position and a strength from `playerProfiles.json`, so the choice itself is a small lesson about three players.
- **Theming (on; user approved 24 Sep).** With `THEME_ONE_CARD=true`, one of the three cards is matched to the activity, and the other two stay random from the uncollected cards. For example, a goalkeeping quiz gives a goalkeeper, and a futsal lesson gives a futsal card.
  - `themeFromText` reads the lesson category and title, the ball tip's **title**, or the chat text.
  - When no card of the theme is uncollected, the offer falls back to fully random and makes no claim.
  - The reason line names the match, e.g. "…a quiz about goalkeeping. … Jorge Campos (goalkeeper) matches what you just learned about goalkeeping." It stops naming it if that card is later swapped out.

## Triggers and the exact hooks

| Trigger | When it pays | Hook |
|---|---|---|
| Ball hunt | The first time each ball is collected, once per ball, ever. The offer opens after the ball lesson's "Got it". | `components/Town.tsx`: the `createCoinHunt(…, onCollectionFinished)` callback calls `earnForBall(c)`, then queues `BallHuntLesson` as before. It covers walk-up, kick and truck balls. |
| NPC chat | The child asks a topic **and** its follow-up, then closes the chat. | `components/NpcConversation.tsx`: a `learned` ref records the finished chat, and the `[open]` effect calls `earnForNpc(npc, topics)` on close. |
| Quiz | The **end** of a lesson quiz with **at least 5 questions**, every one answered correctly **on the first try in one run** (`CARD_QUIZ_FIRST_TRY`; earlier visits don't count). One offer per lesson, ever, never one per question. | `components/FieldLearning.tsx`: `nextQuestion` calls `earnForQuiz(chosen, correctRun)` when the last question is done. The rule itself is `quizEligibleForCard()` in `lib/town/cardRewardTriggers.ts` (see below). |

### Quiz rule (user, 24 Sep)

A quiz earns a card only when it has **at least `MIN_QUIZ_QUESTIONS = 5` questions, all answered correctly**. Retries within the quiz are fine.

- The rule lives in **one function**, `quizEligibleForCard(questions, allCorrect)` in `cardRewardTriggers.ts`, which calls the pure `quizEarnsCard` in `cardRewards.ts`.
- It delegates to `quizCardEligible` in `lib/town/quizProgress.ts`.
- **Today every quiz has 2–3 questions** (96 lessons in `quizManifest.json`), so quizzes earn nothing until the longer 5+-question quizzes land. Balls and NPC chats still earn cards.

Other places the binder connects to:

- **Paths / Collect cards:** the tile badge is in `CardsSummary.tsx` and the dot on the Paths button is in `IslandSettings.tsx`.
- **Binder:** the pill and the landing are in `CardCollection.tsx`. The landing turns to the chosen card's page and lights its pocket with the existing "Found" mark.
- **"See it in my binder":** fires the `fi2-open-cards` event, which `IslandSettings` handles.

The position guide never collects cards (it hasn't since Sep 23).

### More triggers (built 24 Sep)

These pay the same way as the first three:
- **once per item, stage or story, ever**, through the `paid` ledger;
- they count toward the same session cap and pass the same launch gate, because they all go through `earnCardOffer`;
- they are themed where it makes sense;
- each has a reason line tied to what was learned.

| Trigger | When it pays | Hook | Theme and reason |
|---|---|---|---|
| Explore items | An item on the island checklist **newly** completes. `knock-characters` never pays: RETENTION-RESEARCH.md rules out learning rewards for knocking people over. | There is no completion event (completion is derived from four stores). `ExploreCardWatcher` in `components/CardOfferHost.tsx` watches `useExploreChecklist()` and pays items that weren't complete on its first run (`earnForExplore`). It is mounted only while rewards are on. | Themed from the item title, e.g. "Visit the futsal court" → futsal, "Shoot 5 targets" → forwards. The reason is the item plus its first teaching sentence: "You completed 'Visit the Store' on your island checklist. Explore the gear and the stories behind the animal costumes." |
| Learning Journey stages | A stage (0–5) is completed for the first time. | `lib/town/learningProgress.ts`: `completeLearningStage` now fires `LEARNING_STAGE_COMPLETE` after the write. `CardOfferHost` listens and calls `earnForJourney(id, stage)`. An event is used because a direct import would create a cycle, and `FieldLearning.tsx` is left alone. | Themed from the journey concept, e.g. support angles → passing and support. Reason: "You finished 'See it' in the Support angles journey, practising support angles." |
| Stories | A life story or an optional path story is watched to the end. | `components/QuestLearningPath.tsx`: `finishStory` (the life story's `onFinish`, or closing it once `data-story-complete` is set) and the `UpcomingStory` `onClose(completed)` callback both call `earnForStory(id)`. | Futsal stories get a futsal card; the others are random, since life skills don't map to a position. Reason: "You watched 'The Chalk Line' to the end, a story about creative confidence." |

### NPC frequency (user decision, 24 Sep)

- At most **one pick per islander per day**.
- At most **`NPC_PICKS_PER_DAY = 5`** NPC picks per day in total.
- The count resets at **local midnight** on the device clock and is stored in localStorage.

Why:

- There are dozens of islanders, and a "first time only" rule would run out after a few sessions.
- An unlimited rule would make chatting a card farm.
- Five a day keeps chats worth doing without turning them into a grind.
- Nothing carries over, and **nothing is lost by skipping a day**. There are no streaks, notifications or countdowns.

Once the cap is reached, the chat shows one gentle line, "You've met lots of players today. Chat cards take a rest until tomorrow, and every tip still counts.", and finishing the chat offers nothing.

### One pick per achievement

A quiz played inside a Learning Journey stage pays through the stage (`earnForJourney`), not also as a quiz, so one success never pays twice (bug sweep, Sep 24 2026).

### No catch-up picks

Removed on Sep 24 2026 (user: "there are no users yet"). Past progress earns nothing; only things done after rewards are on pay a pick. Saved catch-up offers from test browsers are dropped when offers load.

### Session cap

`MAX_OFFERS_PER_SESSION = 6` (kept, user approved): at most 6 offers per browser tab session (sessionStorage). This stops the offers from turning into spam. Once the cap is reached, triggers in that session offer nothing, and nothing is taken away. A ball or quiz found after the cap is marked as not paid, so replaying that quiz in a later session can still pay. A ball cannot be collected twice, so a capped ball does not pay later.

## Kid-safety guardrails

- **The choice is informed.** All cards are face-up: no blind reveal, no odds, no rarity pressure. Star and Legend are shown as text labels only.
- **No time pressure.** There are no timers, and there is no "limited" or "expiring" copy.
- **No return nudges.** There are no streaks, daily login bonuses or notifications.
- **Nothing to buy.** There is no currency, no trading, and no purchase anywhere near the cards.
- **Nothing is taken away.** Earned picks stay pending until the child uses them. Nothing expires, and cards are never removed.
- **Calm stops.** Each offer ends with "Keep playing", and nothing moves on automatically.
- **Learning preview earns nothing.** `isLearningPreview()` and FieldLearning's own preview guard both block rewards.
- **Accessibility:**
  - It is a real modal `<dialog>` with a Tab focus trap, and focus goes back to where it was.
  - The Choose pill takes focus. Arrow keys, Home and End turn the deck (announced politely as "Card 2 of 3: …"), and Enter or Space on Choose chooses. The front card is a labelled group, and the cards behind are pointer shortcuts hidden from screen readers (the arrow buttons do the same).
  - Escape does nothing until a card is chosen.
  - Each card has a full label (name, position, rarity, number, strength), and an `aria-live` region confirms the pick.
  - Touch targets are 44 px or larger.

## Persistence and flags

- **Collection:** the existing v1 `string[]` under `CARD_STORAGE_KEY` (`fi2-player-cards-v1`). Picks are added with `addToCollection`, which merges what other tabs saved. `readCollection` is unchanged, except that it respects the dev switch below.
- **Offers:** `fi2-card-offers-v1` holds `{version:1, offers[], paid[], npcDay:{day, ids[]}}`.
  - `paid` is the ledger: `ball:<id>`, `quiz:<fmt>:<lessonId>`, `npc:<day>:<id>`.
  - Saved data is cleaned on read (`sanitizeOfferState`).
  - Other tabs are merged: offers and payouts are unions, and this tab's copy of an offer wins.
  - If storage is blocked, the state is kept in memory for the session.
- **Flags:**
  - `CARD_REWARDS_LAUNCH` (`lib/town/cardRewards.ts`, false) drives `CARD_REWARDS_ENABLED` (off) and `UNLOCK_ALL_CARDS` (on, in `cardCollection.ts`).
  - Also in `cardRewards.ts`: `THEME_ONE_CARD` (true), `MAX_OFFERS_PER_SESSION` (6), `NPC_PICKS_PER_DAY` (5).
- **Dev switch (`cardDevEarn`):**
  - `?cards=earn` turns unlock-all off and rewards on in that browser. It is remembered under `fi2-cards-dev-v1`.
  - `?cards=all` switches back.
  - It is ignored whenever `NODE_ENV==='production'`, so production behaviour is unchanged.

## Code map

| File | Role |
|---|---|
| `lib/town/cardRewards.ts` | Pure rules and constants: draw, refresh, theme, NPC day rules, sanitize and merge. Tested in Node. |
| `lib/town/cardRewardStore.ts` | Client store (`useSyncExternalStore`): `earnCardOffer`, `chooseOfferCard`, `markOfferSeen`, `liveOffer`, and the events. |
| `lib/town/cardRewardTriggers.ts` | `earnForBall` / `earnForNpc` / `earnForQuiz` / `earnForExplore` / `earnForJourney` / `earnForStory`, `quizEligibleForCard`: the reason lines and themes. |
| `components/CardOfferHost.tsx` | Mounted in Town. Hosts the Explore watcher and the journey-stage listener. Renders nothing until an offer exists. It opens fresh offers when the island is calm and sleeps the 3D scene while one is open (`settingsRef`). |
| `components/CardOffer.tsx` + `.module.css` | The modal: the deck of MiniCards, then the lazily loaded PlayerCard reveal. It reuses the binder viewer's dark scrim, the cream note card, the gold paper pill, the cream pill and the dock's round yellow arrows. |
| `components/CardOfferBadges.tsx` | The tile badge, the Paths dot and the binder pill. |

## Phone heat

- **At rest, the added cost is zero:**
  - no timers, polling or animation loops;
  - the offer code (`CardOffer`, MiniCard and profiles) loads only when an offer opens;
  - the host and badges are small store subscribers.
- **While an offer is open:**
  - the 3D island sleeps, because the offer is part of `settingsRef`;
  - Paths art behind the offer rests and isn't woken by the offer's taps and keys (`lib/sceneryRest.ts`, fixed Sep 24; see the performance guide);
  - music keeps playing, as it does under the other island menus;
  - the modal is static MiniCards on a flat scrim, with no `backdrop-filter`;
  - turning the deck is one 0.3 s transform transition, choosing is a 0.24 s fade plus the one-shot spin, and the revealed PlayerCard's scenery loops are held still. There is no endless animation in the dialog, and nothing moves with reduced motion.
  - PlayerCard's chunk loads only once an offer is open.

None of this is measured on a real iPhone. It is reduced work, not a proven cooling gain.

## How to test locally

1. Open `http://localhost:8092/?cards=earn`. Rewards turn on and unlock-all turns off, so you start at 0 / 353.
2. Try each trigger:
   - **Ball:** walk to any ball, for example the Store gardens bag. Tap "Got it", browse the deck with the arrows or a swipe, then press "Choose …".
   - **NPC:** talk to an islander, ask a question and its follow-up, then close the chat.
   - **Quiz:** open a lesson quiz with 5+ questions and answer every question correctly. The offer comes after the last "Next". Current 2–3-question quizzes correctly earn nothing.
   - **Explore:** complete a checklist item, e.g. enter the Store. The offer opens when the Store closes.
   - **Journey:** talk to an islander and choose "Practise with …". Finish the stage's quiz; the offer comes after "Back to Paths".
   - **Story:** open Paths → Futsal → "Start here" (the opening story) and watch it to the end, then close it.
3. Try Escape: the offer stays open until a card is chosen.
4. Open `?cards=all` to go back to the shipped behaviour (every card unlocked).
5. Automated checks:
   - `node tests/card-rewards.cjs` for the rules;
   - the end-to-end runs in the session scratchpad: `pickcard/ui.mjs <w> <h> [reduced]` (the deck, Choose, the spin and reveal, Flip, Play/Escape, with no scrolling) and `pickcard/bg-probe.mjs <w> <h> [ball|paths]` (what runs behind the offer). Also `card-rewards-e2e.mjs` and `cr-more.mjs` for the triggers; `card-rewards-e2e.mjs` still expects the old three-across layout and "Choose later".

## Open decisions for the user

Decided on 24 Sep:
- launch through `CARD_REWARDS_LAUNCH`, held until the new-player films are done;
- keep 6 offers per session;
- theming on;
- a passed quiz means 5+ questions, all answers correct, retries allowed (the 5+ part was added later the same day);
- Explore items, journey stages and stories were built as triggers the same day;

Still open:
1. **When to launch:** flip `CARD_REWARDS_LAUNCH` once the films are done.
2. **Explore item `ride-truck`:** it pays today. Keep it, or leave it out like `knock-characters`?
