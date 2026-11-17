import type {BookPageSpec} from './types';
/* De Bruyne sources checked Nov 17 2026 against the English and Dutch Wikipedia articles the book lists (Kevin De Bruyne).
 * Every fact on this page is in the book and in those articles. The book does not name his position, so the page does not
 * either. One detail is worded carefully (see sourceNotes). */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'De Bruyne: Not wanted, not finished is a free six-chapter pop-up story for kids about Kevin De Bruyne, who left home at fourteen to join Genk’s youth academy in Belgium, and whose host family did not want him to stay. Later he was left on the bench at Chelsea, moved to Wolfsburg, and won the Champions League with Manchester City. The story teaches that other people’s opinions do not decide your future.',
  facts:[
   {icon:'tag',label:'Country',value:'Belgium'},
   {icon:'clock',label:'Grew up',value:'Drongen, Belgium'},
   {icon:'steps',label:'Youth academy',value:'Genk, from age 14'},
   {icon:'cards',label:'Bundesliga record',value:'21 assists in one season'},
   {icon:'shirt',label:'Manchester City',value:'Ten seasons, from 2015'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why did Kevin De Bruyne leave home at fourteen?',a:'Kevin grew up in Drongen, in Belgium. When he was fourteen, he left home to join the youth academy of the club Genk, in another part of the country. For his first year he lived in a boarding house. Then he went to live with a host family, a family who looks after a young player.'},
   {q:'What happened with his host family?',a:'After one season, the host family did not want Kevin to stay any longer. They thought he was too quiet, too shy with people and too stubborn. At sixteen he had to move out, into another boarding house. It was a very hard time for him.'},
   {q:'How did Kevin pick himself up?',a:'He trained harder than before. Once, coming on as a substitute for Genk’s second team, he scored five goals in just one half. He later said the hard time with the host family was a lesson for life. In 2009 he played his first game for Genk’s first team, and in 2011 Genk became champions of Belgium.'},
   {q:'Why did Kevin leave Chelsea?',a:'He signed for Chelsea in 2012 and played well on loan at Werder Bremen in Germany. Back at Chelsea, he was mostly left on the bench, and the manager, José Mourinho, said he did not fit Chelsea’s style. Belgium’s coach told his players to play as much as they could for their clubs, so Kevin asked to leave. In January 2014 he joined Wolfsburg.'},
   {q:'What did Kevin De Bruyne win at Manchester City?',a:'In 2015, Manchester City paid a club record fee to sign him, and he stayed for ten seasons. He won the Champions League, six Premier League titles, five League Cups and two FA Cups. He also helped City become the only team to reach 100 points in a Premier League season.'},
  ],
  exhibits:['hall-of-fame'],
  sourceNotes:'“First he was loaned to Werder Bremen” (chapter 4): Dutch Wikipedia says Chelsea first loaned him straight back to Genk, then to Werder Bremen from August 2012; the page says only that he played well on loan at Bremen. “Drongen, near the city of Ghent”: English Wikipedia calls Drongen a sub-municipality of Ghent; the page says “Drongen, Belgium”. The second boarding house was, per Dutch Wikipedia, one for “more difficult children”; the book does not say so and neither does the page.',
 };
export default page;
