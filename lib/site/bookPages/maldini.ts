import type {BookPageSpec} from './types';
/* Maldini sources checked Nov 17 2026 against the English Wikipedia article the book lists (Paolo Maldini). Every fact on this
 * page is in the book and in that article. The book names his positions (winger, right-back, the left side), so the page links
 * the fullback guide. One wording is kept off the page (see sourceNotes). */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Maldini: Calm through the storms is a free six-chapter pop-up story for kids about Paolo Maldini, the son of a Milan and Italy captain, who played 25 seasons for AC Milan. He lost big finals with Italy and with Milan, then won the Champions League in 2007, two years after the worst night of his career. The story teaches that one hard night is not the end of your story.',
  facts:[
   {icon:'tag',label:'Country',value:'Italy'},
   {icon:'shirt',label:'Position',value:'Full-back, right then left',href:'/learn/soccer-positions/fullback'},
   {icon:'clock',label:'Born',value:'1968, Milan'},
   {icon:'steps',label:'Club',value:'AC Milan, 25 seasons'},
   {icon:'cards',label:'Champions League wins',value:'1989, 1990, 1994, 2003 and 2007'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Who was Paolo Maldini’s father?',a:'His father, Cesare, was a defender and the captain of AC Milan and of Italy. Paolo was given the number three shirt his father had once worn. In 1986, his father called him up to Italy’s under-21 team. But Paolo’s path was his own: he began as a winger, became a right-back at fourteen, and later made the left side his home.'},
   {q:'Did Maldini win a trophy with Italy?',a:'No. Italy lost the 1990 World Cup semi-final on penalties, the 1994 World Cup final to Brazil on penalties, and went out on penalties to France in 1998. At Euro 2000, Italy led the final 1–0 until the very last minute, and then France won in extra time. Still, Maldini played 126 games for Italy and was captain for eight years.'},
   {q:'What happened in the 2005 Champions League final?',a:'Milan played Liverpool. Maldini scored in the very first minute, and Milan led 3–0 at half-time. Liverpool fought back to draw, and then won on penalties. Maldini later called it the worst moment of his career.'},
   {q:'How many times did Maldini win the Champions League?',a:'Five times with Milan: in 1989, 1990, 1994, 2003 and 2007. In 2007, in Athens, Milan played Liverpool again and won 2–1. At 38, Maldini became the oldest captain ever to lift the trophy.'},
   {q:'Why does no one wear number three at Milan?',a:'Milan retired Maldini’s number three shirt, so no one else would wear it. He played his last home game at San Siro in May 2009. The crowd gave him a standing ovation, but a group of Milan’s own fans, called ultras, protested against him as he said goodbye.'},
  ],
  exhibits:['shirts','hall-of-fame'],
  sourceNotes:'“At sixteen, Paolo played for Milan’s first team, and he was given the number three shirt” (chapter 1): Wikipedia says he made his debut at 16 (January 1985) and was handed the number 3 the following season, at 17; the page gives the shirt without an age.',
 };
export default page;
