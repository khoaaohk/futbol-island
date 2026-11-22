import type {BookPageSpec} from './types';
/* Son sources checked Nov 21 2026 against the sources the book lists. Every fact on this page is in the book. The age his
 * father first let him play league matches differs between sources (14, 15 or 16), so the page says "a teenager", like the book. */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Son: Practise the basics, then fly is a free six-chapter pop-up story for kids about Son Heung-min, who practised only ball control, dribbling and passing with his father for years in South Korea. He left home at sixteen for Germany, scored a goal from one end of the pitch to the other that won the Puskás Award, shared the Golden Boot and won the Europa League in 2025. The story teaches patience and the basics.',
  facts:[
   {icon:'tag',label:'Country',value:'South Korea'},
   {icon:'steps',label:'Left home',value:'At sixteen, for Hamburg'},
   {icon:'cards',label:'Puskás Award',value:'December 2019 goal against Burnley'},
   {icon:'shirt',label:'Golden Boot',value:'2021–22, 23 goals'},
   {icon:'clock',label:'Europa League',value:'2025'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'How did Son Heung-min learn football?',a:'Son was born in 1992 in Chuncheon, South Korea. His father, Son Woong-jung, had been a footballer and coached him himself. For years they practised only the basics: ball control, dribbling and passing. His father did not let him play in a proper league until he was a teenager.'},
   {q:'When did Son Heung-min move to Germany?',a:'In 2008, when he was sixteen, he joined the youth academy of Hamburger SV in Germany. He had to learn German, and his agent said he picked it up partly by watching cartoons. On 30 October 2010 he scored his first Bundesliga goal, against FC Köln.'},
   {q:'Why did Son Heung-min win the Puskás Award?',a:'In December 2019, playing for Tottenham against Burnley, he dribbled with the ball nearly the whole length of the pitch and scored. That goal won the Puskás Award, FIFA’s prize for the best goal of the year.'},
   {q:'Who did Son Heung-min share the Golden Boot with?',a:'In the 2021–22 season he scored 23 Premier League goals and shared the Golden Boot, the prize for the league’s top scorer, with Mohamed Salah. He was the first Asian player ever to win it.'},
   {q:'What was Son Heung-min’s first major trophy?',a:'On 21 May 2025, Tottenham played Manchester United in the Europa League final. Son came on as a substitute, and Tottenham won 1–0. It was his first major trophy. In August 2025 he moved to Los Angeles FC.'},
  ],
  sourceNotes:'Left out on purpose (docs/player-books/NEW-20-NOV21.md): his daily training hours as a boy (sources give 2 or 6) and the exact age he first played league matches.',
 };
export default page;
