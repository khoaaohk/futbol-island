import type {BookPageSpec} from './types';
/* Baggio sources checked Nov 21 2026 against the sources the book lists. Every fact on this page is in the book. The 220 stitches belong to
 * the second knee operation (after the September 1986 relapse); that Fiorentina paid for the operation is not confirmed, so the book only
 * says they kept their promise and waited for him. */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Baggio: After the missed penalty is a free six-chapter pop-up story for kids about Roberto Baggio, who badly hurt his knee at eighteen, just before his move to Fiorentina, and needed a long recovery. He became the best player in the world in 1993, carried Italy to the 1994 World Cup final, then missed the last penalty of the shootout. The story teaches that a miss is a moment, not who you are.',
  facts:[
   {icon:'tag',label:'Country',value:'Italy'},
   {icon:'clock',label:'Knee injury',value:'At 18, May 1985'},
   {icon:'cards',label:'Ballon d’Or',value:'1993, and FIFA World Player'},
   {icon:'steps',label:'1994 World Cup',value:'5 goals in the knockout rounds'},
   {icon:'shirt',label:'Serie A goals',value:'205'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'How did Roberto Baggio hurt his knee?',a:'On 5 May 1985, when he was eighteen, Roberto Baggio badly hurt his knee in a match, just two days before his move to Fiorentina was finished. Some doctors feared he might never play again, but Fiorentina kept their promise and signed him anyway.'},
   {q:'How long did Roberto Baggio take to recover?',a:'A long time. He needed a second operation on his knee, with 220 stitches, lost a lot of weight and missed most of a season. He kept working, and slowly his knee grew strong enough to play. Knee problems came back later, and each time he worked his way back.'},
   {q:'Was Roberto Baggio the best player in the world?',a:'In 1993 he won the Ballon d’Or, and FIFA named him the World Player of the Year. At the 1990 World Cup in Italy he had scored a brilliant goal against Czechoslovakia.'},
   {q:'What happened to Roberto Baggio in the 1994 World Cup final?',a:'He scored five goals in the knockout rounds to help Italy reach the final against Brazil, even with a sore hamstring. The final ended without a goal, and in the penalty shootout Roberto took Italy’s last penalty, which went over the crossbar. Brazil became world champions.'},
   {q:'What did Roberto Baggio do after 1994?',a:'He kept playing: he went to the 1998 World Cup and captained Brescia from 2000 to 2004, and he scored 205 goals in Serie A. In 2002 he became a Goodwill Ambassador for the United Nations in the fight against hunger, and in 2010 he won the Man of Peace award.'},
  ],
  sourceNotes:'Left out on purpose (docs/player-books/NEW-20-NOV21.md): the 1998 penalty against Chile (not verified) and his religion. Changed before narration: “helped pay for his operation” (not confirmed) became “kept their promise and signed him anyway”.',
 };
export default page;
