/** Original child-readable retelling of the hardships in Lionel Messi's life. Facts are attributed; lessons are ours, not quotations. */
export const MESSI_BOOK = {
 title:'Messi', subtitle:'Keep going, together', itemId:'display:plaza:book',
 sources:[
  {label:'Wikipedia · Lionel Messi',url:'https://en.wikipedia.org/wiki/Lionel_Messi'},
  {label:'FIFA · The 2014 final and awards',url:'https://inside.fifa.com/tournaments/mens/worldcup/2014brazil/news/germans-reign-as-brazil-thrills-the-world-2404806'},
  {label:'FIFA · Stepping away in 2016',url:'https://inside.fifa.com/tournaments/mens/worldcup/2018russia/news/messi-calls-time-on-international-career-2803995'},
  {label:'CONMEBOL · The 2021 team',url:'https://copaamerica.com/en/news/copa-america-2021-argentina-champions-after-28-years'},
  {label:'FIFA · Argentina in 2022',url:'https://www.fifa.com/pt/tournaments/mens/worldcup/qatar2022/articles/relato-final-argentina-franca-copa-do-mundo-2022'},
 ],
 pages:[
  {id:'journey',year:'Rosario · Aged 10 and 11',title:'Two hard things at once',
   text:'Lionel Messi grew up in Rosario, Argentina. His grandmother Celia went with him to training and matches. She died shortly before his eleventh birthday, and he was greatly affected. Ever since, when he scores, he looks up and points to the sky for her.\n\nAt ten, doctors found that Messi had a growth hormone deficiency. At eleven he began treatment to help him grow, but his father’s health insurance paid for only two years of it. Lift the cloud to find the star he points to.',
   lesson:'It’s okay to feel sad. Talk to someone you trust, and keep remembering the people you love.',
   prompt:'Lift the cloud',response:'Some people stay in our hearts.',action:'unfold',source:0},
  {id:'touch',year:'2001 · Aged 13',title:'Far from home',
   text:'At thirteen, Messi moved from Rosario to Barcelona, Spain. In his first year he could rarely play matches. He was so quiet that some teammates thought he could not speak. When his mother, brothers and sister moved back to Rosario, he stayed with his father and felt homesick.\n\nIn 2002 he could finally play in every competition, and he quickly made friends, including Cesc Fàbregas and Gerard Piqué. He finished his treatment at fourteen. Wave hello three times, one new friend at a time.',
   lesson:'Being new somewhere is hard. Say hello, ask for help, and give friendships time.',
   prompt:'Wave hello',response:'New friends, one hello at a time.',action:'touch',source:0},
  {id:'setback',year:'2014 · World Cup final',title:'A hard final',
   text:'Years later, Messi was the captain of Argentina. In 2014, his team reached the World Cup final in Brazil, and Germany won 1–0. Messi received the Golden Ball, the award for the tournament’s best player, but Argentina did not lift the trophy. A big prize and a painful loss arrived on the same day.\n\nMany people would feel sad after a day like that. Lift the scoreboard flap to find a message. After a hard loss, it helps to rest, take a breath and talk with someone you trust.',
   lesson:'You are more than one result, and one hard day is not the whole story.',
   prompt:'Lift the paper flap',response:'You are more than one result.',action:'flap',source:1},
  {id:'return',year:'2015 → 2016',title:'Needing a break',
   text:'Then Argentina lost the Copa América final in 2015, and again in 2016. Losing three finals in three years led Messi to announce that he would stop playing for his national team.\n\nA nationwide campaign in Argentina helped convince him to return. In Buenos Aires, a statue of him was even put up to encourage him. Soon he came back. Open the paper bridge to bring him home to his waiting teammates.',
   lesson:'It’s okay to need a break. The people who care about you can help you come back when you are ready.',
   prompt:'Open the bridge',response:'Take your time. Your team is waiting.',action:'bridge',source:0},
  {id:'together',year:'2021 · Copa América',title:'Not alone',
   text:'In 2021, Argentina won the Copa América, the team’s first big trophy in 28 years. Messi did not do it alone. Goalkeeper Emiliano Martínez made three saves in the semifinal shootout against Colombia. In the final, Ángel Di María scored the only goal as Argentina beat Brazil 1–0.\n\nPlay the pass on this page and watch a teammate arrive, ready to help. After years of hard finals, sharing the load with friends made the difference.',
   lesson:'You don’t have to carry everything alone. Let the people around you help.',
   prompt:'Play the pass',response:'Your teammate is there for you!',action:'pass',source:3},
  {id:'champions',year:'2022 · World Cup',title:'Together, at last',
   text:'The 2022 World Cup final was full of twists. Argentina and France finished extra time level at 3–3, with two goals from Messi. Argentina won the penalty shootout 4–2, and Messi and his teammates could finally lift the World Cup together.\n\nRaise the trophy and watch the whole team celebrate. The hard days are still part of this story: losing his grandmother, the treatment, feeling homesick and the lost finals. They were not the end of it.',
   lesson:'A setback isn’t the end of your story. Celebrate the people who helped you keep going.',
   prompt:'Raise the team’s trophy',response:'Keep going, together.',action:'lift',source:4},
 ]
} as const;
export type MessiBookPage=(typeof MESSI_BOOK.pages)[number];
export const BOOK_PROGRESS_KEY='fi2-player-books-v1';
export function boundedBookPage(value:unknown,total:number):number{
 return typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<total?value:0;
}
