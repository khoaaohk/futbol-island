# Townsfolk cast: personas, topics and sources

October 12, 2026 (local, not deployed). User-approved: "add about 60 townsfolk … what will they talk about? we need this to be more diverse, but revolve around futbol still", then "mix up the current npcs with the stores too so it's more spread out".

## What changed

- **60 new townsfolk** (`lib/town/townsfolkCast.ts`, `TOWNSFOLK_CAST`):
  - Island Square and the shop streets: 15;
  - the beaches: 15;
  - East Jetty and the Ferry Dock: 10;
  - Coral Cay: 10;
  - homes and parks: 10.
- **No new pitch players.** Nobody new stands on a pitch, the beach soccer court or in a match; the test checks this.
- **Every existing islander** (89) gets a persona and two extra conversation openers (`TOWNSFOLK_VOICES`).
  - The greeting stays the first opener, so wording that gameplay relies on is unchanged: news desks, the ranking host and clip prompts.
  - Topics, reply buttons, jobs and the "LET'S TALK" tag are untouched.
- **Spread** (`TOWNSFOLK_MOVES`): six regulars with no gameplay tie moved out of the Island Square spawn and the busiest clusters.
  - Boardwalk skater Theo goes to the south beach boardwalk.
  - Neighbourhood cruiser Ellis goes to the Local Library street.
  - Evening jogger Mateo and beach winger Hana go to North Beach.
  - Futsal fan Leila goes outside Café Maré.
  - Winger Jules goes to the Ferry Dock.
  - Never moved: job and quest positions (Hugo), onboarding, café routes (Bela, Oren), court, cay and jetty freestylers, workers at their props (watering, sweeping, serving), video desks, test-pinned positions (Nia, Ari, Koa, Lina) and the ranking host.
- **At the stores:**
  - Konbini: a snack buyer, a referee at the drinks machine and a kid keeper.
  - Arcade: a dad on the bench outside, waiting for his daughter, and a Pass Puzzles teen.
  - Square café tables: a commentator.
  - Bakery and Fish Market row: a team cook and a coach.
  - Corner Deli: a scout.
  - Café Maré: Leila.
  - Garden Café: an architect on the bench and a boot-maker.
  - Pier Bakery and Coast Café terrace benches: a grandmother and a kit manager.
  - Ferry Dock benches: two ferry passengers waiting.
- **Rotating openers** (`lib/town/npcOpeners.ts`, `components/NpcConversation.tsx`): the first chat opens with the greeting, and each later chat this session opens with the next persona line, then wraps round. Lines are text only, because islander chat is not voiced.
- **Routines, all from existing systems:**
  - Walkers: a short checked route, plus the pair-chat ("CATCHING UP") behaviour.
  - Joggers: travel `run`.
  - Still poses (`lib/graphics/npcSeatPose.ts`): the freestyle `sit` and `lie` stances (`freestyleTricks.stancePose`) handed to the rig as `motion.trick`.
    - On a bench: hips on the seat, feet hanging, hands on the knees.
    - Sitting on a towel or the sand.
    - Sunbathing flat on a towel.
  - Still townsfolk wave hello when you come near but keep their heading. They never get up to pair-chat.
- **Looks** (`beanLooks.npcDress` + `NpcLookOverride`):
  - all eight skin tones;
  - nine kids (rig height 0.74), nine teens (0.88) and ten grandparents with grey, silver or white hair and a slower gait (`AGE_PROFILES`, `player.setProfile`);
  - eight hair styles, explicit hats only where they suit the person, and 30 women and 30 men.
- **Not faked.** The rig has no headscarf or hijab, glasses, wheelchair or dog, so none is shown. Para football is present through people who play, coach, guide and volunteer in it, telling it in their own words:
  - a blind football guide;
  - a powerchair football coach;
  - a deaf footballer;
  - an amputee football volunteer;
  - walking football grandparents.

  Adding a headscarf or glasses option to the bean skin (`lib/graphics/beanSkin.ts`) would be a separate rig task.
- **Not added: keepy-uppy or catch on the beach.**
  - A new freestyler needs its own verified clip (`tests/freestyle-clips.cjs`) and a ball runtime that poses every frame within 32 m.
  - There is no catch animation.
  - Beach life is instead sunbathing, towel-sitting, walking, jogging and chatting.

## Areas: old and new (after the spread)

| Area | Regulars before | Regulars after | New | Total |
|---|---|---|---|---|
| Island Square + shop streets (Konbini, Arcade, Old Town row, Corner Deli, Café Maré, Garden Café) | 20 | 18 | 15 | 33 |
| South beach + pier cafés | 10 | 10 | 5 | 15 |
| North Beach | 3 | 5 | 6 | 11 |
| Palm Coast beach + Beach Kitchen | 8 | 6 | 4 | 10 |
| East Jetty | 2 | 2 | 6 | 8 |
| Ferry Dock | 1 | 2 | 4 | 6 |
| Coral Cay + causeway + sandbars | 16 | 16 | 10 | 26 |
| Homes, parks, Library Square, Junior Club | 21 | 22 | 9 | 31 |
| Eleven Park sides + Café by the Sea | 5 | 5 | 1 | 6 |
| West Market | 3 | 3 | 0 | 3 |
| **Total** | **89** | **89** | **60** | **149** |

The "Island Square + shop streets" row is the whole band from the west street to the Garden Café. The spawn view itself goes from 15 drawn townsfolk to 21.

## The new cast

### Island Square and shop streets

| Name | Age | Persona | Routine | Topics |
|---|---|---|---|---|
| Margit | elder | A grandmother who played left back in England in the 1970s, as soon as women were allowed back on proper pitches. | sits on a bench (76, -25) | Why weren’t women allowed to play? |
| Kwame | adult | A dad who grew up watching the Africa Cup of Nations with his whole street, waiting for his daughter at the arcade. | sits on a bench (105, -25) | What is the Africa Cup of Nations? |
| Amaka | kid | An eight-year-old goalkeeper who loves big saves and shouting helpful things to her team. | walks a short route (74, -44) | Why do you like being in goal? |
| Haruto | teen | A teenager who loves puzzles, passing and the story of Japan’s 2011 Women’s World Cup win. | walks a short route (104, -48) | How did Japan win the 2011 World Cup? |
| Valentina | adult | A futsal player who fell in love with the small court and its low-bounce ball. | walks a short route (66, -46) | What is futsal? |
| Tariq | adult | A referee in training who studies the Laws of the Game on his lunch break. | walks a short route (80, -46) | What does a referee need to learn? |
| Giulia | adult | A radio commentator who paints the pitch with words for listeners who cannot see it. | walks a short route (100, -35) | How do commentators know every player? |
| Joaquín | kid | A seven-year-old who collects the names of football in every language he can find. | walks a short route (88, -18) | Why do some people say soccer? |
| Ernesto | elder | Joaquín’s grandfather, who learned the game in Montevideo and now plays walking football every week. | walks a short route (91, -19) | What is walking football? |
| Dalia | adult | A coach of a girls’ under-11 team whose rule is that everyone gets the ball and everyone gets cheered. | walks a short route (20, -13) | What does a good warm-up look like? |
| Wei | adult | A team physiotherapist who helps players recover, and reminds everyone that sleep is the best recovery tool. | sits on a bench (15, -46) | What does a physio do at a match? |
| Sione | adult | A cook for a youth team who believes football fuel should be simple, familiar and shared at one big table. | walks a short route (0, -14) | What does a team cook make on match day? |
| Zainab | teen | A teenager learning to scout, who watches what players do when they don’t have the ball. | walks a short route (-50, -55) | What does a scout look for? |
| Pieter | elder | A retired architect who designed stadium roofs for forty years and still sketches them over coffee. | sits on a bench (190, -51) | How do you build a stadium pitch? |
| Ingrid | adult | A boot-maker who knows every stitch and stud, and how boots changed from work boots to today’s light ones. | walks a short route (226, -36) | How do I choose football boots? |

### Beaches

| Name | Age | Persona | Routine | Topics |
|---|---|---|---|---|
| Aroha | adult | A New Zealander who cheers for the Football Ferns and never forgets her sun cream. | sunbathes (-12, -223) | Was the 2023 Women’s World Cup a big one? |
| Lukas | teen | A teenager obsessed with how footballs changed, from laced leather to today. | sits on a towel / the sand (25, -228) | Why are footballs made of panels? |
| Fatou | adult | A guide in blind football who stands behind the goal and calls directions to her attackers. | sunbathes (65, -228) | How do blind football players find the goal? |
| Hiroshi | elder | A groundskeeper who cared for pitches for thirty years and still notices every blade of grass. | sits on a bench (83, -215) | How do stripes get on the grass? |
| Ayelén | kid | A nine-year-old who counts everything: waves, keep-ups and fish at North Beach Rocks. | sits on a towel / the sand (108, -226) | How can I get better at keep-ups? |
| Karim | adult | A dad who walks the beach after his five-a-side games and still smiles about Morocco’s 2022 run. | walks a short route (40, -212) | What made Morocco’s 2022 run special? |
| Chidi | adult | A kit manager who packs shirts, socks, boots, balls and spares of everything. | sits on a bench (122, 200) | What does a kit manager do on match day? |
| Meera | adult | A mum who learned football after moving to a new country, where a pass was the first thing everyone understood. | walks a short route (95, 212) | How did football help you in a new country? |
| Arjun | kid | Meera’s son, an eight-year-old midfielder who checks over his shoulder before every pass. | walks a short route (98, 213) | What is a good first touch? |
| Losa | elder | A Samoan grandmother who has watched island football for decades and believes every match has a lesson in it. | sits on a bench (103, 200) | How do you lose well? |
| Tavita | teen | A sixteen-year-old defender who takes his rest days as seriously as his training. | sunbathes (130, 214) | Why do I need rest days? |
| Ximena | adult | A beach football player who learned the game on Copacabana and plays wherever there is sand. | walks a short route (20, 125) | Why do people in Rio play on the beach? |
| Jarrah | adult | An Australian runner who trains on the sand and cheered the Matildas all the way to the 2023 semi-finals. | jogs (-20, 112) | How far do footballers run in a match? |
| Kiri | kid | An eight-year-old who has read everything she can find about Marta. | sits on a towel / the sand (-10, 120) | Who is your favourite player? |
| Tama | adult | A coach of a powerchair football team who says there is a version of football for every body. | sunbathes (10, 118) | How does powerchair football work? |

### East Jetty and Ferry Dock

| Name | Age | Persona | Routine | Topics |
|---|---|---|---|---|
| Inti | teen | A teenager who comes to the jetty to watch the anglers and practise patience. | sits on a bench (342, 63) | What can fishing teach a footballer? |
| Svetlana | elder | A grandmother who coached girls’ teams for thirty years and still believes in brave, kind football. | sits on a bench (342, 73) | What was the best lesson you taught? |
| Bilal | adult | A deaf footballer who plays for a deaf team, where everyone talks with signs, pointing and eye contact. | walks a short route (366, 60) | How do deaf players talk during a game? |
| Nayeli | kid | A nine-year-old who has hit the Jetty Shooting Challenge ring three times in a row. | walks a short route (366, 70) | How do I aim better? |
| Lars | adult | A video assistant referee operator who spends match days watching replays from every angle. | walks a short route (265, 98) | Does VAR make the decision? |
| Amani | adult | A runner who jogs the jetty every morning and follows Nigeria’s Super Falcons. | jogs (250, 98) | Who are the Super Falcons? |
| Seo-yeon | teen | A teenager who has nearly finished every learning path and is ready for the Matchday Ferry. | sits on a bench (213, 202) | How do I get on the Matchday Ferry? |
| Rodrigo | adult | A ferry crew member who carries fans of every team to matchdays, all on one friendly boat. | sits on a bench (209, 208) | What do fans do on the way to a match? |
| Yuki | kid | A nine-year-old who was a ball kid at a real match and wants to do it again. | walks a short route (230, 203) | What does a ball kid do? |
| Hamza | adult | Yuki’s dad, who volunteers at an amputee football club and drives the team minibus. | walks a short route (234, 201) | Can players use their crutches to play the ball? |

### Coral Cay

| Name | Age | Persona | Routine | Topics |
|---|---|---|---|---|
| Mahina | adult | A beach soccer fan who never misses a game on the cay court. | walks a short route (560, -158) | What should I watch in a beach soccer match? |
| Kenji | elder | A grandfather who went to a match in the J.League’s very first season and plays walking football today. | walks a short route (575, -155) | Why was the 2002 World Cup special? |
| Luana | teen | A teenage beach soccer player resting in the sun between tournament games. | sunbathes (600, -225) | How do you stay safe in the sun? |
| Gabriel | adult | A goalkeeper coach who teaches the ready position before anything else. | sits on a towel / the sand (620, -215) | How do keepers save penalties? |
| Abebe | adult | A youth coach who has brought his team to the cay for their first away tournament. | walks a short route (548, -108) | How do you get a team ready for a tournament? |
| Thandi | kid | A ten-year-old left winger on Coach Abebe’s team, at her very first tournament. | walks a short route (565, -110) | What’s it like on a team trip? |
| Eleni | elder | A grandmother who still sings about Greece winning Euro 2004 and plays walking football with her friends. | walks a short route (580, -90) | How did Greece win Euro 2004? |
| Wiremu | adult | A New Zealander who walks the causeway every day and loved following the All Whites at the 2026 World Cup. | walks a short route (400, -170) | Where was the 2026 World Cup played? |
| Kavya | adult | The groundskeeper who rakes the cay’s beach soccer court before every match. | walks a short route (600, -110) | Why rake the sand? |
| Nuno | teen | A teenage futsal player who watched Portugal win the 2021 Futsal World Cup with his whole family. | walks a short route (595, -160) | What’s the hardest futsal skill? |

### Homes and parks

| Name | Age | Persona | Routine | Topics |
|---|---|---|---|---|
| Bisi | elder | A grandmother who has watched football for sixty years and claps for good play from both teams. | sits on a bench (112, -129) | What makes a great fan? |
| Lan | adult | A match analyst for a women’s team who counts passes, sprints and where shots come from. | sits on a bench (111, -88) | What numbers do analysts look at? |
| Ahmad | adult | The Junior Club’s under-7s coach, who wants every child to touch the ball loads. | walks a short route (232, -150) | Why do young kids play small-sided games? |
| Paloma | adult | A mum who loves great passers and is walking her son to training at the Junior Club. | walks a short route (150, -168) | What makes a great passer? |
| Ilyas | kid | Paloma’s seven-year-old son, who is learning to receive the ball on the half-turn. | walks a short route (153, -168) | What’s the half-turn? |
| Lupe | elder | A grandmother who remembers street football in Mexico and kicks a ball with her grandchildren every afternoon. | walks a short route (-50, -5) | What was football like when you were young? |
| Darius | teen | A teenager who plays street football anywhere it’s safe and loves a well-timed panna. | walks a short route (-50, 30) | What is street football? |
| Mbali | adult | A South African five-a-side player who remembers the first World Cup in Africa. | sits on a bench (213, -86) | Why was the 2010 World Cup a big moment? |
| Rohan | adult | A dad who watches the park games and loves the pass before the goal more than the goal. | sits on a bench (95, 125) | Who has scored the most World Cup goals? |
| Aino | adult | A Finnish jogger who finishes every run with passes against a wall. | jogs (100, -185) | How should I warm up before a jog? |

Each new islander has three persona lines that rotate after the greeting, and one topic with a follow-up. Sample lines:

- Margit: "In 1920 a women's team, Dick, Kerr Ladies, drew about 53,000 fans to Goodison Park. A year later the FA banned women's teams from its grounds."
- Fatou: "Players call out "voy!", Spanish for "I'm going!", when they go for the ball, so nobody bumps into each other."
- Joaquín: "At home we say fútbol. My cousin in Brazil says futebol, and in Italy they say calcio!"
- Pieter: "Visit the stadiums sculpture in the museum: you can lay the pitch, raise the stands and swing up the arch."
- Ayelén: "North Beach Rocks is a fishing spot just along the beach. Fishing needs patience, like waiting for the right pass."
- Losa: "Losing well matters: shake hands, say well played, and practise for next time."

## Topics covered

- **Football around the world:**
  - Copacabana beach football;
  - street football and the panna;
  - futsal in Uruguay, Spain and Portugal;
  - Japan's 2011 Women's World Cup;
  - the Africa Cup of Nations;
  - football, soccer, fútbol, futebol, calcio and sakkā;
  - Uruguay 1930;
  - Korea/Japan 2002, South Africa 2010 and the 2026 World Cup;
  - Greece 2004 and Morocco 2022;
  - team nicknames: Football Ferns, Matildas, Super Falcons, All Whites and Helmarit.
- **The women's game:**
  - Dick, Kerr Ladies and the 1921–1971 FA ban, with the German and Brazilian bans;
  - the first Women's World Cup in 1991;
  - 2023 in Australia and New Zealand;
  - Marta, Homare Sawa, Christine Sinclair and Aitana Bonmatí, named with documented facts only.
- **Para and inclusive football:** blind football (the rattle ball, "voy", guides, the Paralympics), powerchair football, deaf football, amputee football and walking football.
- **Roles beyond players:** referee, VAR operator, coaches (girls' team, under-7s, goalkeepers, retired), groundskeepers (grass and sand), kit manager, physio, team cook, commentator, scout, analyst, ball kid, ferry crew, stadium architect and boot-maker.
- **Skills and habits:**
  - first touch, scanning, the half-turn, both feet, passing speed, aiming, sole rolls and keep-ups;
  - warm-up and cool-down, water, sleep, rest days and sun safety;
  - "if in doubt, sit them out";
  - respect for the referee, fair play, losing and winning well, welcoming newcomers, and being a good fan.
- **Island tie-ins**, only to things that exist:
  - museum sculptures: stadiums, boots, laced leather, the 1970 ball, VAR, the 1991 Women's World Cup, 1930, the 1891 penalty and futsal;
  - arcade games: Island Strikers, Pass Puzzles and Breakaway Run;
  - fishing spots: North Beach Rocks, Lifebuoy Point, the South Pier Fishing Station, the East Jetty Spiral and Turtle Bank;
  - the Jetty Shooting Challenge ring;
  - the learning paths and the Matchday Ferry;
  - the Old Town book machine (Marta's pop-up book);
  - the Konbini, the Coconut Café and the farm.

Rules, enforced by `tests/townsfolk-cast.cjs` (word list and lengths) and by review:
- no betting, gambling, alcohol or brands (the 1970 ball is "the 1970 ball", never by maker);
- no politics and no rivalry put-downs;
- no invented quotes from real people;
- lines of at most two sentences and 170 characters;
- answers of at most 260 characters.

## Fact sources (checked October 12, 2026)

- **FA ban, 1921–1971; Dick, Kerr Ladies, about 53,000 at Goodison Park, Boxing Day 1920.** The FA, "History of women's football" (thefa.com); National Football Museum, "Dick, Kerr Ladies".
- **German ban (DFB, 1955–1970) and Brazilian ban (1941–1979).** DFB history pages; Museu do Futebol (São Paulo), "Women's football in Brazil".
- **First FIFA Women's World Cup, China 1991: USA 2–1 Norway.** FIFA tournament archive; also the museum's wwc-1991 story (`lib/museum/museumStories.ts`).
- **Women's World Cup 2011, Germany.** FIFA tournament archive (fifa.com):
  - Japan beat the USA 3–1 on penalties after 2–2;
  - Homare Sawa won the Golden Ball and the Golden Boot.
- **Women's World Cup 2023, Australia and New Zealand.** FIFA tournament archive:
  - the first with 32 teams;
  - Spain beat England 1–0 in the Sydney final;
  - New Zealand beat Norway 1–0 for their first win;
  - Australia reached the semi-finals.
- **Marta.** FIFA:
  - 17 Women's World Cup goals, the record;
  - six FIFA World Player awards (2006–2010, 2018);
  - six tournaments, 2003–2023, with goals in five.
- **Christine Sinclair: 190 international goals, the all-time record.** Canada Soccer; FIFA.
- **Aitana Bonmatí: Ballon d'Or 2023 and 2024.** France Football / Ballon d'Or official results.
- **Nigeria's Super Falcons.** CAF (cafonline.com):
  - at every Women's World Cup since 1991;
  - the most Women's Africa Cup of Nations titles.
- **Africa Cup of Nations.** CAF:
  - first held in Sudan in 1957 with Egypt, Sudan and Ethiopia, and Egypt won;
  - Egypt have seven titles;
  - 24 finalists since 2019.
- **Morocco, first African men's World Cup semi-finalist (2022).** FIFA.
- **FIFA Futsal World Cup.**
  - Spain won in 2000 and 2004; Portugal won in 2021.
  - Futsal began in Montevideo in 1930 (Juan Carlos Ceriani), with a small low-bounce ball and unlimited substitutions: FIFA Futsal Laws of the Game, and the museum's futsal-1989 story.
- **Copacabana.** FIFA: the first FIFA Beach Soccer World Cup was held there in 2005 (already cited in `coralCayNpcs.ts`).
- **Beach soccer.**
  - Barefoot play, three 12-minute periods, no offside, rolling substitutions, protected overhead kicks.
  - Law 1: the sand must be fine, level and free of pebbles and shells.
  - Source: FIFA Beach Soccer Laws of the Game 2024-25.
- **Blind football.** IBSA Blind Football rules; International Paralympic Committee (paralympic.org):
  - a ball with a noise-making device;
  - "voy";
  - guides behind the goal;
  - silent spectators during play;
  - Paralympic since Athens 2004;
  - Brazil won gold in 2004, 2008, 2012, 2016 and 2020.
- **Powerchair football.** FIPFA Laws of the Game (fipfa.org): four a side, a 13-inch (33 cm) ball, chair guards, and a 10 km/h speed limit.
- **Amputee football.** World Amputee Football Federation rules:
  - seven a side;
  - goalkeepers with an upper-limb amputation;
  - deliberate crutch contact is handball.
- **Deaf football.**
  - Football is played at the Deaflympics: ICSD (deaflympics.com).
  - Referees in deaf football raise a flag with the whistle: ICSD / national deaf football association match guidance.
- **Walking football: no running, made for older players.** The Walking Football Association (UK) rules.
- **Laws of the Game.** IFAB Laws of the Game (theifab.com):
  - 17 Laws;
  - Law 1: lines of equal width, at most 12 cm;
  - Law 4: team colours must be distinguishable from each other and from the officials, keepers distinct, and no jewellery;
  - Law 5: the referee's decisions are final, and the advantage signal is both arms forward;
  - Law 12: dissent is a caution;
  - Law 12: a keeper may handle only in their own penalty area.
- **Penalty kick introduced in 1891 on William McCrum's proposal.** IFAB history; Irish FA; also the museum's penalty-1891 story.
- **VAR.** IFAB VAR protocol; FIFA; the museum's var-2018 story:
  - first used at a World Cup in 2018;
  - it reviews goals, penalties, direct red cards and mistaken identity;
  - the referee decides.
- **First live radio commentary of a football match in Britain: Arsenal v Sheffield United, 22 January 1927.** BBC History.
- **The 1970 World Cup ball.** The museum's telstar-1970 story; FIFA:
  - 32 panels (12 pentagons, 20 hexagons), black and white for TV;
  - 1970 was the first World Cup broadcast in colour;
  - yellow and red cards were first used at the 1970 World Cup (Ken Aston's idea).
- **Ball history.** The museum's laced-leather story; IFAB Law 2: laced leather balls that got heavy when wet, size 5 at 68–70 cm and 410–450 g, and smaller sizes for younger players.
- **Boots.** The museum's boots story: heavy 1800s work boots with steel toe caps, screw-in studs at the rain-soaked 1954 final, light synthetics today.
- **Stadiums.**
  - The museum's stadiums story: the Maracanã opened in 1950, the 199,854 crowd, and Wembley's arch at 133 m, which helps support the roof (Wembley Stadium).
  - Estadio Centenario: built for 1930 and named for the centenary of Uruguay's first constitution (1830). Source: FIFA, AUF.
  - Under-pitch heating: stadium groundskeeping guides, e.g. the Premier League and the Institute of Groundsmanship.
- **1930 World Cup in Uruguay, 13 teams, Uruguay won.** FIFA.
- **2002 World Cup.** FIFA: the first in Asia and the first co-hosted, and Brazil won. **J.League started in 1993:** J.League official history.
- **2010 World Cup.** FIFA: the first in Africa, Spain won, and the opening match was at Soccer City, Johannesburg.
- **Greece won Euro 2004, beating Portugal in the opening match (2–1) and the final (1–0).** UEFA.
- **2026 World Cup.** FIFA:
  - Canada, Mexico and the United States;
  - the first with 48 teams;
  - Mexico was the first three-time host (1970, 1986, 2026);
  - New Zealand qualified.
- **Pelé: three World Cups (1958, 1962, 1970). Miroslav Klose: 16 men's World Cup goals.** FIFA.
- **The word "soccer"**, from "association" football in 1880s England. Sources: Oxford English Dictionary / Merriam-Webster etymology. Names in other languages: standard dictionaries.
- **Team nicknames:**
  - Football Ferns and All Whites (New Zealand Football);
  - Matildas (Football Australia);
  - Super Falcons (Nigeria Football Federation);
  - Helmarit (Football Association of Finland).
- **Running distance: about 10 km for professional outfield players per match.** FIFA match physical reports / FIFA Training Centre.
- **Warm-up.**
  - FIFA 11+ and "11+ Kids", injury-prevention warm-ups: FIFA Medical (fifamedicalnetwork / FIFA Training Centre).
  - Youth 11v11 from under-13 in England: The FA youth football development (thefa.com).
- **"If in doubt, sit them out".** UK Government / Sport and Recreation Alliance, UK Concussion Guidelines for Non-Elite (Grassroots) Sport, 2023.
- **Sleep and food.**
  - Sleep: 6–12 years 9–12 h, 13–18 years 8–10 h. AASM consensus (Paruthi et al., J Clin Sleep Med 2016).
  - Football fuel and meal timing: FIFA "Nutrition for Football"; Better Health Channel; Sports Dietitians Australia (already cited in `coralCayNpcs.ts`).
- **Mowing stripes:** light reflected off grass bent in opposite directions. Groundsmanship guides; the island's pitch-stripes notes in `docs/performance-guide.md`.

Coaching tips (warm-ups, aiming, half-turn, sole rolls, welcoming newcomers, losing well) are advice, not rules, and are phrased that way. The personas are fictional islanders. Real players are named only with the documented facts above, never with quotes.

## Heat

How it was measured:
- a production build (`next build` + `next start`, own dist dir);
- Playwright Chromium, phone profile 390×844 touch at DPR 2, at 4× and 6× CPU throttle;
- before = `?npcmore=0` (today's cast and places) and after = the new cast and spread, in the same build;
- the host Mac was shared with several other agents' servers and browsers, so absolute times are inflated and drift between runs.

**Interleaved synchronous bench** (contention-robust):
- before and after pages are open in one browser;
- each iteration is `islandNpcs.update(1/30)` plus a full render with the shadow pass;
- 5–6 alternating rounds of 45 iterations each, reported as the median ms per frame;
- the 50%-of-frame line for a 30 fps walk is 16.7 ms.

| View | 4× before → after | 6× before → after | Drawn townsfolk |
|---|---|---|---|
| Island Square spawn (103, −8) | 15.3 → 14.8 (run 1: 14.6 → 13.9) | 18.5 → 17.8 (run 1: 18.0 → 20.2) | 15 → 21 |
| Konbini, busiest store view (80, −40) | 13.0 → 14.2 | 17.3 → 18.0 | 17 → 26 |
| Pier cafés, busiest new beach area (108, 204) | 13.2 → 14.2 (runs 1–2: 11.4 → 13.5, 12.2 → 15.4) | 22.3 → 21.6 (runs 1–2: 16.9 → 18.7, 19.6 → 23.5) | 12 → 16 |
| North Beach (65, −218) | 2.3 → 5.5 | 5.0 → 7.5 | 1 → 9 |
| East Jetty plaza (345, 68) | 2.8 → 3.5 | 4.4 → 6.8 | 1 → 5 |

**At 4×, every view stays under the 50% line after the change.** Spawn changed within noise, and the store and café views added about 1–2 ms.

**At 6×, the spawn, Konbini and café baselines were already at or over the line on this loaded host before any change.** The cast adds about 0–2 ms there, inside the run-to-run spread. This matches the October 12 guidance (+20–25 safe walkers per view at 6×): no view gains more than 9 drawn, or about 5 on screen.

**Real-loop rAF sweep** (the old `run.mjs` method, walking input every 400 ms, 8 s, two reps):
- 4× spawn 14.2 → 16.1 and 21.6 → 19.9 ms;
- 4× cafés 19.4 → 20.4 and 22.5 → 22.4;
- 4× North Beach 7.3 → 8.9 and 7.8 → 10.5;
- 30 fps held at 4× everywhere.

The baselines swung 50% between reps, so the bench above is the comparison to trust.

Thinning applied after the first bench:
- Joaquín and Ernesto moved from beside the spawn to the Old Town shop row;
- sunbather Tavita moved from the pier cafés to Palm Coast beach;
- **still townsfolk hold their solved pose.** A bench or towel sitter re-solves only for two frames after a wave, a bump or a truck. Measured: 0 pose solves per second at the spawn for Margit and Kwame.

Runtime checks (production build, phone):
- **Far poses:** far new walkers posed at exactly 10 Hz in a 30 fps loop (FAR_POSE 20 m), and off-screen ones 0.
- **Fishing focus mode:** `setFocus({r:−1})` held all 149 townsfolk at North Beach, including all 60 new ones. Over 2.5 s there were 0 position or joint changes and 0 poses; without focus, 4 were moving.
- **Memory:** heap 150 → 159 MB at the spawn.
- **Draw calls:** unchanged. Townsfolk shadows are batched, and the bean meshes were already shared.

Screenshots, all in the session scratchpad `npcs-more/`:
- `shots/after-<area>-{phone,desktop}.png` for 13 areas;
- `shots/before-<area>-phone.png`;
- `shots/talk-*.png`: conversations, including Margit's three rotating openers;
- `close-sheet.png`: bench, towel, sunbathing, kid and grandparent poses;
- `spread-before-main.png`, `spread-after-main.png` and `spread-after-east.png`: maps, red = new, orange = moved.

## Files

- `lib/town/townsfolkCast.ts`: the 60 new islanders, voices for all 89 regulars, the spread, age profiles and the `?npcmore=0` switch.
- `lib/town/npcOpeners.ts` and `components/NpcConversation.tsx`: rotating openers.
- `lib/graphics/npcSeatPose.ts`: bench, sit and lie poses from the freestyle stances.
- `lib/graphics/islandNpcs.ts`:
  - exact spots for still poses and their fixed heading;
  - the trick pose and the pose hold;
  - age height profiles;
  - name tags kept the same size on smaller rigs.
- `lib/town/beanLooks.ts`: `NpcLookOverride` (skin tone, hair, hair colour, headwear, build, top).
- `lib/town/npcDialogues.ts`: the new fields, plus where voices, moves and the cast join `NPC_DIALOGUES`.
- `tests/townsfolk-cast.cjs` (in `npm test`); `tests/bean-looks.cjs` now accepts the cast's explicit headwear.

## Kit Shop (Oct 12 2026, `lib/shop/shopCast.ts`)

The clerk (Femi) and five shoppers (Yuna, Tane, Yusuf, Nadia and her son Oskar) inside `/shop`, same rules as above. Sources:

- Team and goalkeeper colours, compulsory equipment (shirt with sleeves, shorts, socks, shin guards covered by the socks, footwear), no jewellery: [IFAB Law 4 The Players' Equipment](https://www.theifab.com/laws/latest/the-players-equipment/).
- Size 5 ball 68–70 cm, 410–450 g at the start: [IFAB Law 2 The Ball](https://www.theifab.com/laws/latest/the-ball/).
- Numbers first worn in English league matches in 1928; 1–11 traditionally by position (1 goalkeeper, 9 centre forward, 7 and 11 wingers): [Wikipedia · Squad number (association football)](https://en.wikipedia.org/wiki/Squad_number_(association_football)).
- The 32-panel ball (12 pentagons, 20 hexagons) and its black-and-white pattern for television; the 2014 World Cup ball's six panels; leather balls absorbing water: [Wikipedia · Ball (association football)](https://en.wikipedia.org/wiki/Ball_(association_football)), [Wikipedia · Adidas Brazuca](https://en.wikipedia.org/wiki/Adidas_Brazuca) (brand named here only as a source; the lines name none).
- Stud types by surface (firm ground moulded, soft ground screw-in, artificial turf, indoor flat soles): [Wikipedia · Football boot](https://en.wikipedia.org/wiki/Football_boot).
