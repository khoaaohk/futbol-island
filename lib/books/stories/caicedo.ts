import type {BookData} from '../types';
/** Original child-readable retelling of Linda Caicedo's illness and comeback (staged Nov 21 2026: not sold until its spreads and narration exist).
 *  Facts come from the cited sources; the coping lessons are ours, not quotations. The illness is told gently and without treatment detail. */
export const CAICEDO_BOOK:BookData={
 title:'Caicedo',subtitle:'Brave enough to come back',itemId:'display:oldtown:book:caicedo',player:'Linda Caicedo',
 sources:[
  {label:'Wikipedia · Linda Caicedo',url:'https://en.wikipedia.org/wiki/Linda_Caicedo'},
  {label:'NBC Sports · After overcoming ovarian cancer, Linda Caicedo',url:'https://nbcsports.com/on-her-turf/news/after-overcoming-ovarian-cancer-linda-caicedo-colombia-womens-world-cup'},
 ],
 pages:[
  {id:'village',year:'Candelaria · Aged 5',title:'A club that had only boys',
   text:'Linda Caicedo was born in 2005 in Candelaria, a small town in Colombia. Her mother remembers her kicking dolls and kitchen spoons around the house as if they were footballs. When Linda was five, she joined Real Juanchito, a village club that until then had only let boys play.\n\nOpen the gate. Her coaches welcomed her and helped her learn. At ten she joined her first girls’ team, and at eleven she moved to a club in the big city of Cali, where her teams won three national under-13 tournaments.',
   lesson:'If there is no place for you yet, a brave first step can open the gate for others too.',
   prompt:'Open the gate',response:'Room for everyone.',source:0},
  {id:'debut',year:'2019 · Aged 14',title:'A goal in her first match',
   text:'In July 2019, when she was only fourteen, Linda played her first professional match, for América de Cali. She scored the only goal of the game. By the end of that year she was the league’s top scorer, and her goal won the club its first league title.\n\nFlip the scoreboard. It was a brilliant start. But a few months later, Linda would face the hardest challenge of her life, and it would not be on a football pitch.',
   lesson:'Good days are worth celebrating. They give you strength for the hard days too.',
   prompt:'Flip the scoreboard',response:'A goal on day one!',source:0},
  {id:'illness',year:'2020 · Aged 15',title:'The hardest challenge',
   text:'Early in 2020, soon after her fifteenth birthday, Linda began to have pains in her tummy. Doctors found that she had cancer, a serious illness. She had an operation, and then six months of strong medicine. For a while, she had to stay in bed.\n\nLift the rain cloud. Linda said later that it was hard on her feelings too, so she asked for help from the psychologists at her club, people who are trained to help with worries and sadness. In September 2020, the doctors told her the cancer was gone.',
   lesson:'When you are ill or sad, asking for help is brave. Doctors, family and helpers are part of your team.',
   prompt:'Lift the rain cloud',response:'The sun comes back.',source:0},
  {id:'return',year:'2020 · Back to training',title:'One small step at a time',
   text:'Linda went back to training only days after her last treatment. The medicine had made her hair fall out, and she chose to play wearing a wig. In October 2020, she played her first match for her new club, Deportivo Cali.\n\nFill the comeback bar. She grew stronger, step by step. In 2022, the Copa América Femenina, the big tournament for South American national teams, was played in Colombia, and Linda was named its best player.',
   lesson:'Coming back takes small steps. Every one of them counts.',
   prompt:'Fill the comeback bar',response:'Stronger, step by step.',steps:3,source:1},
  {id:'finals',year:'2022 · Two finals',title:'So close, twice',
   text:'In 2022, Linda played in two big finals. Colombia lost the Copa América final 1–0 to Brazil. Then, at the Under-17 World Cup in India, she was Colombia’s captain and wore the number 10, but Colombia lost the final 1–0 to Spain.\n\nTurn the medal. Losing a final hurts. But Linda won the Silver Ball, the prize for the second-best player of that World Cup. In February 2023, two days after her eighteenth birthday, she joined Real Madrid in Spain.',
   lesson:'Losing a final means you got very close. Learn from it, and keep going.',
   prompt:'Turn the medal',response:'Silver, and still shining.',source:0},
  {id:'worldcup',year:'2023 · World Cup',title:'A goal against Germany',
   text:'At the 2023 World Cup in Australia and New Zealand, Linda scored in Colombia’s first match, a 2–0 win over South Korea. Then she played Germany, one of the strongest teams in the world, and scored again. Colombia won 2–1, and her goal was voted the best goal of the whole tournament.\n\nKick the ball. The girl who had come through a serious illness at fifteen was now a World Cup star, playing for her country with her teammates all around her.',
   lesson:'Hard times can make you stronger and kinder. Your story can give other people hope.',
   prompt:'Kick the ball',response:'Goal of the tournament!',source:0},
 ]
};
