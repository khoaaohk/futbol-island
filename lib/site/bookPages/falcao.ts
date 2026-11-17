import type {BookPageSpec} from './types';
/* Falcão sources checked Nov 17 2026 against the two Wikipedia articles the book lists (English and Portuguese). Every fact on this
 * page is in the book and in those articles; most details (the grass trials, the São Paulo games, 2012 and 2016) are only in the
 * Portuguese one. The book does not give his birth year or his futsal position, so the page does not either. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Falcão: Closed doors and coming back is a free six-chapter pop-up story for kids about Falcão, the Brazilian futsal player who tried the big grass game again and again but kept coming back to futsal, his true love. He lost a World Cup final in 2000, then won the Futsal World Cup in 2008 and 2012. The story teaches that a closed door is not the end of your story.',
  facts:[
   {icon:'tag',label:'Country',value:'Brazil'},
   {icon:'shirt',label:'Sport',value:'Futsal',href:'/learn/futsal-for-kids'},
   {icon:'clock',label:'Grew up',value:'The north of São Paulo'},
   {icon:'cards',label:'World Cup titles',value:'2008 and 2012'},
   {icon:'steps',label:'World Cup goals',value:'48, the most ever'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why is he called Falcão?',a:'His real name is Alessandro Rosa Vieira. His father, João, was a butcher who also played football on neighbourhood fields, and people there called João “Falcão”. His son was given the same nickname.'},
   {q:'Did Falcão ever play football on grass?',a:'Yes, many times. As a teenager at Corinthians he tried the grass game seven times, and each time he came back to futsal. In 2001 Palmeiras gave him a trial and he scored, but the club never gave him a clear answer. In 2005 the São Paulo club signed him. He played thirteen games in about six months, then went back to futsal.'},
   {q:'Why did Falcão play for São Paulo in 2005?',a:'His father had always dreamed of seeing his son play football on a big grass pitch. His father died early in 2004. Falcão’s first game for São Paulo came exactly one year after his father died.'},
   {q:'How many Futsal World Cups did Falcão win?',a:'Two. In 2000 Brazil lost the final to Spain, four goals to three, and in 2004 they finished third. In 2008 Brazil won at home, and Falcão was the best player of the tournament. In 2012 he was hurt and played only thirty-seven minutes, but he scored the equaliser in the final against Spain, and Brazil won in extra time.'},
   {q:'What happened at Falcão’s last World Cup?',a:'In 2016, at thirty-nine, he scored ten goals and became the top scorer in World Cup history, with forty-eight. Brazil drew with Iran, four goals each, and lost the penalty shootout. The Iran players lifted Falcão into the air to honour him, and he cried.'},
  ],
  exhibits:['futsal-1989'],
  sourceNotes:'The book says he joined Guapira at twelve: English Wikipedia says age 12, Portuguese Wikipedia says 1991 (when he was 13 or 14); the page does not give the age. Thirteen games for São Paulo, the Palmeiras goal and the 2012 details are in Portuguese Wikipedia only.',
 };
export default page;
