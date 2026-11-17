import type {BookPageSpec} from './types';
/* Eusébio sources checked Nov 17 2026 against the English Wikipedia article the book lists (Eusébio), with Portuguese
 * Wikipedia as a second check. Every fact on this page is in the book and in those articles. The book does not name his
 * position, so the page does not either. One sentence of the book is kept off the page (see sourceNotes). */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Eusébio: Far from home is a free six-chapter pop-up story for kids about Eusébio, who grew up in a very poor neighbourhood in Mozambique and played barefoot with a ball made of socks. His father died when he was eight. At eighteen he moved to Lisbon, far from his mum, and he became the top scorer of the 1966 World Cup. The story teaches that win or lose, you can always be kind.',
  facts:[
   {icon:'tag',label:'Country',value:'Mozambique, then Portugal'},
   {icon:'clock',label:'Born',value:'1942, Mafalala, Lourenço Marques'},
   {icon:'shirt',label:'First team',value:'Os Brasileiros, with a sock ball'},
   {icon:'steps',label:'Club',value:'Benfica, from 1961'},
   {icon:'cards',label:'1966 World Cup',value:'Top scorer, nine goals'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'How did Eusébio play football as a boy?',a:'Eusébio was born in 1942 in Mafalala, a very poor neighbourhood of Lourenço Marques, the city now called Maputo, in Mozambique. He played barefoot with his friends on bumpy, home-made pitches. They had no real ball, so they stuffed socks with newspaper and rolled them into a ball. They called their team Os Brasileiros, after Brazil’s great team.'},
   {q:'What happened to Eusébio’s father?',a:'His father, Laurindo, worked on the railway and loved the team Benfica. In 1950, when Eusébio was eight, his father died of an illness called tetanus. After that his mother, Elisa, raised Eusébio almost all by herself. There were five children in the family.'},
   {q:'Which clubs turned Eusébio away?',a:'With some friends, he tried to join his favourite club, Desportivo, but they turned him away without giving him a chance. Another club, Ferroviário, said no too. At twelve he tried Sporting Lourenço Marques, and they said yes to him and his friends. From 1957 to 1960 he scored 77 goals in 42 games.'},
   {q:'How did Eusébio move to Lisbon?',a:'On 15 December 1960, at eighteen, he arrived in Lisbon, in Portugal, far from his mum. Two big clubs argued over him, and the move took months. For a while he was sent to a quiet place by the sea, and he told his mum he was going back home. His mum signed the deal. In May 1961 he played his first game for Benfica and scored three goals.'},
   {q:'What is the Game of Tears?',a:'At the 1966 World Cup, Portugal were losing 3–0 to North Korea, and Eusébio scored four goals in a row as Portugal won 5–3. In the semi-final against England he scored a penalty, but Portugal lost 2–1. He walked off the pitch in tears, and players from both teams comforted him. In Portugal, that match is called the Game of Tears.'},
  ],
  exhibits:['laced-leather','worldcup-1930'],
  sourceNotes:'“Eusébio later said the Desportivo coach was unfair to people because of the colour of their skin” (chapter 3): English Wikipedia says he accused Desportivo’s head coach of racism in an interview, but Portuguese Wikipedia gives a knee problem as the reason Desportivo did not take him, and English Wikipedia also quotes him calling Sporting Lourenço Marques “racist”; the sources disagree, so the page leaves the reason out. The quiet place by the sea was Lagos, in the Algarve, for twelve days; the page keeps the book’s wording.',
 };
export default page;
