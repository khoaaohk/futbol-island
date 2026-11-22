import type {BookPageSpec} from './types';
/* Čech sources checked Nov 21 2026 against the sources the book lists. Every fact on this page is in the book. "Joined Chelsea
 * in 2004" was confirmed (agreed with Rennes in February 2004, contract from July 2004). The injury itself is never described:
 * only that his head was badly hurt, the safety lesson and his return in a headguard. */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Čech: The keeper in the headguard is a free six-chapter pop-up story for kids about Petr Čech, who became a goalkeeper after breaking his leg at ten, set a Premier League record of 1,025 minutes without letting in a goal and came back from a serious head injury wearing a padded headguard. He won the 2012 Champions League with three penalty saves. The story teaches that head injuries are serious and protective gear is smart.',
  facts:[
   {icon:'tag',label:'Country',value:'Czech Republic'},
   {icon:'steps',label:'Became a keeper',value:'At ten, after a broken leg'},
   {icon:'clock',label:'Back in a headguard',value:'20 January 2007'},
   {icon:'cards',label:'Champions League',value:'2012, three penalties saved'},
   {icon:'shirt',label:'Premier League clean sheets',value:'202, a record'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why did Petr Čech become a goalkeeper?',a:'Petr Čech was born in 1982 in Plzeň and started playing at seven, for Škoda Plzeň, as a striker. When he was ten he broke his leg. After it healed he switched to playing in goal, and he loved it.'},
   {q:'What record did Petr Čech set at Chelsea?',a:'He joined Chelsea in 2004. In March 2005 he set a Premier League record of 1,025 minutes without letting in a goal, more than eleven whole matches, and Chelsea won the league that season. He also holds the record for the most Premier League clean sheets: 202.'},
   {q:'Why did Petr Čech wear a headguard?',a:'On 14 October 2006, in a match at Reading, he and another player collided and his head was badly hurt. He needed about three months to heal. When he came back on 20 January 2007, against Liverpool, he wore a padded headguard, first made by a company that makes rugby kit, and he wore one for the rest of his career. It is now in Chelsea’s museum.'},
   {q:'What should you do if you bump your head playing football?',a:'Always stop and tell a grown-up, like your coach or a parent. Head injuries are serious, and taking time to recover properly is the right thing to do. Protective gear is smart, not silly.'},
   {q:'What did Petr Čech do after football?',a:'He stopped playing football in 2019. Then he became an ice hockey goalkeeper, and he also plays the drums in a band. He keeps trying new things.'},
  ],
  sourceNotes:'Left out on purpose (docs/player-books/NEW-20-NOV21.md): how the injury happened and any medical detail. The page keeps to the safety lesson: stop and tell a grown-up.',
 };
export default page;
