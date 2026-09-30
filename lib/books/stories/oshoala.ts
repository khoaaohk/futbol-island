import type {BookData} from '../types';
/** Original child-readable retelling of Asisat Oshoala's road from street games in Nigeria to European champion. Facts come
 * from the cited sources (her own interview with CNN for her childhood); the coaching lessons are ours, not quotations. */
export const OSHOALA_BOOK:BookData={
 title:'Oshoala',subtitle:'Playing when few believed',itemId:'display:sharks:book',player:'Asisat Oshoala',
 sources:[
  {label:'CNN · Asisat Oshoala: How a grandmother’s belief gave birth to an African soccer superstar',url:'https://www.cnn.com/2021/10/05/football/asisat-oshoala-football-barcelona-nigeria-womens-champions-league-cmd-spt-intl/index.html'},
  {label:'Wikipedia · Asisat Oshoala',url:'https://en.wikipedia.org/wiki/Asisat_Oshoala'},
  {label:'FIFA · Get to know Asisat Oshoala',url:'https://www.fifa.com/en/tournaments/womens/womensworldcup/australia-new-zealand2023/articles/get-to-know-asisat-oshoala-achievements-success-nigeria-womens-world-cup-2023'},
 ],
 pages:[
  {id:'street',year:'Nigeria · 2000s',title:'A girl who loved football',
   text:'Asisat Oshoala was born in 1994 in Ikorodu, in Lagos State, Nigeria. She grew up in a big family, with lots of brothers and sisters. Where she grew up, many people thought football was not for girls.\n\nAsisat loved it anyway. Her parents did not want her to play. She sometimes hid where she was going, just to play football. Roll the ball down the street. Growing up, she never wore a shirt with a woman player’s name on the back.',
   lesson:'Everyone deserves a game. Make room for any player who wants to join in.',
   prompt:'Roll the ball down the street',response:'Game on!',source:0},
  {id:'grandma',year:'Nigeria',title:'A grandmother who believed',
   text:'Some days Asisat got into trouble at home for playing football. So who believed in her? Her grandmother.\n\nWhen others doubted her, her grandmother calmly told her to be a good and nice person, to be respectful and to be disciplined. Asisat says she still remembers those words every time she walks onto the pitch. Open the three flaps. Good. Respectful. Disciplined.',
   lesson:'Talent helps, but respect and discipline make you a player every coach wants.',
   prompt:'Open the three flaps',response:'Good. Respectful. Disciplined.',steps:3,source:0},
  {id:'u20',year:'Canada · 2014',title:'The best player in Canada',
   text:'Asisat played for clubs in Nigeria, including FC Robo and Rivers Angels. In 2014 she went to the FIFA Under-20 Women’s World Cup in Canada with Nigeria.\n\nShe scored seven goals, more than anyone else, and she was named the best player of the tournament. Nigeria finished second. Shoot at goal. Months later she won the African championship with Nigeria’s senior team too.',
   lesson:'Strikers score by arriving at the right moment. Time your run so you meet the ball at speed.',
   prompt:'Shoot at goal',response:'Seven goals!',source:1},
  {id:'believers',year:'Nigeria · 2014',title:'Her parents became believers',
   text:'After that amazing year, Asisat had a big talk with her parents. She told them that when young people follow their dreams, something good can come from it.\n\nHer parents listened. Today they believe in her. She says they call her, and they know her game even before she tells them! Pass the phone to her parents. Sometimes the people you love just need time to understand.',
   lesson:'Talk to the people who worry about you. Explain what football means to you, calmly and kindly.',
   prompt:'Pass the phone to her parents',response:'We believe in you!',source:0},
  {id:'europe',year:'England and Spain · 2015 to 2021',title:'A long way from home',
   text:'In 2015 Asisat joined Liverpool, and she became the first African player in England’s Women’s Super League. She hurt her knee and missed two months, but she came back and kept scoring.\n\nIn 2019 she joined Barcelona. In that year’s Champions League final she scored, the first African player to score in a Women’s Champions League final. Slide the ball past the keeper. In 2021 she won the Champions League, the first African woman to do it.',
   lesson:'Injuries happen. Rest, do your rehab, and come back one step at a time.',
   prompt:'Slide the ball past the keeper',response:'Barcelona score!',source:1},
  {id:'foundation',year:'Lagos · 2019',title:'Helping the next girls',
   text:'Asisat has won African Women’s Footballer of the Year six times, more than anyone else. Now, when she goes home to Nigeria, lots of people have a Barcelona shirt with her name on the back.\n\nIn 2019 she started a foundation to help girls in Africa play football, with a tournament for girls in Lagos. Hand out the new shirts. She says that however far you go, you should always remember where you come from.',
   lesson:'When you get better, help others get better too. Great teams lift everyone up.',
   prompt:'Hand out the new shirts',response:'Football for girls!',source:1},
 ]
};
