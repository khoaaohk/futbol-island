import type {FishSpecies} from './fishCatalog';

/**
 * The Stadium Park pond's own fresh-water catches (Nov 13 2026, owner: "a fishing spot at the park pond ... freshwater-style
 * catches"). The catalogue's other fresh-water animals (the arowana, the piranha and the giant river prawn) are West Cove's river
 * specials, all uncommon or rare at a stream mouth, so the pond gets three kid-friendly catches of its own: two commons with the
 * pond's own look (the koi already swim in it, parkPond.ts) and a pike to chase. All three are pond-only, so the West Cove and
 * North Beach Rocks sets and "the shared ten" are unchanged.
 *
 * REAL football facts, the "Fun fish fact + real football fact" kind (Nov 6 2026 owner rule: a place name is not a football
 * link, so the animal fact and the football fact are split): checked on 13 Nov 2026 against the pages in `source` / `sources`
 * (listed in docs/fishing-content-sources.md). Which fish swim in the pond is island fiction.
 */
const W='https://en.wikipedia.org/wiki/';
export const POND_FISH:FishSpecies[]=[
 {id:'koi',name:'Koi',plural:'Koi',rarity:'common',group:'fish',spots:['park-pond'],price:4,size:[20,60],color:'#e8762e',belly:'#f6efe4',shape:'round',shadow:'medium',
  club:{name:'Big Swan Stadium',country:'Japan',link:'Fun fish fact',entity:{kind:'stadium',name:'Big Swan Stadium'},
   fact:'Fun fish fact: koi are colourful carp that rice farmers in Niigata, Japan, began breeding in the 1800s. Football: Niigata\'s Big Swan Stadium hosted three games at the 2002 World Cup, including England\'s 3–0 win over Denmark.',
   source:W+'Denka_Big_Swan_Stadium',sources:[W+'Koi']},
  story:'Koi are carp in bright orange, white and black, and they can live for decades, like a club legend who stays for years. They were first bred in Niigata, Japan, where the Big Swan Stadium hosted World Cup games in 2002.'},
 {id:'perch',name:'European Perch',plural:'European Perch',rarity:'common',group:'fish',spots:['park-pond'],price:4,size:[15,40],color:'#7f8a3c',belly:'#efe6b8',shape:'round',shadow:'small',
  club:{name:'Stade de Genève',country:'Switzerland',link:'Fun fish fact',entity:{kind:'stadium',name:'Stade de Genève'},
   fact:'Fun fish fact: European perch have dark stripes and orange-red fins, and Lake Geneva is famous for them. Football: Geneva\'s Stade de Genève, home of Servette FC, hosted three games at Euro 2008.',
   source:W+'Stade_de_Gen%C3%A8ve',sources:[W+'European_perch']},
  story:'A perch wears dark stripes like a team in a striped kit, and young perch hunt together in little groups. Lake Geneva is famous for perch, and the city\'s stadium hosted games at Euro 2008.'},
 {id:'pike',name:'Northern Pike',plural:'Northern Pike',rarity:'uncommon',group:'fish',spots:['park-pond'],price:5,size:[40,100],color:'#5f7346',belly:'#e6e4c4',shape:'long',shadow:'large',
  club:{name:'Finland national team',country:'Finland',link:'Fun fish fact',entity:{kind:'national-team',name:'Finland'},
   fact:'Fun fish fact: northern pike lie in wait among the reeds of Finland\'s many lakes, then strike in a flash. Football: Finland played their first ever major tournament at Euro 2020.',
   source:W+'Finland_national_football_team',sources:[W+'Northern_pike']},
  story:'A pike waits very still in the reeds, then bursts out in a flash, like a striker timing a run in behind. Pike live in the lakes of Finland, and Finland played their first big tournament at Euro 2020. Hold it gently: it has lots of teeth.'},
];
