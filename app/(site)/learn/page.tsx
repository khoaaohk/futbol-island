import type {Metadata} from 'next';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import LearnSearch from '@/components/site/LearnSearch';
import {HUBS} from '@/lib/site/hubs';
import {GUIDE_HUBS} from '@/lib/site/guides';
import styles from '../site.module.css';
/**
 * /learn?q=… (seo-extras, Nov 15 2026): the guide search (components/site/LearnSearch.tsx), the target of the home page's WebSite
 * SearchAction. Plain /learn (no q) still 308-redirects to `/` (next.config.mjs, `missing` q), so only searches land here.
 * A search page is not a search result of its own: noindex, follow. The hubs are listed for readers without JavaScript.
 */
export const dynamic='force-static';
export const metadata:Metadata={title:'Search the football guides | Futbol Island',description:'Search Futbol Island’s free football guides for kids and coaches: rules, terms, positions, formations, drills, practice plans and lessons.',
 robots:{index:false,follow:true}};
const CRUMBS=[{name:'Home',path:'/'},{name:'Search',path:'/learn?q='}];
export default function SearchPage(){
 const hubs=[...HUBS.map(h=>({path:h.path,name:h.h1})),...GUIDE_HUBS.map(g=>({path:g.path,name:g.name[0].toUpperCase()+g.name.slice(1)}))];
 return <>
  <header className={styles.intro}>
   <Breadcrumbs crumbs={CRUMBS}/>
   <h1 className={styles.title}>Search the football guides</h1>
   <p className={styles.lead}>Find a rule, a soccer word, a position, a formation, a drill, a practice plan or a lesson, with the short answer.</p>
  </header>
  <LearnSearch/>
  <section className={styles.section} aria-labelledby="browse"><h2 className={styles.h2} id="browse">Browse the guides</h2>
   <ul className={styles.list}>{hubs.map(h=><li key={h.path}><a href={h.path}><span className={styles.itemTitle}>{h.name}</span></a></li>)}</ul>
  </section>
 </>;
}
