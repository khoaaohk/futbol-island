import type {BookPageSpec} from './types';
/* Kerr sources checked Nov 17 2026 against the English Wikipedia article the book lists (Sam Kerr); English is her own
 * language, so there is no second native-language article. Every fact on this page is in the book and in that article.
 * The book calls her Australia’s starting striker, so the page links the striker guide. See sourceNotes. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Kerr: Back from the big injury is a free six-chapter pop-up story for kids about Sam Kerr, who switched from Australian rules football to soccer at twelve and became Australia’s captain. She came back from a knee operation, an ankle injury and a calf injury, and after a big knee injury in 2024 she scored on her return twenty months later. The story teaches that big setbacks can take a long time to heal.',
  facts:[
   {icon:'tag',label:'Country',value:'Australia'},
   {icon:'shirt',label:'Position',value:'Striker',href:'/learn/soccer-positions/striker'},
   {icon:'clock',label:'Born',value:'1993, Western Australia'},
   {icon:'steps',label:'Switched to soccer',value:'At twelve'},
   {icon:'cards',label:'Comeback goal',value:'14 September 2025, for Chelsea'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why did Sam Kerr switch to soccer?',a:'Sam’s father and her older brother Daniel both played Australian rules football as professionals, and Sam played that game too when she was young. When she was twelve, she switched to soccer, mostly because of rules that limited girls in Australian rules football. It was not easy at first, but she kept going and played three years with the Western Knights, in Mosman Park.'},
   {q:'When did Sam Kerr first play for Australia?',a:'At thirteen, Sam was spotted by Bobby Despotovski, a striker for Perth Glory, who called her athleticism and raw talent exceptional. At fifteen, she played for Perth Glory, the youngest player ever in her league, and for Australia too.'},
   {q:'How did Sam Kerr come back from her first knee operation?',a:'In December 2014, Sam hurt her knee and needed an operation, only months before the World Cup in Canada. She worked hard with a fitness coach, Aaron Holt, to recover. She was ready in time, and she was Australia’s starting striker in their first World Cup match. Australia reached the quarter-finals.'},
   {q:'What happened to Sam Kerr at the 2023 World Cup?',a:'In 2023 the World Cup came to Australia, and Sam was the team’s captain. A calf injury kept her out of all three group games. She came on as a substitute against Denmark, and scored in the penalty shootout against France. In the semi-final against England, she scored a goal praised as one of the best of the tournament. Australia lost 3–1, but they had reached their first World Cup semi-final.'},
   {q:'How long was Sam Kerr out with her ACL injury?',a:'In January 2024, at a training camp in Morocco, Sam badly hurt her knee. It was an ACL injury, and twenty months passed before she played again. On 14 September 2025, she returned for Chelsea. She came on in the seventy-fifth minute, and in the ninety-third minute she scored her hundredth goal for the club.'},
  ],
  exhibits:['wwc-1991'],
  sourceNotes:'“Born … near Perth” (chapter 1): Wikipedia says East Fremantle, a suburb of Perth; the page says only Western Australia. Wikipedia adds that she now plays for Gotham FC in the United States (Chelsea, 2020 to 2026); the book does not say it and neither does the page.',
 };
export default page;
