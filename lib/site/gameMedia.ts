import M from './gameMedia.json';
import {ARCADE_GAME_COUNT} from '../arcade/arcadeCatalog';
import {numberWord} from '../numberWord';
import type {GameId,GameShot} from './games';
import {abs} from './seo';
/**
 * Gameplay footage for /games and /games/<slug> (Nov 16 2026, owner: "include more screenshots of the game and videos of the
 * game. Make this page more visual and engaging"). Every clip and still is a REAL capture: the production build driven in a
 * headless Chrome (arcade games on a 390x844 phone, the island at 1280x720), cut to a silent
 * 6-10 s loop, 720 px on the long side, H.264 MP4 + VP9 WebM, with a sharper still as the poster. Four island clips (museum,
 * beach match, Kit Shop studio, plaza) are re-cuts of the Nov 3 /learn captures in public/learn/video. Sizes, durations and
 * picture sizes come from lib/site/gameMedia.json, written by the capture's encode step, so nothing here is typed by hand.
 * Files: public/games/clips/<key>.{mp4,webm,webp}, public/games/shots/<key>-<n>.webp. Tests: tests/seo-games.cjs, seo-video.cjs.
 * Nov 17 2026: Line Up!, Trophy Drop and Clear the Box were captured the same way (dev build, CDP screencast at 390x844 DPR 2, a
 * scripted player using real mouse drags and taps); the poster is still 1 (the clip's first frame).
 */
type ClipFile={w:number;h:number;seconds:number;mp4:number;webm:number;poster:{w:number;h:number;bytes:number}};
type ShotFile={file:string;w:number;h:number;bytes:number};
const MEDIA=M as unknown as {clips:Record<string,ClipFile>;shots:Record<string,ShotFile[]>};
export const CLIPS_DIR='/games/clips',SHOTS_DIR='/games/shots';
/** The day these clips were first published (VideoObject.uploadDate, video sitemap publication_date). */
export const GAME_CLIPS_UPLOADED='2026-11-16T12:00:00-08:00';
export type GameClip={key:string;name:string;caption:string;alt:string;page:string;w:number;h:number;seconds:number;mp4:string;webm:string;poster:string;pw:number;ph:number};
type ClipDef={key:string;name:string;caption:string;alt:string;page:string};
const clip=(d:ClipDef):GameClip|null=>{const f=MEDIA.clips[d.key];if(!f)return null;
 return {...d,w:f.w,h:f.h,seconds:Math.max(1,Math.round(f.seconds)),mp4:`${CLIPS_DIR}/${d.key}.mp4`,webm:`${CLIPS_DIR}/${d.key}.webm`,poster:`${CLIPS_DIR}/${d.key}.webp`,pw:f.poster.w,ph:f.poster.h};};
/** The hub's hero loop: three of the phone games side by side in one file (one player, not three). */
export const HERO_CLIP=clip({key:'hero',page:'/games',name:'Kit Rush, Squad Snake and Air Futbol, played on a phone',
 alt:'Three phone screens side by side: kit flying up to be swiped in Kit Rush, a line of players in Squad Snake and an air hockey pitch in Air Futbol',
 caption:`Real play from three of the ${numberWord(ARCADE_GAME_COUNT)} games, recorded on a phone screen.`});
/** One clip per arcade game, keyed by the cabinet id. The words say what the clip shows. */
const GAME_CLIP_DEFS:Record<GameId,Omit<ClipDef,'key'|'page'>>={
 kitrush:{name:'Kit Rush gameplay: swiping a team kit out of the air',alt:'Kit Rush gameplay on a phone: shirts, boots and balls fly up and a finger swipes through the team kit',caption:'Kit Rush: swipe your own kit, leave the other team’s.'},
 snake:{name:'Squad Snake gameplay: the captain collects team-mates',alt:'Squad Snake gameplay on a phone: the captain leads a growing line of numbered players across the pitch',caption:'Squad Snake: every team-mate joins the line in position order.'},
 runner:{name:'Breakaway Run gameplay: dribbling down the coast road',alt:'Breakaway Run gameplay: a player dribbles along three lanes, switching lanes and jumping past defenders',caption:'Breakaway Run: switch lanes, jump and slide past the tackles.'},
 tennis:{name:'Futbol Tennis gameplay: a rally over the net',alt:'Futbol Tennis gameplay on a phone: two players kick the ball back and forth over a net on a clay court',caption:'Futbol Tennis: kick, lob and drop the ball over the net.'},
 pinball:{name:'Futbol Pinball gameplay: flippers and bumpers on a pitch table',alt:'Futbol Pinball gameplay on a phone: the ball bounces off bumpers and the flippers kick it back up the table',caption:'Futbol Pinball: two flippers, a goalkeeper and a wall.'},
 puzzle:{name:'Pass Puzzles gameplay: passing around the defenders',alt:'Pass Puzzles gameplay on a phone: passes travel from player to player around the defenders toward the goal',caption:'Pass Puzzles: find the open team-mate, then the goal.'},
 airhockey:{name:'Air Futbol gameplay: air hockey on a football pitch',alt:'Air Futbol gameplay on a phone: the teal striker hits the puck up the small pitch and scores in the red goal',caption:'Air Futbol: guard your goal and bank it off the wall.'},
 lineup:{name:'Line Up! gameplay: shapes of players fill the lines',alt:'Line Up! gameplay on a phone: shapes of players are dragged from the tray onto the pitch and a full line clears',caption:'Line Up!: fill a row or a column and it clears.'},
 trophydrop:{name:'Trophy Drop gameplay: dropping and merging in the trophy cabinet',alt:'Trophy Drop gameplay on a phone: balls, boots and gloves drop into a glass cabinet and two of the same merge',caption:'Trophy Drop: two of the same merge into the next.'},
 streetdash:{name:'Street Dash gameplay: a side-on run with the ball',alt:'Street Dash gameplay on a phone: the player slides under a banner, shoots the ball at a crate and jumps a sliding tackle',caption:'Street Dash: jump, slide and shoot on the run.'},
 ballblaster:{name:'Ball Blaster gameplay: kicking footballs at wind-up robots',alt:'Ball Blaster gameplay on a phone: a ball flies up the pitch and breaks a wind-up robot into pieces with a POW! burst',caption:'Ball Blaster: aim, kick and break the robots before they reach your goal.'},
 clearbox:{name:'Clear the Box gameplay: players run out of the penalty box',alt:'Clear the Box gameplay on a phone: tapped players sprint out of the penalty box and the next box slides in',caption:'Clear the Box: tap a player whose lane is free.'},
};
const gamePaths:Record<GameId,string>={kitrush:'/games/soccer-swipe-game',snake:'/games/soccer-snake-game',runner:'/games/soccer-runner-game',tennis:'/games/soccer-tennis-game',
 pinball:'/games/soccer-pinball',puzzle:'/games/soccer-passing-puzzle-game',airhockey:'/games/air-hockey-soccer-game',lineup:'/games/soccer-block-puzzle-game',
 trophydrop:'/games/soccer-merge-game',clearbox:'/games/soccer-tap-puzzle-game',streetdash:'/games/soccer-side-scroller-game',ballblaster:'/games/soccer-shooting-game'};
export const gameClip=(id:GameId)=>clip({key:id,page:gamePaths[id],...GAME_CLIP_DEFS[id]});
/** New stills of each game (beyond the two hand-made ones in lib/site/games.ts), with their own alt text. */
const STILL_WORDS:Record<GameId,string[]>={
 kitrush:['Kit Rush mid-wave: kit in two team colours spins in the air above the goal','Kit Rush later in a run: more kit in the air and the score climbing','Kit Rush near the end of a run, with the lives at the top of the screen'],
 snake:['Squad Snake: the captain turns with team-mates following in a line','Squad Snake: the line of players grows longer and the call THROUGH PASS! appears','Squad Snake at level 2: a new formation and new players to collect'],
 runner:['Breakaway Run: the player dribbles toward a defender and a cone, with the Step-over skill button lit','Breakaway Run: a red defender lunges across the road ahead of the player','Breakaway Run: footballs in a line down the road with a defender far ahead'],
 tennis:['Futbol Tennis: the ball flies over the net toward the other player','Futbol Tennis: a player runs to reach the ball before it lands','Futbol Tennis: a rally on the clay court with the score at the top'],
 pinball:['Futbol Pinball: the ball races up the table past the bumpers','Futbol Pinball: a flipper kicks the ball back toward the goal','Futbol Pinball: the ball bounces between the bumpers near the goalkeeper'],
 puzzle:['Pass Puzzles: a pass goes from one team-mate to another around a defender','Pass Puzzles: the ball travels toward the striker near the goal','Pass Puzzles: a new puzzle with the players set out on the pitch'],
 airhockey:['Air Futbol: GOAL! The puck flies past the red striker into the top goal','Air Futbol: a bank shot goal off the side wall, worth 75 extra points','Air Futbol: a fast rebound off the side wall'],
 lineup:['Line Up! at the start of a run: a few shapes on the pitch and two left in the tray','Line Up!: a row fills and LINE UP! and +100 appear over the pitch','Line Up!: a shape of players dragged above a crowded pitch'],
 trophydrop:['Trophy Drop at the start: a boot hangs over the cabinet, with a glove and balls at the bottom','Trophy Drop: a CHAIN x2 burst as two items merge on the pile','Trophy Drop at level 2: the cabinet gets smaller, with a medal in the pile'],
 streetdash:['Street Dash: a shot breaks a target for +60 and STREAK X2 bursts over the street','Street Dash: the glowing SHOOT button and a dotted line from the ball to a target ahead','Street Dash: the player jumps a puddle on the street, with stars to collect'],
 ballblaster:['Ball Blaster: a ball breaks a robot and POW! bursts over the pitch','Ball Blaster: a water barrel bursts and knocks over the robots next to it','Ball Blaster: the dotted aim line curls round a shield-bot'],
 clearbox:['Clear the Box at box 2: players with arrows in a chalk penalty box under a 30 second clock','Clear the Box: CLEAN X2! and +540 over the new box 3, after a box with no foul','Clear the Box at box 3: a dark defender stands among the players in the middle of the box'],
};
const STILL_CAPS:Record<GameId,string[]>={
 kitrush:['Read the whole wave before you swipe.','Waves get faster as the run goes on.','Three lives: the whistle costs one.'],
 snake:['Players join in position order.','The line grows as the squad fills up.','Each level brings a new formation.'],
 runner:['A defender ahead: change lane or play the skill.','Time the jump or slide past the tackle.','Collect footballs on the way.'],
 tennis:['Over the net and into the court.','Get to the ball before it bounces twice.','The score sits at the top.'],
 pinball:['Bumpers send the ball flying.','Flip it back up the table.','Score past the goalkeeper.'],
 puzzle:['Pass around the defender.','Then find the striker.','Each puzzle is a new picture.'],
 airhockey:['Score in the top goal.','Bank shots score extra.','Use the side walls.'],
 lineup:['Three shapes in the tray.','A full line clears.','Drag a shape to its place.'],
 trophydrop:['Aim, then drop.','Merges can chain.','The cabinet gets smaller.'],
 streetdash:['Shots in a row raise the streak.','Shoot when the button glows.','Jump puddles, collect stars.'],
 ballblaster:['Break two things with one ball for a trick.','Barrels and towers make chain reactions.','Curl the ball round a shield.'],
 clearbox:['Every arrow shows a lane.','Clean boxes in a row score more.','Defenders never move.'],
};
export function gameStills(id:GameId,max=3):GameShot[]{
 return (MEDIA.shots[id]??[]).slice(0,max).map((s,i)=>({src:`${SHOTS_DIR}/${s.file}`,w:s.w,h:s.h,alt:STILL_WORDS[id][i]??`${GAME_CLIP_DEFS[id].name}, picture ${i+1}`,caption:STILL_CAPS[id][i]??''}));
}
/** Inside the island: the 3D island game around the arcade. Order is the gallery's order. */
const ISLAND_DEFS:ClipDef[]=[
 {key:'walk',page:'/games',name:'Walking across Futbol Island',alt:'A player walks along a sunny path on Futbol Island past houses, trees and the sea',caption:'Walk anywhere on the island.'},
 {key:'fly',page:'/games',name:'Flying over Futbol Island with the jetpack',alt:'A player flies over the island with a jetpack, looking down on the town and the beach',caption:'Fly over it with the jetpack.'},
 {key:'stadium',page:'/games',name:'The stadium on the west coast of Futbol Island',alt:'The big stadium on the west coast of the island, with its stands and sponsor boards',caption:'Visit the stadium on the west coast.'},
 {key:'fishing',page:'/games',name:'Fishing on Futbol Island: a bite and a trophy card',alt:'Fishing from the pier: the float dips, the screen flashes for a bite and the catch is shown on a trophy card',caption:'Wait for the bite, reel in, win a trophy card.'},
 {key:'match',page:'/games',name:'A live beach football match on Futbol Island',alt:'A beach football match on the sand: players run, pass and shoot at goal',caption:'Join a live match on the beach.'},
 {key:'kitstudio',page:'/games',name:'Designing a football shirt in the Kit Shop studio',alt:'The Kit Shop studio: a purple and gold shirt with a name and the number 7 on the back',caption:'Design your own kit in the Kit Shop.'},
 {key:'museum',page:'/games',name:'The football museum on Futbol Island',alt:'The football museum seen from above, with exhibits of shirts, balls and trophies',caption:'Explore the football museum.'},
 {key:'room',page:'/games',name:'The arcade room on Futbol Island',alt:'The arcade room on the island with its game machines in a row',caption:'The arcade room, where these games live.'},
 {key:'plaza',page:'/games',name:'Meeting friends in the plaza on Futbol Island',alt:'Players meet in the town plaza, waving and passing a ball to each other',caption:'Meet friends in the plaza.'},
];
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
/** schema.org VideoObject (the same words as the visible caption). */
export const gameClipLd=(c:GameClip,withContext=true)=>({...(withContext?{'@context':'https://schema.org'}:{}),'@type':'VideoObject',name:c.name,description:`${c.caption} ${c.alt}.`,
 thumbnailUrl:[abs(c.poster)],uploadDate:GAME_CLIPS_UPLOADED,duration:`PT${c.seconds}S`,contentUrl:abs(c.mp4),width:c.w,height:c.h,
 isFamilyFriendly:true,inLanguage:'en',isAccessibleForFree:true});
/** Clips listed for one page in /sitemap-video.xml. */
export const gameVideosFor=(pagePath:string):GameClip[]=>pagePath==='/games'?[HERO_CLIP,...islandClips()].filter((c):c is GameClip=>!!c)
 :(Object.keys(gamePaths) as GameId[]).filter(id=>gamePaths[id]===pagePath).map(gameClip).filter((c):c is GameClip=>!!c);
export const GAME_VIDEO_PAGES=['/games',...Object.values(gamePaths)];
