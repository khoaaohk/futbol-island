import RailNav from '@/components/site/shell/RailNav';
import tgt from '@/components/site/railTarget.module.css';
import {exhibitAnchor,exhibitsHubRail} from '@/lib/site/railNavCollections';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {exhibitPath,GALLERIES,SITE_EXHIBITS} from '@/lib/site/exhibits';
import {abs,breadcrumbLd,pageMeta,SITE_NAME} from '@/lib/site/seo';
import styles from '../site.module.css';
import {libraryCrumbs} from '@/lib/site/libraryPath';

/** The History Museum's cases as reading pages. /museum stays the game's walk-in hall. */
export const dynamic='force-static';
const DESC=`The Futbol Island History Museum: ${SITE_EXHIBITS.length} exhibits on the Laws of the Game, World Cup history, balls and kits, legends, football’s firsts, tactics and the science of the game.`;
// the search-result description is kept under 155 characters; the page lead stays the full sentence
const META=`The Futbol Island History Museum: ${SITE_EXHIBITS.length} exhibits on the Laws, World Cup history, balls, kits, legends, tactics and science.`;
/* Nov 20 2026 (SEO phase 2): was "History Museum exhibits" / h1 "History Museum", which did not name the sport */
export const metadata=pageMeta('Football History for Kids: Museum Exhibits',META,'/exhibits');
const CRUMBS=libraryCrumbs({name:'Museum',path:'/exhibits'});/* Nov 20 2026: through the Library */

export default function ExhibitsIndex(){
 return <>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'ItemList',name:`${SITE_NAME} History Museum`,numberOfItems:SITE_EXHIBITS.length,
   itemListElement:SITE_EXHIBITS.map((e,i)=>({'@type':'ListItem',position:i+1,name:`${e.title} (${e.year})`,url:abs(exhibitPath(e.id))}))}}/>
  {/* layout batch 3 (Nov 20 2026; owner: "it should list what's on that page to smooth scroll down"): Back, Overview and this page's sections */}
  <RailNav rail={exhibitsHubRail()} current="#top"/>
  <header className={styles.intro} id="top">
   <Breadcrumbs crumbs={CRUMBS}/>
   <h1 className={styles.title}>Football history museum for kids</h1>
   <p className={styles.lead}>{DESC}</p>
   <a className={styles.cta} href="/museum">Walk into the museum on the island</a>
  </header>
  {GALLERIES.map(g=>{const list=SITE_EXHIBITS.filter(e=>e.gallery===g.id);if(!list.length)return null;return <section key={g.id} className={styles.section} aria-labelledby={`g-${g.id}`}>
   <h2 className={`${styles.h2} ${tgt.target}`} id={`g-${g.id}`}>{g.title}</h2>
   <p className={styles.caption}>{g.blurb}</p>
   <ul className={styles.list}>{list.map(e=><li key={e.id} id={exhibitAnchor(e.id)} className={tgt.target}><a href={exhibitPath(e.id)}><span className={styles.itemTitle}>{e.h1}</span><span className={styles.itemMeta}>{e.year}</span></a></li>)}</ul>
  </section>;})}
 </>;
}
