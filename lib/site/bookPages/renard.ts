import type {BookPageSpec} from './types';
/* Renard sources checked Nov 21 2026 against the sources the book lists (Wikipedia, UEFA, ESPN in her own words). Every fact on this page is in
 * the book. Her father's death and her mental-health decision are told the book's gentle way. See sourceNotes. */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Renard: Not chosen, then a captain is a free six-chapter pop-up story for kids about Wendie Renard, from Martinique in the Caribbean. She lost her father at eight, was not chosen at France’s training centre, and left home at sixteen for Lyon, where she won the Champions League eight times. The story teaches that a no is not the end, and that looking after your mind matters.',
  facts:[
   {icon:'tag',label:'Country',value:'France (Martinique)'},
   {icon:'clock',label:'Joined Lyon',value:'At sixteen, 2006'},
   {icon:'cards',label:'Champions League',value:'8 titles'},
   {icon:'shirt',label:'Height',value:'1.87 m'},
   {icon:'steps',label:'France captain',value:'From 2013'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Where did Wendie Renard grow up?',a:'Wendie was born in 1990 in Schœlcher, on Martinique, a French island in the Caribbean Sea. She started playing at seven for a local club, L’Essor Préchotin. Martinique is a long way from mainland France, where the biggest clubs are.'},
   {q:'How did Wendie Renard keep going after her father died?',a:'When Wendie was eight, her father died of an illness. It was a very sad time. The people around her, especially the women in her family, encouraged her to keep playing, and football helped her keep going.'},
   {q:'Was Wendie Renard turned down?',a:'Yes. As a young teenager she flew to mainland France for a trial at Clairefontaine, the national training centre, and was not chosen. She went home, kept training, and later had a trial at Lyon that went much better. At sixteen she moved to Lyon.'},
   {q:'Why did Wendie Renard step away before the 2023 World Cup?',a:'In February 2023 she said she would not play at the World Cup, to protect her mental health: the health of her thoughts and feelings. A few weeks later France had a new coach who invited her back. She said yes, and at the World Cup she scored the winning goal against Brazil.'},
  ],
  sourceNotes:'Clairefontaine trial age differs (14 or 15) so the page says "as a young teenager". The illness that took her father is not named. The coach dispute behind the 2023 decision is left out; nobody is blamed.',
 };
export default page;
