import M from './gameMedia.json';
import {ARCADE_GAME_COUNT} from '../arcade/arcadeCatalog';
import {numberWord} from '../numberWord';
import type {GameId,GameShot} from './games';
/**
 * Gameplay footage for /games and /games/<slug> (Nov 16 2026, owner: "include more screenshots of the game and videos of the
 * game. Make this page more visual and engaging"). Every clip and still is a REAL capture: the production build driven in a
 * headless Chrome (arcade games on a 390x844 phone, the island at 1280x720), cut to a silent
 * 6-10 s loop, 720 px on the long side, H.264 MP4 + VP9 WebM, with a sharper still as the poster. Four island clips (museum,
 * beach match, Kit Shop studio, plaza) are re-cuts of the Nov 3 /learn captures in public/learn/video. Sizes, durations and
 * picture sizes come from lib/site/gameMedia.json, written by the capture's encode step, so nothing here is typed by hand.
 * Files: public/games/clips/<key>.{mp4,webm,webp}, public/games/shots/<key>-<n>.webp. Tests: tests/seo-games.cjs, seo-video.cjs.
 * Nov 17 2026: Line Up! and Trophy Drop were captured the same way (dev build, CDP screencast at 390x844 DPR 2, a
 * scripted player using real mouse drags and taps); the poster is still 1 (the clip's first frame).
 * Nov 18 2026: Line Up! was captured again after its pieces became footballs (scripts/capture-lineup-media.cjs: the script, the
 * scripted player and the encode step in one file; the poster is still 1, an early moment of the same run).
 */
type ClipFile={w:number;h:number;seconds:number;mp4:number;webm:number;mp4s?:number;/* bytes of the phone-sized <key>-s.mp4 (640 px), where one exists */poster:{w:number;h:number;bytes:number}};
type ShotFile={file:string;w:number;h:number;bytes:number};
const MEDIA=M as unknown as {clips:Record<string,ClipFile>;shots:Record<string,ShotFile[]>};
export const CLIPS_DIR='/games/clips',SHOTS_DIR='/games/shots';
/** The day these clips were first published (VideoObject.uploadDate, video sitemap publication_date). The four clips added on
 *  Nov 17 2026 carry their own first commit time (git log --diff-filter=A, checked by tests/seo-video.cjs). */
export const GAME_CLIPS_UPLOADED='2026-11-16T12:00:00-08:00';
const LATER_UPLOADS:Record<string,string>={lineup:'2026-11-17T16:46:54-08:00',trophydrop:'2026-11-17T16:46:54-08:00',ballblaster:'2026-11-17T20:48:49-08:00',rollball:'2026-11-17T21:00:10-08:00',matchmix:'2026-11-20T18:58:48-08:00'};
export type GameClip={key:string;name:string;caption:string;alt:string;page:string;w:number;h:number;seconds:number;mp4:string;webm:string;mp4s?:string;poster:string;pw:number;ph:number;uploaded:string};
type ClipDef={key:string;name:string;caption:string;alt:string;page:string};
const clip=(d:ClipDef):GameClip|null=>{const f=MEDIA.clips[d.key];if(!f)return null;
 return {...d,w:f.w,h:f.h,seconds:Math.max(1,Math.round(f.seconds)),mp4:`${CLIPS_DIR}/${d.key}.mp4`,webm:`${CLIPS_DIR}/${d.key}.webm`,...(f.mp4s?{mp4s:`${CLIPS_DIR}/${d.key}-s.mp4`}:{}),poster:`${CLIPS_DIR}/${d.key}.webp`,pw:f.poster.w,ph:f.poster.h,uploaded:LATER_UPLOADS[d.key]??GAME_CLIPS_UPLOADED};};
/** The hub's hero loop: three of the phone games side by side in one file (one player, not three). */
export const HERO_CLIP=clip({key:'hero',page:'/games',name:'Kit Rush, Squad Snake and Air Futbol, played on a phone',
 alt:'Three phone screens side by side: kit flying up to be swiped in Kit Rush, a line of players in Squad Snake and an air hockey pitch in Air Futbol',
 caption:`Real play from three of the ${numberWord(ARCADE_GAME_COUNT)} games, recorded on a phone screen.`});
/** One clip per arcade game, keyed by the cabinet id. The words say what the clip shows. */
const GAME_CLIP_DEFS:Record<GameId,Omit<ClipDef,'key'|'page'>>={
 kitrush:{name:'Kit Rush gameplay: swiping a team kit out of the air',alt:'Kit Rush gameplay on a phone: pink kit, bottles and a stopwatch fly up at sunset, a CLEAN RUN of twelve in a row, SLOW-MO, then the kit switches to red stripes while team-mates cheer on the touchline',caption:'Kit Rush: swipe your own kit, leave the other team’s.'},
 snake:{name:'Squad Snake gameplay: the captain collects team-mates',alt:'Squad Snake gameplay on a phone at level 2, in front of the stands: the captain leads a growing line of numbered players, a QUICK chain collects the midfield, then FULL SQUAD! 3-4-3',caption:'Squad Snake: every team-mate joins the line in position order.'},
 runner:{name:'Breakaway Run gameplay: dribbling down the coast road',alt:'Breakaway Run gameplay: a player dribbles along three lanes, switching lanes and jumping past defenders',caption:'Breakaway Run: switch lanes, jump and slide past the tackles.'},
 tennis:{name:'Futbol Tennis gameplay: a rally over the net',alt:'Futbol Tennis gameplay on a phone: two players kick the ball back and forth over a net on a clay court',caption:'Futbol Tennis: kick, lob and drop the ball over the net.'},
 pinball:{name:'Futbol Pinball gameplay: flippers and bumpers on a pitch table',alt:'Futbol Pinball gameplay on a phone: the ball bounces off bumpers and the flippers kick it back up the table',caption:'Futbol Pinball: two flippers, a goalkeeper and a wall.'},
 puzzle:{name:'Pass Puzzles gameplay: passing around the defenders',alt:'Pass Puzzles gameplay on a phone: passes travel from player to player around the defenders toward the goal',caption:'Pass Puzzles: find the open team-mate, then the goal.'},
 airhockey:{name:'Air Futbol gameplay: air hockey on a football pitch',alt:'Air Futbol gameplay on a phone: the teal striker hits the puck up the small pitch and scores in the red goal',caption:'Air Futbol: guard your goal and bank it off the wall.'},
 lineup:{name:'Line Up! gameplay: shapes of footballs fill the lines',alt:'Line Up! gameplay on a phone: shapes of footballs are dragged from the tray onto the pitch and a full line clears',caption:'Line Up!: fill a row or a column and it clears.'},
 trophydrop:{name:'Trophy Drop gameplay: dropping and merging in the trophy cabinet',alt:'Trophy Drop gameplay on a phone: balls, boots and gloves drop into a glass cabinet and two of the same merge',caption:'Trophy Drop: two of the same merge into the next.'},
 rollball:{name:'Roll It In gameplay: a football rolling through a puzzle',alt:'Roll It In gameplay on a phone: the ball rolls past sliding keeper dummies on a beach path, then at night hits a boost pad for ZOOM!, presses the plate and the gate calls OPEN!',caption:'Roll It In: dodge the sweepers, hit the boost pad, roll it in.'},
 ballblaster:{name:'Ball Blaster gameplay: your own bean kicks footballs at wind-up robots',alt:'Ball Blaster gameplay on a phone: the player\'s own bean kicks a multi-ball, then a fire-ball super shot breaks three robots for a trick shot, the wave is cleared and the floodlit boss wave begins',caption:'Ball Blaster: aim, fill the Super bar and break the robots before they reach your goal.'},
};
const gamePaths:Record<GameId,string>={kitrush:'/games/soccer-swipe-game',snake:'/games/soccer-snake-game',runner:'/games/soccer-runner-game',tennis:'/games/soccer-tennis-game',
 pinball:'/games/soccer-pinball',puzzle:'/games/soccer-passing-puzzle-game',airhockey:'/games/air-hockey-soccer-game',lineup:'/games/soccer-block-puzzle-game',
 trophydrop:'/games/soccer-merge-game',rollball:'/games/soccer-ball-rolling-puzzle-game',ballblaster:'/games/soccer-shooting-game'};
export const gameClip=(id:GameId)=>clip({key:id,page:gamePaths[id],...GAME_CLIP_DEFS[id]});
/** New stills of each game (beyond the two hand-made ones in lib/site/games.ts), with their own alt text. */
const STILL_WORDS:Record<GameId,string[]>={
 kitrush:['Kit Rush at sunset: CLEAN RUN! Twelve pink kit swiped in a row while team-mates in pink cheer on the touchline','Kit Rush at dusk: a wave of red kit flies across the goal with one teal boot from another team among it','Kit Rush late in a run: red kit and a red card star fly up as the sky turns to evening','Kit Rush: SWITCH! NEW KIT. The card shows the teal hoops you must swipe now, and the frame turns teal'],
 snake:['Squad Snake at sunset, level 1: the captain curls round with seven team-mates behind him and a QUICK x4 chain','Squad Snake at level 2: QUICK x2, MIDFIELD FOUR! as the captain collects a midfielder, a forward waiting below','Squad Snake at level 3 under the floodlights at night: a long line of players follows the captain round the pitch','Squad Snake: ten players follow the captain in a long L-shaped line across the bottom of the pitch'],
 runner:['Breakaway Run: the player dribbles toward a defender and a cone, with the Step-over skill button lit','Breakaway Run: a red defender lunges across the road ahead of the player','Breakaway Run: footballs in a line down the road with a defender far ahead','Breakaway Run on the sand road: the player runs at a goal with two red defenders in front of it'],
 tennis:['Futbol Tennis: the ball flies over the net toward the other player','Futbol Tennis: a player runs to reach the ball before it lands','Futbol Tennis: a rally on the clay court with the score at the top','Futbol Tennis at night on the Neon Final court: a rally against the Champion under the moon, with Trap, Header and Scissor buttons for trick shots'],
 pinball:['Futbol Pinball: the ball races up the table past the bumpers','Futbol Pinball: a flipper kicks the ball back toward the goal','Futbol Pinball: the ball bounces between the bumpers near the goalkeeper','Futbol Pinball: GOAL! and +240 light up as the ball beats the goalkeeper at the top of the table'],
 puzzle:['Pass Puzzles: a pass goes from one team-mate to another around a defender','Pass Puzzles: the ball travels toward the striker near the goal','Pass Puzzles Endless Run, level 2: a pass is drawn from number 11 to number 10, with defenders between them and the goal','Pass Puzzles: GOAL! STRAIGHT IN as the shot beats the keeper, seen from close behind the striker'],
 airhockey:['Air Futbol: a rally against Sandy, the puck crossing the halfway line between the red and the teal striker','Air Futbol: SMASH! The teal striker drives up into the puck and sends it flying up the pitch','Air Futbol: the puck banks off the left side wall in the middle of a rally','Air Futbol against Pip, the level 2 opponent: SAVE! as the teal striker stops a fiery shot in front of its own goal'],
 lineup:['Line Up! early in a run: a few shapes of footballs on the pitch, one shape left in the tray and the empty bench beside it','Line Up!: a line fills, the footballs are kicked off the pitch and LINE UP! and +100 appear','Line Up!: a shape of three star balls held above a crowded pitch, with its shadow on the square where it will land','Line Up! at level 5: the referee stands on one square of a crowded pitch, and the x2 call says to clear a line now'],
 trophydrop:['Trophy Drop at the start: a boot hangs over the cabinet, with a glove and balls at the bottom','Trophy Drop: a CHAIN x2 burst as two items merge on the pile','Trophy Drop at level 2: the cabinet gets smaller, with a medal in the pile','Trophy Drop at level 4: a big silver trophy, a medal and a glove in the cabinet as CHAIN x2! appears'],
 rollball:['Roll It In, Crab Walk: crabs sweep across a wooden plank over the water while the ball rolls between them toward a star','Roll It In: two keeper dummies slide across the path beyond a boost pad, with a plate wired to the gate','Roll It In, Keeper Drill at night: the ball crosses a boost pad for ZOOM! with keeper dummies sliding on each side','Roll It In on the beach: the ball rolls along a narrow wooden plank over the water toward a plate and the goal'],
 ballblaster:['Ball Blaster: SUPER SHOT! The bean\'s fire ball breaks three robots for a +300 trick shot','Ball Blaster boss wave under the floodlights: the Mega Mannequin walks up behind cones, barrels and a glass board as a ball hits for SMASH! +80','Ball Blaster target practice after the boss: a ball hits a target for DING! +75 with five targets left','Ball Blaster late in wave 1: big wind-up robots march close to the goal while the aim ring waits between them'],
};
const STILL_CAPS:Record<GameId,string[]>={
 kitrush:['Twelve clean swipes make a Clean Run.','Read the whole wave: leave the other team’s boot.','The sky darkens as the run goes on.','Your kit can switch mid-run.'],
 snake:['Collect quickly for a Quick chain.','Fill a line of the formation: midfield four.','Each level brings a new formation and a new ground.','Plan your turns as the line gets long.'],
 runner:['A defender ahead: change lane or play the skill.','Time the jump or slide past the tackle.','Collect footballs on the way.','Finish the run with a shot.'],
 tennis:['Over the net and into the court.','Get to the ball before it bounces twice.','The score sits at the top.','Later courts add trick shots.'],
 pinball:['Bumpers send the ball flying.','Flip it back up the table.','Score past the goalkeeper.','A goal lights up the table.'],
 puzzle:['Pass around the defender.','Then find the striker.','Endless Run: harder every puzzle.','Finish with a shot on goal.'],
 airhockey:['Keep the rally going.','Swipe into the puck for a smash.','Bank shots score extra.','Each win brings a new opponent.'],
 lineup:['A tray of shapes and a bench.','A full line clears.','Drag a shape to its place.','The referee blocks a square: play around him.'],
 trophydrop:['Aim, then drop.','Merges can chain.','The cabinet gets smaller.','Merge all the way up to a trophy.'],
 rollball:['Time your run between the crabs.','Watch the sweepers, then go.','Arrows make you fast.','Go slow on the narrow planks.'],
 ballblaster:['Fill the Super bar, hold until it is red, then kick.','Boss wave: keep hitting the Mega Mannequin.','Target practice: pick a target and strike through the ball.','Stop them before they reach your goal.'],
};
export function gameStills(id:GameId,max=4):GameShot[]{
 return (MEDIA.shots[id]??[]).slice(0,max).map((s,i)=>({src:`${SHOTS_DIR}/${s.file}`,w:s.w,h:s.h,alt:STILL_WORDS[id][i]??`${GAME_CLIP_DEFS[id].name}, picture ${i+1}`,caption:STILL_CAPS[id][i]??''}));
}
/** Inside the island: the 3D island game around the arcade. Order is the gallery's order. */
const ISLAND_DEFS:ClipDef[]=[
 {key:'walk',page:'/games',name:'Walking across Futbol Island',alt:'A player walks along a sunny path on Futbol Island past houses, trees and the sea',caption:'Walk anywhere on the island.'},
 {key:'fly',page:'/games',name:'Flying over Futbol Island with the jetpack',alt:'A player flies over the island with a jetpack, looking down on the town and the beach',caption:'Fly over it with the jetpack.'},
 {key:'stadium',page:'/games',name:'The stadium on the west coast of Futbol Island',alt:'The big stadium on the west coast of the island, with its stands and sponsor boards',caption:'Visit the stadium on the west coast.'},
 {key:'fishing',page:'/games',name:'Fishing on Futbol Island: a bite and a trophy card',alt:'Fishing from the pier: the float dips, the screen flashes for a bite and the catch is shown on a trophy card',caption:'Wait for the bite, reel in, win a trophy card.'},
 {key:'matchmix',page:'/games',name:'Live football matches on Futbol Island: five formats, four camera angles',alt:'Five quick cuts of live matches: a 7v7 game from behind the player, rooftop futsal from the side, a close view of a 9v9 shot on goal, the 11v11 stadium from the broadcast camera and a goal in beach soccer',caption:'Real matches in five formats, from four camera angles: 7v7, futsal, 9v9, 11v11 and beach soccer.'},
 {key:'match',page:'/games',name:'A live beach football match on Futbol Island',alt:'A beach football match on the sand: players run, pass and shoot at goal',caption:'Join a live match on the beach.'},
 {key:'kitstudio',page:'/games',name:'Designing a football shirt in the Kit Shop studio',alt:'The Kit Shop studio: a purple and gold shirt with a name and the number 7 on the back',caption:'Design your own kit in the Kit Shop.'},
 {key:'museum',page:'/games',name:'The football museum on Futbol Island',alt:'The football museum seen from above, with exhibits of shirts, balls and trophies',caption:'Explore the football museum.'},
 {key:'room',page:'/games',name:'The arcade room on Futbol Island',alt:'The arcade room on the island with its game machines in a row',caption:'The arcade room, where these games live.'},
 {key:'plaza',page:'/games',name:'Meeting friends in the plaza on Futbol Island',alt:'Players meet in the town plaza, waving and passing a ball to each other',caption:'Meet friends in the plaza.'},
];
/** The clip that leads /games (Nov 20 2026, owner: Futbol Island is the primary game). One key: swap it for a new montage's
 * key (an island clip defined above) and the hub's lead block, its preload and the gallery's skip all follow. */
/** Nov 20 2026 (owner: "lead with clip of playing on the different formats and different angles. make sure the quality is high and not
 * blurry"): matchmix, real joined play recorded from the game's WebGL canvas at 1920x1080 / 30 fps and cut to 1280x720 (the only
 * clip above 720 px: it fills the lead block at desktop widths). Order: 7v7 Behind you, futsal Side, 9v9 Close, stadium 11v11
 * Broadcast, beach Broadcast (ends on a goal). Wide was too far away to read at this size. */
export const GAMES_LEAD_CLIP='matchmix';
/** The /games hero's phone picture beside the lead clip (Nov 20 2026, owner: "this screen shot should be the mobile version of the game
 *  and not an arcade"): the main island game on a phone, a 7v7 match with the touch controls; captured at 390 x 844 on the preview. */
export const GAMES_HERO_PHONE={src:'/games/shots/island-phone-7v7.webp',w:480,h:1039,alt:'Futbol Island on a phone: a 7v7 match on the island, the player in gold dribbling toward goal with the joystick and the Go! button on screen'};
export const islandClips=()=>ISLAND_DEFS.map(clip).filter((c):c is GameClip=>!!c);
/** Island stills (from the same takes), shown in the gallery between the clips. */
export function islandStills():GameShot[]{
 const words:Record<string,[string,string][]>={walk:[['Futbol Island on foot: the town square with its shops and benches','The town square'],['A path through the town toward the arcade building','On the way to the arcade']],
  stadium:[['The stadium plaza on the west coast, with the Welcome to the stadium banner','The stadium plaza'],['The stands of the stadium seen from the plaza','The stands']],
  fishing:[['The bite flash: something has taken the bait','A bite!'],['An octopus pulled up next to the ferry dock','Reeling in'],['The trophy card for an octopus caught at the pier','A trophy card for the catch']],
  fly:[['Looking down on the island town from the jetpack','From the jetpack'],['Flying out over the sea toward something shimmering in the water','Out over the sea']],
  room:[['The arcade room at night with its glowing game machines','The arcade room']]};
 return Object.entries(words).flatMap(([k,ws])=>(MEDIA.shots[k]??[]).slice(0,ws.length).map((s,i)=>({src:`${SHOTS_DIR}/${s.file}`,w:s.w,h:s.h,alt:ws[i][0],caption:ws[i][1]})));
}
/** Nov 18 2026 (Search Console: "Video isn't on a watch page"): these clips are supporting media here; each one's VideoObject
 *  and video sitemap entry live on its own watch page, /videos/<slug> (lib/site/videos.ts). */
