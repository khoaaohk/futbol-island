import type {BookData} from '../types';
/** Original child-readable retelling of Mary Earps being left out and coming back (staged Nov 21 2026: not sold until its spreads and narration exist).
 *  Facts come from the cited sources; the coping lessons are ours, not quotations. */
export const EARPS_BOOK:BookData={
 title:'Earps',subtitle:'Left out, then the world’s best',itemId:'display:pier:book:earps',player:'Mary Earps',
 sources:[
  {label:'Wikipedia · Mary Earps',url:'https://en.wikipedia.org/wiki/Mary_Earps'},
  {label:'ESPN · Mary Earps almost quit football',url:'https://global.espn.com/football/story/_/id/37636208/mary-earps-almost-quit-football-now-england-goalkeeper-named-best-world'},
  {label:'Olympics.com · Mary Earps, from outcast to national hero',url:'https://olympics.com/en/news/fifa-womens-world-cup-2023-mary-earps-england-national-hero'},
 ],
 pages:[
  {id:'gloves',year:'Nottingham · Aged 10',title:'Picked for goal',
   text:'Mary Earps was born in 1993 in Nottingham, England. She started playing football when she was ten, for a team called West Bridgford, and her coaches saw that she could be a goalkeeper.\n\nPull on the gloves. Being a goalkeeper can be hard: when you make a mistake, everyone sees it. Mary played for many clubs as she grew up, such as Doncaster Rovers Belles, Bristol and Reading, and in 2018 she moved to Wolfsburg in Germany, where her team won the league and the cup.',
   lesson:'Every club, every team and every coach can teach you something new.',
   prompt:'Pull on the gloves',response:'Ready in goal.',source:0},
  {id:'leftout',year:'2019 to 2021',title:'Left out',
   text:'In 2019, the England manager at the time stopped picking Mary for the national team. She thought it might be the end of her England story. In 2021, she even thought about stopping football altogether.\n\nLift the rain cloud. Mary talked honestly about those hard feelings later, in a BBC film about her team. Being left out can make anyone feel sad, or wonder if they are good enough. Mary kept training anyway, even though she did not know if she would ever be picked again.',
   lesson:'Being left out hurts. It does not mean you are not good enough.',
   prompt:'Lift the rain cloud',response:'Hard feelings, said out loud.',source:1},
  {id:'chance',year:'September 2021',title:'A new coach, a new chance',
   text:'In 2021, England had a new manager, Sarina Wiegman. In her very first match, in September 2021, she picked Mary as the starting goalkeeper. A new coach meant a fresh start for everyone, and a chance for players who had been left out to show what they could do.\n\nOpen the door. Mary was ready for the chance. She kept training and kept improving, and soon she was England’s number one goalkeeper. The goalkeeper who had nearly stopped playing was back in the team, and this time she stayed.',
   lesson:'Keep practising while you wait, so you are ready when the door opens.',
   prompt:'Open the door',response:'Number one!',source:2},
  {id:'euros',year:'2022 · Euro 2022',title:'Every minute',
   text:'In 2022, England hosted the European Championship. Mary played every minute of all six of England’s matches, and she was named in the Team of the Tournament. Every match was full of fans, and the whole country was watching.\n\nRaise the trophy. England won the European Championship. The goalkeeper who had once been left out was now a champion of Europe, with her teammates all around her.',
   lesson:'Your teammates need you to keep going, and you need them too.',
   prompt:'Raise the trophy',response:'Champions of Europe!',source:0},
  {id:'save',year:'2023 · World Cup final',title:'A save in a hard final',
   text:'At the 2023 World Cup, England reached the final against Spain. In the sixty-eighth minute, Mary dived and saved a penalty. England still lost 1–0, but she won the Golden Glove, the prize for the best goalkeeper of the tournament.\n\nDive for the save. That summer, fans could not buy an England goalkeeper shirt with her name on it, because the shirt maker had not made one. Mary spoke up about it, for the fans and for young goalkeepers who wanted one.',
   lesson:'You can be proud of your effort, even on a day your team loses.',
   prompt:'Dive for the save',response:'Saved!',source:0},
  {id:'best',year:'2022 and 2023',title:'The best in the world',
   text:'Mary was named The Best FIFA Women’s Goalkeeper in 2022, and again in 2023. In December 2023, she won BBC Sports Personality of the Year, an award voted for by the public.\n\nLift the photo frame. In May 2025, Mary stopped playing for England, after 53 matches. The goalkeeper who was once left out had become one of the best in the world. She showed that being left out does not decide how your story ends.',
   lesson:'A setback is not the end of your story. Keep going, and you can surprise everyone, even yourself.',
   prompt:'Lift the photo frame',response:'The world’s best keeper.',source:0},
 ]
};
