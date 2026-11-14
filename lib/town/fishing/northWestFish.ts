import type {FishSpecies} from './fishCatalog';

/**
 * The north-west coast's own catches (Nov 13 2026, owner: three new fishing spots round the DRIP FC Stadium, "more fish types",
 * the harder ones only catchable there). Cold-water sea animals that fit a rocky, kelpy, sandy north-west coast and were not yet
 * in the catalogue. Every one is spot-only (like the pond's koi, perch and pike), so the older spots' tables, the signature waves
 * and "the shared ten" are unchanged:
 *  - North Point (rocky point, the island's north-west corner): cabezon, ballan wrasse, golden redfish, yelloweye rockfish and
 *    the giant Pacific octopus (legendary rarity);
 *  - Stadium Rocks (kelp edge, the north shore below the stadium): kelp greenling, kelp bass, California sheephead and Chinook
 *    salmon;
 *  - Sunset Shoals (sandy shoals, the south-west shore): Dungeness crab, common dab, starry flounder, leopard shark and the
 *    Atlantic halibut (legendary rarity).
 *
 * REAL facts in the split "Fun fish fact … Football: …" form (Nov 6 2026 owner rule): each fish fact names a place the animal
 * really lives, and the football fact is about that place's stadium, club or team. Checked on 13 Nov 2026 against the pages in
 * `source` / `sources` (listed in docs/fishing-content-sources.md). Which fish swim at which island spot is island fiction.
 */
const W='https://en.wikipedia.org/wiki/';
export const NORTH_WEST_FISH:FishSpecies[]=[
 // ---- North Point: a rocky point on the north-west corner.
 {id:'cabezon',name:'Cabezon',plural:'Cabezon',rarity:'common',group:'fish',spots:['north-point'],price:4,size:[30,99],color:'#8a5a3e',belly:'#cfe0c8',shape:'round',shadow:'medium',
  club:{name:'Estadio Azteca',country:'Mexico',link:'Fun fish fact',entity:{kind:'stadium',name:'Estadio Azteca'},
   fact:'Fun fish fact: cabezon means "big head" in Spanish, and these big-headed fish live on rocky reefs from Alaska to Mexico. Football: Mexico City\'s Estadio Azteca was the first stadium to host two World Cup finals, in 1970 and 1986.',
   source:W+'Estadio_Azteca',sources:[W+'Cabezon_(fish)']},
  story:'A cabezon has a big head and a mottled red, brown or green coat that blends into the rocks, like a defender who never leaves the line. Cabezon live all the way from Alaska to Mexico, where the Estadio Azteca hosted two World Cup finals.'},
 {id:'ballan-wrasse',name:'Ballan Wrasse',plural:'Ballan Wrasse',rarity:'common',group:'fish',spots:['north-point'],price:3,size:[20,60],color:'#5f7a4a',belly:'#e8d8a8',shape:'round',shadow:'small',
  club:{name:'Morocco national team',country:'Morocco',link:'Fun fish fact',entity:{kind:'national-team',name:'Morocco'},
   fact:'Fun fish fact: ballan wrasse have thick lips and strong throat teeth for crunching crabs, on rocky coasts from Norway to Morocco. Football: at the 2022 World Cup, Morocco became the first African team to reach a semi-final.',
   source:W+'Morocco_national_football_team',sources:[W+'Ballan_wrasse']},
  story:'A ballan wrasse has big, thick lips and crunches crabs off the rocks with strong teeth in its throat. It lives on rocky coasts as far south as Morocco, the first African team to reach a World Cup semi-final.'},
 {id:'golden-redfish',name:'Golden Redfish',plural:'Golden Redfish',rarity:'uncommon',group:'fish',spots:['north-point'],price:5,size:[35,100],color:'#d0402e',belly:'#f4b8a0',shape:'round',shadow:'medium',
  club:{name:'Iceland national team',country:'Iceland',link:'Fun fish fact',entity:{kind:'national-team',name:'Iceland'},
   fact:'Fun fish fact: golden redfish are bright red, grow slowly, live a long time and are common off Iceland. Football: Iceland reached the quarter-finals of Euro 2016, their first major tournament, after beating England 2–1.',
   source:W+'Iceland_national_football_team',sources:[W+'Sebastes_norvegicus']},
  story:'A golden redfish is bright red, grows slowly and lives for a long time in the cold sea. It is common off Iceland, whose small team reached the Euro 2016 quarter-finals at their very first big tournament.'},
 {id:'yelloweye-rockfish',name:'Yelloweye Rockfish',plural:'Yelloweye Rockfish',rarity:'rare',group:'fish',spots:['north-point'],price:9,size:[30,90],color:'#e8762e',belly:'#f6d08a',shape:'round',shadow:'large',
  club:{name:'BC Place',country:'Canada',link:'Fun fish fact',entity:{kind:'stadium',name:'BC Place'},
   fact:'Fun fish fact: yelloweye rockfish can live for more than 100 years on rocky reefs along the Pacific coast, including off British Columbia. Football: Vancouver\'s BC Place hosted the 2015 Women\'s World Cup final.',
   source:W+'BC_Place',sources:[W+'Yelloweye_rockfish']},
  story:'A yelloweye rockfish wears bright orange and can live for more than 100 years, older than many football clubs. Some live off British Columbia, where BC Place hosted the 2015 Women\'s World Cup final.'},
 {id:'giant-pacific-octopus',name:'Giant Pacific Octopus',plural:'Giant Pacific Octopuses',rarity:'legendary',group:'octopus',spots:['north-point'],price:14,size:[150,430],color:'#b0503a',belly:'#f0c0a6',shape:'octopus',shadow:'huge',
  club:{name:'South Korea national team',country:'South Korea',link:'Fun fish fact',entity:{kind:'national-team',name:'South Korea'},
   fact:'Fun fish fact: the giant Pacific octopus is the largest octopus on Earth, living across the North Pacific from Alaska to Korea. Football: South Korea reached the 2002 World Cup semi-finals, the first Asian team to do it.',
   source:W+'South_Korea_national_football_team',sources:[W+'Giant_Pacific_octopus']},
  story:'The giant Pacific octopus is the biggest octopus in the world, and it is clever enough to solve puzzles and open bottles. It lives as far away as Korea, whose team reached the World Cup semi-finals in 2002.'},
 // ---- Stadium Rocks: a kelp edge on the north shore, below the stadium.
 {id:'kelp-greenling',name:'Kelp Greenling',plural:'Kelp Greenling',rarity:'common',group:'fish',spots:['stadium-rocks'],price:4,size:[25,61],color:'#7a6a4a',belly:'#e8d8b0',shape:'round',shadow:'small',
  club:{name:'Stanford Stadium',country:'United States',link:'Fun fish fact',entity:{kind:'stadium',name:'Stanford Stadium'},
   fact:'Fun fish fact: kelp greenling live in kelp beds from Alaska to southern California, and the males and females wear different spots. Football: California\'s Stanford Stadium hosted six games at the 1994 World Cup.',
   source:W+'Stanford_Stadium',sources:[W+'Kelp_greenling']},
  story:'Kelp greenling hide in the kelp, and the males and females wear different spots, like a home kit and an away kit. They live all along the coast of California, where Stanford Stadium hosted six games at the 1994 World Cup.'},
 {id:'kelp-bass',name:'Kelp Bass',plural:'Kelp Bass',rarity:'common',group:'fish',spots:['stadium-rocks'],price:4,size:[25,72],color:'#6a6a3a',belly:'#e8e0b8',shape:'round',shadow:'medium',
  club:{name:'San Diego FC',country:'United States',link:'Fun fish fact',entity:{kind:'club',name:'San Diego FC'},
   fact:'Fun fish fact: kelp bass, or calico bass, almost always live in kelp forests and were first described from San Diego. Football: San Diego FC topped the Western Conference in their first MLS season, 2025.',
   source:W+'San_Diego_FC',sources:[W+'Kelp_bass']},
  story:'A kelp bass is also called a calico bass for the patchy spots on its belly, and it almost never leaves the kelp forest. It was first described from San Diego, whose new club topped its conference in its very first season.'},
 {id:'california-sheephead',name:'California Sheephead',plural:'California Sheephead',rarity:'uncommon',group:'fish',spots:['stadium-rocks'],price:6,size:[30,91],color:'#d0503a',belly:'#f4e4dc',shape:'round',shadow:'medium',
  club:{name:'Los Angeles FC',country:'United States',link:'Fun fish fact',entity:{kind:'club',name:'Los Angeles FC'},
   fact:'Fun fish fact: California sheephead crunch sea urchins with big teeth, which stops the urchins eating up the kelp forests off California. Football: Los Angeles FC won their first MLS Cup in 2022, on penalties.',
   source:W+'Los_Angeles_FC',sources:[W+'California_sheephead']},
  story:'A sheephead has big front teeth for crunching sea urchins, and that keeps the kelp forest healthy, like a holding midfielder who protects the whole team. It lives off California, where Los Angeles FC won the MLS Cup in 2022.'},
 {id:'chinook-salmon',name:'Chinook Salmon',plural:'Chinook Salmon',rarity:'rare',group:'fish',spots:['stadium-rocks'],price:9,size:[70,150],color:'#4f6a7a',belly:'#eef0ee',shape:'long',shadow:'large',
  club:{name:'Portland Timbers',country:'United States',link:'Fun fish fact',entity:{kind:'club',name:'Portland Timbers'},
   fact:'Fun fish fact: Chinook, or king salmon, are the biggest Pacific salmon, and they are the state fish of Oregon and Alaska. Football: Oregon\'s Portland Timbers won the MLS Cup in 2015, beating Columbus Crew 2–1.',
   source:W+'Portland_Timbers',sources:[W+'Chinook_salmon']},
  story:'The Chinook is the king of the Pacific salmon: the biggest of them all, strong enough to swim far up rivers. It is the state fish of Oregon, where the Portland Timbers won the MLS Cup in 2015.'},
 // ---- Sunset Shoals: sandy shoals on the south-west shore, facing the sunset.
 {id:'dungeness-crab',name:'Dungeness Crab',plural:'Dungeness Crabs',rarity:'common',group:'crab',spots:['sunset-shoals'],price:4,size:[15,23],color:'#a8603a',belly:'#f0d8b0',shape:'crab',shadow:'small',
  club:{name:'Rose Bowl',country:'United States',link:'Fun fish fact',entity:{kind:'stadium',name:'Rose Bowl'},
   fact:'Fun fish fact: Dungeness crabs are named after a sandy spit in Washington, and in 2024 California made them its state crustacean. Football: California\'s Rose Bowl hosted both the 1994 men\'s and the 1999 women\'s World Cup finals.',
   source:W+'Rose_Bowl_(stadium)',sources:[W+'Dungeness_crab']},
  story:'Dungeness crabs scuttle over sandy bays, and California chose them as its state crustacean in 2024. California\'s Rose Bowl is one of only two stadiums to host both a men\'s and a women\'s World Cup final.'},
 {id:'common-dab',name:'Common Dab',plural:'Common Dabs',rarity:'common',group:'fish',spots:['sunset-shoals'],price:3,size:[20,40],color:'#9a8060',belly:'#f0e8d8',shape:'round',shadow:'small',
  club:{name:'Netherlands national team',country:'Netherlands',link:'Fun fish fact',entity:{kind:'national-team',name:'Netherlands'},
   fact:'Fun fish fact: dabs are small flatfish with both eyes on their right side, lying on the sandy floor of the North Sea. Football: the Netherlands, on the North Sea coast, reached three World Cup finals: 1974, 1978 and 2010.',
   source:W+'Netherlands_national_football_team',sources:[W+'Common_dab']},
  story:'A dab is a little flatfish with both eyes on one side, so it can lie flat on the sand and still watch the whole pitch. Dabs live in the North Sea, beside the Netherlands, who have reached three World Cup finals.'},
 {id:'starry-flounder',name:'Starry Flounder',plural:'Starry Flounder',rarity:'uncommon',group:'fish',spots:['sunset-shoals'],price:5,size:[30,91],color:'#5a5a3a',belly:'#f2ecdc',shape:'round',shadow:'medium',
  club:{name:'Japan women\'s national team',country:'Japan',link:'Fun fish fact',entity:{kind:'national-team',name:'Japan'},
   fact:'Fun fish fact: starry flounder have tiny star-shaped plates in their skin and live from California to Japan. Football: in 2011 Japan became the first Asian team to win a senior World Cup final, at the Women\'s World Cup.',
   source:W+'2011_FIFA_Women%27s_World_Cup_final',sources:[W+'Starry_flounder']},
  story:'A starry flounder has tiny star-shaped plates in its skin, and its eyes can be on the left side or the right. It lives as far away as Japan, whose women won the World Cup in 2011.'},
 {id:'leopard-shark',name:'Leopard Shark',plural:'Leopard Sharks',rarity:'rare',group:'shark',spots:['sunset-shoals'],price:9,size:[120,150],color:'#8a8478',belly:'#eeeae0',shape:'shark',shadow:'large',
  club:{name:'Bay FC',country:'United States',link:'Fun fish fact',entity:{kind:'club',name:'Bay FC'},
   fact:'Fun fish fact: leopard sharks have black saddles and spots, are harmless to people, and have pups in San Francisco Bay. Football: Bay FC, from the Bay Area, reached the playoffs in their first NWSL season, 2024.',
   source:W+'Bay_FC',sources:[W+'Leopard_shark']},
  story:'A leopard shark wears black saddles and spots, swims in schools and is gentle with people. San Francisco Bay is one of its nurseries, and Bay FC from the Bay Area reached the playoffs in their first season.'},
 {id:'atlantic-halibut',name:'Atlantic Halibut',plural:'Atlantic Halibut',rarity:'legendary',group:'fish',spots:['sunset-shoals'],price:15,size:[100,250],color:'#4a4a3a',belly:'#f4f2ea',shape:'round',shadow:'huge',
  club:{name:'Canada women\'s national team',country:'Canada',link:'Fun fish fact',entity:{kind:'national-team',name:'Canada'},
   fact:'Fun fish fact: the Atlantic halibut is the largest flatfish in the world and can live for 50 years, in cold seas from Canada to Iceland. Football: Canada\'s women won the Olympic gold medal at the Tokyo Games, played in 2021.',
   source:W+'Canada_women%27s_national_soccer_team',sources:[W+'Atlantic_halibut']},
  story:'The Atlantic halibut is the biggest flatfish in the world, longer than a goalkeeper is tall. It lives in the cold sea off Canada, whose women won Olympic gold at the Tokyo Games.'},
];
