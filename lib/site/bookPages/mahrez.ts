import type {BookPageSpec} from './types';
/* Mahrez sources checked Nov 21 2026 against the sources the book lists. Every fact on this page is in the book. The minute
 * of the 2019 semi-final winner differs between reports (94th to 96th), so the book and this page say "the very last minute";
 * it was a free kick (confirmed by several match reports). */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Mahrez: Too skinny? Watch this is a free six-chapter pop-up story for kids about Riyad Mahrez, who learned football in the streets of Sarcelles, lost his father at fifteen and was overlooked for being too slim. Leicester signed him for a small fee, he won the Premier League and he captained Algeria, his father’s country, to the Africa Cup of Nations. The story teaches that a small price does not mean a small talent.',
  facts:[
   {icon:'tag',label:'Country',value:'Algeria'},
   {icon:'steps',label:'Grew up',value:'Sarcelles, near Paris'},
   {icon:'clock',label:'Leicester fee',value:'About £450,000, 2014'},
   {icon:'cards',label:'PFA Players’ Player',value:'2016, first African winner'},
   {icon:'shirt',label:'Africa Cup of Nations',value:'2019, captain'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Where did Riyad Mahrez learn football?',a:'Riyad Mahrez was born in 1991 in Clichy, near Paris, and grew up in Sarcelles. He learned to play in the streets, with quick feet and clever tricks, and in 2004 he joined the youth team of his local club, AAS Sarcelles.'},
   {q:'Why did Riyad Mahrez play for Algeria?',a:'His father, Ahmed, came from Algeria. When Riyad was fifteen, his father died suddenly. Later, Riyad chose to play for Algeria, his father’s country, partly in his honour. A stadium in Sarcelles was named after Riyad, and he dedicated it to his father.'},
   {q:'Was Riyad Mahrez called too skinny?',a:'Yes. He was very slim, and scouts from big clubs often overlooked him because of it. He started at smaller clubs, Quimper in 2009 and Le Havre in 2010, and kept practising his dribbling and his left foot.'},
   {q:'How much did Leicester pay for Riyad Mahrez?',a:'In January 2014, Leicester City signed him from Le Havre for about £450,000, a small fee for a footballer. Leicester won promotion in his first season, and in 2015–16 they surprised everyone and won the Premier League. Riyad was named the PFA Players’ Player of the Year, the first African player to win it.'},
   {q:'What did Riyad Mahrez win with Algeria?',a:'In 2019 he was Algeria’s captain at the Africa Cup of Nations. In the semi-final against Nigeria he scored the winning goal with a free kick in the very last minute, and Algeria won the whole tournament. In 2023 he also won the Champions League with Manchester City.'},
  ],
  sourceNotes:'Left out on purpose (docs/player-books/NEW-20-NOV21.md): the exact minute of the 2019 semi-final winner (reports differ). His father’s death is told gently.',
 };
export default page;
