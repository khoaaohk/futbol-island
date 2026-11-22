import type {BookPageSpec} from './types';
/* Griezmann sources checked Nov 21 2026 against the sources the book lists. Every fact on this page is in the book.
 * The Barcelona "too small" claim is single-source and left out, as in the book. */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Griezmann: Too small for France? is a free six-chapter pop-up story for kids about Antoine Griezmann, the boy from Mâcon whom French academies turned down because he was small. A Real Sociedad scout saw him in 2005, and he crossed into Spain to train every evening. He was the top scorer at Euro 2016, lost that final at home, and became a world champion in 2018. The story teaches that size is not everything.',
  facts:[
   {icon:'tag',label:'Country',value:'France'},
   {icon:'clock',label:'Grew up',value:'Mâcon, France'},
   {icon:'steps',label:'Youth team',value:'Real Sociedad, Spain'},
   {icon:'cards',label:'Euro 2016',value:'Top scorer, six goals'},
   {icon:'shirt',label:'World champion',value:'2018'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why did French clubs turn down Antoine Griezmann?',a:'Antoine had trials at several professional clubs in France, including Lyon, Auxerre, Saint-Étienne and Sochaux, and again and again they said no. They were not sure about him because he was so small, and some coaches worried he would not be strong enough.'},
   {q:'How did Antoine Griezmann get to Real Sociedad?',a:'In 2005, during a trial with Montpellier, he played in a friendly match. Éric Olhats, a scout for Real Sociedad, was watching and liked his technique. He invited Antoine for a week’s trial in San Sebastián, it was extended to a second week, and then Real Sociedad offered him a place in their youth team.'},
   {q:'Where did Antoine Griezmann live as a teenager?',a:'He lived with Éric Olhats in Bayonne, a French town near the Spanish border, and went to school there. In the evenings he crossed into Spain to train with Real Sociedad.'},
   {q:'What happened to Antoine Griezmann at Euro 2016?',a:'Euro 2016 was held in France. Antoine was the top scorer, with six goals, and was named the best player of the tournament. But in the final, France lost 1–0 to Portugal.'},
   {q:'What did Antoine Griezmann do in the 2018 World Cup final?',a:'At the 2018 World Cup final, France beat Croatia 4–2. Antoine scored a penalty and was named player of the match. It was France’s second World Cup win. He stopped playing for France in 2024.'},
  ],
  sourceNotes:'Left out on purpose (docs/player-books/NEW-20-NOV21.md): the single-source claim that Barcelona also found him too small.',
 };
export default page;
