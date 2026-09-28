import type {BookData} from '../types';
/** Original child-readable retelling of the hardships in Cristiano Ronaldo's life. Facts come from the cited sources; the coping lessons are ours, not quotations. */
export const CRISTIANO_BOOK:BookData={
 title:'Cristiano Ronaldo',subtitle:'A long way from home',itemId:'display:plaza:book:cristiano',player:'Cristiano Ronaldo',
 sources:[
  {label:'Wikipedia · Cristiano Ronaldo',url:'https://en.wikipedia.org/wiki/Cristiano_Ronaldo'},
  {label:'Wikipédia (português) · Cristiano Ronaldo',url:'https://pt.wikipedia.org/wiki/Cristiano_Ronaldo'},
 ],
 pages:[
  {id:'madeira',year:'Madeira · 1985',title:'One room, a whole family',
   text:'Cristiano Ronaldo was born in 1985 in Funchal, on the Portuguese island of Madeira. His family was poor. He shared one bedroom with his brother, Hugo, and his sisters, Elma and Kátia.\n\nOpen the window of the little house. His mother, Dolores, worked as a cook and a cleaner. His father, José, was a gardener, and helped look after the kit at a local club, Andorinha. That is where Cristiano started playing, when he was seven.',
   lesson:'You don’t need a lot of things to have a big dream. Your family can be your first team.',
   prompt:'Open the window',response:'One room, a whole family.',source:0},
  {id:'lisbon',year:'Lisbon · 1997',title:'Across the sea at twelve',
   text:'In 1997, when Cristiano was twelve, the big club Sporting, in Lisbon, gave him a three-day trial, and then signed him. He had to leave Madeira and his family behind, and move across the sea to Lisbon.\n\nSail the boat to Lisbon. Moving so far from home at twelve would be hard for anyone. At his new school he was popular, but he found schoolwork difficult. Once he lost his temper with a teacher, and he had to leave that school.',
   lesson:'Being new somewhere is hard. It’s okay to miss home, and to ask a grown-up for help.',
   prompt:'Sail the boat to Lisbon',response:'A new home across the sea.',source:0},
  {id:'heart',year:'Lisbon · Aged 15',title:'A racing heart',
   text:'When Cristiano was fifteen, doctors found a problem with his heart. Sometimes it beat much too fast. The problem was serious enough that it could have stopped him playing football.\n\nSlow the racing heart. The club told his mother, Dolores, and she agreed that he should go to hospital. Doctors fixed the problem with a laser, in an operation on his heart. He went home the same day, and a few days later he was training again.',
   lesson:'If something feels wrong in your body, tell a grown-up. Asking for help is brave.',
   prompt:'Slow the racing heart',response:'Calm again, and back training.',source:1},
  {id:'father',year:'Manchester · 2005',title:'Missing his dad',
   text:'In 2003, at eighteen, Cristiano moved to Manchester United in England. Later he called his manager there, Alex Ferguson, his father in sport.\n\nBut in 2005, when Cristiano was twenty, his own father, José, died after a long illness. José had been the kit man at Cristiano’s very first club. Lift the photo frame to remember him. Losing a parent is one of the saddest things that can happen, and feeling better can take a long time.',
   lesson:'Grief can feel heavy. Talk about the people you miss, and let others care for you.',
   prompt:'Lift the photo frame',response:'José is remembered.',source:0},
  {id:'booed',year:'England · 2006 to 2007',title:'Booed, but not beaten',
   text:'At the 2006 World Cup, Portugal played England. After an incident involving Cristiano, his Manchester United teammate Wayne Rooney was sent off. Back in England, crowds booed Cristiano all through the next season. He asked to leave the club, but United said no.\n\nTurn the boos into cheers. Cristiano kept playing his best. That season he scored twenty league goals for the first time, and Manchester United won the Premier League.',
   lesson:'When people are unkind, you don’t have to believe them. Keep doing your best.',
   prompt:'Turn the boos into cheers',response:'Twenty goals. Champions!',steps:3,source:0},
  {id:'captain',year:'Euro 2004 to Euro 2016',title:'Carried by his team',
   text:'In 2004, when Cristiano was nineteen, Portugal lost the final of the European Championship to Greece. Twelve years later, at Euro 2016, he was Portugal’s captain in the final against France. But he was taken off after twenty-five minutes.\n\nLift the trophy. His teammates kept going, and Portugal won their first ever major trophy. In Madeira, the airport was renamed after him. Years earlier, he had given money to the hospital that saved his mother’s life, to build a cancer centre.',
   lesson:'Your team can carry you when you can’t go on. Later, you can help carry others.',
   prompt:'Lift the trophy',response:'Champions of Europe, together.',source:0},
 ]
};
