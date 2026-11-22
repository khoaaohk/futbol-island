import type {BookData} from '../types';
/** Original child-readable retelling of Roberto Baggio's knee injuries and the 1994 penalty (staged Nov 21 2026: not sold until its spreads and
 *  narration exist). Facts come from the cited sources; the coping lessons are ours, not quotations. */
export const BAGGIO_BOOK:BookData={
 title:'Baggio',subtitle:'After the missed penalty',itemId:'display:plaza:book:baggio',player:'Roberto Baggio',
 sources:[
  {label:'Wikipedia · Roberto Baggio',url:'https://en.wikipedia.org/wiki/Roberto_Baggio'},
  {label:'Britannica · Roberto Baggio',url:'https://www.britannica.com/biography/Roberto-Baggio'},
  {label:'Planet Football · Roberto Baggio’s remarkable ability to bounce back',url:'https://www.planetfootball.com/nostalgia/tribute-roberto-baggio-remarkable-ability-bounce-back'},
 ],
 pages:[
  {id:'knee',year:'1985 · Aged 18',title:'Hurt before the big move',
   text:'Roberto Baggio was born in 1967 in Caldogno, a small town in Italy. On 5 May 1985, when he was eighteen, he badly hurt his knee in a match. It happened just two days before his move to a big club, Fiorentina, was finished.\n\nOpen the door. Some doctors feared he might never play again. But Fiorentina kept their promise and signed him anyway. They waited for him to get better.',
   lesson:'When people keep their promises in hard times, it gives you hope.',
   prompt:'Open the door',response:'Fiorentina kept the door open.',source:0},
  {id:'recovery',year:'1985 to 1987',title:'A long recovery',
   text:'Roberto needed a second operation on his knee, with 220 stitches. He lost a lot of weight, and he missed most of the next season. For a young player, waiting so long to play can be very hard.\n\nTurn the calendar pages. Getting better took a long, long time. Roberto kept working, and slowly his knee grew strong enough for him to play again. Knee problems came back later in his career, and each time he worked his way back.',
   lesson:'Long recoveries need patience. Keep believing in your body.',
   prompt:'Turn the calendar pages',response:'Back on the pitch!',steps:3,source:2},
  {id:'best',year:'1990 to 1993',title:'The best in the world',
   text:'At the 1990 World Cup, played in Italy, Roberto scored a brilliant goal against Czechoslovakia. He was becoming one of the most skilful players anywhere.\n\nLift the photo frame. In 1993, he won the Ballon d’Or, and FIFA named him the World Player of the Year. The young man with the injured knee was the best player in the world. Fans loved his skill, his calm and his famous ponytail.',
   lesson:'Setbacks early on do not stop you becoming great.',
   prompt:'Lift the photo frame',response:'The world’s best!',source:0},
  {id:'worldcup',year:'1994 · USA',title:'Carrying the team',
   text:'At the 1994 World Cup, in the United States, Roberto scored five goals in the knockout rounds. He kept playing even with a sore hamstring, a muscle at the back of the leg, and Italy reached the final.\n\nKick the ball. Goal after goal, Roberto helped his team move forward, all the way to the final against Brazil. Many people said Italy would not have reached the final without him.',
   lesson:'Helping your team can mean giving everything you have.',
   prompt:'Kick the ball',response:'Into the final!',source:0},
  {id:'penalty',year:'17 July 1994',title:'The penalty',
   text:'The final against Brazil ended without a goal, so it went to a penalty shootout. Roberto took Italy’s last penalty, and the ball went over the crossbar. Brazil were the world champions. Football can be very cruel in a shootout.\n\nLift the rain cloud. Roberto was very sad. Millions of people had watched. But one missed penalty did not change all the good he had done for his team.',
   lesson:'Everyone misses sometimes, even the best. A miss is a moment, not who you are.',
   prompt:'Lift the rain cloud',response:'Still a hero.',source:1},
  {id:'giving',year:'1998 to 2010',title:'Playing on, and giving back',
   text:'Roberto kept playing. He went to the 1998 World Cup, and from 2000 to 2004 he was the captain of Brescia, a smaller club, which retired his number 10 shirt to honour him. He scored 205 goals in Italy’s top league. He did not let one moment stop him.\n\nRaise the banner. In 2002, he became a Goodwill Ambassador for the United Nations, helping in the fight against hunger. In 2010, he won the Man of Peace award for his work for human rights.',
   lesson:'After a painful moment, keep playing and keep giving. People remember how you came back.',
   prompt:'Raise the banner',response:'Kind, as well as brilliant.',source:0},
 ]
};
