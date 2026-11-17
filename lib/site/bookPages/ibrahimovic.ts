import type {BookPageSpec} from './types';
/* Ibrahimović sources checked Nov 17 2026 against the two English Wikipedia articles the book lists (Zlatan Ibrahimović,
 * Rosengård), with Swedish Wikipedia as a second check. Every fact on this page is in the book and in those articles. The book
 * does not name his position, so the page does not either. Two details are kept off the page (see sourceNotes). */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Ibrahimović: Different is strong is a free six-chapter pop-up story for kids about Zlatan Ibrahimović, who grew up in Rosengård, in Malmö, Sweden, where many families had come from other countries. He often went hungry, felt he did not fit in, and nearly gave up football at fifteen. Later he paid for a new pitch in Rosengård. The story teaches that being different can be a strength.',
  facts:[
   {icon:'tag',label:'Country',value:'Sweden'},
   {icon:'clock',label:'Born',value:'1981, Malmö'},
   {icon:'steps',label:'Grew up',value:'Rosengård, Malmö'},
   {icon:'shirt',label:'Early club',value:'FBK Balkan'},
   {icon:'cards',label:'Gift to Rosengård',value:'Zlatan Court, 2007'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Where did Zlatan Ibrahimović grow up?',a:'Zlatan was born in 1981 in Malmö, Sweden. His father was a Bosniak and his mother was a Croat, and both had moved to Sweden, where they met. He grew up in Rosengård, a part of Malmö where many families had come from other countries. At six he got a pair of football boots and began to play.'},
   {q:'Why did Zlatan run to his mum’s home for dinner?',a:'His parents were divorced, and his mum had five children to look after. When he was nine, Zlatan went to live with his father. There often was not much food at his dad’s home, and Zlatan often went hungry, so he would run to his mum’s home for dinner.'},
   {q:'Did Zlatan almost give up football?',a:'Yes. At fifteen, while he played for his hometown club Malmö FF, he nearly gave up football and thought about taking a job at the Port of Malmö. His manager convinced him to keep playing. In 1999 he moved up to Malmö’s first team, and in 2001 he joined Ajax in the Netherlands.'},
   {q:'What is Zlatan Court?',a:'In late 2007, Zlatan paid for a new football pitch in the streets of Rosengård, with help from a sports company. It was called Zlatan Court, and it had a playing mat, goalposts, lights and a new fence. The next year he gave new kits to his old youth club, FBK Balkan.'},
   {q:'How did Zlatan come back from his knee injury?',a:'On 20 April 2017, playing for Manchester United, he badly hurt the ligaments in his right knee. He was thirty-five. He worked hard to recover and came back on 18 November 2017. At thirty-nine he became the oldest player from outside Italy to score in Serie A, and at forty he won the Italian league with AC Milan.'},
  ],
  exhibits:['boots'],
  sourceNotes:'Taekwondo “as a boy” (chapter 3): English Wikipedia says as a child, Swedish Wikipedia says from age 14 to 17; left off the page. Swedish Wikipedia says he started playing at five (Malmö BI), English says six, after he got boots; the page follows the book and English Wikipedia. “Grew up in Rosengård” is stated by Swedish Wikipedia; English Wikipedia only implies it.',
 };
export default page;
