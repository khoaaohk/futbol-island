import Breadcrumbs from '@/components/site/Breadcrumbs';
import {allShots,gameById,GAME_NAMES,GAMES_NAMES,type GameId,type GamePage,type GameShot} from '@/lib/site/games';
import {GAMES_HERO_PHONE,GAMES_LEAD_CLIP,gameClip,gameStills,islandClips,islandStills,type GameClip} from '@/lib/site/gameMedia';
import LoopClip from './LoopClip';
import {posterSrcSet} from '@/lib/site/learnMedia';
import {watchPathFor} from '@/lib/site/videos';
import {PLAY_PATH,type Crumb} from '@/lib/site/seo';
import {PLAY_NOW,PLAY_WORKS,cardShot,howToPlay,stageShots} from '@/lib/site/gamePlay';
import site from '@/app/(site)/site.module.css';
import g from './games.module.css';
import lib from '@/components/site/library.module.css';
/**
 * Parts of the arcade games' search pages (app/(site)/games; lib/site/games.ts). Server-rendered; the one client island is
 * LoopClip (a gameplay loop that mounts its <video> only when it may play, lib/site/gameMedia.ts). No game canvas. Pictures are
 * plain lazy <img> with their real size, and every clip box has its poster's aspect ratio, so nothing shifts as media loads.
 */
/** The gold button: the one way from a game page into that game (the deep link /arcade?game=<id>). Label: UI sans 800 (.cta). */
export const PlayLink=({game}:{game:GamePage})=><a className={site.cta} href={game.play} data-play={game.id}>Play {game.name}</a>;
export function GameIntro({crumbs,h1,lead,game}:{crumbs:readonly Crumb[];h1:string;lead:string;game?:GamePage}){
 return <header className={site.intro} id="top" data-games-page="">{/* marks /games and /games/<slug> so the header's Games link is the selected one (site.module.css) */}
  <Breadcrumbs crumbs={crumbs}/>
  <h1 className={site.title}>{h1}</h1>
  {game&&<PlayStage game={game}/>}
  <p className={site.lead}>{lead}</p>
  <p className={site.caption}>{game?GAME_NAMES:GAMES_NAMES}</p>
 </header>;
}
/** A game page's first screen under its H1 (Nov 22 2026, lib/site/gamePlay.ts): the game's first screenshots on a pitch-green
 *  stage, the big "Play now" button (the deep link /arcade?game=<id>: one tap opens the game, nothing is embedded here), a
 *  one-line how-to-play and where it runs. The pictures are a second link to the same game, out of the tab order. Server-rendered,
 *  no script: the first poster is the page's LCP and is preloaded by the page (app/(site)/games/[slug]/page.tsx). */
export function PlayStage({game}:{game:GamePage}){
 const shots=stageShots(game),wide=shots[0].w>shots[0].h;
 return <div className={`${g.stage}${wide?' '+g.stageWide:''}`} data-play-stage={game.id}>
  <a className={g.stageArt} href={game.play} data-play={game.id} tabIndex={-1} aria-hidden="true" data-n={shots.length}>
   {/* eslint-disable-next-line @next/next/no-img-element */}
   {shots.map((s,i)=><img key={s.src} src={s.src} alt="" width={s.w} height={s.h} loading="eager" decoding={i?'async':'sync'} {...(i?{}:{fetchpriority:'high'})}/>)}
  </a>
  <div className={g.stageWords}>
   <a className={`${site.cta} ${g.stageCta}`} href={game.play} data-play={game.id} data-play-now="">{PLAY_NOW}</a>
   <p className={g.stageHow}>{howToPlay(game)}</p>
   <p className={g.stageWorks}>{PLAY_WORKS}</p>
  </div>
 </div>;
}
/** The /games hub's quick-play grid (Nov 22 2026): one small card per game, its first still, its name (a link to its page), the
 *  skill it teaches in a line and a Play button that opens the game directly. The first row's pictures load at once; the rest are lazy. */
export function QuickPlay({games}:{games:readonly GamePage[]}){
 return <ul className={g.quick} aria-label="Play a game now">{games.map((x,i)=>{const s=cardShot(x);
  return <li key={x.id} className={g.quickCard}>
   <a className={g.quickArt} href={x.play} data-play={x.id} tabIndex={-1} aria-hidden="true">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={s.src} alt="" width={s.w} height={s.h} loading={i<2?'eager':'lazy'} decoding="async"/>
   </a>
   <h3 className={g.quickName}><a href={x.path}>{x.name}</a></h3>
   <p className={g.quickSkill}>{x.skill}</p>
   <a className={g.quickPlay} href={x.play} data-play={x.id} aria-label={`Play ${x.name} now`}>Play now</a>
  </li>;})}</ul>;
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
  <LoopClip name={c.name} poster={c.poster} mp4={c.mp4} webm={c.webm} mp4s={c.mp4s} w={c.w} h={c.h} pw={c.pw} ph={c.ph} alt={c.alt} auto={auto} priority={priority}/>
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
/** The hub's block for one game (Nov 20 2026, owner: "each game should have 4 smaller ones and one large video"): its clip (hover
 * or tap to play), its name, kind, what it teaches and the Play link together at the top, then up to four stills in one row that
 * fills its column (3 or 4, never an empty slot). The clip is always on the left (batch 3, Nov 20 2026: no alternating). Layout per width in games.module.css (.feature). */
export function GameFeature({game}:{game:GamePage}){
 const c=gameClip(game.id),kind=game.h1.split(':')[0],stills=gameStills(game.id,4);
 const wide=(c?c.pw:game.shots[0].w)>(c?c.ph:game.shots[0].h);
 return <li id={`game-${game.id}`} className={`${g.feature}${wide?' '+g.featureWide:''}`}>
  <div className={g.featureMedia}>{c?<ClipFigure c={c}/>:<Shot s={game.shots[0]}/>}</div>
  <div className={g.featureWords}>
   <h3 className={g.featureName}><a href={game.path}>{game.name}</a></h3>
   <span className={g.gameKind}>{kind}</span>
   <p>{game.blurb}. It teaches {game.skill[0].toLowerCase()+game.skill.slice(1)}.</p>
   <span className={g.gameLinks}><a className={g.playNow} href={game.play}>Play {game.name}</a><a href={game.path}>How to play</a></span>
  </div>
  {stills.length>0&&<ul className={g.thumbs} aria-label={`More pictures of ${game.name}`}>{stills.map(s=><li key={s.src}>
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img src={s.src} alt={s.alt} width={s.w} height={s.h} loading="lazy" decoding="async"/></li>)}</ul>}
 </li>;
}
/** The top of /games (layout batch 3, Nov 20 2026; owner: "i like the way the overview looks on library, can we match that for
 * games?"): the Library's hero composition (library.module.css .hero, the same classes, so the two never drift): breadcrumb, H1,
 * lede and the gold Play button on the left; on the right the lead clip large (GAMES_LEAD_CLIP, the page's ONLY autoplaying video,
 * poster preloaded by the page) with a still phone screenshot of the island game (a 7v7 match, touch controls) overlapping its lower-left corner. */
/** The hero picture's shown width (library.module.css .hero / .heroArt): about half the 1180 px shell from 1000 px, full width below. */
export const HERO_SIZES='(min-width: 1000px) 620px, 92vw';
export {GAMES_LEAD_CLIP as ISLAND_FEATURE_KEY} from '@/lib/site/gameMedia';
export function GamesHero({crumbs,h1,lead,play}:{crumbs:readonly Crumb[];h1:string;lead:string;play:string}){
 const c=islandClips().find(x=>x.key===GAMES_LEAD_CLIP),still=islandStills()[0],inset=GAMES_HERO_PHONE;/* the main game on a phone (owner: not an arcade still) */
 return <div className={`${lib.hero} ${g.ghero}`} id="top" data-games-page="" data-games-hero="">{/* data-games-page: the header's Games link is the selected one (site.module.css) */}
  <header className={lib.heroText}>
   <Breadcrumbs crumbs={crumbs}/>
   <h1 className={lib.h1}>{h1}</h1>
   <p className={lib.lead}>{lead}</p>
   <a className={site.cta} href={PLAY_PATH} data-play="island">{play}</a>
  </header>
  <div className={lib.heroArt}>
   {c?<LoopClip name={c.name} poster={c.poster} posterSet={posterSrcSet(c.poster,c.pw)} posterSizes={HERO_SIZES} mp4={c.mp4} webm={c.webm} mp4s={c.mp4s} w={c.w} h={c.h} pw={c.pw} ph={c.ph} alt={c.alt} auto priority className={`${lib.heroMain} ${g.heroClip}`}/>
    // eslint-disable-next-line @next/next/no-img-element
    :<img className={lib.heroMain} src={still.src} alt={still.alt} width={still.w} height={still.h} decoding="async"/>}
   {/* a still, never a second playing video (AGENTS.md: one player at a time) */}
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img className={`${lib.heroInset} ${g.heroPhone}`} src={inset.src} alt={inset.alt} width={inset.w} height={inset.h} loading="lazy" decoding="async"/>
  </div>
 </div>;
}
/** Directly under the hero: the island game in a slim band of words (it was the dark green block until batch 3), the lead clip's
 * caption with its watch page, and the "soccer is called football" line that used to sit under the H1. */
export function IslandBand({title,lines,note}:{title:string;lines:readonly string[];note:string}){
 const c=islandClips().find(x=>x.key===GAMES_LEAD_CLIP),watch=c&&watchPathFor(c.key);
 return <section className={`${g.islandBand} ${g.bleed}`} aria-labelledby="island-game" data-island-band="" data-own-grid="">
  <h2 className={g.bandTitle} id="island-game">{title}</h2>
  <div className={g.bandText}>
   {lines.map(x=><p key={x}>{x}</p>)}
   {c&&<p className={g.bandNote}>{c.caption} <span className={g.secs}>{c.seconds} s, no sound.</span>{watch&&<> <a href={watch} data-watch-link="">Watch the full clip</a></>}</p>}
   <p className={g.bandNote}>{note}</p>
  </div>
 </section>;
}
/** "Inside the island": the island game's clips and stills in one row that swipes sideways (scroll snap, no script). */
export function IslandGallery({skip}:{skip?:string}={}){
 const clips=islandClips().filter(c=>c.key!==skip),stills=islandStills();
 const items:({c:GameClip}|{s:GameShot})[]=[];clips.forEach((c,i)=>{items.push({c});if(stills[i])items.push({s:stills[i]});});
 stills.slice(clips.length).forEach(s=>items.push({s}));
 return <ul className={g.gallery} aria-label="Pictures and clips from the island">
  {items.map(x=>'c' in x?<li key={x.c.key}><ClipFigure c={x.c}/></li>:<li key={x.s.src}><Shot s={x.s}/></li>)}
 </ul>;
}
export const gamesCss=g;
