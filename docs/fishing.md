# Fishing and Rosa's market stand

Written 27 Sep 2026; expanded 28 Sep 2026 (56 species, spot specials, rarity reeling, varied approaches; marine mammals and reptiles removed the same day by user decision); 29 Sep 2026: the **Deep Sea Boat** and 8 deep-sea creatures (64 species, 6 spots; see [Deep Sea Boat](#deep-sea-boat-29-sep-2026)). Local only: nothing has been committed or deployed.

User request: "Add fishing-related elements along the island to catch fish to sell at the farmers market for money."

## What it teaches (AGENTS.md)

- **Every species is linked to a real club** whose nickname, home port or fan culture comes from the sea. The catch label shows one verified fact, labelled **Real football fact**; the Fishbook shows it again with a plain-text source credit (for example "Source: Wikipedia"). Kids never see clickable external links (decided Sep 27 2026); the URLs stay in `fishCatalog.ts` and the table below, and `tests/fishing.cjs` asserts the fishing and market UI has no anchors or hrefs.
- **The beats of a catch teach goalkeeper timing** (`KEEPER_LESSONS` in `fishCatalog.ts`, shown as a small toast):
  - Cast: set your stance.
  - Nibbles: a nibble is a feint. Stay set like a keeper who doesn't dive early. The source is Bar-Eli et al. (2007), who studied 286 penalties and found that keepers nearly always dive, although staying in the middle would have saved the most.
  - Tapping on a nibble: "Dived too early", like being sold a striker's dummy.
  - Tapping late: "A touch too late". Keepers wait on their toes, ready to spring.
  - Reeling a big animal that pulls back: "Hold on like a keeper". After a save, a keeper holds the ball tight so nobody scores from the rebound (`PULL_HINT` in `fishingSession.ts`).
- **Game fiction is labelled separately.** The spot names, their blurbs and which fish live where are original fiction, shown as **Island story** in the Fishbook.

## Species and club links

**56 species: 10 shared plus 46 spot-exclusive specials** (Harbour Wall 10, West Cove 10, Lifebuoy Point 9, North Beach Rocks 9, South Pier 8). The roster is fish in the style of Animal Crossing's fish list: real fish, sharks, rays, eels, seahorses, the whale shark and the coelacanth, plus a few crabs, one lobster, shellfish and the octopus. **There are no marine mammals or reptiles** (user decision, 28 Sep 2026). Dolphins, the orca, seals, the sea lion, the dugong and the turtle were dropped entirely, and `tests/fishing.cjs` keeps an explicit denylist of those kinds. The shared ten are the original fish (checked 27 Sep 2026). The 50 specials (`lib/town/fishing/fishSpecials.ts`) were checked on 28 Sep 2026 against the Wikipedia/Wikimedia pages listed, using the infobox nickname field or the article text. Research followed the polite-fetch rules: one request at a time, 1.6 s or more apart (6.4 s after the second 429), cached, generic user agent `FutbolIsland/1.0`. There were two 429s, each honoured with a 5-minute backoff.

- **Real history vs island fiction.** The club fact is real and is labelled **Real football fact**. Which spot an animal lives at, and the spot stories, are **island fiction**; the Fishbook says so.
- **Teaching choices.** When a club has a general nickname ("The Sharks", "Red Fish"), the exact species that stands for it is our choice. For example, Chonburi "The Sharks" is shown as a Blacktip Reef Shark. The fact itself never claims the species.
- **Kid UI.** A plain "Source: Wikipedia" credit, or "Wikipedia (Italian)", or "Wikipedia and Wiktionary". There are no links. The URLs stay in the data and in this table.

| Animal | Spot | Rarity word | Coins | Reel taps | Shadow | Club and story (real) | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Brown Shrimp | Every spot | Common | 3 | 2–3 | small | **Southend United** ("The Shrimpers"): Southend United are "The Shrimpers" because nearby Leigh-on-Sea had lots of shrimp-fishing boats, and a shrimp is on the club badge. | https://en.wikipedia.org/wiki/Southend_United_F.C. |
| Sardine | Every spot | Common | 3 | 2–3 | small | **Santos FC** ("Peixe (Fish)"): In 1933 rival fans teased port-city Santos as "fishmongers", so Santos fans proudly took the nickname "Peixe" (Fish). Pelé played there from 1956 to 1974. | https://en.wikipedia.org/wiki/Santos_FC |
| Mackerel | Every spot | Common | 4 | 2–3 | medium | **Celta Vigo**: Celta Vigo's home city, Vigo, has Europe's biggest fishing port: almost a million tonnes of fish arrive there every year. | https://www.fao.org/newsroom/story/Not-business-as-usual-in-Europe-s-largest-fishing-port/en |
| Sea Bass | Every spot | Common | 4 | 2–3 | medium | **Olympique de Marseille** ("Les Phocéens"): Marseille are "Les Phocéens", after the Greek sailors from Phocaea who founded the port about 600 BC. In 1993 OM became the first French club to win the Champions League. | https://en.wikipedia.org/wiki/Olympique_de_Marseille |
| Herring | Lifebuoy Point, Harbour Wall | Good | 5 | 4–5 | small | **FC St. Pauli**: FC St. Pauli come from Hamburg's harbour district. Fans started waving a skull-and-crossbones pirate flag in the 1980s, and the club now uses it as a logo. | https://en.wikipedia.org/wiki/Skull_and_crossbones_(fraternities_and_sports) |
| Cod | Harbour Wall, West Cove | Good | 6 | 4–5 | large | **Fleetwood Town** ("The Cod Army"): Fleetwood Town's fans are the "Cod Army" because Fleetwood grew up as a big deep-sea fishing port. | https://en.wikipedia.org/wiki/Fleetwood_Town_F.C. |
| Haddock | Harbour Wall, West Cove | Good | 6 | 4–5 | medium | **Grimsby Town** ("The Mariners"): Grimsby Town, "The Mariners", have fans who wave inflatable fish called "Harry Haddock", a tradition that began at FA Cup matches in 1989. | https://gtfc.co.uk/the-return-of-harry-haddock/ |
| Bluefin Tuna | South Pier Fishing Station, Harbour Wall, West Cove | Rare | 9 | 6–8 | huge | **Yokohama F. Marinos** ("Marinos"): "Marinos" means sailors in Spanish, chosen because Yokohama is a big international port. The club mascot is a seagull called Marinos-kun. | https://www.f-marinos.com/en/club |
| Little Shark | Lifebuoy Point, North Beach Rocks, West Cove | Rare | 10 | 10–14 | large | **Junior de Barranquilla** ("Los Tiburones"): Junior, from Barranquilla on Colombia's Caribbean coast, are nicknamed "Los Tiburones": The Sharks. | https://en.wikipedia.org/wiki/Atl%C3%A9tico_Junior |
| Octopus | South Pier Fishing Station, Lifebuoy Point, North Beach Rocks | Legendary | 12 | 10–14 | large | **Paul the Octopus**: At the 2010 World Cup, Paul the Octopus from Sea Life Oberhausen picked the winner of all seven Germany matches and the final: 8 out of 8! | https://en.wikipedia.org/wiki/Paul_the_Octopus |
| Red Mullet | South Pier Fishing Station | Common | 3 | 2–3 | small | **PSM Makassar** ("Juku Eja"): PSM Makassar, from the port city of Makassar in Indonesia, are nicknamed "Juku Eja", meaning Red Fish, after their red shirts. | https://en.wikipedia.org/wiki/PSM_Makassar |
| Bonito | South Pier Fishing Station | Common | 3 | 2–3 | medium | **Solomon Islands national team** ("Bonitos"): The Solomon Islands national team, from a Pacific island nation, is nicknamed the "Bonitos", after a fast fish of the tuna family. | https://en.wikipedia.org/wiki/Solomon_Islands_national_football_team |
| Horse Mackerel | South Pier Fishing Station | Common | 2 | 2–3 | small | **CD Tenerife** ("Chicharreros"): CD Tenerife are nicknamed "Chicharreros". The name comes from chicharros (horse mackerel), a small, cheap fish that poor families in Santa Cruz de Tenerife used to eat. | https://en.wikipedia.org/wiki/CD_Tenerife<br>https://es.wikipedia.org/wiki/Chicharrero |
| Dorado | South Pier Fishing Station | Good | 6 | 4–5 | large | **Dorados de Sinaloa** ("El Gran Pez"): Dorados de Sinaloa are named after the dorado fish and nicknamed "El Gran Pez", the Great Fish. Diego Maradona coached them in 2018-19 and led them to two finals. | https://en.wikipedia.org/wiki/Dorados_de_Sinaloa |
| Mako Shark | South Pier Fishing Station | Rare | 10 | 10–14 | huge | **Londrina EC** ("Tubarão"): Brazilian club Londrina Esporte Clube, from the state of Paraná, are nicknamed "Tubarão": the Shark. | https://en.wikipedia.org/wiki/Londrina_Esporte_Clube<br>https://pt.wikipedia.org/wiki/Londrina_Esporte_Clube |
| Thresher Shark | South Pier Fishing Station | Legendary | 14 | 10–14 | giant | **FC Crotone** ("Gli Squali"): FC Crotone, from the south of Italy, have the shark as their historic symbol, so players and fans are called "gli squali": the sharks. Their crest shows two sharks. | https://it.wikipedia.org/wiki/Football_Club_Crotone |
| Whale Shark | South Pier Fishing Station | Legendary | 18 | 10–14 | giant | **Elmina Sharks FC**: Elmina Sharks FC come from Elmina on the coast of Ghana. The club began as Coconut Grove Sharks and later played in the Ghana Premier League. | https://en.wikipedia.org/wiki/Elmina_Sharks_F.C. |
| Oceanic Whitetip Shark | South Pier Fishing Station | Legendary | 15 | 10–14 | giant | **Djibouti national team** ("Requins de la Mer Rouge"): Djibouti's national team, from a small country on the Red Sea, is nicknamed the "Sharks of the Red Sea" (Requins de la Mer Rouge). | https://en.wikipedia.org/wiki/Djibouti_national_football_team |
| Oyster | Lifebuoy Point | Common | 2 | 2–3 | small | **Whitstable Town** ("The Oystermen"): Whitstable Town, from the seaside town of Whitstable in Kent, England, are nicknamed "The Oystermen". They joined the original Kent League in 1909. | https://en.wikipedia.org/wiki/Whitstable_Town_F.C. |
| Pearl Oyster | Lifebuoy Point | Good | 5 | 4–5 | small | **Al-Khaleej FC** ("Al-Danah"): Saudi club Al-Khaleej FC are nicknamed "Al-Danah", the Pearls. Pearls grow inside pearl oysters. | https://en.wikipedia.org/wiki/Al-Khaleej_FC |
| Smooth Stingray | Lifebuoy Point | Good | 6 | 4–5 | large | **Illawarra Stingrays**: Illawarra Stingrays, a women's club in New South Wales, Australia, was founded in 2006. Its logo shows a stingray with a football over its tail. | https://en.wikipedia.org/wiki/Illawarra_Stingrays_WFC |
| Gummy Shark | Lifebuoy Point | Good | 6 | 10–14 | large | **Port Melbourne SC** ("The Sharks"): Port Melbourne SC, from the port side of Melbourne in Australia, are nicknamed "The Sharks". | https://en.wikipedia.org/wiki/Port_Melbourne_SC |
| Port Jackson Shark | Lifebuoy Point | Rare | 9 | 10–14 | large | **Sutherland Sharks**: Sutherland Sharks FC, from the south of Sydney, trace their roots back to 1930. In 2025 the club renamed itself simply Sharks FC. | https://en.wikipedia.org/wiki/Sutherland_Sharks_FC |
| Seahorse | Lifebuoy Point | Rare | 9 | 6–8 | small | **Salernitana** ("Ippocampo"): The symbol of Salernitana, from the Italian port of Salerno, is a seahorse (ippocampo). A seahorse called "Ippo" was also the club mascot. | https://it.wikipedia.org/wiki/Unione_Sportiva_Salernitana_1919 |
| Pacific Seahorse | Lifebuoy Point | Good | 6 | 4–5 | small | **Southern California Seahorses**: The Southern California Eagles began in 2001 as the Southern California Seahorses, a soccer team from La Mirada, California. | https://en.wikipedia.org/wiki/Southern_California_Eagles |
| Bull Shark | Lifebuoy Point | Rare | 10 | 10–14 | huge | **CD Veracruz** ("Tiburones Rojos"): CD Veracruz, from the port city of Veracruz in Mexico, were known as the "Tiburones Rojos", the Red Sharks. Fans remember a wave of support called "La Tiburomanía". | https://en.wikipedia.org/wiki/C.D._Veracruz |
| Blacktip Reef Shark | Lifebuoy Point | Rare | 10 | 10–14 | large | **Chonburi FC** ("The Sharks"): Chonburi FC, from Thailand, are widely known as "The Sharks", and a shark is on the club crest. | https://en.wikipedia.org/wiki/Chonburi_F.C. |
| Anchovy | Harbour Wall | Common | 2 | 2–3 | small | **Málaga CF** ("Los Boquerones"): Málaga CF, from the port city of Málaga in southern Spain, are nicknamed "Los Boquerones": the Anchovies. | https://en.wikipedia.org/wiki/M%C3%A1laga_CF |
| Short Mackerel | Harbour Wall | Common | 3 | 2–3 | small | **Samut Songkhram FC** ("The Raging Mackerel"): Thai club Samut Songkhram FC are nicknamed "Pla-Tu-Kha-Nong", the Raging Mackerel. Pla thu is the Thai name for the short mackerel. | https://en.wikipedia.org/wiki/Samutsongkhram_F.C. |
| European Hake | Harbour Wall | Common | 3 | 2–3 | medium | **FC Lorient** ("Les Merlus"): FC Lorient, from the port of Lorient in Brittany, France, are nicknamed "Les Merlus": the Hakes. | https://en.wikipedia.org/wiki/FC_Lorient |
| Red Snapper | Harbour Wall | Good | 5 | 4–5 | medium | **Maldives national team** ("Red Snappers"): The national team of the Maldives, an island country in the Indian Ocean, is nicknamed the "Red Snappers". | https://en.wikipedia.org/wiki/Maldives_national_football_team |
| Yellowfin Tuna | Harbour Wall | Good | 6 | 4–5 | large | **Manta FC** ("Atuneros"): Manta FC, from the port city of Manta in Ecuador, are nicknamed "Pesqueros" (Fishermen) and "Atuneros" (Tuna fishermen). | https://en.wikipedia.org/wiki/Manta_F.C. |
| Barracuda | Harbour Wall | Good | 6 | 4–5 | large | **Antigua Barracuda FC**: Antigua Barracuda FC, from the Caribbean island of Antigua, played in the USL Pro league from 2011 to 2013 and had to play their matches in the United States. | https://en.wikipedia.org/wiki/Antigua_Barracuda_FC |
| Blue Shark | Harbour Wall | Rare | 10 | 10–14 | huge | **Cape Verde national team** ("Tubarões Azuis"): Cape Verde's national team are the "Tubarões Azuis", the Blue Sharks. They played their first match on 19 April 1978, against Guinea. | https://en.wikipedia.org/wiki/Cape_Verde_national_football_team |
| Hammerhead Shark | Harbour Wall | Rare | 10 | 10–14 | huge | **Puntarenas FC** ("Tiburones"): Puntarenas FC, from the port of Puntarenas in Costa Rica, are nicknamed "Tiburones" (the Sharks) and "Porteños" (the port people). | https://en.wikipedia.org/wiki/Puntarenas_F.C. |
| Saw Shark | Harbour Wall | Rare | 10 | 10–14 | large | **Corpus Christi FC** ("The Sharks"): Corpus Christi FC, from Corpus Christi in Texas, USA, are nicknamed "The Sharks". They play in USL League One. | https://en.wikipedia.org/wiki/Corpus_Christi_FC |
| Great White Shark | Harbour Wall | Legendary | 16 | 10–14 | giant | **Platense** ("Tiburones Blancos"): Platense, from Puerto Cortés in Honduras, are nicknamed "Tiburones Blancos" (White Sharks). In 1965 they became the first champions of the Honduran national league. | https://en.wikipedia.org/wiki/Platense_F.C. |
| Edible Crab | North Beach Rocks | Common | 2 | 2–3 | small | **Cromer Town** ("The Crabs"): Cromer Town FC, from the seaside town of Cromer in Norfolk, England, are nicknamed "The Crabs". | https://en.wikipedia.org/wiki/Cromer_Town_F.C. |
| Swimming Crab | North Beach Rocks | Common | 3 | 2–3 | small | **Club Jaiba Brava** ("Los Jaibos"): Mexican club Tampico Madero is now called Club Jaiba Brava, the Fierce Crab (a jaiba is a crab), and fans call the team "los Jaibos". | https://en.wikipedia.org/wiki/Club_Jaiba_Brava<br>https://es.wikipedia.org/wiki/Club_Jaiba_Brava<br>https://en.wiktionary.org/wiki/jaiba |
| Blue Crab | North Beach Rocks | Common | 3 | 2–3 | small | **CD Victoria** ("Jaibas Bravas"): CD Victoria from Honduras are nicknamed "Jaibas Bravas", the Fierce Blue Crabs. | https://en.wikipedia.org/wiki/C.D._Victoria |
| Blue Mussel | North Beach Rocks | Common | 2 | 2–3 | small | **Shoreham FC** ("The Musselmen"): Shoreham FC, from Shoreham-by-Sea in West Sussex, England, are nicknamed "The Musselmen" after the town's ancient mussel-picking tradition. | https://en.wikipedia.org/wiki/Shoreham_F.C. |
| European Eel | North Beach Rocks | Good | 5 | 4–5 | medium | **FC Volendam** ("De Palingboeren"): FC Volendam are nicknamed "de Palingboeren". Paling is Dutch for eel: Volendam is an old fishing village, and even its local pop music is called Palingsound. | https://en.wikipedia.org/wiki/FC_Volendam<br>https://en.wikipedia.org/wiki/Volendam |
| Spiny Lobster | North Beach Rocks | Good | 6 | 4–5 | medium | **Phuket Andaman FC** ("The Lobsters"): Phuket Andaman FC, from the Thai island of Phuket, are nicknamed "The Lobsters". The club began in 2009 as Phuket FC. | https://en.wikipedia.org/wiki/Phuket_Andaman_F.C. |
| Coconut Crab | North Beach Rocks | Rare | 9 | 6–8 | medium | **Northern Mariana Islands national team** ("Blue Ayuyu"): The Northern Mariana Islands team is nicknamed the "Blue Ayuyu". Ayuyu is the islands' name for the coconut crab, also called the robber crab. | https://en.wikipedia.org/wiki/Northern_Mariana_Islands_national_football_team |
| Nurse Shark | North Beach Rocks | Rare | 10 | 10–14 | huge | **Ranong United** ("The Andaman Sharks"): Ranong United, from southern Thailand by the Andaman Sea, are nicknamed "The Andaman Sharks". | https://en.wikipedia.org/wiki/Ranong_PJ_United_F.C. |
| Sand Tiger Shark | North Beach Rocks | Legendary | 14 | 10–14 | giant | **Aldosivi** ("El Tiburón"): Aldosivi, from the seaside city of Mar del Plata in Argentina, are nicknamed "El Tiburón": the Shark. | https://en.wikipedia.org/wiki/Club_Atl%C3%A9tico_Aldosivi<br>https://es.wikipedia.org/wiki/Club_Atl%C3%A9tico_Aldosivi |
| Cownose Ray | West Cove | Good | 5 | 4–5 | large | **Rhode Island Stingrays**: The Rhode Island Stingrays were an American soccer team from Providence, founded in 1995. They were division champions in 1998. | https://en.wikipedia.org/wiki/Rhode_Island_Stingrays |
| Tope Shark | West Cove | Good | 6 | 10–14 | large | **Olympic Club de Safi** ("The Sharks"): Olympic Club de Safi, from the Atlantic port of Safi in Morocco, are nicknamed "The Sharks". | https://en.wikipedia.org/wiki/Olympic_Club_Safi |
| Wobbegong | West Cove | Good | 6 | 10–14 | large | **Palm Beach SC** ("Sharks"): Palm Beach SC, an amateur club formed in 1966 at Palm Beach on the Gold Coast of Queensland, Australia, are nicknamed the "Sharks". | https://en.wikipedia.org/wiki/Palm_Beach_SC |
| Arowana | West Cove | Good | 6 | 4–5 | medium | **PSU Surat Thani City FC** ("The Killer Arowanas"): PSU Surat Thani City FC, from southern Thailand, are nicknamed "The Killer Arowanas". Arowanas are river fish. | https://en.wikipedia.org/wiki/PSU_Surat_Thani_City_F.C. |
| Piranha | West Cove | Good | 5 | 4–5 | small | **Hampton Roads Piranhas**: The Hampton Roads Piranhas, a women's soccer team from Virginia, USA, founded in 1995, won their W-League division in 2003 and 2004. Real piranhas live in rivers. | https://en.wikipedia.org/wiki/Hampton_Roads_Piranhas |
| Sandbar Shark | West Cove | Rare | 10 | 10–14 | huge | **Hapoel Haifa** ("The Sharks"): Hapoel Haifa, from the port city of Haifa in Israel, are nicknamed "The Sharks". | https://en.wikipedia.org/wiki/Hapoel_Haifa_F.C. |
| Caribbean Reef Shark | West Cove | Rare | 10 | 10–14 | huge | **FC Ciego de Ávila** ("Los Tiburones"): FC Ciego de Ávila from Cuba are nicknamed "Los Tiburones" (the Sharks) and have won five Cuban league titles, most recently in 2014. | https://en.wikipedia.org/wiki/FC_Ciego_de_%C3%81vila |
| Dusky Shark | West Cove | Rare | 10 | 10–14 | huge | **Ghana beach soccer team** ("Black Sharks"): Ghana's national beach soccer team, which plays football barefoot on sand, is nicknamed the "Black Sharks". | https://en.wikipedia.org/wiki/Ghana_national_beach_soccer_team |
| Lemon Shark | West Cove | Rare | 10 | 10–14 | huge | **Sharks FC**: Sharks FC of Port Harcourt, Nigeria, had their own ground, the Sharks Stadium. In 2016 they merged with Dolphin FC to form Rivers United. | https://en.wikipedia.org/wiki/Sharks_F.C.<br>https://en.wikipedia.org/wiki/Rivers_United_F.C. |
| Coelacanth | West Cove | Legendary | 18 | 10–14 | huge | **Comoros national team** ("Les Cœlacanthes"): The Comoros national team is nicknamed "Les Cœlacanthes", after the coelacanth, a rare, ancient fish that lives in the seas around the Comoro Islands. | https://en.wikipedia.org/wiki/Comoros_national_football_team<br>https://en.wikipedia.org/wiki/Coelacanth |

Wording kept precise on purpose:
- The original ten: Marseille were the "first" French winners (PSG won in 2025), Vigo is "Europe's" biggest port, and Harry Haddock dates from 1989.
- Aldosivi: "El Tiburón" is in the English infobox and all through the Spanish article.
- Sharks FC: merged with Dolphin FC into Rivers United in 2016. The fact names Dolphin FC only as a club.

**Removed by user decision (28 Sep 2026): marine mammals and reptiles.** These verified stories are gone from the game: Pescara, Taranto, SC Sète, Delfín SC, Delfines FC, Poole Town, Pattaya Dolphins United, Deportes Puerto Montt, Mandurah City and Dolphin FC (dolphins); Nagoya Grampus (orca); Selsey (seals); La Paz FC (sea lions); Trang (dugongs); and Terengganu (turtles). The 14 slots were refilled with **10 verified fish**, each researched under the same rules:
- Saw Shark (Corpus Christi FC)
- Horse Mackerel (CD Tenerife "Chicharreros")
- Oceanic Whitetip (Djibouti "Sharks of the Red Sea")
- Pacific Seahorse (Southern California Seahorses)
- Blue Mussel (Shoreham "The Musselmen")
- Wobbegong (Palm Beach SC "Sharks")
- Arowana (PSU Surat Thani "Killer Arowanas")
- Piranha (Hampton Roads Piranhas)
- Caribbean Reef Shark (FC Ciego de Ávila "Los Tiburones")
- Dusky Shark (Ghana beach soccer "Black Sharks")

The arowana and piranha are river fish. The island story says a stream meets the sea at West Cove, and their facts say "river fish". Searches for grouper, flounder, pufferfish, clownfish, sturgeon, oarfish, salmon, sailfish, swordfish and a second tuna found no verifiable football story. So four slots stay empty: South Pier 2, Lifebuoy Point 1, North Rocks 1.

**Researched but left out.** Each of these had a real source but did not meet the bar:
- **Duplicate animals:** Morecambe "The Shrimps" and Harwich & Parkeston "The Shrimpers" (shrimp is Southend's), Great Yarmouth Town "The Bloaters" (a bloater is a smoked herring; herring is St. Pauli's), Worthing "The Mackerel Men" (two mackerels already).
- **Unclear meaning:** Oita Trinita "Camenaccio" (a turtle pun on catenaccio, but the source does not explain it), Qingdao Hainiu "Sea Bull" (the translation is unclear), Sporting JAX "sometimes nicknamed the Whales" (too weak).
- **Could not verify:** Kawasaki Frontale's dolphin mascot and "Big Head" the World Cup 2014 turtle (neither found on Wikipedia).
- **Not a sea animal:** Songkhla "Samila Mermaids", Krabi "Andaman Eagles" and Samut Prakan "Oceans Fang".
- **Kid safety:** Rabiot, a 2018 octopus oracle. Its story ends badly.
- **Not used:** squid and a second lobster. No verifiable football story was found.

## Spots

All spots are in `lib/town/fishing/fishCatalog.ts` (`FISH_SPOTS`). Brown Shrimp, Sardine, Mackerel and Sea Bass are shared commons at every spot. Each spot has its own 10 specials, and each special lives only there.

| Spot (id) | Where | Theme (island fiction) | Specials |
| --- | --- | --- | --- |
| South Pier Fishing Station (`south-pier`) | (217, 212.6) | Open sea off the pier: ocean fish and sharks | red mullet, bonito, horse mackerel, dorado, mako, thresher, whale shark, oceanic whitetip (8) |
| Lifebuoy Point (`west-pier`) | (63, 212.6), western boardwalk | Warm shallows under the boardwalk | oyster, pearl oyster, stingray, gummy shark, Pacific seahorse, Port Jackson shark, seahorse, bull shark, blacktip reef shark (9) |
| Harbour Wall (`harbour-wall`) | (237.2, 66), behind the market | Deep harbour: sharks and big fish | anchovy, short mackerel, hake, red snapper, yellowfin tuna, barracuda, blue shark, hammerhead, saw shark, great white (10) |
| North Beach Rocks (`north-rocks`) | (60, −238) | Tide-pool rocks: crabs, a lobster, mussels, an eel | edible, swimming and blue crabs, blue mussel, eel, spiny lobster, coconut crab, nurse shark, sand tiger shark (9) |
| West Cove (`west-cove`) | (−95.5, 24) | Beach cove where a stream meets the sea | cownose ray, tope shark, wobbegong, arowana, piranha, sandbar, lemon, reef and dusky sharks, coelacanth (10) |
| Deep Sea Boat (`deep-sea-boat`) | aft deck of the boat moored at (282.5, −93.5) | Open deep water off the east coast, south of the Coral Cay causeway | squid, lanternfish, grouper, sailfish, anglerfish, swordfish, blue marlin, ocean sunfish (8) |
| East Jetty Spiral (`east-pier`, 29 Sep 2026; moved 30 Sep) | (371.6, 68), the outermost east curve of the East Jetty's spiral; casts east | Deeper water at the end of a long pier | none: a table between shore and deep sea built from existing species (4 shared commons, herring, cod, haddock, bluefin tuna, octopus); mean catch ≈ 4.05 coins |

The original fish keep their earlier spots: herring, cod, haddock, tuna, Little Shark and Octopus.

Each spot has a small fishing post (tackle chest, a notice board with a fish emblem, a roof and rods) and a red float in the water. Walk within about 6 m, or point at the post on desktop, to see the building glow and the **Fish** prompt (the `.store-enter-prompt` pattern). Hovering a post shows the prompt from a distance, as buildings do.

## Rarity, catch weights and reeling (internal; never shown to kids)

Kids see only the rarity word: Common catch, Good catch, Rare catch, Legendary catch. No odds or percentages appear anywhere. `tests/fishing.cjs` scans every kid-facing string and the fishing and market components for them.

| Rarity | Catch weight (`RARITY_WEIGHT`) | Swim speed | Bite window | Reel taps | Pull-back when you pause | Coins |
| --- | --- | --- | --- | --- | --- | --- |
| Common | 40 | 0.9 m/s | 1.0 s | 2–3 | never | 2–4 |
| Good (uncommon) | 12 | 1.0 m/s | 0.9 s | 4–5 | after 1.8 s, 0.7 taps/s | 4–7 |
| Rare | 4 | 1.2 m/s | 0.8 s | 6–8 | after 1.4 s, 1 tap/s | 8–11 |
| Legendary | 1.2 | 1.5 m/s | 0.7 s | 10–14 | after 1.1 s, 1.3 taps/s | 12–18 |
| Any shark (every rarity, user decision: sharks must be hard) | its rarity's weight | 1.6 m/s | its rarity's window | **10–14** | as legendary | by rarity |

- **Weighted selection per spot.** Each species' weight is added to every spot in its `spots` list, and `rollCatch` picks by weight. In 10,000 simulated casts per spot, commons land about 60–92% of the time, then Good, then Rare, then Legendary (asserted per tier and per species).
- **Rarer means harder in every way.** Rarer animals have lower weights, bigger shadows on average (`small` 0.45 m up to `giant` 1.9 m) and faster swimming, and big or rare animals may circle the float first. They need more taps and have shorter bite windows. Easy mode and reduced motion add 0.35 s to the bite window.
- **Reel taps.** `reelTapsFor(species, size)` picks within the rarity's range: the bigger this particular catch, the more taps.
- **Resistance.** If you pause, a bigger animal pulls line back. The meter drops one step at a time and the Reel button says **Pull!** (hint: "It is pulling back! Hold on like a keeper: keep tapping Reel!").
- **Kid-fair.**
  - Commons never pull.
  - Progress never drops below zero.
  - A pause alone never loses the fish; only 8 s with no taps at all lets it swim off, the same as a late tap.
  - Nothing is ever lost.
  - Space, Enter, the Reel button and a tap on the water all reel.
- **Economy.** The mean catch is worth about 4.0 coins (`scripts/economy-sim.cjs`), the same as before, so the shared 40-coin daily soft cap still limits market income.

## Approaches: a new direction every cast

`planApproach` (in `fishingCore.ts`) plans each shadow's route once, when it notices the float:
- **Start.** A random compass angle and a start distance of 2.1–3.6 m, plus half the shadow length.
- **Route.** The shadow wanders sideways (one or two waves, fading as it nears the float).
- **Circling.** Legendary animals always circle the float once before they nibble. Sharks circle 85% of the time, rare animals 60%, and commons never.
- **Water check.** Every point is checked with `inOpenWater`: off the island outline, at least 0.8 m from the shoreline, and clear of the moored ferry's hull. A shadow never starts or swims over sand, rocks, piers or the dock. After 24 failed tries it falls back to the old along-shore start.
- **Swimming.** The shadow follows the route nose-first (heading = direction of travel) through the existing `showShadow({pos, heading})` interface, so no visuals change was needed.
- **Fleeing.** Scared and escaping fish flee away from the float and towards open water.
- **Tested.** `tests/fishing.cjs` checks 50 simulated approaches at each spot: they must cover at least 4 of 8 compass sectors (all spots reach 8), every point must be in open water, most routes must curve, and big animals must sometimes circle.


## Live fishing (no dialog)

Fishing plays **in the 3D island view**. There is no modal; the only UI is a small HUD (`components/FishingHost.tsx`): Reel, Stop, a Fishbook button, a one-line hint and a short lesson toast.

1. **Start.** Walk up to a post and tap **Fish**. The camera eases (0.9 s orbit) to a low shoreline shot, as in the reference `docs/fishing-visuals-ref.png`: the angler sits upper-left, the float is in the lower half and the sea fills the bottom. Portrait phones look straight back along the line so both the angler and the float fit. The line casts on its own when the camera arrives.
2. **Wait.** The float lands with a splash ring. After 1.2–3.5 s an animal's **shadow** appears. It comes from a different direction each cast, on a curved path; big or rare animals may circle the float once. The shadow's size (small, medium, large, huge, giant) is the only clue to the species.
3. **Nibbles.** The fish nibbles 1–4 times (legendary fish 2–4, and faster). Each nibble is a small bob, a ripple ring and a soft tick.
4. **Bite.** The float is pulled under, with a big splash and a plunge sound. You have one tap to react (Reel, Space/Enter, or a tap on the water): 1.0 s for common fish, 0.9 s for good catches, 0.8 s for rare and 0.7 s for legendary, plus 0.35 s with reduced motion.
   - Tapping on a nibble or while the shadow approaches scares the fish off.
   - Tapping late means it swims off.
   - Either way another shadow comes along after a moment. Nothing is lost.
5. **Reel.** After the hook, tap Reel 2–3 times for a common catch and up to 10–14 for legendary animals and sharks. The meter on the Reel button fills one step per tap, and big animals pull back if you pause (see the rarity section).
6. **Catch.** The angler holds the fish up. A floating label next to them shows the name, the rarity word, the size, the coin value and the club with its fact line. **Keep fishing** casts again; **Stop** (or Escape) ends the session.
- **Leaving.** Walking more than 1.3 m away, flying, a lesson or an overlay also ends the session, and the camera eases back.
- **Idle.** If three fish in a row swim off with no tap at all, the line is reeled in (`IDLE_ESCAPES`), so the session never cycles forever.
- **Card offers** and other pop-ups wait while fishing (`fishingOpen` in the `Town.tsx` blocked lists). The island loop and the joystick keep running, because fishing is not in `settingsRef`; only the Fishbook and market dialogs pause the island.
- **Sound.** Sounds reuse the island sound system's document cues (`fi2-path-cue`, `fi2-story-cue`), so fishing opens no new audio context.

The **Fishbook** (`components/Fishbook.tsx`) is grouped as **Found at several spots**, then each spot's **specials** with a caught/total count. Every card says **Found at: …**, and undiscovered species show as a silhouette with their shadow size and spot as the hint. It records caught and not-yet-caught species, the count, the biggest size and the shadow size, plus the club fact with a plain-text source credit and the keeper study credit (no links). It is saved in localStorage under `fi2-fishbook-v1` and merges across tabs.

Kid safety:
- No odds or percentages are shown anywhere.
- Prices are fixed per species, never set by size or luck.
- A missed fish costs nothing.

## Economy

This section fits the jobs economy in `lib/town/jobs/jobEconomy.ts` and `docs/island-jobs.md`, and the shared market rules in `lib/town/market/market.ts`.

- **Prices** (fixed per species; the table above has each one):
  - Common: 2–4 coins. The new commons are 2–3; the original mackerel and sea bass stay at 4.
  - Good: 4–7 coins.
  - Rare: 8–11 coins.
  - Legendary: 12–18 coins. The priciest are the whale shark and the coelacanth at 18, still under half the 40-coin daily soft cap and well below a 100-coin book.
- **Where prices live.** Every species is a market good automatically: `FISH_GOODS` in `lib/town/market/goods.ts` is generated from `FISH`. Every species also counts towards the shared soft cap and the Fishbook total.
- **Why these prices.** A realistic catch takes about 30 s and earns about 4 coins on average, which is roughly the 7–10 coins a 1-minute island job pays.
- **Shared daily soft cap.** Fish, produce and (if ever switched on) cards all sell at full price until the day's sales reach `MARKET_FULL_PRICE_COINS`, which is 40 coins. After that everything sells at half price (at least 1 coin), and the cap resets at local midnight.
- **Other limits:**
  - The basket holds 20 items, shared with garden produce.
  - Catching is unlimited, because it's the fun part and it fills the Fishbook. Only selling is capped.
  - With a full basket a fish swims free but is still logged.
- **How coins are paid.** Sales go through `islandJobWallet.credit` (jobs agent) into the shared arcade wallet (Astra, not edited).
  - They arrive as idempotent `market:<day>:<sale>` runs of the `live` source. That source has a 20-coin cap per run, so a bigger sale is split into chunks.
  - Replaying a sale never pays twice.

## Rosa's Market Stand (`components/MarketStand.tsx`)

- **One stall.** The stand is the existing CITRUS & FRUIT stall at (230, 35), the same stall the jobs agent pointed its produce sale at. It gets a "ROSA BUYS · FISH · PRODUCE · CARDS" sign and a fish crate. It adds no new footprint or collision. Walk up or hover it for the **Sell** prompt.
- **Tabs.** The stand has three tabs: **Fish**, **Produce** and **Cards**. The Cards tab is `components/MarketCardsSection.tsx` from the sell-shop agent, which ships switched off.
- **What each tab shows:**
  - The price for each item, **Sell 1** buttons, and a **Sell all · N coins** button.
  - A "full price today" meter and the coin balance.
  - A one-shot coin burst on each sale, hidden with reduced motion.
  - The football lesson of the goods sold.
- **How Sell 1 works.** It lives in `lib/town/market/marketStand.ts` and reuses `quoteSale` from `market.ts`, so one item and "sell all" follow the same prices and cap.
- **Opening the stand from other features:** `window.dispatchEvent(new CustomEvent('fi2-open-market-stand',{detail:{tab:'produce'}}))`.

## Deep Sea Boat (29 Sep 2026)

User request: "Add a boat in this area that you can land on and start fishing. In this area when you fish, catch more of the deep sea creatures." The area is the big open-water block south of the Coral Cay causeway (inside the flight zone).

**Where and how you get there.**
- The boat is moored at **(282.5, −93.5)**, the spot the user circled on a jetpack screenshot ("move the boat here", 29 Sep 2026). To find it, the user's view was reproduced (2000×1185 viewport; jetpack 34 m up over (321.5, −54.3), fitted so that the boat and its red float fall on their screenshot pixels) and the centre of the red circle was unprojected onto the sea plane. Earlier the same day it was at Coral Cay's `CAY_LANDMARKS.deepSeaMooring` (370, −68), then at (310, −72). The position lives in `deepSeaBoatData.ts` (`BOAT_MOORING`, `BOAT_YAW`), and Coral Cay's `deepSeaMooring` is no longer used by the boat.
- Rules (`tests/fishing.cjs`, against the live Coral Cay and flight code): the hull plus a 12 m ring of fishing water is flyable open sea (`flightBlocked` false, never land). It is 37.7 m off the main island's east beach, so well outside the 5 m shallow band. It is at least 12 m plus the boat's half-length from the causeway deck, its banks and the sandbars (61.8 m in fact), and from every causeway shark patrol point (38.3 m). It lies west of `isInSouthSeaBlock` (x ≥ 300); the user's placement overrides that earlier rule.
- The bow points north, along the coast; you cast off the starboard side, east, out to sea.
- Flight only. Fly over it and switch the travel mode to walking (the Travel mode button, or R on a keyboard): the normal landing search finds the deck. A parachute drop lands the same way.
- The open aft deck (5.2 × 2.9 m, floor at y 0.76) is registered with the Coral Cay agent's generic hook `registerLandableDeck` (`lib/town/landableDecks.ts`) while the boat exists. That makes it walkable ground (`simulation.blocked`), landable (`landmass.onLand`, `findLanding`) and a floor at its height (`rooftopTravel.surface`). The wheelhouse and bow are not floor, so the existing water rule stops you at the deck's edge. Jetpack off to leave.

**Fishing on the boat.** Standing on the deck shows the same **Fish** prompt over the starboard rod holders, and the whole existing flow runs unchanged: cast off the starboard (seaward) side, shadow, nibbles, bite, reel, catch label, Fishbook, basket and Rosa's stand. The catch label adds a **Deep sea boat** badge (`data-fish-where`). The Fishbook gets a **Deep Sea Boat specials** section, and the shared fish say "Found at: every shore fishing spot and the Deep Sea Boat".

**Catch table (internal; never shown).** Species flagged `deepSea` keep their normal rarity weight; the boat's `shallowFactor` (0.5) halves everything else. Result: 74.8 % deep-sea (10,000 simulated casts in the test land between 68 and 82 %).

| At the boat | Rarity | Weight | Deep-sea |
| --- | --- | --- | --- |
| Squid, Lanternfish | Common | 40 each | yes |
| Mackerel, Sardine (bait fish, shared) | Common | 20 each (40 × 0.5) | no |
| Grouper, Sailfish | Good | 12 each | yes |
| Bluefin Tuna (shared), Anglerfish, Swordfish | Rare | 4 each | yes |
| Octopus (shared), Blue Marlin | Legendary | 1.2 each | yes |
| Ocean Sunfish | Legendary | 0.5 (very rare) | yes |

The five shore spots' tables are unchanged (the test keeps a snapshot of each spot's species count and total weight). The mean catch at the boat is about 3.9 coins, so the economy is unchanged. Mahi-mahi is already in the game as the Dorado (South Pier), and yellowfin/bluefin tuna and the octopus already existed, so none were duplicated.

**The new species and what they teach.** Research (29 Sep 2026, polite fetches: one at a time, 5 s apart): searches found **no** football club nicknamed after the swordfish, sailfish, squid, grouper, sunfish, anglerfish or lanternfish, and no Italian "tuna" club (US Vibonese, from a tuna-fishing coast, are "I Leoni"). One real nickname was found: two clubs are called the "Marlins" (St. John's SC, Grenada, and CD Barbosa, Puerto Rico); the Grenadian club is used. The other seven follow the Paul the Octopus pattern (`link: 'Football culture'`): a real, sourced football fact, with the sea animal as the teaching hook. Which animal is paired with which story is a teaching choice; the facts never claim the animal.

| Animal | Rarity | Coins | Shadow | Football story (real) | Source |
| --- | --- | --- | --- | --- | --- |
| Squid | Common | 3 | medium | **Vanishing spray**: ink ↔ the referee's spray marking the wall 9.15 m away; invented in Brazil, first used at a World Cup in 2014. | https://en.wikipedia.org/wiki/Vanishing_spray |
| Lanternfish | Common | 2 | small | **Bramall Lane**: they make their own light; the world's first floodlit match, Sheffield, 14 October 1878, over 20,000 people. | https://en.wikipedia.org/wiki/Bramall_Lane, https://en.wikipedia.org/wiki/Lanternfish |
| Grouper | Good | 5 | large | **Catenaccio** ("door-bolt"): some groupers lie in wait, then strike; Herrera's Inter locked up at the back, countered fast and won two European Cups. | https://en.wikipedia.org/wiki/Catenaccio, https://en.wikipedia.org/wiki/Grouper |
| Sailfish | Good | 6 | huge | **Hakan Şükür**: many scientists call it the fastest fish; the fastest World Cup goal, 10.8 s, Turkey v South Korea, 2002. | https://en.wikipedia.org/wiki/Hakan_%C5%9E%C3%BCk%C3%BCr, https://en.wikipedia.org/wiki/Sailfish |
| Anglerfish | Rare | 9 | medium | **The Cruyff turn**: a lure that tricks prey ↔ Cruyff's fake pass and drag-back past Sweden's Jan Olsson at the 1974 World Cup. | https://en.wikipedia.org/wiki/Cruyff_turn, https://en.wikipedia.org/wiki/Anglerfish |
| Swordfish | Rare | 10 | huge | **Sheffield United, "The Blades"** (cutlery city); the crest shows two white crossed swords. | https://en.wikipedia.org/wiki/Sheffield_United_F.C. |
| Blue Marlin | Legendary | 16 | giant | **St. John's SC, "Marlins"**, from Gouyave, once the centre of Grenada's fishing industry, which holds a weekly "Fish Friday". | https://en.wikipedia.org/wiki/St._John%27s_SC, https://en.wikipedia.org/wiki/Gouyave |
| Ocean Sunfish | Legendary (very rare) | 18 | giant | **The Maracanã, 1950**: 173,850 paying fans watched Uruguay beat Brazil 2-1, the biggest paid crowd ever. | https://en.wikipedia.org/wiki/Uruguay_v_Brazil_(1950_FIFA_World_Cup) |

Wording kept precise: the ocean sunfish is *not* called the heaviest bony fish (Wikipedia: that is the related *Mola alexandrini*); the Maracanã figure is the official paid attendance. The Grouper's "two European Cups" is Herrera's Inter (Catenaccio article).

**Art.** The boat is original low-poly art in the island palette (white hull, red boot stripe, teal gunwale, wooden deck, clay-red wheelhouse roof, five rods in holders, a cooler, a tackle box, a red-and-white life ring, fenders and a teal flag with a football). Fishbook art (`FishArt.tsx`) gained `billfish` (sailfish with its sail, swordfish, marlin), `angler` (glowing lure) and `mola` shapes, and glow dots for the lanternfish; the squid uses the existing `squid` shape. The in-world held fish is the shared placeholder (visuals hand-off unchanged).

**Files.** `lib/town/fishing/deepSeaFish.ts` (species and sources), `deepSeaBoatData.ts` (pure data: mooring, deck, hull), `deepSeaBoat.ts` (the mesh, deck registration and bob), plus small changes in `fishCatalog.ts` (spot, `deepSea` flag, `shallowFactor`), `fishingCore.ts` (hull is not open water; casts clear the rail), `fishingWorld.ts` (no post for the boat; prompt anchor; boat lifecycle), `FishingHost.tsx` (+ css: the badge), `Fishbook.tsx` ("Found at") and `FishArt.tsx`.

**Checks.** `tests/fishing.cjs` covers the spot at the mooring, the deck (walkable only while registered, floor height on foot), the cast and hull, the 70–80 % table, the unchanged shore snapshot, complete content and sources, the catch badge and the heat rules. Browser (Playwright, 1280×800 and 390×844): fly in, land on the deck, walk, Fish, two catches with the badge, the Fishbook section, no errors. Heat: see `docs/performance-guide.md` ("Deep Sea Boat").

**Bug fix: "the fishing for the boat doesn't work" (29 Sep 2026).** Root cause: the live-fishing session is a module singleton (`fishingStore.ts`). When any module under it was hot-updated on the dev server (the catalogue, the boat data, the new fish …), that file re-ran and made a *second* session. The HUD's Fish button then started the new session while the island loop, created once when Town mounted, kept stepping the old one: the prompt showed, the tap did nothing, and only a full reload fixed it. The boat was simply the newest thing being tried while its files were changing. Fix: the session is kept on `globalThis.__fi2Fishing` (one per page, surviving hot updates) and its land/cue callbacks always use the newest module code. `tests/fishing.cjs` re-evaluates `fishingStore.ts` and asserts the same session comes back. Verified in the browser: after a hot update of `deepSeaFish.ts` / `deepSeaBoatData.ts`, tapping Fish still casts and a fish approaches (it failed before the fix). In a clean load the boat flow worked at both sizes; other failures seen during testing were full page reloads caused by other agents' in-progress edits.

**Open points for the user.** (1) The pairings of animal and story above are teaching choices. (2) Rosa's empty-basket hint in `MarketStand.tsx` lists every spot name, so it now also names the Deep Sea Boat after "fishing posts" (market file not edited). (3) The overview map draws a fishing marker for every spot, so the boat gets an F badge at the mooring (map owned by the Coral Cay agent).

## Files

- `lib/town/fishing/fishCatalog.ts`: the shared species, rarity weights, spots, keeper lessons and the stand location.
- `lib/town/fishing/fishSpecials.ts`: the 46 spot-exclusive specials with their verified football stories and source URLs.
- `lib/town/fishing/fishingCore.ts`: the pure state machine (cast → float → approach → nibble → bite → reeling → caught / scared / escaped), plus the weighted catch roll, size, cast point, approach routes (`planApproach`, `inOpenWater`), reel taps and pull-back, and the Fishbook.
- `lib/town/fishing/fishingSession.ts`: the HUD ↔ island bridge (commands, a snapshot per phase, lessons, cues).
- `lib/town/fishing/fishingStore.ts`: the Fishbook in localStorage, landing fish in the market basket, and the session singleton.
- `lib/town/fishing/fishingWorld.ts`: posts, glows, floats and prompts, and the **driver** that steps the state machine and drives the camera and visuals.
- `lib/town/fishing/fishingCamera.ts`: the low shoreline camera (ease in and out).
- `lib/town/fishing/fishingVisuals.ts`: **placeholder art behind a small interface** (rod, line, float, rings, shadow, held fish, foam). The graphics agent owns this file; see `docs/fishing-visuals-HANDOFF.md`.
- `lib/town/market/marketStand.ts`: Sell 1, unit price and the allowance meter.
- The fish section of `lib/town/market/goods.ts`, generated from the catalogue.
- Components: `FishingHost.tsx` (+ css) for the HUD and prompts, `Fishbook.tsx` (+ css), `MarketStand.tsx` (+ css), `FishArt.tsx`.
- Deep Sea Boat: `lib/town/fishing/deepSeaFish.ts`, `deepSeaBoatData.ts`, `deepSeaBoat.ts` (see above).
- Tests: `tests/fishing.cjs` (in `npm test`).

## Heat

See `docs/performance-guide.md` ("Fishing spots and market stand").

## Decisions for the user

1. **The fish-to-club pairings.** The clubs are verified, but which fish represents Santos, Celta, Marseille, St. Pauli and Yokohama is a teaching choice, because those links are about the port and not a fish nickname. Shrimp–Southend, Cod–Fleetwood, Haddock–Grimsby, Shark–Junior and Octopus–Paul are direct links.
2. ~~Source links in the Fishbook~~ Decided Sep 27 2026: no clickable links for kids. The Fishbook shows plain-text credits; the URLs stay here and in the data.
3. **The soft cap is 40 coins a day** for all market goods (jobs agent's number). Fishing adds no cap of its own. Raise it if fishing and the garden feel too limited together.
4. **Bite window.** The window is 0.7–1.0 s, plus 0.35 s with reduced motion. Say if young players need it wider.
5. **The species pairings for general nicknames** (for example Chonburi "The Sharks" shown as a blacktip reef shark) are teaching choices. The club facts do not claim the species.
6. **Reeling difficulty.** Every shark, of any rarity, takes 10–14 taps (user decision, 28 Sep 2026: sharks must be hard). Other animals use their rarity's range. Mackerel and sea bass stay at 4 coins.

## East Jetty Spiral (29 Sep 2026; jetty rework 30 Sep)

The seventh spot stands on the outer east curve of the East Jetty's spiral (it was on the head of the timber East Pier until the 30 Sep rework) (`lib/town/eastPier.ts`, docs/performance-guide.md "East Pier"). It adds no new species and no specials: the four shared commons, herring, cod and haddock (Good), bluefin tuna (Rare) and the octopus (Legendary) were given `'east-pier'` in their `spots`, so the table sits between the shore and the deep sea. Internal weights come from `RARITY_WEIGHT` as everywhere else; the mean catch is about 4.05 coins (shore 4.0, boat 3.9), so the economy is unchanged and every fish still sells through Rosa's capped market. The five older shore tables are byte-identical (the `tests/fishing.cjs` snapshot). `fishingCore.ts` now also treats the pier's planks as "not open water": the float is cast past the rock armour and shadows never swim over the stone. `tests/fishing.cjs` allows 4–7 spots and a spot with no specials only for `east-pier`, and checks its table and mean. Browser: `node scripts/check-fishing-browser.cjs mobile east-pier` (a Haddock, 6 coins, no errors).
