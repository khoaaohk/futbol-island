import type {BookPageSpec} from './types';
/* Morgan sources checked Nov 21 2026 against the sources the book lists (Wikipedia, Soccer America, U.S. Soccer). Every fact on this page is in
 * the book. The 2012 semi-final is the same match as the Sinclair book's London chapter (/books/sinclair). See sourceNotes. */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Morgan: A late start and a big comeback is a free six-chapter pop-up story for kids about Alex Morgan of the United States. She joined her first club team at fourteen, tore her knee ligament at seventeen and came back to win the Under-20 World Cup. She lost the 2011 World Cup final, then scored in the 123rd minute at the 2012 Olympics. The story teaches that it is never too late to start.',
  facts:[
   {icon:'tag',label:'Country',value:'USA'},
   {icon:'clock',label:'Club soccer from',value:'Age 14'},
   {icon:'steps',label:'Under-20 world champion',value:'2008'},
   {icon:'cards',label:'Olympic gold',value:'2012'},
   {icon:'shirt',label:'World Cups won',value:'2015, 2019'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
   {icon:'cards',label:'Same 2012 match',value:'Christine Sinclair’s book',href:'/books/sinclair'},
  ],
  faq:[
   {q:'When did Alex Morgan start playing club soccer?',a:'Alex was born in 1989 in San Dimas, California. She played for fun in a local league but did not join a club team until she was fourteen, much later than many players. She learned fast, and three years later she was playing for her country’s under-20 team.'},
   {q:'How did Alex Morgan come back from her knee injury?',a:'At seventeen she tore a ligament in her knee, the ACL, and missed her last season of high school soccer. She did her exercises, rested when she needed to and listened to the people helping her. She has said she was back on the field in five months.'},
   {q:'What happened in the 2012 Olympic semi-final?',a:'The United States played Canada. With the score 3–3 deep into extra time, Alex scored in the 123rd minute. Canada’s captain, Christine Sinclair, had scored three goals; her pop-up book tells the same match. The United States won 4–3, then beat Japan 2–1 in the final.'},
   {q:'Did Alex Morgan write books?',a:'Yes. She wrote a series of children’s books called The Kicks, about a girl who plays soccer. She stopped playing in September 2024, as she was expecting her second child.'},
  ],
  sourceNotes:'Checked: the 2008 Under-20 final was 2–1 over North Korea; Morgan scored the second US goal (Leroux the first), so "her fourth goal won the final" stands. ACL timing is her own account (senior year, back in five months); the "delayed until 2008" line is left out.',
 };
export default page;
