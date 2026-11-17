import type {BookPageSpec} from './types';
/* Ronaldo sources checked Nov 17 2026 against Wikipedia (the book's only source): every fact on this page is in the book and in that
 * article. The book does not give his position, so the page does not either; it says "a tendon in his knee", and so does the page. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Ronaldo: Back from two knee injuries is a free six-chapter pop-up story for kids about Ronaldo Nazário, the Brazilian footballer whose knee gave way twice and who missed a whole season. Step by step he got better, and at the 2002 World Cup he scored eight goals, two of them in the final. The story teaches that getting better takes time, and a setback is not the end of your story.',
  facts:[
   {icon:'tag',label:'Country',value:'Brazil'},
   {icon:'clock',label:'Born',value:'1976; grew up in Rio de Janeiro'},
   {icon:'shirt',label:'First love',value:'Futsal: 166 goals in a season',href:'/learn/futsal-for-kids'},
   {icon:'cards',label:'World Cups won',value:'1994 and 2002'},
   {icon:'steps',label:'2002 World Cup',value:'8 goals, 2 in the final'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why did Flamengo turn Ronaldo down?',a:'Ronaldo supported Flamengo, but the bus ride to their practice took an hour and he could not afford the fare. He missed practice, and Flamengo turned him down. Jairzinho, a former Brazil player who coached the small club São Cristóvão, had seen how good Ronaldo was, and he helped him move to the club Cruzeiro.'},
   {q:'What happened to Ronaldo at the 1998 World Cup final?',a:'Hours before the final against France, Ronaldo suddenly became very ill. He was taken off the team sheet, but he said he felt fine and asked to play, so the coach put him back in. He did not play like himself, and Brazil lost 3–0. He was still named the best player of the tournament.'},
   {q:'How did Ronaldo hurt his knee?',a:'In November 1999, playing for Inter Milan against Lecce, his knee buckled. A tendon in his knee was torn, and he needed an operation. On 12 April 2000 he came back, and after only six minutes his knee gave way again, even worse than before.'},
   {q:'How did Ronaldo get better?',a:'He had two operations, then rehabilitation: months of exercises that help a body heal. A French surgeon, Gérard Saillant, operated on his knee. Ronaldo missed the whole 2000 to 2001 season. He said he used to picture the World Cup trophy in front of his eyes, and imagine holding it up.'},
   {q:'What did Ronaldo do in the 2002 World Cup final?',a:'He scored twice against Germany in Yokohama, Japan, and Brazil won 2–0. Then he was the first player to go and comfort the German players. His surgeon was in the crowd as his guest, and Ronaldo later dedicated his World Player of the Year award to the medical team who helped him recover.'},
  ],
  exhibits:['futsal-1989','worldcup-1930'],
  sourceNotes:'Wikipedia names the injury two ways (club section: ruptured knee tendon, then the knee-cap tendons; 2002 section: the cruciate ligament in his right knee); the book and page say only “a tendon in his knee”. Wikipedia puts Jairzinho and São Cristóvão before the Flamengo rejection; the book tells Flamengo first without saying it came first.',
 };
export default page;
