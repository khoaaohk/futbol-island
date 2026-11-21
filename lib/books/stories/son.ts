import type {BookData} from '../types';
/** Original child-readable retelling of Son Heung-min's years of basics, leaving home young and his long wait for a trophy (staged Nov 21 2026:
 *  not sold until its spreads and narration exist). Facts come from the cited sources; the coping lessons are ours, not quotations. Sources give
 *  different ages (14 to 16) for when his father first let him play league matches, so the book says "until he was a teenager". */
export const SON_BOOK:BookData={
 title:'Son',subtitle:'Practise the basics, then fly',itemId:'display:rooftop:book:son',player:'Son Heung-min',
 sources:[
  {label:'Wikipedia · Son Heung-min',url:'https://en.wikipedia.org/wiki/Son_Heung-min'},
  {label:'The Korea Times · The soccer dad behind Son Heung-min',url:'https://www.koreatimes.co.kr/sports/20180912/soccer-dad-behind-son-heung-mins-rise-to-stardom'},
 ],
 pages:[
  {id:'basics',year:'Chuncheon · Childhood',title:'Years of basics',
   text:'Son Heung-min was born in 1992 in Chuncheon, in South Korea. His father, Son Woong-jung, had been a footballer, and he coached Heung-min himself. For years, they practised only the basics: ball control, dribbling and passing.\n\nTap the ball three times. His father did not let him play in a proper league until he was a teenager. Practising the same skills again and again can feel boring, but it made Heung-min’s touch very good.',
   lesson:'The basics can feel boring, but they build everything else.',
   prompt:'Tap the ball three times',response:'Touch, touch, touch.',steps:3,source:1},
  {id:'hamburg',year:'2008 · Aged 16',title:'Far from home',
   text:'In 2008, when he was sixteen, Heung-min went to Germany to join the youth academy of Hamburger SV, through a project for young Korean players. He had to live far from home, in a country with a new language. Being so far from family is hard for anyone.\n\nOpen the suitcase. Heung-min learned German, and he later learned English too. His agent said he picked up German partly by watching cartoons.',
   lesson:'Living somewhere new is hard at first. Learning a little every day helps you belong.',
   prompt:'Open the suitcase',response:'Hallo, Hamburg!',source:0},
  {id:'firstgoal',year:'2010 to 2013',title:'First goal in Germany',
   text:'In 2010, Heung-min played his first match in the Bundesliga, the top league in Germany. On 30 October 2010, he scored his first league goal, against FC Köln. He was only eighteen, and he was playing against grown men in one of the best leagues in the world.\n\nClimb the steps. In 2013, he moved to another German club, Bayer Leverkusen. Step by step, the boy who had practised the basics was becoming a star.',
   lesson:'Each step forward is worth celebrating, even the small ones.',
   prompt:'Climb the steps',response:'Step by step.',steps:3,source:0},
  {id:'london',year:'2015 to 2020',title:'A goal from end to end',
   text:'In 2015, Heung-min joined Tottenham Hotspur in London. In 2018, he won a gold medal with South Korea at the Asian Games, setting up both goals in the final. Playing in England meant another new country and another new language.\n\nRoll the ball down the pitch. In December 2019, against Burnley, he dribbled with the ball nearly the whole length of the pitch and scored. That goal won the Puskás Award, FIFA’s prize for the best goal of the year.',
   lesson:'All those years of dribbling practice can come together in one moment.',
   prompt:'Roll the ball down the pitch',response:'What a goal!',steps:3,source:0},
  {id:'boot',year:'2021–22',title:'Top scorer',
   text:'In the 2021–22 season, Heung-min scored 23 Premier League goals. He shared the Golden Boot, the prize for the league’s top scorer, with Mohamed Salah. Many of his goals came from the clean, quick shooting he had practised since he was a boy.\n\nFlip the scoreboard. He was the first Asian player ever to win it. In 2023, he became Tottenham’s captain. He had shown that a player from anywhere can reach the top.',
   lesson:'Keep working on your skills, and you can make history.',
   prompt:'Flip the scoreboard',response:'Golden Boot!',source:0},
  {id:'trophy',year:'2025',title:'A trophy at last',
   text:'For years, Heung-min had played brilliantly without winning a big trophy with his club. On 21 May 2025, Tottenham played Manchester United in the Europa League final. Heung-min came on as a substitute, and Tottenham won 1–0.\n\nRaise the trophy. It was his first major trophy. In August 2025, he moved to Los Angeles FC, in the United States. All those years of basics, practice and patience had led to this moment.',
   lesson:'Waiting a long time for success can be hard. Keep working, and enjoy it when it comes.',
   prompt:'Raise the trophy',response:'Champions at last!',source:0},
 ]
};
