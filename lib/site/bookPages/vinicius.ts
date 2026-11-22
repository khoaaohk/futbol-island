import type {BookPageSpec} from './types';
/* Vinícius sources checked Nov 21 2026 against the sources the book lists. Every fact on this page is in the book.
 * Racism is named as wrong and never quoted; the incidents and court cases are left out, as in the book. See sourceNotes. */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Vinícius: Standing up to racism is a free six-chapter pop-up story for kids about Vinícius Júnior, who grew up in São Gonçalo in Brazil, learned futsal at a Flamengo football school and moved to Real Madrid at eighteen. He scored the winning goal in the 2022 Champions League final, spoke up against racism and started a charity that helps children keep learning. The story teaches that racism is never okay.',
  facts:[
   {icon:'tag',label:'Country',value:'Brazil'},
   {icon:'clock',label:'Grew up',value:'São Gonçalo, near Rio de Janeiro'},
   {icon:'cards',label:'Champions League final goal',value:'2022, the only goal'},
   {icon:'steps',label:'UNESCO Goodwill Ambassador',value:'2024'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Where did Vinícius Júnior learn to play?',a:'Vinícius was born in 2000 in São Gonçalo, near Rio de Janeiro. When he was six, his father took him to a football school run by Flamengo near their home. He played futsal there, the fast, small-sided game on a hard court with a smaller ball, which teaches quick feet and fast thinking.'},
   {q:'Who helped Vinícius Júnior when he joined Flamengo?',a:'In 2010 Vinícius was accepted into Flamengo’s youth team, but the training ground was a long way from home. He moved in with his uncle Ulisses to be closer to training, and the club and some local business people also helped the family with money.'},
   {q:'What did Vinícius Júnior do in the 2022 Champions League final?',a:'In May 2022, Real Madrid played Liverpool in the Champions League final in Paris. Vinícius scored the only goal of the game, and Real Madrid won 1–0. Some people had said his shooting was not good enough, so he had kept practising.'},
   {q:'How did Vinícius Júnior stand up to racism?',a:'In Spain, some people in football crowds abused Vinícius because of the colour of his skin. Racism is always wrong. Vinícius spoke up and asked for stronger action. In Brazil, new laws named after him allow matches to be stopped when there is racist abuse, and FIFA asked him to lead a group of players working against racism.'},
   {q:'What is the Instituto Vini Jr.?',a:'In 2021 Vinícius started the Instituto Vini Jr., which helps children and teenagers from poor neighbourhoods in Brazil go to school and keep learning. In 2024 UNESCO made him a Goodwill Ambassador for education, and that December FIFA named him The Best Men’s Player.'},
  ],
  sourceNotes:'Left out on purpose (docs/player-books/NEW-20-NOV21.md): the effigy incident and court cases; the final is dated “May 2022” only, because one source gives a wrong date.',
 };
export default page;
