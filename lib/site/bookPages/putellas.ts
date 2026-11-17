import type {BookPageSpec} from './types';
/* Putellas sources checked Nov 17 2026 against the English Wikipedia article the book lists (Alexia Putellas); Spanish Wikipedia
 * was a second check. Every fact on this page is in the book and in the English article. The book does not name her position,
 * so the page does not either. One sentence of the book is kept off the page (see sourceNotes). */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Putellas: For my father is a free six-chapter pop-up story for kids about Alexia Putellas, who grew up near Barcelona, had to leave Barcelona’s girls’ team when there was no team for her age, and lost her father in 2012. She came back to Barcelona, won the Ballon d’Or in 2021 and dedicated it to him. The story teaches that a closed door is not the end, and that the people we love stay with us.',
  facts:[
   {icon:'tag',label:'Country',value:'Spain'},
   {icon:'clock',label:'Born',value:'1994, Mollet del Vallès'},
   {icon:'shirt',label:'First girls’ team',value:'Sabadell, at seven'},
   {icon:'steps',label:'Back at Barcelona',value:'Signed on 10 July 2012'},
   {icon:'cards',label:'Ballon d’Or',value:'Won in 2021'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why does Alexia Putellas point to the sky?',a:'For her father. She often travelled with him to watch Barcelona play at the Camp Nou. Later, when she played for Levante in Valencia, he was ill with heart problems, but he still travelled to watch her again and again. In 2012, just before a big youth tournament with Spain, he died. When she scores, Alexia often points her fingers to the sky for him.'},
   {q:'Why did Alexia have to leave Barcelona as a girl?',a:'In 2005 she joined a Barcelona girls’ youth team, and they won their league. The next year the club changed its girls’ teams, and there was no team left for her age group. At twelve she joined Espanyol, the other club in Barcelona, with many other girls who had to leave. At sixteen she played for Espanyol’s first team.'},
   {q:'Could girls play football easily when Alexia was young?',a:'Not always. Alexia loved playing football at school, but back then she did not believe a girl could make football her job. Her mother let her join a team only if she stopped playing at school. Alexia later said this showed how society was unfair to girls who played football.'},
   {q:'When did Alexia Putellas win the Ballon d’Or?',a:'In 2021. She dedicated it to her father and thanked her teammates. One of her tattoos shows her father holding her as a baby, and handing her a football.'},
   {q:'What happened to Alexia’s knee?',a:'On 5 July 2022, the day before the European Championship began, she badly hurt her left knee in training. She needed an operation and almost a year to recover, and she watched Spain’s first match from the stands. While she healed, she began planning a way to help girls play football, which became her Eleven Foundation. In 2023 she played again, and she came on in the World Cup final as Spain won.'},
  ],
  exhibits:['ballon-dor','wwc-1991'],
  sourceNotes:'“She said her family always accepted her dreams” (chapter 1): not found in English or Spanish Wikipedia; left off the page.',
 };
export default page;
