import Breadcrumbs from '@/components/site/Breadcrumbs';
import {GAME_NAMES,GAMES_NAMES,type GamePage,type GameShot} from '@/lib/site/games';
import type {Crumb} from '@/lib/site/seo';
import site from '@/app/(site)/site.module.css';
import g from './games.module.css';
/**
 * Server-rendered parts of the arcade games' search pages (app/(site)/games; lib/site/games.ts). Static HTML only: no game
 * canvas, no video, no client code. Pictures are plain lazy <img> with their real size, so nothing shifts as they load.
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
export function Shots({game}:{game:GamePage}){
 const wide=game.shots[0].w>game.shots[0].h;
 return <div className={g.shots}><div className={`${g.well}${wide?' '+g.wide:''}`}>{game.shots.map(s=><Shot key={s.src} s={s}/>)}</div></div>;
}
/** The hub's row for one game: its screenshot, what kind of game it is, what it teaches, and the two links. */
export function GameRow({game}:{game:GamePage}){
 const s=game.shots[0],kind=game.h1.split(':')[0];
 return <li className={g.game}>
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img src={s.src} alt={s.alt} width={s.w} height={s.h} loading="lazy" decoding="async"/>
  <div className={g.gameWords}>
   <a className={g.gameName} href={game.path}>{game.name}</a>
   <span className={g.gameKind}>{kind}</span>
   <p>{game.blurb}. It teaches {game.skill[0].toLowerCase()+game.skill.slice(1)}.</p>
   <span className={g.gameLinks}><a href={game.path}>How to play {game.name}</a><a href={game.play}>Play now</a></span>
  </div>
 </li>;
}
export const gamesCss=g;
