/** Career context is sourced; coaching notes are original Futbol Island writing, never player quotes. */
/** Pack prices since the economy pass (docs/economy/ECONOMY_PROPOSAL.md §5.2, applied 28 Sep 2026; were 30 / 50). */
export const LEGEND_PACK_PRICE=40;
export const MYSTERY_PACK_OPTIONS=[{size:3,price:40,secondLegendChance:0},{size:5,price:60,secondLegendChance:.25}] as const;
/** Card packs a player can open per local day, across every machine; machines restock at local midnight. */
export const PACKS_PER_DAY=3;
export const PACK_RESTOCK_MESSAGE='This machine restocks at midnight.';
export const LEGEND_PACKS=[
 {name:'Pelé',theme:'Stay curious',context:'Pelé won the World Cup with Brazil in 1958, 1962 and 1970.',note:'A good performance is a starting point. Choose one touch to improve next time, and give it your full attention.',source:'https://www.fifa.com/en/tournaments/mens/worldcup/articles/pele-three-world-cup-titles-only-player',publisher:'FIFA'},
 {name:'Marta',theme:'Prepare with purpose',context:'After Brazil’s 2019 World Cup exit, Marta urged the next generation to prepare and keep women’s football growing.',note:'Make effort a habit you can repeat. Before training, pick one small challenge; afterwards, notice the progress you made.',source:'https://inside.fifa.com/tournaments/womens/womensworldcup/france2019/news/sheroes-marta-s-speech-inspires-generations',publisher:'FIFA'},
 {name:'Mia Hamm',theme:'Courage can be quiet',context:'Hamm helped the USA win two Women’s World Cups while learning to handle the spotlight and self-doubt.',note:'You do not need to feel fearless to help your team. Offer a passing option, encourage a teammate, and take the next useful action.',source:'https://inside.fifa.com/tournaments/womens/womensworldcup/france2019/news/when-football-fell-in-love-with-usa-s-humble-heroine',publisher:'FIFA'},
 {name:'Johan Cruyff',theme:'Be brave enough to try',context:'Against Sweden at the 1974 World Cup, Cruyff showed the turn that became his trademark.',note:'Practise a new idea slowly, then try it when you see the right space. A failed attempt can show you what to change.',source:'https://www.fifa.com/en/tournaments/mens/worldcup/articles/johan-cruyff-turn-netherlands-1974',publisher:'FIFA'},
 {name:'Luka Modrić',theme:'Find calm under pressure',context:'UEFA praised Modrić’s calmness and composure in Croatia’s midfield at EURO 2008.',note:'Before the ball arrives, breathe out and scan. Choose a clear next pass instead of trying to solve the whole match at once.',source:'https://www.uefa.com/uefaeuro/history/news/0254-0d7bfebf7510-c1c3161a6962-1000--modric-and-croatia-rise-to-occasion/',publisher:'UEFA'},
 {name:'Gianluigi Buffon',theme:'Reset for the next ball',context:'Buffon described learning from the disappointment of missing EURO 2000 through injury.',note:'After a mistake, name one useful adjustment and reset your stance. The next ball needs your attention more than the last one does.',source:'https://www.uefa.com/uefaeuro/history/news/0253-0d8162a66151-ee605a781345-1000--buffon-zen-and-the-art-of-footballing-longevity/',publisher:'UEFA'},
] as const;
export const LEGEND_PACK_CANDIDATES=LEGEND_PACKS.map(legend=>legend.name);
export const legendFor=(name:string)=>LEGEND_PACKS.find(legend=>legend.name===name);
