/**
 * Explore balls (Oct 21 2026; user: "add a ball to find in each of the explore areas. Make sure the mini lesson after each ball is
 * collected for this area is new and not related or similar to any other ones"). One hidden football per reef zone, each with its
 * own look and its own mini lesson on a football topic nothing else in the game teaches (the inventory check and the sources:
 * docs/explore-ball-lessons.md; tests/explore-balls.cjs compares every lesson's topic words with the game's other content).
 *
 * Pure data (no three.js, no DOM). diveSpots.ts turns each row into the zone's `ball` find (the finds store, the prompt, the card,
 * coins once through the Training meter); lib/graphics/diveBall.ts draws it (one mesh, no textures). Positions are room-local
 * metres. Oct 25 2026 (user: "instead of the pearl in the treasure chest. have it be a ball ... when collected give a mini lesson
 * and allow to choose a card"): each ball now sits in its zone's treasure chest (the chest is drawn at the ball find's x, z, where
 * the old matchday coin was), and the first pick-up also earns a card choice (cardRewardTriggers.ts earnForDiveBall).
 *
 * Kid card rules (AGENTS.md): a **Real football fact** with a plain-text credit (the URL stays in `source`, never in the kid UI).
 */
export type DiveBallLook='leather'|'classic'|'barnacle'|'meadow'|'moon'|'stitched'|'shell';
export type DiveBall={
 /** The zone (diveSpots.ts DIVE_SPOTS id). */
 spot:string;
 /** The ball's name (the prompt's label, the collection line) and how it looks. */
 name:string;look:DiveBallLook;
 /** Room-local spot on the sand (x, z) and where it hides (docs, tests). */
 x:number;z:number;hide:string;
 /** The mini lesson: its title, the line (≤ 280 characters), the plain-text credit and the checked source (docs only). */
 title:string;text:string;credit:string;source:string;
 /** The lesson's distinctive topic words: none may appear in any other content in the game (tests/explore-balls.cjs). */
 topic:readonly string[];
};

/** The dive's coins for a ball, once ever through the Training meter (≤ a hidden island ball's LEARN_COINS.ball). Since Oct 25 2026
 *  (user: "yes pay") the first find also pays an island ball's learning coins on top (LEARN_COINS.ball, once ever, never metered:
 *  earnForDiveBall in lib/town/cardRewardTriggers.ts, wallet run `learn:ball:dive:<zone>`). */
export const DIVE_BALL_COINS=5;
/** The ball's radius (m). */
export const DIVE_BALL_R=.22;
/** How high the ball's middle sits over the sand (m): in the open treasure chest (its body's top is ≈ .35 m up), so it shows
 *  over the rim from the prompt range (Oct 25 2026: the ball replaced the matchday coin in the chest). */
export const DIVE_BALL_CHEST_Y=.5;

export const DIVE_BALLS:readonly DiveBall[]=[
 {spot:'captains-cup',name:'The patched leather ball',look:'leather',x:6,z:-15,hide:'In the treasure chest past the old galleon’s stern, the lid propped open',
  title:'The world’s oldest football',
  text:'The oldest football ever found was hidden behind wooden panels in Stirling Castle, Scotland. It was made around 1540 to 1570 from leather stitched round a pig’s bladder full of air. It has patches, so someone really played with it!',
  credit:'Stirling Smith Art Gallery and Museum, “The World’s Oldest Football”',source:'https://www.smithmuseum.scot/?p=648',
  topic:['Stirling','oldest football ever found']},
 {spot:'pauls-grotto',name:'The striped pitch ball',look:'classic',x:4,z:-10,hide:'In the treasure chest behind the old pitch, the lid propped open',
  title:'White posts, no rope',
  text:'Goalposts and the crossbar must be white, and no thicker than 12 cm. If the crossbar breaks in a match, play stops until it is fixed. A rope is not allowed instead, and if the bar cannot be fixed, the match is called off.',
  credit:'The FA, Laws of the Game, Law 1',source:'https://www.thefa.com/football-rules-governance/lawsandrules/laws/football-11-11/law-1---the-field-of-play',
  topic:['crossbar breaks','rope is not allowed','must be white']},
 {spot:'kelp-trawler',name:'The barnacle ball',look:'barnacle',x:-6,z:-16,hide:'In the treasure chest on the reef slope past the trawler, the lid propped open',
  title:'The fourth official',
  text:'Big matches have a fourth official beside the team benches. Before kick-off they help check the match balls and the players’ equipment. During the game they help with substitutes, and in some competitions they take over if the referee gets hurt.',
  credit:'IFAB, Laws of the Game, Law 6',source:'https://www.theifab.com/laws/latest/the-other-match-officials/',
  topic:['fourth official']},
 {spot:'ray-meadow',name:'The seagrass ball',look:'meadow',x:5,z:-14,hide:'In the treasure chest at the far edge of the seagrass, the lid propped open',
  title:'Lamps that grow grass',
  text:'Seagrass needs sunlight, and so does a pitch. Where a stadium’s roof and stands shade the grass, groundstaff wheel huge lamp rigs over it, so the grass keeps growing even in the dark days of winter.',
  credit:'Pitchcare, “Lights keep grass pitches in summer condition in depths of winter”',source:'https://pitchcare.com/blogs/news/lights-keep-grass-pitches-in-summer-condition-in-depths-of-winter',
  topic:['lamp rig','stadium’s roof and stands shade']},
 {spot:'moon-arch',name:'The moonlight ball',look:'moon',x:-7,z:-12,hide:'In the treasure chest past the rock arch, the lid propped open',
  title:'Cuju: a goal up high',
  text:'Over 2,000 years ago in China, people played cuju, a kicking game. In one version the goal was a net hung high between two tall poles, with a round hole in the middle, and players aimed to kick the ball through that hole.',
  credit:'FIFA Museum, “Origins: cuju in China”',source:'https://editorial.fifamuseum.com/en/read/origins-cuju-in-china/',
  topic:['cuju','net hung high']},
 {spot:'ball-crate',name:'The hand-stitched ball',look:'stitched',x:-8,z:-16,hide:'In the treasure chest beyond the spilled crates, the lid propped open',
  title:'The football city',
  text:'Most of the world’s hand-stitched footballs come from one city: Sialkot in Pakistan. Skilled stitchers sew the panels together by hand, and the official ball of the 2026 World Cup was made in Sialkot too.',
  credit:'LUMS, “Stitching the World’s Game: Inside Sialkot’s Football Industry”',source:'https://lce.lums.edu.pk/stitching-the-worlds-game-inside-sialkots-football-industry/',
  topic:['Sialkot']},
 {spot:'turtle-pool',name:'The turtle-shell ball',look:'shell',x:6,z:-13,hide:'In the treasure chest on the turtles’ pool rim, the lid propped open',
  title:'A picture made of fans',
  text:'A tifo is a giant picture made by fans in the stands. Thousands of people hold up coloured cards or flags at the same moment, and together they make one huge image, the way many small plates make one turtle shell.',
  credit:'Wikipedia, “Tifo”',source:'https://en.wikipedia.org/wiki/Tifo',
  topic:['tifo']},
];

export const diveBallFor=(spot:string)=>DIVE_BALLS.find(b=>b.spot===spot);
/** The find id every zone's ball uses (one per zone; saved in the dive finds store under the zone). */
export const DIVE_BALL_FIND='hidden-ball';
/** How many explore balls a save holds (the "3 of 7" note). */
export const diveBallsFound=(spots:Record<string,readonly string[]>)=>DIVE_BALLS.reduce((n,b)=>n+((spots[b.spot]??[]).includes(DIVE_BALL_FIND)?1:0),0);
export const diveBallNote=(found:number)=>found>=DIVE_BALLS.length?`All ${DIVE_BALLS.length} explore balls found`:`Explore balls found: ${found} of ${DIVE_BALLS.length}`;
