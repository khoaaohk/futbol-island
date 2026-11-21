import type {BookData} from '../types';
/** Original child-readable retelling of Virgil van Dijk's late growth, serious illness and climb (staged Nov 21 2026: not sold until its spreads and
 *  narration exist). Facts come from the cited sources; the coping lessons are ours, not quotations. The illness is told gently (no treatment detail). */
export const VANDIJK_BOOK:BookData={
 title:'Van Dijk',subtitle:'Late, but not too late',itemId:'display:clubgrounds:book:vandijk',player:'Virgil van Dijk',
 sources:[
  {label:'Wikipedia · Virgil van Dijk',url:'https://en.wikipedia.org/wiki/Virgil_van_Dijk'},
  {label:'ESPN · How the Dutch defender became Liverpool’s leader',url:'https://global.espn.com/football/story/_/id/37508198/how-dutch-defender-became-liverpool-leader'},
  {label:'FourFourTwo · The making of Virgil van Dijk',url:'https://www.fourfourtwo.com/features/making-virgil-van-dijk-how-liverpools-rock-became-worlds-best-defender'},
 ],
 pages:[
  {id:'dishes',year:'Breda · Teenager',title:'Washing dishes',
   text:'Virgil van Dijk was born in 1991 in Breda, in the Netherlands. At eight, he joined the youth academy of a club called Willem II. As a teenager, he also had a part-time job washing dishes in a restaurant. He worked on the days when he did not have training or a match.\n\nStack the plates. Virgil worked hard at the restaurant and at training. Doing a job well, even a small one, teaches you to keep going.',
   lesson:'Hard work in any job teaches you something.',
   prompt:'Stack the plates',response:'Hard work counts.',steps:3,source:1},
  {id:'growth',year:'2008 · Aged 17',title:'Too many limits?',
   text:'At Willem II, Virgil was not seen as good enough. One coach said he had too many limitations, and the club did not offer him a contract. Being told you are not good enough is hard, especially when you are young.\n\nFlip the sign. But Virgil was still growing. At seventeen, he grew about 18 centimetres, and he moved from right-back to centre-back, the position in the middle of the defence. His new height and strength helped him win the ball in the air.',
   lesson:'Bodies grow at different times. Don’t let one opinion stop you.',
   prompt:'Flip the sign',response:'Still growing!',source:0},
  {id:'groningen',year:'2010 · Aged 19',title:'A new chance',
   text:'In 2010, when he was nineteen, Virgil left Willem II and joined FC Groningen, another Dutch club. A scout there had seen something special in him. Moving to a new club, in a city far from home, was a fresh start.\n\nOpen the door. On 1 May 2011, Virgil played his first professional match for Groningen. He was finally a professional footballer.',
   lesson:'If one door closes, look for another. Someone may see what others missed.',
   prompt:'Open the door',response:'A new club, a new start.',source:0},
  {id:'hospital',year:'2011',title:'Very ill in hospital',
   text:'Soon after his twentieth birthday, Virgil became very ill. A problem with his appendix turned into a serious infection, and he needed an emergency operation. He spent thirteen days in hospital and lost a lot of weight. It was a frightening time for him and his family.\n\nLift the rain cloud. Getting better took months of rest and patience. By the summer of 2012, Virgil was back with his team. His body had needed time, and he had given it that time.',
   lesson:'Getting better from an illness takes time. Rest, patience and people who care help you heal.',
   prompt:'Lift the rain cloud',response:'Back with his team.',source:0},
  {id:'climb',year:'2013 to 2018',title:'Step by step',
   text:'In 2013, Virgil joined Celtic in Scotland, where he won the league twice. In 2015, he moved to Southampton in England. Each move was one more step up.\n\nClimb the steps. In January 2018, Liverpool signed him. At that time it was the biggest fee ever paid for a defender. The teenager who had washed dishes was now one of the most wanted defenders in the world.',
   lesson:'A slow climb is still a climb. Keep taking the next step.',
   prompt:'Climb the steps',response:'Step by step to Liverpool.',steps:3,source:0},
  {id:'captain',year:'2019 to 2023',title:'Champion and captain',
   text:'In 2019, Virgil won the Champions League with Liverpool, and he was named UEFA’s Men’s Player of the Year. He came second for the Ballon d’Or. In 2020, he hurt his knee badly, and he worked for months to come back. He showed that you can come back after a big injury too.\n\nRaise the trophy. In 2023, Virgil became Liverpool’s captain. The teenager who was not offered a contract had become one of the best defenders in the world.',
   lesson:'A late start is not a slow finish. Keep growing.',
   prompt:'Raise the trophy',response:'Captain of Liverpool!',source:0},
 ]
};
