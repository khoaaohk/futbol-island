import type {BookPageSpec} from './types';
/* Van Dijk sources checked Nov 21 2026 against the sources the book lists. Every fact on this page is in the book. Joining
 * Willem II at eight was confirmed on Wikipedia; the hospital "will" and weight figures are left out, as in the book. */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Van Dijk: Late, but not too late is a free six-chapter pop-up story for kids about Virgil van Dijk, who washed dishes as a teenager, was not offered a contract by his first club, grew about 18 centimetres at seventeen and was very ill at twenty. He came back, climbed step by step to Liverpool, won the Champions League and became captain. The story teaches that bodies grow at different times.',
  facts:[
   {icon:'tag',label:'Country',value:'Netherlands'},
   {icon:'clock',label:'Teenage job',value:'Washing dishes'},
   {icon:'steps',label:'FC Groningen',value:'Joined at nineteen, 2010'},
   {icon:'cards',label:'Champions League',value:'2019'},
   {icon:'shirt',label:'Liverpool captain',value:'2023'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Was Virgil van Dijk rejected as a young player?',a:'Yes. At Willem II, where he joined the youth academy at eight, he was not seen as good enough. One coach said he had too many limitations, and the club did not offer him a contract. At seventeen he grew about 18 centimetres and moved from right-back to centre-back.'},
   {q:'Did Virgil van Dijk have a job as a teenager?',a:'Yes. As a teenager he had a part-time job washing dishes in a restaurant in Breda, on the days when he did not have training or a match.'},
   {q:'Was Virgil van Dijk ill when he was young?',a:'Soon after his twentieth birthday, a problem with his appendix turned into a serious infection and he needed an emergency operation. He spent thirteen days in hospital. Getting better took months of rest and patience, and by the summer of 2012 he was back with his team at FC Groningen.'},
   {q:'Which clubs did Virgil van Dijk play for?',a:'FC Groningen from 2010, Celtic in Scotland from 2013, where he won the league twice, Southampton from 2015 and Liverpool from January 2018, when it was the biggest fee ever paid for a defender.'},
   {q:'What has Virgil van Dijk won?',a:'In 2019 he won the Champions League with Liverpool and was named UEFA’s Men’s Player of the Year, and he came second for the Ballon d’Or. After a bad knee injury in 2020 he worked for months to come back, and in 2023 he became Liverpool’s captain.'},
  ],
  sourceNotes:'Left out on purpose (docs/player-books/NEW-20-NOV21.md): the hospital details and weight figures. The illness is told gently, with no treatment detail.',
 };
export default page;
