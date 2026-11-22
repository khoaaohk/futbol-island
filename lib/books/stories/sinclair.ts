import type {BookData} from '../types';
/** Original child-readable retelling of Christine Sinclair's Olympic heartbreak and comeback (staged Nov 21 2026: not sold until its spreads and
 *  narration exist). Facts come from the cited sources; the coping lessons are ours, not quotations. */
export const SINCLAIR_BOOK:BookData={
 title:'Sinclair',subtitle:'Heartbreak, then gold',itemId:'display:causeway:book:sinclair',player:'Christine Sinclair',
 sources:[
  {label:'Wikipedia · Christine Sinclair',url:'https://en.wikipedia.org/wiki/Christine_Sinclair'},
  {label:'Team Canada · Christine Sinclair',url:'https://olympic.ca/team-canada/christine-sinclair/'},
  {label:'CBC Sports · Canada beat the US in the Tokyo semi-final',url:'https://www.cbc.ca/sports/olympics/summer/soccer/womens-soccer-canada-usa-recap-aug-2-1.6126694'},
 ],
 pages:[
  {id:'family',year:'Burnaby · Aged 4',title:'A football family',
   text:'Christine Sinclair was born in 1983 in Burnaby, in Canada. Football ran in her family: her father and two of her uncles had all played the game. Christine started playing when she was four, on a team for children up to seven.\n\nKick the ball. Playing with older children was not easy, but it helped her learn fast. As one of the youngest on the field, she had to be quick and clever.',
   lesson:'Playing with older kids can be hard. It can also help you grow.',
   prompt:'Kick the ball',response:'Learning from the big kids.',source:0},
  {id:'debut',year:'2000 · Aged 16',title:'Three goals at sixteen',
   text:'In 2000, when she was sixteen, Christine played her first tournament for Canada, the Algarve Cup in Portugal. She scored three goals. She was one of the youngest players in the team, playing against grown women from all over the world.\n\nFlip the scoreboard. It was the start of a very long journey with her national team, one that would bring great joy, and some very hard days too.',
   lesson:'When you get a chance, give it your best, however young you are.',
   prompt:'Flip the scoreboard',response:'Three goals!',source:0},
  {id:'london',year:'London 2012',title:'Three goals, and still a loss',
   text:'At the 2012 Olympics, Canada played the United States in the semi-final. Christine scored three goals, a hat-trick. But the United States scored a winning goal at the very end of extra time, and Canada lost 4–3.\n\nLift the rain cloud. It was one of the saddest days of Christine’s football life. A few days later, Canada played again and won the bronze medal. Winning bronze could not take all the sadness away, but it showed the team could pick themselves up again.',
   lesson:'You can play your very best and still lose. It is okay to feel sad, then get up again.',
   prompt:'Lift the rain cloud',response:'Sad, and still standing.',source:1},
  {id:'rio',year:'Rio 2016',title:'Climbing back',
   text:'Four years later, at the 2016 Olympics in Brazil, Canada reached the bronze medal match again. Their opponents were Brazil, the home team, in front of a huge crowd. The crowd wanted Brazil to win, and the noise was very loud.\n\nClimb the steps. Christine scored the winning goal, and Canada won bronze again. Each time they lost, the team came back and tried again. The team had learned how to bounce back.',
   lesson:'Getting back up after a loss is a skill. You can practise it.',
   prompt:'Climb the steps',response:'Bronze again!',steps:3,source:0},
  {id:'record',year:'2020',title:'More goals than anyone',
   text:'In January 2020, Christine scored her 185th goal for Canada. No player in the world, man or woman, had ever scored so many international goals. She finished with 190. Christine had been scoring for her country for twenty years.\n\nFill the goal bar. Christine also raised money for research into multiple sclerosis, an illness her mother lived with, so that other families could be helped.',
   lesson:'Hard work adds up. Every practice is one more step.',
   prompt:'Fill the goal bar',response:'Number 185!',steps:3,source:0},
  {id:'tokyo',year:'Tokyo · 2021',title:'Gold at last',
   text:'The Tokyo Olympics were held in 2021. In the semi-final, Canada played the United States again, nine years after that sad day in London. This time Canada won 1–0. Some of the players had been part of that sad day in 2012.\n\nLift the gold medal. In the final, Canada and Sweden drew 1–1, and Canada won on penalties. It was Canada’s first Olympic gold in women’s football, and Christine had finally won it with her team.',
   lesson:'Keep going after heartbreak. Your best moment might still be ahead.',
   prompt:'Lift the gold medal',response:'Olympic champions!',source:2},
 ]
};
