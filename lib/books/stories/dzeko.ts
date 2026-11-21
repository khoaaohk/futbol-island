import type {BookData} from '../types';
/** Original child-readable retelling of Edin Džeko's childhood in besieged Sarajevo and his long career (staged Nov 21 2026: not sold until its
 *  spreads and narration exist). Facts come from the cited sources; the coping lessons are ours, not quotations. The war is told gently: no
 *  casualties are described, and the day his mother kept him home is told as a story about grown-ups keeping children safe. */
export const DZEKO_BOOK:BookData={
 title:'Džeko',subtitle:'Hope after the siege',itemId:'display:market:book:dzeko',player:'Edin Džeko',
 sources:[
  {label:'Wikipedia · Edin Džeko',url:'https://en.wikipedia.org/wiki/Edin_D%C5%BEeko'},
  {label:'The Jakarta Post (AFP) · Džeko, a career that began in Sarajevo',url:'https://www.thejakartapost.com/news/2021/03/30/dzeko-in-autumn-of-career-that-began-in-rubble-of-sarajevo'},
  {label:'The Players’ Tribune · Edin Džeko, A letter to the children of Bosnia',url:'https://www.theplayerstribune.com/edin-dzeko-bosnia-herzegovina-bundesliga-schalke-04-soccer'},
 ],
 pages:[
  {id:'siege',year:'1992 · Sarajevo',title:'A city surrounded',
   text:'Edin Džeko was born in 1986 in Sarajevo, the capital city of Bosnia and Herzegovina. When he was six, a war began, and the city was surrounded for nearly four years. This is called a siege. Life was dangerous and difficult for everyone in the city.\n\nOpen the door. Edin’s family home was destroyed, so fifteen members of his family lived together in his grandparents’ small flat. They shared what they had and looked after each other.',
   lesson:'In hard times, families who share and stick together keep each other going.',
   prompt:'Open the door',response:'Room for everyone.',source:0},
  {id:'mother',year:'During the war',title:'His mother said no',
   text:'Even during the war, Edin kept playing football outside, in his neighbourhood, Otoka. But one day, his mother said he could not go out to play. Football helped the children feel a little bit normal.\n\nClose the window. That same day, the football pitch was hit during the fighting. Edin was safe at home, because his mother had said no.',
   lesson:'Sometimes grown-ups say no to keep you safe. Listening to them is wise.',
   prompt:'Close the window',response:'Safe at home.',source:1},
  {id:'tall',year:'2003 to 2005',title:'Too tall, they said',
   text:'After the war, Edin played for a Sarajevo club called Željezničar. Some people there thought he was too tall, and not skilful enough for midfield. Being very tall can make it harder to control the ball when you are young.\n\nFlip the sign. The club sold him to Teplice, in the Czech Republic, for only 25,000 euros. It was a very small fee, but it was a new start. In the Czech Republic, Edin played up front and started to score goals.',
   lesson:'If people doubt you, keep working on your skills.',
   prompt:'Flip the sign',response:'A new start.',source:0},
  {id:'germany',year:'2008–09',title:'Champions of Germany',
   text:'Edin moved on to Wolfsburg, in Germany, and he became a striker who scored lots of goals. He learned to use his height, his strength and his clever feet.\n\nRaise the trophy. In 2009, Wolfsburg won the Bundesliga, the German league, for the first time ever. Edin was one of the stars of the team, and the boy from Sarajevo was a champion.',
   lesson:'Find the place where you can shine, and keep growing there.',
   prompt:'Raise the trophy',response:'Champions of Germany!',source:0},
  {id:'england',year:'2011 to 2014',title:'Titles in England',
   text:'Edin joined Manchester City in England. With City, he won the Premier League twice, in 2012 and in 2014, and the FA Cup in 2011. He often came off the bench and scored important goals.\n\nFlip the scoreboard. The boy who had grown up during a siege was now a champion in one of the biggest leagues in the world.',
   lesson:'Where you start does not decide where you can go.',
   prompt:'Flip the scoreboard',response:'Champions of England!',source:0},
  {id:'bosnia',year:'2014 · Brazil',title:'A first World Cup for Bosnia',
   text:'Edin scored ten goals to help Bosnia and Herzegovina qualify for the 2014 World Cup, their first big tournament. In Brazil, he scored against Iran in the team’s first-ever World Cup win.\n\nRaise the banner. Edin became Bosnia’s captain, and he has played and scored more for his country than anyone else. In 2026, he wrote a letter to the children of Bosnia about growing up in the siege. He wrote about what life had been like, so that children today could understand.',
   lesson:'Hope can grow even after the hardest times. Share your story to help others.',
   prompt:'Raise the banner',response:'For Bosnia!',source:2},
 ]
};
