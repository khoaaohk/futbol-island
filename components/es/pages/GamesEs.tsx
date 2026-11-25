import * as ReactDOM from 'react-dom';
import type {Metadata} from 'next';
import JsonLd from '@/components/seo/JsonLd';
import LoopClip from '@/components/site/games/LoopClip';
import LibraryMenuSpy from '@/components/site/LibraryMenuSpy';
import RailNav from '@/components/site/shell/RailNav';
import KeepReading from '@/components/site/KeepReading';
import {FaqBand,GuidesBand,PickBand,SafeBand} from '@/components/site/games/GamesLower';
import {DataTable,Section,LinkList} from '@/lib/site/GuideParts';
import {QA} from '@/components/site/LessonHub';
import {EsBreadcrumbs,esCrumbs} from '../EsParts';
import {allShots,GAME_FACTS,GAME_PAGES,GAMES_HUB,GAMES_UPDATED,NEWEST_GAMES,gameBySlug,learnTopic,relatedGames,type GamePage,type GameShot} from '@/lib/site/games';
import {gameClip,gameStills,GAMES_HERO_PHONE,GAMES_LEAD_CLIP,islandClips,islandStills,type GameClip} from '@/lib/site/gameMedia';
import {cardShot,stageShots} from '@/lib/site/gamePlay';
import {pageModified} from '@/lib/site/lastmod';
import {pageRail,sec} from '@/lib/site/railNavMore';
import {abs,breadcrumbLd,faqLd,KIDS_AUDIENCE,PLAY_PATH,PUBLISHER,SITE_NAME,SITE_URL} from '@/lib/site/seo';
import {esMeta} from '@/lib/i18n/es/seo';
import {hasEs,toEs} from '@/lib/i18n/esPaths';
import {ES_BOARD_LINE,ES_GAME_FOOT,ES_GAME_NAMES,GAME_FACTS_ES,esGame,esGameKind,esGuideLink,esHowToPlay,esPlayNow,esPlayWorks,gamesHubEs,type GameEs} from '@/lib/i18n/es/games';
import site from '@/app/(site)/site.module.css';
import g from '@/components/site/games/games.module.css';
import lib from '@/components/site/library.module.css';
/**
 * The Spanish arcade pages (round E, Nov 22 2026): /es/games and /es/games/<slug>, the same layout and classes as
 * app/(site)/games (components/site/games/GameParts.tsx), Spanish words from lib/i18n/es/games.ts. Rendered on first request like
 * every /es page (app/es/[[...path]]/page.tsx). The Play buttons open the same games (/arcade?game=<id>), whose screens are in
 * English: the pages say so. JSON-LD: the VideoGame states no language (the game is English, the page Spanish); the page node
 * carries inLanguage es.
 */
const HUB_ES=toEs(GAMES_HUB.path);
const H=()=>gamesHubEs(GAME_PAGES.length,GAME_PAGES.filter(x=>GAME_FACTS[x.id].daily).length);
const crumbs=(...tail:{name:string;path:string}[])=>esCrumbs({name:H().crumb,path:HUB_ES},...tail);
const words=(g:GamePage)=>esGame(g.id);
/** Spanish alt and caption of every picture of a game, by its source file. */
function picWords(game:GamePage,es:GameEs){
 const m=new Map<string,{alt:string;caption:string}>();
 game.shots.forEach((s,i)=>m.set(s.src,es.shots[i]));gameStills(game.id,4).forEach((s,i)=>{if(!m.has(s.src))m.set(s.src,es.stills[i]);});
 return (s:GameShot):GameShot=>({...s,...(m.get(s.src)??{alt:es.name,caption:''})});
}
const PlayLinkEs=({game,es}:{game:GamePage;es:GameEs})=><a className={site.cta} href={game.play} data-play={game.id}>Jugar a {es.name}</a>;
function PlayStageEs({game,es}:{game:GamePage;es:GameEs}){
 const shots=stageShots(game),wide=shots[0].w>shots[0].h;
 return <div className={`${g.stage}${wide?' '+g.stageWide:''}`} data-play-stage={game.id}>
  <a className={g.stageArt} href={game.play} data-play={game.id} tabIndex={-1} aria-hidden="true" data-n={shots.length}>
   {/* eslint-disable-next-line @next/next/no-img-element */}
   {shots.map((s,i)=><img key={s.src} src={s.src} alt="" width={s.w} height={s.h} loading="eager" decoding={i?'async':'sync'} {...(i?{}:{fetchpriority:'high'})}/>)}
  </a>
  <div className={g.stageWords}>
   <a className={`${site.cta} ${g.stageCta}`} href={game.play} data-play={game.id} data-play-now="">{esPlayNow}</a>
   <p className={g.stageHow}>{esHowToPlay(es)}</p>
   <p className={g.stageWorks}>{esPlayWorks}</p>
  </div>
 </div>;
}
const Shot=({s}:{s:GameShot})=><figure className={g.shot}>
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img src={s.src} alt={s.alt} width={s.w} height={s.h} loading="lazy" decoding="async"/>
 <figcaption>{s.caption}</figcaption>
</figure>;
/** A clip in its frame with its Spanish caption (the watch pages are English, so no watch link here). */
function ClipEs({c,es,priority,className}:{c:GameClip;es:{name:string;alt:string;caption:string};priority?:boolean;className?:string}){
 return <figure className={`${g.clipFig}${className?' '+className:''}`}>
  <LoopClip es name={es.name} poster={c.poster} mp4={c.mp4} webm={c.webm} mp4s={c.mp4s} w={c.w} h={c.h} pw={c.pw} ph={c.ph} alt={es.alt} priority={priority}/>
  <figcaption>{es.caption} <span className={g.secs}>{c.seconds} s, sin sonido.</span></figcaption>
 </figure>;
}
function ShotsEs({game,es}:{game:GamePage;es:GameEs}){
 const c=gameClip(game.id),tr=picWords(game,es),shots=allShots(game).map(tr),wide=shots[0].w>shots[0].h;
 return <div className={g.shots}><div className={`${g.media}${wide?' '+g.mediaWide:''}`}>
  {c&&es.clip&&<ClipEs c={c} es={es.clip} className={g.mediaClip} priority/>}
  <div className={`${g.strip}${wide?' '+g.stripWide:''}`}>{shots.map(s=><Shot key={s.src} s={s}/>)}</div>
 </div></div>;
}
const List=({items}:{items:readonly string[]})=><ul>{items.map(x=><li key={x}>{x}</li>)}</ul>;
const gamePathEs=(g:GamePage)=>toEs(g.path);
/** VideoGame for a Spanish game page: the same game as the English page's node (its @id), described in Spanish; the page is a
 *  WebPage in Spanish. No ratings or reviews. */
function videoGameLdEs(game:GamePage,es:GameEs){
 const url=abs(gamePathEs(game)),tr=picWords(game,es);
 return {'@context':'https://schema.org','@type':'WebPage','@id':url+'#page',url,name:es.title,description:es.description,inLanguage:'es',
  isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'},publisher:PUBLISHER,
  mainEntity:{'@type':'VideoGame','@id':abs(game.path)+'#game',name:game.name,alternateName:es.h1,url:abs(game.path),description:es.description,
   image:abs(game.og),screenshot:allShots(game).map(tr).map(s=>({'@type':'ImageObject',contentUrl:abs(s.src),encodingFormat:'image/webp',width:s.w,height:s.h,caption:s.alt})),
   genre:game.genre,gamePlatform:'Web browser',operatingSystem:'Web browser',applicationCategory:'GameApplication',playMode:'SinglePlayer',isAccessibleForFree:true,
   offers:{'@type':'Offer',price:0,priceCurrency:'USD',availability:'https://schema.org/InStock',url},audience:KIDS_AUDIENCE,isFamilyFriendly:true,teaches:es.skill,
   potentialAction:{'@type':'PlayAction',name:`Jugar a ${game.name}`,target:{'@type':'EntryPoint',urlTemplate:abs(game.play),actionPlatform:['https://schema.org/DesktopWebPlatform','https://schema.org/MobileWebPlatform']}},
   datePublished:GAMES_UPDATED,dateModified:pageModified(game.path,GAMES_UPDATED),publisher:PUBLISHER,author:PUBLISHER}};
}
export function GameEsPage({game}:{game:GamePage}){
 const es=words(game),path=gamePathEs(game),cr=crumbs({name:game.name,path});
 if(typeof ReactDOM.preload==='function')ReactDOM.preload(stageShots(game)[0].src,{as:'image',fetchPriority:'high'});
 // Nov 24 2026 (SEO wave 2): as the English page, the related games, the hub and the Learn topic first; every other game under "Ver N más"
 const card=(x:GamePage)=>{const e=words(x);return {path:gamePathEs(x),name:`${x.name}: ${esGameKind(e).toLowerCase()}`,line:e.blurb};},near=relatedGames(game);
 const topic=esGuideLink(es.guides[0],hasEs,toEs);
 const others=[...near.map(card),{path:HUB_ES,name:`Los ${GAME_PAGES.length} juegos de fútbol gratis`,line:H().blurb},{path:topic.path,name:`Aprende la idea: ${topic.name}`,line:topic.line},
  ...GAME_PAGES.filter(x=>x!==game&&!near.includes(x)).map(card)];
 const rail=pageRail(`${game.name} en esta página`,{href:HUB_ES,name:'Todos los juegos'},[sec('what','Qué es'),sec('how','Cómo jugar'),sec('teaches','Qué enseña'),
  sec('tips','Consejos'),sec('harder','Dificultad'),sec('parents','Para padres'),sec('faq','Preguntas'),sec('again','Juega otra vez'),sec('more','Más juegos'),sec('island','Toda la isla')],true);
 return <>
  <JsonLd data={breadcrumbLd(cr)}/>
  <JsonLd data={videoGameLdEs(game,es)}/>
  <JsonLd data={faqLd(es.faq)}/>
  <RailNav rail={rail} current="#top"/>
  <header className={site.intro} id="top" data-games-page="">
   <EsBreadcrumbs crumbs={cr}/>
   <h1 className={site.title}>{es.h1}</h1>
   <PlayStageEs game={game} es={es}/>
   <p className={site.lead} data-answer="">{es.lead}</p>
   <p className={site.caption}>{ES_GAME_NAMES}</p>
  </header>
  <ShotsEs game={game} es={es}/>
  <Section id="what" title={`¿Qué es ${game.name}?`}>{es.about.map(x=><p key={x}>{x}</p>)}</Section>
  <Section id="how" title={`Cómo jugar a ${game.name}`}>
   <h3 className={site.h3}>En un celular o una tableta</h3><List items={es.phone}/>
   <h3 className={site.h3}>En una computadora</h3><List items={es.desktop}/>
   <h3 className={site.h3}>Las reglas</h3><List items={es.rules}/>
  </Section>
  <Section id="teaches" title="Qué enseña">
   {es.teaches.map(x=><p key={x}>{x}</p>)}
   <h3 className={site.h3}>Lee y practica la misma idea</h3>
   <LinkList links={es.guides.map(l=>esGuideLink(l,hasEs,toEs))}/>
  </Section>
  <Section id="tips" title="Consejos para sumar más puntos"><ol>{es.tips.map(x=><li key={x}>{x}</li>)}</ol></Section>
  <Section id="harder" title="Cómo sube la dificultad"><List items={es.harder}/></Section>
  <Section id="parents" title="Para padres y entrenadores"><List items={es.parents}/></Section>
  <QA id="faq" title={`Preguntas sobre ${game.name}`} faq={es.faq}/>
  <Section id="again" title={`Juega otra vez a ${game.name}`}><p>{GAME_FACTS_ES[game.id].back} {ES_BOARD_LINE}</p></Section>
  <KeepReading id="more" title="Más juegos gratis" groups={[{id:'more-games',links:others}]} show={near.length+3} lang="es"/>
  <Section id="island" title="Juega en toda la isla">
   <p>{game.name} es uno de los juegos del arcade de Futbol Island. La isla también tiene lecciones, pruebas, pesca y cartas de jugadores. <a href={PLAY_PATH} data-island-link="">Juega en toda la isla</a>.</p>
  </Section>
  <p className={site.caption}>{ES_GAME_FOOT}</p>
  <p className={site.end}><PlayLinkEs game={game} es={es}/></p>
 </>;
}
/* ---- the hub ---- */
function QuickPlayEs({games}:{games:readonly GamePage[]}){
 return <ul className={g.quick} aria-label="Juega ahora">{games.map((x,i)=>{const s=cardShot(x),e=words(x);
  return <li key={x.id} className={g.quickCard}>
   <a className={g.quickArt} href={x.play} data-play={x.id} tabIndex={-1} aria-hidden="true">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={s.src} alt="" width={s.w} height={s.h} loading={i<2?'eager':'lazy'} decoding="async"/>
   </a>
   <h3 className={g.quickName}><a href={gamePathEs(x)}>{x.name}</a></h3>
   <p className={g.quickSkill}>{e.skill}</p>
   <a className={g.quickPlay} href={x.play} data-play={x.id} aria-label={`Jugar a ${x.name} ahora`}>Jugar ahora</a>
  </li>;})}</ul>;
}
function GameFeatureEs({game}:{game:GamePage}){
 const es=words(game),c=gameClip(game.id),tr=picWords(game,es),stills=gameStills(game.id,4).map(tr);
 const wide=(c?c.pw:game.shots[0].w)>(c?c.ph:game.shots[0].h);
 return <li id={`game-${game.id}`} className={`${g.feature}${wide?' '+g.featureWide:''}`}>
  <div className={g.featureMedia}>{c&&es.clip?<ClipEs c={c} es={es.clip}/>:<Shot s={tr(game.shots[0])}/>}</div>
  <div className={g.featureWords}>
   <h3 className={g.featureName}><a href={gamePathEs(game)}>{game.name}</a></h3>
   <span className={g.gameKind}>{esGameKind(es)}</span>
   <p>{es.blurb}. Enseña: {es.skill[0].toLowerCase()+es.skill.slice(1)}{/[.!?]$/.test(es.skill)?'':'.'}</p>
   <span className={g.gameLinks}><a className={g.playNow} href={game.play}>Jugar a {game.name}</a><a href={gamePathEs(game)}>Cómo se juega</a></span>
  </div>
  {stills.length>0&&<ul className={g.thumbs} aria-label={`Más imágenes de ${game.name}`}>{stills.map(s=><li key={s.src}>
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img src={s.src} alt={s.alt} width={s.w} height={s.h} loading="lazy" decoding="async"/></li>)}</ul>}
 </li>;
}
function GamesHeroEs({h1,lead}:{h1:string;lead:string}){
 const c=islandClips().find(x=>x.key===GAMES_LEAD_CLIP),still=islandStills()[0],inset=GAMES_HERO_PHONE;
 const alt='Futbol Island en acción: la isla en 3D, con un partido en la cancha del pueblo';
 return <div className={`${lib.hero} ${g.ghero}`} id="top" data-games-page="" data-games-hero="">
  <header className={lib.heroText}>
   <EsBreadcrumbs crumbs={crumbs()}/>
   <h1 className={lib.h1}>{h1}</h1>
   <p className={lib.lead} data-answer="">{lead}</p>
   <a className={site.cta} href={PLAY_PATH} data-play="island">Juega a Futbol Island</a>
  </header>
  <div className={lib.heroArt}>
   {c?<LoopClip es name="Futbol Island" poster={c.poster} mp4={c.mp4} webm={c.webm} mp4s={c.mp4s} w={c.w} h={c.h} pw={c.pw} ph={c.ph} alt={alt} auto priority className={`${lib.heroMain} ${g.heroClip}`}/>
    // eslint-disable-next-line @next/next/no-img-element
    :<img className={lib.heroMain} src={still.src} alt={alt} width={still.w} height={still.h} decoding="async"/>}
   {/* eslint-disable-next-line @next/next/no-img-element */}
   <img className={`${lib.heroInset} ${g.heroPhone}`} src={inset.src} alt="Un partido de 7v7 en Futbol Island en un celular, con los controles táctiles" width={inset.w} height={inset.h} loading="lazy" decoding="async"/>
  </div>
 </div>;
}
const GUIDES_ES=[
 {path:toEs('/learn/soccer-formations'),name:'Formaciones de fútbol',line:'Las formas que arma Squad Snake, con un diagrama de cada una',pic:'/learn/soccer-formations',alt:'Tres canchas con las formaciones 4-3-3, 4-4-2 y 3-5-2'},
 {path:toEs('/learn/soccer-positions'),name:'Posiciones del fútbol',line:'Qué hace cada posición y los números del 1 al 11',pic:'/learn/soccer-positions',alt:'Una cancha con las once posiciones de un 4-3-3, numeradas del 1 al 11'},
 {path:toEs('/learn/soccer-rules/offside'),name:'El fuera de juego para niños',line:'La línea que Pass Puzzles dibuja en la cancha',pic:'/learn/soccer-rules/offside',alt:'Un atacante detrás del último defensa cuando sale el pase: la línea del fuera de juego en dorado'},
 {path:toEs('/learn/soccer-drills'),name:'Ejercicios de fútbol para niños',line:'Ejercicios de primer toque, pase, regate y tiro',pic:'/learn/soccer-drills',alt:'Dos cuadrados de práctica con conos: un zigzag de regate y pases entre puertas, con flechas'},
 {path:toEs('/learn/soccer-terms'),name:'Términos del fútbol',line:'Pared, pase al hueco, primer toque y más',pic:'/learn/soccer-terms',alt:'Cuatro jugadas de pase en una cancha con flechas: pared, desdoble, pase al hueco y cambio de juego'},
 {path:toEs('/learn/lessons'),name:'Todas las lecciones de fútbol',line:'Lecciones animadas cortas con una prueba',pic:'/learn/lessons',alt:'Lecciones animadas de fútbol de Futbol Island, como tarjetas'}];
function gamesHubLdEs(){
 const h=H(),url=abs(HUB_ES),list=url+'#games';
 return [{'@context':'https://schema.org','@type':'CollectionPage','@id':url+'#page',name:h.h1,url,description:h.description,inLanguage:'es',isAccessibleForFree:true,audience:KIDS_AUDIENCE,
  image:abs(GAMES_HUB.og),datePublished:GAMES_UPDATED,dateModified:pageModified(GAMES_HUB.path,GAMES_UPDATED),isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'},publisher:PUBLISHER,mainEntity:{'@id':list}},
  {'@context':'https://schema.org','@type':'ItemList','@id':list,name:h.h1,url,numberOfItems:GAME_PAGES.length,
   itemListElement:GAME_PAGES.map((x,i)=>({'@type':'ListItem',position:i+1,name:x.name,url:abs(gamePathEs(x)),image:abs(x.shots[0].src)}))}];
}
export function GamesHubEsPage(){
 const h=H(),top=islandClips().find(c=>c.key===GAMES_LEAD_CLIP);
 if(top&&typeof ReactDOM.preload==='function')ReactDOM.preload(top.poster,{as:'image',fetchPriority:'high'});
 const daily=GAME_PAGES.filter(x=>GAME_FACTS[x.id].daily),newest=GAME_PAGES.filter(x=>NEWEST_GAMES.includes(x.id));
 const y=(xs:readonly string[])=>xs.length>1?`${xs.slice(0,-1).join(', ')} y ${xs[xs.length-1]}`:xs.join('');
 const MENU:readonly (readonly [string,string])[]=[['#quick','Juega ahora'],['#table','Todos de un vistazo'],...(daily.length?[['#daily','Nuevo cada día'] as const]:[]),...GAME_PAGES.map(x=>[`#game-${x.id}`,x.name] as const),
  ['#pick','Por cuál empezar'],['#safe','Para padres'],['#faq','Preguntas'],['#guides','Aprende las ideas']];
 return <>
  <JsonLd data={breadcrumbLd(crumbs())}/>
  {gamesHubLdEs().map(d=><JsonLd key={d['@type']} data={d}/>)}
  <JsonLd data={faqLd(h.faq)}/>
  <div className={`${lib.shelf} ${g.gshelf}`}>
   <nav className={`${lib.menu} ${g.menu}`} id="games-menu" data-rail="" aria-label="Juegos en esta página">
    <ul><li><a href="#top" data-on="">Resumen</a></li>{MENU.map(([href,label])=><li key={href}><a href={href}>{label}</a></li>)}</ul>
   </nav>
   <LibraryMenuSpy menu="games-menu"/>
   <div className={`${lib.shelfMain} ${g.gmain}`}>
    <GamesHeroEs h1={h.h1} lead={h.lead}/>
    <Section id="quick" title={`Juega ahora: ${GAME_PAGES.length} juegos para elegir`}>
     <div className={g.bleed}><QuickPlayEs games={GAME_PAGES}/></div>
    </Section>
    {/* Nov 24 2026 (SEO wave 2): the games table and the daily modes, as on /games */}
    <Section id="table" title="Juegos de fútbol gratis para niños, de un vistazo">
     <DataTable label="Cada juego de fútbol gratis: lo que enseña, edades, tiempo de juego y dónde aprender la idea" head={['Juego','Habilidad de fútbol que enseña','Edades','Tiempo de juego','Aprende la idea']}
      rows={GAME_PAGES.map(x=>{const e=words(x),t=esGuideLink(e.guides[0],hasEs,toEs),f=GAME_FACTS_ES[x.id];return [<a key="g" href={gamePathEs(x)}>{x.name}</a>,e.skill,f.ages,f.time,<a key="l" href={t.path}>{t.name}</a>];})}/>
    </Section>
    {daily.length>0&&<Section id="daily" title="Nuevo cada día, y nuevo en el arcade">
     <p>{daily.length} de los juegos tienen un modo diario, igual para todos ese día: {y(daily.map(x=>x.name))}. Nadie tiene que jugar todos los días, y el resto de cada juego siempre está abierto.{newest.length>0&&<> Las máquinas más nuevas son {y(newest.map(x=>x.name))}.</>}</p>
     <p>{ES_BOARD_LINE}</p>
    </Section>}
    <Section id="games" title={`Los ${GAME_PAGES.length} juegos de arcade de fútbol`}>
     <div className={`${g.arcadeIntro} ${g.bleed}`}><div>{h.intro.map(x=><p key={x}>{x}</p>)}</div></div>
     <ul className={`${g.features} ${g.bleed}`}>{GAME_PAGES.map(x=><GameFeatureEs key={x.id} game={x}/>)}</ul>
    </Section>
    <PickBand id="pick" title="Por cuál juego empezar" line="Muchas formas de empezar. Elige la que vaya con tu jugador." picks={h.pick}/>
    <SafeBand id="safe" title="Para padres y entrenadores" line="Lo que los adultos suelen preguntar antes de que un niño juegue." foot={ES_GAME_FOOT}
     points={h.safe} guide={<>Hay más detalles en la <a href={toEs('/safe-football-game-for-kids')}>guía para padres</a>.</>}/>
    <FaqBand id="faq" title="Preguntas sobre los juegos" line="Respuestas cortas para padres, maestros y jugadores." faq={h.faq}/>
    <GuidesBand id="guides" title="Aprende las ideas detrás de los juegos" line="Cada juego se basa en una idea real del fútbol. Aquí está completa." links={GUIDES_ES}/>
   </div>
  </div>
 </>;
}
/** The route table's part for the games (components/es/routes.tsx). */
export function gamesEsRoute(enPath:string):{meta:()=>Metadata;render:()=>JSX.Element}|null{
 if(enPath===GAMES_HUB.path){const h=H();return {meta:()=>esMeta(h.title,h.description,enPath,{url:GAMES_HUB.og,alt:'Tres juegos de fútbol gratis para niños en pantallas de celular: Kit Rush, Squad Snake y Pass Puzzles'}),render:()=><GamesHubEsPage/>};}
 if(!enPath.startsWith(GAMES_HUB.path+'/'))return null;
 const game=gameBySlug(enPath.slice(GAMES_HUB.path.length+1));if(!game||!GAME_PAGES.includes(game))return null;
 const es=words(game);
 return {meta:()=>esMeta(es.title,es.description,enPath,{url:game.og,alt:es.shots[0]?.alt??game.name}),render:()=><GameEsPage game={game}/>};
}
