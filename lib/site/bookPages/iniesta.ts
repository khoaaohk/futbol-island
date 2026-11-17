import type {BookPageSpec} from './types';
/* Iniesta sources checked Nov 17 2026 against the English Wikipedia article the book lists (Andrés Iniesta). Every fact on this
 * page is in the book and in that article. The book does not give his birth year or position, so the page does not either. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Iniesta: It’s okay to ask for help is a free six-chapter pop-up story for kids about Andrés Iniesta, who left his small village in Spain for Barcelona’s La Masia academy and missed home. After his friend Dani Jarque died, he felt very low and asked for help, and in 2010 he scored the winning goal in the World Cup final. The story teaches that missing home is not weakness, and that asking for help is brave.',
  facts:[
   {icon:'tag',label:'Country',value:'Spain'},
   {icon:'clock',label:'Grew up',value:'Fuentealbilla, a small village'},
   {icon:'steps',label:'Academy',value:'La Masia, Barcelona, from age 12'},
   {icon:'shirt',label:'Youth cup',value:'Nike Premier Cup 1999, as captain'},
   {icon:'cards',label:'World Cup final',value:'2010, the winning goal'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Where did Iniesta learn to play?',a:'In Fuentealbilla, a small village in Spain. There were no proper football pitches there, so he mostly played futsal, a small-sided game on a hard court. At twelve, playing for Albacete in a seven-a-side tournament, he was noticed by scouts. His parents knew a Barcelona youth coach, Enrique Orizaola, and after the family visited La Masia, they decided he would go.'},
   {q:'Was Iniesta homesick at La Masia?',a:'Yes. He later said he cried rivers on the day he left for La Masia, the farmhouse where Barcelona’s young players live. He found it very hard to be apart from his parents. He was very shy and kept to himself, but he stayed and kept training.'},
   {q:'What did Pep Guardiola say about Iniesta?',a:'Soon after Andrés arrived, Barcelona’s first-team captain, Pep Guardiola, told his teammate Xavi that this boy would one day take all their places. In 1999 Andrés was captain of Barcelona’s under-15 team at the Nike Premier Cup. He scored the winning goal in the last minute of the final and was named the best player of the tournament.'},
   {q:'Why did Iniesta see a psychologist?',a:'On 8 August 2009 his close friend Dani Jarque, the captain of Espanyol, died. For a long time Andrés felt very low, and some days he could not finish training, even when his body was fit. He asked for help, including from a psychologist, Inma Puig. In 2018 he said in an interview that he had suffered from depression before the 2010 World Cup.'},
   {q:'What did Iniesta’s shirt say in the 2010 World Cup final?',a:'Spain played the Netherlands, and Andrés scored the winning goal. He pulled up his shirt to show a message on the shirt underneath: Dani Jarque, always with us. Later, even the fans at Espanyol, Barcelona’s local rivals, stood and clapped for him because of his friendship with Dani.'},
  ],
  exhibits:['futsal-1989','worldcup-1930'],
 };
export default page;
