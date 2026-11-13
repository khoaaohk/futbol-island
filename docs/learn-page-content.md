# /learn marketing hub: content (Nov 2 2026)

> **Nov 3 2026 (owner): this page is now the HOME page, https://futbolisland.app/ (`app/(site)/page.tsx`).** `/learn` is a permanent (308)
> redirect to `/`; the game (title screen, save code, island) moved from `/` to **/play** (`app/play/page.tsx`), and every Play button
> on the site goes to `/play`. Old game links to `/?from=…`, `/?panel=…`, `/?party=…` … redirect to `/play` with the same query
> (`next.config.mjs`). The lesson index stays at `/learn/lessons`. Checks: `tests/learn-page.cjs`, `tests/seo-pages.cjs`, `tests/landing.cjs`.

Research and copy for the new **futbolisland.app/learn** page: every feature a player can use today and how each one ties to football.
Audience: parents and coaches first (they decide), kids second. The page itself is built later by another agent; the current SEO lesson
index (`app/(site)/learn/page.tsx` + `[slug]`) is planned to move to `/learn/lessons`.

- **Source of truth:** `lib/site/learnFeatures.ts` (`LEARN_FEATURES`, `LEARN_GROUPS`, `LEARN_FAQ`, `LEARN_HERO`, `LEARN_TOGETHER_TRUST`, `LEARN_TOGETHER_NOT`). This doc mirrors it word for word; change the data file first, then this doc.
- **Checks:** `tests/learn-content.cjs` (in `npm test`): field presence and lengths, unique ids / image keys, valid groups, no hype words or emoji, and every number in a proof line recomputed from the game data.
- **Images:** each `imageKey` is a screenshot to capture to `public/learn/<imageKey>.webp` (one phone + one desktop per feature is enough).
- **Left out on purpose:** the cave game and underground world (paused/removed), the old 2D arcade games (deleted Oct 26), Rooftop Knockout (no UI entry found in components), the Summit Ball Cannon and painting easel (fun only, no football tie in the code), island music (one soundtrack, no football tie), video clips at news desks (outside content; left for the owner to decide).
- **`verify` notes** (never rendered) mark what the repo alone cannot prove is live in production: Play with friends needs `NEXT_PUBLIC_MULTIPLAYER=1` + the relay URL on Vercel, and some friend features need a given relay version.

## Hero

**Explore Futbol Island. Learn the game.**

Futbol Island is a free football learning game for kids aged 7 to 12. They explore an island and learn positions, team shape and the Laws of the Game in 7v7, 9v9, 11v11 and futsal, one short lesson at a time.

Trust points:
- Free, with no ads, and coins are earned by playing, never bought
- No accounts and no chat: a save code with no personal details
- Built in San Diego with White Sports Ventures and local non-profits

Button: Start Playing

## Groups

| id | Title | Blurb | Features |
|---|---|---|---|
| `learn` | Learn the game | Short lessons on a moving pitch, a coach who explains each step, and a quiz that checks the idea. | 6 |
| `explore` | Explore and discover | Every corner of the island hides a football idea: in a ball, a sea animal, a bug or an islander. | 12 |
| `play` | Play and practise | Games and challenges that each train one real skill, from the first touch to picking a corner. | 6 |
| `together` | Play together | Private parties for friends who know each other: same island, own kits, football calls instead of chat. | 7 |
| `collect` | Collect and read | Cards, books and costumes that carry real football history, earned by playing and learning. | 4 |
| `yours` | Make it yours | Design a kit, pick a number and travel the island your way. | 3 |
| `safe` | Safe and simple | Free, no ads, no chat, no accounts, and a place for grown-ups to see progress and practise. | 5 |

## Learn the game

Short lessons on a moving pitch, a coach who explains each step, and a quiz that checks the idea.

### Four learning paths

*Learn 7v7, 9v9, 11v11 and futsal, one short lesson at a time.*

Each path follows the format a child actually plays, from small-sided 7v7 up to 11v11, plus futsal. Lessons build in chapters, so the next idea always sits on the last one.

- **Football tie:** Positions, team shape and decisions for each format: where to stand, when to pass and how a team keeps its shape.
- **Where:** Tap Paths on the island. The 7v7 path comes first, and the others are open as tabs.
- **Proof:** 96 lessons with 486 quiz questions across 4 formats.
- **id / image:** `learning-paths` / `learning_paths`

### Watch it, then prove it

*Players move on a real pitch while the coach explains every step.*

A lesson plays out with moving players, and a coach voice talks through each step. A quick quiz follows, and a lesson only counts once every question is answered right.

- **Football tie:** Seeing the idea in motion first, then checking it, the way a coach shows a pattern on the field before asking players to run it.
- **Where:** Open any stop on a path in Paths, then tap through the steps and the quiz.
- **Proof:** Each path has 12 starter lessons, and a lesson counts only when its whole quiz is right.
- **id / image:** `lesson-quiz` / `lesson_quiz`

### Story films

*Short films about grit, nerves and handling a loss.*

Story films sit between the lessons on each path, painted and narrated. They cover the side of football that drills skip, like staying calm when a game feels unfair.

- **Football tie:** The mental game: mental toughness, regulating emotions, grit, empathy and how to handle a loss.
- **Where:** Story stops appear along each path in Paths; some open the path and some unlock as lessons are passed.
- **Proof:** 22 narrated story films across the four paths.
- **id / image:** `path-stories` / `path_stories`

### Daily warm-up

*Old quiz questions come back, just as they are about to slip.*

The warm-up brings back questions from lessons a child has already passed, spaced out over days. A few minutes of recall keeps an idea from fading.

- **Football tie:** Remembering the ideas from earlier lessons, so they are ready when a real game needs them.
- **Where:** When lessons are due, the Review card in Paths opens the warm-up.
- **Proof:** Only questions from quizzes already passed come back, spaced over days.
- **id / image:** `warm-up` / `daily_warm_up`

### Watch live island matches

*Island teams play real formats, and you spot the idea you learned.*

Computer-run matches play on the island pitches with each format's own rules. A Spot it prompt asks the player to find an idea from a lesson they have learned while the match runs.

- **Football tie:** Applying a lesson to a real game: recognising support, width or a passing lane as play moves.
- **Where:** Walk up to a pitch where a match is on, such as the Old Town Ground.
- **Proof:** Spot it only asks about lessons the player has already learned.
- **id / image:** `live-matches` / `live_match_spot_it`

### Graduate each path

*Finish a path, get a certificate, then board the Matchday Ferry.*

Finishing a path holds a graduation with a certificate that lists the lessons learned. When all four paths are done, the Matchday Ferry opens for the final day.

- **Football tie:** A clear finish line for each format, so a child can see what they now understand.
- **Where:** Graduation opens when a path is complete; certificates live on the Trophy shelf in the backpack.
- **Proof:** A certificate lists the 12 lessons learned and carries no name, age or photo.
- **id / image:** `graduation` / `graduation_ferry`

## Explore and discover

Every corner of the island hides a football idea: in a ball, a sea animal, a bug or an islander.

### The hidden-ball hunt

*Find a hidden ball, and it teaches you one football idea.*

Balls are tucked away on rooftops, beaches and corners of every island. Each one opens a short animated mini lesson with a practice prompt.

- **Football tie:** One idea per ball, from rules and skills to history, each drawn on a small pitch diagram.
- **Where:** Explore the main island, Coral Cay, Summit Isle and the East Jetty; the map tracks what is found.
- **Proof:** 128 hidden balls, each with its own mini lesson.
- **id / image:** `ball-hunt` / `ball_hunt`

### Reef treasure balls

*Dive to a treasure chest and find a football inside.*

Each Explore reef zone hides one ball in its open treasure chest. Picking it up plays a mini lesson about a real football fact, then offers a card choice.

- **Football tie:** Little-known football facts, like the oldest ball ever found and the game of cuju in ancient China.
- **Where:** Swim out to an Explore reef zone, tap Dive, and look for the open chest.
- **Proof:** 7 reef zones, 7 hidden balls, 7 mini lessons that repeat no other lesson.
- **id / image:** `reef-balls` / `reef_balls`

### Swim, dive and ride

*Swim the reefs and hang on to a manta ray or a whale shark.*

The sea around the islands is open to swim, with reef zones to dive into and sea life to meet. Near a manta ray or a whale shark, a Hang on button pulls the player along.

- **Football tie:** The reefs are where the reef balls and sea finds are, so swimming is how a child reaches those football facts.
- **Where:** Walk into the sea from any beach; tap Dive at a reef zone and Hang on near a manta ray or whale shark.
- **Proof:** 2 sea animals to ride: the manta ray and the whale shark.
- **id / image:** `swim-dive` / `swim_dive`

### Fishing and the Fishbook

*Every sea animal you catch links to a real club fact.*

Fishing on the island is calm and quick, and every catch goes into the Fishbook. Each animal page says which real club, team or football story it is linked to, with a source credit.

- **Football tie:** Club history and culture, plus a goalkeeper lesson: stay set, do not bite on a feint, then react fast.
- **Where:** Head to a fishing spot on the shore or a boat; the Fishbook opens from fishing.
- **Proof:** 97 sea animals to catch, 11 of them legendary (Nov 6 2026: wave 1 of the signature species).
- **id / image:** `fishing` / `fishing_fishbook`

### Bug Squad

*Catch bugs that each play a position, like the Goalie Ladybug.*

The Bug Squad job hands the player a net to catch bugs in the meadows and gardens. Every bug plays one position and brings true football stories in the Bug Book.

- **Football tie:** Positions and their jobs: the Goalie Ladybug, for example, teaches that only the keeper may handle the ball, and only in their own area.
- **Where:** Pick up the Bug squad job from a job board; the Bug Book opens from the job.
- **Proof:** 20 bug species, each tied to a position.
- **id / image:** `bug-squad` / `bug_squad`

### Beachcombing

*Pick up shells and starfish, each with a football tip.*

Sparkles on the sand show a find to pick up and sell at the market stand. Every find goes into the Shellbook with a sea fact and a football tip.

- **Football tie:** Short football tips, one per find, alongside a true sea fact.
- **Where:** Walk the beaches on every island and tap a sparkle to pick it up.
- **Proof:** 13 kinds of beach finds in the Shellbook.
- **id / image:** `beachcombing` / `beachcombing`

### The History Museum

*Walk the halls of football history, from 1863 to VAR.*

The museum holds exhibits on the Laws of the Game, World Cup history, balls and kits, legends and the science of the game. Many open into hands-on experiences, and each one ends with a way to take it to your game.

- **Football tie:** Where the rules came from and why: offside, the penalty kick, throw-ins, free kicks, and how the game spread.
- **Where:** Tap Enter History Museum at the museum building on the island.
- **Proof:** 22 exhibits in 7 galleries.
- **id / image:** `history-museum` / `history_museum`

### The Konbini

*A walk-in corner shop with football magazines on the shelves.*

The Konbini is a small shop to walk into, with snacks, a cashier with tips and a ball for keep-ups. Its magazines and cashier facts teach the Laws and long-settled football history, each with sources.

- **Football tie:** Laws of the Game facts and tournament history, read in short magazine pages.
- **Where:** Tap Enter the Konbini on the main island, or its sister shop on Coral Cay.
- **Proof:** 8 football magazines on the shelves.
- **id / image:** `konbini` / `konbini`

### Talk to the islanders

*Coaches, fans and players with football stories to share.*

Walk up to an islander and tap Talk to pick a question from their topics. Every islander has a role and a personality, and the talk always comes back to football.

- **Football tie:** Coaching ideas, positions, club culture and what different people love about the game, with no typing.
- **Where:** Walk close to anyone on the island; the nearest one shows a name tag and a Talk button.
- **Proof:** 194 islanders to meet.
- **id / image:** `islanders` / `islanders_talk`

### Quick challenges

*Islanders ask a one-tap football question with three answers.*

Some conversations end in a quick challenge with three options and one right answer. Right or wrong, the islander explains why in one short line.

- **Football tie:** Fast football decisions and rules, checked in a few seconds and explained right away.
- **Where:** Talk to islanders; each one has their own set of challenges, and each area adds more.
- **Proof:** 797 quick challenges across the islanders and areas.
- **id / image:** `quick-challenges` / `quick_challenges`

### Bubbles and banter

*Walk past and hear islanders think out loud about football.*

Islanders say short lines as a player passes, and pairs chat with each other. It makes the island feel alive while staying calm on screen.

- **Football tie:** Small football thoughts in passing, the way players talk about the game on the touchline.
- **Where:** Walk slowly near islanders anywhere on the island.
- **Proof:** At most 2 speech bubbles show at once, so the screen stays calm.
- **id / image:** `bubbles-banter` / `bubbles_banter`

### Real scores from islanders

*Ask a fan on the island about last weekend's results.*

A few islanders keep up with real leagues and share recent verified results. The game's server fetches the scores, so a player's device never contacts a sports site.

- **Football tie:** Following real football: leagues, results and fixtures, told as short match stories.
- **Where:** Talk to the islanders who follow a league and pick the scores topic.
- **Proof:** Results come from 10 leagues, and only finished, verified scores are shared.
- **id / image:** `island-news` / `island_news`

## Play and practise

Games and challenges that each train one real skill, from the first touch to picking a corner.

### The Arcade

*Five football games, one skill each.*

The Arcade has Island Strikers, Breakaway Run, Futbol Tennis, Futbol Pinball and Pass Puzzles. Each cabinet names the one skill it trains, and coins from the arcade spend at the vending machines.

- **Football tie:** One skill per game: pass, move and finish; beat the tackle; control the first touch; read the rebound; see the space.
- **Where:** Tap Enter Arcade at the arcade building on the island.
- **Proof:** 5 arcade games, each with its own skill line.
- **id / image:** `arcade` / `arcade`

### Pass Puzzles

*Draw the pass that splits the defence.*

Each puzzle freezes a moment in a match, and the player draws the pass with a finger. Packs build from first passes to beating the press, set pieces and wind and rain.

- **Football tie:** Seeing space, timing a run and choosing the pass, including staying onside.
- **Where:** In the Arcade, at the Pass Puzzles cabinet.
- **Proof:** 46 puzzles in 12 packs.
- **id / image:** `pass-puzzles` / `pass_puzzles`

### Beach soccer on Coral Cay

*Watch a live beach match with a guide to its own rules.*

A beach soccer match plays on the Sharks Beach court on Coral Cay. A guide shows what to watch for and asks a quick question about the beach rules.

- **Football tie:** How beach soccer differs from the grass game, with rules that match what the Coral Cay islanders say.
- **Where:** Travel to Coral Cay and walk up to the Sharks Beach court.
- **Proof:** The guide pairs what to watch for with a short beach rules quiz.
- **id / image:** `beach-match` / `beach_match`

### Keep-ups and sky kicks

*Juggle the ball, then hold to send it sky high.*

The player can juggle the ball anywhere on foot, and a counter keeps the score. Holding the button sends it high in the air, and a red mark shows where it will land.

- **Football tie:** Ball control and reading the flight of a high ball to get under it.
- **Where:** Anywhere on foot with the ball, and inside the Konbini.
- **Proof:** A live counter on screen shows the streak of touches.
- **id / image:** `keep-ups` / `keep_ups`

### Island jobs

*Flag the offside, set out the cones, be the ball kid.*

Job boards around the island offer short jobs that pay coins. Each job is a real task around a football ground, with a coach tip on what it teaches.

- **Football tie:** Matchday work and the rules behind it: offside flags, cone drills, wall rebounds, goal anchors and pitch markings.
- **Where:** Look for job boards on the island and tap one to start.
- **Proof:** 14 island jobs, one at a time.
- **id / image:** `island-jobs` / `island_jobs`

### Summit Kick

*Hit the target hoops in the corners of the goal.*

At the top of Summit Isle, an empty five-a-side pitch has hoops in the corners of the goal. A hoop only counts from behind the chalk line, a real shooting distance.

- **Football tie:** Picking a corner: keepers stand in the middle, so the hardest shots to save go low or high into the corners.
- **Where:** Travel to Summit Isle and climb to the small pitch at the top.
- **Proof:** The hoops sit in the four corners and under the bar.
- **id / image:** `summit-kick` / `summit_kick`

## Play together

Private parties for friends who know each other: same island, own kits, football calls instead of chat.

**For grown-ups:**
- A grown-up check comes before starting or joining every party.
- Grown-ups can switch Play with friends off in Settings, behind the same check.
- No chat of any kind: friends talk with preset football calls and emotes.
- First name only, letters only, shown only to the party and never stored.
- Private parties by code, never with strangers: no lobbies and no friend lists.

**Deliberately not there:**
- No free text chat and no voice chat
- No public lobbies, matchmaking or browsing other parties
- No accounts, friend lists, email or phone numbers
- No trading, gifting or shared coins
- No scores against each other

### Play with friends

*Invite friends to your island with a private code.*

A grown-up starts a party, and friends who have the code join the same island at the same time. Everyone keeps their own island, save and coins, and friends are drawn on top.

- **Football tie:** Learning beside teammates: friends explore, call for the ball and celebrate together, the way a team does.
- **Where:** Tap Play with friends on the island, or Join friends on the title screen.
- **Proof:** Up to 20 players in a party, and a code takes new friends for 8 hours.
- **id / image:** `party-start` / `friends_party`
- **How to play with a friend in 3 steps:**
  1. A grown-up taps Play with friends and passes the grown-up check. (`friends_step_start`)
  2. Type your first name, start a party and share the 6-character code or link. (`friends_step_code`)
  3. Your friend taps Join friends, types the code and their first name, and appears on your island. (`friends_step_join`)
- **Verify before publishing:** Play with friends shows only when NEXT_PUBLIC_MULTIPLAYER=1 and the relay URL are set on Vercel; confirm both in Production before publishing this group.

### See your friends

*Friends appear in their own kit, colour and first name.*

Each friend shows in their own look with a colour ring and their first name above their head. Friends also show on the map, so it is easy to meet up.

- **Football tie:** Kits make players easy to find, the same reason teams wear colours and keepers wear a different shirt.
- **Where:** Once a party is on, friends appear on the island and on the map.
- **Proof:** Every friend in a party of up to 20 gets their own colour.
- **id / image:** `friends-kits` / `friends_kits`
- **Verify before publishing:** Kit Shop jersey, boots and ball designs on friends need relay v1.7 deployed; without it friends show their own colours only.

### High fives and handshakes

*Ten football emotes, from Well played to Pass it.*

Emotes are football calls and celebrations: Wave, High five, Cheer, Pass it, Juggle with me, Well played, Laugh, Dance, Thanks and Show off. Each has its own version when flying, swimming or riding, and paired emotes play as whole-body handshakes.

- **Football tie:** Respect and communication on the pitch: thanking a teammate, saying well played and calling for a pass.
- **Where:** Tap the emote button on the island; it works with friends and with nearby islanders.
- **Proof:** 10 emotes and 20 handshake routines, including 10 different high fives.
- **id / image:** `friends-emotes` / `friends_high_five`

### Pass and juggle together

*Ask a friend to pass or juggle, and play it out together.*

Pass it and Juggle with me send a friend a request, and when they tap Yes both players play the routine with their balls. A friend can also bump into you or knock you over with a gentle ball, all in fun.

- **Football tie:** Passing and receiving with a partner, the first thing any two players do at practice.
- **Where:** Stand near a friend on foot and pick Pass it or Juggle with me from the emotes.
- **Proof:** A friend has to tap Yes before a shared routine starts.
- **id / image:** `friends-ball` / `friends_ball_duet`
- **Verify before publishing:** Shared ball routines need relay v1.4 and ball knock-overs relay v1.6; confirm the deployed relay version.

### Together indoors

*Walk the Konbini, Museum, Arcade and Kit Shop with friends.*

Friends stay in the party when they step inside, and they see each other in the Konbini, the History Museum, the Arcade hall and the Kit Shop. Arcade games themselves are played one at a time, and the friend list shows who is playing what.

- **Football tie:** Talking through an exhibit or a kit together, then trying it out on the island.
- **Where:** Enter any of those buildings while a party is on.
- **Proof:** Friends share the Konbini, Museum, Arcade hall and Kit Shop floor.
- **id / image:** `friends-rooms` / `friends_indoors`

### Ride and fly together

*Scoot, bike, fly and swim side by side.*

A friend on a scooter, bike or moped shows on their ride, and flying and swimming friends move with you. Emotes switch to their flying, swimming or riding versions on the go.

- **Football tie:** Travelling the island as a group to find balls, lessons and matches together.
- **Where:** Ride, fly or swim anywhere on the island while a party is on.
- **Proof:** Scooter, bike and moped rides show on friends.
- **id / image:** `friends-ride` / `friends_ride`

### Grown-ups stay in charge

*A grown-up check, an off switch and host controls.*

Starting or joining a party always passes a grown-up check, and a grown-up can turn Play with friends off in Settings. The host can remove a friend, lock a name or make a new code, and anyone can hide or mute a friend.

- **Football tie:** Fair play and looking out for each other, built into how a party works.
- **Where:** Settings, behind the grown-up check: Play with friends, Allowed or Off.
- **Proof:** First names are letters only, up to 12, and never stored; codes are 6 characters.
- **id / image:** `friends-safety` / `friends_controls`

## Collect and read

Cards, books and costumes that carry real football history, earned by playing and learning.

### Player cards and binder

*Collect current stars, all-time greats, futsal players and coaches.*

Cards come as rewards for learning and from card packs, and they fill a binder with pages to turn. Each card shows the position, country, strengths and career.

- **Football tie:** Positions and roles through real careers, plus the coaches behind famous teams.
- **Where:** Open Cards from the island menu; new cards are offered after lessons and hidden balls.
- **Proof:** 450 cards, including 50 coaches.
- **id / image:** `player-cards` / `card_binder`

### Pop-up books, read aloud

*True stories of players who kept going, read aloud.*

Each pop-up book tells a true story of a footballer overcoming hardship, with a narrator reading every page. A book check afterwards links the story back to a lesson.

- **Football tie:** Resilience and practice habits, plus a "take it to your game" idea at the end of each book.
- **Where:** Buy books with coins at the vending machines; they stay in the backpack to reread.
- **Proof:** 37 narrated pop-up books.
- **id / image:** `pop-up-books` / `pop_up_books`

### Vending machines

*Spend the coins you earn on cards, balls and rides.*

Vending machines around the islands sell card packs, balls, rides and island animals for coins. Every machine also has a Specials row sold only there, which gives a reason to explore.

- **Football tie:** Every card in a pack carries a football lesson, and coins come from playing and learning.
- **Where:** Walk up to a vending machine and tap Go to the vending machine.
- **Proof:** 14 vending machines across the islands.
- **id / image:** `vending` / `vending_machine`

### Club animal costumes

*Dress as a club's animal and learn the story behind it.*

Costumes are island animals inspired by real clubs and their nicknames or mascots, in the club's home colours. Each one explains the club, its mascot and the true story behind the link, kept apart from island fiction.

- **Football tie:** Club culture: where nicknames and mascots came from and what they mean to fans.
- **Where:** Costumes unlock as hidden balls are found and are worn from the wardrobe.
- **Proof:** 23 club costumes; every 10 hidden balls found unlock 3 more.
- **id / image:** `club-costumes` / `club_costumes`

## Make it yours

Design a kit, pick a number and travel the island your way.

### Kit Shop studios

*Design your own ball, boots and jersey.*

The Kit Shop has a ball studio, a boot studio and a jersey studio, and a child can even draw their own ball design. What they make dresses their island player.

- **Football tie:** Kit basics and what shirt numbers mean, explained under the number picker.
- **Where:** Tap Enter KIT SHOP at the shop building on the island.
- **Proof:** 3 studios: ball, boots and jersey, with a draw-your-own ball design.
- **id / image:** `kit-shop` / `kit_shop`

### Your name on the back

*Pick a number and put a name on the back of your shirt.*

The jersey studio prints a name and number on the back, with a choice of font and outline. Party friends see the shirt and its number, but never the printed name.

- **Football tie:** Squad numbers and positions: why a 9 is often the striker and a 2 a right-back.
- **Where:** In the Kit Shop, open the jersey studio.
- **Proof:** Under the number picker, each classic number gets a one-line tip about the position.
- **id / image:** `jersey-back` / `jersey_back`

### Scooters, bikes and flight

*Unlock new rides by finishing learning paths.*

The island has scooters, bikes, mopeds and a jetpack for flying between islands, plus a zipline from Summit Isle to Coral Cay. Each finished path unlocks the next ride in every ride type.

- **Football tie:** Learning comes first: rides open up as paths are finished, so progress on the pitch moves you around the island.
- **Where:** Pick a ride from the travel controls; more are sold at vending machines.
- **Proof:** 4 ride types: scooter, bike, moped and flight.
- **id / image:** `rides` / `rides`

## Safe and simple

Free, no ads, no chat, no accounts, and a place for grown-ups to see progress and practise.

### Free, with no ads

*Nothing to buy and no ads, ever.*

Futbol Island costs nothing to play and shows no advertising. Coins are earned by playing and learning, never bought with real money.

- **Football tie:** Learning the game should not cost money; club soccer already prices too many kids out.
- **Where:** Everywhere in the game. Donations to local non-profits sit behind a grown-up check.
- **Proof:** No ads, and coins cannot be bought.
- **id / image:** `free-no-ads` / `free_no_ads`

### Save code, not an account

*Three football words and a number keep your island safe.*

Instead of an account, each player gets a save code made of three football words and a number. Typing it on another device loads the same island.

- **Football tie:** Even the code is football: words like striker, volley and corner.
- **Where:** Made when a new player starts; it is under My save code in Settings.
- **Proof:** The code is made at random and carries no personal details.
- **id / image:** `save-code` / `save_code`

### For grown-ups

*See progress and get real practice ideas for the backyard.*

Behind a grown-up check, the For grown-ups page shows lessons understood and prints a one-page progress report. It also suggests short practice activities tied to the lessons a child has explored.

- **Football tie:** Taking the island's lessons onto real grass with a ball, a few cones and one grown-up.
- **Where:** Settings, then For grown-ups, behind the grown-up check.
- **Proof:** 11 backyard or park activities, each needing at most a ball and a few cones.
- **id / image:** `grown-ups` / `grown_ups`

### Coaches Centre

*Pick one "I can" goal, practise it, and talk about how it went.*

The Coaches Centre holds a simple football plan with one or two goals made from fixed lists. It can be printed for a coach, and it never scores, ranks or compares children.

- **Football tie:** Individual development: a clear goal, practice linked to lessons, and a talk about progress.
- **Where:** Tap Enter Coaches at the coaches building on the island.
- **Proof:** Typed notes stay on the device and are never uploaded.
- **id / image:** `coaches-centre` / `coaches_centre`

### Plays in the browser

*Phone first, with nothing to download.*

The game runs in the web browser on phones, tablets and computers. There is no app to install and no sign-up.

- **Football tie:** Ten minutes between practices is enough for a lesson and a quiz.
- **Where:** Open futbolisland.app in any modern browser.
- **Proof:** Made for phones first, with a battery saver in Settings.
- **id / image:** `phone-first` / `phone_first`

## FAQ for parents

**Is Futbol Island free?**

Yes. It is free to play, and there is nothing to buy. The island's coins are earned by playing and learning, never bought with real money. Donations to local non-profits are optional and sit behind a grown-up check.

**Are there ads?**

No. The game shows no advertising, and it uses its own visit counter with no cookies and no third-party analytics.

**Can my child chat with other people?**

No. There is no free text chat and no voice chat. Islanders are part of the game and talk through preset topics a child taps. Play with friends uses preset football calls and emotes only.

**Does my child need an account?**

No. Each player gets a save code of three football words and a number instead. The code is made at random and carries no personal details. Typing it on another device loads the same island.

**What ages is it for?**

Kids aged about 7 to 12, and the parents, carers and coaches who help them. The 7v7 path comes first because it is the simplest.

**What devices does it work on?**

It plays in the web browser on phones, tablets and computers, with nothing to download. It is made for phones first and needs an internet connection to load.

**How does it actually teach football?**

Every idea is shown on a pitch with moving players, explained by a coach voice step by step, and checked with a quick quiz. A lesson only counts once every question is right, and a daily warm-up brings passed questions back so they stick. The rest of the island ties back to the lessons, from hidden balls to live matches.

**Who made it?**

Futbol Island is built in San Diego in partnership with White Sports Ventures, founded by former U.S. Men's National Team player Jeremiah White III. It also works with the local non-profits FC YAP, Street Soccer San Diego and Ronin Futsal.

**What data does it collect?**

Most progress lives only in the browser on the device. With a save code, the allowlisted progress is saved against a scrambled version of the code, never a name or email. The game also counts anonymous usage totals to run and improve it and to show sponsors combined totals; nothing is sold, and nothing about an individual child is shared. The privacy policy explains what is kept and for how long.

## FAQ: Play together

**How do friends play together?**

A grown-up taps Play with friends, passes the grown-up check and starts a party. Friends join with the 6-character code or a share link, type their first name and arrive on the same island. Up to 20 players can be in one party.

**Can strangers join, or can kids message each other?**

Parties are private and join by code only: there are no public lobbies, matchmaking or friend lists. A code takes new friends for 8 hours, and the host can make a new code or remove someone at any time. There is no chat; friends use preset football calls and emotes.

**Can I turn Play with friends off?**

Yes. In Settings, behind the grown-up check, Play with friends can be set to Allowed or Off. A first name typed for a party is shown only to that party and is never stored.
