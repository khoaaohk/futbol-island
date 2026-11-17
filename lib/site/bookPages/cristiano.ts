import type {BookPageSpec} from './types';
/* Cristiano Ronaldo sources checked Nov 17 2026 against the two Wikipedia articles the book lists (English and Portuguese).
 * Every fact on this page is in the book and in those articles; his age (fifteen) at the heart operation and his mother's
 * agreement are in the Portuguese one only. The book does not name his position, so the page does not either. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Cristiano Ronaldo: A long way from home is a free six-chapter pop-up story for kids about Cristiano Ronaldo, who grew up poor on the island of Madeira, moved to Lisbon at twelve and had a heart operation at fifteen. He lost his father, was booed in England, and was taken off early in the Euro 2016 final that Portugal won. The story teaches that your team can carry you, and later you can help carry others.',
  facts:[
   {icon:'tag',label:'Country',value:'Portugal'},
   {icon:'clock',label:'Born',value:'1985, Funchal, Madeira'},
   {icon:'shirt',label:'First club',value:'Andorinha, from age 7'},
   {icon:'steps',label:'Moved away',value:'Sporting, Lisbon, at 12'},
   {icon:'cards',label:'Won with Portugal',value:'Euro 2016'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Where did Cristiano Ronaldo grow up?',a:'In Funchal, on the Portuguese island of Madeira. His family was poor, and he shared one bedroom with his brother, Hugo, and his sisters, Elma and Kátia. His mother, Dolores, worked as a cook and a cleaner. His father, José, was a gardener and helped look after the kit at a local club, Andorinha, where Cristiano started playing at seven.'},
   {q:'How old was Ronaldo when he left home?',a:'Twelve. In 1997 the big club Sporting, in Lisbon, gave him a three-day trial and then signed him. He had to leave Madeira and his family and move across the sea. At his new school he was popular, but he found schoolwork difficult. Once he lost his temper with a teacher, and he had to leave that school.'},
   {q:'What was wrong with Ronaldo’s heart?',a:'When he was fifteen, doctors found that his heart sometimes beat much too fast. It could have stopped him playing football. The club told his mother, and she agreed that he should go to hospital. Doctors fixed the problem with a laser, he went home the same day, and a few days later he was training again.'},
   {q:'Why was Ronaldo booed in England?',a:'At the 2006 World Cup, Portugal played England. After an incident involving Cristiano, his Manchester United teammate Wayne Rooney was sent off. Crowds in England booed Cristiano all through the next season. He asked to leave the club, but United said no. That season he scored twenty league goals for the first time, and United won the Premier League.'},
   {q:'How did Portugal win Euro 2016?',a:'In 2004, when Cristiano was nineteen, Portugal lost the European Championship final to Greece. At Euro 2016 he was Portugal’s captain in the final against France, but he was taken off after twenty-five minutes. His teammates kept going, and Portugal won their first ever major trophy. Madeira’s airport was later renamed after him.'},
  ],
  exhibits:['hall-of-fame'],
 };
export default page;
