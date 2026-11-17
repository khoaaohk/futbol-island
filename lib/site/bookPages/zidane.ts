import type {BookPageSpec} from './types';
/* Zidane sources checked Nov 17 2026 against the English Wikipedia article the book lists (Zinedine Zidane). Every fact on this
 * page is in the book and in that article. The book does not name his position, so the page does not either. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Zidane: Two homes, one story is a free six-chapter pop-up story for kids about Zinedine Zidane, who was born in Marseille to parents from Kabylia, Algeria. He was sent off at the 1998 World Cup, came back, and scored two headers in the final as France won 3–0. The story teaches that a setback, or one bad moment, is not the end of your story.',
  facts:[
   {icon:'tag',label:'Country',value:'France'},
   {icon:'clock',label:'Born',value:'1972, Marseille'},
   {icon:'steps',label:'Family roots',value:'Kabylia, Algeria'},
   {icon:'shirt',label:'First club',value:'Cannes, from age 14'},
   {icon:'cards',label:'World Cup won',value:'1998, two goals in the final'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Where is Zidane’s family from?',a:'In 1953, his parents left their village in Kabylia, Algeria, and moved to Paris. In the 1960s they moved to La Castellane, a tough part of Marseille, and Zinedine was born there in 1972, the youngest of five children. He has said he is proud of being French, and proud of his family’s roots too.'},
   {q:'How did Zidane get to Cannes?',a:'When he was fourteen, a Cannes scout, Jean Varraud, spotted him at a training camp. He went to Cannes for six weeks and stayed for four years. At first he slept in a dormitory with twenty other young players. Then the club’s director, Jean-Claude Elineau, invited him to live with his own family, and Zidane later said that there he found balance.'},
   {q:'Was Zidane sent off at the 1998 World Cup?',a:'Yes. In France’s second match he was sent off for stamping on an opponent, the first French player ever shown a red card at a World Cup. His team won without him. When he came back, France reached the final against Brazil, Zidane scored two headers, and France won 3–0.'},
   {q:'Why did Zidane come back to the France team?',a:'He stopped playing for France in 2004, after Greece knocked them out of the European Championship. Then France struggled to qualify for the 2006 World Cup. The coach, Raymond Domenech, asked him to return, and in 2005 he came back as captain with Lilian Thuram and Claude Makélélé. France climbed from fourth place to the top of their group.'},
   {q:'What happened in the 2006 World Cup final?',a:'It was Zidane’s last match. He scored a penalty, but in extra time a player insulted his sister, and Zidane pushed his head into the player’s chest. He was sent off, and France lost on penalties. He later said twelve of his fourteen red cards came after someone provoked him, but that this was no excuse.'},
  ],
  exhibits:['worldcup-1930'],
 };
export default page;
