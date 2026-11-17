import type {BookPageSpec} from './types';
/* Modrić sources checked Nov 17 2026 against the English Wikipedia article the book lists (Luka Modrić). Every fact on this
 * page is in the book and in that article. The book does not name his position, so the page does not either. Two of the
 * book's wordings are kept off the page (see sourceNotes). */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Modrić: From refugee to Ballon d’Or is a free six-chapter pop-up story for kids about Luka Modrić, who grew up on the Velebit mountain in Croatia and lived in hotels in Zadar as a refugee during a war. A big club thought he was too young and too light, and he became the best player of the 2018 World Cup. The story teaches that hearing no is not the end, and that family and coaches can be your team.',
  facts:[
   {icon:'tag',label:'Country',value:'Croatia'},
   {icon:'clock',label:'Grew up',value:'Velebit mountain, near Zadar'},
   {icon:'steps',label:'Refugee home',value:'Hotels in Zadar'},
   {icon:'shirt',label:'Big move',value:'Dinamo Zagreb, at 16'},
   {icon:'cards',label:'2018 World Cup',value:'Best player of the tournament'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why was Luka Modrić a refugee?',a:'In 1991 a war came to the area where he lived, and his family had to leave their home. That December, his grandfather Luka was killed near the house, and later the house was burned down. For seven years the family lived in the Hotel Kolovare in Zadar, and later in the Hotel Iž. Luka mostly played football in the hotel’s parking lot.'},
   {q:'Who helped young Modrić?',a:'His family had very little money, but they paid for his sports academy, and sometimes his uncle helped. Tomislav Bašić, the head of the youth academy at NK Zadar, helped him too. Luka calls him his sporting father.'},
   {q:'Why did Hajduk Split not sign Modrić?',a:'The big club Hajduk Split thought he was too young and too light. Luka kept playing. Tomislav Bašić helped him move to Dinamo Zagreb at sixteen. In 2003 Dinamo loaned him to Zrinjski Mostar in Bosnia, a very tough league, and at eighteen he was its Player of the Year.'},
   {q:'Was Modrić called a lightweight?',a:'Yes. He moved to Tottenham Hotspur in England in 2008 and hurt his knee, and some newspapers, and even Arsenal’s manager, called him a lightweight. Luka later said critics push you forward to show them they are wrong. In 2009 he broke a bone in his right leg. When he came back, he scored in his first game, using the leg he had broken.'},
   {q:'What happened at the 2018 World Cup?',a:'Against Denmark, Luka’s penalty in extra time was saved. In the shoot-out he stepped up again and scored, and Croatia went through. Croatia reached the final and lost 4–2 to France, but Luka was named the best player of the tournament, and later won the Ballon d’Or. In Zadar, tens of thousands of people welcomed him home.'},
  ],
  exhibits:['ballon-dor','worldcup-1930'],
  sourceNotes:'“Born in 1985 near Zadar” (chapter 1): Wikipedia says born in Zadar and raised in the hamlet of Modrići on the Velebit; the page says only that he grew up on the Velebit mountain, near Zadar. “Their first World Cup final” (chapter 6): not stated in the article; the page says only that Croatia reached the final.',
 };
export default page;
