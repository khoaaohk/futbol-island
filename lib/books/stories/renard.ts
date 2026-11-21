import type {BookData} from '../types';
/** Original child-readable retelling of Wendie Renard's path from Martinique to Lyon (staged Nov 21 2026: not sold until its spreads and narration
 *  exist). Facts come from the cited sources; the coping lessons are ours, not quotations. Her age at the Clairefontaine trial differs between
 *  sources (14 or 15), so the book says "as a young teenager". The 2023 World Cup decision is told without blaming anyone. */
export const RENARD_BOOK:BookData={
 title:'Renard',subtitle:'Not chosen, then a captain',itemId:'display:clubgrounds:book:renard',player:'Wendie Renard',
 sources:[
  {label:'Wikipedia · Wendie Renard',url:'https://en.wikipedia.org/wiki/Wendie_Renard'},
  {label:'UEFA · A salute to Wendie Renard',url:'https://www.uefa.com/news-media/news/0274-14d613c11aa0-b8709e7d1af9-1000--a-salute-to-wendie-renard/'},
  {label:'ESPN · Wendie Renard’s journey, in her own words',url:'https://global.espn.com/football/story/_/id/37573203/france-defender-wendie-renard-improbable-journey-world-cup-own-words'},
 ],
 pages:[
  {id:'island',year:'1990 · Martinique',title:'An island girl',
   text:'Wendie Renard was born in 1990 in Schœlcher, on Martinique, a French island in the Caribbean Sea. She started playing football when she was seven, for a local club called L’Essor Préchotin. Martinique is a warm, green island with mountains and beaches.\n\nKick the ball. Martinique is a long way from mainland France, where the biggest clubs and the national training centre are. For a girl from Martinique, reaching the big clubs meant a very long journey across the ocean.',
   lesson:'Big dreams can start on a small island.',
   prompt:'Kick the ball',response:'Playing on the island.',source:0},
  {id:'father',year:'Aged 8',title:'Losing her father',
   text:'When Wendie was eight, her father died of an illness. It was a very sad time for her family. Losing a parent when you are young is one of the hardest things that can happen.\n\nLift the photo frame. The people around her, especially the women in her family, encouraged her to keep playing football. Football became something that helped her keep going, with her family cheering her on.',
   lesson:'When someone you love is gone, the people around you can help you carry on.',
   prompt:'Lift the photo frame',response:'Her family kept her going.',source:2},
  {id:'notchosen',year:'A young teenager',title:'Not chosen',
   text:'As a young teenager, Wendie flew to mainland France for a trial at Clairefontaine, the national football training centre. She was not chosen for the programme. She had travelled thousands of kilometres across the ocean for that chance.\n\nLift the rain cloud. Being told no, so far from home, could have been the end of her dream. But Wendie did not give up. She went home, kept training and waited for her next chance.',
   lesson:'Not being chosen hurts. It is a moment, not the end of your story.',
   prompt:'Lift the rain cloud',response:'Not the end.',source:0},
  {id:'lyon',year:'2006 · Aged 16',title:'A long way from home',
   text:'Wendie had another trial, this time at the club Lyon, and it went much better. At sixteen, she left Martinique and went to live in Lyon, thousands of kilometres from her island. She was a long way from her mother and her family.\n\nOpen the suitcase. Living far from your family when you are young can be lonely. Wendie worked hard, and she grew into a very tall defender, 1.87 metres.',
   lesson:'Leaving home is brave. You can take your family’s love with you.',
   prompt:'Open the suitcase',response:'A new home in Lyon.',source:0},
  {id:'europe',year:'2011 to 2022',title:'Eight times champions of Europe',
   text:'With Lyon, Wendie won the Champions League, the biggest club competition in Europe, eight times. In 2013, she became captain of France. She was tall, strong in the air and calm with the ball, and she was a leader in the team.\n\nRaise the trophy. The girl who was not chosen at Clairefontaine had become one of the best defenders in the world. She showed that a no at the start does not have to be the end.',
   lesson:'Keep working after a no. Your hard work can take you further than anyone expected.',
   prompt:'Raise the trophy',response:'Champions of Europe!',source:1},
  {id:'mind',year:'2023',title:'Looking after her mind',
   text:'In February 2023, Wendie said she would not play at that year’s World Cup, so she could protect her mental health: the health of her thoughts and feelings. It was a hard and brave decision, because the World Cup is the biggest tournament of all.\n\nSwitch the lamp on. A few weeks later, France had a new coach, who invited her back. Wendie said yes, and at the World Cup she scored the winning goal against Brazil. Taking care of herself first had helped her come back stronger.',
   lesson:'Looking after your mind is as important as looking after your body.',
   prompt:'Switch the lamp on',response:'Back, and scoring.',source:0},
 ]
};
