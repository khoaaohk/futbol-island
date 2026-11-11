import type {Faq} from './safety';
import {abs,KIDS_AUDIENCE,PUBLISHER,SITE_NAME,SITE_URL} from './seo';
/**
 * The arcade games' search pages (Nov 10 2026, owner: "we also need separate SEO pages for these games"): /games and one page
 * per cabinet of lib/arcade/arcadeCatalog.ts. GAME_PAGES is the registry, parallel to lib/site/guides.ts and
 * lib/site/tools/registry.ts: it feeds the pages (app/(site)/games), the sitemap (lib/site/paths.ts), the image sitemap
 * (lib/site/tools/imageSitemap.ts), llms.txt / llms-full.txt and tests/seo-games.cjs. Like the guide and tool clusters these
 * pages are NOT linked from the home page or from the game UI; they are reached from the guides, the hubs and each other.
 * No imports from the guide data on purpose (rules.ts and drillLinks.ts link back here): guide paths are plain strings and
 * tests/seo-games.cjs checks that each one is a real page.
 * FACTS come from the code and the direction docs only (docs/arcade-aaa/<game>-direction.md, lib/arcade/kitrush/core.ts,
 * lib/arcade/snake/core.ts, lib/arcade/runnerEndless.ts + runnerModes.ts, lib/games/soccerPinballEndless.ts,
 * lib/passPuzzle/endless.ts, components/games/ArcadeGame3D.tsx for the keys). No player counts, no ratings, no reviews.
 * Tennis is described without match-length rules (its endless mode was being built on the same day).
 * Island Strikers is not a cabinet any more and is never named here as an arcade game.
 * The kit pattern is written str\\u0069pes in the strings: tests/seo-pages.cjs forbids the name of the payment service in lib/site.
 * Pictures: public/games/*.webp and *-og.jpg, made from docs/arcade-aaa/shots by docs/seo/build-game-images.py.
 */
export const GAMES_PATH='/games';
export const GAMES_UPDATED='2026-11-10';
export const GAMES_DIR='/games';
export const GAME_NAMES='Soccer is called football in most of the world. This game is part of Futbol Island, a free football learning game for kids aged 7 to 12.';
/** All seven machines are free to play (owner, 11 Nov 2026: lib/economy.ts ARCADE_PLAY_COST=0); coins are only earned by playing. */
export const GAMES_NAMES='Soccer is called football in most of the world. These games are part of Futbol Island, a free football learning game for kids aged 7 to 12.';
/** The line that ends every game page. */
export const GAME_FOOT='Futbol Island is a free football (soccer) learning game for kids aged 7 to 12. The arcade is one room of the island; the lessons, quizzes and the museum teach the rest of the game.';
export const COIN_LINE='Every play is free, like every game in the arcade. Playing earns island coins: they are earned by playing and learning on Futbol Island and are never sold for real money.';
const DEVICE:Faq['a']='It runs in a web browser with nothing to install, and it is built for phones first. It also works on tablets and on computers, so a Chromebook is fine as long as the school’s filter allows futbolisland.app.';
export type GameShot={src:string;w:number;h:number;alt:string;caption:string};
export type GuideLink={path:string;name:string;line:string};
export type GameId='kitrush'|'snake'|'runner'|'tennis'|'pinball'|'puzzle'|'airhockey';
export type GamePage={id:GameId;slug:string;path:string;name:string;play:string;title:string;h1:string;description:string;lead:string;blurb:string;genre:string[];skill:string;
 og:string;ogAlt:string;shots:GameShot[];about:string[];phone:string[];desktop:string[];rules:string[];teaches:string[];guides:GuideLink[];tips:string[];harder:string[];parents:string[];faq:Faq[]};
const page=(slug:string)=>`${GAMES_PATH}/${slug}`;
const play=(id:GameId)=>`/arcade?game=${id}`;
const img=(file:string)=>`${GAMES_DIR}/${file}`;
const phone=(file:string,alt:string,caption:string):GameShot=>({src:img(file),w:480,h:1039,alt,caption});
/** A phone picture taken with the browser bars showing (390x664): Air Futbol's shots. */
const tall=(file:string,alt:string,caption:string):GameShot=>({src:img(file),w:480,h:817,alt,caption});
const wide=(file:string,alt:string,caption:string):GameShot=>({src:img(file),w:960,h:444,alt,caption});
const R='/learn/soccer-rules/',P='/learn/soccer-positions/',T='/learn/soccer-terms/',D='/learn/soccer-drills/',F='/learn/soccer-formations';
const free=(name:string,coins:boolean):Faq=>({q:`Is ${name} free?`,a:`Yes. There is nothing to buy, no advert and no account to create. ${coins?COIN_LINE:'Like every arcade game, Pass Puzzles need no coins: every puzzle is free to try as often as you like.'}`});
const PARENTS_SAFE='Free, with no ads, no account and no open chat. The high-score board takes a few arcade-style letters, never a full name or a message.';

export const GAME_PAGES:readonly GamePage[]=[
 {id:'kitrush',slug:'soccer-swipe-game',path:page('soccer-swipe-game'),name:'Kit Rush',play:play('kitrush'),
  title:'Soccer Swipe Game for Kids: Kit Rush, Free Online',h1:'Soccer swipe game: Kit Rush',
  description:'Kit Rush is a free soccer swipe game for kids. Swipe your team’s kit out of the air, leave the other team’s, and dodge the whistle. No ads, no sign-up.',
  lead:'A kit bag bursts open and shirts, boots, bibs and balls fly into the air. Swipe everything in your team’s colours, leave the other team’s kit alone, and never touch the whistle.',
  blurb:'Swipe your team’s kit, leave theirs, dodge the whistle',genre:['Arcade','Sports','Educational'],skill:'Recognising your team at a glance and scanning before you act',
  og:img('kit-rush-soccer-swipe-game-og.jpg'),ogAlt:'Kit Rush, a soccer swipe game: teal kit sliced in the air in front of a goal',
  shots:[phone('kit-rush-soccer-swipe-game.webp','Kit Rush on a phone: a swipe cuts two teal boots in front of a goal and the word ONE-TWO appears','A two-item swipe: the banner at the top shows your kit and your three lives.'),
   phone('kit-rush-results-football-fact.webp','Kit Rush results card with the score, the best swipe and a fact about why teams wear two kits','Every run ends with one real football fact.')],
  about:['Kit Rush is a football (soccer) take on the swipe-and-slice arcade game. Items are thrown up in waves, and each one wears a team kit: a colour and a pattern together (plain, hoops, str\u0069pes or a sash). Your job is to cut only your own team’s kit.',
   'A run lasts until your three lives are gone, and most runs take one to three minutes.'],
  phone:['Hold the phone upright and drag one finger across the screen, through the items in your team’s kit.','A tap does nothing: you have to draw a line.','Pause with the button in the top corner.'],
  desktop:['Hold the mouse button down and drag through the items, or swipe on a touch screen.','The game plays in an upright page in the middle of the screen.'],
  rules:['The banner at the top and the frame around the screen always show your kit.','The first item in a swipe scores 10 points, the second 20, and so on up to 60. A swipe of three or more earns a bonus and a call: HAT-TRICK, TIKI-TAKA, TOTAL FOOTBALL, GOLAZO.',
   'Cutting the other team’s kit or the whistle costs a life. Missing one of your own items costs nothing, but it ends your clean run.','Twelve clean cuts in a row bring on a SUPER SUB: one life back, up to three.',
   'SWITCH! Every so often your team changes. The banner and the frame flip to the new kit and play goes on.','Three specials help: the golden ball (five seconds of golden balls only), the stopwatch (five seconds of slow motion) and the captain’s armband (double points for eight seconds).'],
  teaches:['In a real match a player has less than a second to tell friend from opponent. That is why two teams must wear kits that differ, and why a goalkeeper wears a third colour. Kit Rush trains that quick look: colour first, pattern to confirm.',
   'It also trains scanning: looking before you act. The best swipe is planned. You read the whole wave, find one line through your own colours, then cut once. Coaches ask for the same habit on the field with the words “check your shoulder”.',
   'The Switch moment is the transition in a real game, when the ball changes sides and every player has to re-read the picture at once.'],
  guides:[{path:D+'shoulder-check-colors',name:'Shoulder check colors drill',line:'A scanning drill: look, call the colour, then receive'},{path:D+'rondo-3v1',name:'3v1 rondo',line:'Keep-away that rewards looking before the ball arrives'},
   {path:T+'counterattack',name:'Counterattack (soccer term)',line:'What happens in the seconds after the ball changes sides'},{path:T+'marking',name:'Marking (soccer term)',line:'Knowing which opponent is yours'}],
  tips:['Read the whole wave before you move. One planned swipe through four of your items scores at least 100 points; four single swipes score 40.','Check the pattern as well as the colour, most of all once a third and a fourth kit join in.',
   'After a SWITCH, look at the banner before you touch anything.','Let a hard item go. A miss costs no life; a rushed swipe through a whistle does.','Protect a clean run when you are down to one life: twelve clean cuts give a life back.'],
  harder:['The first three waves are teaching waves: one of your items, then two, then one of theirs.','After that the waves come closer together and fly faster, and more of each wave belongs to the other team (about a fifth at first, close to half later).',
   'Whistles appear from the fifth wave. A third kit joins later, then a fourth, so colour alone stops being enough.','Medals mark the way: Bronze at 500 points, Silver at 1,200, Gold at 2,500 and Captain at 5,000.'],
  parents:[PARENTS_SAFE,'Skill: fast recognition and scanning, the habit of looking before acting. In play there are only numbers, icons and short calls, so early readers can play alone.',
   'Session length: one to three minutes a run. The Daily Rush gives everyone the same waves once a day, which makes a fair family challenge.'],
  faq:[free('Kit Rush',true),{q:'Does Kit Rush work on a phone or a school Chromebook?',a:DEVICE},
   {q:'How do you play Kit Rush?',a:'Swipe through the items that wear your team’s kit, which is shown on the banner at the top. Do not touch the other team’s kit or the whistle: each costs one of your three lives. Longer swipes through several of your items score more.'},
   {q:'What age is Kit Rush for?',a:'Futbol Island is made for children aged 7 to 12. Kit Rush needs no reading during play, so younger brothers and sisters can usually join in.'},
   {q:'What does a soccer swipe game teach?',a:'Recognising your own team quickly by colour and pattern, and scanning the whole picture before acting. Each run also ends with one fact about kits, bibs, the armband or the whistle.'}]},
 {id:'snake',slug:'soccer-snake-game',path:page('soccer-snake-game'),name:'Squad Snake',play:play('snake'),
  title:'Soccer Snake Game: Squad Snake, Free in Your Browser',h1:'Soccer snake game: Squad Snake',
  description:'Squad Snake is a free soccer snake game. Your captain collects team-mates in position order until eleven players name a formation such as 4-3-3. No ads.',
  lead:'The classic snake game, played with a football squad. Your captain runs the pitch and team-mates join the line in position order, until a full eleven stands as a real formation.',
  blurb:'Snake with a squad: collect eleven players and build a formation',genre:['Arcade','Sports','Educational'],skill:'Positions and how a formation is counted',
  og:img('squad-snake-soccer-snake-game-og.jpg'),ogAlt:'Squad Snake, a soccer snake game: a full squad named as a 4-3-3 formation',
  shots:[phone('squad-snake-soccer-snake-game.webp','Squad Snake on a phone: a line of numbered players follows the captain across a pitch toward a forward to collect','The team sheet at the top fills in position colours as players join.'),
   phone('squad-snake-full-squad-4-3-3-formation.webp','Squad Snake showing FULL SQUAD and 4-3-3 after eleven players are collected, with a coach’s call bonus','Eleven collected: the shape is named and the coach’s call doubles the bonus.')],
  about:['Squad Snake keeps the rule everyone knows from snake: the line behind you gets longer, and you must not run into a wall or into yourself. Here the line is a football (soccer) team. The goalkeeper joins first, then the defenders, the midfielders and the forwards, each with a shirt number and a position colour.',
   'When ten team-mates follow the captain, the game names the formation you built, banks a bonus and starts the next squad one level up.'],
  phone:['Hold the phone upright and swipe up, down, left or right anywhere on the screen to turn the captain.','One drag can turn twice, and two turns are remembered, so a quick double swipe makes a U-turn.','An on-screen direction pad can be switched on if you prefer buttons.'],
  desktop:['Use the arrow keys or W, A, S and D to turn.','The game plays in an upright page in the middle of the screen.'],
  rules:['The touchlines are walls: running out of play, into your own line or into a pressing defender ends the run. Each squad has one LAST-DITCH save that turns you away from a first crash.',
   'Team-mates join from the back: goalkeeper, then three to five defenders, three to five midfielders and one to three forwards.','While a line is open the pitch offers a choice: one more of that line, or the first player of the next line. That choice decides the shape.',
   'Seven shapes can be built: 3-4-3, 3-5-2, 4-3-3, 4-4-2, 4-5-1, 5-3-2 and 5-4-1.','The coach’s call asks for a 4-4-2, a 4-3-3 or a 3-5-2. Build it and the full-squad bonus doubles.',
   'A loose ball gives a THROUGH PASS: a short dash that runs past opponents. A golden boot appears on a touchline for a few seconds and is worth extra points.','Touch a referee and your last team-mate is sent back.'],
  teaches:['Formations are counted from the back and never include the goalkeeper: a 4-3-3 is four defenders, three midfielders and three forwards. In Squad Snake you build that count one player at a time, so the numbers stop being a code.',
   'The position labels (GK, DEF, MID, FWD), the colours and the shirt numbers match the way a team sheet is read, and the results card adds one fact about the shape you built.'],
  guides:[{path:F,name:'Soccer formations explained',line:'Every shape for 7v7, 9v9, 11v11 and futsal, with a diagram'},{path:'/learn/soccer-positions',name:'Soccer positions',line:'What each position does and the numbers 1 to 11'},
   {path:F+'/11v11-4-3-3',name:'4-3-3 formation',line:'Roles, strengths and weak spots'},{path:F+'/11v11-4-4-2',name:'4-4-2 formation',line:'Two lines of four and two strikers'},{path:F+'/11v11-3-5-2',name:'3-5-2 formation',line:'Three at the back and wingbacks'}],
  tips:['Read the coach’s call before you collect the first defender, then count: the moment you pick up a midfielder, the defence is closed.','Build the coach’s shape whenever you can: the full-squad bonus is worth twice as much.',
   'With a long line, travel along the touchlines and keep the middle of the pitch free for turning.','A straight reversal is refused, so make a U-turn with two quick swipes.','Use a loose ball’s THROUGH PASS to get past a pressing defender, and steer round referees when your line is nearly full.'],
  harder:['Level 1 is a quiet pitch at about three cells a second. Every full squad raises the level, and points are multiplied by the level.','Pressing defenders patrol marked lanes from level 2; referees wander from level 3.',
   'By level 12 the captain moves twice as fast, with up to four pressers and three referees, and the golden boot stays for half as long.','Medals: Bronze at 300 points (about one squad), Silver at 1,000, Gold at 2,500, Captain at 6,000.'],
  parents:[PARENTS_SAFE,'Skill: the names and order of positions and how a formation is counted. A shape album on the start card shows which of the seven shapes a child has built.',
   'Session length: a first squad takes a minute or two; a good run lasts a few minutes. The Daily Squad is the same for everyone once a day.'],
  faq:[free('Squad Snake',true),{q:'Does Squad Snake work on a phone or a school Chromebook?',a:DEVICE},
   {q:'How do you play Squad Snake?',a:'Swipe (or use the arrow keys) to steer your captain around the pitch. Run over team-mates to add them to your line, in order from goalkeeper to forwards. Do not run into the touchline, your own line or a pressing defender. Eleven players complete a formation.'},
   {q:'What age is Squad Snake for?',a:'Futbol Island is made for children aged 7 to 12. Squad Snake starts slowly, so it suits a child who has never played snake before.'},
   {q:'Which formations can you build in Squad Snake?',a:'Seven: 3-4-3, 3-5-2, 4-3-3, 4-4-2, 4-5-1, 5-3-2 and 5-4-1. You choose the shape by deciding when to stop collecting one line and start the next.'}]},
 {id:'runner',slug:'soccer-runner-game',path:page('soccer-runner-game'),name:'Breakaway Run',play:play('runner'),
  title:'Soccer Runner Game: Breakaway Run, Free Online',h1:'Soccer runner game: Breakaway Run',
  description:'Breakaway Run is a free endless soccer runner game for kids. Dribble a coast road, beat tackles with a jump or a skill move, then shoot at goal. No ads.',
  lead:'An endless runner with a ball at your feet. Dribble along an island coast road at sunset, change lanes to find space, beat each tackle and finish past the goalkeeper.',
  blurb:'Endless dribbling runner: beat the tackle, find the goal',genre:['Endless runner','Sports','Educational'],skill:'Beating a tackle, timing and finishing',
  og:img('breakaway-run-soccer-runner-game-og.jpg'),ogAlt:'Breakaway Run, a soccer runner game: a player dribbles along a coast road toward a defender',
  shots:[wide('breakaway-run-soccer-runner-game.webp','Breakaway Run: a player dribbles down a three-lane coast road toward a defender, with Jump, Slide and Shoot buttons','Three lanes, a defender ahead and footballs to collect on the way.'),
   wide('breakaway-run-goal.webp','Breakaway Run after a shot: the ball hits the net and GOAL! appears as comic lettering','A goal clears the round and the road carries on.')],
  about:['Breakaway Run is a football (soccer) version of the three-lane endless runner. The road bends and climbs along the coast, defenders step into your lane, and every so often a goal appears with a goalkeeper to beat.',
   'Reaching the goal line does not end the run: it banks a bonus, gives a heart back and starts the next round. The run ends only when your hearts are gone.'],
  phone:['Hold the phone upright (sideways works too). Swipe left or right on the road to change lane, or press on the left side and push the stick; hold it to keep moving across.','Under your right thumb are Jump, Slide and Shoot; a swipe up jumps and a swipe down slides. Hold Shoot to charge the shot and let go to strike.','When a defender is close, a Skill button lights up with the name of the move, such as a drag-back.'],
  desktop:['Left and right arrows (or A and D) change lane. Up (or W) jumps, down (or S) slides.','Space shoots, E plays the skill move, and Escape or P pauses.'],
  rules:['A defender standing in your lane is a tackle: move into the open lane beside you.','A slide tackle coming along the ground can be jumped, or beaten with the skill move.','Collect the footballs along the road and line up with the gap in the goal before you shoot.',
   'Every hard moment has one clear answer: a lane, a jump or a slide is always open.','There are several routes, from the Warm-up (five hearts, slower) to the Night Derby, the Storm Final, the Cup Final and Legend, plus a Daily Run with a new course each day.'],
  teaches:['Dribbling is not only quick feet. It is a decision made early: where is the defender, where is the space, and when do I go? The game shows the defender far enough ahead to read, then rewards the player who chooses before the tackle arrives.',
   'On a first run the game slows down at each new decision, names the one action and lights the one button, so children learn by doing. Finishing follows the same idea: get in line with the gap, then strike.'],
  guides:[{path:D+'dribbling',name:'Soccer dribbling drills',line:'Drills for close control and beating a player'},{path:D+'dribble-and-shoot',name:'Dribble and shoot drill',line:'Run with the ball, then finish'},
   {path:D+'one-v-one-to-end-zones',name:'1v1 to end zones',line:'Take a defender on and get past'},{path:T+'tackle',name:'Tackle (soccer term)',line:'What a fair tackle is, and how attackers avoid one'},{path:T+'nutmeg',name:'Nutmeg (soccer term)',line:'The most famous way past a defender'}],
  tips:['Look at the next defender, not at your own feet: change lane early and you never need the jump.','Jump the slide tackle; do not try to outrun it.','Start with the Warm-up route. It gives five hearts and wider gaps while you learn the buttons.',
   'Line up with the gap in the goal before you charge the shot.','Clearing a round gives a heart back, so reaching the goal line matters more than collecting every ball.'],
  harder:['Inside a run the pace and the patterns build with distance, and hills and bends get steeper.','Each cleared round then adds a little more: the pace rises by a few percent, defensive lines stand closer together and more defenders drift across lanes before they set.',
   'From the second round rolling balls appear, and later rounds add jump-then-slide combinations and defenders in front of the goal. One lane always stays open.','The round bonus grows too: 1,000 points for the first round, 1,500 for the second, and so on.'],
  parents:[PARENTS_SAFE,'Skill: reading a defender early, timing a move and finishing. The phone layout is played upright with one or two thumbs, with large buttons.','Session length: a few minutes a run, and the end of a round is a natural place to stop.'],
  faq:[free('Breakaway Run',true),{q:'Does Breakaway Run work on a phone or a school Chromebook?',a:DEVICE+' On a computer it is played with the arrow keys and the space bar.'},
   {q:'How do you play Breakaway Run?',a:'Change lane to run round defenders, jump over slide tackles, slide under the line when the game calls for it, and use the skill move when a defender is close. At the goal, line up with the gap and shoot. You lose a heart when you are tackled, and the run ends when the hearts are gone.'},
   {q:'What age is Breakaway Run for?',a:'Futbol Island is made for children aged 7 to 12. The Warm-up route is the gentle start; Night Derby and above are for players who want a hard game.'},
   {q:'Is Breakaway Run really endless?',a:'Yes. A goal line clears the round and the road carries on with your score and hearts. Each round is a little harder than the last, and the run ends only when you run out of hearts.'}]},
 {id:'tennis',slug:'soccer-tennis-game',path:page('soccer-tennis-game'),name:'Futbol Tennis',play:play('tennis'),
  title:'Soccer Tennis Game Online: Futbol Tennis, Free',h1:'Soccer tennis game: Futbol Tennis',
  description:'Futbol Tennis is a free online soccer tennis game for kids. Rally over the net with kicks, lobs, drops and headers on nine beach-club courts. No ads.',
  lead:'Football tennis in your browser: keep the ball up, control it with your first touch and play it over the net with your feet and head, against tougher opponents on nine beach-club courts.',
  blurb:'Football tennis: first touch and shot choice over a net',genre:['Sports','Arcade','Educational'],skill:'First touch and choosing the right shot',
  og:img('futbol-tennis-soccer-tennis-game-og.jpg'),ogAlt:'Futbol Tennis, a soccer tennis game: two players rally over a net on a clay court by the sea',
  shots:[phone('futbol-tennis-soccer-tennis-game.webp','Futbol Tennis on a phone: two players face each other across a net on a clay court, with a move stick and Kick, Lob and Drop buttons','A rally on the clay practice court, with rings that show where the ball will land.'),
   phone('futbol-tennis-point.webp','Futbol Tennis after a rally: YOUR POINT! appears over the court in comic lettering','A point won: the call lands as a comic panel.')],
  about:['Soccer tennis, also called football tennis, is a real training game: two sides, a low net, and a ball that must go over using anything but hands and arms. Futbol Tennis turns it into a one-against-one arcade game at a seaside club.',
   'You play your way through nine courts, from a morning practice court on clay to sand, a hard court, a windy pier and a championship lawn, each with a tougher opponent.'],
  phone:['Hold the phone upright. The stick under your left thumb moves your player.','Kick is the big yellow button: hold it longer for more power. Lob and Drop sit beside it, with Header, Scissor and Trap when the ball calls for them.','Rings on the court show where the ball will land and where a good first touch should set it down.'],
  desktop:['Move with the arrow keys or W, A, S and D.','Space kicks (hold for power), J lobs and K plays a drop shot. H is a header, L a scissor kick and T a trap.','Escape or P pauses.'],
  rules:['Get to the landing ring before the ball does, then choose a shot.','A trap is a cushioned first touch that sets the ball down in front of you for a second touch.','A lob goes over an opponent who is close to the net; a drop shot falls short in front of one who is standing deep.',
   'Wind is real: a pennant on the scoreboard shows its direction and gust lines cross the court.','The rally count is shown as you play, and every point won or lost is called on screen.'],
  teaches:['First touch is the skill that decides what a player can do next. In Futbol Tennis a good trap puts the ball where your next kick is easy; a poor one leaves you stretching. Children feel the difference at once.',
   'Shot choice is the second lesson. There is no best shot, only the best one for where the opponent is standing: lob the player who has come forward, drop it short when they stay back, hit with power when they are out of position.'],
  guides:[{path:T+'first-touch',name:'First touch (soccer term)',line:'The touch you take as the ball arrives'},{path:D+'first-touch',name:'First touch drills',line:'Drills for receiving and controlling the ball'},
   {path:D+'thigh-and-chest-control',name:'Thigh and chest control drill',line:'Bring a ball down from the air'},{path:D+'wall-passing',name:'Wall passing drill',line:'Touch and pass against a wall at home'},{path:R+'heading-rules-for-kids',name:'Heading rules for kids in the US',line:'Why young players do not head the ball in matches'}],
  tips:['Move first, swing second: reach the landing ring early and every shot gets easier.','Use the trap when you are under pressure. A calm second touch beats a rushed first one.','Watch where the opponent stands. Close to the net: lob. Deep: drop shot.',
   'Check the wind pennant before a lob; a lob into the wind falls short and one with the wind flies long.','Hold Kick for power only when you are balanced and the opponent is out of position.'],
  harder:['Each court brings a tougher opponent and its own surface, hour and weather: the sand court, the hard court, the pier in the wind, the lantern-lit evening, the lawn.','The practice court is the place to learn the buttons before you move on.','There are also two harder tours, Pro and Legend.'],
  parents:[PARENTS_SAFE,'Skill: first touch, footwork to get behind the ball, and choosing a shot for the situation. Heading appears as an arcade move; in real matches US rules keep heading out of the game for players aged 10 and under.',
   'Session length: a few minutes a court, with a natural stop after each one.'],
  faq:[free('Futbol Tennis',true),{q:'Does Futbol Tennis work on a phone or a school Chromebook?',a:DEVICE+' On a computer it is played with the keyboard.'},
   {q:'How do you play soccer tennis online?',a:'Move your player to where the ball will land, then play it back over the net with a kick, a lob, a drop shot, a header or a scissor kick. Use the trap to control a hard ball with your first touch before you strike it.'},
   {q:'What age is Futbol Tennis for?',a:'Futbol Island is made for children aged 7 to 12. Futbol Tennis has the most buttons of the seven arcade games, so it suits children who already play the others comfortably.'},
   {q:'What is soccer tennis?',a:'A training game that football players of every level use: two sides play a ball over a low net with feet, thighs, chest and head, never hands. It builds touch and control. Futbol Tennis is a one-against-one video game version of it.'}]},
 {id:'pinball',slug:'soccer-pinball',path:page('soccer-pinball'),name:'Futbol Pinball',play:play('pinball'),
  title:'Soccer Pinball Game: Futbol Pinball, Free Online',h1:'Soccer pinball: Futbol Pinball',
  description:'Futbol Pinball is a free soccer pinball game online. Flip the ball up a pitch-shaped table, break the wall, beat the keeper and score. No ads, no download.',
  lead:'A pinball table laid out as a football pitch. Two flippers are your left and right foot: pass off the bumpers, knock down the wall, pull the goalkeeper out of place and score.',
  blurb:'A pinball table that is a pitch: rebounds, wall passes, timing',genre:['Pinball','Sports','Educational'],skill:'Reading rebounds, wall passes and timing',
  og:img('futbol-pinball-soccer-pinball-game-og.jpg'),ogAlt:'Futbol Pinball, a soccer pinball table shaped like a pitch with a goal, a wall and two flippers',
  shots:[phone('futbol-pinball-soccer-pinball-game.webp','Futbol Pinball on a phone: a pinball table drawn as a soccer pitch with a goalkeeper, a wall, bumpers and two flippers, and Left, Nudge and Right keys','The whole table on a phone, with the two flipper keys under your thumbs.'),
   phone('futbol-pinball-goal.webp','Futbol Pinball after a goal: GOAL! and +800 appear over the table, with a coaching line about rebound goals','A rebound goal: the coaching line explains the football idea behind it.')],
  about:['Futbol Pinball is football (soccer) played on a pinball table. The goal is at the top with a goalkeeper who moves along the line, a defensive wall stands in front of it, and defenders come out to block.',
   'A match on the table lasts three minutes, shown as 90 on the clock. The full-time whistle does not end your run: it pays a bonus, raises the level and kicks off the next match. The run ends only when your last ball is lost.'],
  phone:['Hold the phone upright. The Left and Right keys at the bottom work the two flippers.','At the start of each ball the middle key is Launch: hold it to charge and let go. During play it becomes Nudge, a small shake of the table.'],
  desktop:['A or the left arrow is the left flipper; D or the right arrow is the right flipper.','Space launches the ball (hold to charge) and nudges the table during play. Escape or P pauses.'],
  rules:['The left flipper is your left foot and the right flipper is your right foot; the table uses yellow and blue to show which side a target belongs to.','Knock down the wall to light the goal for a short time, then shoot past the goalkeeper.',
   'A saved shot is still alive: follow it in for a REBOUND GOAL.','Lit lanes and targets build missions with football names, such as Build Up, and a short coaching line explains each one.','A ball that drains between the flippers is lost. A ball saver protects a new ball for its first seconds.'],
  teaches:['Pinball is a game of angles, and so is passing off a wall or a team-mate. The ball leaves a flipper at a different angle depending on when you press, which is the same lesson as striking a ball early or late across your body.',
   'The table also names real ideas as you meet them. A goalkeeper who spills a shot gives a striker a second chance, which is why forwards are told to follow every shot. A defender who steps out leaves a gap behind.'],
  guides:[{path:D+'wall-passing',name:'Wall passing drill',line:'Pass against a wall and control the rebound'},{path:D+'follow-the-shot',name:'Follow the shot drill',line:'Score from rebounds like a striker'},
   {path:T+'give-and-go',name:'Give-and-go (soccer term)',line:'Pass, move and get the ball back: the wall pass'},{path:P+'goalkeeper',name:'Goalkeeper in soccer',line:'How a keeper covers the goal'},{path:P+'striker',name:'Striker in soccer',line:'The player who finishes chances'}],
  tips:['Do not flip both flippers at once. Let the ball roll along the flipper, then press: the moment you press changes the angle, so try early and late and watch where the ball goes.','Break the wall first. Shooting at a covered goal mostly gives the ball back to the defenders.',
   'Watch the goalkeeper and shoot at the side he has just left.','Stay ready after a save: rebound goals count.','Save the nudge for a ball heading down the side or straight between the flippers.'],
  harder:['Level 1 is the gentle table: one defender, the goalkeeper at his slowest and a free saver at the goal line.','Each full-time whistle raises the level: the whole table runs a few percent faster, the goalkeeper moves quicker and reaches further, and more defenders start on the pitch.',
   'Timed targets stay lit for less time, the ball-save window shortens, and in later levels the flippers get slightly shorter, which widens the gap between them.'],
  parents:[PARENTS_SAFE,'Skill: timing, reading angles and rebounds, and the idea of following a shot. The coaching lines are one short sentence each.','Session length: a match is three minutes, and a run lasts for as many matches as a child can keep a ball in play.'],
  faq:[free('Futbol Pinball',true),{q:'Does Futbol Pinball work on a phone or a school Chromebook?',a:DEVICE+' On a computer the flippers are the A and D keys or the left and right arrows.'},
   {q:'How do you play soccer pinball?',a:'Launch the ball, then use the left and right flippers to keep it on the table and send it up the pitch. Knock down the wall, then shoot past the goalkeeper to score. If the ball drains between the flippers you lose it, and the run ends when the last ball is lost.'},
   {q:'What age is Futbol Pinball for?',a:'Futbol Island is made for children aged 7 to 12. Two buttons are enough to play, so it is one of the easiest of the seven games to start.'},
   {q:'Do I need to download anything to play?',a:'No. Futbol Pinball runs in the web browser on futbolisland.app. There is no app to install and no plug-in.'}]},
 {id:'puzzle',slug:'soccer-passing-puzzle-game',path:page('soccer-passing-puzzle-game'),name:'Pass Puzzles',play:play('puzzle'),
  title:'Soccer Passing Puzzle Game: Pass Puzzles, Free',h1:'Soccer passing puzzle game: Pass Puzzles',
  description:'Pass Puzzles is a free soccer puzzle game for kids. Read a frozen moment, draw the pass through the defence and score. Endless Run plus 46 levels. No ads.',
  lead:'A tactics puzzle game. The match is frozen: you read where the defenders and your team-mates are, draw the pass with one stroke, and watch whether it gets through.',
  blurb:'Draw the pass through the defence: space, lanes and offside',genre:['Puzzle','Sports','Educational'],skill:'Seeing space, passing lanes and offside',
  og:img('pass-puzzles-soccer-passing-puzzle-game-og.jpg'),ogAlt:'Pass Puzzles, a soccer passing puzzle game: a drawn pass curves past defenders toward a team-mate near the goal',
  shots:[phone('pass-puzzles-soccer-passing-puzzle.webp','Pass Puzzles on a phone: a pass is drawn from player 10 to player 9 near the goal, with Scan, Auto, Ground, Lift and Shoot keys','Draw from one player to the next; the keys choose a ground pass, a lifted pass or a shot.'),
   phone('pass-puzzles-endless-run.webp','Pass Puzzles Endless Run at level 7 with three lives, a caption that says keep it low in the wind, and a pass drawn between numbered players','Endless Run: level 7, three lives and the idea of the puzzle in one line.')],
  about:['Each puzzle is one moment of a football (soccer) match, set up by a coach: a few attackers in yellow, defenders in blue, a goalkeeper, and a goal to reach. Nothing moves until you draw.',
   'There are two ways to play. Endless Run serves one puzzle after another, a little harder each time, until three lives are gone. The authored levels are 46 puzzles in packs, each with stars to earn.'],
  phone:['Hold the phone upright (sideways works too). Put a finger on the player with the ball and drag to a team-mate or to the goal, then lift.','The keys at the bottom choose the kind of pass: Auto, Ground, Lift or Shoot.','Scan shows the open passing lanes and Undo takes back a pass.'],
  desktop:['Click the player with the ball, drag to a team-mate or the goal, and let go.','The same keys sit under the pitch: Scan, Auto, Ground, Lift, Shoot.'],
  rules:['The line you draw changes colour: clear, tight or blocked. A defender who can reach the line will cut the pass out.','Many puzzles need two or three passes in a row. A pass can go to feet or into space for a team-mate to run onto.',
   'The offside line is drawn on the pitch when it matters: a pass to a player beyond it is flagged.','Aim your finish by drawing onto the net: low in the corner is safest, top corners risk the bar.','In Endless Run a failed puzzle or a Skip costs one of three lives, and a failed puzzle is served again.',
   'Stars in Endless Run: one for solving, one for using the move the puzzle teaches, one for solving at the first try.'],
  teaches:['Good passers see the lane before they see the team-mate. Pass Puzzles makes the lane visible: where a defender can step in, the line turns red; where there is a gap, it stays clear. After a few puzzles children start to look for the gap first.',
   'The puzzles are named after real ideas, each explained in one line: the give-and-go, the third player, the switch of play, the through ball, the pull-back. The offside puzzles show why the timing of a run matters more than its speed.'],
  guides:[{path:R+'offside',name:'The offside rule for kids',line:'Where the line is and when it is checked'},{path:D+'passing',name:'Soccer passing drills',line:'Drills for passing and moving'},
   {path:T+'through-ball',name:'Through ball (soccer term)',line:'A pass into space behind the defence'},{path:T+'give-and-go',name:'Give-and-go (soccer term)',line:'Pass, run and get it back'},{path:T+'switching-play',name:'Switching play (soccer term)',line:'Moving the ball to the empty side'},
   {path:'/learn/passing-and-support',name:'Passing and support lessons',line:'Short animated lessons with a quiz'}],
  tips:['Before you draw, find the defenders. The pass that looks shortest often runs straight through one of them.','Use Scan on the early levels to learn what an open lane looks like; from level 5 of Endless Run it is no longer offered.',
   'Solve at the first try when you can: it is worth an extra star, and every fifth first-try solve in a row adds a bonus star.','When the direct route is blocked, look for a third player or play backwards to go forwards.','Keep the ball on the ground in the wind, and lift it only when a defender stands in the lane.'],
  harder:['Endless Run opens with two gentle puzzles with Scan switched on.','From level 5 Scan is gone and only the hint key remains. From level 6 there is a thinking clock: 45 seconds at first, shorter at each level, down to 15.',
   'From level 7 an extra defender is added beside the lanes; from level 10 there are no hints; later the extra defender presses, and then there are two.','Every remixed puzzle is checked by the game before it is shown, so there is always a solution.'],
  parents:[PARENTS_SAFE,'Skill: reading space and passing lanes, patience, and the offside rule. It is the calmest of the seven games: no timer on the early levels and soft sound.','Session length: a puzzle takes ten seconds to a minute, so it fits any spare moment. No coins are needed to play.'],
  faq:[free('Pass Puzzles',false),{q:'Does Pass Puzzles work on a phone or a school Chromebook?',a:DEVICE+' On a computer you draw the pass with the mouse or a trackpad.'},
   {q:'How do you play Pass Puzzles?',a:'Drag from the player with the ball to a team-mate, or to the goal to shoot. If no defender can reach the line, the pass arrives. Link the passes until you score. A line that turns red is blocked: look for another lane.'},
   {q:'What age is Pass Puzzles for?',a:'Futbol Island is made for children aged 7 to 12. The first puzzles need one pass and no reading; the later ones are a real test for older children and for adults.'},
   {q:'Does Pass Puzzles teach the offside rule?',a:'Yes. Several puzzles draw the offside line on the pitch and flag a pass to a player beyond it, so children see when a run starts too early. The offside guide on this site explains the rule with diagrams.'},
   {q:'How many levels are there?',a:'There are 46 authored puzzles in packs, and Endless Run has no last level: it remixes the puzzles (mirrored, shifted, with extra defenders) and gets harder as you go.'}]},
 {id:'airhockey',slug:'air-hockey-soccer-game',path:page('air-hockey-soccer-game'),name:'Air Futbol',play:play('airhockey'),
  title:'Free Air Hockey Soccer Game: Air Futbol, 1 or 2 Players',h1:'Soccer air hockey game: Air Futbol',
  description:'Air Futbol is a free air hockey soccer game for one or two players on one phone. Slide your striker, guard your goal and score off the boards. No ads.',
  lead:'Air hockey on a small football pitch. Drag your striker, knock the puck into the other goal, and play alone against a line of opponents or against a friend on the same phone.',
  blurb:'Air hockey on a football pitch, for one or two',genre:['Arcade','Sports','Educational'],skill:'Angles and rebounds, and the goalkeeper’s job of staying between the ball and the goal',
  og:img('air-futbol-air-hockey-soccer-game-og.jpg'),ogAlt:'Air Futbol, an air hockey soccer game: two round strikers and a football puck on a small pitch',
  shots:[tall('air-futbol-air-hockey-soccer-game.webp','Air Futbol on a phone: a teal striker and a red striker on a small football pitch with the puck moving between them','Your half is the bottom of the table. The big numbers printed on the pitch are the score.'),
   tall('air-futbol-goal-bank-shot.webp','Air Futbol showing GOAL! and a bank shot bonus after the puck went in off the side board','A goal off the side boards is a bank shot and pays extra.')],
  about:['Air Futbol is the air hockey table that stands in the Futbol Island arcade, made playable. The table is drawn as a small football (soccer) pitch, the puck is a flat football, and each player has one round striker and one goal to defend.',
   'The puck rebounds off the boards, so every shot is a question of angles. Playing alone, you meet a line of named opponents: beat one and the next walks on, a little quicker and smarter. With a friend, you take one end of the table each.'],
  phone:['Hold the phone upright and put a finger on your striker at the bottom of the table. It follows your finger anywhere in your own half.',
   'Two players: lay the phone flat between you. Player 1 has the bottom half and player 2 the top half, one finger each; a striker only listens to the finger that started in its own half.','A phone held sideways works too: the table turns on its side.'],
  desktop:['Move the mouse to drive your striker; no button is needed. The arrow keys work as well.','Two players on a computer: one uses the mouse or the arrow keys, the other uses W, A, S and D.'],
  rules:['A goal counts when the whole puck is over the line. The puck is then served from the centre toward the side that conceded, once a finger is on the table.','Your striker cannot cross the halfway line.',
   'Playing alone, a match is first to five goals. Win and the next opponent walks on; your points carry over.','You have three lives. Losing a match costs one and you meet the same opponent again; every third win gives a life back.',
   'Points: 100 for a goal, 75 more off the side boards, 50 more within four seconds of the serve or just after a save, 300 for a match won without conceding, and a bonus for each win.',
   'Two players play first to seven. That match never goes on the high-score board; the results card keeps today’s tally between the two of you.'],
  teaches:['Angles and rebounds. The puck leaves a board at the angle it arrived, the way a pass off a wall comes back. ',
   'The goalkeeper’s rule: stay between the ball and the goal, and cover the near post first. The results card ends with one coaching line about how the goals went in.',
   'The counter-attack. The best moment to score is just after a save, before the other player is back in position, and the game pays a bonus for it.'],
  guides:[{path:P+'goalkeeper',name:'Goalkeeper',line:'Where a keeper stands and why'},{path:D+'wall-passing',name:'Wall passing drill',line:'Angles off a wall, the real-life version of a bank shot'},
   {path:T+'counterattack',name:'Counterattack',line:'Attacking the moment the ball is won'}],
  tips:['After every shot, bring your striker straight back in front of your goal.','When the puck is on one side, slide to that side: guard the near post first.','If the keeper is in the way, aim at the side board about halfway to the goal.',
   'A short, quick push sends the puck faster than a long slow one.'],
  harder:['The first opponent, Sandy, is slow, stands in the middle of the goal and rarely attacks.','Each one after that reacts sooner, moves faster, shoots harder and reads rebounds more often; from the fourth they use the boards themselves.',
   'There are twelve named opponents. After the twelfth the strongest plays on, so the run only ends when your lives do.'],
  parents:[PARENTS_SAFE,'Skill: angles, positioning in front of goal and quick recovery after a shot.',
   'Two-player mode is local only: both children use the same device and no score is posted. A match takes one to three minutes.'],
  faq:[free('Air Futbol',true),{q:'Does Air Futbol work on a phone or a school Chromebook?',a:DEVICE},
   {q:'Can two people play Air Futbol on one phone?',a:'Yes. Choose 2 players on the start card. One player takes the bottom half of the screen and the other the top half, each with one finger. The first to seven goals wins, and a rematch is one tap.'},
   {q:'How do you play Air Futbol?',a:'Drag your round striker with a finger (or the mouse) to hit the puck into the goal at the far end, and keep it out of your own. Shots can rebound off the side boards.'},
   {q:'What age is Air Futbol for?',a:'Futbol Island is made for children aged 7 to 12. One finger is all it takes, and the first opponent is gentle, so it is one of the easiest arcade games to start.'}]},
];
export const gameBySlug=(slug:string)=>GAME_PAGES.find(g=>g.slug===slug);
export const gameById=(id:GameId)=>GAME_PAGES.find(g=>g.id===id)!;
/** A ready link to a game page for a guide's own "related" list (lib/site/rules.ts, lib/site/drillLinks.ts, the two hubs). */
export const gameLink=(id:GameId):GuideLink=>{const g=gameById(id);return {path:g.path,name:`${g.name}: a free ${g.h1.split(':')[0].toLowerCase()}`,line:g.blurb};};
export const GAMES_HUB={path:GAMES_PATH,crumb:'Soccer games',title:'Free Soccer Games for Kids: Play Online, No Ads',h1:'Free soccer games for kids',
 description:'Seven free soccer games for kids to play online: pinball, snake, air hockey, an endless runner, soccer tennis, a swipe game and puzzles. No ads.',
 lead:'Seven arcade games from Futbol Island, each built around one football idea. They are free, they run in the browser on a phone, tablet or computer, and there are no ads and no accounts.',
 blurb:'Seven free browser games, each teaching one football idea',
 og:`${GAMES_DIR}/free-soccer-games-for-kids-og.jpg`,ogAlt:'Three free soccer games for kids: Kit Rush, Squad Snake and Pass Puzzles on phone screens',
 intro:['These are the seven machines of the arcade on Futbol Island, a football (soccer) learning game for children aged 7 to 12. Each one takes a well-known kind of game (pinball, snake, air hockey, an endless runner, a swipe game, a puzzle game, a net game) and rebuilds it around something a young player needs: knowing your team at a glance, the order of the positions, beating a tackle, a soft first touch, reading a rebound, guarding a goal, seeing a passing lane.',
  'Every game opens straight from its page. They get harder the longer you play, and a run lasts a few minutes.'],
 pick:[['The quickest to learn','Kit Rush and Squad Snake: one finger, no buttons.'],['For a child who loves to dribble','Breakaway Run.'],['For a thinker','Pass Puzzles, which has no clock on the early levels.'],
  ['For two-button fun','Futbol Pinball.'],['For two friends on one phone','Air Futbol, the air hockey table.'],['For a player who wants a challenge','Futbol Tennis, with the most moves to learn.']] as [string,string][],
 faq:[{q:'Are these soccer games really free?',a:'Yes. There is nothing to buy, no advert and no account. All seven games are free to play, every time. The island’s own coins are earned by playing and learning on Futbol Island and are never sold for real money.'},
  {q:'Can kids play these soccer games at school?',a:'They run in a web browser with nothing to install, so they work on a Chromebook, a tablet or a phone as long as the school’s filter allows futbolisland.app. There is no open chat and no advertising.'},
  {q:'What ages are the games for?',a:'Futbol Island is made for children aged 7 to 12. Kit Rush, Squad Snake and Futbol Pinball are the easiest to start; Futbol Tennis and the later Pass Puzzles suit older children.'},
  {q:'Do the games teach real soccer?',a:'Each one is built around one idea from the real game: recognising your team, positions and formations, beating a tackle, first touch, rebounds and passing lanes. Each page links to the guides and drills that explain the same idea.'},
  {q:'Do I need an account or an app?',a:'No. Nothing is downloaded and nothing is signed up for. Progress is kept on the device.'}] as Faq[]};
export const gameCrumbs=(...tail:{name:string;path:string}[])=>[{name:'Home',path:'/'},{name:GAMES_HUB.crumb,path:GAMES_HUB.path},...tail];
/** For the sitemap, llms.txt and the image sitemap: the hub first, then the seven pages. */
export type GameListing={path:string;name:string;title:string;description:string;blurb:string;hub?:boolean;images:string[]};
export const GAME_LISTINGS:readonly GameListing[]=[
 {path:GAMES_HUB.path,name:GAMES_HUB.h1,title:GAMES_HUB.title,description:GAMES_HUB.description,blurb:GAMES_HUB.blurb,hub:true,images:[GAMES_HUB.og,...GAME_PAGES.map(g=>g.shots[0].src)]},
 ...GAME_PAGES.map(g=>({path:g.path,name:g.h1,title:g.title,description:g.description,blurb:g.blurb,images:[...g.shots.map(s=>s.src),g.og]})),
];
/* ---- JSON-LD ---- */
/** One arcade game as a free browser VideoGame. No ratings or reviews: none exist, and none are invented. */
export const videoGameLd=(g:GamePage)=>({'@context':'https://schema.org','@type':'VideoGame','@id':abs(g.path)+'#game',name:g.name,alternateName:g.h1,url:abs(g.path),mainEntityOfPage:abs(g.path),description:g.description,
 image:abs(g.og),screenshot:g.shots.map(s=>({'@type':'ImageObject',contentUrl:abs(s.src),encodingFormat:'image/webp',width:s.w,height:s.h,caption:s.alt})),
 genre:g.genre,gamePlatform:'Web browser',operatingSystem:'Any (web browser, phone first)',applicationCategory:'Game',playMode:'SinglePlayer',inLanguage:'en',isAccessibleForFree:true,
 offers:{'@type':'Offer',price:0,priceCurrency:'USD',availability:'https://schema.org/InStock',url:abs(g.path)},audience:KIDS_AUDIENCE,isFamilyFriendly:true,teaches:g.skill,
 datePublished:GAMES_UPDATED,dateModified:GAMES_UPDATED,publisher:PUBLISHER,author:PUBLISHER,isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'}});
/** The hub's list of games. */
export const gameListLd=()=>({'@context':'https://schema.org','@type':'ItemList',name:GAMES_HUB.h1,url:abs(GAMES_HUB.path),numberOfItems:GAME_PAGES.length,
 itemListElement:GAME_PAGES.map((g,i)=>({'@type':'ListItem',position:i+1,name:g.name,url:abs(g.path),image:abs(g.shots[0].src)}))});
