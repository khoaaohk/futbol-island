/**
 * The /learn marketing hub's words (Nov 2 2026, research + copy only; the page itself is built later and the lesson index moves
 * to /learn/lessons). Audience: parents and coaches first, kids second. Every feature here was checked in the code on Nov 2 2026;
 * paused or removed things (the cave game, the underground world, the old 2D arcade games) are left out on purpose.
 *
 * Pure data: no React, no 'use client', no env reads, so a server page can import it (tests/seo-pages.cjs scans lib/site).
 * `counts` holds every number a `proof` line states; tests/learn-content.cjs recomputes each one from the game's own data
 * (lessons, Fishbook, cards, museum, NPCs, relay constants …) and fails when the copy drifts. Change the data, then the copy.
 * `verify` is a note for whoever publishes the page (never rendered): something the repo alone cannot prove is live.
 * `imageKey` names a screenshot another agent captures to public/learn/<imageKey>.webp. Long-form copy: docs/learn-page-content.md.
 */

export type LearnGroupId='learn'|'explore'|'play'|'together'|'collect'|'yours'|'safe';

/** Every number a proof line may state. tests/learn-content.cjs computes each from the source data. */
export type LearnCountKey=
 |'lessons'|'quizQuestions'|'formats'|'starterLessonsPerPath'|'stories'
 |'hiddenBalls'|'exploreBalls'|'fish'|'legendaryFish'|'bugs'|'beachFinds'|'exhibits'|'galleries'|'magazines'
 |'npcs'|'npcChallenges'|'bubblesAtOnce'|'newsLeagues'
 |'arcadeGames'|'passPuzzles'|'passPuzzlePacks'|'jobs'|'rideTypes'|'animalRides'
 |'cards'|'coachCards'|'books'|'vendingMachines'|'costumes'|'ballsPerCostumeMilestone'|'costumesPerMilestone'
 |'shopStudios'|'emotes'|'handshakes'|'highFives'|'partyMax'|'codeHours'|'codeLength'|'nameMaxLetters'|'practices';

export type LearnStep={line:string;imageKey:string};

export type LearnFeature={
 id:string;
 /** <= 28 characters */
 title:string;
 /** <= 70 characters: kid-friendly, parent-trustworthy */
 hook:string;
 /** exactly two sentences */
 description:string;
 /** the football idea it teaches, in plain words */
 footballTie:string;
 /** how a player finds it in the game */
 where:string;
 /** a concrete fact that is true today; every number in it is listed in `counts` */
 proof:string;
 counts?:Partial<Record<LearnCountKey,number>>;
 group:LearnGroupId;
 imageKey:string;
 /** a short how-to sequence (Play together) */
 steps?:LearnStep[];
 /** publisher's note, never shown: what must be confirmed in production before this card goes live */
 verify?:string;
};

export type LearnGroup={id:LearnGroupId;title:string;blurb:string};

export const LEARN_GROUPS:readonly LearnGroup[]=[
 {id:'learn',title:'Learn the game',blurb:'Short lessons on a moving pitch, a coach who explains each step, and a quiz that checks the idea.'},
 {id:'explore',title:'Explore and discover',blurb:'Every corner of the island hides a football idea: in a ball, a sea animal, a bug or an islander.'},
 {id:'play',title:'Play and practise',blurb:'Games and challenges that each train one real skill, from the first touch to picking a corner.'},
 {id:'together',title:'Play together',blurb:'Private parties for friends who know each other: same island, own kits, football calls instead of chat.'},
 {id:'collect',title:'Collect and read',blurb:'Cards, books and costumes that carry real football history, earned by playing and learning.'},
 {id:'yours',title:'Make it yours',blurb:'Design a kit, pick a number and travel the island your way.'},
 {id:'safe',title:'Safe and simple',blurb:'Free, no ads, no chat, no accounts, and a place for grown-ups to see progress and practise.'},
];

export const LEARN_HERO={
 headline:'Football ideas kids can see, try and remember',
 subhead:'Futbol Island is a free football learning game for kids aged 7 to 12. They explore an island and learn positions, team shape and the Laws of the Game in 7v7, 9v9, 11v11 and futsal, one short lesson at a time.',
 trust:[
  'Free, with no ads, and coins are earned by playing, never bought',
  'No accounts and no chat: a save code with no personal details',
  'Built in San Diego with White Sports Ventures and local non-profits',
 ],
 cta:'Play on the island',
} as const;

/** Grown-up trust points for the Play together section (each one checked in the code and the privacy policy). */
export const LEARN_TOGETHER_TRUST:readonly string[]=[
 'A grown-up check comes before starting or joining every party.',
 'Grown-ups can switch Play with friends off in Settings, behind the same check.',
 'No chat of any kind: friends talk with preset football calls and emotes.',
 'First name only, letters only, shown only to the party and never stored.',
 'Private parties by code, never with strangers: no lobbies and no friend lists.',
];

/** What Play together deliberately does not have (confirmed in docs/multiplayer-design.md section 1 and the code). */
export const LEARN_TOGETHER_NOT:readonly string[]=[
 'No free text chat and no voice chat',
 'No public lobbies, matchmaking or browsing other parties',
 'No accounts, friend lists, email or phone numbers',
 'No trading, gifting or shared coins',
 'No scores against each other',
];

export const LEARN_FEATURES:readonly LearnFeature[]=[
 // ---- Learn the game --------------------------------------------------------------------------------------------------------
 {id:'learning-paths',title:'Four learning paths',group:'learn',imageKey:'learning_paths',
  hook:'Learn 7v7, 9v9, 11v11 and futsal, one short lesson at a time.',
  description:'Each path follows the format a child actually plays, from small-sided 7v7 up to 11v11, plus futsal. Lessons build in chapters, so the next idea always sits on the last one.',
  footballTie:'Positions, team shape and decisions for each format: where to stand, when to pass and how a team keeps its shape.',
  where:'Tap Paths on the island. The 7v7 path comes first, and the others are open as tabs.',
  proof:'96 lessons with 486 quiz questions across 4 formats.',counts:{lessons:96,quizQuestions:486,formats:4}},
 {id:'lesson-quiz',title:'Watch it, then prove it',group:'learn',imageKey:'lesson_quiz',
  hook:'Players move on a real pitch while the coach explains every step.',
  description:'A lesson plays out with moving players, and a coach voice talks through each step. A quick quiz follows, and a lesson only counts once every question is answered right.',
  footballTie:'Seeing the idea in motion first, then checking it, the way a coach shows a pattern on the field before asking players to run it.',
  where:'Open any stop on a path in Paths, then tap through the steps and the quiz.',
  proof:'Each path has 12 starter lessons, and a lesson counts only when its whole quiz is right.',counts:{starterLessonsPerPath:12}},
 {id:'path-stories',title:'Story films',group:'learn',imageKey:'path_stories',
  hook:'Short films about grit, nerves and handling a loss.',
  description:'Story films sit between the lessons on each path, painted and narrated. They cover the side of football that drills skip, like staying calm when a game feels unfair.',
  footballTie:'The mental game: mental toughness, regulating emotions, grit, empathy and how to handle a loss.',
  where:'Story stops appear along each path in Paths; some open the path and some unlock as lessons are passed.',
  proof:'22 narrated story films across the four paths.',counts:{stories:22}},
 {id:'warm-up',title:'Daily warm-up',group:'learn',imageKey:'daily_warm_up',
  hook:'Old quiz questions come back, just as they are about to slip.',
  description:'The warm-up brings back questions from lessons a child has already passed, spaced out over days. A few minutes of recall keeps an idea from fading.',
  footballTie:'Remembering the ideas from earlier lessons, so they are ready when a real game needs them.',
  where:'When lessons are due, the Review card in Paths opens the warm-up.',
  proof:'Only questions from quizzes already passed come back, spaced over days.'},
 {id:'live-matches',title:'Watch live island matches',group:'learn',imageKey:'live_match_spot_it',
  hook:'Island teams play real formats, and you spot the idea you learned.',
  description:'Computer-run matches play on the island pitches with each format\'s own rules. A Spot it prompt asks the player to find an idea from a lesson they have learned while the match runs.',
  footballTie:'Applying a lesson to a real game: recognising support, width or a passing lane as play moves.',
  where:'Walk up to a pitch where a match is on, such as the Old Town Ground.',
  proof:'Spot it only asks about lessons the player has already learned.'},
 {id:'graduation',title:'Graduate each path',group:'learn',imageKey:'graduation_ferry',
  hook:'Finish a path, get a certificate, then board the Matchday Ferry.',
  description:'Finishing a path holds a graduation with a certificate that lists the lessons learned. When all four paths are done, the Matchday Ferry opens for the final day.',
  footballTie:'A clear finish line for each format, so a child can see what they now understand.',
  where:'Graduation opens when a path is complete; certificates live on the Trophy shelf in the backpack.',
  proof:'A certificate lists the 12 lessons learned and carries no name, age or photo.',counts:{starterLessonsPerPath:12}},

 // ---- Explore and discover --------------------------------------------------------------------------------------------------
 {id:'ball-hunt',title:'The hidden-ball hunt',group:'explore',imageKey:'ball_hunt',
  hook:'Find a hidden ball, and it teaches you one football idea.',
  description:'Balls are tucked away on rooftops, beaches and corners of every island. Each one opens a short animated mini lesson with a practice prompt.',
  footballTie:'One idea per ball, from rules and skills to history, each drawn on a small pitch diagram.',
  where:'Explore the main island, Coral Cay, Summit Isle and the East Jetty; the map tracks what is found.',
  proof:'116 hidden balls, each with its own mini lesson.',counts:{hiddenBalls:116}},
 {id:'reef-balls',title:'Reef treasure balls',group:'explore',imageKey:'reef_balls',
  hook:'Dive to a treasure chest and find a football inside.',
  description:'Each Explore reef zone hides one ball in its open treasure chest. Picking it up plays a mini lesson about a real football fact, then offers a card choice.',
  footballTie:'Little-known football facts, like the oldest ball ever found and the game of cuju in ancient China.',
  where:'Swim out to an Explore reef zone, tap Dive, and look for the open chest.',
  proof:'7 reef zones, 7 hidden balls, 7 mini lessons that repeat no other lesson.',counts:{exploreBalls:7}},
 {id:'swim-dive',title:'Swim, dive and ride',group:'explore',imageKey:'swim_dive',
  hook:'Swim the reefs and hang on to a manta ray or a whale shark.',
  description:'The sea around the islands is open to swim, with reef zones to dive into and sea life to meet. Near a manta ray or a whale shark, a Hang on button pulls the player along.',
  footballTie:'The reefs are where the reef balls and sea finds are, so swimming is how a child reaches those football facts.',
  where:'Walk into the sea from any beach; tap Dive at a reef zone and Hang on near a manta ray or whale shark.',
  proof:'2 sea animals to ride: the manta ray and the whale shark.',counts:{animalRides:2}},
 {id:'fishing',title:'Fishing and the Fishbook',group:'explore',imageKey:'fishing_fishbook',
  hook:'Every sea animal you catch links to a real club fact.',
  description:'Fishing on the island is calm and quick, and every catch goes into the Fishbook. Each animal page says which real club, team or football story it is linked to, with a source credit.',
  footballTie:'Club history and culture, plus a goalkeeper lesson: stay set, do not bite on a feint, then react fast.',
  where:'Head to a fishing spot on the shore or a boat; the Fishbook opens from fishing.',
  proof:'73 sea animals to catch, 10 of them legendary.',counts:{fish:73,legendaryFish:10}},
 {id:'bug-squad',title:'Bug Squad',group:'explore',imageKey:'bug_squad',
  hook:'Catch bugs that each play a position, like the Goalie Ladybug.',
  description:'The Bug Squad job hands the player a net to catch bugs in the meadows and gardens. Every bug plays one position and brings true football stories in the Bug Book.',
  footballTie:'Positions and their jobs: the Goalie Ladybug, for example, teaches that only the keeper may handle the ball, and only in their own area.',
  where:'Pick up the Bug squad job from a job board; the Bug Book opens from the job.',
  proof:'20 bug species, each tied to a position.',counts:{bugs:20}},
 {id:'beachcombing',title:'Beachcombing',group:'explore',imageKey:'beachcombing',
  hook:'Pick up shells and starfish, each with a football tip.',
  description:'Sparkles on the sand show a find to pick up and sell at the market stand. Every find goes into the Shellbook with a sea fact and a football tip.',
  footballTie:'Short football tips, one per find, alongside a true sea fact.',
  where:'Walk the beaches on every island and tap a sparkle to pick it up.',
  proof:'13 kinds of beach finds in the Shellbook.',counts:{beachFinds:13}},
 {id:'history-museum',title:'The History Museum',group:'explore',imageKey:'history_museum',
  hook:'Walk the halls of football history, from 1863 to VAR.',
  description:'The museum holds exhibits on the Laws of the Game, World Cup history, balls and kits, legends and the science of the game. Many open into hands-on experiences, and each one ends with a way to take it to your game.',
  footballTie:'Where the rules came from and why: offside, the penalty kick, throw-ins, free kicks, and how the game spread.',
  where:'Tap Enter History Museum at the museum building on the island.',
  proof:'22 exhibits in 7 galleries.',counts:{exhibits:22,galleries:7}},
 {id:'konbini',title:'The Konbini',group:'explore',imageKey:'konbini',
  hook:'A walk-in corner shop with football magazines on the shelves.',
  description:'The Konbini is a small shop to walk into, with snacks, a cashier with tips and a ball for keep-ups. Its magazines and cashier facts teach the Laws and long-settled football history, each with sources.',
  footballTie:'Laws of the Game facts and tournament history, read in short magazine pages.',
  where:'Tap Enter the Konbini on the main island, or its sister shop on Coral Cay.',
  proof:'8 football magazines on the shelves.',counts:{magazines:8}},
 {id:'islanders',title:'Talk to the islanders',group:'explore',imageKey:'islanders_talk',
  hook:'Coaches, fans and players with football stories to share.',
  description:'Walk up to an islander and tap Talk to pick a question from their topics. Every islander has a role and a personality, and the talk always comes back to football.',
  footballTie:'Coaching ideas, positions, club culture and what different people love about the game, with no typing.',
  where:'Walk close to anyone on the island; the nearest one shows a name tag and a Talk button.',
  proof:'158 islanders to meet.',counts:{npcs:158}},
 {id:'quick-challenges',title:'Quick challenges',group:'explore',imageKey:'quick_challenges',
  hook:'Islanders ask a one-tap football question with three answers.',
  description:'Some conversations end in a quick challenge with three options and one right answer. Right or wrong, the islander explains why in one short line.',
  footballTie:'Fast football decisions and rules, checked in a few seconds and explained right away.',
  where:'Talk to islanders; each one has their own set of challenges, and each area adds more.',
  proof:'653 quick challenges across the islanders and areas.',counts:{npcChallenges:653}},
 {id:'bubbles-banter',title:'Bubbles and banter',group:'explore',imageKey:'bubbles_banter',
  hook:'Walk past and hear islanders think out loud about football.',
  description:'Islanders say short lines as a player passes, and pairs chat with each other. It makes the island feel alive while staying calm on screen.',
  footballTie:'Small football thoughts in passing, the way players talk about the game on the touchline.',
  where:'Walk slowly near islanders anywhere on the island.',
  proof:'At most 2 speech bubbles show at once, so the screen stays calm.',counts:{bubblesAtOnce:2}},
 {id:'island-news',title:'Real scores from islanders',group:'explore',imageKey:'island_news',
  hook:'Ask a fan on the island about last weekend\'s results.',
  description:'A few islanders keep up with real leagues and share recent verified results. The game\'s server fetches the scores, so a player\'s device never contacts a sports site.',
  footballTie:'Following real football: leagues, results and fixtures, told as short match stories.',
  where:'Talk to the islanders who follow a league and pick the scores topic.',
  proof:'Results come from 10 leagues, and only finished, verified scores are shared.',counts:{newsLeagues:10}},

 // ---- Play and practise -----------------------------------------------------------------------------------------------------
 {id:'arcade',title:'The Arcade',group:'play',imageKey:'arcade',
  hook:'Five football games, one skill each.',
  description:'The Arcade has Island Strikers, Breakaway Run, Futbol Tennis, Futbol Pinball and Pass Puzzles. Each cabinet names the one skill it trains, and coins from the arcade spend at the vending machines.',
  footballTie:'One skill per game: pass, move and finish; beat the tackle; control the first touch; read the rebound; see the space.',
  where:'Tap Enter Arcade at the arcade building on the island.',
  proof:'5 arcade games, each with its own skill line.',counts:{arcadeGames:5}},
 {id:'pass-puzzles',title:'Pass Puzzles',group:'play',imageKey:'pass_puzzles',
  hook:'Draw the pass that splits the defence.',
  description:'Each puzzle freezes a moment in a match, and the player draws the pass with a finger. Packs build from first passes to beating the press, set pieces and wind and rain.',
  footballTie:'Seeing space, timing a run and choosing the pass, including staying onside.',
  where:'In the Arcade, at the Pass Puzzles cabinet.',
  proof:'46 puzzles in 12 packs.',counts:{passPuzzles:46,passPuzzlePacks:12}},
 {id:'beach-match',title:'Beach soccer on Coral Cay',group:'play',imageKey:'beach_match',
  hook:'Watch a live beach match with a guide to its own rules.',
  description:'A beach soccer match plays on the Sharks Beach court on Coral Cay. A guide shows what to watch for and asks a quick question about the beach rules.',
  footballTie:'How beach soccer differs from the grass game, with rules that match what the Coral Cay islanders say.',
  where:'Travel to Coral Cay and walk up to the Sharks Beach court.',
  proof:'The guide pairs what to watch for with a short beach rules quiz.'},
 {id:'keep-ups',title:'Keep-ups and sky kicks',group:'play',imageKey:'keep_ups',
  hook:'Juggle the ball, then hold to send it sky high.',
  description:'The player can juggle the ball anywhere on foot, and a counter keeps the score. Holding the button sends it high in the air, and a red mark shows where it will land.',
  footballTie:'Ball control and reading the flight of a high ball to get under it.',
  where:'Anywhere on foot with the ball, and inside the Konbini.',
  proof:'A live counter on screen shows the streak of touches.'},
 {id:'island-jobs',title:'Island jobs',group:'play',imageKey:'island_jobs',
  hook:'Flag the offside, set out the cones, be the ball kid.',
  description:'Job boards around the island offer short jobs that pay coins. Each job is a real task around a football ground, with a coach tip on what it teaches.',
  footballTie:'Matchday work and the rules behind it: offside flags, cone drills, wall rebounds, goal anchors and pitch markings.',
  where:'Look for job boards on the island and tap one to start.',
  proof:'14 island jobs, one at a time.',counts:{jobs:14}},
 {id:'summit-kick',title:'Summit Kick',group:'play',imageKey:'summit_kick',
  hook:'Hit the target hoops in the corners of the goal.',
  description:'At the top of Summit Isle, an empty five-a-side pitch has hoops in the corners of the goal. A hoop only counts from behind the chalk line, a real shooting distance.',
  footballTie:'Picking a corner: keepers stand in the middle, so the hardest shots to save go low or high into the corners.',
  where:'Travel to Summit Isle and climb to the small pitch at the top.',
  proof:'The hoops sit in the four corners and under the bar.'},

 // ---- Play together ---------------------------------------------------------------------------------------------------------
 {id:'party-start',title:'Play with friends',group:'together',imageKey:'friends_party',
  hook:'Invite friends to your island with a private code.',
  description:'A grown-up starts a party, and friends who have the code join the same island at the same time. Everyone keeps their own island, save and coins, and friends are drawn on top.',
  footballTie:'Learning beside teammates: friends explore, call for the ball and celebrate together, the way a team does.',
  where:'Tap Play with friends on the island, or Join friends on the title screen.',
  proof:'Up to 20 players in a party, and a code takes new friends for 8 hours.',counts:{partyMax:20,codeHours:8},
  steps:[
   {line:'A grown-up taps Play with friends and passes the grown-up check.',imageKey:'friends_step_start'},
   {line:'Type your first name, start a party and share the 6-character code or link.',imageKey:'friends_step_code'},
   {line:'Your friend taps Join friends, types the code and their first name, and appears on your island.',imageKey:'friends_step_join'},
  ],
  verify:'Play with friends shows only when NEXT_PUBLIC_MULTIPLAYER=1 and the relay URL are set on Vercel; confirm both in Production before publishing this group.'},
 {id:'friends-kits',title:'See your friends',group:'together',imageKey:'friends_kits',
  hook:'Friends appear in their own kit, colour and first name.',
  description:'Each friend shows in their own look with a colour ring and their first name above their head. Friends also show on the map, so it is easy to meet up.',
  footballTie:'Kits make players easy to find, the same reason teams wear colours and keepers wear a different shirt.',
  where:'Once a party is on, friends appear on the island and on the map.',
  proof:'Every friend in a party of up to 20 gets their own colour.',counts:{partyMax:20},
  verify:'Kit Shop jersey, boots and ball designs on friends need relay v1.7 deployed; without it friends show their own colours only.'},
 {id:'friends-emotes',title:'High fives and handshakes',group:'together',imageKey:'friends_high_five',
  hook:'Ten football emotes, from Well played to Pass it.',
  description:'Emotes are football calls and celebrations: Wave, High five, Cheer, Pass it, Juggle with me, Well played, Laugh, Dance, Thanks and Show off. Each has its own version when flying, swimming or riding, and paired emotes play as whole-body handshakes.',
  footballTie:'Respect and communication on the pitch: thanking a teammate, saying well played and calling for a pass.',
  where:'Tap the emote button on the island; it works with friends and with nearby islanders.',
  proof:'10 emotes and 20 handshake routines, including 10 different high fives.',counts:{emotes:10,handshakes:20,highFives:10}},
 {id:'friends-ball',title:'Pass and juggle together',group:'together',imageKey:'friends_ball_duet',
  hook:'Ask a friend to pass or juggle, and play it out together.',
  description:'Pass it and Juggle with me send a friend a request, and when they tap Yes both players play the routine with their balls. A friend can also bump into you or knock you over with a gentle ball, all in fun.',
  footballTie:'Passing and receiving with a partner, the first thing any two players do at practice.',
  where:'Stand near a friend on foot and pick Pass it or Juggle with me from the emotes.',
  proof:'A friend has to tap Yes before a shared routine starts.',
  verify:'Shared ball routines need relay v1.4 and ball knock-overs relay v1.6; confirm the deployed relay version.'},
 {id:'friends-rooms',title:'Together indoors',group:'together',imageKey:'friends_indoors',
  hook:'Walk the Konbini, Museum, Arcade and Kit Shop with friends.',
  description:'Friends stay in the party when they step inside, and they see each other in the Konbini, the History Museum, the Arcade hall and the Kit Shop. Arcade games themselves are played one at a time, and the friend list shows who is playing what.',
  footballTie:'Talking through an exhibit or a kit together, then trying it out on the island.',
  where:'Enter any of those buildings while a party is on.',
  proof:'Friends share the Konbini, Museum, Arcade hall and Kit Shop floor.'},
 {id:'friends-ride',title:'Ride and fly together',group:'together',imageKey:'friends_ride',
  hook:'Scoot, bike, fly and swim side by side.',
  description:'A friend on a scooter, bike or moped shows on their ride, and flying and swimming friends move with you. Emotes switch to their flying, swimming or riding versions on the go.',
  footballTie:'Travelling the island as a group to find balls, lessons and matches together.',
  where:'Ride, fly or swim anywhere on the island while a party is on.',
  proof:'Scooter, bike and moped rides show on friends.'},
 {id:'friends-safety',title:'Grown-ups stay in charge',group:'together',imageKey:'friends_controls',
  hook:'A grown-up check, an off switch and host controls.',
  description:'Starting or joining a party always passes a grown-up check, and a grown-up can turn Play with friends off in Settings. The host can remove a friend, lock a name or make a new code, and anyone can hide or mute a friend.',
  footballTie:'Fair play and looking out for each other, built into how a party works.',
  where:'Settings, behind the grown-up check: Play with friends, Allowed or Off.',
  proof:'First names are letters only, up to 12, and never stored; codes are 6 characters.',counts:{nameMaxLetters:12,codeLength:6}},

 // ---- Collect and read ------------------------------------------------------------------------------------------------------
 {id:'player-cards',title:'Player cards and binder',group:'collect',imageKey:'card_binder',
  hook:'Collect current stars, all-time greats, futsal players and coaches.',
  description:'Cards come as rewards for learning and from card packs, and they fill a binder with pages to turn. Each card shows the position, country, strengths and career.',
  footballTie:'Positions and roles through real careers, plus the coaches behind famous teams.',
  where:'Open Cards from the island menu; new cards are offered after lessons and hidden balls.',
  proof:'450 cards, including 50 coaches.',counts:{cards:450,coachCards:50}},
 {id:'pop-up-books',title:'Pop-up books, read aloud',group:'collect',imageKey:'pop_up_books',
  hook:'True stories of players who kept going, read aloud.',
  description:'Each pop-up book tells a true story of a footballer overcoming hardship, with a narrator reading every page. A book check afterwards links the story back to a lesson.',
  footballTie:'Resilience and practice habits, plus a "take it to your game" idea at the end of each book.',
  where:'Buy books with coins at the vending machines; they stay in the backpack to reread.',
  proof:'37 narrated pop-up books.',counts:{books:37}},
 {id:'vending',title:'Vending machines',group:'collect',imageKey:'vending_machine',
  hook:'Spend the coins you earn on cards, balls and rides.',
  description:'Vending machines around the islands sell card packs, balls, rides and island animals for coins. Every machine also has a Specials row sold only there, which gives a reason to explore.',
  footballTie:'Every card in a pack carries a football lesson, and coins come from playing and learning.',
  where:'Walk up to a vending machine and tap Go to the vending machine.',
  proof:'14 vending machines across the islands.',counts:{vendingMachines:14}},
 {id:'club-costumes',title:'Club animal costumes',group:'collect',imageKey:'club_costumes',
  hook:'Dress as a club\'s animal and learn the story behind it.',
  description:'Costumes are island animals inspired by real clubs and their nicknames or mascots, in the club\'s home colours. Each one explains the club, its mascot and the true story behind the link, kept apart from island fiction.',
  footballTie:'Club culture: where nicknames and mascots came from and what they mean to fans.',
  where:'Costumes unlock as hidden balls are found and are worn from the wardrobe.',
  proof:'23 club costumes; every 10 hidden balls found unlock 3 more.',counts:{costumes:23,ballsPerCostumeMilestone:10,costumesPerMilestone:3}},

 // ---- Make it yours ---------------------------------------------------------------------------------------------------------
 {id:'kit-shop',title:'Kit Shop studios',group:'yours',imageKey:'kit_shop',counts:{shopStudios:3},
  hook:'Design your own ball, boots and jersey.',
  description:'The Kit Shop has a ball studio, a boot studio and a jersey studio, and a child can even draw their own ball design. What they make dresses their island player.',
  footballTie:'Kit basics and what shirt numbers mean, explained under the number picker.',
  where:'Tap Enter KIT SHOP at the shop building on the island.',
  proof:'3 studios: ball, boots and jersey, with a draw-your-own ball design.'},
 {id:'jersey-back',title:'Your name on the back',group:'yours',imageKey:'jersey_back',
  hook:'Pick a number and put a name on the back of your shirt.',
  description:'The jersey studio prints a name and number on the back, with a choice of font and outline. Party friends see the shirt and its number, but never the printed name.',
  footballTie:'Squad numbers and positions: why a 9 is often the striker and a 2 a right-back.',
  where:'In the Kit Shop, open the jersey studio.',
  proof:'Under the number picker, each classic number gets a one-line tip about the position.'},
 {id:'rides',title:'Scooters, bikes and flight',group:'yours',imageKey:'rides',
  hook:'Unlock new rides by finishing learning paths.',
  description:'The island has scooters, bikes, mopeds and a jetpack for flying between islands, plus a zipline from Summit Isle to Coral Cay. Each finished path unlocks the next ride in every ride type.',
  footballTie:'Learning comes first: rides open up as paths are finished, so progress on the pitch moves you around the island.',
  where:'Pick a ride from the travel controls; more are sold at vending machines.',
  proof:'4 ride types: scooter, bike, moped and flight.',counts:{rideTypes:4}},

 // ---- Safe and simple -------------------------------------------------------------------------------------------------------
 {id:'free-no-ads',title:'Free, with no ads',group:'safe',imageKey:'free_no_ads',
  hook:'Nothing to buy and no ads, ever.',
  description:'Futbol Island costs nothing to play and shows no advertising. Coins are earned by playing and learning, never bought with real money.',
  footballTie:'Learning the game should not cost money; club soccer already prices too many kids out.',
  where:'Everywhere in the game. Donations to local non-profits sit behind a grown-up check.',
  proof:'No ads, and coins cannot be bought.'},
 {id:'save-code',title:'Save code, not an account',group:'safe',imageKey:'save_code',
  hook:'Three football words and a number keep your island safe.',
  description:'Instead of an account, each player gets a save code made of three football words and a number. Typing it on another device loads the same island.',
  footballTie:'Even the code is football: words like striker, volley and corner.',
  where:'Made when a new player starts; it is under My save code in Settings.',
  proof:'The code is made at random and carries no personal details.'},
 {id:'grown-ups',title:'For grown-ups',group:'safe',imageKey:'grown_ups',
  hook:'See progress and get real practice ideas for the backyard.',
  description:'Behind a grown-up check, the For grown-ups page shows lessons understood and prints a one-page progress report. It also suggests short practice activities tied to the lessons a child has explored.',
  footballTie:'Taking the island\'s lessons onto real grass with a ball, a few cones and one grown-up.',
  where:'Settings, then For grown-ups, behind the grown-up check.',
  proof:'11 backyard or park activities, each needing at most a ball and a few cones.',counts:{practices:11}},
 {id:'coaches-centre',title:'Coaches Centre',group:'safe',imageKey:'coaches_centre',
  hook:'Pick one "I can" goal, practise it, and talk about how it went.',
  description:'The Coaches Centre holds a simple football plan with one or two goals made from fixed lists. It can be printed for a coach, and it never scores, ranks or compares children.',
  footballTie:'Individual development: a clear goal, practice linked to lessons, and a talk about progress.',
  where:'Tap Enter Coaches at the coaches building on the island.',
  proof:'Typed notes stay on the device and are never uploaded.'},
 {id:'phone-first',title:'Plays in the browser',group:'safe',imageKey:'phone_first',
  hook:'Phone first, with nothing to download.',
  description:'The game runs in the web browser on phones, tablets and computers. There is no app to install and no sign-up.',
  footballTie:'Ten minutes between practices is enough for a lesson and a quiz.',
  where:'Open futbolisland.app in any modern browser.',
  proof:'Made for phones first, with a battery saver in Settings.'},
];

/**
 * The calm /learn page (Nov 2 2026, owner: "needs to be simpler, there's too much going on"). The page shows only these five
 * sections, each one headline, one short line, one real shot (public/learn, see lib/site/learnMedia.ts) and up to 3 chips.
 * LEARN_FEATURES above stays the full catalogue (tests, docs and other pages use it); `features` lists the ids each section covers.
 * Copy rule: every line fits two short lines on a phone.
 */
export type LearnHighlightId='top'|'learn'|'explore'|'together'|'safe';
export type LearnHighlight={id:LearnHighlightId;title:string;line:string;shot:string;chips:readonly string[];features:readonly string[]};
export const LEARN_HIGHLIGHTS:readonly LearnHighlight[]=[
 {id:'top',title:LEARN_HERO.headline,line:'A free football game for kids aged 7 to 12.',shot:'town_overview',chips:[],features:[]},
 {id:'learn',title:'Learn the game',line:'Short lessons and quizzes show real football ideas on a moving pitch.',shot:'lesson_field',
  chips:['Lessons and quizzes','Story films and books','A football museum'],features:['learning-paths','lesson-quiz','path-stories','pop-up-books','history-museum']},
 {id:'explore',title:'Explore the island',line:'Every corner hides a football idea to find.',shot:'diving_reef',
  chips:['Fishing and diving','Arcade and vending machines','Islanders and cards'],features:['fishing','swim-dive','arcade','vending','islanders','player-cards']},
 {id:'together',title:'Play with friends',line:'Private parties by code. Same island, no chat, just football calls.',shot:'mp_sidebyside',
  chips:['Private code only','Football calls, no chat','Own kits and names'],features:['party-start','friends-kits','friends-emotes','friends-safety']},
 {id:'safe',title:'Safe for kids',line:'Free, with no ads, no chat and no accounts.',shot:'save_code',
  chips:['Free, no ads','No chat','A save code, not an account'],features:['free-no-ads','save-code','grown-ups']},
];
/**
 * "See it in action" (Nov 3 2026, owner: an apple.com/apple-vision-pro style horizontal clip carousel right after the hero).
 * One card per wide 16:9 clip, in this order. Media: public/learn/wide_<key>.webp (poster) + the clip, listed in
 * public/learn/manifest.json as `wide_<key>`; a card whose manifest entry or poster is missing is skipped (no placeholder art).
 * `caption`: one sentence (<= 22 words) for a 7-12 year old's parent, with the football tie, reusing `feature`'s own facts and
 * phrasing (no new claims); **words** between double asterisks render bold (parsed by learnBoldParts, never as HTML).
 */
export type LearnCarouselItem={key:string;feature:string;title:string;caption:string};
export const LEARN_CAROUSEL:readonly LearnCarouselItem[]=[
 {key:'fishing',feature:'fishing',title:'Fishing and the Fishbook',caption:'Cast a line and fill the **Fishbook**: every sea animal you catch links to a real club, team or football story.'},
 {key:'diving',feature:'reef-balls',title:'Reef treasure balls',caption:'Dive the reefs to an open **treasure chest** with a football inside and a mini lesson about a real football fact.'},
 {key:'vending',feature:'vending',title:'Vending machines',caption:'Spend coins earned by playing and learning at the **vending machines**, where every card in a pack carries a football lesson.'},
 {key:'museum',feature:'history-museum',title:'The History Museum',caption:'Walk the **History Museum** from 1863 to VAR and see where offside, the penalty kick and throw-ins came from.'},
 {key:'arcade',feature:'arcade',title:'Football pinball',caption:'Play **football pinball** in the Arcade: aim the flippers, time each shot at goal and score points.'},
 {key:'books',feature:'pop-up-books',title:'Pop-up books, read aloud',caption:'**Pop-up books**, read aloud, tell true stories of footballers who kept going, and a book check links each story to a lesson.'},
 {key:'cards',feature:'player-cards',title:'Player cards and binder',caption:'Collect **player cards** of current stars, all-time greats and coaches, each showing the position, country, strengths and career.'},
 {key:'npc',feature:'islanders',title:'Talk to the islanders',caption:'Walk up to an **islander** and tap Talk to hear coaches, fans and players share football stories, with no typing.'},
 {key:'multiplayer',feature:'party-start',title:'Play with friends',caption:'A grown-up starts a **private party**, and friends join by code to call for the ball and celebrate like a team.'},
];
/** The words under the full-bleed montage after the hero (Nov 3 2026). PLACEHOLDER copy: the owner should confirm or replace it. */
export const LEARN_MONTAGE={title:'A whole island to play in.',line:'Dribble, pass, ride, fly.'};
/**
 * "Even more to explore" (Nov 3 2026, owner: after visionOS's "Explore what's new" slideshow, on a light section between Play with
 * friends and Safe for kids). Six slides in this order, one short sentence each (<= 14 words, plain text, no bold), shown as a
 * white caption on the clip. Media: public/learn/slide_<key>.webp (poster) + public/learn/video/slide_<key>.mp4 (and the 1280px
 * slide_<key>_m.mp4), listed in public/learn/manifest.json as `slide_<key>`; a slide whose entry or poster is missing is skipped.
 */
export type LearnSlide={key:string;title:string;caption:string};
export const LEARN_SLIDES:readonly LearnSlide[]=[
 {key:'stories',title:'Stories and lessons',caption:'Stories, lessons and quizzes that teach real football ideas.'},
 {key:'arcade',title:'Arcade games',caption:'Arcade games that train aiming, timing and finishing.'},
 {key:'beachmatch',title:'Beach matches',caption:'Beach matches show how the game changes on sand.'},
 {key:'kit',title:'Your own kit',caption:'Paint your kit, pick a name and number, and wear it.'},
 {key:'collection',title:'Collections',caption:'Collect fish facts and football cards as you explore.'},
 {key:'party',title:'Parties with friends',caption:'Meet friends in a party and celebrate together.'},
];
/** A caption split into plain and **bold** runs (rendered as text nodes and <strong>, so nothing is ever parsed as HTML). */
export function learnBoldParts(s:string):{text:string;bold:boolean}[]{
 return s.split('**').map((text,i)=>({text,bold:i%2===1})).filter(p=>p.text);
}
/** The caption as plain text (no markers), e.g. for aria labels and tests. */
export const learnPlain=(s:string)=>s.split('**').join('');

/** One line under the friend steps (text only). */
export const LEARN_GROWNUP_LINE='Grown-ups stay in charge: a grown-up check comes first, and Settings can switch it off.';
/** The five questions /learn shows (and its FAQPage JSON-LD lists), safety first. */
export const LEARN_FAQ_TOP:readonly string[]=['Is Futbol Island free?','Are there ads?','Can my child chat with other people?','Does my child need an account?','Can strangers join, or can kids message each other?'];

export type LearnFaq={q:string;a:string;group:'parents'|'together'};

export const LEARN_FAQ:readonly LearnFaq[]=[
 {group:'parents',q:'Is Futbol Island free?',a:'Yes. It is free to play, and there is nothing to buy. The island\'s coins are earned by playing and learning, never bought with real money. Donations to local non-profits are optional and sit behind a grown-up check.'},
 {group:'parents',q:'Are there ads?',a:'No. The game shows no advertising, and it uses its own visit counter with no cookies and no third-party analytics.'},
 {group:'parents',q:'Can my child chat with other people?',a:'No. There is no free text chat and no voice chat. Islanders are part of the game and talk through preset topics a child taps. Play with friends uses preset football calls and emotes only.'},
 {group:'parents',q:'Does my child need an account?',a:'No. Each player gets a save code of three football words and a number instead. The code is made at random and carries no personal details. Typing it on another device loads the same island.'},
 {group:'parents',q:'What ages is it for?',a:'Kids aged about 7 to 12, and the parents, carers and coaches who help them. The 7v7 path comes first because it is the simplest.'},
 {group:'parents',q:'What devices does it work on?',a:'It plays in the web browser on phones, tablets and computers, with nothing to download. It is made for phones first and needs an internet connection to load.'},
 {group:'parents',q:'How does it actually teach football?',a:'Every idea is shown on a pitch with moving players, explained by a coach voice step by step, and checked with a quick quiz. A lesson only counts once every question is right, and a daily warm-up brings passed questions back so they stick. The rest of the island ties back to the lessons, from hidden balls to live matches.'},
 {group:'parents',q:'Who made it?',a:'Futbol Island is built in San Diego in partnership with White Sports Ventures, founded by former U.S. Men\'s National Team player Jeremiah White III. It also works with the local non-profits FC YAP, Street Soccer San Diego and Ronin Futsal.'},
 {group:'parents',q:'What data does it collect?',a:'Most progress lives only in the browser on the device. With a save code, the allowlisted progress is saved against a scrambled version of the code, never a name or email. The game also counts anonymous usage totals to run and improve it and to show sponsors combined totals; nothing is sold, and nothing about an individual child is shared. The privacy policy explains what is kept and for how long.'},
 {group:'together',q:'How do friends play together?',a:'A grown-up taps Play with friends, passes the grown-up check and starts a party. Friends join with the 6-character code or a share link, type their first name and arrive on the same island. Up to 20 players can be in one party.'},
 {group:'together',q:'Can strangers join, or can kids message each other?',a:'Parties are private and join by code only: there are no public lobbies, matchmaking or friend lists. A code takes new friends for 8 hours, and the host can make a new code or remove someone at any time. There is no chat; friends use preset football calls and emotes.'},
 {group:'together',q:'Can I turn Play with friends off?',a:'Yes. In Settings, behind the grown-up check, Play with friends can be set to Allowed or Off. A first name typed for a party is shown only to that party and is never stored.'},
];
