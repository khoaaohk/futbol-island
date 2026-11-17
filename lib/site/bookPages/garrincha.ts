import type {BookPageSpec} from './types';
/* Garrincha sources checked Nov 17 2026 against the two Wikipedia articles the book lists (English and Portuguese). Every fact on this
 * page is in the book and in those articles; the factory, Carlos Pinto, Serrano, Arati and the drawing test are in the Portuguese
 * one only. Two of the book's wordings are worded more carefully here (see sourceNotes). */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Garrincha: Different legs, dazzling feet is a free six-chapter pop-up story for kids about Garrincha, the Brazilian right winger whose legs were bent, one shorter than the other. Coaches, clubs and a team test said no, and then he helped Brazil win the World Cup in 1958 and 1962. The story teaches that being different does not stop you, and that your chance can still come.',
  facts:[
   {icon:'tag',label:'Country',value:'Brazil'},
   {icon:'shirt',label:'Position',value:'Right winger',href:'/learn/soccer-positions/winger'},
   {icon:'clock',label:'Born',value:'1933, Pau Grande'},
   {icon:'steps',label:'Club',value:'Botafogo, from 1953'},
   {icon:'cards',label:'World Cups won',value:'1958 and 1962'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'What does Garrincha mean?',a:'A garrincha is a little brown bird, a wren. His real name was Manuel Francisco dos Santos. He was smaller than other children, so his sister called him Garrincha, and the name stuck.'},
   {q:'Were Garrincha’s legs different?',a:'Yes. His legs were bent, and his right leg was six centimetres shorter than his left. When he was a child, one doctor wrote that he was disabled. He became one of the greatest dribblers of all time.'},
   {q:'How did Garrincha join Botafogo?',a:'Two clubs, Vasco and São Cristóvão, had turned him down. Then Arati, a former Botafogo player, took him to the club. At his first training session Garrincha dribbled past Nílton Santos, a famous Brazil defender, and even put the ball through his legs. Nílton asked the club to sign him. On 19 July 1953, Garrincha scored three goals in his first game.'},
   {q:'Why was Garrincha left out at the 1958 World Cup?',a:'Before the World Cup, the team’s psychologist gave the players a drawing test. Garrincha scored low, and the psychologist said taking him would be a mistake. He was left out of Brazil’s first two matches. In the third, against the Soviet Union, he played, and Brazil started so brilliantly that people call it the best three minutes of football of all time. In the final he set up two goals, and Brazil won its first World Cup.'},
   {q:'Why was Garrincha called the Joy of the People?',a:'At the 1962 World Cup, Pelé was injured and Garrincha led his team. He scored four goals, two against England and two against Chile. Brazil beat Czechoslovakia 3–1 in the final, and Garrincha was named the best player of the tournament. Brazilians called him the Joy of the People, and the Bent-Legged Angel.'},
  ],
  exhibits:['worldcup-1930'],
  sourceNotes:'“Born with bent legs” (chapter 1): English Wikipedia says born so; Portuguese Wikipedia says some accounts blame polio, so the page says only that his legs were bent. “Pelé was injured after the second match” (chapter 6): Wikipedia says he was hurt during the second match; the page says “Pelé was injured”. “Some people said Garrincha dribbled too much” (chapter 4): Portuguese Wikipedia says some thought him too individualistic; left off the page.',
 };
export default page;
