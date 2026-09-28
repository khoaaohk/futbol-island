import type {BookData} from '../types';
/** Original child-readable retelling of the hardships in Sadio Mané's path. Facts come from the cited source; the coping lessons are ours, not quotations. */
export const MANE_BOOK:BookData={
 title:'Mané',subtitle:'Leaving the village',itemId:'display:market:book:mane',player:'Sadio Mané',
 sources:[
  {label:'Wikipedia · Sadio Mané',url:'https://en.wikipedia.org/wiki/Sadio_Man%C3%A9'},
 ],
 pages:[
  {id:'bambali',year:'Bambali · Senegal',title:'A dream in Bambali',
   text:'Sadio Mané was born in 1992 in Bambali, a village in Senegal. His parents came from Guinea, and he grew up in a religious family. More than anything, Sadio wished to play football.\n\nBut his father, an imam, did not allow him to play. He wanted Sadio to put his religious studies first. Then, when Sadio was seven years old, his father died. Lift the photo frame to remember him.',
   lesson:'When someone you love dies, it’s okay to feel sad. Keep their memory close, and talk to people you trust.',
   prompt:'Lift the photo frame',response:'His father is remembered.',source:0},
  {id:'secret',year:'Aged 15',title:'Leaving the village',
   text:'Sadio kept dreaming about football. When he was fifteen, he made a very big choice. With the help of a childhood friend, Luc Djiboune, he left his home village secretly and went to Dakar, the capital city of Senegal.\n\nOpen the door to Dakar. It was a long way from home, and many people would find a move like that scary. From that time on, his family supported him in following his dream.',
   lesson:'Big dreams need courage, and a good friend helps. Always share your plans with a grown-up you trust.',
   prompt:'Open the door',response:'On the road to Dakar.',source:0},
  {id:'dakar',year:'M’Bour · 2009',title:'Someone noticed',
   text:'Sadio kept playing. In 2009, when he was playing in the town of M’Bour, scouts spotted him. They sent him to a club called Génération Foot.\n\nLift the three flaps to see who helped. His friend Luc helped him set off, his family stood behind him, and the club gave him a place to grow. In the 2010–11 season, Sadio helped Génération Foot win promotion to the second division.',
   lesson:'Nobody gets there alone. Remember to thank the people who help you.',
   prompt:'Lift the three flaps',response:'Friend, family, club: his team.',steps:3,source:0},
  {id:'metz',year:'France · 2011 to 2012',title:'A new country',
   text:'In 2011, Sadio moved to France to join the club Metz. He was nineteen and a long way from home. He played 19 league games that season and scored one goal, but Metz were relegated, which means they dropped down to a lower league.\n\nUnfold the bridge to Austria. In 2012 he moved to a club in Salzburg, and there he won the league and the cup. In 2014 he went to England, to play for Southampton.',
   lesson:'Being new somewhere is hard, and a bad season isn’t the end. Keep going.',
   prompt:'Unfold the bridge',response:'On to Salzburg.',source:0},
  {id:'penalty',year:'Africa Cup of Nations · 2017 and 2019',title:'Missed penalties',
   text:'Sadio plays for his country, Senegal. At the 2017 Africa Cup of Nations, the quarter-final against Cameroon went to a penalty shoot-out. Sadio missed his penalty, and Senegal were knocked out.\n\nAt the 2019 tournament, he missed two penalties in earlier games. Senegal reached the final, but lost 1–0 to Algeria. Lift the rain cloud. Even so, Sadio was named in the Team of the Tournament, and he kept stepping up for his country.',
   lesson:'A miss is not the end of the story. You are more than one result.',
   prompt:'Lift the rain cloud',response:'He kept stepping up.',source:0},
  {id:'final',year:'Africa Cup of Nations · 2021',title:'Brave enough to try again',
   text:'At the 2021 Africa Cup of Nations, Senegal played Egypt in the final. In the seventh minute, Sadio took a penalty, and the goalkeeper saved it. The final went to a penalty shoot-out, and Sadio stepped up again. He scored the winning kick, and Senegal won the cup for the first time!\n\nRaise the trophy. Sadio has also given money to build a school and a hospital in his home village, Bambali.',
   lesson:'Be brave enough to try again, and remember the place you came from.',
   prompt:'Raise the trophy',response:'Champions of Africa!',source:0},
 ]
};
