import type {BookPageSpec} from './types';
/* Lukaku sources checked Nov 17 2026 against the English, German and Italian Wikipedia articles the book lists (Romelu
 * Lukaku). Every fact on this page is in the book and in those articles; the family’s money troubles, the promise and the
 * 25-goal deal are in German Wikipedia. The book does not name his position, so the page does not either. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Lukaku: A promise to my mother is a free six-chapter pop-up story for kids about Romelu Lukaku, who grew up in Belgium at a time when his family had very little money. He promised his mother he would be a professional footballer by sixteen, and he signed his first contract on his sixteenth birthday. The story teaches that it is okay to ask for a chance, and then give it your very best.',
  facts:[
   {icon:'tag',label:'Country',value:'Belgium'},
   {icon:'clock',label:'Born',value:'1993, Antwerp'},
   {icon:'steps',label:'Youth goals',value:'121 in 68 matches at Lierse'},
   {icon:'shirt',label:'First contract',value:'Anderlecht, on his 16th birthday'},
   {icon:'cards',label:'Belgium',value:'All-time top goalscorer'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why was money so tight for Romelu Lukaku’s family?',a:'Romelu was born in 1993 in Antwerp, Belgium. His parents came from Zaire, which is now called the DR Congo. His father, Roger, had been a professional footballer, but from 1999 he only played as an amateur. The family, in Wintam, had to sell things and be careful with food, and sometimes they could not pay for the electricity.'},
   {q:'What promise did Romelu make to his mother?',a:'In those hard days, Romelu decided he would become a professional footballer, like his father. He promised his mother he would be a professional player by the age of sixteen. On 13 May 2009, his sixteenth birthday, he signed his first professional contract with Anderlecht. He had kept his promise.'},
   {q:'What deal did Romelu make with his coach?',a:'At fifteen, he wanted more time on the pitch in Anderlecht’s youth team. He told his coach that if he got more playing time, he would score at least 25 goals by December 2008. He reached 25 goals in November, a month early.'},
   {q:'Why did Romelu not hold the Champions League trophy in 2012?',a:'Romelu joined Chelsea in 2011, but he hardly got to play and spent most of his first season with the reserves. When Chelsea won the Champions League in 2012, he would not hold the trophy. He said it was not him, but his team that won. On loan at West Bromwich Albion, he scored 17 goals, more than any Chelsea player that season.'},
   {q:'How did Romelu speak up against racism?',a:'In 2019 he moved to Inter Milan in Italy. In his first season, some fans shouted racist insults at him. Racism means treating someone unfairly because of the colour of their skin. Romelu spoke out and asked football to do more against it. In 2020, after scoring, he knelt and raised a fist to support Black Lives Matter.'},
  ],
  exhibits:['hall-of-fame'],
  sourceNotes:'Chelsea, “a club he had loved as a boy” (chapter 5): English Wikipedia says Didier Drogba and Nicolas Anelka made him want to play for Chelsea; the page leaves the phrase out. German Wikipedia (read Nov 17 2026) marks his father Roger as having died in 2025; the book does not say so, and the page only says he “had been a professional footballer”.',
 };
export default page;
