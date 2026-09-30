import type {BookData} from '../types';
/** Original child-readable retelling of N'Golo Kanté's late road to professional football. Facts come from the cited sources,
 * mainly his own account for Chelsea FC. The often-repeated "rubbish collector" story is left out: it is not confirmed
 * (Africa Check). The coaching lessons are ours, not quotations. */
export const KANTE_BOOK:BookData={
 title:'Kanté',subtitle:'Told no, and still working',itemId:'display:cayplaza:book',player:'N’Golo Kanté',
 sources:[
  {label:'Chelsea FC · “The answer was always the same: no”: Kanté on dealing with rejection',url:'https://www.chelseafc.com/en/news/article/-the-answer-was-always-the-same--no----kante-on-dealing-with-rej'},
  {label:'Wikipedia · N’Golo Kanté',url:'https://en.wikipedia.org/wiki/N%27Golo_Kant%C3%A9'},
 ],
 pages:[
  {id:'suresnes',year:'Paris · 1999',title:'A small club near Paris',
   text:'N’Golo Kanté was born in Paris in 1991. His parents had moved to France from Mali. When he was eight, he started playing for JS Suresnes, a small club near Paris.\n\nWhen N’Golo was eleven, his father died. It was a very sad time, and his family had to be strong together. Pull on the club shirt. N’Golo kept going to training, and he stayed at Suresnes for about ten years.',
   lesson:'Your club can be a second family. Turn up, work hard and look after your teammates.',
   prompt:'Pull on the club shirt',response:'Ready for training.',source:1},
  {id:'trials',year:'France · ages 12 to 16',title:'The answer was always no',
   text:'At twelve, fourteen and sixteen, N’Golo went to trials at the academies of professional clubs. The answer was always the same: no. They said they already had players like him, or better.\n\nHis coach at Suresnes said big clubs did not notice him because he was small and never showed off. Turn over the three cards. N’Golo was honest with himself. He told himself to keep working, because maybe next time would be the right time.',
   lesson:'When you hear no, ask what you can improve, then keep working on it.',
   prompt:'Turn over the three cards',response:'No, no, no… keep working!',steps:3,source:0},
  {id:'boulogne',year:'Boulogne · 2010 to 2012',title:'Six divisions from the top',
   text:'At nineteen, N’Golo finally got his chance at Boulogne. He played in the second team, six divisions below the top of French football. At the same time he studied accountancy, in case football did not work out.\n\nSlide him up the ladder. At twenty-one he began training with the first team, and he watched how the professionals worked. In May 2012 he played his first professional game: the last eleven minutes of the last game of the season.',
   lesson:'Take it one step at a time. Learn from better players by watching how they train.',
   prompt:'Slide him up the ladder',response:'One step at a time.',source:0},
  {id:'caen',year:'Caen · 2013 to 2015',title:'Winning the ball back',
   text:'In 2013 N’Golo joined Caen. He played all 38 league games in his first season, and the team won promotion to the top division.\n\nThe next season, he won the ball back more times than any other player in Europe. He read the game early and stepped in to steal the pass. Win the ball back. Small, quick and clever, he was always in the right place.',
   lesson:'To win the ball, watch the passer’s eyes and hips, get on your toes, and step in early.',
   prompt:'Win the ball back',response:'Interception!',source:1},
  {id:'leicester',year:'England · 2016 and 2017',title:'Champions, and champions again',
   text:'In 2015 N’Golo moved to Leicester City in England. Few people expected Leicester to win anything, but in 2016 they became Premier League champions! N’Golo made more tackles and interceptions than anyone in the league.\n\nThen he joined Chelsea, and in 2017 he won the league again. Lift the title flag. That year the players voted him the best player in England.',
   lesson:'Hard work helps the whole team. When you win the ball, give it quickly to a teammate.',
   prompt:'Lift the title flag',response:'Champions!',source:1},
  {id:'worldcup',year:'Russia · 2018',title:'World champion',
   text:'In 2018 N’Golo played for France at the World Cup. He played in all seven matches, and in the final France beat Croatia 4–2.\n\nRaise the trophy. The small boy that academies turned down was now a world champion. N’Golo says success in football is something you share, and that doing your best for your team is the best thing in football.',
   lesson:'Play for your team, not for yourself. Winning together is the best feeling in football.',
   prompt:'Raise the trophy',response:'World champions!',source:0},
 ]
};
