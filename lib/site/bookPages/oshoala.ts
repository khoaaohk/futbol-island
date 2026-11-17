import type {BookPageSpec} from './types';
/* Oshoala sources checked Nov 17 2026 against two of the three pages the book lists: the CNN interview (her childhood, her
 * grandmother, her parents) and English Wikipedia (Asisat Oshoala), with English Wikipedia’s Ikorodu article for Lagos
 * State. The FIFA page loads its text with JavaScript and could not be read. Every fact on this page is in the book and in
 * those pages. Her position is named only in a coaching lesson, not in the story, so the page does not name it. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Oshoala: Playing when few believed is a free six-chapter pop-up story for kids about Asisat Oshoala, who was born in Ikorodu, Nigeria, where many people thought football was not for girls. Her grandmother believed in her, and in 2021 she became the first African woman to win the Women’s Champions League. The story teaches that everyone deserves a game, and to talk calmly with the people who worry about you.',
  facts:[
   {icon:'tag',label:'Country',value:'Nigeria'},
   {icon:'clock',label:'Born',value:'1994, Ikorodu, Lagos State'},
   {icon:'cards',label:'Her grandmother’s words',value:'Good. Respectful. Disciplined.'},
   {icon:'steps',label:'Under-20 World Cup',value:'Best player and top scorer, 2014'},
   {icon:'shirt',label:'African Women’s Footballer of the Year',value:'Six times, more than anyone else'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why did Asisat Oshoala hide to play football?',a:'Asisat was born in 1994 in Ikorodu, in Lagos State, Nigeria, and grew up in a big family. Where she grew up, many people thought football was not for girls. Her parents did not want her to play. Asisat loved football anyway, and she sometimes hid where she was going, just to play. Some days she got into trouble at home for it.'},
   {q:'Who believed in Asisat Oshoala?',a:'Her grandmother. When others doubted her, her grandmother calmly told her to be a good and nice person, to be respectful and to be disciplined. Asisat says she still remembers those words every time she walks onto the pitch.'},
   {q:'How did Asisat’s parents change their minds?',a:'In 2014 Asisat went to the FIFA Under-20 Women’s World Cup in Canada with Nigeria. She scored seven goals, more than anyone else, and was named the best player of the tournament. After that year, she had a big talk with her parents. She told them that when young people follow their dreams, something good can come from it. Today they believe in her, and she says they know her game even before she tells them.'},
   {q:'What did Asisat Oshoala do in Europe?',a:'In 2015 she joined Liverpool and became the first African player in England’s Women’s Super League. She hurt her knee and missed two months, but she came back and kept scoring. In 2019 she joined Barcelona, and she scored in that year’s Champions League final, the first African player to score in a Women’s Champions League final. In 2021 she won the Champions League, the first African woman to do it.'},
   {q:'How does Asisat Oshoala help girls play football?',a:'In 2019 she started a foundation to help girls in Africa play football, with a tournament for girls in Lagos. Growing up, she never wore a shirt with a woman player’s name on the back. Now, when she goes home to Nigeria, lots of people have a Barcelona shirt with her name on it. She says that however far you go, you should always remember where you come from.'},
  ],
  exhibits:['wwc-1991'],
  sourceNotes:'“Six times”: English Wikipedia gives the record six African Women’s Footballer of the Year awards; the CNN interview (October 2021) says four, as it stood then. “Lagos State”: CNN and her Wikipedia article say only Ikorodu, Nigeria; Wikipedia’s Ikorodu article places it in Lagos State. CNN adds that some days her mother would not give her money for food; the book does not tell it and neither does the page.',
 };
export default page;
