import type {BookData} from '../types';
/** Original child-readable retelling of Gareth Bale's long winless run and how it turned (staged Nov 21 2026: not sold until its spreads and narration
 *  exist). Facts come from the cited sources; the coping lessons are ours, not quotations. Sources give 24 or 25 games; the book uses 24 (most sources). */
export const BALE_BOOK:BookData={
 title:'Bale',subtitle:'The unlucky run',itemId:'display:market:book:bale',player:'Gareth Bale',
 sources:[
  {label:'Wikipedia · Gareth Bale',url:'https://en.wikipedia.org/wiki/Gareth_Bale'},
  {label:'ESPN · Bale’s Premier League winless record broken',url:'https://global.espn.com/football/story/_/id/37610073/bale-premier-league-winless-record-broken-sheff-united-burke'},
  {label:'Planet Football · Remembering Gareth Bale’s Tottenham jinx',url:'https://www.planetfootball.com/nostalgia/remembering-gareth-bales-tottenham-jinx'},
 ],
 pages:[
  {id:'cardiff',year:'Cardiff · Aged 9',title:'Spotted at six-a-side',
   text:'Gareth Bale was born in 1989 in Cardiff, in Wales. When he was nine, scouts from Southampton saw him playing six-a-side football for his first club, Cardiff Civil Service. He was quick and loved to run with the ball.\n\nKick the ball. Southampton invited him to train with them. It was the start of a long journey. He was still a schoolboy, and he trained with Southampton while he grew up.',
   lesson:'Enjoy playing. Fun games are where great players begin.',
   prompt:'Kick the ball',response:'Spotted!',source:0},
  {id:'rules',year:'School days',title:'Special rules',
   text:'Gareth was so good at school football that his PE teacher, Gwyn Morris, gave him special rules. He was only allowed one touch of the ball, and he was not allowed to use his left foot, his best foot. That made the games fairer for the other children.\n\nTap the ball three times. The rules made the game fair for everyone, and they made Gareth practise his other skills.',
   lesson:'Making things harder for yourself is a great way to get better.',
   prompt:'Tap the ball three times',response:'One touch, right foot!',steps:3,source:0},
  {id:'young',year:'2006 · Aged 16',title:'The youngest for Wales',
   text:'In April 2006, when he was sixteen, Gareth played his first match for Southampton. A few weeks later, he became the youngest player ever to play for Wales, at sixteen years and 315 days. He played at left-back, running up and down the wing.\n\nFlip the shirt. In 2007, he moved to Tottenham Hotspur in London. London was a big new city, and Tottenham was a big new club.',
   lesson:'Young players can do big things when they are ready and given a chance.',
   prompt:'Flip the shirt',response:'Youngest for Wales!',source:0},
  {id:'jinx',year:'2007 to 2009',title:'The unlucky run',
   text:'At Tottenham, something strange happened. Gareth played in 24 Premier League games, and his team did not win any of them. For two years, the run went on, and some people even called him unlucky. It was not his fault, but people still talked about it.\n\nLift the rain cloud. It is hard when people say you are unlucky. Gareth kept training and kept playing his best.',
   lesson:'A bad run is just a run. It does not say who you are.',
   prompt:'Lift the rain cloud',response:'Keep going.',source:2},
  {id:'burnley',year:'September 2009',title:'The run is over',
   text:'In September 2009, Gareth came on as a substitute near the end of a game against Burnley. Tottenham won 5–0. At last, the run was over! His teammates were happy for him.\n\nFlip the scoreboard. Then his manager moved him from left-back to the wing, and Gareth became one of the most exciting players in the world. In 2011 and 2013, the other players voted him their Player of the Year.',
   lesson:'Sometimes a small change, like a new position, can help you shine.',
   prompt:'Flip the scoreboard',response:'The run is over!',source:1},
  {id:'wales',year:'2013 to 2023',title:'A hero for Wales',
   text:'In 2013, Real Madrid signed Gareth for a world-record fee, and he won the Champions League five times. In 2016, he led Wales to the semi-finals of the European Championship. He scored many important goals in big finals.\n\nRaise the banner. In 2022, he helped Wales reach the World Cup for the first time since 1958. Gareth stopped playing in January 2023.',
   lesson:'Unlucky moments pass. Keep working, and your luck can turn.',
   prompt:'Raise the banner',response:'For Wales!',source:0},
 ]
};
