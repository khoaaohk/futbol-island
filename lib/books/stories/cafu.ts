import type {BookData} from '../types';
/** Original child-readable retelling of Cafu's road from Jardim Irene and many rejected trials to three World Cup finals.
 * Facts come from the cited sources; the coaching lessons are ours, not quotations. */
export const CAFU_BOOK:BookData={
 title:'Cafu',subtitle:'Told no, again and again',itemId:'display:northbeach:book',player:'Cafu',
 sources:[
  {label:'CNN · Cafu: The double World Cup winner (Human to Hero)',url:'https://edition.cnn.com/2014/05/07/sport/cafu-human-to-hero'},
  {label:'Wikipedia · Cafu',url:'https://en.wikipedia.org/wiki/Cafu'},
 ],
 pages:[
  {id:'jardim',year:'São Paulo · 1970s',title:'Football in Jardim Irene',
   text:'Cafu was born in 1970 in São Paulo, Brazil. He was one of six children, and he grew up in Jardim Irene, a poor part of the city. There he played football in the streets.\n\nHis real name is Marcos, but friends called him Cafu, after a Brazilian winger called Cafuringa. At seven he went to a football school, and he also played futsal. Kick the ball along the street. One day, he would be famous for running up and down the wing.',
   lesson:'Street games and futsal teach quick feet. Play wherever you can, with whoever you can.',
   prompt:'Kick the ball along the street',response:'Off he runs!',source:0},
  {id:'trials',year:'Brazil · 1980s',title:'No, no, no, no, no',
   text:'As a boy, Cafu went to trials at some of Brazil’s biggest clubs. Corinthians said no. Palmeiras said no. Santos said no. Atlético Mineiro and Portuguesa said no too.\n\nThat is a lot of no. Flip the five cards. Cafu could have given up. Instead, he kept training, and he kept trying.',
   lesson:'One coach’s no is not the end of your story. Keep practising and keep asking for chances.',
   prompt:'Flip the five cards',response:'Keep trying!',steps:5,source:1},
  {id:'yes',year:'São Paulo · 1988',title:'At last, a yes',
   text:'In 1988 his hometown club, São Paulo, said yes. Cafu joined their youth team, and that same year the team won the Copa São Paulo, a famous youth tournament.\n\nOpen the club gate. After all those trials, the answer was finally yes, and he had a place to grow.',
   lesson:'When you get your chance, keep working just as hard as when you were waiting for it.',
   prompt:'Open the club gate',response:'Welcome to São Paulo!',source:1},
  {id:'rightback',year:'São Paulo · 1990s',title:'A brand-new position',
   text:'Cafu was a right-sided midfielder. His coach, Telê Santana, had an idea: move him back to right-back. Cafu had never played there before, but he tried it.\n\nIt suited him perfectly! He defended, then sprinted forward on the overlap to attack. Run the overlap. With Cafu at right-back, São Paulo won South America’s biggest club competition, the Copa Libertadores, in 1992 and 1993.',
   lesson:'Try new positions when a coach asks. On the overlap, run outside your winger to give them a pass.',
   prompt:'Run the overlap',response:'Overlap!',source:0},
  {id:'finals',year:'World Cups · 1994 and 1998',title:'Three finals in a row',
   text:'At the 1994 World Cup, Cafu started on the bench. In the final against Italy, a teammate got hurt early. Swap the players. On came Cafu, and Brazil won the World Cup!\n\nIn 1998 he played in the final again, but this time Brazil lost to France. Four years later, he would play in a third final in a row. No other player has ever done that.',
   lesson:'Substitutes matter. Be ready from the bench, because your chance can come at any moment.',
   prompt:'Swap the players',response:'On comes Cafu!',source:1},
  {id:'captain',year:'Japan · 2002',title:'Captain of Brazil',
   text:'In 2002 Cafu was Brazil’s captain. In the World Cup final, Brazil beat Germany 2–0. When Cafu lifted the trophy, his shirt said 100% Jardim Irene, for the place where he grew up.\n\nRaise the trophy. Later he started a foundation in Jardim Irene to help children there. He says everything he has, he owes to Jardim Irene.',
   lesson:'Remember where you started, and help the players coming after you.',
   prompt:'Raise the trophy',response:'100% Jardim Irene!',source:1},
 ]
};
