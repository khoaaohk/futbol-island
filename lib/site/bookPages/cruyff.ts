import type {BookPageSpec} from './types';
/* Cruyff sources checked Nov 17 2026 against the English Wikipedia article the book lists (Johan Cruyff). Every fact on this
 * page is in the book and in that article. The book does not name his position, so the page does not either. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Cruyff: Making space for others is a free six-chapter pop-up story for kids about Johan Cruyff, who grew up five minutes from the Ajax stadium in Amsterdam and lost his father when he was twelve. Coaches helped him grow, he won three European Cups with Ajax, and his foundation built courts where children play together. The story teaches that families can change shape, and that everyone deserves a place to play.',
  facts:[
   {icon:'tag',label:'Country',value:'Netherlands'},
   {icon:'clock',label:'Born',value:'1947, Amsterdam'},
   {icon:'steps',label:'Club',value:'Ajax, from his tenth birthday'},
   {icon:'shirt',label:'Famous shirt',value:'Number 14'},
   {icon:'cards',label:'European Cups',value:'1971, 1972 and 1973'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'What happened to Cruyff’s family when he was twelve?',a:'On 8 July 1959, his father, Manus, died of a heart attack. His mother, Nel, could not keep the family’s vegetable shop going on her own, so she gave it up and found work at Ajax as a cleaner. There she met Henk Angel, the club’s caretaker, and later she married him.'},
   {q:'Who helped Cruyff at Ajax?',a:'Jany van der Veen, a youth coach who lived nearby, spotted him playing and invited him to Ajax. Johan was small and not yet strong, so the coach Vic Buckingham encouraged him to go to the gym and made sure he ate better food. Later, the coach Rinus Michels became almost like a father to him, even though they often argued.'},
   {q:'Why did Cruyff wear number 14?',a:'At the start of the 1970–71 season he hurt his groin and could not play. When he came back on 30 October 1970, against PSV, a teammate had his usual number 9 shirt, so he wore number 14. He kept it from then on, and it became famous.'},
   {q:'Did Cruyff win the World Cup?',a:'No. In 1974 the Netherlands reached the final against West Germany. In the very first minute Cruyff was fouled, and Johan Neeskens scored the penalty, but West Germany won 2–1. Even so, Cruyff was voted the best player of the tournament. Earlier, against Sweden, his clever turn became known as the Cruyff Turn.'},
   {q:'What are Cruyff Courts?',a:'In 1997 Cruyff started the Johan Cruyff Foundation, to help children who have a harder start and children with special needs. It has built more than 200 Cruyff Courts in 22 countries, where children of all backgrounds play together.'},
  ],
  exhibits:['shirts','worldcup-1930'],
 };
export default page;
