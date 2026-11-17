import type {BookPageSpec} from './types';
/* Mané sources checked Nov 17 2026 against the English Wikipedia article the book lists (Sadio Mané), with French Wikipedia
 * as a second check. Every fact on this page is in the book and in those articles. The book does not name his position, so
 * the page does not either. Leaving home at fifteen is told gently, with the book’s own advice to tell a trusted grown-up
 * (see sourceNotes). */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Mané: Leaving the village is a free six-chapter pop-up story for kids about Sadio Mané, who was born in Bambali, a village in Senegal, and left home at fifteen to follow his football dream in Dakar. He missed penalties for Senegal, then scored the winning kick when Senegal won the Africa Cup of Nations for the first time. The story teaches that a miss is not the end of the story.',
  facts:[
   {icon:'tag',label:'Country',value:'Senegal'},
   {icon:'clock',label:'Born',value:'1992, Bambali'},
   {icon:'steps',label:'Left home',value:'At fifteen, for Dakar'},
   {icon:'shirt',label:'First club in Europe',value:'Metz, France, in 2011'},
   {icon:'cards',label:'Africa Cup of Nations',value:'Winner with Senegal, 2021'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why couldn’t Sadio Mané play football as a boy?',a:'Sadio was born in 1992 in Bambali, a village in Senegal. His parents came from Guinea, and he grew up in a religious family. More than anything, he wished to play football. But his father, an imam, did not allow him to play, because he wanted Sadio to put his religious studies first. When Sadio was seven years old, his father died.'},
   {q:'How did Sadio Mané get to Dakar?',a:'When he was fifteen, Sadio left his home village with the help of a childhood friend, Luc Djiboune, and went to Dakar, the capital city of Senegal. He did not tell anyone first. From that time on, his family supported him in following his dream. The book’s advice: big dreams need courage, and you should always share your plans with a grown-up you trust.'},
   {q:'How was Sadio Mané discovered?',a:'In 2009, when Sadio was playing in the town of M’Bour, scouts spotted him and sent him to a club called Génération Foot. In the 2010–11 season, he helped them win promotion to the second division. In 2011 he moved to Metz in France. In 2012 he moved to Salzburg in Austria, where he won the league and the cup, and in 2014 he went to Southampton in England.'},
   {q:'Did Sadio Mané miss penalties?',a:'Yes. At the 2017 Africa Cup of Nations, the quarter-final against Cameroon went to a penalty shoot-out. Sadio missed his penalty, and Senegal were knocked out. At the 2019 tournament, he missed two penalties in earlier games. Senegal reached the final but lost 1–0 to Algeria. Even so, Sadio was named in the Team of the Tournament.'},
   {q:'How did Senegal win the Africa Cup of Nations?',a:'At the 2021 Africa Cup of Nations, Senegal played Egypt in the final. In the seventh minute, Sadio took a penalty, and the goalkeeper saved it. The final went to a penalty shoot-out, and Sadio stepped up again. He scored the winning kick, and Senegal won the cup for the first time. Sadio has also given money to build a school and a hospital in Bambali.'},
  ],
  exhibits:['penalty-1891'],
  sourceNotes:'Leaving the village (chapter 2): French Wikipedia quotes Mané saying he ran away to Dakar without anyone knowing, and that a week later his family found him and brought him back, before he persuaded them to let him go; English Wikipedia and the book say only that from then on his family supported him. The page keeps the book’s version and its advice to tell a trusted grown-up, and adds nothing about the return home.',
 };
export default page;
