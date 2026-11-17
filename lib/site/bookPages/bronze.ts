import type {BookPageSpec} from './types';
/* Bronze sources checked Nov 17 2026 against the English Wikipedia article the book lists (Lucy Bronze). Every fact on this page
 * is in the book and in that article. The book does not name her position, so the page does not either. One sentence of the
 * book is kept off the page (see sourceNotes). */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Bronze: Brave enough to start again is a free six-chapter pop-up story for kids about Lucy Bronze, who had to leave her boys’ team at twelve, crossed the ocean to play in North Carolina, and spent much of a year in a leg brace after a knee injury. She made her own recovery plan, and in 2020 she won FIFA’s award for the best women’s player in the world. The story teaches that it is brave to start again.',
  facts:[
   {icon:'tag',label:'Country',value:'England'},
   {icon:'clock',label:'Born',value:'1991, north of England'},
   {icon:'shirt',label:'First team',value:'Alnwick Town boys’ team'},
   {icon:'steps',label:'College',value:'North Carolina, United States'},
   {icon:'cards',label:'FIFA award',value:'Best women’s player, 2020'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why did Lucy Bronze have to leave her boys’ team?',a:'Lucy played for the boys’ team at Alnwick Town and was named the best player in six of her eight games. But when she turned twelve, the rules said she could no longer play on a boys’ team. Her manager tried hard to change the rule for her. It did not change, but the Football Association promised more girls’ teams in the countryside.'},
   {q:'How far did Lucy travel to play football?',a:'The nearest girls’ team was Sunderland, hours away from home. Lucy said that between school and training there was time for nothing else, and the travel wore her out. Her mother found summer football camps in America, and Lucy also joined Blyth Town, a team closer to home.'},
   {q:'Why did Lucy see a sports psychologist?',a:'In 2009 she won the European Championship with England’s under-19 team. Around that time a childhood friend of hers died, and she missed his funeral because she was playing in the tournament. She felt guilty, and for a while she found she could not run. A sports psychologist helped her. Later she said that, next to losing her friend, her own pain felt small.'},
   {q:'Why did Lucy go to North Carolina?',a:'At seventeen she was turned down by a football programme at a university in England, so she moved to North Carolina, in the United States. She was the youngest player on the team and was told she would not play much. She trained hard, soon started games, and became the first British player to win the American college championship.'},
   {q:'How did Lucy come back from her knee injury?',a:'In December 2009 she hurt her knee in training. It became infected, and she spent much of the next year in a leg brace. At Everton she hardly played, and she worked in a pizza shop. She used what she was learning in her sports science degree to make her own recovery plan. She won the league with Liverpool in 2013 and 2014, and at the 2015 World Cup she scored the winning goal against Norway from outside the box.'},
  ],
  exhibits:['wwc-1991'],
  sourceNotes:'“She was told she probably could not keep playing past the age of twenty-seven” (chapter 6): not found in Wikipedia; left off the page. “Far outside the box” (chapter 6): Wikipedia says from outside the penalty area; the page says “from outside the box”.',
 };
export default page;
