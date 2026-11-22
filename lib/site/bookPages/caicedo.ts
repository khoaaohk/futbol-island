import type {BookPageSpec} from './types';
/* Caicedo sources checked Nov 21 2026 against the two sources the book lists (Wikipedia, Linda Caicedo; NBC Sports, On Her Turf).
 * Every fact on this page is in the book. The illness is told the book's gentle way: no treatment detail. The book does not
 * name her position, so the page does not either. See sourceNotes. */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Caicedo: Brave enough to come back is a free six-chapter pop-up story for kids about Linda Caicedo, who joined a village club in Colombia that had only let boys play. At fifteen she became seriously ill, asked for help, got well and went back to training days later. At the 2023 World Cup her goal against Germany was voted the best of the tournament. The story teaches that asking for help is brave.',
  facts:[
   {icon:'tag',label:'Country',value:'Colombia'},
   {icon:'clock',label:'Grew up',value:'Candelaria, Colombia'},
   {icon:'steps',label:'First club',value:'Real Juanchito, at five'},
   {icon:'cards',label:'Back from illness',value:'2020'},
   {icon:'shirt',label:'World Cup 2023',value:'Goal of the tournament'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'How did Linda Caicedo start playing football?',a:'Linda was born in 2005 in Candelaria, a small town in Colombia. When she was five, she joined Real Juanchito, a village club that until then had only let boys play. Her coaches welcomed her and helped her learn. At ten she joined her first girls’ team, and at eleven she moved to a club in Cali.'},
   {q:'What happened in Linda Caicedo’s first professional match?',a:'In July 2019, when she was only fourteen, Linda played her first professional match, for América de Cali, and scored the only goal of the game. By the end of that year she was the league’s top scorer, and her goal won the club its first league title.'},
   {q:'How did Linda Caicedo come back from her illness?',a:'Early in 2020, when she was fifteen, doctors found that Linda had cancer, a serious illness. She was treated, and she asked for help from the psychologists at her club, people who are trained to help with worries and sadness. In September 2020 the doctors told her the cancer was gone, and she went back to training only days after her last treatment.'},
   {q:'What did Linda Caicedo win at the Under-17 World Cup?',a:'In 2022 Linda was Colombia’s captain at the Under-17 World Cup in India. Colombia lost the final 1–0 to Spain, but Linda won the Silver Ball, the prize for the second-best player of that World Cup.'},
   {q:'Which goal did Linda Caicedo score at the 2023 World Cup?',a:'At the 2023 World Cup, Linda scored in Colombia’s 2–0 win over South Korea, then scored against Germany. Colombia won 2–1, and her goal against Germany was voted the best goal of the whole tournament.'},
  ],
  sourceNotes:'Left out on purpose (docs/player-books/NEW-20-NOV21.md): the 2023 training collapse (cause never made public) and the IFFHS award. The illness is named once, as in the book, with no treatment detail.',
 };
export default page;
