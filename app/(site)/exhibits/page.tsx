import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {exhibitPath,GALLERIES,SITE_EXHIBITS} from '@/lib/site/exhibits';
import {abs,breadcrumbLd,pageMeta,SITE_NAME} from '@/lib/site/seo';
import styles from '../site.module.css';

/** The History Museum's cases as reading pages. /museum stays the game's walk-in hall. */
export const dynamic='force-static';
const DESC=`The Futbol Island History Museum: ${SITE_EXHIBITS.length} exhibits on the Laws of the Game, World Cup history, balls and kits, legends, football’s firsts, tactics and the science of the game.`;
export const metadata=pageMeta('History Museum exhibits',DESC,'/exhibits');
const CRUMBS=[{name:'Home',path:'/'},{name:'Museum',path:'/exhibits'}];

export default function ExhibitsIndex(){
 return <>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'ItemList',name:`${SITE_NAME} History Museum`,numberOfItems:SITE_EXHIBITS.length,
   itemListElement:SITE_EXHIBITS.map((e,i)=>({'@type':'ListItem',position:i+1,name:`${e.title} (${e.year})`,url:abs(exhibitPath(e.id))}))}}/>
  <Breadcrumbs crumbs={CRUMBS}/>
  <h1>History Museum</h1>
  <p className={styles.lead}>{DESC}</p>
  <p><a className={styles.play} href="/museum">Walk into the museum on the island</a></p>
  {GALLERIES.map(g=>{const list=SITE_EXHIBITS.filter(e=>e.gallery===g.id);if(!list.length)return null;return <section key={g.id} aria-labelledby={`g-${g.id}`}>
   <h2 id={`g-${g.id}`}>{g.title}</h2>
   <p className={styles.muted}>{g.blurb}</p>
   <ul className={styles.list}>{list.map(e=><li key={e.id}><a href={exhibitPath(e.id)}><b>{e.title}</b><span>{e.year}</span></a></li>)}</ul>
  </section>;})}
 </>;
}
