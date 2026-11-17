import type {BookPageSpec} from './types';
/* Saka sources checked Nov 17 2026 against the two English Wikipedia articles the book lists (Bukayo Saka, UEFA Euro 2020
 * final). Every fact on this page is in the book and in those articles. The book says he played on the wing and even at
 * left-back, so the page links the winger guide. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Saka: After the penalty is a free six-chapter pop-up story for kids about Bukayo Saka, who joined Arsenal’s academy at seven. At nineteen his penalty was saved in the Euro 2020 final, and he was sent racist messages online, but many people stood with him. Three years later he scored in another shoot-out for England. The story teaches that one hard moment does not decide your future.',
  facts:[
   {icon:'tag',label:'Country',value:'England'},
   {icon:'clock',label:'Born',value:'2001, Ealing, London'},
   {icon:'shirt',label:'Position',value:'On the wing, and even left-back',href:'/learn/soccer-positions/winger'},
   {icon:'steps',label:'Academy',value:'Arsenal, Hale End, from age 7'},
   {icon:'cards',label:'Nickname',value:'Little Chilli'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Who kept Bukayo Saka steady growing up?',a:'Bukayo was born in 2001 in Ealing, in London. His parents, Adenike and Yomi, had moved to London from Nigeria to find work. He did very well at school, with top grades in his exams. He has called his dad, Yomi, a massive inspiration, and said his dad always kept him grounded and humble.'},
   {q:'Why is Bukayo Saka called Little Chilli?',a:'At seven he joined Arsenal’s youth academy at Hale End. He was not the biggest player. His captain later nicknamed him Little Chilli, because he had so much energy and power, and was quite small.'},
   {q:'What happened in the Euro 2020 final?',a:'In July 2021, England played Italy in the final at Wembley. Bukayo was nineteen and came on as a substitute. After extra time the final went to a penalty shoot-out, and he took England’s fifth penalty, his first for England’s senior team. The goalkeeper, Gianluigi Donnarumma, saved it, and Italy won the cup.'},
   {q:'How did people support Bukayo after the final?',a:'Bukayo, Marcus Rashford and Jadon Sancho were sent racist messages online. The Football Association said the abuse was wrong, and the Prime Minister and Prince William spoke out too. A digital mural of the three players was unveiled in Manchester. Bukayo said social media companies were not doing enough to stop these messages.'},
   {q:'Did Bukayo take a penalty for England again?',a:'Yes. At Euro 2024, England played Switzerland in the quarter-final, and Bukayo scored to make it 1–1. The game went to a penalty shoot-out. Bukayo stepped up again, and this time he scored. England went through, and he was named player of the match.'},
  ],
  exhibits:['penalty-1891','hall-of-fame'],
 };
export default page;
