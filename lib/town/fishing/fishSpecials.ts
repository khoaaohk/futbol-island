import type {FishSpecies} from './fishCatalog';

/**
 * Spot-exclusive specials (user request, Sep 28 2026): up to 10 per fishing spot (46 in all), each catchable only at its own spot.
 * Fish, sharks, rays, eels, seahorses and a few shellfish/crabs only: NO marine mammals or reptiles (user decision, Sep 28 2026).
 *
 * REAL football history: every `club` entry is a real club or national team whose nickname, name, crest or mascot is
 * this kind of sea animal, checked on 28 Sep 2026 against the Wikipedia/Wikimedia pages in `source` / `sources` (the
 * infobox nickname field or the article text). Kids see the fact and a plain "Source: …" credit, never a link.
 * Which exact species stands for a club with a general nickname ("The Sharks", "Red Fish") is a teaching choice;
 * see docs/fishing.md.
 * ISLAND FICTION: which spot each animal lives at, and the spot stories, are original game fiction.
 *
 * Rarity is internal (weights in fishCatalog RARITY_WEIGHT, never shown); kids see only the rarity word.
 */
const W='https://en.wikipedia.org/wiki/';
export const SPECIAL_FISH:FishSpecies[]=[
 // ---- Harbour Wall: deep harbour water, sharks and big fish (10) ----
 {id:'anchovy',name:'Anchovy',plural:'Anchovies',rarity:'common',group:'fish',spots:['harbour-wall'],price:2,size:[9,18],color:'#7d99a8',belly:'#e8eef0',shape:'slim',shadow:'small',
  club:{name:'Málaga CF',country:'Spain',link:'Nickname',nickname:'Los Boquerones',fact:'Málaga CF, from the port city of Málaga in southern Spain, are nicknamed "Los Boquerones": the Anchovies.',source:W+'M%C3%A1laga_CF'}},
 {id:'short-mackerel',name:'Short Mackerel',plural:'Short Mackerel',rarity:'common',group:'fish',spots:['harbour-wall'],price:3,size:[12,20],color:'#5a8a9a',belly:'#e4ecd9',shape:'slim',shadow:'small',
  club:{name:'Samut Songkhram FC',country:'Thailand',link:'Nickname',nickname:'The Raging Mackerel',fact:'Thai club Samut Songkhram FC are nicknamed "Pla-Tu-Kha-Nong", the Raging Mackerel. Pla thu is the Thai name for the short mackerel.',source:W+'Samutsongkhram_F.C.'}},
 {id:'hake',name:'European Hake',plural:'European Hake',rarity:'common',group:'fish',spots:['harbour-wall'],price:3,size:[30,80],color:'#8f9aa3',belly:'#eef0ec',shape:'slim',shadow:'medium',
  club:{name:'FC Lorient',country:'France',link:'Nickname',nickname:'Les Merlus',fact:'FC Lorient, from the port of Lorient in Brittany, France, are nicknamed "Les Merlus": the Hakes.',source:W+'FC_Lorient'}},
 {id:'red-snapper',name:'Red Snapper',plural:'Red Snappers',rarity:'uncommon',group:'fish',spots:['harbour-wall'],price:5,size:[30,70],color:'#d0584a',belly:'#f6c3a8',shape:'round',shadow:'medium',
  club:{name:'Maldives national team',country:'Maldives',link:'Nickname',nickname:'Red Snappers',fact:'The national team of the Maldives, an island country in the Indian Ocean, is nicknamed the "Red Snappers".',source:W+'Maldives_national_football_team'}},
 {id:'yellowfin-tuna',name:'Yellowfin Tuna',plural:'Yellowfin Tuna',rarity:'uncommon',group:'fish',spots:['harbour-wall'],price:6,size:[60,150],color:'#35557c',belly:'#e8dd8c',shape:'long',shadow:'large',
  club:{name:'Manta FC',country:'Ecuador',link:'Nickname',nickname:'Atuneros',fact:'Manta FC, from the port city of Manta in Ecuador, are nicknamed "Pesqueros" (Fishermen) and "Atuneros" (Tuna fishermen).',source:W+'Manta_F.C.'}},
 {id:'barracuda',name:'Barracuda',plural:'Barracudas',rarity:'uncommon',group:'fish',spots:['harbour-wall'],price:6,size:[60,140],color:'#7c8a94',belly:'#e6ece8',shape:'long',shadow:'large',
  club:{name:'Antigua Barracuda FC',country:'Antigua and Barbuda',link:'Club name',fact:'Antigua Barracuda FC, from the Caribbean island of Antigua, played in the USL Pro league from 2011 to 2013 and had to play their matches in the United States.',source:W+'Antigua_Barracuda_FC'}},
 {id:'blue-shark',name:'Blue Shark',plural:'Blue Sharks',rarity:'rare',group:'shark',spots:['harbour-wall'],price:10,size:[100,220],color:'#3f6fa3',belly:'#e2ebf2',shape:'shark',shadow:'huge',
  club:{name:'Cape Verde national team',country:'Cape Verde',link:'Nickname',nickname:'Tubarões Azuis',fact:'Cape Verde\'s national team are the "Tubarões Azuis", the Blue Sharks. They played their first match on 19 April 1978, against Guinea.',source:W+'Cape_Verde_national_football_team'}},
 {id:'hammerhead',name:'Hammerhead Shark',plural:'Hammerhead Sharks',rarity:'rare',group:'shark',spots:['harbour-wall'],price:10,size:[100,250],color:'#6f7f8c',belly:'#e3e8ea',shape:'hammerhead',shadow:'huge',
  club:{name:'Puntarenas FC',country:'Costa Rica',link:'Nickname',nickname:'Tiburones',fact:'Puntarenas FC, from the port of Puntarenas in Costa Rica, are nicknamed "Tiburones" (the Sharks) and "Porteños" (the port people).',source:W+'Puntarenas_F.C.'}},
 {id:'sawshark',name:'Saw Shark',plural:'Saw Sharks',rarity:'rare',group:'shark',spots:['harbour-wall'],price:10,size:[80,150],color:'#8b8a7c',belly:'#ecebe0',shape:'shark',shadow:'large',
  club:{name:'Corpus Christi FC',country:'United States',link:'Nickname',nickname:'The Sharks',fact:'Corpus Christi FC, from Corpus Christi in Texas, USA, are nicknamed "The Sharks". They play in USL League One.',source:W+'Corpus_Christi_FC'}},
 {id:'great-white',name:'Great White Shark',plural:'Great White Sharks',rarity:'legendary',group:'shark',spots:['harbour-wall'],price:16,size:[200,450],color:'#8a949c',belly:'#f0f2f2',shape:'shark',shadow:'giant',
  club:{name:'Platense',country:'Honduras',link:'Nickname',nickname:'Tiburones Blancos',fact:'Platense, from Puerto Cortés in Honduras, are nicknamed "Tiburones Blancos" (White Sharks). In 1965 they became the first champions of the Honduran national league.',source:W+'Platense_F.C.'}},

 // ---- South Pier: open sea off the pier, ocean fish and sharks (8) ----
 {id:'red-mullet',name:'Red Mullet',plural:'Red Mullet',rarity:'common',group:'fish',spots:['south-pier'],price:3,size:[15,30],color:'#d86a55',belly:'#f7d3bc',shape:'round',shadow:'small',
  club:{name:'PSM Makassar',country:'Indonesia',link:'Nickname',nickname:'Juku Eja',fact:'PSM Makassar, from the port city of Makassar in Indonesia, are nicknamed "Juku Eja", meaning Red Fish, after their red shirts.',source:W+'PSM_Makassar'}},
 {id:'bonito',name:'Bonito',plural:'Bonito',rarity:'common',group:'fish',spots:['south-pier'],price:3,size:[40,70],color:'#3d5f86',belly:'#dfe6ea',shape:'long',shadow:'medium',
  club:{name:'Solomon Islands national team',country:'Solomon Islands',link:'Nickname',nickname:'Bonitos',fact:'The Solomon Islands national team, from a Pacific island nation, is nicknamed the "Bonitos", after a fast fish of the tuna family.',source:W+'Solomon_Islands_national_football_team'}},
 {id:'horse-mackerel',name:'Horse Mackerel',plural:'Horse Mackerel',rarity:'common',group:'fish',spots:['south-pier'],price:2,size:[15,35],color:'#6f8c93',belly:'#e6ece6',shape:'slim',shadow:'small',
  club:{name:'CD Tenerife',country:'Spain',link:'Nickname',nickname:'Chicharreros',fact:'CD Tenerife are nicknamed "Chicharreros". The name comes from chicharros (horse mackerel), a small, cheap fish that poor families in Santa Cruz de Tenerife used to eat.',source:W+'CD_Tenerife',sources:['https://es.wikipedia.org/wiki/Chicharrero'],credit:'Wikipedia (English and Spanish)'}},
 {id:'dorado',name:'Dorado',plural:'Dorados',rarity:'uncommon',group:'fish',spots:['south-pier'],price:6,size:[60,140],color:'#4f9a6a',belly:'#f1d35a',shape:'long',shadow:'large',
  club:{name:'Dorados de Sinaloa',country:'Mexico',link:'Club name',nickname:'El Gran Pez',fact:'Dorados de Sinaloa are named after the dorado fish and nicknamed "El Gran Pez", the Great Fish. Diego Maradona coached them in 2018-19 and led them to two finals.',source:W+'Dorados_de_Sinaloa'}},
 {id:'mako',name:'Mako Shark',plural:'Mako Sharks',rarity:'rare',group:'shark',spots:['south-pier'],price:10,size:[150,300],color:'#3b5a86',belly:'#e6edf1',shape:'shark',shadow:'huge',
  club:{name:'Londrina EC',country:'Brazil',link:'Nickname',nickname:'Tubarão',fact:'Brazilian club Londrina Esporte Clube, from the state of Paraná, are nicknamed "Tubarão": the Shark.',source:W+'Londrina_Esporte_Clube',sources:['https://pt.wikipedia.org/wiki/Londrina_Esporte_Clube']}},
 {id:'thresher',name:'Thresher Shark',plural:'Thresher Sharks',rarity:'legendary',group:'shark',spots:['south-pier'],price:14,size:[200,450],color:'#56647a',belly:'#e8ecef',shape:'shark',shadow:'giant',
  club:{name:'FC Crotone',country:'Italy',link:'Crest',nickname:'Gli Squali',fact:'FC Crotone, from the south of Italy, have the shark as their historic symbol, so players and fans are called "gli squali": the sharks. Their crest shows two sharks.',source:'https://it.wikipedia.org/wiki/Football_Club_Crotone',credit:'Wikipedia (Italian)'}},
 {id:'whale-shark',name:'Whale Shark',plural:'Whale Sharks',rarity:'legendary',group:'shark',spots:['south-pier'],price:18,size:[400,900],color:'#46607a',belly:'#e4ecf0',shape:'shark',shadow:'giant',
  club:{name:'Elmina Sharks FC',country:'Ghana',link:'Club name',fact:'Elmina Sharks FC come from Elmina on the coast of Ghana. The club began as Coconut Grove Sharks and later played in the Ghana Premier League.',source:W+'Elmina_Sharks_F.C.'}},
 {id:'oceanic-whitetip',name:'Oceanic Whitetip Shark',plural:'Oceanic Whitetip Sharks',rarity:'legendary',group:'shark',spots:['south-pier'],price:15,size:[150,300],color:'#6d7a82',belly:'#eef0ef',shape:'shark',shadow:'giant',
  club:{name:'Djibouti national team',country:'Djibouti',link:'Nickname',nickname:'Requins de la Mer Rouge',fact:'Djibouti\'s national team, from a small country on the Red Sea, is nicknamed the "Sharks of the Red Sea" (Requins de la Mer Rouge).',source:W+'Djibouti_national_football_team'}},

 // ---- Lifebuoy Point (west pier): warm shallows under the boardwalk (9) ----
 {id:'oyster',name:'Oyster',plural:'Oysters',rarity:'common',group:'shellfish',spots:['west-pier'],price:2,size:[6,12],color:'#b8ae96',belly:'#efe9da',shape:'shell',shadow:'small',
  club:{name:'Whitstable Town',country:'England',link:'Nickname',nickname:'The Oystermen',fact:'Whitstable Town, from the seaside town of Whitstable in Kent, England, are nicknamed "The Oystermen". They joined the original Kent League in 1909.',source:W+'Whitstable_Town_F.C.'}},
 {id:'pearl-oyster',name:'Pearl Oyster',plural:'Pearl Oysters',rarity:'uncommon',group:'shellfish',spots:['west-pier'],price:5,size:[10,25],color:'#8f8f9a',belly:'#f4efe6',shape:'shell',shadow:'small',
  club:{name:'Al-Khaleej FC',country:'Saudi Arabia',link:'Nickname',nickname:'Al-Danah',fact:'Saudi club Al-Khaleej FC are nicknamed "Al-Danah", the Pearls. Pearls grow inside pearl oysters.',source:W+'Al-Khaleej_FC'}},
 {id:'stingray',name:'Smooth Stingray',plural:'Smooth Stingrays',rarity:'uncommon',group:'ray',spots:['west-pier'],price:6,size:[60,150],color:'#6e6a5c',belly:'#ece6d4',shape:'ray',shadow:'large',
  club:{name:'Illawarra Stingrays',country:'Australia',link:'Crest',fact:'Illawarra Stingrays, a women\'s club in New South Wales, Australia, was founded in 2006. Its logo shows a stingray with a football over its tail.',source:W+'Illawarra_Stingrays_WFC'}},
 {id:'gummy-shark',name:'Gummy Shark',plural:'Gummy Sharks',rarity:'uncommon',group:'shark',spots:['west-pier'],price:6,size:[60,150],color:'#8d8f93',belly:'#eceae4',shape:'shark',shadow:'large',
  club:{name:'Port Melbourne SC',country:'Australia',link:'Nickname',nickname:'The Sharks',fact:'Port Melbourne SC, from the port side of Melbourne in Australia, are nicknamed "The Sharks".',source:W+'Port_Melbourne_SC'}},
 {id:'port-jackson',name:'Port Jackson Shark',plural:'Port Jackson Sharks',rarity:'rare',group:'shark',spots:['west-pier'],price:9,size:[60,140],color:'#9a8a70',belly:'#ece2cc',shape:'shark',shadow:'large',
  club:{name:'Sutherland Sharks',country:'Australia',link:'Club name',fact:'Sutherland Sharks FC, from the south of Sydney, trace their roots back to 1930. In 2025 the club renamed itself simply Sharks FC.',source:W+'Sutherland_Sharks_FC'}},
 {id:'seahorse',name:'Seahorse',plural:'Seahorses',rarity:'rare',group:'seahorse',spots:['west-pier'],price:9,size:[8,18],color:'#b8563f',belly:'#f0c29a',shape:'seahorse',shadow:'small',
  club:{name:'Salernitana',country:'Italy',link:'Crest',nickname:'Ippocampo',fact:'The symbol of Salernitana, from the Italian port of Salerno, is a seahorse (ippocampo). A seahorse called "Ippo" was also the club mascot.',source:'https://it.wikipedia.org/wiki/Unione_Sportiva_Salernitana_1919',credit:'Wikipedia (Italian)'}},
 {id:'pacific-seahorse',name:'Pacific Seahorse',plural:'Pacific Seahorses',rarity:'uncommon',group:'seahorse',spots:['west-pier'],price:6,size:[10,30],color:'#c99a45',belly:'#f2dca0',shape:'seahorse',shadow:'small',
  club:{name:'Southern California Seahorses',country:'United States',link:'Club name',fact:'The Southern California Eagles began in 2001 as the Southern California Seahorses, a soccer team from La Mirada, California.',source:W+'Southern_California_Eagles'}},
 {id:'bull-shark',name:'Bull Shark',plural:'Bull Sharks',rarity:'rare',group:'shark',spots:['west-pier'],price:10,size:[150,300],color:'#7d7f78',belly:'#ecebe2',shape:'shark',shadow:'huge',
  club:{name:'CD Veracruz',country:'Mexico',link:'Nickname',nickname:'Tiburones Rojos',fact:'CD Veracruz, from the port city of Veracruz in Mexico, were known as the "Tiburones Rojos", the Red Sharks. Fans remember a wave of support called "La Tiburomanía".',source:W+'C.D._Veracruz'}},
 {id:'blacktip',name:'Blacktip Reef Shark',plural:'Blacktip Reef Sharks',rarity:'rare',group:'shark',spots:['west-pier'],price:10,size:[90,180],color:'#8a8f86',belly:'#efeee6',shape:'shark',shadow:'large',
  club:{name:'Chonburi FC',country:'Thailand',link:'Crest',nickname:'The Sharks',fact:'Chonburi FC, from Thailand, are widely known as "The Sharks", and a shark is on the club crest.',source:W+'Chonburi_F.C.'}},

 // ---- North Beach Rocks: tide pools, crabs, a lobster, mussels and eels (9) ----
 {id:'edible-crab',name:'Edible Crab',plural:'Edible Crabs',rarity:'common',group:'crab',spots:['north-rocks'],price:2,size:[10,25],color:'#b0683f',belly:'#f0c89c',shape:'crab',shadow:'small',
  club:{name:'Cromer Town',country:'England',link:'Nickname',nickname:'The Crabs',fact:'Cromer Town FC, from the seaside town of Cromer in Norfolk, England, are nicknamed "The Crabs".',source:W+'Cromer_Town_F.C.'}},
 {id:'swimming-crab',name:'Swimming Crab',plural:'Swimming Crabs',rarity:'common',group:'crab',spots:['north-rocks'],price:3,size:[8,18],color:'#8a7a4e',belly:'#efe0b4',shape:'crab',shadow:'small',
  club:{name:'Club Jaiba Brava',country:'Mexico',link:'Club name',nickname:'Los Jaibos',fact:'Mexican club Tampico Madero is now called Club Jaiba Brava, the Fierce Crab (a jaiba is a crab), and fans call the team "los Jaibos".',source:W+'Club_Jaiba_Brava',sources:['https://es.wikipedia.org/wiki/Club_Jaiba_Brava','https://en.wiktionary.org/wiki/jaiba'],credit:'Wikipedia and Wiktionary'}},
 {id:'blue-crab',name:'Blue Crab',plural:'Blue Crabs',rarity:'common',group:'crab',spots:['north-rocks'],price:3,size:[10,23],color:'#4f78a8',belly:'#efe2c4',shape:'crab',shadow:'small',
  club:{name:'CD Victoria',country:'Honduras',link:'Nickname',nickname:'Jaibas Bravas',fact:'CD Victoria from Honduras are nicknamed "Jaibas Bravas", the Fierce Blue Crabs.',source:W+'C.D._Victoria'}},
 {id:'mussel',name:'Blue Mussel',plural:'Blue Mussels',rarity:'common',group:'shellfish',spots:['north-rocks'],price:2,size:[4,10],color:'#2f3b52',belly:'#d9c9a0',shape:'shell',shadow:'small',
  club:{name:'Shoreham FC',country:'England',link:'Nickname',nickname:'The Musselmen',fact:'Shoreham FC, from Shoreham-by-Sea in West Sussex, England, are nicknamed "The Musselmen" after the town\'s ancient mussel-picking tradition.',source:W+'Shoreham_F.C.'}},
 {id:'eel',name:'European Eel',plural:'European Eels',rarity:'uncommon',group:'eel',spots:['north-rocks'],price:5,size:[40,90],color:'#5b5a3c',belly:'#c9c49a',shape:'eel',shadow:'medium',
  club:{name:'FC Volendam',country:'Netherlands',link:'Nickname',nickname:'De Palingboeren',fact:'FC Volendam are nicknamed "de Palingboeren". Paling is Dutch for eel: Volendam is an old fishing village, and even its local pop music is called Palingsound.',source:W+'FC_Volendam',sources:[W+'Volendam']}},
 {id:'spiny-lobster',name:'Spiny Lobster',plural:'Spiny Lobsters',rarity:'uncommon',group:'lobster',spots:['north-rocks'],price:6,size:[25,45],color:'#b5533a',belly:'#f0b98a',shape:'lobster',shadow:'medium',
  club:{name:'Phuket Andaman FC',country:'Thailand',link:'Nickname',nickname:'The Lobsters',fact:'Phuket Andaman FC, from the Thai island of Phuket, are nicknamed "The Lobsters". The club began in 2009 as Phuket FC.',source:W+'Phuket_Andaman_F.C.'}},
 {id:'coconut-crab',name:'Coconut Crab',plural:'Coconut Crabs',rarity:'rare',group:'crab',spots:['north-rocks'],price:9,size:[25,40],color:'#4f6fb0',belly:'#e9c7a0',shape:'crab',shadow:'medium',
  club:{name:'Northern Mariana Islands national team',country:'Northern Mariana Islands',link:'Nickname',nickname:'Blue Ayuyu',fact:'The Northern Mariana Islands team is nicknamed the "Blue Ayuyu". Ayuyu is the islands\' name for the coconut crab, also called the robber crab.',source:W+'Northern_Mariana_Islands_national_football_team'}},
 {id:'nurse-shark',name:'Nurse Shark',plural:'Nurse Sharks',rarity:'rare',group:'shark',spots:['north-rocks'],price:10,size:[150,300],color:'#9c8a66',belly:'#eadfc2',shape:'shark',shadow:'huge',
  club:{name:'Ranong United',country:'Thailand',link:'Nickname',nickname:'The Andaman Sharks',fact:'Ranong United, from southern Thailand by the Andaman Sea, are nicknamed "The Andaman Sharks".',source:W+'Ranong_PJ_United_F.C.'}},
 {id:'sand-tiger',name:'Sand Tiger Shark',plural:'Sand Tiger Sharks',rarity:'legendary',group:'shark',spots:['north-rocks'],price:14,size:[150,320],color:'#8f8465',belly:'#ece5cc',shape:'shark',shadow:'giant',
  club:{name:'Aldosivi',country:'Argentina',link:'Nickname',nickname:'El Tiburón',fact:'Aldosivi, from the seaside city of Mar del Plata in Argentina, are nicknamed "El Tiburón": the Shark.',source:W+'Club_Atl%C3%A9tico_Aldosivi',sources:['https://es.wikipedia.org/wiki/Club_Atl%C3%A9tico_Aldosivi']}},

 // ---- West Cove: a sheltered beach cove where a stream meets the sea: rays, sharks, river fish (10) ----
 {id:'cownose-ray',name:'Cownose Ray',plural:'Cownose Rays',rarity:'uncommon',group:'ray',spots:['west-cove'],price:5,size:[60,110],color:'#8a6c4c',belly:'#efe2cc',shape:'ray',shadow:'large',
  club:{name:'Rhode Island Stingrays',country:'United States',link:'Club name',fact:'The Rhode Island Stingrays were an American soccer team from Providence, founded in 1995. They were division champions in 1998.',source:W+'Rhode_Island_Stingrays'}},
 {id:'tope-shark',name:'Tope Shark',plural:'Tope Sharks',rarity:'uncommon',group:'shark',spots:['west-cove'],price:6,size:[100,190],color:'#86898a',belly:'#eceae6',shape:'shark',shadow:'large',
  club:{name:'Olympic Club de Safi',country:'Morocco',link:'Nickname',nickname:'The Sharks',fact:'Olympic Club de Safi, from the Atlantic port of Safi in Morocco, are nicknamed "The Sharks".',source:W+'Olympic_Club_Safi'}},
 {id:'wobbegong',name:'Wobbegong',plural:'Wobbegongs',rarity:'uncommon',group:'shark',spots:['west-cove'],price:6,size:[80,180],color:'#9a7f55',belly:'#e8d8b0',shape:'shark',shadow:'large',
  club:{name:'Palm Beach SC',country:'Australia',link:'Nickname',nickname:'Sharks',fact:'Palm Beach SC, an amateur club formed in 1966 at Palm Beach on the Gold Coast of Queensland, Australia, are nicknamed the "Sharks".',source:W+'Palm_Beach_SC'}},
 {id:'arowana',name:'Arowana',plural:'Arowanas',rarity:'uncommon',group:'fish',spots:['west-cove'],price:6,size:[50,90],color:'#b8a45a',belly:'#efe6c0',shape:'long',shadow:'medium',
  club:{name:'PSU Surat Thani City FC',country:'Thailand',link:'Nickname',nickname:'The Killer Arowanas',fact:'PSU Surat Thani City FC, from southern Thailand, are nicknamed "The Killer Arowanas". Arowanas are river fish.',source:W+'PSU_Surat_Thani_City_F.C.'}},
 {id:'piranha',name:'Piranha',plural:'Piranhas',rarity:'uncommon',group:'fish',spots:['west-cove'],price:5,size:[15,35],color:'#6b7470',belly:'#d9573f',shape:'round',shadow:'small',
  club:{name:'Hampton Roads Piranhas',country:'United States',link:'Club name',fact:'The Hampton Roads Piranhas, a women\'s soccer team from Virginia, USA, founded in 1995, won their W-League division in 2003 and 2004. Real piranhas live in rivers.',source:W+'Hampton_Roads_Piranhas'}},
 {id:'sandbar-shark',name:'Sandbar Shark',plural:'Sandbar Sharks',rarity:'rare',group:'shark',spots:['west-cove'],price:10,size:[120,240],color:'#9b927c',belly:'#eeeadc',shape:'shark',shadow:'huge',
  club:{name:'Hapoel Haifa',country:'Israel',link:'Nickname',nickname:'The Sharks',fact:'Hapoel Haifa, from the port city of Haifa in Israel, are nicknamed "The Sharks".',source:W+'Hapoel_Haifa_F.C.'}},
 {id:'reef-shark',name:'Caribbean Reef Shark',plural:'Caribbean Reef Sharks',rarity:'rare',group:'shark',spots:['west-cove'],price:10,size:[150,300],color:'#7f8a86',belly:'#eceee8',shape:'shark',shadow:'huge',
  club:{name:'FC Ciego de Ávila',country:'Cuba',link:'Nickname',nickname:'Los Tiburones',fact:'FC Ciego de Ávila from Cuba are nicknamed "Los Tiburones" (the Sharks) and have won five Cuban league titles, most recently in 2014.',source:W+'FC_Ciego_de_%C3%81vila'}},
 {id:'dusky-shark',name:'Dusky Shark',plural:'Dusky Sharks',rarity:'rare',group:'shark',spots:['west-cove'],price:10,size:[150,320],color:'#4f5760',belly:'#e3e6e6',shape:'shark',shadow:'huge',
  club:{name:'Ghana beach soccer team',country:'Ghana',link:'Nickname',nickname:'Black Sharks',fact:'Ghana\'s national beach soccer team, which plays football barefoot on sand, is nicknamed the "Black Sharks".',source:W+'Ghana_national_beach_soccer_team'}},
 {id:'lemon-shark',name:'Lemon Shark',plural:'Lemon Sharks',rarity:'rare',group:'shark',spots:['west-cove'],price:10,size:[150,300],color:'#b3a45e',belly:'#f1ebc8',shape:'shark',shadow:'huge',
  club:{name:'Sharks FC',country:'Nigeria',link:'Club name',fact:'Sharks FC of Port Harcourt, Nigeria, had their own ground, the Sharks Stadium. In 2016 they merged with Dolphin FC to form Rivers United.',source:W+'Sharks_F.C.',sources:[W+'Rivers_United_F.C.']}},
 {id:'coelacanth',name:'Coelacanth',plural:'Coelacanths',rarity:'legendary',group:'fish',spots:['west-cove'],price:18,size:[100,200],color:'#3d4f7a',belly:'#8ea0c0',shape:'round',shadow:'huge',
  club:{name:'Comoros national team',country:'Comoros',link:'Nickname',nickname:'Les Cœlacanthes',fact:'The Comoros national team is nicknamed "Les Cœlacanthes", after the coelacanth, a rare, ancient fish that lives in the seas around the Comoro Islands.',source:W+'Comoros_national_football_team',sources:[W+'Coelacanth']}},
];
