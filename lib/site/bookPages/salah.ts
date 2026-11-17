import type {BookPageSpec} from './types';
/* Salah sources checked Nov 17 2026 against the three articles the book lists: English Wikipedia (Mohamed Salah), with the
 * French and German Wikipedia articles as a second check (his parents’ work and the “sleep” words are in French Wikipedia,
 * the 150 kilometres and the age of twelve in German Wikipedia). Every fact on this page is in the book and in those
 * articles. The book does not name his position, so the page does not either. See sourceNotes for the number 74. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Salah: The long journey to training is a free six-chapter pop-up story for kids about Mohamed Salah, who grew up in Nagrig, a village in Egypt. At fourteen, his journey to training took about three hours. Later he played in Switzerland, Italy and England, and he joined Liverpool in 2017. The story teaches that it’s okay to cry when things are hard, and to remember where you came from.',
  facts:[
   {icon:'tag',label:'Country',value:'Egypt'},
   {icon:'clock',label:'Grew up',value:'Nagrig, a village in Egypt'},
   {icon:'steps',label:'Youth team',value:'Al Mokawloon, Cairo, at fourteen'},
   {icon:'shirt',label:'Liverpool',value:'Joined in 2017'},
   {icon:'cards',label:'First Liverpool season',value:'32 Premier League goals, a record'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'How far did Mohamed Salah travel to training?',a:'In 2006, when Mohamed was fourteen, he joined the youth team of Al Mokawloon, a club in Cairo, more than 150 kilometres from his home. The journey to training took about three hours, and he often had to miss school to make it. He later said that when he got home at night, he had to go straight to sleep and wake up early the next day.'},
   {q:'Why did Mohamed Salah cry after matches?',a:'In 2010, Mohamed began playing in the Egyptian Premier League. At first, he struggled to score, and sometimes he cried in the dressing room after matches. His manager, Mohamed Radwan, said this only made him want to get better. On Christmas Day 2010, he scored his first goal for the club.'},
   {q:'Why did Mohamed Salah move to Switzerland?',a:'In February 2012, something terrible happened at a stadium in the city of Port Said, and many people died. Afterwards, the Egyptian league was stopped and the rest of the season was cancelled. The Swiss club Basel had been watching Mohamed, and they signed him. At first it was hard to settle, because he could not speak the language. But Basel won the Swiss league in his first season.'},
   {q:'What happened to Mohamed Salah at Chelsea?',a:'In 2014, Mohamed became the first Egyptian to join Chelsea, in London. But he was rarely picked. He played only three Premier League games, and his manager criticised him in public. In 2015, Chelsea sent him on loan to Fiorentina in Italy. Then, on loan at Roma, he scored 15 goals and was named the club’s Player of the Season.'},
   {q:'How does Mohamed Salah help his village?',a:'Mohamed never forgot Nagrig, the village where he grew up. Many families there have very little money. He has given money to help build a school and a hospital in Nagrig, and he helps many families.'},
  ],
  exhibits:['hall-of-fame'],
  sourceNotes:'“He chose the number 74, to honour the people who died in Port Said” (chapter 5): not in any of the three articles the book lists (English Wikipedia names only his number 11 at Roma and Liverpool; French and German Wikipedia say nothing about his Fiorentina number), so the page leaves the number out. German Wikipedia says 74 people died in Port Said; the page keeps the book’s “many people died”. His current club is not in the book, so the page does not name it.',
 };
export default page;
