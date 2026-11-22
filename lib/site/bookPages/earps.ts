import type {BookPageSpec} from './types';
/* Earps sources checked Nov 21 2026 against the sources the book lists. Every fact on this page is in the book. Being dropped
 * in 2019 and thinking about stopping in 2021 come from BBC and ESPN coverage of the BBC film about her team. See sourceNotes. */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Earps: Left out, then the world’s best is a free six-chapter pop-up story for kids about Mary Earps, the goalkeeper England stopped picking in 2019, who thought about giving up. A new manager gave her a chance in 2021; she played every minute as England won Euro 2022, saved a penalty in the 2023 World Cup final and was named The Best FIFA goalkeeper twice. The story teaches that being left out is not the end.',
  facts:[
   {icon:'tag',label:'Country',value:'England'},
   {icon:'shirt',label:'Position',value:'Goalkeeper',href:'/learn/soccer-positions/goalkeeper'},
   {icon:'steps',label:'First club',value:'West Bridgford, at ten'},
   {icon:'clock',label:'Euro 2022',value:'Every minute of all six matches'},
   {icon:'cards',label:'The Best FIFA goalkeeper',value:'2022 and 2023'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'How did Mary Earps become a goalkeeper?',a:'Mary was born in 1993 in Nottingham. She started playing football at ten, for a team called West Bridgford, and her coaches saw that she could be a goalkeeper. She played for many clubs as she grew up, and in 2018 she moved to Wolfsburg in Germany, where her team won the league and the cup.'},
   {q:'Was Mary Earps ever left out of the England team?',a:'Yes. In 2019 the England manager at the time stopped picking her, and in 2021 she even thought about stopping football. She talked honestly about those feelings later, in a BBC film about her team, and she kept training even though she did not know if she would be picked again.'},
   {q:'Who gave Mary Earps her England chance back?',a:'In 2021 England had a new manager, Sarina Wiegman. In her very first match, in September 2021, she picked Mary as the starting goalkeeper. Mary kept improving and soon became England’s number one.'},
   {q:'What did Mary Earps do in the 2023 World Cup final?',a:'In the 2023 World Cup final against Spain, Mary dived and saved a penalty in the sixty-eighth minute. England still lost 1–0, but she won the Golden Glove, the prize for the best goalkeeper of the tournament.'},
   {q:'Why did Mary Earps speak up about goalkeeper shirts?',a:'In the summer of 2023, fans could not buy an England goalkeeper shirt with her name on it, because the shirt maker had not made one. Mary spoke up about it, for the fans and for young goalkeepers who wanted one.'},
  ],
  sourceNotes:'Left out on purpose (docs/player-books/NEW-20-NOV21.md): the contract and pay detail. "Dropped in 2019" and "thought about stopping in 2021" are from the ESPN/BBC coverage of the BBC documentary.',
 };
export default page;
