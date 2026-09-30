import type {BookData} from '../types';
/** The starter book: an introduction to Futbol Island. Every place and activity named here exists in the app
 * (flight gear, rides, Ball Hunt, fishing, the community garden, Rosa's market stand, island jobs, the arcade,
 * vending machines, Learn Plays, quizzes, Paths and the Coaches Centre). No outside facts, so no sources. */
export const ISLAND_BOOK:BookData={
 title:'Futbol Island',subtitle:'Learn the beautiful game',itemId:'starter:island-book',player:'Futbol Island',
 sources:[],
 pages:[
  {id:'welcome',year:'Welcome',title:'A flying start',
   text:'Welcome to Futbol Island! Put on your flying gear and zoom high above the rooftops. Below you, there are pitches everywhere: a futsal court on a roof, a sandy beach pitch, and grass fields for seven, nine and eleven players a side.\n\nPull the cord on our paper page to take off. From up here, you can see the whole island at once. Good footballers do this too. Before the ball arrives, they look up and picture the whole pitch.',
   lesson:'Look up and see the whole picture, on the island and on the pitch.',
   prompt:'Fly the jetpack',response:'Up, up and away! Look at all those pitches!',source:null},
  {id:'explore',year:'Explore',title:'Ride around the town',
   text:'Back on the ground, hop on a scooter, a bike or a moped and ride through the neighbourhoods. Footballs are hidden all over the island. Ball Hunt gives you clues to find a hundred hidden matchday balls, and each one teaches you a football tip.\n\nTap three times to ride the scooter, the bike and the moped down our paper street. Exploring is a lot like finding space on the pitch. Keep your eyes open, and you will spot the gaps that other people miss.',
   lesson:'Keep exploring. The best players are always looking for space.',
   prompt:'Ride, ride, ride',response:'You found a hidden ball!',steps:3,source:null},
  {id:'harvest',year:'Island jobs',title:'Fish, fruit and coins',
   text:'Down by the water, cast your fishing line and watch the float. A little nibble is like a striker’s dummy, so stay set like a goalkeeper, and only tap when the fish really bites. In the community garden, pick ripe strawberries, tomatoes, carrots, oranges and cherries.\n\nTake your fish and fruit to Rosa’s market stand to trade them for coins. You can earn coins with island jobs too, like raking leaves off a pitch or being a ball kid. Every job teaches something about the game.',
   lesson:'Be patient like a goalkeeper. Stay set, then react.',
   prompt:'Cast the line',response:'A catch! Off to Rosa’s stand.',source:null},
  {id:'arcade',year:'Arcade and vending',title:'Games and vending machines',
   text:'Inside the arcade, five cabinets are waiting: Island Strikers, Breakaway Run, Futbol Tennis, Futbol Pinball and Pass Puzzles. Each game practises a real skill, like controlling your first touch or seeing the space for a pass.\n\nAround the island, bright vending machines sell card packs, balls, scooters, bikes, mopeds and flying gear. Some even hold pop-up books about football legends. Spend your coins, then press the button on our paper machine to see what drops out.',
   lesson:'Play games that make you a smarter footballer.',
   prompt:'Press the button',response:'A card pack! Who is inside?',source:null},
  {id:'learn',year:'Learn the game',title:'Watch, learn and quiz',
   text:'Visit a pitch and choose Learn Plays. Follow the ball, the arrows and the players as they move, and see each idea in action. Then try a quiz. Answer five questions to win a player card for your collection.\n\nOpen Paths for futsal, seven a side, nine a side or eleven a side. Each one has twelve core lessons to follow, and the Coaches Centre helps you practise. Flip our paper quiz card to check your answer.',
   lesson:'Watch it, try it, then check what you learned.',
   prompt:'Flip the quiz card',response:'Correct! A new card for your collection.',source:null},
  {id:'together',year:'The beautiful game',title:'Everything is futbol',
   text:'Flying, riding, fishing, picking fruit, playing games and taking quizzes: everything on Futbol Island teaches you something about the beautiful game. You learn to look up, to find space, to be patient and to try again.\n\nNow everyone meets on the big pitch. Pull the tab and watch the whole island join in. Football is best when we play together, help each other and have fun. See you on the pitch!',
   lesson:'Learn, play together and have fun. That is the beautiful game.',
   prompt:'Everyone join in',response:'The whole island is playing!',source:null},
 ]
};
