import type {BookPageSpec} from './types';
/* Marta sources checked Nov 17 2026 against Wikipedia (the Britannica page answered HTTP 403 from here): every fact on this page is
 * there except the book's "about three days by bus" to Rio de Janeiro, which Wikipedia (English and Portuguese) does not state,
 * so the page leaves it out; the story text keeps the book's words (owner to confirm). */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Marta: A place to belong is a free six-chapter pop-up story for kids about Marta, the Brazilian footballer who learned the game in the streets with the boys and left home at fourteen to play. She lost big finals, came back from a knee injury, and has scored more World Cup goals than any other player, woman or man. The story teaches that you belong in the game.',
  facts:[
   {icon:'tag',label:'Country',value:'Brazil'},
   {icon:'clock',label:'Born',value:'1986, Dois Riachos'},
   {icon:'steps',label:'Left home',value:'At 14, for Vasco da Gama'},
   {icon:'cards',label:'World Cup goals',value:'17, the most ever'},
   {icon:'shirt',label:'2007 World Cup',value:'Golden Ball and Golden Boot'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Where did Marta learn to play football?',a:'In the streets of Dois Riachos, a small town in north-east Brazil, where she played with the boys. Her father left the family while she was a baby. Her mother is Tereza, and Marta has three siblings.'},
   {q:'How old was Marta when she left home?',a:'Fourteen. A coach called Helena Pacheco saw how talented she was, and Marta left her family to play for Vasco da Gama in Rio de Janeiro. Two years later that team folded. Marta kept going, and in 2004 she moved to Umeå IK in Sweden, learned Swedish and helped Umeå win the UEFA Women’s Cup in her first season.'},
   {q:'How many World Cup goals has Marta scored?',a:'Seventeen, by the 2019 World Cup. No player, woman or man, has scored more goals at World Cups. At the 2007 World Cup she won the Golden Ball as the best player and the Golden Boot as the top scorer, with seven goals, even though Brazil lost the final 2–0 to Germany.'},
   {q:'What did Marta mean by “cry at the beginning so you can smile at the end”?',a:'In 2019, after Brazil were knocked out of the World Cup by France, Marta spoke to the television cameras. She asked Brazilian girls to carry on women’s football and to value it more, and to cry at the beginning so they can smile at the end.'},
   {q:'How did Marta come back from her knee injury?',a:'In March 2022, playing for the Orlando Pride, Marta tore a ligament in her left knee. She needed an operation, and her season was over. In 2023 she came back and played eighteen games. In 2024 she helped the Orlando Pride win the NWSL Championship, the first NWSL title of her career.'},
  ],
  exhibits:['wwc-1991'],
  sourceNotes:'Not confirmed: “travelled for about three days by bus to Rio de Janeiro, to try out for Vasco da Gama” (chapter 2). Wikipedia says only that Helena Pacheco discovered her at 14 and that she started at Vasco da Gama in 2000; Britannica (the book’s second source) could not be opened (HTTP 403). The page says she left home to play for Vasco and leaves out the bus and the trial.',
 };
export default page;
