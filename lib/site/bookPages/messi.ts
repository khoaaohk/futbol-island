import type {BookPageSpec} from './types';
/* Messi sources checked Nov 17 2026 against Wikipedia (Lionel Messi, 2014 FIFA World Cup final, 2021 Copa América final,
 * 2022 FIFA World Cup final); the FIFA and CONMEBOL pages the book lists were not opened. Every fact on this page is in the
 * book and in those articles. The book does not give his birth year or position, so the page does not either. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Messi: Keep going, together is a free six-chapter pop-up story for kids about Lionel Messi, who grew up in Rosario, Argentina, needed treatment to help him grow and moved to Barcelona at thirteen. He lost three finals in three years with Argentina, then won the Copa América in 2021 and the World Cup in 2022. The story teaches that a setback is not the end of your story.',
  facts:[
   {icon:'tag',label:'Country',value:'Argentina'},
   {icon:'clock',label:'Grew up',value:'Rosario, Argentina'},
   {icon:'steps',label:'New home',value:'Barcelona, from age 13'},
   {icon:'shirt',label:'Finals lost',value:'2014, 2015 and 2016'},
   {icon:'cards',label:'Won with Argentina',value:'Copa América 2021, World Cup 2022'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why does Messi point to the sky when he scores?',a:'His grandmother Celia went with him to training and matches. She died shortly before his eleventh birthday. Ever since, when he scores, Messi looks up and points to the sky for her.'},
   {q:'Why did Messi need treatment to grow?',a:'When Messi was ten, doctors found that he had a growth hormone deficiency. At eleven he began treatment to help him grow, but his father’s health insurance paid for only two years of it. He finished his treatment at fourteen, in Barcelona.'},
   {q:'What was it like for Messi to move to Barcelona?',a:'Messi moved from Rosario to Barcelona at thirteen. In his first year he could rarely play matches, and he was so quiet that some teammates thought he could not speak. When his mother, brothers and sister moved back to Rosario, he stayed with his father and felt homesick. In 2002 he could play in every competition, and he made friends, including Cesc Fàbregas and Gerard Piqué.'},
   {q:'Why did Messi stop playing for Argentina?',a:'Argentina lost the World Cup final to Germany in 2014, then the Copa América final in 2015 and again in 2016. After three lost finals in three years, Messi said he would stop playing for his national team. A campaign across Argentina, and a statue of him in Buenos Aires, helped convince him to come back.'},
   {q:'When did Messi win the World Cup?',a:'In 2022. The final against France ended 3–3 after extra time, with two goals from Messi, and Argentina won the penalty shootout 4–2. A year before, in 2021, Argentina won the Copa América, the team’s first big trophy in 28 years.'},
  ],
  exhibits:['copa-america-1916','worldcup-1930'],
 };
export default page;
