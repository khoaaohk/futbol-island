import type {BookPageSpec} from './types';
/* Drogba sources checked Nov 17 2026 against the English Wikipedia article the book lists (Didier Drogba), with French
 * Wikipedia as a second check. Every fact on this page is in the book and in those articles. The book does not name his
 * position, so the page does not either. See sourceNotes for one year. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Drogba: A late start and a peace wish is a free six-chapter pop-up story for kids about Didier Drogba, who was born in Abidjan, Ivory Coast, and went to live in France with his uncle when he was five. He only began training every day as a grown-up. In 2005 he asked the people fighting in his country to put down their weapons. The story teaches that your voice matters, and that starting later is okay.',
  facts:[
   {icon:'tag',label:'Country',value:'Ivory Coast'},
   {icon:'clock',label:'Born',value:'1978, Abidjan'},
   {icon:'cards',label:'Nickname',value:'Tito, from his mum'},
   {icon:'steps',label:'First professional contract',value:'1999, at Le Mans'},
   {icon:'shirt',label:'First World Cup',value:'Ivory Coast qualified in 2005'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why did Didier Drogba live in France as a child?',a:'When Didier was five, his parents sent him from Abidjan to France to live with his uncle, Michel Goba, who was a professional footballer. Didier became homesick, and after three years he went back to Abidjan. But both of his parents lost their jobs, so he went back to his uncle in France. In 1991 his parents came to France too, and in 1993 they settled in Antony. At fifteen, Didier moved back in with his family.'},
   {q:'Why is it called a late start?',a:'Didier had never been to a football academy. He only began training every day as a grown-up, at Le Mans, where he also studied at university. At first he kept getting injured. His coach later said it took Didier four years to be able to train every day and play every week. In 1999 he signed his first professional contract.'},
   {q:'Who helped Didier Drogba score goals?',a:'At Guingamp, the coaches were unsure about Didier, but they were patient. The next season he scored 17 goals. He praised his teammates, like his old friend Florent Malouda. Didier also said that the birth of his son, Isaac, was a turning point in his life.'},
   {q:'How did Didier Drogba help bring peace?',a:'For five years, there was a civil war in Ivory Coast. On 8 October 2005, the national team beat Sudan and qualified for their first ever World Cup. In the changing room, Didier spoke to the TV cameras and asked the people who were fighting to put down their weapons. His plea was answered with a ceasefire. Later, he helped move a big match to the city of Bouaké, which helped the peace process.'},
   {q:'Did Didier Drogba build a hospital?',a:'Yes. In 2009 he gave three million pounds from an advertising deal to build a hospital in his hometown, Abidjan, through his own foundation. He decided to do it after visiting other hospitals there. In 2007 the United Nations made him a Goodwill Ambassador, and in 2010 Time magazine named him one of the world’s 100 most influential people.'},
  ],
  exhibits:['worldcup-1930'],
  sourceNotes:'“In 1999 … his son Isaac was born” (chapter 4): English Wikipedia says 1999, French Wikipedia says Isaac was born in 2000; the page tells of Isaac’s birth without a year. The 1999 professional contract is in both articles.',
 };
export default page;
