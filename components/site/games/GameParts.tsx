import Breadcrumbs from '@/components/site/Breadcrumbs';
import {allShots,GAME_NAMES,GAMES_NAMES,type GamePage,type GameShot} from '@/lib/site/games';
import {gameClip,gameStills,islandClips,islandStills,type GameClip} from '@/lib/site/gameMedia';
import LoopClip from './LoopClip';
import {watchPathFor} from '@/lib/site/videos';
import type {Crumb} from '@/lib/site/seo';
import site from '@/app/(site)/site.module.css';
import g from './games.module.css';
/**
 * Parts of the arcade games' search pages (app/(site)/games; lib/site/games.ts). Server-rendered; the one client island is
 * LoopClip (a gameplay loop that mounts its <video> only when it may play, lib/site/gameMedia.ts). No game canvas. Pictures are
 * plain lazy <img> with their real size, and every clip box has its poster's aspect ratio, so nothing shifts as media loads.
 */
/** The gold button: the one way from a game page into that game (the deep link /arcade?game=<id>). Label: UI sans 800 (.cta). */
export const PlayLink=({game}:{game:GamePage})=><a className={site.cta} href={game.play} data-play={game.id}>Play {game.name}</a>;
export function GameIntro({crumbs,h1,lead,game}:{crumbs:readonly Crumb[];h1:string;lead:string;game?:GamePage}){
 return <header className={site.intro}>
  <Breadcrumbs crumbs={crumbs}/>
  <h1 className={site.title}>{h1}</h1>
  <p className={site.lead}>{lead}</p>
  <p className={site.caption}>{game?GAME_NAMES:GAMES_NAMES}</p>
  {game&&<div className={g.playRow}><PlayLink game={game}/></div>}
 </header>;
}
const Shot=({s}:{s:GameShot})=><figure className={g.shot}>
 {/* a plain <img> on purpose: a small static WebP with its own width and height (no optimiser round trip) */}
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img src={s.src} alt={s.alt} width={s.w} height={s.h} loading="lazy" decoding="async"/>
 <figcaption>{s.caption}</figcaption>
</figure>;
/** A clip in its frame, with its caption and a link to its watch page (Nov 18 2026, lib/site/videos.ts). */
export function ClipFigure({c,auto,priority,className}:{c:GameClip;auto?:boolean;priority?:boolean;className?:string}){
 const watch=watchPathFor(c.key);
 return <figure className={`${g.clipFig}${className?' '+className:''}`}>
  <LoopClip name={c.name} poster={c.poster} mp4={c.mp4} webm={c.webm} w={c.w} h={c.h} pw={c.pw} ph={c.ph} alt={c.alt} auto={auto} priority={priority}/>
  <figcaption>{c.caption} <span className={g.secs}>{c.seconds} s, no sound.</span>{watch&&<> <a href={watch} data-watch-link="">Watch the full clip</a></>}</figcaption>
 </figure>;
}
/** A game page's pictures: the gameplay clip first, then the hand-made screenshots and the new stills, in one well. */
export function Shots({game}:{game:GamePage}){
 const c=gameClip(game.id),shots=allShots(game);
 const wide=shots[0].w>shots[0].h;
 return <div className={g.shots}><div className={`${g.media}${wide?' '+g.mediaWide:''}`}>
  {c&&<ClipFigure c={c} className={g.mediaClip} priority/>}
  <div className={`${g.strip}${wide?' '+g.stripWide:''}`}>{shots.map(s=><Shot key={s.src} s={s}/>)}</div>
 </div></div>;
}
/** The hub's block for one game: its clip (hover or tap to play), what kind of game it is, what it teaches, three stills, links. */
export function GameFeature({game,flip}:{game:GamePage;flip?:boolean}){
 const c=gameClip(game.id),kind=game.h1.split(':')[0],stills=gameStills(game.id,3);
 const wide=(c?c.pw:game.shots[0].w)>(c?c.ph:game.shots[0].h);
 return <li className={`${g.feature}${flip?' '+g.flip:''}${wide?' '+g.featureWide:''}`}>
  <div className={g.featureMedia}>{c?<ClipFigure c={c}/>:<Shot s={game.shots[0]}/>}</div>
  <div className={g.featureWords}>
   <h3 className={g.featureName}><a href={game.path}>{game.name}</a></h3>
   <span className={g.gameKind}>{kind}</span>
   <p>{game.blurb}. It teaches {game.skill[0].toLowerCase()+game.skill.slice(1)}.</p>
   {stills.length>0&&<ul className={g.thumbs} aria-label={`More pictures of ${game.name}`}>{stills.map(s=><li key={s.src}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={s.src} alt={s.alt} width={s.w} height={s.h} loading="lazy" decoding="async"/></li>)}</ul>}
   <span className={g.gameLinks}><a className={g.playNow} href={game.play}>Play {game.name}</a><a href={game.path}>How to play</a></span>
  </div>
 </li>;
}
/** "Inside the island": the island game's clips and stills in one row that swipes sideways (scroll snap, no script). */
export function IslandGallery(){
 const clips=islandClips(),stills=islandStills();
 const items:({c:GameClip}|{s:GameShot})[]=[];clips.forEach((c,i)=>{items.push({c});if(stills[i])items.push({s:stills[i]});});
 stills.slice(clips.length).forEach(s=>items.push({s}));
 return <ul className={g.gallery} aria-label="Pictures and clips from the island">
  {items.map(x=>'c' in x?<li key={x.c.key}><ClipFigure c={x.c}/></li>:<li key={x.s.src}><Shot s={x.s}/></li>)}
 </ul>;
}
export const gamesCss=g;
