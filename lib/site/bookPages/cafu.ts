import type {BookPageSpec} from './types';
/* Cafu sources checked Nov 17 2026 against Wikipedia (the CNN page answered HTTP 451 from here): every fact on this page is
 * there except the book's last two sentences (a foundation in Jardim Irene, "everything he has, he owes to Jardim Irene"), which
 * Wikipedia does not state, so the FAQ leaves them out; the story text keeps the book's words (owner to confirm). */
/** Cafu (the sample, Nov 17 2026): the clearest single lesson (five clubs said no, then yes), a real position change that the
 *  positions guide teaches (right-back, the overlap) and three World Cup finals; every chapter has a source. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Cafu: Told no, again and again is a free six-chapter pop-up story for kids about Cafu, the Brazilian right-back who was turned down at trials by five big clubs before his hometown club, São Paulo, said yes in 1988. He went on to play in three World Cup finals in a row. The story teaches that one coach’s no is not the end of your story.',
  facts:[
   {icon:'tag',label:'Country',value:'Brazil'},
   {icon:'shirt',label:'Position',value:'Right-back',href:'/learn/soccer-positions/fullback'},
   {icon:'clock',label:'Born',value:'1970, near São Paulo'},
   {icon:'steps',label:'Club',value:'São Paulo, from 1988'},
   {icon:'cards',label:'World Cup finals',value:'1994, 1998 and 2002'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Which clubs told Cafu no?',a:'As a boy, Cafu went to trials at some of Brazil’s biggest clubs. Corinthians, Palmeiras, Santos, Atlético Mineiro and Portuguesa all said no. Cafu could have given up. Instead, he kept training and kept trying, and in 1988 his hometown club, São Paulo, said yes.'},
   {q:'Why is he called Cafu?',a:'His real name is Marcos. Friends called him Cafu, after a Brazilian winger called Cafuringa.'},
   {q:'How did Cafu become a right-back?',a:'Cafu was a right-sided midfielder. His coach at São Paulo, Telê Santana, moved him back to right-back, a position he had never played. It suited him: he defended, then sprinted forward on the overlap to attack. With Cafu at right-back, São Paulo won the Copa Libertadores in 1992 and 1993.'},
   {q:'How many World Cup finals did Cafu play in?',a:'Three in a row, and no other player has ever done that. In 1994 he came on from the bench in the final against Italy and Brazil won. In 1998 Brazil lost the final to France. In 2002 he was Brazil’s captain, and Brazil beat Germany 2–0.'},
   {q:'What did “100% Jardim Irene” mean?',a:'When Cafu lifted the World Cup trophy in 2002, his shirt said 100% Jardim Irene, for the poor part of São Paulo where he grew up.'},
  ],
  motifs:['street','cards','gate','overlap','swap','trophy'],
  exhibits:['worldcup-1930'],
 };
export default page;
