import type {BookPageSpec} from './types';
/* Pelé sources checked Nov 17 2026 against Wikipedia (the book's only source): every fact on this page is in the book and in that
 * article. The book does not give his position, so the page does not either. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Pelé: Making the most of what you have is a free six-chapter pop-up story for kids about Pelé, the Brazilian footballer who grew up poor in Bauru and learned to play with a sock stuffed with newspaper. He was hurt at World Cups and fouled again and again, and he still became the only player to win three World Cups. The story teaches you to make the most of what you have.',
  facts:[
   {icon:'tag',label:'Country',value:'Brazil'},
   {icon:'clock',label:'Born',value:'1940; grew up in Bauru'},
   {icon:'steps',label:'Club',value:'Santos, from 1956'},
   {icon:'cards',label:'World Cups won',value:'1958, 1962 and 1970'},
   {icon:'shirt',label:'Nickname',value:'O Rei, the King'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why did Pelé play with a sock?',a:'His family could not afford a proper ball. So Pelé usually played with a grapefruit, or with a sock stuffed with newspaper and tied up. His father, Dondinho, was a footballer, and he taught his son to play.'},
   {q:'How old was Pelé at his first World Cup?',a:'Seventeen. In 1958 he went to the World Cup in Sweden with a knee injury and sat out Brazil’s first two matches. A team psychologist said he was too childish to play, but the coach, Vicente Feola, played him anyway. Pelé scored in the quarter-final and the semi-final, then twice in the final, as Brazil beat Sweden 5–2.'},
   {q:'How many World Cups did Pelé win?',a:'Three: 1958, 1962 and 1970. He is the only player to win three World Cups. In 1962 he was hurt in Brazil’s second match and could not play again, but Brazil won, and in 2007 he was given his winner’s medal too. In the 1970 final he scored with a header, and Brazil beat Italy 4–1.'},
   {q:'What happened to Pelé at the 1966 World Cup?',a:'Players fouled him again and again, and he was hurt. Substitutes were not allowed then, so he limped on. Brazil went out, and Pelé said he would never play at a World Cup again. But when Brazil asked, he came back for 1970.'},
   {q:'Why was Pelé called O Rei?',a:'O Rei means the King, and people called Pelé that. The boy who grew up poor became a man who spoke up for poor people. He supported many children’s charities, and in 2018 he started the Pelé Foundation, to help with poverty and education around the world.'},
  ],
  exhibits:['telstar-1970','worldcup-1930'],
 };
export default page;
