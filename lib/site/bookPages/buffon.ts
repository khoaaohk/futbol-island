import type {BookPageSpec} from './types';
/* Buffon sources checked Nov 17 2026 against the English Wikipedia article the book lists (Gianluigi Buffon), with Italian
 * Wikipedia as a second check. Every fact on this page is in the book and in those articles. The book names him a goalkeeper,
 * so the page links the goalkeeper guide. See sourceNotes for one date. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Buffon: Strong enough to talk is a free six-chapter pop-up story for kids about Gianluigi Buffon, one of the best goalkeepers in the world, who had depression in 2003 and 2004. He went to see a psychologist, got better, and won the World Cup with Italy in 2006. The story teaches that asking for help is strong, and that talking about feelings is brave.',
  facts:[
   {icon:'tag',label:'Country',value:'Italy'},
   {icon:'shirt',label:'Position',value:'Goalkeeper',href:'/learn/soccer-positions/goalkeeper'},
   {icon:'steps',label:'Club',value:'Juventus'},
   {icon:'cards',label:'World Cup',value:'Winner with Italy, 2006'},
   {icon:'clock',label:'His books',value:'Numero 1 (2008) and a second book (2024)'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'What is depression?',a:'Depression is an illness of the mind. It can make someone feel sad, tired or empty for a long time, even when everything looks fine from the outside. Gianluigi Buffon had depression between December 2003 and June 2004, when he was one of the best goalkeepers in the world.'},
   {q:'How did Gianluigi Buffon get help?',a:'Between December 2003 and June 2004, he went regularly to see a psychologist. A psychologist is a person trained to help us understand our feelings, mostly by listening and talking. It took time and patience. By the summer of 2004, before the European Championship, he had overcome his depression.'},
   {q:'What happened after Buffon felt better?',a:'He played in every one of Italy’s matches at Euro 2004. At the 2006 World Cup he let in only two goals in seven matches and kept five clean sheets. Italy won the World Cup, and he was named the best goalkeeper of the tournament.'},
   {q:'Why did Buffon play in Serie B?',a:'In 2006, Juventus were punished because of a scandal called Calciopoli and sent down to Serie B, the second division of Italian football. Buffon decided to stay with his team. He played 37 matches in Serie B, and Juventus won the title and went straight back up to Serie A.'},
   {q:'How did Buffon talk about his depression?',a:'In 2008 he wrote a book about his life, called Numero 1, and told everyone about his depression. He spoke about it openly in interviews in 2013 and again in 2019. He said he had also had panic attacks in his early years at Juventus. In 2024 he wrote a second book. Its title means: fall, get back up again, fall, get back up again.'},
  ],
  exhibits:['keeper-hands-1912','worldcup-1930'],
  sourceNotes:'“In 2008 … Numero 1”: the Wikipedia bibliography lists the book as Rizzoli 2007, but its text and Italian Wikipedia give the release as 14 November 2008; the page says 2008, as the book does.',
 };
export default page;
