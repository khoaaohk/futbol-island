/**
 * Story chapters (Nov 7 2026, docs/fishing.md "Return hooks"): a longer fish tale that unlocks bit by bit on repeat catches, so a
 * kid has a reason to catch the same animal again. Same voice and rules as ./fishStories.ts: warm, kid-friendly (ages 6-12), never
 * scary, and NO new football claims. Every football detail in a chapter is already in that animal's sourced `club.fact` (or, for an
 * Island Legend, its sourced legend fact in ./legendary.ts); the animal's adventures are ISLAND FICTION.
 *
 *  - Fishbook species: the fish tale (`story`) is chapter 1 (the first catch); chapter 2 unlocks on the 3rd catch, chapter 3 on the
 *    5th (SPECIES_CHAPTER_AT). The count is the Fishbook's own catch count, so nothing extra is saved.
 *  - Island Legends are caught once and released, so their chapters come back another way: the legend's island story is chapter 1
 *    (the release), then it is "seen again" after 5 and after 15 more catches at its spot (LEGEND_CHAPTER_AT, counted in the
 *    hooks save, fishingHooks.ts).
 * Nothing expires and nothing is lost: a chapter, once unlocked, stays unlocked.
 */
export const SPECIES_CHAPTER_AT=[1,3,5] as const;
export const LEGEND_CHAPTER_AT=[0,5,15] as const;

/** Chapters 2 and 3 for ~30 favourite species (chapter 1 is the species' `story`). */
export const SPECIES_CHAPTERS:Readonly<Record<string,readonly [string,string]>>={
 // ---- The shared ten
 shrimp:['The shrimp has started a little fan club on the sand. Every new member gets a feeler wave, just like the Shrimpers\' fans wave their scarves.',
  'Today the shrimp found a shell shaped like a badge. It carries it everywhere now, proud as the shrimp on Southend United\'s crest.'],
 sardine:['The sardine shoal has learned to swim in one big shape, like a crowd doing a wave. Nobody is in charge: everyone just watches their neighbour.',
  'Some sardines say a fish name is a funny nickname for a team. This sardine says the Santos fans got it right: "Peixe" is the best name there is.'],
 mackerel:['The mackerel counted the fishing boats one morning and gave up after a hundred. In a port as busy as Vigo, it would never finish.',
  'Now the mackerel guides young fish past the busy boats. It says the trick is the same as a winger\'s: find the space and go.'],
 'sea-bass':['The sea bass found an old clay pot on the sea floor and decided it came from the Greek sailors of long ago. Nobody can prove it wasn\'t.',
  'Every evening the sea bass tells the young fish about 1993, when Marseille became the first French club to win the Champions League. They have heard it many times, and they still clap their fins.'],
 herring:['The herring made a tiny flag out of seaweed and a white shell. It is not quite a pirate flag, but it waves it with all its heart.',
  'The herring has started a shoal that waves its fins together as it swims. It says a harbour team deserves a flag-waving harbour crowd, like the fans of FC St. Pauli.'],
 cod:['The cod has gathered a few friends. Four cod in a line, sliding left and right together, like a back four keeping its shape.',
  'Now the little cod army is famous on the island. When it swims past the pier, the crabs clap, just as Fleetwood\'s "Cod Army" cheers its team.'],
 haddock:['The haddock practised looking famous: chin up, fins out, big smile. It still is not sure anyone noticed.',
  'Then a fisher on the pier held up a toy fish and waved it. The haddock decided that was a Harry Haddock wave, just for it, and swam off very happy.'],
 tuna:['The tuna swam a lap of the whole island without stopping once. Sailors call that a good trip; the tuna calls it a warm-up.',
  'Next season the tuna wants to swim to a big port and see the ships come in. It has heard that a seagull called Marinos-kun will be waving.'],
 shark:['The little shark has been practising its smile in a rock pool mirror. Too many teeth? It decided a smile is a smile.',
  'Now it swims beside the bigger fish like a young player in the first team. One day, it says, it will be a real Tiburón.'],
 octopus:['The octopus has made its first guess: it pointed one arm at the crab and one at the shrimp in a race. It chose the shrimp, and the shrimp won!',
  'Paul the Octopus got 8 out of 8 at the 2010 World Cup. This octopus is now on 3 out of 5, and it says that is a very good start.'],
 // ---- Spot specials and signature species
 anchovy:['The anchovy joined a shoal of thousands. On its own it is tiny, but together they are as big as a stadium crowd.',
  'Now the shoal swims in a loop round the harbour wall every morning, and the anchovy is sure it can hear someone chanting "Boquerones!"'],
 'short-mackerel':['The short mackerel practised its raging face all week. The other fish say it mostly looks surprised.',
  'In the end it found its own way to be fierce: it never stops running, from the first minute to the last, just like a hard-working midfielder.'],
 hake:['The hake has a favourite rock that it calls its home ground. No other fish is allowed to sit there on match days.',
  'It still dreams of Brittany\'s port, where Lorient are "Les Merlus". It has even learned to say "Merlu" with a perfect French accent.'],
 'red-snapper':['The red snapper shines its scales every morning, so its red is as bright as a fresh team shirt.',
  'It says it is a long way from the Indian Ocean, but wherever a Red Snapper swims, the Maldives have a fan.'],
 'yellowfin-tuna':['The yellowfin raced the fishing boats out of the bay and won. Then it raced them back again, just to be sure.',
  'It now calls itself an honorary "Atunero". The fishers of Manta, it says, would understand.'],
 'blue-shark':['The blue shark swam a lap of honour round the harbour wall, then another one, because nobody told it to stop.',
  'It has started teaching younger fish to swim in blue formations. Cape Verde\'s "Blue Sharks", it says, would be proud.'],
 hammerhead:['The hammerhead watched a game of crabs chasing a pebble and saw every move at once, left side and right side.',
  'The crabs now ask it to be their referee. It is fair, it is calm, and with eyes on both ends it never misses a foul.'],
 'great-white':['The great white glides past the harbour so slowly that the little fish stop to watch, like a trophy parade going by.',
  'It says Platense were the very first Honduran league champions in 1965, and that being first is something you keep for ever.'],
 clownfish:['The clownfish and its anemone have a new game: the clownfish darts out, and the anemone waves it home, like a keeper calling for the ball.',
  'Even when the current is strong, the clownfish never leaves its anemone. Teammates who look after each other, it says, win a lot of cups.'],
 seahorse:['Seahorse dads carry the babies, and this one is very proud. It has a tiny pouch full of little seahorses ready to cheer.',
  'The babies have grown and swum off to find reeds of their own. The dad seahorse holds on tight to its reed like a flag, just as Salernitana\'s fans do.'],
 stingray:['The stingray finally balanced a shell on its tail for three whole seconds. It wants it written down as a club record.',
  'Now it glides along the sand with a round pebble on its tail, like the stingray with a football on the Illawarra Stingrays\' logo.'],
 'whale-shark':['The whale shark opened its huge mouth and only little things went in: tiny shrimp, tiny plankton. Gentle giants eat small.',
  'It thought about trying out as a goalkeeper. It is very big and very calm, but it would rather just float and watch.'],
 coelacanth:['The coelacanth told the young fish a story from long, long ago. They asked how long. It said: older than the boulders.',
  'Scientists once thought it was gone for ever, but here it is. The Comoros team took its name, "Les Cœlacanthes", and the coelacanth says that is the best surprise of all.'],
 piranha:['The piranha swam in from the river and was amazed by the salty sea. It has decided to stay for a visit.',
  'It nibbles seaweed, not toes, and the other fish have stopped worrying. It even cheers for teams it has never met.'],
 footballfish:['Down in the dark, the footballfish switched its little light on and off, like a match ball catching the floodlights.',
  'A lanternfish asked if it was a real ball. The footballfish said it was round, it glowed, and it was very easy to spot, just like the black-and-white Telstar on TV.'],
 'blue-marlin':['The marlin leapt so high this week that a seagull had to swerve. It said sorry, then did it again.',
  'Every Friday it swims a special loop. Somewhere, it says, a whole town is having a Fish Friday, and a marlin should join in.'],
 'ocean-sunfish':['The sunfish floated on its side in the warm water all afternoon. It calls this training.',
  'It tried to imagine 173,850 fans at the Maracanã and lost count at twelve. It says that is a lot of fans, and it would have needed a very big seat.'],
 'edible-crab':['The crab practised its sideways shuffle until it could cover the whole rock pool without turning round, like a defender holding the line.',
  'Now when Cromer Town score, it claps its claws twice: once for the goal, once for "The Crabs".'],
 moray:['The moray poked its head out of its crack, looked left, looked right, and went back in. A careful player always checks the space.',
  'It still opens and closes its mouth as if it is singing. The other eels have started joining in, a little choir in the rocks.'],
 'lemon-shark':['The lemon shark found a yellow sponge and decided it looked like a kit. It wore it for one whole tide.',
  'It likes the story of Sharks FC and their Sharks Stadium. One day, it says, the island will build a stadium for sharks too.'],
 'tiger-shark':['The tiger shark\'s stripes have faded a little as it grew, like an old shirt that has been washed many times.',
  'It still warms up with a lap of the beach before every tide. A nickname that starts as a joke, it says, can become something you are proud of.'],
 parrotfish:['The parrotfish crunched coral all morning and left a little trail of white sand behind it. It calls that sand its own penalty spot.',
  'Little Curaçao reached the World Cup, and the parrotfish says small does not mean small dreams. It has started on a whole new beach.'],
};

/** Chapters 2 and 3 for every Island Legend (chapter 1 is its island story, at the release). Seen again after 5 and 15 more
 *  catches at its spot. Each keeps to its sourced legend fact. */
export const LEGEND_CHAPTERS:Readonly<Record<string,readonly [string,string]>>={
 'legend-south-pier':['Old fishers saw three gold stripes flash past the South Pier again. Old Three-Cups had come back to see who was fishing.',
  'This time it circled the pier three times, once for each gold stripe. Pelé won the World Cup three times, in 1958, 1962 and 1970, and the old tuna seems to remember every one.'],
 'legend-west-pier':['Eight long arms waved from under the Lifebuoy Point boardwalk. The Black Spider was keeping its goal, as always.',
  'Lev Yashin is the only goalkeeper ever to win the Ballon d\'Or, in 1963. The Black Spider has stopped every crab that tried to sneak past it this year, and it is aiming for a record of its own.'],
 'legend-harbour-wall':['The harbour keepers saw the old grouper by the wall again, watching the young fish train.',
  'Sir Alex Ferguson managed Manchester United for more than 26 years. Old Captain has looked after the harbour wall for so long that the young fish call it the boss.'],
 'legend-north-rocks':['Claw marks appeared in the sand by the rock pools again. Iron Claws was back on patrol.',
  'A pebble rolled towards its crack and Iron Claws snapped it away in a flash. Gordon Banks\'s 1970 save from Pelé\'s header is called the greatest save ever, and Iron Claws is still practising its own.'],
 'legend-west-cove':['Divers at West Cove saw the patterned carpet shark lying in its usual place. Still unbeaten.',
  'Arsenal went 38 Premier League games unbeaten in 2003–04 and were called "The Invincibles". The Invincible of West Cove has never lost a game of hide-and-seek, and it does not plan to start now.'],
 'legend-deep-sea-boat':['The boat\'s crew spotted a golden fin far out in the blue bay. The Golden Marlin had come back to race.',
  'It won the race, of course, and then won it again for good measure. Lionel Messi has won the Ballon d\'Or eight times, and the marlin is still counting its wins.'],
 'legend-deep-sea-boat-west':['A swordfish shot past the boat so fast that the spray reached the deck. Record Breaker was out again.',
  'Canada\'s Christine Sinclair scored 190 goals for her country. Record Breaker has been chasing its own records west of Summit Isle, and it beat its fastest lap today.'],
 'legend-east-pier':['A huge ray weaved in and out of the spiral jetty\'s posts again. The Dribbler was showing off.',
  'At the 1986 World Cup, Diego Maradona dribbled from his own half past England\'s players and scored the Goal of the Century. The Dribbler went past every post on the jetty today without touching one.'],
 'legend-causeway-gate':['A shoal of thousands swept past the seawall gate behind a giant silver herring. The Shoal Queen was leading again.',
  'On Boxing Day 1920, about 53,000 people watched the Dick, Kerr Ladies play at Goodison Park. The Shoal Queen\'s crowd is almost that big, and every fish in it follows her.'],
 'legend-causeway-channel':['Sixteen silver stripes flashed under the causeway. Sixteen Stripes was racing through the channel again.',
  'Germany\'s Miroslav Klose scored 16 goals at men\'s World Cups. Sixteen Stripes says one stripe for every goal is a very good way to remember them.'],
 'legend-turtle-bank':['The shark nobody thought much of cruised over the sand bank again, bigger than ever.',
  'Almost nobody expected Leicester City to win the Premier League in 2015–16, but they did. The Underdog says the little fish on the bank should never stop believing.'],
 'legend-coral-garden':['A rainbow flash in the coral garden: the Queen of the Reef was back, visiting her favourite corals.',
  'Brazil\'s Marta has scored 17 goals at Women\'s World Cups, more than any other player. The Queen of the Reef has visited more reefs than any other fish, and she has her eye on one more.'],
 'legend-sharks-beach':['Twin Header turned its wide head left, then right, near Sharks Beach Point. Two looks, two ideas.',
  'Zinedine Zidane scored two headers in the 1998 World Cup final as France beat Brazil 3–0. Twin Header nudged two floating shells into a rock pool today, one with each side of its head.'],
 'legend-farm-beach':['A giant striped lionfish spread its fins like a mane off Farm Beach. The Lisbon Lion was back.',
  'In 1967 Celtic became the first British club to win the European Cup, and the team are remembered as the Lisbon Lions. The lionfish shakes its mane whenever it hears the word "first".'],
 'legend-summit-cove':['Deep in the boulder cove, the ancient fish was seen again, as calm as the rocks around it.',
  'Uruguay hosted the very first World Cup in 1930, and won it. The First Champion was the first fish ever seen in the cove, and it likes to remind the newcomers.'],
 'legend-summit-palm':['Five white spots shone on a big crab\'s shell by the lone palm. Five-Crown Crab was walking its kingdom.',
  'Real Madrid won the first five European Cups in a row, from 1956 to 1960. Five-Crown Crab says five crowns is the perfect number, and it polishes each one.'],
 'legend-summit-lookout':['A barracuda with two tall fins patrolled the stepping-stone boulders again. Back-to-Back was on guard.',
  'Managed by Brian Clough, Nottingham Forest won the European Cup in 1979 and again in 1980. Back-to-Back did two laps of the boulders today, one for each.'],
 'legend-summit-ledge':['A sailfish leapt high at the drop-off, higher than the lookout rocks. The Leaper was back.',
  'Cristiano Ronaldo has scored more goals for his country than any other men\'s player. The Leaper jumped so high today that the seagulls cheered.'],
 'legend-deep-sea-boat-2':['A long silver ribbon with a crimson crest led a deep shoal past the boat. Captain Ribbon was out in front.',
  'At the 2011 Women\'s World Cup, Japan\'s captain Homare Sawa won the Golden Ball and the Golden Boot, and Japan won the title. Captain Ribbon says a good captain leads by example, all the way down to the deepest fish.'],
 'legend-deep-sea-boat-west-2':['The giant flatfish was right where it always is, on the same patch of the green channel.',
  'Paolo Maldini played all 25 seasons of his career for AC Milan. Old Faithful has stayed on its patch for 25 summers, and it says it is not moving now.'],
 'legend-summit-lookout-2':['A giant silver salmon led the shoal past the lookout again, out in front as always.',
  'Brazil\'s Cafu played in three World Cup finals in a row, in 1994, 1998 and 2002, and was captain in 2002. Three Finals has led the shoal three summers running, and this summer looks like a fourth.'],
 'legend-summit-ledge-2':['A giant amberjack with one bright star on its side cruised along Drop-off Ledge again.',
  'In 1995 Liberia\'s George Weah became the first African player to win the Ballon d\'Or. Lone Star swims alone, but the little fish on the ledge all follow its star.'],
};
