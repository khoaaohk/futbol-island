import type {BookPageSpec} from './types';
/* Vardy sources checked Nov 17 2026 against the two Wikipedia articles the book lists (English and German). Every fact on this
 * page is in the book and in those articles; "too small" and the time he stopped playing are in the German one only. The book
 * does not name his position, so the page does not either. One age is worded carefully (see sourceNotes). */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Vardy: Too small? Not for ever is a free six-chapter pop-up story for kids about Jamie Vardy, who was let go by Sheffield Wednesday as a teenager and played for small clubs while working as a technician making medical splints. He climbed one step at a time and became a champion of England with Leicester City. The story teaches that one club’s opinion does not decide what you can become.',
  facts:[
   {icon:'tag',label:'Country',value:'England'},
   {icon:'clock',label:'Grew up',value:'Hillsborough, Sheffield'},
   {icon:'shirt',label:'First senior club',value:'Stocksbridge Park Steels, £120 a week'},
   {icon:'steps',label:'Leicester City',value:'Signed in 2012, at 25'},
   {icon:'cards',label:'Record',value:'Goals in 11 Premier League games in a row'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why did Sheffield Wednesday let Vardy go?',a:'Jamie grew up in Hillsborough, in Sheffield, loved Sheffield Wednesday and played in its youth teams. As a teenager he was let go because the club thought he was too small. For a while he stopped playing football altogether.'},
   {q:'What job did Vardy have?',a:'When he started playing again, for the small club Stocksbridge Park Steels, he earned £120 a week. He also worked as a technician, making medical splints that support injured arms and legs. He kept getting better, made the first team, and scored 55 goals for the club.'},
   {q:'How did Vardy reach Leicester City?',a:'In 2009 he spent a week on trial with Crewe Alexandra, but the move did not happen. In 2010 Neil Aspin signed him for FC Halifax Town, where he was top scorer with 25 goals. In 2011 he moved to Fleetwood Town, scored 31 league goals, and Fleetwood won promotion to the Football League. In 2012 Leicester City signed him for about one million pounds. He was twenty-five.'},
   {q:'Did Vardy nearly quit football?',a:'Yes. His first season at Leicester was hard. He lost his form, some supporters criticised him online, and he thought about leaving football. His manager, Nigel Pearson, and the assistant manager, Craig Shakespeare, convinced him to stay. The next season he scored 16 league goals, and Leicester were promoted to the Premier League.'},
   {q:'What record did Vardy set?',a:'In the 2015–16 season he scored in eleven Premier League matches in a row, a new record. Leicester were the underdogs, a team few people expected to win, but they became the champions of England. Jamie was named the Premier League Player of the Season, and he played for England too.'},
  ],
  sourceNotes:'“When he was sixteen, the club let him go” (chapter 1): English Wikipedia says 16, German Wikipedia says 15; the page says “as a teenager”.',
 };
export default page;
