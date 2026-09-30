import type {FishSpecies} from './fishCatalog';

/**
 * Deep-sea creatures caught from the Deep Sea Boat (user request, Sep 29 2026: "Add a boat … when you fish, catch more of
 * the deep sea creatures"). Each lives only at the boat (`spots:['deep-sea-boat']`), so they form the boat's own specials.
 * Fish plus one squid only: NO marine mammals or reptiles (user decision, Sep 28 2026).
 *
 * REAL football history, checked on 29 Sep 2026 against the Wikipedia pages in `source` / `sources` (polite fetches: one at a
 * time, 5 s apart, user agent FutbolIsland/1.0). Searches for football clubs nicknamed after the swordfish, sailfish, squid,
 * grouper, sunfish, anglerfish or lanternfish found none (again), and none for a tuna club in Italy. Only the marlin has a real
 * club nickname (St. John's SC "Marlins"). The others follow the Paul the Octopus pattern (`link:'Football culture'`): the fact
 * is real football history, and the sea animal is the teaching hook (a squid's ink and the referee's vanishing spray; a
 * lanternfish's glow and the first floodlit match …). Which animal is paired with which story is a TEACHING CHOICE; the facts
 * never claim the animal. See docs/fishing.md ("Deep Sea Boat").
 * The one-line animal hooks are plain biology from the same Wikipedia pages (Sailfish, Anglerfish, Lanternfish, Grouper).
 * ISLAND FICTION: that these animals live under the boat's mooring.
 */
const W='https://en.wikipedia.org/wiki/';
export const DEEP_SEA_FISH:FishSpecies[]=[
 {id:'squid',name:'Squid',plural:'Squid',rarity:'common',group:'squid',deepSea:true,spots:['deep-sea-boat'],price:3,size:[20,60],color:'#d9868f',belly:'#f6d7cf',shape:'squid',shadow:'medium',
  club:{name:'Vanishing spray',country:'Brazil',link:'Football culture',
   fact:'A squid squirts ink; referees squirt vanishing spray to mark where the wall must stand, 9.15 m from the ball. It was invented in Brazil and first used at a World Cup in 2014.',
   source:W+'Vanishing_spray'}},
 {id:'lanternfish',name:'Lanternfish',plural:'Lanternfish',rarity:'common',group:'fish',deepSea:true,spots:['deep-sea-boat'],price:2,size:[3,15],color:'#3f4f70',belly:'#aebbd6',shape:'slim',shadow:'small',
  club:{name:'Bramall Lane, Sheffield',country:'England',link:'Football culture',
   fact:'Lanternfish make their own light in the dark deep sea. The world\'s first floodlit football match was played at Bramall Lane, Sheffield, on 14 October 1878, in front of over 20,000 people.',
   source:W+'Bramall_Lane',sources:[W+'Lanternfish']}},
 {id:'grouper',name:'Grouper',plural:'Groupers',rarity:'uncommon',group:'fish',deepSea:true,spots:['deep-sea-boat'],price:5,size:[40,120],color:'#7b6a4c',belly:'#dccb9f',shape:'round',shadow:'large',
  club:{name:'Inter (Helenio Herrera)',country:'Italy',link:'Football culture',nickname:'Catenaccio',
   fact:'Some groupers lie in wait, then strike. Catenaccio means "door-bolt": Helenio Herrera\'s Inter locked up at the back, then hit fast counter-attacks, and won two European Cups.',
   source:W+'Catenaccio',sources:[W+'Grouper']}},
 {id:'sailfish',name:'Sailfish',plural:'Sailfish',rarity:'uncommon',group:'fish',deepSea:true,spots:['deep-sea-boat'],price:6,size:[120,300],color:'#2e5c90',belly:'#dfe8ef',shape:'billfish',shadow:'huge',
  club:{name:'Hakan Şükür (Turkey)',country:'Turkey',link:'Football culture',
   fact:'Many scientists call the sailfish the fastest fish in the ocean. The fastest World Cup goal came after 10.8 seconds: Hakan Şükür scored it for Turkey against South Korea in 2002.',
   source:W+'Hakan_%C5%9E%C3%BCk%C3%BCr',sources:[W+'Sailfish']}},
 {id:'anglerfish',name:'Anglerfish',plural:'Anglerfish',rarity:'rare',group:'fish',deepSea:true,spots:['deep-sea-boat'],price:9,size:[20,100],color:'#4b4139',belly:'#8c7c68',shape:'angler',shadow:'medium',
  club:{name:'Johan Cruyff (Netherlands)',country:'Netherlands',link:'Football culture',nickname:'The Cruyff turn',
   fact:'An anglerfish tricks prey with a glowing lure. At the 1974 World Cup, Johan Cruyff faked a pass, then dragged the ball behind his leg to trick Sweden\'s Jan Olsson: the Cruyff turn.',
   source:W+'Cruyff_turn',sources:[W+'Anglerfish']}},
 {id:'swordfish',name:'Swordfish',plural:'Swordfish',rarity:'rare',group:'fish',deepSea:true,spots:['deep-sea-boat'],price:10,size:[120,300],color:'#45576f',belly:'#dde3e8',shape:'billfish',shadow:'huge',
  club:{name:'Sheffield United',country:'England',link:'Crest',nickname:'The Blades',
   fact:'Sheffield United are "The Blades" because Sheffield was famous for making cutlery. Their crest shows two white crossed swords.',
   source:W+'Sheffield_United_F.C.'}},
 {id:'blue-marlin',name:'Blue Marlin',plural:'Blue Marlin',rarity:'legendary',group:'fish',deepSea:true,spots:['deep-sea-boat'],price:16,size:[200,450],color:'#1f4e8a',belly:'#e3ebf2',shape:'billfish',shadow:'giant',
  club:{name:'St. John\'s SC',country:'Grenada',link:'Nickname',nickname:'Marlins',
   fact:'St. John\'s SC, from Gouyave in Grenada, are nicknamed the "Marlins". Gouyave was the centre of Grenada\'s fishing industry and holds a "Fish Friday" festival every week.',
   source:W+'St._John%27s_SC',sources:[W+'Gouyave']}},
 // Very rare (weight 0.5 instead of the legendary 1.2; internal, never shown).
 {id:'ocean-sunfish',name:'Ocean Sunfish',plural:'Ocean Sunfish',rarity:'legendary',group:'fish',deepSea:true,weight:.5,spots:['deep-sea-boat'],price:18,size:[150,330],color:'#8b97a1',belly:'#e0e5e7',shape:'mola',shadow:'giant',
  club:{name:'Maracanã, Rio de Janeiro',country:'Brazil',link:'Football culture',
   fact:'The ocean sunfish is a giant of the open sea. The biggest football crowd: 173,850 paying fans watched Uruguay beat Brazil 2-1 at the Maracanã at the 1950 World Cup.',
   source:W+'Uruguay_v_Brazil_(1950_FIFA_World_Cup)'}},
];
