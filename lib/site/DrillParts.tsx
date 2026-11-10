import GridDiagram from './GridDiagram';
import {gridKey,type GridScene} from './grid';
import type {Drill} from './drills';
import styles from '@/app/(site)/site.module.css';
/**
 * Shared parts of the drill and practice-plan pages (SEO cluster 3, Nov 10 2026), next to lib/site/GuideParts.tsx: the setup
 * diagram with its caption and key, a numbered list, and a drill list. Server-rendered; classes from
 * app/(site)/site.module.css only (docs/seo/DESIGN.md), no client code and no animation.
 */
export function GridFigure({id,scene,small,image}:{id:string;scene:GridScene;small?:boolean;image?:string}){
 return <figure className={styles.figure}>
  <div className={styles.art}><GridDiagram id={id} scene={scene} small={small}/></div>
  <figcaption className={styles.caption}>{scene.caption} {gridKey(scene)}{image&&<> <a href={image}>Open this diagram as a picture</a>.</>}</figcaption>
 </figure>;
}
export const Steps=({items}:{items:readonly string[]})=><ol>{items.map(t=><li key={t}>{t}</li>)}</ol>;
export function DrillList({items}:{items:readonly {drill:Drill;line:string}[]}){
 return <ul className={styles.list}>{items.map(({drill:d,line})=><li key={d.slug}><a href={d.path}><span className={styles.itemTitle}>{d.name}</span><span className={styles.itemMeta}>{line} {d.agesText.replace(/ \(.*$/,'')}.</span></a></li>)}</ul>;
}
