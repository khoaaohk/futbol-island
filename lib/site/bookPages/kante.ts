import type {BookPageSpec} from './types';
/* Kanté sources checked Nov 17 2026 against the two pages the book lists (English Wikipedia, N’Golo Kanté, and his own
 * account on chelseafc.com), with French Wikipedia as a second check. Every fact on this page is in the book and in those
 * sources. The book does not name his position, so the page does not either. Two details are worded carefully (see sourceNotes). */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Kanté: Told no, and still working is a free six-chapter pop-up story for kids about N’Golo Kanté, who was turned down by professional academies at twelve, fourteen and sixteen. He kept working, got his chance at Boulogne at nineteen, won the Premier League with Leicester City and Chelsea, and won the World Cup with France in 2018. The story teaches that when you hear no, you can keep working.',
  facts:[
   {icon:'tag',label:'Country',value:'France'},
   {icon:'clock',label:'Born',value:'1991, Paris'},
   {icon:'steps',label:'First club',value:'JS Suresnes, from age 8'},
   {icon:'shirt',label:'Studied',value:'Accountancy'},
   {icon:'cards',label:'World Cup',value:'Winner with France, 2018'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Did N’Golo Kanté play for a big club as a boy?',a:'No. N’Golo was born in Paris in 1991, and his parents had moved to France from Mali. At eight he started playing for JS Suresnes, a small club near Paris, and he stayed there for about ten years. When he was eleven his father died, and his family had to be strong together. N’Golo kept going to training.'},
   {q:'How many times was N’Golo Kanté told no?',a:'At twelve, fourteen and sixteen, he went to trials at the academies of professional clubs. The answer was always the same: no. They said they already had players like him, or better. N’Golo told himself to keep working, because maybe next time would be the right time.'},
   {q:'How did N’Golo get his chance?',a:'At nineteen he went to Boulogne and played in the second team. At the same time he studied accountancy, in case football did not work out. At twenty-one he began training with the first team, and in May 2012 he played his first professional game: the last eleven minutes of the last game of the season.'},
   {q:'What did N’Golo do at Caen and Leicester City?',a:'He joined Caen in 2013 and played all 38 league games in his first season, and the team won promotion. The next season he won the ball back more times than any other player in Europe. At Leicester City he made more tackles and interceptions than anyone in the league, and in 2016 Leicester became Premier League champions.'},
   {q:'What did N’Golo Kanté win after Leicester?',a:'He joined Chelsea, and in 2017 he won the league again. That year the players voted him the best player in England. In 2018 he played in all seven of France’s matches at the World Cup, and in the final France beat Croatia 4–2.'},
  ],
  exhibits:['worldcup-1930'],
  sourceNotes:'“Six divisions below the top of French football” (chapter 3): in the Chelsea article he says both “the sixth division” and “six divisions from the elite”; the page gives no number. “His coach at Suresnes said big clubs did not notice him because he was small and never showed off” (chapter 2): Wikipedia credits assistant manager Pierre Ville, who spoke of his small stature and selfless style of play; left off the page.',
 };
export default page;
