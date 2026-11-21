import type {BookData} from '../types';
/** Original child-readable retelling of Antoine Griezmann being turned down for being small (staged Nov 21 2026: not sold until its spreads and
 *  narration exist). Facts come from the cited sources; the coping lessons are ours, not quotations. */
export const GRIEZMANN_BOOK:BookData={
 title:'Griezmann',subtitle:'Too small for France?',itemId:'display:rooftop:book:griezmann',player:'Antoine Griezmann',
 sources:[
  {label:'Wikipedia · Antoine Griezmann',url:'https://en.wikipedia.org/wiki/Antoine_Griezmann'},
  {label:'Mail & Guardian · Griezmann finally comes full circle',url:'https://mg.co.za/2016-05-27-griezmann-finally-comes-full-circle/'},
  {label:'Soccer America · Antoine Griezmann, the player who got away',url:'https://www.socceramerica.com/antoine-griezmann-the-player-who-got-away'},
 ],
 pages:[
  {id:'macon',year:'Mâcon · Childhood',title:'A small boy with a big touch',
   text:'Antoine Griezmann was born in 1991 in Mâcon, a town in France. He played for his hometown club, UF Mâconnais. He was small and slim, but he was very good with the ball.\n\nKick the ball. Antoine dreamed of joining a big French club’s academy, where young players train to become professionals. Every week he played, and every week he hoped someone would notice him.',
   lesson:'Your size today is not the size of your dreams.',
   prompt:'Kick the ball',response:'Small, and skilful.',source:0},
  {id:'rejected',year:'Aged 13 to 14',title:'Told no, again and again',
   text:'Antoine had trials at several professional clubs in France, including Lyon, Auxerre, Saint-Étienne and Sochaux. Again and again, they said no. The clubs were not sure about him because he was so small. Being small does not make you a worse player, but some coaches worried he would not be strong enough.\n\nKnock on the doors. Hearing no so many times would make anyone sad. But Antoine kept going to trials and kept playing.',
   lesson:'Keep going after a no. One club’s opinion does not decide who you can become.',
   prompt:'Knock on the doors',response:'Keep knocking.',steps:2,source:1},
  {id:'scout',year:'2005',title:'Someone was watching',
   text:'In 2005, during a trial with Montpellier, Antoine played in a friendly match. Watching was Éric Olhats, a scout for Real Sociedad, a club in Spain. Olhats liked what he saw: a boy with great technique who seemed to understand the game.\n\nLift the flap. Olhats invited him for a week’s trial in San Sebastián. It was extended to a second week, and then Real Sociedad offered him a place in their youth team. Antoine’s dream was coming true, but in a different country from the one he had expected.',
   lesson:'Keep showing what you can do. The right person might be watching.',
   prompt:'Lift the flap',response:'Someone believed in him.',source:0},
  {id:'border',year:'2005 to 2009',title:'Across the border',
   text:'Antoine was still a young teenager, a long way from his family. He lived with Éric Olhats in Bayonne, a French town near the Spanish border, and went to school there. Being far from home at that age is hard for anyone.\n\nUnfold the bridge. In the evenings, he crossed into Spain to train with Real Sociedad. It was a long journey, but he kept going. He grew stronger and more skilful every year.',
   lesson:'A hard journey can be worth it when you love what you do.',
   prompt:'Unfold the bridge',response:'School, then training.',source:2},
  {id:'euro',year:'2009 to 2016',title:'A final at home',
   text:'In 2009, Antoine played his first match for Real Sociedad, and in 2014 he moved to Atlético Madrid. At Euro 2016, held in France, he was the top scorer, with six goals, and he was named the best player of the tournament.\n\nLift the rain cloud. But in the final, France lost 1–0 to Portugal. Losing a final in your own country is very hard. Antoine and his teammates had to pick themselves up and start again.',
   lesson:'Losing hurts. Let yourself feel it, then get ready for the next chance.',
   prompt:'Lift the rain cloud',response:'Ready for next time.',source:0},
  {id:'worldcup',year:'2018 · Russia',title:'Champion of the world',
   text:'Two years later, at the 2018 World Cup, France reached the final again. They beat Croatia 4–2. Antoine scored a penalty, and he was named player of the match. It was France’s second World Cup win.\n\nRaise the trophy. The boy that French clubs had called too small was now a world champion with France. He stopped playing for France in 2024.',
   lesson:'Size is not everything. Skill, hard work and belief can carry you a long way.',
   prompt:'Raise the trophy',response:'World champions!',source:0},
 ]
};
