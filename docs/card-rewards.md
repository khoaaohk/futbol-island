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
4. All three cards are shown **face-down** as mystery cards (since 25 Sep 2026, see "Mystery cards" below; before that they were face-up) in a **deck** (user, Sep 24 2026): one large card in front, as big as the screen allows without scrolling, with the other two smaller, turned and dimmed behind it. The arrows, a swipe, the arrow keys (Home/End too) or a tap on a card behind bring a card to the front. Under the front card are "1 of 3", its position and one strength, and a clear **"Choose [first name]"** pill.
5. After Choose, the other cards slip away and the chosen card **spins once** (≈0.85 s, transform only, none with reduced motion) into the full **PlayerCard**, loaded lazily. The reveal is the binder's card viewer (user, Sep 24 2026): the same top bar (the animated **Done** at the top left, **Play** at the top centre, **Flip** at the top right, with Flip doing the card's foil turn) and the same large card size. Escape or Stop ends only the film and returns to the reveal. "Added to your binder / [Name] is yours / No. · position" and **"See it in my binder"** sit in a **bottom sheet** that slides up as the card lands. Its grab handle ("Hide"), or a swipe down, tucks it away to a small tab at the bottom; a tap on the tab (or a swipe up) brings it back. While the sheet is up the card leaves room for it; tucked away, the card grows back to the viewer's full size. On screens 1200 px and wider the sheet docks bottom right, beside the card. **Done** (or Escape) shrinks to its check and returns the child to the game. The "N of 353 collected" line shows only on the choosing deck. The card goes into the binder and is never offered again. In the binder itself (the pill), the dialog still closes straight away so the card lands in its pocket.
6. **The child picks one there and then** (user, Sep 24 2026): there is no "Choose later" and Escape can't skip it. If the page is closed mid-offer, the offer stays pending and reopens on the next visit (the Paths badge, the Collect cards tile and the binder pill also reopen it). A pick that has been earned is never lost.
7. If fewer than 3 cards are missing, the offer shows what is left. When nothing is missing, the child sees a friendly "Every card is in your binder!" message instead (once per session).

### How this fits with the earlier proposal

The earlier proposal (scratchpad `research/card-rewards.md`) recommended themed rewards with no randomness. It rested on RETENTION-RESEARCH.md: "no duplicates, random packs…". The user asked for random offers, so this build takes the **safe parts of randomness** and keeps the proposal's guardrails:

- **Random offers, no packs or odds.** Since 25 Sep 2026 the three cards are face-down and the pick is blind (user request, see "Mystery cards"). What keeps it safe: every card on offer is a new card (no duplicates, so every pick completes the set), no rarity is shown before the pick, there are no odds, no "rare pull" copy, nothing to buy or trade, and exactly one card is granted per earned pick. This is the proposal's "Alternative B: choose 1 of 3", with random draws in place of themed ones.
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

## Mystery cards: face-down pick and unpack (25 Sep 2026)

User: "after clicking on the ball, instead of seeing the three cards, the user can choose three cards exactly how it is now, but won't know who it is. Then you can choose a card to unpack the card and show."

- **Same offer, same deck.** The three cards are drawn exactly as before (random from uncollected cards, `THEME_ONE_CARD`, no duplicates, shuffled at draw time), with the same deck: one big card in front and two behind, arrows, swipe, arrow keys, Home and End, and a tap on a card behind. Which player the child gets depends only on which face-down card they open.
- **Face-down.** Each card is the binder's uncollected card back (`CardBack mystery` in `MiniCard.tsx`: "No. ???", the island mark, "???"). Above the card: "2 of 3 · Mystery card · Who's inside? Open a card to find out." The pill reads **"Open this card"**. A foil shine (the PlayerCard turn light's glare band) crosses the front card once on hover (real pointers only).
- **No leaks before the pick.** The deck never renders a name, portrait, number, position or strength. Cards are keyed by place, labelled "Mystery card 1 of 3", and turning the deck announces "Mystery card 2 of 3." No player portrait is requested until the card is chosen (the chosen card's riso masks start loading during the lift, and the other two are never requested). The offer order is saved, so a reload shows the same three backs.
- **The unpack (≈1.4–1.7 s, tap to skip).** The card is granted first (`chooseOfferCard`, once). Then the chosen card lifts forward with the shine crossing it while the other two slide away to their sides (`LIFT_MS` 340 ms, CSS). Then it turns over into the full PlayerCard (`FLY_MS` 1050 ms, half a Y turn): the back speeds into edge-on, the PlayerCard's front takes over there and opens to face the child with a small overshoot. The card's own foil turn light plays at edge-on through a new `glint` prop on `PlayerCard`: the glare sweep on the arriving face, the edge catch light and the sparks, with no flip or lift (the host moves the card). A tap anywhere, or Escape, finishes the unpack at once. It never closes the offer. With reduced motion there's no lift or turn: the reveal crossfades in (180 ms).
- **Reveal as before.** "Added to your binder!", the full PlayerCard with Flip, Play and the bio (position, era and blurb), "See it in my binder", and Done. Only the chosen card is shown; the other two stay unknown and go back into the pool. The unpack now also plays when the pick is opened from the binder pill (before, the dialog closed at once there). A face-down pick with no reveal would hide the card, so now the child sees it and the binder turns to its pocket behind the dialog.
- **Rules unchanged.** There is still no "Choose later", Escape can't skip the offer, and exactly one card is granted, only after a pick. The session-cap rule (none), NPC daily limits and `THEME_ONE_CARD` are unchanged.
- **Phone heat.** The backs are static (no portrait images at all before the pick). The shine, lift, slide-away and turn are one-shot transform/opacity animations. The glint timer is one `setTimeout`, cleared on skip or close. Nothing loops beyond the existing twinkling stars.
- **Checks.** `tests/card-rewards.cjs` has new mystery-card assertions: no identity in the deck, "Mystery card N of 3" labels, one grant call, warm-up only after the pick, tap and Escape skip, reduced motion, the `glint` reveal, and a back with no number or name. The end-to-end run is the session scratchpad's `mystery/m.mjs <w> <h> [reduced|skip|live]`. It seeds one offer and checks that before the pick no name or slug is in the page HTML and no portrait is requested. It then checks the deck turns anonymously, Escape doesn't close, card 2 of 3 is revealed and nothing else, the collection is exactly `[chosen]`, the offer is resolved, the other two portraits are never requested, and there are no page errors. It passed at 390×844, 1280×800, reduced motion and skip.

## Value tiers: the greatest players come later (25 Sep 2026)

User: "We need to keep the cards like Messi, Ronaldo, high-value cards to be only available towards the end of paths." Then: "Make it harder to get. Analyze the cards that have high value and are wanted by fans, and make them harder to get."

### The tiers

Every card has a **fan-demand score** (0–100) and a one-line reason in `lib/town/cardTiers.json`. The score is a **judgement score**, not follower data: it weighs global fame, current superstar status, iconic moments that children know, and the major honours (Ballon d'Or, World Cup, FIFA awards). No web data or follower numbers were used, so nothing is cited. Women's players are scored by their own fans' demand, and futsal players on the futsal community's scale, so each game has its own icons (Falcão, Ricardinho, Marta, Aitana).

The tier is derived from the score, so moving a card is one edit:
- **Icon**: demand 85 or more (34 cards).
- **Elite**: demand 72 to 84 (62 cards).
- **Regular**: the rest (257 cards).

Change a card's `demand`, move the `thresholds`, or pin a card with `overrides` (`"Name": "icon" | "elite" | "regular"`). Players missing from the file count as Regular. The Star and Legend labels (current / all-time) are unchanged; tiers are a separate thing and are never shown on the face-down deck.

**Icon (34):** Cristiano Ronaldo 100, Lionel Messi 100, Kylian Mbappé 96, Pelé 96, Diego Maradona 95, Erling Haaland 94, Lamine Yamal 93, Neymar 92, Ronaldinho 92, Ronaldo Nazário 92, Zinedine Zidane 91, Vinícius Júnior 90, David Beckham 89, Jude Bellingham 89, Falcão 88, Johan Cruyff 88, Marta 88, Mohamed Salah 88, Aitana Bonmatí 87, Ricardinho 87, Zlatan Ibrahimović 87, Alexia Putellas 86, Harry Kane 86, Luka Modrić 86, Mia Hamm 86, Thierry Henry 86, Andrés Iniesta 85, Franz Beckenbauer 85, Gianluigi Buffon 85, Kaká 85, Kevin De Bruyne 85, Ousmane Dembélé 85, Paolo Maldini 85, Sergio Ramos 85.

**Elite (62):** Karim Benzema 82, Manuel Neuer 82, Robert Lewandowski 82, Roberto Carlos 82, Rodri 82, Son Heung-min 82, Alex Morgan 80, Cole Palmer 80, Iker Casillas 80, Luis Suárez 80, Megan Rapinoe 80, Sam Kerr 80, Toni Kroos 80, Virgil van Dijk 80, Wayne Rooney 80, Xavi Hernández 80, Andrea Pirlo 78, Antoine Griezmann 78, Bukayo Saka 78, Cafu 78, Jamal Musiala 78, Manoel Tobias 78, Steven Gerrard 78, Arjen Robben 76, Didier Drogba 76, Eden Hazard 76, Emiliano Martínez 76, Ferrão 76, Marcelo 76, Pedri 76, Roberto Baggio 76, Thibaut Courtois 76, Florian Wirtz 74, Francesco Totti 74, Garrincha 74, Julián Álvarez 74, Lev Yashin 74, Lucy Bronze 74, Luís Figo 74, N'Golo Kanté 74, Romário 74, Trent Alexander-Arnold 74, Zicky Té 74, Achraf Hakimi 72, Alessandro Del Piero 72, Alisson 72, Bruno Fernandes 72, Dani Alves 72, Eusébio 72, Fabio Cannavaro 72, Ferenc Puskás 72, Frank Lampard 72, George Best 72, Guitta 72, Luis Amado 72, Marco van Basten 72, Phil Foden 72, Philipp Lahm 72, Pito 72, Raphinha 72, Sadio Mané 72, Samuel Eto'o 72.

Close to the Elite line (70–71, now Regular): Donnarumma, Kahn, Alphonso Davies, Carlos Alberto, Bobby Moore, Puyol, Thiago Silva, Valverde, Ødegaard, Casemiro, Bobby Charlton, Carli Lloyd, Kvaratskhelia, Nico Williams, Leão, Rivaldo, Lautaro, Osimhen, Hegerberg, Gerd Müller, Di Stéfano, Wambach, Bergkamp, Higuita and Kike Boned. Lowering `thresholds.elite` to 70 would bring them all in (87 Elite).

### How progress unlocks them

**Progress** is the share of starter lessons complete in the child's **furthest path** (futsal, 7v7, 9v9 or 11v11; each has 12 starter lessons in four chapters). It uses the same "complete" rule as the Paths screen (`lessonEvidence`: every quiz question answered correctly, retries allowed; since Sep 26 2026 watching every play step is no longer required, so passing a lesson's quiz unlocks the next stop), read straight from storage (`readPathProgress` in `lib/town/cardTiers.ts`). The optional "Go deeper" lessons don't count toward it.

All the constants are in `lib/town/cardRewards.ts`:

| Constant | Value | Meaning |
|---|---|---|
| `TIER_UNLOCK.elite` | 0.5 | Elite cards can be drawn from 6 of 12 lessons in any path. |
| `TIER_UNLOCK.icon` | 0.8 | Icon cards can be drawn from 10 of 12 lessons, the final chapter. |
| `TIER_WEIGHT` | Regular 1, Elite 0.35, Icon 0.12 | The draw weight of one unlocked card. An Elite card is about a third as likely as a Regular card to be drawn. |
| `MAX_ICONS_PER_OFFER` | 1 | Never more than one Icon among the three (except the path-finish pick). |
| `ICON_TRIGGERS` | path, quiz, journey | The big moments that may offer an Icon: finishing a path, a perfect first-try quiz of 5+ questions, and a Learning Journey stage. A ball, an NPC chat, an Explore item or a story never offers an Icon. |
| `PATH_FINISH_ICON` | true | Finishing a path pays one pick of **Icons only**. |

**Why the furthest path, not the active path.** Tiers unlock when the child has shown mastery once, anywhere. A child who finished futsal and starts 7v7 isn't sent back to the start, and a child who likes one format isn't pushed into another. Most triggers (balls, chats, Explore) belong to no path, so "the active path" often has no answer. The furthest path is also the simplest rule to explain: "the greatest players unlock as you master the game".

**The path-finish pick.** When every starter lesson of a path is complete for the first time, `PathCardWatcher` (in `components/CardOfferHost.tsx`) calls `earnForPath(format)`. The offer holds three face-down Icons, so whichever card the child opens is an Icon: the late, earned treat. It is a guarantee, not a gamble. If fewer than three Icons are missing, it fills with Elite, then Regular. It pays once per path, ever (`path:<format>` in the ledger), and only for paths finished after rewards are on (no catch-up picks). Its reason line is "You finished the Futsal path! The greatest players unlock as you master the game." Finishing the last lesson also pays that lesson's quiz as usual when it was a clean first-try run. Finishing a path is treated as a separate, bigger achievement, and this is an open decision below.

**The draw.** The three face-down cards come only from the **eligible pool**: uncollected cards whose tier is unlocked for this progress and trigger. The pool is weighted by `TIER_WEIGHT`, with at most one Icon. `THEME_ONE_CARD` still picks its matched card from inside the pool, so a goalkeeping quiz early on brings a Regular keeper.

**Small pools, never a lost pick:**
- Fewer than three eligible cards left: the offer shows fewer cards. No locked card is added.
- No eligible card left but locked ones are missing: the offer draws from the lowest locked tier (Elite before Icon). An earned pick is never lost, and one pick per offer still completes all 353 cards (`tests/card-tiers.cjs` simulates this).
- `refreshOffer` follows the same gate: a replacement for a card collected elsewhere never adds a second Icon or a locked card, and a path-finish pick stays all Icons.

**What the child sees:**
- Nothing about tiers appears on the face-down deck, and there are no odds, rarity or "rare" copy before the pick (the approved kid-safety rules). Weights change only *which* new cards are drawn, never how many. There is nothing to buy, and there are no timers or streaks.
- In the binder, a greyed **Icon** card says: "Not collected yet. The greatest players unlock as you master the game. Icon cards appear near the end of a path, and finishing a path always brings one."
- A greyed **Elite** card says: "Not collected yet. Elite cards unlock halfway along a path. Keep learning to meet them."
- Regular cards keep the usual earn line. Names stay real on greyed cards (the earlier decision).

**The learning purpose.** The famous players are the reward for learning the game: roles, support, defending and restarts, lesson by lesson. They are not a reward for grinding balls or chats. The path-finish pick ties the biggest names to the biggest learning milestone.

### Simulation

`node scripts/card-tier-sim.cjs [children]` runs the real draw code (`drawThemedOffer`, `tierGate`, `cardTiers.json`) for 500 simulated children with fixed seeds, so the result is the same every run.

The typical child:
- plays the paths one after another (futsal, 7v7, 9v9, 11v11);
- earns per lesson: one Ball-hunt ball (41 in all), one NPC chat, and a quiz pick 60% of the time (a clean first-try run);
- every third lesson, also earns a Journey stage (18), a story (18) and an Explore item (15);
- picks blindly from the three face-down cards.

Results (25 Sep 2026):

| | Result |
|---|---|
| First Elite | median lesson 9 (the 30th pick) |
| First Icon | median lesson 12 (the 44th pick): 96% at the first path finish, 4% from a quiz or stage just before it |
| After futsal (lesson 12) | ~44 cards; Icons: median 1 (min 1, max 2); Elite: median 2 |
| After 7v7 (lesson 24) | ~88 cards; Icons: median 2 (min 2, max 4); Elite: median 6 |
| After 9v9 (lesson 36) | ~133 cards; Icons: median 3 (min 3, max 6); Elite: median 11 |
| After 11v11 (lesson 48) | ~169 cards; Icons: median 5 (min 4, max 8); Elite: median 15 |

So the first Icon is the first path's finish, and each later path brings its guaranteed Icon, plus about one more every two paths from late quizzes and stages. After all four paths, the rest (29 Icons, ~47 Elite) come from the "Go deeper" lessons, more Journey stages and daily chats. Chats and balls reach Icons only once nothing else is missing.

### Dev and test modes

- `UNLOCK_ALL_CARDS`, `?cards=earn` and `?cards=all` work as before.
- **`?cardpath=85`** (dev builds only, remembered under `fi2-cards-dev-progress-v1`) pretends the furthest path is 85% complete, to preview the gates: 0 shows Regular only, 50 adds Elite, 80+ adds Icons on quizzes and stages. `?cardpath=off` goes back to real progress. It is ignored when `NODE_ENV==='production'`.
- `node tests/card-tiers.cjs` covers:
  - the data;
  - no Icon or Elite before the thresholds, on every trigger;
  - the Elite weight;
  - Icons after 80%, only on big triggers, at most one;
  - the path-finish guarantee and its fallbacks;
  - the small-pool fallback;
  - no duplicates through a full collection;
  - refresh under the gate;
  - the wiring.

### Phone heat

No timers or loops were added. `PathCardWatcher` subscribes to the two stores the Paths screen already uses, and it recomputes only when a step or answer is saved (48 lessons, trivial). `readPathProgress` runs once per earned offer. `cardTiers.json` (~40 KB with the reasons) is parsed once with the card-reward code.

## Coach cards (28 Sep 2026)

User: "add more cards, add top 25 current and all time coaches". 50 coach cards were added, so there are now 450 cards: 373 football cards (50 of them coaches) and 77 futsal cards. (The 353 above predates later player additions; the roster had 400 players on Sep 28.)

- **Data.** The coaches are the `coach` role in `lib/town/positionPlayers.json` (`current`: in a head-coach job in September 2026, checked against club, federation and news sources; `allTime`: legendary coaches). Numbers 401–450 are appended to `cardRoster.json`, so no player is renumbered and saved collections stay valid. Each coach has the same data as a player: blurb and three strengths (`playerProfiles.json`), a drawn look and country (`playerAppearance.json`, all flagged `_uncertain`), the teams coached (`playerCareers.json`, `role: "coach"`, from the Wikipedia manager infobox) and a demand score (`cardTiers.json`). What a coach card teaches is in `lib/town/coachIdeas.json`: one coaching idea in kid language (`idea` + `lesson`, original writing, never a quote), 2–4 career highlights and the sources.
- **Names.** A coach who already has a player card gets a separate key, `"<Name> (coach)"` (Johan Cruyff, Zinedine Zidane, Vincent Kompany). `cardDisplayName` drops the suffix on the card plate, the mini card and the card back; search and lists show the full key so the two cards can be told apart.
- **Binder.** The Futbol binder has a Coaches divider after the goalkeepers (6 pages of 9). Futsal has none.
- **The card.** The front says "Coach" (current) or "Legend" (all-time) and "Coaching now · Head coach" / "All-time great coach · Head coach". The back keeps its three tabs, about coaching: **Style** (the strengths), **Big idea** (the coaching idea, the lesson and career highlights; `coachIdeas.json` loads only when a coach card is turned over) and **Teams** (teams coached). Coach cards have no Play Moment and no highlight clips.
- **Earning.** Coach cards are drawn like any card (balls, chats, quizzes, Explore, Journey, stories, path finish, vending and legend packs that draw from all cards). A football lesson about team shape or tactics (`COACH_WORDS` in `cardRewards.ts`: formation, tactic, game plan, team system, offside trap, Total Football, coach) themes a coach card; futsal lessons keep their futsal cards. Tiers (`cardTiers.json`, judgement scores like the players'): Guardiola is an Icon (85); Ferguson, Ancelotti, Klopp, Mourinho, the Cruyff and Zidane coach cards, Luis Enrique, Wiegman, Wenger and Hayes are Elite; the rest are Regular. The Elite ceiling in `tests/card-tiers.cjs` rose from 71 to 81 for the ten Elite coaches.
- **Portraits.** `scripts/fetch-coach-photos.py` takes each coach's Wikipedia lead photo when it is CC0, public domain, CC BY or CC BY-SA on Commons, crops it on the face and prints the riso masks into `public/players/`, with the credit in `lib/town/playerPhotos.coaches.json`. Coaches may be photographed in a suit or tracksuit (they coach in them). Same politeness as the player batches: one runner, the shared lock-file throttle, one request per 8 s, backing off on 429. Coaches without a usable photo use the drawn riso portrait.
- **Checks.** `node tests/coach-cards.cjs` (lists, numbering, binder section, data completeness, licences, theme).

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
| Path finish (25 Sep) | Every starter lesson of a path is complete for the first time. | `PathCardWatcher` in `components/CardOfferHost.tsx` watches the quest and quiz stores (the Paths screen's own `lessonEvidence` rule) and calls `earnForPath(format)` for a path that wasn't finished on its first run. | Icons only (see "Value tiers"). Reason: "You finished the Futsal path! The greatest players unlock as you master the game." |

### NPC frequency (user decision, 24 Sep)

- At most **one pick per islander per day**.
- At most **`NPC_PICKS_PER_DAY = 3`** NPC picks per day in total (5 until the economy pass, 28 Sep 2026).
- **Packs (economy pass, 28 Sep 2026):** 40 / 60 coins, 3 a day. Learning triggers now also pay coins once ever (`lib/town/learnCoins.ts`: quiz 12 +6 perfect first try, ball 5, story 10, journey stage 8, explore 5, path 75). Packs apply a light Icon gate: Icons are left out of every slot except the guaranteed mental-strength legend until `tierGate(progress,'quiz').icon`; a pack stays on sale while it can give one new card and tops up empty slots with other missing cards, so the last Icons can always be earned ([vending-machines.md](vending-machines.md#economy)).
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

**No per-session cap** (removed Sep 25 2026). The old `MAX_OFFERS_PER_SESSION = 6` silently skipped the 7th achievement in a visit, and a ball can only be found once, so the child lost a card they had earned (reported by the user). Every trigger is already one-time (balls, quizzes, Explore items, Journey stages, stories) or capped per day (NPC chats, 5), so there is nothing to spam.

### Explore checklist: six more items (30 Sep 2026, game-audit G-13)

The checklist grew from 16 to 22 items. The new ones and what counts:
- **Catch a fish:** a Fishbook catch.
- **Finish an island job:** any job in the jobs ledger.
- **Sell to Rosa:** a market sale.
- **Visit Coral Cay:** being on the cay, on any ride.
- **Walk the East Jetty:** on the jetty, not flying over it.
- **Step into a Konbini:** opening `/konbini`.

How they are recorded:
- The fishing, jobs and market stores fire `lib/town/exploreSignals.ts` (dependency-free).
- The two places are checked by `lib/town/exploreZones.ts` from Town's existing frame callback. It checks at most twice a second and switches off once both are done.
- Existing saves count from the stores' own keys (`evidenceFromSaves`). The watcher's first-run baseline means they are not paid retroactively.

Rewards follow the existing rules:
- Fish, job and Rosa take effort, so they pay 5 learning coins once plus a pick.
- Coral Cay, the jetty and a Konbini are visits, so they tick off and pay nothing, like visiting a field (`NO_CARD_EXPLORE`).

## Kid-safety guardrails

- **Blind, but nothing to lose.** Since 25 Sep 2026 the cards are face-down (user request). Every card offered is new to the child, so any pick is a good pick; no odds or rarity are shown before the pick, and Star and Legend appear as text labels only after the reveal.
- **No time pressure.** There are no timers, and there is no "limited" or "expiring" copy.
- **No return nudges.** There are no streaks, daily login bonuses or notifications.
- **Nothing to buy.** There is no currency, no trading, and no purchase anywhere near the cards.
- **Nothing is taken away.** Earned picks stay pending until the child uses them. Nothing expires, and cards are never removed.
- **Calm stops.** Each offer ends with "Done" (the collection-complete note with "Keep playing"), and nothing moves on automatically.
- **Learning preview earns nothing.** `isLearningPreview()` and FieldLearning's own preview guard both block rewards.
- **Accessibility:**
  - It is a real modal `<dialog>` with a Tab focus trap, and focus goes back to where it was.
  - The Choose pill takes focus. Arrow keys, Home and End turn the deck (announced politely as "Card 2 of 3: …"), and Enter or Space on Choose chooses. The front card is a labelled group, and the cards behind are pointer shortcuts hidden from screen readers (the arrow buttons do the same).
  - Escape does nothing until a card is chosen. After the reveal, focus starts on Done, and Escape works like Done (a playing film is stopped first, and only the film).
  - The sheet's handle is a button ("Hide" / "Show [name]'s note", with `aria-expanded`); tucked away, the sheet's content is `inert`, so it leaves the tab order.
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
  - Also in `cardRewards.ts`: `THEME_ONE_CARD` (true), `NPC_PICKS_PER_DAY` (5).
- **Dev switch (`cardDevEarn`):**
  - `?cards=earn` turns unlock-all off and rewards on in that browser. It is remembered under `fi2-cards-dev-v1`.
  - `?cards=all` switches back.
  - It is ignored whenever `NODE_ENV==='production'`, so production behaviour is unchanged.

## Code map

| File | Role |
|---|---|
| `lib/town/cardRewards.ts` | Pure rules and constants: draw, refresh, theme, NPC day rules, sanitize and merge, and the value-tier rules (`TIER_UNLOCK`, `TIER_WEIGHT`, `ICON_TRIGGERS`, `PATH_FINISH_ICON`, `tierGate`). Tested in Node. |
| `lib/town/cardTiers.json` + `cardTiers.ts` | Fan-demand scores, reasons and thresholds per card; `cardTier`, the furthest-path progress (`readPathProgress`, `pathProgressFrom`) and the `?cardpath` dev preview. |
| `lib/town/cardRewardStore.ts` | Client store (`useSyncExternalStore`): `earnCardOffer`, `chooseOfferCard`, `markOfferSeen`, `liveOffer`, and the events. |
| `lib/town/cardRewardTriggers.ts` | `earnForBall` / `earnForNpc` / `earnForQuiz` / `earnForExplore` / `earnForJourney` / `earnForStory` / `earnForPath`, `quizEligibleForCard`: the reason lines and themes. |
| `components/CardOfferHost.tsx` | Mounted in Town. Hosts the Explore watcher and the journey-stage listener. Renders nothing until an offer exists. It opens fresh offers when the island is calm and sleeps the 3D scene while one is open (`settingsRef`). |
| `components/CardOffer.tsx` + `.module.css` | The modal: the deck of face-down mystery cards (`CardBack mystery`), the unpack, then the lazily loaded PlayerCard reveal. The reveal uses the binder viewer's own classes (`CardCollection.module.css` `.viewer`, `.viewerBar`, `.viewerFlip`, `.cardHost`, with `DoneButton` and `navStyles`), so it matches the viewer exactly; only the room left for the bottom sheet (`--sheet-room`, measured by a ResizeObserver) is added to the viewer's `--card-w`. The deck reuses the dark scrim, the cream note card, the gold paper pill and the dock's round yellow arrows. |
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
  - turning the deck is one 0.3 s transform transition, choosing is a 0.24 s fade plus the one-shot spin, the bottom sheet slides up once (0.3 s) and on each Hide / Show (0.24 s, transform only), Done shrinks once (0.24 s), and the revealed PlayerCard's scenery loops are held still. The card re-sizes at once when the sheet is tucked away (no animation). There is no endless animation in the dialog, and nothing moves with reduced motion.
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
   - the end-to-end runs in the session scratchpad: `reveal2/r.mjs <w> <h> [reduced]` (the reveal: top bar order and position, no count line, sheet up / tucked / restored / swiped, no overlap with the card, header Flip, Play/Escape, focus trap, Done shrink and close, Escape closes, island asleep, nothing running at rest), `pickcard/ui.mjs <w> <h> [reduced]` (the deck; its reveal checks predate the viewer layout) and `pickcard/bg-probe.mjs <w> <h> [ball|paths]` (what runs behind the offer). Also `card-rewards-e2e.mjs` and `cr-more.mjs` for the triggers; `card-rewards-e2e.mjs` still expects the old three-across layout and "Choose later".

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
3. **Value tiers (25 Sep):**
   - Check the Icon and Elite lists in `cardTiers.json`; the scores are judgement calls.
   - The path-finish pick is a separate pick on top of the last lesson's quiz pick. Keep it that way, or fold it into that quiz pick? The alternative is `PATH_FINISH_ICON=false`, where a path finish is only a big trigger and Icons stay a rare draw.
   - Should Journey stages stay a big (Icon) trigger?

**Coach job verification (Sep 28):** all 25 current coaches' clubs and national teams match the `currentclub` field of their English Wikipedia infobox, checked through the Wikipedia API one request every 5 s. Spain's 2026 World Cup title matches the `champion` field of the 2026 FIFA World Cup article. The highlights for Lippi, Trapattoni and Zagallo, first written from memory, were checked against their records. The 10 coaches without a free-licence photo keep the drawn portrait.
