import type {BookPageSpec} from './types';
/* Eriksen sources checked Nov 17 2026 against the two English Wikipedia articles the book lists (Christian Eriksen, UEFA
 * President’s Award), with Danish Wikipedia as a second check. Every fact on this page is in the book and in those articles.
 * The book does not name his position, so the page does not either. The page says nothing about his health today (see sourceNotes). */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Eriksen: A team around you is a free six-chapter pop-up story for kids about Christian Eriksen, whose heart stopped beating properly during a Denmark match at Euro 2020. His teammates stood around him while the medical team saved his life, and eight months later he played football again. The story teaches that nobody gets through hard times alone.',
  facts:[
   {icon:'tag',label:'Country',value:'Denmark'},
   {icon:'clock',label:'The match',value:'Denmark v Finland, 12 June 2021'},
   {icon:'cards',label:'First aid',value:'CPR and a defibrillator'},
   {icon:'steps',label:'Way back',value:'Trained at OB, then signed for Brentford'},
   {icon:'shirt',label:'Denmark record',value:'Most games for Denmark, 133 at Euro 2024'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'What happened to Christian Eriksen at Euro 2020?',a:'On 12 June 2021, Denmark played Finland in Copenhagen. Just before half-time, Christian Eriksen was about to receive a throw-in when he suddenly fell to the ground. His heart had stopped beating properly. This is called a cardiac arrest, and it is very rare.'},
   {q:'How did his teammates help him?',a:'His captain, Simon Kjær, turned him onto his side straight away. While the doctors worked, the Denmark players stood in a circle around him, with their backs to the cameras, so that he had some privacy. Kjær also comforted Eriksen’s partner and helped his teammates support each other.'},
   {q:'What is a defibrillator?',a:'A defibrillator is a machine that can help a heart find its beat again. The medical team used one on the pitch, and they gave Eriksen CPR, which means pressing on the chest to keep blood moving. Their quick work saved his life. Later in 2021, UEFA gave its President’s Award to Kjær and to Denmark’s medical staff.'},
   {q:'Why did Eriksen have to leave Inter Milan?',a:'In hospital, doctors fitted him with an ICD, a small device inside the body that watches the heartbeat. In Italy, the rules did not allow players with an ICD to play, so in December 2021 Inter ended his contract. He trained on his own at OB, his old youth club in Denmark, then signed for Brentford in England.'},
   {q:'Did Eriksen play for Denmark again?',a:'Yes. In March 2022 he played for Denmark again and scored two minutes after coming on. He then joined Manchester United, where he won the League Cup and the FA Cup. At Euro 2024 he scored in Denmark’s first match, and he became the most-capped player in Denmark’s history, with 133 games.'},
  ],
  exhibits:['hall-of-fame'],
  sourceNotes:'English Wikipedia (read Nov 17 2026) also reports a second on-field collapse, in a friendly against Ukraine on 7 June 2026. The book does not tell it, so the page leaves it out and makes no claim about his health today. Wikipedia now gives him more than 150 caps; the page ties “133 games” to Euro 2024, as the book does. The 2021 President’s Award went to the captain and the medical and coaching staff; the page names Kjær and the medical staff, as the book does. “Stable and awake”: Wikipedia says “stabilized and awake”; the page leaves it out.',
 };
export default page;
