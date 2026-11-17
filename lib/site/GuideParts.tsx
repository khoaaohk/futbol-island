import PitchDiagram from './PitchDiagram';
import {arrows,describe,place,type GuideFormat,type Line,type Mode} from './pitch';
import {lessonPath,type SiteLesson} from './lessons';
import {sceneDesc,type Scene} from './scenes';
import {sceneMotion} from './sceneMotion';
import MotionToggle from '@/components/site/MotionToggle';
import {GUIDE_FOOT,GUIDE_NAMES} from './guides';
import {PLAY_PATH,type Crumb} from './seo';
import {FACTS_PATH,longDate} from './checked';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import PlayBar from '@/components/site/PlayBar';
import {playLessonHref} from './playLinks';
import {FactIcon,type FactIconKind} from '@/components/site/FactIcons';
import OnThisPage from '@/components/site/OnThisPage';
import styles from '@/app/(site)/site.module.css';
/**
 * The shared sections of the guide pages (formations, positions and later clusters; lib/site/guides.ts): intro, diagram with
 * its text alternative, bullet lists, lesson and link lists, and the one gold Play button. Server-rendered, classes from
 * app/(site)/site.module.css only (docs/seo/DESIGN.md): index pages put the button in the intro, detail pages at the end.
 */
/** `toc` (batch 3, Nov 17 2026): a detail page (no `cta`) also gets the desktop "On this page" column (components/site/OnThisPage.tsx);
 *  its presence switches .main to the two-column guide layout (site.module.css). Index pages keep one wide column. */
export function GuideIntro({crumbs,h1,lead,more,cta,facts,toc=!cta}:{crumbs:readonly Crumb[];h1:string;lead:string;more?:string;cta?:boolean;facts?:readonly Fact[];toc?:boolean}){
 return <><header className={styles.intro}>
  <Breadcrumbs crumbs={crumbs}/>
  <h1 className={styles.title}>{h1}</h1>
  <QuickAnswer lead={lead} facts={facts}/>
  {more&&<p>{more}</p>}
  <p className={styles.caption}>{GUIDE_NAMES}</p>
  {cta&&<a className={styles.cta} href={PLAY_PATH}>Play it on the island</a>}
 </header>{toc&&<OnThisPage/>}</>;
}
/** One key fact under the answer (visual pass, Nov 17 2026): an energy-bar style icon, a short label and the value, taken from
 *  data the page already shows. `href` makes the value a jump link (to the quiz, the deck, a related page). */
export type Fact={icon:FactIconKind;label:string;value:React.ReactNode;href?:string};
export function KeyFacts({facts}:{facts:readonly Fact[]}){
 return <dl className={styles.facts} data-key-facts="">{facts.map(f=><div key={f.label} className={styles.fact}>
  <dt><FactIcon kind={f.icon}/><span>{f.label}</span></dt><dd>{f.href?<a href={f.href}>{f.value}</a>:f.value}</dd></div>)}</dl>;
}
/** The quick answer: the page's answer sentence (data-answer, unchanged: tests/seo-content.cjs wants it as the first paragraph
 *  after the h1) in its own gold-tinted card, with the key facts under it. Without facts it is the plain lead, as before. */
export function QuickAnswer({lead,facts,answer=true}:{lead:string;facts?:readonly Fact[];answer?:boolean}){
 const p=<p className={styles.lead} data-answer={answer?'':undefined}>{lead}</p>;
 if(!facts||facts.length===0)return p;
 return <div className={styles.quick} data-quick-answer="">{p}<KeyFacts facts={facts}/></div>;
}
/** A pitch diagram with its caption (the text alternative) and, on the main one, a link to the same picture as an image. */
export function Diagram({id,format,lines,what,mode='base',mark,markName,small,image}:{id:string;format:GuideFormat;lines:readonly Line[];what:string;mode?:Mode;mark?:string;markName?:string;small?:boolean;image?:string}){
 const desc=describe({format,what,lines,mode,highlight:markName});
 return <figure className={styles.figure}>
  <div className={styles.art}><PitchDiagram id={id} format={format} spots={place(lines,mode)} arrows={arrows(lines,mode)} title={what[0].toUpperCase()+what.slice(1)} desc={desc} mark={mark} small={small}/></div>
  {!small&&<figcaption className={styles.caption}>{desc}{image&&<> <a href={image}>Open this diagram as a picture</a>.</>}</figcaption>}
 </figure>;
}
/** A rule or glossary scene (lib/site/scenes.ts): the same pitch, with two teams, a ball, a line or a shaded zone. */
/** `animate` (Nov 15 2026, lib/site/sceneMotion.ts): the dots and the ball move along the scene's own arrows in a CSS loop, with a
 *  Pause button; reduced motion, print and no-CSS readers get the still picture, which is the same drawing. */
export function SceneDiagram({id,scene,small,image,animate}:{id:string;scene:Scene;small?:boolean;image?:string;animate?:string}){
 const desc=sceneDesc(scene),root=`${id}-anim`,motion=animate?sceneMotion(scene,root):null;
 const art=<PitchDiagram id={id} format={scene.format} spots={scene.spots} arrows={scene.runs} title={scene.title} desc={desc} small={small} scene={{ball:scene.ball,lineY:scene.lineY,lineWord:scene.lineWord,zone:scene.zone,passes:scene.passes}}/>;
 return <figure className={styles.figure}>
  {motion
   ?<div className={`${styles.art} ${styles.anim}`} id={root} data-anim=""><style>{motion.css}</style>{art}<MotionToggle name={animate!}/></div>
   :<div className={styles.art}>{art}</div>}
  <figcaption className={styles.caption}>{scene.caption}{image&&<> <a href={image}>Open this diagram as a picture</a>.</>}</figcaption>
 </figure>;
}
/** A data table with real header cells (size charts, rule pages): the first column is the row header. */
/** Phones (under 560 px, visual pass Nov 17 2026): `data-stack` turns each row into a card, the row header as its title and each
 *  cell under its column name (data-label), instead of a table cut off at the screen edge. Wider screens and print keep the table. */
export function DataTable({head,rows,label}:{head:readonly string[];rows:readonly (readonly React.ReactNode[])[];label:string}){
 return <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={label} data-stack=""><table className={styles.table}>{/* named once, by the region (QA Nov 14 2026: the same label on both was read twice) */}
  <thead><tr>{head.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead>
  <tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=>j===0?<th key={j} scope="row">{c}</th>:<td key={j} data-label={head[j]}>{c}</td>)}</tr>)}</tbody>
 </table></div>;
}
/** `fold` (visual pass, Nov 17 2026): a "more detail" section on a long page. The heading stays a real h2 inside the <summary>,
 *  the body is closed until tapped; all of it is in the HTML (search, find-in-page and no-JS readers get it). */
export function Section({id,title,children,panel,fold}:{id:string;title:string;children:React.ReactNode;panel?:boolean;fold?:boolean}){
 if(fold)return <section className={`${styles.section} ${styles.fold}`} aria-labelledby={id} data-fold=""><details className={styles.foldBox}>
  <summary className={styles.foldSum}><h2 className={styles.h2} id={id}>{title}</h2><span className={styles.plus} aria-hidden="true"/></summary>
  <div className={styles.foldBody}>{children}</div></details></section>;
 return <section className={panel?`${styles.section} ${styles.panel}`:styles.section} aria-labelledby={id}><h2 className={styles.h2} id={id}>{title}</h2>{children}</section>;
}
export const Bullets=({items}:{items:readonly string[]})=><ul>{items.map(t=><li key={t}>{t}</li>)}</ul>;
export function LessonList({lessons}:{lessons:readonly SiteLesson[]}){
 return <ul className={styles.list}>{lessons.map(l=><li key={l.id}><a href={lessonPath(l.id)}><span className={styles.itemTitle}>{l.title} ({l.formatLabel} lesson)</span><span className={styles.itemMeta}>{l.concept}</span></a></li>)}</ul>;
}
export function LinkList({links}:{links:readonly {path:string;name:string;line?:string}[]}){
 return <ul className={styles.list}>{links.map(l=><li key={l.path}><a href={l.path}><span className={styles.itemTitle}>{l.name}</span>{l.line&&<span className={styles.itemMeta}>{l.line}</span>}</a></li>)}</ul>;
}
/** "Last checked" (lib/site/checked.ts): the content's real check date, and the trust page. */
export function CheckedLine({date}:{date:string}){
 return <p className={styles.caption} data-checked={date}>Last checked: <time dateTime={date}>{longDate(date)}</time>. <a href={FACTS_PATH}>How we check facts</a>.</p>;
}
/** The end of a guide (one style everywhere): the "about this guide" line and "Last checked" as one quiet block, then the gold
 *  button. `lesson` (Nov 15 2026) makes the button open that lesson in the game (lib/site/playLinks.ts). */
export function GuideEnd({cta=true,checked,lesson,sticky=true}:{cta?:boolean;checked?:string;lesson?:{id:string;title:string};sticky?:boolean}){
 return <><div className={styles.endNote}><p className={styles.caption}>{GUIDE_FOOT}</p>{checked&&<CheckedLine date={checked}/>}</div>
  {cta&&(lesson?<PlayEnd href={playLessonHref(lesson.id)} label={`Play the lesson: ${lesson.title}`} bar={`Play “${lesson.title}”`} sticky={sticky}/>:<PlayEnd sticky={sticky}/>)}</>;
}
/** The one gold Play button at the end of a detail page (`data-play-cta`), plus the phones' sticky "Play free" bar
 *  (components/site/PlayBar.tsx), which hides itself while this button is on screen. */
export function PlayEnd({href=PLAY_PATH,label='Play it on the island',bar='Learn it on the island',sticky=true}:{href?:string;label?:string;bar?:string;sticky?:boolean}){
 return <><p className={styles.end}><a className={styles.cta} href={href} data-play-cta="">{label}</a></p>{sticky&&<PlayBar href={href} text={bar}/>}</>;
}
/** "Coach's notes" (lib/site/coachNotes.ts): the item's own coaching point, how it shows up in a match, age-group notes and,
 *  where the page had none, common mistakes. `ages` alone is used on drill pages (they already have points and a game line). */
export function CoachNotesSection({name,notes}:{name:string;notes:{coach?:string;match?:string;ages:readonly (readonly [string,string])[];mistakes?:readonly string[]}}){
 return <section className={`${styles.section} ${styles.panel}`} aria-labelledby="coach-notes"><h2 className={`${styles.h2} ${styles.notesH}`} id="coach-notes"><FactIcon kind="whistle" size={28}/><span>{`Coach’s notes: ${name}`}</span></h2>
  {notes.coach&&<p><b>Coaching point:</b> {notes.coach}</p>}
  {notes.match&&<p><b>In a match:</b> {notes.match}</p>}
  {notes.mistakes&&notes.mistakes.length>0&&<><h3 className={styles.h3}>Common mistakes</h3><Bullets items={notes.mistakes}/></>}
  <h3 className={styles.h3}>By age group</h3>
  <ul>{notes.ages.map(([l,t])=><li key={l}><b>{l}:</b> {t}</li>)}</ul>
 </section>;
}
