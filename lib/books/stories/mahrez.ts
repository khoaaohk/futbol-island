import type {BookData} from '../types';
/** Original child-readable retelling of Riyad Mahrez losing his father and being overlooked for his slim build (staged Nov 21 2026: not sold until
 *  its spreads and narration exist). Facts come from the cited sources; the coping lessons are ours, not quotations. */
export const MAHREZ_BOOK:BookData={
 title:'Mahrez',subtitle:'Too skinny? Watch this',itemId:'display:beach:book:mahrez',player:'Riyad Mahrez',
 sources:[
  {label:'Wikipedia · Riyad Mahrez',url:'https://en.wikipedia.org/wiki/Riyad_Mahrez'},
  {label:'FourFourTwo · Riyad Mahrez, the street-schooled dreamer',url:'https://www.fourfourtwo.com/features/riyad-mahrez-street-schooled-dreamer-whose-ambition-knew-no-limits'},
  {label:'Gulf News · Mahrez chose Algeria in tribute to his late father',url:'https://gulfnews.com/sport/football/mahrez-chose-algeria-in-tribute-to-late-father-1.1961613'},
 ],
 pages:[
  {id:'streets',year:'Sarcelles · Childhood',title:'Street football',
   text:'Riyad Mahrez was born in 1991 in Sarcelles, a town near Paris, in France, and he grew up there. His father, Ahmed, came from Algeria. Riyad learned to play in the streets, with quick feet and clever tricks.\n\nRoll the ball down the street. In 2004, he joined the youth team of his local club, AAS Sarcelles. He kept his love for tricks and skills from the streets.',
   lesson:'You can learn a lot anywhere there is a ball and some friends.',
   prompt:'Roll the ball down the street',response:'Quick feet!',steps:3,source:1},
  {id:'father',year:'2006 · Aged 15',title:'Losing his dad',
   text:'When Riyad was fifteen, his father died suddenly of a heart attack. It was a very sad time for Riyad, his mother and his brothers and sisters. Losing a parent when you are young is one of the hardest things that can happen.\n\nLift the photo frame. Later, Riyad chose to play for Algeria, his father’s country, partly in his honour. A stadium in Sarcelles was named after Riyad, and he dedicated it to his father.',
   lesson:'Missing someone is hard. You can carry their love with you.',
   prompt:'Lift the photo frame',response:'For his father.',source:2},
  {id:'skinny',year:'2009 to 2013',title:'Too skinny?',
   text:'Riyad was very slim, and scouts from big clubs often overlooked him because of it. So he started at smaller clubs: Quimper in 2009, and then Le Havre in 2010. Some people thought he was not strong enough.\n\nTurn the signpost. Riyad kept practising his dribbling and his left foot, and he kept getting better. Small clubs gave him the chance to play every week and grow.',
   lesson:'People may judge how you look. Show them how you play.',
   prompt:'Turn the signpost',response:'His own way.',source:0},
  {id:'leicester',year:'January 2014',title:'A small price',
   text:'In January 2014, Leicester City signed Riyad from Le Havre for about £450,000. For a footballer, that was a small fee. Leicester were not in the Premier League yet.\n\nOpen the suitcase. Riyad moved to England, to a new country and a new language. He worked hard, and he soon became one of the team’s most exciting players. In his first season, Leicester won promotion.',
   lesson:'A small price does not mean a small talent.',
   prompt:'Open the suitcase',response:'Hello, Leicester!',source:0},
  {id:'champions',year:'2015–16',title:'Champions of England',
   text:'In the 2015–16 season, Leicester City surprised everyone and won the Premier League. At the start of that season, very few people thought Leicester had any chance.\n\nRaise the trophy. Riyad was named the PFA Players’ Player of the Year, voted for by the other players. He was the first African player to win it. His teammate Jamie Vardy scored lots of goals, and Riyad scored and set up many goals too.',
   lesson:'Believe in your team, even when nobody expects you to win.',
   prompt:'Raise the trophy',response:'Champions!',source:0},
  {id:'algeria',year:'2019',title:'Captain of Algeria',
   text:'In 2019, Riyad was the captain of Algeria at the Africa Cup of Nations. In the semi-final against Nigeria, he scored the winning goal with a free kick, in the very last minute of the match.\n\nKick the ball. Algeria won the whole tournament. In 2023, he also won the Champions League with Manchester City. The skinny boy from the streets had become a champion. He had helped bring the cup home to his father’s country.',
   lesson:'Keep believing in yourself, right to the last minute.',
   prompt:'Kick the ball',response:'Champions of Africa!',source:0},
 ]
};
