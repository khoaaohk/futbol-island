import type {BookData} from '../types';
/** Original child-readable retelling of Tim Howard growing up with Tourette syndrome and becoming a goalkeeper (staged Nov 21 2026: not sold until
 *  its spreads and narration exist). Facts come from the cited sources; the coping lessons are ours, not quotations. Sources give different ages
 *  for his diagnosis (9 to 12), so the book says "as a boy". Tourette syndrome is explained plainly and never treated as a joke. */
export const HOWARD_BOOK:BookData={
 title:'Howard',subtitle:'Different, and focused',itemId:'display:cayplaza:book:howard',player:'Tim Howard',
 sources:[
  {label:'Wikipedia · Tim Howard',url:'https://en.wikipedia.org/wiki/Tim_Howard'},
  {label:'Rutgers University · Tim Howard inspires a Tourette syndrome programme',url:'https://www.rutgers.edu/news/world-cup-superstar-tim-howard-inspires-tourette-syndrome-program-making-debut-rutgers'},
  {label:'U.S. Soccer · Tim Howard leaves a remarkable legacy',url:'https://www.ussoccer.com/mnt-travel-roster/2019/10/tim-howard-leaves-a-remarkable-legacy-on-american-soccer'},
 ],
 pages:[
  {id:'tics',year:'New Jersey · Childhood',title:'Tics he could not stop',
   text:'Tim Howard was born in 1979 in North Brunswick, New Jersey, in the United States. After his parents separated, when he was three, he lived with his mother. As a boy, Tim found out that he had Tourette syndrome.\n\nLift the flap. Tourette syndrome makes people have tics: sudden movements or sounds that are very hard to stop. Tim also has OCD, which can fill your head with worries that make you repeat things.',
   lesson:'Some people’s brains and bodies work differently. Different is not wrong.',
   prompt:'Lift the flap',response:'Now we understand.',source:0},
  {id:'hiding',year:'School days',title:'Trying to hide it',
   text:'Like many children with Tourette syndrome, Tim tried to hide his tics. Hiding them all day long made him very tired. Many people did not understand what Tourette syndrome was.\n\nOpen the goal. Tim found that he loved being a goalkeeper. He has written that the way his brain works helps him focus very hard and react quickly in goal. In goal, he could put all his energy into watching the ball.',
   lesson:'You don’t have to hide who you are. Telling people you trust can help.',
   prompt:'Open the goal',response:'A place to shine.',source:1},
  {id:'helping',year:'1998 to 2001',title:'A young professional',
   text:'In 1998, at nineteen, Tim played his first match in Major League Soccer, for the MetroStars. He also began to help children who have Tourette syndrome. He was still very young himself.\n\nRaise the banner. In 2001, he won the league’s Humanitarian of the Year award for that work, and he joined the board of a Tourette syndrome group in New Jersey. He wanted children with Tourette syndrome to know that they could follow their dreams too.',
   lesson:'You can help others while you are still growing yourself.',
   prompt:'Raise the banner',response:'Helping other kids.',source:0},
  {id:'england',year:'2003 to 2016',title:'A big move',
   text:'In 2003, Tim joined Manchester United in England, one of the biggest clubs in the world, and he won the FA Cup in 2004. Moving to another country, with new teammates and lots of attention, was a big step.\n\nOpen the suitcase. In 2006, he moved to Everton, and he played there for ten seasons. People around the world saw that a goalkeeper with Tourette syndrome could play at the very top.',
   lesson:'Be proud of who you are. You can show people what is possible.',
   prompt:'Open the suitcase',response:'All the way to England.',source:0},
  {id:'belgium',year:'2014 · World Cup',title:'Fifteen saves',
   text:'At the 2014 World Cup in Brazil, the United States played Belgium. Belgium attacked again and again, and Tim kept stopping them. It was a knockout match: the losing team would go home.\n\nDive for the save. Tim made fifteen saves, a World Cup record for one match. The United States lost 2–1 after extra time, but people everywhere talked about his brave goalkeeping.',
   lesson:'You can be proud of your effort even when the result goes against you.',
   prompt:'Dive for the save',response:'Save after save!',steps:3,source:0},
  {id:'legacy',year:'2014 to 2019',title:'Helping other kids',
   text:'Tim played 121 times for the United States, more than any other US men’s goalkeeper. In 2014, he wrote a book about his life with Tourette syndrome and OCD, called The Keeper. In the book, he talked openly about the things he had once tried to hide.\n\nTurn over the helper cards. A leadership programme for teenagers with Tourette syndrome, at Rutgers University, carries his name. Tim stopped playing in 2019. He showed that being different can also be a strength.',
   lesson:'Your story can help someone else feel less alone.',
   prompt:'Turn over the helper cards',response:'Nobody is alone.',source:2},
 ]
};
