import type {BookPageSpec} from './types';
/* Formiga sources checked Nov 21 2026 (Wikipedia, NBC Sports, FIFA, Guinness). Every fact on this page is in the book. Cap totals differ
 * between sources (CBF gave 233 before her farewell match); the book uses Wikipedia's 234, which counts that match. */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Formiga: The ant who never stopped is a free six-chapter pop-up story for kids about Formiga, born in Brazil in 1978 when a law said women could not play football. Her mother took her to futsal, she lost two Olympic finals, and she kept going: seven World Cups, seven Olympic Games and 234 games for Brazil, until she was 43. The story teaches that unfair rules can change, and that you can open the way for others.',
  facts:[
   {icon:'tag',label:'Country',value:'Brazil'},
   {icon:'clock',label:'Born',value:'1978, Salvador'},
   {icon:'steps',label:'World Cups',value:'7, a record'},
   {icon:'cards',label:'Olympic Games',value:'7, 1996 to 2020'},
   {icon:'shirt',label:'Games for Brazil',value:'234'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Was women’s football banned in Brazil?',a:'Yes. When Formiga was born in 1978, a law in Brazil said women were not allowed to play football. The law was removed in 1979, but for many years girls who played were still not taken seriously.'},
   {q:'Why is she called Formiga?',a:'Formiga means ant in Portuguese. Someone watching one of her games said she looked like an ant, playing against bigger, older men. She has said she never liked the nickname, but it stayed with her for her whole career.'},
   {q:'Who helped Formiga start playing?',a:'Not everyone in her family wanted her to play. Her mother, Dona Celeste, took her to play futsal for a club called Euroexport, where she learned quick passing and close control.'},
   {q:'How many World Cups did Formiga play in?',a:'Seven World Cups, more than any other player, and seven Olympic Games, from 1996 to 2020. No other footballer, man or woman, has played at seven of each. In 2019, at forty-one, she was the oldest player ever at a Women’s World Cup.'},
   {q:'When did Formiga stop playing for Brazil?',a:'In November 2021, at forty-three, after twenty-six years and 234 games for her country, more than any other Brazilian footballer. She also played for Paris Saint-Germain, and at forty-one became the oldest player to score in the Women’s Champions League.'},
  ],
  sourceNotes:'Left out on purpose (docs/player-books/NEW-20-NOV21.md): family violence (told only as “not everyone in her family wanted her to play”). Changed before narration: “her teammates said she played like ants work” (not found) became “she was small, and she ran all over the pitch”.',
 };
export default page;
