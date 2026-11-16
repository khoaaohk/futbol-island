import M from './gameMedia.json';
import type {GameId,GameShot} from './games';
import {abs} from './seo';
/**
 * Gameplay footage for /games and /games/<slug> (Nov 16 2026, owner: "include more screenshots of the game and videos of the
 * game. Make this page more visual and engaging"). Every clip and still is a REAL capture: the production build driven in a
 * headless Chrome (arcade games on a 390x844 phone, Breakaway Run on a landscape phone, the island at 1280x720), cut to a silent
 * 6-10 s loop, 720 px on the long side, H.264 MP4 + VP9 WebM, with a sharper still as the poster. Four island clips (museum,
 * beach match, Kit Shop studio, plaza) are re-cuts of the Nov 3 /learn captures in public/learn/video. Sizes, durations and
 * picture sizes come from lib/site/gameMedia.json, written by the capture's encode step, so nothing here is typed by hand.
 * Files: public/games/clips/<key>.{mp4,webm,webp}, public/games/shots/<key>-<n>.webp. Tests: tests/seo-games.cjs, seo-video.cjs.
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
 caption:'Real play from three of the seven games, recorded on a phone screen.'});
/** One clip per arcade game, keyed by the cabinet id. The words say what the clip shows. */
const GAME_CLIP_DEFS:Record<GameId,Omit<ClipDef,'key'|'page'>>={
 kitrush:{name:'Kit Rush gameplay: swiping a team kit out of the air',alt:'Kit Rush gameplay on a phone: shirts, boots and balls fly up and a finger swipes through the team kit',caption:'Kit Rush: swipe your own kit, leave the other team’s.'},
 snake:{name:'Squad Snake gameplay: the captain collects team-mates',alt:'Squad Snake gameplay on a phone: the captain leads a growing line of numbered players across the pitch',caption:'Squad Snake: every team-mate joins the line in position order.'},
 runner:{name:'Breakaway Run gameplay: dribbling down the coast road',alt:'Breakaway Run gameplay: a player dribbles along three lanes, switching lanes and jumping past defenders',caption:'Breakaway Run: switch lanes, jump and slide past the tackles.'},
 tennis:{name:'Futbol Tennis gameplay: a rally over the net',alt:'Futbol Tennis gameplay on a phone: two players kick the ball back and forth over a net on a clay court',caption:'Futbol Tennis: kick, lob and drop the ball over the net.'},
 pinball:{name:'Futbol Pinball gameplay: flippers and bumpers on a pitch table',alt:'Futbol Pinball gameplay on a phone: the ball bounces off bumpers and the flippers kick it back up the table',caption:'Futbol Pinball: two flippers, a goalkeeper and a wall.'},
 puzzle:{name:'Pass Puzzles gameplay: passing around the defenders',alt:'Pass Puzzles gameplay on a phone: passes travel from player to player around the defenders toward the goal',caption:'Pass Puzzles: find the open team-mate, then the goal.'},
 airhockey:{name:'Air Futbol gameplay: air hockey on a football pitch',alt:'Air Futbol gameplay on a phone: the teal striker hits the puck up the small pitch toward the red goal',caption:'Air Futbol: guard your goal and bank it off the wall.'},
};
const gamePaths:Record<GameId,string>={kitrush:'/games/soccer-swipe-game',snake:'/games/soccer-snake-game',runner:'/games/soccer-runner-game',tennis:'/games/soccer-tennis-game',
 pinball:'/games/soccer-pinball',puzzle:'/games/soccer-passing-puzzle-game',airhockey:'/games/air-hockey-soccer-game'};
export const gameClip=(id:GameId)=>clip({key:id,page:gamePaths[id],...GAME_CLIP_DEFS[id]});
/** New stills of each game (beyond the two hand-made ones in lib/site/games.ts), with their own alt text. */
const STILL_WORDS:Record<GameId,string[]>={
 kitrush:['Kit Rush mid-wave: kit in two team colours spins in the air above the goal','Kit Rush later in a run: more kit in the air and the score climbing','Kit Rush near the end of a run, with the lives at the top of the screen'],
 snake:['Squad Snake: the captain turns with team-mates following in a line','Squad Snake: the line of players grows longer across the pitch','Squad Snake: the captain heads toward the next player to collect'],
 runner:['Breakaway Run: the player dribbles toward a defender on the coast road','Breakaway Run: jumping over a sliding tackle in the middle lane','Breakaway Run: collecting footballs further down the road'],
 tennis:['Futbol Tennis: the ball flies over the net toward the other player','Futbol Tennis: a player runs to reach the ball before it lands','Futbol Tennis: a rally on the clay court with the score at the top'],
 pinball:['Futbol Pinball: the ball races up the table past the bumpers','Futbol Pinball: a flipper kicks the ball back toward the goal','Futbol Pinball: the ball bounces between the bumpers near the goalkeeper'],
 puzzle:['Pass Puzzles: a pass goes from one team-mate to another around a defender','Pass Puzzles: the ball travels toward the striker near the goal','Pass Puzzles: a new puzzle with the players set out on the pitch'],
 airhockey:['Air Futbol: the striker blocks the puck in front of the goal','Air Futbol: the puck slides across the pitch toward the other goal','Air Futbol: a fast rebound off the side wall'],
};
const STILL_CAPS:Record<GameId,string[]>={
 kitrush:['Read the whole wave before you swipe.','Waves get faster as the run goes on.','Three lives: the whistle costs one.'],
 snake:['Players join in position order.','The line grows as the squad fills up.','Eleven players make a formation.'],
 runner:['A defender ahead: change lane.','Jump the sliding tackle.','Collect footballs on the way.'],
 tennis:['Over the net and into the court.','Get to the ball before it bounces twice.','The score sits at the top.'],
 pinball:['Bumpers send the ball flying.','Flip it back up the table.','Score past the goalkeeper.'],
 puzzle:['Pass around the defender.','Then find the striker.','Each puzzle is a new picture.'],
 airhockey:['Guard your goal.','Aim at the other goal.','Use the side walls.'],
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
 {key:'room',page:'/games',name:'The arcade room on Futbol Island',alt:'The arcade room on the island with its seven game machines in a row',caption:'The arcade room, where these seven games live.'},
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
