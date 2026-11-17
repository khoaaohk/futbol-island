import type {BookPageSpec} from './types';
/* Rashford sources checked Nov 17 2026 against the English Wikipedia article the book lists (Marcus Rashford), with the
 * Wikipedia article on the UEFA Euro 2020 final as a second check. Every fact on this page is in the book and in those articles.
 * He started out as a goalkeeper at five, but that is not his position, so the page names none. One sentence of the book is
 * kept off the page (see sourceNotes). */
const page:BookPageSpec={
  published:'2026-11-17',
  summary:'Rashford: Remember where you came from is a free six-chapter pop-up story for kids about Marcus Rashford, who grew up in Manchester with a mum who worked more than one job. In 2020 he helped get food to children who were missing free school meals, and wrote to the government about child poverty. The story teaches that when you know how something feels, you can help others who feel it.',
  facts:[
   {icon:'tag',label:'Country',value:'England'},
   {icon:'clock',label:'Born',value:'1997, Manchester'},
   {icon:'shirt',label:'First club',value:'Fletcher Moss Rangers, at five'},
   {icon:'steps',label:'Academy',value:'Manchester United, from age 7'},
   {icon:'cards',label:'Free school meals',value:'Open letter, 15 June 2020'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'What was Marcus Rashford’s family like?',a:'Marcus was born in 1997 in Manchester, England, the youngest of five children. His mum, Melanie, brought them up on her own and worked more than one job to pay for everything. Money was very tight. Sometimes she skipped her own meals, so that her children had enough to eat.'},
   {q:'How did Marcus get to training as a boy?',a:'At seven he joined the Manchester United academy. His mum and brothers were at work, so often nobody could take him, and he missed training. His youth coaches, Dave Bushell, Eamon Mulvey and Tony Whelan, found drivers to take him there.'},
   {q:'How did Marcus help children get meals in 2020?',a:'In March 2020, Britain went into lockdown because of the COVID-19 pandemic, and many children were missing their free school meals. Marcus teamed up with a charity called FareShare to get food to children who needed it. People gave over £20 million, and by June the charity had given out 3 million meals.'},
   {q:'What did Marcus ask the government?',a:'On 15 June 2020, he wrote an open letter to the government and asked them to help end child poverty. One day later, the government changed its plan, and children kept getting free meals over the summer holidays. Marcus said he was proud of helping 1.3 million children. Later, FareShare named its new warehouse after his mum.'},
   {q:'What happened to the mural of Marcus in Withington?',a:'In July 2021, his penalty in the Euro 2020 final hit the post, and Italy won. Afterwards some people sent him racist messages online, and a mural of him in Withington was damaged. People from the neighbourhood covered the wall with hearts and kind messages, and the artist, Akse, painted the mural as good as new.'},
  ],
  exhibits:['penalty-1891','hall-of-fame'],
  sourceNotes:'“Marcus later said that, all through his childhood, his mum was the leader of the family” (chapter 1): not found in Wikipedia; left off the page. FareShare named the warehouse Melanie Maynard House; the page says only “after his mum”, as the book does.',
 };
export default page;
