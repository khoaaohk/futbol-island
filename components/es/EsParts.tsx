import PitchDiagram from '@/lib/site/PitchDiagram';
import {OnwardRow,type Onward} from '@/lib/site/GuideParts';
import {sceneMotion} from '@/lib/site/sceneMotion';
import type {Scene} from '@/lib/site/scenes';
import MotionToggle from '@/components/site/MotionToggle';
import PlayBar from '@/components/site/PlayBar';
import PrintButton from '@/components/site/PrintButton';
import {abs,PLAY_PATH,type Crumb} from '@/lib/site/seo';
import {playLessonHref} from '@/lib/site/playLinks';
import {ES_UI,longDateEs} from '@/lib/i18n/es/ui';
import {toEs} from '@/lib/i18n/esPaths';
import {navSection} from '@/lib/site/navSection';
import type {CoachNotesEs} from '@/lib/i18n/es/types';
import {esLesson} from '@/lib/i18n/es/lessons';
import p from '@/components/site/printSheet.module.css';
import styles from '@/app/(site)/site.module.css';
import {QuickAnswer,type Fact} from '@/lib/site/GuideParts';
import {FactIcon} from '@/components/site/FactIcons';
import OnThisPage from '@/components/site/OnThisPage';
export {Bullets,DataTable,LinkList,QuickAnswer,Section,type Fact} from '@/lib/site/GuideParts';
export {QA} from '@/components/site/LessonHub';
/**
 * The Spanish versions of the guide pages' shared parts (lib/site/GuideParts.tsx and components/site/*), same markup and classes,
 * Spanish words (lib/i18n/es/ui.ts). Kept apart so the English pages' output never changes. Language-free parts (Section,
 * Bullets, DataTable, LinkList, QA) are re-exported as they are.
 */
export function EsBreadcrumbs({crumbs}:{crumbs:readonly Crumb[]}){
 return <nav aria-label={ES_UI.crumbNav} className={styles.crumbs} data-nav-section={navSection(crumbs.map(c=>c.path))}><ol>{crumbs.map((c,i)=><li key={c.path}>{i<crumbs.length-1?<a href={c.path}>{c.name}</a>:<span aria-current="page">{c.name}</span>}</li>)}</ol></nav>;
}
/** Spanish breadcrumbs start at Inicio (/es); `tail` crumbs are Spanish names with /es paths. */
export const esCrumbs=(...tail:Crumb[]):Crumb[]=>[{name:ES_UI.home,path:toEs('/')},...tail];
/** Keep a formation shape such as 4-3-3 on one line (a phone otherwise breaks the h1 after a hyphen: “4-3-” / “3”). */
const noBreak=(s:string)=>s.split(/(\d+(?:-\d+)+)/).map((x,i)=>i%2?<span key={i} style={{whiteSpace:'nowrap'}}>{x}</span>:x);
export function EsIntro({crumbs,h1,lead,more,cta,facts,toc=!cta,rail,onward}:{crumbs:readonly Crumb[];h1:string;lead:string;more?:React.ReactNode;cta?:boolean;facts?:readonly Fact[];toc?:boolean;rail?:React.ReactNode;onward?:Onward}){
 return <>{rail}<header className={styles.intro}>
  <EsBreadcrumbs crumbs={crumbs}/>
  <h1 className={styles.title}>{noBreak(h1)}</h1>
  {onward&&<OnwardRow o={onward}/>}
  <QuickAnswer lead={lead} facts={facts}/>
  {more&&<p>{more}</p>}
  <p className={styles.caption}>{ES_UI.guideNames}</p>
  {cta&&<a className={styles.cta} href={PLAY_PATH}>{ES_UI.playIsland}</a>}
 </header>{toc&&<OnThisPage lang="es"/>}</>;
}
export const sceneDescEs=(s:Scene)=>ES_UI.sceneDesc(s.format,s.caption);
/** A rule or term scene with Spanish words already merged in (lib/i18n/es/merge.ts). */
export function EsSceneDiagram({id,scene,small,image,animate}:{id:string;scene:Scene;small?:boolean;image?:string;animate?:string}){
 const desc=sceneDescEs(scene),root=`${id}-anim`,motion=animate?sceneMotion(scene,root):null;
 const art=<PitchDiagram id={id} format={scene.format} spots={scene.spots} arrows={scene.runs} title={scene.title} desc={desc} small={small} scene={{ball:scene.ball,lineY:scene.lineY,lineWord:scene.lineWord,zone:scene.zone,passes:scene.passes}}/>;
 return <figure className={styles.figure}>
  {motion
   ?<div className={`${styles.art} ${styles.anim}`} id={root} data-anim=""><style>{motion.css}</style>{art}<MotionToggle name={animate!} lang="es"/></div>
   :<div className={styles.art}>{art}</div>}
  <figcaption className={styles.caption}>{scene.caption}{image&&<> <a href={image}>{ES_UI.openPicture}</a>.</>}</figcaption>
 </figure>;
}
export function EsCheckedLine({date}:{date:string}){
 return <p className={styles.caption} data-checked={date}>{ES_UI.lastChecked}: <time dateTime={date}>{longDateEs(date)}</time>. <a href={toEs('/about/how-we-check-facts')}>{ES_UI.howWeCheck}</a>.</p>;
}
export function EsPlayEnd({href=PLAY_PATH,label=ES_UI.playIsland,bar=ES_UI.learnIsland,sticky=true}:{href?:string;label?:string;bar?:string;sticky?:boolean}){
 return <><p className={styles.end}><a className={styles.cta} href={href} data-play-cta="">{label}</a></p>{sticky&&<PlayBar href={href} text={bar} lang="es"/>}</>;
}
/** The end of a Spanish guide: the about line, "Última revisión", then the gold button (to the page's lesson when it has one). */
export function EsGuideEnd({cta=true,checked,lessonId}:{cta?:boolean;checked?:string;lessonId?:string}){
 return <><div className={styles.endNote}><p className={styles.caption}>{ES_UI.guideFoot}</p>{checked&&<EsCheckedLine date={checked}/>}</div>
  {cta&&(lessonId?<EsPlayEnd href={playLessonHref(lessonId)} label={ES_UI.playLesson}/>:<EsPlayEnd/>)}</>;
}
export function EsCoachNotes({name,notes}:{name:string;notes:CoachNotesEs}){
 return <section className={`${styles.section} ${styles.panel}`} aria-labelledby="coach-notes"><h2 className={`${styles.h2} ${styles.notesH}`} id="coach-notes"><FactIcon kind="whistle" size={28}/><span>{ES_UI.coachNotes}: {name}</span></h2>
  {notes.coach&&<p><b>{ES_UI.coachPoint}:</b> {notes.coach}</p>}
  {notes.match&&<p><b>{ES_UI.inMatch}:</b> {notes.match}</p>}
  {notes.mistakes&&notes.mistakes.length>0&&<><h3 className={styles.h3}>{ES_UI.mistakes}</h3><ul>{notes.mistakes.map(t=><li key={t}>{t}</li>)}</ul></>}
  <h3 className={styles.h3}>{ES_UI.byAge}</h3>
  <ul>{notes.ages.map(([l,t])=><li key={l}><b>{l==='U13 and up'?'U13 y mayores':l}:</b> {t}</li>)}</ul>
 </section>;
}
/** `has`: what the printed sheet holds (lesson sheets have no diagram: "pasos y preguntas"). */
export function EsPrintSheet({path,what='hoja',has}:{path:string;what?:string;has?:string}){
 const url=abs(path);
 return <div className={p.sheet} data-print-sheet="">
  <div className={p.screen}><PrintButton label={ES_UI.print}/> <span className={p.hint}>{ES_UI.printHint(what,has)}</span></div>
  <p className={p.url}>{ES_UI.printUrl} · {url.replace(/^https:\/\//,'')}</p>
 </div>;
}
/** "Lee después": the next and previous Spanish page in a family's order (hub first, then the pages, round). */
export function EsReadNext({order,path}:{order:readonly {path:string;name:string}[];path:string}){
 const i=order.findIndex(x=>x.path===path);if(i<0||order.length<2)return null;
 const prev=order[(i-1+order.length)%order.length],next=order[(i+1)%order.length];
 return <nav className={styles.pager} aria-label={ES_UI.readNext} data-read-next="">
  <a rel="prev" href={prev.path}><span className={styles.pagerWord}>{prev===order[0]?ES_UI.backTo:ES_UI.previous}</span><span className={styles.pagerName}>{prev.name}</span></a>
  <a rel="next" href={next.path}><span className={styles.pagerWord}>{next===order[0]?ES_UI.backTo:ES_UI.readNext}</span><span className={styles.pagerName}>{next.name}</span></a>
 </nav>;
}
/** Spanish lib/site/GuideParts.tsx LessonList (round D): the Spanish lesson pages, title + concept. */
export function EsLessonList({lessons}:{lessons:readonly {id:string}[]}){
 return <ul className={styles.list}>{lessons.map(x=>esLesson(x.id)!).map(l=><li key={l.id}><a href={l.esPath}><span className={styles.itemTitle}>{l.title} (lección de {l.formatLabel==='Futsal'?'futsal':l.formatLabel})</span><span className={styles.itemMeta}>{l.concept}</span></a></li>)}</ul>;
}
/** Spanish lessonLinks (components/site/KeepReading.tsx) for the "Sigue leyendo" grid: title, concept, "lección de 7v7". */
export const esLessonLinks=(lessons:readonly {id:string}[])=>lessons.map(x=>esLesson(x.id)!).map(l=>({path:l.esPath,name:l.title,line:l.concept,tag:`Lección de ${l.formatLabel==='Futsal'?'futsal':l.formatLabel}`}));
