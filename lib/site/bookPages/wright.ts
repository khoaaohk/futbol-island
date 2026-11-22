import type {BookPageSpec} from './types';
/* Wright sources checked Nov 21 2026 against the sources the book lists (Wikipedia, Tes, London Museum). Every fact on this page is in the book.
 * His home life is named only in general terms, with the book's "tell a trusted adult" lesson. See sourceNotes. */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Wright: A teacher who believed is a free six-chapter pop-up story for kids about Ian Wright, who grew up in south London, where home was not always a happy place. A teacher, Mr Pigden, helped him learn to read and believed in him. Two clubs turned him down, he signed for Crystal Palace at twenty-one and scored 185 goals for Arsenal. The story teaches that one kind grown-up can change a life.',
  facts:[
   {icon:'tag',label:'Country',value:'England'},
   {icon:'clock',label:'His teacher',value:'Mr Pigden'},
   {icon:'steps',label:'First professional club',value:'Crystal Palace, at 21'},
   {icon:'cards',label:'Arsenal goals',value:'185'},
   {icon:'shirt',label:'Thank you',value:'Reunited on the BBC, 2005'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Who was Ian Wright’s teacher, Mr Pigden?',a:'Sydney Pigden was one of Ian’s teachers at primary school, and long before he had been a pilot in the Second World War. He noticed Ian, helped him learn to read and write, and believed in him. Ian later called him the first positive male figure in his life.'},
   {q:'Was Ian Wright turned down by clubs?',a:'Yes. As a teenager he had trials at Southend United and Brighton, and neither offered him a contract. He kept playing in Sunday league football and became the top scorer in his league.'},
   {q:'When did Ian Wright become a professional footballer?',a:'In August 1985, at twenty-one, he signed for Crystal Palace after playing for Greenwich Borough. Most new professionals are much younger. In 1989 he scored 24 league goals and helped Palace win promotion to the top division.'},
   {q:'How many goals did Ian Wright score for Arsenal?',a:'He scored 185 goals for Arsenal, more than anyone before him, and won the FA Cup, the League Cup and the league title. Thierry Henry beat his record in 2005.'},
   {q:'What happened when Ian Wright met Mr Pigden again?',a:'Ian had been told that Mr Pigden had died. But in 2005, on a BBC television programme, his old teacher walked in to meet him. Ian was so happy that he cried, and they hugged. Ian later dedicated his life story, written in 2016, to Mr Pigden.'},
  ],
  sourceNotes:'Changed before narration: "a PE teacher" became "one of his teachers" (sources call him his primary school teacher). Reunion year 2005 (Wikipedia: With a Little Help From My Friends); Tes says 2010. 24 league goals in 1988–89 confirmed (Wikipedia). His stepfather’s abuse and his early-1980s prison spell are left out.',
 };
export default page;
