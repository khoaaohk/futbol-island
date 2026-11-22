import type {BookPageSpec} from './types';
/* Džeko sources checked Nov 21 2026 (Wikipedia, AFP via The Jakarta Post, The Players' Tribune letter of June 2026). Every fact on this
 * page is in the book. The siege is told gently: the day his mother kept him home is a story about grown-ups keeping children safe;
 * who was hurt on the pitch that day is left out. */
const page:BookPageSpec={
  published:'2026-11-21',
  summary:'Džeko: Hope after the siege is a free six-chapter pop-up story for kids about Edin Džeko, who grew up in Sarajevo while the city was surrounded during a war, sharing a small flat with fifteen family members. A club later sold him cheaply as too tall, but he became a champion in Germany and England and captained Bosnia and Herzegovina at its first World Cup. The story teaches that hope can grow after hard times.',
  facts:[
   {icon:'tag',label:'Country',value:'Bosnia and Herzegovina'},
   {icon:'steps',label:'Grew up',value:'Sarajevo, during the siege'},
   {icon:'clock',label:'Sold to Teplice',value:'For €25,000'},
   {icon:'cards',label:'Champion',value:'Germany 2009, England 2012 and 2014'},
   {icon:'shirt',label:'First World Cup',value:'2014, Brazil'},
   {icon:'deck',label:'The book',value:'6 chapters, read aloud'},
  ],
  faq:[
   {q:'Where did Edin Džeko grow up?',a:'In Sarajevo, the capital of Bosnia and Herzegovina. When he was six, a war began and the city was surrounded for nearly four years, which is called a siege. His family home was destroyed, so fifteen members of his family lived together in his grandparents’ small flat.'},
   {q:'Why did Edin Džeko’s mother keep him home?',a:'Even during the war, Edin played football outside in his neighbourhood, Otoka. One day his mother said he could not go out to play. That same day the football pitch was hit during the fighting, and Edin was safe at home because she had said no.'},
   {q:'Why was Edin Džeko sold for only 25,000 euros?',a:'At Željezničar in Sarajevo, some people thought he was too tall and not skilful enough for midfield. The club sold him to Teplice, in the Czech Republic, for 25,000 euros. There he played up front and started to score goals.'},
   {q:'What did Edin Džeko win?',a:'He won the Bundesliga with Wolfsburg in 2009, the club’s first German title, and with Manchester City he won the Premier League in 2012 and 2014 and the FA Cup in 2011.'},
   {q:'What did Edin Džeko do for Bosnia and Herzegovina?',a:'He scored ten goals to help Bosnia and Herzegovina reach the 2014 World Cup, its first big tournament, and scored against Iran in the team’s first World Cup win. He became captain and has played and scored more for his country than anyone else. In 2026 he wrote a letter to the children of Bosnia about growing up in the siege.'},
  ],
  sourceNotes:'Left out on purpose (docs/player-books/NEW-20-NOV21.md): who was hurt when the pitch was hit, and the “Lamppost” nickname (not verified).',
 };
export default page;
