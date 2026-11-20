import {gameClip,HERO_CLIP,islandClips,type GameClip} from './gameMedia';
import {GAME_PAGES,GAMES_HUB} from './games';
import type {GameId} from './games';
import {fullUrl,guideVideo,type GuideVideo} from './guideVideos';
import {learnUrl} from './learnMedia';
import {abs,type Crumb} from './seo';
/**
 * Watch pages (Nov 18 2026, Search Console Video indexing: 0 indexed, "Video isn't on a watch page"). Google indexes a video only
 * on a page whose MAIN content is that video, so every clip on the site has its own page, /videos/<slug>, with the player at the
 * top, its title, what it shows, its length and date, and a button into the game. Each watch page carries the clip's only
 * VideoObject and is its <loc> in /sitemap-video.xml; the pages the clip also plays on (/games, /games/<slug>, three guides)
 * keep the clip for readers, emit no VideoObject, and link here ("Watch the full clip"). /videos lists every watch page.
 * Media and sizes come from lib/site/gameMedia.ts (gameMedia.json) and lib/site/guideVideos.ts (public/learn/manifest.json):
 * a clip whose files are missing simply has no watch page. Spanish pages keep their clips without watch pages for now.
 * Tests: tests/seo-video.cjs.
 */
export const VIDEOS_PATH='/videos';
export type VideoGroup='games'|'island'|'lessons';
export const VIDEO_GROUPS:readonly {id:VideoGroup;title:string;line:string}[]=[
 {id:'games',title:'Arcade games',line:'Real play from the arcade games, recorded on a phone screen.'},
 {id:'island',title:'Inside the island',line:'The 3D island around the arcade: walking, flying, fishing, matches and more.'},
 {id:'lessons',title:'Lessons and quizzes',line:'How the football lessons and quizzes look when you play them.'},
];
type Link={href:string;label:string};
type Def={slug:string;key:string;group:VideoGroup;title:string;text:readonly string[]};
export type WatchVideo=Def&{path:string;poster:string;pw?:number;ph?:number;posterSrc:string;mp4Src:string;webmSrc?:string;contentUrl:string;w:number;h:number;
 seconds:number;uploadDate:string;play:Link;origin:Link};
/** The words: title (the h1, the VideoObject name and the sitemap title; 46 characters at most so the tab title keeps its
 *  " · Futbol Island"), and two to four plain sentences of what the clip shows, written from its alt text and caption. */
const GAME_DEFS:Record<GameId,Omit<Def,'key'|'group'>>={
 kitrush:{slug:'kit-rush-gameplay',title:'Kit Rush gameplay: swiping the team kit',text:['Shirts, boots and balls fly up the screen in Kit Rush, played on a phone.','A finger swipes through the kit in the team’s own colours and leaves the other team’s kit alone.','Each wave comes faster, so you have to read the colours quickly.']},
 snake:{slug:'squad-snake-gameplay',title:'Squad Snake gameplay: building the team',text:['The captain leads a line of numbered players across the pitch in Squad Snake.','Every team-mate the captain reaches joins the end of the line, in position order.','The line grows longer as the squad fills up, so turning takes more care.']},
 runner:{slug:'breakaway-run-gameplay',title:'Breakaway Run gameplay: beating the tackles',text:['A player dribbles down a coast road with three lanes in Breakaway Run.','Defenders come in from ahead, and the player switches lanes, jumps or slides to get past them.','Footballs along the road add to the score.']},
 tennis:{slug:'futbol-tennis-gameplay',title:'Futbol Tennis gameplay: a rally over the net',text:['Two players kick a football back and forth over a net on a clay court in Futbol Tennis.','Each kick has to land inside the court before the other player can reach it.','The score sits at the top of the screen.']},
 pinball:{slug:'futbol-pinball-gameplay',title:'Futbol Pinball gameplay: flippers, bumpers',text:['A football races around a pinball table drawn like a pitch in Futbol Pinball.','It bounces off the bumpers, and two flippers kick it back up toward the goal.','A goalkeeper guards the goal, so you aim for the gaps.']},
 puzzle:{slug:'pass-puzzles-gameplay',title:'Pass Puzzles gameplay: beat the defenders',text:['Passes travel from player to player around the defenders in Pass Puzzles.','Each pass has to find an open team-mate, and the last one goes into the goal.','Every puzzle sets the players out in a new picture.']},
 airhockey:{slug:'air-futbol-gameplay',title:'Air Futbol gameplay: air hockey on a pitch',text:['Air Futbol is air hockey on a small football pitch, played on a phone.','The teal striker hits the puck up the pitch and scores in the red goal at the top.','Shots that bounce off a side wall first score extra points.']},
 lineup:{slug:'line-up-gameplay',title:'Line Up! gameplay: filling rows of players',text:['Shapes made of players wait in a tray under the pitch in Line Up!','Each shape is dragged onto the pitch, and a full row or column clears with a burst of points.','You plan where the next shapes will fit.']},
 trophydrop:{slug:'trophy-drop-gameplay',title:'Trophy Drop gameplay: merging in the cabinet',text:['Balls, boots and gloves drop into a glass trophy cabinet in Trophy Drop.','When two of the same item touch, they merge into the next, bigger item.','One merge can set off another, in a chain.']},
 rollball:{slug:'roll-it-in-gameplay',title:'Roll It In gameplay: a ball rolls to goal',text:['A football rolls through a puzzle course in Roll It In.','It takes a metal ramp, jumps a gap over the water and presses a plate that opens the gate.','Then it rolls into the goal at the end of the course.']},
 ballblaster:{slug:'ball-blaster-gameplay',title:'Ball Blaster gameplay: kicking at robots',text:['A football flies up the pitch and breaks a wind-up robot in Ball Blaster.','A POW! burst shows the hit.','You aim each kick and break the robots before they reach your goal.']},
};
const HERO_DEF:Omit<Def,'key'|'group'>={slug:'three-arcade-games-on-a-phone',title:'Three soccer arcade games played on a phone',text:['Three phone screens play side by side: Kit Rush, Squad Snake and Air Futbol.','In the first, kit flies up to be swiped; in the second, a line of players winds across the pitch; in the third, a puck crosses a small pitch.','All three are real play recorded on a phone.']};
const ISLAND_DEFS:Record<string,Omit<Def,'key'|'group'>>={
 walk:{slug:'walking-across-futbol-island',title:'Walking across Futbol Island',text:['A player walks along a sunny path on Futbol Island.','The path goes past houses, trees and shops, with the sea beside it.','You can walk anywhere on the island in the browser game.']},
 fly:{slug:'jetpack-flight-over-futbol-island',title:'Flying over Futbol Island with a jetpack',text:['A player lifts off with a jetpack and flies over Futbol Island.','The town, the beach and the sea pass underneath.','From the air you can see where everything on the island is.']},
 stadium:{slug:'futbol-island-stadium',title:'The stadium on Futbol Island’s west coast',text:['This clip visits the big stadium on the west coast of Futbol Island.','You see its stands, the plaza in front of it and the sponsor boards around the pitch.','Players can walk right up to it and look around.']},
 fishing:{slug:'fishing-on-futbol-island',title:'Fishing on Futbol Island: a bite and a card',text:['A player fishes from the pier on Futbol Island.','The float dips, the screen flashes for a bite, and the catch is reeled in.','Each catch is shown on a trophy card for the Fishbook.']},
 match:{slug:'beach-football-match',title:'A beach football match on Futbol Island',text:['Players run, pass and shoot at goal in a football match on the sand.','Matches on the beach are live, so you can join one that is already being played.','The clip shows real play from the island.']},
 kitstudio:{slug:'kit-shop-shirt-design',title:'Designing a shirt in the Kit Shop studio',text:['The Kit Shop studio lets you design your own football shirt.','In this clip the shirt is purple and gold, with a name and the number 7 on the back.','You pick the colours, the name and the number.']},
 museum:{slug:'futbol-island-football-museum',title:'The football museum on Futbol Island',text:['The football museum on Futbol Island, seen from above.','Its rooms hold exhibits of shirts, balls and trophies from football history.','You can walk through it and stop at any exhibit.']},
 room:{slug:'futbol-island-arcade-room',title:'The arcade room on Futbol Island',text:['The arcade room is where the island’s football games live.','Game machines stand in a row, and each one is a different game.','Walk up to a machine to start playing.']},
 plaza:{slug:'meeting-friends-in-the-plaza',title:'Meeting friends in the Futbol Island plaza',text:['Players meet in the town plaza on Futbol Island.','They wave and pass a ball to each other.','The plaza is a place where friends can meet and play together.']},
};
const GUIDE_DEFS:Record<string,Omit<Def,'key'|'group'>>={
 pass_puzzles:{slug:'pass-puzzle-around-the-defender',title:'Pass puzzle: a pass around the defender',text:['A player draws a pass around the defender to find a team-mate in space.','It is one of the pass puzzles in Futbol Island.','The same idea is taught in the passing and support lessons.']},
 quiz_question:{slug:'soccer-quiz-tap-the-best-spot',title:'Soccer quiz: tap the best spot on the pitch',text:['A Futbol Island quiz question asks where a team-mate should stand.','The child answers by tapping the best spot on the pitch.','Then the coach explains why that spot is the right answer.']},
 lesson_field:{slug:'football-lesson-on-the-pitch',title:'A football lesson with moving players',text:['A play unfolds on the pitch with moving players in a Futbol Island lesson.','A coach card at the side says what to look for.','Watching the play first helps you understand the idea before you try it.']},
};
const PLAY_ISLAND:Link={href:'/play',label:'Play Futbol Island'};
const fromClip=(c:GameClip,d:Omit<Def,'key'|'group'>,group:VideoGroup,play:Link,origin:Link):WatchVideo=>({...d,key:c.key,group,path:`${VIDEOS_PATH}/${d.slug}`,
 poster:c.poster,pw:c.pw,ph:c.ph,posterSrc:c.poster,mp4Src:c.mp4,webmSrc:c.webm,contentUrl:abs(c.mp4),w:c.w,h:c.h,seconds:c.seconds,uploadDate:c.uploaded,play,origin});
const fromGuide=(v:GuideVideo,d:Omit<Def,'key'|'group'>,play:Link,origin:Link):WatchVideo=>({...d,key:v.key,group:'lessons',path:`${VIDEOS_PATH}/${d.slug}`,
 poster:v.poster,posterSrc:learnUrl(v.poster),mp4Src:learnUrl(v.mp4!),webmSrc:v.webm&&learnUrl(v.webm),contentUrl:fullUrl(learnUrl(v.mp4!)),w:v.width,h:v.height,
 seconds:v.seconds,uploadDate:v.uploadDate,play,origin});
let cache:WatchVideo[]|null=null;
/** Every watch page, in the hub's order: the arcade games, the island, the lessons. */
export function allWatchVideos():WatchVideo[]{
 if(cache)return cache;
 const out:WatchVideo[]=[];
 if(HERO_CLIP)out.push(fromClip(HERO_CLIP,HERO_DEF,'games',{href:GAME_PAGES[0].play,label:`Play ${GAME_PAGES[0].name}`},{href:GAMES_HUB.path,label:'See all the games'}));
 for(const g of GAME_PAGES){const c=gameClip(g.id);if(c)out.push(fromClip(c,GAME_DEFS[g.id],'games',{href:g.play,label:`Play ${g.name}`},{href:g.path,label:`How to play ${g.name}`}));}
 for(const c of islandClips()){const d=ISLAND_DEFS[c.key];if(d)out.push(fromClip(c,d,'island',PLAY_ISLAND,{href:`${GAMES_HUB.path}#island`,label:'More about the island'}));}
 const puzzle=GAME_PAGES.find(g=>g.id==='puzzle')!;
 const guidePlay:Record<string,[Link,Link]>={pass_puzzles:[{href:puzzle.play,label:`Play ${puzzle.name}`},{href:'/learn/passing-and-support',label:'Read the passing and support lessons'}],
  quiz_question:[{href:'/learn/soccer-quiz-for-kids',label:'Try the soccer quiz'},{href:'/learn/lessons',label:'See all the lessons'}],
  lesson_field:[{href:'/learn/lessons',label:'Open the lessons'},PLAY_ISLAND]};
 for(const [key,d] of Object.entries(GUIDE_DEFS)){const v=guideVideo(guidePathOf(key));if(v)out.push(fromGuide(v,d,...guidePlay[key]));}
 cache=out;return out;
}
const GUIDE_PATHS:Record<string,string>={pass_puzzles:'/learn/passing-and-support',quiz_question:'/learn/soccer-quiz-for-kids',lesson_field:'/learn/lessons'};
const guidePathOf=(key:string)=>GUIDE_PATHS[key];
export const watchVideoBySlug=(slug:string)=>allWatchVideos().find(v=>v.slug===slug);
/** The watch page of a clip by its media key (game id, island key, 'hero' or a guide clip's key), for "Watch the full clip". */
export const watchPathFor=(key:string)=>allWatchVideos().find(v=>v.key===key)?.path??null;
export const videoCrumbs=(v?:WatchVideo):Crumb[]=>[{name:'Home',path:'/'},{name:'Videos',path:VIDEOS_PATH},...(v?[{name:v.title,path:v.path}]:[])];
export const isPortrait=(v:{w:number;h:number})=>v.h>v.w;
const DATE_FMT=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'America/Los_Angeles'});
export const videoDateLabel=(v:WatchVideo)=>DATE_FMT.format(new Date(v.uploadDate));
/** The search snippet, 120 to 155 characters (SEO phase 2, Nov 20 2026: 20 of the 24 were 92 to 119): the first sentence of
 *  what the clip shows, then the first template tail that fits. A short first sentence takes the second sentence too. The
 *  tails are built from the clip's own length and group, so no fact is added. Checked by tests/seo-video.cjs. */
const GROUP_TAIL:Record<VideoGroup,string>={games:'a free soccer game for kids',island:'a free 3D football game for kids',lessons:'a free football learning game for kids'};
export function watchMetaDescription(v:WatchVideo):string{
 const n=v.seconds,tails=[`Watch the ${n}-second clip of real play from Futbol Island, ${GROUP_TAIL[v.group]} aged 7 to 12.`,`Watch the ${n}-second clip from Futbol Island, ${GROUP_TAIL[v.group]}.`,
  `Watch the ${n}-second clip of real play from Futbol Island.`,`Watch the ${n}-second clip from Futbol Island.`,`A ${n}-second clip.`];
 for(const base of [v.text[0],`${v.text[0]} ${v.text[1]}`]){const hit=tails.map(t=>`${base} ${t}`).find(x=>x.length>=120&&x.length<=155);if(hit)return hit;}
 return `${v.text[0]} ${tails[3]}`;
}
export const watchDescription=(v:WatchVideo)=>v.text.join(' ');
/** Other clips for "More videos": the same shape (tall or wide), starting after this one, so the row's pictures match. */
export function moreVideos(v:WatchVideo,n=6):WatchVideo[]{
 const all=allWatchVideos(),i=all.indexOf(v),ring=[...all.slice(i+1),...all.slice(0,i)];
 return ring.filter(x=>isPortrait(x)===isPortrait(v)).slice(0,n);
}
/** schema.org VideoObject: the clip's ONE structured-data home. No embedUrl: there is no separate embeddable player page. */
export const watchVideoLd=(v:WatchVideo)=>({'@context':'https://schema.org','@type':'VideoObject','@id':abs(v.path)+'#video',name:v.title,description:watchDescription(v),
 thumbnailUrl:[abs(v.poster)],uploadDate:v.uploadDate,duration:`PT${v.seconds}S`,contentUrl:v.contentUrl,width:v.w,height:v.h,
 isFamilyFriendly:true,inLanguage:'en',isAccessibleForFree:true,mainEntityOfPage:abs(v.path)});
const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
/** /sitemap-video.xml (Google video sitemap): one <url> per watch page, one <video:video> in each, the same words as the page. */
export function videoSitemapXml():string{
 const urls=allWatchVideos().map(v=>`<url><loc>${esc(abs(v.path))}</loc><video:video><video:thumbnail_loc>${esc(abs(v.poster))}</video:thumbnail_loc><video:title>${esc(v.title)}</video:title><video:description>${esc(watchDescription(v))}</video:description><video:content_loc>${esc(v.contentUrl)}</video:content_loc><video:duration>${v.seconds}</video:duration><video:publication_date>${esc(v.uploadDate)}</video:publication_date><video:family_friendly>yes</video:family_friendly><video:requires_subscription>no</video:requires_subscription></video:video></url>`);
 return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${urls.join('\n')}\n</urlset>\n`;
}
/** The hub and every watch page, for the main sitemap (lib/site/paths.ts). */
export const VIDEOS_UPDATED='2026-11-18';
export const videoSitePaths=()=>[VIDEOS_PATH,...allWatchVideos().map(v=>v.path)];
