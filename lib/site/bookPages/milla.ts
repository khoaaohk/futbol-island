import type {BookPageSpec} from './types';
/* Milla sources checked Nov 21 2026 (Wikipedia, Britannica, Olympics.com, FourFourTwo). Every fact on this page is in the book. He came on
 * as a substitute for all four Italia 90 goals (Britannica, Olympics.com), and his 1994 goal against Russia at 42 is still the record. */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Milla: Never too old is a free six-chapter pop-up story for kids about Roger Milla, who moved again and again as a boy in Cameroon, played for many years in France and was enjoying football on a quiet island when his country called him back at thirty-eight. At the 1990 World Cup he came off the bench, scored four goals and danced at the corner flag. The story teaches that you are never too old to try.',
  facts:[
   {icon:'tag',label:'Country',value:'Cameroon'},
   {icon:'clock',label:'Called back',value:'At 38, for Italia 90'},
   {icon:'steps',label:'Italia 90 goals',value:'4, all as a substitute'},
   {icon:'cards',label:'Oldest World Cup scorer',value:'42, in 1994'},
   {icon:'shirt',label:'African Footballer of the Year',value:'1976 and 1990'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Where did Roger Milla grow up?',a:'Roger Milla was born in 1952 in Yaoundé, in Cameroon. His father worked on the railways, so the family moved around, and when Roger was eleven they moved to Douala. Wherever they went, he found a game.'},
   {q:'How old was Roger Milla at the 1990 World Cup?',a:'He was thirty-eight. He had stopped playing for Cameroon in 1988 and was playing on Réunion, an island in the Indian Ocean, when the President of Cameroon asked him to come back.'},
   {q:'How many goals did Roger Milla score at Italia 90?',a:'Four, all after coming on as a substitute: two against Romania and two against Colombia. After each goal he danced at the corner flag, and Cameroon became the first African team to reach a World Cup quarter-final.'},
   {q:'Who is the oldest player to score at a World Cup?',a:'Roger Milla. At the 1994 World Cup in the United States he scored against Russia at forty-two, the oldest player ever to score at a World Cup.'},
   {q:'What awards did Roger Milla win?',a:'He was African Footballer of the Year in 1976 and again in 1990, and in 2007 he was named the best African player of the past fifty years.'},
  ],
  sourceNotes:'Left out on purpose (docs/player-books/NEW-20-NOV21.md): the 6–1 loss to Russia in the game he scored in 1994.',
 };
export default page;
