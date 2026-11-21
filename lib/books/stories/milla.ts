import type {BookData} from '../types';
/** Original child-readable retelling of Roger Milla's long career and his return to the World Cup at 38 (staged Nov 21 2026: not sold until its
 *  spreads and narration exist). Facts come from the cited sources; the coping lessons are ours, not quotations. */
export const MILLA_BOOK:BookData={
 title:'Milla',subtitle:'Never too old',itemId:'display:plaza:book:milla',player:'Roger Milla',
 sources:[
  {label:'Wikipedia · Roger Milla',url:'https://en.wikipedia.org/wiki/Roger_Milla'},
  {label:'Britannica · Roger Milla',url:'https://www.britannica.com/biography/Roger-Milla'},
  {label:'FourFourTwo · Roger Milla on Italia ’90',url:'https://fourfourtwo.com/features/roger-milla-italia-90-i-didnt-think-my-legs-were-it-be-honest'},
 ],
 pages:[
  {id:'railway',year:'Yaoundé · Childhood',title:'Always on the move',
   text:'Roger Milla was born in 1952 in Yaoundé, in Cameroon. His father worked on the railways, so the family moved around. When Roger was eleven, they moved to Douala, a big city by the sea. Moving house again and again can be hard for a child.\n\nPull the tab. Moving often means new friends and new places to play. Roger always found a game. He played wherever he could.',
   lesson:'When life keeps changing, the ball can help you make new friends.',
   prompt:'Pull the tab',response:'All aboard!',source:0},
  {id:'home',year:'1967 to 1976',title:'Learning at home',
   text:'Roger played for clubs in Cameroon, such as Léopard Douala and Tonnerre Yaoundé, and he won league titles there. He was quick, strong and full of tricks, and he scored lots of goals.\n\nFlip the scoreboard. In 1976, he was named African Footballer of the Year. It is one of the biggest prizes a footballer in Africa can win.',
   lesson:'Doing well at home is a great first step.',
   prompt:'Flip the scoreboard',response:'Best in Africa!',source:0},
  {id:'france',year:'1977 to 1989',title:'Far from home',
   text:'In 1977, Roger moved to France, far from his family and his country. He played for many French clubs, including Monaco, Saint-Étienne and Montpellier. Moving to another country meant a new language, a new climate and new teammates.\n\nOpen the suitcase. In 1989, he moved again, to Réunion, an island in the Indian Ocean. Most people thought his best days were behind him. But Roger still loved to play.',
   lesson:'Starting again somewhere new takes courage at any age.',
   prompt:'Open the suitcase',response:'Another new home.',source:0},
  {id:'call',year:'1990',title:'A surprise call',
   text:'In 1988, Roger had stopped playing for Cameroon. But before the 1990 World Cup, the President of Cameroon asked him to come back. He was enjoying football on a quiet island, far from the big stages.\n\nLift the flap. Roger said yes. He was thirty-eight, an age when most strikers have stopped playing. He said later that he was not sure his legs were up to it.',
   lesson:'Feeling unsure is normal. You can be brave and try anyway.',
   prompt:'Lift the flap',response:'Back for Cameroon!',source:2},
  {id:'dance',year:'Italia 90',title:'Dancing at the corner flag',
   text:'At the 1990 World Cup in Italy, Roger came on as a substitute and scored four goals: two against Romania and two against Colombia. After his goals, he ran to the corner flag and danced.\n\nSwing the corner flag. Cameroon became the first African team ever to reach a World Cup quarter-final. People all around the world copied his dance.',
   lesson:'Joy is part of football. Celebrate with your team!',
   prompt:'Swing the corner flag',response:'Dance, Roger, dance!',source:1},
  {id:'oldest',year:'1994 · Aged 42',title:'The oldest goalscorer',
   text:'Four years later, at the 1994 World Cup in the United States, Roger scored against Russia. He was forty-two, the oldest player ever to score at a World Cup. Many people were amazed that he was still playing at that age.\n\nRaise the trophy. In 1990, he had been named African Footballer of the Year for a second time, and in 2007 he was named the best African player of the past fifty years.',
   lesson:'People may say you are too old or too young. Love the game, and keep going.',
   prompt:'Raise the trophy',response:'Never too old!',source:0},
 ]
};
