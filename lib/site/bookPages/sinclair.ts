import type {BookPageSpec} from './types';
/* Sinclair sources checked Nov 21 2026 against the sources the book lists (Wikipedia, Team Canada, CBC). Every fact on this page is in the book.
 * The 2012 semi-final is the same match as the Morgan book's London chapter (/books/morgan); the two pages link. See sourceNotes. */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Sinclair: Heartbreak, then gold is a free six-chapter pop-up story for kids about Christine Sinclair of Canada. She scored a hat-trick in the 2012 Olympic semi-final and still lost, won bronze twice, scored more international goals than any player in the world, and won Olympic gold in Tokyo. The story teaches that you can play your best, lose, feel sad and get up again.',
  facts:[
   {icon:'tag',label:'Country',value:'Canada'},
   {icon:'clock',label:'Born',value:'Burnaby, 1983'},
   {icon:'cards',label:'International goals',value:'190'},
   {icon:'steps',label:'Olympic bronze',value:'2012, 2016'},
   {icon:'shirt',label:'Olympic gold',value:'2021, Tokyo'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'When did Christine Sinclair start playing football?',a:'Christine was born in 1983 in Burnaby, in Canada, into a football family: her father and two of her uncles had all played. She started at four, on a team for children up to seven, so she was one of the youngest on the field and had to be quick and clever.'},
   {q:'What happened to Canada at the 2012 Olympics?',a:'In the semi-final against the United States, Christine scored three goals, but the United States scored a winning goal at the very end of extra time and Canada lost 4–3. Alex Morgan scored that goal, and her pop-up book tells the same match. A few days later Canada won the bronze medal.'},
   {q:'How many goals did Christine Sinclair score for Canada?',a:'In January 2020 she scored her 185th goal for Canada, more international goals than any player in the world, man or woman, had ever scored. She finished with 190.'},
   {q:'How did Canada win Olympic gold?',a:'At the Tokyo Olympics, held in 2021, Canada beat the United States 1–0 in the semi-final, nine years after London. In the final, Canada and Sweden drew 1–1 and Canada won on penalties. It was Canada’s first Olympic gold in women’s football.'},
  ],
  sourceNotes:'Changed before narration: the draft said two uncles were Canadian champions; sources differ on who won which title, so the book says her father and two uncles had all played. Rio 2016: the book says she scored the winning goal in the bronze match against Brazil. The Morgan book (/books/morgan) tells the 2012 semi-final from the US side.',
 };
export default page;
