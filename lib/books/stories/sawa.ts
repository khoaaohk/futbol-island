import type {BookData} from '../types';
/** Original child-readable retelling of Homare Sawa's path and Japan's 2011 World Cup after the earthquake and tsunami (staged Nov 21 2026: not sold
 *  until its spreads and narration exist). Facts come from the cited sources; the coping lessons are ours, not quotations. */
export const SAWA_BOOK:BookData={
 title:'Sawa',subtitle:'Hope after the wave',itemId:'display:oldtown:book:sawa',player:'Homare Sawa',
 sources:[
  {label:'Wikipedia · Homare Sawa',url:'https://en.wikipedia.org/wiki/Homare_Sawa'},
  {label:'FIFA · Japan’s Women’s World Cup triumph, ten years on',url:'https://inside.fifa.com/womens-football/news/japans-womens-world-cup-triumph-ten-years-on'},
  {label:'Sports Illustrated · Japan’s Women’s World Cup team',url:'https://www.si.com/sportsperson/2011/11/30/dollinger-japansoccerteam'},
 ],
 pages:[
  {id:'brother',year:'Tokyo · Aged 6',title:'Joining the boys',
   text:'Homare Sawa was born in 1978 in Fuchū, a city in Tokyo, Japan. When she was six, she went to watch her older brother train. His coach saw her and invited her to join the boys’ team.\n\nKick the ball. Homare said yes. Playing with the boys, she learned to be quick, brave and clever with the ball. She kept playing football with boys and with older players as she grew up, and it made her a tough and clever player.',
   lesson:'Playing with people bigger than you can make you braver and smarter.',
   prompt:'Kick the ball',response:'In the team!',source:0},
  {id:'young',year:'1991 to 1993',title:'Young and ready',
   text:'When Homare was only twelve, she played her first match in Japan’s top women’s league, for a club called Yomiuri Beleza. In December 1993, at fifteen, she played for Japan for the first time, and she scored four goals against the Philippines. She was much younger than most of the players around her.\n\nClimb the steps. Homare kept learning from older players, one step at a time. She listened, watched and practised, and she became a key player for her club and her country.',
   lesson:'Being young is not a reason to wait. Learn from the people around you.',
   prompt:'Climb the steps',response:'Four goals at fifteen!',steps:3,source:0},
  {id:'america',year:'1999 to 2003',title:'Starting again far away',
   text:'In 1999, her club in Japan ended her contract. Homare decided to go and play in the United States, a long way from home, where people spoke a different language.\n\nOpen the suitcase. From 2001 to 2003, she played for the Atlanta Beat in a new professional league in America. Starting again in a new country is not easy, but she kept improving. She had new teammates and a new way of playing to get used to, and she became an even better player.',
   lesson:'When a door closes, you can be brave and try somewhere new.',
   prompt:'Open the suitcase',response:'A new start, far away.',source:0},
  {id:'wave',year:'March 2011',title:'A country in sadness',
   text:'In March 2011, a huge earthquake and tsunami hit Japan. Many people lost their homes, and many families were very sad. A few months later, the World Cup began in Germany, and Homare was Japan’s captain.\n\nRaise the banner. The team dedicated the tournament to the people hit by the disaster. Homare hoped that, if they never gave up on the pitch, the team could give people at home some courage.',
   lesson:'In hard times, doing your best can lift other people too.',
   prompt:'Raise the banner',response:'For everyone at home.',source:2},
  {id:'final',year:'July 2011 · The final',title:'Never giving up',
   text:'In the final, Japan played the United States. In extra time, the United States scored to lead 2–1. Then, in the 117th minute, with only a few minutes left, Homare scored. It was 2–2!\n\nTake the next penalty. Japan won the penalty shootout 3–1. They were the first Asian team ever to win the Women’s World Cup, and back at home, their win brought joy to a sad country.',
   lesson:'Keep going until the very end. The game is not over until it is over.',
   prompt:'Take the next penalty',response:'World champions!',source:1},
  {id:'awards',year:'2011 to 2015',title:'Six World Cups',
   text:'Homare won the Golden Ball for the best player of the 2011 World Cup, and the Golden Boot for the most goals: five. Then FIFA named her the Women’s World Player of the Year. She was the first Asian player, man or woman, to win such a big award.\n\nLift the photo frame. Homare played in six World Cups, from 1995 to 2015, and she stopped playing at the end of 2015. In her very last tournament, she won one more cup with her club. She had played for Japan for twenty-two years.',
   lesson:'Keep going for a long time, and you can do things nobody has done before.',
   prompt:'Lift the photo frame',response:'The world’s best player.',source:0},
 ]
};
