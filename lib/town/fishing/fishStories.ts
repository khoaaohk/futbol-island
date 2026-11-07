/**
 * Fish tales (owner decision, 6 Nov 2026: "every animal gets a sourced football fact plus a 2-3 sentence story"): a short,
 * warm, kid-friendly story (ages 6-12) for every Fishbook species, shown on the catch card and the Fishbook beside the real
 * football fact. The story ties the animal to that fact; it adds no new football claims (every football detail in it is
 * already in the species' sourced `club.fact`), and the animal's playful behaviour is ISLAND FICTION. Never scary, even for
 * sharks (tests/fishing-content.cjs scans every story for a list of scary words).
 *
 * The species added from Nov 2026 on (./shoreSignatures.ts) carry their `story` inline; this map covers the original 73.
 */
export const FISH_STORIES:Record<string,string>={
 // ---- The shared ten
 shrimp:'This little shrimp is proud of its home town team, the Shrimpers. It wiggles its feelers like a fan waving a scarf. Look closely at Southend United\'s badge and you might spot its cousin!',
 sardine:'Sardines swim in big, busy shoals, like a crowd going into a stadium. When rival fans called Santos "fishmongers", Santos fans smiled and took the name "Peixe", the Fish. Pelé played for them for almost 20 years!',
 mackerel:'This mackerel has seen a lot of fishing boats. Celta Vigo\'s city, Vigo, has the biggest fishing port in Europe. So many fish arrive there that the mackerel just waves its tail and swims on.',
 'sea-bass':'This sea bass likes old stories. Marseille are "Les Phocéens", after Greek sailors who started the port long ago. In 1993 OM became the first French club to win the Champions League, and the sea bass still tells everyone.',
 herring:'This herring lives near a harbour full of flags. FC St. Pauli fans from Hamburg\'s harbour wave a skull-and-crossbones pirate flag. The herring thinks it looks great in brown and white.',
 cod:'A cod on its own is quiet, but Fleetwood fans are loud! They call themselves the "Cod Army", because Fleetwood grew up as a big fishing port. This cod likes to swim in formation, like a back four.',
 haddock:'Look closely at the Grimsby crowd and you might spot a fish. Since 1989, fans have waved inflatable "Harry Haddock" fish at matches. This real haddock is a little jealous of all that fame.',
 tuna:'This tuna is fast and loves long trips, just like ships sailing into Yokohama. The club there is called "Marinos", which means sailors. Their seagull mascot, Marinos-kun, waves at the tuna from the stands.',
 shark:'This little shark is a big fan of Junior from Barranquilla. They are nicknamed "Los Tiburones", The Sharks. It practises its friendliest smile for when the team scores.',
 octopus:'Eight arms means eight guesses! At the 2010 World Cup, Paul the Octopus picked the winner of eight matches and got all eight right. This octopus is still practising on its first one.',
 // ---- Harbour Wall
 anchovy:'Anchovies are tiny, but they never give up. Málaga CF are proudly nicknamed "Los Boquerones", the Anchovies. This one dreams of a stadium full of fans chanting its name.',
 'short-mackerel':'This short mackerel has a big, fierce nickname to live up to. Samut Songkhram FC in Thailand are "the Raging Mackerel". It puffs out its gills to look as tough as the team.',
 hake:'This hake swam all the way from Brittany to say hello. FC Lorient are nicknamed "Les Merlus", the Hakes. It wears orange on match days, just like Lorient.',
 'red-snapper':'This red snapper is a long way from the Indian Ocean. The Maldives national team are the "Red Snappers". It keeps its shiny red colours ready like a team kit.',
 'yellowfin-tuna':'Fishermen from Manta in Ecuador know this tuna well. Their club is nicknamed the "Atuneros", the tuna fishermen. The yellowfin swims extra fast whenever it hears that name.',
 barracuda:'This barracuda loves travelling. Antigua Barracuda FC came from a Caribbean island, but played their league matches in the United States. The barracuda says that sounds like a very long away day.',
 'blue-shark':'This blue shark is the colour of Cape Verde\'s shirts. Cape Verde are the "Blue Sharks" and played their first match in 1978. It swims a lap of honour around the harbour wall.',
 hammerhead:'A hammerhead has eyes on both ends of its wide head, perfect for watching the whole pitch. Puntarenas FC in Costa Rica are called the Sharks and the port people. This one would make a great referee.',
 sawshark:'This saw shark can\'t cut a cake, but it can cheer. Corpus Christi FC from Texas are nicknamed "The Sharks". It waves its long snout like a flag on match day.',
 'great-white':'The great white is the giant of the harbour, but this one is a gentle fan. Platense from Honduras are the "White Sharks", and in 1965 they were the first Honduran league champions. It glides past slowly, like a trophy parade.',
 // ---- South Pier
 'red-mullet':'This red mullet is red all over, like a home shirt. PSM Makassar are "Juku Eja", the Red Fish, after their red shirts. It checks its colours in every rock pool it passes.',
 bonito:'Bonito are speedy little tuna, quick on the break. The Solomon Islands team are named after them: the "Bonitos". This one sprints past the pier like a winger.',
 'horse-mackerel':'This small fish has a big story. In Santa Cruz de Tenerife, families once ate cheap chicharros, horse mackerel, so CD Tenerife fans became "Chicharreros". The fish is proud to give a whole crowd its name.',
 dorado:'This dorado shines gold in the sun. Dorados de Sinaloa are named after it, and Diego Maradona once coached them to two finals. The dorado still tries his famous dribbles in the waves.',
 mako:'The mako is one of the fastest sharks in the sea, so it fits a speedy team. Londrina in Brazil are nicknamed "Tubarão", the Shark. It zooms past the pier, then circles back to say hi.',
 thresher:'A thresher shark has a tail as long as its body. FC Crotone\'s crest shows two sharks, and their fans are "gli squali", the sharks. This one swishes its tail like a scarf.',
 'whale-shark':'The whale shark is the biggest fish in the sea, and it only eats tiny food. Elmina Sharks FC come from the coast of Ghana and started out as Coconut Grove Sharks. This gentle giant would make a very calm goalkeeper.',
 'oceanic-whitetip':'This shark has white tips on its fins, like white socks. Djibouti\'s team are the "Sharks of the Red Sea". It cruises along the pier as if it owns the touchline.',
 // ---- Lifebuoy Point
 oyster:'Oysters sit still all day, which makes them excellent listeners. Whitstable Town in Kent are "The Oystermen" and joined the first Kent League in 1909. This oyster has heard every team talk since.',
 'pearl-oyster':'Inside this shell there might be a pearl, as shiny as a winner\'s medal. Al-Khaleej FC in Saudi Arabia are nicknamed "Al-Danah", the Pearls. The oyster keeps its treasure safe like a keeper with the ball.',
 stingray:'This stingray glides along the sand like a ball rolling on grass. The Illawarra Stingrays\' logo shows a stingray with a football over its tail. It keeps trying to balance a shell on its tail too.',
 'gummy-shark':'Gummy sharks have flat teeth for crunching crabs, so it has a friendly grin. Port Melbourne SC are nicknamed "The Sharks". This one smiles at every fan on the boardwalk.',
 'port-jackson':'This shark has a pattern like a harness, like a player in a training bib. Sutherland Sharks from Sydney go back to 1930, and in 2025 became just "Sharks FC". It thinks the short name is easier to chant.',
 seahorse:'In seahorse families, the dads carry the babies. Salernitana\'s symbol is a seahorse, and their mascot was a seahorse called "Ippo". This seahorse curls its tail round a reed like a fan holding a flag.',
 'pacific-seahorse':'This seahorse bobs along very slowly, so it is never late for kick-off: it leaves early. The Southern California Eagles began in 2001 as the Southern California Seahorses. It still prefers the old name.',
 'bull-shark':'This bull shark loves a big crowd. CD Veracruz were the "Red Sharks", and their fans remember a wave of support called "La Tiburomanía". It swims in circles like a Mexican wave.',
 blacktip:'This shark has black tips on its fins, like it dipped them in paint. Chonburi FC in Thailand are "The Sharks", with a shark on the crest. It loves posing like a badge.',
 // ---- North Beach Rocks
 'edible-crab':'This crab walks sideways, like a defender shuffling across the box. Cromer Town in Norfolk are nicknamed "The Crabs". It claps its claws whenever they score.',
 'swimming-crab':'This crab has paddle legs for swimming, and lots of energy. The Mexican club now called Club Jaiba Brava, the Fierce Crab, have fans who call the team "los Jaibos". It practises its fiercest face in a rock pool.',
 'blue-crab':'This blue crab has bright blue claws, like goalkeeper gloves. CD Victoria from Honduras are the "Jaibas Bravas", the Fierce Blue Crabs. It is ready to save anything.',
 mussel:'Mussels hold on tight to the rocks, like a fan hugging the barrier. Shoreham FC are "The Musselmen", after their town\'s old mussel-picking tradition. This one has not let go since kick-off.',
 eel:'This eel can wiggle through the tiniest gap, like a dribbler. FC Volendam are "de Palingboeren", and paling means eel. Even Volendam\'s pop music is called Palingsound, and the eel dances to it.',
 'spiny-lobster':'This lobster has long feelers instead of big claws. Phuket Andaman FC on the island of Phuket are "The Lobsters". It waves its feelers like two flags in the away end.',
 'coconut-crab':'The coconut crab is the biggest crab that lives on land. The Northern Mariana Islands team are the "Blue Ayuyu", their name for this crab. It climbs a palm tree to watch the match.',
 'nurse-shark':'Nurse sharks like to rest on the sea floor, very calmly, like a coach in the dugout. Ranong United in Thailand are "The Andaman Sharks". This one only wakes up for a goal.',
 'sand-tiger':'This shark looks fierce, but it swims slowly and peacefully. Aldosivi from the seaside city of Mar del Plata are nicknamed "El Tiburón", the Shark. It cruises past the rocks like a captain leading the team out.',
 // ---- West Cove
 'cownose-ray':'This ray has a face a bit like a cow\'s nose, and it flaps like it is flying. The Rhode Island Stingrays won their division in 1998. The ray celebrates by flapping extra hard.',
 'tope-shark':'This tope shark travels a long way along the coast, like a team on a tour. Olympic Club de Safi from Morocco\'s Atlantic port are "The Sharks". It always comes back home for the big games.',
 wobbegong:'A wobbegong has a fringe of frills round its mouth, like a beard. Palm Beach SC on Australia\'s Gold Coast, formed in 1966, are the "Sharks". It lies flat on the sand, pretending to be a doormat.',
 arowana:'Arowanas live in rivers and can jump out of the water. PSU Surat Thani City FC in Thailand have an arowana in their nickname. This one just jumps for joy.',
 piranha:'Piranhas live in rivers, not the sea, so this one swam in down the stream. The Hampton Roads Piranhas from Virginia won their league division in 2003 and 2004. It is mostly a friendly nibbler.',
 'sandbar-shark':'This shark loves sandy bays, just like this cove. Hapoel Haifa from the port city of Haifa are nicknamed "The Sharks". It patrols the sand like a sweeper.',
 'reef-shark':'This reef shark lives among bright corals in warm water. FC Ciego de Ávila from Cuba are "Los Tiburones" and have won five Cuban league titles. It does one lap for each title.',
 'dusky-shark':'This shark is grey like a stormy sky. Ghana\'s beach soccer team, who play barefoot on sand, are the "Black Sharks". It loves watching games on the beach.',
 'lemon-shark':'This shark is yellowish, like a lemon. Sharks FC of Port Harcourt had their own Sharks Stadium before they joined Dolphin FC in 2016. It thinks a lemon-yellow kit would be lovely.',
 coelacanth:'The coelacanth is an ancient fish that scientists once thought was gone forever. The Comoros team are "Les Cœlacanthes", after this rare fish from their seas. It is the oldest fan on the island.',
 // ---- Summit Isle
 'pool-seahorse':'This seahorse hides in the seaweed of Boulder Cove. Whitley Bay F.C. took the seahorse as their emblem after a fan competition in 1964-65. It thinks a fan vote is the best way to pick anything.',
 'rockpool-shrimp':'This shrimp is so small it fits in a rock pool. Morecambe F.C. are "The Shrimps", after the shrimping boats of Morecambe Bay. It hops from pool to pool like a player doing ladder drills.',
 'red-reef-shark':'This red shark is very rare, so seeing one is like a cup upset. C.D. Veracruz from Mexico\'s Gulf coast were the "Red Sharks" and won the league twice in the 1940s. It swims past the boulders in its red away kit.',
 'mealy-crab':'This purple crab usually lives in rice fields, far from the sea, so it is on an away trip. Mahasarakham CC F.C. in north-east Thailand are "The Mealy Crabs". It scuttles between the boulders looking for its fans.',
 bloater:'A bloater is not a different fish: it is a whole herring smoked for a treat. Great Yarmouth Town F.C. are "The Bloaters", after their town\'s big catch. This one is very glad it is still swimming.',
 // ---- Deep Sea Boats
 squid:'When a squid is surprised it squirts a cloud of ink. Referees squirt vanishing spray to mark where the wall must stand. The squid says it was spraying lines first!',
 lanternfish:'Lanternfish glow in the dark deep sea, like little floodlights. The first floodlit football match was played at Bramall Lane in Sheffield in 1878. This one switches its lights on for every night game.',
 grouper:'This grouper waits very patiently by its rock. Helenio Herrera\'s Inter played "catenaccio", locking the door at the back, then breaking away fast. The grouper calls that its favourite tactic.',
 sailfish:'The sailfish may be the fastest fish in the sea. The fastest World Cup goal came after 10.8 seconds, scored by Hakan Şükür for Turkey in 2002. The sailfish says it could beat that.',
 anglerfish:'An anglerfish has a glowing lure on its head to trick other fish. Johan Cruyff tricked a Swedish defender at the 1974 World Cup with a fake pass and a drag-back. Now every player knows the Cruyff turn.',
 swordfish:'A swordfish has a long, flat bill like a sword, but it uses it only for fishing. Sheffield United are "The Blades", and their crest has two crossed swords. This one salutes them with its bill.',
 'blue-marlin':'This marlin is a champion jumper. St. John\'s SC in Grenada are the "Marlins", and their town, Gouyave, holds a "Fish Friday" festival every week. The marlin never misses a Friday.',
 'ocean-sunfish':'The ocean sunfish is huge and round and loves sunbathing at the surface. At the 1950 World Cup, 173,850 fans watched Uruguay beat Brazil at the Maracanã. Even the sunfish could not fit in that crowd.',
 // ---- Night and sunset fish
 stargazer:'A stargazer buries itself in the sand with only its eyes poking out, looking at the stars. Brazil wear five stars above their badge, one for each World Cup they have won. The stargazer counts them every night.',
 bigeye:'Bigeyes have huge eyes for seeing in the dark. At the 2014 World Cup, goal-line technology used cameras to watch the line for the referee. The bigeye thinks it could do that job.',
 'flashlight-fish':'This tiny fish has glowing patches under its eyes, like two torches. FK Bodø/Glimt come from Bodø, north of the Arctic Circle, and "Glimt" means gleam. It flashes its lights when they score.',
 'golden-trevally':'A golden fish for the golden hour before sunset. At the 1958 World Cup, Just Fontaine scored 13 goals for France, still the most at one World Cup. The trevally counts to 13 every evening.',
};
