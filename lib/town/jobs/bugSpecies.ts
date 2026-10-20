/**
 * Summit Isle Bug squad CONTENT (Oct 20 2026, user: "make the bug squad catch DIFFERENT TYPES, 20 bugs; every bug must have a
 * REAL-LIFE story about futbol ... spread the bugs across Summit Isle: up high on the mountain, along the trails, near the water;
 * plus the night fireflies (8 calls) keep a real football story each"). Pure data + one seeded picker, no three.js, no React.
 *
 *  - BUG_SPECIES: 20 different insects (plus one friendly jumping spider) forming a 20-bug club: 11 starters in a 4-3-3, then
 *    the subs and the staff (coach, referee, physio, kit man, groundskeeper, mascot). Each has a habitat band, time window, rarity,
 *    movement style and look descriptor for the rendering / catching agents.
 *  - Stories: every bug and every firefly call carries 1-3 "Real football fact" stories (like the Fishbook's club facts in
 *    lib/town/fishing/fishCatalog.ts), each with its source URL. Every fact is listed with its source in docs/bug-story-facts.md.
 *    The bugs' club roles, homes and bands are ORIGINAL GAME FICTION; label them "Island story" in UI, never as fact.
 *  - BUG_HOMES / FIREFLY_HOMES: home spots on the real island, in four bands (high, trail, water, meadow), checked by
 *    tests/bug-species.cjs against the real buildTown obstacles: on walkable Summit Isle ground, slope < 0.45, ≥ 12 m from every
 *    collider and every job sign, homes ≥ 18 m apart, and nothing but beach homes north of the summit (bugHomeAllowed). A bug wanders within `wander` m of its home (≤ 6 m, so it stays ≥ 6 m clear).
 *  - pickBugsOnMap: 8-12 on the map at once from a rotating, seeded set, capped by heat tier (12 / 10 / 8).
 */

import {TERRACE,SUMMIT_CENTER,coastRadius,beachWidth,distanceToSummitShore} from '../summitIsle';

export type BugBand='high'|'trail'|'water'|'meadow';
export type BugHabitat=BugBand|'orchard';
/** When the bug is out (the player's own Day / Sunset setting; fireflies are the Night set). */
export type BugWhen='day'|'sunset'|'both';
export type BugRarity='common'|'uncommon'|'rare'|'legendary';
/** Movement tags for the flight / catching agents. */
export type BugMove='butterfly-glide'|'dragonfly-dart'|'damsel-hover'|'bee-hover'|'hop-arc'|'beetle-trundle'|'ground-dash'|'ant-march'|
 'inchworm-crawl'|'still-sway'|'mantis-stalk'|'spider-jump'|'moth-flutter'|'cicada-hop'|'firefly-drift';
export type BugBody='ladybird'|'hopper'|'beetle'|'stick'|'ant'|'dragonfly'|'damselfly'|'butterfly'|'moth'|'bee'|'mantis'|'spider'|
 'caterpillar'|'cicada'|'firefly';
export type BugLook={
 /** Main colours, darkest last (hex). */
 palette:string[];
 body:BugBody;
 /** scaled (butterfly/moth), clear (veined, see-through), elytra (beetle wing cases), none. */
 wings:'scaled'|'clear'|'elytra'|'none';
 /** Body length in island metres (game scale, bigger than life so kids can see them). */
 size:number;
 /** Pattern / shape notes for the renderer. */
 pattern:string;
};
/** One catch-card story: a real, verifiable football fact (≤ 280 characters), with its source. */
export type BugStory={text:string;source:string};
export type BugRole={
 /** The squad slot: 'starter' (the 4-3-3 XI), 'sub' (bench) or 'staff'. */
 group:'starter'|'sub'|'staff';
 /** Short label for the card ("Goalkeeper", "Coach"). */
 label:string;
 /** Shirt number for players (1-11 starters, 12+ subs); staff have none. */
 shirt?:number;
 /** One line of what this role does in a team (the football lesson on the card). */
 lesson:string;
};
export type BugSpecies={
 id:string;
 /** Display name with the club role ("Goalie Ladybug"). */
 name:string;
 /** The real insect it is based on. */
 kind:string;
 role:BugRole;
 band:BugBand;
 habitat:BugHabitat;
 when:BugWhen;
 rarity:BugRarity;
 /** How carefully a kid must sneak up (0 = walk right up, 1 = very shy). Rarer bugs are shyer. */
 sneak:number;
 /** Distance (m) at which a bug notices a running kid and flits off. */
 alert:number;
 move:BugMove;
 look:BugLook;
 /** The football touch on its look (for the renderer and the card art). */
 accent:string;
 stories:readonly BugStory[];
};

export const SNEAK:Record<BugRarity,{sneak:number;alert:number}>={common:{sneak:0,alert:2},uncommon:{sneak:.35,alert:3},rare:{sneak:.65,alert:4},legendary:{sneak:.85,alert:5}};
const R=(r:BugRarity)=>({rarity:r,...SNEAK[r]});

// Sources (each fact is also listed in docs/bug-story-facts.md).
const W='https://en.wikipedia.org/wiki/';
const SRC={
 telstar:W+'Adidas_Telstar',
 final1930:W+'1930_FIFA_World_Cup_final',
 aston:W+'Ken_Aston',
 mccrum:'https://universitytimes.ie/2018/02/the-trinity-goalkeeper-who-saved-modern-football/',
 nets:'https://sportinglandmarks.co.uk/liverpools-19th-century-contribution-to-goal-line-technology/',
 yashin:W+'Lev_Yashin',
 grasshoppers:'https://www.gcz.ch/en/club/grasshopper-club-zurich/history-records/gruendung/',
 queensPark:W+'Queen%27s_Park_F.C.',
 floodlit:'https://sheffieldhomeoffootball.org/plaques/7-john-tasker-the-very-first-football-match-played-under-floodlights',
 willie:W+'List_of_FIFA_World_Cup_official_mascots',
 pozzo:W+'Vittorio_Pozzo',
 fontaine:'https://www.guinnessworldrecords.com/news/2015/8/60/1958-most-goals-scored-at-a-world-cup-finals-393021',
 hatTrick:W+'Hat-trick',
 hurst:W+'1966_FIFA_World_Cup_final',
 banks:'https://www.tntsports.co.uk/football/gordon-banks-the-save-that-denied-pele-and-defied-gravity_sto7140877/story.shtml',
 keeperShirt:W+'1909_in_association_football',
 cafu:'https://www.fifa.com/static-pages/koreajapan2002/news/behind-the-world-cup-record-cafu-2878937',
 beckenbauer:'https://www.guinnessworldrecords.com/world-records/first-to-win-the-football-(soccer)-fifa-world-cup-as-captain-and-coach',
 carlos97:'https://www.skysports.com/football/news/11095/10899358/roberto-carlos-brilliant-brazil-free-kick-against-france-remembered',
 totalFootball:W+'Total_Football',
 cruyffTurn:'https://www.nbcsports.com/soccer/news/top-20-world-cup-moments-the-cruyff-turn-no-2',
 iniesta:'https://www.espn.com/espn/wire/_/section/soccer/id/5372949',
 alberto70:'https://www.theweek.co.uk/78008/carlos-alberto-and-the-best-ever-world-cup-goal-video',
 matthews:W+'Stanley_Matthews',
 azzurri:'https://figc.it/en/national-teams/news/happy-birthday-azzurri-shirt-112-years-old-today-with-the-new-adidas-kit-set-to-be-unveiled-in-the-following-days',
 wwc1991:W+'1991_FIFA_Women%27s_World_Cup_final',
 marta:'https://nesn.com/2019/06/brazils-marta-sets-world-cup-record-with-17th-career-goal',
 numbers:W+'Squad_number_(association_football)',
 brentford:W+'Brentford_F.C.',
 firstIntl:'https://scottishfa.co.uk/news/scottish-fa-marks-150-years-since-first-international-football-game',
 backPass:W+'Back-pass_rule',
 keeper1912:W+'Goalkeeper_(association_football)',
 subs1970:'https://www.guinnessworldrecords.com/world-records/481757-first-substitution-at-a-fifa-world-cup',
 shinPads:'https://trentbridge.co.uk/news/2017/november/the-notts-cricketer-who-invented-football-shin-pads.html',
 captainLaw:W+'Captain_(association_football)',
 goalSize:'https://downloads.theifab.com/downloads/laws-of-the-game-2015-16?l=en',
 law7:'https://theifab.com/laws/latest/the-duration-of-the-match',
 azteca:'https://www.fifa.com/news/estadio-azteca-mexico-s-footballing-temple',
 monarchs:'https://journeynorth.org/jnorth/tm/monarch/SanctuaryFactsOyamel.html',
 pele3:'https://www.outlookindia.com/sports/fifa-world-cup-2022-pel%C3%A9-lifting-his-3rd-world-cup-before-turning-30-news-238710',
 offside1925:'https://www.sportsjournalists.co.uk/sports-digest/the-season-that-it-rained-goals/',
 vuvuzela:'https://www.aljazeera.com/news/2010/6/17/vuvu-mania-spreads-around-the-world',
} as const;
export const BUG_STORY_SOURCES=SRC;

/** The 20-bug club, starters first (4-3-3: GK; RB, CB, CB, LB; DM, CM, CM; RW, ST, LW), then subs, then staff. */
export const BUG_SPECIES:readonly BugSpecies[]=[
 // ---------------- The starting XI ----------------
 {id:'ladybug',name:'Goalie Ladybug',kind:'Seven-spot ladybird',role:{group:'starter',label:'Goalkeeper',shirt:1,lesson:'The goalkeeper is the only player who may handle the ball, and only inside their own penalty area.'},
  band:'meadow',habitat:'meadow',when:'both',...R('common'),move:'beetle-trundle',accent:'Bright red like a keeper\'s shirt, so everyone can spot the goalie.',
  look:{palette:['#e2453c','#f6efe2','#1b1b1b'],body:'ladybird',wings:'elytra',size:.32,pattern:'round red dome, seven black spots, white cheek patches; wing cases lift to show clear hind wings when flying'},
  stories:[
   {text:'In 1970 in Guadalajara, Pelé headed the ball hard down at England\'s goal. Keeper Gordon Banks dived to his right and pushed it over the bar with one hand. Pelé called it one of the best saves he ever saw.',source:SRC.banks},
   {text:'Long ago the goalkeeper wore the same shirt as everyone else! In 1909 a new rule said keepers must wear a different colour, so the referee can tell who may use their hands. Bright like a ladybug!',source:SRC.keeperShirt},
   {text:'The penalty kick was the idea of a goalkeeper: William McCrum of Milford in Ireland. It was laughed at as the "Irishman\'s motion", but it became a Law of the Game in 1891.',source:SRC.mccrum}]},
 {id:'grasshopper',name:'Full-back Grasshopper',kind:'Meadow grasshopper',role:{group:'starter',label:'Right-back',shirt:2,lesson:'Full-backs defend the wing first, then spring forward to overlap and help the attack.'},
  band:'meadow',habitat:'meadow',when:'both',...R('common'),move:'hop-arc',accent:'Long springy back legs, like a full-back bursting up the touchline.',
  look:{palette:['#7cc043','#b9d86a','#3d5a1e'],body:'hopper',wings:'clear',size:.42,pattern:'slim green body, big folded hind legs, short antennae, leafy wing cases'},
  stories:[
   {text:'A real football club is named after grasshoppers! Grasshopper Club Zürich was started in Switzerland in 1886 by an English student, Tom Griffith, who brought football with him from England.',source:SRC.grasshoppers},
   {text:'Brazil\'s right-back Cafu is the only player to play in three World Cup finals in a row: 1994, 1998 and 2002. In 2002 he was the captain who lifted the trophy.',source:SRC.cafu}]},
 {id:'rhino-beetle',name:'Rhino Beetle Centre-back',kind:'Rhinoceros beetle',role:{group:'starter',label:'Centre-back',shirt:4,lesson:'Centre-backs stay goal-side of the striker, win headers and keep calm on the ball.'},
  band:'meadow',habitat:'meadow',when:'both',...R('uncommon'),move:'beetle-trundle',accent:'A strong horn and a shiny shell, like a centre-back who never gets pushed off the ball.',
  look:{palette:['#6b3b1f','#a0602f','#2a1608'],body:'beetle',wings:'elytra',size:.5,pattern:'big glossy chestnut beetle with one curved head horn'},
  stories:[
   {text:'Franz Beckenbauer of West Germany read the game from the back. He was the first person to win the World Cup as captain (1974) and then as coach (1990).',source:SRC.beckenbauer}]},
 {id:'stick-insect',name:'Stick Insect Centre-back',kind:'Stick insect',role:{group:'starter',label:'Centre-back',shirt:5,lesson:'A tall, patient defender holds the line with the other centre-back and steps up together.'},
  band:'meadow',habitat:'meadow',when:'both',...R('rare'),move:'still-sway',accent:'Tall and still as a goalpost, until it moves.',
  look:{palette:['#8a7a4a','#b0a068','#4f4528'],body:'stick',wings:'none',size:.6,pattern:'long twig-thin body and legs, sways gently; easy to miss in the grass'},
  stories:[
   {text:'A full-size goal is 7.32 m wide and 2.44 m high: 8 yards by 8 feet. The Laws of the Game measure the crossbar from its lower edge to the ground.',source:SRC.goalSize},
   {text:'In 1925 the offside law changed: an attacker now needed only two opponents, not three, between them and the goal line. Defenders had to hold their line together, and goals went up the next season.',source:SRC.offside1925}]},
 {id:'ground-beetle',name:'Ground Beetle Left-back',kind:'Green tiger beetle',role:{group:'starter',label:'Left-back',shirt:3,lesson:'Left-backs race back to defend, then bend crosses and passes in from the left.'},
  band:'water',habitat:'water',when:'both',...R('common'),move:'ground-dash',accent:'One of the fastest runners of all insects, always bombing down the wing.',
  look:{palette:['#2f8f5a','#e8e2c0','#123b25'],body:'beetle',wings:'elytra',size:.34,pattern:'metallic green beetle with cream dots, long legs, quick dashes and stops on the sand'},
  stories:[
   {text:'In 1997 Brazil\'s left-back Roberto Carlos hit a free kick against France from about 35 m. It swerved so far it looked like going wide, then bent back in off the post. Scientists later explained the spin.',source:SRC.carlos97}]},
 {id:'ant',name:'Holding Ant',kind:'Wood ant',role:{group:'starter',label:'Defensive midfielder',shirt:6,lesson:'The holding midfielder protects the defence and passes simply, so the whole team works together.'},
  band:'water',habitat:'water',when:'both',...R('common'),move:'ant-march',accent:'Tiny but tireless: ants only win by working as a team.',
  look:{palette:['#8b2e1a','#c4512c','#2a0f08'],body:'ant',wings:'none',size:.24,pattern:'three-part red-brown body, elbowed antennae, marches in a short line'},
  stories:[
   {text:'At the 1974 World Cup the Netherlands played "Total Football", coached by Rinus Michels with Johan Cruyff at its heart: players swapped positions so everyone could attack and defend, like an ant colony.',source:SRC.totalFootball},
   {text:'Brazil\'s fourth goal in the 1970 World Cup final against Italy is a famous team goal. The move went through many players before Pelé rolled it into the path of captain Carlos Alberto, who scored first time.',source:SRC.alberto70}]},
 {id:'dragonfly',name:'Midfield Dragonfly',kind:'Emperor dragonfly',role:{group:'starter',label:'Central midfielder',shirt:8,lesson:'Midfielders scan over their shoulder before the ball arrives, so they know their next pass.'},
  band:'water',habitat:'water',when:'both',...R('uncommon'),move:'dragonfly-dart',accent:'Huge eyes that see almost all the way round: the best scanner on the pitch.',
  look:{palette:['#3fa7c9','#8fd16a','#14323d'],body:'dragonfly',wings:'clear',size:.7,pattern:'long blue tail, green chest, four clear wings held flat; darts, hovers, darts'},
  stories:[
   {text:'In the 2010 World Cup final, Spain\'s midfielder Andrés Iniesta scored in the 116th minute of extra time to beat the Netherlands 1-0. It was Spain\'s first World Cup win.',source:SRC.iniesta}]},
 {id:'monarch',name:'Captain Monarch',kind:'Monarch butterfly',role:{group:'starter',label:'Captain (midfield)',shirt:10,lesson:'A captain wears the armband, leads by example and helps the team behave well.'},
  band:'high',habitat:'high',when:'both',...R('uncommon'),move:'butterfly-glide',accent:'Orange wings with a gold armband stripe: the captain.',
  look:{palette:['#f08a24','#f6efe2','#1d1d1d'],body:'butterfly',wings:'scaled',size:.36,pattern:'orange wings with black veins and white-dotted black edges; slow, high, gliding flaps'},
  stories:[
   {text:'The Laws of the Game say every team needs a captain on the pitch wearing an armband. The captain has no special powers, but is partly responsible for how the team behaves.',source:SRC.captainLaw},
   {text:'Monarch butterflies fly south to spend the winter in Mexico\'s mountain fir forests. Mexico was also the first country to host two World Cups, in 1970 and 1986.',source:SRC.azteca}]},
 {id:'swallowtail',name:'Swallowtail Winger',kind:'Old World swallowtail',role:{group:'starter',label:'Right winger',shirt:7,lesson:'Wingers stay wide by the touchline to stretch the defence, then dribble or cross.'},
  band:'high',habitat:'high',when:'day',...R('uncommon'),move:'butterfly-glide',accent:'Long tail streamers, like a winger\'s shirt flapping on the run.',
  look:{palette:['#f3d34a','#2a6fc9','#1b1b1b'],body:'butterfly',wings:'scaled',size:.42,pattern:'yellow wings with black bands, blue and red eye-spots near two long tails'},
  stories:[
   {text:'Winger Stanley Matthews won the very first Ballon d\'Or in 1956. He kept so fit that he played in England\'s top division until he was 50 years old.',source:SRC.matthews},
   {text:'Pelé is the only footballer to win three World Cups: 1958, 1962 and 1970. He was just 17 when he scored twice in the 1958 final.',source:SRC.pele3}]},
 {id:'stag-beetle',name:'Stag Beetle Striker',kind:'Stag beetle',role:{group:'starter',label:'Striker',shirt:9,lesson:'Strikers stay alert in the box and finish chances calmly, often first time.'},
  band:'water',habitat:'water',when:'both',...R('rare'),move:'beetle-trundle',accent:'Big antler jaws, like a striker who always gets a head to it. Lives in the driftwood on the beach.',
  look:{palette:['#4a2a1a','#7a3f22','#1a0d06'],body:'beetle',wings:'elytra',size:.56,pattern:'dark brown beetle with large reddish antler-like jaws; slow buzzing flights at dusk'},
  stories:[
   {text:'France\'s striker Just Fontaine scored 13 goals at the 1958 World Cup, in only six games, including four in the match for third place.',source:SRC.fontaine},
   {text:'Germany\'s Miroslav Klose scored 16 goals across four men\'s World Cups, from 2002 to 2014.',source:SRC.fontaine}]},
 {id:'blue-morph',name:'Azzurri Morph',kind:'Blue morpho butterfly',role:{group:'starter',label:'Left winger',shirt:11,lesson:'A left winger hugs the line, takes on the full-back and whips in crosses.'},
  band:'water',habitat:'water',when:'day',...R('legendary'),move:'butterfly-glide',accent:'Shining blue wings, the colour of Italy\'s "Azzurri" shirts.',
  look:{palette:['#2f7de1','#7fd0ff','#1b2433'],body:'butterfly',wings:'scaled',size:.5,pattern:'big shimmering blue upper wings with black borders, brown undersides; flashes blue as it flaps'},
  stories:[
   {text:'Italy\'s team is called the Azzurri, "the blues". They first wore blue on 6 January 1911 against Hungary in Milan; the colour is linked to the royal House of Savoy.',source:SRC.azzurri},
   {text:'Italy\'s coach Vittorio Pozzo is the only manager to win the World Cup twice, in 1934 and 1938.',source:SRC.pozzo}]},
 // ---------------- The bench ----------------
 {id:'jumping-spider',name:'Black Spider Keeper',kind:'Zebra jumping spider (not an insect: a friendly spider guest)',role:{group:'sub',label:'Sub goalkeeper',shirt:12,lesson:'The second keeper trains just as hard, ready to come on at any moment.'},
  band:'trail',habitat:'trail',when:'both',...R('rare'),move:'spider-jump',accent:'Huge front eyes and a sudden spring, like a keeper\'s reaction save.',
  look:{palette:['#1d1d1d','#f2f2f2','#6b6b6b'],body:'spider',wings:'none',size:.2,pattern:'tiny fuzzy black-and-white striped spider, two big front eyes, hops in short jumps'},
  stories:[
   {text:'Lev Yashin, the Soviet goalkeeper nicknamed the "Black Spider" for his all-black kit, won the Ballon d\'Or in 1963. He is still the only goalkeeper ever to win it.',source:SRC.yashin},
   {text:'Queen\'s Park, Scotland\'s oldest football club, founded in 1867, are nicknamed "The Spiders". Their narrow black-and-white hoops are said to look like a spider\'s web.',source:SRC.queensPark}]},
 {id:'damselfly',name:'Damselfly Forward',kind:'Azure damselfly',role:{group:'sub',label:'Sub forward',shirt:14,lesson:'A substitute comes on fresh and full of energy to change the game.'},
  band:'water',habitat:'water',when:'both',...R('uncommon'),move:'damsel-hover',accent:'Slim and quick, folding its wings like a forward tucking in its shirt.',
  look:{palette:['#4fb6ff','#e9f7ff','#10202e'],body:'damselfly',wings:'clear',size:.4,pattern:'needle-thin sky-blue body with black rings, wings folded along the back at rest'},
  stories:[
   {text:'The first Women\'s World Cup was in China in 1991. The USA beat Norway 2-1 in the final, and Michelle Akers scored both goals.',source:SRC.wwc1991},
   {text:'In 2019 Brazil\'s Marta scored her 17th World Cup goal, more than any player, woman or man, had scored at World Cups.',source:SRC.marta},
   {text:'The 1970 World Cup was the first to allow substitutes. The first ever was Anatoliy Puzach of the USSR, who came on at half-time against Mexico.',source:SRC.subs1970}]},
 {id:'cricket',name:'Hat-trick Cricket',kind:'Field cricket',role:{group:'sub',label:'Super-sub striker',shirt:15,lesson:'Three goals by one player in one game is a hat-trick.'},
  band:'meadow',habitat:'meadow',when:'sunset',...R('common'),move:'hop-arc',accent:'Chirps three times, like a hat-trick of goals.',
  look:{palette:['#2b2017','#5a4330','#0f0a06'],body:'hopper',wings:'elytra',size:.32,pattern:'shiny black-brown cricket, long antennae, short hops, chirps at sunset'},
  stories:[
   {text:'"Hat-trick" comes from the sport of cricket! In 1858 bowler H. H. Stephenson took three wickets with three balls in a row, and he was given a hat bought with a collection.',source:SRC.hatTrick},
   {text:'In the 1966 World Cup final, England\'s Geoff Hurst became the first player to score a hat-trick in a men\'s World Cup final. England beat West Germany 4-2 at Wembley.',source:SRC.hurst}]},
 // ---------------- The staff ----------------
 {id:'mantis',name:'Coach Mantis',kind:'Praying mantis',role:{group:'staff',label:'Head coach',lesson:'The coach plans the tactics, picks the team and watches every move from the touchline.'},
  band:'high',habitat:'high',when:'both',...R('rare'),move:'mantis-stalk',accent:'Turns its head to watch everything, like a coach on the touchline.',
  look:{palette:['#8ccf5a','#c9e79a','#3e6a22'],body:'mantis',wings:'clear',size:.5,pattern:'long green body, folded front arms like a clipboard, triangle head that swivels'},
  stories:[
   {text:'Vittorio Pozzo coached Italy to World Cup wins in 1934 and 1938. He is still the only coach to win the World Cup twice.',source:SRC.pozzo},
   {text:'Rinus Michels coached the Netherlands at the 1974 World Cup. In that tournament Johan Cruyff stunned Sweden with a new move: the "Cruyff turn".',source:SRC.totalFootball}]},
 {id:'bumblebee',name:'Referee Bumblebee',kind:'Buff-tailed bumblebee',role:{group:'staff',label:'Referee',lesson:'The referee applies the Laws fairly, and the referee\'s decisions are final.'},
  band:'trail',habitat:'orchard',when:'both',...R('common'),move:'bee-hover',accent:'Yellow and black, carrying a yellow card and a red card.',
  look:{palette:['#f2c230','#1d1d1d','#f6efe2'],body:'bee',wings:'clear',size:.32,pattern:'round fuzzy bee, yellow and black bands, white tail tip; hovers then bumbles to the next flower'},
  stories:[
   {text:'Referee Ken Aston was stopped at traffic lights in London after the 1966 World Cup. Amber means take care, red means stop... so he invented yellow and red cards! They were first used at the 1970 World Cup.',source:SRC.aston}]},
 {id:'honeybee',name:'Physio Honeybee',kind:'Western honeybee',role:{group:'staff',label:'Physio',lesson:'The physio helps players warm up, cool down and recover, so they can keep playing safely.'},
  band:'trail',habitat:'orchard',when:'day',...R('common'),move:'bee-hover',accent:'A busy little helper with a tiny first-aid cross on its back.',
  look:{palette:['#e2a83a','#4a3216','#f6efe2'],body:'bee',wings:'clear',size:.26,pattern:'slim golden-brown bee with dark stripes, quick flower-to-flower hops'},
  stories:[
   {text:'Brentford are nicknamed "The Bees". In the 1890s, students from Borough Road College cheered their friend with their college cry, "Buck up Bs!", and people heard it as "Bees".',source:SRC.brentford}]},
 {id:'caterpillar',name:'Kit Man Caterpillar',kind:'Swallowtail caterpillar',role:{group:'staff',label:'Kit man',lesson:'The kit man lays out every shirt, number and boot, so the team is ready.'},
  band:'trail',habitat:'orchard',when:'both',...R('common'),move:'inchworm-crawl',accent:'Striped like a numbered kit; one day it will change into a butterfly.',
  look:{palette:['#7cc043','#1d1d1d','#f2a12e'],body:'caterpillar',wings:'none',size:.3,pattern:'plump green caterpillar with black bands and orange dots, inches along a stem'},
  stories:[
   {text:'Shirt numbers began as an experiment: on the first day of the 1928-29 season, Arsenal and Chelsea wore numbers. In 1939 the Football League made numbers 1 to 11 the rule.',source:SRC.numbers}]},
 {id:'moth',name:'Floodlight Moth',kind:'Luna moth',role:{group:'staff',label:'Groundskeeper',lesson:'The groundskeeper looks after the grass, the lines and the floodlights.'},
  band:'meadow',habitat:'meadow',when:'sunset',...R('uncommon'),move:'moth-flutter',accent:'Pale green wings that glow in the evening light, like floodlights.',
  look:{palette:['#bfe6a6','#e8f6d8','#6a8a4a'],body:'moth',wings:'scaled',size:.46,pattern:'pale green moth with long trailing hind-wing tails and small eye-spots; soft wobbly flight'},
  stories:[
   {text:'The first football match under floodlights was at Bramall Lane in Sheffield on 14 October 1878. Four lamps stood on wooden towers, powered by generators, and a huge crowd came to watch.',source:SRC.floodlit}]},
 {id:'cicada',name:'Mascot Cicada',kind:'Cicada',role:{group:'staff',label:'Mascot',lesson:'The mascot cheers the team on and makes the crowd smile.'},
  band:'water',habitat:'water',when:'both',...R('common'),move:'cicada-hop',accent:'The loudest fan on the island, buzzing like a stadium full of horns.',
  look:{palette:['#5a7a3a','#c9b27a','#2a3418'],body:'cicada',wings:'clear',size:.36,pattern:'chunky body, wide-set eyes, glassy veined wings held like a tent; short buzzing flights between palms'},
  stories:[
   {text:'The first official World Cup mascot was World Cup Willie, a lion in a Union Jack shirt, at the 1966 World Cup in England. Every World Cup since has had a mascot.',source:SRC.willie},
   {text:'At the 2010 World Cup in South Africa, fans blew vuvuzelas: long plastic horns that made a loud buzzing drone, like a field full of cicadas.',source:SRC.vuvuzela}]},
];

/** The night set: eight fireflies, each flashing a football call, each with real football stories. */
export type FireflyCall={id:string;call:string;meaning:string;stories:readonly BugStory[]};
export const FIREFLY_SET:readonly FireflyCall[]=[
 {id:'man-on',call:'Man on!',meaning:'a defender is right behind you, so protect the ball or pass it quickly',stories:[
  {text:'When a defender is right on you, your shins need protecting. In 1874 Nottingham Forest\'s Sam Weller Widdowson cut down a pair of cricket pads and strapped them on: early shin guards. Others laughed, then copied him.',source:SRC.shinPads}]},
 {id:'time',call:'Time!',meaning:'nobody is close, so you can take a touch and look up',stories:[
  {text:'Law 7 of the Laws of the Game says a match has two equal halves of 45 minutes, with a half-time break of up to 15 minutes. The referee adds time for stoppages.',source:SRC.law7}]},
 {id:'turn',call:'Turn!',meaning:'you have space to turn and face the goal',stories:[
  {text:'At the 1974 World Cup, Johan Cruyff of the Netherlands faked a pass against Sweden, dragged the ball behind his standing leg and spun away. Kids everywhere still practise the "Cruyff turn".',source:SRC.cruyffTurn}]},
 {id:'square',call:'Square!',meaning:'a teammate is level with you, ready for a sideways pass',stories:[
  {text:'The first official international match was Scotland v England on 30 November 1872 in Glasgow. It finished 0-0, and every Scotland player came from Queen\'s Park.',source:SRC.firstIntl}]},
 {id:'switch',call:'Switch!',meaning:'play the ball across to the far side, where there is space',stories:[
  {text:'The 1970 World Cup ball, the Adidas Telstar, had 12 black pentagons and 20 white hexagons. On black-and-white TV, the pattern helped viewers follow the ball as it was switched across the pitch.',source:SRC.telstar}]},
 {id:'away',call:'Away!',meaning:'clear the ball far from your own goal',stories:[
  {text:'Early goals had no nets, so people argued about whether shots went in. John Brodie, an engineer from Liverpool, patented goal nets, and they were tried in a big match in January 1891.',source:SRC.nets}]},
 {id:'keepers',call:'Keeper\'s!',meaning:'the goalkeeper is coming to collect it, so get out of the way',stories:[
  {text:'Goalkeepers could once use their hands anywhere in their own half! In 1912 the rule changed so they could only handle the ball inside their own penalty area.',source:SRC.keeper1912},
  {text:'Since 1992 a goalkeeper may not pick up a ball that a teammate deliberately kicks back to them. The back-pass rule stops time-wasting and keeps the game moving.',source:SRC.backPass}]},
 {id:'mine',call:'Mine!',meaning:'you are taking it, so teammates do not collide',stories:[
  {text:'At the first World Cup final in 1930, Argentina and Uruguay each wanted their own ball! So they used one in each half: Argentina\'s first, then Uruguay\'s. Uruguay won 4-2.',source:SRC.final1930}]},
];

// ---------------------------------------------------------------------------------------------------------------
// Placement. Coordinates are world x/z on Summit Isle (lib/town/summitIsle.ts), found by sampling the real island on a 4 m grid
// (onSummitIsle, summitSlope < 0.45, ≥ 12 m from every buildTown collider and job sign, off the Summit 5s, a walkable ring of
// at least the wander radius) and farthest-point spreading within each band: TRAIL = within 10 m of the trail polylines (summitTrailDistance: the climb and the east path, where the orchard grows;
// three of the four are high on the climb); HIGH = ground ≥ 30 m up off the trail (the summit shoulders by the Summit 5s); WATER = 3-24 m from the shore
// (beaches round the island; on the north end only on the sand); MEADOW = the low grassy foothills away from trails and shore.
export type BugHome={id:string;band:BugBand;x:number;z:number;/** wander radius (m) */wander:number};
export const BUG_MIN_SPACING=18;
export const BUG_CLEARANCE=12;
/** North-zone rule (Oct 20 2026, user: "don't put any bugs on the north end of the island, it gets covered by the mountain view.
 *  only place near the beach if it's on the north end."). The follow camera sits south-east of the player looking north, so the
 *  north side of Summit Isle is behind the mountain. North of the summit terrace's north edge (z < this line) only BEACH homes
 *  are allowed: on the sand strip, 3+ m from the waterline. Every high, trail and meadow home is at or south of the line. */
export const BUG_NORTH_LINE_Z=TERRACE.z-TERRACE.b;
/** On Summit Isle's sand strip (between the grass edge and the waterline). */
export function onSummitSand(x:number,z:number){const dx=x-SUMMIT_CENTER.x,dz=z-SUMMIT_CENTER.z,a=Math.atan2(dz,dx);return Math.hypot(dx,dz)>=coastRadius(a)-beachWidth(a);}
export const inBugNorthZone=(x:number,z:number)=>z<BUG_NORTH_LINE_Z;
/** The placement rule for a home: south of the north line, or a beach home on the sand. */
export const bugHomeAllowed=(h:{band:BugBand;x:number;z:number})=>!inBugNorthZone(h.x,h.z)||(h.band==='water'&&onSummitSand(h.x,h.z)&&distanceToSummitShore(h.x,h.z)>=3);
/** The Bug squad sign, bug hotel and lantern goal at the south-west end of the summit top (being placed by the merge lane in
 *  lib/town/jobs/bugScout.ts; update here if they move). Homes stay ≥ BUG_CLEARANCE m from each. */
export const BUG_JOB_SPOTS:readonly {x:number;z:number}[]=[{x:606,z:130},{x:604.5,z:126.5},{x:607.6,z:126}];
export const BUG_HOMES:readonly BugHome[]=[
 // HIGH (≥ 30 m up, off the trail)
 {id:'monarch',band:'high',x:666,z:114,wander:5},       // summit shoulder, just east of the Summit 5s
 {id:'swallowtail',band:'high',x:668,z:138,wander:6},   // south-east summit shoulder (swallowtails gather on hilltops)
 {id:'mantis',band:'high',x:572,z:154,wander:3},        // west face, watching from up high
 // TRAIL (within 10 m of a path; three of them high on the climb)
 {id:'honeybee',band:'trail',x:648,z:158,wander:4},     // the climb, south face (~39 m up), by the orchard
 {id:'bumblebee',band:'trail',x:672,z:162,wander:3},    // the climb, south face (~40 m up)
 {id:'jumping-spider',band:'trail',x:706,z:128,wander:3},// the climb, east face (~29 m up)
 {id:'caterpillar',band:'trail',x:770,z:122,wander:3},  // the east beach path
 // WATER (3-24 m from the shore; the only homes allowed on the north end, and only on the sand)
 {id:'blue-morph',band:'water',x:584,z:20,wander:5},    // north beach by the sandbar landing (sand)
 {id:'ground-beetle',band:'water',x:650,z:14,wander:5}, // north beach (sand): tiger beetles love beaches
 {id:'stag-beetle',band:'water',x:718,z:20,wander:3},   // north-east beach driftwood (sand)
 {id:'dragonfly',band:'water',x:480,z:144,wander:6},    // west beach
 {id:'damselfly',band:'water',x:502,z:212,wander:5},    // south-west beach
 {id:'ant',band:'water',x:570,z:234,wander:3},          // south-west beach
 {id:'cicada',band:'water',x:736,z:226,wander:4},       // south-east shore
 // MEADOW (low foothills south of the north line, away from paths and shore)
 {id:'moth',band:'meadow',x:522,z:104,wander:5},        // west foothills
 {id:'stick-insect',band:'meadow',x:546,z:194,wander:2},// south-west foothills
 {id:'rhino-beetle',band:'meadow',x:602,z:196,wander:4},// south foothills
 {id:'ladybug',band:'meadow',x:646,z:226,wander:4},     // south foothills near the shore
 {id:'cricket',band:'meadow',x:698,z:206,wander:5},     // south-east foothills
 {id:'grasshopper',band:'meadow',x:746,z:172,wander:6}, // east foothills
];
/** Night homes for the eight fireflies, in the same bands and under the same rules. */
export const FIREFLY_HOMES:readonly BugHome[]=[
 {id:'man-on',band:'high',x:664,z:140,wander:6},
 {id:'time',band:'trail',x:770,z:122,wander:6},
 {id:'turn',band:'water',x:480,z:144,wander:6},
 {id:'square',band:'meadow',x:534,z:204,wander:6},
 {id:'switch',band:'trail',x:712,z:114,wander:3},
 {id:'away',band:'water',x:584,z:20,wander:6},
 {id:'keepers',band:'meadow',x:614,z:204,wander:6},
 {id:'mine',band:'water',x:718,z:20,wander:6},
];

export const bugSpeciesById=(id:string)=>BUG_SPECIES.find(b=>b.id===id);
export const bugHomeById=(id:string)=>BUG_HOMES.find(h=>h.id===id);
export const fireflyById=(id:string)=>FIREFLY_SET.find(f=>f.id===id);
export const fireflyHomeById=(id:string)=>FIREFLY_HOMES.find(h=>h.id===id);

// ---------------------------------------------------------------------------------------------------------------
// The rotating set on the map: 8-12 at once (heat tier 0: 12, tier 1: 10, tier ≥ 2: 8), seeded so a shift replays the same set.
// At least two from every band (spread over the whole island), rarer bugs turn up less often (weighted), at most one legendary.
export const BUG_MAP_CAP:readonly number[]=[12,10,8];
export const bugMapCount=(heatTier:number)=>BUG_MAP_CAP[Math.max(0,Math.min(BUG_MAP_CAP.length-1,Math.floor(heatTier)||0))];
const RARITY_WEIGHT:Record<BugRarity,number>={common:1,uncommon:.7,rare:.45,legendary:.25};
const BANDS:readonly BugBand[]=['high','trail','water','meadow'];
function mulberry(seed:number){let a=(seed>>>0)||0x9e3779b9;return ()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
/** A seed that changes once per shift (pass e.g. the day number plus the shift count). */
export const bugRotationSeed=(day:number,shift=0)=>(Math.imul(day|0,2654435761)^Math.imul(shift|0,40503))>>>0;
/** Which species are out on this shift: the given heat tier's count (8-12), at least 2 per band, ≤ 1 legendary, only bugs out at
 *  this time ('day' or 'sunset'). Deterministic for a seed. */
export function pickBugsOnMap(seed:number,heatTier=0,time:'day'|'sunset'='day'):BugSpecies[]{
 const rnd=mulberry(seed),count=bugMapCount(heatTier);
 const pool=BUG_SPECIES.filter(b=>b.when==='both'||b.when===time).map(b=>({b,key:Math.pow(rnd()||1e-9,1/RARITY_WEIGHT[b.rarity])}))
  .sort((p,q)=>q.key-p.key);
 const out:BugSpecies[]=[],has=(b:BugSpecies)=>out.includes(b),legend=()=>out.some(b=>b.rarity==='legendary');
 const take=(b:BugSpecies)=>{if(has(b)||out.length>=count||(b.rarity==='legendary'&&legend()))return;out.push(b);};
 for(const band of BANDS){let n=0;for(const p of pool)if(p.b.band===band&&n<2&&!(p.b.rarity==='legendary'&&legend())){take(p.b);n++;}}
 for(const p of pool)take(p.b);
 return out;
}
