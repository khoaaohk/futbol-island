import type {BookData} from '../types';
/** Original child-readable retelling of Alex Morgan's late start and comebacks (staged Nov 21 2026: not sold until its spreads and narration exist).
 *  Facts come from the cited sources; the coping lessons are ours, not quotations. */
export const MORGAN_BOOK:BookData={
 title:'Morgan',subtitle:'A late start and a big comeback',itemId:'display:sharks:book:morgan',player:'Alex Morgan',
 sources:[
  {label:'Wikipedia · Alex Morgan',url:'https://en.wikipedia.org/wiki/Alex_Morgan'},
  {label:'Soccer America · Becoming Alex Morgan',url:'https://www.socceramerica.com/becoming-alex-morgan-rising-star-reflects-on-yout/'},
  {label:'U.S. Soccer · Alex Morgan announces retirement',url:'https://next.ussoccer.com/stories/2024/09/womens-soccer-icon-world-cup-champion-olympic-gold-medalist-alex-morgan-announces-retirement'},
 ],
 pages:[
  {id:'late',year:'2003 · Aged 14',title:'Starting late',
   text:'Alex Morgan was born in 1989 in San Dimas, California, in the United States. She played soccer for fun in a local league, but she did not join a club team until she was fourteen. Many players start much younger. Some of the girls she played against had been in club teams for years.\n\nOpen the gate. Starting late meant Alex had a lot to learn. She learned fast, and three years later she was playing for her country’s under-20 team.',
   lesson:'It is never too late to start. Begin where you are, and keep learning.',
   prompt:'Open the gate',response:'Never too late.',source:0},
  {id:'knee',year:'2006 · Aged 17',title:'A big knee injury',
   text:'When she was seventeen, Alex tore a ligament in her knee, called the ACL, during a practice game. She missed her last season of high school soccer. An ACL injury is one of the biggest injuries a footballer can have. It takes months of hard work to get back.\n\nFill the comeback bar. Alex worked hard to get her knee strong again. She has said she was back on the field in five months. She did her exercises, rested when she needed to and listened to the people helping her.',
   lesson:'Injuries take patience. Work with your helpers, and your body can get strong again.',
   prompt:'Fill the comeback bar',response:'Back on the field!',steps:3,source:1},
  {id:'u20',year:'2008 · Chile',title:'The winning goal',
   text:'In 2008, Alex played for the United States at the Under-20 World Cup in Chile. She scored four goals at the tournament. Only two years had passed since her big knee injury.\n\nKick the ball. Her fourth goal won the final, and the United States became under-20 world champions. All the hard work during her recovery had paid off.',
   lesson:'Your hard work in the quiet months shows on the big day.',
   prompt:'Kick the ball',response:'Under-20 champions!',source:0},
  {id:'final',year:'2011 · World Cup',title:'The youngest, and a lost final',
   text:'At the 2011 World Cup in Germany, Alex was the youngest player on the US team. She scored her first World Cup goal in the semi-final against France. She was young, and she was playing on the biggest stage in the world.\n\nLift the rain cloud. In the final, the United States drew 2–2 with Japan, and then lost on penalties. Losing a final is very hard, especially when you are young. Alex and her teammates used that sadness to work even harder.',
   lesson:'Losing a final hurts. Rest, learn and come back.',
   prompt:'Lift the rain cloud',response:'Ready to try again.',source:0},
  {id:'london',year:'London 2012',title:'In the 123rd minute',
   text:'At the 2012 Olympics, the United States played Canada in an exciting semi-final. With the score 3–3, deep into extra time, Alex scored in the 123rd minute. Canada’s captain, Christine Sinclair, had scored three goals, and the game was nearly over.\n\nFlip the scoreboard. The United States won 4–3, then beat Japan 2–1 in the final. Alex was an Olympic champion. The disappointment of the year before had turned into joy.',
   lesson:'Stay ready until the very last minute.',
   prompt:'Flip the scoreboard',response:'Olympic gold!',source:0},
  {id:'books',year:'2015 to 2024',title:'Two World Cups and a bookshelf',
   text:'Alex had more injuries, to her ankle, knee and hamstring, and each time she came back. She won the World Cup twice, in 2015 and 2019. She played for clubs in the United States and in France.\n\nOpen the book. Alex also wrote children’s books, a series called The Kicks, about a girl who plays soccer. In September 2024, she stopped playing, as she was expecting her second child.',
   lesson:'Setbacks come and go. Keep going, and help the next generation too.',
   prompt:'Open the book',response:'Two-time world champion.',source:2},
 ]
};
