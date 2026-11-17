import type {BookPageSpec} from './types';
/* Davies sources checked Nov 17 2026 against the English Wikipedia article the book lists (Alphonso Davies); English is his
 * own language, so there is no second native-language article. Every fact on this page is in the book and in that article.
 * The book does not name his position, so the page does not either. The war is told gently, in the book’s own words. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Davies: Born in a refugee camp is a free six-chapter pop-up story for kids about Alphonso Davies, who was born in 2000 in Buduburam, a refugee camp in Ghana, after his parents had to flee a war in Liberia. His family moved to Canada when he was five, and at sixteen he became the youngest player ever to play for Canada. The story teaches that where you are born doesn’t decide where you can go.',
  facts:[
   {icon:'tag',label:'Country',value:'Canada'},
   {icon:'clock',label:'Born',value:'2000, Buduburam, Ghana'},
   {icon:'steps',label:'New home',value:'Edmonton, Canada, at five'},
   {icon:'cards',label:'First league',value:'Free Footie, a free after-school league'},
   {icon:'shirt',label:'World Cup',value:'Canada’s first men’s World Cup goal, 2022'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'What is a refugee?',a:'A refugee is someone who has to leave their home to stay safe. Alphonso Davies’s parents, Debeah and Victoria, came from Monrovia, the capital of Liberia. When a war came to Liberia, they had to flee. The war forced more than 450,000 Liberians from their homes. Alphonso was born in 2000 in Buduburam, a refugee camp in Ghana, and grew up in a big family.'},
   {q:'How did Alphonso Davies come to Canada?',a:'In 2005, when Alphonso was five, his family moved to Canada and settled in the city of Edmonton. He started at Mother Teresa Elementary School. At junior high, his school friends remembered that language was a problem for him at first, and that soccer was the thing he wanted to get into.'},
   {q:'What is Free Footie?',a:'Free Footie is an after-school soccer league in Edmonton, where Alphonso first played organised soccer. It was for children whose families could not afford the fees or the kit, or who had no way to get to games. Later he played for the Edmonton Internationals and the Edmonton Strikers. In 2015, at fourteen, he moved on his own to Vancouver to join the Whitecaps FC Residency program.'},
   {q:'How did Alphonso Davies become Canadian?',a:'Because he was born a Liberian refugee, Alphonso could not play for Canada’s national team at first. In March 2017 he said that representing Canada was one of his dreams. On 6 June 2017, he passed his Canadian citizenship test and became a citizen. One week later, at sixteen, he became the youngest player ever to play for Canada’s national team.'},
   {q:'What did Alphonso Davies do at the 2022 World Cup?',a:'In 2022, Canada’s men played at the World Cup for the first time since 1986. In the first match, against Belgium, Alphonso took a penalty, and the goalkeeper saved it. Four days later, against Croatia, he tried again and scored Canada’s first ever goal at a men’s World Cup. Today he is Canada’s captain, and he was the first soccer player to become an ambassador for the United Nations refugee agency.'},
  ],
  exhibits:['penalty-1891','worldcup-1930'],
  sourceNotes:'“Some classmates had also come from Liberia” (chapter 2): Wikipedia names one classmate who was a fellow Liberian immigrant; the page leaves it out. “Ambassador for one of his old Edmonton clubs”: Wikipedia names it as Edmonton BTB SC, a club he played for in his youth that the book does not name; the page leaves it out.',
 };
export default page;
