import type {BookData} from '../types';
/** Original child-readable retelling of Formiga's long career, which began when Brazil had banned women's football (staged Nov 21 2026: not sold
 *  until its spreads and narration exist). Facts come from the cited sources; the coping lessons are ours, not quotations. */
export const FORMIGA_BOOK:BookData={
 title:'Formiga',subtitle:'The ant who never stopped',itemId:'display:beach:book:formiga',player:'Formiga',
 sources:[
  {label:'Wikipedia · Formiga (footballer, born 1978)',url:'https://en.wikipedia.org/wiki/Formiga_(footballer,_born_1978)'},
  {label:'NBC Sports · When Formiga was born, women in Brazil were banned from playing',url:'https://www.nbcsports.com/on-her-turf/news/when-7-time-olympian-formiga-was-born-women-in-brazil-were-banned-from-playing-soccer'},
 ],
 pages:[
  {id:'ban',year:'1978 · Salvador',title:'Born when girls could not play',
   text:'Formiga was born Miraildes Maciel Mota in 1978, in Salvador, Brazil. When she was born, a law in Brazil said that women were not allowed to play football. Girls who loved football had to play in secret, or not at all.\n\nFlip the sign. The law was removed in 1979, but for many years after that, girls who played football were still not taken seriously. Formiga would help to change that.',
   lesson:'An unfair rule can be changed. Keep playing, and help others play too.',
   prompt:'Flip the sign',response:'Now everyone can play.',source:1},
  {id:'mother',year:'Camaçari · Aged 12',title:'Her mother said yes',
   text:'When she was nine, Formiga’s family moved to Camaçari, near Salvador. She began playing football at twelve. Not everyone in her family wanted her to play.\n\nOpen the gate. Her mother, Dona Celeste, took her to play futsal for a club called Euroexport. With one person on her side, Formiga could start. Formiga learned quick passing and close control in futsal, skills she used all through her life.',
   lesson:'One person who believes in you can change everything.',
   prompt:'Open the gate',response:'Her mother believed.',source:0},
  {id:'ant',year:'The nickname',title:'Small and strong',
   text:'Formiga means ant in Portuguese. Someone watching one of her games said she looked like an ant, playing against bigger, older men. Her teammates said she played like ants work, together and for the whole team.\n\nLift the flap. Formiga has said she never liked the nickname, but it stayed with her for her whole career. An ant is tiny, but it can carry heavy loads and never stops working.',
   lesson:'Being small is not a weakness. Work hard and help your team, like an ant.',
   prompt:'Lift the flap',response:'Small, strong, together.',source:0},
  {id:'silver',year:'1995 to 2008',title:'So close, again and again',
   text:'Formiga first played for Brazil in 1995, when she was seventeen. Brazil came close to the biggest prizes many times. They lost the Olympic finals of 2004 and 2008 to the United States, and they finished second at the 2007 World Cup. Getting so close and not winning can feel even harder than losing early.\n\nTurn over the two medals. Losing big finals is painful. Each time, Formiga came back and played again. She kept training, kept passing and kept helping the younger players around her.',
   lesson:'Losing finals is hard. Coming back each time is what makes you strong.',
   prompt:'Turn over the two medals',response:'Silver, twice.',source:0},
  {id:'records',year:'2015 to 2020',title:'Seven World Cups',
   text:'Formiga played at seven World Cups, more than any other player. In 2015, at thirty-seven, she became the oldest player to score at a Women’s World Cup. In 2019, at forty-one, she became the oldest player ever at the tournament. Most footballers stop playing long before forty.\n\nClimb the steps. She also played at seven Olympic Games, from 1996 to 2020. No other footballer, man or woman, has played at seven World Cups and seven Olympics.',
   lesson:'If you love the game and look after your body, you can play for a long time.',
   prompt:'Climb the steps',response:'Seven and seven!',steps:3,source:0},
  {id:'farewell',year:'2021 · Aged 43',title:'A long, long journey',
   text:'In November 2021, Formiga played her last match for Brazil, at forty-three. She had played for her country for twenty-six years, and 234 times, more than any other Brazilian footballer, man or woman. She also played in France for Paris Saint-Germain, and at forty-one she became the oldest player to score in the Women’s Champions League.\n\nWave the flag. The girl born when women were not allowed to play had become one of the greatest players in Brazil’s history.',
   lesson:'Keep going, and you can open the way for the girls and boys who come after you.',
   prompt:'Wave the flag',response:'Obrigada, Formiga!',source:0},
 ]
};
