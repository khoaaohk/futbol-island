import type {BookData} from '../types';
/** Original child-readable retelling of Nadia Nadim's journey from Afghanistan to Denmark. Facts come from the cited sources;
 * the war is told gently (no details of her father's death), and the coaching lessons are ours, not quotations. */
export const NADIM_BOOK:BookData={
 title:'Nadim',subtitle:'A long road to a new home',itemId:'display:causeway:book',player:'Nadia Nadim',
 sources:[
  {label:'Wikipedia · Nadia Nadim',url:'https://en.wikipedia.org/wiki/Nadia_Nadim'},
  {label:'UNRIC · Nadia Nadim: “All women should have the same access and opportunities”',url:'https://unric.org/en/nadia-nadim-all-women-should-have-the-same-access-and-opportunities/'},
  {label:'Arab News · The remarkable story of Danish-Afghan striker Nadia Nadim',url:'https://www.arabnews.com/node/1314476/amp'},
  {label:'Olympics.com · Denmark striker Nadia Nadim, footballer and doctor',url:'https://www.olympics.com/en/news/euro-2022-women-denmark-nadia-nadim-doctor'},
 ],
 pages:[
  {id:'herat',year:'Afghanistan · 1988 to 2000',title:'A girl from Herat',
   text:'Nadia Nadim was born in 1988 in Herat, a city in Afghanistan. When she was a young girl, her country was at war. Her father was an army general, and he was killed in the war.\n\nHer mother, Hamida, decided the family had to leave to stay safe. Nadia, her mother and her four sisters could only take what they could carry. Pack the suitcase. A very long journey was about to begin.',
   lesson:'When things are scary, stay close to the people who look after you. On the pitch, stay close to your team too.',
   prompt:'Pack the suitcase',response:'Time to go.',source:0},
  {id:'journey',year:'Pakistan to Denmark · 2000',title:'The long journey',
   text:'First the family travelled to Pakistan. From there they flew to Italy. Then they hid in the back of a truck for a long, dark ride north. They hoped to reach the United Kingdom, where they had family.\n\nBut the truck took them to Denmark instead! Drive the truck along the road. Nadia was about eleven, in a country where she did not know the language. Denmark took the family in as refugees.',
   lesson:'Plans change. Good players adapt to the game in front of them, not the game they expected.',
   prompt:'Drive the truck along the road',response:'Welcome to Denmark!',source:2},
  {id:'nextdoor',year:'Aalborg · 2000',title:'The pitch next door',
   text:'The family was moved to a refugee centre near the city of Aalborg. Right next to it was a football club, and there Nadia saw girls playing football on the fields.\n\nShe wanted to play too. She started kicking a ball every day, and she got training at the centre. Tap the ball three times. At twelve she joined a small local club in Aalborg. Her football story in Denmark had begun.',
   lesson:'Watch good players closely, then practise what you saw. Every touch you practise makes the next one easier.',
   prompt:'Tap the ball three times',response:'Every touch counts!',steps:3,source:1},
  {id:'wait',year:'Denmark · 2008 to 2009',title:'Waiting to play for Denmark',
   text:'Nadia became a Danish citizen in 2008. But a FIFA rule said she still had to wait before she could play for the national team. The Danish football association asked FIFA to look at her case again.\n\nFIFA made an exception, and in 2009 she played her first game for Denmark, at the Algarve Cup. Stamp the team sheet. She was the first naturalised Dane to play for a Denmark senior national team. Later, she played more than one hundred games for her new country.',
   lesson:'Waiting is hard. Keep training while you wait, so you are ready when your chance comes.',
   prompt:'Stamp the team sheet',response:'Picked for Denmark!',source:0},
  {id:'final',year:'Netherlands · 2017',title:'The penalty in the final',
   text:'At the European Championship in 2017, Nadia helped Denmark on a brilliant run. In the quarter-final she scored the equaliser against Germany, the favourites, and Denmark won 2–1.\n\nIn the final against the Netherlands, Denmark were given a penalty. Nadia stepped up and scored it. Kick the penalty. Denmark lost the final 4–2, but the team had reached the final together, and Nadia had been brave from the spot.',
   lesson:'Before a penalty, pick your spot early, take one slow breath, and don’t change your mind.',
   prompt:'Kick the penalty',response:'Goal for Denmark!',source:0},
  {id:'doctor',year:'Aarhus · 2022',title:'Doctor Nadia',
   text:'While she was still a professional footballer, Nadia studied medicine at Aarhus University. She kept studying during the football season, even when she was playing far from Denmark.\n\nIn January 2022 she qualified as a doctor. Open the doctor’s bag. She speaks many languages, and in 2019 UNESCO named her a champion for girls’ and women’s education. She says that all women should have the same chances.',
   lesson:'You can be more than one thing. Work hard at school and at football: both make you stronger.',
   prompt:'Open the doctor’s bag',response:'Doctor Nadia!',source:3},
 ]
};
