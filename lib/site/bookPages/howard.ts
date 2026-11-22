import type {BookPageSpec} from './types';
/* Howard sources checked Nov 21 2026 against the sources the book lists (Wikipedia, Rutgers, U.S. Soccer). Every fact on this page is in the book.
 * Tourette syndrome and OCD are explained plainly, as in the book. See sourceNotes. */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Howard: Different, and focused is a free six-chapter pop-up story for kids about Tim Howard, the US goalkeeper who grew up with Tourette syndrome and OCD. He tried to hide his tics, found focus in goal, played for Manchester United and Everton, and made fifteen saves against Belgium at the 2014 World Cup. The story teaches that different is not wrong, and that your story can help someone feel less alone.',
  facts:[
   {icon:'tag',label:'Country',value:'USA'},
   {icon:'shirt',label:'Position',value:'Goalkeeper',href:'/learn/soccer-positions/goalkeeper'},
   {icon:'clock',label:'Lives with',value:'Tourette syndrome and OCD'},
   {icon:'cards',label:'Saves vs Belgium, 2014',value:'15, a World Cup record'},
   {icon:'steps',label:'USA caps',value:'121'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'What is Tourette syndrome?',a:'Tourette syndrome makes people have tics: sudden movements or sounds that are very hard to stop. Tim Howard found out he had it as a boy. He also has OCD, which can fill your head with worries that make you repeat things. Different is not wrong.'},
   {q:'How did being a goalkeeper help Tim Howard?',a:'Tim tried to hide his tics at school, and that made him very tired. In goal he could put all his energy into watching the ball. He has written that the way his brain works helps him focus very hard and react quickly.'},
   {q:'How did Tim Howard help other children?',a:'As a young professional with the MetroStars he began helping children who have Tourette syndrome, and in 2001 he won the league’s Humanitarian of the Year award. In 2014 he wrote a book about his life, The Keeper, and a leadership programme for teenagers with Tourette syndrome at Rutgers University carries his name.'},
   {q:'What happened against Belgium at the 2014 World Cup?',a:'In a knockout match in Brazil, Belgium attacked again and again. Tim made fifteen saves, a World Cup record for one match. The United States lost 2–1 after extra time, but people everywhere talked about his brave goalkeeping.'},
  ],
  sourceNotes:'Diagnosis age differs (9 to 12) so the book says "as a boy". Fifteen saves is FIFA’s updated count (not 16). Tics and OCD are described simply and never shown as a joke in the art.',
 };
export default page;
