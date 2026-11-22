import type {BookPageSpec} from './types';
/* Hamm sources checked Nov 21 2026 against the sources the book lists. Every fact on this page is in the book. The year of
 * the first Garrett Game is not confirmed (sources give 1998 or the foundation's first year), so the book and this page say
 * the foundation, started in 1999, held it. Garrett's adoption age and Mia's retirement year are left out. */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Hamm: A team for Garrett is a free six-chapter pop-up story for kids about Mia Hamm, who was born with a club foot, became the youngest player on the US team that won the first Women’s World Cup and lost her brother Garrett to a rare blood illness. She started a foundation in his honour, scored a record 158 goals and won two Olympic golds. The story teaches that helping others is a way to remember someone you love.',
  facts:[
   {icon:'tag',label:'Country',value:'USA'},
   {icon:'clock',label:'Born',value:'1972, Selma, Alabama'},
   {icon:'cards',label:'World champion',value:'1991 and 1999'},
   {icon:'steps',label:'Foundation',value:'Started in 1999, for Garrett'},
   {icon:'shirt',label:'Goals for the USA',value:'158'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Was Mia Hamm born with a club foot?',a:'Yes. Mia Hamm was born in 1972 in Selma, Alabama, with a club foot, a foot that turns inwards. When she was very small she wore special shoes to help it grow straight. Her father was in the US Air Force, and she first played soccer in Florence, Italy.'},
   {q:'How young was Mia Hamm when she played for the USA?',a:'She first played for the United States national team in 1987, when she was only fifteen. In 1991, at nineteen, she was the youngest player in the US team that won the very first Women’s World Cup.'},
   {q:'Who was Garrett Hamm?',a:'Garrett was Mia’s older brother, who joined the family through adoption. As a young man he became ill with aplastic anaemia, a rare illness that stops the body making enough new blood. A donor was found and he had a transplant, but sadly he died in 1997, aged twenty-eight.'},
   {q:'What does the Mia Hamm Foundation do?',a:'Mia started the foundation in 1999, and it held the first Garrett Game, a match to raise money in her brother’s honour. It helps people who need a bone marrow or cord blood transplant, asks more people to join the list of donors and makes more chances for girls and women to play sport.'},
   {q:'How many goals did Mia Hamm score?',a:'In May 1999 she scored her 108th goal for the United States, more than any player, man or woman, had scored in international football. By 2004 she had 158, a record that lasted until 2013. She also won Olympic gold in 1996 and 2004.'},
  ],
  sourceNotes:'Left out on purpose (docs/player-books/NEW-20-NOV21.md): the age Garrett joined the family (sources differ), the exact year of the first Garrett Game and any treatment detail.',
 };
export default page;
