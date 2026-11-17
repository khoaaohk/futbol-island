import type {BookPageSpec} from './types';
/* Hegerberg sources checked Nov 17 2026 against the English Wikipedia article the book lists (Ada Hegerberg), with Norwegian
 * Wikipedia as a second check (it confirms her goal in the 2022 Champions League final). Every fact on this page is in the
 * book and in those articles. The book does not name her position, so the page does not either. */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Hegerberg: Standing up for fairness is a free six-chapter pop-up story for kids about Ada Hegerberg, who stopped playing for Norway in 2017 as a protest about how women’s football was treated. In 2018 she became the first winner of the women’s Ballon d’Or, came back from a long knee injury, and returned to Norway’s team in 2022. The story teaches that speaking up for what is fair takes courage.',
  facts:[
   {icon:'tag',label:'Country',value:'Norway'},
   {icon:'clock',label:'Born',value:'1995, Molde'},
   {icon:'shirt',label:'Club',value:'Lyon, from 2014'},
   {icon:'cards',label:'Ballon d’Or',value:'First women’s winner, 2018'},
   {icon:'steps',label:'Knee injury',value:'21 months before she played again'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Why did Ada Hegerberg stop playing for Norway?',a:'Ada disagreed with Norway’s football association about how it treated women’s football. In 2017 she decided to stop playing for the national team, as a protest. Some things got better, but she felt there was still a long way to go. Standing up cost her something: she missed the 2019 World Cup.'},
   {q:'What did Ada say when she won the Ballon d’Or?',a:'In 2018 Ada became the very first winner of the women’s Ballon d’Or, and she called the new award a huge step forward. That night she had a message for young girls around the world: believe in yourselves. She also said she knew how important it is to have role models to look up to.'},
   {q:'How long was Ada out with her knee injury?',a:'In January 2020 she badly hurt her knee. A scan showed she had torn an important ligament, called the ACL. It took 21 months before she played for Lyon again, in October 2021. A month later she scored twice against Paris Saint-Germain, and in 2022 she scored in the Champions League final as Lyon won.'},
   {q:'When did Ada come back to Norway’s team?',a:'Norway’s football association got a new president, Lise Klaveness, and Ada talked with her in depth about the future of women’s football. In March 2022 Ada decided to come back after five years away. In her first game back, on 7 April 2022, she scored three goals as Norway beat Kosovo 5–1.'},
   {q:'Where did Ada Hegerberg grow up?',a:'Ada was born in 1995 in Molde, in Norway, and grew up in Sunndalsøra, where she played football with her older sister, Andrine. In 2007 the family moved to Kolbotn. In 2011, at sixteen, Ada became the youngest player ever to score a hat-trick in Norway’s top women’s league.'},
  ],
  exhibits:['ballon-dor','hall-of-fame'],
  sourceNotes:'“Her time with the national team had left her feeling very low” (chapter 3): Wikipedia quotes her as calling it “deeply depressing” and saying it left her “mentally broken”; the page leaves this out. The 2022 final goal is not in the English article as read; Norwegian Wikipedia confirms it.',
 };
export default page;
