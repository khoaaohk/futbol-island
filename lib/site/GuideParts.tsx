import PitchDiagram from './PitchDiagram';
import {arrows,describe,place,type GuideFormat,type Line,type Mode} from './pitch';
import {lessonPath,type SiteLesson} from './lessons';
import {sceneDesc,type Scene} from './scenes';
import {GUIDE_FOOT,GUIDE_NAMES} from './guides';
import {PLAY_PATH,type Crumb} from './seo';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import styles from '@/app/(site)/site.module.css';
/**
 * The shared sections of the guide pages (formations, positions and later clusters; lib/site/guides.ts): intro, diagram with
 * its text alternative, bullet lists, lesson and link lists, and the one gold Play button. Server-rendered, classes from
 * app/(site)/site.module.css only (docs/seo/DESIGN.md): index pages put the button in the intro, detail pages at the end.
 */
export function GuideIntro({crumbs,h1,lead,more,cta}:{crumbs:readonly Crumb[];h1:string;lead:string;more?:string;cta?:boolean}){
 return <header className={styles.intro}>
  <Breadcrumbs crumbs={crumbs}/>
  <h1 className={styles.title}>{h1}</h1>
  <p className={styles.lead}>{lead}</p>
  {more&&<p>{more}</p>}
  <p className={styles.caption}>{GUIDE_NAMES}</p>
  {cta&&<a className={styles.cta} href={PLAY_PATH}>Play it on the island</a>}
 </header>;
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
export function SceneDiagram({id,scene,small,image}:{id:string;scene:Scene;small?:boolean;image?:string}){
 const desc=sceneDesc(scene);
 return <figure className={styles.figure}>
  <div className={styles.art}><PitchDiagram id={id} format={scene.format} spots={scene.spots} arrows={scene.runs} title={scene.title} desc={desc} small={small} scene={{ball:scene.ball,lineY:scene.lineY,lineWord:scene.lineWord,zone:scene.zone,passes:scene.passes}}/></div>
  <figcaption className={styles.caption}>{scene.caption}{image&&<> <a href={image}>Open this diagram as a picture</a>.</>}</figcaption>
 </figure>;
}
/** A data table with real header cells (size charts, rule pages): the first column is the row header. */
export function DataTable({head,rows,label}:{head:readonly string[];rows:readonly (readonly React.ReactNode[])[];label:string}){
 return <div className={styles.tableWrap}><table className={styles.table} aria-label={label}>
  <thead><tr>{head.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead>
  <tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=>j===0?<th key={j} scope="row">{c}</th>:<td key={j}>{c}</td>)}</tr>)}</tbody>
 </table></div>;
}
export function Section({id,title,children}:{id:string;title:string;children:React.ReactNode}){
 return <section className={styles.section} aria-labelledby={id}><h2 className={styles.h2} id={id}>{title}</h2>{children}</section>;
}
export const Bullets=({items}:{items:readonly string[]})=><ul>{items.map(t=><li key={t}>{t}</li>)}</ul>;
export function LessonList({lessons}:{lessons:readonly SiteLesson[]}){
 return <ul className={styles.list}>{lessons.map(l=><li key={l.id}><a href={lessonPath(l.id)}><span className={styles.itemTitle}>{l.title} ({l.formatLabel} lesson)</span><span className={styles.itemMeta}>{l.concept}</span></a></li>)}</ul>;
}
export function LinkList({links}:{links:readonly {path:string;name:string;line?:string}[]}){
 return <ul className={styles.list}>{links.map(l=><li key={l.path}><a href={l.path}><span className={styles.itemTitle}>{l.name}</span>{l.line&&<span className={styles.itemMeta}>{l.line}</span>}</a></li>)}</ul>;
}
export function GuideEnd({cta=true}:{cta?:boolean}){
 return <><p className={styles.caption}>{GUIDE_FOOT}</p>{cta&&<p className={styles.end}><a className={styles.cta} href={PLAY_PATH}>Play it on the island</a></p>}</>;
}
