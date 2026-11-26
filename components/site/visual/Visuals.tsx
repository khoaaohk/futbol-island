import {FactIcon,type FactIconKind} from '@/components/site/FactIcons';
import {deepLinkRel} from '@/lib/site/playLinks';
import site from '@/app/(site)/site.module.css';
import rt from '@/components/site/railTarget.module.css';
import v from './visual.module.css';
/**
 * Teaching visuals for the guide pages (SEO lift + visual pass, Nov 26 2026). All server-rendered inline SVG and HTML in the
 * site's own flat illustration style (the pitch green, white lines, gold and ink of lib/site/PitchDiagram.tsx). No client
 * JavaScript: the one interaction (tap a position on the pitch to see its job) is a link to the row, lit by CSS :target.
 * Every drawing has a <title>/<desc> and the same facts are in the text next to it, so crawlers and screen readers get all of it.
 * Used by the cards and hat-trick term pages, the yellow and red cards rule page, the terms hub and the gap pages
 * (lib/site/gapPages.ts, components/site/visual/GapPageView.tsx). Words: English, or Spanish with lang="es".
 */
const INK='#14221d',PAPER='#ffffff',GOLD='#e9c16b',GRASS='#1d6b55',YEL='#f2c230',RED='#d6402b',CONE='#e08a2c';
type Lang='en'|'es';

/** A section heading in the site's style (same classes as lib/site/GuideParts Section), so rail links and the TOC find it. */
export function VSection({id,title,children}:{id:string;title:string;children:React.ReactNode}){
 return <section className={site.section} aria-labelledby={id}><h2 className={`${site.h2} ${rt.target}`} id={id}>{title}</h2>{children}</section>;
}

/* ---------- the referee's cards ---------- */
function Card({fill,tilt=0,x=0}:{fill:string;tilt?:number;x?:number}){
 return <rect x={14+x} y={8} width={44} height={60} rx={5} fill={fill} stroke={INK} strokeWidth={2} transform={`rotate(${tilt} ${36+x} 38)`}/>;
}
const CARD_WORDS={
 en:{title:'The referee’s cards: what each one means',desc:'A yellow card, two yellow cards that make a red, and a red card.',
  y:['Yellow card','A caution (a warning). The player stays on and keeps playing.'],yy:['Two yellows = red','A second yellow in the same game is a red card. The player is sent off.'],
  r:['Red card','Sent off for the rest of the game. No one replaces them: the team plays one short.'],
  src:'IFAB Laws of the Game, Law 12 (Fouls and Misconduct) and Law 3 (The Players).'},
 es:{title:'Las tarjetas del árbitro: qué significa cada una',desc:'Una tarjeta amarilla, dos amarillas que hacen una roja y una tarjeta roja.',
  y:['Tarjeta amarilla','Una amonestación (un aviso). El jugador sigue en el campo y sigue jugando.'],yy:['Dos amarillas = roja','La segunda amarilla en el mismo partido es una roja. El jugador queda expulsado.'],
  r:['Tarjeta roja','Expulsado el resto del partido. Nadie lo sustituye: el equipo juega con uno menos.'],
  src:'Reglas de Juego de la IFAB, Regla 12 (Faltas e incorrecciones) y Regla 3 (Los jugadores).'},
} as const;
/** Three cards side by side: yellow, yellow + yellow = red, red, each with its meaning in words. `focus` puts one colour first. */
export function RefereeCards({lang='en',focus}:{lang?:Lang;focus?:'yellow'|'red'}){
 const w=CARD_WORDS[lang];
 const rows=[{k:'y',art:<Card fill={YEL}/>},{k:'yy',art:<><Card fill={YEL} tilt={-10} x={-6}/><Card fill={RED} tilt={8} x={8}/></>},{k:'r',art:<Card fill={RED}/>}] as const;
 const order=focus==='red'?[rows[2],rows[1],rows[0]]:rows;
 return <figure className={v.fig} data-visual="referee-cards">
  <div className={v.cards}>{order.map(r=>{const [t,d]=w[r.k];return <div key={r.k} className={v.cardRow}>
   <svg viewBox="0 0 72 76" role="img" aria-label={t}><title>{t}</title>{r.art}</svg><div><b>{t}</b><p>{d}</p></div></div>;})}</div>
  <figcaption className={v.cap}>{w.desc} {w.src}</figcaption>
 </figure>;
}

/* ---------- goals strip: one goal, a brace, a hat-trick ---------- */
function Ball({cx,cy,r=13}:{cx:number;cy:number;r?:number}){
 return <g><circle cx={cx} cy={cy} r={r} fill={PAPER} stroke={INK} strokeWidth={2}/>
  <path d={`M${cx} ${cy-r*.45}l${r*.43} ${r*.31}-${r*.16} ${r*.5}h-${r*.54}l-${r*.16}-${r*.5}z`} fill={INK}/></g>;
}
const GOAL_WORDS={en:[['1 goal','A goal'],['2 goals','A brace'],['3 goals','A hat-trick']],es:[['1 gol','Un gol'],['2 goles','Un doblete'],['3 goles','Un triplete (hat-trick)']]} as const;
export function GoalStrip({lang='en'}:{lang?:Lang}){
 const w=GOAL_WORDS[lang];
 return <figure className={v.fig} data-visual="goal-strip">
  <div className={v.goals}>{w.map(([n,name],i)=><div key={n} className={i===2?`${v.goal} ${v.goalHot}`:v.goal}>
   <svg viewBox="0 0 100 34" role="img" aria-label={`${n}: ${name}`}><title>{`${n}: ${name}`}</title>
    {Array.from({length:i+1},(_,j)=><Ball key={j} cx={50+(j-i/2)*30} cy={17}/>)}</svg>
   <b>{name}</b><span>{n}</span></div>)}</div>
  <figcaption className={v.cap}>{lang==='es'?'Goles de un mismo jugador en un mismo partido. Los penaltis de la tanda no cuentan.':'Goals by one player in one game. Kicks in a penalty shoot-out do not count.'}</figcaption>
 </figure>;
}

/* ---------- the positions pitch ---------- */
export type PitchSpot={id:string;abbr:string;name:string;job:string;x:number;y:number;also?:string;href?:string};
/** An 11v11 pitch (attacking up) with one dot per position. Each dot links to its row below (#pos-<id>), which lights up
 *  (CSS :target): tap a position to see its job. Without CSS or with a screen reader it is a list of links and a list. */
export function PositionPitch({spots,title,desc,lang='en',more}:{spots:readonly PitchSpot[];title:string;desc:string;lang?:Lang;more?:string}){
 const W=240,H=340,M=10,X=(x:number)=>M+x/100*(W-2*M),Y=(y:number)=>H-M-y/100*(H-2*M);
 const line={fill:'none',stroke:PAPER,strokeWidth:2,strokeOpacity:.85} as const,cx=W/2;
 return <div className={v.posWrap} data-visual="position-pitch">
  <svg className={v.posSvg} viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby="pp-t pp-d">
   <title id="pp-t">{title}</title><desc id="pp-d">{desc}</desc>
   <rect x={0} y={0} width={W} height={H} rx={14} fill={GRASS}/>
   <rect {...line} x={M} y={M} width={W-2*M} height={H-2*M}/>
   <line {...line} x1={M} x2={W-M} y1={H/2} y2={H/2}/><circle {...line} cx={cx} cy={H/2} r={28}/>
   <rect {...line} x={cx-62} y={M} width={124} height={50}/><rect {...line} x={cx-62} y={H-M-50} width={124} height={50}/>
   <rect {...line} x={cx-26} y={M} width={52} height={18}/><rect {...line} x={cx-26} y={H-M-18} width={52} height={18}/>
   {spots.map(s=><a key={s.id} href={`#pos-${s.id}`} className={v.dot} aria-label={`${s.abbr}: ${s.name}`}>
    <circle cx={X(s.x)} cy={Y(s.y)} r={17} fill={s.id==='gk'?PAPER:GOLD} stroke={INK} strokeWidth={1.5}/>
    <text x={X(s.x)} y={Y(s.y)} dy=".35em" textAnchor="middle" fontSize={s.abbr.length>3?9.5:11.5} fontWeight={800} fill={INK} fontFamily="system-ui,-apple-system,sans-serif">{s.abbr}</text>
   </a>)}
  </svg>
  <div>
   {more&&<p className={v.cap}>{more}</p>}
   <ul className={v.posList}>{spots.map(s=><li key={s.id} id={`pos-${s.id}`} className={v.posItem}>
    <span className={v.abbr}>{s.abbr}</span>
    <div><b>{s.href?<a href={s.href}>{s.name}</a>:s.name}</b><p>{s.job}</p>{s.also&&<small>{s.also}</small>}</div></li>)}</ul>
  </div>
 </div>;
}

/* ---------- drill set-up drawings ---------- */
/** One drill's set-up in metres-free units (0-100 across, 0-70 down): cones, players, balls, a wall, small goals and arrows
 *  (`run` dashed = the player, `ball` solid = the ball). Drawn flat in the pitch palette. */
export type DrillSpec={cones?:readonly (readonly [number,number])[];players?:readonly (readonly [number,number,string?])[];balls?:readonly (readonly [number,number])[];
 wall?:'top'|'left';goals?:readonly (readonly [number,number])[];arrows?:readonly (readonly [number,number,number,number,'run'|'ball'])[]};
export function DrillSetup({spec,title}:{spec:DrillSpec;title:string}){
 const W=200,H=140,X=(x:number)=>10+x/100*(W-20),Y=(y:number)=>10+y/70*(H-20);
 const id=title.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,40);
 return <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}><title>{title}</title>
  <defs><marker id={`ah-${id}`} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={5} markerHeight={5} orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill={PAPER}/></marker></defs>
  <rect x={0} y={0} width={W} height={H} rx={12} fill={GRASS}/>
  {spec.wall==='top'&&<rect x={6} y={4} width={W-12} height={10} rx={3} fill="#c9b48a" stroke={INK} strokeWidth={1.5}/>}
  {spec.wall==='left'&&<rect x={4} y={6} width={10} height={H-12} rx={3} fill="#c9b48a" stroke={INK} strokeWidth={1.5}/>}
  {(spec.goals??[]).map(([x,y],i)=><rect key={`g${i}`} x={X(x)-12} y={Y(y)-4} width={24} height={8} rx={2} fill={PAPER} stroke={INK} strokeWidth={1.5}/>)}
  {(spec.arrows??[]).map(([x1,y1,x2,y2,k],i)=><line key={`a${i}`} x1={X(x1)} y1={Y(y1)} x2={X(x2)} y2={Y(y2)} stroke={PAPER} strokeWidth={2.2} strokeDasharray={k==='run'?'5 4':undefined} markerEnd={`url(#ah-${id})`}/>)}
  {(spec.cones??[]).map(([x,y],i)=><path key={`c${i}`} d={`M${X(x)} ${Y(y)-6}l5 10h-10z`} fill={CONE} stroke={INK} strokeWidth={1}/>)}
  {(spec.players??[]).map(([x,y,l],i)=><g key={`p${i}`}><circle cx={X(x)} cy={Y(y)} r={8} fill={GOLD} stroke={INK} strokeWidth={1.5}/>{l&&<text x={X(x)} y={Y(y)} dy=".35em" textAnchor="middle" fontSize={9} fontWeight={800} fill={INK} fontFamily="system-ui,sans-serif">{l}</text>}</g>)}
  {(spec.balls??[]).map(([x,y],i)=><Ball key={`b${i}`} cx={X(x)} cy={Y(y)} r={5}/>)}
 </svg>;
}
export type DrillCardData={id:string;name:string;meta:readonly string[];setup:DrillSpec;steps:readonly string[];tip?:string;link?:{path:string;name:string}};
export function DrillCards({drills,lang='en'}:{drills:readonly DrillCardData[];lang?:Lang}){
 return <ol className={v.drills}>{drills.map(d=><li key={d.id} id={d.id} className={v.drill}>
  <DrillSetup spec={d.setup} title={`${lang==='es'?'Montaje':'Set-up'}: ${d.name}`}/>
  <div className={site.section}>
   <h3 className={site.h3}>{d.name}</h3>
   <ul className={v.meta} aria-label={lang==='es'?'Datos del ejercicio':'Drill facts'}>{d.meta.map(m=><li key={m}>{m}</li>)}</ul>
   <ol>{d.steps.map(s=><li key={s}>{s}</li>)}</ol>
   {d.tip&&<p className={v.tipLine}><b>{lang==='es'?'Consejo: ':'Tip: '}</b>{d.tip}</p>}
   {d.link&&<p className={v.tipLine}>{lang==='es'?'Más: ':'More: '}<a href={d.link.path}>{d.link.name}</a></p>}
  </div>
 </li>)}</ol>;
}

/* ---------- steps, callouts, Try it ---------- */
export type IconStep={icon:FactIconKind;t:string;d:string};
export const IconSteps=({items}:{items:readonly IconStep[]})=><ol className={v.steps}>{items.map(s=><li key={s.t} className={v.step}>
 <span className={v.stepIcon}><FactIcon kind={s.icon}/></span><div><b>{s.t}</b><p>{s.d}</p></div></li>)}</ol>;
/** "Common mistakes" (tone well) or a coach's tip (gold): a heading with an icon and a short list or line. */
export function Callout({id,title,items,text,tone='mistakes'}:{id:string;title:string;items?:readonly string[];text?:string;tone?:'mistakes'|'tip'}){
 return <section className={tone==='tip'?`${v.callout} ${v.tip}`:v.callout} aria-labelledby={id} data-callout={tone}>
  <h2 className={`${v.calloutHead} ${rt.target}`} id={id}><FactIcon kind={tone==='tip'?'whistle':'flag'} size={26}/><span>{title}</span></h2>
  {text&&<p>{text}</p>}{items&&<ul>{items.map(t=><li key={t}>{t}</li>)}</ul>}
 </section>;
}
export type TryLink={href:string;name:string;line:string};
/** "Try it in the game": the island lesson, an arcade game or a tool that practises this page. /play? and /arcade? deep links
 *  carry rel="nofollow" (lib/site/playLinks.ts deepLinkRel, the index fixes of Nov 25 2026). */
export function TryIt({links,lang='en',id='try-it'}:{links:readonly TryLink[];lang?:Lang;id?:string}){
 return <VSection id={id} title={lang==='es'?'Pruébalo en el juego':'Try it in the game'}>
  <ul className={v.try} data-try-it="">{links.map(l=><li key={l.href}><a className={v.tryLink} href={l.href} rel={deepLinkRel(l.href)}><b>{l.name}</b><span>{l.line}</span></a></li>)}</ul>
 </VSection>;
}
export type TopicGroup={icon:FactIconKind;title:string;links:readonly {path:string;name:string}[]};
export const TopicGrid=({groups}:{groups:readonly TopicGroup[]})=><div className={v.topics} data-visual="topics">{groups.map(g=><div key={g.title} className={v.topic}>
 <h3 className={site.h3}><FactIcon kind={g.icon}/><span>{g.title}</span></h3>
 <ul>{g.links.map(l=><li key={l.path}><a href={l.path}>{l.name}</a></li>)}</ul></div>)}</div>;

/* ---------- drills by age: each pick as a card with its own set-up drawing ---------- */
export type PickCard={path:string;name:string;line:string;meta:readonly string[];art:React.ReactNode};
/** The age guides' drill picks (Nov 26 2026): the set-up drawing (the drill's own GridDiagram, small), the name as the link,
 *  why it suits this age, and time / players. Same links as the old list, in the same order. */
export const PickCards=({items}:{items:readonly PickCard[]})=><ol className={v.drills} data-visual="drill-picks">{items.map(p=><li key={p.path} className={v.drill}>
 {p.art}<div className={site.section}><h3 className={site.h3}><a href={p.path}>{p.name}</a></h3><ul className={v.meta}>{p.meta.map(m=><li key={m}>{m}</li>)}</ul><p className={v.tipLine}>{p.line}</p></div></li>)}</ol>;
