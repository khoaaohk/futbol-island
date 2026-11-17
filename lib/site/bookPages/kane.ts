import type {BookPageSpec} from './types';
/* Kane sources checked Nov 17 2026 against the English Wikipedia article the book lists (Harry Kane). Every fact on this page is
 * in the book and in that article. The book does not name his position, so the page does not either. One sentence of the book
 * is kept off the page (see sourceNotes). */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Kane: Released, then ready is a free six-chapter pop-up story for kids about Harry Kane, who was let go by Arsenal’s academy at eight and was sent on loan to four clubs before he got his chance at Tottenham. He missed a penalty at the 2022 World Cup, then scored a penalty in 2023 to become England’s all-time top scorer. The story teaches that being let go, or missing, is not the end of your story.',
  facts:[
   {icon:'tag',label:'Country',value:'England'},
   {icon:'clock',label:'Born',value:'1993, London'},
   {icon:'shirt',label:'First club',value:'Ridgeway Rovers, from age 6'},
   {icon:'steps',label:'Loans',value:'Leyton Orient, Millwall, Norwich City, Leicester City'},
   {icon:'cards',label:'England record',value:'All-time top scorer, from 2023'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why did Arsenal let Harry Kane go?',a:'Harry joined Arsenal’s youth academy at eight, but after one season they let him go. The man in charge later said they felt Harry was not very athletic. Harry also had a trial at Tottenham Hotspur, but at first it did not work out, so he went back to his old club, Ridgeway Rovers.'},
   {q:'How did Kane get to Tottenham?',a:'In 2004, when he was eleven, Harry went on trial at Watford. He played well for Watford against Tottenham, and Tottenham gave him another chance. At first he did not stand out: he was not big and not very quick. But his coaches noticed how much he always wanted to improve, and a couple of years later a big growth spurt made him taller and stronger.'},
   {q:'Why was Kane sent on loan?',a:'Harry signed his first professional contract with Tottenham in 2010, and his coach, Tim Sherwood, thought he could learn by playing for other clubs. He went to Leyton Orient and then Millwall, where he scored seven goals in his last fourteen games and was named Young Player of the Year. At Norwich City he broke a bone in his foot in only his second game. Then he went on loan to Leicester City.'},
   {q:'When did Kane get his chance at Tottenham?',a:'In April 2014 he started a Premier League game for Tottenham for the first time, and he scored. The next season, the new manager, Mauricio Pochettino, picked him again and again, and Harry scored 21 league goals. He was named the PFA Young Player of the Year, and in 2015 he scored on his England debut.'},
   {q:'How did Kane become England’s top scorer?',a:'Harry became England’s captain, and in 2018 he was the top scorer at the World Cup. At the 2022 World Cup he missed a penalty in the quarter-final against France, and England lost 2–1. A few months later, in 2023, he scored a penalty against Italy. It was his 54th goal for England, making him the country’s all-time top scorer.'},
  ],
  exhibits:['penalty-1891','worldcup-1930'],
  sourceNotes:'“Born in July, he was younger than many boys in his school year” (chapter 2): Wikipedia gives his birth date (28 July 1993) but does not say this; left off the page.',
 };
export default page;
