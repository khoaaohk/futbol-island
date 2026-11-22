import type {BookPageSpec} from './types';
/* Sawa sources checked Nov 21 2026 against the sources the book lists. Every fact on this page is in the book. "The only
 * girl on the boys' team" and "she learned English" are not verified and are left out, as in the book. */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Sawa: Hope after the wave is a free six-chapter pop-up story for kids about Homare Sawa, who joined her brother’s boys’ team at six, scored four goals for Japan at fifteen and started again in America when her club ended her contract. Months after the 2011 earthquake and tsunami, she scored in the 117th minute of the World Cup final and Japan won. The story teaches that doing your best can lift other people too.',
  facts:[
   {icon:'tag',label:'Country',value:'Japan'},
   {icon:'steps',label:'First Japan game',value:'At fifteen, four goals'},
   {icon:'cards',label:'World champion',value:'2011, captain'},
   {icon:'shirt',label:'World Player of the Year',value:'2011, first from Asia'},
   {icon:'clock',label:'World Cups',value:'6, from 1995 to 2015'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'How did Homare Sawa start playing football?',a:'Homare Sawa was born in 1978 in Fuchū, a city in Tokyo. When she was six, she went to watch her older brother train, and his coach invited her to join the boys’ team. Playing with boys and older players made her quick, brave and clever with the ball.'},
   {q:'How young was Homare Sawa when she played for Japan?',a:'She played her first match in Japan’s top women’s league at twelve, for Yomiuri Beleza. In December 1993, at fifteen, she played for Japan for the first time and scored four goals against the Philippines.'},
   {q:'Did Homare Sawa play in America?',a:'Yes. In 1999 her club in Japan ended her contract, so she went to play in the United States. From 2001 to 2003 she played for the Atlanta Beat in a new professional league.'},
   {q:'What happened in the 2011 Women’s World Cup final?',a:'A few months after the earthquake and tsunami in Japan, Japan played the United States in the final, with Homare as captain. The United States led 2–1 in extra time, then Homare scored in the 117th minute to make it 2–2. Japan won the penalty shootout 3–1, the first Asian team to win the Women’s World Cup.'},
   {q:'What awards did Homare Sawa win?',a:'She won the Golden Ball and the Golden Boot, with five goals, at the 2011 World Cup, and FIFA named her the Women’s World Player of the Year, the first Asian player, man or woman, to win such a big award. She played in six World Cups and for Japan for twenty-two years.'},
  ],
  sourceNotes:'Left out on purpose (docs/player-books/NEW-20-NOV21.md): "the only girl on the boys’ team" and "she learned English" (not verified). The 2011 disaster is told gently, with no damage drawn.',
 };
export default page;
