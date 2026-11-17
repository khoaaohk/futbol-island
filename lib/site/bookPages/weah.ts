import type {BookPageSpec} from './types';
/* Weah sources checked Nov 17 2026 against the English Wikipedia article the book lists (George Weah); English is the
 * main language of Liberia, so there is no second native-language article. Every fact on this page is in the book and in
 * that article. The book does not name his position, so the page does not either. See sourceNotes. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Weah: From Clara Town to the world is a free six-chapter pop-up story for kids about George Weah, who grew up in Clara Town, a very poor part of Monrovia in Liberia, and was raised mostly by his grandmother. In 1995 he became the first African player to win the Ballon d’Or. The story teaches that where you start is not where you have to stay, and to help others when life gets better.',
  facts:[
   {icon:'tag',label:'Country',value:'Liberia'},
   {icon:'clock',label:'Born',value:'1 October 1966, Monrovia'},
   {icon:'steps',label:'First club',value:'Young Survivors, Clara Town'},
   {icon:'shirt',label:'Ballon d’Or',value:'First African winner, 1995'},
   {icon:'cards',label:'His youth club',value:'Junior Professional, 1994: school first'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Who raised George Weah?',a:'George Weah was born on 1 October 1966 in Monrovia, the capital city of Liberia. He grew up in Clara Town, a very poor part of the city. When George was still a baby, his parents separated. He was one of thirteen children raised mostly by his grandmother, Emma Klonjlaleh Brown.'},
   {q:'How did George Weah start playing football?',a:'At fifteen, George began playing for Young Survivors, a small club in Clara Town. In 1982, in his first game, he scored two goals, and that season he scored 34 goals in the fourth division. In three years with George, Young Survivors went up twice, from the fourth level of Liberian football to the second.'},
   {q:'How did George Weah get to Europe?',a:'At Mighty Barrolle, one of the biggest clubs in Liberia, George scored often but was not picked to start most games. He also worked at Liberia’s telephone company, as a switchboard operator. In 1986 he moved to Invincible Eleven, and in 1987 they won the league. That year he moved to Tonnerre Yaoundé in Cameroon. Cameroon’s national coach, Claude Le Roy, told Arsène Wenger about him, and Wenger flew to Africa to watch him play. In 1988 George signed for Monaco.'},
   {q:'Did George Weah play at a World Cup?',a:'No. Liberia was a small football nation, hurt by years of war. George played for Liberia, later coached the team, and even paid for much of it himself. In qualifying for the 2002 World Cup, Liberia finished just one point short. In 1995 he was the first African player to win the Ballon d’Or and FIFA World Player of the Year, and he dedicated the FIFA award to Arsène Wenger.'},
   {q:'What was Junior Professional?',a:'In 1994 George started a football club in Monrovia called Junior Professional. There was only one rule to join: you had to go to school. Many of its young players went on to play for Liberia. During his playing career, George became a Goodwill Ambassador for the United Nations, and in 2004 he won the Arthur Ashe Courage Award for his work.'},
  ],
  exhibits:['ballon-dor','hall-of-fame'],
  sourceNotes:'Every fact in the book is in the article. The article adds two things the book leaves out, and so does the page: one season at Bong Range United (1984) before Mighty Barrolle, and that he was President of Liberia from 2018 to 2024. The book’s “plenty of company” in his grandmother’s home is the book’s own picture, not a source fact; the page leaves it out.',
 };
export default page;
