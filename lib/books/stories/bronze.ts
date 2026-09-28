import type {BookData} from '../types';
/** Original child-readable retelling of the hardships in Lucy Bronze's life. Facts come from the cited source; the coping lessons are ours, not quotations. */
export const BRONZE_BOOK:BookData={
 title:'Bronze',subtitle:'Brave enough to start again',itemId:'display:oldtown:book:bronze',player:'Lucy Bronze',
 sources:[
  {label:'Wikipedia · Lucy Bronze',url:'https://en.wikipedia.org/wiki/Lucy_Bronze'},
 ],
 pages:[
  {id:'alnwick',year:'2003 · Alnwick',title:'The rule that stopped her',
   text:'Lucy Bronze was born in 1991 in the north of England, to a Portuguese father and an English mother. She first played football with her older brother and his friends, then joined the boys’ team at Alnwick Town. She was named the best player in six of her eight games.\n\nOpen the letter. When Lucy turned twelve, the rules said she could no longer play on a boys’ team. Her manager tried hard to change the rule for her. It did not change, but the Football Association promised more girls’ teams in the countryside.',
   lesson:'Some rules are unfair. Speaking up can help the people who come after you.',
   prompt:'Open the letter',response:'More teams for girls.',source:0},
  {id:'sunderland',year:'2002 to 2007 · Sunderland',title:'The long road',
   text:'Lucy was very shy when she was young, and she did not speak much. The nearest girls’ team was Sunderland, hours away from home. Lucy said that between school and training there was time for nothing else, and the travel wore her out.\n\nDrive the car down the long road. Her mother searched for ways to help her keep playing, and found summer football camps in America. Lucy also joined Blyth Town, a team closer to home. Much later, she shared that she has autism, ADHD and dyslexia.',
   lesson:'Being shy or different is okay. Small, brave steps still take you forward.',
   prompt:'Drive down the long road',response:'Every trip, a step forward.',source:0},
  {id:'friend',year:'2009 · England under-19s',title:'Missing a friend',
   text:'In 2009, Lucy played for England’s under-19 team, and they won the European Championship. But around that time a childhood friend of hers died, and she missed his funeral because she was playing in the tournament.\n\nOpen the door to find help. Lucy felt guilty, and for a while she found she could not run. She went to see a sports psychologist, someone who helps athletes with their thoughts and feelings. Later she said that, next to losing her friend, her own pain felt small, and that helped her keep going.',
   lesson:'Guilt and sadness are heavy feelings. Talking to someone who can help is brave.',
   prompt:'Open the door',response:'Someone to talk to.',source:0},
  {id:'carolina',year:'2009 · North Carolina',title:'Across the ocean',
   text:'At seventeen, Lucy was turned down by a football programme at a university in England. So she moved across the ocean to study and play in North Carolina, in the United States. She was the youngest player on the team, and she was told she would not play much.\n\nFly the plane across the sea. Lucy trained hard, soon started games, and became the first British player to win the American college championship. But England told her that if she kept playing in America, they would not pick her.',
   lesson:'Being new somewhere is hard. A no in one place can open a door somewhere else.',
   prompt:'Fly the plane across the sea',response:'A brave new start.',source:0},
  {id:'knee',year:'2009 to 2012',title:'The knee that would not heal',
   text:'In December 2009, back in England, Lucy hurt her knee in training. It became infected, and she spent much of the next year in a leg brace. She was told she would miss the next youth tournament, and she later said she felt a lack of support.\n\nTick off the plan, one step at a time. At Everton she hardly played, and she worked in a pizza shop. But she used what she was learning in her sports science degree to make her own recovery plan, and she kept going.',
   lesson:'When you feel alone, keep taking small steps, and look for people who will support you.',
   prompt:'Tick off the plan',response:'Step by step, stronger.',steps:3,source:0},
  {id:'comeback',year:'2012 to 2020',title:'Stronger than before',
   text:'When Lucy first hurt her knee, she was told she probably could not keep playing past the age of twenty-seven. In 2012 she moved to Liverpool for better medical support, and she won the league in 2013 and 2014.\n\nRaise the flag. In 2015, after another knee operation, Lucy went to the World Cup. Against Norway she scored a winning goal from far outside the box, and England won 2–1. In 2020, she won FIFA’s award for the best women’s player in the world.',
   lesson:'Other people’s doubts don’t decide your future. You can start again, as many times as you need.',
   prompt:'Raise the flag',response:'Brave enough to start again!',source:0},
 ]
};
