import type {BookPageSpec} from './types';
/* Nadim sources checked Nov 17 2026 against English Wikipedia (Nadia Nadim) and two of the other pages the book lists
 * (UNRIC, Arab News), with Danish Wikipedia as a second check; the Olympics.com page timed out and was not read. Every fact
 * on this page is in the book and in those sources. The book does not name her position, so the page does not either.
 * The journey is told gently, in the book’s own words (see sourceNotes). */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Nadim: A long road to a new home is a free six-chapter pop-up story for kids about Nadia Nadim, who was born in Herat, Afghanistan, and came to Denmark as a refugee when she was about eleven. She first played football next to a refugee centre, became the first naturalised Dane to play for a Denmark senior team, and qualified as a doctor in 2022. The story teaches that you can be more than one thing.',
  facts:[
   {icon:'tag',label:'Country',value:'Denmark'},
   {icon:'clock',label:'Born',value:'1988, Herat, Afghanistan'},
   {icon:'steps',label:'First club',value:'A small club in Aalborg, at twelve'},
   {icon:'shirt',label:'First Denmark game',value:'2009, Algarve Cup'},
   {icon:'cards',label:'Doctor',value:'Qualified in January 2022'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why did Nadia Nadim’s family leave Afghanistan?',a:'Nadia was born in 1988 in Herat, a city in Afghanistan. When she was a young girl, her country was at war. Her father was an army general, and he was killed in the war. Her mother, Hamida, decided the family had to leave to stay safe. Nadia, her mother and her four sisters could only take what they could carry.'},
   {q:'How did Nadia come to Denmark?',a:'The family travelled first to Pakistan. Later they hid in the back of a truck for a long ride north. They hoped to reach the United Kingdom, where they had family, but the truck took them to Denmark instead. Nadia was about eleven. Denmark took the family in as refugees.'},
   {q:'Where did Nadia start playing football?',a:'The family was moved to a refugee centre near the city of Aalborg. Right next to it was a football club, and there Nadia saw girls playing football on the fields. She wanted to play too. She got training at the centre, and at twelve she joined a small local club in Aalborg.'},
   {q:'Why did Nadia have to wait to play for Denmark?',a:'Nadia became a Danish citizen in 2008, but a FIFA rule said she still had to wait. The Danish football association asked FIFA to look at her case again, and FIFA made an exception. In 2009 she played her first game for Denmark, at the Algarve Cup. She was the first naturalised Dane to play for a Denmark senior national team.'},
   {q:'Is Nadia Nadim a doctor?',a:'Yes. While she was still a professional footballer, Nadia studied medicine at Aarhus University, and kept studying during the football season. In January 2022 she qualified as a doctor. In 2019 UNESCO named her a champion for girls’ and women’s education.'},
  ],
  exhibits:['penalty-1891','hall-of-fame'],
  sourceNotes:'“From there they flew to Italy” (chapter 2): not confirmed in the sources read (Arab News says only that they flew from Islamabad and used fake passports to enter Europe); the page leaves Italy out. Her father: Wikipedia and UNRIC say he was executed by the Taliban; the page keeps the book’s gentler “killed in the war”. The UK: Arab News says England was the planned destination, Danish Wikipedia that her mother had family in London. Wikipedia also reports that her mother died in a road accident in 2022; the book does not tell it and neither does the page.',
 };
export default page;
