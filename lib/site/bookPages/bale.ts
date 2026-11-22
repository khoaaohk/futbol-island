import type {BookPageSpec} from './types';
/* Bale sources checked Nov 21 2026 (Wikipedia, ESPN, Planet Football). Every fact on this page is in the book. Sources give 24 or 25
 * winless games; ESPN and most others give 24. The minute he came on against Burnley is not in the sources (ESPN: a six-minute cameo),
 * so the book says "near the end of a game". */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Bale: The unlucky run is a free six-chapter pop-up story for kids about Gareth Bale, spotted at nine playing six-a-side in Cardiff, given one-touch rules by his PE teacher and capped for Wales at sixteen. At Tottenham his team did not win in his first 24 Premier League games, and people called him unlucky. Then the run ended and he became a star on the wing. The story teaches that a bad run does not say who you are.',
  facts:[
   {icon:'tag',label:'Country',value:'Wales'},
   {icon:'clock',label:'Youngest Wales player',value:'16 years 315 days, 2006'},
   {icon:'steps',label:'Winless run',value:'24 Premier League games'},
   {icon:'cards',label:'Champions League',value:'5, with Real Madrid'},
   {icon:'shirt',label:'World Cup',value:'2022, Wales’ first since 1958'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Where did Gareth Bale start playing?',a:'Gareth Bale was born in 1989 in Cardiff, in Wales. When he was nine, scouts from Southampton saw him playing six-a-side football for his first club, Cardiff Civil Service, and invited him to train with them.'},
   {q:'What special rules did Gareth Bale’s PE teacher give him?',a:'He was so good at school football that his PE teacher, Gwyn Morris, allowed him only one touch of the ball and did not let him use his left foot, his best foot. That made games fairer and made him practise other skills.'},
   {q:'What was Gareth Bale’s unlucky run?',a:'At Tottenham, his team did not win any of the first 24 Premier League games he played in. The run lasted two years, and some people called him unlucky, even though it was not his fault. It ended in September 2009, when he came on near the end of a 5–0 win over Burnley.'},
   {q:'How did Gareth Bale become a star?',a:'His manager moved him from left-back to the wing, and he became one of the most exciting players in the world. The other players voted him their Player of the Year in 2011 and 2013. In 2013 Real Madrid signed him for a world-record fee, and he won the Champions League five times.'},
   {q:'What did Gareth Bale do for Wales?',a:'He became the youngest player ever to play for Wales at sixteen years and 315 days. In 2016 he led Wales to the semi-finals of the European Championship, and in 2022 he helped Wales reach the World Cup for the first time since 1958. He stopped playing in January 2023.'},
  ],
  sourceNotes:'Left out on purpose (docs/player-books/NEW-20-NOV21.md): 25 winless games (most sources give 24). Changed before narration: “in the eighty-fifth minute” (not confirmed) became “near the end of a game”.',
 };
export default page;
