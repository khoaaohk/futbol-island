import type {BookData} from '../types';
/** Original child-readable retelling of Mia Hamm's path and the foundation she started for her brother (staged Nov 21 2026: not sold until its
 *  spreads and narration exist). Facts come from the cited sources; the coping lessons are ours, not quotations. Garrett's illness and death are
 *  told gently, without treatment detail. */
export const HAMM_BOOK:BookData={
 title:'Hamm',subtitle:'A team for Garrett',itemId:'display:northbeach:book:hamm',player:'Mia Hamm',
 sources:[
  {label:'Wikipedia · Mia Hamm',url:'https://en.wikipedia.org/wiki/Mia_Hamm'},
  {label:'TODAY · Mia Hamm on her brother’s aplastic anemia',url:'https://www.today.com/health/disease/mia-hamm-brother-aplastic-anemia-diagnosis-rcna102517'},
  {label:'Wikipedia · Mia Hamm Foundation',url:'https://en.wikipedia.org/wiki/Mia_Hamm_Foundation'},
 ],
 pages:[
  {id:'shoes',year:'1972 · Selma, Alabama',title:'Special shoes',
   text:'Mia Hamm was born in 1972 in Selma, Alabama, in the United States. She was born with a club foot, a foot that turns inwards, and when she was very small she wore special shoes to help it grow straight.\n\nOpen the shoebox. Her father was in the US Air Force, so the family moved from base to base, all around the world. Mia played soccer for the first time in Florence, in Italy. Moving so often meant saying goodbye to friends, again and again. A ball helped her make new ones.',
   lesson:'Where you start does not decide where you can go.',
   prompt:'Open the shoebox',response:'Ready to run.',source:0},
  {id:'youngest',year:'1987 to 1991',title:'The youngest on the team',
   text:'In 1987, when she was only fifteen, Mia first played for the United States national team. Being the youngest can feel scary, because everyone else is bigger and more experienced.\n\nClimb the steps. At the University of North Carolina, her team won four national championships in five years. In 1991, at nineteen, Mia was the youngest player in the US team that won the very first Women’s World Cup. She kept working on her speed, her dribbling and her shooting.',
   lesson:'Being the youngest is hard. Listen, learn and keep working.',
   prompt:'Climb the steps',response:'World champions!',steps:3,source:0},
  {id:'garrett',year:'Her brother Garrett',title:'A hard illness',
   text:'Mia was the fourth of six children. Her older brother Garrett had joined the family through adoption. As a young man, Garrett became ill with aplastic anaemia, a rare illness that stops the body making enough new blood. Doctors needed to find a donor, someone whose healthy cells could help him.\n\nLift the flap. It was hard to find a match, but in the end one was found, and Garrett had a transplant. Sadly, in 1997, Garrett died after the treatment. He was twenty-eight. Mia and her family missed him very much.',
   lesson:'When someone you love is very ill, it is okay to feel sad and to lean on your family and friends.',
   prompt:'Lift the flap',response:'A family together.',source:1},
  {id:'foundation',year:'1998 to 1999',title:'Turning sadness into help',
   text:'In 1998, Mia held the first Garrett Game, a match to raise money in her brother’s honour. In 1999, she started the Mia Hamm Foundation.\n\nRaise the banner. The foundation helps people who need a bone marrow or cord blood transplant, and it asks more people to join the list of donors. It also makes more chances for girls and women to play sport. Mia’s sad loss became a way to help many other families.',
   lesson:'When something sad happens, helping other people can be a way to remember someone you love.',
   prompt:'Raise the banner',response:'Help for other families.',source:2},
  {id:'record',year:'1999',title:'Goal number 108',
   text:'In May 1999, Mia scored her 108th goal for the United States. No player in the world, man or woman, had ever scored more goals in international football. That summer, the United States won the Women’s World Cup again, at home.\n\nFlip the scoreboard. Mia kept scoring. By 2004 she had 158 goals for her country, a record that lasted until 2013.',
   lesson:'Big records are made one goal, one practice and one day at a time.',
   prompt:'Flip the scoreboard',response:'Goal number 108!',source:0},
  {id:'gold',year:'1995 to 2004',title:'Win or lose, together',
   text:'Not every tournament ended with a win. Mia’s team finished third at the World Cups of 1995 and 2003, and won silver at the Olympics in 2000. Each time, they came back and tried again.\n\nRaise the trophy. Mia won Olympic gold medals in 1996 and 2004. Through her foundation, the work she started for Garrett still helps families today.',
   lesson:'Big dreams are reached together, and kindness lasts longer than any trophy.',
   prompt:'Raise the trophy',response:'Golden, together.',source:0},
 ]
};
