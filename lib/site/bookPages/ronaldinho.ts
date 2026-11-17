import type {BookPageSpec} from './types';
/* Ronaldinho sources checked Nov 17 2026 against Wikipedia (the book's only source): every fact on this page is in the book and in
 * that article. The book does not give his position, so the page does not either. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Ronaldinho: Joy after sadness is a free six-chapter pop-up story for kids about Ronaldinho, the Brazilian footballer from Porto Alegre whose father died when he was eight. He learned many of his famous moves in futsal, won the World Cup with Brazil in 2002, and was applauded even by other teams’ fans. The story teaches that families find ways to remember, and that joy can come back after sadness.',
  facts:[
   {icon:'tag',label:'Country',value:'Brazil'},
   {icon:'clock',label:'Born',value:'1980, Porto Alegre'},
   {icon:'shirt',label:'Real name',value:'Ronaldo de Assis Moreira'},
   {icon:'cards',label:'World Cup',value:'Winner in 2002'},
   {icon:'steps',label:'Copa Libertadores',value:'2013, Atlético Mineiro'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why is he called Ronaldinho?',a:'His real name is Ronaldo de Assis Moreira. He was often the youngest and smallest player in youth matches, so people called him Ronaldinho. In Portuguese, the ending “inho” means small, and it is also a loving, friendly word.'},
   {q:'What happened to Ronaldinho’s dad?',a:'When Ronaldinho was eight years old, his father, João, died in an accident at their new home. Years later, when Ronaldinho’s own son was born in 2005, he named the baby João, after his father.'},
   {q:'Where did Ronaldinho learn his tricks?',a:'He played futsal and beach football, and many of his famous moves came from futsal. At 13 he scored all 23 goals in a 23–0 win.'},
   {q:'What was Ronaldinho’s famous free kick?',a:'At the 2002 World Cup, in the quarter-final against England, his free kick from far out curled into the top corner and surprised the goalkeeper. Brazil went on to win the World Cup.'},
   {q:'Why did Ronaldinho wear number 49?',a:'At Atlético Mineiro in Brazil he wore number 49, for the year his mother was born. In 2013 he helped the club win its first Copa Libertadores.'},
  ],
  exhibits:['ball-curve','futsal-1989'],
 };
export default page;
